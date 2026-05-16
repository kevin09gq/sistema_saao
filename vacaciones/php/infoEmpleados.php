<?php
include("../../conexion/conexion.php");


$action = $_POST['action'] ?? '';

switch ($action) {
    case 'obtenerEmpleados':
        obtenerEmpleados($conexion);
        break;
    case 'obtenerEmpleadoPorId':
        obtenerEmpleadoPorId($conexion);
        break;
    default:
        echo json_encode(['error' => 'Acción no válida']);
        break;
}

//==============================
// OBTIENE LA INFORMACIÓN DE UN EMPLEADO ESPECÍFICO POR ID DEL EMPLEADO
//==============================

function obtenerEmpleadoPorId($conexion) {
    $id_empleado = $_POST['id_empleado'] ?? 0;

    $sql = "SELECT 
                e.id_empleado,
                e.clave_empleado,
                e.nombre,
                e.ap_paterno,
                e.ap_materno,
                e.fecha_alta_empresa,
                e.id_status,
                COALESCE(
                    (SELECT MAX(fecha_reingreso) 
                     FROM historial_reingresos 
                     WHERE id_empleado = e.id_empleado), 
                    e.fecha_alta_empresa
                ) AS fecha_ingreso_final,
                e.id_area,
                e.id_departamento,
                d.nombre_departamento,
                a.nombre_area
            FROM info_empleados e
            LEFT JOIN departamentos d ON e.id_departamento = d.id_departamento
            LEFT JOIN areas a ON e.id_area = a.id_area
            WHERE e.id_empleado = '$id_empleado'";

    $result = mysqli_query($conexion, $sql);
    $row = mysqli_fetch_assoc($result);

    if ($row) {
        // Calcular antigüedad
        $fecha_ingreso = new DateTime($row['fecha_ingreso_final']);
        $hoy = new DateTime();
        $diferencia = $hoy->diff($fecha_ingreso);
        $row['antiguedad'] = $diferencia->y . " años";
    }

    echo json_encode($row);
}

//==============================
// OBTIENE LA INFORMACIÓN DE TODOS LOS EMPLEADOS REGISTRADOS EN LA BASE DE DATOS
//==============================

function obtenerEmpleados($conexion) {
    $sql = "SELECT 
                e.id_empleado,
                e.clave_empleado,
                e.nombre,
                e.ap_paterno,
                e.ap_materno,
                e.fecha_alta_empresa,
                e.id_status,
                COALESCE(
                    (SELECT MAX(fecha_reingreso) 
                     FROM historial_reingresos 
                     WHERE id_empleado = e.id_empleado), 
                    e.fecha_alta_empresa
                ) AS fecha_ingreso_final,
                e.id_area,
                e.id_departamento,
                d.nombre_departamento,
                a.nombre_area
            FROM info_empleados e
            LEFT JOIN departamentos d ON e.id_departamento = d.id_departamento
            LEFT JOIN areas a ON e.id_area = a.id_area
            ORDER BY e.id_status ASC, e.clave_empleado ASC";

    $result = mysqli_query($conexion, $sql);
    
    $empleados = [];
    while ($row = mysqli_fetch_assoc($result)) {
        // Calcular antigüedad desde la fecha de ingreso final (tomando en cuenta reingresos)
        $fecha_ingreso = new DateTime($row['fecha_ingreso_final']);
        $hoy = new DateTime();
        $diferencia = $hoy->diff($fecha_ingreso);
        $row['antiguedad'] = $diferencia->y . " años";
        
        $empleados[] = $row;
    }
    
    echo json_encode($empleados);
}
?>
