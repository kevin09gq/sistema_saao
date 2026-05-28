<?php

error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/error_log.txt');

require_once __DIR__ . '/../../conexion/conexion.php';
require_once __DIR__ . '/../../vendor/autoload.php';
require_once __DIR__ . '/../../vendor/tecnickcom/tcpdf/tcpdf.php';

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

function redondear($numero) {
    return round((float)$numero, 0, PHP_ROUND_HALF_UP);
}

function safeText($s) {
    $s = (string)$s;
    $s = str_replace(["\r", "\n", "\t"], ' ', $s);
    $s = trim(preg_replace('/\s+/', ' ', $s));
    return $s;
}

function normalizarDiaNominaPhp($dia) {
    $d = strtolower(trim((string)$dia));
    $d = str_replace(['á', 'é', 'í', 'ó', 'ú'], ['a', 'e', 'i', 'o', 'u'], $d);
    $alias = [
        'dom' => 'domingo', 'domingo' => 'domingo',
        'lun' => 'lunes', 'lunes' => 'lunes',
        'mar' => 'martes', 'martes' => 'martes',
        'mie' => 'miercoles', 'miercoles' => 'miercoles',
        'jue' => 'jueves', 'jueves' => 'jueves',
        'vie' => 'viernes', 'viernes' => 'viernes',
        'sab' => 'sabado', 'sabado' => 'sabado',
    ];
    return $alias[$d] ?? $d;
}

function obtenerDiaSemanaDesdeFechaPhp($fechaStr) {
    $s = trim((string)$fechaStr);
    if ($s === '') return '';

    if (preg_match('/^(\d{4})-(\d{2})-(\d{2})/', $s, $m)) {
        $ts = mktime(0, 0, 0, (int)$m[2], (int)$m[3], (int)$m[1]);
        $dias = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
        return normalizarDiaNominaPhp($dias[(int)date('w', $ts)]);
    }

    if (strpos($s, '/') !== false) {
        $meses = [
            'Ene' => 0, 'Feb' => 1, 'Mar' => 2, 'Abr' => 3, 'May' => 4, 'Jun' => 5,
            'Jul' => 6, 'Ago' => 7, 'Sep' => 8, 'Oct' => 9, 'Nov' => 10, 'Dic' => 11
        ];
        $partes = explode('/', $s);
        if (count($partes) === 3 && isset($meses[$partes[1]])) {
            $ts = mktime(0, 0, 0, $meses[$partes[1]] + 1, (int)$partes[0], (int)$partes[2]);
            $dias = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
            return normalizarDiaNominaPhp($dias[(int)date('w', $ts)]);
        }
    }

    return normalizarDiaNominaPhp($s);
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

    $pdf->SetLineWidth($dot(2));
    $pdf->Rect($dot(10), $dot(12), $dot(812), $dot(386));

    $textB(12, 22, $pt(17), $nombre);
    $text(710, 20, $pt(18), 'SEM ' . $semana);
    $pdf->SetLineWidth($dot(1));
    $pdf->Line($dot(10), $dot(42), $dot(822), $dot(42));
    $text(280, 47, $pt(20), "Corte De Rejas");
    $pdf->Line($dot(10), $dot(75), $dot(822), $dot(75));

    $textB(150, 78, $pt(20), 'REJAS');
    $textB(520, 78, $pt(20), 'NOMINA');
    $pdf->Line($dot(10), $dot(107), $dot(822), $dot(107));

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

    $pdf->SetLineWidth($dot(2));
    $pdf->Rect($dot(10), $dot(12), $dot(812), $dot(386));

    $textB(12, 22, $pt(17), $nombre);
    $text(710, 20, $pt(18), 'SEM ' . $semana);
    $pdf->SetLineWidth($dot(1));
    $pdf->Line($dot(10), $dot(42), $dot(822), $dot(42));
    $text(280, 47, $pt(20), "Poda De Árboles");
    $pdf->Line($dot(10), $dot(75), $dot(822), $dot(75));

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

function renderTicketExtraSimplificadoPdf($pdf, $empleado, $meta) {
    $nombre = safeText($empleado['nombre'] ?? '');
    $semana = safeText($meta['numero_semana'] ?? '');
    $conceptosExtras = is_array($empleado['conceptosExtras'] ?? null) ? $empleado['conceptosExtras'] : [];

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

    $pdf->SetLineWidth($dot(2));
    $pdf->Rect($dot(10), $dot(12), $dot(812), $dot(386));

    $textB(12, 22, $pt(17), $nombre);
    $text(710, 20, $pt(18), 'SEM ' . $semana);
    $pdf->SetLineWidth($dot(1));
    $pdf->Line($dot(10), $dot(42), $dot(822), $dot(42));
    $text(280, 47, $pt(20), "Pago Extra / Complemento");
    $pdf->Line($dot(10), $dot(75), $dot(822), $dot(75));

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

    $pdf->SetLineWidth($dot(2));
    $pdf->Line($dot(415), $dot($tableTop), $dot(415), $dot($tableTop + ($row * $lh)));

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

function renderTicketPdf($pdf, $emp, $extra, $meta) {
    $nombre     = safeText($emp['nombre'] ?? '');
    $clave      = safeText($emp['clave'] ?? '');

    // Departamento del JSON (eliminar número inicial)
    $departamento = safeText($emp['departamento'] ?? '');
    $departamento = preg_replace('/^\d+\s*/', '', $departamento);

    $puesto      = safeText($extra['nombre_puesto'] ?? '');
    $fechaIngreso = safeText($extra['fecha_alta_empresa'] ?? '');
    $fechaIngreso = str_replace('-', '/', $fechaIngreso);

    // Salarios: priorizar lo que viene del JSON del empleado; si no hay, usar BD
    $sueldoSemanal = toNumber($emp['salario_semanal'] ?? ($extra['salario_semanal'] ?? 0));
    $salarioDiario = toNumber($extra['salario_diario'] ?? 0);

    // ─── Percepciones ───────────────────────────────────────────────
    $percepciones_extra = is_array($emp['percepciones_extra'] ?? null) ? $emp['percepciones_extra'] : [];
    $extras    = toNumber($emp['sueldo_extra_total'] ?? 0);
    $vacaciones = toNumber($emp['vacaciones'] ?? 0);
    $pasaje     = toNumber($emp['pasaje'] ?? 0);

    // ─── Deducciones ────────────────────────────────────────────────
    $conceptos = is_array($emp['conceptos'] ?? null) ? $emp['conceptos'] : [];
    $getConcepto = function ($codigo) use ($conceptos) {
        foreach ($conceptos as $c) {
            if ((string)($c['codigo'] ?? '') === (string)$codigo) {
                return toNumber($c['resultado'] ?? 0);
            }
        }
        return 0.0;
    };

    $isr        = $getConcepto('45');
    $imssDed    = $getConcepto('52');
    $infonavit  = $getConcepto('16');
    $ajusteSub  = $getConcepto('107');

    $retardos    = toNumber($emp['retardos']      ?? 0);
    $permiso     = toNumber($emp['permiso']       ?? 0);
    $inasistencia= toNumber($emp['inasistencia']  ?? 0);
    $uniformes   = toNumber($emp['uniformes']     ?? 0);
    $checador    = toNumber($emp['checador']      ?? 0);
    $faGafet     = toNumber($emp['fa_gafet_cofia'] ?? 0);
    $prestamo    = toNumber($emp['prestamo']      ?? 0);
    $tarjeta     = toNumber($emp['tarjeta']       ?? 0);

    // ─── Calcular neto y redondeo primero ─────────────────────────────
    $totalPercepcionesTemp = $sueldoSemanal + $extras + $vacaciones + $pasaje;
    
    // Agregar percepciones extra al total temporal
    foreach ($percepciones_extra as $perc_extra) {
        $totalPercepcionesTemp += toNumber($perc_extra['cantidad'] ?? 0);
    }
    
    $totalDeduccionesTemp = $isr + $imssDed + $infonavit + $ajusteSub + $retardos + $permiso + 
                           $inasistencia + $uniformes + $checador + $faGafet + $prestamo + $tarjeta;
    
    // Neto: usar total_cobrar guardado; si no, calcular
    if (isset($emp['total_cobrar']) && toNumber($emp['total_cobrar']) != 0) {
        $neto = toNumber($emp['total_cobrar']);
    } else {
        $neto = $totalPercepcionesTemp - $totalDeduccionesTemp;
    }
    
    // Aplicar redondeo
    $netoOriginal = $neto;
    $netoRedondeado = redondear($netoOriginal);
    $ajusteRedondeo = round($netoRedondeado - $netoOriginal, 2);
    $redondeoActivo = !empty($emp['redondeo_activo']);
    $redondeoGuardado = isset($emp['redondeo']) ? toNumber($emp['redondeo']) : 0.0;
    if ($redondeoActivo && abs($redondeoGuardado) > 0.0001) {
        $ajusteRedondeo = round($redondeoGuardado, 2);
    }
    $neto = $netoRedondeado;

    // ─── Construir arreglos para el render ──────────────────────────
    $percepciones = [];
    $conceptoNum  = 1;
    if ($sueldoSemanal > 0) $percepciones[] = ['label' => $conceptoNum++ . ' Sueldo semanal',    'monto' => $sueldoSemanal];
    
    // Agregar percepciones extra individuales
    foreach ($percepciones_extra as $perc_extra) {
        $nombrePercepcion = safeText($perc_extra['nombre'] ?? '');
        $cantidad = toNumber($perc_extra['cantidad'] ?? 0);
        if ($cantidad > 0 && $nombrePercepcion !== '') {
            $percepciones[] = ['label' => $conceptoNum++ . ' ' . $nombrePercepcion, 'monto' => $cantidad];
        }
    }

    // Agregar comida si existe y es mayor a 0
    $comida = toNumber($emp['comida'] ?? 0);
    if ($comida > 0) {
        $percepciones[] = ['label' => $conceptoNum++ . ' Comida', 'monto' => $comida];
    }

    // Agregar tardeada si existe y es mayor a 0
    $tardeada = toNumber($emp['tardeada'] ?? 0);
    if ($tardeada > 0) {
        $percepciones[] = ['label' => $conceptoNum++ . ' Tardeada', 'monto' => $tardeada];
    }

    if ($vacaciones > 0)    $percepciones[] = ['label' => $conceptoNum++ . ' Vacaciones',        'monto' => $vacaciones];
    if ($pasaje > 0)        $percepciones[] = ['label' => $conceptoNum++ . ' Pasaje',            'monto' => $pasaje];

    // Calcular el total de percepciones inicial
    $totalPercepciones = 0.0;
    foreach ($percepciones as $p) {
        $totalPercepciones += toNumber($p['monto']);
    }

    // Agregar redondeo como concepto (positivo en percepciones, negativo en deducciones)
    if ($ajusteRedondeo > 0) {
        $percepciones[] = ['label' => $conceptoNum++ . ' Redondeo', 'monto' => $ajusteRedondeo];
        $totalPercepciones += $ajusteRedondeo;
    }

    $deducciones = [];
    if ($isr       > 0) $deducciones[] = ['label' => 'ISR',          'monto' => $isr];
    if ($imssDed   > 0) $deducciones[] = ['label' => 'IMSS',         'monto' => $imssDed];
    if ($infonavit > 0) $deducciones[] = ['label' => 'INFONAVIT',    'monto' => $infonavit];
    if ($ajusteSub > 0) $deducciones[] = ['label' => 'Ajuste al Sub','monto' => $ajusteSub];
    if ($retardos  > 0) $deducciones[] = ['label' => 'Retardos',     'monto' => $retardos];
    if ($permiso   > 0) $deducciones[] = ['label' => 'Permisos',     'monto' => $permiso];
    if ($inasistencia > 0) $deducciones[] = ['label' => 'Ausentismo', 'monto' => $inasistencia];
    if ($uniformes > 0) $deducciones[] = ['label' => 'Uniformes',    'monto' => $uniformes];
    if ($checador  > 0) $deducciones[] = ['label' => 'Checador',     'monto' => $checador];
    // Agregar deducciones extra individuales
    if (is_array($emp['deducciones_extra'] ?? null)) {
        foreach ($emp['deducciones_extra'] as $ded_extra) {
            $nombreDeduccion = safeText($ded_extra['nombre'] ?? '');
            $cantidad = toNumber($ded_extra['cantidad'] ?? 0);
            if ($cantidad > 0 && $nombreDeduccion !== '' && stripos($nombreDeduccion, 'F.A/Gafet/Cofia') === false) {
                $deducciones[] = ['label' => $nombreDeduccion, 'monto' => $cantidad];
            }
        }
    }
    if ($prestamo  > 0) $deducciones[] = ['label' => 'Préstamo',     'monto' => $prestamo];
    if ($tarjeta   > 0) $deducciones[] = ['label' => 'Tarjeta',      'monto' => $tarjeta];
    
    // Agregar redondeo negativo en deducciones
    if ($ajusteRedondeo < 0) $deducciones[] = ['label' => 'Redondeo', 'monto' => abs($ajusteRedondeo)];

    $totalDeduccionesCalculado = 0.0;
    foreach ($deducciones as $d) {
        if (strpos($d['label'], 'F.A/Gafet/Cofia') === 0) continue;
        $totalDeduccionesCalculado += toNumber($d['monto']);
    }

    $semana = safeText($meta['numero_semana'] ?? '');

    // ─── Funciones de dibujo ─────────────────────────────────────────
    $pdf->SetTextColor(0, 0, 0);

    $dot = function ($d) {
        return ((float)$d) / 8.0;
    };
    $pt = function ($dotH) use ($dot) {
        $mm = $dot($dotH);
        return max(4.0, $mm / 0.352777);
    };

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

    // ─── Encabezado ──────────────────────────────────────────────────
    $pdf->SetLineWidth($dot(2));
    $pdf->Rect($dot(10), $dot(12), $dot(812), $dot(386));

    $nombreCompleto = $clave . ' ' . $nombre;
    $nombreFontSize = strlen($nombreCompleto) > 35 ? 8 : (strlen($nombreCompleto) >= 31 ? 13 : 15);
    $textB(12, 22, $pt($nombreFontSize), $nombreCompleto);

    $deptoFontSize = 14;
    $text(310, 22, $pt($deptoFontSize), $departamento);

    $esSinSeguro = !empty($emp['sin_seguro_ticket']) || 
                   (isset($emp['seguroSocial']) && $emp['seguroSocial'] === false) || 
                   stripos($departamento, 'sin seguro') !== false;
    if (!$esSinSeguro) {
        $text(551, 22, $pt(17), 'F.Ingr: ' . $fechaIngreso);
        $text(710, 20, $pt(18), 'SEM ' . $semana);
    }

    $pdf->SetLineWidth($dot(1));
    $pdf->Line($dot(10), $dot(42), $dot(10 + 812), $dot(42));
    $pdf->Line($dot(280), $dot(42), $dot(280), $dot(70));
    $pdf->Line($dot(520), $dot(42), $dot(520), $dot(70));

    // Puesto
    $lenPuesto = strlen($puesto);
    if ($lenPuesto > 33)      $puestoFontSize = 3.5;
    elseif ($lenPuesto > 27)  $puestoFontSize = 4.1;
    elseif ($lenPuesto > 23)  $puestoFontSize = 4.5;
    elseif ($lenPuesto > 19)  $puestoFontSize = 5;
    elseif ($lenPuesto > 15)  $puestoFontSize = 5.8;
    else                       $puestoFontSize = 6;
    $text(18, 51, $puestoFontSize, $puesto);
    $text(290, 47, $pt(18), 'Sal. diario: $ ' . money($salarioDiario));
    $text(530, 47, $pt(18), 'Sal. Semanal: $ ' . money($sueldoSemanal));

    $pdf->SetLineWidth($dot(1));
    $pdf->Line($dot(10), $dot(70), $dot(10 + 812), $dot(70));

    $f20 = $pt(20);
    $diasTrabajados = safeText($emp['dias_trabajados'] ?? '0');
    $textB(13, 77, $pt(13), 'Días laborados: ');
    $textB(118, 75, $pt(17), $diasTrabajados);
    $textB(150, 78, $f20, 'PERCEPCIONES');
    $textB(520, 78, $f20, 'DEDUCCIONES');

    $pdf->SetLineWidth($dot(1));
    $pdf->Line($dot(10), $dot(107), $dot(10 + 812), $dot(107));

    // ─── Tabla de conceptos ─────────────────────────────────────────
    $y0   = 92;
    $lh   = 26;
    $f16  = $pt(16);
    $maxConceptos = max(count($percepciones), count($deducciones));
    $maxRowsPrimeraHoja    = 11;
    $maxRowsContinuacion   = 13;
    $tableTopPrimeraHoja   = 107;
    $textYOffset           = 8;

    if ($maxConceptos <= 9) {
        $numRowsPrimeraHoja        = $maxConceptos;
        $alturaContenidoPrimeraHoja = $numRowsPrimeraHoja * $lh;
        $fontSizeConceptos = $pt(16);
        $fontSizeTotales   = $pt(18);
        $fontSizeTitulos   = $pt(12);
        $fontSizeNeto      = $pt(22);
    } else {
        $numRowsPrimeraHoja        = min($maxRowsPrimeraHoja, $maxConceptos);
        $alturaContenidoPrimeraHoja = $numRowsPrimeraHoja * $lh;
        $fontSizeConceptos = $pt(16);
        $fontSizeTotales   = $pt(18);
        $fontSizeTitulos   = $pt(20);
        $fontSizeNeto      = $pt(22);
    }

    $f16 = $fontSizeConceptos;
    $f18 = $fontSizeTotales;
    $f22 = $fontSizeNeto;

    // Líneas verticales
    $pdf->SetLineWidth($dot(1));
    $pdf->Line($dot(305), $dot($tableTopPrimeraHoja), $dot(305), $dot($tableTopPrimeraHoja + $alturaContenidoPrimeraHoja));
    $pdf->Line($dot(700), $dot($tableTopPrimeraHoja), $dot(700), $dot($tableTopPrimeraHoja + $alturaContenidoPrimeraHoja));
    $pdf->SetLineWidth($dot(2));
    $pdf->Line($dot(415), $dot(106), $dot(415), $dot($tableTopPrimeraHoja + $alturaContenidoPrimeraHoja));

    $currentY = $y0;
    $row      = 0;
    $yInicioCeldasContinuacion = 50;
    $tableTop  = $tableTopPrimeraHoja;

    // Función inline para fuente según longitud
    $fontForLabel = function ($len) use ($f16, $pt) {
        if ($len >= 50) return $pt(10);
        if ($len >= 45) return $pt(11);
        if ($len >= 40) return $pt(12);
        if ($len >= 35) return $pt(13);
        if ($len >= 30) return $pt(14);
        return $f16;
    };

    for ($i = 0; $i < $maxConceptos; $i++) {
        if ($maxConceptos <= 9) {
            $yCellTop = ($tableTop + ($row * $lh)) + 16;
            if (isset($percepciones[$i])) {
                $concepto = $percepciones[$i];
                $fontConcepto = $fontForLabel(strlen($concepto['label']));
                $cellText(9, $yCellTop, 170, $lh, $fontConcepto, $concepto['label'], 'L');
                $cellText(240, $yCellTop, 229, $lh, $f16, '$ ' . money($concepto['monto']), 'C');
            }
            $yLine = ($tableTop + (($row + 1) * $lh));
            $pdf->Line($dot(10), $dot($yLine), $dot(415), $dot($yLine));
            if (isset($deducciones[$i])) {
                $ded = $deducciones[$i];
                $fontDeduccion = $fontForLabel(strlen($ded['label']));
                $cellText(410, $yCellTop, 218, $lh, $fontDeduccion, $ded['label'], 'L');
                $cellText(660, $yCellTop, 182, $lh, $f16, '-$ ' . money($ded['monto']), 'C');
            }
            $pdf->Line($dot(415), $dot($yLine), $dot(822), $dot($yLine));
            $currentY += $lh;
            $row++;
        } else {
            // Salto de página para continuaciones
            if ($row >= $maxRowsPrimeraHoja && $i == $maxRowsPrimeraHoja) {
                $numRowsContinuacion = min($maxRowsContinuacion, $maxConceptos - $i);
                $alturaContenido = $numRowsContinuacion * $lh;
                $tableTop = $yInicioCeldasContinuacion;
                $pdf->AddPage();
                $pdf->SetLineWidth($dot(2));
                $pdf->Rect($dot(10), $dot(10), $dot(812), $dot(386));
                $textB(18, 22, $pt(20), $clave . ' ' . $nombre);
                $text(700, 22, $f18, 'SEM ' . $semana);
                $pdf->SetLineWidth($dot(1));
                $pdf->Line($dot(10), $dot(50), $dot(10 + 812), $dot(50));
                $pdf->Line($dot(286), $dot($tableTop), $dot(286), $dot($tableTop + $alturaContenido));
                $pdf->Line($dot(700), $dot($tableTop), $dot(700), $dot($tableTop + $alturaContenido));
                $pdf->SetLineWidth($dot(2));
                $pdf->Line($dot(415), $dot($tableTop), $dot(415), $dot($tableTop + $alturaContenido));
                $currentY = $tableTop + $textYOffset;
                $row = 0;
            } elseif ($row > 0 && $row % $maxRowsContinuacion == 0 && $i > $maxRowsPrimeraHoja) {
                $numRowsContinuacion = min($maxRowsContinuacion, $maxConceptos - $i);
                $alturaContenido = $numRowsContinuacion * $lh;
                $tableTop = $yInicioCeldasContinuacion;
                $pdf->AddPage();
                $pdf->SetLineWidth($dot(2));
                $pdf->Rect($dot(10), $dot(10), $dot(812), $dot(386));
                $textB(18, 22, $pt(20), $clave . ' ' . $nombre);
                $text(700, 22, $f18, 'SEM ' . $semana);
                $pdf->SetLineWidth($dot(1));
                $pdf->Line($dot(10), $dot(50), $dot(10 + 812), $dot(50));
                $pdf->Line($dot(250), $dot($tableTop), $dot(250), $dot($tableTop + $alturaContenido));
                $pdf->Line($dot(640), $dot($tableTop), $dot(640), $dot($tableTop + $alturaContenido));
                $pdf->SetLineWidth($dot(2));
                $pdf->Line($dot(415), $dot($tableTop), $dot(415), $dot($tableTop + $alturaContenido));
                $currentY = $tableTop + $textYOffset;
                $row = 0;
            }
            $yCellTop = ($tableTop + ($row * $lh)) + 16;
            if (isset($percepciones[$i])) {
                $concepto = $percepciones[$i];
                $fontConcepto = $fontForLabel(strlen($concepto['label']));
                $cellText(9, $yCellTop, 170, $lh, $fontConcepto, $concepto['label'], 'L');
                $cellText(240, $yCellTop, 229, $lh, $f16, '$ ' . money($concepto['monto']), 'C');
            }
            $yLine = ($tableTop + (($row + 1) * $lh));
            $pdf->Line($dot(10), $dot($yLine), $dot(415), $dot($yLine));
            if (isset($deducciones[$i])) {
                $ded = $deducciones[$i];
                $fontDeduccion = $fontForLabel(strlen($ded['label']));
                $cellText(410, $yCellTop, 218, $lh, $fontDeduccion, $ded['label'], 'L');
                $cellText(660, $yCellTop, 182, $lh, $f16, '-$ ' . money($ded['monto']), 'C');
            }
            $pdf->Line($dot(415), $dot($yLine), $dot(822), $dot($yLine));
            $currentY += $lh;
            $row++;
        }
    }

    // ─── Totales y Neto ─────────────────────────────────────────────
    $enContinuacion = ($maxConceptos > $maxRowsPrimeraHoja);
    $conceptosEnPaginaActual = $enContinuacion ? ($maxConceptos - $maxRowsPrimeraHoja) : $maxConceptos;

    if ($maxConceptos <= 9) {
        $yTotales = $currentY + 18;
        $pdf->SetLineWidth($dot(2));
        $pdf->Line($dot(10), $dot($yTotales), $dot(10 + 812), $dot($yTotales));
        $pdf->SetLineWidth($dot(1));
        if ($maxConceptos <= 8) {
            $fontTotales = $pt(16);
            $fontNeto    = $pt(22);
            $alturaCelda = 37;
            $offsetTexto = 13;
            $offsetNeto  = 43;
        } else {
            $fontTotales = $pt(18);
            $fontNeto    = $pt(17);
            $alturaCelda = 30;
            $offsetTexto = 8;
            $offsetNeto  = 31;
        }
        $text(18,  $yTotales + $offsetTexto, $fontTotales, 'Total Percepciones');
        $text(310, $yTotales + $offsetTexto, $fontTotales, '$' . money($totalPercepciones));
        $text(430, $yTotales + $offsetTexto, $fontTotales, 'Total Deducciones');
        $text(690, $yTotales + $offsetTexto, $fontTotales, '-$');
        $text(710, $yTotales + $offsetTexto, $fontTotales, money($totalDeduccionesCalculado));
        $pdf->Line($dot(415), $dot($yTotales), $dot(415), $dot($yTotales + $alturaCelda));
        $pdf->Line($dot(10), $dot($yTotales + $alturaCelda), $dot(10 + 812), $dot($yTotales + $alturaCelda));
        $textB(18,  $yTotales + $offsetNeto, $fontNeto, 'Neto a pagar');
        $textB(200, $yTotales + $offsetNeto, $fontNeto, '$');
        $textB(240, $yTotales + $offsetNeto, $fontNeto, money($neto));
    } elseif ($enContinuacion && $conceptosEnPaginaActual <= 11) {
        $yTotales = $currentY + 2;
        $fontTotales = ($conceptosEnPaginaActual <= 10) ? $pt(16) : $pt(15);
        $fontNeto    = ($conceptosEnPaginaActual <= 10) ? $pt(22) : $pt(14);
        $pdf->SetLineWidth($dot(2));
        $pdf->Line($dot(10), $dot($yTotales), $dot(10 + 812), $dot($yTotales));
        $pdf->SetLineWidth($dot(1));
        $pdf->SetFont('helvetica', '', $fontTotales);
        $pdf->Text($dot(18),  $dot($yTotales + 9), 'Total Percepciones');
        $pdf->Text($dot(305), $dot($yTotales + 9), '$' . money($totalPercepciones));
        $pdf->Text($dot(430), $dot($yTotales + 9), 'Total Deducciones');
        $pdf->Text($dot(710), $dot($yTotales + 9), '-$' . money($totalDeduccionesCalculado));
        $pdf->Line($dot(415), $dot($yTotales), $dot(415), $dot($yTotales + 28));
        $pdf->Line($dot(10), $dot($yTotales + 28), $dot(10 + 812), $dot($yTotales + 28));
        $pdf->SetFont('helvetica', 'B', $fontNeto);
        $pdf->Text($dot(18),  $dot($yTotales + 30), 'Neto a pagar');
        $pdf->Text($dot(200), $dot($yTotales + 30), '$');
        $pdf->Text($dot(240), $dot($yTotales + 30), money($neto));
    } else {
        $yTotales = $currentY + 20;
        $minYTotales = $y0 + (4 * $lh) + 20;
        if ($yTotales < $minYTotales) $yTotales = $minYTotales;
        $maxY = 317;
        if ($yTotales > $maxY) {
            $pdf->AddPage('L', [50.8, 104]);
            $pdf->SetLineWidth($dot(2));
            $pdf->Rect($dot(10), $dot(10), $dot(812), $dot(386));
            $textB(18, 22, $pt(20), $clave . ' ' . $nombre);
            $yTotales = 50;
        }
        $pdf->SetLineWidth($dot(2));
        $pdf->Line($dot(10), $dot($yTotales), $dot(10 + 812), $dot($yTotales));
        $pdf->SetLineWidth($dot(1));
        $text(18,  $yTotales + 10, $f18, 'Total Percepciones');
        $text(210, $yTotales + 10, $f18, '$' . money($totalPercepciones));
        $text(430, $yTotales + 10, $f18, 'Total Deducciones');
        $text(710, $yTotales + 10, $f18, '-$' . money($totalDeduccionesCalculado));
        $pdf->Line($dot(415), $dot($yTotales), $dot(415), $dot($yTotales + 42));
        $pdf->Line($dot(10), $dot($yTotales + 42), $dot(10 + 812), $dot($yTotales + 42));
        $textB(18,  $yTotales + 59, $f22, 'Neto a pagar');
        $textB(200, $yTotales + 59, $f22, '$');
        $textB(240, $yTotales + 59, $f22, money($neto));
    }
}

// ─── Leer y validar entrada ──────────────────────────────────────────
$raw  = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!$data) {
    http_response_code(400);
    echo 'Solicitud inválida: No se recibieron datos JSON.';
    exit;
}

// Determinar si es una selección individual o el proceso normal
if (isset($data['seleccion']) && $data['seleccion'] === true) {
    $empleados = $data['empleados'] ?? [];
    $meta = $data['meta'] ?? ['numero_semana' => ''];
} elseif (isset($data['empleados']) && is_array($data['empleados'])) {
    $empleados = $data['empleados'] ?? [];
    $meta = $data['meta'] ?? ['numero_semana' => ''];
} else {
    if (!isset($data['nomina']) || !is_array($data['nomina'])) {
        http_response_code(400);
        echo 'Solicitud inválida: Estructura de nómina no encontrada.';
        exit;
    }

    $nomina = $data['nomina'];
    $meta   = $data['meta'] ?? ['numero_semana' => ''];

    $empleadosRaw = [];
    foreach (($nomina['departamentos'] ?? []) as $depto) {
        foreach (($depto['empleados'] ?? []) as $emp) {
            if (is_array($emp)) {
                $emp['departamento'] = $depto['nombre'] ?? '';
                $empleadosRaw[] = $emp;
            }
        }
    }

    $empleados = [];
    $mapConsolidacion = [];

    foreach ($empleadosRaw as $emp) {
        $depto = strtoupper($emp['departamento'] ?? '');
        $nombre = trim($emp['nombre'] ?? '');

        if ($depto === 'CORTE' || $depto === 'PODA') {
            $key = $depto . '|' . $nombre;
            if (!isset($mapConsolidacion[$key])) {
                $mapConsolidacion[$key] = $emp;
                if ($depto === 'CORTE') {
                    $mapConsolidacion[$key]['rejasArray'] = [];
                    $mapConsolidacion[$key]['nominaArray'] = [];
                } elseif ($depto === 'PODA') {
                    $mapConsolidacion[$key]['movsArray'] = [];
                }
            }

            if ($depto === 'CORTE') {
                $conceptoEmp = strtoupper($emp['concepto'] ?? '');
                if ($conceptoEmp === 'REJA' && isset($emp['tickets'])) {
                    foreach ($emp['tickets'] as $t) {
                        $mapConsolidacion[$key]['rejasArray'][] = ['ticket' => $t, 'precio' => $t['precio_reja'] ?? 0];
                    }
                } elseif ($conceptoEmp === 'NOMINA' && isset($emp['nomina'])) {
                    $mapConsolidacion[$key]['nominaArray'] = array_merge($mapConsolidacion[$key]['nominaArray'], $emp['nomina']);
                }
            } elseif ($depto === 'PODA') {
                if (isset($emp['movimientos'])) {
                    $movsPoda = array_filter($emp['movimientos'], function($m) {
                        return (strtoupper($m['concepto'] ?? '') === 'PODA');
                    });
                    if (!empty($movsPoda)) {
                        $mapConsolidacion[$key]['movsArray'] = array_merge($mapConsolidacion[$key]['movsArray'], $movsPoda);
                    }

                    $movsExtras = array_filter($emp['movimientos'], function($m) {
                        return (strtoupper($m['concepto'] ?? '') !== 'PODA');
                    });
                    if (!empty($movsExtras)) {
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

    foreach ($mapConsolidacion as $key => $consolidado) {
        $partes = explode('|', $key);
        $depto = $partes[0];

        if ($depto === 'CORTE') {
            $totalRejas = 0; $efectivoRejas = 0; $preciosUnicos = [];
            $diasConCorte = [];

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

                if ($cantT > 0 && isset($r['ticket']['fecha'])) {
                    $dia = obtenerDiaSemanaDesdeFechaPhp($r['ticket']['fecha']);
                    if ($dia) $diasConCorte[$dia] = true;
                }
            }

            $diasTrabajados = 0; $totalNomina = 0; $preciosPorDia = [];
            $hayDiasConCorte = !empty($diasConCorte);
            foreach ($consolidado['nominaArray'] as $n) {
                $nombreDia = normalizarDiaNominaPhp($n['dia'] ?? '');
                $pago = toNumber($n['pago'] ?? 0);
                if ($pago > 0 && (!$hayDiasConCorte || !empty($diasConCorte[$nombreDia]))) {
                    $totalNomina += $pago;
                    $diasTrabajados++;
                    $preciosPorDia[] = $pago;
                }
            }

            $subtotal = $efectivoRejas + $totalNomina;
            $consolidado['totalRejas'] = $totalRejas;
            $consolidado['efectivoRejas'] = $efectivoRejas;
            $consolidado['preciosUnicos'] = $preciosUnicos;
            $consolidado['diasTrabajados'] = $diasTrabajados;
            $consolidado['totalNomina'] = $totalNomina;
            $consolidado['preciosPorDia'] = $preciosPorDia;
            $consolidado['subtotal'] = $subtotal;
            $consolidado['redondeo'] = round($subtotal) - $subtotal;
            $consolidado['totalEfectivo'] = round($subtotal);

        } elseif ($depto === 'PODA') {
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
            continue;
        }

        $empleados[] = $consolidado;
    }
}

// ─── Generar el PDF ──────────────────────────────────────────────────
if (empty($empleados)) {
    http_response_code(400);
    echo 'No hay empleados para generar tickets.';
    exit;
}

// Crear PDF (Formato continuo 4x2 pulgadas por ticket)
$pdf = new \TCPDF('L', 'mm', [50.8, 104], true, 'UTF-8', false);
$pdf->SetCreator('SISTEMA SAAO');
$pdf->SetAuthor('SISTEMA SAAO');
$pdf->SetTitle('Tickets de Nómina Palmilla');
$pdf->SetMargins(0, 0, 0);
$pdf->SetAutoPageBreak(false, 0);
$pdf->setPrintHeader(false);
$pdf->setPrintFooter(false);

foreach ($empleados as $emp) {
    $depto = strtoupper($emp['departamento'] ?? '');
    $esExtraPoda = isset($emp['esExtraPoda']) && $emp['esExtraPoda'] === true;

    if ($esExtraPoda) {
        $pdf->AddPage();
        renderTicketExtraSimplificadoPdf($pdf, $emp, $meta);
    } elseif ($depto === 'CORTE') {
        $pdf->AddPage();
        renderTicketCortePdf($pdf, $emp, $meta);
    } elseif ($depto === 'PODA') {
        $pdf->AddPage();
        renderTicketPodaPdf($pdf, $emp, $meta);
    } else {
    // Nómina normal (flujo original)
    $clave = (string)($emp['clave'] ?? '');
    $id_empresa = isset($emp['id_empresa']) ? intval($emp['id_empresa']) : 1;
    
    // Obtener datos extras de la BD si es necesario
    $extra = [
        'nombre_puesto'  => $emp['puesto'] ?? '',
        'fecha_alta_empresa'  => $emp['fecha_alta_empresa'] ?? '',
        'salario_semanal' => $emp['salario_semanal'] ?? 0,
        'salario_diario'  => $emp['salario_diario'] ?? 0
    ];

    if ($clave !== '') {
        $sql = "SELECT p.nombre_puesto, e.fecha_alta_empresa, e.salario_semanal, e.salario_diario 
                FROM info_empleados e 
                JOIN puestos_especiales p ON e.id_puestoEspecial = p.id_puestoEspecial 
                WHERE e.clave_empleado = ? AND e.id_empresa = ? AND e.id_status = 1";
        $stmt = $conexion->prepare($sql);
        $stmt->bind_param("si", $clave, $id_empresa);
        $stmt->execute();
        $stmt->bind_result($nombre_puesto, $fecha_alta_empresa, $salario_semanal, $salario_diario);
        if ($stmt->fetch()) {
            $extra = [
                'nombre_puesto'  => $nombre_puesto,
                'fecha_alta_empresa'  => $fecha_alta_empresa,
                'salario_semanal' => $salario_semanal,
                'salario_diario'  => $salario_diario
            ];
        }
        $stmt->close();
    }

    $pdf->AddPage();
    renderTicketPdf($pdf, $emp, $extra, $meta);
    }
}

// Limpiar cualquier salida previa que pueda corromper el PDF
if (ob_get_length()) ob_clean();

header('Content-Type: application/pdf');
header('Content-Disposition: attachment; filename="tickets_palmilla.pdf"');
header('Cache-Control: private, max-age=0, must-revalidate');
header('Pragma: public');

echo $pdf->Output('tickets_palmilla.pdf', 'S');
