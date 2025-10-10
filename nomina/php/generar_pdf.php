<?php
// Controlar errores y enviarlos como JSON
function enviarError($mensaje) {
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

    // Requerir mPDF
    require_once __DIR__ . '/../../vendor/autoload.php';
    
    // Configuración de mPDF
    $config = [
    'mode' => 'utf-8',
    'format' => 'A4-L',
    'margin_left' => 15,
    'margin_right' => 15,
    'margin_top' => 10, // espacio para el header
    'margin_bottom' => 15,
    'margin_header' => 15,
    'margin_footer' => 15,
    'orientation' => 'L'
    ];
    
    // Iniciar mPDF con la configuración
    $mpdf = new \Mpdf\Mpdf($config);
    
    // Ruta absoluta al logo
    $logoPath = __DIR__ . '/../../public/img/logo.jpg';
    
    // Verificar si el logo existe
    if (!file_exists($logoPath)) {
        enviarError("El logo no se encuentra en la ruta: {$logoPath}");
    }
    
    // Construir el HTML con el encabezado y títulos
    $html = '
    <html>
    <head>
        <style>
            body {
                font-family: Arial, sans-serif;
                padding: 0;
                margin: 0;
            }
            .container {
                width: 100%;
                margin-bottom: 8px;
            }
            .logo-container {
                float: left;
                width: 80px;
                margin-right: 10px;
            }
            .logo {
                width: 80px;
                height: auto;
            }
            .content-container {
                overflow: hidden;
                text-align: center;
            }
            .title-container {
                text-align: center;
                margin-bottom: 5px;
            }
            h1 {
                font-size: 8pt;
                color: #008000;
                margin: 0px 0px 10px 0px; /* top=10, right=20, bottom=30, left=40 */

            }
            h2 {
                font-size: 6pt;
                color: #008000;
                margin: 2px 0;
            }
            h3 {
                font-size: 7.5pt;
                margin: 2px 0;
            }
            .date-container {
                text-align: center;
                margin-bottom: 2px;
            }
            .semana-container {
                text-align: right;
                display: inline-block;
                padding: 0 10px;
            }


            table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 5px;
            }
            th {
                background-color: #428F49;
                color: white;
                font-weight: bold;
                text-align: center;
                padding: 4px;
                border: 1px solid #000;
                font-size: 5pt;
            }
            td {
                border: 1px solid #000;
                padding: 3px;
                text-align: center;
                height: 30px;
                font-size: 6.9pt;
            }
            .nombre {
                text-align: left;
            }
            .totales {
                background-color: #D9EAD3;
                font-weight: bold;
            }
            .deduccion {
                color: #FF0000;
            }
            .moneda {
                text-align: center;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <!-- Logo a la izquierda -->
            <div class="logo-container">
                <img src="' . $logoPath . '" class="logo">
            </div>
            
            <!-- Contenido central (títulos) -->
            <div class="content-container">
                <div class="title-container">
                    <h1>PRODUCCION 40 LIBRAS</h1>
                    <h2>CITRICOS SAAO S.A DE C.V</h2>
                </div>
                
                <!-- Fecha -->
                <div class="date-container">
                    <h3>' . $tituloNomina . '</h3>
                </div>
                
                <!-- Semana centrada con fondo gris -->
                <div class="semana-container">
                    <h3>' . $tituloExcel . '</h3>
                </div>
            </div>
            
            <div style="clear: both;"></div>
        </div>
        
        <!-- Tabla de nómina -->
        <table>
            <thead>
                <tr>
                    <th style="width: 3%">#</th>
                    <th style="width: 20%">NOMBRE</th>
                    <th style="width: 8%">PUESTO</th>
                    <th style="width: 6%">SUELDO<br>NETO</th>
                    <th style="width: 6%">INCENTIVO</th>
                    <th style="width: 6%">EXTRA</th>
                    <th style="width: 6%">TARJETA</th>
                    <th style="width: 6%">PRÉSTAMO</th>
                    <th style="width: 7%">INASISTENCIAS</th>
                    <th style="width: 6%">UNIFORMES</th>
                    <th style="width: 6%">INFONAVIT</th>
                    <th style="width: 6%">ISR</th>
                    <th style="width: 6%">IMSS</th>
                    <th style="width: 6%">CHECADOR</th>
                    <th style="width: 6%">F.A /<br>GAFET/<br>COFIA</th>
                    <th style="width: 6%">SUELDO<br>A<br>COBRAR</th>
                    <th style="width: 8%">FIRMA<br>RECIBIDO</th>
                </tr>
            </thead>
            <tbody>';
            
            // Datos dinámicos - empleados
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
            
            if (isset($jsonGlobal['departamentos'])) {
                foreach ($jsonGlobal['departamentos'] as $depto) {
                    if (stripos($depto['nombre'], 'PRODUCCION 40 LIBRAS') !== false) {
                        foreach ($depto['empleados'] as $empleado) {
                            // Obtener la clave directamente
                            $claveEmpleado = $empleado['clave'] ?? null;
                            
                            // Validar que existe en BD (simulado para PDF)
                            if ($claveEmpleado) {
                                // Calcular los valores
                                $sueldo_base = $empleado['sueldo_base'] ?? 0;
                                $incentivo = $empleado['incentivo'] ?? 0;
                                $sueldo_extra = $empleado['sueldo_extra_final'] ?? 0;
                                $tarjeta = isset($empleado['neto_pagar']) ? ($empleado['neto_pagar'] != 0 ? -1 * (float)$empleado['neto_pagar'] : 0) : 0;
                                $prestamo = isset($empleado['prestamo']) ? ($empleado['prestamo'] != 0 ? -1 * (float)$empleado['prestamo'] : 0) : 0;
                                $inasistencias = isset($empleado['inasistencias_descuento']) ? ($empleado['inasistencias_descuento'] != 0 ? -1 * (float)$empleado['inasistencias_descuento'] : 0) : 0;
                                $uniformes = isset($empleado['uniformes']) ? ($empleado['uniformes'] != 0 ? -1 * (float)$empleado['uniformes'] : 0) : 0;
                                
                                // Conceptos
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
                                
                                // Formatear para mostrar
                                $formatearNumero = function($numero, $esDeduccion = false) {
                                    if ($numero == 0) return '';
                                    $formateado = number_format(abs($numero), 2, '.', ',');
                                    if ($esDeduccion) {
                                        return '-$ ' . $formateado;
                                    } else {
                                        return '$ ' . $formateado;
                                    }
                                };
                                
                                $nombreLimpio = trim(str_replace(['|', '"', "'", "\n", "\r", "\t"], '', $empleado['nombre']));
                                
                                $html .= '
                                <tr>
                                    <td>' . $numero . '</td>
                                    <td class="nombre">' . $nombreLimpio . '</td>
                                    <td>40 LIBRAS</td>
                                    <td class="moneda">' . $formatearNumero($sueldo_base) . '</td>
                                    <td class="moneda">' . $formatearNumero($incentivo) . '</td>
                                    <td class="moneda">' . $formatearNumero($sueldo_extra) . '</td>
                                    <td class="moneda deduccion">' . $formatearNumero($tarjeta, true) . '</td>
                                    <td class="moneda deduccion">' . $formatearNumero($prestamo, true) . '</td>
                                    <td class="moneda deduccion">' . $formatearNumero($inasistencias, true) . '</td>
                                    <td class="moneda deduccion">' . $formatearNumero($uniformes, true) . '</td>
                                    <td class="moneda deduccion">' . $formatearNumero($infonavit, true) . '</td>
                                    <td class="moneda deduccion">' . $formatearNumero($isr, true) . '</td>
                                    <td class="moneda deduccion">' . $formatearNumero($imss, true) . '</td>
                                    <td class="moneda deduccion">' . $formatearNumero($checador, true) . '</td>
                                    <td class="moneda deduccion">' . $formatearNumero($fa_gafet_cofia, true) . '</td>
                                    <td class="moneda">' . $formatearNumero($sueldo_a_cobrar) . '</td>
                                    <td></td>
                                </tr>';
                                
                                $numero++;
                                $totalEmpleados++;
                            }
                        }
                    }
                }
            }
            
            // Fila de totales
            if ($totalEmpleados > 0) {
                $html .= '
                <tr class="totales">
                    <td></td>
                    <td class="nombre">TOTAL</td>
                    <td></td>
                    <td class="moneda">' . $formatearNumero($totales['sueldo_base']) . '</td>
                    <td class="moneda">' . $formatearNumero($totales['incentivo']) . '</td>
                    <td class="moneda">' . $formatearNumero($totales['sueldo_extra_final']) . '</td>
                    <td class="moneda deduccion">' . $formatearNumero($totales['neto_pagar'], true) . '</td>
                    <td class="moneda deduccion">' . $formatearNumero($totales['prestamo'], true) . '</td>
                    <td class="moneda deduccion">' . $formatearNumero($totales['inasistencias_descuento'], true) . '</td>
                    <td class="moneda deduccion">' . $formatearNumero($totales['uniformes'], true) . '</td>
                    <td class="moneda deduccion">' . $formatearNumero($totales['infonavit'], true) . '</td>
                    <td class="moneda deduccion">' . $formatearNumero($totales['isr'], true) . '</td>
                    <td class="moneda deduccion">' . $formatearNumero($totales['imss'], true) . '</td>
                    <td class="moneda deduccion">' . $formatearNumero($totales['checador'], true) . '</td>
                    <td class="moneda deduccion">' . $formatearNumero($totales['fa_gafet_cofia'], true) . '</td>
                    <td class="moneda">' . $formatearNumero($totales['sueldo_a_cobrar']) . '</td>
                    <td></td>
                </tr>';
            }
            
            $html .= '
            </tbody>
        </table>
    </body>
    </html>
    ';
    
    // Escribir el HTML al PDF
    $mpdf->WriteHTML($html);
    
    // Establecer el nombre del archivo
    $nombreArchivo = $tituloExcel . '.pdf';
    
    // Enviar el PDF al navegador
    header('Content-Type: application/pdf');
    header('Content-Disposition: attachment; filename="' . $nombreArchivo . '"');
    header('Cache-Control: max-age=0');
    
    // Salida del PDF
    $mpdf->Output($nombreArchivo, \Mpdf\Output\Destination::STRING_RETURN);
    
    // Verificar si hay errores de buffer y limpiarlo
    if (ob_get_contents()) ob_end_clean();
    
    echo $mpdf->Output($nombreArchivo, \Mpdf\Output\Destination::STRING_RETURN);
    
} catch (Exception $e) {
    enviarError('Error al generar el PDF: ' . $e->getMessage());
}
