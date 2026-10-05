<?php

require_once __DIR__ . "/../../../conexion/conexion.php";
/** @var mysqli $conexion */

$accion = $_POST['accion'] ?? $_GET['accion'] ?? '';

// VALIDAR A QUE FUNCION SE VA A LLAMAR A TRAVEZ DEL CASE

switch ($accion) {

    case 'obtenerHorariosOficiales':
        obtenerHorariosOficiales($conexion);
        break;

    case 'guardarHorariosOficiales':
        guardarHorariosOficiales($conexion);
        break;

    default:
        echo json_encode([
            "success" => false,
            "mensaje" => "Acción no válida."
        ]);
        break;
}

//====================================================
// FUNCIÓN PARA OBTENER LOS HORARIOS OFICIALES DE UN EMPLEADO
//====================================================

function obtenerHorariosOficiales(mysqli $conexion)
{
    // obtener el id del empleado
    $idEmpleado = $_POST['id_empleado'] ?? 0;

    // validar el id del empleado
    if (!is_numeric($idEmpleado) || $idEmpleado <= 0) {
        echo json_encode([
            "success" => false,
            "mensaje" => "El id del empleado no es válido."
        ]);
        return;
    }

    // consultar los horarios oficiales del empleado
    $sql = "
        SELECT horario_oficial
        FROM horarios_oficiales
        WHERE id_empleado = ?
    ";

    // preparar la consulta
    $stmt = $conexion->prepare($sql);

    // validar que la consulta se haya preparado correctamente
    if (!$stmt) {
        echo json_encode([
            "success" => false,
            "mensaje" => "Error al preparar la consulta."
        ]);
        return;
    }

    // enviar el id del empleado
    $stmt->bind_param("i", $idEmpleado);

    // ejecutar la consulta
    $stmt->execute();

    // obtener los resultados
    $resultado = $stmt->get_result();

    $horariosOficiales = [];

    // si hay resultados, decodificar el JSON
    if ($fila = $resultado->fetch_assoc()) {
        $horariosOficiales = json_decode($fila['horario_oficial'], true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            echo json_encode([
                "success" => false,
                "mensaje" => "Error al decodificar los horarios oficiales."
            ]);
            $stmt->close();
            return;
        }
    }

    // cerrar la consulta
    $stmt->close();

    // devolver la información
    echo json_encode([
        "success" => true,
        "horarios_oficiales" => $horariosOficiales
    ]);
}

//====================================================
// FUNCIÓN PARA GUARDAR LOS HORARIOS OFICIALES DE UN EMPLEADO
//====================================================

function guardarHorariosOficiales(mysqli $conexion)
{
    // obtener el id del empleado
    $idEmpleado = $_POST['id_empleado'] ?? 0;

    // obtener los horarios oficiales
    $horariosOficiales = $_POST['horarios_oficiales'] ?? '';

    // validar el id del empleado
    if (!is_numeric($idEmpleado) || $idEmpleado <= 0) {
        echo json_encode([
            "success" => false,
            "mensaje" => "El id del empleado no es válido."
        ]);
        return;
    }

    // validar que existan los horarios oficiales
    if (empty($horariosOficiales)) {
        echo json_encode([
            "success" => false,
            "mensaje" => "Los horarios oficiales son obligatorios."
        ]);
        return;
    }

    // El horario ya viene como JSON desde JavaScript, no codificar de nuevo
    $horariosOficialesJson = $horariosOficiales;

    // Formatear el JSON sin espacios extra pero con caracteres Unicode
    $horariosOficialesJson = json_encode(json_decode($horariosOficialesJson, true), JSON_UNESCAPED_UNICODE);

    // verificar si ya existe un horario oficial para el empleado
    $sqlVerificar = "
        SELECT id_horario
        FROM horarios_oficiales
        WHERE id_empleado = ?
    ";

    $stmtVerificar = $conexion->prepare($sqlVerificar);

    if (!$stmtVerificar) {
        echo json_encode([
            "success" => false,
            "mensaje" => "Error al preparar la consulta de verificación."
        ]);
        return;
    }

    $stmtVerificar->bind_param("i", $idEmpleado);
    $stmtVerificar->execute();
    $resultadoVerificar = $stmtVerificar->get_result();
    $existeHorarioOficial = $resultadoVerificar->num_rows > 0;
    $stmtVerificar->close();

    if ($existeHorarioOficial) {
        // actualizar el horario oficial existente
        $sqlActualizar = "
            UPDATE horarios_oficiales
            SET horario_oficial = ?
            WHERE id_empleado = ?
        ";

        $stmtActualizar = $conexion->prepare($sqlActualizar);

        if (!$stmtActualizar) {
            echo json_encode([
                "success" => false,
                "mensaje" => "Error al preparar la consulta de actualización."
            ]);
            return;
        }

        $stmtActualizar->bind_param("si", $horariosOficialesJson, $idEmpleado);

        if ($stmtActualizar->execute()) {
            echo json_encode([
                "success" => true,
                "mensaje" => "Horarios oficiales actualizados correctamente."
            ]);
        } else {
            echo json_encode([
                "success" => false,
                "mensaje" => "Error al actualizar los horarios oficiales."
            ]);
        }

        $stmtActualizar->close();
    } else {
        // insertar un nuevo horario oficial
        $sqlInsertar = "
            INSERT INTO horarios_oficiales (id_empleado, horario_oficial)
            VALUES (?, ?)
        ";

        $stmtInsertar = $conexion->prepare($sqlInsertar);

        if (!$stmtInsertar) {
            echo json_encode([
                "success" => false,
                "mensaje" => "Error al preparar la consulta de inserción."
            ]);
            return;
        }

        $stmtInsertar->bind_param("is", $idEmpleado, $horariosOficialesJson);

        if ($stmtInsertar->execute()) {
            echo json_encode([
                "success" => true,
                "mensaje" => "Horarios oficiales guardados correctamente."
            ]);
        } else {
            echo json_encode([
                "success" => false,
                "mensaje" => "Error al guardar los horarios oficiales."
            ]);
        }

        $stmtInsertar->close();
    }
}
