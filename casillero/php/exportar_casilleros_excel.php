<?php
/**
 * SISTEMA SAAO - Módulo de Casilleros
 * Exportar reporte de casilleros ocupados y compartidos a Excel (.xlsx)
 * Utiliza PhpOffice\PhpSpreadsheet con diseño limpio y ligero
 */
require_once __DIR__ . '/../../conexion/conexion.php';
require_once __DIR__ . '/../../vendor/autoload.php';
require_once __DIR__ . '/../../public/php/verificarSesion.php';
verificarSesion();

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;

// Validar conexión
if (!isset($conexion) || !($conexion instanceof mysqli)) {
    die("Error: No se pudo conectar a la base de datos.");
}

$tipo = isset($_GET['tipo']) ? trim($_GET['tipo']) : 'completo';

// 1. Obtener todos los casilleros y sus empleados asignados
$sql = "SELECT 
            ec.num_casillero,
            e.id_empleado,
            COALESCE(e.clave_empleado, '') AS clave_empleado,
            e.nombre,
            e.ap_paterno,
            COALESCE(e.ap_materno, '') AS ap_materno
        FROM empleado_casillero ec
        INNER JOIN info_empleados e ON ec.id_empleado = e.id_empleado
        ORDER BY 
            CAST(REGEXP_REPLACE(ec.num_casillero, '[^0-9]', '') AS UNSIGNED),
            ec.num_casillero,
            ec.id_empleado ASC";

$result = $conexion->query($sql);
if (!$result) {
    die("Error al consultar la base de datos: " . $conexion->error);
}

// Agrupar por número de casillero
$casillerosOcupados = [];
$totalAsignaciones = 0;
while ($row = $result->fetch_assoc()) {
    $num = (string)$row['num_casillero'];
    if (!isset($casillerosOcupados[$num])) {
        $casillerosOcupados[$num] = [];
    }
    $casillerosOcupados[$num][] = $row;
    $totalAsignaciones++;
}

// Separar compartidos y parciales
$casillerosCompartidos = [];
$casillerosParciales   = [];

foreach ($casillerosOcupados as $num => $empleados) {
    if (count($empleados) >= 2) {
        $casillerosCompartidos[$num] = $empleados;
    } else {
        $casillerosParciales[$num] = $empleados;
    }
}

// Conteo total de casilleros registrados en el sistema
$totalCasillerosSistema = 0;
$resTotal = $conexion->query("SELECT COUNT(*) AS total FROM casilleros");
if ($resTotal && $rowT = $resTotal->fetch_assoc()) {
    $totalCasillerosSistema = (int)$rowT['total'];
}
$totalDisponibles = max(0, $totalCasillerosSistema - count($casillerosOcupados));

// 2. Crear documento Spreadsheet
$spreadsheet = new Spreadsheet();
$spreadsheet->getProperties()
    ->setCreator("Sistema SAAO")
    ->setLastModifiedBy("Sistema SAAO")
    ->setTitle("Reporte de Casilleros - Sistema SAAO")
    ->setSubject("Reporte de Casilleros Ocupados y Compartidos")
    ->setDescription("Generado automáticamente desde el módulo de Casilleros del Sistema SAAO.");

// ─── Estilos limpios y ligeros ─────────────────────────────────────────────────

$styleTitulo = [
    'font' => ['name' => 'Segoe UI', 'bold' => true, 'size' => 12, 'color' => ['rgb' => '1B4332']],
    'alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT, 'vertical' => Alignment::VERTICAL_CENTER],
];

$styleSubtitulo = [
    'font' => ['name' => 'Segoe UI', 'size' => 9, 'color' => ['rgb' => '6B7280']],
    'alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT, 'vertical' => Alignment::VERTICAL_CENTER],
];

$styleHeader = [
    'font' => [
        'name' => 'Segoe UI',
        'bold' => true,
        'color' => ['rgb' => '1B4332'],
        'size' => 9.5,
    ],
    'fill' => [
        'fillType' => Fill::FILL_SOLID,
        'startColor' => ['rgb' => 'E8F5E9'],
    ],
    'alignment' => [
        'horizontal' => Alignment::HORIZONTAL_CENTER,
        'vertical' => Alignment::VERTICAL_CENTER,
    ],
    'borders' => [
        'bottom' => [
            'borderStyle' => Border::BORDER_MEDIUM,
            'color' => ['rgb' => '2D6A4F'],
        ],
    ],
];

$styleData = [
    'font' => [
        'name' => 'Segoe UI',
        'size' => 9.5,
        'color' => ['rgb' => '374151'],
    ],
    'alignment' => [
        'vertical' => Alignment::VERTICAL_CENTER,
    ],
    'borders' => [
        'bottom' => [
            'borderStyle' => Border::BORDER_HAIR,
            'color' => ['rgb' => 'E5E7EB'],
        ],
    ],
];

$styleRowAlt = [
    'fill' => [
        'fillType' => Fill::FILL_SOLID,
        'startColor' => ['rgb' => 'F9FAFB'],
    ],
];

$fechaDescarga = date('d/m/Y H:i');

// ══════════════════════════════════════════════════════════════════════════════
// HOJA 1: CASILLEROS COMPARTIDOS (2 EMPLEADOS)
// ══════════════════════════════════════════════════════════════════════════════
if ($tipo === 'completo' || $tipo === 'compartidos') {
    $sheet1 = $spreadsheet->getActiveSheet();
    $sheet1->setTitle('Compartidos');

    // Título
    $sheet1->mergeCells('A1:H1');
    $sheet1->setCellValue('A1', 'Casilleros Compartidos (2 Empleados)');
    $sheet1->getStyle('A1')->applyFromArray($styleTitulo);
    $sheet1->getRowDimension(1)->setRowHeight(28);

    // Subtítulo
    $sheet1->mergeCells('A2:H2');
    $sheet1->setCellValue('A2', count($casillerosCompartidos) . ' casilleros compartidos  •  ' . $fechaDescarga);
    $sheet1->getStyle('A2')->applyFromArray($styleSubtitulo);
    $sheet1->getRowDimension(2)->setRowHeight(18);

    // Fila de sub-encabezados (Empleado 1 / Empleado 2)
    $sheet1->getRowDimension(3)->setRowHeight(18);

    // Cabecera
    $headers1 = [
        'A4' => '#',
        'B4' => 'Casillero',
        'C4' => 'Clave',
        'D4' => 'Nombre',
        'E4' => 'Apellidos',
        'F4' => 'Clave',
        'G4' => 'Nombre',
        'H4' => 'Apellidos',
    ];

    foreach ($headers1 as $cell => $txt) {
        $sheet1->setCellValue($cell, $txt);
    }
    $sheet1->getStyle('A4:H4')->applyFromArray($styleHeader);
    $sheet1->getRowDimension(4)->setRowHeight(24);

    // Sub-encabezados agrupados (Empleado 1 / Empleado 2)
    $sheet1->mergeCells('C3:E3');
    $sheet1->setCellValue('C3', 'Empleado 1');
    $sheet1->getStyle('C3:E3')->applyFromArray([
        'font' => ['name' => 'Segoe UI', 'bold' => true, 'size' => 8.5, 'color' => ['rgb' => '2D6A4F']],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
    ]);

    $sheet1->mergeCells('F3:H3');
    $sheet1->setCellValue('F3', 'Empleado 2');
    $sheet1->getStyle('F3:H3')->applyFromArray([
        'font' => ['name' => 'Segoe UI', 'bold' => true, 'size' => 8.5, 'color' => ['rgb' => '40916C']],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
    ]);

    // Separador vertical solo en la cabecera de columnas (fila 4)
    $sheet1->getStyle('E4')->applyFromArray([
        'borders' => ['right' => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['rgb' => '1B4332']]],
    ]);

    // Llenar datos
    $fila = 5;
    $idx = 1;
    if (empty($casillerosCompartidos)) {
        $sheet1->mergeCells("A5:H5");
        $sheet1->setCellValue('A5', 'No hay casilleros compartidos registrados.');
        $sheet1->getStyle('A5')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet1->getStyle('A5')->getFont()->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('9CA3AF'));
    } else {
        foreach ($casillerosCompartidos as $num => $empleados) {
            $e1 = $empleados[0];
            $e2 = $empleados[1] ?? [];

            $apellidos1 = trim($e1['ap_paterno'] . ' ' . ($e1['ap_materno'] ?? ''));
            $apellidos2 = !empty($e2) ? trim($e2['ap_paterno'] . ' ' . ($e2['ap_materno'] ?? '')) : '-';

            $sheet1->setCellValue("A{$fila}", $idx++);
            $sheet1->setCellValue("B{$fila}", $num);
            $sheet1->setCellValue("C{$fila}", $e1['clave_empleado'] ?: $e1['id_empleado']);
            $sheet1->setCellValue("D{$fila}", $e1['nombre']);
            $sheet1->setCellValue("E{$fila}", $apellidos1);

            $sheet1->setCellValue("F{$fila}", !empty($e2) ? ($e2['clave_empleado'] ?: $e2['id_empleado']) : '-');
            $sheet1->setCellValue("G{$fila}", !empty($e2) ? $e2['nombre'] : '-');
            $sheet1->setCellValue("H{$fila}", $apellidos2);

            $sheet1->getStyle("A{$fila}:H{$fila}")->applyFromArray($styleData);
            $sheet1->getStyle("A{$fila}:B{$fila}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet1->getStyle("C{$fila}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet1->getStyle("F{$fila}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

            $sheet1->getStyle("B{$fila}")->getFont()->setBold(true);

            // Separador vertical entre Empleado 1 y Empleado 2
            $sheet1->getStyle("E{$fila}")->applyFromArray([
                'borders' => ['right' => ['borderStyle' => Border::BORDER_MEDIUM, 'color' => ['rgb' => '2D6A4F']]],
            ]);

            if ($idx % 2 === 0) {
                $sheet1->getStyle("A{$fila}:H{$fila}")->applyFromArray($styleRowAlt);
            }
            $sheet1->getRowDimension($fila)->setRowHeight(20);
            $fila++;
        }
    }

    // Anchos fijos limpios
    $sheet1->getColumnDimension('A')->setWidth(5);
    $sheet1->getColumnDimension('B')->setWidth(11);
    $sheet1->getColumnDimension('C')->setWidth(12);
    $sheet1->getColumnDimension('D')->setWidth(18);
    $sheet1->getColumnDimension('E')->setWidth(22);
    $sheet1->getColumnDimension('F')->setWidth(12);
    $sheet1->getColumnDimension('G')->setWidth(18);
    $sheet1->getColumnDimension('H')->setWidth(22);
    // Sin freezePane para que las cabeceras se desplacen normalmente
}

// ══════════════════════════════════════════════════════════════════════════════
// HOJA 2: CASILLEROS CON 1 EMPLEADO (PARCIALES)
// ══════════════════════════════════════════════════════════════════════════════
if ($tipo === 'completo' || $tipo === 'parciales') {
    $sheet2 = ($tipo === 'parciales') ? $spreadsheet->getActiveSheet() : $spreadsheet->createSheet();
    $sheet2->setTitle('Ocupados (1 Empleado)');

    // Título
    $sheet2->mergeCells('A1:F1');
    $sheet2->setCellValue('A1', 'Casilleros con 1 Empleado');
    $sheet2->getStyle('A1')->applyFromArray($styleTitulo);
    $sheet2->getRowDimension(1)->setRowHeight(28);

    // Subtítulo
    $sheet2->mergeCells('A2:F2');
    $sheet2->setCellValue('A2', count($casillerosParciales) . ' casilleros con 1 lugar disponible  •  ' . $fechaDescarga);
    $sheet2->getStyle('A2')->applyFromArray($styleSubtitulo);
    $sheet2->getRowDimension(2)->setRowHeight(18);

    // Fila vacía separadora
    $sheet2->getRowDimension(3)->setRowHeight(6);

    // Cabecera
    $headers2 = [
        'A4' => '#',
        'B4' => 'Casillero',
        'C4' => 'Clave',
        'D4' => 'Nombre',
        'E4' => 'Apellidos',
    ];

    foreach ($headers2 as $cell => $txt) {
        $sheet2->setCellValue($cell, $txt);
    }
    $sheet2->getStyle('A4:E4')->applyFromArray($styleHeader);
    $sheet2->getRowDimension(4)->setRowHeight(24);

    $fila = 5;
    $idx = 1;
    if (empty($casillerosParciales)) {
        $sheet2->mergeCells("A5:E5");
        $sheet2->setCellValue('A5', 'No hay casilleros con 1 empleado actualmente.');
        $sheet2->getStyle('A5')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet2->getStyle('A5')->getFont()->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('9CA3AF'));
    } else {
        foreach ($casillerosParciales as $num => $empleados) {
            $e = $empleados[0];
            $apellidos = trim($e['ap_paterno'] . ' ' . ($e['ap_materno'] ?? ''));

            $sheet2->setCellValue("A{$fila}", $idx++);
            $sheet2->setCellValue("B{$fila}", $num);
            $sheet2->setCellValue("C{$fila}", $e['clave_empleado'] ?: $e['id_empleado']);
            $sheet2->setCellValue("D{$fila}", $e['nombre']);
            $sheet2->setCellValue("E{$fila}", $apellidos);

            $sheet2->getStyle("A{$fila}:E{$fila}")->applyFromArray($styleData);
            $sheet2->getStyle("A{$fila}:C{$fila}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            $sheet2->getStyle("B{$fila}")->getFont()->setBold(true);

            if ($idx % 2 === 0) {
                $sheet2->getStyle("A{$fila}:E{$fila}")->applyFromArray($styleRowAlt);
            }
            $sheet2->getRowDimension($fila)->setRowHeight(20);
            $fila++;
        }
    }

    $sheet2->getColumnDimension('A')->setWidth(5);
    $sheet2->getColumnDimension('B')->setWidth(11);
    $sheet2->getColumnDimension('C')->setWidth(12);
    $sheet2->getColumnDimension('D')->setWidth(18);
    $sheet2->getColumnDimension('E')->setWidth(24);
    // Sin freezePane
}

// ══════════════════════════════════════════════════════════════════════════════
// HOJA 3: TODOS LOS CASILLEROS OCUPADOS (LISTA CONSOLIDADA)
// ══════════════════════════════════════════════════════════════════════════════
if ($tipo === 'completo' || $tipo === 'todos_ocupados') {
    $sheet3 = ($tipo === 'todos_ocupados') ? $spreadsheet->getActiveSheet() : $spreadsheet->createSheet();
    $sheet3->setTitle('Todos los Ocupados');

    // Título
    $sheet3->mergeCells('A1:F1');
    $sheet3->setCellValue('A1', 'Consolidado - Todos los Casilleros Ocupados');
    $sheet3->getStyle('A1')->applyFromArray($styleTitulo);
    $sheet3->getRowDimension(1)->setRowHeight(28);

    // Subtítulo
    $sheet3->mergeCells('A2:F2');
    $sheet3->setCellValue('A2', $totalAsignaciones . ' empleados en ' . count($casillerosOcupados) . ' casilleros  •  ' . $fechaDescarga);
    $sheet3->getStyle('A2')->applyFromArray($styleSubtitulo);
    $sheet3->getRowDimension(2)->setRowHeight(18);

    // Fila vacía separadora
    $sheet3->getRowDimension(3)->setRowHeight(6);

    $headers3 = [
        'A4' => '#',
        'B4' => 'Casillero',
        'C4' => 'Tipo',
        'D4' => 'Clave',
        'E4' => 'Nombre',
        'F4' => 'Apellidos',
    ];

    foreach ($headers3 as $cell => $txt) {
        $sheet3->setCellValue($cell, $txt);
    }
    $sheet3->getStyle('A4:F4')->applyFromArray($styleHeader);
    $sheet3->getRowDimension(4)->setRowHeight(24);

    $fila = 5;
    $idx = 1;
    if (empty($casillerosOcupados)) {
        $sheet3->mergeCells("A5:F5");
        $sheet3->setCellValue('A5', 'No hay casilleros ocupados actualmente.');
        $sheet3->getStyle('A5')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet3->getStyle('A5')->getFont()->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('9CA3AF'));
    } else {
        foreach ($casillerosOcupados as $num => $empleados) {
            $totalEnCasillero = count($empleados);
            $tipoOcupacion = ($totalEnCasillero >= 2) ? 'Compartido' : 'Individual';

            foreach ($empleados as $e) {
                $apellidos = trim($e['ap_paterno'] . ' ' . ($e['ap_materno'] ?? ''));

                $sheet3->setCellValue("A{$fila}", $idx++);
                $sheet3->setCellValue("B{$fila}", $num);
                $sheet3->setCellValue("C{$fila}", $tipoOcupacion);
                $sheet3->setCellValue("D{$fila}", $e['clave_empleado'] ?: $e['id_empleado']);
                $sheet3->setCellValue("E{$fila}", $e['nombre']);
                $sheet3->setCellValue("F{$fila}", $apellidos);

                $sheet3->getStyle("A{$fila}:F{$fila}")->applyFromArray($styleData);
                $sheet3->getStyle("A{$fila}:D{$fila}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                $sheet3->getStyle("B{$fila}")->getFont()->setBold(true);

                // Color sutil para el tipo
                if ($totalEnCasillero >= 2) {
                    $sheet3->getStyle("C{$fila}")->getFont()->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('B45309'));
                } else {
                    $sheet3->getStyle("C{$fila}")->getFont()->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('2D6A4F'));
                }

                if ($idx % 2 === 0) {
                    $sheet3->getStyle("A{$fila}:F{$fila}")->applyFromArray($styleRowAlt);
                }
                $sheet3->getRowDimension($fila)->setRowHeight(20);
                $fila++;
            }
        }
    }

    $sheet3->getColumnDimension('A')->setWidth(5);
    $sheet3->getColumnDimension('B')->setWidth(11);
    $sheet3->getColumnDimension('C')->setWidth(13);
    $sheet3->getColumnDimension('D')->setWidth(12);
    $sheet3->getColumnDimension('E')->setWidth(18);
    $sheet3->getColumnDimension('F')->setWidth(24);
    // Sin freezePane
}



// Configurar hoja activa
$spreadsheet->setActiveSheetIndex(0);

// Nombre del archivo de salida
$nombreArchivo = 'Casilleros_SAAO_' . date('Y-m-d') . '.xlsx';

// Enviar encabezados HTTP para descarga directa
header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
header('Content-Disposition: attachment; filename="' . $nombreArchivo . '"');
header('Cache-Control: max-age=0');
header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');
header('Last-Modified: ' . gmdate('D, d M Y H:i:s') . ' GMT');
header('Cache-Control: cache, must-revalidate');
header('Pragma: public');

$writer = new Xlsx($spreadsheet);
$writer->save('php://output');
exit;
