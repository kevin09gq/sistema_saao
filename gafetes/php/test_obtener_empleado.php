<?php
include("../../conexion/conexion.php");

// Verificar que se enviaron los datos necesarios
if (!isset($_GET['id_empleado'])) {
    echo json_encode(['error' => 'ID de empleado no proporcionado']);
    exit;
}

$id_empleado = intval($_GET['id_empleado']);

// Obtener datos del empleado
$stmt = $conexion->prepare("SELECT id_empleado, clave_empleado, nombre, ruta_foto FROM info_empleados WHERE id_empleado = ?");
$stmt->bind_param("i", $id_empleado);
$stmt->execute();
$resultado = $stmt->get_result();

if ($resultado->num_rows > 0) {
    $empleado = $resultado->fetch_assoc();
    echo json_encode($empleado);
} else {
    echo json_encode(['error' => 'Empleado no encontrado']);
}
?>