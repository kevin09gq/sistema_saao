<?php

require_once __DIR__ . '/../../vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Color;
use PhpOffice\PhpSpreadsheet\Worksheet\PageSetup;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Worksheet\Drawing;
use PhpOffice\PhpSpreadsheet\Shared\Date;


/** ------------------------------------ FUNCIONES AUXILIARES ------------------------------------ **/

/**
 * Devuelve el nombre del mes correspondiente al número proporcionado.
 * @param int $numeroMes Número del mes (1-12).
 * @return string Nombre del mes en mayúsculas, o "MES INVÁLIDO" si el número no es válido.
 */
function nombreMes($numeroMes)
{
    $meses = [
        1 => "ENERO",
        2 => "FEBRERO",
        3 => "MARZO",
        4 => "ABRIL",
        5 => "MAYO",
        6 => "JUNIO",
        7 => "JULIO",
        8 => "AGOSTO",
        9 => "SEPTIEMBRE",
        10 => "OCTUBRE",
        11 => "NOVIEMBRE",
        12 => "DICIEMBRE"
    ];

    return $meses[$numeroMes] ?? "MES INVÁLIDO";
}


/**
 * Convierte una fecha en formato Y-m-d a d/MES/Y con el mes abreviado en español.
 *
 * Ejemplo:
 *   Entrada: "2026-01-12"
 *   Salida:  "12/ENE/2026"
 *
 * @param string $fecha Fecha en formato Y-m-d (ej. "2026-01-12")
 * @return string Fecha formateada (ej. "12/ENE/2026")
 */
function formatearFecha($fecha)
{
    // Array de meses abreviados en español
    $meses = [
        1 => 'ENE',
        2 => 'FEB',
        3 => 'MAR',
        4 => 'ABR',
        5 => 'MAY',
        6 => 'JUN',
        7 => 'JUL',
        8 => 'AGO',
        9 => 'SEP',
        10 => 'OCT',
        11 => 'NOV',
        12 => 'DIC'
    ];

    // Crear objeto DateTime desde la fecha
    $dt = DateTime::createFromFormat('Y-m-d', $fecha);

    if (!$dt) {
        return ''; // Si la fecha no es válida, devolver vacío
    }

    $dia = $dt->format('d');
    $mes = $meses[(int)$dt->format('m')];
    $anio = $dt->format('Y');

    return "{$dia}/{$mes}/{$anio}";
}

/**
 * Calcula la suma de rejas de un vale individual
 * @param array $vale - Un registro de corte con su arreglo 'rejas'
 * @return int - Total de rejas en ese vale
 */
function sumarRejasVale($vale)
{
    $totalRejas = 0;

    if (isset($vale['rejas']) && is_array($vale['rejas'])) {
        foreach ($vale['rejas'] as $r) {
            $totalRejas += $r['rejas'];
        }
    }

    return $totalRejas;
}

/** ------------------------------------------------------------------------------------------------ **/



// ===============================================================================================
//  RECIBIR DATOS DEL JSON
// ===============================================================================================

$vales = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['vales'])) {
    $vales = json_decode($_POST['vales'], true);
}

$rancho_nombre = $_POST['rancho_nombre'] ?? 'RANCHO';
$anio = $_POST['anio'] ?? '2026';
$mes = $_POST['mes'] ?? '1';
$semana = $_POST['semana'] ?? '1';


// ===============================================================================================
//  CONFIGURACIÓN INICIAL
// ===============================================================================================

$tmp_nombre = 'REPORTE_CORTES_RANCHO-' . strtoupper($rancho_nombre) . '_' . date('Ymd_His');

$spreadsheet = new Spreadsheet();
$sheet = $spreadsheet->getActiveSheet();

// Propiedades del documento
$spreadsheet->getProperties()
    ->setCreator("BRANDON HERNANDEZ LOPEZ")
    ->setLastModifiedBy("BRANDON HERNANDEZ LOPEZ")
    ->setTitle($tmp_nombre)
    ->setSubject("Reporte de Cortes de " . $rancho_nombre)
    ->setDescription("Reporte de Cortes de " . $rancho_nombre)
    ->setKeywords("cortes, nómina, excel")
    ->setCategory("Finanzas");

// Aplicar fuente Arial como predeterminada para toda la hoja
$spreadsheet->getDefaultStyle()->getFont()->setName('Arial');

// Titulo de la hoja
$sheet->setTitle('CORTE');

// ===============================================================================================
//  DEFINIR COLUMNAS COMUNES
// ===============================================================================================

$columnas = [
    'N°',
    'NOMINA',
    'FOLIO',
    'FECHA CORTE',
    'NOMBRE CABO',
    'TOTAL REJAS',
    'PRECIO POR REJA',
    'TOTAL EFECTIVO',
    'FIRMA'
];

$columnas_ancho = [
    'A' => 5,   // N°
    'B' => 15,  // NOMINA
    'C' => 15,  // FOLIO
    'D' => 20,  // FECHA CORTE
    'E' => 30,  // NOMBRE CABO
    'F' => 15,  // TOTAL REJAS
    'G' => 15,  // PRECIO POR REJA
    'H' => 20,  // TOTAL EFECTIVO
    'I' => 30   // FIRMA
];

$tamanio_letra_columnas = [
    'A' => 14,   // N°
    'B' => 14,  // NOMINA
    'C' => 14,  // FOLIO
    'D' => 14,  // FECHA CORTE
    'E' => 14,  // NOMBRE CABO
    'F' => 14,  // TOTAL REJAS
    'G' => 14,  // PRECIO POR REJA
    'H' => 14,  // TOTAL EFECTIVO
    'I' => 14   // FIRMA
];

$tamanio_letra_filas = [
    'A' => 12,   // N°
    'B' => 12,  // NOMINA
    'C' => 12,  // FOLIO
    'D' => 12,  // FECHA CORTE
    'E' => 12,  // NOMBRE CABO
    'F' => 12,  // TOTAL REJAS
    'G' => 12,  // PRECIO POR REJA
    'H' => 12,  // TOTAL EFECTIVO
    'I' => 12   // FIRMA
];

// COLOR PARA LA GENERACION DE EXCEL
$color_primario = '00BF23';
$color_secundario = '005206';
$color_blanco = 'FFFFFF';
$color_negro = '000000';


// ===============================================================================================
//  TÍTULOS PRINCIPALES
// ===============================================================================================

$titulo1 = 'RANCHO ' . strtoupper($rancho_nombre);
$titulo2 = 'REPORTE DE CORTE DE REJAS';
$titulo3 = '';
$titulo4 = 'FECHA DE GENERACIÓN: ' . formatearFecha(date('Y-m-d'));

// Construir título3 según filtros
if ($anio == -1 && $mes == -1 && $semana == -1) {
    $titulo3 = "TODOS LOS AÑOS";
} elseif ($anio != -1 && $mes == -1 && $semana == -1) {
    $titulo3 = "AÑO " . $anio; // Ej. "AÑO 2023"
} elseif ($anio != -1 && $mes != -1 && $semana == -1) {
    // Nombre del mes
    $nombreMes = nombreMes($mes);
    $titulo3 = strtoupper($nombreMes) . " " . $anio; // Ejem. "ENERO 2023"
} elseif ($anio != -1 && $mes != -1 && $semana != -1) {
    $nombreMes = nombreMes($mes);
    $titulo3 = "SEMANA " . $semana . " - " . strtoupper($nombreMes) . " " . $anio; // Ejem. "SEMANA 2 - ENERO 2023"
} else {
    $titulo3 = "Parámetros inválidos";
}

// Agregar los títulos en las primeras filas
$sheet->setCellValue('A1', $titulo1);
$sheet->setCellValue('A2', $titulo2);
$sheet->setCellValue('A3', $titulo3);
$sheet->setCellValue('A4', $titulo4);

// Mergear las celdas para que los títulos ocupen toda la tabla
$sheet->mergeCells('A1:I1');
$sheet->mergeCells('A2:I2');
$sheet->mergeCells('A3:I3');
$sheet->mergeCells('A4:I4');

// Formatear título 1 - NOMBRE DE LA EMPRESA
$sheet->getStyle('A1')->getFont()->setBold(true); // Negrita
$sheet->getStyle('A1')->getFont()->setSize(24); // Tamaño 24
$sheet->getStyle('A1')->getFont()->setColor(new Color($color_primario)); // Color verde claro

// Formatear título 2 - REPORTE DE CORTE DE REJAS
$sheet->getStyle('A2')->getFont()->setBold(true);
$sheet->getStyle('A2')->getFont()->setSize(20);
$sheet->getStyle('A2')->getFont()->setColor(new Color($color_secundario)); // Color verde oscuro

// Formatear título 3 - REFERENCIA DEL REPORTE Y AÑO
$sheet->getStyle('A3')->getFont()->setBold(true);
$sheet->getStyle('A3')->getFont()->setSize(14);

// Formatear título 4 - FECHA DE GENERACIÓN DEL REPORTE
$sheet->getStyle('A4')->getFont()->setBold(true);
$sheet->getStyle('A4')->getFont()->setSize(12);

// Centrar todos los títulos
$sheet->getStyle('A1:A3')->getAlignment()->setHorizontal('center');
$sheet->getStyle('A4')->getAlignment()->setHorizontal('right');
$sheet->getStyle('A1:A4')->getAlignment()->setVertical('center');

// Insertar logo a la derecha de los títulos
$logoPath = '../../public/img/logo.jpg';
if (file_exists($logoPath)) {
    $logo = new Drawing();
    $logo->setName('Logo');
    $logo->setDescription('Logo de la empresa');
    $logo->setPath($logoPath);
    $logo->setHeight(190); // Altura en píxeles
    $logo->setCoordinates('B1');
    $logo->setOffsetX(10);
    $logo->setWorksheet($sheet);
}


//============================================================
//  ENCABEZADOS DE LA TABLA
//============================================================

// Agregar los encabezados en la fila 6
$columnaLetra = 'A';
foreach ($columnas as $columna) {
    $sheet->setCellValue($columnaLetra . '6', $columna);
    $columnaLetra++;
}

// Formatear los encabezados (Negrita, Centrados, Tamaño 10, Fondo Rojo, Letra Blanca)
$sheet->getStyle('A6:I6')->getFont()->setBold(true);
$sheet->getStyle('A6:I6')->getFont()->setSize(10);
$sheet->getStyle('A6:I6')->getFont()->setColor(new Color($color_negro));
$sheet->getStyle('A6:I6')->getAlignment()->setHorizontal('center');
$sheet->getStyle('A6:I6')->getAlignment()->setVertical('center');
$sheet->getStyle('A6:I6')->getAlignment()->setWrapText(true);

// Agregar color de fondo a los encabezados
$sheet->getStyle('A6:I6')->getFill()->setFillType('solid');
$sheet->getStyle('A6:I6')->getFill()->getStartColor()->setRGB($color_primario);

// Ajustar el ancho de las columnas
foreach ($columnas_ancho as $columna => $ancho) {
    $sheet->getColumnDimension($columna)->setWidth($ancho);
}

// Aplicar tamaño de letra a los encabezados (fila 6)
foreach ($tamanio_letra_columnas as $columna => $tamanio) {
    $sheet->getStyle($columna . '6')->getFont()->setSize($tamanio);
}

// Agregar autofiltro a la fila de encabezados
$sheet->setAutoFilter('A6:I6');

// Congelar la fila de encabezados para que siempre sea visible al hacer scroll
$sheet->freezePane('D7');


// ===============================================================================================
// AGREGAR LOS DATOS A LA TABLA
// ===============================================================================================

// Ordenar los vales por folio de menor a mayor
usort($vales, function ($a, $b) {
    return (int)($a['folio'] ?? 0) <=> (int)($b['folio'] ?? 0);
});

$numeroFila = 7;
$numeroVale = 1;

// RECORRER CADA VALE Y AGREGAR SUS DATOS A LA TABLA
foreach ($vales as $vale) {

    if ($vale['estado'] != 1) continue; // Saltar vales que no estén activos

    // CONTADOR
    $sheet->setCellValue('A' . $numeroFila, $numeroVale);
    // NOMINA
    $nomina_tmp = $vale['anio'] ? 'Sem ' . $vale['numero_semana'] . ' / ' . $vale['anio'] : 'Pendiente';
    $sheet->setCellValue('B' . $numeroFila, $nomina_tmp);
    // FOLIO
    $sheet->setCellValue('C' . $numeroFila, $vale['folio'] ?? '');
    // FECHA CORTE
    $fecha = new DateTime($vale['fecha_corte']);
    $sheet->setCellValue('D' . $numeroFila, Date::PHPToExcel($fecha));
    $sheet->getStyle('D' . $numeroFila)
        ->getNumberFormat()
        ->setFormatCode('dd/mmmm/yyyy');
    // NOMBRE CABO
    $sheet->setCellValue('E' . $numeroFila, $vale['nombre_cortador'] ?? '');
    // TOTAL REJAS
    $totalRejas = sumarRejasVale($vale);
    $sheet->setCellValue('F' . $numeroFila, $totalRejas);
    // PRECIO POR REJA
    $sheet->setCellValue('G' . $numeroFila, $vale['precio_reja'] ?? 0);
    $sheet->getStyle('G' . $numeroFila)
        ->getNumberFormat()
        ->setFormatCode('$#,##0.00;;');
    // TOTAL EFECTIVO
    $sheet->setCellValue('H' . $numeroFila, '=F' . $numeroFila . '*G' . $numeroFila);
    $sheet->getStyle('H' . $numeroFila)
        ->getNumberFormat()
        ->setFormatCode('$#,##0.00;;');

    // Alineación
    $sheet->getStyle('A' . $numeroFila . ':B' . $numeroFila)->getAlignment()->setHorizontal('center');
    $sheet->getStyle('A' . $numeroFila . ':B' . $numeroFila)->getAlignment()->setVertical('center');
    $sheet->getStyle('C' . $numeroFila)->getAlignment()->setHorizontal('center');
    $sheet->getStyle('C' . $numeroFila)->getAlignment()->setVertical('center');
    $sheet->getStyle('D' . $numeroFila . ':E' . $numeroFila)->getAlignment()->setHorizontal('center');
    $sheet->getStyle('D' . $numeroFila . ':E' . $numeroFila)->getAlignment()->setVertical('center');
    $sheet->getStyle('F' . $numeroFila . ':H' . $numeroFila)->getAlignment()->setHorizontal('center');
    $sheet->getStyle('F' . $numeroFila . ':H' . $numeroFila)->getAlignment()->setVertical('center');

    // INCREMENTAR CONTADORES
    $numeroFila++;
    $numeroVale++;
}

// ===============================================================================================
//  AGREGAR FILA DE TOTALES
// ===============================================================================================

$filaTotal = $numeroFila;
$primera_fila = 7;
$ultima_fila = $filaTotal - 1;

// Agregar la palabra "TOTALES" en la columna B de la fila siguiente al último empleado
$sheet->setCellValue('B' . $filaTotal, 'TOTALES');
// Poner bold a la palabra "TOTALES"
$sheet->getStyle('B' . $filaTotal)->getFont()->setBold(true);

// Aplicar fondo gris a toda la fila de totales
$sheet->getStyle('A' . $filaTotal . ':I' . $filaTotal)->getFill()
    ->setFillType('solid')->getStartColor()->setRGB('E8E8E8');
// TAMAÑO DE LETRA EN LA FILA DE TOTALES
$sheet->getStyle('A' . $filaTotal . ':I' . $filaTotal)->getFont()->setSize(14);
// Centrar el texto en la fila de totales
$sheet->getStyle('A' . $filaTotal . ':I' . $filaTotal)->getAlignment()->setVertical('center');
$sheet->getStyle('A' . $filaTotal . ':I' . $filaTotal)->getAlignment()->setHorizontal('center');
// Altura de la fila de totales
$sheet->getRowDimension($filaTotal)->setRowHeight(46);

// SUMAR VALORES DE LA COLUMNA F (TOTAL REJAS) Y PONER EL RESULTADO EN LA FILA DE TOTALES
$sheet->setCellValue('F' . $filaTotal, '=SUM(F' . $primera_fila . ':F' . $ultima_fila . ')');

// SUMAR VALORES DE LA COLUMNA H (TOTAL EFECTIVO) Y PONER EL RESULTADO EN LA FILA DE TOTALES
$sheet->setCellValue('H' . $filaTotal, '=SUM(H' . $primera_fila . ':H' . $ultima_fila . ')');
$sheet->getStyle('H' . $filaTotal)->getNumberFormat()->setFormatCode('$#,##0.00;;');


// ===============================================================================================
//  AGREGAR BORDES A TODA LA TABLA
// ===============================================================================================

$estiloBordesTabla = [
    'borders' => [
        'allBorders' => [
            'borderStyle' => Border::BORDER_THIN,
            'color' => ['rgb' => $color_negro],
        ],
    ],
];

$sheet->getStyle('A6:I' . $filaTotal)->applyFromArray($estiloBordesTabla);



// ===============================================================================================
//  CONFIGURAR ALTURA DE FILAS Y TAMAÑO DE LETRA
// ===============================================================================================

$sheet->getRowDimension(1)->setRowHeight(38);
$sheet->getRowDimension(2)->setRowHeight(32);
$sheet->getRowDimension(3)->setRowHeight(32);
$sheet->getRowDimension(4)->setRowHeight(32);
$sheet->getRowDimension(5)->setRowHeight(25); // Columna en blanco entre titulos y encabezados
$sheet->getRowDimension(6)->setRowHeight(45);

$alturaFilas = 48;

for ($fila = 7; $fila < $numeroFila; $fila++) {
    $sheet->getRowDimension($fila)->setRowHeight($alturaFilas);

    foreach ($tamanio_letra_filas as $columna => $tamanio) {
        $sheet->getStyle($columna . $fila)->getFont()->setSize($tamanio);
    }
}


if ($spreadsheet->getSheetCount() > 1) {
    $spreadsheet->removeSheetByIndex(0);
}

// ===============================================================================================
//  DESCARGAR ARCHIVO 
// ===============================================================================================

$writer = new Xlsx($spreadsheet);

$tmp_nombre .= '.xlsx';

header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
header('Content-Disposition: attachment; filename="' . $tmp_nombre . '"');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

$writer->save('php://output');
exit;
