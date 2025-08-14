<?php
include("../../conexion/conexion.php");

$sql = "SELECT * FROM areas";
$query = $conexion->query($sql);

if (!$query) {
    die("Ocurrió un error: " . $conexion->connect_error);
}

$arreglo = array();
while ($row = $query->fetch_object()) {
    $arreglo[] = array(
        "id_area" => $row->id_area,
        "nombre_area" => $row->nombre_area,
    );
}

$json = json_encode($arreglo, JSON_UNESCAPED_UNICODE);

print_r($json);