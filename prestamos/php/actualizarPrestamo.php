<?php
include "../../conexion/conexion.php";
header('Content-Type: application/json; charset=utf-8');

// Verificar que se recibió el id_prestamo
if (!isset($_POST['id_prestamo'])) {
    echo json_encode(['success' => false, 'mensaje' => 'ID de préstamo requerido']);
    exit;
}

// Obtener y limpiar datos
$id_prestamo = (int)$_POST['id_prestamo'];
$monto_total = (float)$_POST['monto_total'];
$semanas_totales = (int)$_POST['semanas_totales'];
$monto_semanal = (float)$_POST['monto_semanal'];
$saldo_restante = (float)$_POST['saldo_restante'];
$estado = mysqli_real_escape_string($conexion, $_POST['estado']);
$notas = mysqli_real_escape_string($conexion, $_POST['notas']);
$fecha_inicio = mysqli_real_escape_string($conexion, $_POST['fecha_inicio']);

// Validar datos básicos
if ($id_prestamo <= 0 || $monto_total <= 0 || $semanas_totales <= 0) {
    echo json_encode(['success' => false, 'mensaje' => 'Datos inválidos']);
    exit;
}

// Si el saldo restante es 0 o menor, cambiar estado a 'pagado' automáticamente
if ($saldo_restante <= 0) {
    $estado = 'pagado';
}

// Actualizar el préstamo
$sql = "UPDATE prestamos 
        SET monto_total = $monto_total,
            monto_semanal = $monto_semanal,
            semanas_totales = $semanas_totales,
            saldo_restante = $saldo_restante,
            estado = '$estado',
            notas = '$notas',
            fecha_inicio = '$fecha_inicio'
        WHERE id_prestamo = $id_prestamo";

if (mysqli_query($conexion, $sql)) {
    echo json_encode([
        'success' => true,
        'mensaje' => 'Préstamo actualizado exitosamente'
    ]);
} else {
    echo json_encode([
        'success' => false,
        'mensaje' => 'Error al actualizar: ' . mysqli_error($conexion)
    ]);
}

mysqli_close($conexion);
?>
