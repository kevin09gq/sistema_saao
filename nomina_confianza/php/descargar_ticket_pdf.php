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

// Función para redondear matemáticamente (0.5 o más redondea hacia arriba)
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

    // Eliminar números del inicio del departamento
    $departamento = safeText($emp['departamento'] ?? '');
    $departamento = preg_replace('/^\d+/', '', $departamento);

    $rfc = safeText($extra['rfc_empleado'] ?? '');
    $imss = safeText($extra['imss'] ?? '');
    $puesto = safeText($extra['nombre_puesto'] ?? '');
    
    // Convertir fecha de YYYY-MM-DD a YYYY/MM/DD
    $fechaIngreso = safeText($extra['fecha_ingreso'] ?? '');
    $fechaIngreso = str_replace('-', '/', $fechaIngreso);

    $sueldoSemanal = toNumber($emp['sueldo_semanal'] ?? 0);
    $salarioDiario = toNumber($emp['sueldo_diario'] ?? 0);
    $extras = $salarioDiario; // Séptimo día = 1 día de salario
    $vacaciones = toNumber($emp['vacaciones'] ?? 0);

    $conceptos = is_array($emp['conceptos'] ?? null) ? $emp['conceptos'] : [];
    $getConcepto = function ($codigo) use ($conceptos) {
        foreach ($conceptos as $c) {
            if ((string)($c['codigo'] ?? '') === (string)$codigo) {
                return toNumber($c['resultado'] ?? 0);
            }
        }
        return 0.0;
    };

    $infonavit = $getConcepto('16');
    $isr = $getConcepto('45');
    $imssDed = $getConcepto('52');
    $retardos = toNumber($emp['retardos'] ?? 0);

    // Procesar extras_adicionales
    $extrasAdicionales = [];
    $totalExtrasAdicionales = 0.0;
    if (isset($emp['extras_adicionales']) && is_array($emp['extras_adicionales'])) {
        foreach ($emp['extras_adicionales'] as $extraAd) {
            $nombreExtra = safeText($extraAd['nombre'] ?? 'Extra');
            $cantidad = isset($extraAd['cantidad']) ? (float)$extraAd['cantidad'] : 1;
            // Usar 'resultado' como monto si existe, si no, usar 'monto'
            $monto = isset($extraAd['resultado']) ? toNumber($extraAd['resultado']) : toNumber($extraAd['monto'] ?? 0);
            $total = $cantidad * $monto;
            $extrasAdicionales[] = [
                'nombre' => $nombreExtra,
                'cantidad' => $cantidad,
                'monto' => $monto,
                'total' => $total
            ];
            $totalExtrasAdicionales += $total;
        }
    }

    // Se elimina el séptimo día de la suma de percepciones
    $totalPercepciones = $sueldoSemanal + $vacaciones + $totalExtrasAdicionales;
    $totalDeducciones = $infonavit + $isr + $imssDed + $retardos;

    $neto = null;
    if (isset($emp['total_cobrar'])) {
        $neto = toNumber($emp['total_cobrar']);
    } elseif (isset($emp['tarjeta'])) {
        $neto = toNumber($emp['tarjeta']);
    }
    if ($neto === null || $neto === 0.0) {
        $neto = $totalPercepciones - $totalDeducciones;
    }
    
    // REDONDEAR el sueldo neto según regla matemática estándar
    $neto = redondear($neto);

    $semana = safeText($meta['numero_semana'] ?? '');

    $pdf->SetTextColor(0, 0, 0);

    $dot = function ($d) {
        return ((float)$d) / 8.0;
    };
    $pt = function ($dotH) use ($dot) {
        $mm = $dot($dotH);
        return max(4.0, $mm / 0.352777);
    };

    // No se necesita función separada, usar lógica inline como en nomina

    $text = function ($xDot, $yDot, $fontPt, $value) use ($pdf, $dot) {
        $pdf->SetFont('helvetica', '', $fontPt);
        $pdf->Text($dot($xDot), $dot($yDot), (string)$value);
    };

    $textB = function ($xDot, $yDot, $fontPt, $value) use ($pdf, $dot) {
        $pdf->SetFont('helvetica', 'B', $fontPt);
        $pdf->Text($dot($xDot), $dot($yDot), (string)$value);
    };

    $textRight = function ($xRightDot, $yDot, $fontPt, $value) use ($pdf, $dot) {
        $pdf->SetFont('helvetica', '', $fontPt);
        $s = (string)$value;
        $wMm = $pdf->GetStringWidth($s);
        $xMm = $dot($xRightDot) - $wMm;
        $pdf->Text($xMm, $dot($yDot), $s);
    };

    $textRightB = function ($xRightDot, $yDot, $fontPt, $value) use ($pdf, $dot) {
        $pdf->SetFont('helvetica', 'B', $fontPt);
        $s = (string)$value;
        $wMm = $pdf->GetStringWidth($s);
        $xMm = $dot($xRightDot) - $wMm;
        $pdf->Text($xMm, $dot($yDot), $s);
    };

    $cellText = function ($xDot, $yDot, $wDot, $hDot, $fontPt, $value, $align = 'L', $style = '') use ($pdf, $dot) {
        $pdf->SetFont('helvetica', $style, $fontPt);
        $pdf->SetXY($dot($xDot), $dot($yDot));
        $value = substr((string)$value, 0, 50); // Limitar a 50 caracteres
        $pdf->Cell($dot($wDot), $dot($hDot), $value, 0, 0, $align, false, '', 0, false, 'C', 'M');
    };

    $pdf->SetLineWidth($dot(2));
    $pdf->Rect($dot(10), $dot(10), $dot(812), $dot(386));

    // Una sola línea: Clave | Nombre | Departamento | Fecha Ingreso | Semana
    $nombreCompleto = $clave . ' ' . $nombre;
    // Ajustar tamaño de fuente del nombre según longitud
     $nombreFontSize = strlen($nombreCompleto) > 35 ? 8 : (strlen($nombreCompleto) >= 31 ? 13 : 15);
    $textB(12, 20, $pt($nombreFontSize), $nombreCompleto);
    
    // Ajustar tamaño de fuente del departamento según longitud
    $lenDepto = strlen($departamento);
    if ($lenDepto > 33) {
        $deptoFontSize = 3.9;
    } elseif ($lenDepto > 32) {
        $deptoFontSize = 4.2;
    } elseif ($lenDepto > 27) {
        $deptoFontSize = 4.5;
    } elseif ($lenDepto > 23) {
        $deptoFontSize = 4.5;
    } elseif ($lenDepto > 19) {
        $deptoFontSize = 5;
    } elseif ($lenDepto > 15) {
        $deptoFontSize = 5.8;
    } elseif ($lenDepto > 11) {
        $deptoFontSize = 6;
    } else {
        $deptoFontSize = 6;
    }
    $text(300, 20, $deptoFontSize, $departamento); 
    
    $text(515, 18, $pt(18), 'F.Ingr: ' . $fechaIngreso);
    $text(710, 18, $pt(18), 'SEM ' . $semana);

    $pdf->SetLineWidth($dot(1));
    $pdf->Line($dot(10), $dot(40), $dot(10 + 812), $dot(40));

    $pdf->SetLineWidth($dot(1));
    $pdf->Line($dot(10), $dot(40), $dot(10 + 812), $dot(40));
    $pdf->Line($dot(280), $dot(40), $dot(280), $dot(68));
    $pdf->Line($dot(520), $dot(40), $dot(520), $dot(68));
    
    // Ajustar tamaño de fuente del puesto según longitud
    $puestoTexto = $puesto;
    $lenPuesto = strlen($puestoTexto);
    // Ajustar dinámicamente el tamaño de fuente según la longitud del texto
     if ($lenPuesto > 33) {
        $puestoFontSize = 3.5;
     } elseif ($lenPuesto > 32) {
        $puestoFontSize = 4;
    } elseif ($lenPuesto > 27) {
        $puestoFontSize = 4.1;
    } elseif ($lenPuesto > 23) {
        $puestoFontSize = 4.5;
    } elseif ($lenPuesto > 19) {
        $puestoFontSize = 5;
    } elseif ($lenPuesto > 15) {
        $puestoFontSize = 5.8;
    } elseif ($lenPuesto > 11) {
        $puestoFontSize = 6;
    } else {
        $puestoFontSize = 6;
    }
    $text(18, 49, $puestoFontSize, $puestoTexto);
     $text(290, 45, $pt(18), 'Sal. diario: $ ' . money($salarioDiario));
    $text(530, 45, $pt(18), 'Sal. Semanal: $ ' . money($sueldoSemanal));

    $pdf->SetLineWidth($dot(1));
    $pdf->Line($dot(10), $dot(68), $dot(10 + 812), $dot(68));

    $f20 = $pt(20);
    $textB(100, 76, $f20, 'PERCEPCIONES');
    $textB(520, 76, $f20, 'DEDUCCIONES');

    $pdf->SetLineWidth($dot(1));
    $pdf->Line($dot(10), $dot(105), $dot(10 + 812), $dot(105));

    $y0 = 90;
    $lh = 26;
    $f16 = $pt(16);
    $maxRowsPrimeraHoja = 11;
    $maxRowsContinuacion = 13;
    $conceptoNum = 1;

    // Preparar todos los conceptos de deducciones obligatorios y dinámicos
    $deducciones = [];
    if ($infonavit > 0) $deducciones[] = ['label' => 'Infonavit', 'monto' => $infonavit];
    if ($retardos > 0) $deducciones[] = ['label' => 'Total Retardos', 'monto' => $retardos];
    if ($isr > 0) $deducciones[] = ['label' => 'I.S.R. (mes)', 'monto' => $isr];
    if ($imssDed > 0) $deducciones[] = ['label' => 'I.M.S.S', 'monto' => $imssDed];
    if (toNumber($emp['tarjeta'] ?? 0) > 0) $deducciones[] = ['label' => 'Tarjeta', 'monto' => toNumber($emp['tarjeta'])];
    if (toNumber($emp['prestamo'] ?? 0) > 0) $deducciones[] = ['label' => 'Préstamo', 'monto' => toNumber($emp['prestamo'])];
    if (toNumber($emp['checador'] ?? 0) > 0) $deducciones[] = ['label' => 'Checador', 'monto' => toNumber($emp['checador'])];
    if (toNumber($emp['uniformes'] ?? 0) > 0) $deducciones[] = ['label' => 'Uniformes', 'monto' => toNumber($emp['uniformes'])];
    if (toNumber($emp['inasistencia'] ?? 0) > 0) $deducciones[] = ['label' => 'Inasistencias', 'monto' => toNumber($emp['inasistencia'])];
    if (toNumber($emp['permiso'] ?? 0) > 0) $deducciones[] = ['label' => 'Permisos', 'monto' => toNumber($emp['permiso'])];

    // Agregar deducciones personalizadas del arreglo deducciones_adicionales
    if (isset($emp['deducciones_adicionales']) && is_array($emp['deducciones_adicionales'])) {
        foreach ($emp['deducciones_adicionales'] as $dedAd) {
            $nombreDed = safeText($dedAd['nombre'] ?? 'Deducción personalizada');
            $montoDed = toNumber($dedAd['resultado'] ?? 0);
            if ($montoDed > 0) {
                $deducciones[] = ['label' => $nombreDed, 'monto' => $montoDed];
            }
        }
    }

    // Calcular el total de deducciones sumando todos los elementos del array
    $totalDeduccionesCalculado = 0.0;
    foreach ($deducciones as $ded) {
        $totalDeduccionesCalculado += toNumber($ded['monto'] ?? 0);
    }
    $totalDeducciones = $totalDeduccionesCalculado;

    // Preparar todos los conceptos de percepciones
    $percepciones = [];
    $percepciones[] = ['label' => $conceptoNum++ . ' Sueldo', 'cantidad' => 6, 'monto' => $sueldoSemanal];
    // Se eliminó el concepto 'Septimo dia' del ticket
    if ($vacaciones > 0) {
        $percepciones[] = ['label' => $conceptoNum++ . ' Vacaciones', 'cantidad' => 0, 'monto' => $vacaciones];
    }
    foreach ($extrasAdicionales as $ad) {
        if ($ad['total'] > 0) {
            $percepciones[] = ['label' => $conceptoNum++ . ' ' . $ad['nombre'], 'cantidad' => $ad['cantidad'], 'monto' => $ad['total']];
        }
    }

    // Calcular el máximo de conceptos
    $maxConceptos = max(count($percepciones), count($deducciones));
    $tableTopPrimeraHoja = 105;
    $textYOffset = 8;
    // Si hay 9 conceptos o menos, ajustar altura y tamaño de letra para mostrar totales en la misma hoja
    if ($maxConceptos <= 9) {
        $numRowsPrimeraHoja = $maxConceptos;
        $alturaContenidoPrimeraHoja = $numRowsPrimeraHoja * $lh; // solo hasta el final de conceptos
        $f16 = $pt(16); // tamaño consistente para conceptos
        $f18 = $pt(18); // tamaño para totales
        $f20 = $pt(12);
        $f22 = $pt(13);
    } else {
        $numRowsPrimeraHoja = min($maxRowsPrimeraHoja, $maxConceptos);
        $alturaContenidoPrimeraHoja = $numRowsPrimeraHoja * $lh;
        $f16 = $pt(16);
        $f18 = $pt(18);
        $f20 = $pt(20);
        $f20 = $pt(20);
        $f22 = $pt(22);
    }
    
    // Dibujar líneas verticales para la primera hoja
     $pdf->SetLineWidth($dot(1));
    $pdf->Line($dot(305), $dot($tableTopPrimeraHoja), $dot(305), $dot($tableTopPrimeraHoja + $alturaContenidoPrimeraHoja));
    $pdf->Line($dot(700), $dot($tableTopPrimeraHoja), $dot(700), $dot($tableTopPrimeraHoja + $alturaContenidoPrimeraHoja));
    $pdf->SetLineWidth($dot(2));
    $pdf->Line($dot(415), $dot(106), $dot(415), $dot($tableTopPrimeraHoja + $alturaContenidoPrimeraHoja));
    
    // Dibujar ambas columnas en paralelo, fila por fila
    $currentY = $y0;
    $row = 0;
    $yInicioCeldasContinuacion = 50;
    $tableTop = $tableTopPrimeraHoja;

    for ($i = 0; $i < $maxConceptos; $i++) {
        // Si hay 9 conceptos o menos, no hacer salto de página, mostrar totales en la misma hoja
        if ($maxConceptos <= 9) {
            $yCellTop = ($tableTop + ($row * $lh)) + 16;
            if (isset($percepciones[$i])) {
                $concepto = $percepciones[$i];
                $lenConcepto = strlen($concepto['label']);
                $esEnMayusculas = strtoupper($concepto['label']) === $concepto['label'];
                
                 if ($esEnMayusculas) {
                    // Lógica específica para conceptos en mayúsculas
                    if ($lenConcepto >= 32) {
                        $fontConcepto = $pt(1);
                    } elseif ($lenConcepto >= 25) {
                        $fontConcepto = $pt(11);
                    } else {
                        $fontConcepto = $f16;
                    }
                } else {
                    // Lógica específica para conceptos en minúsculas
                    if ($lenConcepto >= 50) {
                        $fontConcepto = $pt(10);
                    } elseif ($lenConcepto >= 45) {
                        $fontConcepto = $pt(11);
                    } elseif ($lenConcepto >= 40) {
                        $fontConcepto = $pt(12);
                    } elseif ($lenConcepto >= 35) {
                        $fontConcepto = $pt(13);
                    } elseif ($lenConcepto >= 30) {
                        $fontConcepto = $pt(14);
                    } else {
                        $fontConcepto = $f16;
                    }
                }
                  $cellText(9, $yCellTop, 170, $lh, $fontConcepto, $concepto['label'], 'L');
                 $cellText(240, $yCellTop, 229, $lh, $f16, '$ ' . money($concepto['monto']), 'C');
             }

            $yLine = ($tableTop + (($row + 1) * $lh));
            $pdf->Line($dot(10), $dot($yLine), $dot(415), $dot($yLine));
            if (isset($deducciones[$i])) {
                $ded = $deducciones[$i];
                $lenDeduccion = strlen($ded['label']);
                $esEnMayusculas = strtoupper($ded['label']) === $ded['label'];
                
                // Condiciones separadas para mayúsculas y minúsculas
                if ($esEnMayusculas) {
                    // Lógica específica para deducciones en mayúsculas
                    if ($lenDeduccion >= 32) {
                        $fontDeduccion = $pt(2);
                    } elseif ($lenDeduccion >= 15) {
                        $fontDeduccion = $pt(14);
                    } else {
                        $fontDeduccion = $f16;
                    }
                } else {
                    // Lógica específica para deducciones en minúsculas
                    if ($lenDeduccion >= 50) {
                        $fontDeduccion = $pt(10);
                    } elseif ($lenDeduccion >= 45) {
                        $fontDeduccion = $pt(11);
                    } elseif ($lenDeduccion >= 40) {
                        $fontDeduccion = $pt(12);
                    } elseif ($lenDeduccion >= 35) {
                        $fontDeduccion = $pt(13);
                    } elseif ($lenDeduccion >= 30) {
                        $fontDeduccion = $pt(14);
                    } else {
                        $fontDeduccion = $f16;
                    }
                }
                $cellText(410, $yCellTop, 218, $lh, $fontDeduccion, $ded['label'], 'L');
                $cellText(660, $yCellTop, 182, $lh, $f16, '-$ ' . money($ded['monto']), 'C');
            }

            $pdf->Line($dot(415), $dot($yLine), $dot(822), $dot($yLine));
            $currentY += $lh;
            $row++;
        } else {
            // Comportamiento normal para más de 9 conceptos
            // Salto de página para continuación
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
                $pdf->SetLineWidth($dot(1));
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
                $pdf->SetLineWidth($dot(1));
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
                $lenConcepto = strlen($concepto['label']);
                $esEnMayusculas = strtoupper($concepto['label']) === $concepto['label'];
                
                // Condiciones separadas para mayúsculas y minúsculas
                if ($esEnMayusculas) {
                    // Lógica específica para conceptos en mayúsculas
                    if ($lenConcepto >= 32) {
                        $fontConcepto = $pt(1);
                    } elseif ($lenConcepto >= 25) {
                        $fontConcepto = $pt(11);
                    } else {
                        $fontConcepto = $f16;
                    }
                } else {
                    // Lógica específica para conceptos en minúsculas
                    if ($lenConcepto >= 50) {
                        $fontConcepto = $pt(10);
                    } elseif ($lenConcepto >= 45) {
                        $fontConcepto = $pt(11);
                    } elseif ($lenConcepto >= 40) {
                        $fontConcepto = $pt(12);
                    } elseif ($lenConcepto >= 35) {
                        $fontConcepto = $pt(13);
                    } elseif ($lenConcepto >= 30) {
                        $fontConcepto = $pt(14);
                    } else {
                        $fontConcepto = $f16;
                    }
                }
                $cellText(9, $yCellTop, 170, $lh, $fontConcepto, $concepto['label'], 'L');
                $cellText(240, $yCellTop, 229, $lh, $f16, '$ ' . money($concepto['monto']), 'C');
            }

            $yLine = ($tableTop + (($row + 1) * $lh));
            $pdf->Line($dot(10), $dot($yLine), $dot(415), $dot($yLine));
            if (isset($deducciones[$i])) {
                $ded = $deducciones[$i];
                $lenDeduccion = strlen($ded['label']);
                $esEnMayusculas = strtoupper($ded['label']) === $ded['label'];
                
                // Condiciones separadas para mayúsculas y minúsculas
                if ($esEnMayusculas) {
                    // Lógica específica para deducciones en mayúsculas
                    if ($lenDeduccion >= 32) {
                        $fontDeduccion = $pt(2);
                    } elseif ($lenDeduccion >= 15) {
                        $fontDeduccion = $pt(14);
                    } else {
                        $fontDeduccion = $f16;
                    }
                } else {
                    // Lógica específica para deducciones en minúsculas
                    if ($lenDeduccion >= 50) {
                        $fontDeduccion = $pt(10);
                    } elseif ($lenDeduccion >= 45) {
                        $fontDeduccion = $pt(11);
                    } elseif ($lenDeduccion >= 40) {
                        $fontDeduccion = $pt(12);
                    } elseif ($lenDeduccion >= 35) {
                        $fontDeduccion = $pt(13);
                    } elseif ($lenDeduccion >= 30) {
                        $fontDeduccion = $pt(14);
                    } else {
                        $fontDeduccion = $f16;
                    }
                }
                 $cellText(410, $yCellTop, 218, $lh, $fontDeduccion, $ded['label'], 'L');
                $cellText(660, $yCellTop, 182, $lh, $f16, '-$ ' . money($ded['monto']), 'C');
            }
            $pdf->Line($dot(415), $dot($yLine), $dot(822), $dot($yLine));
            $currentY += $lh;
            $row++;
        }
    }

    // Calcular Y dinámica para totales según donde terminaron las percepciones
    // Determinar si estamos en hoja de continuación
    $enContinuacion = ($maxConceptos > $maxRowsPrimeraHoja);
    $conceptosEnPaginaActual = $enContinuacion ? ($maxConceptos - $maxRowsPrimeraHoja) : $maxConceptos;
    
    if ($maxConceptos <= 9) {
        // Primera hoja con 9 conceptos o menos
        $yTotales = $currentY + 18;
        $pdf->SetLineWidth($dot(2));
        $pdf->Line($dot(10), $dot($yTotales), $dot(10 + 812), $dot($yTotales));
        $pdf->SetLineWidth($dot(1));
        // Si son 8 conceptos o menos, fuente más grande y celda alta
        if ($maxConceptos <= 8) {
            $fontTotales = $pt(16); // más grande
            $fontNeto = $pt(22);
            $alturaCelda = 37;
            $offsetTexto = 13;
            $offsetNeto = 43;
        } else {
            // 9 conceptos: celda más pequeña
            $fontTotales = $pt(18); // Cambiado a 26pt
            $fontNeto = $pt(17); // También neto a 26pt para consistencia
            $alturaCelda = 30;
            $offsetTexto = 8;
            $offsetNeto = 31;
        }
        $text(18, $yTotales + $offsetTexto, $fontTotales, 'Total Percepciones');
        $text(310, $yTotales + $offsetTexto, $fontTotales, '$' . money($totalPercepciones));
        $text(430, $yTotales + $offsetTexto, $fontTotales, 'Total Deducciones');
        $text(690, $yTotales + $offsetTexto, $fontTotales, '-$');
        $text(710, $yTotales + $offsetTexto, $fontTotales, money($totalDeducciones));
        $pdf->Line($dot(415), $dot($yTotales), $dot(415), $dot($yTotales + $alturaCelda));
        $pdf->Line($dot(10), $dot($yTotales + $alturaCelda), $dot(10 + 812), $dot($yTotales + $alturaCelda));
        $textB(18, $yTotales + $offsetNeto, $fontNeto, 'Neto a pagar');
        $textB(200, $yTotales + $offsetNeto, $fontNeto, '$');
        $textB(240, $yTotales + $offsetNeto, $fontNeto, money($neto));
    } elseif ($enContinuacion && $conceptosEnPaginaActual <= 11) {
        // Hoja de continuación con 11 conceptos o menos - mostrar totales en la misma hoja
        $yTotales = $currentY + 2;
        // Si son 10 conceptos o menos, fuente más grande
        if ($conceptosEnPaginaActual <= 10) {
            $fontTotales = $pt(16); // más grande
            $fontNeto = $pt(22);
        } else {
            $fontTotales = $pt(15);
            $fontNeto = $pt(14);
        }
        $pdf->SetLineWidth($dot(2));
        $pdf->Line($dot(10), $dot($yTotales), $dot(10 + 812), $dot($yTotales));
        $pdf->SetLineWidth($dot(1));
        $pdf->SetFont('helvetica', '', $fontTotales);
        $pdf->Text($dot(18), $dot($yTotales + 9), 'Total Percepciones');
        $pdf->Text($dot(305), $dot($yTotales + 9), '$' . money($totalPercepciones));
        $pdf->Text($dot(430), $dot($yTotales + 9), 'Total Deducciones');
        $pdf->Text($dot(710), $dot($yTotales + 9), '-$' . money($totalDeducciones));
        $pdf->Line($dot(415), $dot($yTotales), $dot(415), $dot($yTotales + 28));
        $pdf->Line($dot(10), $dot($yTotales + 28), $dot(10 + 812), $dot($yTotales + 28));
        $pdf->SetFont('helvetica', 'B', $fontNeto);
        $pdf->Text($dot(18), $dot($yTotales + 30), 'Neto a pagar');
        $pdf->Text($dot(200), $dot($yTotales + 30), '$');
        $pdf->Text($dot(240), $dot($yTotales + 30), money($neto));
    } else {
        // Más de 11 conceptos en continuación - totales en nueva página si es necesario
        $yTotales = $currentY + 20;
        $minYTotales = $y0 + (4 * $lh) + 20;
        if ($yTotales < $minYTotales) {
            $yTotales = $minYTotales;
        }
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
        $text(18, $yTotales + 10, $f18, 'Total Percepciones');
        $text(210, $yTotales + 10, $f18, '$' . money($totalPercepciones));
        $text(430, $yTotales + 10, $f18, 'Total Deducciones');
        $text(700, $yTotales + 10, $f18, '-$'. money($totalDeducciones));
        $pdf->Line($dot(415), $dot($yTotales), $dot(415), $dot($yTotales + 42));
        $pdf->Line($dot(10), $dot($yTotales + 42), $dot(10 + 812), $dot($yTotales + 42));
        $textB(18, $yTotales + 59, $f22, 'Neto a pagar');
        $textB(200, $yTotales + 59, $f22, '$');
        $textB(240, $yTotales + 59, $f22, money($neto));
    }
}

$raw = file_get_contents('php://input');
$postData = $_POST;

// Verificar si se están enviando empleados seleccionados
if (isset($postData['empleados_seleccionados']) && isset($postData['datos_json'])) {
    // Modo de selección manual de empleados
    $datosCompletos = json_decode($postData['datos_json'], true);
    
    if (!$datosCompletos || !isset($datosCompletos['empleados_seleccionados'])) {
        http_response_code(400);
        header('Content-Type: text/plain; charset=UTF-8');
        echo 'Datos de empleados seleccionados no válidos.';
        exit;
    }
    
    $data = [
        'nomina' => [
            'numero_semana' => $datosCompletos['metadatos']['numero_semana'] ?? '',
            'departamentos' => []
        ]
    ];
    
    // Procesar empleados seleccionados
    $empleadosSeleccionados = $datosCompletos['empleados_seleccionados'];
    if (is_array($empleadosSeleccionados) && count($empleadosSeleccionados) > 0) {
        // Agrupar empleados por departamento real
        $empleadosPorDepartamento = [];
        
        foreach ($empleadosSeleccionados as $empleado) {
            $deptoNombre = $empleado['departamento'] ?? 'Sin Departamento';
            if (!isset($empleadosPorDepartamento[$deptoNombre])) {
                $empleadosPorDepartamento[$deptoNombre] = [];
            }
            $empleadosPorDepartamento[$deptoNombre][] = $empleado;
        }
        
        // Crear un departamento por cada grupo real
        foreach ($empleadosPorDepartamento as $nombreDepto => $empleadosDepto) {
            $data['nomina']['departamentos'][] = [
                'nombre' => $nombreDepto,
                'empleados' => $empleadosDepto
            ];
        }
    }
} else {
    // Modo normal - procesar con posibles filtros
    $data = json_decode($raw, true);
    
    // Verificar si se enviaron filtros
    $filtroDepartamento = $data['filtro_departamento'] ?? null;
    $filtroEmpresa = $data['filtro_empresa'] ?? null;
    
    // Si hay filtros, procesarlos
    if (($filtroDepartamento !== null && $filtroDepartamento !== '0') || 
        ($filtroEmpresa !== null && $filtroEmpresa !== '0')) {
        
        // Filtrar empleados según los criterios
        $empleadosFiltrados = [];
        
        foreach (($data['nomina']['departamentos'] ?? []) as $depto) {
            $empleadosDept = $depto['empleados'] ?? [];
            
            foreach ($empleadosDept as $emp) {
                $cumpleFiltros = true;
                
                // Filtrar por departamento
                if ($filtroDepartamento !== null && $filtroDepartamento !== '0') {
                    if ($filtroDepartamento === 'sin_seguro') {
                        // Verificar si es departamento "sin seguro"
                        $nombreDepto = strtolower(trim($depto['nombre'] ?? ''));
                        if ($nombreDepto !== 'sin seguro') {
                            $cumpleFiltros = false;
                        }
                    } else {
                        // Filtrar por ID de departamento
                        $idDeptoEmp = $emp['id_departamento'] ?? null;
                        if ($idDeptoEmp != $filtroDepartamento) {
                            $cumpleFiltros = false;
                        }
                    }
                }
                
                // Filtrar por empresa
                if ($cumpleFiltros && $filtroEmpresa !== null && $filtroEmpresa !== '0') {
                    $idEmpresaEmp = $emp['id_empresa'] ?? null;
                    if ($idEmpresaEmp != $filtroEmpresa) {
                        $cumpleFiltros = false;
                    }
                }
                
                if ($cumpleFiltros) {
                    $empleadosFiltrados[] = $emp;
                }
            }
        }
        
        // Reemplazar los empleados con los filtrados
        $data['nomina']['departamentos'] = [
            [
                'nombre' => 'Filtrados',
                'empleados' => $empleadosFiltrados
            ]
        ];
    }
}

if (!is_array($data) || !isset($data['nomina']) || !is_array($data['nomina'])) {
    http_response_code(400);
    header('Content-Type: text/plain; charset=UTF-8');
    echo 'Solicitud inválida.';
    exit;
}

$nomina = $data['nomina'];
$meta = [
    'numero_semana' => $nomina['numero_semana'] ?? ''
];

$empleados = [];

// Función para obtener nombre de departamento por ID desde la base de datos
function obtenerNombreDepartamento($id_departamento, $conexion) {
    static $cacheDepartamentos = null;
    
    // Cargar departamentos en caché si no están cargados
    if ($cacheDepartamentos === null) {
        $cacheDepartamentos = [];
        $sql = "SELECT id_departamento, nombre_departamento FROM departamentos";
        $result = mysqli_query($conexion, $sql);
        
        if ($result) {
            while ($row = mysqli_fetch_assoc($result)) {
                $cacheDepartamentos[$row['id_departamento']] = $row['nombre_departamento'];
            }
        }
    }
    
    return $cacheDepartamentos[$id_departamento] ?? 'Sin Departamento';
}

foreach (($nomina['departamentos'] ?? []) as $depto) {
    $nombreDepto = $depto['nombre'] ?? '';
    foreach (($depto['empleados'] ?? []) as $emp) {
        if (is_array($emp)) {
            // Para empleados "sin seguro", usar el departamento real almacenado en id_departamento
            if (strtolower(trim($nombreDepto)) === 'sin seguro' && isset($emp['id_departamento'])) {
                $emp['departamento'] = obtenerNombreDepartamento($emp['id_departamento'], $conexion);
            } else {
                // Para empleados normales, usar el nombre del departamento del que vienen
                $emp['departamento'] = $nombreDepto;
            }
            $empleados[] = $emp;
        }
    }
}

usort($empleados, function ($a, $b) {
    return strcasecmp((string)($a['nombre'] ?? ''), (string)($b['nombre'] ?? ''));
});

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
    $sql = "SELECT e.clave_empleado, e.imss, e.rfc_empleado, e.fecha_ingreso, e.salario_diario, e.salario_semanal, p.nombre_puesto
            FROM info_empleados e
            LEFT JOIN puestos_especiales p ON e.id_puestoEspecial = p.id_puestoEspecial
            WHERE e.clave_empleado IN ($placeholders)";

    $stmt = mysqli_prepare($conexion, $sql);
    if ($stmt) {
        $types = str_repeat('s', count($claves));
        $params = [];
        $params[] = & $types;
        foreach ($claves as $k => $val) {
            $params[] = & $claves[$k];
        }
        call_user_func_array([$stmt, 'bind_param'], $params);
        mysqli_stmt_execute($stmt);
        $res = mysqli_stmt_get_result($stmt);
        if ($res) {
            while ($row = mysqli_fetch_assoc($res)) {
                $extraMap[$row['clave_empleado']] = [
                    'imss' => $row['imss'] ?? '',
                    'rfc_empleado' => $row['rfc_empleado'] ?? '',
                    'fecha_ingreso' => $row['fecha_ingreso'] ?? '',
                    'nombre_puesto' => $row['nombre_puesto'] ?? '',
                    'salario_diario' => $row['salario_diario'] ?? 0,
                    'salario_semanal' => $row['salario_semanal'] ?? 0
                ];
            }
        }
        mysqli_stmt_close($stmt);
    }
}

// Etiqueta: 104mm x 50.8mm (4.094in x 2.000in)
// Importante: en TCPDF la orientación 'L' puede invertir (swap) ancho/alto.
// Para que el resultado final sea 104 x 50.8 en horizontal, pasamos el formato como [alto, ancho].
$pdf = new TCPDF('L', 'mm', [50.8, 104], true, 'UTF-8', false);
$pdf->SetCreator('Sistema SAAO');
$pdf->SetAuthor('Sistema SAAO');
$pdf->SetTitle('Tickets Zebra');
$pdf->SetSubject('Tickets');
$pdf->setPrintHeader(false);
$pdf->setPrintFooter(false);
$pdf->SetAutoPageBreak(false, 0);
$pdf->SetMargins(0, 0, 0);
$pdf->SetFont('helvetica', '', 8);

foreach ($empleados as $idx => $emp) {
    // Forzar formato correcto en cada ticket
    $pdf->AddPage('L', [50.8, 104]);
    $clave = isset($emp['clave']) ? $emp['clave'] : '';
    $extra = $clave && isset($extraMap[$clave]) ? $extraMap[$clave] : [];
    renderTicketPdf($pdf, $emp, $extra, $meta);
}

$sem = $meta['numero_semana'] ? ('_sem_' . preg_replace('/[^0-9A-Za-z_-]/', '', (string)$meta['numero_semana'])) : '';
$filename = 'tickets_zebra' . $sem . '.pdf';

// Evitar que cualquier salida previa corrompa el PDF
if (function_exists('ob_get_length') && ob_get_length()) {
    @ob_end_clean();
}

header('Content-Type: application/pdf');
header('Content-Disposition: attachment; filename="' . $filename . '"');
$pdf->Output($filename, 'D');
