<?php

//======================================================================
// ARCHIVO: exportarGrafica.php
// PROPÓSITO: Generar la hoja ejecutiva de "TABLERO DE CONTROL" con
//            tarjetas KPI, tabla comparativa de nóminas, tabla de
//            semanas extremas (más alta y más baja) y dos gráficas
//            integradas nativamente en Excel (Barras y Líneas).
//======================================================================

declare(strict_types=1);

require_once __DIR__ . "/../../../vendor/autoload.php";

use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Cell\DataType;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Conditional;
use PhpOffice\PhpSpreadsheet\Style\ConditionalFormatting\ConditionalDataBar;
use PhpOffice\PhpSpreadsheet\Style\ConditionalFormatting\ConditionalFormatValueObject;
use PhpOffice\PhpSpreadsheet\Worksheet\PageSetup;
use PhpOffice\PhpSpreadsheet\Chart\Chart;
use PhpOffice\PhpSpreadsheet\Chart\DataSeries;
use PhpOffice\PhpSpreadsheet\Chart\DataSeriesValues;
use PhpOffice\PhpSpreadsheet\Chart\PlotArea;
use PhpOffice\PhpSpreadsheet\Chart\Title;
use PhpOffice\PhpSpreadsheet\Chart\Legend;

//======================================================================
// FUNCIÓN PRINCIPAL: construirHojaGraficas
// Construye el Tablero de Control completo con tablas y gráficas
//======================================================================
function construirHojaGraficas(
    \PhpOffice\PhpSpreadsheet\Worksheet\Worksheet $sheet,
    array $totalesPorSemana,
    int $anio
): void {
    $nombreHoja = $sheet->getTitle();
    $tituloDashboard = "TABLERO DE CONTROL PARA NÓMINAS " . $anio;

    // ================================================================
    // 1. CALCULAR ESTADÍSTICAS GENERALES Y TOTALES
    // ================================================================
    $semanas = array_keys($totalesPorSemana);
    sort($semanas, SORT_NUMERIC);

    if (empty($semanas)) {
        return;
    }

    $ultimaSemana = end($semanas);
    $cantSemanas = count($semanas);
    $semanaAnterior = $cantSemanas > 1 ? $semanas[$cantSemanas - 2] : null;

    // Totales por semana agrupados
    $totalesSemanas = [];
    foreach ($totalesPorSemana as $sem => $nominas) {
        $totalesSemanas[$sem] = array_sum($nominas);
    }

    // Totales de última semana y semana anterior
    $totalUltimaNomina = $totalesSemanas[$ultimaSemana] ?? 0.0;
    $totalSemanaAnterior = $semanaAnterior !== null ? ($totalesSemanas[$semanaAnterior] ?? 0.0) : 0.0;

    // Variación semana actual vs semana anterior
    $variacionVsPesos = $totalUltimaNomina - $totalSemanaAnterior;
    $variacionVsPct = $totalSemanaAnterior > 0 ? ($variacionVsPesos / $totalSemanaAnterior) : 0.0;

    // Acumulado del año
    $acumuladoAnio = array_sum($totalesSemanas);

    // Promedio semanal
    $promedioSemanal = $cantSemanas > 0 ? ($acumuladoAnio / $cantSemanas) : 0.0;

    // Semana más alta y más baja
    $semanaMasAltaMonto = !empty($totalesSemanas) ? max($totalesSemanas) : 0.0;
    $semanaMasBajaMonto = !empty($totalesSemanas) ? min($totalesSemanas) : 0.0;
    $numeroSemanaAlta   = array_search($semanaMasAltaMonto, $totalesSemanas, true);
    $numeroSemanaBaja   = array_search($semanaMasBajaMonto, $totalesSemanas, true);

    // ================================================================
    // 2. PALETA DE COLORES Y ESTILOS CORPORATIVOS
    // ================================================================
    $azulMarinoPrincipal = '0F3057'; // Fondo del Banner principal
    $azulCabeceras       = '2E6B9E'; // Fondo de cabeceras de tablas
    $azulOscuroTablas    = '0B2F50'; // Fondo de cabecera de la tabla de áreas
    $azulTextoKpi        = '0B2F50'; // Texto de los valores KPI
    $fondoKpiValores     = 'F2F6FA'; // Fondo suave para las tarjetas
    $fondoExtremos       = 'FFF2CC'; // Fondo amarillo pastel para semanas extremas
    $verdeContableFondo  = 'C6EFCE';
    $verdeContableTexto  = '006100';
    $rojoTexto           = 'C00000';

    $bordeFino = [
        'borders' => [
            'allBorders' => [
                'borderStyle' => Border::BORDER_THIN,
                'color'       => ['rgb' => 'D0D7DE']
            ]
        ]
    ];

    $bordeCuadro = [
        'borders' => [
            'outline' => [
                'borderStyle' => Border::BORDER_MEDIUM,
                'color'       => ['rgb' => '2E6B9E']
            ],
            'allBorders' => [
                'borderStyle' => Border::BORDER_THIN,
                'color'       => ['rgb' => 'B0C4DE']
            ]
        ]
    ];

    $formatoMoneda    = '$#,##0.00;[Red]-$#,##0.00;"$0.00"';
    $formatoMonedaSinDec = '$#,##0;[Red]-$#,##0;"$0"';
    $formatoPorcentaje = '0.0%';

    // ================================================================
    // 3. FILA 1: BANNER PRINCIPAL (TABLERO DE CONTROL)
    // ================================================================
    $fila_titulo = 1;
    $sheet->mergeCells("A{$fila_titulo}:P{$fila_titulo}");
    $sheet->setCellValue("A{$fila_titulo}", $tituloDashboard);
    $sheet->getRowDimension($fila_titulo)->setRowHeight(38);

    $sheet->getStyle("A{$fila_titulo}:P{$fila_titulo}")->applyFromArray([
        'font' => [
            'name'  => 'Arial',
            'bold'  => true,
            'size'  => 16,
            'color' => ['rgb' => 'FFFFFF']
        ],
        'fill' => [
            'fillType'   => Fill::FILL_SOLID,
            'startColor' => ['rgb' => $azulMarinoPrincipal]
        ],
        'alignment' => [
            'horizontal' => Alignment::HORIZONTAL_CENTER,
            'vertical'   => Alignment::VERTICAL_CENTER
        ]
    ]);

    // Fila 2: Espacio
    $sheet->getRowDimension(2)->setRowHeight(10);

    // ================================================================
    // 4. FILAS 3 Y 4: TARJETAS KPI (RESUMEN GENERAL)
    // ================================================================
    $fila_kpi_head = 3;
    $fila_kpi_val  = 4;

    $sheet->getRowDimension($fila_kpi_head)->setRowHeight(22);
    $sheet->getRowDimension($fila_kpi_val)->setRowHeight(30);

    // Cabeceras KPI
    $sheet->mergeCells("B{$fila_kpi_head}:C{$fila_kpi_head}");
    $sheet->setCellValue("B{$fila_kpi_head}", "NÓMINA ÚLTIMA SEMANA");

    $sheet->mergeCells("D{$fila_kpi_head}:E{$fila_kpi_head}");
    $sheet->setCellValue("D{$fila_kpi_head}", "SEMANA ACTUAL");

    $sheet->mergeCells("F{$fila_kpi_head}:G{$fila_kpi_head}");
    $sheet->setCellValue("F{$fila_kpi_head}", "VARIACIÓN VS");

    $sheet->mergeCells("H{$fila_kpi_head}:I{$fila_kpi_head}");
    $sheet->setCellValue("H{$fila_kpi_head}", "ACUMULADO " . $anio);

    $sheet->mergeCells("J{$fila_kpi_head}:K{$fila_kpi_head}");
    $sheet->setCellValue("J{$fila_kpi_head}", "PROMEDIO SEMANAL");

    $sheet->getStyle("B{$fila_kpi_head}:K{$fila_kpi_head}")->applyFromArray([
        'font' => [
            'name'  => 'Arial',
            'bold'  => true,
            'size'  => 9,
            'color' => ['rgb' => 'FFFFFF']
        ],
        'fill' => [
            'fillType'   => Fill::FILL_SOLID,
            'startColor' => ['rgb' => $azulCabeceras]
        ],
        'alignment' => [
            'horizontal' => Alignment::HORIZONTAL_CENTER,
            'vertical'   => Alignment::VERTICAL_CENTER
        ]
    ]);

    // Valores KPI
    $sheet->mergeCells("B{$fila_kpi_val}:C{$fila_kpi_val}");
    $sheet->setCellValueExplicit("B{$fila_kpi_val}", $totalUltimaNomina, DataType::TYPE_NUMERIC);
    $sheet->getStyle("B{$fila_kpi_val}")->getNumberFormat()->setFormatCode($formatoMoneda);

    $sheet->mergeCells("D{$fila_kpi_val}:E{$fila_kpi_val}");
    $sheet->setCellValueExplicit("D{$fila_kpi_val}", $ultimaSemana, DataType::TYPE_NUMERIC);

    $sheet->mergeCells("F{$fila_kpi_val}:G{$fila_kpi_val}");
    $sheet->setCellValueExplicit("F{$fila_kpi_val}", $variacionVsPct, DataType::TYPE_NUMERIC);
    $sheet->getStyle("F{$fila_kpi_val}")->getNumberFormat()->setFormatCode($formatoPorcentaje);

    $sheet->mergeCells("H{$fila_kpi_val}:I{$fila_kpi_val}");
    $sheet->setCellValueExplicit("H{$fila_kpi_val}", $acumuladoAnio, DataType::TYPE_NUMERIC);
    $sheet->getStyle("H{$fila_kpi_val}")->getNumberFormat()->setFormatCode($formatoMoneda);

    $sheet->mergeCells("J{$fila_kpi_val}:K{$fila_kpi_val}");
    $sheet->setCellValueExplicit("J{$fila_kpi_val}", $promedioSemanal, DataType::TYPE_NUMERIC);
    $sheet->getStyle("J{$fila_kpi_val}")->getNumberFormat()->setFormatCode($formatoMoneda);

    $sheet->getStyle("B{$fila_kpi_val}:K{$fila_kpi_val}")->applyFromArray([
        'font' => [
            'name'  => 'Arial',
            'bold'  => true,
            'size'  => 13,
            'color' => ['rgb' => $azulTextoKpi]
        ],
        'fill' => [
            'fillType'   => Fill::FILL_SOLID,
            'startColor' => ['rgb' => $fondoKpiValores]
        ],
        'alignment' => [
            'horizontal' => Alignment::HORIZONTAL_CENTER,
            'vertical'   => Alignment::VERTICAL_CENTER
        ]
    ]);
    $sheet->getStyle("B{$fila_kpi_head}:K{$fila_kpi_val}")->applyFromArray($bordeFino);

    // Fila 5: Espacio
    $sheet->getRowDimension(5)->setRowHeight(12);

    // ================================================================
    // 5. TABLA DE LAS 8 NÓMINAS / ÁREAS (IZQUIERDA)
    // ================================================================
    $fila_tabla_head = 6;
    $sheet->getRowDimension($fila_tabla_head)->setRowHeight(26);

    $sheet->setCellValue("A{$fila_tabla_head}", "ÁREA");
    $sheet->setCellValue("B{$fila_tabla_head}", "SEMANA\nACTUAL");
    $sheet->setCellValue("C{$fila_tabla_head}", "SEMANA\nANTERIOR");
    $sheet->setCellValue("D{$fila_tabla_head}", "CAMBIO\n$");
    $sheet->setCellValue("E{$fila_tabla_head}", "CAMBIO\n%");
    $sheet->setCellValue("F{$fila_tabla_head}", "PARTICIPACI\nÓN");

    $sheet->getStyle("A{$fila_tabla_head}:F{$fila_tabla_head}")->applyFromArray([
        'font' => [
            'name'  => 'Arial',
            'bold'  => true,
            'size'  => 9,
            'color' => ['rgb' => 'FFFFFF']
        ],
        'fill' => [
            'fillType'   => Fill::FILL_SOLID,
            'startColor' => ['rgb' => $azulOscuroTablas]
        ],
        'alignment' => [
            'horizontal' => Alignment::HORIZONTAL_CENTER,
            'vertical'   => Alignment::VERTICAL_CENTER,
            'wrapText'   => true
        ]
    ]);

    // Catálogo de las 8 nóminas ordenado
    $catalogoNominas = [
        'nomina_40lbs'        => '40 LIBRAS',
        'nomina_40lbs_jornal' => '40 LIBRAS JORNAL',
        'nomina_10lbs'        => '10 LIBRAS',
        'nomina_relicario'    => 'RELICARIO',
        'nomina_pilar'        => 'PILAR',
        'nomina_huasteca'     => 'HUASTECA',
        'nomina_palmilla'     => 'PALMILLA',
        'nomina_confianza'    => 'CONFIANZA'
    ];

    $fila_inicio_nominas = 7;
    $fila_actual = $fila_inicio_nominas;

    foreach ($catalogoNominas as $claveNomina => $nombreArea) {
        $sheet->getRowDimension($fila_actual)->setRowHeight(20);

        $montoActual = (float) ($totalesPorSemana[$ultimaSemana][$claveNomina] ?? 0.0);
        $montoAnterior = $semanaAnterior !== null ? (float) ($totalesPorSemana[$semanaAnterior][$claveNomina] ?? 0.0) : 0.0;

        // Nombre de área
        $sheet->setCellValue("A{$fila_actual}", $nombreArea);
        $sheet->getStyle("A{$fila_actual}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);

        // Semana Actual
        $sheet->setCellValueExplicit("B{$fila_actual}", $montoActual, DataType::TYPE_NUMERIC);
        $sheet->getStyle("B{$fila_actual}")->getNumberFormat()->setFormatCode($formatoMoneda);
        $sheet->getStyle("B{$fila_actual}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);

        // Semana Anterior
        $sheet->setCellValueExplicit("C{$fila_actual}", $montoAnterior, DataType::TYPE_NUMERIC);
        $sheet->getStyle("C{$fila_actual}")->getNumberFormat()->setFormatCode($formatoMoneda);
        $sheet->getStyle("C{$fila_actual}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);

        // Cambio $ = B - C
        $sheet->setCellValue("D{$fila_actual}", "=B{$fila_actual}-C{$fila_actual}");
        $sheet->getStyle("D{$fila_actual}")->getNumberFormat()->setFormatCode($formatoMoneda);
        $sheet->getStyle("D{$fila_actual}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);

        // Si subió el costo, texto en rojo suave
        $diferencia = $montoActual - $montoAnterior;
        if ($diferencia > 0) {
            $sheet->getStyle("D{$fila_actual}")->getFont()->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color($rojoTexto));
        }

        // Cambio % = IF(C>0, (B-C)/C, 0)
        $sheet->setCellValue("E{$fila_actual}", "=IF(C{$fila_actual}>0, (B{$fila_actual}-C{$fila_actual})/C{$fila_actual}, 0)");
        $sheet->getStyle("E{$fila_actual}")->getNumberFormat()->setFormatCode($formatoPorcentaje);
        $sheet->getStyle("E{$fila_actual}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);

        // Participación = IF($B$Total>0, B/Total, 0) (se calculará con la celda B15)
        $sheet->setCellValue("F{$fila_actual}", "=IF(\$B\$15>0, B{$fila_actual}/\$B\$15, 0)");
        $sheet->getStyle("F{$fila_actual}")->getNumberFormat()->setFormatCode($formatoPorcentaje);
        $sheet->getStyle("F{$fila_actual}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);

        $sheet->getStyle("A{$fila_actual}:F{$fila_actual}")->applyFromArray($bordeFino);
        $fila_actual++;
    }

    $fila_fin_nominas = $fila_actual - 1;

    // Fila 15: Totales de la tabla
    $fila_totales_tabla = $fila_actual;
    $sheet->getRowDimension($fila_totales_tabla)->setRowHeight(22);
    $sheet->setCellValue("A{$fila_totales_tabla}", "TOTAL GENERAL");
    $sheet->setCellValue("B{$fila_totales_tabla}", "=SUM(B{$fila_inicio_nominas}:B{$fila_fin_nominas})");
    $sheet->setCellValue("C{$fila_totales_tabla}", "=SUM(C{$fila_inicio_nominas}:C{$fila_fin_nominas})");
    $sheet->setCellValue("D{$fila_totales_tabla}", "=B{$fila_totales_tabla}-C{$fila_totales_tabla}");
    $sheet->setCellValue("E{$fila_totales_tabla}", "=IF(C{$fila_totales_tabla}>0, (B{$fila_totales_tabla}-C{$fila_totales_tabla})/C{$fila_totales_tabla}, 0)");
    $sheet->setCellValue("F{$fila_totales_tabla}", "=SUM(F{$fila_inicio_nominas}:F{$fila_fin_nominas})");

    $sheet->getStyle("B{$fila_totales_tabla}:D{$fila_totales_tabla}")->getNumberFormat()->setFormatCode($formatoMoneda);
    $sheet->getStyle("E{$fila_totales_tabla}:F{$fila_totales_tabla}")->getNumberFormat()->setFormatCode($formatoPorcentaje);

    $sheet->getStyle("A{$fila_totales_tabla}:F{$fila_totales_tabla}")->applyFromArray([
        'font' => [
            'name'  => 'Arial',
            'bold'  => true,
            'size'  => 10,
            'color' => ['rgb' => $azulOscuroTablas]
        ],
        'fill' => [
            'fillType'   => Fill::FILL_SOLID,
            'startColor' => ['rgb' => $fondoKpiValores]
        ],
        'alignment' => [
            'vertical' => Alignment::VERTICAL_CENTER
        ]
    ]);
    $sheet->getStyle("B{$fila_totales_tabla}:F{$fila_totales_tabla}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
    $sheet->getStyle("A{$fila_totales_tabla}:F{$fila_totales_tabla}")->applyFromArray($bordeFino);

    // Formato condicional: Data Bar verde en columna Participación (F7:F14)
    if ($fila_fin_nominas >= $fila_inicio_nominas) {
        $conditionalDataBar = new Conditional();
        $conditionalDataBar->setConditionType(Conditional::CONDITION_DATABAR);
        $dataBar = new ConditionalDataBar();
        $dataBar->setShowValue(true);
        $dataBar->setColor('63BE7B'); // Verde pastel
        $dataBar->setMinimumConditionalFormatValueObject(new ConditionalFormatValueObject('min'));
        $dataBar->setMaximumConditionalFormatValueObject(new ConditionalFormatValueObject('max'));
        $conditionalDataBar->setDataBar($dataBar);
        $sheet->setConditionalStyles("F{$fila_inicio_nominas}:F{$fila_fin_nominas}", [$conditionalDataBar]);
    }

    // ================================================================
    // 6. TABLA: SEMANA MÁS ALTA Y SEMANA MÁS BAJA (DERECHA)
    // ================================================================
    $sheet->mergeCells("H{$fila_tabla_head}:J{$fila_tabla_head}");
    $sheet->setCellValue("H{$fila_tabla_head}", "SEMANA MÁS ALTA");

    $sheet->mergeCells("K{$fila_tabla_head}:M{$fila_tabla_head}");
    $sheet->setCellValue("K{$fila_tabla_head}", "SEMANA MÁS BAJA");

    $sheet->getStyle("H{$fila_tabla_head}:M{$fila_tabla_head}")->applyFromArray([
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
            'vertical'   => Alignment::VERTICAL_CENTER
        ]
    ]);

    // Fila de montos extremos (combinada filas 7 y 8 para dar impacto visual)
    $sheet->mergeCells("H7:J8");
    $sheet->setCellValueExplicit("H7", $semanaMasAltaMonto, DataType::TYPE_NUMERIC);
    $sheet->getStyle("H7")->getNumberFormat()->setFormatCode($formatoMoneda);

    $sheet->mergeCells("K7:M8");
    $sheet->setCellValueExplicit("K7", $semanaMasBajaMonto, DataType::TYPE_NUMERIC);
    $sheet->getStyle("K7")->getNumberFormat()->setFormatCode($formatoMoneda);

    $sheet->getStyle("H7:M8")->applyFromArray([
        'font' => [
            'name'  => 'Arial',
            'bold'  => true,
            'size'  => 15,
            'color' => ['rgb' => '000000']
        ],
        'fill' => [
            'fillType'   => Fill::FILL_SOLID,
            'startColor' => ['rgb' => $fondoExtremos]
        ],
        'alignment' => [
            'horizontal' => Alignment::HORIZONTAL_CENTER,
            'vertical'   => Alignment::VERTICAL_CENTER
        ]
    ]);
    $sheet->getStyle("H{$fila_tabla_head}:M8")->applyFromArray($bordeFino);

    // ================================================================
    // 7. DATOS HISTÓRICOS AUXILIARES PARA LA GRÁFICA DE TENDENCIA
    //    Se colocan en columnas a la derecha (R, S, T)
    // ================================================================
    $sheet->setCellValue("R1", "SEMANA");
    $sheet->setCellValue("S1", "TOTAL SEMANAL");
    $sheet->setCellValue("T1", "ACUMULADO");

    $sheet->getStyle("R1:T1")->applyFromArray([
        'font' => ['bold' => true, 'size' => 9, 'color' => ['rgb' => 'FFFFFF']],
        'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => $azulCabeceras]],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]
    ]);

    $filaAux = 2;
    $acumuladoTemp = 0.0;
    foreach ($semanas as $sem) {
        $totSem = (float) ($totalesSemanas[$sem] ?? 0.0);
        $acumuladoTemp += $totSem;

        $sheet->setCellValueExplicit("R{$filaAux}", "Sem " . $sem, DataType::TYPE_STRING);
        $sheet->setCellValueExplicit("S{$filaAux}", $totSem, DataType::TYPE_NUMERIC);
        $sheet->setCellValueExplicit("T{$filaAux}", $acumuladoTemp, DataType::TYPE_NUMERIC);

        $sheet->getStyle("S{$filaAux}:T{$filaAux}")->getNumberFormat()->setFormatCode($formatoMoneda);
        $sheet->getStyle("R{$filaAux}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $filaAux++;
    }
    $filaFinAux = $filaAux - 1;
    $numPuntosHist = count($semanas);

    // ================================================================
    // 8. GRÁFICA 1: NÓMINA POR ÁREA — SEMANA MÁS RECIENTE (COLUMNAS)
    // ================================================================
    $numNominas = count($catalogoNominas);

    // Categorías (Eje X): Nombres de las nóminas en A7:A14
    $cat1 = [
        new DataSeriesValues(
            DataSeriesValues::DATASERIES_TYPE_STRING,
            "'{$nombreHoja}'!\$A\${$fila_inicio_nominas}:\$A\${$fila_fin_nominas}",
            null,
            $numNominas
        )
    ];

    // Valores (Eje Y): Importes de la semana actual en B7:B14
    $val1 = [
        new DataSeriesValues(
            DataSeriesValues::DATASERIES_TYPE_NUMBER,
            "'{$nombreHoja}'!\$B\${$fila_inicio_nominas}:\$B\${$fila_fin_nominas}",
            null,
            $numNominas
        )
    ];

    $series1 = new DataSeries(
        DataSeries::TYPE_BARCHART,
        DataSeries::GROUPING_CLUSTERED,
        range(0, count($val1) - 1),
        [],
        $cat1,
        $val1
    );
    $series1->setPlotDirection(DataSeries::DIRECTION_COL);

    $plotArea1 = new PlotArea(null, [$series1]);
    $title1 = new Title('Nómina por área — semana más reciente');
    $xAxisLabel1 = new Title('Área');
    $yAxisLabel1 = new Title('Importe de nómina');

    $chart1 = new Chart(
        'chart_area_reciente',
        $title1,
        null, // Sin leyenda para mayor claridad
        $plotArea1,
        true,
        DataSeries::DEFAULT_EMPTY_AS,
        $xAxisLabel1,
        $yAxisLabel1
    );

    // Ubicación debajo de la tabla de áreas
    $chart1->setTopLeftPosition("A17");
    $chart1->setBottomRightPosition("G35");
    $sheet->addChart($chart1);

    // ================================================================
    // 9. GRÁFICA 2: TENDENCIA SEMANAL DE NÓMINA — (LÍNEA)
    // ================================================================
    // Categorías (Eje X): Semanas en R2:R{filaFinAux}
    $cat2 = [
        new DataSeriesValues(
            DataSeriesValues::DATASERIES_TYPE_STRING,
            "'{$nombreHoja}'!\$R\$2:\$R\${$filaFinAux}",
            null,
            $numPuntosHist
        )
    ];

    // Valores (Eje Y): Total Semanal en S2:S{filaFinAux}
    $val2 = [
        new DataSeriesValues(
            DataSeriesValues::DATASERIES_TYPE_NUMBER,
            "'{$nombreHoja}'!\$S\$2:\$S\${$filaFinAux}",
            null,
            $numPuntosHist
        )
    ];

    $series2 = new DataSeries(
        DataSeries::TYPE_LINECHART,
        DataSeries::GROUPING_STANDARD,
        range(0, count($val2) - 1),
        [],
        $cat2,
        $val2
    );

    $plotArea2 = new PlotArea(null, [$series2]);
    $title2 = new Title('Tendencia semanal de nómina —');
    $xAxisLabel2 = new Title('Semana');
    $yAxisLabel2 = new Title('Nómina total');

    $chart2 = new Chart(
        'chart_tendencia_semanal',
        $title2,
        null,
        $plotArea2,
        true,
        DataSeries::DEFAULT_EMPTY_AS,
        $xAxisLabel2,
        $yAxisLabel2
    );

    // Ubicación a la derecha, debajo de la tabla de extremos (idéntico a la imagen)
    $chart2->setTopLeftPosition("H10");
    $chart2->setBottomRightPosition("Q35");
    $sheet->addChart($chart2);

    // ================================================================
    // 10. ANCHOS DE COLUMNAS
    // ================================================================
    $sheet->getColumnDimension('A')->setWidth(24);
    $sheet->getColumnDimension('B')->setWidth(18);
    $sheet->getColumnDimension('C')->setWidth(18);
    $sheet->getColumnDimension('D')->setWidth(16);
    $sheet->getColumnDimension('E')->setWidth(12);
    $sheet->getColumnDimension('F')->setWidth(16);
    $sheet->getColumnDimension('G')->setWidth(3);  // Separador
    $sheet->getColumnDimension('H')->setWidth(14);
    $sheet->getColumnDimension('I')->setWidth(14);
    $sheet->getColumnDimension('J')->setWidth(14);
    $sheet->getColumnDimension('K')->setWidth(14);
    $sheet->getColumnDimension('L')->setWidth(14);
    $sheet->getColumnDimension('M')->setWidth(14);
    $sheet->getColumnDimension('N')->setWidth(14);
    $sheet->getColumnDimension('O')->setWidth(14);
    $sheet->getColumnDimension('P')->setWidth(14);
    $sheet->getColumnDimension('Q')->setWidth(3);
    $sheet->getColumnDimension('R')->setWidth(12);
    $sheet->getColumnDimension('S')->setWidth(16);
    $sheet->getColumnDimension('T')->setWidth(16);

    // ================================================================
    // 11. CONFIGURACIÓN DE PÁGINA
    // ================================================================
    $pageSetup = $sheet->getPageSetup();
    $pageSetup->setOrientation(PageSetup::ORIENTATION_LANDSCAPE);
    $pageSetup->setPaperSize(PageSetup::PAPERSIZE_LETTER);
    $pageSetup->setFitToPage(true);
    $pageSetup->setFitToWidth(1);
    $pageSetup->setFitToHeight(0);
    $pageSetup->setHorizontalCentered(true);

    $sheet->getPageMargins()
        ->setTop(0.4)
        ->setBottom(0.4)
        ->setLeft(0.3)
        ->setRight(0.3)
        ->setHeader(0.2)
        ->setFooter(0.2);
}
