<?php

require_once '../../../conexion/conexion.php';
/** @var mysqli $conexion */

$accion = $_POST['accion'] ?? $_GET['accion'] ?? '';

// VALIDAR A QUE FUNCION SE VA A LLAMAR A TRAVEZ DEL CASE

switch ($accion) {

    case 'obtenerNominas':
        obtenerNominas($conexion);
        break;
    
    case 'obtenerNominaPorId':
        obtenerNominaPorId($conexion);
        break;

    default:
        echo json_encode([
            "success" => false,
            "mensaje" => "Acción no válida."
        ]);
        break;
}


//===================================================
// FUNCIÓN PARA OBTENER LAS NÓMINAS REGISTRADAS
//===================================================

function obtenerNominas(mysqli $conexion)
{

    $sql = "SELECT
                id_nomina_40lbs,
                id_empresa,
                anio,
                numero_semana,
                total_percepciones,
                total_deducciones,
                total_neto
            FROM nomina_40lbs
            ORDER BY anio DESC,
                     numero_semana DESC";

    $resultado = $conexion->query($sql);

    if (!$resultado) {

        echo json_encode([
            "success" => false,
            "mensaje" => $conexion->error
        ]);

        return;
    }

    $nominas = [];

    while ($fila = $resultado->fetch_assoc()) {

        $nominas[] = $fila;
    }

    echo json_encode([
        "success" => true,
        "nominas" => $nominas
    ]);
}

//===================================================
// FUNCIÓN PARA OBTENER UNA NÓMINA POR SU ID
//===================================================

function obtenerNominaPorId(mysqli $conexion)
{

    // obtener el id de la nómina enviado por GET o POST
    $idNomina = $_POST['id_nomina'] ?? $_GET['id_nomina'] ?? '';

    // validar que se haya enviado el id
    if ($idNomina === '') {

        echo json_encode([
            "success" => false,
            "mensaje" => "No se recibió el ID de la nómina."
        ]);

        return;
    }

    // convertir el id a entero
    $idNomina = intval($idNomina);

    // consultar la nómina seleccionada
    $sql = "SELECT
                nomina_40lbs
            FROM nomina_40lbs
            WHERE id_nomina_40lbs = ?";

    // preparar la consulta
    $stmt = $conexion->prepare($sql);

    // validar que la consulta se haya preparado correctamente
    if (!$stmt) {

        echo json_encode([
            "success" => false,
            "mensaje" => $conexion->error
        ]);

        return;
    }

    // enviar el id de la nómina
    $stmt->bind_param("i", $idNomina);

    // ejecutar la consulta
    $stmt->execute();

    // obtener el resultado
    $resultado = $stmt->get_result();

    // validar si existe la nómina
    if ($resultado->num_rows === 0) {

        echo json_encode([
            "success" => false,
            "mensaje" => "La nómina no existe."
        ]);

        $stmt->close();

        return;
    }

    // obtener la información de la nómina
    $nomina = $resultado->fetch_assoc();

    // convertir el JSON almacenado en la base de datos a objeto
    $nomina['nomina_40lbs'] = json_decode($nomina['nomina_40lbs'], true);

    // regresar la información de la nómina
    echo json_encode([
        "success" => true,
        "nomina" => $nomina
    ]);

    // cerrar la consulta
    $stmt->close();

}