<?php
// Evitar que warnings/avisos rompan el JSON de respuesta
ini_set('display_errors', 0);
error_reporting(0);

include '../../conexion/conexion.php';

// Forzar cabecera JSON
header('Content-Type: application/json; charset=UTF-8');

// Obtener datos enviados desde el cliente
$data = json_decode(file_get_contents('php://input'), true);

$case = $data['case'] ?? '';

switch ($case) {
    case 'guardarNomina':
        guardarNomina($data, $conexion);
        break;
    case 'validarExistenciaNomina':
        validarExistenciaNomina($data, $conexion);
        break;
    case 'obtenerNomina':
        obtenerNomina($data, $conexion);
        break;

    default:
        echo json_encode(['success' => false, 'message' => 'Caso no válido']);
        break;
}

function guardarNomina($data, $conexion) {
    $id_empresa = $data['id_empresa'];
    $numero_semana = $data['numero_semana'];
    $anio = $data['anio'];
    $nomina = $data['nomina'];
    $actualizar = $data['actualizar'];

    // Verificar si ya existe la nómina considerando número de semana y año
    $query = "SELECT * FROM nomina_40 WHERE numero_semana = ? AND anio = ?";
    $stmt = $conexion->prepare($query);
    $stmt->bind_param("ii", $numero_semana, $anio);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        if ($actualizar) {
            // Actualizar nómina existente
            $updateQuery = "UPDATE nomina_40 SET nomina_40lbs = ? WHERE id_empresa = ? AND numero_semana = ? AND anio = ?";
            $updateStmt = $conexion->prepare($updateQuery);
            $updateStmt->bind_param("siii", $nomina, $id_empresa, $numero_semana, $anio);
            if ($updateStmt->execute()) {
                echo json_encode(['success' => true, 'message' => 'Nómina actualizada correctamente']);
            } else {
                echo json_encode(['success' => false, 'message' => 'Error al actualizar la nómina']);
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'La nómina ya existe y no se puede actualizar']);
        }
    } else {
        // Insertar nueva nómina
        $insertQuery = "INSERT INTO nomina_40 (id_empresa, numero_semana, anio, nomina_40lbs) VALUES (?, ?, ?, ?)";
        $insertStmt = $conexion->prepare($insertQuery);
        $insertStmt->bind_param("iiis", $id_empresa, $numero_semana, $anio, $nomina);
        if ($insertStmt->execute()) {
            echo json_encode(['success' => true, 'message' => 'Nómina guardada correctamente']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error al guardar la nómina']);
        }
    }
}

function validarExistenciaNomina($data, $conexion) {
    $numero_semana = isset($data['numero_semana']) ? intval($data['numero_semana']) : 0;
    $anio = isset($data['anio']) ? intval($data['anio']) : 0;
    $id_empresa = isset($data['id_empresa']) ? intval($data['id_empresa']) : 1;

    // Consulta simple para verificar existencia (se asume que la tabla usada es nomina_40 o similar)
    $query = "SELECT COUNT(*) AS cnt FROM nomina_40 WHERE id_empresa = ? AND numero_semana = ? AND anio = ?";
    $stmt = $conexion->prepare($query);
    $stmt->bind_param("iii", $id_empresa, $numero_semana, $anio);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    $exists = ($row && isset($row['cnt']) && intval($row['cnt']) > 0) ? true : false;

    echo json_encode(['success' => true, 'exists' => $exists]);
}

// Obtener la nómina almacenada (tabla `nomina_40lbs` según tu esquema)
function obtenerNomina($data, $conexion) {
    $numero_semana = isset($data['numero_semana']) ? intval($data['numero_semana']) : 0;
    $id_empresa = isset($data['id_empresa']) ? intval($data['id_empresa']) : 1;

    // Usar la tabla `nomina_40` que contiene la columna `anio` según tu esquema
    $anio = isset($data['anio']) ? intval($data['anio']) : 0;
    $query = "SELECT nomina_40lbs FROM nomina_40 WHERE id_empresa = ? AND numero_semana = ? AND anio = ? ORDER BY id_nomina_40lbs DESC LIMIT 1";
    $stmt = $conexion->prepare($query);
    if (!$stmt) {
        // Responder con error manejable en JSON en lugar de un 500
        echo json_encode(['success' => false, 'message' => 'Error en la consulta a la base de datos']);
        return;
    }
    $stmt->bind_param("iii", $id_empresa, $numero_semana, $anio);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result && $result->num_rows > 0) {
        $row = $result->fetch_assoc();
        $nomina_raw = $row['nomina_40lbs'];

        // Intentar decodificar JSON guardado
        $nomina = json_decode($nomina_raw, true);
        if (json_last_error() === JSON_ERROR_NONE) {
            echo json_encode(['success' => true, 'found' => true, 'nomina' => $nomina]);
        } else {
            // Si no es JSON válido, devolver el contenido crudo
            echo json_encode(['success' => true, 'found' => true, 'nomina' => $nomina_raw]);
        }
    } else {
        echo json_encode(['success' => true, 'found' => false]);
    }
}
?>