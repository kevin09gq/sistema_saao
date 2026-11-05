<?php

require_once __DIR__ . "/../../../conexion/conexion.php";
/** @var mysqli $conexion */

$accion = $_POST['accion'] ?? $_GET['accion'] ?? '';

switch ($accion) {

    case 'obtenerGastosPorDepartamento':
        obtenerGastosPorDepartamento($conexion);
        break;

    case 'obtenerGastosSemanal':
        obtenerGastosSemanal($conexion);
        break;

    default:
        echo json_encode([
            "success" => false,
            "mensaje" => "Acción no válida."
        ]);
        break;
}


//===========================================================
// FUNCIÓN PARA OBTENER GASTOS POR DEPARTAMENTO
//===========================================================

function obtenerGastosPorDepartamento(mysqli $conexion)
{
    // obtener el año desde el post
    $anio = $_POST['anio'] ?? '';

    // validar que se haya recibido el año
    if (empty($anio)) {
        echo json_encode([
            "success" => false,
            "mensaje" => "No se recibió el año."
        ]);
        return;
    }

    //====================================================
    // OBTENER TODOS LOS REGISTROS DEL AÑO Y PROCESAR JSON
    //====================================================

    // consulta para obtener todos los registros JSON del año
    $sql = "
        SELECT nomina_relicario
        FROM nomina_relicario
        WHERE anio = ?
    ";

    // preparar y ejecutar la consulta
    $stmt = mysqli_prepare($conexion, $sql);
    mysqli_stmt_bind_param($stmt, "i", $anio);
    mysqli_stmt_execute($stmt);
    $resultado = mysqli_stmt_get_result($stmt);

    // recorrer los resultados y procesar cada JSON
    $departamentos = [];
    while ($fila = mysqli_fetch_assoc($resultado)) {
        $json_data = $fila['nomina_relicario'];
        $data = json_decode($json_data, true);

        // validar que el JSON sea válido y tenga departamentos
        if ($data && isset($data['departamentos']) && is_array($data['departamentos'])) {
            foreach ($data['departamentos'] as $depto) {
                $id_departamento = $depto['id_departamento'];
                $id_empresa = $depto['id_empresa'] ?? 1;
                $nombre_departamento = $depto['nombre'];

                // clave única combinando departamento y empresa
                $clave_unica = $id_departamento . '_' . $id_empresa;

                // si el departamento no existe, crearlo
                if (!isset($departamentos[$clave_unica])) {
                    $departamentos[$clave_unica] = [
                        'id_departamento' => $id_departamento,
                        'id_empresa' => $id_empresa,
                        'nombre_departamento' => $nombre_departamento,
                        'total' => 0
                    ];
                }

                // recorrer los empleados del departamento
                if (isset($depto['empleados']) && is_array($depto['empleados'])) {
                    foreach ($depto['empleados'] as $empleado) {
                        // solo tomar en cuenta empleados con mostrar = true
                        $mostrar = $empleado['mostrar'] ?? false;
                        if (!$mostrar) {
                            continue;
                        }

                        $total_cobrar = (float)($empleado['total_cobrar'] ?? 0);
                        $departamentos[$clave_unica]['total'] += $total_cobrar;
                    }
                }
            }
        }
    }

    //====================================================
    // AGREGAR CORTE Y PODA ANUALES COMO DEPARTAMENTOS
    //====================================================

    // Total corte anual
    $sql_corte = "
        SELECT 
            COALESCE((
                SELECT SUM(crt.rejas * cr.precio_reja)
                FROM cortes_relicario cr
                INNER JOIN cortes_relicario_tablas crt ON crt.id_corte = cr.id
                WHERE cr.estado = 1 AND cr.id_nomina IN (SELECT id_nomina_relicario FROM nomina_relicario WHERE anio = ?)
            ), 0) +
            COALESCE((
                SELECT SUM(nc.total)
                FROM nomina_relicario_corte nc
                WHERE nc.id_nomina IN (SELECT id_nomina_relicario FROM nomina_relicario WHERE anio = ?)
            ), 0) AS total_corte
    ";
    $stmt_c = mysqli_prepare($conexion, $sql_corte);
    mysqli_stmt_bind_param($stmt_c, "ii", $anio, $anio);
    mysqli_stmt_execute($stmt_c);
    $res_c = mysqli_stmt_get_result($stmt_c);
    $fila_c = mysqli_fetch_assoc($res_c);
    mysqli_stmt_close($stmt_c);
    $total_corte = (float)($fila_c['total_corte'] ?? 0);

    // Total poda anual
    $sql_poda = "
        SELECT 
            COALESCE((
                SELECT SUM(pm.arboles_podados * pm.monto)
                FROM podas_relicario pr
                INNER JOIN podas_movimientos_relicario pm ON pm.id_poda = pr.id_poda
                WHERE (pm.es_extra = 0 OR pm.es_extra IS NULL) AND pr.id_nomina IN (SELECT id_nomina_relicario FROM nomina_relicario WHERE anio = ?)
            ), 0) +
            COALESCE((
                SELECT SUM(pm.monto)
                FROM podas_relicario pr
                INNER JOIN podas_movimientos_relicario pm ON pm.id_poda = pr.id_poda
                WHERE pm.es_extra = 1 AND pr.id_nomina IN (SELECT id_nomina_relicario FROM nomina_relicario WHERE anio = ?)
            ), 0) AS total_poda
    ";
    $stmt_p = mysqli_prepare($conexion, $sql_poda);
    mysqli_stmt_bind_param($stmt_p, "ii", $anio, $anio);
    mysqli_stmt_execute($stmt_p);
    $res_p = mysqli_stmt_get_result($stmt_p);
    $fila_p = mysqli_fetch_assoc($res_p);
    mysqli_stmt_close($stmt_p);
    $total_poda = (float)($fila_p['total_poda'] ?? 0);

    if ($total_corte > 0) {
        $departamentos['1000_1'] = [
            'id_departamento' => 1000,
            'id_empresa' => 1,
            'nombre_departamento' => 'Corte',
            'total' => $total_corte
        ];
    }

    if ($total_poda > 0) {
        $departamentos['2000_1'] = [
            'id_departamento' => 2000,
            'id_empresa' => 1,
            'nombre_departamento' => 'Poda',
            'total' => $total_poda
        ];
    }

    // validar que existan datos
    if (empty($departamentos)) {
        echo json_encode([
            "success" => false,
            "mensaje" => "No hay datos para el año seleccionado."
        ]);
        return;
    }

    //====================================================
    // IDENTIFICAR EL DEPARTAMENTO MÁS CARO
    //====================================================

    $departamento_mas_caro = null;
    $monto_max = 0;

    foreach ($departamentos as $depto) {
        if ($depto['total'] > $monto_max) {
            $monto_max = $depto['total'];
            $departamento_mas_caro = $depto['nombre_departamento'];
        }
    }

    //====================================================
    // CONVERTIR A ARRAY INDEXADO
    //====================================================

    $departamentos_array = array_values($departamentos);

    //====================================================
    // RESPUESTA CON LOS DATOS
    //====================================================

    echo json_encode([
        "success" => true,
        "departamentos" => $departamentos_array,
        "departamento_mas_caro" => $departamento_mas_caro,
        "monto_max" => $monto_max
    ]);
}


//===========================================================
// FUNCIÓN PARA OBTENER EVOLUCIÓN DE GASTOS POR SEMANA
//===========================================================

function obtenerGastosSemanal(mysqli $conexion)
{
    // obtener el año desde el post
    $anio = $_POST['anio'] ?? '';

    // validar que se haya recibido el año
    if (empty($anio)) {
        echo json_encode([
            "success" => false,
            "mensaje" => "No se recibió el año."
        ]);
        return;
    }

    //====================================================
    // OBTENER TODOS LOS REGISTROS DEL AÑO Y PROCESAR JSON
    //====================================================

    // consulta para obtener todos los registros JSON del año
    $sql = "
        SELECT numero_semana, nomina_relicario
        FROM nomina_relicario
        WHERE anio = ?
        ORDER BY numero_semana ASC
    ";

    // preparar y ejecutar la consulta
    $stmt = mysqli_prepare($conexion, $sql);
    mysqli_stmt_bind_param($stmt, "i", $anio);
    mysqli_stmt_execute($stmt);
    $resultado = mysqli_stmt_get_result($stmt);

    // recorrer los resultados y procesar cada JSON
    $semanas = [];
    $departamentos_unicos = [];

    while ($fila = mysqli_fetch_assoc($resultado)) {
        $numero_semana = (int)$fila['numero_semana'];
        $json_data = $fila['nomina_relicario'];
        $data = json_decode($json_data, true);

        // inicializar datos de la semana sin sobrescribir otra empresa
        if (!isset($semanas[$numero_semana])) {
            $semanas[$numero_semana] = [
                'numero_semana' => $numero_semana,
                'departamentos' => []
            ];
        }

        // validar que el JSON sea válido y tenga departamentos
        if ($data && isset($data['departamentos']) && is_array($data['departamentos'])) {
            foreach ($data['departamentos'] as $depto) {
                $id_departamento = $depto['id_departamento'];
                $id_empresa = $depto['id_empresa'] ?? 1;
                $nombre_departamento = $depto['nombre'];
                $clave_unica = $id_departamento . '_' . $id_empresa;

                // guardar departamentos únicos
                if (!isset($departamentos_unicos[$clave_unica])) {
                    $departamentos_unicos[$clave_unica] = [
                        'id_departamento' => $id_departamento,
                        'id_empresa' => $id_empresa,
                        'nombre_departamento' => $nombre_departamento
                    ];
                }

                // inicializar datos del departamento en esta semana
                if (!isset($semanas[$numero_semana]['departamentos'][$clave_unica])) {
                    $semanas[$numero_semana]['departamentos'][$clave_unica] = [
                        'id_departamento' => $id_departamento,
                        'id_empresa' => $id_empresa,
                        'nombre_departamento' => $nombre_departamento,
                        'total' => 0
                    ];
                }

                // recorrer los empleados del departamento
                if (isset($depto['empleados']) && is_array($depto['empleados'])) {
                    foreach ($depto['empleados'] as $empleado) {
                        // solo tomar en cuenta empleados con mostrar = true
                        $mostrar = $empleado['mostrar'] ?? false;
                        if (!$mostrar) {
                            continue;
                        }

                        $total_cobrar = (float)($empleado['total_cobrar'] ?? 0);
                        $semanas[$numero_semana]['departamentos'][$clave_unica]['total'] += $total_cobrar;
                    }
                }
            }
        }
    }

    //====================================================
    // OBTENER CORTE Y PODA POR SEMANA PARA ESTE AÑO
    //====================================================

    $sql_cp_semanal = "
        SELECT 
            nr.numero_semana,
            COALESCE(c.total_corte, 0) AS total_corte,
            COALESCE(p.total_poda, 0) AS total_poda
        FROM nomina_relicario nr
        LEFT JOIN (
            SELECT 
                sub.id_nomina,
                SUM(sub.monto_corte) AS total_corte
            FROM (
                SELECT cr.id_nomina, SUM(crt.rejas * cr.precio_reja) AS monto_corte
                FROM cortes_relicario cr
                INNER JOIN cortes_relicario_tablas crt ON crt.id_corte = cr.id
                WHERE cr.estado = 1
                GROUP BY cr.id_nomina
                UNION ALL
                SELECT nc.id_nomina, SUM(nc.total) AS monto_corte
                FROM nomina_relicario_corte nc
                GROUP BY nc.id_nomina
            ) sub
            GROUP BY sub.id_nomina
        ) c ON c.id_nomina = nr.id_nomina_relicario
        LEFT JOIN (
            SELECT 
                sub_p.id_nomina,
                SUM(sub_p.monto_poda) AS total_poda
            FROM (
                SELECT pr.id_nomina, SUM(pm.arboles_podados * pm.monto) AS monto_poda
                FROM podas_relicario pr
                INNER JOIN podas_movimientos_relicario pm ON pm.id_poda = pr.id_poda
                WHERE pm.es_extra = 0 OR pm.es_extra IS NULL
                GROUP BY pr.id_nomina
                UNION ALL
                SELECT pr.id_nomina, SUM(pm.monto) AS monto_poda
                FROM podas_relicario pr
                INNER JOIN podas_movimientos_relicario pm ON pm.id_poda = pr.id_poda
                WHERE pm.es_extra = 1
                GROUP BY pr.id_nomina
            ) sub_p
            GROUP BY sub_p.id_nomina
        ) p ON p.id_nomina = nr.id_nomina_relicario
        WHERE nr.anio = ?
    ";
    $stmt_cp = mysqli_prepare($conexion, $sql_cp_semanal);
    mysqli_stmt_bind_param($stmt_cp, "i", $anio);
    mysqli_stmt_execute($stmt_cp);
    $res_cp = mysqli_stmt_get_result($stmt_cp);
    $hay_corte = false;
    $hay_poda = false;
    $corte_poda_semana = [];
    while ($r_cp = mysqli_fetch_assoc($res_cp)) {
        $sem = (int)$r_cp['numero_semana'];
        $tc = (float)$r_cp['total_corte'];
        $tp = (float)$r_cp['total_poda'];
        if ($tc > 0) $hay_corte = true;
        if ($tp > 0) $hay_poda = true;
        $corte_poda_semana[$sem] = [
            'corte' => $tc,
            'poda' => $tp
        ];
    }
    mysqli_stmt_close($stmt_cp);

    if ($hay_corte) {
        $departamentos_unicos['1000_1'] = [
            'id_departamento' => 1000,
            'id_empresa' => 1,
            'nombre_departamento' => 'Corte'
        ];
    }
    if ($hay_poda) {
        $departamentos_unicos['2000_1'] = [
            'id_departamento' => 2000,
            'id_empresa' => 1,
            'nombre_departamento' => 'Poda'
        ];
    }

    foreach ($semanas as $semNum => &$semData) {
        if ($hay_corte) {
            $semData['departamentos']['1000_1'] = [
                'id_departamento' => 1000,
                'id_empresa' => 1,
                'nombre_departamento' => 'Corte',
                'total' => $corte_poda_semana[$semNum]['corte'] ?? 0
            ];
        }
        if ($hay_poda) {
            $semData['departamentos']['2000_1'] = [
                'id_departamento' => 2000,
                'id_empresa' => 1,
                'nombre_departamento' => 'Poda',
                'total' => $corte_poda_semana[$semNum]['poda'] ?? 0
            ];
        }
    }

    // validar que existan datos
    if (empty($semanas)) {
        echo json_encode([
            "success" => false,
            "mensaje" => "No hay datos para el año seleccionado."
        ]);
        return;
    }

    //====================================================
    // CONVERTIR A ARRAY INDEXADO Y ORDENAR
    //====================================================

    ksort($semanas);

    // convertir departamentos de cada semana a array
    foreach ($semanas as &$semana) {
        ksort($semana['departamentos']);
        $semana['departamentos'] = array_values($semana['departamentos']);
    }

    $semanas_array = array_values($semanas);

    // ordenar departamentos por empresa y departamento
    ksort($departamentos_unicos);
    $departamentos_array = [];
    foreach ($departamentos_unicos as $departamento) {
        $departamentos_array[] = $departamento;
    }

    //====================================================
    // RESPUESTA CON LOS DATOS
    //====================================================

    echo json_encode([
        "success" => true,
        "semanas" => $semanas_array,
        "departamentos" => $departamentos_array
    ]);
}
