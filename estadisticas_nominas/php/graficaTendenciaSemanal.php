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
    $sql_evolucion = "
        SELECT
            numero_semana,
            SUM(total) AS total_semana
        FROM (
            SELECT numero_semana, total_neto AS total FROM nomina_40lbs WHERE anio = ?
            UNION ALL
            SELECT numero_semana, total_neto AS total FROM nomina_40lbs_jornal WHERE anio = ?
            UNION ALL
            SELECT numero_semana, total_neto AS total FROM nomina_10lbs WHERE anio = ?
            UNION ALL
            SELECT numero_semana, total_neto AS total FROM nomina_confianza WHERE anio = ?
            UNION ALL
            SELECT
                nr.numero_semana,
                COALESCE(nr.total_neto, 0) +
                COALESCE((
                    SELECT SUM(cr.precio_reja * crt.rejas)
                    FROM cortes_relicario cr
                    INNER JOIN cortes_relicario_tablas crt ON crt.id_corte = cr.id
                    WHERE cr.id_nomina = nr.id_nomina_relicario
                ), 0) +
                COALESCE((
                    SELECT SUM(pm.arboles_podados * pm.monto)
                    FROM podas_relicario pr
                    INNER JOIN podas_movimientos_relicario pm ON pm.id_poda = pr.id_poda
                    WHERE pr.id_nomina = nr.id_nomina_relicario
                ), 0) AS total
            FROM nomina_relicario nr
            WHERE nr.anio = ?
            UNION ALL
            SELECT
                np.numero_semana,
                COALESCE(np.total_neto, 0) +
                COALESCE((
                    SELECT SUM(cp.precio_reja * cpt.rejas)
                    FROM cortes_pilar cp
                    INNER JOIN cortes_pilar_tablas cpt ON cpt.id_corte = cp.id
                    WHERE cp.id_nomina = np.id_nomina_pilar
                ), 0) +
                COALESCE((
                    SELECT SUM(ppm.arboles_podados * ppm.monto)
                    FROM podas_pilar pp
                    INNER JOIN podas_movimientos_pilar ppm ON ppm.id_poda = pp.id_poda
                    WHERE pp.id_nomina = np.id_nomina_pilar
                ), 0) AS total
            FROM nomina_pilar np
            WHERE np.anio = ?
            UNION ALL
            SELECT
                nh.numero_semana,
                COALESCE(nh.total_neto, 0) +
                COALESCE((
                    SELECT SUM(ch.precio_reja * cht.rejas)
                    FROM cortes_huasteca ch
                    INNER JOIN cortes_huasteca_tablas cht ON cht.id_corte = ch.id
                    WHERE ch.id_nomina = nh.id_nomina_huasteca
                ), 0) +
                COALESCE((
                    SELECT SUM(phm.arboles_podados * phm.monto)
                    FROM podas_huasteca ph
                    INNER JOIN podas_movimientos_huasteca phm ON phm.id_poda = ph.id_poda
                    WHERE ph.id_nomina = nh.id_nomina_huasteca
                ), 0) AS total
            FROM nomina_huasteca nh
            WHERE nh.anio = ?
            UNION ALL
            SELECT
                npa.numero_semana,
                COALESCE(npa.total_neto, 0) +
                COALESCE((
                    SELECT SUM(cpa.precio_reja * cpah.rejas)
                    FROM cortes_palmilla cpa
                    INNER JOIN cortes_palmilla_tablas cpah ON cpah.id_corte = cpa.id
                    WHERE cpa.id_nomina = npa.id_nomina_palmilla
                ), 0) +
                COALESCE((
                    SELECT SUM(ppmm.arboles_podados * ppmm.monto)
                    FROM podas_palmilla pp
                    INNER JOIN podas_movimientos_palmilla ppmm ON ppmm.id_poda = pp.id_poda
                    WHERE pp.id_nomina = npa.id_nomina_palmilla
                ), 0) AS total
            FROM nomina_palmilla npa
            WHERE npa.anio = ?
        ) AS todas_semanas
        GROUP BY numero_semana
        ORDER BY numero_semana ASC
    ";

    // preparar y ejecutar la consulta
    $stmt = mysqli_prepare($conexion, $sql_evolucion);
    mysqli_stmt_bind_param($stmt, "iiiiiiii", $anio, $anio, $anio, $anio, $anio, $anio, $anio, $anio);
    mysqli_stmt_execute($stmt);
    $resultado = mysqli_stmt_get_result($stmt);

    // recorrer los resultados y guardar en un array
    $evolucion = [];
    while ($fila = mysqli_fetch_assoc($resultado)) {
        $evolucion[] = $fila;
    }

    mysqli_stmt_close($stmt);

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
