<?php
// Mostrar errores para depuración
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Ruta correcta al archivo de conexión
$ruta_conexion = __DIR__ . "/../../conexion/conexion.php";

if (!file_exists($ruta_conexion)) {
    die(json_encode(['error' => 'Archivo de conexión no encontrado en: ' . $ruta_conexion]));
}

include_once($ruta_conexion);

// Verificar conexión
if (!isset($conexion) || !$conexion) {
    die(json_encode(['error' => 'Error de conexión a la base de datos']));
}

header('Content-Type: application/json');

try {
    // Obtener parámetros de paginación, filtro y búsqueda con valores por defecto
    $pagina = isset($_GET['pagina']) ? max(1, intval($_GET['pagina'])) : 1;
    $filtro = isset($_GET['filtro']) ? $_GET['filtro'] : 'todos'; // 'todos', 'disponibles', 'asignados'
    $busqueda = isset($_GET['busqueda']) ? trim($_GET['busqueda']) : ''; // Texto de búsqueda
    $limite = 50; // Casilleros por página
    $offset = ($pagina - 1) * $limite;
    
    // Validar que offset no sea negativo
    $offset = max(0, $offset);
    
    // Construir la cláusula WHERE según el filtro y búsqueda
    $where_conditions = [];
    
    // Aplicar filtro
    switch ($filtro) {
        case 'disponibles':
            // Casilleros que tienen menos de 2 empleados asignados
            $where_conditions[] = "(SELECT COUNT(*) FROM empleado_casillero ec WHERE ec.num_casillero = c.num_casillero) < 2";
            break;
        case 'asignados':
            // Casilleros que tienen al menos un empleado asignado
            $where_conditions[] = "(SELECT COUNT(*) FROM empleado_casillero ec WHERE ec.num_casillero = c.num_casillero) > 0";
            break;
        default:
            // No se aplica filtro
    }
    
    // Aplicar búsqueda si se proporciona
    if (!empty($busqueda)) {
        $busqueda_escaped = $conexion->real_escape_string($busqueda);
        $where_conditions[] = "(c.num_casillero LIKE '%$busqueda_escaped%' OR 
                               e.nombre LIKE '%$busqueda_escaped%' OR 
                               e.ap_paterno LIKE '%$busqueda_escaped%' OR 
                               e.ap_materno LIKE '%$busqueda_escaped%')";
    }
    
    // Construir la cláusula WHERE completa
    $where_clause = "";
    if (!empty($where_conditions)) {
        $where_clause = "WHERE " . implode(" AND ", $where_conditions);
    }
    
    // Primero obtener el total de casilleros según el filtro y búsqueda
    $total_query = "SELECT COUNT(*) as total FROM (
                        SELECT c.num_casillero 
                        FROM casilleros c 
                        LEFT JOIN empleado_casillero ec ON c.num_casillero = ec.num_casillero 
                        LEFT JOIN info_empleados e ON ec.id_empleado = e.id_empleado 
                        $where_clause 
                        GROUP BY c.num_casillero
                    ) as subquery";
    
    $total_result = $conexion->query($total_query);
    $total_row = $total_result->fetch_assoc();
    $total_casilleros = $total_row['total'];
    $total_paginas = max(1, ceil($total_casilleros / $limite));
    
    // Asegurarse de que la página solicitada no exceda el total de páginas
    $pagina = min($pagina, $total_paginas);
    $offset = ($pagina - 1) * $limite;
    
    // Consulta mejorada para obtener los casilleros con información del empleado asignado
    // Ordenamiento numérico correcto para casilleros con números y letras
    $query = "SELECT 
                c.num_casillero, 
                COUNT(ec.id_empleado) as total_empleados,
                CASE 
                    WHEN COUNT(ec.id_empleado) > 0 THEN 'Ocupado'
                    ELSE 'Disponible'
                END as estado,
                GROUP_CONCAT(CONCAT(e.nombre, ' ', e.ap_paterno, ' ', COALESCE(e.ap_materno, '')) SEPARATOR ', ') as empleado_nombre
              FROM casilleros c
              LEFT JOIN empleado_casillero ec ON c.num_casillero = ec.num_casillero
              LEFT JOIN info_empleados e ON ec.id_empleado = e.id_empleado
              $where_clause
              GROUP BY c.num_casillero
              ORDER BY 
                CAST(REGEXP_REPLACE(c.num_casillero, '[^0-9]', '') AS UNSIGNED),
                c.num_casillero
              LIMIT ? OFFSET ?";
    
    $stmt = $conexion->prepare($query);
    // Verificar que la preparación fue exitosa
    if (!$stmt) {
        throw new Exception('Error al preparar la consulta: ' . $conexion->error);
    }
    
    $stmt->bind_param('ii', $limite, $offset);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $casilleros = [];
    
    while($row = $result->fetch_assoc()) {
        $casilleros[] = [
            'num_casillero' => (string)$row['num_casillero'], // Asegurarse de que sea string
            'estado' => $row['estado'],
            'total_empleados' => (int)$row['total_empleados'], // Asegurarse de que sea entero
            'empleado_nombre' => $row['empleado_nombre'] ?? '' // Asegurarse de que sea string
        ];
    }
    
    echo json_encode([
        'success' => true, 
        'data' => $casilleros,
        'pagina_actual' => $pagina,
        'total_paginas' => $total_paginas,
        'total_casilleros' => $total_casilleros,
        'casilleros_por_pagina' => $limite,
        'filtro_actual' => $filtro,
        'busqueda_actual' => $busqueda
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => $e->getMessage()]);
}

if (isset($conexion) && $conexion) {
    if (isset($stmt) && $stmt) $stmt->close();
    $conexion->close();
}
?>