<?php
// Incluir conexión
include "../../conexion/conexion.php";
header('Content-Type: application/json; charset=utf-8');

// Validar datos
if (!isset($_POST['id_concepto'], $_POST['id_prestamo'])) {
    echo json_encode(['success' => false, 'mensaje' => 'Faltan datos']);
    exit;
}

$id_concepto = intval($_POST['id_concepto']);
$id_prestamo = intval($_POST['id_prestamo']);

if ($id_concepto <= 0 || $id_prestamo <= 0) {
    echo json_encode(['success' => false, 'mensaje' => 'Datos inválidos']);
    exit;
}

// Iniciar transacción
mysqli_begin_transaction($conexion);
try {
    // Obtener monto del concepto para ajustar totales
    $q1 = "SELECT monto FROM prestamos_conceptos WHERE id_concepto = $id_concepto AND id_prestamo = $id_prestamo LIMIT 1";
    $r1 = mysqli_query($conexion, $q1);
    if (!$r1 || mysqli_num_rows($r1) == 0) throw new Exception('Concepto no encontrado');
    $fila = mysqli_fetch_assoc($r1);
    $monto = floatval($fila['monto']);

    // Eliminar el concepto
    $q2 = "DELETE FROM prestamos_conceptos WHERE id_concepto = $id_concepto";
    if (!mysqli_query($conexion, $q2)) throw new Exception('Error al eliminar concepto: ' . mysqli_error($conexion));

    // Actualizar totales del préstamo
    $q3 = "UPDATE prestamos SET 
            monto_total = GREATEST(monto_total - $monto, 0), 
            saldo_restante = GREATEST(saldo_restante - $monto, 0),
            fecha_actualizacion = NOW()
           WHERE id_prestamo = $id_prestamo";
    if (!mysqli_query($conexion, $q3)) throw new Exception('Error al actualizar préstamo: ' . mysqli_error($conexion));

    // Obtener nuevos totales y semanas_totales
    $q4 = "SELECT monto_total, saldo_restante, semanas_totales, semanas_pagadas FROM prestamos WHERE id_prestamo = $id_prestamo LIMIT 1";
    $r4 = mysqli_query($conexion, $q4);
    if (!$r4 || mysqli_num_rows($r4) == 0) throw new Exception('No se pudo obtener préstamo');
    $totales = mysqli_fetch_assoc($r4);

    // Recalcular monto semanal
    $semanas_totales = intval($totales['semanas_totales']);
    $nuevo_monto_semanal = ($semanas_totales > 0) ? round(floatval($totales['monto_total']) / $semanas_totales, 2) : 0;

    // Determinar nuevo estado: si saldo_restante == 0 -> pagado, si >0 -> activo
    $nuevo_estado = ($totales['saldo_restante'] == 0) ? 'pagado' : 'activo';

    $q5 = "UPDATE prestamos SET monto_semanal = $nuevo_monto_semanal, estado = '$nuevo_estado', fecha_actualizacion = NOW() WHERE id_prestamo = $id_prestamo";
    if (!mysqli_query($conexion, $q5)) throw new Exception('Error al actualizar monto semanal/estado: ' . mysqli_error($conexion));

    // Obtener semanas_pagadas actual (puede mantenerse en la tabla)
    $q6 = "SELECT semanas_pagadas, estado FROM prestamos WHERE id_prestamo = $id_prestamo LIMIT 1";
    $r6 = mysqli_query($conexion, $q6);
    $info = mysqli_fetch_assoc($r6);

    mysqli_commit($conexion);

    echo json_encode([
        'success' => true,
        'mensaje' => 'Concepto eliminado',
        'monto_total' => number_format($totales['monto_total'], 2, '.', ''),
        'saldo_restante' => number_format($totales['saldo_restante'], 2, '.', ''),
        'monto_semanal' => number_format($nuevo_monto_semanal, 2, '.', ''),
        'semanas_pagadas' => intval($info['semanas_pagadas']),
        'estado' => $info['estado']
    ]);

} catch (Exception $e) {
    mysqli_rollback($conexion);
    echo json_encode(['success' => false, 'mensaje' => $e->getMessage()]);
}

mysqli_close($conexion);
?>