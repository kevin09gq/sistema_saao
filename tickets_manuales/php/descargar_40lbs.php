<?php
require_once __DIR__ . '/../../conexion/conexion.php';
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

function redondear($numero) {
    return round((float)$numero, 0, PHP_ROUND_HALF_UP);
}

function safeText($s) {
    $s = (string)$s;
    $s = str_replace(["\r", "\n", "\t"], ' ', $s);
    $s = trim(preg_replace('/\s+/', ' ', $s));
    return $s;
}

function renderTicketPdf(TCPDF $pdf, $emp, $extra, $meta) {
    $nombre = safeText($emp['nombre'] ?? '');
    $clave = safeText($emp['clave'] ?? '');
    $departamento = safeText($emp['departamento'] ?? '');
    $departamento = preg_replace('/^\d+/', '', $departamento);
    $puesto = safeText($emp['puesto'] ?? '');
    $fechaIngreso = safeText($emp['fecha_ingreso'] ?? '');
    $fechaIngreso = str_replace('-', '/', $fechaIngreso);

    $sueldoSemanal = toNumber($emp['salario_semanal'] ?? 0);
    $salarioDiario = toNumber($emp['salario_diario'] ?? 0);
    $semana = safeText($meta['numero_semana'] ?? '');

    $percepciones = [];
    $conceptoNum = 1;
    
    if (isset($emp['percepciones_manuales'])) {
        foreach ($emp['percepciones_manuales'] as $p) {
            if ($p['monto'] > 0) {
                $percepciones[] = ['label' => $conceptoNum++ . ' ' . $p['nombre'], 'monto' => $p['monto']];
            }
        }
    }

    $deducciones = [];
    if (isset($emp['deducciones_manuales'])) {
        foreach ($emp['deducciones_manuales'] as $d) {
            if ($d['monto'] > 0) {
                $deducciones[] = ['label' => $d['nombre'], 'monto' => $d['monto']];
            }
        }
    }

    $totalPerp = 0.0;
    foreach ($percepciones as $p) $totalPerp += $p['monto'];
    $totalDed = 0.0;
    foreach ($deducciones as $d) $totalDed += $d['monto'];
    
    $netoSinRedondeo = $totalPerp - $totalDed;
    $netoConRedondeo = redondear($netoSinRedondeo);
    $difRedondeo = $netoConRedondeo - $netoSinRedondeo;
    
    if (abs($difRedondeo) > 0.001) {
        if ($difRedondeo > 0) {
            $percepciones[] = ['label' => $conceptoNum++ . ' Redondeo', 'monto' => $difRedondeo];
            $totalPerp += $difRedondeo;
        } else {
            $deducciones[] = ['label' => 'Redondeo', 'monto' => abs($difRedondeo)];
            $totalDed += abs($difRedondeo);
        }
    }

    $neto = $netoConRedondeo;

    $pdf->SetTextColor(0, 0, 0);
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
        $pdf->SetXY($dot($xDot), $dot($yDot));
        $pdf->Cell($dot($wDot), $dot($hDot), substr((string)$value, 0, 50), 0, 0, $align, false, '', 0, false, 'C', 'M');
    };

    $maxConceptos = max(count($percepciones), count($deducciones));
    $maxRowsPrimeraHoja = 11;
    $maxRowsContinuacion = 13;
    $lh = 26;
    $tableTopPrimeraHoja = 105;
    $yInicioCeldasContinuacion = 50;

    $row = 0;
    $currentY = 0;
    $tableTop = $tableTopPrimeraHoja;

    for ($i = 0; $i < $maxConceptos; $i++) {
        // Manejar salto de página
        if ($i == $maxRowsPrimeraHoja) {
            $pdf->AddPage();
            $pdf->SetLineWidth($dot(2));
            $pdf->Rect($dot(10), $dot(10), $dot(812), $dot(386));
            $textB(18, 22, $pt(20), $clave . ' ' . $nombre);
            $text(700, 22, $pt(18), 'SEM ' . $semana);
            $pdf->SetLineWidth($dot(1));
            $pdf->Line($dot(10), $dot(50), $dot(822), $dot(50));
            $tableTop = $yInicioCeldasContinuacion;
            $row = 0;
        } elseif ($i > $maxRowsPrimeraHoja && ($i - $maxRowsPrimeraHoja) % $maxRowsContinuacion == 0) {
            $pdf->AddPage();
            $pdf->SetLineWidth($dot(2));
            $pdf->Rect($dot(10), $dot(10), $dot(812), $dot(386));
            $textB(18, 22, $pt(20), $clave . ' ' . $nombre);
            $text(700, 22, $pt(18), 'SEM ' . $semana);
            $pdf->SetLineWidth($dot(1));
            $pdf->Line($dot(10), $dot(50), $dot(822), $dot(50));
            $tableTop = $yInicioCeldasContinuacion;
            $row = 0;
        }

        // Si es la primera página y es el primer concepto, dibujar el encabezado
        if ($i == 0) {
            $pdf->SetLineWidth($dot(2));
            $pdf->Rect($dot(10), $dot(12), $dot(812), $dot(386));
            $nombreCompleto = $clave . ' ' . $nombre;
            $nombreFontSize = strlen($nombreCompleto) > 35 ? 8 : (strlen($nombreCompleto) >= 31 ? 13 : 15);
            $textB(12, 22, $pt($nombreFontSize), $nombreCompleto);
            $text(310, 20, $pt(18), $departamento);
            $text(515, 20, $pt(18), 'F.Ingr: ' . $fechaIngreso);
            $text(710, 20, $pt(18), 'SEM ' . $semana);
            $pdf->SetLineWidth($dot(1));
            $pdf->Line($dot(10), $dot(42), $dot(822), $dot(42));
            $pdf->Line($dot(280), $dot(42), $dot(280), $dot(70));
            $pdf->Line($dot(520), $dot(42), $dot(520), $dot(70));
            if (!empty($puesto)) {
                $puestoFontSize = strlen($puesto) > 33 ? 3.5 : 6;
                $text(18, 51, $puestoFontSize, $puesto);
            }
            $text(290, 47, $pt(18), 'Sal. diario: $ ' . money($salarioDiario));
            $text(530, 47, $pt(18), 'Sal. Semanal: $ ' . money($sueldoSemanal));
            $pdf->Line($dot(10), $dot(70), $dot(822), $dot(70));
            $textB(100, 78, $pt(20), 'PERCEPCIONES');
            $textB(520, 78, $pt(20), 'DEDUCCIONES');
            $pdf->Line($dot(10), $dot(107), $dot(822), $dot(107));
        }

        // Dibujar conceptos
        $yCellTop = ($tableTop + ($row * $lh)) + 16;
        $f16 = $pt(16);

        if (isset($percepciones[$i])) {
            $cellText(9, $yCellTop, 170, $lh, $f16, $percepciones[$i]['label'], 'L');
            $cellText(240, $yCellTop, 229, $lh, $f16, '$ ' . money($percepciones[$i]['monto']), 'C');
        }
        
        if (isset($deducciones[$i])) {
            $cellText(410, $yCellTop, 218, $lh, $f16, $deducciones[$i]['label'], 'L');
            $cellText(660, $yCellTop, 182, $lh, $f16, '-$ ' . money($deducciones[$i]['monto']), 'C');
        }

        $yLine = ($tableTop + (($row + 1) * $lh));
        $pdf->SetLineWidth($dot(1));
        $pdf->Line($dot(10), $dot($yLine), $dot(822), $dot($yLine));
        $pdf->SetLineWidth($dot(2));
        $pdf->Line($dot(415), $dot($tableTop), $dot(415), $dot($yLine));

        $currentY = $yLine;
        $row++;
    }

    // Dibujar totales en la última página
    $enContinuacion = ($maxConceptos > $maxRowsPrimeraHoja);
    $conceptosEnPaginaActual = $row;
    
    if (!$enContinuacion && $maxConceptos <= 9) {
        $yTotales = $currentY + 18;
    } else {
        $yTotales = $currentY + 2;
    }

    // Si no hay espacio para los totales, agregar página nueva
    if ($yTotales > 340) {
        $pdf->AddPage();
        $pdf->SetLineWidth($dot(2));
        $pdf->Rect($dot(10), $dot(10), $dot(812), $dot(386));
        $textB(18, 22, $pt(20), $clave . ' ' . $nombre);
        $yTotales = 50;
    }

    $pdf->SetLineWidth($dot(2));
    $pdf->Line($dot(10), $dot($yTotales), $dot(822), $dot($yTotales));
    $pdf->SetLineWidth($dot(1));
    
    $fontTotales = $pt(16);
    $fontNeto = $pt(22);
    
    $text(18, $yTotales + 13, $fontTotales, 'Total Percepciones');
    $text(310, $yTotales + 13, $fontTotales, '$' . money($totalPerp));
    $text(430, $yTotales + 13, $fontTotales, 'Total Deducciones');
    $text(710, $yTotales + 13, $fontTotales, '-$' . money($totalDed));
    
    $pdf->Line($dot(415), $dot($yTotales), $dot(415), $dot($yTotales + 37));
    $pdf->Line($dot(10), $dot($yTotales + 37), $dot(822), $dot($yTotales + 37));
    
    $textB(18, $yTotales + 43, $fontNeto, 'Neto a pagar');
    $textB(200, $yTotales + 43, $fontNeto, '$');
    $textB(240, $yTotales + 43, $fontNeto, money($neto));
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['datos'])) {
    $datosForm = json_decode($_POST['datos'], true);
    $emp = [
        'clave' => $datosForm['clave'],
        'nombre' => $datosForm['nombre'],
        'departamento' => $datosForm['departamento'],
        'puesto' => $datosForm['puesto'],
        'fecha_ingreso' => $datosForm['fechaIngreso'],
        'salario_diario' => $datosForm['salarioDiario'],
        'salario_semanal' => $datosForm['salarioSemanal'],
        'percepciones_manuales' => array_merge(array_values($datosForm['percepciones']), $datosForm['adicionales']['percepciones']),
        'deducciones_manuales' => array_merge(array_values($datosForm['deducciones']), $datosForm['adicionales']['deducciones'])
    ];
    $meta = ['numero_semana' => $datosForm['semana']];

    $pdf = new TCPDF('L', 'mm', [50.8, 104], true, 'UTF-8', false);
    $pdf->setPrintHeader(false); $pdf->setPrintFooter(false);
    $pdf->SetAutoPageBreak(false, 0); $pdf->SetMargins(0, 0, 0);
    $pdf->AddPage();
    renderTicketPdf($pdf, $emp, [], $meta);
    $pdf->Output('Ticket_40lbs_' . $emp['clave'] . '.pdf', 'D');
}
