<?php
include("../../conexion/conexion.php");

$sql = "SELECT * FROM departamentos WHERE id_departamento =1 OR id_departamento =2 OR id_departamento =3 OR id_departamento =8 ORDER BY nombre_departamento";
$query = $conexion->query($sql);

if (!$query) {
    die("Ocurrió un error: " . $conexion->connect_error);
}

$arreglo = array();
while ($row = $query->fetch_object()) {
    $arreglo[] = array(
        "id_departamento" => $row->id_departamento,
        "nombre_departamento" => $row->nombre_departamento,
    );
}

$json = json_encode($arreglo, JSON_UNESCAPED_UNICODE);

print_r($json);