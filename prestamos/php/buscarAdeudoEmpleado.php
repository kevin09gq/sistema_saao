<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . "/../../conexion/conexion.php";

// Respuesta
function respuestas(int $code, string $titulo, string $mensaje, string $icono, array $data)
{
    http_response_code($code);
    echo json_encode([
        "titulo"  => $titulo,
        "mensaje" => $mensaje,
        "icono"   => $icono,
        "data"    => $data
    ], JSON_UNESCAPED_UNICODE);
}

if (isset($_SESSION["logged_in"])) {

    $id = $_POST["id_empleado"] ?? '';

    $sql = "SELECT 
                e.id_empleado,
                CONCAT(e.nombre, ' ', e.ap_paterno, ' ', e.ap_materno) AS empleado,
                SUM(p.monto) - IFNULL(SUM(pa.monto_pago), 0) AS deuda_total
            FROM info_empleados e
            JOIN prestamos p 
                ON p.id_empleado = e.id_empleado
            LEFT JOIN prestamos_abonos pa 
                ON pa.id_prestamo = p.id_prestamo
            WHERE e.id_empleado = ?
            AND p.estado IN ('activo', 'pausado')
            GROUP BY e.id_empleado";

    $pr = $conexion->prepare($sql);
    $pr->bind_param("i", $id);
    $pr->execute();
    $result = $pr->get_result();
    $data = $result->fetch_assoc() ?? [];

    if ($data) {
        // Buscar la semana fin del plan más reciente de préstamos activos
        $sqlPlan = "
            SELECT pp.sem_fin, pp.anio_fin
            FROM planes_pagos pp
            INNER JOIN prestamos p ON p.id_prestamo = pp.id_prestamo
            WHERE p.id_empleado = ?
              AND p.estado IN ('activo', 'pausado')
            ORDER BY pp.anio_fin DESC, pp.sem_fin DESC
            LIMIT 1
        ";
        $stmtPlan = $conexion->prepare($sqlPlan);
        $stmtPlan->bind_param('i', $id);
        $stmtPlan->execute();
        $resPlan = $stmtPlan->get_result();
        $planData = $resPlan->fetch_assoc();
        $stmtPlan->close();

        if ($planData) {
            $data['sem_fin_plan'] = (int)$planData['sem_fin'];
            $data['anio_fin_plan'] = (int)$planData['anio_fin'];
        } else {
            $data['sem_fin_plan'] = null;
            $data['anio_fin_plan'] = null;
        }

        respuestas(200, "datos obtenidos", "Obtenido con éxito " . $id, "success", $data);
    } else {
        respuestas(404, "Sin adeudo", "El empleado no tiene adeudos activos", "info", []);
    }
    exit;

    
} else {
    respuestas(401, "No autenticado", "Debes primero iniciar sesión", "error", []);
    exit;
}
