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
    
    // Verificar si el casillero existe
    $stmt_check_casillero = $conexion->prepare("SELECT COUNT(*) as total FROM casilleros WHERE num_casillero = ?");
    $stmt_check_casillero->bind_param("s", $num_casillero);
    $stmt_check_casillero->execute();
    $result_check_casillero = $stmt_check_casillero->get_result();
    $row_check_casillero = $result_check_casillero->fetch_assoc();
    
    if ($row_check_casillero['total'] == 0) {
        // El casillero no existe
        echo json_encode(['success' => false, 'error' => 'El casillero ' . $num_casillero . ' no existe.']);
        exit;
    }
    
    $stmt_check_casillero->close();

    // Verificar si el empleado ya está asignado a este casillero
    $stmt_check_asignacion = $conexion->prepare("SELECT COUNT(*) as total FROM empleado_casillero WHERE id_empleado = ? AND num_casillero = ?");
    $stmt_check_asignacion->bind_param("is", $id_empleado, $num_casillero);
    $stmt_check_asignacion->execute();
    $result_check_asignacion = $stmt_check_asignacion->get_result();
    $row_check_asignacion = $result_check_asignacion->fetch_assoc();
    
    if ($row_check_asignacion['total'] > 0) {
        // El empleado ya está asignado a este casillero
        echo json_encode(['success' => true, 'message' => 'El empleado ya está asignado a este casillero.']);
        exit;
    }
    
    $stmt_check_asignacion->close();

    // Verificar cuántos empleados ya están asignados a este casillero
    $stmt_count = $conexion->prepare("SELECT COUNT(*) as total FROM empleado_casillero WHERE num_casillero = ?");
    $stmt_count->bind_param("s", $num_casillero);
    $stmt_count->execute();
    $result_count = $stmt_count->get_result();
    $row_count = $result_count->fetch_assoc();
    
    if ($row_count['total'] >= 2) {
        // El casillero ya tiene 2 empleados asignados
        echo json_encode(['success' => false, 'error' => 'El casillero ' . $num_casillero . ' ya tiene el máximo de 2 empleados asignados.']);
        exit;
    }
    
    $stmt_count->close();

    // Asignar el empleado al casillero
    $stmt_insert = $conexion->prepare("INSERT INTO empleado_casillero (id_empleado, num_casillero) VALUES (?, ?)");
    $stmt_insert->bind_param("is", $id_empleado, $num_casillero);
    
    $success = $stmt_insert->execute();
    $stmt_insert->close();
    
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