<?php
include("../../conexion/conexion.php");

// Verificar si se envió un id_area para filtrar
if (isset($_POST['id_area']) && !empty($_POST['id_area'])) {
    $id_area = (int)$_POST['id_area'];
    $sql = "SELECT * FROM departamentos WHERE id_area = ?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("i", $id_area);
    $stmt->execute();
    $query = $stmt->get_result();
} else {
    // Si no se envía id_area, obtener todos los departamentos
    $sql = "SELECT * FROM departamentos";
    $query = $conexion->query($sql);
}

if (!$query) {
    die("Ocurrió un error: " . $conexion->connect_error);
}

$arreglo = array();

while ($row = $query->fetch_object()) {
    $arreglo[] = array(
        "id_departamento" => $row->id_departamento,
        "nombre_departamento" => $row->nombre_departamento,
        "id_area" => $row->id_area
    );
}

$json = json_encode($arreglo, JSON_UNESCAPED_UNICODE);

print_r($json);