<?php

require_once __DIR__ . '/../../vendor/autoload.php';

if (!class_exists('TCPDF')) {
    http_response_code(500);
    header('Content-Type: text/plain; charset=UTF-8');
    echo "Error: La librería TCPDF no se pudo cargar.";
    exit;
}

function safeText($s) {
    $s = (string)$s;
    $s = str_replace(["\r", "\n", "\t"], ' ', $s);
    $s = trim(preg_replace('/\s+/', ' ', $s));
    return $s;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!is_array($data) || !isset($data['utilidad']) || !is_array($data['utilidad'])) {
    http_response_code(400);
    header('Content-Type: text/plain; charset=UTF-8');
    echo 'Solicitud inválida.';
    exit;
}

$utilidad = $data['utilidad'];
$anio = safeText($data['meta']['anio'] ?? '');

$empleados = $utilidad['empleados'] ?? [];

if (empty($empleados)) {
    http_response_code(400);
    header('Content-Type: text/plain; charset=UTF-8');
    echo 'No hay empleados para generar tickets.';
    exit;
}

// Ordenar por nombre
usort($empleados, function ($a, $b) {
    $nombreA = ($a['nombre'] ?? '') . ' ' . ($a['ap_paterno'] ?? '') . ' ' . ($a['ap_materno'] ?? '');
    $nombreB = ($b['nombre'] ?? '') . ' ' . ($b['ap_paterno'] ?? '') . ' ' . ($b['ap_materno'] ?? '');
    return strcasecmp(safeText($nombreA), safeText($nombreB));
});

// Ticket SOLO NOMBRE: 3.8cm x 1.2cm => 38mm x 12mm
$ticketW = 38.0;
$ticketH = 12.0;
$pad = 0.6;

$pdf = new \TCPDF('L', 'mm', [$ticketH, $ticketW], true, 'UTF-8', false);
$pdf->SetCreator('Sistema SAAO');
$pdf->SetAuthor('Sistema SAAO');
$pdf->SetTitle('Tickets Nombre PTU');
$pdf->setPrintHeader(false);
$pdf->setPrintFooter(false);
$pdf->SetAutoPageBreak(false, 0);
$pdf->SetMargins(0, 0, 0);

foreach ($empleados as $emp) {
    $pdf->AddPage('L', [$ticketH, $ticketW]);

    $nombreCompleto = ($emp['nombre'] ?? '') . ' ' . ($emp['ap_paterno'] ?? '') . ' ' . ($emp['ap_materno'] ?? '');
    $texto = safeText($nombreCompleto);

    // Borde del ticket
    $pdf->SetLineWidth(0.2);
    $pdf->Rect($pad, $pad, $ticketW - (2 * $pad), $ticketH - (2 * $pad));

    // Ajustar tamaño de fuente dinámicamente
    $maxW = $ticketW - (2 * $pad);
    $maxH = $ticketH - (2 * $pad);
    $font = 16;
    $pdf->SetFont('helvetica', 'B', $font);
    
    while ($pdf->getStringHeight($maxW, $texto) > $maxH && $font > 6) {
        $font -= 0.5;
        $pdf->SetFont('helvetica', 'B', $font);
    }

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

if (ob_get_length()) ob_end_clean();

$filename = 'tickets_nombre_ptu_' . $anio . '.pdf';

header('Content-Type: application/pdf');
header('Content-Disposition: attachment; filename="' . $filename . '"');
header('Cache-Control: private, max-age=0, must-revalidate');
header('Pragma: public');

echo $pdf->Output($filename, 'S');