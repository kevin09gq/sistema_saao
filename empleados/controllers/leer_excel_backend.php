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

foreach ($rows as $row) {
    if (isset($row[0]) && is_string($row[0])) {
        $cell = ltrim($row[0], "'");
        // Si contiene "Reg Pat IMSS" o "Reg. Pat. IMSS", corta desde ahí
        $cell = preg_replace('/(Reg\.? Pat\.? IMSS.*)$/i', '', $cell);
        // Buscar número al inicio, luego espacios, luego nombre de departamento
        if (preg_match('/^(\d+)\s+(.+)/u', $cell, $match)) {
            $nombreDepto = trim($match[1] . ' ' . $match[2]);
            // Guarda el anterior departamento antes de crear uno nuevo
            if ($actualDepto !== null) {
                $departamentos[] = $actualDepto;
            }
            $actualDepto = [
                'nombre' => $nombreDepto,
                'empleados' => []
            ];
            continue;
        }
    }
    // Si hay un departamento actual, buscar empleados: columna A numérica (clave), columna B string (nombre)
    if (
        $actualDepto &&
        isset($row[0]) && is_numeric($row[0]) &&
        isset($row[1]) && is_string($row[1]) && trim($row[1]) !== ''
    ) {
        $nombreEmpleado = trim($row[1]);
        // Solo agregar si el nombre tiene al menos dos palabras (nombre y apellido)
        if (preg_match('/^[A-ZÁÉÍÓÚÑ]+\\s+[A-ZÁÉÍÓÚÑ]+/u', $nombreEmpleado)) {
            $actualDepto['empleados'][] = [
                'clave' => $row[0],
                'nombre' => $nombreEmpleado
            ];
        }
    }
}
// Al final, guarda el último departamento si existe
if ($actualDepto !== null) {
    $departamentos[] = $actualDepto;
}

echo json_encode(['departamentos' => $departamentos]);
