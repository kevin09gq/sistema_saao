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

// Validar que se recibieron datos
if (!$datos) {
    echo json_encode([
        'success' => false,
        'message' => 'No se recibieron datos válidos'
    ]);
    exit;
}

$num_sem = intval($datos['num_sem']);
$fecha_inicio = $datos['fecha_inicio'];
$fecha_fin = $datos['fecha_fin'];
$id_empresa = isset($datos['id_empresa']) ? intval($datos['id_empresa']) : 1;

// Validar formato de fechas (YYYY-MM-DD)
if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $fecha_inicio) || 
    !preg_match('/^\d{4}-\d{2}-\d{2}$/', $fecha_fin)) {
    echo json_encode([
        'success' => false,
        'message' => 'Formato de fecha inválido'
    ]);
    exit;
}

// Verificar si ya existe un registro con la misma semana, fechas y empresa
$sql = "SELECT id, observacion, fecha_registro FROM historial_biometrico 
        WHERE num_sem = ? AND fecha_inicio = ? AND fecha_fin = ? AND id_empresa = ?";
$stmt = $conexion->prepare($sql);
$stmt->bind_param("issi", $num_sem, $fecha_inicio, $fecha_fin, $id_empresa);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $row = $result->fetch_assoc();
    echo json_encode([
        'success' => true,
        'existe' => true,
        'id' => $row['id'],
        'observacion_anterior' => $row['observacion'],
        'fecha_registro' => $row['fecha_registro'],
        'message' => 'Ya existe un registro para esta semana'
    ]);
} else {
    echo json_encode([
        'success' => true,
        'existe' => false,
        'message' => 'No existe registro previo'
    ]);
}

$stmt->close();
$conexion->close();
