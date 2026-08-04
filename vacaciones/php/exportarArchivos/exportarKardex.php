<?php
require_once __DIR__ . '/../../../vendor/autoload.php';
include_once __DIR__ . '/../../../conexion/conexion.php';

/** @var mysqli $conexion */

// ─── PALETA DE COLORES ────────────────────────────────────────────────────────
define('C_GREEN_DARK',  [58,  158, 95]);   // #3A9E5F – título principal
define('C_GREEN_MID',   [76,  175, 114]);  // #4CAF72 – encabezados sección
define('C_GREEN_LIGHT', [213, 237, 224]);  // #D5EDE0 – separador / sub-fondo
define('C_RED',         [192, 57,  43]);   // #C0392B – deducciones o salidas
define('C_WHITE',       [255, 255, 255]);
define('C_BLACK',       [26,  26,  26]);   // #1A1A1A
define('C_BORDER',      [176, 208, 186]);  // #B0D0BA – borde suave

// Obtener ID de empleado desde la URL
$id_empleado = isset($_GET['id_empleado']) ? intval($_GET['id_empleado']) : 0;
if ($id_empleado <= 0) die('ID de empleado no válido.');

// Obtener datos del empleado
$sql_emp = "SELECT 
                e.id_empleado, e.clave_empleado, e.nombre, e.ap_paterno, e.ap_materno, e.fecha_alta_empresa, e.id_status,
                d.nombre_departamento, a.nombre_area,
                COALESCE(
                    (SELECT MAX(fecha_reingreso) FROM historial_reingresos WHERE id_empleado = e.id_empleado), 
                    e.fecha_alta_empresa
                ) AS fecha_ingreso_final
            FROM info_empleados e
            LEFT JOIN departamentos d ON e.id_departamento = d.id_departamento
            LEFT JOIN areas a ON e.id_area = a.id_area
            WHERE e.id_empleado = '$id_empleado'";
$result_emp = mysqli_query($conexion, $sql_emp);
$empleado = mysqli_fetch_assoc($result_emp);
if (!$empleado) die('Empleado no encontrado.');

// Obtener historial de reingresos del empleado
$sql_reingresos = "SELECT fecha_reingreso, fecha_salida FROM historial_reingresos WHERE id_empleado = '$id_empleado' ORDER BY fecha_reingreso ASC";
$result_reingresos = mysqli_query($conexion, $sql_reingresos);
$historial_reingresos = [];
while ($row = mysqli_fetch_assoc($result_reingresos)) $historial_reingresos[] = $row;

// Obtener períodos de vacaciones
$sql_periodos = "SELECT p.*, v.nombre_version 
                 FROM vacaciones_periodos p
                 JOIN versiones_vacaciones_lft v ON p.id_version_vacaciones = v.id_version_vacaciones
                 WHERE p.id_empleado = '$id_empleado'
                 ORDER BY p.num_ciclo ASC, p.fecha_aniversario ASC";
$result_periodos = mysqli_query($conexion, $sql_periodos);
$periodos = [];
while ($row = mysqli_fetch_assoc($result_periodos)) $periodos[] = $row;

// Función para obtener todas las leyes LFT (igual que vacaciones_lft.php)
function obtenerTodoLftPHP($conexion) {
    $sql_v = "SELECT * FROM versiones_vacaciones_lft ORDER BY fecha_inicio_vigencia ASC";
    $res_v = mysqli_query($conexion, $sql_v);
    $todo = [];
    while ($v = mysqli_fetch_assoc($res_v)) {
        $id_v = $v['id_version_vacaciones'];
        $sql_d = "SELECT * FROM dias_vacaciones_lft WHERE id_version_vacaciones = '$id_v' ORDER BY anios_antiguedad_inicio ASC";
        $res_d = mysqli_query($conexion, $sql_d);
        $v['tabla_dias'] = [];
        while ($d = mysqli_fetch_assoc($res_d)) {
            $v['tabla_dias'][] = $d;
        }
        $todo[] = $v;
    }
    return $todo;
}

// Función para generar kardex simulado (igual que JS)
function generarKardexSimuladoPHP($empleado, $todasLasLeyes) {
    $fechaIngreso = new DateTime($empleado['fecha_ingreso_final']);
    $hoy = new DateTime();
    $anioBase = (int)$fechaIngreso->format('Y');
    $mesBase = (int)$fechaIngreso->format('m');
    $diaBase = (int)$fechaIngreso->format('d');

    $movimientos = [];
    $saldoAcumulado = 0.000;

    $movimientos[] = [
        'concepto' => 'Vacaciones tomadas antes del registro del empleado',
        'fecha_registro' => $empleado['fecha_ingreso_final'],
        'dias_movimiento' => 0.000,
        'saldo_resultante' => 0.000,
        'observaciones' => 'Saldo inicial de apertura'
    ];

    for ($anios = 1; $anios <= 100; $anios++) {
        $fechaAniversario = new DateTime("$anioBase-$mesBase-$diaBase");
        $fechaAniversario->modify("+$anios years");
        if ($fechaAniversario > $hoy) break;

        $ley = null;
        foreach ($todasLasLeyes as $l) {
            $inicio = new DateTime($l['fecha_inicio_vigencia']);
            $fin = !empty($l['fecha_fin_vigencia']) ? new DateTime($l['fecha_fin_vigencia']) : new DateTime('9999-12-31');
            if ($fechaAniversario >= $inicio && $fechaAniversario <= $fin) {
                $ley = $l;
                break;
            }
        }

        if ($ley) {
            $rangoValido = null;
            foreach ($ley['tabla_dias'] as $r) {
                $inicioRango = (int)$r['anios_antiguedad_inicio'];
                if ($anios >= $inicioRango) {
                    if (!$rangoValido || $inicioRango > (int)$rangoValido['anios_antiguedad_inicio']) {
                        $rangoValido = $r;
                    }
                }
            }

            if ($rangoValido) {
                $diasDerecho = (int)$rangoValido['dias_vacaciones_correspondientes'];
                $saldoAcumulado += $diasDerecho;
                $movimientos[] = [
                    'concepto' => 'Aniversario laboral al finalizar la jornada',
                    'fecha_registro' => $fechaAniversario->format('Y-m-d'),
                    'dias_movimiento' => $diasDerecho,
                    'saldo_resultante' => $saldoAcumulado
                ];
            }
        }
    }

    // Calcular último aniversario correctamente
    $ultimoAnivNum = count($movimientos) - 1;
    $ultimoAniversario = new DateTime($fechaIngreso->format('Y-m-d'));
    $ultimoAniversario->modify("+$ultimoAnivNum years");
    if ($ultimoAniversario < $hoy && $empleado['id_status'] == 1) {
        $diffDays = $ultimoAniversario->diff($hoy)->days;
        $proximoAnio = count($movimientos);
        $leyActual = end($todasLasLeyes);
        $rangoProximo = null;
        foreach ($leyActual['tabla_dias'] as $r) {
            if ($proximoAnio >= (int)$r['anios_antiguedad_inicio']) {
                if (!$rangoProximo || (int)$r['anios_antiguedad_inicio'] > (int)$rangoProximo['anios_antiguedad_inicio']) {
                    $rangoProximo = $r;
                }
            }
        }
        if ($rangoProximo) {
            $proximoAnivFecha = clone $ultimoAniversario;
            $proximoAnivFecha->modify('+1 year');
            $diasDelAnio = $ultimoAniversario->diff($proximoAnivFecha)->days;
            $diasProporcionales = ($diffDays / $diasDelAnio) * (int)$rangoProximo['dias_vacaciones_correspondientes'];
            $saldoAcumulado += $diasProporcionales;
            $movimientos[] = [
                'concepto' => 'Proporción último año',
                'fecha_registro' => $hoy->format('Y-m-d'),
                'dias_movimiento' => $diasProporcionales,
                'saldo_resultante' => $saldoAcumulado,
                'observaciones' => "Cálculo automático: {$diffDays} días transcurridos de un año de {$diasDelAnio} días"
            ];
        }
    }
    return $movimientos;
}

// Obtener todas las leyes LFT primero
$todasLasLeyes = obtenerTodoLftPHP($conexion);

// Obtener movimientos del kardex REAL de la base de datos
$sql_kardex = "SELECT * FROM kardex_vacaciones 
               WHERE id_empleado = '$id_empleado'
               ORDER BY num_ciclo ASC, fecha_registro ASC";
$result_kardex = mysqli_query($conexion, $sql_kardex);
$movimientos_bd = [];
while ($row = mysqli_fetch_assoc($result_kardex)) $movimientos_bd[] = $row;

// ========== CONSTRUIR LISTA DE MOVIMIENTOS EXACTAMENTE COMO EL SISTEMA ==========
$listaModificada = [];

if (!empty($movimientos_bd)) {
    // Hay datos en la base de datos, usarlos
    $listaModificada[] = [
        'num_ciclo' => 1,
        'concepto' => 'Vacaciones tomadas antes del registro del empleado',
        'fecha_registro' => '',
        'dias_movimiento' => 0.000,
        'saldo_resultante' => 0.000,
        'observaciones' => 'Saldo inicial de apertura'
    ];

    foreach ($movimientos_bd as $m) {
        if ($m['concepto'] !== 'Vacaciones tomadas antes del registro del empleado') {
            $fecha_registro = explode(' ', $m['fecha_registro'])[0];
            $listaModificada[] = [
                'num_ciclo' => $m['num_ciclo'] ?? 1,
                'concepto' => $m['concepto'],
                'fecha_registro' => $fecha_registro,
                'fecha_inicio' => $m['fecha_inicio'],
                'fecha_fin' => $m['fecha_fin'],
                'dias_movimiento' => floatval($m['dias_movimiento']),
                'saldo_resultante' => floatval($m['saldo_resultante']),
                'observaciones' => $m['observaciones']
            ];
        }
    }

    // Agregar la Proporción del Último Año si el empleado sigue activo
    if ($empleado['id_status'] == 1) {
        $ultimoAnivFecha = new DateTime($empleado['fecha_ingreso_final']);
        $numAniversarios = 0;
        foreach ($listaModificada as $m) {
            if (str_contains($m['concepto'], 'Aniversario laboral')) {
                $numAniversarios++;
                $f = new DateTime($m['fecha_registro']);
                if ($f > $ultimoAnivFecha) {
                    $ultimoAnivFecha = $f;
                }
            }
        }

        $hoy = new DateTime();
        if ($ultimoAnivFecha < $hoy) {
            $diffDays = $ultimoAnivFecha->diff($hoy)->days;

            if (!empty($todasLasLeyes)) {
                $proximoAnio = $numAniversarios + 1;
                $leyActual = end($todasLasLeyes);
                $rangoProximo = null;
                foreach ($leyActual['tabla_dias'] as $r) {
                    if ($proximoAnio >= intval($r['anios_antiguedad_inicio'])) {
                        if (!$rangoProximo || intval($r['anios_antiguedad_inicio']) > intval($rangoProximo['anios_antiguedad_inicio'])) {
                            $rangoProximo = $r;
                        }
                    }
                }

                if ($rangoProximo) {
                    $proximoAnivFecha = clone $ultimoAnivFecha;
                    $proximoAnivFecha->modify('+1 year');
                    $diasDelAnio = $ultimoAnivFecha->diff($proximoAnivFecha)->days;
                    $diasProporcionales = ($diffDays / $diasDelAnio) * intval($rangoProximo['dias_vacaciones_correspondientes']);

                    $saldoUltimo = end($listaModificada)['saldo_resultante'];
                    $cicloActual = end($listaModificada)['num_ciclo'] ?? 1;

                    $listaModificada[] = [
                        'num_ciclo' => $cicloActual,
                        'concepto' => 'Proporción último año',
                        'fecha_registro' => $hoy->format('Y-m-d'),
                        'dias_movimiento' => $diasProporcionales,
                        'saldo_resultante' => $saldoUltimo + $diasProporcionales,
                        'observaciones' => "Cálculo automático: {$diffDays} días transcurridos de un año de {$diasDelAnio} días"
                    ];
                }
            }
        }
    }
} else {
    // No hay datos en la base de datos, generar kardex simulado
    $listaModificada = generarKardexSimuladoPHP($empleado, $todasLasLeyes);
}

// 4. Función para obtener Hitos Laborales (ingreso, reingresos, bajas)
function obtenerHitosLaborales($empleado, $historial_reingresos) {
    $hitos = [];

    // 1. Agregar Ingreso inicial
    if ($empleado['fecha_alta_empresa'] && $empleado['fecha_alta_empresa'] !== '0000-00-00') {
        $hitos[] = [
            'fecha' => $empleado['fecha_alta_empresa'],
            'tipo' => 'INGRESO',
            'concepto' => 'Ingreso del empleado',
            'observaciones' => 'Alta de empleado en la empresa'
        ];
    }

    // 2. Agregar Reingresos y Bajas
    if (!empty($historial_reingresos)) {
        foreach ($historial_reingresos as $h) {
            if ($h['fecha_reingreso'] && $h['fecha_reingreso'] !== '0000-00-00' && $h['fecha_reingreso'] !== $empleado['fecha_alta_empresa']) {
                $hitos[] = [
                    'fecha' => $h['fecha_reingreso'],
                    'tipo' => 'REINGRESO',
                    'concepto' => 'Reingreso del empleado',
                    'observaciones' => 'Reingreso a labores'
                ];
            }
            if ($h['fecha_salida'] && $h['fecha_salida'] !== '0000-00-00') {
                $hitos[] = [
                    'fecha' => $h['fecha_salida'],
                    'tipo' => 'BAJA',
                    'concepto' => 'Dada de baja del empleado',
                    'observaciones' => 'Baja del empleado / Fin de relación laboral'
                ];
            }
        }
    }

    // 3. Ordenar cronológicamente
    usort($hitos, function($a, $b) {
        return new DateTime($a['fecha']) <=> new DateTime($b['fecha']);
    });

    return $hitos;
}

// 5. Inyectar hitos laborales y recalcular saldo resultante
function inyectarYRecalcularKardex($movimientos, $empleado, $historial_reingresos) {
    $result = [];
    
    // Clonar para evitar mutar el original
    foreach ($movimientos as $idx => $m) {
        $result[] = $m;
    }

    // Obtener los hitos laborales
    $hitos = obtenerHitosLaborales($empleado, $historial_reingresos);

    // Mapear cada hito al formato de la tabla de kardex y agregarlo
    foreach ($hitos as $idx => $h) {
        $result[] = [
            'concepto' => $h['concepto'],
            'fecha_registro' => $h['fecha'],
            'fecha_inicio' => '',
            'fecha_fin' => '',
            'dias_movimiento' => 0.000,
            'saldo_resultante' => 0.000,
            'observaciones' => $h['observaciones'],
            'tipo_evento' => $h['tipo']
        ];
    }

    // Ordenar cronológicamente
    usort($result, function($a, $b) {
        // El saldo inicial siempre va al inicio
        if ($a['concepto'] === 'Vacaciones tomadas antes del registro del empleado') return -1;
        if ($b['concepto'] === 'Vacaciones tomadas antes del registro del empleado') return 1;

        // Si alguno no tiene fecha, lo dejamos al inicio (después del saldo inicial)
        if (empty($a['fecha_registro'])) return -1;
        if (empty($b['fecha_registro'])) return 1;

        $dateA = new DateTime($a['fecha_registro']);
        $dateB = new DateTime($b['fecha_registro']);
        if ($dateA != $dateB) {
            return $dateA <=> $dateB;
        }

        // Si la fecha es idéntica, priorizamos hitos
        $getPriority = function($item) {
            if (isset($item['tipo_evento']) && ($item['tipo_evento'] === 'INGRESO' || $item['tipo_evento'] === 'REINGRESO')) return 1;
            if (isset($item['tipo_evento']) && $item['tipo_evento'] === 'BAJA') return 3;
            return 2;
        };
        return $getPriority($a) - $getPriority($b);
    });

    // Recalcular saldo resultante por ciclo
    $saldoAcumuladoPorCiclo = [];
    foreach ($result as $idx => &$m) {
        $ciclo = $m['num_ciclo'] ?? null;
        if (!$ciclo) {
            if (!empty($m['fecha_registro'])) {
                // Obtener ciclo por fecha
                $ciclo = 1;
                if (!empty($historial_reingresos)) {
                    for ($i = 0; $i < count($historial_reingresos); $i++) {
                        $re = $historial_reingresos[$i];
                        if ($re['fecha_reingreso'] && $re['fecha_reingreso'] !== '0000-00-00') {
                            if (new DateTime($m['fecha_registro']) >= new DateTime($re['fecha_reingreso'])) {
                                $ciclo = $i + 2;
                            }
                        }
                    }
                }
            } else {
                $ciclo = 1;
            }
            $m['num_ciclo'] = $ciclo;
        }
        
        if (!isset($saldoAcumuladoPorCiclo[$ciclo])) {
            $saldoAcumuladoPorCiclo[$ciclo] = 0.000;
        }
        
        $saldoAcumuladoPorCiclo[$ciclo] += floatval($m['dias_movimiento'] ?? 0);
        $m['saldo_resultante'] = $saldoAcumuladoPorCiclo[$ciclo];
    }

    return $result;
}

$movimientos = inyectarYRecalcularKardex($listaModificada, $empleado, $historial_reingresos);

// Calcular totales a partir de los movimientos actualizados
$total_ganados = 0;
$total_utilizados = 0;
foreach ($movimientos as $mov) {
    $d = floatval($mov['dias_movimiento'] ?? 0);
    if ($d > 0) $total_ganados += $d;
    else $total_utilizados += abs($d);
}
$saldo_disponible = $total_ganados - $total_utilizados;

// ─────────────────────────────────────────────────────────────────────────────
// CLASE PDF
// ─────────────────────────────────────────────────────────────────────────────
class PDFKardex extends TCPDF
{
    public function Header()
    {
        // Título de la empresa
        $this->SetTextColor(...C_BLACK);
        $this->SetFont('helvetica', 'B', 13);
        $this->SetY(8);
        $this->Cell(0, 6, 'CITRICOS SAAO S.A DE C.V', 0, 1, 'C', false);

        // Subtítulo
        $this->SetFont('helvetica', 'B', 10);
        $this->Cell(0, 5, 'KARDEX DE VACACIONES', 0, 1, 'C', false);

        // Fecha de emisión
        $this->SetFont('helvetica', '', 8);
        $this->Cell(0, 5, 'Fecha de emisión: ' . date('d/m/Y'), 0, 1, 'R', false);
        
        $this->Ln(2);
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

function pdfSeccion(TCPDF $pdf, string $titulo): void
{
    $pdf->SetFillColor(...C_GREEN_MID);
    $pdf->SetTextColor(...C_WHITE);
    $pdf->SetFont('helvetica', 'B', 9);
    $pdf->Cell(0, 7, '  ' . $titulo, 0, 1, 'L', true);
    $pdf->SetTextColor(...C_BLACK);
}

function pdfFila(TCPDF $pdf, string $label, string $valor, float $wLabel = 55, string $align = 'L'): void
{
    $pdf->SetFillColor(...C_WHITE);
    $pdf->SetFont('helvetica', 'B', 8.5);
    $pdf->SetDrawColor(...C_BORDER);
    $pdf->Cell($wLabel, 6.5, ' ' . $label, 'B', 0, 'L', true);
    $pdf->SetFont('helvetica', '', 8.5);
    $pdf->Cell(0, 6.5, $valor . ' ', 'B', 1, $align, true);
}

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

function pdfSeparador(TCPDF $pdf): void
{
    $pdf->SetFillColor(...C_GREEN_LIGHT);
    $pdf->Cell(0, 3, '', 0, 1, 'L', true);
    $pdf->Ln(1);
}

// Helper para formato de fecha tipo "1 Jun 2009"
$formatDate = function($dateStr) {
    if (!$dateStr) return '---';
    $meses = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    $ts = strtotime($dateStr);
    return date('j', $ts) . ' ' . $meses[intval(date('n', $ts))] . ' ' . date('Y', $ts);
};

// ─────────────────────────────────────────────────────────────────────────────
// CREAR PDF
// ─────────────────────────────────────────────────────────────────────────────
$pdf = new PDFKardex('P', 'mm', 'A4', true, 'UTF-8', false);
$pdf->SetCreator('Sistema SAAO');
$pdf->SetAuthor('Sistema SAAO');
$pdf->SetTitle('Kardex de Vacaciones - ' . $empleado['nombre'] . ' ' . $empleado['ap_paterno']);
$pdf->SetSubject('Kardex de Vacaciones');

$pdf->SetMargins(12, 25, 12);
$pdf->SetHeaderMargin(5);
$pdf->SetFooterMargin(8);
$pdf->SetAutoPageBreak(true, 15);
$pdf->AddPage();

// ── SECCIÓN: DATOS DEL EMPLEADO ───────────────────────────────────────────────
pdfSeccion($pdf, 'DATOS DEL EMPLEADO');

$nombre_completo = trim($empleado['nombre'] . ' ' . $empleado['ap_paterno'] . ' ' . $empleado['ap_materno']);
pdfFila($pdf, 'Nombre Completo:', $nombre_completo);
pdfFilaDoble($pdf, 'Clave:', $empleado['clave_empleado'], 'Departamento:', $empleado['nombre_departamento'] ?: 'N/A');
pdfFilaDoble($pdf, 'Área:', $empleado['nombre_area'] ?: 'N/A', 'Fecha de Ingreso:', $formatDate($empleado['fecha_ingreso_final']));

pdfSeparador($pdf);

// ── RESUMEN DE VACACIONES ─────────────────────────────────────────────────────
pdfSeccion($pdf, 'RESUMEN DE VACACIONES');

$w_resumen = 62; // 3 columnas de 62mm
$h = 7;
$pdf->SetFillColor(...C_GREEN_LIGHT);
$pdf->SetTextColor(...C_BLACK);
$pdf->SetFont('helvetica', 'B', 8.5);
$pdf->SetDrawColor(...C_BORDER);

$pdf->Cell($w_resumen, $h, 'Días Totales Ganados', 1, 0, 'C', true);
$pdf->Cell($w_resumen, $h, 'Días Utilizados', 1, 0, 'C', true);
$pdf->Cell($w_resumen, $h, 'Saldo Disponible', 1, 1, 'C', true);

$pdf->SetFillColor(...C_WHITE);
$pdf->SetFont('helvetica', 'B', 10);
$pdf->Cell($w_resumen, $h, number_format($total_ganados, 2), 1, 0, 'C', true);
$pdf->Cell($w_resumen, $h, number_format($total_utilizados, 2), 1, 0, 'C', true);

$pdf->SetTextColor(...C_GREEN_DARK);
$pdf->Cell($w_resumen, $h, number_format($saldo_disponible, 2), 1, 1, 'C', true);
$pdf->SetTextColor(...C_BLACK);

pdfSeparador($pdf);

// ── PERÍODOS DE VACACIONES ────────────────────────────────────────────────────
if (!empty($periodos)) {
    pdfSeccion($pdf, 'PERÍODOS DE VACACIONES');

    // Encabezados de tabla
    $pdf->SetFont('helvetica', 'B', 8);
    $pdf->SetFillColor(...C_GREEN_LIGHT);
    // Aniversario(28), Años(15), Versión LFT(50), Derecho(22), Tomados(22), Saldo(22), Estatus(27) = 186
    $w_periodos = [28, 15, 50, 22, 22, 22, 27]; 
    
    $pdf->Cell($w_periodos[0], 7, 'Aniversario', 1, 0, 'C', true);
    $pdf->Cell($w_periodos[1], 7, 'Años', 1, 0, 'C', true);
    $pdf->Cell($w_periodos[2], 7, 'Versión LFT', 1, 0, 'C', true);
    $pdf->Cell($w_periodos[3], 7, 'Derecho', 1, 0, 'C', true);
    $pdf->Cell($w_periodos[4], 7, 'Tomados', 1, 0, 'C', true);
    $pdf->Cell($w_periodos[5], 7, 'Saldo', 1, 0, 'C', true);
    $pdf->Cell($w_periodos[6], 7, 'Estatus', 1, 1, 'C', true);
    
    // Datos
    $pdf->SetFont('helvetica', '', 8);
    $pdf->SetFillColor(...C_WHITE);
    
    // Fila 0: Alta del empleado
    $fecha_ingreso = $empleado['fecha_ingreso_final'];
    $pdf->Cell($w_periodos[0], 8, $formatDate($fecha_ingreso), 1, 0, 'C', true);
    $pdf->Cell($w_periodos[1], 8, '---', 1, 0, 'C', true);
    $pdf->Cell($w_periodos[2], 8, 'Alta de empleado en la empresa', 1, 0, 'L', true);
    $pdf->Cell($w_periodos[3], 8, '---', 1, 0, 'C', true);
    $pdf->Cell($w_periodos[4], 8, '---', 1, 0, 'C', true);
    $pdf->Cell($w_periodos[5], 8, '---', 1, 0, 'C', true);
    
    // Etiqueta "INGRESO" normal (texto azul, sin fondo)
    $pdf->SetTextColor(25, 118, 210); // Azul
    $pdf->SetFont('helvetica', 'B', 8);
    $pdf->Cell($w_periodos[6], 8, 'INGRESO', 1, 1, 'C', true);
    $pdf->SetTextColor(...C_BLACK);
    $pdf->SetFont('helvetica', '', 8);

    foreach ($periodos as $periodo) {
        $pdf->Cell($w_periodos[0], 8, $formatDate($periodo['fecha_aniversario']), 1, 0, 'C', true);
        $pdf->Cell($w_periodos[1], 8, $periodo['anios_antiguedad'], 1, 0, 'C', true);
        $pdf->Cell($w_periodos[2], 8, $periodo['nombre_version'] ?? 'Tabla LFT V1', 1, 0, 'L', true);
        
        $pdf->SetFont('helvetica', 'B', 8);
        $pdf->Cell($w_periodos[3], 8, number_format($periodo['dias_derecho'], 3), 1, 0, 'C', true);
        
        $pdf->SetFont('helvetica', '', 8);
        $pdf->SetTextColor(...C_RED);
        $pdf->Cell($w_periodos[4], 8, number_format($periodo['dias_tomados'], 3), 1, 0, 'C', true);
        
        $pdf->SetFont('helvetica', 'B', 8);
        $pdf->SetTextColor(...C_GREEN_DARK);
        $pdf->Cell($w_periodos[5], 8, number_format($periodo['saldo'], 3), 1, 0, 'C', true);
        
        $pdf->SetTextColor(...C_BLACK);
        $pdf->SetFont('helvetica', '', 8);
        $pdf->Cell($w_periodos[6], 8, $periodo['estatus'], 1, 1, 'C', true);
    }
    
    pdfSeparador($pdf);
}

// ── HISTORIAL DE MOVIMIENTOS ──────────────────────────────────────────────────
if (!empty($movimientos)) {
    pdfSeccion($pdf, 'HISTORIAL DE MOVIMIENTOS');
    
    // Encabezados de tabla
    $pdf->SetFont('helvetica', 'B', 7.5);
    $pdf->SetFillColor(...C_GREEN_LIGHT);
    $w_movimientos = [24, 70, 32, 16, 16, 28]; // Total = 186
    
    $pdf->Cell($w_movimientos[0], 8, 'FECHA REGISTRO', 1, 0, 'C', true);
    $pdf->Cell($w_movimientos[1], 8, 'CONCEPTO / OBSERVACIONES', 1, 0, 'L', true);
    $pdf->Cell($w_movimientos[2], 8, 'PERIODO VACACIONAL', 1, 0, 'C', true);
    $pdf->Cell($w_movimientos[3], 8, 'TIPO', 1, 0, 'C', true);
    $pdf->Cell($w_movimientos[4], 8, 'DÍAS', 1, 0, 'C', true);
    
    // MultiCell para Saldo Resultante con salto de línea
    $pdf->MultiCell($w_movimientos[5], 8, "SALDO\nRESULTANTE", 1, 'C', true, 1, '', '', true, 0, false, true, 8, 'M');
    
    $pdf->SetFillColor(...C_WHITE);
    $hRow = 11.5; // Alto de fila aumentado para soportar saltos de línea

    // Función auxiliar para dibujar una fila de historial
    $drawHistorialRow = function($mov) use ($pdf, $w_movimientos, $hRow, $formatDate) {
        $tipoEvento = $mov['tipo_evento'] ?? null;
        
        // Col 0: Fecha
        $pdf->SetFont('helvetica', '', 8);
        $pdf->SetTextColor(...C_BLACK);
        $pdf->Cell($w_movimientos[0], $hRow, $formatDate($mov['fecha_registro']), 1, 0, 'C', true);
        
        // Col 1: Concepto y Observaciones usando HTML para auto-wrap
        $x = $pdf->GetX(); $y = $pdf->GetY();
        
        $html = '<div style="line-height:1.15;font-family:helvetica;">';
        if ($tipoEvento) {
            if ($tipoEvento === 'INGRESO') {
                $html .= '<span style="font-weight:bold;color:#1976D2;font-size:8pt;">INGRESO</span> <span style="font-weight:bold;color:#1A1A1A;font-size:8pt;">' . htmlspecialchars($mov['concepto']) . '</span>';
            } elseif ($tipoEvento === 'REINGRESO') {
                $html .= '<span style="font-weight:bold;color:#17a2b8;font-size:8pt;">REINGRESO</span> <span style="font-weight:bold;color:#1A1A1A;font-size:8pt;">' . htmlspecialchars($mov['concepto']) . '</span>';
            } elseif ($tipoEvento === 'BAJA') {
                $html .= '<span style="font-weight:bold;color:#dc3545;font-size:8pt;">BAJA</span> <span style="font-weight:bold;color:#1A1A1A;font-size:8pt;">' . htmlspecialchars($mov['concepto']) . '</span>';
            }
        } else {
            $html .= '<span style="font-weight:bold;color:#1A1A1A;font-size:8pt;">' . htmlspecialchars($mov['concepto']) . '</span>';
        }
        $html .= '</div>';
        
        $pdf->writeHTMLCell($w_movimientos[1], $hRow, $x, $y, $html, 1, 0, true, true, 'L', true);
        
        // Volver a posición de Col 2
        $pdf->SetXY($x + $w_movimientos[1], $y);
        
        // Col 2: Periodo Vacacional
        $periodoTexto = '---';
        if (!empty($mov['fecha_inicio']) && !empty($mov['fecha_fin']) && $mov['fecha_inicio'] !== '0000-00-00') {
            $periodoTexto = $formatDate($mov['fecha_inicio']) . ' - ' . $formatDate($mov['fecha_fin']);
        }
        $pdf->SetTextColor(...C_BLACK);
        $pdf->SetFont('helvetica', '', 7.5);
        $pdf->Cell($w_movimientos[2], $hRow, $periodoTexto, 1, 0, 'C', true);
        
        // Col 3: Tipo
        $pdf->SetFont('helvetica', 'B', 8);
        if ($tipoEvento) {
            $pdf->SetTextColor(...C_BLACK);
            $pdf->Cell($w_movimientos[3], $hRow, '---', 1, 0, 'C', true);
        } else {
            $valorMov = floatval($mov['dias_movimiento'] ?? 0);
            if ($valorMov >= 0) {
                $pdf->SetTextColor(...C_GREEN_DARK);
                $pdf->Cell($w_movimientos[3], $hRow, 'ABONO', 1, 0, 'C', true);
            } else {
                $pdf->SetTextColor(...C_RED);
                $pdf->Cell($w_movimientos[3], $hRow, 'CARGO', 1, 0, 'C', true);
            }
        }
        
        // Col 4: Días
        if ($tipoEvento) {
            $pdf->SetTextColor(...C_BLACK);
            $pdf->SetFont('helvetica', '', 8);
            $pdf->Cell($w_movimientos[4], $hRow, '---', 1, 0, 'C', true);
        } else {
            $valorMov = floatval($mov['dias_movimiento'] ?? 0);
            if ($valorMov >= 0) {
                $pdf->SetTextColor(...C_GREEN_DARK);
                $pdf->SetFont('helvetica', 'B', 8);
                $pdf->Cell($w_movimientos[4], $hRow, '+' . number_format($valorMov, 3), 1, 0, 'C', true);
            } else {
                $pdf->SetTextColor(...C_RED);
                $pdf->SetFont('helvetica', 'B', 8);
                $pdf->Cell($w_movimientos[4], $hRow, '-' . number_format(abs($valorMov), 3), 1, 0, 'C', true);
            }
        }
        
        // Col 5: Saldo Resultante
        if ($tipoEvento) {
            $pdf->SetTextColor(...C_BLACK);
            $pdf->SetFont('helvetica', '', 8);
            $pdf->Cell($w_movimientos[5], $hRow, '---', 1, 1, 'C', true);
        } else {
            $pdf->SetTextColor(...C_BLACK);
            $pdf->SetFont('helvetica', 'B', 8);
            $pdf->Cell($w_movimientos[5], $hRow, number_format(floatval($mov['saldo_resultante'] ?? 0), 3), 1, 1, 'C', true);
        }
    };

    // Iterar Movimientos
    foreach ($movimientos as $mov) {
        $drawHistorialRow($mov);
    }
}

// Limpiar buffer y enviar PDF
if (ob_get_contents()) ob_end_clean();
$pdf->Output('Kardex_Vacaciones_' . $empleado['clave_empleado'] . '.pdf', 'I');
