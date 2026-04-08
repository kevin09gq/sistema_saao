<?php
require_once __DIR__ . '/../../conexion/conexion.php';

// Verificar si la conexión a la base de datos es válida
if (!$conexion) {
    die("Error de conexión: " . mysqli_connect_error());
}

if (isset($_GET['accion']) || isset($_POST['accion'])) {
    $accion = $_GET['accion'] ?? $_POST['accion'];

    switch ($accion) {

            // DEPARTAMENTOS
        case 'obtenerDepartamento':
            obtenerDepartamento();
            break;
         case 'obtenerPuesto':
            obtenerPuesto();
            break;
        case 'obtenerHorarioRancho':
            obtenerHorarioRancho();
            break;


        default:
            respuesta(400, "Error", "Acción no reconocida", "error", []);
            break;
    }
} else {
    respuesta(400, "Error", "No se especificó ninguna acción", "error", []);
}

/**
 * Función para enviar una respuesta JSON al cliente
 */
function respuesta(int $code, string $titulo, string $mensaje, string $icono, array $data)
{
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode([
        "titulo"  => $titulo,
        "mensaje" => $mensaje,
        "icono"   => $icono,
        "data"    => $data
    ], JSON_UNESCAPED_UNICODE);
}



/** ============================= FUNCIONES AUXILIARES PARA OBTENER DATOS ============================= */

/**
 * Función para obtener los departamentos que pertenecen a Palmilla
 */
function obtenerDepartamento()
{
    global $conexion;

    // SQL PARA OBTENER LOS DEPARTAMENTOS ASIGNADOS AL ÁREA DE LA NÓMINA ESPECÍFICA (ID 7 - PALMILLA)
    $sql = "SELECT d.* 
            FROM departamentos d 
            INNER JOIN areas_departamentos ad ON d.id_departamento = ad.id_departamento 
            INNER JOIN nombre_nominas n ON ad.id_area = n.id_area 
            WHERE n.id_nomina = 7";
            
    $stmt = $conexion->prepare($sql);
    $stmt->execute();
    $result = $stmt->get_result();

    $dep = [];
    while ($row = $result->fetch_assoc()) {
        $dep[] = $row;
    }

    respuesta(200, "exito", "exito", "success", $dep);
}


/**
 * Función para obtener los puestos que pertenecen a Palmilla
 */
function obtenerPuesto() {
    global $conexion;

    if (empty($_GET["id_departamento"])) {
        respuesta(400, "Error", "No se proporcionó el ID del departamento", "error", []);
        return;
    }

    $id_departamento = $_GET["id_departamento"];

    // SQL PARA OBTENER LOS DEPARTAMENTOS QUE PERTENECEN A RELICARIO
    $sql = "SELECT
                dp.id_puestoEspecial,
                pe.nombre_puesto
            FROM departamentos_puestos dp
            INNER JOIN puestos_especiales pe ON dp.id_puestoEspecial = pe.id_puestoEspecial
            WHERE dp.id_departamento = ?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("i", $id_departamento);
    $stmt->execute();
    $result = $stmt->get_result();

    $dep = [];
    while ($row = $result->fetch_assoc()) {
        $dep[] = $row;
    }

    respuesta(200, "exito", "exito", "success", $dep);
}

/**
 * Función para obtener el horario del rancho
 */
function obtenerHorarioRancho() {
    global $conexion;

    if (empty($_GET["id_area"])) {
        respuesta(400, "Error", "No se proporcionó el ID del área", "error", []);
        return;
    }

    $id_area = $_GET["id_area"];

    // SQL PARA OBTENER EL HORARIO DEL RANCHO
    $sql = "SELECT horario_jornalero, num_arboles FROM info_ranchos WHERE id_area = ?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("i", $id_area);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        respuesta(200, "exito", "Horario obtenido correctamente", "success", $row);
    } else {
        respuesta(404, "Error", "No se encontró horario para esta área", "error", []);
    }
}