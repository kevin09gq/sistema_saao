<?php
require_once __DIR__ . "/../../config/config.php";
require_once __DIR__ . "/../../conexion/conexion.php";

header('Content-Type: application/json');

// Solo aceptar GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    echo json_encode([
        'success' => false,
        'message' => 'Método no permitido'
    ]);
    exit;
}

// Parámetros de paginación
$pagina = isset($_GET['pagina']) ? max(1, intval($_GET['pagina'])) : 1;
$limite = isset($_GET['limite']) ? max(1, intval($_GET['limite'])) : 5;
$offset = ($pagina - 1) * $limite;

// Parámetro de orden
$ordenValidos = ['fecha_inicio', 'fecha_registro', 'num_sem'];
$ordenColumna = isset($_GET['orden']) && in_array($_GET['orden'], $ordenValidos) ? $_GET['orden'] : 'fecha_inicio';
$ordenDir = isset($_GET['dir']) && strtoupper($_GET['dir']) === 'ASC' ? 'ASC' : 'DESC';

// Obtener total de registros
$sqlTotal = "SELECT COUNT(*) as total FROM historial_biometrico";
$resultTotal = $conexion->query($sqlTotal);
$total = $resultTotal->fetch_assoc()['total'];

// Obtener historiales con paginación
$sql = "SELECT id, num_sem, fecha_inicio, fecha_fin, observacion, fecha_registro, id_empresa 
        FROM historial_biometrico 
        ORDER BY $ordenColumna $ordenDir
        LIMIT ? OFFSET ?";

$stmt = $conexion->prepare($sql);
$stmt->bind_param("ii", $limite, $offset);
$stmt->execute();
$result = $stmt->get_result();

if (!$result) {
    echo json_encode([
        'success' => false,
        'message' => 'Error en la consulta: ' . $conexion->error
    ]);
    exit;
}

$historiales = [];
while ($row = $result->fetch_assoc()) {
    $historiales[] = [
        'id' => $row['id'],
        'num_sem' => $row['num_sem'],
        'fecha_inicio' => $row['fecha_inicio'],
        'fecha_fin' => $row['fecha_fin'],
        'observacion' => $row['observacion'],
        'fecha_registro' => $row['fecha_registro'],
        'id_empresa' => intval($row['id_empresa'])
    ];
}

// Calcular total de páginas
$totalPaginas = ceil($total / $limite);

echo json_encode([
    'success' => true,
    'historiales' => $historiales,
    'paginacion' => [
        'pagina_actual' => $pagina,
        'total_paginas' => $totalPaginas,
        'total_registros' => intval($total),
        'limite' => $limite
    ],
    'orden' => [
        'columna' => $ordenColumna,
        'direccion' => $ordenDir
    ]
]);

$stmt->close();
$conexion->close();
