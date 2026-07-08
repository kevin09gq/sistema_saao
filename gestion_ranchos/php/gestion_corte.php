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
        case 'obtener_ranchos':
            obtener_ranchos();
            break;
        case 'obtener_anios_cortes':
            obtener_anios_cortes();
            break;
        case 'obtener_meses_cortes':
            obtener_meses_cortes();
            break;
        case 'obtener_semanas_cortes':
            obtener_semanas_cortes();
            break;
        case 'obtener_cortes':
            obtener_cortes();
            break;
        case 'cambiar_estado_corte':
            cambiar_estado_corte();
            break;
        case 'obtener_numero_tablas_rancho':
            obtener_numero_tablas_rancho();
            break;
        case 'guardar_nuevo_vale':
            guardar_nuevo_vale();
            break;
        case 'modificar_vale':
            modificar_vale();
            break;
        case 'generar_pdf_corte':
            generar_pdf_corte();
            break;
        case 'generar_pdf_todos_cortes':
            generar_pdf_todos_cortes();
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
function obtener_anios_cortes()
{
    global $conexion;

    $nombre_rancho = $_GET['nombre_rancho'] ?? '';

    if (empty($nombre_rancho)) {
        respuesta(400, "Error", "El nombre del rancho es obligatorio.", "error", []);
        return;
    }

    $nombre_tabla = "cortes_" . $nombre_rancho; // Construir el nombre de la tabla dinámicamente

    $sql = "SELECT DISTINCT YEAR(fecha_corte) AS anio
            FROM {$nombre_tabla}
            ORDER BY anio DESC";

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
 * Función para obtener los meses de cortes de un rancho específico.
 */
function obtener_meses_cortes()
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

    $nombre_tabla = "cortes_" . $nombre_rancho; // Construir el nombre de la tabla dinámicamente

    $sql = "SELECT DISTINCT MONTH(fecha_corte) AS mes
            FROM {$nombre_tabla}
            WHERE YEAR(fecha_corte) = ?
            ORDER BY mes ASC";

    $stmt = $conexion->prepare($sql);

    if (!$stmt) {
        respuesta(500, "Error", "Error en prepare: " . $conexion->error, "error", []);
        return;
    }

    $stmt->bind_param("i", $anio);
    $stmt->execute();
    $result = $stmt->get_result();

    $data = $result->fetch_all(MYSQLI_ASSOC);

    if (!empty($data)) {
        respuesta(200, "OK", "Meses encontrados", "success", $data);
    } else {
        respuesta(200, "OK", "No se encontraron meses", "info", []);
    }

    $stmt->close();
}

/**
 * Función para obtener las semanas de cortes de un rancho específico.
 */
function obtener_semanas_cortes()
{
    global $conexion;

    $nombre_rancho = $_GET['nombre_rancho'] ?? '';
    $anio = $_GET['anio'] ?? '';
    $mes = $_GET['mes'] ?? '';

    if (empty($nombre_rancho)) {
        respuesta(400, "Error", "El nombre del rancho es obligatorio.", "error", []);
        return;
    }

    if (empty($anio)) {
        respuesta(400, "Error", "El año es obligatorio.", "error", []);
        return;
    }

    if (empty($mes)) {
        respuesta(400, "Error", "El mes es obligatorio.", "error", []);
        return;
    }

    $nombre_tabla = "cortes_" . $nombre_rancho; // Construir el nombre de la tabla dinámicamente

    $sql = "SELECT DISTINCT WEEK(fecha_corte, 3) AS semana
            FROM {$nombre_tabla}
            WHERE YEAR(fecha_corte) = ?
            AND MONTH(fecha_corte) = ?
            ORDER BY semana ASC";

    $stmt = $conexion->prepare($sql);

    if (!$stmt) {
        respuesta(500, "Error", "Error en prepare: " . $conexion->error, "error", []);
        return;
    }

    $stmt->bind_param("ii", $anio, $mes);
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
function obtener_cortes()
{
    global $conexion;

    $nombre_rancho = $_GET['nombre_rancho'] ?? '-1';
    $anio = $_GET['anio'] ?? '-1';
    $mes = $_GET['mes'] ?? '-1';
    $semana = $_GET['semana'] ?? '-1';

    // Tablas dinámicas
    $nombre_tabla = "cortes_" . $nombre_rancho;
    $nombre_tabla_nomina = "nomina_" . $nombre_rancho;
    $id_tabla_nomina = "id_nomina_" . $nombre_rancho;
    $nombre_tabla_rejas = "cortes_" . $nombre_rancho . "_tablas";

    // Base SELECT con LEFT JOIN hacia nómina y rejas
    $sqlBase = "SELECT
                    c.id AS id_corte,
                    n.anio,
                    n.numero_semana,
                    c.id,
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
                       ON c.id = r.id_corte";

    // Filtros según los casos
    if ($anio == -1 && $mes == -1 && $semana == -1) {
        // Si no se proporcionan filtros, obtenemos todos los cortes
        $sql = $sqlBase . " ORDER BY c.folio DESC, c.fecha_corte DESC";
        $stmt = $conexion->prepare($sql);
    } elseif ($anio != -1 && $mes == -1 && $semana == -1) {
        // Si solo se proporciona el año
        $sql = $sqlBase . " WHERE YEAR(c.fecha_corte) = ? ORDER BY c.folio DESC, c.fecha_corte DESC";
        $stmt = $conexion->prepare($sql);
        $stmt->bind_param("i", $anio);
    } elseif ($anio != -1 && $mes != -1 && $semana == -1) {
        // Si se proporciona el año y el mes
        $sql = $sqlBase . " WHERE YEAR(c.fecha_corte) = ? AND MONTH(c.fecha_corte) = ? ORDER BY c.folio DESC, c.fecha_corte DESC";
        $stmt = $conexion->prepare($sql);
        $stmt->bind_param("ii", $anio, $mes);
    } elseif ($anio != -1 && $mes != -1 && $semana != -1) {
        // Si se proporcionan el año, el mes y la semana
        $sql = $sqlBase . " WHERE YEAR(c.fecha_corte) = ? AND MONTH(c.fecha_corte) = ? AND WEEK(c.fecha_corte, 3) = ? ORDER BY c.folio DESC, c.fecha_corte DESC";
        $stmt = $conexion->prepare($sql);
        $stmt->bind_param("iii", $anio, $mes, $semana);
    } else {
        // Por si algo sale mal
        respuesta(400, "Error", "Parámetros inválidos.", "error", []);
        return;
    }


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
        respuesta(200, "OK", "Cortes encontrados", "success", $structured);
    } else {
        respuesta(200, "OK", "No se encontraron cortes", "info", []);
    }

    $stmt->close();
}

/**
 * Función para cambiar el estado de un corte.
 */
function cambiar_estado_corte()
{
    global $conexion;

    $id_corte = $_POST['id_corte'] ?? '';
    $nuevo_estado = $_POST['nuevo_estado'] ?? '';
    $nombre_rancho = $_POST['nombre_rancho'] ?? '';

    if (!isset($id_corte) || !isset($nuevo_estado) || !isset($nombre_rancho)) {
        respuesta(400, "Error", "Todos los parámetros son obligatorios.", "error", []);
        return;
    }

    $nombre_tabla = "cortes_" . $nombre_rancho; // Construir el nombre de la tabla dinámicamente

    $sql = "UPDATE {$nombre_tabla} SET estado = ? WHERE id = ?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("ii", $nuevo_estado, $id_corte);

    if ($stmt->execute()) {
        respuesta(200, "Actualizado", "Estado del corte actualizado correctamente.", "success", []);
    } else {
        respuesta(500, "Error", "Error al actualizar el estado del corte.", "error", []);
    }

    $stmt->close();
}

/**
 * Funcion para obtener el número de tablas de un rancho específico.
 */
function obtener_numero_tablas_rancho()
{
    global $conexion;

    if (empty($_GET["nombre_rancho"])) {
        respuesta(400, "Error", "No se proporcionó el nombre del rancho", "error", []);
        return;
    }

    $nombre_rancho = $_GET["nombre_rancho"];

    // SQL PARA OBTENER EL HORARIO DEL RANCHO
    $sql = "SELECT ir.num_arboles
            FROM info_ranchos ir
            INNER JOIN areas a ON ir.id_area = a.id_area
            WHERE a.nombre_area LIKE CONCAT('%', ?, '%')";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("s", $nombre_rancho);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        respuesta(200, "exito", "Horario obtenido correctamente", "success", $row);
    } else {
        respuesta(404, "Error", "No se encontró horario para esta área", "error", []);
    }
}

/**
 * Funcion para guardar un nuevo vale de corte.
 */
function guardar_nuevo_vale()
{
    global $conexion;

    // RECIBIR EL FOLIO
    $folio = $_POST['folio'] ?? '';
    if (empty($folio)) {
        respuesta(400, "Campo requerido", "El folio es obligatorio.", "error", []);
        return;
    }

    // RECIBIR EL NOMBRE DEL CORTADOR
    $nombre_cortador = $_POST['nombre_cortador'] ?? '';
    if (empty($nombre_cortador)) {
        respuesta(400, "Campo requerido", "El nombre del cortador es obligatorio.", "error", []);
        return;
    }

    // RECIBIR LA FECHA DE CORTE
    $fecha_corte = $_POST['fecha_corte'] ?? '';
    if (empty($fecha_corte)) {
        respuesta(400, "Campo requerido", "La fecha de corte es obligatoria.", "error", []);
        return;
    }

    // RECIBIR EL NOMBRE DEL RANCHO
    $nombre_rancho = $_POST['nombre_rancho'] ?? '';
    if (empty($nombre_rancho)) {
        respuesta(400, "Campo requerido", "El nombre del rancho es obligatorio.", "error", []);
        return;
    }

    // RECIBIR EL PRECIO POR REJA
    // Va permitir que es precio sea 0 para algunos casos
    $precio_reja = $_POST['precio_reja'] ?? 0;

    // RECIBIR REJAS
    $rejas_json = $_POST['rejas'];
    if (empty($rejas_json)) {
        respuesta(400, "Campo requerido", "Debe proporcionar un arreglo de rejas.", "error", []);
        return;
    }

    // Convertir JSON a array asociativo
    $rejas = json_decode($rejas_json, true);

    // Validar que se decodificó correctamente
    if (!is_array($rejas)) {
        respuesta(400, "Error", "Formato de rejas inválido.", "error", []);
        return;
    }

    // Construir los nombres de las tablas dinámicamente
    $tabla_cortes = "cortes_" . $nombre_rancho;
    $tabla_cortes_tablas = "cortes_" . $nombre_rancho . "_tablas";

    // --------------------------------------------------------------------------------------------
    // VALIDAR SI EL FOLIO YA EXISTE EN LA TABLA DE CORTES
    // --------------------------------------------------------------------------------------------

    // Primero verificar si el folio ya existe
    $sql_verificar = "SELECT COUNT(*) AS total FROM {$tabla_cortes} WHERE folio = ? AND nombre_cortador = ? AND estado = 1";
    $stmt_verificar = $conexion->prepare($sql_verificar);
    if (!$stmt_verificar) {
        respuesta(500, "Error", "Error en prepare (verificar): " . $conexion->error, "error", []);
        return;
    }

    $stmt_verificar->bind_param("ss", $folio, $nombre_cortador); // "ss" porque ambos son strings
    if (!$stmt_verificar->execute()) {
        respuesta(500, "Error", "Error al ejecutar verificación: " . $stmt_verificar->error, "error", []);
        return;
    }

    $result = $stmt_verificar->get_result();
    $row = $result->fetch_assoc();
    if ($row['total'] > 0) {
        // Ya existe el folio
        respuesta(400, "Registro existente", "El folio ya está registrado para: " . $nombre_cortador, "info", []);
        return;
    }


    // --------------------------------------------------------------------------------------------
    // CONTINUAR CON EL PROCESO PARA INSERTAR
    // --------------------------------------------------------------------------------------------

    // SQL para insertar en la tabla de cortes
    $sql_corte = "INSERT INTO {$tabla_cortes} (nombre_cortador, folio, precio_reja, fecha_corte, estado) VALUES (?, ?, ?, ?, 1)";

    // Preparar la declaración
    $stmt = $conexion->prepare($sql_corte);
    // Verificar si la preparación fue exitosa
    if (!$stmt) {
        respuesta(500, "Error", "Error en prepare: " . $conexion->error, "error", []);
        return;
    }

    // Vincular los parámetros
    $stmt->bind_param("ssds", $nombre_cortador, $folio, $precio_reja, $fecha_corte);
    // Verificar si la ejecución fue exitosa
    if (!$stmt->execute()) {
        respuesta(500, "Error", "Error al ejecutar: " . $stmt->error, "error", []);
        return;
    }

    // Obtener el ID del nuevo corte insertado
    $id_corte = $stmt->insert_id;

    // SQL para insertar en la tabla de cortes_tablas
    $sql_rejas = "INSERT INTO {$tabla_cortes_tablas} (id_corte, num_tabla, rejas) VALUES (?, ?, ?)";
    // Preparar la declaración
    $stmt_rejas = $conexion->prepare($sql_rejas);
    // Verificar si la preparación fue exitosa
    if (!$stmt_rejas) {
        respuesta(500, "Error", "Error en prepare: " . $conexion->error, "error", []);
        return;
    }
    // Iterar sobre el arreglo de rejas y ejecutar la inserción para cada una
    foreach ($rejas as $reja) {
        $num_tabla = $reja['num_tabla'] ?? '';
        $cantidad_rejas = $reja['rejas'] ?? '';

        // Vincular los parámetros
        $stmt_rejas->bind_param("iii", $id_corte, $num_tabla, $cantidad_rejas);
        // Verificar si la ejecución fue exitosa
        if (!$stmt_rejas->execute()) {
            respuesta(500, "Error", "Error al ejecutar: " . $stmt_rejas->error, "error", []);
            return;
        }
    }

    // Cerrar las declaraciones
    $stmt->close();
    $stmt_rejas->close();

    // Responder con éxito
    respuesta(200, "Registro exitoso", "Nuevo vale de corte guardado correctamente.", "success", []);
}

/**
 * Funcion para modificar un vale de corte existente.
 */
function modificar_vale()
{
    global $conexion;

    // RECIBIR EL ID DEL CORTE
    $id_corte = $_POST['id_corte'] ?? '';
    if (empty($id_corte)) {
        respuesta(400, "Campo requerido", "El ID del corte es obligatorio.", "error", []);
        return;
    }

    // RECIBIR EL FOLIO
    $folio = trim($_POST['folio']) ?? '';
    if (empty($folio)) {
        respuesta(400, "Campo requerido", "El folio es obligatorio.", "error", []);
        return;
    }

    // RECIBIR EL NOMBRE DEL CORTADOR
    $nombre_cortador = trim($_POST['nombre_cortador']) ?? '';
    if (empty($nombre_cortador)) {
        respuesta(400, "Campo requerido", "El nombre del cortador es obligatorio.", "error", []);
        return;
    }

    // RECIBIR LA FECHA DE CORTE
    $fecha_corte = $_POST['fecha_corte'] ?? '';
    if (empty($fecha_corte)) {
        respuesta(400, "Campo requerido", "La fecha de corte es obligatoria.", "error", []);
        return;
    }

    // RECIBIR EL NOMBRE DEL RANCHO
    $nombre_rancho = trim($_POST['nombre_rancho']) ?? '';
    if (empty($nombre_rancho)) {
        respuesta(400, "Campo requerido", "El nombre del rancho es obligatorio.", "error", []);
        return;
    }

    // RECIBIR EL PRECIO POR REJA
    $precio_reja = $_POST['precio_reja'] ?? 0;

    // RECIBIR REJAS
    $rejas_json = $_POST['rejas'] ?? '';
    if (empty($rejas_json)) {
        respuesta(400, "Campo requerido", "Debe proporcionar un arreglo de rejas.", "error", []);
        return;
    }

    // Convertir JSON a array asociativo
    $rejas = json_decode($rejas_json, true);

    // Validar que se decodificó correctamente
    if (!is_array($rejas)) {
        respuesta(400, "Error", "Formato de rejas inválido.", "error", []);
        return;
    }

    // Construir los nombres de las tablas dinámicamente
    $tabla_cortes = "cortes_" . $nombre_rancho;
    $tabla_cortes_tablas = "cortes_" . $nombre_rancho . "_tablas";

    // --------------------------------------------------------------------------------------------
    // VALIDAR SI EL ID EXISTE EN LA TABLA DE CORTES
    // --------------------------------------------------------------------------------------------

    // Verificar si el id existe
    $sql_verificar = "SELECT COUNT(*) AS total FROM {$tabla_cortes} WHERE id = ?";
    $stmt_verificar = $conexion->prepare($sql_verificar);
    if (!$stmt_verificar) {
        respuesta(500, "Error", "Error en prepare (verificar): " . $conexion->error, "error", []);
        return;
    }

    $stmt_verificar->bind_param("i", $id_corte); // "i" porque es entero
    if (!$stmt_verificar->execute()) {
        respuesta(500, "Error", "Error al ejecutar verificación: " . $stmt_verificar->error, "error", []);
        return;
    }

    $result = $stmt_verificar->get_result();
    $row = $result->fetch_assoc();

    if ($row['total'] == 0) {
        // No existe el id
        respuesta(404, "No encontrado", "No existe un registro con el ID proporcionado en la tabla de cortes.", "warning", []);
        return;
    }

    // --------------------------------------------------------------------------------------------
    // VALIDAR SI EL FOLIO YA EXISTE EN OTRO REGISTRO
    // --------------------------------------------------------------------------------------------

    // Verificar si el folio ya existe para el mismo cortador en otro registro distinto
    $sql_verificar = "SELECT COUNT(*) AS total 
                        FROM {$tabla_cortes} 
                        WHERE folio = ? AND nombre_cortador = ? AND id <> ?";
    $stmt_verificar = $conexion->prepare($sql_verificar);
    if (!$stmt_verificar) {
        respuesta(500, "Error", "Error en prepare (verificar folio+cortador): " . $conexion->error, "error", []);
        return;
    }

    $stmt_verificar->bind_param("ssi", $folio, $nombre_cortador, $id_corte);

    if (!$stmt_verificar->execute()) {
        respuesta(500, "Error", "Error al ejecutar verificación de folio: " . $stmt_verificar->error, "error", []);
        return;
    }

    $result = $stmt_verificar->get_result();
    $row = $result->fetch_assoc();

    if ($row['total'] > 0) {
        // Ya existe el folio para ese cortador en otro registro
        respuesta(
            400,
            "Folio duplicado",
            "El folio ya está asignado a este cortador en otro registro. Usa un folio diferente o verifica los datos.",
            "error",
            []
        );
        return;
    }

    // --------------------------------------------------------------------------------------------
    // ACTUALIZAR REGISTRO EN LA TABLA DE CORTES (excepto estado)
    // --------------------------------------------------------------------------------------------
    $sql_update = "UPDATE {$tabla_cortes}
                    SET nombre_cortador = ?, 
                        folio = ?, 
                        precio_reja = ?, 
                        fecha_corte = ?
                    WHERE id = ?";

    $stmt_update = $conexion->prepare($sql_update);
    if (!$stmt_update) {
        respuesta(500, "Error", "Error en prepare (update): " . $conexion->error, "error", []);
        return;
    }

    // Vincular parámetros: nombre_cortador (string), folio (string), precio_reja (double), fecha_corte (string), id (int)
    $stmt_update->bind_param("ssdsd", $nombre_cortador, $folio, $precio_reja, $fecha_corte, $id_corte);

    if (!$stmt_update->execute()) {
        respuesta(500, "Error", "Error al ejecutar update: " . $stmt_update->error, "error", []);
        return;
    }


    // --------------------------------------------------------------------------------------------
    // REEMPLAZAR LAS REJAS QUE YA EXISTEN
    // --------------------------------------------------------------------------------------------

    // Borrar las rejas anteriores asociadas al corte
    $sql_delete = "DELETE FROM {$tabla_cortes_tablas} WHERE id_corte = ?";
    $stmt_delete = $conexion->prepare($sql_delete);
    if (!$stmt_delete) {
        respuesta(500, "Error", "Error en prepare (delete rejas): " . $conexion->error, "error", []);
        return;
    }
    $stmt_delete->bind_param("i", $id_corte);
    if (!$stmt_delete->execute()) {
        respuesta(500, "Error", "Error al ejecutar delete rejas: " . $stmt_delete->error, "error", []);
        return;
    }

    // 3. Insertar las nuevas rejas
    $sql_rejas = "INSERT INTO {$tabla_cortes_tablas} (id_corte, num_tabla, rejas) VALUES (?, ?, ?)";
    $stmt_rejas = $conexion->prepare($sql_rejas);
    if (!$stmt_rejas) {
        respuesta(500, "Error", "Error en prepare (insert rejas): " . $conexion->error, "error", []);
        return;
    }

    foreach ($rejas as $reja) {
        $num_tabla = $reja['num_tabla'] ?? 0;
        $cantidad_rejas = $reja['rejas'] ?? 0;

        $stmt_rejas->bind_param("iii", $id_corte, $num_tabla, $cantidad_rejas);
        if (!$stmt_rejas->execute()) {
            respuesta(500, "Error", "Error al ejecutar insert rejas: " . $stmt_rejas->error, "error", []);
            return;
        }
    }

    // Cerrar las declaraciones
    $stmt_update->close();
    $stmt_delete->close();
    $stmt_rejas->close();

    // RESPUESTA FINAL - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
    respuesta(200, "Se ha actualizado", "Corte actualizado con éxito.", "success", []);
}

/** ============================ SECCION PARA LA GENERACION DE REPORTES ============================ **/

/**
 * Función para generar un PDF de un corte específico.
 */
function generar_pdf_corte()
{
    global $conexion;
    require_once __DIR__ . '/../../vendor/autoload.php';

    $corteJson = $_POST['corte'] ?? '';
    $nombre_rancho = $_POST['nombre_rancho'] ?? '';
    $nombre_rancho_completo = "RANCHO " . strtoupper($nombre_rancho);

    if (empty($corteJson) || empty($nombre_rancho)) {
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Datos inválidos']);
        exit;
    }

    $corte = json_decode($corteJson, true);

    if (!$corte) {
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Datos inválidos']);
        exit;
    }

    // Obtener el logo del área
    $logo_area = null;
    $sql = "SELECT logo_area FROM areas WHERE nombre_area LIKE CONCAT('%', ?, '%')";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("s", $nombre_rancho);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $logo_area = $row['logo_area'];
    }
    $stmt->close();

    class PDFCorte extends TCPDF
    {
        private $logoPath;
        private $nombreRancho;

        public function __construct($nombreRancho, $logoArea, $orientation = 'P', $unit = 'mm', $format = 'A4', $unicode = true, $encoding = 'UTF-8', $diskcache = false, $pdfa = false)
        {
            parent::__construct($orientation, $unit, $format, $unicode, $encoding, $diskcache, $pdfa);
            if ($logoArea) {
                $this->logoPath = __DIR__ . '/../../gafetes/logos_area/' . $logoArea;
            } else {
                $this->logoPath = __DIR__ . '/../../public/img/logo.jpg';
            }
            $this->nombreRancho = $nombreRancho;
        }

        public function Header()
        {
            if (file_exists($this->logoPath)) {
                // Obtener el tamaño de la imagen original para mantener la relación de aspecto
                $imageSize = getimagesize($this->logoPath);
                $maxWidth = 30;
                $maxHeight = 25;

                // Calcular el nuevo tamaño manteniendo la relación de aspecto
                $originalWidth = $imageSize[0];
                $originalHeight = $imageSize[1];

                $widthRatio = $maxWidth / $originalWidth;
                $heightRatio = $maxHeight / $originalHeight;
                $ratio = min($widthRatio, $heightRatio);

                $newWidth = $originalWidth * $ratio;
                $newHeight = $originalHeight * $ratio;

                // Centrar verticalmente en el área del encabezado
                $yPos = 5 + ($maxHeight - $newHeight) / 2;

                $this->Image($this->logoPath, 10, $yPos, $newWidth, $newHeight, '');
            }

            $this->SetFont('helvetica', 'B', 12);
            $this->SetTextColor(0, 0, 0);
            $this->SetY(8);
            $anchoTitulo = $this->GetStringWidth('CORTES DE LIMÓN');
            $centroPagina = $this->getPageWidth() / 2;
            $this->SetX($centroPagina - ($anchoTitulo / 2));
            $this->Cell($anchoTitulo, 5, 'CORTES DE LIMÓN', 0, 1, 'L');

            $this->SetFont('helvetica', 'B', 10);
            $this->SetY(14);
            $anchoEmpresa = $this->GetStringWidth($this->nombreRancho);
            $this->SetX($centroPagina - ($anchoEmpresa / 2));
            $this->Cell($anchoEmpresa, 5, $this->nombreRancho, 0, 1, 'L');
        }

        public function Footer()
        {
            $this->SetY(-15);
            $this->SetFont('helvetica', 'I', 8);
            $this->Cell(0, 10, 'Página ' . $this->getAliasNumPage() . '/' . $this->getAliasNbPages(), 0, false, 'C');
        }
    }

    $pdf = new PDFCorte($nombre_rancho_completo, $logo_area, 'P', 'mm', 'A4', true, 'UTF-8', false);

    $pdf->SetCreator('Sistema SAAO');
    $pdf->SetAuthor('Sistema SAAO');
    $pdf->SetTitle('Corte ' . $corte['folio']);
    $pdf->SetSubject('Vale de Corte');

    $pdf->SetMargins(15, 35, 15);
    $pdf->SetHeaderMargin(5);
    $pdf->SetFooterMargin(5);
    $pdf->SetAutoPageBreak(true, 15);

    $pdf->AddPage();

    // Sección 1: Información general
    $pdf->SetFont('helvetica', 'B', 10);
    $pdf->SetTextColor(0, 0, 0);
    $pdf->Cell(0, 8, 'INFORMACIÓN DEL CORTE', 0, 1, 'L');

    $pdf->SetFont('helvetica', '', 10);
    $pdf->SetTextColor(0, 0, 0);
    $pdf->SetLineWidth(0.3);
    $pdf->SetDrawColor(0, 0, 0); // Negro para las líneas de las celdas

    // Folio
    $pdf->Cell(50, 7, 'Folio:', 1, 0, 'L', false);
    $pdf->SetFont('helvetica', 'B', 10);
    $pdf->Cell(0, 7, $corte['folio'], 1, 1, 'L', false);
    $pdf->SetFont('helvetica', '', 10);

    // Nombre del cortador
    $pdf->Cell(50, 7, 'Nombre del Cortador:', 1, 0, 'L', false);
    $pdf->SetFont('helvetica', 'B', 10);
    $pdf->Cell(0, 7, $corte['nombre_cortador'], 1, 1, 'L', false);
    $pdf->SetFont('helvetica', '', 10);

    // Fecha de corte
    $pdf->Cell(50, 7, 'Fecha de Corte:', 1, 0, 'L', false);
    $pdf->SetFont('helvetica', 'B', 10);
    list($anio, $mes, $dia) = explode("-", $corte['fecha_corte']);
    $meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    $fechaFormateada = (int)$dia . "/" . $meses[(int)$mes - 1] . "/" . $anio;
    $pdf->Cell(0, 7, $fechaFormateada, 1, 1, 'L', false);
    $pdf->SetFont('helvetica', '', 10);

    // Nómina
    $pdf->Cell(50, 7, 'Nómina:', 1, 0, 'L', false);
    $pdf->SetFont('helvetica', 'B', 10);
    $nomina = $corte['anio'] ? 'Sem ' . $corte['numero_semana'] . ' / ' . $corte['anio'] : 'Pendiente';
    $pdf->Cell(0, 7, $nomina, 1, 1, 'L', false);
    $pdf->SetFont('helvetica', '', 10);

    // Estado
    $pdf->Cell(50, 7, 'Estado:', 1, 0, 'L', false);
    $pdf->SetFont('helvetica', 'B', 10);
    $pdf->Cell(0, 7, $corte['estado'] ? 'Activo' : 'Cancelado', 1, 1, 'L', false);
    $pdf->SetFont('helvetica', '', 10);

    $pdf->Ln(5);

    // Sección 2: Resumen financiero
    $pdf->SetFont('helvetica', 'B', 10);
    $pdf->SetTextColor(0, 0, 0);
    $pdf->Cell(0, 8, 'RESUMEN FINANCIERO', 0, 1, 'L');
    $pdf->SetFont('helvetica', '', 10);
    $pdf->SetTextColor(0, 0, 0);

    $totalRejas = 0;
    foreach ($corte['rejas'] as $reja) {
        $totalRejas += $reja['rejas'];
    }
    $totalEfectivo = $totalRejas * $corte['precio_reja'];

    $anchoColumna = 60;
    $xInicial = 15;
    $pdf->SetX($xInicial);

    // Precio por reja
    $pdf->SetFillColor(240, 240, 240);
    $pdf->SetLineWidth(0.3);
    $pdf->SetDrawColor(0, 0, 0); // Negro para las líneas de la tabla
    $pdf->Cell($anchoColumna, 10, 'Precio/Reja', 1, 0, 'C', true);
    $pdf->Cell($anchoColumna, 10, 'Total Rejas', 1, 0, 'C', true);
    $pdf->Cell($anchoColumna, 10, 'Efectivo', 1, 1, 'C', true);

    $pdf->SetFont('helvetica', 'B', 10);
    $pdf->SetX($xInicial);
    $pdf->SetTextColor(0, 114, 198);
    $pdf->Cell($anchoColumna, 10, '$' . number_format($corte['precio_reja'], 2, '.', ','), 1, 0, 'C', false);
    $pdf->SetTextColor(0, 128, 0);
    $pdf->Cell($anchoColumna, 10, $totalRejas, 1, 0, 'C', false);
    $pdf->SetTextColor(220, 20, 60);
    $pdf->Cell($anchoColumna, 10, '$' . number_format($totalEfectivo, 2, '.', ','), 1, 1, 'C', false);
    $pdf->SetTextColor(0, 0, 0);
    $pdf->SetFont('helvetica', '', 10);

    $pdf->Ln(5);

    // Sección 3: Tabla de rejas
    $pdf->SetFont('helvetica', 'B', 10);
    $pdf->SetTextColor(0, 0, 0);
    $pdf->Cell(0, 8, 'DESGLOSE DE EXTRACCIÓN', 0, 1, 'L');
    $pdf->SetFont('helvetica', '', 10);
    $pdf->SetTextColor(0, 0, 0);

    $pdf->SetFillColor(240, 240, 240);
    $pdf->SetLineWidth(0.3);
    $pdf->SetDrawColor(0, 0, 0); // Negro para las líneas de la tabla
    $pdf->SetFont('helvetica', 'B', 10);
    $pdf->Cell(90, 8, 'TABLAS', 1, 0, 'C', true);
    $pdf->Cell(90, 8, 'REJAS EXTRAÍDAS', 1, 1, 'C', true);
    $pdf->SetFont('helvetica', '', 10);

    foreach ($corte['rejas'] as $reja) {
        $pdf->Cell(90, 8, 'Tabla ' . $reja['num_tabla'], 1, 0, 'C', false);
        $pdf->SetFont('helvetica', 'B', 10);
        $pdf->Cell(90, 8, $reja['rejas'], 1, 1, 'C', false);
        $pdf->SetFont('helvetica', '', 10);
    }

    $nombreArchivo = 'Corte_' . $corte['folio'] . '.pdf';

    if (ob_get_contents()) ob_end_clean();

    $pdf->Output($nombreArchivo, 'D');
    exit;
}

/**
 * Función para generar un PDF de varios cortes
 */
function generar_pdf_todos_cortes()
{
    global $conexion;
    require_once __DIR__ . '/../../vendor/autoload.php';

    $cortesJson = $_POST['cortes'] ?? '';
    $nombre_rancho = $_POST['nombre_rancho'] ?? '';
    $nombre_rancho_completo = $_POST['nombre_rancho_completo'] ?? 'CORTES DE LIMÓN';

    if (empty($cortesJson) || empty($nombre_rancho)) {
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Datos inválidos']);
        exit;
    }

    $cortes = json_decode($cortesJson, true);

    if (!$cortes || !is_array($cortes)) {
        header('Content-Type: application/json');
        echo json_encode(['error' => 'Datos inválidos']);
        exit;
    }

    // Obtener el logo del área
    $logo_area = null;
    $sql = "SELECT logo_area FROM areas WHERE nombre_area LIKE CONCAT('%', ?, '%')";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("s", $nombre_rancho);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $logo_area = $row['logo_area'];
    }
    $stmt->close();

    class PDFTodosCortes extends TCPDF
    {
        private $logoPath;
        private $nombreRancho;

        public function __construct($nombreRancho, $logoArea, $orientation = 'P', $unit = 'mm', $format = 'A4', $unicode = true, $encoding = 'UTF-8', $diskcache = false, $pdfa = false)
        {
            parent::__construct($orientation, $unit, $format, $unicode, $encoding, $diskcache, $pdfa);
            if ($logoArea) {
                $this->logoPath = __DIR__ . '/../../gafetes/logos_area/' . $logoArea;
            } else {
                $this->logoPath = __DIR__ . '/../../public/img/logo.jpg';
            }
            $this->nombreRancho = $nombreRancho;
        }

        public function Header()
        {
            if (file_exists($this->logoPath)) {
                // Obtener el tamaño de la imagen original para mantener la relación de aspecto
                $imageSize = getimagesize($this->logoPath);
                $maxWidth = 30;
                $maxHeight = 25;

                // Calcular el nuevo tamaño manteniendo la relación de aspecto
                $originalWidth = $imageSize[0];
                $originalHeight = $imageSize[1];

                $widthRatio = $maxWidth / $originalWidth;
                $heightRatio = $maxHeight / $originalHeight;
                $ratio = min($widthRatio, $heightRatio);

                $newWidth = $originalWidth * $ratio;
                $newHeight = $originalHeight * $ratio;

                // Centrar verticalmente en el área del encabezado
                $yPos = 5 + ($maxHeight - $newHeight) / 2;

                $this->Image($this->logoPath, 10, $yPos, $newWidth, $newHeight, '');
            }

            $this->SetFont('helvetica', 'B', 12);
            $this->SetTextColor(0, 0, 0);
            $this->SetY(8);
            $anchoTitulo = $this->GetStringWidth('CORTES DE LIMÓN');
            $centroPagina = $this->getPageWidth() / 2;
            $this->SetX($centroPagina - ($anchoTitulo / 2));
            $this->Cell($anchoTitulo, 5, 'CORTES DE LIMÓN', 0, 1, 'L');

            $this->SetFont('helvetica', 'B', 10);
            $this->SetY(14);
            $anchoEmpresa = $this->GetStringWidth($this->nombreRancho);
            $this->SetX($centroPagina - ($anchoEmpresa / 2));
            $this->Cell($anchoEmpresa, 5, $this->nombreRancho, 0, 1, 'L');
        }

        public function Footer()
        {
            $this->SetY(-15);
            $this->SetFont('helvetica', 'I', 8);
            $this->Cell(0, 10, 'Página ' . $this->getAliasNumPage() . '/' . $this->getAliasNbPages(), 0, false, 'C');
        }
    }

    $pdf = new PDFTodosCortes($nombre_rancho_completo, $logo_area, 'P', 'mm', 'A4', true, 'UTF-8', false);

    $pdf->SetCreator('Sistema SAAO');
    $pdf->SetAuthor('Sistema SAAO');
    $pdf->SetTitle('Todos los Cortes');
    $pdf->SetSubject('Vales de Corte');

    $pdf->SetMargins(15, 35, 15);
    $pdf->SetHeaderMargin(5);
    $pdf->SetFooterMargin(5);
    $pdf->SetAutoPageBreak(true, 15);

    $pdf->AddPage();

    $meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    $contador = 0;

    foreach ($cortes as $corte) {
        if ($contador > 0) {
            // Verificar si hay espacio para otro corte en la página actual
            $espacioNecesario = 80; // Reducido más, ahora que el contenido es más compacto
            $espacioDisponible = $pdf->getPageHeight() - $pdf->GetY() - 20; // Restar 20mm para el pie de página

            if ($espacioDisponible < $espacioNecesario) {
                $pdf->AddPage();
            } else {
                // Agregar un separador entre cortes (línea más visible)
                $pdf->Ln(3);
                $pdf->SetLineWidth(0.5);
                $pdf->SetDrawColor(100, 100, 100); // Gris oscuro para mayor visibilidad
                $pdf->Line(15, $pdf->GetY(), 195, $pdf->GetY());
                $pdf->Ln(3);
            }
        }
        $contador++;

        // Sección 1: Información general
        $pdf->SetFont('helvetica', 'B', 10);
        $pdf->SetTextColor(0, 0, 0);
        $pdf->Cell(0, 6, 'INFORMACIÓN DEL CORTE', 0, 1, 'L');

        $pdf->SetFont('helvetica', '', 10);
        $pdf->SetTextColor(0, 0, 0);
        $pdf->SetLineWidth(0.3);
        $pdf->SetDrawColor(0, 0, 0); // Negro para las líneas de las celdas

        // Folio
        $pdf->Cell(50, 6, 'Folio:', 1, 0, 'L', false);
        $pdf->SetFont('helvetica', 'B', 10);
        $pdf->Cell(0, 6, $corte['folio'], 1, 1, 'L', false);
        $pdf->SetFont('helvetica', '', 10);

        // Nombre del cortador
        $pdf->Cell(50, 6, 'Nombre del Cortador:', 1, 0, 'L', false);
        $pdf->SetFont('helvetica', 'B', 10);
        $pdf->Cell(0, 6, $corte['nombre_cortador'], 1, 1, 'L', false);
        $pdf->SetFont('helvetica', '', 10);

        // Fecha de corte
        $pdf->Cell(50, 6, 'Fecha de Corte:', 1, 0, 'L', false);
        $pdf->SetFont('helvetica', 'B', 10);
        list($anio, $mes, $dia) = explode("-", $corte['fecha_corte']);
        $fechaFormateada = (int)$dia . "/" . $meses[(int)$mes - 1] . "/" . $anio;
        $pdf->Cell(0, 6, $fechaFormateada, 1, 1, 'L', false);
        $pdf->SetFont('helvetica', '', 10);

        // Nómina
        $pdf->Cell(50, 6, 'Nómina:', 1, 0, 'L', false);
        $pdf->SetFont('helvetica', 'B', 10);
        $nomina = $corte['anio'] ? 'Sem ' . $corte['numero_semana'] . ' / ' . $corte['anio'] : 'Pendiente';
        $pdf->Cell(0, 6, $nomina, 1, 1, 'L', false);
        $pdf->SetFont('helvetica', '', 10);

        // Estado
        $pdf->Cell(50, 6, 'Estado:', 1, 0, 'L', false);
        $pdf->SetFont('helvetica', 'B', 10);
        $pdf->Cell(0, 6, $corte['estado'] ? 'Activo' : 'Cancelado', 1, 1, 'L', false);
        $pdf->SetFont('helvetica', '', 10);

        $pdf->Ln(3);

        // Sección 2: Resumen financiero
        $pdf->SetFont('helvetica', 'B', 10);
        $pdf->SetTextColor(0, 0, 0);
        $pdf->Cell(0, 6, 'RESUMEN FINANCIERO', 0, 1, 'L');
        $pdf->SetFont('helvetica', '', 10);
        $pdf->SetTextColor(0, 0, 0);

        $totalRejas = 0;
        foreach ($corte['rejas'] as $reja) {
            $totalRejas += $reja['rejas'];
        }
        $totalEfectivo = $totalRejas * $corte['precio_reja'];

        $anchoColumna = 60;
        $xInicial = 15;
        $pdf->SetX($xInicial);

        // Precio por reja
        $pdf->SetFillColor(240, 240, 240);
        $pdf->SetLineWidth(0.3);
        $pdf->SetDrawColor(0, 0, 0); // Negro para las líneas de la tabla
        $pdf->Cell($anchoColumna, 8, 'Precio/Reja', 1, 0, 'C', true);
        $pdf->Cell($anchoColumna, 8, 'Total Rejas', 1, 0, 'C', true);
        $pdf->Cell($anchoColumna, 8, 'Efectivo', 1, 1, 'C', true);

        $pdf->SetFont('helvetica', 'B', 10);
        $pdf->SetX($xInicial);
        $pdf->SetTextColor(0, 114, 198);
        $pdf->Cell($anchoColumna, 8, '$' . number_format($corte['precio_reja'], 2, '.', ','), 1, 0, 'C', false);
        $pdf->SetTextColor(0, 128, 0);
        $pdf->Cell($anchoColumna, 8, $totalRejas, 1, 0, 'C', false);
        $pdf->SetTextColor(220, 20, 60);
        $pdf->Cell($anchoColumna, 8, '$' . number_format($totalEfectivo, 2, '.', ','), 1, 1, 'C', false);
        $pdf->SetTextColor(0, 0, 0);
        $pdf->SetFont('helvetica', '', 10);

        $pdf->Ln(3);

        // Sección 3: Tabla de rejas
        $pdf->SetFont('helvetica', 'B', 10);
        $pdf->SetTextColor(0, 0, 0);
        $pdf->Cell(0, 6, 'DESGLOSE DE EXTRACCIÓN', 0, 1, 'L');
        $pdf->SetFont('helvetica', '', 10);
        $pdf->SetTextColor(0, 0, 0);

        $pdf->SetFillColor(240, 240, 240);
        $pdf->SetLineWidth(0.3);
        $pdf->SetDrawColor(0, 0, 0); // Negro para las líneas de la tabla
        $pdf->SetFont('helvetica', 'B', 10);
        $pdf->Cell(90, 7, 'TABLAS', 1, 0, 'C', true);
        $pdf->Cell(90, 7, 'REJAS EXTRAÍDAS', 1, 1, 'C', true);
        $pdf->SetFont('helvetica', '', 10);

        foreach ($corte['rejas'] as $reja) {
            $pdf->Cell(90, 7, 'Tabla ' . $reja['num_tabla'], 1, 0, 'C', false);
            $pdf->SetFont('helvetica', 'B', 10);
            $pdf->Cell(90, 7, $reja['rejas'], 1, 1, 'C', false);
            $pdf->SetFont('helvetica', '', 10);
        }
    }

    $nombreArchivo = 'Todos_los_Cortes.pdf';

    if (ob_get_contents()) ob_end_clean();

    $pdf->Output($nombreArchivo, 'D');
    exit;
}
