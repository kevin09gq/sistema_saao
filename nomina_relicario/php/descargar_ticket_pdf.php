<?php
ob_start();
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/error_log.txt');
ini_set('memory_limit', '512M');

require_once __DIR__ . '/../../conexion/conexion.php';
require_once __DIR__ . '/../../vendor/autoload.php';

if (!isset($conexion)) {
    http_response_code(500);
    echo "Error de conexión: No se encontró la variable \$conexion.";
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

function safeText($s) {
    $s = (string)$s;
    $s = str_replace(["\r", "\n", "\t"], ' ', $s);
    $s = trim(preg_replace('/\s+/', ' ', $s));
    return $s;
}

function renderTicketCortePdf($pdf, $empleado, $meta) {
    $nombre = safeText($empleado['nombre'] ?? '');
    $semana = safeText($meta['numero_semana'] ?? '');
    $totalRejas = toNumber($empleado['totalRejas'] ?? 0);
    $precioReja = toNumber($empleado['precio'] ?? 0);
    $totalEfectivo = toNumber($empleado['totalEfectivo'] ?? 0);

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

    $pdf->SetLineWidth($dot(2));
    $pdf->Rect($dot(10), $dot(12), $dot(812), $dot(386));
    
    $text(290, 22, $pt(17), $nombre);
    $text(710, 20, $pt(18), 'SEM ' . $semana);
    
    $pdf->SetLineWidth($dot(1));
    $pdf->Line($dot(10), $dot(42), $dot(822), $dot(42));
    $text(280, 47, $pt(20), "Tipo de trabajo: Corte De Rejas");
    $pdf->Line($dot(10), $dot(75), $dot(822), $dot(75));

    $cellText = function ($xDot, $yDot, $wDot, $hDot, $fontPt, $value, $align = 'L') use ($pdf, $dot) {
        $pdf->SetFont('helvetica', '', $fontPt);
        $pdf->SetXY($dot($xDot), $dot($yDot));
        $pdf->Cell($dot($wDot), $dot($hDot), $value, 1, 0, $align, false, '', 0, false, 'C', 'M');
    };
    
    $fNormal = $pt(16); $fGrande = $pt(22);
    $xInicio = 10; $yInicio = 100; $anchoEtiqueta = 400; $anchoValor = 412; $altoCelda = 50; $espacioCeldas = 50;

    $cellText($xInicio, $yInicio, $anchoEtiqueta, $altoCelda, $fNormal, 'Total de rejas:', 'L');
    $cellText($xInicio + $anchoEtiqueta, $yInicio, $anchoValor, $altoCelda, $fGrande, $totalRejas, 'C');
    $cellText($xInicio, $yInicio + $espacioCeldas, $anchoEtiqueta, $altoCelda, $fNormal, 'Precio por reja:', 'L');
    $cellText($xInicio + $anchoEtiqueta, $yInicio + $espacioCeldas, $anchoValor, $altoCelda, $fGrande, '$' . money($precioReja), 'C');
    $cellText($xInicio, $yInicio + ($espacioCeldas * 2), $anchoEtiqueta, $altoCelda, $fNormal, 'Total efectivo:', 'L');
    $cellText($xInicio + $anchoEtiqueta, $yInicio + ($espacioCeldas * 2), $anchoValor, $altoCelda, $fGrande, '$' . money($totalEfectivo), 'C');

    $yLineaFinal = $yInicio + ($espacioCeldas * 3) + 20;
    $pdf->SetLineWidth($dot(2));
    $pdf->Line($dot(10), $dot($yLineaFinal), $dot(822), $dot($yLineaFinal));
    $textB(18, $yLineaFinal + 35, $pt(28), 'TOTAL EFECTIVO');
    $textB(280, $yLineaFinal + 35, $pt(28), '$');
    $textB(300, $yLineaFinal + 35, $pt(28), money($totalEfectivo));
}

function renderTicketPodaPdf($pdf, $empleado, $meta) {
    $nombre = safeText($empleado['nombre'] ?? '');
    $semana = safeText($meta['numero_semana'] ?? '');
    $totalArboles = toNumber($empleado['totalArboles'] ?? 0);
    $pagoPorArbol = toNumber($empleado['monto'] ?? 0);
    $totalEfectivo = toNumber($empleado['totalEfectivo'] ?? 0);
    
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
    
    $pdf->SetLineWidth($dot(2));
    $pdf->Rect($dot(10), $dot(12), $dot(812), $dot(386));
    $text(290, 22, $pt(17), $nombre);
    $text(710, 20, $pt(18), 'SEM ' . $semana);
    $pdf->SetLineWidth($dot(1));
    $pdf->Line($dot(10), $dot(42), $dot(822), $dot(42));
    $text(280, 47, $pt(20), "Tipo de trabajo: Poda De Árboles");
    $pdf->Line($dot(10), $dot(75), $dot(822), $dot(75));
    
    $cellText = function ($xDot, $yDot, $wDot, $hDot, $fontPt, $value, $align = 'L') use ($pdf, $dot) {
        $pdf->SetFont('helvetica', '', $fontPt);
        $pdf->SetXY($dot($xDot), $dot($yDot));
        $pdf->Cell($dot($wDot), $dot($hDot), $value, 1, 0, $align, false, '', 0, false, 'C', 'M');
    };
    
    $fNormal = $pt(16); $fGrande = $pt(22);
    $xInicio = 10; $yInicio = 100; $anchoEtiqueta = 400; $anchoValor = 412; $altoCelda = 50; $espacioCeldas = 50;
    
    $cellText($xInicio, $yInicio, $anchoEtiqueta, $altoCelda, $fNormal, 'Total Árboles podados:', 'L');
    $cellText($xInicio + $anchoEtiqueta, $yInicio, $anchoValor, $altoCelda, $fGrande, $totalArboles, 'C');
    $cellText($xInicio, $yInicio + $espacioCeldas, $anchoEtiqueta, $altoCelda, $fNormal, 'Pago por árbol:', 'L');
    $cellText($xInicio + $anchoEtiqueta, $yInicio + $espacioCeldas, $anchoValor, $altoCelda, $fGrande, '$' . money($pagoPorArbol), 'C');
    $cellText($xInicio, $yInicio + ($espacioCeldas * 2), $anchoEtiqueta, $altoCelda, $fNormal, 'Total efectivo:', 'L');
    $cellText($xInicio + $anchoEtiqueta, $yInicio + ($espacioCeldas * 2), $anchoValor, $altoCelda, $fGrande, '$' . money($totalEfectivo), 'C');
    
    $yLineaFinal = $yInicio + ($espacioCeldas * 3) + 20;
    $pdf->SetLineWidth($dot(2));
    $pdf->Line($dot(10), $dot($yLineaFinal), $dot(822), $dot($yLineaFinal));
    $textB(18, $yLineaFinal + 35, $pt(28), 'TOTAL EFECTIVO');
    $textB(280, $yLineaFinal + 35, $pt(28), '$');
    $textB(300, $yLineaFinal + 35, $pt(28), money($totalEfectivo));
}

function renderTicketPdf(TCPDF $pdf, $emp, $extra, $meta) {
    $nombre = safeText($emp['nombre'] ?? '');
    $clave = safeText($emp['clave'] ?? '');
    $departamento = safeText($extra['nombre_departamento'] ?? ($emp['departamento'] ?? ''));
    $departamento = preg_replace('/^\d+\s*/', '', $departamento);
    $puesto = safeText($extra['nombre_puesto'] ?? ($emp['puesto'] ?? ''));
    $fechaIngreso = safeText($extra['fecha_alta_empresa'] ?? ($emp['fecha_alta_empresa'] ?? ''));
    $fechaIngreso = str_replace('-', '/', $fechaIngreso);

    // Lógica de showDataTable.js para Percepciones
    $sueldoSemanal = toNumber($emp['salario_semanal'] ?? 0);
    $pasaje = toNumber($emp['pasaje'] ?? 0);
    $comida = toNumber($emp['comida'] ?? 0);
    $tardeada = toNumber($emp['tardeada'] ?? 0);
    $extras = toNumber($emp['sueldo_extra_total'] ?? 0);
    $percepciones_extra = is_array($emp['percepciones_extra'] ?? null) ? $emp['percepciones_extra'] : [];

    $totalPercepciones = $sueldoSemanal + $pasaje + $comida + $tardeada + $extras;
    foreach ($percepciones_extra as $pe) $totalPercepciones += toNumber($pe['cantidad'] ?? 0);

    // Lógica de showDataTable.js para Deducciones
    $conceptos = is_array($emp['conceptos'] ?? null) ? $emp['conceptos'] : [];
    $getConcepto = function ($codigo) use ($conceptos) {
        foreach ($conceptos as $c) {
            if ((string)($c['codigo'] ?? '') === (string)$codigo) return toNumber($c['resultado'] ?? 0);
        }
        return 0.0;
    };

    $isr = $getConcepto('45');
    $imss = $getConcepto('52');
    $infonavit = $getConcepto('16');
    $ajusteSub = $getConcepto('107');
    $retardos = toNumber($emp['retardos'] ?? 0);
    $permiso = toNumber($emp['permiso'] ?? 0);
    $inasistencia = toNumber($emp['inasistencia'] ?? 0);
    $uniformes = toNumber($emp['uniformes'] ?? 0);
    $checador = toNumber($emp['checador'] ?? 0);
    $faGafet = toNumber($emp['fa_gafet_cofia'] ?? 0);

    $totalDeducciones = $retardos + $isr + $imss + $ajusteSub + $infonavit + $permiso + $inasistencia + $uniformes + $checador + $faGafet;

    // Descuentos de flujo (Tarjeta y Préstamo)
    $tarjeta = toNumber($emp['tarjeta'] ?? 0);
    $prestamo = toNumber($emp['prestamo'] ?? 0);

    // Cálculo del Neto final (Importe a cobrar en efectivo)
    $totalAntesRedondeo = $totalPercepciones - $totalDeducciones - $tarjeta - $prestamo;
    
    // Redondeo automático: <.50 hacia abajo, >=.50 hacia arriba
    $totalFinal = round($totalAntesRedondeo);
    $redondeo = $totalFinal - $totalAntesRedondeo;

    // --- Listas para el Ticket ---
    $pList = []; $idx = 1;
    if ($sueldoSemanal > 0) $pList[] = ['label' => ($idx++) . ' Sueldo semanal', 'monto' => $sueldoSemanal];
    if ($pasaje > 0) $pList[] = ['label' => ($idx++) . ' Pasaje', 'monto' => $pasaje];
    if ($comida > 0) $pList[] = ['label' => ($idx++) . ' Comida', 'monto' => $comida];
    if ($tardeada > 0) $pList[] = ['label' => ($idx++) . ' Tardeada', 'monto' => $tardeada];
    foreach ($percepciones_extra as $pe) {
        $m = toNumber($pe['cantidad'] ?? 0);
        if ($m > 0) $pList[] = ['label' => ($idx++) . ' ' . safeText($pe['nombre'] ?? ''), 'monto' => $m];
    }
    if ($redondeo > 0) $pList[] = ['label' => ($idx++) . ' Redondeo', 'monto' => $redondeo];

    $dList = [];
    if ($isr > 0) $dList[] = ['label' => 'ISR', 'monto' => $isr];
    if ($imss > 0) $dList[] = ['label' => 'IMSS', 'monto' => $imss];
    if ($infonavit > 0) $dList[] = ['label' => 'INFONAVIT', 'monto' => $infonavit];
    if ($ajusteSub > 0) $dList[] = ['label' => 'Ajuste al Sub', 'monto' => $ajusteSub];
    if ($retardos > 0) $dList[] = ['label' => 'Retardos', 'monto' => $retardos];
    if ($permiso > 0) $dList[] = ['label' => 'Permisos', 'monto' => $permiso];
    if ($inasistencia > 0) $dList[] = ['label' => 'Ausentismo', 'monto' => $inasistencia];
    if ($uniformes > 0) $dList[] = ['label' => 'Uniformes', 'monto' => $uniformes];
    if ($checador > 0) $dList[] = ['label' => 'Checador', 'monto' => $checador];
    
    $deducciones_extra = is_array($emp['deducciones_extra'] ?? null) ? $emp['deducciones_extra'] : [];
    foreach ($deducciones_extra as $de) {
        $m = toNumber($de['cantidad'] ?? 0);
        if ($m > 0) $dList[] = ['label' => safeText($de['nombre'] ?? ''), 'monto' => $m];
    }
    
    // Conceptos que restan del neto de efectivo
    if ($tarjeta > 0) $dList[] = ['label' => 'Tarjeta', 'monto' => $tarjeta];
    if ($prestamo > 0) $dList[] = ['label' => 'Préstamo', 'monto' => $prestamo];
    if ($redondeo < 0) $dList[] = ['label' => 'Redondeo', 'monto' => abs($redondeo)];

    // Totales calculados para el ticket
    $tPerpTicket = 0; foreach ($pList as $p) $tPerpTicket += $p['monto'];
    $tDedTicket = 0; foreach ($dList as $d) $tDedTicket += $d['monto'];
    $netoTicket = $tPerpTicket - $tDedTicket;

    // --- Renderizado TCPDF ---
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
    $text(310, 22, $pt(15), $departamento);

    $esSinSeguro = !empty($emp['sin_seguro_ticket']) || 
                   (isset($emp['seguroSocial']) && $emp['seguroSocial'] === false) || 
                   stripos($departamento, 'sin seguro') !== false;
    if (!$esSinSeguro) {
        $text(551, 22, $pt(17), 'F.Ingr: ' . $fechaIngreso);
        $text(710, 20, $pt(18), 'SEM ' . safeText($meta['numero_semana'] ?? ''));
    }

    $pdf->SetLineWidth($dot(1));
    $pdf->Line($dot(10), $dot(42), $dot(822), $dot(42));
    $pdf->Line($dot(280), $dot(42), $dot(280), $dot(70));
    $pdf->Line($dot(520), $dot(42), $dot(520), $dot(70));

    $lenPuesto = strlen($puesto);
    $puestoFontSize = ($lenPuesto > 33) ? 3.5 : (($lenPuesto > 27) ? 4.1 : (($lenPuesto > 23) ? 4.5 : (($lenPuesto > 19) ? 5 : (($lenPuesto > 15) ? 5.8 : 6))));
    $text(18, 51, $puestoFontSize, $puesto);
    
    $salarioDiario = toNumber($extra['salario_diario'] ?? ($emp['salario_diario'] ?? 0));
    $sueldoSemanalInfo = toNumber($extra['salario_semanal'] ?? ($emp['salario_semanal'] ?? 0));
    $text(290, 47, $pt(18), 'Sal. diario: $ ' . money($salarioDiario));
    $text(530, 47, $pt(18), 'Sal. Semanal: $ ' . money($sueldoSemanalInfo));

    $pdf->Line($dot(10), $dot(70), $dot(822), $dot(70));
    $diasTrabajados = safeText($emp['dias_trabajados'] ?? '0');
    $textB(13, 77, $pt(13), 'Días laborados: ');
    $textB(118, 75, $pt(17), $diasTrabajados);
    $textB(150, 78, $pt(20), 'PERCEPCIONES');
    $textB(520, 78, $pt(20), 'DEDUCCIONES');
    $pdf->Line($dot(10), $dot(107), $dot(822), $dot(107));

    $lh = 26; $tableTop = 107;
    $maxC = max(count($pList), count($dList));
    $maxRows1 = 11; $maxRowsC = 13;
    $row = 0; $currentY = $tableTop;

    for ($i = 0; $i < $maxC; $i++) {
        if ($i >= $maxRows1 && ($i - $maxRows1) % $maxRowsC === 0) {
            $pdf->AddPage();
            $pdf->SetLineWidth($dot(2)); $pdf->Rect($dot(10), $dot(12), $dot(812), $dot(386));
            $textB(12, 22, $pt(15), $clave . ' ' . $nombre);
            $text(710, 20, $pt(18), 'SEM ' . safeText($meta['numero_semana'] ?? ''));
            $pdf->SetLineWidth($dot(1)); $pdf->Line($dot(10), $dot(42), $dot(822), $dot(42));
            $tableTop = 50; $row = 0;
        }
        $y = $tableTop + ($row * $lh);
        if (isset($pList[$i])) {
            $pdf->SetFont('helvetica', '', $pt(15));
            $cellText(9, $y, 170, $lh, $pt(14), $pList[$i]['label'], 'L');
            $cellText(240, $y, 229, $lh, $pt(16), '$ ' . money($pList[$i]['monto']), 'C');
        }
        if (isset($dList[$i])) {
            $pdf->SetFont('helvetica', '', $pt(15));
            $cellText(410, $y, 218, $lh, $pt(14), $dList[$i]['label'], 'L');
            $cellText(660, $y, 182, $lh, $pt(16), '-$ ' . money($dList[$i]['monto']), 'C');
        }
        $pdf->SetLineWidth($dot(1));
        $pdf->Line($dot(10), $dot($y + $lh), $dot(822), $dot($y + $lh));
        $pdf->SetLineWidth($dot(2));
        $pdf->Line($dot(415), $dot($tableTop), $dot(415), $dot($y + $lh));
        $currentY = $y + $lh; $row++;
    }

    $yT = $currentY + 18;
    if ($yT > 340) { $pdf->AddPage(); $yT = 50; }
    $pdf->SetLineWidth($dot(2));
    $pdf->Line($dot(10), $dot($yT), $dot(822), $dot($yT));
    $text(18, $yT + 13, $pt(16), 'Total Percepciones');
    $text(310, $yT + 13, $pt(16), '$' . money($tPerpTicket));
    $text(430, $yT + 13, $pt(16), 'Total Deducciones');
    $text(710, $yT + 13, $pt(16), '-$' . money($tDedTicket));
    $pdf->Line($dot(415), $dot($yT), $dot(415), $dot($yT + 37));
    $pdf->Line($dot(10), $dot($yT + 37), $dot(822), $dot($yT + 37));
    $textB(18, $yT + 43, $pt(22), 'Neto a pagar');
    $textB(200, $yT + 43, $pt(22), '$');
    $textB(240, $yT + 43, $pt(22), money($netoTicket));
}

$raw = file_get_contents('php://input'); $data = json_decode($raw, true);
if (!$data) exit('Datos inválidos');

if (isset($data['seleccion']) && $data['seleccion'] === true) {
    $empleados = $data['empleados'] ?? []; $meta = $data['meta'] ?? ['numero_semana' => ''];
} elseif (isset($data['empleados']) && is_array($data['empleados'])) {
    $empleados = $data['empleados']; $meta = $data['meta'] ?? ['numero_semana' => ''];
} else {
    $nomina = $data['nomina'] ?? []; $meta = $data['meta'] ?? ['numero_semana' => ''];
    $empleados = [];
    foreach (($nomina['departamentos'] ?? []) as $depto) {
        foreach (($depto['empleados'] ?? []) as $emp) {
            $emp['departamento'] = $depto['nombre']; $empleados[] = $emp;
        }
    }
}

$pdf = new \TCPDF('L', 'mm', [50.8, 104], true, 'UTF-8', false);
$pdf->setPrintHeader(false); $pdf->setPrintFooter(false);
$pdf->SetMargins(0, 0, 0); $pdf->SetAutoPageBreak(false, 0);

foreach ($empleados as $emp) {
    $depto = strtoupper($emp['departamento'] ?? '');
    if ($depto === 'CORTE') {
        $pdf->AddPage(); renderTicketCortePdf($pdf, $emp, $meta);
    } elseif ($depto === 'PODA') {
        $pdf->AddPage(); renderTicketPodaPdf($pdf, $emp, $meta);
    } else {
        $clave = (string)($emp['clave'] ?? ''); $id_empresa = isset($emp['id_empresa']) ? intval($emp['id_empresa']) : 1;
        $extra = ['nombre_puesto' => $emp['puesto'] ?? '', 'fecha_alta_empresa' => $emp['fecha_alta_empresa'] ?? '', 'salario_semanal' => $emp['salario_semanal'] ?? 0, 'salario_diario' => $emp['salario_diario'] ?? 0, 'nombre_departamento' => $emp['departamento'] ?? ''];
        if ($clave !== '') {
            $sql = "SELECT p.nombre_puesto, e.fecha_alta_empresa, e.salario_semanal, e.salario_diario, d.nombre_departamento 
                    FROM info_empleados e 
                    JOIN puestos_especiales p ON e.id_puestoEspecial = p.id_puestoEspecial 
                    JOIN departamentos d ON e.id_departamento = d.id_departamento
                    WHERE e.clave_empleado = ? AND e.id_empresa = ? AND e.id_status = 1";
            $stmt = $conexion->prepare($sql); $stmt->bind_param("si", $clave, $id_empresa); $stmt->execute();
            $stmt->bind_result($np, $fi, $ss, $sd, $nd); if ($stmt->fetch()) $extra = ['nombre_puesto' => $np, 'fecha_alta_empresa' => $fi, 'salario_semanal' => $ss, 'salario_diario' => $sd, 'nombre_departamento' => $nd];
            $stmt->close();
        }
        $pdf->AddPage(); renderTicketPdf($pdf, $emp, $extra, $meta);
    }
}

if (ob_get_length()) ob_clean();
header('Content-Type: application/pdf');
header('Content-Disposition: attachment; filename="tickets_relicario.pdf"');
echo $pdf->Output('tickets_relicario.pdf', 'S');
