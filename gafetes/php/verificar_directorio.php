<?php
// Verificar permisos del directorio de fotos
$directorio_fotos = '../fotos_empleados/';

echo "<h2>Verificación del directorio de fotos:</h2>";

// Verificar si el directorio existe
if (file_exists($directorio_fotos)) {
    echo "El directorio existe<br>";
} else {
    echo "El directorio no existe<br>";
}

// Verificar si es un directorio
if (is_dir($directorio_fotos)) {
    echo "Es un directorio<br>";
} else {
    echo "No es un directorio<br>";
}

// Verificar permisos de escritura
if (is_writable($directorio_fotos)) {
    echo "El directorio tiene permisos de escritura<br>";
} else {
    echo "El directorio NO tiene permisos de escritura<br>";
}

// Verificar permisos de lectura
if (is_readable($directorio_fotos)) {
    echo "El directorio tiene permisos de lectura<br>";
} else {
    echo "El directorio NO tiene permisos de lectura<br>";
}

// Intentar crear un archivo de prueba
$archivo_prueba = $directorio_fotos . 'test.txt';
echo "<h2>Prueba de creación de archivo:</h2>";

if (file_put_contents($archivo_prueba, 'Prueba de escritura')) {
    echo "Archivo de prueba creado exitosamente<br>";
    
    // Verificar si se puede leer el archivo
    if (file_exists($archivo_prueba)) {
        echo "El archivo de prueba existe<br>";
        
        // Intentar leer el archivo
        $contenido = file_get_contents($archivo_prueba);
        if ($contenido !== false) {
            echo "El archivo de prueba se puede leer<br>";
        } else {
            echo "El archivo de prueba NO se puede leer<br>";
        }
        
        // Eliminar el archivo de prueba
        if (unlink($archivo_prueba)) {
            echo "Archivo de prueba eliminado exitosamente<br>";
        } else {
            echo "Error al eliminar el archivo de prueba<br>";
        }
    } else {
        echo "El archivo de prueba NO existe<br>";
    }
} else {
    echo "Error al crear el archivo de prueba<br>";
}

// Mostrar el directorio actual
echo "<h2>Directorio actual:</h2>";
echo "Directorio actual: " . __DIR__ . "<br>";
echo "Directorio de fotos (relativo): " . $directorio_fotos . "<br>";
echo "Directorio de fotos (absoluto): " . realpath($directorio_fotos) . "<br>";
?>