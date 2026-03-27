<?php

// Incluir autoload de Composer
require_once __DIR__ . '/../../../vendor/autoload.php';

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Color;
use PhpOffice\PhpSpreadsheet\Worksheet\PageSetup;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Worksheet\Drawing;

/**
 * Resta un día a una fecha en formato 'DD/MM/AAA' con meses abreviados en español (ENE, FEB, MAR, etc.) y devuelve la nueva fecha en el mismo formato.
 */
function restarUnDia($fecha)
{
    // Mapeo de meses abreviados en español a número
    $meses = [
        "Ene" => 1,
        "Feb" => 2,
        "Mar" => 3,
        "Abr" => 4,
        "May" => 5,
        "Jun" => 6,
        "Jul" => 7,
        "Ago" => 8,
        "Sep" => 9,
        "Oct" => 10,
        "Nov" => 11,
        "Dic" => 12
    ];

    // Separar la fecha
    list($dia, $mesAbrev, $anio) = explode("/", $fecha);

    // Crear objeto DateTime
    $mesNum = $meses[$mesAbrev];
    $date = DateTime::createFromFormat("d/m/Y", "$dia/$mesNum/$anio");

    // Restar un día
    $date->modify("-1 day");

    // Buscar la abreviatura del mes resultante
    $mesAbrevNuevo = array_search((int)$date->format("m"), $meses);

    // Formatear resultado
    return $date->format("d") . "/" . $mesAbrevNuevo . "/" . $date->format("Y");
}

//=====================
//  RECIBIR DATOS DEL JSON
//=====================

$jsonNomina = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['jsonNomina'])) {
    $jsonNomina = json_decode($_POST['jsonNomina'], true);
}

//=====================
//  CONFIGURACIÓN INICIAL
//=====================

$spreadsheet = new Spreadsheet();
$sheet = $spreadsheet->getActiveSheet();

// Aplicar fuente Arial como predeterminada para toda la hoja
$spreadsheet->getDefaultStyle()->getFont()->setName('Arial');

// Establecer el nombre de la pestaña
$sheet->setTitle('40 LBS SSS');


//=====================
//  TÍTULOS
//=====================

// Usar datos del JSON si existen
if ($jsonNomina) {
    $fecha_inicio = restarUnDia($jsonNomina['fecha_inicio']) ?? 'Fecha Inicio';
    $fecha_cierre = restarUnDia($jsonNomina['fecha_cierre']) ?? 'Fecha Cierre';
    $ano = date('Y');
} else {
    $fecha_inicio = '16/Ene';
    $fecha_cierre = '22/Ene';
    $ano = date('Y');
}

$titulo1 = 'PRODUCCION 40 LIBRAS';
$titulo2 = 'CITRICOS SAAO S.A DE C.V';
$titulo3 = 'NOMINA DEL ' . strtoupper($fecha_inicio) . ' AL ' . strtoupper($fecha_cierre);
$titulo4 = 'SEMANA ' . (isset($jsonNomina['numero_semana']) ? str_pad($jsonNomina['numero_semana'], 2, '0', STR_PAD_LEFT) : '00') . '-' . $ano;

// Agregar los títulos en las primeras filas
$sheet->setCellValue('A1', $titulo1);
$sheet->setCellValue('A2', $titulo2);
$sheet->setCellValue('A3', $titulo3);
$sheet->setCellValue('A4', $titulo4);

// Mergear las celdas para que los títulos ocupen toda la tabla
$sheet->mergeCells('A1:AA1');
$sheet->mergeCells('A2:AA2');
$sheet->mergeCells('A3:AA3');
$sheet->mergeCells('A4:AA4');

// Formatear título 1 - RANCHO EL PILAR (Purpura, Negrita, Tamaño 24)
$sheet->getStyle('A1')->getFont()->setBold(true);
$sheet->getStyle('A1')->getFont()->setSize(24);
$sheet->getStyle('A1')->getFont()->setColor(new Color('179C1E'));

// Formatear título 2 - PERSONAL DE BASE (Negrita, Tamaño 11)
$sheet->getStyle('A2')->getFont()->setBold(true);
$sheet->getStyle('A2')->getFont()->setSize(20);
$sheet->getStyle('A2')->getFont()->setColor(new Color('179C1E'));

// Formatear título 3 - NOMINA (Negrita, Tamaño 10)
$sheet->getStyle('A3')->getFont()->setBold(true);
$sheet->getStyle('A3')->getFont()->setSize(14);

// Formatear título 4 - SEMANA (Negrita, Tamaño 10)
$sheet->getStyle('A4')->getFont()->setBold(true);
$sheet->getStyle('A4')->getFont()->setSize(14);

// Centrar todos los títulos
$sheet->getStyle('A1:A4')->getAlignment()->setHorizontal('center');

// Insertar logo a la derecha de los títulos
$logoPath = '../../../public/img/logo.jpg';
if (file_exists($logoPath)) {
    $logo = new Drawing();
    $logo->setName('Logo');
    $logo->setDescription('Logo de Rancho El Relicario');
    $logo->setPath($logoPath);
    $logo->setHeight(190); // Altura en píxeles
    $logo->setCoordinates('B1'); // Colocar en columna Z, fila 1
    $logo->setOffsetX(10);
    $logo->setWorksheet($sheet);
}

//=====================
//  ENCABEZADOS DE LA TABLA
//=====================

// Definir las columnas de la tabla
$columnas = [
    'N°',
    'CD',
    'NOMBRE',
    'SUELDO NETO',
    'INCENTIVO',
    'EXTRAS',
    'TOTAL PERCEPCIONES',
    'ISR',
    'IMSS',
    'INFONAVIT',
    'AJUSTES AL SUB',
    'AUSENTISMO',
    'PERMISOS',
    'UNIFORMES',
    'BIOMETRICO',
    'F.A/GAFET/COFIA',
    'TOTAL DE DEDUCCIONES',
    'NETO A RECIBIR',
    'DISPERSION DE TARJETA',
    'IMPORTE EN EFECTIVO',
    'PRÉSTAMO',
    'TOTAL A RECIBIR',
    'REDONDEADO',
    'TOTAL EFECTIVO REDONDEADO',
    'FIRMA RECIBIDO'
];

// Agregar los encabezados en la fila 6
$columnaLetra = 'A';
foreach ($columnas as $columna) {
    $sheet->setCellValue($columnaLetra . '6', $columna);
    $columnaLetra++;
}

// Formatear los encabezados (Negrita, Centrados, Tamaño 10, Fondo Purpura, Letra Negra)
$sheet->getStyle('A6:Y6')->getFont()->setBold(true);
$sheet->getStyle('A6:Y6')->getFont()->setSize(10);
$sheet->getStyle('A6:Y6')->getFont()->setColor(new Color('000000')); // Letra negra
$sheet->getStyle('A6:Y6')->getAlignment()->setHorizontal('center');
$sheet->getStyle('A6:Y6')->getAlignment()->setVertical('center');
$sheet->getStyle('A6:Y6')->getAlignment()->setWrapText(true); // Ajustar texto

// Agregar color de fondo rojo a los encabezados
$sheet->getStyle('A6:Y6')->getFill()->setFillType('solid');
$sheet->getStyle('A6:Y6')->getFill()->getStartColor()->setRGB('F5EB1B'); // purpura

// Ajustar el ancho de las columnas para mejor visualización
$columnasAncho = [
    'A' => 12,   // N°
    'B' => 14,   // CD
    'C' => 65,  // NOMBRE
    'D' => 22,  // SUELDO NETO
    'E' => 20,  // INCENTIVO
    'F' => 20,  // EXTRAS
    'G' => 22,  // TOTAL PERCEPCIONES    OCULTAR COLUMNA
    'H' => 20,  // ISR
    'I' => 20,  // IMSS
    'J' => 20,  // INFONAVIT
    'K' => 22,  // AJUSTES AL SUB
    'L' => 21,  // AUSENTISMO
    'M' => 20,  // PERMISOS
    'N' => 20,  // UNIFORMES
    'O' => 20,  // CHECADOR
    'P' => 22,  // F.A/GAFET/COFIA
    'Q' => 22,  // TOTAL DE DEDUCCIONES  OCULTAR COLUMNA
    'R' => 22,  // NETO A RECIBIR
    'S' => 22,  // DISPERSION DE TARJETA
    'T' => 22,  // IMPORTE EN EFECTIVO
    'U' => 22,  // PRÉSTAMO
    'V' => 22,  // TOTAL A RECIBIR
    'W' => 20,  // REDONDEADO
    'X' => 23,  // TOTAL EFECTIVO REDONDEADO
    'Y' => 25  // FIRMA RECIBIDO
];

// Aplicar los anchos a cada columna
foreach ($columnasAncho as $columna => $ancho) {
    $sheet->getColumnDimension($columna)->setWidth($ancho);
}

//=====================
//  TAMAÑO DE LETRA POR COLUMNA
//=====================

// Configurar tamaño de letra para cada columna (configurable)
$tamanioLetraColumnas = [
    'A' => 14,  // N°
    'B' => 14,  // CD
    'C' => 14,  // NOMBRE
    'D' => 14,  // SUELDO NETO
    'E' => 14,  // INCENTIVO
    'F' => 14,  // EXTRAS
    'G' => 13,  // TOTAL PERCEPCIONES
    'H' => 14,  // ISR
    'I' => 14,  // IMSS
    'J' => 14,  // INFONAVIT
    'K' => 14,  // AJUSTES AL SUB
    'L' => 14,  // AUSENTISMO
    'M' => 14,  // PERMISOS
    'N' => 14,  // UNIFORMES
    'O' => 14,  // CHECADOR
    'P' => 13,  // F.A/GAFET/COFIA
    'Q' => 13,  // TOTAL DE DEDUCCIONES
    'R' => 13,  // NETO A RECIBIR
    'S' => 13,  // DISPERSION DE TARJETA
    'T' => 13,  // IMPORTE EN EFECTIVO
    'U' => 14,  // PRÉSTAMO
    'V' => 13,  // TOTAL A RECIBIR
    'W' => 14,  // REDONDEADO
    'X' => 13,  // TOTAL EFECTIVO REDONDEADO
    'Y' => 14  // FIRMA RECIBIDO
];

// Aplicar tamaño de letra a los encabezados (fila 6)
foreach ($tamanioLetraColumnas as $columna => $tamanio) {
    $sheet->getStyle($columna . '6')->getFont()->setSize($tamanio);
}

//=====================
//  AGREGAR DATOS DE EMPLEADOS 40 LIBRAS SIN SEGURO SOCIAL
//=====================

// Recopilar empleado con id_departamento = 4  y mostrar = true y seguroSocial = false
$empleados40Libras = [];

if ($jsonNomina && isset($jsonNomina['departamentos'])) {
    foreach ($jsonNomina['departamentos'] as $departamento) {
        if (isset($departamento['empleados'])) {
            foreach ($departamento['empleados'] as $empleado) {
                $idDepartamento = $empleado['id_departamento'] ?? null;
                $mostrar = $empleado['mostrar'] ?? false;
                $seguroSocial = $empleado['seguroSocial'] ?? false;

                if (($idDepartamento == 4) && $mostrar && !$seguroSocial) {
                    $empleados40Libras[] = $empleado;
                }
            }
        }
    }
}

// Ordenar empleados por nombre (orden ascendente A-Z)
usort($empleados40Libras, function ($a, $b) {
    return strcmp($a['nombre'] ?? '', $b['nombre'] ?? '');
});

//=====================
//  VERIFICAR COLUMNAS CON DATOS (CONFIGURACIÓN AUTO)
//=====================

// Determinar si la columna INCENTIVO tiene datos
$incentivoTieneDatos = false;

// Determinar si la columna AJUSTES AL SUB (código 107) tiene datos
$ajustesAlSubTieneDatos = false;

// Determinar si las columnas de descuentos adicionales tienen datos
$ausentismoTieneDatos = false;
$permisoTieneDatos = false;
$uniformeTieneDatos = false;

// Determinar si la columna CHECADOR y F.A/GAFET/COFIA tienen datos
$checadorTieneDatos = false;
$faxGafetCofiaTieneDatos = false;

foreach ($empleados40Libras as $empleado) {
    if (($empleado['incentivo'] ?? 0) != 0) {
        $incentivoTieneDatos = true;
    }

    if (($empleado['sueldo_neto'] ?? 0) != 0) {
        // Podríamos usar una bandera similar si fuera necesario, 
        // pero SUELDO NETO suele estar siempre
    }

    if (($empleado['inasistencia'] ?? 0) != 0) {
        $ausentismoTieneDatos = true;
    }

    if (($empleado['permiso'] ?? 0) != 0) {
        $permisoTieneDatos = true;
    }

    if (($empleado['uniforme'] ?? 0) != 0) {
        $uniformeTieneDatos = true;
    }

    if (($empleado['checador'] ?? 0) != 0) {
        $checadorTieneDatos = true;
    }

    if (($empleado['fa_gafet_cofia'] ?? 0) != 0) {
        $faxGafetCofiaTieneDatos = true;
    }

    // Verificar si existe código 107 en conceptos
    if (!empty($empleado['conceptos']) && is_array($empleado['conceptos'])) {
        foreach ($empleado['conceptos'] as $concepto) {
            if ($concepto['codigo'] === '107' && ($concepto['resultado'] ?? 0) != 0) {
                $ajustesAlSubTieneDatos = true;
                break;
            }
        }
    }
}

// Agregar empleados ordenados a la hoja
$numeroFila = 7;
$numeroEmpleado = 1;

foreach ($empleados40Libras as $empleado) {

    //====================================
    //  AGREGAR INFORMACION DEL EMPLEADO
    //====================================

    // Agregar número y clave
    $sheet->setCellValue('A' . $numeroFila, $numeroEmpleado);
    $sheet->setCellValue('B' . $numeroFila, $empleado['clave'] ?? '');

    // Agregar nombre en la columna NOMBRE
    $sheet->setCellValue('C' . $numeroFila, $empleado['nombre'] ?? '');

    //=============================
    //  AGREGAR PERCEPCIONES 
    //=============================

    // Agregar sueldo neto en la columna SUELDO NETO
    $sueldoNeto = $empleado['sueldo_neto'] ?? 0;
    if (!empty($sueldoNeto) && $sueldoNeto != 0) {
        $sheet->setCellValue('D' . $numeroFila, $sueldoNeto);
        // Aplicar formato de moneda al sueldo
        $sheet->getStyle('D' . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00');
    }

    // Agregar incentivo en la columna INCENTIVO
    $incentivo = $empleado['incentivo'] ?? 0;
    if (!empty($incentivo) && $incentivo != 0) {
        $sheet->setCellValue('E' . $numeroFila, $incentivo);
        $sheet->getStyle('E' . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00');
    }

    // Agregar sueldo extra total en la columna EXTRAS
    $sueldoExtraTotal = $empleado['sueldo_extra_total'] ?? 0;
    if (!empty($sueldoExtraTotal) && $sueldoExtraTotal != 0) {
        $sheet->setCellValue('F' . $numeroFila, $sueldoExtraTotal);
        $sheet->getStyle('F' . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00');
    }

    // Agregar fórmula de TOTAL PERCEPCIONES (suma dinámica de columnas existentes)
    $sheet->setCellValue('G' . $numeroFila, '=SUM(D' . $numeroFila . ':F' . $numeroFila . ')');
    $sheet->getStyle('G' . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00');

    //=============================
    //  AGREGAR DEDUCCIONES 
    //=============================

    // Mapeo de códigos de conceptos a columnas
    $mapeoConceptos = [
        '45'  => 'H',   // ISR
        '52'  => 'I',   // IMSS
        '16'  => 'J',   // INFONAVIT
        '107' => 'K',   // AJUSTES AL SUB
    ];

    // Recorrer conceptos si existen
    if (!empty($empleado['conceptos']) && is_array($empleado['conceptos'])) {
        foreach ($empleado['conceptos'] as $concepto) {
            $codigo = $concepto['codigo'] ?? null;
            $resultado = $concepto['resultado'] ?? 0;

            // No incluir código 107 si no tiene datos en ningún empleado
            if ($codigo === '107' && !$ajustesAlSubTieneDatos) {
                continue;
            }

            // Verificar si el código está en el mapeo
            if (isset($mapeoConceptos[$codigo]) && !empty($resultado) && $resultado != 0) {
                $columna = $mapeoConceptos[$codigo];
                $sheet->setCellValue($columna . $numeroFila, $resultado);
                // Aplicar formato de moneda con signo negativo y color rojo
                $sheet->getStyle($columna . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
                $sheet->getStyle($columna . $numeroFila)->getFont()->setColor(new Color('FF0000'));
            }
        }
    }

    // Agregar inasistencia/ausentismo en la columna AUSENTISMO (solo si hay datos)
    if ($ausentismoTieneDatos) {
        $inasistencia = $empleado['inasistencia'] ?? 0;
        if (!empty($inasistencia) && $inasistencia != 0) {
            $sheet->setCellValue('L' . $numeroFila, $inasistencia);
            $sheet->getStyle('L' . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
            $sheet->getStyle('L' . $numeroFila)->getFont()->setColor(new Color('FF0000'));
        }
    }

    // Agregar permiso en la columna PERMISOS (solo si hay datos)
    if ($permisoTieneDatos) {
        $permiso = $empleado['permiso'] ?? 0;
        if (!empty($permiso) && $permiso != 0) {
            $sheet->setCellValue('M' . $numeroFila, $permiso);
            $sheet->getStyle('M' . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
            $sheet->getStyle('M' . $numeroFila)->getFont()->setColor(new Color('FF0000'));
        }
    }

    // Agregar uniforme en la columna UNIFORMES (solo si hay datos)
    if ($uniformeTieneDatos) {
        $uniforme = $empleado['uniforme'] ?? 0;
        if (!empty($uniforme) && $uniforme != 0) {
            $sheet->setCellValue('N' . $numeroFila, $uniforme);
            $sheet->getStyle('N' . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
            $sheet->getStyle('N' . $numeroFila)->getFont()->setColor(new Color('FF0000'));
        }
    }

    // Agregar checador en la columna CHECADOR (solo si hay datos)
    if ($checadorTieneDatos) {
        $checador = $empleado['checador'] ?? 0;
        if (!empty($checador) && $checador != 0) {
            $sheet->setCellValue('O' . $numeroFila, $checador);
            $sheet->getStyle('O' . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
            $sheet->getStyle('O' . $numeroFila)->getFont()->setColor(new Color('FF0000'));
        }
    }

    // Agregar F.A/GAFET/COFIA en la columna F.A/GAFET/COFIA (solo si hay datos)
    if ($faxGafetCofiaTieneDatos) {
        $faxGafetCofia = $empleado['fa_gafet_cofia'] ?? 0;
        if (!empty($faxGafetCofia) && $faxGafetCofia != 0) {
            $sheet->setCellValue('P' . $numeroFila, $faxGafetCofia);
            $sheet->getStyle('P' . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
            $sheet->getStyle('P' . $numeroFila)->getFont()->setColor(new Color('FF0000'));
        }
    }

    // Agregar TOTAL DE DEDUCCIONES (suma de todas las deducciones columnas H a P)
    $sheet->setCellValue('Q' . $numeroFila, '=SUM(H' . $numeroFila . ':P' . $numeroFila . ')');
    $sheet->getStyle('Q' . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
    $sheet->getStyle('Q' . $numeroFila)->getFont()->setColor(new Color('FF0000'));

    // Agregar NETO A RECIBIR (SUM Percepciones - SUM Deducciones)
    $sheet->setCellValue('R' . $numeroFila, '=SUM(D' . $numeroFila . ':F' . $numeroFila . ')-SUM(H' . $numeroFila . ':P' . $numeroFila . ')');
    $sheet->getStyle('R' . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00');

    // Agregar DISPERSION DE TARJETA 
    $tarjeta = $empleado['tarjeta'] ?? 0;
    if (!empty($tarjeta) && $tarjeta != 0) {
        $sheet->setCellValue('S' . $numeroFila, $tarjeta);
        $sheet->getStyle('S' . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
        $sheet->getStyle('S' . $numeroFila)->getFont()->setColor(new Color('FF0000'));
    }

    // Agregar IMPORTE EN EFECTIVO (NETO A RECIBIR - DISPERSION DE TARJETA)
    $sheet->setCellValue('T' . $numeroFila, '=R' . $numeroFila . '-S' . $numeroFila);
    $sheet->getStyle('T' . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00');

    // Agregar PRÉSTAMO 
    $prestamo = $empleado['prestamo'] ?? 0;
    if (!empty($prestamo) && $prestamo != 0) {
        $sheet->setCellValue('U' . $numeroFila, $prestamo);
        $sheet->getStyle('U' . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
        $sheet->getStyle('U' . $numeroFila)->getFont()->setColor(new Color('FF0000'));
    }

    // Agregar TOTAL A RECIBIR (IMPORTE EN EFECTIVO - PRÉSTAMO)
    $sheet->setCellValue('V' . $numeroFila, '=T' . $numeroFila . '-U' . $numeroFila);
    $sheet->getStyle('V' . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00');

    // Agregar REDONDEADO (fórmula que calcula diferencia al redondear)
    $sheet->setCellValue('W' . $numeroFila, '=ROUND(V' . $numeroFila . ',0)-V' . $numeroFila);
    $sheet->getStyle('W' . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00;[RED]-$#,##0.00');

    // Agregar TOTAL EFECTIVO REDONDEADO (TOTAL A RECIBIR +/- REDONDEADO)
    $sheet->setCellValue('X' . $numeroFila, '=V' . $numeroFila . '+W' . $numeroFila);
    $sheet->getStyle('X' . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00');

    // Centrar datos en A y B (horizontal y verticalmente)
    $sheet->getStyle('A' . $numeroFila . ':B' . $numeroFila)->getAlignment()->setHorizontal('center');
    $sheet->getStyle('A' . $numeroFila . ':B' . $numeroFila)->getAlignment()->setVertical('center');

    // Alinear nombre en C (centrado verticalmente, alineado a izquierda horizontalmente)
    $sheet->getStyle('C' . $numeroFila)->getAlignment()->setHorizontal('left');
    $sheet->getStyle('C' . $numeroFila)->getAlignment()->setVertical('center');

    // Centrar sueldo, pasaje, comida, extras, total percepciones, deducciones, descuentos (D a X)
    $sheet->getStyle('D' . $numeroFila . ':X' . $numeroFila)->getAlignment()->setHorizontal('center');
    $sheet->getStyle('D' . $numeroFila . ':X' . $numeroFila)->getAlignment()->setVertical('center');

    $numeroFila++;
    $numeroEmpleado++;
}

//=====================
//  APLICAR FORMATOS A TODAS LAS CELDAS DE DATOS (INCLUSO VACIAS)
//=====================

// Iterar sobre todas las filas de datos (7 hasta numeroFila-1)
for ($fila = 7; $fila < $numeroFila; $fila++) {
    // Columnas con formato deducciones: H-K (ISR, IMSS, INFONAVIT, AJUSTES AL SUB)
    for ($col = 'H'; $col <= 'K'; $col++) {
        $sheet->getStyle($col . $fila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
        $sheet->getStyle($col . $fila)->getFont()->setColor(new Color('FF0000'));
    }

    // Columnas con formato descuentos: L-P (AUSENTISMO, PERMISOS, UNIFORMES, CHECADOR, F.A/GAFET/COFIA)
    for ($col = 'L'; $col <= 'P'; $col++) {
        $sheet->getStyle($col . $fila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
        $sheet->getStyle($col . $fila)->getFont()->setColor(new Color('FF0000'));
    }

    // Columna Q: TOTAL DE DEDUCCIONES (rojo con signo negativo)
    $sheet->getStyle('Q' . $fila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
    $sheet->getStyle('Q' . $fila)->getFont()->setColor(new Color('FF0000'));

    // Columna S: DISPERSION DE TARJETA (rojo con signo negativo)
    $sheet->getStyle('S' . $fila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
    $sheet->getStyle('S' . $fila)->getFont()->setColor(new Color('FF0000'));

    // Columna U: PRESTAMO (rojo con signo negativo)
    $sheet->getStyle('U' . $fila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
    $sheet->getStyle('U' . $fila)->getFont()->setColor(new Color('FF0000'));

    // Columna W: REDONDEADO (formato condicional: positivo normal, negativo rojo)
    $sheet->getStyle('W' . $fila)->getNumberFormat()->setFormatCode('$#,##0.00;[RED]-$#,##0.00');

    // Columnas de moneda normal: D, E, F, G, R, T, V, X
    foreach (['D', 'E', 'F', 'G', 'R', 'T', 'V', 'X'] as $col) {
        $sheet->getStyle($col . $fila)->getNumberFormat()->setFormatCode('$#,##0.00');
    }
}

//=====================
//  AGREGAR FILA DE TOTALES
//=====================

$filaTotal = $numeroFila;

// Agregar etiqueta "TOTALES" en columna A
$sheet->setCellValue('A' . $filaTotal, 'TOTALES');
$sheet->getStyle('A' . $filaTotal)->getFont()->setBold(true);
$sheet->getStyle('A' . $filaTotal)->getAlignment()->setHorizontal('center');
$sheet->getStyle('A' . $filaTotal)->getAlignment()->setVertical('center');

// Agregar fórmulas SUM para cada columna de datos (D a X)
$columnasData = ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X'];

foreach ($columnasData as $columna) {
    $rangoSuma = $columna . '7:' . $columna . ($filaTotal - 1);
    $sheet->setCellValue($columna . $filaTotal, '=IF(SUM(' . $rangoSuma . ')=0,"",SUM(' . $rangoSuma . '))');
    $sheet->getStyle($columna . $filaTotal)->getFont()->setBold(true);
    $sheet->getStyle($columna . $filaTotal)->getFont()->setSize(14);

    // Aplicar formato de moneda según la columna
    if (in_array($columna, ['H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'S', 'U'])) {
        // Formato rojo con signo negativo
        $sheet->getStyle($columna . $filaTotal)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
        $sheet->getStyle($columna . $filaTotal)->getFont()->setColor(new Color('FF0000'));
    } elseif ($columna === 'W') {
        // Formato condicional para REDONDEADO
        $sheet->getStyle($columna . $filaTotal)->getNumberFormat()->setFormatCode('$#,##0.00;[RED]-$#,##0.00');
    } else {
        // Formato moneda normal
        $sheet->getStyle($columna . $filaTotal)->getNumberFormat()->setFormatCode('$#,##0.00');
    }

    // Centrar alineación
    $sheet->getStyle($columna . $filaTotal)->getAlignment()->setHorizontal('center');
    $sheet->getStyle($columna . $filaTotal)->getAlignment()->setVertical('center');
}

// Aplicar altura y color de fondo a la fila de totales
$sheet->getRowDimension($filaTotal)->setRowHeight(25);
$sheet->getStyle('A' . $filaTotal . ':X' . $filaTotal)->getFill()->setFillType('solid');
$sheet->getStyle('A' . $filaTotal . ':X' . $filaTotal)->getFill()->getStartColor()->setRGB('D3D3D3'); // Gris claro

//=====================
//  AGREGAR BORDES NEGROS A LA TABLA
//=====================

$estiloBordesTabla = [
    'borders' => [
        'allBorders' => [
            'borderStyle' => Border::BORDER_THIN,
            'color' => ['rgb' => '000000'],
        ],
    ],
];

$sheet->getStyle('A6:Y' . $filaTotal)->applyFromArray($estiloBordesTabla);

//=====================
//  OCULTAR COLUMNAS SIN DATOS
//=====================
// Ocultar columna INCENTIVO si no tiene datos
if (!$incentivoTieneDatos) {
    $sheet->getColumnDimension('E')->setVisible(false);
}

// Ocultar columna AJUSTES AL SUB si no tiene datos
if (!$ajustesAlSubTieneDatos) {
    $sheet->getColumnDimension('K')->setVisible(false);
}

// Ocultar columna AUSENTISMO si no tiene datos
if (!$ausentismoTieneDatos) {
    $sheet->getColumnDimension('L')->setVisible(false);
}

// Ocultar columna PERMISOS si no tiene datos
if (!$permisoTieneDatos) {
    $sheet->getColumnDimension('M')->setVisible(false);
}

// Ocultar columna UNIFORMES si no tiene datos
if (!$uniformeTieneDatos) {
    $sheet->getColumnDimension('N')->setVisible(false);
}

// Ocultar columna CHECADOR si no tiene datos
if (!$checadorTieneDatos) {
    $sheet->getColumnDimension('O')->setVisible(false);
}

// Ocultar columna F.A/GAFET/COFIA si no tiene datos
if (!$faxGafetCofiaTieneDatos) {
    $sheet->getColumnDimension('P')->setVisible(false);
}

// Ocultar columnas de totales permanentemente
$sheet->getColumnDimension('G')->setVisible(false);
$sheet->getColumnDimension('Q')->setVisible(false);

//=====================
//  CONFIGURAR ALTURA DE FILAS Y TAMAÑO DE LETRA
//=====================

// Configurar tamaño de letra para cada columna (configurable)
$tamanioLetraFilas = [
    'A' => 14,  // N°
    'B' => 14,  // CD
    'C' => 16,  // NOMBRE
    'D' => 15,  // SUELDO NETO
    'E' => 15,  // INCENTIVO
    'F' => 15,  // EXTRAS
    'G' => 15,  // TOTAL PERCEPCIONES
    'H' => 15,  // ISR
    'I' => 15,  // IMSS
    'J' => 15,  // INFONAVIT
    'K' => 15,  // AJUSTES AL SUB
    'L' => 15,  // AUSENTISMO
    'M' => 15,  // PERMISOS
    'N' => 15,  // UNIFORMES
    'O' => 15,  // CHECADOR
    'P' => 15,  // F.A/GAFET/COFIA
    'Q' => 15,  // TOTAL DE DEDUCCIONES
    'R' => 15,  // NETO A RECIBIR
    'S' => 15,  // DISPERSION DE TARJETA
    'T' => 15,  // IMPORTE EN EFECTIVO
    'U' => 15,  // PRÉSTAMO
    'V' => 15,  // TOTAL A RECIBIR
    'W' => 15,  // REDONDEADO
    'X' => 15  // TOTAL EFECTIVO REDONDEADO
];

// Altura de los títulos
$sheet->getRowDimension(1)->setRowHeight(38);
$sheet->getRowDimension(2)->setRowHeight(32);
$sheet->getRowDimension(3)->setRowHeight(32);
$sheet->getRowDimension(4)->setRowHeight(32);

// Altura de separación (fila 5)
$sheet->getRowDimension(5)->setRowHeight(35);

// Altura de los encabezados
$sheet->getRowDimension(6)->setRowHeight(45);

// CONFIGURACIÓN PERSONALIZABLE
$alturaFilas = 48;      // Altura de filas de datos (puntos)

// Aplicar altura a las filas de datos
for ($fila = 7; $fila < $numeroFila; $fila++) {
    $sheet->getRowDimension($fila)->setRowHeight($alturaFilas);

    // Aplicar tamaño de letra por columna a cada fila de datos
    foreach ($tamanioLetraFilas as $columna => $tamanio) {
        $sheet->getStyle($columna . $fila)->getFont()->setSize($tamanio);
    }
}

//=====================
//  CONFIGURACIÓN DE PÁGINA
//=====================

// Establecer el tamaño de página a CARTA (Letter)
$sheet->getPageSetup()->setPaperSize(PageSetup::PAPERSIZE_LETTER);

// Establecer orientación a HORIZONTAL (Landscape)
$sheet->getPageSetup()->setOrientation(PageSetup::ORIENTATION_LANDSCAPE);

// Establecer márgenes
$sheet->getPageMargins()->setLeft(0.5);
$sheet->getPageMargins()->setRight(0.5);
$sheet->getPageMargins()->setTop(0.5);
$sheet->getPageMargins()->setBottom(0.5);

// Ajustar la escala para que todo quepa en una página
$sheet->getPageSetup()->setFitToPage(true);
$sheet->getPageSetup()->setFitToHeight(1);
$sheet->getPageSetup()->setFitToWidth(1);

// Definir el área de impresión
$ultimaFila = $filaTotal;
$sheet->getPageSetup()->setPrintArea('A1:Y' . $ultimaFila);

//=====================
//  DESCARGAR ARCHIVO
//=====================

$writer = new Xlsx($spreadsheet);

// Definir el nombre del archivo con fecha y hora
$filename = 'Nomina_Coordinador_Rancho_Pilar_' . date('Y-m-d_H-i-s') . '.xlsx';

// Configurar las cabeceras para descargar el archivo
header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
header('Content-Disposition: attachment; filename="' . $filename . '"');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

// Escribir el archivo al cliente
$writer->save('php://output');
exit;
