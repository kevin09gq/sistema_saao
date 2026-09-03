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
$idDeptoSeleccionado = null;
$nombreDeptoSeleccionado = 'NÓMINA';
$seguroSocialSeleccionado = true;

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['jsonNomina'])) {
    $jsonNomina = json_decode($_POST['jsonNomina'], true);

    // Capturar parámetros dinámicos de filtrado
    $idDeptoSeleccionado = $_POST['id_departamento'] ?? null;
    $nombreDeptoSeleccionado = $_POST['nombre_departamento'] ?? 'NÓMINA';

    // Convertir seguroSocial a booleano (AJAX lo envía como string "true"/"false")
    $seguroSocialSeleccionado = filter_var($_POST['seguroSocial'] ?? true, FILTER_VALIDATE_BOOLEAN);
}

// Obtener el color del departamento desde el JSON (buscando en el nuevo formato color_reporte)
$colorExcel = 'F5EB1B'; // Amarillo por defecto
$idEmpresaSeleccionada = $_POST['id_empresa'] ?? null;

if ($jsonNomina && isset($jsonNomina['departamentos'])) {
    foreach ($jsonNomina['departamentos'] as $depto) {
        if ($depto['id_departamento'] == $idDeptoSeleccionado) {
            // Si existe el nuevo formato de arreglo de colores por empresa
            if (isset($depto['color_reporte']) && is_array($depto['color_reporte'])) {
                foreach ($depto['color_reporte'] as $config) {
                    // Si no se especificó empresa, tomamos la primera. Si se especificó, buscamos el match.
                    if (!$idEmpresaSeleccionada || $config['id_empresa'] == $idEmpresaSeleccionada) {
                        $colorExcel = $config['color'] ?? 'F5EB1B';
                        break;
                    }
                }
            } else {
                // Fallback por si el JSON aún tiene el campo plano anterior
                $colorExcel = $depto['color_depto_nomina'] ?? 'F5EB1B';
            }
            break;
        }
    }
}
$colorExcel = str_replace('#', '', $colorExcel);
$textColor = obtenerColorContraste($colorExcel);

//=====================
//  CONFIGURACIÓN INICIAL
//=====================

$spreadsheet = new Spreadsheet();
$sheet = $spreadsheet->getActiveSheet();

// Aplicar fuente Arial como predeterminada para toda la hoja
$spreadsheet->getDefaultStyle()->getFont()->setName('Arial');

// Establecer el nombre de la pestaña (Pestaña dinámica según depto y seguro)
$tipoSuffix = $seguroSocialSeleccionado ? 'CSS' : 'SSS';
$sheet->setTitle(substr($nombreDeptoSeleccionado, 0, 25) . " $tipoSuffix");

// Usar datos del JSON si existen
if ($jsonNomina) {
    $fecha_inicio = $jsonNomina['fecha_inicio'] ?? 'Fecha Inicio';
    $fecha_cierre = $jsonNomina['fecha_cierre'] ?? 'Fecha Cierre';
    $ano = date('Y');
} else {
    $fecha_inicio = '16/Ene';
    $fecha_cierre = '22/Ene';
    $ano = date('Y');
}

// 1. Recopilar empleados filtrados
$empleados40Libras = [];

if ($jsonNomina && isset($jsonNomina['departamentos'])) {
    foreach ($jsonNomina['departamentos'] as $departamento) {
        if (isset($departamento['empleados'])) {
            foreach ($departamento['empleados'] as $empleado) {
                $idDepartamentoRow = $empleado['id_departamento'] ?? null;
                $mostrar = $empleado['mostrar'] ?? false;
                $seguroSocialRow = $empleado['seguroSocial'] ?? false;

                if ($idDepartamentoRow == $idDeptoSeleccionado && $mostrar && ($seguroSocialRow == $seguroSocialSeleccionado)) {
                    $empleados40Libras[] = $empleado;
                }
            }
        }
    }
}

usort($empleados40Libras, function ($a, $b) {
    return strcmp($a['nombre'] ?? '', $b['nombre'] ?? '');
});

// 2. Buscar percepciones_extra únicas (insensible a mayúsculas/minúsculas)
$extrasDinamicas = [];
foreach ($empleados40Libras as $emp) {
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
$deduccionesDinamicas = [];
foreach ($empleados40Libras as $emp) {
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

// Títulos superiores
$titulo1 = strtoupper($nombreDeptoSeleccionado);
$titulo2 = 'CITRICOS SAAO S.A DE C.V';
$titulo3 = 'NOMINA DEL ' . strtoupper($fecha_inicio) . ' AL ' . strtoupper($fecha_cierre);
$titulo4 = 'SEMANA ' . (isset($jsonNomina['numero_semana']) ? str_pad($jsonNomina['numero_semana'], 2, '0', STR_PAD_LEFT) : '00') . '-' . $ano;

$sheet->setCellValue('A1', $titulo1);
$sheet->setCellValue('A2', $titulo2);
$sheet->setCellValue('A3', $titulo3);
$sheet->setCellValue('A4', $titulo4);

$sheet->mergeCells("A1:{$lastColLetter}1");
$sheet->mergeCells("A2:{$lastColLetter}2");
$sheet->mergeCells("A3:{$lastColLetter}3");
$sheet->mergeCells("A4:{$lastColLetter}4");

$sheet->getStyle('A1')->getFont()->setBold(true)->setSize(24)->setColor(new Color('179C1E'));
$sheet->getStyle('A2')->getFont()->setBold(true)->setSize(20)->setColor(new Color('179C1E'));
$sheet->getStyle('A3')->getFont()->setBold(true)->setSize(14);
$sheet->getStyle('A4')->getFont()->setBold(true)->setSize(14);
$sheet->getStyle("A1:A4")->getAlignment()->setHorizontal('center');

// Logo
$logoPath = '../../../../public/img/logo.jpg';
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

// Encabezados en fila 6
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

$sheet->getStyle("A6:{$lastColLetter}6")->getFont()->setBold(true)->setSize(10)->setColor(new Color($textColor));
$sheet->getStyle("A6:{$lastColLetter}6")->getAlignment()->setHorizontal('center')->setVertical('center')->setWrapText(true);
$sheet->getStyle("A6:{$lastColLetter}6")->getFill()->setFillType('solid')->getStartColor()->setRGB($colorExcel);

// Verificar banderas de datos
$incentivoTieneDatos = false;
$horasExtraTieneDatos = false;
$bonoAntiguedadTieneDatos = false;
$puestoTieneDatos = false;
$actividadesEspecialesTieneDatos = false;
$ajustesAlSubTieneDatos = false;
$ausentismoTieneDatos = false;
$permisoTieneDatos = false;
$uniformeTieneDatos = false;
$checadorTieneDatos = false;

foreach ($empleados40Libras as $empleado) {
    if (($empleado['incentivo'] ?? 0) != 0) $incentivoTieneDatos = true;
    if (($empleado['horas_extra'] ?? 0) != 0) $horasExtraTieneDatos = true;
    if (($empleado['bono_antiguedad'] ?? 0) != 0) $bonoAntiguedadTieneDatos = true;
    if (($empleado['puesto'] ?? 0) != 0) $puestoTieneDatos = true;
    if (($empleado['actividades_especiales'] ?? 0) != 0) $actividadesEspecialesTieneDatos = true;
    if (($empleado['inasistencia'] ?? 0) != 0) $ausentismoTieneDatos = true;
    if (($empleado['permiso'] ?? 0) != 0) $permisoTieneDatos = true;
    if (($empleado['uniformes'] ?? 0) != 0) $uniformeTieneDatos = true;
    if (($empleado['checador'] ?? 0) != 0) $checadorTieneDatos = true;

    if (!empty($empleado['conceptos']) && is_array($empleado['conceptos'])) {
        foreach ($empleado['conceptos'] as $concepto) {
            if ($concepto['codigo'] === '107' && ($concepto['resultado'] ?? 0) != 0) {
                $ajustesAlSubTieneDatos = true;
                break;
            }
        }
    }
}

// Letras para fórmulas dinámicas
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

// Agregar datos de empleados
$numeroFila = 7;
$numeroEmpleado = 1;

foreach ($empleados40Libras as $empleado) {

    $sheet->setCellValue('A' . $numeroFila, $numeroEmpleado);
    $sheet->setCellValue('B' . $numeroFila, $empleado['clave'] ?? '');
    $sheet->setCellValue('C' . $numeroFila, $empleado['nombre'] ?? '');

    // Percepciones estándar
    $sueldoNeto = $empleado['sueldo_neto'] ?? 0;
    if (!empty($sueldoNeto) && $sueldoNeto != 0) {
        $sheet->setCellValue('D' . $numeroFila, $sueldoNeto);
    }

    $incentivo = $empleado['incentivo'] ?? 0;
    if (!empty($incentivo) && $incentivo != 0) {
        $sheet->setCellValue('E' . $numeroFila, $incentivo);
    }

    $horasExtra = $empleado['horas_extra'] ?? 0;
    if (!empty($horasExtra) && $horasExtra != 0) {
        $sheet->setCellValue('F' . $numeroFila, $horasExtra);
    }

    $bonoAntiguedad = $empleado['bono_antiguedad'] ?? 0;
    if (!empty($bonoAntiguedad) && $bonoAntiguedad != 0) {
        $sheet->setCellValue('G' . $numeroFila, $bonoAntiguedad);
    }

    $puesto = $empleado['puesto'] ?? 0;
    if (!empty($puesto) && $puesto != 0) {
        $sheet->setCellValue('H' . $numeroFila, $puesto);
    }

    $actividadesEspeciales = $empleado['actividades_especiales'] ?? 0;
    if (!empty($actividadesEspeciales) && $actividadesEspeciales != 0) {
        $sheet->setCellValue('I' . $numeroFila, $actividadesEspeciales);
    }

    // Percepciones extras dinámicas
    if (!empty($empleado['percepciones_extra']) && is_array($empleado['percepciones_extra'])) {
        foreach ($empleado['percepciones_extra'] as $extra) {
            $nombre = trim($extra['nombre'] ?? '');
            $cant = (float) ($extra['cantidad'] ?? 0);
            if ($nombre !== '' && $cant != 0) {
                $key = mb_strtolower($nombre, 'UTF-8');
                if (isset($mapExtrasCols[$key])) {
                    $colL = Coordinate::stringFromColumnIndex($mapExtrasCols[$key]);
                    $sheet->setCellValue($colL . $numeroFila, $cant);
                }
            }
        }
    }

    // Total percepciones
    $sheet->setCellValue($colTotalPercepcionesLetter . $numeroFila, "=SUM(D{$numeroFila}:{$lastPercepcionLetter}{$numeroFila})");

    // Deducciones conceptos
    if (!empty($empleado['conceptos']) && is_array($empleado['conceptos'])) {
        foreach ($empleado['conceptos'] as $concepto) {
            $codigo = $concepto['codigo'] ?? null;
            $resultado = $concepto['resultado'] ?? 0;
            if ($codigo === '107' && !$ajustesAlSubTieneDatos) continue;

            if (isset($mapeoConceptos[$codigo]) && !empty($resultado) && $resultado != 0) {
                $colL = $mapeoConceptos[$codigo];
                $sheet->setCellValue($colL . $numeroFila, $resultado);
            }
        }
    }

    // Deducciones fijas
    if ($ausentismoTieneDatos) {
        $inasistencia = $empleado['inasistencia'] ?? 0;
        if (!empty($inasistencia) && $inasistencia != 0) {
            $sheet->setCellValue($colAUSENTISMOLetter . $numeroFila, $inasistencia);
        }
    }

    if ($permisoTieneDatos) {
        $permiso = $empleado['permiso'] ?? 0;
        if (!empty($permiso) && $permiso != 0) {
            $sheet->setCellValue($colPERMISOSLetter . $numeroFila, $permiso);
        }
    }

    if ($uniformeTieneDatos) {
        $uniforme = $empleado['uniformes'] ?? 0;
        if (!empty($uniforme) && $uniforme != 0) {
            $sheet->setCellValue($colUNIFORMESLetter . $numeroFila, $uniforme);
        }
    }

    if ($checadorTieneDatos) {
        $checador = $empleado['checador'] ?? 0;
        if (!empty($checador) && $checador != 0) {
            $sheet->setCellValue($colBIOMETRICOLetter . $numeroFila, $checador);
        }
    }

    // Deducciones extras dinámicas
    if (!empty($empleado['deducciones_extra']) && is_array($empleado['deducciones_extra'])) {
        foreach ($empleado['deducciones_extra'] as $dextra) {
            $nombre = trim($dextra['nombre'] ?? '');
            $cant = (float) ($dextra['cantidad'] ?? 0);
            if ($nombre !== '' && $cant != 0) {
                $key = mb_strtolower($nombre, 'UTF-8');
                if (isset($mapDeduccionesExtrasCols[$key])) {
                    $colL = Coordinate::stringFromColumnIndex($mapDeduccionesExtrasCols[$key]);
                    $sheet->setCellValue($colL . $numeroFila, $cant);
                }
            }
        }
    }

    $sheet->setCellValue($colTotalDeduccionesLetter . $numeroFila, "=SUM({$colISRLetter}{$numeroFila}:{$lastDeduccionLetter}{$numeroFila})");
    $sheet->setCellValue($colNetoRecibirLetter . $numeroFila, "={$colTotalPercepcionesLetter}{$numeroFila}-{$colTotalDeduccionesLetter}{$numeroFila}");

    $tarjeta = $empleado['tarjeta'] ?? 0;
    if (!empty($tarjeta) && $tarjeta != 0) {
        $sheet->setCellValue($colTarjetaLetter . $numeroFila, $tarjeta);
    }

    $sheet->setCellValue($colEfectivoLetter . $numeroFila, "={$colNetoRecibirLetter}{$numeroFila}-{$colTarjetaLetter}{$numeroFila}");

    $prestamo = $empleado['prestamo'] ?? 0;
    if (!empty($prestamo) && $prestamo != 0) {
        $sheet->setCellValue($colPrestamoLetter . $numeroFila, $prestamo);
    }

    $sheet->setCellValue($colTotalRecibirLetter . $numeroFila, "={$colEfectivoLetter}{$numeroFila}-{$colPrestamoLetter}{$numeroFila}");
    $sheet->setCellValue($colRedondeadoLetter . $numeroFila, "=ROUND({$colTotalRecibirLetter}{$numeroFila},0)-{$colTotalRecibirLetter}{$numeroFila}");
    $sheet->setCellValue($colTotalRedondeadoLetter . $numeroFila, "={$colTotalRecibirLetter}{$numeroFila}+{$colRedondeadoLetter}{$numeroFila}");

    // Alineación
    $sheet->getStyle('A' . $numeroFila . ':B' . $numeroFila)->getAlignment()->setHorizontal('center')->setVertical('center');
    $sheet->getStyle('C' . $numeroFila)->getAlignment()->setHorizontal('left')->setVertical('center');
    $sheet->getStyle("D{$numeroFila}:{$colTotalRedondeadoLetter}{$numeroFila}")->getAlignment()->setHorizontal('center')->setVertical('center');

    $numeroFila++;
    $numeroEmpleado++;
}

// Aplicar formatos a todas las celdas de datos
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

for ($fila = 7; $fila < $numeroFila; $fila++) {
    $sheet->getStyle("D{$fila}:{$colTotalRedondeadoLetter}{$fila}")->getNumberFormat()->setFormatCode('$#,##0.00');

    foreach ($colsRojas as $cL) {
        $sheet->getStyle($cL . $fila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
        $sheet->getStyle($cL . $fila)->getFont()->setColor(new Color('FF0000'));
    }
    $sheet->getStyle($colRedondeadoLetter . $fila)->getNumberFormat()->setFormatCode('$#,##0.00;[RED]-$#,##0.00');
}

// Fila de totales
$filaTotal = $numeroFila;
$sheet->setCellValue('A' . $filaTotal, 'TOTALES');
$sheet->getStyle('A' . $filaTotal)->getFont()->setBold(true);
$sheet->getStyle('A' . $filaTotal)->getAlignment()->setHorizontal('center')->setVertical('center');

$colsTotalesIndices = range(4, $colTotalRedondeado);
foreach ($colsTotalesIndices as $idxC) {
    $cL = Coordinate::stringFromColumnIndex($idxC);
    $rangoSuma = $cL . '7:' . $cL . ($filaTotal - 1);
    $sheet->setCellValue($cL . $filaTotal, '=IF(SUM(' . $rangoSuma . ')=0,"",SUM(' . $rangoSuma . '))');
    $sheet->getStyle($cL . $filaTotal)->getFont()->setBold(true)->setSize(14);

    if (in_array($cL, $colsRojas)) {
        $sheet->getStyle($cL . $filaTotal)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
        $sheet->getStyle($cL . $filaTotal)->getFont()->setColor(new Color('FF0000'));
    } elseif ($cL === $colRedondeadoLetter) {
        $sheet->getStyle($cL . $filaTotal)->getNumberFormat()->setFormatCode('$#,##0.00;[RED]-$#,##0.00');
    } else {
        $sheet->getStyle($cL . $filaTotal)->getNumberFormat()->setFormatCode('$#,##0.00');
    }
    $sheet->getStyle($cL . $filaTotal)->getAlignment()->setHorizontal('center')->setVertical('center');
}

$sheet->getRowDimension($filaTotal)->setRowHeight(25);
$sheet->getStyle("A{$filaTotal}:{$lastColLetter}{$filaTotal}")->getFill()->setFillType('solid')->getStartColor()->setRGB('D3D3D3');
$sheet->getStyle("A6:{$lastColLetter}{$filaTotal}")->applyFromArray([
    'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => '000000']]]
]);

// Ocultar columnas sin datos
if (!$incentivoTieneDatos) $sheet->getColumnDimension('E')->setVisible(false);
if (!$horasExtraTieneDatos) $sheet->getColumnDimension('F')->setVisible(false);
if (!$bonoAntiguedadTieneDatos) $sheet->getColumnDimension('G')->setVisible(false);
if (!$puestoTieneDatos) $sheet->getColumnDimension('H')->setVisible(false);
if (!$actividadesEspecialesTieneDatos) $sheet->getColumnDimension('I')->setVisible(false);
if (!$ajustesAlSubTieneDatos) $sheet->getColumnDimension($colAJUSTESLetter)->setVisible(false);
if (!$ausentismoTieneDatos) $sheet->getColumnDimension($colAUSENTISMOLetter)->setVisible(false);
if (!$permisoTieneDatos) $sheet->getColumnDimension($colPERMISOSLetter)->setVisible(false);
if (!$uniformeTieneDatos) $sheet->getColumnDimension($colUNIFORMESLetter)->setVisible(false);
if (!$checadorTieneDatos) $sheet->getColumnDimension($colBIOMETRICOLetter)->setVisible(false);

// Alturas y fuentes de filas de datos
$sheet->getRowDimension(1)->setRowHeight(38);
$sheet->getRowDimension(2)->setRowHeight(32);
$sheet->getRowDimension(3)->setRowHeight(32);
$sheet->getRowDimension(4)->setRowHeight(32);
$sheet->getRowDimension(5)->setRowHeight(35);
$sheet->getRowDimension(6)->setRowHeight(45);

for ($fila = 7; $fila < $numeroFila; $fila++) {
    $sheet->getRowDimension($fila)->setRowHeight(48);
    for ($idxC = 1; $idxC <= $totalCols; $idxC++) {
        $cL = Coordinate::stringFromColumnIndex($idxC);
        $s = 15;
        if ($cL === 'A' || $cL === 'B') $s = 14;
        elseif ($cL === 'C') $s = 16;
        $sheet->getStyle($cL . $fila)->getFont()->setSize($s);
    }
}

// Configuración de página
$sheet->getPageSetup()->setPaperSize(PageSetup::PAPERSIZE_LETTER);
$sheet->getPageSetup()->setOrientation(PageSetup::ORIENTATION_LANDSCAPE);
$sheet->getPageMargins()->setLeft(0.5)->setRight(0.5)->setTop(0.5)->setBottom(0.5);
$sheet->getPageSetup()->setFitToPage(true)->setFitToHeight(1)->setFitToWidth(1);

$ultimaFila = $filaTotal;
$sheet->getPageSetup()->setPrintArea("A1:{$lastColLetter}{$ultimaFila}");

// Descargar archivo
$writer = new Xlsx($spreadsheet);
$filename = 'Nomina_Coordinador_Rancho_Pilar_' . date('Y-m-d_H-i-s') . '.xlsx';

header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
header('Content-Disposition: attachment; filename="' . $filename . '"');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

$writer->save('php://output');
exit;