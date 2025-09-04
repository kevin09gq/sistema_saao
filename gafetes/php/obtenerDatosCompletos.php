<?php
header('Content-Type: application/json');
include("../../conexion/conexion.php");

// Limpiar el buffer de salida para evitar corrupción de JSON
ob_start();

try {
    // Verificar si se recibieron IDs de empleados
    $empleados_ids = isset($_POST['empleados_ids']) ? $_POST['empleados_ids'] : [];
    
    if (empty($empleados_ids)) {
        throw new Exception('No se proporcionaron IDs de empleados');
    }

    // Sanitizar los IDs
    $empleados_ids = array_map('intval', $empleados_ids);
    $placeholders = str_repeat('?,', count($empleados_ids) - 1) . '?';

    // Query para obtener empleados con toda la información necesaria para gafetes
    $sql = "SELECT 
                e.id_empleado,
                e.clave_empleado,
                e.nombre,
                e.ap_paterno,
                e.ap_materno,
                e.domicilio,
                e.imss,
                e.curp,
                e.sexo,
                e.enfermedades_alergias,
                e.grupo_sanguineo,
                e.fecha_nacimiento,
                e.fecha_ingreso,
                e.num_casillero,
                e.ruta_foto,
                d.nombre_departamento,
                a.nombre_area,
                a.logo_area,
                emp.nombre_empresa,
                emp.logo_empresa,
                ps.nombre_puesto,
                s.nombre_status
            FROM info_empleados e
                LEFT JOIN departamentos d ON e.id_departamento = d.id_departamento
                LEFT JOIN areas a ON e.id_area = a.id_area
                LEFT JOIN empresa emp ON e.id_empresa = emp.id_empresa
                LEFT JOIN puestos_especiales ps ON e.id_puestoEspecial = ps.id_puestoEspecial
                LEFT JOIN status s ON e.id_status = s.id_status
            WHERE e.id_empleado IN ($placeholders)
            ORDER BY e.nombre ASC, e.ap_paterno ASC";

    $stmt = $conexion->prepare($sql);
    $stmt->bind_param(str_repeat('i', count($empleados_ids)), ...$empleados_ids);
    $stmt->execute();
    $resultado = $stmt->get_result();

    $empleados = [];
    while ($row = $resultado->fetch_assoc()) {
        $empleados[$row['id_empleado']] = [
            'id_empleado' => $row['id_empleado'],
            'clave_empleado' => $row['clave_empleado'],
            'nombre' => $row['nombre'],
            'ap_paterno' => $row['ap_paterno'],
            'ap_materno' => $row['ap_materno'],
            'nombre_completo' => trim($row['nombre'] . ' ' . ($row['ap_paterno'] ?? '') . ' ' . ($row['ap_materno'] ?? '')),
            'domicilio' => $row['domicilio'],
            'imss' => $row['imss'],
            'curp' => $row['curp'],
            'sexo' => $row['sexo'],
            'enfermedades_alergias' => $row['enfermedades_alergias'],
            'grupo_sanguineo' => $row['grupo_sanguineo'],
            'fecha_nacimiento' => $row['fecha_nacimiento'],
            'fecha_ingreso' => $row['fecha_ingreso'],
            'num_casillero' => $row['num_casillero'],
            'ruta_foto' => $row['ruta_foto'],
            'nombre_departamento' => $row['nombre_departamento'],
            'nombre_area' => $row['nombre_area'],
            'nombre_empresa' => $row['nombre_empresa'],
            'nombre_puesto' => $row['nombre_puesto'],
            'nombre_status' => $row['nombre_status'],
            'logo_area' => $row['logo_area'],
            'logo_empresa' => $row['logo_empresa'],
            'logo_area_url' => !empty($row['logo_area']) ? 
                'logos_area/' . $row['logo_area'] : null,
            'logo_empresa_url' => !empty($row['logo_empresa']) ? 
                'logos_empresa/' . $row['logo_empresa'] : null,
            'contactos_emergencia' => []
        ];
    }

    // Obtener contactos de emergencia para todos los empleados
    if (!empty($empleados)) {
        $sql_contactos = "SELECT 
                            ec.id_empleado,
                            c.nombre,
                            c.ap_paterno,
                            c.ap_materno,
                            c.telefono,
                            c.domicilio,
                            ec.parentesco
                        FROM empleado_contacto ec
                            INNER JOIN contacto_emergencia c ON ec.id_contacto = c.id_contacto
                        WHERE ec.id_empleado IN ($placeholders)
                        ORDER BY ec.id_empleado ASC";

        $stmt_contactos = $conexion->prepare($sql_contactos);
        $stmt_contactos->bind_param(str_repeat('i', count($empleados_ids)), ...$empleados_ids);
        $stmt_contactos->execute();
        $resultado_contactos = $stmt_contactos->get_result();

        while ($contacto = $resultado_contactos->fetch_assoc()) {
            $id_empleado = $contacto['id_empleado'];
            if (isset($empleados[$id_empleado])) {
                $empleados[$id_empleado]['contactos_emergencia'][] = [
                    'nombre' => $contacto['nombre'],
                    'ap_paterno' => $contacto['ap_paterno'],
                    'ap_materno' => $contacto['ap_materno'],
                    'nombre_completo' => trim($contacto['nombre'] . ' ' . ($contacto['ap_paterno'] ?? '') . ' ' . ($contacto['ap_materno'] ?? '')),
                    'telefono' => $contacto['telefono'],
                    'domicilio' => $contacto['domicilio'],
                    'parentesco' => $contacto['parentesco']
                ];
            }
        }
    }

    // Convertir el array asociativo a array indexado
    $empleados_data = array_values($empleados);

    // Limpiar buffer y enviar respuesta
    ob_end_clean();
    echo json_encode([
        'success' => true,
        'data' => $empleados_data,
        'total' => count($empleados_data)
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    // Limpiar buffer y enviar error
    ob_end_clean();
    echo json_encode([
        'success' => false,
        'message' => 'Error al obtener datos completos: ' . $e->getMessage(),
        'error_code' => $e->getCode()
    ]);
}

// Cerrar conexión
if (isset($conexion)) {
    $conexion->close();
}
?>