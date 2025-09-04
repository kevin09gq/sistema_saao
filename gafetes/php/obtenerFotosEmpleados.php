<?php
header('Content-Type: application/json');

// Incluir archivo de conexión a la base de datos
require_once('../../conexion/conexion.php');

// Leer datos JSON del body
$input = file_get_contents('php://input');
$data = json_decode($input, true);

$respuesta = [
    'success' => false,
    'message' => '',
    'empleados' => []
];

try {
    // Verificar que se hayan enviado IDs de empleados
    if (!isset($data['empleados']) || !is_array($data['empleados']) || empty($data['empleados'])) {
        $respuesta['message'] = 'No se proporcionaron IDs de empleados válidos.';
        echo json_encode($respuesta);
        exit;
    }
    
    $idsEmpleados = $data['empleados'];
    
    // Crear placeholders para la consulta preparada
    $placeholders = str_repeat('?,', count($idsEmpleados) - 1) . '?';
    
    // Consulta para obtener empleados con sus fotos
    $sql = "SELECT 
                id_empleado,
                clave_empleado,
                nombre,
                ap_paterno,
                ap_materno,
                ruta_foto
            FROM info_empleados 
            WHERE id_empleado IN ($placeholders)
            ORDER BY clave_empleado";
    
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param(str_repeat('i', count($idsEmpleados)), ...$idsEmpleados);
    $stmt->execute();
    $resultado = $stmt->get_result();
    
    $empleados = [];
    while ($fila = $resultado->fetch_assoc()) {
        // Verificar si la foto existe en el sistema de archivos
        $rutaFoto = null;
        if (!empty($fila['ruta_foto'])) {
            $rutaCompleta = __DIR__ . '/../' . $fila['ruta_foto'];
            if (file_exists($rutaCompleta)) {
                $rutaFoto = $fila['ruta_foto'];
            }
        }
        
        $empleados[] = [
            'id' => $fila['id_empleado'],
            'clave_empleado' => $fila['clave_empleado'],
            'nombre' => $fila['nombre'],
            'ap_paterno' => $fila['ap_paterno'],
            'ap_materno' => $fila['ap_materno'],
            'ruta_foto' => $rutaFoto
        ];
    }
    
    $stmt->close();
    
    if (empty($empleados)) {
        $respuesta['message'] = 'No se encontraron empleados con los IDs proporcionados.';
    } else {
        $respuesta['success'] = true;
        $respuesta['message'] = 'Datos de empleados obtenidos correctamente.';
        $respuesta['empleados'] = $empleados;
    }
    
} catch (Exception $e) {
    $respuesta['message'] = 'Error al obtener datos de empleados: ' . $e->getMessage();
    error_log('Error en obtenerFotosEmpleados.php: ' . $e->getMessage());
}

echo json_encode($respuesta);
?>