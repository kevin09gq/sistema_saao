<?php

//======================================================================
// ARCHIVO: responsiva.php
// PROPÓSITO: Generar el archivo Excel de Responsivas de Pago por Rancho
//            e Independientes a partir del JSON procesado en el frontend,
//            siguiendo la estructura modular, limpia y ordenada de Tesorería.
//======================================================================

declare(strict_types=1);

require_once __DIR__ . "/../../../conexion/conexion.php";
require_once __DIR__ . "/../../../vendor/autoload.php";
require_once __DIR__ . "/responsivaIndividual.php";

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\PageSetup;

/** @var mysqli $conexion */

// ---------------------------------------------------------------------
// ENRUTADOR DE ACCIONES (REQUEST ROUTING)
// ---------------------------------------------------------------------
$accion = $_POST['accion'] ?? $_GET['accion'] ?? '';

switch ($accion) {

    case 'generarExcelResponsivas':
        generarExcelResponsivas();
        break;

    default:
        echo json_encode([
            "success" => false,
            "mensaje" => "Acción no válida solicitada al servidor."
        ]);
        break;
}


//======================================================================
// FUNCIÓN PRINCIPAL: generarExcelResponsivas
//======================================================================
function generarExcelResponsivas(): void
{
    // =================================================================
    // PASO 1: RECEPCIÓN Y VALIDACIÓN DE DATOS DEL FRONTEND
    // =================================================================
    $jsonRecibido = $_POST['json_responsivas'] ?? '';

    if (!is_string($jsonRecibido) || trim($jsonRecibido) === '') {
        echo json_encode([
            "success" => false,
            "mensaje" => "No se recibió la información de las responsivas."
        ]);
        return;
    }

    $datos = json_decode($jsonRecibido, true);

    if (!is_array($datos) || json_last_error() !== JSON_ERROR_NONE) {
        echo json_encode([
            "success" => false,
            "mensaje" => "El formato de datos recibido no es un JSON válido."
        ]);
        return;
    }

    // Extraer datos generales y separar el catálogo de nóminas
    $datosGenerales = $datos['datos_generales'] ?? [];
    unset($datos['datos_generales']);
    $nominas = $datos;

    if (empty($nominas)) {
        echo json_encode([
            "success" => false,
            "mensaje" => "No hay nóminas seleccionadas para generar las responsivas."
        ]);
        return;
    }

    // =================================================================
    // PASO 2: CREACIÓN Y CONFIGURACIÓN DEL DOCUMENTO EXCEL
    // =================================================================
    $spreadsheet = new Spreadsheet();
    $spreadsheet->getDefaultStyle()->getFont()->setName('Arial');

    $sheet = $spreadsheet->getActiveSheet();
    $sheet->setTitle('Captura General');
    $sheet->setShowGridLines(true);

    // -----------------------------------------------------------------
    // Configuración de página para impresión (Horizontal / Carta)
    // -----------------------------------------------------------------
    $sheet->getPageSetup()->setOrientation(PageSetup::ORIENTATION_LANDSCAPE);
    $sheet->getPageSetup()->setPaperSize(PageSetup::PAPERSIZE_LETTER);
    $sheet->getPageSetup()->setHorizontalCentered(true);
    $sheet->getPageSetup()->setFitToPage(true);
    $sheet->getPageSetup()->setFitToWidth(1);
    $sheet->getPageSetup()->setFitToHeight(0);

    // Márgenes estrechos para aprovechamiento del área de impresión
    $sheet->getPageMargins()->setTop(0.4);
    $sheet->getPageMargins()->setBottom(0.4);
    $sheet->getPageMargins()->setLeft(0.3);
    $sheet->getPageMargins()->setRight(0.3);

    // Ancho específico de columnas (A hasta G)
    $anchosColumnas = [
        'A' => 32, // Nómina / Concepto
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

    // Formatos contables y de moneda
    $formatoMoneda = '$#,##0.00;($#,##0.00);"$ -"';
    $formatoEntero = '#,##0;(#,##0);0';

    // =================================================================
    // PASO 3: CABECERA GENERAL Y RESUMEN INSTITUCIONAL
    // =================================================================
    $fila = 1;

    // 3.1 Título general superior
    $sheet->mergeCells("A{$fila}:G{$fila}");
    $sheet->setCellValue("A{$fila}", 'CAPTURA POR RANCHO - RESPONSIVAS INDEPENDIENTES');
    $sheet->getRowDimension($fila)->setRowHeight(28);

    $sheet->getStyle("A{$fila}:G{$fila}")->applyFromArray([
        'font' => [
            'name'  => 'Arial',
            'bold'  => true,
            'size'  => 12,
            'color' => ['rgb' => '000000']
        ],
        'alignment' => [
            'horizontal' => Alignment::HORIZONTAL_CENTER,
            'vertical'   => Alignment::VERTICAL_CENTER
        ],
        'borders' => [
            'top' => [
                'borderStyle' => Border::BORDER_MEDIUM,
                'color'       => ['rgb' => '1E4620'] // Verde institucional en franja superior
            ]
        ]
    ]);

    $fila += 2; // Salto a fila 3

    // 3.2 Tabla izquierda de Metadatos (Tamaño de letra 11)
    $camposGenerales = [
        ['Folio general',  $datosGenerales['folio'] ?? ''],
        ['Fecha',          $datosGenerales['fecha'] ?? ''],
        ['Semana nómina',  $datosGenerales['semana'] ?? ''],
        ['Periodo',        $datosGenerales['periodo'] ?? ''],
        ['Elaboró',        $datosGenerales['elaboro'] ?? '']
    ];

    $filaMeta = $fila;
    foreach ($camposGenerales as $campo) {
        $sheet->setCellValue("A{$filaMeta}", $campo[0]);
        $sheet->mergeCells("B{$filaMeta}:C{$filaMeta}");
        $sheet->setCellValue("B{$filaMeta}", $campo[1]);
        $sheet->getRowDimension($filaMeta)->setRowHeight(22);

        // Estilos de la etiqueta (Tamaño 11)
        $sheet->getStyle("A{$filaMeta}")->applyFromArray([
            'font' => ['bold' => true, 'size' => 11],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT, 'vertical' => Alignment::VERTICAL_CENTER],
            'borders'   => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => '000000']]]
        ]);

        // Estilos del valor (Tamaño 11, los primeros 4 en rojo)
        $colorTexto = ($filaMeta <= $fila + 3) ? 'C00000' : '000000';
        $sheet->getStyle("B{$filaMeta}:C{$filaMeta}")->applyFromArray([
            'font' => ['bold' => true, 'size' => 11, 'color' => ['rgb' => $colorTexto]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            'borders'   => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => '000000']]]
        ]);

        $filaMeta++;
    }

    // 3.3 Tabla derecha de Resumen (Tamaño de letra 11)
    $filaResumen = $fila;
    $resumen = [
        ['SOBRES',                    (float)($datosGenerales['sobres_general'] ?? 0),           $formatoEntero],
        ['IMPORTE DE SOBRES',         (float)($datosGenerales['importe_general'] ?? 0),          $formatoMoneda],
        ['SOBRES DEVUELTOS',          (float)($datosGenerales['sobres_devueltos_general'] ?? 0), $formatoEntero],
        ['TOTAL DE SOBRES DEVUELTOS', (float)($datosGenerales['total_sobres_devueltos'] ?? 0),  $formatoMoneda]
    ];

    foreach ($resumen as $item) {
        $sheet->mergeCells("D{$filaResumen}:E{$filaResumen}");
        $sheet->setCellValue("D{$filaResumen}", $item[0]);

        $sheet->mergeCells("F{$filaResumen}:G{$filaResumen}");
        $sheet->setCellValueExplicit("F{$filaResumen}", $item[1], \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_NUMERIC);
        $sheet->getStyle("F{$filaResumen}")->getNumberFormat()->setFormatCode($item[2]);
        $sheet->getRowDimension($filaResumen)->setRowHeight(22);

        $sheet->getStyle("D{$filaResumen}:E{$filaResumen}")->applyFromArray([
            'font' => ['bold' => true, 'size' => 11],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT, 'vertical' => Alignment::VERTICAL_CENTER],
            'borders'   => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => '000000']]]
        ]);

        $sheet->getStyle("F{$filaResumen}:G{$filaResumen}")->applyFromArray([
            'font' => ['bold' => true, 'size' => 11],
            'alignment' => ['horizontal' => ($item[2] === $formatoMoneda ? Alignment::HORIZONTAL_RIGHT : Alignment::HORIZONTAL_CENTER), 'vertical' => Alignment::VERTICAL_CENTER],
            'borders'   => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => '000000']]]
        ]);

        $filaResumen++;
    }

    $fila = max($filaMeta, $filaResumen) + 1; // Espaciado antes de los ranchos

    // =================================================================
    // PASO 4: GENERACIÓN DINÁMICA DE BLOQUES POR RANCHO / NÓMINA
    // =================================================================

    // Configuración de nombres y estilos de banner para cada nómina
    $configRanchos = [
        'nomina_relicario'    => ['nombre' => 'RANCHO EL RELICARIO', 'fondo' => 'C00000', 'color_texto' => 'FFFFFF'],
        'nomina_pilar'        => ['nombre' => 'RANCHO EL PILAR',     'fondo' => 'B4A7D6', 'color_texto' => '000000'],
        'nomina_huasteca'     => ['nombre' => 'RANCHO LA HUASTECA',  'fondo' => 'F6B26B', 'color_texto' => '000000'],
        'nomina_palmilla'     => ['nombre' => 'RANCHO LA PALMILLA',  'fondo' => '6FA8DC', 'color_texto' => 'FFFFFF'],
        'nomina_confianza'    => ['nombre' => 'CONFIANZA',           'fondo' => '4A6572', 'color_texto' => 'FFFFFF'],
        'nomina_40lbs'        => ['nombre' => '40 LBS',              'fondo' => '557A46', 'color_texto' => 'FFFFFF'],
        'nomina_40lbs_jornal' => ['nombre' => '40 LBS POR DÍA',      'fondo' => '2D5A27', 'color_texto' => 'FFFFFF'],
        'nomina_10lbs'        => ['nombre' => '10 LBS',              'fondo' => '8C6239', 'color_texto' => 'FFFFFF']
    ];

    foreach ($nominas as $claveNomina => $nomina) {
        if (!is_array($nomina)) {
            continue;
        }

        $departamentos = is_array($nomina['departamentos'] ?? null) ? $nomina['departamentos'] : [];
        if (empty($departamentos)) {
            continue;
        }

        // Obtener configuración base de nombres
        $cfg = $configRanchos[$claveNomina] ?? [
            'nombre'      => strtoupper(str_replace('_', ' ', (string)$claveNomina)),
            'fondo'       => 'C00000',
            'color_texto' => 'FFFFFF'
        ];

        // -------------------------------------------------------------
        // Obtener color dinámico del banner proveniente de color_reporte
        // -------------------------------------------------------------
        $colorHex = '';
        if (!empty($nomina['color'])) {
            $colorHex = strtoupper(ltrim((string)$nomina['color'], '#'));
        }

        // Si la nómina no traía el color directamente, buscar en sus departamentos
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

        // Si no se encontró color en el JSON, usar el color por defecto configurado
        if (strlen($colorHex) !== 6) {
            $colorHex = $cfg['fondo'];
        }

        // Calcular luminosidad para que el texto sea negro sobre fondo claro o blanco sobre oscuro
        $r = hexdec(substr($colorHex, 0, 2));
        $g = hexdec(substr($colorHex, 2, 2));
        $b = hexdec(substr($colorHex, 4, 2));
        $luminosidad = (0.299 * $r) + (0.587 * $g) + (0.114 * $b);
        $colorTextoBanner = ($luminosidad > 128) ? '000000' : 'FFFFFF';

        // -------------------------------------------------------------
        // 4.1 Banner del Rancho (Tamaño de letra 16)
        // -------------------------------------------------------------
        $sheet->mergeCells("A{$fila}:G{$fila}");
        $sheet->setCellValue("A{$fila}", $cfg['nombre']);
        $sheet->getRowDimension($fila)->setRowHeight(34);

        $sheet->getStyle("A{$fila}:G{$fila}")->applyFromArray([
            'font' => [
                'name'  => 'Arial',
                'bold'  => true,
                'size'  => 16, // Tamaño 16 solicitado
                'color' => ['rgb' => $colorTextoBanner]
            ],
            'fill' => [
                'fillType'   => Fill::FILL_SOLID,
                'startColor' => ['rgb' => $colorHex]
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_LEFT,
                'vertical'   => Alignment::VERTICAL_CENTER,
                'indent'     => 1
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color'       => ['rgb' => '000000']
                ]
            ]
        ]);
        $fila++;

        // -------------------------------------------------------------
        // 4.2 Bloque del Responsable y Horarios (Fila 1: Cabeceras Alineadas)
        // A:C = Responsable de pago | D:E = Puesto | F = Hora salida | G = Hora regreso
        // -------------------------------------------------------------
        $sheet->mergeCells("A{$fila}:C{$fila}");
        $sheet->setCellValue("A{$fila}", 'Responsable de pago');

        $sheet->mergeCells("D{$fila}:E{$fila}");
        $sheet->setCellValue("D{$fila}", 'Puesto');

        $sheet->setCellValue("F{$fila}", 'Hora salida');
        $sheet->setCellValue("G{$fila}", 'Hora regreso');
        $sheet->getRowDimension($fila)->setRowHeight(22);

        $estiloCabeceraResp = [
            'font' => ['bold' => true, 'size' => 11],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'E2EFDA']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => '000000']]]
        ];

        $sheet->getStyle("A{$fila}:C{$fila}")->applyFromArray($estiloCabeceraResp);
        $sheet->getStyle("D{$fila}:E{$fila}")->applyFromArray($estiloCabeceraResp);
        $sheet->getStyle("F{$fila}")->applyFromArray($estiloCabeceraResp);
        $sheet->getStyle("G{$fila}")->applyFromArray($estiloCabeceraResp);
        $fila++;

        // -------------------------------------------------------------
        // 4.3 Bloque del Responsable y Horarios (Fila 2: Valores Alineados)
        // A:C = Nombre | D:E = Puesto | F = Hora salida | G = Hora regreso
        // -------------------------------------------------------------
        $sheet->mergeCells("A{$fila}:C{$fila}");
        $sheet->setCellValue("A{$fila}", mb_strtoupper((string)($nomina['responsable'] ?? ''), 'UTF-8'));

        $sheet->mergeCells("D{$fila}:E{$fila}");
        $sheet->setCellValue("D{$fila}", mb_strtoupper((string)($nomina['puesto'] ?? ''), 'UTF-8'));

        $sheet->setCellValue("F{$fila}", $nomina['hora_salida'] ?? '');
        $sheet->setCellValue("G{$fila}", $nomina['hora_regreso'] ?? '');
        $sheet->getRowDimension($fila)->setRowHeight(22);

        // Nombre del responsable con fondo amarillo tenue, centrado y alineado con su cabecera A:C
        $sheet->getStyle("A{$fila}:C{$fila}")->applyFromArray([
            'font' => ['bold' => true, 'size' => 11],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'FFF2CC']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => '000000']]]
        ]);

        // Puesto centrado y alineado con su cabecera D:E
        $sheet->getStyle("D{$fila}:E{$fila}")->applyFromArray([
            'font' => ['size' => 11],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => '000000']]]
        ]);

        // Horas centradas
        $sheet->getStyle("F{$fila}")->applyFromArray([
            'font' => ['size' => 11],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => '000000']]]
        ]);

        $sheet->getStyle("G{$fila}")->applyFromArray([
            'font' => ['size' => 11],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
            'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => '000000']]]
        ]);
        $fila++;

        // -------------------------------------------------------------
        // 4.4 Encabezados de la Tabla de Departamentos (Tamaño 16)
        // -------------------------------------------------------------
        $encabezados = [
            'A' => 'Nómina',
            'B' => 'Sobres',
            'C' => 'Importe',
            'D' => 'Observaciones',
            'E' => 'Sobres devuelto',
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
                'size'  => 16 // Tamaño 16 solicitado
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

        // -------------------------------------------------------------
        // 4.5 Filas de Departamentos
        // Columna Nómina (A): tamaño 14
        // Todas las demás columnas (B a G): tamaño 12 y centrados
        // -------------------------------------------------------------
        $filaInicioDeptos = $fila;

        foreach ($departamentos as $depto) {
            if (!is_array($depto)) {
                continue;
            }

            $nombreDepto    = (string)($depto['nombre'] ?? '');
            $sobres         = (float)($depto['sobres'] ?? 0);
            $importe        = (float)($depto['importe'] ?? 0);
            $observaciones  = (string)($depto['observaciones'] ?? '');
            $sobresDevuelto = (float)($depto['sobres_devueltos'] ?? 0);
            $importeDevuelto= (float)($depto['importe_devuelto'] ?? 0);
            $incidencias    = (string)($depto['incidencias'] ?? '');

            $sheet->setCellValue("A{$fila}", $nombreDepto);
            $sheet->setCellValueExplicit("B{$fila}", $sobres, \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_NUMERIC);
            $sheet->setCellValueExplicit("C{$fila}", $importe, \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_NUMERIC);
            $sheet->setCellValue("D{$fila}", $observaciones);
            $sheet->setCellValueExplicit("E{$fila}", $sobresDevuelto, \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_NUMERIC);
            $sheet->setCellValueExplicit("F{$fila}", $importeDevuelto, \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_NUMERIC);
            $sheet->setCellValue("G{$fila}", $incidencias);

            $sheet->getRowDimension($fila)->setRowHeight(28);

            // Formatos de número y moneda
            $sheet->getStyle("B{$fila}")->getNumberFormat()->setFormatCode($formatoEntero);
            $sheet->getStyle("C{$fila}")->getNumberFormat()->setFormatCode($formatoMoneda);
            $sheet->getStyle("E{$fila}")->getNumberFormat()->setFormatCode($formatoEntero);
            $sheet->getStyle("F{$fila}")->getNumberFormat()->setFormatCode($formatoMoneda);

            // 1. Columna Nómina (A): Tamaño 14, alineada a la izquierda
            $sheet->getStyle("A{$fila}")->applyFromArray([
                'font' => [
                    'name' => 'Arial',
                    'size' => 14
                ],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_LEFT,
                    'vertical'   => Alignment::VERTICAL_CENTER
                ]
            ]);

            // 2. Todas las demás columnas (B a G): Tamaño 12 y CENTRADAS
            $sheet->getStyle("B{$fila}:G{$fila}")->applyFromArray([
                'font' => [
                    'name' => 'Arial',
                    'size' => 12
                ],
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                    'vertical'   => Alignment::VERTICAL_CENTER
                ]
            ]);

            // Bordes delgados en toda la fila de datos
            $sheet->getStyle("A{$fila}:G{$fila}")->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN);

            // Destacar observaciones si contiene texto especial (ejemplo: SALVADOR A PILAR en rojo con texto blanco)
            if ($observaciones !== '') {
                $sheet->getStyle("D{$fila}")->applyFromArray([
                    'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF'], 'size' => 12],
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'C00000']],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER]
                ]);
            }

            $fila++;
        }

        $filaFinDeptos = $fila - 1;

        // -------------------------------------------------------------
        // 4.6 Fila de SUBTOTAL con fórmulas vivas de Excel
        // -------------------------------------------------------------
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

        // Subtotal Nómina: Tamaño 14 negrita
        $sheet->getStyle("A{$fila}")->applyFromArray([
            'font' => ['name' => 'Arial', 'bold' => true, 'size' => 14],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER]
        ]);

        // Subtotal columnas B a G: Tamaño 12 negrita centrados
        $sheet->getStyle("B{$fila}:G{$fila}")->applyFromArray([
            'font' => ['name' => 'Arial', 'bold' => true, 'size' => 12],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER]
        ]);

        $sheet->getStyle("A{$fila}:G{$fila}")->applyFromArray([
            'fill' => [
                'fillType'   => Fill::FILL_SOLID,
                'startColor' => ['rgb' => 'E8F5E9'] // Verde claro contable
            ],
            'alignment' => [
                'vertical' => Alignment::VERTICAL_CENTER
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color'       => ['rgb' => '000000']
                ],
                'bottom' => [
                    'borderStyle' => Border::BORDER_DOUBLE,
                    'color'       => ['rgb' => '000000'] // Doble borde inferior contable
                ]
            ]
        ]);

        $fila += 2; // Espacio entre ranchos
    }

    // =================================================================
    // PASO 4.7: GENERACIÓN DE HOJAS INDIVIDUALES POR CADA NÓMINA
    // Se crean pestañas independientes por rancho (Imágenes 1 y 2)
    // =================================================================
    foreach ($nominas as $claveNomina => $nomina) {
        if (!is_array($nomina) || empty($nomina['departamentos'])) {
            continue;
        }

        agregarHojaResponsivaIndividual(
            $spreadsheet,
            (string)$claveNomina,
            $nomina,
            $datosGenerales,
            $configRanchos
        );
    }

    // Dejar la primera hoja ("Captura General") como pestaña activa al abrir el archivo
    $spreadsheet->setActiveSheetIndex(0);

    // =================================================================
    // PASO 5: ENVÍO DIRECTO DEL ARCHIVO AL NAVEGADOR
    // =================================================================
    $semanaLimpia    = preg_replace('/[^A-Za-z0-9_\-]/', '_', (string)($datosGenerales['semana'] ?? 'gen'));
    $nombre_archivo  = 'responsivas_nomina_' . $semanaLimpia . '_' . date('Ymd_His') . '.xlsx';

    // Enviar headers para descargar el archivo directamente
    header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    header('Content-Disposition: attachment;filename="' . $nombre_archivo . '"');
    header('Cache-Control: max-age=0');

    $writer = new Xlsx($spreadsheet);
    $writer->save('php://output');
    exit;
}
