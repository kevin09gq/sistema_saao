<?php
require_once __DIR__ . '/../../vendor/autoload.php';
require_once __DIR__ . '/../../conexion/conexion.php';

// ─── Helpers ─────────────────────────────────────────────────────────────────
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

// ─── Función principal de render del ticket ──────────────────────────────────
function renderTicketPdf(TCPDF $pdf, $emp, $extra, $meta) {
    $nombre      = safeText($emp['nombre']      ?? '');
    $clave       = safeText($emp['clave']       ?? '');
    $departamento = safeText($emp['departamento'] ?? '');
    $departamento = preg_replace('/^\d+\s*/', '', $departamento);

    $puesto      = safeText($extra['nombre_puesto'] ?? '');
    $fechaIngreso = safeText($extra['fecha_ingreso'] ?? '');
    $fechaIngreso = str_replace('-', '/', $fechaIngreso);

    $salarioDiario  = toNumber($extra['salario_diario']  ?? 0);
    $sueldoSemanal  = toNumber($emp['salario_semanal']   ?? 0);
    $semana         = safeText($meta['numero_semana']    ?? '');

    // ── Percepciones ────────────────────────────────────────────────────────
    $pasaje   = toNumber($emp['pasaje']   ?? 0);
    $comida   = toNumber($emp['comida']   ?? 0);
    $tardeada = toNumber($emp['tardeada'] ?? 0);

    // Percepciones adicionales del formulario
    $percepcionesAdicionales = is_array($emp['conceptos_adicionales'] ?? null)
        ? $emp['conceptos_adicionales'] : [];

    // ── Deducciones ─────────────────────────────────────────────────────────
    $retardos    = toNumber($emp['retardos']     ?? 0);
    $isr         = toNumber($emp['isr']          ?? 0);
    $imssDed     = toNumber($emp['imss_descuento'] ?? 0);
    $ajusteSub   = toNumber($emp['ajuste_sub']   ?? 0);
    $infonavit   = toNumber($emp['infonavit']    ?? 0);
    $permiso     = toNumber($emp['permiso']      ?? 0);
    $inasistencia = toNumber($emp['inasistencia'] ?? 0);
    $uniformes   = toNumber($emp['uniforme']     ?? ($emp['uniformes'] ?? 0));
    $checador    = toNumber($emp['checador']     ?? 0);
    $prestamo    = toNumber($emp['prestamo']     ?? 0);
    $tarjeta     = toNumber($emp['tarjeta']      ?? 0);

    // Deducciones adicionales del formulario
    $deduccionesAdicionales = [];
    if (isset($emp['conceptos']) && is_array($emp['conceptos'])) {
        foreach ($emp['conceptos'] as $c) {
            $nombreC = safeText($c['nombre'] ?? '');
            $valorC  = toNumber($c['resultado'] ?? 0);
            if ($valorC > 0 && $nombreC !== '') {
                $deduccionesAdicionales[] = ['label' => $nombreC, 'monto' => $valorC];
            }
        }
    }

    // ── Cálculo de neto y redondeo ─────────────────────────────────────────
    $totalPercepcionesTemp = $sueldoSemanal + $pasaje + $comida + $tardeada;
    foreach ($percepcionesAdicionales as $pa) {
        $totalPercepcionesTemp += toNumber($pa['valor'] ?? 0);
    }

    $totalDeduccionesTemp = $retardos + $isr + $imssDed + $ajusteSub + $infonavit
                          + $permiso + $inasistencia + $uniformes + $checador + $prestamo + $tarjeta;
    foreach ($deduccionesAdicionales as $da) {
        $totalDeduccionesTemp += toNumber($da['monto'] ?? 0);
    }

    $netoOriginal    = $totalPercepcionesTemp - $totalDeduccionesTemp;
    $netoRedondeado  = redondear($netoOriginal);
    $ajusteRedondeo  = round($netoRedondeado - $netoOriginal, 2);
    $neto            = $netoRedondeado;

    // ── Construir arreglos para el render ──────────────────────────────────
    $percepciones = [];
    $conceptoNum  = 1;

    if ($sueldoSemanal > 0) $percepciones[] = ['label' => $conceptoNum++ . ' Sueldo semanal', 'monto' => $sueldoSemanal];
    if ($pasaje        > 0) $percepciones[] = ['label' => $conceptoNum++ . ' Pasaje',         'monto' => $pasaje];
    if ($comida        > 0) $percepciones[] = ['label' => $conceptoNum++ . ' Comida',         'monto' => $comida];
    if ($tardeada      > 0) $percepciones[] = ['label' => $conceptoNum++ . ' Tardeada',       'monto' => $tardeada];

    foreach ($percepcionesAdicionales as $pa) {
        $nombrePa = safeText($pa['nombre'] ?? '');
        $valorPa  = toNumber($pa['valor']  ?? 0);
        if ($valorPa > 0 && $nombrePa !== '') {
            $percepciones[] = ['label' => $conceptoNum++ . ' ' . $nombrePa, 'monto' => $valorPa];
        }
    }

    // Calcular total percepciones base
    $totalPercepciones = 0.0;
    foreach ($percepciones as $p) {
        $totalPercepciones += toNumber($p['monto']);
    }

    // Agregar redondeo positivo en percepciones
    if ($ajusteRedondeo > 0) {
        $percepciones[]     = ['label' => $conceptoNum++ . ' Redondeo', 'monto' => $ajusteRedondeo];
        $totalPercepciones += $ajusteRedondeo;
    }

    $deducciones = [];
    if ($isr        > 0) $deducciones[] = ['label' => 'ISR',           'monto' => $isr];
    if ($imssDed    > 0) $deducciones[] = ['label' => 'IMSS',          'monto' => $imssDed];
    if ($infonavit  > 0) $deducciones[] = ['label' => 'INFONAVIT',     'monto' => $infonavit];
    if ($ajusteSub  > 0) $deducciones[] = ['label' => 'Ajuste al Sub', 'monto' => $ajusteSub];
    if ($retardos   > 0) $deducciones[] = ['label' => 'Retardos',      'monto' => $retardos];
    if ($permiso    > 0) $deducciones[] = ['label' => 'Permisos',      'monto' => $permiso];
    if ($inasistencia > 0) $deducciones[] = ['label' => 'Ausentismo',    'monto' => $inasistencia];
    if ($uniformes  > 0) $deducciones[] = ['label' => 'Uniforme',      'monto' => $uniformes];
    if ($checador   > 0) $deducciones[] = ['label' => 'Checador',      'monto' => $checador];
    if ($prestamo   > 0) $deducciones[] = ['label' => 'Préstamo',      'monto' => $prestamo];
    if ($tarjeta    > 0) $deducciones[] = ['label' => 'Tarjeta',       'monto' => $tarjeta];

    foreach ($deduccionesAdicionales as $da) {
        $deducciones[] = $da;
    }

    // Agregar redondeo negativo en deducciones
    if ($ajusteRedondeo < 0) {
        $deducciones[] = ['label' => 'Redondeo', 'monto' => abs($ajusteRedondeo)];
    }

    $totalDeduccionesCalculado = 0.0;
    foreach ($deducciones as $d) {
        $totalDeduccionesCalculado += toNumber($d['monto']);
    }

    // ── Funciones de dibujo ─────────────────────────────────────────────────
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

    $fontForLabel = function ($len) use ($pt) {
        if ($len >= 50) return $pt(10);
        if ($len >= 45) return $pt(11);
        if ($len >= 40) return $pt(12);
        if ($len >= 35) return $pt(13);
        if ($len >= 30) return $pt(14);
        return $pt(16);
    };

    // ── Encabezado ──────────────────────────────────────────────────────────
    $pdf->SetLineWidth($dot(2));
    $pdf->Rect($dot(10), $dot(10), $dot(812), $dot(386));

    $nombreCompleto = $clave . ' ' . $nombre;
    $nombreFontSize = strlen($nombreCompleto) > 35 ? 8 : (strlen($nombreCompleto) >= 31 ? 13 : 15);
    $textB(12, 20, $pt($nombreFontSize), $nombreCompleto);

    $text(310, 20, $pt(15), $departamento);
    $text(551, 20, $pt(17), 'F.Ingr: ' . $fechaIngreso);
    $text(710, 18, $pt(18), 'SEM ' . $semana);

    $pdf->SetLineWidth($dot(1));
    $pdf->Line($dot(10), $dot(40), $dot(10 + 812), $dot(40));
    $pdf->Line($dot(280), $dot(40), $dot(280), $dot(68));
    $pdf->Line($dot(520), $dot(40), $dot(520), $dot(68));

    // Puesto
    $lenPuesto = strlen($puesto);
    if      ($lenPuesto > 33) $puestoFontSize = 3.5;
    elseif  ($lenPuesto > 27) $puestoFontSize = 4.1;
    elseif  ($lenPuesto > 23) $puestoFontSize = 4.5;
    elseif  ($lenPuesto > 19) $puestoFontSize = 5;
    elseif  ($lenPuesto > 15) $puestoFontSize = 5.8;
    else                      $puestoFontSize = 6;
    $text(18, 49, $puestoFontSize, $puesto);
    $text(290, 45, $pt(18), 'Sal. diario: $ ' . money($salarioDiario));
    $text(530, 45, $pt(18), 'Sal. Semanal: $ ' . money($sueldoSemanal));

    $pdf->SetLineWidth($dot(1));
    $pdf->Line($dot(10), $dot(68), $dot(10 + 812), $dot(68));

    $f20 = $pt(20);
    $textB(100, 76, $f20, 'PERCEPCIONES');
    $textB(520, 76, $f20, 'DEDUCCIONES');

    $pdf->SetLineWidth($dot(1));
    $pdf->Line($dot(10), $dot(105), $dot(10 + 812), $dot(105));

    // ── Tabla de conceptos ─────────────────────────────────────────────────
    $y0                  = 90;
    $lh                  = 26;
    $maxConceptos        = max(count($percepciones), count($deducciones));
    $maxRowsPrimeraHoja  = 11;
    $maxRowsContinuacion = 13;
    $tableTopPrimeraHoja = 105;
    $textYOffset         = 8;

    if ($maxConceptos <= 9) {
        $numRowsPrimeraHoja         = $maxConceptos;
        $alturaContenidoPrimeraHoja = $numRowsPrimeraHoja * $lh;
        $f16  = $pt(16);
        $f18  = $pt(18);
        $f22  = $pt(22);
    } else {
        $numRowsPrimeraHoja         = min($maxRowsPrimeraHoja, $maxConceptos);
        $alturaContenidoPrimeraHoja = $numRowsPrimeraHoja * $lh;
        $f16  = $pt(16);
        $f18  = $pt(18);
        $f22  = $pt(22);
    }

    // Líneas verticales
    $pdf->SetLineWidth($dot(1));
    $pdf->Line($dot(305), $dot($tableTopPrimeraHoja), $dot(305), $dot($tableTopPrimeraHoja + $alturaContenidoPrimeraHoja));
    $pdf->Line($dot(700), $dot($tableTopPrimeraHoja), $dot(700), $dot($tableTopPrimeraHoja + $alturaContenidoPrimeraHoja));
    $pdf->SetLineWidth($dot(2));
    $pdf->Line($dot(415), $dot(106), $dot(415), $dot($tableTopPrimeraHoja + $alturaContenidoPrimeraHoja));

    $currentY = $y0;
    $row      = 0;
    $yInicioCeldasContinuacion = 50;
    $tableTop = $tableTopPrimeraHoja;

    for ($i = 0; $i < $maxConceptos; $i++) {
        if ($maxConceptos <= 9) {
            // Primera hoja con 9 o menos conceptos
            $yCellTop = ($tableTop + ($row * $lh)) + 16;

            if (isset($percepciones[$i])) {
                $concepto     = $percepciones[$i];
                $fontConcepto = $fontForLabel(strlen($concepto['label']));
                $cellText(9,   $yCellTop, 170, $lh, $fontConcepto, $concepto['label'], 'L');
                $cellText(240, $yCellTop, 229, $lh, $f16, '$ ' . money($concepto['monto']), 'C');
            }
            $yLine = ($tableTop + (($row + 1) * $lh));
            $pdf->Line($dot(10), $dot($yLine), $dot(415), $dot($yLine));

            if (isset($deducciones[$i])) {
                $ded          = $deducciones[$i];
                $fontDeduccion = $fontForLabel(strlen($ded['label']));
                $cellText(410, $yCellTop, 218, $lh, $fontDeduccion, $ded['label'], 'L');
                $cellText(660, $yCellTop, 182, $lh, $f16, '-$ ' . money($ded['monto']), 'C');
            }
            $pdf->Line($dot(415), $dot($yLine), $dot(822), $dot($yLine));
            $currentY += $lh;
            $row++;
        } else {
            // Saltos de página
            if ($row >= $maxRowsPrimeraHoja && $i == $maxRowsPrimeraHoja) {
                $numRowsContinuacion = min($maxRowsContinuacion, $maxConceptos - $i);
                $alturaContenido     = $numRowsContinuacion * $lh;
                $tableTop = $yInicioCeldasContinuacion;
                $pdf->AddPage();
                $pdf->SetLineWidth($dot(2));
                $pdf->Rect($dot(10), $dot(10), $dot(812), $dot(386));
                $textB(18, 22, $pt(20), $clave . ' ' . $nombre);
                $text(700, 22, $f18, 'SEM ' . $semana);
                $pdf->SetLineWidth($dot(1));
                $pdf->Line($dot(10), $dot(50), $dot(10 + 812), $dot(50));
                $pdf->Line($dot(305), $dot($tableTop), $dot(305), $dot($tableTop + $alturaContenido));
                $pdf->Line($dot(700), $dot($tableTop), $dot(700), $dot($tableTop + $alturaContenido));
                $pdf->SetLineWidth($dot(2));
                $pdf->Line($dot(415), $dot($tableTop), $dot(415), $dot($tableTop + $alturaContenido));
                $currentY = $tableTop + $textYOffset;
                $row      = 0;
            } elseif ($row > 0 && $row % $maxRowsContinuacion == 0 && $i > $maxRowsPrimeraHoja) {
                $numRowsContinuacion = min($maxRowsContinuacion, $maxConceptos - $i);
                $alturaContenido     = $numRowsContinuacion * $lh;
                $tableTop = $yInicioCeldasContinuacion;
                $pdf->AddPage();
                $pdf->SetLineWidth($dot(2));
                $pdf->Rect($dot(10), $dot(10), $dot(812), $dot(386));
                $textB(18, 22, $pt(20), $clave . ' ' . $nombre);
                $text(700, 22, $f18, 'SEM ' . $semana);
                $pdf->SetLineWidth($dot(1));
                $pdf->Line($dot(10), $dot(50), $dot(10 + 812), $dot(50));
                $pdf->Line($dot(305), $dot($tableTop), $dot(305), $dot($tableTop + $alturaContenido));
                $pdf->Line($dot(700), $dot($tableTop), $dot(700), $dot($tableTop + $alturaContenido));
                $pdf->SetLineWidth($dot(2));
                $pdf->Line($dot(415), $dot($tableTop), $dot(415), $dot($tableTop + $alturaContenido));
                $currentY = $tableTop + $textYOffset;
                $row      = 0;
            }

            $yCellTop = ($tableTop + ($row * $lh)) + 16;

            if (isset($percepciones[$i])) {
                $concepto     = $percepciones[$i];
                $fontConcepto = $fontForLabel(strlen($concepto['label']));
                $cellText(9,   $yCellTop, 220, $lh, $fontConcepto, $concepto['label'], 'L');
                $cellText(255, $yCellTop, 183, $lh, $f16, '$ ' . money($concepto['monto']), 'C');
            }
            $yLine = ($tableTop + (($row + 1) * $lh));
            $pdf->Line($dot(10), $dot($yLine), $dot(415), $dot($yLine));

            if (isset($deducciones[$i])) {
                $ded          = $deducciones[$i];
                $fontDeduccion = $fontForLabel(strlen($ded['label']));
                $cellText(410, $yCellTop, 220, $lh, $fontDeduccion, $ded['label'], 'L');
                $cellText(660, $yCellTop, 184, $lh, $f16, '-$ ' . money($ded['monto']), 'C');
            }
            $pdf->Line($dot(415), $dot($yLine), $dot(822), $dot($yLine));
            $currentY += $lh;
            $row++;
        }
    }

    // ── Totales y Neto ─────────────────────────────────────────────────────
    $enContinuacion        = ($maxConceptos > $maxRowsPrimeraHoja);
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
        $pdf->Line($dot(10),  $dot($yTotales + $alturaCelda), $dot(10 + 812), $dot($yTotales + $alturaCelda));
        $textB(18,  $yTotales + $offsetNeto, $fontNeto, 'Neto a pagar');
        $textB(200, $yTotales + $offsetNeto, $fontNeto, '$');
        $textB(240, $yTotales + $offsetNeto, $fontNeto, money($neto));
    } elseif ($enContinuacion && $conceptosEnPaginaActual <= 11) {
        $yTotales    = $currentY + 2;
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
        $pdf->Line($dot(10),  $dot($yTotales + 28), $dot(10 + 812), $dot($yTotales + 28));
        $pdf->SetFont('helvetica', 'B', $fontNeto);
        $pdf->Text($dot(18),  $dot($yTotales + 30), 'Neto a pagar');
        $pdf->Text($dot(200), $dot($yTotales + 30), '$');
        $pdf->Text($dot(240), $dot($yTotales + 30), money($neto));
    } else {
        $yTotales    = $currentY + 20;
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
        $pdf->Line($dot(10),  $dot($yTotales + 42), $dot(10 + 812), $dot($yTotales + 42));
        $textB(18,  $yTotales + 59, $f22, 'Neto a pagar');
        $textB(200, $yTotales + 59, $f22, '$');
        $textB(240, $yTotales + 59, $f22, money($neto));
    }
}

// ─── Leer entrada ─────────────────────────────────────────────────────────────
$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!$data) {
    http_response_code(400);
    die(json_encode(['error' => 'Datos no válidos']));
}

// ─── Construir $emp con los conceptos del modal ───────────────────────────────
$emp = [
    'nombre'               => $data['nombre']       ?? '',
    'clave'                => $data['clave']         ?? '',
    'departamento'         => $data['departamento']  ?? '',
    // Percepciones
    'salario_semanal'      => toNumber($data['salario_semanal']   ?? 0),
    'pasaje'               => toNumber($data['pasaje']            ?? 0),
    'comida'               => toNumber($data['comida']            ?? 0),
    'tardeada'             => toNumber($data['tardeada']          ?? 0),
    'conceptos_adicionales' => $data['conceptos_adicionales']     ?? [],
    // Deducciones
    'retardos'             => toNumber($data['retardos']          ?? 0),
    'isr'                  => toNumber($data['isr']               ?? 0),
    'imss_descuento'       => toNumber($data['imss_descuento']    ?? 0),
    'ajuste_sub'           => toNumber($data['ajuste_sub']        ?? 0),
    'infonavit'            => toNumber($data['infonavit']         ?? 0),
    'permiso'              => toNumber($data['permiso']           ?? 0),
    'inasistencia'         => toNumber($data['inasistencia']      ?? 0),
    'uniforme'             => toNumber($data['uniforme']          ?? ($data['uniformes'] ?? 0)),
    'checador'             => toNumber($data['checador']          ?? 0),
    'prestamo'             => toNumber($data['prestamo']          ?? 0),
    'tarjeta'              => toNumber($data['tarjeta']           ?? 0),
    'conceptos'            => $data['conceptos']                  ?? [],
];

// ─── Buscar info adicional del empleado en la BD ─────────────────────────────
$extra = [
    'nombre_puesto' => '',
    'fecha_ingreso' => '',
    'salario_diario' => 0,
    'salario_semanal' => 0,
];

$clave = $data['clave'] ?? '';
if ($clave !== '') {
    $stmt = mysqli_prepare($conexion,
        "SELECT e.fecha_ingreso, e.salario_diario, e.salario_semanal,
                p.nombre_puesto
         FROM info_empleados e
         LEFT JOIN puestos_especiales p ON e.id_puestoEspecial = p.id_puestoEspecial
         WHERE e.clave_empleado = ?");
    if ($stmt) {
        mysqli_stmt_bind_param($stmt, 's', $clave);
        mysqli_stmt_execute($stmt);
        $res = mysqli_stmt_get_result($stmt);
        if ($res && ($row = mysqli_fetch_assoc($res))) {
            $extra['fecha_ingreso']  = $row['fecha_ingreso']  ?? '';
            $extra['salario_diario'] = $row['salario_diario'] ?? 0;
            $extra['salario_semanal'] = $row['salario_semanal'] ?? 0;
            $extra['nombre_puesto']  = $row['nombre_puesto']   ?? '';
        }
        mysqli_stmt_close($stmt);
    }
}

// Si el formulario trae puesto/fecha manualmente, se sobreescriben
if (!empty($data['nombre_puesto'])) $extra['nombre_puesto'] = $data['nombre_puesto'];
if (!empty($data['fecha_ingreso'])) $extra['fecha_ingreso'] = $data['fecha_ingreso'];
if (!empty($data['salario_diario'])) $extra['salario_diario'] = toNumber($data['salario_diario']);

$meta = [
    'numero_semana' => $data['numero_semana'] ?? ''
];

// ─── Generar PDF ──────────────────────────────────────────────────────────────
$pdf = new TCPDF('L', 'mm', [50.8, 104], true, 'UTF-8', false);
$pdf->SetCreator('Sistema SAAO');
$pdf->SetAuthor('Sistema SAAO');
$pdf->SetTitle('Ticket Manual Relicario');
$pdf->SetSubject('Ticket Manual Nómina Relicario');
$pdf->setPrintHeader(false);
$pdf->setPrintFooter(false);
$pdf->SetAutoPageBreak(false, 0);
$pdf->SetMargins(0, 0, 0);
$pdf->SetFont('helvetica', '', 8);
$pdf->AddPage('L', [50.8, 104]);

renderTicketPdf($pdf, $emp, $extra, $meta);

$filename = 'ticket_manual_relicario_' . date('Ymd_His') . '.pdf';

if (ob_get_length()) {
    ob_end_clean();
}

header('Content-Type: application/pdf');
header('Content-Disposition: attachment; filename="' . $filename . '"');
header('Cache-Control: private, max-age=0, must-revalidate');
header('Pragma: public');

$pdf->Output($filename, 'D');
exit;
