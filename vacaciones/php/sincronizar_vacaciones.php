<?php
//==================================================================================================
// MOTOR DE SINCRONIZACIÓN DE VACACIONES
// Este script recorre todos los empleados, calcula sus ciclos de empleo (reingresos y bajas),
// y guarda en la base de datos los periodos y abonos del Kardex que falten por registrar.
//==================================================================================================

header('Content-Type: application/json');
include("../../conexion/conexion.php");

/** @var mysqli $conexion */


//==================================================================================================
// PASO 1: CARGAR LAS NORMAS LFT DE LA BASE DE DATOS
// Traemos todas las versiones (ej: Ley anterior, Ley 2023 "Digna") y sus respectivas tablas de días.
//
// EJEMPLO DE DATOS QUE TRAE:
// id_version_vacaciones=1, nombre_version="Ley Anterior", fecha_inicio_vigencia="2018-01-01"
// id_version_vacaciones=2, nombre_version="Ley 2023 Digna", fecha_inicio_vigencia="2023-05-01"
//==================================================================================================
$sql_v = "SELECT * FROM versiones_vacaciones_lft ORDER BY fecha_inicio_vigencia ASC";
$res_v = mysqli_query($conexion, $sql_v);
$leyes = [];
while ($v = mysqli_fetch_assoc($res_v)) {
    $id_v = $v['id_version_vacaciones'];
    
    // Para cada versión de la ley, traemos su tabulador de días ganados según la antigüedad
    $sql_d = "SELECT * FROM dias_vacaciones_lft WHERE id_version_vacaciones = '$id_v' ORDER BY anios_antiguedad_inicio ASC";
    $res_d = mysqli_query($conexion, $sql_d);
    
    $v['tabla_dias'] = [];
    while ($d = mysqli_fetch_assoc($res_d)) {
        // Ejemplo: anios_antiguedad_inicio=1, dias_vacaciones_correspondientes=12
        // Ejemplo: anios_antiguedad_inicio=5, dias_vacaciones_correspondientes=14
        $v['tabla_dias'][] = $d;
    }
    $leyes[] = $v; // Guardamos la ley completa con su tabla de días adentro
    // Resultado: $leyes[0] = ['id_version'=>1, 'nombre_version'=>'Ley Anterior', 'tabla_dias'=>[...]]
}

//==================================================================================================
// PASO 2: OBTENER TODOS LOS EMPLEADOS
// Necesitamos procesar a cada trabajador registrado en el sistema.
//
// EJEMPLO DE DATOS QUE TRAE:
// id_empleado=1, clave_empleado="12345", nombre="Juan", ap_paterno="Pérez", fecha_alta_empresa="2020-05-27", id_status=1
// id_empleado=2, clave_empleado="12346", nombre="María", ap_paterno="López", fecha_alta_empresa="2018-01-15", id_status=1
//==================================================================================================
$sql_e = "SELECT id_empleado, clave_empleado, nombre, ap_paterno, ap_materno, fecha_alta_empresa, id_status FROM info_empleados";
$res_e = mysqli_query($conexion, $sql_e);
$empleados_procesados = 0;
$periodos_insertados = 0;
$kardex_insertados = 0;

$hoy_str = date('Y-m-d');
$hoy = new DateTime($hoy_str);

// Recorremos la lista de empleados uno por uno
while ($emp = mysqli_fetch_assoc($res_e)) {
    $id_empleado = $emp['id_empleado'];
    $fecha_alta = $emp['fecha_alta_empresa'];
    
    // Si el empleado no tiene una fecha de ingreso válida, no podemos calcular nada. Lo saltamos.
    if (empty($fecha_alta) || $fecha_alta == '0000-00-00') {
        continue; 
    }
    
    //==============================================================================================
    // PASO 3: RECONSTRUIR LOS "CICLOS DE EMPLEO" (REINGRESOS Y BAJAS)
    // Leemos la tabla 'historial_reingresos' ordenada cronológicamente por fecha de reingreso.
    //
    // EJEMPLO PARA EMPLEADO ID=1:
    // Ciclo 1: fecha_reingreso="2020-05-27", fecha_salida="2023-06-15" (fue dado de baja)
    // Ciclo 2: fecha_reingreso="2023-10-01", fecha_salida=NULL (actual - sin baja)
    // Se construyen 2 ciclos independientes que resetean antigüedad de 0
    //==============================================================================================
    $sql_h = "SELECT fecha_reingreso, fecha_salida FROM historial_reingresos WHERE id_empleado = '$id_empleado' ORDER BY fecha_reingreso ASC";
    $res_h = mysqli_query($conexion, $sql_h);
    
    $ciclos = [];
    if (mysqli_num_rows($res_h) == 0) {
        // CASO A: Empleado limpio (nunca ha sido dado de baja).
        // Su único ciclo laboral va desde su fecha de ingreso original ('fecha_alta_empresa') hasta hoy.
        // Ejemplo: $ciclos[] = ['inicio'=>'2020-05-27', 'fin'=>'2026-05-27']
        $ciclos[] = [
            'inicio' => $fecha_alta,
            'fin' => $hoy_str
        ];
    } else {
        // CASO B: Empleado con historial de movimientos (bajas y reingresos).
        // Cada registro en 'historial_reingresos' representa un ciclo laboral completo o el ciclo activo actual.
        while ($h = mysqli_fetch_assoc($res_h)) {
            $fin = $h['fecha_salida'];
            // Si la fecha de salida está vacía, significa que es el ciclo actual y sigue trabajando (activo).
            if (empty($fin) || $fin == '0000-00-00') {
                $fin = $hoy_str; 
            }
            // Ejemplo ciclo 1: ['inicio'=>'2020-05-27', 'fin'=>'2023-06-15']
            // Ejemplo ciclo 2: ['inicio'=>'2023-10-01', 'fin'=>'2026-05-27'] (actual)
            $ciclos[] = [
                'inicio' => $h['fecha_reingreso'],
                'fin' => $fin
            ];
        }
    }
    
    $empleados_procesados++;
    
    //==============================================================================================
    // PASO 4: CALCULAR LOS DERECHOS DE VACACIONES EN CADA CICLO
    // Cada ciclo laboral es totalmente independiente y resetea la antigüedad desde el Año 1.
    //
    // EJEMPLO: Un empleado con 2 ciclos tendrá:
    // Ciclo 1 (num_ciclo=1): Año 1, Año 2, Año 3 (hasta fecha salida)
    // Ciclo 2 (num_ciclo=2): Año 1 (reinicia) - NUEVO CONTADOR
    //==============================================================================================
    $num_ciclo = 0; // Contador de ciclos laborales
    foreach ($ciclos as $ciclo) {
        $num_ciclo++; // Cada ciclo laboral es independiente (1, 2, 3...)
        $fecha_inicio_ciclo = new DateTime($ciclo['inicio']);
        $fecha_fin_ciclo = new DateTime($ciclo['fin']);
        
        $anioBase = (int)$fecha_inicio_ciclo->format('Y');
        $mesBase = (int)$fecha_inicio_ciclo->format('m');
        $diaBase = (int)$fecha_inicio_ciclo->format('d');
        
        // Simulamos los aniversarios anuales (Año 1, Año 2, Año 3...)
        for ($anios = 1; $anios <= 100; $anios++) {
            
            // Calculamos la fecha exacta en la que se cumple el aniversario laboral
            // Ejemplo: Si empleado ingresa 2023-10-01
            // Año 1: 2024-10-01, Año 2: 2025-10-01, Año 3: 2026-10-01
            $timestamp = mktime(12, 0, 0, $mesBase, $diaBase, $anioBase + $anios);
            $fechaAniversario = new DateTime(date('Y-m-d', $timestamp));
            
            // Si la fecha del aniversario supera la fecha en que terminó este ciclo laboral,
            // significa que el empleado ya no cumplió más años de antigüedad en este ciclo. Terminamos el bucle.
            // Ejemplo: Si ciclo termina 2023-06-15 y aniversario sería 2024-10-01, no se cuenta
            if ($fechaAniversario > $fecha_fin_ciclo) {
                break;
            }
            
            $fecha_aniv_str = $fechaAniversario->format('Y-m-d');
            
            //--------------------------------------------------------------------------------------
            // PASO 4.1: IDENTIFICAR LA LEY VIGENTE EN EL ANIVERSARIO
            // Buscamos cuál ley (versiones_vacaciones_lft) estaba activa en la fecha del aniversario.
            //
            // EJEMPLO: 
            // Aniversario: 2023-05-15
            // Ley Anterior: válida hasta 2023-04-30 (NO aplica)
            // Ley 2023 Digna: válida desde 2023-05-01 (SÍ aplica) ✓
            //--------------------------------------------------------------------------------------
            $leySeleccionada = null;
            foreach ($leyes as $ley) {
                $inicio_vigencia = new DateTime($ley['fecha_inicio_vigencia']);
                $fin_vigencia = !empty($ley['fecha_fin_vigencia']) ? new DateTime($ley['fecha_fin_vigencia']) : new DateTime('9999-12-31');
                
                // Si la fecha del aniversario cae en el rango de vigencia de esta ley...
                if ($fechaAniversario >= $inicio_vigencia && $fechaAniversario <= $fin_vigencia) {
                    $leySeleccionada = $ley;
                    break; // Ya encontramos la ley correcta, salimos del bucle interno
                }
            }
            
            if ($leySeleccionada) {
                $id_version = $leySeleccionada['id_version_vacaciones'];
                
                //--------------------------------------------------------------------------------------
                // PASO 4.2: IDENTIFICAR LOS DÍAS CORRESPONDIENTES
                // Según la ley seleccionada y los años cumplidos, buscamos la fila del tabulador.
                //
                // EJEMPLO DE TABULADOR:
                // Año 1-3: 12 días | Año 4-5: 14 días | Año 6-9: 16 días | Año 10+: 20 días
                // Si empleado cumple 1 año → 12 días
                // Si empleado cumple 4 años → 14 días
                // Si empleado cumple 10 años → 20 días
                //--------------------------------------------------------------------------------------
                $rangoValido = null;
                foreach ($leySeleccionada['tabla_dias'] as $rango) {
                    $inicioRango = (int)$rango['anios_antiguedad_inicio'];
                    
                    // Si los años del empleado son mayores o iguales al inicio de este rango...
                    if ($anios >= $inicioRango) {
                        // Buscamos el rango más alto que se adapte (ej: si tiene 3 años, entra en el de '1' y no en el de '5')
                        // Ejemplo: Si $anios=3, valida rangos: 1 (sí), 4 (no), 5 (no) → usa rango 1 (12 días)
                        // Ejemplo: Si $anios=5, valida rangos: 1 (sí), 4 (sí), 5 (no) → usa rango 4 (14 días)
                        if (!$rangoValido || $inicioRango > (int)$rangoValido['anios_antiguedad_inicio']) {
                            $rangoValido = $rango;
                        }
                    }
                }
                
                if ($rangoValido) {
                    // Ejemplo: Empleado 1 año con Ley 2023 = 12 días derecho
                    $diasDerecho = (float)$rangoValido['dias_vacaciones_correspondientes'];
                    
                    //==================================================================================
                    // PASO 5: GUARDADO Y EVITACIÓN DE DUPLICADOS (PERSISTENCIA)
                    //
                    // PROTECCIÓN: Si ejecutas sincronizar_vacaciones.php dos veces, no crea duplicados
                    // Primera ejecución: Crea período 2024-10-01 para Juan (12 días)
                    // Segunda ejecución: Detecta que ya existe → NO LO VUELVE A CREAR
                    //==================================================================================
                    
                    // Comprobamos si ya tenemos guardado este aniversario para evitar duplicarlo si el script corre varias veces
                    $sql_check = "SELECT id_periodo FROM vacaciones_periodos 
                                  WHERE id_empleado = '$id_empleado' AND fecha_aniversario = '$fecha_aniv_str'";
                    $res_check = mysqli_query($conexion, $sql_check);
                    
                    if (mysqli_num_rows($res_check) == 0) {
                        // SI NO EXISTE: Procedemos a crear el registro en la tabla 'vacaciones_periodos'
                        // Ejemplo INSERT para Juan ciclo 2:
                        // INSERT INTO vacaciones_periodos VALUES (null, 1, 1, '2024-10-01', 1, 2, 12, 0, 12, 'ACTIVO')
                        // Resultado: id_periodo=1001, dias_derecho=12, saldo=12 (nuevo saldo sin usar)
                        $sql_ins_p = "INSERT INTO vacaciones_periodos (id_empleado, num_ciclo, fecha_aniversario, anios_antiguedad, id_version_vacaciones, dias_derecho, dias_tomados, saldo, estatus)
                                      VALUES ('$id_empleado', '$num_ciclo', '$fecha_aniv_str', '$anios', '$id_version', '$diasDerecho', 0, '$diasDerecho', 'ACTIVO')";
                        
                        if (mysqli_query($conexion, $sql_ins_p)) {
                            $id_periodo_nuevo = mysqli_insert_id($conexion);
                            $periodos_insertados++;
                            
                            //------------------------------------------------------------------------------
                            // CÁLCULO DE SALDO ACUMULADO REAL (RUNNING BALANCE)
                            // Obtenemos la suma de todos los movimientos de Kardex existentes para el empleado
                            // hasta este momento. Al sumar $diasDerecho, el nuevo saldo resultante será acumulativo exacto.
                            //
                            // EJEMPLO DE SALDO ACUMULADO:
                            // Kardex histórico: +12 (año 1), -3 (usados ago), +12 (año 2) = 21 días
                            // Nuevo período: +12 (año 3)
                            // Saldo resultante = 21 + 12 = 33 días (acumulado exacto)
                            //------------------------------------------------------------------------------
                            $sql_sum = "SELECT COALESCE(SUM(dias_movimiento), 0) AS total_saldo 
                                        FROM kardex_vacaciones 
                                        WHERE id_empleado = '$id_empleado' AND num_ciclo = '$num_ciclo'";
                            $res_sum = mysqli_query($conexion, $sql_sum);
                            $row_sum = mysqli_fetch_assoc($res_sum);
                            $saldo_previo = (float)$row_sum['total_saldo'];
                            $nuevo_saldo_resultante = $saldo_previo + $diasDerecho;

                            // Insertamos el movimiento en el Kardex con el saldo acumulado real calculado
                            $concepto = "Aniversario laboral al finalizar la jornada";
                            $observaciones = "Cálculo automático del sistema";
                            // Ejemplo INSERT para Juan ciclo 2:
                            // INSERT kardex: período=1001, empleado=1, ciclo=2, movimiento=+12, saldo_resultante=33
                            $sql_ins_k = "INSERT INTO kardex_vacaciones (id_periodo, id_empleado, num_ciclo, concepto, fecha_registro, fecha_inicio, fecha_fin, dias_movimiento, saldo_resultante, observaciones)
                                          VALUES ('$id_periodo_nuevo', '$id_empleado', '$num_ciclo', '$concepto', '$fecha_aniv_str', NULL, NULL, '$diasDerecho', '$nuevo_saldo_resultante', '$observaciones')";
                            
                            if (mysqli_query($conexion, $sql_ins_k)) {
                                $kardex_insertados++;
                            }
                        }
                    }
                }
            }
        }
    }
}

// Retornamos el resultado del proceso en formato JSON para que se pueda ver en consola
echo json_encode([
    'success' => true,
    'message' => 'Sincronización de vacaciones completada exitosamente',
    'empleados_procesados' => $empleados_procesados,
    'periodos_insertados' => $periodos_insertados,
    'kardex_insertados' => $kardex_insertados
]);
?>
