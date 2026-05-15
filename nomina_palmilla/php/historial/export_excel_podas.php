<?php
require_once __DIR__ . '/../../../vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;

include "../../../config/config.php";
include "../../../conexion/conexion.php";

if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    die("Acceso no autorizado.");
}

$filtroAnio = $_GET['anio'] ?? '';
$filtroMes = $_GET['mes'] ?? '';
$filtroSemana = $_GET['semana'] ?? '';
$tipoReporte = $_GET['tipo'] ?? 'mixto'; // 'mixto', 'poda', 'extras'

$meses_map = [
    'Ene' => 1, 'Feb' => 2, 'Mar' => 3, 'Abr' => 4, 'May' => 5, 'Jun' => 6,
    'Jul' => 7, 'Ago' => 8, 'Sep' => 9, 'Oct' => 10, 'Nov' => 11, 'Dic' => 12
];

function extraerMesDesdeJson($json_nomina) {
    global $meses_map;
    if (!$json_nomina) return null;
    $data = json_decode($json_nomina, true);
    if (isset($data['fecha_cierre'])) {
        $partes = explode('/', $data['fecha_cierre']);
        if (count($partes) >= 2) {
            $mesStr = $partes[1];
            return isset($meses_map[$mesStr]) ? $meses_map[$mesStr] : null;
        }
    }
    return null;
}

// 1. Obtener IDs de nóminas que cumplen el filtro
$whereN = ["1=1"];
$paramsN = [];
$typesN = "";

if ($filtroAnio !== '') {
    $whereN[] = "anio = ?";
    $paramsN[] = (int)$filtroAnio;
    $typesN .= "i";
}
if ($filtroSemana !== '') {
    $whereN[] = "numero_semana = ?";
    $paramsN[] = (int)$filtroSemana;
    $typesN .= "i";
}

$sqlN = "SELECT id_nomina_palmilla, nomina_palmilla FROM nomina_palmilla WHERE " . implode(" AND ", $whereN);
$stmtN = $conexion->prepare($sqlN);
if ($typesN !== "") {
    $stmtN->bind_param($typesN, ...$paramsN);
}
$stmtN->execute();
$resN = $stmtN->get_result();

$nominaIds = [];
while ($row = $resN->fetch_assoc()) {
    $mes = extraerMesDesdeJson($row['nomina_palmilla']);
    if ($filtroMes !== '' && (int)$mes !== (int)$filtroMes) continue;
    $nominaIds[] = $row['id_nomina_palmilla'];
}

if (empty($nominaIds)) {
    die("No se encontraron datos para los filtros seleccionados.");
}

// Obtener el color del área de Palmilla (ID 7)
$color_area = 'FF004D17'; // Verde por defecto en ARGB (Spreadsheet usa ARGB)
$query_color = "
    SELECT a.colores 
    FROM areas a
    INNER JOIN nombre_nominas n ON a.id_area = n.id_area
    WHERE n.id_nomina = 7
    LIMIT 1
";
$res_color = $conexion->query($query_color);
if ($res_color && $row_color = $res_color->fetch_assoc()) {
    $c = $row_color['colores'];
    if (!empty($c)) {
        // Normalizar a ARGB
        if (strpos($c, '#') === 0) {
            $hex = substr($c, 1);
            if (strlen($hex) === 3) {
                $hex = $hex[0].$hex[0].$hex[1].$hex[1].$hex[2].$hex[2];
            }
            $color_area = 'FF' . strtoupper($hex);
        } elseif (strpos($c, 'rgb') === 0) {
            preg_match_all('/\d+/', $c, $matches);
            if (count($matches[0]) >= 3) {
                $color_area = sprintf("FF%02X%02X%02X", $matches[0][0], $matches[0][1], $matches[0][2]);
            }
        }
    }
}

$placeholders = implode(',', array_fill(0, count($nominaIds), '?'));

// 2. Obtener movimientos
$queryMov = "
    SELECT
        p.nombre_empleado,
        m.fecha,
        m.concepto,
        m.arboles_podados,
        m.monto,
        m.es_extra,
        n.numero_semana,
        n.anio
    FROM podas_movimientos_palmilla m
    JOIN podas_palmilla p ON m.id_poda = p.id_poda
    JOIN nomina_palmilla n ON p.id_nomina = n.id_nomina_palmilla
    WHERE n.id_nomina_palmilla IN ({$placeholders})
    ORDER BY n.anio DESC, n.numero_semana ASC, p.nombre_empleado ASC, m.fecha ASC, m.id_movimiento ASC
";

$stmtMov = $conexion->prepare($queryMov);
$typesMov = str_repeat('i', count($nominaIds));
$stmtMov->bind_param($typesMov, ...$nominaIds);
$stmtMov->execute();
$resMov = $stmtMov->get_result();

$rowsPoda = [];
$rowsExtras = [];

while ($r = $resMov->fetch_assoc()) {
    $esExtra = (int)$r['es_extra'] === 1;
    $nombre = $r['nombre_empleado'] ?? '';
    $fecha = $r['fecha'] ?? '';
    $sem = $r['numero_semana'] ?? '';

    if ($esExtra) {
        $concepto = $r['concepto'] ?? '';
        $monto = (float)($r['monto'] ?? 0);
        $rowsExtras[] = [$nombre, $fecha, $concepto, $monto];
    } else {
        $arboles = (int)($r['arboles_podados'] ?? 0);
        $pagoPorArbol = (float)($r['monto'] ?? 0);
        $total = $arboles * $pagoPorArbol;
        $rowsPoda[] = [$nombre, $fecha, $arboles, $pagoPorArbol, $total];
    }
}

// 3. Crear Excel
$spreadsheet = new Spreadsheet();
$spreadsheet->removeSheetByIndex(0);

if ($tipoReporte === 'mixto' || $tipoReporte === 'poda') {
    $sheetP = $spreadsheet->createSheet();
    $sheetP->setTitle('PODA');
    prepararHoja($sheetP, 'REPORTE DE PODAS - PALMILLA', ['PODADOR', 'FECHA', 'ÁRBOLES PODADOS', 'PAGO POR ÁRBOL', 'TOTAL'], $rowsPoda, 'poda');
}

if ($tipoReporte === 'mixto' || $tipoReporte === 'extras') {
    $sheetE = $spreadsheet->createSheet();
    $sheetE->setTitle('EXTRAS');
    prepararHoja($sheetE, 'REPORTE DE PAGOS EXTRAS - PALMILLA', ['EMPLEADO', 'FECHA', 'CONCEPTO', 'MONTO'], $rowsExtras, 'extras');
}

function prepararHoja($sheet, $titulo, $columnHeaders, $dataRows, $tipoTotalGeneral = null) {
    $lastCol = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex(count($columnHeaders));
    
    // Branding Palmilla (Verde Institucional)
    $sheet->setCellValue('A1', 'CITRICOS SAAO');
    $sheet->setCellValue('A2', 'RANCHO PALMILLA');
    $sheet->setCellValue('A3', $titulo);
    $sheet->setCellValue('A4', 'Fecha de generación: ' . date('d/m/Y H:i'));

    $sheet->mergeCells("A1:{$lastCol}1");
    $sheet->mergeCells("A2:{$lastCol}2");
    $sheet->mergeCells("A3:{$lastCol}3");
    $sheet->mergeCells("A4:{$lastCol}4");

    $headerBrandingRange = "A1:{$lastCol}4";
    $sheet->getStyle($headerBrandingRange)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
    $sheet->getStyle($headerBrandingRange)->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);

    $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(26)->getColor()->setARGB('FF004D17');
    $sheet->getStyle('A2')->getFont()->setBold(true)->setSize(18)->getColor()->setARGB('FF333333');
    $sheet->getStyle('A3')->getFont()->setBold(true)->setSize(14)->getColor()->setARGB('FF555555');
    $sheet->getStyle('A4')->getFont()->setItalic(true)->setSize(11)->getColor()->setARGB('FF777777');

    $sheet->getRowDimension(1)->setRowHeight(45);
    $sheet->getRowDimension(2)->setRowHeight(30);
    $sheet->getRowDimension(3)->setRowHeight(25);
    $sheet->getRowDimension(4)->setRowHeight(20);

    $headerRow = 6;
    $colIndex = 1;
    foreach ($columnHeaders as $h) {
        $colLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colIndex);
        $sheet->setCellValue("{$colLetter}{$headerRow}", mb_strtoupper($h, 'UTF-8'));
        $colIndex++;
    }

    $headerRange = "A{$headerRow}:{$lastCol}{$headerRow}";
    $sheet->getStyle($headerRange)->getFont()->setBold(true)->setSize(14)->getColor()->setARGB('FFFFFFFF'); // Texto blanco para encabezado
    $sheet->getStyle($headerRange)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
    $sheet->getStyle($headerRange)->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);
    $sheet->getStyle($headerRange)->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB($GLOBALS['color_area']); // Fondo dinámico para encabezado

    $sheet->getRowDimension($headerRow)->setRowHeight(35);
    $sheet->freezePane('A7');

    $rowPos = 7;
    foreach ($dataRows as $rowData) {
        $colIdx = 1;
        foreach ($rowData as $val) {
            $colL = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colIdx);
            $sheet->setCellValue("{$colL}{$rowPos}", $val);
            $colIdx++;
        }
        
        $rowRange = "A{$rowPos}:{$lastCol}{$rowPos}";
        $sheet->getStyle($rowRange)->getFont()->setSize(13);
        $sheet->getStyle($rowRange)->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);
        $sheet->getStyle($rowRange)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        
        if ($rowPos % 2 === 0) {
            $sheet->getStyle($rowRange)->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('FFF9F9F9');
        }
        
        $sheet->getRowDimension($rowPos)->setRowHeight(28);
        $rowPos++;
    }

    // Fila TOTAL GENERAL (para PODAS y/o EXTRAS)
    if ($tipoTotalGeneral === 'poda') {
        $totalArboles = 0;
        $totalDinero = 0.0;

        foreach ($dataRows as $r) {
            $totalArboles += (int)($r[2] ?? 0);
            $totalDinero += (float)($r[4] ?? 0);
        }

        $totalRow = $rowPos;
        $sheet->mergeCells("A{$totalRow}:B{$totalRow}");
        $sheet->setCellValue("A{$totalRow}", 'TOTAL GENERAL');
        $sheet->setCellValue("C{$totalRow}", $totalArboles);
        // Columna D (pago por árbol) se deja en blanco
        $sheet->setCellValue("E{$totalRow}", $totalDinero);

        $totalRange = "A{$totalRow}:{$lastCol}{$totalRow}";
        $sheet->getStyle($totalRange)->getFont()->setBold(true)->setSize(14);
        $sheet->getStyle($totalRange)->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('FFF2F2F2');
        $sheet->getStyle("A{$totalRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
        $sheet->getStyle("A{$totalRow}:{$lastCol}{$totalRow}")->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);
        $sheet->getRowDimension($totalRow)->setRowHeight(30);

        $rowPos++;
    } else if ($tipoTotalGeneral === 'extras') {
        $totalExtras = 0.0;

        foreach ($dataRows as $r) {
            $totalExtras += (float)($r[3] ?? 0);
        }

        $totalRow = $rowPos;
        // A:C etiqueta, D monto
        $sheet->mergeCells("A{$totalRow}:C{$totalRow}");
        $sheet->setCellValue("A{$totalRow}", 'TOTAL GENERAL');
        $sheet->setCellValue("D{$totalRow}", $totalExtras);

        $totalRange = "A{$totalRow}:{$lastCol}{$totalRow}";
        $sheet->getStyle($totalRange)->getFont()->setBold(true)->setSize(14);
        $sheet->getStyle($totalRange)->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('FFF2F2F2');
        $sheet->getStyle("A{$totalRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
        $sheet->getStyle("A{$totalRow}:{$lastCol}{$totalRow}")->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);
        // El total en medio de su celda
        $sheet->getStyle("D{$totalRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getRowDimension($totalRow)->setRowHeight(30);

        $rowPos++;
    }

    // Bordes y alineación final
    $dataRange = "A{$headerRow}:{$lastCol}" . ($rowPos - 1);
    $sheet->getStyle($dataRange)->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN)->getColor()->setARGB('FFCCCCCC');
    
    // Auto-size o anchos fijos profesionales
    $anchos = [1 => 42, 2 => 18, 3 => 22, 4 => 22, 5 => 22, 6 => 15];
    foreach ($anchos as $idx => $w) {
        $colL = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($idx);
        $sheet->getColumnDimension($colL)->setWidth($w);
    }

    // Formatos de número
    if ($titulo === 'REPORTE DE PODAS - PALMILLA') {
        $sheet->getStyle("D7:E" . ($rowPos - 1))->getNumberFormat()->setFormatCode('$#,##0.00');
    } else {
        $sheet->getStyle("D7:D" . ($rowPos - 1))->getNumberFormat()->setFormatCode('$#,##0.00');
    }

    $sheet->getPageSetup()->setOrientation(\PhpOffice\PhpSpreadsheet\Worksheet\PageSetup::ORIENTATION_LANDSCAPE);
    $sheet->getPageSetup()->setPaperSize(\PhpOffice\PhpSpreadsheet\Worksheet\PageSetup::PAPERSIZE_A4);
    $sheet->getPageSetup()->setFitToWidth(1);
    $sheet->getPageSetup()->setFitToHeight(0);
    $sheet->getPageSetup()->setHorizontalCentered(true);
}

header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
header('Content-Disposition: attachment;filename="Historial_Podas_Palmilla_' . date('dmY') . '.xlsx"');
header('Cache-Control: max-age=0');

$writer = new Xlsx($spreadsheet);
$writer->save('php://output');
exit;
