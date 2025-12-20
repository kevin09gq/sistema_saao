<?php
include "../../conexion/conexion.php";

// Decodificar los datos enviados desde el cliente
$data = json_decode(file_get_contents("php://input"), true);
$biometricos = $data["biometricos"] ?? [];

// Preparar la consulta con placeholders
$placeholders = implode(',', array_fill(0, count($biometricos), '?'));
$tipos = str_repeat('i', count($biometricos));

$resultado = [];

if (!empty($biometricos)) {
    $sql = $conexion->prepare(
        "SELECT clave_empleado, nombre, ap_paterno, ap_materno, biometrico FROM info_empleados 
         WHERE biometrico IN ($placeholders) 
           AND id_status = 1 
           AND (imss = '' OR status_nss = 0)
           AND (id_departamento = 1 OR id_departamento = 2 OR id_departamento = 3 OR id_departamento = 8)"
    );
    $sql->bind_param($tipos, ...$biometricos);
    $sql->execute();
    $res = $sql->get_result();
    while ($row = $res->fetch_assoc()) {
        $resultado[] = $row;
    }
    $sql->close();
}

// Devolver los resultados en formato JSON
echo json_encode($resultado, JSON_UNESCAPED_UNICODE);
$conexion->close();
