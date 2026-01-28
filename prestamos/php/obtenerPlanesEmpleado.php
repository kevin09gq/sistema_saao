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

$idEmpleado = isset($_GET['id_empleado']) ? (int)$_GET['id_empleado'] : 0;
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 5;

if ($idEmpleado <= 0) {
    respuestas(400, 'Datos incompletos', 'Falta id_empleado', 'warning', []);
    exit;
}
if ($page < 1) {
    $page = 1;
}
if ($limit < 1) {
    $limit = 5;
}
if ($limit > 100) {
    $limit = 100;
}
$offset = ($page - 1) * $limit;

$countSql = "
    SELECT COUNT(*) AS total
    FROM planes_pagos pp
    INNER JOIN prestamos p ON p.id_prestamo = pp.id_prestamo
    WHERE p.id_empleado = ?
";
$stmtCount = $conexion->prepare($countSql);
if (!$stmtCount) {
    respuestas(500, 'Error', 'No se pudo preparar la consulta (count)', 'error', []);
    exit;
}
$stmtCount->bind_param('i', $idEmpleado);
if (!$stmtCount->execute()) {
    respuestas(500, 'Error', 'No se pudo ejecutar la consulta (count)', 'error', []);
    exit;
}
$resCount = $stmtCount->get_result();
$totalRows = 0;
if ($resCount && ($rowCount = $resCount->fetch_assoc())) {
    $totalRows = (int)$rowCount['total'];
}
$stmtCount->close();

$totalPages = (int)ceil($totalRows / $limit);
if ($totalPages < 1) {
    $totalPages = 1;
}
if ($page > $totalPages) {
    $page = $totalPages;
    $offset = ($page - 1) * $limit;
}

$sql = "
    SELECT
        pp.id_plan,
        pp.id_prestamo,
        p.folio,
        pp.sem_inicio,
        pp.anio_inicio,
        pp.sem_fin,
        pp.anio_fin,
        pp.fecha_registro,
        DATE_FORMAT(pp.fecha_registro, '%d/%m/%Y') AS fecha_registro_procesada,
        dp.detalle
    FROM planes_pagos pp
    INNER JOIN prestamos p ON p.id_prestamo = pp.id_prestamo
    LEFT JOIN detalle_planes dp ON dp.id_plan = pp.id_plan
    WHERE p.id_empleado = ?
    ORDER BY pp.fecha_registro DESC
    LIMIT ? OFFSET ?
";

$stmt = $conexion->prepare($sql);
if (!$stmt) {
    respuestas(500, 'Error', 'No se pudo preparar la consulta', 'error', []);
    exit;
}
$stmt->bind_param('iii', $idEmpleado, $limit, $offset);
if (!$stmt->execute()) {
    respuestas(500, 'Error', 'No se pudo ejecutar la consulta', 'error', []);
    exit;
}
$result = $stmt->get_result();
$items = [];
while ($row = $result->fetch_assoc()) {
    $items[] = [
        'id_plan' => (int)$row['id_plan'],
        'id_prestamo' => (int)$row['id_prestamo'],
        'folio' => $row['folio'],
        'sem_inicio' => (int)$row['sem_inicio'],
        'anio_inicio' => (int)$row['anio_inicio'],
        'sem_fin' => (int)$row['sem_fin'],
        'anio_fin' => (int)$row['anio_fin'],
        'fecha_registro' => $row['fecha_registro'],
        'fecha_registro_procesada' => $row['fecha_registro_procesada'],
        'detalle' => json_decode($row['detalle'], true)
    ];
}
$stmt->close();

respuestas(200, 'OK', 'Planes de pago del empleado', 'success', [
    'items' => $items,
    'pagination' => [
        'page' => $page,
        'limit' => $limit,
        'total_rows' => $totalRows,
        'total_pages' => $totalPages
    ]
]);
