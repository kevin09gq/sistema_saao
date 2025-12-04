<?php
include "../../conexion/conexion.php";

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

