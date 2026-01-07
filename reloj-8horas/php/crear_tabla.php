<?php
include "../../conexion/conexion.php";
$conn = $conexion;

$sql = "CREATE TABLE IF NOT EXISTS historial_incidencias_semanal (
    id INT AUTO_INCREMENT PRIMARY KEY,
    semana VARCHAR(10) NOT NULL UNIQUE,
    vacaciones INT DEFAULT 0,
    ausencias INT DEFAULT 0,
    incapacidades INT DEFAULT 0,
    dias_trabajados INT DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4";

if ($conn->query($sql) === TRUE) {
    echo "✅ Tabla 'historial_incidencias_semanal' creada correctamente o ya existe.";
} else {
    echo "❌ Error al crear la tabla: " . $conn->error;
}

$conn->close();
?>
