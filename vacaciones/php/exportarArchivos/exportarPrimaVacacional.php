<?php
require_once __DIR__ . '/../../../vendor/autoload.php';
include_once __DIR__ . '/../../../conexion/conexion.php';

/** @var mysqli $conexion */

// ─── PALETA (idéntica al Excel) ───────────────────────────────────────────────
define('C_GREEN_DARK',  [58,  158, 95]);   // #3A9E5F – título principal
define('C_GREEN_MID',   [76,  175, 114]);  // #4CAF72 – encabezados sección
define('C_GREEN_LIGHT', [213, 237, 224]);  // #D5EDE0 – separador / sub-fondo
define('C_RED',         [192, 57,  43]);   // #C0392B – encabezado deducciones
define('C_WHITE',       [255, 255, 255]);
define('C_BLACK',       [26,  26,  26]);   // #1A1A1A
define('C_BORDER',      [176, 208, 186]);  // #B0D0BA – borde suave

// Obtener ID de empleado desde la URL
$id_empleado = isset($_GET['id_empleado']) ? intval($_GET['id_empleado']) : 0;
if ($id_empleado <= 0) die('ID de empleado no válido.');

// Obtener datos del empleado
$sql_emp = "SELECT
                e.id_empleado, e.clave_empleado, e.nombre, e.ap_paterno, e.ap_materno,
                d.nombre_departamento, a.nombre_area
            FROM info_empleados e
            LEFT JOIN departamentos d ON e.id_departamento = d.id_departamento
            LEFT JOIN areas a ON e.id_area = a.id_area
            WHERE e.id_empleado = '$id_empleado'";
$result_emp = mysqli_query($conexion, $sql_emp);
$empleado   = mysqli_fetch_assoc($result_emp);
if (!$empleado) die('Empleado no encontrado.');

// Obtener historial de primas vacacionales
$sql_primas = "SELECT * FROM prima_vacacional_empleados
               WHERE id_empleado = '$id_empleado'
               ORDER BY fecha_pago DESC";
$result_primas = mysqli_query($conexion, $sql_primas);
$primas = [];
while ($r = mysqli_fetch_assoc($result_primas)) $primas[] = $r;

// ─────────────────────────────────────────────────────────────────────────────
// CLASE PDF
// ─────────────────────────────────────────────────────────────────────────────
class PDFPrimaVacacional extends TCPDF
{
    private $logoPath = '';

    public function setLogoPath($p) { $this->logoPath = $p; }

    public function Header()
    {
        // Título de la empresa
        $this->SetTextColor(...C_BLACK);
        $this->SetFont('helvetica', 'B', 13);
        $this->SetY(8);
        $this->Cell(0, 6, 'CITRICOS SAAO S.A DE C.V', 0, 1, 'C', false);

        // Subtítulo
        $this->SetFont('helvetica', 'B', 10);
        $this->Cell(0, 5, 'DETALLE DE PAGO VACACIONAL', 0, 1, 'C', false);

        $this->Ln(3);
    }

    public function Footer()
    {
        $this->SetY(-12);
        $this->SetFont('helvetica', 'I', 8);
        $this->SetTextColor(120, 120, 120);
        $this->Cell(0, 6, 'Página ' . $this->getAliasNumPage() . ' / ' . $this->getAliasNbPages(), 0, 0, 'C');
        $this->SetTextColor(...C_BLACK);
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS DE DIBUJO
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Encabezado de sección (barra verde media completa).
 */
function pdfSeccion(TCPDF $pdf, string $titulo): void
{
    $pdf->SetFillColor(...C_GREEN_MID);
    $pdf->SetTextColor(...C_WHITE);
    $pdf->SetFont('helvetica', 'B', 9);
    $pdf->Cell(0, 7, '  ' . $titulo, 0, 1, 'L', true);
    $pdf->SetTextColor(...C_BLACK);
}

/**
 * Encabezado de sección roja (DEDUCCIONES).
 */
function pdfSeccionRoja(TCPDF $pdf, string $titulo): void
{
    $pdf->SetFillColor(...C_RED);
    $pdf->SetTextColor(...C_WHITE);
    $pdf->SetFont('helvetica', 'B', 9);
    $pdf->Cell(0, 7, '  ' . $titulo, 0, 1, 'L', true);
    $pdf->SetTextColor(...C_BLACK);
}

/**
 * Fila simple: etiqueta (negrita) | valor (normal) — todo fondo blanco.
 * $wLabel: ancho de columna etiqueta en mm.
 */
function pdfFila(TCPDF $pdf, string $label, string $valor, float $wLabel = 55, string $align = 'L'): void
{
    $pdf->SetFillColor(...C_WHITE);
    $pdf->SetFont('helvetica', 'B', 8.5);
    $pdf->SetDrawColor(...C_BORDER);
    $pdf->Cell($wLabel, 6.5, ' ' . $label, 'B', 0, 'L', true);
    $pdf->SetFont('helvetica', '', 8.5);
    $pdf->Cell(0, 6.5, $valor . ' ', 'B', 1, $align, true);
}

/**
 * Fila doble: dos pares etiqueta/valor en la misma línea.
 */
function pdfFilaDoble(TCPDF $pdf, string $lbl1, string $val1, string $lbl2, string $val2): void
{
    $pageW = $pdf->getPageWidth() - $pdf->getMargins()['left'] - $pdf->getMargins()['right'];
    $half  = $pageW / 2;
    $wLbl  = 42;

    $pdf->SetFillColor(...C_WHITE);
    $pdf->SetDrawColor(...C_BORDER);

    $pdf->SetFont('helvetica', 'B', 8.5);
    $pdf->Cell($wLbl, 6.5, ' ' . $lbl1, 'B', 0, 'L', true);
    $pdf->SetFont('helvetica', '', 8.5);
    $pdf->Cell($half - $wLbl, 6.5, $val1, 'B', 0, 'L', true);

    $pdf->SetFont('helvetica', 'B', 8.5);
    $pdf->Cell($wLbl, 6.5, ' ' . $lbl2, 'B', 0, 'L', true);
    $pdf->SetFont('helvetica', '', 8.5);
    $pdf->Cell(0, 6.5, $val2, 'B', 1, 'L', true);
}

/**
 * Fila triple: tres pares etiqueta/valor en la misma línea.
 */
function pdfFilaTriple(TCPDF $pdf, string $l1, string $v1, string $l2, string $v2, string $l3, string $v3): void
{
    $pageW = $pdf->getPageWidth() - $pdf->getMargins()['left'] - $pdf->getMargins()['right'];
    $third = $pageW / 3;
    $wLbl  = 32;

    $pdf->SetFillColor(...C_WHITE);
    $pdf->SetDrawColor(...C_BORDER);

    foreach ([[$l1, $v1], [$l2, $v2], [$l3, $v3]] as $i => $par) {
        $isLast = ($i === 2);
        $pdf->SetFont('helvetica', 'B', 8.5);
        $pdf->Cell($wLbl, 6.5, ' ' . $par[0], 'B', 0, 'L', true);
        $pdf->SetFont('helvetica', '', 8.5);
        $pdf->Cell($isLast ? 0 : ($third - $wLbl), 6.5, $par[1], 'B', $isLast ? 1 : 0, 'L', true);
    }
}

/**
 * Fila de monto (concepto alineado izq, monto alineado der).
 */
function pdfFilaMonto(TCPDF $pdf, string $concepto, string $monto): void
{
    $pdf->SetFillColor(...C_WHITE);
    $pdf->SetDrawColor(...C_BORDER);
    $pdf->SetFont('helvetica', 'B', 8.5);
    $pdf->Cell(130, 6.5, ' ' . $concepto, 'B', 0, 'L', true);
    $pdf->SetFont('helvetica', '', 8.5);
    $pdf->Cell(0, 6.5, $monto . ' ', 'B', 1, 'R', true);
}

/**
 * Separador visual entre bloques.
 */
function pdfSeparador(TCPDF $pdf): void
{
    $pdf->SetFillColor(...C_GREEN_LIGHT);
    $pdf->Cell(0, 3, '', 0, 1, 'L', true);
    $pdf->Ln(1);
}

// ─────────────────────────────────────────────────────────────────────────────
// CREAR PDF
// ─────────────────────────────────────────────────────────────────────────────
$pdf = new PDFPrimaVacacional('P', 'mm', 'A4', true, 'UTF-8', false);
$pdf->setLogoPath(__DIR__ . '/../../../../public/img/logo.jpg');
$pdf->SetCreator('Sistema SAAO');
$pdf->SetAuthor('Sistema SAAO');
$pdf->SetTitle('Prima Vacacional - ' . $empleado['nombre'] . ' ' . $empleado['ap_paterno']);
$pdf->SetSubject('Prima Vacacional');
$pdf->SetMargins(12, 25, 12);
$pdf->SetHeaderMargin(5);
$pdf->SetFooterMargin(8);
$pdf->SetAutoPageBreak(true, 18);
$pdf->AddPage();

// ── SECCIÓN: DATOS DEL EMPLEADO ───────────────────────────────────────────────
pdfSeccion($pdf, 'DATOS DEL EMPLEADO');

$nombre_completo = trim($empleado['nombre'] . ' ' . $empleado['ap_paterno'] . ' ' . $empleado['ap_materno']);
pdfFila($pdf, 'Nombre Completo:', $nombre_completo);
pdfFilaDoble($pdf, 'Clave:', $empleado['clave_empleado'], 'Departamento:', $empleado['nombre_departamento'] ?: 'N/A');
pdfFila($pdf, 'Área:', $empleado['nombre_area'] ?: 'N/A');

pdfSeparador($pdf);

if (empty($primas)) {
    $pdf->SetFont('helvetica', 'I', 10);
    $pdf->SetTextColor(120, 120, 120);
    $pdf->Cell(0, 10, 'No hay registros de prima vacacional para este empleado.', 0, 1, 'C');
    $pdf->SetTextColor(...C_BLACK);
} else {
    foreach ($primas as $index => $prima) {

        // ── TÍTULO DEL PAGO ───────────────────────────────────────────────────
        $pdf->SetFillColor(...C_GREEN_DARK);
        $pdf->SetTextColor(...C_WHITE);
        $pdf->SetFont('helvetica', 'B', 10);
        $pdf->Cell(0, 8, '  PAGO ' . ($index + 1), 0, 1, 'L', true);
        $pdf->SetTextColor(...C_BLACK);
        $pdf->Ln(1);

        // ── INFORMACIÓN DE REGISTRO ───────────────────────────────────────────
        pdfSeccion($pdf, 'INFORMACIÓN DE REGISTRO');
        pdfFilaTriple($pdf,
            'Número de Semana:', $prima['numero_semana'],
            'Año:',              $prima['anio'],
            'Fecha de Pago:',   date('d/m/Y', strtotime($prima['fecha_pago']))
        );
        pdfSeparador($pdf);

        // ── PERIODO Y DÍAS DE VACACIONES ──────────────────────────────────────
        pdfSeccion($pdf, 'PERIODO Y DÍAS DE VACACIONES');
        pdfFilaDoble($pdf,
            'Fecha de Inicio:', date('d/m/Y', strtotime($prima['fecha_inicio'])),
            'Fecha de Fin:',    date('d/m/Y', strtotime($prima['fecha_fin']))
        );
        pdfFilaTriple($pdf,
            'Días Vacaciones:', number_format($prima['dias_vacaciones'], 3),
            'Séptimo Día:',           number_format($prima['septimo_dia'], 2),
            'Festivos:',              $prima['festivos']
        );
        pdfSeparador($pdf);

        // ── PAGO DE VACACIONES ────────────────────────────────────────────────
        pdfSeccion($pdf, 'PAGO DE VACACIONES');
        $sueldo_vacaciones = floatval($prima['salario_diario']) * floatval($prima['dias_vacaciones']);
        pdfFilaDoble($pdf,
            'Salario Diario:',      '$ ' . number_format($prima['salario_diario'], 2),
            'Porcentaje de Prima:', number_format($prima['porcentaje_prima'], 2) . ' %'
        );
        pdfFila($pdf, 'Sueldo por Vacaciones:', '$ ' . number_format($sueldo_vacaciones, 2), 55, 'R');
        pdfSeparador($pdf);

        // ── DESGLOSE DE PAGO ──────────────────────────────────────────────────
        pdfSeccion($pdf, 'DESGLOSE DE PAGO');
        $septimo_dia_monto = floatval($prima['salario_diario']) * floatval($prima['septimo_dia']);
        $festivos_monto    = floatval($prima['salario_diario']) * floatval($prima['festivos']);

        pdfFilaMonto($pdf, 'Vacaciones:',       '$ ' . number_format($sueldo_vacaciones, 2));
        pdfFilaMonto($pdf, 'Prima Vacacional:', '$ ' . number_format($prima['monto_prima_vacacional'], 2));
        pdfFilaMonto($pdf, 'Séptimo Día:',     '$ ' . number_format($septimo_dia_monto, 2));
        pdfFilaMonto($pdf, 'Festivos:',         '$ ' . number_format($festivos_monto, 2));

        // ── DEDUCCIONES (condicional) ─────────────────────────────────────────
        $hayDed = floatval($prima['dispersion_tarjeta']) > 0
               || floatval($prima['isr'])               > 0
               || floatval($prima['imss'])               > 0
               || floatval($prima['infonavit'])          > 0;

        if ($hayDed) {
            pdfSeparador($pdf);
            pdfSeccionRoja($pdf, 'DEDUCCIONES');

            if (floatval($prima['dispersion_tarjeta']) > 0)
                pdfFilaMonto($pdf, 'Dispersión por Tarjeta:', '$ ' . number_format($prima['dispersion_tarjeta'], 2));
            if (floatval($prima['isr']) > 0)
                pdfFilaMonto($pdf, 'ISR:',       '$ ' . number_format($prima['isr'], 2));
            if (floatval($prima['imss']) > 0)
                pdfFilaMonto($pdf, 'IMSS:',      '$ ' . number_format($prima['imss'], 2));
            if (floatval($prima['infonavit']) > 0)
                pdfFilaMonto($pdf, 'INFONAVIT:', '$ ' . number_format($prima['infonavit'], 2));
        }

        pdfSeparador($pdf);

        // ── TOTAL A PAGAR ─────────────────────────────────────────────────────
        $pdf->SetFillColor(...C_GREEN_DARK);
        $pdf->SetTextColor(...C_WHITE);
        $pdf->SetFont('helvetica', 'B', 11);
        $pdf->Cell(130, 9, '  TOTAL A PAGAR', 0, 0, 'L', true);
        $pdf->Cell(0, 9, '$ ' . number_format($prima['total_pagado'], 2) . '  ', 0, 1, 'R', true);
        $pdf->SetTextColor(...C_BLACK);

        pdfSeparador($pdf);

        // ── DÍAS VACACIONES ───────────────────────────────────────────────────
        pdfSeccion($pdf, 'DÍAS VACACIONES');
        $diasDisfrutados = $prima['tiene_disfrutados'] ? number_format($prima['dias_disfrutados'], 3) : 'No aplica';
        $diasPagadas     = $prima['tiene_pagadas']     ? number_format($prima['dias_pagadas'],     3) : 'No aplica';
        pdfFilaDoble($pdf, 'Días Disfrutados:', $diasDisfrutados, 'Días Pagados:', $diasPagadas);

        // ── OBSERVACIONES (condicional) ───────────────────────────────────────
        if (!empty($prima['observaciones'])) {
            pdfSeparador($pdf);
            pdfSeccion($pdf, 'OBSERVACIONES');
            $pdf->SetFillColor(255, 253, 231); // amarillo muy claro
            $pdf->SetFont('helvetica', 'I', 8.5);
            $pdf->SetDrawColor(...C_BORDER);
            $pdf->MultiCell(0, 6, ' ' . $prima['observaciones'], 'B', 'L', true);
        }

        // Separador entre registros
        if ($index < count($primas) - 1) {
            $pdf->Ln(6);
            $pdf->SetDrawColor(...C_GREEN_MID);
            $pdf->SetLineWidth(0.5);
            $pdf->Line(
                $pdf->getMargins()['left'],
                $pdf->GetY(),
                $pdf->getPageWidth() - $pdf->getMargins()['right'],
                $pdf->GetY()
            );
            $pdf->SetLineWidth(0.2);
            $pdf->Ln(6);
        }
    }
}

// Limpiar buffer y enviar PDF
if (ob_get_contents()) ob_end_clean();
$pdf->Output('Prima_Vacacional_' . $empleado['clave_empleado'] . '.pdf', 'I');
