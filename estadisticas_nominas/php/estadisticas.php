<?php

require_once __DIR__ . "/../../conexion/conexion.php";
/** @var mysqli $conexion */

$accion = $_POST['accion'] ?? $_GET['accion'] ?? '';

switch ($accion) {

    case 'obtenerAnios':
        obtenerAnios($conexion);
        break;

    case 'obtenerKpis':
        obtenerKpis($conexion);
        break;

    case 'obtenerDesgloseUltimaSemana':
        obtenerDesgloseUltimaSemana($conexion);
        break;

    default:
        echo json_encode([
            "success" => false,
            "mensaje" => "Acción no válida."
        ]);
        break;
}


//===========================================================
// FUNCIÓN PARA OBTENER LOS AÑOS DISPONIBLES DE LAS NÓMINAS
//===========================================================

function obtenerAnios(mysqli $conexion)
{
    // consulta para obtener los años distintos de las 8 nóminas usando union
    $sql = "SELECT DISTINCT anio
            FROM (
                SELECT anio FROM nomina_40lbs
                UNION
                SELECT anio FROM nomina_40lbs_jornal
                UNION
                SELECT anio FROM nomina_10lbs
                UNION
                SELECT anio FROM nomina_confianza
                UNION
                SELECT anio FROM nomina_relicario
                UNION
                SELECT anio FROM nomina_pilar
                UNION
                SELECT anio FROM nomina_huasteca
                UNION
                SELECT anio FROM nomina_palmilla
            ) AS todos_anios
            ORDER BY anio DESC";

    // ejecutar la consulta
    $resultado = mysqli_query($conexion, $sql);

    // validar si hubo error en la consulta
    if (!$resultado) {
        echo json_encode([
            "success" => false,
            "mensaje" => "Error al obtener los años."
        ]);
        return;
    }

    // recorrer los resultados y guardar los años en un array
    $anios = [];
    while ($fila = mysqli_fetch_assoc($resultado)) {
        $anios[] = $fila['anio'];
    }

    // liberar el resultado
    mysqli_free_result($resultado);

    // devolver los años en formato json
    echo json_encode([
        "success" => true,
        "anios" => $anios
    ]);
}


//===========================================================
// FUNCIÓN PARA OBTENER LOS DATOS DE LAS 4 KPIs
//===========================================================

function obtenerKpis(mysqli $conexion)
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
    // 1. OBTENER LA ÚLTIMA SEMANA (SUMANDO LAS 8 NÓMINAS)
    //====================================================

    // consulta para obtener el número de semana más alto de todas las nóminas
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

    // obtener el total de la última semana sumando las 8 nóminas
    // fórmula: sum(total_neto) de las 8 nóminas donde anio = x AND numero_semana = ultima_semana
    // para relicario, pilar, huasteca, palmilla se suma también total de cortes y podas
    $sql_total_ultima = "
        SELECT
            COALESCE(SUM(total), 0) AS total_ultima_semana
        FROM (
            SELECT total_neto AS total FROM nomina_40lbs WHERE anio = ? AND numero_semana = ?
            UNION ALL
            SELECT total_neto AS total FROM nomina_40lbs_jornal WHERE anio = ? AND numero_semana = ?
            UNION ALL
            SELECT total_neto AS total FROM nomina_10lbs WHERE anio = ? AND numero_semana = ?
            UNION ALL
            SELECT total_neto AS total FROM nomina_confianza WHERE anio = ? AND numero_semana = ?
            UNION ALL
            SELECT
                COALESCE(nr.total_neto, 0) +
                COALESCE((
                    SELECT SUM(cr.precio_reja * crt.rejas)
                    FROM cortes_relicario cr
                    INNER JOIN cortes_relicario_tablas crt ON crt.id_corte = cr.id
                    WHERE cr.id_nomina = nr.id_nomina_relicario
                ), 0) +
                COALESCE((
                    SELECT SUM(pm.monto)
                    FROM podas_relicario pr
                    INNER JOIN podas_movimientos_relicario pm ON pm.id_poda = pr.id_poda
                    WHERE pr.id_nomina = nr.id_nomina_relicario
                ), 0) AS total
            FROM nomina_relicario nr
            WHERE nr.anio = ? AND nr.numero_semana = ?
            UNION ALL
            SELECT
                COALESCE(np.total_neto, 0) +
                COALESCE((
                    SELECT SUM(cp.precio_reja * cpt.rejas)
                    FROM cortes_pilar cp
                    INNER JOIN cortes_pilar_tablas cpt ON cpt.id_corte = cp.id
                    WHERE cp.id_nomina = np.id_nomina_pilar
                ), 0) +
                COALESCE((
                    SELECT SUM(ppm.monto)
                    FROM podas_pilar pp
                    INNER JOIN podas_movimientos_pilar ppm ON ppm.id_poda = pp.id_poda
                    WHERE pp.id_nomina = np.id_nomina_pilar
                ), 0) AS total
            FROM nomina_pilar np
            WHERE np.anio = ? AND np.numero_semana = ?
            UNION ALL
            SELECT
                COALESCE(nh.total_neto, 0) +
                COALESCE((
                    SELECT SUM(ch.precio_reja * cht.rejas)
                    FROM cortes_huasteca ch
                    INNER JOIN cortes_huasteca_tablas cht ON cht.id_corte = ch.id
                    WHERE ch.id_nomina = nh.id_nomina_huasteca
                ), 0) +
                COALESCE((
                    SELECT SUM(phm.monto)
                    FROM podas_huasteca ph
                    INNER JOIN podas_movimientos_huasteca phm ON phm.id_poda = ph.id_poda
                    WHERE ph.id_nomina = nh.id_nomina_huasteca
                ), 0) AS total
            FROM nomina_huasteca nh
            WHERE nh.anio = ? AND nh.numero_semana = ?
            UNION ALL
            SELECT
                COALESCE(npa.total_neto, 0) +
                COALESCE((
                    SELECT SUM(cpa.precio_reja * cpah.rejas)
                    FROM cortes_palmilla cpa
                    INNER JOIN cortes_palmilla_tablas cpah ON cpah.id_corte = cpa.id
                    WHERE cpa.id_nomina = npa.id_nomina_palmilla
                ), 0) +
                COALESCE((
                    SELECT SUM(ppmm.monto)
                    FROM podas_palmilla pp
                    INNER JOIN podas_movimientos_palmilla ppmm ON ppmm.id_poda = pp.id_poda
                    WHERE pp.id_nomina = npa.id_nomina_palmilla
                ), 0) AS total
            FROM nomina_palmilla npa
            WHERE npa.anio = ? AND npa.numero_semana = ?
        ) AS totales_ultima
    ";

    // preparar y ejecutar la consulta
    $stmt = mysqli_prepare($conexion, $sql_total_ultima);
    mysqli_stmt_bind_param($stmt, "iiiiiiiiiiiiiiii", $anio, $ultima_semana, $anio, $ultima_semana, $anio, $ultima_semana, $anio, $ultima_semana, $anio, $ultima_semana, $anio, $ultima_semana, $anio, $ultima_semana, $anio, $ultima_semana);
    mysqli_stmt_execute($stmt);
    $resultado = mysqli_stmt_get_result($stmt);
    $fila_total_ultima = mysqli_fetch_assoc($resultado);
    mysqli_stmt_close($stmt);

    // guardar el total de la última semana
    $total_ultima_semana = $fila_total_ultima['total_ultima_semana'] ?? 0;

    //====================================================
    // 2. OBTENER EL TOTAL DE LA SEMANA ANTERIOR PARA COMPARACIÓN
    //====================================================

    // calcular la semana anterior
    // fórmula: semana_anterior = ultima_semana - 1
    $semana_anterior = $ultima_semana - 1;

    // consulta para obtener el total de la semana anterior
    // fórmula: sum(total_neto) de las 8 nóminas donde anio = x AND numero_semana = semana_anterior
    // para relicario, pilar, huasteca, palmilla se suma también total de cortes y podas
    $sql_total_anterior = "
        SELECT
            COALESCE(SUM(total), 0) AS total_semana_anterior
        FROM (
            SELECT total_neto AS total FROM nomina_40lbs WHERE anio = ? AND numero_semana = ?
            UNION ALL
            SELECT total_neto AS total FROM nomina_40lbs_jornal WHERE anio = ? AND numero_semana = ?
            UNION ALL
            SELECT total_neto AS total FROM nomina_10lbs WHERE anio = ? AND numero_semana = ?
            UNION ALL
            SELECT total_neto AS total FROM nomina_confianza WHERE anio = ? AND numero_semana = ?
            UNION ALL
            SELECT
                COALESCE(nr.total_neto, 0) +
                COALESCE((
                    SELECT SUM(cr.precio_reja * crt.rejas)
                    FROM cortes_relicario cr
                    INNER JOIN cortes_relicario_tablas crt ON crt.id_corte = cr.id
                    WHERE cr.id_nomina = nr.id_nomina_relicario
                ), 0) +
                COALESCE((
                    SELECT SUM(pm.monto)
                    FROM podas_relicario pr
                    INNER JOIN podas_movimientos_relicario pm ON pm.id_poda = pr.id_poda
                    WHERE pr.id_nomina = nr.id_nomina_relicario
                ), 0) AS total
            FROM nomina_relicario nr
            WHERE nr.anio = ? AND nr.numero_semana = ?
            UNION ALL
            SELECT
                COALESCE(np.total_neto, 0) +
                COALESCE((
                    SELECT SUM(cp.precio_reja * cpt.rejas)
                    FROM cortes_pilar cp
                    INNER JOIN cortes_pilar_tablas cpt ON cpt.id_corte = cp.id
                    WHERE cp.id_nomina = np.id_nomina_pilar
                ), 0) +
                COALESCE((
                    SELECT SUM(ppm.monto)
                    FROM podas_pilar pp
                    INNER JOIN podas_movimientos_pilar ppm ON ppm.id_poda = pp.id_poda
                    WHERE pp.id_nomina = np.id_nomina_pilar
                ), 0) AS total
            FROM nomina_pilar np
            WHERE np.anio = ? AND np.numero_semana = ?
            UNION ALL
            SELECT
                COALESCE(nh.total_neto, 0) +
                COALESCE((
                    SELECT SUM(ch.precio_reja * cht.rejas)
                    FROM cortes_huasteca ch
                    INNER JOIN cortes_huasteca_tablas cht ON cht.id_corte = ch.id
                    WHERE ch.id_nomina = nh.id_nomina_huasteca
                ), 0) +
                COALESCE((
                    SELECT SUM(phm.monto)
                    FROM podas_huasteca ph
                    INNER JOIN podas_movimientos_huasteca phm ON phm.id_poda = ph.id_poda
                    WHERE ph.id_nomina = nh.id_nomina_huasteca
                ), 0) AS total
            FROM nomina_huasteca nh
            WHERE nh.anio = ? AND nh.numero_semana = ?
            UNION ALL
            SELECT
                COALESCE(npa.total_neto, 0) +
                COALESCE((
                    SELECT SUM(cpa.precio_reja * cpah.rejas)
                    FROM cortes_palmilla cpa
                    INNER JOIN cortes_palmilla_tablas cpah ON cpah.id_corte = cpa.id
                    WHERE cpa.id_nomina = npa.id_nomina_palmilla
                ), 0) +
                COALESCE((
                    SELECT SUM(ppmm.monto)
                    FROM podas_palmilla pp
                    INNER JOIN podas_movimientos_palmilla ppmm ON ppmm.id_poda = pp.id_poda
                    WHERE pp.id_nomina = npa.id_nomina_palmilla
                ), 0) AS total
            FROM nomina_palmilla npa
            WHERE npa.anio = ? AND npa.numero_semana = ?
        ) AS totales_anterior
    ";

    // preparar y ejecutar la consulta
    $stmt = mysqli_prepare($conexion, $sql_total_anterior);
    mysqli_stmt_bind_param($stmt, "iiiiiiiiiiiiiiii", $anio, $semana_anterior, $anio, $semana_anterior, $anio, $semana_anterior, $anio, $semana_anterior, $anio, $semana_anterior, $anio, $semana_anterior, $anio, $semana_anterior, $anio, $semana_anterior);
    mysqli_stmt_execute($stmt);
    $resultado = mysqli_stmt_get_result($stmt);
    $fila_total_anterior = mysqli_fetch_assoc($resultado);
    mysqli_stmt_close($stmt);

    // guardar el total de la semana anterior
    $total_semana_anterior = $fila_total_anterior['total_semana_anterior'] ?? 0;

    //====================================================
    // 3. OBTENER LA SEMANA MÁS CARA DEL AÑO
    //====================================================

    // consulta para obtener la semana con mayor monto
    // fórmula: agrupar por numero_semana, sumar total_neto de las 8 nóminas, ordenar desc, tomar el primero
    // para relicario, pilar, huasteca, palmilla se suma también total de cortes y podas
    $sql_semana_cara = "
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
                    SELECT SUM(pm.monto)
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
                    SELECT SUM(ppm.monto)
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
                    SELECT SUM(phm.monto)
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
                    SELECT SUM(ppmm.monto)
                    FROM podas_palmilla pp
                    INNER JOIN podas_movimientos_palmilla ppmm ON ppmm.id_poda = pp.id_poda
                    WHERE pp.id_nomina = npa.id_nomina_palmilla
                ), 0) AS total
            FROM nomina_palmilla npa
            WHERE npa.anio = ?
        ) AS todas_semanas
        GROUP BY numero_semana
        ORDER BY total_semana DESC
        LIMIT 1
    ";

    // preparar y ejecutar la consulta
    $stmt = mysqli_prepare($conexion, $sql_semana_cara);
    mysqli_stmt_bind_param($stmt, "iiiiiiii", $anio, $anio, $anio, $anio, $anio, $anio, $anio, $anio);
    mysqli_stmt_execute($stmt);
    $resultado = mysqli_stmt_get_result($stmt);
    $fila_semana_cara = mysqli_fetch_assoc($resultado);
    mysqli_stmt_close($stmt);

    // guardar el número de semana y el monto de la semana más cara
    $semana_mas_cara = $fila_semana_cara['numero_semana'] ?? 0;
    $monto_semana_cara = $fila_semana_cara['total_semana'] ?? 0;

    //====================================================
    // 4. OBTENER EL PROMEDIO SEMANAL DEL AÑO
    //====================================================

    // consulta para calcular el promedio semanal
    // fórmula: avg(suma_total_neto_por_semana) de todas las semanas del año
    // para relicario, pilar, huasteca, palmilla se suma también total de cortes y podas
    $sql_promedio = "
        SELECT
            AVG(total_semana) AS promedio_semanal
        FROM (
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
                        SELECT SUM(pm.monto)
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
                        SELECT SUM(ppm.monto)
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
                        SELECT SUM(phm.monto)
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
                        SELECT SUM(ppmm.monto)
                        FROM podas_palmilla pp
                        INNER JOIN podas_movimientos_palmilla ppmm ON ppmm.id_poda = pp.id_poda
                        WHERE pp.id_nomina = npa.id_nomina_palmilla
                    ), 0) AS total
                FROM nomina_palmilla npa
                WHERE npa.anio = ?
            ) AS todas_semanas
            GROUP BY numero_semana
        ) AS promedios
    ";

    // preparar y ejecutar la consulta
    $stmt = mysqli_prepare($conexion, $sql_promedio);
    mysqli_stmt_bind_param($stmt, "iiiiiiii", $anio, $anio, $anio, $anio, $anio, $anio, $anio, $anio);
    mysqli_stmt_execute($stmt);
    $resultado = mysqli_stmt_get_result($stmt);
    $fila_promedio = mysqli_fetch_assoc($resultado);
    mysqli_stmt_close($stmt);

    // guardar el promedio semanal
    $promedio_semanal = $fila_promedio['promedio_semanal'] ?? 0;

    //====================================================
    // 5. OBTENER EL ACUMULADO DEL AÑO
    //====================================================

    // consulta para sumar todos los totales del año
    // fórmula: sum(total_neto) de todas las nóminas de todas las semanas del año
    // para relicario, pilar, huasteca, palmilla se suma también total de cortes y podas
    $sql_acumulado = "
        SELECT
            COALESCE(SUM(total), 0) AS acumulado_anual
        FROM (
            SELECT total_neto AS total FROM nomina_40lbs WHERE anio = ?
            UNION ALL
            SELECT total_neto AS total FROM nomina_40lbs_jornal WHERE anio = ?
            UNION ALL
            SELECT total_neto AS total FROM nomina_10lbs WHERE anio = ?
            UNION ALL
            SELECT total_neto AS total FROM nomina_confianza WHERE anio = ?
            UNION ALL
            SELECT
                COALESCE(nr.total_neto, 0) +
                COALESCE((
                    SELECT SUM(cr.precio_reja * crt.rejas)
                    FROM cortes_relicario cr
                    INNER JOIN cortes_relicario_tablas crt ON crt.id_corte = cr.id
                    WHERE cr.id_nomina = nr.id_nomina_relicario
                ), 0) +
                COALESCE((
                    SELECT SUM(pm.monto)
                    FROM podas_relicario pr
                    INNER JOIN podas_movimientos_relicario pm ON pm.id_poda = pr.id_poda
                    WHERE pr.id_nomina = nr.id_nomina_relicario
                ), 0) AS total
            FROM nomina_relicario nr
            WHERE nr.anio = ?
            UNION ALL
            SELECT
                COALESCE(np.total_neto, 0) +
                COALESCE((
                    SELECT SUM(cp.precio_reja * cpt.rejas)
                    FROM cortes_pilar cp
                    INNER JOIN cortes_pilar_tablas cpt ON cpt.id_corte = cp.id
                    WHERE cp.id_nomina = np.id_nomina_pilar
                ), 0) +
                COALESCE((
                    SELECT SUM(ppm.monto)
                    FROM podas_pilar pp
                    INNER JOIN podas_movimientos_pilar ppm ON ppm.id_poda = pp.id_poda
                    WHERE pp.id_nomina = np.id_nomina_pilar
                ), 0) AS total
            FROM nomina_pilar np
            WHERE np.anio = ?
            UNION ALL
            SELECT
                COALESCE(nh.total_neto, 0) +
                COALESCE((
                    SELECT SUM(ch.precio_reja * cht.rejas)
                    FROM cortes_huasteca ch
                    INNER JOIN cortes_huasteca_tablas cht ON cht.id_corte = ch.id
                    WHERE ch.id_nomina = nh.id_nomina_huasteca
                ), 0) +
                COALESCE((
                    SELECT SUM(phm.monto)
                    FROM podas_huasteca ph
                    INNER JOIN podas_movimientos_huasteca phm ON phm.id_poda = ph.id_poda
                    WHERE ph.id_nomina = nh.id_nomina_huasteca
                ), 0) AS total
            FROM nomina_huasteca nh
            WHERE nh.anio = ?
            UNION ALL
            SELECT
                COALESCE(npa.total_neto, 0) +
                COALESCE((
                    SELECT SUM(cpa.precio_reja * cpah.rejas)
                    FROM cortes_palmilla cpa
                    INNER JOIN cortes_palmilla_tablas cpah ON cpah.id_corte = cpa.id
                    WHERE cpa.id_nomina = npa.id_nomina_palmilla
                ), 0) +
                COALESCE((
                    SELECT SUM(ppmm.monto)
                    FROM podas_palmilla pp
                    INNER JOIN podas_movimientos_palmilla ppmm ON ppmm.id_poda = pp.id_poda
                    WHERE pp.id_nomina = npa.id_nomina_palmilla
                ), 0) AS total
            FROM nomina_palmilla npa
            WHERE npa.anio = ?
        ) AS todas_nominas
    ";

    // preparar y ejecutar la consulta
    $stmt = mysqli_prepare($conexion, $sql_acumulado);
    mysqli_stmt_bind_param($stmt, "iiiiiiii", $anio, $anio, $anio, $anio, $anio, $anio, $anio, $anio);
    mysqli_stmt_execute($stmt);
    $resultado = mysqli_stmt_get_result($stmt);
    $fila_acumulado = mysqli_fetch_assoc($resultado);
    mysqli_stmt_close($stmt);

    // guardar el acumulado anual
    $acumulado_anual = $fila_acumulado['acumulado_anual'] ?? 0;

    //====================================================
    // RESPUESTA CON TODOS LOS KPIs
    //====================================================

    // devolver todos los kpis en formato json
    echo json_encode([
        "success" => true,
        "kpis" => [
            "ultima_semana" => $ultima_semana,
            "total_ultima_semana" => $total_ultima_semana,
            "total_semana_anterior" => $total_semana_anterior,
            "semana_mas_cara" => $semana_mas_cara,
            "monto_semana_cara" => $monto_semana_cara,
            "promedio_semanal" => $promedio_semanal,
            "acumulado_anual" => $acumulado_anual
        ]
    ]);
}


//===========================================================
// FUNCIÓN PARA OBTENER EL DESGLOSE DE LA ÚLTIMA SEMANA
//===========================================================

function obtenerDesgloseUltimaSemana(mysqli $conexion)
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
    // fórmula cortes: sum(precio_reja * rejas) de la tabla cortes_* y cortes_*_tablas
    // fórmula podas: sum(monto) de la tabla podas_movimientos_*
    $sql_desglose = "
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
                        SELECT SUM(pm.monto)
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
                        SELECT SUM(ppm.monto)
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
                        SELECT SUM(phm.monto)
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
                        SELECT SUM(ppmm.monto)
                        FROM podas_palmilla pp
                        INNER JOIN podas_movimientos_palmilla ppmm ON ppmm.id_poda = pp.id_poda
                        WHERE pp.id_nomina = npa.id_nomina_palmilla
                    ), 0)
                FROM nomina_palmilla npa
                WHERE npa.anio = ? AND npa.numero_semana = ?
            ), 0) AS monto
    ";

    // preparar y ejecutar la consulta
    $stmt = mysqli_prepare($conexion, $sql_desglose);
    mysqli_stmt_bind_param($stmt, "iiiiiiiiiiiiiiii", $anio, $ultima_semana, $anio, $ultima_semana, $anio, $ultima_semana, $anio, $ultima_semana, $anio, $ultima_semana, $anio, $ultima_semana, $anio, $ultima_semana, $anio, $ultima_semana);
    mysqli_stmt_execute($stmt);
    $resultado = mysqli_stmt_get_result($stmt);

    // recorrer los resultados y guardar en un array
    $desglose = [];
    while ($fila = mysqli_fetch_assoc($resultado)) {
        $desglose[] = $fila;
    }

    mysqli_stmt_close($stmt);

    //====================================================
    // CALCULAR EL TOTAL CONSOLIDADO
    //====================================================

    // fórmula: suma de los montos de las 8 nóminas
    $total_consolidado = 0;
    foreach ($desglose as $nomina) {
        $total_consolidado += $nomina['monto'];
    }

    //====================================================
    // CALCULAR EL PORCENTAJE DE CADA NÓMINA
    //====================================================

    // fórmula: (monto_nomina / total_consolidado) * 100
    foreach ($desglose as &$nomina) {
        if ($total_consolidado > 0) {
            $nomina['porcentaje'] = ($nomina['monto'] / $total_consolidado) * 100;
        } else {
            $nomina['porcentaje'] = 0;
        }
    }

    //====================================================
    // RESPUESTA CON EL DESGLOSE
    //====================================================

    // devolver el desglose en formato json
    echo json_encode([
        "success" => true,
        "desglose" => $desglose,
        "total_consolidado" => $total_consolidado,
        "ultima_semana" => $ultima_semana
    ]);
}