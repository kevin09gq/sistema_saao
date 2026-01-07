<?php
// Funciones auxiliares - declarar antes de usar
function obtenerDiaSemana($fecha)
{
    if (!$fecha) return '';
    $partes = explode('/', $fecha);
    if (count($partes) !== 3) return '';

    $dd = intval($partes[0]);
    $mm = intval($partes[1]);
    $yyyy = intval($partes[2]);

    if (!$dd || !$mm || !$yyyy) return '';

    $timestamp = mktime(0, 0, 0, $mm, $dd, $yyyy);
    if ($timestamp === false) return '';

    $dias = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];
    return $dias[date('w', $timestamp)];
}

function normalizarHora($hora)
{
    if (!$hora) return '';
    $partes = explode(':', $hora);
    if (count($partes) < 2) return '';
    return str_pad($partes[0], 2, '0', STR_PAD_LEFT) . ':' . str_pad($partes[1], 2, '0', STR_PAD_LEFT);
}

function calcularDiferencia($inicio, $fin)
{
    if (!$inicio || !$fin) return '00:00';

    $partesI = explode(':', $inicio);
    $partesF = explode(':', $fin);

    if (count($partesI) < 2 || count($partesF) < 2) return '00:00';

    $hi = intval($partesI[0]);
    $mi = intval($partesI[1]);
    $hf = intval($partesF[0]);
    $mf = intval($partesF[1]);

    $minutosInicio = ($hi * 60) + $mi;
    $minutosFin = ($hf * 60) + $mf;

    $diff = $minutosFin - $minutosInicio;
    if ($diff < 0) $diff += 24 * 60;

    $horas = floor($diff / 60);
    $minutos = $diff % 60;

    return str_pad($horas, 2, '0', STR_PAD_LEFT) . ':' . str_pad($minutos, 2, '0', STR_PAD_LEFT);
}

function convertirFecha($fecha)
{
    if (!$fecha) return '';

    $fecha = trim($fecha);

    // Reemplazar directamente los nombres de meses por números
    $reemplazos = [
        '/\/ene(ro)?\/|\/jan(uary)?\/|\/Ene(ro)?\/|\/ENE(RO)?\//i' => '/01/',
        '/\/feb(rero)?\/|\/feb(ruary)?\/|\/Feb(rero)?\/|\/FEB(RERO)?\//i' => '/02/',
        '/\/mar(zo)?\/|\/mar(ch)?\/|\/Mar(zo)?\/|\/MAR(ZO)?\//i' => '/03/',
        '/\/abr(il)?\/|\/apr(il)?\/|\/Abr(il)?\/|\/ABR(IL)?\//i' => '/04/',
        '/\/may(o)?\/|\/May(o)?\/|\/MAY(O)?\//i' => '/05/',
        '/\/jun(io)?\/|\/Jun(io)?\/|\/JUN(IO)?\//i' => '/06/',
        '/\/jul(io)?\/|\/Jul(io)?\/|\/JUL(IO)?\//i' => '/07/',
        '/\/ago(sto)?\/|\/aug(ust)?\/|\/Ago(sto)?\/|\/AGO(STO)?\//i' => '/08/',
        '/\/sep(tiembre)?\/|\/sep(tember)?\/|\/Sep(tiembre)?\/|\/SEP(TIEMBRE)?\//i' => '/09/',
        '/\/oct(ubre)?\/|\/oct(ober)?\/|\/Oct(ubre)?\/|\/OCT(UBRE)?\//i' => '/10/',
        '/\/nov(iembre)?\/|\/nov(ember)?\/|\/Nov(iembre)?\/|\/NOV(IEMBRE)?\//i' => '/11/',
        '/\/dic(iembre)?\/|\/dec(ember)?\/|\/Dic(iembre)?\/|\/DIC(IEMBRE)?\//i' => '/12/'
    ];

    foreach ($reemplazos as $patron => $reemplazo) {
        $fecha = preg_replace($patron, $reemplazo, $fecha);
    }

    // Si tiene formato DD/MM/YYYY con números, asegurar formato correcto
    if (preg_match('/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/', $fecha, $matches)) {
        $dia = str_pad($matches[1], 2, '0', STR_PAD_LEFT);
        $mes = str_pad($matches[2], 2, '0', STR_PAD_LEFT);
        return $dia . '/' . $mes . '/' . $matches[3];
    }

    return $fecha;
}

/**
 * =========================================================================
 * Redondea horas en formato HH:MM a horas decimales según la regla:
 * Si los minutos son 10 o menos, se redondea hacia abajo al número entero
 * =========================================================================
 */
function redondearHoras($hhmm)
{
    list($horasStr, $minutosStr) = explode(':', $hhmm ?? '00:00');
    $horas = (int)$horasStr;
    $minutos = (int)$minutosStr;
    $resultado = ($minutos <= 10) ? $horas : $horas + 1;
    return number_format($resultado, 2, '.', '');
}

// Inicio del script principal
require_once '../../vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Worksheet\PageSetup;

// Obtener datos del POST
$datosJson = $_POST['datos'] ?? null;
if (!$datosJson) {
    header('Content-Type: application/json');
    http_response_code(400);
    echo json_encode(['error' => 'No se recibieron datos']);
    exit;
}

$datos = json_decode($datosJson, true);
if (!$datos) {
    header('Content-Type: application/json');
    http_response_code(400);
    echo json_encode(['error' => 'Error al decodificar datos JSON']);
    exit;
}

try {
    // Crear nuevo Spreadsheet
    $spreadsheet = new Spreadsheet();
    $sheet = $spreadsheet->getActiveSheet();
    $sheet->setTitle('Reporte Reloj');

    // Estilos
    $styleHeader = [
        'font' => ['bold' => true, 'size' => 10],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER, 'wrapText' => true],
        'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]],
        'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'FFFFFF']]
    ];

    $styleCell = [
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER, 'wrapText' => true],
        'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]]
    ];

    $styleColorSecondary = [
        'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'A6A6A6']]
    ];

    $styleColorPrimary = [
        'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '538DD5']]
    ];

    $styleColorSuccess = [
        'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => '00B050']]
    ];

    $styleColorWarning = [
        'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'FFFF00']]
    ];

    // Procesar empleados
    $empleadosFlat = [];
    if (isset($datos['departamentos']) && is_array($datos['departamentos'])) {
        foreach ($datos['departamentos'] as $dept) {
            $deptNombre = $dept['nombre'] ?? '';
            $deptNombre = preg_replace('/^\d+\s*/', '', $deptNombre);

            if (isset($dept['empleados']) && is_array($dept['empleados'])) {
                foreach ($dept['empleados'] as $emp) {
                    $empleadosFlat[] = [
                        'departamento' => $deptNombre,
                        'empleado' => $emp
                    ];
                }
            }
        }
    }

    $fila = 1;
    $deptActual = null;

    foreach ($empleadosFlat as $item) {
        $emp = $item['empleado'];
        $registros = $emp['registros_procesados'] ?? [];
        $esPrimeroDeDepartamento = ($deptActual !== $item['departamento']);
        $deptActual = $item['departamento'];

        // Encabezado del reporte (solo en primera página)
        if ($fila === 1) {
            $sheet->setCellValue("A{$fila}", "Reporte General");
            $sheet->mergeCells("A{$fila}:K{$fila}");
            $sheet->getStyle("A{$fila}")->applyFromArray([
                'font' => ['bold' => true, 'size' => 14],
            ]);
            // Si aquí debe ir la fecha, agrégala en la celda correspondiente, pero fuera del array de estilos
            // $sheet->setCellValue("C{$fila}", convertirFecha($fechaInicio));
            // $sheet->getStyle("C{$fila}")->getAlignment()->setWrapText(false);
            $fila++;

            $numSemana = $datos['numero_semana'] ?? '';
            $sheet->setCellValue("A{$fila}", "SEM {$numSemana}");
            $sheet->mergeCells("A{$fila}:K{$fila}");
            $sheet->getStyle("A{$fila}")->applyFromArray([
                'font' => ['bold' => true, 'size' => 12],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_RIGHT]
            ]);
            $fila++;
            $fila++;
        }

        // Mostrar Departamento, Desde, Hasta solo para el primer empleado del departamento
        if ($esPrimeroDeDepartamento) {
            $sheet->setCellValue("A{$fila}", "Departamento");
            $sheet->mergeCells("A{$fila}:B{$fila}");
            $sheet->setCellValue("C{$fila}", $item['departamento']);
            $sheet->mergeCells("C{$fila}:K{$fila}");
            $sheet->getStyle("A{$fila}:K{$fila}")->applyFromArray($styleHeader);
            $fila++;

            $fechaInicio = $datos['fecha_inicio'] ?? '';
            $fechaFin = $datos['fecha_cierre'] ?? '';

            $sheet->setCellValue("A{$fila}", "Desde");
            $sheet->mergeCells("A{$fila}:B{$fila}");
            $sheet->setCellValue("C{$fila}", convertirFecha($fechaInicio));
            $sheet->mergeCells("C{$fila}:E{$fila}");
            $sheet->setCellValue("F{$fila}", "Hasta");
            $sheet->mergeCells("F{$fila}:G{$fila}");
            $sheet->setCellValue("H{$fila}", convertirFecha($fechaFin));
            $sheet->mergeCells("H{$fila}:K{$fila}");
            $sheet->getStyle("A{$fila}:K{$fila}")->applyFromArray($styleHeader);
            $fila++;
        }

        // Encabezado del empleado
        $sheet->setCellValue("A{$fila}", "Nombre");
        $sheet->mergeCells("A{$fila}:C{$fila}");
        $sheet->setCellValue("D{$fila}", $emp['nombre'] ?? '');
        $sheet->mergeCells("D{$fila}:G{$fila}");
        $sheet->setCellValue("H{$fila}", "Número de Tarjeta");
        $sheet->mergeCells("H{$fila}:I{$fila}");
        $sheet->setCellValue("J{$fila}", "");
        $sheet->mergeCells("J{$fila}:K{$fila}");
        $sheet->getStyle("A{$fila}:K{$fila}")->applyFromArray($styleHeader);
        // Quitar wrapText para el nombre y ajustar alto de fila
        $sheet->getStyle("D{$fila}")->getAlignment()->setWrapText(false);
        $sheet->getRowDimension($fila)->setRowHeight(-1); // Auto-ajuste
        $fila++;

        // Encabezados de columnas
        $sheet->setCellValue("A{$fila}", "ID");
        $sheet->setCellValue("B{$fila}", "DIA");
        $sheet->setCellValue("C{$fila}", "Fecha");
        $sheet->setCellValue("D{$fila}", "Turno");
        $sheet->setCellValue("E{$fila}", "Entrada");
        $sheet->setCellValue("F{$fila}", "Salida");
        $sheet->setCellValue("G{$fila}", "Redondeo Entrada");
        $sheet->setCellValue("H{$fila}", "Redondeo Salida");
        $sheet->setCellValue("I{$fila}", "Trabajado");
        $sheet->setCellValue("J{$fila}", "Tarde / Temprano");
        $sheet->setCellValue("K{$fila}", "Descanso");
        $sheet->getStyle("A{$fila}:K{$fila}")->applyFromArray($styleHeader);
        $fila++;

        // Datos de registros
        foreach ($registros as $r) {
            $fecha = $r['fecha'] ?? '';
            $dia = obtenerDiaSemana($fecha);
            $turnoTxt = '';

            // 1. Buscar en el horario del empleado para ese día
            $horario = $emp['horario'] ?? [];
            $diasSemana = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];
            $diaIndex = -1;
            if ($fecha) {
                $partes = explode('/', $fecha);
                if (count($partes) === 3) {
                    $dd = intval($partes[0]);
                    $mm = intval($partes[1]);
                    $yyyy = intval($partes[2]);
                    if ($dd && $mm && $yyyy) {
                        $ts = mktime(0, 0, 0, $mm, $dd, $yyyy);
                        $diaIndex = intval(date('w', $ts));
                    }
                }
            }
            if ($diaIndex >= 0 && is_array($horario) && count($horario) > 0) {
                $diaNombre = $diasSemana[$diaIndex];
                foreach ($horario as $h) {
                    if (isset($h['dia']) && strtoupper($h['dia']) === $diaNombre && !empty($h['entrada']) && !empty($h['salida'])) {
                        $turnoTxt = 'DIURNA(' . $h['entrada'] . '-' . $h['salida'] . ')';
                        break;
                    }
                }
            }

            // 2. Si no hay turno del día, usar tipo_turno del registro (si es válido)
            if (!$turnoTxt && isset($r['tipo_turno']) && $r['tipo_turno'] !== 'N/A' && trim($r['tipo_turno']) !== '') {
                $turnoTxt = $r['tipo_turno'];
            }

            // 3. Si aún no hay, buscar en turno_base/turno_sabado
            if (!$turnoTxt) {
                $turno = ($dia === 'SÁBADO') ? ($emp['turno_sabado'] ?? null) : ($emp['turno_base'] ?? null);
                if ($turno && (isset($turno['descripcion']) || isset($turno['hora_inicio']) || isset($turno['hora_fin']))) {
                    $turnoDesc = $turno['descripcion'] ?? '';
                    $tIni = normalizarHora($turno['hora_inicio'] ?? '');
                    $tFin = normalizarHora($turno['hora_fin'] ?? '');
                    $turnoTxt = ($turnoDesc || $tIni || $tFin) ? ($turnoDesc . (($tIni || $tFin) ? "($tIni-$tFin)" : '')) : '';
                }
            }

            // 4. Si es día de descanso y aún no hay turno, buscar cualquier día con horario para obtener el turno base
            if (!$turnoTxt && is_array($horario) && count($horario) > 0) {
                foreach ($horario as $h) {
                    if (!empty($h['entrada']) && !empty($h['salida'])) {
                        $turnoTxt = 'DIURNA(' . $h['entrada'] . '-' . $h['salida'] . ')';
                        break;
                    }
                }
            }

            $marcas = $r['registros'] ?? [];
            $e1 = $marcas[0]['hora'] ?? '';
            $s1 = $marcas[1]['hora'] ?? '';
            $e2 = $marcas[2]['hora'] ?? '';
            $s2 = $marcas[3]['hora'] ?? '';

            $tipo = strtolower($r['tipo'] ?? '');
            $id = $emp['clave'] ?? $emp['id_empleado'] ?? '';

            // Determinar color
            $colorStyle = null;
            if (in_array($tipo, ['ausencia', 'inasistencia', 'no_laboro', 'sin_turno'])) {
                $colorStyle = $styleColorSecondary;
            } elseif ($tipo === 'incapacidad') {
                $colorStyle = $styleColorPrimary;
            } elseif ($tipo === 'vacaciones') {
                $colorStyle = $styleColorSuccess;
            } elseif ($tipo === 'descanso') {
                $colorStyle = $styleColorWarning;
            }

            if ($tipo === 'asistencia') {
                // Primera fila
                $sheet->setCellValue("A{$fila}", $id);
                $sheet->setCellValue("B{$fila}", $dia);
                $sheet->setCellValue("C{$fila}", convertirFecha($fecha));
                $sheet->getStyle("C{$fila}")->getAlignment()->setWrapText(false);
                $sheet->setCellValue("D{$fila}", $turnoTxt);
                $sheet->setCellValue("E{$fila}", $e1);
                $sheet->setCellValue("F{$fila}", $s1);
                $sheet->setCellValue("G{$fila}", "");
                $sheet->setCellValue("H{$fila}", "");
                $sheet->setCellValue("I{$fila}", calcularDiferencia($e1, $s1));
                $sheet->setCellValue("J{$fila}", "");
                $sheet->setCellValue("K{$fila}", "");
                $sheet->getStyle("A{$fila}:K{$fila}")->applyFromArray($styleCell);
                if ($colorStyle) {
                    $sheet->getStyle("E{$fila}:F{$fila}")->applyFromArray($colorStyle);
                }
                $fila++;

                // Segunda fila
                $sheet->setCellValue("A{$fila}", $id);
                $sheet->setCellValue("B{$fila}", $dia);
                $sheet->setCellValue("C{$fila}", convertirFecha($fecha));
                $sheet->getStyle("C{$fila}")->getAlignment()->setWrapText(false);
                $sheet->setCellValue("D{$fila}", $turnoTxt);
                $sheet->setCellValue("E{$fila}", $e2);
                $sheet->setCellValue("F{$fila}", $s2);
                $sheet->setCellValue("G{$fila}", "");
                $sheet->setCellValue("H{$fila}", "");
                $sheet->setCellValue("I{$fila}", calcularDiferencia($e2, $s2));
                $sheet->setCellValue("J{$fila}", "");
                $sheet->setCellValue("K{$fila}", "");
                $sheet->getStyle("A{$fila}:K{$fila}")->applyFromArray($styleCell);
                if ($colorStyle) {
                    $sheet->getStyle("E{$fila}:F{$fila}")->applyFromArray($colorStyle);
                }
                $fila++;
            } else {
                // Una sola fila (descanso, vacaciones, etc.)
                $sheet->setCellValue("A{$fila}", $id);
                $sheet->setCellValue("B{$fila}", $dia);
                $sheet->setCellValue("C{$fila}", convertirFecha($fecha));
                $sheet->setCellValue("D{$fila}", $turnoTxt);
                $sheet->setCellValue("E{$fila}", "");
                $sheet->setCellValue("F{$fila}", "");
                $sheet->setCellValue("G{$fila}", "");
                $sheet->setCellValue("H{$fila}", "");
                $sheet->setCellValue("I{$fila}", $r['trabajado_hhmm'] ?? '00:00');
                $sheet->setCellValue("J{$fila}", "");
                $sheet->setCellValue("K{$fila}", "");
                $sheet->getStyle("A{$fila}:K{$fila}")->applyFromArray($styleCell);

                if ($colorStyle) {
                    $sheet->getStyle("E{$fila}:F{$fila}")->applyFromArray($colorStyle);
                    if ($tipo === 'descanso') {
                        $sheet->getStyle("K{$fila}")->applyFromArray($colorStyle);
                    }
                }
                $fila++;
            }
        }

        // Totales - usar los valores calculados del sistema
        $horasTotales = number_format($emp['trabajado_total_decimal'] ?? 0, 2);
        $tiempoTotal = $emp['trabajado_total_hhmm'] ?? '00:00';

        $horasRedondeada = redondearHoras($tiempoTotal);


        $sheet->setCellValue("A{$fila}", "Horas totales");
        $sheet->mergeCells("A{$fila}:D{$fila}");
        $sheet->setCellValue("E{$fila}", $horasRedondeada);
        $sheet->mergeCells("E{$fila}:F{$fila}");
        $sheet->setCellValue("G{$fila}", "Tiempo total");
        $sheet->mergeCells("G{$fila}:H{$fila}");
        $sheet->setCellValue("I{$fila}", $tiempoTotal);
        $sheet->mergeCells("I{$fila}:K{$fila}");
        $sheet->getStyle("A{$fila}:K{$fila}")->applyFromArray($styleHeader);
        $fila++;

        $fila++; // Espacio después de la tabla

        // Agregar "SELLO TRABAJADOR REVISADO"
        $fila++;
        $sheet->setCellValue("A{$fila}", "SELLO TRABAJADOR REVISADO");
        $sheet->mergeCells("A{$fila}:K{$fila}");
        $sheet->getStyle("A{$fila}")->getFont()->setBold(true);
        $sheet->getStyle("A{$fila}")->getFont()->setSize(9);
        $fila++;

        // Tres filas más de espacio antes de la siguiente tabla
        $fila++;
        $fila++;
        $fila++;
    }

    // Ajustar ancho de columnas
    $sheet->getColumnDimension('A')->setWidth(6);
    $sheet->getColumnDimension('B')->setWidth(15); // Más espacio para días largos
    $sheet->getColumnDimension('C')->setWidth(14); // Más espacio para fechas completas
    $sheet->getColumnDimension('D')->setWidth(14);
    $sheet->getColumnDimension('E')->setWidth(8);
    $sheet->getColumnDimension('F')->setWidth(8);
    $sheet->getColumnDimension('G')->setWidth(10);
    $sheet->getColumnDimension('H')->setWidth(10);
    $sheet->getColumnDimension('I')->setWidth(10);
    $sheet->getColumnDimension('J')->setWidth(10);
    $sheet->getColumnDimension('K')->setWidth(10);

    // Configurar página para impresión tamaño A4
    $sheet->getPageSetup()->setPaperSize(PageSetup::PAPERSIZE_A4);
    $sheet->getPageSetup()->setOrientation(PageSetup::ORIENTATION_PORTRAIT);
    $sheet->getPageSetup()->setFitToPage(true);
    $sheet->getPageSetup()->setFitToWidth(1);
    $sheet->getPageSetup()->setFitToHeight(0);

    // Márgenes para impresión (en pulgadas)
    $sheet->getPageMargins()->setTop(0.5);
    $sheet->getPageMargins()->setRight(0.5);
    $sheet->getPageMargins()->setLeft(0.5);
    $sheet->getPageMargins()->setBottom(0.5);

    // Centrar en página
    $sheet->getPageSetup()->setHorizontalCentered(true);

    // Guardar en archivo temporal
    $tempFile = tempnam(sys_get_temp_dir(), 'excel_');
    $writer = new Xlsx($spreadsheet);
    $writer->save($tempFile);

    // Enviar archivo
    header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    header('Content-Disposition: attachment;filename="Reporte_Reloj.xlsx"');
    header('Content-Length: ' . filesize($tempFile));
    header('Cache-Control: max-age=0');

    readfile($tempFile);
    unlink($tempFile);
    exit;
} catch (Exception $e) {
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
    exit;
}
