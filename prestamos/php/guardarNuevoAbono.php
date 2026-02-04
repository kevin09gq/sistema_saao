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
    $idPrestamoSeleccionado = isset($_POST['id_prestamo']) ? (int)$_POST['id_prestamo'] : 0;
    $montoPago = isset($_POST['monto_pago']) ? (float)$_POST['monto_pago'] : 0;
    $fechaPago = isset($_POST['fecha_pago']) ? trim((string)$_POST['fecha_pago']) : '';
    $semanaPago = isset($_POST['semana_pago']) ? (int)$_POST['semana_pago'] : 0;
    $anioPago = isset($_POST['anio_pago']) ? (int)$_POST['anio_pago'] : 0;
    $esNomina = isset($_POST['es_nomina']) ? (int)$_POST['es_nomina'] : 0;
    $pausarSemana = isset($_POST['pausar_semana']) ? (int)$_POST['pausar_semana'] : 0;
    $observacion = isset($_POST['observacion_pago']) ? trim((string)$_POST['observacion_pago']) : '';
    $claveAutorizacion = isset($_POST['clave_autorizacion']) ? trim((string)$_POST['clave_autorizacion']) : '';

    $pausar_abono = $pausarSemana;

    if ($idEmpleado <= 0) {
        respuestas(400, 'Datos incompletos', 'Falta id_empleado', 'warning', []);
        exit;
    }
    if ($idPrestamoSeleccionado <= 0) {
        respuestas(400, 'Datos incompletos', 'Debes seleccionar un préstamo', 'warning', []);
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

    // =====================================================================
    // VALIDAR CLAVE DE AUTORIZACIÓN SI ES TESORERÍA (es_nomina=0 y no pausado)
    // =====================================================================
    if ($esNomina === 0 && $pausarSemana === 0) {
        if ($claveAutorizacion === '') {
            respuestas(400, 'Clave requerida', 'Debes ingresar la clave de autorización para abonos en Tesorería', 'warning', []);
            exit;
        }
        
        // Validar que la clave exista en la tabla claves_autorizacion
        $sqlClaves = "SELECT id_autorizacion, clave FROM claves_autorizacion";
        $resultClaves = $conexion->query($sqlClaves);
        
        if (!$resultClaves) {
            respuestas(500, 'Error', 'No se pudo consultar las claves de autorización', 'error', []);
            exit;
        }
        
        $claveValida = false;
        $id_autorizacion_encontrado = null;
        
        while ($rowClave = $resultClaves->fetch_assoc()) {
            if (password_verify($claveAutorizacion, $rowClave['clave'])) {
                $claveValida = true;
                $id_autorizacion_encontrado = $rowClave['id_autorizacion'];
                break;
            }
        }
        
        if (!$claveValida) {
            respuestas(401, 'Clave inválida', 'La clave de autorización no existe o es incorrecta.', 'error', []);
            exit;
        }

        // Guardar en el historial de autorizaciones
        //$motivoHistorial = "Abono en Tesorería - Préstamo ID: $idPrestamoSeleccionado - Empleado ID: $idEmpleado - Semana: $semanaPago/$anioPago - Monto: $" . number_format($montoPago, 2);
        $motivoHistorial = "AUTORIZACION PARA REGISTRAR ABONO EN TESORERÍA. ID PRESTAMO: " . $idPrestamoSeleccionado . ", ID EMPLEADO: " . $idEmpleado . ", SEMANA/AÑO: " . $semanaPago . "/" . $anioPago . ", MONTO: $" . number_format($montoPago, 2);

        $sqlHistorial = "INSERT INTO historiales_autorizaciones (id_clave, motivo, fecha) VALUES (?, ?, NOW())";
        $stmtHistorial = $conexion->prepare($sqlHistorial);
        
        if ($stmtHistorial) {
            $stmtHistorial->bind_param("is", $id_autorizacion_encontrado, $motivoHistorial);
            $stmtHistorial->execute();
            $stmtHistorial->close();
        }
    }

    // =====================================================================
    // VALIDAR QUE EL PRÉSTAMO EXISTE, PERTENECE AL EMPLEADO Y ESTÁ ACTIVO
    // =====================================================================
    $sqlPrestamo = "
        SELECT
            p.id_prestamo,
            p.monto,
            p.fecha_registro,
            IFNULL(SUM(pa.monto_pago), 0) AS total_abonado
        FROM prestamos p
        LEFT JOIN prestamos_abonos pa ON pa.id_prestamo = p.id_prestamo
        WHERE p.id_prestamo = ?
          AND p.id_empleado = ?
          AND p.estado = 'activo'
        GROUP BY p.id_prestamo
    ";

    $stmtPrestamo = $conexion->prepare($sqlPrestamo);
    if (!$stmtPrestamo) {
        respuestas(500, 'Error', 'No se pudo preparar la consulta de préstamo', 'error', []);
        exit;
    }
    $stmtPrestamo->bind_param('ii', $idPrestamoSeleccionado, $idEmpleado);
    if (!$stmtPrestamo->execute()) {
        respuestas(500, 'Error', 'No se pudo ejecutar la consulta de préstamo', 'error', []);
        exit;
    }
    $resPrestamo = $stmtPrestamo->get_result();
    $prestamo = $resPrestamo ? ($resPrestamo->fetch_assoc() ?? null) : null;
    $stmtPrestamo->close();

    if (!$prestamo) {
        respuestas(404, 'Préstamo no válido', 'El préstamo seleccionado no existe, no pertenece al empleado o no está activo', 'warning', []);
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

    // =====================================================================
    // VALIDAR QUE LA SEMANA SELECCIONADA ESTÉ PENDIENTE Y SEA LA SIGUIENTE EN ORDEN
    // =====================================================================
    
    // Verificar que el estado de la semana seleccionada sea "Pendiente"
    $estadoSemanaSeleccionada = isset($detalleArray[$idx]['estado']) 
        ? strtolower(trim($detalleArray[$idx]['estado'])) 
        : 'pendiente';
    
    if ($estadoSemanaSeleccionada === 'pagado') {
        respuestas(409, 'Semana ya pagada', "La semana $semanaPago del año $anioPago ya fue pagada. No se puede registrar otro abono.", 'warning', []);
        exit;
    }
    
    if ($estadoSemanaSeleccionada === 'pausado') {
        respuestas(409, 'Semana pausada', "La semana $semanaPago del año $anioPago está pausada. No se puede registrar un abono en una semana pausada.", 'warning', []);
        exit;
    }

    // Verificar que sea la primera semana pendiente (orden secuencial)
    $primerPendienteIdx = -1;
    for ($i = 0; $i < count($detalleArray); $i++) {
        $estado = isset($detalleArray[$i]['estado']) ? strtolower(trim($detalleArray[$i]['estado'])) : 'pendiente';
        if ($estado === 'pendiente') {
            $primerPendienteIdx = $i;
            break;
        }
    }

    if ($primerPendienteIdx !== -1 && $idx !== $primerPendienteIdx) {
        // La semana seleccionada no es la primera pendiente
        $semanaEsperada = isset($detalleArray[$primerPendienteIdx]['num_semana']) ? $detalleArray[$primerPendienteIdx]['num_semana'] : '?';
        $anioEsperado = isset($detalleArray[$primerPendienteIdx]['anio']) ? $detalleArray[$primerPendienteIdx]['anio'] : '?';
        
        respuestas(400, 'Orden de pagos', 
            "Debes pagar las semanas en orden. La próxima semana a pagar es la semana $semanaEsperada del año $anioEsperado.", 
            'warning', 
            [
                'semana_esperada' => $semanaEsperada,
                'anio_esperado' => $anioEsperado
            ]
        );
        exit;
    }

    // Verificar si ya existe un abono para esta semana/año en este préstamo
    $sqlVerificar = "
        SELECT id_abono, pausado
        FROM prestamos_abonos
        WHERE id_prestamo = ? AND num_sem_pago = ? AND anio_pago = ?
        LIMIT 1
    ";
    $stmtVerificar = $conexion->prepare($sqlVerificar);
    if (!$stmtVerificar) {
        respuestas(500, 'Error', 'No se pudo preparar la consulta de verificación', 'error', []);
        exit;
    }
    $stmtVerificar->bind_param('iii', $idPrestamo, $semanaPago, $anioPago);
    if (!$stmtVerificar->execute()) {
        respuestas(500, 'Error', 'No se pudo ejecutar la consulta de verificación', 'error', []);
        exit;
    }
    $resVerificar = $stmtVerificar->get_result();
    $abonoExistente = $resVerificar ? ($resVerificar->fetch_assoc() ?? null) : null;
    $stmtVerificar->close();

    if ($abonoExistente) {
        $tipoPago = (int)$abonoExistente['pausado'] === 1 ? 'pausado' : 'registrado';
        respuestas(409, 'Abono duplicado', 
            "Ya existe un abono $tipoPago para la semana $semanaPago del año $anioPago. No se puede registrar otro abono para la misma semana.", 
            'warning', 
            []
        );
        exit;
    }

    // Validar que el monto coincida con el plan (solo si NO es pausa)
    if ($pausarSemana === 0) {
        $montoPlanificado = isset($detalleArray[$idx]['monto_semanal']) ? (float)$detalleArray[$idx]['monto_semanal'] : 0.0;
        
        if (abs($montoPago - $montoPlanificado) > 0.01) {
            respuestas(400, 'Monto incorrecto', 
                "El monto ingresado ($" . number_format($montoPago, 2) . ") no coincide con el monto planificado ($" . number_format($montoPlanificado, 2) . ") para la semana $semanaPago del año $anioPago. Por favor, verifica el monto correcto en el plan de pago.", 
                'warning', 
                [
                    'monto_ingresado' => $montoPago,
                    'monto_planificado' => $montoPlanificado
                ]
            );
            exit;
        }
    }

    // Iniciar transacción
    $conexion->begin_transaction();
    try {

        $idAbono = null;
        $fechaPagoDatetime = $fechaPago !== '' ? ($fechaPago . ' ' . date('H:i:s')) : date('Y-m-d H:i:s');

        // Preparar valores para el insert según si es pausa o no
        if ($pausarSemana === 0) {
            // Abono normal
            $montoAInsertar = $montoPago;
        } else {
            // Pausa: monto 0.0 pero SÍ guarda fecha
            $montoAInsertar = 0.0;
        }

        // Insertar SIEMPRE el abono (con monto 0.0 si es pausa)
        $stmtIns = $conexion->prepare("INSERT INTO prestamos_abonos (id_prestamo, monto_pago, num_sem_pago, anio_pago, fecha_pago, es_nomina, pausado) VALUES (?, ?, ?, ?, ?, ?, ?)");
        if (!$stmtIns) {
            throw new Exception('No se pudo preparar la inserción del abono');
        }
        $stmtIns->bind_param('idissii', $idPrestamo, $montoAInsertar, $semanaPago, $anioPago, $fechaPagoDatetime, $esNomina, $pausar_abono);
        if (!$stmtIns->execute()) {
            throw new Exception('No se pudo insertar el abono');
        }
        $idAbono = (int)$conexion->insert_id;
        $stmtIns->close();

        // Variables para detectar solapamiento (solo aplica si es pausa)
        $hayAviso = false;
        $avisoSolapamiento = [];

        // Actualizar detalle JSON según sea pausa o no
        if ($pausarSemana === 0) {
            // Marcar semana como pagado
            if (!isset($detalleArray[$idx]['observacion'])) {
                $detalleArray[$idx]['observacion'] = '';
            }
            $detalleArray[$idx]['fecha_pago'] = $fechaPagoDatetime;
            $detalleArray[$idx]['estado'] = 'Pagado';
            $detalleArray[$idx]['id_abono'] = (string)$idAbono;

        } else {
            // Pausar semana
            $montoOriginal = isset($detalleArray[$idx]['monto_semanal']) ? (string)$detalleArray[$idx]['monto_semanal'] : '';

            $detalleArray[$idx]['monto_semanal'] = '';
            $detalleArray[$idx]['fecha_pago'] = '';
            $detalleArray[$idx]['observacion'] = $observacion;
            $detalleArray[$idx]['estado'] = 'Pausado';
            $detalleArray[$idx]['id_abono'] = (string)$idAbono;

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

            // =========================================================================
            // DETECTAR SI HAY SOLAPAMIENTO CON OTROS PLANES (SOLO AVISO, NO RECORRER)
            // =========================================================================
            
            // Función para convertir semana/año a un valor comparable
            $semanaToValor = function($sem, $anio) {
                return (int)$anio * 100 + (int)$sem;
            };

            // Valor de la nueva semana fin del plan actual
            $valorNuevaSemanFin = $semanaToValor($newSem, $newAnio);

            // Buscar planes del mismo empleado que ahora se solapen con este plan extendido
            $sqlPlanesSolapados = "
                SELECT 
                    pp.id_plan,
                    pp.sem_inicio,
                    pp.anio_inicio,
                    pp.sem_fin,
                    pp.anio_fin,
                    pr.folio
                FROM planes_pagos pp
                INNER JOIN prestamos pr ON pr.id_prestamo = pp.id_prestamo
                WHERE pr.id_empleado = ?
                  AND pp.id_plan != ?
                  AND pr.estado = 'activo'
                  AND (pp.anio_inicio * 100 + pp.sem_inicio) <= ?
                  AND (pp.anio_fin * 100 + pp.sem_fin) >= ?
                ORDER BY pp.anio_inicio ASC, pp.sem_inicio ASC
            ";
            
            // Obtener el inicio del plan actual para la comparación
            $sqlPlanActual = "SELECT sem_inicio, anio_inicio FROM planes_pagos WHERE id_plan = ?";
            $stmtPlanActual = $conexion->prepare($sqlPlanActual);
            $stmtPlanActual->bind_param('i', $idPlan);
            $stmtPlanActual->execute();
            $resPlanActual = $stmtPlanActual->get_result();
            $planActualData = $resPlanActual->fetch_assoc();
            $stmtPlanActual->close();
            
            $valorInicioPlanActual = $semanaToValor($planActualData['sem_inicio'], $planActualData['anio_inicio']);
            
            $stmtPlanesSol = $conexion->prepare($sqlPlanesSolapados);
            $planesSolapados = [];
            
            if ($stmtPlanesSol) {
                $stmtPlanesSol->bind_param('iiii', $idEmpleado, $idPlan, $valorNuevaSemanFin, $valorInicioPlanActual);
                if ($stmtPlanesSol->execute()) {
                    $resPlanesSol = $stmtPlanesSol->get_result();
                    while ($rowSol = $resPlanesSol->fetch_assoc()) {
                        $planesSolapados[] = [
                            'folio' => $rowSol['folio'],
                            'rango' => "Sem {$rowSol['sem_inicio']}/{$rowSol['anio_inicio']} - Sem {$rowSol['sem_fin']}/{$rowSol['anio_fin']}"
                        ];
                    }
                }
                $stmtPlanesSol->close();
            }
            
            // Guardar la información de solapamiento para incluirla en la respuesta
            $hayAviso = count($planesSolapados) > 0;
            $avisoSolapamiento = $planesSolapados;
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

        // Revisar si el préstamo está liquidado (solo si NO fue pausa)
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
            // Construir mensaje y datos de respuesta para pausa
            $mensajePausa = 'Se pausó la semana y se extendió el plan';
            $dataPausa = [
                'id_prestamo' => $idPrestamo,
                'id_plan' => $idPlan
            ];
            
            // Si hay solapamiento, incluir aviso en la respuesta
            if ($hayAviso && count($avisoSolapamiento) > 0) {
                $dataPausa['aviso_solapamiento'] = true;
                $dataPausa['planes_solapados'] = $avisoSolapamiento;
                $mensajePausa .= '. AVISO: Este plan ahora se solapa con otros planes del empleado.';
            }
            
            respuestas(200, 'Semana pausada', $mensajePausa, 'success', $dataPausa);
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