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

foreach ($rows as $row) {
    if (isset($row[0]) && is_string($row[0])) {
        $cell = ltrim($row[0], "'");
        $cell = preg_replace('/(Reg\.? Pat\.? IMSS.*)$/i', '', $cell);
        if (preg_match('/^(\d+)\s+(.+)/u', $cell, $match)) {
            $nombreDepto = trim($match[1] . ' ' . $match[2]);
            if ($actualDepto !== null) {
                $actualDepto['empleados'] = array_filter($actualDepto['empleados'], function($e) { return $e !== null; });
                $actualDepto['empleados'] = array_values($actualDepto['empleados']);
                $departamentos[] = $actualDepto;
            }
            $actualDepto = [
                'nombre' => $nombreDepto,
                'empleados' => []
            ];
            $ultimoEmpleadoIdx = null;
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
            $actualDepto['empleados'][] = [
                'clave' => $row[0],
                'nombre' => $nombreEmpleado,
                'conceptos' => []
            ];
            $ultimoEmpleadoIdx = count($actualDepto['empleados']) - 1;
            continue;
        }
        // No cerrar $ultimoEmpleadoIdx aquí, para no perder la asociación de conceptos
    }
    // Romper asociación si es una fila de totales
    if (
        isset($row[1]) && is_string($row[1]) &&
        preg_match('/total departamento|total percepciones|neto del departamento|total de empleados/i', $row[1])
    ) {
        $ultimoEmpleadoIdx = null;
    }
    // Asociar conceptos solo si hay un empleado actual
    if ($actualDepto && $ultimoEmpleadoIdx !== null && isset($row[5]) && isset($row[6]) && isset($row[8])) {
        $codigoConcepto = trim($row[5]);
        $nombreConcepto = trim($row[6]);
        $resultadoConcepto = trim($row[8]);
        if (in_array($codigoConcepto, ['45','52','16'])) {
            $actualDepto['empleados'][$ultimoEmpleadoIdx]['conceptos'][] = [
                'codigo' => $codigoConcepto,
                'nombre' => $nombreConcepto,
                'resultado' => $resultadoConcepto
            ];
        }
    }
}
if ($actualDepto !== null) {
    $actualDepto['empleados'] = array_filter($actualDepto['empleados'], function($e) { return $e !== null; });
    $actualDepto['empleados'] = array_values($actualDepto['empleados']);
    $departamentos[] = $actualDepto;
}

echo json_encode(['departamentos' => $departamentos]);
