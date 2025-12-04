<?php
include("../../../conexion/conexion.php");

// Verificar si la conexión a la base de datos es válida
if (!$conexion) {
    die("Error de conexión: " . mysqli_connect_error());
}

if (isset($_GET['accion']) || isset($_POST['accion'])) {
    $accion = $_GET['accion'] ?? $_POST['accion'];

    switch ($accion) {
        case 'obtenerTabulador':
            // Cambia aquí para obtener id_empresa correctamente de POST o GET
            $id_empresa = $_POST['id_empresa'] ?? $_GET['id_empresa'] ?? null;
            obtenerTabulador($id_empresa);
            break;
        case 'actualizarTabulador':
            $id_empresa = $_POST['id_empresa'] ?? null;
            $info_tabulador = $_POST['info_tabulador'] ?? null;
            actualizarTabulador($id_empresa, $info_tabulador);
            break;
    }
} else {
    echo "No se especificó ninguna acción";
}

function obtenerTabulador($id_empresa)
{
    global $conexion;

    // Validar que id_empresa sea numérico y no nulo
    if (!$id_empresa || !is_numeric($id_empresa)) {
        echo json_encode([]);
        return;
    }

    $query = "SELECT info_tabulador FROM tabulador WHERE id_empresa = ?";
    $stmt = $conexion->prepare($query);
    $stmt->bind_param("i", $id_empresa);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        $row = $result->fetch_assoc();
        echo $row['info_tabulador'];
    } else {
        echo json_encode([]);
    }

    $stmt->close();
    $conexion->close();
}


function actualizarTabulador($id_empresa, $info_tabulador)
{
    global $conexion;

    // Validar que id_empresa sea numérico y no nulo
    if (!$id_empresa || !is_numeric($id_empresa) || !$info_tabulador) {
        echo json_encode(['success' => false, 'message' => 'Datos inválidos']);
        return;
    }

    // Verificar si ya existe un registro para la empresa
    $query_check = "SELECT COUNT(*) as count FROM tabulador WHERE id_empresa = ?";
    $stmt_check = $conexion->prepare($query_check);
    $stmt_check->bind_param("i", $id_empresa);
    $stmt_check->execute();
    $result_check = $stmt_check->get_result();
    $row_check = $result_check->fetch_assoc();
    $exists = $row_check['count'] > 0;
    $stmt_check->close();

    if ($exists) {
        // Actualizar el registro existente
        $query_update = "UPDATE tabulador SET info_tabulador = ? WHERE id_empresa = ?";
        $stmt_update = $conexion->prepare($query_update);
        $stmt_update->bind_param("si", $info_tabulador, $id_empresa);
        if ($stmt_update->execute()) {
            echo json_encode(['success' => true, 'message' => 'Tabulador actualizado correctamente']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error al actualizar el tabulador']);
        }
        $stmt_update->close();
    } else {
        // Insertar un nuevo registro
        $query_insert = "INSERT INTO tabulador (id_tabulador, id_empresa, info_tabulador) VALUES (1, ?, ?)";
        $stmt_insert = $conexion->prepare($query_insert);
        $stmt_insert->bind_param("is", $id_empresa, $info_tabulador);
        if ($stmt_insert->execute()) {
            echo json_encode(['success' => true, 'message' => 'Tabulador guardado correctamente']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error al guardar el tabulador']);
        }
        $stmt_insert->close();
    }
    $conexion->close();
}