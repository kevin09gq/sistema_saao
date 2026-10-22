<?php
header('Content-Type: application/json');
include("../../conexion/conexion.php");

ob_start();

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método no permitido');
    }

    if (!isset($_POST['id']) || !isset($_FILES['logo'])) {
        throw new Exception('Parámetros requeridos faltantes');
    }

    $id = intval($_POST['id']);
    $archivo = $_FILES['logo'];

    if ($archivo['error'] !== UPLOAD_ERR_OK) {
        throw new Exception('Error al subir el archivo: ' . $archivo['error']);
    }

    $tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $tipoMime = finfo_file($finfo, $archivo['tmp_name']);
    finfo_close($finfo);
    if (!in_array($tipoMime, $tiposPermitidos)) {
        throw new Exception('Tipo de archivo no permitido. Solo se permiten imágenes.');
    }

    $maxSize = 5 * 1024 * 1024; // 5MB
    if ($archivo['size'] > $maxSize) {
        throw new Exception('El archivo es demasiado grande. Máximo 5MB permitido.');
    }

    $extension = strtolower(pathinfo($archivo['name'], PATHINFO_EXTENSION));
    if (empty($extension)) {
        switch ($tipoMime) {
            case 'image/jpeg': $extension = 'jpg'; break;
            case 'image/png': $extension = 'png'; break;
            case 'image/gif': $extension = 'gif'; break;
            case 'image/webp': $extension = 'webp'; break;
            default: $extension = 'jpg';
        }
    }

    $carpetaDestino = '../logos_empresa/';

    if (!file_exists($carpetaDestino)) {
        if (!mkdir($carpetaDestino, 0755, true)) {
            throw new Exception('No se pudo crear la carpeta de destino');
        }
    }

    // Obtener valor anterior
    $stmt = $conexion->prepare("SELECT marca_empresa FROM empresa WHERE id_empresa = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $resultado = $stmt->get_result();
    if ($resultado->num_rows === 0) {
        throw new Exception('La empresa no existe');
    }

    $row = $resultado->fetch_assoc();
    $logoAnterior = $row['marca_empresa'];

    $nombreArchivo = 'empresa_' . $id . '_' . uniqid() . '.' . $extension;
    $rutaCompleta = $carpetaDestino . $nombreArchivo;

    if (!move_uploaded_file($archivo['tmp_name'], $rutaCompleta)) {
        throw new Exception('Error al mover el archivo al destino');
    }

    $stmt = $conexion->prepare("UPDATE empresa SET marca_empresa = ? WHERE id_empresa = ?");
    $stmt->bind_param("si", $nombreArchivo, $id);
    if (!$stmt->execute()) {
        unlink($rutaCompleta);
        throw new Exception('Error al actualizar la base de datos: ' . $stmt->error);
    }

    if (!empty($logoAnterior)) {
        $rutaAnterior = $carpetaDestino . $logoAnterior;
        if (file_exists($rutaAnterior)) {
            @unlink($rutaAnterior);
        }
    }

    ob_end_clean();
    echo json_encode([
        'success' => true,
        'message' => 'Logo de empresa actualizado correctamente',
        'data' => [
            'id' => $id,
            'archivo' => $nombreArchivo,
            'ruta' => $rutaCompleta
        ]
    ], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    ob_end_clean();
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}

if (isset($conexion)) { $conexion->close(); }
