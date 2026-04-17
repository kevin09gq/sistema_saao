<?php

// Incluir autoload de Composer
require_once __DIR__ . '/../../../vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Color;
use PhpOffice\PhpSpreadsheet\Worksheet\PageSetup;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Worksheet\Drawing;

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
    $date->modify("0 day");

    // Buscar la abreviatura del mes resultante
    $mesAbrevNuevo = array_search((int)$date->format("m"), $meses);

    // Formatear resultado
    return $date->format("d") . "/" . $mesAbrevNuevo . "/" . $date->format("Y");
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
    $fecha_inicio = restarUnDia($jsonNomina['fecha_inicio']) ?? 'Fecha Inicio';
    $fecha_cierre = restarUnDia($jsonNomina['fecha_cierre']) ?? 'Fecha Cierre';
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
$sheet->mergeCells('A1:AB1');
$sheet->mergeCells('A2:AB2');
$sheet->mergeCells('A3:AB3');
$sheet->mergeCells('A4:AB4');

// Formatear título 1 - RANCHO PALMILLA (Rojo, Negrita, Tamaño 24)
$sheet->getStyle('A1')->getFont()->setBold(true);
$sheet->getStyle('A1')->getFont()->setSize(24);
$sheet->getStyle('A1')->getFont()->setColor(new Color('BAA59C'));

// Formatear título 2 - PERSONAL DE BASE (Negrita, Tamaño 11)
$sheet->getStyle('A2')->getFont()->setBold(true);
$sheet->getStyle('A2')->getFont()->setSize(20);
$sheet->getStyle('A2')->getFont()->setColor(new Color('BAA59C'));   


// Formatear título 3 - NOMINA (Negrita, Tamaño 10)
$sheet->getStyle('A3')->getFont()->setBold(true);
$sheet->getStyle('A3')->getFont()->setSize(14);

// Formatear título 4 - SEMANA (Negrita, Tamaño 10)
$sheet->getStyle('A4')->getFont()->setBold(true);
$sheet->getStyle('A4')->getFont()->setSize(14);

// Centrar todos los títulos
$sheet->getStyle('A1:A4')->getAlignment()->setHorizontal('center');

// Insertar logo a la derecha de los títulos
$logoPath = '../../../public/img/logo.jpg';
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

// Definir las columnas de la tabla
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

// Agregar los encabezados en la fila 6
$columnaLetra = 'A';
foreach ($columnas as $columna) {
    $sheet->setCellValue($columnaLetra . '6', $columna);
    $columnaLetra++;
}

// Formatear los encabezados (Negrita, Centrados, Tamaño 10, Fondo Purpura, Letra Negra)
$sheet->getStyle('A6:AB6')->getFont()->setBold(true);
$sheet->getStyle('A6:AB6')->getFont()->setSize(10);
$sheet->getStyle('A6:AB6')->getFont()->setColor(new Color('000000')); // Letra blanca
$sheet->getStyle('A6:AB6')->getAlignment()->setHorizontal('center');
$sheet->getStyle('A6:AB6')->getAlignment()->setVertical('center');
$sheet->getStyle('A6:AB6')->getAlignment()->setWrapText(true); // Ajustar texto

// Agregar color de fondo purpura a los encabezados
$sheet->getStyle('A6:AB6')->getFill()->setFillType('solid');
$sheet->getStyle('A6:AB6')->getFill()->getStartColor()->setRGB('C9C5C3'); // Rojo

// Ajustar el ancho de las columnas para mejor visualización
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

// Aplicar los anchos a cada columna
foreach ($columnasAncho as $columna => $ancho) {
    $sheet->getColumnDimension($columna)->setWidth($ancho);
}

//=====================
//  TAMAÑO DE LETRA POR COLUMNA
//=====================

// Configurar tamaño de letra para cada columna (configurable)
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

// Aplicar tamaño de letra a los encabezados (fila 6)
foreach ($tamanioLetraColumnas as $columna => $tamanio) {
    $sheet->getStyle($columna . '6')->getFont()->setSize($tamanio);
}

//=====================
//  AGREGAR DATOS DE EMPLEADOS JORNALEROS BASE
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

    // Agregar sueldo extra total
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

    // Mapeo de códigos de conceptos a columnas
    $mapeoConceptos = [
        '45'  => 'J',   // ISR
        '52'  => 'K',   // IMSS
        '16'  => 'L',   // INFONAVIT
        '107' => 'M',   // AJUSTES AL SUB
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
        $sheet->setCellValue('N' . $numeroFila, $inasistencia);
        $sheet->getStyle('N' . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
        $sheet->getStyle('N' . $numeroFila)->getFont()->setColor(new Color('FF0000'));
    }

    // UNIFORMES
    $uniformes = $empleado['uniformes'] ?? 0;
    if (!empty($uniformes) && $uniformes != 0) {
        $sheet->setCellValue('O' . $numeroFila, $uniformes);
        $sheet->getStyle('O' . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
        $sheet->getStyle('O' . $numeroFila)->getFont()->setColor(new Color('FF0000'));
    }

    // PERMISOS
    $permiso = $empleado['permiso'] ?? 0;
    if (!empty($permiso) && $permiso != 0) {
        $sheet->setCellValue('P' . $numeroFila, $permiso);
        $sheet->getStyle('P' . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
        $sheet->getStyle('P' . $numeroFila)->getFont()->setColor(new Color('FF0000'));
    }

    // RETARDOS
    $retardos = $empleado['retardos'] ?? 0;
    if (!empty($retardos) && $retardos != 0) {
        $sheet->setCellValue('Q' . $numeroFila, $retardos);
        $sheet->getStyle('Q' . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
        $sheet->getStyle('Q' . $numeroFila)->getFont()->setColor(new Color('FF0000'));
    }

    // CHECADOR
    $checador = $empleado['checador'] ?? 0;
    if (!empty($checador) && $checador != 0) {
        $sheet->setCellValue('R' . $numeroFila, $checador);
        $sheet->getStyle('R' . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
        $sheet->getStyle('R' . $numeroFila)->getFont()->setColor(new Color('FF0000'));
    }

    // F.A/GAFET/COFIA
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
    
    // Columnas con formato descuentos: N-S (AUSENTISMO, UNIFORMES, PERMISOS, RETARDOS, CHECADOR, F.A/GAFET/COFIA)
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

// Agregar etiqueta "TOTALES" en columna A
$sheet->setCellValue('A' . $filaTotal, 'TOTALES');
$sheet->getStyle('A' . $filaTotal)->getFont()->setBold(true);
$sheet->getStyle('A' . $filaTotal)->getAlignment()->setHorizontal('center');
$sheet->getStyle('A' . $filaTotal)->getAlignment()->setVertical('center');

// Agregar fórmulas SUM para cada columna de datos (D a AA)
$columnasData = ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'AA'];

foreach ($columnasData as $columna) {
    $rangoSuma = $columna . '7:' . $columna . ($filaTotal - 1);
    $sheet->setCellValue($columna . $filaTotal, '=IF(SUM(' . $rangoSuma . ')=0,"",SUM(' . $rangoSuma . '))');
    $sheet->getStyle($columna . $filaTotal)->getFont()->setBold(true);
    $sheet->getStyle($columna . $filaTotal)->getFont()->setSize(14);
    
    // Aplicar formato de moneda según la columna
    if ($columna === 'D') {
        // Formato entero para DIAS TRAB.
        $sheet->getStyle($columna . $filaTotal)->getNumberFormat()->setFormatCode('0');
    } elseif (in_array($columna, ['J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'V', 'X'])) {
        // Formato rojo con signo negativo
        $sheet->getStyle($columna . $filaTotal)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
        $sheet->getStyle($columna . $filaTotal)->getFont()->setColor(new Color('FF0000'));
    } elseif ($columna === 'Z') {
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
$sheet->getStyle('A' . $filaTotal . ':AB' . $filaTotal)->getFill()->setFillType('solid');
$sheet->getStyle('A' . $filaTotal . ':AB' . $filaTotal)->getFill()->getStartColor()->setRGB('D3D3D3'); // Gris claro

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

$sheet->getStyle('A6:AB' . $filaTotal)->applyFromArray($estiloBordesTabla);

//=====================
//  OCULTAR COLUMNAS SIN DATOS
//=====================

// Ocultar columna COMIDA si no tiene datos
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
    $sheet->getColumnDimension('J')->setVisible(false);
}

// Ocultar columna IMSS si no tiene datos
if (!$imssTieneDatos) {
    $sheet->getColumnDimension('K')->setVisible(false);
}

// Ocultar columna INFONAVIT si no tiene datos
if (!$infonavitTieneDatos) {
    $sheet->getColumnDimension('L')->setVisible(false);
}

// Ocultar columna AJUSTES AL SUB si no tiene datos
if (!$ajustesAlSubTieneDatos) {
    $sheet->getColumnDimension('M')->setVisible(false);
}

// Ocultar columna AUSENTISMO si no tiene datos
if (!$ausentismoTieneDatos) {
    $sheet->getColumnDimension('N')->setVisible(false);
}

// Ocultar columna UNIFORMES si no tiene datos
if (!$uniformesTieneDatos) {
    $sheet->getColumnDimension('O')->setVisible(false);
}

// Ocultar columna PERMISOS si no tiene datos
if (!$permisoTieneDatos) {
    $sheet->getColumnDimension('P')->setVisible(false);
}

// Ocultar columna RETARDOS si no tiene datos
if (!$retardosTieneDatos) {
    $sheet->getColumnDimension('Q')->setVisible(false);
}

// Ocultar columna CHECADOR si no tiene datos
if (!$checadorTieneDatos) {
    $sheet->getColumnDimension('R')->setVisible(false);
}

// Ocultar columna F.A/GAFET/COFIA si no tiene datos
if (!$faxGafetCofiaTieneDatos) {
    $sheet->getColumnDimension('S')->setVisible(false);
}

// Ocultar columnas de totales permanentemente
$sheet->getColumnDimension('I')->setVisible(false);
$sheet->getColumnDimension('T')->setVisible(false);

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
$sheet->getPageSetup()->setPrintArea('A1:AB' . $ultimaFila);

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
