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
    'AA' => 15  // TOTAL EFECTIVO REDONDEADO
];

// Columnas para el corte de limon
$encabezados_corte = [
    'A' => 'N°', // Número consecutivo
    'B' => 'NOMBRE', // Nombre del empleado
    'C' => 'CONCEPTO', // NOMINA o REJA
    'D' => 'V', // Viernes
    'E' => 'SA', // Sábado
    'F' => 'DO', // Domingo
    'G' => 'L', // Lunes
    'H' => 'MA', // Martes
    'I' => 'MI', // Miércoles
    'J' => 'J', // Jueves
    'K' => 'TOTAL REJAS', // Solo para el concepto REJA: suma de rejas por día
    'L' => 'PRECIO POR REJA', // Solo para el concepto REJA: precio por reja
    'M' => 'TOTAL EFECTIVO', // Para NOMINA: suma de pagos por día; para REJA: Total Rejas * Precio por Reja
];

// Ancho de columnas para el corte de limon
$anchos_corte = [
    'A' => 10,   // N°
    'B' => 38,  // NOMBRE
    'C' => 14,  // CONCEPTO
    'D' => 10,  // V
    'E' => 10,  // SA
    'F' => 10,  // DO
    'G' => 10,  // L
    'H' => 10,  // MA
    'I' => 10,  // MI
    'J' => 10,  // J
    'K' => 14,  // TOTAL REJAS
    'L' => 16,  // PRECIO POR REJA
    'M' => 16,  // TOTAL EFECTIVO
];

//=====================
//  FUNCIÓN PARA CREAR UNA HOJA
//=====================

function crearHoja($spreadsheet, $titulo2, $filtroEmpleados, $nombreHoja)
{
    global $jsonNomina, $columnas, $columnasAncho, $tamanioLetraColumnas, $tamanioLetraFilas, $fecha_inicio, $fecha_cierre, $numero_semana, $ano;

    // Crear una nueva hoja o usar la existente (si el libro está recién creado)
    if ($spreadsheet->getSheetCount() === 1 && $spreadsheet->getActiveSheet()->getTitle() === 'Worksheet') {
        $sheet = $spreadsheet->getActiveSheet();
    } else {
        $sheet = $spreadsheet->createSheet();
    }

    $sheet->setTitle($nombreHoja);

    //=====================
    //  TÍTULOS
    //=====================

    $titulo1 = 'RANCHO EL PILAR';
    $titulo3 = 'NOMINA DEL ' . strtoupper($fecha_inicio) . ' AL ' . strtoupper($fecha_cierre);
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

    // Formatear título 1 - RANCHO EL PILAR (Purpura, Negrita, Tamaño 24)
    $sheet->getStyle('A1')->getFont()->setBold(true);
    $sheet->getStyle('A1')->getFont()->setSize(24);
    $sheet->getStyle('A1')->getFont()->setColor(new Color('7030A0'));

    // Formatear título 2 (Negrita, Tamaño 20)
    $sheet->getStyle('A2')->getFont()->setBold(true);
    $sheet->getStyle('A2')->getFont()->setSize(20);
    $sheet->getStyle('A2')->getFont()->setColor(new Color('DBADFF'));

    // Formatear título 3 - NOMINA (Negrita, Tamaño 14)
    $sheet->getStyle('A3')->getFont()->setBold(true);
    $sheet->getStyle('A3')->getFont()->setSize(14);

    // Formatear título 4 - SEMANA (Negrita, Tamaño 14)
    $sheet->getStyle('A4')->getFont()->setBold(true);
    $sheet->getStyle('A4')->getFont()->setSize(14);

    // Centrar todos los títulos
    $sheet->getStyle('A1:A4')->getAlignment()->setHorizontal('center');

    // Insertar logo a la derecha de los títulos
    $logoPath = '../../../public/img/logo.jpg';
    if (file_exists($logoPath)) {
        $logo = new Drawing();
        $logo->setName('Logo');
        $logo->setDescription('Logo de Rancho El Relicario');
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

    // Formatear los encabezados (Negrita, Centrados, Tamaño 10, Fondo Rojo, Letra Blanca)
    $sheet->getStyle('A6:AB6')->getFont()->setBold(true);
    $sheet->getStyle('A6:AB6')->getFont()->setSize(10);
    $sheet->getStyle('A6:AB6')->getFont()->setColor(new Color('000000')); // Letra negra
    $sheet->getStyle('A6:AB6')->getAlignment()->setHorizontal('center');
    $sheet->getStyle('A6:AB6')->getAlignment()->setVertical('center');
    $sheet->getStyle('A6:AB6')->getAlignment()->setWrapText(true);

    // Agregar color de fondo rojo a los encabezados
    $sheet->getStyle('A6:AB6')->getFill()->setFillType('solid');
    $sheet->getStyle('A6:AB6')->getFill()->getStartColor()->setRGB('E5C8E6'); // Rojo

    // Ajustar el ancho de las columnas
    foreach ($columnasAncho as $columna => $ancho) {
        $sheet->getColumnDimension($columna)->setWidth($ancho);
    }

    // Aplicar tamaño de letra a los encabezados (fila 6)
    foreach ($tamanioLetraColumnas as $columna => $tamanio) {
        $sheet->getStyle($columna . '6')->getFont()->setSize($tamanio);
    }

    //=====================
    //  AGREGAR DATOS DE EMPLEADOS
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

    // Ordenar empleados por nombre (orden ascendente A-Z)
    usort($empleados, function ($a, $b) {
        return strcmp($a['nombre'] ?? '', $b['nombre'] ?? '');
    });

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
                    if ($codigo === '45') $isrTieneDatos = true;
                    if ($codigo === '52') $imssTieneDatos = true;
                    if ($codigo === '16') $infonavitTieneDatos = true;
                    if ($codigo === '107') $ajustesAlSubTieneDatos = true;
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
        if ($comidaTieneDatos) $columnasParaSumar[] = 'G';
        $columnasParaSumar[] = 'H';

        $primeraColumna = reset($columnasParaSumar);
        $ultimaColumna = end($columnasParaSumar);
        $sheet->setCellValue('I' . $numeroFila, '=SUM(' . $primeraColumna . $numeroFila . ':' . $ultimaColumna . $numeroFila . ')');
        $sheet->getStyle('I' . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00');

        //=============================
        //  AGREGAR DEDUCCIONES 
        //=============================

        $mapeoConceptos = [
            '45'  => 'J',   // ISR
            '52'  => 'K',   // IMSS
            '16'  => 'L',   // INFONAVIT
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
    //  APLICAR FORMATOS A TODAS LAS CELDAS DE DATOS
    //=====================

    for ($fila = 7; $fila < $numeroFila; $fila++) {
        for ($col = 'J'; $col <= 'M'; $col++) {
            $sheet->getStyle($col . $fila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
            $sheet->getStyle($col . $fila)->getFont()->setColor(new Color('FF0000'));
        }

        for ($col = 'N'; $col <= 'S'; $col++) {
            $sheet->getStyle($col . $fila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
            $sheet->getStyle($col . $fila)->getFont()->setColor(new Color('FF0000'));
        }

        $sheet->getStyle('T' . $fila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
        $sheet->getStyle('T' . $fila)->getFont()->setColor(new Color('FF0000'));
        $sheet->getStyle('V' . $fila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
        $sheet->getStyle('V' . $fila)->getFont()->setColor(new Color('FF0000'));
        $sheet->getStyle('X' . $fila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
        $sheet->getStyle('X' . $fila)->getFont()->setColor(new Color('FF0000'));
        $sheet->getStyle('Z' . $fila)->getNumberFormat()->setFormatCode('$#,##0.00;[RED]-$#,##0.00');

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



//==============================
//  FUNCIONES AUXILIARES CORTE
//==============================

/**
 * Obtiene el nombre del día de la semana en español a partir de una fecha 'YYYY-MM-DD'
 */
function obtenerDiaSemanaCorte(string $fechaStr): string
{
    [$anio, $mes, $dia] = array_map('intval', explode('-', $fechaStr));
    $timestamp = mktime(0, 0, 0, $mes, $dia, $anio);
    $dias = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
    return $dias[(int)date('w', $timestamp)];
}

/**
 * Agrupa los tickets de un empleado por precio_reja
 */
function agruparTicketsPorPrecio(array $tickets): array
{
    $agrupados = [];
    foreach ($tickets as $ticket) {
        $precio = (string)$ticket['precio_reja'];
        $agrupados[$precio][] = $ticket;
    }
    return $agrupados;
}

/**
 * Procesa un grupo de tickets (mismo precio) y retorna los datos de la fila
 */
function procesarTicketsParaFila(string $nombre, string $concepto, array $tickets, float $precio): array
{
    $rejasPorDia = ['VIERNES' => 0, 'SABADO' => 0, 'DOMINGO' => 0, 'LUNES' => 0, 'MARTES' => 0, 'MIERCOLES' => 0, 'JUEVES' => 0];

    foreach ($tickets as $ticket) {
        $dia = obtenerDiaSemanaCorte($ticket['fecha']);
        $rejasTicket = array_sum(array_column($ticket['datosRejas'], 'cantidad'));
        if (array_key_exists($dia, $rejasPorDia)) {
            $rejasPorDia[$dia] += $rejasTicket;
        }
    }

    return [
        'nombre'        => $nombre,
        'concepto'      => $concepto,
        'viernes'       => $rejasPorDia['VIERNES'],
        'sabado'        => $rejasPorDia['SABADO'],
        'domingo'       => $rejasPorDia['DOMINGO'],
        'lunes'         => $rejasPorDia['LUNES'],
        'martes'        => $rejasPorDia['MARTES'],
        'miercoles'     => $rejasPorDia['MIERCOLES'],
        'jueves'        => $rejasPorDia['JUEVES'],
        'precio'        => $precio,
        'tipoConcepto'  => 'REJA',
    ];
}

/**
 * Procesa la nómina de un empleado y retorna los datos de la fila
 */
function procesarNominaParaFila(string $nombre, string $concepto, array $nomina): array
{
    $pagosPorDia = ['VIERNES' => 0.0, 'SABADO' => 0.0, 'DOMINGO' => 0.0, 'LUNES' => 0.0, 'MARTES' => 0.0, 'MIERCOLES' => 0.0, 'JUEVES' => 0.0];

    foreach ($nomina as $diaPago) {
        $dia  = strtoupper($diaPago['dia']);
        $pago = (float)($diaPago['pago'] ?? 0);
        if (array_key_exists($dia, $pagosPorDia)) {
            $pagosPorDia[$dia] = $pago;
        }
    }

    return [
        'nombre'       => $nombre,
        'concepto'     => $concepto,
        'viernes'      => $pagosPorDia['VIERNES'],
        'sabado'       => $pagosPorDia['SABADO'],
        'domingo'      => $pagosPorDia['DOMINGO'],
        'lunes'        => $pagosPorDia['LUNES'],
        'martes'       => $pagosPorDia['MARTES'],
        'miercoles'    => $pagosPorDia['MIERCOLES'],
        'jueves'       => $pagosPorDia['JUEVES'],
        'tipoConcepto' => 'NOMINA',
    ];
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
    $mesAbrevNuevo = array_search((int)$date->format("m"), $meses);

    // Formatear resultado
    return $date->format("d") . "/" . $mesAbrevNuevo . "/" . $date->format("Y");
}

/**
 * Genera un rango de fechas entre dos fechas dadas en formato 'DD/MM/AAA' con meses abreviados en español (ENE, FEB, MAR, etc.) y devuelve un array con todas las fechas del rango en el mismo formato.
 */
function rangoDeFechas($fechaInicio, $fechaFin)
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

    // Separar fecha inicio
    list($diaIni, $mesIni, $anioIni) = explode("/", $fechaInicio);
    $mesNumIni = $meses[$mesIni];
    $dateIni = DateTime::createFromFormat("d/m/Y", "$diaIni/$mesNumIni/$anioIni");

    // Separar fecha fin
    list($diaFin, $mesFin, $anioFin) = explode("/", $fechaFin);
    $mesNumFin = $meses[$mesFin];
    $dateFin = DateTime::createFromFormat("d/m/Y", "$diaFin/$mesNumFin/$anioFin");

    // Crear rango de fechas
    $intervalo = new DateInterval("P1D");
    $periodo = new DatePeriod($dateIni, $intervalo, $dateFin->modify("+1 day"));

    $resultado = [];
    foreach ($periodo as $fecha) {
        // Convertir número de mes a abreviatura
        $mesAbrev = array_search((int)$fecha->format("m"), $meses);
        $resultado[] = $fecha->format("d") . "/" . $mesAbrev . "/" . $fecha->format("Y");
    }

    return $resultado;
}



// ========================================
// FUNCION PARA CREAR HOJA DE CORTE (REJAS)
// ========================================
function crearHojaCorte($spreadsheet, $titulo2, $jsonNomina, $nombreHoja)
{
    global $jsonNomina, $encabezados_corte, $anchos_corte, $fecha_inicio, $fecha_cierre, $numero_semana, $ano;

    //=====================
    //  PROCESAR FILAS DEL DEPARTAMENTO CORTE
    //=====================

    $filasCorte = [];

    if ($jsonNomina && isset($jsonNomina['departamentos'])) {
        foreach ($jsonNomina['departamentos'] as $departamento) {
            if (($departamento['nombre'] ?? '') !== 'Corte') continue;

            foreach ($departamento['empleados'] ?? [] as $empleado) {
                $concepto = $empleado['concepto'] ?? '';
                $nombre   = $empleado['nombre']   ?? '';

                if ($concepto === 'REJA' && !empty($empleado['tickets'])) {
                    $grupos = agruparTicketsPorPrecio($empleado['tickets']);
                    foreach ($grupos as $precio => $ticketsGrupo) {
                        $filasCorte[] = procesarTicketsParaFila($nombre, $concepto, $ticketsGrupo, (float)$precio);
                    }
                } elseif ($concepto === 'NOMINA' && !empty($empleado['nomina'])) {
                    $filasCorte[] = procesarNominaParaFila($nombre, $concepto, $empleado['nomina']);
                }
            }
        }
    }

    // Crear una nueva hoja o usar la existente
    if ($nombreHoja === 'JORNALERO BASE') {
        $sheet = $spreadsheet->getActiveSheet();
    } else {
        $sheet = $spreadsheet->createSheet();
    }

    $sheet->setTitle($nombreHoja);

    // Poner los titulos, logo y estilos

    $titulo1 = 'RANCHO EL PILAR';
    // $titulo2 = 'REJAS DE CORTE DE LIMON';
    $titulo3 = 'NOMINA DEL ' . strtoupper($fecha_inicio) . ' AL ' . strtoupper($fecha_cierre);
    $titulo4 = 'SEMANA ' . (isset($jsonNomina['numero_semana']) ? str_pad($jsonNomina['numero_semana'], 2, '0', STR_PAD_LEFT) : '00') . ' - ' . $ano;

    $sheet->setCellValue('A1', $titulo1);
    $sheet->setCellValue('A2', $titulo2);
    $sheet->setCellValue('A3', $titulo3);
    $sheet->setCellValue('A4', $titulo4);

    // Columnas A–M (13 columnas)
    $sheet->mergeCells('A1:M1');
    $sheet->mergeCells('A2:M2');
    $sheet->mergeCells('A3:M3');
    $sheet->mergeCells('A4:M4');

    $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(24)->getColor()->setRGB('7030A0');
    $sheet->getStyle('A2')->getFont()->setBold(true)->setSize(20);
    $sheet->getStyle('A3')->getFont()->setBold(true)->setSize(14);
    $sheet->getStyle('A4')->getFont()->setBold(true)->setSize(14);
    $sheet->getStyle('A1:A4')->getAlignment()->setHorizontal('center');

    // Logo
    $logoPath = __DIR__ . '/../../../public/img/logo.jpg';
    if (file_exists($logoPath)) {
        $logo = new Drawing();
        $logo->setName('Logo');
        $logo->setDescription('Logo de Rancho El Pilar');
        $logo->setPath($logoPath);
        $logo->setHeight(110);
        $logo->setCoordinates('B1');
        $logo->setOffsetX(10);
        $logo->setWorksheet($sheet);
    }

    // Poner los encabezados de la tabla en la fila 6
    foreach ($encabezados_corte as $col => $titulo) {
        $sheet->setCellValue($col . '6', $titulo);
    }

    // ==============================================================
    // FILA DE LOS DIAS DE LA SEMANA (fila 5 de las columna D a la J)
    // ==============================================================

    // Generar rango de fechas entre fecha_inicio y fecha_cierre
    $fechas = rangoDeFechas($fecha_inicio, $fecha_cierre);

    // Fila donde quieres imprimir
    $fila = 5;

    // Columna de inicio
    $columnaInicio = 'D';

    // Recorremos las fechas y las imprimimos
    $columna = $columnaInicio;

    // Imprimir solo el día (DD) de cada fecha en las columnas D a J
    foreach ($fechas as $fecha) {
        // Extraer solo el día (ejemplo: "05" de "05/Ene/2026")
        $dia = explode("/", $fecha)[0];

        // Escribir en la celda
        $sheet->setCellValue($columna . $fila, $dia);

        // Estilos para el rango D5:J5
        $sheet->getStyle('D5:J5')->getAlignment()->setHorizontal('center');
        $sheet->getStyle('D5:J5')->getAlignment()->setVertical('center');

        // Aplicar estilo: centrado y borde negro
        $sheet->getStyle($columna . $fila)->applyFromArray([
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['argb' => '000000'],
                ],
            ],
        ]);

        // Avanzar a la siguiente columna
        $columna++;
    }

    // Formatear los encabezados (Negrita, Centrados, Tamaño 10, Fondo Rojo, Letra Blanca)
    $sheet->getStyle('A6:M6')->getFont()->setBold(true);
    $sheet->getStyle('A6:M6')->getFont()->setSize(10);
    $sheet->getStyle('A6:M6')->getFont()->setColor(new Color('000000')); // Letra blanca
    $sheet->getStyle('A6:M6')->getAlignment()->setHorizontal('center');
    $sheet->getStyle('A6:M6')->getAlignment()->setVertical('center');
    $sheet->getStyle('A6:M6')->getAlignment()->setWrapText(true); // Ajustar texto

    // Agregar color de fondo rojo a los encabezados
    $sheet->getStyle('A6:M6')->getFill()->setFillType('solid');
    $sheet->getStyle('A6:M6')->getFill()->getStartColor()->setRGB('E5C8E6'); // Rojo

    // Ajustar el ancho de las columnas
    foreach ($anchos_corte as $col => $ancho) {
        $sheet->getColumnDimension($col)->setWidth($ancho);
    }

    //=====================
    //  AGREGAR FILAS DE DATOS
    //=====================

    $numeroFila     = 7;
    $numeroEmpleado = 1;   // Contador para la columna N° (A)
    $filasReja      = [];  // Guardar índices de filas REJA para los totales

    // Colores para estilo visual
    $colorConcepto = 'F2F2F2';  // fondo columna CONCEPTO GRIS CLARO
    $colorNomina   = 'FFD6D6';  // fondo filas NOMINA
    $colorDias     = 'D5F5E3';  // verde claro para columnas de días (REJA)
    $colorTotales  = 'F2F2F2';  // rojo claro para columnas de totales


    foreach ($filasCorte as $fila) {
        $esNomina = $fila['tipoConcepto'] === 'NOMINA';

        // Fondo de la fila completa si es NOMINA
        if ($esNomina) {
            $sheet->getStyle('A' . $numeroFila . ':M' . $numeroFila)->getFill()
                ->setFillType('solid')->getStartColor()->setRGB($colorNomina);
        } else {
            // Guardar índice de fila REJA para usar en totales
            $filasReja[] = $numeroFila;
        }

        // N°
        $sheet->setCellValue('A' . $numeroFila, $numeroEmpleado);

        // NOMBRE
        $sheet->setCellValue('B' . $numeroFila, $fila['nombre']);

        // CONCEPTO — fondo gris siempre
        $sheet->setCellValue('C' . $numeroFila, $fila['concepto']);
        $sheet->getStyle('C' . $numeroFila)->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => '000000']],
            'fill' => ['fillType' => 'solid', 'startColor' => ['rgb' => $colorConcepto]],
        ]);

        // Días (D–J)
        $diasCols = [
            'D' => 'viernes',
            'E' => 'sabado',
            'F' => 'domingo',
            'G' => 'lunes',
            'H' => 'martes',
            'I' => 'miercoles',
            'J' => 'jueves',
        ];

        foreach ($diasCols as $col => $campo) {
            $valor = $fila[$campo] ?? 0;
            if ($valor != 0) {
                $sheet->setCellValue($col . $numeroFila, $valor);
            } else {
                $sheet->setCellValue($col . $numeroFila, 0);
            }

            if ($esNomina) {
                $sheet->getStyle($col . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00');
            } else {
                // Rejas: número entero
                $sheet->getStyle($col . $numeroFila)->getNumberFormat()->setFormatCode('#,##0');
            }
        }

        // TOTAL REJAS (K)
        if (!$esNomina) {
            // Para REJA: K = SUM(D:J) — suma de rejas por día
            $sheet->setCellValue('K' . $numeroFila, '=SUM(D' . $numeroFila . ':J' . $numeroFila . ')');
            $sheet->getStyle('K' . $numeroFila)->getFont()->setBold(true);
            $sheet->getStyle('K' . $numeroFila)->getNumberFormat()->setFormatCode('#,##0');
        }

        // PRECIO POR REJA (L)
        if (!$esNomina && $fila['precio'] !== null) {
            $sheet->setCellValue('L' . $numeroFila, $fila['precio']);
            $sheet->getStyle('L' . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00');
        }

        // TOTAL EFECTIVO (M)
        if ($esNomina) {
            // Para NOMINA: M = SUM(D:J) — suma de pagos por día
            $sheet->setCellValue('M' . $numeroFila, '=SUM(D' . $numeroFila . ':J' . $numeroFila . ')');
        } else {
            // Para REJA: M = K * L — Total Rejas × Precio por Reja
            $sheet->setCellValue('M' . $numeroFila, '=K' . $numeroFila . '*L' . $numeroFila);
        }
        $sheet->getStyle('M' . $numeroFila)->applyFromArray([
            'font'         => ['bold' => true],
            'numberFormat' => ['formatCode' => '$#,##0.00'],
        ]);

        // Alineación de la fila
        $sheet->getStyle('A' . $numeroFila)->getAlignment()->setHorizontal('center')->setVertical('center');
        $sheet->getStyle('B' . $numeroFila)->getAlignment()->setHorizontal('left')->setVertical('center');
        $sheet->getStyle('C' . $numeroFila . ':M' . $numeroFila)->getAlignment()->setHorizontal('center')->setVertical('center');

        // Tamaño de letra de la fila
        $sheet->getStyle('A' . $numeroFila . ':M' . $numeroFila)->getFont()->setSize(12);
        $sheet->getStyle('B' . $numeroFila)->getFont()->setSize(13);

        $numeroFila++;
        $numeroEmpleado++;
    }

    //=====================
    //  FILA DE TOTALES
    //=====================

    $filaTotal = $numeroFila;
    $sheet->setCellValue('C' . $filaTotal, 'TOTALES');
    $sheet->getStyle('C' . $filaTotal)->applyFromArray([
        'font'      => ['bold' => true, 'size' => 12],
        'alignment' => ['horizontal' => 'center', 'vertical' => 'center'],
        'fill'      => ['fillType' => 'solid', 'startColor' => ['rgb' => $colorTotales]],
    ]);

    // Aplicar fondo gris a toda la fila de totales
    $sheet->getStyle('A' . $filaTotal . ':M' . $filaTotal)->getFill()
        ->setFillType('solid')->getStartColor()->setRGB($colorTotales);

    // Columnas D-J (días): Dejar vacías (no sumar, no tiene sentido mezclar rejas con dinero)

    // Columna K (TOTAL REJAS): Solo sumar filas REJA
    if (!empty($filasReja)) {
        $primeraFila = min($filasReja);
        $ultimaFila  = max($filasReja);

        // Construir fórmula SUM solo para filas REJA (si hay múltiples no contiguas, usar SUM directo)
        $sheet->setCellValue('K' . $filaTotal, '=SUM(K' . $primeraFila . ':K' . $ultimaFila . ')');
        // Pero esto suma incluidas las NOMINA. Mejor usar SUMIF
        // SUMIF busca en una columna (C) el valor 'REJA' y suma los correspondientes en K
        $sheet->setCellValue('K' . $filaTotal, '=SUMIF(C7:C' . ($filaTotal - 1) . ',"REJA",K7:K' . ($filaTotal - 1) . ')');

        $sheet->getStyle('K' . $filaTotal)->applyFromArray([
            'font'      => ['bold' => true, 'size' => 12],
            'alignment' => ['horizontal' => 'center', 'vertical' => 'center'],
        ]);
        $sheet->getStyle('K' . $filaTotal)->getNumberFormat()->setFormatCode('#,##0');
    }

    // Columna L (PRECIO POR REJA): SE QUEDA VACIA

    // Columna M (TOTAL EFECTIVO): Sumar TODO (REJA + NOMINA)
    $sheet->setCellValue('M' . $filaTotal, '=SUM(M7:M' . ($filaTotal - 1) . ')');
    $sheet->getStyle('M' . $filaTotal)->applyFromArray([
        'font'      => ['bold' => true, 'size' => 12],
        'alignment' => ['horizontal' => 'center', 'vertical' => 'center'],
    ]);
    $sheet->getStyle('M' . $filaTotal)->getNumberFormat()->setFormatCode('$#,##0.00');

    $sheet->getRowDimension($filaTotal)->setRowHeight(25);

    //=====================
    //  BORDES
    //=====================
    $sheet->getStyle('A6:M' . $filaTotal)->applyFromArray([
        'borders' => [
            'allBorders' => [
                'borderStyle' => Border::BORDER_THIN,
                'color'       => ['rgb' => '000000'],
            ],
        ],
    ]);

    //=====================
    //  ALTURA DE FILAS Y TAMAÑO
    //=====================
    $sheet->getRowDimension(1)->setRowHeight(38);
    $sheet->getRowDimension(2)->setRowHeight(28);
    $sheet->getRowDimension(3)->setRowHeight(24);
    $sheet->getRowDimension(4)->setRowHeight(24);
    $sheet->getRowDimension(5)->setRowHeight(20); // Fila de días
    $sheet->getRowDimension(6)->setRowHeight(40);

    for ($f = 7; $f < $numeroFila; $f++) {
        $sheet->getRowDimension($f)->setRowHeight(32);
    }

    //=====================
    //  CONFIGURACIÓN DE PÁGINA
    //=====================
    $sheet->getPageSetup()->setPaperSize(PageSetup::PAPERSIZE_LETTER);
    $sheet->getPageSetup()->setOrientation(PageSetup::ORIENTATION_LANDSCAPE);
    $sheet->getPageMargins()->setLeft(0.4);
    $sheet->getPageMargins()->setRight(0.4);
    $sheet->getPageMargins()->setTop(0.4);
    $sheet->getPageMargins()->setBottom(0.4);
    $sheet->getPageSetup()->setFitToPage(true);
    $sheet->getPageSetup()->setFitToHeight(0);
    $sheet->getPageSetup()->setFitToWidth(1);
    $sheet->getPageSetup()->setPrintArea('A1:M' . $filaTotal);
}




//=====================
//  CREAR LAS DIFERENTES HOJAS
//=====================

if ($jsonNomina && isset($jsonNomina['departamentos'])) {
    foreach ($jsonNomina['departamentos'] as $departamento) {
        $nombreDepto = $departamento['nombre'] ?? 'S/N';
        $idDepto = $departamento['id_departamento'] ?? null;

        // Omitir Corte si ya se maneja aparte al final con su propio formato
        if (strtoupper($nombreDepto) === 'CORTE') continue;

        crearHoja($spreadsheet, strtoupper($nombreDepto), function ($emp) use ($idDepto) {
            $idDeptoEmp = $emp['id_departamento'] ?? null;
            $mostrar = $emp['mostrar'] ?? false;
            return ($mostrar && $idDeptoEmp == $idDepto);
        }, substr(strtoupper($nombreDepto), 0, 31));
    }
}


// =================================================================================================
// IDENTIFICAR QUE EXISTE EL DEPARTAMENTO DE CORTE Y QUE TENGA EMPLEADOS PARA CREAR LA HOJA DE CORTE
// =================================================================================================

// Corte de Limón
$existeCorteConEmpleados = false;

if ($jsonNomina && isset($jsonNomina['departamentos'])) {
    $corte = array_filter(
        $jsonNomina['departamentos'],
        fn($d) => ($d['nombre'] ?? '') === 'Corte' && !empty($d['empleados'])
    );
    $existeCorteConEmpleados = !empty($corte);
}

if ($existeCorteConEmpleados) {
    crearHojaCorte($spreadsheet, 'REJAS DE CORTE DE LIMON', $jsonNomina, 'CORTE');
}


//=====================
//  DESCARGAR ARCHIVO
//=====================

$writer = new Xlsx($spreadsheet);

$filename = 'SEM ' . str_pad($numero_semana, 2, '0', STR_PAD_LEFT) . ' - ' . $ano . ' RANCHO EL PILAR NOMINAS COMPLETAS - ' . date('Y-m-d_H-i-s') . '.xlsx';

header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
header('Content-Disposition: attachment; filename="' . $filename . '"');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

$writer->save('php://output');
exit;
