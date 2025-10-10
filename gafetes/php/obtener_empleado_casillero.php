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
    
    // Consulta para obtener la información de los empleados asignados al casillero
    $sql = "SELECT 
                e.id_empleado,
                e.nombre, 
                e.ap_paterno, 
                e.ap_materno,
                d.nombre_departamento AS departamento
            FROM empleado_casillero ec
            INNER JOIN info_empleados e ON ec.id_empleado = e.id_empleado
            LEFT JOIN departamentos d ON e.id_departamento = d.id_departamento
            WHERE ec.num_casillero = ?";
    
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("s", $num_casillero);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $empleados = [];
    while ($empleado = $result->fetch_assoc()) {
        $empleados[] = [
            'id_empleado' => (int)$empleado['id_empleado'], // Asegurarse de que sea entero
            'nombre' => (string)$empleado['nombre'], // Asegurarse de que sea string
            'apellido_paterno' => (string)$empleado['ap_paterno'], // Asegurarse de que sea string
            'apellido_materno' => (string)($empleado['ap_materno'] ?? ''), // Asegurarse de que sea string
            'departamento' => (string)($empleado['departamento'] ?? '') // Asegurarse de que sea string
        ];
    }
    
    $stmt->close();
    
    if (count($empleados) > 0) {
        echo json_encode([
            'success' => true,
            'empleados' => $empleados
        ]);
    } else {
        echo json_encode(['success' => false, 'error' => 'No hay empleados asignados a este casillero']);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Error al obtener información de los empleados: ' . $e->getMessage()]);
}

if (isset($conexion) && $conexion) {
    $conexion->close();
}
?>