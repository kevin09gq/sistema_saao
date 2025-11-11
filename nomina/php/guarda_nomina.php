<?php
include("../../conexion/conexion.php");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['accion']) && $_POST['accion'] === 'guardar_nomina') {

        if (!isset($_POST['jsonData']) || empty($_POST['jsonData'])) {
            echo json_encode(['success' => false, 'message' => 'No se recibieron datos de nómina']);
            exit;
        }

        $jsonData = $_POST['jsonData'];
        $decodedJson = json_decode($jsonData, true);

        // Obtener datos de horarios si existen
        $horariosData = $_POST['horariosData'] ?? null;
        $decodedHorarios = null;

        if (!empty($horariosData)) {
            $decodedHorarios = json_decode($horariosData, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                echo json_encode([
                    'success' => false,
                    'message' => 'El formato JSON de horarios no es válido: ' . json_last_error_msg()
                ]);
                exit;
            }
        }

        if (json_last_error() !== JSON_ERROR_NONE) {
            echo json_encode([
                'success' => false,
                'message' => 'El formato JSON no es válido: ' . json_last_error_msg()
            ]);
            exit;
        }

        // Verificar que el JSON tenga el campo numero_semana
        if (!isset($decodedJson['numero_semana'])) {
            echo json_encode([
                'success' => false,
                'message' => 'El JSON no contiene el número de semana. Campos disponibles: ' . implode(', ', array_keys($decodedJson))
            ]);
            exit;
        }

        $numeroSemana = $decodedJson['numero_semana'];


        try {
            // Verificar el número de registros antes de proceder
            $totalRegistros = contarRegistros();
            $nominaEliminada = false;
            $numeroSemanaEliminada = null;

            // Verificar si ya existe una nómina con ese número de semana
            $registroExistente = verificarNominaExistente($numeroSemana);

            $idHorario = null;
            $horariosGuardados = false;

            if ($registroExistente) {
                // ACTUALIZAR el registro existente
                // Primero guardar/actualizar horarios
                if ($decodedHorarios) {
                    $idHorario = actualizarHorarios($numeroSemana, $horariosData);
                    $horariosGuardados = ($idHorario !== false);
                }

                // Actualizar la nómina con el id_horario
                $sql = $conexion->prepare("UPDATE nomina SET datos_nomina = ?, id_horario = ? WHERE id_nomina_json = ?");
                $sql->bind_param("sii", $jsonData, $idHorario, $registroExistente['id_nomina_json']);

                if ($sql->execute()) {
                    echo json_encode([
                        'success' => true,
                        'action' => 'updated',
                        'id_nomina' => $registroExistente['id_nomina_json'],
                        'numero_semana' => $numeroSemana,
                        'horarios_guardados' => $horariosGuardados,
                        'id_horario' => $idHorario,
                        'message' => 'Nómina de la semana ' . $numeroSemana . ' actualizada exitosamente'
                    ]);
                } else {
                    throw new Exception('Error al actualizar la nómina existente: ' . $sql->error);
                }
                $sql->close();
            } else {
                // CREAR un nuevo registro
                // Verificar si ya hay 6 nóminas (límite máximo)
                if ($totalRegistros >= 6) {
                    // Eliminar la nómina más antigua
                    $nominaEliminada = eliminarNominaMasAntigua();
                    if ($nominaEliminada) {
                        $numeroSemanaEliminada = $nominaEliminada['numero_semana'];
                    }
                }

                // Guardar horarios primero si existen
                if ($decodedHorarios) {
                    $idHorario = guardarHorarios($horariosData);
                    $horariosGuardados = ($idHorario !== false);
                }

                // Crear el nuevo registro con la relación FK
                $idNomina = generarIdNomina();
                $sql = $conexion->prepare("INSERT INTO nomina (id_nomina_json, id_empresa, datos_nomina, id_horario) VALUES (?, 1, ?, ?)");
                $sql->bind_param("isi", $idNomina, $jsonData, $idHorario);

                if ($sql->execute()) {
                    $mensaje = 'Nueva nómina de la semana ' . $numeroSemana . ' creada exitosamente';
                    if ($nominaEliminada) {
                        $mensaje .= ' (Nómina más antigua de la semana ' . $numeroSemanaEliminada . ' eliminada automáticamente)';
                    }

                    echo json_encode([
                        'success' => true,
                        'action' => 'created',
                        'id_nomina' => $idNomina,
                        'numero_semana' => $numeroSemana,
                        'nomina_eliminada' => $nominaEliminada !== false,
                        'semana_eliminada' => $numeroSemanaEliminada,
                        'total_nominas' => contarRegistros(),
                        'horarios_guardados' => $horariosGuardados,
                        'id_horario' => $idHorario,
                        'message' => $mensaje
                    ]);
                } else {
                    throw new Exception('Error al crear la nueva nómina: ' . $sql->error);
                }
                $sql->close();
            }
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Acción no válida']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
}

// Funciones existentes sin cambios
function contarRegistros()
{
    global $conexion;
    $sql = $conexion->prepare("SELECT COUNT(*) as total FROM nomina");
    $sql->execute();
    $resultado = $sql->get_result();
    $row = $resultado->fetch_assoc();
    $sql->close();
    return (int)$row['total'];
}

function limpiarTabla()
{
    global $conexion;
    $sql = $conexion->prepare("DELETE FROM nomina");
    if (!$sql->execute()) {
        throw new Exception('Error al limpiar la tabla: ' . $sql->error);
    }
    $sql->close();

    $sql = $conexion->prepare("ALTER TABLE nomina AUTO_INCREMENT = 1");
    $sql->execute();
    $sql->close();
}

// Nueva función para eliminar la nómina más antigua
function eliminarNominaMasAntigua()
{
    global $conexion;
    
    try {
        // Obtener la nómina más antigua (menor id_nomina_json)
        $sql = $conexion->prepare("SELECT id_nomina_json, id_horario, datos_nomina FROM nomina ORDER BY id_nomina_json ASC LIMIT 1");
        $sql->execute();
        $resultado = $sql->get_result();
        
        if ($resultado->num_rows > 0) {
            $row = $resultado->fetch_assoc();
            $idNominaEliminar = $row['id_nomina_json'];
            $idHorarioEliminar = $row['id_horario'];
            
            // Extraer numero_semana del JSON
            $datosNomina = json_decode($row['datos_nomina'], true);
            $numeroSemana = $datosNomina['numero_semana'] ?? 'desconocida';
            
            $sql->close();
            
            // Eliminar la nómina
            $sql = $conexion->prepare("DELETE FROM nomina WHERE id_nomina_json = ?");
            $sql->bind_param("i", $idNominaEliminar);
            
            if ($sql->execute()) {
                $sql->close();
                
                // Eliminar el horario asociado si existe
                if ($idHorarioEliminar) {
                    eliminarHorario($idHorarioEliminar);
                }
                
                return [
                    'id_nomina' => $idNominaEliminar,
                    'id_horario' => $idHorarioEliminar,
                    'numero_semana' => $numeroSemana
                ];
            } else {
                $sql->close();
                return false;
            }
        }
        
        $sql->close();
        return false;
    } catch (Exception $e) {
        error_log("Error en eliminarNominaMasAntigua: " . $e->getMessage());
        return false;
    }
}

// Nueva función para eliminar un horario específico
function eliminarHorario($idHorario)
{
    global $conexion;
    
    try {
        $sql = $conexion->prepare("DELETE FROM horarios_oficiales WHERE id_horario = ?");
        $sql->bind_param("i", $idHorario);
        $resultado = $sql->execute();
        $sql->close();
        return $resultado;
    } catch (Exception $e) {
        error_log("Error en eliminarHorario: " . $e->getMessage());
        return false;
    }
}

function verificarNominaExistente($numeroSemana)
{
    global $conexion;
    $sql = $conexion->prepare("SELECT id_nomina_json FROM nomina WHERE JSON_EXTRACT(datos_nomina, '$.numero_semana') = ?");
    $sql->bind_param("s", $numeroSemana);
    $sql->execute();
    $resultado = $sql->get_result();

    if ($resultado->num_rows > 0) {
        $row = $resultado->fetch_assoc();
        $sql->close();
        return $row;
    }

    $sql->close();
    return false;
}

function generarIdNomina()
{
    global $conexion;
    $sql = $conexion->prepare("SELECT MAX(id_nomina_json) as max_id FROM nomina");
    $sql->execute();
    $resultado = $sql->get_result();
    $row = $resultado->fetch_assoc();
    $nuevoId = ($row['max_id']) ? $row['max_id'] + 1 : 1;
    $sql->close();
    return $nuevoId;
}

// Nuevas funciones para horarios
function limpiarTablaHorarios()
{
    global $conexion;
    $sql = $conexion->prepare("DELETE FROM horarios_oficiales");
    if (!$sql->execute()) {
        throw new Exception('Error al limpiar la tabla de horarios: ' . $sql->error);
    }
    $sql->close();

    $sql = $conexion->prepare("ALTER TABLE horarios_oficiales AUTO_INCREMENT = 1");
    $sql->execute();
    $sql->close();
}


function guardarHorarios($horariosData)
{
    global $conexion;

    try {
        // Verificar si los datos de horarios tienen numero_semana
        $decodedHorarios = json_decode($horariosData, true);
        if (isset($decodedHorarios['numero_semana'])) {
            $numeroSemana = $decodedHorarios['numero_semana'];

            // Verificar si ya existe un horario con esta semana
            $sql = $conexion->prepare("SELECT id_horario FROM horarios_oficiales WHERE JSON_EXTRACT(horario_json, '$.numero_semana') = ?");
            $sql->bind_param("s", $numeroSemana);
            $sql->execute();
            $resultado = $sql->get_result();

            if ($resultado->num_rows > 0) {
                // Ya existe, actualizar en lugar de crear
                $row = $resultado->fetch_assoc();
                $idHorario = $row['id_horario'];
                $sql->close();

                $sql = $conexion->prepare("UPDATE horarios_oficiales SET horario_json = ? WHERE id_horario = ?");
                $sql->bind_param("si", $horariosData, $idHorario);

                if ($sql->execute()) {
                    $sql->close();
                    return $idHorario;
                }
                $sql->close();
                return false;
            }
            $sql->close();
        }

        // No existe, crear nuevo
        $idHorario = generarIdHorario();
        $sql = $conexion->prepare("INSERT INTO horarios_oficiales (id_horario, horario_json) VALUES (?, ?)");
        $sql->bind_param("is", $idHorario, $horariosData);

        if ($sql->execute()) {
            $sql->close();
            return $idHorario;
        } else {
            $sql->close();
            return false;
        }
    } catch (Exception $e) {
        error_log("Error en guardarHorarios: " . $e->getMessage());
        return false;
    }
}

function actualizarHorarios($numeroSemana, $horariosData)
{
    global $conexion;

    try {
        // Buscar horario que tenga el mismo numero_semana
        $sql = $conexion->prepare("SELECT id_horario FROM horarios_oficiales WHERE JSON_EXTRACT(horario_json, '$.numero_semana') = ?");
        $sql->bind_param("s", $numeroSemana);
        $sql->execute();
        $resultado = $sql->get_result();

        if ($resultado->num_rows > 0) {
            // ACTUALIZAR el registro existente
            $row = $resultado->fetch_assoc();
            $idHorario = $row['id_horario'];
            $sql->close();

            $sql = $conexion->prepare("UPDATE horarios_oficiales SET horario_json = ? WHERE id_horario = ?");
            $sql->bind_param("si", $horariosData, $idHorario);

            if ($sql->execute()) {
                $sql->close();
                return $idHorario;
            } else {
                $sql->close();
                return false;
            }
        } else {
            // NO existe, crear nuevo registro
            $sql->close();
            return guardarHorarios($horariosData);
        }
    } catch (Exception $e) {
        error_log("Error en actualizarHorarios: " . $e->getMessage());
        return false;
    }
}
function generarIdHorario()
{
    global $conexion;
    $sql = $conexion->prepare("SELECT MAX(id_horario) as max_id FROM horarios_oficiales");
    $sql->execute();
    $resultado = $sql->get_result();
    $row = $resultado->fetch_assoc();
    $nuevoId = ($row['max_id']) ? $row['max_id'] + 1 : 1;
    $sql->close();
    return $nuevoId;
}

$conexion->close();
