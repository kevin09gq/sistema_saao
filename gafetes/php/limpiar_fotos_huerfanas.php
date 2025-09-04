<?php
header('Content-Type: application/json');

// Incluir archivo de conexión a la base de datos
require_once('../../conexion/conexion.php');

// Configuración
$directorioFotos = __DIR__ . '/../fotos_empleados/';
$directorioFotos = str_replace('\\', '/', $directorioFotos);

$respuesta = [
    'success' => false,
    'message' => '',
    'fotos_eliminadas' => [],
    'fotos_conservadas' => [],
    'errores' => []
];

try {
    // Verificar que el directorio existe
    if (!is_dir($directorioFotos)) {
        $respuesta['message'] = 'El directorio de fotos no existe.';
        echo json_encode($respuesta);
        exit;
    }

    // Obtener todas las rutas de fotos en la base de datos
    $sql = "SELECT DISTINCT ruta_foto FROM info_empleados WHERE ruta_foto IS NOT NULL AND ruta_foto != ''";
    $result = $conexion->query($sql);
    
    $fotosEnBD = [];
    while ($row = $result->fetch_assoc()) {
        if (!empty($row['ruta_foto'])) {
            // Obtener solo el nombre del archivo
            $nombreArchivo = basename($row['ruta_foto']);
            $fotosEnBD[] = $nombreArchivo;
        }
    }

    // Obtener todos los archivos en el directorio de fotos
    $archivosEnDirectorio = [];
    if ($handle = opendir($directorioFotos)) {
        while (false !== ($archivo = readdir($handle))) {
            if ($archivo != "." && $archivo != ".." && is_file($directorioFotos . $archivo)) {
                // Verificar que sea una imagen
                $extension = strtolower(pathinfo($archivo, PATHINFO_EXTENSION));
                if (in_array($extension, ['jpg', 'jpeg', 'png', 'gif'])) {
                    $archivosEnDirectorio[] = $archivo;
                }
            }
        }
        closedir($handle);
    }

    // Encontrar fotos huérfanas (archivos que no están en la BD)
    $fotosHuerfanas = array_diff($archivosEnDirectorio, $fotosEnBD);

    // Eliminar fotos huérfanas
    $eliminadas = 0;
    foreach ($fotosHuerfanas as $fotoHuerfana) {
        $rutaCompleta = $directorioFotos . $fotoHuerfana;
        if (file_exists($rutaCompleta) && is_file($rutaCompleta)) {
            if (unlink($rutaCompleta)) {
                $respuesta['fotos_eliminadas'][] = $fotoHuerfana;
                $eliminadas++;
            } else {
                $respuesta['errores'][] = "No se pudo eliminar: $fotoHuerfana";
            }
        }
    }

    // Fotos que se conservaron (están en la BD)
    $respuesta['fotos_conservadas'] = array_intersect($archivosEnDirectorio, $fotosEnBD);

    $respuesta['success'] = true;
    $respuesta['message'] = "Limpieza completada. Se eliminaron $eliminadas fotos huérfanas.";
    $respuesta['estadisticas'] = [
        'total_archivos_directorio' => count($archivosEnDirectorio),
        'fotos_en_bd' => count($fotosEnBD),
        'fotos_huerfanas_encontradas' => count($fotosHuerfanas),
        'fotos_eliminadas' => $eliminadas,
        'fotos_conservadas' => count($respuesta['fotos_conservadas'])
    ];

} catch (Exception $e) {
    $respuesta['message'] = 'Error durante la limpieza: ' . $e->getMessage();
    $respuesta['errores'][] = $e->getMessage();
}

echo json_encode($respuesta);
?>