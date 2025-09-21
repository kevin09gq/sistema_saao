<?php
header('Content-Type: application/json');

// Incluir archivo de conexión
require_once __DIR__ . '/../../conexion/conexion.php';

// Verificar que se hayan enviado los datos necesarios
if (!isset($_POST['numero_anterior']) || !isset($_POST['nuevo_numero'])) {
    echo json_encode(['success' => false, 'error' => 'Datos incompletos']);
    exit;
}

$numeroAnterior = trim($_POST['numero_anterior']);
$nuevoNumero = trim($_POST['nuevo_numero']);

// Validar que los números no estén vacíos
if (empty($numeroAnterior) || empty($nuevoNumero)) {
    echo json_encode(['success' => false, 'error' => 'Los números de casillero no pueden estar vacíos']);
    exit;
}

// Si el número no cambia, no hacer nada
if ($nuevoNumero === $numeroAnterior) {
    echo json_encode(['success' => true]);
    exit;
}

try {
    // Verificar si hay conexión
    if (!isset($conexion) || !$conexion) {
        throw new Exception('No se pudo establecer conexión con la base de datos');
    }
    
    // Verificar si el nuevo número ya existe exactamente
    $stmt = $conexion->prepare("SELECT COUNT(*) as existe FROM casilleros WHERE num_casillero = ? AND num_casillero != ?");
    $stmt->bind_param('ss', $nuevoNumero, $numeroAnterior);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    
    if ($row['existe'] > 0) {
        echo json_encode(['success' => false, 'error' => 'Ya existe un casillero con este número']);
        exit;
    }
    
    // Validación adicional: Verificar si el nuevo número tiene un identificador base que ya existe
    // Por ejemplo, si se intenta cambiar a "1A" y ya existe un casillero "1"
    if (preg_match('/^(\d+)([A-Za-z]*)/', $nuevoNumero, $matches)) {
        $numeroBase = $matches[1];
        
        // Verificar si existe un casillero con ese número base exacto que sea diferente del actual
        $stmt = $conexion->prepare("SELECT num_casillero FROM casilleros WHERE num_casillero = ? AND num_casillero != ?");
        $stmt->bind_param('ss', $numeroBase, $numeroAnterior);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            echo json_encode(['success' => false, 'error' => "No se puede cambiar el casillero a '$nuevoNumero' porque el número base '$numeroBase' ya está en uso"]);
            exit;
        }
    }
    
    // Validación adicional: Verificar si el número base del casillero actual coincide con algún otro casillero
    // Por ejemplo, si se intenta cambiar "1" a "1B" y ya existe "1A"
    if (preg_match('/^(\d+)$/', $numeroAnterior, $matches)) {
        $numeroBaseActual = $matches[1];
        
        // Verificar si existe algún casillero que comience con este número base y sea diferente del actual
        $stmt = $conexion->prepare("SELECT num_casillero FROM casilleros WHERE num_casillero LIKE ? AND num_casillero != ? AND num_casillero != ?");
        $likePattern = $numeroBaseActual . '%';
        $stmt->bind_param('sss', $likePattern, $numeroAnterior, $nuevoNumero);
        $stmt->execute();
        $result = $stmt->get_result();
        
        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            // Verificar si el nuevo número es una variación válida del número base
            if (!preg_match('/^' . preg_quote($numeroBaseActual) . '[A-Za-z]*$/', $nuevoNumero)) {
                echo json_encode(['success' => false, 'error' => "No se puede cambiar el casillero porque existen variaciones del número base '$numeroBaseActual' en uso"]);
                exit;
            }
        }
    }
    
    // Actualizar el número del casillero
    $stmt = $conexion->prepare("UPDATE casilleros SET num_casillero = ? WHERE num_casillero = ?");
    $stmt->bind_param('ss', $nuevoNumero, $numeroAnterior);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true]);
    } else {
        throw new Exception('Error al actualizar el casillero: ' . $stmt->error);
    }
    
} catch (Exception $e) {
    error_log('Error en actualizar_casillero.php: ' . $e->getMessage());
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

if (isset($conexion) && $conexion) {
    if (isset($stmt) && $stmt) $stmt->close();
    $conexion->close();
}
?>