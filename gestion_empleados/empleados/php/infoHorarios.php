<?php

require_once '../../../conexion/conexion.php';
/** @var mysqli $conexion */

$accion = $_POST['accion'] ?? $_GET['accion'] ?? '';

// VALIDAR A QUE FUNCION SE VA A LLAMAR A TRAVEZ DEL CASE

switch ($accion) {

    case 'obtenerHorarios':
        obtenerHorarios($conexion);
        break;

    case 'guardarHorarios':
        guardarHorarios($conexion);
        break;

    default:
        echo json_encode([
            "success" => false,
            "mensaje" => "Acción no válida."
        ]);
        break;
}

//====================================================
// FUNCIÓN PARA OBTENER LOS HORARIOS DE UN EMPLEADO
//====================================================

function obtenerHorarios(mysqli $conexion)
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

    // consultar los horarios del empleado
    $sql = "
        SELECT horario
        FROM empleado_horario_reloj
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

    $horarios = [];

    // si hay resultados, decodificar el JSON
    if ($fila = $resultado->fetch_assoc()) {
        $horarios = json_decode($fila['horario'], true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            echo json_encode([
                "success" => false,
                "mensaje" => "Error al decodificar los horarios."
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
        "horarios" => $horarios
    ]);
}

//====================================================
// FUNCIÓN PARA GUARDAR LOS HORARIOS DE UN EMPLEADO
//====================================================

function guardarHorarios(mysqli $conexion)
{
    // obtener el id del empleado
    $idEmpleado = $_POST['id_empleado'] ?? 0;

    // obtener los horarios
    $horarios = $_POST['horarios'] ?? '';

    // validar el id del empleado
    if (!is_numeric($idEmpleado) || $idEmpleado <= 0) {
        echo json_encode([
            "success" => false,
            "mensaje" => "El id del empleado no es válido."
        ]);
        return;
    }

    // validar que existan los horarios
    if (empty($horarios)) {
        echo json_encode([
            "success" => false,
            "mensaje" => "Los horarios son obligatorios."
        ]);
        return;
    }

    // El horario ya viene como JSON desde JavaScript, no codificar de nuevo
    $horariosJson = $horarios;

    // Formatear el JSON sin espacios extra pero con caracteres Unicode
    $horariosJson = json_encode(json_decode($horariosJson, true), JSON_UNESCAPED_UNICODE);

    // verificar si ya existe un horario para el empleado
    $sqlVerificar = "
        SELECT id
        FROM empleado_horario_reloj
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
    $existeHorario = $resultadoVerificar->num_rows > 0;
    $stmtVerificar->close();

    if ($existeHorario) {
        // actualizar el horario existente
        $sqlActualizar = "
            UPDATE empleado_horario_reloj
            SET horario = ?
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

        $stmtActualizar->bind_param("si", $horariosJson, $idEmpleado);

        if ($stmtActualizar->execute()) {
            echo json_encode([
                "success" => true,
                "mensaje" => "Horarios actualizados correctamente."
            ]);
        } else {
            echo json_encode([
                "success" => false,
                "mensaje" => "Error al actualizar los horarios."
            ]);
        }

        $stmtActualizar->close();
    } else {
        // insertar un nuevo horario
        $sqlInsertar = "
            INSERT INTO empleado_horario_reloj (id_empleado, horario)
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

        $stmtInsertar->bind_param("is", $idEmpleado, $horariosJson);

        if ($stmtInsertar->execute()) {
            echo json_encode([
                "success" => true,
                "mensaje" => "Horarios guardados correctamente."
            ]);
        } else {
            echo json_encode([
                "success" => false,
                "mensaje" => "Error al guardar los horarios."
            ]);
        }

        $stmtInsertar->close();
    }
}
