<?php
include "../../conexion/conexion.php";

/**
 * Empleados que sí tienen seguro
 */
// Definir la consulta SQL
$sql = "SELECT 
            e.id_empleado,
            e.clave_empleado,
            e.ap_paterno,
            e.ap_materno, 
            e.nombre,
            e.horario_fijo,
            ehr.horario as horario_json
        FROM info_empleados e
        LEFT JOIN empleado_horario_reloj ehr ON ehr.id_empleado = e.id_empleado
        
        ORDER BY e.ap_paterno ASC";

// Ejecutar la consulta
$resultado = $conexion->query($sql);

// Preparar arreglo para almacenar resultados
$datos = [];

if ($resultado->num_rows > 0) {
    while ($fila = $resultado->fetch_assoc()) {
        $datos[] = $fila;
    }
}

// Devolver en formato JSON
echo json_encode($datos, JSON_UNESCAPED_UNICODE);

// Cerrar conexión
$conexion->close();