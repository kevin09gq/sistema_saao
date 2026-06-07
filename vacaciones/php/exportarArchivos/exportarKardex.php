<?php
//==================================================================================================
// GENERADOR DE REPORTE DE KARDEX DE VACACIONES EN PDF (TCPDF)
//==================================================================================================

require_once __DIR__ . '/../../../config/config.php';
require_once __DIR__ . '/../../../conexion/conexion.php';
require_once __DIR__ . '/../../../vendor/autoload.php';

// Verificar autenticación
if (!isset($_SESSION["logged_in"]) || $_SESSION["logged_in"] !== true) {
    http_response_code(401);
    echo 'Acceso no autorizado';
    exit;
}

$id_empleado = isset($_GET['id_empleado']) ? (int)$_GET['id_empleado'] : 0;
if ($id_empleado <= 0) {
    http_response_code(400);
    echo 'ID de empleado no válido';
    exit;
}

// 1. Obtener información de la Empresa
$sql_empresa = "SELECT id_empresa, nombre_empresa, logo_empresa, domicilio_fiscal FROM empresa ORDER BY id_empresa ASC LIMIT 1";
$res_empresa = mysqli_query($conexion, $sql_empresa);
$empresa = mysqli_fetch_assoc($res_empresa) ?? [];

// 2. Obtener información del Empleado
$sql_empleado = "SELECT 
            e.id_empleado,
            e.clave_empleado,
            e.nombre,
            e.ap_paterno,
            e.ap_materno,
            e.fecha_alta_empresa,
            e.id_status,
            e.salario_diario,
            e.imss,
            e.curp,
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
        WHERE e.id_empleado = '$id_empleado'";

$res_empleado = mysqli_query($conexion, $sql_empleado);
$empleado = mysqli_fetch_assoc($res_empleado);

if (!$empleado) {
    http_response_code(404);
    echo 'Empleado no encontrado';
    exit;
}

// Formatear nombres y datos básicos
$nombre_completo = mb_strtoupper($empleado['nombre'] . ' ' . $empleado['ap_paterno'] . ' ' . $empleado['ap_materno'], 'UTF-8');
$clave_empleado = $empleado['clave_empleado'];
$depto = mb_strtoupper($empleado['nombre_departamento'] ?? 'SIN DEPARTAMENTO', 'UTF-8');
$area = mb_strtoupper($empleado['nombre_area'] ?? 'SIN AREA', 'UTF-8');

// Meses en español para formatear fechas
function formatearFechaEspanol($fechaTexto) {
    if (empty($fechaTexto) || $fechaTexto == '0000-00-00') return '---';
    $meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
    $time = strtotime($fechaTexto);
    if (!$time) return $fechaTexto;
    return date('d', $time) . ' ' . $meses[date('n', $time) - 1] . ' ' . date('Y', $time);
}

// 3. Obtener Periodos y Hitos combinados
$hitos = [];
if (!empty($empleado['fecha_alta_empresa']) && $empleado['fecha_alta_empresa'] != '0000-00-00') {
    $hitos[] = [
        'fecha' => $empleado['fecha_alta_empresa'],
        'tipo' => 'INGRESO',
        'nombre_version' => 'Alta de empleado en la empresa',
        'dias_derecho' => '---',
        'dias_tomados' => '---',
        'saldo' => '---',
        'estatus' => 'INGRESO',
        'anios_antiguedad' => '---',
        'num_ciclo' => '---'
    ];
}

$sql_h = "SELECT fecha_reingreso, fecha_salida FROM historial_reingresos WHERE id_empleado = '$id_empleado' ORDER BY fecha_reingreso ASC";
$res_h = mysqli_query($conexion, $sql_h);
while ($h = mysqli_fetch_assoc($res_h)) {
    if (!empty($h['fecha_reingreso']) && $h['fecha_reingreso'] != '0000-00-00' && $h['fecha_reingreso'] != $empleado['fecha_alta_empresa']) {
        $hitos[] = [
            'fecha' => $h['fecha_reingreso'],
            'tipo' => 'REINGRESO',
            'nombre_version' => 'Reingreso a labores',
            'dias_derecho' => '---',
            'dias_tomados' => '---',
            'saldo' => '---',
            'estatus' => 'REINGRESO',
            'anios_antiguedad' => '---',
            'num_ciclo' => '---'
        ];
    }
    if (!empty($h['fecha_salida']) && $h['fecha_salida'] != '0000-00-00') {
        $hitos[] = [
            'fecha' => $h['fecha_salida'],
            'tipo' => 'BAJA',
            'nombre_version' => 'Baja del empleado / Fin de relación laboral',
            'dias_derecho' => '---',
            'dias_tomados' => '---',
            'saldo' => '---',
            'estatus' => 'BAJA',
            'anios_antiguedad' => '---',
            'num_ciclo' => '---'
        ];
    }
}

$periodos = [];
$sql_periodos = "SELECT p.*, v.nombre_version 
                 FROM vacaciones_periodos p
                 JOIN versiones_vacaciones_lft v ON p.id_version_vacaciones = v.id_version_vacaciones
                 WHERE p.id_empleado = '$id_empleado'
                 ORDER BY p.num_ciclo ASC, p.fecha_aniversario ASC";
$res_periodos = mysqli_query($conexion, $sql_periodos);
while ($p = mysqli_fetch_assoc($res_periodos)) {
    $periodos[] = [
        'fecha' => $p['fecha_aniversario'],
        'tipo' => 'PERIODO',
        'nombre_version' => $p['nombre_version'],
        'dias_derecho' => number_format((float)$p['dias_derecho'], 3, '.', ','),
        'dias_tomados' => number_format((float)$p['dias_tomados'], 3, '.', ','),
        'saldo' => number_format((float)$p['saldo'], 3, '.', ','),
        'estatus' => $p['estatus'],
        'anios_antiguedad' => $p['anios_antiguedad'],
        'num_ciclo' => $p['num_ciclo']
    ];
}

$todos_periodos = array_merge($hitos, $periodos);
usort($todos_periodos, function($a, $b) {
    return strcmp($a['fecha'], $b['fecha']);
});

// 4. Obtener Movimientos del Kardex
$movimientos = [];
$movimientos[] = [
    'fecha' => '',
    'tipo_evento' => 'APERTURA',
    'concepto' => 'Vacaciones tomadas antes del registro del empleado',
    'observaciones' => 'Saldo inicial de apertura',
    'fecha_inicio' => '',
    'fecha_fin' => '',
    'dias_movimiento' => 0.000,
    'saldo_resultante' => 0.000,
    'num_ciclo' => 1
];

$sql_k = "SELECT * FROM kardex_vacaciones 
          WHERE id_empleado = '$id_empleado' AND concepto != 'Vacaciones tomadas antes del registro del empleado'
          ORDER BY num_ciclo ASC, fecha_registro ASC";
$res_k = mysqli_query($conexion, $sql_k);
while ($m = mysqli_fetch_assoc($res_k)) {
    $fecha_reg = explode(' ', $m['fecha_registro'])[0];
    $movimientos[] = [
        'fecha' => $fecha_reg,
        'tipo_evento' => 'MOVIMIENTO',
        'concepto' => $m['concepto'],
        'observaciones' => $m['observaciones'],
        'fecha_inicio' => $m['fecha_inicio'],
        'fecha_fin' => $m['fecha_fin'],
        'dias_movimiento' => (float)$m['dias_movimiento'],
        'saldo_resultante' => (float)$m['saldo_resultante'],
        'num_ciclo' => (int)$m['num_ciclo']
    ];
}

// Proporcional
$numAniversarios = 0;
$ultimoAnivFecha = new DateTime($empleado['fecha_ingreso_final']);
foreach ($movimientos as $m) {
    if (strpos($m['concepto'], 'Aniversario laboral') !== false) {
        $numAniversarios++;
        if (!empty($m['fecha'])) {
            $f = new DateTime($m['fecha']);
            if ($f > $ultimoAnivFecha) {
                $ultimoAnivFecha = $f;
            }
        }
    }
}

$hoy_dt = new DateTime();
if ($ultimoAnivFecha < $hoy_dt && (int)$empleado['id_status'] === 1) {
    $diffDays = $hoy_dt->diff($ultimoAnivFecha)->days;
    
    // Obtener leyes para proporcional
    $sql_v = "SELECT * FROM versiones_vacaciones_lft ORDER BY fecha_inicio_vigencia ASC";
    $res_v = mysqli_query($conexion, $sql_v);
    $leyes = [];
    while ($v = mysqli_fetch_assoc($res_v)) {
        $id_v = $v['id_version_vacaciones'];
        $sql_d = "SELECT * FROM dias_vacaciones_lft WHERE id_version_vacaciones = '$id_v' ORDER BY anios_antiguedad_inicio ASC";
        $res_d = mysqli_query($conexion, $sql_d);
        $v['tabla_dias'] = [];
        while ($d = mysqli_fetch_assoc($res_d)) {
            $v['tabla_dias'][] = $d;
        }
        $leyes[] = $v;
    }
    
    $proximoAnio = $numAniversarios + 1;
    $leyActual = !empty($leyes) ? $leyes[count($leyes) - 1] : null;
    
    if ($leyActual) {
        $rangoProximo = null;
        foreach ($leyActual['tabla_dias'] as $r) {
            if ($proximoAnio >= (int)$r['anios_antiguedad_inicio']) {
                if (!$rangoProximo || (int)$r['anios_antiguedad_inicio'] > (int)$rangoProximo['anios_antiguedad_inicio']) {
                    $rangoProximo = $r;
                }
            }
        }
        
        if ($rangoProximo) {
            $proximoAnivFecha = clone $ultimoAnivFecha;
            $proximoAnivFecha->modify('+1 year');
            
            $diasDelAnio = $proximoAnivFecha->diff($ultimoAnivFecha)->days;
            if ($diasDelAnio <= 0) $diasDelAnio = 365;
            
            $diasProporcionales = ($diffDays / $diasDelAnio) * (int)$rangoProximo['dias_vacaciones_correspondientes'];
            
            $ultimoMov = end($movimientos);
            $saldoUltimo = $ultimoMov ? $ultimoMov['saldo_resultante'] : 0.0;
            $cicloActualMov = $ultimoMov ? $ultimoMov['num_ciclo'] : 1;
            
            $movimientos[] = [
                'fecha' => $hoy_dt->format('Y-m-d'),
                'tipo_evento' => 'MOVIMIENTO',
                'concepto' => 'Proporción último año',
                'observaciones' => "Cálculo automático: {$diffDays} días transcurridos de un año de {$diasDelAnio} días",
                'fecha_inicio' => '',
                'fecha_fin' => '',
                'dias_movimiento' => $diasProporcionales,
                'saldo_resultante' => $saldoUltimo + $diasProporcionales,
                'num_ciclo' => $cicloActualMov
            ];
        }
    }
}

// Agregar Hitos de Reingreso y Baja en el Kardex
$hitos_kardex = [];
if (!empty($empleado['fecha_alta_empresa']) && $empleado['fecha_alta_empresa'] != '0000-00-00') {
    $hitos_kardex[] = [
        'fecha' => $empleado['fecha_alta_empresa'],
        'tipo_evento' => 'INGRESO',
        'concepto' => 'Ingreso del empleado',
        'observaciones' => 'Alta de empleado en la empresa',
        'fecha_inicio' => '',
        'fecha_fin' => '',
        'dias_movimiento' => 0.0,
        'saldo_resultante' => 0.0
    ];
}

$res_h_k = mysqli_query($conexion, $sql_h);
while ($h = mysqli_fetch_assoc($res_h_k)) {
    if (!empty($h['fecha_reingreso']) && $h['fecha_reingreso'] != '0000-00-00' && $h['fecha_reingreso'] != $empleado['fecha_alta_empresa']) {
        $hitos_kardex[] = [
            'fecha' => $h['fecha_reingreso'],
            'tipo_evento' => 'REINGRESO',
            'concepto' => 'Reingreso del empleado',
            'observaciones' => 'Reingreso a labores',
            'fecha_inicio' => '',
            'fecha_fin' => '',
            'dias_movimiento' => 0.0,
            'saldo_resultante' => 0.0
        ];
    }
    if (!empty($h['fecha_salida']) && $h['fecha_salida'] != '0000-00-00') {
        $hitos_kardex[] = [
            'fecha' => $h['fecha_salida'],
            'tipo_evento' => 'BAJA',
            'concepto' => 'Dada de baja del empleado',
            'observaciones' => 'Baja del empleado / Fin de relación laboral',
            'fecha_inicio' => '',
            'fecha_fin' => '',
            'dias_movimiento' => 0.0,
            'saldo_resultante' => 0.0
        ];
    }
}

$todos_movs = array_merge($hitos_kardex, $movimientos);

usort($todos_movs, function($a, $b) {
    if ($a['concepto'] === 'Vacaciones tomadas antes del registro del empleado') return -1;
    if ($b['concepto'] === 'Vacaciones tomadas antes del registro del empleado') return 1;
    
    if (empty($a['fecha'])) return -1;
    if (empty($b['fecha'])) return 1;
    
    $dateA = strtotime($a['fecha']);
    $dateB = strtotime($b['fecha']);
    if ($dateA !== $dateB) {
        return $dateA - $dateB;
    }
    
    $getPriority = function($item) {
        if ($item['tipo_evento'] === 'INGRESO' || $item['tipo_evento'] === 'REINGRESO') return 1;
        if ($item['tipo_evento'] === 'BAJA') return 3;
        return 2;
    };
    return $getPriority($a) - $getPriority($b);
});

// Obtener Ciclo por Fecha
function getCicloPorFechaLocal($fecha, $id_emp, $fecha_alta, $conexion) {
    $sql_h = "SELECT fecha_reingreso, fecha_salida FROM historial_reingresos WHERE id_empleado = '$id_emp' ORDER BY fecha_reingreso ASC";
    $res_h = mysqli_query($conexion, $sql_h);
    if (mysqli_num_rows($res_h) === 0) {
        return 1;
    }
    $ciclo = 1;
    $idx = 0;
    while ($re = mysqli_fetch_assoc($res_h)) {
        $idx++;
        if (!empty($re['fecha_reingreso']) && $re['fecha_reingreso'] != '0000-00-00') {
            if (strtotime($fecha) >= strtotime($re['fecha_reingreso'])) {
                $ciclo = $idx + 1;
            }
        }
    }
    return $ciclo;
}

// Recalcular saldos de movimientos
$saldoAcumuladoPorCiclo = [];
foreach ($todos_movs as &$m) {
    $ciclo = isset($m['num_ciclo']) ? $m['num_ciclo'] : null;
    if (!$ciclo) {
        if (!empty($m['fecha'])) {
            $ciclo = getCicloPorFechaLocal($m['fecha'], $id_empleado, $empleado['fecha_alta_empresa'], $conexion);
        } else {
            $ciclo = 1;
        }
        $m['num_ciclo'] = $ciclo;
    }
    
    if (!isset($saldoAcumuladoPorCiclo[$ciclo])) {
        $saldoAcumuladoPorCiclo[$ciclo] = 0.000;
    }
    
    $saldoAcumuladoPorCiclo[$ciclo] += (float)$m['dias_movimiento'];
    $m['saldo_resultante'] = $saldoAcumuladoPorCiclo[$ciclo];
}
unset($m);

// Extender TCPDF para personalizar cabecera y pie de página
class PDFKardex extends TCPDF
{
    public array $empresa = [];
    public string $nombreEmpleado = '';

    public function Header()
    {
        $logoPath = '';
        $logo = $this->empresa['logo_empresa'] ?? '';
        
        if (is_string($logo) && $logo !== '') {
            $cand = $logo;
            if (!preg_match('/^[A-Za-z]:\\\\/i', $cand) && strpos($cand, __DIR__) === false) {
                $cand = __DIR__ . '/../../../' . ltrim($cand, '/');
            }
            if (file_exists($cand)) {
                $logoPath = $cand;
            }
        }
        
        if ($logoPath === '') {
            $fallback = __DIR__ . '/../../../public/img/logo.jpg';
            if (file_exists($fallback)) {
                $logoPath = $fallback;
            }
        }

        if ($logoPath !== '') {
            $this->Image($logoPath, 15, 5, 22, 0, '', '', 'T', false, 300);
        }

        // Títulos
        $this->SetY(8);
        $this->SetFont('helvetica', 'B', 15);
        $this->SetTextColor(27, 67, 50); // Accent Green (#1b4332)
        $this->Cell(0, 8, 'SISTEMA SAAO', 0, 1, 'R');
        $this->SetFont('helvetica', 'B', 11);
        $this->SetTextColor(45, 106, 79); // Primary Green (#2d6a4f)
        $this->Cell(0, 5, 'KARDEX DE VACACIONES', 0, 1, 'R');
        $this->SetFont('helvetica', '', 9);
        $this->SetTextColor(108, 117, 125); // Muted grey
        $this->Cell(0, 5, 'Fecha de Emisión: ' . date('d/m/Y H:i'), 0, 1, 'R');

        // Línea divisoria horizontal verde
        $this->SetLineStyle(array('width' => 1, 'color' => array(45, 106, 79)));
        $this->Line(15, 29, 264, 29); // 279 - 15 = 264
    }

    public function Footer()
    {
        $this->SetY(-15);
        $this->SetFont('helvetica', 'I', 8);
        $this->SetTextColor(148, 163, 184); // slate-400
        $this->Cell(0, 10, 'Página ' . $this->getAliasNumPage() . ' de ' . $this->getAliasNbPages(), 0, 0, 'C');
    }
}

// Crear PDF en orientación Horizontal (Landscape 'L')
$pdf = new PDFKardex('L', 'mm', 'LETTER', true, 'UTF-8', false);
$pdf->empresa = $empresa;
$pdf->nombreEmpleado = $nombre_completo;

// Ajustes del Documento
$pdf->SetCreator('Sistema SAAO');
$pdf->SetAuthor('Sistema SAAO');
$pdf->SetTitle('Kardex de Vacaciones - ' . $pdf->nombreEmpleado);
$pdf->SetMargins(15, 33, 15);
$pdf->SetHeaderMargin(8);
$pdf->SetFooterMargin(15);
$pdf->SetAutoPageBreak(true, 18);
$pdf->AddPage();

// Escribir Contenido HTML
$html = '
<style>
    .section-title {
        font-family: helvetica;
        font-size: 11pt;
        font-weight: bold;
        color: #1b4332;
        margin-top: 16px;
        margin-bottom: 6px;
        padding: 4px 0;
        border-bottom: 1px solid #b7e4c7;
    }
    .info-table {
        border-collapse: collapse;
        width: 100%;
        margin-bottom: 12px;
        border: 1.5px solid #b7e4c7;
        background-color: #f4fbf7;
        font-family: helvetica;
        line-height: 1.6;
    }
    .info-table td {
        padding: 7px 10px;
        font-size: 10px;
    }
    .info-label {
        font-weight: bold;
        color: #1b4332;
        width: 15%;
        border-right: 1px solid #d8f3dc;
        border-bottom: 1px solid #d8f3dc;
    }
    .info-val {
        color: #1e3a2f;
        width: 35%;
        font-weight: bold;
        border-bottom: 1px solid #d8f3dc;
    }
    .data-table {
        border-collapse: collapse;
        width: 100%;
        margin-bottom: 12px;
        border: 1.5px solid #94d2b0;
        font-family: helvetica;
        line-height: 1.5;
    }
    .data-table th {
        font-weight: bold;
        background-color: #1b4332;
        color: #ffffff;
        font-size: 9px;
        padding: 7px 8px;
        border-right: 1px solid #2d6a4f;
        text-align: center;
        vertical-align: middle;
    }
    .data-table td {
        padding: 6px 8px;
        font-size: 9px;
        border-bottom: 1px solid #d4e8db;
        border-right: 1px solid #d4e8db;
        vertical-align: middle;
    }
    .data-table tr:nth-child(odd) td {
        background-color: #f8fdfb;
    }
    .data-table tr:nth-child(even) td {
        background-color: #ffffff;
    }
</style>
';

// 1. Ficha del Empleado (Solo Nombre, Clave, Área y Departamento)
$html .= '<table class="info-table" cellpadding="6">
    <tr>
        <td class="info-label">Clave Empleado:</td>
        <td class="info-val">' . htmlspecialchars($clave_empleado, ENT_QUOTES, 'UTF-8') . '</td>
        <td class="info-label">Nombre Empleado:</td>
        <td class="info-val">' . htmlspecialchars($pdf->nombreEmpleado, ENT_QUOTES, 'UTF-8') . '</td>
    </tr>
    <tr>
        <td class="info-label" style="border-bottom:none;">Área:</td>
        <td class="info-val" style="font-weight:normal; color:#343a40; border-bottom:none;">' . htmlspecialchars($area, ENT_QUOTES, 'UTF-8') . '</td>
        <td class="info-label" style="border-bottom:none;">Departamento:</td>
        <td class="info-val" style="font-weight:normal; color:#343a40; border-bottom:none;">' . htmlspecialchars($depto, ENT_QUOTES, 'UTF-8') . '</td>
    </tr>
</table>';

// 2. Tabla de Periodos (Sin Ciclos, Ley Aplicada y Estatus. Solo saldo número)
$html .= '<br><br><div class="section-title">Períodos de Vacaciones</div>';
$html .= '<table class="data-table" cellpadding="0">
    <thead>
        <tr>
            <th width="30%" align="center" style="padding: 8px 10px;">Fecha / Aniversario</th>
            <th width="15%" align="center" style="padding: 8px 10px;">Años</th>
            <th width="18%" align="center" style="padding: 8px 10px;">Derecho</th>
            <th width="18%" align="center" style="padding: 8px 10px;">Tomados</th>
            <th width="19%" align="center" style="padding: 8px 10px; border-right:none;">Saldo</th>
        </tr>
    </thead>
    <tbody>';

if (empty($todos_periodos)) {
    $html .= '<tr><td colspan="5" align="center" style="color: #6c757d; font-style: italic;">No se han registrado periodos de vacaciones.</td></tr>';
} else {
    foreach ($todos_periodos as $p) {
        if ($p['tipo'] !== 'PERIODO') {
            $badge_label = '';
            if ($p['tipo'] === 'INGRESO') {
                $badge_label = '<br/><span style="color: #2d6a4f; font-weight: bold; font-size: 8px;">INGRESO</span>';
            } elseif ($p['tipo'] === 'REINGRESO') {
                $badge_label = '<br/><span style="color: #0891b2; font-weight: bold; font-size: 8px;">REINGRESO</span>';
            } elseif ($p['tipo'] === 'BAJA') {
                $badge_label = '<br/><span style="color: #b91c1c; font-weight: bold; font-size: 8px;">BAJA</span>';
            }

            $html .= '<tr style="background-color:#fef9e7;">';
            $html .= '<td align="center" style="padding: 7px 10px; font-size: 9px; border-right: 1px solid #d4e8db;">' . formatearFechaEspanol($p['fecha']) . $badge_label . '</td>';
            $html .= '<td align="center" style="padding: 7px 10px; color: #6c757d; border-right: 1px solid #d4e8db;">---</td>';
            $html .= '<td align="center" style="padding: 7px 10px; color: #6c757d; border-right: 1px solid #d4e8db;">---</td>';
            $html .= '<td align="center" style="padding: 7px 10px; color: #6c757d; border-right: 1px solid #d4e8db;">---</td>';
            $html .= '<td align="center" style="padding: 7px 10px; color: #6c757d; border-right: none;">---</td>';
            $html .= '</tr>';
        } else {
            // Formatear años: "1 año", "2 años", etc.
            $anios_num = (int)$p['anios_antiguedad'];
            $anios_texto = $anios_num . ($anios_num === 1 ? ' año' : ' años');
            
            // Tomados: si es 0, mostrar celda vacía
            $tomados_val = (float)str_replace(',', '', $p['dias_tomados']);
            $tomados_mostrar = ($tomados_val == 0) ? '' : $p['dias_tomados'];
            
            $html .= '<tr>';
            $html .= '<td align="center" style="padding: 7px 10px; font-size: 9px; border-right: 1px solid #d4e8db;">' . formatearFechaEspanol($p['fecha']) . '</td>';
            $html .= '<td align="center" style="padding: 7px 10px; font-size: 10px; font-weight: bold; color: #1b4332; border-right: 1px solid #d4e8db;">' . htmlspecialchars($anios_texto, ENT_QUOTES, 'UTF-8') . '</td>';
                $html .= '<td align="center" style="padding: 7px 10px; border-right: 1px solid #d4e8db;">' . $p['dias_derecho'] . '</td>';
            $html .= '<td align="center" style="padding: 7px 10px; color: #dc2626; border-right: 1px solid #d4e8db;">' . $tomados_mostrar . '</td>';
            $html .= '<td align="center" style="padding: 7px 10px; color: #2d6a4f; font-weight: bold; border-right: none;">' . $p['saldo'] . '</td>';
            $html .= '</tr>';
        }
    }
}
$html .= '</tbody></table>';

// 3. Historial del Kardex (Sin la columna de Ciclos ni Tipo)
$html .= '<br><br><div class="section-title">Historial de Movimientos (Kardex)</div>';
$html .= '<table class="data-table" cellpadding="6">
    <thead>
        <tr>
            <th width="36mm" align="center">Fecha Reg.</th>
            <th width="116mm" align="left">Concepto / Observaciones</th>
            <th width="70mm" align="center">Periodo Relacionado</th>
            <th width="19mm" align="center">D&iacute;as</th>
            <th width="19mm" align="center" style="border-right:none;">Saldo</th>
        </tr>
    </thead>
    <tbody>';

if (empty($todos_movs)) {
    $html .= '<tr><td colspan="5" align="center" style="color: #6c757d; font-style: italic;">No hay movimientos en el Kardex.</td></tr>';
} else {
    foreach ($todos_movs as $m) {

        if (isset($m['tipo_evento']) && ($m['tipo_evento'] === 'INGRESO' || $m['tipo_evento'] === 'REINGRESO' || $m['tipo_evento'] === 'BAJA')) {
            $badge_label = '';
            if ($m['tipo_evento'] === 'INGRESO') {
                $badge_label = '<br><span style="color: #2d6a4f; font-weight: bold; font-size: 8px;">INGRESO</span>';
            } elseif ($m['tipo_evento'] === 'REINGRESO') {
                $badge_label = '<br><span style="color: #0891b2; font-weight: bold; font-size: 8px;">REINGRESO</span>';
            } elseif ($m['tipo_evento'] === 'BAJA') {
                $badge_label = '<br><span style="color: #b91c1c; font-weight: bold; font-size: 8px;">BAJA</span>';
            }

            $concepto_limpio = mb_strtoupper($m['concepto'], 'UTF-8');

            $html .= '<tr style="background-color:#fef9e7;">';
            $html .= '<td width="36mm" align="center" style="border-right: 1px solid #d4e8db;">' . formatearFechaEspanol($m['fecha']) . $badge_label . '</td>';
            $html .= '<td width="116mm" align="left" style="border-right: 1px solid #d4e8db;"><strong>' . $concepto_limpio . '</strong>' . (!empty($m['observaciones']) ? '<br><span style="color: #64748b; font-size: 8px;">' . mb_strtoupper($m['observaciones'], 'UTF-8') . '</span>' : '') . '</td>';
            $html .= '<td width="70mm" align="center" style="color: #6c757d; border-right: 1px solid #d4e8db;">---</td>';
            $html .= '<td width="19mm" align="center" style="color: #6c757d; border-right: 1px solid #d4e8db;">---</td>';
            $html .= '<td width="19mm" align="center" style="color: #6c757d; border-right: none;">---</td>';
            $html .= '</tr>';
        } else {
            $valorMov = (float)$m['dias_movimiento'];
            $saldoResult = (float)$m['saldo_resultante'];

            $dias_texto = ($valorMov >= 0) ? '+' . number_format($valorMov, 3) : number_format($valorMov, 3);
            $dias_style = ($valorMov >= 0) ? 'color: #16a34a; font-weight: bold;' : 'color: #dc2626; font-weight: bold;';

            $periodo_texto = (!empty($m['fecha_inicio']) && !empty($m['fecha_fin'])) ? formatearFechaEspanol($m['fecha_inicio']) . ' al ' . formatearFechaEspanol($m['fecha_fin']) : '---';

            // Limpiar concepto: remover cualquier " (Ciclo X)"
            $concepto_limpio = mb_strtoupper($m['concepto'], 'UTF-8');
            $concepto_limpio = preg_replace('/\s*\(CICLO\s+\d+\)/i', '', $concepto_limpio);
            $concepto_limpio = preg_replace('/\s*\(CICLO\s+[A-Z0-9_-]+\)/i', '', $concepto_limpio);

            // Omitir observaciones si es "Cálculo automático del sistema"
            $obs_mostrar = '';
            if (!empty($m['observaciones'])) {
                $obs_upper = mb_strtoupper($m['observaciones'], 'UTF-8');
                if ($obs_upper !== 'CÁLCULO AUTOMÁTICO DEL SISTEMA' && $obs_upper !== 'CALCULO AUTOMATICO DEL SISTEMA') {
                    $obs_mostrar = '<br><span style="color: #64748b; font-size: 8px; line-height: 1.5;">' . $obs_upper . '</span>';
                }
            }

            $html .= '<tr>';
            $html .= '<td width="36mm" align="center" style="border-right: 1px solid #d4e8db;">' . formatearFechaEspanol($m['fecha']) . '</td>';
            $html .= '<td width="116mm" align="left" style="border-right: 1px solid #d4e8db;"><strong>' . $concepto_limpio . '</strong>' . $obs_mostrar . '</td>';
            $html .= '<td width="70mm" align="center" style="border-right: 1px solid #d4e8db;">' . $periodo_texto . '</td>';
            $html .= '<td width="19mm" align="center" style="' . $dias_style . ' border-right: 1px solid #d4e8db;">' . $dias_texto . '</td>';
            $html .= '<td width="19mm" align="center" style="font-weight: bold; color: #1b4332; border-right: none;">' . number_format($saldoResult, 3) . '</td>';
            $html .= '</tr>';
        }
    }
}
$html .= '</tbody></table>';

// Escribir en el PDF
$pdf->writeHTML($html, true, false, true, false, '');

// Nombre del archivo de salida
$fileName = 'Kardex_' . $clave_empleado . '_' . date('YmdHis') . '.pdf';
$pdf->Output($fileName, 'I');
