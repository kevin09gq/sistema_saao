<?php
include "../../conexion/conexion.php";
header('Content-Type: application/json; charset=utf-8');

// Recibir parámetros
$busqueda = isset($_POST['busqueda']) ? mysqli_real_escape_string($conexion, trim($_POST['busqueda'])) : '';
$estado = isset($_POST['estado']) ? mysqli_real_escape_string($conexion, trim($_POST['estado'])) : '';
$fecha = isset($_POST['fecha']) ? mysqli_real_escape_string($conexion, trim($_POST['fecha'])) : '';
$departamento = isset($_POST['departamento']) ? mysqli_real_escape_string($conexion, trim($_POST['departamento'])) : '';
$seguro = isset($_POST['seguro']) ? mysqli_real_escape_string($conexion, trim($_POST['seguro'])) : '';

// Construir condiciones
$condiciones = array();

if ($busqueda !== '') {
    $b = $busqueda;
    $condiciones[] = "(e.nombre LIKE '%$b%' OR e.ap_paterno LIKE '%$b%' OR e.ap_materno LIKE '%$b%' OR e.clave_empleado LIKE '%$b%' OR p.notas LIKE '%$b%')";
}

if ($estado !== '') {
    $estado_esc = $estado;
    $condiciones[] = "p.estado = '$estado_esc'";
}

if ($fecha !== '') {
    // fecha esperada en formato yyyy-mm-dd desde el input
    $fecha_esc = $fecha;
    $condiciones[] = "DATE(p.fecha_inicio) = '$fecha_esc'";
}

if ($departamento !== '' && $departamento != '0') {
    $dep = (int)$departamento;
    $condiciones[] = "e.id_departamento = $dep";
}

if ($seguro !== '') {
    if ($seguro === 'con') {
        $condiciones[] = "e.status_nss = 1";
    } elseif ($seguro === 'sin') {
        $condiciones[] = "e.status_nss = 0";
    }
}

$where = '';
if (count($condiciones) > 0) {
    $where = 'WHERE ' . implode(' AND ', $condiciones);
}

$sql = "SELECT 
    p.id_prestamo,
    p.monto_total,
    p.monto_semanal,
    p.semanas_totales,
    p.semanas_pagadas,
    p.saldo_restante,
    p.estado,
    DATE_FORMAT(p.fecha_inicio, '%d/%m/%Y') AS fecha_inicio,
    e.clave_empleado,
    CONCAT(e.nombre, ' ', e.ap_paterno, ' ', e.ap_materno) AS nombre_completo
FROM prestamos p
LEFT JOIN info_empleados e ON p.id_empleado = e.id_empleado
" . $where . "
ORDER BY e.nombre ASC, e.ap_paterno ASC, e.ap_materno ASC";

$result = mysqli_query($conexion, $sql);
$out = array();
if ($result) {
    while ($r = mysqli_fetch_assoc($result)) {
        $out[] = $r;
    }
}

echo json_encode($out, JSON_UNESCAPED_UNICODE);

mysqli_close($conexion);
?>
