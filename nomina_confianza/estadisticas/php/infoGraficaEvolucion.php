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

    // consulta para obtener el total de cada semana
    $sql_evolucion = "
        SELECT
            numero_semana,
            total_neto AS total_semana
        FROM nomina_confianza
        WHERE anio = ?
        ORDER BY numero_semana ASC
    ";

    // preparar y ejecutar la consulta
    $stmt = mysqli_prepare($conexion, $sql_evolucion);
    mysqli_stmt_bind_param($stmt, "i", $anio);
    mysqli_stmt_execute($stmt);
    $resultado = mysqli_stmt_get_result($stmt);

    // recorrer los resultados y guardar en un array
    $evolucion = [];
    while ($fila = mysqli_fetch_assoc($resultado)) {
        $evolucion[] = $fila;
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
