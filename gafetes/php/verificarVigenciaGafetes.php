<?php
// Incluir archivo de conexión a la base de datos
require_once('../../conexion/conexion.php');

// Verificar gafetes vencidos
$sql_vencidos = "SELECT id_empleado, clave_empleado, nombre, ap_paterno, ap_materno, fecha_creacion, fecha_vigencia 
        FROM info_empleados 
        WHERE fecha_vigencia < CURDATE() 
          AND fecha_vigencia IS NOT NULL
          AND id_status = 1"; // Solo empleados activos

$result_vencidos = $conexion->query($sql_vencidos);

$gafetesVencidos = array();

if ($result_vencidos && $result_vencidos->num_rows > 0) {
    while($row = $result_vencidos->fetch_assoc()) {
        // Calcular días vencidos
        $fecha_vigencia = new DateTime($row['fecha_vigencia']);
        $hoy = new DateTime();
        $diferencia = $fecha_vigencia->diff($hoy);
        $row['dias_vencidos'] = $diferencia->days;
        $gafetesVencidos[] = $row;
    }
}

// Verificar gafetes próximos a vencer (dentro de 7 días, inclusive hoy)
$sql_proximos = "SELECT id_empleado, clave_empleado, nombre, ap_paterno, ap_materno, fecha_creacion, fecha_vigencia 
        FROM info_empleados 
        WHERE fecha_vigencia IS NOT NULL 
          AND fecha_vigencia >= CURDATE() 
          AND fecha_vigencia <= DATE_ADD(CURDATE(), INTERVAL 7 DAY)
          AND id_status = 1"; // Solo empleados activos

$result_proximos = $conexion->query($sql_proximos);

$gafetesProximos = array();

if ($result_proximos && $result_proximos->num_rows > 0) {
    while($row = $result_proximos->fetch_assoc()) {
        // Calcular días restantes
        $hoy = new DateTime();
        $hoy->setTime(0,0,0);
        $fecha_vigencia = new DateTime($row['fecha_vigencia']);
        $fecha_vigencia->setTime(0,0,0);
        $diferencia = $hoy->diff($fecha_vigencia);
        $row['dias_restantes'] = (int)$diferencia->format('%r%a');
        $gafetesProximos[] = $row;
    }
}

echo json_encode([
    'success' => true,
    'gafetes_vencidos' => $gafetesVencidos,
    'total_vencidos' => count($gafetesVencidos),
    'gafetes_proximos' => $gafetesProximos,
    'total_proximos' => count($gafetesProximos)
]);

$conexion->close();
?>