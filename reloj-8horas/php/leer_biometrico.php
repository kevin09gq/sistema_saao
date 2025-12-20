<?php
require '../../vendor/autoload.php';
use PhpOffice\PhpSpreadsheet\IOFactory;

$tmpFile = $_FILES['archivo_excel2']['tmp_name']; // archivo del reloj
$spreadsheet = IOFactory::load($tmpFile); // Cargar el archivo
$sheet = $spreadsheet->getActiveSheet(); // Detectar la hoja activa
$highestRow = $sheet->getHighestRow(); // Detectar el número de final

// Fuerza el cálculo de fórmulas
$spreadsheet->getCalculationEngine()->disableCalculationCache();

$empleados = [];
$empleadoActual = null;
$leyendoRegistros = false;

for ($i = 1; $i <= $highestRow; $i++) { // Va ir recorriendo fila por fila de arriba hacia abajo y aumentara en uno en uno

    /**
     * Va recuperar el valor de las celdas seleccionar en el valor de la fila
     * Osea por ejem. A1, D1, E1, G1 y J1
     * Luego sera A2. D2, E2, G2 y J2
     * Luego sera A3. D3, E3, G3 y J3 y asi sigue avanzando
     */
    $colA = trim($sheet->getCell("A{$i}")->getValue());
    $colD = trim($sheet->getCell("D{$i}")->getValue());
    $colE = trim($sheet->getCell("E{$i}")->getValue());
    $colG = trim($sheet->getCell("G{$i}")->getValue());
    $colJ = trim($sheet->getCell("J{$i}")->getValue());

    /**
     * Va a buscar la palabra Nombre, literal va ir revisando que un A1 diga Nombre,
     * si no, va a pasar a A2 y buscar si dice Nombre, el primero esta
     * en el A7
     */
    if ($colA === "Nombre") {

        /**
         * Si ya se detecto un empleado, simplemente se agrega al arreglo global de empleados
         * O al menos eso entiendo kbron, o si empleadoActual es igual a null simplemente
         * se pasa de largo sin hacer nada
         */
        if ($empleadoActual !== null) {
            $empleados[] = $empleadoActual;
        }

        /**
         * Se prepara la estructura inicial para el empleado que se va trabajar
         * siendo su nombre, el cual esta en la columna D, aunque en el archivo abarca la D, E y F
         * Luego los demás datos simplemente se inicializan
         */
        $empleadoActual = [
            'nombre' => $colD,
            'id_biometrico' => null, // Agregar campo para ID biométrico
            'registros' => [],
            'horas_totales' => "",
            'tiempo_total' => ""
        ];

        $leyendoRegistros = false; // Detiene la lectura de registros

        /**
         * Digamos que no encontro la palabra Nombre, ahora va buscar la palabra ID
         * la cual se encuentra gusto abajo de Nombre en la misma columna A
         * El primer ID esta en la columna A8
         */
    } elseif ($colA === "ID") {
        /**
         * Si encuentra lo que dice ID, vuelve a inicializar la lectura
         * lo cual significa que hay información abajo de esa celda
         */
        $leyendoRegistros = true; 


        /**
         * Aqui va a buscar la palabra Horas totales, pero creo que hace uso de
         * la función nativa stripos porque se encuentra conformada por varias celdas.
         * La primera horas total esta en las celdas A16, B16, C16 y D16
         */
    } elseif (stripos($colA, 'Horas totales') !== false) {

        /**
         * Aqui simplemente verifica que haya un empleado
         * con el cual se esta trabajando, sino, simplemente
         * no hace nada
         */
        if ($empleadoActual !== null) {

            /**
             * Las horas totales estan en la columna E
             */
            $empleadoActual['horas_totales'] = $colE;

            // Convertir a HH:MM y asignar a tiempo_total
            /**
             * Si el valor de la columna E, osea las horas totales
             * es un número, ya sea entero o decimal se ejecuta
             * lo de adentro, sino pasa de largo
             */
            if (is_numeric($colE)) {

                // Como puede ser un número decinal, por floor() se recupera sólo el enterno
                $horas = floor($colE);
                // Aqui se obtienen los minutos
                $minutos = round(($colE - $horas) * 60);
                /**
                 * Guarda el tiempo en el formato HH:mm, se esta forma
                 * se sabe cuantas horas trabajo el empleado
                 */
                $empleadoActual['tiempo_total'] = sprintf("%d:%02d", $horas, $minutos);
            }
        }



        /**
         * Esta parte es casi lo mismo que el anterior, busca que 
         * en la columna G exista la palabra Tiempo total
         */
    } elseif (stripos($colG, 'Tiempo total') !== false) {

        // Se ejecuta lo de adentro si hay un empleado
        if ($empleadoActual !== null) {
            // Usar getCalculatedValue por si es fórmula, si no, getValue
            $valorCalculado = $sheet->getCell("J{$i}")->getCalculatedValue();

            /**
             * Aqui simplemente asegura que el valor obtenido exista
             */
            if ($valorCalculado === null || $valorCalculado === '') {
                $valorCalculado = $sheet->getCell("J{$i}")->getValue(); // si existe solo trae el valor
            }

            /**
             * Como tiempo total ya esta en el formato HH:mm
             * simplemente se guardar el valor recuperado
             */
            $empleadoActual['tiempo_total'] = $valorCalculado;

            // El empleado actual es metido en el arreglo de empleados
            $empleados[] = $empleadoActual;

            // el empleado con el cual se va venido trabajando se va a la vrg
            $empleadoActual = null;
        }

        // el leyendo registro se deteniene
        $leyendoRegistros = false;

        
        /**
         * Verifica si aun se esta leyendo registros 
         * y verifica si la columna A es un número,
         * se busca las columna bajo de la celda que dice ID
         */
    } elseif ($leyendoRegistros && is_numeric($colA)) {
        
        /**
         * Si existe un empleado con el cual se trabaja
         * y ese empleado su id_biometrico aun es null entonces se recupera una vez el valor
         * del id que esta abajo de la celda que dice ID, si ya lo tiene
         * simplemente pasa de largo a la vrg
         */
        if ($empleadoActual !== null && $empleadoActual['id_biometrico'] === null) {
            $empleadoActual['id_biometrico'] = $colA;
        }
        
        // Se recupera la fecha que esta en la columna C
        $fecha = trim($sheet->getCell("C{$i}")->getValue());
        // Se recupera el valor de la hora de entrada en la columna E
        $entrada = trim($sheet->getCell("E{$i}")->getValue());
        // Se recupera el valor de la hora de salida en la columna F
        $salida = trim($sheet->getCell("F{$i}")->getValue());
        // Se recupera el tiempo trabajo = salida - entrada de la columna J
        $trabajado = trim($sheet->getCell("J{$i}")->getValue());

        // Se valida que los datos recuperado existan
        if ($fecha !== "" || $entrada !== "" || $salida !== "" || $trabajado !== "") {

            /**
             * Si es que existen, se guardan en registros, y se 
             * van a ir acumulando en cada vuelta
             */
            $empleadoActual['registros'][] = [
                'fecha' => $fecha,
                'entrada' => $entrada,
                'salida' => $salida,
                'trabajado' => $trabajado
            ];
        }
    }

    // Fin del for
}

// Si quedó un empleado pendiente al final
if ($empleadoActual !== null) {
    $empleados[] = $empleadoActual;
}

echo json_encode(['empleados' => $empleados], JSON_UNESCAPED_UNICODE);