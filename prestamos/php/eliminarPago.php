<?php
include "../../conexion/conexion.php";
header('Content-Type: application/json; charset=utf-8');

// Validar datos requeridos
if (!isset($_POST['id_pago']) || !isset($_POST['id_prestamo'])) {
    echo json_encode(['success' => false, 'mensaje' => 'Faltan parámetros']);
    exit;
}

$id_pago = (int)$_POST['id_pago'];
$id_prestamo = (int)$_POST['id_prestamo'];

if ($id_pago <= 0 || $id_prestamo <= 0) {
    echo json_encode(['success' => false, 'mensaje' => 'Parámetros inválidos']);
    exit;
}

// Verificar que el pago exista y pertenezca al préstamo
$sql_verificar = "SELECT id_pago FROM pagos_prestamos WHERE id_pago = $id_pago AND id_prestamo = $id_prestamo";
$res_verificar = mysqli_query($conexion, $sql_verificar);
if (!$res_verificar || mysqli_num_rows($res_verificar) === 0) {
    echo json_encode(['success' => false, 'mensaje' => 'Pago no encontrado']);
    exit;
}

// Eliminar el pago
$sql_delete = "DELETE FROM pagos_prestamos WHERE id_pago = $id_pago";
if (!mysqli_query($conexion, $sql_delete)) {
    echo json_encode(['success' => false, 'mensaje' => 'Error al eliminar: ' . mysqli_error($conexion)]);
    exit;
}

// Recalcular semanas pagadas y saldo restante
$sql_sum = "SELECT COUNT(*) AS total_pagos, IFNULL(SUM(monto_pagado),0) AS total_pagado
            FROM pagos_prestamos WHERE id_prestamo = $id_prestamo";
$res_sum = mysqli_query($conexion, $sql_sum);
$datos = mysqli_fetch_assoc($res_sum);
$semanas_pagadas = (int)($datos['total_pagos'] ?? 0);
$total_pagado = (float)($datos['total_pagado'] ?? 0);

// Obtener monto total del préstamo actual
$sql_prestamo = "SELECT monto_total FROM prestamos WHERE id_prestamo = $id_prestamo";
$res_prestamo = mysqli_query($conexion, $sql_prestamo);
$prestamo = mysqli_fetch_assoc($res_prestamo);
$monto_total = (float)($prestamo['monto_total'] ?? 0);

$saldo_restante = $monto_total - $total_pagado;
if ($saldo_restante < 0) { $saldo_restante = 0; }

// Determinar nuevo estado
if ($saldo_restante <= 0 && $monto_total > 0) {
    $nuevo_estado = 'pagado';
} elseif ($semanas_pagadas > 0) {
    $nuevo_estado = 'activo';
} else {
    $nuevo_estado = 'pendiente';
}

// Actualizar préstamo
$sql_update = "UPDATE prestamos SET semanas_pagadas = $semanas_pagadas, saldo_restante = $saldo_restante, estado = '$nuevo_estado' WHERE id_prestamo = $id_prestamo";
mysqli_query($conexion, $sql_update);

// Respuesta
echo json_encode([
    'success' => true,
    'mensaje' => 'Pago eliminado correctamente',
    'semanas_pagadas' => $semanas_pagadas,
    'saldo_restante' => $saldo_restante,
    'estado' => $nuevo_estado
]);

mysqli_close($conexion);
?>
