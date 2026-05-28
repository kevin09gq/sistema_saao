<?php

ob_start();
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('memory_limit', '512M');

require_once __DIR__ . '/../../conexion/conexion.php';
require_once __DIR__ . '/../../vendor/autoload.php';

if (!class_exists('TCPDF')) {
    http_response_code(500);
    echo "Error: La librería TCPDF no se pudo cargar.";
    exit;
}

function toNumber($v) {
    if ($v === null) return 0.0;
    if (is_string($v)) {
        $v = str_replace([',', '$', ' '], '', $v);
    }
    return (float)$v;
}

function money($n) {
    return number_format((float)$n, 2, '.', ',');
}

function redondear($numero) {
    return round((float)$numero, 0, PHP_ROUND_HALF_UP);
}

function safeText($s) {
    $s = (string)$s;
    $s = str_replace(["\r", "\n", "\t"], ' ', $s);
    $s = trim(preg_replace('/\s+/', ' ', $s));
    return $s;
}

function renderTicketPTU($pdf, $emp, $anio) {
    $nombre       = safeText(($emp['nombre'] ?? '') . ' ' . ($emp['ap_paterno'] ?? '') . ' ' . ($emp['ap_materno'] ?? ''));
    $clave        = safeText($emp['clave_empleado'] ?? '');
    $departamento = safeText($emp['nombre_departamento'] ?? '');
    $puesto       = safeText($emp['puesto'] ?? '');
    
    // PTU Data
    $ptu_total = toNumber($emp['ptu'] ?? 0);
    $tarjeta   = toNumber($emp['tarjeta'] ?? 0);
    $redondeo  = toNumber($emp['redondeo'] ?? 0);
    $neto      = toNumber($emp['neto_pagar_redondeado'] ?? ($ptu_total - $tarjeta + $redondeo));

    // Simulation of weekly/daily salary if available (optional for PTU)
    $salarioDiario  = toNumber($emp['salario_diario'] ?? 0);
    $diasPago       = toNumber($emp['dias_pago'] ?? 0);

    // Build Perceptions and Deductions arrays to match the loop-based rendering
    $percepciones = [];
    $percepciones[] = ['label' => '1 PTU', 'monto' => $ptu_total];
    if ($redondeo > 0) {
        $percepciones[] = ['label' => 'Redondeo', 'monto' => $redondeo];
    }

    $deducciones = [];
    if ($tarjeta > 0) {
        $deducciones[] = ['label' => 'Tarjeta', 'monto' => $tarjeta];
    }
    if ($redondeo < 0) {
        $deducciones[] = ['label' => 'Redondeo', 'monto' => abs($redondeo)];
    }

    // Drawing Helpers (from original payroll structure)
    $dot = function ($d) { return ((float)$d) / 8.0; };
    $pt = function ($dotH) use ($dot) { return max(4.0, $dot($dotH) / 0.352777); };

    $text = function ($xDot, $yDot, $fontPt, $value) use ($pdf, $dot) {
        $pdf->SetFont('helvetica', '', $fontPt);
        $pdf->Text($dot($xDot), $dot($yDot), (string)$value);
    };

    $textB = function ($xDot, $yDot, $fontPt, $value) use ($pdf, $dot) {
        $pdf->SetFont('helvetica', 'B', $fontPt);
        $pdf->Text($dot($xDot), $dot($yDot), (string)$value);
    };

    $cellText = function ($xDot, $yDot, $wDot, $hDot, $fontPt, $value, $align = 'L') use ($pdf, $dot) {
        $pdf->SetFont('helvetica', '', $fontPt);
        $pdf->SetXY($dot($xDot), $dot($yDot));
        $value = substr((string)$value, 0, 50);
        $pdf->Cell($dot($wDot), $dot($hDot), $value, 0, 0, $align, false, '', 0, false, 'C', 'M');
    };

    // --- Header Section ---
    $pdf->SetLineWidth($dot(2));
    $pdf->Rect($dot(10), $dot(12), $dot(812), $dot(386));

    $nombreCompleto = $clave . ' ' . $nombre;
    $nombreFontSize = strlen($nombreCompleto) > 35 ? 8 : (strlen($nombreCompleto) >= 31 ? 13 : 15);
    $textB(12, 22, $pt($nombreFontSize), $nombreCompleto);
    $text(310, 22, $pt(15), $departamento);
    $text(710, 20, $pt(18), 'AÑO ' . $anio);

    $pdf->SetLineWidth($dot(1));
    $pdf->Line($dot(10), $dot(42), $dot(822), $dot(42));
    $pdf->Line($dot(280), $dot(42), $dot(280), $dot(70));
    $pdf->Line($dot(520), $dot(42), $dot(520), $dot(70));

    // Salary info section
    $lenPuesto = strlen($puesto);
    $puestoFontSize = ($lenPuesto > 33) ? 3.5 : (($lenPuesto > 27) ? 4.1 : (($lenPuesto > 23) ? 4.5 : (($lenPuesto > 19) ? 5 : (($lenPuesto > 15) ? 5.8 : 6))));
    $text(18, 51, $puestoFontSize, $puesto);
    $text(290, 47, $pt(18), 'Sal. diario: $ ' . money($salarioDiario));
    $text(530, 47, $pt(18), 'Días: ' . $diasPago);

    $pdf->Line($dot(10), $dot(70), $dot(822), $dot(70));

    // Section Titles
    $f20 = $pt(20);
    $textB(150, 78, $f20, 'PERCEPCIONES');
    $textB(520, 78, $f20, 'DEDUCCIONES');

    $pdf->Line($dot(10), $dot(107), $dot(822), $dot(107));

    // --- Concepts Table ---
    $lh = 26;
    $tableTop = 107;
    $maxConceptos = max(count($percepciones), count($deducciones));
    $row = 0;

    $fontSizeConceptos = $pt(16);
    $fontSizeTotales   = $pt(18);
    $fontSizeNeto      = $pt(22);

    // Vertical lines for the table
    $alturaContenido = max(1, $maxConceptos) * $lh;
    $pdf->SetLineWidth($dot(1));
    $pdf->Line($dot(305), $dot($tableTop), $dot(305), $dot($tableTop + $alturaContenido));
    $pdf->Line($dot(700), $dot($tableTop), $dot(700), $dot($tableTop + $alturaContenido));
    $pdf->SetLineWidth($dot(2));
    $pdf->Line($dot(415), $dot(106), $dot(415), $dot($tableTop + $alturaContenido));

    for ($i = 0; $i < $maxConceptos; $i++) {
        $yCellTop = ($tableTop + ($row * $lh)) + 16;
        if (isset($percepciones[$i])) {
            $cellText(9, $yCellTop, 170, $lh, $fontSizeConceptos, $percepciones[$i]['label'], 'L');
            $cellText(240, $yCellTop, 229, $lh, $fontSizeConceptos, '$ ' . money($percepciones[$i]['monto']), 'C');
        }
        $yLine = ($tableTop + (($row + 1) * $lh));
        $pdf->SetLineWidth($dot(1));
        $pdf->Line($dot(10), $dot($yLine), $dot(415), $dot($yLine));
        if (isset($deducciones[$i])) {
            $cellText(410, $yCellTop, 218, $lh, $fontSizeConceptos, $deducciones[$i]['label'], 'L');
            $cellText(660, $yCellTop, 182, $lh, $fontSizeConceptos, '-$ ' . money($deducciones[$i]['monto']), 'C');
        }
        $pdf->Line($dot(415), $dot($yLine), $dot(822), $dot($yLine));
        $row++;
    }

    // --- Totals Section ---
    $yTotales = $tableTop + ($row * $lh) + 18;
    if ($yTotales > 340) {
        $pdf->AddPage('L', [50.8, 104]);
        $yTotales = 50;
    }

    $pdf->SetLineWidth($dot(2));
    $pdf->Line($dot(10), $dot($yTotales), $dot(820), $dot($yTotales));
    $pdf->SetLineWidth($dot(1));

    $totalPercepciones = $ptu_total + ($redondeo > 0 ? $redondeo : 0);
    $totalDeducciones  = $tarjeta + ($redondeo < 0 ? abs($redondeo) : 0);

    $text($dot(18*8),  $yTotales + 13, $fontSizeTotales, 'Total Percepciones');
    $text($dot(310*8), $yTotales + 13, $fontSizeTotales, '$' . money($totalPercepciones));
    $text($dot(430*8), $yTotales + 13, $fontSizeTotales, 'Total Deducciones');
    $text($dot(710*8), $yTotales + 13, $fontSizeTotales, '-$' . money($totalDeducciones));

    $pdf->Line($dot(415), $dot($yTotales), $dot(415), $dot($yTotales + 37));
    $pdf->Line($dot(10), $dot($yTotales + 37), $dot(820), $dot($yTotales + 37));

    $textB($dot(18*8),  $yTotales + 43, $fontSizeNeto, 'Neto a pagar');
    $textB($dot(200*8), $yTotales + 43, $fontSizeNeto, '$');
    $textB($dot(240*8), $yTotales + 43, $fontSizeNeto, money($neto));
}

// --- Main Execution ---
$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!$data || !isset($data['utilidad'])) {
    http_response_code(400);
    echo 'Solicitud inválida: No se recibieron datos JSON.';
    exit;
}

$utilidad = $data['utilidad'];
$meta = $data['meta'] ?? [];
$anio = $meta['anio'] ?? date('Y');

if (empty($utilidad['empleados'])) {
    http_response_code(400);
    echo 'No hay empleados para generar tickets.';
    exit;
}

// Create PDF with landscape 4x2 inches format
$pdf = new \TCPDF('L', 'mm', [50.8, 104], true, 'UTF-8', false);
$pdf->SetCreator('SISTEMA SAAO');
$pdf->SetAuthor('SISTEMA SAAO');
$pdf->SetTitle('Tickets PTU');
$pdf->setPrintHeader(false);
$pdf->setPrintFooter(false);
$pdf->SetAutoPageBreak(false, 0);
$pdf->SetMargins(0, 0, 0);

foreach ($utilidad['empleados'] as $emp) {
    $pdf->AddPage('L', [50.8, 104]);
    renderTicketPTU($pdf, $emp, $anio);
}

if (ob_get_length()) ob_end_clean();

$filename = 'tickets_ptu_' . $anio . '.pdf';
header('Content-Type: application/pdf');
header('Content-Disposition: attachment; filename="' . $filename . '"');
header('Cache-Control: private, max-age=0, must-revalidate');
header('Pragma: public');

echo $pdf->Output($filename, 'S');
exit;
