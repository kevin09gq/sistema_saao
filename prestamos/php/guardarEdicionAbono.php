<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . "/../../conexion/conexion.php";

function respuestas(int $code, string $titulo, string $mensaje, string $icono, array $data = [])
{
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode([
        "titulo"  => $titulo,
        "mensaje" => $mensaje,
        "icono"   => $icono,
        "data"    => $data
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if (!isset($_SESSION["logged_in"])) {
    respuestas(401, "No autenticado", "Debes primero iniciar sesión", "error");
}

// Verificar método POST
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    respuestas(405, "Método no permitido", "Solo se permite el método POST", "error");
}

$idAbono = isset($_POST['id_abono']) ? (int)$_POST['id_abono'] : 0;
$fechaPago = isset($_POST['fecha_pago']) ? trim((string)$_POST['fecha_pago']) : '';

if ($idAbono <= 0) {
    respuestas(400, 'Datos incompletos', 'Falta id_abono', 'warning');
}

if ($fechaPago === '') {
    respuestas(400, 'Datos incompletos', 'Falta fecha_pago', 'warning');
}

// Convertir fecha de formato datetime-local (YYYY-MM-DDTHH:MM) a formato MySQL (YYYY-MM-DD HH:MM:SS)
$fechaPago = str_replace('T', ' ', $fechaPago) . ':00';

// Validar que el abono exista
$sqlVerificar = "SELECT id_abono FROM prestamos_abonos WHERE id_abono = ?";
$stmtVerificar = $conexion->prepare($sqlVerificar);
if (!$stmtVerificar) {
    respuestas(500, 'Error', 'No se pudo preparar la consulta de verificación', 'error');
}

$stmtVerificar->bind_param('i', $idAbono);
if (!$stmtVerificar->execute()) {
    respuestas(500, 'Error', 'No se pudo verificar el abono', 'error');
}

$resVerificar = $stmtVerificar->get_result();
if (!$resVerificar || $resVerificar->num_rows === 0) {
    respuestas(404, 'No encontrado', 'El abono no existe', 'info');
}
$stmtVerificar->close();

// Actualizar la fecha de pago
$sqlUpdate = "UPDATE prestamos_abonos SET fecha_pago = ? WHERE id_abono = ?";
$stmtUpdate = $conexion->prepare($sqlUpdate);
if (!$stmtUpdate) {
    respuestas(500, 'Error', 'No se pudo preparar la actualización', 'error');
}

$stmtUpdate->bind_param('si', $fechaPago, $idAbono);
if (!$stmtUpdate->execute()) {
    respuestas(500, 'Error', 'No se pudo actualizar el abono', 'error');
}

$stmtUpdate->close();

respuestas(200, '¡Éxito!', 'La fecha del abono ha sido actualizada correctamente', 'success');
