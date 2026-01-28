<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . "/../../conexion/conexion.php";
require_once __DIR__ . '/../../vendor/autoload.php';

if (!isset($_SESSION["logged_in"])) {
    http_response_code(401);
    echo 'No autenticado';
    exit;
}

$id_plan = isset($_GET['id_plan']) ? (int)$_GET['id_plan'] : 0;
if ($id_plan <= 0) {
    http_response_code(400);
    echo 'Falta id_plan';
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

function obtenerPlanCompleto($conexion, int $id_plan): array
{
    $sql = "
        SELECT
            pp.id_plan,
            pp.id_prestamo,
            pp.sem_inicio,
            pp.anio_inicio,
            pp.sem_fin,
            pp.anio_fin,
            pp.fecha_registro AS plan_fecha_registro,
            p.folio,
            p.monto,
            p.semana AS prestamo_semana,
            p.anio AS prestamo_anio,
            p.fecha_registro AS prestamo_fecha_registro,
            p.estado,
            p.id_empleado,
            e.clave_empleado,
            CONCAT(e.nombre, ' ', e.ap_paterno, ' ', e.ap_materno) AS empleado,
            e.imss,
            e.curp,
            e.id_empresa,
            d.nombre_departamento,
            pe.nombre_puesto
        FROM planes_pagos pp
        INNER JOIN prestamos p ON p.id_prestamo = pp.id_prestamo
        INNER JOIN info_empleados e ON e.id_empleado = p.id_empleado
        LEFT JOIN departamentos d ON d.id_departamento = e.id_departamento
        LEFT JOIN puestos_especiales pe ON pe.id_puestoEspecial = e.id_puestoEspecial
        WHERE pp.id_plan = ?
        LIMIT 1
    ";

    $stmt = $conexion->prepare($sql);
    $stmt->bind_param('i', $id_plan);
    $stmt->execute();
    $res = $stmt->get_result();
    $data = $res->fetch_assoc() ?? [];
    $stmt->close();
    return $data;
}

function obtenerDetallePlan($conexion, int $id_plan): array
{
    $sql = "SELECT detalle FROM detalle_planes WHERE id_plan = ? LIMIT 1";
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param('i', $id_plan);
    $stmt->execute();
    $res = $stmt->get_result();
    $row = $res->fetch_assoc();
    $stmt->close();
    
    if ($row && isset($row['detalle'])) {
        $decoded = json_decode($row['detalle'], true);
        return is_array($decoded) ? $decoded : [];
    }
    
    return [];
}

class PDFPlanPago extends TCPDF
{
    public array $empresa = [];
    public string $titulo = 'Plan de pago';

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
    $plan = obtenerPlanCompleto($conexion, $id_plan);
    if (!$plan) {
        http_response_code(404);
        echo 'Plan de pago no encontrado';
        exit;
    }

    $empresa = obtenerEmpresaPorId($conexion, isset($plan['id_empresa']) ? (int)$plan['id_empresa'] : null);
    $detallePlan = obtenerDetallePlan($conexion, $id_plan);

    $pdf = new PDFPlanPago('P', 'mm', 'A4', true, 'UTF-8', false);
    $pdf->empresa = $empresa;
    $pdf->titulo = 'PLAN DE PAGO - PRÉSTAMO';

    $pdf->SetCreator('Sistema SAAO');
    $pdf->SetAuthor('Sistema SAAO');
    $pdf->SetTitle('Plan de pago - Préstamo');

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

    // 1) Información del empleado
    $html .= '<h3 style="margin:0 0 6px 0;">1) Información del empleado</h3>';
    $html .= '<table border="1" cellpadding="4">
        <tr>
            <td width="18%"><b>Empleado</b></td>
            <td width="32%">' . htmlspecialchars((string)($plan['empleado'] ?? ''), ENT_QUOTES, 'UTF-8') . '</td>
            <td width="18%"><b>Clave</b></td>
            <td width="32%">' . htmlspecialchars((string)($plan['clave_empleado'] ?? ''), ENT_QUOTES, 'UTF-8') . '</td>
        </tr>
        <tr>
            <td><b>NSS</b></td>
            <td>' . htmlspecialchars((string)($plan['imss'] ?? ''), ENT_QUOTES, 'UTF-8') . '</td>
            <td><b>CURP</b></td>
            <td>' . htmlspecialchars((string)($plan['curp'] ?? ''), ENT_QUOTES, 'UTF-8') . '</td>
        </tr>
        <tr>
            <td><b>Departamento</b></td>
            <td>' . htmlspecialchars((string)($plan['nombre_departamento'] ?? ''), ENT_QUOTES, 'UTF-8') . '</td>
            <td><b>Puesto</b></td>
            <td>' . htmlspecialchars((string)($plan['nombre_puesto'] ?? ''), ENT_QUOTES, 'UTF-8') . '</td>
        </tr>
    </table>';

    // 2) Información del préstamo
    $html .= '<br><h3 style="margin:0 0 6px 0;">2) Información del préstamo</h3>';
    $html .= '<table border="1" cellpadding="4">
        <tr>
            <td width="25%"><b>Folio del préstamo</b></td>
            <td width="25%">' . htmlspecialchars((string)($plan['folio'] ?? ''), ENT_QUOTES, 'UTF-8') . '</td>
            <td width="25%"><b>Monto prestado</b></td>
            <td width="25%" align="right">' . formatoMonedaPdf($plan['monto'] ?? 0) . '</td>
        </tr>
        <tr>
            <td><b>Fecha de registro</b></td>
            <td>' . formatearFechaPdf($plan['prestamo_fecha_registro'] ?? '', true) . '</td>
            <td><b>Estado</b></td>
            <td>' . htmlspecialchars((string)($plan['estado'] ?? ''), ENT_QUOTES, 'UTF-8') . '</td>
        </tr>
        <tr>
            <td><b>Semana del préstamo</b></td>
            <td>' . (int)($plan['prestamo_semana'] ?? 0) . '</td>
            <td><b>Año del préstamo</b></td>
            <td>' . (int)($plan['prestamo_anio'] ?? 0) . '</td>
        </tr>
    </table>';

    // 3) Información del plan
    $html .= '<br><h3 style="margin:0 0 6px 0;">3) Información del plan de pago</h3>';
    $html .= '<table border="1" cellpadding="4">
        <tr>
            <td width="25%"><b>Semana inicio</b></td>
            <td width="25%">Semana ' . (int)($plan['sem_inicio'] ?? 0) . ' (' . (int)($plan['anio_inicio'] ?? 0) . ')</td>
            <td width="25%"><b>Semana fin</b></td>
            <td width="25%">Semana ' . (int)($plan['sem_fin'] ?? 0) . ' (' . (int)($plan['anio_fin'] ?? 0) . ')</td>
        </tr>
        <tr>
            <td><b>Fecha de creación del plan</b></td>
            <td colspan="3">' . formatearFechaPdf($plan['plan_fecha_registro'] ?? '', true) . '</td>
        </tr>
    </table>';

    // 4) Detalle del plan
    $html .= '<br><h3 style="margin:0 0 6px 0;">4) Detalle del plan de pago</h3>';
    
    if (empty($detallePlan)) {
        $html .= '<table border="1" cellpadding="4">
            <tr><td align="center">No hay detalle disponible para este plan</td></tr>
        </table>';
    } else {
        $html .= '<table border="1" cellpadding="4">
            <tr style="background-color:#E8F5E9;">
                <th width="15%">Semana</th>
                <th width="12%">Año</th>
                <th width="20%">Monto a pagar</th>
                <th width="15%">Estado</th>
                <th width="20%">Fecha de pago</th>
                <th width="18%">Observación</th>
            </tr>';

        $totalDetalle = 0;
        foreach ($detallePlan as $item) {
            $semana = isset($item['num_semana']) ? (int)$item['num_semana'] : 0;
            $anio = isset($item['anio']) ? (int)$item['anio'] : 0;
            $monto = isset($item['monto_semanal']) ? (float)$item['monto_semanal'] : 0;
            $estado = isset($item['estado']) ? (string)$item['estado'] : 'Pendiente';
            $fechaPago = isset($item['fecha_pago']) ? (string)$item['fecha_pago'] : '';
            $obs = isset($item['observacion']) ? (string)$item['observacion'] : '';
            
            $totalDetalle += $monto;
            
            $html .= '<tr>';
            $html .= '<td align="center">Semana ' . $semana . '</td>';
            $html .= '<td align="center">' . $anio . '</td>';
            $html .= '<td align="right">' . formatoMonedaPdf($monto) . '</td>';
            $html .= '<td align="center">' . htmlspecialchars($estado, ENT_QUOTES, 'UTF-8') . '</td>';
            $html .= '<td align="center">' . ($fechaPago ? formatearFechaPdf($fechaPago, true) : '-') . '</td>';
            $html .= '<td>' . ($obs ? htmlspecialchars($obs, ENT_QUOTES, 'UTF-8') : '-') . '</td>';
            $html .= '</tr>';
        }
        
        $html .= '<tr style="background-color:#C8E6C9;font-weight:bold;">';
        $html .= '<td colspan="2">TOTAL A PAGAR</td>';
        $html .= '<td align="right">' . formatoMonedaPdf($totalDetalle) . '</td>';
        $html .= '<td colspan="3"></td>';
        $html .= '</tr>';
        
        $html .= '</table>';
    }

    $pdf->writeHTML($html, true, false, true, false, '');

    $nombre = 'PLAN PAGO - ' . htmlspecialchars((string)($plan['empleado'] ?? ''), ENT_QUOTES, 'UTF-8') . ' - Folio ' . htmlspecialchars((string)($plan['folio'] ?? ''), ENT_QUOTES, 'UTF-8') . ' - ' . date('d-m-Y') . '.pdf';
    $pdf->Output($nombre, 'I');

} catch (Exception $e) {
    http_response_code(500);
    echo 'Error al generar PDF: ' . $e->getMessage();
    exit;
}