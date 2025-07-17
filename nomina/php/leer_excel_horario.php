<?php
require '../../vendor/autoload.php';
use PhpOffice\PhpSpreadsheet\IOFactory;

$tmpFile = $_FILES['archivo_excel2']['tmp_name'];
$spreadsheet = IOFactory::load($tmpFile);
$sheet = $spreadsheet->getActiveSheet();
$highestRow = $sheet->getHighestRow();

// Fuerza el cálculo de fórmulas
$spreadsheet->getCalculationEngine()->disableCalculationCache();

$empleados = [];
$empleadoActual = null;
$leyendoRegistros = false;

for ($i = 1; $i <= $highestRow; $i++) {
    $colA = trim($sheet->getCell("A{$i}")->getValue());
    $colD = trim($sheet->getCell("D{$i}")->getValue());
    $colE = trim($sheet->getCell("E{$i}")->getValue());
    $colG = trim($sheet->getCell("G{$i}")->getValue());
    $colJ = trim($sheet->getCell("J{$i}")->getValue());

    // Detectar inicio de un nuevo empleado
    if ($colA === "Nombre") {
        if ($empleadoActual !== null) {
            $empleados[] = $empleadoActual;
        }
        $empleadoActual = [
            'nombre' => $colD,
            'registros' => [],
            'horas_totales' => "",
            'tiempo_total' => ""
        ];
        $leyendoRegistros = false;
    } elseif ($colA === "ID") {
        $leyendoRegistros = true;
    } elseif (stripos($colA, 'Horas totales') !== false) {
        if ($empleadoActual !== null) {
            $empleadoActual['horas_totales'] = $colE;

            // Convertir a HH:MM y asignar a tiempo_total
            if (is_numeric($colE)) {
                $horas = floor($colE);
                $minutos = round(($colE - $horas) * 60);
                $empleadoActual['tiempo_total'] = sprintf("%d:%02d", $horas, $minutos);
            }
        }
    } elseif (stripos($colG, 'Tiempo total') !== false) {
        if ($empleadoActual !== null) {
            // Usar getCalculatedValue por si es fórmula, si no, getValue
            $valorCalculado = $sheet->getCell("J{$i}")->getCalculatedValue();
            if ($valorCalculado === null || $valorCalculado === '') {
                $valorCalculado = $sheet->getCell("J{$i}")->getValue();
            }
            $empleadoActual['tiempo_total'] = $valorCalculado;
            $empleados[] = $empleadoActual;
            $empleadoActual = null;
        }
        $leyendoRegistros = false;
    } elseif ($leyendoRegistros && is_numeric($colA)) {
        $fecha = trim($sheet->getCell("C{$i}")->getValue());
        $entrada = trim($sheet->getCell("E{$i}")->getValue());
        $salida = trim($sheet->getCell("F{$i}")->getValue());
        $trabajado = trim($sheet->getCell("J{$i}")->getValue());

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

// Si quedó un empleado pendiente al final
if ($empleadoActual !== null) {
    $empleados[] = $empleadoActual;
}

echo json_encode(['empleados' => $empleados], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
?>