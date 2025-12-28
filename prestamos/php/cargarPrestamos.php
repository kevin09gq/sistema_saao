<?php
include "../../conexion/conexion.php";
header('Content-Type: application/json; charset=utf-8');

// Verificar que se recibió el id_prestamo
if (!isset($_GET['id_prestamo'])) {
    echo json_encode(['error' => 'No se proporcionó id_prestamo']);
    exit;
}

$id_prestamo = (int)$_GET['id_prestamo'];

// Obtener datos del préstamo con información del empleado
$sql_prestamo = "SELECT p.*, 
                 CONCAT(e.nombre, ' ', e.ap_paterno, ' ', e.ap_materno) AS nombre_completo,
                 e.clave_empleado
                 FROM prestamos p
                 LEFT JOIN info_empleados e ON p.id_empleado = e.id_empleado
                 WHERE p.id_prestamo = $id_prestamo";

$resultado_prestamo = mysqli_query($conexion, $sql_prestamo);

if (!$resultado_prestamo || mysqli_num_rows($resultado_prestamo) == 0) {
    echo json_encode(['error' => 'Préstamo no encontrado']);
    exit;
}

$prestamo = mysqli_fetch_assoc($resultado_prestamo);

// Obtener historial de pagos del préstamo
$sql_pagos = "SELECT * FROM pagos_prestamos 
              WHERE id_prestamo = $id_prestamo
              ORDER BY numero_semana ASC";

$resultado_pagos = mysqli_query($conexion, $sql_pagos);

$pagos = array();
while ($pago = mysqli_fetch_assoc($resultado_pagos)) {
    $pagos[] = $pago;
}

// Obtener conceptos del préstamo
$sql_conceptos = "SELECT id_concepto, concepto, monto, fecha_registro 
                  FROM prestamos_conceptos 
                  WHERE id_prestamo = $id_prestamo
                  ORDER BY fecha_registro ASC";

$resultado_conceptos = mysqli_query($conexion, $sql_conceptos);

$conceptos = array();
while ($c = mysqli_fetch_assoc($resultado_conceptos)) {
    $conceptos[] = $c;
}

// Construir respuesta JSON
$respuesta = array(
    'prestamo' => $prestamo,
    'pagos' => $pagos,
    'conceptos' => $conceptos
);

echo json_encode($respuesta, JSON_UNESCAPED_UNICODE);

mysqli_close($conexion);
?>
