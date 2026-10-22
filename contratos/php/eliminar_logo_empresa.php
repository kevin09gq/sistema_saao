<?php
header('Content-Type: application/json');
include("../../conexion/conexion.php");

ob_start();

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método no permitido');
    }

    if (!isset($_POST['id'])) {
        throw new Exception('Parámetro id faltante');
    }

    $id = intval($_POST['id']);

    // Obtener marca actual
    $stmt = $conexion->prepare("SELECT marca_empresa FROM empresa WHERE id_empresa = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $resultado = $stmt->get_result();
    if ($resultado->num_rows === 0) {
        throw new Exception('La empresa no existe');
    }

    $row = $resultado->fetch_assoc();
    $logoActual = $row['marca_empresa'];

    // Limpiar en BD primero
    $stmt = $conexion->prepare("UPDATE empresa SET marca_empresa = NULL WHERE id_empresa = ?");
    $stmt->bind_param("i", $id);
    if (!$stmt->execute()) {
        throw new Exception('Error al actualizar la base de datos: ' . $stmt->error);
    }

    // Intentar eliminar archivo si existe
    if (!empty($logoActual)) {
        $ruta = '../logos_empresa/' . $logoActual;
        if (file_exists($ruta)) {
            @unlink($ruta);
        }
    }

    ob_end_clean();
    echo json_encode([
        'success' => true,
        'message' => 'Logo de empresa eliminado correctamente'
    ], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    ob_end_clean();
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}

if (isset($conexion)) { $conexion->close(); }
