<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../conexion/conexion.php';

// Obtener datos del POST
$num_casillero = isset($_POST['num_casillero']) ? trim($_POST['num_casillero']) : '';
$id_empleado = isset($_POST['id_empleado']) ? intval($_POST['id_empleado']) : 0;

// Validar datos
if (empty($num_casillero) || $id_empleado <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Datos de entrada inválidos']);
    exit;
}

try {
    // Verificar si hay conexión
    if (!isset($conexion) || !$conexion) {
        throw new Exception('No se pudo establecer conexión con la base de datos');
    }
    
    // Verificar si el casillero existe y está ocupado por otro empleado
    $stmt_check = $conexion->prepare("SELECT id_empleado FROM casilleros WHERE num_casillero = ? AND id_empleado IS NOT NULL AND id_empleado != ?");
    $stmt_check->bind_param("si", $num_casillero, $id_empleado);
    $stmt_check->execute();
    $result_check = $stmt_check->get_result();
    
    if ($result_check->num_rows > 0) {
        // El casillero está ocupado por otro empleado
        echo json_encode(['success' => false, 'error' => 'El casillero ' . $num_casillero . ' ya está ocupado por otro empleado.']);
        exit;
    }
    
    $stmt_check->close();

    // Verificar si el empleado ya tiene un casillero asignado
    $stmt_emp = $conexion->prepare("SELECT num_casillero FROM casilleros WHERE id_empleado = ?");
    $stmt_emp->bind_param("i", $id_empleado);
    $stmt_emp->execute();
    $res_emp = $stmt_emp->get_result();
    if ($row_emp = $res_emp->fetch_assoc()) {
        $casillero_actual_emp = $row_emp['num_casillero'];
        // Si intenta asignar el mismo casillero, consideramos éxito sin cambios
        if ($casillero_actual_emp === $num_casillero) {
            echo json_encode(['success' => true]);
            exit;
        }
        // Si ya tiene otro casillero distinto, bloquear asignación
        echo json_encode([
            'success' => false,
            'error' => 'El empleado ya tiene asignado el casillero ' . $casillero_actual_emp . '. Libere ese casillero antes de reasignar.'
        ]);
        exit;
    }
    $stmt_emp->close();
    
    // 1. Verificar si el casillero existe
    $stmt = $conexion->prepare("SELECT id_empleado FROM casilleros WHERE num_casillero = ?");
    $stmt->bind_param("s", $num_casillero);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        // Si el casillero no existe, lo creamos
        $stmt = $conexion->prepare("INSERT INTO casilleros (num_casillero, id_empleado) VALUES (?, ?)");
        $stmt->bind_param("si", $num_casillero, $id_empleado);
    } else {
        // Si el casillero existe, lo actualizamos
        $stmt = $conexion->prepare("UPDATE casilleros SET id_empleado = ? WHERE num_casillero = ?");
        $stmt->bind_param("is", $id_empleado, $num_casillero);
    }
    
    $success = $stmt->execute();
    $stmt->close();
    
    if ($success) {
        echo json_encode(['success' => true]);
    } else {
        throw new Exception('Error al asignar el casillero');
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

if (isset($conexion) && $conexion) {
    $conexion->close();
}
?>