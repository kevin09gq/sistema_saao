<?php
require_once __DIR__ . '/../../../config/config.php';
require_once __DIR__ . '/../../../conexion/conexion.php';

// Verificar si la conexión a la base de datos es válida
if (!$conexion) {
    die("Error de conexión: " . mysqli_connect_error());
}

if (isset($_GET['accion']) || isset($_POST['accion'])) {
    $accion = $_GET['accion'] ?? $_POST['accion'];

    switch ($accion) {
        case 'obtener_anios':
            obtener_anios();
            break;
        case 'obtener_departamentos':
            obtener_departamentos();
            break;
        case 'obtener_utilidades':
            obtener_utilidades();
            break;
        case 'eliminar_utilidad':
            eliminar_utilidad();
            break;

        default:
            respuesta(400, "Acción no reconocida 2", "La acción especificada no es válida.", "error", []);
            break;
    }
} else {
    respuesta(400, "Acción no reconocida 1", "La acción especificada no es válida.", "error", []);
}

// ======================
// FUNCION PARA RESPONDER
// ======================
function respuesta(int $code, string $titulo, string $mensaje, string $icono, array $data)
{
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode([
        "titulo"  => $titulo,
        "texto" => $mensaje,
        "icono"   => $icono,
        "data"    => $data
    ], JSON_UNESCAPED_UNICODE);
}


// ======================================================
// SECCION PARA MANEJAR LA BASE DE DATOS DE UTILIDADES
// ======================================================


/**
 * Función para obtener los años distintos de la tabla repartos_utilidades
 */
function obtener_anios()
{
    global $conexion;

    $sql = "SELECT DISTINCT anio FROM repartos_utilidades ORDER BY anio DESC";
    $stmt = $conexion->prepare($sql);

    if (!$stmt) {
        respuesta(500, "Error", "Error en prepare: " . $conexion->error, "error", []);
        return;
    }
    $stmt->execute();
    $result = $stmt->get_result();

    if ($row = $result->fetch_assoc()) {

        // Convertir el resultado a un array de años
        $anios = [];
        do {
            $anios[] = $row['anio'];
        } while ($row = $result->fetch_assoc());

        respuesta(200, "", "existe", "", $anios);
    } else {
        respuesta(200, "", "no_existe", "", []);
    }

    $stmt->close();
}

/**
 * Función para obtener los departamentos
 */
function obtener_departamentos()
{
    global $conexion;

    $sql = "SELECT * FROM departamentos ORDER BY nombre_departamento ASC";
    $stmt = $conexion->prepare($sql);

    if (!$stmt) {
        respuesta(500, "Error", "Error en prepare: " . $conexion->error, "error", []);
        return;
    }
    $stmt->execute();
    $result = $stmt->get_result();

    if ($row = $result->fetch_assoc()) {
        // Convertir el resultado a un array de departamentos
        $departamentos = [];

        do {
            $departamentos[] = [
                'id_departamento' => $row['id_departamento'],
                'nombre_departamento' => $row['nombre_departamento']
            ];
        } while ($row = $result->fetch_assoc());

        respuesta(200, "", "existe", "", $departamentos);
    } else {
        respuesta(200, "", "no_existe", "", []);
    }

    $stmt->close();
}

/**
 * Función para obtener el historial de utilidades
 */
function obtener_utilidades()
{
    global $conexion;

    // OBTENER LOS VALORES DE FILTRADO
    $busqueda     = $_POST['busqueda'] ?? '';
    $anio         = $_POST['anio'] ?? '';
    $departamento = $_POST['departamento'] ?? '';
    $limite       = $_POST['limite'] ?? 20;
    $pagina       = $_POST['pagina'] ?? 1;

    // Consulta base
    $sqlBase = "SELECT
                    COALESCE(u.id_utilidad, 0) AS id_utilidad,
                    y.anio,
                    d.nombre_departamento,
                    d.id_departamento,
                    COALESCE(JSON_UNQUOTE(u.json_empleados), 'Pendiente') AS empleados,
                    COALESCE(DATE_FORMAT(u.fecha_creacion, '%Y-%m-%d'), 'Pendiente') AS fecha_creacion
                FROM departamentos d
                CROSS JOIN (SELECT DISTINCT anio FROM repartos_utilidades) y
                LEFT JOIN repartos_utilidades u 
                    ON d.id_departamento = u.id_departamento 
                    AND u.anio = y.anio
                WHERE 1=1";

    // Filtros dinámicos
    $params = [];
    $types  = "";

    if (!empty($anio)) {
        $sqlBase .= " AND y.anio = ?";
        $types   .= "i";
        $params[] = $anio;
    }

    if (!empty($departamento)) {
        $sqlBase .= " AND d.id_departamento = ?";
        $types   .= "i";
        $params[] = $departamento;
    }

    if (!empty($busqueda)) {
        $sqlBase .= " AND d.nombre_departamento LIKE ?";
        $types   .= "s";
        $params[] = "%$busqueda%";
    }

    // Ordenar por año descendente y nombre de departamento
    $sqlBase .= " ORDER BY y.anio DESC, d.nombre_departamento ASC";

    // ---- 1. Contar total de registros ----
    $stmtTotal = $conexion->prepare($sqlBase);
    if (!$stmtTotal) {
        respuesta(500, "Error", "Error en prepare (total): " . $conexion->error, "error", []);
        return;
    }
    if (!empty($params)) {
        $stmtTotal->bind_param($types, ...$params);
    }
    $stmtTotal->execute();
    $resultTotal    = $stmtTotal->get_result();
    $totalRegistros = $resultTotal->num_rows;
    $stmtTotal->close();

    // ---- 2. Aplicar paginación ----
    $offset = 0;
    if ($limite != -1) {
        $offset   = ($pagina - 1) * $limite;
        $sqlBase .= " LIMIT ? OFFSET ?";
        $types   .= "ii";
        $params[] = $limite;
        $params[] = $offset;
    }

    $stmt = $conexion->prepare($sqlBase);
    if (!$stmt) {
        respuesta(500, "Error", "Error en prepare (data): " . $conexion->error, "error", []);
        return;
    }
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }

    $stmt->execute();
    $result = $stmt->get_result();

    $utilidades = [];
    while ($row = $result->fetch_assoc()) {
        $utilidades[] = [
            'id_utilidad'       => $row['id_utilidad'],
            'anio'              => $row['anio'],
            'nombre_departamento'=> $row['nombre_departamento'],
            'id_departamento'   => $row['id_departamento'],
            'empleados'         => $row['empleados'] == 'Pendiente' ? [] : json_decode($row['empleados'], true),
            'fecha_creacion'    => $row['fecha_creacion']
        ];
    }

    $stmt->close();

    // ---- 3. Respuesta con metadatos ----
    respuesta(200, "", "existe", "", [
        'total'  => $totalRegistros,
        'pagina' => (int)$pagina,
        'limite' => (int)$limite,
        'inicio' => $offset,
        'data'   => $utilidades
    ]);
}

/**
 * Función para eliminar una utilidad
 */
function eliminar_utilidad() {
    global $conexion;

    // Verificar si se ha proporcionado un ID de utilidad
    if (!isset($_POST['id_utilidad'])) {
        respuesta(400, "Error", "No se proporcionó un ID de utilidad.", "error", []);
        return;
    }

    $id_utilidad = $_POST['id_utilidad'];

    // Preparar la consulta SQL para eliminar la utilidad
    $sql = "DELETE FROM repartos_utilidades WHERE id_utilidad = ?";
    $stmt = $conexion->prepare($sql);

    if (!$stmt) {
        respuesta(500, "Error", "Error en prepare: " . $conexion->error, "error", []);
        return;
    }

    $stmt->bind_param("i", $id_utilidad);

    // Ejecutar la consulta y verificar si se eliminó alguna fila
    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            respuesta(200, "Eliminado con exito", "El registro de Reparto de Utilidades ha sido eliminado correctamente.", "success", []);
        } else {
            respuesta(404, "No encontrado", "No se encontró la utilidad con el ID proporcionado.", "warning", []);
        }
    } else {
        respuesta(500, "Error", "Error al eliminar la utilidad: " . $stmt->error, "error", []);
    }

    $stmt->close();
}