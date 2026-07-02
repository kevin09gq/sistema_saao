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

        // ======================================================
        // CALCULAR DÍAS DE DERECHO LFT DEL ANIVERSARIO ACTUAL
        // ======================================================
        $fecha_ingreso_final = new DateTime($row['fecha_ingreso_final']);
        $hoy_lft = new DateTime();

        // Años de antigüedad completos a la fecha
        $anios_antiguedad = (int)$hoy_lft->diff($fecha_ingreso_final)->y;

        // Fecha del último aniversario cumplido
        $aniversario_actual = clone $fecha_ingreso_final;
        $aniversario_actual->setDate(
            (int)$hoy_lft->format('Y') - ($hoy_lft < (clone $fecha_ingreso_final)->setDate((int)$hoy_lft->format('Y'), (int)$fecha_ingreso_final->format('m'), (int)$fecha_ingreso_final->format('d')) ? 1 : 0),
            (int)$fecha_ingreso_final->format('m'),
            (int)$fecha_ingreso_final->format('d')
        );

        // Calcular la fecha del aniversario del año actual (puede ser futuro o pasado)
        $aniv_este_anio = clone $fecha_ingreso_final;
        $aniv_este_anio->setDate((int)$hoy_lft->format('Y'), (int)$fecha_ingreso_final->format('m'), (int)$fecha_ingreso_final->format('d'));
        $ultimo_aniversario = ($hoy_lft >= $aniv_este_anio)
            ? $aniv_este_anio
            : (clone $aniv_este_anio)->modify('-1 year');

        // Obtener todas las versiones de leyes LFT con sus días
        $sql_v = "SELECT * FROM versiones_vacaciones_lft ORDER BY fecha_inicio_vigencia ASC";
        $res_v = mysqli_query($conexion, $sql_v);
        $leyes = [];
        if ($res_v) {
            while ($ley = mysqli_fetch_assoc($res_v)) {
                $id_v = $ley['id_version_vacaciones'];
                $sql_d = "SELECT * FROM dias_vacaciones_lft WHERE id_version_vacaciones = '$id_v' ORDER BY anios_antiguedad_inicio ASC";
                $res_d = mysqli_query($conexion, $sql_d);
                $ley['tabla_dias'] = [];
                if ($res_d) {
                    while ($d = mysqli_fetch_assoc($res_d)) {
                        $ley['tabla_dias'][] = $d;
                    }
                }
                $leyes[] = $ley;
            }
        }

        // Seleccionar la ley vigente en la fecha del último aniversario
        $leySeleccionada = null;
        foreach ($leyes as $ley) {
            $inicio_v = new DateTime($ley['fecha_inicio_vigencia']);
            $fin_v = !empty($ley['fecha_fin_vigencia']) ? new DateTime($ley['fecha_fin_vigencia']) : new DateTime('9999-12-31');
            if ($ultimo_aniversario >= $inicio_v && $ultimo_aniversario <= $fin_v) {
                $leySeleccionada = $ley;
                break;
            }
        }

        $diasLft = null;
        $nombreVersionLft = null;
        if ($leySeleccionada) {
            $nombreVersionLft = $leySeleccionada['nombre_version'];
            $rangoValido = null;
            foreach ($leySeleccionada['tabla_dias'] as $rango) {
                $inicioRango = (int)$rango['anios_antiguedad_inicio'];
                if ($anios_antiguedad >= $inicioRango) {
                    if (!$rangoValido || $inicioRango > (int)$rangoValido['anios_antiguedad_inicio']) {
                        $rangoValido = $rango;
                    }
                }
            }
            if ($rangoValido) {
                $diasLft = (float)$rangoValido['dias_vacaciones_correspondientes'];
            }
        }

        $row['dias_lft_anio_actual']  = $diasLft;
        $row['anios_antiguedad_actual'] = $anios_antiguedad;
        $row['nombre_version_lft']    = $nombreVersionLft;
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

    // Obtener la fecha de alta del empleado para validación básica
    $sql_emp = "SELECT fecha_alta_empresa FROM info_empleados WHERE id_empleado = '$id_empleado'";
    $res_emp = mysqli_query($conexion, $sql_emp);
    $row_emp = mysqli_fetch_assoc($res_emp);
    $fecha_alta = $row_emp['fecha_alta_empresa'] ?? '';

    if (empty($fecha_alta) || $fecha_alta == '0000-00-00') {
        echo json_encode(['success' => false, 'message' => 'El empleado no cuenta con una fecha de ingreso (alta) válida para registrar vacaciones.']);
        return;
    }

    $id_periodo_seleccionado = $_POST['id_periodo'] ?? '';

    if (empty($id_periodo_seleccionado)) {
        echo json_encode(['success' => false, 'message' => 'Debe seleccionar un período válido para descontar las vacaciones.']);
        return;
    }

    $id_periodo_seleccionado = intval($id_periodo_seleccionado);

    // Obtener datos del periodo seleccionado
    $sql_p = "SELECT id_periodo, saldo, dias_tomados, num_ciclo, fecha_aniversario FROM vacaciones_periodos 
              WHERE id_periodo = '$id_periodo_seleccionado' AND id_empleado = '$id_empleado'";
    $res_p = mysqli_query($conexion, $sql_p);
    $periodo = mysqli_fetch_assoc($res_p);

    if (!$periodo) {
        echo json_encode(['success' => false, 'message' => 'El período seleccionado no es válido o no pertenece al empleado.']);
        return;
    }

    // Validar que la fecha de inicio de las vacaciones sea igual o posterior al aniversario del período seleccionado
    if ($fecha_inicio < $periodo['fecha_aniversario']) {
        echo json_encode([
            'success' => false, 
            'message' => 'No se puede descontar de este período. La fecha de inicio de las vacaciones (' . date('d-m-Y', strtotime($fecha_inicio)) . ') es anterior a la fecha del aniversario correspondiente (' . date('d-m-Y', strtotime($periodo['fecha_aniversario'])) . ').'
        ]);
        return;
    }

    $metodo_excedente = $_POST['metodo_excedente'] ?? 'antiguo_nuevo';
    $num_ciclo_actual = intval($periodo['num_ciclo']);
    $fecha_aniversario_limite = $periodo['fecha_aniversario'];
    $saldo_periodo_seleccionado = (float)$periodo['saldo'];

    // Obtener los periodos anteriores activos del mismo ciclo con saldo > 0
    $sql_anteriores = "SELECT id_periodo, saldo, dias_tomados, fecha_aniversario FROM vacaciones_periodos 
                       WHERE id_empleado = '$id_empleado' 
                         AND estatus = 'ACTIVO' 
                         AND saldo > 0 
                         AND num_ciclo = '$num_ciclo_actual'
                         AND fecha_aniversario < '$fecha_aniversario_limite'";
    $res_anteriores = mysqli_query($conexion, $sql_anteriores);
    $anteriores = [];
    $saldo_acumulado = $saldo_periodo_seleccionado;
    while ($ant = mysqli_fetch_assoc($res_anteriores)) {
        $anteriores[] = $ant;
        $saldo_acumulado += (float)$ant['saldo'];
    }

    if ($dias_descontar > $saldo_acumulado) {
        echo json_encode([
            'success' => false, 
            'message' => 'El saldo disponible acumulado hasta el período seleccionado es de ' . number_format($saldo_acumulado, 3) . ' días, pero solicita ' . number_format($dias_descontar, 3) . ' días.'
        ]);
        return;
    }

    mysqli_begin_transaction($conexion);
    try {
        $dias_restantes_por_descontar = $dias_descontar;

        // 1. Descontar primero del periodo seleccionado
        $dias_a_tomar_sel = min($dias_restantes_por_descontar, $saldo_periodo_seleccionado);
        $nuevo_saldo_sel = $saldo_periodo_seleccionado - $dias_a_tomar_sel;
        $nuevos_dias_tomados_sel = (float)$periodo['dias_tomados'] + $dias_a_tomar_sel;
        $nuevo_estatus_sel = ($nuevo_saldo_sel <= 0) ? 'VENCIDO' : 'ACTIVO';

        $sql_upd_sel = "UPDATE vacaciones_periodos 
                        SET saldo = '$nuevo_saldo_sel', dias_tomados = '$nuevos_dias_tomados_sel', estatus = '$nuevo_estatus_sel' 
                        WHERE id_periodo = '$id_periodo_seleccionado'";
        if (!mysqli_query($conexion, $sql_upd_sel)) {
            throw new Exception("Error al actualizar el periodo seleccionado.");
        }
        $dias_restantes_por_descontar -= $dias_a_tomar_sel;

        // 2. Si quedan días por descontar, descontar de los anteriores
        if ($dias_restantes_por_descontar > 0 && count($anteriores) > 0) {
            // Ordenar los anteriores de acuerdo con el metodo_excedente seleccionado
            usort($anteriores, function ($a, $b) use ($metodo_excedente) {
                $timeA = strtotime($a['fecha_aniversario']);
                $timeB = strtotime($b['fecha_aniversario']);
                if ($metodo_excedente === 'nuevo_antiguo') {
                    // Más reciente a más antiguo (DESC)
                    return $timeB - $timeA;
                } else {
                    // Más antiguo a más nuevo (ASC)
                    return $timeA - $timeB;
                }
            });

            foreach ($anteriores as $ant) {
                if ($dias_restantes_por_descontar <= 0) {
                    break;
                }
                $id_ant = $ant['id_periodo'];
                $saldo_ant = (float)$ant['saldo'];
                $dias_tomados_ant = (float)$ant['dias_tomados'];

                $dias_a_tomar_ant = min($dias_restantes_por_descontar, $saldo_ant);
                $nuevo_saldo_ant = $saldo_ant - $dias_a_tomar_ant;
                $nuevos_dias_tomados_ant = $dias_tomados_ant + $dias_a_tomar_ant;
                $nuevo_estatus_ant = ($nuevo_saldo_ant <= 0) ? 'VENCIDO' : 'ACTIVO';

                $sql_upd_ant = "UPDATE vacaciones_periodos 
                                SET saldo = '$nuevo_saldo_ant', dias_tomados = '$nuevos_dias_tomados_ant', estatus = '$nuevo_estatus_ant' 
                                WHERE id_periodo = '$id_ant'";
                if (!mysqli_query($conexion, $sql_upd_ant)) {
                    throw new Exception("Error al actualizar el periodo anterior.");
                }
                $dias_restantes_por_descontar -= $dias_a_tomar_ant;
            }
        }

        // Insertar el movimiento en el Kardex asociándolo al período seleccionado
        $dias_movimiento = -$dias_descontar;
        $fecha_registro_kardex = $fecha_inicio . ' 00:00:00';
        
        $sql_ins_k = "INSERT INTO kardex_vacaciones (id_periodo, id_empleado, num_ciclo, concepto, fecha_registro, fecha_inicio, fecha_fin, dias_movimiento, saldo_resultante, observaciones)
                      VALUES ('$id_periodo_seleccionado', '$id_empleado', '$num_ciclo_actual', '$concepto', '$fecha_registro_kardex', '$fecha_inicio', '$fecha_fin', '$dias_movimiento', 0, '$observaciones')";
        if (!mysqli_query($conexion, $sql_ins_k)) {
            throw new Exception("Error al insertar el movimiento en el Kardex.");
        }

        // Recalcular todos los saldos resultantes del Kardex para el CICLO ACTUAL del empleado
        $sql_kardex_all = "SELECT id_kardex, dias_movimiento FROM kardex_vacaciones 
                           WHERE id_empleado = '$id_empleado' AND num_ciclo = '$num_ciclo_actual'
                           ORDER BY fecha_registro ASC, id_kardex ASC";
        $res_kardex_all = mysqli_query($conexion, $sql_kardex_all);

        $saldo_acumulado_kardex = 0.000;
        while ($mov = mysqli_fetch_assoc($res_kardex_all)) {
            $id_k = $mov['id_kardex'];
            $dias_mov = (float)$mov['dias_movimiento'];
            $saldo_acumulado_kardex += $dias_mov;

            $sql_upd_k = "UPDATE kardex_vacaciones 
                          SET saldo_resultante = '$saldo_acumulado_kardex' 
                          WHERE id_kardex = '$id_k'";
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
    $septimo_dia        = floatval($_POST['septimo_dia'] ?? 0);
    $festivos           = intval($_POST['festivos'] ?? 0);
    $incluir_septimo_dia = intval($_POST['incluir_septimo_dia'] ?? 1);
    $incluir_festivos    = intval($_POST['incluir_festivos'] ?? 1);
    $salario_diario     = floatval($_POST['salario_diario'] ?? 0);
    $porcentaje_prima   = floatval($_POST['porcentaje_prima'] ?? 0);
    $monto_prima_vacacional = floatval($_POST['monto_prima_vacacional'] ?? 0);
    $dispersion_tarjeta = floatval($_POST['dispersion_tarjeta'] ?? 0);
    $isr                = floatval($_POST['isr'] ?? 0);
    $imss               = floatval($_POST['imss'] ?? 0);
    $infonavit          = floatval($_POST['infonavit'] ?? 0);
    $total_pagado       = floatval($_POST['total_pagado'] ?? 0);
    $dias_disfrutados   = floatval($_POST['dias_disfrutados'] ?? 0);
    $dias_pagadas       = floatval($_POST['dias_pagadas'] ?? 0);
    $observaciones      = mysqli_real_escape_string($conexion, $_POST['observaciones'] ?? '');

    $sql = "UPDATE prima_vacacional_empleados SET 
                numero_semana = '$numero_semana',
                anio = '$anio',
                fecha_pago = '$fecha_pago',
                fecha_inicio = '$fecha_inicio',
                fecha_fin = '$fecha_fin',
                dias_vacaciones = '$dias_vacaciones',
                septimo_dia = '$septimo_dia',
                festivos = '$festivos',
                incluir_septimo_dia = '$incluir_septimo_dia',
                incluir_festivos = '$incluir_festivos',
                salario_diario = '$salario_diario',
                porcentaje_prima = '$porcentaje_prima',
                monto_prima_vacacional = '$monto_prima_vacacional',
                dispersion_tarjeta = '$dispersion_tarjeta',
                isr = '$isr',
                imss = '$imss',
                infonavit = '$infonavit',
                total_pagado = '$total_pagado',
                dias_disfrutados = '$dias_disfrutados',
                dias_pagadas = '$dias_pagadas',
                observaciones = '$observaciones'
            WHERE id_prima_empleado = '$id_prima_empleado'";

    if (mysqli_query($conexion, $sql)) {
        echo json_encode(['success' => true, 'message' => 'Prima vacacional actualizada exitosamente.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al actualizar: ' . mysqli_error($conexion)]);
    }
}





