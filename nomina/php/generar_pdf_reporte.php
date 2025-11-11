<?php
include "../../conexion/conexion.php";
// Incluir el autoload de Composer para cargar TCPDF
require_once __DIR__ . '/../../vendor/autoload.php';


// Extender la clase TCPDF para personalizar el encabezado y pie de página
class PDFReporte extends TCPDF
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

        // Título principal - Helvetica Bold 16pt (moderno y elegante)
        $this->SetFont('helvetica', 'B', 16);
        $this->SetY(12);
        $this->Cell(0, 10, 'REPORTE CONTABLE DE NÓMINA', 0, 1, 'C', 0, '', 0, false, 'M', 'M');

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
    $numeroSemana = $data['numeroSemana'] ?? 'N/A';
    $fechaCierre = $data['fechaCierre'] ?? date('d/m/Y');

    // Crear nuevo documento PDF
    $pdf = new PDFReporte('P', 'mm', 'A4', true, 'UTF-8', false);
    $pdf->setDatosNomina($tituloNomina, $numeroSemana, $fechaCierre);

    // Configuración del documento
    $pdf->SetCreator('Sistema SAAO');
    $pdf->SetAuthor('Sistema SAAO');
    $pdf->SetTitle('Reporte Contable de Nómina');
    $pdf->SetSubject('Reporte Contable de Nómina - Departamento 40 Libras');
    $pdf->SetKeywords('nomina, reporte, contable, 40 libras');

    // Establecer márgenes
    $pdf->SetMargins(10, 50, 10);
    $pdf->SetHeaderMargin(10);
    $pdf->SetFooterMargin(10);

    // Configurar fuente por defecto - DejaVu Sans 10pt
    $pdf->SetFont('dejavusans', '', 10);

    // Función para formatear moneda
    function formatoMoneda($monto)
    {
        if ($monto == 0) return '$0.00';
        return '$' . number_format((float)$monto, 2, '.', ',');
    }

    // Función para obtener empleados del departamento 40 Libras
    function obtenerEmpleados40Libras($datos)
    {
        $empleados = [];

        // Buscar en departamentos
        if (isset($datos['departamentos'])) {
            foreach ($datos['departamentos'] as $depto) {
                if (
                    stripos($depto['nombre'], '40 Libras') !== false ||
                    stripos($depto['nombre'], 'Produccion 40 Libras') !== false
                ) {
                    $empleados = array_merge($empleados, $depto['empleados'] ?? []);
                }
            }
        }

        // Si no se encontró en departamentos, buscar en la lista plana
        if (empty($empleados) && isset($datos['empleados'])) {
            $empleados = array_filter($datos['empleados'], function ($empleado) {
                return stripos($empleado['puesto'] ?? '', '40 Libras') !== false ||
                    stripos($empleado['nombre_departamento'] ?? '', '40 Libras') !== false;
            });
        }

        // Ordenar por nombre
        usort($empleados, function ($a, $b) {
            return strcmp($a['nombre'] ?? '', $b['nombre'] ?? '');
        });

        return $empleados;
    }

    // Función para obtener empleados sin seguro
    function obtenerEmpleadosSinSeguro($datos) {
        $empleados = [];
        
        // Buscar en departamentos
        if (isset($datos['departamentos'])) {
            foreach ($datos['departamentos'] as $depto) {
                if (stripos($depto['nombre'], 'SIN SEGURO') !== false) {
                    $empleados = array_merge($empleados, $depto['empleados'] ?? []);
                }
            }
        }

        // Si no se encontró en departamentos, buscar en la lista plana
        if (empty($empleados) && isset($datos['empleados'])) {
            $empleados = array_filter($datos['empleados'], function ($empleado) {
                return stripos($empleado['puesto'] ?? '', 'SIN SEGURO') !== false ||
                       stripos($empleado['nombre_departamento'] ?? '', 'SIN SEGURO') !== false;
            });
        }

        // Ordenar por nombre
        usort($empleados, function ($a, $b) {
            return strcmp($a['nombre'] ?? '', $b['nombre'] ?? '');
        });

        return $empleados;
    }

    // Obtener empleados del departamento 40 Libras
    $empleados40Libras = obtenerEmpleados40Libras($datos);
    
    // Obtener empleados sin seguro
    $empleadosSinSeguro = obtenerEmpleadosSinSeguro($datos);
    
    // Combinar ambos grupos (primero 40 libras, luego sin seguro)
    $todosEmpleados = array_merge($empleados40Libras, $empleadosSinSeguro);

    if (empty($todosEmpleados)) {
        $pdf->AddPage();
        $pdf->SetFont('helvetica', 'B', 14);
        $pdf->Cell(0, 20, 'No se encontraron empleados en el departamento de 40 Libras.', 0, 1, 'C');
        $pdf->Output('reporte_nomina_vacio.pdf', 'I');
        exit;
    }

    // Variables para totales generales
    $totalGeneralPercepciones = 0;
    $totalGeneralDeducciones = 0;
    $totalGeneralNeto = 0;
    $contadorEmpleados = 0;

    // Función para obtener NSS, RFC, CURP y fecha de nacimiento del empleado desde la base de datos
    function obtenerDatosEmpleado($clave_empleado, $conexion)
    {
        $datos = [
            'nss' => 'N/A',
            'rfc' => 'N/A',
            'curp' => 'N/A',
            'fecha_nacimiento' => 'N/A'
        ];

        if ($conexion && $clave_empleado) {
            // Preparar consulta para evitar inyección SQL
            $stmt = mysqli_prepare($conexion, "SELECT imss, rfc_empleado, curp, fecha_nacimiento FROM info_empleados WHERE clave_empleado = ?");

            if ($stmt) {
                mysqli_stmt_bind_param($stmt, "s", $clave_empleado);
                mysqli_stmt_execute($stmt);
                $result = mysqli_stmt_get_result($stmt);

                if ($row = mysqli_fetch_assoc($result)) {
                    $datos['nss'] = $row['imss'] ?: 'N/A';
                    $datos['rfc'] = $row['rfc_empleado'] ?: 'N/A';
                    $datos['curp'] = $row['curp'] ?: 'N/A';

                    // Formatear fecha de nacimiento si existe
                    if ($row['fecha_nacimiento'] && $row['fecha_nacimiento'] != '0000-00-00') {
                        $fecha = new DateTime($row['fecha_nacimiento']);
                        $datos['fecha_nacimiento'] = $fecha->format('d/m/Y');
                    }
                }

                mysqli_stmt_close($stmt);
            }
        }

        return $datos;
    }

    // Procesar cada empleado
    foreach ($todosEmpleados as $empleado) {
        // Calcular espacio necesario para el empleado actual (aprox 100mm)
        $espacioNecesario = 100; // Reducido de 120mm para mejor ajuste
        $espacioActual = $pdf->getPageHeight() - $pdf->GetY() - $pdf->getBreakMargin();
        
        // Si es el primer empleado o no hay suficiente espacio, nueva página
        if ($contadorEmpleados === 0 || $espacioActual < $espacioNecesario) {
            if ($contadorEmpleados > 0) {
                $pdf->AddPage();
            } else {
                $pdf->AddPage();
            }
        } else if ($contadorEmpleados > 0) {
            // Agregar separación mínima entre empleados en la misma página
            $pdf->Ln(8);
            // Línea separadora entre empleados más delgada
            $pdf->SetLineWidth(0.1);
            $pdf->Line(10, $pdf->GetY(), 200, $pdf->GetY());
            $pdf->Ln(5);
        }

        $contadorEmpleados++;

        // ===== OBTENER DATOS COMPLETOS DESDE BASE DE DATOS =====
        $datosEmpleado = obtenerDatosEmpleado($empleado['clave'] ?? '', $conexion);
        $nssEmpleado = $datosEmpleado['nss'];
        $rfcEmpleado = $datosEmpleado['rfc'];
        $curpEmpleado = $datosEmpleado['curp'];
        $fechaNacimiento = $datosEmpleado['fecha_nacimiento'];

        // ===== ENCABEZADO DEL EMPLEADO =====
        // Nombre del empleado con contador - Tamaño de fuente reducido para ahorrar espacio
        $pdf->SetFont('helvetica', 'B', 11);
        $nombreConContador = '#' . $contadorEmpleados . ' ' . strtoupper($empleado['nombre'] ?? 'N/A');
        $pdf->Cell(0, 6, $nombreConContador, 0, 1, 'L');

        // Información básica del empleado - DejaVu Sans 10pt (texto general)
        $pdf->SetFont('dejavusans', '', 10);
        $pdf->Cell(50, 6, 'Clave: ' . ($empleado['clave'] ?? 'N/A'), 0, 0, 'L');
        $pdf->Cell(0, 6, 'Puesto: ' . ($empleado['puesto'] ?? $empleado['nombre_departamento'] ?? 'N/A'), 0, 1, 'R');

        // Agregar línea con NSS y RFC
        $pdf->Cell(50, 6, 'NSS: ' . $nssEmpleado, 0, 0, 'L');
        $pdf->Cell(0, 6, 'RFC: ' . $rfcEmpleado, 0, 1, 'R');

        // Agregar línea con CURP y Fecha de Nacimiento
        $pdf->Cell(50, 6, 'CURP: ' . $curpEmpleado, 0, 0, 'L');
        $pdf->Cell(0, 6, 'Fecha Nac: ' . $fechaNacimiento, 0, 1, 'R');

        $pdf->Ln(8);

        // ===== CALCULAR DATOS =====
        // Percepciones principales
        $percepciones = [
            'Sueldo Base' => $empleado['sueldo_base'] ?? 0,
            'Incentivo' => $empleado['incentivo'] ?? 0
        ];

        // Usar sueldo_extra_final si existe, sino calcular desde componentes
        $sueldoExtraFinal = $empleado['sueldo_extra_final'] ?? 0;

        // Si no hay sueldo_extra_final, calcularlo desde los componentes
        if ($sueldoExtraFinal == 0) {
            $componentesExtra = [
                $empleado['sueldo_extra'] ?? 0,
                $empleado['actividades_especiales'] ?? 0,
                $empleado['bono_antiguedad'] ?? 0,
                $empleado['bono_puesto'] ?? 0
            ];

            // Agregar conceptos adicionales al cálculo
            if (!empty($empleado['conceptos_adicionales']) && is_array($empleado['conceptos_adicionales'])) {
                foreach ($empleado['conceptos_adicionales'] as $concepto) {
                    if (isset($concepto['valor']) && $concepto['valor'] > 0) {
                        $componentesExtra[] = $concepto['valor'];
                    }
                }
            }

            $sueldoExtraFinal = array_sum($componentesExtra);
        }

        // Agregar el sueldo extra final como una sola línea en percepciones si es mayor a 0
        if ($sueldoExtraFinal > 0) {
            $percepciones['Sueldo Extra Total'] = $sueldoExtraFinal;
        }

        // Calcular total percepciones
        $totalPercepcionesEmpleado = array_sum($percepciones);

        // ===== PREPARAR COMPONENTES PARA MOSTRAR DETALLE =====
        $componentesExtraDetalle = [];
        if ($sueldoExtraFinal > 0) {
            // SIEMPRE mostrar "Horas Extra" independientemente de su valor
            $componentesExtraDetalle['• Horas Extra'] = $empleado['sueldo_extra'] ?? 0;
            
            // Solo mostrar otros componentes que tengan valor > 0
            if (($empleado['actividades_especiales'] ?? 0) > 0) {
                $componentesExtraDetalle['• Actividades Especiales'] = $empleado['actividades_especiales'];
            }
            if (($empleado['bono_antiguedad'] ?? 0) > 0) {
                $componentesExtraDetalle['• Bono Antigüedad'] = $empleado['bono_antiguedad'];
            }
            if (($empleado['bono_puesto'] ?? 0) > 0) {
                $componentesExtraDetalle['• Bono de Puesto'] = $empleado['bono_puesto'];
            }

            // Agregar conceptos adicionales
            if (!empty($empleado['conceptos_adicionales']) && is_array($empleado['conceptos_adicionales'])) {
                foreach ($empleado['conceptos_adicionales'] as $concepto) {
                    if (isset($concepto['nombre']) && isset($concepto['valor']) && $concepto['valor'] > 0) {
                        $componentesExtraDetalle['• ' . $concepto['nombre']] = $concepto['valor'];
                    }
                }
            }
        }

        // Deducciones fiscales
        $deduccionesFiscales = [
            'Infonavit' => 0,
            'I.S.R.' => 0,
            'I.M.S.S.' => 0
        ];

        // Mapear conceptos fiscales
        if (!empty($empleado['conceptos']) && is_array($empleado['conceptos'])) {
            foreach ($empleado['conceptos'] as $concepto) {
                if (isset($concepto['codigo']) && isset($concepto['resultado']) && $concepto['resultado'] > 0) {
                    switch ($concepto['codigo']) {
                        case '45':
                            $deduccionesFiscales['I.S.R.'] = $concepto['resultado'];
                            break;
                        case '52':
                            $deduccionesFiscales['I.M.S.S.'] = $concepto['resultado'];
                            break;
                        case '16':
                            $deduccionesFiscales['Infonavit'] = $concepto['resultado'];
                            break;
                    }
                }
            }
        }

        // Otras deducciones
        // Cuando se detecta la propiedad neto_pagar, mostrar como "Tarjeta" en lugar de "Neto a pagar"
        $otrasDeducciones = [
            'Tarjeta' => $empleado['neto_pagar'] ?? 0,
            'Préstamo' => $empleado['prestamo'] ?? 0,
            'Inasistencias' => $empleado['inasistencias_descuento'] ?? 0,
            'Uniformes' => $empleado['uniformes'] ?? 0,
            'Checador' => $empleado['checador'] ?? 0,
            'F.A/GAFET/COFIA' => $empleado['fa_gafet_cofia'] ?? 0
        ];

        $totalDeduccionesFiscales = array_sum($deduccionesFiscales);
        $totalOtrasDeducciones = array_sum($otrasDeducciones);
        $totalDeduccionesEmpleado = $totalDeduccionesFiscales + $totalOtrasDeducciones;

        // ===== DISEÑO DE DOS COLUMNAS =====
        $inicioY = $pdf->GetY();

        // ===== COLUMNA IZQUIERDA - PERCEPCIONES =====
        $pdf->SetXY(10, $inicioY);

        // Línea superior de la columna izquierda
        $pdf->SetDrawColor(0, 0, 0); // negro
        $pdf->Line(10, $inicioY, 105, $inicioY); // línea horizontal superior

        // Encabezado Percepciones - Helvetica Bold 10pt (encabezados de tabla)
        $pdf->SetFont('helvetica', 'B', 10);
        $pdf->SetFillColor(240, 240, 240);
        $pdf->Cell(95, 8, 'PERCEPCIONES', 0, 1, 'C', false);
        $pdf->SetX(10);

        // Línea debajo del encabezado
        $pdf->Line(10, $pdf->GetY(), 105, $pdf->GetY());
        $pdf->Ln(2);
        $pdf->SetX(10);

        $pdf->SetFillColor(255, 255, 255);

        // Mostrar percepciones principales - SIEMPRE MOSTRAR TODOS LOS CONCEPTOS
        foreach ($percepciones as $concepto => $monto) {
            // CAMBIO: Mostrar SIEMPRE todos los conceptos, incluso si son 0
            $pdf->SetFont('dejavusans', '', 10);
            $pdf->Cell(65, 6, $concepto, 0, 0, 'L');
            $pdf->SetFont('dejavusansmono', '', 9);
            $pdf->Cell(30, 6, formatoMoneda($monto), 0, 1, 'R');
            $pdf->SetX(10);
        }

        // Mostrar detalle de componentes extra - SIEMPRE mostrar si hay "Sueldo Extra Total"
        if ($sueldoExtraFinal > 0 && count($componentesExtraDetalle) >= 1) {
            $pdf->Ln(2);
            $pdf->SetFont('dejavusans', 'I', 8);
            $pdf->Cell(65, 4, 'Desglose Sueldo Extra:', 0, 1, 'L');
            $pdf->SetX(10);

            foreach ($componentesExtraDetalle as $concepto => $monto) {
                // Concepto en DejaVu Sans 8pt itálica
                $pdf->SetFont('dejavusans', 'I', 8);
                $pdf->Cell(65, 4, $concepto, 0, 0, 'L');
                // Monto en DejaVu Sans Mono 8pt
                $pdf->SetFont('dejavusansmono', '', 8);
                $pdf->Cell(30, 4, formatoMoneda($monto), 0, 1, 'R');
                $pdf->SetX(10);
            }
        }

        // Línea antes del total
        $pdf->Ln(2);
        $pdf->Line(10, $pdf->GetY(), 105, $pdf->GetY());
        $pdf->Ln(2);
        $pdf->SetX(10);

        // Total percepciones - Helvetica Bold 11pt para texto, DejaVu Sans Mono Bold 10pt para monto
        $pdf->SetFont('helvetica', 'B', 11);
        $pdf->Cell(65, 7, 'Total Percepciones', 0, 0, 'R');
        $pdf->SetFont('dejavusansmono', 'B', 10);
        $pdf->Cell(30, 7, formatoMoneda($totalPercepcionesEmpleado), 0, 1, 'R');

        $alturaColumnaIzquierda = $pdf->GetY() - $inicioY;

        // ===== COLUMNA DERECHA - DEDUCCIONES =====
        $pdf->SetXY(110, $inicioY);

        // Línea superior de la columna derecha
        $pdf->SetDrawColor(0, 0, 0); // negro
        $pdf->Line(110, $inicioY, 200, $inicioY); // línea horizontal superior

        // Encabezado Deducciones - Helvetica Bold 10pt (encabezados de tabla)
        $pdf->SetFont('helvetica', 'B', 10);
        $pdf->SetFillColor(240, 240, 240);
        $pdf->Cell(90, 8, 'DEDUCCIONES', 0, 1, 'C', false);
        $pdf->SetX(110);

        // Línea separadora más delgada
        $pdf->SetLineWidth(0.1);
        $pdf->Line(10, $pdf->GetY(), 200, $pdf->GetY());
        $pdf->Ln(5);
        $pdf->SetX(110);

        $pdf->SetFillColor(255, 255, 255);

        // Mostrar deducciones fiscales - SIEMPRE MOSTRAR TODOS LOS CONCEPTOS
        foreach ($deduccionesFiscales as $concepto => $monto) {
            // CAMBIO: Siempre mostrar el concepto, incluso si el monto es 0
            $pdf->SetFont('dejavusans', '', 10);
            $pdf->Cell(60, 6, $concepto, 0, 0, 'L');
            $pdf->SetFont('dejavusansmono', '', 9);
            $pdf->Cell(30, 6, formatoMoneda($monto), 0, 1, 'R');
            $pdf->SetX(110);
        }

        // Mostrar otras deducciones - SIEMPRE MOSTRAR TODOS LOS CONCEPTOS
        foreach ($otrasDeducciones as $concepto => $monto) {
            // CAMBIO: Mostrar SIEMPRE todos los conceptos, incluso si son 0
            $pdf->SetFont('dejavusans', '', 10);
            $pdf->Cell(60, 6, $concepto, 0, 0, 'L');
            $pdf->SetFont('dejavusansmono', '', 9);
            $pdf->Cell(30, 6, formatoMoneda($monto), 0, 1, 'R');
            $pdf->SetX(110);
        }

        // Línea antes del total
        $pdf->Ln(2);
        $pdf->Line(110, $pdf->GetY(), 200, $pdf->GetY());
        $pdf->Ln(2);
        $pdf->SetX(110);

        // Total deducciones - Helvetica Bold 11pt para texto, DejaVu Sans Mono Bold 10pt para monto
        $pdf->SetFont('helvetica', 'B', 11);
        $pdf->Cell(60, 7, 'Total Deducciones', 0, 0, 'R');
        $pdf->SetFont('dejavusansmono', 'B', 10);
        $pdf->Cell(30, 7, formatoMoneda($totalDeduccionesEmpleado), 0, 1, 'R');

        $alturaColumnaDerecha = $pdf->GetY() - $inicioY;

        // Ajustar posición Y al final de ambas columnas
        $alturaMaxima = max($alturaColumnaIzquierda, $alturaColumnaDerecha);
        $pdf->SetY($inicioY + $alturaMaxima + 8);

        // ===== SUELDO A PAGAR =====
        $sueldoNeto = $totalPercepcionesEmpleado - $totalDeduccionesEmpleado;

        // Línea superior del neto a pagar más delgada
        $pdf->SetLineWidth(0.1);
        $pdf->Line(10, $pdf->GetY(), 200, $pdf->GetY());
        $pdf->Ln(2);

        // Color según el resultado
        if ($sueldoNeto >= 0) {
            $pdf->SetTextColor(0, 100, 0);
        } else {
            $pdf->SetTextColor(200, 0, 0);
        }

        $pdf->SetFillColor(250, 250, 250);
        // Texto en Helvetica Bold 11pt, monto en DejaVu Sans Mono Bold 11pt
        $pdf->SetFont('helvetica', 'B', 11);
        $pdf->Cell(130, 10, 'Sueldo a pagar', 0, 0, 'R', true);
        $pdf->SetFont('dejavusansmono', 'B', 11);
        $pdf->Cell(60, 10, formatoMoneda($sueldoNeto), 0, 1, 'R', true);
        $pdf->SetTextColor(0, 0, 0);

        // Línea inferior del neto a pagar más delgada
        $pdf->SetLineWidth(0.2);
        $pdf->Line(10, $pdf->GetY() + 1, 200, $pdf->GetY() + 1);
        $pdf->Ln(3); // Acumular totales generales
        $totalGeneralPercepciones += $totalPercepcionesEmpleado;
        $totalGeneralDeducciones += $totalDeduccionesEmpleado;
        $totalGeneralNeto += $sueldoNeto;

        // Información adicional solo si hay espacio - Actualizada con datos reales
        $espacioRestanteActual = $pdf->getPageHeight() - $pdf->GetY() - $pdf->getBreakMargin();
        if ($espacioRestanteActual > 25) {
            $pdf->Ln(5);
            $pdf->SetFont('dejavusans', '', 8);
            $pdf->Cell(0, 4, 'RFC: ' . $rfcEmpleado . ' | NSS: ' . $nssEmpleado, 0, 1, 'L');
            $pdf->Cell(0, 4, 'CURP: ' . $curpEmpleado, 0, 1, 'R');
        }
    }

    // ===== PÁGINA DE RESUMEN GENERAL =====
    if ($contadorEmpleados > 0) {
        $pdf->AddPage();

        // Título del resumen - Helvetica Bold 16pt (título principal)
        $pdf->SetFont('helvetica', 'B', 16);
        $pdf->Cell(0, 12, 'RESUMEN GENERAL - DEPARTAMENTO 40 LIBRAS', 0, 1, 'C');
        $pdf->Ln(10);

        // Encabezados de tabla - Helvetica Bold 11pt
        $pdf->SetFont('helvetica', 'B', 11);
        $pdf->SetFillColor(240, 240, 240);
        $pdf->Cell(130, 10, 'CONCEPTO', 0, 0, 'C', true);
        $pdf->Cell(50, 10, 'TOTAL', 0, 1, 'C', true);

        // Línea debajo del encabezado
        $pdf->Line(10, $pdf->GetY(), 190, $pdf->GetY());
        $pdf->Ln(3);

        $pdf->SetFillColor(255, 255, 255);

        // Conceptos en DejaVu Sans 10pt (texto general), montos en DejaVu Sans Mono 9pt
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

        // Total neto con color - Helvetica Bold 11pt para texto (totales/resumen), DejaVu Sans Mono Bold 11pt para monto
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
        $pdf->SetTextColor(0, 0, 0);

        // Línea final
        $pdf->Line(10, $pdf->GetY(), 190, $pdf->GetY());

        // Información adicional - DejaVu Sans 10pt (texto general)
        $pdf->Ln(10);
        $pdf->SetFont('dejavusans', '', 10);
      }

    // Generar el PDF
    $pdf->Output('reporte_nomina_40_libras.pdf', 'I');

    // Cerrar conexión a la base de datos
    if ($conexion) {
        mysqli_close($conexion);
    }
} catch (Exception $e) {
    // Cerrar conexión en caso de error
    if (isset($conexion) && $conexion) {
        mysqli_close($conexion);
    }

    // En caso de error, devolver respuesta JSON
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
    exit;
}
