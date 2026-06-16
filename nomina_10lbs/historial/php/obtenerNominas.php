<?php 
require_once('../../../conexion/conexion.php');


switch ($_SERVER['REQUEST_METHOD']) {
    case 'POST':
   
        break;
    case 'GET':
        if (isset($_GET['case']) && $_GET['case'] === 'obtenerNominas') {
            obtenerNominas();
     
        } else if (isset($_GET['case']) && $_GET['case'] === 'obtenerDetalleNomina') {
            obtenerDetalleNomina();
        } else {
            echo json_encode(['error' => 'Case no válido']);
        }
        break;
    default:
        echo json_encode(['error' => 'Método no permitido']);
        break;
}

function obtenerNominas()
{
    global $conexion;

    $sql = "SELECT id_nomina_10lbs, anio, numero_semana, total_percepciones, total_deducciones, total_neto
            FROM nomina_10lbs
            ORDER BY anio DESC, numero_semana DESC";

    $resultado = mysqli_query($conexion, $sql);

    $nominas = [];

    while ($fila = mysqli_fetch_assoc($resultado)) {
        $nominas[] = $fila;
    }

    echo json_encode([
        'success' => true,
        'nominas' => $nominas
    ]);
}

function obtenerDetalleNomina()
{
    global $conexion;
    //obtener el id de la nomina a mostrar
    $id_nomina = isset($_GET['id']) ? $_GET['id'] : null;

    $sql = "SELECT nomina_10lbs
            FROM nomina_10lbs
            WHERE id_nomina_10lbs = $id_nomina";

    $resultado = mysqli_query($conexion, $sql);

    $jsonNomina = [];

    while ($fila = mysqli_fetch_assoc($resultado)) {
        $jsonNomina[] = $fila;
    }

    echo json_encode([
        'nomina' => $jsonNomina
    ]);
}

?>