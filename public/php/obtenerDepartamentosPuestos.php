<?php
include("../../conexion/conexion.php");

$sql = "SELECT 
            dp.id_departamento_puesto,
            dp.id_departamento,
            dp.id_puestoEspecial,
            d.nombre_departamento,
            p.nombre_puesto
        FROM departamentos_puestos dp
        INNER JOIN departamentos d ON dp.id_departamento = d.id_departamento
        INNER JOIN puestos_especiales p ON dp.id_puestoEspecial = p.id_puestoEspecial
        ORDER BY dp.id_departamento_puesto ASC";
$query = $conexion->query($sql);

if (!$query) {
    die("Ocurrió un error: " . $conexion->connect_error);
}

$arreglo = array();
while ($row = $query->fetch_object()) {
    $arreglo[] = array(
        "id_departamento_puesto" => $row->id_departamento_puesto,
        "id_departamento" => $row->id_departamento,
        "id_puestoEspecial" => $row->id_puestoEspecial,
        "nombre_departamento" => $row->nombre_departamento,
        "nombre_puesto" => $row->nombre_puesto,
    );
}

echo json_encode($arreglo, JSON_UNESCAPED_UNICODE);