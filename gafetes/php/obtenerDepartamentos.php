<?php
// Habilitar reporte de errores para debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Verificar si la conexión existe
if (!file_exists("../../conexion/conexion.php")) {
    http_response_code(500);
    die(json_encode(array("error" => "Archivo de conexión no encontrado")));
}

include("../../conexion/conexion.php");

// Verificar si la conexión se estableció correctamente
if (!$conexion) {
    http_response_code(500);
    die(json_encode(array("error" => "No se pudo conectar a la base de datos")));
}

$sql = "SELECT * FROM departamentos ORDER BY nombre_departamento";
$query = $conexion->query($sql);

if (!$query) {
    http_response_code(500);
    die(json_encode(array("error" => "Error en la consulta: " . $conexion->error)));
}

$arreglo = array();
while ($row = $query->fetch_object()) {
    $arreglo[] = array(
        "id_departamento" => $row->id_departamento,
        "nombre_departamento" => $row->nombre_departamento,
    );
}

header('Content-Type: application/json; charset=utf-8');
echo json_encode($arreglo, JSON_UNESCAPED_UNICODE);
?>
