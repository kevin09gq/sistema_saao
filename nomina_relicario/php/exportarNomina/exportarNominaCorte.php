<?php

// Incluir autoload de Composer
require_once __DIR__ . '/../../../vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Color;
use PhpOffice\PhpSpreadsheet\Worksheet\PageSetup;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Worksheet\Drawing;

// Definir zona horaria de la CDMX bhl
date_default_timezone_set('America/Mexico_City');



//=====================
//  RECIBIR DATOS DEL JSON
//=====================

$jsonNomina = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['jsonNomina'])) {
    $jsonNomina = json_decode($_POST['jsonNomina'], true);
}



//==============================
//  FUNCIONES AUXILIARES CORTE
//==============================

/**
 * Obtiene el nombre del día de la semana en español a partir de una fecha 'YYYY-MM-DD'
 */
function obtenerDiaSemanaCorte(string $fechaStr): string
{
    [$anio, $mes, $dia] = array_map('intval', explode('-', $fechaStr));
    $timestamp = mktime(0, 0, 0, $mes, $dia, $anio);
    $dias = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
    return $dias[(int)date('w', $timestamp)];
}

/**
 * Agrupa los tickets de un empleado por precio_reja
 */
function agruparTicketsPorPrecio(array $tickets): array
{
    $agrupados = [];
    foreach ($tickets as $ticket) {
        $precio = (string)$ticket['precio_reja'];
        $agrupados[$precio][] = $ticket;
    }
    return $agrupados;
}

/**
 * Procesa un grupo de tickets (mismo precio) y retorna los datos de la fila
 */
function procesarTicketsParaFila(string $nombre, string $concepto, array $tickets, float $precio): array
{
    $rejasPorDia = ['VIERNES' => 0, 'SABADO' => 0, 'DOMINGO' => 0, 'LUNES' => 0, 'MARTES' => 0, 'MIERCOLES' => 0, 'JUEVES' => 0];

    foreach ($tickets as $ticket) {
        $dia = obtenerDiaSemanaCorte($ticket['fecha']);
        $rejasTicket = array_sum(array_column($ticket['datosRejas'], 'cantidad'));
        if (array_key_exists($dia, $rejasPorDia)) {
            $rejasPorDia[$dia] += $rejasTicket;
        }
    }

    return [
        'nombre'        => $nombre,
        'concepto'      => $concepto,
        'viernes'       => $rejasPorDia['VIERNES'],
        'sabado'        => $rejasPorDia['SABADO'],
        'domingo'       => $rejasPorDia['DOMINGO'],
        'lunes'         => $rejasPorDia['LUNES'],
        'martes'        => $rejasPorDia['MARTES'],
        'miercoles'     => $rejasPorDia['MIERCOLES'],
        'jueves'        => $rejasPorDia['JUEVES'],
        'precio'        => $precio,
        'tipoConcepto'  => 'REJA',
    ];
}

/**
 * Procesa la nómina de un empleado y retorna los datos de la fila
 */
function procesarNominaParaFila(string $nombre, string $concepto, array $nomina): array
{
    $pagosPorDia = ['VIERNES' => 0.0, 'SABADO' => 0.0, 'DOMINGO' => 0.0, 'LUNES' => 0.0, 'MARTES' => 0.0, 'MIERCOLES' => 0.0, 'JUEVES' => 0.0];

    foreach ($nomina as $diaPago) {
        $dia  = strtoupper($diaPago['dia']);
        $pago = (float)($diaPago['pago'] ?? 0);
        if (array_key_exists($dia, $pagosPorDia)) {
            $pagosPorDia[$dia] = $pago;
        }
    }

    return [
        'nombre'       => $nombre,
        'concepto'     => $concepto,
        'viernes'      => $pagosPorDia['VIERNES'],
        'sabado'       => $pagosPorDia['SABADO'],
        'domingo'      => $pagosPorDia['DOMINGO'],
        'lunes'        => $pagosPorDia['LUNES'],
        'martes'       => $pagosPorDia['MARTES'],
        'miercoles'    => $pagosPorDia['MIERCOLES'],
        'jueves'       => $pagosPorDia['JUEVES'],
        'tipoConcepto' => 'NOMINA',
    ];
}

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
    $mesAbrevNuevo = array_search((int)$date->format("m"), $meses);

    // Formatear resultado
    return $date->format("d") . "/" . $mesAbrevNuevo . "/" . $date->format("Y");
}

/**
 * Genera un rango de fechas entre dos fechas dadas en formato 'DD/MM/AAA' con meses abreviados en español (ENE, FEB, MAR, etc.) y devuelve un array con todas las fechas del rango en el mismo formato.
 */
function rangoDeFechas($fechaInicio, $fechaFin)
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

    // Separar fecha inicio
    list($diaIni, $mesIni, $anioIni) = explode("/", $fechaInicio);
    $mesNumIni = $meses[$mesIni];
    $dateIni = DateTime::createFromFormat("d/m/Y", "$diaIni/$mesNumIni/$anioIni");

    // Separar fecha fin
    list($diaFin, $mesFin, $anioFin) = explode("/", $fechaFin);
    $mesNumFin = $meses[$mesFin];
    $dateFin = DateTime::createFromFormat("d/m/Y", "$diaFin/$mesNumFin/$anioFin");

    // Crear rango de fechas
    $intervalo = new DateInterval("P1D");
    $periodo = new DatePeriod($dateIni, $intervalo, $dateFin->modify("+1 day"));

    $resultado = [];
    foreach ($periodo as $fecha) {
        // Convertir número de mes a abreviatura
        $mesAbrev = array_search((int)$fecha->format("m"), $meses);
        $resultado[] = $fecha->format("d") . "/" . $mesAbrev . "/" . $fecha->format("Y");
    }

    return $resultado;
}



//=====================
//  PROCESAR FILAS DEL DEPARTAMENTO CORTE
//=====================

$filasCorte = [];

if ($jsonNomina && isset($jsonNomina['departamentos'])) {
    foreach ($jsonNomina['departamentos'] as $departamento) {
        if (($departamento['nombre'] ?? '') !== 'Corte') continue;

        foreach ($departamento['empleados'] ?? [] as $empleado) {
            $concepto = $empleado['concepto'] ?? '';
            $nombre   = $empleado['nombre']   ?? '';

            if ($concepto === 'REJA' && !empty($empleado['tickets'])) {
                $grupos = agruparTicketsPorPrecio($empleado['tickets']);
                foreach ($grupos as $precio => $ticketsGrupo) {
                    $filasCorte[] = procesarTicketsParaFila($nombre, $concepto, $ticketsGrupo, (float)$precio);
                }
            } elseif ($concepto === 'NOMINA' && !empty($empleado['nomina'])) {
                $filasCorte[] = procesarNominaParaFila($nombre, $concepto, $empleado['nomina']);
            }
        }
    }
}


// ==========================
// COLORES PARA USAR
// ==========================
$color_primario = 'FF0000';  // Color primario Rojo
$color_negro    = '000000';  // Color negro
$color_blanco   = 'FFFFFF';  // Color blanco
$colorConcepto  = 'F2F2F2';  // fondo columna CONCEPTO GRIS CLARO
$colorNomina    = 'FFD6D6';  // fondo filas NOMINA
$colorDias      = 'D5F5E3';  // verde claro para columnas de días (REJA)
$colorTotales   = 'E0E0E0';  // rojo claro para columnas de totales


//=====================
//  CONFIGURACIÓN INICIAL
//=====================

$spreadsheet = new Spreadsheet();
$sheet = $spreadsheet->getActiveSheet();

$tmp_nombre = 'SEM ' . $jsonNomina['numero_semana'] . ' - ' . date('Y') . ' RANCHO RELICARIO NOMINAS - CORTE DE LIMON - ' . date('Y-m-d_H-i-s');

// Propiedades del documento
$spreadsheet->getProperties()
    ->setCreator("BRANDON HERNANDEZ LOPEZ")
    ->setLastModifiedBy("BRANDON HERNANDEZ LOPEZ")
    ->setTitle($tmp_nombre)
    ->setSubject("Corte de Nómina")
    ->setDescription("Reporte de Corte Rancho Relicario S.I.G. SAAO")
    ->setKeywords("corte, nómina, excel")
    ->setCategory("Finanzas");

$spreadsheet->getDefaultStyle()->getFont()->setName('Arial');
$sheet->setTitle('CORTE');



//=====================
//  TÍTULOS
//=====================

if ($jsonNomina) {
    $fecha_inicio = restarUnDia($jsonNomina['fecha_inicio']) ?? 'Fecha Inicio';
    $fecha_cierre =  restarUnDia($jsonNomina['fecha_cierre']) ?? 'Fecha Cierre';
    $ano = date('Y');
} else {
    $fecha_inicio = 'Fecha Inicio';
    $fecha_cierre = 'Fecha Cierre';
    $ano = date('Y');
}

$titulo1 = 'RANCHO RELICARIO';
$titulo2 = 'REJAS DE CORTE DE LIMON';
$titulo3 = 'NOMINA DEL ' . strtoupper($fecha_inicio) . ' AL ' . strtoupper($fecha_cierre);
$titulo4 = 'SEMANA ' . (isset($jsonNomina['numero_semana']) ? str_pad($jsonNomina['numero_semana'], 2, '0', STR_PAD_LEFT) : '00') . ' - ' . $ano;

// Imprimir títulos en las filas 1 a 4, columna A
$sheet->setCellValue('A1', $titulo1);
$sheet->setCellValue('A2', $titulo2);
$sheet->setCellValue('A3', $titulo3);
$sheet->setCellValue('A4', $titulo4);

// Columnas A–M (13 columnas)
$sheet->mergeCells('A1:N1');
$sheet->mergeCells('A2:N2');
$sheet->mergeCells('A3:N3');
$sheet->mergeCells('A4:N4');

// Estilos para los titulos
$sheet->getStyle('A1')->getFont()->setBold(true)->setSize(24)->getColor()->setRGB($color_primario);
$sheet->getStyle('A2')->getFont()->setBold(true)->setSize(20);
$sheet->getStyle('A3')->getFont()->setBold(true)->setSize(14);
$sheet->getStyle('A4')->getFont()->setBold(true)->setSize(14);
$sheet->getStyle('A1:A4')->getAlignment()->setHorizontal('center');

// Logo
$logoPath = __DIR__ . '/../../../public/img/logo.jpg';
if (file_exists($logoPath)) {
    $logo = new Drawing();
    $logo->setName('Logo');
    $logo->setDescription('Logo de Rancho El Relicario');
    $logo->setPath($logoPath);
    $logo->setHeight(110);
    $logo->setCoordinates('B1');
    $logo->setOffsetX(10);
    $logo->setWorksheet($sheet);
}


// ==============================================================
// FILA DE LOS DIAS DE LA SEMANA (fila 5 de las columna D a la J)
// ==============================================================

// Generar rango de fechas entre fecha_inicio y fecha_cierre
$fechas = rangoDeFechas($fecha_inicio, $fecha_cierre);

// Fila donde quieres imprimir
$fila = 5;

// Columna de inicio
$columnaInicio = 'D';

// Recorremos las fechas y las imprimimos
$columna = $columnaInicio;

// Imprimir solo el día (DD) de cada fecha en las columnas D a J
foreach ($fechas as $fecha) {
    // Extraer solo el día (ejemplo: "05" de "05/Ene/2026")
    $dia = explode("/", $fecha)[0];

    // Escribir en la celda
    $sheet->setCellValue($columna . $fila, $dia);

    // Estilos para el rango D5:J5
    $sheet->getStyle('D5:J5')->getAlignment()->setHorizontal('center');
    $sheet->getStyle('D5:J5')->getAlignment()->setVertical('center');

    // Aplicar estilo: centrado y borde negro
    $sheet->getStyle($columna . $fila)->applyFromArray([
        'borders' => [
            'allBorders' => [
                'borderStyle' => Border::BORDER_THIN,
                'color' => ['argb' => '000000'],
            ],
        ],
    ]);

    // Avanzar a la siguiente columna
    $columna++;
}



//=====================
//  ENCABEZADOS DE LA TABLA (fila 6)
//=====================
$encabezados = [
    'A' => 'N°', // Número consecutivo
    'B' => 'NOMBRE', // Nombre del empleado
    'C' => 'CONCEPTO', // NOMINA o REJA
    'D' => 'V', // Viernes
    'E' => 'SA', // Sábado
    'F' => 'DO', // Domingo
    'G' => 'L', // Lunes
    'H' => 'MA', // Martes
    'I' => 'MI', // Miércoles
    'J' => 'J', // Jueves
    'K' => 'TOTAL REJAS', // Solo para el concepto REJA: suma de rejas por día
    'L' => 'PRECIO POR REJA', // Solo para el concepto REJA: precio por reja
    'M' => 'TOTAL EFECTIVO', // Para NOMINA: suma de pagos por día; para REJA: Total Rejas * Precio por Reja
    'N' => 'FIRMA',
];

foreach ($encabezados as $col => $titulo) {
    $sheet->setCellValue($col . '6', $titulo);
}

// Formatear los encabezados (Negrita, Centrados, Tamaño 12, Fondo Rojo, Letra Blanca)
$sheet->getStyle('A6:N6')->getFont()->setBold(true);
$sheet->getStyle('A6:N6')->getFont()->setSize(12);
$sheet->getStyle('A6:N6')->getFont()->setColor(new Color($color_blanco)); // Letra BLANCA
$sheet->getStyle('A6:N6')->getAlignment()->setHorizontal('center');
$sheet->getStyle('A6:N6')->getAlignment()->setVertical('center');
$sheet->getStyle('A6:N6')->getAlignment()->setWrapText(true); // Ajustar texto

// Agregar color de fondo rojo a los encabezados
$sheet->getStyle('A6:N6')->getFill()->setFillType('solid');
$sheet->getStyle('A6:N6')->getFill()->getStartColor()->setRGB($color_primario); // Rojo

// Ancho de columnas
$anchos = [
    'A' => 5,   // N°
    'B' => 38,  // NOMBRE
    'C' => 14,  // CONCEPTO
    'D' => 10,  // V
    'E' => 10,  // SA
    'F' => 10,  // DO
    'G' => 10,  // L
    'H' => 10,  // MA
    'I' => 10,  // MI
    'J' => 10,  // J
    'K' => 14,  // TOTAL REJAS
    'L' => 16,  // PRECIO POR REJA
    'M' => 16,  // TOTAL EFECTIVO
    'N' => 16,  // FIRMA
];
foreach ($anchos as $col => $ancho) {
    $sheet->getColumnDimension($col)->setWidth($ancho);
}



//=====================
//  AGREGAR FILAS DE DATOS
//=====================

$numeroFila     = 7;
$numeroEmpleado = 1;   // Contador para la columna N° (A)
$filasReja      = [];  // Guardar índices de filas REJA para los totales


foreach ($filasCorte as $fila) {
    $esNomina = $fila['tipoConcepto'] === 'NOMINA';

    // Fondo de la fila completa si es NOMINA
    if ($esNomina) {
        $sheet->getStyle('A' . $numeroFila . ':M' . $numeroFila)->getFill()
            ->setFillType('solid')->getStartColor()->setRGB($colorNomina);
    } else {
        // Guardar índice de fila REJA para usar en totales
        $filasReja[] = $numeroFila;
    }

    // N°
    $sheet->setCellValue('A' . $numeroFila, $numeroEmpleado);

    // NOMBRE
    $sheet->setCellValue('B' . $numeroFila, $fila['nombre']);

    // CONCEPTO — fondo gris siempre
    $sheet->setCellValue('C' . $numeroFila, $fila['concepto']);
    $sheet->getStyle('C' . $numeroFila)->applyFromArray([
        'font' => ['bold' => true, 'color' => ['rgb' => $color_negro]],
        'fill' => ['fillType' => 'solid', 'startColor' => ['rgb' => $colorConcepto]],
    ]);

    // Días (D–J)
    $diasCols = [
        'D' => 'viernes',
        'E' => 'sabado',
        'F' => 'domingo',
        'G' => 'lunes',
        'H' => 'martes',
        'I' => 'miercoles',
        'J' => 'jueves',
    ];

    foreach ($diasCols as $col => $campo) {
        $valor = $fila[$campo] ?? 0;
        if ($valor != 0) {
            $sheet->setCellValue($col . $numeroFila, $valor);
        } else {
            $sheet->setCellValue($col . $numeroFila, 0);
        }

        if ($esNomina) {
            $sheet->getStyle($col . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00');
        } else {
            // Rejas: número entero
            $sheet->getStyle($col . $numeroFila)->getNumberFormat()->setFormatCode('#,##0');
        }
    }

    // TOTAL REJAS (K)
    if (!$esNomina) {
        // Para REJA: K = SUM(D:J) — suma de rejas por día
        $sheet->setCellValue('K' . $numeroFila, '=SUM(D' . $numeroFila . ':J' . $numeroFila . ')');
        $sheet->getStyle('K' . $numeroFila)->getFont()->setBold(true);
        $sheet->getStyle('K' . $numeroFila)->getNumberFormat()->setFormatCode('#,##0');
    }

    // PRECIO POR REJA (L)
    if (!$esNomina && $fila['precio'] !== null) {
        $sheet->setCellValue('L' . $numeroFila, $fila['precio']);
        $sheet->getStyle('L' . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00');
    }

    // TOTAL EFECTIVO (M)
    if ($esNomina) {
        // Para NOMINA: M = SUM(D:J) — suma de pagos por día
        $sheet->setCellValue('M' . $numeroFila, '=SUM(D' . $numeroFila . ':J' . $numeroFila . ')');
    } else {
        // Para REJA: M = K * L — Total Rejas × Precio por Reja
        $sheet->setCellValue('M' . $numeroFila, '=K' . $numeroFila . '*L' . $numeroFila);
    }
    $sheet->getStyle('M' . $numeroFila)->applyFromArray([
        'font'         => ['bold' => true],
        'numberFormat' => ['formatCode' => '$#,##0.00'],
    ]);

    // Alineación de la fila
    $sheet->getStyle('A' . $numeroFila)->getAlignment()->setHorizontal('center')->setVertical('center');
    $sheet->getStyle('B' . $numeroFila)->getAlignment()->setHorizontal('left')->setVertical('center');
    $sheet->getStyle('C' . $numeroFila . ':M' . $numeroFila)->getAlignment()->setHorizontal('center')->setVertical('center');

    // Tamaño de letra de la fila
    $sheet->getStyle('A' . $numeroFila . ':M' . $numeroFila)->getFont()->setSize(12);
    $sheet->getStyle('B' . $numeroFila)->getFont()->setSize(13);

    $numeroFila++;
    $numeroEmpleado++;
}



//=====================
//  FILA DE TOTALES
//=====================

$filaTotal = $numeroFila;

$sheet->setCellValue('C' . $filaTotal, 'TOTALES');
$sheet->getStyle('C' . $filaTotal)->applyFromArray([
    'font'      => ['bold' => true, 'size' => 12],
    'alignment' => ['horizontal' => 'center', 'vertical' => 'center'],
    'fill'      => ['fillType' => 'solid', 'startColor' => ['rgb' => $colorTotales]],
]);

// Aplicar fondo gris a toda la fila de totales
$sheet->getStyle('A' . $filaTotal . ':M' . $filaTotal)->getFill()
    ->setFillType('solid')->getStartColor()->setRGB($colorTotales);

// Columnas D-J (días): Dejar vacías (no sumar, no tiene sentido mezclar rejas con dinero)

// Columna K (TOTAL REJAS): Solo sumar filas REJA
if (!empty($filasReja)) {
    $primeraFila = min($filasReja);
    $ultimaFila  = max($filasReja);

    // Construir fórmula SUM solo para filas REJA (si hay múltiples no contiguas, usar SUM directo)
    $sheet->setCellValue('K' . $filaTotal, '=SUM(K' . $primeraFila . ':K' . $ultimaFila . ')');
    // Pero esto suma incluidas las NOMINA. Mejor usar SUMIF
    // SUMIF busca en una columna (C) el valor 'REJA' y suma los correspondientes en K
    $sheet->setCellValue('K' . $filaTotal, '=SUMIF(C7:C' . ($filaTotal - 1) . ',"REJA",K7:K' . ($filaTotal - 1) . ')');

    $sheet->getStyle('K' . $filaTotal)->applyFromArray([
        'font'      => ['bold' => true, 'size' => 12],
        'alignment' => ['horizontal' => 'center', 'vertical' => 'center'],
    ]);
    $sheet->getStyle('K' . $filaTotal)->getNumberFormat()->setFormatCode('#,##0');
}

// Columna L (PRECIO POR REJA): SE QUEDA VACIA

// Columna M (TOTAL EFECTIVO): Sumar TODO (REJA + NOMINA)
$sheet->setCellValue('M' . $filaTotal, '=SUM(M7:M' . ($filaTotal - 1) . ')');
$sheet->getStyle('M' . $filaTotal)->applyFromArray([
    'font'      => ['bold' => true, 'size' => 12],
    'alignment' => ['horizontal' => 'center', 'vertical' => 'center'],
]);
$sheet->getStyle('M' . $filaTotal)->getNumberFormat()->setFormatCode('$#,##0.00');

$sheet->getRowDimension($filaTotal)->setRowHeight(25);



//=====================
//  BORDES
//=====================

$sheet->getStyle('A6:N' . $filaTotal)->applyFromArray([
    'borders' => [
        'allBorders' => [
            'borderStyle' => Border::BORDER_THIN,
            'color'       => ['rgb' => $color_negro],
        ],
    ],
]);



//=====================
//  ALTURA DE FILAS Y TAMAÑO
//=====================

$sheet->getRowDimension(1)->setRowHeight(38);
$sheet->getRowDimension(2)->setRowHeight(28);
$sheet->getRowDimension(3)->setRowHeight(24);
$sheet->getRowDimension(4)->setRowHeight(24);
$sheet->getRowDimension(5)->setRowHeight(20);
$sheet->getRowDimension(6)->setRowHeight(40);

for ($f = 7; $f < $numeroFila; $f++) {
    $sheet->getRowDimension($f)->setRowHeight(32);
}



//=====================
//  CONFIGURACIÓN DE PÁGINA
//=====================

$sheet->getPageSetup()->setPaperSize(PageSetup::PAPERSIZE_LETTER);
$sheet->getPageSetup()->setOrientation(PageSetup::ORIENTATION_LANDSCAPE);
$sheet->getPageMargins()->setLeft(0.4);
$sheet->getPageMargins()->setRight(0.4);
$sheet->getPageMargins()->setTop(0.4);
$sheet->getPageMargins()->setBottom(0.4);
$sheet->getPageSetup()->setFitToPage(true);
$sheet->getPageSetup()->setFitToHeight(0);
$sheet->getPageSetup()->setFitToWidth(1);
$sheet->getPageSetup()->setPrintArea('A1:N' . $filaTotal);



//=====================
//  DESCARGAR ARCHIVO
//=====================

$writer = new Xlsx($spreadsheet);

$filename = 'Nomina_Corte_' . date('Y-m-d_H-i-s') . '.xlsx';

header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
header('Content-Disposition: attachment; filename="' . $filename . '"');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

$writer->save('php://output');
exit;