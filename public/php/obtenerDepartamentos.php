<?php
include("../../conexion/conexion.php");

$arreglo = array();

// Si se envía un área → filtrar departamentos relacionados
if (isset($_POST['id_area']) && !empty($_POST['id_area'])) {

    // Recibir el ID del área y asegurarse de que sea un número entero
    $id_area = (int)$_POST['id_area'];

    // SQL para obtener departamentos relacionados con el área específica
    $sql = "SELECT DISTINCT
                d.id_departamento,
                d.nombre_departamento
            FROM departamentos d
            INNER JOIN areas_departamentos ad 
                ON d.id_departamento = ad.id_departamento
            WHERE ad.id_area = ?";

    // Preparar la consulta para evitar inyección SQL
    $stmt = $conexion->prepare($sql);

    // Verificar si la preparación fue exitosa
    if (!$stmt) {
        die("Error en prepare: " . $conexion->error);
    }

    // Vincular el parámetro y ejecutar la consulta
    $stmt->bind_param("i", $id_area);
    $stmt->execute();
    $query = $stmt->get_result();

} else {
    // Si NO hay área → traer TODOS los departamentos
    $sql = "SELECT id_departamento, nombre_departamento FROM departamentos";
    $query = $conexion->query($sql);

    if (!$query) {
        die("Error en query: " . $conexion->error);
    }
}

// Armar arreglo
while ($row = $query->fetch_object()) {
    $arreglo[] = array(
        "id_departamento" => $row->id_departamento,
        "nombre_departamento" => $row->nombre_departamento
    );
}

// Respuesta JSON
echo json_encode($arreglo, JSON_UNESCAPED_UNICODE);