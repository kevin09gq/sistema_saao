<?php
require '../../../vendor/autoload.php';
use PhpOffice\PhpSpreadsheet\IOFactory;

if (!isset($_FILES['archivo_excel'])) {
    echo json_encode(['error' => 'No se envió archivo']);
    exit;
}

$tmpFile = $_FILES['archivo_excel']['tmp_name'];
$spreadsheet = IOFactory::load($tmpFile);
$sheet = $spreadsheet->getActiveSheet();
$rows = $sheet->toArray();

$empleados = [];
$ultimoEmpleadoIdx = null;
$procesandoEmpleados = false;
$enDepartamento = false;

function convertirImporteANumero($valor)
{
    if (is_numeric($valor)) {
        return (float) $valor;
    }

    if (!is_string($valor)) {
        return 0.0;
    }

    $valorLimpio = trim($valor);
    $valorLimpio = str_replace(['$', ',', ' '], '', $valorLimpio);

    if ($valorLimpio === '' || !is_numeric($valorLimpio)) {
        return 0.0;
    }

    return (float) $valorLimpio;
}

function formatearImporteComoTexto($valor)
{
    return number_format((float) $valor, 2, '.', '');
}

foreach ($rows as $row) {
    // Detectar nuevo departamento (para saber que estamos en la sección de empleados)
    if (isset($row[0]) && is_string($row[0])) {
        $cell = ltrim($row[0], "'");
        $cell = preg_replace('/(Reg\.? Pat\.? IMSS.*)$/i', '', $cell);
        if (preg_match('/^(\d+)\s+(.+)/u', $cell, $match)) {
            $enDepartamento = true;
            $ultimoEmpleadoIdx = null;
            $procesandoEmpleados = false;
            continue;
        }
    }

    // Detectar empleado
    if (
        $enDepartamento &&
        isset($row[0]) && is_numeric($row[0]) &&
        isset($row[1]) && is_string($row[1]) && trim($row[1]) !== ''
    ) {
        $nombreEmpleado = trim($row[1]);
        if (preg_match('/^[A-ZÁÉÍÓÚÑ]+\s+[A-ZÁÉÍÓÚÑ]+/u', $nombreEmpleado)) {
            // Formatear la clave para que tenga 3 dígitos con ceros a la izquierda
            $claveFormateada = str_pad((string)$row[0], 3, '0', STR_PAD_LEFT);
            
            $empleados[] = [
                'clave' => $claveFormateada,
                'nombre' => $nombreEmpleado,
                'tarjeta' => null,
                'conceptos' => []
            ];
            
            $ultimoEmpleadoIdx = count($empleados) - 1;
            $procesandoEmpleados = true;
            continue;
        }
    }

    // Detectar "Neto a pagar"
    if ($enDepartamento) {
        $esNeto = false;
        $colNeto = null;
        foreach ($row as $idx => $cell) {
            if (is_string($cell) && preg_match('/neto\\s*a\\s*pagar/i', $cell)) {
                $esNeto = true;
                $colNeto = $idx;
                break;
            }
        }
        if ($esNeto && $colNeto !== null) {
            for ($i = $colNeto + 1; $i < count($row); $i++) {
                if (is_numeric($row[$i])) {
                    $neto = floatval($row[$i]);
                    if ($neto > 0 && !empty($empleados)) {
                        // Asignar SIEMPRE al último empleado detectado
                        $empleados[count($empleados) - 1]['tarjeta'] = $neto;
                    }
                    break;
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

    // Guardar conceptos
    if (
        $procesandoEmpleados && $ultimoEmpleadoIdx !== null &&
        isset($row[5]) && isset($row[6]) && isset($row[8])
    ) {
        $codigoConcepto = trim($row[5]);
        $nombreConcepto = trim($row[6]);
        $resultadoConcepto = trim($row[8]);

        if (in_array($codigoConcepto, ['14', '15', '16'], true)) {
            $importeInfonavit = convertirImporteANumero($resultadoConcepto);
            $concepto16Idx = null;

            foreach ($empleados[$ultimoEmpleadoIdx]['conceptos'] as $idx => $concepto) {
                if (($concepto['codigo'] ?? null) === '16') {
                    $concepto16Idx = $idx;
                    break;
                }
            }

            if ($concepto16Idx === null) {
                $empleados[$ultimoEmpleadoIdx]['conceptos'][] = [
                    'codigo' => '16',
                    'nombre' => 'INFONAVIT',
                    'resultado' => formatearImporteComoTexto($importeInfonavit)
                ];
            } else {
                $nuevoImporte =
                    convertirImporteANumero($empleados[$ultimoEmpleadoIdx]['conceptos'][$concepto16Idx]['resultado']) + $importeInfonavit;

                $empleados[$ultimoEmpleadoIdx]['conceptos'][$concepto16Idx]['resultado'] =
                    formatearImporteComoTexto($nuevoImporte);
            }
        } elseif (in_array($codigoConcepto, ['45', '52', '107'], true)) {
            $empleados[$ultimoEmpleadoIdx]['conceptos'][] = [
                'codigo' => $codigoConcepto,
                'nombre' => $nombreConcepto,
                'resultado' => $resultadoConcepto
            ];
        }
    }
}

$empleados = array_values(array_filter($empleados));

echo json_encode([
    'empleados' => $empleados
]);
