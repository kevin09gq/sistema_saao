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
    $sheet->mergeCells('B1:Q1');
    $sheet->setCellValue('B1', 'PRODUCCION 40 LIBRAS');
    $sheet->getStyle('B1')->applyFromArray([
        'font' => ['bold' => true, 'size' => 16, 'color' => ['rgb' => '008000']],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER]
    ]);

    // Título de la empresa centrado
    $sheet->mergeCells('B2:Q2');
    $sheet->setCellValue('B2', 'CITRICOS SAAO S.A DE C.V');
    $sheet->getStyle('B2')->applyFromArray([
        'font' => ['bold' => true, 'size' => 12, 'color' => ['rgb' => '008000']],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER]
    ]);

    // Título de nómina
    $sheet->mergeCells('B3:Q3');
    $sheet->setCellValue('B3',  $tituloNomina);
    $sheet->getStyle('B3')->applyFromArray([
        'font' => ['bold' => true, 'size' => 14],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER]
    ]);

    // Información de semana
    $sheet->mergeCells('B4:Q4');
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
        'B6' => 'NOMBRE',
        'C6' => 'PUESTO',
        'D6' => "SUELDO\nNETO",
        'E6' => 'INCENTIVO',
        'F6' => 'EXTRA',
        'G6' => 'TARJETA',
        'H6' => 'PRÉSTAMO',
        'I6' => 'INASISTENCIAS',
        'J6' => 'UNIFORMES',
        'K6' => 'INFONAVIT',
        'L6' => 'ISR',
        'M6' => 'IMSS',
        'N6' => 'CHECADOR',
        'O6' => "F.A /\nGAFET/\nCOFIA",
        'P6' => "SUELDO\nA\nCOBRAR",
        'Q6' => "FIRMA\nRECIBIDO"
    ];

    $headerStyle = [
        'font' => ['bold' => true, 'size' => 10, 'color' => ['rgb' => 'FFFFFF']],
        'alignment' => [
            'horizontal' => Alignment::HORIZONTAL_CENTER,
            'vertical' => Alignment::VERTICAL_CENTER,
            'wrapText' => true
        ],
        'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '428F49']],
        'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]]
    ];

    foreach ($headers as $cell => $header) {
        $sheet->setCellValue($cell, $header);
        $sheet->getStyle($cell)->applyFromArray($headerStyle);
    }

    $sheet->getRowDimension('6')->setRowHeight(50);

    // Ajustar ancho de columnas
    $sheet->getColumnDimension('A')->setWidth(5);
    $sheet->getColumnDimension('B')->setWidth(45);
    $sheet->getColumnDimension('C')->setWidth(15);
    $sheet->getColumnDimension('I')->setWidth(15);

    $anchoUniforme = 12;
    foreach (['D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'O', 'P'] as $col) {
        $sheet->getColumnDimension($col)->setWidth($anchoUniforme);
    }
    $sheet->getColumnDimension('Q')->setWidth(15);



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

                        // Usar nombre del JSON (limpiado)
                        $nombreLimpio = trim(str_replace(['|', '"', "'", "\n", "\r", "\t"], '', $empleado['nombre']));
                        $sheet->setCellValue("B{$fila}", $nombreLimpio);

                        $sheet->setCellValue("C{$fila}", '40 LIBRAS');

                        // Helper para colocar valor solo si != 0
                        $put = function (string $cell, $value) use ($sheet) {
                            if ($value !== null && $value !== '' && is_numeric($value)) {
                                $num = (float)$value;
                                if ($num != 0) {
                                    $sheet->setCellValue($cell, $num);
                                }
                            }
                        };

                        // D: Sueldo base (positivo)
                        $put("D{$fila}", $empleado['sueldo_base'] ?? null);

                        // E: Incentivo (positivo)
                        $put("E{$fila}", $empleado['incentivo'] ?? null);

                        // F: Extra (positivo)
                        $put("F{$fila}", $empleado['sueldo_extra_final'] ?? null);

                        // G: Tarjeta (deducción negativa)
                        if (isset($empleado['neto_pagar']) && $empleado['neto_pagar'] != 0) {
                            $put("G{$fila}", -1 * (float)$empleado['neto_pagar']);
                        }

                        // H: Préstamo (deducción)
                        if (isset($empleado['prestamo']) && $empleado['prestamo'] != 0) {
                            $put("H{$fila}", -1 * (float)$empleado['prestamo']);
                        }

                        // I: Inasistencias (deducción)
                        if (isset($empleado['inasistencias_descuento']) && $empleado['inasistencias_descuento'] != 0) {
                            $put("I{$fila}", -1 * (float)$empleado['inasistencias_descuento']);
                        }

                        // J: Uniformes (deducción)
                        if (isset($empleado['uniformes']) && $empleado['uniformes'] != 0) {
                            $put("J{$fila}", -1 * (float)$empleado['uniformes']);
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
                        if ($infonavit != 0) $put("K{$fila}", -1 * $infonavit);

                        $isr = $getConcepto('45');
                        if ($isr != 0) $put("L{$fila}", -1 * $isr);

                        $imss = $getConcepto('52');
                        if ($imss != 0) $put("M{$fila}", -1 * $imss);

                        // N: Checador (deducción)
                        if (isset($empleado['checador']) && $empleado['checador'] != 0) {
                            $put("N{$fila}", -1 * (float)$empleado['checador']);
                        }

                        // O: F.A / GAFET / COFIA (deducción)
                        if (isset($empleado['fa_gafet_cofia']) && $empleado['fa_gafet_cofia'] != 0) {
                            $put("O{$fila}", -1 * (float)$empleado['fa_gafet_cofia']);
                        }

                        // P: Sueldo a cobrar (positivo)
                        $put("P{$fila}", $empleado['sueldo_a_cobrar'] ?? null);

                        $sheet->getRowDimension($fila)->setRowHeight(25);

                        // Aplicar estilos
                        $sheet->getStyle("A{$fila}:Q{$fila}")->applyFromArray([
                            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
                            'alignment' => [
                                'horizontal' => Alignment::HORIZONTAL_CENTER,
                                'vertical' => Alignment::VERTICAL_CENTER
                            ]
                        ]);

                        $sheet->getStyle("B{$fila}")->applyFromArray([
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

    // Colorear de rojo las columnas de deducciones: Tarjeta (G) a F.A / GAFET / COFIA (O)
    if ($totalEmpleados > 0) {
        $ultimaFilaEmpleados = $fila - 1;
        $sheet->getStyle("G7:O{$ultimaFilaEmpleados}")->getFont()->getColor()->setRGB('FF0000');
    }

    // Fila total (después del último empleado)
    $filaTotales = $fila;
    if ($totalEmpleados > 0) {
        $sheet->setCellValue("B{$filaTotales}", 'TOTAL');

        $columnasSumar = ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P'];
        foreach ($columnasSumar as $col) {
            // Fórmula que deja vacío si la suma es 0
            $sheet->setCellValue(
                "{$col}{$filaTotales}",
                "=IF(SUM({$col}6:{$col}" . ($filaTotales - 1) . ")=0,\"\",SUM({$col}6:{$col}" . ($filaTotales - 1) . "))"
            );
        }

        $sheet->getStyle("B{$filaTotales}:P{$filaTotales}")->applyFromArray([
            'font' => ['bold' => true],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'D9EAD3']],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER]
        ]);
        $sheet->getStyle("B{$filaTotales}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);
        $sheet->getRowDimension($filaTotales)->setRowHeight(24);

        // También poner en rojo las mismas columnas en la fila TOTAL
        $sheet->getStyle("G{$filaTotales}:O{$filaTotales}")->getFont()->getColor()->setRGB('FF0000');
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
        $sheetDispersion->setCellValue("D{$filaDispersion}", "=SUM(D6:D".($filaDispersion-1).")");
        
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

