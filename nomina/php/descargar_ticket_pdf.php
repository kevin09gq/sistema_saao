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

    // Obtener departamento desde la base de datos (prioridad) o del array (fallback)
    $departamento = safeText($extra['nombre_departamento'] ?? ($emp['departamento'] ?? ''));
    $departamento = preg_replace('/^\d+/', '', $departamento);

    $rfc = safeText($extra['rfc_empleado'] ?? '');
    $imss = safeText($extra['imss'] ?? '');
    $puesto = safeText($extra['nombre_puesto'] ?? '');
    
    // Convertir fecha de YYYY-MM-DD a YYYY/MM/DD
    $fechaIngreso = safeText($extra['fecha_ingreso'] ?? '');
    $fechaIngreso = str_replace('-', '/', $fechaIngreso);

    // Salarios desde base de datos
    $sueldoSemanal = toNumber($extra['salario_semanal'] ?? 0);
    $salarioDiario = toNumber($extra['salario_diario'] ?? 0);
    $extras = $salarioDiario; // Séptimo día = 1 día de salario
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

    // Calcular total de percepciones sumando todos los conceptos listados en $percepciones
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

    // Sumar todos los montos de percepciones
    $totalPercepciones = 0.0;
    foreach ($percepciones as $p) {
        $totalPercepciones += toNumber($p['monto']);
    }
    $totalDeducciones = $infonavit + $isr + $imssDed + $retardos;
    // Sumar deducciones del arreglo
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
    // REDONDEAR el sueldo neto según regla matemática estándar
    $sueldoNetoRedondeado = redondear($sueldoNeto);
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
    $deptoFontSize = strlen($departamento) > 18 ? 18 : (strlen($departamento) > 15 ? 18 : 18);
    $text(310, 18, $pt($deptoFontSize), $departamento);
    
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
    // Deducciones del arreglo conceptos
    if (isset($emp['conceptos']) && is_array($emp['conceptos'])) {
        foreach ($emp['conceptos'] as $c) {
            $nombreConcepto = safeText($c['nombre'] ?? '');
            $valor = toNumber($c['resultado'] ?? 0);
            if ($valor > 0) {
                $deducciones[] = ['label' => $nombreConcepto, 'monto' => $valor];
            }
        }
    }
    // Tarjeta (de neto_pagar)
    if (toNumber($emp['neto_pagar'] ?? 0) > 0) $deducciones[] = ['label' => 'Tarjeta', 'monto' => toNumber($emp['neto_pagar'])];
    // Préstamo
    if (toNumber($emp['prestamo'] ?? 0) > 0) $deducciones[] = ['label' => 'Préstamo', 'monto' => toNumber($emp['prestamo'])];
    // Uniformes
    if (toNumber($emp['uniformes'] ?? 0) > 0) $deducciones[] = ['label' => 'Uniformes', 'monto' => toNumber($emp['uniformes'])];
    // Checador
    if (toNumber($emp['checador'] ?? 0) > 0) $deducciones[] = ['label' => 'Checador', 'monto' => toNumber($emp['checador'])];
    // F.A/Gafet/Copia
    if (toNumber($emp['fa_gafet_cofia'] ?? 0) > 0) $deducciones[] = ['label' => 'F.A/Gafet/Copia', 'monto' => toNumber($emp['fa_gafet_cofia'])];
    // Inasistencias por descuento
    if (toNumber($emp['inasistencias_descuento'] ?? 0) > 0) $deducciones[] = ['label' => 'Inasistencias por descuento', 'monto' => toNumber($emp['inasistencias_descuento'])];

    // Deducciones adicionales
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
    
    // Definir tamaños de fuente según número de conceptos
    if ($maxConceptos <= 9) {
        // Menos de 9 conceptos: usar tamaños más pequeños para mejor ajuste
        $numRowsPrimeraHoja = $maxConceptos;
        $alturaContenidoPrimeraHoja = $numRowsPrimeraHoja * $lh;
        $fontSizeConceptos = $pt(16);  // Tamaño para conceptos
        $fontSizeTotales = $pt(18);    // Tamaño para totales
        $fontSizeTitulos = $pt(12);    // Tamaño para títulos
        $fontSizeNeto = $pt(22);       // Tamaño para neto a pagar
    } else {
        // 10 o más conceptos: usar tamaños estándar
        $numRowsPrimeraHoja = min($maxRowsPrimeraHoja, $maxConceptos);
        $alturaContenidoPrimeraHoja = $numRowsPrimeraHoja * $lh;
        $fontSizeConceptos = $pt(16);
        $fontSizeTotales = $pt(18);
        $fontSizeTitulos = $pt(20);
        $fontSizeNeto = $pt(22);
    }
    
    // Asignar variables para mantener compatibilidad con código existente
    $f16 = $fontSizeConceptos;
    $f18 = $fontSizeTotales;
    $f20 = $fontSizeTitulos;
    $f22 = $fontSizeNeto;
    
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
        // Caso para 9 conceptos o menos: mostrar todo en una página
        if ($maxConceptos <= 9) {
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
        // Manejar salto de página para más de 9 conceptos
        else {
            // Comportamiento normal para más de 8 conceptos
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
                $cellText(410, $yCellTop, 218, $lh, $fontDeduccion, $ded['label'], 'L');
                $cellText(660, $yCellTop, 182, $lh, $f16, '-$ ' . money($ded['monto']), 'C');
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
        $text(690, $yTotales + $offsetTexto, $fontTotales, '-$');
        $text(710, $yTotales + $offsetTexto, $fontTotales, money($totalDeduccionesCalculado));
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
        $text(710, $yTotales + 10, $f18, '-$' . money($totalDeduccionesCalculado));
        $pdf->Line($dot(415), $dot($yTotales), $dot(415), $dot($yTotales + 42));
        $pdf->Line($dot(10), $dot($yTotales + 42), $dot(10 + 812), $dot($yTotales + 42));
        $textB(18, $yTotales + 59, $f22, 'Neto a pagar');
        $textB(200, $yTotales + 59, $f22, '$');
        $textB(240, $yTotales + 59, $f22, money($neto));
    }
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!is_array($data) || !isset($data['nomina']) || !is_array($data['nomina'])) {
    http_response_code(400);
    header('Content-Type: text/plain; charset=UTF-8');
    echo 'Solicitud inválida.';
    exit;
}

$nomina = $data['nomina'];
$departamentoFiltrado = $data['departamento_filtrado'] ?? null;
$soloSinSeguro = isset($data['solo_sin_seguro']) ? (bool)$data['solo_sin_seguro'] : false;

$meta = [
    'numero_semana' => $nomina['numero_semana'] ?? ''
];

$empleados = [];
foreach (($nomina['departamentos'] ?? []) as $depto) {
    $nombreDepto = $depto['nombre'] ?? '';
    $nombreDeptoUpper = strtoupper($nombreDepto);
    
    // Si es vista de empleados sin seguro, incluir directamente todos los empleados
    if ($soloSinSeguro) {
        foreach (($depto['empleados'] ?? []) as $emp) {
            if (is_array($emp)) {
                $emp['departamento'] = $nombreDepto;
                $empleados[] = $emp;
            }
        }
        continue;
    }
    
    // Procesar departamentos de 40 y 10 libras con seguro
    $incluirDepartamento = false;
    
    if ($departamentoFiltrado !== null) {
        // Filtrar por el departamento seleccionado
        $filtroUpper = strtoupper($departamentoFiltrado);
        
        if (stripos($filtroUpper, '40 LIBRAS') !== false) {
            // Solo incluir departamentos de 40 libras
            if (stripos($nombreDeptoUpper, '40 LIBRAS') !== false || 
                stripos($nombreDeptoUpper, 'PRODUCCION 40 LIBRAS') !== false) {
                $incluirDepartamento = true;
            }
        } elseif (stripos($filtroUpper, '10 LIBRAS') !== false) {
            // Solo incluir departamentos de 10 libras
            if (stripos($nombreDeptoUpper, '10 LIBRAS') !== false || 
                stripos($nombreDeptoUpper, 'PRODUCCION 10 LIBRAS') !== false) {
                $incluirDepartamento = true;
            }
        } else {
            // Si el filtro no es reconocido, incluir todos
            $incluirDepartamento = true;
        }
    } else {
        // Si no hay filtro, incluir departamentos relevantes
        if (stripos($nombreDeptoUpper, '40 LIBRAS') !== false || 
            stripos($nombreDeptoUpper, '10 LIBRAS') !== false || 
            stripos($nombreDeptoUpper, 'SIN SEGURO') !== false) {
            $incluirDepartamento = true;
        }
    }
    
    if ($incluirDepartamento) {
        foreach (($depto['empleados'] ?? []) as $emp) {
            if (is_array($emp)) {
                // Si es departamento sin seguro, verificar que sea de 40 o 10 libras
                if (stripos($nombreDeptoUpper, 'SIN SEGURO') !== false) {
                    $puesto = strtoupper($emp['puesto'] ?? $emp['departamento'] ?? $emp['nombre_puesto'] ?? '');
                    $nombre = strtoupper($emp['nombre'] ?? '');
                    
                    // Solo incluir empleados de 40 y 10 libras
                    if (strpos($puesto, '40 LIBRAS') !== false || strpos($puesto, '10 LIBRAS') !== false ||
                        strpos($puesto, 'PRODUCCION 40') !== false || strpos($puesto, 'PRODUCCION 10') !== false ||
                        strpos($puesto, '40') !== false || strpos($puesto, '10') !== false ||
                        strpos($nombre, '40') !== false || strpos($nombre, '10') !== false) {
                        
                        $emp['departamento'] = 'Sin Seguro';
                        $empleados[] = $emp;
                    }
                } else {
                    // Departamento con seguro - incluir todos
                    $emp['departamento'] = $nombreDepto;
                    $empleados[] = $emp;
                }
            }
        }
    }
}

// Agregar empleados sin seguro si existen
if (isset($nomina['empleados_sin_seguro']) && is_array($nomina['empleados_sin_seguro'])) {
    foreach ($nomina['empleados_sin_seguro'] as $emp) {
        if (is_array($emp)) {
            // Verificar si es de 40 o 10 libras
            $puesto = strtoupper($emp['puesto'] ?? $emp['departamento'] ?? $emp['nombre_puesto'] ?? '');
            $nombre = strtoupper($emp['nombre'] ?? '');
            
            // Solo incluir empleados de 40 y 10 libras
            if (strpos($puesto, '40 LIBRAS') !== false || strpos($puesto, '10 LIBRAS') !== false ||
                strpos($puesto, 'PRODUCCION 40') !== false || strpos($puesto, 'PRODUCCION 10') !== false ||
                strpos($nombre, '40') !== false || strpos($nombre, '10') !== false) {
                
                $emp['departamento'] = $emp['puesto'] ?? $emp['departamento'] ?? $emp['nombre_puesto'] ?? 'Sin Seguro';
                $empleados[] = $emp;
            }
        }
    }
}

usort($empleados, function ($a, $b) {
    return strcasecmp((string)($a['nombre'] ?? ''), (string)($b['nombre'] ?? ''));
});

// Debug: Log de empleados procesados
error_log("Total empleados a procesar: " . count($empleados));
foreach ($empleados as $idx => $emp) {
    error_log("Empleado $idx: " . ($emp['clave'] ?? 'sin_clave') . " - " . ($emp['nombre'] ?? 'sin_nombre'));
}

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
    $sql = "SELECT e.clave_empleado, e.imss, e.rfc_empleado, e.fecha_ingreso, e.salario_diario, e.salario_semanal, p.nombre_puesto, d.nombre_departamento
            FROM info_empleados e
            LEFT JOIN puestos_especiales p ON e.id_puestoEspecial = p.id_puestoEspecial
            LEFT JOIN departamentos d ON e.id_departamento = d.id_departamento
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
                    'salario_semanal' => $row['salario_semanal'] ?? 0,
                    'nombre_departamento' => $row['nombre_departamento'] ?? ''
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
// Nombre del archivo según el tipo de tickets (sin seguro o normal)
$prefijo = $soloSinSeguro ? 'tickets_sin_seguro' : 'tickets_zebra';
$filename = $prefijo . $sem . '.pdf';

// Evitar que cualquier salida previa corrompa el PDF
if (function_exists('ob_get_length') && ob_get_length()) {
    @ob_end_clean();
}

header('Content-Type: application/pdf');
header('Content-Disposition: attachment; filename="' . $filename . '"');
$pdf->Output($filename, 'D');
