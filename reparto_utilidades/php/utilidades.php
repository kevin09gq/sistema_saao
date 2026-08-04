<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../conexion/conexion.php';

// Verificar si la conexión a la base de datos es válida
if (!$conexion) {
    die("Error de conexión: " . mysqli_connect_error());
}

if (isset($_GET['accion']) || isset($_POST['accion'])) {
    $accion = $_GET['accion'] ?? $_POST['accion'];

    switch ($accion) {
            // Configurar ranchos
        case 'existe_utilidad':
            existe_utilidad();
            break;
        case 'guardar_utilidad':
            guardar_utilidad();
            break;
        case 'obtener_empleados':
            obtener_empleados();
            break;
        case 'buscar_anio':
            buscar_anio();
            break;

        case 'obtener_utilidades_historial':
            obtener_utilidades_historial();
            break;
        case 'borrar_utilidad':
            borrar_utilidad();
            break;

        default:
            respuesta(400, "Acción no reconocida", "La acción especificada no es válida.", "error", []);
            break;
    }
} else {
    respuesta(400, "Acción no reconocida", "La acción especificada no es válida.", "error", []);
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
 * Función para verificar si ya existe un cálculo de utilidad para el año seleccionado.
 */
function existe_utilidad()
{
    global $conexion;

    $anio = isset($_GET['anio']) ? (int)$_GET['anio'] : null;
    $id_departamento = isset($_GET['id_departamento']) ? (int)$_GET['id_departamento'] : null;

    if (empty($anio)) {
        respuesta(400, "Error", "Año no proporcionado", "error", []);
        return;
    }

    if (empty($id_departamento)) {
        respuesta(400, "Error", "ID de departamento no proporcionado", "error", []);
        return;
    }

    $sql = "SELECT anio, id_departamento, json_empleados FROM repartos_utilidades WHERE anio = ? AND id_departamento = ? LIMIT 1";
    $stmt = $conexion->prepare($sql);

    if (!$stmt) {
        respuesta(500, "Error", "Error en prepare: " . $conexion->error, "error", []);
        return;
    }

    $stmt->bind_param("ii", $anio, $id_departamento);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($row = $result->fetch_assoc()) {
        // Decodificar JSON almacenado
        $json_empleados = json_decode($row['json_empleados'], true);
        // Obtener el anio
        $anio = (int)$row['anio'];
        // Obtener el id_departamento
        $id_departamento = (int)$row['id_departamento'];

        // formar estructura de respuesta
        $data = [
            "anio" => $anio,
            "id_departamento" => $id_departamento,
            "empleados" => $json_empleados
        ];

        respuesta(200, "", "existe", "", $data);
    } else {
        respuesta(200, "", "no_existe", "", []);
    }

    $stmt->close();
}

/**
 * Función para obtener la lista de empleados y sus datos necesarios para el cálculo del utilidad.
 */
function obtener_empleados()
{
    global $conexion;

    // Verificar sesión
    if (!isset($_SESSION["logged_in"])) {
        respuestas(401, [], "Debes primero iniciar sesión", "Sesión no válida", "error");
    }

    $anio = isset($_GET['anio']) ? (int)$_GET['anio'] : null;

    if (empty($anio)) {
        respuesta(400, "Error", "Año no proporcionado", "error", []);
        return;
    }

    $id_departamento = isset($_GET['id_departamento']) ? (int)$_GET['id_departamento'] : null;

    if (empty($id_departamento)) {
        respuesta(400, "Error", "ID de departamento no proporcionado", "error", []);
        return;
    }

    // ==============================
    // CONSULTA SQL
    // ==============================
    $sqlDatos = "SELECT *
        FROM (
            SELECT
                e.id_empleado,
                e.clave_empleado,
                e.nombre,
                e.ap_paterno,
                e.ap_materno,
                e.salario_diario,
                e.status_nss AS status_seguro,
                e.id_empresa,
                e.id_departamento,
                d.nombre_departamento,
                e.id_puestoEspecial AS id_puesto,
                p.nombre_puesto,
                CASE 
                    WHEN MAX(hr.fecha_reingreso) IS NOT NULL 
                        THEN MAX(hr.fecha_reingreso)
                    ELSE e.fecha_alta_empresa
                END AS fecha_ingreso_real,
                e.fecha_alta_imss AS fecha_ingreso_imss,
                MAX(nd.color_depto_nomina) AS color_departamento
            FROM info_empleados e
            LEFT JOIN departamentos d ON e.id_departamento = d.id_departamento
            LEFT JOIN puestos_especiales p ON e.id_puestoEspecial = p.id_puestoEspecial
            LEFT JOIN nomina_departamento nd ON d.id_departamento = nd.id_departamento
            LEFT JOIN historial_reingresos hr ON e.id_empleado = hr.id_empleado
            WHERE e.id_status = 1
            GROUP BY
                e.id_empleado,
                e.clave_empleado,
                e.nombre,
                e.ap_paterno,
                e.ap_materno,
                e.salario_diario,
                e.status_nss,
                e.id_empresa,
                e.id_departamento,
                d.nombre_departamento,
                e.id_puestoEspecial,
                p.nombre_puesto
        ) AS empleados
        WHERE YEAR(fecha_ingreso_real) <= ?
            AND id_departamento = ?
        ORDER BY empleados.nombre ASC;
        ";

    $stmtDatos = $conexion->prepare($sqlDatos);

    if (!$stmtDatos) {
        respuestas(500, [], "Error en la consulta SQL", "Error", "error");
    }

    // ==============================
    // PASAR EL PARÁMETRO
    // ==============================
    $stmtDatos->bind_param("ii", $anio, $id_departamento); // "i" porque es un entero

    $stmtDatos->execute();
    $resultDatos = $stmtDatos->get_result();

    // ==============================
    // ARMAR ESTRUCTURA
    // ==============================
    $data = [];

    while ($row = $resultDatos->fetch_assoc()) {

        $empleado = [
            "id_empleado"           => (int)$row["id_empleado"],
            "clave_empleado"        => $row["clave_empleado"],
            "nombre"                => $row["nombre"],
            "ap_paterno"            => $row["ap_paterno"],
            "ap_materno"            => $row["ap_materno"],
            "status_seguro"         => (int)$row["status_seguro"],
            "salario_diario"        => (float)$row["salario_diario"],
            "salario_diario_copia"        => (float)$row["salario_diario"],


            "id_empresa"            => (int)$row["id_empresa"],
            "id_departamento"       => (int)$row["id_departamento"],
            "nombre_departamento"   => $row["nombre_departamento"],
            "id_puesto"             => (int)$row["id_puesto"],
            "nombre_puesto"         => $row["nombre_puesto"],

            "color_departamento"    => $row["color_departamento"],

            "fecha_ingreso_real"    => $row["fecha_ingreso_real"],
            "fecha_ingreso_imss"    => $row["fecha_ingreso_imss"],

            "fecha_ingreso_real_copia"    => $row["fecha_ingreso_real"],
            "fecha_ingreso_imss_copia"    => $row["fecha_ingreso_imss"],

            "usar_fecha_real"       => true,

            "dias_pago"             => 7,
            "dias_pago_copia"       => 7,

            "dias_ptu"              => 0,
            "dias_ptu_copia"        => 0,

            "ptu"                   => 0,
            "ptu_copia"             => 0,

            "tarjeta"               => 0,
            "tarjeta_copia"         => 0,

            "neto_pagar"            => 0,

            "redondeo"              => 0,
            "aplicar_redondeo"      => true,

            "neto_pagar_redondeado" => 0,

            "visible"               => true,

            "dias_trabajados"       => 0,
            "dias_trabajados_copia" => 0,
        ];

        $data[] = $empleado;
    }

    // ==============================
    // RESPUESTA FINAL
    // ==============================
    respuesta(200, "tmp_titulo", "tmp_texto", "tmp_icono", $data);
}

/**
 * Función para guardar el cálculo de utilidad en la base de datos.
 */
function guardar_utilidad()
{
    global $conexion;

    if (!isset($_POST['anio']) || !isset($_POST['id_departamento']) || !isset($_POST['empleados'])) {
        respuesta(400, "Error", "Datos incompletos", "error", []);
        return;
    }

    // Validar que el año sea un número entero
    $anio = (int)$_POST['anio'];
    // Validar que el ID de departamento sea un número entero
    $id_departamento = (int)$_POST['id_departamento'];
    // $json = json_encode($_POST['empleados'], JSON_UNESCAPED_UNICODE);
    $json = $_POST['empleados'];

    $conexion->begin_transaction();

    try {

        // 1. Verificar si ya existe el año
        $sql = "SELECT id_utilidad FROM repartos_utilidades WHERE anio = ? AND id_departamento = ? LIMIT 1";
        $stmt = $conexion->prepare($sql);

        if (!$stmt) {
            throw new Exception("Error en SELECT: " . $conexion->error);
        }

        $stmt->bind_param("ii", $anio, $id_departamento);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($row = $result->fetch_assoc()) {

            // Si existe actualiza el json y la fecha de creación
            $sql = "UPDATE repartos_utilidades 
                    SET json_empleados = ?, fecha_creacion = NOW() 
                    WHERE anio = ? AND id_departamento = ?";

            $stmt = $conexion->prepare($sql);

            if (!$stmt) {
                throw new Exception("Error en UPDATE: " . $conexion->error);
            }

            $stmt->bind_param("sii", $json, $anio, $id_departamento);
            $stmt->execute();

            $mensaje = "Actualizado exitosamente";
        } else {

            // Si no existe, inserta un nuevo registro
            $sql = "INSERT INTO repartos_utilidades (anio, id_departamento, json_empleados, fecha_creacion) 
                    VALUES (?, ?, ?, NOW())";

            $stmt = $conexion->prepare($sql);

            if (!$stmt) {
                throw new Exception("Error en INSERT: " . $conexion->error);
            }

            $stmt->bind_param("iis", $anio, $id_departamento, $json);
            $stmt->execute();

            $mensaje = "Guardado exitosamente";
        }

        $stmt->close();

        // Confirmar transacción
        $conexion->commit();

        respuesta(200, "Completado con exito", $mensaje, "success", []);
    } catch (Exception $e) {

        // Revertir en caso de error
        $conexion->rollback();

        respuesta(500, "Se encontro un error", $e->getMessage(), "error", []);
    }
}

/**
 * Función para verificar si ya existe un cálculo de utilidades para el año seleccionado.
 */
function buscar_anio()
{
    global $conexion;

    if (isset($_SESSION["logged_in"])) {

        $buscar = $_GET["buscar"] ?? '';

        if ($buscar === '') {
            // Sin búsqueda → solo 10 años distintos
            $sql = "SELECT DISTINCT anio 
                    FROM repartos_utilidades 
                    ORDER BY anio DESC 
                    LIMIT 10";
        } else {
            // Con búsqueda → todos los años distintos que empiecen con el prefijo
            $sql = "SELECT DISTINCT anio 
                    FROM repartos_utilidades 
                    WHERE anio LIKE CONCAT(?, '%')
                    ORDER BY anio DESC";
        }

        $pr = $conexion->prepare($sql);

        if ($buscar !== '') {
            $pr->bind_param("s", $buscar);
        }

        $pr->execute();
        $result = $pr->get_result();
        $data = $result->fetch_all(MYSQLI_ASSOC);

        respuesta(200, "datos obtenidos", "Obtenido con éxito", "success", $data);
        exit;
    } else {
        respuesta(401, "No autenticado", "Debes primero iniciar sesión", "error", []);
        exit;
    }
}


/**
 * =========================================================================
 * TODO ESTO ES PARA EL HISTORIAL
 * =========================================================================
 */

/**
 * Función para obtener los aguinaldos con paginación y búsqueda
 */
function obtener_utilidades_historial()
{
    global $conexion;

    try {
        // OBTENER EL NÚMERO DE PÁGINA (por defecto 1)
        $pagina = isset($_GET['pagina']) ? (int)$_GET['pagina'] : 1;
        $registrosPorPagina = 10;

        // OBTENER EL TÉRMINO DE BÚSQUEDA (por defecto vacío)
        $busqueda = isset($_GET['busqueda']) ? trim($_GET['busqueda']) : '';

        // CALCULAR EL OFFSET
        $offset = ($pagina - 1) * $registrosPorPagina;

        // CONSTRUIR LA CONSULTA BASE CON FILTRO DE BÚSQUEDA
        $sqlBase = "FROM repartos_utilidades";
        if (!empty($busqueda)) {
            $sqlBase .= " WHERE CAST(anio AS CHAR) LIKE CONCAT(?, '%')";
        }

        // OBTENER EL TOTAL DE REGISTROS
        $sqlTotal = "SELECT COUNT(*) as total " . $sqlBase;
        $stmtTotal = $conexion->prepare($sqlTotal);

        if (!$stmtTotal) {
            throw new Exception("Error en preparar la consulta de total: " . $conexion->error);
        }

        if (!empty($busqueda)) {
            $stmtTotal->bind_param("s", $busqueda);
        }

        $stmtTotal->execute();
        $resultTotal = $stmtTotal->get_result();
        $rowTotal = $resultTotal->fetch_assoc();
        $totalRegistros = (int)$rowTotal['total'];
        $totalPaginas = ceil($totalRegistros / $registrosPorPagina);

        // VALIDAR QUE LA PÁGINA SOLICITADA EXISTA
        if ($pagina < 1 || $pagina > $totalPaginas) {
            $pagina = 1;
            $offset = 0;
        }

        // OBTENER LOS DATOS PAGINADOS
        $sql = "SELECT * " . $sqlBase . " ORDER BY anio DESC LIMIT ? OFFSET ?";
        $stmt = $conexion->prepare($sql);

        if (!$stmt) {
            throw new Exception("Error en preparar la consulta: " . $conexion->error);
        }

        // BIND PARAMETERS DINÁMICAMENTE
        if (!empty($busqueda)) {
            $stmt->bind_param("sii", $busqueda, $registrosPorPagina, $offset);
        } else {
            $stmt->bind_param("ii", $registrosPorPagina, $offset);
        }

        $stmt->execute();
        $resultDatos = $stmt->get_result();

        // ==============================
        // ARMAR ESTRUCTURA
        // ==============================
        $data = [];

        while ($row = $resultDatos->fetch_assoc()) {

            // "id_utilidad " => encriptar((int)$row["id_utilidad "], CLAVE_ENCRIPTACION),

            $utilidad = [
                "id_utilidad" => (int)$row["id_utilidad"],
                "anio" => (int)$row["anio"],
                "jsonUtilidad" => json_decode($row["jsonUtilidad"], true)
            ];

            $data[] = $utilidad;
        }

        // RETORNAR CON INFORMACIÓN DE PAGINACIÓN
        $respuestaData = [
            "registros" => $data,
            "paginaActual" => $pagina,
            "totalPaginas" => $totalPaginas,
            "totalRegistros" => $totalRegistros,
            "registrosPorPagina" => $registrosPorPagina,
            "busqueda" => $busqueda
        ];

        respuesta(200, '', '', '', $respuestaData);
    } catch (Exception $e) {
        // Revertir en caso de error
        $conexion->rollback();
        respuesta(500, "Se encontro un error", $e->getMessage(), "error", []);
    }
}

/**
 * Función para borrar un registro de utilidad por su ID
 */
function borrar_utilidad()
{
    global $conexion;

    try {
        // OBTENER EL ID DE LA UTILIDAD A BORRAR
        $id_utilidad = isset($_POST['id_utilidad']) ? (int)$_POST['id_utilidad'] : 0;

        if ($id_utilidad <= 0) {
            throw new Exception("ID de utilidad inválido");
        }

        // PREPARAR LA CONSULTA PARA BORRAR EL REGISTRO
        $sql = "DELETE FROM repartos_utilidades WHERE id_utilidad = ?";
        $stmt = $conexion->prepare($sql);

        if (!$stmt) {
            throw new Exception("Error en preparar la consulta: " . $conexion->error);
        }

        $stmt->bind_param("i", $id_utilidad);
        $stmt->execute();

        if ($stmt->affected_rows > 0) {
            respuesta(200, "Registro borrado", "El registro se ha borrado con éxito", "success", []);
        } else {
            throw new Exception("No se encontró el registro a borrar");
        }
    } catch (Exception $e) {
        // Revertir en caso de error
        $conexion->rollback();
        respuesta(500, "Se encontro un error", $e->getMessage(), "error", []);
    }
}
