<?php
// Configuración de la base de datos
$db_host = 'localhost';
$db_user = 'root';
$db_pass = 'cuates2003';
$db_name = 'sistema_nomina';

// Nombre del archivo de respaldo
$backup_file = 'respaldo_' . date('Y-m-d_His') . '.sql';

// Conectar a la base de datos
$mysqli = new mysqli($db_host, $db_user, $db_pass, $db_name);

// Verificar la conexión
if ($mysqli->connect_error) {
    die("Error de conexión: " . $mysqli->connect_error);
}

// Configurar el charset
$mysqli->set_charset("utf8mb4");

// Iniciar el contenido del archivo SQL
$sql_content = "";
$sql_content .= "-- Respaldo de Base de Datos: $db_name\n";
$sql_content .= "-- Fecha: " . date('Y-m-d H:i:s') . "\n";
$sql_content .= "-- Generado por Sistema SAAO\n\n";
$sql_content .= "SET FOREIGN_KEY_CHECKS=0;\n";
$sql_content .= "SET SQL_MODE = \"NO_AUTO_VALUE_ON_ZERO\";\n";
$sql_content .= "SET time_zone = \"+00:00\";\n\n";

// Obtener todas las tablas
$tables = array();
$result = $mysqli->query("SHOW TABLES");
while ($row = $result->fetch_row()) {
    $tables[] = $row[0];
}

// Exportar cada tabla
foreach ($tables as $table) {
    // Agregar DROP TABLE
    $sql_content .= "\n-- --------------------------------------------------------\n";
    $sql_content .= "-- Estructura de tabla para la tabla `$table`\n";
    $sql_content .= "-- --------------------------------------------------------\n\n";
    $sql_content .= "DROP TABLE IF EXISTS `$table`;\n\n";
    
    // Obtener la estructura de la tabla
    $result = $mysqli->query("SHOW CREATE TABLE `$table`");
    $row = $result->fetch_row();
    $sql_content .= $row[1] . ";\n\n";
    
    // Obtener los datos de la tabla
    $result = $mysqli->query("SELECT * FROM `$table`");
    if ($result->num_rows > 0) {
        $sql_content .= "-- Volcado de datos para la tabla `$table`\n\n";
        
        while ($row = $result->fetch_assoc()) {
            $sql_content .= "INSERT INTO `$table` VALUES (";
            $values = array();
            foreach ($row as $value) {
                if ($value === null) {
                    $values[] = "NULL";
                } else {
                    $values[] = "'" . $mysqli->real_escape_string($value) . "'";
                }
            }
            $sql_content .= implode(", ", $values);
            $sql_content .= ");\n";
        }
        $sql_content .= "\n";
    }
}

$sql_content .= "SET FOREIGN_KEY_CHECKS=1;\n";

// Cerrar la conexión
$mysqli->close();

// Configurar las cabeceras para la descarga
header('Content-Description: File Transfer');
header('Content-Type: application/octet-stream');
header('Content-Disposition: attachment; filename="' . $backup_file . '"');
header('Content-Transfer-Encoding: binary');
header('Expires: 0');
header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
header('Pragma: public');
header('Content-Length: ' . strlen($sql_content));

// Limpiar el buffer de salida
if (ob_get_level()) {
    ob_clean();
}

flush();

// Enviar el contenido
echo $sql_content;
exit;
?>
