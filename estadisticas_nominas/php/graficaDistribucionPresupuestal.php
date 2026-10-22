<?php

require_once __DIR__ . "/../../conexion/conexion.php";
/** @var mysqli $conexion */

$accion = $_POST['accion'] ?? $_GET['accion'] ?? '';

switch ($accion) {

    case 'obtenerDistribucionPresupuestal':
        obtenerDistribucionPresupuestal($conexion);
        break;

    default:
        echo json_encode([
            "success" => false,
            "mensaje" => "Acción no válida."
        ]);
        break;
}


//===========================================================
// FUNCIÓN PARA OBTENER LA DISTRIBUCIÓN PRESUPUESTAL
//===========================================================

function obtenerDistribucionPresupuestal(mysqli $conexion)
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
    // OBTENER EL TOTAL ANUAL DE CADA NÓMINA
    //====================================================

    // consulta para obtener el total anual de cada nómina
    // fórmula: sum(total_neto) de cada nómina donde anio = x
    // para relicario, pilar, huasteca, palmilla se suma también total de cortes y podas
    // esta gráfica sirve para visualizar el porcentaje de participación de cada nómina
    // en el presupuesto total anual, permitiendo identificar qué nómina tiene mayor peso
    $sql_distribucion = "
        SELECT
            '40 Lbs' AS nomina,
            COALESCE(SUM(total_neto), 0) AS total_anual
        FROM nomina_40lbs
        WHERE anio = ?

        UNION ALL

        SELECT
            '40 Lbs Jornal' AS nomina,
            COALESCE(SUM(total_neto), 0) AS total_anual
        FROM nomina_40lbs_jornal
        WHERE anio = ?

        UNION ALL

        SELECT
            '10 Lbs' AS nomina,
            COALESCE(SUM(total_neto), 0) AS total_anual
        FROM nomina_10lbs
        WHERE anio = ?

        UNION ALL

        SELECT
            'Confianza' AS nomina,
            COALESCE(SUM(total_neto), 0) AS total_anual
        FROM nomina_confianza
        WHERE anio = ?

        UNION ALL

        SELECT
            'Relicario' AS nomina,
            COALESCE(SUM(nr.total_neto), 0) +
            COALESCE((
                SELECT SUM(cr.precio_reja * crt.rejas)
                FROM cortes_relicario cr
                INNER JOIN cortes_relicario_tablas crt ON crt.id_corte = cr.id
                INNER JOIN nomina_relicario nr2 ON nr2.id_nomina_relicario = cr.id_nomina
                WHERE nr2.anio = ?
            ), 0) +
            COALESCE((
                SELECT SUM(pm.monto)
                FROM podas_relicario pr
                INNER JOIN podas_movimientos_relicario pm ON pm.id_poda = pr.id_poda
                INNER JOIN nomina_relicario nr3 ON nr3.id_nomina_relicario = pr.id_nomina
                WHERE nr3.anio = ?
            ), 0) AS total_anual
        FROM nomina_relicario nr
        WHERE nr.anio = ?

        UNION ALL

        SELECT
            'Pilar' AS nomina,
            COALESCE(SUM(np.total_neto), 0) +
            COALESCE((
                SELECT SUM(cp.precio_reja * cpt.rejas)
                FROM cortes_pilar cp
                INNER JOIN cortes_pilar_tablas cpt ON cpt.id_corte = cp.id
                INNER JOIN nomina_pilar np2 ON np2.id_nomina_pilar = cp.id_nomina
                WHERE np2.anio = ?
            ), 0) +
            COALESCE((
                SELECT SUM(ppm.monto)
                FROM podas_pilar pp
                INNER JOIN podas_movimientos_pilar ppm ON ppm.id_poda = pp.id_poda
                INNER JOIN nomina_pilar np3 ON np3.id_nomina_pilar = pp.id_nomina
                WHERE np3.anio = ?
            ), 0) AS total_anual
        FROM nomina_pilar np
        WHERE np.anio = ?

        UNION ALL

        SELECT
            'Huasteca' AS nomina,
            COALESCE(SUM(nh.total_neto), 0) +
            COALESCE((
                SELECT SUM(ch.precio_reja * cht.rejas)
                FROM cortes_huasteca ch
                INNER JOIN cortes_huasteca_tablas cht ON cht.id_corte = ch.id
                INNER JOIN nomina_huasteca nh2 ON nh2.id_nomina_huasteca = ch.id_nomina
                WHERE nh2.anio = ?
            ), 0) +
            COALESCE((
                SELECT SUM(phm.monto)
                FROM podas_huasteca ph
                INNER JOIN podas_movimientos_huasteca phm ON phm.id_poda = ph.id_poda
                INNER JOIN nomina_huasteca nh3 ON nh3.id_nomina_huasteca = ph.id_nomina
                WHERE nh3.anio = ?
            ), 0) AS total_anual
        FROM nomina_huasteca nh
        WHERE nh.anio = ?

        UNION ALL

        SELECT
            'Palmilla' AS nomina,
            COALESCE(SUM(npa.total_neto), 0) +
            COALESCE((
                SELECT SUM(cpa.precio_reja * cpah.rejas)
                FROM cortes_palmilla cpa
                INNER JOIN cortes_palmilla_tablas cpah ON cpah.id_corte = cpa.id
                INNER JOIN nomina_palmilla npa2 ON npa2.id_nomina_palmilla = cpa.id_nomina
                WHERE npa2.anio = ?
            ), 0) +
            COALESCE((
                SELECT SUM(ppmm.monto)
                FROM podas_palmilla pp
                INNER JOIN podas_movimientos_palmilla ppmm ON ppmm.id_poda = pp.id_poda
                INNER JOIN nomina_palmilla npa3 ON npa3.id_nomina_palmilla = pp.id_nomina
                WHERE npa3.anio = ?
            ), 0) AS total_anual
        FROM nomina_palmilla npa
        WHERE npa.anio = ?
    ";

    // preparar y ejecutar la consulta
    $stmt = mysqli_prepare($conexion, $sql_distribucion);
    mysqli_stmt_bind_param($stmt, "iiiiiiiiiiiiiiii", $anio, $anio, $anio, $anio, $anio, $anio, $anio, $anio, $anio, $anio, $anio, $anio, $anio, $anio, $anio, $anio);
    mysqli_stmt_execute($stmt);
    $resultado = mysqli_stmt_get_result($stmt);

    // recorrer los resultados y guardar en un array
    $distribucion = [];
    while ($fila = mysqli_fetch_assoc($resultado)) {
        $distribucion[] = $fila;
    }

    mysqli_stmt_close($stmt);

    //====================================================
    // CALCULAR EL TOTAL ANUAL CONSOLIDADO
    //====================================================

    // fórmula: suma de los totales anuales de las 8 nóminas
    $total_anual = 0;
    foreach ($distribucion as $nomina) {
        $total_anual += $nomina['total_anual'];
    }

    //====================================================
    // CALCULAR EL PORCENTAJE DE CADA NÓMINA
    //====================================================

    // fórmula: (total_anual_nomina / total_anual_consolidado) * 100
    foreach ($distribucion as &$nomina) {
        if ($total_anual > 0) {
            $nomina['porcentaje'] = ($nomina['total_anual'] / $total_anual) * 100;
        } else {
            $nomina['porcentaje'] = 0;
        }
    }

    //====================================================
    // RESPUESTA CON LA DISTRIBUCIÓN PRESUPUESTAL
    //====================================================

    // devolver la distribución en formato json
    echo json_encode([
        "success" => true,
        "distribucion" => $distribucion,
        "total_anual" => $total_anual
    ]);
}
