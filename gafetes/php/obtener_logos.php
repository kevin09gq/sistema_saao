<?php
header('Content-Type: application/json');
include("../../conexion/conexion.php");

// Limpiar el buffer de salida para evitar corrupción de JSON
ob_start();

try {
    // Verificar parámetros
    $tipo = isset($_GET['tipo']) ? $_GET['tipo'] : 'all';
    
    $response = [
        'success' => true,
        'data' => []
    ];

    if ($tipo === 'empresa' || $tipo === 'all') {
        // Obtener empresas con sus logos
        $stmt = $conexion->prepare("SELECT id_empresa, nombre_empresa, logo_empresa FROM empresa ORDER BY nombre_empresa ASC");
        $stmt->execute();
        $resultado = $stmt->get_result();
        
        $empresas = [];
        while ($row = $resultado->fetch_assoc()) {
            $empresas[] = [
                'id_empresa' => $row['id_empresa'],
                'nombre_empresa' => $row['nombre_empresa'],
                'logo_empresa' => $row['logo_empresa'],
                'logo_url' => !empty($row['logo_empresa']) ? 'logos_empresa/' . $row['logo_empresa'] : null
            ];
        }
        
        $response['data']['empresas'] = $empresas;
    }

    if ($tipo === 'area' || $tipo === 'all') {
        // Obtener áreas con sus logos
        $stmt = $conexion->prepare("SELECT id_area, nombre_area, logo_area FROM areas ORDER BY nombre_area ASC");
        $stmt->execute();
        $resultado = $stmt->get_result();
        
        $areas = [];
        while ($row = $resultado->fetch_assoc()) {
            $areas[] = [
                'id_area' => $row['id_area'],
                'nombre_area' => $row['nombre_area'],
                'logo_area' => $row['logo_area'],
                'logo_url' => !empty($row['logo_area']) ? 'logos_area/' . $row['logo_area'] : null
            ];
        }
        
        $response['data']['areas'] = $areas;
    }

    // Limpiar buffer y enviar respuesta
    ob_end_clean();
    echo json_encode($response);

} catch (Exception $e) {
    // Limpiar buffer y enviar error
    ob_end_clean();
    echo json_encode([
        'success' => false,
        'message' => 'Error al obtener logos: ' . $e->getMessage(),
        'error_code' => $e->getCode()
    ]);
}

// Cerrar conexión
if (isset($conexion)) {
    $conexion->close();
}
?>