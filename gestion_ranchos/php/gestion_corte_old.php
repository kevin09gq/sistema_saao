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
        $sql = $sqlBase . " ORDER BY c.fecha_corte DESC";
        $stmt = $conexion->prepare($sql);
    } elseif ($anio != -1 && $mes == -1 && $semana == -1) {
        // Si solo se proporciona el año
        $sql = $sqlBase . " WHERE YEAR(c.fecha_corte) = ? ORDER BY c.fecha_corte DESC";
        $stmt = $conexion->prepare($sql);
        $stmt->bind_param("i", $anio);
    } elseif ($anio != -1 && $mes != -1 && $semana == -1) {
        // Si se proporciona el año y el mes
        $sql = $sqlBase . " WHERE YEAR(c.fecha_corte) = ? AND MONTH(c.fecha_corte) = ? ORDER BY c.fecha_corte DESC";
        $stmt = $conexion->prepare($sql);
        $stmt->bind_param("ii", $anio, $mes);
    } elseif ($anio != -1 && $mes != -1 && $semana != -1) {
        // Si se proporcionan el año, el mes y la semana
        $sql = $sqlBase . " WHERE YEAR(c.fecha_corte) = ? AND MONTH(c.fecha_corte) = ? AND WEEK(c.fecha_corte, 3) = ? ORDER BY c.fecha_corte DESC";
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

    // Agrupar por folio para formar la estructura deseada
    $structured = [];
    foreach ($rows as $row) {
        $folio = $row['folio'];

        if (!isset($structured[$folio])) {
            $structured[$folio] = [
                "id_corte" => $row['id_corte'],
                "anio" => $row['anio'],
                "numero_semana" => $row['numero_semana'],
                "folio" => $row['folio'],
                "estado" => $row['estado'],
                "fecha_corte" => $row['fecha_corte'],
                "nombre_cortador" => $row['nombre_cortador'],
                "precio_reja" => (float)$row['precio_reja'],
                "rejas" => []
            ];
        }

        if (!is_null($row['num_tabla'])) {
            $structured[$folio]["rejas"][] = [
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
    $precio_reja = $_POST['precio_reja'] ?? '';
    if (empty($precio_reja)) {
        respuesta(400, "Campo requerido", "El precio por reja es obligatorio.", "error", []);
        return;
    }

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
    // VALIDAR SI EL FOLIO YA EXISTE EN LA TABLA DE CORTES
    // --------------------------------------------------------------------------------------------

    // Primero verificar si el folio ya existe
    $sql_verificar = "SELECT COUNT(*) AS total FROM {$tabla_cortes} WHERE folio = ?";
    $stmt_verificar = $conexion->prepare($sql_verificar);
    if (!$stmt_verificar) {
        respuesta(500, "Error", "Error en prepare (verificar): " . $conexion->error, "error", []);
        return;
    }

    $stmt_verificar->bind_param("s", $folio);
    if (!$stmt_verificar->execute()) {
        respuesta(500, "Error", "Error al ejecutar verificación: " . $stmt_verificar->error, "error", []);
        return;
    }

    $result = $stmt_verificar->get_result();
    $row = $result->fetch_assoc();
    if ($row['total'] > 0) {
        // Ya existe el folio
        respuesta(400, "Registro existente", "El folio ya está registrado en la tabla de cortes.", "error", []);
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
    $precio_reja = $_POST['precio_reja'] ?? '';
    if (empty($precio_reja)) {
        respuesta(400, "Campo requerido", "El precio por reja es obligatorio.", "error", []);
        return;
    }

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

    // Verificar si el folio ya existe en otro registro distinto al actual
    $sql_verificar = "SELECT COUNT(*) AS total FROM {$tabla_cortes} WHERE folio = ? AND id <> ?";
    $stmt_verificar = $conexion->prepare($sql_verificar);
    if (!$stmt_verificar) {
        respuesta(500, "Error", "Error en prepare (verificar folio): " . $conexion->error, "error", []);
        return;
    }

    $stmt_verificar->bind_param("si", $folio, $id_corte); // folio es string, id es entero
    if (!$stmt_verificar->execute()) {
        respuesta(500, "Error", "Error al ejecutar verificación de folio: " . $stmt_verificar->error, "error", []);
        return;
    }

    $result = $stmt_verificar->get_result();
    $row = $result->fetch_assoc();

    if ($row['total'] > 0) {
        // Ya existe el folio en otro registro
        respuesta(400, "Folio duplicado", "El folio ya está registrado en otro corte.", "error", []);
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
