<?php

require_once __DIR__ . "/../../../conexion/conexion.php";
/** @var mysqli $conexion */

$accion = $_POST['accion'] ?? $_GET['accion'] ?? '';

switch ($accion) {

    case 'obtenerSeguroSocialPorDepartamento':
        obtenerSeguroSocialPorDepartamento($conexion);
        break;

    case 'obtenerSeguroSocialSemanal':
        obtenerSeguroSocialSemanal($conexion);
        break;

    default:
        echo json_encode([
            "success" => false,
            "mensaje" => "Acción no válida."
        ]);
        break;
}


//===========================================================
// FUNCIÓN PARA OBTENER COSTO DE SEGURO SOCIAL POR DEPARTAMENTO
//===========================================================

function obtenerSeguroSocialPorDepartamento(mysqli $conexion)
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
    // OBTENER TODOS LOS REGISTROS DEL AÑO Y PROCESAR JSON
    //====================================================

    // consulta para obtener todos los registros JSON del año
    $sql = "
        SELECT nomina_10lbs
        FROM nomina_10lbs
        WHERE anio = ?
    ";

    // preparar y ejecutar la consulta
    $stmt = mysqli_prepare($conexion, $sql);
    mysqli_stmt_bind_param($stmt, "i", $anio);
    mysqli_stmt_execute($stmt);
    $resultado = mysqli_stmt_get_result($stmt);

    // recorrer los resultados y procesar cada JSON
    $departamentos = [];
    while ($fila = mysqli_fetch_assoc($resultado)) {
        $json_data = $fila['nomina_10lbs'];
        $data = json_decode($json_data, true);

        // validar que el JSON sea válido y tenga departamentos
        if ($data && isset($data['departamentos']) && is_array($data['departamentos'])) {
            foreach ($data['departamentos'] as $depto) {
                $id_departamento = $depto['id_departamento'];
                $nombre_departamento = $depto['nombre'];

                // si el departamento no existe, crearlo
                if (!isset($departamentos[$id_departamento])) {
                    $departamentos[$id_departamento] = [
                        'id_departamento' => $id_departamento,
                        'nombre_departamento' => $nombre_departamento,
                        'con_seguro' => 0,
                        'sin_seguro' => 0
                    ];
                }

                // recorrer los empleados del departamento
                if (isset($depto['empleados']) && is_array($depto['empleados'])) {
                    foreach ($depto['empleados'] as $empleado) {
                        // solo tomar en cuenta empleados con mostrar = true
                        $mostrar = $empleado['mostrar'] ?? false;
                        if (!$mostrar) {
                            continue;
                        }

                        $seguro_social = $empleado['seguroSocial'] ?? false;
                        $total_cobrar = (float)($empleado['total_cobrar'] ?? 0);

                        // asignar el total según si tiene seguro social o no
                        if ($seguro_social) {
                            $departamentos[$id_departamento]['con_seguro'] += $total_cobrar;
                        } else {
                            $departamentos[$id_departamento]['sin_seguro'] += $total_cobrar;
                        }
                    }
                }
            }
        }
    }

    mysqli_stmt_close($stmt);

    // validar que existan datos
    if (empty($departamentos)) {
        echo json_encode([
            "success" => false,
            "mensaje" => "No hay datos para el año seleccionado."
        ]);
        return;
    }

    //====================================================
    // IDENTIFICAR EL DEPARTAMENTO MÁS CARO (CON SEGURO + SIN SEGURO)
    //====================================================

    $departamento_mas_caro = null;
    $monto_max = 0;

    foreach ($departamentos as $depto) {
        $total_depto = $depto['con_seguro'] + $depto['sin_seguro'];
        if ($total_depto > $monto_max) {
            $monto_max = $total_depto;
            $departamento_mas_caro = $depto['nombre_departamento'];
        }
    }

    //====================================================
    // CONVERTIR A ARRAY INDEXADO
    //====================================================

    $departamentos_array = array_values($departamentos);

    //====================================================
    // RESPUESTA CON LOS DATOS
    //====================================================

    echo json_encode([
        "success" => true,
        "departamentos" => $departamentos_array,
        "departamento_mas_caro" => $departamento_mas_caro,
        "monto_max" => $monto_max
    ]);
}


//===========================================================
// FUNCIÓN PARA OBTENER EVOLUCIÓN DE SEGURO SOCIAL POR SEMANA
//===========================================================

function obtenerSeguroSocialSemanal(mysqli $conexion)
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
    // OBTENER TODOS LOS REGISTROS DEL AÑO Y PROCESAR JSON
    //====================================================

    // consulta para obtener todos los registros JSON del año
    $sql = "
        SELECT numero_semana, nomina_10lbs
        FROM nomina_10lbs
        WHERE anio = ?
        ORDER BY numero_semana ASC
    ";

    // preparar y ejecutar la consulta
    $stmt = mysqli_prepare($conexion, $sql);
    mysqli_stmt_bind_param($stmt, "i", $anio);
    mysqli_stmt_execute($stmt);
    $resultado = mysqli_stmt_get_result($stmt);

    // recorrer los resultados y procesar cada JSON
    $semanas = [];
    while ($fila = mysqli_fetch_assoc($resultado)) {
        $numero_semana = (int)$fila['numero_semana'];
        $json_data = $fila['nomina_10lbs'];
        $data = json_decode($json_data, true);

        // inicializar datos de la semana
        $semanas[$numero_semana] = [
            'numero_semana' => $numero_semana,
            'con_seguro' => 0,
            'sin_seguro' => 0
        ];

        // validar que el JSON sea válido y tenga departamentos
        if ($data && isset($data['departamentos']) && is_array($data['departamentos'])) {
            foreach ($data['departamentos'] as $depto) {
                // recorrer los empleados del departamento
                if (isset($depto['empleados']) && is_array($depto['empleados'])) {
                    foreach ($depto['empleados'] as $empleado) {
                        // solo tomar en cuenta empleados con mostrar = true
                        $mostrar = $empleado['mostrar'] ?? false;
                        if (!$mostrar) {
                            continue;
                        }

                        $seguro_social = $empleado['seguroSocial'] ?? false;
                        $total_cobrar = (float)($empleado['total_cobrar'] ?? 0);

                        // asignar el total según si tiene seguro social o no
                        if ($seguro_social) {
                            $semanas[$numero_semana]['con_seguro'] += $total_cobrar;
                        } else {
                            $semanas[$numero_semana]['sin_seguro'] += $total_cobrar;
                        }
                    }
                }
            }
        }
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
    // CONVERTIR A ARRAY INDEXADO Y ORDENAR
    //====================================================

    ksort($semanas);
    $semanas_array = array_values($semanas);

    //====================================================
    // RESPUESTA CON LOS DATOS
    //====================================================

    echo json_encode([
        "success" => true,
        "semanas" => $semanas_array
    ]);
}
