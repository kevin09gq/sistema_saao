<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../conexion/conexion.php';

// Obtener datos del POST
$num_casillero = isset($_POST['num_casillero']) ? trim($_POST['num_casillero']) : '';

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
    
    // Primero obtener el id_empleado actual del casillero
    $stmt = $conexion->prepare("SELECT id_empleado FROM casilleros WHERE num_casillero = ?");
    $stmt->bind_param("s", $num_casillero);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($row = $result->fetch_assoc()) {
        $id_empleado = $row['id_empleado'];
    } else {
        $id_empleado = null;
    }
    $stmt->close();
    
    // Actualizar el casillero para establecer id_empleado a NULL
    $stmt = $conexion->prepare("UPDATE casilleros SET id_empleado = NULL WHERE num_casillero = ?");
    $stmt->bind_param("s", $num_casillero);
    
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