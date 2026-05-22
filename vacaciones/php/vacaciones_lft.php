<?php
require_once '../../conexion/conexion.php';
/** @var mysqli $conexion */
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
    case 'obtenerFestividades':
        obtenerFestividades($conexion);
        break;
    default:
        echo json_encode(['error' => 'Acción no válida']);
        break;
}



function obtenerTodoLft($conexion)
{
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

function obtenerVersiones($conexion)
{
    $sql = "SELECT * FROM versiones_vacaciones_lft ORDER BY fecha_inicio_vigencia ASC";
    $result = mysqli_query($conexion, $sql);
    $versiones = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $versiones[] = $row;
    }
    echo json_encode($versiones);
}

function obtenerTablaPorVersion($conexion)
{
    $id_version = $_POST['id_version'] ?? 0;
    $sql = "SELECT * FROM dias_vacaciones_lft WHERE id_version_vacaciones = '$id_version' ORDER BY anios_antiguedad_inicio ASC";
    $result = mysqli_query($conexion, $sql);
    $tabla = [];
    while ($row = mysqli_fetch_assoc($result)) {
        $tabla[] = $row;
    }
    echo json_encode($tabla);
}


function obtenerFestividades($conexion)
{
    $sql = "SELECT fecha FROM festividades";
    $res = mysqli_query($conexion, $sql);
    $fechas = [];
    if ($res) {
        while ($row = mysqli_fetch_assoc($res)) {
            $fechas[] = $row['fecha'];
        }
    }
    echo json_encode($fechas);
}
