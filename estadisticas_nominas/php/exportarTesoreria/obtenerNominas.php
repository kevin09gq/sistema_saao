<?php

require_once __DIR__ . "/../../../conexion/conexion.php";

/** @var mysqli $conexion */

$accion = $_POST['accion'] ?? $_GET['accion'] ?? '';

switch ($accion) {

    case 'obtenerAnios':
        obtenerAnios($conexion);
        break;

    case 'obtenerSemanas':
        obtenerSemanas($conexion);
        break;

    case 'obtenerNominas':
        obtenerNominas($conexion);
        break;

    default:
        echo json_encode([
            "success" => false,
            "mensaje" => "Acción no válida."
        ]);
        break;
}



//===========================================================
// FUNCIÓN PARA OBTENER LAS NÓMINAS DE LAS 8 TABLAS
//===========================================================

function obtenerNominas(mysqli $conexion)
{
    // Obtener el año y la semana desde POST
    $anio = $_POST['anio'] ?? '';
    $semana = $_POST['semana'] ?? '';

    // Validar el año
    if (empty($anio)) {
        echo json_encode([
            "success" => false,
            "mensaje" => "No se recibió el año."
        ]);
        return;
    }

    // ================================================
    // 1. DETERMINAR LA SEMANA A CONSULTAR
    // ================================================

    if (!empty($semana)) {

        $semana_seleccionada = (int) $semana;

    } else {

        $sql_ultima_semana = "
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
            ) AS todas_semanas
        ";

        $stmt = mysqli_prepare($conexion, $sql_ultima_semana);

        mysqli_stmt_bind_param(
            $stmt,
            "iiiiiiii",
            $anio,
            $anio,
            $anio,
            $anio,
            $anio,
            $anio,
            $anio,
            $anio
        );

        mysqli_stmt_execute($stmt);

        $resultado = mysqli_stmt_get_result($stmt);
        $fila_ultima = mysqli_fetch_assoc($resultado);

        mysqli_stmt_close($stmt);

        $semana_seleccionada = (int) ($fila_ultima['ultima_semana'] ?? 0);
    }

    // Validar que exista una semana
    if ($semana_seleccionada <= 0) {
        echo json_encode([
            "success" => false,
            "mensaje" => "No hay datos para el año o semana seleccionada."
        ]);
        return;
    }

    // ================================================
    // 2. DEFINIR LAS TABLAS DE NÓMINAS
    // ================================================

    $nominas = [
        'nomina_confianza' => 'nomina_confianza',
        'nomina_40lbs' => 'nomina_40lbs',
        'nomina_40lbs_jornal' => 'nomina_40lbs_jornal',
        'nomina_10lbs' => 'nomina_10lbs',
        'nomina_relicario' => 'nomina_relicario',
        'nomina_pilar' => 'nomina_pilar',
        'nomina_huasteca' => 'nomina_huasteca',
        'nomina_palmilla' => 'nomina_palmilla'
    ];

    // ================================================
    // 3. OBTENER ÚNICAMENTE EL JSON DE CADA NÓMINA
    // ================================================

    $datos_completos = [];

    foreach ($nominas as $tabla => $columna_json) {

        $sql = "SELECT `$columna_json`
                FROM `$tabla`
                WHERE anio = ? AND numero_semana = ?";

        $stmt = mysqli_prepare($conexion, $sql);

        mysqli_stmt_bind_param(
            $stmt,
            "ii",
            $anio,
            $semana_seleccionada
        );

        mysqli_stmt_execute($stmt);

        $resultado = mysqli_stmt_get_result($stmt);
        $fila = mysqli_fetch_assoc($resultado);

        mysqli_stmt_close($stmt);

        if ($fila) {

            $datos_completos[$tabla] = json_decode(
                $fila[$columna_json],
                true
            );

        } else {

            $datos_completos[$tabla] = null;

        }
    }

    // ================================================
    // 4. OBTENER TOTALES DE CORTES Y PODAS POR RANCHO
    // ================================================

    $ranchos = ['relicario', 'pilar', 'huasteca', 'palmilla'];
    $cortes_podas = [];

    foreach ($ranchos as $rancho) {

        $sql_cp = "
            SELECT
                (COALESCE(c.total_cortes, 0) + COALESCE(p.total_podas, 0)) AS sueldo_bruto,
                COALESCE(c.total_cortes, 0) AS total_cortes,
                COALESCE(p.total_podas, 0) AS total_podas,
                COALESCE(p.total_cabos, 0) AS total_cabos
            FROM `nomina_{$rancho}` n
            LEFT JOIN (
                SELECT
                    cr.id_nomina,
                    SUM(ct.rejas * cr.precio_reja) AS total_cortes
                FROM `cortes_{$rancho}` cr
                INNER JOIN `cortes_{$rancho}_tablas` ct
                    ON ct.id_corte = cr.id
                WHERE cr.estado = 1
                GROUP BY cr.id_nomina
            ) c ON c.id_nomina = n.`id_nomina_{$rancho}`
            LEFT JOIN (
                SELECT
                    po.id_nomina,
                    SUM(pm.arboles_podados * pm.monto) AS total_podas,
                    COUNT(DISTINCT po.id_poda) AS total_cabos
                FROM `podas_{$rancho}` po
                INNER JOIN `podas_movimientos_{$rancho}` pm
                    ON pm.id_poda = po.id_poda
                GROUP BY po.id_nomina
            ) p ON p.id_nomina = n.`id_nomina_{$rancho}`
            WHERE n.anio = ? AND n.numero_semana = ?
            LIMIT 1
        ";

        $stmt_cp = mysqli_prepare($conexion, $sql_cp);
        if ($stmt_cp) {
            mysqli_stmt_bind_param($stmt_cp, "ii", $anio, $semana_seleccionada);
            mysqli_stmt_execute($stmt_cp);
            $res_cp = mysqli_stmt_get_result($stmt_cp);
            $fila_cp = mysqli_fetch_assoc($res_cp);
            mysqli_stmt_close($stmt_cp);

            $cortes_podas["nomina_{$rancho}"] = [
                'sueldo_bruto' => (float) ($fila_cp['sueldo_bruto'] ?? 0),
                'total_cortes' => (float) ($fila_cp['total_cortes'] ?? 0),
                'total_podas'  => (float) ($fila_cp['total_podas'] ?? 0),
                'total_cabos'  => (int) ($fila_cp['total_cabos'] ?? 0)
            ];
        } else {
            $cortes_podas["nomina_{$rancho}"] = [
                'sueldo_bruto' => 0,
                'total_cortes' => 0,
                'total_podas'  => 0
            ];
        }
    }

    // ================================================
    // 5. DEVOLVER LAS NÓMINAS Y TOTALES DE CORTES/PODAS
    // ================================================

    echo json_encode([
        "success"      => true,
        "mensaje"      => "Nóminas obtenidas exitosamente.",
        "datos"        => $datos_completos,
        "cortes_podas" => $cortes_podas
    ], JSON_UNESCAPED_UNICODE);
}


//===========================================================
// FUNCIÓN PARA OBTENER LOS AÑOS DE LAS NÓMINAS
//===========================================================

function obtenerAnios(mysqli $conexion)
{
    // consulta para obtener los años distintos de las 8 nóminas
    $sql = "
        SELECT DISTINCT anio
        FROM nomina_40lbs
        UNION
        SELECT DISTINCT anio FROM nomina_40lbs_jornal
        UNION
        SELECT DISTINCT anio FROM nomina_10lbs
        UNION
        SELECT DISTINCT anio FROM nomina_confianza
        UNION
        SELECT DISTINCT anio FROM nomina_relicario
        UNION
        SELECT DISTINCT anio FROM nomina_pilar
        UNION
        SELECT DISTINCT anio FROM nomina_huasteca
        UNION
        SELECT DISTINCT anio FROM nomina_palmilla
        ORDER BY anio DESC
    ";

    $resultado = mysqli_query($conexion, $sql);

    $anios = [];
    while ($fila = mysqli_fetch_assoc($resultado)) {
        $anios[] = $fila['anio'];
    }

    // devolver los años en formato json
    echo json_encode([
        "success" => true,
        "datos" => $anios
    ]);
}


//===========================================================
// FUNCIÓN PARA OBTENER LAS SEMANAS DE UN AÑO
//===========================================================

function obtenerSemanas(mysqli $conexion)
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

    // consulta para obtener las semanas distintas del año
    $sql = "
        SELECT DISTINCT numero_semana
        FROM nomina_40lbs
        WHERE anio = ?
        UNION
        SELECT DISTINCT numero_semana FROM nomina_40lbs_jornal WHERE anio = ?
        UNION
        SELECT DISTINCT numero_semana FROM nomina_10lbs WHERE anio = ?
        UNION
        SELECT DISTINCT numero_semana FROM nomina_confianza WHERE anio = ?
        UNION
        SELECT DISTINCT numero_semana FROM nomina_relicario WHERE anio = ?
        UNION
        SELECT DISTINCT numero_semana FROM nomina_pilar WHERE anio = ?
        UNION
        SELECT DISTINCT numero_semana FROM nomina_huasteca WHERE anio = ?
        UNION
        SELECT DISTINCT numero_semana FROM nomina_palmilla WHERE anio = ?
        ORDER BY numero_semana DESC
    ";

    $stmt = mysqli_prepare($conexion, $sql);
    mysqli_stmt_bind_param($stmt, "iiiiiiii", $anio, $anio, $anio, $anio, $anio, $anio, $anio, $anio);
    mysqli_stmt_execute($stmt);
    $resultado = mysqli_stmt_get_result($stmt);

    $semanas = [];
    while ($fila = mysqli_fetch_assoc($resultado)) {
        $semanas[] = $fila['numero_semana'];
    }

    mysqli_stmt_close($stmt);

    // devolver las semanas en formato json
    echo json_encode([
        "success" => true,
        "datos" => $semanas
    ]);
}
