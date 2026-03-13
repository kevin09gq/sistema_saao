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

// Aplicar fuente Arial como predeterminada para toda la hoja
$spreadsheet->getDefaultStyle()->getFont()->setName('Arial');

// Datos de fecha
if ($jsonNomina) {
    $fecha_inicio = $jsonNomina['fecha_inicio'] ?? 'Fecha Inicio';
    $fecha_cierre = $jsonNomina['fecha_cierre'] ?? 'Fecha Cierre';
    $numero_semana = $jsonNomina['numero_semana'] ?? '00';
    $ano = date('Y');
} else {
    $fecha_inicio = '16/Ene';
    $fecha_cierre = '22/Ene';
    $numero_semana = '00';
    $ano = date('Y');
}

//=====================
//  DEFINIR COLUMNAS COMUNES
//=====================

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

//=====================
//  FUNCIÓN PARA CREAR UNA HOJA
//=====================

function crearHoja($spreadsheet, $titulo2, $filtroEmpleados, $nombreHoja) {
    global $jsonNomina, $columnas, $columnasAncho, $tamanioLetraColumnas, $tamanioLetraFilas, $fecha_inicio, $fecha_cierre, $numero_semana, $ano;
    
    // Crear una nueva hoja o usar la existente
    if ($nombreHoja === 'JORNALERO BASE') {
        $sheet = $spreadsheet->getActiveSheet();
    } else {
        $sheet = $spreadsheet->createSheet();
    }
    
    $sheet->setTitle($nombreHoja);
    
    //=====================
    //  TÍTULOS
    //=====================
    
    $titulo1 = 'RANCHO EL RELICARIO';
    $titulo3 = 'NOMINA DEL ' . strtoupper($fecha_inicio) . ' AL ' . strtoupper($fecha_cierre);
    $titulo4 = 'SEMANA ' . str_pad($numero_semana, 2, '0', STR_PAD_LEFT) . '-' . $ano;
    
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
    
    // Formatear título 2 (Negrita, Tamaño 20)
    $sheet->getStyle('A2')->getFont()->setBold(true);
    $sheet->getStyle('A2')->getFont()->setSize(20);
    
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
    $sheet->getStyle('A6:AA6')->getFont()->setBold(true);
    $sheet->getStyle('A6:AA6')->getFont()->setSize(10);
    $sheet->getStyle('A6:AA6')->getFont()->setColor(new Color('FFFFFF')); // Letra blanca
    $sheet->getStyle('A6:AA6')->getAlignment()->setHorizontal('center');
    $sheet->getStyle('A6:AA6')->getAlignment()->setVertical('center');
    $sheet->getStyle('A6:AA6')->getAlignment()->setWrapText(true);
    
    // Agregar color de fondo rojo a los encabezados
    $sheet->getStyle('A6:AA6')->getFill()->setFillType('solid');
    $sheet->getStyle('A6:AA6')->getFill()->getStartColor()->setRGB('FF0000'); // Rojo
    
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
    
    foreach ($empleados as $empleado) {
        if (($empleado['comida'] ?? 0) != 0) {
            $comidaTieneDatos = true;
        }
        if (($empleado['pasaje'] ?? 0) != 0) {
            $pasajeTieneDatos = true;
        }
    }
    
    //=====================
    //  AGREGAR EMPLEADOS A LA HOJA
    //=====================
    
    $numeroFila = 7;
    $numeroEmpleado = 1;
    
    foreach ($empleados as $empleado) {
        
        // Agregar número y clave
        $sheet->setCellValue('A' . $numeroFila, $numeroEmpleado);
        $sheet->setCellValue('B' . $numeroFila, $empleado['clave'] ?? '');
        $sheet->setCellValue('C' . $numeroFila, $empleado['nombre'] ?? '');
        
        //=============================
        //  AGREGAR PERCEPCIONES 
        //=============================
        
        $salarioSemanal = $empleado['salario_semanal'] ?? 0;
        if (!empty($salarioSemanal) && $salarioSemanal != 0) {
            $sheet->setCellValue('D' . $numeroFila, $salarioSemanal);
            $sheet->getStyle('D' . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00');
        }
        
        $pasaje = $empleado['pasaje'] ?? 0;
        if (!empty($pasaje) && $pasaje != 0) {
            $sheet->setCellValue('E' . $numeroFila, $pasaje);
            $sheet->getStyle('E' . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00');
        }
        
        if ($comidaTieneDatos) {
            $comida = $empleado['comida'] ?? 0;
            if (!empty($comida) && $comida != 0) {
                $sheet->setCellValue('F' . $numeroFila, $comida);
                $sheet->getStyle('F' . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00');
            }
        }
        
        $sueldoExtraTotal = $empleado['sueldo_extra_total'] ?? 0;
        if (!empty($sueldoExtraTotal) && $sueldoExtraTotal != 0) {
            $sheet->setCellValue('G' . $numeroFila, $sueldoExtraTotal);
            $sheet->getStyle('G' . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00');
        }
        
        // TOTAL PERCEPCIONES
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
        
        $mapeoConceptos = [
            '45'  => 'I',   // ISR
            '52'  => 'J',   // IMSS
            '16'  => 'K',   // INFONAVIT
            '107' => 'L',   // AJUSTES AL SUB
        ];
        
        if (!empty($empleado['conceptos']) && is_array($empleado['conceptos'])) {
            foreach ($empleado['conceptos'] as $concepto) {
                $codigo = $concepto['codigo'] ?? null;
                $resultado = $concepto['resultado'] ?? 0;
                
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
            $sheet->setCellValue('M' . $numeroFila, $inasistencia);
            $sheet->getStyle('M' . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
            $sheet->getStyle('M' . $numeroFila)->getFont()->setColor(new Color('FF0000'));
        }
        
        $permiso = $empleado['permiso'] ?? 0;
        if (!empty($permiso) && $permiso != 0) {
            $sheet->setCellValue('N' . $numeroFila, $permiso);
            $sheet->getStyle('N' . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
            $sheet->getStyle('N' . $numeroFila)->getFont()->setColor(new Color('FF0000'));
        }
        
        $retardos = $empleado['retardos'] ?? 0;
        if (!empty($retardos) && $retardos != 0) {
            $sheet->setCellValue('O' . $numeroFila, $retardos);
            $sheet->getStyle('O' . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
            $sheet->getStyle('O' . $numeroFila)->getFont()->setColor(new Color('FF0000'));
        }
        
        $uniformes = $empleado['uniformes'] ?? 0;
        if (!empty($uniformes) && $uniformes != 0) {
            $sheet->setCellValue('P' . $numeroFila, $uniformes);
            $sheet->getStyle('P' . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
            $sheet->getStyle('P' . $numeroFila)->getFont()->setColor(new Color('FF0000'));
        }
        
        $checador = $empleado['checador'] ?? 0;
        if (!empty($checador) && $checador != 0) {
            $sheet->setCellValue('Q' . $numeroFila, $checador);
            $sheet->getStyle('Q' . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
            $sheet->getStyle('Q' . $numeroFila)->getFont()->setColor(new Color('FF0000'));
        }
        
        $faxGafetCofia = $empleado['fa_gafet_cofia'] ?? 0;
        if (!empty($faxGafetCofia) && $faxGafetCofia != 0) {
            $sheet->setCellValue('R' . $numeroFila, $faxGafetCofia);
            $sheet->getStyle('R' . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
            $sheet->getStyle('R' . $numeroFila)->getFont()->setColor(new Color('FF0000'));
        }
        
        // TOTAL DE DEDUCCIONES
        $sheet->setCellValue('S' . $numeroFila, '=SUM(I' . $numeroFila . ':R' . $numeroFila . ')');
        $sheet->getStyle('S' . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
        $sheet->getStyle('S' . $numeroFila)->getFont()->setColor(new Color('FF0000'));
        
        // NETO A RECIBIR
        $sheet->setCellValue('T' . $numeroFila, '=SUM(D' . $numeroFila . ':G' . $numeroFila . ')-SUM(I' . $numeroFila . ':R' . $numeroFila . ')');
        $sheet->getStyle('T' . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00');
        
        // DISPERSION DE TARJETA
        $tarjeta = $empleado['tarjeta'] ?? 0;
        if (!empty($tarjeta) && $tarjeta != 0) {
            $sheet->setCellValue('U' . $numeroFila, $tarjeta);
            $sheet->getStyle('U' . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
            $sheet->getStyle('U' . $numeroFila)->getFont()->setColor(new Color('FF0000'));
        }
        
        // IMPORTE EN EFECTIVO
        $sheet->setCellValue('V' . $numeroFila, '=T' . $numeroFila . '-U' . $numeroFila);
        $sheet->getStyle('V' . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00');
        
        // PRÉSTAMO
        $prestamo = $empleado['prestamo'] ?? 0;
        if (!empty($prestamo) && $prestamo != 0) {
            $sheet->setCellValue('W' . $numeroFila, $prestamo);
            $sheet->getStyle('W' . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
            $sheet->getStyle('W' . $numeroFila)->getFont()->setColor(new Color('FF0000'));
        }
        
        // TOTAL A RECIBIR
        $sheet->setCellValue('X' . $numeroFila, '=V' . $numeroFila . '-W' . $numeroFila);
        $sheet->getStyle('X' . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00');
        
        // REDONDEADO
        $sheet->setCellValue('Y' . $numeroFila, '=ROUND(X' . $numeroFila . ',0)-X' . $numeroFila);
        $sheet->getStyle('Y' . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00;[RED]-$#,##0.00');
        
        // TOTAL EFECTIVO REDONDEADO
        $sheet->setCellValue('Z' . $numeroFila, '=X' . $numeroFila . '+Y' . $numeroFila);
        $sheet->getStyle('Z' . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00');
        
        // Alineación
        $sheet->getStyle('A' . $numeroFila . ':B' . $numeroFila)->getAlignment()->setHorizontal('center');
        $sheet->getStyle('A' . $numeroFila . ':B' . $numeroFila)->getAlignment()->setVertical('center');
        $sheet->getStyle('C' . $numeroFila)->getAlignment()->setHorizontal('left');
        $sheet->getStyle('C' . $numeroFila)->getAlignment()->setVertical('center');
        $sheet->getStyle('D' . $numeroFila . ':Z' . $numeroFila)->getAlignment()->setHorizontal('center');
        $sheet->getStyle('D' . $numeroFila . ':Z' . $numeroFila)->getAlignment()->setVertical('center');
        
        $numeroFila++;
        $numeroEmpleado++;
    }
    
    //=====================
    //  APLICAR FORMATOS A TODAS LAS CELDAS DE DATOS
    //=====================
    
    for ($fila = 7; $fila < $numeroFila; $fila++) {
        for ($col = 'I'; $col <= 'L'; $col++) {
            $sheet->getStyle($col . $fila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
            $sheet->getStyle($col . $fila)->getFont()->setColor(new Color('FF0000'));
        }
        
        for ($col = 'M'; $col <= 'R'; $col++) {
            $sheet->getStyle($col . $fila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
            $sheet->getStyle($col . $fila)->getFont()->setColor(new Color('FF0000'));
        }
        
        $sheet->getStyle('S' . $fila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
        $sheet->getStyle('S' . $fila)->getFont()->setColor(new Color('FF0000'));
        $sheet->getStyle('U' . $fila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
        $sheet->getStyle('U' . $fila)->getFont()->setColor(new Color('FF0000'));
        $sheet->getStyle('W' . $fila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
        $sheet->getStyle('W' . $fila)->getFont()->setColor(new Color('FF0000'));
        $sheet->getStyle('Y' . $fila)->getNumberFormat()->setFormatCode('$#,##0.00;[RED]-$#,##0.00');
        
        foreach (['D', 'E', 'F', 'G', 'H', 'T', 'V', 'X', 'Z'] as $col) {
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
    
    $columnasData = ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    
    foreach ($columnasData as $columna) {
        $sheet->setCellValue($columna . $filaTotal, '=SUM(' . $columna . '7:' . $columna . ($filaTotal - 1) . ')');
        $sheet->getStyle($columna . $filaTotal)->getFont()->setBold(true);
        $sheet->getStyle($columna . $filaTotal)->getFont()->setSize(14);
        
        if (in_array($columna, ['I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'U', 'W'])) {
            $sheet->getStyle($columna . $filaTotal)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
            $sheet->getStyle($columna . $filaTotal)->getFont()->setColor(new Color('FF0000'));
        } elseif ($columna === 'Y') {
            $sheet->getStyle($columna . $filaTotal)->getNumberFormat()->setFormatCode('$#,##0.00;[RED]-$#,##0.00');
        } else {
            $sheet->getStyle($columna . $filaTotal)->getNumberFormat()->setFormatCode('$#,##0.00');
        }
        
        $sheet->getStyle($columna . $filaTotal)->getAlignment()->setHorizontal('center');
        $sheet->getStyle($columna . $filaTotal)->getAlignment()->setVertical('center');
    }
    
    // Altura y color de fondo
    $sheet->getRowDimension($filaTotal)->setRowHeight(25);
    $sheet->getStyle('A' . $filaTotal . ':Z' . $filaTotal)->getFill()->setFillType('solid');
    $sheet->getStyle('A' . $filaTotal . ':Z' . $filaTotal)->getFill()->getStartColor()->setRGB('D3D3D3');
    
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
    
    $sheet->getStyle('A6:AA' . $filaTotal)->applyFromArray($estiloBordesTabla);
    
    //=====================
    //  OCULTAR COLUMNAS SIN DATOS
    //=====================
    
    if (!$comidaTieneDatos) {
        $sheet->getColumnDimension('F')->setVisible(false);
    }
    
    if (!$pasajeTieneDatos) {
        $sheet->getColumnDimension('E')->setVisible(false);
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
    $sheet->getPageSetup()->setPrintArea('A1:AA' . $filaTotal);
}

//=====================
//  CREAR LAS DIFERENTES HOJAS
//=====================

// Jornalero Base
crearHoja($spreadsheet, 'PERSONAL DE BASE', function($emp) {
    $id = $emp['id_puestoEspecial'] ?? null;
    $mostrar = $emp['mostrar'] ?? false;
    return (($id == 10 || $id == 11) && $mostrar);
}, 'JORNALERO BASE');

// Jornalero Apoyo
crearHoja($spreadsheet, 'PERSONAL DE APOYO', function($emp) {
    $id = $emp['id_puestoEspecial'] ?? null;
    $mostrar = $emp['mostrar'] ?? false;
    return (($id == 37 || $id == 39) && $mostrar);
}, 'JORNALERO APOYO');

// Jornalero Vivero
crearHoja($spreadsheet, 'PERSONAL DE VIVERO', function($emp) {
    $id = $emp['id_puestoEspecial'] ?? null;
    $mostrar = $emp['mostrar'] ?? false;
    return (($id == 38) && $mostrar);
}, 'JORNALERO VIVERO');

// Coordinador Rancho
crearHoja($spreadsheet, 'COORDINADORES - RANCHO', function($emp) {
    $id = $emp['id_tipo_puesto'] ?? null;
    $mostrar = $emp['mostrar'] ?? false;
    return (($id == 4) && $mostrar);
}, 'COORDINADOR RANCHO');

// Coordinador Vivero
crearHoja($spreadsheet, 'COORDINADORES - VIVERO', function($emp) {
    $id = $emp['id_tipo_puesto'] ?? null;
    $mostrar = $emp['mostrar'] ?? false;
    return (($id == 5) && $mostrar);
}, 'COORDINADOR VIVERO');

//=====================
//  DESCARGAR ARCHIVO
//=====================

$writer = new Xlsx($spreadsheet);

$filename = 'SEM ' . str_pad($numero_semana, 2, '0', STR_PAD_LEFT) . ' - ' . $ano . ' RANCHO EL RELICARIO NOMINAS COMPLETAS - ' . date('Y-m-d_H-i-s') . '.xlsx';

header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
header('Content-Disposition: attachment; filename="' . $filename . '"');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

$writer->save('php://output');
exit;
