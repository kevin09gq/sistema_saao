<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . "/../../conexion/conexion.php";

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
}

if (!isset($_SESSION["logged_in"])) {
    respuestas(401, "No autenticado", "Debes primero iniciar sesión", "error", []);
    exit;
}

$idAbono = isset($_GET['id_abono']) ? (int)$_GET['id_abono'] : 0;

if ($idAbono <= 0) {
    respuestas(400, 'Datos incompletos', 'Falta id_abono', 'warning', []);
    exit;
}

$sql = "
    SELECT
        CONCAT(e.nombre, ' ', e.ap_paterno, ' ', e.ap_materno) AS empleado,
        pa.id_abono,
        pa.monto_pago,
        pa.num_sem_pago,
        pa.anio_pago,
        pa.fecha_pago,
        p.folio,
        p.fecha_registro,
        dp.id_detalle,
        dp.detalle
    FROM prestamos_abonos pa
    INNER JOIN prestamos p ON pa.id_prestamo = p.id_prestamo
    INNER JOIN info_empleados e ON p.id_empleado = e.id_empleado
    INNER JOIN planes_pagos pp ON p.id_prestamo = pp.id_prestamo
    INNER JOIN detalle_planes dp ON dp.id_plan = pp.id_plan
    WHERE pa.id_abono = ?
    ORDER BY dp.id_detalle DESC
    LIMIT 1
";

$stmt = $conexion->prepare($sql);
if (!$stmt) {
    respuestas(500, 'Error', 'No se pudo preparar la consulta', 'error', []);
    exit;
}

$stmt->bind_param('i', $idAbono);
if (!$stmt->execute()) {
    respuestas(500, 'Error', 'No se pudo ejecutar la consulta', 'error', []);
    exit;
}

$result = $stmt->get_result();
if (!$result || $result->num_rows === 0) {
    respuestas(404, 'No encontrado', 'No se encontró el abono', 'info', []);
    exit;
}

$abono = $result->fetch_assoc();
$stmt->close();

respuestas(200, 'OK', 'Abono encontrado', 'success', $abono);