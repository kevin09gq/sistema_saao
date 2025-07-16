<?php
require '../../vendor/autoload.php';
use PhpOffice\PhpSpreadsheet\IOFactory;

if (!isset($_FILES['archivo_excel2']) || !is_uploaded_file($_FILES['archivo_excel2']['tmp_name'])) {
    echo json_encode(['error' => 'No se envió archivo o el archivo es inválido']);
    exit;
}

$tmpFile = $_FILES['archivo_excel2']['tmp_name'];
$spreadsheet = IOFactory::load($tmpFile);
$sheet = $spreadsheet->getActiveSheet();
$rows = $sheet->toArray();

$empleados = [];
$empleadoActual = null;
$leyendoRegistros = false;

foreach ($rows as $row) {
    $colA = isset($row[0]) ? trim($row[0]) : '';

    if ($colA === "Nombre") {
        if ($empleadoActual !== null) {
            $empleados[] = $empleadoActual;
        }
        $empleadoActual = [
            'nombre' => isset($row[3]) ? trim($row[3]) : "",
            'registros' => [],
            'horas_totales' => "",
            'tiempo_total' => ""
        ];
        $leyendoRegistros = false;
    } elseif ($colA === "ID") {
        $leyendoRegistros = true;
    } elseif (strpos($colA, 'Horas totales') !== false) {
        $empleadoActual['horas_totales'] = isset($row[4]) ? trim($row[4]) : "";
    } elseif (strpos($row[6] ?? '', 'Tiempo total') !== false) {
        $empleadoActual['tiempo_total'] = isset($row[9]) ? trim($row[9]) : "";
        $leyendoRegistros = false;
    } elseif ($leyendoRegistros && is_numeric($colA)) {
        $fecha = isset($row[2]) ? trim($row[2]) : "";
        $entrada = isset($row[4]) ? trim($row[4]) : "";
        $salida = isset($row[5]) ? trim($row[5]) : "";
        $trabajado = isset($row[9]) ? trim($row[9]) : "";

        if ($fecha !== "" || $entrada !== "" || $salida !== "" || $trabajado !== "") {
            $empleadoActual['registros'][] = [
                'fecha' => $fecha,
                'entrada' => $entrada,
                'salida' => $salida,
                'trabajado' => $trabajado
            ];
        }
    }
}

if ($empleadoActual !== null) {
    $empleados[] = $empleadoActual;
}

echo json_encode(['empleados' => $empleados], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
