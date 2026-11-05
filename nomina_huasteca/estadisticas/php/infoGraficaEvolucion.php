<?php

require_once __DIR__ . "/../../../conexion/conexion.php";
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
// FUNCIÓN PARA OBTENER LA EVOLUCIÓN SEMANAL DE 10 LBS
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
    // OBTENER EL TOTAL DE CADA SEMANA DE NOMINA_10LBS
    //====================================================

    // consulta para obtener el total de cada semana sumando corte y poda
    $sql_evolucion = "
        SELECT 
            nr.numero_semana,
            nr.total_neto AS total_nomina,
            COALESCE(c.total_corte, 0) AS total_corte,
            COALESCE(p.total_poda, 0) AS total_poda,
            (nr.total_neto + COALESCE(c.total_corte, 0) + COALESCE(p.total_poda, 0)) AS total_semana
        FROM nomina_huasteca nr
        LEFT JOIN (
            SELECT 
                sub.id_nomina,
                SUM(sub.monto_corte) AS total_corte
            FROM (
                SELECT cr.id_nomina, SUM(crt.rejas * cr.precio_reja) AS monto_corte
                FROM cortes_huasteca cr
                INNER JOIN cortes_huasteca_tablas crt ON crt.id_corte = cr.id
                WHERE cr.estado = 1
                GROUP BY cr.id_nomina
                UNION ALL
                SELECT nc.id_nomina, SUM(nc.total) AS monto_corte
                FROM nomina_huasteca_corte nc
                GROUP BY nc.id_nomina
            ) sub
            GROUP BY sub.id_nomina
        ) c ON c.id_nomina = nr.id_nomina_huasteca
        LEFT JOIN (
            SELECT 
                sub_p.id_nomina,
                SUM(sub_p.monto_poda) AS total_poda
            FROM (
                SELECT pr.id_nomina, SUM(pm.arboles_podados * pm.monto) AS monto_poda
                FROM podas_huasteca pr
                INNER JOIN podas_movimientos_huasteca pm ON pm.id_poda = pr.id_poda
                WHERE pm.es_extra = 0 OR pm.es_extra IS NULL
                GROUP BY pr.id_nomina
                UNION ALL
                SELECT pr.id_nomina, SUM(pm.monto) AS monto_poda
                FROM podas_huasteca pr
                INNER JOIN podas_movimientos_huasteca pm ON pm.id_poda = pr.id_poda
                WHERE pm.es_extra = 1
                GROUP BY pr.id_nomina
            ) sub_p
            GROUP BY sub_p.id_nomina
        ) p ON p.id_nomina = nr.id_nomina_huasteca
        WHERE nr.anio = ?
        ORDER BY nr.numero_semana ASC
    ";

    // preparar y ejecutar la consulta
    $stmt = mysqli_prepare($conexion, $sql_evolucion);
    mysqli_stmt_bind_param($stmt, "i", $anio);
    mysqli_stmt_execute($stmt);
    $resultado = mysqli_stmt_get_result($stmt);

    // recorrer los resultados y guardar en un array
    $evolucion = [];
    while ($fila = mysqli_fetch_assoc($resultado)) {
        $evolucion[] = [
            'numero_semana' => (int)$fila['numero_semana'],
            'total_nomina'  => (float)$fila['total_nomina'],
            'total_corte'   => (float)$fila['total_corte'],
            'total_poda'    => (float)$fila['total_poda'],
            'total_semana'  => (float)$fila['total_semana']
        ];
    }

    mysqli_stmt_close($stmt);

    // validar que existan datos
    if (empty($evolucion)) {
        echo json_encode([
            "success" => false,
            "mensaje" => "No hay datos para el año seleccionado."
        ]);
        return;
    }

    //====================================================
    // CALCULAR EL PROMEDIO SEMANAL
    //====================================================

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
