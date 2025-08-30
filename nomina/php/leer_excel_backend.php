<?php
require '../../vendor/autoload.php';
use PhpOffice\PhpSpreadsheet\IOFactory;

if (!isset($_FILES['archivo_excel'])) {
    echo json_encode(['error' => 'No se envió archivo']);
    exit;
}

$tmpFile = $_FILES['archivo_excel']['tmp_name'];
$spreadsheet = IOFactory::load($tmpFile);
$sheet = $spreadsheet->getActiveSheet();
$rows = $sheet->toArray();

$departamentos = [];
$actualDepto = null;
$ultimoEmpleadoIdx = null;
$procesandoEmpleados = false;

// Variables para semana y fechas
$numeroSemana = null;
$fechaInicio = null;
$fechaCierre = null;

// Buscar datos generales en las primeras filas
foreach ($rows as $row) {
    // Buscar número de semana
    foreach ($row as $cell) {
        if (is_string($cell) && preg_match('/Per[ií]odo\s+Semanal\s+No\.\s*(\d+)/iu', $cell, $matchSemana)) {
            $numeroSemana = $matchSemana[1];
        }
        // Buscar fechas de inicio y cierre
        if (is_string($cell) && preg_match('/Lista\s+de\s+Raya\s+del\s+(\d{2}\/\w+\/\d{4})\s+al\s+(\d{2}\/\w+\/\d{4})/iu', $cell, $matchFechas)) {
            $fechaInicio = $matchFechas[1];
            $fechaCierre = $matchFechas[2];
        }
    }
}

foreach ($rows as $row) {
    // Detectar nuevo departamento
    if (isset($row[0]) && is_string($row[0])) {
        $cell = ltrim($row[0], "'");
        $cell = preg_replace('/(Reg\.? Pat\.? IMSS.*)$/i', '', $cell);
        if (preg_match('/^(\d+)\s+(.+)/u', $cell, $match)) {
            if ($actualDepto !== null) {
                $actualDepto['empleados'] = array_values(array_filter($actualDepto['empleados']));
                $departamentos[] = $actualDepto;
            }
            
            $nombreCompleto = trim($match[1] . ' ' . $match[2]);
            $actualDepto = [
                'nombre' => $nombreCompleto,
                'empleados' => []
            ];
            
            //   Verificar si es el departamento de Producción 40 Libras
            $esProduccion40 = stripos($nombreCompleto, 'PRODUCCION 40 LIBRAS') !== false;
            
            $ultimoEmpleadoIdx = null;
            $procesandoEmpleados = false;
            continue;
        }
    }

    // Detectar empleado
    if (
        $actualDepto &&
        isset($row[0]) && is_numeric($row[0]) &&
        isset($row[1]) && is_string($row[1]) && trim($row[1]) !== ''
    ) {
        $nombreEmpleado = trim($row[1]);
        if (preg_match('/^[A-ZÁÉÍÓÚÑ]+\s+[A-ZÁÉÍÓÚÑ]+/u', $nombreEmpleado)) {
            $empleado = [
                'clave' => $row[0],
                'nombre' => $nombreEmpleado,
                'neto_pagar' => null
            ];
            
            //   Solo agregar array de conceptos si es Producción 40 Libras
            $esProduccion40 = stripos($actualDepto['nombre'], 'PRODUCCION 40 LIBRAS') !== false;
            if ($esProduccion40) {
                $empleado['conceptos'] = [];
            }
            
            $actualDepto['empleados'][] = $empleado;
            $ultimoEmpleadoIdx = count($actualDepto['empleados']) - 1;
            $procesandoEmpleados = true;
            continue;
        }
    }

    // Detectar "Neto a pagar"
    if ($actualDepto) {
        $esNeto = false;
        $colNeto = null;
        foreach ($row as $idx => $cell) {
            if (is_string($cell) && preg_match('/neto\\s*a\\s*pagar/i', $cell)) {
                $esNeto = true;
                $colNeto = $idx;
                break;
            }
        }
        if ($esNeto && $colNeto !== null) {
            for ($i = $colNeto + 1; $i < count($row); $i++) {
                if (is_numeric($row[$i])) {
                    $neto = floatval($row[$i]);
                    if ($neto > 0 && $actualDepto && !empty($actualDepto['empleados'])) {
                        // Asignar SIEMPRE al último empleado detectado
                        $actualDepto['empleados'][count($actualDepto['empleados']) - 1]['neto_pagar'] = $neto;
                    }
                    break;
                }
            }
        }
    }

    // Detectar totales (sin continue)
    if (
        isset($row[1]) && is_string($row[1]) &&
        preg_match('/total\s*de\s*departamento|total\s*percepciones|neto\s*del\s*departamento|total\s*de\s*empleados|obligaci[oó]n|deducci[oó]n/i', trim($row[1]))
    ) {
        $procesandoEmpleados = false;
        $ultimoEmpleadoIdx = null;
    }

    // Guardar conceptos (SOLO para Producción 40 Libras)
    if (
        $procesandoEmpleados && $actualDepto && $ultimoEmpleadoIdx !== null &&
        isset($row[5]) && isset($row[6]) && isset($row[8])
    ) {
        $esProduccion40 = stripos($actualDepto['nombre'], 'PRODUCCION 40 LIBRAS') !== false;
        
        if ($esProduccion40) {
            $codigoConcepto = trim($row[5]);
            $nombreConcepto = trim($row[6]);
            $resultadoConcepto = trim($row[8]);
            if (in_array($codigoConcepto, ['45', '52', '16'])) {
                $actualDepto['empleados'][$ultimoEmpleadoIdx]['conceptos'][] = [
                    'codigo' => $codigoConcepto,
                    'nombre' => $nombreConcepto,
                    'resultado' => $resultadoConcepto
                ];
            }
        }
    }
}

// Agregar último departamento
if ($actualDepto !== null) {
    $actualDepto['empleados'] = array_values(array_filter($actualDepto['empleados']));
    $departamentos[] = $actualDepto;
}

// Salida con identificadores
$output = [
    'numero_semana' => $numeroSemana,
    'fecha_inicio' => $fechaInicio,
    'fecha_cierre' => $fechaCierre,
    'departamentos' => $departamentos
];

echo json_encode($output);
