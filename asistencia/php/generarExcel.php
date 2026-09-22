<?php
/**
 * Generador de Plantilla de Lista de Asistencia en Excel
 * Sistema SAAO
 */

require_once __DIR__ . '/../../vendor/autoload.php';
require_once __DIR__ . '/../../conexion/conexion.php';
require_once __DIR__ . '/../../config/config.php';

verificarSesion();

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Font;
use PhpOffice\PhpSpreadsheet\Cell\Coordinate;
use PhpOffice\PhpSpreadsheet\Worksheet\PageSetup;

// Validar método POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    die('Acceso no permitido.');
}

// ─────────────────────────────────────────────────────────────
// 1. OBTENCIÓN Y SANITIZACIÓN DE PARÁMETROS
// ─────────────────────────────────────────────────────────────
$rawIds = $_POST['empleados_ids'] ?? '[]';
$empleadosIds = json_decode($rawIds, true);

if (!is_array($empleadosIds) || empty($empleadosIds)) {
    die('No se seleccionaron empleados para generar la lista.');
}

// Filtrar IDs numéricos
$empleadosIds = array_map('intval', $empleadosIds);
$empleadosIds = array_filter($empleadosIds, function($id) { return $id > 0; });

if (empty($empleadosIds)) {
    die('Lista de IDs de empleados inválida.');
}

$textoSemana   = trim($_POST['texto_semana'] ?? 'SEMANA');
$numSemanaRaw  = trim($_POST['num_semana'] ?? '');
if ($numSemanaRaw !== '') {
    $numSemana = (stripos($numSemanaRaw, 'SEM') === false) ? 'SEM ' . $numSemanaRaw : $numSemanaRaw;
} else {
    $numSemana = 'SEM';
}
$departamento  = trim($_POST['departamento'] ?? 'departamento');
$empresa       = trim($_POST['empresa'] ?? 'CITRICOS SAAO');
$dias          = $_POST['dias'] ?? ['VIERNES', 'SABADO', 'DOMINGO'];

if (!is_array($dias) || empty($dias)) {
    $dias = ['VIERNES', 'SABADO', 'DOMINGO'];
}

// ─────────────────────────────────────────────────────────────
// 2. CONSULTA DE EMPLEADOS A LA BASE DE DATOS
// ─────────────────────────────────────────────────────────────
$inIds = implode(',', $empleadosIds);
$sql = "SELECT id_empleado, clave_empleado, nombre, ap_paterno, ap_materno, sexo
        FROM info_empleados
        WHERE id_empleado IN ($inIds)
        ORDER BY ap_paterno ASC, ap_materno ASC, nombre ASC";

$resultado = mysqli_query($conexion, $sql);
$empleados = [];
if ($resultado) {
    while ($fila = mysqli_fetch_assoc($resultado)) {
        $nombreCompleto = trim("{$fila['nombre']} {$fila['ap_paterno']} {$fila['ap_materno']}");
        $empleados[] = [
            'nombre' => mb_strtoupper($nombreCompleto, 'UTF-8'),
            'sexo' => $fila['sexo']
        ];
    }
}

if (empty($empleados)) {
    die('No se encontraron datos para los empleados seleccionados.');
}

// ─────────────────────────────────────────────────────────────
// 3. CONSTRUCCIÓN DE LA HOJA DE CÁLCULO
// ─────────────────────────────────────────────────────────────
$spreadsheet = new Spreadsheet();
$sheet = $spreadsheet->getActiveSheet();
$sheet->setTitle('Lista de Asistencia');

// ── CONFIGURACIÓN DE PÁGINA PARA IMPRESIÓN ──
// Orientación horizontal (Landscape)
$sheet->getPageSetup()->setOrientation(PageSetup::ORIENTATION_LANDSCAPE);
$sheet->getPageSetup()->setPaperSize(PageSetup::PAPERSIZE_LETTER);

// Ajustar para que quepan todos los días a lo ancho en 1 página
$sheet->getPageSetup()->setFitToPage(true);
$sheet->getPageSetup()->setFitToWidth(1);
$sheet->getPageSetup()->setFitToHeight(0); // Permite paginación vertical libre si hay muchos empleados

// Márgenes de página optimizados para aprovechar el ancho completo
$sheet->getPageMargins()->setTop(0.4);
$sheet->getPageMargins()->setRight(0.25);
$sheet->getPageMargins()->setLeft(0.25);
$sheet->getPageMargins()->setBottom(0.4);
$sheet->getPageMargins()->setHeader(0.2);
$sheet->getPageMargins()->setFooter(0.2);

// Centrar horizontalmente al imprimir
$sheet->getPageSetup()->setHorizontalCentered(true);

// Repetir encabezados (filas 1 a 4) en cada página impresa si hay varios empleados
$sheet->getPageSetup()->setRowsToRepeatAtTopByStartAndEnd(1, 4);

// Mostrar y forzar impresión de líneas de cuadrícula
$sheet->setShowGridLines(true);
$sheet->setPrintGridLines(true);

// Estilos globales de fuente
$spreadsheet->getDefaultStyle()->getFont()->setName('Arial')->setSize(9);

// Colores
$colorAmarillo = 'FFFF00'; // Amarillo idéntico a la plantilla
$colorBorde    = '000000'; // Bordes negros limpios
$colorAzul     = 'D6EAF8'; // Azul claro para varones
$colorRosa     = 'F5B7B1'; // Rosa claro para mujeres

$bordeDelgado = [
    'borders' => [
        'allBorders' => [
            'borderStyle' => Border::BORDER_THIN,
            'color'       => ['rgb' => $colorBorde],
        ],
    ],
];

// ─────────────────────────────────────────────────────────────
// FILA 1: ENCABEZADOS SUPERIORES DINÁMICOS
// A1: departamento | C1..: SEMANA DEL... | Penúltimo: EMPRESA | Último: SEM XX
// ─────────────────────────────────────────────────────────────
$sheet->getRowDimension(1)->setRowHeight(24);

// Departamento en A1
$sheet->setCellValue('A1', $departamento ?: 'departamento');
$sheet->getStyle('A1')->getFont()->setBold(true)->setSize(9);
$sheet->getStyle('A1')->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);

// Calcular columnas de los días
$numDias = count($dias);
$colInicioDias = 3; // Inicia en Col C (3)
$colFinDias = $colInicioDias + ($numDias * 4) - 1;
$colGafet = $colFinDias + 1; // Columna final para 'DIAS SIN GAFET'

$letraInicioDias = Coordinate::stringFromColumnIndex($colInicioDias);
$letraFinDias    = Coordinate::stringFromColumnIndex($colFinDias);
$letraGafet      = Coordinate::stringFromColumnIndex($colGafet);

// Anchos de columnas y tamaños de fuente adaptativos según la cantidad de días
if ($numDias === 1) {
    $anchoEntrada = 14;
    $anchoSale    = 16;
    $anchoEntra   = 16;
    $anchoSalida  = 14;
    $anchoGafet   = 14;
    $anchoNombre  = 38;
    $tamFuenteDia = 9;
    $tamFuenteSub = 8;
} elseif ($numDias === 2) {
    $anchoEntrada = 11;
    $anchoSale    = 11;
    $anchoEntra   = 11;
    $anchoSalida  = 11;
    $anchoGafet   = 12;
    $anchoNombre  = 38;
    $tamFuenteDia = 9;
    $tamFuenteSub = 8;
} elseif ($numDias <= 4) {
    $anchoEntrada = 9;
    $anchoSale    = 7.5;
    $anchoEntra   = 7.5;
    $anchoSalida  = 9;
    $anchoGafet   = 11;
    $anchoNombre  = 36;
    $tamFuenteDia = 9;
    $tamFuenteSub = 8;
} else {
    // 5 a 7 días (plantilla semanal completa)
    $anchoEntrada = 8.5; // Espacio suficiente para que 'ENTRADA' nunca se corte
    $anchoSale    = 5.2;
    $anchoEntra   = 5.2;
    $anchoSalida  = 8.2;
    $anchoGafet   = 8.5;
    $anchoNombre  = 30;
    $tamFuenteDia = 8;
    $tamFuenteSub = 7;
}

// Combinación inteligente de celdas en la Fila 1
if ($numDias === 1) {
    // 1 Día: C1:E1 para Semana, F1 para Empresa, G1 para SEM
    $sheet->mergeCells("C1:E1");
    $sheet->setCellValue("C1", mb_strtoupper($textoSemana, 'UTF-8'));
    $sheet->getStyle("C1")->getFont()->setBold(true)->setSize(10);
    $sheet->getStyle("C1")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER)->setVertical(Alignment::VERTICAL_CENTER);

    $sheet->setCellValue("F1", mb_strtoupper($empresa, 'UTF-8'));
    $sheet->getStyle("F1")->getFont()->setBold(true)->setSize(8);
    $sheet->getStyle("F1")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT)->setVertical(Alignment::VERTICAL_CENTER);
} elseif ($numDias === 2) {
    // 2 Días: C1:H1 para Semana, I1:J1 para Empresa, K1 para SEM
    $sheet->mergeCells("C1:H1");
    $sheet->setCellValue("C1", mb_strtoupper($textoSemana, 'UTF-8'));
    $sheet->getStyle("C1")->getFont()->setBold(true)->setSize(11);
    $sheet->getStyle("C1")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER)->setVertical(Alignment::VERTICAL_CENTER);

    $sheet->mergeCells("I1:J1");
    $sheet->setCellValue("I1", mb_strtoupper($empresa, 'UTF-8'));
    $sheet->getStyle("I1")->getFont()->setBold(true)->setSize(8);
    $sheet->getStyle("I1")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT)->setVertical(Alignment::VERTICAL_CENTER);
} else {
    // 3 o más días
    $colFinSemana = $colFinDias - 2;
    $letraFinSemana = Coordinate::stringFromColumnIndex($colFinSemana);

    $sheet->mergeCells("C1:{$letraFinSemana}1");
    $sheet->setCellValue("C1", mb_strtoupper($textoSemana, 'UTF-8'));
    $sheet->getStyle("C1")->getFont()->setBold(true)->setSize(11);
    $sheet->getStyle("C1")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER)->setVertical(Alignment::VERTICAL_CENTER);

    $colEmpresaInicio = $colFinSemana + 1;
    $letraEmpresaInicio = Coordinate::stringFromColumnIndex($colEmpresaInicio);
    if ($colEmpresaInicio < $colFinDias) {
        $sheet->mergeCells("{$letraEmpresaInicio}1:{$letraFinDias}1");
    }
    $sheet->setCellValue("{$letraEmpresaInicio}1", mb_strtoupper($empresa, 'UTF-8'));
    $sheet->getStyle("{$letraEmpresaInicio}1")->getFont()->setBold(true)->setSize(8);
    $sheet->getStyle("{$letraEmpresaInicio}1")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT)->setVertical(Alignment::VERTICAL_CENTER);
}

// Celda "SEM XX" en la fila 1 sobre la columna GAFET
$sheet->setCellValue("{$letraGafet}1", mb_strtoupper($numSemana, 'UTF-8'));
$sheet->getStyle("{$letraGafet}1")->getFont()->setBold(true)->setSize(9);
$sheet->getStyle("{$letraGafet}1")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER)->setVertical(Alignment::VERTICAL_CENTER);
$sheet->getStyle("{$letraGafet}1")->applyFromArray($bordeDelgado);

// ─────────────────────────────────────────────────────────────
// FILAS 2, 3 Y 4: ESTRUCTURA DE ENCABEZADOS DE LA TABLA
// ─────────────────────────────────────────────────────────────
$sheet->getRowDimension(2)->setRowHeight(18);
$sheet->getRowDimension(3)->setRowHeight(16);
$sheet->getRowDimension(4)->setRowHeight(18);

// Columna B: NOMBRE (Combinada verticalmente B2:B4 con fondo amarillo)
$sheet->mergeCells('B2:B4');
$sheet->setCellValue('B2', 'NOMBRE');
$sheet->getStyle('B2:B4')->getFont()->setBold(true)->setSize(10);
$sheet->getStyle('B2:B4')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER)->setVertical(Alignment::VERTICAL_CENTER);
$sheet->getStyle('B2:B4')->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB($colorAmarillo);
$sheet->getStyle('B2:B4')->applyFromArray($bordeDelgado);

// Recorrer cada día seleccionado y generar sus 4 columnas
$colActual = 3;

foreach ($dias as $nombreDia) {
    $c1 = Coordinate::stringFromColumnIndex($colActual);     // ENTRADA
    $c2 = Coordinate::stringFromColumnIndex($colActual + 1); // Sale
    $c3 = Coordinate::stringFromColumnIndex($colActual + 2); // Entra
    $c4 = Coordinate::stringFromColumnIndex($colActual + 3); // SALIDA

    // ── Fila 2: Nombre del día combinado en las 4 columnas ──
    $sheet->mergeCells("{$c1}2:{$c4}2");
    $sheet->setCellValue("{$c1}2", mb_strtoupper($nombreDia, 'UTF-8'));
    $sheet->getStyle("{$c1}2:{$c4}2")->getFont()->setBold(true)->setSize($tamFuenteDia);
    $sheet->getStyle("{$c1}2:{$c4}2")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER)->setVertical(Alignment::VERTICAL_CENTER);
    $sheet->getStyle("{$c1}2:{$c4}2")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB($colorAmarillo);
    $sheet->getStyle("{$c1}2:{$c4}2")->applyFromArray($bordeDelgado);

    // ── Fila 3: Subencabezado COMIDA (columnas intermedias c2 y c3) ──
    // c1 fila 3 (sobre ENTRADA) celda amarilla
    $sheet->getStyle("{$c1}3")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB($colorAmarillo);
    $sheet->getStyle("{$c1}3")->applyFromArray($bordeDelgado);

    // c2 y c3 fila 3 combinadas: COMIDA
    $sheet->mergeCells("{$c2}3:{$c3}3");
    $sheet->setCellValue("{$c2}3", 'COMIDA');
    $sheet->getStyle("{$c2}3:{$c3}3")->getFont()->setSize($tamFuenteSub);
    $sheet->getStyle("{$c2}3:{$c3}3")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER)->setVertical(Alignment::VERTICAL_CENTER)->setShrinkToFit(true);
    $sheet->getStyle("{$c2}3:{$c3}3")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB($colorAmarillo);
    $sheet->getStyle("{$c2}3:{$c3}3")->applyFromArray($bordeDelgado);

    // c4 fila 3 (sobre SALIDA) celda amarilla
    $sheet->getStyle("{$c4}3")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB($colorAmarillo);
    $sheet->getStyle("{$c4}3")->applyFromArray($bordeDelgado);

    // ── Fila 4: ENTRADA | Sale | Entra | SALIDA ──
    // ENTRADA (Amarillo, negrita)
    $sheet->setCellValue("{$c1}4", 'ENTRADA');
    $sheet->getStyle("{$c1}4")->getFont()->setBold(true)->setSize($tamFuenteSub);
    $sheet->getStyle("{$c1}4")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER)->setVertical(Alignment::VERTICAL_CENTER)->setShrinkToFit(true);
    $sheet->getStyle("{$c1}4")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB($colorAmarillo);
    $sheet->getStyle("{$c1}4")->applyFromArray($bordeDelgado);

    // Sale (Blanco)
    $sheet->setCellValue("{$c2}4", 'Sale');
    $sheet->getStyle("{$c2}4")->getFont()->setSize($tamFuenteSub);
    $sheet->getStyle("{$c2}4")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER)->setVertical(Alignment::VERTICAL_CENTER)->setShrinkToFit(true);
    $sheet->getStyle("{$c2}4")->applyFromArray($bordeDelgado);

    // Entra (Blanco)
    $sheet->setCellValue("{$c3}4", 'Entra');
    $sheet->getStyle("{$c3}4")->getFont()->setSize($tamFuenteSub);
    $sheet->getStyle("{$c3}4")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER)->setVertical(Alignment::VERTICAL_CENTER)->setShrinkToFit(true);
    $sheet->getStyle("{$c3}4")->applyFromArray($bordeDelgado);

    // SALIDA (Amarillo, negrita)
    $sheet->setCellValue("{$c4}4", 'SALIDA');
    $sheet->getStyle("{$c4}4")->getFont()->setBold(true)->setSize($tamFuenteSub);
    $sheet->getStyle("{$c4}4")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER)->setVertical(Alignment::VERTICAL_CENTER)->setShrinkToFit(true);
    $sheet->getStyle("{$c4}4")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB($colorAmarillo);
    $sheet->getStyle("{$c4}4")->applyFromArray($bordeDelgado);

    // Anchos de columna dinámicos
    $sheet->getColumnDimension($c1)->setWidth($anchoEntrada);
    $sheet->getColumnDimension($c2)->setWidth($anchoSale);
    $sheet->getColumnDimension($c3)->setWidth($anchoEntra);
    $sheet->getColumnDimension($c4)->setWidth($anchoSalida);

    $colActual += 4;
}

// Columna final: DIAS SIN GAFET (Combinada verticalmente fila 2 a 4)
$sheet->mergeCells("{$letraGafet}2:{$letraGafet}4");
$sheet->setCellValue("{$letraGafet}2", "DIAS SIN\nGAFET");
$sheet->getStyle("{$letraGafet}2:{$letraGafet}4")->getFont()->setBold(true)->setSize($tamFuenteSub);
$sheet->getStyle("{$letraGafet}2:{$letraGafet}4")->getAlignment()
    ->setHorizontal(Alignment::HORIZONTAL_CENTER)
    ->setVertical(Alignment::VERTICAL_CENTER)
    ->setWrapText(true)
    ->setShrinkToFit(true);
$sheet->getStyle("{$letraGafet}2:{$letraGafet}4")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB($colorAmarillo);
$sheet->getStyle("{$letraGafet}2:{$letraGafet}4")->applyFromArray($bordeDelgado);
$sheet->getColumnDimension($letraGafet)->setWidth($anchoGafet);

// Ancho de columnas fijas A y B
$sheet->getColumnDimension('A')->setWidth(4.5);
$sheet->getColumnDimension('B')->setWidth($anchoNombre);

// ─────────────────────────────────────────────────────────────
// FILAS DE EMPLEADOS (A partir de la Fila 5)
// ─────────────────────────────────────────────────────────────
$filaActual = 5;
$numero = 1;

foreach ($empleados as $empleado) {
    $nombreEmp = $empleado['nombre'];
    $sexo = $empleado['sexo'];

    // Determinar color de fondo según sexo
    $colorFondo = '';
    if ($sexo === 'M') {
        $colorFondo = $colorAzul; // Azul claro para varones
    } elseif ($sexo === 'F') {
        $colorFondo = $colorRosa; // Rosa claro para mujeres
    }

    $sheet->getRowDimension($filaActual)->setRowHeight(21);

    // Columna A: Número consecutivo
    $sheet->setCellValue("A{$filaActual}", $numero);
    $sheet->getStyle("A{$filaActual}")->getFont()->setBold(true)->setSize(9);
    $sheet->getStyle("A{$filaActual}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT)->setVertical(Alignment::VERTICAL_CENTER);
    $sheet->getStyle("A{$filaActual}")->applyFromArray($bordeDelgado);
    if ($colorFondo) {
        $sheet->getStyle("A{$filaActual}")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB($colorFondo);
    }

    // Columna B: Nombre del empleado en mayúsculas
    $sheet->setCellValue("B{$filaActual}", $nombreEmp);
    $sheet->getStyle("B{$filaActual}")->getFont()->setBold(true)->setSize(9);
    $sheet->getStyle("B{$filaActual}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT)->setVertical(Alignment::VERTICAL_CENTER)->setShrinkToFit(true);
    $sheet->getStyle("B{$filaActual}")->applyFromArray($bordeDelgado);
    if ($colorFondo) {
        $sheet->getStyle("B{$filaActual}")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB($colorFondo);
    }

    // Celdas vacías para cada día con su cuadrícula
    for ($c = 3; $c <= $colFinDias; $c++) {
        $letraCol = Coordinate::stringFromColumnIndex($c);
        $sheet->getStyle("{$letraCol}{$filaActual}")->applyFromArray($bordeDelgado);
        if ($colorFondo) {
            $sheet->getStyle("{$letraCol}{$filaActual}")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB($colorFondo);
        }
    }

    // Celda vacía para DIAS SIN GAFET
    $sheet->getStyle("{$letraGafet}{$filaActual}")->applyFromArray($bordeDelgado);
    if ($colorFondo) {
        $sheet->getStyle("{$letraGafet}{$filaActual}")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB($colorFondo);
    }

    $filaActual++;
    $numero++;
}

// ─────────────────────────────────────────────────────────────
// 4. DESCARGA DEL ARCHIVO EXCEL
// ─────────────────────────────────────────────────────────────
$nombreArchivo = 'Lista_Asistencia_' . preg_replace('/[^A-Za-z0-9_]/', '_', $numSemana) . '.xlsx';

header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
header('Content-Disposition: attachment;filename="' . $nombreArchivo . '"');
header('Cache-Control: max-age=0');

$writer = new Xlsx($spreadsheet);
$writer->save('php://output');
exit;
