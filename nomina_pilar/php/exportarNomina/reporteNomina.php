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
        // Logo (opcional, comentar si no se requiere)
        $logo = __DIR__ . '/../../../public/img/logo.jpg';
        if (file_exists($logo)) {
            $this->Image($logo, 15, 10, 25, 0, '', '', '', false, 300);
        }

        // Título principal
        $this->SetFont('helvetica', 'B', 16);
        $this->SetY(12);
        $this->Cell(0, 10, 'REPORTE NÓMINA RANCHO RALICARIO', 0, 1, 'C', 0, '', 0, false, 'M', 'M');

        // Subtítulo
        $this->SetFont('helvetica', 'B', 12);
        $this->Cell(0, 8, $this->tituloNomina, 0, 1, 'C');

        // Semana y fecha de cierre
        $this->SetFont('dejavusans', '', 10);
        $this->Cell(0, 6, 'Semana: ' . $this->numeroSemana . ' | Fecha de Cierre: ' . $this->fechaCierre, 0, 1, 'C');

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
        'Ene' => 'ENERO',
        'Feb' => 'FEBRERO',
        'Mar' => 'MARZO',
        'Abr' => 'ABRIL',
        'May' => 'MAYO',
        'Jun' => 'JUNIO',
        'Jul' => 'JULIO',
        'Ago' => 'AGOSTO',
        'Sep' => 'SEPTIEMBRE',
        'Oct' => 'OCTUBRE',
        'Nov' => 'NOVIEMBRE',
        'Dic' => 'DICIEMBRE'
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
        // Mismo año
        $dia_inicio = ltrim($partes_inicio[0], '0');
        $dia_cierre = ltrim($partes_cierre[0], '0');
        $mes = mesEnLetras($partes_cierre[1]);
        $anio = $anio_cierre;
        return $dia_inicio . ' AL ' . $dia_cierre . ' DE ' . $mes . ' DEL ' . $anio;
    } else {
        // Años distintos
        return formatearFechaNomina($fecha_inicio) . ' AL ' . formatearFechaNomina($fecha_cierre);
    }
}


//=====================================
// RECEPCIÓN DE DATOS
//=====================================

$numero_semana = isset($_POST['numero_semana']) ? $_POST['numero_semana'] : '';
$fecha_cierre = isset($_POST['fecha_cierre']) ? $_POST['fecha_cierre'] : '';
$fecha_inicio = isset($_POST['fecha_inicio']) ? $_POST['fecha_inicio'] : '';
$periodo_nomina = isset($_POST['periodo_nomina']) ? $_POST['periodo_nomina'] : '';

// Construir título del período
$tituloNomina = 'NÓMINA DEL ' . obtenerTituloPeriodo($fecha_inicio, $fecha_cierre);


//=====================================
// DECODIFICAR Y FILTRAR DATOS
//=====================================

$jsonNominaStr = $_POST['jsonNomina'] ?? '{}';
$datosNomina = json_decode($jsonNominaStr, true);

// Filtrar empleados del jsonNominaRelicario
$empleadosJornaleroBase = [];
$empleadosJornaleroVivero = [];
$empleadosJornalerosApoyo = [];
$empleadosCoordinadoresRancho = [];
$empleadosCoordinadoresVivero = [];
if (isset($datosNomina['departamentos']) && is_array($datosNomina['departamentos'])) {
    foreach ($datosNomina['departamentos'] as $depto) {
        if (
            isset($depto['nombre']) &&
            isset($depto['empleados']) && is_array($depto['empleados'])
        ) {
            foreach ($depto['empleados'] as $empleado) {
                if (isset($empleado['mostrar']) ? $empleado['mostrar'] : false) {
                    if (isset($empleado['id_tipo_puesto']) && $empleado['id_tipo_puesto'] == 1) {
                        $empleadosJornaleroBase[] = $empleado;
                    } elseif (isset($empleado['id_tipo_puesto']) && $empleado['id_tipo_puesto'] == 2) {
                        $empleadosJornaleroVivero[] = $empleado;
                    } elseif (isset($empleado['id_tipo_puesto']) && $empleado['id_tipo_puesto'] == 3) {
                        $empleadosJornalerosApoyo[] = $empleado;
                    } elseif (isset($empleado['id_tipo_puesto']) && $empleado['id_tipo_puesto'] == 4) {
                        $empleadosCoordinadoresRancho[] = $empleado;
                    } elseif (isset($empleado['id_tipo_puesto']) && $empleado['id_tipo_puesto'] == 5) {
                        $empleadosCoordinadoresVivero[] = $empleado;
                    }
                }
            }
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
$pdf->SetTitle('Reporte Contable de Nómina de Confianza');
$pdf->SetMargins(10, 50, 10);
$pdf->SetHeaderMargin(10);
$pdf->SetFooterMargin(10);
$pdf->SetAutoPageBreak(TRUE, 15);

//=====================================
// VARIABLES PARA RESUMEN GENERAL
//=====================================
$resumenPorTipo = [
    'JORNALERO BASE' => ['count' => 0, 'neto' => 0, 'percepciones' => 0, 'deducciones' => 0, 'percepciones_detalle' => [], 'deducciones_detalle' => []],
    'JORNALERO VIVERO' => ['count' => 0, 'neto' => 0, 'percepciones' => 0, 'deducciones' => 0, 'percepciones_detalle' => [], 'deducciones_detalle' => []],
    'JORNALEROS DE APOYO' => ['count' => 0, 'neto' => 0, 'percepciones' => 0, 'deducciones' => 0, 'percepciones_detalle' => [], 'deducciones_detalle' => []],
    'COORDINADORES RANCHO' => ['count' => 0, 'neto' => 0, 'percepciones' => 0, 'deducciones' => 0, 'percepciones_detalle' => [], 'deducciones_detalle' => []],
    'COORDINADORES VIVERO' => ['count' => 0, 'neto' => 0, 'percepciones' => 0, 'deducciones' => 0, 'percepciones_detalle' => [], 'deducciones_detalle' => []],
];
$totalGeneralPercepciones = 0;
$totalGeneralDeducciones = 0;
$totalGeneralNetoRedondeado = 0;
$contadorEmpleados = 0;

//=====================================
// FUNCIÓN AUXILIAR PARA FORMATEAR MONEDA
//=====================================
function formatoMoneda($monto)
{
    if ($monto == 0) return '$0.00';
    return '$' . number_format((float)$monto, 2, '.', ',');
}

//=====================================
// MOSTRAR EMPLEADOS DE JORNALERO BASE
//=====================================

// Combinar todos los arreglos con etiqueta de tipo
$empleadosPorTipo = [];
foreach ($empleadosJornaleroBase as $emp) {
    $emp['_tipo'] = 'JORNALERO BASE';
    $empleadosPorTipo[] = $emp;
}
foreach ($empleadosJornaleroVivero as $emp) {
    $emp['_tipo'] = 'JORNALERO VIVERO';
    $empleadosPorTipo[] = $emp;
}
foreach ($empleadosJornalerosApoyo as $emp) {
    $emp['_tipo'] = 'JORNALEROS DE APOYO';
    $empleadosPorTipo[] = $emp;
}
foreach ($empleadosCoordinadoresRancho as $emp) {
    $emp['_tipo'] = 'COORDINADORES RANCHO';
    $empleadosPorTipo[] = $emp;
}
foreach ($empleadosCoordinadoresVivero as $emp) {
    $emp['_tipo'] = 'COORDINADORES VIVERO';
    $empleadosPorTipo[] = $emp;
}

$contador = 1;
$tipoActual = null;
$primerEmpleado = true;

foreach ($empleadosPorTipo as $empleado) {
    // Agregar nueva página si NO es el primer empleado del mismo tipo
    if (!$primerEmpleado && $tipoActual === $empleado['_tipo']) {
        $pdf->AddPage();
    }

    // Mostrar título de sección si cambia el tipo
    if ($tipoActual !== $empleado['_tipo']) {
        $tipoActual = $empleado['_tipo'];
        $pdf->AddPage();
        $pdf->SetFont('helvetica', 'B', 14);
        $pdf->Cell(0, 15, $tipoActual, 0, 1, 'C');
        $pdf->Ln(5);
        $contador = 1; // reiniciar contador por tipo
    }
    
    $primerEmpleado = false;

    $nombre = strtoupper($empleado['nombre'] ?? '');
    $clave = $empleado['clave'] ?? '';
    $pdf->SetFont('helvetica', 'B', 12);
    $pdf->Cell(0, 8, "#{$contador} {$nombre}", 0, 1, 'L');
    $pdf->SetFont('dejavusans', '', 10);
    $pdf->Cell(0, 6, "Clave: {$clave}", 0, 1, 'L');
    $pdf->Ln(2);

    //=====================================
    // RECOPILAR DATOS PERCEPCIONES
    //=====================================
    $salario_semanal = isset($empleado['salario_semanal']) ? floatval($empleado['salario_semanal']) : 0;
    $pasaje = isset($empleado['pasaje']) ? floatval($empleado['pasaje']) : 0;
    $comida = isset($empleado['comida']) ? floatval($empleado['comida']) : 0;

    $total_extra = 0;
    $percepciones_extra = isset($empleado['percepciones_extra']) && is_array($empleado['percepciones_extra']) ? $empleado['percepciones_extra'] : [];
    $componentesExtraDetalle = [];
    if (count($percepciones_extra) > 0) {
        foreach ($percepciones_extra as $extra) {
            $cantidad = isset($extra['cantidad']) ? floatval($extra['cantidad']) : 0;
            $total_extra += $cantidad;
            if ($cantidad > 0) {
                $componentesExtraDetalle[isset($extra['nombre']) ? $extra['nombre'] : ''] = $cantidad;
            }
        }
    }

    // Preparar array de percepciones
    $percepciones = [];
    $percepciones['Salario Semanal'] = $salario_semanal;
    if ($pasaje > 0) $percepciones['Pasaje'] = $pasaje;
    if ($comida > 0) $percepciones['Comida'] = $comida;
    if ($total_extra > 0) $percepciones['Sueldo Extra Total'] = $total_extra;

    $totalPercepcionesEmpleado = array_sum($percepciones);

    // Actualizar detalles de percepciones por tipo
    foreach ($percepciones as $concepto => $monto) {
        if (!isset($resumenPorTipo[$empleado['_tipo']]['percepciones_detalle'][$concepto])) {
            $resumenPorTipo[$empleado['_tipo']]['percepciones_detalle'][$concepto] = 0;
        }
        $resumenPorTipo[$empleado['_tipo']]['percepciones_detalle'][$concepto] += $monto;
    }

    //=====================================
    // RECOPILAR DATOS DEDUCCIONES
    //=====================================
    $inasistencia = isset($empleado['inasistencia']) ? floatval($empleado['inasistencia']) : 0;
    $permiso = isset($empleado['permiso']) ? floatval($empleado['permiso']) : 0;
    $retardos = isset($empleado['retardos']) ? floatval($empleado['retardos']) : 0;
    $uniformes = isset($empleado['uniformes']) ? floatval($empleado['uniformes']) : 0;
    $checador = isset($empleado['checador']) ? floatval($empleado['checador']) : 0;
    $tarjeta = isset($empleado['tarjeta']) ? floatval($empleado['tarjeta']) : 0;
    $prestamo = isset($empleado['prestamo']) ? floatval($empleado['prestamo']) : 0;

    $total_extra_deducciones = 0;
    $percepciones_extra_deducciones = isset($empleado['deducciones_extra']) && is_array($empleado['deducciones_extra']) ? $empleado['deducciones_extra'] : [];
    $componentesExtraDetalleDeducciones = [];
    if (count($percepciones_extra_deducciones) > 0) {
        foreach ($percepciones_extra_deducciones as $extra) {
            $cantidad = isset($extra['cantidad']) ? floatval($extra['cantidad']) : 0;
            $total_extra_deducciones += $cantidad;
            if ($cantidad > 0) {
                $componentesExtraDetalleDeducciones[isset($extra['nombre']) ? $extra['nombre'] : ''] = $cantidad;
            }
        }
    }

    // === DISEÑO PERCEPCIONES ===
    $inicioY = $pdf->GetY();

    // Línea superior
    $pdf->SetDrawColor(0, 0, 0);
    $pdf->Line(10, $inicioY, 105, $inicioY);

    // Encabezado Percepciones
    $pdf->SetFont('helvetica', 'B', 10);
    $pdf->SetFillColor(240, 240, 240);
    $pdf->Cell(95, 8, 'PERCEPCIONES', 0, 1, 'C', false);

    // Línea debajo del encabezado
    $pdf->Line(10, $pdf->GetY(), 105, $pdf->GetY());
    $pdf->Ln(2);

    $pdf->SetFillColor(255, 255, 255);

    //=====================================
    // RENDERIZAR COLUMNA PERCEPCIONES
    //=====================================

    // Mostrar percepciones
    foreach ($percepciones as $concepto => $monto) {
        $pdf->SetFont('dejavusans', '', 10);
        $pdf->Cell(65, 6, $concepto, 0, 0, 'L');
        $pdf->SetFont('dejavusansmono', '', 9);
        $pdf->Cell(30, 6, formatoMoneda($monto), 0, 1, 'R');
    }

    // Desglose de Sueldo Extra Total si existe
    if (!empty($componentesExtraDetalle)) {
        $pdf->Ln(1);
        $pdf->SetX(10);
        $pdf->SetFont('dejavusans', 'I', 8);
        $pdf->Cell(65, 5, 'Desglose Sueldo Extra:', 0, 1, 'L');
        $pdf->SetX(10);
        foreach ($componentesExtraDetalle as $nombreComp => $valorComp) {
            if ($valorComp > 0) {
                $pdf->SetFont('dejavusans', 'I', 8);
                $pdf->Cell(65, 5, '  • ' . $nombreComp, 0, 0, 'L');
                $pdf->SetFont('dejavusansmono', 'I', 8);
                $pdf->Cell(30, 5, formatoMoneda($valorComp), 0, 1, 'R');
                $pdf->SetX(10);
            }
        }
        $pdf->Ln(2);
    }

    // Línea antes del total
    $pdf->Ln(0);
    $pdf->Line(10, $pdf->GetY(), 105, $pdf->GetY());
    $pdf->Ln(2);

    // Total percepciones
    $pdf->SetFont('helvetica', 'B', 11);
    $pdf->Cell(65, 7, 'Total Percepciones', 0, 0, 'R');
    $pdf->SetFont('dejavusansmono', 'B', 10);
    $pdf->Cell(30, 7, formatoMoneda($totalPercepcionesEmpleado), 0, 1, 'R');

    $alturaColumnaIzquierda = $pdf->GetY() - $inicioY;

    //=====================================
    // RENDERIZAR COLUMNA DEDUCCIONES
    //=====================================
    // Preparar array de deducciones utilizando el arreglo 'conceptos' del empleado
    $deducciones = [];
    if (!empty($empleado['conceptos']) && is_array($empleado['conceptos'])) {
        foreach ($empleado['conceptos'] as $c) {
            $monto = floatval($c['resultado'] ?? 0);
            if ($monto <= 0) continue;
            switch ($c['codigo'] ?? '') {
                case '45': // ISR
                    $deducciones['ISR'] = $monto;
                    break;
                case '52': // IMSS
                    $deducciones['IMSS'] = $monto;
                    break;
                case '107': // Ajuste al Subsidio Causado
                    $deducciones['Ajuste al SUB'] = $monto;
                    break;
                case '16': // Subsidio Causado
                    $deducciones['Infonavit'] = $monto;
                    break;
            }
        }
    }

    if ($inasistencia > 0) {
        $deducciones['Inasistencia'] = $inasistencia;
    }
    if ($permiso > 0) {
        $deducciones['Permiso'] = $permiso;
    }
    if ($retardos > 0) {
        $deducciones['Retardos'] = $retardos;
    }
    if ($uniformes > 0) {
        $deducciones['Uniformes'] = $uniformes;
    }
    if ($checador > 0) {
        $deducciones['Biometrico'] = $checador;
    }
    if ($tarjeta > 0) {
        $deducciones['Tarjeta'] = $tarjeta;
    }
    if ($prestamo > 0) {
        $deducciones['Prestamo'] = $prestamo;
    }

    // Agregar deducciones extras como total consolidado
    if ($total_extra_deducciones > 0) {
        $deducciones['Deducciones Extras Total'] = $total_extra_deducciones;
    }

    $totalDeduccionesEmpleado = array_sum($deducciones);

    // Actualizar totales generales
    $totalGeneralPercepciones += $totalPercepcionesEmpleado;
    $totalGeneralDeducciones += $totalDeduccionesEmpleado;

    // Actualizar detalles de deducciones por tipo
    foreach ($deducciones as $concepto => $monto) {
        if (!isset($resumenPorTipo[$empleado['_tipo']]['deducciones_detalle'][$concepto])) {
            $resumenPorTipo[$empleado['_tipo']]['deducciones_detalle'][$concepto] = 0;
        }
        $resumenPorTipo[$empleado['_tipo']]['deducciones_detalle'][$concepto] += $monto;
    }

    // Configurar posición en columna derecha
    $pdf->SetXY(110, $inicioY);

    // Línea superior
    $pdf->SetDrawColor(0, 0, 0);
    $pdf->Line(110, $inicioY, 200, $inicioY);

    // Encabezado Deducciones
    $pdf->SetFont('helvetica', 'B', 10);
    $pdf->SetFillColor(240, 240, 240);
    $pdf->Cell(90, 8, 'DEDUCCIONES', 0, 1, 'C', false);

    // Línea debajo del encabezado
    $pdf->SetX(110);
    $pdf->Line(110, $pdf->GetY(), 200, $pdf->GetY());
    $pdf->Ln(2);
    $pdf->SetX(110);

    $pdf->SetFillColor(255, 255, 255);

    // Mostrar deducciones
    foreach ($deducciones as $concepto => $monto) {
        $pdf->SetX(110);
        $pdf->SetFont('dejavusans', '', 10);
        $pdf->Cell(60, 6, $concepto, 0, 0, 'L');
        $pdf->SetFont('dejavusansmono', '', 9);
        $pdf->Cell(30, 6, formatoMoneda($monto), 0, 1, 'R');
    }

    // Desglose de Deducciones Extras Total si existe
    if (!empty($componentesExtraDetalleDeducciones)) {
        $pdf->Ln(1);
        $pdf->SetX(110);
        $pdf->SetFont('dejavusans', 'I', 8);
        $pdf->Cell(60, 5, 'Desglose Deducciones Extras:', 0, 1, 'L');
        $pdf->SetX(110);
        foreach ($componentesExtraDetalleDeducciones as $nombreComp => $valorComp) {
            if ($valorComp > 0) {
                $pdf->SetFont('dejavusans', 'I', 8);
                $pdf->Cell(60, 5, '  • ' . $nombreComp, 0, 0, 'L');
                $pdf->SetFont('dejavusansmono', 'I', 8);
                $pdf->Cell(30, 5, formatoMoneda($valorComp), 0, 1, 'R');
                $pdf->SetX(110);
            }
        }
        $pdf->Ln(2);
    }

    // Línea antes del total
    $pdf->Ln(0);
    $pdf->SetX(110);
    $pdf->Line(110, $pdf->GetY(), 200, $pdf->GetY());
    $pdf->Ln(2);
    $pdf->SetX(110);

    // Total deducciones
    $pdf->SetFont('helvetica', 'B', 11);
    $pdf->Cell(60, 7, 'Total Deducciones', 0, 0, 'R');
    $pdf->SetFont('dejavusansmono', 'B', 10);
    $pdf->Cell(30, 7, formatoMoneda($totalDeduccionesEmpleado), 0, 1, 'R');

    // Ajustar posición Y al final de ambas columnas
    $alturaColumnaDerecha = $pdf->GetY() - $inicioY;
    $alturaMaxima = max($alturaColumnaIzquierda, $alturaColumnaDerecha);
    $pdf->SetY($inicioY + $alturaMaxima + 5);

    // Calcular sueldo neto y aplicar redondeo
    $sueldoNeto = $totalPercepcionesEmpleado - $totalDeduccionesEmpleado;

    // Obtener el redondeo (si existe)
    $redondeo = isset($empleado['redondeo']) ? floatval($empleado['redondeo']) : 0;

    // Aplicar redondeo al sueldo a pagar si está activo
    $sueldoRedondeado = $sueldoNeto;
    $diferenciaRedondeo = 0;

    if ($redondeo != 0) {
        $sueldoRedondeado = round($sueldoNeto);
        $diferenciaRedondeo = $sueldoRedondeado - $sueldoNeto;
    }

    // Actualizar resumen general CON EL SUELDO REDONDEADO
    $resumenPorTipo[$empleado['_tipo']]['count']++;
    $resumenPorTipo[$empleado['_tipo']]['neto'] += $sueldoRedondeado;
    $resumenPorTipo[$empleado['_tipo']]['percepciones'] += $totalPercepcionesEmpleado;
    $resumenPorTipo[$empleado['_tipo']]['deducciones'] += $totalDeduccionesEmpleado;
    $totalGeneralNetoRedondeado += $sueldoRedondeado;
    $contadorEmpleados++;

    // Línea superior del neto a pagar más delgada
    $pdf->SetLineWidth(0.1);
    $pdf->Line(10, $pdf->GetY(), 200, $pdf->GetY());
    $pdf->Ln(2);

    // Solo mostrar desglose detallado si hay redondeo aplicado
    if ($redondeo != 0 && $sueldoNeto != $sueldoRedondeado) {
        // Mostrar cálculo completo del sueldo
        $pdf->SetTextColor(0, 0, 0);
        $pdf->SetFont('dejavusans', '', 10);
        $pdf->Cell(130, 7, 'SUELDO CALCULADO:', 0, 0, 'R');
        $pdf->SetFont('dejavusansmono', '', 10);
        $pdf->Cell(60, 7, formatoMoneda($sueldoNeto), 0, 1, 'R');

        // Mostrar redondeo aplicado
        $pdf->SetFont('dejavusans', '', 10);
        $pdf->Cell(130, 7, 'AJUSTE POR REDONDEO:', 0, 0, 'R');
        $pdf->SetFont('dejavusansmono', '', 10);
        $pdf->Cell(60, 7, formatoMoneda($diferenciaRedondeo), 0, 1, 'R');

        // Línea separadora
        $pdf->Ln(1);
        $pdf->SetLineWidth(0.3);
        $pdf->Line(100, $pdf->GetY(), 200, $pdf->GetY());
        $pdf->Ln(2);

        // Mostrar sueldo final redondeado
        if ($sueldoRedondeado >= 0) {
            $pdf->SetTextColor(0, 100, 0);
        } else {
            $pdf->SetTextColor(200, 0, 0);
        }

        $pdf->SetFillColor(250, 250, 250);
        $pdf->SetFont('helvetica', 'B', 12);
        $pdf->Cell(130, 12, 'NETO A PAGAR', 0, 0, 'R', true);
        $pdf->SetFont('dejavusansmono', 'B', 12);
        $pdf->Cell(60, 12, formatoMoneda($sueldoRedondeado), 0, 1, 'R', true);
        $pdf->SetTextColor(0, 0, 0);
    } else {
        // Mostrar solo el sueldo final sin desglose
        if ($sueldoRedondeado >= 0) {
            $pdf->SetTextColor(0, 100, 0);
        } else {
            $pdf->SetTextColor(200, 0, 0);
        }

        $pdf->SetFillColor(250, 250, 250);
        $pdf->SetFont('helvetica', 'B', 11);
        $pdf->Cell(130, 10, 'NETO A PAGAR', 0, 0, 'R', true);
        $pdf->SetFont('dejavusansmono', 'B', 11);
        $pdf->Cell(60, 10, formatoMoneda($sueldoRedondeado), 0, 1, 'R', true);
        $pdf->SetTextColor(0, 0, 0);
    }

    //=====================================
    // SINCRONIZAR Y FINALIZAR EMPLEADO
    //=====================================
    // Línea de separación final
    $pdf->SetLineWidth(0.2);
    $pdf->Line(10, $pdf->GetY(), 200, $pdf->GetY());
    $pdf->Ln(3);

    // Espaciado final
    $pdf->Ln(2);
    $contador++;
}

//=====================================
// PÁGINA DE RESUMEN GENERAL
//=====================================
if ($contadorEmpleados > 0) {
    $pdf->AddPage();

    // Título del resumen
    $pdf->SetFont('helvetica', 'B', 16);
    $pdf->Cell(0, 12, 'RESUMEN GENERAL', 0, 1, 'C');
    $pdf->Ln(10);

    // Encabezados de tabla
    $pdf->SetFont('helvetica', 'B', 11);
    $pdf->SetFillColor(240, 240, 240);
    $pdf->Cell(100, 10, 'CONCEPTO', 0, 0, 'C', true);
    $pdf->Cell(40, 10, 'CANTIDAD', 0, 0, 'C', true);
    $pdf->Cell(50, 10, 'TOTAL', 0, 1, 'C', true);

    // Línea debajo del encabezado
    $pdf->Line(10, $pdf->GetY(), 200, $pdf->GetY());
    $pdf->Ln(3);

    $pdf->SetFillColor(255, 255, 255);

    // Mostrar datos por tipo de empleado
    foreach ($resumenPorTipo as $tipo => $datos) {
        if ($datos['count'] > 0) {
            $pdf->SetFont('dejavusans', '', 10);
            $pdf->Cell(100, 8, $tipo, 0, 0, 'L');
            $pdf->SetFont('dejavusansmono', '', 9);
            $pdf->Cell(40, 8, $datos['count'], 0, 0, 'R');
            $pdf->Cell(50, 8, formatoMoneda($datos['neto']), 0, 1, 'R');
        }
    }

    // Línea separadora
    $pdf->Ln(2);
    $pdf->Line(10, $pdf->GetY(), 200, $pdf->GetY());
    $pdf->Ln(3);

    // Total de empleados
    $pdf->SetFont('dejavusans', '', 10);
    $pdf->Cell(100, 8, 'Total de Empleados Procesados', 0, 0, 'L');
    $pdf->SetFont('dejavusansmono', '', 9);
    $pdf->Cell(40, 8, $contadorEmpleados, 0, 0, 'R');
    $pdf->Cell(50, 8, '', 0, 1, 'R');

    // Total de percepciones
    $pdf->SetFont('dejavusans', '', 10);
    $pdf->Cell(100, 8, 'Total General de Percepciones', 0, 0, 'L');
    $pdf->SetFont('dejavusansmono', '', 9);
    $pdf->Cell(40, 8, '', 0, 0, 'R');
    $pdf->Cell(50, 8, formatoMoneda($totalGeneralPercepciones), 0, 1, 'R');

    // Total de deducciones
    $pdf->SetFont('dejavusans', '', 10);
    $pdf->Cell(100, 8, 'Total General de Deducciones', 0, 0, 'L');
    $pdf->SetFont('dejavusansmono', '', 9);
    $pdf->Cell(40, 8, '', 0, 0, 'R');
    $pdf->Cell(50, 8, formatoMoneda($totalGeneralDeducciones), 0, 1, 'R');

    // Línea antes del total final
    $pdf->Ln(2);
    $pdf->Line(10, $pdf->GetY(), 200, $pdf->GetY());
    $pdf->Ln(3);

    // Total neto general (con redondeos aplicados)
    $totalGeneralNeto = $totalGeneralNetoRedondeado;
    if ($totalGeneralNeto >= 0) {
        $pdf->SetTextColor(0, 100, 0);
    } else {
        $pdf->SetTextColor(200, 0, 0);
    }
    $pdf->SetFillColor(250, 250, 250);
    $pdf->SetFont('helvetica', 'B', 12);
    $pdf->Cell(100, 10, 'TOTAL NETO A PAGAR GENERAL', 0, 0, 'L', true);
    $pdf->SetFont('dejavusansmono', 'B', 12);
    $pdf->Cell(90, 10, formatoMoneda($totalGeneralNeto), 0, 1, 'R', true);

    // Línea final
    $pdf->SetTextColor(0, 0, 0);
    $pdf->Ln(2);
    $pdf->Line(10, $pdf->GetY(), 200, $pdf->GetY());
}

//=====================================
// REPORTES POR TIPO DE EMPLEADO
//=====================================
foreach ($resumenPorTipo as $tipo => $datos) {
    if ($datos['count'] === 0) continue;

    $pdf->AddPage();
    $pdf->SetFont('helvetica', 'B', 14);
    $pdf->Cell(0, 10, $tipo, 0, 1, 'C');
    $pdf->Ln(4);

    // Información resumida
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

    if (!empty($datos['percepciones_detalle'])) {
        foreach ($datos['percepciones_detalle'] as $concepto => $monto) {
            $pdf->SetFont('dejavusans', '', 10);
            $pdf->Cell(130, 6, $concepto, 0, 0, 'L');
            $pdf->SetFont('dejavusansmono', '', 9);
            $pdf->Cell(50, 6, formatoMoneda($monto), 0, 1, 'R');
        }
    } else {
        $pdf->SetFont('dejavusans', 'I', 9);
        $pdf->Cell(0, 6, 'No hay percepciones registradas para este tipo de empleado.', 0, 1, 'L');
    }

    $pdf->Ln(4);

    // DEDUCCIONES por concepto
    $pdf->SetFont('helvetica', 'B', 11);
    $pdf->SetFillColor(240, 240, 240);
    $pdf->Cell(0, 8, 'DEDUCCIONES', 0, 1, 'C', true);
    $pdf->SetFillColor(255, 255, 255);

    if (!empty($datos['deducciones_detalle'])) {
        foreach ($datos['deducciones_detalle'] as $concepto => $monto) {
            $pdf->SetFont('dejavusans', '', 10);
            $pdf->Cell(130, 6, $concepto, 0, 0, 'L');
            $pdf->SetFont('dejavusansmono', '', 9);
            $pdf->Cell(50, 6, formatoMoneda($monto), 0, 1, 'R');
        }
    } else {
        $pdf->SetFont('dejavusans', 'I', 9);
        $pdf->Cell(0, 6, 'No hay deducciones registradas para este tipo de empleado.', 0, 1, 'L');
    }
}

//=====================================
// DESCARGA DEL PDF
//=====================================

if (ob_get_length()) ob_end_clean();
header('Content-Type: application/pdf');
header('Content-Disposition: attachment; filename="REPORTE_NOMINA_CONTABLE_' . date('Ymd_His') . '.pdf"');
$pdf->Output('REPORTE_NOMINA_CONTABLE_' . date('Ymd_His') . '.pdf', 'D');
exit;
