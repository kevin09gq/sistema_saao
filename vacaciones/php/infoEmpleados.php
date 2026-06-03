<?php
include("../../conexion/conexion.php");

/** @var mysqli $conexion */
$action = $_POST['action'] ?? '';

switch ($action) {
    case 'obtenerEmpleados':
        obtenerEmpleados($conexion);
        break;
    case 'obtenerEmpleadoPorId':
        obtenerEmpleadoPorId($conexion);
        break;
    case 'obtenerPeriodosEmpleado':
        obtenerPeriodosEmpleado($conexion);
        break;
    case 'obtenerKardexEmpleado':
        obtenerKardexEmpleado($conexion);
        break;
    case 'registrarVacaciones':
        registrarVacaciones($conexion);
        break;
    case 'restaurarVacaciones':
        restaurarVacaciones($conexion);
        break;
    case 'obtenerPrimasEmpleado':
        obtenerPrimasEmpleado($conexion);
        break;
    case 'editarPrimaVacacional':
        editarPrimaVacacional($conexion);
        break;
    default:
        echo json_encode(['error' => 'Acción no válida']);
        break;
}

//==============================
// OBTIENE LA INFORMACIÓN DE UN EMPLEADO ESPECÍFICO POR ID DEL EMPLEADO
//==============================

function obtenerEmpleadoPorId($conexion)
{
    $id_empleado = $_POST['id_empleado'] ?? 0;

    $sql = "SELECT 
                e.id_empleado,
                e.clave_empleado,
                e.nombre,
                e.ap_paterno,
                e.ap_materno,
                e.fecha_alta_empresa,
                e.id_status,
                e.salario_diario,
                COALESCE(
                    (SELECT MAX(fecha_reingreso) 
                     FROM historial_reingresos 
                     WHERE id_empleado = e.id_empleado), 
                    e.fecha_alta_empresa
                ) AS fecha_ingreso_final,
                e.id_area,
                e.id_departamento,
                d.nombre_departamento,
                a.nombre_area
            FROM info_empleados e
            LEFT JOIN departamentos d ON e.id_departamento = d.id_departamento
            LEFT JOIN areas a ON e.id_area = a.id_area
            WHERE e.id_empleado = '$id_empleado'";

    $result = mysqli_query($conexion, $sql);
    $row = mysqli_fetch_assoc($result);

    if ($row) {
        // Calcular antigüedad
        $fecha_ingreso = new DateTime($row['fecha_ingreso_final']);
        $hoy = new DateTime();
        $diferencia = $hoy->diff($fecha_ingreso);
        $row['antiguedad'] = $diferencia->y . " años";

        // Obtener historial de reingresos y bajas
        $sql_h = "SELECT fecha_reingreso, fecha_salida FROM historial_reingresos WHERE id_empleado = '$id_empleado' ORDER BY fecha_reingreso ASC";
        $res_h = mysqli_query($conexion, $sql_h);
        $historial = [];
        if ($res_h) {
            while ($h = mysqli_fetch_assoc($res_h)) {
                $historial[] = $h;
            }
        }
        $row['historial_reingresos'] = $historial;
    }

    echo json_encode($row);
}

//==============================
// OBTIENE LA INFORMACIÓN DE TODOS LOS EMPLEADOS REGISTRADOS EN LA BASE DE DATOS
//==============================

function obtenerEmpleados($conexion)
{
    $sql = "SELECT 
                e.id_empleado,
                e.clave_empleado,
                e.nombre,
                e.ap_paterno,
                e.ap_materno,
                e.fecha_alta_empresa,
                e.id_status,
                COALESCE(
                    (SELECT MAX(fecha_reingreso) 
                     FROM historial_reingresos 
                     WHERE id_empleado = e.id_empleado), 
                    e.fecha_alta_empresa
                ) AS fecha_ingreso_final,
                e.id_area,
                e.id_departamento,
                d.nombre_departamento,
                a.nombre_area
            FROM info_empleados e
            LEFT JOIN departamentos d ON e.id_departamento = d.id_departamento
            LEFT JOIN areas a ON e.id_area = a.id_area
            ORDER BY e.id_status ASC, e.clave_empleado ASC";

    $result = mysqli_query($conexion, $sql);

    $empleados = [];
    while ($row = mysqli_fetch_assoc($result)) {
        // Calcular antigüedad desde la fecha de ingreso final (tomando en cuenta reingresos)
        $fecha_ingreso = new DateTime($row['fecha_ingreso_final']);
        $hoy = new DateTime();
        $diferencia = $hoy->diff($fecha_ingreso);
        $row['antiguedad'] = $diferencia->y . " años";

        $empleados[] = $row;
    }

    echo json_encode($empleados);
}


function obtenerKardexEmpleado($conexion)
{
    $id_empleado = $_POST['id_empleado'] ?? 0;

    $sql = "SELECT * FROM kardex_vacaciones 
            WHERE id_empleado = '$id_empleado'
            ORDER BY num_ciclo ASC, fecha_registro ASC";

    $result = mysqli_query($conexion, $sql);
    $movimientos = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $movimientos[] = $row;
    }
    echo json_encode($movimientos);
}

function obtenerPeriodosEmpleado($conexion)
{
    $id_empleado = $_POST['id_empleado'] ?? 0;

    $sql = "SELECT p.*, v.nombre_version 
            FROM vacaciones_periodos p
            JOIN versiones_vacaciones_lft v ON p.id_version_vacaciones = v.id_version_vacaciones
            WHERE p.id_empleado = '$id_empleado'
            ORDER BY p.num_ciclo ASC, p.fecha_aniversario ASC";

    $result = mysqli_query($conexion, $sql);
    $periodos = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $periodos[] = $row;
    }
    echo json_encode($periodos);
}

function registrarVacaciones($conexion)
{
    $id_empleado = $_POST['id_empleado'] ?? 0;
    $fecha_inicio = $_POST['fecha_inicio'] ?? '';
    $fecha_fin = $_POST['fecha_fin'] ?? '';
    $concepto = $_POST['concepto'] ?? 'Vacaciones';
    $observaciones = $_POST['observaciones'] ?? '';

    if ($id_empleado <= 0 || empty($fecha_inicio) || empty($fecha_fin)) {
        echo json_encode(['success' => false, 'message' => 'Datos incompletos o inválidos.']);
        return;
    }

    // Calcular días a descontar excluyendo domingos y festividades de la base de datos
    $dias_descontar = 0.0;
    $sql_festivos = "SELECT fecha FROM festividades WHERE fecha BETWEEN '" . mysqli_real_escape_string($conexion, $fecha_inicio) . "' AND '" . mysqli_real_escape_string($conexion, $fecha_fin) . "'";
    $res_festivos = mysqli_query($conexion, $sql_festivos);
    $festivos = [];
    if ($res_festivos) {
        while ($f = mysqli_fetch_assoc($res_festivos)) {
            $festivos[] = $f['fecha'];
        }
    }

    try {
        $current = new DateTime($fecha_inicio);
        $end = new DateTime($fecha_fin);
        $end->modify('+1 day'); // Incluir fecha_fin

        $interval = new DateInterval('P1D');
        $daterange = new DatePeriod($current, $interval, $end);

        foreach ($daterange as $date) {
            $w = (int)$date->format('w'); // 0 = Domingo
            $f_str = $date->format('Y-m-d');
            if ($w !== 0 && !in_array($f_str, $festivos)) {
                $dias_descontar += 1.0;
            }
        }
    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Error al procesar el rango de fechas.']);
        return;
    }

    if ($dias_descontar <= 0) {
        echo json_encode(['success' => false, 'message' => 'El rango seleccionado no contiene días laborables (excluyendo domingos y festivos).']);
        return;
    }

    // Obtener la fecha de alta del empleado para reconstruir los ciclos
    $sql_emp = "SELECT fecha_alta_empresa FROM info_empleados WHERE id_empleado = '$id_empleado'";
    $res_emp = mysqli_query($conexion, $sql_emp);
    $row_emp = mysqli_fetch_assoc($res_emp);
    $fecha_alta = $row_emp['fecha_alta_empresa'] ?? '';

    if (empty($fecha_alta) || $fecha_alta == '0000-00-00') {
        echo json_encode(['success' => false, 'message' => 'El empleado no cuenta con una fecha de ingreso (alta) válida para registrar vacaciones.']);
        return;
    }

    // Reconstruir los ciclos de empleo
    $sql_h = "SELECT fecha_reingreso, fecha_salida FROM historial_reingresos WHERE id_empleado = '$id_empleado' ORDER BY fecha_reingreso ASC";
    $res_h = mysqli_query($conexion, $sql_h);
    
    $ciclos = [];
    $hoy_str = date('Y-m-d');
    if (mysqli_num_rows($res_h) == 0) {
        $ciclos[] = [
            'num_ciclo' => 1,
            'inicio' => $fecha_alta,
            'fin' => $hoy_str
        ];
    } else {
        $idx = 0;
        while ($h = mysqli_fetch_assoc($res_h)) {
            $idx++;
            $fin = $h['fecha_salida'];
            if (empty($fin) || $fin == '0000-00-00') {
                $fin = $hoy_str; 
            }
            $ciclos[] = [
                'num_ciclo' => $idx,
                'inicio' => $h['fecha_reingreso'],
                'fin' => $fin
            ];
        }
    }

    // Determinar a qué ciclo corresponde la fecha de inicio de las vacaciones
    $num_ciclo_actual = 1;
    try {
        $fecha_vac_dt = new DateTime($fecha_inicio);
        foreach ($ciclos as $c) {
            $inicio_dt = new DateTime($c['inicio']);
            $fin_dt = new DateTime($c['fin']);
            if ($c['fin'] === $hoy_str) {
                $fin_dt = new DateTime('9999-12-31');
            }
            if ($fecha_vac_dt >= $inicio_dt && $fecha_vac_dt <= $fin_dt) {
                $num_ciclo_actual = $c['num_ciclo'];
                break;
            }
        }
    } catch (Exception $e) {
        // Fallback al ciclo más alto en caso de error de fecha
        $sql_ciclo = "SELECT COALESCE(MAX(num_ciclo), 1) AS ciclo_actual FROM vacaciones_periodos WHERE id_empleado = '$id_empleado'";
        $res_ciclo = mysqli_query($conexion, $sql_ciclo);
        $row_ciclo = mysqli_fetch_assoc($res_ciclo);
        $num_ciclo_actual = (int)$row_ciclo['ciclo_actual'];
    }

    // 1. Obtener la suma del saldo disponible total de los periodos activos del CICLO ACTUAL
    $sql_saldo = "SELECT SUM(saldo) AS saldo_total FROM vacaciones_periodos 
                  WHERE id_empleado = '$id_empleado' AND estatus = 'ACTIVO' AND num_ciclo = '$num_ciclo_actual'";
    $res_saldo = mysqli_query($conexion, $sql_saldo);
    $row_saldo = mysqli_fetch_assoc($res_saldo);
    $saldo_total = (float)($row_saldo['saldo_total'] ?? 0);

    if ($dias_descontar > $saldo_total) {
        echo json_encode([
            'success' => false, 
            'message' => 'El empleado no cuenta con suficientes días de vacaciones disponibles. Disponibles: ' . number_format($saldo_total, 3) . ', Solicitados: ' . number_format($dias_descontar, 3)
        ]);
        return;
    }

    // 2. Obtener los periodos activos del CICLO ACTUAL ordenados por fecha_aniversario ASC (del más antiguo al más actual)
    $sql_periodos = "SELECT id_periodo, saldo, dias_tomados FROM vacaciones_periodos 
                     WHERE id_empleado = '$id_empleado' AND estatus = 'ACTIVO' AND saldo > 0 AND num_ciclo = '$num_ciclo_actual'
                     ORDER BY fecha_aniversario ASC";
    $res_periodos = mysqli_query($conexion, $sql_periodos);

    $dias_restantes_por_descontar = $dias_descontar;
    mysqli_begin_transaction($conexion);

    try {
        $id_periodo_kardex = null;
        while ($periodo = mysqli_fetch_assoc($res_periodos)) {
            if ($dias_restantes_por_descontar <= 0) {
                break;
            }

            $id_periodo = $periodo['id_periodo'];
            if ($id_periodo_kardex === null) {
                $id_periodo_kardex = $id_periodo;
            }
            $saldo_periodo = (float)$periodo['saldo'];
            $dias_tomados_periodo = (float)$periodo['dias_tomados'];

            // Determinar cuántos días tomamos de este periodo
            $dias_a_tomar = min($dias_restantes_por_descontar, $saldo_periodo);

            $nuevo_saldo = $saldo_periodo - $dias_a_tomar;
            $nuevos_dias_tomados = $dias_tomados_periodo + $dias_a_tomar;
            $nuevo_estatus = ($nuevo_saldo <= 0) ? 'VENCIDO' : 'ACTIVO';

            // Actualizar el periodo en la base de datos
            $sql_upd_p = "UPDATE vacaciones_periodos 
                          SET saldo = '$nuevo_saldo', dias_tomados = '$nuevos_dias_tomados', estatus = '$nuevo_estatus' 
                          WHERE id_periodo = '$id_periodo'";
            if (!mysqli_query($conexion, $sql_upd_p)) {
                throw new Exception("Error al actualizar el periodo.");
            }

            $dias_restantes_por_descontar -= $dias_a_tomar;
        }

        // Insertar el único movimiento consolidado en el Kardex
        if ($id_periodo_kardex !== null) {
            $dias_movimiento = -$dias_descontar;
            // Para la fecha de registro en el Kardex usamos fecha_inicio con hora 00:00:00 para ordenar cronológicamente
            $fecha_registro_kardex = $fecha_inicio . ' 00:00:00';
            
            $sql_ins_k = "INSERT INTO kardex_vacaciones (id_periodo, id_empleado, num_ciclo, concepto, fecha_registro, fecha_inicio, fecha_fin, dias_movimiento, saldo_resultante, observaciones)
                          VALUES ('$id_periodo_kardex', '$id_empleado', '$num_ciclo_actual', '$concepto', '$fecha_registro_kardex', '$fecha_inicio', '$fecha_fin', '$dias_movimiento', 0, '$observaciones')";
            if (!mysqli_query($conexion, $sql_ins_k)) {
                throw new Exception("Error al insertar el movimiento consolidado en el Kardex.");
            }
        }

        // 3. Recalcular todos los saldos resultantes del Kardex para el CICLO ACTUAL del empleado
        $sql_kardex_all = "SELECT id_kardex, dias_movimiento FROM kardex_vacaciones 
                           WHERE id_empleado = '$id_empleado' AND num_ciclo = '$num_ciclo_actual'
                           ORDER BY fecha_registro ASC, id_kardex ASC";
        $res_kardex_all = mysqli_query($conexion, $sql_kardex_all);

        $saldo_acumulado = 0.000;
        while ($mov = mysqli_fetch_assoc($res_kardex_all)) {
            $id_kardex = $mov['id_kardex'];
            $dias_mov = (float)$mov['dias_movimiento'];
            $saldo_acumulado += $dias_mov;

            $sql_upd_k = "UPDATE kardex_vacaciones 
                          SET saldo_resultante = '$saldo_acumulado' 
                          WHERE id_kardex = '$id_kardex'";
            if (!mysqli_query($conexion, $sql_upd_k)) {
                throw new Exception("Error al recalcular el saldo del Kardex.");
            }
        }

        mysqli_commit($conexion);
        echo json_encode(['success' => true, 'message' => 'Vacaciones registradas exitosamente.']);
    } catch (Exception $e) {
        mysqli_rollback($conexion);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

function restaurarVacaciones($conexion)
{
    $id_empleado = $_POST['id_empleado'] ?? 0;
    if ($id_empleado <= 0) {
        echo json_encode(['success' => false, 'message' => 'ID de empleado no válido.']);
        return;
    }

    mysqli_begin_transaction($conexion);

    try {
        // 1. Eliminar periodos y kardex del empleado
        $sql_del_k = "DELETE FROM kardex_vacaciones WHERE id_empleado = '$id_empleado'";
        if (!mysqli_query($conexion, $sql_del_k)) {
            throw new Exception("Error al limpiar el historial del Kardex.");
        }

        $sql_del_p = "DELETE FROM vacaciones_periodos WHERE id_empleado = '$id_empleado'";
        if (!mysqli_query($conexion, $sql_del_p)) {
            throw new Exception("Error al limpiar los periodos de vacaciones.");
        }

        // 2. Cargar todas las leyes de vacaciones LFT vigentes
        $sql_l = "SELECT * FROM versiones_vacaciones_lft ORDER BY fecha_inicio_vigencia ASC";
        $res_l = mysqli_query($conexion, $sql_l);
        $leyes = [];
        while ($v = mysqli_fetch_assoc($res_l)) {
            $id_v = $v['id_version_vacaciones'];
            $sql_d = "SELECT * FROM dias_vacaciones_lft WHERE id_version_vacaciones = '$id_v' ORDER BY anios_antiguedad_inicio ASC";
            $res_d = mysqli_query($conexion, $sql_d);
            $v['tabla_dias'] = [];
            while ($d = mysqli_fetch_assoc($res_d)) {
                $v['tabla_dias'][] = $d;
            }
            $leyes[] = $v;
        }

        // 3. Obtener datos del empleado
        $sql_e = "SELECT id_empleado, clave_empleado, nombre, ap_paterno, ap_materno, fecha_alta_empresa, id_status FROM info_empleados WHERE id_empleado = '$id_empleado'";
        $res_e = mysqli_query($conexion, $sql_e);
        $emp = mysqli_fetch_assoc($res_e);

        if (!$emp) {
            throw new Exception("Empleado no encontrado.");
        }

        $fecha_alta = $emp['fecha_alta_empresa'];
        if (empty($fecha_alta) || $fecha_alta == '0000-00-00') {
            throw new Exception("El empleado no cuenta con una fecha de ingreso válida para calcular.");
        }

        $hoy_str = date('Y-m-d');
        $hoy = new DateTime($hoy_str);

        // 4. Reconstruir los ciclos de empleo
        $sql_h = "SELECT fecha_reingreso, fecha_salida FROM historial_reingresos WHERE id_empleado = '$id_empleado' ORDER BY fecha_reingreso ASC";
        $res_h = mysqli_query($conexion, $sql_h);
        
        $ciclos = [];
        if (mysqli_num_rows($res_h) == 0) {
            $ciclos[] = [
                'inicio' => $fecha_alta,
                'fin' => $hoy_str
            ];
        } else {
            while ($h = mysqli_fetch_assoc($res_h)) {
                $fin = $h['fecha_salida'];
                if (empty($fin) || $fin == '0000-00-00') {
                    $fin = $hoy_str; 
                }
                $ciclos[] = [
                    'inicio' => $h['fecha_reingreso'],
                    'fin' => $fin
                ];
            }
        }

        // 5. Calcular los periodos y movimientos para cada ciclo
        $num_ciclo = 0; // Contador de ciclos laborales
        foreach ($ciclos as $ciclo) {
            $num_ciclo++; // Cada ciclo laboral es independiente (1, 2, 3...)
            $fecha_inicio_ciclo = new DateTime($ciclo['inicio']);
            $fecha_fin_ciclo = new DateTime($ciclo['fin']);
            
            $anioBase = (int)$fecha_inicio_ciclo->format('Y');
            $mesBase = (int)$fecha_inicio_ciclo->format('m');
            $diaBase = (int)$fecha_inicio_ciclo->format('d');
            
            for ($anios = 1; $anios <= 100; $anios++) {
                $timestamp = mktime(12, 0, 0, $mesBase, $diaBase, $anioBase + $anios);
                $fechaAniversario = new DateTime(date('Y-m-d', $timestamp));
                
                if ($fechaAniversario > $fecha_fin_ciclo) {
                    break;
                }
                
                $fecha_aniv_str = $fechaAniversario->format('Y-m-d');
                
                $leySeleccionada = null;
                foreach ($leyes as $ley) {
                    $inicio_vigencia = new DateTime($ley['fecha_inicio_vigencia']);
                    $fin_vigencia = !empty($ley['fecha_fin_vigencia']) ? new DateTime($ley['fecha_fin_vigencia']) : new DateTime('9999-12-31');
                    if ($fechaAniversario >= $inicio_vigencia && $fechaAniversario <= $fin_vigencia) {
                        $leySeleccionada = $ley;
                        break;
                    }
                }
                
                if ($leySeleccionada) {
                    $id_version = $leySeleccionada['id_version_vacaciones'];
                    
                    $rangoValido = null;
                    foreach ($leySeleccionada['tabla_dias'] as $rango) {
                        $inicioRango = (int)$rango['anios_antiguedad_inicio'];
                        if ($anios >= $inicioRango) {
                            if (!$rangoValido || $inicioRango > (int)$rangoValido['anios_antiguedad_inicio']) {
                                $rangoValido = $rango;
                            }
                        }
                    }
                    
                    if ($rangoValido) {
                        $diasDerecho = (float)$rangoValido['dias_vacaciones_correspondientes'];
                        
                        $sql_ins_p = "INSERT INTO vacaciones_periodos (id_empleado, num_ciclo, fecha_aniversario, anios_antiguedad, id_version_vacaciones, dias_derecho, dias_tomados, saldo, estatus)
                                      VALUES ('$id_empleado', '$num_ciclo', '$fecha_aniv_str', '$anios', '$id_version', '$diasDerecho', 0, '$diasDerecho', 'ACTIVO')";
                        
                        if (!mysqli_query($conexion, $sql_ins_p)) {
                            throw new Exception("Error al insertar el periodo del aniversario #" . $anios);
                        }
                        
                        $id_periodo_nuevo = mysqli_insert_id($conexion);
                        
                        $sql_sum = "SELECT COALESCE(SUM(dias_movimiento), 0) AS total_saldo FROM kardex_vacaciones WHERE id_empleado = '$id_empleado' AND num_ciclo = '$num_ciclo'";
                        $res_sum = mysqli_query($conexion, $sql_sum);
                        $row_sum = mysqli_fetch_assoc($res_sum);
                        $saldo_previo = (float)$row_sum['total_saldo'];
                        $nuevo_saldo_resultante = $saldo_previo + $diasDerecho;

                        $concepto = "Aniversario laboral al finalizar la jornada";
                        $observaciones = "Cálculo automático del sistema";
                        $sql_ins_k = "INSERT INTO kardex_vacaciones (id_periodo, id_empleado, num_ciclo, concepto, fecha_registro, fecha_inicio, fecha_fin, dias_movimiento, saldo_resultante, observaciones)
                                      VALUES ('$id_periodo_nuevo', '$id_empleado', '$num_ciclo', '$concepto', '$fecha_aniv_str', NULL, NULL, '$diasDerecho', '$nuevo_saldo_resultante', '$observaciones')";
                        
                        if (!mysqli_query($conexion, $sql_ins_k)) {
                            throw new Exception("Error al insertar el movimiento de Kardex del aniversario #" . $anios);
                        }
                    }
                }
            }
        }

        mysqli_commit($conexion);
        echo json_encode(['success' => true, 'message' => 'Se restauraron y sincronizaron todos los datos de vacaciones del empleado.']);
    } catch (Exception $e) {
        mysqli_rollback($conexion);
        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
    }
}

//==============================
// OBTIENE LAS PRIMAS VACACIONALES DE UN EMPLEADO
//==============================
function obtenerPrimasEmpleado($conexion)
{
    $id_empleado = intval($_POST['id_empleado'] ?? 0);

    if ($id_empleado <= 0) {
        echo json_encode([]);
        return;
    }

    $sql = "SELECT * 
            FROM prima_vacacional_empleados
            WHERE id_empleado = '$id_empleado'
            ORDER BY fecha_pago DESC, id_prima_empleado DESC";

    $result = mysqli_query($conexion, $sql);
    $primas = [];
    if ($result) {
        while ($row = mysqli_fetch_assoc($result)) {
            $primas[] = $row;
        }
    }
    echo json_encode($primas);
}

//==============================
// EDITA EL REGISTRO DE PRIMA VACACIONAL EN LA BASE DE DATOS
//==============================
function editarPrimaVacacional($conexion)
{
    $id_prima_empleado = intval($_POST['id_prima_empleado'] ?? 0);
    if ($id_prima_empleado <= 0) {
        echo json_encode(['success' => false, 'message' => 'ID de prima no válido.']);
        return;
    }

    $numero_semana      = intval($_POST['numero_semana'] ?? 0);
    $anio               = intval($_POST['anio'] ?? 0);
    $fecha_pago         = mysqli_real_escape_string($conexion, $_POST['fecha_pago'] ?? '');
    $fecha_inicio       = mysqli_real_escape_string($conexion, $_POST['fecha_inicio'] ?? '');
    $fecha_fin          = mysqli_real_escape_string($conexion, $_POST['fecha_fin'] ?? '');
    $dias_vacaciones    = floatval($_POST['dias_vacaciones'] ?? 0);
    $domingos           = intval($_POST['domingos'] ?? 0);
    $festivos           = intval($_POST['festivos'] ?? 0);
    $salario_diario     = floatval($_POST['salario_diario'] ?? 0);
    $porcentaje_prima   = floatval($_POST['porcentaje_prima'] ?? 0);
    $monto_prima_vacacional = floatval($_POST['monto_prima_vacacional'] ?? 0);
    $dispersion_tarjeta = floatval($_POST['dispersion_tarjeta'] ?? 0);
    $isr                = floatval($_POST['isr'] ?? 0);
    $total_pagado       = floatval($_POST['total_pagado'] ?? 0);
    $observaciones      = mysqli_real_escape_string($conexion, $_POST['observaciones'] ?? '');

    $sql = "UPDATE prima_vacacional_empleados SET 
                numero_semana = '$numero_semana',
                anio = '$anio',
                fecha_pago = '$fecha_pago',
                fecha_inicio = '$fecha_inicio',
                fecha_fin = '$fecha_fin',
                dias_vacaciones = '$dias_vacaciones',
                domingos = '$domingos',
                festivos = '$festivos',
                salario_diario = '$salario_diario',
                porcentaje_prima = '$porcentaje_prima',
                monto_prima_vacacional = '$monto_prima_vacacional',
                dispersion_tarjeta = '$dispersion_tarjeta',
                isr = '$isr',
                total_pagado = '$total_pagado',
                observaciones = '$observaciones'
            WHERE id_prima_empleado = '$id_prima_empleado'";

    if (mysqli_query($conexion, $sql)) {
        echo json_encode(['success' => true, 'message' => 'Prima vacacional actualizada exitosamente.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al actualizar: ' . mysqli_error($conexion)]);
    }
}





