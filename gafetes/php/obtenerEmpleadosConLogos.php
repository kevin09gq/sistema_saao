<?php
header('Content-Type: application/json');
include("../../conexion/conexion.php");

// Limpiar el buffer de salida para evitar corrupción de JSON
ob_start();

try {
    // Parámetros opcionales
    $departamento_id = isset($_GET['departamento']) ? intval($_GET['departamento']) : null;
    $incluir_logos = isset($_GET['incluir_logos']) ? filter_var($_GET['incluir_logos'], FILTER_VALIDATE_BOOLEAN) : false;

    // Construir query base
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
                emp.nombre_empresa,
                ps.nombre_puesto,
                s.nombre_status";

    // Si se solicitan logos, agregarlos a la consulta
    if ($incluir_logos) {
        $sql .= ",
                a.logo_area,
                emp.logo_empresa";
    }

    $sql .= " FROM info_empleados e
                LEFT JOIN departamentos d ON e.id_departamento = d.id_departamento
                LEFT JOIN areas a ON e.id_area = a.id_area
                LEFT JOIN empresa emp ON e.id_empresa = emp.id_empresa
                LEFT JOIN puestos_especiales ps ON e.id_puestoEspecial = ps.id_puestoEspecial
                LEFT JOIN status s ON e.id_status = s.id_status";

    // Agregar filtro por departamento si se especifica
    $params = [];
    $types = "";
    if ($departamento_id !== null && $departamento_id !== 0) {
        $sql .= " WHERE e.id_departamento = ?";
        $params[] = $departamento_id;
        $types .= "i";
    }

    $sql .= " ORDER BY e.nombre ASC, e.ap_paterno ASC";

    // Preparar y ejecutar consulta
    $stmt = $conexion->prepare($sql);
    
    if (!empty($params)) {
        $stmt->bind_param($types, ...$params);
    }
    
    $stmt->execute();
    $resultado = $stmt->get_result();

    if (!$resultado) {
        throw new Exception("Error en la consulta: " . $conexion->error);
    }

    $empleados = [];
    while ($row = $resultado->fetch_assoc()) {
        $empleado = [
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
            'nombre_status' => $row['nombre_status']
        ];

        // Agregar información de logos si se solicita
        if ($incluir_logos) {
            $empleado['logo_area'] = $row['logo_area'];
            $empleado['logo_empresa'] = $row['logo_empresa'];
            
            // URLs completas de los logos - solo si existen
            $empleado['logo_area_url'] = !empty($row['logo_area']) ? 
                'logos_area/' . $row['logo_area'] : null; // Sin fallback
            
            $empleado['logo_empresa_url'] = !empty($row['logo_empresa']) ? 
                'logos_empresa/' . $row['logo_empresa'] : null; // Sin fallback
        }

        $empleados[] = $empleado;
    }

    // Limpiar buffer y enviar respuesta
    ob_end_clean();
    echo json_encode([
        'success' => true,
        'data' => $empleados,
        'total' => count($empleados),
        'incluye_logos' => $incluir_logos
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    // Limpiar buffer y enviar error
    ob_end_clean();
    echo json_encode([
        'success' => false,
        'message' => 'Error al obtener empleados: ' . $e->getMessage(),
        'error_code' => $e->getCode()
    ]);
}

// Cerrar conexión
if (isset($conexion)) {
    $conexion->close();
}
?>