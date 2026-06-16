<?php
// Habilitar reporte de errores para depuración
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Incluir archivo de configuración
require_once('../config_vigencia.php');

// Establecer el tipo de contenido como JSON
header('Content-Type: application/json');

// Verificar si se ha enviado una solicitud GET
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Obtener la configuración
    $config = getConfigVigencia();
    
    // Devolver la configuración como JSON
    echo json_encode([
        'success' => true,
        'config' => [
            'con_imss' => $config['con_imss'],
            'sin_imss' => $config['sin_imss']
        ]
    ]);
} else {
    // Método de solicitud no válido
    echo json_encode([
        'success' => false,
        'message' => 'Método de solicitud no válido'
    ]);
}
?>