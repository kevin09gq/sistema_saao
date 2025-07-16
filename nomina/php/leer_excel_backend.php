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
            $actualDepto = [
                'nombre' => trim($match[1] . ' ' . $match[2]),
                'empleados' => []
            ];
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
                'neto_pagar' => null, // Se asigna después si corresponde
                'conceptos' => []
            ];
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

    // Guardar conceptos
    if (
        $procesandoEmpleados && $actualDepto && $ultimoEmpleadoIdx !== null &&
        isset($row[5]) && isset($row[6]) && isset($row[8])
    ) {
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

// Agregar último departamento
if ($actualDepto !== null) {
    $actualDepto['empleados'] = array_values(array_filter($actualDepto['empleados']));
    $departamentos[] = $actualDepto;
}

echo json_encode(['departamentos' => $departamentos]);
