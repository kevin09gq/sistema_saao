<?php
header('Content-Type: application/json');
include("../../conexion/conexion.php");

try {
    $sql = "SELECT id_area, nombre_area, logo_area FROM areas ORDER BY nombre_area";
    $query = $conexion->query($sql);

    if (!$query) {
        throw new Exception("Error en la consulta: " . $conexion->connect_error);
    }

    $arreglo = array();
    while ($row = $query->fetch_object()) {
        $arreglo[] = array(
            "id_area" => $row->id_area,
            "nombre_area" => $row->nombre_area,
            "logo_area" => $row->logo_area
        );
    }

    echo json_encode([
        'success' => true,
        'data' => $arreglo
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}

$conexion->close();
?>