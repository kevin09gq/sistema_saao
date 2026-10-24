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
            numero_semana,
            total_percepciones,
            total_deducciones,
            total_neto
        FROM nomina_40lbs
        WHERE anio = ?
        ORDER BY numero_semana ASC
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
