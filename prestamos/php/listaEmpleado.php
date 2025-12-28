<?php
// Incluir la conexión a la base de datos
include "../../conexion/conexion.php";

// Obtener el término de búsqueda
$busqueda = isset($_POST['busqueda']) ? $_POST['busqueda'] : '';

// Preparar la consulta para evitar inyección SQL
$busqueda = mysqli_real_escape_string($conexion, $busqueda);

// Consulta SQL para buscar empleados
$query = "SELECT 
            id_empleado,
            clave_empleado,
            CONCAT(nombre, ' ', ap_paterno, ' ', ap_materno) as nombre_completo
          FROM info_empleados
          WHERE nombre LIKE '%$busqueda%'
             OR ap_paterno LIKE '%$busqueda%'
             OR ap_materno LIKE '%$busqueda%'
             OR clave_empleado LIKE '%$busqueda%'
          ORDER BY nombre
          LIMIT 10";

// Ejecutar la consulta
$resultado = mysqli_query($conexion, $query);

// Crear array de empleados
$empleados = array();

if ($resultado) {
    while ($empleado = mysqli_fetch_assoc($resultado)) {
        $empleados[] = $empleado;
    }
}

// Devolver JSON
header('Content-Type: application/json');
echo json_encode($empleados);
?>
