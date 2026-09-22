<?php
require_once __DIR__ . '/../../vendor/autoload.php';
include_once __DIR__ . '/../../conexion/conexion.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Font;
use PhpOffice\PhpSpreadsheet\Style\Color;

/** @var mysqli $conexion */

// 1. Obtener parámetros de filtrado
$tipoExportacion  = $_GET['tipo_exportacion'] ?? $_POST['tipo_exportacion'] ?? 'general';
$idArea           = isset($_GET['id_area']) ? (int)$_GET['id_area'] : (isset($_POST['id_area']) ? (int)$_POST['id_area'] : -1);
$idDepartamento   = isset($_GET['id_departamento']) ? (int)$_GET['id_departamento'] : (isset($_POST['id_departamento']) ? (int)$_POST['id_departamento'] : -1);
$idStatus         = isset($_GET['id_status']) ? (int)$_GET['id_status'] : (isset($_POST['id_status']) ? (int)$_POST['id_status'] : -1);
$filtroAvance     = $_GET['filtro_avance'] ?? $_POST['filtro_avance'] ?? 'todos';
$idFaltaRequisito = isset($_GET['id_falta_requisito']) ? (int)$_GET['id_falta_requisito'] : (isset($_POST['id_falta_requisito']) ? (int)$_POST['id_falta_requisito'] : -1);

// Campos extras seleccionados por cada requisito (matriz extra_fields[id_exp][])
$extraFieldsReq = $_GET['extra_fields'] ?? $_POST['extra_fields'] ?? [];

// Columnas seleccionadas
$rawColumnas = $_GET['columnas'] ?? $_POST['columnas'] ?? 'todas';
$columnasSeleccionadas = [];
if (is_array($rawColumnas)) {
    $columnasSeleccionadas = array_map('intval', $rawColumnas);
} elseif (is_string($rawColumnas) && $rawColumnas !== 'todas' && trim($rawColumnas) !== '') {
    $columnasSeleccionadas = array_map('intval', explode(',', $rawColumnas));
}

// 2. Consultar catálogo de requisitos activos
$resCat = $conexion->query("SELECT id_expediente, nombre, tipo_dato, historial FROM catalogo_expediente WHERE activo = 1 ORDER BY nombre ASC");
$catalogoTodos = [];
$catalogoActivoIds = [];

if ($resCat) {
    while ($r = $resCat->fetch_assoc()) {
        $idExp = (int)$r['id_expediente'];
        $catalogoActivoIds[] = $idExp;
        $catalogoTodos[$idExp] = [
            'id_expediente' => $idExp,
            'nombre'        => $r['nombre'],
            'tipo_dato'     => $r['tipo_dato'],
            'historial'     => (bool)$r['historial']
        ];
    }
}

$totalRequisitosActivos = count($catalogoActivoIds);

// Filtrar catálogo según selección si es exportación personalizada
$catalogoExportar = [];
if (!empty($columnasSeleccionadas) && $columnasSeleccionadas !== 'todas') {
    foreach ($columnasSeleccionadas as $idSel) {
        if (isset($catalogoTodos[$idSel])) {
            $catalogoExportar[$idSel] = $catalogoTodos[$idSel];
        }
    }
} else {
    $catalogoExportar = $catalogoTodos;
}

// 3. Consultar datos de empleados
$whereClause = [];
if ($idArea > 0) {
    if ($idDepartamento > 0) {
        // Área y departamento específicos
        $whereClause[] = "e.id_area = " . $idArea;
        $whereClause[] = "e.id_departamento = " . $idDepartamento;
    } else {
        // Área específica pero todos los departamentos
        // Incluir empleados del área Y empleados sin área cuyo departamento pertenezca al área
        $deptosDelArea = [];
        $resDeptos = $conexion->query("SELECT id_departamento FROM areas_departamentos WHERE id_area = " . $idArea);
        if ($resDeptos) {
            while ($row = $resDeptos->fetch_assoc()) {
                $deptosDelArea[] = (int)$row['id_departamento'];
            }
        }
        
        if (!empty($deptosDelArea)) {
            $deptosStr = implode(',', $deptosDelArea);
            $whereClause[] = "(e.id_area = " . $idArea . " OR (e.id_area IS NULL OR e.id_area = 0) AND e.id_departamento IN (" . $deptosStr . "))";
        } else {
            // Si no hay departamentos en el área, solo incluir empleados del área
            $whereClause[] = "e.id_area = " . $idArea;
        }
    }
} elseif ($idDepartamento > 0) {
    // Solo departamento específico (sin área seleccionada)
    $whereClause[] = "e.id_departamento = " . $idDepartamento;
}
if ($idStatus > 0) {
    $whereClause[] = "e.id_status = " . $idStatus;
}

$sqlWhere = count($whereClause) > 0 ? " WHERE " . implode(" AND ", $whereClause) : "";

$sqlEmpleados = "SELECT 
    e.id_empleado, 
    e.clave_empleado, 
    e.nombre, 
    e.ap_paterno, 
    e.ap_materno, 
    e.imss,
    e.curp,
    e.grupo_sanguineo,
    e.id_status, 
    s.nombre_status, 
    e.id_area,
    a.nombre_area,
    d.id_departamento, 
    d.nombre_departamento
FROM info_empleados e
LEFT JOIN status s ON e.id_status = s.id_status
LEFT JOIN areas a ON e.id_area = a.id_area
LEFT JOIN departamentos d ON e.id_departamento = d.id_departamento
{$sqlWhere}
ORDER BY e.nombre ASC, e.ap_paterno ASC, e.ap_materno ASC";

$resEmp = $conexion->query($sqlEmpleados);
$empleados = [];
if ($resEmp) {
    while ($row = $resEmp->fetch_assoc()) {
        $empleados[] = $row;
    }
}

// 4. Consultar valores de expedientes
$sqlValores = "SELECT cv.id_empleado, cv.id_expediente, cv.valor, cv.fecha_actualizacion 
               FROM campo_expediente cv
               INNER JOIN catalogo_expediente ce ON cv.id_expediente = ce.id_expediente
               WHERE ce.activo = 1";
$resVal = $conexion->query($sqlValores);
$valoresMap = [];
if ($resVal) {
    while ($r = $resVal->fetch_assoc()) {
        $idEmp = (int)$r['id_empleado'];
        $idExp = (int)$r['id_expediente'];
        $valoresMap[$idEmp][$idExp] = [
            'valor' => $r['valor'],
            'fecha_actualizacion' => $r['fecha_actualizacion']
        ];
    }
}

// Helper para determinar si un campo fue entregado y obtener sus datos extra
function procesarValorExpediente($rawValor) {
    $entregado = false;
    $extras = [];
    $raw = $rawValor === null ? '' : trim($rawValor);

    if ($raw !== '' && $raw !== '0') {
        if (strpos($raw, '{') === 0 && strrpos($raw, '}') === strlen($raw) - 1) {
            $obj = json_decode($raw, true);
            if ($obj) {
                if (!empty($obj['_entregado']) || !empty($obj['BOOLEAN'])) {
                    $entregado = true;
                }
                $extras = $obj;
            }
        } elseif ($raw === '1' || strtolower($raw) === 'true') {
            $entregado = true;
        } else {
            $entregado = true;
            $extras['TEXT'] = $raw;
        }
    }
    return [
        'entregado' => $entregado,
        'extras' => $extras
    ];
}

// 5. Filtrar empleados según progreso % y requisito faltante
$empleadosFiltrados = [];
foreach ($empleados as $emp) {
    $idEmp = (int)$emp['id_empleado'];
    $entregadosMap = [];
    
    foreach ($catalogoActivoIds as $idExp) {
        $rawVal = $valoresMap[$idEmp][$idExp]['valor'] ?? null;
        $parsed = procesarValorExpediente($rawVal);
        if ($parsed['entregado']) {
            $entregadosMap[$idExp] = true;
        }
    }

    $numEntregados = count($entregadosMap);
    $pct = $totalRequisitosActivos > 0 ? (int)round(($numEntregados / $totalRequisitosActivos) * 100) : 0;

    if ($filtroAvance === 'completos' && ($pct < 100 || $totalRequisitosActivos === 0)) continue;
    if ($filtroAvance === 'incompletos' && ($pct === 100 || $totalRequisitosActivos === 0)) continue;
    if ($filtroAvance === 'sin_documentos' && $numEntregados > 0) continue;

    if ($idFaltaRequisito > 0 && isset($entregadosMap[$idFaltaRequisito])) {
        // Si ya lo entregó, NO le falta -> omitir
        continue;
    }

    $emp['_num_entregados'] = $numEntregados;
    $emp['_porcentaje'] = $pct;
    $empleadosFiltrados[] = $emp;
}

// 6. Obtener relación de departamentos con áreas para empleados sin área
$deptoAreaMap = [];
$sqlDeptoArea = "SELECT ad.id_departamento, a.nombre_area 
                 FROM areas_departamentos ad
                 INNER JOIN areas a ON ad.id_area = a.id_area";
$resDeptoArea = $conexion->query($sqlDeptoArea);
if ($resDeptoArea) {
    while ($row = $resDeptoArea->fetch_assoc()) {
        $deptoAreaMap[$row['id_departamento']] = $row['nombre_area'];
    }
}

// 7. Agrupar empleados por ÁREA y luego por DEPARTAMENTO (para crear pestañas por área con división por depto)
$empleadosPorArea = [];
foreach ($empleadosFiltrados as $emp) {
    $areaNombre = '';
    $deptoNombre = !empty($emp['nombre_departamento']) ? trim($emp['nombre_departamento']) : 'Sin Departamento';

    if (!empty($emp['nombre_area'])) {
        // Tiene área asignada
        $areaNombre = trim($emp['nombre_area']);
    } elseif (!empty($emp['id_departamento']) && isset($deptoAreaMap[$emp['id_departamento']])) {
        // No tiene área pero tiene departamento, buscar el área del departamento
        $areaNombre = $deptoAreaMap[$emp['id_departamento']];
    }

    // Solo incluir si tiene área (asignada o derivada del departamento)
    if (!empty($areaNombre)) {
        $empleadosPorArea[$areaNombre][$deptoNombre][] = $emp;
    }
}

// 8. Sanitizador de títulos de hojas para Excel (máx 31 caracteres, sin caracteres no válidos)
function sanitizarNombreHoja($nombre, &$titulosUsados) {
    // Solo eliminar caracteres que Excel prohíbe explícitamente en nombres de hoja
    $limpio = str_replace(['\\', '/', '?', '*', ':', '[', ']'], '', $nombre);
    $limpio = trim($limpio);
    if ($limpio === '') {
        $limpio = 'Área';
    }
    // Truncar a máximo 31 caracteres (límite de Excel)
    $final = mb_substr($limpio, 0, 31, 'UTF-8');
    // Solo agregar sufijo si ya existe exactamente el mismo nombre
    if (in_array($final, $titulosUsados)) {
        $i = 1;
        while (in_array($final, $titulosUsados)) {
            $sufijo = " ({$i})";
            $final = mb_substr($limpio, 0, 31 - strlen($sufijo), 'UTF-8') . $sufijo;
            $i++;
        }
    }
    $titulosUsados[] = $final;
    return $final;
}

// Nombres de Filtros generales para metadatos
$nombreDeptoFiltro = "Todos los departamentos";
if ($idDepartamento > 0) {
    $resD = $conexion->query("SELECT nombre_departamento FROM departamentos WHERE id_departamento = {$idDepartamento}");
    if ($resD && $rowD = $resD->fetch_assoc()) $nombreDeptoFiltro = $rowD['nombre_departamento'];
}

$nombreStatusFiltro = "Todos";
if ($idStatus === 1) $nombreStatusFiltro = "Solo Activos";
if ($idStatus === 2) $nombreStatusFiltro = "Solo Bajas";

$nombreAvanceFiltro = "Todos";
if ($filtroAvance === 'completos') $nombreAvanceFiltro = "Completos (100%)";
if ($filtroAvance === 'incompletos') $nombreAvanceFiltro = "Incompletos (<100%)";
if ($filtroAvance === 'sin_documentos') $nombreAvanceFiltro = "Sin Documentos (0%)";

$fechaGeneracion = date('d/m/Y h:i A');

// ─────────────────────────────────────────────────────────────────────────────
// CONSTRUCCIÓN DEL EXCEL CON PHPSPREADSHEET (PESTAÑAS POR ÁREA)
// ─────────────────────────────────────────────────────────────────────────────
$spreadsheet = new Spreadsheet();
$titulosHojasUsados = [];

// Palette de colores corporativos
$C_HEADER_BG = '166534'; // Verde oscuro medio para Encabezado Principal
$C_HEADER_FG = 'FFFFFF';
$C_SUBHDR_BG = '22C55E'; // Verde medio para Sub-encabezados
$C_SUBHDR_FG = 'FFFFFF';
$C_ZEBRA_ODD = 'FFFFFF';
$C_ZEBRA_EVEN= 'F8FAFC';
$C_BORDER    = 'CBD5E1'; // Soft Gray para bordes
$C_SI_BG     = 'DCFCE7'; // Soft Green
$C_SI_FG     = '15803D'; // Dark Green
$C_NO_BG     = 'FEE2E2'; // Soft Red
$C_NO_FG     = 'B91C1C'; // Dark Red

// Columnas Base del Empleado (SOLO CLAVE Y EMPLEADO)
$baseCols = [
    ['key' => '_num',           'label' => 'N°',       'align' => Alignment::HORIZONTAL_CENTER],
    ['key' => 'clave_empleado', 'label' => 'CLAVE',    'align' => Alignment::HORIZONTAL_CENTER],
    ['key' => 'nombre_completo','label' => 'EMPLEADO', 'align' => Alignment::HORIZONTAL_LEFT],
];

// Si no hay áreas/empleados que exportar, crear una sola hoja informativa
if (empty($empleadosPorArea)) {
    $empleadosPorArea['Sin Datos'] = [];
}

$sheetIndex = 0;
foreach ($empleadosPorArea as $nombreAreaGroup => $listaDeptosArea) {
    
    if ($sheetIndex === 0) {
        $sheet = $spreadsheet->getActiveSheet();
    } else {
        $sheet = $spreadsheet->createSheet();
    }

    $nombrePestana = sanitizarNombreHoja($nombreAreaGroup, $titulosHojasUsados);
    $sheet->setTitle($nombrePestana);
    $sheet->setShowGridLines(true);

    $rowNum = 1;

    // ── BANNER Y TÍTULO DEL REPORTE ──────────────────────────────────────────
    $sheet->setCellValue('A' . $rowNum, 'CÍTRICOS SAAO — REPORTE DE EXPEDIENTES DE EMPLEADOS');
    $sheet->getStyle('A' . $rowNum)->applyFromArray([
        'font' => ['bold' => true, 'size' => 13, 'color' => ['rgb' => '1E293B'], 'name' => 'Calibri'],
        'alignment' => ['vertical' => Alignment::VERTICAL_CENTER]
    ]);
    $sheet->getRowDimension($rowNum)->setRowHeight(24);
    $rowNum++;

    // ── ESTRUCTURA DE COLUMNAS DE LA TABLA ──────────────────────────────────
    $groupRow = $rowNum;
    $subRow   = $rowNum + 1;

    $colIndex = 1;
    $columnsStructure = [];

    // 1. Grupo Info Empleado
    $colStartEmp = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex(1);
    foreach ($baseCols as $bc) {
        $colLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colIndex);
        $columnsStructure[] = [
            'type'  => 'base',
            'key'   => $bc['key'],
            'col'   => $colLetter,
            'label' => $bc['label'],
            'align' => $bc['align']
        ];
        $sheet->setCellValue($colLetter . $subRow, $bc['label']);
        $colIndex++;
    }
    $colEndEmp = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colIndex - 1);

    // Merge encabezado de grupo del empleado
    $sheet->mergeCells("{$colStartEmp}{$groupRow}:{$colEndEmp}{$groupRow}");
    $sheet->setCellValue("{$colStartEmp}{$groupRow}", "DATOS DEL TRABAJADOR");

    // 2. Requisitos del Catálogo
    foreach ($catalogoExportar as $idExp => $cat) {
        $tipoDato = $cat['tipo_dato'];
        $tiposArr = array_filter(array_map('trim', explode(',', $tipoDato)), function($t){ return $t !== '' && $t !== 'BOOLEAN'; });

        $colReqStart = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colIndex);

        // Subcolumna: Entregó (SI/NO)
        $colLetterEnt = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colIndex);
        $columnsStructure[] = [
            'type'   => 'req_status',
            'id_exp' => $idExp,
            'col'    => $colLetterEnt,
            'label'  => 'ENTREGÓ',
            'align'  => Alignment::HORIZONTAL_CENTER
        ];
        $sheet->setCellValue($colLetterEnt . $subRow, 'ENTREGÓ');
        $colIndex++;

        // Subcolumnas extras asociadas específicamente a este requisito
        $extrasElegidosParaReq = $extraFieldsReq[$idExp] ?? null;
        
        // Si no vino extra_fields para este id_exp pero es exportación general/todas, incluir todos por defecto
        if ($extrasElegidosParaReq === null && (is_string($rawColumnas) && $rawColumnas === 'todas')) {
            $extrasElegidosParaReq = $tiposArr;
        } elseif (!is_array($extrasElegidosParaReq)) {
            $extrasElegidosParaReq = [];
        }

        if (!empty($tiposArr) && !empty($extrasElegidosParaReq)) {
            foreach ($tiposArr as $t) {
                if (!in_array($t, $extrasElegidosParaReq, true)) {
                    continue;
                }
                $colLetterExtra = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colIndex);
                $lblExtra = 'DETALLE';
                $alignExtra = Alignment::HORIZONTAL_LEFT;

                if ($t === 'DATE') { $lblExtra = 'FECHA'; $alignExtra = Alignment::HORIZONTAL_CENTER; }
                if ($t === 'YEAR') { $lblExtra = 'VIGENCIA'; $alignExtra = Alignment::HORIZONTAL_CENTER; }
                if ($t === 'DECIMAL') { $lblExtra = 'CANTIDAD'; $alignExtra = Alignment::HORIZONTAL_RIGHT; }
                if ($t === 'TEXT') { $lblExtra = 'OBSERVACIONES'; $alignExtra = Alignment::HORIZONTAL_LEFT; }

                $columnsStructure[] = [
                    'type'       => 'req_extra',
                    'id_exp'     => $idExp,
                    'tipo_extra' => $t,
                    'col'        => $colLetterExtra,
                    'label'      => $lblExtra,
                    'align'      => $alignExtra
                ];
                $sheet->setCellValue($colLetterExtra . $subRow, $lblExtra);
                $colIndex++;
            }
        }

        $colReqEnd = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colIndex - 1);

        // Merge encabezado del requisito
        $sheet->mergeCells("{$colReqStart}{$groupRow}:{$colReqEnd}{$groupRow}");
        $sheet->setCellValue("{$colReqStart}{$groupRow}", mb_strtoupper($cat['nombre'], 'UTF-8'));
    }

    $lastColLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colIndex - 1);

    // Merge del banner principal
    $sheet->mergeCells("A1:{$lastColLetter}1");

    // Estilos de la Fila de Grupos
    $sheet->getStyle("A{$groupRow}:{$lastColLetter}{$groupRow}")->applyFromArray([
        'font' => ['bold' => true, 'size' => 10, 'color' => ['rgb' => $C_HEADER_FG], 'name' => 'Calibri'],
        'fill' => ['fillType' => Fill::FILL_SOLID, 'color' => ['rgb' => $C_HEADER_BG]],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        'borders' => [
            'allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => '475569']]
        ]
    ]);
    $sheet->getRowDimension($groupRow)->setRowHeight(24);

    // Estilos de la Fila de Sub-encabezados
    $sheet->getStyle("A{$subRow}:{$lastColLetter}{$subRow}")->applyFromArray([
        'font' => ['bold' => true, 'size' => 9, 'color' => ['rgb' => $C_SUBHDR_FG], 'name' => 'Calibri'],
        'fill' => ['fillType' => Fill::FILL_SOLID, 'color' => ['rgb' => $C_SUBHDR_BG]],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
        'borders' => [
            'allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => '475569']]
        ]
    ]);
    $sheet->getRowDimension($subRow)->setRowHeight(22);

    $rowNum = $subRow + 1;

    // ── LLENADO DE DATOS DEL ÁREA POR DEPARTAMENTO ─────────────────────────────
    $countNum = 1;
    $sumPorcentajesArea = 0;

    foreach ($listaDeptosArea as $nombreDepto => $listaEmpleadosDepto) {
        // Fila de encabezado del departamento
        $sheet->mergeCells("A{$rowNum}:{$lastColLetter}{$rowNum}");
        $sheet->setCellValue("A{$rowNum}", "DEPARTAMENTO: {$nombreDepto}");
        $sheet->getStyle("A{$rowNum}:{$lastColLetter}{$rowNum}")->applyFromArray([
            'font' => ['bold' => true, 'size' => 10, 'color' => ['rgb' => '475569'], 'name' => 'Calibri'],
            'fill' => ['fillType' => Fill::FILL_SOLID, 'color' => ['rgb' => 'F1F5F9']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT, 'vertical' => Alignment::VERTICAL_CENTER],
            'borders' => [
                'allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => 'CBD5E1']]
            ]
        ]);
        $sheet->getRowDimension($rowNum)->setRowHeight(22);
        $rowNum++;

        // Llenar empleados de este departamento
        foreach ($listaEmpleadosDepto as $emp) {
        $idEmp = (int)$emp['id_empleado'];
        $nombreCompleto = trim($emp['nombre'] . ' ' . $emp['ap_paterno'] . ' ' . $emp['ap_materno']);
        $bgColorRow = ($countNum % 2 === 0) ? $C_ZEBRA_EVEN : $C_ZEBRA_ODD;
        $sumPorcentajesArea += $emp['_porcentaje'];

        foreach ($columnsStructure as $cs) {
            $cellCoord = $cs['col'] . $rowNum;

            if ($cs['type'] === 'base') {
                $val = '';
                switch ($cs['key']) {
                    case '_num':
                        $val = $countNum;
                        break;
                    case 'clave_empleado':
                        $val = $emp['clave_empleado'];
                        break;
                    case 'nombre_completo':
                        $val = $nombreCompleto;
                        break;
                }

                $sheet->setCellValue($cellCoord, $val);
                $sheet->getStyle($cellCoord)->applyFromArray([
                    'font' => ['size' => 9.5, 'name' => 'Calibri'],
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'color' => ['rgb' => $bgColorRow]],
                    'alignment' => ['horizontal' => $cs['align'], 'vertical' => Alignment::VERTICAL_CENTER],
                    'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => $C_BORDER]]]
                ]);

            } elseif ($cs['type'] === 'req_status') {
                $idExp = $cs['id_exp'];
                $rawVal = $valoresMap[$idEmp][$idExp]['valor'] ?? null;
                $parsed = procesarValorExpediente($rawVal);

                $valTxt = $parsed['entregado'] ? 'SÍ' : 'NO';
                $fillBg = $parsed['entregado'] ? $C_SI_BG : $C_NO_BG;
                $textFg = $parsed['entregado'] ? $C_SI_FG : $C_NO_FG;

                $sheet->setCellValue($cellCoord, $valTxt);
                $sheet->getStyle($cellCoord)->applyFromArray([
                    'font' => ['bold' => true, 'size' => 9.5, 'color' => ['rgb' => $textFg], 'name' => 'Calibri'],
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'color' => ['rgb' => $fillBg]],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER],
                    'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => $C_BORDER]]]
                ]);

            } elseif ($cs['type'] === 'req_extra') {
                $idExp = $cs['id_exp'];
                $tExtra = $cs['tipo_extra'];
                $rawVal = $valoresMap[$idEmp][$idExp]['valor'] ?? null;
                $parsed = procesarValorExpediente($rawVal);
                $valExtraTxt = '-';

                if ($parsed['entregado'] && !empty($parsed['extras'])) {
                    $eMap = $parsed['extras'];

                    if ($tExtra === 'DATE' && !empty($eMap['DATE'])) {
                        $valExtraTxt = date('d/m/Y', strtotime($eMap['DATE']));
                    } elseif ($tExtra === 'YEAR' && !empty($eMap['YEAR'])) {
                        $y = $eMap['YEAR'];
                        if (is_array($y)) {
                            $ini = $y['inicio'] ?? '';
                            $fin = $y['fin'] ?? '';
                            $valExtraTxt = ($ini || $fin) ? "{$ini} - {$fin}" : '-';
                        } else {
                            $valExtraTxt = (string)$y;
                        }
                    } elseif ($tExtra === 'DECIMAL' && isset($eMap['DECIMAL']) && $eMap['DECIMAL'] !== '') {
                        $valExtraTxt = number_format((float)$eMap['DECIMAL'], 2);
                    } elseif ($tExtra === 'TEXT' && isset($eMap['TEXT'])) {
                        $valExtraTxt = (string)$eMap['TEXT'];
                    }
                }

                $sheet->setCellValue($cellCoord, $valExtraTxt);
                $sheet->getStyle($cellCoord)->applyFromArray([
                    'font' => ['size' => 9, 'color' => ['rgb' => ($valExtraTxt === '-' ? '94A3B8' : '1E293B')], 'name' => 'Calibri'],
                    'fill' => ['fillType' => Fill::FILL_SOLID, 'color' => ['rgb' => $bgColorRow]],
                    'alignment' => ['horizontal' => $cs['align'], 'vertical' => Alignment::VERTICAL_CENTER],
                    'borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN, 'color' => ['rgb' => $C_BORDER]]]
                ]);
            }
        }

        $sheet->getRowDimension($rowNum)->setRowHeight(21);
        $rowNum++;
        $countNum++;
    }
    // Fin del ciclo de empleados del departamento

    // Fila vacía de separación entre departamentos
    $rowNum++;
    }
    // Fin del ciclo de departamentos del área

    // ── AUTO-AJUSTE DE ANCHOS DE COLUMNAS ─────────────────────────────────────
    foreach (range(1, \PhpOffice\PhpSpreadsheet\Cell\Coordinate::columnIndexFromString($lastColLetter)) as $colIdx) {
        $colLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colIdx);
        if ($colIdx === 1) {
            $sheet->getColumnDimension($colLetter)->setWidth(7);
        } elseif ($colIdx === 2) {
            $sheet->getColumnDimension($colLetter)->setWidth(14);
        } elseif ($colIdx === 3) {
            $sheet->getColumnDimension($colLetter)->setWidth(34);
        } else {
            $sheet->getColumnDimension($colLetter)->setAutoSize(true);
        }
    }

    $sheetIndex++;
}

// Establecer la primera pestaña como activa por defecto
$spreadsheet->setActiveSheetIndex(0);

// ── LIMPIAR BUFFER Y ENVIAR DESCARGA ──────────────────────────────────────────
if (ob_get_length()) {
    ob_end_clean();
}

if ($idDepartamento > 0 && !empty($nombreDeptoFiltro) && $nombreDeptoFiltro !== "Todos los departamentos") {
    $cleanDepto = str_replace(' ', '_', trim($nombreDeptoFiltro));
    $cleanDepto = preg_replace('/[^\w\-áéíóúÁÉÍÓÚñÑ]/u', '', $cleanDepto);
    $filename = "Expedientes_{$cleanDepto}_" . date('Y-m-d') . ".xlsx";
} else {
    $filename = "Reporte_General_Expedientes_" . date('Y-m-d') . ".xlsx";
}
header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
header('Content-Disposition: attachment;filename="' . $filename . '"');
header('Cache-Control: max-age=0');

$writer = new Xlsx($spreadsheet);
$writer->save('php://output');
exit;
