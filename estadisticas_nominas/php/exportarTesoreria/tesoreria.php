<?php

//======================================================================
// ARCHIVO: tesoreria.php
// PROPÓSITO: Generar el archivo Excel consolidado de Tesorería con las
//            percepciones fijas y percepciones extras dinámicas de cada
//            departamento de la nómina.
//======================================================================

require_once __DIR__ . "/../../../conexion/conexion.php";
require_once __DIR__ . "/../../../vendor/autoload.php";

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Worksheet\PageSetup;

/** @var mysqli $conexion */

// ---------------------------------------------------------------------
// ENRUTADOR DE ACCIONES (REQUEST ROUTING)
// ---------------------------------------------------------------------
$accion = $_POST['accion'] ?? $_GET['accion'] ?? '';

switch ($accion) {

    case 'generarExcelTesoreria':
        generarExcelTesoreria();
        break;

    default:
        echo json_encode([
            "success" => false,
            "mensaje" => "Acción no válida solicitada al servidor."
        ]);
        break;
}


//======================================================================
// FUNCIÓN PRINCIPAL: generarExcelTesoreria
//======================================================================
function generarExcelTesoreria()
{
    // =================================================================
    // PASO 1: RECEPCIÓN Y VALIDACIÓN DE DATOS DEL FRONTEND
    // =================================================================
    // Se obtienen el año, la semana y el arreglo JSON de departamentos
    $anio               = $_POST['anio'] ?? '';
    $semana             = $_POST['semana'] ?? $_POST['ultima_semana'] ?? '';
    $departamentos_json = $_POST['departamentos'] ?? '';

    // Validar que no falte ningún dato esencial
    if (empty($anio) || empty($semana) || empty($departamentos_json)) {
        echo json_encode([
            "success" => false,
            "mensaje" => "Faltan parámetros obligatorios (año, semana o departamentos)."
        ]);
        return;
    }

    // Convertir el JSON recibido en un array asociativo de PHP
    $departamentos = json_decode($departamentos_json, true);

    // Validar que la decodificación fue exitosa y existan elementos
    if (!is_array($departamentos) || empty($departamentos)) {
        echo json_encode([
            "success" => false,
            "mensaje" => "No se recibieron departamentos válidos para procesar."
        ]);
        return;
    }

    // =================================================================
    // PASO 2: DEFINICIÓN DE COLUMNAS (FIJAS + DINÁMICAS)
    // =================================================================

    // -----------------------------------------------------------------
    // 2.1 Percepciones fijas de la nómina
    // Cada elemento define:
    // - titulo: Texto que aparecerá en la fila de cabecera del Excel.
    // - campo: Llave del objeto departamento de donde se lee el valor.
    // - tipo: 'texto' o 'moneda' (los tipos moneda tendrán formato $#,##0.00).
    // - ancho: Ancho de la columna en Excel.
    // - alineacion: Alineación horizontal (izquierda o derecha).
    // -----------------------------------------------------------------
    $columnas_definicion = [
        [
            'titulo'     => 'NOMBRE',
            'campo'      => 'nombre_departamento',
            'categoria'  => 'texto',
            'tipo'       => 'texto',
            'ancho'      => 34,
            'alineacion' => Alignment::HORIZONTAL_LEFT
        ],
        [
            'titulo'     => 'SUELDO BRUTO',
            'campo'      => 'sueldo_bruto',
            'categoria'  => 'percepcion',
            'tipo'       => 'moneda',
            'ancho'      => 26,
            'alineacion' => Alignment::HORIZONTAL_CENTER
        ],
        [
            'titulo'     => 'INCENTIVO',
            'campo'      => 'incentivo',
            'categoria'  => 'percepcion',
            'tipo'       => 'moneda',
            'ancho'      => 24,
            'alineacion' => Alignment::HORIZONTAL_CENTER
        ],
        [
            'titulo'     => 'HORAS EXTRA',
            'campo'      => 'horas_extra',
            'categoria'  => 'percepcion',
            'tipo'       => 'moneda',
            'ancho'      => 24,
            'alineacion' => Alignment::HORIZONTAL_CENTER
        ],
        [
            'titulo'     => 'BONO ANTIGÜEDAD',
            'campo'      => 'bono_antiguedad',
            'categoria'  => 'percepcion',
            'tipo'       => 'moneda',
            'ancho'      => 26,
            'alineacion' => Alignment::HORIZONTAL_CENTER
        ],
        [
            'titulo'     => 'ACTIVIDADES ESPECIALES',
            'campo'      => 'actividades_especiales',
            'categoria'  => 'percepcion',
            'tipo'       => 'moneda',
            'ancho'      => 30,
            'alineacion' => Alignment::HORIZONTAL_CENTER
        ],
        [
            'titulo'     => 'PUESTO',
            'campo'      => 'puesto',
            'categoria'  => 'percepcion',
            'tipo'       => 'moneda',
            'ancho'      => 24,
            'alineacion' => Alignment::HORIZONTAL_CENTER
        ],
        [
            'titulo'     => 'PASAJE',
            'campo'      => 'pasaje',
            'categoria'  => 'percepcion',
            'tipo'       => 'moneda',
            'ancho'      => 24,
            'alineacion' => Alignment::HORIZONTAL_CENTER
        ],
        [
            'titulo'     => 'COMIDA',
            'campo'      => 'comida',
            'categoria'  => 'percepcion',
            'tipo'       => 'moneda',
            'ancho'      => 24,
            'alineacion' => Alignment::HORIZONTAL_CENTER
        ],
        [
            'titulo'     => 'TARDEADA',
            'campo'      => 'tardeada',
            'categoria'  => 'percepcion',
            'tipo'       => 'moneda',
            'ancho'      => 24,
            'alineacion' => Alignment::HORIZONTAL_CENTER
        ]
    ];

    // -----------------------------------------------------------------
    // 2.2 Detección de percepciones extras dinámicas
    // Se recorren todos los departamentos para identificar conceptos
    // únicos de percepciones_extra (por ejemplo: "DOMINGO", "FESTIVO", etc.)
    // -----------------------------------------------------------------
    $extras_unicas = [];

    foreach ($departamentos as $depto) {
        if (!empty($depto['percepciones_extra']) && is_array($depto['percepciones_extra'])) {
            foreach ($depto['percepciones_extra'] as $k => $v) {
                // Soportar formato de objeto ['nombre' => '...'] o clave asociativa ['DOMINGO' => 714]
                $nombreExtra = is_array($v) ? trim($v['nombre'] ?? '') : trim((string) $k);

                if ($nombreExtra !== '') {
                    $key = mb_strtoupper($nombreExtra, 'UTF-8');
                    // Registrar el concepto si aún no se había agregado
                    if (!isset($extras_unicas[$key])) {
                        $extras_unicas[$key] = $key;
                    }
                }
            }
        }
    }

    // -----------------------------------------------------------------
    // 2.3 Añadir las percepciones extras al listado de columnas
    // Cada percepción extra detectada se convierte en una nueva columna
    // -----------------------------------------------------------------
    foreach ($extras_unicas as $extra_key => $titulo_extra) {
        $columnas_definicion[] = [
            'titulo'     => $titulo_extra,
            'campo'      => 'extra_' . $extra_key,
            'categoria'  => 'percepcion',
            'es_extra'   => true,       // Bandera para saber que se lee de percepciones_extra
            'extra_key'  => $extra_key,  // Llave normalizada para buscar en el departamento
            'tipo'       => 'moneda',
            'ancho'      => 26,
            'alineacion' => Alignment::HORIZONTAL_CENTER
        ];
    }

    // -----------------------------------------------------------------
    // 2.4 Deducciones fijas de la nómina
    // Se agregan únicamente las deducciones solicitadas
    // -----------------------------------------------------------------
    $deducciones_definicion = [
        [
            'titulo'     => 'ISR',
            'campo'      => 'isr',
            'categoria'  => 'deduccion',
            'tipo'       => 'moneda',
            'ancho'      => 24,
            'alineacion' => Alignment::HORIZONTAL_CENTER
        ],
        [
            'titulo'     => 'IMSS',
            'campo'      => 'imss',
            'categoria'  => 'deduccion',
            'tipo'       => 'moneda',
            'ancho'      => 24,
            'alineacion' => Alignment::HORIZONTAL_CENTER
        ],
        [
            'titulo'     => 'INFONAVIT',
            'campo'      => 'infonavit',
            'categoria'  => 'deduccion',
            'tipo'       => 'moneda',
            'ancho'      => 24,
            'alineacion' => Alignment::HORIZONTAL_CENTER
        ],
        [
            'titulo'     => 'AJUSTES AL SUB',
            'campo'      => 'ajuste_sub',
            'categoria'  => 'deduccion',
            'tipo'       => 'moneda',
            'ancho'      => 24,
            'alineacion' => Alignment::HORIZONTAL_CENTER
        ],
        [
            'titulo'     => 'AUSENTISMO',
            'campo'      => 'ausentismo',
            'categoria'  => 'deduccion',
            'tipo'       => 'moneda',
            'ancho'      => 24,
            'alineacion' => Alignment::HORIZONTAL_CENTER
        ],
        [
            'titulo'     => 'PERMISO',
            'campo'      => 'permisos',
            'categoria'  => 'deduccion',
            'tipo'       => 'moneda',
            'ancho'      => 24,
            'alineacion' => Alignment::HORIZONTAL_CENTER
        ],
        [
            'titulo'     => 'RETARDOS',
            'campo'      => 'retardos',
            'categoria'  => 'deduccion',
            'tipo'       => 'moneda',
            'ancho'      => 24,
            'alineacion' => Alignment::HORIZONTAL_CENTER
        ],
        [
            'titulo'     => 'UNIFORMES',
            'campo'      => 'uniformes',
            'categoria'  => 'deduccion',
            'tipo'       => 'moneda',
            'ancho'      => 24,
            'alineacion' => Alignment::HORIZONTAL_CENTER
        ],
        [
            'titulo'     => 'CHECADOR',
            'campo'      => 'checador',
            'categoria'  => 'deduccion',
            'tipo'       => 'moneda',
            'ancho'      => 24,
            'alineacion' => Alignment::HORIZONTAL_CENTER
        ],
        [
            'titulo'     => 'F.A/GAFET/COFIA',
            'campo'      => 'fa_gafet_cofia',
            'categoria'  => 'deduccion',
            'tipo'       => 'moneda',
            'ancho'      => 26,
            'alineacion' => Alignment::HORIZONTAL_CENTER
        ]
    ];

    foreach ($deducciones_definicion as $ded_def) {
        $columnas_definicion[] = $ded_def;
    }

    // -----------------------------------------------------------------
    // 2.5 Detección de deducciones extras dinámicas
    // Se recorren todos los departamentos para identificar conceptos
    // únicos de deducciones_extra (por ejemplo: "ANTICIPO", "PRÉSTAMO", etc.)
    // -----------------------------------------------------------------
    $deducciones_extras_unicas = [];

    foreach ($departamentos as $depto) {
        if (!empty($depto['deducciones_extra']) && is_array($depto['deducciones_extra'])) {
            foreach ($depto['deducciones_extra'] as $k => $v) {
                // Soportar formato de objeto ['nombre' => '...'] o clave asociativa ['ANTICIPO' => 200]
                $nombreDedExtra = is_array($v) ? trim($v['nombre'] ?? '') : trim((string) $k);

                if ($nombreDedExtra !== '') {
                    $key = mb_strtoupper($nombreDedExtra, 'UTF-8');
                    // Registrar el concepto si aún no se había agregado
                    if (!isset($deducciones_extras_unicas[$key])) {
                        $deducciones_extras_unicas[$key] = $key;
                    }
                }
            }
        }
    }

    // -----------------------------------------------------------------
    // 2.6 Añadir las deducciones extras al listado de columnas
    // Cada deducción extra detectada se convierte en una nueva columna
    // -----------------------------------------------------------------
    foreach ($deducciones_extras_unicas as $ded_extra_key => $titulo_ded_extra) {
        $columnas_definicion[] = [
            'titulo'        => $titulo_ded_extra,
            'campo'         => 'ded_extra_' . $ded_extra_key,
            'categoria'     => 'deduccion',
            'es_ded_extra'  => true,            // Bandera para saber que se lee de deducciones_extra
            'ded_extra_key' => $ded_extra_key,  // Llave normalizada para buscar en el departamento
            'tipo'          => 'moneda',
            'ancho'         => 26,
            'alineacion'    => Alignment::HORIZONTAL_CENTER
        ];
    }

    // -----------------------------------------------------------------
    // 2.7 Columnas finales de liquidación y efectivo con fórmulas vivas
    // Calculadas dinámicamente mediante fórmulas de Excel:
    // 1. NETO A RECIBIR = SUM(percepciones) - SUM(deducciones)
    // 2. DISPERSION DE TARJETA = valor de tarjeta (color rojo)
    // 3. IMPORTE EN EFECTIVO = NETO A RECIBIR - DISPERSION DE TARJETA
    // 4. PRÉSTAMO = valor de préstamo (color rojo)
    // 5. TOTAL A RECIBIR = IMPORTE EN EFECTIVO - PRÉSTAMO
    // 6. AJUSTE AL NETO = ROUND(TOTAL A RECIBIR, 0) - TOTAL A RECIBIR
    // 7. IMPORTE EN EFECTIVO REDONDEADO = TOTAL A RECIBIR + AJUSTE AL NETO
    // -----------------------------------------------------------------
    $columnas_finales = [
        [
            'titulo'       => 'NETO A RECIBIR',
            'campo'        => 'neto_a_recibir',
            'categoria'    => 'formula',
            'tipo_formula' => 'neto_a_recibir',
            'tipo'         => 'moneda',
            'ancho'        => 26,
            'alineacion'   => Alignment::HORIZONTAL_CENTER
        ],
        [
            'titulo'       => 'DISPERSION DE TARJETA',
            'campo'        => 'tarjeta',
            'categoria'    => 'dato',
            'color_rojo'   => true, // Letras en color rojo
            'tipo'         => 'moneda',
            'ancho'        => 28,
            'alineacion'   => Alignment::HORIZONTAL_CENTER
        ],
        [
            'titulo'       => 'IMPORTE EN EFECTIVO',
            'campo'        => 'importe_efectivo',
            'categoria'    => 'formula',
            'tipo_formula' => 'importe_efectivo',
            'tipo'         => 'moneda',
            'ancho'        => 26,
            'alineacion'   => Alignment::HORIZONTAL_CENTER
        ],
        [
            'titulo'       => 'PRÉSTAMO',
            'campo'        => 'prestamo',
            'categoria'    => 'dato',
            'color_rojo'   => true, // Letras en color rojo
            'tipo'         => 'moneda',
            'ancho'        => 24,
            'alineacion'   => Alignment::HORIZONTAL_CENTER
        ],
        [
            'titulo'       => 'TOTAL A RECIBIR',
            'campo'        => 'total_a_recibir',
            'categoria'    => 'formula',
            'tipo_formula' => 'total_a_recibir',
            'tipo'         => 'moneda',
            'ancho'        => 26,
            'alineacion'   => Alignment::HORIZONTAL_CENTER
        ],
        [
            'titulo'       => 'AJUSTE AL NETO',
            'campo'        => 'ajuste_al_neto',
            'categoria'    => 'formula',
            'tipo_formula' => 'ajuste_al_neto',
            'tipo'         => 'moneda',
            'ancho'        => 24,
            'alineacion'   => Alignment::HORIZONTAL_CENTER
        ],
        [
            'titulo'       => 'IMPORTE EN EFECTIVO REDONDEADO',
            'campo'        => 'efectivo_redondeado',
            'categoria'    => 'formula',
            'tipo_formula' => 'efectivo_redondeado',
            'tipo'         => 'moneda',
            'ancho'        => 30,
            'alineacion'   => Alignment::HORIZONTAL_CENTER
        ]
    ];

    foreach ($columnas_finales as $col_fin) {
        $columnas_definicion[] = $col_fin;
    }

    // -----------------------------------------------------------------
    // 2.8 Asignar letras de columna de Excel (A, B, C, ..., Z, AA, AB...)
    // Coordinate::stringFromColumnIndex convierte el índice numérico (1, 2, 3...)
    // a la letra correspondiente de Excel, soportando más de 26 columnas.
    // -----------------------------------------------------------------
    $columnas = [];
    $col_idx = 1;

    foreach ($columnas_definicion as $col_def) {
        $letra = Coordinate::stringFromColumnIndex($col_idx);
        $columnas[$letra] = $col_def;
        $col_idx++;
    }

    // Guardar la primera y última letra de columna para rangos y estilos
    $letras_columnas = array_keys($columnas);
    $primera_columna = reset($letras_columnas); // 'A'
    $ultima_columna  = end($letras_columnas);   // Última columna

    // Identificar letras de rangos y columnas clave para fórmulas
    $cols_percepciones = [];
    $cols_deducciones  = [];
    $col_neto          = '';
    $col_tarjeta       = '';
    $col_efectivo      = '';
    $col_prestamo      = '';
    $col_total_recibir = '';
    $col_ajuste        = '';
    $col_redondeado    = '';

    foreach ($columnas as $letra => $config) {
        $cat = $config['categoria'] ?? '';
        $tf  = $config['tipo_formula'] ?? '';
        $cp  = $config['campo'] ?? '';

        if ($cat === 'percepcion') {
            $cols_percepciones[] = $letra;
        } elseif ($cat === 'deduccion') {
            $cols_deducciones[] = $letra;
        }

        if ($tf === 'neto_a_recibir') {
            $col_neto = $letra;
        } elseif ($cp === 'tarjeta') {
            $col_tarjeta = $letra;
        } elseif ($tf === 'importe_efectivo') {
            $col_efectivo = $letra;
        } elseif ($cp === 'prestamo') {
            $col_prestamo = $letra;
        } elseif ($tf === 'total_a_recibir') {
            $col_total_recibir = $letra;
        } elseif ($tf === 'ajuste_al_neto') {
            $col_ajuste = $letra;
        } elseif ($tf === 'efectivo_redondeado') {
            $col_redondeado = $letra;
        }
    }

    $col_ini_percepcion = reset($cols_percepciones);
    $col_fin_percepcion = end($cols_percepciones);
    $col_ini_deduccion  = reset($cols_deducciones);
    $col_fin_deduccion  = end($cols_deducciones);

    // =================================================================
    // PASO 3: DEPARTAMENTOS A PLASMAR
    // =================================================================
    // Los departamentos ya vienen filtrados y ordenados desde el JavaScript
    $lista_ordenada = $departamentos;

    // =================================================================
    // PASO 4: CREACIÓN Y DISEÑO DEL DOCUMENTO EXCEL
    // =================================================================
    $spreadsheet = new Spreadsheet();
    // Establecer la fuente predeterminada del documento en Arial
    $spreadsheet->getDefaultStyle()->getFont()->setName('Arial');

    $sheet = $spreadsheet->getActiveSheet();
    $sheet->setTitle('Tesorería');

    // Asegurar que las cuadrículas de Excel sean visibles
    $sheet->setShowGridLines(true);

    // -----------------------------------------------------------------
    // 4.0 CONFIGURACIÓN DE PÁGINA PARA IMPRESIÓN (HORIZONTAL - CARTA / OFICIO)
    // -----------------------------------------------------------------
    // Orientación horizontal (apaisado)
    $sheet->getPageSetup()->setOrientation(PageSetup::ORIENTATION_LANDSCAPE);
    // Tamaño de papel Carta (Letter = 1) por defecto, adaptable a Oficio (Legal = 5)
    $sheet->getPageSetup()->setPaperSize(PageSetup::PAPERSIZE_LETTER);
    // Centrar la tabla horizontalmente en la página al imprimir
    $sheet->getPageSetup()->setHorizontalCentered(true);
    // Ajustar para que todas las columnas quepan en 1 página de ancho
    $sheet->getPageSetup()->setFitToPage(true);
    $sheet->getPageSetup()->setFitToWidth(1);
    $sheet->getPageSetup()->setFitToHeight(0);
    // Repetir la fila 3 (cabeceras) en la parte superior si hay varias páginas
    $sheet->getPageSetup()->setRowsToRepeatAtTopByStartAndEnd(3, 3);
    // Márgenes estrechos (pulgadas) para aprovechar el área de impresión
    $sheet->getPageMargins()->setTop(0.5);
    $sheet->getPageMargins()->setBottom(0.5);
    $sheet->getPageMargins()->setLeft(0.4);
    $sheet->getPageMargins()->setRight(0.4);

    // -----------------------------------------------------------------
    // 4.1 TÍTULO DEL REPORTE / ENCABEZADO (Fila 1)
    // Solicitud: Encabezado tamaño 48, fuente Arial
    // -----------------------------------------------------------------
    $titulo_reporte = 'SEM ' . $semana . ' CITRICOS SAAO NOMINAS';
    $rango_titulo   = "{$primera_columna}1:{$ultima_columna}1";

    $sheet->setCellValue("{$primera_columna}1", $titulo_reporte);
    $sheet->mergeCells($rango_titulo);
    $sheet->getRowDimension(1)->setRowHeight(65);

    // Estilo del título principal (Arial 48 pt negrita)
    $sheet->getStyle("{$primera_columna}1")->applyFromArray([
        'font' => [
            'name'  => 'Arial',
            'bold'  => true,
            'size'  => 48,
            'color' => ['rgb' => '1B4332'] // Verde oscuro institucional
        ],
        'alignment' => [
            'horizontal' => Alignment::HORIZONTAL_CENTER,
            'vertical'   => Alignment::VERTICAL_CENTER
        ]
    ]);

    // -----------------------------------------------------------------
    // 4.2 CABECERAS DE COLUMNA (Fila 3)
    // Solicitud: Fondo amarillo, tamaño 14, negritas, fuente Arial
    // -----------------------------------------------------------------
    $fila_cabecera = 3;
    $sheet->getRowDimension($fila_cabecera)->setRowHeight(36);

    // Estilo para todas las celdas de la cabecera
    $estilo_cabeceras = [
        'font' => [
            'name'  => 'Arial',
            'bold'  => true,
            'color' => ['rgb' => '000000'], // Texto negro para óptimo contraste sobre amarillo
            'size'  => 14
        ],
        'fill' => [
            'fillType'   => Fill::FILL_SOLID,
            'startColor' => ['rgb' => 'FFFF00'] // Fondo amarillo solicitado
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
    ];

    // Asignar el texto del título y ancho a cada columna
    foreach ($columnas as $col => $config) {
        $sheet->setCellValue($col . $fila_cabecera, $config['titulo']);
        $sheet->getColumnDimension($col)->setWidth($config['ancho']);
    }

    // Aplicar el estilo completo a la fila de cabecera
    $sheet->getStyle("{$primera_columna}{$fila_cabecera}:{$ultima_columna}{$fila_cabecera}")
          ->applyFromArray($estilo_cabeceras);

    // -----------------------------------------------------------------
    // 4.3 FORMATOS DE CELDA
    // -----------------------------------------------------------------
    // Formato moneda normal: si es 0 no muestra nada ("")
    $formato_moneda_normal = '$#,##0.00;[Red]-$#,##0.00;""';
    // Formato deducciones: siempre en rojo con signo menos, si es 0 no muestra nada ("")
    $formato_deducciones   = '[Red]-$#,##0.00;[Red]-$#,##0.00;""';
    // Formato para valores en rojo con signo menos (tarjeta y préstamo)
    $formato_rojo_simple   = '[Red]-$#,##0.00;[Red]-$#,##0.00;""';

    // -----------------------------------------------------------------
    // 4.4 LLENADO DE DATOS (Fila 4 en adelante)
    // Solicitud: Columna NOMBRE tamaño 16, todas las demás columnas tamaño 20
    // -----------------------------------------------------------------
    $fila_inicio_datos = 4;
    $fila_actual       = $fila_inicio_datos;

    // Estilo de bordes para las celdas de datos (líneas negras)
    $estilo_borde_fila = [
        'borders' => [
            'allBorders' => [
                'borderStyle' => Border::BORDER_THIN,
                'color'       => ['rgb' => '000000'] // Líneas negras
            ]
        ]
    ];

    foreach ($lista_ordenada as $depto) {
        $nombre_depto = trim((string) ($depto['nombre_departamento'] ?? ''));

        // Si el nombre es largo (más de 20 caracteres), asignar altura mayor para el salto de línea
        if (mb_strlen($nombre_depto, 'UTF-8') > 20) {
            $altura_fila = 50; // Altura más grande para nombres largos que hacen salto de línea
        } else {
            $altura_fila = 38; // Altura estándar amplia para tamaño de fuente 20
        }
        $sheet->getRowDimension($fila_actual)->setRowHeight($altura_fila);

        // Recorrer cada columna configurada
        foreach ($columnas as $col => $config) {
            $cat = $config['categoria'] ?? '';

            // CASO 1: COLUMNAS CON FÓRMULAS VIVAS EN EXCEL
            if ($cat === 'formula') {
                $tipoFormula = $config['tipo_formula'] ?? '';
                $formula = '';

                switch ($tipoFormula) {
                    case 'neto_a_recibir':
                        // =SUM(percepciones) - SUM(deducciones)
                        $formula = "=SUM({$col_ini_percepcion}{$fila_actual}:{$col_fin_percepcion}{$fila_actual}) - SUM({$col_ini_deduccion}{$fila_actual}:{$col_fin_deduccion}{$fila_actual})";
                        break;

                    case 'importe_efectivo':
                        // =NETO A RECIBIR - DISPERSION DE TARJETA
                        $formula = "={$col_neto}{$fila_actual} - {$col_tarjeta}{$fila_actual}";
                        break;

                    case 'total_a_recibir':
                        // =IMPORTE EN EFECTIVO - PRÉSTAMO
                        $formula = "={$col_efectivo}{$fila_actual} - {$col_prestamo}{$fila_actual}";
                        break;

                    case 'ajuste_al_neto':
                        // Redondeo al entero más cercano menos el valor: si resta da negativo (-0.22), si suma da positivo (+0.20)
                        $formula = "=ROUND({$col_total_recibir}{$fila_actual}, 0) - {$col_total_recibir}{$fila_actual}";
                        break;

                    case 'efectivo_redondeado':
                        // Total a recibir más el ajuste al neto = resultado redondeado exacto
                        $formula = "={$col_total_recibir}{$fila_actual} + {$col_ajuste}{$fila_actual}";
                        break;
                }

                $sheet->setCellValue($col . $fila_actual, $formula);
                $sheet->getStyle($col . $fila_actual)->getNumberFormat()->setFormatCode($formato_moneda_normal);

            // CASO 2: DEDUCCIONES (LETRAS EN ROJO CON SIGNO MENOS Y VACÍO SI ES 0)
            } elseif ($cat === 'deduccion') {
                $valor = 0;

                if (!empty($config['es_ded_extra'])) {
                    $keyBuscar = $config['ded_extra_key'];
                    if (!empty($depto['deducciones_extra']) && is_array($depto['deducciones_extra'])) {
                        foreach ($depto['deducciones_extra'] as $k => $v) {
                            if (is_array($v)) {
                                $nombreItem = mb_strtoupper(trim($v['nombre'] ?? ''), 'UTF-8');
                                if ($nombreItem === $keyBuscar) {
                                    $valor += (float) ($v['cantidad'] ?? 0);
                                }
                            } else {
                                $nombreItem = mb_strtoupper(trim((string) $k), 'UTF-8');
                                if ($nombreItem === $keyBuscar) {
                                    $valor += (float) $v;
                                }
                            }
                        }
                    }
                } else {
                    $campo = $config['campo'];
                    $valor = $depto[$campo] ?? 0;
                }

                $valor_num = (float) $valor;

                if ($valor_num > 0) {
                    $sheet->setCellValueExplicit($col . $fila_actual, $valor_num, \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_NUMERIC);
                } else {
                    // Si es 0, no poner nada en la celda
                    $sheet->setCellValue($col . $fila_actual, null);
                }

                $sheet->getStyle($col . $fila_actual)->getNumberFormat()->setFormatCode($formato_deducciones);
                $sheet->getStyle($col . $fila_actual)->getFont()->getColor()->setRGB('D00000'); // Letras en color rojo

            // CASO 3: PERCEPCIONES Y DATOS NUMÉRICOS (INCLUYE TARJETA Y PRÉSTAMO)
            } elseif ($cat === 'percepcion' || $cat === 'dato') {
                $valor = 0;

                if (!empty($config['es_extra'])) {
                    $keyBuscar = $config['extra_key'];
                    if (!empty($depto['percepciones_extra']) && is_array($depto['percepciones_extra'])) {
                        foreach ($depto['percepciones_extra'] as $k => $v) {
                            if (is_array($v)) {
                                $nombreItem = mb_strtoupper(trim($v['nombre'] ?? ''), 'UTF-8');
                                if ($nombreItem === $keyBuscar) {
                                    $valor += (float) ($v['cantidad'] ?? 0);
                                }
                            } else {
                                $nombreItem = mb_strtoupper(trim((string) $k), 'UTF-8');
                                if ($nombreItem === $keyBuscar) {
                                    $valor += (float) $v;
                                }
                            }
                        }
                    }
                } else {
                    $campo = $config['campo'];
                    $valor = $depto[$campo] ?? 0;
                }

                $valor_num = (float) $valor;

                if ($valor_num != 0) {
                    $sheet->setCellValueExplicit($col . $fila_actual, $valor_num, \PhpOffice\PhpSpreadsheet\Cell\DataType::TYPE_NUMERIC);
                } else {
                    // Si es 0, no poner nada en la celda
                    $sheet->setCellValue($col . $fila_actual, null);
                }

                // Si es tarjeta o préstamo, aplicar formato y color rojo
                if (!empty($config['color_rojo'])) {
                    $sheet->getStyle($col . $fila_actual)->getNumberFormat()->setFormatCode($formato_rojo_simple);
                    $sheet->getStyle($col . $fila_actual)->getFont()->getColor()->setRGB('D00000');
                } else {
                    $sheet->getStyle($col . $fila_actual)->getNumberFormat()->setFormatCode($formato_moneda_normal);
                }

            // CASO 4: TEXTO (NOMBRE DEL DEPARTAMENTO)
            } else {
                $campo = $config['campo'];
                $valor = $depto[$campo] ?? '';
                $sheet->setCellValue($col . $fila_actual, (string) $valor);
            }

            // Alineación centrada (o izquierda para el nombre del departamento)
            $alineacion = $config['alineacion'] ?? Alignment::HORIZONTAL_CENTER;
            $sheet->getStyle($col . $fila_actual)->getAlignment()->setHorizontal($alineacion);
            $sheet->getStyle($col . $fila_actual)->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);
        }

        // -------------------------------------------------------------
        // TAMAÑOS DE FUENTE Y SALTO DE LÍNEA DE LA FILA DE DATOS:
        // Columna NOMBRE (A): tamaño 16, Arial, con salto de línea si es largo
        // Todas las demás columnas (B en adelante): tamaño 20, Arial
        // -------------------------------------------------------------
        $sheet->getStyle('A' . $fila_actual)->getFont()->setName('Arial')->setSize(16);
        $sheet->getStyle('A' . $fila_actual)->getAlignment()->setWrapText(true);
        $sheet->getStyle('A' . $fila_actual)->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);
        $sheet->getStyle("B{$fila_actual}:{$ultima_columna}{$fila_actual}")->getFont()->setName('Arial')->setSize(20);

        // -------------------------------------------------------------
        // COLOR DEL DEPARTAMENTO:
        // Pintar el fondo de la celda del nombre (Columna A) con el
        // color asignado al departamento en la nómina (color_reporte)
        // Ajustar el color del texto según la luminosidad del fondo:
        // - Color claro → texto negro
        // - Color oscuro → texto blanco
        // -------------------------------------------------------------
        if (!empty($depto['color'])) {
            $hexColor = strtoupper(ltrim((string) $depto['color'], '#'));
            if (strlen($hexColor) === 6) {
                // Extraer componentes RGB del color hexadecimal
                $r = hexdec(substr($hexColor, 0, 2));
                $g = hexdec(substr($hexColor, 2, 2));
                $b = hexdec(substr($hexColor, 4, 2));

                // Calcular luminosidad relativa (fórmula estándar)
                $luminosidad = (0.299 * $r) + (0.587 * $g) + (0.114 * $b);

                // Determinar color del texto según luminosidad
                // > 128 = claro (texto negro), <= 128 = oscuro (texto blanco)
                $colorTexto = $luminosidad > 128 ? '000000' : 'FFFFFF';

                $sheet->getStyle('A' . $fila_actual)->applyFromArray([
                    'fill' => [
                        'fillType'   => Fill::FILL_SOLID,
                        'startColor' => ['rgb' => $hexColor]
                    ],
                    'font' => [
                        'color' => ['rgb' => $colorTexto]
                    ]
                ]);
            }
        }

        // Aplicar bordes de celda en toda la fila de datos
        $sheet->getStyle("{$primera_columna}{$fila_actual}:{$ultima_columna}{$fila_actual}")
              ->applyFromArray($estilo_borde_fila);

        $fila_actual++;
    }

    $fila_fin_datos = $fila_actual - 1;

    // -----------------------------------------------------------------
    // 4.4.1 OCULTAR COLUMNAS SIN DATOS
    // Verificar cada columna (excepto NOMBRE) y ocultar si todas sus celdas están vacías
    // -----------------------------------------------------------------
    foreach ($columnas as $col => $config) {
        // No ocultar la primera columna (NOMBRE) ni columnas con fórmulas calculadas
        if ($col === $primera_columna || ($config['categoria'] ?? '') === 'formula') {
            continue;
        }

        $columna_vacia = true;

        // Verificar cada celda de la columna en el rango de datos
        for ($fila = $fila_inicio_datos; $fila <= $fila_fin_datos; $fila++) {
            $celda = $sheet->getCell($col . $fila);
            $valor = $celda->getValue();

            // Si la celda tiene un valor no nulo y no vacío, la columna no está vacía
            if ($valor !== null && $valor !== '') {
                $columna_vacia = false;
                break;
            }
        }

        // Si la columna está completamente vacía, ocultarla
        if ($columna_vacia) {
            $sheet->getColumnDimension($col)->setVisible(false);
        }
    }

    // -----------------------------------------------------------------
    // 4.5 FILA DE TOTALES AL FINAL DE LA TABLA
    // Columna NOMBRE: tamaño 16 negrita. Demás columnas: tamaño 20 negrita.
    // -----------------------------------------------------------------
    $sheet->getRowDimension($fila_actual)->setRowHeight(38);
    $sheet->setCellValue("{$primera_columna}{$fila_actual}", 'TOTAL');
    $sheet->getStyle("{$primera_columna}{$fila_actual}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
    $sheet->getStyle("{$primera_columna}{$fila_actual}")->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);
    $sheet->getStyle("{$primera_columna}{$fila_actual}")->getFont()->setName('Arial')->setSize(16)->setBold(true);

    // Asignar fórmula =SUM(...) automáticamente a cada columna de tipo moneda
    foreach ($columnas as $col => $config) {
        if ($col === $primera_columna) {
            continue; // La primera columna contiene el texto "TOTAL"
        }

        if ($config['tipo'] === 'moneda') {
            // Generar fórmula de suma para el rango de datos de esa columna
            $sheet->setCellValue($col . $fila_actual, "=SUM({$col}{$fila_inicio_datos}:{$col}{$fila_fin_datos})");

            if (($config['categoria'] ?? '') === 'deduccion') {
                $sheet->getStyle($col . $fila_actual)->getNumberFormat()->setFormatCode($formato_deducciones);
                $sheet->getStyle($col . $fila_actual)->getFont()->getColor()->setRGB('D00000');
            } elseif (!empty($config['color_rojo'])) {
                // Dispersión de tarjeta y préstamo en color rojo
                $sheet->getStyle($col . $fila_actual)->getNumberFormat()->setFormatCode($formato_rojo_simple);
                $sheet->getStyle($col . $fila_actual)->getFont()->getColor()->setRGB('D00000');
            } else {
                $sheet->getStyle($col . $fila_actual)->getNumberFormat()->setFormatCode($formato_moneda_normal);
            }
        }

        $sheet->getStyle($col . $fila_actual)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle($col . $fila_actual)->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);
    }

    // Tamaño 20 negrita para todas las columnas de totales desde la B en adelante
    $sheet->getStyle("B{$fila_actual}:{$ultima_columna}{$fila_actual}")->getFont()->setName('Arial')->setSize(20)->setBold(true);

    // Estilos de la fila de totales (fondo suave, líneas negras contables)
    $estilo_totales = [
        'fill' => [
            'fillType'   => Fill::FILL_SOLID,
            'startColor' => ['rgb' => 'E8F5E9'] // Verde muy claro
        ],
        'borders' => [
            'allBorders' => [
                'borderStyle' => Border::BORDER_THIN,
                'color'       => ['rgb' => '000000'] // Líneas negras
            ],
            'bottom' => [
                'borderStyle' => Border::BORDER_DOUBLE,
                'color'       => ['rgb' => '000000'] // Doble borde inferior negro
            ]
        ]
    ];

    $sheet->getStyle("{$primera_columna}{$fila_actual}:{$ultima_columna}{$fila_actual}")
          ->applyFromArray($estilo_totales);

    // =================================================================
    // PASO 5: ENVÍO DIRECTO DEL ARCHIVO AL NAVEGADOR
    // =================================================================
    $nombre_archivo  = 'tesoreria_semana_' . $semana . '_anio_' . $anio . '.xlsx';

    // Enviar headers para descargar el archivo directamente
    header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    header('Content-Disposition: attachment;filename="' . $nombre_archivo . '"');
    header('Cache-Control: max-age=0');

    $writer = new Xlsx($spreadsheet);
    $writer->save('php://output');
    exit;
}

