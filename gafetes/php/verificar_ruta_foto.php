<?php
header('Content-Type: application/json');

// Incluir conexión a la base de datos
include("../../conexion/conexion.php");

// Verificar que se envió el ID del empleado
if (!isset($_GET['id_empleado'])) {
    echo json_encode(['success' => false, 'message' => 'ID de empleado no proporcionado']);
    exit;
}

$id_empleado = intval($_GET['id_empleado']);

try {
    // Obtener la ruta de la foto del empleado
    $stmt = $conexion->prepare("SELECT ruta_foto FROM info_empleados WHERE id_empleado = ?");
    $stmt->bind_param("i", $id_empleado);
    $stmt->execute();
    $resultado = $stmt->get_result();
    
    if ($resultado->num_rows > 0) {
        $empleado = $resultado->fetch_assoc();
        echo json_encode([
            'success' => true,
            'ruta_foto' => $empleado['ruta_foto']
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Empleado no encontrado']);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error interno del servidor: ' . $e->getMessage()]);
}
?>