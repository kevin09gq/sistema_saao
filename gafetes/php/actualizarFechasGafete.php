<?php
// Incluir archivo de conexión a la base de datos
require_once('../../conexion/conexion.php');

// Verificar si se ha enviado una solicitud POST
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Obtener el ID del empleado desde la solicitud
    $id_empleado = isset($_POST['id_empleado']) ? intval($_POST['id_empleado']) : 0;
    
    // Verificar que se haya proporcionado un ID de empleado válido
    if ($id_empleado > 0) {
        // Calcular las fechas
        $fecha_creacion = date('Y-m-d');
        $fecha_vigencia = date('Y-m-d', strtotime('+6 months'));
        
        // Preparar la consulta SQL para actualizar las fechas
        $sql = "UPDATE info_empleados SET fecha_creacion = ?, fecha_vigencia = ? WHERE id_empleado = ?";
        $stmt = $conexion->prepare($sql);
        
        if ($stmt) {
            // Vincular los parámetros y ejecutar la consulta
            $stmt->bind_param('ssi', $fecha_creacion, $fecha_vigencia, $id_empleado);
            
            if ($stmt->execute()) {
                // La actualización fue exitosa
                echo json_encode([
                    'success' => true,
                    'message' => 'Fechas actualizadas correctamente',
                    'fecha_creacion' => $fecha_creacion,
                    'fecha_vigencia' => $fecha_vigencia
                ]);
            } else {
                // Error al ejecutar la consulta
                echo json_encode([
                    'success' => false,
                    'message' => 'Error al actualizar las fechas: ' . $stmt->error
                ]);
            }
            
            $stmt->close();
        } else {
            // Error al preparar la consulta
            echo json_encode([
                'success' => false,
                'message' => 'Error al preparar la consulta: ' . $conexion->error
            ]);
        }
    } else {
        // ID de empleado no válido
        echo json_encode([
            'success' => false,
            'message' => 'ID de empleado no válido'
        ]);
    }
} else {
    // Método de solicitud no válido
    echo json_encode([
        'success' => false,
        'message' => 'Método de solicitud no válido'
    ]);
}

$conexion->close();
?>