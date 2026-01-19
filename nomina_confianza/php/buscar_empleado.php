<?php
require_once __DIR__ . '/../../conexion/conexion.php';

header('Content-Type: application/json');

$query = isset($_GET['query']) ? trim($_GET['query']) : '';
$tipo = isset($_GET['tipo']) ? $_GET['tipo'] : 'nombre'; // 'nombre' o 'clave'

if (empty($query)) {
    echo json_encode([]);
    exit;
}

try {
    if ($tipo === 'clave') {
        // Búsqueda exacta por clave
        $sql = "SELECT 
                    e.id_empleado,
                    e.clave_empleado,
                    CONCAT(e.nombre, ' ', e.ap_paterno, ' ', e.ap_materno) as nombre_completo,
                    e.imss,
                    e.rfc_empleado,
                    e.fecha_ingreso,
                    e.salario_semanal,
                    e.salario_diario,
                    d.nombre_departamento,
                    p.nombre_puesto
                FROM info_empleados e
                LEFT JOIN departamentos d ON e.id_departamento = d.id_departamento
                LEFT JOIN puestos_especiales p ON e.id_puestoEspecial = p.id_puestoEspecial
                WHERE e.clave_empleado = ?
                AND e.id_status = 1
                AND d.nombre_departamento NOT LIKE '%40%' AND d.nombre_departamento NOT LIKE '%10%'
                LIMIT 1";
        
        $stmt = $conexion->prepare($sql);
        $stmt->bind_param("s", $query);
    } else {
        // Búsqueda por nombre (LIKE)
        $queryLike = "%{$query}%";
        $sql = "SELECT 
                    e.id_empleado,
                    e.clave_empleado,
                    CONCAT(e.nombre, ' ', e.ap_paterno, ' ', e.ap_materno) as nombre_completo,
                    e.imss,
                    e.rfc_empleado,
                    e.fecha_ingreso,
                    e.salario_semanal,
                    e.salario_diario,
                    d.nombre_departamento,
                    p.nombre_puesto
                FROM info_empleados e
                LEFT JOIN departamentos d ON e.id_departamento = d.id_departamento
                LEFT JOIN puestos_especiales p ON e.id_puestoEspecial = p.id_puestoEspecial
                WHERE e.id_status = 1
                AND (d.nombre_departamento NOT LIKE '%40%' AND d.nombre_departamento NOT LIKE '%10%')
                AND (
                    e.nombre LIKE ? 
                    OR e.ap_paterno LIKE ? 
                    OR e.ap_materno LIKE ?
                    OR CONCAT(e.nombre, ' ', e.ap_paterno) LIKE ?
                    OR CONCAT(e.ap_paterno, ' ', e.ap_materno) LIKE ?
                    OR CONCAT(e.nombre, ' ', e.ap_paterno, ' ', e.ap_materno) LIKE ?
                )
                ORDER BY e.nombre, e.ap_paterno, e.ap_materno
                LIMIT 50";
        
        $stmt = $conexion->prepare($sql);
        $stmt->bind_param("ssssss", $queryLike, $queryLike, $queryLike, $queryLike, $queryLike, $queryLike);
    }
    
    $stmt->execute();
    $result = $stmt->get_result();
    
    $empleados = [];
    while ($row = $result->fetch_assoc()) {
        $empleados[] = [
            'id_empleado' => $row['id_empleado'],
            'clave_empleado' => $row['clave_empleado'],
            'nombre_completo' => $row['nombre_completo'],
            'imss' => $row['imss'] ?? '',
            'rfc_empleado' => $row['rfc_empleado'] ?? '',
            'fecha_ingreso' => $row['fecha_ingreso'] ?? '',
            'salario_semanal' => $row['salario_semanal'] ?? 0,
            'salario_diario' => $row['salario_diario'] ?? 0,
            'departamento' => $row['nombre_departamento'] ?? '',
            'puesto' => $row['nombre_puesto'] ?? ''
        ];
    }
    
    echo json_encode($empleados);
    
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
