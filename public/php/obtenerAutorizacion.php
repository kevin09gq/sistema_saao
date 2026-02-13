<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../conexion/conexion.php';

// Respuesta
function respuestas(int $code, string $titulo, string $mensaje, string $icono, bool $auth = false)
{
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode([
        "titulo"  => $titulo,
        "mensaje" => $mensaje,
        "icono"   => $icono,
        "clv"    => $auth
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if (isset($_SESSION["logged_in"])) {

    // Verificar que sea método POST
    if ($_SERVER["REQUEST_METHOD"] !== "POST") {
        respuestas(405, "Método no permitido", "Solo se permite el método POST", "error", false);
    }

    // Obtener la clave enviada
    $clave = isset($_POST['clave']) ? trim((string)$_POST['clave']) : '';
    $motivo = isset($_POST['motivo']) ? trim((string)$_POST['motivo']) : '';

    if ($clave === '') {
        respuestas(400, 'Clave requerida', 'Debes ingresar una clave de autorización', 'warning', false);
    }

    if ($motivo === '') {
        respuestas(400, 'Motivo requerido', 'Debes ingresar el motivo de la autorización', 'warning', false);
    }

    // Buscar todas las claves encriptadas y verificar con password_verify
    $sqlClaves = "SELECT id_autorizacion, clave FROM claves_autorizacion";
    $resultClaves = $conexion->query($sqlClaves);

    if (!$resultClaves) {
        // Si sale esto, algo valio vrg con la base
        respuestas(500, 'Error', 'No se pudo consultar las claves de autorización', 'error', false);
    }

    // Se verifica si alguna clave coincide
    $claveValida = false;
    $id_autorizacion_encontrado = null;
    
    while ($rowClave = $resultClaves->fetch_assoc()) {
        if (password_verify($clave, $rowClave['clave'])) {
            // Clave válida encontrada, guardar el ID y salir del bucle
            $claveValida = true;
            $id_autorizacion_encontrado = $rowClave['id_autorizacion'];
            break;
        }
    }

    // Responder según si la clave no fue encontrada
    if (!$claveValida) {
        respuestas(401, 'Clave inválida', 'La clave de autorización es incorrecta o no existe', 'error', false);
    }

    // Guardar en el historial de autorizaciones
    $sqlHistorial = "INSERT INTO historiales_autorizaciones (id_clave, motivo, fecha) VALUES (?, ?, NOW())";
    $stmtHistorial = $conexion->prepare($sqlHistorial);
    
    if (!$stmtHistorial) {
        respuestas(500, 'Error', 'No se pudo registrar el historial de autorización', 'error', false);
    }
    
    $stmtHistorial->bind_param("is", $id_autorizacion_encontrado, $motivo);
    
    if (!$stmtHistorial->execute()) {
        respuestas(500, 'Error', 'No se pudo guardar el historial: ' . $conexion->error, 'error', false);
    }

    // Clave válida y historial guardado exitosamente
    respuestas(200, 'Autorizado', 'Clave correcta', 'success', true);

} else {
    /**
     * ===========================================
     * Esto en caso de que no este iniciado sesión
     * ===========================================
     */
    respuestas(401, "No autenticado", "Debes primero iniciar sesión", "error", false);
}