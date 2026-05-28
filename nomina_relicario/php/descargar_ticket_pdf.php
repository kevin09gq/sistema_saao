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
    
    $totalRejas = intval($empleado['totalRejas'] ?? 0);
    $preciosUnicos = is_array($empleado['preciosUnicos'] ?? null) ? $empleado['preciosUnicos'] : [];
    $efectivoRejas = toNumber($empleado['efectivoRejas'] ?? 0);
    $diasTrabajados = intval($empleado['diasTrabajados'] ?? 0);
    $preciosPorDia = is_array($empleado['preciosPorDia'] ?? null) ? $empleado['preciosPorDia'] : [];
    $totalNomina = toNumber($empleado['totalNomina'] ?? 0);
    $subtotal = toNumber($empleado['subtotal'] ?? $empleado['totalEfectivo'] ?? 0);
    $redondeo = toNumber($empleado['redondeo'] ?? 0);
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
    $cellText = function ($xDot, $yDot, $wDot, $hDot, $fontPt, $value, $align = 'L') use ($pdf, $dot) {
        $pdf->SetFont('helvetica', '', $fontPt);
        $pdf->SetXY($dot($xDot), $dot($yDot + 5)); 
        $pdf->Cell($dot($wDot), $dot($hDot - 8), substr((string)$value, 0, 50), 0, 0, $align, false, '', 0, false, 'T', 'T');
    };

    // Marco
    $pdf->SetLineWidth($dot(2));
    $pdf->Rect($dot(10), $dot(12), $dot(812), $dot(386));
    
    // Encabezado
    $textB(12, 22, $pt(17), $nombre);
    $text(710, 20, $pt(18), 'SEM ' . $semana);
    $pdf->SetLineWidth($dot(1));
    $pdf->Line($dot(10), $dot(42), $dot(822), $dot(42));
    $text(280, 47, $pt(20), "Corte De Rejas");
    $pdf->Line($dot(10), $dot(75), $dot(822), $dot(75));
    
    // Títulos de columnas
    $textB(150, 78, $pt(20), 'REJAS');
    $textB(520, 78, $pt(20), 'NOMINA');
    $pdf->Line($dot(10), $dot(107), $dot(822), $dot(107));
    
    // Construir listas
    $rejasList = [];
    $rejasList[] = ['label' => 'Total de rejas', 'monto' => $totalRejas];
    
    $idx = 1;
    foreach ($preciosUnicos as $precio) {
        $rejasList[] = ['label' => 'Precio por reja ' . $idx, 'monto' => '$ ' . money($precio)];
        $idx++;
    }
    
   
    $nominaList = [];
    if ($diasTrabajados > 0) {
        $nominaList[] = ['label' => 'Días trabajados', 'monto' => $diasTrabajados];
        
        $idx = 1;
        foreach ($preciosPorDia as $precio) {
            $nominaList[] = ['label' => 'Precio por día ' . $idx, 'monto' => '$ ' . money($precio)];
            $idx++;
        }
        
       }

    // Renderizar tabla
    $lh = 26; $tableTop = 107;
    $maxC = max(count($rejasList), count($nominaList));
    $maxRows1 = 9; $maxRowsC = 11;
    $row = 0; $currentY = $tableTop;

    for ($i = 0; $i < $maxC; $i++) {
        if ($i >= $maxRows1 && ($i - $maxRows1) % $maxRowsC === 0) {
            $pdf->AddPage();
            $pdf->SetLineWidth($dot(2)); $pdf->Rect($dot(10), $dot(12), $dot(812), $dot(386));
            $textB(12, 22, $pt(15), $nombre);
            $text(710, 20, $pt(18), 'SEM ' . $semana);
            $pdf->SetLineWidth($dot(1)); $pdf->Line($dot(10), $dot(42), $dot(822), $dot(42));
            
            $textB(150, 48, $pt(20), 'REJAS');
            $textB(520, 48, $pt(20), 'NOMINA');
            $pdf->Line($dot(10), $dot(75), $dot(822), $dot(75));
            
            $tableTop = 75; $row = 0;
        }
        $y = $tableTop + ($row * $lh);
        if (isset($rejasList[$i])) {
            $pdf->SetFont('helvetica', '', $pt(15));
            $cellText(9, $y, 170, $lh, $pt(14), $rejasList[$i]['label'], 'L');
            $cellText(240, $y, 229, $lh, $pt(16), $rejasList[$i]['monto'], 'C');
        }
        if (isset($nominaList[$i])) {
            $pdf->SetFont('helvetica', '', $pt(15));
            $cellText(410, $y, 218, $lh, $pt(14), $nominaList[$i]['label'], 'L');
            $cellText(660, $y, 182, $lh, $pt(16), $nominaList[$i]['monto'], 'C');
        }
        $pdf->SetLineWidth($dot(1));
        $pdf->Line($dot(10), $dot($y + $lh), $dot(822), $dot($y + $lh));
        $pdf->SetLineWidth($dot(2));
        $pdf->Line($dot(415), $dot($tableTop), $dot(415), $dot($y + $lh));
        $currentY = $y + $lh; $row++;
    }

    $yT = $currentY + 18;
    if ($yT > 310) { 
        $pdf->AddPage(); 
        $pdf->SetLineWidth($dot(2)); $pdf->Rect($dot(10), $dot(12), $dot(812), $dot(386));
        $textB(12, 22, $pt(15), $nombre);
        $text(710, 20, $pt(18), 'SEM ' . $semana);
        $pdf->SetLineWidth($dot(1)); $pdf->Line($dot(10), $dot(42), $dot(822), $dot(42));
        $pdf->Line($dot(415), $dot(12), $dot(415), $dot(42));
        $yT = 55; 
    }
    
    $pdf->SetLineWidth($dot(2));
    $pdf->Line($dot(10), $dot($yT), $dot(822), $dot($yT));
    $text(18, $yT + 13, $pt(16), 'Efectivo rejas');
    $text(310, $yT + 13, $pt(16), '$' . money($efectivoRejas));
    $text(430, $yT + 13, $pt(16), 'Total nómina');
    $text(710, $yT + 13, $pt(16), '$' . money($totalNomina));
    
    $pdf->Line($dot(415), $dot($yT), $dot(415), $dot($yT + 37));
    $pdf->Line($dot(10), $dot($yT + 37), $dot(822), $dot($yT + 37));

    if (round($redondeo, 2) != 0) {
        $signo = $redondeo > 0 ? '+' : '';
        $text(18, $yT + 42, $pt(16), 'Total efectivo $' . money($subtotal) . ' ---------- ajustes redondeo: ' . $signo . '$' . money($redondeo));
        
        $pdf->Line($dot(10), $dot($yT + 62), $dot(822), $dot($yT + 62));
        
        $textB(18, $yT + 68, $pt(22), 'TOTAL EFECTIVO');
        $textB(620, $yT + 68, $pt(22), '$');
        $textB(640, $yT + 68, $pt(22), money($totalEfectivo));
    } else {
        $textB(18, $yT + 43, $pt(22), 'TOTAL EFECTIVO');
        $textB(620, $yT + 43, $pt(22), '$');
        $textB(640, $yT + 43, $pt(22), money($totalEfectivo));
    }
}

function renderTicketPodaPdf($pdf, $empleado, $meta) {
    $nombre = safeText($empleado['nombre'] ?? '');
    $semana = safeText($meta['numero_semana'] ?? '');
    $totalArboles = toNumber($empleado['totalArboles'] ?? 0);
    $totalEfectivo = toNumber($empleado['totalEfectivo'] ?? 0);
    $desgloses = is_array($empleado['desgloses'] ?? null) ? $empleado['desgloses'] : [];
    
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
        $pdf->SetXY($dot($xDot), $dot($yDot + 5)); 
        $pdf->Cell($dot($wDot), $dot($hDot - 8), substr((string)$value, 0, 50), 0, 0, $align, false, '', 0, false, 'T', 'T');
    };

    // Marco
    $pdf->SetLineWidth($dot(2));
    $pdf->Rect($dot(10), $dot(12), $dot(812), $dot(386));
    
    // Encabezado
    $textB(12, 22, $pt(17), $nombre);
    $text(710, 20, $pt(18), 'SEM ' . $semana);
    $pdf->SetLineWidth($dot(1));
    $pdf->Line($dot(10), $dot(42), $dot(822), $dot(42));
    $text(280, 47, $pt(20), "Poda De Árboles");
    $pdf->Line($dot(10), $dot(75), $dot(822), $dot(75));
    
    // Construir listas para 3 columnas
    $pagoArbolList = [];
    $arbolesPoddosList = [];
    $totalEfectivoList = [];
    
    $idx = 1;
    foreach ($desgloses as $d) {
        $precio = toNumber($d['precio'] ?? 0);
        $cantidad = toNumber($d['cantidad'] ?? 0);
        $total = toNumber($d['total'] ?? 0);
        
        $pagoArbolList[] = ['label' => 'Pago por árbol ' . $idx, 'monto' => '$ ' . money($precio)];
        $arbolesPoddosList[] = ['label' => 'Árboles podados', 'monto' => $cantidad];
        $totalEfectivoList[] = ['label' => 'Total efectivo árbol ' . $idx, 'monto' => '$ ' . money($total)];
        $idx++;
    }

    // Renderizar tabla con 3 columnas
    $lh = 26; $tableTop = 75;
    $maxC = max(count($pagoArbolList), count($arbolesPoddosList), count($totalEfectivoList));
    $maxRows1 = 11; $maxRowsC = 13;
    $row = 0; $currentY = $tableTop;

    for ($i = 0; $i < $maxC; $i++) {
        if ($i >= $maxRows1 && ($i - $maxRows1) % $maxRowsC === 0) {
            $pdf->AddPage();
            $pdf->SetLineWidth($dot(2)); $pdf->Rect($dot(10), $dot(12), $dot(812), $dot(386));
            $textB(12, 22, $pt(15), $nombre);
            $text(710, 20, $pt(18), 'SEM ' . $semana);
            $pdf->SetLineWidth($dot(1)); $pdf->Line($dot(10), $dot(42), $dot(822), $dot(42));
            
            // Títulos de la continuación
            $text(280, 47, $pt(20), "Poda De Árboles - Total árboles: " . intval($totalArboles));
            $pdf->Line($dot(10), $dot(75), $dot(822), $dot(75));
            
            $tableTop = 75; $row = 0;
        }
        $y = $tableTop + ($row * $lh);
        
        if (isset($pagoArbolList[$i])) {
            $pdf->SetFont('helvetica', '', $pt(15));
            $cellText(9, $y, 170, $lh, $pt(14), $pagoArbolList[$i]['label'], 'L');
            $cellText(140, $y, 100, $lh, $pt(16), $pagoArbolList[$i]['monto'], 'C');
        }
        if (isset($arbolesPoddosList[$i])) {
            $pdf->SetFont('helvetica', '', $pt(15));
            $cellText(280, $y, 150, $lh, $pt(14), $arbolesPoddosList[$i]['label'], 'L');
            $cellText(400, $y, 100, $lh, $pt(16), $arbolesPoddosList[$i]['monto'], 'C');
        }
        if (isset($totalEfectivoList[$i])) {
            $pdf->SetFont('helvetica', '', $pt(15));
            $cellText(510, $y, 170, $lh, $pt(14), $totalEfectivoList[$i]['label'], 'L');
            $cellText(675, $y, 82, $lh, $pt(16), $totalEfectivoList[$i]['monto'], 'C');
        }
        
        $pdf->SetLineWidth($dot(1));
        $pdf->Line($dot(10), $dot($y + $lh), $dot(822), $dot($y + $lh));
        $pdf->SetLineWidth($dot(2));
        $pdf->Line($dot(270), $dot($tableTop), $dot(270), $dot($y + $lh));
        $pdf->Line($dot(500), $dot($tableTop), $dot(500), $dot($y + $lh));
        $currentY = $y + $lh; $row++;
    }

    $yT = $currentY + 18;
    if ($yT > 310) { 
        $pdf->AddPage(); 
        $pdf->SetLineWidth($dot(2)); $pdf->Rect($dot(10), $dot(12), $dot(812), $dot(386));
        $textB(12, 22, $pt(15), $nombre);
        $text(710, 20, $pt(18), 'SEM ' . $semana);
        $pdf->SetLineWidth($dot(1)); $pdf->Line($dot(10), $dot(42), $dot(822), $dot(42));
        $yT = 55; 
    }
    
    // Calcular subtotal y redondeo
    $subtotal = 0;
    foreach ($desgloses as $d) {
        $subtotal += toNumber($d['total'] ?? 0);
    }
    $totalEfectivoRedondeado = round($subtotal);
    $redondeo = $totalEfectivoRedondeado - $subtotal;
    
    $pdf->SetLineWidth($dot(2));
    $pdf->Line($dot(10), $dot($yT), $dot(822), $dot($yT));
    
    if (round($redondeo, 2) != 0) {
        $signo = $redondeo > 0 ? '+' : '';
        $text(18, $yT + 13, $pt(16), 'Efectivo $' . money($subtotal) . ' ---------- ajustes redondeo: ' . $signo . '$' . money($redondeo));
        $pdf->Line($dot(10), $dot($yT + 37), $dot(822), $dot($yT + 37));
        $textB(18, $yT + 43, $pt(22), 'TOTAL EFECTIVO');
        $textB(620, $yT + 43, $pt(22), '$');
        $textB(640, $yT + 43, $pt(22), money($totalEfectivoRedondeado));
    } else {
        $text(430, $yT + 13, $pt(16), 'Total efectivo');
        $text(710, $yT + 13, $pt(16), '$' . money($totalEfectivo));
        $pdf->Line($dot(10), $dot($yT + 37), $dot(822), $dot($yT + 37));
        $textB(18, $yT + 43, $pt(22), 'TOTAL EFECTIVO');
        $textB(620, $yT + 43, $pt(22), '$');
        $textB(640, $yT + 43, $pt(22), money($totalEfectivo));
    }
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

function renderTicketExtraSimplificadoPdf($pdf, $empleado, $meta) {
    $nombre = safeText($empleado['nombre'] ?? '');
    $semana = safeText($meta['numero_semana'] ?? '');
    $conceptosExtras = is_array($empleado['conceptosExtras'] ?? null) ? $empleado['conceptosExtras'] : [];
    
    // Calcular subtotal y redondeo
    $subtotal = 0;
    foreach ($conceptosExtras as $ex) {
        $subtotal += toNumber($ex['monto'] ?? 0);
    }
    $totalFinal = round($subtotal);
    $redondeo = $totalFinal - $subtotal;
    
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
        $pdf->SetXY($dot($xDot), $dot($yDot + 5)); 
        $pdf->Cell($dot($wDot), $dot($hDot - 8), substr((string)$value, 0, 50), 0, 0, $align, false, '', 0, false, 'T', 'T');
    };

    // Marco
    $pdf->SetLineWidth($dot(2));
    $pdf->Rect($dot(10), $dot(12), $dot(812), $dot(386));
    
    // Encabezado
    $textB(12, 22, $pt(17), $nombre);
    $text(710, 20, $pt(18), 'SEM ' . $semana);
    $pdf->SetLineWidth($dot(1));
    $pdf->Line($dot(10), $dot(42), $dot(822), $dot(42));
    $text(280, 47, $pt(20), "Pago Extra / Complemento");
    $pdf->Line($dot(10), $dot(75), $dot(822), $dot(75));

    // Tabla de Conceptos y Monto
    $textB(150, 78, $pt(20), 'CONCEPTOS');
    $textB(520, 78, $pt(20), 'MONTO');
    $pdf->Line($dot(10), $dot(107), $dot(822), $dot(107));

    $lh = 26; $tableTop = 107;
    $row = 0;
    foreach ($conceptosExtras as $ex) {
        $y = $tableTop + ($row * $lh);
        $cellText(9, $y, 400, $lh, $pt(16), safeText($ex['concepto']), 'L');
        $cellText(410, $y, 400, $lh, $pt(16), '$ ' . money($ex['monto']), 'C');
        
        $pdf->SetLineWidth($dot(1));
        $pdf->Line($dot(10), $dot($y + $lh), $dot(822), $dot($y + $lh));
        $row++;
    }

    // Línea vertical divisoria
    $pdf->SetLineWidth($dot(2));
    $pdf->Line($dot(415), $dot($tableTop), $dot(415), $dot($tableTop + ($row * $lh)));

    // Pie con Redondeo
    $yPie = $tableTop + ($row * $lh) + 10;
    if ($yPie > 320) { $pdf->AddPage(); $yPie = 50; }
    
    $pdf->SetLineWidth($dot(2));
    $pdf->Line($dot(10), $dot($yPie), $dot(822), $dot($yPie));
    
    if (round($redondeo, 2) != 0) {
        $signo = $redondeo > 0 ? '+' : '';
        $text(18, $yPie + 13, $pt(16), 'Efectivo $' . money($subtotal) . ' ---------- ajustes redondeo: ' . $signo . '$' . money($redondeo));
        $pdf->Line($dot(10), $dot($yPie + 37), $dot(822), $dot($yPie + 37));
        $textB(18, $yPie + 43, $pt(22), 'TOTAL EFECTIVO');
        $textB(620, $yPie + 43, $pt(22), '$');
        $textB(640, $yPie + 43, $pt(22), money($totalFinal));
    } else {
        $text(430, $yPie + 13, $pt(16), 'Total efectivo');
        $text(710, $yPie + 13, $pt(16), '$' . money($subtotal));
        $pdf->Line($dot(10), $dot($yPie + 37), $dot(822), $dot($yPie + 37));
        $textB(18, $yPie + 43, $pt(22), 'TOTAL EFECTIVO');
        $textB(620, $yPie + 43, $pt(22), '$');
        $textB(640, $yPie + 43, $pt(22), money($totalFinal));
    }
}

$raw = file_get_contents('php://input'); $data = json_decode($raw, true);
if (!$data) exit('Datos inválidos');

if (isset($data['seleccion']) && $data['seleccion'] === true) {
    $empleados = $data['empleados'] ?? []; $meta = $data['meta'] ?? ['numero_semana' => ''];
} elseif (isset($data['empleados']) && is_array($data['empleados'])) {
    $empleados = $data['empleados']; $meta = $data['meta'] ?? ['numero_semana' => ''];
} else {
    $nomina = $data['nomina'] ?? []; $meta = $data['meta'] ?? ['numero_semana' => ''];
    $empleadosRaw = [];
    foreach (($nomina['departamentos'] ?? []) as $depto) {
        foreach (($depto['empleados'] ?? []) as $emp) {
            $emp['departamento'] = $depto['nombre']; $empleadosRaw[] = $emp;
        }
    }
    
    // Consolidar empleados repetidos en Corte y Poda
    $empleados = [];
    $mapConsolidacion = []; // Key: depto|nombre
    
    foreach ($empleadosRaw as $emp) {
        $depto = strtoupper($emp['departamento'] ?? '');
        $nombre = trim($emp['nombre'] ?? '');
        
        if ($depto === 'CORTE' || $depto === 'PODA') {
            $key = $depto . '|' . $nombre;
            if (!isset($mapConsolidacion[$key])) {
                $mapConsolidacion[$key] = $emp;
                // Inicializar estructuras para consolidación si es necesario
                if ($depto === 'CORTE') {
                    $mapConsolidacion[$key]['rejasArray'] = [];
                    $mapConsolidacion[$key]['nominaArray'] = [];
                } elseif ($depto === 'PODA') {
                    $mapConsolidacion[$key]['movsArray'] = [];
                }
            }
            
            // Acumular datos según el tipo
            if ($depto === 'CORTE') {
                if (isset($emp['concepto']) && $emp['concepto'] === 'REJA' && isset($emp['tickets'])) {
                    foreach ($emp['tickets'] as $t) {
                        $mapConsolidacion[$key]['rejasArray'][] = ['ticket' => $t, 'precio' => $t['precio_reja'] ?? 0];
                    }
                } elseif (isset($emp['concepto']) && $emp['concepto'] === 'NOMINA' && isset($emp['nomina'])) {
                    $mapConsolidacion[$key]['nominaArray'] = array_merge($mapConsolidacion[$key]['nominaArray'], $emp['nomina']);
                }
            } elseif ($depto === 'PODA') {
                if (isset($emp['movimientos'])) {
                    // 1. Separar movimientos de PODA (para el ticket consolidado)
                    $movsPoda = array_filter($emp['movimientos'], function($m) { 
                        return (strtoupper($m['concepto'] ?? '') === 'PODA'); 
                    });
                    if (!empty($movsPoda)) {
                        $mapConsolidacion[$key]['movsArray'] = array_merge($mapConsolidacion[$key]['movsArray'], $movsPoda);
                    }
                    
                    // 2. Extraer movimientos EXTRAS (para generar tickets normales adicionales)
                    $movsExtras = array_filter($emp['movimientos'], function($m) { 
                        return (strtoupper($m['concepto'] ?? '') !== 'PODA'); 
                    });
                    if (!empty($movsExtras)) {
                        // Consolidar todos los extras de este empleado en UN SOLO ticket de extras
                        if (!isset($mapConsolidacion[$key]['extrasArray'])) {
                            $mapConsolidacion[$key]['extrasArray'] = [];
                        }
                        foreach ($movsExtras as $ex) {
                            $mapConsolidacion[$key]['extrasArray'][] = [
                                'concepto' => $ex['concepto'] ?? 'Extra',
                                'monto' => $ex['monto'] ?? 0
                            ];
                        }
                    }
                }
            }
        } else {
            $empleados[] = $emp;
        }
    }
    
    // Procesar los consolidados de Corte y Poda
    // Nota: Como PHP no tiene las funciones de JS, tendremos que procesar los totales aquí 
    // o asegurar que el JS mande los datos ya procesados.
    // Pero como estamos en el bloque "else", significa que se mandó la nómina completa sin procesar.
    
    // Para simplificar y asegurar que funcione siempre, vamos a delegar el procesamiento a las funciones render
    // Pero necesitamos que el objeto $emp tenga la estructura esperada.
    
    foreach ($mapConsolidacion as $key => $consolidado) {
        $partes = explode('|', $key);
        $depto = $partes[0];
        
        if ($depto === 'CORTE') {
            // Re-calcular totales para Corte (Lógica similar a procesarTicketsCorteCombinado de JS)
            $totalRejas = 0; $efectivoRejas = 0; $preciosUnicos = [];
            foreach ($consolidado['rejasArray'] as $r) {
                $cantT = 0;
                if (isset($r['ticket']['datosRejas'])) {
                    foreach ($r['ticket']['datosRejas'] as $tr) {
                        $cantT += intval($tr['cantidad'] ?? 0);
                    }
                }
                $totalRejas += $cantT;
                $efectivoRejas += ($cantT * ($r['precio'] ?? 0));
                if (!in_array($r['precio'], $preciosUnicos)) $preciosUnicos[] = $r['precio'];
            }
            
            $diasTrabajados = 0; $totalNomina = 0; $preciosPorDia = [];
            foreach ($consolidado['nominaArray'] as $n) {
                $pago = toNumber($n['pago'] ?? 0);
                if ($pago > 0) {
                    $totalNomina += $pago;
                    $diasTrabajados++;
                    $preciosPorDia[] = $pago;
                }
            }
            
            $consolidado['totalRejas'] = $totalRejas;
            $consolidado['efectivoRejas'] = $efectivoRejas;
            $consolidado['preciosUnicos'] = $preciosUnicos;
            $consolidado['diasTrabajados'] = $diasTrabajados;
            $consolidado['totalNomina'] = $totalNomina;
            $consolidado['preciosPorDia'] = $preciosPorDia;
            $consolidado['totalEfectivo'] = round($efectivoRejas + $totalNomina);
            
        } elseif ($depto === 'PODA') {
            // TICKET 1: PODA (Solo si hay movimientos de poda)
            if (!empty($consolidado['movsArray'])) {
                $podaTicket = $consolidado;
                $totalArboles = 0; $totalEfectivo = 0; $desglosesMap = [];
                $dias = ['viernes' => 0, 'sabado' => 0, 'domingo' => 0, 'lunes' => 0, 'martes' => 0, 'miercoles' => 0, 'jueves' => 0];
                
                foreach ($consolidado['movsArray'] as $m) {
                    $cant = intval($m['arboles_podados'] ?? 0);
                    $monto = toNumber($m['monto'] ?? 0);
                    $totalArboles += $cant;
                    $totalEfectivo += ($cant * $monto);
                    
                    $precioKey = (string)$monto;
                    if (!isset($desglosesMap[$precioKey])) {
                        $desglosesMap[$precioKey] = ['precio' => $monto, 'cantidad' => 0, 'total' => 0];
                    }
                    $desglosesMap[$precioKey]['cantidad'] += $cant;
                    $desglosesMap[$precioKey]['total'] += ($cant * $monto);
                    
                    if (isset($m['fecha'])) {
                        $dw = strtolower(date('l', strtotime($m['fecha'])));
                        $traduccion = ['friday' => 'viernes', 'saturday' => 'sabado', 'sunday' => 'domingo', 'monday' => 'lunes', 'tuesday' => 'martes', 'wednesday' => 'miercoles', 'thursday' => 'jueves'];
                        $dia = $traduccion[$dw] ?? '';
                        if (isset($dias[$dia])) $dias[$dia] += $cant;
                    }
                }
                $podaTicket = array_merge($podaTicket, $dias);
                $podaTicket['totalArboles'] = $totalArboles;
                $podaTicket['totalEfectivo'] = $totalEfectivo;
                $podaTicket['desgloses'] = array_values($desglosesMap);
                $empleados[] = $podaTicket;
            }

            // TICKET 2: EXTRAS (Solo si hay movimientos extras)
            if (!empty($consolidado['extrasArray'])) {
                $extraTicket = $consolidado;
                $extraTicket['conceptosExtras'] = $consolidado['extrasArray'];
                $totalEfectivoExtra = 0;
                foreach ($consolidado['extrasArray'] as $ex) {
                    $totalEfectivoExtra += toNumber($ex['monto'] ?? 0);
                }
                $extraTicket['totalEfectivo'] = $totalEfectivoExtra;
                $extraTicket['esExtraPoda'] = true;
                $empleados[] = $extraTicket;
            }
            continue; // Evitar que se agregue el consolidado base al final
        }
        
        $empleados[] = $consolidado;
    }
}

$pdf = new \TCPDF('L', 'mm', [50.8, 104], true, 'UTF-8', false);
$pdf->setPrintHeader(false); $pdf->setPrintFooter(false);
$pdf->SetMargins(0, 0, 0); $pdf->SetAutoPageBreak(false, 0);

foreach ($empleados as $emp) {
    $depto = strtoupper($emp['departamento'] ?? '');
    $esExtraPoda = isset($emp['esExtraPoda']) && $emp['esExtraPoda'] === true;

    if ($esExtraPoda) {
        $pdf->AddPage(); renderTicketExtraSimplificadoPdf($pdf, $emp, $meta);
    } elseif ($depto === 'CORTE') {
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
