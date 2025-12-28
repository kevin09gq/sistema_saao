<?php
// obtenerPrestamos.php — devuelve lista de préstamos en JSON
include "../../conexion/conexion.php";

header('Content-Type: application/json; charset=utf-8');

$query = "SELECT 
    p.id_prestamo,
    p.id_empleado,
    p.monto_total,
    p.monto_semanal,
    p.semanas_totales,
    p.semanas_pagadas,
    p.saldo_restante,
    p.estado,
    DATE_FORMAT(p.fecha_inicio, '%d/%m/%Y') AS fecha_inicio,
    e.clave_empleado,
    CONCAT(e.nombre, ' ', e.ap_paterno, ' ', e.ap_materno) AS nombre_completo
FROM prestamos p
LEFT JOIN info_empleados e ON p.id_empleado = e.id_empleado
ORDER BY e.nombre ASC, e.ap_paterno ASC, e.ap_materno ASC";

$result = mysqli_query($conexion, $query);

$rows = array();
if ($result) {
    while ($r = mysqli_fetch_assoc($result)) {
        $rows[] = $r;
    }
}

echo json_encode($rows);

mysqli_close($conexion);
?>
