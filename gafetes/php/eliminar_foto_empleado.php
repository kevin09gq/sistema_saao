<?php
header('Content-Type: application/json');
require_once __DIR__ . "/../../conexion/conexion.php";


// Verificar que se envió el ID del empleado
if (!isset($_POST['id_empleado'])) {
    echo json_encode(['success' => false, 'message' => 'ID de empleado no proporcionado']);
    exit;
}

$id_empleado = intval($_POST['id_empleado']);

// Verificar que el empleado existe y obtener la ruta de la foto actual
$stmt_verificar = $conexion->prepare("SELECT ruta_foto FROM info_empleados WHERE id_empleado = ?");
$stmt_verificar->bind_param("i", $id_empleado);
$stmt_verificar->execute();
$resultado = $stmt_verificar->get_result();

if ($resultado->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Empleado no encontrado']);
    exit;
}

$empleado = $resultado->fetch_assoc();
$ruta_foto = $empleado['ruta_foto'];

try {
    // Actualizar la base de datos para eliminar la referencia a la foto
    $stmt_actualizar = $conexion->prepare("UPDATE info_empleados SET ruta_foto = NULL WHERE id_empleado = ?");
    $stmt_actualizar->bind_param("i", $id_empleado);
    
    if ($stmt_actualizar->execute()) {
        
        // Eliminar el archivo físico si existe
        if ($ruta_foto) {
            $clean_ruta = preg_replace('/^(\.\.\/)+gafetes\//', '', $ruta_foto);
            $clean_ruta = preg_replace('/^gafetes\//', '', $clean_ruta);
            $clean_ruta = ltrim($clean_ruta, '/\\');
            
            $posibles_rutas = [
                dirname(__DIR__) . '/' . $clean_ruta,
                dirname(__DIR__) . '/' . $ruta_foto,
                __DIR__ . '/../' . $clean_ruta
            ];
            
            $eliminado = false;
            foreach ($posibles_rutas as $archivo) {
                if (file_exists($archivo) && is_file($archivo)) {
                    $eliminado = @unlink($archivo);
                    if ($eliminado) break;
                }
            }

            echo json_encode([
                'success' => true, 
                'message' => 'Foto eliminada correctamente'
            ]);
            exit;
        } else {
            echo json_encode([
                'success' => true, 
                'message' => 'No había foto para eliminar'
            ]);
            exit;
        }
        
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al actualizar la base de datos']);
        exit;
    }

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error interno del servidor: ' . $e->getMessage()]);
    exit;
}
?>