<?php
header('Content-Type: application/json');
include("../../conexion/conexion.php");

try {
    $sql = "SELECT id_empresa, nombre_empresa, logo_empresa FROM empresa ORDER BY nombre_empresa";
    $query = $conexion->query($sql);

    if (!$query) {
        throw new Exception("Error en la consulta: " . $conexion->connect_error);
    }

    $arreglo = array();
    while ($row = $query->fetch_object()) {
        $arreglo[] = array(
            "id_empresa" => $row->id_empresa,
            "nombre_empresa" => $row->nombre_empresa,
            "logo_empresa" => $row->logo_empresa
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