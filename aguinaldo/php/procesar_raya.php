<?php
require '../../vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\IOFactory;

if (!isset($_FILES['archivo_lista_raya']) || empty($_FILES['archivo_lista_raya']['tmp_name'])) {
    echo json_encode(['empleados' => [], 'id_empresa' => 0, 'nombre_empresa' => null]);
    exit;
}

$tmpFile = $_FILES['archivo_lista_raya']['tmp_name'];
$spreadsheet = IOFactory::load($tmpFile);
$sheet = $spreadsheet->getActiveSheet();
$rows = $sheet->toArray();

$empleados = [];

// Variables para semana y fechas
$numeroSemana = null;
$fechaInicio = null;
$fechaCierre = null;

// Variable para identificar la empresa
$idEmpresa = 1; // Por defecto SAAO
$nombreEmpresa = null;

// =============================================================================
// Buscar nombre de empresa en celdas E2:I2 (fila 2, columnas E-I = índices 4-8)
// =============================================================================
if (isset($rows[1])) { // Fila 2 es índice 1
    $fila2 = $rows[1];
    // Buscar en columnas E hasta I (índices 4 a 8)
    for ($col = 4; $col <= 8; $col++) {
        if (isset($fila2[$col]) && is_string($fila2[$col]) && trim($fila2[$col]) !== '') {
            $textoEmpresa = trim($fila2[$col]);

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

// Buscar número de semana y fechas en las primeras filas
foreach ($rows as $row) {
    foreach ($row as $cell) {
        if (is_string($cell)) {
            if (preg_match('/Per[ií]odo\s+Semanal\s+No\.\s*(\d+)/iu', $cell, $matchSemana)) {
                $numeroSemana = $matchSemana[1];
            }
            if (preg_match('/Lista\s+de\s+Raya\s+del\s+(\d{2}\/\w+\/\d{4})\s+al\s+(\d{2}\/\w+\/\d{4})/iu', $cell, $matchFechas)) {
                $fechaInicio = $matchFechas[1];
                $fechaCierre = $matchFechas[2];
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

        // Validar que el nombre sea un nombre válido (comienza con letras)
        if (preg_match('/^[A-ZÁÉÍÓÚÑ]+\s+[A-ZÁÉÍÓÚÑ]+/u', $nombreEmpleado)) {
            $fechaIngreso = null;
            $isr = null;
            $tarjeta = null;

            // Buscar fecha de ingreso, ISR y Neto a pagar en las siguientes filas
            for ($searchIdx = $rowIdx + 1; $searchIdx <= $rowIdx + 30; $searchIdx++) {
                if (!isset($rows[$searchIdx])) {
                    break;
                }

                // Búsqueda de fecha de ingreso en columna B
                if ($fechaIngreso === null) {
                    $celdaB = isset($rows[$searchIdx][1]) ? trim((string)$rows[$searchIdx][1]) : '';
                    if (preg_match('/Fecha\s+(?:Ingr[eso]*|Reing):\s*(\d{2})\/(\d{2})\/(\d{4})/iu', $celdaB, $matchFecha)) {
                        $fechaIngreso = $matchFecha[3] . '-' . $matchFecha[2] . '-' . $matchFecha[1];
                    }
                }

                // Búsqueda de ISR en columna F (código 43)
                if ($isr === null) {
                    $celdaF = isset($rows[$searchIdx][5]) ? trim((string)$rows[$searchIdx][5]) : '';
                    if ($celdaF === '43') {
                        // El valor del ISR está en columna I (índice 8)
                        if (isset($rows[$searchIdx][8]) && (is_numeric($rows[$searchIdx][8]) || is_float($rows[$searchIdx][8]))) {
                            $isr = (float)$rows[$searchIdx][8];
                        }
                    }
                }

                // Búsqueda de Neto a pagar en columna B
                if ($tarjeta === null) {
                    $celdaB = isset($rows[$searchIdx][1]) ? trim((string)$rows[$searchIdx][1]) : '';
                    if (preg_match('/^Neto\s+a\s+Pagar$/iu', $celdaB)) {
                        // El valor está en columna D (índice 3)
                        if (isset($rows[$searchIdx][3]) && (is_numeric($rows[$searchIdx][3]) || is_float($rows[$searchIdx][3]))) {
                            $tarjeta = (float)$rows[$searchIdx][3];
                        }
                    }
                }

                // Si ya encontramos todos los datos, salir del loop
                if ($fechaIngreso !== null && $isr !== null && $tarjeta !== null) {
                    break;
                }
            }

            // Agregar el empleado a la lista
            $empleados[] = [
                'clave_empleado' => $clave,
                'nombre' => $nombreEmpleado,
                'id_empresa' => $idEmpresa,
                'fecha_ingreso_imss' => $fechaIngreso,
                'isr' => $isr,
                'tarjeta' => $tarjeta
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