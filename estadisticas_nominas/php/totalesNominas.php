<?php

require_once __DIR__ . "/../../conexion/conexion.php";
/** @var mysqli $conexion */

$accion = $_POST['accion'] ?? $_GET['accion'] ?? '';

switch ($accion) {

    case 'obtenerHistorialSemanal':
        obtenerHistorialSemanal($conexion);
        break;

    default:
        echo json_encode([
            "success" => false,
            "mensaje" => "Acción no válida."
        ]);
        break;
}


//===========================================================
// FUNCIÓN PARA OBTENER EL HISTORIAL SEMANAL
//===========================================================

function obtenerHistorialSemanal(mysqli $conexion)
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
    // OBTENER EL TOTAL DE CADA NÓMINA POR SEMANA
    //====================================================

    // consulta para obtener el total de cada nómina por semana
    // fórmula: agrupar por numero_semana, obtener total_neto de cada nómina
    // para relicario, pilar, huasteca, palmilla se suma también total de cortes y podas
    $sql_historial = "
        SELECT
            numero_semana,
            '40lbs' AS nomina,
            COALESCE(SUM(total_neto), 0) AS total
        FROM nomina_40lbs
        WHERE anio = ?
        GROUP BY numero_semana

        UNION ALL

        SELECT
            numero_semana,
            '40lbs_jornal' AS nomina,
            COALESCE(SUM(total_neto), 0) AS total
        FROM nomina_40lbs_jornal
        WHERE anio = ?
        GROUP BY numero_semana

        UNION ALL

        SELECT
            numero_semana,
            '10lbs' AS nomina,
            COALESCE(SUM(total_neto), 0) AS total
        FROM nomina_10lbs
        WHERE anio = ?
        GROUP BY numero_semana

        UNION ALL

        SELECT
            numero_semana,
            'confianza' AS nomina,
            COALESCE(SUM(total_neto), 0) AS total
        FROM nomina_confianza
        WHERE anio = ?
        GROUP BY numero_semana

        UNION ALL

        SELECT
            nr.numero_semana,
            'relicario' AS nomina,
            COALESCE(SUM(
                nr.total_neto +
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
            ), 0) AS total
        FROM nomina_relicario nr
        WHERE nr.anio = ?
        GROUP BY nr.numero_semana

        UNION ALL

        SELECT
            np.numero_semana,
            'pilar' AS nomina,
            COALESCE(SUM(
                np.total_neto +
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
            ), 0) AS total
        FROM nomina_pilar np
        WHERE np.anio = ?
        GROUP BY np.numero_semana

        UNION ALL

        SELECT
            nh.numero_semana,
            'huasteca' AS nomina,
            COALESCE(SUM(
                nh.total_neto +
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
            ), 0) AS total
        FROM nomina_huasteca nh
        WHERE nh.anio = ?
        GROUP BY nh.numero_semana

        UNION ALL

        SELECT
            npa.numero_semana,
            'palmilla' AS nomina,
            COALESCE(SUM(
                npa.total_neto +
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
            ), 0) AS total
        FROM nomina_palmilla npa
        WHERE npa.anio = ?
        GROUP BY npa.numero_semana
    ";

    // preparar y ejecutar la consulta
    $stmt = mysqli_prepare($conexion, $sql_historial);
    mysqli_stmt_bind_param($stmt, "iiiiiiii", $anio, $anio, $anio, $anio, $anio, $anio, $anio, $anio);
    mysqli_stmt_execute($stmt);
    $resultado = mysqli_stmt_get_result($stmt);

    // recorrer los resultados y guardar en un array
    $datos_raw = [];
    while ($fila = mysqli_fetch_assoc($resultado)) {
        $datos_raw[] = $fila;
    }

    mysqli_stmt_close($stmt);

    //====================================================
    // ORGANIZAR DATOS EN FORMATO PIVOTE (FILAS = SEMANAS, COLUMNAS = NÓMINAS)
    //====================================================

    // obtener todas las semanas únicas
    $semanas = [];
    foreach ($datos_raw as $fila) {
        if (!in_array($fila['numero_semana'], $semanas)) {
            $semanas[] = $fila['numero_semana'];
        }
    }
    sort($semanas);

    // crear el array de historial con formato pivote
    $historial = [];
    foreach ($semanas as $semana) {
        $fila_semana = [
            'numero_semana' => $semana,
            '40lbs' => 0,
            '40lbs_jornal' => 0,
            '10lbs' => 0,
            'confianza' => 0,
            'relicario' => 0,
            'pilar' => 0,
            'huasteca' => 0,
            'palmilla' => 0
        ];

        // buscar los datos de cada nómina para esta semana
        foreach ($datos_raw as $fila) {
            if ($fila['numero_semana'] == $semana) {
                $fila_semana[$fila['nomina']] = $fila['total'];
            }
        }

        // calcular el total consolidado de la semana
        $fila_semana['total_semana'] = 
            $fila_semana['40lbs'] +
            $fila_semana['40lbs_jornal'] +
            $fila_semana['10lbs'] +
            $fila_semana['confianza'] +
            $fila_semana['relicario'] +
            $fila_semana['pilar'] +
            $fila_semana['huasteca'] +
            $fila_semana['palmilla'];

        $historial[] = $fila_semana;
    }

    //====================================================
    // CALCULAR CAMBIO Y PORCENTAJE VS SEMANA ANTERIOR
    //====================================================

    // fórmula cambio: total_semana_actual - total_semana_anterior
    // fórmula porcentaje: (cambio / total_semana_anterior) * 100
    for ($i = 0; $i < count($historial); $i++) {
        if ($i > 0) {
            $total_anterior = $historial[$i - 1]['total_semana'];
            $total_actual = $historial[$i]['total_semana'];
            
            $cambio = $total_actual - $total_anterior;
            $porcentaje = 0;
            
            if ($total_anterior > 0) {
                $porcentaje = ($cambio / $total_anterior) * 100;
            }
            
            $historial[$i]['cambio'] = $cambio;
            $historial[$i]['porcentaje'] = $porcentaje;
        } else {
            // primera semana no tiene anterior
            $historial[$i]['cambio'] = 0;
            $historial[$i]['porcentaje'] = 0;
        }
    }

    //====================================================
    // RESPUESTA CON EL HISTORIAL SEMANAL
    //====================================================

    // devolver el historial en formato json
    echo json_encode([
        "success" => true,
        "historial" => $historial
    ]);
}
