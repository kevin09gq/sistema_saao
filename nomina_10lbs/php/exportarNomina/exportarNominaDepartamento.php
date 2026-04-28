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
    $mesAbrevNuevo = array_search((int) $date->format("m"), $meses);

    // Formatear resultado
    return $date->format("d") . "/" . $mesAbrevNuevo . "/" . $date->format("Y");
}

/**
 * Determina si el color de fuente debe ser blanco o negro basándose en la luminancia del fondo.
 */
function obtenerColorContraste($hexColor)
{
    // Si el color es inválido, devolver negro
    if (strlen($hexColor) !== 6)
        return '000000';

    // Convertir hex a RGB
    $r = hexdec(substr($hexColor, 0, 2));
    $g = hexdec(substr($hexColor, 2, 2));
    $b = hexdec(substr($hexColor, 4, 2));

    // Calcular luminancia (fórmula estándar de percepción)
    $luminancia = ($r * 0.299 + $g * 0.587 + $b * 0.114) / 255;

    // Si es oscuro (luminancia < 0.5), retornar blanco, si es claro retornar negro
    return ($luminancia < 0.5) ? 'FFFFFF' : '000000';
}

//=====================
//  RECIBIR DATOS DEL JSON
//=====================

$jsonNomina = null;
$idDeptoSeleccionado = null;
$nombreDeptoSeleccionado = 'NÓMINA';
$seguroSocialSeleccionado = true;

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['jsonNomina'])) {
    $jsonNomina = json_decode($_POST['jsonNomina'], true);

    // Capturar parámetros dinámicos de filtrado
    $idDeptoSeleccionado = $_POST['id_departamento'] ?? null;
    $nombreDeptoSeleccionado = $_POST['nombre_departamento'] ?? 'NÓMINA';

    // Convertir seguroSocial a booleano (AJAX lo envía como string "true"/"false")
    $seguroSocialSeleccionado = filter_var($_POST['seguroSocial'] ?? true, FILTER_VALIDATE_BOOLEAN);
}

//=====================
//  EXTRAER COLOR DEL DEPARTAMENTO
//=====================

$colorReporte = 'F5EB1B'; // Color por defecto (amarillo)
$colorFuenteEncabezado = '000000'; // Negro por defecto

if ($jsonNomina && isset($jsonNomina['departamentos'])) {
    foreach ($jsonNomina['departamentos'] as $departamento) {
        if ($departamento['id_departamento'] == $idDeptoSeleccionado) {
            if (!empty($departamento['color_reporte'])) {
                // Quitar el '#' si existe
                $colorReporte = ltrim($departamento['color_reporte'], '#');
                $colorFuenteEncabezado = obtenerColorContraste($colorReporte);
            }
            break;
        }
    }
}

//=====================
//  EXTRAER PRECIO DE CAJAS (EMPAQUE)
//=====================

$precioCajasUtilidad = [];
if ($jsonNomina && isset($jsonNomina['precio_cajas'])) {
    foreach ($jsonNomina['precio_cajas'] as $caja) {
        if (($caja['utilidad'] ?? false) === true) {
            $precioCajasUtilidad[] = $caja;
        }
    }
}

// Días de la semana para el empaque (Viernes a Jueves)
$diasEmpaqueConfig = [
    ['abrv' => 'V', 'nombre' => 'Viernes'],
    ['abrv' => 'S', 'nombre' => 'Sábado'],
    ['abrv' => 'D', 'nombre' => 'Domingo'],
    ['abrv' => 'L', 'nombre' => 'Lunes'],
    ['abrv' => 'M', 'nombre' => 'Martes'],
    ['abrv' => 'MI', 'nombre' => 'Miércoles'],
    ['abrv' => 'J', 'nombre' => 'Jueves']
];


//=====================
//  CONFIGURACIÓN INICIAL
//=====================

$spreadsheet = new Spreadsheet();
$sheet = $spreadsheet->getActiveSheet();

// Aplicar fuente Arial como predeterminada para toda la hoja
$spreadsheet->getDefaultStyle()->getFont()->setName('Arial');

// Establecer el nombre de la pestaña (Pestaña dinámica según depto y seguro)
$tipoSuffix = $seguroSocialSeleccionado ? 'CSS' : 'SSS';
$sheet->setTitle(substr($nombreDeptoSeleccionado, 0, 25) . " $tipoSuffix");


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

$titulo1 = strtoupper($nombreDeptoSeleccionado);
$titulo2 = 'CITRICOS SAAO S.A DE C.V';
$titulo3 = 'NOMINA DEL ' . strtoupper($fecha_inicio) . ' AL ' . strtoupper($fecha_cierre);
$titulo4 = 'SEMANA ' . (isset($jsonNomina['numero_semana']) ? str_pad($jsonNomina['numero_semana'], 2, '0', STR_PAD_LEFT) : '00') . '-' . $ano;


//=====================
//  CARGAR EMPLEADOS Y ANALIZAR PRODUCCIÓN
//=====================

$empleados40Libras = [];
if ($jsonNomina && isset($jsonNomina['departamentos'])) {
    foreach ($jsonNomina['departamentos'] as $departamento) {
        if (isset($departamento['empleados'])) {
            foreach ($departamento['empleados'] as $empleado) {
                $idDepartamentoRow = $empleado['id_departamento'] ?? null;
                $mostrar = $empleado['mostrar'] ?? false;
                $seguroSocialRow = $empleado['seguroSocial'] ?? false;
                if ($idDepartamentoRow == $idDeptoSeleccionado && $mostrar && ($seguroSocialRow == $seguroSocialSeleccionado)) {
                    $empleados40Libras[] = $empleado;
                }
            }
        }
    }
}

// Ordenar empleados por nombre
usort($empleados40Libras, function ($a, $b) {
    return strcmp($a['nombre'] ?? '', $b['nombre'] ?? '');
});

// Identificar días con producción real
$diasConProduccion = [];
foreach ($empleados40Libras as $empleado) {
    if (!empty($empleado['historial_empaque']) && is_array($empleado['historial_empaque'])) {
        foreach ($empleado['historial_empaque'] as $historial) {
            if (($historial['cantidad'] ?? 0) > 0) {
                $diasConProduccion[$historial['dia']] = true;
            }
        }
    }
}

// Filtrar días a mostrar
$diasAMostrar = [];
foreach ($diasEmpaqueConfig as $diaConfig) {
    if (isset($diasConProduccion[$diaConfig['nombre']])) {
        $diasAMostrar[] = $diaConfig;
    }
}

//=====================
//  ENCABEZADOS DE LA TABLA
//=====================

// Definir las columnas fijas iniciales
$columnasIniciales = ['N°', 'CD', 'NOMBRE'];

// Definir las columnas fijas finales
$columnasFinales = [
    'SUELDO NETO',
    'EXTRAS',
    'TOTAL PERCEPCIONES',
    'ISR',
    'IMSS',
    'INFONAVIT',
    'AJUSTES AL SUB',
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

// Mapeo dinámico de columnas
$mapeoColumnas = [];
$colIndice = 1;

// 1. Columnas Iniciales (N°, CD, NOMBRE)
foreach ($columnasIniciales as $colName) {
    $letra = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colIndice);
    $mapeoColumnas[$colName] = $letra;

    // Combinar fila 7 y 8 para estas columnas
    $sheet->mergeCells($letra . '7:' . $letra . '8');
    $sheet->setCellValue($letra . '7', $colName);
    $colIndice++;
}

// 2. Columnas de Empaque (Días y Precios)
$inicioEmpaque = $colIndice;
foreach ($diasAMostrar as $diaInfo) {
    $dia = $diaInfo['abrv'];
    $colInicioDia = $colIndice;
    foreach ($precioCajasUtilidad as $caja) {
        $letra = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colIndice);
        
        // Fila 8: Precio de la caja
        $sheet->setCellValue($letra . '8', (int)$caja['precio']); 
        
        // Estilo específico para sub-encabezados de caja
        if (!empty($caja['color']) && $caja['color'] !== '#000000') {
            $fondoCaja = ltrim($caja['color'], '#');
            $fuenteCaja = obtenerColorContraste($fondoCaja);
            $sheet->getStyle($letra . '8')->getFill()->setFillType('solid')->getStartColor()->setRGB($fondoCaja);
            $sheet->getStyle($letra . '8')->getFont()->setColor(new Color($fuenteCaja));
        }

        $colIndice++;
    }
    $colFinDia = $colIndice - 1;
    
    // Fila 7: Nombre del día (Combinado sobre sus cajas)
    $letraInicioDia = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colInicioDia);
    $letraFinDia = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colFinDia);
    $sheet->mergeCells($letraInicioDia . '7:' . $letraFinDia . '7');
    $sheet->setCellValue($letraInicioDia . '7', $dia);
}
$finEmpaque = $colIndice - 1;

// 3. Columnas de Resumen de Cajas (TOTAL DE CAJAS y PRECIO UNITARIO)
$inicioResumen = $colIndice;
foreach ($precioCajasUtilidad as $caja) {
    // Columna: TOTAL DE CAJAS
    $letraTotal = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colIndice);
    $sheet->setCellValue($letraTotal . '7', 'TOTAL DE CAJAS');
    $sheet->setCellValue($letraTotal . '8', (int)$caja['precio']); // Shorthand/Precio
    
    // Aplicar color si existe
    if (!empty($caja['color']) && $caja['color'] !== '#000000') {
        $fondo = ltrim($caja['color'], '#');
        $fuente = obtenerColorContraste($fondo);
        $sheet->getStyle($letraTotal . '7:' . $letraTotal . '8')->getFill()->setFillType('solid')->getStartColor()->setRGB($fondo);
        $sheet->getStyle($letraTotal . '7:' . $letraTotal . '8')->getFont()->setColor(new Color($fuente));
    }
    $colIndice++;

    // Columna: PRECIO UNITARIO
    $letraPrecio = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colIndice);
    $sheet->mergeCells($letraPrecio . '7:' . $letraPrecio . '8');
    $sheet->setCellValue($letraPrecio . '7', 'PRECIO UNITARIO');
    
    // Estilo amarillo para Precio Unitario (como en la imagen)
    $sheet->getStyle($letraPrecio . '7:' . $letraPrecio . '8')->getFill()->setFillType('solid')->getStartColor()->setRGB('FFFF00');
    $sheet->getStyle($letraPrecio . '7:' . $letraPrecio . '8')->getFont()->setColor(new Color('000000'));
    
    $colIndice++;
}
$finResumen = $colIndice - 1;

// 4. Columnas Finales
foreach ($columnasFinales as $colName) {
    $letra = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colIndice);
    $mapeoColumnas[$colName] = $letra;

    // Combinar fila 7 y 8 para estas columnas
    $sheet->mergeCells($letra . '7:' . $letra . '8');
    $sheet->setCellValue($letra . '7', $colName);
    $colIndice++;
}

$ultimaColumnaLetra = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colIndice - 1);

//=====================
//  TÍTULOS (REUBICADO PARA USAR ÚLTIMA COLUMNA)
//=====================

// Agregar los títulos en las primeras filas
$sheet->setCellValue('A1', $titulo1);
$sheet->setCellValue('A2', $titulo2);
$sheet->setCellValue('A3', $titulo3);
$sheet->setCellValue('A4', $titulo4);

// Mergear las celdas para que los títulos ocupen toda la tabla
$sheet->mergeCells('A1:' . $ultimaColumnaLetra . '1');
$sheet->mergeCells('A2:' . $ultimaColumnaLetra . '2');
$sheet->mergeCells('A3:' . $ultimaColumnaLetra . '3');
$sheet->mergeCells('A4:' . $ultimaColumnaLetra . '4');

// Formatear título 1 - RANCHO EL PILAR (Purpura, Negrita, Tamaño 24)
$sheet->getStyle('A1')->getFont()->setBold(true);
$sheet->getStyle('A1')->getFont()->setSize(24);
$sheet->getStyle('A1')->getFont()->setColor(new Color($colorReporte));

// Formatear título 2 - PERSONAL DE BASE (Negrita, Tamaño 11)
$sheet->getStyle('A2')->getFont()->setBold(true);
$sheet->getStyle('A2')->getFont()->setSize(20);
$sheet->getStyle('A2')->getFont()->setColor(new Color($colorReporte));

// Formatear título 3 - NOMINA (Negrita, Tamaño 10)
$sheet->getStyle('A3')->getFont()->setBold(true);
$sheet->getStyle('A3')->getFont()->setSize(14);

// Formatear título 4 - SEMANA (Negrita, Tamaño 10)
$sheet->getStyle('A4')->getFont()->setBold(true);
$sheet->getStyle('A4')->getFont()->setSize(14);

// Centrar todos los títulos (A1-A4 en su rango combinado)
$sheet->getStyle('A1:' . $ultimaColumnaLetra . '4')->getAlignment()->setHorizontal('center');

// Insertar logo a la derecha de los títulos
$logoPath = '../../../public/img/logo.jpg';
if (file_exists($logoPath)) {
    $logo = new Drawing();
    $logo->setName('Logo');
    $logo->setDescription('Logo de Rancho El Relicario');
    $logo->setPath($logoPath);
    $logo->setHeight(190); // Altura en píxeles
    $logo->setCoordinates('B1'); 
    $logo->setOffsetX(10);
    $logo->setWorksheet($sheet);
}

// Formatear los encabezados (Fila 7 y 8)
$rangoEncabezados = 'A7:' . $ultimaColumnaLetra . '8';
$sheet->getStyle($rangoEncabezados)->getFont()->setBold(true);
$sheet->getStyle($rangoEncabezados)->getFont()->setSize(14);
$sheet->getStyle($rangoEncabezados)->getAlignment()->setHorizontal('center');
$sheet->getStyle($rangoEncabezados)->getAlignment()->setVertical('center');
$sheet->getStyle($rangoEncabezados)->getAlignment()->setWrapText(true);

// Aplicar fondo dinámico a los encabezados principales (donde no hay color de caja específico)
$sheet->getStyle($rangoEncabezados)->getFill()->setFillType('solid');
$sheet->getStyle($rangoEncabezados)->getFill()->getStartColor()->setRGB($colorReporte);
$sheet->getStyle($rangoEncabezados)->getFont()->setColor(new Color($colorFuenteEncabezado));

// Ajustar anchos y tamaños de letra dinámicamente
foreach ($columnasIniciales as $colName) {
    $letra = $mapeoColumnas[$colName];
    $ancho = ($colName === 'NOMBRE') ? 65 : 12;
    $sheet->getColumnDimension($letra)->setWidth($ancho);
}

// Ancho para columnas de empaque
for ($i = $inicioEmpaque; $i <= $finEmpaque; $i++) {
    $letra = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($i);
    $sheet->getColumnDimension($letra)->setWidth(8); // Columnas angostas para cantidades
}

// Ancho para columnas de resumen
for ($i = $inicioResumen; $i <= $finResumen; $i++) {
    $letra = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($i);
    $sheet->getColumnDimension($letra)->setWidth(15); 
}

// Anchos para columnas finales (aproximados a los anteriores)
foreach ($columnasFinales as $colName) {
    $letra = $mapeoColumnas[$colName];
    $ancho = ($colName === 'FIRMA RECIBIDO') ? 28 : 20;
    $sheet->getColumnDimension($letra)->setWidth($ancho);
}


//=====================
//  VERIFICAR COLUMNAS CON DATOS (CONFIGURACIÓN AUTO)
//=====================

// Determinar si las columnas de deducciones tienen datos
$isrTieneDatos = false;
$imssTieneDatos = false;
$infonavitTieneDatos = false;
$ajustesAlSubTieneDatos = false;

// Determinar si las columnas de descuentos adicionales tienen datos
$permisoTieneDatos = false;
$uniformeTieneDatos = false;

// Determinar si la columna CHECADOR y F.A/GAFET/COFIA tienen datos
$checadorTieneDatos = false;
$faxGafetCofiaTieneDatos = false;

foreach ($empleados40Libras as $empleado) {
    if (($empleado['sueldo_neto'] ?? 0) != 0) {
        // Podríamos usar una bandera similar si fuera necesario, 
        // pero SUELDO NETO suele estar siempre
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

    // Verificar conceptos en códigos específicos
    if (!empty($empleado['conceptos']) && is_array($empleado['conceptos'])) {
        foreach ($empleado['conceptos'] as $concepto) {
            $codigo = $concepto['codigo'] ?? '';
            $resultado = $concepto['resultado'] ?? 0;
            if ($resultado != 0) {
                if ($codigo === '45') $isrTieneDatos = true;
                if ($codigo === '52') $imssTieneDatos = true;
                if ($codigo === '16') $infonavitTieneDatos = true;
                if ($codigo === '107') $ajustesAlSubTieneDatos = true;
            }
        }
    }
}

// Pre-calcular las letras de las columnas de resumen para usarlas en fórmulas
$columnasResumenCajas = [];
$colTemp = $inicioResumen;
foreach ($precioCajasUtilidad as $caja) {
    $columnasResumenCajas[] = [
        'total' => \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colTemp),
        'precio' => \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colTemp + 1)
    ];
    $colTemp += 2;
}

// Agregar empleados ordenados a la hoja
$numeroFila = 9;
$numeroEmpleado = 1;

foreach ($empleados40Libras as $empleado) {

    //====================================
    //  AGREGAR INFORMACION DEL EMPLEADO
    //====================================

    // Agregar número y clave
    $sheet->setCellValue($mapeoColumnas['N°'] . $numeroFila, $numeroEmpleado);
    $sheet->setCellValue($mapeoColumnas['CD'] . $numeroFila, $empleado['clave'] ?? '');

    // Agregar nombre en la columna NOMBRE
    $sheet->setCellValue($mapeoColumnas['NOMBRE'] . $numeroFila, $empleado['nombre'] ?? '');

    //=============================
    //  AGREGAR PERCEPCIONES 
    //=============================

    //=============================
    //  AGREGAR PERCEPCIONES (DINÁMICO POR PRODUCCIÓN)
    //=============================

    // Generar fórmula de Sueldo Neto basada en el resumen de cajas
    $partesNeto = [];
    foreach ($columnasResumenCajas as $cols) {
        $partesNeto[] = '(' . $cols['total'] . $numeroFila . '*' . $cols['precio'] . $numeroFila . ')';
    }
    
    $formulaSueldoNeto = !empty($partesNeto) ? '=' . implode('+', $partesNeto) : 0;

    // Escribir la fórmula en la columna SUELDO NETO
    $letraNeto = $mapeoColumnas['SUELDO NETO'];
    $sheet->setCellValue($letraNeto . $numeroFila, $formulaSueldoNeto);
    $sheet->getStyle($letraNeto . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00');

    // Agregar sueldo extra total en la columna EXTRAS
    $sueldoExtraTotal = $empleado['sueldo_extra_total'] ?? 0;
    if (!empty($sueldoExtraTotal) && $sueldoExtraTotal != 0) {
        $sheet->setCellValue($mapeoColumnas['EXTRAS'] . $numeroFila, $sueldoExtraTotal);
        $sheet->getStyle($mapeoColumnas['EXTRAS'] . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00');
    }

    // Agregar fórmula de TOTAL PERCEPCIONES (suma dinámica de columnas existentes)
    $sheet->setCellValue($mapeoColumnas['TOTAL PERCEPCIONES'] . $numeroFila, '=SUM(' . $mapeoColumnas['SUELDO NETO'] . $numeroFila . ':' . $mapeoColumnas['EXTRAS'] . $numeroFila . ')');
    $sheet->getStyle($mapeoColumnas['TOTAL PERCEPCIONES'] . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00');

    //=============================
    //  AGREGAR DEDUCCIONES 
    //=============================

    // Mapeo de códigos de conceptos a nombres de columnas finales
    $mapeoConceptosFinales = [
        '45' => 'ISR',
        '52' => 'IMSS',
        '16' => 'INFONAVIT',
        '107' => 'AJUSTES AL SUB',
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
            if (isset($mapeoConceptosFinales[$codigo]) && !empty($resultado) && $resultado != 0) {
                $colNombre = $mapeoConceptosFinales[$codigo];
                $letra = $mapeoColumnas[$colNombre];
                $sheet->setCellValue($letra . $numeroFila, $resultado);
                // Aplicar formato de moneda con signo negativo y color rojo
                $sheet->getStyle($letra . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
                $sheet->getStyle($letra . $numeroFila)->getFont()->setColor(new Color('FF0000'));
            }
        }
    }

    // Agregar permiso en la columna PERMISOS (solo si hay datos)
    if ($permisoTieneDatos) {
        $permiso = $empleado['permiso'] ?? 0;
        if (!empty($permiso) && $permiso != 0) {
            $letra = $mapeoColumnas['PERMISOS'];
            $sheet->setCellValue($letra . $numeroFila, $permiso);
            $sheet->getStyle($letra . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
            $sheet->getStyle($letra . $numeroFila)->getFont()->setColor(new Color('FF0000'));
        }
    }

    // Agregar uniforme en la columna UNIFORMES (solo si hay datos)
    if ($uniformeTieneDatos) {
        $uniforme = $empleado['uniforme'] ?? 0;
        if (!empty($uniforme) && $uniforme != 0) {
            $letra = $mapeoColumnas['UNIFORMES'];
            $sheet->setCellValue($letra . $numeroFila, $uniforme);
            $sheet->getStyle($letra . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
            $sheet->getStyle($letra . $numeroFila)->getFont()->setColor(new Color('FF0000'));
        }
    }

    // Agregar checador en la columna BIOMETRICO (solo si hay datos)
    if ($checadorTieneDatos) {
        $checador = $empleado['checador'] ?? 0;
        if (!empty($checador) && $checador != 0) {
            $letra = $mapeoColumnas['BIOMETRICO'];
            $sheet->setCellValue($letra . $numeroFila, $checador);
            $sheet->getStyle($letra . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
            $sheet->getStyle($letra . $numeroFila)->getFont()->setColor(new Color('FF0000'));
        }
    }

    // Agregar F.A/GAFET/COFIA en la columna F.A/GAFET/COFIA (solo si hay datos)
    if ($faxGafetCofiaTieneDatos) {
        $faxGafetCofia = $empleado['fa_gafet_cofia'] ?? 0;
        if (!empty($faxGafetCofia) && $faxGafetCofia != 0) {
            $letra = $mapeoColumnas['F.A/GAFET/COFIA'];
            $sheet->setCellValue($letra . $numeroFila, $faxGafetCofia);
            $sheet->getStyle($letra . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
            $sheet->getStyle($letra . $numeroFila)->getFont()->setColor(new Color('FF0000'));
        }
    }

    // Agregar TOTAL DE DEDUCCIONES (suma de todas las deducciones)
    $sheet->setCellValue($mapeoColumnas['TOTAL DE DEDUCCIONES'] . $numeroFila, '=SUM(' . $mapeoColumnas['ISR'] . $numeroFila . ':' . $mapeoColumnas['F.A/GAFET/COFIA'] . $numeroFila . ')');
    $sheet->getStyle($mapeoColumnas['TOTAL DE DEDUCCIONES'] . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
    $sheet->getStyle($mapeoColumnas['TOTAL DE DEDUCCIONES'] . $numeroFila)->getFont()->setColor(new Color('FF0000'));

    // Agregar NETO A RECIBIR (SUM Percepciones - SUM Deducciones)
    $sheet->setCellValue($mapeoColumnas['NETO A RECIBIR'] . $numeroFila, '=' . $mapeoColumnas['TOTAL PERCEPCIONES'] . $numeroFila . '-' . $mapeoColumnas['TOTAL DE DEDUCCIONES'] . $numeroFila);
    $sheet->getStyle($mapeoColumnas['NETO A RECIBIR'] . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00');

    // Agregar DISPERSION DE TARJETA 
    $tarjeta = $empleado['tarjeta'] ?? 0;
    if (!empty($tarjeta) && $tarjeta != 0) {
        $letra = $mapeoColumnas['DISPERSION DE TARJETA'];
        $sheet->setCellValue($letra . $numeroFila, $tarjeta);
        $sheet->getStyle($letra . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
        $sheet->getStyle($letra . $numeroFila)->getFont()->setColor(new Color('FF0000'));
    }

    // Agregar IMPORTE EN EFECTIVO (NETO A RECIBIR - DISPERSION DE TARJETA)
    $sheet->setCellValue($mapeoColumnas['IMPORTE EN EFECTIVO'] . $numeroFila, '=' . $mapeoColumnas['NETO A RECIBIR'] . $numeroFila . '-' . $mapeoColumnas['DISPERSION DE TARJETA'] . $numeroFila);
    $sheet->getStyle($mapeoColumnas['IMPORTE EN EFECTIVO'] . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00');

    // Agregar PRÉSTAMO 
    $prestamo = $empleado['prestamo'] ?? 0;
    if (!empty($prestamo) && $prestamo != 0) {
        $letra = $mapeoColumnas['PRÉSTAMO'];
        $sheet->setCellValue($letra . $numeroFila, $prestamo);
        $sheet->getStyle($letra . $numeroFila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
        $sheet->getStyle($letra . $numeroFila)->getFont()->setColor(new Color('FF0000'));
    }

    // Agregar TOTAL A RECIBIR (IMPORTE EN EFECTIVO - PRÉSTAMO)
    $sheet->setCellValue($mapeoColumnas['TOTAL A RECIBIR'] . $numeroFila, '=' . $mapeoColumnas['IMPORTE EN EFECTIVO'] . $numeroFila . '-' . $mapeoColumnas['PRÉSTAMO'] . $numeroFila);
    $sheet->getStyle($mapeoColumnas['TOTAL A RECIBIR'] . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00');

    // Agregar REDONDEADO (fórmula que calcula diferencia al redondear)
    $sheet->setCellValue($mapeoColumnas['REDONDEADO'] . $numeroFila, '=ROUND(' . $mapeoColumnas['TOTAL A RECIBIR'] . $numeroFila . ',0)-' . $mapeoColumnas['TOTAL A RECIBIR'] . $numeroFila);
    $sheet->getStyle($mapeoColumnas['REDONDEADO'] . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00;[RED]-$#,##0.00');

    // Agregar TOTAL EFECTIVO REDONDEADO (TOTAL A RECIBIR +/- REDONDEADO)
    $sheet->setCellValue($mapeoColumnas['TOTAL EFECTIVO REDONDEADO'] . $numeroFila, '=' . $mapeoColumnas['TOTAL A RECIBIR'] . $numeroFila . '+' . $mapeoColumnas['REDONDEADO'] . $numeroFila);
    $sheet->getStyle($mapeoColumnas['TOTAL EFECTIVO REDONDEADO'] . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00');

    // Centrar datos en N° y Clave
    $sheet->getStyle($mapeoColumnas['N°'] . $numeroFila . ':' . $mapeoColumnas['CD'] . $numeroFila)->getAlignment()->setHorizontal('center');
    $sheet->getStyle($mapeoColumnas['N°'] . $numeroFila . ':' . $mapeoColumnas['CD'] . $numeroFila)->getAlignment()->setVertical('center');

    // Alinear nombre
    $sheet->getStyle($mapeoColumnas['NOMBRE'] . $numeroFila)->getAlignment()->setHorizontal('left');
    $sheet->getStyle($mapeoColumnas['NOMBRE'] . $numeroFila)->getAlignment()->setVertical('center');

    // Centrar el resto
    $sheet->getStyle($mapeoColumnas['SUELDO NETO'] . $numeroFila . ':' . $mapeoColumnas['TOTAL EFECTIVO REDONDEADO'] . $numeroFila)->getAlignment()->setHorizontal('center');
    $sheet->getStyle($mapeoColumnas['SUELDO NETO'] . $numeroFila . ':' . $mapeoColumnas['TOTAL EFECTIVO REDONDEADO'] . $numeroFila)->getAlignment()->setVertical('center');

    //====================================
    //  AGREGAR DATOS DE EMPLEADO (EMPAQUE)
    //====================================

    $colEmpaqueActual = $inicioEmpaque;
    foreach ($diasAMostrar as $diaInfo) {
        $diaCompleto = $diaInfo['nombre'];

        foreach ($precioCajasUtilidad as $caja) {
            $letra = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colEmpaqueActual);
            $tipoCaja = $caja['valor'];

            // Buscar cantidad en el historial del empleado
            $cantidad = 0;
            if (!empty($empleado['historial_empaque']) && is_array($empleado['historial_empaque'])) {
                foreach ($empleado['historial_empaque'] as $historial) {
                    if (($historial['dia'] ?? '') === $diaCompleto && ($historial['tipo'] ?? '') === $tipoCaja) {
                        $cantidad = $historial['cantidad'] ?? 0;
                        break;
                    }
                }
            }

            if ($cantidad > 0) {
                $sheet->setCellValue($letra . $numeroFila, $cantidad);
                $sheet->getStyle($letra . $numeroFila)->getAlignment()->setHorizontal('center');
                $sheet->getStyle($letra . $numeroFila)->getAlignment()->setVertical('center');
            }

            // Aplicar color de fondo de la caja (siempre, incluso si es 0)
            if (!empty($caja['color']) && $caja['color'] !== '#000000') {
                $fondo = ltrim($caja['color'], '#');
                $sheet->getStyle($letra . $numeroFila)->getFill()->setFillType('solid')->getStartColor()->setRGB($fondo);
            }
            $colEmpaqueActual++;
        }
    }

    //====================================
    //  AGREGAR DATOS DE EMPLEADO (RESUMEN CAJAS)
    //====================================
    $colResumenActual = $inicioResumen;
    foreach ($precioCajasUtilidad as $caja) {
        $letraTotal = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colResumenActual);
        $letraPrecio = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colResumenActual + 1);
        $tipoCaja = $caja['valor'];

        // Calcular total semanal para este tipo de caja
        $totalCajas = 0;
        if (!empty($empleado['historial_empaque']) && is_array($empleado['historial_empaque'])) {
            foreach ($empleado['historial_empaque'] as $historial) {
                if (($historial['tipo'] ?? '') === $tipoCaja) {
                    $totalCajas += $historial['cantidad'] ?? 0;
                }
            }
        }

        // Escribir Total de Cajas
        $sheet->setCellValue($letraTotal . $numeroFila, $totalCajas);
        // Color de fondo para el total (igual al encabezado)
        if (!empty($caja['color']) && $caja['color'] !== '#000000') {
            $fondo = ltrim($caja['color'], '#');
            $sheet->getStyle($letraTotal . $numeroFila)->getFill()->setFillType('solid')->getStartColor()->setRGB($fondo);
        }

        // Escribir Precio Unitario
        $sheet->setCellValue($letraPrecio . $numeroFila, $caja['precio']);
        $sheet->getStyle($letraPrecio . $numeroFila)->getNumberFormat()->setFormatCode('$#,##0.00');

        $colResumenActual += 2;
    }

    $numeroFila++;
    $numeroEmpleado++;
}

//=====================
//  APLICAR FORMATOS A TODAS LAS CELDAS DE DATOS (INCLUSO VACIAS)
//=====================

// Iterar sobre todas las filas de datos (9 hasta numeroFila-1)
for ($fila = 9; $fila < $numeroFila; $fila++) {
    // Columnas con formato deducciones
    $columnasDeducciones = ['ISR', 'IMSS', 'INFONAVIT', 'AJUSTES AL SUB', 'PERMISOS', 'UNIFORMES', 'BIOMETRICO', 'F.A/GAFET/COFIA', 'TOTAL DE DEDUCCIONES', 'DISPERSION DE TARJETA', 'PRÉSTAMO'];
    foreach ($columnasDeducciones as $colName) {
        if (isset($mapeoColumnas[$colName])) {
            $letra = $mapeoColumnas[$colName];
            $sheet->getStyle($letra . $fila)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
            $sheet->getStyle($letra . $fila)->getFont()->setColor(new Color('FF0000'));
        }
    }

    // Columna REDONDEADO
    $letraRedondeado = $mapeoColumnas['REDONDEADO'];
    $sheet->getStyle($letraRedondeado . $fila)->getNumberFormat()->setFormatCode('$#,##0.00;[RED]-$#,##0.00');

    // Columnas de moneda normal
    $columnasMoneda = ['SUELDO NETO', 'EXTRAS', 'TOTAL PERCEPCIONES', 'NETO A RECIBIR', 'IMPORTE EN EFECTIVO', 'TOTAL A RECIBIR', 'TOTAL EFECTIVO REDONDEADO'];
    foreach ($columnasMoneda as $colName) {
        $letra = $mapeoColumnas[$colName];
        $sheet->getStyle($letra . $fila)->getNumberFormat()->setFormatCode('$#,##0.00');
    }

    // Bordes para las columnas de empaque
    for ($i = $inicioEmpaque; $i <= $finEmpaque; $i++) {
        $letra = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($i);
        $sheet->getStyle($letra . $fila)->getAlignment()->setHorizontal('center');
        $sheet->getStyle($letra . $fila)->getAlignment()->setVertical('center');
    }

    // Bordes y alineación para resumen
    for ($i = $inicioResumen; $i <= $finResumen; $i++) {
        $letra = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($i);
        $sheet->getStyle($letra . $fila)->getAlignment()->setHorizontal('center');
        $sheet->getStyle($letra . $fila)->getAlignment()->setVertical('center');
    }

    // Alinear verticalmente el resto de las columnas y establecer tamaño de fuente 18 después de NOMBRE
    $sheet->getStyle('A' . $fila . ':' . $ultimaColumnaLetra . $fila)->getAlignment()->setVertical('center');
    
    // Obtener la letra de la columna D (después de NOMBRE que es C)
    $letraDespuesNombre = 'D';
    $sheet->getStyle($letraDespuesNombre . $fila . ':' . $ultimaColumnaLetra . $fila)->getFont()->setSize(18);
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

// Agregar fórmulas SUM para cada columna de datos
$columnasData = array_merge($columnasFinales);
// Quitar FIRMA RECIBIDO de las sumas
$columnasData = array_diff($columnasData, ['FIRMA RECIBIDO']);

foreach ($columnasData as $colName) {
    $letra = $mapeoColumnas[$colName];
    $rangoSuma = $letra . '9:' . $letra . ($filaTotal - 1);
    $sheet->setCellValue($letra . $filaTotal, '=IF(SUM(' . $rangoSuma . ')=0,"",SUM(' . $rangoSuma . '))');
    $sheet->getStyle($letra . $filaTotal)->getFont()->setBold(true);
    $sheet->getStyle($letra . $filaTotal)->getFont()->setSize(18);

    // Aplicar formato de moneda según la columna
    if (in_array($colName, ['ISR', 'IMSS', 'INFONAVIT', 'AJUSTES AL SUB', 'PERMISOS', 'UNIFORMES', 'BIOMETRICO', 'F.A/GAFET/COFIA', 'TOTAL DE DEDUCCIONES', 'DISPERSION DE TARJETA', 'PRÉSTAMO'])) {
        // Formato rojo con signo negativo
        $sheet->getStyle($letra . $filaTotal)->getNumberFormat()->setFormatCode('"-"$#,##0.00');
        $sheet->getStyle($letra . $filaTotal)->getFont()->setColor(new Color('FF0000'));
    } elseif ($colName === 'REDONDEADO') {
        // Formato condicional para REDONDEADO
        $sheet->getStyle($letra . $filaTotal)->getNumberFormat()->setFormatCode('$#,##0.00;[RED]-$#,##0.00');
    } else {
        // Formato moneda normal
        $sheet->getStyle($letra . $filaTotal)->getNumberFormat()->setFormatCode('$#,##0.00');
    }

    // Centrar alineación
    $sheet->getStyle($letra . $filaTotal)->getAlignment()->setHorizontal('center');
    $sheet->getStyle($letra . $filaTotal)->getAlignment()->setVertical('center');
}

// Sumas para empaque
for ($i = $inicioEmpaque; $i <= $finEmpaque; $i++) {
    $letra = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($i);
    $rangoSuma = $letra . '9:' . $letra . ($filaTotal - 1);
    $sheet->setCellValue($letra . $filaTotal, '=IF(SUM(' . $rangoSuma . ')=0,"",SUM(' . $rangoSuma . '))');
    $sheet->getStyle($letra . $filaTotal)->getFont()->setBold(true);
    $sheet->getStyle($letra . $filaTotal)->getFont()->setSize(18);
    $sheet->getStyle($letra . $filaTotal)->getAlignment()->setHorizontal('center');
}

// Sumas para resumen (Solo TOTAL DE CAJAS, saltar PRECIO UNITARIO)
for ($i = $inicioResumen; $i <= $finResumen; $i += 2) {
    $letra = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($i);
    $rangoSuma = $letra . '9:' . $letra . ($filaTotal - 1);
    $sheet->setCellValue($letra . $filaTotal, '=IF(SUM(' . $rangoSuma . ')=0,"",SUM(' . $rangoSuma . '))');
    $sheet->getStyle($letra . $filaTotal)->getFont()->setBold(true);
    $sheet->getStyle($letra . $filaTotal)->getFont()->setSize(18);
    $sheet->getStyle($letra . $filaTotal)->getAlignment()->setHorizontal('center');
}

// Aplicar altura y color de fondo a la fila de totales
$sheet->getRowDimension($filaTotal)->setRowHeight(25);
$sheet->getStyle('A' . $filaTotal . ':' . $ultimaColumnaLetra . $filaTotal)->getFill()->setFillType('solid');
$sheet->getStyle('A' . $filaTotal . ':' . $ultimaColumnaLetra . $filaTotal)->getFill()->getStartColor()->setRGB('D3D3D3'); // Gris claro

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

$sheet->getStyle('A7:' . $ultimaColumnaLetra . $filaTotal)->applyFromArray($estiloBordesTabla);

//=====================
//  OCULTAR COLUMNAS SIN DATOS
//=====================

//=====================
//  OCULTAR COLUMNAS SIN DATOS
//=====================

// Ocultar ISR si no tiene datos
if (!$isrTieneDatos) {
    $sheet->getColumnDimension($mapeoColumnas['ISR'])->setVisible(false);
}

// Ocultar IMSS si no tiene datos
if (!$imssTieneDatos) {
    $sheet->getColumnDimension($mapeoColumnas['IMSS'])->setVisible(false);
}

// Ocultar INFONAVIT si no tiene datos
if (!$infonavitTieneDatos) {
    $sheet->getColumnDimension($mapeoColumnas['INFONAVIT'])->setVisible(false);
}

// Ocultar columna AJUSTES AL SUB si no tiene datos
if (!$ajustesAlSubTieneDatos) {
    $sheet->getColumnDimension($mapeoColumnas['AJUSTES AL SUB'])->setVisible(false);
}

// Ocultar columna PERMISOS si no tiene datos
if (!$permisoTieneDatos) {
    $sheet->getColumnDimension($mapeoColumnas['PERMISOS'])->setVisible(false);
}

// Ocultar columna UNIFORMES si no tiene datos
if (!$uniformeTieneDatos) {
    $sheet->getColumnDimension($mapeoColumnas['UNIFORMES'])->setVisible(false);
}

// Ocultar columna BIOMETRICO si no tiene datos
if (!$checadorTieneDatos) {
    $sheet->getColumnDimension($mapeoColumnas['BIOMETRICO'])->setVisible(false);
}

// Ocultar columna F.A/GAFET/COFIA si no tiene datos
if (!$faxGafetCofiaTieneDatos) {
    $sheet->getColumnDimension($mapeoColumnas['F.A/GAFET/COFIA'])->setVisible(false);
}

// Ocultar siempre Total Percepciones y Total Deducciones
$sheet->getColumnDimension($mapeoColumnas['TOTAL PERCEPCIONES'])->setVisible(false);
$sheet->getColumnDimension($mapeoColumnas['TOTAL DE DEDUCCIONES'])->setVisible(false);

//=====================
//  CONFIGURAR ALTURA DE FILAS Y TAMAÑO DE LETRA
//=====================

// Configurar tamaño de letra para cada columna (configurable)
$tamanioLetraFilas = [
    'A' => 14,  // N°
    'B' => 14,  // CD
    'C' => 16,  // NOMBRE
    'D' => 15,  // SUELDO NETO
    'E' => 15,  // EXTRAS
    'F' => 15,  // TOTAL PERCEPCIONES
    'G' => 15,  // ISR
    'H' => 15,  // IMSS
    'I' => 15,  // INFONAVIT
    'J' => 15,  // AJUSTES AL SUB
    'K' => 15,  // PERMISOS
    'L' => 15,  // UNIFORMES
    'M' => 15,  // CHECADOR
    'N' => 15,  // F.A/GAFET/COFIA
    'O' => 15,  // TOTAL DE DEDUCCIONES
    'P' => 15,  // NETO A RECIBIR
    'Q' => 15,  // DISPERSION DE TARJETA
    'R' => 15,  // IMPORTE EN EFECTIVO
    'S' => 15,  // PRÉSTAMO
    'T' => 15,  // TOTAL A RECIBIR
    'U' => 15,  // REDONDEADO
    'V' => 15   // TOTAL EFECTIVO REDONDEADO
];

// Altura de los títulos
$sheet->getRowDimension(1)->setRowHeight(38);
$sheet->getRowDimension(2)->setRowHeight(32);
$sheet->getRowDimension(3)->setRowHeight(32);
$sheet->getRowDimension(4)->setRowHeight(32);

// Altura de los encabezados (Fila 7 y 8)
$sheet->getRowDimension(7)->setRowHeight(35);
$sheet->getRowDimension(8)->setRowHeight(45);

// CONFIGURACIÓN PERSONALIZABLE
$alturaFilas = 48;      // Altura de filas de datos (puntos)

// Aplicar altura a las filas de datos
for ($fila = 9; $fila < $numeroFila; $fila++) {
    $sheet->getRowDimension($fila)->setRowHeight($alturaFilas);

    // Aplicar tamaño de letra por columna a cada fila de datos
    foreach ($mapeoColumnas as $colName => $letra) {
        if ($letra == 'A' || $letra == 'B') $sheet->getStyle($letra . $fila)->getFont()->setSize(15);
        elseif ($letra == 'C') $sheet->getStyle($letra . $fila)->getFont()->setSize(16);
        else $sheet->getStyle($letra . $fila)->getFont()->setSize(18);
    }
    
    // Todas las columnas de empaque y resumen (que no están en mapeoColumnas fijo) van con 18
    for ($i = 4; $i <= \PhpOffice\PhpSpreadsheet\Cell\Coordinate::columnIndexFromString($ultimaColumnaLetra); $i++) {
        $letra = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($i);
        $sheet->getStyle($letra . $fila)->getFont()->setSize(18);
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
$sheet->getPageSetup()->setPrintArea('A1:' . $ultimaColumnaLetra . $ultimaFila);

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
