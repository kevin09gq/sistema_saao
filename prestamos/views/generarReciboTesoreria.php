<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . "/../../conexion/conexion.php";
require_once __DIR__ . '/../../vendor/autoload.php';

if (!isset($_SESSION["logged_in"])) {
    header("Location: ../../login/login.php");
    exit;
}

$idAbono = isset($_GET['id_abono']) ? (int)$_GET['id_abono'] : 0;

if ($idAbono <= 0) {
    die('ID de abono no válido');
}

// Obtener información del abono, préstamo y empleado
$sql = "
    SELECT 
        pa.id_abono,
        pa.monto_pago,
        pa.fecha_pago,
        pa.num_sem_pago,
        pa.anio_pago,
        pa.es_nomina,
        pa.pausado,
        p.id_prestamo,
        p.folio,
        p.monto AS monto_prestamo,
        CONCAT(ie.nombre, ' ', ie.ap_paterno, ' ', ie.ap_materno) AS nombre_empleado,
        ie.clave_empleado
    FROM prestamos_abonos pa
    INNER JOIN prestamos p ON p.id_prestamo = pa.id_prestamo
    INNER JOIN info_empleados ie ON ie.id_empleado = p.id_empleado
    WHERE pa.id_abono = ?
    LIMIT 1
";

$stmt = $conexion->prepare($sql);
if (!$stmt) {
    die('Error al preparar consulta: ' . $conexion->error);
}

$stmt->bind_param('i', $idAbono);
if (!$stmt->execute()) {
    die('Error al ejecutar consulta: ' . $stmt->error);
}

$result = $stmt->get_result();
if (!$result || $result->num_rows === 0) {
    die('No se encontró el abono');
}

$abono = $result->fetch_assoc();
$stmt->close();

// Verificar que sea de Tesorería y no esté pausado
if ((int)$abono['es_nomina'] !== 0 || (int)$abono['pausado'] !== 0) {
    die('Este abono no es de Tesorería o está pausado');
}

// Calcular el saldo del préstamo DESPUÉS de aplicar este abono
// Primero obtenemos todos los abonos hasta este (ordenados por fecha)
$sqlAbonos = "
    SELECT 
        SUM(monto_pago) AS total_abonado
    FROM prestamos_abonos
    WHERE id_prestamo = ?
      AND pausado = 0
      AND fecha_pago <= ?
    ORDER BY fecha_pago ASC
";

$stmtAbonos = $conexion->prepare($sqlAbonos);
if (!$stmtAbonos) {
    die('Error al calcular saldo: ' . $conexion->error);
}

$stmtAbonos->bind_param('is', $abono['id_prestamo'], $abono['fecha_pago']);
if (!$stmtAbonos->execute()) {
    die('Error al ejecutar cálculo de saldo: ' . $stmtAbonos->error);
}

$resultAbonos = $stmtAbonos->get_result();
$rowAbonos = $resultAbonos->fetch_assoc();
$totalAbonado = $rowAbonos ? (float)$rowAbonos['total_abonado'] : 0;
$stmtAbonos->close();

$montoPrestamo = (float)$abono['monto_prestamo'];
$saldoPrestamo = $montoPrestamo - $totalAbonado;

if ($saldoPrestamo < 0) {
    $saldoPrestamo = 0;
}

// Meses en español
$mesesEspanol = [
    1 => 'ENE', 2 => 'FEB', 3 => 'MAR', 4 => 'ABR',
    5 => 'MAY', 6 => 'JUN', 7 => 'JUL', 8 => 'AGO',
    9 => 'SEP', 10 => 'OCT', 11 => 'NOV', 12 => 'DIC'
];
// Usar la fecha del abono en lugar de la fecha actual
$fechaPago = strtotime($abono['fecha_pago']);
$mesAbono = (int)date('n', $fechaPago);
$fechaActual = date('d', $fechaPago) . '/' . $mesesEspanol[$mesAbono] . '/' . date('Y', $fechaPago);

// Formatear datos
$nombreEmpleado = mb_strtoupper($abono['nombre_empleado'], 'UTF-8');
$claveEmpleado = $abono['clave_empleado'];
$folio = $abono['folio'];
$importeAbono = number_format($abono['monto_pago'], 2, '.', ',');
$saldo = number_format($saldoPrestamo, 2, '.', ',');

// Crear instancia de TCPDF
$pdf = new TCPDF('P', 'mm', 'LETTER', true, 'UTF-8', false);

// Configuración del documento
$pdf->SetCreator('Sistema SAAO');
$pdf->SetAuthor('Sistema SAAO');
$pdf->SetTitle('Recibo de Tesorería');
$pdf->SetSubject('Vale de Abonos a Préstamo');

// Quitar header y footer por defecto
$pdf->setPrintHeader(false);
$pdf->setPrintFooter(false);

// Márgenes
$pdf->SetMargins(15, 10, 15);
$pdf->SetAutoPageBreak(false, 0);

// Agregar página
$pdf->AddPage();

// Función para generar una copia del recibo
function generarRecibo($pdf, $y, $nombreEmpleado, $claveEmpleado, $fechaActual, $folio, $importeAbono, $saldo) {
    
    // Título
    $pdf->SetXY(15, $y);
    $pdf->SetFont('helvetica', 'B', 14);
    $pdf->Cell(180, 8, 'VALE DE ABONOS A PRESTAMO', 0, 1, 'C');
    
    $y += 10;
    
    // Fecha (alineada a la derecha)
    $pdf->SetFont('helvetica', '', 11);
    $pdf->SetXY(15, $y);
    $pdf->Cell(180, 6, 'FECHA: ' . $fechaActual, 0, 1, 'R');
    
    $y += 10;
    
    // Nombre y clave del empleado
    $pdf->SetXY(15, $y);
    $pdf->Cell(100, 6, $nombreEmpleado, 0, 0, 'L');
    $pdf->Cell(80, 6, 'CLAVE DEL EMPLEADO: ' . $claveEmpleado, 0, 1, 'R');
    
    $y += 12;
    
    // Folio y sello de tesorería
    $pdf->SetXY(15, $y);
    $pdf->Cell(50, 6, 'FOLIO DEL PRESTAMO:', 0, 0, 'L');
    $pdf->Cell(40, 6, $folio, 0, 0, 'L');
    $pdf->SetFont('helvetica', 'B', 11);
    $pdf->Cell(90, 6, 'SELLO DE TESORERIA', 0, 1, 'C');
    
    $y += 10;
    
    // Importe a abonar
    $pdf->SetFont('helvetica', '', 11);
    $pdf->SetXY(15, $y);
    $pdf->Cell(55, 6, 'IMPORTE A ABONAR:', 0, 0, 'L');
    $pdf->Cell(0, 6, '$' . $importeAbono, 0, 1, 'L');
    
    $y += 10;
    
    // Saldo del préstamo
    $pdf->SetXY(15, $y);
    $pdf->Cell(55, 6, 'SALDO DEL PRESTAMO:', 0, 0, 'L');
    $pdf->Cell(0, 6, '$' . $saldo, 0, 1, 'L');
    
    $y += 18;
    
    // Etiquetas de firmas
    $pdf->SetXY(15, $y);
    $pdf->Cell(90, 6, 'RECIBE', 0, 0, 'C');
    $pdf->Cell(90, 6, 'EMPLEADO', 0, 1, 'C');
    
    $y += 18;
    
    // Líneas de firma (centradas en cada mitad)
    $pdf->Line(30, $y, 100, $y);  // Línea izquierda (centrada en 90mm)
    $pdf->Line(110, $y, 180, $y); // Línea derecha (centrada en 90mm)
    
    $y += 4;
    
    // Nombres bajo las líneas
    $pdf->SetXY(12, $y);
    $pdf->Cell(90, 6, 'TESORERIA', 0, 0, 'C');
    $pdf->Cell(90, 6, $nombreEmpleado, 0, 1, 'C');
}

// Generar primera copia (mitad superior - Tesorería)
generarRecibo($pdf, 10, $nombreEmpleado, $claveEmpleado, $fechaActual, $folio, $importeAbono, $saldo);

// Línea divisoria
$pdf->Line(15, 139.7, 195, 139.7); // Mitad de la hoja carta (279.4mm / 2)

// Generar segunda copia (mitad inferior - Empleado)
generarRecibo($pdf, 149, $nombreEmpleado, $claveEmpleado, $fechaActual, $folio, $importeAbono, $saldo);

// Salida del PDF
$nombreArchivo = 'Recibo_Tesoreria_' . $folio . '_' . date('YmdHis') . '.pdf';
$pdf->Output($nombreArchivo, 'I');