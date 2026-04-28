<?php
require_once '../../conexion/conexion.php';

header('Content-Type: application/json');

$query = isset($_GET['query']) ? trim($_GET['query']) : '';
$tipo = isset($_GET['tipo']) ? $_GET['tipo'] : 'nombre';
$nominaSel = isset($_GET['nomina']) ? trim($_GET['nomina']) : '';

if (empty($query)) {
    echo json_encode([]);
    exit;
}

try {
    // Si se pasa una nómina desde el select, agregar la subconsulta para filtrar departamentos
    $filtroDepartamento = "";
    $paramNomina = "";
    
    if (!empty($nominaSel)) {
        // Encontrar una palabra clave para buscar en nombre_nominas
        $palabraClave = "";
        switch($nominaSel) {
            case 'nomina_10lbs': $palabraClave = "%10%"; break;
            case 'nomina_40lbs': $palabraClave = "%40%"; break;
            case 'nomina_huasteca': $palabraClave = "%Huasteca%"; break;
            case 'nomina_palmilla': $palabraClave = "%Palmilla%"; break;
            case 'nomina_pilar': $palabraClave = "%Pilar%"; break;
            case 'nomina_relicario': $palabraClave = "%Relicario%"; break;
            case 'nomina_confianza': $palabraClave = "%Confianza%"; break;
        }
        
        if ($palabraClave !== "") {
            $filtroDepartamento = "AND e.id_departamento IN (
                                        SELECT nd.id_departamento 
                                        FROM nomina_departamento nd 
                                        INNER JOIN nombre_nominas nn ON nd.id_nomina = nn.id_nomina 
                                        WHERE nn.nombre_nomina LIKE ?
                                   )";
            $paramNomina = $palabraClave;
        }
    }

    if ($tipo === 'clave') {
        $sql = "SELECT
                    e.id_empleado,
                    e.clave_empleado,
                    CONCAT(e.ap_paterno, ' ', e.ap_materno, ' ', e.nombre) as nombre_completo,
                    e.imss,
                    e.rfc_empleado,
                    e.fecha_ingreso,
                    e.salario_semanal,
                    e.salario_diario,
                    e.id_departamento,
                    d.nombre_departamento as departamento,
                    p.nombre_puesto as puesto
                FROM info_empleados e
                LEFT JOIN departamentos d ON e.id_departamento = d.id_departamento
                LEFT JOIN puestos_especiales p ON e.id_puestoEspecial = p.id_puestoEspecial
                WHERE e.clave_empleado LIKE ?
                AND e.id_status = 1
                $filtroDepartamento
                ORDER BY e.clave_empleado
                LIMIT 20";
        $stmt = $conexion->prepare($sql);
        $queryLike = $query . '%';
        if ($paramNomina !== "") {
            $stmt->bind_param("ss", $queryLike, $paramNomina);
        } else {
            $stmt->bind_param("s", $queryLike);
        }
    } else {
        $queryLike = "%{$query}%";
        $sql = "SELECT
                    e.id_empleado,
                    e.clave_empleado,
                    CONCAT(e.ap_paterno, ' ', e.ap_materno, ' ', e.nombre) as nombre_completo,
                    e.imss,
                    e.rfc_empleado,
                    e.fecha_ingreso,
                    e.salario_semanal,
                    e.salario_diario,
                    e.id_departamento,
                    d.nombre_departamento as departamento,
                    p.nombre_puesto as puesto
                FROM info_empleados e
                LEFT JOIN departamentos d ON e.id_departamento = d.id_departamento
                LEFT JOIN puestos_especiales p ON e.id_puestoEspecial = p.id_puestoEspecial
                WHERE e.id_status = 1
                AND (
                    e.nombre LIKE ?
                    OR e.ap_paterno LIKE ?
                    OR e.ap_materno LIKE ?
                    OR CONCAT(e.ap_paterno, ' ', e.ap_materno, ' ', e.nombre) LIKE ?
                )
                $filtroDepartamento
                ORDER BY e.ap_paterno, e.ap_materno, e.nombre
                LIMIT 20";
        $stmt = $conexion->prepare($sql);
        if ($paramNomina !== "") {
            $stmt->bind_param("sssss", $queryLike, $queryLike, $queryLike, $queryLike, $paramNomina);
        } else {
            $stmt->bind_param("ssss", $queryLike, $queryLike, $queryLike, $queryLike);
        }
    }

    $stmt->execute();
    $result = $stmt->get_result();

    $empleados = [];
    while ($row = $result->fetch_assoc()) {
        $empleados[] = [
            'id_empleado' => $row['id_empleado'],
            'clave' => $row['clave_empleado'],
            'nombre' => $row['nombre_completo'],
            'imss' => $row['imss'],
            'rfc' => $row['rfc_empleado'],
            'fecha_ingreso' => $row['fecha_ingreso'],
            'salario_semanal' => $row['salario_semanal'],
            'salario_diario' => $row['salario_diario'],
            'id_departamento' => $row['id_departamento'],
            'departamento' => $row['departamento'],
            'puesto' => $row['puesto']
        ];
    }

    echo json_encode($empleados, JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
