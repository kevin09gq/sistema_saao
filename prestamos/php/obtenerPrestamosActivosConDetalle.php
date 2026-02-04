<?php
/**
 * Obtiene los préstamos activos de un empleado con sus detalles de plan
 * Ordenados del más antiguo al más reciente
 */
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . "/../../conexion/conexion.php";

function respuestas(int $code, string $titulo, string $mensaje, string $icono, array $data = [])
{
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode([
        "titulo"  => $titulo,
        "mensaje" => $mensaje,
        "icono"   => $icono,
        "data"    => $data
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

if (!isset($_SESSION["logged_in"])) {
    respuestas(401, "No autenticado", "Debes primero iniciar sesión", "error");
}

$idEmpleado = isset($_GET['id_empleado']) ? (int)$_GET['id_empleado'] : 0;

if ($idEmpleado <= 0) {
    respuestas(400, 'Datos incompletos', 'Falta id_empleado', 'warning');
}

// Obtener préstamos activos del empleado ordenados del más antiguo al más reciente
$sqlPrestamos = "
    SELECT 
        p.id_prestamo,
        p.folio,
        p.monto,
        p.fecha_registro,
        p.estado,
        IFNULL(SUM(pa.monto_pago), 0) AS total_abonado,
        (p.monto - IFNULL(SUM(pa.monto_pago), 0)) AS deuda_restante
    FROM prestamos p
    LEFT JOIN prestamos_abonos pa ON pa.id_prestamo = p.id_prestamo
    WHERE p.id_empleado = ?
      AND p.estado = 'activo'
    GROUP BY p.id_prestamo
    ORDER BY p.fecha_registro ASC
";

$stmtPrestamos = $conexion->prepare($sqlPrestamos);
if (!$stmtPrestamos) {
    respuestas(500, 'Error', 'No se pudo preparar la consulta de préstamos', 'error');
}

$stmtPrestamos->bind_param('i', $idEmpleado);
if (!$stmtPrestamos->execute()) {
    respuestas(500, 'Error', 'No se pudo ejecutar la consulta de préstamos', 'error');
}

$resPrestamos = $stmtPrestamos->get_result();
$prestamos = [];

while ($prestamo = $resPrestamos->fetch_assoc()) {
    $idPrestamo = (int)$prestamo['id_prestamo'];
    
    // Obtener el plan más reciente del préstamo
    $sqlPlan = "
        SELECT pp.id_plan, pp.sem_inicio, pp.anio_inicio, pp.sem_fin, pp.anio_fin
        FROM planes_pagos pp
        WHERE pp.id_prestamo = ?
        ORDER BY pp.fecha_registro DESC
        LIMIT 1
    ";
    
    $stmtPlan = $conexion->prepare($sqlPlan);
    $stmtPlan->bind_param('i', $idPrestamo);
    $stmtPlan->execute();
    $resPlan = $stmtPlan->get_result();
    $plan = $resPlan->fetch_assoc();
    $stmtPlan->close();
    
    $detalleArray = [];
    $proximaSemana = null;
    
    if ($plan) {
        $idPlan = (int)$plan['id_plan'];
        
        // Obtener el detalle más reciente del plan
        $sqlDetalle = "
            SELECT id_detalle, detalle
            FROM detalle_planes
            WHERE id_plan = ?
            ORDER BY id_detalle DESC
            LIMIT 1
        ";
        
        $stmtDetalle = $conexion->prepare($sqlDetalle);
        $stmtDetalle->bind_param('i', $idPlan);
        $stmtDetalle->execute();
        $resDetalle = $stmtDetalle->get_result();
        $detalleRow = $resDetalle->fetch_assoc();
        $stmtDetalle->close();
        
        if ($detalleRow && !empty($detalleRow['detalle'])) {
            $detalleArray = json_decode($detalleRow['detalle'], true);
            if (!is_array($detalleArray)) {
                $detalleArray = [];
            }
            
            // Encontrar la próxima semana pendiente (para validar orden de pagos)
            foreach ($detalleArray as $idx => $det) {
                $estado = isset($det['estado']) ? strtolower(trim($det['estado'])) : 'pendiente';
                if ($estado === 'pendiente') {
                    $proximaSemana = [
                        'index' => $idx,
                        'num_semana' => (int)($det['num_semana'] ?? 0),
                        'anio' => (int)($det['anio'] ?? 0),
                        'monto_semanal' => $det['monto_semanal'] ?? '0'
                    ];
                    break;
                }
            }
        }
        
        $prestamo['plan'] = [
            'id_plan' => $idPlan,
            'sem_inicio' => $plan['sem_inicio'],
            'anio_inicio' => $plan['anio_inicio'],
            'sem_fin' => $plan['sem_fin'],
            'anio_fin' => $plan['anio_fin']
        ];
    } else {
        $prestamo['plan'] = null;
    }
    
    $prestamo['detalle'] = $detalleArray;
    $prestamo['proxima_semana'] = $proximaSemana;
    $prestamos[] = $prestamo;
}

$stmtPrestamos->close();

if (count($prestamos) === 0) {
    respuestas(404, 'Sin préstamos', 'El empleado no tiene préstamos activos', 'info');
}

respuestas(200, 'OK', 'Préstamos obtenidos', 'success', [
    'prestamos' => $prestamos,
    'total' => count($prestamos)
]);
