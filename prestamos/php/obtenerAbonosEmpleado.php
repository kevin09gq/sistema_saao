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

function bindParams(mysqli_stmt $stmt, string $types, array &$params)
{
    $bind = [];
    $bind[] = &$types;
    foreach ($params as $k => $v) {
        $bind[] = &$params[$k];
    }
    call_user_func_array([$stmt, 'bind_param'], $bind);
}

if (!isset($_SESSION["logged_in"])) {
    respuestas(401, "No autenticado", "Debes primero iniciar sesión", "error", []);
    exit;
}

$idEmpleado = isset($_GET['id_empleado']) ? (int)$_GET['id_empleado'] : 0;
$page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
$limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 5;
$orden = isset($_GET['orden']) ? strtolower(trim((string)$_GET['orden'])) : 'desc';
$busqueda = isset($_GET['busqueda']) ? trim((string)$_GET['busqueda']) : '';

if ($idEmpleado <= 0) {
    respuestas(400, 'Datos incompletos', 'Falta id_empleado', 'warning', []);
    exit;
}

if ($orden !== 'asc' && $orden !== 'desc') {
    $orden = 'desc';
}

$useLimit = true;
if ($limit === -1) {
    $useLimit = false;
} else {
    if ($limit < 1) {
        $limit = 5;
    }
    if ($limit > 100) {
        $limit = 100;
    }
}

if ($page < 1) {
    $page = 1;
}
if (!$useLimit) {
    $page = 1;
}

$offset = 0;
if ($useLimit) {
    $offset = ($page - 1) * $limit;
}

$countSql = "
    SELECT COUNT(*) AS total
    FROM prestamos_abonos pa
    INNER JOIN prestamos p ON p.id_prestamo = pa.id_prestamo
    WHERE p.id_empleado = ?
";
$typesCount = 'i';
$paramsCount = [$idEmpleado];
if ($busqueda !== '') {
    $like = '%' . $busqueda . '%';
    $countSql .= " AND (p.folio LIKE ? OR CONCAT(pa.num_sem_pago, ' / ', pa.anio_pago) LIKE ? OR pa.monto_pago LIKE ? OR pa.fecha_pago LIKE ?)";
    $typesCount .= 'ssss';
    $paramsCount[] = $like;
    $paramsCount[] = $like;
    $paramsCount[] = $like;
    $paramsCount[] = $like;
}
$stmtCount = $conexion->prepare($countSql);
if (!$stmtCount) {
    respuestas(500, 'Error', 'No se pudo preparar la consulta (count)', 'error', []);
    exit;
}
bindParams($stmtCount, $typesCount, $paramsCount);
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

$totalPages = 1;
if ($useLimit) {
    $totalPages = (int)ceil($totalRows / $limit);
    if ($totalPages < 1) {
        $totalPages = 1;
    }
    if ($page > $totalPages) {
        $page = $totalPages;
        $offset = ($page - 1) * $limit;
    }
}

$sql = "
    SELECT
        pa.id_abono,
        p.id_prestamo,
        p.folio,
        pa.monto_pago,
        pa.fecha_pago,
        CONCAT(pa.num_sem_pago, ' / ', pa.anio_pago) AS semana_pago,
        pa.es_nomina,
        pa.pausado,
        pa.num_sem_pago,
        pa.anio_pago
    FROM prestamos_abonos pa
    INNER JOIN prestamos p ON p.id_prestamo = pa.id_prestamo

    WHERE p.id_empleado = ?
";

$types = 'i';
$params = [$idEmpleado];

if ($busqueda !== '') {
    $like = '%' . $busqueda . '%';
    $sql .= " AND (p.folio LIKE ? OR CONCAT(pa.num_sem_pago, ' / ', pa.anio_pago) LIKE ? OR pa.monto_pago LIKE ? OR pa.fecha_pago LIKE ?)";
    $types .= 'ssss';
    $params[] = $like;
    $params[] = $like;
    $params[] = $like;
    $params[] = $like;
}

$sql .= " ORDER BY pa.fecha_pago " . strtoupper($orden);

if ($useLimit) {
    $sql .= " LIMIT ? OFFSET ?";
    $types .= 'ii';
    $params[] = $limit;
    $params[] = $offset;
}

$sql .= "\n";

$stmt = $conexion->prepare($sql);
if (!$stmt) {
    respuestas(500, 'Error', 'No se pudo preparar la consulta', 'error', []);
    exit;
}
bindParams($stmt, $types, $params);
if (!$stmt->execute()) {
    respuestas(500, 'Error', 'No se pudo ejecutar la consulta', 'error', []);
    exit;
}
$result = $stmt->get_result();
$items = [];
while ($row = $result->fetch_assoc()) {
    // Obtener la observación del detalle del plan para esta semana/año
    $observacion = '';
    $idPrestamo = (int)$row['id_prestamo'];
    $numSemPago = (int)$row['num_sem_pago'];
    $anioPago = (int)$row['anio_pago'];
    
    $sqlObs = "
        SELECT dp.detalle
        FROM detalle_planes dp
        INNER JOIN planes_pagos pp ON pp.id_plan = dp.id_plan
        WHERE pp.id_prestamo = ?
        ORDER BY dp.id_detalle DESC
        LIMIT 1
    ";
    $stmtObs = $conexion->prepare($sqlObs);
    if ($stmtObs) {
        $stmtObs->bind_param('i', $idPrestamo);
        if ($stmtObs->execute()) {
            $resObs = $stmtObs->get_result();
            if ($rowObs = $resObs->fetch_assoc()) {
                $detalle = json_decode($rowObs['detalle'], true);
                if (is_array($detalle)) {
                    foreach ($detalle as $d) {
                        if (isset($d['num_semana']) && isset($d['anio']) && 
                            (int)$d['num_semana'] === $numSemPago && (int)$d['anio'] === $anioPago) {
                            $observacion = isset($d['observacion']) ? (string)$d['observacion'] : '';
                            break;
                        }
                    }
                }
            }
        }
        $stmtObs->close();
    }
    
    $items[] = [
        'id_abono' => (int)$row['id_abono'],
        'id_prestamo' => (int)$row['id_prestamo'],
        'folio' => $row['folio'],
        'semana_pago' => $row['semana_pago'],
        'monto_pago' => round((float)$row['monto_pago'], 2),
        'fecha_pago' => $row['fecha_pago'],
        'es_nomina' => (int)$row['es_nomina'],
        'pausado' => (int)$row['pausado'],
        'observacion' => $observacion
    ];
}
$stmt->close();

respuestas(200, 'OK', 'Abonos del empleado', 'success', [
    'items' => $items,
    'pagination' => [
        'page' => $page,
        'limit' => $limit,
        'total_rows' => $totalRows,
        'total_pages' => $totalPages
    ]
]);
