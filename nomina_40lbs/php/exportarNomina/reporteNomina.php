<?php
//=====================================
// DEPENDENCIAS
//=====================================

require_once __DIR__ . '/../../../vendor/autoload.php';

//=====================================
// CLASE: PDFEncabezado
//=====================================

class PDFEncabezado extends TCPDF
{
    private $tituloNomina;
    private $numeroSemana;
    private $fechaCierre;

    public function setDatosNomina($titulo, $semana, $fecha)
    {
        $this->tituloNomina = $titulo;
        $this->numeroSemana = $semana;
        $this->fechaCierre = $fecha;
    }

    public function Header()
    {
        // Logo
        $logo = __DIR__ . '/../../../public/img/logo.jpg';
        if (file_exists($logo)) {
            $this->Image($logo, 15, 10, 25, 0, '', '', '', false, 300);
        }

        // Título principal
        $this->SetFont('helvetica', 'B', 16);
        $this->SetY(12);
        $this->Cell(0, 10, 'REPORTE NÓMINA CITRICOS SAAO S.A DE C.V', 0, 1, 'C', 0, '', 0, false, 'M', 'M');

        // Subtítulo
        $this->SetFont('helvetica', 'B', 12);
        $this->Cell(0, 8, $this->tituloNomina, 0, 1, 'C');

        // Semana y fecha de cierre
        $this->SetFont('dejavusans', '', 10);
        $this->Cell(0, 6, 'Semana: ' . str_pad($this->numeroSemana, 2, '0', STR_PAD_LEFT) . ' | Fecha de Cierre: ' . $this->fechaCierre, 0, 1, 'C');

        // Fecha generado
        $this->SetFont('dejavusans', '', 9);
        $this->Cell(0, 6, 'Generado el: ' . date('d/m/Y H:i:s'), 0, 1, 'R');

        // Línea separadora
        $this->Line(10, 42, $this->getPageWidth() - 10, 42);
        $this->SetY(45);
    }

    // Pie de página 
    public function Footer()
    {
        $this->SetY(-15);
        $this->SetFont('dejavusans', 'I', 8);
        $this->Cell(0, 10, 'Página ' . $this->getAliasNumPage() . '/' . $this->getAliasNbPages(), 0, false, 'C', 0, '', 0, false, 'T', 'M');
    }
}


//=====================================
// FUNCIONES AUXILIARES
//=====================================

function mesEnLetras($mes)
{
    $meses = [
        'Ene' => 'ENERO', 'Feb' => 'FEBRERO', 'Mar' => 'MARZO', 'Abr' => 'ABRIL',
        'May' => 'MAYO', 'Jun' => 'JUNIO', 'Jul' => 'JULIO', 'Ago' => 'AGOSTO',
        'Sep' => 'SEPTIEMBRE', 'Oct' => 'OCTUBRE', 'Nov' => 'NOVIEMBRE', 'Dic' => 'DICIEMBRE'
    ];
    return isset($meses[$mes]) ? $meses[$mes] : strtoupper($mes);
}

function formatearFechaNomina($fecha)
{
    $partes = explode('/', $fecha);
    if (count($partes) !== 3) return $fecha;

    $dia = ltrim($partes[0], '0');
    $mes = mesEnLetras($partes[1]);
    $anio = $partes[2];

    return $dia . ' DE ' . $mes . ' DEL ' . $anio;
}

function obtenerTituloPeriodo($fecha_inicio, $fecha_cierre)
{
    if (!$fecha_inicio || !$fecha_cierre) return '[PERIODO]';

    $partes_inicio = explode('/', $fecha_inicio);
    $partes_cierre = explode('/', $fecha_cierre);
    $anio_inicio = isset($partes_inicio[2]) ? $partes_inicio[2] : '';
    $anio_cierre = isset($partes_cierre[2]) ? $partes_cierre[2] : '';

    if ($anio_inicio === $anio_cierre) {
        $dia_inicio = ltrim($partes_inicio[0], '0');
        $dia_cierre = ltrim($partes_cierre[0], '0');
        $mes = mesEnLetras($partes_cierre[1]);
        $anio = $anio_cierre;
        return $dia_inicio . ' AL ' . $dia_cierre . ' DE ' . $mes . ' DEL ' . $anio;
    } else {
        return formatearFechaNomina($fecha_inicio) . ' AL ' . formatearFechaNomina($fecha_cierre);
    }
}

function formatoMoneda($monto)
{
    if ($monto == 0) return '$0.00';
    $prefijo = $monto < 0 ? '$-' : '$';
    return $prefijo . number_format(abs((float)$monto), 2, '.', ',');
}

//=====================================
// RECEPCIÓN DE DATOS
//=====================================

$numero_semana = $_POST['numero_semana'] ?? '';
$fecha_cierre = $_POST['fecha_cierre'] ?? '';
$fecha_inicio = $_POST['fecha_inicio'] ?? '';
$jsonNominaStr = $_POST['jsonNomina'] ?? '{}';
$datosNomina = json_decode($jsonNominaStr, true);

$tituloNomina = 'NÓMINA DEL ' . obtenerTituloPeriodo($fecha_inicio, $fecha_cierre);

//=====================================
// CLASIFICACIÓN DE GRUPOS DINÁMICA
//=====================================

$grupos = [];

if (isset($datosNomina['departamentos']) && is_array($datosNomina['departamentos'])) {
    foreach ($datosNomina['departamentos'] as $depto) {
        // Solo procesar departamentos oficiales (editar: true)
        if (!isset($depto['editar']) || $depto['editar'] !== true) continue;

        $nombreDepto = strtoupper($depto['nombre']);

        foreach ($depto['empleados'] ?? [] as $emp) {
            if (!($emp['mostrar'] ?? true)) continue;

            $ss = $emp['seguroSocial'] ?? false;
            $suffix = $ss ? '(CSS)' : '(SSS)';
            $nombreGrupo = "{$nombreDepto} {$suffix}";

            // Inicializar grupo si no existe
            if (!isset($grupos[$nombreGrupo])) {
                $grupos[$nombreGrupo] = [];
            }

            $grupos[$nombreGrupo][] = $emp;
        }
    }
}

//=====================================
// GENERACIÓN DEL PDF
//=====================================

$pdf = new PDFEncabezado('P', 'mm', 'A4', true, 'UTF-8', false);
$pdf->setDatosNomina($tituloNomina, $numero_semana, $fecha_cierre);
$pdf->SetCreator('SAAO');
$pdf->SetAuthor('SAAO');
$pdf->SetTitle('Reporte Contable de Nómina 40LBS');
$pdf->SetMargins(10, 50, 10);
$pdf->SetHeaderMargin(10);
$pdf->SetFooterMargin(10);
$pdf->SetAutoPageBreak(TRUE, 15);

// Variables de Resumen 
$resumenPorTipo = [];
foreach ($grupos as $n => $l) {
    if (empty($l)) continue;
    $resumenPorTipo[$n] = ['count' => 0, 'neto' => 0, 'percepciones' => 0, 'deducciones' => 0, 'percepciones_detalle' => [], 'deducciones_detalle' => []];
}

$totalGeneralPercepciones = 0;
$totalGeneralDeducciones = 0;
$totalGeneralNetoRedondeado = 0;
$contadorEmpleados = 0;

//=====================================
// ITERACIÓN POR GRUPOS Y EMPLEADOS
//=====================================

foreach ($grupos as $nombreGrupo => $empleados) {
    if (empty($empleados)) continue;

    usort($empleados, fn($a, $b) => strcmp($a['nombre'] ?? '', $b['nombre'] ?? ''));

    $pdf->AddPage();
    $pdf->SetFont('helvetica', 'B', 14);
    $pdf->Cell(0, 15, $nombreGrupo, 0, 1, 'C');
    $pdf->Ln(5);

    $contLocal = 1;

    foreach ($empleados as $idx => $emp) {
        // Nueva página para cada empleado después del primero
        if ($idx > 0) $pdf->AddPage();

        $nom = strtoupper($emp['nombre'] ?? '');
        $clave = $emp['clave'] ?? 'N/A';
        $pdf->SetFont('helvetica', 'B', 12);
        $pdf->Cell(0, 8, "#{$contLocal} {$nom}", 0, 1, 'L');
        $pdf->SetFont('dejavusans', '', 10);
        $pdf->Cell(0, 6, "Clave: {$clave}", 0, 1, 'L');
        $pdf->Ln(2);

        // --- PERCEPCIONES ---
        $p = ['Sueldo Base/Neto' => (float)($emp['sueldo_neto'] ?? 0)];
        if (($emp['incentivo'] ?? 0) != 0) $p['Incentivo'] = (float)$emp['incentivo'];
        
        $extrasDetalle = [];
        if (($emp['horas_extra'] ?? 0) != 0) $extrasDetalle['Horas Extra'] = (float)$emp['horas_extra'];
        if (($emp['bono_antiguedad'] ?? 0) != 0) $extrasDetalle['Bono Antigüedad'] = (float)$emp['bono_antiguedad'];
        if (($emp['actividades_especiales'] ?? 0) != 0) $extrasDetalle['Actividades Especiales'] = (float)$emp['actividades_especiales'];
        if (($emp['puesto'] ?? 0) != 0) $extrasDetalle['Concepto Puesto'] = (float)$emp['puesto'];
        foreach ($emp['percepciones_extra'] ?? [] as $extra) {
            if (($extra['cantidad'] ?? 0) != 0) $extrasDetalle[$extra['nombre']] = (float)$extra['cantidad'];
        }

        if (!empty($extrasDetalle)) {
            $sumExtra = array_sum($extrasDetalle);
            $p['Sueldo Extra Total'] = $sumExtra;
        }

        $totalPercepcionesEmpleado = array_sum($p);

        // --- DEDUCCIONES ---
        $d = [];
        foreach ($emp['conceptos'] ?? [] as $c) {
            $m = (float)($c['resultado'] ?? 0);
            if ($m <= 0) continue;
            switch ($c['codigo']) {
                case '45': $d['ISR'] = $m; break;
                case '52': $d['IMSS'] = $m; break;
                case '16': $d['Infonavit'] = $m; break;
                case '107': $d['Ajuste al SUB'] = $m; break;
            }
        }
        if (($emp['inasistencia'] ?? 0) != 0) $d['Inasistencia'] = (float)$emp['inasistencia'];
        if (($emp['permiso'] ?? 0) != 0) $d['Permiso'] = (float)$emp['permiso'];
        if (($emp['uniforme'] ?? 0) != 0) $d['Uniforme'] = (float)$emp['uniforme'];
        if (($emp['checador'] ?? 0) != 0) $d['Biométrico'] = (float)$emp['checador'];
        if (($emp['tarjeta'] ?? 0) != 0) $d['Tarjeta'] = (float)$emp['tarjeta'];
        if (($emp['prestamo'] ?? 0) != 0) $d['Préstamo'] = (float)$emp['prestamo'];
        $extrasDDetalle = [];
        foreach ($emp['deducciones_extra'] ?? [] as $ex) {
            if (($ex['cantidad'] ?? 0) != 0) $extrasDDetalle[$ex['nombre']] = (float)$ex['cantidad'];
        }
        
        $totalExtras = array_sum($extrasDDetalle);
        if ($totalExtras != 0) $d['F.A/Gafet/Cofia'] = $totalExtras;

        $totalDeduccionesEmpleado = array_sum($d);

        // DIBUJAR TABLA EMPLEADO
        $inicioY = $pdf->GetY();
        $pdf->SetDrawColor(0, 0, 0);
        $pdf->Line(10, $inicioY, 105, $inicioY);
        $pdf->SetFont('helvetica', 'B', 10);
        $pdf->SetFillColor(240, 240, 240);
        $pdf->Cell(95, 8, 'PERCEPCIONES', 0, 1, 'C', false);
        $pdf->Line(10, $pdf->GetY(), 105, $pdf->GetY());
        $pdf->Ln(2);

        foreach ($p as $con => $mon) {
            $pdf->SetFont('dejavusans', '', 10);
            $pdf->Cell(65, 6, $con, 0, 0, 'L');
            $pdf->SetFont('dejavusansmono', '', 9);
            $pdf->Cell(30, 6, formatoMoneda($mon), 0, 1, 'R');
            if ($con === 'Sueldo Extra Total' && !empty($extrasDetalle)) {
                $pdf->SetFont('dejavusans', 'I', 8);
                foreach ($extrasDetalle as $en => $ev) {
                    $pdf->Cell(65, 5, "   • {$en}", 0, 0, 'L');
                    $pdf->Cell(30, 5, formatoMoneda($ev), 0, 1, 'R');
                }
            }
        }
        $pdf->Ln(2);
        $pdf->Line(10, $pdf->GetY(), 105, $pdf->GetY());
        $pdf->SetFont('helvetica', 'B', 11);
        $pdf->Cell(65, 7, 'Total Percepciones', 0, 0, 'R');
        $pdf->Cell(30, 7, formatoMoneda($totalPercepcionesEmpleado), 0, 1, 'R');
        $altEsq = $pdf->GetY() - $inicioY;

        $pdf->SetXY(110, $inicioY);
        $pdf->Line(110, $inicioY, 200, $inicioY);
        $pdf->SetFont('helvetica', 'B', 10);
        $pdf->Cell(90, 8, 'DEDUCCIONES', 0, 1, 'C', false);
        $pdf->SetX(110);
        $pdf->Line(110, $pdf->GetY(), 200, $pdf->GetY());
        $pdf->Ln(2);

        foreach ($d as $con => $mon) {
            $pdf->SetX(110);
            $pdf->SetFont('dejavusans', '', 10);
            $pdf->Cell(60, 6, $con, 0, 0, 'L');
            $pdf->SetFont('dejavusansmono', '', 9);
            $pdf->Cell(30, 6, formatoMoneda($mon), 0, 1, 'R');
            if ($con === 'F.A/Gafet/Cofia' && !empty($extrasDDetalle)) {
                $pdf->SetFont('dejavusans', 'I', 8);
                foreach ($extrasDDetalle as $en => $ev) {
                    $pdf->SetX(110);
                    $pdf->Cell(60, 5, "   • {$en}", 0, 0, 'L');
                    $pdf->Cell(30, 5, formatoMoneda($ev), 0, 1, 'R');
                }
            }
        }
        $pdf->Ln(2); $pdf->SetX(110);
        $pdf->Line(110, $pdf->GetY(), 200, $pdf->GetY());
        $pdf->SetX(110); $pdf->SetFont('helvetica', 'B', 11);
        $pdf->Cell(60, 7, 'Total Deducciones', 0, 0, 'R');
        $pdf->Cell(30, 7, formatoMoneda($totalDeduccionesEmpleado), 0, 1, 'R');
        $altDer = $pdf->GetY() - $inicioY;

        $pdf->SetY($inicioY + max($altEsq, $altDer) + 5);

        // NETO
        $sueldoNeto = $totalPercepcionesEmpleado - $totalDeduccionesEmpleado;
        $redondeo = (float)($emp['redondeo'] ?? 0);
        $sueldoRedondeado = $sueldoNeto + $redondeo;

        $pdf->SetLineWidth(0.1);
        $pdf->Line(10, $pdf->GetY(), 200, $pdf->GetY());
        $pdf->Ln(2);

        if ($redondeo != 0) {
            $pdf->SetFont('dejavusans', '', 10);
            $pdf->Cell(130, 6, 'SUELDO CALCULADO:', 0, 0, 'R');
            $pdf->Cell(60, 6, formatoMoneda($sueldoNeto), 0, 1, 'R');
            $pdf->Cell(130, 6, 'AJUSTE POR REDONDEO:', 0, 0, 'R');
            $pdf->Cell(60, 6, formatoMoneda($redondeo), 0, 1, 'R');
            $pdf->Ln(1);
            $pdf->SetLineWidth(0.3);
            $pdf->Line(100, $pdf->GetY(), 200, $pdf->GetY());
            $pdf->Ln(2);
        }

        $pdf->SetFillColor(250, 250, 250);
        if ($sueldoRedondeado >= 0) $pdf->SetTextColor(0, 100, 0); else $pdf->SetTextColor(200, 0, 0);
        $pdf->SetFont('helvetica', 'B', 12);
        $pdf->Cell(130, 10, 'NETO A PAGAR', 0, 0, 'R', true);
        $pdf->SetFont('dejavusansmono', 'B', 12);
        $pdf->Cell(60, 10, formatoMoneda($sueldoRedondeado), 0, 1, 'R', true);
        $pdf->SetTextColor(0,0,0);
        $pdf->Line(10, $pdf->GetY(), 200, $pdf->GetY());

        // Acumular Totales por Grupo
        $resumenPorTipo[$nombreGrupo]['count']++;
        $resumenPorTipo[$nombreGrupo]['neto'] += $sueldoRedondeado;
        $resumenPorTipo[$nombreGrupo]['percepciones'] += $totalPercepcionesEmpleado;
        $resumenPorTipo[$nombreGrupo]['deducciones'] += $totalDeduccionesEmpleado;

        foreach ($p as $k => $v) {
            if (!isset($resumenPorTipo[$nombreGrupo]['percepciones_detalle'][$k])) $resumenPorTipo[$nombreGrupo]['percepciones_detalle'][$k] = 0;
            $resumenPorTipo[$nombreGrupo]['percepciones_detalle'][$k] += $v;
        }
        if (!empty($extrasDetalle)) {
            foreach ($extrasDetalle as $en => $ev) {
                $subK = "   • {$en}";
                if (!isset($resumenPorTipo[$nombreGrupo]['percepciones_detalle'][$subK])) $resumenPorTipo[$nombreGrupo]['percepciones_detalle'][$subK] = 0;
                $resumenPorTipo[$nombreGrupo]['percepciones_detalle'][$subK] += $ev;
            }
        }

        foreach ($d as $k => $v) {
            if (!isset($resumenPorTipo[$nombreGrupo]['deducciones_detalle'][$k])) $resumenPorTipo[$nombreGrupo]['deducciones_detalle'][$k] = 0;
            $resumenPorTipo[$nombreGrupo]['deducciones_detalle'][$k] += $v;
        }
        if (!empty($extrasDDetalle)) {
            foreach ($extrasDDetalle as $en => $ev) {
                $subK = "   • {$en}";
                if (!isset($resumenPorTipo[$nombreGrupo]['deducciones_detalle'][$subK])) $resumenPorTipo[$nombreGrupo]['deducciones_detalle'][$subK] = 0;
                $resumenPorTipo[$nombreGrupo]['deducciones_detalle'][$subK] += $ev;
            }
        }

        $totalGeneralPercepciones += $totalPercepcionesEmpleado;
        $totalGeneralDeducciones += $totalDeduccionesEmpleado;
        $totalGeneralNetoRedondeado += $sueldoRedondeado;
        $contadorEmpleados++;
        $contLocal++;
    }
}

//=====================================
// PÁGINA DE RESUMEN GENERAL (Image 1 Style)
//=====================================
if ($contadorEmpleados > 0) {
    $pdf->AddPage();
    $pdf->SetFont('helvetica', 'B', 16);
    $pdf->Cell(0, 12, 'RESUMEN GENERAL', 0, 1, 'C');
    $pdf->Ln(10);

    $pdf->SetFont('helvetica', 'B', 11);
    $pdf->SetFillColor(240, 240, 240);
    $pdf->Cell(100, 10, 'CONCEPTO', 0, 0, 'C', true);
    $pdf->Cell(40, 10, 'CANTIDAD', 0, 0, 'C', true);
    $pdf->Cell(50, 10, 'TOTAL', 0, 1, 'C', true);
    $pdf->Line(10, $pdf->GetY(), 200, $pdf->GetY());
    $pdf->Ln(3);

    foreach ($resumenPorTipo as $tipo => $dat) {
        $pdf->SetFont('dejavusans', '', 10);
        $pdf->Cell(100, 8, $tipo, 0, 0, 'L');
        $pdf->SetFont('dejavusansmono', '', 9);
        $pdf->Cell(40, 8, $dat['count'], 0, 0, 'R');
        $pdf->Cell(50, 8, formatoMoneda($dat['neto']), 0, 1, 'R');
    }

    $pdf->Ln(2);
    $pdf->Line(10, $pdf->GetY(), 200, $pdf->GetY());
    $pdf->Ln(3);

    $pdf->SetFont('dejavusans', '', 10);
    $pdf->Cell(100, 8, 'Total de Empleados Procesados', 0, 0, 'L');
    $pdf->SetFont('dejavusansmono', '', 9);
    $pdf->Cell(40, 8, $contadorEmpleados, 0, 0, 'R');
    $pdf->Cell(50, 8, '', 0, 1, 'R');

    $pdf->Cell(100, 8, 'Total General de Percepciones', 0, 0, 'L');
    $pdf->Cell(40, 8, '', 0, 0, 'R');
    $pdf->Cell(50, 8, formatoMoneda($totalGeneralPercepciones), 0, 1, 'R');

    $pdf->Cell(100, 8, 'Total General de Deducciones', 0, 0, 'L');
    $pdf->Cell(40, 8, '', 0, 0, 'R');
    $pdf->Cell(50, 8, formatoMoneda($totalGeneralDeducciones), 0, 1, 'R');

    $pdf->Ln(2);
    $pdf->Line(10, $pdf->GetY(), 200, $pdf->GetY());
    $pdf->Ln(3);

    if ($totalGeneralNetoRedondeado >= 0) $pdf->SetTextColor(0, 100, 0); else $pdf->SetTextColor(200, 0, 0);
    $pdf->SetFillColor(250, 250, 250);
    $pdf->SetFont('helvetica', 'B', 12);
    $pdf->Cell(100, 10, 'TOTAL NETO A PAGAR GENERAL', 0, 0, 'L', true);
    $pdf->SetFont('dejavusansmono', 'B', 12);
    $pdf->Cell(90, 10, formatoMoneda($totalGeneralNetoRedondeado), 0, 1, 'R', true);
    $pdf->SetTextColor(0, 0, 0);
    $pdf->Ln(2);
    $pdf->Line(10, $pdf->GetY(), 200, $pdf->GetY());

    //=====================================
    // REPORTES POR TIPO DE EMPLEADO (Image 2 Style)
    //=====================================
    foreach ($resumenPorTipo as $tipo => $datos) {
        $pdf->AddPage();
        $pdf->SetFont('helvetica', 'B', 14);
        $pdf->Cell(0, 10, $tipo, 0, 1, 'C');
        $pdf->Ln(4);

        $pdf->SetFont('dejavusans', '', 10);
        $pdf->Cell(130, 8, 'Empleados', 0, 0, 'L');
        $pdf->SetFont('dejavusansmono', '', 9);
        $pdf->Cell(50, 8, $datos['count'], 0, 1, 'R');

        $pdf->SetFont('dejavusans', '', 10);
        $pdf->Cell(130, 8, 'Total Percepciones', 0, 0, 'L');
        $pdf->SetFont('dejavusansmono', '', 9);
        $pdf->Cell(50, 8, formatoMoneda($datos['percepciones']), 0, 1, 'R');

        $pdf->SetFont('dejavusans', '', 10);
        $pdf->Cell(130, 8, 'Total Deducciones', 0, 0, 'L');
        $pdf->SetFont('dejavusansmono', '', 9);
        $pdf->Cell(50, 8, formatoMoneda($datos['deducciones']), 0, 1, 'R');

        $pdf->SetFont('dejavusans', '', 10);
        $pdf->Cell(130, 8, 'Total Neto a Pagar', 0, 0, 'L');
        $pdf->SetFont('dejavusansmono', '', 9);
        $pdf->Cell(50, 8, formatoMoneda($datos['neto']), 0, 1, 'R');

        $pdf->Ln(6);

        // PERCEPCIONES por concepto
        $pdf->SetFont('helvetica', 'B', 11);
        $pdf->SetFillColor(240, 240, 240);
        $pdf->Cell(0, 8, 'PERCEPCIONES', 0, 1, 'C', true);
        $pdf->SetFillColor(255, 255, 255);

        foreach ($datos['percepciones_detalle'] as $concepto => $monto) {
            $pdf->SetFont('dejavusans', '', 10);
            $pdf->Cell(130, 6, $concepto, 0, 0, 'L');
            $pdf->SetFont('dejavusansmono', '', 9);
            $pdf->Cell(50, 6, formatoMoneda($monto), 0, 1, 'R');
        }

        $pdf->Ln(4);

        // DEDUCCIONES por concepto
        $pdf->SetFont('helvetica', 'B', 11);
        $pdf->SetFillColor(240, 240, 240);
        $pdf->Cell(0, 8, 'DEDUCCIONES', 0, 1, 'C', true);
        $pdf->SetFillColor(255, 255, 255);

        foreach ($datos['deducciones_detalle'] as $concepto => $monto) {
            $pdf->SetFont('dejavusans', '', 10);
            $pdf->Cell(130, 6, $concepto, 0, 0, 'L');
            $pdf->SetFont('dejavusansmono', '', 9);
            $pdf->Cell(50, 6, formatoMoneda($monto), 0, 1, 'R');
        }
    }

    //=====================================
    // PÁGINA FINAL: HORARIO SEMANAL
    //=====================================
    if (isset($datosNomina['horarios_semanales']) && !empty($datosNomina['horarios_semanales'])) {
        $pdf->AddPage();
        $pdf->SetFont('helvetica', 'B', 16);
        $pdf->Cell(0, 12, 'HORARIO SEMANAL DE TRABAJO', 0, 1, 'C');
        $pdf->Ln(10);

        // Encabezados de tabla
        $pdf->SetFont('helvetica', 'B', 11);
        $pdf->SetFillColor(240, 240, 240);
        $pdf->Cell(40, 10, 'DÍA', 1, 0, 'C', true);
        $pdf->Cell(35, 10, 'ENTRADA', 1, 0, 'C', true);
        $pdf->Cell(40, 10, 'SALIDA COMIDA', 1, 0, 'C', true);
        $pdf->Cell(40, 10, 'ENTRADA COMIDA', 1, 0, 'C', true);
        $pdf->Cell(35, 10, 'SALIDA', 1, 1, 'C', true);

        // Definir orden de la semana (Viernes a Jueves)
        $diasFijos = ['Viernes', 'Sábado', 'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves'];
        $horariosIndexados = [];
        foreach ($datosNomina['horarios_semanales'] as $h) {
            $horariosIndexados[$h['dia']] = $h;
        }

        $pdf->SetFont('dejavusans', '', 10);
        foreach ($diasFijos as $dia) {
            $h = isset($horariosIndexados[$dia]) ? $horariosIndexados[$dia] : null;

            $pdf->Cell(40, 8, $dia, 1, 0, 'L');
            $pdf->Cell(35, 8, ($h && !empty($h['entrada']) ? $h['entrada'] : '-'), 1, 0, 'C');
            $pdf->Cell(40, 8, ($h && !empty($h['entrada_comida']) ? $h['entrada_comida'] : '-'), 1, 0, 'C');
            $pdf->Cell(40, 8, ($h && !empty($h['termino_comida']) ? $h['termino_comida'] : '-'), 1, 0, 'C');
            $pdf->Cell(35, 8, ($h && !empty($h['salida']) ? $h['salida'] : '-'), 1, 1, 'C');
        }
    }
}

// Descarga
if (ob_get_length()) ob_end_clean();
header('Content-Type: application/pdf');
header('Content-Disposition: attachment; filename="REPORTE_NOMINA_40LBS_' . date('Ymd_His') . '.pdf"');
$pdf->Output('REPORTE_NOMINA_40LBS_' . date('Ymd_His') . '.pdf', 'D');
exit;
