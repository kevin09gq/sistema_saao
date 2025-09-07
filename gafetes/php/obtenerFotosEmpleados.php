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
    $empleadosSinFoto = []; // Array para almacenar empleados sin foto
    
    while ($fila = $resultado->fetch_assoc()) {
        // Verificar si la foto existe en el sistema de archivos
        $rutaFoto = null;
        if (!empty($fila['ruta_foto'])) {
            $rutaCompleta = __DIR__ . '/../' . $fila['ruta_foto'];
            if (file_exists($rutaCompleta)) {
                $rutaFoto = $fila['ruta_foto'];
            }
        }
        
        // Si el empleado no tiene foto, agregarlo a la lista de empleados sin foto
        if (empty($rutaFoto)) {
            $empleadosSinFoto[] = [
                'id' => $fila['id_empleado'],
                'clave_empleado' => $fila['clave_empleado'],
                'nombre' => $fila['nombre'],
                'ap_paterno' => $fila['ap_paterno'],
                'ap_materno' => $fila['ap_materno']
            ];
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
    
    // Verificar si hay empleados sin foto
    if (!empty($empleadosSinFoto)) {
        // Crear mensaje con los nombres de los empleados sin foto
        $nombresEmpleadosSinFoto = [];
        foreach ($empleadosSinFoto as $empleado) {
            $nombreCompleto = $empleado['nombre'];
            if (!empty($empleado['ap_paterno'])) {
                $nombreCompleto .= ' ' . $empleado['ap_paterno'];
            }
            if (!empty($empleado['ap_materno'])) {
                $nombreCompleto .= ' ' . $empleado['ap_materno'];
            }
            $nombresEmpleadosSinFoto[] = $nombreCompleto . ' (' . $empleado['clave_empleado'] . ')';
        }
        
        $respuesta['message'] = 'Los siguientes empleados no tienen foto asignada: ' . implode(', ', $nombresEmpleadosSinFoto);
        echo json_encode($respuesta);
        exit;
    }
    
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