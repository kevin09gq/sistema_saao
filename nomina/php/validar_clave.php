<?php
include "../../conexion/conexion.php";
$data = json_decode(file_get_contents("php://input"), true);
$claves = $data["claves"] ?? [];

$placeholders = implode(',', array_fill(0, count($claves), '?'));
$tipos = str_repeat('i', count($claves));

$resultado = [];

if (!empty($claves)) {
    $sql = $conexion->prepare(
        "SELECT clave_empleado FROM info_empleados WHERE clave_empleado IN ($placeholders) AND id_status = 1"
    );
    $sql->bind_param($tipos, ...$claves);
    $sql->execute();
    $res = $sql->get_result();
    while ($row = $res->fetch_assoc()) {
        $resultado[] = $row['clave_empleado'];
    }
    $sql->close();
}

echo json_encode($resultado);
$conexion->close();