<?php
// Controlar errores y enviarlos como JSON
function enviarError($mensaje)
{
    header('Content-Type: application/json');
    echo json_encode(['error' => $mensaje]);
    exit;
}

try {
    // Recibir datos del POST
    $jsonData = file_get_contents('php://input');
    $data = json_decode($jsonData, true);

    if (!$data || !isset($data['datos'])) {
        enviarError('No se recibieron datos válidos.');
    }

    // Extraer información para el título
    $tituloNomina = $data['tituloNomina'] ?? '';
    $tituloExcel = $data['tituloExcel'] ?? '';
    $jsonGlobal = $data['datos'];

    // Verificar que existan las fechas necesarias
    if (!isset($jsonGlobal['fecha_inicio']) || !isset($jsonGlobal['fecha_cierre'])) {
        enviarError('Faltan datos de fechas en la información recibida.');
    }

    // Requerir TCPDF en lugar de mPDF
    require_once __DIR__ . '/../../vendor/autoload.php';

    // Extender TCPDF para personalizar encabezado y pie de página
    class PDFNomina extends TCPDF
    {
        private $tituloNomina;
        private $tituloExcel;
        private $logoPath;

        public function setDatosNomina($titulo, $excel, $logo)
        {
            $this->tituloNomina = $titulo;
            $this->tituloExcel = $excel;
            $this->logoPath = $logo;
        }

        // Encabezado personalizado
        public function Header()
        {
            // Logo a la izquierda - posición más arriba
            if (file_exists($this->logoPath)) {
                $this->Image($this->logoPath, 10, 5, 25, 0, 'JPG'); // Cambiado Y de 10 a 5
            }

            // Título principal centrado
            $this->SetFont('helvetica', 'B', 12);
            $this->SetTextColor(0, 0, 0); // Negro
            $this->SetY(8); // Ajustado para compensar el logo más arriba
            $anchoTitulo = $this->GetStringWidth('PRODUCCION 40 LIBRAS');
            $centroPagina = $this->getPageWidth() / 2;
            $this->SetX($centroPagina - ($anchoTitulo / 2));
            $this->Cell($anchoTitulo, 5, 'PRODUCCION 40 LIBRAS', 0, 1, 'L');

            // Nombre de la empresa centrado
            $this->SetFont('helvetica', 'B', 9);
            $this->SetY(14); // Ajustado para mantener el espaciado
            $anchoEmpresa = $this->GetStringWidth('CITRICOS SAAO S.A DE C.V');
            $this->SetX($centroPagina - ($anchoEmpresa / 2));
            $this->Cell($anchoEmpresa, 5, 'CITRICOS SAAO S.A DE C.V', 0, 1, 'L');

            // Título de la nómina perfectamente centrado
            $this->SetFont('helvetica', '', 10);
            $this->SetTextColor(0, 0, 0);
            $this->SetY(22);
            // Calcular ancho del texto para centrarlo manualmente
            $anchoTexto = $this->GetStringWidth($this->tituloNomina);
            $centroPagina = $this->getPageWidth() / 2;
            $posX = $centroPagina - ($anchoTexto / 2);
            $this->SetX($posX);
            $this->Cell($anchoTexto, 5, $this->tituloNomina, 0, 0, 'L');

            // Semana alineada a la derecha
            // Calcular posición considerando zona no imprimible de impresoras (mínimo 25mm del borde)
            $this->SetFont('helvetica', 'B', 10);
            $this->SetY(22);
            $margenSeguridad = 25; // Margen de seguridad aumentado para evitar corte al imprimir
            $anchoTexto = $this->GetStringWidth($this->tituloExcel);
            $anchoCelda = $anchoTexto + 5; // Agregar padding interno
            $posX = $this->getPageWidth() - $margenSeguridad - $anchoCelda;
            $this->SetX($posX);
            $this->Cell($anchoCelda, 5, $this->tituloExcel, 0, 0, 'R');

            $this->SetY(32); // Ajustado para mantener el espaciado con el logo más arriba
        }

        // Pie de página
        public function Footer()
        {
            $this->SetY(-15);
            $this->SetFont('helvetica', 'I', 8);
            $this->Cell(0, 10, 'Página ' . $this->getAliasNumPage() . '/' . $this->getAliasNbPages(), 0, false, 'C');
        }
    }

    // Crear instancia de TCPDF con orientación horizontal (landscape)
    $pdf = new PDFNomina('L', 'mm', 'A4', true, 'UTF-8', false);

    // Ruta absoluta al logo
    $logoPath = __DIR__ . '/../../public/img/logo.jpg';

    // Verificar si el logo existe
    if (!file_exists($logoPath)) {
        enviarError("El logo no se encuentra en la ruta: {$logoPath}");
    }

    // Configurar datos de la nómina
    $pdf->setDatosNomina($tituloNomina, $tituloExcel, $logoPath);

    // Configuración del documento
    $pdf->SetCreator('Sistema SAAO');
    $pdf->SetAuthor('Sistema SAAO');
    $pdf->SetTitle('Nómina - ' . $tituloExcel);
    $pdf->SetSubject('Nómina PRODUCCION 40 LIBRAS');

    // Definir anchos de columnas (en mm) - Total ajustado a 277mm (máximo para A4 landscape)
    $anchos = [
        8,   // # 
        90,  // NOMBRE (más ancho para nombres largos)
        25,  // PUESTO 
        25,  // SUELDO NETO 
        25,  // INCENTIVO 
        25,  // EXTRA 
        25,  // TARJETA 
        25,  // PRÉSTAMO 
        25,  // INASIST 
        25,  // UNIFORMES 
        25,  // INFONAVIT 
        25,  // ISR 
        25,  // IMSS 
        25,  // CHECADOR 
        25,  // F.A/GAFET/COFIA 
        25,  // SUELDO A COBRAR 
        35   // FIRMA RECIBIDO (espacio para firma)
    ];

    // Asegurar que el ancho total no exceda el ancho imprimible (considerando zona no imprimible)
    // A4 en horizontal tiene 297mm, pero zona no imprimible puede ser hasta 10mm cada lado
    // Por seguridad, usar máximo 270mm para el contenido de la tabla
    $anchoMaximoTabla = 270;
    $anchoTotal = array_sum($anchos);
    if ($anchoTotal > $anchoMaximoTabla) {
        $factorAjuste = $anchoMaximoTabla / $anchoTotal;
        foreach ($anchos as &$ancho) {
            $ancho = floor($ancho * $factorAjuste);
        }
        $anchoTotal = array_sum($anchos); // Recalcular después del ajuste
    }

    // Calcular márgenes para centrar la tabla
    // A4 en horizontal tiene 297mm de ancho
    $anchoPagina = 297;
    // Considerar zona no imprimible de 10mm mínimo en cada lado
    $margenMinimoSeguridad = 10;
    // Calcular el margen izquierdo para centrar perfectamente la tabla
    $margenIzquierdo = ($anchoPagina - $anchoTotal) / 2;
    // Asegurar que nunca sea menor que el margen mínimo de seguridad
    $margenIzquierdo = max($margenMinimoSeguridad, $margenIzquierdo);
    $margenSuperior = 40;
    $margenDerecho = $margenIzquierdo; // Mismo margen que el izquierdo para centrar perfectamente
    $margenInferior = 15;

    // Establecer márgenes de TCPDF (estos afectan el área de contenido automática)
    $pdf->SetMargins(10, $margenSuperior, 10); // Márgenes mínimos para TCPDF
    $pdf->SetHeaderMargin(5);
    $pdf->SetFooterMargin(5);
    $pdf->SetAutoPageBreak(true, $margenInferior);
    
    // Variable para posición X absoluta de inicio de tabla (para centrado manual)
    $posicionXTabla = $margenIzquierdo; // Posición absoluta desde el borde izquierdo de la página

    // Configuración para mejor renderizado en pantalla e impresión
    $pdf->setPrintHeader(true);
    $pdf->setHeaderFont(array('helvetica', '', 10));
    $pdf->setFooterFont(array('helvetica', '', 8));

    // Agregar página
    $pdf->AddPage();

    // Función para formatear números
    $formatearNumero = function ($numero, $esDeduccion = false) {
        if ($numero == 0) return '';
        $formateado = number_format(abs($numero), 2, '.', ',');
        if ($esDeduccion) {
            return '-$ ' . $formateado;
        } else {
            return '$ ' . $formateado;
        }
    };

    // Definir encabezados
    $encabezados = [
        '#',
        'NOMBRE',
        'PUESTO',
        'SUELDO NETO',
        'INCENTIVO',
        'EXTRA',
        'TARJETA',
        'PRÉSTAMO',
        'INASIST',
        'UNIFORMES',
        'INFONAVIT',
        'ISR',
        'IMSS',
        'CHECADOR',
        'F.A/GAFET/COFIA',
        'SUELDO A COBRAR',
        'FIRMA RECIBIDO'
    ];

    // Crear encabezados de tabla
    $pdf->SetFillColor(255, 251, 0); // Color amarillo
    $pdf->SetTextColor(0, 0, 0); // Texto negro
    $pdf->SetDrawColor(0, 0, 0); // Bordes negros
    $pdf->SetLineWidth(0.1); // Líneas más delgadas
    $pdf->SetFont('helvetica', 'B', 6); // Tamaño de fuente reducido

    // Configuración inicial para encabezados
    // Usar la posición X absoluta calculada para centrar perfectamente la tabla
    $x = $posicionXTabla;
    $y = $pdf->GetY();
    $alturaFila = 8; // Altura reducida para mejor ajuste

    for ($i = 0; $i < count($encabezados); $i++) {
        $pdf->SetXY($x, $y);

        // Manejar encabezados de múltiples líneas
        if ($i == 3) { // SUELDO NETO
            $pdf->Cell($anchos[$i], $alturaFila / 2, 'SUELDO', 'LRT', 0, 'C', true);
            $pdf->SetXY($x, $y + ($alturaFila / 2));
            $pdf->Cell($anchos[$i], $alturaFila / 2, 'NETO', 'LRB', 0, 'C', true);
        } elseif ($i == 15) { // SUELDO A COBRAR (ajustado)
            $pdf->Cell($anchos[$i], $alturaFila / 2, 'SUELDO A', 'LRT', 0, 'C', true);
            $pdf->SetXY($x, $y + ($alturaFila / 2));
            $pdf->Cell($anchos[$i], $alturaFila / 2, 'COBRAR', 'LRB', 0, 'C', true);
        } elseif ($i == 14) { // F.A/GAFET/COFIA
            $pdf->Cell($anchos[$i], $alturaFila / 3, 'F.A/GAFET', 'LRT', 0, 'C', true);
            $pdf->SetXY($x, $y + ($alturaFila / 3));
            $pdf->Cell($anchos[$i], $alturaFila / 3, 'COFIA', 'LR', 0, 'C', true);
            $pdf->SetXY($x, $y + (2 * $alturaFila / 3));
            $pdf->Cell($anchos[$i], $alturaFila / 3, '', 'LRB', 0, 'C', true);
        } elseif ($i == 16) { // FIRMA RECIBIDO
            $pdf->Cell($anchos[$i], $alturaFila / 2, 'FIRMA', 'LRT', 0, 'C', true);
            $pdf->SetXY($x, $y + ($alturaFila / 2));
            $pdf->Cell($anchos[$i], $alturaFila / 2, 'RECIBIDO', 'LRB', 0, 'C', true);
        } else {
            // Para encabezados de una sola línea
            $pdf->Cell($anchos[$i], $alturaFila, $encabezados[$i], 1, 0, 'C', true);
        }

        $x += $anchos[$i];
    }

    // Posicionar después de encabezados
    $pdf->SetY($y + $alturaFila);

    // Variables para totales
    $numero = 1;
    $totalEmpleados = 0;
    $totales = [
        'sueldo_base' => 0,
        'incentivo' => 0,
        'sueldo_extra_final' => 0,
        'neto_pagar' => 0,
        'prestamo' => 0,
        'inasistencias_descuento' => 0,
        'uniformes' => 0,
        'infonavit' => 0,
        'isr' => 0,
        'imss' => 0,
        'checador' => 0,
        'fa_gafet_cofia' => 0,
        'sueldo_a_cobrar' => 0
    ];

    // Configurar para contenido de tabla
    $pdf->SetFillColor(255, 255, 255); // Fondo blanco
    $pdf->SetTextColor(0, 0, 0); // Texto negro
    $pdf->SetFont('helvetica', '', 7);

    // Procesar datos de empleados
    if (isset($jsonGlobal['departamentos'])) {
        foreach ($jsonGlobal['departamentos'] as $depto) {
            if (stripos($depto['nombre'], 'PRODUCCION 40 LIBRAS') !== false) {
                $puestoDepartamento = '40 LIBRAS';
                foreach ($depto['empleados'] as $empleado) {
                    $claveEmpleado = $empleado['clave'] ?? null;

                    if ($claveEmpleado) {
                        // Verificar si hay espacio para otra fila (incluyendo encabezados)
                        $espacioNecesario = $alturaFila + 2; // Altura de la fila más un pequeño margen
                        $espacioDisponible = $pdf->GetPageHeight() - $pdf->GetY() - 15; // 15mm para el pie de página

                        if ($espacioDisponible < $espacioNecesario) {
                            $pdf->AddPage();

                            // Redibujar encabezados en nueva página con el MISMO formato que la primera página
                            $pdf->SetFillColor(255, 251, 0); // Color amarillo
                            $pdf->SetTextColor(0, 0, 0);
                            $pdf->SetFont('helvetica', 'B', 6);

                            $x = $posicionXTabla;
                            $y = $pdf->GetY();

                            // Dibujar encabezados de la tabla
                            // Usar EXACTAMENTE la misma lógica que en el encabezado de la primera página
                            for ($i = 0; $i < count($encabezados); $i++) {
                                $pdf->SetXY($x, $y);

                                // Manejar encabezados de múltiples líneas - MISMA lógica que primera página
                                if ($i == 3) { // SUELDO NETO
                                    $pdf->Cell($anchos[$i], $alturaFila / 2, 'SUELDO', 'LRT', 0, 'C', true);
                                    $pdf->SetXY($x, $y + ($alturaFila / 2));
                                    $pdf->Cell($anchos[$i], $alturaFila / 2, 'NETO', 'LRB', 0, 'C', true);
                                } elseif ($i == 15) { // SUELDO A COBRAR
                                    $pdf->Cell($anchos[$i], $alturaFila / 2, 'SUELDO A', 'LRT', 0, 'C', true);
                                    $pdf->SetXY($x, $y + ($alturaFila / 2));
                                    $pdf->Cell($anchos[$i], $alturaFila / 2, 'COBRAR', 'LRB', 0, 'C', true);
                                } elseif ($i == 14) { // F.A/GAFET/COFIA
                                    $pdf->Cell($anchos[$i], $alturaFila / 3, 'F.A/GAFET', 'LRT', 0, 'C', true);
                                    $pdf->SetXY($x, $y + ($alturaFila / 3));
                                    $pdf->Cell($anchos[$i], $alturaFila / 3, 'COFIA', 'LR', 0, 'C', true);
                                    $pdf->SetXY($x, $y + (2 * $alturaFila / 3));
                                    $pdf->Cell($anchos[$i], $alturaFila / 3, '', 'LRB', 0, 'C', true);
                                } elseif ($i == 16) { // FIRMA RECIBIDO
                                    $pdf->Cell($anchos[$i], $alturaFila / 2, 'FIRMA', 'LRT', 0, 'C', true);
                                    $pdf->SetXY($x, $y + ($alturaFila / 2));
                                    $pdf->Cell($anchos[$i], $alturaFila / 2, 'RECIBIDO', 'LRB', 0, 'C', true);
                                } else {
                                    // Para encabezados de una sola línea
                                    $pdf->Cell($anchos[$i], $alturaFila, $encabezados[$i], 1, 0, 'C', true);
                                }

                                $x += $anchos[$i];
                            }

                            // Posicionar después de los encabezados
                            $pdf->SetY($y + $alturaFila);

                            // Restaurar estilos para los datos
                            $pdf->SetFillColor(255, 255, 255);
                            $pdf->SetTextColor(0, 0, 0);
                            $pdf->SetFont('helvetica', '', 7);
                        }

                        $x = $posicionXTabla;
                        // Calcular valores del empleado
                        $sueldo_base = $empleado['sueldo_base'] ?? 0;
                        $incentivo = $empleado['incentivo'] ?? 0;
                        $sueldo_extra = $empleado['sueldo_extra_final'] ?? 0;
                        $tarjeta = isset($empleado['neto_pagar']) ? ($empleado['neto_pagar'] != 0 ? -1 * (float)$empleado['neto_pagar'] : 0) : 0;
                        $prestamo = isset($empleado['prestamo']) ? ($empleado['prestamo'] != 0 ? -1 * (float)$empleado['prestamo'] : 0) : 0;
                        $inasistencias = isset($empleado['inasistencias_descuento']) ? ($empleado['inasistencias_descuento'] != 0 ? -1 * (float)$empleado['inasistencias_descuento'] : 0) : 0;
                        $uniformes = isset($empleado['uniformes']) ? ($empleado['uniformes'] != 0 ? -1 * (float)$empleado['uniformes'] : 0) : 0;

                        // Conceptos fiscales
                        $conceptos = $empleado['conceptos'] ?? [];
                        $getConcepto = function ($codigo) use ($conceptos) {
                            foreach ($conceptos as $c) {
                                if (isset($c['codigo']) && $c['codigo'] == $codigo) {
                                    return (float)($c['resultado'] ?? 0);
                                }
                            }
                            return 0;
                        };

                        $infonavit = $getConcepto('16');
                        $infonavit = $infonavit != 0 ? -1 * $infonavit : 0;

                        $isr = $getConcepto('45');
                        $isr = $isr != 0 ? -1 * $isr : 0;

                        $imss = $getConcepto('52');
                        $imss = $imss != 0 ? -1 * $imss : 0;

                        $checador = isset($empleado['checador']) ? ($empleado['checador'] != 0 ? -1 * (float)$empleado['checador'] : 0) : 0;
                        $fa_gafet_cofia = isset($empleado['fa_gafet_cofia']) ? ($empleado['fa_gafet_cofia'] != 0 ? -1 * (float)$empleado['fa_gafet_cofia'] : 0) : 0;
                        $sueldo_a_cobrar = $empleado['sueldo_a_cobrar'] ?? 0;

                        // Limpiar nombre del empleado
                        $nombreLimpio = trim(str_replace(['|', '"', "'", "\n", "\r", "\t"], '', $empleado['nombre']));

                        // Acumular totales
                        $totales['sueldo_base'] += $sueldo_base;
                        $totales['incentivo'] += $incentivo;
                        $totales['sueldo_extra_final'] += $sueldo_extra;
                        $totales['neto_pagar'] += $tarjeta;
                        $totales['prestamo'] += $prestamo;
                        $totales['inasistencias_descuento'] += $inasistencias;
                        $totales['uniformes'] += $uniformes;
                        $totales['infonavit'] += $infonavit;
                        $totales['isr'] += $isr;
                        $totales['imss'] += $imss;
                        $totales['checador'] += $checador;
                        $totales['fa_gafet_cofia'] += $fa_gafet_cofia;
                        $totales['sueldo_a_cobrar'] += $sueldo_a_cobrar;

                        // Datos de la fila
                        $datosFilaEmpleado = [
                            $numero,
                            $nombreLimpio,
                            $puestoDepartamento,
                            $formatearNumero($sueldo_base),
                            $formatearNumero($incentivo),
                            $formatearNumero($sueldo_extra),
                            $formatearNumero($tarjeta, true),
                            $formatearNumero($prestamo, true),
                            $formatearNumero($inasistencias, true),
                            $formatearNumero($uniformes, true),
                            $formatearNumero($infonavit, true),
                            $formatearNumero($isr, true),
                            $formatearNumero($imss, true),
                            $formatearNumero($checador, true),
                            $formatearNumero($fa_gafet_cofia, true),
                            $formatearNumero($sueldo_a_cobrar),
                            '' // Firma
                        ];

                        // Dibujar fila del empleado
                        $x = $posicionXTabla; // Usar la misma posición X que los encabezados
                        $y = $pdf->GetY();

                        // Configurar fuente más pequeña para los datos
                        $pdf->SetFont('helvetica', '', 6);

                        // Asegurar que la posición Y sea consistente
                        if ($pdf->GetY() < $y) {
                            $pdf->SetY($y);
                        }

                        for ($i = 0; $i < count($datosFilaEmpleado); $i++) {
                            $pdf->SetXY($x, $y);

                            // Configurar color del texto para deducciones (rojo)
                            if ($i >= 6 && $i <= 14 && !empty($datosFilaEmpleado[$i])) {
                                $pdf->SetTextColor(255, 0, 0); // Rojo para deducciones
                            } else {
                                $pdf->SetTextColor(0, 0, 0); // Negro para el resto
                            }

                            // Alineación específica por columna
                            // Todos los valores numéricos centrados, nombres a la izquierda, el resto centrado
                            $align = 'C';
                            if ($i == 0) { // Columna # (centrado)
                                $align = 'C';
                            } elseif ($i == 1) { // Columna de nombre (izquierda)
                                $align = 'L';
                                // Ajustar tamaño de fuente para nombres largos
                                if (strlen($datosFilaEmpleado[$i]) > 30) {
                                    $pdf->SetFont('helvetica', '', 5);
                                }
                            } elseif ($i == 2) { // Columna PUESTO (centrado)
                                $align = 'C';
                            } elseif ($i >= 3 && $i <= 15) { // Columnas numéricas/monetarias (centrado)
                                $align = 'C';
                            } else { // Resto (centrado)
                                $align = 'C';
                            }

                            // Ajustar texto para que quepa en la celda
                            $texto = $datosFilaEmpleado[$i];
                            if ($i != 1) { // Solo ajustar para columnas que no son el nombre
                                $anchoMax = $anchos[$i] - 1; // Dejar 1mm de margen
                                $tamanoFuente = 6;
                                while ($pdf->GetStringWidth($texto) > $anchoMax && $tamanoFuente > 4) {
                                    $tamanoFuente--;
                                    $pdf->SetFont('helvetica', '', $tamanoFuente);
                                }
                            }

                            $pdf->Cell($anchos[$i], $alturaFila, $texto, 1, 0, $align, false);
                            $x += $anchos[$i];

                            // Restaurar fuente predeterminada para la siguiente celda
                            $pdf->SetFont('helvetica', '', 6);
                        }

                        $pdf->SetY($y + $alturaFila);
                        $pdf->SetTextColor(0, 0, 0); // Resetear color

                        $numero++;
                        $totalEmpleados++;
                    }
                }
            }
        }

        // Agregar al final los empleados del departamento SIN SEGURO
        foreach ($jsonGlobal['departamentos'] as $depto) {
            if (stripos($depto['nombre'], 'SIN SEGURO') !== false) {
                $puestoDepartamento = '40 LIBRAS';
                foreach ($depto['empleados'] as $empleado) {
                    $claveEmpleado = $empleado['clave'] ?? null;

                    if ($claveEmpleado) {
                        $espacioNecesario = $alturaFila + 2;
                        $espacioDisponible = $pdf->GetPageHeight() - $pdf->GetY() - 15;

                        if ($espacioDisponible < $espacioNecesario) {
                            $pdf->AddPage();

                            $pdf->SetFillColor(255, 251, 0); // Color amarillo
                            $pdf->SetTextColor(0, 0, 0);
                            $pdf->SetFont('helvetica', 'B', 6);

                            $x = $posicionXTabla;
                            $y = $pdf->GetY();

                            for ($i = 0; $i < count($encabezados); $i++) {
                                $pdf->SetXY($x, $y);

                                if ($i == 3) {
                                    $pdf->Cell($anchos[$i], $alturaFila / 2, 'SUELDO', 'LRT', 0, 'C', true);
                                    $pdf->SetXY($x, $y + ($alturaFila / 2));
                                    $pdf->Cell($anchos[$i], $alturaFila / 2, 'NETO', 'LRB', 0, 'C', true);
                                } elseif ($i == 15) {
                                    $pdf->Cell($anchos[$i], $alturaFila / 2, 'SUELDO A', 'LRT', 0, 'C', true);
                                    $pdf->SetXY($x, $y + ($alturaFila / 2));
                                    $pdf->Cell($anchos[$i], $alturaFila / 2, 'COBRAR', 'LRB', 0, 'C', true);
                                } elseif ($i == 14) {
                                    $pdf->Cell($anchos[$i], $alturaFila / 3, 'F.A/GAFET', 'LRT', 0, 'C', true);
                                    $pdf->SetXY($x, $y + ($alturaFila / 3));
                                    $pdf->Cell($anchos[$i], $alturaFila / 3, 'COFIA', 'LR', 0, 'C', true);
                                    $pdf->SetXY($x, $y + (2 * $alturaFila / 3));
                                    $pdf->Cell($anchos[$i], $alturaFila / 3, '', 'LRB', 0, 'C', true);
                                } elseif ($i == 16) {
                                    $pdf->Cell($anchos[$i], $alturaFila / 2, 'FIRMA', 'LRT', 0, 'C', true);
                                    $pdf->SetXY($x, $y + ($alturaFila / 2));
                                    $pdf->Cell($anchos[$i], $alturaFila / 2, 'RECIBIDO', 'LRB', 0, 'C', true);
                                } else {
                                    $pdf->Cell($anchos[$i], $alturaFila, $encabezados[$i], 1, 0, 'C', true);
                                }

                                $x += $anchos[$i];
                            }

                            $pdf->SetY($y + $alturaFila);

                            $pdf->SetFillColor(255, 255, 255);
                            $pdf->SetTextColor(0, 0, 0);
                            $pdf->SetFont('helvetica', '', 7);
                        }

                        $x = $posicionXTabla;
                        $sueldo_base = $empleado['sueldo_base'] ?? 0;
                        $incentivo = $empleado['incentivo'] ?? 0;
                        $sueldo_extra = $empleado['sueldo_extra_final'] ?? 0;
                        $tarjeta = isset($empleado['neto_pagar']) ? ($empleado['neto_pagar'] != 0 ? -1 * (float)$empleado['neto_pagar'] : 0) : 0;
                        $prestamo = isset($empleado['prestamo']) ? ($empleado['prestamo'] != 0 ? -1 * (float)$empleado['prestamo'] : 0) : 0;
                        $inasistencias = isset($empleado['inasistencias_descuento']) ? ($empleado['inasistencias_descuento'] != 0 ? -1 * (float)$empleado['inasistencias_descuento'] : 0) : 0;
                        $uniformes = isset($empleado['uniformes']) ? ($empleado['uniformes'] != 0 ? -1 * (float)$empleado['uniformes'] : 0) : 0;

                        $conceptos = $empleado['conceptos'] ?? [];
                        $getConcepto = function ($codigo) use ($conceptos) {
                            foreach ($conceptos as $c) {
                                if (isset($c['codigo']) && $c['codigo'] == $codigo) {
                                    return (float)($c['resultado'] ?? 0);
                                }
                            }
                            return 0;
                        };

                        $infonavit = $getConcepto('16');
                        $infonavit = $infonavit != 0 ? -1 * $infonavit : 0;
                        $isr = $getConcepto('45');
                        $isr = $isr != 0 ? -1 * $isr : 0;
                        $imss = $getConcepto('52');
                        $imss = $imss != 0 ? -1 * $imss : 0;

                        $checador = isset($empleado['checador']) ? ($empleado['checador'] != 0 ? -1 * (float)$empleado['checador'] : 0) : 0;
                        $fa_gafet_cofia = isset($empleado['fa_gafet_cofia']) ? ($empleado['fa_gafet_cofia'] != 0 ? -1 * (float)$empleado['fa_gafet_cofia'] : 0) : 0;
                        $sueldo_a_cobrar = $empleado['sueldo_a_cobrar'] ?? 0;

                        $nombreLimpio = trim(str_replace(['|', '"', "'", "\n", "\r", "\t"], '', $empleado['nombre']));

                        $totales['sueldo_base'] += $sueldo_base;
                        $totales['incentivo'] += $incentivo;
                        $totales['sueldo_extra_final'] += $sueldo_extra;
                        $totales['neto_pagar'] += $tarjeta;
                        $totales['prestamo'] += $prestamo;
                        $totales['inasistencias_descuento'] += $inasistencias;
                        $totales['uniformes'] += $uniformes;
                        $totales['infonavit'] += $infonavit;
                        $totales['isr'] += $isr;
                        $totales['imss'] += $imss;
                        $totales['checador'] += $checador;
                        $totales['fa_gafet_cofia'] += $fa_gafet_cofia;
                        $totales['sueldo_a_cobrar'] += $sueldo_a_cobrar;

                        $datosFilaEmpleado = [
                            $numero,
                            $nombreLimpio,
                            $puestoDepartamento,
                            $formatearNumero($sueldo_base),
                            $formatearNumero($incentivo),
                            $formatearNumero($sueldo_extra),
                            $formatearNumero($tarjeta, true),
                            $formatearNumero($prestamo, true),
                            $formatearNumero($inasistencias, true),
                            $formatearNumero($uniformes, true),
                            $formatearNumero($infonavit, true),
                            $formatearNumero($isr, true),
                            $formatearNumero($imss, true),
                            $formatearNumero($checador, true),
                            $formatearNumero($fa_gafet_cofia, true),
                            $formatearNumero($sueldo_a_cobrar),
                            ''
                        ];

                        $x = $posicionXTabla;
                        $y = $pdf->GetY();
                        $pdf->SetFont('helvetica', '', 6);

                        if ($pdf->GetY() < $y) {
                            $pdf->SetY($y);
                        }

                        for ($i = 0; $i < count($datosFilaEmpleado); $i++) {
                            $pdf->SetXY($x, $y);

                            if ($i >= 6 && $i <= 14 && !empty($datosFilaEmpleado[$i])) {
                                $pdf->SetTextColor(255, 0, 0);
                            } else {
                                $pdf->SetTextColor(0, 0, 0);
                            }

                            $align = 'C';
                            if ($i == 1) {
                                $align = 'L';
                                if (strlen($datosFilaEmpleado[$i]) > 30) {
                                    $pdf->SetFont('helvetica', '', 5);
                                }
                            }

                            $texto = $datosFilaEmpleado[$i];
                            if ($i != 1) {
                                $anchoMax = $anchos[$i] - 1;
                                $tamanoFuente = 6;
                                while ($pdf->GetStringWidth($texto) > $anchoMax && $tamanoFuente > 4) {
                                    $tamanoFuente--;
                                    $pdf->SetFont('helvetica', '', $tamanoFuente);
                                }
                            }

                            $pdf->Cell($anchos[$i], $alturaFila, $texto, 1, 0, $align, false);
                            $x += $anchos[$i];
                            $pdf->SetFont('helvetica', '', 6);
                        }

                        $pdf->SetY($y + $alturaFila);
                        $pdf->SetTextColor(0, 0, 0);

                        $numero++;
                        $totalEmpleados++;
                    }
                }
            }
        }
    }

    // Fila de totales
    if ($totalEmpleados > 0) {
        // Configurar estilo para totales
        $pdf->SetFillColor(217, 234, 211); // Color verde claro #D9EAD3
        $pdf->SetTextColor(0, 0, 0);
        $pdf->SetFont('helvetica', 'B', 6);

        $datosFilaTotales = [
            '',
            'TOTAL',
            '',
            $formatearNumero($totales['sueldo_base']),
            $formatearNumero($totales['incentivo']),
            $formatearNumero($totales['sueldo_extra_final']),
            $formatearNumero($totales['neto_pagar'], true),
            $formatearNumero($totales['prestamo'], true),
            $formatearNumero($totales['inasistencias_descuento'], true),
            $formatearNumero($totales['uniformes'], true),
            $formatearNumero($totales['infonavit'], true),
            $formatearNumero($totales['isr'], true),
            $formatearNumero($totales['imss'], true),
            $formatearNumero($totales['checador'], true),
            $formatearNumero($totales['fa_gafet_cofia'], true),
            $formatearNumero($totales['sueldo_a_cobrar']),
            ''
        ];

        // Dibujar fila de totales
        // Excluir la última columna (FIRMA RECIBIDO - índice 16) de la fila de totales
        $x = $posicionXTabla; // Usar la misma posición X que el resto de la tabla
        $y = $pdf->GetY();

        // Dibujar solo hasta la columna "SUELDO A COBRAR" (índice 15), excluyendo "FIRMA RECIBIDO" (índice 16)
        for ($i = 0; $i < count($datosFilaTotales) - 1; $i++) {
            $pdf->SetXY($x, $y);

            // Configurar color del texto para deducciones (rojo)
            if ($i >= 6 && $i <= 14 && !empty($datosFilaTotales[$i])) {
                $pdf->SetTextColor(255, 0, 0);
            } else {
                $pdf->SetTextColor(0, 0, 0);
            }

            // Usar la misma lógica de alineación que las filas de empleados
            // Todos los valores numéricos centrados, nombres a la izquierda, el resto centrado
            $align = 'C';
            if ($i == 0) { // Columna # (centrado)
                $align = 'C';
            } elseif ($i == 1) { // Columna de nombre (izquierda)
                $align = 'L';
            } elseif ($i == 2) { // Columna PUESTO (centrado)
                $align = 'C';
            } elseif ($i >= 3 && $i <= 15) { // Columnas numéricas/monetarias (centrado)
                $align = 'C';
            } else { // Resto (centrado)
                $align = 'C';
            }
            
            // Usar exactamente los mismos anchos de columna que el resto de la tabla
            // Esto asegura que la alineación sea perfecta
            $ancho = $anchos[$i];
            
            // No ajustar el ancho de ninguna columna en la fila de totales
            // Si hay algún problema, significa que el ancho total de la tabla está mal calculado
            // Pero no queremos ajustar aquí para mantener la consistencia visual
            
            $pdf->Cell($ancho, $alturaFila, $datosFilaTotales[$i], 1, 0, $align, true);

            $x += $ancho;
        }
    }

    // Establecer el nombre del archivo
    $nombreArchivo = $tituloExcel . '.pdf';

    // Limpiar buffer de salida
    if (ob_get_contents()) ob_end_clean();

    // Generar y enviar el PDF
    $pdf->Output($nombreArchivo, 'I');
} catch (Exception $e) {
    enviarError('Error al generar el PDF: ' . $e->getMessage());
}
