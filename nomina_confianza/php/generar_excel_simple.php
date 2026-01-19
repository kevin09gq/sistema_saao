<?php
require_once __DIR__ . '/../../vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;
use PhpOffice\PhpSpreadsheet\Worksheet\Drawing;
use PhpOffice\PhpSpreadsheet\Worksheet\PageSetup;

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

// Parámetros esperados (flexibles):
// - departamento: puede ser string o { id, nombre }

// Verifica si existen empleados para una combinación dept-empresa
function existenEmpleados($nomina, $deptId, $empId) {
    if (!$nomina || !isset($nomina['departamentos']) || !is_array($nomina['departamentos'])) return false;
    foreach ($nomina['departamentos'] as $depto) {
        if (!isset($depto['empleados']) || !is_array($depto['empleados'])) continue;
        foreach ($depto['empleados'] as $emp) {
            // Respetar flag 'mostrar' — si existe y es false, ignorar empleado
            if (isset($emp['mostrar']) && $emp['mostrar'] === false) continue;

            $passDept = true;
            if ($deptId !== null && isset($emp['id_departamento'])) {
                $passDept = (intval($emp['id_departamento']) === $deptId);
            }
            $passEmp = true;
            if ($empId !== null && isset($emp['id_empresa'])) {
                $passEmp = (intval($emp['id_empresa']) === $empId);
            }
            if ($passDept && $passEmp) return true;
        }
    }
    return false;
}
// - empresa: puede ser string o { id, nombre }
// - fecha_nomina: string que viene de #nombre_nomina
// - numero_semana, fecha_inicio, fecha_cierre, titulo: opcionales
$id_empresa = isset($data['id_empresa']) ? $data['id_empresa'] : 'Todas';
$departamento_raw = isset($data['departamento']) ? $data['departamento'] : 'Todos';
$empresa_raw = isset($data['empresa']) ? $data['empresa'] : 'Todas';
$numero_semana = isset($data['numero_semana']) ? $data['numero_semana'] : '';
$fecha_inicio = isset($data['fecha_inicio']) ? $data['fecha_inicio'] : '';
$fecha_cierre = isset($data['fecha_cierre']) ? $data['fecha_cierre'] : '';
$titulo = isset($data['titulo']) ? $data['titulo'] : 'Nómina';

// Resolver nombres legibles para encabezado
$departamento_nombre = is_array($departamento_raw)
    ? (isset($departamento_raw['nombre']) ? $departamento_raw['nombre'] : 'DEPARTAMENTO')
    : (string)$departamento_raw;
$empresa_nombre = is_array($empresa_raw)
    ? (isset($empresa_raw['nombre']) ? $empresa_raw['nombre'] : 'EMPRESA')
    : (string)$empresa_raw;
$fecha_nomina = isset($data['fecha_nomina']) ? (string)$data['fecha_nomina'] : '';

// Creamos un archivo Excel simple con solo encabezados
$spreadsheet = new Spreadsheet();
$sheet = $spreadsheet->getActiveSheet();
// Renombrar hoja por defecto dinámicamente según la empresa seleccionada
// Nota: el título final no debe exceder 31 caracteres ni contener : \\ / ? * [ ]
$empresaLowerForTitle = isset($empresa_nombre) ? mb_strtolower($empresa_nombre, 'UTF-8') : '';
if (strpos($empresaLowerForTitle, 'citric') !== false && strpos($empresaLowerForTitle, 'group') !== false) {
    $sheet->setTitle('Administracion-CitricsGroup');
} elseif (strpos($empresaLowerForTitle, 'saao') !== false) {
    $sheet->setTitle('Administracion-Saao');
} else {
    $sheet->setTitle('Administracion');
}

// ==========================
// Helpers reutilizables
// ==========================

// Escribe las líneas de encabezado estático (departamento, empresa, fecha, semana)

function tieneAjusteAlSub($nomina, $deptIdSel = null, $empIdSel = null)
{
    if (!$nomina || !isset($nomina['departamentos']) || !is_array($nomina['departamentos'])) return false;
    foreach ($nomina['departamentos'] as $depto) {
        if (!isset($depto['empleados']) || !is_array($depto['empleados'])) continue;
        foreach ($depto['empleados'] as $emp) {
            // Respetar flag 'mostrar' — si existe y es false, ignorar empleado
            if (isset($emp['mostrar']) && $emp['mostrar'] === false) continue;

            $passDept = true;
            if ($deptIdSel !== null && isset($emp['id_departamento'])) {
                $passDept = (intval($emp['id_departamento']) === $deptIdSel);
            }
            $passEmp = true;
            if ($empIdSel !== null && isset($emp['id_empresa'])) {
                $passEmp = (intval($emp['id_empresa']) === $empIdSel);
            }
            if ($passDept && $passEmp) {
                if (isset($emp['conceptos']) && is_array($emp['conceptos'])) {
                    foreach ($emp['conceptos'] as $c) {
                        $cod = isset($c['codigo']) ? (string)$c['codigo'] : null;
                        $val = isset($c['resultado']) ? $c['resultado'] : (isset($c['monto']) ? $c['monto'] : null);
                        if ($cod === '107' && is_numeric($val) && (float)$val > 0) {
                            return true;
                        }
                    }
                }
            }
        }
    }
    return false;
}

function tieneUniforme($nomina, $deptIdSel = null, $empIdSel = null)
{
    if (!$nomina || !isset($nomina['departamentos']) || !is_array($nomina['departamentos'])) return false;
    foreach ($nomina['departamentos'] as $depto) {
        if (!isset($depto['empleados']) || !is_array($depto['empleados'])) continue;
        foreach ($depto['empleados'] as $emp) {
            if (isset($emp['mostrar']) && $emp['mostrar'] === false) continue;
            $passDept = true;
            if ($deptIdSel !== null && isset($emp['id_departamento'])) {
                $passDept = (intval($emp['id_departamento']) === $deptIdSel);
            }
            $passEmp = true;
            if ($empIdSel !== null && isset($emp['id_empresa'])) {
                $passEmp = (intval($emp['id_empresa']) === $empIdSel);
            }
            if ($passDept && $passEmp) {
                // Verificar campo directo
                if ((isset($emp['uniformes']) && is_numeric($emp['uniformes']) && (float)$emp['uniformes'] != 0) || (isset($emp['uniforme']) && is_numeric($emp['uniforme']) && (float)$emp['uniforme'] != 0)) {
                    return true;
                }
                // Verificar en conceptos por nombre (UNIFORME)
                if (isset($emp['conceptos']) && is_array($emp['conceptos'])) {
                    foreach ($emp['conceptos'] as $c) {
                        $nom = isset($c['nombre']) ? (string)$c['nombre'] : (isset($c['name']) ? (string)$c['name'] : '');
                        $monto = isset($c['resultado']) ? $c['resultado'] : (isset($c['monto']) ? $c['monto'] : (isset($c['importe']) ? $c['importe'] : null));
                        if (!is_numeric($monto)) continue;
                        if ($nom !== '' && stripos($nom, 'UNIFORME') !== false && (float)$monto != 0) {
                            return true;
                        }
                    }
                }
            }
        }
    }
    return false;
}

function escribirEncabezadoEstatico($sheet, $departamento_nombre, $empresa_nombre, $fecha_nomina, $numero_semana = '', $fecha_cierre = '')
{
    // Línea 1: Nombre del departamento (grande, verde)
    $sheet->mergeCells('B1:S1');
    $sheet->setCellValue('B1', ($departamento_nombre ?: 'DEPARTAMENTO'));
    $sheet->getStyle('B1')->applyFromArray([
        'font' => ['bold' => true, 'size' => 20, 'color' => ['rgb' => '008000']],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER]
    ]);

    // Línea 2: Nombre de la empresa (verde, mediano)
    $sheet->mergeCells('B2:S2');
    $sheet->setCellValue('B2', ($empresa_nombre ?: 'EMPRESA'));
    $sheet->getStyle('B2')->applyFromArray([
        'font' => ['bold' => true, 'size' => 14, 'color' => ['rgb' => '008000']],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER]
    ]);

    // Línea 3: Fecha de la nómina (negrita, centrado)
    $sheet->mergeCells('B3:S3');
    $sheet->setCellValue('B3', ($fecha_nomina ?: ''));
    $sheet->getStyle('B3')->applyFromArray([
        'font' => ['bold' => true, 'size' => 12, 'color' => ['rgb' => '000000']],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER]
    ]);

    // Línea 4: Semana y año - Extraer año de fecha_cierre (formato: "02/Ene/2026")
    $sheet->mergeCells('B4:S4');
    $anio = '2026'; // valor por defecto
    if ($fecha_cierre) {
        // Extraer año de fecha_cierre (últimos 4 caracteres después del último /)
        $parts = explode('/', $fecha_cierre);
        if (count($parts) === 3) {
            $anio = $parts[2];
        }
    }
    $semanaText = $numero_semana ? " {$numero_semana}-{$anio}" : "SEMANA 03-{$anio}";
    $sheet->setCellValue('B4', $semanaText);
    $sheet->getStyle('B4')->applyFromArray([
        'font' => ['bold' => true, 'size' => 12, 'color' => ['rgb' => '000000']],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER]
    ]);
}

function obtenerEstiloEncabezadoPorDepto($departamento_nombre, $empresa_nombre)
{
    $depLower = mb_strtolower($departamento_nombre ?: '', 'UTF-8');
    $empLower = mb_strtolower($empresa_nombre ?: '', 'UTF-8');
    $esAdministracion = (strpos($depLower, 'administracion') !== false) || (strpos($depLower, 'administración') !== false);
    $esCitricosSaao = (strpos($empLower, 'citricos') !== false) && (strpos($empLower, 'saao') !== false);
    $esCitricsGroup = (strpos($empLower, 'citric') !== false) && (strpos($empLower, 'group') !== false);
    // Preferir decisión por IDs si están disponibles en contexto global
    $deptIdSelCtx = isset($GLOBALS['__deptIdForStyle']) ? $GLOBALS['__deptIdForStyle'] : null;
    $empIdSelCtx  = isset($GLOBALS['__empIdForStyle']) ? $GLOBALS['__empIdForStyle'] : null;
    if ($deptIdSelCtx === 1 && $empIdSelCtx === 1) {
        $esAdministracion = true; $esCitricosSaao = true; $esCitricsGroup = false;
    } else if ($deptIdSelCtx === 1 && $empIdSelCtx === 2) {
        $esAdministracion = true; $esCitricosSaao = false; $esCitricsGroup = true;
    }
    if ($esAdministracion && $esCitricosSaao) {
        return [
            'fill' => [
                'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                'startColor' => ['rgb' => 'DA70D6'] // Magenta estilo Administración
            ],
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF']
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
                    'color' => ['rgb' => '7A297A']
                ]
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER
            ]
        ];
    }
    // Departamento genérico id 3 — azul marino para ambas empresas
    if ($deptIdSelCtx === 3 && ($empIdSelCtx === 1 || $empIdSelCtx === 2)) {
        return [
            'fill' => [
                'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                'startColor' => ['rgb' => '0D2559'] // Azul marino
            ],
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF']
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
                    'color' => ['rgb' => '001A40']
                ]
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER
            ]
        ];
    }
    // Producción (dept id 2) — azul para ambas empresas
    if ($deptIdSelCtx === 2 && ($empIdSelCtx === 1 || $empIdSelCtx === 2)) {
        return [
            'fill' => [
                'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                'startColor' => ['rgb' => '0B69D1'] // Azul fuerte
            ],
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF']
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
                    'color' => ['rgb' => '003B88']
                ]
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER
            ]
        ];
    }
    // Administración Sucursal CdMx (dept id 9) para SAAO (empresa id 1) — morado suave
    if ($deptIdSelCtx === 9 && $empIdSelCtx === 1) {
        return [
            'fill' => [
                'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                'startColor' => ['rgb' => 'D77AE6'] // Morado suave
            ],
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF']
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
                    'color' => ['rgb' => '7A1FA2']
                ]
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER
            ]
        ];
    }
    // Administración Sucursal CdMx (dept id 9) para Citric's Group (empresa id 2) — mismo morado
    if ($deptIdSelCtx === 9 && $empIdSelCtx === 2) {
        return [
            'fill' => [
                'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                'startColor' => ['rgb' => 'D77AE6']
            ],
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF']
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
                    'color' => ['rgb' => '7A1FA2']
                ]
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER
            ]
        ];
    }
    if ($esAdministracion && $esCitricsGroup) {
        return [
            'fill' => [
                'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                'startColor' => ['rgb' => '9CCC65'] // Verde suave para Citric's Group
            ],
            'font' => [
                'bold' => true,
                'color' => ['rgb' => '000000']
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
                    'color' => ['rgb' => '2E7D32']
                ]
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER
            ]
        ];
    }
    return null; // sin estilo especial por defecto
}

function escribirEncabezadosTabla($sheet, $headers, $filaInicio = 7, $departamento_nombre = '', $empresa_nombre = '')
{
    $col = 'A';
    foreach ($headers as $h) {
        $display = $h;
        if ($h === 'SUELDO NETO') $display = "SUELDO\nNETO";
        if ($h === 'NETO A RECIBIR') $display = "NETO A\nRECIBIR";
        if ($h === 'IMPORTE EN EFECTIVO') $display = "IMPORTE EN\nEFECTIVO";
        if ($h === 'TOTAL A RECIBIR') $display = "TOTAL A\nRECIBIR";
        if ($h === 'FIRMA RECIBIDO') $display = "FIRMA\nRECIBIDO";

        $cell = $col . $filaInicio;
        $sheet->setCellValue($cell, $display);
        $sheet->getStyle($cell)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle($cell)->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);
        $sheet->getStyle($cell)->getAlignment()->setWrapText(true);
        // Anchos básicos por tipo de dato
        if ($col === 'A') $sheet->getColumnDimension($col)->setWidth(5);
        else if ($col === 'B') $sheet->getColumnDimension($col)->setWidth(10);
        else if ($col === 'C') $sheet->getColumnDimension($col)->setWidth(40); // NOMBRE más ancho
        else if ($col === 'D') $sheet->getColumnDimension($col)->setWidth(14);
        else if (in_array($col, ['E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'])) $sheet->getColumnDimension($col)->setWidth(12);
        else $sheet->getColumnDimension($col)->setAutoSize(true);
        $col++;
    }

    // Altura para encabezado
    $sheet->getRowDimension($filaInicio)->setRowHeight(36);

    // Aplicar estilo por departamento/empresa si corresponde
    $style = obtenerEstiloEncabezadoPorDepto($departamento_nombre, $empresa_nombre);
    if ($style) {
        $lastCol = chr(ord('A') + count($headers) - 1); // calcula última columna
        $headerRange = 'A' . $filaInicio . ':' . $lastCol . $filaInicio;
        $sheet->getStyle($headerRange)->applyFromArray($style);
    }
}

function escribirCuerpoDesdeNomina($sheet, $nomina, $deptIdSel = null, $empIdSel = null, $filaInicio = 8, $cols = null)
{
    if (!$nomina || !isset($nomina['departamentos']) || !is_array($nomina['departamentos'])) return;
    $row = $filaInicio;
    $idx = 1;
    if ($cols === null) {
        $cols = [
            'num' => 'A',
            'clave' => 'B',
            'nombre' => 'C',
            'sueldo' => 'E',
            'extra' => 'F',
            'tarjeta' => 'G',
            'isr' => 'H',
            'imss' => 'I',
            'ajuste_sub' => 'J',
            'infonavit' => 'K',
            'ausentismo' => 'L',
            'permisos' => 'M',
            'retardos' => 'N',
            'biometrico' => 'O',
            'uniforme' => 'P',
            'neto_recibir' => 'Q',
            'importe_efectivo' => 'R',
            'prestamo' => 'S',
            'total_cobrar' => 'T'
        ];
    }
    foreach ($nomina['departamentos'] as $depto) {
        if (!isset($depto['empleados']) || !is_array($depto['empleados'])) continue;
        foreach ($depto['empleados'] as $emp) {
            // Respetar flag 'mostrar' — si existe y es false, ignorar empleado
            if (isset($emp['mostrar']) && $emp['mostrar'] === false) continue;

            $passDept = true;
            if ($deptIdSel !== null && isset($emp['id_departamento'])) {
                $passDept = (intval($emp['id_departamento']) === $deptIdSel);
            }
            $passEmp = true;
            if ($empIdSel !== null && isset($emp['id_empresa'])) {
                $passEmp = (intval($emp['id_empresa']) === $empIdSel);
            }
            if ($passDept && $passEmp) {
                $nombre = isset($emp['nombre']) ? $emp['nombre'] : '';
                $sheet->setCellValue($cols['num'] . $row, $idx);
                // CLAVE del empleado (propiedad 'clave' o 'clave_empleado')
                $clave = isset($emp['clave']) ? $emp['clave'] : (isset($emp['clave_empleado']) ? $emp['clave_empleado'] : '');
                $sheet->setCellValue($cols['clave'] . $row, $clave);
                $sheet->setCellValue($cols['nombre'] . $row, $nombre);
                // CENTRAR COLUMNA # (A)
                $sheet->getStyle($cols['num'] . $row)->getAlignment()
                    ->setHorizontal(Alignment::HORIZONTAL_CENTER)
                    ->setVertical(Alignment::VERTICAL_CENTER);

                // CENTRAR COLUMNA CLAVE (B)
                $sheet->getStyle('B' . $row)->getAlignment()
                    ->setHorizontal(Alignment::HORIZONTAL_CENTER)
                    ->setVertical(Alignment::VERTICAL_CENTER);

                // 👉 ALTURA DEL CUERPO (AQUÍ VA) — sólo si hay datos visibles
                if (trim((string)$nombre) !== '') {
                    $sheet->getRowDimension($row)->setRowHeight(38);
                }

                // 👉 ALINEACIÓN Y WRAP DEL NOMBRE
                $sheet->getStyle($cols['nombre'] . $row)->getAlignment()
                    ->setWrapText(true)
                    ->setVertical(Alignment::VERTICAL_CENTER);

                $sueldoSemanal = isset($emp['sueldo_semanal']) && is_numeric($emp['sueldo_semanal']) ? (float)$emp['sueldo_semanal'] : null;
                $sueldoExtraTotal = isset($emp['sueldo_extra_total']) && is_numeric($emp['sueldo_extra_total']) ? (float)$emp['sueldo_extra_total'] : null;
                
                // SUELDO NETO - escribir solo si es distinto de 0
                if ($sueldoSemanal !== null && $sueldoSemanal != 0) {
                    $sheet->setCellValue($cols['sueldo'] . $row, $sueldoSemanal);
                    $sheet->getStyle($cols['sueldo'] . $row)->getNumberFormat()->setFormatCode('"$"#,##0.00');
                    $sheet->getStyle($cols['sueldo'] . $row)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                }
                
                // EXTRA - escribir solo si es distinto de 0
                if ($sueldoExtraTotal !== null && $sueldoExtraTotal != 0) {
                    $sheet->setCellValue($cols['extra'] . $row, $sueldoExtraTotal);
                    $sheet->getStyle($cols['extra'] . $row)->getNumberFormat()->setFormatCode('"$"#,##0.00');
                    $sheet->getStyle($cols['extra'] . $row)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                }

                // Helper para leer número por múltiples llaves
                $getNum = function(array $keys) use ($emp) {
                    foreach ($keys as $k) {
                        if (isset($emp[$k]) && is_numeric($emp[$k])) return (float)$emp[$k];
                    }
                    return null;
                };
                // Helper para buscar en conceptos por nombre o código
                $fromConcept = function($nameContains = null, array $codes = []) use ($emp) {
                    if (!isset($emp['conceptos']) || !is_array($emp['conceptos'])) return null;
                    $sum = 0.0; $found = false;
                    foreach ($emp['conceptos'] as $c) {
                        $cod = isset($c['codigo']) ? (string)$c['codigo'] : (isset($c['code']) ? (string)$c['code'] : null);
                        $nom = isset($c['nombre']) ? (string)$c['nombre'] : (isset($c['name']) ? (string)$c['name'] : '');
                        $monto = isset($c['resultado']) ? $c['resultado'] : (isset($c['monto']) ? $c['monto'] : (isset($c['importe']) ? $c['importe'] : null));
                        if (!is_numeric($monto)) continue;
                        $ok = false;
                        if ($nameContains && stripos($nom, $nameContains) !== false) $ok = true;
                        if (!$ok && $cod !== null && !empty($codes) && in_array($cod, array_map('strval', $codes), true)) $ok = true;
                        if ($ok) { $sum += (float)$monto; $found = true; }
                    }
                    return $found ? $sum : null;
                };

                // TARJETA - escribir solo si distinto de 0
                $val = $getNum(['tarjeta','tarjeta_total']);
                if ($val === null) $val = $fromConcept('TARJETA');
                if ($val !== null && $val != 0) {
                    $sheet->setCellValue($cols['tarjeta'] . $row, $val);
                    $sheet->getStyle($cols['tarjeta'] . $row)->getNumberFormat()->setFormatCode('"$"#,##0.00');
                    $sheet->getStyle($cols['tarjeta'] . $row)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                }

                // ISR (código 45) - escribir solo si distinto de 0
                $val = $getNum(['isr']);
                if ($val === null) $val = $fromConcept(null, ['45']);
                if ($val !== null && $val != 0) {
                    $sheet->setCellValue($cols['isr'] . $row, $val);
                    $sheet->getStyle($cols['isr'] . $row)->getNumberFormat()->setFormatCode('"$"#,##0.00');
                    $sheet->getStyle($cols['isr'] . $row)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                }

                // IMSS (código 52) - escribir solo si distinto de 0
                $val = $getNum(['imss']);
                if ($val === null) $val = $fromConcept(null, ['52']);
                if ($val !== null && $val != 0) {
                    $sheet->setCellValue($cols['imss'] . $row, $val);
                    $sheet->getStyle($cols['imss'] . $row)->getNumberFormat()->setFormatCode('"$"#,##0.00');
                    $sheet->getStyle($cols['imss'] . $row)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                }

                // AJUSTES AL SUB (código 107) - escribir solo si distinto de 0 y la columna existe
                if (isset($cols['ajuste_sub'])) {
                    $val = $getNum(['ajuste_sub', 'ajustes_sub']);
                    if ($val === null) $val = $fromConcept(null, ['107']);
                    if ($val !== null && $val != 0) {
                        $sheet->setCellValue($cols['ajuste_sub'] . $row, $val);
                        $sheet->getStyle($cols['ajuste_sub'] . $row)->getNumberFormat()->setFormatCode('"$"#,##0.00');
                        $sheet->getStyle($cols['ajuste_sub'] . $row)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                    }
                }

                // INFONAVIT (código 16) - escribir solo si distinto de 0
                $val = $getNum(['infonavit']);
                if ($val === null) $val = $fromConcept(null, ['16']);
                if ($val !== null && $val != 0) {
                    $sheet->setCellValue($cols['infonavit'] . $row, $val);
                    $sheet->getStyle($cols['infonavit'] . $row)->getNumberFormat()->setFormatCode('"$"#,##0.00');
                    $sheet->getStyle($cols['infonavit'] . $row)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                }

                // AUSENTISMO (o INASISTENCIA) - escribir solo si distinto de 0
                $val = $getNum(['ausentismo','inasistencia']);
                if ($val !== null && $val != 0) {
                    $sheet->setCellValue($cols['ausentismo'] . $row, $val);
                    $sheet->getStyle($cols['ausentismo'] . $row)->getNumberFormat()->setFormatCode('"$"#,##0.00');
                    $sheet->getStyle($cols['ausentismo'] . $row)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                }

                // UNIFORME - escribir solo si distinto de 0 (igual que AJUSTES AL SUB)
                if (isset($cols['uniforme'])) {
                    $val = $getNum(['uniformes','uniforme']);
                    if ($val === null) $val = $fromConcept('UNIFORME');
                    if ($val !== null && $val != 0) {
                        $sheet->setCellValue($cols['uniforme'] . $row, $val);
                        $sheet->getStyle($cols['uniforme'] . $row)->getNumberFormat()->setFormatCode('"$"#,##0.00');
                        $sheet->getStyle($cols['uniforme'] . $row)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                    }
                }

                // PERMISOS - escribir solo si distinto de 0
                $val = $getNum(['permisos','permiso']);
                if ($val !== null && $val != 0) {
                    $sheet->setCellValue($cols['permisos'] . $row, $val);
                    $sheet->getStyle($cols['permisos'] . $row)->getNumberFormat()->setFormatCode('"$"#,##0.00');
                    $sheet->getStyle($cols['permisos'] . $row)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                }

                // RETARDOS - escribir solo si distinto de 0
                $val = $getNum(['retardos','retardo']);
                if ($val !== null && $val != 0) {
                    $sheet->setCellValue($cols['retardos'] . $row, $val);
                    $sheet->getStyle($cols['retardos'] . $row)->getNumberFormat()->setFormatCode('"$"#,##0.00');
                    $sheet->getStyle($cols['retardos'] . $row)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                }

                // BIOMÉTRICO (CHECADOR) - escribir solo si distinto de 0
                $val = $getNum(['biometrico','checador']);
                if ($val !== null && $val != 0) {
                    $sheet->setCellValue($cols['biometrico'] . $row, $val);
                    $sheet->getStyle($cols['biometrico'] . $row)->getNumberFormat()->setFormatCode('"$"#,##0.00');
                    $sheet->getStyle($cols['biometrico'] . $row)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                }

                // NETO A RECIBIR e IMPORTE EN EFECTIVO se establecerán como fórmulas Excel más abajo (cuando las letras de columna estén definidas).

                // PRÉSTAMO - escribir solo si distinto de 0
                $val = $getNum(['prestamo','préstamo']);
                if ($val !== null && $val != 0) {
                    $sheet->setCellValue($cols['prestamo'] . $row, $val);
                    $sheet->getStyle($cols['prestamo'] . $row)->getNumberFormat()->setFormatCode('"$"#,##0.00');
                    $sheet->getStyle($cols['prestamo'] . $row)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                }

                // SUELDO A COBRAR (TOTAL) — FÓRMULA AUTOMÁTICA: (PERCEPCIONES) - (DEDUCCIONES)
                // Percepciones: SUELDO + EXTRA
                // Deducciones: ISR, IMSS, INFONAVIT, AJUSTE_SUB, AUSENTISMO, PERMISOS, RETARDOS, BIOMETRICO, TARJETA, PRESTAMO
                $colSueldo = $cols['sueldo'];
                $colExtra = $cols['extra'];
                $colIsr = $cols['isr'];
                $colImss = $cols['imss'];
                $colInfonavit = $cols['infonavit'];
                $colAjusteSub = isset($cols['ajuste_sub']) ? $cols['ajuste_sub'] : null;
                $colAusentismo = $cols['ausentismo'];
                $colPermisos = $cols['permisos'];
                $colRetardos = $cols['retardos'];
                $colBiometrico = $cols['biometrico'];
                $colTarjeta = $cols['tarjeta'];
                $colPrestamo = $cols['prestamo'];
                
                $percepciones = "({$colSueldo}{$row}+{$colExtra}{$row})";
                // Incluir UNIFORME en deducciones si existe
                $colUniforme = isset($cols['uniforme']) ? $cols['uniforme'] : null;

                $deducciones = "({$colIsr}{$row}+{$colImss}{$row}+{$colInfonavit}{$row}";
                if ($colAjusteSub) {
                    $deducciones .= "+{$colAjusteSub}{$row}";
                }
                if ($colUniforme) {
                    $deducciones .= "+{$colUniforme}{$row}";
                }
                $deducciones .= "+{$colAusentismo}{$row}+{$colPermisos}{$row}+{$colRetardos}{$row}+{$colBiometrico}{$row}+{$colTarjeta}{$row}+{$colPrestamo}{$row})";

                // Fórmula para NETO A RECIBIR (solo incluye deducciones de nómina, ahora con UNIFORME si aplica)
                $deducciones_neto = "({$colIsr}{$row}+{$colImss}{$row}+{$colInfonavit}{$row}";
                if ($colAjusteSub) { $deducciones_neto .= "+{$colAjusteSub}{$row}"; }
                if ($colUniforme) { $deducciones_neto .= "+{$colUniforme}{$row}"; }
                $deducciones_neto .= "+{$colAusentismo}{$row}+{$colPermisos}{$row}+{$colRetardos}{$row}+{$colBiometrico}{$row})";

                if (isset($cols['neto_recibir'])) {
                    $colNet = $cols['neto_recibir'];
                    $formulaNeto = "={$percepciones}-{$deducciones_neto}";
                    $sheet->setCellValue($colNet . $row, $formulaNeto);
                    $sheet->getStyle($colNet . $row)->getNumberFormat()->setFormatCode('"$"#,##0.00');
                    $sheet->getStyle($colNet . $row)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                    // Color rojo
                    $sheet->getStyle($colNet . $row)->getFont()->getColor()->setRGB('FF0000');
                }

                // IMPORTE EN EFECTIVO = NETO A RECIBIR - TARJETA
                if (isset($cols['importe_efectivo'])) {
                    $colImporte = $cols['importe_efectivo'];
                    $colNetRef = isset($cols['neto_recibir']) ? $cols['neto_recibir'] : null;
                    $colTar = isset($cols['tarjeta']) ? $cols['tarjeta'] : null;
                    if ($colNetRef && $colTar) {
                        $formulaImporte = "={$colNetRef}{$row}-{$colTar}{$row}";
                    } elseif ($colNetRef) {
                        $formulaImporte = "={$colNetRef}{$row}";
                    } else {
                        $formulaImporte = "=0";
                    }
                    $sheet->setCellValue($colImporte . $row, $formulaImporte);
                    $sheet->getStyle($colImporte . $row)->getNumberFormat()->setFormatCode('"$"#,##0.00');
                    $sheet->getStyle($colImporte . $row)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                    $sheet->getStyle($colImporte . $row)->getFont()->getColor()->setRGB('FF0000');
                }

                // TOTAL A RECIBIR — ahora: IMPORTE EN EFECTIVO - PRÉSTAMO
                $colImporte = isset($cols['importe_efectivo']) ? $cols['importe_efectivo'] : (isset($cols['neto_recibir']) ? $cols['neto_recibir'] : null);
                $colPrestamo = isset($cols['prestamo']) ? $cols['prestamo'] : null;
                if ($colImporte && $colPrestamo) {
                    $formula = "={$colImporte}{$row}-{$colPrestamo}{$row}";
                } elseif ($colImporte) {
                    // Si no hay columna de préstamo solo mostrar el importe en efectivo
                    $formula = "={$colImporte}{$row}";
                } else {
                    // Fallback al cálculo previo por si no existen columnas de importe/prestamo
                    $formula = "={$percepciones}-{$deducciones}";
                }

                $sheet->setCellValue($cols['total_cobrar'] . $row, $formula);
                $sheet->getStyle($cols['total_cobrar'] . $row)->getNumberFormat()->setFormatCode('"$"#,##0.00;"-$"#,##0.00');
                $sheet->getStyle($cols['total_cobrar'] . $row)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);

                $row++;
                $idx++;
            }
        }
    }
    // Devolver última fila utilizada para poder definir el área de impresión
    return $row - 1;
}

function escribirFilaTotales($sheet, $filaInicio, $filaFin, $cols)
{
    if ($filaFin < $filaInicio) return $filaFin;
    
    $rowTotal = $filaFin + 1;
    
    // Etiqueta "TOTALES"
    $sheet->setCellValue($cols['nombre'] . $rowTotal, 'TOTALES');
    $sheet->getStyle($cols['nombre'] . $rowTotal)->applyFromArray([
        'font' => ['bold' => true, 'size' => 12],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER]
    ]);
    
    // Columnas monetarias a totalizar (incluye UNIFORME solo si existe en $cols)
    $columnasMonetarias = ['sueldo', 'extra', 'isr', 'imss', 'infonavit'];
    if (isset($cols['ajuste_sub'])) { $columnasMonetarias[] = 'ajuste_sub'; }
    $columnasMonetarias = array_merge($columnasMonetarias, ['ausentismo']);
    if (isset($cols['uniforme'])) { $columnasMonetarias[] = 'uniforme'; }
    $columnasMonetarias = array_merge($columnasMonetarias, ['permisos', 'retardos', 'biometrico', 'neto_recibir', 'importe_efectivo', 'tarjeta', 'prestamo', 'total_cobrar']);
    
    foreach ($columnasMonetarias as $key) {
        if (isset($cols[$key])) {
            $col = $cols[$key];
            $formula = "=SUM({$col}{$filaInicio}:{$col}{$filaFin})";
            $sheet->setCellValue($col . $rowTotal, $formula);
            $sheet->getStyle($col . $rowTotal)->applyFromArray([
                'font' => ['bold' => true],
                'numberFormat' => ['formatCode' => '"$"#,##0.00;-"$"#,##0.00'],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_RIGHT]
            ]);
        }
    }
    
    // Altura de la fila de totales
    $sheet->getRowDimension($rowTotal)->setRowHeight(30);
    
    return $rowTotal;
}

// Logo en la esquina (según empresa seleccionada)
try {
    // Detectar si se generarán múltiples hojas (Administración + Todas)
    $depNombreLower = isset($departamento_nombre) ? mb_strtolower($departamento_nombre, 'UTF-8') : '';
    $esAdminDept = (strpos($depNombreLower, 'administracion') !== false) || (strpos($depNombreLower, 'administración') !== false);
    $empresaIdRaw = (is_array($empresa_raw) && isset($empresa_raw['id'])) ? $empresa_raw['id'] : null;
    $empresaEsTodasSel = ($empresaIdRaw === 'Todas' || $empresaIdRaw === null);
    $generaraMultiplesHojas = $esAdminDept && $empresaEsTodasSel;

    if (!$generaraMultiplesHojas) {
        $isCitricsGroup = false;
        if (isset($empresa_raw) && is_array($empresa_raw) && isset($empresa_raw['id'])) {
            $isCitricsGroup = ($empresa_raw['id'] === 2 || $empresa_raw['id'] === '2');
        } else if (isset($empresa_nombre) && is_string($empresa_nombre)) {
            $lower = mb_strtolower($empresa_nombre, 'UTF-8');
            $isCitricsGroup = (strpos($lower, 'citric') !== false && strpos($lower, 'group') !== false);
        }

        $logoPath = $isCitricsGroup
            ? __DIR__ . '/../../public/img/sbgroup_logo.PNG'
            : __DIR__ . '/../../public/img/logo.jpg';

        if (file_exists($logoPath)) {
            $logo = new Drawing();
            $logo->setName('Logo');
            $logo->setDescription('Logo');
            $logo->setPath($logoPath);
            $logo->setHeight(120);
            $logo->setCoordinates('A1');
            $logo->setOffsetX(10);
            $logo->setOffsetY(5);
            $logo->setWorksheet($sheet);
        }
    }
} catch (\Throwable $e) {
    // Ignorar errores de logo
}



// Escribir encabezado estático usando helper
escribirEncabezadoEstatico($sheet, $departamento_nombre, $empresa_nombre, $fecha_nomina, $numero_semana, $fecha_cierre);

// Configurar página para impresión horizontal tamaño carta
$sheet->getPageSetup()
    ->setOrientation(PageSetup::ORIENTATION_LANDSCAPE)
    ->setPaperSize(PageSetup::PAPERSIZE_LETTER)
    ->setFitToWidth(1)
    ->setFitToHeight(0)
    ->setHorizontalCentered(true)
    ->setVerticalCentered(false);

$sheet->getPageMargins()->setTop(0.4)->setRight(0.4)->setLeft(0.4)->setBottom(0.4);

// ==========================
// CARGA DE DATOS (MÍNIMO): NOMBRE
// ==========================
try {
    $nomina = isset($data['nomina']) ? $data['nomina'] : null;
    // Resolver ids seleccionados (si vienen)
    $deptIdSel = null;
    if (is_array($departamento_raw) && isset($departamento_raw['id']) && $departamento_raw['id'] !== 'Todos') {
        $deptIdSel = is_numeric($departamento_raw['id']) ? intval($departamento_raw['id']) : null;
    }
    $empIdSel = null;
    if (is_array($empresa_raw) && isset($empresa_raw['id']) && $empresa_raw['id'] !== 'Todas') {
        $empIdSel = is_numeric($empresa_raw['id']) ? intval($empresa_raw['id']) : null;
    }

    // Detectar flujo multi-hoja por IDs del select (preferente)
    $depEsAdministracion = ($deptIdSel === 1);
    $depEsCdmx = ($deptIdSel === 9);
    $depEsProduccion = ($deptIdSel === 2);
    $depEsTres = ($deptIdSel === 3);
    $empresaEsTodas = ($empIdSel === null) && (!is_array($empresa_raw) || (isset($empresa_raw['id']) && $empresa_raw['id'] === 'Todas') || (is_string($empresa_nombre) && stripos($empresa_nombre, 'todas') !== false));

    if (($depEsAdministracion || $depEsCdmx || $depEsProduccion || $depEsTres) && $empresaEsTodas) {
        // Títulos de hoja según el departamento
        $isDeptCdmx = $depEsCdmx;
        $isDeptProduccion = $depEsProduccion;
        $isDeptTres = $depEsTres;
        $targets = [
            [
                'id' => 1,
                'name' => 'CITRICOS SAAO',
                'title' => ($isDeptCdmx ? 'AdminCdMx-Saao' : ($isDeptProduccion ? 'Produccion-Saao' : ($isDeptTres ? 'SeguridadIntendencia-Saao' : 'Administracion-Saao')))
            ],
            [
                'id' => 2,
                'name' => "SB citric´s group",
                'title' => ($isDeptCdmx ? 'AdminCdMx-CitricsGroup' : ($isDeptProduccion ? 'Produccion-CitricsGroup' : ($isDeptTres ? 'SeguridadIntendenca-SBGroup' : 'Administracion-CitricsGroup')))
            ],
        ];
        $sheetIndex = 0;
        foreach ($targets as $t) {
            $sheet = ($sheetIndex === 0) ? $spreadsheet->getActiveSheet() : $spreadsheet->createSheet();
            $sheet->setTitle($t['title']);

            // Logo específico por hoja/empresa
            try {
                $logoPathSheet = ($t['id'] === 2)
                    ? __DIR__ . '/../../public/img/sbgroup_logo.PNG'
                    : __DIR__ . '/../../public/img/logo.jpg';
                if (file_exists($logoPathSheet)) {
                    $logo = new Drawing();
                    $logo->setName('Logo');
                    $logo->setDescription('Logo');
                    $logo->setPath($logoPathSheet);
                    $logo->setHeight(120);
                    $logo->setCoordinates('A1');
                    $logo->setOffsetX(10);
                    $logo->setOffsetY(5);
                    $logo->setWorksheet($sheet);
                }
            } catch (\Throwable $e) {
                // ignorar errores de logo por hoja
            }

            // Contexto de estilo por IDs
            $GLOBALS['__deptIdForStyle'] = ($deptIdSel !== null ? $deptIdSel : 1);
            $GLOBALS['__empIdForStyle'] = $t['id'];
            $deptForFilter = ($deptIdSel !== null ? $deptIdSel : 1);
            $tieneAjusteSub = tieneAjusteAlSub($nomina, $deptForFilter, $t['id']);
            $headers = ['#','CLAVE','NOMBRE','PUESTO','SUELDO NETO','EXTRA','ISR','IMSS','INFONAVIT'];
            if ($tieneAjusteSub) { $headers[] = 'AJUSTES AL SUB'; }
            $headers = array_merge($headers, ['AUSENTISMO','PERMISOS','RETARDOS','BIOMÉTRICO','NETO A RECIBIR','TARJETA','IMPORTE EN EFECTIVO','PRÉSTAMO','TOTAL A RECIBIR','FIRMA RECIBIDO']);

            escribirEncabezadoEstatico($sheet, $departamento_nombre, $t['name'], $fecha_nomina, $numero_semana, $fecha_cierre);
            escribirEncabezadosTabla($sheet, $headers, 7, $departamento_nombre, $t['name']);

            $cols = ['num'=>'A','clave'=>'B','nombre'=>'C','sueldo'=>'E','extra'=>'F','isr'=>'G','imss'=>'H','infonavit'=>'I'];
            if ($tieneAjusteSub) {
                $cols['ajuste_sub']='J'; $cols['ausentismo']='K'; $cols['uniforme']='L'; $cols['permisos']='M'; $cols['retardos']='N'; $cols['biometrico']='O'; $cols['neto_recibir']='P'; $cols['tarjeta']='Q'; $cols['importe_efectivo']='R'; $cols['prestamo']='S'; $cols['total_cobrar']='T';
            } else {
                $cols['ausentismo']='J'; $cols['uniforme']='K'; $cols['permisos']='L'; $cols['retardos']='M'; $cols['biometrico']='N'; $cols['neto_recibir']='O'; $cols['tarjeta']='P'; $cols['importe_efectivo']='Q'; $cols['prestamo']='R'; $cols['total_cobrar']='S';
            }

            $sheet->getPageSetup()->setOrientation(PageSetup::ORIENTATION_LANDSCAPE)->setPaperSize(PageSetup::PAPERSIZE_LETTER)->setFitToWidth(1)->setFitToHeight(0)->setHorizontalCentered(true)->setVerticalCentered(false);
            $sheet->getPageMargins()->setTop(0.4)->setRight(0.4)->setLeft(0.4)->setBottom(0.4);

            $lastRow = escribirCuerpoDesdeNomina($sheet, $nomina, $deptForFilter, $t['id'], 8, $cols);
            $lastRowWithTotals = ($lastRow && $lastRow >=8) ? escribirFilaTotales($sheet, 8, $lastRow, $cols) : $lastRow;
            if (!empty($lastRowWithTotals) && is_numeric($lastRowWithTotals) && $lastRowWithTotals >= 7) {
                $lastCol = $tieneAjusteSub ? 'T' : 'S';
                $sheet->getPageSetup()->setPrintArea('A1:' . $lastCol . $lastRowWithTotals);
                $bodyRange = 'A8:' . $lastCol . $lastRowWithTotals;
                $sheet->getStyle($bodyRange)->applyFromArray([
                    'alignment' => [ 'horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER, 'wrapText' => true ],
                    'borders' => [ 'allBorders' => [ 'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN, 'color' => ['rgb' => '000000'] ] ]
                ]);
                // Formato moneda por defecto en columnas monetarias para que entradas manuales muestren $
                $monetarias = ['sueldo','extra','isr','imss','infonavit','ausentismo'];
                if (isset($cols['uniforme'])) { $monetarias[] = 'uniforme'; }
                $monetarias = array_merge($monetarias, ['permisos','retardos','biometrico','neto_recibir','importe_efectivo','tarjeta','prestamo','total_cobrar']);
                if (isset($cols['ajuste_sub'])) { $monetarias[] = 'ajuste_sub'; }
                foreach ($monetarias as $k) {
                    if (isset($cols[$k])) {
                        $colLetra = $cols[$k];
                        $rangoMon = $colLetra . '8:' . $colLetra . $lastRowWithTotals;
                        $sheet->getStyle($rangoMon)->getNumberFormat()->setFormatCode('"$"#,##0.00;"-$"#,##0.00');
                        $sheet->getStyle($rangoMon)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                    }
                }
                $columnasDeduccion = ['isr','imss','infonavit','ausentismo'];
                if (isset($cols['uniforme'])) { $columnasDeduccion[] = 'uniforme'; }
                $columnasDeduccion = array_merge($columnasDeduccion, ['permisos','retardos','biometrico','tarjeta','prestamo','neto_recibir','importe_efectivo']); if (isset($cols['ajuste_sub'])) { $columnasDeduccion[]='ajuste_sub'; }
                foreach ($columnasDeduccion as $key) { if (isset($cols[$key])) { $colLetra=$cols[$key]; $rango=$colLetra.'8:'.$colLetra.$lastRowWithTotals; $sheet->getStyle($rango)->getFont()->getColor()->setRGB('FF0000'); } }
                $rangoNombre = $cols['nombre'].'8:'.$cols['nombre'].$lastRowWithTotals; $sheet->getStyle($rangoNombre)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT)->setVertical(Alignment::VERTICAL_CENTER)->setWrapText(true);
                if (isset($cols['total_cobrar'])) { $colFirma = chr(ord($cols['total_cobrar']) + 1); $sheet->getColumnDimension($colFirma)->setWidth(26); }
            }
            $sheetIndex++;
        }
    } elseif ($deptIdSel === null && $empresaEsTodas) {
        // Ambos filtros en "Todos": recorrer depts conocidos y empresas, creando solo hojas con empleados
        $deptList = [1, 9, 2, 3];
        $deptNames = [
            1 => 'Administración',
            9 => 'Administración Sucursal CDMX',
            2 => 'Producción',
            3 => 'SEGURIDAD E INTENDENCIA'
        ];
        $sheetIndex = 0;
        foreach ($deptList as $deptIdLoop) {
            foreach ([[1,'CITRICOS SAAO','Saao'], [2, "SB citric´s group", 'SBGroup']] as $empInfo) {
                $empIdLoop = $empInfo[0];
                $empNameLoop = $empInfo[1];
                $empSlug = $empInfo[2];
                if (!existenEmpleados($nomina, $deptIdLoop, $empIdLoop)) continue;

                $sheet = ($sheetIndex === 0) ? $spreadsheet->getActiveSheet() : $spreadsheet->createSheet();
                // Título por depto
                $baseTitle = ($deptIdLoop === 1 ? 'Administracion' : ($deptIdLoop === 9 ? 'AdminCdMx' : ($deptIdLoop === 2 ? 'Produccion' : 'SeguridadIntendencia')));
                $sheet->setTitle($baseTitle . '-' . $empSlug);

                // Logo por hoja
                try {
                    $logoPathSheet = ($empIdLoop === 2)
                        ? __DIR__ . '/../../public/img/sbgroup_logo.PNG'
                        : __DIR__ . '/../../public/img/logo.jpg';
                    if (file_exists($logoPathSheet)) {
                        $logo = new Drawing();
                        $logo->setName('Logo');
                        $logo->setDescription('Logo');
                        $logo->setPath($logoPathSheet);
                        $logo->setHeight(120);
                        $logo->setCoordinates('A1');
                        $logo->setOffsetX(10);
                        $logo->setOffsetY(5);
                        $logo->setWorksheet($sheet);
                    }
                } catch (\Throwable $e) {}

                // Contexto de estilo por IDs
                $GLOBALS['__deptIdForStyle'] = $deptIdLoop;
                $GLOBALS['__empIdForStyle']  = $empIdLoop;

                $tieneAjusteSub = tieneAjusteAlSub($nomina, $deptIdLoop, $empIdLoop);
                $tieneUniforme = tieneUniforme($nomina, $deptIdLoop, $empIdLoop);
                $headers = ['#','CLAVE','NOMBRE','PUESTO','SUELDO NETO','EXTRA','ISR','IMSS','INFONAVIT'];
                if ($tieneAjusteSub) { $headers[] = 'AJUSTES AL SUB'; }
                $extraHeaders = ['AUSENTISMO'];
                if ($tieneUniforme) $extraHeaders[] = 'UNIFORME';
                $extraHeaders = array_merge($extraHeaders, ['PERMISOS','RETARDOS','BIOMÉTRICO','NETO A RECIBIR','TARJETA','IMPORTE EN EFECTIVO','PRÉSTAMO','TOTAL A RECIBIR','FIRMA RECIBIDO']);
                $headers = array_merge($headers, $extraHeaders);

                // Encabezados
                $deptNameForHeader = isset($deptNames[$deptIdLoop]) ? $deptNames[$deptIdLoop] : 'DEPARTAMENTO';
                escribirEncabezadoEstatico($sheet, $deptNameForHeader, $empNameLoop, $fecha_nomina, $numero_semana, $fecha_cierre);
                escribirEncabezadosTabla($sheet, $headers, 7, $deptNameForHeader, $empNameLoop);

                // Mapeo de columnas
                $cols = ['num'=>'A','clave'=>'B','nombre'=>'C','sueldo'=>'E','extra'=>'F','isr'=>'G','imss'=>'H','infonavit'=>'I'];
                if ($tieneAjusteSub) {
                    if ($tieneUniforme) {
                        $cols['ajuste_sub']='J'; $cols['ausentismo']='K'; $cols['uniforme']='L'; $cols['permisos']='M'; $cols['retardos']='N'; $cols['biometrico']='O'; $cols['neto_recibir']='P'; $cols['tarjeta']='Q'; $cols['importe_efectivo']='R'; $cols['prestamo']='S'; $cols['total_cobrar']='T';
                    } else {
                        $cols['ajuste_sub']='J'; $cols['ausentismo']='K'; $cols['permisos']='L'; $cols['retardos']='M'; $cols['biometrico']='N'; $cols['neto_recibir']='O'; $cols['tarjeta']='P'; $cols['importe_efectivo']='Q'; $cols['prestamo']='R'; $cols['total_cobrar']='S';
                    }
                } else {
                    if ($tieneUniforme) {
                        $cols['ausentismo']='J'; $cols['uniforme']='K'; $cols['permisos']='L'; $cols['retardos']='M'; $cols['biometrico']='N'; $cols['neto_recibir']='O'; $cols['tarjeta']='P'; $cols['importe_efectivo']='Q'; $cols['prestamo']='R'; $cols['total_cobrar']='S';
                    } else {
                        $cols['ausentismo']='J'; $cols['permisos']='K'; $cols['retardos']='L'; $cols['biometrico']='M'; $cols['neto_recibir']='N'; $cols['tarjeta']='O'; $cols['importe_efectivo']='P'; $cols['prestamo']='Q'; $cols['total_cobrar']='R';
                    }
                }

                // Config página
                $sheet->getPageSetup()->setOrientation(PageSetup::ORIENTATION_LANDSCAPE)->setPaperSize(PageSetup::PAPERSIZE_LETTER)->setFitToWidth(1)->setFitToHeight(0)->setHorizontalCentered(true)->setVerticalCentered(false);
                $sheet->getPageMargins()->setTop(0.4)->setRight(0.4)->setLeft(0.4)->setBottom(0.4);

                // Cuerpo
                $lastRow = escribirCuerpoDesdeNomina($sheet, $nomina, $deptIdLoop, $empIdLoop, 8, $cols);
                $lastRowWithTotals = ($lastRow && $lastRow >=8) ? escribirFilaTotales($sheet, 8, $lastRow, $cols) : $lastRow;
                if (!empty($lastRowWithTotals) && is_numeric($lastRowWithTotals) && $lastRowWithTotals >= 7) {
                    $lastCol = $tieneAjusteSub ? 'T' : 'S';
                    $sheet->getPageSetup()->setPrintArea('A1:' . $lastCol . $lastRowWithTotals);
                    $bodyRange = 'A8:' . $lastCol . $lastRowWithTotals;
                    $sheet->getStyle($bodyRange)->applyFromArray([
                        'alignment' => [ 'horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER, 'wrapText' => true ],
                        'borders' => [ 'allBorders' => [ 'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN, 'color' => ['rgb' => '000000'] ] ]
                    ]);
                    // Formato moneda por defecto en columnas monetarias para que entradas manuales muestren $
                    $monetarias = ['sueldo','extra','isr','imss','infonavit','ausentismo'];
                    if (isset($cols['uniforme'])) { $monetarias[] = 'uniforme'; }
                    $monetarias = array_merge($monetarias, ['permisos','retardos','biometrico','neto_recibir','importe_efectivo','tarjeta','prestamo','total_cobrar']);
                    if (isset($cols['ajuste_sub'])) { $monetarias[] = 'ajuste_sub'; }
                    foreach ($monetarias as $k) {
                        if (isset($cols[$k])) {
                            $colLetra = $cols[$k];
                            $rangoMon = $colLetra . '8:' . $colLetra . $lastRowWithTotals;
                            $sheet->getStyle($rangoMon)->getNumberFormat()->setFormatCode('"$"#,##0.00;"-$"#,##0.00');
                            $sheet->getStyle($rangoMon)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                        }
                    }
                    $columnasDeduccion = ['isr','imss','infonavit','ausentismo'];
                    if (isset($cols['uniforme'])) { $columnasDeduccion[] = 'uniforme'; }
                    $columnasDeduccion = array_merge($columnasDeduccion, ['permisos','retardos','biometrico','tarjeta','prestamo','neto_recibir','importe_efectivo']); if (isset($cols['ajuste_sub'])) { $columnasDeduccion[]='ajuste_sub'; }
                    foreach ($columnasDeduccion as $key) { if (isset($cols[$key])) { $colLetra=$cols[$key]; $rango=$colLetra.'8:'.$colLetra.$lastRowWithTotals; $sheet->getStyle($rango)->getFont()->getColor()->setRGB('FF0000'); } }
                    $rangoNombre = $cols['nombre'].'8:'.$cols['nombre'].$lastRowWithTotals; $sheet->getStyle($rangoNombre)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT)->setVertical(Alignment::VERTICAL_CENTER)->setWrapText(true);
                    if (isset($cols['total_cobrar'])) { $colFirma = chr(ord($cols['total_cobrar']) + 1); $sheet->getColumnDimension($colFirma)->setWidth(26); }
                }
                $sheetIndex++;
            }
        }
    } else {
        // Contexto de estilo por IDs para una sola hoja
        $GLOBALS['__deptIdForStyle'] = $deptIdSel;
        $GLOBALS['__empIdForStyle']  = $empIdSel;
        // Verificar si existe AJUSTES AL SUB
        $tieneAjusteSub = tieneAjusteAlSub($nomina, $deptIdSel, $empIdSel);

        $tieneUniforme = tieneUniforme($nomina, $deptIdSel, $empIdSel);
        $headers = ['#','CLAVE','NOMBRE','PUESTO','SUELDO NETO','EXTRA','ISR','IMSS','INFONAVIT'];
        if ($tieneAjusteSub) { $headers[] = 'AJUSTES AL SUB'; }
        $extraHeaders = ['AUSENTISMO'];
        if ($tieneUniforme) $extraHeaders[] = 'UNIFORME';
        $extraHeaders = array_merge($extraHeaders, ['PERMISOS','RETARDOS','BIOMÉTRICO','NETO A RECIBIR','TARJETA','IMPORTE EN EFECTIVO','PRÉSTAMO','TOTAL A RECIBIR','FIRMA RECIBIDO']);
        $headers = array_merge($headers, $extraHeaders);

        $cols = ['num'=>'A','clave'=>'B','nombre'=>'C','sueldo'=>'E','extra'=>'F','isr'=>'G','imss'=>'H','infonavit'=>'I'];
        if ($tieneAjusteSub) {
            if ($tieneUniforme) {
                $cols['ajuste_sub']='J'; $cols['ausentismo']='K'; $cols['uniforme']='L'; $cols['permisos']='M'; $cols['retardos']='N'; $cols['biometrico']='O'; $cols['neto_recibir']='P'; $cols['tarjeta']='Q'; $cols['importe_efectivo']='R'; $cols['prestamo']='S'; $cols['total_cobrar']='T';
            } else {
                $cols['ajuste_sub']='J'; $cols['ausentismo']='K'; $cols['permisos']='L'; $cols['retardos']='M'; $cols['biometrico']='N'; $cols['neto_recibir']='O'; $cols['tarjeta']='P'; $cols['importe_efectivo']='Q'; $cols['prestamo']='R'; $cols['total_cobrar']='S';
            }
        } else {
            if ($tieneUniforme) {
                $cols['ausentismo']='J'; $cols['uniforme']='K'; $cols['permisos']='L'; $cols['retardos']='M'; $cols['biometrico']='N'; $cols['neto_recibir']='O'; $cols['tarjeta']='P'; $cols['importe_efectivo']='Q'; $cols['prestamo']='R'; $cols['total_cobrar']='S';
            } else {
                $cols['ausentismo']='J'; $cols['permisos']='K'; $cols['retardos']='L'; $cols['biometrico']='M'; $cols['neto_recibir']='N'; $cols['tarjeta']='O'; $cols['importe_efectivo']='P'; $cols['prestamo']='Q'; $cols['total_cobrar']='R';
            }
        }

        escribirEncabezadosTabla($sheet, $headers, 7, $departamento_nombre, $empresa_nombre);
        $lastRow = escribirCuerpoDesdeNomina($sheet, $nomina, $deptIdSel, $empIdSel, 8, $cols);
        $lastRowWithTotals = ($lastRow && $lastRow >= 8) ? escribirFilaTotales($sheet, 8, $lastRow, $cols) : $lastRow;
        if (!empty($lastRowWithTotals) && is_numeric($lastRowWithTotals) && $lastRowWithTotals >= 7) {
            $lastCol = $tieneAjusteSub ? 'T' : 'S';
            $sheet->getPageSetup()->setPrintArea('A1:' . $lastCol . $lastRowWithTotals);
            $bodyRange = 'A8:' . $lastCol . $lastRowWithTotals;
            $sheet->getStyle($bodyRange)->applyFromArray([
                'alignment' => [ 'horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER, 'wrapText' => true ],
                'borders' => [ 'allBorders' => [ 'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN, 'color' => ['rgb' => '000000'] ] ]
            ]);
            // Formato moneda por defecto en columnas monetarias para que entradas manuales muestren $
            $monetarias = ['sueldo','extra','isr','imss','infonavit','ausentismo','uniforme','permisos','retardos','biometrico','neto_recibir','importe_efectivo','tarjeta','prestamo','total_cobrar'];
            if (isset($cols['ajuste_sub'])) { $monetarias[] = 'ajuste_sub'; }
            foreach ($monetarias as $k) {
                if (isset($cols[$k])) {
                    $colLetra = $cols[$k];
                    $rangoMon = $colLetra . '8:' . $colLetra . $lastRowWithTotals;
                    $sheet->getStyle($rangoMon)->getNumberFormat()->setFormatCode('"$"#,##0.00;"-$"#,##0.00');
                    $sheet->getStyle($rangoMon)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                }
            }
            $columnasDeduccion = ['isr','imss','infonavit','ausentismo','uniforme','permisos','retardos','biometrico','tarjeta','prestamo','neto_recibir','importe_efectivo']; if (isset($cols['ajuste_sub'])) { $columnasDeduccion[]='ajuste_sub'; }
            foreach ($columnasDeduccion as $key) { if (isset($cols[$key])) { $colLetra=$cols[$key]; $rango=$colLetra.'8:'.$colLetra.$lastRowWithTotals; $sheet->getStyle($rango)->getFont()->getColor()->setRGB('FF0000'); } }
            $rangoNombre = $cols['nombre'].'8:'.$cols['nombre'].$lastRowWithTotals; $sheet->getStyle($rangoNombre)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT)->setVertical(Alignment::VERTICAL_CENTER)->setWrapText(true);
            if (isset($cols['total_cobrar'])) { $colFirma = chr(ord($cols['total_cobrar']) + 1); $sheet->getColumnDimension($colFirma)->setWidth(26); }
        }
    }
} catch (\Throwable $e) {
    // Silencioso para no romper descarga si no viene estructura esperada
}

// Preparar descarga (XLSX)
if (ob_get_contents()) ob_end_clean();
header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
$filename = ($titulo ? $titulo : 'nomina') . "_semana_{$numero_semana}.xlsx";
header('Content-Disposition: attachment; filename="' . $filename . '"');
header('Cache-Control: max-age=0');

$writer = new Xlsx($spreadsheet);
$writer->save('php://output');
exit;
