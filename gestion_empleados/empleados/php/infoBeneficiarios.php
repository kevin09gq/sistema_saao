<?php

require_once '../../../conexion/conexion.php';
/** @var mysqli $conexion */

$accion = $_POST['accion'] ?? $_GET['accion'] ?? '';

// VALIDAR A QUE FUNCION SE VA A LLAMAR A TRAVEZ DEL CASE

switch ($accion) {

    case 'obtenerBeneficiarios':
        obtenerBeneficiarios($conexion);
        break;

    case 'guardarBeneficiario':
        guardarBeneficiario($conexion);
        break;

    case 'actualizarBeneficiario':
        actualizarBeneficiario($conexion);
        break;

    case 'eliminarBeneficiario':
        eliminarBeneficiario($conexion);
        break;

    default:
        echo json_encode([
            "success" => false,
            "mensaje" => "Acción no válida."
        ]);
        break;
}


//====================================================
// FUNCIÓN PARA OBTENER LOS BENEFICIARIOS
// DEL EMPLEADO
//====================================================

function obtenerBeneficiarios(mysqli $conexion)
{
    // obtener el id del empleado
    $id_empleado = intval($_POST['id_empleado'] ?? 0);

    // validar que se haya recibido el id del empleado
    if ($id_empleado <= 0) {

        echo json_encode([
            "success" => false,
            "mensaje" => "No se recibió el id del empleado."
        ]);

        return;
    }

    // consultar los beneficiarios del empleado
    $sql = "SELECT
                eb.id_empleado_beneficiario,
                eb.id_beneficiario,
                b.nombre,
                b.ap_paterno,
                b.ap_materno,
                eb.parentesco,
                eb.porcentaje

            FROM empleado_beneficiario eb

            INNER JOIN beneficiarios b
                ON b.id_beneficiario = eb.id_beneficiario

            WHERE eb.id_empleado = ?

            ORDER BY eb.id_empleado_beneficiario ASC";

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

    // almacenar los beneficiarios
    $beneficiarios = [];
    while ($fila = mysqli_fetch_assoc($resultado)) {
        $beneficiarios[] = $fila;
    }

    // cerrar la consulta
    mysqli_stmt_close($stmt);

    // devolver la información de los beneficiarios
    echo json_encode([
        "success" => true,
        "beneficiarios" => $beneficiarios
    ]);
}


//====================================================
// GUARDAR O VINCULAR UN BENEFICIARIO AL EMPLEADO
//====================================================

function guardarBeneficiario(mysqli $conexion)
{
    // Obtener los datos enviados desde JavaScript
    $id_empleado = intval($_POST['id_empleado'] ?? 0);

    // Obtener los datos del beneficiario
    $nombre = mb_strtoupper(trim($_POST['nombre'] ?? ''), 'UTF-8');
    $ap_paterno = mb_strtoupper(trim($_POST['ap_paterno'] ?? ''), 'UTF-8');
    $ap_materno = mb_strtoupper(trim($_POST['ap_materno'] ?? ''), 'UTF-8');
    $parentesco = mb_strtoupper(trim($_POST['parentesco'] ?? ''), 'UTF-8');
    $porcentaje = floatval($_POST['porcentaje'] ?? 0);

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
            "mensaje" => "El nombre del beneficiario es obligatorio."
        ]);
        return;
    }

    // Validar el porcentaje
    if ($porcentaje <= 0 || $porcentaje > 100) {
        echo json_encode([
            "success" => false,
            "mensaje" => "El porcentaje debe ser mayor a 0 y menor o igual a 100."
        ]);
        return;
    }

    // Iniciar transacción
    mysqli_begin_transaction($conexion);

    try {

        // 1. VALIDAR QUE LA SUMA DE PORCENTAJES NO SUPERE EL 100%
        $sqlPorcentaje = "SELECT COALESCE(SUM(porcentaje), 0) AS total_porcentaje
                          FROM empleado_beneficiario
                          WHERE id_empleado = ?";

        $stmtPorcentaje = mysqli_prepare($conexion, $sqlPorcentaje);
        if (!$stmtPorcentaje) {
            throw new Exception("Error al consultar el porcentaje total: " . mysqli_error($conexion));
        }

        mysqli_stmt_bind_param($stmtPorcentaje, "i", $id_empleado);
        mysqli_stmt_execute($stmtPorcentaje);
        $resPorcentaje = mysqli_stmt_get_result($stmtPorcentaje);
        $rowPorcentaje = mysqli_fetch_assoc($resPorcentaje);
        $totalPorcentajeActual = floatval($rowPorcentaje['total_porcentaje'] ?? 0);
        mysqli_stmt_close($stmtPorcentaje);

        if (($totalPorcentajeActual + $porcentaje) > 100) {
            $disponible = 100 - $totalPorcentajeActual;
            throw new Exception("El porcentaje supera el 100% disponible. Porcentaje disponible actual: {$disponible}%.");
        }

        // 2. VERIFICAR SI YA EXISTE ESE BENEFICIARIO EN EL CATÁLOGO
        $sqlBusqueda = "SELECT id_beneficiario
                        FROM beneficiarios
                        WHERE nombre = ?
                          AND ap_paterno = ?
                          AND ap_materno = ?
                        LIMIT 1";

        $stmtBusqueda = mysqli_prepare($conexion, $sqlBusqueda);
        if (!$stmtBusqueda) {
            throw new Exception("Error al preparar la búsqueda del beneficiario: " . mysqli_error($conexion));
        }

        mysqli_stmt_bind_param($stmtBusqueda, "sss", $nombre, $ap_paterno, $ap_materno);
        mysqli_stmt_execute($stmtBusqueda);
        $resBusqueda = mysqli_stmt_get_result($stmtBusqueda);
        $beneficiarioExistente = mysqli_fetch_assoc($resBusqueda);
        mysqli_stmt_close($stmtBusqueda);

        $id_beneficiario_usar = 0;
        $accionRealizada = "";

        if ($beneficiarioExistente) {

            // EL BENEFICIARIO YA EXISTE EN EL CATÁLOGO
            $id_beneficiario_usar = intval($beneficiarioExistente['id_beneficiario']);

            // Verificar si este empleado ya tiene asignado este beneficiario
            $sqlExisteRelacion = "SELECT id_empleado_beneficiario
                                  FROM empleado_beneficiario
                                  WHERE id_empleado = ?
                                    AND id_beneficiario = ?
                                  LIMIT 1";

            $stmtExisteRelacion = mysqli_prepare($conexion, $sqlExisteRelacion);
            mysqli_stmt_bind_param($stmtExisteRelacion, "ii", $id_empleado, $id_beneficiario_usar);
            mysqli_stmt_execute($stmtExisteRelacion);
            $resExisteRelacion = mysqli_stmt_get_result($stmtExisteRelacion);
            $relacionExistente = mysqli_fetch_assoc($resExisteRelacion);
            mysqli_stmt_close($stmtExisteRelacion);

            if ($relacionExistente) {
                throw new Exception("Este beneficiario ya se encuentra asignado a este empleado.");
            }

            $accionRealizada = "vinculado_existente";

        } else {

            // EL BENEFICIARIO NO EXISTE, SE REGISTRA UNO NUEVO
            $sqlIns = "INSERT INTO beneficiarios (nombre, ap_paterno, ap_materno)
                       VALUES (?, ?, ?)";

            $stmtIns = mysqli_prepare($conexion, $sqlIns);
            if (!$stmtIns) {
                throw new Exception("Error al preparar el registro del beneficiario: " . mysqli_error($conexion));
            }

            mysqli_stmt_bind_param($stmtIns, "sss", $nombre, $ap_paterno, $ap_materno);
            if (!mysqli_stmt_execute($stmtIns)) {
                mysqli_stmt_close($stmtIns);
                throw new Exception("Error al registrar el beneficiario.");
            }
            $id_beneficiario_usar = mysqli_insert_id($conexion);
            mysqli_stmt_close($stmtIns);

            $accionRealizada = "nuevo_registrado";
        }

        // 3. INSERTAR LA RELACIÓN ENTRE EMPLEADO Y BENEFICIARIO
        $sqlInsRelacion = "INSERT INTO empleado_beneficiario (id_empleado, id_beneficiario, parentesco, porcentaje)
                           VALUES (?, ?, ?, ?)";

        $stmtInsRelacion = mysqli_prepare($conexion, $sqlInsRelacion);
        if (!$stmtInsRelacion) {
            throw new Exception("Error al preparar la asignación del beneficiario: " . mysqli_error($conexion));
        }

        mysqli_stmt_bind_param($stmtInsRelacion, "iisd", $id_empleado, $id_beneficiario_usar, $parentesco, $porcentaje);
        if (!mysqli_stmt_execute($stmtInsRelacion)) {
            mysqli_stmt_close($stmtInsRelacion);
            throw new Exception("Error al asignar el beneficiario al empleado.");
        }
        mysqli_stmt_close($stmtInsRelacion);

        // 4. CONFIRMAR CAMBIOS (COMMIT)
        mysqli_commit($conexion);

        echo json_encode([
            "success" => true,
            "accion" => $accionRealizada,
            "id_beneficiario" => $id_beneficiario_usar,
            "mensaje" => "Beneficiario registrado correctamente."
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


//====================================================
// ACTUALIZAR LA INFORMACIÓN DEL BENEFICIARIO
//====================================================

function actualizarBeneficiario(mysqli $conexion)
{
    // Obtener los datos enviados desde JavaScript
    $id_empleado = intval($_POST['id_empleado'] ?? 0);
    $id_empleado_beneficiario = intval($_POST['id_empleado_beneficiario'] ?? 0);

    // Obtener los datos del beneficiario
    $nombre = mb_strtoupper(trim($_POST['nombre'] ?? ''), 'UTF-8');
    $ap_paterno = mb_strtoupper(trim($_POST['ap_paterno'] ?? ''), 'UTF-8');
    $ap_materno = mb_strtoupper(trim($_POST['ap_materno'] ?? ''), 'UTF-8');
    $parentesco = mb_strtoupper(trim($_POST['parentesco'] ?? ''), 'UTF-8');
    $porcentaje = floatval($_POST['porcentaje'] ?? 0);

    // Validar identificadores
    if ($id_empleado <= 0 || $id_empleado_beneficiario <= 0) {
        echo json_encode([
            "success" => false,
            "mensaje" => "Identificadores no válidos para la actualización."
        ]);
        return;
    }

    // Validar nombre
    if ($nombre === '') {
        echo json_encode([
            "success" => false,
            "mensaje" => "El nombre del beneficiario es obligatorio."
        ]);
        return;
    }

    // Validar porcentaje
    if ($porcentaje <= 0 || $porcentaje > 100) {
        echo json_encode([
            "success" => false,
            "mensaje" => "El porcentaje debe ser mayor a 0 y menor o igual a 100."
        ]);
        return;
    }

    // Iniciar transacción
    mysqli_begin_transaction($conexion);

    try {

        // 1. VALIDAR PORCENTAJE TOTAL SIN CONTAR ESTE REGISTRO
        $sqlPorcentaje = "SELECT COALESCE(SUM(porcentaje), 0) AS total_porcentaje
                          FROM empleado_beneficiario
                          WHERE id_empleado = ?
                            AND id_empleado_beneficiario != ?";

        $stmtPorcentaje = mysqli_prepare($conexion, $sqlPorcentaje);
        mysqli_stmt_bind_param($stmtPorcentaje, "ii", $id_empleado, $id_empleado_beneficiario);
        mysqli_stmt_execute($stmtPorcentaje);
        $resPorcentaje = mysqli_stmt_get_result($stmtPorcentaje);
        $rowPorcentaje = mysqli_fetch_assoc($resPorcentaje);
        $totalPorcentajeOtros = floatval($rowPorcentaje['total_porcentaje'] ?? 0);
        mysqli_stmt_close($stmtPorcentaje);

        if (($totalPorcentajeOtros + $porcentaje) > 100) {
            $disponible = 100 - $totalPorcentajeOtros;
            throw new Exception("El porcentaje supera el 100%. Porcentaje disponible para este beneficiario: {$disponible}%.");
        }

        // 2. CONSULTAR LA RELACIÓN ACTUAL
        $sqlRelacionActual = "SELECT id_beneficiario
                              FROM empleado_beneficiario
                              WHERE id_empleado_beneficiario = ?
                                AND id_empleado = ?
                              LIMIT 1";

        $stmtRelacionActual = mysqli_prepare($conexion, $sqlRelacionActual);
        if (!$stmtRelacionActual) {
            throw new Exception("Error al consultar la relación del beneficiario: " . mysqli_error($conexion));
        }

        mysqli_stmt_bind_param($stmtRelacionActual, "ii", $id_empleado_beneficiario, $id_empleado);
        mysqli_stmt_execute($stmtRelacionActual);
        $resRelacionActual = mysqli_stmt_get_result($stmtRelacionActual);
        $relacionActual = mysqli_fetch_assoc($resRelacionActual);
        mysqli_stmt_close($stmtRelacionActual);

        if (!$relacionActual) {
            throw new Exception("No se encontró el registro del beneficiario para este empleado.");
        }

        $id_beneficiario_anterior = intval($relacionActual['id_beneficiario']);

        // 3. VERIFICAR CUÁNTOS EMPLEADOS ESTÁN UTILIZANDO ESTE MISMO BENEFICIARIO
        $sqlCountUsos = "SELECT COUNT(*) AS total FROM empleado_beneficiario WHERE id_beneficiario = ?";
        $stmtCountUsos = mysqli_prepare($conexion, $sqlCountUsos);
        mysqli_stmt_bind_param($stmtCountUsos, "i", $id_beneficiario_anterior);
        mysqli_stmt_execute($stmtCountUsos);
        $resCount = mysqli_stmt_get_result($stmtCountUsos);
        $rowCount = mysqli_fetch_assoc($resCount);
        $totalUsos = intval($rowCount['total'] ?? 0);
        mysqli_stmt_close($stmtCountUsos);

        $id_beneficiario_usar = 0;
        $accionRealizada = "";

        if ($totalUsos <= 1) {

            // CASO 1: SOLO ESTE EMPLEADO USA EL BENEFICIARIO
            // -> Se actualiza directamente el registro del beneficiario existente
            $sqlUpdBeneficiario = "UPDATE beneficiarios
                                   SET nombre = ?,
                                       ap_paterno = ?,
                                       ap_materno = ?
                                   WHERE id_beneficiario = ?";

            $stmtUpdBeneficiario = mysqli_prepare($conexion, $sqlUpdBeneficiario);
            if (!$stmtUpdBeneficiario) {
                throw new Exception("Error al preparar la actualización del beneficiario: " . mysqli_error($conexion));
            }

            mysqli_stmt_bind_param($stmtUpdBeneficiario, "sssi", $nombre, $ap_paterno, $ap_materno, $id_beneficiario_anterior);
            if (!mysqli_stmt_execute($stmtUpdBeneficiario)) {
                mysqli_stmt_close($stmtUpdBeneficiario);
                throw new Exception("Error al actualizar los datos del beneficiario.");
            }
            mysqli_stmt_close($stmtUpdBeneficiario);

            $id_beneficiario_usar = $id_beneficiario_anterior;
            $accionRealizada = "actualizado_directo";

        } else {

            // CASO 2: EL BENEFICIARIO ESTÁ COMPARTIDO CON OTROS EMPLEADOS
            // -> No podemos sobreescribirlo para no alterar a los demás empleados.
            // -> Buscamos si ya existe otro beneficiario con el nuevo nombre o lo creamos nuevo.

            $sqlBusqueda = "SELECT id_beneficiario
                            FROM beneficiarios
                            WHERE nombre = ?
                              AND ap_paterno = ?
                              AND ap_materno = ?
                            LIMIT 1";

            $stmtBusqueda = mysqli_prepare($conexion, $sqlBusqueda);
            mysqli_stmt_bind_param($stmtBusqueda, "sss", $nombre, $ap_paterno, $ap_materno);
            mysqli_stmt_execute($stmtBusqueda);
            $resBusqueda = mysqli_stmt_get_result($stmtBusqueda);
            $beneficiarioExistente = mysqli_fetch_assoc($resBusqueda);
            mysqli_stmt_close($stmtBusqueda);

            if ($beneficiarioExistente) {
                // Ya existía ese beneficiario en el catálogo
                $id_beneficiario_usar = intval($beneficiarioExistente['id_beneficiario']);
                $accionRealizada = "vinculado_existente";
            } else {
                // Creamos un nuevo registro independiente
                $sqlIns = "INSERT INTO beneficiarios (nombre, ap_paterno, ap_materno)
                           VALUES (?, ?, ?)";
                $stmtIns = mysqli_prepare($conexion, $sqlIns);
                mysqli_stmt_bind_param($stmtIns, "sss", $nombre, $ap_paterno, $ap_materno);
                if (!mysqli_stmt_execute($stmtIns)) {
                    mysqli_stmt_close($stmtIns);
                    throw new Exception("Error al crear el nuevo beneficiario.");
                }
                $id_beneficiario_usar = mysqli_insert_id($conexion);
                mysqli_stmt_close($stmtIns);

                $accionRealizada = "nuevo_creado_por_compartido";
            }
        }

        // 4. ACTUALIZAR LA RELACIÓN CON EL EMPLEADO (PARENTESCO, PORCENTAJE E ID BENEFICIARIO)
        $sqlUpdRelacion = "UPDATE empleado_beneficiario
                           SET id_beneficiario = ?,
                               parentesco = ?,
                               porcentaje = ?
                           WHERE id_empleado_beneficiario = ?";

        $stmtUpdRelacion = mysqli_prepare($conexion, $sqlUpdRelacion);
        if (!$stmtUpdRelacion) {
            throw new Exception("Error al preparar la actualización de la relación: " . mysqli_error($conexion));
        }

        mysqli_stmt_bind_param($stmtUpdRelacion, "isdi", $id_beneficiario_usar, $parentesco, $porcentaje, $id_empleado_beneficiario);
        if (!mysqli_stmt_execute($stmtUpdRelacion)) {
            mysqli_stmt_close($stmtUpdRelacion);
            throw new Exception("Error al actualizar la asignación del beneficiario.");
        }
        mysqli_stmt_close($stmtUpdRelacion);

        // 5. CONFIRMAR CAMBIOS (COMMIT)
        mysqli_commit($conexion);

        echo json_encode([
            "success" => true,
            "accion" => $accionRealizada,
            "id_beneficiario" => $id_beneficiario_usar,
            "mensaje" => "Beneficiario actualizado correctamente."
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


//====================================================
// ELIMINAR LA RELACIÓN O EL BENEFICIARIO
//====================================================

function eliminarBeneficiario(mysqli $conexion)
{
    // Obtener los datos enviados desde JavaScript
    $id_empleado = intval($_POST['id_empleado'] ?? 0);
    $id_empleado_beneficiario = intval($_POST['id_empleado_beneficiario'] ?? 0);

    // Validar que se hayan recibido los identificadores
    if ($id_empleado <= 0 || $id_empleado_beneficiario <= 0) {
        echo json_encode([
            "success" => false,
            "mensaje" => "Identificadores no válidos para la eliminación."
        ]);
        return;
    }

    // Iniciar transacción
    mysqli_begin_transaction($conexion);

    try {

        // 1. OBTENER EL ID DEL BENEFICIARIO ANTES DE ELIMINAR LA RELACIÓN
        $sqlRelacion = "SELECT id_beneficiario
                        FROM empleado_beneficiario
                        WHERE id_empleado_beneficiario = ?
                          AND id_empleado = ?
                        LIMIT 1";

        $stmtRelacion = mysqli_prepare($conexion, $sqlRelacion);
        if (!$stmtRelacion) {
            throw new Exception("Error al consultar la relación del beneficiario: " . mysqli_error($conexion));
        }

        mysqli_stmt_bind_param($stmtRelacion, "ii", $id_empleado_beneficiario, $id_empleado);
        mysqli_stmt_execute($stmtRelacion);
        $resRelacion = mysqli_stmt_get_result($stmtRelacion);
        $relacion = mysqli_fetch_assoc($resRelacion);
        mysqli_stmt_close($stmtRelacion);

        if (!$relacion) {
            throw new Exception("No se encontró el beneficiario a eliminar.");
        }

        $id_beneficiario = intval($relacion['id_beneficiario']);

        // 2. ELIMINAR LA RELACIÓN DE ESTE EMPLEADO
        $sqlDelRelacion = "DELETE FROM empleado_beneficiario
                           WHERE id_empleado_beneficiario = ?
                             AND id_empleado = ?";

        $stmtDelRelacion = mysqli_prepare($conexion, $sqlDelRelacion);
        if (!$stmtDelRelacion) {
            throw new Exception("Error al preparar la eliminación de la relación: " . mysqli_error($conexion));
        }

        mysqli_stmt_bind_param($stmtDelRelacion, "ii", $id_empleado_beneficiario, $id_empleado);
        if (!mysqli_stmt_execute($stmtDelRelacion)) {
            mysqli_stmt_close($stmtDelRelacion);
            throw new Exception("Error al eliminar la relación del beneficiario.");
        }
        mysqli_stmt_close($stmtDelRelacion);

        // 3. VERIFICAR SI OTROS EMPLEADOS TIENEN RELACIÓN CON ESTE BENEFICIARIO
        $sqlCountRestantes = "SELECT COUNT(*) AS total FROM empleado_beneficiario WHERE id_beneficiario = ?";
        $stmtCountRestantes = mysqli_prepare($conexion, $sqlCountRestantes);
        mysqli_stmt_bind_param($stmtCountRestantes, "i", $id_beneficiario);
        mysqli_stmt_execute($stmtCountRestantes);
        $resCount = mysqli_stmt_get_result($stmtCountRestantes);
        $rowCount = mysqli_fetch_assoc($resCount);
        $totalRestantes = intval($rowCount['total'] ?? 0);
        mysqli_stmt_close($stmtCountRestantes);

        $accionRealizada = "";

        // 4. SI YA NO QUEDAN RELACIONES, ELIMINAR EL BENEFICIARIO DEL CATÁLOGO
        if ($totalRestantes === 0) {
            $sqlDelBeneficiario = "DELETE FROM beneficiarios WHERE id_beneficiario = ?";
            $stmtDelBeneficiario = mysqli_prepare($conexion, $sqlDelBeneficiario);
            if ($stmtDelBeneficiario) {
                mysqli_stmt_bind_param($stmtDelBeneficiario, "i", $id_beneficiario);
                mysqli_stmt_execute($stmtDelBeneficiario);
                mysqli_stmt_close($stmtDelBeneficiario);
            }
            $accionRealizada = "eliminado_completo";
        } else {
            $accionRealizada = "relacion_eliminada";
        }

        // 5. CONFIRMAR CAMBIOS (COMMIT)
        mysqli_commit($conexion);

        echo json_encode([
            "success" => true,
            "accion" => $accionRealizada,
            "mensaje" => "Beneficiario eliminado correctamente."
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
