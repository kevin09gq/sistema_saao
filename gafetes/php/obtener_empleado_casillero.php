<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../../conexion/conexion.php';

// Obtener el número de casillero de la URL
$num_casillero = isset($_GET['casillero']) ? trim($_GET['casillero']) : '';

if (empty($num_casillero)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Número de casillero no proporcionado']);
    exit;
}

try {
    // Verificar si hay conexión
    if (!isset($conexion) || !$conexion) {
        throw new Exception('No se pudo establecer conexión con la base de datos');
    }
    
    // Consulta para obtener la información del empleado asignado al casillero
    $sql = "SELECT 
                e.id_empleado,
                e.nombre, 
                e.ap_paterno, 
                e.ap_materno,
                d.nombre_departamento AS departamento
            FROM casilleros c
            INNER JOIN info_empleados e ON c.id_empleado = e.id_empleado
            LEFT JOIN departamentos d ON e.id_departamento = d.id_departamento
            WHERE c.num_casillero = ?";
    
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("s", $num_casillero);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows > 0) {
        $empleado = $result->fetch_assoc();
        echo json_encode([
            'success' => true,
            'empleado' => [
                'id_empleado' => $empleado['id_empleado'],
                'nombre' => $empleado['nombre'],
                'apellido_paterno' => $empleado['ap_paterno'],
                'apellido_materno' => $empleado['ap_materno'],
                'departamento' => $empleado['departamento']
            ]
        ]);
    } else {
        echo json_encode(['success' => false, 'error' => 'No hay empleado asignado a este casillero']);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error al obtener información del empleado: ' . $e->getMessage()]);
}

if (isset($conexion) && $conexion) {
    if (isset($stmt) && $stmt) $stmt->close();
    $conexion->close();
}
?>