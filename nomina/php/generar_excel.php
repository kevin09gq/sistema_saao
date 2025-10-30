<?php

require '../../vendor/autoload.php';
include "../../conexion/conexion.php"; // Agregar conexión a la base de datos
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Writer\Pdf\Mpdf; // Exportar a PDF con mPDF
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\Drawing;
use PhpOffice\PhpSpreadsheet\Worksheet\PageSetup;

/***************
 * TABLA NOMINA CON SEGURO
 * ************** */

try {
    // Recibir el JSON global desde el cliente
    $payload = json_decode(file_get_contents('php://input'), true);

    // Separar datos recibidos
    $jsonGlobal   = $payload['datos'] ?? [];
    $tituloNomina = $payload['tituloNomina'] ?? 'NÓMINA';
    $tituloExcel  = $payload['tituloExcel'] ?? '';
    $formato      = strtolower($payload['formato'] ?? 'xlsx'); // 'xlsx' | 'pdf'
    // Función optimizada para validar si el empleado existe (solo COUNT)
    function validarEmpleadoExiste($claveEmpleado, $conexion)
    {
        $sql = $conexion->prepare("SELECT COUNT(*) as existe FROM info_empleados WHERE clave_empleado = ? AND id_status = 1");
        $sql->bind_param('s', $claveEmpleado);
        $sql->execute();
        $result = $sql->get_result();
        $row = $result->fetch_assoc();
        $sql->close();
        return $row['existe'] > 0; // Retorna true si existe, false si no
    }

    // Crear nueva hoja de cálculo
    $spreadsheet = new Spreadsheet();
    $sheet = $spreadsheet->getActiveSheet();
    $sheet->setTitle('Nómina SAAO');

    // Configurar página para impresión horizontal
    $sheet->getPageSetup()
        ->setOrientation(PageSetup::ORIENTATION_LANDSCAPE)
        ->setPaperSize(PageSetup::PAPERSIZE_A4)
        ->setHorizontalCentered(true)
        ->setVerticalCentered(false);

    // Configurar márgenes más pequeños para aprovechar mejor el espacio
    $sheet->getPageMargins()->setTop(0.3)->setRight(0.3)->setLeft(0.3)->setBottom(0.3);
    $sheet->getPageSetup()->setFitToWidth(1)->setFitToHeight(0);

    // Logo
    if (file_exists('../../public/img/logo.jpg')) {
        $logo = new Drawing();
        $logo->setName('Logo');
        $logo->setDescription('Logo CITRICOS SAAO');
        $logo->setPath('../../public/img/logo.jpg');
        $logo->setHeight(120);
        $logo->setCoordinates('A1');
        $logo->setOffsetX(10);
        $logo->setOffsetY(5);
        $logo->setWorksheet($sheet);
    }

    // Título principal centrado
    $sheet->mergeCells('B1:R1');
    $sheet->setCellValue('B1', 'PRODUCCION 40 LIBRAS');
    $sheet->getStyle('B1')->applyFromArray([
        'font' => ['bold' => true, 'size' => 16, 'color' => ['rgb' => '008000']],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER]
    ]);

    // Título de la empresa centrado
    $sheet->mergeCells('B2:R2');
    $sheet->setCellValue('B2', 'CITRICOS SAAO S.A DE C.V');
    $sheet->getStyle('B2')->applyFromArray([
        'font' => ['bold' => true, 'size' => 12, 'color' => ['rgb' => '008000']],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER]
    ]);

    // Título de nómina
    $sheet->mergeCells('B3:R3');
    $sheet->setCellValue('B3',  $tituloNomina);
    $sheet->getStyle('B3')->applyFromArray([
        'font' => ['bold' => true, 'size' => 14],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER]
    ]);

    // Información de semana
    $sheet->mergeCells('B4:R4');
    $sheet->setCellValue('B4', $tituloExcel);
    $sheet->getStyle('B4')->applyFromArray([
        'font' => ['bold' => true, 'size' => 12],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_RIGHT, 'vertical' => Alignment::VERTICAL_CENTER]
    ]);



    // Alturas de filas
    $sheet->getRowDimension('1')->setRowHeight(50);
    $sheet->getRowDimension('2')->setRowHeight(20);
    $sheet->getRowDimension('3')->setRowHeight(25);

    // Encabezados de la tabla
    $headers = [
        'A6' => '#',
        'B6' => 'CLAVE',
        'C6' => 'NOMBRE',
        'D6' => 'PUESTO',
        'E6' => "SUELDO\nNETO",
        'F6' => 'INCENTIVO',
        'G6' => 'EXTRA',
        'H6' => 'TARJETA',
        'I6' => 'PRÉSTAMO',
        'J6' => 'INASISTENCIAS',
        'K6' => 'UNIFORMES',
        'L6' => 'INFONAVIT',
        'M6' => 'ISR',
        'N6' => 'IMSS',
        'O6' => 'CHECADOR',
        'P6' => "F.A /\nGAFET/\nCOFIA",
        'Q6' => "SUELDO\nA\nCOBRAR",
        'R6' => "FIRMA\nRECIBIDO"
    ];

    $headerStyle = [
        'font' => ['bold' => true, 'size' => 10, 'color' => ['rgb' => '000000']],
        'alignment' => [
            'horizontal' => Alignment::HORIZONTAL_CENTER,
            'vertical' => Alignment::VERTICAL_CENTER,
            'wrapText' => true
        ],
        'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'FFFB00']],
        'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]]
    ];

    foreach ($headers as $cell => $header) {
        $sheet->setCellValue($cell, $header);
        $sheet->getStyle($cell)->applyFromArray($headerStyle);
    }

    $sheet->getRowDimension('6')->setRowHeight(50);

    // Ajustar ancho de columnas
    $sheet->getColumnDimension('A')->setWidth(5);
    $sheet->getColumnDimension('B')->setWidth(12);
    $sheet->getColumnDimension('C')->setWidth(40);
    $sheet->getColumnDimension('D')->setWidth(15);
    $sheet->getColumnDimension('J')->setWidth(15);

    $anchoUniforme = 12;
    foreach (['E', 'F', 'G', 'H', 'I', 'K', 'L', 'M', 'N', 'O', 'P', 'Q'] as $col) {
        $sheet->getColumnDimension($col)->setWidth($anchoUniforme);
    }
    $sheet->getColumnDimension('R')->setWidth(15);



    // Agregar los datos de empleados validados (USANDO DATOS DEL JSON)
    $fila = 7;
    $numero = 1;
    $totalEmpleados = 0;
    $empleadosNoEncontrados = [];

    if (isset($jsonGlobal['departamentos'])) {
        foreach ($jsonGlobal['departamentos'] as $depto) {
            if (stripos($depto['nombre'], 'PRODUCCION 40 LIBRAS') !== false) {
                foreach ($depto['empleados'] as $empleado) {
                    // Obtener la clave directamente
                    $claveEmpleado = $empleado['clave'] ?? null;

                    // VALIDAR si existe en BD, pero usar datos del JSON
                    if ($claveEmpleado && validarEmpleadoExiste($claveEmpleado, $conexion)) {
                        // El empleado existe en BD - usar datos del JSON
                        $sheet->setCellValue("A{$fila}", $numero);

                        // B: Clave del empleado
                        $sheet->setCellValueExplicit("B{$fila}", $claveEmpleado, \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);

                        // Usar nombre del JSON (limpiado)
                        $nombreLimpio = trim(str_replace(['|', '"', "'", "\n", "\r", "\t"], '', $empleado['nombre']));
                        $sheet->setCellValue("C{$fila}", $nombreLimpio);

                        $sheet->setCellValue("D{$fila}", '40 LIBRAS');

                        // Helper para colocar valor solo si != 0
                        $put = function (string $cell, $value) use ($sheet) {
                            if ($value !== null && $value !== '' && is_numeric($value)) {
                                $num = (float)$value;
                                if ($num != 0) {
                                    $sheet->setCellValue($cell, $num);
                                }
                            }
                        };

                        // E: Sueldo base (positivo)
                        $put("E{$fila}", $empleado['sueldo_base'] ?? null);

                        // F: Incentivo (positivo)
                        $put("F{$fila}", $empleado['incentivo'] ?? null);

                        // G: Extra (positivo)
                        $put("G{$fila}", $empleado['sueldo_extra_final'] ?? null);

                        // H: Tarjeta (deducción negativa)
                        if (isset($empleado['neto_pagar']) && $empleado['neto_pagar'] != 0) {
                            $put("H{$fila}", -1 * (float)$empleado['neto_pagar']);
                        }

                        // I: Préstamo (deducción)
                        if (isset($empleado['prestamo']) && $empleado['prestamo'] != 0) {
                            $put("I{$fila}", -1 * (float)$empleado['prestamo']);
                        }

                        // J: Inasistencias (deducción)
                        if (isset($empleado['inasistencias_descuento']) && $empleado['inasistencias_descuento'] != 0) {
                            $put("J{$fila}", -1 * (float)$empleado['inasistencias_descuento']);
                        }

                        // K: Uniformes (deducción)
                        if (isset($empleado['uniformes']) && $empleado['uniformes'] != 0) {
                            $put("K{$fila}", -1 * (float)$empleado['uniformes']);
                        }

                        // Conceptos
                        $conceptos = $empleado['conceptos'] ?? [];
                        $getConcepto = function ($codigo) use ($conceptos) {
                            foreach ($conceptos as $c) {
                                if (isset($c['codigo']) && $c['codigo'] == $codigo) {
                                    return (float)($c['resultado'] ?? 0);
                                }
                            }
                            return 0;
                        };

                        $infonavit = $getConcepto('16');
                        if ($infonavit != 0) $put("L{$fila}", -1 * $infonavit);

                        $isr = $getConcepto('45');
                        if ($isr != 0) $put("M{$fila}", -1 * $isr);

                        $imss = $getConcepto('52');
                        if ($imss != 0) $put("N{$fila}", -1 * $imss);

                        // O: Checador (deducción)
                        if (isset($empleado['checador']) && $empleado['checador'] != 0) {
                            $put("O{$fila}", -1 * (float)$empleado['checador']);
                        }

                        // P: F.A / GAFET / COFIA (deducción)
                        if (isset($empleado['fa_gafet_cofia']) && $empleado['fa_gafet_cofia'] != 0) {
                            $put("P{$fila}", -1 * (float)$empleado['fa_gafet_cofia']);
                        }

                        // Q: Sueldo a cobrar (fórmula que suma ingresos y resta deducciones)
                        $formula = "=SUM(E{$fila}:G{$fila}) - ABS(SUM(H{$fila}:P{$fila}))";
                        $sheet->setCellValueExplicit("Q{$fila}", $formula, \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_FORMULA);
                        $sheet->getStyle("Q{$fila}")->getNumberFormat()->setFormatCode('_("$"* #,##0.00_);_("$"* \(#,##0.00\);_("$"* "-"??_);_(@_)');

                        $sheet->getRowDimension($fila)->setRowHeight(25);

                        // Aplicar estilos
                        $sheet->getStyle("A{$fila}:R{$fila}")->applyFromArray([
                            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
                            'alignment' => [
                                'horizontal' => Alignment::HORIZONTAL_CENTER,
                                'vertical' => Alignment::VERTICAL_CENTER
                            ]
                        ]);

                        $sheet->getStyle("C{$fila}")->applyFromArray([
                            'alignment' => [
                                'horizontal' => Alignment::HORIZONTAL_LEFT,
                                'vertical' => Alignment::VERTICAL_CENTER
                            ]
                        ]);

                        $numero++;
                        $fila++;
                        $totalEmpleados++;
                    } else {
                        // Empleado no encontrado en BD o sin clave
                        $empleadosNoEncontrados[] = [
                            'clave' => $claveEmpleado ?? 'Sin clave',
                            'nombre' => $empleado['nombre'] ?? 'Sin nombre'
                        ];
                    }
                }
            }
        }
    }


    // Log de empleados no encontrados (para debugging)
    if (!empty($empleadosNoEncontrados)) {
        error_log("Empleados no encontrados en BD: " . json_encode($empleadosNoEncontrados));
    }

    // Configuración de página basada en el número de empleados
    if ($totalEmpleados <= 40) {
        $sheet->getPageSetup()
            ->setFitToPage(true)
            ->setFitToWidth(1)
            ->setFitToHeight(1);
    } else {
        $sheet->getPageSetup()
            ->setFitToPage(true)
            ->setFitToWidth(1)
            ->setFitToHeight(0);
    }

    // Colorear de rojo las columnas de deducciones: Tarjeta (H) a F.A / GAFET / COFIA (P)
    if ($totalEmpleados > 0) {
        $ultimaFilaEmpleados = $fila - 1;
        $sheet->getStyle("H7:P{$ultimaFilaEmpleados}")->getFont()->getColor()->setRGB('FF0000');
    }

    // Fila total (después del último empleado)
    $filaTotales = $fila;
    if ($totalEmpleados > 0) {
        $sheet->setCellValue("C{$filaTotales}", 'TOTAL');

        $columnasSumar = ['E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q'];
        foreach ($columnasSumar as $col) {
            // Fórmula que deja vacío si la suma es 0
            $sheet->setCellValue(
                "{$col}{$filaTotales}",
                "=IF(SUM({$col}6:{$col}" . ($filaTotales - 1) . ")=0,\"\",SUM({$col}6:{$col}" . ($filaTotales - 1) . "))"
            );
        }

        $sheet->getStyle("C{$filaTotales}:Q{$filaTotales}")->applyFromArray([
            'font' => ['bold' => true],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'D9EAD3']],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER]
        ]);
        $sheet->getStyle("C{$filaTotales}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);
        $sheet->getRowDimension($filaTotales)->setRowHeight(24);

        // También poner en rojo las mismas columnas en la fila TOTAL
        $sheet->getStyle("H{$filaTotales}:P{$filaTotales}")->getFont()->getColor()->setRGB('FF0000');
    }

    // Formato moneda
    $formatoMoneda = '"$"#,##0.00;-"$"#,##0.00';
    if ($totalEmpleados > 0) {
        foreach ($columnasSumar as $col) {
            $sheet->getStyle("{$col}6:{$col}{$filaTotales}")
                ->getNumberFormat()
                ->setFormatCode($formatoMoneda);
        }
    }


    /***************
     * TABLA NOMINA SIN SEGURO
     * ************** */

    // ---- CREAR HOJA DE NÓMINA SIN SEGURO ----
    $sheetSinSeguro = $spreadsheet->createSheet();
    $sheetSinSeguro->setTitle('Nómina Sin Seguro');

    // Configurar página para impresión horizontal
    $sheetSinSeguro->getPageSetup()
        ->setOrientation(PageSetup::ORIENTATION_LANDSCAPE)
        ->setPaperSize(PageSetup::PAPERSIZE_A4)
        ->setHorizontalCentered(true)
        ->setVerticalCentered(false);

    // Configurar márgenes más pequeños para aprovechar mejor el espacio
    $sheetSinSeguro->getPageMargins()->setTop(0.3)->setRight(0.3)->setLeft(0.3)->setBottom(0.3);
    $sheetSinSeguro->getPageSetup()->setFitToWidth(1)->setFitToHeight(0);

    // Logo
    if (file_exists('../../public/img/logo.jpg')) {
        $logoSinSeguro = new Drawing();
        $logoSinSeguro->setName('Logo');
        $logoSinSeguro->setDescription('Logo CITRICOS SAAO');
        $logoSinSeguro->setPath('../../public/img/logo.jpg');
        $logoSinSeguro->setHeight(120);
        $logoSinSeguro->setCoordinates('A1');
        $logoSinSeguro->setOffsetX(10);
        $logoSinSeguro->setOffsetY(5);
        $logoSinSeguro->setWorksheet($sheetSinSeguro);
    }

    // Título principal centrado
    $sheetSinSeguro->mergeCells('B1:R1');
    $sheetSinSeguro->setCellValue('B1', 'SIN SEGURO');
    $sheetSinSeguro->getStyle('B1')->applyFromArray([
        'font' => ['bold' => true, 'size' => 16, 'color' => ['rgb' => '008000']],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER]
    ]);

    // Título de la empresa centrado
    $sheetSinSeguro->mergeCells('B2:R2');
    $sheetSinSeguro->setCellValue('B2', 'CITRICOS SAAO S.A DE C.V');
    $sheetSinSeguro->getStyle('B2')->applyFromArray([
        'font' => ['bold' => true, 'size' => 12, 'color' => ['rgb' => '008000']],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER]
    ]);

    // Título de nómina
    $sheetSinSeguro->mergeCells('B3:R3');
    $sheetSinSeguro->setCellValue('B3', $tituloNomina);
    $sheetSinSeguro->getStyle('B3')->applyFromArray([
        'font' => ['bold' => true, 'size' => 14],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER]
    ]);

    // Información de semana
    $sheetSinSeguro->mergeCells('B4:R4');
    $sheetSinSeguro->setCellValue('B4', $tituloExcel);
    $sheetSinSeguro->getStyle('B4')->applyFromArray([
        'font' => ['bold' => true, 'size' => 12],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_RIGHT, 'vertical' => Alignment::VERTICAL_CENTER]
    ]);

    // Alturas de filas
    $sheetSinSeguro->getRowDimension('1')->setRowHeight(50);
    $sheetSinSeguro->getRowDimension('2')->setRowHeight(20);
    $sheetSinSeguro->getRowDimension('3')->setRowHeight(25);

    // Encabezados de la tabla (mismos que la hoja principal)
    foreach ($headers as $cell => $header) {
        $sheetSinSeguro->setCellValue($cell, $header);
        $sheetSinSeguro->getStyle($cell)->applyFromArray($headerStyle);
    }

    $sheetSinSeguro->getRowDimension('6')->setRowHeight(50);

    // Ajustar ancho de columnas (mismo que la hoja principal)
    $sheetSinSeguro->getColumnDimension('A')->setWidth(5);
    $sheetSinSeguro->getColumnDimension('B')->setWidth(12);
    $sheetSinSeguro->getColumnDimension('C')->setWidth(40);
    $sheetSinSeguro->getColumnDimension('D')->setWidth(15);
    $sheetSinSeguro->getColumnDimension('J')->setWidth(15);

    foreach (['E', 'F', 'G', 'H', 'I', 'K', 'L', 'M', 'N', 'O', 'P', 'Q'] as $col) {
        $sheetSinSeguro->getColumnDimension($col)->setWidth($anchoUniforme);
    }
    $sheetSinSeguro->getColumnDimension('R')->setWidth(15);

    // Variables para empleados sin seguro
    $filaSinSeguro = 7;
    $numeroSinSeguro = 1;
    $totalEmpleadosSinSeguro = 0;
    $empleadosNoEncontradosSinSeguro = [];

    // Agregar los datos de empleados sin seguro
    if (isset($jsonGlobal['departamentos'])) {
        foreach ($jsonGlobal['departamentos'] as $depto) {
            if (stripos($depto['nombre'], 'SIN SEGURO') !== false) {
                foreach ($depto['empleados'] as $empleado) {
                    // Obtener la clave directamente
                    $claveEmpleado = $empleado['clave'] ?? null;

                    // VALIDAR si existe en BD, pero usar datos del JSON
                    if ($claveEmpleado && validarEmpleadoExiste($claveEmpleado, $conexion)) {
                        // El empleado existe en BD - usar datos del JSON
                        $sheetSinSeguro->setCellValue("A{$filaSinSeguro}", $numeroSinSeguro);

                        // B: Clave del empleado
                        $sheetSinSeguro->setCellValueExplicit("B{$filaSinSeguro}", $claveEmpleado, \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);

                        // Usar nombre del JSON (limpiado)
                        $nombreLimpio = trim(str_replace(['|', '"', "'", "\n", "\r", "\t"], '', $empleado['nombre']));
                        $sheetSinSeguro->setCellValue("C{$filaSinSeguro}", $nombreLimpio);

                        $sheetSinSeguro->setCellValue("D{$filaSinSeguro}", 'SIN SEGURO');

                        // Helper para colocar valor solo si != 0 (reutilizar la función)
                        $putSinSeguro = function (string $cell, $value) use ($sheetSinSeguro) {
                            if ($value !== null && $value !== '' && is_numeric($value)) {
                                $num = (float)$value;
                                if ($num != 0) {
                                    $sheetSinSeguro->setCellValue($cell, $num);
                                }
                            }
                        };

                        // E: Sueldo base (positivo)
                        $putSinSeguro("E{$filaSinSeguro}", $empleado['sueldo_base'] ?? null);

                        // F: Incentivo (positivo)
                        $putSinSeguro("F{$filaSinSeguro}", $empleado['incentivo'] ?? null);

                        // G: Extra (positivo)
                        $putSinSeguro("G{$filaSinSeguro}", $empleado['sueldo_extra_final'] ?? null);

                        // H: Tarjeta (deducción negativa)
                        if (isset($empleado['neto_pagar']) && $empleado['neto_pagar'] != 0) {
                            $putSinSeguro("H{$filaSinSeguro}", -1 * (float)$empleado['neto_pagar']);
                        }

                        // I: Préstamo (deducción)
                        if (isset($empleado['prestamo']) && $empleado['prestamo'] != 0) {
                            $putSinSeguro("I{$filaSinSeguro}", -1 * (float)$empleado['prestamo']);
                        }

                        // J: Inasistencias (deducción)
                        if (isset($empleado['inasistencias_descuento']) && $empleado['inasistencias_descuento'] != 0) {
                            $putSinSeguro("J{$filaSinSeguro}", -1 * (float)$empleado['inasistencias_descuento']);
                        }

                        // K: Uniformes (deducción)
                        if (isset($empleado['uniformes']) && $empleado['uniformes'] != 0) {
                            $putSinSeguro("K{$filaSinSeguro}", -1 * (float)$empleado['uniformes']);
                        }

                        // Conceptos (reutilizar la función getConcepto)
                        $conceptosSinSeguro = $empleado['conceptos'] ?? [];
                        $getConceptoSinSeguro = function ($codigo) use ($conceptosSinSeguro) {
                            foreach ($conceptosSinSeguro as $c) {
                                if (isset($c['codigo']) && $c['codigo'] == $codigo) {
                                    return (float)($c['resultado'] ?? 0);
                                }
                            }
                            return 0;
                        };

                        $infonavitSinSeguro = $getConceptoSinSeguro('16');
                        if ($infonavitSinSeguro != 0) $putSinSeguro("L{$filaSinSeguro}", -1 * $infonavitSinSeguro);

                        $isrSinSeguro = $getConceptoSinSeguro('45');
                        if ($isrSinSeguro != 0) $putSinSeguro("M{$filaSinSeguro}", -1 * $isrSinSeguro);

                        $imssSinSeguro = $getConceptoSinSeguro('52');
                        if ($imssSinSeguro != 0) $putSinSeguro("N{$filaSinSeguro}", -1 * $imssSinSeguro);

                        // O: Checador (deducción)
                        if (isset($empleado['checador']) && $empleado['checador'] != 0) {
                            $putSinSeguro("O{$filaSinSeguro}", -1 * (float)$empleado['checador']);
                        }

                        // P: F.A / GAFET / COFIA (deducción)
                        if (isset($empleado['fa_gafet_cofia']) && $empleado['fa_gafet_cofia'] != 0) {
                            $putSinSeguro("P{$filaSinSeguro}", -1 * (float)$empleado['fa_gafet_cofia']);
                        }

                        // Q: Sueldo a cobrar (fórmula que suma ingresos y resta deducciones)
                        $formulaSinSeguro = "=SUM(E{$filaSinSeguro}:G{$filaSinSeguro}) - ABS(SUM(H{$filaSinSeguro}:P{$filaSinSeguro}))";
                        $sheetSinSeguro->setCellValueExplicit("Q{$filaSinSeguro}", $formulaSinSeguro, \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_FORMULA);
                        $sheetSinSeguro->getStyle("Q{$filaSinSeguro}")->getNumberFormat()->setFormatCode('_("$"* #,##0.00_);_("$"* \(#,##0.00\);_("$"* "-"??_);_(@_)');

                        $sheetSinSeguro->getRowDimension($filaSinSeguro)->setRowHeight(25);

                        // Aplicar estilos
                        $sheetSinSeguro->getStyle("A{$filaSinSeguro}:R{$filaSinSeguro}")->applyFromArray([
                            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
                            'alignment' => [
                                'horizontal' => Alignment::HORIZONTAL_CENTER,
                                'vertical' => Alignment::VERTICAL_CENTER
                            ]
                        ]);

                        $sheetSinSeguro->getStyle("C{$filaSinSeguro}")->applyFromArray([
                            'alignment' => [
                                'horizontal' => Alignment::HORIZONTAL_LEFT,
                                'vertical' => Alignment::VERTICAL_CENTER
                            ]
                        ]);

                        $numeroSinSeguro++;
                        $filaSinSeguro++;
                        $totalEmpleadosSinSeguro++;
                    } else {
                        // Empleado no encontrado en BD o sin clave
                        $empleadosNoEncontradosSinSeguro[] = [
                            'clave' => $claveEmpleado ?? 'Sin clave',
                            'nombre' => $empleado['nombre'] ?? 'Sin nombre'
                        ];
                    }
                }
            }
        }
    }

    // Log de empleados no encontrados sin seguro
    if (!empty($empleadosNoEncontradosSinSeguro)) {
        error_log("Empleados sin seguro no encontrados en BD: " . json_encode($empleadosNoEncontradosSinSeguro));
    }

    // Configuración de página basada en el número de empleados sin seguro
    if ($totalEmpleadosSinSeguro <= 40) {
        $sheetSinSeguro->getPageSetup()
            ->setFitToPage(true)
            ->setFitToWidth(1)
            ->setFitToHeight(1);
    } else {
        $sheetSinSeguro->getPageSetup()
            ->setFitToPage(true)
            ->setFitToWidth(1)
            ->setFitToHeight(0);
    }

    // Colorear de rojo las columnas de deducciones: Tarjeta (H) a F.A / GAFET / COFIA (P)
    if ($totalEmpleadosSinSeguro > 0) {
        $ultimaFilaEmpleadosSinSeguro = $filaSinSeguro - 1;
        $sheetSinSeguro->getStyle("H7:P{$ultimaFilaEmpleadosSinSeguro}")->getFont()->getColor()->setRGB('FF0000');
    }

    // Fila total sin seguro
    $filaTotalesSinSeguro = $filaSinSeguro;
    if ($totalEmpleadosSinSeguro > 0) {
        $sheetSinSeguro->setCellValue("C{$filaTotalesSinSeguro}", 'TOTAL');

        foreach ($columnasSumar as $col) {
            // Fórmula que deja vacío si la suma es 0
            $sheetSinSeguro->setCellValue(
                "{$col}{$filaTotalesSinSeguro}",
                "=IF(SUM({$col}6:{$col}" . ($filaTotalesSinSeguro - 1) . ")=0,\"\",SUM({$col}6:{$col}" . ($filaTotalesSinSeguro - 1) . "))"
            );
        }

        $sheetSinSeguro->getStyle("C{$filaTotalesSinSeguro}:Q{$filaTotalesSinSeguro}")->applyFromArray([
            'font' => ['bold' => true],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'D9EAD3']],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER]
        ]);
        $sheetSinSeguro->getStyle("C{$filaTotalesSinSeguro}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);
        $sheetSinSeguro->getRowDimension($filaTotalesSinSeguro)->setRowHeight(24);

        // También poner en rojo las mismas columnas en la fila TOTAL
        $sheetSinSeguro->getStyle("H{$filaTotalesSinSeguro}:P{$filaTotalesSinSeguro}")->getFont()->getColor()->setRGB('FF0000');
    }

    // Formato moneda para sin seguro
    if ($totalEmpleadosSinSeguro > 0) {
        foreach ($columnasSumar as $col) {
            $sheetSinSeguro->getStyle("{$col}6:{$col}{$filaTotalesSinSeguro}")
                ->getNumberFormat()
                ->setFormatCode($formatoMoneda);
        }
    }

    /***************
     * TABLA DISPERSIÓN TARJETA
     * ************** */


    // ---- CREAR HOJA DE DISPERSIÓN DE TARJETA ----
    // Crear una nueva hoja para la dispersión de tarjeta
    $sheetDispersion = $spreadsheet->createSheet();
    $sheetDispersion->setTitle('Dispersión de Tarjeta');

    // Variables para seguimiento
    $filaDispersion = 6;
    $numeroDispersion = 1;
    $totalTarjeta = 0;

    // Configuración de página para hoja de dispersión - Optimizada para A4
    $sheetDispersion->getPageSetup()
        ->setOrientation(PageSetup::ORIENTATION_LANDSCAPE)
        ->setPaperSize(PageSetup::PAPERSIZE_A4)
        ->setFitToPage(true)
        ->setFitToWidth(1)
        ->setFitToHeight(0)
        ->setHorizontalCentered(true)
        ->setVerticalCentered(false);
    // Eliminamos setPrintArea para evitar errores

    // Configurar márgenes para la hoja de dispersión (márgenes más pequeños para más espacio)
    $sheetDispersion->getPageMargins()
        ->setTop(0.4)
        ->setRight(0.4)
        ->setLeft(0.4)
        ->setBottom(0.4)
        ->setHeader(0.2)
        ->setFooter(0.2);

    // Logo en hoja de dispersión
    if (file_exists('../../public/img/logo.jpg')) {
        $logoDispersion = new Drawing();
        $logoDispersion->setName('Logo');
        $logoDispersion->setDescription('Logo CITRICOS SAAO');
        $logoDispersion->setPath('../../public/img/logo.jpg');
        $logoDispersion->setHeight(80); // Logo un poco más pequeño
        $logoDispersion->setCoordinates('A1');
        $logoDispersion->setOffsetX(10);
        $logoDispersion->setOffsetY(5);
        $logoDispersion->setWorksheet($sheetDispersion);
    }

    // Título "DISPERSIÓN DE TARJETA" centrado
    $sheetDispersion->mergeCells('B1:E1');
    $sheetDispersion->setCellValue('B1', 'DISPERSIÓN DE TARJETA');
    $sheetDispersion->getStyle('B1')->applyFromArray([
        'font' => ['bold' => true, 'size' => 16, 'color' => ['rgb' => '008000']],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER]
    ]);

    // Título de la empresa centrado
    $sheetDispersion->mergeCells('B2:E2');
    $sheetDispersion->setCellValue('B2', 'CITRICOS SAAO S.A DE C.V');
    $sheetDispersion->getStyle('B2')->applyFromArray([
        'font' => ['bold' => true, 'size' => 12, 'color' => ['rgb' => '008000']],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER]
    ]);

    // Información de semana
    $sheetDispersion->mergeCells('B3:E3');
    $sheetDispersion->setCellValue('B3', $tituloExcel);
    $sheetDispersion->getStyle('B3')->applyFromArray([
        'font' => ['bold' => true, 'size' => 12],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER]
    ]);

    // Alturas de filas para la hoja de dispersión
    $sheetDispersion->getRowDimension('1')->setRowHeight(30);
    $sheetDispersion->getRowDimension('2')->setRowHeight(20);
    $sheetDispersion->getRowDimension('3')->setRowHeight(20);

    // Encabezados de la tabla de dispersión
    $headersDispersion = [
        'A5' => '#',
        'B5' => 'CLAVE',
        'C5' => 'NOMBRE',
        'D5' => 'TARJETA',
        'E5' => 'DEPARTAMENTO'
    ];

    // Estilo para encabezados de tabla
    $headerStyleDispersion = [
        'font' => ['bold' => true, 'size' => 10, 'color' => ['rgb' => 'FFFFFF']],
        'alignment' => [
            'horizontal' => Alignment::HORIZONTAL_CENTER,
            'vertical' => Alignment::VERTICAL_CENTER,
            'wrapText' => true
        ],
        'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '428F49']],
        'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]]
    ];

    foreach ($headersDispersion as $cell => $header) {
        $sheetDispersion->setCellValue($cell, $header);
        $sheetDispersion->getStyle($cell)->applyFromArray($headerStyleDispersion);
    }

    $sheetDispersion->getRowDimension('5')->setRowHeight(25);

    // Ajustar ancho de columnas para dispersión - Optimizado para aprovechar más espacio horizontal
    $sheetDispersion->getColumnDimension('A')->setWidth(7);      // # (más ancho para números de 4 dígitos)
    $sheetDispersion->getColumnDimension('B')->setWidth(15);     // CLAVE (más ancho para claves largas)
    $sheetDispersion->getColumnDimension('C')->setWidth(40);     // NOMBRE (ajustado para equilibrar)
    $sheetDispersion->getColumnDimension('D')->setWidth(15);     // TARJETA
    $sheetDispersion->getColumnDimension('E')->setWidth(43);     // DEPARTAMENTO (ajustado para equilibrar)

    // Procesar empleados para la dispersión de tarjeta
    if (isset($jsonGlobal['departamentos'])) {
        foreach ($jsonGlobal['departamentos'] as $depto) {
            // Limpiar el nombre del departamento (quitar número inicial)
            $nombreDepto = $depto['nombre'] ?? 'Sin departamento';
            // Eliminar el número al inicio del nombre del departamento (ej: "1 Administracion" -> "Administracion")
            $nombreDepto = preg_replace('/^\d+\s+/', '', $nombreDepto);

            // EXCLUIR departamento SIN SEGURO de la dispersión de tarjeta
            if (stripos($depto['nombre'], 'SIN SEGURO') !== false) {
                continue; // Saltar este departamento
            }

            foreach ($depto['empleados'] as $empleado) {
                // Obtener la clave directamente
                $claveEmpleado = $empleado['clave'] ?? null;

                // Verificar que exista en la BD y esté activo
                if ($claveEmpleado && validarEmpleadoExiste($claveEmpleado, $conexion)) {
                    // Manejar caso donde neto_pagar es null
                    $montoTarjeta = 0;
                    if (isset($empleado['neto_pagar']) && $empleado['neto_pagar'] !== null) {
                        $montoTarjeta = (float)$empleado['neto_pagar'];
                    }

                    // Incluir todos los empleados, incluso los que tienen montoTarjeta = 0
                    $nombreLimpio = trim(str_replace(['|', '"', "'", "\n", "\r", "\t"], '', $empleado['nombre']));

                    // Agregar fila con datos - Usar formato numérico para el contador
                    $sheetDispersion->setCellValue("A{$filaDispersion}", $numeroDispersion);
                    $sheetDispersion->getStyle("A{$filaDispersion}")->getNumberFormat()->setFormatCode('0');

                    // Asegurarse que la clave se muestre como texto (por si tiene ceros al inicio)
                    $sheetDispersion->setCellValueExplicit("B{$filaDispersion}", $claveEmpleado, \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);

                    $sheetDispersion->setCellValue("C{$filaDispersion}", $nombreLimpio);
                    $sheetDispersion->setCellValue("D{$filaDispersion}", $montoTarjeta);
                    $sheetDispersion->setCellValue("E{$filaDispersion}", $nombreDepto);

                    // Aplicar estilos a la fila
                    $sheetDispersion->getStyle("A{$filaDispersion}:E{$filaDispersion}")->applyFromArray([
                        'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
                        'alignment' => [
                            'horizontal' => Alignment::HORIZONTAL_CENTER,
                            'vertical' => Alignment::VERTICAL_CENTER
                        ]
                    ]);

                    // Alinear el nombre a la izquierda
                    $sheetDispersion->getStyle("C{$filaDispersion}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);

                    // Formato moneda para la columna de tarjeta
                    $sheetDispersion->getStyle("D{$filaDispersion}")
                        ->getNumberFormat()
                        ->setFormatCode($formatoMoneda);

                    // Asegurar que la celda de nombre tenga formato especial para textos largos
                    $sheetDispersion->getStyle("C{$filaDispersion}")->getAlignment()->setWrapText(true);

                    // Aumentar altura de la fila para dar más espacio
                    $sheetDispersion->getRowDimension($filaDispersion)->setRowHeight(30);

                    // Incrementar contadores
                    $numeroDispersion++;
                    $filaDispersion++;
                    $totalTarjeta += $montoTarjeta; // Solo sumamos al total
                }
            }
        }
    }

    // Fila total de dispersión de tarjeta
    if ($numeroDispersion > 1) { // Si hay al menos un empleado
        // Cambiar la posición del total a la columna D (Tarjeta)
        $sheetDispersion->mergeCells("A{$filaDispersion}:C{$filaDispersion}");
        $sheetDispersion->setCellValue("A{$filaDispersion}", 'TOTAL:');

        // Usar fórmula de Excel para que se actualice automáticamente el total si se modifican valores
        $sheetDispersion->setCellValue("D{$filaDispersion}", "=SUM(D6:D" . ($filaDispersion - 1) . ")");

        // Dejar la columna de departamento vacía en la fila de totales
        $sheetDispersion->setCellValue("E{$filaDispersion}", "");

        // Estilos para la fila de totales
        $sheetDispersion->getStyle("A{$filaDispersion}:E{$filaDispersion}")->applyFromArray([
            'font' => ['bold' => true],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'D9EAD3']],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_RIGHT, 'vertical' => Alignment::VERTICAL_CENTER]
        ]);

        // Formato moneda para el total y alineación centrada
        $sheetDispersion->getStyle("D{$filaDispersion}")
            ->getNumberFormat()
            ->setFormatCode($formatoMoneda);
        $sheetDispersion->getStyle("D{$filaDispersion}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        $sheetDispersion->getRowDimension($filaDispersion)->setRowHeight(30);
    }

    // Después de terminar toda la dispersión, agregar pie de página con información
    $sheetDispersion->getHeaderFooter()
        ->setOddFooter('&L&B' . $tituloExcel . '&C&P de &N&R&D');

    // Establecer la repetición de filas de título en cada página impresa
    $sheetDispersion->getPageSetup()->setRowsToRepeatAtTopByStartAndEnd(5, 5);

    // Seleccionar primera hoja como activa antes de enviar
    $spreadsheet->setActiveSheetIndex(0);

    // Limpiar cualquier buffer de salida para evitar corrupción del archivo
    if (ob_get_contents()) ob_end_clean();

    // Enviar archivo (XLSX o PDF)
    if ($formato === 'pdf') {
        // Mantener mismas medidas que Excel: ya se configuró orientación, márgenes y FitToWidth
        $sheet->getPageSetup()->setFitToPage(true)->setFitToWidth(1)->setFitToHeight(0);

        header('Content-Type: application/pdf');
        $nombreDescarga = ($tituloExcel ? $tituloExcel : 'nomina_saao_validada') . '.pdf';
        header('Content-Disposition: attachment; filename="' . $nombreDescarga . '"');
        header('Cache-Control: max-age=0');

        $writer = new Mpdf($spreadsheet);
        $writer->save('php://output');
    } else {
        header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        $nombreDescarga = ($tituloExcel ? $tituloExcel : 'nomina_saao_validada') . '.xlsx';
        header('Content-Disposition: attachment; filename="' . $nombreDescarga . '"');
        header('Cache-Control: max-age=0');

        $writer = new Xlsx($spreadsheet);
        $writer->save('php://output');
    }
    exit;
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Error al generar archivo: ' . $e->getMessage()]);
    exit;
} finally {
    // Cerrar conexión si existe
    if (isset($conexion)) {
        $conexion->close();
    }
}
