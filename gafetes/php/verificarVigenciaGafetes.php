<?php
// Incluir archivo de conexión a la base de datos
require_once('../../conexion/conexion.php');

// Verificar gafetes vencidos
$sql = "SELECT id_empleado, clave_empleado, nombre, ap_paterno, ap_materno, fecha_creacion, fecha_vigencia 
        FROM info_empleados 
        WHERE fecha_vigencia < CURDATE() AND fecha_vigencia IS NOT NULL";

$result = $conexion->query($sql);

$gafetesVencidos = array();

if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        // Calcular días vencidos
        $fecha_vigencia = new DateTime($row['fecha_vigencia']);
        $hoy = new DateTime();
        $diferencia = $fecha_vigencia->diff($hoy);
        
        $row['dias_vencidos'] = $diferencia->days;
        $gafetesVencidos[] = $row;
    }
}

echo json_encode([
    'success' => true,
    'gafetes_vencidos' => $gafetesVencidos,
    'total_vencidos' => count($gafetesVencidos)
]);

$conexion->close();
?>