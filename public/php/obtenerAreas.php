<?php
include("../../conexion/conexion.php");

// Verificar la conexión
if (!$conexion) {
    die(json_encode(array("error" => true, "message" => "Error de conexión: " . mysqli_connect_error())));
}

// Consulta para obtener todas las áreas
$sql = "SELECT id_area, nombre_area, logo_area FROM areas ORDER BY nombre_area";
$resultado = mysqli_query($conexion, $sql);

// Verificar si hay resultados
if (!$resultado) {
    die(json_encode(array("error" => true, "message" => "Error en la consulta: " . mysqli_error($conexion))));
}

// Crear array para almacenar las áreas
$areas = array();

// Obtener cada fila como un array asociativo
while ($fila = mysqli_fetch_assoc($resultado)) {
    $areas[] = $fila;
}

// Devolver las áreas como JSON
echo json_encode($areas);

// Cerrar la conexión
mysqli_close($conexion);
?>