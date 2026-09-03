<?php

// Incluir autoload de Composer
require_once __DIR__ . '/../../../../vendor/autoload.php';
require_once __DIR__ . '/../../../../conexion/conexion.php';
/** @var mysqli $conexion */
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
    // Validar que el JSON se decodificó correctamente
    if (json_last_error() !== JSON_ERROR_NONE) {
        error_log("Error al decodificar JSON: " . json_last_error_msg());
        $jsonNomina = null;
    }
}

$idDeptoTarget = $_POST['deptoId'] ?? null;
$nombreDeptoTarget = $_POST['deptoNombre'] ?? 'DEPARTAMENTO';
$idEmpresaTarget = $_POST['id_empresa'] ?? null;

// Obtener datos de la empresa desde la base de datos
$nombreEmpresaTarget = '';
$logoEmpresa = '';
if ($idEmpresaTarget) {
    $queryEmpresa = "SELECT nombre_empresa, logo_empresa FROM empresa WHERE id_empresa = $idEmpresaTarget";
    $resultEmpresa = mysqli_query($conexion, $queryEmpresa);
    if ($resultEmpresa && mysqli_num_rows($resultEmpresa) > 0) {
        $rowEmpresa = mysqli_fetch_assoc($resultEmpresa);
        $nombreEmpresaTarget = $rowEmpresa['nombre_empresa'];
        $logoEmpresa = $rowEmpresa['logo_empresa'];
    } else {
        // Si no se encuentra la empresa, usar un valor por defecto
        $nombreEmpresaTarget = 'EMPRESA';
        error_log("No se encontró empresa con id: $idEmpresaTarget");
    }
} else {
    // Si no se envió id_empresa, usar un valor por defecto
    $nombreEmpresaTarget = 'EMPRESA';
    error_log("No se recibió id_empresa");
}

// Obtener el color del departamento desde el JSON (buscando en el nuevo formato color_reporte)
$colorExcel = 'FF0000'; // Rojo por defecto

if ($jsonNomina && isset($jsonNomina['departamentos'])) {
    foreach ($jsonNomina['departamentos'] as $depto) {
        // Buscar el departamento que coincida con ambos id_departamento Y id_empresa
        if ($depto['id_departamento'] == $idDeptoTarget) {
            // Verificar si coincide el id_empresa (si se especificó)
            $idEmpresaDepto = $depto['id_empresa'] ?? null;
            if (!$idEmpresaTarget || $idEmpresaDepto == $idEmpresaTarget) {
                // Si existe el nuevo formato de arreglo de colores
                if (isset($depto['color_reporte']) && is_array($depto['color_reporte'])) {
                    // Tomar el primer color del array (ya estamos filtrando por empresa a nivel de departamento)
                    $primerColor = $depto['color_reporte'][0] ?? null;
                    if ($primerColor) {
                        if (is_string($primerColor)) {
                            $colorExcel = str_replace('#', '', $primerColor);
                        } elseif (isset($primerColor['color'])) {
                            $colorExcel = str_replace('#', '', $primerColor['color']);
                        }
                    }
                } else {
                    // Fallback por si el JSON aún tiene el campo plano anterior
                    $colorExcel = $depto['color_depto_nomina'] ?? 'FF0000';
                    $colorExcel = str_replace('#', '', $colorExcel);
                }
                break; // Ya encontramos el departamento correcto, salir del loop
            }
        }
    }
}

// Si no se encontró color en el JSON, usar el del POST como fallback
if ($colorExcel === 'FF0000' && isset($_POST['colorExcel'])) {
    $colorExcel = str_replace('#', '', $_POST['colorExcel']);
}

// Limpiar el # si aún existe
$colorExcel = str_replace('#', '', $colorExcel);

// Detectar automáticamente el color de texto según el contraste
$textColor = obtenerColorContraste($colorExcel);

//=====================
//  CONFIGURACIÓN INICIAL
//=====================

$spreadsheet = new Spreadsheet();
$sheet = $spreadsheet->getActiveSheet();

// Aplicar fuente Arial como predeterminada para toda la hoja
$spreadsheet->getDefaultStyle()->getFont()->setName('Arial');


// Establecer el nombre de la pestaña (máximo 31 caracteres)
$pestañaTitulo = substr(mb_strtoupper($nombreDeptoTarget . ' - ' . $nombreEmpresaTarget, 'UTF-8'), 0, 31);
$sheet->setTitle($pestañaTitulo);


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

$titulo1 = mb_strtoupper($nombreEmpresaTarget ?: 'RANCHO RELICARIO', 'UTF-8');
$titulo2 = mb_strtoupper($nombreDeptoTarget, 'UTF-8');
$titulo3 = 'NOMINA DEL ' . mb_strtoupper($fecha_inicio, 'UTF-8') . ' AL ' . mb_strtoupper($fecha_cierre, 'UTF-8');
$titulo4 = 'SEMANA ' . (isset($jsonNomina['numero_semana']) ? str_pad($jsonNomina['numero_semana'], 2, '0', STR_PAD_LEFT) : '00') . '-' . $ano;

// Agregar los títulos en las primeras filas
$sheet->setCellValue('A1', $titulo1);
$sheet->setCellValue('A2', $titulo2);
$sheet->setCellValue('A3', $titulo3);
$sheet->setCellValue('A4', $titulo4);

// Formatear título 1 - NOMBRE EMPRESA (Color Dinámico, Negrita, Tamaño 24)
$sheet->getStyle('A1')->getFont()->setBold(true);
$sheet->getStyle('A1')->getFont()->setSize(24);
$sheet->getStyle('A1')->getFont()->setColor(new Color('008000')); // Verde oscuro

// Formatear título 2 - PERSONAL DE BASE (Negrita, Tamaño 11)
$sheet->getStyle('A2')->getFont()->setBold(true);
$sheet->getStyle('A2')->getFont()->setSize(20);
$sheet->getStyle('A2')->getFont()->setColor(new Color('008000')); // Verde oscuro

// Formatear título 3 - NOMINA (Negrita, Tamaño 10)
$sheet->getStyle('A3')->getFont()->setBold(true);
$sheet->getStyle('A3')->getFont()->setSize(14);

// Formatear título 4 - SEMANA (Negrita, Tamaño 10)
$sheet->getStyle('A4')->getFont()->setBold(true);
$sheet->getStyle('A4')->getFont()->setSize(14);

// Centrar todos los títulos
$sheet->getStyle('A1:A4')->getAlignment()->setHorizontal('center');

// Insertar logo dinámico según la empresa
if ($idEmpresaTarget == 1) {
    // Si es empresa 1, usar el logo por defecto en public/img
    $logoPath = '../../../../public/img/logo.jpg';
} else {
    // Si es diferente de 1, usar el logo de la base de datos en gafetes/logos_empresa
    $logoPath = '../../../../public/img/logo.jpg'; // Logo por defecto
    if (!empty($logoEmpresa)) {
        // Construir la ruta completa al logo (la ruta correcta es gafetes/logos_empresa/)
        $logoPath = '../../../../gafetes/logos_empresa/' . $logoEmpresa;
        error_log("Intentando cargar logo: $logoPath");
        // Verificar si el archivo existe
        if (!file_exists($logoPath)) {
            error_log("El logo no existe en la ruta: $logoPath");
            $logoPath = '../../../../public/img/logo.jpg'; // Logo por defecto si no existe
        } else {
            error_log("Logo encontrado exitosamente: $logoPath");
        }
    } else {
        error_log("logoEmpresa está vacío");
    }
}

if (file_exists($logoPath)) {
    $logo = new Drawing();
    $logo->setName('Logo');
    $logo->setDescription('Logo de la Empresa');
    $logo->setPath($logoPath);
    $logo->setHeight(190); // Altura en píxeles
    $logo->setCoordinates('B1'); // Colocar en columna Z, fila 1
    $logo->setOffsetX(10);
    $logo->setWorksheet($sheet);
}

//=====================
//  RECOPILAR EMPLEADOS Y COLUMNAS DINÁMICAS
//=====================

// Recopilar empleados del departamento correspondiente
$empleadosJornaleros = [];

if ($jsonNomina && isset($jsonNomina['departamentos'])) {
    foreach ($jsonNomina['departamentos'] as $departamento) {
        // Filtrar por el ID del departamento recibido
        if ($departamento['id_departamento'] == $idDeptoTarget) {
            // Verificar que coincida el id_empresa si se recibió
            $idEmpresaDepto = $departamento['id_empresa'] ?? null;
            if (!$idEmpresaTarget || $idEmpresaDepto == $idEmpresaTarget) {
                if (isset($departamento['empleados'])) {
                    foreach ($departamento['empleados'] as $empleado) {
                        // Si no tiene el campo mostrar o es true, incluir el empleado
                        $mostrar = $empleado['mostrar'] ?? true;
                        if ($mostrar) {
                            $empleadosJornaleros[] = $empleado;
                        }
                    }
                }
            }
            // NO hacemos break porque puede haber múltiples departamentos con el mismo id_departamento pero diferentes id_empresa
        }
    }
}

// Ordenar empleados por nombre (orden ascendente A-Z)
usort($empleadosJornaleros, function ($a, $b) {
    return strcmp($a['nombre'] ?? '', $b['nombre'] ?? '');
});

// Validar que haya empleados para procesar
if (empty($empleadosJornaleros)) {
    // Si no hay empleados, crear un array vacío para evitar errores
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
                // Sanitizar el nombre: eliminar caracteres especiales problemáticos
                $nombreSanitizado = preg_replace('/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/', '', $nombre);
                $nombreSanitizado = mb_substr($nombreSanitizado, 0, 30, 'UTF-8'); // Limitar longitud
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
                // Sanitizar el nombre: eliminar caracteres especiales problemáticos
                $nombreSanitizado = preg_replace('/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/', '', $nombre);
                $nombreSanitizado = mb_substr($nombreSanitizado, 0, 30, 'UTF-8'); // Limitar longitud
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
    'SUELDO SEMANAL',      // 4 (D)
];

$mapExtrasCols = []; // key: normalized name => colIndex
$colIndex = 5;
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

// Validar que $lastColLetter sea válido
if (empty($lastColLetter) || strlen($lastColLetter) === 0) {
    $lastColLetter = 'Y'; // Valor por defecto si hay error
    $totalCols = 25;
}

// Mergear las celdas para que los títulos ocupen toda la tabla
$sheet->mergeCells("A1:{$lastColLetter}1");
$sheet->mergeCells("A2:{$lastColLetter}2");
$sheet->mergeCells("A3:{$lastColLetter}3");
$sheet->mergeCells("A4:{$lastColLetter}4");

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

// Verificar banderas de datos
$isrTieneDatos = false;
$imssTieneDatos = false;
$infonavitTieneDatos = false;
$ajustesAlSubTieneDatos = false;
$ausentismoTieneDatos = false;
$permisoTieneDatos = false;
$retardosTieneDatos = false;
$uniformesTieneDatos = false;
$checadorTieneDatos = false;
$faxGafetCofiaTieneDatos = false;

foreach ($empleadosJornaleros as $empleado) {
    if (($empleado['inasistencia'] ?? 0) != 0) $ausentismoTieneDatos = true;
    if (($empleado['permiso'] ?? 0) != 0) $permisoTieneDatos = true;
    if (($empleado['retardos'] ?? 0) != 0) $retardosTieneDatos = true;
    if (($empleado['uniformes'] ?? 0) != 0) $uniformesTieneDatos = true;
    if (($empleado['checador'] ?? 0) != 0) $checadorTieneDatos = true;
    if (($empleado['fa_gafet_cofia'] ?? 0) != 0) $faxGafetCofiaTieneDatos = true;

    if (!empty($empleado['conceptos']) && is_array($empleado['conceptos'])) {
        foreach ($empleado['conceptos'] as $concepto) {
            $codigo = $concepto['codigo'] ?? null;
            $resultado = $concepto['resultado'] ?? 0;
            if ($codigo === '45' && $resultado != 0) $isrTieneDatos = true;
            if ($codigo === '52' && $resultado != 0) $imssTieneDatos = true;
            if ($codigo === '16' && $resultado != 0) $infonavitTieneDatos = true;
            if ($codigo === '107' && $resultado != 0) $ajustesAlSubTieneDatos = true;
        }
    }
}

foreach ($empleadosJornaleros as $empleado) {
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

    //=============================
    //  AGREGAR PERCEPCIONES 
    //=============================

    // Agregar salario semanal 
    $salarioSemanal = $empleado['salario_semanal'] ?? 0;
    if (!empty($salarioSemanal) && $salarioSemanal != 0) {
        $sheet->setCellValue('D' . $numeroFila, $salarioSemanal);
    }

    // Agregar sueldo extra total
    $sueldoExtraTotal = $empleado['sueldo_extra_total'] ?? 0;
    if (!empty($sueldoExtraTotal) && $sueldoExtraTotal != 0) {
        $sheet->setCellValue('E' . $numeroFila, $sueldoExtraTotal);
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
                $key = mb_strtolower($nombre, 'UTF-8');
                if (isset($mapDeduccionesExtrasCols[$key])) {
                    $colL = Coordinate::stringFromColumnIndex($mapDeduccionesExtrasCols[$key]);
                    $sheet->setCellValue($colL . $numeroFila, $cant);
                }
            }
        }
    }



    // Total deducciones
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
    $sheet->getStyle("D{$fila}:{$colTotalRedondeadoLetter}{$fila}")->getNumberFormat()->setFormatCode('$#,##0.00');

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

$sheet->getStyle("A6:{$lastColLetter}{$filaTotal}")->applyFromArray($estiloBordesTabla);

//=====================
//  OCULTAR COLUMNAS SIN DATOS
//=====================

// Ocultar columnas sin datos
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
$sheet->getPageSetup()->setPrintArea("A1:{$lastColLetter}{$ultimaFila}");

//=====================
//  DESCARGAR ARCHIVO
//=====================

try {
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
} catch (Exception $e) {
    error_log("Error al generar archivo Excel: " . $e->getMessage());
    header('Content-Type: text/plain');
    echo "Error al generar el archivo Excel: " . $e->getMessage();
    exit;
}