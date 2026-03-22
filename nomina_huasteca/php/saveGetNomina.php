<?php
// Evitar que warnings/avisos rompan el JSON de respuesta
ini_set('display_errors', 0);
error_reporting(0);

include '../../conexion/conexion.php';

// Forzar cabecera JSON
header('Content-Type: application/json; charset=UTF-8');

// Obtener datos enviados desde el cliente
$data = json_decode(file_get_contents('php://input'), true);

$case = $data['case'] ?? '';

switch ($case) {
    case 'guardarNominaHuasteca':
        guardarNominaHuasteca($data, $conexion);
        break;
    case 'validarExistenciaNomina':
        validarExistenciaNomina($data, $conexion);
        break;
    case 'obtenerNomina':
        obtenerNomina($data, $conexion);
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Caso no válido']);
        break;
}

function guardarNominaHuasteca($data, $conexion)
{
    $id_empresa = $data['id_empresa'];
    $numero_semana = $data['numero_semana'];
    $anio = $data['anio'];
    $nomina = $data['nomina'];
    $actualizar = $data['actualizar'];

    // Obtener todo lo de corte
    //$corte = $data['corte'];

    // Verificar si ya existe la nómina considerando número de semana y año
    $query = "SELECT * FROM nomina_huasteca WHERE numero_semana = ? AND anio = ?";
    $stmt = $conexion->prepare($query);
    $stmt->bind_param("ii", $numero_semana, $anio);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        if ($actualizar) {
            // Actualizar nómina existente
            $updateQuery = "UPDATE nomina_huasteca SET nomina_huasteca = ? WHERE id_empresa = ? AND numero_semana = ? AND anio = ?";
            $updateStmt = $conexion->prepare($updateQuery);
            $updateStmt->bind_param("siii", $nomina, $id_empresa, $numero_semana, $anio);
            if ($updateStmt->execute()) {
                // Obtener el ID de la nómina actualizada
                $queryId = "SELECT id_nomina_huasteca FROM nomina_huasteca WHERE id_empresa = ? AND numero_semana = ? AND anio = ?";
                $stmtId = $conexion->prepare($queryId);
                $stmtId->bind_param("iii", $id_empresa, $numero_semana, $anio);
                $stmtId->execute();
                $resultId = $stmtId->get_result();
                $rowId = $resultId->fetch_assoc();
                $idNominaActualizada = $rowId['id_nomina_huasteca'];

                // También actualizar los tickets de corte
                // guardarTicketsCorte($corte, $idNominaActualizada, $conexion);

                echo json_encode(['success' => true, 'message' => 'Nómina actualizada correctamente']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Error al actualizar la nómina']);
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'La nómina ya existe y no se puede actualizar']);
        }
    } else {
        // Insertar nueva nómina
        $insertQuery = "INSERT INTO nomina_huasteca (id_empresa, numero_semana, anio, nomina_huasteca) VALUES (?, ?, ?, ?)";
        $insertStmt = $conexion->prepare($insertQuery);
        $insertStmt->bind_param("iiis", $id_empresa, $numero_semana, $anio, $nomina);
        if ($insertStmt->execute()) {
            // Recuperar el ID insertado
            $ultimoId = $conexion->insert_id;

            //guardarTicketsCorte($corte, $ultimoId, $conexion);

            echo json_encode(['success' => true, 'message' => 'Nómina guardada correctamente']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error al guardar la nómina']);
        }
    }
}

function validarExistenciaNomina($data, $conexion)
{
    $numero_semana = isset($data['numero_semana']) ? intval($data['numero_semana']) : 0;
    $anio = isset($data['anio']) ? intval($data['anio']) : 0;
    $id_empresa = isset($data['id_empresa']) ? intval($data['id_empresa']) : 1;

    // Consulta simple para verificar existencia 
    $query = "SELECT COUNT(*) AS cnt FROM nomina_huasteca WHERE id_empresa = ? AND numero_semana = ? AND anio = ?";
    $stmt = $conexion->prepare($query);
    $stmt->bind_param("iii", $id_empresa, $numero_semana, $anio);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    $exists = ($row && isset($row['cnt']) && intval($row['cnt']) > 0) ? true : false;

    echo json_encode(['success' => true, 'exists' => $exists]);
}

// Obtener la nómina almacenada (tabla `nomina_huasteca` según tu esquema)
function obtenerNomina($data, $conexion)
{
    $numero_semana = isset($data['numero_semana']) ? intval($data['numero_semana']) : 0;
    $id_empresa = isset($data['id_empresa']) ? intval($data['id_empresa']) : 1;

    // Usar la tabla `nomina_huasteca` que contiene la columna `anio` según tu esquema
    $anio = isset($data['anio']) ? intval($data['anio']) : 0;
    $query = "SELECT id_nomina_huasteca, nomina_huasteca FROM nomina_huasteca WHERE id_empresa = ? AND numero_semana = ? AND anio = ? ORDER BY id_nomina_huasteca DESC LIMIT 1";
    $stmt = $conexion->prepare($query);
    if (!$stmt) {
        // Responder con error manejable en JSON en lugar de un 500
        echo json_encode(['success' => false, 'message' => 'Error en la consulta a la base de datos']);
        return;
    }
    $stmt->bind_param("iii", $id_empresa, $numero_semana, $anio);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result && $result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $nomina_raw = $row['nomina_huasteca'];
        $idNomina = $row['id_nomina_huasteca'];

        // Intentar decodificar JSON guardado
        $nomina = json_decode($nomina_raw, true);

        // Obtener también los tickets de corte
        //$ticketsCorte = obtenerTicketsCorteInterno($idNomina, $conexion);

        if (json_last_error() === JSON_ERROR_NONE) {

           /* $nomina['departamentos'][] = [
                'nombre' => 'Corte',
                'empleados' => $ticketsCorte
            ];*/

            echo json_encode([
                'success' => true,
                'found' => true,
                'nomina' => $nomina
            ]);
        } else {
            // Si no es JSON válido, devolver el contenido crudo
            echo json_encode([
                'success' => true,
                'found' => true,
                'nomina' => $nomina_raw
            ]);
        }
    } else {
        echo json_encode(['success' => true, 'found' => false]);
    }
}





/**
 * Función para guardar tickets de corte (llamada desde guardarNominaRelicario)
 */
function guardarTicketsCorte($corte, $idNomina, $conexion)
{
    try {
        // Decodificar el JSON de los empleados cortadores
        $empleadosCorte = json_decode($corte, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            error_log("Error al decodificar JSON de cortes: " . json_last_error_msg());
            return;
        }

        // Primero limpiar tickets existentes para esta nómina (en caso de actualización)
        $deleteQuery = "DELETE FROM cortes_huasteca WHERE id_nomina = ?";
        $deleteStmt = $conexion->prepare($deleteQuery);
        $deleteStmt->bind_param("i", $idNomina);
        $deleteStmt->execute();

        // Procesar cada empleado cortador
        foreach ($empleadosCorte as $empleado) {
            $nombreCortador = $empleado['nombre'];

            // Procesar cada ticket del empleado
            foreach ($empleado['tickets'] as $ticket) {
                $folio = $ticket['folio'];
                $fechaCorte = $ticket['fecha'];
                $precioReja = $ticket['precio_reja'];

                // Insertar el ticket principal en cortes_relicario
                $insertCorteQuery = "INSERT INTO cortes_huasteca (id_nomina, nombre_cortador, folio, precio_reja, fecha_corte) VALUES (?, ?, ?, ?, ?)";
                $insertCorteStmt = $conexion->prepare($insertCorteQuery);
                $insertCorteStmt->bind_param("issds", $idNomina, $nombreCortador, $folio, $precioReja, $fechaCorte);

                if ($insertCorteStmt->execute()) {
                    // Obtener el ID del corte recién insertado
                    $idCorte = $conexion->insert_id;

                    // Insertar los detalles de las tablas de rejas
                    foreach ($ticket['datosRejas'] as $datosTabla) {
                        $numTabla = intval($datosTabla['tabla']);
                        $cantidadRejas = intval($datosTabla['cantidad']);

                        $insertTablaQuery = "INSERT INTO cortes_huasteca_tablas (id_corte, num_tabla, rejas) VALUES (?, ?, ?)";
                        $insertTablaStmt = $conexion->prepare($insertTablaQuery);
                        $insertTablaStmt->bind_param("iii", $idCorte, $numTabla, $cantidadRejas);
                        $insertTablaStmt->execute();
                    }
                } else {
                    error_log("Error al insertar corte: " . $conexion->error);
                }
            }
        }

        error_log("Tickets de corte guardados correctamente para nómina ID: " . $idNomina);
    } catch (Exception $e) {
        error_log("Error en guardarTicketsCorte: " . $e->getMessage());
    }
}

/**
 * Función para obtener tickets de corte (llamada independientemente)
 * Esta por el momento no se usa
 */
function obtenerTicketsCorte($data, $conexion)
{
    $numero_semana = isset($data['numero_semana']) ? intval($data['numero_semana']) : 0;
    $anio = isset($data['anio']) ? intval($data['anio']) : 0;
    $id_empresa = isset($data['id_empresa']) ? intval($data['id_empresa']) : 1;

    // Obtener el ID de la nómina primero
    $queryNomina = "SELECT id_nomina_huasteca FROM nomina_huasteca WHERE id_empresa = ? AND numero_semana = ? AND anio = ? ORDER BY id_nomina_huasteca DESC LIMIT 1";
    $stmtNomina = $conexion->prepare($queryNomina);
    $stmtNomina->bind_param("iii", $id_empresa, $numero_semana, $anio);
    $stmtNomina->execute();
    $resultNomina = $stmtNomina->get_result();

    if ($resultNomina && $resultNomina->num_rows > 0) {
        $rowNomina = $resultNomina->fetch_assoc();
        $idNomina = $rowNomina['id_nomina_huasteca'];

        $ticketsCorte = obtenerTicketsCorteInterno($idNomina, $conexion);
        echo json_encode(['success' => true, 'found' => true, 'ticketsCorte' => $ticketsCorte]);
    } else {
        echo json_encode(['success' => true, 'found' => false]);
    }
}

/**
 * Función interna para obtener tickets de corte desde un ID de nómina
 */
function obtenerTicketsCorteInterno($idNomina, $conexion)
{
    $empleadosCorte = [];

    // Obtener todos los cortes para esta nómina
    $queryCortes = "SELECT id, nombre_cortador, folio, precio_reja, fecha_corte FROM cortes_huasteca WHERE id_nomina = ? ORDER BY nombre_cortador, fecha_corte";
    $stmtCortes = $conexion->prepare($queryCortes);
    $stmtCortes->bind_param("i", $idNomina);
    $stmtCortes->execute();
    $resultCortes = $stmtCortes->get_result();

    while ($corte = $resultCortes->fetch_assoc()) {
        $idCorte = $corte['id'];
        $nombreCortador = $corte['nombre_cortador'];
        $folio = $corte['folio'];
        $precioReja = floatval($corte['precio_reja']);
        $fechaCorte = $corte['fecha_corte'];

        // Obtener las tablas de rejas para este corte
        $queryTablas = "SELECT num_tabla, rejas FROM cortes_huasteca_tablas WHERE id_corte = ? ORDER BY num_tabla";
        $stmtTablas = $conexion->prepare($queryTablas);
        $stmtTablas->bind_param("i", $idCorte);
        $stmtTablas->execute();
        $resultTablas = $stmtTablas->get_result();

        $datosRejas = [];
        while ($tabla = $resultTablas->fetch_assoc()) {
            $datosRejas[] = [
                'tabla' => $tabla['num_tabla'],
                'cantidad' => intval($tabla['rejas'])
            ];
        }

        // Buscar si el empleado ya existe en el array
        $empleadoIndex = -1;
        for ($i = 0; $i < count($empleadosCorte); $i++) {
            if ($empleadosCorte[$i]['nombre'] === $nombreCortador) {
                $empleadoIndex = $i;
                break;
            }
        }

        // Si el empleado no existe, crearlo
        if ($empleadoIndex === -1) {
            $empleadosCorte[] = [
                'nombre' => $nombreCortador,
                'tickets' => [],
                'concepto' => 'REJA'
            ];
            $empleadoIndex = count($empleadosCorte) - 1;
        }

        // Agregar el ticket al empleado
        $empleadosCorte[$empleadoIndex]['tickets'][] = [
            'folio' => $folio,
            'fecha' => $fechaCorte,
            'datosRejas' => $datosRejas,
            'precio_reja' => $precioReja
        ];
    }

    return $empleadosCorte;
}
