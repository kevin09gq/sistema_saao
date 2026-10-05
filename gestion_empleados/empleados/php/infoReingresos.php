<?php

require_once __DIR__ . "/../../../conexion/conexion.php";
/** @var mysqli $conexion */

$accion = $_POST['accion'] ?? $_GET['accion'] ?? '';

// VALIDAR A QUE FUNCION SE VA A LLAMAR A TRAVEZ DEL CASE

switch ($accion) {

    case 'obtenerReingresos':
        obtenerReingresos($conexion);
        break;

    case 'actualizarFechaAltaEmpresa':
        actualizarFechaAltaEmpresa($conexion);
        break;

    case 'actualizarFechaAltaImss':
        actualizarFechaAltaImss($conexion);
        break;

    case 'actualizarReingreso':
        actualizarReingreso($conexion);
        break;

    case 'eliminarReingreso':
        eliminarReingreso($conexion);
        break;

    case 'crearReingreso':
        crearReingreso($conexion);
        break;

    case 'cambiarStatusEmpleado':
        cambiarStatusEmpleado($conexion);
        break;

    default:
        echo json_encode([
            "success" => false,
            "mensaje" => "Acción no válida."
        ]);
        break;
}

//====================================================
// FUNCIÓN PARA OBTENER EL HISTORIAL DE REINGRESOS 
// DE UN EMPLEADO 
//====================================================

function obtenerReingresos(mysqli $conexion)
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

    // consultar las fechas del empleado y su historial de reingresos
    $sql = "
        SELECT
            e.fecha_alta_empresa,
            e.fecha_alta_imss,
            e.id_status,
            r.id_historial,
            r.fecha_reingreso,
            r.fecha_salida
        FROM info_empleados e
        LEFT JOIN historial_reingresos r
            ON r.id_empleado = e.id_empleado
        WHERE e.id_empleado = ?
        ORDER BY r.fecha_reingreso ASC
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

    $empleado = null;
    $reingresos = [];

    // recorrer los resultados
    while ($fila = $resultado->fetch_assoc()) {

        // guardar las fechas del empleado una sola vez
        if ($empleado === null) {
            $empleado = [
                "fecha_alta_empresa" => $fila["fecha_alta_empresa"],
                "fecha_alta_imss" => $fila["fecha_alta_imss"],
                "id_status" => $fila["id_status"]
            ];
        }

        // agregar el reingreso si existe
        if ($fila["id_historial"] !== null) {
            $reingresos[] = [
                "id_historial" => $fila["id_historial"],
                "fecha_reingreso" => $fila["fecha_reingreso"],
                "fecha_salida" => $fila["fecha_salida"]
            ];
        }
    }

    // cerrar la consulta
    $stmt->close();

    // devolver la información
    echo json_encode([
        "success" => true,
        "empleado" => $empleado,
        "reingresos" => $reingresos
    ]);
}

//====================================================
// FUNCIÓN PARA ACTUALIZAR LA FECHA DE ALTA EMPRESA
//====================================================

function actualizarFechaAltaEmpresa(mysqli $conexion)
{
    // obtener el id del empleado
    $idEmpleado = $_POST['id_empleado'] ?? 0;

    // obtener la nueva fecha
    $fechaAltaEmpresa = $_POST['fecha_alta_empresa'] ?? '';

    // validar el id del empleado
    if (!is_numeric($idEmpleado) || $idEmpleado <= 0) {
        echo json_encode([
            "success" => false,
            "mensaje" => "El id del empleado no es válido."
        ]);
        return;
    }

    // validar que exista la fecha
    if (empty($fechaAltaEmpresa)) {
        echo json_encode([
            "success" => false,
            "mensaje" => "La fecha de alta empresa es obligatoria."
        ]);
        return;
    }

    // actualizar la fecha
    $sql = "UPDATE info_empleados SET fecha_alta_empresa = ? WHERE id_empleado = ?";

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

    // enviar los parámetros
    $stmt->bind_param("si", $fechaAltaEmpresa, $idEmpleado);

    // ejecutar la consulta
    if ($stmt->execute()) {
        echo json_encode([
            "success" => true,
            "mensaje" => "Fecha de alta empresa actualizada correctamente."
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "mensaje" => "Error al actualizar la fecha de alta empresa."
        ]);
    }

    // cerrar la consulta
    $stmt->close();
}

//====================================================
// FUNCIÓN PARA ACTUALIZAR LA FECHA DE ALTA IMSS
//====================================================

function actualizarFechaAltaImss(mysqli $conexion)
{
    // obtener el id del empleado
    $idEmpleado = $_POST['id_empleado'] ?? 0;

    // obtener la nueva fecha
    $fechaAltaImss = $_POST['fecha_alta_imss'] ?? '';

    // validar el id del empleado
    if (!is_numeric($idEmpleado) || $idEmpleado <= 0) {
        echo json_encode([
            "success" => false,
            "mensaje" => "El id del empleado no es válido."
        ]);
        return;
    }

    // validar que exista la fecha
    if (empty($fechaAltaImss)) {
        echo json_encode([
            "success" => false,
            "mensaje" => "La fecha de alta IMSS es obligatoria."
        ]);
        return;
    }

    // actualizar la fecha
    $sql = "UPDATE info_empleados SET fecha_alta_imss = ? WHERE id_empleado = ?";

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

    // enviar los parámetros
    $stmt->bind_param("si", $fechaAltaImss, $idEmpleado);

    // ejecutar la consulta
    if ($stmt->execute()) {
        echo json_encode([
            "success" => true,
            "mensaje" => "Fecha de alta IMSS actualizada correctamente."
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "mensaje" => "Error al actualizar la fecha de alta IMSS."
        ]);
    }

    // cerrar la consulta
    $stmt->close();
}

//====================================================
// FUNCIÓN PARA ACTUALIZAR UN REINGRESO Y EL STATUS
//====================================================

function actualizarReingreso(mysqli $conexion)
{
    // obtener el id del historial
    $idHistorial = $_POST['id_historial'] ?? 0;

    // obtener el id del empleado
    $idEmpleado = $_POST['id_empleado'] ?? 0;

    // obtener las fechas
    $fechaReingreso = $_POST['fecha_reingreso'] ?? '';
    $fechaSalida = $_POST['fecha_salida'] ?? null;

    // Si la fecha de salida está vacía, convertirla a NULL
    if (empty($fechaSalida)) {
        $fechaSalida = null;
    }

    // validar el id del historial
    if (!is_numeric($idHistorial) || $idHistorial <= 0) {
        echo json_encode([
            "success" => false,
            "mensaje" => "El id del historial no es válido."
        ]);
        return;
    }

    // validar el id del empleado
    if (!is_numeric($idEmpleado) || $idEmpleado <= 0) {
        echo json_encode([
            "success" => false,
            "mensaje" => "El id del empleado no es válido."
        ]);
        return;
    }

    // validar que exista la fecha de reingreso
    if (empty($fechaReingreso)) {
        echo json_encode([
            "success" => false,
            "mensaje" => "La fecha de reingreso es obligatoria."
        ]);
        return;
    }

    // Actualizar el reingreso
    $sql = "UPDATE historial_reingresos SET fecha_reingreso = ?, fecha_salida = ? WHERE id_historial = ?";

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

    // enviar los parámetros
    $stmt->bind_param("ssi", $fechaReingreso, $fechaSalida, $idHistorial);

    // ejecutar la consulta
    if (!$stmt->execute()) {
        echo json_encode([
            "success" => false,
            "mensaje" => "Error al actualizar el reingreso."
        ]);
        $stmt->close();
        return;
    }

    $stmt->close();

    // Determinar el nuevo status del empleado
    // Si la fecha de salida está vacía, el empleado está ACTIVO (id_status = 1)
    // Si la fecha de salida tiene valor, el empleado está BAJA (id_status = 2)
    $nuevoStatus = empty($fechaSalida) ? 1 : 2;

    // Actualizar el status del empleado
    $sqlStatus = "UPDATE info_empleados SET id_status = ? WHERE id_empleado = ?";

    $stmtStatus = $conexion->prepare($sqlStatus);

    if (!$stmtStatus) {
        echo json_encode([
            "success" => false,
            "mensaje" => "Error al preparar la consulta de status."
        ]);
        return;
    }

    $stmtStatus->bind_param("ii", $nuevoStatus, $idEmpleado);

    if ($stmtStatus->execute()) {
        echo json_encode([
            "success" => true,
            "mensaje" => "Reingreso actualizado correctamente. Status del empleado actualizado a " . ($nuevoStatus == 1 ? "ACTIVO" : "BAJA") . "."
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "mensaje" => "Error al actualizar el status del empleado."
        ]);
    }

    $stmtStatus->close();
}

//====================================================
// FUNCIÓN PARA ELIMINAR UN REINGRESO
//====================================================

function eliminarReingreso(mysqli $conexion)
{
    // obtener el id del historial
    $idHistorial = $_POST['id_historial'] ?? 0;

    // obtener el id del empleado
    $idEmpleado = $_POST['id_empleado'] ?? 0;

    // validar el id del historial
    if (!is_numeric($idHistorial) || $idHistorial <= 0) {
        echo json_encode([
            "success" => false,
            "mensaje" => "El id del historial no es válido."
        ]);
        return;
    }

    // validar el id del empleado
    if (!is_numeric($idEmpleado) || $idEmpleado <= 0) {
        echo json_encode([
            "success" => false,
            "mensaje" => "El id del empleado no es válido."
        ]);
        return;
    }

    // Eliminar el reingreso
    $sqlEliminar = "DELETE FROM historial_reingresos WHERE id_historial = ?";

    $stmtEliminar = $conexion->prepare($sqlEliminar);

    if (!$stmtEliminar) {
        echo json_encode([
            "success" => false,
            "mensaje" => "Error al preparar la consulta de eliminación."
        ]);
        return;
    }

    $stmtEliminar->bind_param("i", $idHistorial);

    if (!$stmtEliminar->execute()) {
        echo json_encode([
            "success" => false,
            "mensaje" => "Error al eliminar el reingreso."
        ]);
        $stmtEliminar->close();
        return;
    }

    $stmtEliminar->close();

    // Verificar si quedan reingresos después de la eliminación
    $sqlQuedan = "
        SELECT COUNT(*) as total
        FROM historial_reingresos
        WHERE id_empleado = ?
    ";

    $stmtQuedan = $conexion->prepare($sqlQuedan);

    if (!$stmtQuedan) {
        echo json_encode([
            "success" => false,
            "mensaje" => "Error al preparar la consulta de verificación restante."
        ]);
        return;
    }

    $stmtQuedan->bind_param("i", $idEmpleado);
    $stmtQuedan->execute();
    $resultadoQuedan = $stmtQuedan->get_result();
    $filaQuedan = $resultadoQuedan->fetch_assoc();
    $totalQuedan = $filaQuedan['total'];
    $stmtQuedan->close();

    // Determinar el nuevo status del empleado
    $nuevoStatus = 1; // Por defecto ACTIVO

    if ($totalQuedan > 0) {
        // Si quedan reingresos, obtener el último para determinar el status
        $sqlUltimo = "
            SELECT fecha_salida
            FROM historial_reingresos
            WHERE id_empleado = ?
            ORDER BY fecha_reingreso DESC
            LIMIT 1
        ";

        $stmtUltimo = $conexion->prepare($sqlUltimo);

        if (!$stmtUltimo) {
            echo json_encode([
                "success" => false,
                "mensaje" => "Error al preparar la consulta del último reingreso."
            ]);
            return;
        }

        $stmtUltimo->bind_param("i", $idEmpleado);
        $stmtUltimo->execute();
        $resultadoUltimo = $stmtUltimo->get_result();
        $filaUltimo = $resultadoUltimo->fetch_assoc();
        $fechaSalidaUltimo = $filaUltimo['fecha_salida'];
        $stmtUltimo->close();

        // Si el último reingreso tiene fecha de salida, el empleado está BAJA
        $nuevoStatus = empty($fechaSalidaUltimo) ? 1 : 2;
    } else {
        // Si no quedan reingresos, el empleado está ACTIVO
        $nuevoStatus = 1;
    }

    // Actualizar el status del empleado
    $sqlStatus = "UPDATE info_empleados SET id_status = ? WHERE id_empleado = ?";

    $stmtStatus = $conexion->prepare($sqlStatus);

    if (!$stmtStatus) {
        echo json_encode([
            "success" => false,
            "mensaje" => "Error al preparar la consulta de status."
        ]);
        return;
    }

    $stmtStatus->bind_param("ii", $nuevoStatus, $idEmpleado);

    if ($stmtStatus->execute()) {
        echo json_encode([
            "success" => true,
            "mensaje" => "Reingreso eliminado correctamente. Status del empleado actualizado a " . ($nuevoStatus == 1 ? "ACTIVO" : "BAJA") . "."
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "mensaje" => "Error al actualizar el status del empleado."
        ]);
    }

    $stmtStatus->close();
}

//====================================================
// FUNCIÓN PARA CREAR UN NUEVO REINGRESO
//====================================================

function crearReingreso(mysqli $conexion)
{
    // obtener el id del empleado
    $idEmpleado = $_POST['id_empleado'] ?? 0;

    // obtener las fechas
    $fechaReingreso = $_POST['fecha_reingreso'] ?? '';
    $fechaSalida = $_POST['fecha_salida'] ?? null;

    // validar el id del empleado
    if (!is_numeric($idEmpleado) || $idEmpleado <= 0) {
        echo json_encode([
            "success" => false,
            "mensaje" => "El id del empleado no es válido."
        ]);
        return;
    }

    // validar que exista la fecha de reingreso
    if (empty($fechaReingreso)) {
        echo json_encode([
            "success" => false,
            "mensaje" => "La fecha de reingreso es obligatoria."
        ]);
        return;
    }

    // Si la fecha de salida está vacía, convertirla a NULL
    if (empty($fechaSalida)) {
        $fechaSalida = null;
    }

    // Verificar si hay reingresos existentes para validar la fecha
    $sqlUltimoReingreso = "
        SELECT fecha_salida
        FROM historial_reingresos
        WHERE id_empleado = ?
        ORDER BY fecha_reingreso DESC
        LIMIT 1
    ";

    $stmtUltimo = $conexion->prepare($sqlUltimoReingreso);

    if (!$stmtUltimo) {
        echo json_encode([
            "success" => false,
            "mensaje" => "Error al preparar la consulta del último reingreso."
        ]);
        return;
    }

    $stmtUltimo->bind_param("i", $idEmpleado);
    $stmtUltimo->execute();
    $resultadoUltimo = $stmtUltimo->get_result();

    // Verificar si hay reingresos existentes
    if ($resultadoUltimo->num_rows > 0) {
        $filaUltimo = $resultadoUltimo->fetch_assoc();
        $fechaSalidaUltimo = $filaUltimo['fecha_salida'] ?? null;

        // Si existe un reingreso anterior y no tiene fecha de salida, no permitir agregar otro
        if ($fechaSalidaUltimo === null) {
            echo json_encode([
                "success" => false,
                "mensaje" => "No se puede agregar un nuevo reingreso porque el reingreso anterior no tiene fecha de salida."
            ]);
            $stmtUltimo->close();
            return;
        }
    }

    $stmtUltimo->close();

    // Crear el nuevo reingreso
    $sqlCrear = "INSERT INTO historial_reingresos (id_empleado, fecha_reingreso, fecha_salida) VALUES (?, ?, ?)";

    $stmtCrear = $conexion->prepare($sqlCrear);

    if (!$stmtCrear) {
        echo json_encode([
            "success" => false,
            "mensaje" => "Error al preparar la consulta de creación."
        ]);
        return;
    }

    $stmtCrear->bind_param("iss", $idEmpleado, $fechaReingreso, $fechaSalida);

    if (!$stmtCrear->execute()) {
        echo json_encode([
            "success" => false,
            "mensaje" => "Error al crear el reingreso."
        ]);
        $stmtCrear->close();
        return;
    }

    $stmtCrear->close();

    // Determinar el nuevo status del empleado
    // Si la fecha de salida está vacía, el empleado está ACTIVO (id_status = 1)
    // Si la fecha de salida tiene valor, el empleado está BAJA (id_status = 2)
    $nuevoStatus = empty($fechaSalida) ? 1 : 2;

    // Actualizar el status del empleado
    $sqlStatus = "UPDATE info_empleados SET id_status = ? WHERE id_empleado = ?";

    $stmtStatus = $conexion->prepare($sqlStatus);

    if (!$stmtStatus) {
        echo json_encode([
            "success" => false,
            "mensaje" => "Error al preparar la consulta de status."
        ]);
        return;
    }

    $stmtStatus->bind_param("ii", $nuevoStatus, $idEmpleado);

    if ($stmtStatus->execute()) {
        echo json_encode([
            "success" => true,
            "mensaje" => "Reingreso creado correctamente. Status del empleado actualizado a " . ($nuevoStatus == 1 ? "ACTIVO" : "BAJA") . "."
        ]);
    } else {
        echo json_encode([
            "success" => false,
            "mensaje" => "Error al actualizar el status del empleado."
        ]);
    }

    $stmtStatus->close();
}

//====================================================
// FUNCIÓN PARA CAMBIAR EL STATUS DEL EMPLEADO (ALTA/BAJA)
// Y ACTUALIZAR EL HISTORIAL DE REINGRESOS
//====================================================

function cambiarStatusEmpleado(mysqli $conexion)
{
    // obtener el id del empleado y nuevo status
    $idEmpleado = isset($_POST['id_empleado']) ? intval($_POST['id_empleado']) : 0;
    $nuevoStatus = isset($_POST['nuevo_status']) ? intval($_POST['nuevo_status']) : 0;
    $fechaSalida = $_POST['fecha_salida'] ?? null;
    $fechaReingreso = $_POST['fecha_reingreso'] ?? null;

    // validar id del empleado
    if ($idEmpleado <= 0) {
        echo json_encode([
            "success" => false,
            "mensaje" => "El ID del empleado no es válido."
        ]);
        return;
    }

    // validar nuevo status (1: Activo, 2: Inactivo/Baja)
    if ($nuevoStatus !== 1 && $nuevoStatus !== 2) {
        echo json_encode([
            "success" => false,
            "mensaje" => "El estatus especificado no es válido."
        ]);
        return;
    }

    // Iniciar transacción para mantener consistencia de datos
    $conexion->begin_transaction();

    try {
        // 1. Obtener la información del empleado (fecha_alta_empresa e id_status)
        $sqlEmp = "SELECT fecha_alta_empresa, id_status FROM info_empleados WHERE id_empleado = ?";
        $stmtEmp = $conexion->prepare($sqlEmp);
        if (!$stmtEmp) {
            throw new Exception("Error al preparar la consulta del empleado.");
        }

        $stmtEmp->bind_param("i", $idEmpleado);
        $stmtEmp->execute();
        $resEmp = $stmtEmp->get_result();
        $empActual = $resEmp->fetch_assoc();
        $stmtEmp->close();

        if (!$empActual) {
            throw new Exception("No se encontró el empleado en la base de datos.");
        }

        $fechaAltaEmpresa = !empty($empActual['fecha_alta_empresa']) ? $empActual['fecha_alta_empresa'] : null;

        // 2. Actualizar el status en info_empleados
        $sqlUpdateStatus = "UPDATE info_empleados SET id_status = ? WHERE id_empleado = ?";
        $stmtStatus = $conexion->prepare($sqlUpdateStatus);
        if (!$stmtStatus) {
            throw new Exception("Error al preparar la actualización de estatus.");
        }

        $stmtStatus->bind_param("ii", $nuevoStatus, $idEmpleado);
        if (!$stmtStatus->execute()) {
            $stmtStatus->close();
            throw new Exception("Error al actualizar el estatus del empleado.");
        }
        $stmtStatus->close();

        // 3. Manejo de historial_reingresos según las reglas de negocio
        // Solo si el empleado cuenta con fecha_alta_empresa en la base de datos
        if ($fechaAltaEmpresa !== null) {

            if ($nuevoStatus === 2) {
                // ==========================================
                // PASÓ A INACTIVO (BAJA)
                // ==========================================
                $fechaSalidaFinal = !empty($fechaSalida) ? $fechaSalida : date('Y-m-d');

                // Verificar si hay registros en historial_reingresos
                $sqlUltimo = "SELECT id_historial, fecha_reingreso, fecha_salida 
                              FROM historial_reingresos 
                              WHERE id_empleado = ? 
                              ORDER BY id_historial DESC LIMIT 1";
                $stmtUltimo = $conexion->prepare($sqlUltimo);
                $stmtUltimo->bind_param("i", $idEmpleado);
                $stmtUltimo->execute();
                $resUltimo = $stmtUltimo->get_result();
                $ultimoHistorial = $resUltimo->fetch_assoc();
                $stmtUltimo->close();

                if ($ultimoHistorial && empty($ultimoHistorial['fecha_salida'])) {
                    // Si el último registro no tenía fecha de salida, cerrarlo con la fecha de baja
                    $sqlUpdateHist = "UPDATE historial_reingresos SET fecha_salida = ? WHERE id_historial = ?";
                    $stmtUpdateHist = $conexion->prepare($sqlUpdateHist);
                    $stmtUpdateHist->bind_param("si", $fechaSalidaFinal, $ultimoHistorial['id_historial']);
                    if (!$stmtUpdateHist->execute()) {
                        $stmtUpdateHist->close();
                        throw new Exception("Error al actualizar la fecha de salida en el historial.");
                    }
                    $stmtUpdateHist->close();
                } else {
                    // Si no existen registros o el último ya estaba cerrado, crear nuevo registro
                    // Estableciendo la fecha_alta_empresa como fecha_reingreso y la fecha de baja como fecha_salida
                    $sqlInsertHist = "INSERT INTO historial_reingresos (id_empleado, fecha_reingreso, fecha_salida) VALUES (?, ?, ?)";
                    $stmtInsertHist = $conexion->prepare($sqlInsertHist);
                    $stmtInsertHist->bind_param("iss", $idEmpleado, $fechaAltaEmpresa, $fechaSalidaFinal);
                    if (!$stmtInsertHist->execute()) {
                        $stmtInsertHist->close();
                        throw new Exception("Error al registrar la baja en el historial de reingresos.");
                    }
                    $stmtInsertHist->close();
                }

            } else if ($nuevoStatus === 1) {
                // ==========================================
                // PASÓ A ACTIVO (REINGRESO / ALTA)
                // ==========================================
                $fechaReingresoFinal = !empty($fechaReingreso) ? $fechaReingreso : date('Y-m-d');

                // Registrar nuevo reingreso con fecha de hoy y fecha_salida NULL
                $sqlInsertHist = "INSERT INTO historial_reingresos (id_empleado, fecha_reingreso, fecha_salida) VALUES (?, ?, NULL)";
                $stmtInsertHist = $conexion->prepare($sqlInsertHist);
                $stmtInsertHist->bind_param("is", $idEmpleado, $fechaReingresoFinal);
                if (!$stmtInsertHist->execute()) {
                    $stmtInsertHist->close();
                    throw new Exception("Error al registrar el reingreso en el historial.");
                }
                $stmtInsertHist->close();
            }
        }

        // Confirmar la transacción
        $conexion->commit();

        $mensaje = ($nuevoStatus === 1)
            ? "Empleado reactivado y dado de alta correctamente."
            : "Empleado dado de baja correctamente.";

        echo json_encode([
            "success" => true,
            "mensaje" => $mensaje,
            "id_empleado" => $idEmpleado,
            "id_status" => $nuevoStatus
        ]);

    } catch (Exception $e) {
        $conexion->rollback();
        echo json_encode([
            "success" => false,
            "mensaje" => $e->getMessage()
        ]);
    }
}
