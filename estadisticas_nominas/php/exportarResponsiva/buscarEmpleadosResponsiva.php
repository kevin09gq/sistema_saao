<?php

require_once __DIR__ . "/../../../conexion/conexion.php";

/** @var mysqli $conexion */

header('Content-Type: application/json; charset=utf-8');

$accion = $_POST['accion'] ?? $_GET['accion'] ?? 'buscarEmpleados';

switch ($accion) {
    case 'buscarEmpleados':
        buscarEmpleados($conexion);
        break;

    default:
        echo json_encode([
            "success" => false,
            "mensaje" => "Acción no válida.",
            "datos"   => []
        ], JSON_UNESCAPED_UNICODE);
        break;
}

//===========================================================
// FUNCIÓN PARA BUSCAR EMPLEADOS Y SUS PUESTOS ASIGNADOS
//===========================================================
function buscarEmpleados(mysqli $conexion)
{
    $termino = trim($_POST['termino'] ?? $_GET['termino'] ?? '');

    if ($termino === '') {
        echo json_encode([
            "success" => true,
            "datos"   => []
        ], JSON_UNESCAPED_UNICODE);
        return;
    }

    $like = '%' . $termino . '%';

    // Búsqueda por nombre completo, clave de empleado o partes de nombre/apellidos
    // Se une con puestos_especiales para obtener el puesto asignado
    // Se priorizan empleados activos (id_status = 1)
    $sql = "SELECT 
                ie.id_empleado,
                ie.clave_empleado,
                TRIM(CONCAT(ie.nombre, ' ', ie.ap_paterno, ' ', COALESCE(ie.ap_materno, ''))) AS nombre_completo,
                COALESCE(pe.nombre_puesto, '') AS puesto,
                ie.id_status
            FROM info_empleados ie
            LEFT JOIN puestos_especiales pe ON ie.id_puestoEspecial = pe.id_puestoEspecial
            WHERE (
                CONCAT(ie.nombre, ' ', ie.ap_paterno, ' ', COALESCE(ie.ap_materno, '')) LIKE ?
                OR ie.clave_empleado LIKE ?
                OR ie.nombre LIKE ?
                OR ie.ap_paterno LIKE ?
                OR ie.ap_materno LIKE ?
            )
            ORDER BY (ie.id_status = 1) DESC, nombre_completo ASC
            LIMIT 15";

    $stmt = $conexion->prepare($sql);
    if (!$stmt) {
        echo json_encode([
            "success" => false,
            "mensaje" => "Error al preparar la consulta: " . $conexion->error,
            "datos"   => []
        ], JSON_UNESCAPED_UNICODE);
        return;
    }

    $stmt->bind_param("sssss", $like, $like, $like, $like, $like);
    $stmt->execute();
    $resultado = $stmt->get_result();

    $empleados = [];
    while ($row = $resultado->fetch_assoc()) {
        $empleados[] = [
            "id_empleado"     => (int) $row["id_empleado"],
            "clave_empleado"  => $row["clave_empleado"],
            "nombre_completo" => $row["nombre_completo"],
            "puesto"          => $row["puesto"],
            "id_status"       => (int) $row["id_status"]
        ];
    }

    $stmt->close();

    echo json_encode([
        "success" => true,
        "datos"   => $empleados
    ], JSON_UNESCAPED_UNICODE);
}
