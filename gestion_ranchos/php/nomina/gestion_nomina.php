<?php
require_once __DIR__ . '/../../../public/php/verificarSesion.php';
require_once __DIR__ . '/../../../conexion/conexion.php';
require_once __DIR__ . '/../utilidades.php';

// Verificar si la conexión a la base de datos es válida
if (!$conexion) {
    die("Error de conexión: " . mysqli_connect_error());
}

if (isset($_GET['accion']) || isset($_POST['accion'])) {
    $accion = $_GET['accion'] ?? $_POST['accion'];

    switch ($accion) {
        case 'obtener_ranchos':
            obtener_ranchos();
            break;
        case 'obtener_anios_nomina':
            obtener_anios_nomina();
            break;
        case 'obtener_semanas_nomina':
            obtener_semanas_nomina();
            break;
        case 'obtener_nominas_corte':
            obtener_nominas_corte();
            break;

        default:
            respuesta(400, "Acción no reconocida", "La acción especificada no es válida.", "error", []);
            break;
    }
} else {
    respuesta(400, "Acción no reconocida", "La acción especificada no es válida.", "error", []);
}


// ===================================================================================================

/**
 * Función para obtener los ranchos de la base de datos.
 */
function obtener_ranchos()
{
    global $conexion;

    $sql = "SELECT id_area, nombre_area 
            FROM areas 
            WHERE nombre_area LIKE '%rancho%'";

    $stmt = $conexion->prepare($sql);

    if (!$stmt) {
        respuesta(500, "Error", "Error en prepare: " . $conexion->error, "error", []);
        return;
    }

    $stmt->execute();
    $result = $stmt->get_result();

    $data = $result->fetch_all(MYSQLI_ASSOC);

    if (!empty($data)) {
        respuesta(200, "OK", "Áreas encontradas", "success", $data);
    } else {
        respuesta(200, "OK", "No se encontraron áreas con 'Rancho'", "info", []);
    }

    $stmt->close();
}

/**
 * Función para obtener los años de cortes de un rancho específico.
 */
function obtener_anios_nomina()
{
    global $conexion;

    $nombre_rancho = $_GET['nombre_rancho'] ?? '';

    if (empty($nombre_rancho)) {
        respuesta(400, "Error", "El nombre del rancho es obligatorio.", "error", []);
        return;
    }

    $nombre_tabla = "nomina_" . $nombre_rancho; // Construir el nombre de la tabla dinámicamente
    $nombre_tabla_join = "nomina_" . $nombre_rancho . "_corte"; // Construir el nombre de la tabla para el JOIN

    $sql = "SELECT DISTINCT
                r.anio
            FROM {$nombre_tabla} r
            INNER JOIN {$nombre_tabla_join} nc
                ON nc.id_nomina = r.id_nomina_{$nombre_rancho}
            ORDER BY r.anio DESC";

    $stmt = $conexion->prepare($sql);

    if (!$stmt) {
        respuesta(500, "Error", "Error en prepare: " . $conexion->error, "error", []);
        return;
    }

    $stmt->execute();
    $result = $stmt->get_result();

    $data = $result->fetch_all(MYSQLI_ASSOC);

    if (!empty($data)) {
        respuesta(200, "OK", "Año encontrado", "success", $data);
    } else {
        respuesta(200, "OK", "No se encontraron años", "info", []);
    }

    $stmt->close();
}

/**
 * Función para obtener las semanas de cortes de un rancho específico.
 */
function obtener_semanas_nomina()
{
    global $conexion;

    $nombre_rancho = $_GET['nombre_rancho'] ?? '';
    $anio = $_GET['anio'] ?? '';

    if (empty($nombre_rancho)) {
        respuesta(400, "Error", "El nombre del rancho es obligatorio.", "error", []);
        return;
    }

    if (empty($anio)) {
        respuesta(400, "Error", "El año es obligatorio.", "error", []);
        return;
    }


    $nombre_tabla = "nomina_" . $nombre_rancho;
    $nombre_tabla_join = "nomina_" . $nombre_rancho . "_corte";

    $sql = "SELECT DISTINCT
                r.numero_semana
            FROM {$nombre_tabla} r
            INNER JOIN {$nombre_tabla_join} nc
                ON nc.id_nomina = r.id_nomina_{$nombre_rancho}";

    if ($anio != '-1') {
        $sql .= " WHERE r.anio = ?";
    }

    $sql .= " ORDER BY r.numero_semana ASC";

    $stmt = $conexion->prepare($sql);

    if (!$stmt) {
        respuesta(500, "Error", "Error en prepare: " . $conexion->error, "error", []);
        return;
    }

    if ($anio != '-1') {
        $stmt->bind_param("i", $anio);
    }

    $stmt->execute();
    $result = $stmt->get_result();

    $data = $result->fetch_all(MYSQLI_ASSOC);

    if (!empty($data)) {
        respuesta(200, "OK", "Semanas encontradas", "success", $data);
    } else {
        respuesta(200, "OK", "No se encontraron semanas", "info", []);
    }

    $stmt->close();
}

/**
 * Función para obtener los cortes de un rancho específico según los filtros proporcionados.
 */
function obtener_nominas_corte()
{
    global $conexion;

    $nombre_rancho = $_GET['nombre_rancho'] ?? '';
    $anio = $_GET['anio'] ?? '-1';
    $semana = $_GET['semana'] ?? '-1';

    $sqlBase = "SELECT
            nc.*,
            r.anio,
            r.numero_semana,
            JSON_UNQUOTE(
                JSON_EXTRACT(r.nomina_{$nombre_rancho}, '$.fecha_inicio')
            ) AS fecha_inicio,
            JSON_UNQUOTE(
                JSON_EXTRACT(r.nomina_{$nombre_rancho}, '$.fecha_cierre')
            ) AS fecha_fin
        FROM nomina_{$nombre_rancho}_corte nc
        INNER JOIN nomina_{$nombre_rancho} r
            ON nc.id_nomina = r.id_nomina_{$nombre_rancho}
    ";

    if ($anio == -1 && $semana == -1) {

        $sql = $sqlBase . "
            ORDER BY r.anio DESC, r.numero_semana DESC
        ";

        $stmt = $conexion->prepare($sql);
    } elseif ($anio != -1 && $semana == -1) {

        $sql = $sqlBase . "
            WHERE r.anio = ?
            ORDER BY r.anio DESC, r.numero_semana DESC
        ";

        $stmt = $conexion->prepare($sql);
        $stmt->bind_param("i", $anio);
    } elseif ($anio == -1 && $semana != -1) {

        $sql = $sqlBase . "
            WHERE r.numero_semana = ?
            ORDER BY r.anio DESC, r.numero_semana DESC
        ";

        $stmt = $conexion->prepare($sql);
        $stmt->bind_param("i", $semana);
    } elseif ($anio != -1 && $semana != -1) {

        $sql = $sqlBase . "
            WHERE r.anio = ?
            AND r.numero_semana = ?
            ORDER BY r.anio DESC, r.numero_semana DESC
        ";

        $stmt = $conexion->prepare($sql);
        $stmt->bind_param("ii", $anio, $semana);
    } else {

        respuesta(
            400,
            "Error",
            "Parámetros inválidos.",
            "error",
            []
        );

        return;
    }

    if (!$stmt) {
        respuesta(
            500,
            "Error",
            "Error en prepare: " . $conexion->error,
            "error",
            []
        );
        return;
    }

    $stmt->execute();

    $result = $stmt->get_result();
    $data = $result->fetch_all(MYSQLI_ASSOC);

    if (!empty($data)) {

        respuesta(
            200,
            "OK",
            "Registros encontrados",
            "success",
            $data
        );
    } else {

        respuesta(
            200,
            "OK",
            "No se encontraron registros",
            "info",
            []
        );
    }

    $stmt->close();
}
