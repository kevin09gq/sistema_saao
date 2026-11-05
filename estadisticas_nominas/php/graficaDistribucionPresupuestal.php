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

    // obtener datos individuales primero para evitar múltiples placeholders
    $nominas_simples = [
        '40 Lbs' => 'nomina_40lbs',
        '40 Lbs Jornal' => 'nomina_40lbs_jornal',
        '10 Lbs' => 'nomina_10lbs',
        'Confianza' => 'nomina_confianza'
    ];

    $distribucion = [];

    // obtener totales de nóminas simples
    foreach ($nominas_simples as $nombre => $tabla) {
        $sql = "SELECT COALESCE(SUM(total_neto), 0) AS total_anual FROM $tabla WHERE anio = ?";
        $stmt = mysqli_prepare($conexion, $sql);
        mysqli_stmt_bind_param($stmt, "i", $anio);
        mysqli_stmt_execute($stmt);
        $res = mysqli_stmt_get_result($stmt);
        $fila = mysqli_fetch_assoc($res);
        mysqli_stmt_close($stmt);

        $distribucion[] = [
            'nomina' => $nombre,
            'total_anual' => (float)($fila['total_anual'] ?? 0)
        ];
    }

    // obtener totales de nóminas agrícolas
    $ranchos = ['relicario', 'pilar', 'huasteca', 'palmilla'];
    $nombres_ranchos = ['Relicario', 'Pilar', 'Huasteca', 'Palmilla'];

    foreach ($ranchos as $i => $rancho) {
        $nombre = $nombres_ranchos[$i];

        $sql_agricola = "
            SELECT
                COALESCE(SUM(nr.total_neto), 0) +
                COALESCE((
                    SELECT SUM(cr.precio_reja * crt.rejas)
                    FROM cortes_{$rancho} cr
                    INNER JOIN cortes_{$rancho}_tablas crt ON crt.id_corte = cr.id
                    WHERE cr.id_nomina IN (SELECT id_nomina_{$rancho} FROM nomina_{$rancho} WHERE anio = ?)
                ), 0) +
                COALESCE((
                    SELECT SUM(nc.total)
                    FROM nomina_{$rancho}_corte nc
                    WHERE nc.id_nomina IN (SELECT id_nomina_{$rancho} FROM nomina_{$rancho} WHERE anio = ?)
                ), 0) +
                COALESCE((
                    SELECT SUM(pm.arboles_podados * pm.monto)
                    FROM podas_{$rancho} pr
                    INNER JOIN podas_movimientos_{$rancho} pm ON pm.id_poda = pr.id_poda
                    WHERE pr.id_nomina IN (SELECT id_nomina_{$rancho} FROM nomina_{$rancho} WHERE anio = ?)
                    AND (pm.es_extra = 0 OR pm.es_extra IS NULL)
                ), 0) +
                COALESCE((
                    SELECT SUM(pm.monto)
                    FROM podas_{$rancho} pr
                    INNER JOIN podas_movimientos_{$rancho} pm ON pm.id_poda = pr.id_poda
                    WHERE pr.id_nomina IN (SELECT id_nomina_{$rancho} FROM nomina_{$rancho} WHERE anio = ?)
                    AND pm.es_extra = 1
                ), 0) AS total_anual
            FROM nomina_{$rancho} nr
            WHERE nr.anio = ?
        ";

        $stmt = mysqli_prepare($conexion, $sql_agricola);
        mysqli_stmt_bind_param($stmt, "iiiii", $anio, $anio, $anio, $anio, $anio);
        mysqli_stmt_execute($stmt);
        $res = mysqli_stmt_get_result($stmt);
        $fila = mysqli_fetch_assoc($res);
        mysqli_stmt_close($stmt);

        $distribucion[] = [
            'nomina' => $nombre,
            'total_anual' => (float)($fila['total_anual'] ?? 0)
        ];
    }


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
