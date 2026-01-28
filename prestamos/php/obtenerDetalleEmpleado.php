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
if ($idEmpleado <= 0) {
    respuestas(400, 'Datos incompletos', 'Falta id_empleado', 'warning', []);
    exit;
}

$sqlEmpleado = "
    SELECT
        e.id_empleado,
        e.clave_empleado,
        CONCAT(e.nombre,' ',e.ap_paterno,' ',e.ap_materno) AS empleado,
        e.id_departamento,
        d.nombre_departamento,
        e.id_empresa,
        emp.nombre_empresa
    FROM info_empleados e
    LEFT JOIN departamentos d ON d.id_departamento = e.id_departamento
    LEFT JOIN empresa emp ON emp.id_empresa = e.id_empresa
    WHERE e.id_empleado = ?
    LIMIT 1
";

$stmtEmp = $conexion->prepare($sqlEmpleado);
if (!$stmtEmp) {
    respuestas(500, 'Error', 'No se pudo preparar la consulta de empleado', 'error', []);
    exit;
}
$stmtEmp->bind_param('i', $idEmpleado);
if (!$stmtEmp->execute()) {
    respuestas(500, 'Error', 'No se pudo ejecutar la consulta de empleado', 'error', []);
    exit;
}
$resEmp = $stmtEmp->get_result();
$empleado = $resEmp ? ($resEmp->fetch_assoc() ?? null) : null;
$stmtEmp->close();

if (!$empleado) {
    respuestas(404, 'No encontrado', 'Empleado no encontrado', 'info', []);
    exit;
}

$sqlHistorico = "
    SELECT
        IFNULL(SUM(p.monto), 0) AS total_prestado,
        IFNULL(SUM(CASE WHEN p.estado IN ('activo','pausado') THEN p.monto ELSE 0 END), 0) AS prestamo_activo,
        IFNULL(SUM(CASE WHEN p.estado IN ('activo','pausado') THEN IFNULL(a.total_abonos,0) ELSE 0 END), 0) AS abonado_activo
    FROM prestamos p
    LEFT JOIN (
        SELECT id_prestamo, SUM(monto_pago) AS total_abonos
        FROM prestamos_abonos
        GROUP BY id_prestamo
    ) a ON a.id_prestamo = p.id_prestamo
    WHERE p.id_empleado = ?
";

$stmtHis = $conexion->prepare($sqlHistorico);
if (!$stmtHis) {
    respuestas(500, 'Error', 'No se pudo preparar la consulta de histórico', 'error', []);
    exit;
}
$stmtHis->bind_param('i', $idEmpleado);
if (!$stmtHis->execute()) {
    respuestas(500, 'Error', 'No se pudo ejecutar la consulta de histórico', 'error', []);
    exit;
}
$resHis = $stmtHis->get_result();
$historico = $resHis ? ($resHis->fetch_assoc() ?? []) : [];
$stmtHis->close();

$totalPrestado = (float)($historico['total_prestado'] ?? 0);
$prestamoActivo = (float)($historico['prestamo_activo'] ?? 0);
$abonadoActivo = (float)($historico['abonado_activo'] ?? 0);
$deudaActiva = $prestamoActivo - $abonadoActivo;
if ($deudaActiva < 0) {
    $deudaActiva = 0;
}

respuestas(200, 'OK', 'Detalle del empleado', 'success', [
    'empleado' => $empleado,
    'historico' => [
        'total_prestado' => round($totalPrestado, 2),
        'deuda_activa' => round($deudaActiva, 2)
    ]
]);
