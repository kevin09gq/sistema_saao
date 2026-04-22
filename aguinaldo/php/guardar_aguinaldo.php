<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . "/../../conexion/conexion.php";

function respuestas(int $code, array $data, string $mensaje, string $titulo, string $icono)
{
    http_response_code($code);
    echo json_encode([
        "data"    => $data,
        "mensaje" => $mensaje,
        "titulo"  => $titulo,
        "icono"   => $icono
    ], JSON_UNESCAPED_UNICODE);
}

if (!isset($_SESSION["logged_in"])) {
    respuestas(401, [], "Debes primero iniciar sesión", "Sesión no válida", "error");
    exit;
}

try {
    // Leer el JSON crudo
    $input = file_get_contents("php://input");
    $data = json_decode($input, true);

    if (!$data || !isset($data['anio']) || !isset($data['datos'])) {
        respuestas(400, [], "Datos inválidos o incompletos", "Error en la solicitud", "error");
        exit;
    }

    $anio = $data['anio'];
    $empleados = $data['datos'];

    // Iniciar transacción
    $conexion->begin_transaction();

    // Borrar registros antiguos del año
    $stmtDelete = $conexion->prepare("DELETE FROM aguinaldo_empleado WHERE anio = ?");
    if (!$stmtDelete) {
        throw new Exception("Error en la preparación de la consulta DELETE: " . $conexion->error);
    }

    $stmtDelete->bind_param("i", $anio);
    if (!$stmtDelete->execute()) {
        throw new Exception("Error al ejecutar DELETE: " . $stmtDelete->error);
    }
    $stmtDelete->close();

    // Insertar nuevos registros
    $stmtInsert = $conexion->prepare("INSERT INTO aguinaldo_empleado (
            id_empleado, id_empresa, id_area, id_departamento, id_puestoEspecial,
            anio, dias_trabajados, sueldo_diario, monto_aguinaldo, fecha_pago, fecha_registro
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())");

    if (!$stmtInsert) {
        throw new Exception("Error en la preparación de la consulta INSERT: " . $conexion->error);
    }

    foreach ($empleados as $empleado) {
        $id_empleado       = $empleado['id_empleado'];
        $id_empresa        = $empleado['id_empresa'];
        $id_area           = $empleado['id_area'];
        $id_departamento   = $empleado['id_departamento'];
        $id_puestoEspecial = $empleado['id_puesto'];
        $dias_trabajados   = (int)$empleado['dias_trabajados'];
        $sueldo_diario     = (float)($empleado['salario_diario'] ?? 0);
        $monto_aguinaldo   = (float)($empleado['aguinaldo'] == -1 ? 0 : $empleado['aguinaldo']);
        $fecha_pago        = !empty($empleado['fecha_pago']) ? $empleado['fecha_pago'] : date('Y-m-d');

        $stmtInsert->bind_param(
            "iiiiiiidds",
            $id_empleado,
            $id_empresa,
            $id_area,
            $id_departamento,
            $id_puestoEspecial,
            $anio,
            $dias_trabajados,
            $sueldo_diario,
            $monto_aguinaldo,
            $fecha_pago
        );

        if (!$stmtInsert->execute()) {
            throw new Exception("Error al insertar datos del empleado ID {$id_empleado}: " . $stmtInsert->error);
        }
    }

    $stmtInsert->close();

    // Confirmar transacción
    $conexion->commit();

    respuestas(200, [], "Aguinaldos guardados correctamente", "Completado con exito", "success");

} catch (Exception $e) {
    // Revertir transacción en caso de error
    $conexion->rollback();
    
    respuestas(500, [], "Error al guardar aguinaldos: " . $e->getMessage(), "Error en la operación", "error");
}