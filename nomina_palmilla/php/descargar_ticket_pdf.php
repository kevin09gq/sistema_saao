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
    $nombre     = safeText($emp['nombre'] ?? '');
    $clave      = safeText($emp['clave'] ?? '');

    // Departamento del JSON (eliminar número inicial)
    $departamento = safeText($emp['departamento'] ?? '');
    $departamento = preg_replace('/^\d+\s*/', '', $departamento);

    $puesto      = safeText($extra['nombre_puesto'] ?? '');
    $fechaIngreso = safeText($extra['fecha_ingreso'] ?? '');
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
    
    // Aplicar redondeo como en nomina_confianza
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
    // Agregar deducciones extra individuales excepto F.A/GAFET/COFIA
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
        // No sumar F.A/GAFET/COFIA
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

    $deptoFontSize = 19;
    $text(310, 20, $pt($deptoFontSize), $departamento);
    $text(551, 22, $pt(17), 'F.Ingr: ' . $fechaIngreso);
    $text(710, 20, $pt(18), 'SEM ' . $semana);

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
    $textB(100, 78, $f20, 'PERCEPCIONES');
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
    $yInicioCeldasContinuacion = 52;
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
            $yCellTop = ($tableTop + ($row * $lh)) + 18;
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
                $pdf->Rect($dot(10), $dot(12), $dot(812), $dot(386));
                $textB(18, 24, $pt(20), $clave . ' ' . $nombre);
                $text(700, 24, $f18, 'SEM ' . $semana);
                $pdf->SetLineWidth($dot(1));
                $pdf->Line($dot(10), $dot(54), $dot(10 + 812), $dot(54));
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
                $pdf->Rect($dot(10), $dot(12), $dot(812), $dot(386));
                $textB(18, 24, $pt(20), $clave . ' ' . $nombre);
                $text(700, 24, $f18, 'SEM ' . $semana);
                $pdf->SetLineWidth($dot(1));
                $pdf->Line($dot(10), $dot(54), $dot(10 + 812), $dot(54));
                $pdf->Line($dot(250), $dot($tableTop), $dot(250), $dot($tableTop + $alturaContenido));
                $pdf->Line($dot(640), $dot($tableTop), $dot(640), $dot($tableTop + $alturaContenido));
                $pdf->SetLineWidth($dot(2));
                $pdf->Line($dot(415), $dot($tableTop), $dot(415), $dot($tableTop + $alturaContenido));
                $currentY = $tableTop + $textYOffset;
                $row = 0;
            }
            $yCellTop = ($tableTop + ($row * $lh)) + 18;
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
            $pdf->Rect($dot(10), $dot(12), $dot(812), $dot(386));
            $textB(18, 24, $pt(20), $clave . ' ' . $nombre);
            $yTotales = 52;
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

// Verificar si es una solicitud de empleados seleccionados
$empleadosSeleccionados = isset($_POST['empleados_seleccionados']) && $_POST['empleados_seleccionados'] === 'true';

if ($empleadosSeleccionados && isset($_POST['datos_json'])) {
    // Procesar datos de empleados seleccionados
    $datosSeleccionados = json_decode($_POST['datos_json'], true);
    
    if (!is_array($datosSeleccionados) || !isset($datosSeleccionados['empleados_seleccionados'])) {
        http_response_code(400);
        header('Content-Type: text/plain; charset=UTF-8');
        echo 'Datos de selección inválidos.';
        exit;
    }
    
    $empleados = $datosSeleccionados['empleados_seleccionados'];
    $meta = $datosSeleccionados['metadatos'] ?? ['numero_semana' => ''];
} else {
    // Procesar solicitud normal (todos los empleados)
    if (!is_array($data) || !isset($data['nomina']) || !is_array($data['nomina'])) {
        http_response_code(400);
        header('Content-Type: text/plain; charset=UTF-8');
        echo 'Solicitud inválida.';
        exit;
    }

    $nomina = $data['nomina'];
    $meta   = $data['meta'] ?? ['numero_semana' => ''];

    // ─── Recolectar empleados de todos los departamentos ─────────────────
    $empleados = [];
    foreach (($nomina['departamentos'] ?? []) as $depto) {
        $nombreDepto = $depto['nombre'] ?? '';
        foreach (($depto['empleados'] ?? []) as $emp) {
            if (is_array($emp)) {
                $emp['departamento'] = $nombreDepto;
                $empleados[] = $emp;
            }
        }
    }

    usort($empleados, function ($a, $b) {
        return strcasecmp((string)($a['nombre'] ?? ''), (string)($b['nombre'] ?? ''));
    });
}

// ─── Consultar info adicional desde BD ───────────────────────────────
$claves = [];
foreach ($empleados as $e) {
    if (isset($e['clave']) && $e['clave'] !== '') {
        $claves[] = $e['clave'];
    }
}
$claves = array_values(array_unique(array_filter($claves)));

$extraMap = [];
if (count($claves) > 0) {
    $placeholders = implode(',', array_fill(0, count($claves), '?'));
    $sql = "SELECT e.clave_empleado, e.imss, e.rfc_empleado, e.fecha_ingreso,
                   e.salario_diario, e.salario_semanal,
                   p.nombre_puesto, d.nombre_departamento
            FROM info_empleados e
            LEFT JOIN puestos_especiales p ON e.id_puestoEspecial = p.id_puestoEspecial
            LEFT JOIN departamentos d ON e.id_departamento = d.id_departamento
            WHERE e.clave_empleado IN ($placeholders)";

    $stmt = mysqli_prepare($conexion, $sql);
    if ($stmt) {
        $types  = str_repeat('s', count($claves));
        $params = [&$types];
        foreach ($claves as $k => $v) {
            $params[] = &$claves[$k];
        }
        call_user_func_array([$stmt, 'bind_param'], $params);
        mysqli_stmt_execute($stmt);
        $res = mysqli_stmt_get_result($stmt);
        if ($res) {
            while ($row = mysqli_fetch_assoc($res)) {
                $extraMap[$row['clave_empleado']] = [
                    'imss'              => $row['imss'] ?? '',
                    'rfc_empleado'      => $row['rfc_empleado'] ?? '',
                    'fecha_ingreso'     => $row['fecha_ingreso'] ?? '',
                    'nombre_puesto'     => $row['nombre_puesto'] ?? '',
                    'salario_diario'    => $row['salario_diario'] ?? 0,
                    'salario_semanal'   => $row['salario_semanal'] ?? 0,
                    'nombre_departamento' => $row['nombre_departamento'] ?? ''
                ];
            }
        }
        mysqli_stmt_close($stmt);
    }
}

// ─── Generar PDF ─────────────────────────────────────────────────────
$pdf = new TCPDF('L', 'mm', [50.8, 104], true, 'UTF-8', false);
$pdf->SetCreator('Sistema SAAO');
$pdf->SetAuthor('Sistema SAAO');
$pdf->SetTitle('Tickets Palmilla');
$pdf->SetSubject('Tickets Nómina Palmilla');
$pdf->setPrintHeader(false);
$pdf->setPrintFooter(false);
$pdf->SetAutoPageBreak(false, 0);
$pdf->SetMargins(0, 0, 0);
$pdf->SetFont('helvetica', '', 8);

foreach ($empleados as $emp) {
    $pdf->AddPage('L', [50.8, 104]);
    $clave = $emp['clave'] ?? '';
    $extra = ($clave !== '' && isset($extraMap[$clave])) ? $extraMap[$clave] : [];
    renderTicketPdf($pdf, $emp, $extra, $meta);
}

$sem      = $meta['numero_semana'] ? ('_sem_' . preg_replace('/[^0-9A-Za-z_-]/', '', (string)$meta['numero_semana'])) : '';
$filename = 'tickets_palmilla' . $sem . '.pdf';

if (function_exists('ob_get_length') && ob_get_length()) {
    @ob_end_clean();
}

header('Content-Type: application/pdf');
header('Content-Disposition: attachment; filename="' . $filename . '"');
$pdf->Output($filename, 'D');
