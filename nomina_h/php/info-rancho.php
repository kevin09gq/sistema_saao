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


        case 'obtener_tickets_pendientes':
            obtener_tickets_pendientes();
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
 * Función para obtener los departamentos que pertenecen a huasteca
 */
function obtenerDepartamento()
{
    global $conexion;

    // SQL PARA OBTENER LOS DEPARTAMENTOS ASIGNADOS AL ÁREA DE LA NÓMINA ESPECÍFICA (ID 4 - huasteca)
    $sql = "SELECT d.id_departamento, d.nombre_departamento
            FROM departamentos d
            INNER JOIN nomina_departamento nd ON d.id_departamento = nd.id_departamento
            WHERE nd.id_nomina = 4
            ORDER BY d.nombre_departamento ASC";

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
 * Función para obtener los puestos que pertenecen a huasteca
 */
function obtenerPuesto()
{
    global $conexion;

    if (empty($_GET["id_departamento"])) {
        respuesta(400, "Error", "No se proporcionó el ID del departamento", "error", []);
        return;
    }

    $id_departamento = $_GET["id_departamento"];

    // SQL PARA OBTENER LOS DEPARTAMENTOS QUE PERTENECEN A huasteca
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
function obtenerHorarioRancho()
{
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





/** ============================= RECUPERAR LOS TICKETS QUE ESTAN PENDIENTES DE AÑADIR A UNA NOMINA ============================= */

/**
 * Función para obtener los tickets que están pendientes de añadir a una nómina
 */
function obtener_tickets_pendientes()
{
    global $conexion;

    $nombre_rancho = "huasteca"; // Cambiar según el rancho que se esté consultando

    // Tablas dinámicas
    $nombre_tabla = "cortes_" . $nombre_rancho;
    $nombre_tabla_nomina = "nomina_" . $nombre_rancho;
    $id_tabla_nomina = "id_nomina_" . $nombre_rancho;
    $nombre_tabla_rejas = "cortes_" . $nombre_rancho . "_tablas";

    // Base SELECT con LEFT JOIN hacia nómina y rejas
    $sql = "SELECT
                c.id AS id_corte,
                n.anio,
                n.numero_semana,
                c.folio,
                c.estado,
                c.fecha_corte,
                c.nombre_cortador,
                c.precio_reja,
                r.num_tabla,
                r.rejas
            FROM {$nombre_tabla} c
            LEFT JOIN {$nombre_tabla_nomina} n 
                   ON c.id_nomina = n.{$id_tabla_nomina}
            LEFT JOIN {$nombre_tabla_rejas} r
                   ON c.id = r.id_corte
            WHERE n.anio IS NULL 
              AND n.numero_semana IS NULL 
              AND c.estado = 1
            ORDER BY c.fecha_corte DESC";

    $stmt = $conexion->prepare($sql);
    if (!$stmt) {
        respuesta(500, "Error", "Error en prepare: " . $conexion->error, "error", []);
        return;
    }

    $stmt->execute();
    $result = $stmt->get_result();
    $rows = $result->fetch_all(MYSQLI_ASSOC);

    // Agrupar por id_corte (único) en lugar de solo folio
    $structured = [];
    foreach ($rows as $row) {
        $id_corte = $row['id_corte'];

        if (!isset($structured[$id_corte])) {
            $structured[$id_corte] = [
                "id_corte" => $row['id_corte'],
                "anio" => $row['anio'],
                "numero_semana" => $row['numero_semana'],
                "folio" => $row['folio'],
                "estado" => $row['estado'],
                "fecha_corte" => $row['fecha_corte'],
                "nombre_cortador" => $row['nombre_cortador'],
                "precio_reja" => (float)$row['precio_reja'],
                "seleccionado" => false,
                "rejas" => []
            ];
        }

        if (!is_null($row['num_tabla'])) {
            $structured[$id_corte]["rejas"][] = [
                "num_tabla" => $row['num_tabla'],
                "rejas" => $row['rejas']
            ];
        }
    }

    // Convertir a arreglo indexado
    $structured = array_values($structured);

    if (!empty($structured)) {
        respuesta(200, "OK", "Cortes pendientes encontrados", "success", $structured);
    } else {
        respuesta(200, "OK", "No se encontraron cortes pendientes", "info", []);
    }

    $stmt->close();
}
