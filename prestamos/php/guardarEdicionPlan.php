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

$idPlan = isset($_POST['id_plan']) ? (int)$_POST['id_plan'] : 0;
$idDetalle = isset($_POST['id_detalle']) ? (int)$_POST['id_detalle'] : 0;
$detalleJson = isset($_POST['detalle']) ? (string)$_POST['detalle'] : '';

if ($idPlan <= 0 || $idDetalle <= 0) {
    respuestas(400, 'Datos incompletos', 'Falta id_plan o id_detalle', 'warning', []);
    exit;
}
if ($detalleJson === '') {
    respuestas(400, 'Datos incompletos', 'Falta detalle', 'warning', []);
    exit;
}

$detalle = json_decode($detalleJson, true);
if (!is_array($detalle)) {
    respuestas(400, 'JSON inválido', 'El detalle no es un JSON válido', 'warning', []);
    exit;
}

// Obtener monto del préstamo para validar sumas
$sqlMonto = "
    SELECT p.monto
    FROM planes_pagos pp
    INNER JOIN prestamos p ON p.id_prestamo = pp.id_prestamo
    WHERE pp.id_plan = ?
    LIMIT 1
";
$stmtMonto = $conexion->prepare($sqlMonto);
if (!$stmtMonto) {
    respuestas(500, 'Error', 'No se pudo preparar la consulta de monto', 'error', []);
    exit;
}
$stmtMonto->bind_param('i', $idPlan);
if (!$stmtMonto->execute()) {
    respuestas(500, 'Error', 'No se pudo ejecutar la consulta de monto', 'error', []);
    exit;
}
$resMonto = $stmtMonto->get_result();
$rowMonto = $resMonto ? ($resMonto->fetch_assoc() ?? null) : null;
$stmtMonto->close();

if (!$rowMonto) {
    respuestas(404, 'No encontrado', 'No se encontró el plan para validar el monto', 'info', []);
    exit;
}
$montoPrestamo = (float)$rowMonto['monto'];

// Validar estructura y que NO se modifiquen filas no pendientes
$sqlOriginal = "
    SELECT detalle
    FROM detalle_planes
    WHERE id_detalle = ? AND id_plan = ?
    LIMIT 1
";
$stmtOrig = $conexion->prepare($sqlOriginal);
if (!$stmtOrig) {
    respuestas(500, 'Error', 'No se pudo preparar la consulta del detalle original', 'error', []);
    exit;
}
$stmtOrig->bind_param('ii', $idDetalle, $idPlan);
if (!$stmtOrig->execute()) {
    respuestas(500, 'Error', 'No se pudo ejecutar la consulta del detalle original', 'error', []);
    exit;
}
$resOrig = $stmtOrig->get_result();
$rowOrig = $resOrig ? ($resOrig->fetch_assoc() ?? null) : null;
$stmtOrig->close();

if (!$rowOrig) {
    respuestas(404, 'No encontrado', 'No se encontró el detalle original del plan', 'info', []);
    exit;
}

$detalleOriginal = json_decode((string)$rowOrig['detalle'], true);
if (!is_array($detalleOriginal)) {
    respuestas(500, 'Error', 'El detalle original no es un JSON válido', 'error', []);
    exit;
}

function norm_estado($v) {
    return strtolower(trim((string)$v));
}

function norm_float2($v) {
    return round((float)$v, 2);
}

function norm_int($v) {
    return (int)$v;
}

function norm_str($v) {
    return trim((string)$v);
}

function norm_nullable_str($v) {
    if ($v === null) return '';
    return trim((string)$v);
}

// Index original por (semana-anio) para comparar no pendientes
$origByKey = [];
foreach ($detalleOriginal as $row) {
    $key = ((string)($row['num_semana'] ?? '')) . '-' . ((string)($row['anio'] ?? ''));
    $origByKey[$key] = $row;
}

$sum = 0.0;
foreach ($detalle as $row) {
    $monto = (float)($row['monto_semanal'] ?? 0);
    $sum += $monto;

    $semana = (int)($row['num_semana'] ?? 0);
    $anio = (int)($row['anio'] ?? 0);
    if ($semana < 1 || $semana > 52 || $anio < 2000) {
        respuestas(400, 'Datos inválidos', 'Semana o año inválidos en el detalle', 'warning', []);
        exit;
    }

    $estado = norm_estado($row['estado'] ?? '');
    if ($estado !== 'pendiente' && $estado !== 'pagado' && $estado !== 'pausado') {
        respuestas(400, 'Datos inválidos', 'Estado inválido en el detalle', 'warning', []);
        exit;
    }

    $key = ((string)$semana) . '-' . ((string)$anio);

    // Validar que NO se modifiquen filas que en BD ya estaban Pagado/Pausado (aunque el request mande otro estado)
    if (isset($origByKey[$key])) {
        $orig = $origByKey[$key];
        $origEstado = norm_estado($orig['estado'] ?? '');
        if ($origEstado !== 'pendiente') {
            $aMonto = norm_float2($row['monto_semanal'] ?? 0);
            $bMonto = norm_float2($orig['monto_semanal'] ?? 0);

            $aSemana = norm_int($row['num_semana'] ?? 0);
            $bSemana = norm_int($orig['num_semana'] ?? 0);

            $aAnio = norm_int($row['anio'] ?? 0);
            $bAnio = norm_int($orig['anio'] ?? 0);

            $aFecha = norm_nullable_str($row['fecha_pago'] ?? null);
            $bFecha = norm_nullable_str($orig['fecha_pago'] ?? null);

            $aObs = norm_nullable_str($row['observacion'] ?? null);
            $bObs = norm_nullable_str($orig['observacion'] ?? null);

            $aIdAbono = norm_nullable_str($row['id_abono'] ?? null);
            $bIdAbono = norm_nullable_str($orig['id_abono'] ?? null);

            $aEstado = norm_estado($row['estado'] ?? '');
            $bEstado = $origEstado;

            if (
                $aMonto !== $bMonto ||
                $aSemana !== $bSemana ||
                $aAnio !== $bAnio ||
                $aFecha !== $bFecha ||
                $aObs !== $bObs ||
                $aIdAbono !== $bIdAbono ||
                $aEstado !== $bEstado
            ) {
                respuestas(409, 'No permitido', 'No se pueden modificar filas ya pagadas o pausadas', 'warning', []);
                exit;
            }
        }
    }
}

$sum = round($sum, 2);
$montoPrestamo = round($montoPrestamo, 2);

if ($sum > $montoPrestamo) {
    respuestas(400, 'Validación', 'La suma del detalle excede el monto del préstamo', 'warning', [
        'suma' => $sum,
        'monto_prestamo' => $montoPrestamo
    ]);
    exit;
}
if ($sum !== $montoPrestamo) {
    respuestas(400, 'Validación', 'La suma del detalle debe ser exactamente igual al monto del préstamo', 'warning', [
        'suma' => $sum,
        'monto_prestamo' => $montoPrestamo
    ]);
    exit;
}

$nuevoDetalle = json_encode($detalle, JSON_UNESCAPED_UNICODE);
if ($nuevoDetalle === false) {
    respuestas(500, 'Error', 'No se pudo serializar el detalle', 'error', []);
    exit;
}

// Obtener la última fila del detalle para actualizar sem_fin y anio_fin en planes_pagos
$lastRow = end($detalle);
$semFin = isset($lastRow['num_semana']) ? (int)$lastRow['num_semana'] : 0;
$anioFin = isset($lastRow['anio']) ? (int)$lastRow['anio'] : 0;

// Iniciar transacción para asegurar integridad
$conexion->begin_transaction();

try {
    // 1. Actualizar el detalle del plan
    $stmtUpd = $conexion->prepare("UPDATE detalle_planes SET detalle = ? WHERE id_detalle = ? AND id_plan = ?");
    if (!$stmtUpd) {
        throw new Exception('No se pudo preparar el update del detalle');
    }
    $stmtUpd->bind_param('sii', $nuevoDetalle, $idDetalle, $idPlan);
    if (!$stmtUpd->execute()) {
        throw new Exception('No se pudo actualizar el detalle');
    }
    $stmtUpd->close();

    // 2. Actualizar sem_fin y anio_fin en planes_pagos
    if ($semFin > 0 && $anioFin > 0) {
        $stmtPlan = $conexion->prepare("UPDATE planes_pagos SET sem_fin = ?, anio_fin = ? WHERE id_plan = ?");
        if (!$stmtPlan) {
            throw new Exception('No se pudo preparar el update del plan');
        }
        $stmtPlan->bind_param('iii', $semFin, $anioFin, $idPlan);
        if (!$stmtPlan->execute()) {
            throw new Exception('No se pudo actualizar el plan de pagos');
        }
        $stmtPlan->close();
    }

    // Confirmar transacción
    $conexion->commit();
    respuestas(200, 'OK', 'Plan actualizado', 'success', [
        'sem_fin' => $semFin,
        'anio_fin' => $anioFin
    ]);

} catch (Exception $e) {
    $conexion->rollback();
    respuestas(500, 'Error', $e->getMessage(), 'error', []);
    exit;
}
