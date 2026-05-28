<?php
header('Content-Type: application/json; charset=utf-8');

include("../../conexion/conexion.php");

function bindDynamicParams($stmt, $types, $params)
{
    if ($types === '' || empty($params)) {
        return;
    }

    $bindParams = array($types);
    foreach ($params as $key => $value) {
        $bindParams[] = &$params[$key];
    }

    call_user_func_array(array($stmt, 'bind_param'), $bindParams);
}

try {
    if (!$conexion) {
        throw new Exception('No se pudo establecer conexion con la base de datos.');
    }

    $pagina = isset($_GET['pagina']) ? max(1, (int)$_GET['pagina']) : 1;
    $porPagina = 8;
    $offset = ($pagina - 1) * $porPagina;

    $idArea = isset($_GET['id_area']) ? trim((string)$_GET['id_area']) : '';
    $biometrico = isset($_GET['biometrico']) ? trim((string)$_GET['biometrico']) : '';

    $where = array(
        "e.biometrico IS NOT NULL",
        "CAST(e.biometrico AS CHAR) <> ''"
    );
    $types = '';
    $params = array();

    if ($idArea !== '') {
        $where[] = "e.id_area = ?";
        $types .= 'i';
        $params[] = (int)$idArea;
    }

    if ($biometrico !== '') {
        $where[] = "CAST(e.biometrico AS CHAR) LIKE ?";
        $types .= 's';
        $params[] = '%' . $biometrico . '%';
    }

    $whereSql = 'WHERE ' . implode(' AND ', $where);

    $sqlTotal = "SELECT COUNT(*) AS total
        FROM info_empleados e
        $whereSql";

    $stmtTotal = $conexion->prepare($sqlTotal);
    if (!$stmtTotal) {
        throw new Exception('Error al preparar la consulta total: ' . $conexion->error);
    }

    bindDynamicParams($stmtTotal, $types, $params);
    $stmtTotal->execute();
    $resultadoTotal = $stmtTotal->get_result();
    $total = (int)($resultadoTotal->fetch_assoc()['total'] ?? 0);
    $stmtTotal->close();

    $sql = "SELECT
            e.id_empleado,
            e.biometrico,
            e.clave_empleado,
            e.nombre,
            e.ap_paterno,
            e.ap_materno,
            a.id_area,
            a.nombre_area,
            d.nombre_departamento
        FROM info_empleados e
        LEFT JOIN areas a ON e.id_area = a.id_area
        LEFT JOIN departamentos d ON e.id_departamento = d.id_departamento
        $whereSql
        ORDER BY e.biometrico ASC, e.nombre ASC
        LIMIT ? OFFSET ?";

    $stmt = $conexion->prepare($sql);
    if (!$stmt) {
        throw new Exception('Error al preparar la consulta principal: ' . $conexion->error);
    }

    $typesConsulta = $types . 'ii';
    $paramsConsulta = $params;
    $paramsConsulta[] = $porPagina;
    $paramsConsulta[] = $offset;

    bindDynamicParams($stmt, $typesConsulta, $paramsConsulta);
    $stmt->execute();
    $resultado = $stmt->get_result();

    $empleados = array();
    while ($row = $resultado->fetch_assoc()) {
        $empleados[] = array(
            'id_empleado' => (int)$row['id_empleado'],
            'biometrico' => $row['biometrico'],
            'clave_empleado' => $row['clave_empleado'],
            'nombre_completo' => trim($row['nombre'] . ' ' . $row['ap_paterno'] . ' ' . $row['ap_materno']),
            'id_area' => $row['id_area'] !== null ? (int)$row['id_area'] : null,
            'nombre_area' => $row['nombre_area'] ?? 'Sin area',
            'nombre_departamento' => $row['nombre_departamento'] ?? 'Sin departamento'
        );
    }
    $stmt->close();

    echo json_encode(array(
        'success' => true,
        'data' => $empleados,
        'pagina_actual' => $pagina,
        'por_pagina' => $porPagina,
        'total_registros' => $total,
        'total_paginas' => $total > 0 ? (int)ceil($total / $porPagina) : 0
    ), JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(array(
        'success' => false,
        'message' => $e->getMessage()
    ), JSON_UNESCAPED_UNICODE);
}
