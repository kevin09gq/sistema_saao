<?php
// Usar la conexión existente
require_once __DIR__ . '/../../../conexion/conexion.php';

// Nombre del archivo de respaldo
$backup_file = 'respaldo_' . date('Y-m-d_His') . '.sql';

// Obtener el nombre de la base de datos desde la conexión
$db_name = 'sistema_nomina';

// Configurar el charset
$conexion->set_charset("utf8mb4");

// Iniciar el contenido del archivo SQL
$sql_content = "";
$sql_content .= "-- Respaldo de Base de Datos: $db_name\n";
$sql_content .= "-- Fecha: " . date('Y-m-d H:i:s') . "\n";
$sql_content .= "-- Generado por el Sistema Integral de Gestión SAAO\n\n";
$sql_content .= "SET FOREIGN_KEY_CHECKS=0;\n";
$sql_content .= "SET SQL_MODE = \"NO_AUTO_VALUE_ON_ZERO\";\n";
$sql_content .= "SET time_zone = \"+00:00\";\n\n";

// Exportar procedimientos almacenados
$result = $conexion->query("SHOW PROCEDURE STATUS WHERE Db = '$db_name'");
if ($result && $result->num_rows > 0) {
    $sql_content .= "-- --------------------------------------------------------\n";
    $sql_content .= "-- Procedimientos almacenados\n";
    $sql_content .= "-- --------------------------------------------------------\n\n";
    while ($row = $result->fetch_assoc()) {
        $proc_name = $row['Name'];
        $show_create = $conexion->query("SHOW CREATE PROCEDURE `$proc_name`");
        if ($show_create && $proc = $show_create->fetch_assoc()) {
            $sql_content .= "DROP PROCEDURE IF EXISTS `$proc_name`;\n";
            $sql_content .= $proc['Create Procedure'] . ";\n\n";
        }
    }
}

// Exportar triggers
$result = $conexion->query("SHOW TRIGGERS");
if ($result && $result->num_rows > 0) {
    $sql_content .= "-- --------------------------------------------------------\n";
    $sql_content .= "-- Triggers\n";
    $sql_content .= "-- --------------------------------------------------------\n\n";
    while ($row = $result->fetch_assoc()) {
        $trigger_name = $row['Trigger'];
        $table = $row['Table'];
        $timing = $row['Timing'];
        $event = $row['Event'];
        $statement = $row['Statement'];
        $sql_content .= "DROP TRIGGER IF EXISTS `$trigger_name`;\n";
        $sql_content .= "CREATE TRIGGER `$trigger_name` $timing $event ON `$table` FOR EACH ROW $statement;\n\n";
    }
}

// Obtener todas las tablas
$tables = array();
$result = $conexion->query("SHOW TABLES");
while ($row = $result->fetch_row()) {
    $tables[] = $row[0];
}

// Exportar cada tabla
foreach ($tables as $table) {
    $sql_content .= "\n-- --------------------------------------------------------\n";
    $sql_content .= "-- Estructura de tabla para la tabla `$table`\n";
    $sql_content .= "-- --------------------------------------------------------\n\n";
    // DROP después
    $sql_content .= "DROP TABLE IF EXISTS `$table`;\n";
    // CREATE si existe
    $result_create = $conexion->query("SHOW CREATE TABLE `$table`");
    $row_create = $result_create->fetch_row();
    $sql_content .= $row_create[1] . ";\n\n";

    // INSERTs de los datos
    $result_data = $conexion->query("SELECT * FROM `$table`");
    if ($result_data && $result_data->num_rows > 0) {
        $sql_content .= "-- Volcado de datos para la tabla `$table`\n\n";
        
        // Obtener los nombres de las columnas
        $columns = array();
        $fields = $result_data->fetch_fields();
        foreach ($fields as $field) {
            $columns[] = "`" . $field->name . "`";
        }
        $column_list = implode(", ", $columns);
        
        while ($row = $result_data->fetch_assoc()) {
            $sql_content .= "INSERT INTO `$table` ($column_list) VALUES (";
            $values = array();
            foreach ($row as $value) {
                if ($value === null) {
                    $values[] = "NULL";
                } else {
                    $values[] = "'" . $conexion->real_escape_string($value) . "'";
                }
            }
            $sql_content .= implode(", ", $values);
            $sql_content .= ");\n";
        }
        $sql_content .= "\n";
    }
}

$sql_content .= "SET FOREIGN_KEY_CHECKS=1;\n";

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