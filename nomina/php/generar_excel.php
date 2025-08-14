<?php 
require '../../vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Drawing;
use PhpOffice\PhpSpreadsheet\Worksheet\PageSetup;

try {
    // Recibir el JSON global desde el cliente
    $jsonGlobal = json_decode(file_get_contents('php://input'), true);

    // Crear nueva hoja de cálculo
    $spreadsheet = new Spreadsheet();
    $sheet = $spreadsheet->getActiveSheet();
    $sheet->setTitle('Nómina SAAO');

    // Configurar página para impresión horizontal
    $sheet->getPageSetup()
        ->setOrientation(PageSetup::ORIENTATION_LANDSCAPE)
        ->setPaperSize(PageSetup::PAPERSIZE_A4)
        ->setHorizontalCentered(true)  // Centrar horizontalmente
        ->setVerticalCentered(false);  // No centrar verticalmente

    // Configurar márgenes más pequeños para aprovechar mejor el espacio
    $sheet->getPageMargins()->setTop(0.3)->setRight(0.3)->setLeft(0.3)->setBottom(0.3);
    $sheet->getPageSetup()->setFitToWidth(1)->setFitToHeight(0);

    // Logo
    if (file_exists('../../public/img/logo.jpg')) {
        $logo = new Drawing();
        $logo->setName('Logo');
        $logo->setDescription('Logo CITRICOS SAAO');
        $logo->setPath('../../public/img/logo.jpg');
        $logo->setHeight(120); // Aumentar de 60 a 120 para hacerlo más grande
        $logo->setCoordinates('A1');
        $logo->setOffsetX(10);
        $logo->setOffsetY(5);
        $logo->setWorksheet($sheet);
    }

    // Título principal centrado - extender el rango de merge
    $sheet->mergeCells('B1:Q1');  // Extendido hasta Q para cubrir toda la tabla
    $sheet->setCellValue('B1', 'CITRICOS SAAO S.A DE C.V');
    $sheet->getStyle('B1')->applyFromArray([
        'font' => ['bold' => true, 'size' => 16, 'color' => ['rgb' => '008000']], // Color verde
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER]
    ]);

    // Título de nómina - extender el rango de merge
    $sheet->mergeCells('B2:Q2');  // Extendido hasta Q para cubrir toda la tabla
    $sheet->setCellValue('B2', 'NOMINA DEL 20 AL 26 DE JUNIO DEL 2025');
    $sheet->getStyle('B2')->applyFromArray([
        'font' => ['bold' => true, 'size' => 14],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER]
    ]);

    // Información de semana - extender el rango de merge
    $sheet->mergeCells('B3:Q3');  // Extendido hasta Q para cubrir toda la tabla
    $sheet->setCellValue('B3', 'SEMANA 26-2025');
    $sheet->getStyle('B3')->applyFromArray([
        'font' => ['bold' => true, 'size' => 12],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER]
    ]);

    // Información adicional
    $sheet->setCellValue('Q1', 'Nº DT (NUM DE DÍAS TRABAJADOS)');

    // Alturas de filas
    $sheet->getRowDimension('1')->setRowHeight(50); // Aumentar altura para acomodar el logo más grande
    $sheet->getRowDimension('2')->setRowHeight(20);
    $sheet->getRowDimension('3')->setRowHeight(25);

    // Encabezados de la tabla actualizados (fila 5) - exactamente como la imagen
    $headers = [
        'A5' => '#',
        'B5' => 'NOMBRE',
        'C5' => 'PUESTO', 
        'D5' => "SUELDO\nNETO",
        'E5' => 'INCENTIVO',
        'F5' => 'EXTRA',
        'G5' => 'TARJETA',
        'H5' => 'PRÉSTAMO',
        'I5' => 'INASISTENCIAS', // Sin salto de línea
        'J5' => 'UNIFORMES',
        'K5' => 'INFONAVIT',
        'L5' => 'ISR',
        'M5' => 'IMSS',
        'N5' => 'checador',
        'O5' => "F.A /\nGAFET/\nCOFIA",
        'P5' => "SUELDO\nA\nCOBRAR",
        'Q5' => "FIRMA\nRECIBIDO"
    ];

    $headerStyle = [
        'font' => ['bold' => true, 'size' => 10, 'color' => ['rgb' => 'FFFFFF']], // Letras blancas
        'alignment' => [
            'horizontal' => Alignment::HORIZONTAL_CENTER, 
            'vertical' => Alignment::VERTICAL_CENTER,
            'wrapText' => true // Permitir texto en múltiples líneas
        ],
        'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '428F49']], // Color verde específico
        'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]]
    ];

    foreach ($headers as $cell => $header) {
        $sheet->setCellValue($cell, $header);
        $sheet->getStyle($cell)->applyFromArray($headerStyle);
    }

    // Ajustar altura de la fila de encabezados para acomodar texto multi-línea
    $sheet->getRowDimension('5')->setRowHeight(50);

    // Ajustar ancho de columnas específicas para que sean uniformes
    $sheet->getColumnDimension('A')->setWidth(5);   // # (número)
    $sheet->getColumnDimension('B')->setWidth(45);  // NOMBRE
    $sheet->getColumnDimension('C')->setWidth(15);  // PUESTO
    $sheet->getColumnDimension('I')->setWidth(15);  // INASISTENCIAS (más ancho)
    
    // Establecer el mismo ancho para el resto de columnas de datos monetarios
    $anchoUniforme = 12; // Ancho uniforme para las demás columnas
    foreach (['D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'O', 'P'] as $col) {
        $sheet->getColumnDimension($col)->setWidth($anchoUniforme);
    }
    
    $sheet->getColumnDimension('Q')->setWidth(15);  // FIRMA RECIBIDO

    // Agregar los datos de empleados del departamento "PRODUCCION 40 LIBRAS"
    $fila = 6; // Comenzar después de los encabezados (fila 5)
    $numero = 1; // Contador para la columna #
    $totalEmpleados = 0; // Contador para total de empleados
    
    // Primero contar el total de empleados
    if (isset($jsonGlobal['departamentos'])) {
        foreach ($jsonGlobal['departamentos'] as $depto) {
            if (stripos($depto['nombre'], 'PRODUCCION 40 LIBRAS') !== false) {
                $totalEmpleados += count($depto['empleados']);
            }
        }
    }
    
    if (isset($jsonGlobal['departamentos'])) {
        foreach ($jsonGlobal['departamentos'] as $depto) {
            // Filtrar solo el departamento "PRODUCCION 40 LIBRAS"
            if (stripos($depto['nombre'], 'PRODUCCION 40 LIBRAS') !== false) {
                foreach ($depto['empleados'] as $empleado) {
                    // Columna A: # (número consecutivo)
                    $sheet->setCellValue("A{$fila}", $numero);
                    
                    // Columna B: NOMBRE - Limpiar caracteres no deseados
                    $nombreLimpio = trim(str_replace(['|', '"', "'", "\n", "\r", "\t"], '', $empleado['nombre']));
                    $sheet->setCellValue("B{$fila}", $nombreLimpio);
                    
                    // Columna C: PUESTO - Agregar "40 LIBRAS"
                    $sheet->setCellValue("C{$fila}", '40 LIBRAS');
                    
                    // Columna G: TARJETA - Agregar neto_pagar del JSON con formato -$
                    if (isset($empleado['neto_pagar']) && !empty($empleado['neto_pagar']) && $empleado['neto_pagar'] != 0) {
                        $sheet->setCellValue("G{$fila}", '-$' . number_format($empleado['neto_pagar'], 2));
                    }
                    
                    // Función para obtener conceptos por código
                    $conceptos = $empleado['conceptos'] ?? [];
                    $getConcepto = function($codigo) use ($conceptos) {
                        $concepto = array_filter($conceptos, function($c) use ($codigo) {
                            return isset($c['codigo']) && $c['codigo'] == $codigo;
                        });
                        return !empty($concepto) ? array_values($concepto)[0]['resultado'] ?? 0 : 0;
                    };
                    
                    // Columna K: INFONAVIT (código 16)
                    $infonavit = $getConcepto('16');
                    if ($infonavit && $infonavit != 0) {
                        $sheet->setCellValue("K{$fila}", '-$' . number_format($infonavit, 2));
                    }
                    
                    // Columna L: ISR (código 45)
                    $isr = $getConcepto('45');
                    if ($isr && $isr != 0) {
                        $sheet->setCellValue("L{$fila}", '-$' . number_format($isr, 2));
                    }
                    
                    // Columna M: IMSS (código 52)
                    $imss = $getConcepto('52');
                    if ($imss && $imss != 0) {
                        $sheet->setCellValue("M{$fila}", '-$' . number_format($imss, 2));
                    }
                    
                    // Agregar altura a cada fila de datos para mejor espaciado
                    $sheet->getRowDimension($fila)->setRowHeight(25);
                    
                    // Aplicar bordes a toda la fila de datos y centrar contenido
                    $sheet->getStyle("A{$fila}:Q{$fila}")->applyFromArray([
                        'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
                        'alignment' => [
                            'horizontal' => Alignment::HORIZONTAL_CENTER, 
                            'vertical' => Alignment::VERTICAL_CENTER
                        ]
                    ]);
                    
                    // Alinear el nombre a la izquierda para mejor legibilidad
                    $sheet->getStyle("B{$fila}")->applyFromArray([
                        'alignment' => [
                            'horizontal' => Alignment::HORIZONTAL_LEFT, 
                            'vertical' => Alignment::VERTICAL_CENTER
                        ]
                    ]);
                    
                    $numero++;
                    $fila++;
                }
            }
        }
    }

    // Configuración de página basada en el número de empleados
    if ($totalEmpleados <= 40) {
        // Para 40 empleados o menos: ajustar a una sola página
        $sheet->getPageSetup()
            ->setFitToPage(true)
            ->setFitToWidth(1)
            ->setFitToHeight(1); // Forzar que todo quepa en una página
    } else {
        // Para más de 40 empleados: permitir múltiples páginas
        $sheet->getPageSetup()
            ->setFitToPage(true)
            ->setFitToWidth(1)
            ->setFitToHeight(0); // Sin límite de altura
    }

    // Enviar archivo
    header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    header('Content-Disposition: attachment; filename="nomina_saao.xlsx"');
    header('Cache-Control: max-age=0');

    $writer = new Xlsx($spreadsheet);
    $writer->save('php://output');
    exit;

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error al generar archivo: ' . $e->getMessage()]);
    exit;
}
