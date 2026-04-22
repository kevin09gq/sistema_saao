<?php

// Incluir autoload de Composer
require_once __DIR__ . '/../../vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Color;
use PhpOffice\PhpSpreadsheet\Worksheet\PageSetup;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Worksheet\Drawing;

//=====================
//  RECIBIR DATOS DEL JSON
//=====================

$jsonAguinaldo = null;
$departamentos_seleccionados = null;
$empleadosFiltrados = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['jsonAguinaldo'])) {
    $jsonAguinaldo = json_decode($_POST['jsonAguinaldo'], true);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['departamentos'])) {
    $departamentos_seleccionados = json_decode($_POST['departamentos'], true);
}

// Recuperar el año seleccionado por el usuario, o usar el año actual si no se proporciona
$anio = $_POST['anio'] ?? date('Y');
// Recuperar la empresa seleccionada por el usuario, o usar un valor predeterminado si no se proporciona
$empresa = $_POST['empresa'] ?? 1; // '1' para Citricos SAAO, '2' para SB citric´s group
// Determinar el nombre de la empresa basado en la selección
$nombre_empresa = ($empresa == '1') ? 'CITRICOS SAAO' : "SB CITRIC'S GROUP";

// Nombre del archivo temporal (se usará para el título del documento)
$tmp_nombre = 'REPORTE_AGUINALDOS_' . $anio . '_' . str_replace(' ', '_', $nombre_empresa) . '_' . date('Ymd_His');

//=====================
//  CONFIGURACIÓN INICIAL
//=====================

$spreadsheet = new Spreadsheet();

// Propiedades del documento
$spreadsheet->getProperties()
    ->setCreator("BRANDON HERNANDEZ LOPEZ")
    ->setLastModifiedBy("BRANDON HERNANDEZ LOPEZ")
    ->setTitle($tmp_nombre)
    ->setSubject("Reporte de Aguinaldos " . $anio)
    ->setDescription("Reporte de Aguinaldos de " . $nombre_empresa . " para el año " . $anio)
    ->setKeywords("aguinaldos, nómina, excel")
    ->setCategory("Finanzas");

// Aplicar fuente Arial como predeterminada para toda la hoja
$spreadsheet->getDefaultStyle()->getFont()->setName('Arial');

//=====================
//  DEFINIR COLUMNAS COMUNES
//=====================

$columnas = [
    'N°',
    'CLV',
    'NOMBRE',
    'PUESTO',
    'SUELDO DIARIO',
    'DIAS TRABAJADOS',
    'MESES TRABAJADOS',
    'AGUINALDO',
    'ISR',
    'DISPERCION DE TARJETA',
    'NETO PAGAR',
    'REDONDEO',
    'NETO PAGAR REDONDEADO',
    'FIRMA'
];

$columnasAncho = [
    'A' => 8,  // N°
    'B' => 14,  // CLV
    'C' => 65,  // NOMBRE
    'D' => 40,  // PUESTO
    'E' => 22,  // SUELDO DIARIO
    'F' => 22,  // DIAS TRABAJADOS
    'G' => 25,  // MESES TRABAJADOS
    'H' => 22,  // AGUINALDO
    'I' => 20,  // ISR
    'J' => 22,  // TARJETA
    'K' => 22,  // NETO PAGAR
    'L' => 22,  // REDONDEO
    'M' => 22,   // NETO PAGAR REDONDEADO
    'N' => 25    // FIRMA
];

$tamanioLetraColumnas = [
    'A' => 14,  // N°
    'B' => 14,  // CLV
    'C' => 14,  // NOMBRE
    'D' => 14,  // PUESTO
    'E' => 14,  // SUELDO DIARIO
    'F' => 14,  // DIAS TRABAJADOS
    'G' => 14,  // MESES TRABAJADOS
    'H' => 13,  // AGUINALDO
    'I' => 13,  // ISR
    'J' => 13,  // TARJETA
    'K' => 13,  // NETO PAGAR
    'L' => 13,  // REDONDEO
    'M' => 13,   // NETO PAGAR REDONDEADO
    'N' => 13    // FIRMA
];

$tamanioLetraFilas = [
    'A' => 14,  // N°
    'B' => 14,  // CLV
    'C' => 16,  // NOMBRE
    'D' => 15,  // PUESTO
    'E' => 15,  // SUELDO DIARIO
    'F' => 15,  // DIAS TRABAJADOS
    'G' => 15,  // MESES TRABAJADOS
    'H' => 15,  // AGUINALDO
    'I' => 15,  // ISR
    'J' => 15,  // TARJETA
    'K' => 15,  // NETO PAGAR
    'L' => 15,  // REDONDEO
    'M' => 15,   // NETO PAGAR REDONDEADO
    'N' => 15    // FIRMA
];

$color_primario = '85C02A'; // Verde claro
$color_secundario = '1E7842'; // Verde oscuro

//=====================
//  FUNCIÓN PARA CREAR UNA HOJA
//=====================

/**
 * Crea una nueva hoja dentro de un objeto Spreadsheet.
 *
 * Esta función genera una hoja en el libro de cálculo proporcionado,
 * asignándole un nombre y aplicando un filtro de empleados según los
 * criterios recibidos. Además, puede establecer un título secundario
 * para la hoja.
 *
 * @param Spreadsheet $spreadsheet  Instancia del libro de cálculo donde se añadirá la hoja.
 * @param string      $titulo2      Título secundario o encabezado que se mostrará en la hoja.
 * @param array       $filtroEmpleados Conjunto de empleados filtrados que se incluirán en la hoja.
 * @param string      $nombreHoja   Nombre que se asignará a la nueva hoja dentro del libro.
 *
 * @return void
 */
function crearHoja(Spreadsheet $spreadsheet, String $titulo2, array $empleados, String $nombreHoja)
{
    global $columnas, $columnasAncho, $tamanioLetraColumnas, $tamanioLetraFilas, $nombre_empresa, $anio, $color_primario, $color_secundario;

    // Crear una nueva hoja o usar la existente
    if ($nombreHoja === 'NOMBRE TMP') {
        $sheet = $spreadsheet->getActiveSheet();
    } else {
        $sheet = $spreadsheet->createSheet();
    }

    $sheet->setTitle(limpiar_nombre_hoja($nombreHoja));

    //=====================
    //  TÍTULOS
    //=====================

    $titulo1 = $nombre_empresa;
    $titulo3 = 'REPORTE DE AGUINALDOS ' . ' - ' . $anio;
    $titulo4 = 'FECHA DE GENERACIÓN: ' . formatearFecha(date('Y-m-d'));

    // Agregar los títulos en las primeras filas
    $sheet->setCellValue('A1', $titulo1);
    $sheet->setCellValue('A2', $titulo2);
    $sheet->setCellValue('A3', $titulo3);
    $sheet->setCellValue('A4', $titulo4);

    // Mergear las celdas para que los títulos ocupen toda la tabla
    $sheet->mergeCells('A1:N1');
    $sheet->mergeCells('A2:N2');
    $sheet->mergeCells('A3:N3');
    $sheet->mergeCells('A4:N4');

    // Formatear título 1 - NOMBRE DE LA EMPRESA
    $sheet->getStyle('A1')->getFont()->setBold(true); // Negrita
    $sheet->getStyle('A1')->getFont()->setSize(24); // Tamaño 24
    $sheet->getStyle('A1')->getFont()->setColor(new Color($color_primario)); // Color verde claro

    // Formatear título 2 - NOMBRE DEL DEPARTAMENTO (Negrita, Tamaño 20)
    $sheet->getStyle('A2')->getFont()->setBold(true);
    $sheet->getStyle('A2')->getFont()->setSize(20);
    $sheet->getStyle('A2')->getFont()->setColor(new Color($color_secundario));

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
    $sheet->getStyle('A6:N6')->getFont()->setBold(true);
    $sheet->getStyle('A6:N6')->getFont()->setSize(10);
    $sheet->getStyle('A6:N6')->getFont()->setColor(new Color('FFFFFF')); // Letra blanca
    $sheet->getStyle('A6:N6')->getAlignment()->setHorizontal('center');
    $sheet->getStyle('A6:N6')->getAlignment()->setVertical('center');
    $sheet->getStyle('A6:N6')->getAlignment()->setWrapText(true);

    // Agregar color de fondo a los encabezados
    $sheet->getStyle('A6:N6')->getFill()->setFillType('solid');
    $sheet->getStyle('A6:N6')->getFill()->getStartColor()->setRGB($color_primario);

    // Ajustar el ancho de las columnas
    foreach ($columnasAncho as $columna => $ancho) {
        $sheet->getColumnDimension($columna)->setWidth($ancho);
    }

    // Aplicar tamaño de letra a los encabezados (fila 6)
    foreach ($tamanioLetraColumnas as $columna => $tamanio) {
        $sheet->getStyle($columna . '6')->getFont()->setSize($tamanio);
    }

    // Agregar autofiltro a la fila de encabezados
    $sheet->setAutoFilter('A6:N6');

    // Congelar la fila de encabezados para que siempre sea visible al hacer scroll
    $sheet->freezePane('D7');


    //==================================================
    //  AGREGAR EMPLEADOS A LA HOJA
    //==================================================

    // Ordenar empleados por nombre (orden ascendente A-Z)
    usort($empleados, function ($a, $b) {
        return strcmp($a['nombre'] ?? '', $b['nombre'] ?? '');
    });

    $numeroFila = 7;
    $numeroEmpleado = 1;

    foreach ($empleados as $empleado) {

        // CONTADOR
        $sheet->setCellValue('A' . $numeroFila, $numeroEmpleado);

        // CLAVE DEL EMPLEADO
        $sheet->setCellValue('B' . $numeroFila, $empleado['clave_empleado'] ?? '');

        // NOMBRE DEL EMPLEADO
        $sheet->setCellValue('C' . $numeroFila, $empleado['nombre'] . ' ' . $empleado['ap_paterno'] . ' ' . $empleado['ap_materno']);

        // NOMBRE DEL PUESTO
        $sheet->setCellValue('D' . $numeroFila, $empleado['nombre_puesto'] ?? quitarAcentosMayusculas($empleado['nombre_departamento']));

        // Salario diario y formato de modena
        $sheet->setCellValue('E' . $numeroFila, $empleado['salario_diario'] ?? 0);
        $sheet->getStyle('E' . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00');

        // Dias trabajados
        $sheet->setCellValue('F' . $numeroFila, $empleado['dias_trabajados'] ?? 0);

        // Meses trabajados
        //$sheet->setCellValue('G' . $numeroFila, $empleado['meses_trabajados'] ?? 0);
        $sheet->setCellValue('G' . $numeroFila, '=F' . $numeroFila . '/30.4');
        $sheet->getStyle('G' . $numeroFila)->getNumberFormat()->setFormatCode('0.0');

        // Aguinaldo y formato de moneda
        if ($empleado['dias_trabajados'] < 60) {
            $sheet->setCellValue('H' . $numeroFila, 0);
        } else {
            $sheet->setCellValue(
                'H' . $numeroFila,
                '=15/365*F' . $numeroFila . '*E' . $numeroFila
            );
        }
        $sheet->getStyle('H' . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00');


        // ISR y formato de moneda
        $sheet->setCellValue('I' . $numeroFila, $empleado['isr'] ?? 0);
        $sheet->getStyle('I' . $numeroFila)->getNumberFormat()->setFormatCode('[Red]-$#,##0.00;;');

        // Tarjeta y formato de moneda
        $sheet->setCellValue('J' . $numeroFila, $empleado['tarjeta'] ?? 0);
        // $sheet->getStyle('J' . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00;[Red]-$#,##0.00'); // Esta es la linea original que hice
        $sheet->getStyle('J' . $numeroFila)->getNumberFormat()->setFormatCode('[Red]-$#,##0.00;;'); // Aplica formato rojo, signo negativo y oculta ceros

        // Neto a pagar y formato de moneda
        $sheet->setCellValue('K' . $numeroFila, '=H' . $numeroFila . '-I' . $numeroFila . '-J' . $numeroFila);
        $sheet->getStyle('K' . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00');

        // Redondeo
        $sheet->setCellValue('L' . $numeroFila, '=ROUND(K' . $numeroFila . ',0)-K' . $numeroFila); // Las funciones deben ser en ingles
        $sheet->getStyle('L' . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00;$#,##0.00;;');

        // Neto a pagar redondeado
        $sheet->setCellValue('M' . $numeroFila, '=K' . $numeroFila . '+L' . $numeroFila);
        $sheet->getStyle('M' . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00');

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


    // for ($fila = 7; $fila < $numeroFila; $fila++) {

    //     // Columnas con formato normal
    //     foreach (['E', 'H', 'L'] as $col) {
    //         $sheet->getStyle($col . $fila)
    //             ->getNumberFormat()
    //             ->setFormatCode('$#,##0.00');
    //     }

    //     // Columnas en rojo, con signo negativo y ocultando ceros
    //     foreach (['I', 'J', 'K'] as $col) {
    //         $sheet->getStyle($col . $fila)
    //             ->getNumberFormat()
    //             ->setFormatCode('[Red]-$#,##0.00;;');
    //     }
    // }

    //=====================
    //  AGREGAR FILA DE TOTALES
    //=====================

    $filaTotal = $numeroFila - 1;

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

    $sheet->getStyle('A6:N' . $filaTotal)->applyFromArray($estiloBordesTabla);

    //=====================
    //  CONFIGURAR ALTURA DE FILAS Y TAMAÑO DE LETRA
    //=====================

    $sheet->getRowDimension(1)->setRowHeight(38);
    $sheet->getRowDimension(2)->setRowHeight(32);
    $sheet->getRowDimension(3)->setRowHeight(32);
    $sheet->getRowDimension(4)->setRowHeight(32);
    $sheet->getRowDimension(5)->setRowHeight(25); // Columna en blanco entre titulos y encabezados
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
    $sheet->getPageSetup()->setPrintArea('A1:N' . $filaTotal);
}

// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// ===========================================================================================
// FUNCIONES AUXILIARES PARA HACER ALGUNAS COSAS
// ===========================================================================================
// +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

/**
 * Limpia y formatea un nombre de hoja para que sea compatible con las restricciones de Excel.
 * 
 * @param string $nombre El nombre original de la hoja.
 * @return string El nombre limpio y formateado para la hoja de Excel.
 */
function limpiar_nombre_hoja($nombre)
{
    // 1. Normalizar espacios
    $nombre = trim(preg_replace('/\s+/', ' ', $nombre));

    // 2. Reglas específicas
    if (strcasecmp($nombre, 'Seguridad Vigilancia e Intendencia') === 0) {
        $nombre = 'Vigilancia';
    }

    if (strcasecmp($nombre, 'Administracion Sucursal CdMx') === 0) {
        $nombre = 'Admin. CdMx';
    }

    // 3. Quitar la palabra "Rancho"
    $nombre = preg_replace('/\bRancho\b/i', '', $nombre);

    // 4. Reemplazos de abreviaciones
    $nombre = preg_replace('/\bCoordinadores?\b/i', 'Coordi', $nombre);
    $nombre = preg_replace('/\bJornaleros\b/i', 'Jorna', $nombre);

    // 5. Limpiar espacios otra vez
    $nombre = trim(preg_replace('/\s+/', ' ', $nombre));

    // 6. Quitar caracteres no permitidos en Excel
    $nombre = preg_replace('/[\\/*?:[\]]/', '', $nombre);

    // 7. Convertir a MAYÚSCULAS
    $nombre = mb_strtoupper($nombre, 'UTF-8');

    // 8. Limitar a 31 caracteres
    $nombre = substr($nombre, 0, 31);

    return $nombre;
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
 * Elimina acentos y convierte un texto a mayúsculas.
 * 
 * @param string $texto El texto original que puede contener acentos y mayúsculas.
 * @return string El texto sin acentos y en mayúsculas.
 */
function quitarAcentosMayusculas($texto)
{
    // Normalizar caracteres con acento
    $acentos = array(
        'Á' => 'A',
        'É' => 'E',
        'Í' => 'I',
        'Ó' => 'O',
        'Ú' => 'U',
        'á' => 'A',
        'é' => 'E',
        'í' => 'I',
        'ó' => 'O',
        'ú' => 'U',
        'Ñ' => 'N',
        'ñ' => 'N',
        'Ü' => 'U',
        'ü' => 'U'
    );

    // Reemplazar acentos
    $sinAcentos = strtr($texto, $acentos);

    // Convertir a mayúsculas
    return strtoupper($sinAcentos);
}



//=====================
//  CREAR LAS DIFERENTES HOJAS
//=====================

// 1. Filtrar empleados por id_empresa
$empleadosFiltrados = array_values(array_filter(
    $jsonAguinaldo,
    fn($emp) => ($emp['id_empresa'] ?? null) == $empresa
));

// 2. Filtrar empleados por departamentos seleccionados
$empleadosPorDepartamento = [];

foreach ($empleadosFiltrados as $emp) {
    $empleadosPorDepartamento[$emp['id_departamento']][] = $emp;
}

// 3. Generar las hojas por cada departamento seleccionado
foreach ($departamentos_seleccionados as $departamento) {

    // Obtener empleados del departamento actual
    $empleados = $empleadosPorDepartamento[$departamento['id_departamento']] ?? [];

    // Si no hay empleados, no crear la hoja
    if (empty($empleados)) {
        continue;
    }

    // Crear hoja para el departamento actual
    crearHoja(
        $spreadsheet,
        $departamento['nombre_departamento'],
        $empleados,
        $departamento['nombre_departamento']
    );
}

// 4. Eliminar hoja vacía por defecto
if ($spreadsheet->getSheetCount() > 1) {
    $spreadsheet->removeSheetByIndex(0);
}

//=====================
//  DESCARGAR ARCHIVO 
//===================== 

$writer = new Xlsx($spreadsheet);

$tmp_nombre .= '.xlsx';

header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
header('Content-Disposition: attachment; filename="' . $tmp_nombre . '"');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

$writer->save('php://output');
exit;