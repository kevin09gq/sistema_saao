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

    $nominas_simples = [
        '40 Lbs' => 'nomina_40lbs',
        '40 Lbs Jornal' => 'nomina_40lbs_jornal',
        '10 Lbs' => 'nomina_10lbs',
        'Confianza' => 'nomina_confianza'
    ];

    $ranking = [];

    // obtener totales de nóminas simples
    foreach ($nominas_simples as $nombre => $tabla) {
        $sql = "SELECT COALESCE(total_neto, 0) AS monto FROM $tabla WHERE anio = ? AND numero_semana = ?";
        $stmt = mysqli_prepare($conexion, $sql);
        mysqli_stmt_bind_param($stmt, "ii", $anio, $ultima_semana);
        mysqli_stmt_execute($stmt);
        $res = mysqli_stmt_get_result($stmt);
        $fila = mysqli_fetch_assoc($res);
        mysqli_stmt_close($stmt);

        $ranking[] = [
            'nomina' => $nombre,
            'monto' => (float)($fila['monto'] ?? 0)
        ];
    }

    // obtener totales de nóminas agrícolas
    $ranchos = ['relicario', 'pilar', 'huasteca', 'palmilla'];
    $nombres_ranchos = ['Relicario', 'Pilar', 'Huasteca', 'Palmilla'];

    foreach ($ranchos as $i => $rancho) {
        $nombre = $nombres_ranchos[$i];

        $sql_agricola = "
            SELECT
                COALESCE(nr.total_neto, 0) +
                COALESCE((
                    SELECT SUM(cr.precio_reja * crt.rejas)
                    FROM cortes_{$rancho} cr
                    INNER JOIN cortes_{$rancho}_tablas crt ON crt.id_corte = cr.id
                    WHERE cr.id_nomina IN (SELECT id_nomina_{$rancho} FROM nomina_{$rancho} WHERE anio = ? AND numero_semana = ?)
                ), 0) +
                COALESCE((
                    SELECT SUM(nc.total)
                    FROM nomina_{$rancho}_corte nc
                    WHERE nc.id_nomina IN (SELECT id_nomina_{$rancho} FROM nomina_{$rancho} WHERE anio = ? AND numero_semana = ?)
                ), 0) +
                COALESCE((
                    SELECT SUM(pm.arboles_podados * pm.monto)
                    FROM podas_{$rancho} pr
                    INNER JOIN podas_movimientos_{$rancho} pm ON pm.id_poda = pr.id_poda
                    WHERE pr.id_nomina IN (SELECT id_nomina_{$rancho} FROM nomina_{$rancho} WHERE anio = ? AND numero_semana = ?)
                    AND (pm.es_extra = 0 OR pm.es_extra IS NULL)
                ), 0) +
                COALESCE((
                    SELECT SUM(pm.monto)
                    FROM podas_{$rancho} pr
                    INNER JOIN podas_movimientos_{$rancho} pm ON pm.id_poda = pr.id_poda
                    WHERE pr.id_nomina IN (SELECT id_nomina_{$rancho} FROM nomina_{$rancho} WHERE anio = ? AND numero_semana = ?)
                    AND pm.es_extra = 1
                ), 0) AS monto
            FROM nomina_{$rancho} nr
            WHERE nr.anio = ? AND nr.numero_semana = ?
        ";

        $stmt = mysqli_prepare($conexion, $sql_agricola);
        mysqli_stmt_bind_param($stmt, "iiiiiiiiii", $anio, $ultima_semana, $anio, $ultima_semana, $anio, $ultima_semana, $anio, $ultima_semana, $anio, $ultima_semana);
        mysqli_stmt_execute($stmt);
        $res = mysqli_stmt_get_result($stmt);
        $fila = mysqli_fetch_assoc($res);
        mysqli_stmt_close($stmt);

        $ranking[] = [
            'nomina' => $nombre,
            'monto' => (float)($fila['monto'] ?? 0)
        ];
    }

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
