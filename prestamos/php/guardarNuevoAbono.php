<?php
require_once __DIR__ . '/../../config/config.php';
 require_once __DIR__ . "/../../conexion/conexion.php";

// Respuesta
function respuestas(int $code, string $titulo, string $mensaje, string $icono, array $data)
{
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode([
        "titulo"  => $titulo,
        "mensaje" => $mensaje,
        "icono"   => $icono,
        "data"    => $data
    ], JSON_UNESCAPED_UNICODE);
}

if (isset($_SESSION["logged_in"])) {

    $idEmpleado = isset($_POST['id_empleado']) ? (int)$_POST['id_empleado'] : 0;
    $montoPago = isset($_POST['monto_pago']) ? (float)$_POST['monto_pago'] : 0;
    $fechaPago = isset($_POST['fecha_pago']) ? trim((string)$_POST['fecha_pago']) : '';
    $semanaPago = isset($_POST['semana_pago']) ? (int)$_POST['semana_pago'] : 0;
    $anioPago = isset($_POST['anio_pago']) ? (int)$_POST['anio_pago'] : 0;
    $esNomina = isset($_POST['es_nomina']) ? (int)$_POST['es_nomina'] : 0;
    $pausarSemana = isset($_POST['pausar_semana']) ? (int)$_POST['pausar_semana'] : 0;
    $observacion = isset($_POST['observacion_pago']) ? trim((string)$_POST['observacion_pago']) : '';

    if ($idEmpleado <= 0) {
        respuestas(400, 'Datos incompletos', 'Falta id_empleado', 'warning', []);
        exit;
    }
    if ($semanaPago < 1 || $semanaPago > 52 || $anioPago < 2000) {
        respuestas(400, 'Datos inválidos', 'Semana o año inválidos', 'warning', []);
        exit;
    }
    if ($pausarSemana === 0) {
        if ($montoPago <= 0) {
            respuestas(400, 'Datos inválidos', 'El monto debe ser mayor a 0', 'warning', []);
            exit;
        }
    } else {
        if ($observacion === '') {
            respuestas(400, 'Datos inválidos', 'Debes indicar el motivo de la pausa', 'warning', []);
            exit;
        }
    }

    // Buscar el préstamo activo más antiguo del empleado
    $sqlPrestamo = "
        SELECT
            p.id_prestamo,
            p.monto,
            p.fecha_registro,
            IFNULL(SUM(pa.monto_pago), 0) AS total_abonado
        FROM prestamos p
        LEFT JOIN prestamos_abonos pa ON pa.id_prestamo = p.id_prestamo
        WHERE p.id_empleado = ?
          AND p.estado = 'activo'
        GROUP BY p.id_prestamo
        ORDER BY p.fecha_registro ASC
        LIMIT 1
    ";

    $stmtPrestamo = $conexion->prepare($sqlPrestamo);
    if (!$stmtPrestamo) {
        respuestas(500, 'Error', 'No se pudo preparar la consulta de préstamo', 'error', []);
        exit;
    }
    $stmtPrestamo->bind_param('i', $idEmpleado);
    if (!$stmtPrestamo->execute()) {
        respuestas(500, 'Error', 'No se pudo ejecutar la consulta de préstamo', 'error', []);
        exit;
    }
    $resPrestamo = $stmtPrestamo->get_result();
    $prestamo = $resPrestamo ? ($resPrestamo->fetch_assoc() ?? null) : null;
    $stmtPrestamo->close();

    if (!$prestamo) {
        respuestas(404, 'Sin préstamos', 'El empleado no tiene préstamos activos', 'info', []);
        exit;
    }

    $idPrestamo = (int)$prestamo['id_prestamo'];
    $montoPrestamo = (float)$prestamo['monto'];
    $totalAbonado = (float)$prestamo['total_abonado'];
    $deudaActual = $montoPrestamo - $totalAbonado;
    if ($deudaActual <= 0) {
        respuestas(409, 'Sin adeudo', 'Este préstamo ya no tiene deuda activa', 'info', []);
        exit;
    }

    // Buscar el plan más reciente del préstamo y su detalle JSON más reciente
    $sqlPlan = "
        SELECT pp.id_plan
        FROM planes_pagos pp
        WHERE pp.id_prestamo = ?
        ORDER BY pp.fecha_registro DESC
        LIMIT 1
    ";
    $stmtPlan = $conexion->prepare($sqlPlan);
    if (!$stmtPlan) {
        respuestas(500, 'Error', 'No se pudo preparar la consulta del plan', 'error', []);
        exit;
    }
    $stmtPlan->bind_param('i', $idPrestamo);
    if (!$stmtPlan->execute()) {
        respuestas(500, 'Error', 'No se pudo ejecutar la consulta del plan', 'error', []);
        exit;
    }
    $resPlan = $stmtPlan->get_result();
    $plan = $resPlan ? ($resPlan->fetch_assoc() ?? null) : null;
    $stmtPlan->close();

    if (!$plan) {
        respuestas(404, 'Sin plan', 'No se encontró un plan de pago para el préstamo activo', 'info', []);
        exit;
    }

    $idPlan = (int)$plan['id_plan'];

    $sqlDetalle = "
        SELECT id_detalle, detalle
        FROM detalle_planes
        WHERE id_plan = ?
        ORDER BY id_detalle DESC
        LIMIT 1
    ";
    $stmtDet = $conexion->prepare($sqlDetalle);
    if (!$stmtDet) {
        respuestas(500, 'Error', 'No se pudo preparar la consulta del detalle del plan', 'error', []);
        exit;
    }
    $stmtDet->bind_param('i', $idPlan);
    if (!$stmtDet->execute()) {
        respuestas(500, 'Error', 'No se pudo ejecutar la consulta del detalle del plan', 'error', []);
        exit;
    }
    $resDet = $stmtDet->get_result();
    $detalleRow = $resDet ? ($resDet->fetch_assoc() ?? null) : null;
    $stmtDet->close();

    if (!$detalleRow) {
        respuestas(404, 'Sin detalle', 'No se encontró detalle JSON para el plan de pago', 'info', []);
        exit;
    }

    $idDetalle = (int)$detalleRow['id_detalle'];
    $detalleJson = (string)$detalleRow['detalle'];

    $detalleArray = json_decode($detalleJson, true);
    if (!is_array($detalleArray)) {
        respuestas(500, 'Error', 'El detalle del plan no tiene un JSON válido', 'error', []);
        exit;
    }

    // Encontrar la semana/año dentro del JSON
    $idx = -1;
    for ($i = 0; $i < count($detalleArray); $i++) {
        $sem = isset($detalleArray[$i]['num_semana']) ? (int)$detalleArray[$i]['num_semana'] : 0;
        $ani = isset($detalleArray[$i]['anio']) ? (int)$detalleArray[$i]['anio'] : 0;
        if ($sem === $semanaPago && $ani === $anioPago) {
            $idx = $i;
            break;
        }
    }

    if ($idx === -1) {
        respuestas(404, 'No encontrado', 'No se encontró la semana/año dentro del plan de pago', 'info', []);
        exit;
    }

    // Iniciar transacción
    $conexion->begin_transaction();
    try {

        $idAbono = null;
        $fechaPagoDatetime = '';

        if ($pausarSemana === 0) {
            // Insertar el abono
            $fechaPagoDatetime = $fechaPago !== '' ? ($fechaPago . ' ' . date('H:i:s')) : date('Y-m-d H:i:s');

            $stmtIns = $conexion->prepare("INSERT INTO prestamos_abonos (id_prestamo, monto_pago, num_sem_pago, anio_pago, fecha_pago, es_nomina) VALUES (?, ?, ?, ?, ?, ?)");
            if (!$stmtIns) {
                throw new Exception('No se pudo preparar la inserción del abono');
            }
            $stmtIns->bind_param('idissi', $idPrestamo, $montoPago, $semanaPago, $anioPago, $fechaPagoDatetime, $esNomina);
            if (!$stmtIns->execute()) {
                throw new Exception('No se pudo insertar el abono');
            }
            $idAbono = (int)$conexion->insert_id;
            $stmtIns->close();

            // Actualizar detalle JSON: marcar semana como pagado
            if (!isset($detalleArray[$idx]['observacion'])) {
                $detalleArray[$idx]['observacion'] = '';
            }
            $detalleArray[$idx]['fecha_pago'] = $fechaPagoDatetime;
            $detalleArray[$idx]['estado'] = 'Pagado';
            $detalleArray[$idx]['id_abono'] = (string)$idAbono;

        } else {
            // Pausar semana: NO inserta abono, sólo actualiza el JSON
            $montoOriginal = isset($detalleArray[$idx]['monto_semanal']) ? (string)$detalleArray[$idx]['monto_semanal'] : '';

            $detalleArray[$idx]['monto_semanal'] = '';
            $detalleArray[$idx]['fecha_pago'] = '';
            $detalleArray[$idx]['observacion'] = $observacion;
            $detalleArray[$idx]['estado'] = 'Pausado';
            $detalleArray[$idx]['id_abono'] = '';

            // Agregar una semana al final
            $last = $detalleArray[count($detalleArray) - 1];
            $lastSem = isset($last['num_semana']) ? (int)$last['num_semana'] : $semanaPago;
            $lastAnio = isset($last['anio']) ? (int)$last['anio'] : $anioPago;
            $newSem = $lastSem + 1;
            $newAnio = $lastAnio;
            if ($newSem > 52) {
                $newSem = 1;
                $newAnio = $lastAnio + 1;
            }

            $detalleArray[] = [
                'monto_semanal' => $montoOriginal,
                'num_semana' => (string)$newSem,
                'anio' => (string)$newAnio,
                'fecha_pago' => '',
                'observacion' => '',
                'estado' => 'Pendiente',
                'id_abono' => ''
            ];

            // Actualizar planes_pagos con la nueva semana fin
            $stmtPlanUpd = $conexion->prepare("UPDATE planes_pagos SET sem_fin = ?, anio_fin = ? WHERE id_plan = ?");
            if (!$stmtPlanUpd) {
                throw new Exception('No se pudo preparar la actualización del plan de pagos');
            }
            $stmtPlanUpd->bind_param('iii', $newSem, $newAnio, $idPlan);
            if (!$stmtPlanUpd->execute()) {
                throw new Exception('No se pudo actualizar el plan de pagos');
            }
            $stmtPlanUpd->close();
        }

        $nuevoDetalleJson = json_encode($detalleArray, JSON_UNESCAPED_UNICODE);
        if ($nuevoDetalleJson === false) {
            throw new Exception('No se pudo serializar el detalle del plan');
        }

        $stmtUpd = $conexion->prepare("UPDATE detalle_planes SET detalle = ? WHERE id_detalle = ?");
        if (!$stmtUpd) {
            throw new Exception('No se pudo preparar la actualización del detalle del plan');
        }
        $stmtUpd->bind_param('si', $nuevoDetalleJson, $idDetalle);
        if (!$stmtUpd->execute()) {
            throw new Exception('No se pudo actualizar el detalle del plan');
        }
        $stmtUpd->close();

        // Si se insertó abono, revisar si ya liquidó el préstamo
        if ($pausarSemana === 0) {
            $sqlSum = "SELECT IFNULL(SUM(monto_pago),0) AS total FROM prestamos_abonos WHERE id_prestamo = ?";
            $stmtSum = $conexion->prepare($sqlSum);
            if (!$stmtSum) {
                throw new Exception('No se pudo preparar la suma de abonos');
            }
            $stmtSum->bind_param('i', $idPrestamo);
            if (!$stmtSum->execute()) {
                throw new Exception('No se pudo ejecutar la suma de abonos');
            }
            $resSum = $stmtSum->get_result();
            $sumRow = $resSum ? ($resSum->fetch_assoc() ?? []) : [];
            $stmtSum->close();

            $abonadoTotal = (float)($sumRow['total'] ?? 0);
            if ($abonadoTotal >= $montoPrestamo) {
                $stmtLiq = $conexion->prepare("UPDATE prestamos SET estado = 'liquidado' WHERE id_prestamo = ?");
                if (!$stmtLiq) {
                    throw new Exception('No se pudo preparar la liquidación del préstamo');
                }
                $stmtLiq->bind_param('i', $idPrestamo);
                if (!$stmtLiq->execute()) {
                    throw new Exception('No se pudo liquidar el préstamo');
                }
                $stmtLiq->close();
            }
        }

        $conexion->commit();

        if ($pausarSemana === 0) {
            respuestas(201, 'Registro completado', 'Abono registrado y plan actualizado', 'success', [
                'id_prestamo' => $idPrestamo,
                'id_plan' => $idPlan,
                'id_abono' => $idAbono
            ]);
        } else {
            respuestas(200, 'Semana pausada', 'Se pausó la semana y se extendió el plan', 'success', [
                'id_prestamo' => $idPrestamo,
                'id_plan' => $idPlan
            ]);
        }
        exit;

    } catch (Exception $e) {
        $conexion->rollback();
        respuestas(500, 'Error', $e->getMessage(), 'error', []);
        exit;
    }

} else {
    respuestas(401, "No autenticado", "Debes primero iniciar sesión", "error", []);
    exit;
}