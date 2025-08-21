<?php
header('Content-Type: application/json');
include("../../conexion/conexion.php");

// Obtener el ID del departamento del parámetro GET
$idDepartamento = isset($_GET['id_departamento']) ? intval($_GET['id_departamento']) : null;

// Construir la consulta SQL
$sql = "SELECT e.*, d.nombre_departamento, a.nombre_area, emp.nombre_empresa AS nombre_empresa, ec.parentesco as emergencia_parentesco, ce.telefono as emergencia_telefono, ce.domicilio as emergencia_domicilio, ce.nombre as emergencia_nombre, ce.ap_paterno as emergencia_ap_paterno, ce.ap_materno as emergencia_ap_materno 
        FROM info_empleados e 
        LEFT JOIN departamentos d ON e.id_departamento = d.id_departamento 
        LEFT JOIN areas a ON e.id_area = a.id_area 
        LEFT JOIN empresa emp ON e.id_empresa = emp.id_empresa 
        LEFT JOIN empleado_contacto ec ON e.id_empleado = ec.id_empleado 
        LEFT JOIN contacto_emergencia ce ON ec.id_contacto = ce.id_contacto 
        WHERE e.id_status = 1";

// Si se especificó un departamento, filtrar por él
if ($idDepartamento && $idDepartamento > 0) {
    $sql .= " AND e.id_departamento = $idDepartamento";
}

// Ordenar por apellido paterno y nombre
$sql .= " ORDER BY e.ap_paterno, e.nombre";

$query = $conexion->query($sql);

if (!$query) {
    http_response_code(500);
    echo json_encode(["error" => "Error al obtener empleados: " . $conexion->error]);
    exit;
}

$empleados = [];
while ($row = $query->fetch_object()) {
    $empleados[] = [
        'id_empleado' => $row->id_empleado,
        'clave_empleado' => $row->clave_empleado,
        'nombre' => $row->nombre,
        'ap_paterno' => $row->ap_paterno,
        'ap_materno' => $row->ap_materno,
        'id_departamento' => $row->id_departamento,
        'nombre_departamento' => $row->nombre_departamento,
        'id_area' => $row->id_area,
        'nombre_area' => $row->nombre_area,
        'puesto' => $row->puesto ?? 'No especificado',
        'foto' => !empty($row->foto) ? $row->foto : null,
        'sexo' => $row->sexo ?? null,
        'fecha_ingreso' => $row->fecha_ingreso ?? null,
        'fecha_nacimiento' => $row->fecha_nacimiento ?? null,
        'nombre_empresa' => $row->nombre_empresa ?? 'N/A',
        // Campos adicionales para gafete
        'domicilio' => $row->domicilio ?? 'N/A',
        'imss' => $row->imss ?? 'N/A',
        'curp' => $row->curp ?? 'N/A',
        'enfermedades_alergias' => $row->enfermedades_alergias ?? 'N/A',
        'grupo_sanguineo' => $row->grupo_sanguineo ?? 'N/A',
        'num_casillero' => $row->num_casillero ?? 'N/A',
        // Datos de emergencia
        'emergencia_parentesco' => $row->emergencia_parentesco ?? 'N/A',
        'emergencia_nombre_contacto' => trim(($row->emergencia_nombre ?? '') . ' ' . ($row->emergencia_ap_paterno ?? '') . ' ' . ($row->emergencia_ap_materno ?? '')) ?: 'N/A',
        'emergencia_telefono' => $row->emergencia_telefono ?? 'N/A',
        'emergencia_domicilio' => $row->emergencia_domicilio ?? 'N/A'
    ];
}

echo json_encode($empleados);
?>
