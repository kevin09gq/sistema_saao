<?php
header('Content-Type: application/json');

// Incluir archivo de conexión
require_once __DIR__ . '/../../conexion/conexion.php';

// Verificar que se haya enviado el número del casillero
if (!isset($_POST['num_casillero'])) {
    echo json_encode(['success' => false, 'error' => 'Número de casillero no proporcionado']);
    exit;
}

$numCasillero = trim($_POST['num_casillero']);

// Validar que el número no esté vacío
if (empty($numCasillero)) {
    echo json_encode(['success' => false, 'error' => 'El número de casillero no puede estar vacío']);
    exit;
}

try {
    // Verificar si hay conexión
    if (!isset($conexion) || !$conexion) {
        throw new Exception('No se pudo establecer conexión con la base de datos');
    }
    
    // Verificar si el casillero existe
    $stmt = $conexion->prepare("SELECT id_empleado FROM casilleros WHERE num_casillero = ?");
    $stmt->bind_param('s', $numCasillero);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        echo json_encode(['success' => false, 'error' => 'No existe un casillero con este número']);
        exit;
    }
    
    // Verificar si el casillero está ocupado
    $row = $result->fetch_assoc();
    if ($row['id_empleado'] !== null) {
        echo json_encode(['success' => false, 'error' => 'No se puede eliminar un casillero ocupado. Libere el casillero primero.']);
        exit;
    }
    
    // Eliminar el casillero
    $stmt = $conexion->prepare("DELETE FROM casilleros WHERE num_casillero = ?");
    $stmt->bind_param('s', $numCasillero);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Casillero eliminado correctamente']);
    } else {
        throw new Exception('Error al eliminar el casillero: ' . $stmt->error);
    }
    
} catch (Exception $e) {
    error_log('Error en eliminar_casillero.php: ' . $e->getMessage());
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

if (isset($conexion) && $conexion) {
    if (isset($stmt) && $stmt) $stmt->close();
    $conexion->close();
}
?>