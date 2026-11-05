<?php

require_once __DIR__ . "/../../../conexion/conexion.php";
/** @var mysqli $conexion */

$accion = $_POST['accion'] ?? $_GET['accion'] ?? '';

switch ($accion) {

    case 'obtenerDistribucion':
    case 'obtenerComparativoCortePoda':
        obtenerComparativoCortePoda($conexion);
        break;

    default:
        echo json_encode([
            "success" => false,
            "mensaje" => "Acción no válida."
        ]);
        break;
}


//===========================================================
// FUNCIÓN PARA OBTENER EL COMPARATIVO DE CORTE Y PODA
//===========================================================

function obtenerComparativoCortePoda(mysqli $conexion)
{
    // obtener el año desde el post
    $anio = (int)($_POST['anio'] ?? 0);

    // validar que se haya recibido el año
    if ($anio <= 0) {
        echo json_encode([
            "success" => false,
            "mensaje" => "No se recibió el año."
        ]);
        return;
    }

    //====================================================
    // OBTENER TOTALES ANUALES DE CORTE Y PODA
    //====================================================

    $sql = "
        SELECT
            COALESCE((
                SELECT SUM(crt.rejas * cr.precio_reja)
                FROM cortes_pilar cr
                INNER JOIN cortes_pilar_tablas crt ON crt.id_corte = cr.id
                WHERE cr.estado = 1 
                  AND cr.id_nomina IN (SELECT id_nomina_pilar FROM nomina_pilar WHERE anio = ?)
            ), 0) +
            COALESCE((
                SELECT SUM(nc.total)
                FROM nomina_pilar_corte nc
                WHERE nc.id_nomina IN (SELECT id_nomina_pilar FROM nomina_pilar WHERE anio = ?)
            ), 0) AS total_corte,

            COALESCE((
                SELECT SUM(pm.arboles_podados * pm.monto)
                FROM podas_pilar pr
                INNER JOIN podas_movimientos_pilar pm ON pm.id_poda = pr.id_poda
                WHERE (pm.es_extra = 0 OR pm.es_extra IS NULL)
                  AND pr.id_nomina IN (SELECT id_nomina_pilar FROM nomina_pilar WHERE anio = ?)
            ), 0) +
            COALESCE((
                SELECT SUM(pm.monto)
                FROM podas_pilar pr
                INNER JOIN podas_movimientos_pilar pm ON pm.id_poda = pr.id_poda
                WHERE pm.es_extra = 1
                  AND pr.id_nomina IN (SELECT id_nomina_pilar FROM nomina_pilar WHERE anio = ?)
            ), 0) AS total_poda
    ";

    $stmt = mysqli_prepare($conexion, $sql);
    mysqli_stmt_bind_param($stmt, "iiii", $anio, $anio, $anio, $anio);
    mysqli_stmt_execute($stmt);
    $resultado = mysqli_stmt_get_result($stmt);
    $fila = mysqli_fetch_assoc($resultado);
    mysqli_stmt_close($stmt);

    $total_corte = (float)($fila['total_corte'] ?? 0);
    $total_poda = (float)($fila['total_poda'] ?? 0);
    $total_anual = $total_corte + $total_poda;

    $porcentaje_corte = $total_anual > 0 ? ($total_corte / $total_anual) * 100 : 0;
    $porcentaje_poda = $total_anual > 0 ? ($total_poda / $total_anual) * 100 : 0;

    $distribucion = [
        [
            'categoria' => 'Corte',
            'monto' => $total_corte,
            'porcentaje' => $porcentaje_corte
        ],
        [
            'categoria' => 'Poda',
            'monto' => $total_poda,
            'porcentaje' => $porcentaje_poda
        ]
    ];

    echo json_encode([
        "success" => true,
        "distribucion" => $distribucion,
        "total_corte" => $total_corte,
        "total_poda" => $total_poda,
        "total_anual" => $total_anual
    ]);
}
