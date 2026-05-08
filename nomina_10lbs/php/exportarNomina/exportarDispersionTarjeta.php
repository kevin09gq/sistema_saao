<?php

// Incluir autoload de Composer
require_once __DIR__ . '/../../../vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Color;
use PhpOffice\PhpSpreadsheet\Worksheet\Drawing;
use PhpOffice\PhpSpreadsheet\Worksheet\PageSetup;

//=====================
//  RECIBIR DATOS DEL JSON
//=====================

$jsonNomina = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['jsonNomina'])) {
    $jsonNomina = json_decode($_POST['jsonNomina'], true);
}

if (!$jsonNomina) {
    die("No hay datos de nómina disponibles.");
}

//=====================
//  CONFIGURACIÓN INICIAL
//=====================

$spreadsheet = new Spreadsheet();
$spreadsheet->getDefaultStyle()->getFont()->setName('Arial');

// Eliminar la hoja por defecto (la usaremos o la quitaremos al final)
$spreadsheet->removeSheetByIndex(0);

$numeroSemana = isset($jsonNomina['numero_semana']) ? str_pad($jsonNomina['numero_semana'], 2, '0', STR_PAD_LEFT) : '00';
$anio = isset($jsonNomina['fecha_cierre']) ? explode('/', $jsonNomina['fecha_cierre'])[2] : date('Y');
$logoPath = '../../../public/img/logo.jpg';

// Estilo de cabecera de tabla
$estiloCabecera = [
    'font' => [
        'bold' => true,
        'color' => ['rgb' => 'FFFFFF'],
        'size' => 11,
    ],
    'alignment' => [
        'horizontal' => Alignment::HORIZONTAL_CENTER,
        'vertical' => Alignment::VERTICAL_CENTER,
    ],
    'fill' => [
        'fillType' => Fill::FILL_SOLID,
        'startColor' => ['rgb' => '179C1E'], // Verde institucional
    ],
    'borders' => [
        'allBorders' => [
            'borderStyle' => Border::BORDER_THIN,
            'color' => ['rgb' => '000000'],
        ],
    ],
];

if (isset($jsonNomina['departamentos']) && is_array($jsonNomina['departamentos'])) {
    foreach ($jsonNomina['departamentos'] as $departamento) {
        $nombreDepto = $departamento['nombre'] ?? 'SIN NOMBRE';

        // Excluir departamentos sin seguro si aplica
        if (stripos($nombreDepto, 'Sin seguro') !== false) {
            continue;
        }

        // Filtrar empleados con tarjeta (monto > 0)
        $empleadosConTarjeta = array_filter($departamento['empleados'] ?? [], function ($e) {
            return (isset($e['tarjeta']) && (float) $e['tarjeta'] > 0);
        });

        // Si el departamento no tiene empleados con tarjeta, no creamos la hoja
        if (empty($empleadosConTarjeta)) {
            continue;
        }

        // Crear nueva hoja
        $sheet = $spreadsheet->createSheet();

        // Sanitizar nombre de la hoja (máx 31 caracteres, sin caracteres prohibidos)
        $tituloHoja = substr($nombreDepto, 0, 31);
        $tituloHoja = str_replace(['*', ':', '/', '\\', '?', '[', ']'], '', $tituloHoja);
        $sheet->setTitle($tituloHoja);

        // --- DISEÑO DE CABECERA EN CADA HOJA ---

        // Logo
        if (file_exists($logoPath)) {
            $logo = new Drawing();
            $logo->setName('Logo');
            $logo->setPath($logoPath);
            $logo->setHeight(70);
            $logo->setCoordinates('A1');
            $logo->setWorksheet($sheet);
        }

        // Títulos (centrados con la tabla A:D)
        $sheet->setCellValue('B1', 'DISPERSIÓN DE TARJETA');
        $sheet->mergeCells('B1:D1');
        $sheet->getStyle('B1')->getFont()->setBold(true)->setSize(20)->setColor(new Color('179C1E'));
        $sheet->getStyle('B1')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        $sheet->setCellValue('B2', 'CITRICOS SAAO S.A DE C.V');
        $sheet->mergeCells('B2:D2');
        $sheet->getStyle('B2')->getFont()->setBold(true)->setSize(18)->setColor(new Color('179C1E'));
        $sheet->getStyle('B2')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        $sheet->setCellValue('B3', "SEMANA $numeroSemana-$anio");
        $sheet->mergeCells('B3:D3');
        $sheet->getStyle('B3')->getFont()->setBold(true)->setSize(14);
        $sheet->getStyle('B3')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        $sheet->setCellValue('B4', $nombreDepto);
        $sheet->mergeCells('B4:D4');
        $sheet->getStyle('B4')->getFont()->setBold(true)->setSize(14);
        $sheet->getStyle('B4')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        // Encabezados de tabla
        $filaCabecera = 6;
        $sheet->setCellValue('A' . $filaCabecera, '#');
        $sheet->setCellValue('B' . $filaCabecera, 'CLAVE');
        $sheet->setCellValue('C' . $filaCabecera, 'NOMBRE');
        $sheet->setCellValue('D' . $filaCabecera, 'TARJETA');

        $sheet->getStyle('A6:D6')->applyFromArray($estiloCabecera);
        $sheet->getRowDimension(6)->setRowHeight(30);

        // Anchos de columna
        $sheet->getColumnDimension('A')->setWidth(6);
        $sheet->getColumnDimension('B')->setWidth(10);
        $sheet->getColumnDimension('C')->setWidth(40);
        $sheet->getColumnDimension('D')->setWidth(15);

        // --- LLENAR DATOS ---
        $fila = 7;
        $contador = 1;
        $totalDepto = 0;

        foreach ($empleadosConTarjeta as $empleado) {
            $montoTarjeta = (float) ($empleado['tarjeta'] ?? 0);
            $totalDepto += $montoTarjeta;

            $sheet->setCellValue('A' . $fila, $contador);
            $sheet->setCellValueExplicit('B' . $fila, $empleado['clave'] ?? '', \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
            $sheet->setCellValue('C' . $fila, $empleado['nombre'] ?? '');
            $sheet->setCellValue('D' . $fila, $montoTarjeta);

            // Estilos de celda
            $sheet->getStyle('D' . $fila)->getNumberFormat()->setFormatCode('$#,##0.00');
            $sheet->getStyle("A$fila:D$fila")->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);
            $sheet->getStyle("A$fila:B$fila")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle('D' . $fila)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("A$fila:D$fila")->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);
            $sheet->getRowDimension($fila)->setRowHeight(30);

            $fila++;
            $contador++;
        }

        // --- FILA DE TOTALES POR DEPARTAMENTO ---
        $filaTotal = $fila;
        $sheet->setCellValue('C' . $filaTotal, 'TOTAL DEPARTAMENTO:');
        $sheet->getStyle('C' . $filaTotal)->getFont()->setBold(true);
        $sheet->getStyle('C' . $filaTotal)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);

        $sheet->setCellValue('D' . $filaTotal, $totalDepto);
        $sheet->getStyle('D' . $filaTotal)->getFont()->setBold(true);
        $sheet->getStyle('D' . $filaTotal)->getNumberFormat()->setFormatCode('$#,##0.00');
        $sheet->getStyle('D' . $filaTotal)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        $sheet->getStyle("A$filaTotal:D$filaTotal")->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);
        $sheet->getStyle("A$filaTotal:D$filaTotal")->getFill()->setFillType(Fill::FILL_SOLID);
        $sheet->getStyle("A$filaTotal:D$filaTotal")->getFill()->getStartColor()->setRGB('E9E9E9');
        $sheet->getRowDimension($filaTotal)->setRowHeight(35);

        // --- CONFIGURACIÓN DE IMPRESIÓN ---
        $sheet->getPageSetup()->setPaperSize(PageSetup::PAPERSIZE_LETTER);
        $sheet->getPageSetup()->setOrientation(PageSetup::ORIENTATION_PORTRAIT);
        $sheet->getPageSetup()->setHorizontalCentered(true);
        $sheet->getPageSetup()->setVerticalCentered(false);
        $sheet->getPageMargins()->setTop(0.5);
        $sheet->getPageMargins()->setBottom(0.5);
        $sheet->getPageMargins()->setLeft(0.5);
        $sheet->getPageMargins()->setRight(0.5);
        $sheet->getPageSetup()->setFitToPage(true);
        $sheet->getPageSetup()->setFitToWidth(1);
        $sheet->getPageSetup()->setFitToHeight(0);
    }
}

// Si no se creó ninguna hoja (porque no había empleados con tarjeta), crear una vacía para que no de error
if ($spreadsheet->getSheetCount() === 0) {
    $sheet = $spreadsheet->createSheet();
    $sheet->setTitle('SIN DATOS');
    $sheet->setCellValue('A1', 'No hay empleados con dispersión de tarjeta en esta nómina.');
}

// Establecer la primera hoja como activa
$spreadsheet->setActiveSheetIndex(0);

//=====================
//  DESCARGAR ARCHIVO
//=====================

$writer = new Xlsx($spreadsheet);
$filename = 'DISPERSIÓN_TARJETA_' . date('Y-m-d_H-i-s') . '.xlsx';

header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
header('Content-Disposition: attachment; filename="' . $filename . '"');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

$writer->save('php://output');
exit;