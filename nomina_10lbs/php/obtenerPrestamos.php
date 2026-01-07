<?php
header('Content-Type: application/json; charset=UTF-8');

require_once __DIR__ . '/../../conexion/conexion.php';

if (!isset($_POST['id_empleado'])) {
    echo json_encode(['success' => false, 'message' => 'Falta id_empleado']);
    exit;
}

$idEmpleado = intval($_POST['id_empleado']);

$sql = "SELECT id_prestamo, monto_total, monto_semanal, semanas_totales, semanas_pagadas, saldo_restante, estado, DATE_FORMAT(fecha_inicio, '%d/%m/%Y') as fecha_inicio FROM prestamos WHERE id_empleado = ? AND estado IN ('activo','pendiente') ORDER BY fecha_inicio DESC";

if (!$stmt = mysqli_prepare($conexion, $sql)) {
    echo json_encode(['success' => false, 'message' => 'Error en la consulta']);
    exit;
}

mysqli_stmt_bind_param($stmt, 'i', $idEmpleado);
mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

$prestamos = [];
if ($result) {
    while ($row = mysqli_fetch_assoc($result)) {
        $prestamos[] = $row;
    }
}

mysqli_stmt_close($stmt);
mysqli_close($conexion);

echo json_encode(['success' => true, 'prestamos' => $prestamos]);

?>
