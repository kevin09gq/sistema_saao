<?php
include "../../conexion/conexion.php";

header('Content-Type: application/json; charset=UTF-8');

// Decodificar los datos enviados desde el cliente
$data = json_decode(file_get_contents("php://input"), true);
$biometricos = $data["biometricos"] ?? [];
$clavesExcluidas = $data["claves_excluidas"] ?? []; // Claves de empleados que ya están en la lista de raya

$resultado = [];

// Si se proporcionan IDs biométricos, buscar por esos IDs (comportamiento original)
if (!empty($biometricos)) {
    $placeholders = implode(',', array_fill(0, count($biometricos), '?'));
    $tipos = str_repeat('i', count($biometricos));
    
    $sql = $conexion->prepare(
        "SELECT clave_empleado, nombre, ap_paterno, ap_materno, salario_semanal, salario_diario, id_departamento, id_empresa, biometrico FROM info_empleados 
         WHERE biometrico IN ($placeholders) 
           AND id_status = 1 
           AND (imss = '' OR status_nss = 0)
           AND (id_departamento = 1 OR id_departamento = 2 OR id_departamento = 3 OR id_departamento = 9)
           ORDER BY nombre, ap_paterno, ap_materno"
    );
    $sql->bind_param($tipos, ...$biometricos);
    $sql->execute();
    $res = $sql->get_result();
    while ($row = $res->fetch_assoc()) {
        $resultado[] = $row;
    }
    $sql->close();
} else {
    // Si NO se proporcionan IDs biométricos, obtener TODOS los empleados sin IMSS
    // pero excluyendo los que ya están en la lista de raya
    $sql = null;
    
    if (!empty($clavesExcluidas)) {
        // Excluir las claves que ya están en la lista de raya
        $placeholders = implode(',', array_fill(0, count($clavesExcluidas), '?'));
        $tipos = str_repeat('s', count($clavesExcluidas));
        
        $sql = $conexion->prepare(
            "SELECT clave_empleado, nombre, ap_paterno, ap_materno, salario_semanal, salario_diario, id_departamento, id_empresa, biometrico FROM info_empleados 
             WHERE id_status = 1 
               AND (imss = '' OR status_nss = 0)
               AND (id_departamento = 1 OR id_departamento = 2 OR id_departamento = 3 OR id_departamento = 9)
               AND biometrico IS NOT NULL 
               AND biometrico <> 0
               AND clave_empleado NOT IN ($placeholders)
               ORDER BY nombre, ap_paterno, ap_materno"
        );
        $sql->bind_param($tipos, ...$clavesExcluidas);
    } else {
        // Si no hay claves excluidas, obtener todos los empleados sin IMSS
        $sql = $conexion->prepare(
            "SELECT clave_empleado, nombre, ap_paterno, ap_materno, salario_semanal, salario_diario, id_departamento, id_empresa, biometrico FROM info_empleados 
             WHERE id_status = 1 
               AND (imss = '' OR status_nss = 0)
               AND (id_departamento = 1 OR id_departamento = 2 OR id_departamento = 3 OR id_departamento = 9)
               AND biometrico IS NOT NULL 
               AND biometrico <> 0
               ORDER BY nombre, ap_paterno, ap_materno"
        );
    }
    
    if ($sql) {
        if (!empty($clavesExcluidas)) {
            $sql->execute();
        } else {
            $sql->execute();
        }
        $res = $sql->get_result();
        while ($row = $res->fetch_assoc()) {
            $resultado[] = $row;
        }
        $sql->close();
    }
}

// Devolver los resultados en formato JSON
echo json_encode($resultado, JSON_UNESCAPED_UNICODE);
$conexion->close();
