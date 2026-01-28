<?php
ob_start();
include "../../conexion/conexion.php";
$conn = $conexion;
ob_clean();

header('Content-Type: application/json; charset=utf-8');

try {
    $json = file_get_contents('php://input');
    $datos = json_decode($json, true);

    if (!$datos) {
        throw new Exception("No se recibieron datos válidos");
    }

    if (!isset($datos['numero_semana'])) {
        throw new Exception("Falta el número de semana");
    }


    $resumen = [];
    $total_vacaciones = 0;
    $total_ausencias = 0;
    $total_incapacidades = 0;
    $total_dias_trabajados = 0;


    // Obtener el año desde fecha_inicio o fecha_cierre (antes de guardar por empleado)
    $anio = null;
    if (!empty($datos['fecha_inicio'])) {
        $partes = explode('/', $datos['fecha_inicio']);
        if (count($partes) === 3) {
            $anio = intval($partes[2]);
        }
    }
    if (!$anio && !empty($datos['fecha_cierre'])) {
        $partes = explode('/', $datos['fecha_cierre']);
        if (count($partes) === 3) {
            $anio = intval($partes[2]);
        }
    }
    if (!$anio) {
        throw new Exception("No se pudo determinar el año (anio) desde las fechas proporcionadas");
    }

    // Procesar y guardar por empleado
    if (isset($datos['departamentos']) && is_array($datos['departamentos'])) {
        foreach ($datos['departamentos'] as $departamento) {
            if (isset($departamento['empleados']) && is_array($departamento['empleados'])) {
                foreach ($departamento['empleados'] as $empleado) {
                    if (!isset($empleado['id_empleado'])) continue;
                    $empleado_id = intval($empleado['id_empleado']);
                    $vacaciones = isset($empleado['dias_vacaciones']) ? intval($empleado['dias_vacaciones']) : 0;
                    $ausencias = isset($empleado['ausencias']) ? intval($empleado['ausencias']) : 0;
                    $incapacidades = isset($empleado['incapacidades']) ? intval($empleado['incapacidades']) : 0;
                    $dias_trabajados = isset($empleado['dias_trabajados']) ? intval($empleado['dias_trabajados']) : 0;

                    // Sumar al resumen general
                    $total_vacaciones += $vacaciones;
                    $total_ausencias += $ausencias;
                    $total_incapacidades += $incapacidades;
                    $total_dias_trabajados += $dias_trabajados;

                    // Obtener id_empresa del empleado
                    $sql_empresa = "SELECT id_empresa FROM info_empleados WHERE id_empleado = ?";
                    $stmt_empresa = $conn->prepare($sql_empresa);
                    $stmt_empresa->bind_param("i", $empleado_id);
                    $stmt_empresa->execute();
                    $result_empresa = $stmt_empresa->get_result();
                    $id_empresa = null;
                    if ($result_empresa->num_rows > 0) {
                        $row_empresa = $result_empresa->fetch_assoc();
                        $id_empresa = $row_empresa['id_empresa'];
                    }
                    $stmt_empresa->close();

                    if (!$id_empresa) {
                        continue; // Si no tiene empresa asignada, saltar este empleado
                    }

                    // Verificar si ya existe registro para ese empleado, semana y año
                    $sql_check = "SELECT id FROM historial_incidencias_semanal WHERE semana = ? AND anio = ? AND empleado_id = ?";
                    $stmt_check = $conn->prepare($sql_check);
                    $stmt_check->bind_param("sii", $datos['numero_semana'], $anio, $empleado_id);
                    $stmt_check->execute();
                    $result = $stmt_check->get_result();

                    if ($result->num_rows > 0) {
                        // Actualizar
                        $row = $result->fetch_assoc();
                        $sql = "UPDATE historial_incidencias_semanal 
                                SET vacaciones = ?, 
                                    ausencias = ?, 
                                    incapacidades = ?, 
                                    dias_trabajados = ?,
                                    anio = ?,
                                    id_empresa = ?
                                WHERE id = ?";
                        $stmt = $conn->prepare($sql);
                        $stmt->bind_param("iiiiiii", $vacaciones, $ausencias, $incapacidades, $dias_trabajados, $anio, $id_empresa, $row['id']);
                    } else {
                        // Insertar
                        $sql = "INSERT INTO historial_incidencias_semanal (semana, anio, empleado_id, id_empresa, vacaciones, ausencias, incapacidades, dias_trabajados) 
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
                        $stmt = $conn->prepare($sql);
                        $stmt->bind_param("siiiiiii", $datos['numero_semana'], $anio, $empleado_id, $id_empresa, $vacaciones, $ausencias, $incapacidades, $dias_trabajados);
                    }
                    $stmt->execute();
                    $stmt->close();
                    $stmt_check->close();
                }
            }
        }
    }




    $conn->close();

    echo json_encode([
        'success' => true,
        'message' => 'Datos guardados por empleado para la semana ' . $datos['numero_semana'] . ' del año ' . $anio,
        'resumen' => [
            'semana' => $datos['numero_semana'],
            'vacaciones' => $total_vacaciones,
            'ausencias' => $total_ausencias,
            'incapacidades' => $total_incapacidades,
            'dias_trabajados' => $total_dias_trabajados
        ]
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

ob_end_flush();
exit;