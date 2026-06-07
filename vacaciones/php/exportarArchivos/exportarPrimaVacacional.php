<?php
require_once __DIR__ . '/../../../config/config.php';
require_once __DIR__ . '/../../../conexion/conexion.php';
require_once __DIR__ . '/../../../vendor/autoload.php';

if (!isset($_SESSION["logged_in"]) || $_SESSION["logged_in"] !== true) {
    header("Location: ../../../login/login.php");
    exit;
}

$id_empleado = isset($_GET['id_empleado']) ? intval($_GET['id_empleado']) : 0;
if ($id_empleado <= 0) {
    die("ID de empleado no válido.");
}

/** @var mysqli $conexion */

// 1. Obtener la información del empleado
$sql_emp = "
    SELECT 
        e.id_empleado,
        e.clave_empleado,
        e.nombre,
        e.ap_paterno,
        e.ap_materno,
        e.fecha_alta_empresa,
        e.id_status,
        e.salario_diario,
        COALESCE(
            (SELECT MAX(fecha_reingreso) 
             FROM historial_reingresos 
             WHERE id_empleado = e.id_empleado), 
            e.fecha_alta_empresa
        ) AS fecha_ingreso_final,
        e.id_area,
        e.id_departamento,
        d.nombre_departamento,
        a.nombre_area
    FROM info_empleados e
    LEFT JOIN departamentos d ON e.id_departamento = d.id_departamento
    LEFT JOIN areas a ON e.id_area = a.id_area
    WHERE e.id_empleado = '$id_empleado'
    LIMIT 1
";

$res_emp = mysqli_query($conexion, $sql_emp);
$emp = mysqli_fetch_assoc($res_emp);

if (!$emp) {
    die("Empleado no encontrado.");
}

// Formatear nombres
$nombre_completo = mb_strtoupper($emp['nombre'] . ' ' . $emp['ap_paterno'] . ' ' . $emp['ap_materno'], 'UTF-8');
$clave_empleado = $emp['clave_empleado'];
$depto = mb_strtoupper($emp['nombre_departamento'] ?? 'SIN DEPARTAMENTO', 'UTF-8');
$area = mb_strtoupper($emp['nombre_area'] ?? 'SIN AREA', 'UTF-8');

// Calcular antigüedad
$fecha_ingreso = new DateTime($emp['fecha_ingreso_final']);
$hoy = new DateTime();
$diferencia = $hoy->diff($fecha_ingreso);
$antiguedad_texto = $diferencia->y . " años, " . $diferencia->m . " meses";

// Meses en español para formatear fechas
function formatearFechaEspanol($fechaTexto) {
    if (empty($fechaTexto) || $fechaTexto == '0000-00-00') return '---';
    $meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    $time = strtotime($fechaTexto);
    if (!$time) return $fechaTexto;
    return date('d', $time) . ' ' . $meses[date('n', $time) - 1] . ' ' . date('Y', $time);
}

$fecha_ingreso_formateada = formatearFechaEspanol($emp['fecha_ingreso_final']);

// 2. Obtener Historial de Primas Vacacionales
$primas = [];
$sql_pr = "SELECT * 
           FROM prima_vacacional_empleados
           WHERE id_empleado = '$id_empleado'
           ORDER BY fecha_pago DESC, id_prima_empleado DESC";
$res_pr = mysqli_query($conexion, $sql_pr);

$total_dias = 0.0;
$total_monto_prima = 0.0;
$total_isr = 0.0;
$total_tarjeta = 0.0;
$total_neto = 0.0;

while ($row = mysqli_fetch_assoc($res_pr)) {
    $primas[] = $row;
    $total_dias += (float)$row['dias_vacaciones'];
    $total_monto_prima += (float)$row['monto_prima_vacacional'];
    $total_isr += (float)$row['isr'];
    $total_tarjeta += (float)$row['dispersion_tarjeta'];
    $total_neto += (float)$row['total_pagado'];
}

// ==========================================
// CREACIÓN DEL PDF CON TCPDF
// ==========================================
class ReportePrimaPDF extends TCPDF {
    private $emp;
    
    public function setEmployee($emp) {
        $this->emp = $emp;
    }

    public function Header() {
        $logo_path = __DIR__ . '/../../../public/img/logo.jpg';
        if (file_exists($logo_path)) {
            $this->Image($logo_path, 15, 10, 30, '', 'JPG', '', 'T', false, 300, '', false, false, 0, false, false, false);
        }
        
        $this->SetY(10);
        $this->SetFont('helvetica', 'B', 14);
        $this->SetTextColor(30, 41, 59); // Slate-800
        $this->Cell(0, 8, 'SISTEMA SAAO', 0, 1, 'R');
        $this->SetFont('helvetica', 'B', 11);
        $this->SetTextColor(71, 85, 105); // Slate-600
        $this->Cell(0, 6, 'HISTORIAL DE PAGOS DE PRIMA VACACIONAL', 0, 1, 'R');
        $this->SetFont('helvetica', '', 9);
        $this->Cell(0, 5, 'Fecha de Emisión: ' . date('d/m/Y H:i'), 0, 1, 'R');
        
        // Línea divisoria
        $this->SetLineStyle(array('width' => 0.5, 'color' => array(226, 232, 240))); // Slate-200
        $this->Line(15, 33, 195, 33);
    }

    public function Footer() {
        $this->SetY(-15);
        $this->SetFont('helvetica', 'I', 8);
        $this->SetTextColor(148, 163, 184); // Slate-400
        $this->Cell(0, 10, 'Página ' . $this->getAliasNumPage() . ' de ' . $this->getAliasNbPages(), 0, 0, 'C');
    }
}

// Crear instancia del PDF
$pdf = new ReportePrimaPDF('P', 'mm', 'LETTER', true, 'UTF-8', false);
$pdf->setEmployee($emp);

// Configuración del documento
$pdf->SetCreator('Sistema SAAO');
$pdf->SetAuthor('Sistema SAAO');
$pdf->SetTitle('Reporte de Primas - ' . $clave_empleado);
$pdf->SetSubject('Historial de Primas Vacacionales');

// Márgenes
$pdf->SetMargins(15, 38, 15);
$pdf->SetHeaderMargin(10);
$pdf->SetFooterMargin(15);
$pdf->SetAutoPageBreak(true, 18);

$pdf->AddPage();

// 1. Bloque de Datos Generales del Empleado
$html_emp = '
<table cellpadding="4" cellspacing="0" style="width: 100%; border: 1px solid #e2e8f0; background-color: #f8fafc;">
    <tr>
        <td style="width: 15%; font-weight: bold; color: #475569;">Clave:</td>
        <td style="width: 35%; color: #1e293b; font-weight: bold;">' . $clave_empleado . '</td>
        <td style="width: 20%; font-weight: bold; color: #475569;">Fecha Ingreso:</td>
        <td style="width: 30%; color: #1e293b;">' . $fecha_ingreso_formateada . '</td>
    </tr>
    <tr>
        <td style="font-weight: bold; color: #475569;">Empleado:</td>
        <td style="color: #1e293b; font-weight: bold;">' . $nombre_completo . '</td>
        <td style="font-weight: bold; color: #475569;">Antigüedad:</td>
        <td style="color: #1e293b;">' . $antiguedad_texto . '</td>
    </tr>
    <tr>
        <td style="font-weight: bold; color: #475569;">Depto:</td>
        <td style="color: #1e293b;">' . $depto . '</td>
        <td style="font-weight: bold; color: #475569;">Área:</td>
        <td style="color: #1e293b;">' . $area . '</td>
    </tr>
</table>
';
$pdf->writeHTML($html_emp, true, false, true, false, '');

$pdf->Ln(4);

// 2. Tabla de Primas Vacacionales
$pdf->SetFont('helvetica', 'B', 11);
$pdf->SetTextColor(15, 23, 42); // slate-900
$pdf->Cell(0, 8, 'Historial de Pagos Registrados', 0, 1, 'L');

$html_primas = '
<table cellpadding="4" cellspacing="0" style="width: 100%; border: 1px solid #cbd5e1; font-size: 8.2px;">
    <thead>
        <tr style="background-color: #1e3a8a; color: #ffffff; font-weight: bold; text-align: center;">
            <th width="10%" style="border-bottom: 1px solid #cbd5e1; border-right: 1px solid #cbd5e1;">Sem/Año</th>
            <th width="15%" style="border-bottom: 1px solid #cbd5e1; border-right: 1px solid #cbd5e1;">Fecha Pago</th>
            <th width="20%" style="border-bottom: 1px solid #cbd5e1; border-right: 1px solid #cbd5e1;">Periodo Vacacional</th>
            <th width="8%" style="border-bottom: 1px solid #cbd5e1; border-right: 1px solid #cbd5e1; text-align: right;">Días</th>
            <th width="11%" style="border-bottom: 1px solid #cbd5e1; border-right: 1px solid #cbd5e1; text-align: right;">Sal. Diario</th>
            <th width="11%" style="border-bottom: 1px solid #cbd5e1; border-right: 1px solid #cbd5e1; text-align: right;">Monto Prima</th>
            <th width="8%" style="border-bottom: 1px solid #cbd5e1; border-right: 1px solid #cbd5e1; text-align: right;">ISR</th>
            <th width="8%" style="border-bottom: 1px solid #cbd5e1; border-right: 1px solid #cbd5e1; text-align: right;">Tarjeta</th>
            <th width="9%" style="border-bottom: 1px solid #cbd5e1; text-align: right;">Neto</th>
        </tr>
    </thead>
    <tbody>';

if (empty($primas)) {
    $html_primas .= '
        <tr>
            <td colspan="9" align="center" style="color: #64748b; font-style: italic; padding: 10px;">No se encontraron registros de prima vacacional.</td>
        </tr>';
} else {
    $bg_alternativo = false;
    foreach ($primas as $p) {
        $bg_color = $bg_alternativo ? 'background-color: #f8fafc;' : 'background-color: #ffffff;';
        
        $sem_anio = $p['numero_semana'] . ' / ' . $p['anio'];
        $fecha_pago = formatearFechaEspanol($p['fecha_pago']);
        $periodo = formatearFechaEspanol($p['fecha_inicio']) . ' a ' . formatearFechaEspanol($p['fecha_fin']);
        
        $html_primas .= '
        <tr style="' . $bg_color . '">
            <td align="center" style="border-bottom: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0;">' . $sem_anio . '</td>
            <td align="center" style="border-bottom: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0;">' . $fecha_pago . '</td>
            <td align="center" style="border-bottom: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0;">' . $periodo . '</td>
            <td align="right" style="border-bottom: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0;">' . number_format((float)$p['dias_vacaciones'], 1) . '</td>
            <td align="right" style="border-bottom: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0;">$' . number_format((float)$p['salario_diario'], 2) . '</td>
            <td align="right" style="border-bottom: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; font-weight: bold; color: #1e3a8a;">$' . number_format((float)$p['monto_prima_vacacional'], 2) . '</td>
            <td align="right" style="border-bottom: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0; color: #dc2626;">$' . number_format((float)$p['isr'], 2) . '</td>
            <td align="right" style="border-bottom: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0;">$' . number_format((float)$p['dispersion_tarjeta'], 2) . '</td>
            <td align="right" style="border-bottom: 1px solid #e2e8f0; font-weight: bold; color: #16a34a;">$' . number_format((float)$p['total_pagado'], 2) . '</td>
        </tr>';
        
        $bg_alternativo = !$bg_alternativo;
    }
    
    // Fila de Totales
    $html_primas .= '
        <tr style="background-color: #f1f5f9; font-weight: bold;">
            <td colspan="3" align="right" style="border-top: 2px solid #cbd5e1; border-right: 1px solid #cbd5e1; padding: 6px;">TOTALES ACUMULADOS:</td>
            <td align="right" style="border-top: 2px solid #cbd5e1; border-right: 1px solid #cbd5e1;">' . number_format($total_dias, 1) . '</td>
            <td align="right" style="border-top: 2px solid #cbd5e1; border-right: 1px solid #cbd5e1;">---</td>
            <td align="right" style="border-top: 2px solid #cbd5e1; border-right: 1px solid #cbd5e1; color: #1e3a8a;">$' . number_format($total_monto_prima, 2) . '</td>
            <td align="right" style="border-top: 2px solid #cbd5e1; border-right: 1px solid #cbd5e1; color: #dc2626;">$' . number_format($total_isr, 2) . '</td>
            <td align="right" style="border-top: 2px solid #cbd5e1; border-right: 1px solid #cbd5e1;">$' . number_format($total_tarjeta, 2) . '</td>
            <td align="right" style="border-top: 2px solid #cbd5e1; color: #16a34a;">$' . number_format($total_neto, 2) . '</td>
        </tr>';
}

$html_primas .= '
    </tbody>
</table>';

$pdf->SetFont('helvetica', '', 9);
$pdf->writeHTML($html_primas, true, false, true, false, '');

// Nombre del archivo PDF
$nombre_pdf = 'Primas_Vacacionales_' . $clave_empleado . '_' . date('YmdHis') . '.pdf';

// Salida al navegador (Visualización interactiva)
$pdf->Output($nombre_pdf, 'I');
?>
