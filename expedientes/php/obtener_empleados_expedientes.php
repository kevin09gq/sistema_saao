<?php
include_once __DIR__ . '/../../conexion/conexion.php';

/** @var mysqli $conexion */

if (isset($_GET['accion']) && $_GET['accion'] === 'cargarEmpleados') {
    cargarEmpleados();
}

function cargarEmpleados()
{
    global $conexion;

    $sql = $conexion->prepare("SELECT 
        e.id_empleado, 
        e.clave_empleado, 
        e.nombre, 
        e.ap_paterno, 
        e.ap_materno, 
        e.imss,
        COALESCE(e.status_nss, 0) AS status_nss,
        e.curp,
        e.grupo_sanguineo,
        s.id_status, 
        s.nombre_status, 
        e.id_area,
        a.nombre_area,
        d.id_departamento, 
        d.nombre_departamento
        FROM 
        info_empleados e
        LEFT JOIN 
        status s ON e.id_status = s.id_status
        LEFT JOIN 
        areas a ON e.id_area = a.id_area
        LEFT JOIN 
        departamentos d ON e.id_departamento = d.id_departamento 
        ORDER BY 
        e.nombre ASC");
    $sql->execute();
    $resultado = $sql->get_result();
    $empleados = array();

    while ($row = $resultado->fetch_assoc()) {
        $empleados[] = array(
            'id_empleado' => $row['id_empleado'],
            'clave_empleado' => $row['clave_empleado'],
            'nombre' => $row['nombre'],
            'ap_paterno' => $row['ap_paterno'],
            'ap_materno' => $row['ap_materno'],
            'imss' => $row['imss'],
            'status_nss' => (int)$row['status_nss'],
            'curp' => $row['curp'],
            'grupo_sanguineo' => $row['grupo_sanguineo'],
            'id_status' => $row['id_status'],
            'nombre_status' => $row['nombre_status'],
            'id_area' => $row['id_area'],
            'nombre_area' => $row['nombre_area'],
            'id_departamento' => $row['id_departamento'],
            'nombre_departamento' => $row['nombre_departamento']
        );
    }

    header('Content-Type: application/json');
    echo json_encode($empleados, JSON_UNESCAPED_UNICODE);
}
