<?php
header('Content-Type: application/json');

// Incluir conexión a la base de datos
include("../../conexion/conexion.php");

// Verificar que se enviaron los datos necesarios
if (!isset($_POST['id_empleado']) || !isset($_FILES['foto'])) {
    echo json_encode(['success' => false, 'message' => 'Datos incompletos']);
    exit;
}

$id_empleado = intval($_POST['id_empleado']);
$archivo = $_FILES['foto'];

// Validar que el empleado existe
$stmt_verificar = $conexion->prepare("SELECT id_empleado FROM info_empleados WHERE id_empleado = ?");
$stmt_verificar->bind_param("i", $id_empleado);
$stmt_verificar->execute();
$resultado = $stmt_verificar->get_result();

if ($resultado->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Empleado no encontrado']);
    exit;
}

// Validaciones del archivo
$tipos_permitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
$tamaño_maximo = 5 * 1024 * 1024; // 5MB

if (!in_array($archivo['type'], $tipos_permitidos)) {
    echo json_encode(['success' => false, 'message' => 'Tipo de archivo no permitido. Use JPG, PNG o GIF']);
    exit;
}

if ($archivo['size'] > $tamaño_maximo) {
    echo json_encode(['success' => false, 'message' => 'El archivo es demasiado grande. Máximo 5MB']);
    exit;
}

if ($archivo['error'] !== UPLOAD_ERR_OK) {
    echo json_encode(['success' => false, 'message' => 'Error al subir el archivo']);
    exit;
}

try {
    // Crear directorio de fotos si no existe
    $directorio_fotos = '../fotos_empleados/';
    if (!file_exists($directorio_fotos)) {
        mkdir($directorio_fotos, 0755, true);
    }

    // Generar nombre único para la foto
    $extension = pathinfo($archivo['name'], PATHINFO_EXTENSION);
    $nombre_archivo = 'empleado_' . $id_empleado . '_' . time() . '.' . $extension;
    $ruta_completa = $directorio_fotos . $nombre_archivo;

    // Obtener la ruta de la foto anterior para eliminarla
    $stmt_foto_anterior = $conexion->prepare("SELECT ruta_foto FROM info_empleados WHERE id_empleado = ?");
    $stmt_foto_anterior->bind_param("i", $id_empleado);
    $stmt_foto_anterior->execute();
    $resultado_anterior = $stmt_foto_anterior->get_result();
    $foto_anterior = $resultado_anterior->fetch_assoc();

    // Mover el archivo subido
    if (move_uploaded_file($archivo['tmp_name'], $ruta_completa)) {
        
        // Actualizar la base de datos con la nueva ruta
        $ruta_relativa = 'fotos_empleados/' . $nombre_archivo;
        $stmt_actualizar = $conexion->prepare("UPDATE info_empleados SET ruta_foto = ? WHERE id_empleado = ?");
        $stmt_actualizar->bind_param("si", $ruta_relativa, $id_empleado);
        
        if ($stmt_actualizar->execute()) {
            
            // Eliminar la foto anterior si existe
            if ($foto_anterior && $foto_anterior['ruta_foto'] && file_exists($directorio_fotos . $foto_anterior['ruta_foto'])) {
                unlink($directorio_fotos . $foto_anterior['ruta_foto']);
            }
            
            echo json_encode([
                'success' => true, 
                'message' => 'Foto actualizada correctamente',
                'nombre_archivo' => $ruta_relativa
            ]);
            
        } else {
            // Si falla la actualización en BD, eliminar archivo subido
            unlink($ruta_completa);
            echo json_encode(['success' => false, 'message' => 'Error al actualizar la base de datos']);
        }
        
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al guardar el archivo']);
    }

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Error interno del servidor']);
}
?>