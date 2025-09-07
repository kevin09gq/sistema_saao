<?php
header('Content-Type: application/json');

// Incluir conexión a la base de datos
include("../../conexion/conexion.php");

// Verificar que se envió el ID del empleado y la ruta
if (!isset($_POST['id_empleado']) || !isset($_POST['ruta_foto'])) {
    echo json_encode(['success' => false, 'message' => 'Datos incompletos']);
    exit;
}

$id_empleado = intval($_POST['id_empleado']);
$ruta_foto = $_POST['ruta_foto'];

try {
    // Actualizar la base de datos con la ruta de la foto
    $stmt_actualizar = $conexion->prepare("UPDATE info_empleados SET ruta_foto = ? WHERE id_empleado = ?");
    $stmt_actualizar->bind_param("si", $ruta_foto, $id_empleado);
    
    if ($stmt_actualizar->execute()) {
        echo json_encode([
            'success' => true, 
            'message' => 'Ruta de foto actualizada correctamente',
            'ruta_foto' => $ruta_foto
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al actualizar la base de datos']);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error interno del servidor: ' . $e->getMessage()]);
}
?>