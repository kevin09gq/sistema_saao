<?php

require_once __DIR__ . "/../../../conexion/conexion.php";
/** @var mysqli $conexion */

$accion = $_POST['accion'] ?? $_GET['accion'] ?? '';

// VALIDAR A QUE FUNCION SE VA A LLAMAR A TRAVEZ DEL CASE

switch ($accion) {

    case 'obtenerContactoEmergencia':
        obtenerContactoEmergencia($conexion);
        break;

    case 'guardarContactoEmergencia':
        guardarContactoEmergencia($conexion);
        break;

    default:
        echo json_encode([
            "success" => false,
            "mensaje" => "Acción no válida."
        ]);
        break;
}


//====================================================
// FUNCIÓN PARA OBTENER LA INFORMACIÓN DEL CONTACTO 
// DE EMERGENCIA
//====================================================

function obtenerContactoEmergencia(mysqli $conexion)
{
    // obtener el id del empleado
    $id_empleado = $_POST['id_empleado'] ?? '';

    // validar que se haya recibido el id del empleado
    if ($id_empleado === '') {

        echo json_encode([
            "success" => false,
            "mensaje" => "No se recibio el id del empleado."
        ]);

        return;
    }

    // consultar la informacion del contacto de emergencia
    $sql = "SELECT
                ce.id_contacto,
                ce.nombre,
                ce.ap_paterno,
                ce.ap_materno,
                ce.telefono,
                ce.domicilio,
                ec.parentesco

            FROM empleado_contacto ec

            INNER JOIN contacto_emergencia ce
                ON ce.id_contacto = ec.id_contacto

            WHERE ec.id_empleado = ?

            LIMIT 1";

    // preparar la consulta
    $stmt = mysqli_prepare($conexion, $sql);

    // validar que la consulta se haya preparado correctamente
    if (!$stmt) {

        echo json_encode([
            "success" => false,
            "mensaje" => "Error al preparar la consulta."
        ]);

        return;
    }

    // enviar el id del empleado a la consulta
    mysqli_stmt_bind_param(
        $stmt,
        "i",
        $id_empleado
    );

    // ejecutar la consulta
    mysqli_stmt_execute($stmt);

    // obtener el resultado
    $resultado = mysqli_stmt_get_result($stmt);

    // obtener los datos del contacto
    $contacto = mysqli_fetch_assoc($resultado);

    // cerrar la consulta
    mysqli_stmt_close($stmt);

    // verificar si el empleado tiene un contacto registrado
    if (!$contacto) {

        echo json_encode([
            "success" => true,
            "existe" => false,
            "mensaje" => "El empleado no tiene un contacto de emergencia registrado."
        ]);

        return;
    }

    // devolver la informacion del contacto
    echo json_encode([
        "success" => true,
        "existe" => true,
        "contacto" => $contacto
    ]);
}


//====================================================
// GUARDAR O ACTUALIZAR LA INFORMACIÓN DEL 
// CONTACTO DE EMERGENCIA
//====================================================

function guardarContactoEmergencia(mysqli $conexion)
{
    // Obtener los datos enviados desde JavaScript
    $id_empleado = intval($_POST['id_empleado'] ?? 0);

    // Obtener los datos del contacto
    $nombre = mb_strtoupper(trim($_POST['nombre'] ?? ''), 'UTF-8');
    $ap_paterno = mb_strtoupper(trim($_POST['ap_paterno'] ?? ''), 'UTF-8');
    $ap_materno = mb_strtoupper(trim($_POST['ap_materno'] ?? ''), 'UTF-8');
    $telefono = trim($_POST['telefono'] ?? '');
    $domicilio = mb_strtoupper(trim($_POST['domicilio'] ?? ''), 'UTF-8');
    $parentesco = mb_strtoupper(trim($_POST['parentesco'] ?? ''), 'UTF-8');

    // Validar que se haya recibido el ID del empleado
    if ($id_empleado <= 0) {
        echo json_encode([
            "success" => false,
            "mensaje" => "No se recibió un ID de empleado válido."
        ]);
        return;
    }

    // Validar que se haya recibido el nombre
    if ($nombre === '') {
        echo json_encode([
            "success" => false,
            "mensaje" => "El nombre del contacto es obligatorio."
        ]);
        return;
    }

    // Iniciar transacción
    mysqli_begin_transaction($conexion);

    try {
       
        // 1. VERIFICAR SI EL EMPLEADO YA TIENE UN CONTACTO DE EMERGENCIA
       
        $sqlRelacionActual = "SELECT id_empleado_contacto, id_contacto, parentesco
                              FROM empleado_contacto
                              WHERE id_empleado = ?
                              LIMIT 1";

        $stmtRelacionActual = mysqli_prepare($conexion, $sqlRelacionActual);
        if (!$stmtRelacionActual) {
            throw new Exception("Error al consultar la relación actual del empleado: " . mysqli_error($conexion));
        }

        mysqli_stmt_bind_param($stmtRelacionActual, "i", $id_empleado);
        mysqli_stmt_execute($stmtRelacionActual);
        $resRelacionActual = mysqli_stmt_get_result($stmtRelacionActual);
        $relacionActual = mysqli_fetch_assoc($resRelacionActual);
        mysqli_stmt_close($stmtRelacionActual);

        $id_contacto_usar = 0;
        $accionRealizada = "";

        if ($relacionActual) {
           
            // EL EMPLEADO YA TIENE UN CONTACTO ASIGNADO PREVIAMENTE
           
            $id_contacto_anterior = intval($relacionActual['id_contacto']);
            $id_empleado_contacto = intval($relacionActual['id_empleado_contacto']);

            // Verificar cuántos empleados están utilizando este mismo contacto
            $sqlCountUsos = "SELECT COUNT(*) AS total FROM empleado_contacto WHERE id_contacto = ?";
            $stmtCountUsos = mysqli_prepare($conexion, $sqlCountUsos);
            mysqli_stmt_bind_param($stmtCountUsos, "i", $id_contacto_anterior);
            mysqli_stmt_execute($stmtCountUsos);
            $resCount = mysqli_stmt_get_result($stmtCountUsos);
            $rowCount = mysqli_fetch_assoc($resCount);
            $totalUsos = intval($rowCount['total'] ?? 0);
            mysqli_stmt_close($stmtCountUsos);

            if ($totalUsos <= 1) {
               
                // CASO 1: SOLO ESTE EMPLEADO USA EL CONTACTO
                // -> Se actualiza directamente el registro del contacto existente
               
                $sqlUpdContacto = "UPDATE contacto_emergencia
                                   SET nombre = ?,
                                       ap_paterno = ?,
                                       ap_materno = ?,
                                       telefono = ?,
                                       domicilio = ?
                                   WHERE id_contacto = ?";

                $stmtUpdContacto = mysqli_prepare($conexion, $sqlUpdContacto);
                if (!$stmtUpdContacto) {
                    throw new Exception("Error al preparar la actualización del contacto: " . mysqli_error($conexion));
                }

                mysqli_stmt_bind_param($stmtUpdContacto, "sssssi", $nombre, $ap_paterno, $ap_materno, $telefono, $domicilio, $id_contacto_anterior);
                if (!mysqli_stmt_execute($stmtUpdContacto)) {
                    mysqli_stmt_close($stmtUpdContacto);
                    throw new Exception("Error al actualizar los datos del contacto de emergencia.");
                }
                mysqli_stmt_close($stmtUpdContacto);

                $id_contacto_usar = $id_contacto_anterior;
                $accionRealizada = "actualizado_directo";
            } else {
               
                // CASO 2: EL CONTACTO ANTERIOR ESTÁ COMPARTIDO CON OTROS EMPLEADOS
                // -> No podemos sobreescribirlo para no alterar a los demás empleados.
                // -> Buscamos si ya existe otro contacto con el nuevo nombre o lo creamos nuevo.
                
                $sqlBusqueda = "SELECT id_contacto
                                FROM contacto_emergencia
                                WHERE nombre = ?
                                  AND ap_paterno = ?
                                  AND ap_materno = ?
                                LIMIT 1";

                $stmtBusqueda = mysqli_prepare($conexion, $sqlBusqueda);
                mysqli_stmt_bind_param($stmtBusqueda, "sss", $nombre, $ap_paterno, $ap_materno);
                mysqli_stmt_execute($stmtBusqueda);
                $resBusqueda = mysqli_stmt_get_result($stmtBusqueda);
                $contactoExistente = mysqli_fetch_assoc($resBusqueda);
                mysqli_stmt_close($stmtBusqueda);

                if ($contactoExistente) {
                    // Ya existía ese contacto en el catálogo, actualizamos teléfono y domicilio
                    $id_contacto_usar = intval($contactoExistente['id_contacto']);

                    $sqlUpd = "UPDATE contacto_emergencia SET telefono = ?, domicilio = ? WHERE id_contacto = ?";
                    $stmtUpd = mysqli_prepare($conexion, $sqlUpd);
                    mysqli_stmt_bind_param($stmtUpd, "ssi", $telefono, $domicilio, $id_contacto_usar);
                    mysqli_stmt_execute($stmtUpd);
                    mysqli_stmt_close($stmtUpd);

                    $accionRealizada = "vinculado_existente";
                } else {
                    // Creamos un nuevo registro independiente para este empleado
                    $sqlIns = "INSERT INTO contacto_emergencia (nombre, ap_paterno, ap_materno, telefono, domicilio)
                               VALUES (?, ?, ?, ?, ?)";
                    $stmtIns = mysqli_prepare($conexion, $sqlIns);
                    mysqli_stmt_bind_param($stmtIns, "sssss", $nombre, $ap_paterno, $ap_materno, $telefono, $domicilio);
                    if (!mysqli_stmt_execute($stmtIns)) {
                        mysqli_stmt_close($stmtIns);
                        throw new Exception("Error al crear el nuevo contacto de emergencia.");
                    }
                    $id_contacto_usar = mysqli_insert_id($conexion);
                    mysqli_stmt_close($stmtIns);

                    $accionRealizada = "nuevo_creado_por_compartido";
                }
            }

            // Actualizar la relación con el empleado y el parentesco
            $sqlUpdRelacion = "UPDATE empleado_contacto
                               SET id_contacto = ?,
                                   parentesco = ?
                               WHERE id_empleado_contacto = ?";

            $stmtUpdRelacion = mysqli_prepare($conexion, $sqlUpdRelacion);
            if (!$stmtUpdRelacion) {
                throw new Exception("Error al preparar la actualización del parentesco: " . mysqli_error($conexion));
            }

            mysqli_stmt_bind_param($stmtUpdRelacion, "isi", $id_contacto_usar, $parentesco, $id_empleado_contacto);
            if (!mysqli_stmt_execute($stmtUpdRelacion)) {
                mysqli_stmt_close($stmtUpdRelacion);
                throw new Exception("Error al actualizar la asignación del contacto.");
            }
            mysqli_stmt_close($stmtUpdRelacion);
        } else {
            
            // EL EMPLEADO NO TENÍA NINGÚN CONTACTO ASIGNADO PREVIAMENTE
            
            // Buscar si ya existe un contacto con ese nombre completo
            $sqlBusqueda = "SELECT id_contacto
                            FROM contacto_emergencia
                            WHERE nombre = ?
                              AND ap_paterno = ?
                              AND ap_materno = ?
                            LIMIT 1";

            $stmtBusqueda = mysqli_prepare($conexion, $sqlBusqueda);
            mysqli_stmt_bind_param($stmtBusqueda, "sss", $nombre, $ap_paterno, $ap_materno);
            mysqli_stmt_execute($stmtBusqueda);
            $resBusqueda = mysqli_stmt_get_result($stmtBusqueda);
            $contactoExistente = mysqli_fetch_assoc($resBusqueda);
            mysqli_stmt_close($stmtBusqueda);

            if ($contactoExistente) {
                $id_contacto_usar = intval($contactoExistente['id_contacto']);

                $sqlUpd = "UPDATE contacto_emergencia SET telefono = ?, domicilio = ? WHERE id_contacto = ?";
                $stmtUpd = mysqli_prepare($conexion, $sqlUpd);
                mysqli_stmt_bind_param($stmtUpd, "ssi", $telefono, $domicilio, $id_contacto_usar);
                mysqli_stmt_execute($stmtUpd);
                mysqli_stmt_close($stmtUpd);

                $accionRealizada = "vinculado_existente";
            } else {
                $sqlIns = "INSERT INTO contacto_emergencia (nombre, ap_paterno, ap_materno, telefono, domicilio)
                           VALUES (?, ?, ?, ?, ?)";
                $stmtIns = mysqli_prepare($conexion, $sqlIns);
                mysqli_stmt_bind_param($stmtIns, "sssss", $nombre, $ap_paterno, $ap_materno, $telefono, $domicilio);
                if (!mysqli_stmt_execute($stmtIns)) {
                    mysqli_stmt_close($stmtIns);
                    throw new Exception("Error al registrar el contacto de emergencia.");
                }
                $id_contacto_usar = mysqli_insert_id($conexion);
                mysqli_stmt_close($stmtIns);

                $accionRealizada = "nuevo_registrado";
            }

            // Insertar la nueva relación para el empleado
            $sqlInsRelacion = "INSERT INTO empleado_contacto (id_empleado, id_contacto, parentesco)
                               VALUES (?, ?, ?)";

            $stmtInsRelacion = mysqli_prepare($conexion, $sqlInsRelacion);
            if (!$stmtInsRelacion) {
                throw new Exception("Error al preparar la asignación del contacto: " . mysqli_error($conexion));
            }

            mysqli_stmt_bind_param($stmtInsRelacion, "iis", $id_empleado, $id_contacto_usar, $parentesco);
            if (!mysqli_stmt_execute($stmtInsRelacion)) {
                mysqli_stmt_close($stmtInsRelacion);
                throw new Exception("Error al asignar el contacto al empleado.");
            }
            mysqli_stmt_close($stmtInsRelacion);
        }

     
        // 2. CONFIRMAR CAMBIOS (COMMIT)
       
        mysqli_commit($conexion);

        echo json_encode([
            "success" => true,
            "accion" => $accionRealizada,
            "id_contacto" => $id_contacto_usar,
            "mensaje" => "Contacto de emergencia guardado correctamente."
        ]);
    } catch (Exception $e) {
        // En caso de error, revertir cambios
        mysqli_rollback($conexion);

        echo json_encode([
            "success" => false,
            "mensaje" => $e->getMessage()
        ]);
    }
}
