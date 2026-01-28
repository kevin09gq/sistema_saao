<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . "/../../conexion/conexion.php";
require_once __DIR__ . '/../../vendor/autoload.php';

if (!isset($_SESSION["logged_in"])) {
    http_response_code(401);
    echo 'No autenticado';
    exit;
}

// Obtener parámetros
$anioInicio = isset($_GET['anio_inicio']) ? (int)$_GET['anio_inicio'] : 0;
$semanaInicio = isset($_GET['semana_inicio']) ? (int)$_GET['semana_inicio'] : 0;
$anioFin = isset($_GET['anio_fin']) ? (int)$_GET['anio_fin'] : 0;
$semanaFin = isset($_GET['semana_fin']) ? (int)$_GET['semana_fin'] : 0;

// Validar que al menos tenga año inicio
if ($anioInicio <= 0) {
    http_response_code(400);
    echo 'Debe seleccionar al menos el año de inicio';
    exit;
}

// Si no hay año fin, usar año inicio
if ($anioFin <= 0) {
    $anioFin = $anioInicio;
}

// Si no hay semana inicio, usar 1
if ($semanaInicio <= 0) {
    $semanaInicio = 1;
}

// Si no hay semana fin
if ($semanaFin <= 0) {
    $semanaInicioOriginal = isset($_GET['semana_inicio']) ? (int)$_GET['semana_inicio'] : 0;
    
    if ($semanaInicioOriginal > 0 && $anioFin == $anioInicio) {
        $semanaFin = $semanaInicio;
    } else {
        $semanaFin = 52;
    }
}

// Funciones auxiliares
function formatoMonedaPdf($monto): string
{
    return '$' . number_format((float)$monto, 2, '.', ',');
}

function formatearFechaPdf($fecha, bool $conHora = false): string
{
    if (!$fecha) return '-';
    try {
        $dt = new DateTime((string)$fecha);
        return $dt->format($conHora ? 'd/m/Y H:i' : 'd/m/Y');
    } catch (Exception $e) {
        return (string)$fecha;
    }
}

function obtenerEmpresaPrincipal($conexion): array
{
    $res = $conexion->query("SELECT id_empresa, nombre_empresa, logo_empresa, domicilio_fiscal FROM empresa ORDER BY id_empresa ASC LIMIT 1");
    return $res ? ($res->fetch_assoc() ?? []) : [];
}

function getDescripcionFiltro($anioInicio, $semanaInicio, $anioFin, $semanaFin): string
{
    if ($semanaInicio == $semanaFin && $anioInicio == $anioFin) {
        return "Semana $semanaInicio del $anioInicio";
    } elseif ($anioInicio == $anioFin) {
        return "Semanas $semanaInicio a $semanaFin del $anioInicio";
    } else {
        return "Semana $semanaInicio/$anioInicio a Semana $semanaFin/$anioFin";
    }
}

function getBadgeEstadoHtml($estado): string
{
    $colores = [
        'activo' => '#28a745',
        'pausado' => '#ffc107',
        'liquidado' => '#6c757d'
    ];
    $color = $colores[$estado] ?? '#6c757d';
    $texto = ucfirst($estado);
    //  style=\"background-color:{$color}; color:#fff; padding:2px 6px; border-radius:3px; font-size:7pt;\"
    return "<span>{$texto}</span>";
}

// ============================
// Obtener datos (misma lógica que ObtenerReporteGeneral.php)
// ============================

// 1. PRESTADO
$sqlPrestado = "SELECT 
        p.id_prestamo,
        p.id_empleado,
        CONCAT(e.nombre, ' ', e.ap_paterno, ' ', e.ap_materno) AS empleado,
        p.folio,
        p.monto,
        p.semana,
        p.anio,
        p.fecha_registro,
        p.estado
    FROM prestamos p
    INNER JOIN info_empleados e ON e.id_empleado = p.id_empleado
    WHERE (p.anio > ? OR (p.anio = ? AND p.semana >= ?))
      AND (p.anio < ? OR (p.anio = ? AND p.semana <= ?))
    ORDER BY p.anio DESC, p.semana DESC, p.fecha_registro DESC
";

$stmtPrestado = $conexion->prepare($sqlPrestado);
$stmtPrestado->bind_param('iiiiii', $anioInicio, $anioInicio, $semanaInicio, $anioFin, $anioFin, $semanaFin);
$stmtPrestado->execute();
$resPrestado = $stmtPrestado->get_result();

$prestamos = [];
$totalPrestado = 0.0;
$idsPrestamos = [];

while ($row = $resPrestado->fetch_assoc()) {
    $prestamos[] = $row;
    $totalPrestado += (float)$row['monto'];
    $idsPrestamos[] = (int)$row['id_prestamo'];
}
$stmtPrestado->close();

// 2. RECUPERADO
$abonos = [];
$totalRecuperado = 0.0;

if (count($idsPrestamos) > 0) {
    $placeholders = implode(',', array_fill(0, count($idsPrestamos), '?'));
    $types = str_repeat('i', count($idsPrestamos));
    
    $sqlRecuperado = "SELECT 
            pa.id_abono,
            pa.id_prestamo,
            pa.monto_pago,
            pa.num_sem_pago,
            pa.anio_pago,
            pa.fecha_pago,
            pa.es_nomina,
            p.folio,
            CONCAT(e.nombre, ' ', e.ap_paterno, ' ', e.ap_materno) AS empleado
        FROM prestamos_abonos pa
        INNER JOIN prestamos p ON p.id_prestamo = pa.id_prestamo
        INNER JOIN info_empleados e ON e.id_empleado = p.id_empleado
        WHERE pa.id_prestamo IN ($placeholders)
        ORDER BY pa.anio_pago DESC, pa.num_sem_pago DESC, pa.fecha_pago DESC
    ";
    
    $stmtRecuperado = $conexion->prepare($sqlRecuperado);
    $stmtRecuperado->bind_param($types, ...$idsPrestamos);
    $stmtRecuperado->execute();
    $resRecuperado = $stmtRecuperado->get_result();
    
    while ($row = $resRecuperado->fetch_assoc()) {
        $abonos[] = $row;
        $totalRecuperado += (float)$row['monto_pago'];
    }
    $stmtRecuperado->close();
}

// 3. POR COBRAR
$porCobrar = [];
$totalPorCobrar = 0.0;

// Crear mapa de abonos por préstamo
$abonosPorPrestamo = [];
foreach ($abonos as $a) {
    $idP = (int)$a['id_prestamo'];
    if (!isset($abonosPorPrestamo[$idP])) {
        $abonosPorPrestamo[$idP] = 0.0;
    }
    $abonosPorPrestamo[$idP] += (float)$a['monto_pago'];
}

foreach ($prestamos as $p) {
    if ($p['estado'] === 'activo' || $p['estado'] === 'pausado') {
        $idP = (int)$p['id_prestamo'];
        $abonadoPrestamo = $abonosPorPrestamo[$idP] ?? 0.0;
        $pendiente = (float)$p['monto'] - $abonadoPrestamo;
        
        if ($pendiente > 0) {
            $porCobrar[] = [
                'id_prestamo' => $idP,
                'empleado' => $p['empleado'],
                'folio' => $p['folio'],
                'monto_prestamo' => (float)$p['monto'],
                'abonado' => $abonadoPrestamo,
                'pendiente' => $pendiente,
                'semana' => (int)$p['semana'],
                'anio' => (int)$p['anio'],
                'estado' => $p['estado']
            ];
            $totalPorCobrar += $pendiente;
        }
    }
}

// ============================
// Generar PDF
// ============================

class PDFReporteGeneral extends TCPDF
{
    public array $empresa = [];
    public string $titulo = 'Reporte General';
    public string $filtroDescripcion = '';

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
        // Fallback al logo por defecto
        if ($logoPath === '') {
            $fallback = __DIR__ . '/../../public/img/logo.jpg';
            if (file_exists($fallback)) {
                $logoPath = $fallback;
            }
        }

        // Logo
        if ($logoPath !== '') {
            $this->Image($logoPath, 10, 8, 25, 0, '', '', 'T', false, 300, '', false, false, 0, false, false, false);
        }

        // Nombre empresa
        $this->SetFont('helvetica', 'B', 14);
        $this->SetY(10);
        $this->Cell(0, 6, $nombreEmpresa, 0, 1, 'C');

        // Domicilio
        $this->SetFont('dejavusans', '', 8);
        if ($domicilio !== '') {
            $this->Cell(0, 4, $domicilio, 0, 1, 'C');
        }

        // Título principal
        $this->SetFont('helvetica', 'B', 12);
        $this->SetTextColor(0, 100, 0);
        $this->Cell(0, 7, $this->titulo, 0, 1, 'C');
        $this->SetTextColor(0, 0, 0);

        // Filtro aplicado
        $this->SetFont('dejavusans', '', 9);
        $this->Cell(0, 5, 'Período: ' . $this->filtroDescripcion, 0, 1, 'C');

        // Fecha de generación
        $this->SetFont('dejavusans', '', 8);
        $this->Cell(0, 5, 'Generado el: ' . date('d/m/Y H:i:s'), 0, 1, 'R');

        // Línea separadora
        $this->Line(10, 42, $this->getPageWidth() - 10, 42);
        $this->SetY(45);
    }

    public function Footer()
    {
        $this->SetY(-12);
        $this->SetFont('dejavusans', 'I', 8);
        $this->Cell(0, 8, 'Página ' . $this->getAliasNumPage() . ' de ' . $this->getAliasNbPages(), 0, 0, 'R');
    }
}

try {
    $empresa = obtenerEmpresaPrincipal($conexion);
    $descripcionFiltro = getDescripcionFiltro($anioInicio, $semanaInicio, $anioFin, $semanaFin);

    $pdf = new PDFReporteGeneral('P', 'mm', 'A4', true, 'UTF-8', false);
    $pdf->empresa = $empresa;
    $pdf->titulo = 'REPORTE GENERAL - PRÉSTAMOS Y ABONOS';
    $pdf->filtroDescripcion = $descripcionFiltro;

    $pdf->SetCreator('Sistema SAAO');
    $pdf->SetAuthor('Sistema SAAO');
    $pdf->SetTitle('Reporte General - Préstamos');

    $pdf->SetMargins(10, 48, 10);
    $pdf->SetHeaderMargin(10);
    $pdf->SetFooterMargin(10);
    $pdf->SetAutoPageBreak(true, 15);

    $pdf->AddPage();
    $pdf->SetFont('dejavusans', '', 8);

    $html = '';

    $html .= '<style>
        table { font-size: 8pt; border-collapse: collapse; }
        th { background-color: #e9ecef; color: #000000; font-weight: bold; padding: 4px; }
        td { padding: 3px; }
        .section-title { font-size: 11pt; font-weight: bold; margin: 10px 0 5px 0; }
        .totales-row { background-color: #e9ecef; font-weight: bold; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .text-danger { color: #a91e2c; }
        .text-success { color: #13772b; }
    </style>';

    // ========== RESUMEN GENERAL ==========
    $html .= '<h3 style="margin:0 0 8px 0;">Resumen General</h3>';
    $html .= '<table border="1" cellpadding="5" style="width:100%;">
        <tr style="background-color:#f8f9fa;">
            <td style="width:33%; text-align:center;">
                <strong style="color:#dc3545;">Por Cobrar</strong><br>
                <span style="font-size:12pt; font-weight:bold; color:#dc3545;">' . formatoMonedaPdf($totalPorCobrar) . '</span><br>
                <small>' . count($porCobrar) . ' préstamo(s) pendiente(s)</small>
            </td>
            <td style="width:33%; text-align:center;">
                <strong style="color:#28a745;">Recuperado</strong><br>
                <span style="font-size:12pt; font-weight:bold; color:#28a745;">' . formatoMonedaPdf($totalRecuperado) . '</span><br>
                <small>' . count($abonos) . ' abono(s) recibido(s)</small>
            </td>
            <td style="width:34%; text-align:center;">
                <strong style="color:#007bff;">Prestado</strong><br>
                <span style="font-size:12pt; font-weight:bold; color:#007bff;">' . formatoMonedaPdf($totalPrestado) . '</span><br>
                <small>' . count($prestamos) . ' préstamo(s) otorgado(s)</small>
            </td>
        </tr>
    </table>';

    // ========== POR COBRAR ==========
    $html .= '<br><h3 style="color:#dc3545; margin:10px 0 5px 0;">1. Por Cobrar - ' . formatoMonedaPdf($totalPorCobrar) . '</h3>';
    $html .= '<table border="1" cellpadding="4" style="width:100%;">
        <tr>
            <th style="width:28%;">Empleado</th>
            <th style="width:12%;">Folio</th>
            <th style="width:14%; text-align:right;">Préstamo</th>
            <th style="width:14%; text-align:right;">Abonado</th>
            <th style="width:14%; text-align:right;">Pendiente</th>
            <th style="width:10%; text-align:center;">Sem/Año</th>
            <th style="width:8%; text-align:center;">Estado</th>
        </tr>';

    if (count($porCobrar) === 0) {
        $html .= '<tr><td colspan="7" style="text-align:center; color:#6c757d;">No hay préstamos pendientes de cobro</td></tr>';
    } else {
        foreach ($porCobrar as $item) {
            $html .= '<tr>
                <td>' . htmlspecialchars($item['empleado']) . '</td>
                <td><small>' . htmlspecialchars($item['folio']) . '</small></td>
                <td style="text-align:right;">' . formatoMonedaPdf($item['monto_prestamo']) . '</td>
                <td style="text-align:right; color:#28a745;">' . formatoMonedaPdf($item['abonado']) . '</td>
                <td style="text-align:right; font-weight:bold; color:#dc3545;">' . formatoMonedaPdf($item['pendiente']) . '</td>
                <td style="text-align:center;">' . $item['semana'] . '/' . $item['anio'] . '</td>
                <td style="text-align:center;">' . getBadgeEstadoHtml($item['estado']) . '</td>
            </tr>';
        }
    }
    $html .= '</table>';

    // ========== RECUPERADO ==========
    $html .= '<br><h3 style="color:#28a745; margin:10px 0 5px 0;">2. Recuperado (Abonos) - ' . formatoMonedaPdf($totalRecuperado) . '</h3>';
    $html .= '<table border="1" cellpadding="4" style="width:100%;">
        <tr>
            <th style="width:30%;">Empleado</th>
            <th style="width:15%;">Folio</th>
            <th style="width:15%; text-align:right;">Monto Abono</th>
            <th style="width:12%; text-align:center;">Sem/Año</th>
            <th style="width:15%; text-align:center;">Fecha</th>
            <th style="width:13%; text-align:center;">Tipo</th>
        </tr>';

    if (count($abonos) === 0) {
        $html .= '<tr><td colspan="6" style="text-align:center; color:#6c757d;">No hay abonos registrados</td></tr>';
    } else {
        foreach ($abonos as $item) {
            $tipoAbono = (int)$item['es_nomina'] === 1 
                ? '<span>Nómina</span>'
                : '<span>Tesorería</span>';

                // style="background-color:#ffc107; color:#000; padding:2px 6px; border-radius:3px; font-size:7pt;"
            
            $html .= '<tr>
                <td>' . htmlspecialchars($item['empleado']) . '</td>
                <td><small>' . htmlspecialchars($item['folio']) . '</small></td>
                <td style="text-align:right; color:#28a745; font-weight:bold;">' . formatoMonedaPdf($item['monto_pago']) . '</td>
                <td style="text-align:center;">' . $item['num_sem_pago'] . '/' . $item['anio_pago'] . '</td>
                <td style="text-align:center;">' . formatearFechaPdf($item['fecha_pago']) . '</td>
                <td style="text-align:center;">' . $tipoAbono . '</td>
            </tr>';
        }
    }
    $html .= '</table>';

    // ========== PRESTADO ==========
    $html .= '<br><h3 style="color:#007bff; margin:10px 0 5px 0;">3. Prestado Total - ' . formatoMonedaPdf($totalPrestado) . '</h3>';
    $html .= '<table border="1" cellpadding="4" style="width:100%;">
        <tr>
            <th style="width:32%;">Empleado</th>
            <th style="width:15%;">Folio</th>
            <th style="width:15%; text-align:right;">Monto</th>
            <th style="width:12%; text-align:center;">Sem/Año</th>
            <th style="width:14%; text-align:center;">Fecha</th>
            <th style="width:12%; text-align:center;">Estado</th>
        </tr>';

    if (count($prestamos) === 0) {
        $html .= '<tr><td colspan="6" style="text-align:center; color:#6c757d;">No hay préstamos en este período</td></tr>';
    } else {
        foreach ($prestamos as $item) {
            $html .= '<tr>
                <td>' . htmlspecialchars($item['empleado']) . '</td>
                <td><small>' . htmlspecialchars($item['folio']) . '</small></td>
                <td style="text-align:right; font-weight:bold;">' . formatoMonedaPdf($item['monto']) . '</td>
                <td style="text-align:center;">' . $item['semana'] . '/' . $item['anio'] . '</td>
                <td style="text-align:center;">' . formatearFechaPdf($item['fecha_registro']) . '</td>
                <td style="text-align:center;">' . getBadgeEstadoHtml($item['estado']) . '</td>
            </tr>';
        }
    }
    $html .= '</table>';

    $pdf->writeHTML($html, true, false, true, false, '');

    // Nombre del archivo
    $nombreArchivo = 'REPORTE_GENERAL_' . $anioInicio;
    if ($semanaInicio > 0) {
        $nombreArchivo .= '_SEM' . str_pad($semanaInicio, 2, '0', STR_PAD_LEFT);
    }
    if ($anioFin != $anioInicio || $semanaFin != $semanaInicio) {
        $nombreArchivo .= '_a_' . $anioFin . '_SEM' . str_pad($semanaFin, 2, '0', STR_PAD_LEFT);
    }
    $nombreArchivo .= '_' . date('Ymd_His') . '.pdf';

    $pdf->Output($nombreArchivo, 'I');

} catch (Exception $e) {
    http_response_code(500);
    echo 'Error al generar PDF: ' . $e->getMessage();
    exit;
}