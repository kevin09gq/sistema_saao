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

// Obtener nombres de empresas desde el POST (enviado por JS para evitar reconexión)
$mapaEmpresas = [];
if (isset($_POST['mapaEmpresas'])) {
    $mapaEmpresas = json_decode($_POST['mapaEmpresas'], true);
}

//=====================
//  RECIBIR DATOS DEL JSON
//=====================

$jsonNomina = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['jsonNomina'])) {
    $jsonNomina = json_decode($_POST['jsonNomina'], true);

    // Inyectar id_departamento en cada empleado para filtrar dinámicamente después
    if (isset($jsonNomina['departamentos'])) {
        foreach ($jsonNomina['departamentos'] as $idxDepto => $depto) {
            $idDeptoActual = $depto['id_departamento'] ?? $idxDepto;
            if (isset($depto['empleados'])) {
                foreach ($depto['empleados'] as $idxEmp => $emp) {
                    $jsonNomina['departamentos'][$idxDepto]['empleados'][$idxEmp]['id_departamento'] = $idDeptoActual;
                }
            }
        }
    }
}

//=====================
//  CONFIGURACIÓN INICIAL
//=====================

$spreadsheet = new Spreadsheet();

// Aplicar fuente Arial como predeterminada para toda la hoja
$spreadsheet->getDefaultStyle()->getFont()->setName('Arial');

// Datos de fecha
if ($jsonNomina) {
    $fecha_inicio = restarUnDia($jsonNomina['fecha_inicio']) ?? 'Fecha Inicio';
    $fecha_cierre = restarUnDia($jsonNomina['fecha_cierre']) ?? 'Fecha Cierre';
    $numero_semana = $jsonNomina['numero_semana'] ?? '00';
    $ano = date('Y');
}

//=====================
//  DEFINIR COLUMNAS COMUNES
//=====================

// Estas variables se usarán dentro de la función crearHoja
// Las columnas dinámicas se construirán dentro de la función


//=====================
//  FUNCIÓN PARA CREAR UNA HOJA
//=====================

function crearHoja($spreadsheet, $deptoData, $targetEmpresaId, $filtroEmpleados, $nombreHoja)
{
    global $jsonNomina, $mapaEmpresas, $fecha_inicio, $fecha_cierre, $numero_semana, $ano, $conexion;

    $nombreDepto = $deptoData['nombre'] ?? 'DEPARTAMENTO';
    $colorExcel = 'FF0000'; // Color por defecto

    // Obtener datos de la empresa desde la base de datos
    $nombreEmpresaTarget = '';
    $logoEmpresa = '';
    if ($targetEmpresaId) {
        $queryEmpresa = "SELECT nombre_empresa, logo_empresa FROM empresa WHERE id_empresa = $targetEmpresaId";
        $resultEmpresa = mysqli_query($conexion, $queryEmpresa);
        if ($resultEmpresa && mysqli_num_rows($resultEmpresa) > 0) {
            $rowEmpresa = mysqli_fetch_assoc($resultEmpresa);
            $nombreEmpresaTarget = $rowEmpresa['nombre_empresa'];
            $logoEmpresa = $rowEmpresa['logo_empresa'];
        }
    }

    // Si no se encontró el nombre de la empresa, usar un valor por defecto
    if (empty($nombreEmpresaTarget)) {
        $nombreEmpresaTarget = $mapaEmpresas[$targetEmpresaId] ?? 'EMPRESA ' . $targetEmpresaId;
    }

    // Lógica dinámica para seleccionar el color del reporte
    if (isset($deptoData['color_reporte'])) {
        if (is_array($deptoData['color_reporte']) && !empty($deptoData['color_reporte'])) {
            // Ahora color_reporte es un array simple de strings hexadecimales
            $colorExcel = $deptoData['color_reporte'][0];
        } else {
            $colorExcel = $deptoData['color_reporte'];
        }
    }

    // Limpiamos el formato hexadecimal para la librería Excel
    $colorExcel = str_replace('#', '', $colorExcel);
    
    // Detectar automáticamente el color de texto según el contraste
    $textColor = obtenerColorContraste($colorExcel);

    // Crear una nueva hoja o usar la existente (si el libro está recién creado)
    if ($spreadsheet->getSheetCount() === 1 && $spreadsheet->getActiveSheet()->getTitle() === 'Worksheet') {
        $sheet = $spreadsheet->getActiveSheet();
    } else {
        $sheet = $spreadsheet->createSheet();
    }

    $sheet->setTitle($nombreHoja);

    //=====================
    //  RECOPILAR DATOS DE EMPLEADOS
    //=====================

    $empleados = [];
    if ($jsonNomina && isset($jsonNomina['departamentos'])) {
        foreach ($jsonNomina['departamentos'] as $departamento) {
            if (isset($departamento['empleados'])) {
                foreach ($departamento['empleados'] as $empleado) {
                    if ($filtroEmpleados($empleado)) {
                        $empleados[] = $empleado;
                    }
                }
            }
        }
    }

    // Ordenar empleados por nombre
    usort($empleados, function ($a, $b) {
        return strcmp($a['nombre'] ?? '', $b['nombre'] ?? '');
    });

    //=====================
    //  BUSCAR PERCEPCIONES EXTRA Y DEDUCCIONES EXTRA ÚNICAS
    //=====================

    // Buscar percepciones_extra únicas (insensible a mayúsculas/minúsculas)
    $extrasDinamicas = [];
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

    // Buscar deducciones_extra únicas (insensible a mayúsculas/minúsculas)
    $deduccionesDinamicas = [];
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

    //=====================
    //  TÍTULOS
    //=====================

    $titulo1 = mb_strtoupper($nombreEmpresaTarget, 'UTF-8');
    $titulo2 = mb_strtoupper($nombreDepto, 'UTF-8');
    $titulo3 = 'NOMINA DEL ' . mb_strtoupper($fecha_inicio, 'UTF-8') . ' AL ' . mb_strtoupper($fecha_cierre, 'UTF-8');
    $titulo4 = 'SEMANA ' . str_pad($numero_semana, 2, '0', STR_PAD_LEFT) . '-' . $ano;

    // Agregar los títulos en las primeras filas
    $sheet->setCellValue('A1', $titulo1);
    $sheet->setCellValue('A2', $titulo2);
    $sheet->setCellValue('A3', $titulo3);
    $sheet->setCellValue('A4', $titulo4);

    //=====================
    //  CONSTRUIR ENCABEZADOS DINÁMICOS
    //=====================

    // Construir lista dinámica de encabezados y mapeo de posiciones (1-indexed)
    $columnasNombres = [
        'N°',                  // 1 (A)
        'CD',                  // 2 (B)
        'NOMBRE',              // 3 (C)
        'DIAS TRAB.',          // 4 (D)
        'SUELDO SEMANAL',       // 5 (E)
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

    // Mergear las celdas para que los títulos ocupen toda la tabla
    $sheet->mergeCells("A1:{$lastColLetter}1");
    $sheet->mergeCells("A2:{$lastColLetter}2");
    $sheet->mergeCells("A3:{$lastColLetter}3");
    $sheet->mergeCells("A4:{$lastColLetter}4");

    // Formatear título 1 - NOMBRE EMPRESA (Verde oscuro/Dinamico, Negrita, Tamaño 24)
    $sheet->getStyle('A1')->getFont()->setBold(true);
    $sheet->getStyle('A1')->getFont()->setSize(24);
    $sheet->getStyle('A1')->getFont()->setColor(new Color('008000'));

    // Formatear título 2 (Negrita, Tamaño 20)
    $sheet->getStyle('A2')->getFont()->setBold(true);
    $sheet->getStyle('A2')->getFont()->setSize(20);
    $sheet->getStyle('A2')->getFont()->setColor(new Color('008000'));

    // Formatear título 3 - NOMINA (Negrita, Tamaño 14)
    $sheet->getStyle('A3')->getFont()->setBold(true);
    $sheet->getStyle('A3')->getFont()->setSize(14);

    // Formatear título 4 - SEMANA (Negrita, Tamaño 14)
    $sheet->getStyle('A4')->getFont()->setBold(true);
    $sheet->getStyle('A4')->getFont()->setSize(14);

    // Centrar todos los títulos
    $sheet->getStyle('A1:A4')->getAlignment()->setHorizontal('center');

    // Insertar logo dinámico según la empresa
    if ($targetEmpresaId == 1) {
        // Si es empresa 1, usar el logo por defecto en public/img
        $logoPath = '../../../../public/img/logo.jpg';
    } else {
        // Si es diferente de 1, usar el logo de la base de datos en gafetes/logos_empresa
        $logoPath = '../../../../public/img/logo.jpg'; // Logo por defecto
        if (!empty($logoEmpresa)) {
            // Construir la ruta completa al logo (la ruta correcta es gafetes/logos_empresa/)
            $logoPath = '../../../../gafetes/logos_empresa/' . $logoEmpresa;
            // Verificar si el archivo existe
            if (!file_exists($logoPath)) {
                $logoPath = '../../../../public/img/logo.jpg'; // Logo por defecto si no existe
            }
        }
    }

    if (file_exists($logoPath)) {
        $logo = new Drawing();
        $logo->setName('Logo');
        $logo->setDescription('Logo de la Empresa');
        $logo->setPath($logoPath);
        $logo->setHeight(190); // Altura en píxeles
        $logo->setCoordinates('B1');
        $logo->setOffsetX(10);
        $logo->setWorksheet($sheet);
    }

    //=====================
    //  ENCABEZADOS DE LA TABLA
    //=====================

    // Agregar los encabezados en la fila 6
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

    // Formatear los encabezados
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
    //  VERIFICAR COLUMNAS CON DATOS
    //=====================

    $comidaTieneDatos = false;
    $pasajeTieneDatos = false;
    $isrTieneDatos = false;
    $imssTieneDatos = false;
    $infonavitTieneDatos = false;
    $ajustesAlSubTieneDatos = false;
    $ausentismoTieneDatos = false;
    $uniformesTieneDatos = false;
    $permisoTieneDatos = false;
    $retardosTieneDatos = false;
    $checadorTieneDatos = false;
    $faxGafetCofiaTieneDatos = false;
    $diasTrabajadosTieneDatos = false;

    foreach ($empleados as $empleado) {
        if (($empleado['comida'] ?? 0) != 0) {
            $comidaTieneDatos = true;
        }
        if (($empleado['pasaje'] ?? 0) != 0) {
            $pasajeTieneDatos = true;
        }
        if (($empleado['inasistencia'] ?? 0) != 0) {
            $ausentismoTieneDatos = true;
        }
        if (($empleado['uniformes'] ?? 0) != 0) {
            $uniformesTieneDatos = true;
        }
        if (($empleado['permiso'] ?? 0) != 0) {
            $permisoTieneDatos = true;
        }
        if (($empleado['retardos'] ?? 0) != 0) {
            $retardosTieneDatos = true;
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

        if (!empty($empleado['conceptos']) && is_array($empleado['conceptos'])) {
            foreach ($empleado['conceptos'] as $concepto) {
                $codigo = $concepto['codigo'] ?? '';
                $resultado = $concepto['resultado'] ?? 0;
                if ($resultado != 0) {
                    if ($codigo === '45')
                        $isrTieneDatos = true;
                    if ($codigo === '52')
                        $imssTieneDatos = true;
                    if ($codigo === '16')
                        $infonavitTieneDatos = true;
                    if ($codigo === '107')
                        $ajustesAlSubTieneDatos = true;
                }
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
    //  AGREGAR EMPLEADOS A LA HOJA
    //=====================

    $numeroFila = 7;
    $numeroEmpleado = 1;

    foreach ($empleados as $empleado) {

        // Agregar número, clave, nombre y días trabajados (solo si es tipo_horario 2)
        $sheet->setCellValue('A' . $numeroFila, $numeroEmpleado);
        $sheet->setCellValue('B' . $numeroFila, $empleado['clave'] ?? '');
        $sheet->setCellValue('C' . $numeroFila, $empleado['nombre'] ?? '');

        $tipoHorario = $empleado['tipo_horario'] ?? '';
        if ($tipoHorario == 2) {
            $sheet->setCellValue('D' . $numeroFila, $empleado['dias_trabajados'] ?? 0);
        } else {
            $sheet->setCellValue('D' . $numeroFila, '');
        }

        //=============================
        //  AGREGAR PERCEPCIONES
        //=============================

        $salarioSemanal = $empleado['salario_semanal'] ?? 0;
        if (!empty($salarioSemanal) && $salarioSemanal != 0) {
            $sheet->setCellValue('E' . $numeroFila, $salarioSemanal);
            $sheet->getStyle('E' . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00');
        }

        $pasaje = $empleado['pasaje'] ?? 0;
        if (!empty($pasaje) && $pasaje != 0) {
            $sheet->setCellValue('F' . $numeroFila, $pasaje);
            $sheet->getStyle('F' . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00');
        }

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
                    $key = mb_strtolower($nombre, 'UTF-8');
                    if (isset($mapExtrasCols[$key])) {
                        $colL = Coordinate::stringFromColumnIndex($mapExtrasCols[$key]);
                        $sheet->setCellValue($colL . $numeroFila, $cant);
                        $sheet->getStyle($colL . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00');
                    }
                }
            }
        }

        // TOTAL PERCEPCIONES
        $sheet->setCellValue($colTotalPercepcionesLetter . $numeroFila, "=SUM(E{$numeroFila}:{$lastPercepcionLetter}{$numeroFila})");
        $sheet->getStyle($colTotalPercepcionesLetter . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00');

        //=============================
        //  AGREGAR DEDUCCIONES
        //=============================

        if (!empty($empleado['conceptos']) && is_array($empleado['conceptos'])) {
            foreach ($empleado['conceptos'] as $concepto) {
                $codigo = $concepto['codigo'] ?? null;
                $resultado = $concepto['resultado'] ?? 0;

                if ($codigo === '107' && !$ajustesAlSubTieneDatos) {
                    continue;
                }

                if (isset($mapeoConceptos[$codigo]) && !empty($resultado) && $resultado != 0) {
                    $colL = $mapeoConceptos[$codigo];
                    $sheet->setCellValue($colL . $numeroFila, $resultado);
                    $sheet->getStyle($colL . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
                    $sheet->getStyle($colL . $numeroFila)->getFont()->setColor(new Color('FF0000'));
                }
            }
        }

        // Descuentos adicionales (AUSENTISMO, PERMISO, RETARDOS, UNIFORMES, CHECADOR, F.A/GAFET/COFIA)
        $inasistencia = $empleado['inasistencia'] ?? 0;
        if (!empty($inasistencia) && $inasistencia != 0) {
            $sheet->setCellValue($colAUSENTISMOLetter . $numeroFila, $inasistencia);
            $sheet->getStyle($colAUSENTISMOLetter . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
            $sheet->getStyle($colAUSENTISMOLetter . $numeroFila)->getFont()->setColor(new Color('FF0000'));
        }

        $uniformes = $empleado['uniformes'] ?? 0;
        if (!empty($uniformes) && $uniformes != 0) {
            $sheet->setCellValue($colUNIFORMESLetter . $numeroFila, $uniformes);
            $sheet->getStyle($colUNIFORMESLetter . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
            $sheet->getStyle($colUNIFORMESLetter . $numeroFila)->getFont()->setColor(new Color('FF0000'));
        }

        $permiso = $empleado['permiso'] ?? 0;
        if (!empty($permiso) && $permiso != 0) {
            $sheet->setCellValue($colPERMISOSLetter . $numeroFila, $permiso);
            $sheet->getStyle($colPERMISOSLetter . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
            $sheet->getStyle($colPERMISOSLetter . $numeroFila)->getFont()->setColor(new Color('FF0000'));
        }

        $retardos = $empleado['retardos'] ?? 0;
        if (!empty($retardos) && $retardos != 0) {
            $sheet->setCellValue($colRETARDOSLetter . $numeroFila, $retardos);
            $sheet->getStyle($colRETARDOSLetter . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
            $sheet->getStyle($colRETARDOSLetter . $numeroFila)->getFont()->setColor(new Color('FF0000'));
        }

        $checador = $empleado['checador'] ?? 0;
        if (!empty($checador) && $checador != 0) {
            $sheet->setCellValue($colBIOMETRICOLetter . $numeroFila, $checador);
            $sheet->getStyle($colBIOMETRICOLetter . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
            $sheet->getStyle($colBIOMETRICOLetter . $numeroFila)->getFont()->setColor(new Color('FF0000'));
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
                        $sheet->getStyle($colL . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
                        $sheet->getStyle($colL . $numeroFila)->getFont()->setColor(new Color('FF0000'));
                    }
                }
            }
        }

        // TOTAL DE DEDUCCIONES
        $sheet->setCellValue($colTotalDeduccionesLetter . $numeroFila, "=SUM({$colISRLetter}{$numeroFila}:{$lastDeduccionLetter}{$numeroFila})");
        $sheet->getStyle($colTotalDeduccionesLetter . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
        $sheet->getStyle($colTotalDeduccionesLetter . $numeroFila)->getFont()->setColor(new Color('FF0000'));

        // NETO A RECIBIR
        $sheet->setCellValue($colNetoRecibirLetter . $numeroFila, "={$colTotalPercepcionesLetter}{$numeroFila}-{$colTotalDeduccionesLetter}{$numeroFila}");
        $sheet->getStyle($colNetoRecibirLetter . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00');

        // DISPERSION DE TARJETA
        $tarjeta = $empleado['tarjeta'] ?? 0;
        if (!empty($tarjeta) && $tarjeta != 0) {
            $sheet->setCellValue($colTarjetaLetter . $numeroFila, $tarjeta);
            $sheet->getStyle($colTarjetaLetter . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
            $sheet->getStyle($colTarjetaLetter . $numeroFila)->getFont()->setColor(new Color('FF0000'));
        }

        // IMPORTE EN EFECTIVO
        $sheet->setCellValue($colEfectivoLetter . $numeroFila, "={$colNetoRecibirLetter}{$numeroFila}-{$colTarjetaLetter}{$numeroFila}");
        $sheet->getStyle($colEfectivoLetter . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00');

        // PRÉSTAMO
        $prestamo = $empleado['prestamo'] ?? 0;
        if (!empty($prestamo) && $prestamo != 0) {
            $sheet->setCellValue($colPrestamoLetter . $numeroFila, $prestamo);
            $sheet->getStyle($colPrestamoLetter . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
            $sheet->getStyle($colPrestamoLetter . $numeroFila)->getFont()->setColor(new Color('FF0000'));
        }

        // TOTAL A RECIBIR
        $sheet->setCellValue($colTotalRecibirLetter . $numeroFila, "={$colEfectivoLetter}{$numeroFila}-{$colPrestamoLetter}{$numeroFila}");
        $sheet->getStyle($colTotalRecibirLetter . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00');

        // REDONDEADO
        $sheet->setCellValue($colRedondeadoLetter . $numeroFila, "=ROUND({$colTotalRecibirLetter}{$numeroFila},0)-{$colTotalRecibirLetter}{$numeroFila}");
        $sheet->getStyle($colRedondeadoLetter . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00;[RED]-$#,##0.00');

        // TOTAL EFECTIVO REDONDEADO
        $sheet->setCellValue($colTotalRedondeadoLetter . $numeroFila, "={$colTotalRecibirLetter}{$numeroFila}+{$colRedondeadoLetter}{$numeroFila}");
        $sheet->getStyle($colTotalRedondeadoLetter . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00');

        // Alineación
        $sheet->getStyle('A' . $numeroFila . ':B' . $numeroFila)->getAlignment()->setHorizontal('center');
        $sheet->getStyle('A' . $numeroFila . ':B' . $numeroFila)->getAlignment()->setVertical('center');
        $sheet->getStyle('C' . $numeroFila)->getAlignment()->setHorizontal('left');
        $sheet->getStyle('C' . $numeroFila)->getAlignment()->setVertical('center');
        $sheet->getStyle('D' . $numeroFila)->getAlignment()->setHorizontal('center');
        $sheet->getStyle('D' . $numeroFila)->getAlignment()->setVertical('center');
        $sheet->getStyle("E{$numeroFila}:{$colTotalRedondeadoLetter}{$numeroFila}")->getAlignment()->setHorizontal('center');
        $sheet->getStyle("E{$numeroFila}:{$colTotalRedondeadoLetter}{$numeroFila}")->getAlignment()->setVertical('center');

        $numeroFila++;
        $numeroEmpleado++;
    }

    //=====================
    //  APLICAR FORMATOS A TODAS LAS CELDAS DE DATOS (INCLUSO VACIAS)
    //=====================

    // Columnas rojas (deducciones)
    $colsRojas = [
        $colISRLetter, $colIMSSLetter, $colINFONAVITLetter, $colAJUSTESLetter,
        $colAUSENTISMOLetter, $colUNIFORMESLetter, $colPERMISOSLetter, $colRETARDOSLetter, $colBIOMETRICOLetter
    ];
    foreach ($mapDeduccionesExtrasCols as $cIdx) {
        $colsRojas[] = Coordinate::stringFromColumnIndex($cIdx);
    }
    $colsRojas[] = $colTotalDeduccionesLetter;
    $colsRojas[] = $colTarjetaLetter;
    $colsRojas[] = $colPrestamoLetter;

    // Iterar sobre todas las filas de datos (7 hasta numeroFila-1)
    for ($fila = 7; $fila < $numeroFila; $fila++) {
        // Aplicar formato de moneda a todas las columnas de datos
        $sheet->getStyle("E{$fila}:{$colTotalRedondeadoLetter}{$fila}")->getNumberFormat()->setFormatCode('$#,##0.00');

        // Aplicar formato rojo con signo negativo a columnas de deducciones
        foreach ($colsRojas as $cL) {
            $sheet->getStyle($cL . $fila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
            $sheet->getStyle($cL . $fila)->getFont()->setColor(new Color('FF0000'));
        }

        // Formato condicional para REDONDEADO
        $sheet->getStyle($colRedondeadoLetter . $fila)->getNumberFormat()->setFormatCode('$#,##0.00;[RED]-$#,##0.00');
    }

    //=====================
    //  AGREGAR FILA DE TOTALES
    //=====================

    $filaTotal = $numeroFila;

    $sheet->setCellValue('A' . $filaTotal, 'TOTALES');
    $sheet->getStyle('A' . $filaTotal)->getFont()->setBold(true);
    $sheet->getStyle('A' . $filaTotal)->getAlignment()->setHorizontal('center');
    $sheet->getStyle('A' . $filaTotal)->getAlignment()->setVertical('center');

    // Agregar fórmulas SUM para cada columna de datos (desde D hasta colTotalRedondeado)
    $colsTotalesIndices = range(4, $colTotalRedondeado);
    foreach ($colsTotalesIndices as $idxC) {
        $cL = Coordinate::stringFromColumnIndex($idxC);
        $rangoSuma = $cL . '7:' . $cL . ($filaTotal - 1);
        $sheet->setCellValue($cL . $filaTotal, '=IF(SUM(' . $rangoSuma . ')=0,"",SUM(' . $rangoSuma . '))');
        $sheet->getStyle($cL . $filaTotal)->getFont()->setBold(true);
        $sheet->getStyle($cL . $filaTotal)->getFont()->setSize(14);

        if ($cL === 'D') {
            $sheet->getStyle($cL . $filaTotal)->getNumberFormat()->setFormatCode('0');
        } elseif (in_array($cL, $colsRojas)) {
            $sheet->getStyle($cL . $filaTotal)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
            $sheet->getStyle($cL . $filaTotal)->getFont()->setColor(new Color('FF0000'));
        } elseif ($cL === $colRedondeadoLetter) {
            $sheet->getStyle($cL . $filaTotal)->getNumberFormat()->setFormatCode('$#,##0.00;[RED]-$#,##0.00');
        } else {
            $sheet->getStyle($cL . $filaTotal)->getNumberFormat()->setFormatCode('$#,##0.00');
        }

        $sheet->getStyle($cL . $filaTotal)->getAlignment()->setHorizontal('center');
        $sheet->getStyle($cL . $filaTotal)->getAlignment()->setVertical('center');
    }

    // Altura y color de fondo
    $sheet->getRowDimension($filaTotal)->setRowHeight(25);
    $sheet->getStyle("A{$filaTotal}:{$lastColLetter}{$filaTotal}")->getFill()->setFillType('solid');
    $sheet->getStyle("A{$filaTotal}:{$lastColLetter}{$filaTotal}")->getFill()->getStartColor()->setRGB('D3D3D3');

    //=====================
    //  AGREGAR BORDES
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

    if (!$pasajeTieneDatos) {
        $sheet->getColumnDimension('F')->setVisible(false);
    }
    if (!$diasTrabajadosTieneDatos) {
        $sheet->getColumnDimension('D')->setVisible(false);
    }
    if (!$comidaTieneDatos) {
        $sheet->getColumnDimension('G')->setVisible(false);
    }
    if (!$isrTieneDatos) {
        $sheet->getColumnDimension($colISRLetter)->setVisible(false);
    }
    if (!$imssTieneDatos) {
        $sheet->getColumnDimension($colIMSSLetter)->setVisible(false);
    }
    if (!$infonavitTieneDatos) {
        $sheet->getColumnDimension($colINFONAVITLetter)->setVisible(false);
    }
    if (!$ajustesAlSubTieneDatos) {
        $sheet->getColumnDimension($colAJUSTESLetter)->setVisible(false);
    }
    if (!$ausentismoTieneDatos) {
        $sheet->getColumnDimension($colAUSENTISMOLetter)->setVisible(false);
    }
    if (!$uniformesTieneDatos) {
        $sheet->getColumnDimension($colUNIFORMESLetter)->setVisible(false);
    }
    if (!$permisoTieneDatos) {
        $sheet->getColumnDimension($colPERMISOSLetter)->setVisible(false);
    }
    if (!$retardosTieneDatos) {
        $sheet->getColumnDimension($colRETARDOSLetter)->setVisible(false);
    }
    if (!$checadorTieneDatos) {
        $sheet->getColumnDimension($colBIOMETRICOLetter)->setVisible(false);
    }


    //=====================
    //  CONFIGURAR ALTURA DE FILAS Y TAMAÑO DE LETRA
    //=====================

    $sheet->getRowDimension(1)->setRowHeight(38);
    $sheet->getRowDimension(2)->setRowHeight(32);
    $sheet->getRowDimension(3)->setRowHeight(32);
    $sheet->getRowDimension(4)->setRowHeight(32);
    $sheet->getRowDimension(5)->setRowHeight(35);
    $sheet->getRowDimension(6)->setRowHeight(45);

    $alturaFilas = 48;

    for ($fila = 7; $fila < $numeroFila; $fila++) {
        $sheet->getRowDimension($fila)->setRowHeight($alturaFilas);

        for ($idxC = 1; $idxC <= $totalCols; $idxC++) {
            $cL = Coordinate::stringFromColumnIndex($idxC);
            $s = 15;
            if ($cL === 'A' || $cL === 'B') $s = 14;
            elseif ($cL === 'C') $s = 16;
            elseif ($cL === 'D') $s = 15;
            $sheet->getStyle($cL . $fila)->getFont()->setSize($s);
        }
    }

    //=====================
    //  CONFIGURACIÓN DE PÁGINA
    //=====================

    $sheet->getPageSetup()->setPaperSize(PageSetup::PAPERSIZE_LETTER);
    $sheet->getPageSetup()->setOrientation(PageSetup::ORIENTATION_LANDSCAPE);
    $sheet->getPageMargins()->setLeft(0.5);
    $sheet->getPageMargins()->setRight(0.5);
    $sheet->getPageMargins()->setTop(0.5);
    $sheet->getPageMargins()->setBottom(0.5);
    $sheet->getPageSetup()->setFitToPage(true);
    $sheet->getPageSetup()->setFitToHeight(1);
    $sheet->getPageSetup()->setFitToWidth(1);
    $sheet->getPageSetup()->setPrintArea("A1:{$lastColLetter}{$filaTotal}");
}




/**
 * Resta un día a una fecha en formato 'DD/MM/AAA' con meses abreviados en español (ENE, FEB, MAR, etc.) y devuelve la nueva fecha en el mismo formato.
 */
function restarUnDia($fecha)
{
    // Mapeo de meses abreviados en español a número
    $meses = [
        "Ene" => 1,
        "Feb" => 2,
        "Mar" => 3,
        "Abr" => 4,
        "May" => 5,
        "Jun" => 6,
        "Jul" => 7,
        "Ago" => 8,
        "Sep" => 9,
        "Oct" => 10,
        "Nov" => 11,
        "Dic" => 12
    ];

    // Separar la fecha
    list($dia, $mesAbrev, $anio) = explode("/", $fecha);

    // Crear objeto DateTime
    $mesNum = $meses[$mesAbrev];
    $date = DateTime::createFromFormat("d/m/Y", "$dia/$mesNum/$anio");

    // Restar un día
    $date->modify("-1 day");

    // Buscar la abreviatura del mes resultante
    $mesAbrevNuevo = array_search((int) $date->format("m"), $meses);

    // Formatear resultado
    return $date->format("d") . "/" . $mesAbrevNuevo . "/" . $date->format("Y");
}

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
//  CREAR LAS DIFERENTES HOJAS
//=====================
//  BUCLE PRINCIPAL: CREAR UNA HOJA POR CADA COMBINACIÓN DE DEPTO Y EMPRESA
//=====================

if ($jsonNomina && isset($jsonNomina['departamentos'])) {
    foreach ($jsonNomina['departamentos'] as $departamento) {
        $nombreDepto = $departamento['nombre'] ?? 'S/N';
        $idDepto = $departamento['id_departamento'] ?? null;

        // Saltamos el departamento 'CORTE' ya que no se incluye en este reporte
        if (strtoupper($nombreDepto) === 'CORTE')
            continue;

        // Paso 1: Identificar qué empresas tienen empleados activos en este departamento
        $empresasEnDepto = [];
        if (isset($departamento['empleados'])) {
            foreach ($departamento['empleados'] as $emp) {
                if (($emp['mostrar'] ?? false) && isset($emp['id_empresa'])) {
                    $empresasEnDepto[] = $emp['id_empresa'];
                }
            }
        }
        // Eliminamos duplicados para tener una lista única de empresas por departamento
        $empresasEnDepto = array_unique($empresasEnDepto);

        // Si no hay empleados que mostrar en este depto, no generamos la hoja
        if (empty($empresasEnDepto))
            continue;

        // Paso 2: Por cada empresa encontrada, creamos una pestaña individual en el Excel
        foreach ($empresasEnDepto as $idEmpresa) {
            // Obtener nombre de la empresa desde la base de datos
            $nombreEmpresaFull = '';
            if ($idEmpresa) {
                $queryEmpresa = "SELECT nombre_empresa FROM empresa WHERE id_empresa = $idEmpresa";
                $resultEmpresa = mysqli_query($conexion, $queryEmpresa);
                if ($resultEmpresa && mysqli_num_rows($resultEmpresa) > 0) {
                    $rowEmpresa = mysqli_fetch_assoc($resultEmpresa);
                    $nombreEmpresaFull = $rowEmpresa['nombre_empresa'];
                }
            }

            // Si no se encontró el nombre, usar el mapa o un valor por defecto
            if (empty($nombreEmpresaFull)) {
                $nombreEmpresaFull = $mapaEmpresas[$idEmpresa] ?? 'EMP ' . $idEmpresa;
            }

            // Generamos el nombre de la pestaña: "DEPARTAMENTO - EMPRESA"
            $nombreHoja = mb_strtoupper($nombreDepto . ' - ' . $nombreEmpresaFull, 'UTF-8');
            $nombreHoja = mb_substr($nombreHoja, 0, 31, 'UTF-8'); // Límite de 31 caracteres para pestañas de Excel

            // Llamamos a la función que dibuja toda la estructura de la hoja
            crearHoja($spreadsheet, $departamento, $idEmpresa, function ($emp) use ($idDepto, $idEmpresa) {
                // Filtro dinámico: Solo incluir empleados de este departamento Y de esta empresa
                $idDeptoEmp = $emp['id_departamento'] ?? null;
                $idEmpresaEmp = $emp['id_empresa'] ?? null;
                $mostrar = $emp['mostrar'] ?? false;
                return ($mostrar && $idDeptoEmp == $idDepto && $idEmpresaEmp == $idEmpresa);
            }, $nombreHoja);
        }
    }
}




//=====================
//  DESCARGAR ARCHIVO
//=====================

$writer = new Xlsx($spreadsheet);

$filename = 'SEM ' . str_pad($numero_semana, 2, '0', STR_PAD_LEFT) . ' - ' . $ano . ' RANCHO RELICARIO NOMINAS COMPLETAS - ' . date('Y-m-d_H-i-s') . '.xlsx';

header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
header('Content-Disposition: attachment; filename="' . $filename . '"');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

$writer->save('php://output');
exit;