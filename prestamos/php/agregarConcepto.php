<?php
// Incluir conexión
include "../../conexion/conexion.php";
header('Content-Type: application/json; charset=utf-8');

// Validar datos
if (!isset($_POST['id_prestamo'], $_POST['concepto'], $_POST['monto'])) {
    echo json_encode(['success' => false, 'mensaje' => 'Faltan datos']);
    exit;
}

$id_prestamo = intval($_POST['id_prestamo']);
$concepto = mysqli_real_escape_string($conexion, $_POST['concepto']);
$monto = floatval($_POST['monto']);

if ($id_prestamo <= 0 || empty($concepto) || $monto <= 0) {
    echo json_encode(['success' => false, 'mensaje' => 'Datos inválidos']);
    exit;
}

// Iniciar transacción
mysqli_begin_transaction($conexion);
try {
    // Insertar concepto
    $q1 = "INSERT INTO prestamos_conceptos (id_prestamo, concepto, monto) VALUES ('$id_prestamo', '$concepto', '$monto')";
    if (!mysqli_query($conexion, $q1)) throw new Exception('Error al insertar concepto: ' . mysqli_error($conexion));
    $id_concepto = mysqli_insert_id($conexion);

    // Actualizar totales del préstamo
    $q2 = "UPDATE prestamos SET 
            monto_total = monto_total + $monto, 
            saldo_restante = saldo_restante + $monto,
            fecha_actualizacion = NOW()
           WHERE id_prestamo = $id_prestamo";
    if (!mysqli_query($conexion, $q2)) throw new Exception('Error al actualizar préstamo: ' . mysqli_error($conexion));

    // Obtener los nuevos totales y semanas_totales
    $q3 = "SELECT monto_total, saldo_restante, semanas_totales FROM prestamos WHERE id_prestamo = $id_prestamo LIMIT 1";
    $res3 = mysqli_query($conexion, $q3);
    if (!$res3 || mysqli_num_rows($res3) == 0) throw new Exception('No se pudo obtener préstamo');
    $totales = mysqli_fetch_assoc($res3);

    // Recalcular y actualizar el monto semanal (si hay semanas totales)
    $semanas_totales = intval($totales['semanas_totales']);
    $nuevo_monto_semanal = ($semanas_totales > 0) ? round(floatval($totales['monto_total']) / $semanas_totales, 2) : 0;

    // Actualizar monto semanal Y marcar préstamo como activo (si se agrega nueva deuda)
    $q_update_semana = "UPDATE prestamos SET monto_semanal = $nuevo_monto_semanal, estado = 'activo', fecha_actualizacion = NOW() WHERE id_prestamo = $id_prestamo";
    if (!mysqli_query($conexion, $q_update_semana)) throw new Exception('Error al actualizar monto semanal: ' . mysqli_error($conexion));

    // Obtener el concepto insertado
    $q4 = "SELECT id_concepto, concepto, monto, fecha_registro FROM prestamos_conceptos WHERE id_concepto = $id_concepto LIMIT 1";
    $res4 = mysqli_query($conexion, $q4);
    $concepto_insertado = mysqli_fetch_assoc($res4);

    // Actualizar variables con totales más recientes
    $totales['monto_semanal'] = $nuevo_monto_semanal;
    $totales['estado'] = 'activo';
    mysqli_commit($conexion);

    echo json_encode([
        'success' => true,
        'mensaje' => 'Concepto agregado',
        'concepto' => $concepto_insertado,
        'monto_total' => number_format($totales['monto_total'], 2, '.', ''),
        'saldo_restante' => number_format($totales['saldo_restante'], 2, '.', ''),
        'monto_semanal' => number_format($totales['monto_semanal'], 2, '.', ''),
        'estado' => $totales['estado']
    ]);

} catch (Exception $e) {
    mysqli_rollback($conexion);
    echo json_encode(['success' => false, 'mensaje' => $e->getMessage()]);
}

mysqli_close($conexion);
?>