<?php

// Incluir autoload de Composer
require_once __DIR__ . '/../../../vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Color;
use PhpOffice\PhpSpreadsheet\Worksheet\PageSetup;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Worksheet\Drawing;



//=====================
//  RECIBIR DATOS DEL JSON
//=====================

$jsonNomina = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['jsonNomina'])) {
    $jsonNomina = json_decode($_POST['jsonNomina'], true);
}

//=====================
//  CONFIGURACIÓN INICIAL
//=====================

$spreadsheet = new Spreadsheet();

// Aplicar fuente Arial como predeterminada para toda la hoja
$spreadsheet->getDefaultStyle()->getFont()->setName('Arial');

// Datos de fecha
if ($jsonNomina) {
    $fecha_inicio = $jsonNomina['fecha_inicio'] ?? 'Fecha Inicio';
    $fecha_cierre = $jsonNomina['fecha_cierre'] ?? 'Fecha Cierre';
    $numero_semana = $jsonNomina['numero_semana'] ?? '00';
    $ano = date('Y');
}

//=====================
//  FUNCIONES AUXILIARES
//=====================

/**
 * Determina si el color de fuente debe ser blanco o negro basándose en la luminancia del fondo.
 */
function obtenerColorContraste($hexColor)
{
    if (strlen($hexColor) !== 6) return '000000';
    $r = hexdec(substr($hexColor, 0, 2));
    $g = hexdec(substr($hexColor, 2, 2));
    $b = hexdec(substr($hexColor, 4, 2));
    $luminancia = ($r * 0.299 + $g * 0.587 + $b * 0.114) / 255;
    return ($luminancia < 0.5) ? 'FFFFFF' : '000000';
}

//=====================
//  FUNCIÓN PARA CREAR UNA HOJA
//=====================

function crearHoja($spreadsheet, $depto, $filtroEmpleados, $nombreHoja, $esPrimera = false)
{
    global $jsonNomina, $fecha_inicio, $fecha_cierre, $numero_semana, $ano;

    if ($esPrimera) {
        $sheet = $spreadsheet->getActiveSheet();
    } else {
        $sheet = $spreadsheet->createSheet();
    }

    $sheet->setTitle($nombreHoja);

    // Extraer color del depto
    $colorDepto = 'F5EB1B';
    $colorFuenteEnc = '000000';
    if (!empty($depto['color_reporte'])) {
        $colorEncontrado = null;
        if (is_array($depto['color_reporte'])) {
            // Nueva estructura: array de strings directos ['#f7f13b']
            // Tomamos el primer color definido como representativo
            $colorEncontrado = $depto['color_reporte'][0] ?? null;
        } else {
            // Fallback para formato anterior (string plano)
            $colorEncontrado = $depto['color_reporte'];
        }

        if ($colorEncontrado) {
            $colorDepto = ltrim($colorEncontrado, '#');
            $colorFuenteEnc = obtenerColorContraste($colorDepto);
        }
    }

    // Extraer cajas con utilidad
    $precioCajasUtilidad = [];
    if (isset($jsonNomina['precio_cajas'])) {
        foreach ($jsonNomina['precio_cajas'] as $caja) {
            if (($caja['utilidad'] ?? false) === true) $precioCajasUtilidad[] = $caja;
        }
    }

    // Configuración días empaque
    $diasConfig = [
        ['abrv' => 'V', 'nombre' => 'Viernes'],
        ['abrv' => 'S', 'nombre' => 'Sábado'],
        ['abrv' => 'D', 'nombre' => 'Domingo'],
        ['abrv' => 'L', 'nombre' => 'Lunes'],
        ['abrv' => 'M', 'nombre' => 'Martes'],
        ['abrv' => 'MI', 'nombre' => 'Miércoles'],
        ['abrv' => 'J', 'nombre' => 'Jueves']
    ];

    // Filtrar y ordenar empleados para esta hoja
    $empleados = [];
    foreach ($depto['empleados'] ?? [] as $emp) {
        if ($filtroEmpleados($emp)) $empleados[] = $emp;
    }
    usort($empleados, fn($a, $b) => strcmp($a['nombre'] ?? '', $b['nombre'] ?? ''));

    // Identificar días con producción real para este grupo
    $diasProduccion = [];
    foreach ($empleados as $emp) {
        foreach ($emp['historial_empaque'] ?? [] as $hist) {
            if (($hist['cantidad'] ?? 0) > 0) $diasProduccion[$hist['dia']] = true;
        }
    }

    $diasAMostrar = [];
    foreach ($diasConfig as $dc) {
        if (isset($diasProduccion[$dc['nombre']])) $diasAMostrar[] = $dc;
    }

    // Buscar percepciones_extra y deducciones_extra únicas
    $extrasDinamicas = [];
    $mapExtrasCols = [];
    foreach ($empleados as $emp) {
        if (!empty($emp['percepciones_extra']) && is_array($emp['percepciones_extra'])) {
            foreach ($emp['percepciones_extra'] as $extra) {
                $nombre = trim($extra['nombre'] ?? '');
                $cant = (float) ($extra['cantidad'] ?? 0);
                if ($nombre !== '' && $cant != 0) {
                    $key = mb_strtolower($nombre, 'UTF-8');
                    if (!isset($extrasDinamicas[$key])) {
                        $extrasDinamicas[$key] = mb_strtoupper($nombre, 'UTF-8');
                    }
                }
            }
        }
    }

    $deduccionesDinamicas = [];
    $mapDeduccionesExtrasCols = [];
    foreach ($empleados as $emp) {
        if (!empty($emp['deducciones_extra']) && is_array($emp['deducciones_extra'])) {
            foreach ($emp['deducciones_extra'] as $dextra) {
                $nombre = trim($dextra['nombre'] ?? '');
                $cant = (float) ($dextra['cantidad'] ?? 0);
                if ($nombre !== '' && $cant != 0) {
                    $key = mb_strtolower($nombre, 'UTF-8');
                    if (!isset($deduccionesDinamicas[$key])) {
                        $deduccionesDinamicas[$key] = mb_strtoupper($nombre, 'UTF-8');
                    }
                }
            }
        }
    }

    // Columnas Fijas
    $colIniciales = ['N°', 'CD', 'NOMBRE'];
    $colFinales = ['SUELDO NETO'];
    foreach ($extrasDinamicas as $key => $dispName) {
        $colFinales[] = $dispName;
        $mapExtrasCols[$key] = $dispName;
    }
    $colFinales[] = 'TOTAL PERCEPCIONES';

    $colFinalesDeducciones = ['ISR', 'IMSS', 'INFONAVIT', 'AJUSTES AL SUB', 'PERMISOS', 'UNIFORMES', 'BIOMETRICO', 'F.A/GAFET/COFIA'];
    foreach ($colFinalesDeducciones as $dCol) {
        $colFinales[] = $dCol;
    }
    foreach ($deduccionesDinamicas as $key => $dispName) {
        $colFinales[] = $dispName;
        $mapDeduccionesExtrasCols[$key] = $dispName;
    }

    $colFinalesResto = [
        'TOTAL DE DEDUCCIONES',
        'NETO A RECIBIR',
        'DISPERSION DE TARJETA',
        'IMPORTE EN EFECTIVO',
        'PRÉSTAMO',
        'TOTAL A RECIBIR',
        'REDONDEADO',
        'TOTAL EFECTIVO REDONDEADO',
        'FIRMA RECIBIDO'
    ];
    foreach ($colFinalesResto as $rCol) {
        $colFinales[] = $rCol;
    }

    $mapeo = [];
    $colIdx = 1;

    // 1. Iniciales
    foreach ($colIniciales as $name) {
        $letra = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colIdx);
        $mapeo[$name] = $letra;
        $sheet->mergeCells($letra . '7:' . $letra . '8');
        $sheet->setCellValue($letra . '7', $name);
        $colIdx++;
    }

    // 2. Empaque Diario
    $inicioEmpaque = $colIdx;
    foreach ($diasAMostrar as $dia) {
        $colIni = $colIdx;
        foreach ($precioCajasUtilidad as $caja) {
            $letra = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colIdx);
            $sheet->setCellValue($letra . '8', (int)$caja['precio']);
            if (!empty($caja['color']) && $caja['color'] !== '#000000') {
                $fnd = ltrim($caja['color'], '#');
                $fnt = obtenerColorContraste($fnd);
                $sheet->getStyle($letra . '8')->getFill()->setFillType('solid')->getStartColor()->setRGB($fnd);
                $sheet->getStyle($letra . '8')->getFont()->setColor(new Color($fnt));
            }
            $colIdx++;
        }
        $letraIni = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colIni);
        $letraFin = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colIdx - 1);
        $sheet->mergeCells($letraIni . '7:' . $letraFin . '7');
        $sheet->setCellValue($letraIni . '7', $dia['abrv']);
    }
    $finEmpaque = $colIdx - 1;

    // 3. Resumen Empaque
    $inicioResumen = $colIdx;
    $columnasResumenCajas = [];
    foreach ($precioCajasUtilidad as $caja) {
        $letraTot = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colIdx);
        $sheet->setCellValue($letraTot . '7', 'TOTAL DE CAJAS');
        $sheet->setCellValue($letraTot . '8', (int)$caja['precio']);
        if (!empty($caja['color']) && $caja['color'] !== '#000000') {
            $fnd = ltrim($caja['color'], '#');
            $sheet->getStyle($letraTot . '7:' . $letraTot . '8')->getFill()->setFillType('solid')->getStartColor()->setRGB($fnd);
            $sheet->getStyle($letraTot . '7:' . $letraTot . '8')->getFont()->setColor(new Color(obtenerColorContraste($fnd)));
        }
        $colIdx++;

        $letraPre = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colIdx);
        $sheet->mergeCells($letraPre . '7:' . $letraPre . '8');
        $sheet->setCellValue($letraPre . '7', 'PRECIO UNITARIO');
        $sheet->getStyle($letraPre . '7:' . $letraPre . '8')->getFill()->setFillType('solid')->getStartColor()->setRGB('FFFF00');

        $columnasResumenCajas[] = ['total' => $letraTot, 'precio' => $letraPre];
        $colIdx++;
    }
    $finResumen = $colIdx - 1;

    // 4. Finales
    foreach ($colFinales as $name) {
        $letra = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colIdx);
        $mapeo[$name] = $letra;
        $sheet->mergeCells($letra . '7:' . $letra . '8');
        $sheet->setCellValue($letra . '7', $name);
        $colIdx++;
    }

    $ultimaLetra = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colIdx - 1);

    // Títulos
    $sheet->setCellValue('A1', strtoupper($depto['nombre']));
    $sheet->setCellValue('A2', 'CITRICOS SAAO S.A DE C.V');
    $sheet->setCellValue('A3', 'NOMINA DEL ' . strtoupper($fecha_inicio) . ' AL ' . strtoupper($fecha_cierre));
    $sheet->setCellValue('A4', 'SEMANA ' . str_pad($numero_semana, 2, '0', STR_PAD_LEFT) . '-' . $ano);
    $sheet->mergeCells('A1:' . $ultimaLetra . '1');
    $sheet->mergeCells('A2:' . $ultimaLetra . '2');
    $sheet->mergeCells('A3:' . $ultimaLetra . '3');
    $sheet->mergeCells('A4:' . $ultimaLetra . '4');
    $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(24)->setColor(new Color($colorDepto));
    $sheet->getStyle('A2')->getFont()->setBold(true)->setSize(20)->setColor(new Color($colorDepto));
    $sheet->getStyle('A3')->getFont()->setBold(true)->setSize(14);
    $sheet->getStyle('A4')->getFont()->setBold(true)->setSize(14);
    $sheet->getStyle('A1:' . $ultimaLetra . '4')->getAlignment()->setHorizontal('center')->setVertical('center');

    // Logo
    $logoPath = '../../../public/img/logo.jpg';
    if (file_exists($logoPath)) {
        $logo = new Drawing();
        $logo->setName('Logo');
        $logo->setDescription('Logo de Rancho El Relicario');
        $logo->setPath($logoPath);
        $logo->setHeight(190);
        $logo->setCoordinates('B1');
        $logo->setOffsetX(10);
        $logo->setWorksheet($sheet);
    }

    // Estilo Encabezados
    $rangoEnc = 'A7:' . $ultimaLetra . '8';
    $sheet->getStyle($rangoEnc)->applyFromArray([
        'font' => ['bold' => true, 'size' => 14, 'color' => ['rgb' => $colorFuenteEnc]],
        'alignment' => ['horizontal' => 'center', 'vertical' => 'center', 'wrapText' => true],
        'fill' => ['fillType' => 'solid', 'startColor' => ['rgb' => $colorDepto]]
    ]);

    // Alturas de fila para títulos y encabezados
    $sheet->getRowDimension(1)->setRowHeight(38);
    $sheet->getRowDimension(2)->setRowHeight(32);
    $sheet->getRowDimension(3)->setRowHeight(32);
    $sheet->getRowDimension(4)->setRowHeight(32);
    $sheet->getRowDimension(7)->setRowHeight(35);
    $sheet->getRowDimension(8)->setRowHeight(45);

    // Anchos
    foreach ($colIniciales as $n) $sheet->getColumnDimension($mapeo[$n])->setWidth(($n == 'NOMBRE') ? 65 : 12);
    for ($i = $inicioEmpaque; $i <= $finEmpaque; $i++) $sheet->getColumnDimension(\PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($i))->setWidth(8);
    for ($i = $inicioResumen; $i <= $finResumen; $i++) $sheet->getColumnDimension(\PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($i))->setWidth(15);
    foreach ($colFinales as $n) $sheet->getColumnDimension($mapeo[$n])->setWidth(($n == 'FIRMA RECIBIDO') ? 28 : 20);

    // Banderas visibilidad deducciones
    $flags = ['isr' => false, 'imss' => false, 'infonavit' => false, 'ajustes' => false, 'permiso' => false, 'uniformes' => false, 'checador' => false, 'fa' => false];
    foreach ($empleados as $emp) {
        if (($emp['permiso'] ?? 0) != 0) $flags['permiso'] = true;
        if (($emp['uniformes'] ?? 0) != 0) $flags['uniformes'] = true;
        if (($emp['checador'] ?? 0) != 0) $flags['checador'] = true;
        if (($emp['fa_gafet_cofia'] ?? 0) != 0) $flags['fa'] = true;
        foreach ($emp['conceptos'] ?? [] as $c) {
            $r = $c['resultado'] ?? 0;
            if ($r != 0) {
                if ($c['codigo'] == '45') $flags['isr'] = true;
                if ($c['codigo'] == '52') $flags['imss'] = true;
                if ($c['codigo'] == '16') $flags['infonavit'] = true;
                if ($c['codigo'] == '107') $flags['ajustes'] = true;
            }
        }
    }

    // Insertar Datos
    $row = 9;
    $idx = 1;
    foreach ($empleados as $emp) {
        $sheet->setCellValue($mapeo['N°'] . $row, $idx++);
        $sheet->setCellValue($mapeo['CD'] . $row, $emp['clave'] ?? '');
        $sheet->setCellValue($mapeo['NOMBRE'] . $row, $emp['nombre'] ?? '');

        // Empaque Diario
        $colEmp = $inicioEmpaque;
        foreach ($diasAMostrar as $dia) {
            foreach ($precioCajasUtilidad as $caja) {
                $letra = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colEmp);
                $cant = 0;
                foreach ($emp['historial_empaque'] ?? [] as $h) {
                    if ($h['dia'] === $dia['nombre'] && $h['tipo'] === $caja['valor']) {
                        $cant = $h['cantidad'];
                        break;
                    }
                }
                if ($cant > 0) $sheet->setCellValue($letra . $row, $cant);
                if (!empty($caja['color']) && $caja['color'] !== '#000000') {
                    $sheet->getStyle($letra . $row)->getFill()->setFillType('solid')->getStartColor()->setRGB(ltrim($caja['color'], '#'));
                }
                $colEmp++;
            }
        }

        // Resumen y Sueldo Neto
        $colRes = $inicioResumen;
        $partesNeto = [];
        foreach ($precioCajasUtilidad as $caja) {
            $letraTot = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colRes);
            $letraPre = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colRes + 1);
            $totCajas = 0;
            foreach ($emp['historial_empaque'] ?? [] as $h) {
                if ($h['tipo'] === $caja['valor']) $totCajas += $h['cantidad'];
            }
            $sheet->setCellValue($letraTot . $row, $totCajas);
            $sheet->setCellValue($letraPre . $row, $caja['precio']);
            if (!empty($caja['color']) && $caja['color'] !== '#000000') {
                $sheet->getStyle($letraTot . $row)->getFill()->setFillType('solid')->getStartColor()->setRGB(ltrim($caja['color'], '#'));
            }
            $partesNeto[] = "($letraTot$row*$letraPre$row)";
            $colRes += 2;
        }

        $sheet->setCellValue($mapeo['SUELDO NETO'] . $row, !empty($partesNeto) ? '=' . implode('+', $partesNeto) : 0);
        if (!empty($emp['percepciones_extra']) && is_array($emp['percepciones_extra'])) {
            foreach ($emp['percepciones_extra'] as $extra) {
                $nombre = trim($extra['nombre'] ?? '');
                $cant = (float) ($extra['cantidad'] ?? 0);
                if ($nombre !== '' && $cant != 0) {
                    $key = mb_strtolower($nombre, 'UTF-8');
                    if (isset($mapExtrasCols[$key])) {
                        $sheet->setCellValue($mapeo[$mapExtrasCols[$key]] . $row, $cant);
                    }
                }
            }
        }
        $letraPrimeraPercepcion = $mapeo['SUELDO NETO'];
        $letraUltimaPercepcion = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex(\PhpOffice\PhpSpreadsheet\Cell\Coordinate::columnIndexFromString($mapeo['TOTAL PERCEPCIONES']) - 1);
        $sheet->setCellValue($mapeo['TOTAL PERCEPCIONES'] . $row, "=SUM({$letraPrimeraPercepcion}{$row}:{$letraUltimaPercepcion}{$row})");

        // Deducciones
        $mapC = ['45' => 'ISR', '52' => 'IMSS', '16' => 'INFONAVIT', '107' => 'AJUSTES AL SUB'];
        foreach ($emp['conceptos'] ?? [] as $c) {
            if (isset($mapC[$c['codigo']])) $sheet->setCellValue($mapeo[$mapC[$c['codigo']]] . $row, $c['resultado']);
        }
        if (($emp['permiso'] ?? 0) != 0) $sheet->setCellValue($mapeo['PERMISOS'] . $row, $emp['permiso']);
        if (($emp['uniformes'] ?? 0) != 0) $sheet->setCellValue($mapeo['UNIFORMES'] . $row, $emp['uniformes']);
        if (($emp['checador'] ?? 0) != 0) $sheet->setCellValue($mapeo['BIOMETRICO'] . $row, $emp['checador']);
        if (($emp['fa_gafet_cofia'] ?? 0) != 0) $sheet->setCellValue($mapeo['F.A/GAFET/COFIA'] . $row, $emp['fa_gafet_cofia']);

        if (!empty($emp['deducciones_extra']) && is_array($emp['deducciones_extra'])) {
            foreach ($emp['deducciones_extra'] as $dextra) {
                $nombre = trim($dextra['nombre'] ?? '');
                $cant = (float) ($dextra['cantidad'] ?? 0);
                if ($nombre !== '' && $cant != 0) {
                    $key = mb_strtolower($nombre, 'UTF-8');
                    if (isset($mapDeduccionesExtrasCols[$key])) {
                        $sheet->setCellValue($mapeo[$mapDeduccionesExtrasCols[$key]] . $row, $cant);
                    }
                }
            }
        }
        $letraPrimeraDeduccion = $mapeo['ISR'];
        $letraUltimaDeduccion = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex(\PhpOffice\PhpSpreadsheet\Cell\Coordinate::columnIndexFromString($mapeo['TOTAL DE DEDUCCIONES']) - 1);
        $sheet->setCellValue($mapeo['TOTAL DE DEDUCCIONES'] . $row, "=SUM({$letraPrimeraDeduccion}{$row}:{$letraUltimaDeduccion}{$row})");
        $sheet->setCellValue($mapeo['NETO A RECIBIR'] . $row, "=" . $mapeo['TOTAL PERCEPCIONES'] . "$row-" . $mapeo['TOTAL DE DEDUCCIONES'] . "$row");
        if (($emp['tarjeta'] ?? 0) != 0) $sheet->setCellValue($mapeo['DISPERSION DE TARJETA'] . $row, $emp['tarjeta']);
        $sheet->setCellValue($mapeo['IMPORTE EN EFECTIVO'] . $row, "=" . $mapeo['NETO A RECIBIR'] . "$row-" . $mapeo['DISPERSION DE TARJETA'] . "$row");
        if (($emp['prestamo'] ?? 0) != 0) $sheet->setCellValue($mapeo['PRÉSTAMO'] . $row, $emp['prestamo']);
        $sheet->setCellValue($mapeo['TOTAL A RECIBIR'] . $row, "=" . $mapeo['IMPORTE EN EFECTIVO'] . "$row-" . $mapeo['PRÉSTAMO'] . "$row");
        $sheet->setCellValue($mapeo['REDONDEADO'] . $row, "=ROUND(" . $mapeo['TOTAL A RECIBIR'] . "$row,0)-" . $mapeo['TOTAL A RECIBIR'] . "$row");
        $sheet->setCellValue($mapeo['TOTAL EFECTIVO REDONDEADO'] . $row, "=" . $mapeo['TOTAL A RECIBIR'] . "$row+" . $mapeo['REDONDEADO'] . "$row");

        // Formatos de alineación (Centrar todo excepto NOMBRE)
        $sheet->getStyle('A' . $row . ':' . $ultimaLetra . $row)->getAlignment()->setHorizontal('center')->setVertical('center');
        $sheet->getStyle($mapeo['NOMBRE'] . $row)->getAlignment()->setHorizontal('left');

        $colsMoneda = array_merge(['SUELDO NETO'], array_values($mapExtrasCols), ['TOTAL PERCEPCIONES', 'NETO A RECIBIR', 'IMPORTE EN EFECTIVO', 'TOTAL A RECIBIR', 'TOTAL EFECTIVO REDONDEADO']);
        foreach ($colsMoneda as $m) $sheet->getStyle($mapeo[$m] . $row)->getNumberFormat()->setFormatCode('$#,##0.00');

        $colsDed = array_merge(['ISR', 'IMSS', 'INFONAVIT', 'AJUSTES AL SUB', 'PERMISOS', 'UNIFORMES', 'BIOMETRICO', 'F.A/GAFET/COFIA'], array_values($mapDeduccionesExtrasCols), ['TOTAL DE DEDUCCIONES', 'DISPERSION DE TARJETA', 'PRÉSTAMO']);
        foreach ($colsDed as $d) {
            $sheet->getStyle($mapeo[$d] . $row)->getFont()->setColor(new Color('FF0000'));
            $sheet->getStyle($mapeo[$d] . $row)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
        }
        $sheet->getStyle($mapeo['REDONDEADO'] . $row)->getNumberFormat()->setFormatCode('$#,##0.00;[RED]-$#,##0.00');

        $sheet->getRowDimension($row)->setRowHeight(48);
        $sheet->getStyle('A' . $row . ':' . $mapeo['NOMBRE'] . $row)->getFont()->setSize(15);
        $sheet->getStyle($mapeo['NOMBRE'] . $row)->getFont()->setSize(16);

        // Tamaño 18 después de NOMBRE (Columna D en adelante)
        $letraDespuesNombre = 'D';
        $sheet->getStyle($letraDespuesNombre . $row . ':' . $ultimaLetra . $row)->getFont()->setSize(18);

        $row++;
    }

    // Totales
    $filaTot = $row;
    $sheet->setCellValue('A' . $filaTot, 'TOTALES');
    $sheet->getStyle('A' . $filaTot)->getFont()->setBold(true)->setSize(14);

    $colsASumar = array_merge($colFinales);
    unset($colsASumar[array_search('FIRMA RECIBIDO', $colsASumar)]);
    foreach ($colsASumar as $n) {
        $l = $mapeo[$n];
        $sheet->setCellValue($l . $filaTot, "=IF(SUM($l" . "9:$l" . ($filaTot - 1) . ")=0,\"\",SUM($l" . "9:$l" . ($filaTot - 1) . "))");
        $sheet->getStyle($l . $filaTot)->getFont()->setBold(true)->setSize(18);
        if (in_array($n, array_merge(['ISR', 'IMSS', 'INFONAVIT', 'AJUSTES AL SUB', 'PERMISOS', 'UNIFORMES', 'BIOMETRICO', 'F.A/GAFET/COFIA'], array_values($mapDeduccionesExtrasCols), ['TOTAL DE DEDUCCIONES', 'DISPERSION DE TARJETA', 'PRÉSTAMO']))) {
            $sheet->getStyle($l . $filaTot)->getFont()->setColor(new Color('FF0000'));
            $sheet->getStyle($l . $filaTot)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
        } elseif ($n === 'REDONDEADO') {
            $sheet->getStyle($l . $filaTot)->getNumberFormat()->setFormatCode('$#,##0.00;[RED]-$#,##0.00');
        } else {
            $sheet->getStyle($l . $filaTot)->getNumberFormat()->setFormatCode('$#,##0.00');
        }
    }
    for ($i = $inicioEmpaque; $i <= $finResumen; $i += (($i >= $inicioResumen) ? 2 : 1)) {
        $l = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($i);
        $sheet->setCellValue($l . $filaTot, "=IF(SUM($l" . "9:$l" . ($filaTot - 1) . ")=0,\"\",SUM($l" . "9:$l" . ($filaTot - 1) . "))");
        $sheet->getStyle($l . $filaTot)->getFont()->setBold(true)->setSize(18);
    }
    $sheet->getStyle('A' . $filaTot . ':' . $ultimaLetra . $filaTot)->getFill()->setFillType('solid')->getStartColor()->setRGB('D3D3D3');
    $sheet->getStyle('A' . $filaTot . ':' . $ultimaLetra . $filaTot)->getAlignment()->setHorizontal('center')->setVertical('center');
    $sheet->getStyle('A7:' . $ultimaLetra . $filaTot)->applyFromArray(['borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => '000000']]]]);

    // Visibilidad Final
    if (!$flags['isr']) $sheet->getColumnDimension($mapeo['ISR'])->setVisible(false);
    if (!$flags['imss']) $sheet->getColumnDimension($mapeo['IMSS'])->setVisible(false);
    if (!$flags['infonavit']) $sheet->getColumnDimension($mapeo['INFONAVIT'])->setVisible(false);
    if (!$flags['ajustes']) $sheet->getColumnDimension($mapeo['AJUSTES AL SUB'])->setVisible(false);
    if (!$flags['permiso']) $sheet->getColumnDimension($mapeo['PERMISOS'])->setVisible(false);
    if (!$flags['uniformes']) $sheet->getColumnDimension($mapeo['UNIFORMES'])->setVisible(false);
    if (!$flags['checador']) $sheet->getColumnDimension($mapeo['BIOMETRICO'])->setVisible(false);
    if (!$flags['fa']) $sheet->getColumnDimension($mapeo['F.A/GAFET/COFIA'])->setVisible(false);



    // Margenes
    $ps = $sheet->getPageSetup();
    $ps->setPaperSize(PageSetup::PAPERSIZE_LETTER)->setOrientation(PageSetup::ORIENTATION_LANDSCAPE);
    $ps->setFitToPage(true)->setFitToHeight(1)->setFitToWidth(1);
    $ps->setPrintArea('A1:' . $ultimaLetra . $filaTot);
}

// Crear las hojas dinámicamente según los departamentos del JSON
$esPrimeraHoja = true;

if ($jsonNomina && isset($jsonNomina['departamentos'])) {
    foreach ($jsonNomina['departamentos'] as $depto) {
        $idDepto = $depto['id_departamento'] ?? $depto['nombre'];
        $nombreDepto = $depto['nombre'];

        // Verificar si hay empleados CSS y SSS para este depto
        $hayCSS = false;
        $haySSS = false;

        foreach ($depto['empleados'] ?? [] as $emp) {
            if ($emp['mostrar'] ?? true) {
                if ($emp['seguroSocial'] ?? false) $hayCSS = true;
                else $haySSS = true;
            }
        }

        // 1. Crear Hoja CSS si aplica
        if ($hayCSS) {
            crearHoja(
                $spreadsheet,
                $depto,
                fn($e) => (($e['id_departamento'] ?? $e['nombre']) == $idDepto && ($e['mostrar'] ?? true) && ($e['seguroSocial'] ?? false)),
                substr($nombreDepto, 0, 20) . ' CSS',
                $esPrimeraHoja
            );
            $esPrimeraHoja = false;
        }

        // 2. Crear Hoja SSS si aplica
        if ($haySSS) {
            crearHoja(
                $spreadsheet,
                $depto,
                fn($e) => (($e['id_departamento'] ?? $e['nombre']) == $idDepto && ($e['mostrar'] ?? true) && !($e['seguroSocial'] ?? false)),
                substr($nombreDepto, 0, 20) . ' SSS',
                $esPrimeraHoja
            );
            $esPrimeraHoja = false;
        }
    }
}

// Si no se creó ninguna hoja (ej. json vacío), crear una por defecto para evitar errores
if ($esPrimeraHoja) {
    $spreadsheet->getActiveSheet()->setTitle('VACÍO');
}

// Descargar
$writer = new Xlsx($spreadsheet);
$filename = 'NOMINA_COMPLETA_SEM_' . ($numero_semana ?? '00') . '_' . date('Y-m-d_H-i-s') . '.xlsx';
header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
header('Content-Disposition: attachment; filename="' . $filename . '"');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');
$writer->save('php://output');
exit;
