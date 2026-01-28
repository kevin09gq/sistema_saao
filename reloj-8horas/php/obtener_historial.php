<?php
include "../../conexion/conexion.php";
$conn = $conexion;

header('Content-Type: application/json; charset=utf-8');

try {
    $id_empresa = isset($_GET['id_empresa']) ? intval($_GET['id_empresa']) : 0;
    $id_departamento = isset($_GET['id_departamento']) ? intval($_GET['id_departamento']) : 0;
    
    if ($id_empresa > 0 && $id_departamento > 0) {
        $sql = "SELECT h.semana, h.anio,
                   SUM(h.vacaciones) AS vacaciones,
                   SUM(h.ausencias) AS ausencias,
                   SUM(h.incapacidades) AS incapacidades,
                   SUM(h.dias_trabajados) AS dias_trabajados
            FROM historial_incidencias_semanal h
            JOIN info_empleados e ON h.empleado_id = e.id_empleado
            WHERE h.id_empresa = ? AND e.id_departamento = ?
            GROUP BY h.semana, h.anio
            ORDER BY h.anio DESC, h.semana DESC";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ii", $id_empresa, $id_departamento);
        $stmt->execute();
        $result = $stmt->get_result();
    } else if ($id_empresa > 0) {
        $sql = "SELECT h.semana, h.anio,
                   SUM(h.vacaciones) AS vacaciones,
                   SUM(h.ausencias) AS ausencias,
                   SUM(h.incapacidades) AS incapacidades,
                   SUM(h.dias_trabajados) AS dias_trabajados
            FROM historial_incidencias_semanal h
            WHERE h.id_empresa = ?
            GROUP BY h.semana, h.anio
            ORDER BY h.anio DESC, h.semana DESC";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id_empresa);
        $stmt->execute();
        $result = $stmt->get_result();
    } else if ($id_departamento > 0) {
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
        $sql = "SELECT h.semana, h.anio,
                   SUM(h.vacaciones) AS vacaciones,
                   SUM(h.ausencias) AS ausencias,
                   SUM(h.incapacidades) AS incapacidades,
                   SUM(h.dias_trabajados) AS dias_trabajados
            FROM historial_incidencias_semanal h
            GROUP BY h.semana, h.anio
            ORDER BY h.anio DESC, h.semana DESC";
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
