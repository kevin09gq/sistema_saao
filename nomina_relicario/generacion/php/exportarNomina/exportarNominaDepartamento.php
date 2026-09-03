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
$colorExcel = 'FF0000'; // Color por defecto para Relicario
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

$titulo1 = 'RANCHO RELICARIO';
$titulo2 = strtoupper($nombreDeptoTarget);
$titulo3 = 'NOMINA DEL ' . strtoupper($fecha_inicio) . ' AL ' . strtoupper($fecha_cierre);
$titulo4 = 'SEMANA ' . (isset($jsonNomina['numero_semana']) ? str_pad($jsonNomina['numero_semana'], 2, '0', STR_PAD_LEFT) : '00') . '-' . $ano;

//=====================
//  RECOPILAR EMPLEADOS Y COLUMNAS DINÁMICAS
//=====================

// Recopilar empleados del departamento correspondiente
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

// Validar que haya empleados para procesar
if (empty($empleadosJornaleros)) {
    $empleadosJornaleros = [];
}

// 2. Buscar percepciones_extra únicas (insensible a mayúsculas/minúsculas)
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

// 2.b. Buscar deducciones_extra únicas (insensible a mayúsculas/minúsculas)
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

// 3. Construir lista dinámica de encabezados y mapeo de posiciones (1-indexed)
$columnasNombres = [
    'N°',                  // 1 (A)
    'CD',                  // 2 (B)
    'NOMBRE',              // 3 (C)
    'DIAS TRAB.',          // 4 (D)
    'SUELDO SEMANAL',      // 5 (E)
    'PASAJE',              // 6 (F)
    'COMIDA',              // 7 (G)
];

$mapExtrasCols = []; // key: normalized name => colIndex
$colIndex = 8;
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
$colUNIFORMES = $colIndex; $columnasNombres[] = 'UNIFORMES'; $colIndex++;
$colPERMISOS = $colIndex; $columnasNombres[] = 'PERMISOS'; $colIndex++;
$colRETARDOS = $colIndex; $columnasNombres[] = 'RETARDOS'; $colIndex++;
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

//=====================
//  AGREGAR TÍTULOS Y MERGES
//=====================

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

// Formatear título 1 - RANCHO RELICARIO (Rojo, Negrita, Tamaño 24)
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
    $logo->setDescription('Logo de Rancho El Relicario');
    $logo->setPath($logoPath);
    $logo->setHeight(190); // Altura en píxeles
    $logo->setCoordinates('B1'); // Colocar en columna Z, fila 1
    $logo->setOffsetX(10);
    $logo->setWorksheet($sheet);
}

//=====================
//  ENCABEZADOS DE LA TABLA
//=====================

// Encabezados en fila 6
foreach ($columnasNombres as $idxCol => $encabezado) {
    $colL = Coordinate::stringFromColumnIndex($idxCol + 1);
    $sheet->setCellValue($colL . '6', $encabezado);

    $w = 20;
    if ($colL === 'A') $w = 12;
    elseif ($colL === 'B') $w = 14;
    elseif ($colL === 'C') $w = 65;
    elseif ($colL === 'D') $w = 14;
    elseif (in_array($encabezado, ['SUELDO SEMANAL', 'TOTAL PERCEPCIONES', 'AJUSTES AL SUB', 'TOTAL DE DEDUCCIONES', 'NETO A RECIBIR', 'DISPERSION DE TARJETA', 'IMPORTE EN EFECTIVO', 'PRÉSTAMO', 'TOTAL A RECIBIR'])) $w = 22;
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

// Letras para fórmulas (columnas dinámicas)
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

//=====================
//  AGREGAR DATOS DE EMPLEADOS JORNALEROS BASE
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

// Determinar si la columna CHECADOR tiene datos
$checadorTieneDatos = false;
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
    }

    // Agregar pasaje 
    $pasaje = $empleado['pasaje'] ?? 0;
    if (!empty($pasaje) && $pasaje != 0) {
        $sheet->setCellValue('F' . $numeroFila, $pasaje);
    }

    // Agregar comida
    if ($comidaTieneDatos) {
        $comida = $empleado['comida'] ?? 0;
        if (!empty($comida) && $comida != 0) {
            $sheet->setCellValue('G' . $numeroFila, $comida);
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

    // Total percepciones
    $sheet->setCellValue($colTotalPercepcionesLetter . $numeroFila, '=SUM(E' . $numeroFila . ':' . $lastPercepcionLetter . $numeroFila . ')');

    //=============================
    //  AGREGAR DEDUCCIONES 
    //=============================

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

    if ($uniformesTieneDatos) {
        $uniformes = $empleado['uniformes'] ?? 0;
        if (!empty($uniformes) && $uniformes != 0) {
            $sheet->setCellValue($colUNIFORMESLetter . $numeroFila, $uniformes);
        }
    }

    if ($permisoTieneDatos) {
        $permiso = $empleado['permiso'] ?? 0;
        if (!empty($permiso) && $permiso != 0) {
            $sheet->setCellValue($colPERMISOSLetter . $numeroFila, $permiso);
        }
    }

    if ($retardosTieneDatos) {
        $retardos = $empleado['retardos'] ?? 0;
        if (!empty($retardos) && $retardos != 0) {
            $sheet->setCellValue($colRETARDOSLetter . $numeroFila, $retardos);
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
                $nombreSanitizado = preg_replace('/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/', '', $nombre);
                $nombreSanitizado = mb_substr($nombreSanitizado, 0, 30, 'UTF-8');
                $key = mb_strtolower($nombreSanitizado, 'UTF-8');
                if (isset($mapDeduccionesExtrasCols[$key])) {
                    $colL = Coordinate::stringFromColumnIndex($mapDeduccionesExtrasCols[$key]);
                    $sheet->setCellValue($colL . $numeroFila, $cant);
                }
            }
        }
    }

    // Total deducciones
    $sheet->setCellValue($colTotalDeduccionesLetter . $numeroFila, '=SUM(' . $colISRLetter . $numeroFila . ':' . $lastDeduccionLetter . $numeroFila . ')');
    $sheet->setCellValue($colNetoRecibirLetter . $numeroFila, '=' . $colTotalPercepcionesLetter . $numeroFila . '-' . $colTotalDeduccionesLetter . $numeroFila);

    $tarjeta = $empleado['tarjeta'] ?? 0;
    if (!empty($tarjeta) && $tarjeta != 0) {
        $sheet->setCellValue($colTarjetaLetter . $numeroFila, $tarjeta);
    }

    $sheet->setCellValue($colEfectivoLetter . $numeroFila, '=' . $colNetoRecibirLetter . $numeroFila . '-' . $colTarjetaLetter . $numeroFila);

    $prestamo = $empleado['prestamo'] ?? 0;
    if (!empty($prestamo) && $prestamo != 0) {
        $sheet->setCellValue($colPrestamoLetter . $numeroFila, $prestamo);
    }

    $sheet->setCellValue($colTotalRecibirLetter . $numeroFila, '=' . $colEfectivoLetter . $numeroFila . '-' . $colPrestamoLetter . $numeroFila);
    $sheet->setCellValue($colRedondeadoLetter . $numeroFila, '=ROUND(' . $colTotalRecibirLetter . $numeroFila . ',0)-' . $colTotalRecibirLetter . $numeroFila);
    $sheet->setCellValue($colTotalRedondeadoLetter . $numeroFila, '=' . $colTotalRecibirLetter . $numeroFila . '+' . $colRedondeadoLetter . $numeroFila);

    // Alineación
    $sheet->getStyle('A' . $numeroFila . ':B' . $numeroFila)->getAlignment()->setHorizontal('center')->setVertical('center');
    $sheet->getStyle('C' . $numeroFila)->getAlignment()->setHorizontal('left')->setVertical('center');
    $sheet->getStyle("D{$numeroFila}:{$colTotalRedondeadoLetter}{$numeroFila}")->getAlignment()->setHorizontal('center')->setVertical('center');

    $numeroFila++;
    $numeroEmpleado++;
}

//=====================
//  APLICAR FORMATOS A TODAS LAS CELDAS DE DATOS (INCLUSO VACIAS)
//=====================

// Aplicar formatos a todas las celdas de datos
$colsRojas = [
    $colISRLetter, $colIMSSLetter, $colINFONAVITLetter, $colAJUSTESLetter,
    $colAUSENTISMOLetter, $colPERMISOSLetter, $colUNIFORMESLetter, $colRETARDOSLetter, $colBIOMETRICOLetter
];
foreach ($mapDeduccionesExtrasCols as $cIdx) {
    $colsRojas[] = Coordinate::stringFromColumnIndex($cIdx);
}
$colsRojas[] = $colTotalDeduccionesLetter;
$colsRojas[] = $colTarjetaLetter;
$colsRojas[] = $colPrestamoLetter;

for ($fila = 7; $fila < $numeroFila; $fila++) {
    $sheet->getStyle("E{$fila}:{$colTotalRedondeadoLetter}{$fila}")->getNumberFormat()->setFormatCode('$#,##0.00');

    foreach ($colsRojas as $cL) {
        $sheet->getStyle($cL . $fila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
        $sheet->getStyle($cL . $fila)->getFont()->setColor(new Color('FF0000'));
    }
    $sheet->getStyle($colRedondeadoLetter . $fila)->getNumberFormat()->setFormatCode('$#,##0.00;[RED]-$#,##0.00');
}

//=====================
//  AGREGAR FILA DE TOTALES
//=====================

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

//=====================
//  OCULTAR COLUMNAS SIN DATOS
//=====================

// Ocultar columnas sin datos
if (!$diasTrabajadosTieneDatos) $sheet->getColumnDimension('D')->setVisible(false);
if (!$pasajeTieneDatos) $sheet->getColumnDimension('F')->setVisible(false);
if (!$comidaTieneDatos) $sheet->getColumnDimension('G')->setVisible(false);
if (!$isrTieneDatos) $sheet->getColumnDimension($colISRLetter)->setVisible(false);
if (!$imssTieneDatos) $sheet->getColumnDimension($colIMSSLetter)->setVisible(false);
if (!$infonavitTieneDatos) $sheet->getColumnDimension($colINFONAVITLetter)->setVisible(false);
if (!$ajustesAlSubTieneDatos) $sheet->getColumnDimension($colAJUSTESLetter)->setVisible(false);
if (!$ausentismoTieneDatos) $sheet->getColumnDimension($colAUSENTISMOLetter)->setVisible(false);
if (!$uniformesTieneDatos) $sheet->getColumnDimension($colUNIFORMESLetter)->setVisible(false);
if (!$permisoTieneDatos) $sheet->getColumnDimension($colPERMISOSLetter)->setVisible(false);
if (!$retardosTieneDatos) $sheet->getColumnDimension($colRETARDOSLetter)->setVisible(false);
if (!$checadorTieneDatos) $sheet->getColumnDimension($colBIOMETRICOLetter)->setVisible(false);

//=====================
//  CONFIGURAR ALTURA DE FILAS Y TAMAÑO DE LETRA
//=====================

// Configurar tamaño de letra para cada columna (dinámico)
$tamanioLetraFilas = [];
for ($idxC = 1; $idxC <= $totalCols; $idxC++) {
    $cL = Coordinate::stringFromColumnIndex($idxC);
    $s = 15;
    if ($cL === 'A' || $cL === 'B') $s = 14;
    elseif ($cL === 'C') $s = 16;
    $tamanioLetraFilas[$cL] = $s;
}

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
$sheet->getPageSetup()->setPrintArea('A1:AB' . $ultimaFila);

//=====================
//  DESCARGAR ARCHIVO
//=====================

$writer = new Xlsx($spreadsheet);

// Definir el nombre del archivo con fecha y hora
$filename = 'Nomina_Jornalero_Apoyo_Relicario_' . date('Y-m-d_H-i-s') . '.xlsx';

// Configurar las cabeceras para descargar el archivo
header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
header('Content-Disposition: attachment; filename="' . $filename . '"');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

// Escribir el archivo al cliente
$writer->save('php://output');
exit;
