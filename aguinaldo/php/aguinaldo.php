<?php
require_once __DIR__ . '/../../conexion/conexion.php';

// Verificar si la conexión a la base de datos es válida
if (!$conexion) {
    die("Error de conexión: " . mysqli_connect_error());
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
        "mensaje" => $mensaje,
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

    if (empty($anio)) {
        respuesta(400, "Error", "Año no proporcionado", "error", []);
        return;
    }

    $sql = "SELECT jsonAguinaldo FROM aguinaldos WHERE anio = ? LIMIT 1";
    $stmt = $conexion->prepare($sql);

    if (!$stmt) {
        respuesta(500, "Error", "Error en prepare: " . $conexion->error, "error", []);
        return;
    }

    $stmt->bind_param("i", $anio);
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

    if (!isset($_POST['anio']) || !isset($_POST['json'])) {
        respuesta(400, "Error", "Datos incompletos", "error", []);
        return;
    }

    $anio = (int)$_POST['anio'];
    // $jsonAguinaldo = json_encode($_POST['json'], JSON_UNESCAPED_UNICODE);
    $jsonAguinaldo = $_POST['json'];

    $conexion->begin_transaction();

    try {

        // 1. Verificar si ya existe el año
        $sql = "SELECT id_aguinaldo FROM aguinaldos WHERE anio = ? LIMIT 1";
        $stmt = $conexion->prepare($sql);

        if (!$stmt) {
            throw new Exception("Error en SELECT: " . $conexion->error);
        }

        $stmt->bind_param("i", $anio);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($row = $result->fetch_assoc()) {

            // Si existe actualiza el json y la fecha de creación
            $sql = "UPDATE aguinaldos 
                    SET jsonAguinaldo = ?, fecha_creacion = NOW() 
                    WHERE anio = ?";

            $stmt = $conexion->prepare($sql);

            if (!$stmt) {
                throw new Exception("Error en UPDATE: " . $conexion->error);
            }

            $stmt->bind_param("si", $jsonAguinaldo, $anio);
            $stmt->execute();

            $mensaje = "Registro de aguinaldo actualizado exitosamente";

        } else {

            // Si no existe, inserta un nuevo registro
            $sql = "INSERT INTO aguinaldos (jsonAguinaldo, anio, fecha_creacion) 
                    VALUES (?, ?, NOW())";

            $stmt = $conexion->prepare($sql);

            if (!$stmt) {
                throw new Exception("Error en INSERT: " . $conexion->error);
            }

            $stmt->bind_param("si", $jsonAguinaldo, $anio);
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

        respuesta(500, "Error", $e->getMessage(), "error", []);
    }
}
