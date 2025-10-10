<?php
// Archivo de prueba para verificar la actualización de fechas
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once('../../conexion/conexion.php');

// ID de empleado de prueba (cambiar por un ID válido)
$id_empleado = 1;

// Verificar conexión
if (!$conexion) {
    die("Error de conexión: " . mysqli_connect_error());
}

echo "Conexión exitosa a la base de datos<br>";

// Verificar que el empleado existe
$sql_check = "SELECT id_empleado, clave_empleado, nombre, imss, fecha_creacion, fecha_vigencia FROM info_empleados WHERE id_empleado = ?";
$stmt_check = $conexion->prepare($sql_check);
$stmt_check->bind_param('i', $id_empleado);
$stmt_check->execute();
$result = $stmt_check->get_result();

if ($result->num_rows > 0) {
    $empleado = $result->fetch_assoc();
    echo "<h3>Empleado encontrado:</h3>";
    echo "<pre>";
    print_r($empleado);
    echo "</pre>";
    
    // Intentar actualizar las fechas
    $fecha_creacion = date('Y-m-d');
    $fecha_vigencia = date('Y-m-d', strtotime('+6 months'));
    
    echo "<h3>Intentando actualizar con:</h3>";
    echo "Fecha creación: $fecha_creacion<br>";
    echo "Fecha vigencia: $fecha_vigencia<br>";
    
    $sql_update = "UPDATE info_empleados SET fecha_creacion = ?, fecha_vigencia = ? WHERE id_empleado = ?";
    $stmt_update = $conexion->prepare($sql_update);
    
    if ($stmt_update) {
        $stmt_update->bind_param('ssi', $fecha_creacion, $fecha_vigencia, $id_empleado);
        
        if ($stmt_update->execute()) {
            echo "<h3 style='color: green;'>✓ Actualización exitosa!</h3>";
            echo "Filas afectadas: " . $stmt_update->affected_rows . "<br>";
            
            // Verificar los datos actualizados
            $stmt_check->execute();
            $result2 = $stmt_check->get_result();
            $empleado_actualizado = $result2->fetch_assoc();
            
            echo "<h3>Datos después de la actualización:</h3>";
            echo "<pre>";
            print_r($empleado_actualizado);
            echo "</pre>";
        } else {
            echo "<h3 style='color: red;'>✗ Error al ejecutar UPDATE:</h3>";
            echo $stmt_update->error;
        }
        
        $stmt_update->close();
    } else {
        echo "<h3 style='color: red;'>✗ Error al preparar UPDATE:</h3>";
        echo $conexion->error;
    }
} else {
    echo "<h3 style='color: red;'>✗ Empleado con ID $id_empleado no encontrado</h3>";
}

$stmt_check->close();
$conexion->close();
?>
