<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . "/../../conexion/conexion.php";

header('Content-Type: application/json; charset=utf-8');

if (!isset($_SESSION["logged_in"])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'No autenticado']);
    exit;
}

// Obtener parámetros
$anioInicio = isset($_GET['anio_inicio']) ? (int)$_GET['anio_inicio'] : 0;
$semanaInicio = isset($_GET['semana_inicio']) ? (int)$_GET['semana_inicio'] : 0;
$anioFin = isset($_GET['anio_fin']) ? (int)$_GET['anio_fin'] : 0;
$semanaFin = isset($_GET['semana_fin']) ? (int)$_GET['semana_fin'] : 0;

// Validar que al menos tenga año inicio
if ($anioInicio <= 0) {
    echo json_encode(['success' => false, 'message' => 'Debe seleccionar al menos el año de inicio']);
    exit;
}

// Si no hay año fin, usar año inicio
if ($anioFin <= 0) {
    $anioFin = $anioInicio;
}

// Si no hay semana inicio, usar 1
if ($semanaInicio <= 0) {
    $semanaInicio = 1;
}

// Si no hay semana fin
if ($semanaFin <= 0) {
    $semanaInicioOriginal = isset($_GET['semana_inicio']) ? (int)$_GET['semana_inicio'] : 0;
    
    if ($semanaInicioOriginal > 0 && $anioFin == $anioInicio) {
        // Solo seleccionó una semana específica
        $semanaFin = $semanaInicio;
    } else {
        $semanaFin = 52;
    }
}

// Función para formatear moneda
function formatoMoneda($valor): float
{
    return (float)number_format((float)$valor, 2, '.', '');
}

// ============================
// 1. PRESTADO (todos los préstamos en el rango)
// ============================
$sqlPrestado = "SELECT 
        p.id_prestamo,
        p.id_empleado,
        CONCAT(e.nombre, ' ', e.ap_paterno, ' ', e.ap_materno) AS empleado,
        p.folio,
        p.monto,
        p.semana,
        p.anio,
        p.fecha_registro,
        p.estado
    FROM prestamos p
    INNER JOIN info_empleados e ON e.id_empleado = p.id_empleado
    WHERE (p.anio > ? OR (p.anio = ? AND p.semana >= ?))
      AND (p.anio < ? OR (p.anio = ? AND p.semana <= ?))
    ORDER BY p.anio DESC, p.semana DESC, p.fecha_registro DESC
";

$stmtPrestado = $conexion->prepare($sqlPrestado);
$stmtPrestado->bind_param('iiiiii', $anioInicio, $anioInicio, $semanaInicio, $anioFin, $anioFin, $semanaFin);
$stmtPrestado->execute();
$resPrestado = $stmtPrestado->get_result();

$prestamos = [];
$totalPrestado = 0.0;
$idsPrestamos = [];

while ($row = $resPrestado->fetch_assoc()) {
    $prestamos[] = [
        'id_prestamo' => (int)$row['id_prestamo'],
        'id_empleado' => (int)$row['id_empleado'],
        'empleado' => $row['empleado'],
        'folio' => $row['folio'],
        'monto' => formatoMoneda($row['monto']),
        'semana' => (int)$row['semana'],
        'anio' => (int)$row['anio'],
        'fecha_registro' => $row['fecha_registro'],
        'estado' => $row['estado']
    ];
    $totalPrestado += (float)$row['monto'];
    $idsPrestamos[] = (int)$row['id_prestamo'];
}
$stmtPrestado->close();

// ============================
// 2. RECUPERADO (abonos de los préstamos obtenidos en el rango)
// ============================
$abonos = [];
$totalRecuperado = 0.0;

if (count($idsPrestamos) > 0) {
    $placeholders = implode(',', array_fill(0, count($idsPrestamos), '?'));
    $types = str_repeat('i', count($idsPrestamos));
    
    $sqlRecuperado = "SELECT 
            pa.id_abono,
            pa.id_prestamo,
            pa.monto_pago,
            pa.num_sem_pago,
            pa.anio_pago,
            pa.fecha_pago,
            pa.es_nomina,
            p.folio,
            CONCAT(e.nombre, ' ', e.ap_paterno, ' ', e.ap_materno) AS empleado
        FROM prestamos_abonos pa
        INNER JOIN prestamos p ON p.id_prestamo = pa.id_prestamo
        INNER JOIN info_empleados e ON e.id_empleado = p.id_empleado
        WHERE pa.id_prestamo IN ($placeholders)
        ORDER BY pa.anio_pago DESC, pa.num_sem_pago DESC, pa.fecha_pago DESC
    ";
    
    $stmtRecuperado = $conexion->prepare($sqlRecuperado);
    $stmtRecuperado->bind_param($types, ...$idsPrestamos);
    $stmtRecuperado->execute();
    $resRecuperado = $stmtRecuperado->get_result();
    
    while ($row = $resRecuperado->fetch_assoc()) {
        $abonos[] = [
            'id_abono' => (int)$row['id_abono'],
            'id_prestamo' => (int)$row['id_prestamo'],
            'folio' => $row['folio'],
            'empleado' => $row['empleado'],
            'monto_pago' => formatoMoneda($row['monto_pago']),
            'num_sem_pago' => (int)$row['num_sem_pago'],
            'anio_pago' => (int)$row['anio_pago'],
            'fecha_pago' => $row['fecha_pago'],
            'es_nomina' => (int)$row['es_nomina']
        ];
        $totalRecuperado += (float)$row['monto_pago'];
    }
    $stmtRecuperado->close();
}

// ============================
// 3. POR COBRAR (préstamos activos/pausados - sus abonos)
// ============================
$porCobrar = [];
$totalPorCobrar = 0.0;

foreach ($prestamos as $p) {
    if ($p['estado'] === 'activo' || $p['estado'] === 'pausado') {
        $abonadoPrestamo = 0.0;
        foreach ($abonos as $a) {
            if ($a['id_prestamo'] === $p['id_prestamo']) {
                $abonadoPrestamo += $a['monto_pago'];
            }
        }
        
        $pendiente = $p['monto'] - $abonadoPrestamo;
        
        if ($pendiente > 0) {
            $porCobrar[] = [
                'id_prestamo' => $p['id_prestamo'],
                'id_empleado' => $p['id_empleado'],
                'empleado' => $p['empleado'],
                'folio' => $p['folio'],
                'monto_prestamo' => $p['monto'],
                'abonado' => formatoMoneda($abonadoPrestamo),
                'pendiente' => formatoMoneda($pendiente),
                'semana' => $p['semana'],
                'anio' => $p['anio'],
                'estado' => $p['estado']
            ];
            $totalPorCobrar += $pendiente;
        }
    }
}

// Descripción del filtro
$descripcionFiltro = '';
if ($semanaInicio == $semanaFin && $anioInicio == $anioFin) {
    $descripcionFiltro = "Semana $semanaInicio del $anioInicio";
} elseif ($anioInicio == $anioFin) {
    $descripcionFiltro = "Semanas $semanaInicio a $semanaFin del $anioInicio";
} else {
    $descripcionFiltro = "Semana $semanaInicio/$anioInicio a Semana $semanaFin/$anioFin";
}

echo json_encode([
    'success' => true,
    'filtro' => [
        'anio_inicio' => $anioInicio,
        'semana_inicio' => $semanaInicio,
        'anio_fin' => $anioFin,
        'semana_fin' => $semanaFin,
        'descripcion' => $descripcionFiltro
    ],
    'prestado' => [
        'total' => formatoMoneda($totalPrestado),
        'cantidad' => count($prestamos),
        'detalle' => $prestamos
    ],
    'recuperado' => [
        'total' => formatoMoneda($totalRecuperado),
        'cantidad' => count($abonos),
        'detalle' => $abonos
    ],
    'por_cobrar' => [
        'total' => formatoMoneda($totalPorCobrar),
        'cantidad' => count($porCobrar),
        'detalle' => $porCobrar
    ]
], JSON_UNESCAPED_UNICODE);

