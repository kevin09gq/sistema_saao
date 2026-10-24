<?php

require_once __DIR__ . "/../../../conexion/conexion.php";
/** @var mysqli $conexion */

$accion = $_POST['accion'] ?? $_GET['accion'] ?? '';

switch ($accion) {

    case 'obtenerGastosPorDepartamento':
        obtenerGastosPorDepartamento($conexion);
        break;

    case 'obtenerGastosSemanal':
        obtenerGastosSemanal($conexion);
        break;

    default:
        echo json_encode([
            "success" => false,
            "mensaje" => "Acción no válida."
        ]);
        break;
}


//===========================================================
// FUNCIÓN PARA OBTENER GASTOS POR DEPARTAMENTO
//===========================================================

function obtenerGastosPorDepartamento(mysqli $conexion)
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
        SELECT nomina_confianza
        FROM nomina_confianza
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
        $json_data = $fila['nomina_confianza'];
        $data = json_decode($json_data, true);

        // validar que el JSON sea válido y tenga departamentos
        if ($data && isset($data['departamentos']) && is_array($data['departamentos'])) {
            foreach ($data['departamentos'] as $depto) {
                $id_departamento = $depto['id_departamento'];
                $id_empresa = $depto['id_empresa'] ?? 1;
                $nombre_departamento = $depto['nombre'];

                // clave única combinando departamento y empresa
                $clave_unica = $id_departamento . '_' . $id_empresa;

                // si el departamento no existe, crearlo
                if (!isset($departamentos[$clave_unica])) {
                    $departamentos[$clave_unica] = [
                        'id_departamento' => $id_departamento,
                        'id_empresa' => $id_empresa,
                        'nombre_departamento' => $nombre_departamento,
                        'total' => 0
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

                        $total_cobrar = (float)($empleado['total_cobrar'] ?? 0);
                        $departamentos[$clave_unica]['total'] += $total_cobrar;
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
    // IDENTIFICAR EL DEPARTAMENTO MÁS CARO
    //====================================================

    $departamento_mas_caro = null;
    $monto_max = 0;

    foreach ($departamentos as $depto) {
        if ($depto['total'] > $monto_max) {
            $monto_max = $depto['total'];
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
// FUNCIÓN PARA OBTENER EVOLUCIÓN DE GASTOS POR SEMANA
//===========================================================

function obtenerGastosSemanal(mysqli $conexion)
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
        SELECT numero_semana, nomina_confianza
        FROM nomina_confianza
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
    $departamentos_unicos = [];

    while ($fila = mysqli_fetch_assoc($resultado)) {
        $numero_semana = (int)$fila['numero_semana'];
        $json_data = $fila['nomina_confianza'];
        $data = json_decode($json_data, true);

        // inicializar datos de la semana sin sobrescribir otra empresa
        if (!isset($semanas[$numero_semana])) {
            $semanas[$numero_semana] = [
                'numero_semana' => $numero_semana,
                'departamentos' => []
            ];
        }

        // validar que el JSON sea válido y tenga departamentos
        if ($data && isset($data['departamentos']) && is_array($data['departamentos'])) {
            foreach ($data['departamentos'] as $depto) {
                $id_departamento = $depto['id_departamento'];
                $id_empresa = $depto['id_empresa'] ?? 1;
                $nombre_departamento = $depto['nombre'];
                $clave_unica = $id_departamento . '_' . $id_empresa;

                // guardar departamentos únicos
                if (!isset($departamentos_unicos[$clave_unica])) {
                    $departamentos_unicos[$clave_unica] = [
                        'id_departamento' => $id_departamento,
                        'id_empresa' => $id_empresa,
                        'nombre_departamento' => $nombre_departamento
                    ];
                }

                // inicializar datos del departamento en esta semana
                if (!isset($semanas[$numero_semana]['departamentos'][$clave_unica])) {
                    $semanas[$numero_semana]['departamentos'][$clave_unica] = [
                        'id_departamento' => $id_departamento,
                        'id_empresa' => $id_empresa,
                        'nombre_departamento' => $nombre_departamento,
                        'total' => 0
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

                        $total_cobrar = (float)($empleado['total_cobrar'] ?? 0);
                        $semanas[$numero_semana]['departamentos'][$clave_unica]['total'] += $total_cobrar;
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

    // convertir departamentos de cada semana a array
    foreach ($semanas as &$semana) {
        ksort($semana['departamentos']);
        $semana['departamentos'] = array_values($semana['departamentos']);
    }

    $semanas_array = array_values($semanas);

    // ordenar departamentos por empresa y departamento
    ksort($departamentos_unicos);
    $departamentos_array = [];
    foreach ($departamentos_unicos as $departamento) {
        $departamentos_array[] = $departamento;
    }

    //====================================================
    // RESPUESTA CON LOS DATOS
    //====================================================

    echo json_encode([
        "success" => true,
        "semanas" => $semanas_array,
        "departamentos" => $departamentos_array
    ]);
}
