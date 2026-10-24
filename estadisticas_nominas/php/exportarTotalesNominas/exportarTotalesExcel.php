<?php

//======================================================================
// ARCHIVO: exportarTotalesExcel.php
// PROPÓSITO: Generar el archivo Excel consolidado de Totales de Nómina
//            por Año, con una pestaña por cada nómina (8 nóminas).
//            Muestra la evolución semanal de departamentos, corte, poda,
//            total general, y comparativo semanal (Cambio $ y Cambio %).
//======================================================================

declare(strict_types=1);

require_once __DIR__ . "/../../../conexion/conexion.php";
require_once __DIR__ . "/../../../vendor/autoload.php";
require_once __DIR__ . "/exportarTablaGeneral.php";
require_once __DIR__ . "/exportarGrafica.php";

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Conditional;
use PhpOffice\PhpSpreadsheet\Style\ConditionalFormatting\ConditionalDataBar;
use PhpOffice\PhpSpreadsheet\Style\ConditionalFormatting\ConditionalFormatValueObject;
use PhpOffice\PhpSpreadsheet\Worksheet\PageSetup;

/** @var mysqli $conexion */

// ---------------------------------------------------------------------
// ENRUTADOR DE ACCIONES (REQUEST ROUTING)
// ---------------------------------------------------------------------
$accion = $_POST['accion'] ?? $_GET['accion'] ?? '';

switch ($accion) {

    case 'exportarTotalesExcel':
        generarExcelTotalesNominas($conexion);
        break;

    default:
        echo json_encode([
            "success" => false,
            "mensaje" => "Acción no válida solicitada al servidor."
        ]);
        break;
}


//======================================================================
// FUNCIÓN PRINCIPAL: generarExcelTotalesNominas
//======================================================================
function generarExcelTotalesNominas(mysqli $conexion): void
{
    // =================================================================
    // PASO 1: VALIDACIÓN DEL AÑO SELECCIONADO
    // =================================================================
    $anio = isset($_POST['anio']) ? (int) $_POST['anio'] : (isset($_GET['anio']) ? (int) $_GET['anio'] : 0);

    if ($anio <= 0) {
        echo json_encode([
            "success" => false,
            "mensaje" => "No se recibió un año válido para exportar los totales."
        ]);
        return;
    }

    // =================================================================
    // PASO 2: CATÁLOGO DE LAS 8 NÓMINAS DEL SISTEMA
    // =================================================================
    $catalogoNominas = [
        [
            'clave'        => 'nomina_relicario',
            'tabla'        => 'nomina_relicario',
            'columna_json' => 'nomina_relicario',
            'nombre_hoja'  => 'RELICARIO',
            'titulo'       => 'TOTALES NOMINA RANCHO RELICARIO',
            'es_rancho'    => true,
            'rancho'       => 'relicario'
        ],
        [
            'clave'        => 'nomina_pilar',
            'tabla'        => 'nomina_pilar',
            'columna_json' => 'nomina_pilar',
            'nombre_hoja'  => 'PILAR',
            'titulo'       => 'TOTALES NOMINA RANCHO PILAR',
            'es_rancho'    => true,
            'rancho'       => 'pilar'
        ],
        [
            'clave'        => 'nomina_huasteca',
            'tabla'        => 'nomina_huasteca',
            'columna_json' => 'nomina_huasteca',
            'nombre_hoja'  => 'HUASTECA',
            'titulo'       => 'TOTALES NOMINA RANCHO HUASTECA',
            'es_rancho'    => true,
            'rancho'       => 'huasteca'
        ],
        [
            'clave'        => 'nomina_palmilla',
            'tabla'        => 'nomina_palmilla',
            'columna_json' => 'nomina_palmilla',
            'nombre_hoja'  => 'PALMILLA',
            'titulo'       => 'TOTALES NOMINA RANCHO PALMILLA',
            'es_rancho'    => true,
            'rancho'       => 'palmilla'
        ],
        [
            'clave'              => 'nomina_40lbs',
            'tabla'              => 'nomina_40lbs',
            'columna_json'       => 'nomina_40lbs',
            'nombre_hoja'        => '40 LBS',
            'titulo'             => 'TOTALES NOMINA 40 LBS',
            'es_rancho'          => false,
            'rancho'             => null,
            'dividir_por_seguro' => true
        ],
        [
            'clave'              => 'nomina_40lbs_jornal',
            'tabla'              => 'nomina_40lbs_jornal',
            'columna_json'       => 'nomina_40lbs_jornal',
            'nombre_hoja'        => '40 LBS JORNAL',
            'titulo'             => 'TOTALES NOMINA 40 LBS POR DIA',
            'es_rancho'          => false,
            'rancho'             => null,
            'dividir_por_seguro' => true
        ],
        [
            'clave'              => 'nomina_10lbs',
            'tabla'              => 'nomina_10lbs',
            'columna_json'       => 'nomina_10lbs',
            'nombre_hoja'        => '10 LBS',
            'titulo'             => 'TOTALES NOMINA 10 LBS',
            'es_rancho'          => false,
            'rancho'             => null,
            'dividir_por_seguro' => true
        ],
        [
            'clave'        => 'nomina_confianza',
            'tabla'        => 'nomina_confianza',
            'columna_json' => 'nomina_confianza',
            'nombre_hoja'  => 'CONFIANZA',
            'titulo'       => 'TOTALES NOMINA CONFIANZA',
            'es_rancho'    => false,
            'rancho'       => null
        ]
    ];

    // =================================================================
    // PASO 3: INICIALIZAR LIBRO DE EXCEL
    // =================================================================
    $spreadsheet = new Spreadsheet();
    $spreadsheet->getDefaultStyle()->getFont()->setName('Arial');

    $indiceHoja = 0;

    // Array para acumular los totales de cada nómina por semana y metadatos de fechas
    $totalesPorSemana = [];
    $metaSemanas = [];

    foreach ($catalogoNominas as $cfg) {

        // Crear una nueva hoja o usar la primera hoja por defecto
        if ($indiceHoja === 0) {
            $sheet = $spreadsheet->getActiveSheet();
        } else {
            $sheet = $spreadsheet->createSheet();
        }

        $sheet->setTitle($cfg['nombre_hoja']);
        $sheet->setShowGridLines(true);

        // Configuración de página horizontal para impresión
        $sheet->getPageSetup()->setOrientation(PageSetup::ORIENTATION_LANDSCAPE);
        $sheet->getPageSetup()->setPaperSize(PageSetup::PAPERSIZE_LETTER);
        $sheet->getPageSetup()->setHorizontalCentered(true);

        // Construir la tabla de totales de esta nómina y obtener los totales por semana
        $totalesNomina = construirHojaNomina($sheet, $conexion, $anio, $cfg, $metaSemanas);

        // Acumular los totales en el array general
        foreach ($totalesNomina as $numSemana => $total) {
            if (!isset($totalesPorSemana[$numSemana])) {
                $totalesPorSemana[$numSemana] = [];
            }
            $totalesPorSemana[$numSemana][$cfg['clave']] = $total;
        }

        $indiceHoja++;
    }

    // =================================================================
    // PASO 4: AGREGAR HOJA DE TABLA GENERAL (CONSOLIDADO DE TODAS LAS NÓMINAS)
    // =================================================================
    $sheetGeneral = $spreadsheet->createSheet();
    $sheetGeneral->setTitle('GENERAL');
    $sheetGeneral->setShowGridLines(true);
    $sheetGeneral->getPageSetup()->setOrientation(PageSetup::ORIENTATION_LANDSCAPE);
    $sheetGeneral->getPageSetup()->setPaperSize(PageSetup::PAPERSIZE_LETTER);
    $sheetGeneral->getPageSetup()->setHorizontalCentered(true);

    construirHojaGeneral($sheetGeneral, $totalesPorSemana, $anio, $metaSemanas);

    // =================================================================
    // PASO 5: AGREGAR HOJA DE TABLERO DE CONTROL Y GRÁFICAS
    // Se inserta en la primera posición (índice 0) para visualización inmediata
    // =================================================================
    $sheetGraficas = $spreadsheet->createSheet(0);
    $sheetGraficas->setTitle('TABLERO DE CONTROL');
    $sheetGraficas->setShowGridLines(true);
    $sheetGraficas->getPageSetup()->setOrientation(PageSetup::ORIENTATION_LANDSCAPE);
    $sheetGraficas->getPageSetup()->setPaperSize(PageSetup::PAPERSIZE_LETTER);
    $sheetGraficas->getPageSetup()->setHorizontalCentered(true);

    construirHojaGraficas($sheetGraficas, $totalesPorSemana, $anio);

    // Activar la pestaña del TABLERO DE CONTROL al abrir el archivo
    $spreadsheet->setActiveSheetIndex(0);

    // =================================================================
    // PASO 4: ENVÍO DIRECTO DEL ARCHIVO AL NAVEGADOR
    // =================================================================
    $nombreArchivo = "Totales_Nominas_{$anio}_" . date('Ymd_His') . ".xlsx";

    // Enviar headers para descargar el archivo directamente
    header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    header('Content-Disposition: attachment;filename="' . $nombreArchivo . '"');
    header('Cache-Control: max-age=0');

    $writer = new Xlsx($spreadsheet);
    $writer->setIncludeCharts(true); // Incluir gráficas en el archivo
    $writer->save('php://output');
    exit;
}


//======================================================================
// FUNCIÓN: construirHojaNomina
// Construye la estructura completa de una nómina individual
// Retorna un array con los totales por semana para la tabla general
//======================================================================
function construirHojaNomina(
    \PhpOffice\PhpSpreadsheet\Worksheet\Worksheet $sheet,
    mysqli $conexion,
    int $anio,
    array $cfg,
    array &$metaSemanas = []
): array {
    $tabla          = $cfg['tabla'];
    $columnaJson    = $cfg['columna_json'];
    $esRancho       = $cfg['es_rancho'];
    $rancho         = $cfg['rancho'];
    $dividirPorSeguro = $cfg['dividir_por_seguro'] ?? false;
    $tituloNomina   = $cfg['titulo'] . " " . $anio;

    // Array para acumular totales por semana (para la tabla general)
    $totalesPorSemana = [];

    // -----------------------------------------------------------------
    // 1. OBTENER TODAS LAS SEMANAS REGISTRADAS DEL AÑO PARA ESTA NÓMINA
    // -----------------------------------------------------------------
    $sqlSemanas = "SELECT numero_semana, `{$columnaJson}` AS json_nomina 
                   FROM `{$tabla}` 
                   WHERE anio = ? 
                   ORDER BY numero_semana ASC";

    $stmt = mysqli_prepare($conexion, $sqlSemanas);
    mysqli_stmt_bind_param($stmt, "i", $anio);
    mysqli_stmt_execute($stmt);
    $resSemanas = mysqli_stmt_get_result($stmt);

    $semanasData = [];
    while ($fila = mysqli_fetch_assoc($resSemanas)) {
        $numSem = (int) $fila['numero_semana'];
        $jsonData = json_decode($fila['json_nomina'], true);
        $semanasData[$numSem] = $jsonData;

        // Recolectar metadatos de fechas para la tabla general
        if (!isset($metaSemanas[$numSem])) {
            $metaSemanas[$numSem] = [
                'fecha_inicio' => $jsonData['fecha_inicio'] ?? '',
                'fecha_cierre' => $jsonData['fecha_cierre'] ?? '',
                'personal'     => 0
            ];
        } elseif (empty($metaSemanas[$numSem]['fecha_inicio']) && !empty($jsonData['fecha_inicio'])) {
            $metaSemanas[$numSem]['fecha_inicio'] = $jsonData['fecha_inicio'];
            $metaSemanas[$numSem]['fecha_cierre'] = $jsonData['fecha_cierre'] ?? '';
        }
    }
    mysqli_stmt_close($stmt);

    // -----------------------------------------------------------------
    // 2. OBTENER CORTES Y PODAS DEL AÑO (SI APLICA PARA RANCHOS)
    // -----------------------------------------------------------------
    $cortesPodasPorSemana = [];
    if ($esRancho && !empty($rancho)) {
        $sqlCP = "
            SELECT 
                n.numero_semana,
                COALESCE(c.total_cortes, 0) AS total_cortes,
                COALESCE(p.total_podas, 0) AS total_podas
            FROM `{$tabla}` n
            LEFT JOIN (
                SELECT cr.id_nomina, SUM(ct.rejas * cr.precio_reja) AS total_cortes
                FROM `cortes_{$rancho}` cr
                INNER JOIN `cortes_{$rancho}_tablas` ct ON ct.id_corte = cr.id
                WHERE cr.estado = 1
                GROUP BY cr.id_nomina
            ) c ON c.id_nomina = n.`id_nomina_{$rancho}`
            LEFT JOIN (
                SELECT po.id_nomina, SUM(pm.arboles_podados * pm.monto) AS total_podas
                FROM `podas_{$rancho}` po
                INNER JOIN `podas_movimientos_{$rancho}` pm ON pm.id_poda = po.id_poda
                GROUP BY po.id_nomina
            ) p ON p.id_nomina = n.`id_nomina_{$rancho}`
            WHERE n.anio = ?
            ORDER BY n.numero_semana ASC
        ";

        $stmtCP = mysqli_prepare($conexion, $sqlCP);
        if ($stmtCP) {
            mysqli_stmt_bind_param($stmtCP, "i", $anio);
            mysqli_stmt_execute($stmtCP);
            $resCP = mysqli_stmt_get_result($stmtCP);
            while ($filaCP = mysqli_fetch_assoc($resCP)) {
                $cortesPodasPorSemana[(int) $filaCP['numero_semana']] = [
                    'corte' => (float) $filaCP['total_cortes'],
                    'poda'  => (float) $filaCP['total_podas']
                ];
            }
            mysqli_stmt_close($stmtCP);
        }
    }

    // -----------------------------------------------------------------
    // 3. RECORRIDO EXHAUSTIVO DE DEPARTAMENTOS
    // Se inspeccionan todas las semanas del año para asegurar que ningún
    // departamento quede fuera, incluso si solo apareció en algunas semanas.
    // -----------------------------------------------------------------
    $deptosUnicos = [];
    foreach ($semanasData as $numSemana => $jsonNomina) {
        if (!empty($jsonNomina['departamentos']) && is_array($jsonNomina['departamentos'])) {
            foreach ($jsonNomina['departamentos'] as $depto) {
                $nombreDepto = trim($depto['nombre'] ?? '');
                if ($nombreDepto !== '' && !in_array($nombreDepto, $deptosUnicos, true)) {
                    $deptosUnicos[] = $nombreDepto;
                }
            }
        }
    }

    // Si la nómina no tiene departamentos registrados aún
    if (empty($deptosUnicos)) {
        $deptosUnicos = ['GENERAL'];
    }

    $numDeptos = count($deptosUnicos);

    // -----------------------------------------------------------------
    // 4. MAPEO DINÁMICO DE COLUMNAS DE EXCEL (LETRAS)
    // -----------------------------------------------------------------
    // Columna A: SEM
    // Columna B: Fecha Inicio
    // Columna C: AL
    // Columna D: Fecha Fin
    // Columna E: TOTAL DE PERSONAL
    // Si dividirPorSeguro:
    //   Columnas por departamento: CON SEGURO, SIN SEGURO
    // Si no:
    //   Columnas por departamento: Nombre del departamento
    // Columna siguiente: TOTAL
    // Si es rancho: CORTE, PODA
    // Columna siguiente: TOTAL GENERAL
    // Columna siguiente: SEMANA
    // Columna siguiente: CAMBIO $
    // Columna siguiente: CAMBIO %
    // -----------------------------------------------------------------
    $col_idx = 1;

    $col_sem          = Coordinate::stringFromColumnIndex($col_idx++); // A
    $col_fecha_ini    = Coordinate::stringFromColumnIndex($col_idx++); // B
    $col_fecha_al     = Coordinate::stringFromColumnIndex($col_idx++); // C
    $col_fecha_fin    = Coordinate::stringFromColumnIndex($col_idx++); // D
    $col_personal     = Coordinate::stringFromColumnIndex($col_idx++); // E

    // Columnas de departamentos
    $colsDeptos = [];
    if ($dividirPorSeguro) {
        // Para nóminas con seguro: cada departamento tiene 2 columnas (CON SEGURO, SIN SEGURO)
        foreach ($deptosUnicos as $nomDepto) {
            $letraColConSeguro = Coordinate::stringFromColumnIndex($col_idx++);
            $letraColSinSeguro = Coordinate::stringFromColumnIndex($col_idx++);
            $colsDeptos[$nomDepto] = [
                'con_seguro' => $letraColConSeguro,
                'sin_seguro' => $letraColSinSeguro
            ];
        }
    } else {
        // Para nóminas sin seguro: cada departamento tiene 1 columna
        foreach ($deptosUnicos as $nomDepto) {
            $letraCol = Coordinate::stringFromColumnIndex($col_idx++);
            $colsDeptos[$nomDepto] = $letraCol;
        }
    }

    $col_total_deptos = Coordinate::stringFromColumnIndex($col_idx++);

    $col_corte = null;
    $col_poda  = null;
    if ($esRancho) {
        $col_corte = Coordinate::stringFromColumnIndex($col_idx++);
        $col_poda  = Coordinate::stringFromColumnIndex($col_idx++);
    }

    $col_total_general = Coordinate::stringFromColumnIndex($col_idx++);
    $col_semana_comp   = Coordinate::stringFromColumnIndex($col_idx++);
    $col_cambio_pesos  = Coordinate::stringFromColumnIndex($col_idx++);
    $col_cambio_pct    = Coordinate::stringFromColumnIndex($col_idx++);

    $ultimaColumna = $col_cambio_pct;

    // -----------------------------------------------------------------
    // 5. ESTILOS BASE INSTITUCIONALES (COLOR DINÁMICO POR NÓMINA)
    // -----------------------------------------------------------------
    $colorTemaNomina       = obtenerColorTemaNomina($cfg['clave'], $semanasData);
    $colorTextoCabecera    = obtenerColorTextoContraste($colorTemaNomina);
    $colorTextoSobreBlanco = obtenerColorTextoParaFondoBlanco($colorTemaNomina);

    $verdeContableFondo = 'C6EFCE';
    $verdeContableTexto = '006100';
    $rojoCambioFondo   = 'FFC7CE';
    $rojoCambioTexto   = '9C0006';

    $bordeFino = [
        'borders' => [
            'allBorders' => [
                'borderStyle' => Border::BORDER_THIN,
                'color'       => ['rgb' => '000000']
            ]
        ]
    ];

    $bordeContableDoble = [
        'borders' => [
            'top' => [
                'borderStyle' => Border::BORDER_THIN,
                'color'       => ['rgb' => '000000']
            ],
            'bottom' => [
                'borderStyle' => Border::BORDER_DOUBLE,
                'color'       => ['rgb' => '000000']
            ]
        ]
    ];

    // Formatos contables de celda
    $formatoMoneda = '$#,##0.00;[Red]-$#,##0.00;"$ - "';
    $formatoCambioPesos = '$#,##0.00;[Red]-$#,##0.00;"$ - "';
    $formatoCambioPct = '0.0%;-0.0%;"0.0%"';

    // -----------------------------------------------------------------
    // 6. FILA 1: BANNER SUPERIOR CON TÍTULO
    // -----------------------------------------------------------------
    $fila_titulo = 1;
    $sheet->mergeCells("A{$fila_titulo}:{$ultimaColumna}{$fila_titulo}");
    $sheet->setCellValue("A{$fila_titulo}", $tituloNomina);
    $sheet->getRowDimension($fila_titulo)->setRowHeight(38);

    $sheet->getStyle("A{$fila_titulo}:{$ultimaColumna}{$fila_titulo}")->applyFromArray([
        'font' => [
            'name'  => 'Arial',
            'bold'  => true,
            'size'  => 18,
            'color' => ['rgb' => $colorTextoCabecera]
        ],
        'fill' => [
            'fillType'   => Fill::FILL_SOLID,
            'startColor' => ['rgb' => $colorTemaNomina]
        ],
        'alignment' => [
            'horizontal' => Alignment::HORIZONTAL_CENTER,
            'vertical'   => Alignment::VERTICAL_CENTER
        ]
    ]);

    // -----------------------------------------------------------------
    // 7. FILA 2: NÚMEROS DE AGRUPACIÓN (1, 2, 3...)
    // -----------------------------------------------------------------
    $fila_numeros = 2;
    $sheet->getRowDimension($fila_numeros)->setRowHeight(22);

    $numIdx = 1;
    if ($dividirPorSeguro) {
        // Para nóminas con seguro: número en ambas columnas (CON SEGURO y SIN SEGURO)
        foreach ($colsDeptos as $nomDepto => $cols) {
            // Número para CON SEGURO
            $sheet->setCellValue("{$cols['con_seguro']}{$fila_numeros}", $numIdx);
            $sheet->getStyle("{$cols['con_seguro']}{$fila_numeros}")->applyFromArray([
                'font' => [
                    'name'  => 'Arial',
                    'bold'  => true,
                    'size'  => 14,
                    'color' => ['rgb' => $colorTextoSobreBlanco]
                ],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical'   => Alignment::VERTICAL_CENTER
                ]
            ]);
            $numIdx++;

            // Número para SIN SEGURO
            $sheet->setCellValue("{$cols['sin_seguro']}{$fila_numeros}", $numIdx);
            $sheet->getStyle("{$cols['sin_seguro']}{$fila_numeros}")->applyFromArray([
                'font' => [
                    'name'  => 'Arial',
                    'bold'  => true,
                    'size'  => 14,
                    'color' => ['rgb' => $colorTextoSobreBlanco]
                ],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical'   => Alignment::VERTICAL_CENTER
                ]
            ]);
            $numIdx++;
        }
    } else {
        // Para nóminas sin seguro: número en cada columna de departamento
        foreach ($colsDeptos as $nomDepto => $letraCol) {
            $sheet->setCellValue("{$letraCol}{$fila_numeros}", $numIdx);
            $sheet->getStyle("{$letraCol}{$fila_numeros}")->applyFromArray([
                'font' => [
                    'name'  => 'Arial',
                    'bold'  => true,
                    'size'  => 14,
                    'color' => ['rgb' => $colorTextoSobreBlanco]
                ],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical'   => Alignment::VERTICAL_CENTER
                ]
            ]);
            $numIdx++;
        }
    }

    if ($esRancho) {
        // Número para CORTE
        $sheet->setCellValue("{$col_corte}{$fila_numeros}", $numIdx++);
        $sheet->getStyle("{$col_corte}{$fila_numeros}")->applyFromArray([
            'font' => [
                'name'  => 'Arial',
                'bold'  => true,
                'size'  => 14,
                'color' => ['rgb' => $colorTextoSobreBlanco]
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical'   => Alignment::VERTICAL_CENTER
            ]
        ]);

        // Número para PODA
        $sheet->setCellValue("{$col_poda}{$fila_numeros}", $numIdx++);
        $sheet->getStyle("{$col_poda}{$fila_numeros}")->applyFromArray([
            'font' => [
                'name'  => 'Arial',
                'bold'  => true,
                'size'  => 14,
                'color' => ['rgb' => $colorTextoSobreBlanco]
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical'   => Alignment::VERTICAL_CENTER
            ]
        ]);
    }

    // Cabecera superior temática sobre las últimas columnas
    $sheet->mergeCells("{$col_semana_comp}{$fila_numeros}:{$ultimaColumna}{$fila_numeros}");
    $sheet->getStyle("{$col_semana_comp}{$fila_numeros}:{$ultimaColumna}{$fila_numeros}")->applyFromArray([
        'fill' => [
            'fillType'   => Fill::FILL_SOLID,
            'startColor' => ['rgb' => $colorTemaNomina]
        ]
    ]);

    // -----------------------------------------------------------------
    // 8. FILA 3: CABECERAS DE COLUMNA
    // -----------------------------------------------------------------
    $fila_cabecera = 3;
    $sheet->getRowDimension($fila_cabecera)->setRowHeight(34);

    $sheet->setCellValue("{$col_sem}{$fila_cabecera}", "SEM");

    // Fecha combinada en B3:D3
    $sheet->mergeCells("{$col_fecha_ini}{$fila_cabecera}:{$col_fecha_fin}{$fila_cabecera}");
    $sheet->setCellValue("{$col_fecha_ini}{$fila_cabecera}", "FECHA");

    $sheet->setCellValue("{$col_personal}{$fila_cabecera}", "TOTAL DE\nPERSONAL");

    // Cabeceras de departamentos
    if ($dividirPorSeguro) {
        // Para nóminas con seguro: cada departamento tiene 2 columnas
        foreach ($colsDeptos as $nomDepto => $cols) {
            $sheet->setCellValue("{$cols['con_seguro']}{$fila_cabecera}", mb_strtoupper($nomDepto . "\nCON SEGURO", 'UTF-8'));
            $sheet->setCellValue("{$cols['sin_seguro']}{$fila_cabecera}", mb_strtoupper($nomDepto . "\nSIN SEGURO", 'UTF-8'));
        }
    } else {
        // Para nóminas sin seguro: cada departamento tiene 1 columna
        foreach ($colsDeptos as $nomDepto => $letraCol) {
            $sheet->setCellValue("{$letraCol}{$fila_cabecera}", mb_strtoupper($nomDepto, 'UTF-8'));
        }
    }

    // Columna Total Departamentos
    $textoTotalDeptos = "TOTAL " . implode('+', range(1, $numDeptos));
    $sheet->setCellValue("{$col_total_deptos}{$fila_cabecera}", $textoTotalDeptos);

    if ($esRancho) {
        $sheet->setCellValue("{$col_corte}{$fila_cabecera}", "CORTE");
        $sheet->setCellValue("{$col_poda}{$fila_cabecera}", "PODA");
    }

    $sheet->setCellValue("{$col_total_general}{$fila_cabecera}", "TOTAL\nGENERAL");
    $sheet->setCellValue("{$col_semana_comp}{$fila_cabecera}", "SEMANA");
    $sheet->setCellValue("{$col_cambio_pesos}{$fila_cabecera}", "CAMBIO $");
    $sheet->setCellValue("{$col_cambio_pct}{$fila_cabecera}", "CAMBIO %");

    // Estilo común de la cabecera
    $sheet->getStyle("A{$fila_cabecera}:{$ultimaColumna}{$fila_cabecera}")->applyFromArray([
        'font' => [
            'name'  => 'Arial',
            'bold'  => true,
            'size'  => 10,
            'color' => ['rgb' => $colorTextoCabecera]
        ],
        'fill' => [
            'fillType'   => Fill::FILL_SOLID,
            'startColor' => ['rgb' => $colorTemaNomina]
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

    // -----------------------------------------------------------------
    // 9. FILAS DE DATOS POR CADA SEMANA
    // -----------------------------------------------------------------
    $fila_inicio_datos = 4;
    $fila_actual       = $fila_inicio_datos;

    $semanasOrdenadas = array_keys($semanasData);
    sort($semanasOrdenadas);

    foreach ($semanasOrdenadas as $idx => $numSemana) {
        $json = $semanasData[$numSemana] ?? [];

        $sheet->getRowDimension($fila_actual)->setRowHeight(24);

        // Columna SEM
        $sheet->setCellValue("{$col_sem}{$fila_actual}", $numSemana);
        $sheet->getStyle("{$col_sem}{$fila_actual}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        // Subcolumnas de FECHA: Fecha Inicio | AL | Fecha Fin
        $fechaIniFmt = formatearFechaCorta($json['fecha_inicio'] ?? '');
        $fechaFinFmt = formatearFechaCorta($json['fecha_cierre'] ?? '');

        $sheet->setCellValue("{$col_fecha_ini}{$fila_actual}", $fechaIniFmt);
        $sheet->setCellValue("{$col_fecha_al}{$fila_actual}", "AL");
        $sheet->setCellValue("{$col_fecha_fin}{$fila_actual}", $fechaFinFmt);

        $sheet->getStyle("{$col_fecha_ini}{$fila_actual}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle("{$col_fecha_al}{$fila_actual}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle("{$col_fecha_fin}{$fila_actual}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        // Procesar departamentos y conteo de personal (mostrar = true)
        $conteosPersonal = [];
        $deptosSemanaMap = [];

        if (!empty($json['departamentos']) && is_array($json['departamentos'])) {
            foreach ($json['departamentos'] as $depto) {
                $nomD = trim($depto['nombre'] ?? '');

                if ($dividirPorSeguro) {
                    // Para nóminas con seguro: separar por seguroSocial
                    $cantPersonalConSeguro = 0;
                    $cantPersonalSinSeguro = 0;
                    $totalConSeguro = 0.0;
                    $totalSinSeguro = 0.0;

                    if (!empty($depto['empleados']) && is_array($depto['empleados'])) {
                        foreach ($depto['empleados'] as $emp) {
                            // Solo contar empleados que tienen mostrar = true
                            if (!empty($emp['mostrar'])) {
                                $tieneSeguro = !empty($emp['seguroSocial']);
                                if ($tieneSeguro) {
                                    $cantPersonalConSeguro++;
                                    $totalConSeguro += parsearNumeroMoneda($emp['total_cobrar'] ?? 0);
                                } else {
                                    $cantPersonalSinSeguro++;
                                    $totalSinSeguro += parsearNumeroMoneda($emp['total_cobrar'] ?? 0);
                                }
                            }
                        }
                    }

                    $deptosSemanaMap[$nomD] = [
                        'personal_con_seguro' => $cantPersonalConSeguro,
                        'personal_sin_seguro' => $cantPersonalSinSeguro,
                        'total_con_seguro'    => $totalConSeguro,
                        'total_sin_seguro'    => $totalSinSeguro,
                        'total_total'         => $totalConSeguro + $totalSinSeguro
                    ];
                } else {
                    // Para nóminas sin seguro: total general del departamento
                    $cantPersonal = 0;
                    $totalDepto = 0.0;

                    if (!empty($depto['empleados']) && is_array($depto['empleados'])) {
                        foreach ($depto['empleados'] as $emp) {
                            // Solo contar empleados que tienen mostrar = true
                            if (!empty($emp['mostrar'])) {
                                $cantPersonal++;
                                // Parsear el valor de total_cobrar para eliminar formato de moneda
                                $totalDepto += parsearNumeroMoneda($emp['total_cobrar'] ?? 0);
                            }
                        }
                    }

                    $deptosSemanaMap[$nomD] = [
                        'personal' => $cantPersonal,
                        'total'    => $totalDepto
                    ];
                }
            }
        }

        // Colocar montos de cada departamento y armar el string de personal
        if ($dividirPorSeguro) {
            // Para nóminas con seguro: 2 columnas por departamento
            foreach ($deptosUnicos as $nomDepto) {
                $cols = $colsDeptos[$nomDepto];
                $infoDepto = $deptosSemanaMap[$nomDepto] ?? [
                    'personal_con_seguro' => 0,
                    'personal_sin_seguro' => 0,
                    'total_con_seguro'    => 0.0,
                    'total_sin_seguro'    => 0.0,
                    'total_total'         => 0.0
                ];

                // Agregar al array de conteos en formato: "conSeguro/sinSeguro"
                $conteosPersonal[] = $infoDepto['personal_con_seguro'] . '/' . $infoDepto['personal_sin_seguro'];

                // Columna CON SEGURO
                $sheet->setCellValueExplicit("{$cols['con_seguro']}{$fila_actual}", $infoDepto['total_con_seguro'], \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_NUMERIC);
                $sheet->getStyle("{$cols['con_seguro']}{$fila_actual}")->getNumberFormat()->setFormatCode($formatoMoneda);
                $sheet->getStyle("{$cols['con_seguro']}{$fila_actual}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);

                // Columna SIN SEGURO
                $sheet->setCellValueExplicit("{$cols['sin_seguro']}{$fila_actual}", $infoDepto['total_sin_seguro'], \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_NUMERIC);
                $sheet->getStyle("{$cols['sin_seguro']}{$fila_actual}")->getNumberFormat()->setFormatCode($formatoMoneda);
                $sheet->getStyle("{$cols['sin_seguro']}{$fila_actual}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
            }
        } else {
            // Para nóminas sin seguro: 1 columna por departamento
            foreach ($deptosUnicos as $nomDepto) {
                $letraCol = $colsDeptos[$nomDepto];
                $infoDepto = $deptosSemanaMap[$nomDepto] ?? ['personal' => 0, 'total' => 0.0];

                $conteosPersonal[] = $infoDepto['personal'];

                // Mostrar el valor siempre, incluso si es negativo
                $sheet->setCellValueExplicit("{$letraCol}{$fila_actual}", $infoDepto['total'], \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_NUMERIC);
                $sheet->getStyle("{$letraCol}{$fila_actual}")->getNumberFormat()->setFormatCode($formatoMoneda);
                $sheet->getStyle("{$letraCol}{$fila_actual}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
            }
        }

        // Columna TOTAL DE PERSONAL (en negrita centrado con color temático: 7 / 23 / 3)
        $strPersonal = implode(" / ", $conteosPersonal);
        $sheet->setCellValue("{$col_personal}{$fila_actual}", $strPersonal);
        $sheet->getStyle("{$col_personal}{$fila_actual}")->applyFromArray([
            'font' => [
                'name'  => 'Arial',
                'bold'  => true,
                'color' => ['rgb' => $colorTextoSobreBlanco]
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical'   => Alignment::VERTICAL_CENTER
            ]
        ]);

        // Columna TOTAL 1+2+...+N (Fórmula de suma de los departamentos)
        if ($dividirPorSeguro) {
            // Para nóminas con seguro: sumar todas las columnas (CON SEGURO y SIN SEGURO de cada departamento)
            $colsASumar = [];
            foreach ($colsDeptos as $cols) {
                $colsASumar[] = $cols['con_seguro'];
                $colsASumar[] = $cols['sin_seguro'];
            }
            $formulaTotalDeptos = "=SUM(" . implode("{$fila_actual},", $colsASumar) . "{$fila_actual})";
        } else {
            // Para nóminas sin seguro: rango continuo de columnas
            $primeraColDepto = reset($colsDeptos);
            $ultimaColDepto  = end($colsDeptos);
            $formulaTotalDeptos = "=SUM({$primeraColDepto}{$fila_actual}:{$ultimaColDepto}{$fila_actual})";
        }

        $sheet->setCellValue("{$col_total_deptos}{$fila_actual}", $formulaTotalDeptos);
        $sheet->getStyle("{$col_total_deptos}{$fila_actual}")->applyFromArray([
            'font' => [
                'name'  => 'Arial',
                'bold'  => true,
                'color' => ['rgb' => $colorTextoSobreBlanco]
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_RIGHT,
                'vertical'   => Alignment::VERTICAL_CENTER
            ]
        ]);
        $sheet->getStyle("{$col_total_deptos}{$fila_actual}")->getNumberFormat()->setFormatCode($formatoMoneda);

        // Columnas CORTE y PODA (si es rancho)
        if ($esRancho) {
            $montoCorte = $cortesPodasPorSemana[$numSemana]['corte'] ?? 0.0;
            $montoPoda  = $cortesPodasPorSemana[$numSemana]['poda']  ?? 0.0;

            // Mostrar el valor siempre, incluso si es negativo
            $sheet->setCellValueExplicit("{$col_corte}{$fila_actual}", $montoCorte, \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_NUMERIC);
            $sheet->getStyle("{$col_corte}{$fila_actual}")->getNumberFormat()->setFormatCode($formatoMoneda);
            $sheet->getStyle("{$col_corte}{$fila_actual}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);

            $sheet->setCellValueExplicit("{$col_poda}{$fila_actual}", $montoPoda, \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_NUMERIC);
            $sheet->getStyle("{$col_poda}{$fila_actual}")->getNumberFormat()->setFormatCode($formatoMoneda);
            $sheet->getStyle("{$col_poda}{$fila_actual}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);

            // Calcular total general numérico para la tabla general
            $totalDeptoNum = 0.0;
            if ($dividirPorSeguro) {
                foreach ($deptosUnicos as $nomDepto) {
                    $cols = $colsDeptos[$nomDepto];
                    $infoDepto = $deptosSemanaMap[$nomDepto] ?? [
                        'personal_con_seguro' => 0,
                        'personal_sin_seguro' => 0,
                        'total_con_seguro'    => 0.0,
                        'total_sin_seguro'    => 0.0,
                        'total_total'         => 0.0
                    ];
                    $totalDeptoNum += $infoDepto['total_total'];
                }
            } else {
                foreach ($deptosUnicos as $nomDepto) {
                    $letraCol = $colsDeptos[$nomDepto];
                    $infoDepto = $deptosSemanaMap[$nomDepto] ?? ['personal' => 0, 'total' => 0.0];
                    $totalDeptoNum += $infoDepto['total'];
                }
            }
            $totalGeneralNum = $totalDeptoNum + $montoCorte + $montoPoda;

            // TOTAL GENERAL = Total Deptos + Corte + Poda
            $formulaTotalGen = "={$col_total_deptos}{$fila_actual} + {$col_corte}{$fila_actual} + {$col_poda}{$fila_actual}";
        } else {
            // Calcular total general numérico para la tabla general
            $totalGeneralNum = 0.0;
            if ($dividirPorSeguro) {
                foreach ($deptosUnicos as $nomDepto) {
                    $cols = $colsDeptos[$nomDepto];
                    $infoDepto = $deptosSemanaMap[$nomDepto] ?? [
                        'personal_con_seguro' => 0,
                        'personal_sin_seguro' => 0,
                        'total_con_seguro'    => 0.0,
                        'total_sin_seguro'    => 0.0,
                        'total_total'         => 0.0
                    ];
                    $totalGeneralNum += $infoDepto['total_total'];
                }
            } else {
                foreach ($deptosUnicos as $nomDepto) {
                    $letraCol = $colsDeptos[$nomDepto];
                    $infoDepto = $deptosSemanaMap[$nomDepto] ?? ['personal' => 0, 'total' => 0.0];
                    $totalGeneralNum += $infoDepto['total'];
                }
            }

            // TOTAL GENERAL = Total Deptos
            $formulaTotalGen = "={$col_total_deptos}{$fila_actual}";
        }

        // Guardar el total general en el array para la tabla general
        $totalesPorSemana[$numSemana] = $totalGeneralNum;

        // Columna TOTAL GENERAL
        $sheet->setCellValue("{$col_total_general}{$fila_actual}", $formulaTotalGen);
        $sheet->getStyle("{$col_total_general}{$fila_actual}")->applyFromArray([
            'font' => [
                'name'  => 'Arial',
                'bold'  => true,
                'color' => ['rgb' => $verdeContableTexto]
            ],
            'fill' => [
                'fillType'   => Fill::FILL_SOLID,
                'startColor' => ['rgb' => $verdeContableFondo]
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_RIGHT,
                'vertical'   => Alignment::VERTICAL_CENTER
            ]
        ]);
        $sheet->getStyle("{$col_total_general}{$fila_actual}")->getNumberFormat()->setFormatCode($formatoMoneda);

        // Columna SEMANA comparativa
        $sheet->setCellValue("{$col_semana_comp}{$fila_actual}", $numSemana);
        $sheet->getStyle("{$col_semana_comp}{$fila_actual}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        // Columnas CAMBIO $ y CAMBIO %
        if ($idx > 0) {
            $filaAnterior = $fila_actual - 1;

            // CAMBIO $ = TOTAL_ACTUAL - TOTAL_ANTERIOR
            $formulaCambioPesos = "={$col_total_general}{$fila_actual} - {$col_total_general}{$filaAnterior}";
            $sheet->setCellValue("{$col_cambio_pesos}{$fila_actual}", $formulaCambioPesos);

            // CAMBIO % = IF(TOTAL_ANTERIOR > 0, (TOTAL_ACTUAL - TOTAL_ANTERIOR) / TOTAL_ANTERIOR, 0)
            $formulaCambioPct = "=IF({$col_total_general}{$filaAnterior}>0, ({$col_total_general}{$fila_actual} - {$col_total_general}{$filaAnterior})/{$col_total_general}{$filaAnterior}, 0)";
            $sheet->setCellValue("{$col_cambio_pct}{$fila_actual}", $formulaCambioPct);

            // Formato de número
            $sheet->getStyle("{$col_cambio_pesos}{$fila_actual}")->getNumberFormat()->setFormatCode($formatoCambioPesos);
            $sheet->getStyle("{$col_cambio_pct}{$fila_actual}")->getNumberFormat()->setFormatCode($formatoCambioPct);

            $sheet->getStyle("{$col_cambio_pesos}{$fila_actual}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
            $sheet->getStyle("{$col_cambio_pct}{$fila_actual}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);

            // Calcular color de fondo dinámico para previsualización inmediata
            // Si el total de esta semana es mayor al anterior => subió costo (Rojo/Salmón)
            // Si el total de esta semana es menor al anterior => bajó costo (Verde)
            $totAct = calcularTotalEstimadoSemana($json, $cortesPodasPorSemana[$numSemana] ?? []);
            $totAnt = calcularTotalEstimadoSemana($semanasData[$semanasOrdenadas[$idx - 1]] ?? [], $cortesPodasPorSemana[$semanasOrdenadas[$idx - 1]] ?? []);

            $cambioVal = $totAct - $totAnt;
            if ($cambioVal > 0) {
                $bgCambio   = $rojoCambioFondo;
                $colorTexto = $rojoCambioTexto;
            } elseif ($cambioVal < 0) {
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
            // Primera semana no tiene semana previa
            $sheet->setCellValue("{$col_cambio_pesos}{$fila_actual}", null);
            $sheet->setCellValue("{$col_cambio_pct}{$fila_actual}", null);
        }

        // Bordes de celda en toda la fila de datos
        $sheet->getStyle("A{$fila_actual}:{$ultimaColumna}{$fila_actual}")->applyFromArray($bordeFino);

        $fila_actual++;
    }

    $fila_fin_datos = $fila_actual - 1;

    // -----------------------------------------------------------------
    // 10. FILA DE TOTALES
    // -----------------------------------------------------------------
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
            'color' => ['rgb' => $colorTextoSobreBlanco]
        ],
        'fill' => [
            'fillType'   => Fill::FILL_SOLID,
            'startColor' => ['rgb' => $verdeContableFondo]
        ],
        'alignment' => [
            'horizontal' => Alignment::HORIZONTAL_CENTER,
            'vertical'   => Alignment::VERTICAL_CENTER
        ]
    ]);

    // Total de personal (vacío o contador total)
    $sheet->setCellValue("{$col_personal}{$fila_totales}", "");
    $sheet->getStyle("{$col_personal}{$fila_totales}")->applyFromArray([
        'fill' => [
            'fillType'   => Fill::FILL_SOLID,
            'startColor' => ['rgb' => $verdeContableFondo]
        ]
    ]);

    // Totales por departamento
    if ($dividirPorSeguro) {
        // Para nóminas con seguro: sumar cada columna de CON SEGURO y SIN SEGURO
        foreach ($colsDeptos as $cols) {
            // Total CON SEGURO
            $formulaConSeguro = "=SUM({$cols['con_seguro']}{$fila_inicio_datos}:{$cols['con_seguro']}{$fila_fin_datos})";
            $sheet->setCellValue("{$cols['con_seguro']}{$fila_totales}", $formulaConSeguro);
            $sheet->getStyle("{$cols['con_seguro']}{$fila_totales}")->applyFromArray([
                'font' => [
                    'name'  => 'Arial',
                    'bold'  => true,
                    'color' => ['rgb' => $verdeContableTexto]
                ],
                'fill' => [
                    'fillType'   => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => $verdeContableFondo]
                ],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_RIGHT,
                    'vertical'   => Alignment::VERTICAL_CENTER
                ]
            ]);
            $sheet->getStyle("{$cols['con_seguro']}{$fila_totales}")->getNumberFormat()->setFormatCode($formatoMoneda);

            // Total SIN SEGURO
            $formulaSinSeguro = "=SUM({$cols['sin_seguro']}{$fila_inicio_datos}:{$cols['sin_seguro']}{$fila_fin_datos})";
            $sheet->setCellValue("{$cols['sin_seguro']}{$fila_totales}", $formulaSinSeguro);
            $sheet->getStyle("{$cols['sin_seguro']}{$fila_totales}")->applyFromArray([
                'font' => [
                    'name'  => 'Arial',
                    'bold'  => true,
                    'color' => ['rgb' => $verdeContableTexto]
                ],
                'fill' => [
                    'fillType'   => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => $verdeContableFondo]
                ],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_RIGHT,
                    'vertical'   => Alignment::VERTICAL_CENTER
                ]
            ]);
            $sheet->getStyle("{$cols['sin_seguro']}{$fila_totales}")->getNumberFormat()->setFormatCode($formatoMoneda);
        }
    } else {
        // Para nóminas sin seguro: sumar cada columna de departamento
        foreach ($colsDeptos as $letraCol) {
            $formulaTotal = "=SUM({$letraCol}{$fila_inicio_datos}:{$letraCol}{$fila_fin_datos})";
            $sheet->setCellValue("{$letraCol}{$fila_totales}", $formulaTotal);
            $sheet->getStyle("{$letraCol}{$fila_totales}")->applyFromArray([
                'font' => [
                    'name'  => 'Arial',
                    'bold'  => true,
                    'color' => ['rgb' => $verdeContableTexto]
                ],
                'fill' => [
                    'fillType'   => Fill::FILL_SOLID,
                    'startColor' => ['rgb' => $verdeContableFondo]
                ],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_RIGHT,
                    'vertical'   => Alignment::VERTICAL_CENTER
                ]
            ]);
            $sheet->getStyle("{$letraCol}{$fila_totales}")->getNumberFormat()->setFormatCode($formatoMoneda);
        }
    }

    // Total de departamentos
    $formulaTotalDeptos = "=SUM({$col_total_deptos}{$fila_inicio_datos}:{$col_total_deptos}{$fila_fin_datos})";
    $sheet->setCellValue("{$col_total_deptos}{$fila_totales}", $formulaTotalDeptos);
    $sheet->getStyle("{$col_total_deptos}{$fila_totales}")->applyFromArray([
        'font' => [
            'name'  => 'Arial',
            'bold'  => true,
            'color' => ['rgb' => $verdeContableTexto]
        ],
        'fill' => [
            'fillType'   => Fill::FILL_SOLID,
            'startColor' => ['rgb' => $verdeContableFondo]
        ],
        'alignment' => [
            'horizontal' => Alignment::HORIZONTAL_RIGHT,
            'vertical'   => Alignment::VERTICAL_CENTER
        ]
    ]);
    $sheet->getStyle("{$col_total_deptos}{$fila_totales}")->getNumberFormat()->setFormatCode($formatoMoneda);

    // Totales de CORTE y PODA (si es rancho)
    if ($esRancho) {
        $formulaCorte = "=SUM({$col_corte}{$fila_inicio_datos}:{$col_corte}{$fila_fin_datos})";
        $sheet->setCellValue("{$col_corte}{$fila_totales}", $formulaCorte);
        $sheet->getStyle("{$col_corte}{$fila_totales}")->applyFromArray([
            'font' => [
                'name'  => 'Arial',
                'bold'  => true,
                'color' => ['rgb' => $verdeContableTexto]
            ],
            'fill' => [
                'fillType'   => Fill::FILL_SOLID,
                'startColor' => ['rgb' => $verdeContableFondo]
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_RIGHT,
                'vertical'   => Alignment::VERTICAL_CENTER
            ]
        ]);
        $sheet->getStyle("{$col_corte}{$fila_totales}")->getNumberFormat()->setFormatCode($formatoMoneda);

        $formulaPoda = "=SUM({$col_poda}{$fila_inicio_datos}:{$col_poda}{$fila_fin_datos})";
        $sheet->setCellValue("{$col_poda}{$fila_totales}", $formulaPoda);
        $sheet->getStyle("{$col_poda}{$fila_totales}")->applyFromArray([
            'font' => [
                'name'  => 'Arial',
                'bold'  => true,
                'color' => ['rgb' => $verdeContableTexto]
            ],
            'fill' => [
                'fillType'   => Fill::FILL_SOLID,
                'startColor' => ['rgb' => $verdeContableFondo]
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_RIGHT,
                'vertical'   => Alignment::VERTICAL_CENTER
            ]
        ]);
        $sheet->getStyle("{$col_poda}{$fila_totales}")->getNumberFormat()->setFormatCode($formatoMoneda);
    }

    // Total General
    $formulaTotalGeneral = "=SUM({$col_total_general}{$fila_inicio_datos}:{$col_total_general}{$fila_fin_datos})";
    $sheet->setCellValue("{$col_total_general}{$fila_totales}", $formulaTotalGeneral);
    $sheet->getStyle("{$col_total_general}{$fila_totales}")->applyFromArray([
        'font' => [
            'name'  => 'Arial',
            'bold'  => true,
            'color' => ['rgb' => $verdeContableTexto]
        ],
        'fill' => [
            'fillType'   => Fill::FILL_SOLID,
            'startColor' => ['rgb' => $verdeContableFondo]
        ],
        'alignment' => [
            'horizontal' => Alignment::HORIZONTAL_RIGHT,
            'vertical'   => Alignment::VERTICAL_CENTER
        ]
    ]);
    $sheet->getStyle("{$col_total_general}{$fila_totales}")->getNumberFormat()->setFormatCode($formatoMoneda);

    // Columnas SEMANA, CAMBIO $ y CAMBIO % en blanco (sin totales)
    $sheet->setCellValue("{$col_semana_comp}{$fila_totales}", "");
    $sheet->setCellValue("{$col_cambio_pesos}{$fila_totales}", "");
    $sheet->setCellValue("{$col_cambio_pct}{$fila_totales}", "");

    // Bordes de la fila de totales
    $sheet->getStyle("A{$fila_totales}:{$ultimaColumna}{$fila_totales}")->applyFromArray($bordeFino);

    // -----------------------------------------------------------------
    // 11. ANCHOS DE COLUMNAS (AUTOAJUSTE Y FORMATO ELEGANTE)
    // -----------------------------------------------------------------
    $sheet->getColumnDimension($col_sem)->setWidth(7);
    $sheet->getColumnDimension($col_fecha_ini)->setWidth(11);
    $sheet->getColumnDimension($col_fecha_al)->setWidth(6);
    $sheet->getColumnDimension($col_fecha_fin)->setWidth(11);
    $sheet->getColumnDimension($col_personal)->setWidth(22);

    if ($dividirPorSeguro) {
        // Para nóminas con seguro: cada departamento tiene 2 columnas
        foreach ($colsDeptos as $cols) {
            $sheet->getColumnDimension($cols['con_seguro'])->setWidth(19);
            $sheet->getColumnDimension($cols['sin_seguro'])->setWidth(19);
        }
    } else {
        // Para nóminas sin seguro: cada departamento tiene 1 columna
        foreach ($colsDeptos as $letraCol) {
            $sheet->getColumnDimension($letraCol)->setWidth(19);
        }
    }

    $sheet->getColumnDimension($col_total_deptos)->setWidth(20);

    if ($esRancho) {
        $sheet->getColumnDimension($col_corte)->setWidth(16);
        $sheet->getColumnDimension($col_poda)->setWidth(16);
    }

    $sheet->getColumnDimension($col_total_general)->setWidth(20);
    $sheet->getColumnDimension($col_semana_comp)->setWidth(10);
    $sheet->getColumnDimension($col_cambio_pesos)->setWidth(17);
    $sheet->getColumnDimension($col_cambio_pct)->setWidth(14);

    // -----------------------------------------------------------------
    // 11. FORMATO CONDICIONAL: BARRA DE DATOS EN "TOTAL GENERAL"
    //     Muestra tipo gráfica qué semanas fueron más caras
    // -----------------------------------------------------------------
    if ($fila_fin_datos >= $fila_inicio_datos) {
        $conditionalDataBar = new Conditional();
        $conditionalDataBar->setConditionType(Conditional::CONDITION_DATABAR);

        $dataBar = new ConditionalDataBar();
        $dataBar->setShowValue(true);
        $dataBar->setColor($colorTemaNomina); // Color temático dinámico de la nómina
        $dataBar->setMinimumConditionalFormatValueObject(new ConditionalFormatValueObject('min'));
        $dataBar->setMaximumConditionalFormatValueObject(new ConditionalFormatValueObject('max'));

        $conditionalDataBar->setDataBar($dataBar);

        $sheet->setConditionalStyles("{$col_total_general}{$fila_inicio_datos}:{$col_total_general}{$fila_fin_datos}", [$conditionalDataBar]);
    }

    // -----------------------------------------------------------------
    // 12. CONFIGURACIÓN DE PÁGINA PARA IMPRESIÓN (CARTA / OFICIO)
    //     Ajuste al 100% del ancho (1 página de ancho horizontal)
    // -----------------------------------------------------------------
    $pageSetup = $sheet->getPageSetup();
    $pageSetup->setOrientation(PageSetup::ORIENTATION_LANDSCAPE);
    $pageSetup->setPaperSize(PageSetup::PAPERSIZE_LETTER); // Compatible con Letter / Legal al ajustar ancho
    $pageSetup->setFitToPage(true);
    $pageSetup->setFitToWidth(1);
    $pageSetup->setFitToHeight(0); // 0 permite fluir libremente hacia abajo entre páginas
    $pageSetup->setHorizontalCentered(true);
    $pageSetup->setRowsToRepeatAtTopByStartAndEnd(2, 3); // Repetir cabeceras en cada página impresa

    // Márgenes estrechos para optimizar el área de impresión
    $sheet->getPageMargins()
        ->setTop(0.4)
        ->setBottom(0.4)
        ->setLeft(0.3)
        ->setRight(0.3)
        ->setHeader(0.2)
        ->setFooter(0.2);

    // Retornar los totales por semana para la tabla general
    return $totalesPorSemana;
}


//======================================================================
// FUNCIÓN AUXILIAR: formatearFechaCorta
// Convierte fechas como "26/Dic/2025" o "2026-10-02" a "26-dic"
//======================================================================
function formatearFechaCorta(?string $fechaStr): string
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


//======================================================================
// FUNCIÓN AUXILIAR: parsearNumeroMoneda
// Convierte strings con formato de moneda a float (ej: "$121,868.29" -> 121868.29)
//======================================================================
function parsearNumeroMoneda($valor): float
{
    if ($valor === null || $valor === '') {
        return 0.0;
    }

    // Si ya es numérico, retornarlo directamente
    if (is_numeric($valor)) {
        return (float) $valor;
    }

    // Eliminar símbolos de moneda ($), espacios y comas de miles
    $limpio = str_replace(['$', ' ', ','], '', (string) $valor);

    // Convertir a float
    $numero = (float) $limpio;

    return $numero;
}


//======================================================================
// FUNCIÓN AUXILIAR: calcularTotalEstimadoSemana
// Suma rápidamente los netos de departamentos y corte/poda de una semana
//======================================================================
function calcularTotalEstimadoSemana(array $json, array $cp): float
{
    $total = 0.0;

    if (!empty($json['departamentos']) && is_array($json['departamentos'])) {
        foreach ($json['departamentos'] as $depto) {
            if (!empty($depto['empleados']) && is_array($depto['empleados'])) {
                foreach ($depto['empleados'] as $emp) {
                    if (!empty($emp['mostrar'])) {
                        // Parsear el valor de total_cobrar para eliminar formato de moneda
                        $total += parsearNumeroMoneda($emp['total_cobrar'] ?? 0);
                    }
                }
            }
        }
    }

    $total += (float) ($cp['corte'] ?? 0);
    $total += (float) ($cp['poda'] ?? 0);

    return $total;
}


//======================================================================
// FUNCIÓN AUXILIAR: obtenerColorTemaNomina
// Determina el color temático de la nómina:
// - Para 'nomina_confianza': Siempre verde (#1E7E34).
// - Para las demás: El color_reporte que más se repite entre sus departamentos.
//======================================================================
function obtenerColorTemaNomina(string $claveNomina, array $semanasData): string
{
    // Regla obligatoria: Confianza siempre es verde
    if ($claveNomina === 'nomina_confianza') {
        return '1E7E34'; // Verde corporativo
    }

    $conteoColores = [];

    foreach ($semanasData as $jsonNomina) {
        if (!empty($jsonNomina['departamentos']) && is_array($jsonNomina['departamentos'])) {
            foreach ($jsonNomina['departamentos'] as $depto) {
                $color = null;

                // 1. color_reporte (ej: ['#f6ce04'] o '#f6ce04' o [{'id_empresa':..., 'color':...}])
                if (!empty($depto['color_reporte'])) {
                    if (is_string($depto['color_reporte'])) {
                        $color = $depto['color_reporte'];
                    } elseif (is_array($depto['color_reporte'])) {
                        $primerItem = $depto['color_reporte'][0] ?? null;
                        if (is_string($primerItem)) {
                            $color = $primerItem;
                        } elseif (is_array($primerItem)) {
                            $color = $primerItem['color'] ?? ($primerItem['color_reporte'] ?? null);
                        }
                    }
                }

                // 2. Fallbacks si no viene en color_reporte
                if (!$color && !empty($depto['color'])) {
                    $color = is_string($depto['color']) ? $depto['color'] : ($depto['color'][0] ?? null);
                }
                if (!$color && !empty($depto['color_depto_nomina'])) {
                    $color = is_string($depto['color_depto_nomina']) ? $depto['color_depto_nomina'] : ($depto['color_depto_nomina'][0] ?? null);
                }

                if (!empty($color) && is_string($color)) {
                    $colorLimpio = strtoupper(ltrim(trim($color), '#'));
                    if (preg_match('/^[0-9A-F]{6}$/i', $colorLimpio)) {
                        $conteoColores[$colorLimpio] = ($conteoColores[$colorLimpio] ?? 0) + 1;
                    } elseif (preg_match('/^[0-9A-F]{3}$/i', $colorLimpio)) {
                        $color6 = $colorLimpio[0] . $colorLimpio[0] . $colorLimpio[1] . $colorLimpio[1] . $colorLimpio[2] . $colorLimpio[2];
                        $conteoColores[$color6] = ($conteoColores[$color6] ?? 0) + 1;
                    }
                }
            }
        }
    }

    // Retornar el color con mayor frecuencia
    if (!empty($conteoColores)) {
        arsort($conteoColores);
        return (string) key($conteoColores);
    }

    // Color por defecto en caso de no tener colores registrados
    return '1B365D';
}


//======================================================================
// FUNCIÓN AUXILIAR: obtenerColorTextoContraste
// Determina si el texto sobre un fondo de color debe ser blanco o negro
//======================================================================
function obtenerColorTextoContraste(string $hexColor): string
{
    $hex = ltrim($hexColor, '#');
    if (strlen($hex) === 3) {
        $hex = $hex[0] . $hex[0] . $hex[1] . $hex[1] . $hex[2] . $hex[2];
    }
    if (strlen($hex) !== 6) {
        return 'FFFFFF';
    }
    $r = hexdec(substr($hex, 0, 2));
    $g = hexdec(substr($hex, 2, 2));
    $b = hexdec(substr($hex, 4, 2));
    $yiq = (($r * 299) + ($g * 587) + ($b * 114)) / 1000;
    return ($yiq >= 150) ? '000000' : 'FFFFFF';
}


//======================================================================
// FUNCIÓN AUXILIAR: obtenerColorTextoParaFondoBlanco
// Si el color es claro (ej. amarillo #f6ce04), lo oscurece para que
// sea 100% legible como color de fuente sobre fondo blanco de celda
//======================================================================
function obtenerColorTextoParaFondoBlanco(string $hexColor): string
{
    $hex = ltrim($hexColor, '#');
    if (strlen($hex) === 6) {
        $r = hexdec(substr($hex, 0, 2));
        $g = hexdec(substr($hex, 2, 2));
        $b = hexdec(substr($hex, 4, 2));
        $yiq = (($r * 299) + ($g * 587) + ($b * 114)) / 1000;
        if ($yiq >= 140) {
            $r = (int) ($r * 0.50);
            $g = (int) ($g * 0.50);
            $b = (int) ($b * 0.50);
            return sprintf('%02X%02X%02X', $r, $g, $b);
        }
    }
    return $hexColor;
}
