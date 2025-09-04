<?php
header('Content-Type: application/json');
include("../../conexion/conexion.php");

// Limpiar el buffer de salida para evitar corrupción de JSON
ob_start();

try {
    $logosEliminados = 0;
    $errores = [];

    // Limpiar logos de empresas
    $carpetaEmpresas = '../logos_empresa/';
    if (is_dir($carpetaEmpresas)) {
        // Obtener todos los logos de empresas en uso
        $stmt = $conexion->prepare("SELECT logo_empresa FROM empresa WHERE logo_empresa IS NOT NULL AND logo_empresa != ''");
        $stmt->execute();
        $resultado = $stmt->get_result();
        
        $logosEnUso = [];
        while ($row = $resultado->fetch_assoc()) {
            $logosEnUso[] = $row['logo_empresa'];
        }

        // Leer archivos en la carpeta
        $archivos = scandir($carpetaEmpresas);
        foreach ($archivos as $archivo) {
            if ($archivo === '.' || $archivo === '..') continue;
            
            $rutaCompleta = $carpetaEmpresas . $archivo;
            
            // Verificar si es un archivo de imagen
            if (is_file($rutaCompleta)) {
                $extension = strtolower(pathinfo($archivo, PATHINFO_EXTENSION));
                $extensionesValidas = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
                
                if (in_array($extension, $extensionesValidas)) {
                    // Si el archivo no está en uso, eliminarlo
                    if (!in_array($archivo, $logosEnUso)) {
                        if (unlink($rutaCompleta)) {
                            $logosEliminados++;
                        } else {
                            $errores[] = "No se pudo eliminar: $archivo";
                        }
                    }
                }
            }
        }
    }

    // Limpiar logos de áreas
    $carpetaAreas = '../logos_area/';
    if (is_dir($carpetaAreas)) {
        // Obtener todos los logos de áreas en uso
        $stmt = $conexion->prepare("SELECT logo_area FROM areas WHERE logo_area IS NOT NULL AND logo_area != ''");
        $stmt->execute();
        $resultado = $stmt->get_result();
        
        $logosEnUso = [];
        while ($row = $resultado->fetch_assoc()) {
            $logosEnUso[] = $row['logo_area'];
        }

        // Leer archivos en la carpeta
        $archivos = scandir($carpetaAreas);
        foreach ($archivos as $archivo) {
            if ($archivo === '.' || $archivo === '..') continue;
            
            $rutaCompleta = $carpetaAreas . $archivo;
            
            // Verificar si es un archivo de imagen
            if (is_file($rutaCompleta)) {
                $extension = strtolower(pathinfo($archivo, PATHINFO_EXTENSION));
                $extensionesValidas = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
                
                if (in_array($extension, $extensionesValidas)) {
                    // Si el archivo no está en uso, eliminarlo
                    if (!in_array($archivo, $logosEnUso)) {
                        if (unlink($rutaCompleta)) {
                            $logosEliminados++;
                        } else {
                            $errores[] = "No se pudo eliminar: $archivo";
                        }
                    }
                }
            }
        }
    }

    // Preparar respuesta
    $mensaje = "Se eliminaron $logosEliminados logo(s) huérfano(s)";
    if (!empty($errores)) {
        $mensaje .= ". Errores: " . implode(', ', $errores);
    }

    // Limpiar buffer y enviar respuesta
    ob_end_clean();
    echo json_encode([
        'success' => true,
        'message' => $mensaje,
        'logos_eliminados' => $logosEliminados,
        'errores' => $errores
    ]);

} catch (Exception $e) {
    // Limpiar buffer y enviar error
    ob_end_clean();
    echo json_encode([
        'success' => false,
        'message' => 'Error al limpiar logos: ' . $e->getMessage(),
        'error_code' => $e->getCode()
    ]);
}

// Cerrar conexión
if (isset($conexion)) {
    $conexion->close();
}
?>