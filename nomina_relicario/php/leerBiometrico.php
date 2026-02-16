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
            'id_biometrico' => null, // Agregar campo para ID biométrico
            'registros' => [],
         
        ];
        $leyendoRegistros = false;
    } elseif ($colA === "ID") {
        $leyendoRegistros = true;
    } elseif (stripos($colA, 'Horas totales') !== false) {
        if ($empleadoActual !== null) {
         

         
        }
    } elseif (stripos($colG, 'Tiempo total') !== false) {
        if ($empleadoActual !== null) {
           
            $empleados[] = $empleadoActual;
            $empleadoActual = null;
        }
        $leyendoRegistros = false;
    } elseif ($leyendoRegistros && is_numeric($colA)) {
        // Capturar el ID biométrico del primer registro
        if ($empleadoActual !== null && $empleadoActual['id_biometrico'] === null) {
            $empleadoActual['id_biometrico'] = $colA;
        }
        
        $fecha = trim($sheet->getCell("C{$i}")->getValue());
        $entrada = trim($sheet->getCell("E{$i}")->getValue());
        $salida = trim($sheet->getCell("F{$i}")->getValue());
       

        if ($fecha !== "" || $entrada !== "" || $salida !== "" ) {
            $empleadoActual['registros'][] = [
                'fecha' => $fecha,
                'entrada' => $entrada,
                'salida' => $salida,
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