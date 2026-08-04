<?php
require_once __DIR__ . '/../../../vendor/autoload.php';
include_once __DIR__ . '/../../../conexion/conexion.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Font;

/** @var mysqli $conexion */

// Obtener ID de prima vacacional desde la URL
$id_prima_empleado = isset($_GET['id_prima_empleado']) ? intval($_GET['id_prima_empleado']) : 0;

if ($id_prima_empleado <= 0) {
    die('ID de prima vacacional no válido.');
}

// Obtener datos de la prima vacacional
$sql_prima = "SELECT pve.*,
                e.id_empleado,
                e.clave_empleado,
                e.nombre,
                e.ap_paterno,
                e.ap_materno,
                d.nombre_departamento,
                a.nombre_area
            FROM prima_vacacional_empleados pve
            LEFT JOIN info_empleados e ON pve.id_empleado = e.id_empleado
            LEFT JOIN departamentos d ON e.id_departamento = d.id_departamento
            LEFT JOIN areas a ON e.id_area = a.id_area
            WHERE pve.id_prima_empleado = '$id_prima_empleado'";

$result_prima = mysqli_query($conexion, $sql_prima);
$prima = mysqli_fetch_assoc($result_prima);

if (!$prima) {
    die('Prima vacacional no encontrada.');
}

// ─────────────────────────────────────────────
// PALETA: verde solo en encabezados, celdas en blanco
// Verde claro      → título principal
// Verde medio      → encabezados de sección
// Blanco puro      → todas las celdas de datos
// Rojo borgogna    → encabezado deducciones
// ─────────────────────────────────────────────

$C_MAIN_BG   = '3A9E5F'; // Verde medio claro - título
$C_MAIN_FG   = 'FFFFFF'; // Blanco texto título
$C_SEC_BG    = '4CAF72'; // Verde medio - encabezados sección
$C_SEC_FG    = 'FFFFFF';
$C_SUB_BG    = '6DC08A'; // Verde claro (no usado actualmente)
$C_SUB_FG    = 'FFFFFF';
$C_LBL_ODD   = 'FFFFFF'; // Blanco puro - celda etiqueta
$C_LBL_EVEN  = 'FFFFFF'; // Blanco puro - celda etiqueta
$C_VAL_ODD   = 'FFFFFF'; // Blanco puro - celda valor
$C_VAL_EVEN  = 'FFFFFF'; // Blanco puro - celda valor
$C_LBL_TXT   = '1A1A1A'; // Negro - texto etiqueta
$C_VAL_TXT   = '1A1A1A'; // Negro - texto valor
$C_DED_BG    = 'C0392B'; // Rojo - encabezado deducciones
$C_DED_ROW   = 'FFFFFF'; // Blanco - celdas de datos deducción
$C_DED_TXT   = '1A1A1A'; // Negro - texto datos deducción
$C_TOT_BG    = '2E8B57'; // Verde medio - total
$C_TOT_FG    = 'FFFFFF';
$C_SEP_BG    = 'D5EDE0'; // Verde muy claro separador
$C_BORDER    = 'B0D0BA'; // Verde suave bordes internos
$C_BORDER_SEC= '3A9E5F'; // Verde medio bordes de sección

// ─────────────────────────────────────────────
// SPREADSHEET
// ─────────────────────────────────────────────
$spreadsheet = new Spreadsheet();
$sheet = $spreadsheet->getActiveSheet();
$sheet->setTitle('Prima Vacacional');

$spreadsheet->getProperties()
    ->setCreator('Sistema SAAO')
    ->setLastModifiedBy('Sistema SAAO')
    ->setTitle('Detalle de Prima Vacacional')
    ->setSubject('Prima Vacacional')
    ->setDescription('Detalle de pago vacacional');

// ─────────────────────────────────────────────
// ANCHOS DE COLUMNAS FIJOS
// A = etiqueta izquierda (30), B = valor izquierdo (22)
// C = etiqueta derecha (22), D = valor derecho (22)
// E = etiqueta extra (20),   F = valor extra (20)
// ─────────────────────────────────────────────
$sheet->getColumnDimension('A')->setWidth(30);
$sheet->getColumnDimension('B')->setWidth(22);
$sheet->getColumnDimension('C')->setWidth(24);
$sheet->getColumnDimension('D')->setWidth(22);
$sheet->getColumnDimension('E')->setWidth(20);
$sheet->getColumnDimension('F')->setWidth(20);

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

/**
 * Aplica estilo de título principal (fila completa A:F).
 */
function styleTitulo($sheet, $row, $C_MAIN_BG, $C_MAIN_FG, $C_BORDER_SEC)
{
    $range = 'A' . $row . ':F' . $row;
    $sheet->mergeCells($range);
    $sheet->getStyle($range)->applyFromArray([
        'font'      => ['bold' => true, 'size' => 16, 'color' => ['rgb' => $C_MAIN_FG], 'name' => 'Calibri'],
        'fill'      => ['fillType' => Fill::FILL_SOLID, 'color' => ['rgb' => $C_MAIN_BG]],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        'borders'   => [
            'outline' => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['rgb' => $C_BORDER_SEC]],
        ],
    ]);
    $sheet->getRowDimension($row)->setRowHeight(38);
}

/**
 * Aplica estilo de encabezado de sección (fila completa A:F).
 */
function styleSeccion($sheet, $row, $C_SEC_BG, $C_SEC_FG, $C_BORDER_SEC)
{
    $range = 'A' . $row . ':F' . $row;
    $sheet->mergeCells($range);
    $sheet->getStyle($range)->applyFromArray([
        'font'      => ['bold' => true, 'size' => 12, 'color' => ['rgb' => $C_SEC_FG], 'name' => 'Calibri'],
        'fill'      => ['fillType' => Fill::FILL_SOLID, 'color' => ['rgb' => $C_SEC_BG]],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT, 'vertical' => Alignment::VERTICAL_CENTER,
                        'indent' => 1],
        'borders'   => [
            'outline' => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['rgb' => $C_BORDER_SEC]],
        ],
    ]);
    $sheet->getRowDimension($row)->setRowHeight(26);
}

/**
 * Aplica estilo de subencabezado (fila completa A:F).
 */
function styleSubEncabezado($sheet, $row, $C_SUB_BG, $C_SUB_FG, $C_BORDER_SEC)
{
    $range = 'A' . $row . ':F' . $row;
    $sheet->mergeCells($range);
    $sheet->getStyle($range)->applyFromArray([
        'font'      => ['bold' => true, 'size' => 11, 'color' => ['rgb' => $C_SUB_FG], 'name' => 'Calibri'],
        'fill'      => ['fillType' => Fill::FILL_SOLID, 'color' => ['rgb' => $C_SUB_BG]],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT, 'vertical' => Alignment::VERTICAL_CENTER,
                        'indent' => 1],
        'borders'   => [
            'outline' => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['rgb' => $C_BORDER_SEC]],
            'bottom'  => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['rgb' => $C_BORDER_SEC]],
        ],
    ]);
    $sheet->getRowDimension($row)->setRowHeight(23);
}

/**
 * Fila de dato simple: etiqueta en A, valor merge B:F.
 * $parity: 0 = impar, 1 = par (para alternar colores).
 */
function rowSimple($sheet, $row, $label, $value, $parity,
                   $C_LBL_ODD, $C_LBL_EVEN, $C_VAL_ODD, $C_VAL_EVEN,
                   $C_LBL_TXT, $C_VAL_TXT, $C_BORDER, $alignValue = null)
{
    $lblBg = ($parity % 2 === 0) ? $C_LBL_ODD  : $C_LBL_EVEN;
    $valBg = ($parity % 2 === 0) ? $C_VAL_ODD  : $C_VAL_EVEN;
    $valAlign = $alignValue ?: Alignment::HORIZONTAL_LEFT;

    $sheet->setCellValue('A' . $row, $label);
    $sheet->setCellValue('B' . $row, $value);
    $sheet->mergeCells('B' . $row . ':F' . $row);

    $sheet->getStyle('A' . $row)->applyFromArray([
        'font'      => ['bold' => true, 'size' => 10, 'color' => ['rgb' => $C_LBL_TXT], 'name' => 'Calibri'],
        'fill'      => ['fillType' => Fill::FILL_SOLID, 'color' => ['rgb' => $lblBg]],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT, 'vertical' => Alignment::VERTICAL_CENTER,
                        'indent' => 1],
        'borders'   => [
            'left'   => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['rgb' => '3A9E5F']],
            'right'  => ['borderStyle' => Border::BORDER_THIN,   'color' => ['rgb' => $C_BORDER]],
            'top'    => ['borderStyle' => Border::BORDER_THIN,   'color' => ['rgb' => $C_BORDER]],
            'bottom' => ['borderStyle' => Border::BORDER_THIN,   'color' => ['rgb' => $C_BORDER]],
        ],
    ]);
    $sheet->getStyle('B' . $row . ':F' . $row)->applyFromArray([
        'font'      => ['size' => 10, 'color' => ['rgb' => $C_VAL_TXT], 'name' => 'Calibri'],
        'fill'      => ['fillType' => Fill::FILL_SOLID, 'color' => ['rgb' => $valBg]],
        'alignment' => ['horizontal' => $valAlign, 'vertical' => Alignment::VERTICAL_CENTER, 'indent' => 1],
        'borders'   => [
            'left'   => ['borderStyle' => Border::BORDER_THIN,   'color' => ['rgb' => $C_BORDER]],
            'right'  => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['rgb' => '3A9E5F']],
            'top'    => ['borderStyle' => Border::BORDER_THIN,   'color' => ['rgb' => $C_BORDER]],
            'bottom' => ['borderStyle' => Border::BORDER_THIN,   'color' => ['rgb' => $C_BORDER]],
        ],
    ]);
    $sheet->getRowDimension($row)->setRowHeight(22);
}

/**
 * Fila de dato doble: etiqueta/valor izquierda (A-B) + etiqueta/valor derecha (C-F).
 */
function rowDoble($sheet, $row,
                  $labelL, $valueL,
                  $labelR, $valueR,
                  $parity,
                  $C_LBL_ODD, $C_LBL_EVEN, $C_VAL_ODD, $C_VAL_EVEN,
                  $C_LBL_TXT, $C_VAL_TXT, $C_BORDER)
{
    $lblBg = ($parity % 2 === 0) ? $C_LBL_ODD  : $C_LBL_EVEN;
    $valBg = ($parity % 2 === 0) ? $C_VAL_ODD  : $C_VAL_EVEN;

    $sheet->setCellValue('A' . $row, $labelL);
    $sheet->setCellValue('B' . $row, $valueL);
    $sheet->setCellValue('C' . $row, $labelR);
    $sheet->setCellValue('D' . $row, $valueR);
    $sheet->mergeCells('D' . $row . ':F' . $row);

    // Estilos etiqueta izquierda
    $sheet->getStyle('A' . $row)->applyFromArray([
        'font'      => ['bold' => true, 'size' => 10, 'color' => ['rgb' => $C_LBL_TXT], 'name' => 'Calibri'],
        'fill'      => ['fillType' => Fill::FILL_SOLID, 'color' => ['rgb' => $lblBg]],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT, 'vertical' => Alignment::VERTICAL_CENTER,
                        'indent' => 1],
        'borders'   => [
            'left'   => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['rgb' => '3A9E5F']],
            'right'  => ['borderStyle' => Border::BORDER_THIN,   'color' => ['rgb' => $C_BORDER]],
            'top'    => ['borderStyle' => Border::BORDER_THIN,   'color' => ['rgb' => $C_BORDER]],
            'bottom' => ['borderStyle' => Border::BORDER_THIN,   'color' => ['rgb' => $C_BORDER]],
        ],
    ]);
    // Estilos valor izquierdo
    $sheet->getStyle('B' . $row)->applyFromArray([
        'font'      => ['size' => 10, 'color' => ['rgb' => $C_VAL_TXT], 'name' => 'Calibri'],
        'fill'      => ['fillType' => Fill::FILL_SOLID, 'color' => ['rgb' => $valBg]],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT, 'vertical' => Alignment::VERTICAL_CENTER,
                        'indent' => 1],
        'borders'   => [
            'left'   => ['borderStyle' => Border::BORDER_THIN,   'color' => ['rgb' => $C_BORDER]],
            'right'  => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['rgb' => '3A9E5F']],
            'top'    => ['borderStyle' => Border::BORDER_THIN,   'color' => ['rgb' => $C_BORDER]],
            'bottom' => ['borderStyle' => Border::BORDER_THIN,   'color' => ['rgb' => $C_BORDER]],
        ],
    ]);
    // Estilos etiqueta derecha
    $sheet->getStyle('C' . $row)->applyFromArray([
        'font'      => ['bold' => true, 'size' => 10, 'color' => ['rgb' => $C_LBL_TXT], 'name' => 'Calibri'],
        'fill'      => ['fillType' => Fill::FILL_SOLID, 'color' => ['rgb' => $lblBg]],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT, 'vertical' => Alignment::VERTICAL_CENTER,
                        'indent' => 1],
        'borders'   => [
            'left'   => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['rgb' => '4CAF72']],
            'right'  => ['borderStyle' => Border::BORDER_THIN,   'color' => ['rgb' => $C_BORDER]],
            'top'    => ['borderStyle' => Border::BORDER_THIN,   'color' => ['rgb' => $C_BORDER]],
            'bottom' => ['borderStyle' => Border::BORDER_THIN,   'color' => ['rgb' => $C_BORDER]],
        ],
    ]);
    // Estilos valor derecho
    $sheet->getStyle('D' . $row . ':F' . $row)->applyFromArray([
        'font'      => ['size' => 10, 'color' => ['rgb' => $C_VAL_TXT], 'name' => 'Calibri'],
        'fill'      => ['fillType' => Fill::FILL_SOLID, 'color' => ['rgb' => $valBg]],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT, 'vertical' => Alignment::VERTICAL_CENTER,
                        'indent' => 1],
        'borders'   => [
            'left'   => ['borderStyle' => Border::BORDER_THIN,   'color' => ['rgb' => $C_BORDER]],
            'right'  => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['rgb' => '3A9E5F']],
            'top'    => ['borderStyle' => Border::BORDER_THIN,   'color' => ['rgb' => $C_BORDER]],
            'bottom' => ['borderStyle' => Border::BORDER_THIN,   'color' => ['rgb' => $C_BORDER]],
        ],
    ]);
    $sheet->getRowDimension($row)->setRowHeight(22);
}

/**
 * Fila triple: tres pares etiqueta/valor (A, B | C, D | E, F).
 */
function rowTriple($sheet, $row,
                   $labelA, $valueA,
                   $labelC, $valueC,
                   $labelE, $valueF,
                   $parity,
                   $C_LBL_ODD, $C_LBL_EVEN, $C_VAL_ODD, $C_VAL_EVEN,
                   $C_LBL_TXT, $C_VAL_TXT, $C_BORDER)
{
    $lblBg = ($parity % 2 === 0) ? $C_LBL_ODD  : $C_LBL_EVEN;
    $valBg = ($parity % 2 === 0) ? $C_VAL_ODD  : $C_VAL_EVEN;

    $sheet->setCellValue('A' . $row, $labelA);
    $sheet->setCellValue('B' . $row, $valueA);
    $sheet->setCellValue('C' . $row, $labelC);
    $sheet->setCellValue('D' . $row, $valueC);
    $sheet->setCellValue('E' . $row, $labelE);
    $sheet->setCellValue('F' . $row, $valueF);

    $lBorder = ['left' => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['rgb' => '3A9E5F']]];
    $rBorder = ['right' => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['rgb' => '3A9E5F']]];
    $mBorderL = ['left' => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['rgb' => '4CAF72']]];
    $mBorderR = ['right' => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['rgb' => '4CAF72']]];
    $thinBorder = [
        'top'    => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => $C_BORDER]],
        'bottom' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => $C_BORDER]],
    ];
    $innerR = ['right' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => $C_BORDER]]];
    $innerL = ['left'  => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => $C_BORDER]]];

    foreach (['A', 'C', 'E'] as $col) {
        $borders = array_merge($thinBorder, $innerR);
        if ($col === 'A') $borders = array_merge($borders, $lBorder);
        if ($col === 'C') $borders = array_merge($borders, $mBorderL);
        if ($col === 'E') $borders = array_merge($borders, $mBorderL);

        $sheet->getStyle($col . $row)->applyFromArray([
            'font'      => ['bold' => true, 'size' => 10, 'color' => ['rgb' => $C_LBL_TXT], 'name' => 'Calibri'],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'color' => ['rgb' => $lblBg]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT, 'vertical' => Alignment::VERTICAL_CENTER,
                            'indent' => 1],
            'borders'   => $borders,
        ]);
    }
    foreach (['B', 'D', 'F'] as $col) {
        $borders = array_merge($thinBorder, $innerL);
        if ($col === 'F') $borders = array_merge($borders, $rBorder);
        if ($col === 'B') $borders = array_merge($borders, $mBorderR);
        if ($col === 'D') $borders = array_merge($borders, $mBorderR);

        $sheet->getStyle($col . $row)->applyFromArray([
            'font'      => ['size' => 10, 'color' => ['rgb' => $C_VAL_TXT], 'name' => 'Calibri'],
            'fill'      => ['fillType' => Fill::FILL_SOLID, 'color' => ['rgb' => $valBg]],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT, 'vertical' => Alignment::VERTICAL_CENTER,
                            'indent' => 1],
            'borders'   => $borders,
        ]);
    }
    $sheet->getRowDimension($row)->setRowHeight(22);
}

/**
 * Fila separadora visual entre secciones.
 */
function rowSeparador($sheet, $row, $C_SEP_BG)
{
    $sheet->mergeCells('A' . $row . ':F' . $row);
    $sheet->getStyle('A' . $row . ':F' . $row)->applyFromArray([
        'fill' => ['fillType' => Fill::FILL_SOLID, 'color' => ['rgb' => $C_SEP_BG]],
    ]);
    $sheet->getRowDimension($row)->setRowHeight(6);
}

/**
 * Fila de deducción: etiqueta izquierda roja + valor rojo.
 */
function rowDeduccion($sheet, $row, $label, $value, $parity, $C_DED_ROW, $C_DED_TXT, $C_LBL_TXT, $C_BORDER)
{
    $bg = ($parity % 2 === 0) ? $C_DED_ROW : 'F5E8E8';

    $sheet->setCellValue('A' . $row, $label);
    $sheet->setCellValue('B' . $row, $value);
    $sheet->mergeCells('B' . $row . ':F' . $row);

    $sheet->getStyle('A' . $row)->applyFromArray([
        'font'      => ['bold' => true, 'size' => 10, 'color' => ['rgb' => $C_DED_TXT], 'name' => 'Calibri'],
        'fill'      => ['fillType' => Fill::FILL_SOLID, 'color' => ['rgb' => $bg]],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT, 'vertical' => Alignment::VERTICAL_CENTER,
                        'indent' => 1],
        'borders'   => [
            'left'   => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['rgb' => '7B2D2D']],
            'right'  => ['borderStyle' => Border::BORDER_THIN,   'color' => ['rgb' => $C_BORDER]],
            'top'    => ['borderStyle' => Border::BORDER_THIN,   'color' => ['rgb' => $C_BORDER]],
            'bottom' => ['borderStyle' => Border::BORDER_THIN,   'color' => ['rgb' => $C_BORDER]],
        ],
    ]);
    $sheet->getStyle('B' . $row . ':F' . $row)->applyFromArray([
        'font'      => ['bold' => true, 'size' => 10, 'color' => ['rgb' => $C_DED_TXT], 'name' => 'Calibri'],
        'fill'      => ['fillType' => Fill::FILL_SOLID, 'color' => ['rgb' => $bg]],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_RIGHT, 'vertical' => Alignment::VERTICAL_CENTER,
                        'indent' => 1],
        'borders'   => [
            'left'   => ['borderStyle' => Border::BORDER_THIN,   'color' => ['rgb' => $C_BORDER]],
            'right'  => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['rgb' => '7B2D2D']],
            'top'    => ['borderStyle' => Border::BORDER_THIN,   'color' => ['rgb' => $C_BORDER]],
            'bottom' => ['borderStyle' => Border::BORDER_THIN,   'color' => ['rgb' => $C_BORDER]],
        ],
    ]);
    $sheet->getRowDimension($row)->setRowHeight(22);
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTRUCCIÓN DEL DOCUMENTO
// ─────────────────────────────────────────────────────────────────────────────

$row = 1;

// ── TÍTULO PRINCIPAL ──────────────────────────────────────────────────────────
styleTitulo($sheet, $row, $C_MAIN_BG, $C_MAIN_FG, $C_BORDER_SEC);
$sheet->setCellValue('A' . $row, '  DETALLE DE PAGO VACACIONAL  —  Sistema SAAO');
$row++;

rowSeparador($sheet, $row, $C_SEP_BG); $row++;

// ── SECCIÓN: DATOS DEL EMPLEADO ──────────────────────────────────────────────
styleSeccion($sheet, $row, $C_SEC_BG, $C_SEC_FG, $C_BORDER_SEC);
$sheet->setCellValue('A' . $row, '  👤  DATOS DEL EMPLEADO');
$row++;

$nombre_completo = trim($prima['nombre'] . ' ' . $prima['ap_paterno'] . ' ' . $prima['ap_materno']);
$parity = 0;
rowSimple($sheet, $row, 'Nombre Completo', $nombre_completo, $parity,
          $C_LBL_ODD, $C_LBL_EVEN, $C_VAL_ODD, $C_VAL_EVEN, $C_LBL_TXT, $C_VAL_TXT, $C_BORDER);
$row++; $parity++;

rowDoble($sheet, $row,
         'Clave del Empleado', $prima['clave_empleado'],
         'Departamento', $prima['nombre_departamento'] ?: 'N/A',
         $parity,
         $C_LBL_ODD, $C_LBL_EVEN, $C_VAL_ODD, $C_VAL_EVEN, $C_LBL_TXT, $C_VAL_TXT, $C_BORDER);
$row++; $parity++;

rowSimple($sheet, $row, 'Área', $prima['nombre_area'] ?: 'N/A', $parity,
          $C_LBL_ODD, $C_LBL_EVEN, $C_VAL_ODD, $C_VAL_EVEN, $C_LBL_TXT, $C_VAL_TXT, $C_BORDER);
$row++;

rowSeparador($sheet, $row, $C_SEP_BG); $row++;

// ── SECCIÓN: INFORMACIÓN DE REGISTRO ─────────────────────────────────────────
styleSeccion($sheet, $row, $C_SEC_BG, $C_SEC_FG, $C_BORDER_SEC);
$sheet->setCellValue('A' . $row, '  📋  INFORMACIÓN DE REGISTRO');
$row++;

$parity = 0;
rowTriple($sheet, $row,
          'Número de Semana', $prima['numero_semana'],
          'Año',              $prima['anio'],
          'Fecha de Pago',    date('d/m/Y', strtotime($prima['fecha_pago'])),
          $parity,
          $C_LBL_ODD, $C_LBL_EVEN, $C_VAL_ODD, $C_VAL_EVEN, $C_LBL_TXT, $C_VAL_TXT, $C_BORDER);
$row++;

rowSeparador($sheet, $row, $C_SEP_BG); $row++;

// ── SECCIÓN: PERIODO Y DÍAS DE VACACIONES ────────────────────────────────────
styleSeccion($sheet, $row, $C_SEC_BG, $C_SEC_FG, $C_BORDER_SEC);
$sheet->setCellValue('A' . $row, '  📅  PERIODO Y DÍAS DE VACACIONES');
$row++;

$parity = 0;
rowDoble($sheet, $row,
         'Fecha de Inicio', date('d/m/Y', strtotime($prima['fecha_inicio'])),
         'Fecha de Fin',    date('d/m/Y', strtotime($prima['fecha_fin'])),
         $parity,
         $C_LBL_ODD, $C_LBL_EVEN, $C_VAL_ODD, $C_VAL_EVEN, $C_LBL_TXT, $C_VAL_TXT, $C_BORDER);
$row++; $parity++;

rowTriple($sheet, $row,
          'Días Vacaciones (Base)', number_format($prima['dias_vacaciones'], 3),
          'Séptimo Día',           number_format($prima['septimo_dia'], 2),
          'Festivos',              $prima['festivos'],
          $parity,
          $C_LBL_ODD, $C_LBL_EVEN, $C_VAL_ODD, $C_VAL_EVEN, $C_LBL_TXT, $C_VAL_TXT, $C_BORDER);
$row++;

rowSeparador($sheet, $row, $C_SEP_BG); $row++;

// ── SECCIÓN: PAGO DE VACACIONES ───────────────────────────────────────────────
styleSeccion($sheet, $row, $C_SEC_BG, $C_SEC_FG, $C_BORDER_SEC);
$sheet->setCellValue('A' . $row, '  💰  PAGO DE VACACIONES');
$row++;

$parity = 0;
$sueldo_vacaciones = floatval($prima['salario_diario']) * floatval($prima['dias_vacaciones']);

rowDoble($sheet, $row,
         'Salario Diario',      '$ ' . number_format($prima['salario_diario'], 2),
         'Porcentaje de Prima', number_format($prima['porcentaje_prima'], 2) . ' %',
         $parity,
         $C_LBL_ODD, $C_LBL_EVEN, $C_VAL_ODD, $C_VAL_EVEN, $C_LBL_TXT, $C_VAL_TXT, $C_BORDER);
$row++; $parity++;

rowSimple($sheet, $row, 'Sueldo por Vacaciones', '$ ' . number_format($sueldo_vacaciones, 2), $parity,
          $C_LBL_ODD, $C_LBL_EVEN, $C_VAL_ODD, $C_VAL_EVEN, $C_LBL_TXT, $C_VAL_TXT, $C_BORDER,
          Alignment::HORIZONTAL_RIGHT);
$row++;

rowSeparador($sheet, $row, $C_SEP_BG); $row++;

// ── SECCIÓN: DESGLOSE DE PAGO ─────────────────────────────────────────────────
styleSeccion($sheet, $row, $C_SEC_BG, $C_SEC_FG, $C_BORDER_SEC);
$sheet->setCellValue('A' . $row, '  🧾  DESGLOSE DE PAGO');
$row++;

$septimo_dia_monto = floatval($prima['salario_diario']) * floatval($prima['septimo_dia']);
$festivos_monto    = floatval($prima['salario_diario']) * floatval($prima['festivos']);

$parity = 0;
$conceptos = [
    ['Vacaciones',       '$ ' . number_format($sueldo_vacaciones, 2)],
    ['Prima Vacacional', '$ ' . number_format($prima['monto_prima_vacacional'], 2)],
    ['Séptimo Día',     '$ ' . number_format($septimo_dia_monto, 2)],
    ['Festivos',         '$ ' . number_format($festivos_monto, 2)],
];
foreach ($conceptos as $concepto) {
    rowSimple($sheet, $row, $concepto[0], $concepto[1], $parity,
              $C_LBL_ODD, $C_LBL_EVEN, $C_VAL_ODD, $C_VAL_EVEN, $C_LBL_TXT, $C_VAL_TXT, $C_BORDER,
              Alignment::HORIZONTAL_RIGHT);
    $row++; $parity++;
}

// ── SECCIÓN: DEDUCCIONES (condicional) ────────────────────────────────────────
$tieneDeduccion = floatval($prima['dispersion_tarjeta']) > 0
               || floatval($prima['isr']) > 0
               || floatval($prima['imss']) > 0
               || floatval($prima['infonavit']) > 0;

if ($tieneDeduccion) {
    rowSeparador($sheet, $row, $C_SEP_BG); $row++;

    // Encabezado rojo deducciones
    $sheet->mergeCells('A' . $row . ':F' . $row);
    $sheet->setCellValue('A' . $row, '  ➖  DEDUCCIONES');
    $sheet->getStyle('A' . $row . ':F' . $row)->applyFromArray([
        'font'      => ['bold' => true, 'size' => 12, 'color' => ['rgb' => 'FFFFFF'], 'name' => 'Calibri'],
        'fill'      => ['fillType' => Fill::FILL_SOLID, 'color' => ['rgb' => 'B71C1C']],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT, 'vertical' => Alignment::VERTICAL_CENTER,
                        'indent' => 1],
        'borders'   => ['outline' => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['rgb' => '7F0000']]],
    ]);
    $sheet->getRowDimension($row)->setRowHeight(26);
    $row++;

    $dParity = 0;
    $deducciones = [];
    if (floatval($prima['dispersion_tarjeta']) > 0)
        $deducciones[] = ['Dispersión por Tarjeta', '$ ' . number_format($prima['dispersion_tarjeta'], 2)];
    if (floatval($prima['isr']) > 0)
        $deducciones[] = ['ISR',       '$ ' . number_format($prima['isr'], 2)];
    if (floatval($prima['imss']) > 0)
        $deducciones[] = ['IMSS',      '$ ' . number_format($prima['imss'], 2)];
    if (floatval($prima['infonavit']) > 0)
        $deducciones[] = ['INFONAVIT', '$ ' . number_format($prima['infonavit'], 2)];

    foreach ($deducciones as $ded) {
        rowDeduccion($sheet, $row, $ded[0], $ded[1], $dParity,
                     $C_DED_ROW, $C_DED_TXT, $C_LBL_TXT, $C_BORDER);
        $row++; $dParity++;
    }
}

rowSeparador($sheet, $row, $C_SEP_BG); $row++;

// ── TOTAL A PAGAR ─────────────────────────────────────────────────────────────
$sheet->mergeCells('A' . $row . ':D' . $row);
$sheet->setCellValue('A' . $row, '  TOTAL A PAGAR');
$sheet->mergeCells('E' . $row . ':F' . $row);
$sheet->setCellValue('E' . $row, '$ ' . number_format($prima['total_pagado'], 2));

$totalLabelStyle = [
    'font'      => ['bold' => true, 'size' => 14, 'color' => ['rgb' => $C_TOT_FG], 'name' => 'Calibri'],
    'fill'      => ['fillType' => Fill::FILL_SOLID, 'color' => ['rgb' => $C_TOT_BG]],
    'alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT, 'vertical' => Alignment::VERTICAL_CENTER,
                    'indent' => 1],
    'borders'   => [
        'outline' => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['rgb' => '2D7A46']],
        'right'   => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['rgb' => '4CAF72']],
    ],
];
$totalValueStyle = [
    'font'      => ['bold' => true, 'size' => 14, 'color' => ['rgb' => $C_TOT_FG], 'name' => 'Calibri'],
    'fill'      => ['fillType' => Fill::FILL_SOLID, 'color' => ['rgb' => '256E42']],
    'alignment' => ['horizontal' => Alignment::HORIZONTAL_RIGHT, 'vertical' => Alignment::VERTICAL_CENTER,
                    'indent' => 1],
    'borders'   => [
        'outline' => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['rgb' => '2D7A46']],
    ],
];
$sheet->getStyle('A' . $row . ':D' . $row)->applyFromArray($totalLabelStyle);
$sheet->getStyle('E' . $row . ':F' . $row)->applyFromArray($totalValueStyle);
$sheet->getRowDimension($row)->setRowHeight(34);
$row++;

rowSeparador($sheet, $row, $C_SEP_BG); $row++;

// ── SECCIÓN: DÍAS VACACIONES ──────────────────────────────────────────────────
styleSeccion($sheet, $row, $C_SEC_BG, $C_SEC_FG, $C_BORDER_SEC);
$sheet->setCellValue('A' . $row, '  🏖️  DÍAS VACACIONES');
$row++;

$parity = 0;
$diasDisfrutados = $prima['tiene_disfrutados'] ? number_format($prima['dias_disfrutados'], 3) : 'No aplica';
$diasPagadas     = $prima['tiene_pagadas']     ? number_format($prima['dias_pagadas'], 3)     : 'No aplica';

rowDoble($sheet, $row,
         'Días Disfrutados', $diasDisfrutados,
         'Días Pagados',     $diasPagadas,
         $parity,
         $C_LBL_ODD, $C_LBL_EVEN, $C_VAL_ODD, $C_VAL_EVEN, $C_LBL_TXT, $C_VAL_TXT, $C_BORDER);
$row++;

// ── SECCIÓN: OBSERVACIONES (condicional) ──────────────────────────────────────
if (!empty($prima['observaciones'])) {
    rowSeparador($sheet, $row, $C_SEP_BG); $row++;

    styleSeccion($sheet, $row, $C_SEC_BG, $C_SEC_FG, $C_BORDER_SEC);
    $sheet->setCellValue('A' . $row, '  📝  OBSERVACIONES');
    $row++;

    $sheet->mergeCells('A' . $row . ':F' . $row);
    $sheet->setCellValue('A' . $row, $prima['observaciones']);
    $sheet->getStyle('A' . $row . ':F' . $row)->applyFromArray([
        'font'      => ['size' => 10, 'color' => ['rgb' => '4A4A4A'], 'name' => 'Calibri', 'italic' => true],
        'fill'      => ['fillType' => Fill::FILL_SOLID, 'color' => ['rgb' => 'FFFDE7']],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT, 'vertical' => Alignment::VERTICAL_TOP,
                        'wrapText' => true, 'indent' => 1],
        'borders'   => [
            'outline' => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['rgb' => 'F9A825']],
            'allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'FDD835']],
        ],
    ]);
    $sheet->getRowDimension($row)->setRowHeight(45);
    $row++;
}



// ── CONFIGURAR ÁREA DE IMPRESIÓN Y OPCIONES DE HOJA ───────────────────────────
$sheet->getPageSetup()->setPaperSize(\PhpOffice\PhpSpreadsheet\Worksheet\PageSetup::PAPERSIZE_LETTER);
$sheet->getPageSetup()->setOrientation(\PhpOffice\PhpSpreadsheet\Worksheet\PageSetup::ORIENTATION_PORTRAIT);
$sheet->getPageSetup()->setFitToPage(true);
$sheet->getPageSetup()->setFitToWidth(1);
$sheet->getPageSetup()->setFitToHeight(0);
$sheet->getPageMargins()->setTop(0.5);
$sheet->getPageMargins()->setBottom(0.5);
$sheet->getPageMargins()->setLeft(0.4);
$sheet->getPageMargins()->setRight(0.4);

// Sin panel congelado — scroll libre

// Limpiar buffer y enviar Excel
if (ob_get_contents()) {
    ob_end_clean();
}

header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
header('Content-Disposition: attachment;filename="Pago_Vacacional_' . $prima['clave_empleado'] . '.xlsx"');
header('Cache-Control: max-age=0');

$writer = new Xlsx($spreadsheet);
$writer->save('php://output');
exit;
