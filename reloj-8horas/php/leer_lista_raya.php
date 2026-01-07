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
$puestos = [];
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
    
    /**
     * =======================
     *  Detectar departamento
     * =======================
     */
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
        $puestoEmpleado = '';

        if (preg_match('/^[A-ZÁÉÍÓÚÑ]+\s+[A-ZÁÉÍÓÚÑ]+/u', $nombreEmpleado)) {
            // Formatear la clave para que tenga 3 dígitos con ceros a la izquierda
            $claveFormateada = str_pad((string)$row[0], 3, '0', STR_PAD_LEFT);

            // Obtener el puesto de la fila siguiente
            $currentRowIdx = array_search($row, $rows, true);
            if ($currentRowIdx !== false && isset($rows[$currentRowIdx + 1])) {
                $siguienteFila = $rows[$currentRowIdx + 1];
                if (isset($siguienteFila[1]) && is_string($siguienteFila[1]) && trim($siguienteFila[1]) !== '') {
                    $puestoEmpleado = trim($siguienteFila[1]);
                    
                    // Agregar al arreglo de puestos si no existe
                    if (!in_array($puestoEmpleado, $puestos)) {
                        $puestos[] = $puestoEmpleado;
                    }
                }
            }

            /**
             * Estos datos se obtendran posteriormente
             * datos generales del empleado sacos
             * del archivo excel
             */
            $empleado = [
                'clave' => $claveFormateada,
                'nombre' => $nombreEmpleado,
                'puesto' => $puestoEmpleado,
                'dias_trabajados' => 0,
                'vacaciones' => false,
                'dias_vacaciones' => 0,
                'incapacidades' => false,
                'dias_incapacidades' => 0,
                'ausencias' => false,
                'dias_ausencias' => 0
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
            if (is_string($cell) && preg_match('/d[ií]as\s+pagados:?/iu', trim($cell))) {
                $esDiasPagados = true;
                $colDiasPagados = $idx;
                break; // se rompe el foreach
            }
        }

        // Ya no usamos "Días pagados" porque incluye el domingo
        // Los días reales trabajados se obtienen de "Sueldo"

        /**
         * Estos son eventos que pueden o no
         * encontrarse en el archivo,
         * nota: justo al lado de Vacaciones hay un número
         * este número indica la cantidad de días que tuvo de vacaciones
         * lo mismo para incapacidades y ausencias
         */
        $nextRowIdx = array_search($row, $rows, true) + 1;
        if (isset($rows[$nextRowIdx])) {
            $nextRow = $rows[$nextRowIdx];
            foreach ($nextRow as $idx => $cell) {
                if (is_string($cell)) {
                    $texto = trim($cell);
                    $ultimoIdx = count($actualDepto['empleados']) - 1;

                    if (preg_match('/vacaciones/i', $texto)) {
                        $actualDepto['empleados'][$ultimoIdx]['vacaciones'] = true;
                        // Buscar el número de días en la siguiente celda
                        if (isset($nextRow[$idx + 1]) && is_numeric($nextRow[$idx + 1])) {
                            $actualDepto['empleados'][$ultimoIdx]['dias_vacaciones'] = (int)$nextRow[$idx + 1];
                        }
                    }
                    if (preg_match('/incapacidades/i', $texto)) {
                        $actualDepto['empleados'][$ultimoIdx]['incapacidades'] = true;
                        // Buscar el número de días en la siguiente celda
                        if (isset($nextRow[$idx + 1]) && is_numeric($nextRow[$idx + 1])) {
                            $actualDepto['empleados'][$ultimoIdx]['dias_incapacidades'] = (int)$nextRow[$idx + 1];
                        }
                    }
                    if (preg_match('/ausencias/i', $texto)) {
                        $actualDepto['empleados'][$ultimoIdx]['ausencias'] = true;
                        // Buscar el número de días en la siguiente celda
                        if (isset($nextRow[$idx + 1]) && is_numeric($nextRow[$idx + 1])) {
                            $actualDepto['empleados'][$ultimoIdx]['dias_ausencias'] = (int)$nextRow[$idx + 1];
                        }
                    }
                }
            }
        }

        if ($esDiasPagados && $actualDepto && !empty($actualDepto['empleados'])) {
            $ultimoIdx = count($actualDepto['empleados']) - 1;
            $foundSueldo = false;
            $startScan = $nextRowIdx;
            $endScan = $nextRowIdx + 10;

            for ($i = $startScan; $i <= $endScan; $i++) {
                if (!isset($rows[$i])) {
                    break;
                }

                foreach ($rows[$i] as $idx => $cell) {
                    if (is_string($cell) && preg_match('/\bsueldo\b/iu', trim($cell))) {
                        $colSueldo = $idx;
                        $colValor = $colSueldo + 1;
                        if (isset($rows[$i][$colValor])) {
                            $valorSueldo = trim((string)$rows[$i][$colValor]);
                            if (is_numeric($valorSueldo)) {
                                $diasSueldo = (float)$valorSueldo;
                                if ($diasSueldo > 0) {
                                    /**
                                     * Este es el verdadero días trabajados
                                     * que se encuentra en la fila de Días pagados
                                     */
                                    $actualDepto['empleados'][$ultimoIdx]['dias_trabajados'] = $diasSueldo;
                                }
                                $foundSueldo = true;
                                break 2;
                            }
                        }
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
    'fecha_inicio'  => $fechaInicio,
    'fecha_cierre'  => $fechaCierre,
    'departamentos' => $departamentos,
    'puestos'       => $puestos
];

echo json_encode($output);
