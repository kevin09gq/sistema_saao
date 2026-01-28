<?php
// obtener_detalle_semana.php
// Devuelve los datos de todos los empleados de una semana específica

include '../../conexion/conexion.php';
$conn = $conexion;

header('Content-Type: application/json; charset=utf-8');

$semana = isset($_GET['semana']) ? $_GET['semana'] : null;
$anio = isset($_GET['anio']) ? intval($_GET['anio']) : null;
$id_empresa = isset($_GET['id_empresa']) ? intval($_GET['id_empresa']) : 0;
$id_departamento = isset($_GET['id_departamento']) ? intval($_GET['id_departamento']) : 0;

if (!$semana || !$anio) {
    echo json_encode(['success' => false, 'message' => 'Falta semana o año']);
    exit;
}


$sql = "SELECT CONCAT(e.nombre, ' ', e.ap_paterno, ' ', e.ap_materno) AS nombre_completo,
           e.id_departamento,
           h.vacaciones, h.ausencias, h.incapacidades, h.dias_trabajados
    FROM historial_incidencias_semanal h
    JOIN info_empleados e ON h.empleado_id = e.id_empleado
    WHERE h.semana = ? AND h.anio = ?";

$params = [$semana, $anio];
$types = "si";

if ($id_empresa > 0) {
    $sql .= " AND h.id_empresa = ?";
    $params[] = $id_empresa;
    $types .= "i";
}

if ($id_departamento > 0) {
    $sql .= " AND e.id_departamento = ?";
    $params[] = $id_departamento;
    $types .= "i";
}

$sql .= " ORDER BY nombre_completo ASC";

$stmt = $conn->prepare($sql);
$stmt->bind_param($types, ...$params);
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

