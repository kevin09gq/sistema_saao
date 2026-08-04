<?php

require_once '../../conexion/conexion.php';
/** @var mysqli $conexion */

$accion = $_POST['accion'] ?? $_GET['accion'] ?? '';

// VALIDAR A QUE FUNCION SE VA A LLAMAR A TRAVEZ DEL CASE

switch ($accion) {

    case 'obtenerTabulador':
        obtenerTabulador($conexion);
        break;

    default:
        echo json_encode([
            "success" => false,
            "mensaje" => "Acción no válida."
        ]);
        break;
}

function obtenerTabulador(mysqli $conexion)
{
   
    $query = "SELECT info_tabulador FROM tabulador WHERE id_empresa = 1";
    $stmt = $conexion->prepare($query);
   
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        echo $row['info_tabulador'];
    } else {
        echo json_encode([]);
    }

    $stmt->close();
    $conexion->close();
}
