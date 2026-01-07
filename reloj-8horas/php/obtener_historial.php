<?php
include "../../conexion/conexion.php";
$conn = $conexion;

header('Content-Type: application/json; charset=utf-8');

try {
    $id_departamento = isset($_GET['id_departamento']) ? intval($_GET['id_departamento']) : 0;
    if ($id_departamento > 0) {
        $sql = "SELECT h.semana, h.anio,
                   SUM(h.vacaciones) AS vacaciones,
                   SUM(h.ausencias) AS ausencias,
                   SUM(h.incapacidades) AS incapacidades,
                   SUM(h.dias_trabajados) AS dias_trabajados
            FROM historial_incidencias_semanal h
            JOIN info_empleados e ON h.empleado_id = e.id_empleado
            WHERE e.id_departamento = ?
            GROUP BY h.semana, h.anio
            ORDER BY h.anio DESC, h.semana DESC";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id_departamento);
        $stmt->execute();
        $result = $stmt->get_result();
    } else {
        $sql = "SELECT semana, anio,
                   SUM(vacaciones) AS vacaciones,
                   SUM(ausencias) AS ausencias,
                   SUM(incapacidades) AS incapacidades,
                   SUM(dias_trabajados) AS dias_trabajados
            FROM historial_incidencias_semanal
            GROUP BY semana, anio
            ORDER BY anio DESC, semana DESC";
        $result = $conn->query($sql);
    }
    
    $historial = [];
    while ($row = $result->fetch_assoc()) {
        $historial[] = $row;
    }
    
    echo json_encode([
        'success' => true,
        'data' => $historial
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

if (isset($stmt)) { $stmt->close(); }
$conn->close();
?>
