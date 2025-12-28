<?php
// Incluir la conexión a la base de datos
include "../../conexion/conexion.php";

// PASO 1: Obtener los datos enviados desde el formulario
$id_empleado = mysqli_real_escape_string($conexion, $_POST['id_empleado']);
$concepto = mysqli_real_escape_string($conexion, $_POST['concepto']);
$monto_concepto = floatval($_POST['monto_concepto']);
$monto_semanal = floatval($_POST['monto_semanal']);
$semanas_totales = intval($_POST['semanas_totales']);
$notas = mysqli_real_escape_string($conexion, $_POST['notas']);

// PASO 2: Validar que el empleado esté seleccionado
if (empty($id_empleado)) {
    echo json_encode(['success' => false, 'mensaje' => 'Debe seleccionar un empleado']);
    exit;
}

// PASO 3: El monto total es igual al monto del concepto
$monto_total = $monto_concepto;
$saldo_restante = $monto_total;

// PASO 4: Insertar el nuevo préstamo
$query_prestamo = "INSERT INTO prestamos (
                    id_empleado, 
                    monto_total, 
                    monto_semanal, 
                    semanas_totales, 
                    saldo_restante, 
                    notas,
                    estado
                  ) VALUES (
                    '$id_empleado',
                    '$monto_total',
                    '$monto_semanal',
                    '$semanas_totales',
                    '$saldo_restante',
                    '$notas',
                    'pendiente'
                  )";

$resultado_prestamo = mysqli_query($conexion, $query_prestamo);

if (!$resultado_prestamo) {
    echo json_encode(['success' => false, 'mensaje' => 'Error al registrar el préstamo: ' . mysqli_error($conexion)]);
    exit;
}

// PASO 5: Obtener el ID del préstamo que acabamos de crear
$id_prestamo = mysqli_insert_id($conexion);

// PASO 6: Insertar el concepto del préstamo
$query_concepto = "INSERT INTO prestamos_conceptos (id_prestamo, concepto, monto)
                  VALUES ('$id_prestamo', '$concepto', '$monto_concepto')";

$resultado_concepto = mysqli_query($conexion, $query_concepto);

if ($resultado_concepto) {
    echo json_encode(['success' => true, 'mensaje' => 'Préstamo registrado exitosamente']);
} else {
    echo json_encode(['success' => false, 'mensaje' => 'Error al registrar el concepto']);
}

// Cerrar conexión
mysqli_close($conexion);
?>
