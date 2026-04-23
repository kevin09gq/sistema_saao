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


// ==========================
// COLORES PARA USAR
// ==========================
$color_primario = 'C9C5C3';  // Color primario Rojo
$color_negro    = '000000';  // Color negro
$color_blanco   = 'FFFFFF';  // Color blanco
$colorConcepto  = 'F2F2F2';  // fondo columna CONCEPTO GRIS CLARO
$colorNomina    = 'FFD6D6';  // fondo filas NOMINA
$colorDias      = 'D5F5E3';  // verde claro para columnas de días (REJA)
$colorTotales   = 'E0E0E0';  // Gris claro para columnas de totales
$color_rojo_claro   = 'FFE8E8';  // rojo claro para columnas de totales



//==============================
//  FUNCIONES AUXILIARES CORTE
//==============================

/**
 * Convierte una fecha en formato 'DD/MM/AAA' a timestamp
 */
function fechaATimestamp($fecha)
{
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

    list($dia, $mesAbrev, $anio) = explode("/", $fecha);
    $mesNum = $meses[$mesAbrev];
    return mktime(0, 0, 0, $mesNum, (int)$dia, (int)$anio);
}

/**
 * Verifica si una fecha (YYYY-MM-DD) está dentro del rango
 */
function estaEnRango($fechaStr, $fechaInicio, $fechaFin)
{
    [$anio, $mes, $dia] = array_map('intval', explode('-', $fechaStr));
    $fechaMovimiento = mktime(0, 0, 0, $mes, $dia, $anio);

    // Convertir fechas DD/MM/AAA a timestamps
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

    list($diaIni, $mesAbrevIni, $anioIni) = explode("/", $fechaInicio);
    $mesNumIni = $meses[$mesAbrevIni];
    $timestampInicio = mktime(0, 0, 0, $mesNumIni, (int)$diaIni, (int)$anioIni);

    list($diaFin, $mesAbrevFin, $anioFin) = explode("/", $fechaFin);
    $mesNumFin = $meses[$mesAbrevFin];
    $timestampFin = mktime(0, 0, 0, $mesNumFin, (int)$diaFin, (int)$anioFin);

    return $fechaMovimiento >= $timestampInicio && $fechaMovimiento <= $timestampFin;
}

/**
 * Obtiene el nombre del día de la semana en español a partir de una fecha 'YYYY-MM-DD'
 */
function obtenerDiaSemanaPoda(string $fechaStr): string
{
    [$anio, $mes, $dia] = array_map('intval', explode('-', $fechaStr));
    $timestamp = mktime(0, 0, 0, $mes, $dia, $anio);
    $dias = ['DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'];
    return $dias[(int)date('w', $timestamp)];
}

/**
 * Agrupa los movimientos por concepto + monto, marcando extras si están fuera del rango
 */
function agruparMovimientosPoda(array $movimientos, $fechaInicio, $fechaFin): array
{
    $agrupados = [];

    foreach ($movimientos as $mov) {
        $concepto = $mov['concepto'] ?? '';
        $monto = (string)($mov['monto'] ?? 0);
        $fecha = $mov['fecha'] ?? '';

        // Verificar si está fuera del rango
        $esExtra = !estaEnRango($fecha, $fechaInicio, $fechaFin);

        // Si es extra, agregar día al concepto: "E. CONCEPTO (DÍA)"
        if ($esExtra) {
            $dia = (int)explode('-', $fecha)[2];
            $concepto = "E. " . $concepto . " (" . $dia . ")";
        }

        $clave = $concepto . '_' . $monto;

        $agrupados[$clave][] = $mov;
    }

    return $agrupados;
}

/**
 * Procesa un grupo de movimientos (misma clave) y genera una fila
 */
function procesarMovimientosParaFila(string $nombre, string $concepto, array $movimientosGrupo, float $monto): array
{
    $valoresPorDia = [
        'VIERNES' => 0,
        'SABADO' => 0,
        'DOMINGO' => 0,
        'LUNES' => 0,
        'MARTES' => 0,
        'MIERCOLES' => 0,
        'JUEVES' => 0
    ];

    $totalArboles = 0;
    $totalEfectivo = 0;

    // Verificar si es PODA (puede tener prefijo "E. ")
    $esPoda = strpos($concepto, 'PODA') !== false;

    foreach ($movimientosGrupo as $mov) {

        $dia = obtenerDiaSemanaPoda($mov['fecha']);

        if (!array_key_exists($dia, $valoresPorDia)) continue;

        // PODA
        if ($esPoda) {

            $arboles = intval($mov['arboles_podados'] ?? 0);

            $valoresPorDia[$dia] += $arboles;
            $totalArboles += $arboles;
            $totalEfectivo += ($arboles * $monto);
        }
        // EXTRAS
        else {

            $valor = floatval($mov['monto'] ?? 0);

            $valoresPorDia[$dia] += $valor;
            $totalEfectivo += $valor;
        }
    }

    return [
        'nombre'           => $nombre,
        'concepto'         => $concepto,
        'viernes'          => $valoresPorDia['VIERNES'],
        'sabado'           => $valoresPorDia['SABADO'],
        'domingo'          => $valoresPorDia['DOMINGO'],
        'lunes'            => $valoresPorDia['LUNES'],
        'martes'           => $valoresPorDia['MARTES'],
        'miercoles'        => $valoresPorDia['MIERCOLES'],
        'jueves'           => $valoresPorDia['JUEVES'],
        'total_arboles'    => $esPoda ? $totalArboles : 0,
        'precio'           => $esPoda ? $monto : 0,
        'total_efectivo'   => $totalEfectivo,
        'tipoConcepto'     => $esPoda ? 'PODA' : 'EXTRA'
    ];
}

/**
 * Resta un día a una fecha en formato 'DD/MM/AAA' con meses abreviados en español (ENE, FEB, MAR, etc.) y devuelve la nueva fecha en el mismo formato.
 * @param String $fecha Fecha en formato 'DD/MM/AAA'
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
    $date->modify("0 day");

    // Buscar la abreviatura del mes resultante
    $mesAbrevNuevo = array_search((int)$date->format("m"), $meses);

    // Formatear resultado
    return $date->format("d") . "/" . $mesAbrevNuevo . "/" . $date->format("Y");
}

/**
 * Genera un rango de fechas entre dos fechas dadas en formato 'DD/MM/AAA' con meses abreviados en español (ENE, FEB, MAR, etc.) y devuelve un array con todas las fechas del rango en el mismo formato.
 * @param String $fechaInicio Fecha de inicio en formato 'DD/MM/AAA'
 * @param String $fechaFin Fecha de fin en formato 'DD/MM/AAA'
 * @return Array $resultado Arreglo de fechas en formato 'DD/MM/AAA'
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

/**
 * Verifica si el texto contiene un numero entre parentesi. Ejemplo: "E. PODA (30)" o "E. EXTRAS (15)"
 * Si lo tiene signfica que es un dia extra fuera del rango
 * @param String $texto El texto a verificar
 * @return Bool Retorna true si el texto contiene un número entre paréntesis, false en caso contrario
 */
function esDiaExtra($texto)
{
    // Expresión regular: busca un número dentro de paréntesis
    return preg_match('/\(\d+\)/', $texto) === 1;
}

// ===================================================
// PROCESAR LAS FECHAS
// ===================================================


// Definir fechas para usar en el procesamiento
// Las fechas que vienen en el JSON son del día siguiente, así que se restan 1 día
if ($jsonNomina) {
    // O usar fechas por default si no vienen en el JSON
    $fecha_inicio_json = $jsonNomina['fecha_inicio'] ?? '01/Ene/2025';
    $fecha_cierre_json = $jsonNomina['fecha_cierre'] ?? '07/Ene/2025';

    // Restar 1 día usando la función existente (las fechas ya están en DD/MM/AAA)
    $fecha_inicio = restarUnDia($fecha_inicio_json); // 24/Ene/2026 → 23/Ene/2026
    $fecha_cierre = restarUnDia($fecha_cierre_json); // 30/Ene/2026 → 29/Ene/2026
} else {
    // Fechas por default si hay fechas
    $fecha_inicio = '01/Ene/2025';
    $fecha_cierre = '07/Ene/2025';
}

// Año para el título del Excel (si no viene en el JSON, usar año actual)
$ano = date('Y');


//=====================
//  PROCESAR FILAS DEL DEPARTAMENTO PODA
//=====================

$filasPoda = [];

if ($jsonNomina && isset($jsonNomina['departamentos'])) {

    foreach ($jsonNomina['departamentos'] as $departamento) {

        // Omitir departamentos que no sean PODA
        if (($departamento['nombre'] ?? '') !== 'Poda') continue;

        // Recorrer empleados del departamento PODA
        foreach ($departamento['empleados'] ?? [] as $empleado) {

            // Obtener nombre y movimientos del empleado
            $nombre = $empleado['nombre'] ?? '';
            $movimientos = $empleado['movimientos'] ?? [];

            // Si no hay movimientos, saltar al siguiente empleado
            if (empty($movimientos)) continue;

            // Agrupar movimientos por concepto+monto para generar filas combinadas
            $grupos = agruparMovimientosPoda($movimientos, $fecha_inicio, $fecha_cierre);

            // Procesar cada grupo para generar una fila en el Excel
            $filasEmpleado = [];

            // Cada grupo representa un concepto+monto específico (ejemplo: PODA a $50, E. PODA (30) a $50, EXTRAS a $200, etc.)
            foreach ($grupos as $clave => $grupo) {

                // La clave es "CONCEPTO_MONTO", extraer el monto al final
                $partes = explode('_', $clave);
                $monto = array_pop($partes);
                $concepto = implode('_', $partes); // Reconstruir concepto por si tiene guiones bajos
                $monto = floatval($monto);

                // Generar fila para este grupo de movimientos
                $fila = procesarMovimientosParaFila($nombre, $concepto, $grupo, $monto);
                // Agregar la fila al array de filas del empleado
                $filasEmpleado[] = $fila;
            }

            // ORDEN: primero PODA normales, luego E. PODA, luego EXTRAS normales, luego E. EXTRAS
            usort($filasEmpleado, function ($a, $b) {
                $esAExtra = strpos($a['concepto'], 'E.') === 0;
                $esBExtra = strpos($b['concepto'], 'E.') === 0;

                // Mismo tipo de concepto
                if ($a['tipoConcepto'] === $b['tipoConcepto']) {
                    // Si ambos son extras (E.), mantener orden natural
                    if ($esAExtra && $esBExtra) return 0;
                    // Si uno es extra (E.) y otro no, el que no es extra va primero
                    if ($esAExtra !== $esBExtra) return $esAExtra ? 1 : -1;
                    return 0;
                }

                // Diferente tipo: PODA va antes que EXTRA
                return ($a['tipoConcepto'] === 'PODA') ? -1 : 1;
            });

            // Agregar al resultado final
            $filasPoda = array_merge($filasPoda, $filasEmpleado);
        }
    }
}



//=====================
//  CONFIGURACIÓN INICIAL
//=====================

$spreadsheet = new Spreadsheet();
$sheet = $spreadsheet->getActiveSheet();

$tmp_nombre = 'SEM ' . $jsonNomina['numero_semana'] . ' - ' . date('Y') . ' RANCHO PALMILLA NOMINAS - PODA DE ARBOLES - ' . date('Y-m-d_H-i-s');

// Propiedades del documento
$spreadsheet->getProperties()
    ->setCreator("BRANDON HERNANDEZ LOPEZ")
    ->setLastModifiedBy("BRANDON HERNANDEZ LOPEZ")
    ->setTitle($tmp_nombre)
    ->setSubject("Corte de Nómina")
    ->setDescription("Reporte de Corte Rancho PALMILLA S.I.G. SAAO")
    ->setKeywords("corte, nómina, excel")
    ->setCategory("Finanzas");

$spreadsheet->getDefaultStyle()->getFont()->setName('Arial');
$sheet->setTitle('CORTE');



//=====================
//  TÍTULOS
//=====================

$titulo1 = 'RANCHO PALMILLA';
$titulo2 = 'PODA DE ARBOLES';
$titulo3 = 'NOMINA DEL ' . strtoupper($fecha_inicio) . ' AL ' . strtoupper($fecha_cierre);
$titulo4 = 'SEMANA ' . (isset($jsonNomina['numero_semana']) ? str_pad($jsonNomina['numero_semana'], 2, '0', STR_PAD_LEFT) : '00') . ' - ' . $ano;

$sheet->setCellValue('A1', $titulo1);
$sheet->setCellValue('A2', $titulo2);
$sheet->setCellValue('A3', $titulo3);
$sheet->setCellValue('A4', $titulo4);

// Columnas A–M (13 columnas)
$sheet->mergeCells('A1:N1');
$sheet->mergeCells('A2:N2');
$sheet->mergeCells('A3:N3');
$sheet->mergeCells('A4:N4');

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
    'K' => 'TOTAL ARBOLES', // Solo para el concepto REJA: suma de rejas por día
    'L' => 'PAGO POR ARBOL', // Solo para el concepto REJA: precio por reja
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
    'C' => 25,  // CONCEPTO
    'D' => 10,  // V
    'E' => 10,  // SA
    'F' => 10,  // DO
    'G' => 10,  // L
    'H' => 10,  // MA
    'I' => 10,  // MI
    'J' => 10,  // J
    'K' => 14,  // TOTAL ARBOLES
    'L' => 13,  // PAGO POR ARBOL
    'M' => 16,  // TOTAL EFECTIVO
    'N' => 20,  // FIRMA
];
foreach ($anchos as $col => $ancho) {
    $sheet->getColumnDimension($col)->setWidth($ancho);
}



//=====================
//  AGREGAR FILAS DE DATOS
//=====================

$numeroFila     = 7;
$numeroEmpleado = 1;
$nombre_tmp = '';

foreach ($filasPoda as $fila) {

    $esPoda  = $fila['tipoConcepto'] === 'PODA';
    $esExtra = $fila['tipoConcepto'] === 'EXTRA';

    // =========================
    // A → NÚMERO
    // =========================

    if ($nombre_tmp == '') {
        $sheet->setCellValue('A' . $numeroFila, $numeroEmpleado);
        $nombre_tmp = $fila['nombre'];
    } else if ($nombre_tmp == $fila['nombre']) {
        $sheet->setCellValue('A' . $numeroFila, '');
    } else {
        $numeroEmpleado++;
        $sheet->setCellValue('A' . $numeroFila, $numeroEmpleado);
        $nombre_tmp = $fila['nombre'];
    }

    // =========================
    // B → NOMBRE
    // =========================
    $sheet->setCellValue('B' . $numeroFila, $fila['nombre']);

    // =========================
    // C → CONCEPTO
    // =========================
    $sheet->setCellValue('C' . $numeroFila, $fila['concepto']);
    $sheet->getStyle('C' . $numeroFila)->getFont()->setBold(true);
    $sheet->getStyle('C' . $numeroFila)->getFill()->setFillType('solid');
    $sheet->getStyle('C' . $numeroFila)->getFill()->getStartColor()->setRGB($colorConcepto);

    // Si el concepto es un dia extra, aplicar un color rojo claro a las columnas D a M de esa fila
    if (esDiaExtra($fila['concepto'])) {
        $sheet->getStyle('D' . $numeroFila . ':M' . $numeroFila)->getFill()->setFillType('solid');
        $sheet->getStyle('D' . $numeroFila . ':M' . $numeroFila)->getFill()->getStartColor()->setRGB($color_rojo_claro);
    }

    // =========================
    // D → J (DÍAS)
    // =========================
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

        $sheet->setCellValue($col . $numeroFila, $valor);

        // FORMATO SEGÚN TIPO
        if ($esPoda) {
            // Entero (árboles)
            $sheet->getStyle($col . $numeroFila)
                ->getNumberFormat()
                ->setFormatCode('#,##0;-#,##0;;');
        } else {
            // Moneda (extras)
            $sheet->getStyle($col . $numeroFila)
                ->getNumberFormat()
                ->setFormatCode('$#,##0.00;-$#,##0.00;;');
        }
    }

    // =========================
    // K → TOTAL ÁRBOLES
    // =========================
    if ($esPoda) {
        $sheet->setCellValue('K' . $numeroFila, '=SUM(D' . $numeroFila . ':J' . $numeroFila . ')');
    } else {
        $sheet->setCellValue('K' . $numeroFila, '');
    }
    $sheet->getStyle('K' . $numeroFila)
        ->getNumberFormat()
        ->setFormatCode('#,##0');

    // =========================
    // L → PAGO POR ÁRBOL
    // =========================
    if ($esPoda) {
        $sheet->setCellValue('L' . $numeroFila, $fila['precio']);
        $sheet->getStyle('L' . $numeroFila)
            ->getNumberFormat()
            ->setFormatCode('$#,##0.00');
    } else {
        $sheet->setCellValue('L' . $numeroFila, '');
    }

    // =========================
    // M → TOTAL EFECTIVO
    // =========================
    if ($esPoda) {
        // K * L
        $sheet->setCellValue('M' . $numeroFila, '=K' . $numeroFila . '*L' . $numeroFila);
    } else {
        // SUMA D-J
        $sheet->setCellValue('M' . $numeroFila, '=SUM(D' . $numeroFila . ':J' . $numeroFila . ')');
    }

    $sheet->getStyle('M' . $numeroFila)->applyFromArray([
        'font' => ['bold' => true],
        'numberFormat' => ['formatCode' => '$#,##0.00'],
    ]);

    // =========================
    // N → FIRMA
    // =========================
    $sheet->setCellValue('N' . $numeroFila, '');

    // =========================
    // ALINEACIÓN
    // =========================
    $sheet->getStyle('A' . $numeroFila)
        ->getAlignment()->setHorizontal('center')->setVertical('center');

    $sheet->getStyle('B' . $numeroFila)
        ->getAlignment()->setHorizontal('left')->setVertical('center');

    $sheet->getStyle('C' . $numeroFila . ':N' . $numeroFila)
        ->getAlignment()->setHorizontal('center')->setVertical('center');

    // =========================
    // TAMAÑO DE LETRA
    // =========================
    $sheet->getStyle('A' . $numeroFila . ':N' . $numeroFila)
        ->getFont()->setSize(12);

    $sheet->getStyle('B' . $numeroFila)
        ->getFont()->setSize(13);

    // =========================
    // SIGUIENTE FILA
    // =========================
    $numeroFila++;
    // $numeroEmpleado++;
}



//=====================
//  FILA DE TOTALES
//=====================

$filaTotal = $numeroFila - 1;


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