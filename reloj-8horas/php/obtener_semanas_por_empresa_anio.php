<?php
include "../../conexion/conexion.php";
$conn = $conexion;

header('Content-Type: application/json; charset=utf-8');

try {
    $id_empresa = isset($_GET['id_empresa']) ? intval($_GET['id_empresa']) : 0;
    $anio = isset($_GET['anio']) ? intval($_GET['anio']) : 0;
    
    if ($id_empresa > 0 && $anio > 0) {
        $sql = "SELECT DISTINCT h.semana
                FROM historial_incidencias_semanal h
                WHERE h.id_empresa = ? AND h.anio = ?
                ORDER BY h.semana ASC";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("ii", $id_empresa, $anio);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $semanas = [];
        while ($row = $result->fetch_assoc()) {
            $semanas[] = $row['semana'];
        }
        
        echo json_encode([
            'success' => true,
            'data' => $semanas
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'ID de empresa y año requeridos'
        ]);
    }
    
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