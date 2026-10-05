<?php
require_once __DIR__ . "/../../conexion/conexion.php";

/** @var mysqli $conexion */
$action = $_POST['action'] ?? '';

switch ($action) {
    case 'obtenerEmpleados':
        obtenerEmpleados($conexion);
        break;
    default:
        echo json_encode(['error' => 'Acción no válida']);
        break;
}

//==============================
// OBTIENE LA INFORMACIÓN DE TODOS LOS EMPLEADOS REGISTRADOS EN LA BASE DE DATOS
//==============================
function obtenerEmpleados($conexion)
{
    $sql = "SELECT
                e.id_empleado,
                e.clave_empleado,
                e.nombre,
                e.ap_paterno,
                e.ap_materno,
                e.sexo,
                e.fecha_alta_empresa,
                e.id_status,
                e.status_nss,
                e.id_area,
                e.id_departamento,
                d.nombre_departamento,
                a.nombre_area
            FROM info_empleados e
            LEFT JOIN departamentos d ON e.id_departamento = d.id_departamento
            LEFT JOIN areas a ON e.id_area = a.id_area
            WHERE e.id_status = 1
            ORDER BY CONCAT(e.nombre, ' ', e.ap_paterno, ' ', e.ap_materno) ASC";

    $result = mysqli_query($conexion, $sql);

    $empleados = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $empleados[] = $row;
    }

    echo json_encode($empleados);
}
?>
