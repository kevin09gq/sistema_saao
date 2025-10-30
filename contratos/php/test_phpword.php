<?php
// Archivo de prueba para verificar que PHPWord funciona correctamente

error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>Prueba de PHPWord</h1>";

// Verificar que el autoload existe
if (!file_exists(__DIR__ . '/../../vendor/autoload.php')) {
    die('<p style="color:red;">❌ No se encontró vendor/autoload.php</p>');
}
echo "<p>✅ Autoload encontrado</p>";

require_once __DIR__ . '/../../vendor/autoload.php';

// Verificar que PHPWord está disponible
if (!class_exists('PhpOffice\PhpWord\PhpWord')) {
    die('<p style="color:red;">❌ PHPWord no está instalado</p>');
}
echo "<p>✅ PHPWord está instalado</p>";

// Intentar crear un documento simple
try {
    $phpWord = new \PhpOffice\PhpWord\PhpWord();
    echo "<p>✅ Instancia de PHPWord creada</p>";
    
    $section = $phpWord->addSection();
    $section->addText('Hola Mundo desde PHPWord');
    echo "<p>✅ Sección y texto agregados</p>";
    
    // Verificar directorio de salida
    $dirSalida = __DIR__ . '/../exports/word';
    if (!is_dir($dirSalida)) {
        mkdir($dirSalida, 0755, true);
        echo "<p>✅ Directorio creado: $dirSalida</p>";
    } else {
        echo "<p>✅ Directorio existe: $dirSalida</p>";
    }
    
    // Intentar guardar
    $rutaArchivo = $dirSalida . '/test_' . date('YmdHis') . '.docx';
    $objWriter = \PhpOffice\PhpWord\IOFactory::createWriter($phpWord, 'Word2007');
    $objWriter->save($rutaArchivo);
    
    if (file_exists($rutaArchivo)) {
        echo "<p>✅ Archivo creado exitosamente: " . basename($rutaArchivo) . "</p>";
        echo "<p>Tamaño: " . filesize($rutaArchivo) . " bytes</p>";
        echo "<p><a href='/sistema_saao/contratos/exports/word/" . basename($rutaArchivo) . "' download>Descargar archivo de prueba</a></p>";
    } else {
        echo "<p style='color:red;'>❌ No se pudo crear el archivo</p>";
    }
    
} catch (Exception $e) {
    echo "<p style='color:red;'>❌ Error: " . $e->getMessage() . "</p>";
    echo "<pre>" . $e->getTraceAsString() . "</pre>";
}

echo "<hr>";
echo "<p><strong>Versión de PHP:</strong> " . phpversion() . "</p>";
echo "<p><strong>Extensiones cargadas:</strong></p>";
echo "<ul>";
$extensiones = ['zip', 'xml', 'gd', 'mbstring'];
foreach ($extensiones as $ext) {
    $cargada = extension_loaded($ext);
    $icono = $cargada ? '✅' : '❌';
    echo "<li>$icono $ext</li>";
}
echo "</ul>";
