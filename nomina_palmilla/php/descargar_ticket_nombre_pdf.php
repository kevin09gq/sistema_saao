<?php

require_once __DIR__ . '/../../vendor/autoload.php';
require_once __DIR__ . '/../../vendor/tecnickcom/tcpdf/tcpdf.php';

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
    header('Content-Type: text/plain; charset=UTF-8');
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
    header('Content-Type: text/plain; charset=UTF-8');
    echo 'No hay empleados para generar tickets.';
    exit;
}

usort($empleados, function ($a, $b) {
    return strcasecmp((string)($a['nombre'] ?? ''), (string)($b['nombre'] ?? ''));
});

// Ticket SOLO NOMBRE: 3.8cm x 1.2cm => 38mm x 12mm
// Con orientación 'L', TCPDF invierte (w,h), por eso usamos [alto, ancho]
$ticketW = 38.0;
$ticketH = 12.0;
$pad = 0.6;

$pdf = new \TCPDF('L', 'mm', [$ticketH, $ticketW], true, 'UTF-8', false);
$pdf->SetCreator('Sistema SAAO');
$pdf->SetAuthor('Sistema SAAO');
$pdf->SetTitle('Tickets Nombre');
$pdf->setPrintHeader(false);
$pdf->setPrintFooter(false);
$pdf->SetAutoPageBreak(false, 0);
$pdf->SetMargins(0, 0, 0);

foreach ($empleados as $emp) {
    $pdf->AddPage('L', [$ticketH, $ticketW]);

    $nombre = safeText($emp['nombre'] ?? '');
    $texto = $nombre;

    // Borde del ticket
    $pdf->SetLineWidth(0.2);
    $pdf->Rect($pad, $pad, $ticketW - (2 * $pad), $ticketH - (2 * $pad));

    // Ajustar tamaño para que ocupe el máximo espacio posible (permitiendo saltos de línea)
    $maxW = $ticketW - (2 * $pad);
    $maxH = $ticketH - (2 * $pad);
    $font = 16; // Tamaño inicial grande
    $pdf->SetFont('helvetica', 'B', $font);
    
    // Reducir el tamaño de la fuente hasta que el texto quepa en el recuadro (alto y ancho con wrap)
    while ($pdf->getStringHeight($maxW, $texto) > $maxH && $font > 6) {
        $font -= 0.5;
        $pdf->SetFont('helvetica', 'B', $font);
    }

    // Centrar vertical y horizontal
    $pdf->SetXY($pad, $pad);
    $pdf->MultiCell(
        $ticketW - (2 * $pad),
        $ticketH - (2 * $pad),
        $texto,
        0,
        'C',
        false,
        1,
        null,
        null,
        true,
        0,
        false,
        true,
        $ticketH - (2 * $pad),
        'M'
    );
}

if (function_exists('ob_get_length') && ob_get_length()) {
    @ob_end_clean();
}

$filename = 'tickets_palmilla_nombre' . ($semana !== '' ? ('_sem_' . preg_replace('/[^0-9A-Za-z_-]/', '', $semana)) : '') . '.pdf';

header('Content-Type: application/pdf');
header('Content-Disposition: attachment; filename="' . $filename . '"');
header('Cache-Control: private, max-age=0, must-revalidate');
header('Pragma: public');

echo $pdf->Output($filename, 'S');
