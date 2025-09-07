<?php
// Incluir conexión a la base de datos
include("../../conexion/conexion.php");

// Verificar conexión
if ($conexion->connect_error) {
    die("Error de conexión: " . $conexion->connect_error);
}

// Verificar permisos del usuario
$query = "SHOW GRANTS FOR CURRENT_USER()";
$result = $conexion->query($query);

if ($result) {
    echo "<h2>Permisos del usuario de la base de datos:</h2>";
    while ($row = $result->fetch_row()) {
        echo $row[0] . "<br>";
    }
} else {
    echo "Error al obtener permisos: " . $conexion->error;
}

// Verificar si se puede actualizar un registro de prueba
echo "<h2>Prueba de actualización:</h2>";
$stmt = $conexion->prepare("UPDATE info_empleados SET ruta_foto = 'test.jpg' WHERE id_empleado = 1");
if ($stmt) {
    if ($stmt->execute()) {
        echo "Actualización exitosa<br>";
        
        // Revertir el cambio
        $stmt2 = $conexion->prepare("UPDATE info_empleados SET ruta_foto = NULL WHERE id_empleado = 1");
        if ($stmt2) {
            $stmt2->execute();
            $stmt2->close();
        }
    } else {
        echo "Error al actualizar: " . $stmt->error . "<br>";
    }
    $stmt->close();
} else {
    echo "Error al preparar la consulta: " . $conexion->error . "<br>";
}

$conexion->close();
?>