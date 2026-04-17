<?php
include("../../conexion/conexion.php");

// Verificar la conexión
if (!$conexion) {
    die(json_encode(array("error" => true, "message" => "Error de conexión: " . mysqli_connect_error())));
}

// Obtener id_departamento desde POST o GET
$id_departamento = $_POST['id_departamento'] ?? $_GET['id_departamento'] ?? null;

// Validar si viene el id_departamento
if (!empty($id_departamento)) {

    // Asegurar que sea entero
    $id_departamento = (int)$id_departamento;

    // Consulta con filtro por departamento
    $sql = "SELECT DISTINCT
                a.id_area,
                a.nombre_area,
                a.logo_area
            FROM areas a
            INNER JOIN areas_departamentos ad 
                ON a.id_area = ad.id_area
            WHERE ad.id_departamento = $id_departamento
            ORDER BY a.nombre_area";

} else {

    // Consulta sin filtro (todas las áreas)
    $sql = "SELECT id_area, nombre_area, logo_area 
            FROM areas 
            ORDER BY nombre_area";
}

// Ejecutar consulta
$resultado = mysqli_query($conexion, $sql);

// Verificar si hay resultados
if (!$resultado) {
    die(json_encode(array("error" => true, "message" => "Error en la consulta: " . mysqli_error($conexion))));
}

// Crear array para almacenar las áreas
$areas = array();

// Obtener cada fila como array asociativo
while ($fila = mysqli_fetch_assoc($resultado)) {
    $areas[] = $fila;
}

// Devolver JSON
echo json_encode($areas, JSON_UNESCAPED_UNICODE);

// Cerrar conexión
mysqli_close($conexion);
?>