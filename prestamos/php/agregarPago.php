<?php
include "../../conexion/conexion.php";
header('Content-Type: application/json; charset=utf-8');

// Verificar que se recibieron los datos
if (!isset($_POST['id_prestamo']) || !isset($_POST['monto_pagado']) || !isset($_POST['numero_semana']) || !isset($_POST['fecha_pago'])) {
    echo json_encode(['success' => false, 'mensaje' => 'Faltan datos requeridos']);
    exit;
}

// Obtener y limpiar datos
$id_prestamo = (int)$_POST['id_prestamo'];
$monto_pagado = (float)$_POST['monto_pagado'];
$numero_semana = (int)$_POST['numero_semana'];
$fecha_pago = mysqli_real_escape_string($conexion, $_POST['fecha_pago']);

// Validar datos
if ($id_prestamo <= 0 || $monto_pagado <= 0 || $numero_semana <= 0 || empty($fecha_pago)) {
    echo json_encode(['success' => false, 'mensaje' => 'Datos inválidos']);
    exit;
}

// Insertar el pago en la base de datos
$sql = "INSERT INTO pagos_prestamos (id_prestamo, monto_pagado, numero_semana, fecha_pago) 
        VALUES ($id_prestamo, $monto_pagado, $numero_semana, '$fecha_pago')";

if (mysqli_query($conexion, $sql)) {
    $id_pago = mysqli_insert_id($conexion);
    
    // Contar total de pagos realizados para este préstamo
    $sql_count = "SELECT COUNT(*) as total_pagos, SUM(monto_pagado) as total_pagado 
                  FROM pagos_prestamos 
                  WHERE id_prestamo = $id_prestamo";
    $resultado = mysqli_query($conexion, $sql_count);
    $datos = mysqli_fetch_assoc($resultado);
    
    $semanas_pagadas = (int)$datos['total_pagos'];
    $total_pagado = (float)$datos['total_pagado'];
    
    // Obtener monto total del préstamo
    $sql_prestamo = "SELECT monto_total FROM prestamos WHERE id_prestamo = $id_prestamo";
    $resultado_prestamo = mysqli_query($conexion, $sql_prestamo);
    $prestamo = mysqli_fetch_assoc($resultado_prestamo);
    $monto_total = (float)$prestamo['monto_total'];
    
    // Calcular saldo restante
    $saldo_restante = $monto_total - $total_pagado;
    if ($saldo_restante < 0) $saldo_restante = 0;
    
    // Determinar estado: si el saldo es 0, cambiar a 'pagado'
    $nuevo_estado = ($saldo_restante <= 0) ? 'pagado' : '';
    
    // Actualizar la tabla prestamos
    if ($nuevo_estado === 'pagado') {
        // Cambiar a pagado si ya se pagó todo
        $sql_update = "UPDATE prestamos 
                       SET semanas_pagadas = $semanas_pagadas, 
                           saldo_restante = $saldo_restante,
                           estado = 'pagado'
                       WHERE id_prestamo = $id_prestamo";
    } else {
        // Solo actualizar semanas y saldo
        $sql_update = "UPDATE prestamos 
                       SET semanas_pagadas = $semanas_pagadas, 
                           saldo_restante = $saldo_restante 
                       WHERE id_prestamo = $id_prestamo";
    }
    mysqli_query($conexion, $sql_update);
    
    echo json_encode([
        'success' => true,
        'mensaje' => 'Pago registrado exitosamente',
        'id_pago' => $id_pago
    ]);
} else {
    echo json_encode([
        'success' => false,
        'mensaje' => 'Error al guardar el pago: ' . mysqli_error($conexion)
    ]);
}

mysqli_close($conexion);
?>
