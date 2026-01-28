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

// Validar campos requeridos
$camposRequeridos = ['biometricos', 'num_sem', 'fecha_inicio', 'fecha_fin'];
foreach ($camposRequeridos as $campo) {
    if (!isset($datos[$campo]) || $datos[$campo] === null) {
        echo json_encode([
            'success' => false,
            'message' => "El campo '$campo' es requerido"
        ]);
        exit;
    }
}

// Preparar datos para inserción
$biometricos = json_encode($datos['biometricos'], JSON_UNESCAPED_UNICODE);
$num_sem = intval($datos['num_sem']);
$fecha_inicio = $datos['fecha_inicio'];
$fecha_fin = $datos['fecha_fin'];
$observacion = isset($datos['observacion']) && $datos['observacion'] !== '' 
    ? substr($datos['observacion'], 0, 120) 
    : null;

// Validar formato de fechas (YYYY-MM-DD)
if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $fecha_inicio) || 
    !preg_match('/^\d{4}-\d{2}-\d{2}$/', $fecha_fin)) {
    echo json_encode([
        'success' => false,
        'message' => 'Formato de fecha inválido. Se espera YYYY-MM-DD'
    ]);
    exit;
}

// Verificar si ya existe un registro con la misma semana y fechas
$sqlVerificar = "SELECT id FROM historial_biometrico 
                 WHERE num_sem = ? AND fecha_inicio = ? AND fecha_fin = ?";
$stmtVerificar = $conexion->prepare($sqlVerificar);
$stmtVerificar->bind_param("iss", $num_sem, $fecha_inicio, $fecha_fin);
$stmtVerificar->execute();
$resultVerificar = $stmtVerificar->get_result();

if ($resultVerificar->num_rows > 0) {
    // Ya existe, preguntar si actualizar (por ahora solo insertamos nuevo)
    // Actualizar el registro existente
    $row = $resultVerificar->fetch_assoc();
    $idExistente = $row['id'];
    
    $sqlUpdate = "UPDATE historial_biometrico 
                  SET biometrios = ?, observacion = ?, fecha_registro = NOW() 
                  WHERE id = ?";
    $stmtUpdate = $conexion->prepare($sqlUpdate);
    $stmtUpdate->bind_param("ssi", $biometricos, $observacion, $idExistente);
    
    if ($stmtUpdate->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Historial actualizado correctamente (ya existía un registro para esta semana)',
            'id' => $idExistente,
            'actualizado' => true
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Error al actualizar: ' . $conexion->error
        ]);
    }
    
    $stmtUpdate->close();
} else {
    // No existe, insertar nuevo
    $sqlInsert = "INSERT INTO historial_biometrico (biometrios, num_sem, fecha_inicio, fecha_fin, observacion) 
                  VALUES (?, ?, ?, ?, ?)";
    $stmtInsert = $conexion->prepare($sqlInsert);
    $stmtInsert->bind_param("sisss", $biometricos, $num_sem, $fecha_inicio, $fecha_fin, $observacion);
    
    if ($stmtInsert->execute()) {
        $nuevoId = $conexion->insert_id;
        echo json_encode([
            'success' => true,
            'message' => 'Historial guardado correctamente',
            'id' => $nuevoId,
            'actualizado' => false
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Error al guardar: ' . $conexion->error
        ]);
    }
    
    $stmtInsert->close();
}

$stmtVerificar->close();
$conexion->close();
