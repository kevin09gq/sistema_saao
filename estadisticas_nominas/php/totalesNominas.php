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

    $datos_raw = [];

    // obtener datos de nóminas simples
    $nominas_simples = [
        '40lbs' => 'nomina_40lbs',
        '40lbs_jornal' => 'nomina_40lbs_jornal',
        '10lbs' => 'nomina_10lbs',
        'confianza' => 'nomina_confianza'
    ];

    foreach ($nominas_simples as $nombre => $tabla) {
        $sql = "SELECT numero_semana, COALESCE(SUM(total_neto), 0) AS total FROM $tabla WHERE anio = ? GROUP BY numero_semana";
        $stmt = mysqli_prepare($conexion, $sql);
        mysqli_stmt_bind_param($stmt, "i", $anio);
        mysqli_stmt_execute($stmt);
        $res = mysqli_stmt_get_result($stmt);
        while ($fila = mysqli_fetch_assoc($res)) {
            $fila['nomina'] = $nombre;
            $datos_raw[] = $fila;
        }
        mysqli_stmt_close($stmt);
    }

    // obtener datos de nóminas agrícolas
    $ranchos = ['relicario', 'pilar', 'huasteca', 'palmilla'];
    $nombres_ranchos = ['relicario', 'pilar', 'huasteca', 'palmilla'];

    foreach ($ranchos as $i => $rancho) {
        $nombre = $nombres_ranchos[$i];

        $sql_agricola = "
            SELECT
                nr.numero_semana,
                COALESCE(SUM(
                    nr.total_neto +
                    COALESCE((
                        SELECT SUM(cr.precio_reja * crt.rejas)
                        FROM cortes_{$rancho} cr
                        INNER JOIN cortes_{$rancho}_tablas crt ON crt.id_corte = cr.id
                        WHERE cr.id_nomina IN (SELECT id_nomina_{$rancho} FROM nomina_{$rancho} WHERE anio = ? AND numero_semana = nr.numero_semana)
                    ), 0) +
                    COALESCE((
                        SELECT SUM(nc.total)
                        FROM nomina_{$rancho}_corte nc
                        WHERE nc.id_nomina IN (SELECT id_nomina_{$rancho} FROM nomina_{$rancho} WHERE anio = ? AND numero_semana = nr.numero_semana)
                    ), 0) +
                    COALESCE((
                        SELECT SUM(pm.arboles_podados * pm.monto)
                        FROM podas_{$rancho} pr
                        INNER JOIN podas_movimientos_{$rancho} pm ON pm.id_poda = pr.id_poda
                        WHERE pr.id_nomina IN (SELECT id_nomina_{$rancho} FROM nomina_{$rancho} WHERE anio = ? AND numero_semana = nr.numero_semana)
                        AND (pm.es_extra = 0 OR pm.es_extra IS NULL)
                    ), 0) +
                    COALESCE((
                        SELECT SUM(pm.monto)
                        FROM podas_{$rancho} pr
                        INNER JOIN podas_movimientos_{$rancho} pm ON pm.id_poda = pr.id_poda
                        WHERE pr.id_nomina IN (SELECT id_nomina_{$rancho} FROM nomina_{$rancho} WHERE anio = ? AND numero_semana = nr.numero_semana)
                        AND pm.es_extra = 1
                    ), 0)
                ), 0) AS total
            FROM nomina_{$rancho} nr
            WHERE nr.anio = ?
            GROUP BY nr.numero_semana
        ";

        $stmt = mysqli_prepare($conexion, $sql_agricola);
        mysqli_stmt_bind_param($stmt, "iiiii", $anio, $anio, $anio, $anio, $anio);
        mysqli_stmt_execute($stmt);
        $res = mysqli_stmt_get_result($stmt);
        while ($fila = mysqli_fetch_assoc($res)) {
            $fila['nomina'] = $nombre;
            $datos_raw[] = $fila;
        }
        mysqli_stmt_close($stmt);
    }

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
