<?php
require_once __DIR__ . '/../../config/config.php';

/**
 * =============================
 * Estandarizar respuestas JSON
 * =============================
 */
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

/**
 * ===============================================
 * Verificar que el usuario esté logueado
 * ===============================================
 */
if (!isset($_SESSION["logged_in"])) {
    respuestas(401, "No autenticado", "Debes primero iniciar sesión", "error");
}

// Importar la conexion
require_once __DIR__ . "/../../conexion/conexion.php";

// Verificar que sea POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respuestas(405, "Método no permitido", "Solo se permite POST", "error");
}

// Obtener datos del formulario
$id_prestamo    = isset($_POST['id_prestamo']) ? intval($_POST['id_prestamo']) : 0;
$id_plan        = isset($_POST['id_plan'])     ? intval($_POST['id_plan'])     : 0;
$id_detalle     = isset($_POST['id_detalle'])  ? intval($_POST['id_detalle'])  : 0;
$id_empleado    = isset($_POST['id_empleado']) ? intval($_POST['id_empleado']) : 0;
$folio          = isset($_POST['folio'])       ? trim($_POST['folio'])         : '';
$monto          = isset($_POST['monto'])       ? floatval($_POST['monto'])     : 0;
$fecha          = isset($_POST['fecha'])       ? trim($_POST['fecha']) : '';

// Datos del plan de pago
$semana_inicio  = isset($_POST['semana_inicio']) ? intval($_POST['semana_inicio']) : 0;
$anio_inicio    = isset($_POST['anio_inicio']) ? intval($_POST['anio_inicio']) : date('Y');
$semana_fin     = isset($_POST['semana_fin']) ? intval($_POST['semana_fin']) : 0;
$anio_fin       = isset($_POST['anio_fin']) ? intval($_POST['anio_fin']) : date('Y');

// Detalle del plan (array de objetos)
$detalle_plan   = isset($_POST['detalle_plan']) ? $_POST['detalle_plan'] : [];

// Validaciones básicas
if ($id_prestamo <= 0 || $id_plan <= 0 || $id_detalle <= 0) {
    respuestas(400, "Error", "IDs de préstamo, plan o detalle no válidos", "error");
}

if ($id_empleado <= 0) {
    respuestas(400, "Error", "Debes seleccionar un empleado", "error");
}

if (empty($folio)) {
    respuestas(400, "Error", "El folio es requerido", "info");
}

if ($monto <= 0) {
    respuestas(400, "Error", "El monto debe ser mayor a 0", "warning");
}

if (empty($fecha)) {
    respuestas(400, "Error", "La fecha es requerida", "info");
}

if (empty($detalle_plan)) {
    respuestas(400, "Error", "El plan de pago no puede estar vacío", "info");
}

/**
 * =====================================================
 * Verificar que el préstamo no tenga abonos registrados
 * =====================================================
 */
$stmt = $conexion->prepare("SELECT COUNT(*) as total FROM prestamos_abonos WHERE id_prestamo = ?");
$stmt->bind_param('i', $id_prestamo);
$stmt->execute();
$result = $stmt->get_result();
$row = $result->fetch_assoc();
$stmt->close();

if ($row['total'] > 0) {
    respuestas(400, "Error", "Este préstamo ya tiene abonos y no puede ser editado", "error");
}

/**
 * =====================================================
 * Obtener datos actuales del plan para comparar después
 * =====================================================
 */
$stmtPlanActual = $conexion->prepare("SELECT sem_inicio, anio_inicio, sem_fin, anio_fin FROM planes_pagos WHERE id_plan = ?");
$stmtPlanActual->bind_param('i', $id_plan);
$stmtPlanActual->execute();
$resPlanActual = $stmtPlanActual->get_result();
$planActualData = $resPlanActual->fetch_assoc();
$stmtPlanActual->close();

$semFinAnterior = (int)($planActualData['sem_fin'] ?? 0);
$anioFinAnterior = (int)($planActualData['anio_fin'] ?? 0);

/**
 * =====================================================
 * Detectar solapamiento con otros préstamos (solo aviso, no bloquea)
 * =====================================================
 */
$semanaToValor = function($sem, $anio) {
    return (int)$anio * 100 + (int)$sem;
};

$valorNuevoInicio = $semanaToValor($semana_inicio, $anio_inicio);
$valorNuevoFin = $semanaToValor($semana_fin, $anio_fin);

// Buscar todos los planes del empleado excepto el actual para detectar solapamiento
$sqlOtrosPlanes = "
    SELECT 
        pp.id_plan,
        pp.sem_inicio,
        pp.anio_inicio,
        pp.sem_fin,
        pp.anio_fin,
        p.folio
    FROM planes_pagos pp
    INNER JOIN prestamos p ON p.id_prestamo = pp.id_prestamo
    WHERE p.id_empleado = ?
      AND pp.id_plan != ?
      AND p.estado = 'activo'
    ORDER BY pp.anio_inicio ASC, pp.sem_inicio ASC
";

$planesSolapados = [];
$stmtOtros = $conexion->prepare($sqlOtrosPlanes);
$stmtOtros->bind_param('ii', $id_empleado, $id_plan);
$stmtOtros->execute();
$resOtros = $stmtOtros->get_result();

while ($otroPlan = $resOtros->fetch_assoc()) {
    $otroInicio = $semanaToValor($otroPlan['sem_inicio'], $otroPlan['anio_inicio']);
    $otroFin = $semanaToValor($otroPlan['sem_fin'], $otroPlan['anio_fin']);
    
    // Hay solapamiento si: valorNuevoFin >= otroInicio AND valorNuevoInicio <= otroFin
    if ($valorNuevoFin >= $otroInicio && $valorNuevoInicio <= $otroFin) {
        $planesSolapados[] = [
            'folio' => $otroPlan['folio'],
            'rango' => "Sem {$otroPlan['sem_inicio']}/{$otroPlan['anio_inicio']} - Sem {$otroPlan['sem_fin']}/{$otroPlan['anio_fin']}"
        ];
    }
}
$stmtOtros->close();

// Obtener semana y año de la fecha del préstamo
$fechaObj = new DateTime($fecha);
$semana_prestamo = intval($fechaObj->format('W'));
$anio_prestamo = intval($fechaObj->format('Y'));

// Iniciar transacción
$conexion->begin_transaction();

try {
    /**
     * ===================================
     * 1. Actualizar la tabla de préstamos
     * ===================================
     */
    $stmt = $conexion->prepare("UPDATE prestamos 
        SET id_empleado = ?, 
            folio = ?, 
            monto = ?, 
            semana = ?,
            anio = ?,
            fecha_registro = ?
        WHERE id_prestamo = ?
    ");
    $stmt->bind_param(
        'isdiisd',
        $id_empleado,
        $folio,
        $monto,
        $semana_prestamo,
        $anio_prestamo,
        $fecha,
        $id_prestamo
    );

    if (!$stmt->execute()) {
        throw new Exception("Error al actualizar el préstamo: " . $stmt->error);
    }
    $stmt->close();

    /**
     * ========================================
     * 2. Actualizar la tabla de planes de pago
     * ========================================
     */
    $stmt = $conexion->prepare("UPDATE planes_pagos 
        SET sem_inicio = ?, 
            anio_inicio = ?, 
            sem_fin = ?, 
            anio_fin = ?
        WHERE id_plan = ?
    ");
    $stmt->bind_param(
        'iiiii',
        $semana_inicio,
        $anio_inicio,
        $semana_fin,
        $anio_fin,
        $id_plan
    );

    if (!$stmt->execute()) {
        throw new Exception("Error al actualizar el plan de pago: " . $stmt->error);
    }
    $stmt->close();

    /**
     * =========================================
     * 3. Actualizar el detalle del plan de pago
     * =========================================
     */
    $detalle_json = json_encode($detalle_plan, JSON_UNESCAPED_UNICODE);

    $stmt = $conexion->prepare("UPDATE detalle_planes 
        SET detalle = ?
        WHERE id_detalle = ?
    ");
    $stmt->bind_param('si', $detalle_json, $id_detalle);

    if (!$stmt->execute()) {
        throw new Exception("Error al actualizar el detalle del plan: " . $stmt->error);
    }
    $stmt->close();

    // Confirmar transacción
    $conexion->commit();

    // Preparar respuesta con posible aviso de solapamiento
    $mensaje = "Préstamo actualizado correctamente";
    $dataRespuesta = ['id_prestamo' => $id_prestamo];
    
    if (count($planesSolapados) > 0) {
        $dataRespuesta['aviso_solapamiento'] = true;
        $dataRespuesta['planes_solapados'] = $planesSolapados;
        $mensaje .= ". AVISO: Este plan se solapa con otros planes del empleado.";
    }
    
    respuestas(200, "Éxito", $mensaje, "success", $dataRespuesta);

} catch (Exception $e) {
    // Revertir cambios en caso de error
    $conexion->rollback();
    respuestas(500, "Error", $e->getMessage(), "error");
}

$conexion->close();