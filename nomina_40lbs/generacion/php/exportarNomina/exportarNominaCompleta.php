<?php

// Incluir autoload de Composer
require_once __DIR__ . '/../../../../vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Color;
use PhpOffice\PhpSpreadsheet\Worksheet\PageSetup;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Worksheet\Drawing;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;


/**
 * Determina si un color de fondo es oscuro o claro y devuelve el color de texto adecuado (blanco o negro).
 */
function obtenerColorContraste($hexColor)
{
    // Eliminar el # si existe
    $hexColor = str_replace('#', '', $hexColor);

    // Si el color no es válido, por defecto blanco
    if (strlen($hexColor) != 6)
        return '000000';

    // Convertir hex a RGB
    $r = hexdec(substr($hexColor, 0, 2));
    $g = hexdec(substr($hexColor, 2, 2));
    $b = hexdec(substr($hexColor, 4, 2));

    // Calcular el brillo (Fórmula YIQ)
    // El umbral de 128 (la mitad de 255) determina si el fondo es claro u oscuro
    $yiq = (($r * 299) + ($g * 587) + ($b * 114)) / 1000;

    return ($yiq >= 128) ? '000000' : 'FFFFFF';
}

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
//  FUNCIÓN PARA CREAR UNA HOJA
//=====================

function crearHoja($spreadsheet, $titulo1, $titulo2, $filtroEmpleados, $nombreHoja, $colorExcel = 'F5EB1B', $esPrimera = false)
{
    global $jsonNomina, $fecha_inicio, $fecha_cierre, $numero_semana, $ano;

    $colorExcel = str_replace('#', '', $colorExcel);
    $textColor = obtenerColorContraste($colorExcel);

    if ($esPrimera) {
        $sheet = $spreadsheet->getActiveSheet();
    } else {
        $sheet = $spreadsheet->createSheet();
    }

    $sheet->setTitle($nombreHoja);

    // 1. Filtrar y ordenar empleados de esta hoja
    $empleados = [];
    if ($jsonNomina && isset($jsonNomina['departamentos'])) {
        foreach ($jsonNomina['departamentos'] as $depto) {
            foreach ($depto['empleados'] ?? [] as $emp) {
                if ($filtroEmpleados($emp))
                    $empleados[] = $emp;
            }
        }
    }
    usort($empleados, fn($a, $b) => strcmp($a['nombre'] ?? '', $b['nombre'] ?? ''));

    // 2. Buscar percepciones_extra únicas (insensible a mayúsculas/minúsculas)
    $extrasDinamicas = []; // key: normalized (strtolower), value: display (strtoupper)
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

    // 2.b. Buscar deducciones_extra únicas (insensible a mayúsculas/minúsculas)
    $deduccionesDinamicas = []; // key: normalized (strtolower), value: display (strtoupper)
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

    // 3. Construir lista dinámica de encabezados y mapeo de posiciones (1-indexed)
    $columnasNombres = [
        'N°',                  // 1 (A)
        'CD',                  // 2 (B)
        'NOMBRE',              // 3 (C)
        'SUELDO BRUTO',         // 4 (D)
        'INCENTIVO',           // 5 (E)
        'HORAS EXTRA',         // 6 (F)
        'BONO ANTIGÜEDAD',     // 7 (G)
        'PUESTO',              // 8 (H)
        'ACTIVIDADES ESPECIALES'// 9 (I)
    ];

    $mapExtrasCols = []; // key: normalized name => colIndex
    $colIndex = 10;
    foreach ($extrasDinamicas as $key => $dispName) {
        $columnasNombres[] = $dispName;
        $mapExtrasCols[$key] = $colIndex;
        $colIndex++;
    }

    $colTotalPercepciones = $colIndex;
    $columnasNombres[] = 'TOTAL PERCEPCIONES';
    $colIndex++;

    $colISR = $colIndex; $columnasNombres[] = 'ISR'; $colIndex++;
    $colIMSS = $colIndex; $columnasNombres[] = 'IMSS'; $colIndex++;
    $colINFONAVIT = $colIndex; $columnasNombres[] = 'INFONAVIT'; $colIndex++;
    $colAJUSTES = $colIndex; $columnasNombres[] = 'AJUSTES AL SUB'; $colIndex++;
    $colAUSENTISMO = $colIndex; $columnasNombres[] = 'AUSENTISMO'; $colIndex++;
    $colPERMISOS = $colIndex; $columnasNombres[] = 'PERMISOS'; $colIndex++;
    $colUNIFORMES = $colIndex; $columnasNombres[] = 'UNIFORMES'; $colIndex++;
    $colBIOMETRICO = $colIndex; $columnasNombres[] = 'BIOMETRICO'; $colIndex++;

    $mapDeduccionesExtrasCols = []; // key: normalized name => colIndex
    foreach ($deduccionesDinamicas as $key => $dispName) {
        $columnasNombres[] = $dispName;
        $mapDeduccionesExtrasCols[$key] = $colIndex;
        $colIndex++;
    }

    $colTotalDeducciones = $colIndex; $columnasNombres[] = 'TOTAL DE DEDUCCIONES'; $colIndex++;
    $colNetoRecibir = $colIndex; $columnasNombres[] = 'NETO A RECIBIR'; $colIndex++;
    $colTarjeta = $colIndex; $columnasNombres[] = 'DISPERSION DE TARJETA'; $colIndex++;
    $colEfectivo = $colIndex; $columnasNombres[] = 'IMPORTE EN EFECTIVO'; $colIndex++;
    $colPrestamo = $colIndex; $columnasNombres[] = 'PRÉSTAMO'; $colIndex++;
    $colTotalRecibir = $colIndex; $columnasNombres[] = 'TOTAL A RECIBIR'; $colIndex++;
    $colRedondeado = $colIndex; $columnasNombres[] = 'REDONDEADO'; $colIndex++;
    $colTotalRedondeado = $colIndex; $columnasNombres[] = 'TOTAL EFECTIVO REDONDEADO'; $colIndex++;
    $colFirma = $colIndex; $columnasNombres[] = 'FIRMA RECIBIDO';

    $totalCols = count($columnasNombres);
    $lastColLetter = Coordinate::stringFromColumnIndex($totalCols);

    // Encabezados superiores
    $titulo3 = 'NOMINA DEL ' . strtoupper($fecha_inicio) . ' AL ' . strtoupper($fecha_cierre);
    $titulo4 = 'SEMANA ' . str_pad($numero_semana, 2, '0', STR_PAD_LEFT) . '-' . $ano;

    $sheet->setCellValue('A1', $titulo1);
    $sheet->setCellValue('A2', $titulo2);
    $sheet->setCellValue('A3', $titulo3);
    $sheet->setCellValue('A4', $titulo4);

    $sheet->mergeCells("A1:{$lastColLetter}1");
    $sheet->mergeCells("A2:{$lastColLetter}2");
    $sheet->mergeCells("A3:{$lastColLetter}3");
    $sheet->mergeCells("A4:{$lastColLetter}4");

    $verdeUsuario = '179C1E';
    $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(24)->setColor(new Color($verdeUsuario));
    $sheet->getStyle('A2')->getFont()->setBold(true)->setSize(20)->setColor(new Color($verdeUsuario));
    $sheet->getStyle('A3')->getFont()->setBold(true)->setSize(14);
    $sheet->getStyle('A4')->getFont()->setBold(true)->setSize(14);
    $sheet->getStyle("A1:A4")->getAlignment()->setHorizontal('center')->setVertical('center');

    // Logo
    $logoPath = '../../../../public/img/logo.jpg';
    if (file_exists($logoPath)) {
        $logo = new Drawing();
        $logo->setName('Logo');
        $logo->setPath($logoPath);
        $logo->setHeight(190);
        $logo->setCoordinates('B1');
        $logo->setOffsetX(10);
        $logo->setWorksheet($sheet);
    }

    // Encabezados fila 6
    foreach ($columnasNombres as $idxCol => $encabezado) {
        $colL = Coordinate::stringFromColumnIndex($idxCol + 1);
        $sheet->setCellValue($colL . '6', $encabezado);

        $w = 20;
        if ($colL === 'A') $w = 12;
        elseif ($colL === 'B') $w = 14;
        elseif ($colL === 'C') $w = 65;
        elseif (in_array($encabezado, ['SUELDO BRUTO', 'TOTAL PERCEPCIONES', 'ACTIVIDADES ESPECIALES', 'AJUSTES AL SUB', 'TOTAL DE DEDUCCIONES', 'NETO A RECIBIR', 'DISPERSION DE TARJETA', 'IMPORTE EN EFECTIVO', 'PRÉSTAMO', 'TOTAL A RECIBIR'])) $w = 22;
        elseif ($encabezado === 'TOTAL EFECTIVO REDONDEADO') $w = 23;
        elseif ($encabezado === 'FIRMA RECIBIDO') $w = 25;
        $sheet->getColumnDimension($colL)->setWidth($w);

        $s = 14;
        if (in_array($encabezado, ['TOTAL PERCEPCIONES', 'TOTAL DE DEDUCCIONES', 'NETO A RECIBIR', 'DISPERSION DE TARJETA', 'IMPORTE EN EFECTIVO', 'TOTAL A RECIBIR', 'TOTAL EFECTIVO REDONDEADO'])) $s = 13;
        $sheet->getStyle($colL . '6')->getFont()->setSize($s);
    }

    $sheet->getStyle("A6:{$lastColLetter}6")->applyFromArray([
        'font' => ['bold' => true, 'size' => 10, 'color' => ['rgb' => $textColor]],
        'alignment' => ['horizontal' => 'center', 'vertical' => 'center', 'wrapText' => true],
        'fill' => ['fillType' => 'solid', 'startColor' => ['rgb' => $colorExcel]]
    ]);

    // Banderas de visibilidad
    $flags = [
        'incentivo' => false,
        'horas_extra' => false,
        'bono_antiguedad' => false,
        'puesto' => false,
        'actividades_especiales' => false,
        'isr' => false,
        'imss' => false,
        'infonavit' => false,
        'ajustes' => false,
        'ausentismo' => false,
        'permiso' => false,
        'uniformes' => false,
        'checador' => false
    ];

    foreach ($empleados as $emp) {
        if (($emp['incentivo'] ?? 0) != 0) $flags['incentivo'] = true;
        if (($emp['horas_extra'] ?? 0) != 0) $flags['horas_extra'] = true;
        if (($emp['bono_antiguedad'] ?? 0) != 0) $flags['bono_antiguedad'] = true;
        if (($emp['puesto'] ?? 0) != 0) $flags['puesto'] = true;
        if (($emp['actividades_especiales'] ?? 0) != 0) $flags['actividades_especiales'] = true;
        if (($emp['inasistencia'] ?? 0) != 0) $flags['ausentismo'] = true;
        if (($emp['permiso'] ?? 0) != 0) $flags['permiso'] = true;
        if (($emp['uniformes'] ?? 0) != 0) $flags['uniformes'] = true;
        if (($emp['checador'] ?? 0) != 0) $flags['checador'] = true;

        foreach ($emp['conceptos'] ?? [] as $c) {
            if (($c['resultado'] ?? 0) != 0) {
                if ($c['codigo'] == '45') $flags['isr'] = true;
                if ($c['codigo'] == '52') $flags['imss'] = true;
                if ($c['codigo'] == '16') $flags['infonavit'] = true;
                if ($c['codigo'] == '107') $flags['ajustes'] = true;
            }
        }
    }

    // Letras de columnas dinámicas para fórmulas
    $lastPercepcionLetter = Coordinate::stringFromColumnIndex($colTotalPercepciones - 1);
    $colTotalPercepcionesLetter = Coordinate::stringFromColumnIndex($colTotalPercepciones);
    $colISRLetter = Coordinate::stringFromColumnIndex($colISR);
    $colIMSSLetter = Coordinate::stringFromColumnIndex($colIMSS);
    $colINFONAVITLetter = Coordinate::stringFromColumnIndex($colINFONAVIT);
    $colAJUSTESLetter = Coordinate::stringFromColumnIndex($colAJUSTES);
    $colAUSENTISMOLetter = Coordinate::stringFromColumnIndex($colAUSENTISMO);
    $colPERMISOSLetter = Coordinate::stringFromColumnIndex($colPERMISOS);
    $colUNIFORMESLetter = Coordinate::stringFromColumnIndex($colUNIFORMES);
    $colBIOMETRICOLetter = Coordinate::stringFromColumnIndex($colBIOMETRICO);
    $lastDeduccionLetter = Coordinate::stringFromColumnIndex($colTotalDeducciones - 1);

    $colTotalDeduccionesLetter = Coordinate::stringFromColumnIndex($colTotalDeducciones);
    $colNetoRecibirLetter = Coordinate::stringFromColumnIndex($colNetoRecibir);
    $colTarjetaLetter = Coordinate::stringFromColumnIndex($colTarjeta);
    $colEfectivoLetter = Coordinate::stringFromColumnIndex($colEfectivo);
    $colPrestamoLetter = Coordinate::stringFromColumnIndex($colPrestamo);
    $colTotalRecibirLetter = Coordinate::stringFromColumnIndex($colTotalRecibir);
    $colRedondeadoLetter = Coordinate::stringFromColumnIndex($colRedondeado);
    $colTotalRedondeadoLetter = Coordinate::stringFromColumnIndex($colTotalRedondeado);

    $mapeoConceptos = [
        '45' => $colISRLetter,
        '52' => $colIMSSLetter,
        '16' => $colINFONAVITLetter,
        '107' => $colAJUSTESLetter,
    ];

    // Insertar datos
    $row = 7;
    $idx = 1;
    foreach ($empleados as $emp) {
        $sheet->setCellValue('A' . $row, $idx++);
        $sheet->setCellValue('B' . $row, $emp['clave'] ?? '');
        $sheet->setCellValue('C' . $row, $emp['nombre'] ?? '');

        // Percepciones estándar
        if (($emp['sueldo_neto'] ?? 0) != 0) $sheet->setCellValue('D' . $row, $emp['sueldo_neto']);
        if (($emp['incentivo'] ?? 0) != 0) $sheet->setCellValue('E' . $row, $emp['incentivo']);
        if (($emp['horas_extra'] ?? 0) != 0) $sheet->setCellValue('F' . $row, $emp['horas_extra']);
        if (($emp['bono_antiguedad'] ?? 0) != 0) $sheet->setCellValue('G' . $row, $emp['bono_antiguedad']);
        if (($emp['puesto'] ?? 0) != 0) $sheet->setCellValue('H' . $row, $emp['puesto']);
        if (($emp['actividades_especiales'] ?? 0) != 0) $sheet->setCellValue('I' . $row, $emp['actividades_especiales']);

        // Percepciones extras dinámicas
        if (!empty($emp['percepciones_extra']) && is_array($emp['percepciones_extra'])) {
            foreach ($emp['percepciones_extra'] as $extra) {
                $nombre = trim($extra['nombre'] ?? '');
                $cant = (float) ($extra['cantidad'] ?? 0);
                if ($nombre !== '' && $cant != 0) {
                    $key = mb_strtolower($nombre, 'UTF-8');
                    if (isset($mapExtrasCols[$key])) {
                        $colL = Coordinate::stringFromColumnIndex($mapExtrasCols[$key]);
                        $sheet->setCellValue($colL . $row, $cant);
                    }
                }
            }
        }

        // Total Percepciones
        $sheet->setCellValue($colTotalPercepcionesLetter . $row, "=SUM(D{$row}:{$lastPercepcionLetter}{$row})");

        // Conceptos deducciones
        foreach ($emp['conceptos'] ?? [] as $c) {
            if (isset($mapeoConceptos[$c['codigo']]) && ($c['resultado'] ?? 0) != 0) {
                $sheet->setCellValue($mapeoConceptos[$c['codigo']] . $row, $c['resultado']);
            }
        }

        // Deducciones estándar
        if (($emp['inasistencia'] ?? 0) != 0) $sheet->setCellValue($colAUSENTISMOLetter . $row, $emp['inasistencia']);
        if (($emp['permiso'] ?? 0) != 0) $sheet->setCellValue($colPERMISOSLetter . $row, $emp['permiso']);
        if (($emp['uniformes'] ?? 0) != 0) $sheet->setCellValue($colUNIFORMESLetter . $row, $emp['uniformes']);
        if (($emp['checador'] ?? 0) != 0) $sheet->setCellValue($colBIOMETRICOLetter . $row, $emp['checador']);

        // Deducciones extras dinámicas
        if (!empty($emp['deducciones_extra']) && is_array($emp['deducciones_extra'])) {
            foreach ($emp['deducciones_extra'] as $dextra) {
                $nombre = trim($dextra['nombre'] ?? '');
                $cant = (float) ($dextra['cantidad'] ?? 0);
                if ($nombre !== '' && $cant != 0) {
                    $key = mb_strtolower($nombre, 'UTF-8');
                    if (isset($mapDeduccionesExtrasCols[$key])) {
                        $colL = Coordinate::stringFromColumnIndex($mapDeduccionesExtrasCols[$key]);
                        $sheet->setCellValue($colL . $row, $cant);
                    }
                }
            }
        }

        $sheet->setCellValue($colTotalDeduccionesLetter . $row, "=SUM({$colISRLetter}{$row}:{$lastDeduccionLetter}{$row})");
        $sheet->setCellValue($colNetoRecibirLetter . $row, "={$colTotalPercepcionesLetter}{$row}-{$colTotalDeduccionesLetter}{$row}");

        if (($emp['tarjeta'] ?? 0) != 0) $sheet->setCellValue($colTarjetaLetter . $row, $emp['tarjeta']);
        $sheet->setCellValue($colEfectivoLetter . $row, "={$colNetoRecibirLetter}{$row}-{$colTarjetaLetter}{$row}");

        if (($emp['prestamo'] ?? 0) != 0) $sheet->setCellValue($colPrestamoLetter . $row, $emp['prestamo']);
        $sheet->setCellValue($colTotalRecibirLetter . $row, "={$colEfectivoLetter}{$row}-{$colPrestamoLetter}{$row}");

        $sheet->setCellValue($colRedondeadoLetter . $row, "=ROUND({$colTotalRecibirLetter}{$row},0)-{$colTotalRecibirLetter}{$row}");
        $sheet->setCellValue($colTotalRedondeadoLetter . $row, "={$colTotalRecibirLetter}{$row}+{$colRedondeadoLetter}{$row}");

        // Formatos de moneda y colores
        $sheet->getStyle("D{$row}:{$colTotalRedondeadoLetter}{$row}")->getNumberFormat()->setFormatCode('$#,##0.00');

        $colsRojas = [
            $colISRLetter, $colIMSSLetter, $colINFONAVITLetter, $colAJUSTESLetter,
            $colAUSENTISMOLetter, $colPERMISOSLetter, $colUNIFORMESLetter, $colBIOMETRICOLetter
        ];
        foreach ($mapDeduccionesExtrasCols as $cIdx) {
            $colsRojas[] = Coordinate::stringFromColumnIndex($cIdx);
        }
        $colsRojas[] = $colTotalDeduccionesLetter;
        $colsRojas[] = $colTarjetaLetter;
        $colsRojas[] = $colPrestamoLetter;

        foreach ($colsRojas as $cL) {
            $sheet->getStyle($cL . $row)->getFont()->setColor(new Color('FF0000'));
            $sheet->getStyle($cL . $row)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
        }
        $sheet->getStyle($colRedondeadoLetter . $row)->getNumberFormat()->setFormatCode('$#,##0.00;[RED]-$#,##0.00');

        $sheet->getStyle("A{$row}:{$lastColLetter}{$row}")->getAlignment()->setVertical('center');
        $sheet->getStyle("A{$row}:B{$row}")->getAlignment()->setHorizontal('center');
        $sheet->getStyle("D{$row}:{$colTotalRedondeadoLetter}{$row}")->getAlignment()->setHorizontal('center');

        $row++;
    }

    // Fila de Totales
    $filaTotal = $row;
    $sheet->setCellValue('A' . $filaTotal, 'TOTALES');
    $sheet->getStyle('A' . $filaTotal)->getFont()->setBold(true);

    $colsTotalesIndices = range(4, $colTotalRedondeado);
    foreach ($colsTotalesIndices as $idxC) {
        $cL = Coordinate::stringFromColumnIndex($idxC);
        $sheet->setCellValue($cL . $filaTotal, '=SUM(' . $cL . '7:' . $cL . ($filaTotal - 1) . ')');
        $sheet->getStyle($cL . $filaTotal)->getFont()->setBold(true)->setSize(14);
        if (in_array($cL, $colsRojas)) {
            $sheet->getStyle($cL . $filaTotal)->getFont()->setColor(new Color('FF0000'));
            $sheet->getStyle($cL . $filaTotal)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
        } elseif ($cL === $colRedondeadoLetter) {
            $sheet->getStyle($cL . $filaTotal)->getNumberFormat()->setFormatCode('$#,##0.00;[RED]-$#,##0.00');
        } else {
            $sheet->getStyle($cL . $filaTotal)->getNumberFormat()->setFormatCode('$#,##0.00');
        }
        $sheet->getStyle($cL . $filaTotal)->getAlignment()->setHorizontal('center')->setVertical('center');
    }

    $sheet->getStyle("A{$filaTotal}:{$lastColLetter}{$filaTotal}")->getFill()->setFillType('solid')->getStartColor()->setRGB('D3D3D3');
    $sheet->getStyle("A6:{$lastColLetter}{$filaTotal}")->applyFromArray([
        'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => '000000']]]
    ]);

    // Visibilidad
    if (!$flags['incentivo']) $sheet->getColumnDimension('E')->setVisible(false);
    if (!$flags['horas_extra']) $sheet->getColumnDimension('F')->setVisible(false);
    if (!$flags['bono_antiguedad']) $sheet->getColumnDimension('G')->setVisible(false);
    if (!$flags['puesto']) $sheet->getColumnDimension('H')->setVisible(false);
    if (!$flags['actividades_especiales']) $sheet->getColumnDimension('I')->setVisible(false);
    if (!$flags['isr']) $sheet->getColumnDimension($colISRLetter)->setVisible(false);
    if (!$flags['imss']) $sheet->getColumnDimension($colIMSSLetter)->setVisible(false);
    if (!$flags['infonavit']) $sheet->getColumnDimension($colINFONAVITLetter)->setVisible(false);
    if (!$flags['ajustes']) $sheet->getColumnDimension($colAJUSTESLetter)->setVisible(false);
    if (!$flags['ausentismo']) $sheet->getColumnDimension($colAUSENTISMOLetter)->setVisible(false);
    if (!$flags['permiso']) $sheet->getColumnDimension($colPERMISOSLetter)->setVisible(false);
    if (!$flags['uniformes']) $sheet->getColumnDimension($colUNIFORMESLetter)->setVisible(false);
    if (!$flags['checador']) $sheet->getColumnDimension($colBIOMETRICOLetter)->setVisible(false);

    // Alturas de filla
    $sheet->getRowDimension(1)->setRowHeight(38);
    $sheet->getRowDimension(2)->setRowHeight(32);
    $sheet->getRowDimension(3)->setRowHeight(32);
    $sheet->getRowDimension(4)->setRowHeight(32);
    $sheet->getRowDimension(5)->setRowHeight(35);
    $sheet->getRowDimension(6)->setRowHeight(45);
    for ($i = 7; $i < $row; $i++) {
        $sheet->getRowDimension($i)->setRowHeight(48);
        for ($idxC = 1; $idxC <= $totalCols; $idxC++) {
            $cL = Coordinate::stringFromColumnIndex($idxC);
            $s = 15;
            if ($cL === 'A' || $cL === 'B') $s = 14;
            elseif ($cL === 'C') $s = 16;
            $sheet->getStyle($cL . $i)->getFont()->setSize($s);
        }
    }

    // Configuración página
    $ps = $sheet->getPageSetup();
    $ps->setPaperSize(PageSetup::PAPERSIZE_LETTER)->setOrientation(PageSetup::ORIENTATION_LANDSCAPE);
    $ps->setFitToPage(true)->setFitToHeight(1)->setFitToWidth(1);
    $ps->setPrintArea("A1:{$lastColLetter}{$filaTotal}");
    $pm = $sheet->getPageMargins();
    $pm->setLeft(0.5)->setRight(0.5)->setTop(0.5)->setBottom(0.5);
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
                if ($emp['seguroSocial'] ?? false)
                    $hayCSS = true;
                else
                    $haySSS = true;
            }
        }

        // 1. Crear Hoja CSS si aplica
        if ($hayCSS) {
            crearHoja(
                $spreadsheet,
                strtoupper($nombreDepto),
                'CITRICOS SAAO S.A DE C.V',
                fn($e) => (($e['id_departamento'] ?? $e['nombre']) == $idDepto && ($e['mostrar'] ?? true) && ($e['seguroSocial'] ?? false)),
                substr($nombreDepto, 0, 20) . ' CSS',
                ($depto['color_reporte'][0]['color'] ?? $depto['color_depto_nomina'] ?? 'F5EB1B'),
                $esPrimeraHoja
            );
            $esPrimeraHoja = false;
        }

        // 2. Crear Hoja SSS si aplica
        if ($haySSS) {
            crearHoja(
                $spreadsheet,
                strtoupper($nombreDepto),
                'CITRICOS SAAO S.A DE C.V',
                fn($e) => (($e['id_departamento'] ?? $e['nombre']) == $idDepto && ($e['mostrar'] ?? true) && !($e['seguroSocial'] ?? false)),
                substr($nombreDepto, 0, 20) . ' SSS',
                ($depto['color_reporte'][0]['color'] ?? $depto['color_depto_nomina'] ?? 'F5EB1B'),
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