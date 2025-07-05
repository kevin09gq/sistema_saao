<?php
require '../../vendor/autoload.php'; // Ajusta la ruta si es necesario
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
    // Detectar inicio de departamento
    if (isset($row[0]) && is_string($row[0]) && strpos(trim($row[0]), "'") === 0) {
        if (preg_match("/^'(\d+)\s+([^\d]+)/", $row[0], $match)) {
            $actualDepto = [
                'clave' => trim($match[1]),
                'nombre' => trim($match[2]),
                'trabajadores' => []
            ];
            $departamentos[] = &$actualDepto;
        }
    }
    // Detectar trabajador (clave, nombre)
    elseif ($actualDepto && isset($row[0]) && is_numeric($row[0]) && isset($row[1]) && is_string($row[1])) {
        $actualDepto['trabajadores'][] = [
            'clave' => $row[0],
            'nombre' => trim($row[1])
        ];
    }
}
echo json_encode($departamentos);
