<?php
/**
 * =====================================================
 * LECTOR GENÉRICO DE BIOMÉTRICOS
 * =====================================================
 * Este archivo lee cualquier archivo de biométrico
 * ya que todos tienen la misma estructura.
 * 
 * Recibe el nombre del campo del archivo vía POST
 * =====================================================
 */

require '../../vendor/autoload.php';
use PhpOffice\PhpSpreadsheet\IOFactory;

// Obtener el nombre del campo del archivo desde POST
$fieldName = isset($_POST['field_name']) ? $_POST['field_name'] : null;

if (!$fieldName || !isset($_FILES[$fieldName])) {
    echo json_encode(['error' => 'No se especificó el archivo o campo', 'empleados' => []], JSON_UNESCAPED_UNICODE);
    exit;
}

$tmpFile = $_FILES[$fieldName]['tmp_name'];

if (empty($tmpFile)) {
    echo json_encode(['error' => 'Archivo vacío', 'empleados' => []], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
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

        if ($colA === "Nombre") {
            if ($empleadoActual !== null) {
                $empleados[] = $empleadoActual;
            }

            $empleadoActual = [
                'nombre' => $colD,
                'id_biometrico' => null,
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

                if (is_numeric($colE)) {
                    $horas = floor($colE);
                    $minutos = round(($colE - $horas) * 60);
                    $empleadoActual['tiempo_total'] = sprintf("%d:%02d", $horas, $minutos);
                }
            }

        } elseif (stripos($colG, 'Tiempo total') !== false) {
            if ($empleadoActual !== null) {
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
            if ($empleadoActual !== null && $empleadoActual['id_biometrico'] === null) {
                $empleadoActual['id_biometrico'] = $colA;
            }

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

    echo json_encode(['empleados' => $empleados], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage(), 'empleados' => []], JSON_UNESCAPED_UNICODE);
}
