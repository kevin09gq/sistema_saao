<?php
require '../../vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\IOFactory;

if (!isset($_FILES['archivo_ausencias']) || empty($_FILES['archivo_ausencias']['tmp_name'])) {
    echo json_encode(['empleados' => [], 'id_empresa' => 0, 'nombre_empresa' => null]);
    exit;
}

$tmpFile = $_FILES['archivo_ausencias']['tmp_name'];
$spreadsheet = IOFactory::load($tmpFile);
$sheet = $spreadsheet->getActiveSheet();
$rows = $sheet->toArray();

$empleados = [];

// Variable para identificar la empresa
$idEmpresa = 1; // Por defecto SAAO
$nombreEmpresa = null;

// =============================================================================
// Buscar nombre de empresa en fila 3 (índice 2), columnas A a I (índices 0-8)
// =============================================================================
if (isset($rows[2])) {
    $fila3 = $rows[2];
    for ($col = 0; $col <= 8; $col++) {
        if (isset($fila3[$col]) && is_string($fila3[$col]) && trim($fila3[$col]) !== '') {
            $textoEmpresa = trim($fila3[$col]);

            if (preg_match('/SB\s+CITRIC/i', $textoEmpresa)) {
                $idEmpresa = 2;
                $nombreEmpresa = $textoEmpresa;
                break;
            }

            if (preg_match('/CITRICOS\s+SAAO/i', $textoEmpresa)) {
                $idEmpresa = 1;
                $nombreEmpresa = $textoEmpresa;
                break;
            }
        }
    }
}

// =============================================================================
// Procesar todas las filas para extraer empleados
// =============================================================================
foreach ($rows as $rowIdx => $row) {
    // Detectar si es un empleado: tiene clave (numérico) en columna A y nombre en columna B
    if (isset($row[0]) && is_numeric($row[0]) && isset($row[1]) && is_string($row[1])) {
        $nombreEmpleado = trim($row[1]);
        $clave = str_pad((string)$row[0], 3, '0', STR_PAD_LEFT);

        // Validar que el nombre sea un nombre válido (no sea "Total ausencias" u otro texto)
        if (preg_match('/^[A-ZÁÉÍÓÚÑ]+\s+[A-ZÁÉÍÓÚÑ]+/u', $nombreEmpleado)) {
            $numAusencias = 0;

            // Buscar "Total ausencias" en las siguientes filas, columna B
            for ($searchIdx = $rowIdx + 1; $searchIdx <= $rowIdx + 15; $searchIdx++) {
                if (!isset($rows[$searchIdx])) {
                    break;
                }

                $celdaB = isset($rows[$searchIdx][1]) ? trim((string)$rows[$searchIdx][1]) : '';

                // Buscar "Total ausencias"
                if (preg_match('/^Total\s+ausencias$/iu', $celdaB)) {
                    // El número está en la columna C (índice 2)
                    if (isset($rows[$searchIdx][2]) && is_numeric($rows[$searchIdx][2])) {
                        $numAusencias = (int)$rows[$searchIdx][2];
                    }
                    break;
                }
            }

            // Agregar el empleado a la lista
            $empleados[] = [
                'clave_empleado' => $clave,
                'nombre' => $nombreEmpleado,
                'total_ausencias' => $numAusencias,
                'id_empresa' => $idEmpresa
            ];
        }
    }
}

// Salida con lista plana de empleados
// $output = [
//     'empleados'      => $empleados,
//     'id_empresa'     => $idEmpresa,
//     'nombre_empresa' => $nombreEmpresa
// ];

echo json_encode($empleados);