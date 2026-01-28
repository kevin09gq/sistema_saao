<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../conexion/conexion.php';

header('Content-Type: application/json; charset=utf-8');

if (!isset($_SESSION["logged_in"])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'No autenticado']);
    exit;
}

$anio = isset($_GET['anio']) ? (int)$_GET['anio'] : 0;
$semana = isset($_GET['semana']) ? (int)$_GET['semana'] : 0;

if ($anio <= 0 || $semana <= 0 || $semana > 53) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Parámetros inválidos']);
    exit;
}

function formatoMoneda($valor): float
{
    return (float)number_format((float)$valor, 2, '.', '');
}

// Traer filas base: empleados que abonaron en la semana seleccionada
// La deuda se calcula sobre los préstamos que tuvieron abonos ESA semana (sin filtrar por estado)
$sql = "SELECT
        e.id_empleado,
        CONCAT(e.nombre, ' ', e.ap_paterno, ' ', e.ap_materno) AS colaborador,
        COALESCE(d.nombre_departamento, 'SIN DEPTO') AS departamento,
        COALESCE(e.status_nss, 0) AS status_nss,
        -- Abono de esta semana
        SUM(pa.monto_pago) AS pagado_semana,
        -- Total de los préstamos que se abonaron esta semana
        (
            SELECT COALESCE(SUM(p2.monto), 0)
            FROM prestamos p2
            WHERE p2.id_prestamo IN (
                SELECT DISTINCT pa_inner.id_prestamo
                FROM prestamos_abonos pa_inner
                INNER JOIN prestamos p_inner ON p_inner.id_prestamo = pa_inner.id_prestamo
                WHERE p_inner.id_empleado = e.id_empleado
                  AND pa_inner.anio_pago = ?
                  AND pa_inner.num_sem_pago = ?
            )
        ) AS total_prestamos,
        -- Abonos anteriores de esos mismos préstamos
        (
            SELECT COALESCE(SUM(pa2.monto_pago), 0)
            FROM prestamos_abonos pa2
            WHERE pa2.id_prestamo IN (
                SELECT DISTINCT pa_inner.id_prestamo
                FROM prestamos_abonos pa_inner
                INNER JOIN prestamos p_inner ON p_inner.id_prestamo = pa_inner.id_prestamo
                WHERE p_inner.id_empleado = e.id_empleado
                  AND pa_inner.anio_pago = ?
                  AND pa_inner.num_sem_pago = ?
            )
            AND (pa2.anio_pago < ? OR (pa2.anio_pago = ? AND pa2.num_sem_pago < ?))
        ) AS abonado_antes
    FROM info_empleados e
    INNER JOIN prestamos p ON p.id_empleado = e.id_empleado
    INNER JOIN prestamos_abonos pa ON pa.id_prestamo = p.id_prestamo
    LEFT JOIN departamentos d ON d.id_departamento = e.id_departamento
    WHERE pa.anio_pago = ? AND pa.num_sem_pago = ?
    GROUP BY e.id_empleado, colaborador, departamento, status_nss
    HAVING pagado_semana > 0
    ORDER BY departamento ASC, colaborador ASC
";

$stmt = $conexion->prepare($sql);
$stmt->bind_param('iiiiiiiii', $anio, $semana, $anio, $semana, $anio, $anio, $semana, $anio, $semana);
$stmt->execute();
$res = $stmt->get_result();

$rows = [];
$totDeuda = 0.0;
$totDescuento = 0.0;
$totPorPagar = 0.0;
$deptCols = []; // Columnas dinámicas de departamentos
$totDept = [];  // Totales por departamento

while ($r = $res->fetch_assoc()) {
    $dept = (string)$r['departamento'];
    $suffix = ((int)$r['status_nss'] === 1) ? 'CSS' : 'SSS';
    $deptLabel = $dept . '-' . $suffix;

    // Registrar columna de departamento
    if (!isset($deptCols[$deptLabel])) {
        $deptCols[$deptLabel] = true;
        $totDept[$deptLabel] = 0.0;
    }

    $totalPrestamos = formatoMoneda($r['total_prestamos']);
    $abonadoAntes = formatoMoneda($r['abonado_antes']);
    $pagadoSemana = formatoMoneda($r['pagado_semana']);

    $deudaAntes = formatoMoneda($totalPrestamos - $abonadoAntes);
    $porPagar = formatoMoneda($deudaAntes - $pagadoSemana);

    $rows[] = [
        'colaborador' => (string)$r['colaborador'],
        'dept_label' => $deptLabel,
        'deuda' => $deudaAntes,
        'descuento' => $pagadoSemana,
        'por_pagar' => $porPagar,
    ];

    $totDeuda += $deudaAntes;
    $totDescuento += $pagadoSemana;
    $totPorPagar += $porPagar;
    $totDept[$deptLabel] += $pagadoSemana;
}
$stmt->close();

// Ordenar columnas de departamentos
$deptCols = array_keys($deptCols);
sort($deptCols);

if (count($rows) === 0) {
    echo json_encode([
        'success' => false,
        'message' => 'No hay abonos registrados para la semana ' . $semana . ' del año ' . $anio
    ]);
    exit;
}

// Formatear totales por departamento
$totDeptFormatted = [];
foreach ($deptCols as $dc) {
    $totDeptFormatted[$dc] = formatoMoneda($totDept[$dc] ?? 0);
}

echo json_encode([
    'success' => true,
    'data' => $rows,
    'dept_cols' => $deptCols,
    'totales' => [
        'deuda' => formatoMoneda($totDeuda),
        'descuento' => formatoMoneda($totDescuento),
        'por_pagar' => formatoMoneda($totPorPagar),
        'por_dept' => $totDeptFormatted
    ],
    'semana' => $semana,
    'anio' => $anio,
    'total_registros' => count($rows)
]);
