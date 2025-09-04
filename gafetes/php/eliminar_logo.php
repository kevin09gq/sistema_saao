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
    if (!isset($_POST['tipo']) || !isset($_POST['id'])) {
        throw new Exception('Parámetros requeridos faltantes');
    }

    $tipo = $_POST['tipo'];
    $id = intval($_POST['id']);

    // Validar tipo
    if (!in_array($tipo, ['empresa', 'area'])) {
        throw new Exception('Tipo no válido');
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

    // Verificar que el registro existe en la base de datos
    $stmt = $conexion->prepare("SELECT $campoLogo FROM $tabla WHERE $campoId = ?");
    $stmt->bind_param("i", $id);
    $stmt->execute();
    $resultado = $stmt->get_result();
    
    if ($resultado->num_rows === 0) {
        throw new Exception('El registro no existe en la base de datos');
    }

    $row = $resultado->fetch_assoc();
    $logoActual = $row[$campoLogo];

    // Actualizar la base de datos para eliminar el logo
    $stmt = $conexion->prepare("UPDATE $tabla SET $campoLogo = NULL WHERE $campoId = ?");
    $stmt->bind_param("i", $id);
    
    if (!$stmt->execute()) {
        throw new Exception('Error al actualizar la base de datos: ' . $stmt->error);
    }

    // Eliminar logo del sistema de archivos si existe
    if (!empty($logoActual)) {
        $rutaActual = $carpetaDestino . $logoActual;
        if (file_exists($rutaActual)) {
            unlink($rutaActual);
        }
    }

    // Limpiar buffer y enviar respuesta exitosa
    ob_end_clean();
    echo json_encode([
        'success' => true,
        'message' => 'Logo eliminado correctamente',
        'data' => [
            'tipo' => $tipo,
            'id' => $id
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