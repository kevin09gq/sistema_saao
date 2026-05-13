<?php
include("../../../conexion/conexion.php");

// Verificar si la conexión a la base de datos es válida
if (!$conexion) {
    die("Error de conexión: " . mysqli_connect_error());
}

if (isset($_GET['accion']) || isset($_POST['accion'])) {
    $accion = $_GET['accion'] ?? $_POST['accion'];

    switch ($accion) {
        // VERSIONES LFT
        case 'listarVersiones':
            listarVersiones();
            break;
        case 'guardarVersion':
            guardarVersion();
            break;
        case 'eliminarVersion':
            eliminarVersion();
            break;
        case 'obtenerInfoVersion':
            obtenerInfoVersion();
            break;

        // DÍAS LFT
        case 'listarDias':
            listarDias();
            break;
        case 'guardarDia':
            guardarDia();
            break;
        case 'eliminarDia':
            eliminarDia();
            break;

        // PRIMAS LFT
        case 'listarPrimas':
            listarPrimas();
            break;
        case 'guardarPrima':
            guardarPrima();
            break;
        case 'eliminarPrima':
            eliminarPrima();
            break;

        default:
            echo json_encode(["error" => true, "mensaje" => "Acción no reconocida"]);
    }
} else {
    echo json_encode(["error" => true, "mensaje" => "No se especificó ninguna acción"]);
}

// ======================
// FUNCIONES PARA RESPONDER
// ======================
function respuesta(int $code, string $titulo, string $mensaje, string $icono, array $data = [])
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

// ======================
// VERSIONES LFT
// ======================

function listarVersiones() {
    global $conexion;
    $sql = "SELECT * FROM versiones_vacaciones_lft ORDER BY fecha_inicio_vigencia DESC";
    $res = $conexion->query($sql);
    $data = [];
    while ($row = $res->fetch_assoc()) {
        $data[] = $row;
    }
    echo json_encode($data);
}

function obtenerInfoVersion() {
    global $conexion;
    $id = (int)$_POST['id_version_vacaciones'];
    $sql = "SELECT * FROM versiones_vacaciones_lft WHERE id_version_vacaciones = $id";
    $res = $conexion->query($sql);
    echo json_encode($res->fetch_assoc());
}

function guardarVersion() {
    global $conexion;
    $id = isset($_POST['id_version_vacaciones']) ? (int)$_POST['id_version_vacaciones'] : 0;
    $nombre = trim($_POST['nombre_version']);
    $inicio = $_POST['fecha_inicio_vigencia'];
    $fin = !empty($_POST['fecha_fin_vigencia']) ? $_POST['fecha_fin_vigencia'] : null;

    if ($id > 0) {
        $stmt = $conexion->prepare("UPDATE versiones_vacaciones_lft SET nombre_version=?, fecha_inicio_vigencia=?, fecha_fin_vigencia=? WHERE id_version_vacaciones=?");
        $stmt->bind_param("sssi", $nombre, $inicio, $fin, $id);
    } else {
        $stmt = $conexion->prepare("INSERT INTO versiones_vacaciones_lft (nombre_version, fecha_inicio_vigencia, fecha_fin_vigencia) VALUES (?, ?, ?)");
        $stmt->bind_param("sss", $nombre, $inicio, $fin);
    }

    if ($stmt->execute()) {
        echo "1";
    } else {
        echo "0";
    }
    $stmt->close();
}

function eliminarVersion() {
    global $conexion;
    $id = (int)$_POST['id_version_vacaciones'];
    $stmt = $conexion->prepare("DELETE FROM versiones_vacaciones_lft WHERE id_version_vacaciones = ?");
    $stmt->bind_param("i", $id);
    if ($stmt->execute()) {
        echo "1";
    } else {
        echo "0";
    }
    $stmt->close();
}

// ======================
// DÍAS LFT
// ======================

function listarDias() {
    global $conexion;
    $id_version = (int)$_POST['id_version_vacaciones'];
    $sql = "SELECT * FROM dias_vacaciones_lft WHERE id_version_vacaciones = $id_version ORDER BY anios_antiguedad_inicio ASC";
    $res = $conexion->query($sql);
    $data = [];
    while ($row = $res->fetch_assoc()) {
        $data[] = $row;
    }
    echo json_encode($data);
}

function guardarDia() {
    global $conexion;
    $id_version = (int)$_POST['id_version_vacaciones'];
    $inicio = (int)$_POST['anios_antiguedad_inicio'];
    $fin = !empty($_POST['anios_antiguedad_fin']) ? (int)$_POST['anios_antiguedad_fin'] : $inicio;
    $dias = (int)$_POST['dias_vacaciones_correspondientes'];

    $stmt = $conexion->prepare("INSERT INTO dias_vacaciones_lft (id_version_vacaciones, anios_antiguedad_inicio, anios_antiguedad_fin, dias_vacaciones_correspondientes) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("iiii", $id_version, $inicio, $fin, $dias);

    if ($stmt->execute()) {
        respuesta(200, "Éxito", "Rango de días agregado correctamente.", "success");
    } else {
        respuesta(500, "Error", "No se pudo agregar el rango.", "error");
    }
    $stmt->close();
}

function eliminarDia() {
    global $conexion;
    $id = (int)$_POST['id_dias_vacaciones'];
    $stmt = $conexion->prepare("DELETE FROM dias_vacaciones_lft WHERE id_dias_vacaciones = ?");
    $stmt->bind_param("i", $id);
    if ($stmt->execute()) {
        echo "1";
    } else {
        echo "0";
    }
    $stmt->close();
}

// ======================
// PRIMAS LFT
// ======================

function listarPrimas() {
    global $conexion;
    $id_version = (int)$_POST['id_version_vacaciones'];
    $sql = "SELECT * FROM primas_vacacionales_lft WHERE id_version_vacaciones = $id_version ORDER BY fecha_inicio_vigencia DESC";
    $res = $conexion->query($sql);
    $data = [];
    while ($row = $res->fetch_assoc()) {
        $data[] = $row;
    }
    echo json_encode($data);
}

function guardarPrima() {
    global $conexion;
    $id_version = (int)$_POST['id_version_vacaciones'];
    $porcentaje = $_POST['porcentaje_prima'];
    $inicio = $_POST['fecha_inicio_vigencia'];
    $fin = !empty($_POST['fecha_fin_vigencia']) ? $_POST['fecha_fin_vigencia'] : null;

    $stmt = $conexion->prepare("INSERT INTO primas_vacacionales_lft (id_version_vacaciones, porcentaje_prima, fecha_inicio_vigencia, fecha_fin_vigencia) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("idss", $id_version, $porcentaje, $inicio, $fin);

    if ($stmt->execute()) {
        respuesta(200, "Éxito", "Prima vacacional agregada correctamente.", "success");
    } else {
        respuesta(500, "Error", "No se pudo agregar la prima.", "error");
    }
    $stmt->close();
}

function eliminarPrima() {
    global $conexion;
    $id = (int)$_POST['id_prima_vacacional'];
    $stmt = $conexion->prepare("DELETE FROM primas_vacacionales_lft WHERE id_prima_vacacional = ?");
    $stmt->bind_param("i", $id);
    if ($stmt->execute()) {
        echo "1";
    } else {
        echo "0";
    }
    $stmt->close();
}
