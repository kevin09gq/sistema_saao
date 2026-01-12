<?php
include '../../conexion/conexion.php';

header('Content-Type: application/json; charset=UTF-8');

$data = json_decode(file_get_contents('php://input'), true);

// Validar y convertir tipos correctamente
$id_empresa = isset($data['id_empresa']) ? (int)$data['id_empresa'] : null;
$numero_semana = isset($data['numero_semana']) ? (int)$data['numero_semana'] : null;
$anio = isset($data['anio']) ? (int)$data['anio'] : null;
$nomina = isset($data['nomina']) ? $data['nomina'] : null;
$actualizar = isset($data['actualizar']) ? (bool)$data['actualizar'] : false;

// Si no se proporciona año, usar el año actual
if (!$anio) {
    $anio = (int)date('Y');
}

// Log para debugging
error_log("saveNominaConfianza - Datos recibidos: id_empresa=" . $id_empresa . ", numero_semana=" . $numero_semana . ", anio=" . $anio . ", actualizar=" . ($actualizar ? 'true' : 'false'));

if (!$id_empresa || !$numero_semana || !$anio || !$anio || !$nomina) {
    echo json_encode([
        'success' => false,
        'message' => 'Datos incompletos. id_empresa=' . var_export($id_empresa, true) . ', numero_semana=' . var_export($numero_semana, true) . ', anio=' . var_export($anio, true) . ', nomina=' . (strlen($nomina) > 0 ? 'OK' : 'VACÍO')
    ]);
    $conexion->close();
    exit;
}

if ($actualizar) {
    // UPDATE: verificar si ya existe el registro
    $check_query = "SELECT id_nomina_confianza FROM nomina_confianza WHERE id_empresa = ? AND numero_semana = ? AND anio = ?";
    $check_stmt = $conexion->prepare($check_query);
    
    if (!$check_stmt) {
        echo json_encode(['success' => false, 'message' => 'Error en preparación de consulta: ' . $conexion->error]);
        $conexion->close();
        exit;
    }
    
    $check_stmt->bind_param('iii', $id_empresa, $numero_semana, $anio);
    $check_stmt->execute();
    $check_result = $check_stmt->get_result();
    
    if ($check_result->num_rows > 0) {
        // Existe, hacer UPDATE
        $query = "UPDATE nomina_confianza SET nomina = ? WHERE id_empresa = ? AND numero_semana = ? AND anio = ?";
        $stmt = $conexion->prepare($query);
        
        if (!$stmt) {
            echo json_encode(['success' => false, 'message' => 'Error en preparación UPDATE: ' . $conexion->error]);
            $check_stmt->close();
            $conexion->close();
            exit;
        }
        
        $stmt->bind_param('siii', $nomina, $id_empresa, $numero_semana, $anio);
        
        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Nómina actualizada exitosamente.'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Error al actualizar: ' . $stmt->error
            ]);
        }
        $stmt->close();
    } else {
        // No existe, hacer INSERT
        $query = "INSERT INTO nomina_confianza (id_empresa, anio, numero_semana, nomina) VALUES (?, ?, ?, ?)";
        $stmt = $conexion->prepare($query);
        
        if (!$stmt) {
            echo json_encode(['success' => false, 'message' => 'Error en preparación INSERT: ' . $conexion->error]);
            $check_stmt->close();
            $conexion->close();
            exit;
        }
        
        $stmt->bind_param('iiis', $id_empresa, $anio, $numero_semana, $nomina);
        
        if ($stmt->execute()) {
            echo json_encode([
                'success' => true,
                'message' => 'Nómina guardada exitosamente.'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Error al guardar: ' . $stmt->error
            ]);
        }
        $stmt->close();
    }
    
    $check_stmt->close();
} else {
    // INSERT directo
    $query = "INSERT INTO nomina_confianza (id_empresa, anio, numero_semana, nomina) VALUES (?, ?, ?, ?)";
    $stmt = $conexion->prepare($query);
    
    if (!$stmt) {
        echo json_encode(['success' => false, 'message' => 'Error en preparación INSERT: ' . $conexion->error]);
        $conexion->close();
        exit;
    }
    
    $stmt->bind_param('iiis', $id_empresa, $anio, $numero_semana, $nomina);
    
    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Nómina guardada exitosamente.'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Error al guardar: ' . $stmt->error
        ]);
    }
    $stmt->close();
}

$conexion->close();
?>