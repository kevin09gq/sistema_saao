<?php
// Conectar a la base de datos
require_once '../../conexion/conexion.php';

// Obtener datos del POST
$idPrestamo = isset($_POST['id_prestamo']) ? intval($_POST['id_prestamo']) : 0;
$montoPagado = isset($_POST['monto_pagado']) ? floatval($_POST['monto_pagado']) : 0;

// Validar que vengan los datos necesarios
if ($idPrestamo <= 0 || $montoPagado <= 0) {
    echo json_encode([
        'success' => false,
        'message' => 'Datos inválidos'
    ]);
    exit;
}

// PASO 1: Obtener información actual del préstamo
$sql = "SELECT semanas_pagadas, saldo_restante, monto_semanal, estado 
        FROM prestamos 
        WHERE id_prestamo = ?";
$stmt = $conexion->prepare($sql);
$stmt->bind_param("i", $idPrestamo);
$stmt->execute();
$resultado = $stmt->get_result();

if ($resultado->num_rows === 0) {
    echo json_encode([
        'success' => false,
        'message' => 'Préstamo no encontrado'
    ]);
    exit;
}

$prestamo = $resultado->fetch_assoc();
$stmt->close();

// PASO 2: Calcular número de semana del año y semanas pagadas
$numeroSemana = intval(date('W')); // Semana del año (1-52/53) para registro
$semanasPagadas = intval($prestamo['semanas_pagadas']) + 1; // Incrementar contador

// PASO 2.5: Verificar si ya se pagó esta semana
$sqlVerificar = "SELECT id_pago FROM pagos_prestamos 
                 WHERE id_prestamo = ? AND numero_semana = ?";
$stmtVerificar = $conexion->prepare($sqlVerificar);
$stmtVerificar->bind_param("ii", $idPrestamo, $numeroSemana);
$stmtVerificar->execute();
$resultadoVerificar = $stmtVerificar->get_result();

if ($resultadoVerificar->num_rows > 0) {
    echo json_encode([
        'success' => false,
        'message' => 'Ya se registró un pago en la semana ' . $numeroSemana . ' del año'
    ]);
    $stmtVerificar->close();
    $conexion->close();
    exit;
}
$stmtVerificar->close();

// PASO 3: Calcular nuevo saldo restante
$nuevoSaldo = floatval($prestamo['saldo_restante']) - $montoPagado;
if ($nuevoSaldo < 0) $nuevoSaldo = 0;

// PASO 4: Determinar nuevo estado
$nuevoEstado = $prestamo['estado'];
if ($prestamo['estado'] === 'pendiente') {
    $nuevoEstado = 'activo'; // Primer pago: pendiente → activo
}
if ($nuevoSaldo <= 0) {
    $nuevoEstado = 'pagado'; // Préstamo completado
}

// Iniciar transacción
$conexion->begin_transaction();

try {
    // PASO 5: Insertar el pago en pagos_prestamos
    $sqlPago = "INSERT INTO pagos_prestamos 
                (id_prestamo, monto_pagado, numero_semana, fecha_pago) 
                VALUES (?, ?, ?, CURDATE())";
    $stmtPago = $conexion->prepare($sqlPago);
    $stmtPago->bind_param("idi", $idPrestamo, $montoPagado, $numeroSemana);
    $stmtPago->execute();
    $stmtPago->close();
    
    // PASO 6: Actualizar el préstamo
    $sqlUpdate = "UPDATE prestamos 
                  SET semanas_pagadas = ?, 
                      saldo_restante = ?,
                      estado = ?
                  WHERE id_prestamo = ?";
    $stmtUpdate = $conexion->prepare($sqlUpdate);
    $stmtUpdate->bind_param("idsi", $semanasPagadas, $nuevoSaldo, $nuevoEstado, $idPrestamo);
    $stmtUpdate->execute();
    $stmtUpdate->close();
    
    // Confirmar transacción
    $conexion->commit();
    
    echo json_encode([
        'success' => true,
        'message' => 'Pago registrado correctamente',
        'data' => [
            'numero_semana' => $numeroSemana,
            'semanas_pagadas' => $semanasPagadas,
            'saldo_restante' => $nuevoSaldo,
            'estado' => $nuevoEstado
        ]
    ]);
    
} catch (Exception $e) {
    // Si hay error, revertir cambios
    $conexion->rollback();
    
    echo json_encode([
        'success' => false,
        'message' => 'Error al registrar el pago: ' . $e->getMessage()
    ]);
}

$conexion->close();
?>
