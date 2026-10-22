<?php

require_once __DIR__ . "/../../conexion/conexion.php";
/** @var mysqli $conexion */

$accion = $_POST['accion'] ?? $_GET['accion'] ?? '';

switch ($accion) {

    case 'obtenerPromediosSemanales':
        obtenerPromediosSemanales($conexion);
        break;

    default:
        echo json_encode([
            "success" => false,
            "mensaje" => "Acción no válida."
        ]);
        break;
}


//===========================================================
// FUNCIÓN PARA OBTENER LOS PROMEDIOS SEMANALES
//===========================================================

function obtenerPromediosSemanales(mysqli $conexion)
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
    // OBTENER EL PROMEDIO SEMANAL DE CADA NÓMINA
    //====================================================

    // consulta para obtener el promedio semanal de cada nómina
    // fórmula: avg(total_neto) de cada nómina donde anio = x
    // para relicario, pilar, huasteca, palmilla se suma también total de cortes y podas
    // esta gráfica sirve para comparar el costo operativo medio habitual de cada nómina
    // permitiendo identificar qué nómina tiene mayor gasto promedio semanal
    $sql_promedios = "
        SELECT
            '40 Lbs' AS nomina,
            COALESCE(AVG(total_neto), 0) AS promedio_semanal
        FROM nomina_40lbs
        WHERE anio = ?

        UNION ALL

        SELECT
            '40 Lbs Jornal' AS nomina,
            COALESCE(AVG(total_neto), 0) AS promedio_semanal
        FROM nomina_40lbs_jornal
        WHERE anio = ?

        UNION ALL

        SELECT
            '10 Lbs' AS nomina,
            COALESCE(AVG(total_neto), 0) AS promedio_semanal
        FROM nomina_10lbs
        WHERE anio = ?

        UNION ALL

        SELECT
            'Confianza' AS nomina,
            COALESCE(AVG(total_neto), 0) AS promedio_semanal
        FROM nomina_confianza
        WHERE anio = ?

        UNION ALL

        SELECT
            'Relicario' AS nomina,
            COALESCE(AVG(
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
            ), 0) AS promedio_semanal
        FROM nomina_relicario nr
        WHERE nr.anio = ?

        UNION ALL

        SELECT
            'Pilar' AS nomina,
            COALESCE(AVG(
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
            ), 0) AS promedio_semanal
        FROM nomina_pilar np
        WHERE np.anio = ?

        UNION ALL

        SELECT
            'Huasteca' AS nomina,
            COALESCE(AVG(
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
            ), 0) AS promedio_semanal
        FROM nomina_huasteca nh
        WHERE nh.anio = ?

        UNION ALL

        SELECT
            'Palmilla' AS nomina,
            COALESCE(AVG(
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
            ), 0) AS promedio_semanal
        FROM nomina_palmilla npa
        WHERE npa.anio = ?
    ";

    // preparar y ejecutar la consulta
    $stmt = mysqli_prepare($conexion, $sql_promedios);
    mysqli_stmt_bind_param($stmt, "iiiiiiii", $anio, $anio, $anio, $anio, $anio, $anio, $anio, $anio);
    mysqli_stmt_execute($stmt);
    $resultado = mysqli_stmt_get_result($stmt);

    // recorrer los resultados y guardar en un array
    $promedios = [];
    while ($fila = mysqli_fetch_assoc($resultado)) {
        $promedios[] = $fila;
    }

    mysqli_stmt_close($stmt);

    //====================================================
    // RESPUESTA CON LOS PROMEDIOS SEMANALES
    //====================================================

    // devolver los promedios en formato json
    echo json_encode([
        "success" => true,
        "promedios" => $promedios
    ]);
}
