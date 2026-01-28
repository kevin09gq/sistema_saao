<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . "/../../conexion/conexion.php";

// Respuesta
function respuestas(int $code, string $titulo, string $mensaje, string $icono, array $data)
{
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode([
        "titulo"  => $titulo,
        "mensaje" => $mensaje,
        "icono"   => $icono,
        "data"    => $data
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if (!isset($_SESSION["logged_in"])) {
    respuestas(401, "No autenticado", "Debes primero iniciar sesión", "error", []);
}

$idEmpleado = isset($_GET['id_empleado']) ? (int)$_GET['id_empleado'] : 0;

if ($idEmpleado <= 0) {
    respuestas(400, 'Datos incompletos', 'Falta id_empleado', 'warning', []);
}

// Buscar el préstamo activo más antiguo del empleado
$sqlPrestamo = "
    SELECT p.id_prestamo
    FROM prestamos p
    WHERE p.id_empleado = ?
      AND p.estado = 'activo'
    ORDER BY p.fecha_registro ASC
    LIMIT 1
";

$stmtPrestamo = $conexion->prepare($sqlPrestamo);
if (!$stmtPrestamo) {
    respuestas(500, 'Error', 'No se pudo preparar la consulta de préstamo', 'error', []);
}
$stmtPrestamo->bind_param('i', $idEmpleado);
if (!$stmtPrestamo->execute()) {
    respuestas(500, 'Error', 'No se pudo ejecutar la consulta de préstamo', 'error', []);
}
$resPrestamo = $stmtPrestamo->get_result();
$prestamo = $resPrestamo ? ($resPrestamo->fetch_assoc() ?? null) : null;
$stmtPrestamo->close();

if (!$prestamo) {
    respuestas(404, 'Sin préstamos', 'El empleado no tiene préstamos activos', 'info', []);
}

$idPrestamo = (int)$prestamo['id_prestamo'];

// Buscar el plan más reciente del préstamo
$sqlPlan = "
    SELECT pp.id_plan
    FROM planes_pagos pp
    WHERE pp.id_prestamo = ?
    ORDER BY pp.fecha_registro DESC
    LIMIT 1
";

$stmtPlan = $conexion->prepare($sqlPlan);
if (!$stmtPlan) {
    respuestas(500, 'Error', 'No se pudo preparar la consulta del plan', 'error', []);
}
$stmtPlan->bind_param('i', $idPrestamo);
if (!$stmtPlan->execute()) {
    respuestas(500, 'Error', 'No se pudo ejecutar la consulta del plan', 'error', []);
}
$resPlan = $stmtPlan->get_result();
$plan = $resPlan ? ($resPlan->fetch_assoc() ?? null) : null;
$stmtPlan->close();

if (!$plan) {
    respuestas(404, 'Sin plan', 'No se encontró un plan de pago para el préstamo activo', 'info', []);
}

$idPlan = (int)$plan['id_plan'];

// Buscar el detalle del plan
$sqlDetalle = "
    SELECT id_detalle, detalle
    FROM detalle_planes
    WHERE id_plan = ?
    ORDER BY id_detalle DESC
    LIMIT 1
";

$stmtDet = $conexion->prepare($sqlDetalle);
if (!$stmtDet) {
    respuestas(500, 'Error', 'No se pudo preparar la consulta del detalle', 'error', []);
}
$stmtDet->bind_param('i', $idPlan);
if (!$stmtDet->execute()) {
    respuestas(500, 'Error', 'No se pudo ejecutar la consulta del detalle', 'error', []);
}
$resDet = $stmtDet->get_result();
$detalleRow = $resDet ? ($resDet->fetch_assoc() ?? null) : null;
$stmtDet->close();

if (!$detalleRow) {
    respuestas(404, 'Sin detalle', 'No se encontró detalle para el plan de pago', 'info', []);
}

$detalleJson = $detalleRow['detalle'];
$detalleArray = json_decode($detalleJson, true);

if (!is_array($detalleArray)) {
    respuestas(500, 'Error', 'El detalle del plan no tiene un JSON válido', 'error', []);
}

respuestas(200, 'OK', 'Detalle obtenido', 'success', [
    'id_prestamo' => $idPrestamo,
    'id_plan' => $idPlan,
    'id_detalle' => (int)$detalleRow['id_detalle'],
    'detalle' => $detalleArray
]);
