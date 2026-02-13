<?php
include("../../conexion/conexion.php");

// Verificar la conexión
if (!$conexion) {
    die(json_encode(array("error" => true, "message" => "Error de conexión: " . mysqli_connect_error())));
}

// Consulta para obtener todos los turnos
$sql = "SELECT
            id_turno, 
            descripcion, 
            DATE_FORMAT(hora_inicio, '%H:%i') AS inicio_hora, 
            DATE_FORMAT (hora_fin, '%H:%i') AS fin_hora, 
            max  
        FROM 
            turnos 
        ORDER BY 
            descripcion";
$resultado = mysqli_query($conexion, $sql);

// Verificar si hay resultados
if (!$resultado) {
    die(json_encode(array("error" => true, "message" => "Error en la consulta: " . mysqli_error($conexion))));
}

// Crear array para almacenar los turnos
$turnos = array();

// Obtener cada fila como un array asociativo
while ($fila = mysqli_fetch_assoc($resultado)) {
    $turnos[] = $fila;
}

// Devolver los turnos como JSON
echo json_encode($turnos);

// Cerrar la conexión
mysqli_close($conexion);
