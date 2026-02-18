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
        case 'listarTiposNomina':
            listarTiposNomina();
            break;
 
        default:
            echo "Acción no reconocida";
    }
} else {
    echo "No se especificó ninguna acción";
}

function listarTiposNomina(){
    
}