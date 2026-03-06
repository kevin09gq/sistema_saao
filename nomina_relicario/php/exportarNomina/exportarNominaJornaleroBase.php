<?php

// Incluir autoload de Composer
require_once __DIR__ . '/../../../vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Color;
use PhpOffice\PhpSpreadsheet\Worksheet\PageSetup;

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
$titulo2 = 'PERSONAL DE BASE';
$titulo3 = 'NOMINA DEL ' . strtoupper($fecha_inicio) . ' AL ' . strtoupper($fecha_cierre) . ' DEL ' . $ano;
$titulo4 = 'SEMANA ' . (isset($jsonNomina['numero_semana']) ? str_pad($jsonNomina['numero_semana'], 2, '0', STR_PAD_LEFT) : '00') . '-' . $ano;

// Agregar los títulos en las primeras filas
$sheet->setCellValue('A1', $titulo1);
$sheet->setCellValue('A2', $titulo2);
$sheet->setCellValue('A3', $titulo3);
$sheet->setCellValue('A4', $titulo4);

// Mergear las celdas para que los títulos ocupen toda la tabla
$sheet->mergeCells('A1:Z1');
$sheet->mergeCells('A2:Z2');
$sheet->mergeCells('A3:Z3');
$sheet->mergeCells('A4:Z4');

// Formatear título 1 - RANCHO EL RELICARIO (Rojo, Negrita, Tamaño 14)
$sheet->getStyle('A1')->getFont()->setBold(true);
$sheet->getStyle('A1')->getFont()->setSize(14);
$sheet->getStyle('A1')->getFont()->setColor(new Color('FF0000'));

// Formatear título 2 - PERSONAL DE BASE (Negrita, Tamaño 11)
$sheet->getStyle('A2')->getFont()->setBold(true);
$sheet->getStyle('A2')->getFont()->setSize(11);

// Formatear título 3 - NOMINA (Negrita, Tamaño 10)
$sheet->getStyle('A3')->getFont()->setBold(true);
$sheet->getStyle('A3')->getFont()->setSize(10);

// Formatear título 4 - SEMANA (Negrita, Tamaño 10)
$sheet->getStyle('A4')->getFont()->setBold(true);
$sheet->getStyle('A4')->getFont()->setSize(10);

// Centrar todos los títulos
$sheet->getStyle('A1:A4')->getAlignment()->setHorizontal('center');

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
    'TOTAL EFECTIVO REDONDEADO'
];

// Agregar los encabezados en la fila 6
$columnaLetra = 'A';
foreach ($columnas as $columna) {
    $sheet->setCellValue($columnaLetra . '6', $columna);
    $columnaLetra++;
}

// Formatear los encabezados (Negrita, Centrados, Tamaño 10, Fondo Rojo, Letra Blanca)
$sheet->getStyle('A6:Z6')->getFont()->setBold(true);
$sheet->getStyle('A6:Z6')->getFont()->setSize(10);
$sheet->getStyle('A6:Z6')->getFont()->setColor(new Color('FFFFFF')); // Letra blanca
$sheet->getStyle('A6:Z6')->getAlignment()->setHorizontal('center');
$sheet->getStyle('A6:Z6')->getAlignment()->setVertical('center');
$sheet->getStyle('A6:Z6')->getAlignment()->setWrapText(true); // Ajustar texto

// Agregar color de fondo rojo a los encabezados
$sheet->getStyle('A6:Z6')->getFill()->setFillType('solid');
$sheet->getStyle('A6:Z6')->getFill()->getStartColor()->setRGB('FF0000'); // Rojo

// Ajustar el ancho de las columnas para mejor visualización
$columnasAncho = [
    'A' => 5,   // N°
    'B' => 5,   // CD
    'C' => 30,  // NOMBRE
    'D' => 10,  // SUELDO SEMANAL
    'E' => 10,  // PASAJE
    'F' => 10,  // COMIDA
    'G' => 10,  // EXTRAS
    'H' => 12,  // TOTAL PERCEPCIONES
    'I' => 10,  // ISR
    'J' => 10,  // IMSS
    'K' => 10,  // INFONAVIT
    'L' => 12,  // AJUSTES AL SUB
    'M' => 10,  // AUSENTISMO
    'N' => 10,  // PERMISO
    'O' => 10,  // RETARDOS
    'P' => 12,  // UNIFORMES
    'Q' => 12,  // CHECADOR
    'R' => 15,  // F.A/GAFET/COFIA
    'S' => 16,  // TOTAL DE DEDUCCIONES
    'T' => 14,  // NETO A RECIBIR
    'U' => 16,  // DISPERSION DE TARJETA
    'V' => 16,  // IMPORTE EN EFECTIVO
    'W' => 10,  // PRÉSTAMO
    'X' => 12,  // TOTAL A RECIBIR
    'Y' => 12,  // REDONDEADO
    'Z' => 18   // TOTAL EFECTIVO REDONDEADO
];

// Aplicar los anchos a cada columna
foreach ($columnasAncho as $columna => $ancho) {
    $sheet->getColumnDimension($columna)->setWidth($ancho);
}

//=====================
//  AGREGAR DATOS DE EMPLEADOS JORNALEROS BASE
//=====================

$numeroFila = 7;
$numeroEmpleado = 1;

// Procesar empleados del JSON
if ($jsonNomina && isset($jsonNomina['departamentos'])) {
    foreach ($jsonNomina['departamentos'] as $departamento) {
        if (isset($departamento['empleados'])) {
            foreach ($departamento['empleados'] as $empleado) {
                // Verificar si el empleado es Jornalero Base (id_puestoEspecial = 10 o 11)
                $idPuestoEspecial = $empleado['id_puestoEspecial'] ?? null;
                
                if ($idPuestoEspecial == 10 || $idPuestoEspecial == 11) {
                    // Agregar número y clave
                    $sheet->setCellValue('A' . $numeroFila, $numeroEmpleado);
                    $sheet->setCellValue('B' . $numeroFila, $empleado['clave'] ?? '');
                    
                    // Agregar nombre en la columna NOMBRE
                    $sheet->setCellValue('C' . $numeroFila, $empleado['nombre'] ?? '');
                    
                    // Centrar y alinear datos
                    $sheet->getStyle('A' . $numeroFila . ':C' . $numeroFila)->getAlignment()->setHorizontal('center');
                    
                    $numeroFila++;
                    $numeroEmpleado++;
                }
            }
        }
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
$ultimaFila = $numeroFila - 1;
$sheet->getPageSetup()->setPrintArea('A1:Z' . $ultimaFila);

//=====================
//  DESCARGAR ARCHIVO
//=====================

$writer = new Xlsx($spreadsheet);

// Definir el nombre del archivo con fecha y hora
$filename = 'Nomina_Jornalero_Base_' . date('Y-m-d_H-i-s') . '.xlsx';

// Configurar las cabeceras para descargar el archivo
header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
header('Content-Disposition: attachment; filename="' . $filename . '"');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

// Escribir el archivo al cliente
$writer->save('php://output');
exit;
?>

