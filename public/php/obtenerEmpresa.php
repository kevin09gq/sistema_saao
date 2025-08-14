<?php
include("../../conexion/conexion.php");

$sql = "SELECT * FROM empresa";
$query = $conexion->query($sql);

if (!$query) {
    die("Ocurrió un error: " . $conexion->connect_error);
}

$arreglo = array();
while ($row = $query->fetch_object()) {
    $arreglo[] = array(
        "id_empresa" => $row->id_empresa,
        "nombre_empresa" => $row->nombre_empresa,
    );
}

$json = json_encode($arreglo, JSON_UNESCAPED_UNICODE);

print_r($json);