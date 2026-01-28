<?php
require_once __DIR__ . "/../../config/config.php";
require_once __DIR__ . "/../../conexion/conexion.php";

header('Content-Type: application/json');

// Solo aceptar GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    echo json_encode([
        'success' => false,
        'message' => 'Método no permitido'
    ]);
    exit;
}

// Obtener ID del historial
$id = isset($_GET['id']) ? intval($_GET['id']) : 0;

if ($id <= 0) {
    echo json_encode([
        'success' => false,
        'message' => 'ID de historial inválido'
    ]);
    exit;
}

// Obtener el historial con el JSON completo
$sql = "SELECT id, biometrios, num_sem, fecha_inicio, fecha_fin, observacion, fecha_registro 
        FROM historial_biometrico 
        WHERE id = ?";

$stmt = $conexion->prepare($sql);
$stmt->bind_param("i", $id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode([
        'success' => false,
        'message' => 'Historial no encontrado'
    ]);
    exit;
}

$row = $result->fetch_assoc();

// Decodificar el JSON de biométricos
$biometricos = json_decode($row['biometrios'], true);

if ($biometricos === null) {
    echo json_encode([
        'success' => false,
        'message' => 'Error al decodificar los datos del historial'
    ]);
    exit;
}

echo json_encode([
    'success' => true,
    'historial' => [
        'id' => $row['id'],
        'num_sem' => $row['num_sem'],
        'fecha_inicio' => $row['fecha_inicio'],
        'fecha_fin' => $row['fecha_fin'],
        'observacion' => $row['observacion'],
        'fecha_registro' => $row['fecha_registro']
    ],
    'biometricos' => $biometricos
]);

$stmt->close();
$conexion->close();
