<?php
include("../../conexion/conexion.php");

$sql = "SELECT * FROM puestos_especiales";
$query = $conexion->query($sql);

if (!$query) {
    die("Ocurrió un error: " . $conexion->connect_error);
}

$arreglo = array();
while ($row = $query->fetch_object()) {
    $arreglo[] = array(
        "id_puestoEspecial" => $row->id_puestoEspecial,
        "nombre_puesto" => $row->nombre_puesto,
    );
}

$json = json_encode($arreglo, JSON_UNESCAPED_UNICODE);

print_r($json);