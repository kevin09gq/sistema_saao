<?php
include("../../conexion/conexion.php");

// Verificar la conexión
if (!$conexion) {
    die(json_encode(array("error" => true, "message" => "Error de conexión: " . mysqli_connect_error())));
}

$anio = isset($_GET['anio']) ? (int)$_GET['anio'] : null;

// Consulta base
if (!empty($anio)) {

    $sql = "SELECT 
                id_festividad, 
                nombre, 
                DATE_FORMAT(fecha, '%d/%m/%Y') AS fecha_vista 
            FROM festividades 
            WHERE YEAR(fecha) = ?
            ORDER BY fecha";

    $stmt = $conexion->prepare($sql);

    if (!$stmt) {
        die(json_encode(array("error" => true, "message" => "Error en prepare: " . $conexion->error)));
    }

    $stmt->bind_param("i", $anio);
    $stmt->execute();
    $resultado = $stmt->get_result();

} else {

    // Si NO se envía año → traer todo (como ya lo hacías)
    $sql = "SELECT 
                id_festividad, 
                nombre, 
                DATE_FORMAT(fecha, '%d/%m/%Y') AS fecha_vista 
            FROM festividades 
            ORDER BY fecha";

    $resultado = $conexion->query($sql);

    if (!$resultado) {
        die(json_encode(array("error" => true, "message" => "Error en la consulta: " . $conexion->error)));
    }
}

// Arreglo de resultados
$festividades = array();

while ($fila = $resultado->fetch_assoc()) {
    $festividades[] = $fila;
}

// Respuesta JSON
echo json_encode($festividades, JSON_UNESCAPED_UNICODE);

// Cerrar conexión
$conexion->close();
?>