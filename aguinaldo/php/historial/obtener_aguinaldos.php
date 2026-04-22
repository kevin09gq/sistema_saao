<?php
require_once __DIR__ . '/../../../config/config.php';
require_once __DIR__ . "/../../../conexion/conexion.php";

function respuestas(int $code, array $data, int $total, int $pagina, int $limite)
{
    http_response_code($code);
    echo json_encode([
        "data"    => $data,
        "total"   => $total,
        "pagina"  => $pagina,
        "limite"  => $limite
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

function respuestaError(int $code, string $mensaje)
{
    http_response_code($code);
    echo json_encode([
        "error"   => true,
        "mensaje" => $mensaje,
        "data"    => [],
        "total"   => 0,
        "pagina"  => 1,
        "limite"  => 5
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Verificar sesión
if (!isset($_SESSION["logged_in"])) {
    respuestaError(401, "Debes primero iniciar sesión");
}

// Parámetros
$pagina       = isset($_GET["pagina"]) ? max(1, intval($_GET["pagina"])) : 1;
$limite       = isset($_GET["limite"]) ? intval($_GET["limite"]) : 10;
$busqueda     = isset($_GET["busqueda"]) ? trim($_GET["busqueda"]) : "";
$anio         = isset($_GET["anio"]) ? intval($_GET["anio"]) : -1;
$departamento = isset($_GET["departamento"]) ? intval($_GET["departamento"]) : -1;
$columna      = isset($_GET["columna"]) ? trim($_GET["columna"]) : "nombre";
$orden        = isset($_GET["orden"]) ? trim($_GET["orden"]) : "asc";

// Validar orden
if (!in_array(strtolower($orden), ['asc', 'desc'])) {
    $orden = 'asc';
}

// Validar columna
$columnasValidas = [
    "nombre"        => "e.nombre",
    "anio"          => "ae.anio",
    "dias"          => "ae.dias_trabajados",
    "sueldo"        => "ae.sueldo_diario",
    "aguinaldo"     => "ae.monto_aguinaldo",
    "fecha_pago"    => "ae.fecha_pago",
    "clave"         => "e.clave_empleado"
];
$columnaSQL = $columnasValidas[$columna] ?? "e.nombre";

// Si límite es -1, significa "Todos"
$limiteTodos = ($limite === -1);
$limite = $limiteTodos ? PHP_INT_MAX : max(1, $limite);

// Offset
$offset = ($pagina - 1) * $limite;

// Construcción del WHERE
$sqlBase = "FROM aguinaldo_empleado ae
            INNER JOIN info_empleados e ON ae.id_empleado = e.id_empleado
            INNER JOIN empresa em ON ae.id_empresa = em.id_empresa
            INNER JOIN areas a ON ae.id_area = a.id_area
            INNER JOIN departamentos d ON ae.id_departamento = d.id_departamento
            INNER JOIN puestos_especiales p ON ae.id_puestoEspecial = p.id_puestoEspecial
            WHERE 1=1";

$params = [];
$types  = "";

// Filtro búsqueda (clave, nombre, apellidos)
if (!empty($busqueda)) {
    $sqlBase .= " AND (
        e.clave_empleado LIKE ? OR 
        e.nombre LIKE ? OR 
        e.ap_paterno LIKE ? OR 
        e.ap_materno LIKE ? OR 
        CONCAT(e.nombre, ' ', e.ap_paterno, ' ', e.ap_materno) LIKE ?
    )";
    $busquedaParam = "%{$busqueda}%";
    $params = array_merge($params, array_fill(0, 5, $busquedaParam));
    $types .= "sssss";
}

// Filtro por año
if ($anio > 0) {
    $sqlBase .= " AND ae.anio = ?";
    $params[] = $anio;
    $types .= "i";
}

// Filtro por departamento
if ($departamento > 0) {
    $sqlBase .= " AND ae.id_departamento = ?";
    $params[] = $departamento;
    $types .= "i";
}

// Total registros
$sqlTotal = "SELECT COUNT(*) as total " . $sqlBase;
$stmtTotal = $conexion->prepare($sqlTotal);
if (!empty($params)) {
    $stmtTotal->bind_param($types, ...$params);
}
$stmtTotal->execute();
$resultTotal = $stmtTotal->get_result();
$total = $resultTotal->fetch_object()->total;

// Datos con paginación
$sqlDatos = "SELECT 
                ae.id_aguinaldo,
                e.clave_empleado,
                e.nombre,
                e.ap_paterno,
                e.ap_materno,
                a.nombre_area,
                d.nombre_departamento,
                p.nombre_puesto,
                ae.anio,
                ae.dias_trabajados,
                ae.sueldo_diario,
                ae.monto_aguinaldo,
                ae.fecha_pago,
                ae.fecha_registro
            " . $sqlBase . "
            ORDER BY $columnaSQL " . strtoupper($orden);

if (!$limiteTodos) {
    $sqlDatos .= " LIMIT ? OFFSET ?";
    $params[] = $limite;
    $params[] = $offset;
    $types .= "ii";
}

$stmtDatos = $conexion->prepare($sqlDatos);
if (!empty($params)) {
    $stmtDatos->bind_param($types, ...$params);
}
$stmtDatos->execute();
$resultDatos = $stmtDatos->get_result();

$data = [];
while ($row = $resultDatos->fetch_assoc()) {
    $data[] = $row;
}

// Respuesta
$limiteRespuesta = $limiteTodos ? -1 : $limite;
respuestas(200, $data, $total, $pagina, $limiteRespuesta);