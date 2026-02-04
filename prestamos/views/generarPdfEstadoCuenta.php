<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . "/../../conexion/conexion.php";
require_once __DIR__ . '/../../vendor/autoload.php';

if (!isset($_SESSION["logged_in"])) {
    http_response_code(401);
    echo 'No autenticado';
    exit;
}

$id_empleado = isset($_GET['id_empleado']) ? (int)$_GET['id_empleado'] : 0;
if ($id_empleado <= 0) {
    http_response_code(400);
    echo 'Falta id_empleado';
    exit;
}

function formatoMonedaPdf($monto): string
{
    return '$' . number_format((float)$monto, 2, '.', ',');
}

function formatearFechaPdf($fecha, bool $conHora = false): string
{
    if (!$fecha) return '';
    try {
        $dt = new DateTime((string)$fecha);
        return $dt->format($conHora ? 'd/m/Y H:i' : 'd/m/Y');
    } catch (Exception $e) {
        return (string)$fecha;
    }
}

function obtenerEmpresaPorId($conexion, ?int $id_empresa): array
{
    if ($id_empresa) {
        $stmt = $conexion->prepare("SELECT id_empresa, nombre_empresa, logo_empresa, domicilio_fiscal FROM empresa WHERE id_empresa = ? LIMIT 1");
        $stmt->bind_param('i', $id_empresa);
        $stmt->execute();
        $res = $stmt->get_result();
        $data = $res->fetch_assoc() ?? [];
        $stmt->close();
        if ($data) return $data;
    }

    $res = $conexion->query("SELECT id_empresa, nombre_empresa, logo_empresa, domicilio_fiscal FROM empresa ORDER BY id_empresa ASC LIMIT 1");
    return $res ? ($res->fetch_assoc() ?? []) : [];
}

function obtenerEmpleadoResumen($conexion, int $id_empleado): array
{
    $sql = "
        SELECT
            e.id_empleado,
            e.id_empresa,
            e.clave_empleado,
            CONCAT(e.nombre, ' ', e.ap_paterno, ' ', e.ap_materno) AS empleado,
            e.imss,
            e.curp,
            d.nombre_departamento,
            pe.nombre_puesto,
            IFNULL((SELECT SUM(p.monto) FROM prestamos p WHERE p.id_empleado = e.id_empleado), 0) AS total_prestamos,
            IFNULL((SELECT SUM(p1.monto) FROM prestamos p1 WHERE p1.id_empleado = e.id_empleado AND p1.estado IN ('activo','pausado')), 0) AS total_activos,
            IFNULL((
                SELECT SUM(pa2.monto_pago)
                FROM prestamos_abonos pa2
                INNER JOIN prestamos p2 ON p2.id_prestamo = pa2.id_prestamo
                WHERE p2.id_empleado = e.id_empleado AND p2.estado IN ('activo','pausado')
            ), 0) AS total_pagado_activos
        FROM info_empleados e
        LEFT JOIN departamentos d ON d.id_departamento = e.id_departamento
        LEFT JOIN puestos_especiales pe ON pe.id_puestoEspecial = e.id_puestoEspecial
        WHERE e.id_empleado = ?
        LIMIT 1
    ";

    $stmt = $conexion->prepare($sql);
    $stmt->bind_param('i', $id_empleado);
    $stmt->execute();
    $res = $stmt->get_result();
    $data = $res->fetch_assoc() ?? [];
    $stmt->close();
    return $data;
}

function obtenerPrestamosConSaldos($conexion, int $id_empleado, array $estados): array
{
    $placeholders = implode(',', array_fill(0, count($estados), '?'));
    $types = 'i' . str_repeat('s', count($estados));
    $sql = "
        SELECT
            p.id_prestamo,
            p.folio,
            p.monto,
            p.fecha_registro,
            p.estado,
            IFNULL((SELECT SUM(pa.monto_pago) FROM prestamos_abonos pa WHERE pa.id_prestamo = p.id_prestamo), 0) AS abonado
        FROM prestamos p
        WHERE p.id_empleado = ? AND p.estado IN ($placeholders)
        ORDER BY p.fecha_registro DESC, p.id_prestamo DESC
    ";

    $stmt = $conexion->prepare($sql);
    $params = array_merge([$id_empleado], $estados);
    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $res = $stmt->get_result();
    $out = [];
    while ($r = $res->fetch_assoc()) {
        $monto = (float)($r['monto'] ?? 0);
        $abonado = (float)($r['abonado'] ?? 0);
        $r['saldo'] = $monto - $abonado;
        $out[] = $r;
    }
    $stmt->close();
    return $out;
}

function obtenerAbonosPorEstadoPrestamo($conexion, int $id_empleado, array $estados): array
{
    $placeholders = implode(',', array_fill(0, count($estados), '?'));
    $types = 'i' . str_repeat('s', count($estados));
    $sql = "
        SELECT
            pa.monto_pago,
            pa.num_sem_pago,
            pa.anio_pago,
            pa.fecha_pago,
            p.folio,
            p.estado
        FROM prestamos_abonos pa
        INNER JOIN prestamos p ON p.id_prestamo = pa.id_prestamo
        WHERE p.id_empleado = ? AND p.estado IN ($placeholders)
        ORDER BY pa.fecha_pago DESC, pa.id_abono DESC
    ";
    $stmt = $conexion->prepare($sql);
    $params = array_merge([$id_empleado], $estados);
    $stmt->bind_param($types, ...$params);
    $stmt->execute();
    $res = $stmt->get_result();
    $out = [];
    while ($r = $res->fetch_assoc()) {
        $out[] = $r;
    }
    $stmt->close();
    return $out;
}

class PDFEstadoCuenta extends TCPDF
{
    public array $empresa = [];
    public string $titulo = 'Estado de cuenta';

    public function Header()
    {
        $logoPath = '';
        $nombreEmpresa = $this->empresa['nombre_empresa'] ?? 'Empresa';
        $domicilio = $this->empresa['domicilio_fiscal'] ?? '';

        $logo = $this->empresa['logo_empresa'] ?? '';
        if (is_string($logo) && $logo !== '') {
            $cand = $logo;
            if (!preg_match('/^[A-Za-z]:\\\\/i', $cand) && strpos($cand, __DIR__) === false) {
                $cand = __DIR__ . '/../../' . ltrim($cand, '/');
            }
            if (file_exists($cand)) {
                $logoPath = $cand;
            }
        }
        if ($logoPath === '') {
            $fallback = __DIR__ . '/../../public/img/logo.jpg';
            if (file_exists($fallback)) {
                $logoPath = $fallback;
            }
        }

        if ($logoPath !== '') {
            $this->Image($logoPath, 10, 8, 20, 0, '', '', 'T', false, 300);
        }

        $this->SetFont('helvetica', 'B', 14);
        $this->SetY(10);
        $this->Cell(0, 6, (string)$nombreEmpresa, 0, 1, 'C');

        $this->SetFont('dejavusans', '', 9);
        if ($domicilio !== '') {
            $this->Cell(0, 5, (string)$domicilio, 0, 1, 'C');
        }

        $this->SetFont('helvetica', 'B', 13);
        $this->Cell(0, 7, $this->titulo, 0, 1, 'C');

        $this->SetFont('dejavusans', '', 8);
        $this->Cell(0, 5, 'Generado el: ' . date('d/m/Y H:i:s'), 0, 1, 'R');

        $this->Line(10, 38, $this->getPageWidth() - 10, 38);
        $this->SetY(41);
    }

    public function Footer()
    {
        $this->SetY(-12);
        $this->SetFont('dejavusans', 'I', 8);
        $this->Cell(0, 8, 'Página ' . $this->getAliasNumPage() . ' de ' . $this->getAliasNbPages(), 0, 0, 'R');
    }
}

try {
    $empleado = obtenerEmpleadoResumen($conexion, $id_empleado);
    if (!$empleado) {
        http_response_code(404);
        echo 'Empleado no encontrado';
        exit;
    }

    $empresa = obtenerEmpresaPorId($conexion, isset($empleado['id_empresa']) ? (int)$empleado['id_empresa'] : null);

    $prestamosActivos = obtenerPrestamosConSaldos($conexion, $id_empleado, ['activo', 'pausado']);
    $abonosActivos = obtenerAbonosPorEstadoPrestamo($conexion, $id_empleado, ['activo', 'pausado']);
    $prestamosLiquidados = obtenerPrestamosConSaldos($conexion, $id_empleado, ['liquidado']);
    $abonosLiquidados = obtenerAbonosPorEstadoPrestamo($conexion, $id_empleado, ['liquidado']);

    $totalPrestamos = (float)($empleado['total_prestamos'] ?? 0);
    $totalActivos = (float)($empleado['total_activos'] ?? 0);
    $totalPagadoActivos = (float)($empleado['total_pagado_activos'] ?? 0);
    $saldoActual = $totalActivos - $totalPagadoActivos;

    $pdf = new PDFEstadoCuenta('P', 'mm', 'A4', true, 'UTF-8', false);
    $pdf->empresa = $empresa;
    $pdf->titulo = 'ESTADO DE CUENTA (PRÉSTAMOS)';

    $pdf->SetCreator('Sistema SAAO');
    $pdf->SetAuthor('Sistema SAAO');
    $pdf->SetTitle('Estado de cuenta - Préstamos');

    $pdf->SetMargins(10, 45, 10);
    $pdf->SetHeaderMargin(10);
    $pdf->SetFooterMargin(10);
    $pdf->SetAutoPageBreak(true, 15);

    $pdf->AddPage();
    $pdf->SetFont('dejavusans', '', 9);

    $html = '';

    $html .= '<style>
        table { font-size: 8pt; }
        th, td { font-size: 8pt; }
        h3 { font-size: 11pt; }
    </style>';

    $html .= '<h3 style="margin:0 0 6px 0;">1) Información del empleado</h3>';
    $html .= '<table border="1" cellpadding="4">
        <tr>
            <td width="18%"><b>Empleado</b></td>
            <td width="32%">' . htmlspecialchars((string)($empleado['empleado'] ?? ''), ENT_QUOTES, 'UTF-8') . '</td>
            <td width="18%"><b>Clave</b></td>
            <td width="32%">' . htmlspecialchars((string)($empleado['clave_empleado'] ?? ''), ENT_QUOTES, 'UTF-8') . '</td>
        </tr>
        <tr>
            <td><b>NSS</b></td>
            <td>' . htmlspecialchars((string)($empleado['imss'] ?? ''), ENT_QUOTES, 'UTF-8') . '</td>
            <td><b>CURP</b></td>
            <td>' . htmlspecialchars((string)($empleado['curp'] ?? ''), ENT_QUOTES, 'UTF-8') . '</td>
        </tr>
        <tr>
            <td><b>Departamento</b></td>
            <td>' . htmlspecialchars((string)($empleado['nombre_departamento'] ?? ''), ENT_QUOTES, 'UTF-8') . '</td>
            <td><b>Puesto</b></td>
            <td>' . htmlspecialchars((string)($empleado['nombre_puesto'] ?? ''), ENT_QUOTES, 'UTF-8') . '</td>
        </tr>
    </table>';

    $html .= '<br><table border="1" cellpadding="4">
        <tr>
            <td width="50%"><b>Total histórico prestado al empleado</b></td>
            <td width="50%" align="right">' . formatoMonedaPdf($totalPrestamos) . '</td>
        </tr>
        <tr>
            <td><b>Saldo actual (préstamos activos/pausados)</b></td>
            <td align="right">' . formatoMonedaPdf($saldoActual) . '</td>
        </tr>
    </table>';

    $html .= '<br><h3 style="margin:0 0 6px 0;">2) Préstamos activos</h3>';
    $html .= '<table border="1" cellpadding="4">
        <tr style="background-color:#E8F5E9;" align="center">
            <th width="15%">Folio</th>
            <th width="18%">Monto entregado</th>
            <th width="17%">Fecha de entrega</th>
            <th width="14%">Estado</th>
            <th width="18%">Abonos realizados</th>
            <th width="18%">Saldo pendiente</th>
        </tr>';

    if (count($prestamosActivos) === 0) {
        $html .= '<tr><td colspan="6" align="center">Sin préstamos activos</td></tr>';
    } else {
        $totalMontoActivos = 0;
        $totalAbonadoActivos = 0;
        $totalSaldoActivos = 0;
        
        foreach ($prestamosActivos as $p) {
            $monto = (float)($p['monto'] ?? 0);
            $abonado = (float)($p['abonado'] ?? 0);
            $saldo = (float)($p['saldo'] ?? 0);
            
            $totalMontoActivos += $monto;
            $totalAbonadoActivos += $abonado;
            $totalSaldoActivos += $saldo;
            
            $html .= '<tr>';
            $html .= '<td align="center">' . htmlspecialchars((string)($p['folio'] ?? ''), ENT_QUOTES, 'UTF-8') . '</td>';
            $html .= '<td align="right">' . formatoMonedaPdf($monto) . '</td>';
            $html .= '<td align="center">' . formatearFechaPdf($p['fecha_registro'] ?? '', true) . '</td>';
            $html .= '<td align="center">' . htmlspecialchars((string)($p['estado'] ?? ''), ENT_QUOTES, 'UTF-8') . '</td>';
            $html .= '<td align="right">' . formatoMonedaPdf($abonado) . '</td>';
            $html .= '<td align="right">' . formatoMonedaPdf($saldo) . '</td>';
            $html .= '</tr>';
        }
        
        $html .= '<tr style="background-color:#C8E6C9;font-weight:bold;">';
        $html .= '<td>TOTALES</td>';
        $html .= '<td align="right">' . formatoMonedaPdf($totalMontoActivos) . '</td>';
        $html .= '<td colspan="2"></td>';
        $html .= '<td align="right">' . formatoMonedaPdf($totalAbonadoActivos) . '</td>';
        $html .= '<td align="right">' . formatoMonedaPdf($totalSaldoActivos) . '</td>';
        $html .= '</tr>';
    }
    $html .= '</table>';

    $html .= '<br><h3 style="margin:0 0 6px 0;">3) Abonos de préstamos activos</h3>';
    $html .= '<table border="1" cellpadding="4">
        <tr style="background-color:#FFF3E0;" align="center" align="center">
            <th width="22%">Monto pagado</th>
            <th width="18%">Semana/Año</th>
            <th width="30%">Fecha de pago</th>
            <th width="30%">Folio del préstamo</th>
        </tr>';
    if (count($abonosActivos) === 0) {
        $html .= '<tr><td colspan="4" align="center">Sin abonos para préstamos activos</td></tr>';
    } else {
        $totalAbonosActivos = 0;
        
        foreach ($abonosActivos as $a) {
            $montoPago = (float)($a['monto_pago'] ?? 0);
            $totalAbonosActivos += $montoPago;
            
            $html .= '<tr>';
            $html .= '<td align="right">' . formatoMonedaPdf($montoPago) . '</td>';
            $html .= '<td align="center">' . (int)($a['num_sem_pago'] ?? 0) . '/' . (int)($a['anio_pago'] ?? 0) . '</td>';
            $html .= '<td align="center">' . formatearFechaPdf($a['fecha_pago'] ?? '', true) . '</td>';
            $html .= '<td align="center">' . htmlspecialchars((string)($a['folio'] ?? ''), ENT_QUOTES, 'UTF-8') . '</td>';
            $html .= '</tr>';
        }
        
        $html .= '<tr style="background-color:#FFE0B2;font-weight:bold;">';
        $html .= '<td align="right">' . formatoMonedaPdf($totalAbonosActivos) . '</td>';
        $html .= '<td colspan="3">TOTAL ABONADO</td>';
        $html .= '</tr>';
    }
    $html .= '</table>';

    $html .= '<br><h3 style="margin:0 0 6px 0;">4) Préstamos liquidados</h3>';
    $html .= '<table border="1" cellpadding="4">
        <tr style="background-color:#E3F2FD;" align="center">
            <th width="15%">Folio</th>
            <th width="18%">Monto entregado</th>
            <th width="17%">Fecha de entrega</th>
            <th width="14%">Estado</th>
            <th width="18%">Abonos realizados</th>
            <th width="18%">Saldo pendiente</th>
        </tr>';

    if (count($prestamosLiquidados) === 0) {
        $html .= '<tr><td colspan="6" align="center">Sin préstamos liquidados</td></tr>';
    } else {
        $totalMontoLiquidados = 0;
        $totalAbonadoLiquidados = 0;
        $totalSaldoLiquidados = 0;
        
        foreach ($prestamosLiquidados as $p) {
            $monto = (float)($p['monto'] ?? 0);
            $abonado = (float)($p['abonado'] ?? 0);
            $saldo = (float)($p['saldo'] ?? 0);
            
            $totalMontoLiquidados += $monto;
            $totalAbonadoLiquidados += $abonado;
            $totalSaldoLiquidados += $saldo;
            
            $html .= '<tr>';
            $html .= '<td align="center">' . htmlspecialchars((string)($p['folio'] ?? ''), ENT_QUOTES, 'UTF-8') . '</td>';
            $html .= '<td align="right">' . formatoMonedaPdf($monto) . '</td>';
            $html .= '<td align="center">' . formatearFechaPdf($p['fecha_registro'] ?? '', true) . '</td>';
            $html .= '<td align="center">' . htmlspecialchars((string)($p['estado'] ?? ''), ENT_QUOTES, 'UTF-8') . '</td>';
            $html .= '<td align="right">' . formatoMonedaPdf($abonado) . '</td>';
            $html .= '<td align="right">' . formatoMonedaPdf($saldo) . '</td>';
            $html .= '</tr>';
        }
        
        $html .= '<tr style="background-color:#BBDEFB;font-weight:bold;">';
        $html .= '<td>TOTALES</td>';
        $html .= '<td align="right">' . formatoMonedaPdf($totalMontoLiquidados) . '</td>';
        $html .= '<td colspan="2"></td>';
        $html .= '<td align="right">' . formatoMonedaPdf($totalAbonadoLiquidados) . '</td>';
        $html .= '<td align="right">' . formatoMonedaPdf($totalSaldoLiquidados) . '</td>';
        $html .= '</tr>';
    }
    $html .= '</table>';

    $html .= '<br><h3 style="margin:0 0 6px 0;">5) Abonos de préstamos liquidados</h3>';
    $html .= '<table border="1" cellpadding="4">
        <tr style="background-color:#F3E5F5;" align="center">
            <th width="22%">Monto pagado</th>
            <th width="18%">Semana/Año</th>
            <th width="30%">Fecha de pago</th>
            <th width="30%">Folio del préstamo</th>
        </tr>';
    if (count($abonosLiquidados) === 0) {
        $html .= '<tr><td colspan="4" align="center">Sin abonos para préstamos liquidados</td></tr>';
    } else {
        $totalAbonosLiquidados = 0;
        
        foreach ($abonosLiquidados as $a) {
            $montoPago = (float)($a['monto_pago'] ?? 0);
            $totalAbonosLiquidados += $montoPago;
            
            $html .= '<tr>';
            $html .= '<td align="right">' . formatoMonedaPdf($montoPago) . '</td>';
            $html .= '<td align="center">' . (int)($a['num_sem_pago'] ?? 0) . '/' . (int)($a['anio_pago'] ?? 0) . '</td>';
            $html .= '<td align="center">' . formatearFechaPdf($a['fecha_pago'] ?? '', true) . '</td>';
            $html .= '<td align="center">' . htmlspecialchars((string)($a['folio'] ?? ''), ENT_QUOTES, 'UTF-8') . '</td>';
            $html .= '</tr>';
        }
        
        $html .= '<tr style="background-color:#E1BEE7;font-weight:bold;">';
        $html .= '<td align="right">' . formatoMonedaPdf($totalAbonosLiquidados) . '</td>';
        $html .= '<td colspan="3">TOTAL ABONADO</td>';
        $html .= '</tr>';
    }
    $html .= '</table>';

    $pdf->writeHTML($html, true, false, true, false, '');

    $nombre = 'ESTADO CUENTA - ' . htmlspecialchars((string)($empleado['empleado'] ?? ''), ENT_QUOTES, 'UTF-8') . ' - ' . date('d-m-Y') . '.pdf';
    $pdf->Output($nombre, 'I');

} catch (Exception $e) {
    http_response_code(500);
    echo 'Error al generar PDF: ' . $e->getMessage();
    exit;
}
