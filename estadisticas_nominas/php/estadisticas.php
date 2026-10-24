<?php

require_once __DIR__ . "/../../conexion/conexion.php";

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


//====================================================
// FUNCION PARA ARMAR LA CONSULTA DE NOMINAS SIMPLES
//====================================================

function armarConsultaNominaSimple(string $tabla, bool $conSemana = false, bool $filtroSemana = false): string
{
    // definir si se incluye la columna de semana
    $colSemana = $conSemana ? "numero_semana, " : "";

    // definir si se filtra por numero de semana
    $whereSemana = $filtroSemana ? " AND numero_semana = ?" : "";

    // retornar la consulta estructurada
    return "SELECT {$colSemana}total_neto AS total FROM {$tabla} WHERE anio = ?{$whereSemana}";
}


//====================================================
// FUNCION PARA ARMAR LA CONSULTA DE NOMINAS AGRICOLAS
//====================================================

function armarConsultaNominaAgricola(string $huerta, bool $conSemana = false, bool $filtroSemana = false): string
{
    // definir columna y filtro de semana
    $colSemana   = $conSemana ? "n.numero_semana, " : "";
    $whereSemana = $filtroSemana ? " AND n.numero_semana = ?" : "";
    $idCol       = "id_nomina_{$huerta}";

    // retornar la consulta sumando neto cortes y podas
    return "
        SELECT
            {$colSemana}
            COALESCE(n.total_neto, 0) +
            COALESCE((
                SELECT SUM(c.precio_reja * ct.rejas)
                FROM cortes_{$huerta} c
                INNER JOIN cortes_{$huerta}_tablas ct ON ct.id_corte = c.id
                WHERE c.id_nomina = n.{$idCol}
            ), 0) +
            COALESCE((
                SELECT SUM(pm.arboles_podados * pm.monto)
                FROM podas_{$huerta} p
                INNER JOIN podas_movimientos_{$huerta} pm ON pm.id_poda = p.id_poda
                WHERE p.id_nomina = n.{$idCol}
            ), 0) AS total
        FROM nomina_{$huerta} n
        WHERE n.anio = ?{$whereSemana}
    ";
}


//====================================================
// FUNCION PARA OBTENER LA ULTIMA SEMANA REGISTRADA
//====================================================

function obtenerUltimaSemana(mysqli $conexion, int $anio): int
{
    // consulta unificada para obtener la semana maxima
    $sql = "
        SELECT MAX(numero_semana) AS ultima_semana
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
        ) AS semanas
    ";

    // preparar y ejecutar la consulta
    $stmt = mysqli_prepare($conexion, $sql);
    mysqli_stmt_bind_param($stmt, "iiiiiiii", $anio, $anio, $anio, $anio, $anio, $anio, $anio, $anio);
    mysqli_stmt_execute($stmt);
    $res = mysqli_stmt_get_result($stmt);
    $fila = mysqli_fetch_assoc($res);
    mysqli_stmt_close($stmt);

    // retornar la ultima semana o cero si no hay
    return (int)($fila['ultima_semana'] ?? 0);
}


//====================================================
// FUNCION PARA OBTENER LOS TOTALES SEMANALES DEL AÑO
//====================================================

function obtenerTotalesPorSemana(mysqli $conexion, int $anio): array
{
    // armar subconsultas de las 8 nominas agrupadas por semana
    $subconsultas = [
        armarConsultaNominaSimple('nomina_40lbs', true),
        armarConsultaNominaSimple('nomina_40lbs_jornal', true),
        armarConsultaNominaSimple('nomina_10lbs', true),
        armarConsultaNominaSimple('nomina_confianza', true),
        armarConsultaNominaAgricola('relicario', true),
        armarConsultaNominaAgricola('pilar', true),
        armarConsultaNominaAgricola('huasteca', true),
        armarConsultaNominaAgricola('palmilla', true),
    ];

    // unir todas las subconsultas en una sola
    $sql = "
        SELECT
            numero_semana,
            SUM(total) AS total_semana
        FROM (
            " . implode("\n UNION ALL \n", $subconsultas) . "
        ) AS consolidado
        GROUP BY numero_semana
        ORDER BY numero_semana ASC
    ";

    // ejecutar la consulta
    $stmt = mysqli_prepare($conexion, $sql);
    mysqli_stmt_bind_param($stmt, "iiiiiiii", $anio, $anio, $anio, $anio, $anio, $anio, $anio, $anio);
    mysqli_stmt_execute($stmt);
    $res = mysqli_stmt_get_result($stmt);

    // guardar los totales en un array por semana
    $totales = [];
    while ($fila = mysqli_fetch_assoc($res)) {
        $totales[(int)$fila['numero_semana']] = (float)$fila['total_semana'];
    }
    mysqli_stmt_close($stmt);

    return $totales;
}


//====================================================
// FUNCION PARA OBTENER LOS AÑOS DISPONIBLES
//====================================================

function obtenerAnios(mysqli $conexion)
{
    // consulta para obtener años unicos de las nominas
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

    // obtener totales semanales en una sola consulta
    $semanas = obtenerTotalesPorSemana($conexion, $anio);

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

    // calcular acumulado anual y promedio semanal
    $acumuladoAnual = array_sum($semanas);
    $promedioSemanal = $acumuladoAnual / count($semanas);

    // devolver respuesta con los kpis
    echo json_encode([
        "success" => true,
        "kpis" => [
            "ultima_semana"         => $ultimaSemana,
            "total_ultima_semana"   => $totalUltimaSemana,
            "total_semana_anterior" => $totalSemanaAnterior,
            "semana_mas_cara"       => $semanaMasCara,
            "monto_semana_cara"     => $montoSemanaCara,
            "promedio_semanal"      => $promedioSemanal,
            "acumulado_anual"       => $acumuladoAnual
        ]
    ]);
}


//====================================================
// FUNCION PARA OBTENER EL DESGLOSE DE LA ULTIMA SEMANA
//====================================================

function obtenerDesgloseUltimaSemana(mysqli $conexion)
{
    // recibir el año enviado
    $anio = (int)($_POST['anio'] ?? 0);

    // validar el año recibido
    if ($anio <= 0) {
        echo json_encode([
            "success" => false,
            "mensaje" => "No se recibió el año."
        ]);
        return;
    }

    // obtener la ultima semana con la funcion auxiliar
    $ultimaSemana = obtenerUltimaSemana($conexion, $anio);

    // validar si se encontro ultima semana
    if ($ultimaSemana === 0) {
        echo json_encode([
            "success" => false,
            "mensaje" => "No hay datos para el año seleccionado."
        ]);
        return;
    }

    // consulta de desglose para cada una de las 8 nominas
    $sqlDesglose = "
        SELECT '40 Lbs' AS nomina, COALESCE((" . armarConsultaNominaSimple('nomina_40lbs', false, true) . "), 0) AS monto
        UNION ALL
        SELECT '40 Lbs Jornal' AS nomina, COALESCE((" . armarConsultaNominaSimple('nomina_40lbs_jornal', false, true) . "), 0) AS monto
        UNION ALL
        SELECT '10 Lbs' AS nomina, COALESCE((" . armarConsultaNominaSimple('nomina_10lbs', false, true) . "), 0) AS monto
        UNION ALL
        SELECT 'Confianza' AS nomina, COALESCE((" . armarConsultaNominaSimple('nomina_confianza', false, true) . "), 0) AS monto
        UNION ALL
        SELECT 'Relicario' AS nomina, COALESCE((" . armarConsultaNominaAgricola('relicario', false, true) . "), 0) AS monto
        UNION ALL
        SELECT 'Pilar' AS nomina, COALESCE((" . armarConsultaNominaAgricola('pilar', false, true) . "), 0) AS monto
        UNION ALL
        SELECT 'Huasteca' AS nomina, COALESCE((" . armarConsultaNominaAgricola('huasteca', false, true) . "), 0) AS monto
        UNION ALL
        SELECT 'Palmilla' AS nomina, COALESCE((" . armarConsultaNominaAgricola('palmilla', false, true) . "), 0) AS monto
    ";

    // preparar y ejecutar con año y semana para cada nomina
    $stmt = mysqli_prepare($conexion, $sqlDesglose);
    mysqli_stmt_bind_param(
        $stmt,
        "iiiiiiiiiiiiiiii",
        $anio, $ultimaSemana,
        $anio, $ultimaSemana,
        $anio, $ultimaSemana,
        $anio, $ultimaSemana,
        $anio, $ultimaSemana,
        $anio, $ultimaSemana,
        $anio, $ultimaSemana,
        $anio, $ultimaSemana
    );
    mysqli_stmt_execute($stmt);
    $resultado = mysqli_stmt_get_result($stmt);

    // procesar resultados y calcular total consolidado
    $desglose = [];
    $totalConsolidado = 0.0;
    while ($fila = mysqli_fetch_assoc($resultado)) {
        $fila['monto'] = (float)$fila['monto'];
        $totalConsolidado += $fila['monto'];
        $desglose[] = $fila;
    }
    mysqli_stmt_close($stmt);

    // calcular porcentaje por cada nomina
    foreach ($desglose as &$item) {
        $item['porcentaje'] = $totalConsolidado > 0
            ? ($item['monto'] / $totalConsolidado) * 100
            : 0;
    }
    unset($item);

    // responder en formato json
    echo json_encode([
        "success"           => true,
        "desglose"          => $desglose,
        "total_consolidado" => $totalConsolidado,
        "ultima_semana"     => $ultimaSemana
    ]);
}