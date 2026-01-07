<?php
header('Content-Type: application/json; charset=UTF-8');

require_once __DIR__ . '/../../conexion/conexion.php';

// Leer cuerpo JSON
$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!is_array($data) || !isset($data['claves']) || !is_array($data['claves'])) {
    echo json_encode([]);
    exit;
}

// Normalizar y deduplicar claves
$claves = array_values(array_unique(array_map(function($c){
    return trim((string)$c);
}, $data['claves'])));

if (count($claves) === 0) {
    echo json_encode([]);
    exit;
}

// Preparar consulta dinámica con placeholders
$placeholders = implode(',', array_fill(0, count($claves), '?'));
// Añadimos salario_semanal y horario_oficial
$sql = "SELECT e.id_empleado, e.clave_empleado, CONCAT(e.nombre, ' ', e.ap_paterno, ' ', e.ap_materno) as nombre_completo, 
               e.salario_semanal,e.salario_diario, h.horario_oficial
        FROM info_empleados e
        LEFT JOIN horarios_oficiales h ON e.id_empleado = h.id_empleado
        WHERE e.id_status = 1 AND e.clave_empleado IN ($placeholders)
        ORDER BY e.nombre, e.ap_paterno, e.ap_materno";

if (!$stmt = mysqli_prepare($conexion, $sql)) {
    echo json_encode([]);
    exit;
}

// Tipos: todas las claves son strings
$types = str_repeat('s', count($claves));

// Construir argumentos para bind_param
$bind_params = [];
$bind_params[] = & $types;
foreach ($claves as $i => $val) {
    $bind_params[] = & $claves[$i];
}

// Llamar a bind_param con argumentos variables
call_user_func_array([$stmt, 'bind_param'], $bind_params);

mysqli_stmt_execute($stmt);
$result = mysqli_stmt_get_result($stmt);

$empleados = [];
if ($result) {
    while ($row = mysqli_fetch_assoc($result)) {
        $empleados[] = [
            'id_empleado' => (int)$row['id_empleado'],
            'clave' => (string)$row['clave_empleado'],
            'nombre' => $row['nombre_completo'],
            'salario_semanal' => $row['salario_semanal'] !== null ? (string)$row['salario_semanal'] : '0.00',
            'salario_diario' => $row['salario_diario'] !== null ? (string)$row['salario_diario'] : '0.00',
            'horario_oficial' => $row['horario_oficial'] !== null ? $row['horario_oficial'] : null
        ];
    }
}

echo json_encode($empleados);

