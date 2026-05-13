<?php
ob_start();
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('memory_limit', '512M');

require_once __DIR__ . '/../../vendor/autoload.php';

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

function safeText($s) {
    $s = (string)$s;
    $s = str_replace(["\r", "\n", "\t"], ' ', $s);
    $s = trim(preg_replace('/\s+/', ' ', $s));
    return $s;
}

function renderTicketAguinaldoPdf(TCPDF $pdf, $emp, $meta) {
    $nombre = safeText(($emp['nombre'] ?? '') . ' ' . ($emp['ap_paterno'] ?? '') . ' ' . ($emp['ap_materno'] ?? ''));
    $clave = safeText($emp['clave_empleado'] ?? '');
    $departamento = safeText($emp['nombre_departamento'] ?? 'General');
    $puesto = safeText($emp['nombre_puesto'] ?? 'Empleado');
    $fechaIngreso = safeText($emp['fecha_ingreso'] ?? '');
    $semana = safeText($meta['anio'] ?? '');

    $montoAguinaldo = toNumber($emp['aguinaldo'] ?? 0);
    $isr = toNumber($emp['isr'] ?? 0);
    $tarjeta = toNumber($emp['tarjeta'] ?? 0);
    $redondeo = toNumber($emp['redondeo'] ?? 0);
    $netoRedondeado = toNumber($emp['neto_pagar_redondeado'] ?? 0);

    // --- Percepciones ---
    $percepciones = [];
    if ($montoAguinaldo > 0) $percepciones[] = ['label' => '1 Aguinaldo', 'monto' => $montoAguinaldo];
    if ($redondeo > 0) $percepciones[] = ['label' => '2 Redondeo', 'monto' => $redondeo];

    // --- Deducciones ---
    $deducciones = [];
    if ($isr > 0) $deducciones[] = ['label' => 'ISR Aguinaldo', 'monto' => $isr];
    if ($tarjeta > 0) $deducciones[] = ['label' => 'Tarjeta', 'monto' => $tarjeta];
    if ($redondeo < 0) $deducciones[] = ['label' => 'Redondeo', 'monto' => abs($redondeo)];

    $totalP = 0; foreach ($percepciones as $p) $totalP += $p['monto'];
    $totalD = 0; foreach ($deducciones as $d) $totalD += $d['monto'];
    $neto = $totalP - $totalD;

    // --- Renderizado TCPDF (Formato Zebra 104mm x 50.8mm) ---
    $dot = function ($d) { return ((float)$d) / 8.0; };
    $pt = function ($dotH) use ($dot) { return max(4.0, ($dot($dotH)) / 0.352777); };
    
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
        $pdf->SetXY($dot($xDot), $dot($yDot + 5)); 
        $pdf->Cell($dot($wDot), $dot($hDot - 8), substr((string)$value, 0, 50), 0, 0, $align, false, '', 0, false, 'T', 'T');
    };

    $pdf->SetLineWidth($dot(2));
    $pdf->Rect($dot(10), $dot(12), $dot(812), $dot(386));

    $nombreCompleto = $clave . ' ' . $nombre;
    $nombreFontSize = strlen($nombreCompleto) > 35 ? 8 : (strlen($nombreCompleto) >= 31 ? 13 : 15);
    $textB(12, 22, $pt($nombreFontSize), $nombreCompleto);
    $text(710, 20, $pt(18), 'AÑO ' . $semana);

    $pdf->SetLineWidth($dot(1));
    $pdf->Line($dot(10), $dot(42), $dot(822), $dot(42));
    $text(290, 47, $pt(18), 'TIPO: AGUINALDO');
    $pdf->Line($dot(10), $dot(70), $dot(822), $dot(70));

    $textB(150, 78, $pt(20), 'PERCEPCIONES');
    $textB(520, 78, $pt(20), 'DEDUCCIONES');
    $pdf->Line($dot(10), $dot(107), $dot(822), $dot(107));

    $lh = 26; $tableTop = 107;
    $maxC = max(count($percepciones), count($deducciones));
    $row = 0; $currentY = $tableTop;

    for ($i = 0; $i < $maxC; $i++) {
        $y = $tableTop + ($row * $lh);
        if (isset($percepciones[$i])) {
            $cellText(9, $y, 170, $lh, $pt(15), $percepciones[$i]['label'], 'L');
            $cellText(240, $y, 229, $lh, $pt(16), '$ ' . money($percepciones[$i]['monto']), 'C');
        }
        if (isset($deducciones[$i])) {
            $cellText(410, $y, 218, $lh, $pt(15), $deducciones[$i]['label'], 'L');
            $cellText(660, $y, 182, $lh, $pt(16), '-$ ' . money($deducciones[$i]['monto']), 'C');
        }
        $pdf->Line($dot(10), $dot($y + $lh), $dot(822), $dot($y + $lh));
        $pdf->SetLineWidth($dot(2));
        $pdf->Line($dot(415), $dot($tableTop), $dot(415), $dot($y + $lh));
        $pdf->SetLineWidth($dot(1));
        $currentY = $y + $lh; $row++;
    }

    $yT = $currentY + 18;
    if ($yT > 340) { $pdf->AddPage(); $yT = 50; }
    $pdf->SetLineWidth($dot(2));
    $pdf->Line($dot(10), $dot($yT), $dot(822), $dot($yT));
    $text(18, $yT + 13, $pt(16), 'Total Percepciones');
    $text(310, $yT + 13, $pt(16), '$' . money($totalP));
    $text(430, $yT + 13, $pt(16), 'Total Deducciones');
    $text(710, $yT + 13, $pt(16), '-$' . money($totalD));
    $pdf->Line($dot(415), $dot($yT), $dot(415), $dot($yT + 37));
    $pdf->Line($dot(10), $dot($yT + 37), $dot(822), $dot($yT + 37));
    $textB(18, $yT + 43, $pt(22), 'Neto a pagar');
    $textB(200, $yT + 43, $pt(22), '$');
    $textB(240, $yT + 43, $pt(22), money($neto));
}

$raw = file_get_contents('php://input'); $data = json_decode($raw, true);
if (!$data) exit('Datos inválidos');

$empleados = $data['empleados'] ?? [];
$meta = $data['meta'] ?? ['anio' => ''];

$pdf = new \TCPDF('L', 'mm', [50.8, 104], true, 'UTF-8', false);
$pdf->setPrintHeader(false); $pdf->setPrintFooter(false);
$pdf->SetMargins(0, 0, 0); $pdf->SetAutoPageBreak(false, 0);

foreach ($empleados as $emp) {
    $pdf->AddPage();
    renderTicketAguinaldoPdf($pdf, $emp, $meta);
}

if (ob_get_length()) ob_clean();
header('Content-Type: application/pdf');
header('Content-Disposition: attachment; filename="tickets_aguinaldo.pdf"');
echo $pdf->Output('tickets_aguinaldo.pdf', 'S');
