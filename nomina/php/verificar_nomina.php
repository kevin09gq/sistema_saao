<?php
include("../../conexion/conexion.php");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (isset($_POST['accion']) && $_POST['accion'] === 'verificar') {
        // Verificar si existe nómina
        if (isset($_POST['numero_semana']) && !empty($_POST['numero_semana'])) {
            $numeroSemana = $_POST['numero_semana'];
            
            try {
                // Verificar si ya existe una nómina con ese número de semana
                $sql = $conexion->prepare("SELECT id_nomina_json FROM nomina WHERE JSON_EXTRACT(datos_nomina, '$.numero_semana') = ?");
                $sql->bind_param("s", $numeroSemana);
                $sql->execute();
                $resultado = $sql->get_result();
                
                if ($resultado->num_rows > 0) {
                    echo json_encode(['existe' => true]);
                } else {
                    echo json_encode(['existe' => false]);
                }
                
                $sql->close();
            } catch (Exception $e) {
                echo json_encode(['existe' => false]);
            }
        } else {
            echo json_encode(['existe' => false]);
        }
        
    } else if (isset($_POST['accion']) && $_POST['accion'] === 'obtener') {
        // Obtener el JSON de nómina de la base de datos
        if (isset($_POST['numero_semana']) && !empty($_POST['numero_semana'])) {
            $numeroSemana = $_POST['numero_semana'];
            
            try {
                // Obtener la nómina con ese número de semana
                $sql = $conexion->prepare("SELECT datos_nomina FROM nomina WHERE JSON_EXTRACT(datos_nomina, '$.numero_semana') = ?");
                $sql->bind_param("s", $numeroSemana);
                $sql->execute();
                $resultado = $sql->get_result();
                
                if ($resultado->num_rows > 0) {
                    $row = $resultado->fetch_assoc();
                    $nomina = json_decode($row['datos_nomina'], true);
                    echo json_encode(['success' => true, 'nomina' => $nomina]);
                } else {
                    echo json_encode(['success' => false]);
                }
                
                $sql->close();
            } catch (Exception $e) {
                echo json_encode(['success' => false]);
            }
        } else {
            echo json_encode(['success' => false]);
        }
        
    } else if (isset($_POST['accion']) && $_POST['accion'] === 'verificar_horarios') {
        // NUEVA FUNCIÓN: Verificar si existen horarios para esa semana
        if (isset($_POST['numero_semana']) && !empty($_POST['numero_semana'])) {
            $numeroSemana = $_POST['numero_semana'];
            
            try {
                // Verificar si ya existen horarios con ese número de semana
                $sql = $conexion->prepare("SELECT id_horario FROM horarios_oficiales WHERE JSON_EXTRACT(horario_json, '$.numero_semana') = ?");
                $sql->bind_param("s", $numeroSemana);
                $sql->execute();
                $resultado = $sql->get_result();
                
                if ($resultado->num_rows > 0) {
                    echo json_encode(['existe' => true]);
                } else {
                    echo json_encode(['existe' => false]);
                }
                
                $sql->close();
            } catch (Exception $e) {
                echo json_encode(['existe' => false]);
            }
        } else {
            echo json_encode(['existe' => false]);
        }
        
    } else if (isset($_POST['accion']) && $_POST['accion'] === 'obtener_horarios') {
        // NUEVA FUNCIÓN: Obtener horarios de la base de datos
        if (isset($_POST['numero_semana']) && !empty($_POST['numero_semana'])) {
            $numeroSemana = $_POST['numero_semana'];
            
            try {
                // Obtener los horarios con ese número de semana
                $sql = $conexion->prepare("SELECT horario_json FROM horarios_oficiales WHERE JSON_EXTRACT(horario_json, '$.numero_semana') = ?");
                $sql->bind_param("s", $numeroSemana);
                $sql->execute();
                $resultado = $sql->get_result();
                
                if ($resultado->num_rows > 0) {
                    $row = $resultado->fetch_assoc();
                    $horarios = json_decode($row['horario_json'], true);
                    echo json_encode(['success' => true, 'horarios' => $horarios]);
                } else {
                    echo json_encode(['success' => false]);
                }
                
                $sql->close();
            } catch (Exception $e) {
                echo json_encode(['success' => false]);
            }
        } else {
            echo json_encode(['success' => false]);
        }
        
    } else {
        echo json_encode(['success' => false]);
    }
} else {
    echo json_encode(['success' => false]);
}

$conexion->close();
?>