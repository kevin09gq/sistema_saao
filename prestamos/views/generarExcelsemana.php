<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . '/../../conexion/conexion.php';

if (!isset($_SESSION["logged_in"])) {
    http_response_code(401);
    echo 'No autenticado';
    exit;
}

$anio = isset($_GET['anio']) ? (int)$_GET['anio'] : 0;
$semana = isset($_GET['semana']) ? (int)$_GET['semana'] : 0;

if ($anio <= 0 || $semana <= 0 || $semana > 53) {
    http_response_code(400);
    echo 'Parámetros inválidos';
    exit;
}

// Inicio del script principal
require_once '../../vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\PageSetup;

function formatoMoneda($valor): float
{
    return (float)number_format((float)$valor, 2, '.', '');
}

function setCell($sheet, int $col, int $row, $value): void
{
    $sheet->setCellValue(Coordinate::stringFromColumnIndex($col) . $row, $value);
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
while ($r = $res->fetch_assoc()) {
    $dept = (string)$r['departamento'];
    $suffix = ((int)$r['status_nss'] === 1) ? 'CSS' : 'SSS';
    $deptLabel = $dept . '-' . $suffix;

    $totalPrestamos = formatoMoneda($r['total_prestamos']);
    $abonadoAntes = formatoMoneda($r['abonado_antes']);
    $pagadoSemana = formatoMoneda($r['pagado_semana']);

    $deudaAntes = formatoMoneda($totalPrestamos - $abonadoAntes);
    $porPagar = formatoMoneda($deudaAntes - $pagadoSemana);

    $rows[] = [
        'colaborador' => (string)$r['colaborador'],
        'dept_label' => $deptLabel,
        'deuda' => $deudaAntes,
        'pagado_semana' => $pagadoSemana,
        'por_pagar' => $porPagar,
    ];
}
$stmt->close();

if (count($rows) === 0) {
    http_response_code(404);
    echo 'No hay abonos para esa semana/año';
    exit;
}

// Columnas dinámicas por departamento+seguro
$deptCols = [];
foreach ($rows as $r) {
    $deptCols[$r['dept_label']] = true;
}
$deptCols = array_keys($deptCols);
sort($deptCols);

$spreadsheet = new Spreadsheet();
$sheet = $spreadsheet->getActiveSheet();
$sheet->setTitle('ABONOS-SEM' . $semana);
$sheet->getPageSetup()->setOrientation(PageSetup::ORIENTATION_LANDSCAPE);
$sheet->getPageSetup()->setPaperSize(PageSetup::PAPERSIZE_A4);

// Encabezados
$headers = array_merge([
    'N°.SEM',
    'COLABORADOR',
    'DEUDA'
], $deptCols, [
    'ANTICIPO',
    'DESCUENTO',
    'POR PAGAR'
]);

$col = 1;
foreach ($headers as $h) {
    setCell($sheet, $col, 1, $h);
    $col++;
}

$headerRange = 'A1:' . Coordinate::stringFromColumnIndex(count($headers)) . '1';
$sheet->getStyle($headerRange)->getFont()->setBold(true);
$sheet->getStyle($headerRange)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
$sheet->getStyle($headerRange)->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('FFFFFF00');

// Estilo específico para encabezado DEUDA (columna C)
$sheet->getStyle('C1')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('FF000000');
$sheet->getStyle('C1')->getFont()->getColor()->setARGB('FFFFFFFF');

// Estilo específico para encabezado POR PAGAR (última columna)
$lastColIndex = count($headers);
$lastColLetter = Coordinate::stringFromColumnIndex($lastColIndex);
$sheet->getStyle($lastColLetter . '1')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('FF000000');
$sheet->getStyle($lastColLetter . '1')->getFont()->getColor()->setARGB('FFFFFFFF');

// Datos
$startRow = 2;
$totDeuda = 0.0;
$totDescuento = 0.0;
$totPorPagar = 0.0;
$totDept = array_fill_keys($deptCols, 0.0);

foreach ($rows as $idx => $r) {
    $rowNum = $startRow + $idx;

    setCell($sheet, 1, $rowNum, $semana);
    setCell($sheet, 2, $rowNum, $r['colaborador']);
    setCell($sheet, 3, $rowNum, $r['deuda']);

    // dept cols
    $c = 4;
    foreach ($deptCols as $deptLabel) {
        $val = ($deptLabel === $r['dept_label']) ? $r['pagado_semana'] : '';
        setCell($sheet, $c, $rowNum, $val);
        if ($deptLabel === $r['dept_label']) {
            $totDept[$deptLabel] += (float)$r['pagado_semana'];
        }
        $c++;
    }

    // anticipo (blank)
    setCell($sheet, $c, $rowNum, '');
    $c++;
    // descuento
    setCell($sheet, $c, $rowNum, $r['pagado_semana']);
    $c++;
    // por pagar
    setCell($sheet, $c, $rowNum, $r['por_pagar']);

    $totDeuda += (float)$r['deuda'];
    $totDescuento += (float)$r['pagado_semana'];
    $totPorPagar += (float)$r['por_pagar'];
}

$lastDataRow = $startRow + count($rows) - 1;
$totRow = $lastDataRow + 1;

setCell($sheet, 2, $totRow, 'TOTALES');
setCell($sheet, 3, $totRow, formatoMoneda($totDeuda));

$c = 4;
foreach ($deptCols as $deptLabel) {
    setCell($sheet, $c, $totRow, formatoMoneda($totDept[$deptLabel] ?? 0));
    $c++;
}

setCell($sheet, $c, $totRow, '');
$c++;
setCell($sheet, $c, $totRow, formatoMoneda($totDescuento));
$c++;
setCell($sheet, $c, $totRow, formatoMoneda($totPorPagar));

$totRange = 'A' . $totRow . ':' . Coordinate::stringFromColumnIndex(count($headers)) . $totRow;
$sheet->getStyle($totRange)->getFont()->setBold(true);
$sheet->getStyle($totRange)->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('FFFDE9D9');

// Bordes + formato
$allRange = 'A1:' . Coordinate::stringFromColumnIndex(count($headers)) . $totRow;
$sheet->getStyle($allRange)->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);
$sheet->getStyle('C2:C' . $totRow)->getNumberFormat()->setFormatCode('"$" #,##0.00');
// Estilo de color morado para columna DEUDA (datos)
$sheet->getStyle('C2:C' . $totRow)->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('FFAB91FF');

// dept columns are money
$deptStartCol = 4;
$deptEndCol = 3 + count($deptCols);
if ($deptEndCol >= $deptStartCol) {
    $rangeDept = Coordinate::stringFromColumnIndex($deptStartCol) . '2:' . Coordinate::stringFromColumnIndex($deptEndCol) . $totRow;
    $sheet->getStyle($rangeDept)->getNumberFormat()->setFormatCode('"$" #,##0.00');
}

$descuentoCol = 4 + count($deptCols) + 1;
$porPagarCol = $descuentoCol + 1;
$sheet->getStyle(Coordinate::stringFromColumnIndex($descuentoCol) . '2:' . Coordinate::stringFromColumnIndex($descuentoCol) . $totRow)
    ->getNumberFormat()->setFormatCode('"$" #,##0.00');
$sheet->getStyle(Coordinate::stringFromColumnIndex($porPagarCol) . '2:' . Coordinate::stringFromColumnIndex($porPagarCol) . $totRow)
    ->getNumberFormat()->setFormatCode('"$" #,##0.00');
// Estilo de color verde para columna POR PAGAR (datos)
$porPagarRange = Coordinate::stringFromColumnIndex($porPagarCol) . '2:' . Coordinate::stringFromColumnIndex($porPagarCol) . $totRow;
$sheet->getStyle($porPagarRange) ->getFill() ->setFillType(Fill::FILL_SOLID) ->getStartColor() ->setARGB('FF6DDE6D');

for ($i = 1; $i <= count($headers); $i++) {
    $sheet->getColumnDimensionByColumn($i)->setAutoSize(true);
}

$filename = sprintf('ABONOS-SEM%02d.xlsx', $semana);
header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
header('Content-Disposition: attachment; filename="' . $filename . '"');
header('Cache-Control: max-age=0');

$writer = new Xlsx($spreadsheet);
$writer->save('php://output');
exit;