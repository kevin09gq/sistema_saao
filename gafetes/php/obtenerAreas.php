<?php
header('Content-Type: application/json');
include("../../conexion/conexion.php");

try {
    // Detectar si existe la columna 'colores' para no romper si aún no se ejecuta el ALTER
    $tieneColoresEnAreas = false;
    $coloresColumn = $conexion->query("SHOW COLUMNS FROM areas LIKE 'colores'");
    if ($coloresColumn && $coloresColumn->num_rows > 0) {
        $tieneColoresEnAreas = true;
    }

    // Detectar si existe la columna 'colores_texto' (color del texto dentro del rectángulo del nombre)
    $tieneColoresTextoEnAreas = false;
    $coloresTextoColumn = $conexion->query("SHOW COLUMNS FROM areas LIKE 'colores_texto'");
    if ($coloresTextoColumn && $coloresTextoColumn->num_rows > 0) {
        $tieneColoresTextoEnAreas = true;
    }

    $sql = "SELECT id_area, nombre_area, logo_area" .
        ($tieneColoresEnAreas ? ", colores" : "") .
        ($tieneColoresTextoEnAreas ? ", colores_texto" : "") .
        " FROM areas ORDER BY nombre_area";
    $query = $conexion->query($sql);

    if (!$query) {
        throw new Exception("Error en la consulta: " . $conexion->connect_error);
    }

    $arreglo = array();
    while ($row = $query->fetch_object()) {
        $arreglo[] = array(
            "id_area" => $row->id_area,
            "nombre_area" => $row->nombre_area,
            "logo_area" => $row->logo_area,
            "colores" => $tieneColoresEnAreas ? ($row->colores ?? null) : null,
            "colores_texto" => $tieneColoresTextoEnAreas ? ($row->colores_texto ?? null) : null
        );
    }

    echo json_encode([
        'success' => true,
        'meta' => [
            'tieneColores' => $tieneColoresEnAreas,
            'tieneColoresTexto' => $tieneColoresTextoEnAreas
        ],
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