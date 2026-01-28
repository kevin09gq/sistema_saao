<?php
require_once __DIR__ . "/../../config/config.php";
require_once __DIR__ . "/../../conexion/conexion.php";

header('Content-Type: application/json');

// Solo aceptar POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode([
        'success' => false,
        'message' => 'Método no permitido'
    ]);
    exit;
}

// Obtener datos JSON del body
$inputJSON = file_get_contents('php://input');
$datos = json_decode($inputJSON, true);

// Obtener ID del historial
$id = isset($datos['id']) ? intval($datos['id']) : 0;

if ($id <= 0) {
    echo json_encode([
        'success' => false,
        'message' => 'ID de historial inválido'
    ]);
    exit;
}

// Eliminar el historial
$sql = "DELETE FROM historial_biometrico WHERE id = ?";
$stmt = $conexion->prepare($sql);
$stmt->bind_param("i", $id);

if ($stmt->execute()) {
    if ($stmt->affected_rows > 0) {
        echo json_encode([
            'success' => true,
            'message' => 'Historial eliminado correctamente'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'No se encontró el historial a eliminar'
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Error al eliminar: ' . $conexion->error
    ]);
}

$stmt->close();
$conexion->close();
