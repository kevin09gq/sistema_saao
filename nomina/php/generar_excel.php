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
    $sheet->mergeCells('B1:U1');
    $sheet->setCellValue('B1', 'PRODUCCION 40 LIBRAS');
    $sheet->getStyle('B1')->applyFromArray([
        'font' => ['bold' => true, 'size' => 16, 'color' => ['rgb' => '008000']],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER]
    ]);

    // Título de la empresa centrado
    $sheet->mergeCells('B2:U2');
    $sheet->setCellValue('B2', 'CITRICOS SAAO S.A DE C.V');
    $sheet->getStyle('B2')->applyFromArray([
        'font' => ['bold' => true, 'size' => 12, 'color' => ['rgb' => '008000']],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER]
    ]);

    // Título de nómina
    $sheet->mergeCells('B3:U3');
    $sheet->setCellValue('B3',  $tituloNomina);
    $sheet->getStyle('B3')->applyFromArray([
        'font' => ['bold' => true, 'size' => 14],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER]
    ]);

    // Información de semana
    $sheet->mergeCells('B4:U4');
    $sheet->setCellValue('B4', $tituloExcel);
    $sheet->getStyle('B4')->applyFromArray([
        'font' => ['bold' => true, 'size' => 12],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_RIGHT, 'vertical' => Alignment::VERTICAL_CENTER]
    ]);

    // Alturas de filas
    $sheet->getRowDimension('1')->setRowHeight(50);
    $sheet->getRowDimension('2')->setRowHeight(20);
    $sheet->getRowDimension('3')->setRowHeight(25);

    // Encabezados de la tabla (nuevo formato solicitado)
    $headers = [
        'A6' => '#',
        'B6' => 'CLAVE',
        'C6' => 'NOMBRE',
        'D6' => 'PUESTO',
        'E6' => "SUELDO\nNETO",
        'F6' => 'INCENTIVO',
        'G6' => 'EXTRA',
        'H6' => 'ISR',
        'I6' => 'IMSS',
        'J6' => 'INFONAVIT',
        'K6' => 'INASISTENCIAS',
        'L6' => 'UNIFORMES',
        'M6' => 'CHECADOR',
        'N6' => "F.A /\nGAFET/\nCOFIA",
        'O6' => 'NETO A RECIBIR',
        'P6' => 'TARJETA',
        'Q6' => 'IMPORTE EN EFECTIVO',
        'R6' => 'PRÉSTAMO',
        'S6' => 'TOTAL A RECIBIR',
        'T6' => 'REDONDEO',
        'U6' => "TOTAL EFECTIVO\nREDONDEADO",
        'V6' => "FIRMA\nRECIBIDO"
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
    foreach (['E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V'] as $col) {
        $sheet->getColumnDimension($col)->setWidth($anchoUniforme);
    }
    $sheet->getColumnDimension('U')->setWidth(15);
    $sheet->getColumnDimension('V')->setWidth(15);



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

                        // Conceptos e imputación a nuevas columnas según nuevo formato
                        // Conceptos extraídos
                        $conceptos = $empleado['conceptos'] ?? [];
                        $getConcepto = function ($codigo) use ($conceptos) {
                            foreach ($conceptos as $c) {
                                if (isset($c['codigo']) && $c['codigo'] == $codigo) {
                                    return (float)($c['resultado'] ?? 0);
                                }
                            }
                            return 0;
                        };

                        // H: ISR (deducción desde conceptos)
                        $isr = $getConcepto('45');
                        if ($isr != 0) $put("H{$fila}", -1 * $isr);

                        // I: IMSS
                        $imss = $getConcepto('52');
                        if ($imss != 0) $put("I{$fila}", -1 * $imss);

                        // J: INFONAVIT
                        $infonavit = $getConcepto('16');
                        if ($infonavit != 0) $put("J{$fila}", -1 * $infonavit);

                        // K: Inasistencias (deducción)
                        if (isset($empleado['inasistencias_descuento']) && $empleado['inasistencias_descuento'] != 0) {
                            $put("K{$fila}", -1 * (float)$empleado['inasistencias_descuento']);
                        }

                        // L: Uniformes (deducción)
                        if (isset($empleado['uniformes']) && $empleado['uniformes'] != 0) {
                            $put("L{$fila}", -1 * (float)$empleado['uniformes']);
                        }

                        // M: Checador (deducción)
                        if (isset($empleado['checador']) && $empleado['checador'] != 0) {
                            $put("M{$fila}", -1 * (float)$empleado['checador']);
                        }

                        // N: F.A / GAFET / COFIA (deducción)
                        if (isset($empleado['fa_gafet_cofia']) && $empleado['fa_gafet_cofia'] != 0) {
                            $put("N{$fila}", -1 * (float)$empleado['fa_gafet_cofia']);
                        }

                        // O: NETO A RECIBIR (autosuma de E:G menos deducciones H:N)
                        $formulaNeto = "=SUM(E{$fila}:G{$fila}) - ABS(SUM(H{$fila}:N{$fila}))";
                        $sheet->setCellValueExplicit("O{$fila}", $formulaNeto, \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_FORMULA);
                        $sheet->getStyle("O{$fila}")->getNumberFormat()->setFormatCode('_("$"* #,##0.00_);_("$"* \(#,##0.00\);_("$"* "-"??_);_(@_)');

                        // P: Tarjeta (deducción negativa)
                        if (isset($empleado['neto_pagar']) && $empleado['neto_pagar'] != 0) {
                            $put("P{$fila}", -1 * (float)$empleado['neto_pagar']);
                        }

                        // Q: IMPORTE EN EFECTIVO = NETO A RECIBIR - TARJETA (usar autosuma)
                        $formulaImporte = "=SUM(O{$fila}, -ABS(P{$fila}))";
                        $sheet->setCellValueExplicit("Q{$fila}", $formulaImporte, \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_FORMULA);
                        $sheet->getStyle("Q{$fila}")->getNumberFormat()->setFormatCode('_("$"* #,##0.00_);_("$"* \(#,##0.00\);_("$"* "-"??_);_(@_)');

                        // R: Préstamo (deducción)
                        if (isset($empleado['prestamo']) && $empleado['prestamo'] != 0) {
                            $put("R{$fila}", -1 * (float)$empleado['prestamo']);
                        }

                        // S: TOTAL A RECIBIR = IMPORTE EN EFECTIVO - PRÉSTAMO
                        $formulaTotalRecibir = "=SUM(Q{$fila}, -ABS(R{$fila}))";
                        $sheet->setCellValueExplicit("S{$fila}", $formulaTotalRecibir, \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_FORMULA);
                        $sheet->getStyle("S{$fila}")->getNumberFormat()->setFormatCode('_("$"* #,##0.00_);_("$"* \(#,##0.00\);_("$"* "-"??_);_(@_)');

                        // T: REDONDEO (cantidad de redondeo desde JSON)
                        $redondeoCantidad = isset($empleado['redondeo_cantidad']) ? (float)$empleado['redondeo_cantidad'] : 0;
                        if ($redondeoCantidad != 0) {
                            $sheet->setCellValue("T{$fila}", $redondeoCantidad);
                            $sheet->getStyle("T{$fila}")->getNumberFormat()->setFormatCode('"$"#,##0.00;"$"-#,##0.00');
                            // Color rojo para cantidades negativas
                            if ($redondeoCantidad < 0) {
                                $sheet->getStyle("T{$fila}")->getFont()->getColor()->setRGB('FF0000');
                            }
                        } else {
                            $sheet->setCellValue("T{$fila}", '');
                        }

                        // U: TOTAL EFECTIVO REDONDEADO (TOTAL A RECIBIR + REDONDEO)
                        $formulaTotalRedondeado = "=ROUND(S{$fila} + IF(T{$fila}<>\"\", T{$fila}, 0), 2)";
                        $sheet->setCellValueExplicit("U{$fila}", $formulaTotalRedondeado, \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_FORMULA);
                        $sheet->getStyle("U{$fila}")->getNumberFormat()->setFormatCode('_("$"* #,##0.00_);_("$"* \(#,##0.00\);_("$"* "-"??_);_(@_)');

                        // V: Firma recibido (vacío)
                        $sheet->setCellValue("V{$fila}", '');

                        $sheet->getRowDimension($fila)->setRowHeight(25);

                        // Aplicar estilos
                        $sheet->getStyle("A{$fila}:V{$fila}")->applyFromArray([
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

                        // Asegurar borde específico para la columna FIRMA RECIBIDO (V)
                        $sheet->getStyle("V{$fila}")->applyFromArray([
                            'borders' => [
                                'top' => ['borderStyle' => Border::BORDER_THIN],
                                'right' => ['borderStyle' => Border::BORDER_THIN],
                                'bottom' => ['borderStyle' => Border::BORDER_THIN],
                                'left' => ['borderStyle' => Border::BORDER_THIN]
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

    // Colorear de rojo las columnas de deducciones: deducciones principales (H:N) y tarjeta/préstamo (P:R)
    if ($totalEmpleados > 0) {
        $ultimaFilaEmpleados = $fila - 1;
        $sheet->getStyle("H7:N{$ultimaFilaEmpleados}")->getFont()->getColor()->setRGB('FF0000');
        $sheet->getStyle("P7:P{$ultimaFilaEmpleados}")->getFont()->getColor()->setRGB('FF0000');
        $sheet->getStyle("R7:R{$ultimaFilaEmpleados}")->getFont()->getColor()->setRGB('FF0000');
    }

    // Fila total (después del último empleado)
    $filaTotales = $fila;
    if ($totalEmpleados > 0) {
        $sheet->setCellValue("C{$filaTotales}", 'TOTAL');

        $columnasSumar = ['E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U'];
        foreach ($columnasSumar as $col) {
            // Fórmula que deja vacío si la suma es 0
            $sheet->setCellValue(
                "{$col}{$filaTotales}",
                "=IF(SUM({$col}6:{$col}" . ($filaTotales - 1) . ")=0,\"\",SUM({$col}6:{$col}" . ($filaTotales - 1) . "))"
            );
        }

        $sheet->getStyle("C{$filaTotales}:U{$filaTotales}")->applyFromArray([
            'font' => ['bold' => true],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'D9EAD3']],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER]
        ]);
        $sheet->getStyle("C{$filaTotales}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);
        
        // Asegurar borde específico para la columna TOTAL EFECTIVO REDONDEADO (U) en totales
        $sheet->getStyle("U{$filaTotales}")->applyFromArray([
            'borders' => [
                'top' => ['borderStyle' => Border::BORDER_THIN],
                'right' => ['borderStyle' => Border::BORDER_THIN],
                'bottom' => ['borderStyle' => Border::BORDER_THIN],
                'left' => ['borderStyle' => Border::BORDER_THIN]
            ]
        ]);

        $sheet->getRowDimension($filaTotales)->setRowHeight(24);

        // También poner en rojo las mismas columnas en la fila TOTAL
        $sheet->getStyle("H{$filaTotales}:N{$filaTotales}")->getFont()->getColor()->setRGB('FF0000');
        $sheet->getStyle("P{$filaTotales}:P{$filaTotales}")->getFont()->getColor()->setRGB('FF0000');
        $sheet->getStyle("R{$filaTotales}:R{$filaTotales}")->getFont()->getColor()->setRGB('FF0000');
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
     * TABLA NOMINA 10 LIBRAS
     * ************** */

    // ---- CREAR HOJA DE NÓMINA 10 LIBRAS ----
    $sheet10 = $spreadsheet->createSheet();
    $sheet10->setTitle('Nómina 10 Libras');

    // Configurar página para impresión horizontal
    $sheet10->getPageSetup()
        ->setOrientation(PageSetup::ORIENTATION_LANDSCAPE)
        ->setPaperSize(PageSetup::PAPERSIZE_A4)
        ->setHorizontalCentered(true)
        ->setVerticalCentered(false);

    // Márgenes
    $sheet10->getPageMargins()->setTop(0.3)->setRight(0.3)->setLeft(0.3)->setBottom(0.3);
    $sheet10->getPageSetup()->setFitToWidth(1)->setFitToHeight(0);

    // Logo
    if (file_exists('../../public/img/logo.jpg')) {
        $logo10 = new Drawing();
        $logo10->setName('Logo');
        $logo10->setDescription('Logo CITRICOS SAAO');
        $logo10->setPath('../../public/img/logo.jpg');
        $logo10->setHeight(120);
        $logo10->setCoordinates('A1');
        $logo10->setOffsetX(10);
        $logo10->setOffsetY(5);
        $logo10->setWorksheet($sheet10);
    }

    // Título principal centrado
    $sheet10->mergeCells('B1:T1');
    $sheet10->setCellValue('B1', 'PRODUCCIÓN 10 LIBRAS');
    $sheet10->getStyle('B1')->applyFromArray([
        'font' => ['bold' => true, 'size' => 16, 'color' => ['rgb' => '008000']],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER]
    ]);

    // Título empresa
    $sheet10->mergeCells('B2:T2');
    $sheet10->setCellValue('B2', 'CITRICOS SAAO S.A DE C.V');
    $sheet10->getStyle('B2')->applyFromArray([
        'font' => ['bold' => true, 'size' => 12, 'color' => ['rgb' => '008000']],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER]
    ]);

    // Título de nómina
    $sheet10->mergeCells('B3:T3');
    $sheet10->setCellValue('B3', $tituloNomina);
    $sheet10->getStyle('B3')->applyFromArray([
        'font' => ['bold' => true, 'size' => 14],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER]
    ]);

    // Información de semana
    $sheet10->mergeCells('B4:T4');
    $sheet10->setCellValue('B4', $tituloExcel);
    $sheet10->getStyle('B4')->applyFromArray([
        'font' => ['bold' => true, 'size' => 12],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_RIGHT, 'vertical' => Alignment::VERTICAL_CENTER]
    ]);

    // Alturas y encabezados
    $sheet10->getRowDimension('1')->setRowHeight(50);
    $sheet10->getRowDimension('2')->setRowHeight(20);
    $sheet10->getRowDimension('3')->setRowHeight(25);
   
    // Encabezados de la tabla (nuevo formato solicitado)
    $headers10 = [
        'A6' => '#',
        'B6' => 'CLAVE',
        'C6' => 'NOMBRE',
        'D6' => 'PUESTO',
        'E6' => "SUELDO\nNETO",
        'F6' => 'INCENTIVO',
        'G6' => 'EXTRA',
        'H6' => 'ISR',
        'I6' => 'IMSS',
        'J6' => 'INFONAVIT',
        'K6' => 'INASISTENCIAS',
        'L6' => 'UNIFORMES',
        'M6' => 'CHECADOR',
        'N6' => "F.A /\nGAFET/\nCOFIA",
        'O6' => 'NETO A RECIBIR',
        'P6' => 'TARJETA',
        'Q6' => 'IMPORTE EN EFECTIVO',
        'R6' => 'PRÉSTAMO',
        'S6' => 'TOTAL A RECIBIR',
        'T6' => 'REDONDEO',
        'U6' => "TOTAL EFECTIVO\nREDONDEADO",
        'V6' => "FIRMA\nRECIBIDO"
    ];

    $headerStyle10 = [
        'font' => ['bold' => true, 'size' => 10, 'color' => ['rgb' => '000000']],
        'alignment' => [
            'horizontal' => Alignment::HORIZONTAL_CENTER,
            'vertical' => Alignment::VERTICAL_CENTER,
            'wrapText' => true
        ],
        'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'FFFB00']],
        'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]]
    ];

    foreach ($headers10 as $cell => $header10) {
        $sheet10->setCellValue($cell, $header10);
        $sheet10->getStyle($cell)->applyFromArray($headerStyle10);
    }

    $sheet10->getRowDimension('6')->setRowHeight(50);
    // Ajustar ancho de columnas
    $sheet10->getColumnDimension('A')->setWidth(5);
    $sheet10->getColumnDimension('B')->setWidth(12);
    $sheet10->getColumnDimension('C')->setWidth(40);
    $sheet10->getColumnDimension('D')->setWidth(15);
    $sheet10->getColumnDimension('J')->setWidth(15);

    $anchoUniforme10 = 12;
    foreach (['E', 'F', 'G', 'H', 'I', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V'] as $col) {
        $sheet10->getColumnDimension($col)->setWidth($anchoUniforme10);
    }
    $sheet10->getColumnDimension('U')->setWidth(15);
    $sheet10->getColumnDimension('V')->setWidth(15);



    // Variables
    $fila10 = 7;
    $numero10 = 1;
    $total10 = 0;
    $empleadosNoEncontrados10 = [];

    // Agregar datos de empleados del departamento 10 LIBRAS
    if (isset($jsonGlobal['departamentos'])) {
        foreach ($jsonGlobal['departamentos'] as $depto) {
            if (stripos($depto['nombre'], 'PRODUCCION 10 LIBRAS') !== false) {
                foreach ($depto['empleados'] as $empleado) {
                    // Obtener la clave directamente
                    $claveEmpleado = $empleado['clave'] ?? null;

                    // VALIDAR si existe en BD, pero usar datos del JSON
                    if ($claveEmpleado && validarEmpleadoExiste($claveEmpleado, $conexion)) {
                        // El empleado existe en BD - usar datos del JSON
                        $sheet10->setCellValue("A{$fila10}", $numero10);

                        // B: Clave del empleado
                        $sheet10->setCellValueExplicit("B{$fila10}", $claveEmpleado, \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);

                        // Usar nombre del JSON (limpiado)
                        $nombreLimpio = trim(str_replace(['|', '"', "'", "\n", "\r", "\t"], '', $empleado['nombre']));
                        $sheet10->setCellValue("C{$fila10}", $nombreLimpio);

                        $sheet10->setCellValue("D{$fila10}", '10 LIBRAS');

                        // Helper para colocar valor solo si != 0
                        $put10 = function (string $cell, $value) use ($sheet10) {
                            if ($value !== null && $value !== '' && is_numeric($value)) {
                                $num = (float)$value;
                                if ($num != 0) {
                                    $sheet10->setCellValue($cell, $num);
                                }
                            }
                        };

                        // E: Sueldo base (positivo)
                        $put10("E{$fila10}", $empleado['sueldo_base'] ?? null);

                        // F: Incentivo (positivo)
                        $put10("F{$fila10}", $empleado['incentivo'] ?? null);

                        // G: Extra (positivo)
                        $put10("G{$fila10}", $empleado['sueldo_extra_final'] ?? null);

                        // Conceptos e imputación a nuevas columnas según nuevo formato
                        $conceptos10 = $empleado['conceptos'] ?? [];
                        $getConcepto10 = function ($codigo) use ($conceptos10) {
                            foreach ($conceptos10 as $c) {
                                if (isset($c['codigo']) && $c['codigo'] == $codigo) {
                                    return (float)($c['resultado'] ?? 0);
                                }
                            }
                            return 0;
                        };

                        // H: ISR
                        $isr10 = $getConcepto10('45');
                        if ($isr10 != 0) $put10("H{$fila10}", -1 * $isr10);

                        // I: IMSS
                        $imss10 = $getConcepto10('52');
                        if ($imss10 != 0) $put10("I{$fila10}", -1 * $imss10);

                        // J: INFONAVIT
                        $infonavit10 = $getConcepto10('16');
                        if ($infonavit10 != 0) $put10("J{$fila10}", -1 * $infonavit10);

                        // K: Inasistencias
                        if (isset($empleado['inasistencias_descuento']) && $empleado['inasistencias_descuento'] != 0) {
                            $put10("K{$fila10}", -1 * (float)$empleado['inasistencias_descuento']);
                        }

                        // L: Uniformes
                        if (isset($empleado['uniformes']) && $empleado['uniformes'] != 0) {
                            $put10("L{$fila10}", -1 * (float)$empleado['uniformes']);
                        }

                        // M: Checador
                        if (isset($empleado['checador']) && $empleado['checador'] != 0) {
                            $put10("M{$fila10}", -1 * (float)$empleado['checador']);
                        }

                        // N: F.A / GAFET / COFIA
                        if (isset($empleado['fa_gafet_cofia']) && $empleado['fa_gafet_cofia'] != 0) {
                            $put10("N{$fila10}", -1 * (float)$empleado['fa_gafet_cofia']);
                        }

                        // O: NETO A RECIBIR (autosuma de E:G menos deducciones H:N)
                        $formulaNeto10 = "=SUM(E{$fila10}:G{$fila10}) - ABS(SUM(H{$fila10}:N{$fila10}))";
                        $sheet10->setCellValueExplicit("O{$fila10}", $formulaNeto10, \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_FORMULA);
                        $sheet10->getStyle("O{$fila10}")->getNumberFormat()->setFormatCode('_("$"* #,##0.00_);_("$"* \(#,##0.00\);_("$"* "-"??_);_(@_)');

                        // P: Tarjeta (neto_pagar)
                        if (isset($empleado['neto_pagar']) && $empleado['neto_pagar'] != 0) {
                            $put10("P{$fila10}", -1 * (float)$empleado['neto_pagar']);
                        }

                        // Q: IMPORTE EN EFECTIVO = NETO A RECIBIR - TARJETA (usar autosuma)
                        $formulaImporte10 = "=SUM(O{$fila10}, -ABS(P{$fila10}))";
                        $sheet10->setCellValueExplicit("Q{$fila10}", $formulaImporte10, \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_FORMULA);
                        $sheet10->getStyle("Q{$fila10}")->getNumberFormat()->setFormatCode('_("$"* #,##0.00_);_("$"* \(#,##0.00\);_("$"* "-"??_);_(@_)');

                        // R: Préstamo
                        if (isset($empleado['prestamo']) && $empleado['prestamo'] != 0) {
                            $put10("R{$fila10}", -1 * (float)$empleado['prestamo']);
                        }

                        // S: TOTAL A RECIBIR = IMPORTE EN EFECTIVO - PRÉSTAMO
                        $formulaTotalRecibir10 = "=SUM(Q{$fila10}, -ABS(R{$fila10}))";
                        $sheet10->setCellValueExplicit("S{$fila10}", $formulaTotalRecibir10, \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_FORMULA);
                        $sheet10->getStyle("S{$fila10}")->getNumberFormat()->setFormatCode('_("$"* #,##0.00_);_("$"* \(#,##0.00\);_("$"* "-"??_);_(@_)');

                        // T: REDONDEO (cantidad de redondeo desde JSON)
                        $redondeoCantidad10 = isset($empleado['redondeo_cantidad']) ? (float)$empleado['redondeo_cantidad'] : 0;
                        if ($redondeoCantidad10 != 0) {
                            $sheet10->setCellValue("T{$fila10}", $redondeoCantidad10);
                            $sheet10->getStyle("T{$fila10}")->getNumberFormat()->setFormatCode('"$"#,##0.00;"$"-#,##0.00');
                            // Color rojo para cantidades negativas
                            if ($redondeoCantidad10 < 0) {
                                $sheet10->getStyle("T{$fila10}")->getFont()->getColor()->setRGB('FF0000');
                            }
                        } else {
                            $sheet10->setCellValue("T{$fila10}", '');
                        }

                        // U: TOTAL EFECTIVO REDONDEADO (TOTAL A RECIBIR + REDONDEO)
                        $formulaTotalRedondeado10 = "=ROUND(S{$fila10} + IF(T{$fila10}<>\"\", T{$fila10}, 0), 2)";
                        $sheet10->setCellValueExplicit("U{$fila10}", $formulaTotalRedondeado10, \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_FORMULA);
                        $sheet10->getStyle("U{$fila10}")->getNumberFormat()->setFormatCode('_("$"* #,##0.00_);_("$"* \(#,##0.00\);_("$"* "-"??_);_(@_)');

                        // V: Firma recibido (vacío)
                        $sheet10->setCellValue("V{$fila10}", '');

                        $sheet10->getRowDimension($fila10)->setRowHeight(25);

                        // Aplicar estilos
                        $sheet10->getStyle("A{$fila10}:V{$fila10}")->applyFromArray([
                            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
                            'alignment' => [
                                'horizontal' => Alignment::HORIZONTAL_CENTER,
                                'vertical' => Alignment::VERTICAL_CENTER
                            ]
                        ]);

                        $sheet10->getStyle("C{$fila10}")->applyFromArray([
                            'alignment' => [
                                'horizontal' => Alignment::HORIZONTAL_LEFT,
                                'vertical' => Alignment::VERTICAL_CENTER
                            ]
                        ]);

                        // Asegurar borde específico para la columna FIRMA RECIBIDO (V)
                        $sheet10->getStyle("V{$fila10}")->applyFromArray([
                            'borders' => [
                                'top' => ['borderStyle' => Border::BORDER_THIN],
                                'right' => ['borderStyle' => Border::BORDER_THIN],
                                'bottom' => ['borderStyle' => Border::BORDER_THIN],
                                'left' => ['borderStyle' => Border::BORDER_THIN]
                            ]
                        ]);


                        $numero10++;
                        $fila10++;
                        $total10++;
                    } else {
                        // Empleado no encontrado en BD o sin clave
                        $empleadosNoEncontrados10[] = [
                            'clave' => $claveEmpleado ?? 'Sin clave',
                            'nombre' => $empleado['nombre'] ?? 'Sin nombre'
                        ];
                    }
                }
            }
        }
    }
    
    // Log de empleados no encontrados (para debugging)
    if (!empty($empleadosNoEncontrados10)) {
        error_log("Empleados 10 LIBRAS no encontrados en BD: " . json_encode($empleadosNoEncontrados10));
    }

    // Configuración de página basada en el número de empleados
    if ($total10 <= 40) {
        $sheet10->getPageSetup()
            ->setFitToPage(true)
            ->setFitToWidth(1)
            ->setFitToHeight(1);
    } else {
        $sheet10->getPageSetup()
            ->setFitToPage(true)
            ->setFitToWidth(1)
            ->setFitToHeight(0);
    }

    // Colorear de rojo las columnas de deducciones: deducciones principales (H:N) y tarjeta/préstamo (P:R)
    if ($total10 > 0) {
        $ultimaFilaEmpleados10 = $fila10 - 1;
        $sheet10->getStyle("H7:N{$ultimaFilaEmpleados10}")->getFont()->getColor()->setRGB('FF0000');
        $sheet10->getStyle("P7:P{$ultimaFilaEmpleados10}")->getFont()->getColor()->setRGB('FF0000');
        $sheet10->getStyle("R7:R{$ultimaFilaEmpleados10}")->getFont()->getColor()->setRGB('FF0000');
    }

    // Fila total (después del último empleado)
    $filaTotales10 = $fila10;
    if ($total10 > 0) {
        $sheet10->setCellValue("C{$filaTotales10}", 'TOTAL');

        $columnasSumar10 = ['E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U'];
        foreach ($columnasSumar10 as $col) {
            // Fórmula que deja vacío si la suma es 0
            $sheet10->setCellValue(
                "{$col}{$filaTotales10}",
                "=IF(SUM({$col}6:{$col}" . ($filaTotales10 - 1) . ")=0,\"\",SUM({$col}6:{$col}" . ($filaTotales10 - 1) . "))"
            );
        }

        $sheet10->getStyle("C{$filaTotales10}:U{$filaTotales10}")->applyFromArray([
            'font' => ['bold' => true],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'D9EAD3']],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER]
        ]);
        $sheet10->getStyle("C{$filaTotales10}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);
        
        // Asegurar borde específico para la columna TOTAL EFECTIVO REDONDEADO (U) en totales
        $sheet10->getStyle("U{$filaTotales10}")->applyFromArray([
            'borders' => [
                'top' => ['borderStyle' => Border::BORDER_THIN],
                'right' => ['borderStyle' => Border::BORDER_THIN],
                'bottom' => ['borderStyle' => Border::BORDER_THIN],
                'left' => ['borderStyle' => Border::BORDER_THIN]
            ]
        ]);

        $sheet10->getRowDimension($filaTotales10)->setRowHeight(24);

        // También poner en rojo las mismas columnas en la fila TOTAL
        $sheet10->getStyle("H{$filaTotales10}:N{$filaTotales10}")->getFont()->getColor()->setRGB('FF0000');
        $sheet10->getStyle("P{$filaTotales10}:P{$filaTotales10}")->getFont()->getColor()->setRGB('FF0000');
        $sheet10->getStyle("R{$filaTotales10}:R{$filaTotales10}")->getFont()->getColor()->setRGB('FF0000');
    }

    // Formato moneda
    if ($total10 > 0) {
        foreach ($columnasSumar10 as $col) {
            $sheet10->getStyle("{$col}6:{$col}{$filaTotales10}")
                ->getNumberFormat()
                ->setFormatCode($formatoMoneda);
        }
    }


    

    /***************
     * TABLA NOMINA SIN SEGURO 40 LIBRAS
     * ************** */

    // ---- CREAR HOJA DE NÓMINA SIN SEGURO 40 LIBRAS ----
    $sheetSinSeguro40 = $spreadsheet->createSheet();
    $sheetSinSeguro40->setTitle('Sin Seguro 40 Libras');

    // Configurar página para impresión horizontal
    $sheetSinSeguro40->getPageSetup()
        ->setOrientation(PageSetup::ORIENTATION_LANDSCAPE)
        ->setPaperSize(PageSetup::PAPERSIZE_A4)
        ->setHorizontalCentered(true)
        ->setVerticalCentered(false);

    $sheetSinSeguro40->getPageMargins()->setTop(0.3)->setRight(0.3)->setLeft(0.3)->setBottom(0.3);
    $sheetSinSeguro40->getPageSetup()->setFitToWidth(1)->setFitToHeight(0);

    // Logo
    if (file_exists('../../public/img/logo.jpg')) {
        $logoSinSeguro40 = new Drawing();
        $logoSinSeguro40->setName('Logo');
        $logoSinSeguro40->setDescription('Logo CITRICOS SAAO');
        $logoSinSeguro40->setPath('../../public/img/logo.jpg');
        $logoSinSeguro40->setHeight(120);
        $logoSinSeguro40->setCoordinates('A1');
        $logoSinSeguro40->setOffsetX(10);
        $logoSinSeguro40->setOffsetY(5);
        $logoSinSeguro40->setWorksheet($sheetSinSeguro40);
    }

    // Título principal centrado
    $sheetSinSeguro40->mergeCells('B1:V1');
    $sheetSinSeguro40->setCellValue('B1', 'SIN SEGURO 40 LIBRAS');
    $sheetSinSeguro40->getStyle('B1')->applyFromArray([
        'font' => ['bold' => true, 'size' => 16, 'color' => ['rgb' => '008000']],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER]
    ]);

    // Título de la empresa centrado
    $sheetSinSeguro40->mergeCells('B2:V2');
    $sheetSinSeguro40->setCellValue('B2', 'CITRICOS SAAO S.A DE C.V');
    $sheetSinSeguro40->getStyle('B2')->applyFromArray([
        'font' => ['bold' => true, 'size' => 12, 'color' => ['rgb' => '008000']],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER]
    ]);

    // Título de nómina
    $sheetSinSeguro40->mergeCells('B3:V3');
    $sheetSinSeguro40->setCellValue('B3', $tituloNomina);
    $sheetSinSeguro40->getStyle('B3')->applyFromArray([
        'font' => ['bold' => true, 'size' => 14],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER]
    ]);

    // Información de semana
    $sheetSinSeguro40->mergeCells('B4:V4');
    $sheetSinSeguro40->setCellValue('B4', $tituloExcel);
    $sheetSinSeguro40->getStyle('B4')->applyFromArray([
        'font' => ['bold' => true, 'size' => 12],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_RIGHT, 'vertical' => Alignment::VERTICAL_CENTER]
    ]);

    // Alturas de filas
    $sheetSinSeguro40->getRowDimension('1')->setRowHeight(50);
    $sheetSinSeguro40->getRowDimension('2')->setRowHeight(20);
    $sheetSinSeguro40->getRowDimension('3')->setRowHeight(25);

    // Encabezados de la tabla
    foreach ($headers as $cell => $header) {
        $sheetSinSeguro40->setCellValue($cell, $header);
        $sheetSinSeguro40->getStyle($cell)->applyFromArray($headerStyle);
    }

    $sheetSinSeguro40->getRowDimension('6')->setRowHeight(50);

    // Ajustar ancho de columnas
    $sheetSinSeguro40->getColumnDimension('A')->setWidth(5);
    $sheetSinSeguro40->getColumnDimension('B')->setWidth(12);
    $sheetSinSeguro40->getColumnDimension('C')->setWidth(40);
    $sheetSinSeguro40->getColumnDimension('D')->setWidth(15);
    $sheetSinSeguro40->getColumnDimension('J')->setWidth(15);

    foreach (['E', 'F', 'G', 'H', 'I', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U'] as $col) {
        $sheetSinSeguro40->getColumnDimension($col)->setWidth($anchoUniforme);
    }
    $sheetSinSeguro40->getColumnDimension('R')->setWidth(15);
    $sheetSinSeguro40->getColumnDimension('S')->setWidth($anchoUniforme);
    $sheetSinSeguro40->getColumnDimension('T')->setWidth($anchoUniforme);
    $sheetSinSeguro40->getColumnDimension('U')->setWidth(15);
    $sheetSinSeguro40->getColumnDimension('V')->setWidth(15);

    // Variables para empleados sin seguro 40 libras
    $filaSinSeguro40 = 7;
    $numeroSinSeguro40 = 1;
    $totalEmpleadosSinSeguro40 = 0;
    $empleadosNoEncontradosSinSeguro40 = [];

    // Agregar los datos de empleados sin seguro 40 LIBRAS
    if (isset($jsonGlobal['departamentos'])) {
        foreach ($jsonGlobal['departamentos'] as $depto) {
            if (stripos($depto['nombre'], 'SIN SEGURO') !== false) {
                foreach ($depto['empleados'] as $empleado) {
                    $claveEmpleado = $empleado['clave'] ?? null;
                    $puestoEmpleado = $empleado['puesto'] ?? '';

                    // FILTRAR SOLO 40 LIBRAS
                    if (stripos($puestoEmpleado, '40') === false) {
                        continue; // Saltar si no es de 40 libras
                    }

                    if ($claveEmpleado && validarEmpleadoExiste($claveEmpleado, $conexion)) {
                        $sheetSinSeguro40->setCellValue("A{$filaSinSeguro40}", $numeroSinSeguro40);
                        $sheetSinSeguro40->setCellValueExplicit("B{$filaSinSeguro40}", $claveEmpleado, \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);

                        $nombreLimpio = trim(str_replace(['|', '"', "'", "\n", "\r", "\t"], '', $empleado['nombre']));
                        $sheetSinSeguro40->setCellValue("C{$filaSinSeguro40}", $nombreLimpio);
                        $sheetSinSeguro40->setCellValue("D{$filaSinSeguro40}", '40 LIBRAS');

                        $putSinSeguro40 = function (string $cell, $value) use ($sheetSinSeguro40) {
                            if ($value !== null && $value !== '' && is_numeric($value)) {
                                $num = (float)$value;
                                if ($num != 0) {
                                    $sheetSinSeguro40->setCellValue($cell, $num);
                                }
                            }
                        };

                        $putSinSeguro40("E{$filaSinSeguro40}", $empleado['sueldo_base'] ?? null);
                        $putSinSeguro40("F{$filaSinSeguro40}", $empleado['incentivo'] ?? null);
                        $putSinSeguro40("G{$filaSinSeguro40}", $empleado['sueldo_extra_final'] ?? null);

                        // Conceptos e imputación a nuevas columnas según nuevo formato
                        $conceptosSinSeguro40 = $empleado['conceptos'] ?? [];
                        $getConceptoSinSeguro40 = function ($codigo) use ($conceptosSinSeguro40) {
                            foreach ($conceptosSinSeguro40 as $c) {
                                if (isset($c['codigo']) && $c['codigo'] == $codigo) {
                                    return (float)($c['resultado'] ?? 0);
                                }
                            }
                            return 0;
                        };

                        // H: ISR
                        $isrSinSeguro40 = $getConceptoSinSeguro40('45');
                        if ($isrSinSeguro40 != 0) $putSinSeguro40("H{$filaSinSeguro40}", -1 * $isrSinSeguro40);

                        // I: IMSS
                        $imssSinSeguro40 = $getConceptoSinSeguro40('52');
                        if ($imssSinSeguro40 != 0) $putSinSeguro40("I{$filaSinSeguro40}", -1 * $imssSinSeguro40);

                        // J: INFONAVIT
                        $infonavitSinSeguro40 = $getConceptoSinSeguro40('16');
                        if ($infonavitSinSeguro40 != 0) $putSinSeguro40("J{$filaSinSeguro40}", -1 * $infonavitSinSeguro40);

                        // K: Inasistencias
                        if (isset($empleado['inasistencias_descuento']) && $empleado['inasistencias_descuento'] != 0) {
                            $putSinSeguro40("K{$filaSinSeguro40}", -1 * (float)$empleado['inasistencias_descuento']);
                        }

                        // L: Uniformes
                        if (isset($empleado['uniformes']) && $empleado['uniformes'] != 0) {
                            $putSinSeguro40("L{$filaSinSeguro40}", -1 * (float)$empleado['uniformes']);
                        }

                        // M: Checador
                        if (isset($empleado['checador']) && $empleado['checador'] != 0) {
                            $putSinSeguro40("M{$filaSinSeguro40}", -1 * (float)$empleado['checador']);
                        }

                        // N: F.A / GAFET / COFIA
                        if (isset($empleado['fa_gafet_cofia']) && $empleado['fa_gafet_cofia'] != 0) {
                            $putSinSeguro40("N{$filaSinSeguro40}", -1 * (float)$empleado['fa_gafet_cofia']);
                        }

                        // O: NETO A RECIBIR (autosuma de E:G menos deducciones H:N)
                        $formulaNetoSin40 = "=SUM(E{$filaSinSeguro40}:G{$filaSinSeguro40}) - ABS(SUM(H{$filaSinSeguro40}:N{$filaSinSeguro40}))";
                        $sheetSinSeguro40->setCellValueExplicit("O{$filaSinSeguro40}", $formulaNetoSin40, \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_FORMULA);
                        $sheetSinSeguro40->getStyle("O{$filaSinSeguro40}")->getNumberFormat()->setFormatCode('_("$"* #,##0.00_);_("$"* \(#,##0.00\);_("$"* "-"??_);_(@_)');

                        // P: Tarjeta (neto_pagar)
                        if (isset($empleado['neto_pagar']) && $empleado['neto_pagar'] != 0) {
                            $putSinSeguro40("P{$filaSinSeguro40}", -1 * (float)$empleado['neto_pagar']);
                        }

                        // Q: IMPORTE EN EFECTIVO = NETO A RECIBIR - TARJETA (usar autosuma)
                        $formulaImporteSin40 = "=SUM(O{$filaSinSeguro40}, -ABS(P{$filaSinSeguro40}))";
                        $sheetSinSeguro40->setCellValueExplicit("Q{$filaSinSeguro40}", $formulaImporteSin40, \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_FORMULA);
                        $sheetSinSeguro40->getStyle("Q{$filaSinSeguro40}")->getNumberFormat()->setFormatCode('_("$"* #,##0.00_);_("$"* \(#,##0.00\);_("$"* "-"??_);_(@_)');

                        // R: Préstamo
                        if (isset($empleado['prestamo']) && $empleado['prestamo'] != 0) {
                            $putSinSeguro40("R{$filaSinSeguro40}", -1 * (float)$empleado['prestamo']);
                        }

                        // S: TOTAL A RECIBIR = IMPORTE EN EFECTIVO - PRÉSTAMO
                        $formulaTotalRecibirSin40 = "=SUM(Q{$filaSinSeguro40}, -ABS(R{$filaSinSeguro40}))";
                        $sheetSinSeguro40->setCellValueExplicit("S{$filaSinSeguro40}", $formulaTotalRecibirSin40, \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_FORMULA);
                        $sheetSinSeguro40->getStyle("S{$filaSinSeguro40}")->getNumberFormat()->setFormatCode('_("$"* #,##0.00_);_("$"* \(#,##0.00\);_("$"* "-"??_);_(@_)');

                        // T: REDONDEO (cantidad de redondeo desde JSON)
                        $redondeoCantidadSin40 = isset($empleado['redondeo_cantidad']) ? (float)$empleado['redondeo_cantidad'] : 0;
                        if ($redondeoCantidadSin40 != 0) {
                            $sheetSinSeguro40->setCellValue("T{$filaSinSeguro40}", $redondeoCantidadSin40);
                            $sheetSinSeguro40->getStyle("T{$filaSinSeguro40}")->getNumberFormat()->setFormatCode('"$"#,##0.00;"$"-#,##0.00');
                            // Color rojo para cantidades negativas
                            if ($redondeoCantidadSin40 < 0) {
                                $sheetSinSeguro40->getStyle("T{$filaSinSeguro40}")->getFont()->getColor()->setRGB('FF0000');
                            }
                        } else {
                            $sheetSinSeguro40->setCellValue("T{$filaSinSeguro40}", '');
                        }

                        // U: TOTAL EFECTIVO REDONDEADO (TOTAL A RECIBIR + REDONDEO)
                        $formulaTotalRedondeadoSin40 = "=ROUND(S{$filaSinSeguro40} + IF(T{$filaSinSeguro40}<>\"\", T{$filaSinSeguro40}, 0), 2)";
                        $sheetSinSeguro40->setCellValueExplicit("U{$filaSinSeguro40}", $formulaTotalRedondeadoSin40, \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_FORMULA);
                        $sheetSinSeguro40->getStyle("U{$filaSinSeguro40}")->getNumberFormat()->setFormatCode('_("$"* #,##0.00_);_("$"* \(#,##0.00\);_("$"* "-"??_);_(@_)');

                        // V: (firma)
                        $sheetSinSeguro40->setCellValue("V{$filaSinSeguro40}", '');

                        $sheetSinSeguro40->getRowDimension($filaSinSeguro40)->setRowHeight(25);

                        $sheetSinSeguro40->getStyle("A{$filaSinSeguro40}:V{$filaSinSeguro40}")->applyFromArray([
                            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
                            'alignment' => [
                                'horizontal' => Alignment::HORIZONTAL_CENTER,
                                'vertical' => Alignment::VERTICAL_CENTER
                            ]
                        ]);

                        $sheetSinSeguro40->getStyle("C{$filaSinSeguro40}")->applyFromArray([
                            'alignment' => [
                                'horizontal' => Alignment::HORIZONTAL_LEFT,
                                'vertical' => Alignment::VERTICAL_CENTER
                            ]
                        ]);

                        // Asegurar borde específico para la columna FIRMA RECIBIDO (V)
                        $sheetSinSeguro40->getStyle("V{$filaSinSeguro40}")->applyFromArray([
                            'borders' => [
                                'top' => ['borderStyle' => Border::BORDER_THIN],
                                'right' => ['borderStyle' => Border::BORDER_THIN],
                                'bottom' => ['borderStyle' => Border::BORDER_THIN],
                                'left' => ['borderStyle' => Border::BORDER_THIN]
                            ]
                        ]);


                        $numeroSinSeguro40++;
                        $filaSinSeguro40++;
                        $totalEmpleadosSinSeguro40++;
                    } else {
                        $empleadosNoEncontradosSinSeguro40[] = [
                            'clave' => $claveEmpleado ?? 'Sin clave',
                            'nombre' => $empleado['nombre'] ?? 'Sin nombre'
                        ];
                    }
                }
            }
        }
    }

    if (!empty($empleadosNoEncontradosSinSeguro40)) {
        error_log("Empleados sin seguro 40 libras no encontrados en BD: " . json_encode($empleadosNoEncontradosSinSeguro40));
    }

    if ($totalEmpleadosSinSeguro40 <= 40) {
        $sheetSinSeguro40->getPageSetup()->setFitToPage(true)->setFitToWidth(1)->setFitToHeight(1);
    } else {
        $sheetSinSeguro40->getPageSetup()->setFitToPage(true)->setFitToWidth(1)->setFitToHeight(0);
    }

    if ($totalEmpleadosSinSeguro40 > 0) {
        $ultimaFilaEmpleadosSinSeguro40 = $filaSinSeguro40 - 1;
        $sheetSinSeguro40->getStyle("H7:N{$ultimaFilaEmpleadosSinSeguro40}")->getFont()->getColor()->setRGB('FF0000');
        $sheetSinSeguro40->getStyle("P7:P{$ultimaFilaEmpleadosSinSeguro40}")->getFont()->getColor()->setRGB('FF0000');
        $sheetSinSeguro40->getStyle("R7:R{$ultimaFilaEmpleadosSinSeguro40}")->getFont()->getColor()->setRGB('FF0000');
    }

    $filaTotalesSinSeguro40 = $filaSinSeguro40;
    if ($totalEmpleadosSinSeguro40 > 0) {
        $sheetSinSeguro40->setCellValue("C{$filaTotalesSinSeguro40}", 'TOTAL');

        foreach ($columnasSumar as $col) {
            $sheetSinSeguro40->setCellValue(
                "{$col}{$filaTotalesSinSeguro40}",
                "=IF(SUM({$col}6:{$col}" . ($filaTotalesSinSeguro40 - 1) . ")=0,\"\",SUM({$col}6:{$col}" . ($filaTotalesSinSeguro40 - 1) . "))"
            );
        }

        $sheetSinSeguro40->getStyle("C{$filaTotalesSinSeguro40}:U{$filaTotalesSinSeguro40}")->applyFromArray([
            'font' => ['bold' => true],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'D9EAD3']],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER]
        ]);
        $sheetSinSeguro40->getStyle("C{$filaTotalesSinSeguro40}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);
        
        // Asegurar borde específico para la columna TOTAL EFECTIVO REDONDEADO (U) en totales
        $sheetSinSeguro40->getStyle("U{$filaTotalesSinSeguro40}")->applyFromArray([
            'borders' => [
                'top' => ['borderStyle' => Border::BORDER_THIN],
                'right' => ['borderStyle' => Border::BORDER_THIN],
                'bottom' => ['borderStyle' => Border::BORDER_THIN],
                'left' => ['borderStyle' => Border::BORDER_THIN]
            ]
        ]);

        $sheetSinSeguro40->getRowDimension($filaTotalesSinSeguro40)->setRowHeight(24);

        $sheetSinSeguro40->getStyle("H{$filaTotalesSinSeguro40}:N{$filaTotalesSinSeguro40}")->getFont()->getColor()->setRGB('FF0000');
        $sheetSinSeguro40->getStyle("P{$filaTotalesSinSeguro40}:P{$filaTotalesSinSeguro40}")->getFont()->getColor()->setRGB('FF0000');
        $sheetSinSeguro40->getStyle("R{$filaTotalesSinSeguro40}:R{$filaTotalesSinSeguro40}")->getFont()->getColor()->setRGB('FF0000');
    }

    if ($totalEmpleadosSinSeguro40 > 0) {
        foreach ($columnasSumar as $col) {
            $sheetSinSeguro40->getStyle("{$col}6:{$col}{$filaTotalesSinSeguro40}")
                ->getNumberFormat()
                ->setFormatCode($formatoMoneda);
        }
    }

    /***************
     * TABLA NOMINA SIN SEGURO 10 LIBRAS
     * ************** */

    // ---- CREAR HOJA DE NÓMINA SIN SEGURO 10 LIBRAS ----
    $sheetSinSeguro10 = $spreadsheet->createSheet();
    $sheetSinSeguro10->setTitle('Sin Seguro 10 Libras');

    // Configurar página para impresión horizontal
    $sheetSinSeguro10->getPageSetup()
        ->setOrientation(PageSetup::ORIENTATION_LANDSCAPE)
        ->setPaperSize(PageSetup::PAPERSIZE_A4)
        ->setHorizontalCentered(true)
        ->setVerticalCentered(false);

    $sheetSinSeguro10->getPageMargins()->setTop(0.3)->setRight(0.3)->setLeft(0.3)->setBottom(0.3);
    $sheetSinSeguro10->getPageSetup()->setFitToWidth(1)->setFitToHeight(0);

    // Logo
    if (file_exists('../../public/img/logo.jpg')) {
        $logoSinSeguro10 = new Drawing();
        $logoSinSeguro10->setName('Logo');
        $logoSinSeguro10->setDescription('Logo CITRICOS SAAO');
        $logoSinSeguro10->setPath('../../public/img/logo.jpg');
        $logoSinSeguro10->setHeight(120);
        $logoSinSeguro10->setCoordinates('A1');
        $logoSinSeguro10->setOffsetX(10);
        $logoSinSeguro10->setOffsetY(5);
        $logoSinSeguro10->setWorksheet($sheetSinSeguro10);
    }

    // Título principal centrado
    $sheetSinSeguro10->mergeCells('B1:V1');
    $sheetSinSeguro10->setCellValue('B1', 'SIN SEGURO 10 LIBRAS');
    $sheetSinSeguro10->getStyle('B1')->applyFromArray([
        'font' => ['bold' => true, 'size' => 16, 'color' => ['rgb' => '008000']],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER]
    ]);

    // Título de la empresa centrado
    $sheetSinSeguro10->mergeCells('B2:V2');
    $sheetSinSeguro10->setCellValue('B2', 'CITRICOS SAAO S.A DE C.V');
    $sheetSinSeguro10->getStyle('B2')->applyFromArray([
        'font' => ['bold' => true, 'size' => 12, 'color' => ['rgb' => '008000']],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER]
    ]);

    // Título de nómina
    $sheetSinSeguro10->mergeCells('B3:V3');
    $sheetSinSeguro10->setCellValue('B3', $tituloNomina);
    $sheetSinSeguro10->getStyle('B3')->applyFromArray([
        'font' => ['bold' => true, 'size' => 14],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER]
    ]);

    // Información de semana
    $sheetSinSeguro10->mergeCells('B4:V4');
    $sheetSinSeguro10->setCellValue('B4', $tituloExcel);
    $sheetSinSeguro10->getStyle('B4')->applyFromArray([
        'font' => ['bold' => true, 'size' => 12],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_RIGHT, 'vertical' => Alignment::VERTICAL_CENTER]
    ]);

    // Alturas de filas
    $sheetSinSeguro10->getRowDimension('1')->setRowHeight(50);
    $sheetSinSeguro10->getRowDimension('2')->setRowHeight(20);
    $sheetSinSeguro10->getRowDimension('3')->setRowHeight(25);

    // Encabezados de la tabla
    foreach ($headers as $cell => $header) {
        $sheetSinSeguro10->setCellValue($cell, $header);
        $sheetSinSeguro10->getStyle($cell)->applyFromArray($headerStyle);
    }

    $sheetSinSeguro10->getRowDimension('6')->setRowHeight(50);

    // Ajustar ancho de columnas
    $sheetSinSeguro10->getColumnDimension('A')->setWidth(5);
    $sheetSinSeguro10->getColumnDimension('B')->setWidth(12);
    $sheetSinSeguro10->getColumnDimension('C')->setWidth(40);
    $sheetSinSeguro10->getColumnDimension('D')->setWidth(15);
    $sheetSinSeguro10->getColumnDimension('J')->setWidth(15);

    foreach (['E', 'F', 'G', 'H', 'I', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U'] as $col) {
        $sheetSinSeguro10->getColumnDimension($col)->setWidth($anchoUniforme);
    }
    $sheetSinSeguro10->getColumnDimension('V')->setWidth(15);

    // Variables para empleados sin seguro 10 libras
    $filaSinSeguro10 = 7;
    $numeroSinSeguro10 = 1;
    $totalEmpleadosSinSeguro10 = 0;
    $empleadosNoEncontradosSinSeguro10 = [];

    // Agregar los datos de empleados sin seguro 10 LIBRAS
    if (isset($jsonGlobal['departamentos'])) {
        foreach ($jsonGlobal['departamentos'] as $depto) {
            if (stripos($depto['nombre'], 'SIN SEGURO') !== false) {
                foreach ($depto['empleados'] as $empleado) {
                    $claveEmpleado = $empleado['clave'] ?? null;
                    $puestoEmpleado = $empleado['puesto'] ?? '';

                    // FILTRAR SOLO 10 LIBRAS
                    if (stripos($puestoEmpleado, '10') === false) {
                        continue; // Saltar si no es de 10 libras
                    }

                    if ($claveEmpleado && validarEmpleadoExiste($claveEmpleado, $conexion)) {
                        $sheetSinSeguro10->setCellValue("A{$filaSinSeguro10}", $numeroSinSeguro10);
                        $sheetSinSeguro10->setCellValueExplicit("B{$filaSinSeguro10}", $claveEmpleado, \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_STRING);

                        $nombreLimpio = trim(str_replace(['|', '"', "'", "\n", "\r", "\t"], '', $empleado['nombre']));
                        $sheetSinSeguro10->setCellValue("C{$filaSinSeguro10}", $nombreLimpio);
                        $sheetSinSeguro10->setCellValue("D{$filaSinSeguro10}", '10 LIBRAS');

                        $putSinSeguro10 = function (string $cell, $value) use ($sheetSinSeguro10) {
                            if ($value !== null && $value !== '' && is_numeric($value)) {
                                $num = (float)$value;
                                if ($num != 0) {
                                    $sheetSinSeguro10->setCellValue($cell, $num);
                                }
                            }
                        };

                        $putSinSeguro10("E{$filaSinSeguro10}", $empleado['sueldo_base'] ?? null);
                        $putSinSeguro10("F{$filaSinSeguro10}", $empleado['incentivo'] ?? null);
                        $putSinSeguro10("G{$filaSinSeguro10}", $empleado['sueldo_extra_final'] ?? null);

                        // Conceptos e imputación a nuevas columnas según nuevo formato
                        $conceptosSinSeguro10 = $empleado['conceptos'] ?? [];
                        $getConceptoSinSeguro10 = function ($codigo) use ($conceptosSinSeguro10) {
                            foreach ($conceptosSinSeguro10 as $c) {
                                if (isset($c['codigo']) && $c['codigo'] == $codigo) {
                                    return (float)($c['resultado'] ?? 0);
                                }
                            }
                            return 0;
                        };

                        // H: ISR
                        $isrSinSeguro10 = $getConceptoSinSeguro10('45');
                        if ($isrSinSeguro10 != 0) $putSinSeguro10("H{$filaSinSeguro10}", -1 * $isrSinSeguro10);

                        // I: IMSS
                        $imssSinSeguro10 = $getConceptoSinSeguro10('52');
                        if ($imssSinSeguro10 != 0) $putSinSeguro10("I{$filaSinSeguro10}", -1 * $imssSinSeguro10);

                        // J: INFONAVIT
                        $infonavitSinSeguro10 = $getConceptoSinSeguro10('16');
                        if ($infonavitSinSeguro10 != 0) $putSinSeguro10("J{$filaSinSeguro10}", -1 * $infonavitSinSeguro10);

                        // K: Inasistencias
                        if (isset($empleado['inasistencias_descuento']) && $empleado['inasistencias_descuento'] != 0) {
                            $putSinSeguro10("K{$filaSinSeguro10}", -1 * (float)$empleado['inasistencias_descuento']);
                        }

                        // L: Uniformes
                        if (isset($empleado['uniformes']) && $empleado['uniformes'] != 0) {
                            $putSinSeguro10("L{$filaSinSeguro10}", -1 * (float)$empleado['uniformes']);
                        }

                        // M: Checador
                        if (isset($empleado['checador']) && $empleado['checador'] != 0) {
                            $putSinSeguro10("M{$filaSinSeguro10}", -1 * (float)$empleado['checador']);
                        }

                        // N: F.A / GAFET / COFIA
                        if (isset($empleado['fa_gafet_cofia']) && $empleado['fa_gafet_cofia'] != 0) {
                            $putSinSeguro10("N{$filaSinSeguro10}", -1 * (float)$empleado['fa_gafet_cofia']);
                        }

                        // O: NETO A RECIBIR (autosuma de E:G menos deducciones H:N)
                        $formulaNetoSin10 = "=SUM(E{$filaSinSeguro10}:G{$filaSinSeguro10}) - ABS(SUM(H{$filaSinSeguro10}:N{$filaSinSeguro10}))";
                        $sheetSinSeguro10->setCellValueExplicit("O{$filaSinSeguro10}", $formulaNetoSin10, \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_FORMULA);
                        $sheetSinSeguro10->getStyle("O{$filaSinSeguro10}")->getNumberFormat()->setFormatCode('_("$"* #,##0.00_);_("$"* \(#,##0.00\);_("$"* "-"??_);_(@_)');

                        // P: Tarjeta (neto_pagar)
                        if (isset($empleado['neto_pagar']) && $empleado['neto_pagar'] != 0) {
                            $putSinSeguro10("P{$filaSinSeguro10}", -1 * (float)$empleado['neto_pagar']);
                        }

                        // Q: IMPORTE EN EFECTIVO = NETO A RECIBIR - TARJETA (usar autosuma)
                        $formulaImporteSin10 = "=SUM(O{$filaSinSeguro10}, -ABS(P{$filaSinSeguro10}))";
                        $sheetSinSeguro10->setCellValueExplicit("Q{$filaSinSeguro10}", $formulaImporteSin10, \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_FORMULA);
                        $sheetSinSeguro10->getStyle("Q{$filaSinSeguro10}")->getNumberFormat()->setFormatCode('_("$"* #,##0.00_);_("$"* \(#,##0.00\);_("$"* "-"??_);_(@_)');

                        // R: Préstamo
                        if (isset($empleado['prestamo']) && $empleado['prestamo'] != 0) {
                            $putSinSeguro10("R{$filaSinSeguro10}", -1 * (float)$empleado['prestamo']);
                        }

                        // S: TOTAL A RECIBIR = IMPORTE EN EFECTIVO - PRÉSTAMO
                        $formulaTotalRecibirSin10 = "=SUM(Q{$filaSinSeguro10}, -ABS(R{$filaSinSeguro10}))";
                        $sheetSinSeguro10->setCellValueExplicit("S{$filaSinSeguro10}", $formulaTotalRecibirSin10, \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_FORMULA);
                        $sheetSinSeguro10->getStyle("S{$filaSinSeguro10}")->getNumberFormat()->setFormatCode('_("$"* #,##0.00_);_("$"* \(#,##0.00\);_("$"* "-"??_);_(@_)');

                        // T: REDONDEO (cantidad de redondeo desde JSON)
                        $redondeoCantidadSin10 = isset($empleado['redondeo_cantidad']) ? (float)$empleado['redondeo_cantidad'] : 0;
                        if ($redondeoCantidadSin10 != 0) {
                            $sheetSinSeguro10->setCellValue("T{$filaSinSeguro10}", $redondeoCantidadSin10);
                            $sheetSinSeguro10->getStyle("T{$filaSinSeguro10}")->getNumberFormat()->setFormatCode('"$"#,##0.00;"$"-#,##0.00');
                            // Color rojo para cantidades negativas
                            if ($redondeoCantidadSin10 < 0) {
                                $sheetSinSeguro10->getStyle("T{$filaSinSeguro10}")->getFont()->getColor()->setRGB('FF0000');
                            }
                        } else {
                            $sheetSinSeguro10->setCellValue("T{$filaSinSeguro10}", '');
                        }

                        // U: TOTAL EFECTIVO REDONDEADO (TOTAL A RECIBIR + REDONDEO)
                        $formulaTotalRedondeadoSin10 = "=ROUND(S{$filaSinSeguro10} + IF(T{$filaSinSeguro10}<>\"\", T{$filaSinSeguro10}, 0), 2)";
                        $sheetSinSeguro10->setCellValueExplicit("U{$filaSinSeguro10}", $formulaTotalRedondeadoSin10, \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_FORMULA);
                        $sheetSinSeguro10->getStyle("U{$filaSinSeguro10}")->getNumberFormat()->setFormatCode('_("$"* #,##0.00_);_("$"* \(#,##0.00\);_("$"* "-"??_);_(@_)');

                        // V: Firma
                        $sheetSinSeguro10->setCellValue("V{$filaSinSeguro10}", '');

                        $sheetSinSeguro10->getRowDimension($filaSinSeguro10)->setRowHeight(25);

                        $sheetSinSeguro10->getStyle("A{$filaSinSeguro10}:V{$filaSinSeguro10}")->applyFromArray([
                            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
                            'alignment' => [
                                'horizontal' => Alignment::HORIZONTAL_CENTER,
                                'vertical' => Alignment::VERTICAL_CENTER
                            ]
                        ]);

                        $sheetSinSeguro10->getStyle("C{$filaSinSeguro10}")->applyFromArray([
                            'alignment' => [
                                'horizontal' => Alignment::HORIZONTAL_LEFT,
                                'vertical' => Alignment::VERTICAL_CENTER
                            ]
                        ]);

                        // Asegurar borde específico para la columna FIRMA RECIBIDO (V)
                        $sheetSinSeguro10->getStyle("V{$filaSinSeguro10}")->applyFromArray([
                            'borders' => [
                                'top' => ['borderStyle' => Border::BORDER_THIN],
                                'right' => ['borderStyle' => Border::BORDER_THIN],
                                'bottom' => ['borderStyle' => Border::BORDER_THIN],
                                'left' => ['borderStyle' => Border::BORDER_THIN]
                            ]
                        ]);


                        $numeroSinSeguro10++;
                        $filaSinSeguro10++;
                        $totalEmpleadosSinSeguro10++;
                    } else {
                        $empleadosNoEncontradosSinSeguro10[] = [
                            'clave' => $claveEmpleado ?? 'Sin clave',
                            'nombre' => $empleado['nombre'] ?? 'Sin nombre'
                        ];
                    }
                }
            }
        }
    }

    if (!empty($empleadosNoEncontradosSinSeguro10)) {
        error_log("Empleados sin seguro 10 libras no encontrados en BD: " . json_encode($empleadosNoEncontradosSinSeguro10));
    }

    if ($totalEmpleadosSinSeguro10 <= 40) {
        $sheetSinSeguro10->getPageSetup()->setFitToPage(true)->setFitToWidth(1)->setFitToHeight(1);
    } else {
        $sheetSinSeguro10->getPageSetup()->setFitToPage(true)->setFitToWidth(1)->setFitToHeight(0);
    }

    if ($totalEmpleadosSinSeguro10 > 0) {
        $ultimaFilaEmpleadosSinSeguro10 = $filaSinSeguro10 - 1;
        $sheetSinSeguro10->getStyle("H7:N{$ultimaFilaEmpleadosSinSeguro10}")->getFont()->getColor()->setRGB('FF0000');
        $sheetSinSeguro10->getStyle("P7:P{$ultimaFilaEmpleadosSinSeguro10}")->getFont()->getColor()->setRGB('FF0000');
        $sheetSinSeguro10->getStyle("R7:R{$ultimaFilaEmpleadosSinSeguro10}")->getFont()->getColor()->setRGB('FF0000');
    }

    $filaTotalesSinSeguro10 = $filaSinSeguro10;
    if ($totalEmpleadosSinSeguro10 > 0) {
        $sheetSinSeguro10->setCellValue("C{$filaTotalesSinSeguro10}", 'TOTAL');

        foreach ($columnasSumar as $col) {
            $sheetSinSeguro10->setCellValue(
                "{$col}{$filaTotalesSinSeguro10}",
                "=IF(SUM({$col}6:{$col}" . ($filaTotalesSinSeguro10 - 1) . ")=0,\"\",SUM({$col}6:{$col}" . ($filaTotalesSinSeguro10 - 1) . "))"
            );
        }

        $sheetSinSeguro10->getStyle("C{$filaTotalesSinSeguro10}:U{$filaTotalesSinSeguro10}")->applyFromArray([
            'font' => ['bold' => true],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'D9EAD3']],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER]
        ]);
        $sheetSinSeguro10->getStyle("C{$filaTotalesSinSeguro10}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);
        
        // Asegurar borde específico para la columna TOTAL EFECTIVO REDONDEADO (U) en totales
        $sheetSinSeguro10->getStyle("U{$filaTotalesSinSeguro10}")->applyFromArray([
            'borders' => [
                'top' => ['borderStyle' => Border::BORDER_THIN],
                'right' => ['borderStyle' => Border::BORDER_THIN],
                'bottom' => ['borderStyle' => Border::BORDER_THIN],
                'left' => ['borderStyle' => Border::BORDER_THIN]
            ]
        ]);

        $sheetSinSeguro10->getRowDimension($filaTotalesSinSeguro10)->setRowHeight(24);

        $sheetSinSeguro10->getStyle("H{$filaTotalesSinSeguro10}:N{$filaTotalesSinSeguro10}")->getFont()->getColor()->setRGB('FF0000');
        $sheetSinSeguro10->getStyle("P{$filaTotalesSinSeguro10}:P{$filaTotalesSinSeguro10}")->getFont()->getColor()->setRGB('FF0000');
        $sheetSinSeguro10->getStyle("R{$filaTotalesSinSeguro10}:R{$filaTotalesSinSeguro10}")->getFont()->getColor()->setRGB('FF0000');
    }

    if ($totalEmpleadosSinSeguro10 > 0) {
        foreach ($columnasSumar as $col) {
            $sheetSinSeguro10->getStyle("{$col}6:{$col}{$filaTotalesSinSeguro10}")
                ->getNumberFormat()
                ->setFormatCode($formatoMoneda);
        }
    }

    /***************
     * TABLA DISPERSIÓN TARJETA
     * ************** */


    // ---- CREAR HOJA DE DISPERSIÓN DE TARJETA ----
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
