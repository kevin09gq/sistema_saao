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

function redondear($numero) {
    return round((float)$numero, 0, PHP_ROUND_HALF_UP);
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
    $fechaIngreso = safeText($extra['fecha_ingreso'] ?? ($emp['fecha_ingreso'] ?? ''));
    $fechaIngreso = str_replace('-', '/', $fechaIngreso);

    $sueldoSemanal = toNumber($emp['salario_semanal'] ?? ($extra['salario_semanal'] ?? 0));
    $salarioDiario = toNumber($extra['salario_diario'] ?? ($emp['salario_diario'] ?? 0));

    $extras = toNumber($emp['sueldo_extra_total'] ?? 0);
    $pasaje = toNumber($emp['pasaje'] ?? 0);
    $comida = toNumber($emp['comida'] ?? 0);
    $vacaciones = toNumber($emp['vacaciones'] ?? 0);

    $conceptos = is_array($emp['conceptos'] ?? null) ? $emp['conceptos'] : [];
    $getConcepto = function ($codigo) use ($conceptos) {
        foreach ($conceptos as $c) {
            if ((string)($c['codigo'] ?? '') === (string)$codigo) return toNumber($c['resultado'] ?? 0);
        }
        return 0.0;
    };

    $isr = $getConcepto('45');
    $imssDed = $getConcepto('52');
    $infonavit = $getConcepto('16');
    $ajusteSub = $getConcepto('107');

    $retardos = toNumber($emp['retardos'] ?? 0);
    $permiso = toNumber($emp['permiso'] ?? 0);
    $inasistencia = toNumber($emp['inasistencia'] ?? 0);
    $uniformes = toNumber($emp['uniformes'] ?? 0);
    $checador = toNumber($emp['checador'] ?? 0);
    $faGafet = toNumber($emp['fa_gafet_cofia'] ?? 0);
    $prestamo = toNumber($emp['prestamo'] ?? 0);
    $tarjeta = toNumber($emp['tarjeta'] ?? 0);

    $percepciones_extra = is_array($emp['percepciones_extra'] ?? null) ? $emp['percepciones_extra'] : [];
    $totalPercepcionesTemp = $sueldoSemanal + $extras + $pasaje + $comida + $vacaciones;
    foreach ($percepciones_extra as $pe) $totalPercepcionesTemp += toNumber($pe['cantidad'] ?? 0);
    
    $totalDeduccionesTemp = $isr + $imssDed + $infonavit + $ajusteSub + $retardos + $permiso + $inasistencia + $uniformes + $checador + $faGafet + $prestamo + $tarjeta;
    
    $neto = (isset($emp['total_cobrar']) && toNumber($emp['total_cobrar']) != 0) ? toNumber($emp['total_cobrar']) : ($totalPercepcionesTemp - $totalDeduccionesTemp);
    
    $netoOriginal = $neto;
    $netoRedondeado = redondear($netoOriginal);
    $ajusteRedondeo = round($netoRedondeado - $netoOriginal, 2);
    if (!empty($emp['redondeo_activo']) && isset($emp['redondeo'])) $ajusteRedondeo = round(toNumber($emp['redondeo']), 2);
    $neto = $netoRedondeado;

    $percepciones = []; $conceptoNum = 1;
    if ($sueldoSemanal > 0) $percepciones[] = ['label' => $conceptoNum++ . ' Sueldo semanal', 'monto' => $sueldoSemanal];
    
    // Desglose de percepciones extras (En lugar de poner solo "Extras")
    foreach ($percepciones_extra as $pe) {
        $m = toNumber($pe['cantidad'] ?? 0);
        if ($m > 0) $percepciones[] = ['label' => $conceptoNum++ . ' ' . safeText($pe['nombre'] ?? ''), 'monto' => $m];
    }

    if ($comida > 0) $percepciones[] = ['label' => $conceptoNum++ . ' Comida', 'monto' => $comida];
    if ($pasaje > 0) $percepciones[] = ['label' => $conceptoNum++ . ' Pasaje', 'monto' => $pasaje];
    if ($vacaciones > 0) $percepciones[] = ['label' => $conceptoNum++ . ' Vacaciones', 'monto' => $vacaciones];
    if ($ajusteRedondeo > 0) $percepciones[] = ['label' => $conceptoNum++ . ' Redondeo', 'monto' => $ajusteRedondeo];

    $deducciones = [];
    if ($isr > 0) $deducciones[] = ['label' => 'ISR', 'monto' => $isr];
    if ($imssDed > 0) $deducciones[] = ['label' => 'IMSS', 'monto' => $imssDed];
    if ($infonavit > 0) $deducciones[] = ['label' => 'INFONAVIT', 'monto' => $infonavit];
    if ($ajusteSub > 0) $deducciones[] = ['label' => 'Ajuste al Sub', 'monto' => $ajusteSub];
    if ($retardos > 0) $deducciones[] = ['label' => 'Retardos', 'monto' => $retardos];
    if ($permiso > 0) $deducciones[] = ['label' => 'Permisos', 'monto' => $permiso];
    if ($inasistencia > 0) $deducciones[] = ['label' => 'Ausentismo', 'monto' => $inasistencia];
    if ($uniformes > 0) $deducciones[] = ['label' => 'Uniformes', 'monto' => $uniformes];
    if ($checador > 0) $deducciones[] = ['label' => 'Checador', 'monto' => $checador];
    
    // Desglose de deducciones extras (En lugar de poner "F.A/Gafet/Cofia")
    $deducciones_extra = is_array($emp['deducciones_extra'] ?? null) ? $emp['deducciones_extra'] : [];
    foreach ($deducciones_extra as $de) {
        $m = toNumber($de['cantidad'] ?? 0);
        if ($m > 0) $deducciones[] = ['label' => safeText($de['nombre'] ?? ''), 'monto' => $m];
    }

    if ($prestamo > 0) $deducciones[] = ['label' => 'Préstamo', 'monto' => $prestamo];
    if ($tarjeta > 0) $deducciones[] = ['label' => 'Tarjeta', 'monto' => $tarjeta];
    if ($ajusteRedondeo < 0) $deducciones[] = ['label' => 'Redondeo', 'monto' => abs($ajusteRedondeo)];

    $totalPercepciones = 0.0; foreach ($percepciones as $p) $totalPercepciones += toNumber($p['monto']);
    $totalDeducciones = 0.0; foreach ($deducciones as $d) $totalDeducciones += toNumber($d['monto']);

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
        // AJUSTE CRÍTICO: El Y se desplaza +5 dots y se usa 'T' para alineación superior.
        // Esto coloca el texto "bien adentro" de la celda de 26 dots sin tocar las líneas.
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
    $text(290, 47, $pt(18), 'Sal. diario: $ ' . money($salarioDiario));
    $text(530, 47, $pt(18), 'Sal. Semanal: $ ' . money($sueldoSemanal));

    $pdf->Line($dot(10), $dot(70), $dot(822), $dot(70));
    $diasTrabajados = safeText($emp['dias_trabajados'] ?? '0');
    $textB(13, 77, $pt(13), 'Días laborados: ');
    $textB(118, 75, $pt(17), $diasTrabajados);
    $textB(150, 78, $pt(20), 'PERCEPCIONES');
    $textB(520, 78, $pt(20), 'DEDUCCIONES');
    $pdf->Line($dot(10), $dot(107), $dot(822), $dot(107));

    $lh = 26; $tableTop = 107;
    $maxConceptos = max(count($percepciones), count($deducciones));
    $maxRowsPrimeraHoja = 11; $maxRowsContinuacion = 13; $yInicioContinuacion = 50;

    $fontForLabel = function ($len) use ($pt) {
        if ($len >= 50) return $pt(10);
        if ($len >= 45) return $pt(11);
        if ($len >= 40) return $pt(12);
        if ($len >= 35) return $pt(13);
        if ($len >= 30) return $pt(14);
        return $pt(16);
    };

    $row = 0; $currentY = $tableTop;
    for ($i = 0; $i < $maxConceptos; $i++) {
        if ($i >= $maxRowsPrimeraHoja && ($i - $maxRowsPrimeraHoja) % $maxRowsContinuacion === 0) {
            $pdf->AddPage();
            $pdf->SetLineWidth($dot(2)); $pdf->Rect($dot(10), $dot(12), $dot(812), $dot(386));
            $textB(12, 22, $pt(15), $clave . ' ' . $nombre);
            $text(710, 20, $pt(18), 'SEM ' . safeText($meta['numero_semana'] ?? ''));
            $pdf->SetLineWidth($dot(1)); $pdf->Line($dot(10), $dot(42), $dot(822), $dot(42));
            $tableTop = $yInicioContinuacion; $row = 0;
        }

        $y = $tableTop + ($row * $lh);
        $f16 = $pt(16);

        if (isset($percepciones[$i])) {
            $fontConcepto = $fontForLabel(strlen($percepciones[$i]['label']));
            $cellText(9, $y, 170, $lh, $fontConcepto, $percepciones[$i]['label'], 'L');
            $cellText(240, $y, 229, $lh, $f16, '$ ' . money($percepciones[$i]['monto']), 'C');
        }
        if (isset($deducciones[$i])) {
            $fontDeduccion = $fontForLabel(strlen($deducciones[$i]['label']));
            $cellText(410, $y, 218, $lh, $fontDeduccion, $deducciones[$i]['label'], 'L');
            $cellText(660, $y, 182, $lh, $f16, '-$ ' . money($deducciones[$i]['monto']), 'C');
        }

        $pdf->SetLineWidth($dot(1));
        $pdf->Line($dot(10), $dot($y + $lh), $dot(822), $dot($y + $lh));
        $pdf->SetLineWidth($dot(2));
        $pdf->Line($dot(415), $dot($tableTop), $dot(415), $dot($y + $lh));
        $currentY = $y + $lh; $row++;
    }

    $yTotales = $currentY + 18;
    if ($yTotales > 340) {
        $pdf->AddPage();
        $pdf->SetLineWidth($dot(2)); $pdf->Rect($dot(10), $dot(10), $dot(812), $dot(386));
        $textB(18, 22, $pt(20), $clave . ' ' . $nombre);
        $yTotales = 50;
    }

    $pdf->SetLineWidth($dot(2));
    $pdf->Line($dot(10), $dot($yTotales), $dot(822), $dot($yTotales));
    $pdf->SetLineWidth($dot(1));
    $text(18, $yTotales + 13, $pt(16), 'Total Percepciones');
    $text(310, $yTotales + 13, $pt(16), '$' . money($totalPercepciones));
    $text(430, $yTotales + 13, $pt(16), 'Total Deducciones');
    $text(710, $yTotales + 13, $pt(16), '-$' . money($totalDeducciones));
    $pdf->Line($dot(415), $dot($yTotales), $dot(415), $dot($yTotales + 37));
    $pdf->Line($dot(10), $dot($yTotales + 37), $dot(822), $dot($yTotales + 37));
    $textB(18, $yTotales + 43, $pt(22), 'Neto a pagar');
    $textB(200, $yTotales + 43, $pt(22), '$');
    $textB(240, $yTotales + 43, $pt(22), money($neto));
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
        $pdf->AddPage();
        renderTicketCortePdf($pdf, $emp, $meta);
    } elseif ($depto === 'PODA') {
        $pdf->AddPage();
        renderTicketPodaPdf($pdf, $emp, $meta);
    } else {
        $clave = (string)($emp['clave'] ?? ''); $id_empresa = isset($emp['id_empresa']) ? intval($emp['id_empresa']) : 1;
        $extra = ['nombre_puesto' => $emp['puesto'] ?? '', 'fecha_ingreso' => $emp['fecha_ingreso'] ?? '', 'salario_semanal' => $emp['salario_semanal'] ?? 0, 'salario_diario' => $emp['salario_diario'] ?? 0, 'nombre_departamento' => $emp['departamento'] ?? ''];
        if ($clave !== '') {
            $sql = "SELECT p.nombre_puesto, e.fecha_ingreso, e.salario_semanal, e.salario_diario, d.nombre_departamento 
                    FROM info_empleados e 
                    JOIN puestos_especiales p ON e.id_puestoEspecial = p.id_puestoEspecial 
                    JOIN departamentos d ON e.id_departamento = d.id_departamento
                    WHERE e.clave_empleado = ? AND e.id_empresa = ? AND e.id_status = 1";
            $stmt = $conexion->prepare($sql); $stmt->bind_param("si", $clave, $id_empresa); $stmt->execute();
            $stmt->bind_result($np, $fi, $ss, $sd, $nd); if ($stmt->fetch()) $extra = ['nombre_puesto' => $np, 'fecha_ingreso' => $fi, 'salario_semanal' => $ss, 'salario_diario' => $sd, 'nombre_departamento' => $nd];
            $stmt->close();
        }
        $pdf->AddPage();
        renderTicketPdf($pdf, $emp, $extra, $meta);
    }
}

if (ob_get_length()) ob_clean();
header('Content-Type: application/pdf');
header('Content-Disposition: attachment; filename="tickets_pilar.pdf"');
echo $pdf->Output('tickets_pilar.pdf', 'S');
