<?php

//======================================================================
// ARCHIVO: responsivaIndividual.php
// PROPÓSITO: Generar una hoja individual (.sheet) dentro del libro Excel
//            por cada nómina/rancho presente en el JSON, conteniendo:
//            1. Banner institucional y subtítulo con color dinámico.
//            2. Tabla de metadatos del rancho (Folio, Periodo, Horas, Totales).
//            3. Tabla de departamentos con importes y subtotales.
//            4. Bloque de DECLARACIÓN y firmas (Entrega RH y Recibe Responsable).
//======================================================================

declare(strict_types=1);

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\PageSetup;

/**
 * Agrega una hoja individual al libro de Excel para una nómina específica.
 *
 * @param Spreadsheet $spreadsheet    Instancia del documento Excel.
 * @param string      $claveNomina    Identificador de la nómina (ej. 'nomina_relicario').
 * @param array       $nomina         Datos de la nómina (responsable, departamentos, etc.).
 * @param array       $datosGenerales Metadatos generales (folio, fecha, semana, periodo, elaboro).
 * @param array       $configRanchos  Catálogo base de nombres y estilos.
 * @return Worksheet
 */
function agregarHojaResponsivaIndividual(
    Spreadsheet $spreadsheet,
    string $claveNomina,
    array $nomina,
    array $datosGenerales,
    array $configRanchos
): Worksheet {
    // -----------------------------------------------------------------
    // 1. OBTENER INFORMACIÓN Y COLOR DEL RANCHO
    // -----------------------------------------------------------------
    $cfg = $configRanchos[$claveNomina] ?? [
        'nombre'      => strtoupper(str_replace('_', ' ', $claveNomina)),
        'fondo'       => 'C00000',
        'color_texto' => 'FFFFFF'
    ];

    $departamentos = is_array($nomina['departamentos'] ?? null) ? $nomina['departamentos'] : [];

    // Color dinámico de color_reporte
    $colorHex = '';
    if (!empty($nomina['color'])) {
        $colorHex = strtoupper(ltrim((string)$nomina['color'], '#'));
    }

    if (strlen($colorHex) !== 6) {
        foreach ($departamentos as $d) {
            if (!empty($d['color'])) {
                $colorCandidato = strtoupper(ltrim((string)$d['color'], '#'));
                if (strlen($colorCandidato) === 6) {
                    $colorHex = $colorCandidato;
                    break;
                }
            }
        }
    }

    if (strlen($colorHex) !== 6) {
        $colorHex = $cfg['fondo'];
    }

    // Luminosidad del banner
    $r = hexdec(substr($colorHex, 0, 2));
    $g = hexdec(substr($colorHex, 2, 2));
    $b = hexdec(substr($colorHex, 4, 2));
    $luminosidad = (0.299 * $r) + (0.587 * $g) + (0.114 * $b);
    $colorTextoBanner = ($luminosidad > 128) ? '000000' : 'FFFFFF';

    // -----------------------------------------------------------------
    // 2. CREACIÓN Y CONFIGURACIÓN DE LA NUEVA HOJA
    // -----------------------------------------------------------------
    $sheet = $spreadsheet->createSheet();

    // Nombre de la pestaña (máximo 31 caracteres, sin caracteres reservados)
    $tituloPestana = str_ireplace(['nomina_', 'rancho_'], '', $claveNomina);
    $tituloPestana = ucwords(str_replace('_', ' ', $tituloPestana));
    $tituloPestana = mb_substr(trim($tituloPestana), 0, 31, 'UTF-8');
    $sheet->setTitle($tituloPestana);
    $sheet->setShowGridLines(true);

    // Configuración de página
    $sheet->getPageSetup()->setOrientation(PageSetup::ORIENTATION_LANDSCAPE);
    $sheet->getPageSetup()->setPaperSize(PageSetup::PAPERSIZE_LETTER);
    $sheet->getPageSetup()->setHorizontalCentered(true);
    $sheet->getPageSetup()->setFitToPage(true);
    $sheet->getPageSetup()->setFitToWidth(1);
    $sheet->getPageSetup()->setFitToHeight(0);

    $sheet->getPageMargins()->setTop(0.4);
    $sheet->getPageMargins()->setBottom(0.4);
    $sheet->getPageMargins()->setLeft(0.3);
    $sheet->getPageMargins()->setRight(0.3);

    // Ancho específico de columnas (A a G)
    $anchosColumnas = [
        'A' => 32, // Nómina
        'B' => 14, // Sobres
        'C' => 18, // Importe
        'D' => 26, // Observaciones
        'E' => 16, // Sobres devuelto
        'F' => 18, // Importe devuelto
        'G' => 26  // Incidencias
    ];

    foreach ($anchosColumnas as $col => $ancho) {
        $sheet->getColumnDimension($col)->setWidth($ancho);
    }

    $formatoMoneda = '$#,##0.00;($#,##0.00);"$ -"';
    $formatoEntero = '#,##0;(#,##0);0';

    // =================================================================
    // 3. CABECERA SUPERIOR INSTITUCIONAL (Imagen 1 - Tamaño 16)
    // =================================================================
    $fila = 1;

    // Fila 1: CÍTRICOS SAAO
    $sheet->mergeCells("A{$fila}:G{$fila}");
    $sheet->setCellValue("A{$fila}", 'CÍTRICOS SAAO');
    $sheet->getRowDimension($fila)->setRowHeight(32);

    $sheet->getStyle("A{$fila}:G{$fila}")->applyFromArray([
        'font' => ['name' => 'Arial', 'bold' => true, 'size' => 16, 'color' => ['rgb' => 'FFFFFF']],
        'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '1E4620']],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER]
    ]);
    $fila++;

    // Fila 2: RESPONSIVA INDIVIDUAL - {NOMBRE_RANCHO}
    $sheet->mergeCells("A{$fila}:G{$fila}");
    $sheet->setCellValue("A{$fila}", 'RESPONSIVA INDIVIDUAL - ' . $cfg['nombre']);
    $sheet->getRowDimension($fila)->setRowHeight(32);

    $sheet->getStyle("A{$fila}:G{$fila}")->applyFromArray([
        'font' => ['name' => 'Arial', 'bold' => true, 'size' => 16, 'color' => ['rgb' => $colorTextoBanner]],
        'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $colorHex]],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER]
    ]);
    $fila += 2; // Salto a fila 4

    // =================================================================
    // 4. TABLA DE METADATOS ESPECÍFICA DE ESTE RANCHO (Imagen 1 - Tamaño 11)
    // =================================================================
    // Fila 4: Folio | Fecha | Semana
    $sheet->setCellValue("A{$fila}", 'Folio');
    $sheet->setCellValue("B{$fila}", $datosGenerales['folio'] ?? '');
    $sheet->setCellValue("C{$fila}", 'Fecha');
    $sheet->setCellValue("D{$fila}", $datosGenerales['fecha'] ?? '');
    $sheet->setCellValue("E{$fila}", 'Semana');
    $sheet->mergeCells("F{$fila}:G{$fila}");
    $sheet->setCellValue("F{$fila}", $datosGenerales['semana'] ?? '');
    $sheet->getRowDimension($fila)->setRowHeight(22);
    $fila++;

    // Fila 5: Periodo | Responsable | Puesto
    $sheet->setCellValue("A{$fila}", 'Periodo');
    $sheet->setCellValue("B{$fila}", $datosGenerales['periodo'] ?? '');
    $sheet->setCellValue("C{$fila}", 'Responsable');
    $sheet->setCellValue("D{$fila}", mb_strtoupper((string)($nomina['responsable'] ?? ''), 'UTF-8'));
    $sheet->setCellValue("E{$fila}", 'Puesto');
    $sheet->mergeCells("F{$fila}:G{$fila}");
    $sheet->setCellValue("F{$fila}", mb_strtoupper((string)($nomina['puesto'] ?? ''), 'UTF-8'));
    $sheet->getRowDimension($fila)->setRowHeight(22);
    $fila++;

    // Fila 6: Hora salida | Hora regreso | Rancho
    $sheet->setCellValue("A{$fila}", 'Hora salida');
    $sheet->setCellValue("B{$fila}", $nomina['hora_salida'] ?? '');
    $sheet->setCellValue("C{$fila}", 'Hora regreso');
    $sheet->setCellValue("D{$fila}", $nomina['hora_regreso'] ?? '');
    $sheet->setCellValue("E{$fila}", 'Rancho');
    $sheet->mergeCells("F{$fila}:G{$fila}");
    $sheet->setCellValue("F{$fila}", $cfg['nombre']);
    $sheet->getRowDimension($fila)->setRowHeight(22);
    $fila++;

    // Fila 7: Total sobres | Total efectivo | Total devuelto
    $sheet->setCellValue("A{$fila}", 'Total sobres');
    $sheet->setCellValueExplicit("B{$fila}", (float)($nomina['total_sobres'] ?? 0), \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_NUMERIC);
    $sheet->getStyle("B{$fila}")->getNumberFormat()->setFormatCode($formatoEntero);

    $sheet->setCellValue("C{$fila}", 'Total efectivo');
    $sheet->setCellValueExplicit("D{$fila}", (float)($nomina['total_efectivo'] ?? 0), \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_NUMERIC);
    $sheet->getStyle("D{$fila}")->getNumberFormat()->setFormatCode($formatoMoneda);

    $sheet->setCellValue("E{$fila}", 'Total devuelto');
    $sheet->mergeCells("F{$fila}:G{$fila}");
    $sheet->setCellValueExplicit("F{$fila}", (float)($nomina['total_devuelto'] ?? 0), \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_NUMERIC);
    $sheet->getStyle("F{$fila}")->getNumberFormat()->setFormatCode($formatoMoneda);
    $sheet->getRowDimension($fila)->setRowHeight(22);
    $fila++;

    // Fila 8: SOBRES DEVUELTOS
    $sheet->setCellValue("E{$fila}", 'SOBRES DEVUELTOS');
    $sheet->mergeCells("F{$fila}:G{$fila}");
    $sheet->setCellValueExplicit("F{$fila}", (float)($nomina['sobres_devueltos'] ?? 0), \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_NUMERIC);
    $sheet->getStyle("F{$fila}")->getNumberFormat()->setFormatCode($formatoEntero);
    $sheet->getRowDimension($fila)->setRowHeight(22);

    // Estilos generales de la tabla de metadatos (Tamaño 11 en toda la tabla)
    $sheet->getStyle("A4:G8")->applyFromArray([
        'font' => ['name' => 'Arial', 'size' => 11],
        'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => '000000']]],
        'alignment' => ['vertical' => Alignment::VERTICAL_CENTER]
    ]);

    // Negritas en las etiquetas de metadatos
    $sheet->getStyle("A4:A7")->getFont()->setBold(true);
    $sheet->getStyle("C4:C7")->getFont()->setBold(true);
    $sheet->getStyle("E4:E8")->getFont()->setBold(true);

    // Valores en rojo destacados (Folio y Semana)
    $sheet->getStyle("B4")->applyFromArray([
        'font' => ['bold' => true, 'color' => ['rgb' => 'C00000']],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]
    ]);
    $sheet->getStyle("F4")->applyFromArray([
        'font' => ['bold' => true, 'color' => ['rgb' => 'C00000']],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]
    ]);

    // Centrado de campos de datos
    $sheet->getStyle("B5:B7")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
    $sheet->getStyle("D4:D6")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
    $sheet->getStyle("D7")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
    $sheet->getStyle("F5:G8")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
    $sheet->getStyle("F7")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);

    $fila += 2; // Salto a fila 10 para la tabla

    // =================================================================
    // 5. ENCABEZADOS DE LA TABLA DE DEPARTAMENTOS (Imagen 1 - Tamaño 16)
    // =================================================================
    $encabezados = [
        'A' => 'Nómina',
        'B' => 'Sobres',
        'C' => 'Importe',
        'D' => 'Observaciones',
        'E' => 'Sobres devueltos',
        'F' => 'Importe devuelto',
        'G' => 'Incidencias'
    ];

    foreach ($encabezados as $col => $texto) {
        $sheet->setCellValue($col . $fila, $texto);
    }
    $sheet->getRowDimension($fila)->setRowHeight(36);

    $sheet->getStyle("A{$fila}:G{$fila}")->applyFromArray([
        'font' => [
            'name'  => 'Arial',
            'bold'  => true,
            'color' => ['rgb' => 'FFFFFF'],
            'size'  => 16 // Tamaño 16
        ],
        'fill' => [
            'fillType'   => Fill::FILL_SOLID,
            'startColor' => ['rgb' => '1E4620'] // Verde oscuro institucional
        ],
        'alignment' => [
            'horizontal' => Alignment::HORIZONTAL_CENTER,
            'vertical'   => Alignment::VERTICAL_CENTER,
            'wrapText'   => true
        ],
        'borders' => [
            'allBorders' => [
                'borderStyle' => Border::BORDER_THIN,
                'color'       => ['rgb' => '000000']
            ]
        ]
    ]);
    $fila++;

    // =================================================================
    // 6. FILAS DE DEPARTAMENTOS (Imagen 1 - Tamaño 14)
    // =================================================================
    $filaInicioDeptos = $fila;

    foreach ($departamentos as $depto) {
        if (!is_array($depto)) {
            continue;
        }

        $nombreDepto     = (string)($depto['nombre'] ?? '');
        $sobres          = (float)($depto['sobres'] ?? 0);
        $importe         = (float)($depto['importe'] ?? 0);
        $observaciones   = (string)($depto['observaciones'] ?? '');
        $sobresDevuelto  = (float)($depto['sobres_devueltos'] ?? 0);
        $importeDevuelto = (float)($depto['importe_devuelto'] ?? 0);
        $incidencias     = (string)($depto['incidencias'] ?? '');

        $sheet->setCellValue("A{$fila}", $nombreDepto);
        $sheet->setCellValueExplicit("B{$fila}", $sobres, \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_NUMERIC);
        $sheet->setCellValueExplicit("C{$fila}", $importe, \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_NUMERIC);
        $sheet->setCellValue("D{$fila}", $observaciones);
        $sheet->setCellValueExplicit("E{$fila}", $sobresDevuelto, \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_NUMERIC);
        $sheet->setCellValueExplicit("F{$fila}", $importeDevuelto, \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_NUMERIC);
        $sheet->setCellValue("G{$fila}", $incidencias);

        $sheet->getRowDimension($fila)->setRowHeight(28);

        // Formatos
        $sheet->getStyle("B{$fila}")->getNumberFormat()->setFormatCode($formatoEntero);
        $sheet->getStyle("C{$fila}")->getNumberFormat()->setFormatCode($formatoMoneda);
        $sheet->getStyle("E{$fila}")->getNumberFormat()->setFormatCode($formatoEntero);
        $sheet->getStyle("F{$fila}")->getNumberFormat()->setFormatCode($formatoMoneda);

        // Columna A (Nómina): Tamaño 14, alineada izquierda
        $sheet->getStyle("A{$fila}")->applyFromArray([
            'font' => ['name' => 'Arial', 'size' => 14],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT, 'vertical' => Alignment::VERTICAL_CENTER]
        ]);

        // Columnas B a G: Tamaño 14 y centradas
        $sheet->getStyle("B{$fila}:G{$fila}")->applyFromArray([
            'font' => ['name' => 'Arial', 'size' => 14],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER]
        ]);

        $sheet->getStyle("A{$fila}:G{$fila}")->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);

        if ($observaciones !== '') {
            $sheet->getStyle("D{$fila}")->applyFromArray([
                'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 14],
                'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'C00000']],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER]
            ]);
        }

        $fila++;
    }

    $filaFinDeptos = $fila - 1;

    // Fila SUBTOTAL (Tamaño 14)
    $sheet->setCellValue("A{$fila}", 'SUBTOTAL');
    $sheet->setCellValue("B{$fila}", "=SUM(B{$filaInicioDeptos}:B{$filaFinDeptos})");
    $sheet->setCellValue("C{$fila}", "=SUM(C{$filaInicioDeptos}:C{$filaFinDeptos})");
    $sheet->setCellValue("E{$fila}", "=SUM(E{$filaInicioDeptos}:E{$filaFinDeptos})");
    $sheet->setCellValue("F{$fila}", "=SUM(F{$filaInicioDeptos}:F{$filaFinDeptos})");
    $sheet->getRowDimension($fila)->setRowHeight(30);

    $sheet->getStyle("B{$fila}")->getNumberFormat()->setFormatCode($formatoEntero);
    $sheet->getStyle("C{$fila}")->getNumberFormat()->setFormatCode($formatoMoneda);
    $sheet->getStyle("E{$fila}")->getNumberFormat()->setFormatCode($formatoEntero);
    $sheet->getStyle("F{$fila}")->getNumberFormat()->setFormatCode($formatoMoneda);

    $sheet->getStyle("A{$fila}")->applyFromArray([
        'font' => ['name' => 'Arial', 'bold' => true, 'size' => 14],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER]
    ]);

    $sheet->getStyle("B{$fila}:G{$fila}")->applyFromArray([
        'font' => ['name' => 'Arial', 'bold' => true, 'size' => 14],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER]
    ]);

    $sheet->getStyle("A{$fila}:G{$fila}")->applyFromArray([
        'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'E8F5E9']],
        'borders' => [
            'allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => '000000']],
            'bottom'     => ['borderStyle' => Border::BORDER_DOUBLE, 'color' => ['rgb' => '000000']]
        ]
    ]);

    $fila += 2; // Espacio antes de la declaración y firmas

    // =================================================================
    // 7. BLOQUE DE DECLARACIÓN (Imagen 2 - Tamaño 14)
    // =================================================================
    // Fila encabezado: DECLARACIÓN
    $sheet->mergeCells("A{$fila}:G{$fila}");
    $sheet->setCellValue("A{$fila}", 'DECLARACIÓN');
    $sheet->getRowDimension($fila)->setRowHeight(26);

    $sheet->getStyle("A{$fila}:G{$fila}")->applyFromArray([
        'font' => ['name' => 'Arial', 'bold' => true, 'size' => 14, 'color' => ['rgb' => 'FFFFFF']],
        'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '1E4620']],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => '000000']]]
    ]);
    $fila++;

    // Fila texto de la declaración
    $textoDeclaracion = 'El responsable declara recibir los sobres y efectivo descritos para este rancho, comprometiéndose a su resguardo y entrega conforme a políticas internas.';
    $sheet->mergeCells("A{$fila}:G{$fila}");
    $sheet->setCellValue("A{$fila}", $textoDeclaracion);
    $sheet->getRowDimension($fila)->setRowHeight(46);

    $sheet->getStyle("A{$fila}:G{$fila}")->applyFromArray([
        'font' => ['name' => 'Arial', 'size' => 14, 'italic' => false, 'color' => ['rgb' => '7F6000']],
        'alignment' => [
            'horizontal' => Alignment::HORIZONTAL_CENTER,
            'vertical'   => Alignment::VERTICAL_CENTER,
            'wrapText'   => true
        ],
        'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => '000000']]]
    ]);
    $fila += 2; // Espacio antes de las firmas

    // =================================================================
    // 8. BLOQUE DE FIRMAS COMO TABLA CONTINUA (Imagen 2 - Tamaño 11)
    // =================================================================
    $nombreElaboro     = mb_strtoupper((string)($datosGenerales['elaboro'] ?? ''), 'UTF-8');
    $nombreResponsable = mb_strtoupper((string)($nomina['responsable'] ?? ''), 'UTF-8');
    $fechaTexto        = (string)($datosGenerales['fecha'] ?? '');

    $filaInicioFirmas = $fila;

    // Fila 1 de firmas: Títulos de sección (ENTREGA RH/TESORERÍA | RECIBE RESPONSABLE)
    $sheet->mergeCells("A{$fila}:C{$fila}");
    $sheet->setCellValue("A{$fila}", 'ENTREGA RH/TESORERÍA');

    $sheet->mergeCells("D{$fila}:G{$fila}");
    $sheet->setCellValue("D{$fila}", 'RECIBE RESPONSABLE');
    $sheet->getRowDimension($fila)->setRowHeight(24);

    $sheet->getStyle("A{$fila}:G{$fila}")->applyFromArray([
        'font' => ['name' => 'Arial', 'bold' => true, 'size' => 11],
        'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'E2EFDA']],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT, 'vertical' => Alignment::VERTICAL_CENTER, 'indent' => 1]
    ]);
    $fila++;

    // Fila 2 de firmas: Nombre
    $sheet->setCellValue("A{$fila}", 'Nombre:');
    $sheet->mergeCells("B{$fila}:C{$fila}");
    $sheet->setCellValue("B{$fila}", $nombreElaboro);

    $sheet->setCellValue("D{$fila}", 'Nombre:');
    $sheet->mergeCells("E{$fila}:G{$fila}");
    $sheet->setCellValue("E{$fila}", $nombreResponsable);
    $sheet->getRowDimension($fila)->setRowHeight(22);

    $sheet->getStyle("A{$fila}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT)->setVertical(Alignment::VERTICAL_CENTER);
    $sheet->getStyle("D{$fila}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT)->setVertical(Alignment::VERTICAL_CENTER);

    $sheet->getStyle("B{$fila}:C{$fila}")->applyFromArray([
        'font' => ['name' => 'Arial', 'bold' => true, 'color' => ['rgb' => 'C00000'], 'size' => 11],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER]
    ]);
    $sheet->getStyle("E{$fila}:G{$fila}")->applyFromArray([
        'font' => ['name' => 'Arial', 'bold' => true, 'color' => ['rgb' => 'C00000'], 'size' => 11],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER]
    ]);
    $fila++;

    // Fila 3 de firmas: Cuadros de Firma
    $sheet->setCellValue("A{$fila}", 'Firma:');
    $sheet->mergeCells("B{$fila}:C{$fila}");
    $sheet->setCellValue("B{$fila}", ''); // Espacio para firma física

    $sheet->setCellValue("D{$fila}", 'Firma:');
    $sheet->mergeCells("E{$fila}:G{$fila}");
    $sheet->setCellValue("E{$fila}", ''); // Espacio para firma física
    $sheet->getRowDimension($fila)->setRowHeight(40);

    $sheet->getStyle("A{$fila}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT)->setVertical(Alignment::VERTICAL_CENTER);
    $sheet->getStyle("D{$fila}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT)->setVertical(Alignment::VERTICAL_CENTER);
    $fila++;

    // Fila 4 de firmas: Fecha/Hora con fondo amarillo
    $sheet->setCellValue("A{$fila}", 'Fecha/Hora:');
    $sheet->mergeCells("B{$fila}:C{$fila}");
    $sheet->setCellValue("B{$fila}", $fechaTexto);

    $sheet->setCellValue("D{$fila}", 'Fecha/Hora:');
    $sheet->mergeCells("E{$fila}:G{$fila}");
    $sheet->setCellValue("E{$fila}", $fechaTexto);
    $sheet->getRowDimension($fila)->setRowHeight(22);

    $sheet->getStyle("A{$fila}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT)->setVertical(Alignment::VERTICAL_CENTER);
    $sheet->getStyle("D{$fila}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT)->setVertical(Alignment::VERTICAL_CENTER);

    // Resaltar Fecha/Hora en amarillo continuo como tabla
    $estiloAmarillo = [
        'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'FFFF00']],
        'font' => ['name' => 'Arial', 'bold' => true, 'size' => 11],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER]
    ];
    $sheet->getStyle("B{$fila}:C{$fila}")->applyFromArray($estiloAmarillo);
    $sheet->getStyle("E{$fila}:G{$fila}")->applyFromArray($estiloAmarillo);
    $fila++;

    // Fila 5: DEVOLUCIÓN / CIERRE
    $sheet->mergeCells("A{$fila}:C{$fila}");
    $sheet->setCellValue("A{$fila}", 'DEVOLUCIÓN / CIERRE');

    $sheet->mergeCells("D{$fila}:G{$fila}");
    $sheet->setCellValue("D{$fila}", 'Firma RH/Tesorería:');
    $sheet->getRowDimension($fila)->setRowHeight(22);

    $sheet->getStyle("A{$fila}:C{$fila}")->applyFromArray([
        'font' => ['name' => 'Arial', 'bold' => true, 'size' => 11],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER]
    ]);
    $sheet->getStyle("D{$fila}:G{$fila}")->applyFromArray([
        'font' => ['name' => 'Arial', 'bold' => true, 'size' => 11],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT, 'vertical' => Alignment::VERTICAL_CENTER, 'indent' => 1]
    ]);
    $fila++;

    // Fila 6: Firma/TESORERIA (cuadros de firma final)
    $sheet->setCellValue("A{$fila}", 'Firma/TESORERIA');
    $sheet->mergeCells("B{$fila}:C{$fila}");
    $sheet->setCellValue("B{$fila}", '');

    $sheet->setCellValue("D{$fila}", 'Firma/TESORERIA');
    $sheet->mergeCells("E{$fila}:G{$fila}");
    $sheet->setCellValue("E{$fila}", '');
    $sheet->getRowDimension($fila)->setRowHeight(40);

    $sheet->getStyle("A{$fila}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT)->setVertical(Alignment::VERTICAL_CENTER);
    $sheet->getStyle("D{$fila}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT)->setVertical(Alignment::VERTICAL_CENTER);

    $filaFinFirmas = $fila;

    // Aplicar estilo de tabla contable completa (con bordes en cada celda) a todo el bloque de firmas
    $sheet->getStyle("A{$filaInicioFirmas}:G{$filaFinFirmas}")->applyFromArray([
        'font' => ['name' => 'Arial', 'size' => 11],
        'borders' => [
            'allBorders' => [
                'borderStyle' => Border::BORDER_THIN,
                'color'       => ['rgb' => '000000']
            ]
        ]
    ]);

    return $sheet;
}
