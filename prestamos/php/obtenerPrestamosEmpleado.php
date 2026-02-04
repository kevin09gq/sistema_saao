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

$where = " WHERE p.id_empleado = ?";
$typesCount = 'i';
$paramsCount = [$idEmpleado];
if ($busqueda !== '') {
    $like = '%' . $busqueda . '%';
    $where .= " AND (p.folio LIKE ? OR p.estado LIKE ?)";
    $typesCount .= 'ss';
    $paramsCount[] = $like;
    $paramsCount[] = $like;
}

$countSql = "SELECT COUNT(*) AS total FROM prestamos p" . $where;
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
        p.id_prestamo,
        p.folio,
        p.monto,
        p.semana,
        p.anio,
        p.fecha_registro,
        p.estado,
        IFNULL(a.total_abonos,0) AS total_abonos,
        (p.monto - IFNULL(a.total_abonos,0)) AS deuda
    FROM prestamos p
    LEFT JOIN (
        SELECT id_prestamo, SUM(monto_pago) AS total_abonos
        FROM prestamos_abonos
        GROUP BY id_prestamo
    ) a ON a.id_prestamo = p.id_prestamo
";

$sql .= $where;
$sql .= " ORDER BY p.fecha_registro " . strtoupper($orden);

$types = $typesCount;
$params = $paramsCount;

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
    $items[] = [
        'id_prestamo' => (int)$row['id_prestamo'],
        'folio' => $row['folio'],
        'monto' => round((float)$row['monto'], 2),
        'fecha_registro' => $row['fecha_registro'],
        'estado' => $row['estado'],
        'abonado' => round((float)$row['total_abonos'], 2),
        'deuda' => round((float)$row['deuda'], 2)
    ];
}
$stmt->close();

respuestas(200, 'OK', 'Préstamos del empleado', 'success', [
    'items' => $items,
    'pagination' => [
        'page' => $page,
        'limit' => $limit,
        'total_rows' => $totalRows,
        'total_pages' => $totalPages
    ]
]);
