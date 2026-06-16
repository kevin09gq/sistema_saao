<?php
// Habilitar reporte de errores para depuración
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Incluir archivo de configuración
require_once('../config_vigencia.php');

// Establecer el tipo de contenido como JSON
header('Content-Type: application/json');

// Verificar si se ha enviado una solicitud POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Obtener los datos del formulario
    $con_imss_valor = isset($_POST['con_imss_valor']) ? intval($_POST['con_imss_valor']) : 1;
    $con_imss_unidad = isset($_POST['con_imss_unidad']) ? $_POST['con_imss_unidad'] : 'year';
    $sin_imss_valor = isset($_POST['sin_imss_valor']) ? intval($_POST['sin_imss_valor']) : 45;
    $sin_imss_unidad = isset($_POST['sin_imss_unidad']) ? $_POST['sin_imss_unidad'] : 'days';
    
    // Validar unidades
    $unidades_validas = ['days', 'weeks', 'months', 'years'];
    if (!in_array($con_imss_unidad, $unidades_validas)) {
        $con_imss_unidad = 'year';
    }
    if (!in_array($sin_imss_unidad, $unidades_validas)) {
        $sin_imss_unidad = 'days';
    }
    
    // Validar valores
    if ($con_imss_valor < 1) $con_imss_valor = 1;
    if ($sin_imss_valor < 1) $sin_imss_valor = 1;
    
    // Generar el contenido del archivo de configuración
    $config_content = "<?php\n";
    $config_content .= "/**\n";
    $config_content .= " * Archivo de configuración para la vigencia de gafetes\n";
    $config_content .= " * No modificar manualmente - usar la interfaz de configuración\n";
    $config_content .= " */\n\n";
    $config_content .= "// Configuración para empleados CON IMSS\n";
    $config_content .= "\$config_vigencia['con_imss'] = [\n";
    $config_content .= "    'valor' => " . $con_imss_valor . ",\n";
    $config_content .= "    'unidad' => '" . addslashes($con_imss_unidad) . "'\n";
    $config_content .= "];\n\n";
    $config_content .= "// Configuración para empleados SIN IMSS\n";
    $config_content .= "\$config_vigencia['sin_imss'] = [\n";
    $config_content .= "    'valor' => " . $sin_imss_valor . ",\n";
    $config_content .= "    'unidad' => '" . addslashes($sin_imss_unidad) . "'\n";
    $config_content .= "];\n\n";
    $config_content .= "// Valores por defecto (para referencia)\n";
    $config_content .= "\$config_vigencia['default'] = [\n";
    $config_content .= "    'con_imss' => ['valor' => 1, 'unidad' => 'year'],\n";
    $config_content .= "    'sin_imss' => ['valor' => 45, 'unidad' => 'days']\n";
    $config_content .= "];\n\n";
    $config_content .= "// Función para obtener la configuración de vigencia\n";
    $config_content .= "function getConfigVigencia() {\n";
    $config_content .= "    global \$config_vigencia;\n";
    $config_content .= "    return \$config_vigencia;\n";
    $config_content .= "}\n";
    
    // Ruta del archivo de configuración
    $file_path = '../config_vigencia.php';
    
    // Intentar guardar el archivo
    if (file_put_contents($file_path, $config_content) !== false) {
        echo json_encode([
            'success' => true,
            'message' => 'Configuración guardada correctamente',
            'config' => [
                'con_imss' => ['valor' => $con_imss_valor, 'unidad' => $con_imss_unidad],
                'sin_imss' => ['valor' => $sin_imss_valor, 'unidad' => $sin_imss_unidad]
            ]
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Error al guardar la configuración - verifique los permisos del archivo'
        ]);
    }
} else {
    // Método de solicitud no válido
    echo json_encode([
        'success' => false,
        'message' => 'Método de solicitud no válido'
    ]);
}
?>