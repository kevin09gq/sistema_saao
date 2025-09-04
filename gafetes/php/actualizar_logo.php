<?php
header('Content-Type: application/json');
include("../../conexion/conexion.php");

// Limpiar el buffer de salida para evitar corrupción de JSON
ob_start();

try {
    // Verificar que es una petición POST
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método no permitido');
    }

    // Verificar parámetros requeridos
    if (!isset($_POST['tipo']) || !isset($_POST['id']) || !isset($_FILES['logo'])) {
        throw new Exception('Parámetros requeridos faltantes');
    }

    $tipo = $_POST['tipo'];
    $id = intval($_POST['id']);
    $archivo = $_FILES['logo'];

    // Validar tipo
    if (!in_array($tipo, ['empresa', 'area'])) {
        throw new Exception('Tipo no válido');
    }

    // Verificar que el archivo se subió correctamente
    if ($archivo['error'] !== UPLOAD_ERR_OK) {
        throw new Exception('Error al subir el archivo: ' . $archivo['error']);
    }

    // Validar tipo de archivo
    $tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $tipoMime = finfo_file($finfo, $archivo['tmp_name']);
    finfo_close($finfo);

    if (!in_array($tipoMime, $tiposPermitidos)) {
        throw new Exception('Tipo de archivo no permitido. Solo se permiten imágenes.');
    }

    // Validar tamaño (máximo 5MB)
    $maxSize = 5 * 1024 * 1024; // 5MB
    if ($archivo['size'] > $maxSize) {
        throw new Exception('El archivo es demasiado grande. Máximo 5MB permitido.');
    }

    // Obtener extensión del archivo
    $extension = strtolower(pathinfo($archivo['name'], PATHINFO_EXTENSION));
    if (empty($extension)) {
        // Determinar extensión por tipo MIME
        switch ($tipoMime) {
            case 'image/jpeg':
                $extension = 'jpg';
                break;
            case 'image/png':
                $extension = 'png';
                break;
            case 'image/gif':
                $extension = 'gif';
                break;
            case 'image/webp':
                $extension = 'webp';
                break;
            default:
                $extension = 'jpg';
        }
    }

    // Determinar carpeta destino y tabla de base de datos
    if ($tipo === 'empresa') {
        $carpetaDestino = '../logos_empresa/';
        $tabla = 'empresa';
        $campoId = 'id_empresa';
        $campoLogo = 'logo_empresa';
    } else {
        $carpetaDestino = '../logos_area/';
        $tabla = 'areas';
        $campoId = 'id_area';
        $campoLogo = 'logo_area';
    }

    // Crear carpeta si no existe
    if (!file_exists($carpetaDestino)) {
        if (!mkdir($carpetaDestino, 0755, true)) {
            throw new Exception('No se pudo crear la carpeta de destino');
        }
    }

    // Verificar que el registro existe en la base de datos
    $stmt = $conexion->prepare("SELECT $campoLogo FROM $tabla WHERE $campoId = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $resultado = $stmt->get_result();
    
    if ($resultado->num_rows === 0) {
        throw new Exception('El registro no existe en la base de datos');
    }

    $row = $resultado->fetch_assoc();
    $logoAnterior = $row[$campoLogo];

    // Generar nombre único para el archivo
    $nombreArchivo = $tipo . '_' . $id . '_' . uniqid() . '.' . $extension;
    $rutaCompleta = $carpetaDestino . $nombreArchivo;

    // Mover el archivo
    if (!move_uploaded_file($archivo['tmp_name'], $rutaCompleta)) {
        throw new Exception('Error al mover el archivo al destino');
    }

    // Actualizar la base de datos
    $stmt = $conexion->prepare("UPDATE $tabla SET $campoLogo = ? WHERE $campoId = ?");
    $stmt->bind_param("si", $nombreArchivo, $id);
    
    if (!$stmt->execute()) {
        // Si falla la actualización, eliminar el archivo subido
        unlink($rutaCompleta);
        throw new Exception('Error al actualizar la base de datos: ' . $stmt->error);
    }

    // Eliminar logo anterior si existe
    if (!empty($logoAnterior)) {
        $rutaAnterior = $carpetaDestino . $logoAnterior;
        if (file_exists($rutaAnterior)) {
            unlink($rutaAnterior);
        }
    }

    // Limpiar buffer y enviar respuesta exitosa
    ob_end_clean();
    echo json_encode([
        'success' => true,
        'message' => 'Logo actualizado correctamente',
        'data' => [
            'tipo' => $tipo,
            'id' => $id,
            'archivo' => $nombreArchivo,
            'ruta' => $rutaCompleta
        ]
    ]);

} catch (Exception $e) {
    // Limpiar buffer y enviar error
    ob_end_clean();
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'error_code' => $e->getCode()
    ]);
}

// Cerrar conexión
if (isset($conexion)) {
    $conexion->close();
}
?>