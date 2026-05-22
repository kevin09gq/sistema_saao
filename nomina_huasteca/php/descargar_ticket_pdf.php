<?php

error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/error_log.txt');

require_once __DIR__ . '/../../conexion/conexion.php';
require_once __DIR__ . '/../../vendor/autoload.php';

if (!class_exists('TCPDF')) {
    http_response_code(500);
    echo "Error: La librería TCPDF no se pudo cargar. Asegúrate de que 'composer install' se haya ejecutado correctamente.";
    exit;
}

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
    
    // Datos específicos de corte
    $totalRejas = toNumber($empleado['totalRejas'] ?? 0);
    $precioReja = toNumber($empleado['precio'] ?? 0);
    $totalEfectivo = toNumber($empleado['totalEfectivo'] ?? 0);

    // ─── Funciones de dibujo (idénticas a Poda) ─────────────────────
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

    // ─── Encabezado ──────────────────────────────────────────────────
    $pdf->SetLineWidth($dot(2));
    $pdf->Rect($dot(10), $dot(12), $dot(812), $dot(386));
    
    $text(290, 22, $pt(17), $nombre);
    $text(710, 20, $pt(18), 'SEM ' . $semana);
    
    $pdf->SetLineWidth($dot(1));
    $pdf->Line($dot(10), $dot(42), $dot(10 + 812), $dot(42));

    $text(280, 47, $pt(20), "Tipo de trabajo: Corte De Rejas");
    $pdf->SetLineWidth($dot(1));
    $pdf->Line($dot(10), $dot(75), $dot(10 + 812), $dot(75));

    // ─── Celdas tipo Poda ─────────────────────────────────────────────
    $cellText = function ($xDot, $yDot, $wDot, $hDot, $fontPt, $value, $align = 'L') use ($pdf, $dot) {
        $pdf->SetFont('helvetica', '', $fontPt);
        $pdf->SetXY($dot($xDot), $dot($yDot));
        $pdf->Cell($dot($wDot), $dot($hDot), $value, 1, 0, $align, false, '', 0, false, 'C', 'M');
    };
    
    $fNormal = $pt(16);
    $fGrande = $pt(22);
    
    $xInicio = 10;
    $yInicio = 100;
    $anchoEtiqueta = 400;
    $anchoValor = 412;
    $altoCelda = 50;
    $espacioCeldas = 50;

    $cellText($xInicio, $yInicio, $anchoEtiqueta, $altoCelda, $fNormal, 'Total de rejas:', 'L');
    $cellText($xInicio + $anchoEtiqueta, $yInicio, $anchoValor, $altoCelda, $fGrande, $totalRejas, 'C');

    $cellText($xInicio, $yInicio + $espacioCeldas, $anchoEtiqueta, $altoCelda, $fNormal, 'Precio por reja:', 'L');
    $cellText($xInicio + $anchoEtiqueta, $yInicio + $espacioCeldas, $anchoValor, $altoCelda, $fGrande, '$' . money($precioReja), 'C');

    $cellText($xInicio, $yInicio + ($espacioCeldas * 2), $anchoEtiqueta, $altoCelda, $fNormal, 'Total efectivo:', 'L');
    $cellText($xInicio + $anchoEtiqueta, $yInicio + ($espacioCeldas * 2), $anchoValor, $altoCelda, $fGrande, '$' . money($totalEfectivo), 'C');

    $yLineaFinal = $yInicio + ($espacioCeldas * 3) + 20;
    $pdf->SetLineWidth($dot(2));
    $pdf->Line($dot(10), $dot($yLineaFinal), $dot(10 + 812), $dot($yLineaFinal));
    
    $textB(18, $yLineaFinal + 35, $pt(28), 'TOTAL EFECTIVO');
    $textB(280, $yLineaFinal + 35, $pt(28), '$');
    $textB(300, $yLineaFinal + 35, $pt(28), money($totalEfectivo));
}

function renderTicketPodaPdf($pdf, $empleado, $meta) {
    $nombre = safeText($empleado['nombre'] ?? '');
    $semana = safeText($meta['numero_semana'] ?? '');
    
    // Datos específicos de poda
    $totalArboles = toNumber($empleado['totalArboles'] ?? 0);
    $pagoPorArbol = toNumber($empleado['monto'] ?? 0);
    $totalEfectivo = toNumber($empleado['totalEfectivo'] ?? 0);
    
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
    
    // ─── Encabezado ──────────────────────────────────────────────────
    $pdf->SetLineWidth($dot(2));
    $pdf->Rect($dot(10), $dot(12), $dot(812), $dot(386));
    
    // Título principal
    $text(290, 22, $pt(17), $nombre);
    $text(710, 20, $pt(18), 'SEM ' . $semana);
    
    $pdf->SetLineWidth($dot(1));
    $pdf->Line($dot(10), $dot(42), $dot(10 + 812), $dot(42));
    
    
    // Tipo de trabajo
     $text(280, 47, $pt(20), "Tipo de trabajo: Poda De Árboles");
    $pdf->SetLineWidth($dot(1));
    $pdf->Line($dot(10), $dot(75), $dot(10 + 812), $dot(75));
    
    // ─── Función para dibujar celdas ─────────────────────────────────────
    $cellText = function ($xDot, $yDot, $wDot, $hDot, $fontPt, $value, $align = 'L') use ($pdf, $dot) {
        $pdf->SetFont('helvetica', '', $fontPt);
        $pdf->SetXY($dot($xDot), $dot($yDot));
        $pdf->Cell($dot($wDot), $dot($hDot), $value, 1, 0, $align, false, '', 0, false, 'C', 'M');
    };
    
    // ─── Tabla de datos en celdas ───────────────────────────────────────
    $fNormal = $pt(16);
    $fGrande = $pt(22);
    
    // Posiciones y tamaños
   $xInicio = 10;
    $yInicio = 100;
    $anchoEtiqueta = 400;
    $anchoValor = 412;
    $altoCelda = 50;
    $espacioCeldas = 50;
    
    // Fila 1: Total árboles podados
    $cellText($xInicio, $yInicio, $anchoEtiqueta, $altoCelda, $fNormal, 'Total Árboles podados:', 'L');
    $cellText($xInicio + $anchoEtiqueta, $yInicio, $anchoValor, $altoCelda, $fGrande, $totalArboles, 'C');
    
    // Fila 2: Pago por árbol
    $cellText($xInicio, $yInicio + $espacioCeldas, $anchoEtiqueta, $altoCelda, $fNormal, 'Pago por árbol:', 'L');
    $cellText($xInicio + $anchoEtiqueta, $yInicio + $espacioCeldas, $anchoValor, $altoCelda, $fGrande, '$' . money($pagoPorArbol), 'C');
    
    // Fila 3: Total efectivo
    $cellText($xInicio, $yInicio + ($espacioCeldas * 2), $anchoEtiqueta, $altoCelda, $fNormal, 'Total efectivo:', 'L');
    $cellText($xInicio + $anchoEtiqueta, $yInicio + ($espacioCeldas * 2), $anchoValor, $altoCelda, $fGrande, '$' . money($totalEfectivo), 'C');
    
    // Línea separadora antes del total final
    $yLineaFinal = $yInicio + ($espacioCeldas * 3) + 20;
    $pdf->SetLineWidth($dot(2));
    $pdf->Line($dot(10), $dot($yLineaFinal), $dot(10 + 812), $dot($yLineaFinal));
    
    // Total final como texto plano
    $textB(18, $yLineaFinal + 35, $pt(28), 'TOTAL EFECTIVO');
    $textB(280, $yLineaFinal + 35, $pt(28), '$');
    $textB(300, $yLineaFinal + 35, $pt(28), money($totalEfectivo));
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

    $deptoFontSize = 15;
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

// Determinar el tipo de solicitud y procesar datos
$empleados = [];
$meta = ['numero_semana' => ''];

// Caso 1: Selección individual de empleados
if (isset($data['seleccion']) && $data['seleccion'] === true) {
    $empleados = $data['empleados'] ?? [];
    $meta = $data['meta'] ?? ['numero_semana' => ''];
}
// Caso 2: Datos directos de cortes/podas (array de empleados procesados)
elseif (isset($data[0]) && is_array($data[0])) {
    // Es un array directo de empleados (viene de cortes/podas)
    $empleados = $data;
    $meta = ['numero_semana' => '']; // Se establecerá después si es necesario
}
// Caso 3: Solicitud normal con estructura de nómina
elseif (isset($data['nomina']) && is_array($data['nomina'])) {
    $nomina = $data['nomina'];
    $meta = $data['meta'] ?? ['numero_semana' => ''];

    // ─── Recolectar empleados de todos los departamentos ─────────────────
    foreach (($nomina['departamentos'] ?? []) as $depto) {
        $nombreDepto = $depto['nombre'] ?? '';
        foreach (($depto['empleados'] ?? []) as $emp) {
            if (is_array($emp)) {
                $emp['departamento'] = $nombreDepto;
                $empleados[] = $emp;
            }
        }
    }
}
// Caso 4: Datos con meta incluido (formato mixto)
elseif (isset($data['meta']) && isset($data['empleados'])) {
    $empleados = $data['empleados'];
    $meta = $data['meta'];
}
else {
    http_response_code(400);
    echo 'Solicitud inválida: Estructura de datos no reconocida.';
    exit;
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
$pdf->SetTitle('Tickets de Nómina');
$pdf->SetMargins(0, 0, 0);
$pdf->SetAutoPageBreak(false, 0);
$pdf->setPrintHeader(false);
$pdf->setPrintFooter(false);


// --- Obtener todos los extras (puesto, departamento, fecha_alta_empresa, salarios) por lote usando clave + id_empresa ---
$claves_empresas = [];
foreach ($empleados as $emp) {
    $clave = (string)($emp['clave'] ?? '');
    $id_empresa = isset($emp['id_empresa']) ? (int)$emp['id_empresa'] : 1;
    if ($clave !== '') {
        $claves_empresas[] = [
            'clave' => $clave,
            'id_empresa' => $id_empresa
        ];
    }
}

$extras_map = [];
if (count($claves_empresas) > 0) {
    $in_params = implode(',', array_fill(0, count($claves_empresas), '(?, ?)'));
    $sql = "SELECT e.clave_empleado, e.id_empresa, p.nombre_puesto, d.nombre_departamento, e.fecha_alta_empresa, e.salario_semanal, e.salario_diario
            FROM info_empleados e
            JOIN puestos_especiales p ON e.id_puestoEspecial = p.id_puestoEspecial
            JOIN departamentos d ON e.id_departamento = d.id_departamento
            WHERE (e.clave_empleado, e.id_empresa) IN ($in_params)";
    $stmt = $conexion->prepare($sql);
    if ($stmt) {
        $types = str_repeat('si', count($claves_empresas));
        $params = [];
        foreach ($claves_empresas as $ce) {
            $params[] = $ce['clave'];
            $params[] = $ce['id_empresa'];
        }
        $stmt->bind_param($types, ...$params);
        $stmt->execute();
        $res = $stmt->get_result();
        while ($row = $res->fetch_assoc()) {
            $key = $row['clave_empleado'] . '_' . $row['id_empresa'];
            $extras_map[$key] = [
                'nombre_puesto' => $row['nombre_puesto'],
                'nombre_departamento' => $row['nombre_departamento'],
                'fecha_alta_empresa' => $row['fecha_alta_empresa'],
                'salario_semanal' => $row['salario_semanal'],
                'salario_diario' => $row['salario_diario']
            ];
        }
        $stmt->close();
    }
}

foreach ($empleados as $emp) {
    // Determinar el tipo de ticket basado en los datos del empleado
    $esTicketCorteOPoda = false;
    $tipoTicket = '';
    
    // Verificar si es un ticket de corte (tiene totalRejas, precio, etc.)
    if (isset($emp['totalRejas']) || isset($emp['totalArboles']) || 
        (isset($emp['concepto']) && in_array($emp['concepto'], ['REJA', 'NOMINA', 'PODA']))) {
        
        $esTicketCorteOPoda = true;
        
        if (isset($emp['totalRejas']) || (isset($emp['concepto']) && $emp['concepto'] === 'REJA')) {
            $tipoTicket = 'corte';
        } elseif (isset($emp['totalArboles']) || (isset($emp['concepto']) && $emp['concepto'] === 'PODA')) {
            $tipoTicket = 'poda';
        } elseif (isset($emp['concepto']) && $emp['concepto'] === 'NOMINA') {
            // Para nómina de corte, verificar si tiene datos de corte
            if (isset($emp['viernes']) || isset($emp['sabado']) || isset($emp['domingo']) || 
                isset($emp['lunes']) || isset($emp['martes']) || isset($emp['miercoles']) || isset($emp['jueves'])) {
                $tipoTicket = 'corte';
            }
        }
    }
    
    // Si no se detectó por propiedades, intentar por el nombre del departamento
    if (!$esTicketCorteOPoda && isset($emp['departamento'])) {
        $depto = strtolower(safeText($emp['departamento']));
        if ($depto === 'corte') {
            $esTicketCorteOPoda = true;
            $tipoTicket = 'corte';
        } elseif ($depto === 'poda') {
            $esTicketCorteOPoda = true;
            $tipoTicket = 'poda';
        }
    }
    
    if ($esTicketCorteOPoda) {
        // Usar las funciones específicas para cortes y podas
        $pdf->AddPage();
        
        if ($tipoTicket === 'corte') {
            renderTicketCortePdf($pdf, $emp, $meta);
        } elseif ($tipoTicket === 'poda') {
            renderTicketPodaPdf($pdf, $emp, $meta);
        }
    } else {
        // Usar la función normal para tickets de nómina
        $clave = (string)($emp['clave'] ?? '');
        $id_empresa = isset($emp['id_empresa']) ? (int)$emp['id_empresa'] : 1;
        $key = $clave . '_' . $id_empresa;
        $extra = [
            'nombre_puesto'  => $emp['puesto'] ?? '',
            'nombre_departamento' => $emp['departamento'] ?? '',
            'fecha_alta_empresa'  => $emp['fecha_alta_empresa'] ?? '',
            'salario_semanal' => $emp['salario_semanal'] ?? 0,
            'salario_diario'  => $emp['salario_diario'] ?? 0
        ];
        if (isset($extras_map[$key])) {
            $extra['nombre_puesto'] = $extras_map[$key]['nombre_puesto'];
            $extra['nombre_departamento'] = $extras_map[$key]['nombre_departamento'];
            $extra['fecha_alta_empresa'] = $extras_map[$key]['fecha_alta_empresa'];
            $extra['salario_semanal'] = $extras_map[$key]['salario_semanal'];
            $extra['salario_diario'] = $extras_map[$key]['salario_diario'];
        }
        // Sobrescribir el departamento en el empleado para el render
        $emp['departamento'] = $extra['nombre_departamento'];
        $pdf->AddPage();
        renderTicketPdf($pdf, $emp, $extra, $meta);
    }
}

// Limpiar cualquier salida previa que pueda corromper el PDF
if (ob_get_length()) ob_clean();

header('Content-Type: application/pdf');
header('Content-Disposition: attachment; filename="tickets_huasteca.pdf"');
header('Cache-Control: private, max-age=0, must-revalidate');
header('Pragma: public');

echo $pdf->Output('tickets_huasteca.pdf', 'S');
