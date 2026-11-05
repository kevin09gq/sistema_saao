<?php

require_once __DIR__ . "/../../conexion/conexion.php";
/** @var mysqli $conexion */

$accion = $_POST['accion'] ?? $_GET['accion'] ?? '';

switch ($accion) {

    case 'obtenerEvolucionSemanal':
        obtenerEvolucionSemanal($conexion);
        break;

    default:
        echo json_encode([
            "success" => false,
            "mensaje" => "Acción no válida."
        ]);
        break;
}


//===========================================================
// FUNCIÓN PARA OBTENER LA EVOLUCIÓN SEMANAL CONSOLIDADA
//===========================================================

function obtenerEvolucionSemanal(mysqli $conexion)
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
    // OBTENER EL TOTAL CONSOLIDADO DE CADA SEMANA
    //====================================================

    // consulta para obtener el total consolidado de cada semana
    // fórmula: agrupar por numero_semana, sumar(total_neto) de las 8 nóminas
    // para relicario, pilar, huasteca, palmilla se suma también total de cortes y podas

    $todas_semanas = [];

    // obtener datos de nóminas simples
    $nominas_simples = ['nomina_40lbs', 'nomina_40lbs_jornal', 'nomina_10lbs', 'nomina_confianza'];
    foreach ($nominas_simples as $tabla) {
        $sql = "SELECT numero_semana, total_neto AS total FROM $tabla WHERE anio = ?";
        $stmt = mysqli_prepare($conexion, $sql);
        mysqli_stmt_bind_param($stmt, "i", $anio);
        mysqli_stmt_execute($stmt);
        $res = mysqli_stmt_get_result($stmt);
        while ($fila = mysqli_fetch_assoc($res)) {
            $todas_semanas[] = $fila;
        }
        mysqli_stmt_close($stmt);
    }

    // obtener datos de nóminas agrícolas
    $ranchos = ['relicario', 'pilar', 'huasteca', 'palmilla'];
    foreach ($ranchos as $rancho) {
        $sql_agricola = "
            SELECT
                nr.numero_semana,
                COALESCE(nr.total_neto, 0) +
                COALESCE((
                    SELECT SUM(cr.precio_reja * crt.rejas)
                    FROM cortes_{$rancho} cr
                    INNER JOIN cortes_{$rancho}_tablas crt ON crt.id_corte = cr.id
                    WHERE cr.id_nomina = nr.id_nomina_{$rancho}
                ), 0) +
                COALESCE((
                    SELECT SUM(nc.total)
                    FROM nomina_{$rancho}_corte nc
                    WHERE nc.id_nomina = nr.id_nomina_{$rancho}
                ), 0) +
                COALESCE((
                    SELECT SUM(pm.arboles_podados * pm.monto)
                    FROM podas_{$rancho} pr
                    INNER JOIN podas_movimientos_{$rancho} pm ON pm.id_poda = pr.id_poda
                    WHERE pr.id_nomina = nr.id_nomina_{$rancho}
                    AND (pm.es_extra = 0 OR pm.es_extra IS NULL)
                ), 0) +
                COALESCE((
                    SELECT SUM(pm.monto)
                    FROM podas_{$rancho} pr
                    INNER JOIN podas_movimientos_{$rancho} pm ON pm.id_poda = pr.id_poda
                    WHERE pr.id_nomina = nr.id_nomina_{$rancho}
                    AND pm.es_extra = 1
                ), 0) AS total
            FROM nomina_{$rancho} nr
            WHERE nr.anio = ?
        ";

        $stmt = mysqli_prepare($conexion, $sql_agricola);
        mysqli_stmt_bind_param($stmt, "i", $anio);
        mysqli_stmt_execute($stmt);
        $res = mysqli_stmt_get_result($stmt);
        while ($fila = mysqli_fetch_assoc($res)) {
            $todas_semanas[] = $fila;
        }
        mysqli_stmt_close($stmt);
    }

    // agrupar por semana y sumar totales
    $evolucion_agrupada = [];
    foreach ($todas_semanas as $fila) {
        $semana = $fila['numero_semana'];
        if (!isset($evolucion_agrupada[$semana])) {
            $evolucion_agrupada[$semana] = 0;
        }
        $evolucion_agrupada[$semana] += $fila['total'];
    }

    // convertir a array ordenado
    $evolucion = [];
    ksort($evolucion_agrupada);
    foreach ($evolucion_agrupada as $semana => $total) {
        $evolucion[] = [
            'numero_semana' => $semana,
            'total_semana' => $total
        ];
    }

    //====================================================
    // CALCULAR EL PROMEDIO SEMANAL
    //====================================================

    // fórmula: avg(total_semana) de todas las semanas
    $promedio = 0;
    if (count($evolucion) > 0) {
        $total_anual = 0;
        foreach ($evolucion as $semana) {
            $total_anual += $semana['total_semana'];
        }
        $promedio = $total_anual / count($evolucion);
    }

    //====================================================
    // IDENTIFICAR SEMANA MÁS CARA Y MÁS BAJA
    //====================================================

    $semana_mas_cara = null;
    $monto_max = 0;
    $semana_mas_baja = null;
    $monto_min = PHP_FLOAT_MAX;

    foreach ($evolucion as $semana) {
        if ($semana['total_semana'] > $monto_max) {
            $monto_max = $semana['total_semana'];
            $semana_mas_cara = $semana['numero_semana'];
        }
        if ($semana['total_semana'] < $monto_min) {
            $monto_min = $semana['total_semana'];
            $semana_mas_baja = $semana['numero_semana'];
        }
    }

    //====================================================
    // RESPUESTA CON LA EVOLUCIÓN SEMANAL
    //====================================================

    // devolver la evolución en formato json
    echo json_encode([
        "success" => true,
        "evolucion" => $evolucion,
        "promedio" => $promedio,
        "semana_mas_cara" => $semana_mas_cara,
        "monto_max" => $monto_max,
        "semana_mas_baja" => $semana_mas_baja,
        "monto_min" => $monto_min
    ]);
}
