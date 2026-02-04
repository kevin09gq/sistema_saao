<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . "/../../conexion/conexion.php";

// Respuesta
function respuestas(int $code, string $titulo, string $mensaje, string $icono, array $data)
{
    http_response_code($code);
    echo json_encode([
        "titulo"  => $titulo,
        "mensaje" => $mensaje,
        "icono"   => $icono,
        "data"    => $data
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

// Verificar sesión
if (!isset($_SESSION["logged_in"])) {
    respuestas(401, "No autenticado", "Debes primero iniciar sesión", "error", []);
}

// Verificar método POST
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    respuestas(405, "Método no permitido", "Solo se permite el método POST", "error", []);
}

// Obtener y validar datos
$id_empleado = isset($_POST["id_empleado"]) ? intval($_POST["id_empleado"]) : 0;
$clave = isset($_POST["clave"]) ? trim($_POST["clave"]) : "";

// Validar que se envió el id del empleado
if ($id_empleado <= 0) {
    respuestas(400, "Error de validación", "Debe seleccionar un empleado válido", "warning", []);
}

// Validar que se envió la clave
if (empty($clave)) {
    respuestas(400, "Error de validación", "La clave es requerida", "warning", []);
}

/**
 * Validar reglas de la clave:
 * - Debe empezar con letra mayúscula
 * - Mínimo 3 letras
 * - Mínimo 3 números
 * - Debe terminar con carácter especial (@, *, #, $)
 */
function validarClave($clave)
{
    // Debe empezar con letra mayúscula
    if (!preg_match('/^[A-Z]/', $clave)) {
        return false;
    }

    // Mínimo 3 letras
    if (preg_match_all('/[a-zA-Z]/', $clave) < 3) {
        return false;
    }

    // Mínimo 3 números
    if (preg_match_all('/[0-9]/', $clave) < 3) {
        return false;
    }

    // Debe terminar con carácter especial (@, *, #, $)
    if (!preg_match('/[@*#$]$/', $clave)) {
        return false;
    }

    return true;
}

// Validar la clave
if (!validarClave($clave)) {
    respuestas(400, "Error de validación", "La clave no cumple con las reglas de seguridad requeridas", "warning", []);
}

// Verificar si el empleado existe
$sqlEmpleado = "SELECT id_empleado, nombre, ap_paterno, ap_materno FROM info_empleados WHERE id_empleado = ?";
$stmtEmpleado = $conexion->prepare($sqlEmpleado);
$stmtEmpleado->bind_param("i", $id_empleado);
$stmtEmpleado->execute();
$resultEmpleado = $stmtEmpleado->get_result();

if ($resultEmpleado->num_rows === 0) {
    respuestas(404, "No encontrado", "El empleado seleccionado no existe", "error", []);
}

$empleado = $resultEmpleado->fetch_object();
$nombreCompleto = $empleado->nombre . " " . $empleado->ap_paterno . " " . $empleado->ap_materno;

// Verificar si el empleado ya tiene una clave de autorización
$sqlVerificar = "SELECT id_autorizacion FROM claves_autorizacion WHERE id_empleado = ?";
$stmtVerificar = $conexion->prepare($sqlVerificar);
$stmtVerificar->bind_param("i", $id_empleado);
$stmtVerificar->execute();
$resultVerificar = $stmtVerificar->get_result();

if ($resultVerificar->num_rows > 0) {
    respuestas(409, "Ya existe", "El empleado $nombreCompleto ya tiene una clave de autorización registrada", "info", []);
}

// Verificar que la clave no esté siendo usada por otro empleado
$sqlClaves = "SELECT clave FROM claves_autorizacion";
$resultClaves = $conexion->query($sqlClaves);

while ($row = $resultClaves->fetch_object()) {
    if (password_verify($clave, $row->clave)) {
        respuestas(400, "Clave no permitida", "La clave ingresada no está permitida, por favor ingrese otra", "error", []);
    }
}

// Encriptar la clave antes de guardarla (usando password_hash para mayor seguridad)
$claveEncriptada = password_hash($clave, PASSWORD_DEFAULT);

// Insertar la nueva clave
$sqlInsertar = "INSERT INTO claves_autorizacion (id_empleado, clave, fecha_creacion) VALUES (?, ?, NOW())";
$stmtInsertar = $conexion->prepare($sqlInsertar);
$stmtInsertar->bind_param("is", $id_empleado, $claveEncriptada);

if ($stmtInsertar->execute()) {
    respuestas(201, "¡Éxito!", "La clave de autorización para $nombreCompleto ha sido creada correctamente", "success", [
        "id_autorizacion" => $conexion->insert_id
    ]);
} else {
    respuestas(500, "Error", "Ocurrió un error al guardar la clave: " . $conexion->error, "error", []);
}