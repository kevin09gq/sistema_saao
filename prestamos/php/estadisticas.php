<?php
include "../../conexion/conexion.php";
header('Content-Type: application/json; charset=utf-8');

// Recibir los mismos filtros que busqueda_filtrado.php
$busqueda = isset($_POST['busqueda']) ? mysqli_real_escape_string($conexion, trim($_POST['busqueda'])) : '';
$estado = isset($_POST['estado']) ? mysqli_real_escape_string($conexion, trim($_POST['estado'])) : '';
$fecha = isset($_POST['fecha']) ? mysqli_real_escape_string($conexion, trim($_POST['fecha'])) : '';
$departamento = isset($_POST['departamento']) ? mysqli_real_escape_string($conexion, trim($_POST['departamento'])) : '';
$seguro = isset($_POST['seguro']) ? mysqli_real_escape_string($conexion, trim($_POST['seguro'])) : '';

// Construir condiciones (igual que en busqueda_filtrado.php)
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

// Contar préstamos activos
$where_activos = $where;
if ($where_activos === '') {
    $where_activos = "WHERE p.estado = 'activo'";
} else {
    $where_activos .= " AND p.estado = 'activo'";
}
$sql_activos = "SELECT COUNT(*) as total FROM prestamos p LEFT JOIN info_empleados e ON p.id_empleado = e.id_empleado $where_activos";
$result_activos = mysqli_query($conexion, $sql_activos);
$activos = mysqli_fetch_assoc($result_activos)['total'];

// Contar préstamos pendientes
$where_pendientes = $where;
if ($where_pendientes === '') {
    $where_pendientes = "WHERE p.estado = 'pendiente'";
} else {
    $where_pendientes .= " AND p.estado = 'pendiente'";
}
$sql_pendientes = "SELECT COUNT(*) as total FROM prestamos p LEFT JOIN info_empleados e ON p.id_empleado = e.id_empleado $where_pendientes";
$result_pendientes = mysqli_query($conexion, $sql_pendientes);
$pendientes = mysqli_fetch_assoc($result_pendientes)['total'];

// Sumar total prestado
$sql_total = "SELECT SUM(p.monto_total) as total FROM prestamos p LEFT JOIN info_empleados e ON p.id_empleado = e.id_empleado $where";
$result_total = mysqli_query($conexion, $sql_total);
$total_prestado = mysqli_fetch_assoc($result_total)['total'] ?? 0;

// Contar préstamos pagados
$where_pagados = $where;
if ($where_pagados === '') {
    $where_pagados = "WHERE p.estado = 'pagado'";
} else {
    $where_pagados .= " AND p.estado = 'pagado'";
}
$sql_pagados = "SELECT COUNT(*) as total FROM prestamos p LEFT JOIN info_empleados e ON p.id_empleado = e.id_empleado $where_pagados";
$result_pagados = mysqli_query($conexion, $sql_pagados);
$pagados = mysqli_fetch_assoc($result_pagados)['total'];

// Devolver JSON
$estadisticas = array(
    'activos' => (int)$activos,
    'pendientes' => (int)$pendientes,
    'total_prestado' => (float)$total_prestado,
    'pagados' => (int)$pagados
);

echo json_encode($estadisticas, JSON_UNESCAPED_UNICODE);

mysqli_close($conexion);
?>
