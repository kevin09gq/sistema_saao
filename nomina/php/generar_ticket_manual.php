<?php
require_once __DIR__ . '/../../vendor/autoload.php';
require_once __DIR__ . '/../../conexion/conexion.php';

// Importar las funciones del archivo original
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

function renderTicketPdf(TCPDF $pdf, $emp, $extra, $meta) {
    $nombre = safeText($emp['nombre'] ?? '');
    $clave = safeText($emp['clave'] ?? '');

    // Eliminar números del inicio del departamento
    $departamento = safeText($emp['departamento'] ?? '');
    $departamento = preg_replace('/^\d+/', '', $departamento);

    // $rfc y $imss eliminados
    $puesto = safeText($extra['nombre_puesto'] ?? '');
    
    // Convertir fecha de YYYY-MM-DD a YYYY/MM/DD
    $fechaIngreso = safeText($extra['fecha_ingreso'] ?? '');
    $fechaIngreso = str_replace('-', '/', $fechaIngreso);

    // Salarios desde base de datos
    $sueldoSemanal = toNumber($extra['salario_semanal'] ?? 0);
    $salarioDiario = toNumber($extra['salario_diario'] ?? 0);
    $extras = $salarioDiario;
    $vacaciones = toNumber($emp['vacaciones'] ?? 0);

    $sueldoBase = toNumber($emp['sueldo_base'] ?? 0);
    $incentivo = toNumber($emp['incentivo'] ?? 0);
    $sueldoExtraFinal = toNumber($emp['sueldo_extra_final'] ?? 0);
    $sueldoExtra = toNumber($emp['sueldo_extra'] ?? 0);
    $bonoAntiguedad = toNumber($emp['bono_antiguedad'] ?? 0);
    $actividadesEspeciales = toNumber($emp['actividades_especiales'] ?? 0);
    $bonoPuesto = toNumber($emp['bono_puesto'] ?? 0);

    $infonavit = 0.0;
    $isr = 0.0;
    $imssDed = 0.0;
    $retardos = 0.0;

    $conceptosAdicionales = (isset($emp['conceptos_adicionales']) && is_array($emp['conceptos_adicionales'])) ? $emp['conceptos_adicionales'] : [];
    $totalConceptosAdicionales = 0.0;
    foreach ($conceptosAdicionales as $c) {
        $totalConceptosAdicionales += toNumber($c['valor'] ?? 0);
    }

    // Sumar todos los montos de percepciones
    $totalPercepciones = 0.0;
    $percepciones = [];
    $conceptoNum = 1;
    if ($sueldoBase > 0) $percepciones[] = ['label' => $conceptoNum++ . ' Sueldo neto', 'monto' => $sueldoBase];
    if ($incentivo > 0) $percepciones[] = ['label' => $conceptoNum++ . ' Incentivo', 'monto' => $incentivo];
    if ($sueldoExtra > 0) $percepciones[] = ['label' => $conceptoNum++ . ' Horas extras', 'monto' => $sueldoExtra];
    if ($bonoAntiguedad > 0) $percepciones[] = ['label' => $conceptoNum++ . ' Bono antiguedad', 'monto' => $bonoAntiguedad];
    if ($emp['aplicar_bono'] ?? 0 > 0) $percepciones[] = ['label' => $conceptoNum++ . ' Aplicar bono', 'monto' => toNumber($emp['aplicar_bono'])];
    if ($actividadesEspeciales > 0) $percepciones[] = ['label' => $conceptoNum++ . ' Actividades especiales', 'monto' => $actividadesEspeciales];
    if ($bonoPuesto > 0) $percepciones[] = ['label' => $conceptoNum++ . ' Puesto', 'monto' => $bonoPuesto];
    foreach ($conceptosAdicionales as $c) {
        $nombreC = safeText($c['nombre'] ?? 'Concepto');
        $valorC = toNumber($c['valor'] ?? 0);
        if ($valorC > 0) {
            $percepciones[] = ['label' => $conceptoNum++ . ' ' . $nombreC, 'monto' => $valorC];
        }
    }
    foreach ($percepciones as $p) {
        $totalPercepciones += toNumber($p['monto']);
    }
    // Sumar deducciones
    $deducciones = [];
    if (isset($emp['conceptos']) && is_array($emp['conceptos'])) {
        foreach ($emp['conceptos'] as $c) {
            $nombreConcepto = safeText($c['nombre'] ?? '');
            $valor = toNumber($c['resultado'] ?? 0);
            if ($valor > 0) {
                $deducciones[] = ['label' => $nombreConcepto, 'monto' => $valor];
            }
        }
    }
    if (toNumber($emp['neto_pagar'] ?? 0) > 0) $deducciones[] = ['label' => 'Tarjeta', 'monto' => toNumber($emp['neto_pagar'])];
    if (toNumber($emp['prestamo'] ?? 0) > 0) $deducciones[] = ['label' => 'Préstamo', 'monto' => toNumber($emp['prestamo'])];
    if (toNumber($emp['uniformes'] ?? 0) > 0) $deducciones[] = ['label' => 'Uniformes', 'monto' => toNumber($emp['uniformes'])];
    if (toNumber($emp['checador'] ?? 0) > 0) $deducciones[] = ['label' => 'Checador', 'monto' => toNumber($emp['checador'])];
    if (toNumber($emp['fa_gafet_cofia'] ?? 0) > 0) $deducciones[] = ['label' => 'F.A/Gafet/Copia', 'monto' => toNumber($emp['fa_gafet_cofia'])];
    if (toNumber($emp['inasistencias_minutos'] ?? 0) > 0) $deducciones[] = ['label' => 'Inasistencias (minutos)', 'monto' => toNumber($emp['inasistencias_minutos'])];
    if (toNumber($emp['inasistencias_descuento'] ?? 0) > 0) $deducciones[] = ['label' => 'Inasistencias por descuento', 'monto' => toNumber($emp['inasistencias_descuento'])];
    if (isset($emp['deducciones_adicionales']) && is_array($emp['deducciones_adicionales'])) {
        foreach ($emp['deducciones_adicionales'] as $dedAd) {
            $nombreDed = safeText($dedAd['nombre'] ?? 'Deducción adicional');
            $valorDed = toNumber($dedAd['valor'] ?? 0);
            if ($valorDed > 0) {
                $deducciones[] = ['label' => $nombreDed, 'monto' => $valorDed];
            }
        }
    }
    $totalDeduccionesCalculado = 0.0;
    foreach ($deducciones as $d) {
        $totalDeduccionesCalculado += toNumber($d['monto']);
    }
    // Calcular sueldo neto como total percepciones menos total deducciones
    $sueldoNeto = $totalPercepciones - $totalDeduccionesCalculado;
    // Redondeo: <.50 hacia abajo, >=.50 hacia arriba
    $sueldoNetoRedondeado = (int)($sueldoNeto + 0.5);
    // Agregar sueldo neto como último concepto de percepciones
    $percepciones[] = ['label' => $conceptoNum++ . ' Sueldo neto', 'monto' => $sueldoNetoRedondeado];
    $neto = $sueldoNetoRedondeado;

    $semana = safeText($meta['numero_semana'] ?? '');

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
        $value = substr((string)$value, 0, 50);
        $pdf->Cell($dot($wDot), $dot($hDot), $value, 0, 0, $align, false, '', 0, false, 'C', 'M');
    };

    $pdf->SetLineWidth($dot(2));
    $pdf->Rect($dot(10), $dot(10), $dot(812), $dot(386));

    // Cabecera consolidada: Clave | Nombre | Departamento | Fecha Ingreso | Semana
    $nombreCompleto = $clave . ' ' . $nombre;
    $nombreFontSize = strlen($nombreCompleto) > 35 ? 8 : (strlen($nombreCompleto) >= 31 ? 12 : 14);
    $textB(12, 20, $pt($nombreFontSize), $nombreCompleto);
    $deptoFontSize = strlen($departamento) > 18 ? 18 : (strlen($departamento) > 15 ? 18 : 18);
    $text(310, 18, $pt($deptoFontSize), $departamento);
    $text(515, 18, $pt(18), 'F.Ingr: ' . $fechaIngreso);
    $text(710, 18, $pt(18), 'SEM ' . $semana);

    $pdf->SetLineWidth($dot(1));
    $pdf->Line($dot(10), $dot(40), $dot(10 + 812), $dot(40));
    $pdf->SetLineWidth($dot(1));
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
    // Subir los títulos de las columnas
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
    $percepciones = [];
    if ($sueldoBase > 0) $percepciones[] = ['label' => $conceptoNum++ . ' Sueldo neto', 'monto' => $sueldoBase];
    if ($incentivo > 0) $percepciones[] = ['label' => $conceptoNum++ . ' Incentivo', 'monto' => $incentivo];
    // Subconceptos de sueldo extra ahora serán conceptos normales
    if ($sueldoExtra > 0) $percepciones[] = ['label' => $conceptoNum++ . ' Horas extras', 'monto' => $sueldoExtra];
    if ($bonoAntiguedad > 0) $percepciones[] = ['label' => $conceptoNum++ . ' Bono antiguedad', 'monto' => $bonoAntiguedad];
    if ($emp['aplicar_bono'] ?? 0 > 0) $percepciones[] = ['label' => $conceptoNum++ . ' Aplicar bono', 'monto' => toNumber($emp['aplicar_bono'])];
    if ($actividadesEspeciales > 0) $percepciones[] = ['label' => $conceptoNum++ . ' Actividades especiales', 'monto' => $actividadesEspeciales];
    if ($bonoPuesto > 0) $percepciones[] = ['label' => $conceptoNum++ . ' Puesto', 'monto' => $bonoPuesto];
    foreach ($conceptosAdicionales as $c) {
        $nombreC = safeText($c['nombre'] ?? 'Concepto');
        $valorC = toNumber($c['valor'] ?? 0);
        if ($valorC > 0) {
            $percepciones[] = ['label' => $conceptoNum++ . ' ' . $nombreC, 'monto' => $valorC];
        }
    }
    $deducciones = [];
    if (isset($emp['conceptos']) && is_array($emp['conceptos'])) {
        foreach ($emp['conceptos'] as $c) {
            $nombreConcepto = safeText($c['nombre'] ?? '');
            $valor = toNumber($c['resultado'] ?? 0);
            if ($valor > 0) {
                $deducciones[] = ['label' => $nombreConcepto, 'monto' => $valor];
            }
        }
    }
    if (toNumber($emp['neto_pagar'] ?? 0) > 0) $deducciones[] = ['label' => 'Tarjeta', 'monto' => toNumber($emp['neto_pagar'])];
    if (toNumber($emp['prestamo'] ?? 0) > 0) $deducciones[] = ['label' => 'Préstamo', 'monto' => toNumber($emp['prestamo'])];
    if (toNumber($emp['uniformes'] ?? 0) > 0) $deducciones[] = ['label' => 'Uniformes', 'monto' => toNumber($emp['uniformes'])];
    if (toNumber($emp['checador'] ?? 0) > 0) $deducciones[] = ['label' => 'Checador', 'monto' => toNumber($emp['checador'])];
    if (toNumber($emp['fa_gafet_cofia'] ?? 0) > 0) $deducciones[] = ['label' => 'F.A/Gafet/Copia', 'monto' => toNumber($emp['fa_gafet_cofia'])];
    if (toNumber($emp['inasistencias_minutos'] ?? 0) > 0) $deducciones[] = ['label' => 'Inasistencias (minutos)', 'monto' => toNumber($emp['inasistencias_minutos'])];
    if (toNumber($emp['inasistencias_descuento'] ?? 0) > 0) $deducciones[] = ['label' => 'Inasistencias por descuento', 'monto' => toNumber($emp['inasistencias_descuento'])];

    if (isset($emp['deducciones_adicionales']) && is_array($emp['deducciones_adicionales'])) {
        foreach ($emp['deducciones_adicionales'] as $dedAd) {
            $nombreDed = safeText($dedAd['nombre'] ?? 'Deducción adicional');
            $valorDed = toNumber($dedAd['valor'] ?? 0);
            if ($valorDed > 0) {
                $deducciones[] = ['label' => $nombreDed, 'monto' => $valorDed];
            }
        }
    }

    $maxConceptos = max(count($percepciones), count($deducciones));
    $tableTopPrimeraHoja = 105;
    $textYOffset = 8;
    // Si hay 9 conceptos o menos, ajustar altura y tamaño de letra para mostrar totales en la misma hoja
    if ($maxConceptos <= 9) {
        $numRowsPrimeraHoja = $maxConceptos;
        $alturaContenidoPrimeraHoja = $numRowsPrimeraHoja * $lh; // solo hasta el final de conceptos
       $f16 = $pt(12); // tamaño adecuado para conceptos
        $f18 = $pt(11); // tamaño para totales
        $f20 = $pt(12);
        $f22 = $pt(13);
        $f18 = $pt(18);
    } else {
        $numRowsPrimeraHoja = min($maxRowsPrimeraHoja, $maxConceptos);
        $alturaContenidoPrimeraHoja = $numRowsPrimeraHoja * $lh;
        $f16 = $pt(16);
        $f18 = $pt(18);
        $f20 = $pt(20);
        $f22 = $pt(22);
        $f18 = $pt(18);
    }
    
    $pdf->SetLineWidth($dot(1));
    $pdf->Line($dot(305), $dot($tableTopPrimeraHoja), $dot(305), $dot($tableTopPrimeraHoja + $alturaContenidoPrimeraHoja));
    $pdf->Line($dot(700), $dot($tableTopPrimeraHoja), $dot(700), $dot($tableTopPrimeraHoja + $alturaContenidoPrimeraHoja));
    $pdf->SetLineWidth($dot(2));
    $pdf->Line($dot(415), $dot(106), $dot(415), $dot($tableTopPrimeraHoja + $alturaContenidoPrimeraHoja));
    
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
                // Ajustar tamaño de fuente según longitud del concepto
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
                // Ajustar tamaño de fuente según longitud del concepto
                $lenDeduccion = strlen($ded['label']);
                $esEnMayusculas = strtoupper($ded['label']) === $ded['label'];
                
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
                $textB(18, 22, $pt(20), $clave . ' ' . $nombre . ' - Continuación');
                $text(700, 22, $f18, 'SEM ' . $semana);
                $pdf->SetLineWidth($dot(1));
                $pdf->Line($dot(10), $dot(50), $dot(10 + 812), $dot(50));
                $pdf->SetLineWidth($dot(1));
                $pdf->Line($dot(305), $dot($tableTop), $dot(305), $dot($tableTop + $alturaContenido));
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
                $textB(18, 22, $pt(20), $clave . ' ' . $nombre . ' - Continuación');
                $text(700, 22, $f18, 'SEM ' . $semana);
                $pdf->SetLineWidth($dot(1));
                $pdf->Line($dot(10), $dot(50), $dot(10 + 812), $dot(50));
                $pdf->SetLineWidth($dot(1));
                $pdf->Line($dot(305), $dot($tableTop), $dot(305), $dot($tableTop + $alturaContenido));
                $pdf->Line($dot(700), $dot($tableTop), $dot(700), $dot($tableTop + $alturaContenido));
                $pdf->SetLineWidth($dot(2));
                $pdf->Line($dot(415), $dot($tableTop), $dot(415), $dot($tableTop + $alturaContenido));
                $currentY = $tableTop + $textYOffset;
                $row = 0;
            }
            $yCellTop = ($tableTop + ($row * $lh)) + 16;
            if (isset($percepciones[$i])) {
                $concepto = $percepciones[$i];
                // Ajustar tamaño de fuente según longitud del concepto
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
                $cellText(9, $yCellTop, 220, $lh, $fontConcepto, $concepto['label'], 'L');
                $cellText(255, $yCellTop, 183, $lh, $f16, '$ ' . money($concepto['monto']), 'C');
            }
            $yLine = ($tableTop + (($row + 1) * $lh));
            $pdf->Line($dot(10), $dot($yLine), $dot(415), $dot($yLine));
            if (isset($deducciones[$i])) {
                $ded = $deducciones[$i];
                // Ajustar tamaño de fuente según longitud del concepto
                $lenDeduccion = strlen($ded['label']);
                $esEnMayusculas = strtoupper($ded['label']) === $ded['label'];
                
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
                $cellText(410, $yCellTop, 220, $lh, $fontDeduccion, $ded['label'], 'L');
                $cellText(660, $yCellTop, 184, $lh, $f16, '-$ ' . money($ded['monto']), 'C');
            }
            $pdf->Line($dot(415), $dot($yLine), $dot(822), $dot($yLine));
            $currentY += $lh;
            $row++;
        }
    }

    // Calcular total de deducciones del arreglo
    $totalDeduccionesCalculado = 0;
    foreach ($deducciones as $d) {
        $totalDeduccionesCalculado += toNumber($d['monto']);
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
             $fontTotales = $pt(18); 
            $fontNeto = $pt(17); 
            $alturaCelda = 30;
            $offsetTexto = 8;
            $offsetNeto = 31;
        }
        $text(18, $yTotales + $offsetTexto, $fontTotales, 'Total Percepciones');
        $text(310, $yTotales + $offsetTexto, $fontTotales, '$' . money($totalPercepciones));
        $text(430, $yTotales + $offsetTexto, $fontTotales, 'Total Deducciones');
        $text(710, $yTotales + $offsetTexto, $fontTotales, '-$' . money($totalDeduccionesCalculado));
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
        $pdf->Text($dot(310), $dot($yTotales + 9), '$' . money($totalPercepciones));
        $pdf->Text($dot(430), $dot($yTotales + 9), 'Total Deducciones');
        $pdf->Text($dot(710), $dot($yTotales + 9), '-$' . money($totalDeduccionesCalculado));
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
        $text(680, $yTotales + 10, $f18, '-$');
        $text(720, $yTotales + 10, $f18, money($totalDeduccionesCalculado));
        $pdf->Line($dot(415), $dot($yTotales), $dot(415), $dot($yTotales + 42));
        $pdf->Line($dot(10), $dot($yTotales + 42), $dot(10 + 812), $dot($yTotales + 42));
        $textB(18, $yTotales + 59, $f22, 'Neto a pagar');
        $textB(200, $yTotales + 59, $f22, '$');
        $textB(240, $yTotales + 59, $f22, money($neto));
    }
}

// Obtener datos del formulario
$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!$data) {
    die(json_encode(['error' => 'Datos no válidos']));
}

// Construir arrays de datos igual que el archivo original
$emp = [
    'nombre' => $data['nombre'] ?? '',
    'clave' => $data['clave'] ?? '',
    'departamento' => $data['departamento'] ?? '',
    'vacaciones' => toNumber($data['vacaciones'] ?? 0),
    'sueldo_base' => toNumber($data['sueldo_base'] ?? 0),
    'incentivo' => toNumber($data['incentivo'] ?? 0),
    'sueldo_extra_final' => toNumber($data['sueldo_extra_final'] ?? 0),
    'sueldo_extra' => toNumber($data['sueldo_extra'] ?? 0),
    'bono_antiguedad' => toNumber($data['bono_antiguedad'] ?? 0),
    'actividades_especiales' => toNumber($data['actividades_especiales'] ?? 0),
    'bono_puesto' => toNumber($data['bono_puesto'] ?? 0),
    'aplicar_bono' => toNumber($data['aplicar_bono'] ?? 0),
    'conceptos_adicionales' => $data['conceptos_adicionales'] ?? [],
    'sueldo_a_cobrar' => toNumber($data['sueldo_a_cobrar'] ?? 0),
    'neto_pagar' => toNumber($data['neto_pagar'] ?? 0),
    'prestamo' => toNumber($data['prestamo'] ?? 0),
    'uniformes' => toNumber($data['uniformes'] ?? 0),
    'checador' => toNumber($data['checador'] ?? 0),
    'fa_gafet_cofia' => toNumber($data['fa_gafet_cofia'] ?? 0),
    'inasistencias_minutos' => toNumber($data['inasistencias_minutos'] ?? 0),
    'inasistencias_descuento' => toNumber($data['inasistencias_descuento'] ?? 0),
    'deducciones_adicionales' => $data['deducciones_adicionales'] ?? [],
];

// Construir array de conceptos (deducciones)
$conceptos = [];

// Agregar ISR si tiene valor
if (toNumber($data['isr'] ?? 0) > 0) {
    $conceptos[] = [
        'nombre' => 'ISR',
        'resultado' => toNumber($data['isr'])
    ];
}

// Agregar IMSS si tiene valor
if (toNumber($data['imss_descuento'] ?? 0) > 0) {
    $conceptos[] = [
        'nombre' => 'IMSS',
        'resultado' => toNumber($data['imss_descuento'])
    ];
}

// Agregar INFONAVIT si tiene valor
if (toNumber($data['infonavit'] ?? 0) > 0) {
    $conceptos[] = [
        'nombre' => 'INFONAVIT',
        'resultado' => toNumber($data['infonavit'])
    ];
}

// Agregar conceptos adicionales del formulario
if (isset($data['conceptos']) && is_array($data['conceptos'])) {
    $conceptos = array_merge($conceptos, $data['conceptos']);
}

$emp['conceptos'] = $conceptos;

$extra = [
    'rfc_empleado' => $data['rfc_empleado'] ?? '',
    'imss' => $data['imss'] ?? '',
    'nombre_puesto' => $data['nombre_puesto'] ?? '',
    'fecha_ingreso' => $data['fecha_ingreso'] ?? '',
    'salario_diario' => toNumber($data['salario_diario'] ?? 0),
    'salario_semanal' => toNumber($data['salario_semanal'] ?? 0),
];

$meta = [
    'numero_semana' => $data['numero_semana'] ?? ''
];

// Crear PDF con el mismo formato
$pdf = new TCPDF('L', 'mm', [50.8, 104], true, 'UTF-8', false);
$pdf->SetCreator('Sistema SAAO');
$pdf->SetAuthor('Sistema SAAO');
$pdf->SetTitle('Ticket Manual');
$pdf->SetSubject('Ticket Manual');
$pdf->setPrintHeader(false);
$pdf->setPrintFooter(false);
$pdf->SetAutoPageBreak(false, 0);
$pdf->SetMargins(0, 0, 0);
$pdf->SetFont('helvetica', '', 8);
$pdf->AddPage('L', [50.8, 104]);

renderTicketPdf($pdf, $emp, $extra, $meta);

$filename = 'ticket_manual_' . date('Ymd_His') . '.pdf';

// Limpiar cualquier output anterior
if (ob_get_length()) {
    ob_end_clean();
}

header('Content-Type: application/pdf');
header('Content-Disposition: attachment; filename="' . $filename . '"');
header('Cache-Control: private, max-age=0, must-revalidate');
header('Pragma: public');

$pdf->Output($filename, 'D');
exit;
