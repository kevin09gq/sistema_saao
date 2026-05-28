<?php

require_once __DIR__ . '/../../vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\IOFactory;

// ============================================================================
// VALIDAR ARCHIVO
// ============================================================================
if (
    !isset($_FILES['archivo_lista_raya']) ||
    empty($_FILES['archivo_lista_raya']['tmp_name'])
) {

    echo json_encode([
        'empleados'      => [],
        'id_empresa'     => 0,
        'nombre_empresa' => null
    ]);

    exit;
}

// ============================================================================
// CARGAR EXCEL
// ============================================================================
$tmpFile = $_FILES['archivo_lista_raya']['tmp_name'];

$spreadsheet = IOFactory::load($tmpFile);
$sheet = $spreadsheet->getActiveSheet();

$rows = $sheet->toArray();

// ============================================================================
// VARIABLES
// ============================================================================
$empleados = [];

$idEmpresa = 1; // Por defecto
$nombreEmpresa = null;

// ============================================================================
// BUSCAR NOMBRE DE EMPRESA
// Búsqueda más exhaustiva en múltiples filas y columnas
// ============================================================================
$empresaEncontrada = false;

// Buscar en las primeras 10 filas (índices 0-9)
for ($filaIdx = 0; $filaIdx <= 9 && !$empresaEncontrada; $filaIdx++) {
    
    if (!isset($rows[$filaIdx])) {
        continue;
    }

    // Buscar en todas las columnas de esa fila
    foreach ($rows[$filaIdx] as $colIdx => $valor) {

        if (
            $valor !== null &&
            $valor !== '' &&
            is_string($valor)
        ) {

            $textoEmpresa = trim($valor);

            // ================================================================
            // SB CITRIC - más flexible para capturar variaciones
            // ================================================================
            if (preg_match('/S\.?B\.?\s*CITRIC|SB\s*CITRICOS/i', $textoEmpresa)) {

                $idEmpresa = 2;
                $nombreEmpresa = $textoEmpresa;
                $empresaEncontrada = true;
                
                // Log para debug
                error_log("DEBUG: Empresa SB encontrada en Fila " . ($filaIdx + 1) . ", Columna " . ($colIdx + 1) . ": '$textoEmpresa'");

                break;
            }

            // ================================================================
            // CITRICOS SAAO - más flexible para capturar variaciones
            // ================================================================
            if (preg_match('/CITRICOS\s+SAAO|SAAO\s+CITRICOS/i', $textoEmpresa)) {

                $idEmpresa = 1;
                $nombreEmpresa = $textoEmpresa;
                $empresaEncontrada = true;
                
                // Log para debug
                error_log("DEBUG: Empresa SAAO encontrada en Fila " . ($filaIdx + 1) . ", Columna " . ($colIdx + 1) . ": '$textoEmpresa'");

                break;
            }
        }
    }
}

// Si no encontró empresa, log del default
if (!$empresaEncontrada) {
    error_log("DEBUG: No se detectó empresa en Excel, usando default (id_empresa = 1)");
}

// ============================================================================
// RECORRER FILAS
// ============================================================================
foreach ($rows as $rowIdx => $row) {

    // =========================================================================
    // EMPLEADO:
    // COLUMNA A = CLAVE
    // COLUMNA B = NOMBRE
    // =========================================================================
    if (
        isset($row[0]) &&
        $row[0] !== null &&
        $row[0] !== '' &&
        isset($row[1]) &&
        is_string($row[1])
    ) {

        // =====================================================================
        // RECUPERAR CLAVE CONSERVANDO FORMATO 004, 015, ETC.
        // =====================================================================
        $claveNumerica = trim((string)$row[0]);

        $clave = str_pad(
            preg_replace('/\D/', '', $claveNumerica),
            3,
            '0',
            STR_PAD_LEFT
        );

        $nombreEmpleado = trim($row[1]);

        // =========================================================================
        // VALIDAR QUE SEA UN NOMBRE REAL
        // =========================================================================

        // Excluir textos inválidos
        $textoInvalido = preg_match(
            '/REPARTO\s+DE\s+UTILIDADES|NETO\s+A\s+PAGAR|TOTAL|SUBTOTAL|ISR|IMSS/iu',
            $nombreEmpleado
        );

        // Validar formato de nombre
        // Debe tener al menos 2 palabras
        $nombreValido = preg_match(
            '/^[A-ZÁÉÍÓÚÑ]+(?:\s+[A-ZÁÉÍÓÚÑ]+)+$/iu',
            $nombreEmpleado
        );

        if ($nombreValido && !$textoInvalido) {

            $fechaIngreso = null;
            $tarjeta = null;

            // =====================================================================
            // BUSCAR DATOS RELACIONADOS
            // =====================================================================
            for (
                $searchIdx = $rowIdx + 1;
                $searchIdx <= $rowIdx + 30;
                $searchIdx++
            ) {

                if (!isset($rows[$searchIdx])) {
                    break;
                }

                // ================================================================
                // FECHA INGRESO O REINGRESO
                // COLUMNA B
                // Busca: "Fecha Ingr: dd/mm/yyyy" o "Fecha Reingr: dd/mm/yyyy"
                // ================================================================
                if ($fechaIngreso === null) {

                    $celdaB = isset($rows[$searchIdx][1])
                        ? trim((string)$rows[$searchIdx][1])
                        : '';

                    // Regex más flexible para capturar:
                    // "Fecha Ingr: 10/04/2017"
                    // "Fecha Ingreso: 10/04/2017"
                    // "Fecha Reingr: 16/08/2016"
                    // "Fecha Reingreso: 16/08/2016"
                    if (
                        preg_match(
                            '/Fecha\s+(?:Ingr(?:eso)?|Reingr(?:eso)?):\s*(\d{2})\/(\d{2})\/(\d{4})/iu',
                            $celdaB,
                            $matchFecha
                        )
                    ) {

                        $fechaIngreso =
                            $matchFecha[3] . '-' .
                            $matchFecha[2] . '-' .
                            $matchFecha[1];
                        
                        error_log("DEBUG: Fecha ingreso encontrada para empleado '$nombreEmpleado' (clave: $clave): '$fechaIngreso' en fila " . ($searchIdx + 1));
                    }
                }

                // ================================================================
                // NETO A PAGAR -> TARJETA
                // "Neto a pagar" en columna B
                // Valor en columna D
                // ================================================================
                if ($tarjeta === null) {

                    $celdaB = isset($rows[$searchIdx][1])
                        ? trim((string)$rows[$searchIdx][1])
                        : '';

                    if (preg_match('/^Neto\s+a\s+Pagar$/iu', $celdaB)) {

                        if (
                            isset($rows[$searchIdx][3]) &&
                            is_numeric($rows[$searchIdx][3])
                        ) {

                            $tarjeta = (float)$rows[$searchIdx][3];
                        }
                    }
                }

                // ================================================================
                // SI YA ENCONTRAMOS TODO
                // ================================================================
                if (
                    $fechaIngreso !== null &&
                    $tarjeta !== null
                ) {
                    break;
                }
            }

            // =====================================================================
            // AGREGAR EMPLEADO
            // =====================================================================
            $empleados[] = [
                'clave_empleado'     => $clave,
                'nombre'             => $nombreEmpleado,
                'id_empresa'         => $idEmpresa,
                'fecha_ingreso_imss' => $fechaIngreso,
                'tarjeta'            => $tarjeta
            ];
        }
    }
}

// ============================================================================
// RESPUESTA
// ============================================================================
echo json_encode([
    'empleados'      => $empleados,
    'id_empresa'     => $idEmpresa,
    'nombre_empresa' => $nombreEmpresa,
    'total_empleados' => count($empleados)
]);
