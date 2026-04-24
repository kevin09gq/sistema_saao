<?php
include("../../conexion/conexion.php");

// Verificar si la conexión a la base de datos es válida
if (!$conexion) {
    die("Error de conexión: " . mysqli_connect_error());
}

$sql = "SELECT id_precio_caja, tipo, valor, precio, color_hex FROM precios_cajas ORDER BY tipo ASC, valor ASC";
$result = mysqli_query($conexion, $sql);

if (!$result) {
    echo json_encode(['error' => true, 'message' => 'Error al obtener los precios: ' . mysqli_error($conexion)]);
    exit;
}

$precios = [];
while ($row = mysqli_fetch_assoc($result)) {
    $precios[] = $row;
}

echo json_encode($precios);
?>
