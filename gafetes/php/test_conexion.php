<?php
// Configuración de conexión
$host = 'localhost';
$usuario = 'root';
$contrasena = 'cuates2003';
$base_datos = 'saao';

// Intentar conectar
$conexion = new mysqli($host, $usuario, $contrasena, $base_datos);

// Verificar conexión
if ($conexion->connect_error) {
    die("Error de conexión: " . $conexion->connect_error);
}
echo "Conexión exitosa a la base de datos\n";

// Verificar tablas
$tablas = $conexion->query("SHOW TABLES");
if ($tablas->num_rows > 0) {
    echo "\nTablas en la base de datos:\n";
    while ($fila = $tablas->fetch_array()) {
        echo "- " . $fila[0] . "\n";
    }
} else {
    echo "No se encontraron tablas en la base de datos\n";
}

// Verificar si existe la tabla info_empleados
$tabla = $conexion->query("SHOW TABLES LIKE 'info_empleados'");
if ($tabla->num_rows > 0) {
    echo "\nLa tabla 'info_empleados' existe. Mostrando estructura:\n";
    $estructura = $conexion->query("DESCRIBE info_empleados");
    while ($columna = $estructura->fetch_assoc()) {
        echo "- {$columna['Field']} ({$columna['Type']})\n";
    }
    
    // Mostrar algunos registros de ejemplo
    echo "\nAlgunos registros de ejemplo:\n";
    $registros = $conexion->query("SELECT * FROM info_empleados LIMIT 5");
    while ($fila = $registros->fetch_assoc()) {
        print_r($fila);
        echo "\n";
    }
} else {
    echo "\nLa tabla 'info_empleados' NO existe en la base de datos.\n";
}

$conexion->close();
?>
