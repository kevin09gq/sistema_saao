<?php
include "../../conexion/conexion.php";
// Incluir el autoload de Composer para cargar TCPDF
require_once __DIR__ . '/../../vendor/autoload.php';

// Extender la clase TCPDF para personalizar el encabezado
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

    // Encabezado
    public function Header()
    {
        // Logo
        $logo = __DIR__ . '/../../public/img/logo.jpg';
        if (file_exists($logo)) {
            $this->Image($logo, 10, 10, 25, 0, 'JPG', '', 'T', false, 300, '', false, false, 0, false, false, false);
        }

        // Título principal - Helvetica Bold 16pt
        $this->SetFont('helvetica', 'B', 16);
        $this->SetY(12);
        $this->Cell(0, 10, 'REPORTE CONTABLE DE NÓMINA DE CONFIANZA', 0, 1, 'C', 0, '', 0, false, 'M', 'M');

        // Subtítulo con información de la nómina - Helvetica Bold 12pt
        $this->SetFont('helvetica', 'B', 12);
        $this->Cell(0, 8, $this->tituloNomina, 0, 1, 'C');

        // Información de semana y fecha - DejaVu Sans 10pt
        $this->SetFont('dejavusans', '', 10);
        $this->Cell(0, 6, 'Semana: ' . $this->numeroSemana . ' | Fecha de Cierre: ' . $this->fechaCierre, 0, 1, 'C');

        // Fecha de generación - DejaVu Sans 9pt
        $this->SetFont('dejavusans', '', 9);
        $this->Cell(0, 6, 'Generado el: ' . date('d/m/Y H:i:s'), 0, 1, 'R');

        // Línea separadora
        $this->Line(10, 42, $this->getPageWidth() - 10, 42);

        // Espacio después del encabezado
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

// Procesar la solicitud
try {
    // Obtener datos del request
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if (!$data || !isset($data['datos'])) {
        throw new Exception('No se recibieron datos válidos para generar el reporte.');
    }

    $datos = $data['datos'];
    $tituloNomina = $data['tituloNomina'] ?? 'Reporte de Nómina';
    $numeroSemana = $data['numeroSemana'] ?? ($datos['numero_semana'] ?? 'N/A');
    $fechaCierre = $data['fechaCierre'] ?? ($datos['fecha_cierre'] ?? date('d/m/Y'));

    // Crear nuevo documento PDF
    $pdf = new PDFEncabezado('P', 'mm', 'A4', true, 'UTF-8', false);
    $pdf->setDatosNomina($tituloNomina, $numeroSemana, $fechaCierre);

    // Configuración del documento
    $pdf->SetCreator('Sistema SAAO');
    $pdf->SetAuthor('Sistema SAAO');
    $pdf->SetTitle('Encabezado de Reporte Contable de Nómina');
    $pdf->SetSubject('Encabezado de Reporte Contable de Nómina');
    $pdf->SetKeywords('nomina, encabezado, reporte, contable');

    // Establecer márgenes
    $pdf->SetMargins(10, 50, 10);
    $pdf->SetHeaderMargin(10);
    $pdf->SetFooterMargin(10);

    // Configurar fuente por defecto
    $pdf->SetFont('dejavusans', '', 10);

    // Función para formatear moneda
    function formatoMoneda($monto)
    {
        if ($monto == 0) return '$0.00';
        return '$' . number_format((float)$monto, 2, '.', ',');
    }

    // Filtrar empleados por departamento (id_departamento: 1, 2 y 3)
    $empleadosAdministrativos = [];
    $empleadosProduccion = [];
    $empleadosSeguridad = [];
    $empleadosCdmx = [];
    
    if (isset($datos['departamentos']) && is_array($datos['departamentos'])) {
        foreach ($datos['departamentos'] as $depto) {
            if (isset($depto['empleados']) && is_array($depto['empleados'])) {
                foreach ($depto['empleados'] as $empleado) {
                    // Incluir únicamente empleados con la propiedad mostrar = true
                    $mostrarFlag = filter_var($empleado['mostrar'] ?? false, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
                    if ($mostrarFlag !== true) continue;

                    $idDepto = isset($empleado['id_departamento']) ? intval($empleado['id_departamento']) : 0;
                    if ($idDepto === 1) {
                        $empleadosAdministrativos[] = $empleado;
                    } elseif ($idDepto === 2) {
                        $empleadosProduccion[] = $empleado;
                    } elseif ($idDepto === 3) {
                        $empleadosSeguridad[] = $empleado;
                    } elseif ($idDepto === 9) {
                        $empleadosCdmx[] = $empleado;
                    }
                }
            }
        }
    }

    // Ordenar por nombre
    usort($empleadosAdministrativos, function ($a, $b) {
        return strcmp($a['nombre'] ?? '', $b['nombre'] ?? '');
    });
    
    usort($empleadosProduccion, function ($a, $b) {
        return strcmp($a['nombre'] ?? '', $b['nombre'] ?? '');
    });

    usort($empleadosSeguridad, function ($a, $b) {
        return strcmp($a['nombre'] ?? '', $b['nombre'] ?? '');
    });

    usort($empleadosCdmx, function ($a, $b) {
        return strcmp($a['nombre'] ?? '', $b['nombre'] ?? '');
    });

    // Combinar grupos para procesar (Administración, Producción, Seguridad Vigilancia e Intendencia, CdMx)
    $todosEmpleados = array_merge($empleadosAdministrativos, $empleadosProduccion, $empleadosSeguridad, $empleadosCdmx);

    if (empty($todosEmpleados)) {
        $pdf->AddPage();
        $pdf->SetFont('helvetica', 'B', 14);
        $pdf->Cell(0, 20, 'No se encontraron empleados en los departamentos especificados.', 0, 1, 'C');
        $pdf->Output('reporte_nomina_vacio.pdf', 'I');
        exit;
    }

    // Variables para totales generales
    $totalGeneralPercepciones = 0;
    $totalGeneralDeducciones = 0;
    $totalGeneralNeto = 0;
    $contadorEmpleados = 0;
    $contadorAdmin = 0;
    $contadorProduccion = 0;
    $contadorSeguridad = 0;
    $contadorCdmx = 0;
    $ultimoDepartamento = null;

    // Totales por departamento (incluye desglose por concepto)
    $deptTotals = [
        1 => ['name' => 'Administración', 'percepciones' => 0, 'deducciones' => 0, 'neto' => 0, 'count' => 0, 'percepciones_by_concept' => [], 'deducciones_by_concept' => []],
        2 => ['name' => 'Producción', 'percepciones' => 0, 'deducciones' => 0, 'neto' => 0, 'count' => 0, 'percepciones_by_concept' => [], 'deducciones_by_concept' => []],
        3 => ['name' => 'Seguridad Vigilancia e Intendencia', 'percepciones' => 0, 'deducciones' => 0, 'neto' => 0, 'count' => 0, 'percepciones_by_concept' => [], 'deducciones_by_concept' => []],
        9 => ['name' => 'Administracion Sucursal CdMx', 'percepciones' => 0, 'deducciones' => 0, 'neto' => 0, 'count' => 0, 'percepciones_by_concept' => [], 'deducciones_by_concept' => []],
    ];

    // Inicializar totales por departamento y por concepto
    $deptTotals = [
        1 => ['name' => 'Administración', 'percepciones' => 0, 'deducciones' => 0, 'neto' => 0, 'count' => 0, 'empleados' => [], 'percepciones_by_concept' => [], 'deducciones_by_concept' => []],
        2 => ['name' => 'Producción', 'percepciones' => 0, 'deducciones' => 0, 'neto' => 0, 'count' => 0, 'empleados' => [], 'percepciones_by_concept' => [], 'deducciones_by_concept' => []],
        3 => ['name' => 'Seguridad Vigilancia e Intendencia', 'percepciones' => 0, 'deducciones' => 0, 'neto' => 0, 'count' => 0, 'empleados' => [], 'percepciones_by_concept' => [], 'deducciones_by_concept' => []],
      9 => ['name' => 'Administracion Sucursal CdMx', 'percepciones' => 0, 'deducciones' => 0, 'neto' => 0, 'count' => 0, 'empleados' => [], 'percepciones_by_concept' => [], 'deducciones_by_concept' => []],
    ];

    // Procesar cada empleado
    foreach ($todosEmpleados as $empleado) {
        // Cada empleado comienza en su propia página
        $pdf->AddPage();

        // Determinar el departamento del empleado
        $idDepto = isset($empleado['id_departamento']) ? intval($empleado['id_departamento']) : 0;
        
        // Subtítulo de departamento solo cuando cambia
        if ($ultimoDepartamento !== $idDepto) {
            $pdf->SetFont('helvetica', 'B', 12);
            if ($idDepto === 1) {
                $pdf->Cell(0, 8, 'ADMINISTRACION', 0, 1, 'C');
            } elseif ($idDepto === 2) {
                $pdf->Cell(0, 8, 'PRODUCCION', 0, 1, 'C');
            } elseif ($idDepto === 3) {
                $pdf->Cell(0, 8, 'Seguridad Vigilancia e Intendencia', 0, 1, 'C');
            } elseif ($idDepto === 9) {
                $pdf->Cell(0, 8, 'Administracion Sucursal CdMx', 0, 1, 'C');
            }
            $pdf->Ln(4);
            $ultimoDepartamento = $idDepto;
        }

        // Actualizar contadores
        if ($idDepto === 1) {
            $contadorAdmin++;
        } elseif ($idDepto === 2) {
            $contadorProduccion++;
        } elseif ($idDepto === 3) {
            $contadorSeguridad++;
        } elseif ($idDepto === 9) {
            $contadorCdmx++;
        }

        $contadorEmpleados++;

        // ===== ENCABEZADO DEL EMPLEADO =====
        $pdf->SetFont('helvetica', 'B', 11);
        $nombreConContador = '#' . $contadorEmpleados . ' ' . strtoupper($empleado['nombre'] ?? 'N/A');
        $pdf->Cell(0, 6, $nombreConContador, 0, 1, 'L');

        // Información básica del empleado
        $pdf->SetFont('dejavusans', '', 10);
        $pdf->Cell(95, 6, 'Clave: ' . ($empleado['clave'] ?? 'N/A'), 0, 1, 'L');

        $pdf->Ln(4);

        // ===== CALCULAR PERCEPCIONES =====
        // Inicializar percepciones con valor 0 para que siempre aparezcan en el PDF
        $percepciones = [
            'Sueldo Semanal' => 0,
            'Sueldo Extra Total' => 0
        ];
        
        // Sueldo semanal (si existe y es mayor a 0 se reemplaza el valor)
        if (isset($empleado['sueldo_semanal']) && $empleado['sueldo_semanal'] > 0) {
            $percepciones['Sueldo Semanal'] = $empleado['sueldo_semanal'];
        }
        
        // Sueldo extra total (vacaciones + extras_adicionales)
        $sueldoExtraTotal = 0;
        $componentesExtraDetalle = [];

        // Vacaciones
        if (isset($empleado['vacaciones']) && floatval($empleado['vacaciones']) > 0) {
            $vac = floatval($empleado['vacaciones']);
            $sueldoExtraTotal += $vac;
            $componentesExtraDetalle['Vacaciones'] = $vac;
        }

        // Extras adicionales (usar 'resultado' si existe, fallback a 'monto' o 'valor')
        if (isset($empleado['extras_adicionales']) && is_array($empleado['extras_adicionales'])) {
            foreach ($empleado['extras_adicionales'] as $extra) {
                $valorExtra = 0;
                if (isset($extra['resultado'])) {
                    $valorExtra = floatval($extra['resultado']);
                } 

                if ($valorExtra > 0) {
                    $sueldoExtraTotal += $valorExtra;
                    $nombreExtra = isset($extra['nombre']) ? $extra['nombre'] : 'Extra';
                    $componentesExtraDetalle[$nombreExtra] = $valorExtra;
                }
            }
        }

        if ($sueldoExtraTotal > 0) {
            $percepciones['Sueldo Extra Total'] = $sueldoExtraTotal;
        }

        // Calcular total percepciones
        $totalPercepcionesEmpleado = array_sum($percepciones);

        // ===== DISEÑO PERCEPCIONES =====
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

        // ===== DEDUCCIONES =====
        $deducciones = [
            'Retardos' => $empleado['retardos'] ?? 0,
            'Permiso' => $empleado['permiso'] ?? 0,
            'Inasistencia' => $empleado['inasistencia'] ?? 0,
            'Checador' => $empleado['checador'] ?? 0,
            'Préstamo' => $empleado['prestamo'] ?? 0,
            'Tarjeta' => $empleado['tarjeta'] ?? 0,
            'Uniformes' => 0
        ];

        // Calcular monto de uniformes desde historial_uniformes (sumar 'cantidad')
        $componentesUniformes = [];
        if (isset($empleado['historial_uniformes']) && is_array($empleado['historial_uniformes'])) {
            $totalUniformes = 0;
            foreach ($empleado['historial_uniformes'] as $u) {
                $cantidadU = floatval($u['cantidad'] ?? 0);
                $folioU = isset($u['folio']) ? $u['folio'] : null;
                if ($cantidadU > 0) {
                    $totalUniformes += $cantidadU;
                    $componentesUniformes[] = ['folio' => $folioU, 'cantidad' => $cantidadU];
                }
            }
            if ($totalUniformes > 0) {
                $deducciones['Uniformes'] = $totalUniformes;
            }
        }

        // Agregar conceptos dinámicos (ej. ISR, IMSS) desde la propiedad 'conceptos'
        $codigoNombres = [
            '45' => 'ISR',
            '52' => 'IMSS',
            '16' => 'Infonavit',
            '107' => 'Ajuste al Sub'
        ];

        if (!empty($empleado['conceptos']) && is_array($empleado['conceptos'])) {
            foreach ($empleado['conceptos'] as $concepto) {
                $valor = 0;
                if (isset($concepto['resultado'])) {
                    $valor = floatval($concepto['resultado']);
                } elseif (isset($concepto['valor'])) {
                    $valor = floatval($concepto['valor']);
                } elseif (isset($concepto['monto'])) {
                    $valor = floatval($concepto['monto']);
                }

                if ($valor > 0) {
                    $codigo = isset($concepto['codigo']) ? strval($concepto['codigo']) : null;
                    if ($codigo && isset($codigoNombres[$codigo])) {
                        $nombreConcepto = $codigoNombres[$codigo];
                    } else {
                        $nombreConcepto = isset($concepto['nombre']) && trim($concepto['nombre']) !== '' ? $concepto['nombre'] : ('Concepto ' . ($concepto['codigo'] ?? ''));
                    }

                    // Si ya existe la clave, sumar al valor existente
                    if (isset($deducciones[$nombreConcepto])) {
                        $deducciones[$nombreConcepto] += $valor;
                    } else {
                        $deducciones[$nombreConcepto] = $valor;
                    }
                }
            }
        }

        // Deducciones adicionales dinámicas (solo en detalle de "Otras Deducciones")
        $deduccionesAdicionales = [];
        $totalDeduccionesAdicionales = 0;
        if (!empty($empleado['deducciones_adicionales']) && is_array($empleado['deducciones_adicionales'])) {
            foreach ($empleado['deducciones_adicionales'] as $ded) {
                $valorDed = 0;
                if (isset($ded['resultado'])) {
                    $valorDed = floatval($ded['resultado']);
                } elseif (isset($ded['valor'])) {
                    $valorDed = floatval($ded['valor']);
                } elseif (isset($ded['monto'])) {
                    $valorDed = floatval($ded['monto']);
                }

                $nombreDed = isset($ded['nombre']) && trim($ded['nombre']) !== '' ? $ded['nombre'] : 'Otra Deducción';
                if ($valorDed > 0) {
                    // Guardar detalle para mostrar después (no agregar al array principal para evitar duplicados)
                    $deduccionesAdicionales[$nombreDed] = ($deduccionesAdicionales[$nombreDed] ?? 0) + $valorDed;
                    $totalDeduccionesAdicionales += $valorDed;
                }
            }
        }

        // Total deducciones por empleado incluye las adicionales
        $totalDeduccionesEmpleado = array_sum($deducciones) + $totalDeduccionesAdicionales;

        // ===== COLUMNA DERECHA - DEDUCCIONES =====
        $pdf->SetXY(110, $inicioY);
        $pdf->SetDrawColor(0, 0, 0);
        $pdf->Line(110, $inicioY, 200, $inicioY);

        // Encabezado Deducciones
        $pdf->SetFont('helvetica', 'B', 10);
        $pdf->SetFillColor(240, 240, 240);
        $pdf->Cell(90, 8, 'DEDUCCIONES', 0, 1, 'C', false);
        $pdf->SetX(110);

        // Línea separadora
        $pdf->SetLineWidth(0.1);
        $pdf->Line(110, $pdf->GetY(), 200, $pdf->GetY());
        $pdf->Ln(2);
        $pdf->SetX(110);

        $pdf->SetFillColor(255, 255, 255);

        foreach ($deducciones as $concepto => $monto) {
            $pdf->SetFont('dejavusans', '', 10);
            $pdf->Cell(60, 6, $concepto, 0, 0, 'L');
            $pdf->SetFont('dejavusansmono', '', 9);
            $pdf->Cell(30, 6, formatoMoneda($monto), 0, 1, 'R');
            $pdf->SetX(110);
        }

        // Mostrar desglose de uniformes si existen componentes
        if (!empty($componentesUniformes)) {
            $pdf->Ln(1);
            $pdf->SetX(110);
            $pdf->SetFont('dejavusans', 'I', 8);
            $pdf->Cell(60, 6, 'Desglose Uniformes', 0, 1, 'L');
            $pdf->SetX(110);
            foreach ($componentesUniformes as $compU) {
                $label = 'Folio: ' . ($compU['folio'] ?? '-');
                $pdf->SetFont('dejavusans', 'I', 8);
                $pdf->Cell(60, 5, '  • ' . $label, 0, 0, 'L');
                $pdf->SetFont('dejavusansmono', 'I', 8);
                $pdf->Cell(30, 5, formatoMoneda($compU['cantidad']), 0, 1, 'R');
                $pdf->SetX(110);
            }
            $pdf->Ln(2);
        }

        // Mostrar F.A/GAFET/COFIA si existen (mostrar total y desglose de las deducciones que lo componen)
        if (!empty($deduccionesAdicionales) && $totalDeduccionesAdicionales > 0) {
            $pdf->Ln(1);
            $pdf->SetX(110);
            $pdf->SetFont('helvetica', 'B', 9);
            $pdf->Cell(60, 6, 'F.A/GAFET/COFIA', 0, 0, 'L');
            $pdf->SetFont('dejavusansmono', 'B', 9);
            $pdf->Cell(30, 6, formatoMoneda($totalDeduccionesAdicionales), 0, 1, 'R');
            $pdf->SetX(110);
            // Mostrar desglose por nombre de cada deducción adicional
            $pdf->Ln(1);
            foreach ($deduccionesAdicionales as $nombreDed => $montoDed) {
                if ($montoDed <= 0) continue;
                $pdf->SetX(110);
                $pdf->SetFont('dejavusans', '', 9);
                $pdf->Cell(60, 5, '  • ' . $nombreDed, 0, 0, 'L');
                $pdf->SetFont('dejavusansmono', '', 9);
                $pdf->Cell(30, 5, formatoMoneda($montoDed), 0, 1, 'R');
            }
            $pdf->Ln(2);
        }

        // Línea antes del total
        $pdf->Ln(2);
        $pdf->Line(110, $pdf->GetY(), 200, $pdf->GetY());
        $pdf->Ln(2);

        // Total deducciones (alineado en la columna derecha)
        $pdf->SetX(110);
        $pdf->SetFont('helvetica', 'B', 11);
        $pdf->Cell(60, 7, 'Total Deducciones', 0, 0, 'R');
        $pdf->SetFont('dejavusansmono', 'B', 10);
        $pdf->Cell(30, 7, formatoMoneda($totalDeduccionesEmpleado), 0, 1, 'R');

        $alturaColumnaDerecha = $pdf->GetY() - $inicioY;

        // Ajustar posición Y al final de ambas columnas
        $alturaMaxima = max($alturaColumnaIzquierda, $alturaColumnaDerecha);
        $pdf->SetY($inicioY + $alturaMaxima + 8);

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
        
        // Línea superior del neto a pagar más delgada
        $pdf->SetLineWidth(0.1);
        $pdf->Line(10, $pdf->GetY(), 200, $pdf->GetY());
        $pdf->Ln(2);

        // Solo mostrar desglose detallado si hay redondeo aplicado
        if ($redondeo != 0 && $sueldoNeto != $sueldoRedondeado) {
            // Mostrar cálculo completo del sueldo
            $pdf->SetTextColor(0, 0, 0);
            $pdf->SetFont('dejavusans', '', 10);
            $pdf->Cell(130, 7, 'Sueldo antes de redondeo:', 0, 0, 'R');
            $pdf->SetFont('dejavusansmono', '', 10);
            $pdf->Cell(60, 7, formatoMoneda($sueldoNeto), 0, 1, 'R');
            
            // Mostrar redondeo aplicado
            $pdf->SetFont('dejavusans', '', 10);
            $pdf->Cell(130, 7, 'Redondeo aplicado:', 0, 0, 'R');
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
            $pdf->Cell(130, 12, 'SUELDO FINAL', 0, 0, 'R', true);
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
            $pdf->Cell(130, 10, 'Sueldo a pagar', 0, 0, 'R', true);
            $pdf->SetFont('dejavusansmono', 'B', 11);
            $pdf->Cell(60, 10, formatoMoneda($sueldoRedondeado), 0, 1, 'R', true);
            $pdf->SetTextColor(0, 0, 0);
        }

        // Línea inferior del neto a pagar más delgada
        $pdf->SetLineWidth(0.2);
        $pdf->Line(10, $pdf->GetY() + 1, 200, $pdf->GetY() + 1);
        $pdf->Ln(3);

        // Acumular totales generales usando el sueldo REDONDEADO
        $totalGeneralPercepciones += $totalPercepcionesEmpleado;
        $totalGeneralDeducciones += $totalDeduccionesEmpleado;
        $totalGeneralNeto += $sueldoRedondeado;  // <-- USAR SUELDO REDONDEADO

        // Acumular totales por departamento y por concepto
        if (isset($deptTotals[$idDepto])) {
            $deptTotals[$idDepto]['percepciones'] += $totalPercepcionesEmpleado;
            $deptTotals[$idDepto]['deducciones'] += $totalDeduccionesEmpleado;
            $deptTotals[$idDepto]['neto'] += $sueldoRedondeado;  // <-- USAR SUELDO REDONDEADO
            $deptTotals[$idDepto]['count'] += 1;

            // Percepciones por concepto
            if (!empty($percepciones) && is_array($percepciones)) {
                foreach ($percepciones as $concepto => $monto) {
                    $deptTotals[$idDepto]['percepciones_by_concept'][$concepto] = ($deptTotals[$idDepto]['percepciones_by_concept'][$concepto] ?? 0) + floatval($monto);
                }
            }

            // Deducciones por concepto (incluye deducciones adicionales)
            if (!empty($deducciones) && is_array($deducciones)) {
                foreach ($deducciones as $concepto => $monto) {
                    $deptTotals[$idDepto]['deducciones_by_concept'][$concepto] = ($deptTotals[$idDepto]['deducciones_by_concept'][$concepto] ?? 0) + floatval($monto);
                }
            }
            if (!empty($deduccionesAdicionales) && is_array($deduccionesAdicionales)) {
                // Agregar todas las deducciones adicionales como UNA entrada: "F.A/GAFET/COFIA"
                $deptTotals[$idDepto]['deducciones_by_concept']['F.A/GAFET/COFIA'] = ($deptTotals[$idDepto]['deducciones_by_concept']['F.A/GAFET/COFIA'] ?? 0) + floatval($totalDeduccionesAdicionales);
            }
        }
    }

    // ===== PÁGINA DE RESUMEN GENERAL =====
    if ($contadorEmpleados > 0) {
        $pdf->AddPage();

        // Título del resumen
        $pdf->SetFont('helvetica', 'B', 16);
        $pdf->Cell(0, 12, 'RESUMEN GENERAL', 0, 1, 'C');
        $pdf->Ln(10);

        // Encabezados de tabla
        $pdf->SetFont('helvetica', 'B', 11);
        $pdf->SetFillColor(240, 240, 240);
        $pdf->Cell(130, 10, 'CONCEPTO', 0, 0, 'C', true);
        $pdf->Cell(50, 10, 'TOTAL', 0, 1, 'C', true);

        // Línea debajo del encabezado
        $pdf->Line(10, $pdf->GetY(), 190, $pdf->GetY());
        $pdf->Ln(3);

        $pdf->SetFillColor(255, 255, 255);

        // Conceptos - mostrar desglose por departamento
        $pdf->SetFont('dejavusans', '', 10);
        $pdf->Cell(130, 8, 'Empleados de Administración', 0, 0, 'L');
        $pdf->SetFont('dejavusansmono', '', 9);
        $pdf->Cell(50, 8, $contadorAdmin, 0, 1, 'R');

        $pdf->SetFont('dejavusans', '', 10);
        $pdf->Cell(130, 8, 'Empleados de Producción', 0, 0, 'L');
        $pdf->SetFont('dejavusansmono', '', 9);
        $pdf->Cell(50, 8, $contadorProduccion, 0, 1, 'R');

        $pdf->SetFont('dejavusans', '', 10);
        $pdf->Cell(130, 8, 'Empleados Seguridad Vigilancia e Intendencia', 0, 0, 'L');
        $pdf->SetFont('dejavusansmono', '', 9);
        $pdf->Cell(50, 8, $contadorSeguridad, 0, 1, 'R');

        $pdf->SetFont('dejavusans', '', 10);
        $pdf->Cell(130, 8, 'Empleados de Administracion Sucursal CdMx', 0, 0, 'L');
        $pdf->SetFont('dejavusansmono', '', 9);
        $pdf->Cell(50, 8, $contadorCdmx, 0, 1, 'R');

        $pdf->SetFont('dejavusans', '', 10);
        $pdf->Cell(130, 8, 'Total de Empleados Procesados', 0, 0, 'L');
        $pdf->SetFont('dejavusansmono', '', 9);
        $pdf->Cell(50, 8, $contadorEmpleados, 0, 1, 'R');

        $pdf->SetFont('dejavusans', '', 10);
        $pdf->Cell(130, 8, 'Total General de Percepciones', 0, 0, 'L');
        $pdf->SetFont('dejavusansmono', '', 9);
        $pdf->Cell(50, 8, formatoMoneda($totalGeneralPercepciones), 0, 1, 'R');

        $pdf->SetFont('dejavusans', '', 10);
        $pdf->Cell(130, 8, 'Total General de Deducciones', 0, 0, 'L');
        $pdf->SetFont('dejavusansmono', '', 9);
        $pdf->Cell(50, 8, formatoMoneda($totalGeneralDeducciones), 0, 1, 'R');

        // Línea antes del total final
        $pdf->Ln(2);
        $pdf->Line(10, $pdf->GetY(), 190, $pdf->GetY());
        $pdf->Ln(3);

        // Total neto con color
        if ($totalGeneralNeto >= 0) {
            $pdf->SetTextColor(0, 100, 0);
        } else {
            $pdf->SetTextColor(200, 0, 0);
        }
        $pdf->SetFillColor(250, 250, 250);
        $pdf->SetFont('helvetica', 'B', 11);
        $pdf->Cell(130, 10, 'TOTAL NETO A PAGAR', 0, 0, 'L', true);
        $pdf->SetFont('dejavusansmono', 'B', 11);
        $pdf->Cell(50, 10, formatoMoneda($totalGeneralNeto), 0, 1, 'R', true);

        // Línea final
        $pdf->Ln(2);
        $pdf->Line(10, $pdf->GetY(), 190, $pdf->GetY());
    }

    // ===== REPORTES POR DEPARTAMENTO =====
    foreach ($deptTotals as $did => $d) {
        if ($d['count'] === 0) continue;

        $pdf->AddPage();
        $pdf->SetFont('helvetica','B',14);
        $pdf->Cell(0,10,$d['name'],0,1,'C');
        $pdf->Ln(4);

        $pdf->SetFont('dejavusans','',10);
        $pdf->Cell(130,8,'Empleados',0,0,'L');
        $pdf->SetFont('dejavusansmono','',9);
        $pdf->Cell(50,8,$d['count'],0,1,'R');

        $pdf->SetFont('dejavusans','',10);
        $pdf->Cell(130,8,'Total Percepciones',0,0,'L');
        $pdf->SetFont('dejavusansmono','',9);
        $pdf->Cell(50,8,formatoMoneda($d['percepciones']),0,1,'R');

        $pdf->SetFont('dejavusans','',10);
        $pdf->Cell(130,8,'Total Deducciones',0,0,'L');
        $pdf->SetFont('dejavusansmono','',9);
        $pdf->Cell(50,8,formatoMoneda($d['deducciones']),0,1,'R');

        $pdf->Ln(6);

        // PERCEPCIONES por concepto
        $pdf->SetFont('helvetica','B',11);
        $pdf->SetFillColor(240,240,240);
        $pdf->Cell(0,8,'PERCEPCIONES',0,1,'C',true);
        $pdf->SetFillColor(255,255,255);

        if (!empty($d['percepciones_by_concept'])) {
            foreach ($d['percepciones_by_concept'] as $concepto => $monto) {
                $pdf->SetFont('dejavusans','',10);
                $pdf->Cell(130,6,$concepto,0,0,'L');
                $pdf->SetFont('dejavusansmono','',9);
                $pdf->Cell(50,6,formatoMoneda($monto),0,1,'R');
            }
        } else {
            $pdf->SetFont('dejavusans','I',9);
            $pdf->Cell(0,6,'No hay percepciones registradas para este departamento.',0,1,'L');
        }

        $pdf->Ln(4);
        // DEDUCCIONES por concepto
        $pdf->SetFont('helvetica','B',11);
        $pdf->SetFillColor(240,240,240);
        $pdf->Cell(0,8,'DEDUCCIONES',0,1,'C',true);
        $pdf->SetFillColor(255,255,255);

        if (!empty($d['deducciones_by_concept'])) {
            foreach ($d['deducciones_by_concept'] as $concepto => $monto) {
                $pdf->SetFont('dejavusans','',10);
                $pdf->Cell(130,6,$concepto,0,0,'L');
                $pdf->SetFont('dejavusansmono','',9);
                $pdf->Cell(50,6,formatoMoneda($monto),0,1,'R');
            }
        } else {
            $pdf->SetFont('dejavusans','I',9);
            $pdf->Cell(0,6,'No hay deducciones registradas para este departamento.',0,1,'L');
        }
    }

    // Salida del PDF de forma segura para AJAX
    $pdfData = $pdf->Output('reporte_nomina_administrativo.pdf', 'S');

    // Limpiar cualquier buffer de salida previo
    if (ob_get_length()) {
        ob_end_clean();
    }

    // Enviar cabeceras y el contenido PDF
    header('Content-Type: application/pdf');
    header('Content-Disposition: attachment; filename="reporte_nomina_administrativo.pdf"');
    header('Content-Length: ' . strlen($pdfData));
    echo $pdfData;
    exit;
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['error' => $e->getMessage()]);
}
?>