<?php
require '../../vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\IOFactory;

if (!isset($_FILES['archivo_excel'])) {
    echo json_encode(['error' => 'No se envió archivo']);
    exit;
}

$tmpFile = $_FILES['archivo_excel']['tmp_name']; // archivo de compact
$spreadsheet = IOFactory::load($tmpFile);
$sheet = $spreadsheet->getActiveSheet();
$rows = $sheet->toArray();

$departamentos = [];
$actualDepto = null;
$ultimoEmpleadoIdx = null;
$procesandoEmpleados = false;

// Variables para semana y fechas
$numeroSemana = null;
$fechaInicio = null;
$fechaCierre = null;

// Buscar datos generales en las primeras filas
foreach ($rows as $row) {
    // Buscar número de semana
    foreach ($row as $cell) {
        if (is_string($cell) && preg_match('/Per[ií]odo\s+Semanal\s+No\.\s*(\d+)/iu', $cell, $matchSemana)) {
            $numeroSemana = $matchSemana[1];
        }
        // Buscar fechas de inicio y cierre
        if (is_string($cell) && preg_match('/Lista\s+de\s+Raya\s+del\s+(\d{2}\/\w+\/\d{4})\s+al\s+(\d{2}\/\w+\/\d{4})/iu', $cell, $matchFechas)) {
            $fechaInicio = $matchFechas[1];
            $fechaCierre = $matchFechas[2];
        }
    }
}

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

            $nombreCompleto = trim($match[1] . ' ' . $match[2]);
            $actualDepto = [
                'nombre' => $nombreCompleto,
                'empleados' => []
            ];

            $ultimoEmpleadoIdx = null;
            $procesandoEmpleados = false;
            continue;
        }
    }

    // Detectar empleado
    if ($actualDepto && isset($row[0]) && is_numeric($row[0]) && isset($row[1]) && is_string($row[1]) && trim($row[1]) !== '') {

        $nombreEmpleado = trim($row[1]);
        if (preg_match('/^[A-ZÁÉÍÓÚÑ]+\s+[A-ZÁÉÍÓÚÑ]+/u', $nombreEmpleado)) {
            // Formatear la clave para que tenga 3 dígitos con ceros a la izquierda
            $claveFormateada = str_pad((string)$row[0], 3, '0', STR_PAD_LEFT);

            $empleado = [
                'clave' => $claveFormateada,
                'nombre' => $nombreEmpleado,
                'dias_trabajados' => null,
                'vacaciones' => false,
                'incapacidades' => false,
                'ausencias' => false
            ];

            $actualDepto['empleados'][] = $empleado;
            $ultimoEmpleadoIdx = count($actualDepto['empleados']) - 1;
            $procesandoEmpleados = true;
            continue;
        }
    }

    // Detectar "Días pagados"
    if ($actualDepto) {
        $esDiasPagados = false;
        $colDiasPagados = null;

        foreach ($row as $idx => $cell) {
            if (is_string($cell) && preg_match('/d[ií]as\s+pagados:?/iu', trim($cell))) { // Busca la palabra "Días pagados:"
                /**
                 * Si la encuentra la bandera se marca como true
                 * Se guarda el index de la columna
                 */
                $esDiasPagados = true;
                $colDiasPagados = $idx;
                break; // se rompe el foreach
            }
        }

        if ($esDiasPagados && $colDiasPagados !== null) {
            $siguienteCol = $colDiasPagados + 1;
            if (isset($row[$siguienteCol])) {

                $valor = trim($row[$siguienteCol]);

                if (is_numeric($valor)) {
                    $dias = (float)$valor;
                    if ($dias > 0 && $actualDepto && !empty($actualDepto['empleados'])) {
                        $actualDepto['empleados'][count($actualDepto['empleados']) - 1]['dias_trabajados'] = $dias;
                    }
                }
            }
        }

        $nextRowIdx = array_search($row, $rows, true) + 1;
        if (isset($rows[$nextRowIdx])) {
            $nextRow = $rows[$nextRowIdx];
            foreach ($nextRow as $cell) {
                if (is_string($cell)) {
                    $texto = trim($cell);
                    if (preg_match('/vacaciones/i', $texto)) {
                        $actualDepto['empleados'][count($actualDepto['empleados']) - 1]['vacaciones'] = true;
                    }
                    if (preg_match('/incapacidades/i', $texto)) {
                        $actualDepto['empleados'][count($actualDepto['empleados']) - 1]['incapacidades'] = true;
                    }
                    if (preg_match('/ausencias/i', $texto)) {
                        $actualDepto['empleados'][count($actualDepto['empleados']) - 1]['ausencias'] = true;
                    }
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
}

// Agregar último departamento
if ($actualDepto !== null) {
    $actualDepto['empleados'] = array_values(array_filter($actualDepto['empleados']));
    $departamentos[] = $actualDepto;
}

// Salida con identificadores
$output = [
    'numero_semana' => $numeroSemana,
    'fecha_inicio' => $fechaInicio,
    'fecha_cierre' => $fechaCierre,
    'departamentos' => $departamentos
];

echo json_encode($output);
