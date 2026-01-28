<?php
include '../../conexion/conexion.php';
$conn = $conexion;

header('Content-Type: application/json; charset=utf-8');

$sql = "SELECT id_empresa, nombre_empresa FROM empresa ORDER BY nombre_empresa ASC";
$result = $conn->query($sql);

$empresas = [];
while ($row = $result->fetch_assoc()) {
    $empresas[] = $row;
}

$conn->close();
echo json_encode(['success' => true, 'data' => $empresas]);
?>
