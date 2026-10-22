<?php

//======================================================================
// ARCHIVO: exportarTablaGeneral.php
// PROPÓSITO: Generar la hoja consolidada de "TOTALES NÓMINAS" por semana
//            con columnas de fecha, personal, desglose por nómina,
//            total general con databar azul y variación semanal ($, %).
//======================================================================

declare(strict_types=1);

require_once __DIR__ . "/../../../vendor/autoload.php";
require_once __DIR__ . "/exportarGrafica.php";

use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Conditional;
use PhpOffice\PhpSpreadsheet\Style\ConditionalFormatting\ConditionalDataBar;
use PhpOffice\PhpSpreadsheet\Style\ConditionalFormatting\ConditionalFormatValueObject;
use PhpOffice\PhpSpreadsheet\Worksheet\PageSetup;

//======================================================================
// FUNCIÓN PRINCIPAL: construirHojaGeneral
// Construye la tabla consolidada de todas las nóminas por semana
// Recibe los datos ya calculados desde exportarTotalesExcel.php
//======================================================================
function construirHojaGeneral(
    \PhpOffice\PhpSpreadsheet\Worksheet\Worksheet $sheet,
    array $totalesPorSemana,
    int $anio,
    array $metaSemanas = []
): void {
    $tituloHoja = "TOTALES NOMINAS " . $anio;

    // ================================================================
    // 1. ORGANIZAR DATOS EN FORMATO PIVOTE
    // ================================================================
    $semanas = array_keys($totalesPorSemana);
    sort($semanas, SORT_NUMERIC);

    $historial = [];
    foreach ($semanas as $semana) {
        $fila_semana = [
            'numero_semana' => $semana,
            'relicario'     => (float) ($totalesPorSemana[$semana]['nomina_relicario'] ?? 0.0),
            'huasteca'      => (float) ($totalesPorSemana[$semana]['nomina_huasteca'] ?? 0.0),
            'pilar'         => (float) ($totalesPorSemana[$semana]['nomina_pilar'] ?? 0.0),
            '40lbs'         => (float) ($totalesPorSemana[$semana]['nomina_40lbs'] ?? 0.0),
            '10lbs'         => (float) ($totalesPorSemana[$semana]['nomina_10lbs'] ?? 0.0),
            '40lbs_jornal'  => (float) ($totalesPorSemana[$semana]['nomina_40lbs_jornal'] ?? 0.0),
            'confianza'     => (float) ($totalesPorSemana[$semana]['nomina_confianza'] ?? 0.0),
            'palmilla'      => (float) ($totalesPorSemana[$semana]['nomina_palmilla'] ?? 0.0)
        ];

        $fila_semana['total_semana'] =
            $fila_semana['relicario'] +
            $fila_semana['huasteca'] +
            $fila_semana['pilar'] +
            $fila_semana['40lbs'] +
            $fila_semana['10lbs'] +
            $fila_semana['40lbs_jornal'] +
            $fila_semana['confianza'] +
            $fila_semana['palmilla'];

        $historial[] = $fila_semana;
    }

    // Calcular cambio y porcentaje comparativo
    for ($i = 0; $i < count($historial); $i++) {
        if ($i > 0) {
            $total_anterior = $historial[$i - 1]['total_semana'];
            $total_actual   = $historial[$i]['total_semana'];

            $cambio = $total_actual - $total_anterior;
            $porcentaje = ($total_anterior > 0) ? ($cambio / $total_anterior) : 0.0;

            $historial[$i]['cambio']     = $cambio;
            $historial[$i]['porcentaje'] = $porcentaje;
        } else {
            $historial[$i]['cambio']     = null;
            $historial[$i]['porcentaje'] = null;
        }
    }

    // ================================================================
    // 2. CONFIGURACIÓN DE COLORES Y ESTILOS (COMO EN LA IMAGEN)
    // ================================================================
    $azulMarinoBanner   = '082747'; // Azul marino muy oscuro del banner superior
    $azulCabeceras      = '1B5E9E'; // Azul rey corporativo de las cabeceras de columna
    $rojoAgrupacion     = 'C00000'; // Rojo de los números 1, 2, 3...
    $verdeContableFondo = 'C6EFCE'; // Verde suave si bajó el costo
    $verdeContableTexto = '006100'; // Verde oscuro
    $rojoCambioFondo    = 'FFC7CE'; // Rojo suave si subió el costo
    $rojoCambioTexto    = '9C0006'; // Rojo oscuro

    $bordeFino = [
        'borders' => [
            'allBorders' => [
                'borderStyle' => Border::BORDER_THIN,
                'color'       => ['rgb' => '000000']
            ]
        ]
    ];

    $formatoMoneda      = '$#,##0.00;[Red]-$#,##0.00;"$ - "';
    $formatoCambioPesos = '$#,##0.00;[Red]-$#,##0.00;"$ - "';
    $formatoCambioPct   = '0.0%;-0.0%;"0.0%"';

    // ================================================================
    // 3. MAPEO DINÁMICO DE COLUMNAS
    // ================================================================
    $col_idx = 1;
    $col_sem          = Coordinate::stringFromColumnIndex($col_idx++); // A
    $col_fecha_ini    = Coordinate::stringFromColumnIndex($col_idx++); // B
    $col_fecha_al     = Coordinate::stringFromColumnIndex($col_idx++); // C
    $col_fecha_fin    = Coordinate::stringFromColumnIndex($col_idx++); // D
    $col_personal     = Coordinate::stringFromColumnIndex($col_idx++); // E

    // Columnas de nóminas (orden exacto a la imagen del usuario)
    $col_relicario    = Coordinate::stringFromColumnIndex($col_idx++); // F (1)
    $col_huasteca     = Coordinate::stringFromColumnIndex($col_idx++); // G (2)
    $col_pilar        = Coordinate::stringFromColumnIndex($col_idx++); // H (3)
    $col_40lbs        = Coordinate::stringFromColumnIndex($col_idx++); // I (4)
    $col_10lbs        = Coordinate::stringFromColumnIndex($col_idx++); // J (5)
    $col_40lbs_jornal = Coordinate::stringFromColumnIndex($col_idx++); // K (6)
    $col_confianza    = Coordinate::stringFromColumnIndex($col_idx++); // L (7)
    $col_palmilla     = Coordinate::stringFromColumnIndex($col_idx++); // M (8)

    $primeraColNomina = $col_relicario;
    $ultimaColNomina  = $col_palmilla;

    $col_total_general = Coordinate::stringFromColumnIndex($col_idx++); // N
    $col_cambio_pesos  = Coordinate::stringFromColumnIndex($col_idx++); // O
    $col_cambio_pct    = Coordinate::stringFromColumnIndex($col_idx++); // P

    $ultimaColumna = $col_cambio_pct;

    // ================================================================
    // 4. FILA 1: BANNER PRINCIPAL (TOTALES NOMINAS [AÑO])
    // ================================================================
    $fila_titulo = 1;
    $sheet->mergeCells("A{$fila_titulo}:{$ultimaColumna}{$fila_titulo}");
    $sheet->setCellValue("A{$fila_titulo}", $tituloHoja);
    $sheet->getRowDimension($fila_titulo)->setRowHeight(38);

    $sheet->getStyle("A{$fila_titulo}:{$ultimaColumna}{$fila_titulo}")->applyFromArray([
        'font' => [
            'name'  => 'Arial',
            'bold'  => true,
            'size'  => 18,
            'color' => ['rgb' => 'FFFFFF']
        ],
        'fill' => [
            'fillType'   => Fill::FILL_SOLID,
            'startColor' => ['rgb' => $azulMarinoBanner]
        ],
        'alignment' => [
            'horizontal' => Alignment::HORIZONTAL_CENTER,
            'vertical'   => Alignment::VERTICAL_CENTER
        ]
    ]);

    // ================================================================
    // 5. FILA 2: NÚMEROS DE AGRUPACIÓN (1, 2, 3...)
    // ================================================================
    $fila_numeros = 2;
    $sheet->getRowDimension($fila_numeros)->setRowHeight(22);

    $listaNumerosNominas = [
        $col_relicario    => 1,
        $col_huasteca     => 2,
        $col_pilar        => 3,
        $col_40lbs        => 4,
        $col_10lbs        => 5,
        $col_40lbs_jornal => 6,
        $col_confianza    => 7,
        $col_palmilla     => 8
    ];

    foreach ($listaNumerosNominas as $letraCol => $num) {
        $sheet->setCellValue("{$letraCol}{$fila_numeros}", $num);
        $sheet->getStyle("{$letraCol}{$fila_numeros}")->applyFromArray([
            'font' => [
                'name'  => 'Arial',
                'bold'  => true,
                'size'  => 14,
                'color' => ['rgb' => $rojoAgrupacion]
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical'   => Alignment::VERTICAL_CENTER
            ]
        ]);
    }

    // Cabecera azul sobre las últimas columnas en fila 2
    $sheet->mergeCells("{$col_total_general}{$fila_numeros}:{$ultimaColumna}{$fila_numeros}");
    $sheet->getStyle("{$col_total_general}{$fila_numeros}:{$ultimaColumna}{$fila_numeros}")->applyFromArray([
        'fill' => [
            'fillType'   => Fill::FILL_SOLID,
            'startColor' => ['rgb' => $azulCabeceras]
        ]
    ]);

    // ================================================================
    // 6. FILA 3: CABECERAS DE COLUMNA (AZUL REY CORPORATIVO)
    // ================================================================
    $fila_cabecera = 3;
    $sheet->getRowDimension($fila_cabecera)->setRowHeight(34);

    $sheet->setCellValue("{$col_sem}{$fila_cabecera}", "SEM");

    // Fecha combinada en B3:D3
    $sheet->mergeCells("{$col_fecha_ini}{$fila_cabecera}:{$col_fecha_fin}{$fila_cabecera}");
    $sheet->setCellValue("{$col_fecha_ini}{$fila_cabecera}", "FECHA");

    $sheet->setCellValue("{$col_personal}{$fila_cabecera}", "TOTAL DE\nPERSONAL");

    // Cabeceras de nóminas en orden exacto
    $sheet->setCellValue("{$col_relicario}{$fila_cabecera}", "RELICARIO\n/VIVERO");
    $sheet->setCellValue("{$col_huasteca}{$fila_cabecera}", "HUASTECA");
    $sheet->setCellValue("{$col_pilar}{$fila_cabecera}", "PILAR");
    $sheet->setCellValue("{$col_40lbs}{$fila_cabecera}", "40 LIBRAS");
    $sheet->setCellValue("{$col_10lbs}{$fila_cabecera}", "10 LIBRAS");
    $sheet->setCellValue("{$col_40lbs_jornal}{$fila_cabecera}", "40 LBS JORNAL");
    $sheet->setCellValue("{$col_confianza}{$fila_cabecera}", "CONFIANZA");
    $sheet->setCellValue("{$col_palmilla}{$fila_cabecera}", "PALMILLA");

    $sheet->setCellValue("{$col_total_general}{$fila_cabecera}", "TOTAL GENERAL");
    $sheet->setCellValue("{$col_cambio_pesos}{$fila_cabecera}", "CAMBIO $");
    $sheet->setCellValue("{$col_cambio_pct}{$fila_cabecera}", "CAMBIO %");

    $sheet->getStyle("A{$fila_cabecera}:{$ultimaColumna}{$fila_cabecera}")->applyFromArray([
        'font' => [
            'name'  => 'Arial',
            'bold'  => true,
            'size'  => 10,
            'color' => ['rgb' => 'FFFFFF']
        ],
        'fill' => [
            'fillType'   => Fill::FILL_SOLID,
            'startColor' => ['rgb' => $azulCabeceras]
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

    // ================================================================
    // 7. FILAS DE DATOS POR SEMANA
    // ================================================================
    $fila_inicio_datos = 4;
    $fila_actual       = $fila_inicio_datos;

    foreach ($historial as $idx => $semana) {
        $sheet->getRowDimension($fila_actual)->setRowHeight(24);
        $numSem = (int) $semana['numero_semana'];

        // SEM
        $sheet->setCellValue("{$col_sem}{$fila_actual}", $numSem);
        $sheet->getStyle("{$col_sem}{$fila_actual}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        // FECHA: Inicio | AL | Fin
        $metaSem = $metaSemanas[$numSem] ?? [];
        $fechaIni = formatearFechaCortaGeneral($metaSem['fecha_inicio'] ?? '');
        $fechaFin = formatearFechaCortaGeneral($metaSem['fecha_cierre'] ?? '');

        $sheet->setCellValue("{$col_fecha_ini}{$fila_actual}", $fechaIni);
        $sheet->setCellValue("{$col_fecha_al}{$fila_actual}", !empty($fechaIni) ? "AL" : "");
        $sheet->setCellValue("{$col_fecha_fin}{$fila_actual}", $fechaFin);

        $sheet->getStyle("{$col_fecha_ini}{$fila_actual}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle("{$col_fecha_al}{$fila_actual}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle("{$col_fecha_fin}{$fila_actual}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        // TOTAL DE PERSONAL
        $personalSem = $metaSem['personal'] ?? '';
        $sheet->setCellValue("{$col_personal}{$fila_actual}", $personalSem);
        $sheet->getStyle("{$col_personal}{$fila_actual}")->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => $rojoAgrupacion]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER]
        ]);

        // Columnas de nóminas individuales
        $mapaValores = [
            $col_relicario    => $semana['relicario'],
            $col_huasteca     => $semana['huasteca'],
            $col_pilar        => $semana['pilar'],
            $col_40lbs        => $semana['40lbs'],
            $col_10lbs        => $semana['10lbs'],
            $col_40lbs_jornal => $semana['40lbs_jornal'],
            $col_confianza    => $semana['confianza'],
            $col_palmilla     => $semana['palmilla']
        ];

        foreach ($mapaValores as $letraCol => $monto) {
            $sheet->setCellValueExplicit("{$letraCol}{$fila_actual}", $monto, DataType::TYPE_NUMERIC);
            $sheet->getStyle("{$letraCol}{$fila_actual}")->getNumberFormat()->setFormatCode($formatoMoneda);
            $sheet->getStyle("{$letraCol}{$fila_actual}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
        }

        // TOTAL GENERAL (Fórmula =SUM(primeraNomina:ultimaNomina))
        $formulaTotalFila = "=SUM({$primeraColNomina}{$fila_actual}:{$ultimaColNomina}{$fila_actual})";
        $sheet->setCellValue("{$col_total_general}{$fila_actual}", $formulaTotalFila);
        $sheet->getStyle("{$col_total_general}{$fila_actual}")->applyFromArray([
            'font' => [
                'name'  => 'Arial',
                'bold'  => true,
                'color' => ['rgb' => '000000']
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_RIGHT,
                'vertical'   => Alignment::VERTICAL_CENTER
            ]
        ]);
        $sheet->getStyle("{$col_total_general}{$fila_actual}")->getNumberFormat()->setFormatCode($formatoMoneda);

        // CAMBIO $ y CAMBIO %
        if ($idx > 0) {
            $filaAnt = $fila_actual - 1;

            $formulaCambioPesos = "={$col_total_general}{$fila_actual}-{$col_total_general}{$filaAnt}";
            $formulaCambioPct   = "=IF({$col_total_general}{$filaAnt}>0, ({$col_total_general}{$fila_actual}-{$col_total_general}{$filaAnt})/{$col_total_general}{$filaAnt}, 0)";

            $sheet->setCellValue("{$col_cambio_pesos}{$fila_actual}", $formulaCambioPesos);
            $sheet->setCellValue("{$col_cambio_pct}{$fila_actual}", $formulaCambioPct);

            $sheet->getStyle("{$col_cambio_pesos}{$fila_actual}")->getNumberFormat()->setFormatCode($formatoCambioPesos);
            $sheet->getStyle("{$col_cambio_pct}{$fila_actual}")->getNumberFormat()->setFormatCode($formatoCambioPct);

            $sheet->getStyle("{$col_cambio_pesos}{$fila_actual}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
            $sheet->getStyle("{$col_cambio_pct}{$fila_actual}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);

            // Colores contables según si aumentó o redujo costo
            $valCambio = $semana['cambio'];
            if ($valCambio > 0) {
                $bgCambio   = $rojoCambioFondo;
                $colorTexto = $rojoCambioTexto;
            } elseif ($valCambio < 0) {
                $bgCambio   = $verdeContableFondo;
                $colorTexto = $verdeContableTexto;
            } else {
                $bgCambio   = 'FFFFFF';
                $colorTexto = '000000';
            }

            $sheet->getStyle("{$col_cambio_pesos}{$fila_actual}:{$col_cambio_pct}{$fila_actual}")->applyFromArray([
                'fill' => [
                    'fillType'   => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => $bgCambio]
                ],
                'font' => [
                    'color' => ['rgb' => $colorTexto]
                ]
            ]);
        } else {
            $sheet->setCellValue("{$col_cambio_pesos}{$fila_actual}", "");
            $sheet->setCellValue("{$col_cambio_pct}{$fila_actual}", "");
        }

        // Bordes de celda en toda la fila de datos
        $sheet->getStyle("A{$fila_actual}:{$ultimaColumna}{$fila_actual}")->applyFromArray($bordeFino);

        $fila_actual++;
    }

    $fila_fin_datos = $fila_actual - 1;

    // ================================================================
    // 8. FILA DE TOTALES AL PIE DE LA TABLA
    // ================================================================
    $fila_totales = $fila_actual;
    $sheet->getRowDimension($fila_totales)->setRowHeight(28);

    // Celda SEM vacía
    $sheet->setCellValue("{$col_sem}{$fila_totales}", "");

    // Colocar "TOTALES" en las celdas fusionadas de FECHA
    $sheet->mergeCells("{$col_fecha_ini}{$fila_totales}:{$col_fecha_fin}{$fila_totales}");
    $sheet->setCellValue("{$col_fecha_ini}{$fila_totales}", "TOTALES");
    $sheet->getStyle("{$col_fecha_ini}{$fila_totales}:{$col_fecha_fin}{$fila_totales}")->applyFromArray([
        'font' => [
            'name'  => 'Arial',
            'bold'  => true,
            'size'  => 12,
            'color' => ['rgb' => $azulMarinoBanner]
        ],
        'alignment' => [
            'horizontal' => Alignment::HORIZONTAL_CENTER,
            'vertical'   => Alignment::VERTICAL_CENTER
        ]
    ]);

    // Celda de personal vacía
    $sheet->setCellValue("{$col_personal}{$fila_totales}", "");

    // Suma para cada columna de nómina
    foreach (array_keys($listaNumerosNominas) as $letraCol) {
        $formulaSuma = "=SUM({$letraCol}{$fila_inicio_datos}:{$letraCol}{$fila_fin_datos})";
        $sheet->setCellValue("{$letraCol}{$fila_totales}", $formulaSuma);
        $sheet->getStyle("{$letraCol}{$fila_totales}")->applyFromArray([
            'font' => [
                'name'  => 'Arial',
                'bold'  => true,
                'color' => ['rgb' => $azulMarinoBanner]
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_RIGHT,
                'vertical'   => Alignment::VERTICAL_CENTER
            ]
        ]);
        $sheet->getStyle("{$letraCol}{$fila_totales}")->getNumberFormat()->setFormatCode($formatoMoneda);
    }

    // Suma Total General
    $formulaTotalGen = "=SUM({$col_total_general}{$fila_inicio_datos}:{$col_total_general}{$fila_fin_datos})";
    $sheet->setCellValue("{$col_total_general}{$fila_totales}", $formulaTotalGen);
    $sheet->getStyle("{$col_total_general}{$fila_totales}")->applyFromArray([
        'font' => [
            'name'  => 'Arial',
            'bold'  => true,
            'size'  => 11,
            'color' => ['rgb' => $azulMarinoBanner]
        ],
        'alignment' => [
            'horizontal' => Alignment::HORIZONTAL_RIGHT,
            'vertical'   => Alignment::VERTICAL_CENTER
        ]
    ]);
    $sheet->getStyle("{$col_total_general}{$fila_totales}")->getNumberFormat()->setFormatCode($formatoMoneda);

    // Columnas cambio en blanco
    $sheet->setCellValue("{$col_cambio_pesos}{$fila_totales}", "");
    $sheet->setCellValue("{$col_cambio_pct}{$fila_totales}", "");

    $sheet->getStyle("A{$fila_totales}:{$ultimaColumna}{$fila_totales}")->applyFromArray($bordeFino);

    // ================================================================
    // 9. FORMATO CONDICIONAL: DATABAR AZUL DEGRADADO EN "TOTAL GENERAL"
    // ================================================================
    if ($fila_fin_datos >= $fila_inicio_datos) {
        $conditionalDataBar = new Conditional();
        $conditionalDataBar->setConditionType(Conditional::CONDITION_DATABAR);

        $dataBar = new ConditionalDataBar();
        $dataBar->setShowValue(true);
        $dataBar->setColor('1B5E9E'); // Azul degradado como en la captura
        $dataBar->setMinimumConditionalFormatValueObject(new ConditionalFormatValueObject('min'));
        $dataBar->setMaximumConditionalFormatValueObject(new ConditionalFormatValueObject('max'));

        $conditionalDataBar->setDataBar($dataBar);

        $sheet->setConditionalStyles("{$col_total_general}{$fila_inicio_datos}:{$col_total_general}{$fila_fin_datos}", [$conditionalDataBar]);
    }

    // ================================================================
    // 10. ANCHOS DE COLUMNAS
    // ================================================================
    $sheet->getColumnDimension($col_sem)->setWidth(7);
    $sheet->getColumnDimension($col_fecha_ini)->setWidth(11);
    $sheet->getColumnDimension($col_fecha_al)->setWidth(6);
    $sheet->getColumnDimension($col_fecha_fin)->setWidth(11);
    $sheet->getColumnDimension($col_personal)->setWidth(16);

    $sheet->getColumnDimension($col_relicario)->setWidth(16);
    $sheet->getColumnDimension($col_huasteca)->setWidth(15);
    $sheet->getColumnDimension($col_pilar)->setWidth(15);
    $sheet->getColumnDimension($col_40lbs)->setWidth(16);
    $sheet->getColumnDimension($col_10lbs)->setWidth(14);
    $sheet->getColumnDimension($col_40lbs_jornal)->setWidth(16);
    $sheet->getColumnDimension($col_confianza)->setWidth(15);
    $sheet->getColumnDimension($col_palmilla)->setWidth(15);

    $sheet->getColumnDimension($col_total_general)->setWidth(18);
    $sheet->getColumnDimension($col_cambio_pesos)->setWidth(16);
    $sheet->getColumnDimension($col_cambio_pct)->setWidth(13);

    // ================================================================
    // 11. CONFIGURACIÓN DE PÁGINA PARA IMPRESIÓN
    // ================================================================
    $pageSetup = $sheet->getPageSetup();
    $pageSetup->setOrientation(PageSetup::ORIENTATION_LANDSCAPE);
    $pageSetup->setPaperSize(PageSetup::PAPERSIZE_LETTER);
    $pageSetup->setFitToPage(true);
    $pageSetup->setFitToWidth(1);
    $pageSetup->setFitToHeight(0);
    $pageSetup->setHorizontalCentered(true);
    $pageSetup->setRowsToRepeatAtTopByStartAndEnd(2, 3);

    $sheet->getPageMargins()
        ->setTop(0.4)
        ->setBottom(0.4)
        ->setLeft(0.3)
        ->setRight(0.3)
        ->setHeader(0.2)
        ->setFooter(0.2);
}


//======================================================================
// FUNCIÓN AUXILIAR: formatearFechaCortaGeneral
// Convierte fechas a formato "27-feb"
//======================================================================
function formatearFechaCortaGeneral(?string $fechaStr): string
{
    if (empty($fechaStr)) {
        return '';
    }

    $meses = [
        1 => 'ene', 2 => 'feb', 3 => 'mar', 4 => 'abr',
        5 => 'may', 6 => 'jun', 7 => 'jul', 8 => 'ago',
        9 => 'sep', 10 => 'oct', 11 => 'nov', 12 => 'dic'
    ];

    $mesesEspanol = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    $mesesIngles  = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    $limpio = str_ireplace($mesesEspanol, $mesesIngles, trim($fechaStr));
    $timestamp = strtotime(str_replace('/', '-', $limpio));

    if ($timestamp !== false) {
        $dia = date('d', $timestamp);
        $numMes = (int) date('m', $timestamp);
        return $dia . '-' . ($meses[$numMes] ?? 'ene');
    }

    return $fechaStr;
}
