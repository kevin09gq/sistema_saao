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
    $date->modify("-1 day");

    // Buscar la abreviatura del mes resultante
    $mesAbrevNuevo = array_search((int) $date->format("m"), $meses);

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
$idEmpresaTarget = $_POST['empresaId'] ?? null;
$nombreEmpresaTarget = $_POST['empresaNombre'] ?? '';

// Recibir color del departamento (limpiando el #)
$colorExcel = $_POST['colorExcel'] ?? 'FF0000';
$colorExcel = str_replace('#', '', $colorExcel);

$textColor = $_POST['textColor'] ?? 'FFFFFF';
$textColor = str_replace('#', '', $textColor);

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
    $fecha_inicio = restarUnDia($jsonNomina['fecha_inicio']) ?? 'Fecha Inicio';
    $fecha_cierre = restarUnDia($jsonNomina['fecha_cierre']) ?? 'Fecha Cierre';
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

// Mergear las celdas para que los títulos ocupen toda la tabla
$sheet->mergeCells('A1:Y1');
$sheet->mergeCells('A2:Y2');
$sheet->mergeCells('A3:Y3');
$sheet->mergeCells('A4:Y4');

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
$logoPath = '../../../public/img/logo.jpg'; // Logo por defecto
if ($idEmpresaTarget == 2) {
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

// Formatear los encabezados (Negrita, Centrados, Tamaño 10, Color Dinámico)
$sheet->getStyle('A6:Y6')->getFont()->setBold(true);
$sheet->getStyle('A6:Y6')->getFont()->setSize(10);
$sheet->getStyle('A6:Y6')->getFont()->setColor(new Color($textColor));
$sheet->getStyle('A6:Y6')->getAlignment()->setHorizontal('center');
$sheet->getStyle('A6:Y6')->getAlignment()->setVertical('center');
$sheet->getStyle('A6:Y6')->getAlignment()->setWrapText(true); // Ajustar texto

// Agregar color de fondo dinámico a los encabezados
$sheet->getStyle('A6:Y6')->getFill()->setFillType('solid');
$sheet->getStyle('A6:Y6')->getFill()->getStartColor()->setRGB($colorExcel);

// Ajustar el ancho de las columnas para mejor visualización
$columnasAncho = [
    'A' => 12,   // N°
    'B' => 14,   // CD
    'C' => 65,  // NOMBRE
    'D' => 22,  // SUELDO SEMANAL
    'E' => 20,  // EXTRAS
    'F' => 22,  // TOTAL PERCEPCIONES
    'G' => 20,  // ISR
    'H' => 20,  // IMSS
    'I' => 20,  // INFONAVIT
    'J' => 22,  // AJUSTES AL SUB
    'K' => 21,  // AUSENTISMO
    'L' => 20,  // UNIFORMES
    'M' => 20,  // PERMISOS
    'N' => 20,  // RETARDOS
    'O' => 20,  // CHECADOR
    'P' => 22,  // F.A/GAFET/COFIA
    'Q' => 22,  // TOTAL DE DEDUCCIONES
    'R' => 22,  // NETO A RECIBIR
    'S' => 22,  // DISPERSION DE TARJETA
    'T' => 22,  // IMPORTE EN EFECTIVO
    'U' => 22,  // PRÉSTAMO
    'V' => 22,  // TOTAL A RECIBIR
    'W' => 20,  // REDONDEADO
    'X' => 23, // TOTAL EFECTIVO REDONDEADO
    'Y' => 25  // FIRMA RECIBIDO
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
    'E' => 14,  // EXTRAS
    'F' => 13,  // TOTAL PERCEPCIONES
    'G' => 14,  // ISR
    'H' => 14,  // IMSS
    'I' => 14,  // INFONAVIT
    'J' => 14,  // AJUSTES AL SUB
    'K' => 14,  // AUSENTISMO
    'L' => 14,  // UNIFORMES
    'M' => 14,  // PERMISOS
    'N' => 14,  // RETARDOS
    'O' => 14,  // CHECADOR
    'P' => 13,  // F.A/GAFET/COFIA
    'Q' => 13,  // TOTAL DE DEDUCCIONES
    'R' => 13,  // NETO A RECIBIR
    'S' => 13,  // DISPERSION DE TARJETA
    'T' => 13,  // IMPORTE EN EFECTIVO
    'U' => 14,  // PRÉSTAMO
    'V' => 13,  // TOTAL A RECIBIR
    'W' => 14,  // REDONDEADO
    'X' => 13, // TOTAL EFECTIVO REDONDEADO
    'Y' => 14  // FIRMA RECIBIDO
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
                    $idEmpresaEmp = $empleado['id_empresa'] ?? null;

                    // Filtrar por mostrar y por id_empresa (si se recibió un target)
                    if ($mostrar && (!$idEmpresaTarget || $idEmpresaEmp == $idEmpresaTarget)) {
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
        $sheet->getStyle('D' . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00');
    }

    // Agregar sueldo extra total
    $sueldoExtraTotal = $empleado['sueldo_extra_total'] ?? 0;
    if (!empty($sueldoExtraTotal) && $sueldoExtraTotal != 0) {
        $sheet->setCellValue('E' . $numeroFila, $sueldoExtraTotal);
        $sheet->getStyle('E' . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00');
    }

    // TOTAL PERCEPCIONES
    $sheet->setCellValue('F' . $numeroFila, '=SUM(D' . $numeroFila . ':E' . $numeroFila . ')');
    $sheet->getStyle('F' . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00');

    //=============================
    //  AGREGAR DEDUCCIONES 
    //=============================

    // Mapeo de códigos de conceptos a columnas
    $mapeoConceptos = [
        '45' => 'G',   // ISR
        '52' => 'H',   // IMSS
        '16' => 'I',   // INFONAVIT
        '107' => 'J',   // AJUSTES AL SUB
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
        $sheet->setCellValue('K' . $numeroFila, $inasistencia);
        $sheet->getStyle('K' . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
        $sheet->getStyle('K' . $numeroFila)->getFont()->setColor(new Color('FF0000'));
    }

    // UNIFORMES
    $uniformes = $empleado['uniformes'] ?? 0;
    if (!empty($uniformes) && $uniformes != 0) {
        $sheet->setCellValue('L' . $numeroFila, $uniformes);
        $sheet->getStyle('L' . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
        $sheet->getStyle('L' . $numeroFila)->getFont()->setColor(new Color('FF0000'));
    }

    // PERMISOS
    $permiso = $empleado['permiso'] ?? 0;
    if (!empty($permiso) && $permiso != 0) {
        $sheet->setCellValue('M' . $numeroFila, $permiso);
        $sheet->getStyle('M' . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
        $sheet->getStyle('M' . $numeroFila)->getFont()->setColor(new Color('FF0000'));
    }

    // RETARDOS
    $retardos = $empleado['retardos'] ?? 0;
    if (!empty($retardos) && $retardos != 0) {
        $sheet->setCellValue('N' . $numeroFila, $retardos);
        $sheet->getStyle('N' . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
        $sheet->getStyle('N' . $numeroFila)->getFont()->setColor(new Color('FF0000'));
    }

    // CHECADOR
    $checador = $empleado['checador'] ?? 0;
    if (!empty($checador) && $checador != 0) {
        $sheet->setCellValue('O' . $numeroFila, $checador);
        $sheet->getStyle('O' . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
        $sheet->getStyle('O' . $numeroFila)->getFont()->setColor(new Color('FF0000'));
    }

    // F.A/GAFET/COFIA
    $faxGafetCofia = $empleado['fa_gafet_cofia'] ?? 0;
    if (!empty($faxGafetCofia) && $faxGafetCofia != 0) {
        $sheet->setCellValue('P' . $numeroFila, $faxGafetCofia);
        $sheet->getStyle('P' . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
        $sheet->getStyle('P' . $numeroFila)->getFont()->setColor(new Color('FF0000'));
    }

    // TOTAL DE DEDUCCIONES
    $sheet->setCellValue('Q' . $numeroFila, '=SUM(G' . $numeroFila . ':P' . $numeroFila . ')');
    $sheet->getStyle('Q' . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
    $sheet->getStyle('Q' . $numeroFila)->getFont()->setColor(new Color('FF0000'));

    // NETO A RECIBIR
    $sheet->setCellValue('R' . $numeroFila, '=F' . $numeroFila . '-Q' . $numeroFila);
    $sheet->getStyle('R' . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00');

    // DISPERSION DE TARJETA 
    $tarjeta = $empleado['tarjeta'] ?? 0;
    if (!empty($tarjeta) && $tarjeta != 0) {
        $sheet->setCellValue('S' . $numeroFila, $tarjeta);
        $sheet->getStyle('S' . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
        $sheet->getStyle('S' . $numeroFila)->getFont()->setColor(new Color('FF0000'));
    }

    // IMPORTE EN EFECTIVO
    $sheet->setCellValue('T' . $numeroFila, '=R' . $numeroFila . '-S' . $numeroFila);
    $sheet->getStyle('T' . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00');

    // PRÉSTAMO 
    $prestamo = $empleado['prestamo'] ?? 0;
    if (!empty($prestamo) && $prestamo != 0) {
        $sheet->setCellValue('U' . $numeroFila, $prestamo);
        $sheet->getStyle('U' . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
        $sheet->getStyle('U' . $numeroFila)->getFont()->setColor(new Color('FF0000'));
    }

    // TOTAL A RECIBIR
    $sheet->setCellValue('V' . $numeroFila, '=T' . $numeroFila . '-U' . $numeroFila);
    $sheet->getStyle('V' . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00');

    // REDONDEADO
    $sheet->setCellValue('W' . $numeroFila, '=ROUND(V' . $numeroFila . ',0)-V' . $numeroFila);
    $sheet->getStyle('W' . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00;[RED]-$#,##0.00');

    // TOTAL EFECTIVO REDONDEADO
    $sheet->setCellValue('X' . $numeroFila, '=V' . $numeroFila . '+W' . $numeroFila);
    $sheet->getStyle('X' . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00');

    // Alineación
    $sheet->getStyle('A' . $numeroFila . ':B' . $numeroFila)->getAlignment()->setHorizontal('center');
    $sheet->getStyle('A' . $numeroFila . ':B' . $numeroFila)->getAlignment()->setVertical('center');
    $sheet->getStyle('C' . $numeroFila)->getAlignment()->setHorizontal('left');
    $sheet->getStyle('C' . $numeroFila)->getAlignment()->setVertical('center');
    $sheet->getStyle('D' . $numeroFila . ':Y' . $numeroFila)->getAlignment()->setHorizontal('center');
    $sheet->getStyle('D' . $numeroFila . ':Y' . $numeroFila)->getAlignment()->setVertical('center');

    $numeroFila++;
    $numeroEmpleado++;
}

//=====================
//  APLICAR FORMATOS A TODAS LAS CELDAS DE DATOS (INCLUSO VACIAS)
//=====================

// Iterar sobre todas las filas de datos (7 hasta numeroFila-1)
for ($fila = 7; $fila < $numeroFila; $fila++) {
    // Columnas con formato deducciones: G-J (ISR, IMSS, INFONAVIT, AJUSTES AL SUB)
    for ($col = 'G'; $col <= 'J'; $col++) {
        $sheet->getStyle($col . $fila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
        $sheet->getStyle($col . $fila)->getFont()->setColor(new Color('FF0000'));
    }

    // Columnas con formato descuentos: K-P (AUSENTISMO, UNIFORMES, PERMISOS, RETARDOS, CHECADOR, F.A/GAFET/COFIA)
    for ($col = 'K'; $col <= 'P'; $col++) {
        $sheet->getStyle($col . $fila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
        $sheet->getStyle($col . $fila)->getFont()->setColor(new Color('FF0000'));
    }

    // Columna Q: TOTAL DE DEDUCCIONES (rojo con signo negativo)
    $sheet->getStyle('Q' . $fila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
    $sheet->getStyle('Q' . $fila)->getFont()->setColor(new Color('FF0000'));

    // Columna S: DISPERSION DE TARJETA (rojo con signo negativo)
    $sheet->getStyle('S' . $fila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
    $sheet->getStyle('S' . $fila)->getFont()->setColor(new Color('FF0000'));

    // Columna U: PRESTAMO (rojo con signo negativo)
    $sheet->getStyle('U' . $fila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
    $sheet->getStyle('U' . $fila)->getFont()->setColor(new Color('FF0000'));

    // Columna W: REDONDEADO (formato condicional: positivo normal, negativo rojo)
    $sheet->getStyle('W' . $fila)->getNumberFormat()->setFormatCode('$#,##0.00;[RED]-$#,##0.00');

    // Columnas de moneda normal: D, E, F, R, T, V, X
    foreach (['D', 'E', 'F', 'R', 'T', 'V', 'X'] as $col) {
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

// Agregar fórmulas SUM para cada columna de datos (D a X)
$columnasData = ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X'];

foreach ($columnasData as $columna) {
    $rangoSuma = $columna . '7:' . $columna . ($filaTotal - 1);
    $sheet->setCellValue($columna . $filaTotal, '=IF(SUM(' . $rangoSuma . ')=0,"",SUM(' . $rangoSuma . '))');
    $sheet->getStyle($columna . $filaTotal)->getFont()->setBold(true);
    $sheet->getStyle($columna . $filaTotal)->getFont()->setSize(14);

    // Aplicar formato de moneda según la columna
    if (in_array($columna, ['G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'S', 'U'])) {
        // Formato rojo con signo negativo
        $sheet->getStyle($columna . $filaTotal)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
        $sheet->getStyle($columna . $filaTotal)->getFont()->setColor(new Color('FF0000'));
    } elseif ($columna === 'W') {
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
$sheet->getStyle('A' . $filaTotal . ':Y' . $filaTotal)->getFill()->setFillType('solid');
$sheet->getStyle('A' . $filaTotal . ':Y' . $filaTotal)->getFill()->getStartColor()->setRGB('D3D3D3'); // Gris claro

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

$sheet->getStyle('A6:Y' . $filaTotal)->applyFromArray($estiloBordesTabla);

//=====================
//  OCULTAR COLUMNAS SIN DATOS
//=====================

// Ocultar columna ISR si no tiene datos
if (!$isrTieneDatos) {
    $sheet->getColumnDimension('G')->setVisible(false);
}

// Ocultar columna IMSS si no tiene datos
if (!$imssTieneDatos) {
    $sheet->getColumnDimension('H')->setVisible(false);
}

// Ocultar columna INFONAVIT si no tiene datos
if (!$infonavitTieneDatos) {
    $sheet->getColumnDimension('I')->setVisible(false);
}

// Ocultar columna AJUSTES AL SUB si no tiene datos
if (!$ajustesAlSubTieneDatos) {
    $sheet->getColumnDimension('J')->setVisible(false);
}

// Ocultar columna AUSENTISMO si no tiene datos
if (!$ausentismoTieneDatos) {
    $sheet->getColumnDimension('K')->setVisible(false);
}

// Ocultar columna UNIFORMES si no tiene datos
if (!$uniformesTieneDatos) {
    $sheet->getColumnDimension('L')->setVisible(false);
}

// Ocultar columna PERMISOS si no tiene datos
if (!$permisoTieneDatos) {
    $sheet->getColumnDimension('M')->setVisible(false);
}

// Ocultar columna RETARDOS si no tiene datos
if (!$retardosTieneDatos) {
    $sheet->getColumnDimension('N')->setVisible(false);
}

// Ocultar columna CHECADOR si no tiene datos
if (!$checadorTieneDatos) {
    $sheet->getColumnDimension('O')->setVisible(false);
}

// Ocultar columna F.A/GAFET/COFIA si no tiene datos
if (!$faxGafetCofiaTieneDatos) {
    $sheet->getColumnDimension('P')->setVisible(false);
}

// Ocultar columnas de totales permanentemente
$sheet->getColumnDimension('F')->setVisible(false);
$sheet->getColumnDimension('Q')->setVisible(false);

//=====================
//  CONFIGURAR ALTURA DE FILAS Y TAMAÑO DE LETRA
//=====================

// Configurar tamaño de letra para cada columna (configurable)
$tamanioLetraFilas = [
    'A' => 14,  // N°
    'B' => 14,  // CD
    'C' => 16,  // NOMBRE
    'D' => 15,  // SUELDO SEMANAL
    'E' => 15,  // EXTRAS
    'F' => 15,  // TOTAL PERCEPCIONES
    'G' => 15,  // ISR
    'H' => 15,  // IMSS
    'I' => 15,  // INFONAVIT
    'J' => 15,  // AJUSTES AL SUB
    'K' => 15,  // AUSENTISMO
    'L' => 15,  // UNIFORMES
    'M' => 15,  // PERMISOS
    'N' => 15,  // RETARDOS
    'O' => 15,  // CHECADOR
    'P' => 15,  // F.A/GAFET/COFIA
    'Q' => 15,  // TOTAL DE DEDUCCIONES
    'R' => 15,  // NETO A RECIBIR
    'S' => 15,  // DISPERSION DE TARJETA
    'T' => 15,  // IMPORTE EN EFECTIVO
    'U' => 15,  // PRÉSTAMO
    'V' => 15,  // TOTAL A RECIBIR
    'W' => 15,  // REDONDEADO
    'X' => 15, // TOTAL EFECTIVO REDONDEADO
    'Y' => 15  // FIRMA RECIBIDO
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
$sheet->getPageSetup()->setPrintArea('A1:Y' . $ultimaFila);

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
