<?php
session_start();
require_once __DIR__ . '/../../public/php/config.php';
require_once __DIR__ . '/../../conexion/conexion.php';

// Verificar sesión
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    header('Content-Type: application/json');
    echo json_encode(['titulo' => 'No autenticado', 'texto' => 'Debes iniciar sesión', 'icono' => 'error', 'data' => []]);
    exit;
}

// Verificar si la conexión a la base de datos es válida
if (!$conexion) {
    header('Content-Type: application/json');
    echo json_encode(['titulo' => 'Error', 'texto' => 'Error de conexión: ' . mysqli_connect_error(), 'icono' => 'error', 'data' => []]);
    exit;
}

if (isset($_GET['accion']) || isset($_POST['accion'])) {
    $accion = $_GET['accion'] ?? $_POST['accion'];

    switch ($accion) {
            // Configurar ranchos
        case 'existe_aguinaldo':
            existe_aguinaldo();
            break;
        case 'guardar_aguinaldo':
            guardar_aguinaldo();
            break;
        case 'obtener_empleados':
            obtener_empleados();
            break;
        case 'buscar_anio':
            buscar_anio();
            break;


        case 'obtener_aguinaldos':
            obtener_aguinaldos();
            break;
        case 'borrar_aguinaldo':
            borrar_aguinaldo();
            break;
        case 'obtener_anios':
            obtener_anios();
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
// SECCION PARA MANEJAR LA BASE DE DATOS DE AGUINALDOS
// ======================================================


/**
 * Función para verificar si ya existe un cálculo de aguinaldo para el año seleccionado.
 */
function existe_aguinaldo()
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

    $sql = "SELECT jsonAguinaldo FROM aguinaldos WHERE anio = ? AND id_departamento = ? LIMIT 1";
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
        $jsonAguinaldo = json_decode($row['jsonAguinaldo'], true);

        respuesta(200, "", "existe", "", $jsonAguinaldo);
    } else {
        respuesta(200, "", "no_existe", "", []);
    }

    $stmt->close();
}

/**
 * Función para guardar el cálculo de aguinaldo en la base de datos.
 */
function guardar_aguinaldo()
{
    global $conexion;

    if (!isset($_POST['anio']) || !isset($_POST['json']) || !isset($_POST['id_departamento'])) {
        respuesta(400, "Error", "Datos incompletos", "error", []);
        return;
    }

    $anio = (int)$_POST['anio'];
    $id_departamento = (int)$_POST['id_departamento'];
    // $jsonAguinaldo = json_encode($_POST['json'], JSON_UNESCAPED_UNICODE);
    $jsonAguinaldo = $_POST['json'];

    $conexion->begin_transaction();

    try {

        // 1. Verificar si ya existe el año
        $sql = "SELECT id_aguinaldo FROM aguinaldos WHERE anio = ? AND id_departamento = ? LIMIT 1";
        $stmt = $conexion->prepare($sql);

        if (!$stmt) {
            throw new Exception("Error en SELECT: " . $conexion->error);
        }

        $stmt->bind_param("ii", $anio, $id_departamento);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($row = $result->fetch_assoc()) {

            // Si existe actualiza el json y la fecha de creación
            $sql = "UPDATE aguinaldos 
                    SET jsonAguinaldo = ?, fecha_creacion = NOW() 
                    WHERE anio = ? AND id_departamento = ?";

            $stmt = $conexion->prepare($sql);

            if (!$stmt) {
                throw new Exception("Error en UPDATE: " . $conexion->error);
            }

            $stmt->bind_param("sii", $jsonAguinaldo, $anio, $id_departamento);
            $stmt->execute();

            $mensaje = "Registro de aguinaldo actualizado exitosamente";
        } else {

            // Si no existe, inserta un nuevo registro
            $sql = "INSERT INTO aguinaldos (jsonAguinaldo, anio, id_departamento, fecha_creacion) 
                    VALUES (?, ?, ?, NOW())";

            $stmt = $conexion->prepare($sql);

            if (!$stmt) {
                throw new Exception("Error en INSERT: " . $conexion->error);
            }

            $stmt->bind_param("sii", $jsonAguinaldo, $anio, $id_departamento);
            $stmt->execute();

            $mensaje = "Registro de aguinaldo guardado exitosamente";
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
 * Función para obtener la lista de empleados y sus datos necesarios para el cálculo del aguinaldo.
 */
function obtener_empleados()
{
    global $conexion;

    // Verificar sesión
    if (!isset($_SESSION["logged_in"])) {
        respuestas(401, [], "Debes primero iniciar sesión", "Sesión no válida", "error");
    }

    $id_departamento = isset($_GET['id_departamento']) ? (int)$_GET['id_departamento'] : null;

    if (empty($id_departamento)) {
        respuesta(400, "Error", "ID de departamento no proporcionado", "error", []);
        return;
    }

    // ==============================
    // CONSULTA SQL
    // ==============================
    $sqlDatos = "SELECT
                e.id_empleado,
                e.clave_empleado,
                e.nombre,
                e.ap_paterno,
                e.ap_materno,
                e.id_empresa,
                e.status_nss,
                e.salario_diario,

                -- Fecha ingreso real considerando reingresos
                CASE 
                    WHEN MAX(hr.fecha_reingreso) IS NOT NULL 
                        THEN MAX(hr.fecha_reingreso)
                    ELSE e.fecha_alta_empresa
                END AS fecha_ingreso_real,

                e.fecha_alta_imss AS fecha_ingreso_imss,

                d.nombre_departamento,
                e.id_departamento,

                e.id_puestoEspecial AS id_puesto,
                p.nombre_puesto,

                e.id_area,

                MAX(nd.color_depto_nomina) AS color_departamento

            FROM info_empleados e

            LEFT JOIN departamentos d 
                ON e.id_departamento = d.id_departamento

            LEFT JOIN puestos_especiales p
                ON e.id_puestoEspecial = p.id_puestoEspecial

            LEFT JOIN historial_reingresos hr 
                ON e.id_empleado = hr.id_empleado

            LEFT JOIN nomina_departamento nd
                ON d.id_departamento = nd.id_departamento

            WHERE e.id_status = 1 AND e.id_departamento = ?

            GROUP BY e.id_empleado, e.clave_empleado, e.nombre, e.ap_paterno, e.ap_materno, 
                     e.id_empresa, e.status_nss, e.salario_diario, d.nombre_departamento, 
                     d.id_departamento, e.id_puestoEspecial, p.nombre_puesto, e.id_area

            ORDER BY e.nombre ASC";

    $stmtDatos = $conexion->prepare($sqlDatos);

    if (!$stmtDatos) {
        respuestas(500, [], "Error en la consulta SQL", "Error", "error");
    }

    $stmtDatos->bind_param("i", $id_departamento);
    $stmtDatos->execute();
    $resultDatos = $stmtDatos->get_result();

    // ==============================
    // ARMAR ESTRUCTURA
    // ==============================
    $data = [];

    while ($row = $resultDatos->fetch_assoc()) {

        $empleado = [
            "id_empleado"        => (int)$row["id_empleado"],
            "clave_empleado"     => $row["clave_empleado"],
            "nombre"             => $row["nombre"],
            "ap_paterno"         => $row["ap_paterno"],
            "ap_materno"         => $row["ap_materno"],
            "id_empresa"         => (int)$row["id_empresa"],
            "status_nss"         => (int)$row["status_nss"],
            "salario_diario"     => $row["salario_diario"],

            "fecha_ingreso_real" => $row["fecha_ingreso_real"],
            // Por defecto es null, se obtiene luego
            "fecha_ingreso_imss" => $row["fecha_ingreso_imss"],

            "nombre_departamento" => $row["nombre_departamento"],
            "color_departamento"  => $row["color_departamento"],
            "id_departamento"     => (int)$row["id_departamento"],
            "nombre_puesto"       => $row["nombre_puesto"],
            "id_puesto"           => (int)$row["id_puesto"],
            "id_area"             => (int)$row["id_area"],

            // Conceptos inicializados en 0
            "isr" => 0,
            "tarjeta" => 0,

            // Copias de los concepto
            "isr_cp" => 0,
            "tarjeta_cp" => 0,

            // Dias trabajados total
            "dias_trabajados_tmp" => 0,
            // Inicializaciones para calcular luego
            "total_ausencias"   => 0,
            // Por defecto es 0, será la resta de dias_trabajados_tmp - total_ausencias
            "dias_trabajados"   => 0,
            // Por defecto es 0, se calcula luego con dias_trabajados/30.4
            "meses_trabajados"  => 0,
            // Por defecto es 0, se calcula luego
            "aguinaldo"         => 0,
            // Neto = aguinaldo - isr - tarjeta, por defecto es 0
            "neto_pagar"        => 0,

            // Por defecto se usa la fecha real, si es 0 entonces usa la fecha de ingreso del IMSS
            "usar_fecha_real" => 1,
            // Por defecto no se usan las ausencias, si es 1 entonces se toman en cuenta para el cálculo
            "usar_ausencias"  => 0,
            // Por defecto es null, la define el usuario
            "fecha_pago"      => null,

            // Por defecto se pagan 15 días, el usuario puede cambiarlo
            "dias_pago"      => 15,
            // Saber si el empleado tiene derecho aguinaldo, tiene más de 60 días trabajados en el año
            // Por defecto es false, se calcula luego con los días trabajados
            "derecho_aguinaldo" => false,
            // Para saber si mostrar o no en la interfaz
            // Por defecto es true
            "visible" => true,
            // Aplicar redondeo
            "aplicar_redondeo" => true,

            // Redondeo
            "redondeo" => 0,
            // Neto a pagar redondeado
            "neto_pagar_redondeado" => 0
        ];

        $data[] = $empleado;
    }

    // ==============================
    // RESPUESTA FINAL
    // ==============================
    respuesta(200, "tmp_titulo", "tmp_texto", "tmp_icono", $data);
}


/**
 * Función para verificar si ya existe un cálculo de aguinaldo para el año seleccionado.
 */
function buscar_anio()
{
    global $conexion;

    if (isset($_SESSION["logged_in"])) {

        $buscar = $_GET["buscar"] ?? '';

        if ($buscar === '') {
            // Sin búsqueda → solo 10 años únicos ordenados descendentemente
            $sql = "SELECT DISTINCT anio 
                FROM aguinaldos 
                ORDER BY anio DESC
                LIMIT 10";
        } else {
            // Con búsqueda → años únicos que empiecen con el prefijo
            $sql = "SELECT DISTINCT anio 
                FROM aguinaldos
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
 * Función para obtener el historial de aguinaldos con paginación y búsqueda
 * ESTA CHINGADERA YA NO SIRVE, SE USABA EN LA VIEJA VERSION
 * HAY QUE BORRARLA LUEGO A LA VRG
 */
function obtener_aguinaldos_historial()
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
        $sqlBase = "FROM aguinaldos";
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

            // "id_aguinaldo" => encriptar((int)$row["id_aguinaldo"], CLAVE_ENCRIPTACION),

            $aguinaldo = [
                "id_aguinaldo" => (int)$row["id_aguinaldo"],
                "anio" => (int)$row["anio"],
                "jsonAguinaldo" => json_decode($row["jsonAguinaldo"], true)
            ];

            $data[] = $aguinaldo;
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
 * Función para obtener el historial de aguinaldos con paginación y búsqueda
 */
function obtener_aguinaldos()
{
    global $conexion;

    // OBTENER LOS VALORES DE FILTRADO
    $busqueda     = $_POST['busqueda'] ?? '';
    $anio         = $_POST['anio'] ?? '';
    $area         = $_POST['area'] ?? '';
    $departamento = $_POST['departamento'] ?? '';
    $limite       = $_POST['limite'] ?? 20;
    $pagina       = $_POST['pagina'] ?? 1;

    // Consulta base
    $sqlBase = "SELECT
                    COALESCE(u.id_aguinaldo, 0) AS id_aguinaldo,
                    y.anio,
                    d.nombre_departamento,
                    d.id_departamento,
                    COALESCE(JSON_UNQUOTE(u.jsonAguinaldo), 'Pendiente') AS jsonAguinaldo,
                    COALESCE(DATE_FORMAT(u.fecha_creacion, '%Y-%m-%d'), 'Pendiente') AS fecha_creacion
                FROM departamentos d
                CROSS JOIN (SELECT DISTINCT anio FROM aguinaldos) y
                LEFT JOIN aguinaldos u
                    ON d.id_departamento = u.id_departamento
                    AND u.anio = y.anio";

    // Si viene filtro de área, hacer JOIN con areas_departamentos
    if (!empty($area)) {
        $sqlBase .= " INNER JOIN areas_departamentos ad ON d.id_departamento = ad.id_departamento";
    }

    $sqlBase .= " WHERE 1=1";

    // Filtros dinámicos
    $params = [];
    $types  = "";

    if (!empty($area)) {
        $sqlBase .= " AND ad.id_area = ?";
        $types   .= "i";
        $params[] = $area;
    }

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
            'id_aguinaldo'       => $row['id_aguinaldo'],
            'anio'              => $row['anio'],
            'nombre_departamento'=> $row['nombre_departamento'],
            'id_departamento'   => $row['id_departamento'],
            'jsonAguinaldo'         => $row['jsonAguinaldo'] == 'Pendiente' ? [] : json_decode($row['jsonAguinaldo'], true),
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
 * Función para borrar un registro de aguinaldo por su ID
 */
function borrar_aguinaldo()
{
    global $conexion;

    try {
        // OBTENER EL ID DEL AGUINALDO A BORRAR
        $id_aguinaldo = isset($_POST['id_aguinaldo']) ? (int)$_POST['id_aguinaldo'] : 0;

        if ($id_aguinaldo <= 0) {
            throw new Exception("ID de aguinaldo inválido");
        }

        // PREPARAR LA CONSULTA PARA BORRAR EL REGISTRO
        $sql = "DELETE FROM aguinaldos WHERE id_aguinaldo = ?";
        $stmt = $conexion->prepare($sql);

        if (!$stmt) {
            throw new Exception("Error en preparar la consulta: " . $conexion->error);
        }

        $stmt->bind_param("i", $id_aguinaldo);
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

/**
 * Función para obtener los años disponibles en la tabla de aguinaldos
 */
function obtener_anios()
{
    global $conexion;

    $sql = "SELECT DISTINCT anio FROM aguinaldos ORDER BY anio DESC";
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
