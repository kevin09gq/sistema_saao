<?php
include("../../conexion/conexion.php");

// Verificar la conexión
if (!$conexion) {
    die(json_encode(array("error" => true, "message" => "Error de conexión: " . mysqli_connect_error())));
}

// Consulta para obtener todos las festividades
$sql = "SELECT id_festividad, nombre, DATE_FORMAT(fecha, '%d/%m/%Y') AS fecha_vista FROM festividades ORDER BY fecha";
$resultado = mysqli_query($conexion, $sql);

// Verificar si hay resultados
if (!$resultado) {
    die(json_encode(array("error" => true, "message" => "Error en la consulta: " . mysqli_error($conexion))));
}

$turnos = array();

// Obtener cada fila como un array asociativo
while ($fila = mysqli_fetch_assoc($resultado)) {
    $turnos[] = $fila;
}

// Devolver los turnos como JSON
echo json_encode($turnos);

// Cerrar la conexión
mysqli_close($conexion);
?>