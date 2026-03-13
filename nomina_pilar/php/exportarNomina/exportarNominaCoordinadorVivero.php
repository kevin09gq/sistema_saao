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
$sheet = $spreadsheet->getActiveSheet();

// Establecer el nombre de la pestaña
$sheet->setTitle('COORDINADORES VIVERO');

// Aplicar fuente Arial como predeterminada para toda la hoja
$spreadsheet->getDefaultStyle()->getFont()->setName('Arial');

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

$titulo1 = 'RANCHO EL RELICARIO';
$titulo2 = 'COORDINADORES - VIVERO';
$titulo3 = 'NOMINA DEL ' . strtoupper($fecha_inicio) . ' AL ' . strtoupper($fecha_cierre);
$titulo4 = 'SEMANA ' . (isset($jsonNomina['numero_semana']) ? str_pad($jsonNomina['numero_semana'], 2, '0', STR_PAD_LEFT) : '00') . '-' . $ano;

// Agregar los títulos en las primeras filas
$sheet->setCellValue('A1', $titulo1);
$sheet->setCellValue('A2', $titulo2);
$sheet->setCellValue('A3', $titulo3);
$sheet->setCellValue('A4', $titulo4);

// Mergear las celdas para que los títulos ocupen toda la tabla
$sheet->mergeCells('A1:AA1');
$sheet->mergeCells('A2:AA2');
$sheet->mergeCells('A3:AA3');
$sheet->mergeCells('A4:AA4');

// Formatear título 1 - RANCHO EL RELICARIO (Rojo, Negrita, Tamaño 24)
$sheet->getStyle('A1')->getFont()->setBold(true);
$sheet->getStyle('A1')->getFont()->setSize(24);
$sheet->getStyle('A1')->getFont()->setColor(new Color('FF0000'));

// Formatear título 2 - PERSONAL DE BASE (Negrita, Tamaño 11)
$sheet->getStyle('A2')->getFont()->setBold(true);
$sheet->getStyle('A2')->getFont()->setSize(20);

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

// Definir las columnas de la tabla
$columnas = [
    'N°',
    'CD',
    'NOMBRE',
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
    'PERMISO',
    'RETARDOS',
    'UNIFORMES',
    'CHECADOR',
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

// Formatear los encabezados (Negrita, Centrados, Tamaño 10, Fondo Rojo, Letra Blanca)
$sheet->getStyle('A6:AA6')->getFont()->setBold(true);
$sheet->getStyle('A6:AA6')->getFont()->setSize(10);
$sheet->getStyle('A6:AA6')->getFont()->setColor(new Color('FFFFFF')); // Letra blanca
$sheet->getStyle('A6:AA6')->getAlignment()->setHorizontal('center');
$sheet->getStyle('A6:AA6')->getAlignment()->setVertical('center');
$sheet->getStyle('A6:AA6')->getAlignment()->setWrapText(true); // Ajustar texto

// Agregar color de fondo rojo a los encabezados
$sheet->getStyle('A6:AA6')->getFill()->setFillType('solid');
$sheet->getStyle('A6:AA6')->getFill()->getStartColor()->setRGB('FF0000'); // Rojo

// Ajustar el ancho de las columnas para mejor visualización
$columnasAncho = [
    'A' => 12,   // N°
    'B' => 14,   // CD
    'C' => 65,  // NOMBRE
    'D' => 22,  // SUELDO SEMANAL
    'E' => 20,  // PASAJE
    'F' => 20,  // COMIDA
    'G' => 20,  // EXTRAS
    'H' => 22,  // TOTAL PERCEPCIONES
    'I' => 20,  // ISR
    'J' => 20,  // IMSS
    'K' => 20,  // INFONAVIT
    'L' => 22,  // AJUSTES AL SUB
    'M' => 21,  // AUSENTISMO
    'N' => 20,  // PERMISO
    'O' => 20,  // RETARDOS
    'P' => 20,  // UNIFORMES
    'Q' => 20,  // CHECADOR
    'R' => 22,  // F.A/GAFET/COFIA
    'S' => 22,  // TOTAL DE DEDUCCIONES
    'T' => 22,  // NETO A RECIBIR
    'U' => 22,  // DISPERSION DE TARJETA
    'V' => 22,  // IMPORTE EN EFECTIVO
    'W' => 22,  // PRÉSTAMO
    'X' => 22,  // TOTAL A RECIBIR
    'Y' => 20,  // REDONDEADO
    'Z' => 23,  // TOTAL EFECTIVO REDONDEADO
    'AA' => 25  // FIRMA RECIBIDO
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
    'D' => 14,  // SUELDO SEMANAL
    'E' => 14,  // PASAJE
    'F' => 14,  // COMIDA
    'G' => 14,  // EXTRAS
    'H' => 13,  // TOTAL PERCEPCIONES
    'I' => 14,  // ISR
    'J' => 14,  // IMSS
    'K' => 14,  // INFONAVIT
    'L' => 14,  // AJUSTES AL SUB
    'M' => 14,  // AUSENTISMO
    'N' => 14,  // PERMISO
    'O' => 14,  // RETARDOS
    'P' => 14,  // UNIFORMES
    'Q' => 14,  // CHECADOR
    'R' => 13,  // F.A/GAFET/COFIA
    'S' => 13,  // TOTAL DE DEDUCCIONES
    'T' => 13,  // NETO A RECIBIR
    'U' => 13,  // DISPERSION DE TARJETA
    'V' => 13,  // IMPORTE EN EFECTIVO
    'W' => 14,  // PRÉSTAMO
    'X' => 13,  // TOTAL A RECIBIR
    'Y' => 14,  // REDONDEADO
    'Z' => 13,  // TOTAL EFECTIVO REDONDEADO
    'AA' => 14  // FIRMA RECIBIDO
];

// Aplicar tamaño de letra a los encabezados (fila 6)
foreach ($tamanioLetraColumnas as $columna => $tamanio) {
    $sheet->getStyle($columna . '6')->getFont()->setSize($tamanio);
}

//=====================
//  AGREGAR DATOS DE EMPLEADOS COODINADORES DE Vivero
//=====================

// Recopilar empleados Jornaleros Base (id_tipo_puesto = 5 y mostrar = true)
$empleadosCoodinadores = [];

if ($jsonNomina && isset($jsonNomina['departamentos'])) {
    foreach ($jsonNomina['departamentos'] as $departamento) {
        if (isset($departamento['empleados'])) {
            foreach ($departamento['empleados'] as $empleado) {
                $idPuestoEspecial = $empleado['id_tipo_puesto'] ?? null;
                $mostrar = $empleado['mostrar'] ?? false;

                if (($idPuestoEspecial == 5) && $mostrar) {
                    $empleadosCoodinadores[] = $empleado;
                }
            }
        }
    }
}

// Ordenar empleados por nombre (orden ascendente A-Z)
usort($empleadosCoodinadores, function ($a, $b) {
    return strcmp($a['nombre'] ?? '', $b['nombre'] ?? '');
});

//=====================
//  VERIFICAR COLUMNAS CON DATOS (CONFIGURACIÓN AUTO)
//=====================

// Determinar si la columna COMIDA tiene datos
$comidaTieneDatos = false;

// Determinar si la columna PASAJE tiene datos
$pasajeTieneDatos = false;

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

foreach ($empleadosCoodinadores as $empleado) {
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

    // Verificar si existe código 107 en conceptos
    if (!empty($empleado['conceptos']) && is_array($empleado['conceptos'])) {
        foreach ($empleado['conceptos'] as $concepto) {
            if ($concepto['codigo'] === '107' && ($concepto['resultado'] ?? 0) != 0) {
                $ajustesAlSubTieneDatos = true;
                break;
            }
        }
    }
}

// Agregar empleados ordenados a la hoja
$numeroFila = 7;
$numeroEmpleado = 1;

foreach ($empleadosCoodinadores as $empleado) {

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

    // Agregar salario semanal en la columna SUELDO SEMANAL
    $salarioSemanal = $empleado['salario_semanal'] ?? 0;
    if (!empty($salarioSemanal) && $salarioSemanal != 0) {
        $sheet->setCellValue('D' . $numeroFila, $salarioSemanal);
        // Aplicar formato de moneda al sueldo
        $sheet->getStyle('D' . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00');
    }

    // Agregar pasaje en la columna PASAJE
    $pasaje = $empleado['pasaje'] ?? 0;
    if (!empty($pasaje) && $pasaje != 0) {
        $sheet->setCellValue('E' . $numeroFila, $pasaje);
        $sheet->getStyle('E' . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00');
    }

    // Agregar comida en la columna COMIDA (solo si hay datos en esta columna)
    if ($comidaTieneDatos) {
        $comida = $empleado['comida'] ?? 0;
        if (!empty($comida) && $comida != 0) {
            $sheet->setCellValue('F' . $numeroFila, $comida);
            $sheet->getStyle('F' . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00');
        }
    }

    // Agregar sueldo extra total en la columna EXTRAS
    $sueldoExtraTotal = $empleado['sueldo_extra_total'] ?? 0;
    if (!empty($sueldoExtraTotal) && $sueldoExtraTotal != 0) {
        $sheet->setCellValue('G' . $numeroFila, $sueldoExtraTotal);
        $sheet->getStyle('G' . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00');
    }

    // Agregar fórmula de TOTAL PERCEPCIONES (suma dinámica de columnas existentes)
    $columnasParaSumar = ['D', 'E'];
    if ($comidaTieneDatos) $columnasParaSumar[] = 'F';
    $columnasParaSumar[] = 'G';

    $primeraColumna = reset($columnasParaSumar);
    $ultimaColumna = end($columnasParaSumar);
    $sheet->setCellValue('H' . $numeroFila, '=SUM(' . $primeraColumna . $numeroFila . ':' . $ultimaColumna . $numeroFila . ')');
    $sheet->getStyle('H' . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00');

    //=============================
    //  AGREGAR DEDUCCIONES 
    //=============================

    // Mapeo de códigos de conceptos a columnas
    $mapeoConceptos = [
        '45'  => 'I',   // ISR
        '52'  => 'J',   // IMSS
        '16'  => 'K',   // INFONAVIT
        '107' => 'L',   // AJUSTES AL SUB
    ];

    // Recorrer conceptos si existen
    if (!empty($empleado['conceptos']) && is_array($empleado['conceptos'])) {
        foreach ($empleado['conceptos'] as $concepto) {
            $codigo = $concepto['codigo'] ?? null;
            $resultado = $concepto['resultado'] ?? 0;

            // No incluir código 107 si no tiene datos en ningún empleado
            if ($codigo === '107' && !$ajustesAlSubTieneDatos) {
                continue;
            }

            // Verificar si el código está en el mapeo
            if (isset($mapeoConceptos[$codigo]) && !empty($resultado) && $resultado != 0) {
                $columna = $mapeoConceptos[$codigo];
                $sheet->setCellValue($columna . $numeroFila, $resultado);
                // Aplicar formato de moneda con signo negativo y color rojo
                $sheet->getStyle($columna . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
                $sheet->getStyle($columna . $numeroFila)->getFont()->setColor(new Color('FF0000'));
            }
        }
    }

    // Agregar inasistencia/ausentismo en la columna AUSENTISMO (solo si hay datos)
    if ($ausentismoTieneDatos) {
        $inasistencia = $empleado['inasistencia'] ?? 0;
        if (!empty($inasistencia) && $inasistencia != 0) {
            $sheet->setCellValue('M' . $numeroFila, $inasistencia);
            $sheet->getStyle('M' . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
            $sheet->getStyle('M' . $numeroFila)->getFont()->setColor(new Color('FF0000'));
        }
    }

    // Agregar permiso en la columna PERMISO (solo si hay datos)
    if ($permisoTieneDatos) {
        $permiso = $empleado['permiso'] ?? 0;
        if (!empty($permiso) && $permiso != 0) {
            $sheet->setCellValue('N' . $numeroFila, $permiso);
            $sheet->getStyle('N' . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
            $sheet->getStyle('N' . $numeroFila)->getFont()->setColor(new Color('FF0000'));
        }
    }

    // Agregar retardos en la columna RETARDOS (solo si hay datos)
    if ($retardosTieneDatos) {
        $retardos = $empleado['retardos'] ?? 0;
        if (!empty($retardos) && $retardos != 0) {
            $sheet->setCellValue('O' . $numeroFila, $retardos);
            $sheet->getStyle('O' . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
            $sheet->getStyle('O' . $numeroFila)->getFont()->setColor(new Color('FF0000'));
        }
    }

    // Agregar uniformes en la columna UNIFORMES (solo si hay datos)
    if ($uniformesTieneDatos) {
        $uniformes = $empleado['uniformes'] ?? 0;
        if (!empty($uniformes) && $uniformes != 0) {
            $sheet->setCellValue('P' . $numeroFila, $uniformes);
            $sheet->getStyle('P' . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
            $sheet->getStyle('P' . $numeroFila)->getFont()->setColor(new Color('FF0000'));
        }
    }

    // Agregar checador en la columna CHECADOR (solo si hay datos)
    if ($checadorTieneDatos) {
        $checador = $empleado['checador'] ?? 0;
        if (!empty($checador) && $checador != 0) {
            $sheet->setCellValue('Q' . $numeroFila, $checador);
            $sheet->getStyle('Q' . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
            $sheet->getStyle('Q' . $numeroFila)->getFont()->setColor(new Color('FF0000'));
        }
    }

    // Agregar F.A/GAFET/COFIA en la columna F.A/GAFET/COFIA (solo si hay datos)
    if ($faxGafetCofiaTieneDatos) {
        $faxGafetCofia = $empleado['fa_gafet_cofia'] ?? 0;
        if (!empty($faxGafetCofia) && $faxGafetCofia != 0) {
            $sheet->setCellValue('R' . $numeroFila, $faxGafetCofia);
            $sheet->getStyle('R' . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
            $sheet->getStyle('R' . $numeroFila)->getFont()->setColor(new Color('FF0000'));
        }
    }

    // Agregar TOTAL DE DEDUCCIONES (suma de todas las deducciones columnas I a R)
    $sheet->setCellValue('S' . $numeroFila, '=SUM(I' . $numeroFila . ':R' . $numeroFila . ')');
    $sheet->getStyle('S' . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
    $sheet->getStyle('S' . $numeroFila)->getFont()->setColor(new Color('FF0000'));

    // Agregar NETO A RECIBIR (SUM Percepciones - SUM Deducciones)
    $sheet->setCellValue('T' . $numeroFila, '=SUM(D' . $numeroFila . ':G' . $numeroFila . ')-SUM(I' . $numeroFila . ':R' . $numeroFila . ')');
    $sheet->getStyle('T' . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00');

    // Agregar DISPERSION DE TARJETA 
    $tarjeta = $empleado['tarjeta'] ?? 0;
    if (!empty($tarjeta) && $tarjeta != 0) {
        $sheet->setCellValue('U' . $numeroFila, $tarjeta);
        $sheet->getStyle('U' . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
        $sheet->getStyle('U' . $numeroFila)->getFont()->setColor(new Color('FF0000'));
    }

    // Agregar IMPORTE EN EFECTIVO (NETO A RECIBIR - DISPERSION DE TARJETA)
    $sheet->setCellValue('V' . $numeroFila, '=T' . $numeroFila . '-U' . $numeroFila);
    $sheet->getStyle('V' . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00');

    // Agregar PRÉSTAMO 
    $prestamo = $empleado['prestamo'] ?? 0;
    if (!empty($prestamo) && $prestamo != 0) {
        $sheet->setCellValue('W' . $numeroFila, $prestamo);
        $sheet->getStyle('W' . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
        $sheet->getStyle('W' . $numeroFila)->getFont()->setColor(new Color('FF0000'));
    }

    // Agregar TOTAL A RECIBIR (IMPORTE EN EFECTIVO - PRÉSTAMO)
    $sheet->setCellValue('X' . $numeroFila, '=V' . $numeroFila . '-W' . $numeroFila);
    $sheet->getStyle('X' . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00');

    // Agregar REDONDEADO (fórmula que calcula diferencia al redondear)
    // Si TOTAL A RECIBIR es 192.50 -> redondea a 193 -> diferencia: +0.50
    // Si TOTAL A RECIBIR es 192.49 -> redondea a 192 -> diferencia: -0.49 (rojo)
    $sheet->setCellValue('Y' . $numeroFila, '=ROUND(X' . $numeroFila . ',0)-X' . $numeroFila);
    // Formato: positivo normal ($#,##0.00), negativo en rojo con signo menos ([RED]-$#,##0.00)
    $sheet->getStyle('Y' . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00;[RED]-$#,##0.00');

    // Agregar TOTAL EFECTIVO REDONDEADO (TOTAL A RECIBIR +/- REDONDEADO)
    $sheet->setCellValue('Z' . $numeroFila, '=X' . $numeroFila . '+Y' . $numeroFila);
    $sheet->getStyle('Z' . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00');

    // Centrar datos en A y B (horizontal y verticalmente)
    $sheet->getStyle('A' . $numeroFila . ':B' . $numeroFila)->getAlignment()->setHorizontal('center');
    $sheet->getStyle('A' . $numeroFila . ':B' . $numeroFila)->getAlignment()->setVertical('center');

    // Alinear nombre en C (centrado verticalmente, alineado a izquierda horizontalmente)
    $sheet->getStyle('C' . $numeroFila)->getAlignment()->setHorizontal('left');
    $sheet->getStyle('C' . $numeroFila)->getAlignment()->setVertical('center');

    // Centrar sueldo, pasaje, comida, extras, total percepciones, deducciones, descuentos (D a Z)
    $sheet->getStyle('D' . $numeroFila . ':Z' . $numeroFila)->getAlignment()->setHorizontal('center');
    $sheet->getStyle('D' . $numeroFila . ':Z' . $numeroFila)->getAlignment()->setVertical('center');

    $numeroFila++;
    $numeroEmpleado++;
}

//=====================
//  APLICAR FORMATOS A TODAS LAS CELDAS DE DATOS (INCLUSO VACIAS)
//=====================

// Iterar sobre todas las filas de datos (7 hasta numeroFila-1)
for ($fila = 7; $fila < $numeroFila; $fila++) {
    // Columnas con formato deducciones: I-L (ISR, IMSS, INFONAVIT, AJUSTES AL SUB)
    for ($col = 'I'; $col <= 'L'; $col++) {
        $sheet->getStyle($col . $fila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
        $sheet->getStyle($col . $fila)->getFont()->setColor(new Color('FF0000'));
    }

    // Columnas con formato descuentos: M-R (AUSENTISMO, PERMISO, RETARDOS, UNIFORMES, CHECADOR, F.A/GAFET/COFIA)
    for ($col = 'M'; $col <= 'R'; $col++) {
        $sheet->getStyle($col . $fila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
        $sheet->getStyle($col . $fila)->getFont()->setColor(new Color('FF0000'));
    }

    // Columna S: TOTAL DE DEDUCCIONES (rojo con signo negativo)
    $sheet->getStyle('S' . $fila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
    $sheet->getStyle('S' . $fila)->getFont()->setColor(new Color('FF0000'));

    // Columna U: DISPERSION DE TARJETA (rojo con signo negativo)
    $sheet->getStyle('U' . $fila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
    $sheet->getStyle('U' . $fila)->getFont()->setColor(new Color('FF0000'));

    // Columna W: PRESTAMO (rojo con signo negativo)
    $sheet->getStyle('W' . $fila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
    $sheet->getStyle('W' . $fila)->getFont()->setColor(new Color('FF0000'));

    // Columna Y: REDONDEADO (formato condicional: positivo normal, negativo rojo)
    $sheet->getStyle('Y' . $fila)->getNumberFormat()->setFormatCode('$#,##0.00;[RED]-$#,##0.00');

    // Columnas de moneda normal: D, E, F, G, H, T, V, X, Z
    foreach (['D', 'E', 'F', 'G', 'H', 'T', 'V', 'X', 'Z'] as $col) {
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

// Agregar fórmulas SUM para cada columna de datos (D a Z)
$columnasData = ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

foreach ($columnasData as $columna) {
    $sheet->setCellValue($columna . $filaTotal, '=SUM(' . $columna . '7:' . $columna . ($filaTotal - 1) . ')');
    $sheet->getStyle($columna . $filaTotal)->getFont()->setBold(true);
    $sheet->getStyle($columna . $filaTotal)->getFont()->setSize(14);

    // Aplicar formato de moneda según la columna
    if (in_array($columna, ['I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'U', 'W'])) {
        // Formato rojo con signo negativo
        $sheet->getStyle($columna . $filaTotal)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
        $sheet->getStyle($columna . $filaTotal)->getFont()->setColor(new Color('FF0000'));
    } elseif ($columna === 'Y') {
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
$sheet->getStyle('A' . $filaTotal . ':Z' . $filaTotal)->getFill()->setFillType('solid');
$sheet->getStyle('A' . $filaTotal . ':Z' . $filaTotal)->getFill()->getStartColor()->setRGB('D3D3D3'); // Gris claro

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

$sheet->getStyle('A6:AA' . $filaTotal)->applyFromArray($estiloBordesTabla);

//=====================
//  OCULTAR COLUMNAS SIN DATOS
//=====================

// Ocultar columna COMIDA si no tiene datos
if (!$comidaTieneDatos) {
    $sheet->getColumnDimension('F')->setVisible(false);
}

// Ocultar columna PASAJE si no tiene datos
if (!$pasajeTieneDatos) {
    $sheet->getColumnDimension('E')->setVisible(false);
}

// Ocultar columna AJUSTES AL SUB si no tiene datos
if (!$ajustesAlSubTieneDatos) {
    $sheet->getColumnDimension('L')->setVisible(false);
}

// Ocultar columna AUSENTISMO si no tiene datos
if (!$ausentismoTieneDatos) {
    $sheet->getColumnDimension('M')->setVisible(false);
}

// Ocultar columna PERMISO si no tiene datos
if (!$permisoTieneDatos) {
    $sheet->getColumnDimension('N')->setVisible(false);
}

// Ocultar columna RETARDOS si no tiene datos
if (!$retardosTieneDatos) {
    $sheet->getColumnDimension('O')->setVisible(false);
}

// Ocultar columna UNIFORMES si no tiene datos
if (!$uniformesTieneDatos) {
    $sheet->getColumnDimension('P')->setVisible(false);
}

// Ocultar columna CHECADOR si no tiene datos
if (!$checadorTieneDatos) {
    $sheet->getColumnDimension('Q')->setVisible(false);
}

// Ocultar columna F.A/GAFET/COFIA si no tiene datos
if (!$faxGafetCofiaTieneDatos) {
    $sheet->getColumnDimension('R')->setVisible(false);
}

//=====================
//  CONFIGURAR ALTURA DE FILAS Y TAMAÑO DE LETRA
//=====================

// Configurar tamaño de letra para cada columna (configurable)
$tamanioLetraFilas = [
    'A' => 14,  // N°
    'B' => 14,  // CD
    'C' => 16,  // NOMBRE
    'D' => 15,  // SUELDO SEMANAL
    'E' => 15,  // PASAJE
    'F' => 15,  // COMIDA
    'G' => 15,  // EXTRAS
    'H' => 15,  // TOTAL PERCEPCIONES
    'I' => 15,  // ISR
    'J' => 15,  // IMSS
    'K' => 15,  // INFONAVIT
    'L' => 15,  // AJUSTES AL SUB
    'M' => 15,  // AUSENTISMO
    'N' => 15,  // PERMISO
    'O' => 15,  // RETARDOS
    'P' => 15,  // UNIFORMES
    'Q' => 15,  // CHECADOR
    'R' => 15,  // F.A/GAFET/COFIA
    'S' => 15,  // TOTAL DE DEDUCCIONES
    'T' => 15,  // NETO A RECIBIR
    'U' => 15,  // DISPERSION DE TARJETA
    'V' => 15,  // IMPORTE EN EFECTIVO
    'W' => 15,  // PRÉSTAMO
    'X' => 15,  // TOTAL A RECIBIR
    'Y' => 15,  // REDONDEADO
    'Z' => 15  // TOTAL EFECTIVO REDONDEADO
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
$sheet->getPageSetup()->setPrintArea('A1:AA' . $ultimaFila);

//=====================
//  DESCARGAR ARCHIVO
//=====================

$writer = new Xlsx($spreadsheet);

// Definir el nombre del archivo con fecha y hora
$filename = 'Nomina_Coordinador_Vivero_' . date('Y-m-d_H-i-s') . '.xlsx';

// Configurar las cabeceras para descargar el archivo
header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
header('Content-Disposition: attachment; filename="' . $filename . '"');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

// Escribir el archivo al cliente
$writer->save('php://output');
exit;
