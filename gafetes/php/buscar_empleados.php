<?php
// Desactivar la visualización de errores para evitar que se muestren en la respuesta JSON
error_reporting(E_ALL);
ini_set('display_errors', 0);

// Configurar el tipo de contenido como JSON
header('Content-Type: application/json; charset=utf-8');

// Inicializar la respuesta
$response = [
    'success' => false,
    'message' => '',
    'results' => [],
    'pagination' => ['more' => false]
];

try {
    // Incluir el archivo de conexión
    require_once __DIR__ . '/../../conexion/conexion.php';
    
    // Verificar si hay conexión
    if (!isset($conexion) || !$conexion) {
        throw new Exception('No se pudo establecer conexión con la base de datos');
    }
    
    // Usar la base de datos definida en conexion.php sin sobreescribirla aquí
    
    // Verificar si la tabla existe
    $table_check = mysqli_query($conexion, "SHOW TABLES LIKE 'info_empleados'");
    if (mysqli_num_rows($table_check) == 0) {
        throw new Exception('La tabla info_empleados no existe en la base de datos');
    }
    
    // Obtener parámetros de búsqueda
    $busqueda = isset($_GET['q']) ? trim($_GET['q']) : '';
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $limit = 10; // Número de resultados por página
    $offset = ($page - 1) * $limit;

    // Preparamos los términos de búsqueda
    $terminos = array_filter(explode(' ', $busqueda));
    $busquedaLike = "%$busqueda%";
    
    // Consulta corregida para buscar empleados (usando la nueva estructura de casilleros)
    $sql = "SELECT 
                e.id_empleado, 
                TRIM(e.nombre) as nombre, 
                TRIM(e.ap_paterno) as apellido_paterno, 
                TRIM(IFNULL(e.ap_materno, '')) as apellido_materno
            FROM info_empleados e
            WHERE e.id_status = 1 
            AND (
                CONCAT_WS(' ', e.nombre, e.ap_paterno, e.ap_materno) LIKE ?
                OR e.nombre LIKE ?
                OR e.ap_paterno LIKE ?
                OR e.ap_materno LIKE ?
                OR e.id_empleado = ?
            )
            ORDER BY e.nombre, e.ap_paterno, e.ap_materno
            LIMIT ? OFFSET ?";
    
    $stmt = $conexion->prepare($sql);
    
    if (!$stmt) {
        throw new Exception('Error al preparar la consulta: ' . $conexion->error);
    }
    
    // Parámetros para la búsqueda
    $idEmpleado = is_numeric($busqueda) ? (int)$busqueda : 0;
    $stmt->bind_param("ssssiii", 
        $busquedaLike,    // CONCAT_WS todos los campos
        $busquedaLike,    // solo nombre
        $busquedaLike,    // solo apellido paterno
        $busquedaLike,    // solo apellido materno
        $idEmpleado,      // id_empleado (0 si no es numérico)
        $limit,
        $offset
    );
    
    if (!$stmt->execute()) {
        throw new Exception('Error al ejecutar la consulta: ' . $stmt->error);
    }
    
    $result = $stmt->get_result();
    
    // Obtener resultados
    $empleados = [];
    while ($row = $result->fetch_assoc()) {
        $empleados[] = [
            'id_empleado' => (int)$row['id_empleado'], // Asegurar que sea entero
            'nombre' => (string)$row['nombre'], // Asegurar que sea string
            'apellido_paterno' => (string)$row['apellido_paterno'], // Asegurar que sea string
            'apellido_materno' => (string)$row['apellido_materno'] // Asegurar que sea string
        ];
    }
    
    // Contar total de resultados para la paginación
    $countSql = "SELECT COUNT(*) as total 
                FROM info_empleados 
                WHERE id_status = 1 
                AND (
                    nombre LIKE ? 
                    OR ap_paterno LIKE ? 
                    OR ap_materno LIKE ? 
                    OR CONCAT(nombre, ' ', ap_paterno, ' ', IFNULL(ap_materno, '')) LIKE ?
                    OR id_empleado = ?
                )";
    
    $countStmt = $conexion->prepare($countSql);
    
    if (!$countStmt) {
        throw new Exception('Error al preparar la consulta de conteo: ' . $conexion->error);
    }
    
    $countStmt->bind_param("ssssi", 
        $busquedaLike,  // nombre
        $busquedaLike,  // apellido_paterno
        $busquedaLike,  // apellido_materno
        $busquedaLike,  // nombre completo
        $idEmpleado     // id_empleado
    );
    
    if (!$countStmt->execute()) {
        throw new Exception('Error al ejecutar la consulta de conteo: ' . $countStmt->error);
    }
    
    $total = $countStmt->get_result()->fetch_assoc()['total'];
    
    // Preparar respuesta exitosa
    $response = [
        'success' => true,
        'results' => $empleados,
        'pagination' => [
            'more' => ($offset + count($empleados)) < $total
        ]
    ];
    
} catch (Exception $e) {
    // En caso de error, devolver mensaje de error
    $response = [
        'success' => false,
        'message' => 'Error: ' . $e->getMessage(),
        'results' => [],
        'pagination' => ['more' => false]
    ];
    
    // Registrar el error en el log del servidor
    error_log('Error en buscar_empleados.php: ' . $e->getMessage());
}

// Cerrar conexión si existe
if (isset($conexion) && $conexion) {
    if (isset($stmt) && $stmt) $stmt->close();
    if (isset($countStmt) && $countStmt) $countStmt->close();
    $conexion->close();
}

// Enviar respuesta JSON
echo json_encode($response, JSON_UNESCAPED_UNICODE);
?>