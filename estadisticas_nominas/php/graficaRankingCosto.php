<?php

require_once __DIR__ . "/../../conexion/conexion.php";
/** @var mysqli $conexion */

$accion = $_POST['accion'] ?? $_GET['accion'] ?? '';

switch ($accion) {

    case 'obtenerRankingUltimaSemana':
        obtenerRankingUltimaSemana($conexion);
        break;

    default:
        echo json_encode([
            "success" => false,
            "mensaje" => "Acción no válida."
        ]);
        break;
}


//===========================================================
// FUNCIÓN PARA OBTENER EL RANKING DE COSTO DE LA ÚLTIMA SEMANA
//===========================================================

function obtenerRankingUltimaSemana(mysqli $conexion)
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
    // OBTENER LA ÚLTIMA SEMANA
    //====================================================

    // consulta para obtener el número de semana más alto
    // fórmula: max(numero_semana) de todas las nóminas del año
    $sql_ultima_semana = "
        SELECT
            MAX(numero_semana) AS ultima_semana
        FROM (
            SELECT numero_semana FROM nomina_40lbs WHERE anio = ?
            UNION
            SELECT numero_semana FROM nomina_40lbs_jornal WHERE anio = ?
            UNION
            SELECT numero_semana FROM nomina_10lbs WHERE anio = ?
            UNION
            SELECT numero_semana FROM nomina_confianza WHERE anio = ?
            UNION
            SELECT numero_semana FROM nomina_relicario WHERE anio = ?
            UNION
            SELECT numero_semana FROM nomina_pilar WHERE anio = ?
            UNION
            SELECT numero_semana FROM nomina_huasteca WHERE anio = ?
            UNION
            SELECT numero_semana FROM nomina_palmilla WHERE anio = ?
        ) AS todas_semanas
    ";

    // preparar y ejecutar la consulta
    $stmt = mysqli_prepare($conexion, $sql_ultima_semana);
    mysqli_stmt_bind_param($stmt, "iiiiiiii", $anio, $anio, $anio, $anio, $anio, $anio, $anio, $anio);
    mysqli_stmt_execute($stmt);
    $resultado = mysqli_stmt_get_result($stmt);
    $fila_ultima = mysqli_fetch_assoc($resultado);
    mysqli_stmt_close($stmt);

    // guardar el número de la última semana
    $ultima_semana = $fila_ultima['ultima_semana'] ?? 0;

    // validar que existan datos
    if ($ultima_semana == 0) {
        echo json_encode([
            "success" => false,
            "mensaje" => "No hay datos para el año seleccionado."
        ]);
        return;
    }

    //====================================================
    // OBTENER EL TOTAL DE CADA NÓMINA DE LA ÚLTIMA SEMANA
    //====================================================

    // consulta para obtener el total de cada nómina
    // fórmula base: sum(total_neto) de cada nómina donde anio = x AND numero_semana = ultima_semana
    // para relicario, pilar, huasteca, palmilla se suma también total de cortes y podas
    // esta gráfica sirve para visualizar qué nómina tiene mayor costo en la última semana
    // permitiendo identificar rápidamente las nóminas con mayor gasto individual
    $sql_ranking = "
        SELECT
            '40 Lbs' AS nomina,
            COALESCE((SELECT total_neto FROM nomina_40lbs WHERE anio = ? AND numero_semana = ?), 0) AS monto

        UNION ALL

        SELECT
            '40 Lbs Jornal' AS nomina,
            COALESCE((SELECT total_neto FROM nomina_40lbs_jornal WHERE anio = ? AND numero_semana = ?), 0) AS monto

        UNION ALL

        SELECT
            '10 Lbs' AS nomina,
            COALESCE((SELECT total_neto FROM nomina_10lbs WHERE anio = ? AND numero_semana = ?), 0) AS monto

        UNION ALL

        SELECT
            'Confianza' AS nomina,
            COALESCE((SELECT total_neto FROM nomina_confianza WHERE anio = ? AND numero_semana = ?), 0) AS monto

        UNION ALL

        SELECT
            'Relicario' AS nomina,
            COALESCE((
                SELECT
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
                    ), 0)
                FROM nomina_relicario nr
                WHERE nr.anio = ? AND nr.numero_semana = ?
            ), 0) AS monto

        UNION ALL

        SELECT
            'Pilar' AS nomina,
            COALESCE((
                SELECT
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
                    ), 0)
                FROM nomina_pilar np
                WHERE np.anio = ? AND np.numero_semana = ?
            ), 0) AS monto

        UNION ALL

        SELECT
            'Huasteca' AS nomina,
            COALESCE((
                SELECT
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
                    ), 0)
                FROM nomina_huasteca nh
                WHERE nh.anio = ? AND nh.numero_semana = ?
            ), 0) AS monto

        UNION ALL

        SELECT
            'Palmilla' AS nomina,
            COALESCE((
                SELECT
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
                    ), 0)
                FROM nomina_palmilla npa
                WHERE npa.anio = ? AND npa.numero_semana = ?
            ), 0) AS monto
    ";

    // preparar y ejecutar la consulta
    $stmt = mysqli_prepare($conexion, $sql_ranking);
    mysqli_stmt_bind_param($stmt, "iiiiiiiiiiiiiiii", $anio, $ultima_semana, $anio, $ultima_semana, $anio, $ultima_semana, $anio, $ultima_semana, $anio, $ultima_semana, $anio, $ultima_semana, $anio, $ultima_semana, $anio, $ultima_semana);
    mysqli_stmt_execute($stmt);
    $resultado = mysqli_stmt_get_result($stmt);

    // recorrer los resultados y guardar en un array
    $ranking = [];
    while ($fila = mysqli_fetch_assoc($resultado)) {
        $ranking[] = $fila;
    }

    mysqli_stmt_close($stmt);

    //====================================================
    // ORDENAR EL RANKING DE MAYOR A MENOR
    //====================================================

    // fórmula: ordenar por monto descendente
    usort($ranking, function ($a, $b) {
        return $b['monto'] - $a['monto'];
    });

    //====================================================
    // RESPUESTA CON EL RANKING
    //====================================================

    // devolver el ranking en formato json
    echo json_encode([
        "success" => true,
        "ranking" => $ranking,
        "ultima_semana" => $ultima_semana
    ]);
}
