<?php
include("../../conexion/conexion.php");

// Obtener filtros desde POST o GET
$id_departamento = $_POST['id_departamento'] ?? $_GET['id_departamento'] ?? null;
$id_puesto = $_POST['id_puesto'] ?? $_GET['id_puesto'] ?? null;

// Base del query
$sql = "SELECT 
            dp.id_departamento_puesto,
            dp.id_departamento,
            dp.id_puestoEspecial,
            d.nombre_departamento,
            p.nombre_puesto
        FROM departamentos_puestos dp
        INNER JOIN departamentos d ON dp.id_departamento = d.id_departamento
        INNER JOIN puestos_especiales p ON dp.id_puestoEspecial = p.id_puestoEspecial";

// Arreglo para condiciones
$condiciones = array();

// Agregar filtros si existen
if (!empty($id_departamento)) {
    $id_departamento = (int)$id_departamento;
    $condiciones[] = "dp.id_departamento = $id_departamento";
}

if (!empty($id_puesto)) {
    $id_puesto = (int)$id_puesto;
    $condiciones[] = "dp.id_puestoEspecial = $id_puesto";
}

// Construir WHERE si hay condiciones
if (count($condiciones) > 0) {
    $sql .= " WHERE " . implode(" AND ", $condiciones);
}

// Ejecutar query
$query = $conexion->query($sql);

if (!$query) {
    die("Ocurrió un error: " . $conexion->error);
}

// Construir arreglo
$arreglo = array();
while ($row = $query->fetch_object()) {
    $arreglo[] = array(
        "id_departamento_puesto" => $row->id_departamento_puesto,
        "id_departamento" => $row->id_departamento,
        "id_puesto" => $row->id_puestoEspecial,
        "nombre_departamento" => $row->nombre_departamento,
        "nombre_puesto" => $row->nombre_puesto,
    );
}

// Respuesta JSON
echo json_encode($arreglo, JSON_UNESCAPED_UNICODE);