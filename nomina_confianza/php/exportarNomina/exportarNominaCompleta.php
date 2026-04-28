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

$columnas = [
    'N°',
    'CD',
    'NOMBRE',
    'DIAS TRAB.',
    'SUELDO SEMANAL',
    'PASAJE',
    'COMIDA',
    'EXTRAS',
    'TOTAL PERCEPCIONES',
    'ISR',
    'IMSS',
    'INFONAVIT',
    'AJUSTES AL SUB',
    'AUSENTISMO',
    'UNIFORMES',
    'PERMISOS',
    'RETARDOS',
    'BIOMETRICO',
    'F.A/GAFET/COFIA',
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

$columnasAncho = [
    'A' => 12,   // N°
    'B' => 14,   // CD
    'C' => 65,  // NOMBRE
    'D' => 14,  // DIAS TRAB.
    'E' => 22,  // SUELDO SEMANAL
    'F' => 20,  // PASAJE
    'G' => 20,  // COMIDA
    'H' => 20,  // EXTRAS
    'I' => 22,  // TOTAL PERCEPCIONES
    'J' => 20,  // ISR
    'K' => 20,  // IMSS
    'L' => 20,  // INFONAVIT
    'M' => 22,  // AJUSTES AL SUB
    'N' => 21,  // AUSENTISMO
    'O' => 20,  // UNIFORMES
    'P' => 20,  // PERMISOS
    'Q' => 20,  // RETARDOS
    'R' => 20,  // CHECADOR
    'S' => 22,  // F.A/GAFET/COFIA
    'T' => 22,  // TOTAL DE DEDUCCIONES
    'U' => 22,  // NETO A RECIBIR
    'V' => 22,  // DISPERSION DE TARJETA
    'W' => 22,  // IMPORTE EN EFECTIVO
    'X' => 22,  // PRÉSTAMO
    'Y' => 22,  // TOTAL A RECIBIR
    'Z' => 20,  // REDONDEADO
    'AA' => 23, // TOTAL EFECTIVO REDONDEADO
    'AB' => 25  // FIRMA RECIBIDO
];

$tamanioLetraColumnas = [
    'A' => 14,  // N°
    'B' => 14,  // CD
    'C' => 14,  // NOMBRE
    'D' => 14,  // DIAS TRAB.
    'E' => 14,  // SUELDO SEMANAL
    'F' => 14,  // PASAJE
    'G' => 14,  // COMIDA
    'H' => 14,  // EXTRAS
    'I' => 13,  // TOTAL PERCEPCIONES
    'J' => 14,  // ISR
    'K' => 14,  // IMSS
    'L' => 14,  // INFONAVIT
    'M' => 14,  // AJUSTES AL SUB
    'N' => 14,  // AUSENTISMO
    'O' => 14,  // UNIFORMES
    'P' => 14,  // PERMISOS
    'Q' => 14,  // RETARDOS
    'R' => 14,  // CHECADOR
    'S' => 13,  // F.A/GAFET/COFIA
    'T' => 13,  // TOTAL DE DEDUCCIONES
    'U' => 13,  // NETO A RECIBIR
    'V' => 13,  // DISPERSION DE TARJETA
    'W' => 13,  // IMPORTE EN EFECTIVO
    'X' => 14,  // PRÉSTAMO
    'Y' => 13,  // TOTAL A RECIBIR
    'Z' => 14,  // REDONDEADO
    'AA' => 13, // TOTAL EFECTIVO REDONDEADO
    'AB' => 14  // FIRMA RECIBIDO
];

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


//=====================
//  FUNCIÓN PARA CREAR UNA HOJA
//=====================

function crearHoja($spreadsheet, $deptoData, $targetEmpresaId, $filtroEmpleados, $nombreHoja)
{
    global $jsonNomina, $columnas, $columnasAncho, $tamanioLetraColumnas, $tamanioLetraFilas, $fecha_inicio, $fecha_cierre, $numero_semana, $ano;

    $nombreDepto = $deptoData['nombre'] ?? 'DEPARTAMENTO';
    $colorExcel = $deptoData['color_reporte'] ?? 'FF0000';
    $colorExcel = str_replace('#', '', $colorExcel);
    $nombreEmpresaTarget = 'CITRICOS SAAO';

    // Ajustar colores y nombres según la empresa target
    if ($targetEmpresaId == 2) {
        $nombreEmpresaTarget = 'SB CITRIC´S GROUP';
        $colorExcel = 'A9D08E';
    }
    
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

    // Mergear las celdas para que los títulos ocupen toda la tabla
    $sheet->mergeCells('A1:AB1');
    $sheet->mergeCells('A2:AB2');
    $sheet->mergeCells('A3:AB3');
    $sheet->mergeCells('A4:AB4');

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

    // Insertar logo dinámico
    $logoPath = '../../../public/img/logo.jpg';
    if ($targetEmpresaId == 2) {
        if (file_exists('../../../public/img/sbgroup_logo.PNG')) {
            $logoPath = '../../../public/img/sbgroup_logo.PNG';
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
    $columnaLetra = 'A';
    foreach ($columnas as $columna) {
        $sheet->setCellValue($columnaLetra . '6', $columna);
        $columnaLetra++;
    }

    // Formatear los encabezados
    $sheet->getStyle('A6:AB6')->getFont()->setBold(true);
    $sheet->getStyle('A6:AB6')->getFont()->setSize(10);
    $sheet->getStyle('A6:AB6')->getFont()->setColor(new Color($textColor));
    $sheet->getStyle('A6:AB6')->getAlignment()->setHorizontal('center');
    $sheet->getStyle('A6:AB6')->getAlignment()->setVertical('center');
    $sheet->getStyle('A6:AB6')->getAlignment()->setWrapText(true);

    // Agregar color de fondo dinámico a los encabezados
    $sheet->getStyle('A6:AB6')->getFill()->setFillType('solid');
    $sheet->getStyle('A6:AB6')->getFill()->getStartColor()->setRGB($colorExcel);

    // Ajustar el ancho de las columnas
    foreach ($columnasAncho as $columna => $ancho) {
        $sheet->getColumnDimension($columna)->setWidth($ancho);
    }

    // Aplicar tamaño de letra a los encabezados (fila 6)
    foreach ($tamanioLetraColumnas as $columna => $tamanio) {
        $sheet->getStyle($columna . '6')->getFont()->setSize($tamanio);
    }


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

        $sueldoExtraTotal = $empleado['sueldo_extra_total'] ?? 0;
        if (!empty($sueldoExtraTotal) && $sueldoExtraTotal != 0) {
            $sheet->setCellValue('H' . $numeroFila, $sueldoExtraTotal);
            $sheet->getStyle('H' . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00');
        }

        // TOTAL PERCEPCIONES
        $columnasParaSumar = ['E', 'F'];
        if ($comidaTieneDatos)
            $columnasParaSumar[] = 'G';
        $columnasParaSumar[] = 'H';

        $primeraColumna = reset($columnasParaSumar);
        $ultimaColumna = end($columnasParaSumar);
        $sheet->setCellValue('I' . $numeroFila, '=SUM(' . $primeraColumna . $numeroFila . ':' . $ultimaColumna . $numeroFila . ')');
        $sheet->getStyle('I' . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00');

        //=============================
        //  AGREGAR DEDUCCIONES 
        //=============================

        $mapeoConceptos = [
            '45' => 'J',   // ISR
            '52' => 'K',   // IMSS
            '16' => 'L',   // INFONAVIT
            '107' => 'M',   // AJUSTES AL SUB
        ];

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

        // Descuentos adicionales (AUSENTISMO, PERMISO, RETARDOS, UNIFORMES, CHECADOR, F.A/GAFET/COFIA)
        $inasistencia = $empleado['inasistencia'] ?? 0;
        if (!empty($inasistencia) && $inasistencia != 0) {
            $sheet->setCellValue('N' . $numeroFila, $inasistencia);
            $sheet->getStyle('N' . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
            $sheet->getStyle('N' . $numeroFila)->getFont()->setColor(new Color('FF0000'));
        }

        $uniformes = $empleado['uniformes'] ?? 0;
        if (!empty($uniformes) && $uniformes != 0) {
            $sheet->setCellValue('O' . $numeroFila, $uniformes);
            $sheet->getStyle('O' . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
            $sheet->getStyle('O' . $numeroFila)->getFont()->setColor(new Color('FF0000'));
        }

        $permiso = $empleado['permiso'] ?? 0;
        if (!empty($permiso) && $permiso != 0) {
            $sheet->setCellValue('P' . $numeroFila, $permiso);
            $sheet->getStyle('P' . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
            $sheet->getStyle('P' . $numeroFila)->getFont()->setColor(new Color('FF0000'));
        }

        $retardos = $empleado['retardos'] ?? 0;
        if (!empty($retardos) && $retardos != 0) {
            $sheet->setCellValue('Q' . $numeroFila, $retardos);
            $sheet->getStyle('Q' . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
            $sheet->getStyle('Q' . $numeroFila)->getFont()->setColor(new Color('FF0000'));
        }

        $checador = $empleado['checador'] ?? 0;
        if (!empty($checador) && $checador != 0) {
            $sheet->setCellValue('R' . $numeroFila, $checador);
            $sheet->getStyle('R' . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
            $sheet->getStyle('R' . $numeroFila)->getFont()->setColor(new Color('FF0000'));
        }

        $faxGafetCofia = $empleado['fa_gafet_cofia'] ?? 0;
        if (!empty($faxGafetCofia) && $faxGafetCofia != 0) {
            $sheet->setCellValue('S' . $numeroFila, $faxGafetCofia);
            $sheet->getStyle('S' . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
            $sheet->getStyle('S' . $numeroFila)->getFont()->setColor(new Color('FF0000'));
        }

        // TOTAL DE DEDUCCIONES
        $sheet->setCellValue('T' . $numeroFila, '=SUM(J' . $numeroFila . ':S' . $numeroFila . ')');
        $sheet->getStyle('T' . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
        $sheet->getStyle('T' . $numeroFila)->getFont()->setColor(new Color('FF0000'));

        // NETO A RECIBIR
        $sheet->setCellValue('U' . $numeroFila, '=I' . $numeroFila . '-T' . $numeroFila);
        $sheet->getStyle('U' . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00');

        // DISPERSION DE TARJETA
        $tarjeta = $empleado['tarjeta'] ?? 0;
        if (!empty($tarjeta) && $tarjeta != 0) {
            $sheet->setCellValue('V' . $numeroFila, $tarjeta);
            $sheet->getStyle('V' . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
            $sheet->getStyle('V' . $numeroFila)->getFont()->setColor(new Color('FF0000'));
        }

        // IMPORTE EN EFECTIVO
        $sheet->setCellValue('W' . $numeroFila, '=U' . $numeroFila . '-V' . $numeroFila);
        $sheet->getStyle('W' . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00');

        // PRÉSTAMO
        $prestamo = $empleado['prestamo'] ?? 0;
        if (!empty($prestamo) && $prestamo != 0) {
            $sheet->setCellValue('X' . $numeroFila, $prestamo);
            $sheet->getStyle('X' . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
            $sheet->getStyle('X' . $numeroFila)->getFont()->setColor(new Color('FF0000'));
        }

        // TOTAL A RECIBIR
        $sheet->setCellValue('Y' . $numeroFila, '=W' . $numeroFila . '-X' . $numeroFila);
        $sheet->getStyle('Y' . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00');

        // REDONDEADO
        $sheet->setCellValue('Z' . $numeroFila, '=ROUND(Y' . $numeroFila . ',0)-Y' . $numeroFila);
        $sheet->getStyle('Z' . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00;[RED]-$#,##0.00');

        // TOTAL EFECTIVO REDONDEADO
        $sheet->setCellValue('AA' . $numeroFila, '=Y' . $numeroFila . '+Z' . $numeroFila);
        $sheet->getStyle('AA' . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00');

        // Alineación
        $sheet->getStyle('A' . $numeroFila . ':B' . $numeroFila)->getAlignment()->setHorizontal('center');
        $sheet->getStyle('A' . $numeroFila . ':B' . $numeroFila)->getAlignment()->setVertical('center');
        $sheet->getStyle('C' . $numeroFila)->getAlignment()->setHorizontal('left');
        $sheet->getStyle('C' . $numeroFila)->getAlignment()->setVertical('center');
        $sheet->getStyle('D' . $numeroFila)->getAlignment()->setHorizontal('center');
        $sheet->getStyle('D' . $numeroFila)->getAlignment()->setVertical('center');
        $sheet->getStyle('E' . $numeroFila . ':AB' . $numeroFila)->getAlignment()->setHorizontal('center');
        $sheet->getStyle('E' . $numeroFila . ':AB' . $numeroFila)->getAlignment()->setVertical('center');

        $numeroFila++;
        $numeroEmpleado++;
    }

    //=====================
    //  APLICAR FORMATOS A TODAS LAS CELDAS DE DATOS (INCLUSO VACIAS)
    //=====================

    // Iterar sobre todas las filas de datos (7 hasta numeroFila-1)
    for ($fila = 7; $fila < $numeroFila; $fila++) {
        // Columnas con formato deducciones: J-M (ISR, IMSS, INFONAVIT, AJUSTES AL SUB)
        for ($col = 'J'; $col <= 'M'; $col++) {
            $sheet->getStyle($col . $fila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
            $sheet->getStyle($col . $fila)->getFont()->setColor(new Color('FF0000'));
        }

        // Columnas con formato descuentos Adicionales: N-S (AUSENTISMO, UNIFORMES, PERMISOS, RETARDOS, CHECADOR, F.A/GAFET/COFIA)
        for ($col = 'N'; $col <= 'S'; $col++) {
            $sheet->getStyle($col . $fila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
            $sheet->getStyle($col . $fila)->getFont()->setColor(new Color('FF0000'));
        }

        // Columna T: TOTAL DE DEDUCCIONES (rojo con signo negativo)
        $sheet->getStyle('T' . $fila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
        $sheet->getStyle('T' . $fila)->getFont()->setColor(new Color('FF0000'));

        // Columna V: DISPERSION DE TARJETA (rojo con signo negativo)
        $sheet->getStyle('V' . $fila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
        $sheet->getStyle('V' . $fila)->getFont()->setColor(new Color('FF0000'));

        // Columna X: PRESTAMO (rojo con signo negativo)
        $sheet->getStyle('X' . $fila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
        $sheet->getStyle('X' . $fila)->getFont()->setColor(new Color('FF0000'));

        // Columna Z: REDONDEADO (formato condicional: positivo normal, negativo rojo)
        $sheet->getStyle('Z' . $fila)->getNumberFormat()->setFormatCode('$#,##0.00;[RED]-$#,##0.00');

        // Columnas de moneda normal: E, F, G, H, I, U, W, Y, AA
        foreach (['E', 'F', 'G', 'H', 'I', 'U', 'W', 'Y', 'AA'] as $col) {
            $sheet->getStyle($col . $fila)->getNumberFormat()->setFormatCode('$#,##0.00');
        }
    }

    //=====================
    //  AGREGAR FILA DE TOTALES
    //=====================

    $filaTotal = $numeroFila;

    $sheet->setCellValue('A' . $filaTotal, 'TOTALES');
    $sheet->getStyle('A' . $filaTotal)->getFont()->setBold(true);
    $sheet->getStyle('A' . $filaTotal)->getAlignment()->setHorizontal('center');
    $sheet->getStyle('A' . $filaTotal)->getAlignment()->setVertical('center');

    $columnasData = ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA'];

    foreach ($columnasData as $columna) {
        $rangoSuma = $columna . '7:' . $columna . ($filaTotal - 1);
        $sheet->setCellValue($columna . $filaTotal, '=IF(SUM(' . $rangoSuma . ')=0,"",SUM(' . $rangoSuma . '))');
        $sheet->getStyle($columna . $filaTotal)->getFont()->setBold(true);
        $sheet->getStyle($columna . $filaTotal)->getFont()->setSize(14);

        if ($columna === 'D') {
            $sheet->getStyle($columna . $filaTotal)->getNumberFormat()->setFormatCode('0');
        } elseif (in_array($columna, ['J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'V', 'X'])) {
            $sheet->getStyle($columna . $filaTotal)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
            $sheet->getStyle($columna . $filaTotal)->getFont()->setColor(new Color('FF0000'));
        } elseif ($columna === 'Z') {
            $sheet->getStyle($columna . $filaTotal)->getNumberFormat()->setFormatCode('$#,##0.00;[RED]-$#,##0.00');
        } else {
            $sheet->getStyle($columna . $filaTotal)->getNumberFormat()->setFormatCode('$#,##0.00');
        }

        $sheet->getStyle($columna . $filaTotal)->getAlignment()->setHorizontal('center');
        $sheet->getStyle($columna . $filaTotal)->getAlignment()->setVertical('center');
    }

    // Altura y color de fondo
    $sheet->getRowDimension($filaTotal)->setRowHeight(25);
    $sheet->getStyle('A' . $filaTotal . ':AB' . $filaTotal)->getFill()->setFillType('solid');
    $sheet->getStyle('A' . $filaTotal . ':AB' . $filaTotal)->getFill()->getStartColor()->setRGB('D3D3D3');

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

    $sheet->getStyle('A6:AB' . $filaTotal)->applyFromArray($estiloBordesTabla);

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
        $sheet->getColumnDimension('J')->setVisible(false);
    }
    if (!$imssTieneDatos) {
        $sheet->getColumnDimension('K')->setVisible(false);
    }
    if (!$infonavitTieneDatos) {
        $sheet->getColumnDimension('L')->setVisible(false);
    }
    if (!$ajustesAlSubTieneDatos) {
        $sheet->getColumnDimension('M')->setVisible(false);
    }
    if (!$ausentismoTieneDatos) {
        $sheet->getColumnDimension('N')->setVisible(false);
    }
    if (!$uniformesTieneDatos) {
        $sheet->getColumnDimension('O')->setVisible(false);
    }
    if (!$permisoTieneDatos) {
        $sheet->getColumnDimension('P')->setVisible(false);
    }
    if (!$retardosTieneDatos) {
        $sheet->getColumnDimension('Q')->setVisible(false);
    }
    if (!$checadorTieneDatos) {
        $sheet->getColumnDimension('R')->setVisible(false);
    }
    if (!$faxGafetCofiaTieneDatos) {
        $sheet->getColumnDimension('S')->setVisible(false);
    }

    // Ocultar columnas de totales permanentemente
    $sheet->getColumnDimension('I')->setVisible(false);
    $sheet->getColumnDimension('T')->setVisible(false);

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

        foreach ($tamanioLetraFilas as $columna => $tamanio) {
            $sheet->getStyle($columna . $fila)->getFont()->setSize($tamanio);
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
    $sheet->getPageSetup()->setPrintArea('A1:AB' . $filaTotal);
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

if ($jsonNomina && isset($jsonNomina['departamentos'])) {
    foreach ($jsonNomina['departamentos'] as $departamento) {
        $nombreDepto = $departamento['nombre'] ?? 'S/N';
        $idDepto = $departamento['id_departamento'] ?? null;

        // Omitir Corte por completo
        if (strtoupper($nombreDepto) === 'CORTE')
            continue;

        // Identificar empresas únicas que tienen empleados en este departamento
        $empresasEnDepto = [];
        if (isset($departamento['empleados'])) {
            foreach ($departamento['empleados'] as $emp) {
                if (($emp['mostrar'] ?? false) && isset($emp['id_empresa'])) {
                    $empresasEnDepto[] = $emp['id_empresa'];
                }
            }
        }
        $empresasEnDepto = array_unique($empresasEnDepto);

        // Si no hay empleados, no crear hoja
        if (empty($empresasEnDepto))
            continue;

        $totalEmpresas = count($empresasEnDepto);

        foreach ($empresasEnDepto as $idEmpresa) {
            if ($totalEmpresas > 1) {
                // Si hay más de una empresa, añadir sufijo descriptivo
                $aliasEmpresa = ($idEmpresa == 2) ? 'SB GROUP' : 'CITRICOS';
                $nombreHoja = substr(strtoupper($nombreDepto), 0, 20) . ' - ' . $aliasEmpresa;
            } else {
                // Si es una sola empresa, usar solo el nombre del departamento
                $nombreHoja = substr(strtoupper($nombreDepto), 0, 31);
            }

            crearHoja($spreadsheet, $departamento, $idEmpresa, function ($emp) use ($idDepto, $idEmpresa) {
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
