<?php
require '../../../vendor/autoload.php';
use PhpOffice\PhpSpreadsheet\IOFactory;

// Se lee desde 'archivo_excel', que es el nombre enviado en el FormData de JS
$tmpFile = $_FILES['archivo_excel']['tmp_name'];
$spreadsheet = IOFactory::load($tmpFile);
$sheet = $spreadsheet->getActiveSheet();
$highestRow = $sheet->getHighestRow();

// Fuerza el cálculo de fórmulas
$spreadsheet->getCalculationEngine()->disableCalculationCache();

$empleados = [];
$empleadoActual = null;
$leyendoRegistros = false;

// Días de la semana en español
$diasSemanaEspanol = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

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
            // Nada que hacer aquí
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
            // Calcular el día de la semana en español a partir de la fecha (d/m/Y)
            $diaSemana = '';
            if ($fecha !== "") {
                $fechaObjeto = DateTime::createFromFormat('d/m/Y', $fecha);
                if ($fechaObjeto) {
                    $indiceDia = (int)$fechaObjeto->format('w');
                    $diaSemana = $diasSemanaEspanol[$indiceDia];
                }
            }

            // Calcular minutos trabajados
            $minutos = 0;
            if ($entrada !== "" && $salida !== "") {
                // Intentar parsear las horas (formato puede ser H:i o H:i:s)
                // Usamos una fecha base para asegurar cálculo correcto
                $entradaTime = DateTime::createFromFormat('H:i', $entrada, new DateTimeZone('UTC')) ?: 
                              DateTime::createFromFormat('H:i:s', $entrada, new DateTimeZone('UTC'));
                $salidaTime = DateTime::createFromFormat('H:i', $salida, new DateTimeZone('UTC')) ?: 
                             DateTime::createFromFormat('H:i:s', $salida, new DateTimeZone('UTC'));
                
                if ($entradaTime && $salidaTime) {
                    // Establecer una fecha base común para ambos tiempos
                    $entradaTime->setDate(2000, 1, 1);
                    $salidaTime->setDate(2000, 1, 1);
                    
                    // Calcular la diferencia en segundos
                    $diferencia = $salidaTime->getTimestamp() - $entradaTime->getTimestamp();
                    // Convertir a minutos
                    $minutos = abs($diferencia / 60);
                }
            }

            $empleadoActual['registros'][] = [
                'fecha' => $fecha,
                'dia' => $diaSemana, // Se guarda el nombre del día en español para simplificar JS
                'entrada' => $entrada,
                'salida' => $salida,
                'minutos' => $minutos,
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