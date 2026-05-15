<?php
require_once '../../conexion/conexion.php';

$action = $_POST['action'] ?? '';

switch ($action) {
    case 'obtenerAreas':
        obtenerAreas($conexion);
        break;
    case 'obtenerDepartamentos':
        obtenerDepartamentos($conexion);
        break;
    default:
        echo json_encode(['error' => 'Acción no válida']);
        break;
}

function obtenerAreas($conexion) {
    $sql = "SELECT id_area, nombre_area FROM areas ORDER BY nombre_area ASC";
    $result = mysqli_query($conexion, $sql);
    
    $areas = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $areas[] = $row;
    }
    echo json_encode($areas);
}

function obtenerDepartamentos($conexion) {
    $id_area = $_POST['id_area'] ?? '';

    if ($id_area != '') {
        // Obtener departamentos ligados a un área específica
        $sql = "SELECT d.id_departamento, d.nombre_departamento 
                FROM departamentos d
                INNER JOIN areas_departamentos ad ON d.id_departamento = ad.id_departamento
                WHERE ad.id_area = '$id_area'
                ORDER BY d.nombre_departamento ASC";
    } else {
        // Obtener todos los departamentos
        $sql = "SELECT id_departamento, nombre_departamento FROM departamentos ORDER BY nombre_departamento ASC";
    }

    $result = mysqli_query($conexion, $sql);
    
    $departamentos = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $departamentos[] = $row;
    }
    echo json_encode($departamentos);
}
?>
