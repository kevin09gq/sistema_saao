<?php
header('Content-Type: application/json');

// Incluir archivo de conexión a la base de datos
require_once('../../conexion/conexion.php');

// Configuración
$directorioDestino = __DIR__ . '/../fotos_empleados/';
$directorioDestino = str_replace('\\', '/', $directorioDestino); // Normalizar las barras
$respuesta = [
    'success' => false, 
    'message' => '',
    'debug' => [
        'directorio_destino' => $directorioDestino,
        'directorio_existe' => is_dir($directorioDestino) ? 'Sí' : 'No',
        'es_escribible' => is_writable($directorioDestino) ? 'Sí' : 'No'
    ]
];

// Crear el directorio si no existe
if (!is_dir($directorioDestino)) {
    if (!mkdir($directorioDestino, 0755, true)) {
        $respuesta['message'] = 'No se pudo crear el directorio de destino.';
        echo json_encode($respuesta);
        exit;
    }
}

// Verificar si hay archivos
if (empty($_FILES['fotos']['name'][0])) {
    $respuesta['message'] = 'No se han subido archivos.';
    $respuesta['debug'] = [
        'files_received' => !empty($_FILES),
        'fotos_array' => isset($_FILES['fotos']),
        'fotos_names' => isset($_FILES['fotos']['name']),
        'fotos_count' => isset($_FILES['fotos']['name']) ? count($_FILES['fotos']['name']) : 0
    ];
    echo json_encode($respuesta);
    exit;
}

// Procesar cada archivo
$resultados = [];
$errores = [];

foreach ($_FILES['fotos']['tmp_name'] as $key => $tmp_name) {
    $empleadoId = $_POST['empleado_id'][$key] ?? null;
    $nombreArchivo = $_FILES['fotos']['name'][$key];
    $tipoArchivo = $_FILES['fotos']['type'][$key];
    $tamanoArchivo = $_FILES['fotos']['size'][$key];
    $archivoTemporal = $tmp_name;
    $error = $_FILES['fotos']['error'][$key];

    // Validar que se haya seleccionado un empleado
    if (empty($empleadoId)) {
        $errores[] = "No se seleccionó un empleado para la foto: $nombreArchivo";
        continue;
    }

    // Validar que sea una imagen
    $permitidos = ['image/jpeg', 'image/png', 'image/gif'];
    if (!in_array($tipoArchivo, $permitidos)) {
        $errores[] = "El archivo $nombreArchivo no es una imagen válida (solo JPG, PNG o GIF).";
        continue;
    }

    // Validar tamaño (máximo 5MB)
    $tamanoMaximo = 5 * 1024 * 1024; // 5MB
    if ($tamanoArchivo > $tamanoMaximo) {
        $errores[] = "El archivo $nombreArchivo excede el tamaño máximo permitido (5MB).";
        continue;
    }

    // Verificar si el empleado ya tiene una foto
    $sql = "SELECT ruta_foto FROM info_empleados WHERE id_empleado = ?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param('i', $empleadoId);
    $stmt->execute();
    $result = $stmt->get_result();
    $fotoAnterior = $result->fetch_assoc();
    
    // Si el empleado ya tiene una foto, eliminarla
    if ($fotoAnterior && !empty($fotoAnterior['ruta_foto'])) {
        // Construir la ruta absoluta de la foto anterior
        $rutaFotoAnterior = $directorioDestino . basename($fotoAnterior['ruta_foto']);
        
        // También intentar con la ruta relativa desde el directorio del script
        $rutaFotoAnteriorAlternativa = __DIR__ . '/../' . $fotoAnterior['ruta_foto'];
        $rutaFotoAnteriorAlternativa = str_replace('\\', '/', $rutaFotoAnteriorAlternativa);
        
        // Intentar eliminar en ambas rutas posibles
        $eliminado = false;
        
        // Primer intento: usando la ruta del directorio de destino
        if (file_exists($rutaFotoAnterior) && is_file($rutaFotoAnterior)) {
            if (unlink($rutaFotoAnterior)) {
                $eliminado = true;
                $respuesta['debug']['foto_anterior_eliminada'] = $rutaFotoAnterior;
            }
        }
        
        // Segundo intento: usando la ruta relativa (por compatibilidad)
        if (!$eliminado && file_exists($rutaFotoAnteriorAlternativa) && is_file($rutaFotoAnteriorAlternativa)) {
            if (unlink($rutaFotoAnteriorAlternativa)) {
                $eliminado = true;
                $respuesta['debug']['foto_anterior_eliminada'] = $rutaFotoAnteriorAlternativa;
            }
        }
        
        // Si no se pudo eliminar, agregar información de debug
        if (!$eliminado) {
            $respuesta['debug']['foto_anterior_no_eliminada'] = [
                'ruta_bd' => $fotoAnterior['ruta_foto'],
                'ruta_intentada_1' => $rutaFotoAnterior,
                'ruta_intentada_2' => $rutaFotoAnteriorAlternativa,
                'existe_1' => file_exists($rutaFotoAnterior),
                'existe_2' => file_exists($rutaFotoAnteriorAlternativa)
            ];
        }
    }
    
    // Generar nombre único para el archivo
    $extension = pathinfo($nombreArchivo, PATHINFO_EXTENSION);
    $nuevoNombre = 'foto_' . $empleadoId . '_' . time() . '_' . uniqid() . '.' . $extension;
    $rutaCompleta = $directorioDestino . $nuevoNombre;

    // Mover el archivo al directorio de destino
    $respuesta['debug']['ruta_completa'] = $rutaCompleta;
    $respuesta['debug']['archivo_temporal'] = $archivoTemporal;
    
    if (move_uploaded_file($archivoTemporal, $rutaCompleta)) {
        // Actualizar la base de datos
        $rutaRelativa = 'fotos_empleados/' . $nuevoNombre;
        $sql = "UPDATE info_empleados SET ruta_foto = ? WHERE id_empleado = ?";
        $stmt = $conexion->prepare($sql);
        $stmt->bind_param('si', $rutaRelativa, $empleadoId);
        
        if ($stmt->execute()) {
            $resultados[] = [
                'empleado_id' => $empleadoId,
                'archivo' => $nombreArchivo,
                'ruta' => $rutaRelativa,
                'status' => 'success'
            ];
        } else {
            // Si falla la actualización, eliminar el archivo subido
            unlink($rutaCompleta);
            $errores[] = "Error al actualizar la base de datos para el archivo: $nombreArchivo";
        }
    } else {
        $errores[] = "Error al subir el archivo: $nombreArchivo";
    }
}

// Preparar respuesta
if (count($errores) === 0 && count($resultados) > 0) {
    $respuesta['success'] = true;
    $respuesta['message'] = 'Todas las fotos se subieron correctamente.';
    $respuesta['resultados'] = $resultados;
} else if (count($errores) > 0 && count($resultados) > 0) {
    $respuesta['success'] = true; // Parcialmente exitoso
    $respuesta['message'] = 'Algunas fotos no se pudieron subir correctamente.';
    $respuesta['resultados'] = $resultados;
    $respuesta['errores'] = $errores;
} else {
    $respuesta['message'] = 'No se pudo subir ninguna foto.';
    $respuesta['errores'] = $errores;
}

echo json_encode($respuesta);
?>
