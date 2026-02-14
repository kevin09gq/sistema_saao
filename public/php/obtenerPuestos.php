<?php
include("../../conexion/conexion.php");

// Verificar si se envió un id_departamento para filtrar
if (isset($_POST['id_departamento']) && !empty($_POST['id_departamento'])) {
    $id_departamento = (int)$_POST['id_departamento'];
    // Obtener solo los puestos relacionados con ese departamento
    $sql = "SELECT DISTINCT p.id_puestoEspecial, p.nombre_puesto 
            FROM puestos_especiales p
            INNER JOIN departamentos_puestos dp
            ON p.id_puestoEspecial = dp.id_puestoEspecial
            WHERE dp.id_departamento = ?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("i", $id_departamento);
    $stmt->execute();
    $query = $stmt->get_result();
} else {
    // Si no se envía id_departamento, obtener todos los puestos
    $sql = "SELECT * FROM puestos_especiales ORDER BY nombre_puesto ASC";
    $query = $conexion->query($sql);
}

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