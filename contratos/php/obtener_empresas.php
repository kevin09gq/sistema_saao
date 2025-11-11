<?php
header('Content-Type: application/json');
include("../../conexion/conexion.php");
include("../../config/config.php");

try {
    $sql = "SELECT id_empresa, nombre_empresa, marca_empresa FROM empresa ORDER BY nombre_empresa";
    $query = $conexion->query($sql);

    if (!$query) {
        throw new Exception("Error en la consulta: " . $conexion->error);
    }

    $data = [];
    while ($row = $query->fetch_object()) {
        $logoNombre = $row->marca_empresa;
        $logoUrl = $logoNombre ? ($rutaRaiz . '/contratos/logos_empresa/' . $logoNombre) : null;

        $data[] = [
            'id_empresa' => $row->id_empresa,
            'nombre_empresa' => $row->nombre_empresa,
            'marca_empresa' => $row->marca_empresa,
            'logo_url' => $logoUrl
        ];
    }

    echo json_encode([
        'success' => true,
        'data' => $data
    ], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}

$conexion->close();
