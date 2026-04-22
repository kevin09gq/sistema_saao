<?php

require_once __DIR__ . '/../../conexion/conexion.php';
require_once __DIR__ . '/../../vendor/autoload.php';
require_once __DIR__ . '/../../vendor/tecnickcom/tcpdf/tcpdf.php';

function toNumber($v) {
    if ($v === null) return 0.0;
    if (is_string($v)) $v = str_replace([',', '$', ' '], '', $v);
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

function renderTicketPdf($pdf, $emp, $extra, $meta) {
    $nombre = safeText($emp['nombre'] ?? '');
    $claveRaw = safeText($emp['clave'] ?? '');
    $claveMostrar = (!empty($emp['sin_seguro_ticket']) ? ('SS/' . $claveRaw) : $claveRaw);

    $departamento = safeText($emp['departamento'] ?? '');
    $departamento = preg_replace('/^\d+\s*/', '', $departamento);

    $puesto = safeText($extra['nombre_puesto'] ?? '');
    $fechaIngreso = safeText($extra['fecha_ingreso'] ?? '');
    $fechaIngreso = str_replace('-', '/', $fechaIngreso);

    $sueldoSemanalHeader = toNumber($extra['salario_semanal'] ?? ($emp['salario_semanal'] ?? 0));
    $sueldoSemanalConcepto = toNumber($emp['sueldo_semanal'] ?? ($emp['salario_semanal'] ?? ($extra['salario_semanal'] ?? 0)));
    if ($sueldoSemanalConcepto <= 0 && $sueldoSemanalHeader > 0) {
        $sueldoSemanalConcepto = $sueldoSemanalHeader;
    }
    $salarioDiario = toNumber($extra['salario_diario'] ?? 0);

    $percepcionesExtra = is_array($emp['percepciones_extra'] ?? null) ? $emp['percepciones_extra'] : [];
    $extrasAdicionales = is_array($emp['extras_adicionales'] ?? null) ? $emp['extras_adicionales'] : [];
    $vacaciones = toNumber($emp['vacaciones'] ?? 0);
    $pasaje = toNumber($emp['pasaje'] ?? 0);

    $conceptos = is_array($emp['conceptos'] ?? null) ? $emp['conceptos'] : [];
    $getConcepto = function ($codigo) use ($conceptos) {
        foreach ($conceptos as $c) {
            if ((string)($c['codigo'] ?? '') === (string)$codigo) {
                return toNumber($c['resultado'] ?? 0);
            }
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
    $deduccionesAdicionales = [];
    if (is_array($emp['deducciones_adicionales'] ?? null)) {
        $deduccionesAdicionales = $emp['deducciones_adicionales'];
    } elseif (is_array($emp['deducciones_extra'] ?? null)) {
        // En confianza, las deducciones adicionales se guardan como deducciones_extra: [{nombre, cantidad}]
        $deduccionesAdicionales = $emp['deducciones_extra'];
    }
    $prestamo = toNumber($emp['prestamo'] ?? 0);
    $tarjeta = toNumber($emp['tarjeta'] ?? 0);

    $totalPercepcionesTemp = $sueldoSemanalConcepto + $vacaciones + $pasaje;
    foreach ($percepcionesExtra as $px) $totalPercepcionesTemp += toNumber($px['cantidad'] ?? 0);
    foreach ($extrasAdicionales as $ex) {
        $totalPercepcionesTemp += toNumber($ex['resultado'] ?? ($ex['monto'] ?? ($ex['valor'] ?? 0)));
    }
    $comida = toNumber($emp['comida'] ?? 0);
    $tardeada = toNumber($emp['tardeada'] ?? 0);
    $totalPercepcionesTemp += $comida + $tardeada;

    $totalDeduccionesAdicionales = 0.0;
    foreach ($deduccionesAdicionales as $dedAd) {
        $totalDeduccionesAdicionales += toNumber(
            $dedAd['resultado'] ?? ($dedAd['valor'] ?? ($dedAd['monto'] ?? ($dedAd['cantidad'] ?? 0)))
        );
    }
    $deduccionesAdicionalesEfectivo = count($deduccionesAdicionales) > 0 ? $totalDeduccionesAdicionales : $faGafet;

    $totalDeduccionesTemp = $isr + $imssDed + $infonavit + $ajusteSub + $retardos + $permiso + $inasistencia + $uniformes + $checador + $deduccionesAdicionalesEfectivo + $prestamo + $tarjeta;

    if (isset($emp['total_cobrar']) && toNumber($emp['total_cobrar']) != 0) $neto = toNumber($emp['total_cobrar']);
    else $neto = $totalPercepcionesTemp - $totalDeduccionesTemp;

    $netoOriginal = $neto;
    $netoRedondeado = redondear($netoOriginal);
    $ajusteRedondeo = round($netoRedondeado - $netoOriginal, 2);
    $redondeoActivo = !empty($emp['redondeo_activo']);
    $redondeoGuardado = isset($emp['redondeo']) ? toNumber($emp['redondeo']) : 0.0;
    if ($redondeoActivo && abs($redondeoGuardado) > 0.0001) $ajusteRedondeo = round($redondeoGuardado, 2);
    $neto = $netoRedondeado;

    $percepciones = [];
    $conceptoNum = 1;
    // En confianza, se requiere que el Sueldo semanal salga como concepto
    $percepciones[] = ['label' => $conceptoNum++ . ' Sueldo semanal', 'monto' => $sueldoSemanalConcepto];
    if ($vacaciones > 0) $percepciones[] = ['label' => $conceptoNum++ . ' Vacaciones', 'monto' => $vacaciones];
    foreach ($extrasAdicionales as $ex) {
        $n = safeText($ex['nombre'] ?? '');
        $c = toNumber($ex['resultado'] ?? ($ex['monto'] ?? ($ex['valor'] ?? 0)));
        if ($c > 0 && $n !== '') $percepciones[] = ['label' => $conceptoNum++ . ' ' . $n, 'monto' => $c];
    }
    foreach ($percepcionesExtra as $px) {
        $n = safeText($px['nombre'] ?? '');
        $c = toNumber($px['cantidad'] ?? 0);
        if ($c > 0 && $n !== '') $percepciones[] = ['label' => $conceptoNum++ . ' ' . $n, 'monto' => $c];
    }
    if ($comida > 0) $percepciones[] = ['label' => $conceptoNum++ . ' Comida', 'monto' => $comida];
    if ($tardeada > 0) $percepciones[] = ['label' => $conceptoNum++ . ' Tardeada', 'monto' => $tardeada];
    if ($pasaje > 0) $percepciones[] = ['label' => $conceptoNum++ . ' Pasaje', 'monto' => $pasaje];
    if ($ajusteRedondeo > 0) $percepciones[] = ['label' => $conceptoNum++ . ' Redondeo', 'monto' => $ajusteRedondeo];

    $deducciones = [];
    if ($isr > 0) $deducciones[] = ['label' => 'ISR', 'monto' => $isr];
    if ($imssDed > 0) $deducciones[] = ['label' => 'IMSS', 'monto' => $imssDed];
    if ($infonavit > 0) $deducciones[] = ['label' => 'Infonavit', 'monto' => $infonavit];
    if ($ajusteSub > 0) $deducciones[] = ['label' => 'Ajustes al Sub', 'monto' => $ajusteSub];
    if ($retardos > 0) $deducciones[] = ['label' => 'Retardos', 'monto' => $retardos];
    if ($permiso > 0) $deducciones[] = ['label' => 'Permisos', 'monto' => $permiso];
    if ($inasistencia > 0) $deducciones[] = ['label' => 'Ausentismo', 'monto' => $inasistencia];
    if ($uniformes > 0) $deducciones[] = ['label' => 'Uniformes', 'monto' => $uniformes];
    if ($checador > 0) $deducciones[] = ['label' => 'Checador', 'monto' => $checador];
    foreach ($deduccionesAdicionales as $dedAd) {
        $n = safeText($dedAd['nombre'] ?? '');
        $c = toNumber($dedAd['resultado'] ?? ($dedAd['valor'] ?? ($dedAd['monto'] ?? ($dedAd['cantidad'] ?? 0))));
        if ($c > 0 && $n !== '') $deducciones[] = ['label' => $n, 'monto' => $c];
    }
    if (count($deduccionesAdicionales) === 0 && $faGafet > 0) {
        $deducciones[] = ['label' => 'Deducciones adicionales', 'monto' => $faGafet];
    }
    if ($tarjeta > 0) $deducciones[] = ['label' => 'Tarjeta', 'monto' => $tarjeta];
    if ($prestamo > 0) $deducciones[] = ['label' => 'Prestamos', 'monto' => $prestamo];
    if ($ajusteRedondeo < 0) $deducciones[] = ['label' => 'Redondeo', 'monto' => abs($ajusteRedondeo)];

    $totalPercepciones = 0.0;
    foreach ($percepciones as $p) $totalPercepciones += toNumber($p['monto']);
    $totalDeducciones = 0.0;
    foreach ($deducciones as $d) $totalDeducciones += toNumber($d['monto']);

    $semana = safeText($meta['numero_semana'] ?? '');

    $dot = function ($d) { return ((float)$d) / 8.0; };
    $pt = function ($dotH) use ($dot) { $mm = $dot($dotH); return max(4.0, $mm / 0.352777); };

    $text = function ($xDot, $yDot, $fontPt, $value) use ($pdf, $dot) {
        $pdf->SetFont('helvetica', '', $fontPt);
        $pdf->Text($dot($xDot), $dot($yDot), (string)$value);
    };
    $textB = function ($xDot, $yDot, $fontPt, $value) use ($pdf, $dot) {
        $pdf->SetFont('helvetica', 'B', $fontPt);
        $pdf->Text($dot($xDot), $dot($yDot), (string)$value);
    };
    $cellText = function ($xDot, $yDot, $wDot, $hDot, $fontPt, $value, $align = 'L', $style = '') use ($pdf, $dot) {
        $pdf->SetFont('helvetica', $style, $fontPt);
        $pdf->SetXY($dot($xDot), $dot($yDot));
        $value = substr((string)$value, 0, 50);
        $pdf->Cell($dot($wDot), $dot($hDot), $value, 0, 0, $align, false, '', 0, false, 'C', 'M');
    };

    $maxConceptos = max(count($percepciones), count($deducciones));
    $lh = 26;
    $maxRowsPrimeraHoja = 11;
    $maxRowsContinuacion = 13;
    $yInicioCeldasContinuacion = 50;

    $f16 = $pt(16);
    $f18 = $pt(18);
    $f22 = $pt(22);

    $drawPrimeraHoja = function ($alturaContenido) use ($pdf, $dot, $pt, $text, $textB, $departamento, $fechaIngreso, $puesto, $salarioDiario, $sueldoSemanalHeader, $claveMostrar, $nombre, $semana) {
        $pdf->SetTextColor(0, 0, 0);
        $pdf->SetLineWidth($dot(2));
        $pdf->Rect($dot(10), $dot(12), $dot(812), $dot(386));

        $nombreCompleto = $claveMostrar . ' ' . $nombre;
        $nombreFontSize = strlen($nombreCompleto) > 35 ? 8 : (strlen($nombreCompleto) >= 31 ? 13 : 15);
        $textB(12, 22, $pt($nombreFontSize), $nombreCompleto);

        $deptoTexto = (string)$departamento;
        $deptoLen = strlen($deptoTexto);
        $deptoFont = $pt(18);
        if ($deptoLen > 24 && $deptoLen <= 32) {
            $deptoFont = $pt(14);
        } elseif ($deptoLen > 32) {
            $deptoFont = $pt(12);
            if ($deptoLen > 38) {
                $deptoTexto = function_exists('mb_substr') ? mb_substr($deptoTexto, 0, 38, 'UTF-8') : substr($deptoTexto, 0, 38);
            }
        }
        $text(310, 20, $deptoFont, $deptoTexto);
        $text(515, 20, $pt(18), 'F.Ingr: ' . $fechaIngreso);
        $text(710, 20, $pt(18), 'SEM ' . $semana);

        $pdf->SetLineWidth($dot(1));
        $pdf->Line($dot(10), $dot(42), $dot(10 + 812), $dot(42));
        $pdf->Line($dot(280), $dot(42), $dot(280), $dot(70));
        $pdf->Line($dot(520), $dot(42), $dot(520), $dot(70));

        if ($puesto !== '') {
            $lenPuesto = strlen($puesto);
            if ($lenPuesto > 33) $puestoFontSize = 3.5;
            else if ($lenPuesto > 32) $puestoFontSize = 4;
            else if ($lenPuesto > 27) $puestoFontSize = 4.1;
            else if ($lenPuesto > 23) $puestoFontSize = 4.5;
            else if ($lenPuesto > 19) $puestoFontSize = 5;
            else if ($lenPuesto > 15) $puestoFontSize = 5.8;
            else $puestoFontSize = 6;
            $text(18, 51, $puestoFontSize, $puesto);
        }
        $text(290, 47, $pt(18), 'Sal. diario: $ ' . money($salarioDiario));
        $text(530, 47, $pt(18), 'Sal. Semanal: $ ' . money($sueldoSemanalHeader));

        $pdf->Line($dot(10), $dot(70), $dot(10 + 812), $dot(70));
        $f20 = $pt(20);
        $textB(100, 78, $f20, 'PERCEPCIONES');
        $textB(520, 78, $f20, 'DEDUCCIONES');
        $pdf->Line($dot(10), $dot(107), $dot(10 + 812), $dot(107));

        $tableTop = 105;
        $pdf->SetLineWidth($dot(1));
        $pdf->Line($dot(305), $dot($tableTop), $dot(305), $dot($tableTop + $alturaContenido));
        $pdf->Line($dot(700), $dot($tableTop), $dot(700), $dot($tableTop + $alturaContenido));
        $pdf->SetLineWidth($dot(2));
        $pdf->Line($dot(415), $dot(106), $dot(415), $dot($tableTop + $alturaContenido));
        $pdf->SetLineWidth($dot(1));
    };

    $drawContinuacion = function ($alturaContenido) use ($pdf, $dot, $pt, $text, $textB, $claveMostrar, $nombre, $semana, $yInicioCeldasContinuacion) {
        $pdf->SetTextColor(0, 0, 0);
        $pdf->SetLineWidth($dot(2));
        $pdf->Rect($dot(10), $dot(10), $dot(812), $dot(386));
        $textB(18, 22, $pt(20), $claveMostrar . ' ' . $nombre);
        $text(700, 22, $pt(18), 'SEM ' . $semana);
        $pdf->SetLineWidth($dot(1));
        $pdf->Line($dot(10), $dot($yInicioCeldasContinuacion), $dot(10 + 812), $dot($yInicioCeldasContinuacion));

        $tableTop = $yInicioCeldasContinuacion;
        $pdf->Line($dot(305), $dot($tableTop), $dot(305), $dot($tableTop + $alturaContenido));
        $pdf->Line($dot(700), $dot($tableTop), $dot(700), $dot($tableTop + $alturaContenido));
        $pdf->SetLineWidth($dot(2));
        $pdf->Line($dot(415), $dot($tableTop), $dot(415), $dot($tableTop + $alturaContenido));
        $pdf->SetLineWidth($dot(1));
    };

    $tableTopPrimera = 105;
    $rowsPrimera = min($maxRowsPrimeraHoja, max(1, $maxConceptos));
    $alturaPrimera = $rowsPrimera * $lh;
    $drawPrimeraHoja($alturaPrimera);

    for ($i = 0; $i < $rowsPrimera; $i++) {
        $yCellTop = ($tableTopPrimera + ($i * $lh)) + 16;
        if (isset($percepciones[$i])) {
            $p = $percepciones[$i];
            $cellText(9, $yCellTop, 170, $lh, $f16, $p['label'], 'L');
            $cellText(240, $yCellTop, 229, $lh, $f16, '$ ' . money($p['monto']), 'C');
        }
        if (isset($deducciones[$i])) {
            $d = $deducciones[$i];
            $cellText(415, $yCellTop, 245, $lh, $f16, $d['label'], 'L');
            $cellText(670, $yCellTop, 172, $lh, $f16, '-$ ' . money($d['monto']), 'C');
        }
        $yLine = ($tableTopPrimera + (($i + 1) * $lh));
        $pdf->Line($dot(10), $dot($yLine), $dot(415), $dot($yLine));
        $pdf->Line($dot(415), $dot($yLine), $dot(10 + 812), $dot($yLine));
    }

    $enContinuacion = ($maxConceptos > $maxRowsPrimeraHoja);
    $tableTopUltima = $tableTopPrimera;
    $alturaUltima = $alturaPrimera;
    $currentY = $tableTopPrimera + ($rowsPrimera * $lh);

    if ($enContinuacion) {
        $rowEnPagina = 0;
        $rowsEstaPagina = 0;
        $alturaContenido = 0;
        $tableTop = $yInicioCeldasContinuacion;

        for ($i = $maxRowsPrimeraHoja; $i < $maxConceptos; $i++) {
            if ((($i - $maxRowsPrimeraHoja) % $maxRowsContinuacion) === 0) {
                $rowsEstaPagina = min($maxRowsContinuacion, $maxConceptos - $i);
                $alturaContenido = $rowsEstaPagina * $lh;
                $pdf->AddPage('L', [50.8, 104]);
                $drawContinuacion($alturaContenido);
                $rowEnPagina = 0;
            }

            $yCellTop = ($tableTop + ($rowEnPagina * $lh)) + 16;
            if (isset($percepciones[$i])) {
                $p = $percepciones[$i];
                $cellText(9, $yCellTop, 170, $lh, $f16, $p['label'], 'L');
                $cellText(240, $yCellTop, 229, $lh, $f16, '$ ' . money($p['monto']), 'C');
            }
            if (isset($deducciones[$i])) {
                $d = $deducciones[$i];
                $cellText(415, $yCellTop, 245, $lh, $f16, $d['label'], 'L');
                $cellText(670, $yCellTop, 172, $lh, $f16, '-$ ' . money($d['monto']), 'C');
            }
            $yLine = ($tableTop + (($rowEnPagina + 1) * $lh));
            $pdf->Line($dot(10), $dot($yLine), $dot(415), $dot($yLine));
            $pdf->Line($dot(415), $dot($yLine), $dot(10 + 812), $dot($yLine));

            $rowEnPagina++;
            $tableTopUltima = $tableTop;
            $alturaUltima = $alturaContenido;
            $currentY = $tableTop + ($rowEnPagina * $lh);
        }
    }

    $yTotales = $enContinuacion ? ($currentY + 2) : ($tableTopUltima + $alturaUltima + 16);
    $maxYTotales = 317;
    if ($yTotales > $maxYTotales) {
        $pdf->AddPage('L', [50.8, 104]);
        $drawContinuacion(0);
        $yTotales = 50;
    }

    $pdf->SetLineWidth($dot(2));
    $pdf->Line($dot(10), $dot($yTotales), $dot(10 + 812), $dot($yTotales));
    $pdf->SetLineWidth($dot(1));
    $text(18, $yTotales + 10, $f18, 'Total Percepciones');
    $text(210, $yTotales + 10, $f18, '$' . money($totalPercepciones));
    $text(430, $yTotales + 10, $f18, 'Total Deducciones');
    $text(710, $yTotales + 10, $f18, '-$' . money($totalDeducciones));
    $pdf->Line($dot(415), $dot($yTotales), $dot(415), $dot($yTotales + 42));
    $pdf->Line($dot(10), $dot($yTotales + 42), $dot(10 + 812), $dot($yTotales + 42));
    $textB(18, $yTotales + 59, $f22, 'Neto a pagar');
    $textB(200, $yTotales + 59, $f22, '$');
    $textB(240, $yTotales + 59, $f22, money($neto));
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
$meta = ['numero_semana' => $nomina['numero_semana'] ?? ''];
$prefix = safeText($data['filename_prefix'] ?? 'tickets_confianza');

$empleados = [];
foreach (($nomina['departamentos'] ?? []) as $depto) {
    $deptoNombre = (string)($depto['nombre'] ?? '');
    foreach (($depto['empleados'] ?? []) as $emp) {
        if (!is_array($emp)) continue;
        if (!isset($emp['departamento']) || $emp['departamento'] === '') $emp['departamento'] = $deptoNombre;
        $empleados[] = $emp;
    }
}

usort($empleados, function ($a, $b) {
    return strcasecmp((string)($a['nombre'] ?? ''), (string)($b['nombre'] ?? ''));
});

$clavesEmpresa = [];
foreach ($empleados as $emp) {
    $clave = trim((string)($emp['clave'] ?? ''));
    if ($clave === '') continue;
    $id_empresa = isset($emp['id_empresa']) ? (int)$emp['id_empresa'] : 1;
    $k = $clave . '|' . $id_empresa;
    $clavesEmpresa[$k] = ['clave_empleado' => $clave, 'id_empresa' => $id_empresa];
}
$clavesEmpresa = array_values($clavesEmpresa);

$extras_map = [];
if (count($clavesEmpresa) > 0) {
    $in_params = implode(',', array_fill(0, count($clavesEmpresa), '(?, ?)'));
    $sqlStr = "SELECT e.clave_empleado, e.id_empresa, p.nombre_puesto, d.nombre_departamento, e.fecha_ingreso, e.salario_semanal, e.salario_diario
               FROM info_empleados e
               LEFT JOIN puestos_especiales p ON e.id_puestoEspecial = p.id_puestoEspecial
               LEFT JOIN departamentos d ON e.id_departamento = d.id_departamento
               WHERE (e.clave_empleado, e.id_empresa) IN ($in_params)";
    $stmt = $conexion->prepare($sqlStr);
    if ($stmt) {
        $types = str_repeat('si', count($clavesEmpresa));
        $params = [];
        $params[] = & $types;
        foreach ($clavesEmpresa as $i => $ce) {
            $params[] = & $clavesEmpresa[$i]['clave_empleado'];
            $params[] = & $clavesEmpresa[$i]['id_empresa'];
        }
        call_user_func_array([$stmt, 'bind_param'], $params);
        $stmt->execute();
        $res = $stmt->get_result();
        if ($res) {
            while ($row = $res->fetch_assoc()) {
                $key = $row['clave_empleado'] . '_' . $row['id_empresa'];
                $extras_map[$key] = [
                    'nombre_puesto' => $row['nombre_puesto'] ?? '',
                    'nombre_departamento' => $row['nombre_departamento'] ?? '',
                    'fecha_ingreso' => $row['fecha_ingreso'] ?? '',
                    'salario_semanal' => $row['salario_semanal'] ?? 0,
                    'salario_diario' => $row['salario_diario'] ?? 0
                ];
            }
        }
        $stmt->close();
    }
}

$pdf = new \TCPDF('L', 'mm', [50.8, 104], true, 'UTF-8', false);
$pdf->SetCreator('Sistema SAAO');
$pdf->SetAuthor('Sistema SAAO');
$pdf->SetTitle('Tickets');
$pdf->setPrintHeader(false);
$pdf->setPrintFooter(false);
$pdf->SetAutoPageBreak(false, 0);
$pdf->SetMargins(0, 0, 0);
$pdf->SetFont('helvetica', '', 8);

foreach ($empleados as $emp) {
    $clave = (string)($emp['clave'] ?? '');
    $id_empresa = isset($emp['id_empresa']) ? (int)$emp['id_empresa'] : 1;
    $key = $clave . '_' . $id_empresa;
    $extra = [
        'nombre_puesto' => $emp['puesto'] ?? '',
        'nombre_departamento' => $emp['departamento'] ?? '',
        'fecha_ingreso' => $emp['fecha_ingreso'] ?? '',
        'salario_semanal' => $emp['salario_semanal'] ?? 0,
        'salario_diario' => $emp['salario_diario'] ?? 0
    ];
    if (isset($extras_map[$key])) {
        $extra = $extras_map[$key];
    }
    if (!empty($extra['nombre_departamento'])) $emp['departamento'] = $extra['nombre_departamento'];
    $pdf->AddPage('L', [50.8, 104]);
    renderTicketPdf($pdf, $emp, $extra, $meta);
}

if (function_exists('ob_get_length') && ob_get_length()) {
    @ob_end_clean();
}

$sem = $meta['numero_semana'] ? ('_sem_' . preg_replace('/[^0-9A-Za-z_-]/', '', (string)$meta['numero_semana'])) : '';
$filename = preg_replace('/[^0-9A-Za-z_-]/', '', $prefix) . $sem . '.pdf';

header('Content-Type: application/pdf');
header('Content-Disposition: attachment; filename="' . $filename . '"');
header('Cache-Control: private, max-age=0, must-revalidate');
header('Pragma: public');

echo $pdf->Output($filename, 'S');
