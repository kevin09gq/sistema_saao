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
}

if (isset($_SESSION["logged_in"])) {

    // ===========================================
    // Obtener parámetros de búsqueda y paginación
    // ===========================================
    $busqueda = isset($_GET['busqueda']) ? trim((string)$_GET['busqueda']) : '';
    $departamento = isset($_GET['departamento']) ? (int)$_GET['departamento'] : -1;
    $estado = isset($_GET['estado']) ? trim((string)$_GET['estado']) : '-1';

    // ========================
    // Parámetros de paginación
    // ========================
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;

    if ($page < 1) {
        $page = 1;
    }
    if ($limit < 1) {
        $limit = 10;
    }
    if ($limit > 100) {
        $limit = 100;
    }

    $offset = ($page - 1) * $limit;

    $where = [];
    $params = [];
    $types = '';

    if ($busqueda !== '') {
        $where[] = "(e.clave_empleado LIKE ? OR CONCAT(e.nombre,' ',e.ap_paterno,' ',e.ap_materno) LIKE ?)";
        $like = '%' . $busqueda . '%';
        $params[] = $like;
        $params[] = $like;
        $types .= 'ss';
    }

    if ($departamento !== -1 && $departamento !== 0) {
        $where[] = "e.id_departamento = ?";
        $params[] = $departamento;
        $types .= 'i';
    }

    $whereSql = '';
    if (count($where) > 0) {
        $whereSql = 'WHERE ' . implode(' AND ', $where);
    }

    $havingSql = '';
    if ($estado === 'activo') {
        $havingSql = "HAVING (SUM(CASE WHEN p.estado = 'activo' THEN p.monto ELSE 0 END) - SUM(CASE WHEN p.estado = 'activo' THEN IFNULL(a.total_abonos,0) ELSE 0 END)) > 0";
    } elseif ($estado === 'liquidado') {
        $havingSql = "HAVING (SUM(CASE WHEN p.estado = 'activo' THEN p.monto ELSE 0 END) - SUM(CASE WHEN p.estado = 'activo' THEN IFNULL(a.total_abonos,0) ELSE 0 END)) <= 0 AND SUM(CASE WHEN p.estado = 'liquidado' THEN p.monto ELSE 0 END) > 0";
    }

    $baseSql = "
        FROM prestamos p
        INNER JOIN info_empleados e ON e.id_empleado = p.id_empleado
        LEFT JOIN departamentos d ON d.id_departamento = e.id_departamento
        LEFT JOIN (
            SELECT id_prestamo, SUM(monto_pago) AS total_abonos
            FROM prestamos_abonos
            GROUP BY id_prestamo
        ) a ON a.id_prestamo = p.id_prestamo
        $whereSql
        GROUP BY e.id_empleado
        $havingSql
    ";

    $countSql = "SELECT COUNT(*) AS total FROM (SELECT e.id_empleado $baseSql) t";
    $stmtCount = $conexion->prepare($countSql);
    if (!$stmtCount) {
        respuestas(500, 'Error', 'No se pudo preparar la consulta (count)', 'error', []);
        exit;
    }
    if ($types !== '') {
        $stmtCount->bind_param($types, ...$params);
    }
    if (!$stmtCount->execute()) {
        respuestas(500, 'Error', 'No se pudo ejecutar la consulta (count)', 'error', []);
        exit;
    }
    $resultCount = $stmtCount->get_result();
    $totalRows = 0;
    if ($resultCount && ($rowCount = $resultCount->fetch_assoc())) {
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
            e.id_empleado,
            e.clave_empleado,
            CONCAT(e.nombre,' ',e.ap_paterno,' ',e.ap_materno) AS empleado,
            e.id_departamento,
            d.nombre_departamento,
            SUM(CASE WHEN p.estado = 'activo' THEN p.monto ELSE 0 END) AS prestamo_activo,
            SUM(CASE WHEN p.estado = 'liquidado' THEN p.monto ELSE 0 END) AS prestamo_liquidado,
            SUM(CASE WHEN p.estado = 'activo' THEN IFNULL(a.total_abonos,0) ELSE 0 END) AS abonado_activo,
            SUM(CASE WHEN p.estado = 'liquidado' THEN IFNULL(a.total_abonos,0) ELSE 0 END) AS abonado_liquidado
        $baseSql
        ORDER BY empleado ASC
        LIMIT ? OFFSET ?
    ";

    $stmt = $conexion->prepare($sql);
    if (!$stmt) {
        respuestas(500, 'Error', 'No se pudo preparar la consulta', 'error', []);
        exit;
    }

    $typesList = $types . 'ii';
    $paramsList = $params;
    $paramsList[] = $limit;
    $paramsList[] = $offset;
    $stmt->bind_param($typesList, ...$paramsList);

    if (!$stmt->execute()) {
        respuestas(500, 'Error', 'No se pudo ejecutar la consulta', 'error', []);
        exit;
    }

    $result = $stmt->get_result();
    $items = [];
    while ($row = $result->fetch_assoc()) {
        $prestamoActivo = (float)$row['prestamo_activo'];
        $abonadoActivo = (float)$row['abonado_activo'];
        $deudaActiva = $prestamoActivo - $abonadoActivo;

        $prestamoLiquidado = (float)$row['prestamo_liquidado'];
        $abonadoLiquidado = (float)$row['abonado_liquidado'];
        $deudaLiquidada = $prestamoLiquidado - $abonadoLiquidado;

        $estadoEmpleado = ($deudaActiva > 0.00001) ? 'activo' : 'liquidado';

        // Totales a mostrar: si está activo, mostrar solo activos; si no, mostrar lo liquidado
        if ($estadoEmpleado === 'activo') {
            $prestamoMostrar = $prestamoActivo;
            $abonadoMostrar = $abonadoActivo;
            $deudaMostrar = $deudaActiva;
        } else {
            $prestamoMostrar = $prestamoLiquidado;
            $abonadoMostrar = $abonadoLiquidado;
            $deudaMostrar = $deudaLiquidada;
            if ($deudaMostrar < 0) {
                $deudaMostrar = 0;
            }
        }

        $items[] = [
            'id_empleado' => (int)$row['id_empleado'],
            'clave_empleado' => $row['clave_empleado'],
            'empleado' => $row['empleado'],
            'id_departamento' => $row['id_departamento'] !== null ? (int)$row['id_departamento'] : null,
            'nombre_departamento' => $row['nombre_departamento'],
            'prestamo' => round($prestamoMostrar, 2),
            'abonado' => round($abonadoMostrar, 2),
            'deuda' => round($deudaMostrar, 2),
            'estado' => $estadoEmpleado
        ];
    }

    $stmt->close();

    respuestas(200, 'OK', 'Listado de préstamos', 'success', [
        'items' => $items,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total_rows' => $totalRows,
            'total_pages' => $totalPages
        ]
    ]);

} else {
    respuestas(401, "No autenticado", "Debes primero iniciar sesión", "error", []);
    exit;
}