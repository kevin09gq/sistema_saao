<?php
include "../../conexion/conexion.php";

// Consulta para obtener empleados con información de departamento
$sql = $conexion->prepare("
    SELECT 
        e.id_empleado, 
        e.nombre, 
        e.ap_paterno, 
        e.ap_materno, 
        e.clave_empleado, 
        e.id_departamento,
        d.nombre_departamento
    FROM info_empleados e
    LEFT JOIN departamentos d ON e.id_departamento = d.id_departamento
    WHERE e.id_status = 1
    ORDER BY d.nombre_departamento, e.nombre, e.ap_paterno, e.ap_materno
");

$sql->execute();
$resultado = $sql->get_result();

$empleadosPorDepartamento = array();

while ($row = $resultado->fetch_assoc()) {
    $nombreCompleto = trim($row['nombre'] . ' ' . $row['ap_paterno'] . ' ' . $row['ap_materno']);
    
    // Asegurarse de limpiar bien el nombre del departamento
    $departamento = isset($row['nombre_departamento']) && trim($row['nombre_departamento']) !== ""
        ? trim($row['nombre_departamento'])
        : 'Sin departamento';

    if (!isset($empleadosPorDepartamento[$departamento])) {
        $empleadosPorDepartamento[$departamento] = array();
    }

    $empleadosPorDepartamento[$departamento][] = array(
        'id_empleado'     => $row['id_empleado'],
        'nombre_completo' => $nombreCompleto,
        'clave_empleado'  => $row['clave_empleado'],
        'id_departamento' => $row['id_departamento']
    );
}

// Enviar respuesta como JSON
header('Content-Type: application/json; charset=utf-8');
echo json_encode($empleadosPorDepartamento, JSON_UNESCAPED_UNICODE);
