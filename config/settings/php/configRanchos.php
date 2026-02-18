<?php
include("../../../conexion/conexion.php");

// Verificar si la conexión a la base de datos es válida
if (!$conexion) {
    die("Error de conexión: " . mysqli_connect_error());
}

if (isset($_GET['accion']) || isset($_POST['accion'])) {
    $accion = $_GET['accion'] ?? $_POST['accion'];

    switch ($accion) {

 
            // Configurar ranchos
        case 'obtenerRanchos':
            obtenerRanchos();
            break;
        case 'registrarInfoRancho':
            registrarInfoRancho();
            break;
        case 'actualizarInfoRancho':
            actualizarInfoRancho();
            break;
        case 'obtenerInfoRanchos':
            obtenerInfoRanchos();
            break;
        case 'borrarInfoRancho':
            borrarInfoRancho();
            break;

        default:
            echo "Acción no reconocida";
    }
} else {
    echo "No se especificó ninguna acción";
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
        "mensaje" => $mensaje,
        "icono"   => $icono,
        "data"    => $data
    ], JSON_UNESCAPED_UNICODE);
}


// ======================================================
// SECCION PARA CONFIGURAR LA INFORMACION DE LOS RANCHOS
// ======================================================

function obtenerRanchos()
{
    global $conexion;

    $sql = "SELECT id_area, nombre_area FROM areas WHERE LOWER(nombre_area) LIKE '%rancho%'";
    $stmt = $conexion->prepare($sql);
    $stmt->execute();
    $result = $stmt->get_result();

    $ranchos = [];
    while ($row = $result->fetch_assoc()) {
        $ranchos[] = $row;
    }

    respuesta(200, "", "", "", $ranchos);
}

function registrarInfoRancho()
{
    global $conexion;

    if (empty($_POST['id_area'])) {
        respuesta(400, "Rancho requerido", "Debes seleccionar un rancho", "error", []);
        exit;
    }
    if (empty($_POST['costo_jornal'])) {
        respuesta(400, "Costo jornal requerido", "Debes ingresar el costo del jornal", "error", []);
        exit;
    }
    if (empty($_POST['costo_tardeada'])) {
        respuesta(400, "Costo tardeada requerido", "Debes ingresar el costo de la tardeada", "error", []);
        exit;
    }
    if (empty($_POST['costo_pasaje'])) {
        respuesta(400, "Costo pasaje requerido", "Debes ingresar el costo del pasaje", "error", []);
        exit;
    }
    if (empty($_POST['costo_comida'])) {
        respuesta(400, "Costo comida requerido", "Debes ingresar el costo de la comida", "error", []);
        exit;
    }
    if (empty($_POST['num_arboles'])) {
        respuesta(400, "Número de árboles requerido", "Debes ingresar el número de árboles", "error", []);
        exit;
    }

    $id_area = (int)$_POST['id_area'];
    $costo_jornal = (float)$_POST['costo_jornal'];
    $costo_tardeada = (float)$_POST['costo_tardeada'];
    $costo_pasaje = (float)$_POST['costo_pasaje'];
    $costo_comida = (float)$_POST['costo_comida'];
    $num_arboles = (int)$_POST['num_arboles'];
    $horarioJSON = json_encode($_POST['horarios'], JSON_UNESCAPED_UNICODE);

    // 1. Validar si ya existe un registro con ese id_area
    $check = $conexion->prepare("SELECT id_area FROM info_ranchos WHERE id_area = ?");
    $check->bind_param("i", $id_area);
    $check->execute();
    $check->store_result();

    if ($check->num_rows > 0) {
        // Ya existe un registro previo
        respuesta(400, "Registro existente", "Ya existe un registro para el rancho seleccionado", "warning", []);
        $check->close();
        exit;
    }
    $check->close();

    // 2. Insertar si no existe
    $sql = $conexion->prepare("INSERT INTO info_ranchos 
    (id_area, costo_jornal, costo_tardeada, costo_pasaje, costo_comida, num_arboles, horario_jornalero) 
    VALUES (?, ?, ?, ?, ?, ?, ?)");
    if (!$sql) {
        respuesta(500, "Error en la preparación", "Hubo un error al preparar la consulta: " . $conexion->error, "error", []);
        exit;
    }

    $sql->bind_param("iddddis", $id_area, $costo_jornal, $costo_tardeada, $costo_pasaje, $costo_comida, $num_arboles, $horarioJSON);

    if ($sql->execute()) {
        respuesta(200, "Información registrada", "La información del rancho se ha registrado correctamente", "success", []);
    } else {
        respuesta(500, "Error al ejecutar", "Hubo un error al ejecutar la consulta: " . $sql->error, "error", []);
    }
    $sql->close();
}

function actualizarInfoRancho()
{
    global $conexion;

    if (empty($_POST['id_info_rancho'])) {
        respuesta(400, "Rancho requerido", "Debes seleccionar un rancho", "error", []);
        exit;
    }
    if (empty($_POST['id_area'])) {
        respuesta(400, "Rancho requerido", "Debes seleccionar un rancho", "error", []);
        exit;
    }
    if (empty($_POST['costo_jornal'])) {
        respuesta(400, "Costo jornal requerido", "Debes ingresar el costo del jornal", "error", []);
        exit;
    }
    if (empty($_POST['costo_tardeada'])) {
        respuesta(400, "Costo tardeada requerido", "Debes ingresar el costo de la tardeada", "error", []);
        exit;
    }
    if (empty($_POST['costo_pasaje'])) {
        respuesta(400, "Costo pasaje requerido", "Debes ingresar el costo del pasaje", "error", []);
        exit;
    }
    if (empty($_POST['costo_comida'])) {
        respuesta(400, "Costo comida requerido", "Debes ingresar el costo de la comida", "error", []);
        exit;
    }
    if (empty($_POST['num_arboles'])) {
        respuesta(400, "Número de árboles requerido", "Debes ingresar el número de árboles", "error", []);
        exit;
    }

    $id_info_rancho = (int)$_POST['id_info_rancho'];
    $id_area = (int)$_POST['id_area'];
    $costo_jornal = (float)$_POST['costo_jornal'];
    $costo_tardeada = (float)$_POST['costo_tardeada'];
    $costo_pasaje = (float)$_POST['costo_pasaje'];
    $costo_comida = (float)$_POST['costo_comida'];
    $num_arboles = (int)$_POST['num_arboles'];
    $horarioJSON = json_encode($_POST['horarios'], JSON_UNESCAPED_UNICODE);

    // 1. Validar si ya existe un registro con ese id_area
    $check = $conexion->prepare("SELECT id_area FROM info_ranchos WHERE id_area = ? AND id_info_rancho != ?");
    $check->bind_param("ii", $id_area, $id_info_rancho);
    $check->execute();
    $check->store_result();

    if ($check->num_rows > 0) {
        // Ya existe un registro previo
        respuesta(400, "Registro existente", "Ya existe un registro para el rancho seleccionado", "warning", []);
        $check->close();
        exit;
    }
    $check->close();

    // 2. Insertar si no existe
    $sql = $conexion->prepare("UPDATE info_ranchos SET 
        id_area = ?, costo_jornal = ?, costo_tardeada = ?, costo_pasaje = ?, costo_comida = ?, num_arboles = ?, horario_jornalero = ? 
        WHERE id_info_rancho = ?");
    if (!$sql) {
        respuesta(500, "Error en la preparación", "Hubo un error al preparar la consulta: " . $conexion->error, "error", []);
        exit;
    }

    $sql->bind_param("iddddisi", $id_area, $costo_jornal, $costo_tardeada, $costo_pasaje, $costo_comida, $num_arboles, $horarioJSON, $id_info_rancho);

    if ($sql->execute()) {
        respuesta(200, "Información actualizada", "La información del rancho se ha actualizado correctamente", "success", []);
    } else {
        respuesta(500, "Error al ejecutar", "Hubo un error al ejecutar la consulta: " . $sql->error, "error", []);
    }
    $sql->close();
}

function obtenerInfoRanchos()
{
    global $conexion;

    $sql = "SELECT 
                ir.id_info_rancho,
                ir.id_area,
                a.nombre_area,
                ir.costo_jornal,
                ir.costo_tardeada,
                ir.costo_pasaje,
                ir.costo_comida,
                ir.num_arboles,
                ir.horario_jornalero
            FROM info_ranchos ir
            INNER JOIN areas a ON ir.id_area = a.id_area";
    $stmt = $conexion->prepare($sql);

    if (!$stmt) {
        respuesta(500, "Error en la preparación", "Hubo un error al preparar la consulta: " . $conexion->error, "error", []);
        return;
    }

    $stmt->execute();
    $result = $stmt->get_result();

    $data = [];

    if ($result->num_rows > 0) {

        while ($row = $result->fetch_assoc()) {
            $row['horario_jornalero'] = json_decode($row['horario_jornalero'], true);
            $data[] = $row;
        }

        respuesta(200, "success", "success", "success", $data);
    } else {
        respuesta(404, "No encontrado", "No existen registros", "warning", []);
    }
    $stmt->close();
}

function borrarInfoRancho()
{
    global $conexion;

    if (empty($_POST["id_info_rancho"])) {
        respuesta(400, "ID requerido", "Debes proporcionar el ID de la información del rancho a borrar", "error", []);
        exit;
    }

    $id_info_rancho = (int)$_POST["id_info_rancho"];

    $sql = "DELETE FROM info_ranchos WHERE id_info_rancho = ?";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("i", $id_info_rancho);

    if ($stmt->execute()) {
        respuesta(200, "Información borrada", "La información del rancho se ha borrado correctamente", "success", []);
    } else {
        respuesta(500, "Error al borrar", "Hubo un error al borrar la información del rancho: " . $stmt->error, "error", []);
    }
}
