<?php

require_once __DIR__ . "/../../../conexion/conexion.php";

//====================================================
// ENRUTADOR DE ACCIONES
//====================================================

$accion = $_POST['accion'] ?? $_GET['accion'] ?? '';

switch ($accion) {

    case 'obtenerAnios':
        obtenerAnios($conexion);
        break;

    case 'obtenerKpis':
        obtenerKpis($conexion);
        break;

    default:
        echo json_encode([
            "success" => false,
            "mensaje" => "Acción no válida."
        ]);
        break;
}


//====================================================
// FUNCION PARA OBTENER LOS AÑOS DISPONIBLES
//====================================================

function obtenerAnios(mysqli $conexion)
{
    // consulta para obtener años unicos de nomina_relicario
    $sql = "SELECT DISTINCT anio
            FROM nomina_relicario
            ORDER BY anio DESC";

    $resultado = mysqli_query($conexion, $sql);

    // validar ejecucion
    if (!$resultado) {
        echo json_encode([
            "success" => false,
            "mensaje" => "Error al obtener los años."
        ]);
        return;
    }

    // recorrer los resultados
    $anios = [];
    while ($fila = mysqli_fetch_assoc($resultado)) {
        $anios[] = $fila['anio'];
    }
    mysqli_free_result($resultado);

    // responder en formato json
    echo json_encode([
        "success" => true,
        "anios" => $anios
    ]);
}


//====================================================
// FUNCION PARA CALCULAR Y OBTENER LOS KPIS DEL AÑO
//====================================================

function obtenerKpis(mysqli $conexion)
{
    // recibir el año enviado
    $anio = (int)($_POST['anio'] ?? 0);

    // validar que se haya recibido el año
    if ($anio <= 0) {
        echo json_encode([
            "success" => false,
            "mensaje" => "No se recibió el año."
        ]);
        return;
    }

    // obtener totales semanales de nomina_relicario sumando corte y poda
    $sql = "
        SELECT 
            nr.numero_semana,
            (nr.total_neto + COALESCE(c.total_corte, 0) + COALESCE(p.total_poda, 0)) AS total_semana
        FROM nomina_relicario nr
        LEFT JOIN (
            SELECT 
                sub.id_nomina,
                SUM(sub.monto_corte) AS total_corte
            FROM (
                SELECT cr.id_nomina, SUM(crt.rejas * cr.precio_reja) AS monto_corte
                FROM cortes_relicario cr
                INNER JOIN cortes_relicario_tablas crt ON crt.id_corte = cr.id
                WHERE cr.estado = 1
                GROUP BY cr.id_nomina
                UNION ALL
                SELECT nc.id_nomina, SUM(nc.total) AS monto_corte
                FROM nomina_relicario_corte nc
                GROUP BY nc.id_nomina
            ) sub
            GROUP BY sub.id_nomina
        ) c ON c.id_nomina = nr.id_nomina_relicario
        LEFT JOIN (
            SELECT 
                sub_p.id_nomina,
                SUM(sub_p.monto_poda) AS total_poda
            FROM (
                SELECT pr.id_nomina, SUM(pm.arboles_podados * pm.monto) AS monto_poda
                FROM podas_relicario pr
                INNER JOIN podas_movimientos_relicario pm ON pm.id_poda = pr.id_poda
                WHERE pm.es_extra = 0 OR pm.es_extra IS NULL
                GROUP BY pr.id_nomina
                UNION ALL
                SELECT pr.id_nomina, SUM(pm.monto) AS monto_poda
                FROM podas_relicario pr
                INNER JOIN podas_movimientos_relicario pm ON pm.id_poda = pr.id_poda
                WHERE pm.es_extra = 1
                GROUP BY pr.id_nomina
            ) sub_p
            GROUP BY sub_p.id_nomina
        ) p ON p.id_nomina = nr.id_nomina_relicario
        WHERE nr.anio = ?
        ORDER BY nr.numero_semana ASC
    ";

    // ejecutar la consulta
    $stmt = mysqli_prepare($conexion, $sql);
    mysqli_stmt_bind_param($stmt, "i", $anio);
    mysqli_stmt_execute($stmt);
    $res = mysqli_stmt_get_result($stmt);

    // guardar los totales en un array por semana
    $semanas = [];
    while ($fila = mysqli_fetch_assoc($res)) {
        $semanas[(int)$fila['numero_semana']] = (float)$fila['total_semana'];
    }
    mysqli_stmt_close($stmt);

    // validar existencia de datos
    if (empty($semanas)) {
        echo json_encode([
            "success" => false,
            "mensaje" => "No hay datos para el año seleccionado."
        ]);
        return;
    }

    // obtener la ultima semana y su total
    $ultimaSemana = max(array_keys($semanas));
    $totalUltimaSemana = $semanas[$ultimaSemana] ?? 0.0;

    // obtener el total de la semana anterior
    $totalSemanaAnterior = $semanas[$ultimaSemana - 1] ?? 0.0;

    // buscar la semana mas cara y su monto
    $semanaMasCara = 0;
    $montoSemanaCara = -1.0;
    foreach ($semanas as $sem => $monto) {
        if ($monto > $montoSemanaCara) {
            $montoSemanaCara = $monto;
            $semanaMasCara = $sem;
        }
    }

    // buscar la semana mas baja y su monto
    $semanaMasBaja = 0;
    $montoSemanaBaja = PHP_FLOAT_MAX;
    foreach ($semanas as $sem => $monto) {
        if ($monto < $montoSemanaBaja) {
            $montoSemanaBaja = $monto;
            $semanaMasBaja = $sem;
        }
    }

    // calcular acumulado anual y promedio semanal
    $acumuladoAnual = array_sum($semanas);
    $promedioSemanal = $acumuladoAnual / count($semanas);

    // calcular diferencia entre ultima y anterior
    $diferenciaUltimaAnterior = $totalUltimaSemana - $totalSemanaAnterior;
    $porcentajeDiferencia = 0;
    if ($totalSemanaAnterior > 0) {
        $porcentajeDiferencia = ($diferenciaUltimaAnterior / $totalSemanaAnterior) * 100;
    }

    // devolver respuesta con los kpis
    echo json_encode([
        "success" => true,
        "kpis" => [
            "ultima_semana"              => $ultimaSemana,
            "total_ultima_semana"        => $totalUltimaSemana,
            "total_semana_anterior"      => $totalSemanaAnterior,
            "diferencia_ultima_anterior" => $diferenciaUltimaAnterior,
            "porcentaje_diferencia"      => $porcentajeDiferencia,
            "semana_mas_cara"            => $semanaMasCara,
            "monto_semana_cara"          => $montoSemanaCara,
            "semana_mas_baja"            => $semanaMasBaja,
            "monto_semana_baja"          => $montoSemanaBaja,
            "promedio_semanal"           => $promedioSemanal,
            "acumulado_anual"            => $acumuladoAnual
        ]
    ]);
}
