<?php
require_once '../../conexion/conexion.php';

$action = $_POST['action'] ?? '';

switch ($action) {
    case 'obtenerVersiones':
        obtenerVersiones($conexion);
        break;
    case 'obtenerTablaPorVersion':
        obtenerTablaPorVersion($conexion);
        break;
    case 'obtenerTodoLft':
        obtenerTodoLft($conexion);
        break;
    case 'obtenerPeriodosEmpleado':
        obtenerPeriodosEmpleado($conexion);
        break;
    default:
        echo json_encode(['error' => 'Acción no válida']);
        break;
}

function obtenerPeriodosEmpleado($conexion) {
    $id_empleado = $_POST['id_empleado'] ?? 0;
    
    $sql = "SELECT p.*, v.nombre_version 
            FROM vacaciones_periodos p
            JOIN versiones_vacaciones_lft v ON p.id_version_vacaciones = v.id_version_vacaciones
            WHERE p.id_empleado = '$id_empleado'
            ORDER BY p.fecha_aniversario DESC";
            
    $result = mysqli_query($conexion, $sql);
    $periodos = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $periodos[] = $row;
    }
    echo json_encode($periodos);
}

function obtenerTodoLft($conexion) {
    // Obtener versiones
    $sql_v = "SELECT * FROM versiones_vacaciones_lft ORDER BY fecha_inicio_vigencia ASC";
    $res_v = mysqli_query($conexion, $sql_v);
    
    $todo = [];
    while ($v = mysqli_fetch_assoc($res_v)) {
        $id_v = $v['id_version_vacaciones'];
        // Para cada versión, traer sus días
        $sql_d = "SELECT * FROM dias_vacaciones_lft WHERE id_version_vacaciones = '$id_v' ORDER BY anios_antiguedad_inicio ASC";
        $res_d = mysqli_query($conexion, $sql_d);
        
        $v['tabla_dias'] = [];
        while ($d = mysqli_fetch_assoc($res_d)) {
            $v['tabla_dias'][] = $d;
        }
        $todo[] = $v;
    }
    echo json_encode($todo);
}

function obtenerVersiones($conexion) {
    $sql = "SELECT * FROM versiones_vacaciones_lft ORDER BY fecha_inicio_vigencia ASC";
    $result = mysqli_query($conexion, $sql);
    $versiones = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $versiones[] = $row;
    }
    echo json_encode($versiones);
}

function obtenerTablaPorVersion($conexion) {
    $id_version = $_POST['id_version'] ?? 0;
    $sql = "SELECT * FROM dias_vacaciones_lft WHERE id_version_vacaciones = '$id_version' ORDER BY anios_antiguedad_inicio ASC";
    $result = mysqli_query($conexion, $sql);
    $tabla = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $tabla[] = $row;
    }
    echo json_encode($tabla);
}
?>
