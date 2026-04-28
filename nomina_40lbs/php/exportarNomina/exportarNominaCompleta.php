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
        "Ene" => 1, "Feb" => 2, "Mar" => 3, "Abr" => 4, "May" => 5, "Jun" => 6,
        "Jul" => 7, "Ago" => 8, "Sep" => 9, "Oct" => 10, "Nov" => 11, "Dic" => 12
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
 * Determina si un color de fondo es oscuro o claro y devuelve el color de texto adecuado (blanco o negro).
 */
function obtenerColorContraste($hexColor)
{
    // Eliminar el # si existe
    $hexColor = str_replace('#', '', $hexColor);

    // Si el color no es válido, por defecto blanco
    if (strlen($hexColor) != 6) return '000000';

    // Convertir hex a RGB
    $r = hexdec(substr($hexColor, 0, 2));
    $g = hexdec(substr($hexColor, 2, 2));
    $b = hexdec(substr($hexColor, 4, 2));

    // Calcular el brillo (Fórmula YIQ)
    // El umbral de 128 (la mitad de 255) determina si el fondo es claro u oscuro
    $yiq = (($r * 299) + ($g * 587) + ($b * 114)) / 1000;

    return ($yiq >= 128) ? '000000' : 'FFFFFF';
}

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
    $fecha_inicio = restarUnDia($jsonNomina['fecha_inicio']) ?? 'Fecha Inicio';
    $fecha_cierre = restarUnDia($jsonNomina['fecha_cierre']) ?? 'Fecha Cierre';
    $numero_semana = $jsonNomina['numero_semana'] ?? '00';
    $ano = date('Y');
}

//=====================
//  DEFINIR COLUMNAS COMUNES (Personalizado para 40lbs)
//=====================

$columnas = [
    'N°', 'CD', 'NOMBRE', 'SUELDO NETO', 'INCENTIVO', 'EXTRAS', 'TOTAL PERCEPCIONES',
    'ISR', 'IMSS', 'INFONAVIT', 'AJUSTES AL SUB', 'AUSENTISMO', 'PERMISOS', 'UNIFORMES',
    'BIOMETRICO', 'F.A/GAFET/COFIA', 'TOTAL DE DEDUCCIONES', 'NETO A RECIBIR',
    'DISPERSION DE TARJETA', 'IMPORTE EN EFECTIVO', 'PRÉSTAMO', 'TOTAL A RECIBIR',
    'REDONDEADO', 'TOTAL EFECTIVO REDONDEADO', 'FIRMA RECIBIDO'
];

$columnasAncho = [
    'A' => 12, 'B' => 14, 'C' => 65, 'D' => 22, 'E' => 20, 'F' => 20, 'G' => 22,
    'H' => 20, 'I' => 20, 'J' => 20, 'K' => 22, 'L' => 21, 'M' => 20, 'N' => 20,
    'O' => 20, 'P' => 22, 'Q' => 22, 'R' => 22, 'S' => 22, 'T' => 22, 'U' => 22,
    'V' => 22, 'W' => 20, 'X' => 23, 'Y' => 25
];

$tamanioLetraColumnas = [
    'A' => 14, 'B' => 14, 'C' => 14, 'D' => 14, 'E' => 14, 'F' => 14, 'G' => 13,
    'H' => 14, 'I' => 14, 'J' => 14, 'K' => 14, 'L' => 14, 'M' => 14, 'N' => 14,
    'O' => 14, 'P' => 13, 'Q' => 13, 'R' => 13, 'S' => 13, 'T' => 13, 'U' => 14,
    'V' => 13, 'W' => 14, 'X' => 13, 'Y' => 14
];

$tamanioLetraFilas = [
    'A' => 14, 'B' => 14, 'C' => 16, 'D' => 15, 'E' => 15, 'F' => 15, 'G' => 15,
    'H' => 15, 'I' => 15, 'J' => 15, 'K' => 15, 'L' => 15, 'M' => 15, 'N' => 15,
    'O' => 15, 'P' => 15, 'Q' => 15, 'R' => 15, 'S' => 15, 'T' => 15, 'U' => 15,
    'V' => 15, 'W' => 15, 'X' => 15
];

//=====================
//  FUNCIÓN PARA CREAR UNA HOJA
//=====================

function crearHoja($spreadsheet, $titulo1, $titulo2, $filtroEmpleados, $nombreHoja, $colorExcel = 'F5EB1B', $esPrimera = false)
{
    global $jsonNomina, $columnas, $columnasAncho, $tamanioLetraColumnas, $tamanioLetraFilas, $fecha_inicio, $fecha_cierre, $numero_semana, $ano;

    $colorExcel = str_replace('#', '', $colorExcel);
    $textColor = obtenerColorContraste($colorExcel);

    if ($esPrimera) {
        $sheet = $spreadsheet->getActiveSheet();
    } else {
        $sheet = $spreadsheet->createSheet();
    }

    $sheet->setTitle($nombreHoja);

    $titulo3 = 'NOMINA DEL ' . strtoupper($fecha_inicio) . ' AL ' . strtoupper($fecha_cierre);
    $titulo4 = 'SEMANA ' . str_pad($numero_semana, 2, '0', STR_PAD_LEFT) . '-' . $ano;

    $sheet->setCellValue('A1', $titulo1);
    $sheet->setCellValue('A2', $titulo2);
    $sheet->setCellValue('A3', $titulo3);
    $sheet->setCellValue('A4', $titulo4);

    // Mergear celdas A-Y (25 columnas)
    $sheet->mergeCells('A1:Y1');
    $sheet->mergeCells('A2:Y2');
    $sheet->mergeCells('A3:Y3');
    $sheet->mergeCells('A4:Y4');

    // Estilos de títulos (Verde preferido por el usuario: 179C1E)
    $verdeUsuario = '179C1E';
    $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(24)->setColor(new Color($verdeUsuario));
    $sheet->getStyle('A2')->getFont()->setBold(true)->setSize(20)->setColor(new Color($verdeUsuario));
    $sheet->getStyle('A3')->getFont()->setBold(true)->setSize(14);
    $sheet->getStyle('A4')->getFont()->setBold(true)->setSize(14);
    $sheet->getStyle('A1:A4')->getAlignment()->setHorizontal('center')->setVertical('center');

    // Logo
    $logoPath = '../../../public/img/logo.jpg';
    if (file_exists($logoPath)) {
        $logo = new Drawing();
        $logo->setName('Logo');
        $logo->setPath($logoPath);
        $logo->setHeight(190);
        $logo->setCoordinates('B1');
        $logo->setOffsetX(10);
        $logo->setWorksheet($sheet);
    }

    // Encabezados
    $col = 'A';
    foreach ($columnas as $encabezado) {
        $sheet->setCellValue($col . '6', $encabezado);
        $col++;
    }

    $sheet->getStyle('A6:Y6')->applyFromArray([
        'font' => ['bold' => true, 'size' => 10, 'color' => ['rgb' => $textColor]],
        'alignment' => ['horizontal' => 'center', 'vertical' => 'center', 'wrapText' => true],
        'fill' => ['fillType' => 'solid', 'startColor' => ['rgb' => $colorExcel]]
    ]);

    foreach ($columnasAncho as $c => $w) $sheet->getColumnDimension($c)->setWidth($w);
    foreach ($tamanioLetraColumnas as $c => $s) $sheet->getStyle($c . '6')->getFont()->setSize($s);

    // Filtrar y ordenar empleados
    $empleados = [];
    if ($jsonNomina && isset($jsonNomina['departamentos'])) {
        foreach ($jsonNomina['departamentos'] as $depto) {
            foreach ($depto['empleados'] ?? [] as $emp) {
                if ($filtroEmpleados($emp)) $empleados[] = $emp;
            }
        }
    }
    usort($empleados, fn($a, $b) => strcmp($a['nombre'] ?? '', $b['nombre'] ?? ''));

    // Banderas de visibilidad
    $flags = [
        'incentivo' => false, 'isr' => false, 'imss' => false, 'infonavit' => false,
        'ajustes' => false, 'ausentismo' => false, 'permiso' => false, 'uniforme' => false,
        'checador' => false, 'fa_gafet_cofia' => false
    ];

    foreach ($empleados as $emp) {
        if (($emp['incentivo'] ?? 0) != 0) $flags['incentivo'] = true;
        if (($emp['inasistencia'] ?? 0) != 0) $flags['ausentismo'] = true;
        if (($emp['permiso'] ?? 0) != 0) $flags['permiso'] = true;
        if (($emp['uniforme'] ?? 0) != 0) $flags['uniforme'] = true;
        if (($emp['checador'] ?? 0) != 0) $flags['checador'] = true;
        if (($emp['fa_gafet_cofia'] ?? 0) != 0) $flags['fa_gafet_cofia'] = true;

        foreach ($emp['conceptos'] ?? [] as $c) {
            if (($c['resultado'] ?? 0) != 0) {
                if ($c['codigo'] == '45') $flags['isr'] = true;
                if ($c['codigo'] == '52') $flags['imss'] = true;
                if ($c['codigo'] == '16') $flags['infonavit'] = true;
                if ($c['codigo'] == '107') $flags['ajustes'] = true;
            }
        }
    }

    // Insertar datos
    $row = 7;
    $idx = 1;
    foreach ($empleados as $emp) {
        $sheet->setCellValue('A' . $row, $idx++);
        $sheet->setCellValue('B' . $row, $emp['clave'] ?? '');
        $sheet->setCellValue('C' . $row, $emp['nombre'] ?? '');

        // Percepciones
        if (($emp['sueldo_neto'] ?? 0) != 0) $sheet->setCellValue('D' . $row, $emp['sueldo_neto']);
        if (($emp['incentivo'] ?? 0) != 0) $sheet->setCellValue('E' . $row, $emp['incentivo']);
        if (($emp['sueldo_extra_total'] ?? 0) != 0) $sheet->setCellValue('F' . $row, $emp['sueldo_extra_total']);
        $sheet->setCellValue('G' . $row, '=SUM(D' . $row . ':F' . $row . ')');

        // Conceptos
        $mapeoConceptos = ['45' => 'H', '52' => 'I', '16' => 'J', '107' => 'K'];
        foreach ($emp['conceptos'] ?? [] as $c) {
            if (isset($mapeoConceptos[$c['codigo']]) && ($c['resultado'] ?? 0) != 0) {
                $sheet->setCellValue($mapeoConceptos[$c['codigo']] . $row, $c['resultado']);
            }
        }

        // Deducciones
        if (($emp['inasistencia'] ?? 0) != 0) $sheet->setCellValue('L' . $row, $emp['inasistencia']);
        if (($emp['permiso'] ?? 0) != 0) $sheet->setCellValue('M' . $row, $emp['permiso']);
        if (($emp['uniforme'] ?? 0) != 0) $sheet->setCellValue('N' . $row, $emp['uniforme']);
        if (($emp['checador'] ?? 0) != 0) $sheet->setCellValue('O' . $row, $emp['checador']);
        if (($emp['fa_gafet_cofia'] ?? 0) != 0) $sheet->setCellValue('P' . $row, $emp['fa_gafet_cofia']);

        $sheet->setCellValue('Q' . $row, '=SUM(H' . $row . ':P' . $row . ')');
        $sheet->setCellValue('R' . $row, '=G' . $row . '-Q' . $row);

        if (($emp['tarjeta'] ?? 0) != 0) $sheet->setCellValue('S' . $row, $emp['tarjeta']);
        $sheet->setCellValue('T' . $row, '=R' . $row . '-S' . $row);

        if (($emp['prestamo'] ?? 0) != 0) $sheet->setCellValue('U' . $row, $emp['prestamo']);
        $sheet->setCellValue('V' . $row, '=T' . $row . '-U' . $row);

        $sheet->setCellValue('W' . $row, '=ROUND(V' . $row . ',0)-V' . $row);
        $sheet->setCellValue('X' . $row, '=V' . $row . '+W' . $row);

        // Formato moneda y colores
        $sheet->getStyle('D' . $row . ':X' . $row)->getNumberFormat()->setFormatCode('$#,##0.00');
        foreach (['H','I','J','K','L','M','N','O','P','Q','S','U'] as $c) {
            $sheet->getStyle($c . $row)->getFont()->setColor(new Color('FF0000'));
            $sheet->getStyle($c . $row)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
        }
        $sheet->getStyle('W' . $row)->getNumberFormat()->setFormatCode('$#,##0.00;[RED]-$#,##0.00');

        $sheet->getStyle('A' . $row . ':Y' . $row)->getAlignment()->setVertical('center');
        $sheet->getStyle('A' . $row . ':B' . $row)->getAlignment()->setHorizontal('center');
        $sheet->getStyle('D' . $row . ':X' . $row)->getAlignment()->setHorizontal('center');

        $row++;
    }

    // Fila de Totales
    $filaTotal = $row;
    $sheet->setCellValue('A' . $filaTotal, 'TOTALES');
    $sheet->getStyle('A' . $filaTotal)->getFont()->setBold(true);
    $colsTotales = ['D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X'];
    foreach ($colsTotales as $c) {
        $sheet->setCellValue($c . $filaTotal, '=SUM(' . $c . '7:' . $c . ($filaTotal - 1) . ')');
        $sheet->getStyle($c . $filaTotal)->getFont()->setBold(true)->setSize(14);
        if (in_array($c, ['H','I','J','K','L','M','N','O','P','Q','S','U'])) {
            $sheet->getStyle($c . $filaTotal)->getFont()->setColor(new Color('FF0000'));
            $sheet->getStyle($c . $filaTotal)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
        } elseif ($c === 'W') {
            $sheet->getStyle($c . $filaTotal)->getNumberFormat()->setFormatCode('$#,##0.00;[RED]-$#,##0.00');
        } else {
            $sheet->getStyle($c . $filaTotal)->getNumberFormat()->setFormatCode('$#,##0.00');
        }
        $sheet->getStyle($c . $filaTotal)->getAlignment()->setHorizontal('center')->setVertical('center');
    }
    $sheet->getStyle('A' . $filaTotal . ':X' . $filaTotal)->getFill()->setFillType('solid')->getStartColor()->setRGB('D3D3D3');

    // Bordes
    $sheet->getStyle('A6:Y' . $filaTotal)->applyFromArray([
        'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => '000000']]]
    ]);

    // Visibilidad
    if (!$flags['incentivo']) $sheet->getColumnDimension('E')->setVisible(false);
    if (!$flags['isr']) $sheet->getColumnDimension('H')->setVisible(false);
    if (!$flags['imss']) $sheet->getColumnDimension('I')->setVisible(false);
    if (!$flags['infonavit']) $sheet->getColumnDimension('J')->setVisible(false);
    if (!$flags['ajustes']) $sheet->getColumnDimension('K')->setVisible(false);
    if (!$flags['ausentismo']) $sheet->getColumnDimension('L')->setVisible(false);
    if (!$flags['permiso']) $sheet->getColumnDimension('M')->setVisible(false);
    if (!$flags['uniforme']) $sheet->getColumnDimension('N')->setVisible(false);
    if (!$flags['checador']) $sheet->getColumnDimension('O')->setVisible(false);
    if (!$flags['fa_gafet_cofia']) $sheet->getColumnDimension('P')->setVisible(false);
    $sheet->getColumnDimension('G')->setVisible(false);
    $sheet->getColumnDimension('Q')->setVisible(false);

    // Alturas de filla
    $sheet->getRowDimension(1)->setRowHeight(38);
    $sheet->getRowDimension(2)->setRowHeight(32);
    $sheet->getRowDimension(3)->setRowHeight(32);
    $sheet->getRowDimension(4)->setRowHeight(32);
    $sheet->getRowDimension(5)->setRowHeight(35);
    $sheet->getRowDimension(6)->setRowHeight(45);
    for ($i = 7; $i < $row; $i++) {
        $sheet->getRowDimension($i)->setRowHeight(48);
        foreach ($tamanioLetraFilas as $c => $s) $sheet->getStyle($c . $i)->getFont()->setSize($s);
    }

    // Configuración página
    $ps = $sheet->getPageSetup();
    $ps->setPaperSize(PageSetup::PAPERSIZE_LETTER)->setOrientation(PageSetup::ORIENTATION_LANDSCAPE);
    $ps->setFitToPage(true)->setFitToHeight(1)->setFitToWidth(1);
    $ps->setPrintArea('A1:Y' . $filaTotal);
    $pm = $sheet->getPageMargins();
    $pm->setLeft(0.5)->setRight(0.5)->setTop(0.5)->setBottom(0.5);
}

// Crear las hojas dinámicamente según los departamentos del JSON
$esPrimeraHoja = true;

if ($jsonNomina && isset($jsonNomina['departamentos'])) {
    foreach ($jsonNomina['departamentos'] as $depto) {
        // Solo procesar si el departamento tiene la propiedad editar: true
        if (!isset($depto['editar']) || $depto['editar'] !== true) continue;

        $idDepto = $depto['id_departamento'] ?? $depto['nombre'];
        $nombreDepto = $depto['nombre'];

        // Verificar si hay empleados CSS y SSS para este depto
        $hayCSS = false;
        $haySSS = false;

        foreach ($depto['empleados'] ?? [] as $emp) {
            if ($emp['mostrar'] ?? true) {
                if ($emp['seguroSocial'] ?? false) $hayCSS = true;
                else $haySSS = true;
            }
        }

        // 1. Crear Hoja CSS si aplica
        if ($hayCSS) {
            crearHoja($spreadsheet, strtoupper($nombreDepto), 'CITRICOS SAAO S.A DE C.V', 
                fn($e) => (($e['id_departamento'] ?? $e['nombre']) == $idDepto && ($e['mostrar'] ?? true) && ($e['seguroSocial'] ?? false)), 
                substr($nombreDepto, 0, 20) . ' CSS', ($depto['color_depto_nomina'] ?? 'F5EB1B'), $esPrimeraHoja);
            $esPrimeraHoja = false;
        }

        // 2. Crear Hoja SSS si aplica
        if ($haySSS) {
            crearHoja($spreadsheet, strtoupper($nombreDepto), 'CITRICOS SAAO S.A DE C.V', 
                fn($e) => (($e['id_departamento'] ?? $e['nombre']) == $idDepto && ($e['mostrar'] ?? true) && !($e['seguroSocial'] ?? false)), 
                substr($nombreDepto, 0, 20) . ' SSS', ($depto['color_depto_nomina'] ?? 'F5EB1B'), $esPrimeraHoja);
            $esPrimeraHoja = false;
        }
    }
}

// Si no se creó ninguna hoja (ej. json vacío), crear una por defecto para evitar errores
if ($esPrimeraHoja) {
    $spreadsheet->getActiveSheet()->setTitle('VACÍO');
}

// Descargar
$writer = new Xlsx($spreadsheet);
$filename = 'NOMINA_COMPLETA_SEM_' . ($numero_semana ?? '00') . '_' . date('Y-m-d_H-i-s') . '.xlsx';
header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
header('Content-Disposition: attachment; filename="' . $filename . '"');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');
$writer->save('php://output');
exit;
