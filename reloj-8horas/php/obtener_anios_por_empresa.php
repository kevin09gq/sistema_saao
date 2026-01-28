<?php
include "../../conexion/conexion.php";
$conn = $conexion;

header('Content-Type: application/json; charset=utf-8');

try {
    $id_empresa = isset($_GET['id_empresa']) ? intval($_GET['id_empresa']) : 0;
    
    if ($id_empresa > 0) {
        $sql = "SELECT DISTINCT h.anio
                FROM historial_incidencias_semanal h
                WHERE h.id_empresa = ?
                ORDER BY h.anio DESC";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $id_empresa);
        $stmt->execute();
        $result = $stmt->get_result();
        
        $anios = [];
        while ($row = $result->fetch_assoc()) {
            $anios[] = $row['anio'];
        }
        
        echo json_encode([
            'success' => true,
            'data' => $anios
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'ID de empresa requerido'
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