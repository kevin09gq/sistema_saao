<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . "/../../conexion/conexion.php";

// Respuesta
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

// Obtener parámetros de paginación y filtros
$pagina = isset($_GET["pagina"]) ? max(1, intval($_GET["pagina"])) : 1;
$limite = isset($_GET["limite"]) ? intval($_GET["limite"]) : 5;
$busqueda = isset($_GET["busqueda"]) ? trim($_GET["busqueda"]) : "";
$departamento = isset($_GET["departamento"]) ? intval($_GET["departamento"]) : -1;
$orden = isset($_GET["orden"]) ? trim($_GET["orden"]) : "desc";

// Validar orden
if (!in_array($orden, ['asc', 'desc'])) {
    $orden = 'desc';
}

// Si límite es -1, significa "Todos"
$limiteTodos = ($limite === -1);
$limite = $limiteTodos ? PHP_INT_MAX : max(1, $limite);

// Calcular offset
$offset = ($pagina - 1) * $limite;

// Construir la consulta base
$sqlBase = "FROM historiales_autorizaciones ha
            INNER JOIN claves_autorizacion ca ON ha.id_clave = ca.id_autorizacion
            INNER JOIN info_empleados ie ON ca.id_empleado = ie.id_empleado
            INNER JOIN departamentos d ON ie.id_departamento = d.id_departamento
            WHERE 1=1";

$params = [];
$types = "";

// Filtro por búsqueda (nombre, apellidos o motivo)
if (!empty($busqueda)) {
    $sqlBase .= " AND (
        ie.nombre LIKE ? OR 
        ie.ap_paterno LIKE ? OR 
        ie.ap_materno LIKE ? OR 
        CONCAT(ie.nombre, ' ', ie.ap_paterno, ' ', ie.ap_materno) LIKE ? OR
        ha.motivo LIKE ?
    )";
    $busquedaParam = "%{$busqueda}%";
    $params[] = $busquedaParam;
    $params[] = $busquedaParam;
    $params[] = $busquedaParam;
    $params[] = $busquedaParam;
    $params[] = $busquedaParam;
    $types .= "sssss";
}

// Filtro por departamento
if ($departamento > 0) {
    $sqlBase .= " AND ie.id_departamento = ?";
    $params[] = $departamento;
    $types .= "i";
}

// Obtener el total de registros
$sqlTotal = "SELECT COUNT(*) as total " . $sqlBase;
$stmtTotal = $conexion->prepare($sqlTotal);

if (!empty($params)) {
    $stmtTotal->bind_param($types, ...$params);
}

$stmtTotal->execute();
$resultTotal = $stmtTotal->get_result();
$total = $resultTotal->fetch_object()->total;

// Obtener los registros con paginación
$sqlDatos = "SELECT 
                ha.id,
                ha.motivo,
                ha.fecha,
                CONCAT(ie.nombre, ' ', ie.ap_paterno, ' ', ie.ap_materno) as nombre_completo,
                d.nombre_departamento
            " . $sqlBase . "
            ORDER BY ha.fecha " . strtoupper($orden);

// Solo agregar LIMIT si no es "Todos"
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
    $data[] = [
        "id"                 => $row["id"],
        "motivo"             => $row["motivo"],
        "nombre_completo"    => $row["nombre_completo"],
        "nombre_departamento" => $row["nombre_departamento"],
        "fecha"              => $row["fecha"]
    ];
}

// Enviar respuesta
$limiteRespuesta = $limiteTodos ? -1 : $limite;
respuestas(200, $data, $total, $pagina, $limiteRespuesta);