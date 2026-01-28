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

function tieneFaGafetCofia($nomina, $deptIdSel = null, $empIdSel = null)
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
                $val = null;
                if (isset($emp['fa_gafet_cofia']) && is_numeric($emp['fa_gafet_cofia'])) {
                    $val = (float)$emp['fa_gafet_cofia'];
                }
                if ($val !== null && $val != 0) return true;
            }
        }
    }
    return false;
}

function escribirEncabezadoEstatico($sheet, $departamento_nombre, $empresa_nombre, $fecha_nomina, $numero_semana = '', $fecha_cierre = '', $lastCol = 'S')
{
    // Ajuste: Si el departamento es 'Sin Seguro' y la empresa aparece como 'Todas', forzar 'Citricos Saao'
    if (mb_strtolower(trim($departamento_nombre ?: ''), 'UTF-8') === 'sin seguro') {
        if (is_string($empresa_nombre) && stripos($empresa_nombre, 'tod') !== false) {
            $empresa_nombre = 'Citricos Saao';
        }
    }

    // Línea 1: Nombre del departamento (grande, verde)
    $sheet->mergeCells('B1:' . $lastCol . '1');
    $sheet->setCellValue('B1', ($departamento_nombre ?: 'DEPARTAMENTO'));
    $sheet->getStyle('B1')->applyFromArray([
        'font' => ['bold' => true, 'size' => 28, 'color' => ['rgb' => '008000']],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER]
    ]);

    // Línea 2: Nombre de la empresa (verde, mediano)
    $sheet->mergeCells('B2:' . $lastCol . '2');
    $sheet->setCellValue('B2', ($empresa_nombre ?: 'EMPRESA'));
    $sheet->getStyle('B2')->applyFromArray([
        'font' => ['bold' => true, 'size' => 22, 'color' => ['rgb' => '008000']],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER]
    ]);

    // Línea 3: Fecha de la nómina (negrita, centrado)
    $sheet->mergeCells('B3:' . $lastCol . '3');
    $sheet->setCellValue('B3', ($fecha_nomina ?: ''));
    $sheet->getStyle('B3')->applyFromArray([
        'font' => ['bold' => true, 'size' => 20, 'color' => ['rgb' => '000000']],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER]
    ]);

    // Línea 4: Semana y año - Extraer año de fecha_cierre (formato: "02/Ene/2026")
    $sheet->mergeCells('B4:' . $lastCol . '4');
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
        'font' => ['bold' => true, 'size' => 20, 'color' => ['rgb' => '000000']],
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

    // Si es el departamento "Sin Seguro", usar encabezado amarillo
    if (strpos($depLower, 'sin seguro') !== false) {
        return [
            'fill' => [
                'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                'startColor' => ['rgb' => 'FFF79A'] // amarillo claro
            ],
            'font' => ['bold' => true, 'color' => ['rgb' => '000000']],
            'borders' => [],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER]
        ];
    }

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
    // Detectar si hay columnas adicionales específicas (AJUSTES AL SUB y/o F.A/GAFET/COFIA)
    $tieneAjusteSubHeader = in_array('AJUSTES AL SUB', $headers, true);
    $tieneFaGafetHeader = in_array('F.A/GAFET/COFIA', $headers, true);
    // Determinar ancho de FIRMA RECIBIDO: 16 si ambas, 18 si una, 20 si ninguna (aumentado +2)
    $widthFirmaHeader = ($tieneAjusteSubHeader && $tieneFaGafetHeader) ? 16 : (($tieneAjusteSubHeader || $tieneFaGafetHeader) ? 18 : 20);
    
    // Calcular columna de FIRMA RECIBIDO (última columna)
    $numCols = count($headers);
    $colFirmaRecibido = chr(ord('A') + $numCols - 1);
    
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
        // Reducir tamaño de fuente sólo para el encabezado "AUSENTISMO"
        if (trim($h) === 'AUSENTISMO') {
            $sheet->getStyle($cell)->getFont()->setSize(9);
        }
        // Encabezados especiales: hacer la columna ligeramente más estrecha y la fuente pequeña
        if (in_array(trim($h), ['F.A/GAFET/COFIA', 'REDONDEADO', 'TOTAL EFECTIVO REDONDEADO'], true)) {
            $sheet->getStyle($cell)->getFont()->setSize(9);
            // Establecer ancho específico para estas columnas (un poco más estrecho)
            $sheet->getColumnDimension($col)->setWidth(10);
        }
        
        // Anchos básicos por tipo de dato
        $tieneCualquiera = ($tieneAjusteSubHeader || $tieneFaGafetHeader);
        if ($col === 'A') $sheet->getColumnDimension($col)->setWidth(5);
        else if ($col === 'B') $sheet->getColumnDimension($col)->setWidth($tieneCualquiera ? 9 : 10);
        else if ($col === 'C') $sheet->getColumnDimension($col)->setWidth($tieneCualquiera ? 32 : 40); // NOMBRE más ancho, reducido cuando hay columnas adicionales
        else if ($col === 'D') $sheet->getColumnDimension($col)->setWidth(14);
        else if ($col === $colFirmaRecibido) $sheet->getColumnDimension($col)->setWidth($widthFirmaHeader); // FIRMA RECIBIDO
        else {
            // Asignar ancho 12 a todas las columnas monetarias entre 'E' y la columna ANTES de FIRMA RECIBIDO
            $lastCol = chr(ord('A') + count($headers) - 1);
            if (ord($col) >= ord('E') && ord($col) < ord($lastCol)) {
                $sheet->getColumnDimension($col)->setWidth(12);
            } else {
                $sheet->getColumnDimension($col)->setAutoSize(true);
            }
        }
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
                
                // Detectar si hay columnas adicionales para ajustar tamaño de fuente
                $tieneAjusteSub = isset($cols['ajuste_sub']);
                $tieneFaGafetCofia = isset($cols['fa_gafet_cofia']);
                $tieneColumnasAdicionales = $tieneAjusteSub || $tieneFaGafetCofia;
                
                // CENTRAR COLUMNA # (A)
                $sheet->getStyle($cols['num'] . $row)->getAlignment()
                    ->setHorizontal(Alignment::HORIZONTAL_CENTER)
                    ->setVertical(Alignment::VERTICAL_CENTER);

                // CENTRAR COLUMNA CLAVE (B) y reducir fuente si hay columnas adicionales
                $sheet->getStyle('B' . $row)->getAlignment()
                    ->setHorizontal(Alignment::HORIZONTAL_CENTER)
                    ->setVertical(Alignment::VERTICAL_CENTER);
                if ($tieneColumnasAdicionales) {
                    $sheet->getStyle('B' . $row)->getFont()->setSize(9);
                }

                // 👉 ALTURA DEL CUERPO (AQUÍ VA) — sólo si hay datos visibles
                if (trim((string)$nombre) !== '') {
                    $sheet->getRowDimension($row)->setRowHeight(38);
                }

                // 👉 ALINEACIÓN Y WRAP DEL NOMBRE (reducir fuente si hay columnas adicionales)
                $sheet->getStyle($cols['nombre'] . $row)->getAlignment()
                    ->setWrapText(true)
                    ->setVertical(Alignment::VERTICAL_CENTER);
                // Tamaño de fuente para nombre
                $sheet->getStyle($cols['nombre'] . $row)->getFont()->setSize($tieneColumnasAdicionales ? 11 : 12);

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

                // TARJETA - escribir como valor negativo (para que SUM funcione y el formato muestre -$)
                $val = $getNum(['tarjeta','tarjeta_total']);
                if ($val === null) $val = $fromConcept('TARJETA');
                if ($val !== null && $val != 0) {
                    $sheet->setCellValue($cols['tarjeta'] . $row, -abs($val));
                    $sheet->getStyle($cols['tarjeta'] . $row)->getNumberFormat()->setFormatCode('"$"#,##0.00;-"$"#,##0.00');
                    $sheet->getStyle($cols['tarjeta'] . $row)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                }

                // ISR (código 45) - escribir como negativo
                $val = $getNum(['isr']);
                if ($val === null) $val = $fromConcept(null, ['45']);
                if ($val !== null && $val != 0) {
                    $sheet->setCellValue($cols['isr'] . $row, -abs($val));
                    $sheet->getStyle($cols['isr'] . $row)->getNumberFormat()->setFormatCode('"$"#,##0.00;-"$"#,##0.00');
                    $sheet->getStyle($cols['isr'] . $row)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                }

                // IMSS (código 52) - negativo
                $val = $getNum(['imss']);
                if ($val === null) $val = $fromConcept(null, ['52']);
                if ($val !== null && $val != 0) {
                    $sheet->setCellValue($cols['imss'] . $row, -abs($val));
                    $sheet->getStyle($cols['imss'] . $row)->getNumberFormat()->setFormatCode('"$"#,##0.00;-"$"#,##0.00');
                    $sheet->getStyle($cols['imss'] . $row)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                }

                // AJUSTES AL SUB (código 107) - negativo si existe la columna
                if (isset($cols['ajuste_sub'])) {
                    $val = $getNum(['ajuste_sub', 'ajustes_sub']);
                    if ($val === null) $val = $fromConcept(null, ['107']);
                    if ($val !== null && $val != 0) {
                        $sheet->setCellValue($cols['ajuste_sub'] . $row, -abs($val));
                        $sheet->getStyle($cols['ajuste_sub'] . $row)->getNumberFormat()->setFormatCode('"$"#,##0.00;-"$"#,##0.00');
                        $sheet->getStyle($cols['ajuste_sub'] . $row)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                    }
                }

                // INFONAVIT (código 16) - negativo (auto-conversión: usuario escribe 10 → se convierte a -10)
                $val = $getNum(['infonavit']);
                if ($val === null) $val = $fromConcept(null, ['16']);
                if ($val !== null && $val != 0) {
                    $sheet->setCellValue($cols['infonavit'] . $row, -abs($val));
                    // Formato que multiplica automáticamente por -1 cualquier entrada positiva
                    $sheet->getStyle($cols['infonavit'] . $row)->getNumberFormat()->setFormatCode('"$"#,##0.00_);[RED]-"$"#,##0.00;"$"0.00_);@');
                    $sheet->getStyle($cols['infonavit'] . $row)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                }

                // AUSENTISMO (o INASISTENCIA) - negativo (auto-conversión: usuario escribe 10 → se convierte a -10)
                $val = $getNum(['ausentismo','inasistencia']);
                if ($val !== null && $val != 0) {
                    $sheet->setCellValue($cols['ausentismo'] . $row, -abs($val));
                    $sheet->getStyle($cols['ausentismo'] . $row)->getNumberFormat()->setFormatCode('-"$"#,##0.00;-"$"#,##0.00');
                    $sheet->getStyle($cols['ausentismo'] . $row)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                }

                // UNIFORME - negativo (igual que AJUSTES AL SUB)
                if (isset($cols['uniforme'])) {
                    $val = $getNum(['uniformes','uniforme']);
                    if ($val === null) $val = $fromConcept('UNIFORME');
                    if ($val !== null && $val != 0) {
                        $sheet->setCellValue($cols['uniforme'] . $row, -abs($val));
                        $sheet->getStyle($cols['uniforme'] . $row)->getNumberFormat()->setFormatCode('"$"#,##0.00;-"$"#,##0.00');
                        $sheet->getStyle($cols['uniforme'] . $row)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                    }
                }

                // PERMISOS - DEDUCCIÓN (escriba -10 para descontar $10.00)
                $val = $getNum(['permisos','permiso']);
                if ($val !== null && $val != 0) {
                    $sheet->setCellValue($cols['permisos'] . $row, -abs($val));
                } else {
                    $sheet->setCellValue($cols['permisos'] . $row, '');
                }
                // Formato que muestra claramente deducciones en rojo
                $sheet->getStyle($cols['permisos'] . $row)->getNumberFormat()->setFormatCode('_-"$"* #,##0.00_-;[RED]-"$"* #,##0.00;_-"$"* "-"??_-;_-@_-');
                $sheet->getStyle($cols['permisos'] . $row)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                $sheet->getStyle($cols['permisos'] . $row)->getFont()->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color(\PhpOffice\PhpSpreadsheet\Style\Color::COLOR_RED));

                // RETARDOS - negativo (auto-conversión: usuario escribe 10 → se convierte a -10)
                $val = $getNum(['retardos','retardo']);
                if ($val !== null && $val != 0) {
                    $sheet->setCellValue($cols['retardos'] . $row, -abs($val));
                    // Formato que siempre muestra valores como negativos y convierte entrada positiva a negativa
                    $sheet->getStyle($cols['retardos'] . $row)->getNumberFormat()->setFormatCode('-"$"#,##0.00;-"$"#,##0.00');
                    $sheet->getStyle($cols['retardos'] . $row)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                }

                // BIOMÉTRICO (CHECADOR) - negativo (auto-conversión: usuario escribe 10 → se convierte a -10)
                $val = $getNum(['biometrico','checador']);
                if ($val !== null && $val != 0) {
                    $sheet->setCellValue($cols['biometrico'] . $row, -abs($val));
                    // Formato que siempre muestra valores como negativos y convierte entrada positiva a negativa
                    $sheet->getStyle($cols['biometrico'] . $row)->getNumberFormat()->setFormatCode('-"$"#,##0.00;-"$"#,##0.00');
                    $sheet->getStyle($cols['biometrico'] . $row)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                }

                // F.A/GAFET/COFIA - negativo si existe
                if (isset($cols['fa_gafet_cofia'])) {
                    $val = $getNum(['fa_gafet_cofia']);
                    if ($val !== null && $val != 0) {
                        $sheet->setCellValue($cols['fa_gafet_cofia'] . $row, -abs($val));
                        $sheet->getStyle($cols['fa_gafet_cofia'] . $row)->getNumberFormat()->setFormatCode('"$"#,##0.00;-"$"#,##0.00');
                        $sheet->getStyle($cols['fa_gafet_cofia'] . $row)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                    }
                }

                // NETO A RECIBIR e IMPORTE EN EFECTIVO se establecerán como fórmulas Excel más abajo (cuando las letras de columna estén definidas).

                // PRÉSTAMO - negativo (auto-conversión: usuario escribe 10 → se convierte a -10)
                $val = $getNum(['prestamo','préstamo']);
                if ($val !== null && $val != 0) {
                    $sheet->setCellValue($cols['prestamo'] . $row, -abs($val));
                    // Formato que multiplica automáticamente por -1 cualquier entrada positiva
                    $sheet->getStyle($cols['prestamo'] . $row)->getNumberFormat()->setFormatCode('"$"#,##0.00_);[RED]-"$"#,##0.00;"$"0.00_);@');
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
                // Incluir UNIFORME y F.A/GAFET/COFIA en deducciones si existen
                $colUniforme = isset($cols['uniforme']) ? $cols['uniforme'] : null;
                $colFaGafetCofia = isset($cols['fa_gafet_cofia']) ? $cols['fa_gafet_cofia'] : null;

                $deducciones = "({$colIsr}{$row}+{$colImss}{$row}+{$colInfonavit}{$row}";
                if ($colAjusteSub) {
                    $deducciones .= "+{$colAjusteSub}{$row}";
                }
                if ($colUniforme) {
                    $deducciones .= "+{$colUniforme}{$row}";
                }
                if ($colFaGafetCofia) {
                    $deducciones .= "+{$colFaGafetCofia}{$row}";
                }
                $deducciones .= "+{$colAusentismo}{$row}+{$colPermisos}{$row}+{$colRetardos}{$row}+{$colBiometrico}{$row}+{$colTarjeta}{$row}+{$colPrestamo}{$row})";

                // Fórmula para NETO A RECIBIR mediante AutoSuma de E hasta la columna anterior a NETO (todas las deducciones ya son negativas)
                if (isset($cols['neto_recibir'])) {
                    $colNet = $cols['neto_recibir'];
                    $colAntesDeNeto = chr(ord($colNet) - 1);
                    $formulaNeto = "=SUM({$colSueldo}{$row}:{$colAntesDeNeto}{$row})";
                    $sheet->setCellValue($colNet . $row, $formulaNeto);
                    $sheet->getStyle($colNet . $row)->getNumberFormat()->setFormatCode('"$"#,##0.00;-"$"#,##0.00');
                    $sheet->getStyle($colNet . $row)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                }

                // IMPORTE EN EFECTIVO = NETO A RECIBIR - TARJETA
                if (isset($cols['importe_efectivo'])) {
                    $colImporte = $cols['importe_efectivo'];
                    $colNetRef = isset($cols['neto_recibir']) ? $cols['neto_recibir'] : null;
                    $colTar = isset($cols['tarjeta']) ? $cols['tarjeta'] : null;
                    if ($colNetRef && $colTar) {
                        $formulaImporte = "={$colNetRef}{$row}+{$colTar}{$row}";
                    } elseif ($colNetRef) {
                        $formulaImporte = "={$colNetRef}{$row}";
                    } else {
                        $formulaImporte = "=0";
                    }
                    $sheet->setCellValue($colImporte . $row, $formulaImporte);
                    $sheet->getStyle($colImporte . $row)->getNumberFormat()->setFormatCode('"$"#,##0.00;-"$"#,##0.00');
                    $sheet->getStyle($colImporte . $row)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                }

                // TOTAL A RECIBIR — ahora: IMPORTE EN EFECTIVO - PRÉSTAMO
                $colImporte = isset($cols['importe_efectivo']) ? $cols['importe_efectivo'] : (isset($cols['neto_recibir']) ? $cols['neto_recibir'] : null);
                $colPrestamo = isset($cols['prestamo']) ? $cols['prestamo'] : null;
                if ($colImporte && $colPrestamo) {
                    // PRESTAMO es negativo; sumar para aplicar la deducción
                    $formula = "={$colImporte}{$row}+{$colPrestamo}{$row}";
                } elseif ($colImporte) {
                    // Si no hay columna de préstamo solo mostrar el importe en efectivo
                    $formula = "={$colImporte}{$row}";
                } else {
                    // Fallback al cálculo previo por si no existen columnas de importe/prestamo
                    $formula = "=SUM({$colSueldo}{$row}:{$colBiometrico}{$row})";
                }

                $sheet->setCellValue($cols['total_cobrar'] . $row, $formula);
                $sheet->getStyle($cols['total_cobrar'] . $row)->getNumberFormat()->setFormatCode('"$"#,##0.00;"-$"#,##0.00');
                $sheet->getStyle($cols['total_cobrar'] . $row)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);

                // COLUMNAS NUEVAS: REDONDEADO y TOTAL EFECTIVO REDONDEADO (calculadas dinámicamente)
                if (isset($cols['total_cobrar'])) {
                    $colRed = chr(ord($cols['total_cobrar']) + 1);
                    $colTotalEfectivoRed = chr(ord($cols['total_cobrar']) + 2);

                    // REDONDEO: tomar la propiedad del empleado si existe
                    $valRed = (isset($emp['redondeo']) && is_numeric($emp['redondeo'])) ? (float)$emp['redondeo'] : 0.0;
                    $sheet->setCellValue($colRed . $row, $valRed);
                    $sheet->getStyle($colRed . $row)->getNumberFormat()->setFormatCode('"$"#,##0.00');
                    $sheet->getStyle($colRed . $row)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                    // Color de fuente: rojo si negativo, negro si positivo o cero
                    if ($valRed < 0) {
                        $sheet->getStyle($colRed . $row)->getFont()->getColor()->setRGB('FF0000');
                    } else {
                        $sheet->getStyle($colRed . $row)->getFont()->getColor()->setRGB('000000');
                    }

                    // TOTAL EFECTIVO REDONDEADO = TOTAL A RECIBIR + REDONDEO
                    $formulaTotalEfectivoRed = "={$cols['total_cobrar']}{$row}+{$colRed}{$row}";
                    $sheet->setCellValue($colTotalEfectivoRed . $row, $formulaTotalEfectivoRed);
                    $sheet->getStyle($colTotalEfectivoRed . $row)->getNumberFormat()->setFormatCode('"$"#,##0.00');
                    $sheet->getStyle($colTotalEfectivoRed . $row)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
                }

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
    
    // Columnas monetarias a totalizar (incluye UNIFORME y F.A/GAFET/COFIA solo si existen en $cols)
    $columnasMonetarias = ['sueldo', 'extra', 'isr', 'imss', 'infonavit'];
    if (isset($cols['ajuste_sub'])) { $columnasMonetarias[] = 'ajuste_sub'; }
    $columnasMonetarias = array_merge($columnasMonetarias, ['ausentismo']);
    if (isset($cols['uniforme'])) { $columnasMonetarias[] = 'uniforme'; }
    if (isset($cols['fa_gafet_cofia'])) { $columnasMonetarias[] = 'fa_gafet_cofia'; }
    $columnasMonetarias = array_merge($columnasMonetarias, ['permisos', 'retardos', 'biometrico', 'neto_recibir', 'importe_efectivo', 'tarjeta', 'prestamo', 'total_cobrar']);
    
    $siempreNegativo = ['isr','imss','infonavit','ausentismo','permisos','retardos','biometrico','tarjeta','prestamo'];
            foreach ($columnasMonetarias as $key) {
        if (isset($cols[$key])) {
            $col = $cols[$key];
            $formula = "=SUM({$col}{$filaInicio}:{$col}{$filaFin})";
            $sheet->setCellValue($col . $rowTotal, $formula);
            // Aplicar formato y alineación; usar formato que fuerza -$ para columnas seleccionadas
            if (in_array($key, $siempreNegativo, true)) {
                $formatCode = '-"$"#,##0.00;-"$"#,##0.00;-"$"0.00';
            } else {
                $formatCode = '"$"#,##0.00;-"$"#,##0.00';
            }
            $sheet->getStyle($col . $rowTotal)->applyFromArray([
                'font' => ['bold' => true],
                'alignment' => ['horizontal' => Alignment::HORIZONTAL_RIGHT]
            ]);
            $sheet->getStyle($col . $rowTotal)->getNumberFormat()->setFormatCode($formatCode);
        }
    }
    
    // Totales para REDONDEADO y TOTAL EFECTIVO REDONDEADO si existen
    if (isset($cols['total_cobrar'])) {
        $colRed = chr(ord($cols['total_cobrar']) + 1);
        $colTotalEfectivoRed = chr(ord($cols['total_cobrar']) + 2);
        $sheet->setCellValue($colRed . $rowTotal, "=SUM({$colRed}{$filaInicio}:{$colRed}{$filaFin})");
        $sheet->getStyle($colRed . $rowTotal)->applyFromArray([
            'font' => ['bold' => true],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_RIGHT]
        ]);
        $sheet->getStyle($colRed . $rowTotal)->getNumberFormat()->setFormatCode('"$"#,##0.00');

        $sheet->setCellValue($colTotalEfectivoRed . $rowTotal, "=SUM({$colTotalEfectivoRed}{$filaInicio}:{$colTotalEfectivoRed}{$filaFin})");
        $sheet->getStyle($colTotalEfectivoRed . $rowTotal)->applyFromArray([
            'font' => ['bold' => true],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_RIGHT]
        ]);
        $sheet->getStyle($colTotalEfectivoRed . $rowTotal)->getNumberFormat()->setFormatCode('"$"#,##0.00');
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



// Nota: El encabezado estático ahora se escribe más adelante, cuando ya conocemos
// la última columna real según los headers construidos para cada hoja.

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

    // Caso especial: Departamento "Sin Seguro" (id 0) — incluir empleados del dept 'sin seguro' y/o por empresa seleccionada
    if ($deptIdSel === 0) {
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Sin Seguro');

        // Borrar posibles encabezados previos para evitar que queden "TODAS" u otros nombres
        $sheet->setCellValue('B1','');
        $sheet->setCellValue('B2','');
        $sheet->setCellValue('B3','');
        $sheet->setCellValue('B4','');

        // Contexto de estilo
        $GLOBALS['__deptIdForStyle'] = $deptIdSel;
        $GLOBALS['__empIdForStyle'] = $empIdSel;

        $tieneAjusteSub = tieneAjusteAlSub($nomina, $deptIdSel, $empIdSel);
        $tieneUniforme = tieneUniforme($nomina, $deptIdSel, $empIdSel);
        $tieneFaGafetCofia = tieneFaGafetCofia($nomina, $deptIdSel, $empIdSel);

        $headers = ['#','CLAVE','NOMBRE','PUESTO','SUELDO NETO','EXTRA','ISR','IMSS','INFONAVIT'];
        if ($tieneAjusteSub) { $headers[] = 'AJUSTES AL SUB'; }
        $extraHeaders = ['AUSENTISMO'];
        if ($tieneUniforme) $extraHeaders[] = 'UNIFORME';
        $extraHeaders = array_merge($extraHeaders, ['PERMISOS','RETARDOS','BIOMÉTRICO']);
        if ($tieneFaGafetCofia) $extraHeaders[] = 'F.A/GAFET/COFIA';
        $extraHeaders = array_merge($extraHeaders, ['NETO A RECIBIR','TARJETA','IMPORTE EN EFECTIVO','PRÉSTAMO','TOTAL A RECIBIR','REDONDEADO','TOTAL EFECTIVO REDONDEADO','FIRMA RECIBIDO']);
        $headers = array_merge($headers, $extraHeaders);

        // Nota: Los encabezados se escribirán por hoja (por empresa) más abajo para reflejar correctamente
        // el nombre de la empresa (evitamos dejar el encabezado con 'TODAS' sobreescrito incorrectamente).

        $cols = ['num'=>'A','clave'=>'B','nombre'=>'C','sueldo'=>'E','extra'=>'F','isr'=>'G','imss'=>'H','infonavit'=>'I'];
        if ($tieneAjusteSub) {
            if ($tieneUniforme && $tieneFaGafetCofia) {
                $cols['ajuste_sub']='J'; $cols['ausentismo']='K'; $cols['uniforme']='L'; $cols['permisos']='M'; $cols['retardos']='N'; $cols['biometrico']='O'; $cols['fa_gafet_cofia']='P'; $cols['neto_recibir']='Q'; $cols['tarjeta']='R'; $cols['importe_efectivo']='S'; $cols['prestamo']='T'; $cols['total_cobrar']='U';
            } elseif ($tieneUniforme) {
                $cols['ajuste_sub']='J'; $cols['ausentismo']='K'; $cols['uniforme']='L'; $cols['permisos']='M'; $cols['retardos']='N'; $cols['biometrico']='O'; $cols['neto_recibir']='P'; $cols['tarjeta']='Q'; $cols['importe_efectivo']='R'; $cols['prestamo']='S'; $cols['total_cobrar']='T';
            } elseif ($tieneFaGafetCofia) {
                $cols['ajuste_sub']='J'; $cols['ausentismo']='K'; $cols['permisos']='L'; $cols['retardos']='M'; $cols['biometrico']='N'; $cols['fa_gafet_cofia']='O'; $cols['neto_recibir']='P'; $cols['tarjeta']='Q'; $cols['importe_efectivo']='R'; $cols['prestamo']='S'; $cols['total_cobrar']='T';
            } else {
                $cols['ajuste_sub']='J'; $cols['ausentismo']='K'; $cols['permisos']='L'; $cols['retardos']='M'; $cols['biometrico']='N'; $cols['neto_recibir']='O'; $cols['tarjeta']='P'; $cols['importe_efectivo']='Q'; $cols['prestamo']='R'; $cols['total_cobrar']='S';
            }
        } else {
            if ($tieneUniforme && $tieneFaGafetCofia) {
                $cols['ausentismo']='J'; $cols['uniforme']='K'; $cols['permisos']='L'; $cols['retardos']='M'; $cols['biometrico']='N'; $cols['fa_gafet_cofia']='O'; $cols['neto_recibir']='P'; $cols['tarjeta']='Q'; $cols['importe_efectivo']='R'; $cols['prestamo']='S'; $cols['total_cobrar']='T';
            } elseif ($tieneUniforme) {
                $cols['ausentismo']='J'; $cols['uniforme']='K'; $cols['permisos']='L'; $cols['retardos']='M'; $cols['biometrico']='N'; $cols['neto_recibir']='O'; $cols['tarjeta']='P'; $cols['importe_efectivo']='Q'; $cols['prestamo']='R'; $cols['total_cobrar']='S';
            } elseif ($tieneFaGafetCofia) {
                $cols['ausentismo']='J'; $cols['permisos']='K'; $cols['retardos']='L'; $cols['biometrico']='M'; $cols['fa_gafet_cofia']='N'; $cols['neto_recibir']='O'; $cols['tarjeta']='P'; $cols['importe_efectivo']='Q'; $cols['prestamo']='R'; $cols['total_cobrar']='S';
            } else {
                $cols['ausentismo']='J'; $cols['permisos']='K'; $cols['retardos']='L'; $cols['biometrico']='M'; $cols['neto_recibir']='N'; $cols['tarjeta']='O'; $cols['importe_efectivo']='P'; $cols['prestamo']='Q'; $cols['total_cobrar']='R';
            }
        }

        // Recolectar empleados únicamente del/los departamentos cuyo nombre contiene 'sin seguro'
        $sinEmployees = [];
        if (isset($nomina['departamentos']) && is_array($nomina['departamentos'])) {
            foreach ($nomina['departamentos'] as $d) {
                if (!isset($d['nombre']) || !is_string($d['nombre'])) continue;
                if (stripos($d['nombre'], 'sin seguro') === false) continue;
                if (!isset($d['empleados']) || !is_array($d['empleados'])) continue;
                foreach ($d['empleados'] as $emp) {
                    $sinEmployees[] = $emp;
                }
            }
        }

        // Si no hay empleados en el depto 'Sin Seguro', crear al menos encabezado indicando la empresa seleccionada
        if (count($sinEmployees) === 0) {
            // Si se seleccionó empresa, usar su nombre.
            // Si no se seleccionó (empresa = 'Todas'), usar por defecto 'Citricos Saao' en vez de 'Todas' para evitar encabezados genéricos.
            // Esto asegura que el encabezado muestre 'Citricos Saao' cuando la selección es "Todas" y no hay empleados en 'Sin Seguro'.
            $companyTitleFallback = ($empIdSel !== null && isset($empresa_nombre) && $empresa_nombre)
                ? $empresa_nombre
                : (isset($empresaEsTodas) && $empresaEsTodas ? 'Citricos Saao' : 'Empresa');
            $headers = ['#','CLAVE','NOMBRE','PUESTO','SUELDO NETO','EXTRA','ISR','IMSS','INFONAVIT'];
            if ($tieneAjusteSub) { $headers[] = 'AJUSTES AL SUB'; }
            $extraHeaders = ['AUSENTISMO'];
            if ($tieneUniforme) $extraHeaders[] = 'UNIFORME';
            $extraHeaders = array_merge($extraHeaders, ['PERMISOS','RETARDOS','BIOMÉTRICO']);
            if ($tieneFaGafetCofia) $extraHeaders[] = 'F.A/GAFET/COFIA';
            $extraHeaders = array_merge($extraHeaders, ['NETO A RECIBIR','TARJETA','IMPORTE EN EFECTIVO','PRÉSTAMO','TOTAL A RECIBIR','REDONDEADO','TOTAL EFECTIVO REDONDEADO','FIRMA RECIBIDO']);
            $headers = array_merge($headers, $extraHeaders);
            $lastColHeader = chr(ord('A') + count($headers) - 1);
            escribirEncabezadoEstatico($sheet, 'Sin Seguro', $companyTitleFallback, $fecha_nomina, $numero_semana, $fecha_cierre, $lastColHeader);
            escribirEncabezadosTabla($sheet, $headers, 7, 'Sin Seguro', $companyTitleFallback);

            $lastRow = 0;
        } else {
            // Si seleccionaron una empresa específica, filtrar por id_empresa y crear solo esa hoja
            $groups = [];
            if ($empIdSel !== null) {
                foreach ($sinEmployees as $e) {
                    if (isset($e['id_empresa']) && intval($e['id_empresa']) === intval($empIdSel)) {
                        $key = (string)intval($e['id_empresa']);
                        if (!isset($groups[$key])) $groups[$key] = [];
                        $groups[$key][] = $e;
                    }
                }
            } else {
                // Agrupar por id_empresa (usar '0' para sin id)
                foreach ($sinEmployees as $e) {
                    $key = isset($e['id_empresa']) ? (string)intval($e['id_empresa']) : '0';
                    if (!isset($groups[$key])) $groups[$key] = [];
                    $groups[$key][] = $e;
                }
            }

            // Crear una hoja por cada grupo (empresa)
            $sheetIndex = 0;
            $anyLastRow = 0;
            foreach ($groups as $groupId => $emps) {
                $sheet = ($sheetIndex === 0) ? $spreadsheet->getActiveSheet() : $spreadsheet->createSheet();
                // Nombre de la empresa para título
                // Determinar nombre de empresa preferente: primero intentar extraerlo de los datos del empleado; si no, usar mapeo por id
                $companyTitle = null;
                $firstEmp = (count($emps) > 0) ? $emps[0] : null;
                $possibleKeys = ['empresa','empresa_nombre','empresaName','empresaNombre','empresa_nombre_completa','empresaNombreEmpresa','company','company_name'];
                if ($firstEmp) {
                    foreach ($possibleKeys as $k) {
                        if (isset($firstEmp[$k]) && is_string($firstEmp[$k]) && trim($firstEmp[$k]) !== '') {
                            $companyTitle = trim($firstEmp[$k]);
                            break;
                        }
                    }
                }
                if ($companyTitle === null) {
                    // Si el usuario seleccionó explicitamente la empresa y corresponde, usar su nombre
                    if (isset($empIdSel) && $empIdSel !== null && (string)$empIdSel === (string)$groupId && isset($empresa_nombre) && trim($empresa_nombre) !== '') {
                        $companyTitle = $empresa_nombre;
                    } else {
                        // Fallback a nombres legibles por id
                        $gid = intval($groupId);
                    if ($gid === 1) $companyTitle = 'Citricos Saao';
                    elseif ($gid === 2) $companyTitle = 'SB group';
                    elseif ($gid === 0) $companyTitle = 'Sin Empresa';
                    else $companyTitle = 'Empresa ' . $groupId;
                    }
                }

                // Limitar título de hoja a 31 caracteres
                $sheetTitle = substr('Sin Seguro - ' . $companyTitle, 0, 31);
                $sheet->setTitle($sheetTitle);

                // Preparar encabezados y detectar columnas según el grupo actual
                $tempNomina = ['departamentos' => [['empleados' => $emps]]];
                $tieneAjusteSubGroup = tieneAjusteAlSub($tempNomina, null, null);
                $tieneUniformeGroup = tieneUniforme($tempNomina, null, null);
                $tieneFaGafetCofiaGroup = tieneFaGafetCofia($tempNomina, null, null);

                $headers = ['#','CLAVE','NOMBRE','PUESTO','SUELDO NETO','EXTRA','ISR','IMSS','INFONAVIT'];
                if ($tieneAjusteSubGroup) { $headers[] = 'AJUSTES AL SUB'; }
                $extraHeaders = ['AUSENTISMO'];
                if ($tieneUniformeGroup) $extraHeaders[] = 'UNIFORME';
                $extraHeaders = array_merge($extraHeaders, ['PERMISOS','RETARDOS','BIOMÉTRICO']);
                if ($tieneFaGafetCofiaGroup) $extraHeaders[] = 'F.A/GAFET/COFIA';
                $extraHeaders = array_merge($extraHeaders, ['NETO A RECIBIR','TARJETA','IMPORTE EN EFECTIVO','PRÉSTAMO','TOTAL A RECIBIR','REDONDEADO','TOTAL EFECTIVO REDONDEADO','FIRMA RECIBIDO']);
                $headers = array_merge($headers, $extraHeaders);

                $lastColHeader = chr(ord('A') + count($headers) - 1);
                escribirEncabezadoEstatico($sheet, 'Sin Seguro', $companyTitle, $fecha_nomina, $numero_semana, $fecha_cierre, $lastColHeader);
                // Forzar el nombre de empresa en la segunda línea del encabezado para evitar que quede 'TODAS'
                $sheet->mergeCells('B2:' . $lastColHeader . '2');
                $sheet->setCellValue('B2', $companyTitle);
                $sheet->getStyle('B2')->applyFromArray([
                    'font' => ['bold' => true, 'size' => 22, 'color' => ['rgb' => '008000']],
                    'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER]
                ]);
                escribirEncabezadosTabla($sheet, $headers, 7, 'Sin Seguro', $companyTitle);

                // Mapear columnas similar a otras hojas
                $cols = ['num'=>'A','clave'=>'B','nombre'=>'C','sueldo'=>'E','extra'=>'F','isr'=>'G','imss'=>'H','infonavit'=>'I'];
                if ($tieneAjusteSubGroup) {
                    if ($tieneUniformeGroup && $tieneFaGafetCofiaGroup) {
                        $cols['ajuste_sub']='J'; $cols['ausentismo']='K'; $cols['uniforme']='L'; $cols['permisos']='M'; $cols['retardos']='N'; $cols['biometrico']='O'; $cols['fa_gafet_cofia']='P'; $cols['neto_recibir']='Q'; $cols['tarjeta']='R'; $cols['importe_efectivo']='S'; $cols['prestamo']='T'; $cols['total_cobrar']='U';
                    } elseif ($tieneUniformeGroup) {
                        $cols['ajuste_sub']='J'; $cols['ausentismo']='K'; $cols['uniforme']='L'; $cols['permisos']='M'; $cols['retardos']='N'; $cols['biometrico']='O'; $cols['neto_recibir']='P'; $cols['tarjeta']='Q'; $cols['importe_efectivo']='R'; $cols['prestamo']='S'; $cols['total_cobrar']='T';
                    } elseif ($tieneFaGafetCofiaGroup) {
                        $cols['ajuste_sub']='J'; $cols['ausentismo']='K'; $cols['permisos']='L'; $cols['retardos']='M'; $cols['biometrico']='N'; $cols['fa_gafet_cofia']='O'; $cols['neto_recibir']='P'; $cols['tarjeta']='Q'; $cols['importe_efectivo']='R'; $cols['prestamo']='S'; $cols['total_cobrar']='T';
                    } else {
                        $cols['ajuste_sub']='J'; $cols['ausentismo']='K'; $cols['permisos']='L'; $cols['retardos']='M'; $cols['biometrico']='N'; $cols['neto_recibir']='O'; $cols['tarjeta']='P'; $cols['importe_efectivo']='Q'; $cols['prestamo']='R'; $cols['total_cobrar']='S';
                    }
                } else {
                    if ($tieneUniformeGroup && $tieneFaGafetCofiaGroup) {
                        $cols['ausentismo']='J'; $cols['uniforme']='K'; $cols['permisos']='L'; $cols['retardos']='M'; $cols['biometrico']='N'; $cols['fa_gafet_cofia']='O'; $cols['neto_recibir']='P'; $cols['tarjeta']='Q'; $cols['importe_efectivo']='R'; $cols['prestamo']='S'; $cols['total_cobrar']='T';
                    } elseif ($tieneUniformeGroup) {
                        $cols['ausentismo']='J'; $cols['uniforme']='K'; $cols['permisos']='L'; $cols['retardos']='M'; $cols['biometrico']='N'; $cols['neto_recibir']='O'; $cols['tarjeta']='P'; $cols['importe_efectivo']='Q'; $cols['prestamo']='R'; $cols['total_cobrar']='S';
                    } elseif ($tieneFaGafetCofiaGroup) {
                        $cols['ausentismo']='J'; $cols['permisos']='K'; $cols['retardos']='L'; $cols['biometrico']='M'; $cols['fa_gafet_cofia']='N'; $cols['neto_recibir']='O'; $cols['tarjeta']='P'; $cols['importe_efectivo']='Q'; $cols['prestamo']='R'; $cols['total_cobrar']='S';
                    } else {
                        $cols['ausentismo']='J'; $cols['permisos']='K'; $cols['retardos']='L'; $cols['biometrico']='M'; $cols['neto_recibir']='N'; $cols['tarjeta']='O'; $cols['importe_efectivo']='P'; $cols['prestamo']='Q'; $cols['total_cobrar']='R';
                    }
                }

                // Escribir cuerpo usando un nomina temporal que contiene sólo estos empleados
                $groupNomina = ['departamentos' => [['nombre' => 'Sin Seguro', 'empleados' => $emps]]];
                $lastRow = escribirCuerpoDesdeNomina($sheet, $groupNomina, null, null, 8, $cols);
                $lastRowWithTotals = ($lastRow && $lastRow >=8) ? escribirFilaTotales($sheet, 8, $lastRow, $cols) : $lastRow;
                if (!empty($lastRowWithTotals) && is_numeric($lastRowWithTotals) && $lastRowWithTotals >= 7) {
                    $lastCol = isset($cols['total_cobrar']) ? chr(ord($cols['total_cobrar']) + 3) : ($tieneAjusteSubGroup ? 'T' : 'S');
                    $sheet->getPageSetup()->setPrintArea('A1:' . $lastCol . $lastRowWithTotals);
                    $bodyRange = 'A8:' . $lastCol . $lastRowWithTotals;
                    $sheet->getStyle($bodyRange)->applyFromArray([
                        'alignment' => [ 'horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER, 'wrapText' => true ],
                        'borders' => [ 'allBorders' => [ 'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN, 'color' => ['rgb' => '000000'] ] ]
                    ]);
                }

                $anyLastRow = max($anyLastRow, $lastRowWithTotals);
                $sheetIndex++;
            }
            // Para compatibilidad posterior, asignar $lastRow/$lastRowWithTotals al último creado
            $lastRow = $anyLastRow;
            // Marcar que ya manejamos totales por hoja en el caso 'Sin Seguro' multi-hoja
            $sinSeguroMultiHandled = true;
        }
        // Si no manejamos el caso 'Sin Seguro' multi-hoja, calcular totales aquí (evita duplicados)
        if (empty($sinSeguroMultiHandled)) {
            $lastRowWithTotals = ($lastRow && $lastRow >=8) ? escribirFilaTotales($sheet, 8, $lastRow, $cols) : $lastRow;
        } else {
            $lastRowWithTotals = $lastRow;
        }
        if (!empty($lastRowWithTotals) && is_numeric($lastRowWithTotals) && $lastRowWithTotals >= 7) {
            $lastCol = isset($cols['total_cobrar']) ? chr(ord($cols['total_cobrar']) + 3) : ($tieneAjusteSub ? 'T' : 'S');
            $sheet->getPageSetup()->setPrintArea('A1:' . $lastCol . $lastRowWithTotals);
            $bodyRange = 'A8:' . $lastCol . $lastRowWithTotals;
            $sheet->getStyle($bodyRange)->applyFromArray([
                'alignment' => [ 'horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER, 'wrapText' => true ],
                'borders' => [ 'allBorders' => [ 'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN, 'color' => ['rgb' => '000000'] ] ]
            ]);
            $monetarias = ['sueldo','extra','isr','imss','infonavit','ausentismo'];
            if (isset($cols['fa_gafet_cofia'])) { $monetarias[] = 'fa_gafet_cofia'; }
            $monetarias = array_merge($monetarias, ['permisos','retardos','biometrico','neto_recibir','importe_efectivo','tarjeta','prestamo','total_cobrar']);
            if (isset($cols['ajuste_sub'])) { $monetarias[] = 'ajuste_sub'; }
            $siempreNegativo = ['isr','imss','infonavit','ausentismo','permisos','retardos','biometrico','tarjeta','prestamo'];
            foreach ($monetarias as $k) {
                if (isset($cols[$k])) {
                    $colLetra = $cols[$k];
                    $rangoMon = $colLetra . '8:' . $colLetra . $lastRowWithTotals;
                    if (in_array($k, $siempreNegativo, true)) {
                        $formato = '-"$"#,##0.00;-"$"#,##0.00;-"$"0.00';
                    } else {
                        $formato = '"$"#,##0.00;-"$"#,##0.00';
                    }
                    $sheet->getStyle($rangoMon)->getNumberFormat()->setFormatCode($formato);
                    $sheet->getStyle($rangoMon)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                }
            }
            $columnasDeduccion = ['isr','imss','infonavit','ausentismo'];
            if (isset($cols['uniforme'])) { $columnasDeduccion[] = 'uniforme'; }
            if (isset($cols['fa_gafet_cofia'])) { $columnasDeduccion[] = 'fa_gafet_cofia'; }
            $columnasDeduccion = array_merge($columnasDeduccion, ['permisos','retardos','biometrico','tarjeta','prestamo']); if (isset($cols['ajuste_sub'])) { $columnasDeduccion[]='ajuste_sub'; }
            foreach ($columnasDeduccion as $key) { if (isset($cols[$key])) { $colLetra=$cols[$key]; $rango=$colLetra.'8:'.$colLetra.$lastRowWithTotals; $sheet->getStyle($rango)->getFont()->getColor()->setRGB('FF0000'); } }
            $rangoNombre = $cols['nombre'].'8:'.$cols['nombre'].$lastRowWithTotals; $sheet->getStyle($rangoNombre)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT)->setVertical(Alignment::VERTICAL_CENTER)->setWrapText(true);
            if (isset($cols['total_cobrar'])) {
                $colFirma = chr(ord($cols['total_cobrar']) + 3);
                $tieneAjusteSub = isset($cols['ajuste_sub']);
                $tieneFaGafet = isset($cols['fa_gafet_cofia']);
                $widthFirma = ($tieneAjusteSub && $tieneFaGafet) ? 18 : (($tieneAjusteSub || $tieneFaGafet) ? 20 : 22);
                $sheet->getColumnDimension($colFirma)->setWidth($widthFirma);
            }
        }
    
    }

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
            $tieneFaGafetCofia = tieneFaGafetCofia($nomina, $deptForFilter, $t['id']);
            $headers = ['#','CLAVE','NOMBRE','PUESTO','SUELDO NETO','EXTRA','ISR','IMSS','INFONAVIT'];
            if ($tieneAjusteSub) { $headers[] = 'AJUSTES AL SUB'; }
            $extraHeaders = ['AUSENTISMO','PERMISOS','RETARDOS','BIOMÉTRICO'];
            if ($tieneFaGafetCofia) { $extraHeaders[] = 'F.A/GAFET/COFIA'; }
            $extraHeaders = array_merge($extraHeaders, ['NETO A RECIBIR','TARJETA','IMPORTE EN EFECTIVO','PRÉSTAMO','TOTAL A RECIBIR','REDONDEADO','TOTAL EFECTIVO REDONDEADO','FIRMA RECIBIDO']);
            $headers = array_merge($headers, $extraHeaders);

            // Calcular última columna de encabezado según cantidad de headers
            $lastColHeader = chr(ord('A') + count($headers) - 1);
            escribirEncabezadoEstatico($sheet, $departamento_nombre, $t['name'], $fecha_nomina, $numero_semana, $fecha_cierre, $lastColHeader);
            escribirEncabezadosTabla($sheet, $headers, 7, $departamento_nombre, $t['name']);

            $cols = ['num'=>'A','clave'=>'B','nombre'=>'C','sueldo'=>'E','extra'=>'F','isr'=>'G','imss'=>'H','infonavit'=>'I'];
            if ($tieneAjusteSub) {
                if ($tieneFaGafetCofia) {
                    $cols['ajuste_sub']='J'; $cols['ausentismo']='K'; $cols['permisos']='L'; $cols['retardos']='M'; $cols['biometrico']='N'; $cols['fa_gafet_cofia']='O'; $cols['neto_recibir']='P'; $cols['tarjeta']='Q'; $cols['importe_efectivo']='R'; $cols['prestamo']='S'; $cols['total_cobrar']='T';
                } else {
                    $cols['ajuste_sub']='J'; $cols['ausentismo']='K'; $cols['permisos']='L'; $cols['retardos']='M'; $cols['biometrico']='N'; $cols['neto_recibir']='O'; $cols['tarjeta']='P'; $cols['importe_efectivo']='Q'; $cols['prestamo']='R'; $cols['total_cobrar']='S';
                }
            } else {
                if ($tieneFaGafetCofia) {
                    $cols['ausentismo']='J'; $cols['permisos']='K'; $cols['retardos']='L'; $cols['biometrico']='M'; $cols['fa_gafet_cofia']='N'; $cols['neto_recibir']='O'; $cols['tarjeta']='P'; $cols['importe_efectivo']='Q'; $cols['prestamo']='R'; $cols['total_cobrar']='S';
                } else {
                    $cols['ausentismo']='J'; $cols['permisos']='K'; $cols['retardos']='L'; $cols['biometrico']='M'; $cols['neto_recibir']='N'; $cols['tarjeta']='O'; $cols['importe_efectivo']='P'; $cols['prestamo']='Q'; $cols['total_cobrar']='R';
                }
            }

            $sheet->getPageSetup()->setOrientation(PageSetup::ORIENTATION_LANDSCAPE)->setPaperSize(PageSetup::PAPERSIZE_LETTER)->setFitToWidth(1)->setFitToHeight(0)->setHorizontalCentered(true)->setVerticalCentered(false);
            $sheet->getPageMargins()->setTop(0.4)->setRight(0.4)->setLeft(0.4)->setBottom(0.4);

            $lastRow = escribirCuerpoDesdeNomina($sheet, $nomina, $deptForFilter, $t['id'], 8, $cols);
            $lastRowWithTotals = ($lastRow && $lastRow >=8) ? escribirFilaTotales($sheet, 8, $lastRow, $cols) : $lastRow;
            if (!empty($lastRowWithTotals) && is_numeric($lastRowWithTotals) && $lastRowWithTotals >= 7) {
                // Calcular última columna dinámicamente incluyendo REDONDEADO y TOTAL EFECTIVO REDONDEADO
                $lastCol = isset($cols['total_cobrar']) ? chr(ord($cols['total_cobrar']) + 3) : ($tieneAjusteSub ? 'T' : 'S');
                $sheet->getPageSetup()->setPrintArea('A1:' . $lastCol . $lastRowWithTotals);
                $bodyRange = 'A8:' . $lastCol . $lastRowWithTotals;
                $sheet->getStyle($bodyRange)->applyFromArray([
                    'alignment' => [ 'horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER, 'wrapText' => true ],
                    'borders' => [ 'allBorders' => [ 'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN, 'color' => ['rgb' => '000000'] ] ]
                ]);
                // Formato moneda por defecto en columnas monetarias para que entradas manuales muestren $
                $monetarias = ['sueldo','extra','isr','imss','infonavit','ausentismo'];
                if (isset($cols['fa_gafet_cofia'])) { $monetarias[] = 'fa_gafet_cofia'; }
                $monetarias = array_merge($monetarias, ['permisos','retardos','biometrico','neto_recibir','importe_efectivo','tarjeta','prestamo','total_cobrar']);
                if (isset($cols['ajuste_sub'])) { $monetarias[] = 'ajuste_sub'; }
                $siempreNegativo = ['isr','imss','infonavit','ausentismo','permisos','retardos','biometrico','tarjeta','prestamo'];
                foreach ($monetarias as $k) {
                    if (isset($cols[$k])) {
                        $colLetra = $cols[$k];
                        $rangoMon = $colLetra . '8:' . $colLetra . $lastRowWithTotals;
                        // Si la columna pertenece a las deducciones que siempre deben mostrar -$, aplicar formato que fuerza el signo negativo visualmente
                        if (in_array($k, $siempreNegativo, true)) {
                            $formato = '-"$"#,##0.00;-"$"#,##0.00;-"$"0.00';
                        } else {
                            $formato = '"$"#,##0.00;-"$"#,##0.00';
                        }
                        $sheet->getStyle($rangoMon)->getNumberFormat()->setFormatCode($formato);
                        $sheet->getStyle($rangoMon)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                    }
                }
                $columnasDeduccion = ['isr','imss','infonavit','ausentismo'];
                if (isset($cols['fa_gafet_cofia'])) { $columnasDeduccion[] = 'fa_gafet_cofia'; }
                $columnasDeduccion = array_merge($columnasDeduccion, ['permisos','retardos','biometrico','tarjeta','prestamo']); if (isset($cols['ajuste_sub'])) { $columnasDeduccion[]='ajuste_sub'; }
                foreach ($columnasDeduccion as $key) { if (isset($cols[$key])) { $colLetra=$cols[$key]; $rango=$colLetra.'8:'.$colLetra.$lastRowWithTotals; $sheet->getStyle($rango)->getFont()->getColor()->setRGB('FF0000'); } }
                $rangoNombre = $cols['nombre'].'8:'.$cols['nombre'].$lastRowWithTotals; $sheet->getStyle($rangoNombre)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT)->setVertical(Alignment::VERTICAL_CENTER)->setWrapText(true);
                if (isset($cols['total_cobrar'])) {
                    // La columna de FIRMA ahora está desplazada +3 posiciones respecto a total_cobrar (redondeo + total_efectivo_redondeado)
                    $colFirma = chr(ord($cols['total_cobrar']) + 3);
                    $tieneAjusteSub = isset($cols['ajuste_sub']);
                    $tieneFaGafet = isset($cols['fa_gafet_cofia']);
                    $widthFirma = ($tieneAjusteSub && $tieneFaGafet) ? 18 : (($tieneAjusteSub || $tieneFaGafet) ? 20 : 22);
                    $sheet->getColumnDimension($colFirma)->setWidth($widthFirma);
                }
            }
            $sheetIndex++;
        }
    } elseif ($deptIdSel === null && !$empresaEsTodas && $empIdSel !== null) {
        // Departamento: Todos, Empresa: específica (p.ej. 1 o 2)
        // Recorrer todos los departamentos pero solo empleados de la empresa seleccionada
        $deptList = [1, 9, 2, 3];
        $deptNames = [
            1 => 'Administración',
            9 => 'Administración Sucursal CDMX',
            2 => 'Producción',
            3 => 'SEGURIDAD E INTENDENCIA'
        ];
        // Mapear empresa seleccionada a nombre y slug
        $empIdLoop = intval($empIdSel);
        $empNameLoop = ($empIdLoop === 2) ? "SB citric´s group" : 'CITRICOS SAAO';
        $empSlug = ($empIdLoop === 2) ? 'SBGroup' : 'Saao';
        $sheetIndex = 0;
        foreach ($deptList as $deptIdLoop) {
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
            $tieneFaGafetCofia = tieneFaGafetCofia($nomina, $deptIdLoop, $empIdLoop);
            $headers = ['#','CLAVE','NOMBRE','PUESTO','SUELDO NETO','EXTRA','ISR','IMSS','INFONAVIT'];
            if ($tieneAjusteSub) { $headers[] = 'AJUSTES AL SUB'; }
            $extraHeaders = ['AUSENTISMO'];
            if ($tieneUniforme) $extraHeaders[] = 'UNIFORME';
            $extraHeaders = array_merge($extraHeaders, ['PERMISOS','RETARDOS','BIOMÉTRICO']);
            if ($tieneFaGafetCofia) $extraHeaders[] = 'F.A/GAFET/COFIA';
            $extraHeaders = array_merge($extraHeaders, ['NETO A RECIBIR','TARJETA','IMPORTE EN EFECTIVO','PRÉSTAMO','TOTAL A RECIBIR','REDONDEADO','TOTAL EFECTIVO REDONDEADO','FIRMA RECIBIDO']);
            $headers = array_merge($headers, $extraHeaders);

            // Encabezados
            $deptNameForHeader = isset($deptNames[$deptIdLoop]) ? $deptNames[$deptIdLoop] : 'DEPARTAMENTO';
            // Calcular última columna de encabezado según cantidad de headers
            $lastColHeader = chr(ord('A') + count($headers) - 1);
            escribirEncabezadoEstatico($sheet, $deptNameForHeader, $empNameLoop, $fecha_nomina, $numero_semana, $fecha_cierre, $lastColHeader);
            escribirEncabezadosTabla($sheet, $headers, 7, $deptNameForHeader, $empNameLoop);

            // Mapeo de columnas
            $cols = ['num'=>'A','clave'=>'B','nombre'=>'C','sueldo'=>'E','extra'=>'F','isr'=>'G','imss'=>'H','infonavit'=>'I'];
            if ($tieneAjusteSub) {
                if ($tieneUniforme && $tieneFaGafetCofia) {
                    $cols['ajuste_sub']='J'; $cols['ausentismo']='K'; $cols['uniforme']='L'; $cols['permisos']='M'; $cols['retardos']='N'; $cols['biometrico']='O'; $cols['fa_gafet_cofia']='P'; $cols['neto_recibir']='Q'; $cols['tarjeta']='R'; $cols['importe_efectivo']='S'; $cols['prestamo']='T'; $cols['total_cobrar']='U';
                } elseif ($tieneUniforme) {
                    $cols['ajuste_sub']='J'; $cols['ausentismo']='K'; $cols['uniforme']='L'; $cols['permisos']='M'; $cols['retardos']='N'; $cols['biometrico']='O'; $cols['neto_recibir']='P'; $cols['tarjeta']='Q'; $cols['importe_efectivo']='R'; $cols['prestamo']='S'; $cols['total_cobrar']='T';
                } elseif ($tieneFaGafetCofia) {
                    $cols['ajuste_sub']='J'; $cols['ausentismo']='K'; $cols['permisos']='L'; $cols['retardos']='M'; $cols['biometrico']='N'; $cols['fa_gafet_cofia']='O'; $cols['neto_recibir']='P'; $cols['tarjeta']='Q'; $cols['importe_efectivo']='R'; $cols['prestamo']='S'; $cols['total_cobrar']='T';
                } else {
                    $cols['ajuste_sub']='J'; $cols['ausentismo']='K'; $cols['permisos']='L'; $cols['retardos']='M'; $cols['biometrico']='N'; $cols['neto_recibir']='O'; $cols['tarjeta']='P'; $cols['importe_efectivo']='Q'; $cols['prestamo']='R'; $cols['total_cobrar']='S';
                }
            } else {
                if ($tieneUniforme && $tieneFaGafetCofia) {
                    $cols['ausentismo']='J'; $cols['uniforme']='K'; $cols['permisos']='L'; $cols['retardos']='M'; $cols['biometrico']='N'; $cols['fa_gafet_cofia']='O'; $cols['neto_recibir']='P'; $cols['tarjeta']='Q'; $cols['importe_efectivo']='R'; $cols['prestamo']='S'; $cols['total_cobrar']='T';
                } elseif ($tieneUniforme) {
                    $cols['ausentismo']='J'; $cols['uniforme']='K'; $cols['permisos']='L'; $cols['retardos']='M'; $cols['biometrico']='N'; $cols['neto_recibir']='O'; $cols['tarjeta']='P'; $cols['importe_efectivo']='Q'; $cols['prestamo']='R'; $cols['total_cobrar']='S';
                } elseif ($tieneFaGafetCofia) {
                    $cols['ausentismo']='J'; $cols['permisos']='K'; $cols['retardos']='L'; $cols['biometrico']='M'; $cols['fa_gafet_cofia']='N'; $cols['neto_recibir']='O'; $cols['tarjeta']='P'; $cols['importe_efectivo']='Q'; $cols['prestamo']='R'; $cols['total_cobrar']='S';
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
                // Calcular última columna dinámicamente (incluye FIRMA RECIBIDO)
                $lastCol = isset($cols['total_cobrar']) ? chr(ord($cols['total_cobrar']) + 3) : 'S';
                $sheet->getPageSetup()->setPrintArea('A1:' . $lastCol . $lastRowWithTotals);
                $bodyRange = 'A8:' . $lastCol . $lastRowWithTotals;
                $sheet->getStyle($bodyRange)->applyFromArray([
                    'alignment' => [ 'horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER, 'wrapText' => true ],
                    'borders' => [ 'allBorders' => [ 'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN, 'color' => ['rgb' => '000000'] ] ]
                ]);
                // Formato moneda por defecto en columnas monetarias
                $monetarias = ['sueldo','extra','isr','imss','infonavit','ausentismo'];
                if (isset($cols['uniforme'])) { $monetarias[] = 'uniforme'; }
                if (isset($cols['fa_gafet_cofia'])) { $monetarias[] = 'fa_gafet_cofia'; }
                $monetarias = array_merge($monetarias, ['permisos','retardos','biometrico','neto_recibir','importe_efectivo','tarjeta','prestamo','total_cobrar']);
                if (isset($cols['ajuste_sub'])) { $monetarias[] = 'ajuste_sub'; }
                $siempreNegativo = ['isr','imss','infonavit','ausentismo','permisos','retardos','biometrico','tarjeta','prestamo'];
                foreach ($monetarias as $k) {
                    if (isset($cols[$k])) {
                        $colLetra = $cols[$k];
                        $rangoMon = $colLetra . '8:' . $colLetra . $lastRowWithTotals;
                        if (in_array($k, $siempreNegativo, true)) {
                            $formato = '-"$"#,##0.00;-"$"#,##0.00;-"$"0.00';
                        } else {
                            $formato = '"$"#,##0.00;-"$"#,##0.00';
                        }
                        $sheet->getStyle($rangoMon)->getNumberFormat()->setFormatCode($formato);
                        $sheet->getStyle($rangoMon)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                    }
                }
                $columnasDeduccion = ['isr','imss','infonavit','ausentismo'];
                if (isset($cols['uniforme'])) { $columnasDeduccion[] = 'uniforme'; }
                if (isset($cols['fa_gafet_cofia'])) { $columnasDeduccion[] = 'fa_gafet_cofia'; }
                $columnasDeduccion = array_merge($columnasDeduccion, ['permisos','retardos','biometrico','tarjeta','prestamo']); if (isset($cols['ajuste_sub'])) { $columnasDeduccion[]='ajuste_sub'; }
                foreach ($columnasDeduccion as $key) { if (isset($cols[$key])) { $colLetra=$cols[$key]; $rango=$colLetra.'8:'.$colLetra.$lastRowWithTotals; $sheet->getStyle($rango)->getFont()->getColor()->setRGB('FF0000'); } }
                $rangoNombre = $cols['nombre'].'8:'.$cols['nombre'].$lastRowWithTotals; $sheet->getStyle($rangoNombre)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT)->setVertical(Alignment::VERTICAL_CENTER)->setWrapText(true);
                if (isset($cols['total_cobrar'])) {
                    $colFirma = chr(ord($cols['total_cobrar']) + 3);
                    $tieneAjusteSubCol = isset($cols['ajuste_sub']);
                    $tieneFaGafetCol = isset($cols['fa_gafet_cofia']);
                    $widthFirma = ($tieneAjusteSubCol && $tieneFaGafetCol) ? 18 : (($tieneAjusteSubCol || $tieneFaGafetCol) ? 20 : 22);
                    $sheet->getColumnDimension($colFirma)->setWidth($widthFirma);
                }
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
                $tieneFaGafetCofia = tieneFaGafetCofia($nomina, $deptIdLoop, $empIdLoop);
                $headers = ['#','CLAVE','NOMBRE','PUESTO','SUELDO NETO','EXTRA','ISR','IMSS','INFONAVIT'];
                if ($tieneAjusteSub) { $headers[] = 'AJUSTES AL SUB'; }
                $extraHeaders = ['AUSENTISMO'];
                if ($tieneUniforme) $extraHeaders[] = 'UNIFORME';
                $extraHeaders = array_merge($extraHeaders, ['PERMISOS','RETARDOS','BIOMÉTRICO']);
                if ($tieneFaGafetCofia) $extraHeaders[] = 'F.A/GAFET/COFIA';
                $extraHeaders = array_merge($extraHeaders, ['NETO A RECIBIR','TARJETA','IMPORTE EN EFECTIVO','PRÉSTAMO','TOTAL A RECIBIR','REDONDEADO','TOTAL EFECTIVO REDONDEADO','FIRMA RECIBIDO']);
                $headers = array_merge($headers, $extraHeaders);

                // Encabezados
                $deptNameForHeader = isset($deptNames[$deptIdLoop]) ? $deptNames[$deptIdLoop] : 'DEPARTAMENTO';
                // Calcular última columna de encabezado según cantidad de headers
                $lastColHeader = chr(ord('A') + count($headers) - 1);
                escribirEncabezadoEstatico($sheet, $deptNameForHeader, $empNameLoop, $fecha_nomina, $numero_semana, $fecha_cierre, $lastColHeader);
                escribirEncabezadosTabla($sheet, $headers, 7, $deptNameForHeader, $empNameLoop);

                // Mapeo de columnas
                $cols = ['num'=>'A','clave'=>'B','nombre'=>'C','sueldo'=>'E','extra'=>'F','isr'=>'G','imss'=>'H','infonavit'=>'I'];
                if ($tieneAjusteSub) {
                    if ($tieneUniforme && $tieneFaGafetCofia) {
                        $cols['ajuste_sub']='J'; $cols['ausentismo']='K'; $cols['uniforme']='L'; $cols['permisos']='M'; $cols['retardos']='N'; $cols['biometrico']='O'; $cols['fa_gafet_cofia']='P'; $cols['neto_recibir']='Q'; $cols['tarjeta']='R'; $cols['importe_efectivo']='S'; $cols['prestamo']='T'; $cols['total_cobrar']='U';
                    } elseif ($tieneUniforme) {
                        $cols['ajuste_sub']='J'; $cols['ausentismo']='K'; $cols['uniforme']='L'; $cols['permisos']='M'; $cols['retardos']='N'; $cols['biometrico']='O'; $cols['neto_recibir']='P'; $cols['tarjeta']='Q'; $cols['importe_efectivo']='R'; $cols['prestamo']='S'; $cols['total_cobrar']='T';
                    } elseif ($tieneFaGafetCofia) {
                        $cols['ajuste_sub']='J'; $cols['ausentismo']='K'; $cols['permisos']='L'; $cols['retardos']='M'; $cols['biometrico']='N'; $cols['fa_gafet_cofia']='O'; $cols['neto_recibir']='P'; $cols['tarjeta']='Q'; $cols['importe_efectivo']='R'; $cols['prestamo']='S'; $cols['total_cobrar']='T';
                    } else {
                        $cols['ajuste_sub']='J'; $cols['ausentismo']='K'; $cols['permisos']='L'; $cols['retardos']='M'; $cols['biometrico']='N'; $cols['neto_recibir']='O'; $cols['tarjeta']='P'; $cols['importe_efectivo']='Q'; $cols['prestamo']='R'; $cols['total_cobrar']='S';
                    }
                } else {
                    if ($tieneUniforme && $tieneFaGafetCofia) {
                        $cols['ausentismo']='J'; $cols['uniforme']='K'; $cols['permisos']='L'; $cols['retardos']='M'; $cols['biometrico']='N'; $cols['fa_gafet_cofia']='O'; $cols['neto_recibir']='P'; $cols['tarjeta']='Q'; $cols['importe_efectivo']='R'; $cols['prestamo']='S'; $cols['total_cobrar']='T';
                    } elseif ($tieneUniforme) {
                        $cols['ausentismo']='J'; $cols['uniforme']='K'; $cols['permisos']='L'; $cols['retardos']='M'; $cols['biometrico']='N'; $cols['neto_recibir']='O'; $cols['tarjeta']='P'; $cols['importe_efectivo']='Q'; $cols['prestamo']='R'; $cols['total_cobrar']='S';
                    } elseif ($tieneFaGafetCofia) {
                        $cols['ausentismo']='J'; $cols['permisos']='K'; $cols['retardos']='L'; $cols['biometrico']='M'; $cols['fa_gafet_cofia']='N'; $cols['neto_recibir']='O'; $cols['tarjeta']='P'; $cols['importe_efectivo']='Q'; $cols['prestamo']='R'; $cols['total_cobrar']='S';
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
                    // Calcular última columna dinámicamente (incluye FIRMA RECIBIDO)
                    $lastCol = isset($cols['total_cobrar']) ? chr(ord($cols['total_cobrar']) + 3) : 'S';
                    $sheet->getPageSetup()->setPrintArea('A1:' . $lastCol . $lastRowWithTotals);
                    $bodyRange = 'A8:' . $lastCol . $lastRowWithTotals;
                    $sheet->getStyle($bodyRange)->applyFromArray([
                        'alignment' => [ 'horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER, 'wrapText' => true ],
                        'borders' => [ 'allBorders' => [ 'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN, 'color' => ['rgb' => '000000'] ] ]
                    ]);
                    // Formato moneda por defecto en columnas monetarias para que entradas manuales muestren $
                    $monetarias = ['sueldo','extra','isr','imss','infonavit','ausentismo'];
                    if (isset($cols['uniforme'])) { $monetarias[] = 'uniforme'; }
                    if (isset($cols['fa_gafet_cofia'])) { $monetarias[] = 'fa_gafet_cofia'; }
                    $monetarias = array_merge($monetarias, ['permisos','retardos','biometrico','neto_recibir','importe_efectivo','tarjeta','prestamo','total_cobrar']);
                    if (isset($cols['ajuste_sub'])) { $monetarias[] = 'ajuste_sub'; }
                    $siempreNegativo = ['isr','imss','infonavit','ausentismo','permisos','retardos','biometrico','tarjeta','prestamo'];
                    foreach ($monetarias as $k) {
                        if (isset($cols[$k])) {
                            $colLetra = $cols[$k];
                            $rangoMon = $colLetra . '8:' . $colLetra . $lastRowWithTotals;
                            if (in_array($k, $siempreNegativo, true)) {
                                $formato = '-"$"#,##0.00;-"$"#,##0.00;-"$"0.00';
                            } else {
                                $formato = '"$"#,##0.00;-"$"#,##0.00';
                            }
                            $sheet->getStyle($rangoMon)->getNumberFormat()->setFormatCode($formato);
                            $sheet->getStyle($rangoMon)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                        }
                    }
                    $columnasDeduccion = ['isr','imss','infonavit','ausentismo'];
                    if (isset($cols['uniforme'])) { $columnasDeduccion[] = 'uniforme'; }
                    if (isset($cols['fa_gafet_cofia'])) { $columnasDeduccion[] = 'fa_gafet_cofia'; }
                    $columnasDeduccion = array_merge($columnasDeduccion, ['permisos','retardos','biometrico','tarjeta','prestamo']); if (isset($cols['ajuste_sub'])) { $columnasDeduccion[]='ajuste_sub'; }
                    foreach ($columnasDeduccion as $key) { if (isset($cols[$key])) { $colLetra=$cols[$key]; $rango=$colLetra.'8:'.$colLetra.$lastRowWithTotals; $sheet->getStyle($rango)->getFont()->getColor()->setRGB('FF0000'); } }
                    $rangoNombre = $cols['nombre'].'8:'.$cols['nombre'].$lastRowWithTotals; $sheet->getStyle($rangoNombre)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT)->setVertical(Alignment::VERTICAL_CENTER)->setWrapText(true);
                    if (isset($cols['total_cobrar'])) {
                        $colFirma = chr(ord($cols['total_cobrar']) + 3);
                        $tieneAjusteSub = isset($cols['ajuste_sub']);
                        $tieneFaGafet = isset($cols['fa_gafet_cofia']);
                        $widthFirma = ($tieneAjusteSub && $tieneFaGafet) ? 18 : (($tieneAjusteSub || $tieneFaGafet) ? 20 : 22);
                        $sheet->getColumnDimension($colFirma)->setWidth($widthFirma);
                    }
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
        $tieneFaGafetCofia = tieneFaGafetCofia($nomina, $deptIdSel, $empIdSel);
        $headers = ['#','CLAVE','NOMBRE','PUESTO','SUELDO NETO','EXTRA','ISR','IMSS','INFONAVIT'];
        if ($tieneAjusteSub) { $headers[] = 'AJUSTES AL SUB'; }
        $extraHeaders = ['AUSENTISMO'];
        if ($tieneUniforme) $extraHeaders[] = 'UNIFORME';
        $extraHeaders = array_merge($extraHeaders, ['PERMISOS','RETARDOS','BIOMÉTRICO']);
        if ($tieneFaGafetCofia) $extraHeaders[] = 'F.A/GAFET/COFIA';
        $extraHeaders = array_merge($extraHeaders, ['NETO A RECIBIR','TARJETA','IMPORTE EN EFECTIVO','PRÉSTAMO','TOTAL A RECIBIR','REDONDEADO','TOTAL EFECTIVO REDONDEADO','FIRMA RECIBIDO']);
        $headers = array_merge($headers, $extraHeaders);

        $cols = ['num'=>'A','clave'=>'B','nombre'=>'C','sueldo'=>'E','extra'=>'F','isr'=>'G','imss'=>'H','infonavit'=>'I'];
        if ($tieneAjusteSub) {
            if ($tieneUniforme && $tieneFaGafetCofia) {
                $cols['ajuste_sub']='J'; $cols['ausentismo']='K'; $cols['uniforme']='L'; $cols['permisos']='M'; $cols['retardos']='N'; $cols['biometrico']='O'; $cols['fa_gafet_cofia']='P'; $cols['neto_recibir']='Q'; $cols['tarjeta']='R'; $cols['importe_efectivo']='S'; $cols['prestamo']='T'; $cols['total_cobrar']='U';
            } elseif ($tieneUniforme) {
                $cols['ajuste_sub']='J'; $cols['ausentismo']='K'; $cols['uniforme']='L'; $cols['permisos']='M'; $cols['retardos']='N'; $cols['biometrico']='O'; $cols['neto_recibir']='P'; $cols['tarjeta']='Q'; $cols['importe_efectivo']='R'; $cols['prestamo']='S'; $cols['total_cobrar']='T';
            } elseif ($tieneFaGafetCofia) {
                $cols['ajuste_sub']='J'; $cols['ausentismo']='K'; $cols['permisos']='L'; $cols['retardos']='M'; $cols['biometrico']='N'; $cols['fa_gafet_cofia']='O'; $cols['neto_recibir']='P'; $cols['tarjeta']='Q'; $cols['importe_efectivo']='R'; $cols['prestamo']='S'; $cols['total_cobrar']='T';
            } else {
                $cols['ajuste_sub']='J'; $cols['ausentismo']='K'; $cols['permisos']='L'; $cols['retardos']='M'; $cols['biometrico']='N'; $cols['neto_recibir']='O'; $cols['tarjeta']='P'; $cols['importe_efectivo']='Q'; $cols['prestamo']='R'; $cols['total_cobrar']='S';
            }
        } else {
            if ($tieneUniforme && $tieneFaGafetCofia) {
                $cols['ausentismo']='J'; $cols['uniforme']='K'; $cols['permisos']='L'; $cols['retardos']='M'; $cols['biometrico']='N'; $cols['fa_gafet_cofia']='O'; $cols['neto_recibir']='P'; $cols['tarjeta']='Q'; $cols['importe_efectivo']='R'; $cols['prestamo']='S'; $cols['total_cobrar']='T';
            } elseif ($tieneUniforme) {
                $cols['ausentismo']='J'; $cols['uniforme']='K'; $cols['permisos']='L'; $cols['retardos']='M'; $cols['biometrico']='N'; $cols['neto_recibir']='O'; $cols['tarjeta']='P'; $cols['importe_efectivo']='Q'; $cols['prestamo']='R'; $cols['total_cobrar']='S';
            } elseif ($tieneFaGafetCofia) {
                $cols['ausentismo']='J'; $cols['permisos']='K'; $cols['retardos']='L'; $cols['biometrico']='M'; $cols['fa_gafet_cofia']='N'; $cols['neto_recibir']='O'; $cols['tarjeta']='P'; $cols['importe_efectivo']='Q'; $cols['prestamo']='R'; $cols['total_cobrar']='S';
            } else {
                $cols['ausentismo']='J'; $cols['permisos']='K'; $cols['retardos']='L'; $cols['biometrico']='M'; $cols['neto_recibir']='N'; $cols['tarjeta']='O'; $cols['importe_efectivo']='P'; $cols['prestamo']='Q'; $cols['total_cobrar']='R';
            }
        }

        // Calcular última columna de encabezado según cantidad de headers y centrar títulos
        $lastColHeader = chr(ord('A') + count($headers) - 1);
        escribirEncabezadoEstatico($sheet, $departamento_nombre, $empresa_nombre, $fecha_nomina, $numero_semana, $fecha_cierre, $lastColHeader);
        escribirEncabezadosTabla($sheet, $headers, 7, $departamento_nombre, $empresa_nombre);
        $lastRow = escribirCuerpoDesdeNomina($sheet, $nomina, $deptIdSel, $empIdSel, 8, $cols);
        $lastRowWithTotals = ($lastRow && $lastRow >= 8) ? escribirFilaTotales($sheet, 8, $lastRow, $cols) : $lastRow;
        if (!empty($lastRowWithTotals) && is_numeric($lastRowWithTotals) && $lastRowWithTotals >= 7) {
            // Calcular última columna dinámicamente (incluye FIRMA RECIBIDO)
            $lastCol = isset($cols['total_cobrar']) ? chr(ord($cols['total_cobrar']) + 3) : 'S';
            $sheet->getPageSetup()->setPrintArea('A1:' . $lastCol . $lastRowWithTotals);
            $bodyRange = 'A8:' . $lastCol . $lastRowWithTotals;
            $sheet->getStyle($bodyRange)->applyFromArray([
                'alignment' => [ 'horizontal' => Alignment::HORIZONTAL_CENTER, 'vertical' => Alignment::VERTICAL_CENTER, 'wrapText' => true ],
                'borders' => [ 'allBorders' => [ 'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN, 'color' => ['rgb' => '000000'] ] ]
            ]);
            // Formato moneda por defecto en columnas monetarias para que entradas manuales muestren $
            $monetarias = ['sueldo','extra','isr','imss','infonavit','ausentismo'];
            if (isset($cols['uniforme'])) { $monetarias[] = 'uniforme'; }
            if (isset($cols['fa_gafet_cofia'])) { $monetarias[] = 'fa_gafet_cofia'; }
            $monetarias = array_merge($monetarias, ['permisos','retardos','biometrico','neto_recibir','importe_efectivo','tarjeta','prestamo','total_cobrar']);
            if (isset($cols['ajuste_sub'])) { $monetarias[] = 'ajuste_sub'; }
            $siempreNegativo = ['isr','imss','infonavit','ausentismo','permisos','retardos','biometrico','neto_recibir','tarjeta','importe_efectivo','prestamo'];
            foreach ($monetarias as $k) {
                if (isset($cols[$k])) {
                    $colLetra = $cols[$k];
                    $rangoMon = $colLetra . '8:' . $colLetra . $lastRowWithTotals;
                    if (in_array($k, $siempreNegativo, true)) {
                        $formato = '-"$"#,##0.00;-"$"#,##0.00;-"$"0.00';
                    } else {
                        $formato = '"$"#,##0.00;-"$"#,##0.00';
                    }
                    $sheet->getStyle($rangoMon)->getNumberFormat()->setFormatCode($formato);
                    $sheet->getStyle($rangoMon)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
                }
            }
            $columnasDeduccion = ['isr','imss','infonavit','ausentismo'];
            if (isset($cols['uniforme'])) { $columnasDeduccion[] = 'uniforme'; }
            if (isset($cols['fa_gafet_cofia'])) { $columnasDeduccion[] = 'fa_gafet_cofia'; }
            $columnasDeduccion = array_merge($columnasDeduccion, ['permisos','retardos','biometrico','tarjeta','prestamo']); if (isset($cols['ajuste_sub'])) { $columnasDeduccion[]='ajuste_sub'; }
            foreach ($columnasDeduccion as $key) { if (isset($cols[$key])) { $colLetra=$cols[$key]; $rango=$colLetra.'8:'.$colLetra.$lastRowWithTotals; $sheet->getStyle($rango)->getFont()->getColor()->setRGB('FF0000'); } }
            $rangoNombre = $cols['nombre'].'8:'.$cols['nombre'].$lastRowWithTotals; $sheet->getStyle($rangoNombre)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT)->setVertical(Alignment::VERTICAL_CENTER)->setWrapText(true);
            if (isset($cols['total_cobrar'])) {
                $colFirma = chr(ord($cols['total_cobrar']) + 3);
                $tieneAjusteSub = isset($cols['ajuste_sub']);
                $tieneFaGafet = isset($cols['fa_gafet_cofia']);
                $widthFirma = ($tieneAjusteSub && $tieneFaGafet) ? 18 : (($tieneAjusteSub || $tieneFaGafet) ? 20 : 22);
                $sheet->getColumnDimension($colFirma)->setWidth($widthFirma);
            }
        }
    }
} catch (\Throwable $e) {
    // Silencioso para no romper descarga si no viene estructura esperada
}

// Preparar descarga (XLSX)
if (ob_get_contents()) ob_end_clean();
header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

// Determinar año a partir de fecha_cierre si está disponible, si no usar año actual
$anio = date('Y');
if (!empty($fecha_cierre)) {
    $parts = explode('/', $fecha_cierre);
    if (count($parts) === 3 && is_numeric($parts[2])) {
        $anio = $parts[2];
    }
}

// Helper local para detectar selección "Todos"/"Todas"
function __esSeleccionTodos($val) {
    if (is_string($val)) return stripos($val, 'tod') !== false;
    if (is_array($val) && isset($val['id'])) return stripos((string)$val['id'], 'tod') !== false;
    return false;
}

$filenameUtf8 = '';

// Caso especial: departamento = Sin Seguro (id 0)
if (isset($deptIdSel) && $deptIdSel === 0) {
    $num = $numero_semana ?: '';
    $empNameLower = isset($empresa_nombre) ? mb_strtolower($empresa_nombre, 'UTF-8') : '';
    // Determinar sufijo de empresa según selección o nombre detectado
    if (isset($empIdSel) && $empIdSel !== null) {
        if ($empIdSel == 2 || stripos($empNameLower, 'group') !== false || stripos($empNameLower, 'sb') !== false) {
            $companySuffix = 'SB group';
        } elseif (stripos($empNameLower, 'citric') !== false) {
            $companySuffix = 'Citricos';
        } else {
            $companySuffix = trim($empresa_nombre ?: 'Empresa');
        }
    } else {
        // Empresa = Todas -> usar por defecto 'Citricos' para mantener formato consistente
        $companySuffix = 'Citricos';
    }

    // Nombre final siguiendo el formato solicitado por el usuario
    $filenameUtf8 = "SEM {$num} - {$anio} - Sin seguro - NominaConfianza- {$companySuffix}.xlsx";
}

// Caso: departamento = Todos
if (__esSeleccionTodos($departamento_raw)) {
    $num = $numero_semana ?: '';
    // Empresa especificada (no Todas)
    if (!__esSeleccionTodos($empresa_raw)) {
        // Detectar SB Group por id o nombre
        $empresaIdTmp = is_array($empresa_raw) && isset($empresa_raw['id']) ? $empresa_raw['id'] : null;
        $empresaNameTmp = isset($empresa_nombre) ? mb_strtolower($empresa_nombre, 'UTF-8') : '';
        if (($empresaIdTmp == 2) || stripos($empresaNameTmp, 'group') !== false || stripos($empresaNameTmp, 'sb') !== false) {
            $filenameUtf8 = "SEM {$num} - {$anio} - NominaConfianza- SB group.xlsx";
        } elseif (stripos($empresaNameTmp, 'citric') !== false && stripos($empresaNameTmp, 'saao') !== false) {
            $filenameUtf8 = "SEM {$num} - {$anio} - NominaConfianza- Citricos Saao.xlsx";
        } else {
            // Fallback: incluir nombre de la empresa tal cual
            $cleanEmp = trim($empresa_nombre ?: 'Empresa');
            $filenameUtf8 = "SEM {$num} - {$anio} - NominaConfianza- {$cleanEmp}.xlsx";
        }
    } else {
        // Ambos 'Todos' — mantener comportamiento previo (usar Citricos Saao por defecto)
        $num = $numero_semana ?: '';
        $filenameUtf8 = "SEM {$num} - {$anio} - NominaConfianza- Citricos Saao.xlsx";
    }
} else {
    // Intentar detectar selección: departamento id 1 y empresa específica (Saao o SB Group)
    $deptId = isset($deptIdSel) ? $deptIdSel : (is_array($departamento_raw) && isset($departamento_raw['id']) ? $departamento_raw['id'] : null);
    $empId = isset($empIdSel) ? $empIdSel : (is_array($empresa_raw) && isset($empresa_raw['id']) ? $empresa_raw['id'] : null);
    $empNameLower = isset($empresa_nombre) ? mb_strtolower($empresa_nombre, 'UTF-8') : '';
    if (($deptId == 1 || $deptId === '1')) {
        $num = $numero_semana ?: '';
        // SB Group (empresa id 2 o nombre que contiene 'group' o 'sb')
        if ($empId == 2 || stripos($empNameLower, 'group') !== false || stripos($empNameLower, 'sb') !== false) {
            $filenameUtf8 = "SEM {$num} - {$anio} - Administración - NominaConfianza- CitricsGroup.xlsx";
        } elseif ((strpos($empNameLower, 'citric') !== false || strpos($empNameLower, 'citricos') !== false) && strpos($empNameLower, 'saao') !== false) {
            // Citricos Saao
            $filenameUtf8 = "SEM {$num} - {$anio} - Administración - NominaConfianza- Citricos.xlsx";
        } else {
            // Otro caso para dept 1
            $filenameUtf8 = "SEM {$num} - {$anio} - Administración - NominaConfianza.xlsx";
        }
    } elseif (($deptId == 2 || $deptId === '2')) {
        // Departamento Producción
        $num = $numero_semana ?: '';
        if ($empId == 2 || stripos($empNameLower, 'group') !== false || stripos($empNameLower, 'sb') !== false) {
            $filenameUtf8 = "SEM {$num} - {$anio} - Producción - NominaConfianza- CitricsGroup.xlsx";
        } elseif ((strpos($empNameLower, 'citric') !== false || strpos($empNameLower, 'citricos') !== false) && strpos($empNameLower, 'saao') !== false) {
            $filenameUtf8 = "SEM {$num} - {$anio} - Producción - NominaConfianza- Citricos.xlsx";
        } else {
            $filenameUtc = "SEM {$num} - {$anio} - Producción - NominaConfianza.xlsx";
            $filenameUtf8 = $filenameUtc;
        }
    } elseif (($deptId == 9 || $deptId === '9')) {
        // Departamento Administración Sucursal CDMX
        $num = $numero_semana ?: '';
        if ($empId == 2 || stripos($empNameLower, 'group') !== false || stripos($empNameLower, 'sb') !== false) {
            $filenameUtf8 = "SEM {$num} - {$anio} - Administración CdMx - NominaConfianza- CitricsGroup.xlsx";
        } elseif ((strpos($empNameLower, 'citric') !== false || strpos($empNameLower, 'citricos') !== false) && strpos($empNameLower, 'saao') !== false) {
            $filenameUtf8 = "SEM {$num} - {$anio} - Administración CdMx - NominaConfianza- Citricos.xlsx";
        } else {
            $filenameUtf8 = "SEM {$num} - {$anio} - Administración CdMx - NominaConfianza.xlsx";
        }
    } elseif (($deptId == 3 || $deptId === '3')) {
        // Departamento Seguridad e Intendencia
        $num = $numero_semana ?: '';
        if ($empId == 2 || stripos($empNameLower, 'group') !== false || stripos($empNameLower, 'sb') !== false) {
            $filenameUtf8 = "SEM {$num} - {$anio} - Seguridad e Intendencia - NominaConfianza- CitricsGroup.xlsx";
        } elseif ((strpos($empNameLower, 'citric') !== false || strpos($empNameLower, 'citricos') !== false) && strpos($empNameLower, 'saao') !== false) {
            $filenameUtf8 = "SEM {$num} - {$anio} - Seguridad e Intendencia - NominaConfianza- Citricos.xlsx";
        } else {
            $filenameUtf8 = "SEM {$num} - {$anio} - Seguridad e Intendencia - NominaConfianza.xlsx";
        }
    } else {
        // Fallback: usar el título proporcionado por el usuario
        $safeTitulo = $titulo ? $titulo : 'nomina_confianza';
        $num = $numero_semana ?: '';
        $filenameUtf8 = "{$safeTitulo}_semana_{$num}.xlsx";
    }
}

// Generar versión ASCII para el parámetro filename y emitir filename* con UTF-8 (RFC5987)
$filenameAscii = @iconv('UTF-8', 'ASCII//TRANSLIT', $filenameUtf8);
if ($filenameAscii === false || trim($filenameAscii) === '') {
    // Reemplazar caracteres no ascii por guiones bajos si iconv falla
    $filenameAscii = preg_replace('/[^A-Za-z0-9 _\-\.]/', '', $filenameUtf8);
}
// Asegurar extensión
if (stripos($filenameAscii, '.xlsx') === false) $filenameAscii .= '.xlsx';

header("Content-Disposition: attachment; filename=\"{$filenameAscii}\"; filename*=UTF-8''" . rawurlencode($filenameUtf8));
header('Cache-Control: max-age=0');

$writer = new Xlsx($spreadsheet);
$writer->save('php://output');
exit;
