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
$sheet = $spreadsheet->getActiveSheet();
$spreadsheet->getDefaultStyle()->getFont()->setName('Arial');
$sheet->setTitle('DISPERSIÓN TARJETA');

//=====================
//  ENCABEZADOS DE CABECERA (Títulos)
//=====================

$numeroSemana = isset($jsonNomina['numero_semana']) ? str_pad($jsonNomina['numero_semana'], 2, '0', STR_PAD_LEFT) : '00';
$anio = isset($jsonNomina['fecha_cierre']) ? explode('/', $jsonNomina['fecha_cierre'])[2] : date('Y');

// Título 1 - DISPERSIÓN DE TARJETA
$sheet->setCellValue('C1', 'DISPERSIÓN DE TARJETA');
$sheet->mergeCells('C1:E1');
$sheet->getStyle('C1')->getFont()->setBold(true)->setSize(20)->setColor(new Color('179C1E'));
$sheet->getStyle('C1')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

// Título 2 - CITRICOS SAAO S.A DE C.V
$sheet->setCellValue('C2', 'CITRICOS SAAO S.A DE C.V');
$sheet->mergeCells('C2:E2');
$sheet->getStyle('C2')->getFont()->setBold(true)->setSize(16)->setColor(new Color('179C1E'));
$sheet->getStyle('C2')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

// Título 3 - SEMANA XX-YYYY
$sheet->setCellValue('C3', "SEMANA $numeroSemana-$anio");
$sheet->mergeCells('C3:E3');
$sheet->getStyle('C3')->getFont()->setBold(true)->setSize(14);
$sheet->getStyle('C3')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

// Insertar logo
$logoPath = '../../../public/img/logo.jpg';
if (file_exists($logoPath)) {
    $logo = new Drawing();
    $logo->setName('Logo');
    $logo->setDescription('Logo Citricos Saao');
    $logo->setPath($logoPath);
    $logo->setHeight(90);
    $logo->setCoordinates('A1');
    $logo->setWorksheet($sheet);
}

//=====================
//  ENCABEZADOS DE LA TABLA
//=====================

$filaCabecera = 5;
$sheet->setCellValue('A' . $filaCabecera, '#');
$sheet->setCellValue('B' . $filaCabecera, 'CLAVE');
$sheet->setCellValue('C' . $filaCabecera, 'NOMBRE');
$sheet->setCellValue('D' . $filaCabecera, 'TARJETA');
$sheet->setCellValue('E' . $filaCabecera, 'DEPARTAMENTO');

// Estilo de cabecera
$estiloCabecera = [
    'font' => [
        'bold' => true,
        'color' => ['rgb' => 'FFFFFF'],
        'size' => 12,
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
$sheet->getStyle('A5:E5')->applyFromArray($estiloCabecera);
$sheet->getRowDimension(5)->setRowHeight(35);

// Configurar anchos de columna
$sheet->getColumnDimension('A')->setWidth(7);
$sheet->getColumnDimension('B')->setWidth(10);
$sheet->getColumnDimension('C')->setWidth(45);
$sheet->getColumnDimension('D')->setWidth(15);
$sheet->getColumnDimension('E')->setWidth(40);

//=====================
//  LLENAR DATOS
//=====================

$fila = 6;
$contador = 1;

if (isset($jsonNomina['departamentos'])) {
    foreach ($jsonNomina['departamentos'] as $departamento) {
        $nombreDepto = $departamento['nombre'];
        
        // Excluir el departamento "Sin seguro"
        if (stripos($nombreDepto, 'Sin seguro') !== false) {
            continue;
        }

        foreach ($departamento['empleados'] as $empleado) {
            // Solo exportar si tiene tarjeta o si es relevante para dispersión
            $montoTarjeta = isset($empleado['tarjeta']) ? (float)$empleado['tarjeta'] : 0;
            
            $sheet->setCellValue('A' . $fila, $contador);
            $sheet->setCellValueExplicit('B' . $fila, $empleado['clave'] ?? '', \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);
            $sheet->setCellValue('C' . $fila, $empleado['nombre'] ?? '');
            $sheet->setCellValue('D' . $fila, $montoTarjeta);
            $sheet->setCellValue('E' . $fila, $nombreDepto);

            // Formato de moneda para la tarjeta
            $sheet->getStyle('D' . $fila)->getNumberFormat()->setFormatCode('$#,##0.00');
            
            // Alineación: Todo centrado verticalmente
            $sheet->getStyle("A$fila:E$fila")->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);
            
            // Centrado horizontal para todas las columnas excepto el Nombre (C)
            $sheet->getStyle("A$fila:B$fila")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet->getStyle("D$fila:E$fila")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            
            // Bordes
            $sheet->getStyle('A' . $fila . ':E' . $fila)->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);
            
            // Altura de fila
            $sheet->getRowDimension($fila)->setRowHeight(40);

            $fila++;
            $contador++;
        }
    }
}

//=====================
//  FILA DE TOTALES
//=====================

$filaTotal = $fila;
$rangoSuma = 'D6:D' . ($fila - 1);

// Etiqueta TOTAL en la columna C
$sheet->setCellValue('C' . $filaTotal, 'TOTAL GENERAL:');
$sheet->getStyle('C' . $filaTotal)->getFont()->setBold(true);
$sheet->getStyle('C' . $filaTotal)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);

// Fórmula SUM en la columna D
$sheet->setCellValue('D' . $filaTotal, "=SUM($rangoSuma)");
$sheet->getStyle('D' . $filaTotal)->getFont()->setBold(true);
$sheet->getStyle('D' . $filaTotal)->getNumberFormat()->setFormatCode('$#,##0.00');
$sheet->getStyle('D' . $filaTotal)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

// Aplicar bordes a la fila de totales e incrementar altura
$sheet->getRowDimension($filaTotal)->setRowHeight(45);
$sheet->getStyle("A$filaTotal:E$filaTotal")->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);
$sheet->getStyle("A$filaTotal:E$filaTotal")->getFill()->setFillType(Fill::FILL_SOLID);
$sheet->getStyle("A$filaTotal:E$filaTotal")->getFill()->getStartColor()->setRGB('E9E9E9'); // Gris claro

//=====================
//  CONFIGURACIÓN DE PÁGINA PARA IMPRESIÓN
//=====================

// Establecer tamaño Carta (Letter)
$sheet->getPageSetup()->setPaperSize(PageSetup::PAPERSIZE_LETTER);

// Orientación horizontal (Landscape)
$sheet->getPageSetup()->setOrientation(PageSetup::ORIENTATION_LANDSCAPE);

// Ajustar márgenes (en pulgadas, 0.5 = 1.27cm)
$sheet->getPageMargins()->setTop(0.5);
$sheet->getPageMargins()->setBottom(0.5);
$sheet->getPageMargins()->setLeft(0.5);
$sheet->getPageMargins()->setRight(0.5);

// Ajustar escala para que quepa en el ancho de la página
$sheet->getPageSetup()->setFitToPage(true);
$sheet->getPageSetup()->setFitToWidth(1);
$sheet->getPageSetup()->setFitToHeight(0); // 0 significa que se puede extender en varias páginas hacia abajo

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
