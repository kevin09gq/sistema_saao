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
    if (strlen($hexColor) != 6) return '000000';

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

$idDeptoTarget = $_POST['deptoId'] ?? null;
$nombreDeptoTarget = $_POST['deptoNombre'] ?? 'DEPARTAMENTO';
$idEmpresaSeleccionada = $_POST['id_empresa'] ?? null;

// Obtener el color del departamento desde el JSON
$colorExcel = 'FF0000'; // Color por defecto para Pilar
if ($jsonNomina && isset($jsonNomina['departamentos'])) {
    foreach ($jsonNomina['departamentos'] as $depto) {
        if ($depto['id_departamento'] == $idDeptoTarget) {
            $colorEncontrado = null;

            if (!empty($depto['color_reporte'])) {
                if (is_string($depto['color_reporte'])) {
                    $colorEncontrado = $depto['color_reporte'];
                } elseif (is_array($depto['color_reporte'])) {
                    // Si tenemos una empresa seleccionada, buscamos su color específico
                    if ($idEmpresaSeleccionada) {
                        foreach ($depto['color_reporte'] as $configColor) {
                            if (is_array($configColor) && isset($configColor['id_empresa']) && $configColor['id_empresa'] == $idEmpresaSeleccionada) {
                                $colorEncontrado = $configColor['color'] ?? null;
                                break;
                            }
                        }
                    }
                    
                    // Si no se encontró o no hay empresa, tomar el primero disponible
                    if (!$colorEncontrado) {
                        $primerItem = $depto['color_reporte'][0] ?? null;
                        if (is_string($primerItem)) {
                            $colorEncontrado = $primerItem;
                        } elseif (is_array($primerItem)) {
                            $colorEncontrado = $primerItem['color'] ?? null;
                        }
                    }
                }
            }

            if (!$colorEncontrado && !empty($depto['color'])) {
                $colorEncontrado = $depto['color'];
            }
            if (!$colorEncontrado && !empty($depto['color_depto_nomina'])) {
                $colorEncontrado = $depto['color_depto_nomina'];
            }

            if ($colorEncontrado) {
                $colorExcel = $colorEncontrado;
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


// Establecer el nombre de la pestaña (máximo 31 caracteres)
$sheet->setTitle(substr(strtoupper($nombreDeptoTarget), 0, 31));

//=====================
//  OBTENER EMPLEADOS DEL DEPARTAMENTO
//=====================

$empleadosJornaleros = [];

if ($jsonNomina && isset($jsonNomina['departamentos'])) {
    foreach ($jsonNomina['departamentos'] as $departamento) {
        // Filtrar por el ID del departamento recibido
        if ($departamento['id_departamento'] == $idDeptoTarget) {
            if (isset($departamento['empleados'])) {
                foreach ($departamento['empleados'] as $empleado) {
                    $mostrar = $empleado['mostrar'] ?? false;
                    if ($mostrar) {
                        $empleadosJornaleros[] = $empleado;
                    }
                }
            }
            break; // Ya encontramos el departamento, podemos salir del bucle
        }
    }
}

// Ordenar empleados por nombre (orden ascendente A-Z)
usort($empleadosJornaleros, function ($a, $b) {
    return strcmp($a['nombre'] ?? '', $b['nombre'] ?? '');
});

//=====================
//  BUSCAR COLUMNAS DINÁMICAS
//=====================

// Buscar percepciones_extra únicas
$extrasDinamicas = [];
foreach ($empleadosJornaleros as $emp) {
    if (!empty($emp['percepciones_extra']) && is_array($emp['percepciones_extra'])) {
        foreach ($emp['percepciones_extra'] as $extra) {
            $nombre = trim($extra['nombre'] ?? '');
            $cant = (float) ($extra['cantidad'] ?? 0);
            if ($nombre !== '' && $cant != 0) {
                $nombreSanitizado = preg_replace('/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/', '', $nombre);
                $nombreSanitizado = mb_substr($nombreSanitizado, 0, 30, 'UTF-8');
                $key = mb_strtolower($nombreSanitizado, 'UTF-8');
                if (!isset($extrasDinamicas[$key]) && !empty($nombreSanitizado)) {
                    $extrasDinamicas[$key] = mb_strtoupper($nombreSanitizado, 'UTF-8');
                }
            }
        }
    }
}

// Buscar deducciones_extra únicas
$deduccionesDinamicas = [];
foreach ($empleadosJornaleros as $emp) {
    if (!empty($emp['deducciones_extra']) && is_array($emp['deducciones_extra'])) {
        foreach ($emp['deducciones_extra'] as $dextra) {
            $nombre = trim($dextra['nombre'] ?? '');
            $cant = (float) ($dextra['cantidad'] ?? 0);
            if ($nombre !== '' && $cant != 0) {
                $nombreSanitizado = preg_replace('/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/', '', $nombre);
                $nombreSanitizado = mb_substr($nombreSanitizado, 0, 30, 'UTF-8');
                $key = mb_strtolower($nombreSanitizado, 'UTF-8');
                if (!isset($deduccionesDinamicas[$key]) && !empty($nombreSanitizado)) {
                    $deduccionesDinamicas[$key] = mb_strtoupper($nombreSanitizado, 'UTF-8');
                }
            }
        }
    }
}

// Construir lista dinámica de encabezados
$columnasDinamicas = [
    'N°',                  // 1 (A)
    'CD',                  // 2 (B)
    'NOMBRE',              // 3 (C)
    'DIAS TRAB.',          // 4 (D)
    'SUELDO SEMANAL',      // 5 (E)
    'PASAJE',              // 6 (F)
    'COMIDA',              // 7 (G)
];

$mapExtrasCols = [];
$colIndex = 8;
foreach ($extrasDinamicas as $key => $dispName) {
    $columnasDinamicas[] = $dispName;
    $mapExtrasCols[$key] = $colIndex;
    $colIndex++;
}

$colTotalPercepciones = $colIndex;
$columnasDinamicas[] = 'TOTAL PERCEPCIONES';
$colIndex++;

$colISR = $colIndex; $columnasDinamicas[] = 'ISR'; $colIndex++;
$colIMSS = $colIndex; $columnasDinamicas[] = 'IMSS'; $colIndex++;
$colINFONAVIT = $colIndex; $columnasDinamicas[] = 'INFONAVIT'; $colIndex++;
$colAJUSTES = $colIndex; $columnasDinamicas[] = 'AJUSTES AL SUB'; $colIndex++;
$colAUSENTISMO = $colIndex; $columnasDinamicas[] = 'AUSENTISMO'; $colIndex++;
$colUNIFORMES = $colIndex; $columnasDinamicas[] = 'UNIFORMES'; $colIndex++;
$colPERMISOS = $colIndex; $columnasDinamicas[] = 'PERMISOS'; $colIndex++;
$colRETARDOS = $colIndex; $columnasDinamicas[] = 'RETARDOS'; $colIndex++;
$colBIOMETRICO = $colIndex; $columnasDinamicas[] = 'BIOMETRICO'; $colIndex++;
$colFAGAFETCOFIA = $colIndex; $columnasDinamicas[] = 'F.A/GAFET/COFIA'; $colIndex++;

$mapDeduccionesExtrasCols = [];
foreach ($deduccionesDinamicas as $key => $dispName) {
    $columnasDinamicas[] = $dispName;
    $mapDeduccionesExtrasCols[$key] = $colIndex;
    $colIndex++;
}

$colTotalDeducciones = $colIndex; $columnasDinamicas[] = 'TOTAL DE DEDUCCIONES'; $colIndex++;
$colNetoRecibir = $colIndex; $columnasDinamicas[] = 'NETO A RECIBIR'; $colIndex++;
$colTarjeta = $colIndex; $columnasDinamicas[] = 'DISPERSION DE TARJETA'; $colIndex++;
$colEfectivo = $colIndex; $columnasDinamicas[] = 'IMPORTE EN EFECTIVO'; $colIndex++;
$colPrestamo = $colIndex; $columnasDinamicas[] = 'PRÉSTAMO'; $colIndex++;
$colTotalRecibir = $colIndex; $columnasDinamicas[] = 'TOTAL A RECIBIR'; $colIndex++;
$colRedondeado = $colIndex; $columnasDinamicas[] = 'REDONDEADO'; $colIndex++;
$colTotalRedondeado = $colIndex; $columnasDinamicas[] = 'TOTAL EFECTIVO REDONDEADO'; $colIndex++;
$colFirma = $colIndex; $columnasDinamicas[] = 'FIRMA RECIBIDO';

$totalCols = count($columnasDinamicas);
$lastColLetter = Coordinate::stringFromColumnIndex($totalCols);

// Letras para fórmulas dinámicas
$lastPercepcionLetter = Coordinate::stringFromColumnIndex($colTotalPercepciones - 1);
$colTotalPercepcionesLetter = Coordinate::stringFromColumnIndex($colTotalPercepciones);
$colISRLetter = Coordinate::stringFromColumnIndex($colISR);
$colIMSSLetter = Coordinate::stringFromColumnIndex($colIMSS);
$colINFONAVITLetter = Coordinate::stringFromColumnIndex($colINFONAVIT);
$colAJUSTESLetter = Coordinate::stringFromColumnIndex($colAJUSTES);
$colAUSENTISMOLetter = Coordinate::stringFromColumnIndex($colAUSENTISMO);
$colUNIFORMESLetter = Coordinate::stringFromColumnIndex($colUNIFORMES);
$colPERMISOSLetter = Coordinate::stringFromColumnIndex($colPERMISOS);
$colRETARDOSLetter = Coordinate::stringFromColumnIndex($colRETARDOS);
$colBIOMETRICOLetter = Coordinate::stringFromColumnIndex($colBIOMETRICO);
$colFAGAFETCOFIALetter = Coordinate::stringFromColumnIndex($colFAGAFETCOFIA);
$lastDeduccionLetter = Coordinate::stringFromColumnIndex($colTotalDeducciones - 1);
$colTotalDeduccionesLetter = Coordinate::stringFromColumnIndex($colTotalDeducciones);
$colNetoRecibirLetter = Coordinate::stringFromColumnIndex($colNetoRecibir);
$colTarjetaLetter = Coordinate::stringFromColumnIndex($colTarjeta);
$colEfectivoLetter = Coordinate::stringFromColumnIndex($colEfectivo);
$colPrestamoLetter = Coordinate::stringFromColumnIndex($colPrestamo);
$colTotalRecibirLetter = Coordinate::stringFromColumnIndex($colTotalRecibir);
$colRedondeadoLetter = Coordinate::stringFromColumnIndex($colRedondeado);
$colTotalRedondeadoLetter = Coordinate::stringFromColumnIndex($colTotalRedondeado);

//=====================
//  TÍTULOS
//=====================

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

$titulo1 = 'RANCHO PALMILLA';
$titulo2 = strtoupper($nombreDeptoTarget);
$titulo3 = 'NOMINA DEL ' . strtoupper($fecha_inicio) . ' AL ' . strtoupper($fecha_cierre);
$titulo4 = 'SEMANA ' . (isset($jsonNomina['numero_semana']) ? str_pad($jsonNomina['numero_semana'], 2, '0', STR_PAD_LEFT) : '00') . '-' . $ano;

// Agregar los títulos en las primeras filas
$sheet->setCellValue('A1', $titulo1);
$sheet->setCellValue('A2', $titulo2);
$sheet->setCellValue('A3', $titulo3);
$sheet->setCellValue('A4', $titulo4);

// Mergear las celdas para que los títulos ocupen toda la tabla
$sheet->mergeCells("A1:{$lastColLetter}1");
$sheet->mergeCells("A2:{$lastColLetter}2");
$sheet->mergeCells("A3:{$lastColLetter}3");
$sheet->mergeCells("A4:{$lastColLetter}4");

// Formatear título 1 - RANCHO PALMILLA (Rojo, Negrita, Tamaño 24)
$sheet->getStyle('A1')->getFont()->setBold(true);
$sheet->getStyle('A1')->getFont()->setSize(24);
$sheet->getStyle('A1')->getFont()->setColor(new Color($colorExcel));

// Formatear título 2 - PERSONAL DE BASE (Negrita, Tamaño 11)
$sheet->getStyle('A2')->getFont()->setBold(true);
$sheet->getStyle('A2')->getFont()->setSize(20);
$sheet->getStyle('A2')->getFont()->setColor(new Color($colorExcel));

// Formatear título 3 - NOMINA (Negrita, Tamaño 10)
$sheet->getStyle('A3')->getFont()->setBold(true);
$sheet->getStyle('A3')->getFont()->setSize(14);

// Formatear título 4 - SEMANA (Negrita, Tamaño 10)
$sheet->getStyle('A4')->getFont()->setBold(true);
$sheet->getStyle('A4')->getFont()->setSize(14);

// Centrar todos los títulos
$sheet->getStyle('A1:A4')->getAlignment()->setHorizontal('center');

// Insertar logo a la derecha de los títulos
$logoPath = '../../../../public/img/logo.jpg';
if (file_exists($logoPath)) {
    $logo = new Drawing();
    $logo->setName('Logo');
    $logo->setDescription('Logo de Rancho Palmilla');
    $logo->setPath($logoPath);
    $logo->setHeight(190); // Altura en píxeles
    $logo->setCoordinates('B1'); // Colocar en columna Z, fila 1
    $logo->setOffsetX(10);
    $logo->setWorksheet($sheet);
}

//=====================
//  ENCABEZADOS DE LA TABLA
//=====================

// Agregar los encabezados en la fila 6
foreach ($columnasDinamicas as $idxCol => $encabezado) {
    $colL = Coordinate::stringFromColumnIndex($idxCol + 1);
    $sheet->setCellValue($colL . '6', $encabezado);

    $w = 20;
    if ($colL === 'A') $w = 12;
    elseif ($colL === 'B') $w = 14;
    elseif ($colL === 'C') $w = 65;
    elseif (in_array($encabezado, ['SUELDO SEMANAL', 'TOTAL PERCEPCIONES', 'AJUSTES AL SUB', 'TOTAL DE DEDUCCIONES', 'NETO A RECIBIR', 'DISPERSION DE TARJETA', 'IMPORTE EN EFECTIVO', 'PRÉSTAMO', 'TOTAL A RECIBIR'])) $w = 22;
    elseif ($encabezado === 'TOTAL EFECTIVO REDONDEADO') $w = 23;
    elseif ($encabezado === 'FIRMA RECIBIDO') $w = 25;
    $sheet->getColumnDimension($colL)->setWidth($w);

    $s = 14;
    if (in_array($encabezado, ['TOTAL PERCEPCIONES', 'TOTAL DE DEDUCCIONES', 'NETO A RECIBIR', 'DISPERSION DE TARJETA', 'IMPORTE EN EFECTIVO', 'TOTAL A RECIBIR', 'TOTAL EFECTIVO REDONDEADO'])) $s = 13;
    $sheet->getStyle($colL . '6')->getFont()->setSize($s);
}

// Formatear los encabezados (Negrita, Centrados, Tamaño 10, Fondo Dinámico, Letra de Contraste)
$sheet->getStyle("A6:{$lastColLetter}6")->getFont()->setBold(true);
$sheet->getStyle("A6:{$lastColLetter}6")->getFont()->setSize(10);
$sheet->getStyle("A6:{$lastColLetter}6")->getFont()->setColor(new Color($textColor));
$sheet->getStyle("A6:{$lastColLetter}6")->getAlignment()->setHorizontal('center');
$sheet->getStyle("A6:{$lastColLetter}6")->getAlignment()->setVertical('center');
$sheet->getStyle("A6:{$lastColLetter}6")->getAlignment()->setWrapText(true);

// Agregar color de fondo dinámico a los encabezados
$sheet->getStyle("A6:{$lastColLetter}6")->getFill()->setFillType('solid');
$sheet->getStyle("A6:{$lastColLetter}6")->getFill()->getStartColor()->setRGB($colorExcel);

//=====================
//  VERIFICAR COLUMNAS CON DATOS (CONFIGURACIÓN AUTO)
//=====================

// Determinar si la columna COMIDA tiene datos
$comidaTieneDatos = false;

// Determinar si la columna PASAJE tiene datos
$pasajeTieneDatos = false;

// Determinar si las columnas de deducciones de conceptos tienen datos
$isrTieneDatos = false;
$imssTieneDatos = false;
$infonavitTieneDatos = false;

// Determinar si la columna AJUSTES AL SUB (código 107) tiene datos
$ajustesAlSubTieneDatos = false;

// Determinar si las columnas de descuentos adicionales tienen datos
$ausentismoTieneDatos = false;
$permisoTieneDatos = false;
$retardosTieneDatos = false;
$uniformesTieneDatos = false;

// Determinar si las columnas CHECADOR y F.A/GAFET/COFIA tienen datos
$checadorTieneDatos = false;
$faxGafetCofiaTieneDatos = false;
$diasTrabajadosTieneDatos = false;

foreach ($empleadosJornaleros as $empleado) {
    if (($empleado['comida'] ?? 0) != 0) {
        $comidaTieneDatos = true;
    }
    
    if (($empleado['pasaje'] ?? 0) != 0) {
        $pasajeTieneDatos = true;
    }
    
    if (($empleado['inasistencia'] ?? 0) != 0) {
        $ausentismoTieneDatos = true;
    }
    
    if (($empleado['permiso'] ?? 0) != 0) {
        $permisoTieneDatos = true;
    }
    
    if (($empleado['retardos'] ?? 0) != 0) {
        $retardosTieneDatos = true;
    }
    
    if (($empleado['uniformes'] ?? 0) != 0) {
        $uniformesTieneDatos = true;
    }
    
    if (($empleado['checador'] ?? 0) != 0) {
        $checadorTieneDatos = true;
    }
    
    if (($empleado['fa_gafet_cofia'] ?? 0) != 0) {
        $faxGafetCofiaTieneDatos = true;
    }

    if (($empleado['tipo_horario'] ?? 0) == 2) {
        $diasTrabajadosTieneDatos = true;
    }

    // Verificar códigos de conceptos
    if (!empty($empleado['conceptos']) && is_array($empleado['conceptos'])) {
        foreach ($empleado['conceptos'] as $concepto) {
            $codigo = $concepto['codigo'] ?? null;
            $resultado = $concepto['resultado'] ?? 0;
            
            if ($codigo === '45' && $resultado != 0) {
                $isrTieneDatos = true;
            }
            if ($codigo === '52' && $resultado != 0) {
                $imssTieneDatos = true;
            }
            if ($codigo === '16' && $resultado != 0) {
                $infonavitTieneDatos = true;
            }
            if ($codigo === '107' && $resultado != 0) {
                $ajustesAlSubTieneDatos = true;
            }
        }
    }
}

// Agregar empleados ordenados a la hoja
$numeroFila = 7;
$numeroEmpleado = 1;

foreach ($empleadosJornaleros as $empleado) {

    //====================================
    //  AGREGAR INFORMACION DEL EMPLEADO
    //====================================

    // Agregar número y clave
    $sheet->setCellValue('A' . $numeroFila, $numeroEmpleado);
    $sheet->setCellValue('B' . $numeroFila, $empleado['clave'] ?? '');

    // Agregar nombre en la columna NOMBRE
    $sheet->setCellValue('C' . $numeroFila, $empleado['nombre'] ?? '');

    // Agregar días trabajados (solo si es tipo_horario 2)
    $tipoHorario = $empleado['tipo_horario'] ?? '';
    if ($tipoHorario == 2) {
        $sheet->setCellValue('D' . $numeroFila, $empleado['dias_trabajados'] ?? 0);
    } else {
        $sheet->setCellValue('D' . $numeroFila, '');
    }

    //=============================
    //  AGREGAR PERCEPCIONES 
    //=============================

    // Agregar salario semanal 
    $salarioSemanal = $empleado['salario_semanal'] ?? 0;
    if (!empty($salarioSemanal) && $salarioSemanal != 0) {
        $sheet->setCellValue('E' . $numeroFila, $salarioSemanal);
        $sheet->getStyle('E' . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00');
    }

    // Agregar pasaje 
    $pasaje = $empleado['pasaje'] ?? 0;
    if (!empty($pasaje) && $pasaje != 0) {
        $sheet->setCellValue('F' . $numeroFila, $pasaje);
        $sheet->getStyle('F' . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00');
    }

    // Agregar comida
    if ($comidaTieneDatos) {
        $comida = $empleado['comida'] ?? 0;
        if (!empty($comida) && $comida != 0) {
            $sheet->setCellValue('G' . $numeroFila, $comida);
            $sheet->getStyle('G' . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00');
        }
    }

    // Percepciones extras dinámicas
    if (!empty($empleado['percepciones_extra']) && is_array($empleado['percepciones_extra'])) {
        foreach ($empleado['percepciones_extra'] as $extra) {
            $nombre = trim($extra['nombre'] ?? '');
            $cant = (float) ($extra['cantidad'] ?? 0);
            if ($nombre !== '' && $cant != 0) {
                $nombreSanitizado = preg_replace('/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/', '', $nombre);
                $nombreSanitizado = mb_substr($nombreSanitizado, 0, 30, 'UTF-8');
                $key = mb_strtolower($nombreSanitizado, 'UTF-8');
                if (isset($mapExtrasCols[$key])) {
                    $colL = Coordinate::stringFromColumnIndex($mapExtrasCols[$key]);
                    $sheet->setCellValue($colL . $numeroFila, $cant);
                }
            }
        }
    }

    // TOTAL PERCEPCIONES
    $sheet->setCellValue($colTotalPercepcionesLetter . $numeroFila, '=SUM(E' . $numeroFila . ':' . $lastPercepcionLetter . $numeroFila . ')');
    $sheet->getStyle($colTotalPercepcionesLetter . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00');

    //=============================
    //  AGREGAR DEDUCCIONES
    //=============================

    // Mapeo de códigos de conceptos a columnas dinámicas
    $mapeoConceptos = [
        '45'  => $colISRLetter,   // ISR
        '52'  => $colIMSSLetter,   // IMSS
        '16'  => $colINFONAVITLetter,   // INFONAVIT
        '107' => $colAJUSTESLetter,   // AJUSTES AL SUB
    ];

    // Recorrer conceptos si existen
    if (!empty($empleado['conceptos']) && is_array($empleado['conceptos'])) {
        foreach ($empleado['conceptos'] as $concepto) {
            $codigo = $concepto['codigo'] ?? null;
            $resultado = $concepto['resultado'] ?? 0;

            if ($codigo === '107' && !$ajustesAlSubTieneDatos) {
                continue;
            }

            if (isset($mapeoConceptos[$codigo]) && !empty($resultado) && $resultado != 0) {
                $columna = $mapeoConceptos[$codigo];
                $sheet->setCellValue($columna . $numeroFila, $resultado);
                $sheet->getStyle($columna . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
                $sheet->getStyle($columna . $numeroFila)->getFont()->setColor(new Color('FF0000'));
            }
        }
    }

    // AUSENTISMO
    $inasistencia = $empleado['inasistencia'] ?? 0;
    if (!empty($inasistencia) && $inasistencia != 0) {
        $sheet->setCellValue($colAUSENTISMOLetter . $numeroFila, $inasistencia);
        $sheet->getStyle($colAUSENTISMOLetter . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
        $sheet->getStyle($colAUSENTISMOLetter . $numeroFila)->getFont()->setColor(new Color('FF0000'));
    }

    // UNIFORMES
    $uniformes = $empleado['uniformes'] ?? 0;
    if (!empty($uniformes) && $uniformes != 0) {
        $sheet->setCellValue($colUNIFORMESLetter . $numeroFila, $uniformes);
        $sheet->getStyle($colUNIFORMESLetter . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
        $sheet->getStyle($colUNIFORMESLetter . $numeroFila)->getFont()->setColor(new Color('FF0000'));
    }

    // PERMISOS
    $permiso = $empleado['permiso'] ?? 0;
    if (!empty($permiso) && $permiso != 0) {
        $sheet->setCellValue($colPERMISOSLetter . $numeroFila, $permiso);
        $sheet->getStyle($colPERMISOSLetter . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
        $sheet->getStyle($colPERMISOSLetter . $numeroFila)->getFont()->setColor(new Color('FF0000'));
    }

    // RETARDOS
    $retardos = $empleado['retardos'] ?? 0;
    if (!empty($retardos) && $retardos != 0) {
        $sheet->setCellValue($colRETARDOSLetter . $numeroFila, $retardos);
        $sheet->getStyle($colRETARDOSLetter . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
        $sheet->getStyle($colRETARDOSLetter . $numeroFila)->getFont()->setColor(new Color('FF0000'));
    }

    // CHECADOR
    $checador = $empleado['checador'] ?? 0;
    if (!empty($checador) && $checador != 0) {
        $sheet->setCellValue($colBIOMETRICOLetter . $numeroFila, $checador);
        $sheet->getStyle($colBIOMETRICOLetter . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
        $sheet->getStyle($colBIOMETRICOLetter . $numeroFila)->getFont()->setColor(new Color('FF0000'));
    }

    // F.A/GAFET/COFIA
    $faxGafetCofia = $empleado['fa_gafet_cofia'] ?? 0;
    if (!empty($faxGafetCofia) && $faxGafetCofia != 0) {
        $sheet->setCellValue($colFAGAFETCOFIALetter . $numeroFila, $faxGafetCofia);
        $sheet->getStyle($colFAGAFETCOFIALetter . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
        $sheet->getStyle($colFAGAFETCOFIALetter . $numeroFila)->getFont()->setColor(new Color('FF0000'));
    }

    // Deducciones extras dinámicas
    if (!empty($empleado['deducciones_extra']) && is_array($empleado['deducciones_extra'])) {
        foreach ($empleado['deducciones_extra'] as $dextra) {
            $nombre = trim($dextra['nombre'] ?? '');
            $cant = (float) ($dextra['cantidad'] ?? 0);
            if ($nombre !== '' && $cant != 0) {
                $nombreSanitizado = preg_replace('/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/', '', $nombre);
                $nombreSanitizado = mb_substr($nombreSanitizado, 0, 30, 'UTF-8');
                $key = mb_strtolower($nombreSanitizado, 'UTF-8');
                if (isset($mapDeduccionesExtrasCols[$key])) {
                    $colL = Coordinate::stringFromColumnIndex($mapDeduccionesExtrasCols[$key]);
                    $sheet->setCellValue($colL . $numeroFila, $cant);
                    $sheet->getStyle($colL . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
                    $sheet->getStyle($colL . $numeroFila)->getFont()->setColor(new Color('FF0000'));
                }
            }
        }
    }

    // TOTAL DE DEDUCCIONES
    $sheet->setCellValue($colTotalDeduccionesLetter . $numeroFila, '=SUM(' . $colISRLetter . $numeroFila . ':' . $lastDeduccionLetter . $numeroFila . ')');
    $sheet->getStyle($colTotalDeduccionesLetter . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
    $sheet->getStyle($colTotalDeduccionesLetter . $numeroFila)->getFont()->setColor(new Color('FF0000'));

    // NETO A RECIBIR
    $sheet->setCellValue($colNetoRecibirLetter . $numeroFila, '=' . $colTotalPercepcionesLetter . $numeroFila . '-' . $colTotalDeduccionesLetter . $numeroFila);
    $sheet->getStyle($colNetoRecibirLetter . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00');

    // DISPERSION DE TARJETA 
    $tarjeta = $empleado['tarjeta'] ?? 0;
    if (!empty($tarjeta) && $tarjeta != 0) {
        $sheet->setCellValue($colTarjetaLetter . $numeroFila, $tarjeta);
        $sheet->getStyle($colTarjetaLetter . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
        $sheet->getStyle($colTarjetaLetter . $numeroFila)->getFont()->setColor(new Color('FF0000'));
    }

    // IMPORTE EN EFECTIVO
    $sheet->setCellValue($colEfectivoLetter . $numeroFila, '=' . $colNetoRecibirLetter . $numeroFila . '-' . $colTarjetaLetter . $numeroFila);
    $sheet->getStyle($colEfectivoLetter . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00');

    // PRÉSTAMO 
    $prestamo = $empleado['prestamo'] ?? 0;
    if (!empty($prestamo) && $prestamo != 0) {
        $sheet->setCellValue($colPrestamoLetter . $numeroFila, $prestamo);
        $sheet->getStyle($colPrestamoLetter . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
        $sheet->getStyle($colPrestamoLetter . $numeroFila)->getFont()->setColor(new Color('FF0000'));
    }

    // TOTAL A RECIBIR
    $sheet->setCellValue($colTotalRecibirLetter . $numeroFila, '=' . $colEfectivoLetter . $numeroFila . '-' . $colPrestamoLetter . $numeroFila);
    $sheet->getStyle($colTotalRecibirLetter . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00');

    // REDONDEADO
    $sheet->setCellValue($colRedondeadoLetter . $numeroFila, '=ROUND(' . $colTotalRecibirLetter . $numeroFila . ',0)-' . $colTotalRecibirLetter . $numeroFila);
    $sheet->getStyle($colRedondeadoLetter . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00;[RED]-$#,##0.00');

    // TOTAL EFECTIVO REDONDEADO
    $sheet->setCellValue($colTotalRedondeadoLetter . $numeroFila, '=' . $colTotalRecibirLetter . $numeroFila . '+' . $colRedondeadoLetter . $numeroFila);
    $sheet->getStyle($colTotalRedondeadoLetter . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00');

    // Alineación
    $sheet->getStyle('A' . $numeroFila . ':B' . $numeroFila)->getAlignment()->setHorizontal('center');
    $sheet->getStyle('A' . $numeroFila . ':B' . $numeroFila)->getAlignment()->setVertical('center');
    $sheet->getStyle('C' . $numeroFila)->getAlignment()->setHorizontal('left');
    $sheet->getStyle('C' . $numeroFila)->getAlignment()->setVertical('center');
    $sheet->getStyle('D' . $numeroFila)->getAlignment()->setHorizontal('center');
    $sheet->getStyle('D' . $numeroFila)->getAlignment()->setVertical('center');
    $sheet->getStyle('E' . $numeroFila . ':' . $lastColLetter . $numeroFila)->getAlignment()->setHorizontal('center');
    $sheet->getStyle('E' . $numeroFila . ':' . $lastColLetter . $numeroFila)->getAlignment()->setVertical('center');

    $numeroFila++;
    $numeroEmpleado++;
}

//=====================
//  APLICAR FORMATOS A TODAS LAS CELDAS DE DATOS (INCLUSO VACIAS)
//=====================

// Iterar sobre todas las filas de datos (7 hasta numeroFila-1)
for ($fila = 7; $fila < $numeroFila; $fila++) {
    // Formatear columnas de conceptos (deducciones estándar)
    $sheet->getStyle($colISRLetter . $fila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
    $sheet->getStyle($colISRLetter . $fila)->getFont()->setColor(new Color('FF0000'));
    $sheet->getStyle($colIMSSLetter . $fila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
    $sheet->getStyle($colIMSSLetter . $fila)->getFont()->setColor(new Color('FF0000'));
    $sheet->getStyle($colINFONAVITLetter . $fila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
    $sheet->getStyle($colINFONAVITLetter . $fila)->getFont()->setColor(new Color('FF0000'));
    $sheet->getStyle($colAJUSTESLetter . $fila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
    $sheet->getStyle($colAJUSTESLetter . $fila)->getFont()->setColor(new Color('FF0000'));

    // Formatear deducciones adicionales
    $sheet->getStyle($colAUSENTISMOLetter . $fila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
    $sheet->getStyle($colAUSENTISMOLetter . $fila)->getFont()->setColor(new Color('FF0000'));
    $sheet->getStyle($colUNIFORMESLetter . $fila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
    $sheet->getStyle($colUNIFORMESLetter . $fila)->getFont()->setColor(new Color('FF0000'));
    $sheet->getStyle($colPERMISOSLetter . $fila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
    $sheet->getStyle($colPERMISOSLetter . $fila)->getFont()->setColor(new Color('FF0000'));
    $sheet->getStyle($colRETARDOSLetter . $fila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
    $sheet->getStyle($colRETARDOSLetter . $fila)->getFont()->setColor(new Color('FF0000'));
    $sheet->getStyle($colBIOMETRICOLetter . $fila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
    $sheet->getStyle($colBIOMETRICOLetter . $fila)->getFont()->setColor(new Color('FF0000'));
    $sheet->getStyle($colFAGAFETCOFIALetter . $fila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
    $sheet->getStyle($colFAGAFETCOFIALetter . $fila)->getFont()->setColor(new Color('FF0000'));

    // Formatear deducciones extras dinámicas
    foreach ($mapDeduccionesExtrasCols as $key => $colIndex) {
        $colL = Coordinate::stringFromColumnIndex($colIndex);
        $sheet->getStyle($colL . $fila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
        $sheet->getStyle($colL . $fila)->getFont()->setColor(new Color('FF0000'));
    }

    // Formatear totales y cálculos
    $sheet->getStyle($colTotalDeduccionesLetter . $fila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
    $sheet->getStyle($colTotalDeduccionesLetter . $fila)->getFont()->setColor(new Color('FF0000'));
    $sheet->getStyle($colTarjetaLetter . $fila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
    $sheet->getStyle($colTarjetaLetter . $fila)->getFont()->setColor(new Color('FF0000'));
    $sheet->getStyle($colPrestamoLetter . $fila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
    $sheet->getStyle($colPrestamoLetter . $fila)->getFont()->setColor(new Color('FF0000'));
    $sheet->getStyle($colRedondeadoLetter . $fila)->getNumberFormat()->setFormatCode('$#,##0.00;[RED]-$#,##0.00');

    // Formatear percepciones y resultados positivos
    $sheet->getStyle('E' . $fila)->getNumberFormat()->setFormatCode('$#,##0.00');
    $sheet->getStyle('F' . $fila)->getNumberFormat()->setFormatCode('$#,##0.00');
    $sheet->getStyle('G' . $fila)->getNumberFormat()->setFormatCode('$#,##0.00');
    $sheet->getStyle($colTotalPercepcionesLetter . $fila)->getNumberFormat()->setFormatCode('$#,##0.00');
    $sheet->getStyle($colNetoRecibirLetter . $fila)->getNumberFormat()->setFormatCode('$#,##0.00');
    $sheet->getStyle($colEfectivoLetter . $fila)->getNumberFormat()->setFormatCode('$#,##0.00');
    $sheet->getStyle($colTotalRecibirLetter . $fila)->getNumberFormat()->setFormatCode('$#,##0.00');
    $sheet->getStyle($colTotalRedondeadoLetter . $fila)->getNumberFormat()->setFormatCode('$#,##0.00');

    // Formatear percepciones extras dinámicas
    foreach ($mapExtrasCols as $key => $colIndex) {
        $colL = Coordinate::stringFromColumnIndex($colIndex);
        $sheet->getStyle($colL . $fila)->getNumberFormat()->setFormatCode('$#,##0.00');
    }
}

//=====================
//  AGREGAR FILA DE TOTALES
//=====================

$filaTotal = $numeroFila;

// Agregar etiqueta "TOTALES" en columna A
$sheet->setCellValue('A' . $filaTotal, 'TOTALES');
$sheet->getStyle('A' . $filaTotal)->getFont()->setBold(true);
$sheet->getStyle('A' . $filaTotal)->getAlignment()->setHorizontal('center');
$sheet->getStyle('A' . $filaTotal)->getAlignment()->setVertical('center');

// Columnas de datos para totales (usando las letras dinámicas)
$columnasData = [
    'D' => 'dias_trabajados',
    'E' => 'sueldo_semanal',
    'F' => 'pasaje',
    'G' => 'comida',
];

// Agregar columnas de percepciones extras dinámicas
foreach ($mapExtrasCols as $key => $colIndex) {
    $colL = Coordinate::stringFromColumnIndex($colIndex);
    $columnasData[$colL] = 'percepcion_extra_' . $key;
}

// Agregar columnas fijas restantes
$columnasData[$colTotalPercepcionesLetter] = 'total_percepciones';
$columnasData[$colISRLetter] = 'isr';
$columnasData[$colIMSSLetter] = 'imss';
$columnasData[$colINFONAVITLetter] = 'infonavit';
$columnasData[$colAJUSTESLetter] = 'ajustes_al_sub';
$columnasData[$colAUSENTISMOLetter] = 'ausentismo';
$columnasData[$colUNIFORMESLetter] = 'uniformes';
$columnasData[$colPERMISOSLetter] = 'permisos';
$columnasData[$colRETARDOSLetter] = 'retardos';
$columnasData[$colBIOMETRICOLetter] = 'biometrico';
$columnasData[$colFAGAFETCOFIALetter] = 'fa_gafet_cofia';

// Agregar columnas de deducciones extras dinámicas
foreach ($mapDeduccionesExtrasCols as $key => $colIndex) {
    $colL = Coordinate::stringFromColumnIndex($colIndex);
    $columnasData[$colL] = 'deduccion_extra_' . $key;
}

// Agregar columnas de totales y cálculos
$columnasData[$colTotalDeduccionesLetter] = 'total_deducciones';
$columnasData[$colNetoRecibirLetter] = 'neto_recibir';
$columnasData[$colTarjetaLetter] = 'tarjeta';
$columnasData[$colEfectivoLetter] = 'efectivo';
$columnasData[$colPrestamoLetter] = 'prestamo';
$columnasData[$colTotalRecibirLetter] = 'total_recibir';
$columnasData[$colRedondeadoLetter] = 'redondeado';
$columnasData[$colTotalRedondeadoLetter] = 'total_redondeado';

foreach ($columnasData as $columna => $tipo) {
    $rangoSuma = $columna . '7:' . $columna . ($filaTotal - 1);
    $sheet->setCellValue($columna . $filaTotal, '=IF(SUM(' . $rangoSuma . ')=0,"",SUM(' . $rangoSuma . '))');
    $sheet->getStyle($columna . $filaTotal)->getFont()->setBold(true);
    $sheet->getStyle($columna . $filaTotal)->getFont()->setSize(14);

    // Aplicar formato de moneda según la columna
    if ($columna === 'D') {
        // Formato entero para DIAS TRAB.
        $sheet->getStyle($columna . $filaTotal)->getNumberFormat()->setFormatCode('0');
    } elseif (in_array($tipo, ['isr', 'imss', 'infonavit', 'ajustes_al_sub', 'ausentismo', 'uniformes', 'permisos', 'retardos', 'biometrico', 'fa_gafet_cofia', 'total_deducciones', 'tarjeta', 'prestamo']) || strpos($tipo, 'deduccion_extra_') === 0) {
        // Formato rojo con signo negativo
        $sheet->getStyle($columna . $filaTotal)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
        $sheet->getStyle($columna . $filaTotal)->getFont()->setColor(new Color('FF0000'));
    } elseif ($columna === $colRedondeadoLetter) {
        // Formato condicional para REDONDEADO
        $sheet->getStyle($columna . $filaTotal)->getNumberFormat()->setFormatCode('$#,##0.00;[RED]-$#,##0.00');
    } else {
        // Formato moneda normal
        $sheet->getStyle($columna . $filaTotal)->getNumberFormat()->setFormatCode('$#,##0.00');
    }

    // Centrar alineación
    $sheet->getStyle($columna . $filaTotal)->getAlignment()->setHorizontal('center');
    $sheet->getStyle($columna . $filaTotal)->getAlignment()->setVertical('center');
}

// Aplicar altura y color de fondo a la fila de totales
$sheet->getRowDimension($filaTotal)->setRowHeight(25);
$sheet->getStyle('A' . $filaTotal . ':' . $lastColLetter . $filaTotal)->getFill()->setFillType('solid');
$sheet->getStyle('A' . $filaTotal . ':' . $lastColLetter . $filaTotal)->getFill()->getStartColor()->setRGB('D3D3D3'); // Gris claro

//=====================
//  AGREGAR BORDES NEGROS A LA TABLA
//=====================

$estiloBordesTabla = [
    'borders' => [
        'allBorders' => [
            'borderStyle' => Border::BORDER_THIN,
            'color' => ['rgb' => '000000'],
        ],
    ],
];

$sheet->getStyle('A6:' . $lastColLetter . $filaTotal)->applyFromArray($estiloBordesTabla);

//=====================
//  OCULTAR COLUMNAS SIN DATOS
//=====================

// Ocultar columna DIAS TRAB si no tiene datos
if (!$diasTrabajadosTieneDatos) {
    $sheet->getColumnDimension('D')->setVisible(false);
}

// Ocultar columna PASAJE si no tiene datos
if (!$pasajeTieneDatos) {
    $sheet->getColumnDimension('F')->setVisible(false);
}

// Ocultar columna COMIDA si no tiene datos
if (!$comidaTieneDatos) {
    $sheet->getColumnDimension('G')->setVisible(false);
}

// Ocultar columna ISR si no tiene datos
if (!$isrTieneDatos) {
    $sheet->getColumnDimension($colISRLetter)->setVisible(false);
}

// Ocultar columna IMSS si no tiene datos
if (!$imssTieneDatos) {
    $sheet->getColumnDimension($colIMSSLetter)->setVisible(false);
}

// Ocultar columna INFONAVIT si no tiene datos
if (!$infonavitTieneDatos) {
    $sheet->getColumnDimension($colINFONAVITLetter)->setVisible(false);
}

// Ocultar columna AJUSTES AL SUB si no tiene datos
if (!$ajustesAlSubTieneDatos) {
    $sheet->getColumnDimension($colAJUSTESLetter)->setVisible(false);
}

// Ocultar columna AUSENTISMO si no tiene datos
if (!$ausentismoTieneDatos) {
    $sheet->getColumnDimension($colAUSENTISMOLetter)->setVisible(false);
}

// Ocultar columna UNIFORMES si no tiene datos
if (!$uniformesTieneDatos) {
    $sheet->getColumnDimension($colUNIFORMESLetter)->setVisible(false);
}

// Ocultar columna PERMISOS si no tiene datos
if (!$permisoTieneDatos) {
    $sheet->getColumnDimension($colPERMISOSLetter)->setVisible(false);
}

// Ocultar columna RETARDOS si no tiene datos
if (!$retardosTieneDatos) {
    $sheet->getColumnDimension($colRETARDOSLetter)->setVisible(false);
}

// Ocultar columna CHECADOR si no tiene datos
if (!$checadorTieneDatos) {
    $sheet->getColumnDimension($colBIOMETRICOLetter)->setVisible(false);
}

// Ocultar columna F.A/GAFET/COFIA si no tiene datos
if (!$faxGafetCofiaTieneDatos) {
    $sheet->getColumnDimension($colFAGAFETCOFIALetter)->setVisible(false);
}



//=====================
//  CONFIGURAR ALTURA DE FILAS Y TAMAÑO DE LETRA
//=====================

// Configurar tamaño de letra para cada columna (configurable)
$tamanioLetraFilas = [
    'A' => 14,  // N°
    'B' => 14,  // CD
    'C' => 16,  // NOMBRE
    'D' => 15,  // DIAS TRAB.
    'E' => 15,  // SUELDO SEMANAL
    'F' => 15,  // PASAJE
    'G' => 15,  // COMIDA
    'H' => 15,  // EXTRAS
    'I' => 15,  // TOTAL PERCEPCIONES
    'J' => 15,  // ISR
    'K' => 15,  // IMSS
    'L' => 15,  // INFONAVIT
    'M' => 15,  // AJUSTES AL SUB
    'N' => 15,  // AUSENTISMO
    'O' => 15,  // UNIFORMES
    'P' => 15,  // PERMISOS
    'Q' => 15,  // RETARDOS
    'R' => 15,  // CHECADOR
    'S' => 15,  // F.A/GAFET/COFIA
    'T' => 15,  // TOTAL DE DEDUCCIONES
    'U' => 15,  // NETO A RECIBIR
    'V' => 15,  // DISPERSION DE TARJETA
    'W' => 15,  // IMPORTE EN EFECTIVO
    'X' => 15,  // PRÉSTAMO
    'Y' => 15,  // TOTAL A RECIBIR
    'Z' => 15,  // REDONDEADO
    'AA' => 15, // TOTAL EFECTIVO REDONDEADO
    'AB' => 15  // FIRMA RECIBIDO
];

// Altura de los títulos
$sheet->getRowDimension(1)->setRowHeight(38);
$sheet->getRowDimension(2)->setRowHeight(32);
$sheet->getRowDimension(3)->setRowHeight(32);
$sheet->getRowDimension(4)->setRowHeight(32);

// Altura de separación (fila 5)
$sheet->getRowDimension(5)->setRowHeight(35);

// Altura de los encabezados
$sheet->getRowDimension(6)->setRowHeight(45);

// CONFIGURACIÓN PERSONALIZABLE
$alturaFilas = 48;      // Altura de filas de datos (puntos)

// Aplicar altura a las filas de datos
for ($fila = 7; $fila < $numeroFila; $fila++) {
    $sheet->getRowDimension($fila)->setRowHeight($alturaFilas);

    // Aplicar tamaño de letra por columna a cada fila de datos
    foreach ($tamanioLetraFilas as $columna => $tamanio) {
        $sheet->getStyle($columna . $fila)->getFont()->setSize($tamanio);
    }
}

//=====================
//  CONFIGURACIÓN DE PÁGINA
//=====================

// Establecer el tamaño de página a CARTA (Letter)
$sheet->getPageSetup()->setPaperSize(PageSetup::PAPERSIZE_LETTER);

// Establecer orientación a HORIZONTAL (Landscape)
$sheet->getPageSetup()->setOrientation(PageSetup::ORIENTATION_LANDSCAPE);

// Establecer márgenes
$sheet->getPageMargins()->setLeft(0.5);
$sheet->getPageMargins()->setRight(0.5);
$sheet->getPageMargins()->setTop(0.5);
$sheet->getPageMargins()->setBottom(0.5);

// Ajustar la escala para que todo quepa en una página
$sheet->getPageSetup()->setFitToPage(true);
$sheet->getPageSetup()->setFitToHeight(1);
$sheet->getPageSetup()->setFitToWidth(1);

// Definir el área de impresión
$ultimaFila = $filaTotal;
$sheet->getPageSetup()->setPrintArea('A1:' . $lastColLetter . $ultimaFila);

//=====================
//  DESCARGAR ARCHIVO
//=====================

$writer = new Xlsx($spreadsheet);

// Definir el nombre del archivo con fecha y hora
$filename = 'Nomina_Jornalero_Apoyo_Palmilla_' . date('Y-m-d_H-i-s') . '.xlsx';

// Configurar las cabeceras para descargar el archivo
header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
header('Content-Disposition: attachment; filename="' . $filename . '"');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

// Escribir el archivo al cliente
$writer->save('php://output');
exit;
