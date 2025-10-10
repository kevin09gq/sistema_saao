<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../conexion/conexion.php';

// Obtener datos del POST
$num_casillero = isset($_POST['num_casillero']) ? trim($_POST['num_casillero']) : '';
$id_empleado = isset($_POST['id_empleado']) ? intval($_POST['id_empleado']) : 0;

// Validar datos
if (empty($num_casillero)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Número de casillero no proporcionado']);
    exit;
}

try {
    // Verificar si hay conexión
    if (!isset($conexion) || !$conexion) {
        throw new Exception('No se pudo establecer conexión con la base de datos');
    }
    
    // Si se proporciona un id_empleado, liberar solo ese empleado del casillero
    // Si no se proporciona, liberar todos los empleados del casillero
    if ($id_empleado > 0) {
        // Liberar solo un empleado específico del casillero
        $stmt = $conexion->prepare("DELETE FROM empleado_casillero WHERE id_empleado = ? AND num_casillero = ?");
        $stmt->bind_param("is", $id_empleado, $num_casillero);
    } else {
        // Liberar todos los empleados del casillero
        $stmt = $conexion->prepare("DELETE FROM empleado_casillero WHERE num_casillero = ?");
        $stmt->bind_param("s", $num_casillero);
    }
    
    if ($stmt->execute()) {
        $stmt->close();
        echo json_encode(['success' => true]);
    } else {
        throw new Exception('Error al liberar el casillero');
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

if (isset($conexion) && $conexion) {
    $conexion->close();
}
?>