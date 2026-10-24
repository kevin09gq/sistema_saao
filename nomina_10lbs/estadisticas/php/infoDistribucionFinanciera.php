<?php

require_once __DIR__ . "/../../../conexion/conexion.php";
/** @var mysqli $conexion */

$accion = $_POST['accion'] ?? $_GET['accion'] ?? '';

switch ($accion) {

    case 'obtenerDistribucion':
        obtenerDistribucion($conexion);
        break;

    default:
        echo json_encode([
            "success" => false,
            "mensaje" => "Acción no válida."
        ]);
        break;
}


//===========================================================
// FUNCIÓN PARA OBTENER LA DISTRIBUCIÓN FINANCIERA
//===========================================================

function obtenerDistribucion(mysqli $conexion)
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
    // OBTENER TOTALES ANUALES DE PERCEPCIONES Y DEDUCCIONES
    //====================================================

    // consulta para obtener totales anuales
    $sql = "
        SELECT
            COALESCE(SUM(total_percepciones), 0) AS total_percepciones,
            COALESCE(SUM(total_deducciones), 0) AS total_deducciones,
            COALESCE(SUM(total_neto), 0) AS total_neto
        FROM nomina_10lbs
        WHERE anio = ?
    ";

    // preparar y ejecutar la consulta
    $stmt = mysqli_prepare($conexion, $sql);
    mysqli_stmt_bind_param($stmt, "i", $anio);
    mysqli_stmt_execute($stmt);
    $resultado = mysqli_stmt_get_result($stmt);
    $fila = mysqli_fetch_assoc($resultado);
    mysqli_stmt_close($stmt);

    // validar que existan datos
    if (!$fila || ($fila['total_percepciones'] == 0 && $fila['total_neto'] == 0)) {
        echo json_encode([
            "success" => false,
            "mensaje" => "No hay datos para el año seleccionado."
        ]);
        return;
    }

    //====================================================
    // PREPARAR DISTRIBUCIÓN
    //====================================================

    $distribucion = [
        [
            'categoria' => 'Percepciones',
            'monto' => (float)$fila['total_percepciones']
        ],
        [
            'categoria' => 'Deducciones',
            'monto' => (float)$fila['total_deducciones']
        ],
        [
            'categoria' => 'Neto Pagado',
            'monto' => (float)$fila['total_neto']
        ]
    ];

    //====================================================
    // CALCULAR EL TOTAL Y PORCENTAJES
    //====================================================

    $total_anual = (float)$fila['total_percepciones'];

    foreach ($distribucion as &$item) {
        if ($total_anual > 0) {
            $item['porcentaje'] = ($item['monto'] / $total_anual) * 100;
        } else {
            $item['porcentaje'] = 0;
        }
    }

    //====================================================
    // RESPUESTA CON LA DISTRIBUCIÓN
    //====================================================

    // devolver la distribución en formato json
    echo json_encode([
        "success" => true,
        "distribucion" => $distribucion,
        "total_anual" => $total_anual
    ]);
}
