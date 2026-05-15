<?php
ob_start();
require_once __DIR__ . '/../../vendor/autoload.php';

function safeText($s) {
    $s = (string)$s;
    $s = str_replace(["\r", "\n", "\t"], ' ', $s);
    $s = trim(preg_replace('/\s+/', ' ', $s));
    return $s;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!is_array($data) || !isset($data['nomina']) || !is_array($data['nomina'])) {
    http_response_code(400);
    echo 'Solicitud inválida.';
    exit;
}

$nomina = $data['nomina'];
$semana = safeText($nomina['numero_semana'] ?? '');

$empleados = [];
foreach (($nomina['departamentos'] ?? []) as $depto) {
    foreach (($depto['empleados'] ?? []) as $emp) {
        if (!is_array($emp)) continue;
        $empleados[] = $emp;
    }
}

if (empty($empleados)) {
    http_response_code(400);
    echo 'No hay empleados para generar tickets.';
    exit;
}

usort($empleados, function ($a, $b) {
    return strcasecmp((string)($a['nombre'] ?? ''), (string)($b['nombre'] ?? ''));
});

$ticketW = 38.0; $ticketH = 12.0; $pad = 0.6;
$pdf = new \TCPDF('L', 'mm', [$ticketH, $ticketW], true, 'UTF-8', false);
$pdf->setPrintHeader(false); $pdf->setPrintFooter(false);
$pdf->SetAutoPageBreak(false, 0); $pdf->SetMargins(0, 0, 0);

foreach ($empleados as $emp) {
    $pdf->AddPage('L', [$ticketH, $ticketW]);
    $nombre = safeText($emp['nombre'] ?? '');
    $pdf->SetLineWidth(0.2);
    $pdf->Rect($pad, $pad, $ticketW - (2 * $pad), $ticketH - (2 * $pad));
    // Ajustar tamaño para que ocupe el máximo espacio posible (permitiendo saltos de línea)
    $maxW = $ticketW - (2 * $pad);
    $maxH = $ticketH - (2 * $pad);
    $font = 16; // Tamaño inicial grande
    $pdf->SetFont('helvetica', 'B', $font);
    
    // Reducir el tamaño de la fuente hasta que el texto quepa en el recuadro (alto y ancho con wrap)
    while ($pdf->getStringHeight($maxW, $nombre) > $maxH && $font > 6) {
        $font -= 0.5;
        $pdf->SetFont('helvetica', 'B', $font);
    }
    $pdf->SetXY($pad, $pad);
    $pdf->MultiCell($ticketW - (2 * $pad), $ticketH - (2 * $pad), $nombre, 0, 'C', false, 1, null, null, true, 0, false, true, $ticketH - (2 * $pad), 'M');
}

if (ob_get_length()) ob_clean();
$filename = 'tickets_pilar_nombre' . ($semana !== '' ? ('_sem_' . preg_replace('/[^0-9A-Za-z_-]/', '', $semana)) : '') . '.pdf';
header('Content-Type: application/pdf');
header('Content-Disposition: attachment; filename="' . $filename . '"');
echo $pdf->Output($filename, 'S');
