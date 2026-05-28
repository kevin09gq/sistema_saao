<?php
include("../../conexion/conexion.php");

/** @var mysqli $conexion */
$action = $_POST['action'] ?? '';

switch ($action) {
    case 'guardarPrimaVacacional':
        guardarPrimaVacacional($conexion);
        break;
    case 'obtenerKardexConPrima':
        obtenerKardexConPrima($conexion);
        break;
    default:
        echo json_encode(['success' => false, 'message' => 'Acción no válida.']);
        break;
}

//==============================
// GUARDA EL REGISTRO DE PRIMA VACACIONAL EN LA BASE DE DATOS
//==============================
function guardarPrimaVacacional($conexion)
{
    // Recoger y sanitizar los campos del formulario
    $id_empleado        = intval($_POST['id_empleado'] ?? 0);
    $id_kardex          = intval($_POST['id_kardex'] ?? 0);
    $numero_semana      = intval($_POST['numero_semana'] ?? 0);
    $anio               = intval($_POST['anio'] ?? 0);
    $fecha_pago         = mysqli_real_escape_string($conexion, $_POST['fecha_pago'] ?? '');
    $fecha_inicio       = mysqli_real_escape_string($conexion, $_POST['fecha_inicio'] ?? '');
    $fecha_fin          = mysqli_real_escape_string($conexion, $_POST['fecha_fin'] ?? '');
    $dias_vacaciones    = floatval($_POST['dias_vacaciones'] ?? 0);
    $domingos           = intval($_POST['domingos'] ?? 0);
    $festivos           = intval($_POST['festivos'] ?? 0);
    $salario_diario     = floatval($_POST['salario_diario'] ?? 0);
    $porcentaje_prima   = floatval($_POST['porcentaje_prima'] ?? 0);
    $monto_prima_vacacional = floatval($_POST['monto_prima_vacacional'] ?? 0);
    $dispersion_tarjeta = floatval($_POST['dispersion_tarjeta'] ?? 0);
    $isr                = floatval($_POST['isr'] ?? 0);
    $total_pagado       = floatval($_POST['total_pagado'] ?? 0);
    $observaciones      = mysqli_real_escape_string($conexion, $_POST['observaciones'] ?? '');

    // Validaciones básicas
    if ($id_empleado <= 0) {
        echo json_encode(['success' => false, 'message' => 'ID de empleado no válido.']);
        return;
    }

    if ($id_kardex <= 0) {
        echo json_encode(['success' => false, 'message' => 'Debe seleccionar un movimiento de vacaciones.']);
        return;
    }

    if (empty($fecha_pago) || empty($fecha_inicio) || empty($fecha_fin)) {
        echo json_encode(['success' => false, 'message' => 'Las fechas son obligatorias.']);
        return;
    }

    // Verificar que no exista ya un registro para este kardex
    $sql_check = "SELECT id_prima_empleado FROM prima_vacacional_empleados WHERE id_kardex = '$id_kardex'";
    $res_check = mysqli_query($conexion, $sql_check);

    if ($res_check && mysqli_num_rows($res_check) > 0) {
        echo json_encode(['success' => false, 'message' => 'Ya existe un registro de prima vacacional para este movimiento.']);
        return;
    }

    // Insertar en la base de datos
    $sql = "INSERT INTO prima_vacacional_empleados 
            (id_empleado, id_kardex, numero_semana, anio, fecha_pago, fecha_inicio, fecha_fin, 
             dias_vacaciones, domingos, festivos, salario_diario, porcentaje_prima, 
             monto_prima_vacacional, dispersion_tarjeta, isr, total_pagado, observaciones)
            VALUES 
            ('$id_empleado', '$id_kardex', '$numero_semana', '$anio', '$fecha_pago', '$fecha_inicio', '$fecha_fin', 
             '$dias_vacaciones', '$domingos', '$festivos', '$salario_diario', '$porcentaje_prima', 
             '$monto_prima_vacacional', '$dispersion_tarjeta', '$isr', '$total_pagado', '$observaciones')";

    if (mysqli_query($conexion, $sql)) {
        $id_insertado = mysqli_insert_id($conexion);
        echo json_encode([
            'success' => true,
            'message' => 'Prima vacacional registrada exitosamente.',
            'id_prima_empleado' => $id_insertado
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al guardar: ' . mysqli_error($conexion)]);
    }
}

//==============================
// OBTIENE LOS ID_KARDEX QUE YA TIENEN PRIMA VACACIONAL REGISTRADA
//==============================
function obtenerKardexConPrima($conexion)
{
    $id_empleado = intval($_POST['id_empleado'] ?? 0);

    $sql = "SELECT id_kardex FROM prima_vacacional_empleados WHERE id_empleado = '$id_empleado'";
    $result = mysqli_query($conexion, $sql);

    $kardex_ids = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $kardex_ids[] = intval($row['id_kardex']);
    }

    echo json_encode($kardex_ids);
}
