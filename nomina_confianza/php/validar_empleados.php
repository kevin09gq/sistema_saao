<?php
include "../../conexion/conexion.php";

header('Content-Type: application/json; charset=UTF-8');

// Leer datos enviados
$data = json_decode(file_get_contents("php://input"), true);

$funcion = $data["funcion"] ?? "";
$claves = $data["claves"] ?? [];

$resultado = [];

switch ($funcion) {
    case "validarEmpleadosExistentes":
        $resultado = validarEmpleadosExistentes($claves);
        break;
    
    case "obtenerInfoEmpleados":
        $resultado = obtenerInfoEmpleados($claves);
        break;
    
    default:
        $resultado = ["error" => "Función no encontrada"];
        break;
}

echo json_encode($resultado, JSON_UNESCAPED_UNICODE);
$conexion->close();

// Función para validar empleados existentes
function validarEmpleadosExistentes($claves) {
    global $conexion;
    
    if (empty($claves)) {
        return [];
    }
    
    // Crear placeholders para la consulta
    $placeholders = implode(',', array_fill(0, count($claves), '?'));
    $tipos = str_repeat('s', count($claves));
    
    $sql = $conexion->prepare(
        "SELECT clave_empleado 
         FROM info_empleados 
         WHERE clave_empleado IN ($placeholders) 
           AND id_status = 1
         ORDER BY clave_empleado"
    );
    
    $sql->bind_param($tipos, ...$claves);
    $sql->execute();
    $res = $sql->get_result();
    
    $clavesValidas = [];
    while ($row = $res->fetch_assoc()) {
        $clavesValidas[] = $row['clave_empleado'];
    }
    
    $sql->close();
    
    return $clavesValidas;
}

// Función para obtener información completa de empleados
function obtenerInfoEmpleados($claves) {
    global $conexion;
    
    if (empty($claves)) {
        return [];
    }
    
    // Normalizar y deduplicar claves
    $claves = array_values(array_unique(array_map(function($c){
        return trim((string)$c);
    }, $claves)));
    
    if (count($claves) === 0) {
        return [];
    }
    
    // Crear placeholders para la consulta
    $placeholders = implode(',', array_fill(0, count($claves), '?'));
    $tipos = str_repeat('s', count($claves));
    
    $sql = $conexion->prepare(
        "SELECT e.id_empleado, e.clave_empleado, CONCAT(e.nombre, ' ', e.ap_paterno, ' ', e.ap_materno) as nombre_completo, 
                   e.salario_semanal, e.salario_diario, e.id_empresa, h.horario_oficial
            FROM info_empleados e
            LEFT JOIN horarios_oficiales h ON e.id_empleado = h.id_empleado
            WHERE e.id_status = 1 AND e.clave_empleado IN ($placeholders)
            ORDER BY e.nombre, e.ap_paterno, e.ap_materno"
    );
    
    $sql->bind_param($tipos, ...$claves);
    $sql->execute();
    $res = $sql->get_result();
    
    $empleados = [];
    while ($row = $res->fetch_assoc()) {
        $empleados[] = [
            'id_empleado' => (int)$row['id_empleado'],
            'clave' => (string)$row['clave_empleado'],
            'nombre' => $row['nombre_completo'],
            'salario_semanal' => $row['salario_semanal'] !== null ? (string)$row['salario_semanal'] : '0.00',
            'salario_diario' => $row['salario_diario'] !== null ? (string)$row['salario_diario'] : '0.00',
            'id_empresa' => $row['id_empresa'] !== null ? (int)$row['id_empresa'] : null,
            'horario_oficial' => $row['horario_oficial'] !== null ? $row['horario_oficial'] : null
        ];
    }
    
    $sql->close();
    
    return $empleados;
}
?>
