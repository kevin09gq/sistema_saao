<?php
// obtener_detalle_semana.php
// Devuelve los datos de todos los empleados de una semana específica

include '../../conexion/conexion.php';
$conn = $conexion;

header('Content-Type: application/json; charset=utf-8');

$semana = isset($_GET['semana']) ? $_GET['semana'] : null;
$anio = isset($_GET['anio']) ? intval($_GET['anio']) : null;

if (!$semana || !$anio) {
    echo json_encode(['success' => false, 'message' => 'Falta semana o año']);
    exit;
}


$sql = "SELECT CONCAT(e.nombre, ' ', e.ap_paterno, ' ', e.ap_materno) AS nombre_completo,
           h.vacaciones, h.ausencias, h.incapacidades, h.dias_trabajados
    FROM historial_incidencias_semanal h
    JOIN info_empleados e ON h.empleado_id = e.id_empleado
    WHERE h.semana = ? AND h.anio = ?
    ORDER BY nombre_completo ASC";

$stmt = $conn->prepare($sql);
$stmt->bind_param("si", $semana, $anio);
$stmt->execute();
$result = $stmt->get_result();

$empleados = [];

while ($row = $result->fetch_assoc()) {
    unset($row['empleado_id']); // No enviar id
    $empleados[] = $row;
}

$stmt->close();
$conn->close();

echo json_encode(['success' => true, 'data' => $empleados]);

