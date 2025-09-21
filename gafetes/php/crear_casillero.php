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
    
    // Verificar si el casillero ya existe exactamente
    $stmt = $conexion->prepare("SELECT COUNT(*) as existe FROM casilleros WHERE num_casillero = ?");
    $stmt->bind_param('s', $numCasillero);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    
    if ($row['existe'] > 0) {
        echo json_encode(['success' => false, 'error' => 'Ya existe un casillero con este número exacto']);
        exit;
    }
    
    // Validación adicional: Verificar si el número base ya existe
    // Por ejemplo, si se intenta crear "1A" y ya existe "1"
    if (preg_match('/^(\d+)([A-Za-z]+)$/', $numCasillero, $matches)) {
        $numeroBase = $matches[1];
        
        // Verificar si existe un casillero con ese número base exacto
        $stmt = $conexion->prepare("SELECT num_casillero FROM casilleros WHERE num_casillero = ?");
        $stmt->bind_param('s', $numeroBase);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            // Esto está bien, se permite crear variaciones de un número base existente
            // No hacemos nada aquí, continuamos con la creación
        }
    }
    
    // Validación adicional: Verificar si se está intentando crear un número base que ya tiene variaciones
    // Por ejemplo, si se intenta crear "1" y ya existe "1A"
    if (preg_match('/^(\d+)$/', $numCasillero, $matches)) {
        $numeroBase = $matches[1];
        
        // Verificar si existe algún casillero que comience con este número base
        $stmt = $conexion->prepare("SELECT num_casillero FROM casilleros WHERE num_casillero LIKE ? AND num_casillero != ?");
        $likePattern = $numeroBase . '%';
        $stmt->bind_param('ss', $likePattern, $numCasillero);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            echo json_encode(['success' => false, 'error' => "No se puede crear el casillero '$numCasillero' porque existen variaciones del número base '$numeroBase' en uso (como '{$row['num_casillero']}')"]);
            exit;
        }
    }
    
    // Crear el nuevo casillero
    $stmt = $conexion->prepare("INSERT INTO casilleros (num_casillero) VALUES (?)");
    $stmt->bind_param('s', $numCasillero);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        throw new Exception('Error al crear el casillero: ' . $stmt->error);
    }
    
} catch (Exception $e) {
    error_log('Error en crear_casillero.php: ' . $e->getMessage());
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

if (isset($conexion) && $conexion) {
    if (isset($stmt) && $stmt) $stmt->close();
    $conexion->close();
}
?>