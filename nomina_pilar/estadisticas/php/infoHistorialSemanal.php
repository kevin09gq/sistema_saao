<?php

require_once __DIR__ . "/../../../conexion/conexion.php";
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
    // OBTENER LOS DATOS DE CADA SEMANA
    //====================================================

    $sql = "
        SELECT
            nr.numero_semana,
            nr.total_percepciones,
            nr.total_deducciones,
            nr.total_neto AS total_nomina,
            COALESCE(c.total_corte, 0) AS total_corte,
            COALESCE(p.total_poda, 0) AS total_poda,
            (nr.total_neto + COALESCE(c.total_corte, 0) + COALESCE(p.total_poda, 0)) AS total_neto
        FROM nomina_pilar nr
        LEFT JOIN (
            SELECT 
                sub.id_nomina,
                SUM(sub.monto_corte) AS total_corte
            FROM (
                SELECT cr.id_nomina, SUM(crt.rejas * cr.precio_reja) AS monto_corte
                FROM cortes_pilar cr
                INNER JOIN cortes_pilar_tablas crt ON crt.id_corte = cr.id
                WHERE cr.estado = 1
                GROUP BY cr.id_nomina
                UNION ALL
                SELECT nc.id_nomina, SUM(nc.total) AS monto_corte
                FROM nomina_pilar_corte nc
                GROUP BY nc.id_nomina
            ) sub
            GROUP BY sub.id_nomina
        ) c ON c.id_nomina = nr.id_nomina_pilar
        LEFT JOIN (
            SELECT 
                sub_p.id_nomina,
                SUM(sub_p.monto_poda) AS total_poda
            FROM (
                SELECT pr.id_nomina, SUM(pm.arboles_podados * pm.monto) AS monto_poda
                FROM podas_pilar pr
                INNER JOIN podas_movimientos_pilar pm ON pm.id_poda = pr.id_poda
                WHERE pm.es_extra = 0 OR pm.es_extra IS NULL
                GROUP BY pr.id_nomina
                UNION ALL
                SELECT pr.id_nomina, SUM(pm.monto) AS monto_poda
                FROM podas_pilar pr
                INNER JOIN podas_movimientos_pilar pm ON pm.id_poda = pr.id_poda
                WHERE pm.es_extra = 1
                GROUP BY pr.id_nomina
            ) sub_p
            GROUP BY sub_p.id_nomina
        ) p ON p.id_nomina = nr.id_nomina_pilar
        WHERE nr.anio = ?
        ORDER BY nr.numero_semana ASC
    ";

    // preparar y ejecutar la consulta
    $stmt = mysqli_prepare($conexion, $sql);
    mysqli_stmt_bind_param($stmt, "i", $anio);
    mysqli_stmt_execute($stmt);
    $resultado = mysqli_stmt_get_result($stmt);

    // recorrer los resultados
    $semanas = [];
    while ($fila = mysqli_fetch_assoc($resultado)) {
        $semanas[] = [
            'numero_semana' => (int)$fila['numero_semana'],
            'total_percepciones' => (float)$fila['total_percepciones'],
            'total_deducciones' => (float)$fila['total_deducciones'],
            'total_nomina' => (float)$fila['total_nomina'],
            'total_corte' => (float)$fila['total_corte'],
            'total_poda' => (float)$fila['total_poda'],
            'total_neto' => (float)$fila['total_neto']
        ];
    }

    mysqli_stmt_close($stmt);

    // validar que existan datos
    if (empty($semanas)) {
        echo json_encode([
            "success" => false,
            "mensaje" => "No hay datos para el año seleccionado."
        ]);
        return;
    }

    //====================================================
    // CALCULAR CAMBIO VS SEMANA ANTERIOR
    //====================================================

    for ($i = 0; $i < count($semanas); $i++) {
        if ($i === 0) {
            // primera semana, no hay anterior
            $semanas[$i]['cambio_dinero'] = 0;
            $semanas[$i]['cambio_porcentaje'] = 0;
        } else {
            $anterior = $semanas[$i - 1]['total_neto'];
            $actual = $semanas[$i]['total_neto'];

            $cambio_dinero = $actual - $anterior;
            $cambio_porcentaje = 0;

            if ($anterior > 0) {
                $cambio_porcentaje = ($cambio_dinero / $anterior) * 100;
            }

            $semanas[$i]['cambio_dinero'] = $cambio_dinero;
            $semanas[$i]['cambio_porcentaje'] = $cambio_porcentaje;
        }
    }

    //====================================================
    // RESPUESTA CON LOS DATOS
    //====================================================

    echo json_encode([
        "success" => true,
        "semanas" => $semanas
    ]);
}
