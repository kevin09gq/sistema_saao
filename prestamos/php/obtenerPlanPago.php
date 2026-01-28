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

$idPlan = isset($_GET['id_plan']) ? (int)$_GET['id_plan'] : 0;
if ($idPlan <= 0) {
    respuestas(400, 'Datos incompletos', 'Falta id_plan', 'warning', []);
    exit;
}

$sql = "
    SELECT
        pp.id_plan,
        pp.id_prestamo,
        pp.sem_inicio,
        pp.anio_inicio,
        pp.sem_fin,
        pp.anio_fin,
        pp.fecha_registro AS fecha_registro_plan,
        p.folio,
        p.monto,
        p.fecha_registro AS fecha_prestamo,
        p.estado AS estado_prestamo,
        e.id_empleado,
        CONCAT(e.nombre,' ',e.ap_paterno,' ',e.ap_materno) AS empleado,
        e.clave_empleado,
        d.nombre_departamento,
        emp.nombre_empresa
    FROM planes_pagos pp
    INNER JOIN prestamos p ON p.id_prestamo = pp.id_prestamo
    INNER JOIN info_empleados e ON e.id_empleado = p.id_empleado
    LEFT JOIN departamentos d ON d.id_departamento = e.id_departamento
    LEFT JOIN empresa emp ON emp.id_empresa = e.id_empresa
    WHERE pp.id_plan = ?
    LIMIT 1
";

$stmt = $conexion->prepare($sql);
if (!$stmt) {
    respuestas(500, 'Error', 'No se pudo preparar la consulta', 'error', []);
    exit;
}
$stmt->bind_param('i', $idPlan);
if (!$stmt->execute()) {
    respuestas(500, 'Error', 'No se pudo ejecutar la consulta', 'error', []);
    exit;
}
$res = $stmt->get_result();
$plan = $res ? ($res->fetch_assoc() ?? null) : null;
$stmt->close();

if (!$plan) {
    respuestas(404, 'No encontrado', 'No se encontró el plan solicitado', 'info', []);
    exit;
}

$sqlDet = "
    SELECT id_detalle, detalle
    FROM detalle_planes
    WHERE id_plan = ?
    ORDER BY id_detalle DESC
    LIMIT 1
";
$stmtDet = $conexion->prepare($sqlDet);
if (!$stmtDet) {
    respuestas(500, 'Error', 'No se pudo preparar la consulta del detalle', 'error', []);
    exit;
}
$stmtDet->bind_param('i', $idPlan);
if (!$stmtDet->execute()) {
    respuestas(500, 'Error', 'No se pudo ejecutar la consulta del detalle', 'error', []);
    exit;
}
$resDet = $stmtDet->get_result();
$detalleRow = $resDet ? ($resDet->fetch_assoc() ?? null) : null;
$stmtDet->close();

if (!$detalleRow) {
    respuestas(404, 'Sin detalle', 'No se encontró detalle del plan', 'info', []);
    exit;
}

$detalle = json_decode((string)$detalleRow['detalle'], true);
if (!is_array($detalle)) {
    $detalle = [];
}

respuestas(200, 'OK', 'Plan obtenido', 'success', [
    'plan' => $plan,
    'detalle' => $detalle,
    'id_detalle' => (int)$detalleRow['id_detalle']
]);
