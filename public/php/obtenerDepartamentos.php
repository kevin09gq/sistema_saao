<?php
include("../../conexion/conexion.php");

$arreglo = array();

// Obtener id_area solo desde POST o GET (NO cookies)
$id_area = $_POST['id_area'] ?? $_GET['id_area'] ?? null;

if (!empty($id_area)) {

    // Asegurar que sea entero
    $id_area = (int)$id_area;

    // SQL con filtro por área
    $sql = "SELECT DISTINCT
                d.id_departamento,
                d.nombre_departamento
            FROM departamentos d
            INNER JOIN areas_departamentos ad 
                ON d.id_departamento = ad.id_departamento
            WHERE ad.id_area = ?";

    $stmt = $conexion->prepare($sql);

    if (!$stmt) {
        die("Error en prepare: " . $conexion->error);
    }

    $stmt->bind_param("i", $id_area);
    $stmt->execute();
    $query = $stmt->get_result();

} else {

    // Traer todos los departamentos si no se envía id_area
    $sql = "SELECT id_departamento, nombre_departamento FROM departamentos";
    $query = $conexion->query($sql);

    if (!$query) {
        die("Error en query: " . $conexion->error);
    }
}

// Construir arreglo
while ($row = $query->fetch_object()) {
    $arreglo[] = array(
        "id_departamento" => $row->id_departamento,
        "nombre_departamento" => $row->nombre_departamento
    );
}

// Respuesta JSON
echo json_encode($arreglo, JSON_UNESCAPED_UNICODE);