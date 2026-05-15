<?php

require_once "../../../config/config.php";
require_once "../../../conexion/conexion.php";
require_once "../../../vendor/autoload.php";

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;

if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    http_response_code(401);
    echo "No has iniciado sesión.";
    exit();
}

$anio = isset($_GET['anio']) ? (int)$_GET['anio'] : 0;
$mes = isset($_GET['mes']) ? trim((string)$_GET['mes']) : '';
$semana = isset($_GET['semana']) ? trim((string)$_GET['semana']) : '';
$tipo = isset($_GET['tipo']) ? strtolower(trim((string)$_GET['tipo'])) : 'mixto';

if ($anio <= 0) {
    http_response_code(400);
    echo "Parámetro 'anio' inválido.";
    exit();
}

if (!in_array($tipo, ['mixto', 'poda', 'extras'], true)) {
    $tipo = 'mixto';
}

$meses_map = [
    'Ene' => 1, 'Feb' => 2, 'Mar' => 3, 'Abr' => 4, 'May' => 5, 'Jun' => 6,
    'Jul' => 7, 'Ago' => 8, 'Sep' => 9, 'Oct' => 10, 'Nov' => 11, 'Dic' => 12
];

function extraerMesDesdeJson($json_nomina)
{
    global $meses_map;
    if (!$json_nomina) return null;
    $data = json_decode($json_nomina, true);
    if (isset($data['fecha_cierre'])) {
        $partes = explode('/', $data['fecha_cierre']);
        if (count($partes) >= 2) {
            $mesStr = $partes[1];
            return isset($meses_map[$mesStr]) ? $meses_map[$mesStr] : null;
        }
    }
    return null;
}

function bindParams(mysqli_stmt $stmt, string $types, array $values)
{
    $refs = [];
    $refs[] = $types;
    foreach ($values as $key => $value) {
        $refs[] = &$values[$key];
    }
    call_user_func_array([$stmt, 'bind_param'], $refs);
}

function prepararHoja(
    Worksheet $sheet,
    string $tituloSemana,
    array $columnHeaders,
    bool $incluirColSemana
) {
    $colCount = count($columnHeaders) + ($incluirColSemana ? 1 : 0);
    $lastCol = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colCount);

    // Configuración de impresión centrada y profesional (Landscape)
    $sheet->getPageSetup()->setHorizontalCentered(true);
    $sheet->getPageSetup()->setOrientation(\PhpOffice\PhpSpreadsheet\Worksheet\PageSetup::ORIENTATION_LANDSCAPE);
    $sheet->getPageSetup()->setPaperSize(\PhpOffice\PhpSpreadsheet\Worksheet\PageSetup::PAPERSIZE_A4);

    // Ajustar para que quepa en el ancho de la hoja (evita que se corte el Total)
    $sheet->getPageSetup()->setFitToWidth(1);
    $sheet->getPageSetup()->setFitToHeight(0);

    // Márgenes estrechos para maximizar espacio
    $sheet->getPageMargins()->setTop(0.5);
    $sheet->getPageMargins()->setRight(0.5);
    $sheet->getPageMargins()->setLeft(0.5);
    $sheet->getPageMargins()->setBottom(0.5);

    // Encabezado corporativo
    $sheet->setCellValue('A1', 'CITRICOS SAAO');
    $sheet->setCellValue('A2', 'RANCHO PILAR - HISTORIAL DE PODAS');
    $sheet->setCellValue('A3', $tituloSemana);
    $sheet->setCellValue('A4', 'Reporte generado el: ' . date('d/m/Y H:i'));

    $sheet->mergeCells("A1:{$lastCol}1");
    $sheet->mergeCells("A2:{$lastCol}2");
    $sheet->mergeCells("A3:{$lastCol}3");
    $sheet->mergeCells("A4:{$lastCol}4");

    $sheet->getStyle("A1:A4")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
    $sheet->getStyle("A1:A4")->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);

    // Títulos corporativos más grandes para impresión
    $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(26)->getColor()->setARGB('FF004D17'); // Siempre verde institucional
    $sheet->getStyle('A2')->getFont()->setBold(true)->setSize(18)->getColor()->setARGB('FF333333');
    $sheet->getStyle('A3')->getFont()->setBold(true)->setSize(14)->getColor()->setARGB('FF555555');
    $sheet->getStyle('A4')->getFont()->setItalic(true)->setSize(11)->getColor()->setARGB('FF777777');

    // Altura de filas de encabezado (más altas)
    $sheet->getRowDimension(1)->setRowHeight(45);
    $sheet->getRowDimension(2)->setRowHeight(30);
    $sheet->getRowDimension(3)->setRowHeight(25);
    $sheet->getRowDimension(4)->setRowHeight(20);

    // Encabezados de tabla
    $headerRow = 6;
    $colIndex = 1;
    foreach ($columnHeaders as $h) {
        $colLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colIndex);
        $sheet->setCellValue("{$colLetter}{$headerRow}", mb_strtoupper($h, 'UTF-8'));
        $colIndex++;
    }
    if ($incluirColSemana) {
        $colLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($colIndex);
        $sheet->setCellValue("{$colLetter}{$headerRow}", 'SEMANA');
    }

    $headerRange = "A{$headerRow}:{$lastCol}{$headerRow}";
    $sheet->getStyle($headerRange)->getFont()->setBold(true)->setSize(14)->getColor()->setARGB('FFFFFFFF');
    $sheet->getStyle($headerRange)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
    $sheet->getStyle($headerRange)->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);

    // Solo cabecera de tabla con color dinámico
    $sheet->getStyle($headerRange)->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB($GLOBALS['color_area']);

    // Altura de la fila del encabezado de tabla
    $sheet->getRowDimension($headerRow)->setRowHeight(35);

    $sheet->freezePane('A7');

    // Ancho de columnas equilibrado
    $anchos = [
        1 => 42, // Podador / Empleado
        2 => 18, // Fecha
        3 => 22, // Árboles / Concepto
        4 => 22, // Pago / Monto
        5 => 22, // Total
        6 => 15  // Semana
    ];

    for ($i = 1; $i <= $colCount; $i++) {
        $letter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($i);
        if (isset($anchos[$i])) {
            $sheet->getColumnDimension($letter)->setWidth($anchos[$i]);
        } else {
            $sheet->getColumnDimension($letter)->setAutoSize(true);
        }
    }

    $sheet->setSelectedCell('A1');
}

try {
    // 1) Encontrar nóminas (ids) que entren en el filtro (año/semana + mes por JSON)
    $where = "n.anio = ?";
    $types = "i";
    $values = [$anio];

    if ($semana !== '') {
        $where .= " AND n.numero_semana = ?";
        $types .= "i";
        $values[] = (int)$semana;
    }

    $queryNominas = "
        SELECT DISTINCT n.id_nomina_pilar, n.numero_semana, n.anio, n.nomina_pilar
        FROM nomina_pilar n
        JOIN podas_pilar p ON p.id_nomina = n.id_nomina_pilar
        WHERE {$where}
        ORDER BY n.anio DESC, n.numero_semana ASC
    ";

    $stmtNom = $conexion->prepare($queryNominas);
    bindParams($stmtNom, $types, $values);
    $stmtNom->execute();
    $resNom = $stmtNom->get_result();

    $nominaIds = [];
    $semanasEncontradas = [];

    $mesFiltroInt = ($mes !== '') ? (int)$mes : 0;

    while ($row = $resNom->fetch_assoc()) {
        $mesNom = extraerMesDesdeJson($row['nomina_pilar']);
        if ($mesFiltroInt > 0 && (int)$mesNom !== $mesFiltroInt) {
            continue;
        }
        $nominaIds[] = (int)$row['id_nomina_pilar'];
        if ($row['numero_semana'] !== null) {
            $semanasEncontradas[(int)$row['numero_semana']] = true;
        }
    }

    if (count($nominaIds) === 0) {
        http_response_code(404);
        echo "No hay datos para exportar con esos filtros.";
        exit();
    }

    // Obtener el color del área de Pilar (ID 5)
    $color_area = 'FFB50600'; // Rojo por defecto en ARGB
    $query_color = "
        SELECT a.colores 
        FROM areas a
        INNER JOIN nombre_nominas n ON a.id_area = n.id_area
        WHERE n.id_nomina = 5
        LIMIT 1
    ";
    $res_color = $conexion->query($query_color);
    if ($res_color && $row_color = $res_color->fetch_assoc()) {
        $c = $row_color['colores'];
        if (!empty($c)) {
            if (strpos($c, '#') === 0) {
                $hex = substr($c, 1);
                if (strlen($hex) === 3) {
                    $hex = $hex[0].$hex[0].$hex[1].$hex[1].$hex[2].$hex[2];
                }
                $color_area = 'FF' . strtoupper($hex);
            } elseif (strpos($c, 'rgb') === 0) {
                preg_match_all('/\d+/', $c, $matches);
                if (count($matches[0]) >= 3) {
                    $color_area = sprintf("FF%02X%02X%02X", $matches[0][0], $matches[0][1], $matches[0][2]);
                }
            }
        }
    }

    $semanasList = array_keys($semanasEncontradas);
    sort($semanasList);

    $tituloSemana = 'Semana: ';
    if ($semana !== '') {
        $tituloSemana .= (int)$semana;
    } else if (count($semanasList) === 1) {
        $tituloSemana .= $semanasList[0];
    } else {
        $tituloSemana .= 'Todas';
    }
    $tituloSemana .= " / {$anio}";

    $incluirColSemana = ($semana === '' && count($semanasList) > 1);

    // 2) Traer movimientos
    $placeholders = implode(',', array_fill(0, count($nominaIds), '?'));
    $queryMov = "
        SELECT
            p.nombre_empleado,
            m.fecha,
            m.concepto,
            m.arboles_podados,
            m.monto,
            m.es_extra,
            n.numero_semana,
            n.anio
        FROM podas_movimientos_pilar m
        JOIN podas_pilar p ON m.id_poda = p.id_poda
        JOIN nomina_pilar n ON p.id_nomina = n.id_nomina_pilar
        WHERE n.id_nomina_pilar IN ({$placeholders})
        ORDER BY n.anio DESC, n.numero_semana ASC, p.nombre_empleado ASC, m.fecha ASC, m.id_movimiento ASC
    ";

    $stmtMov = $conexion->prepare($queryMov);
    $typesMov = str_repeat('i', count($nominaIds));
    bindParams($stmtMov, $typesMov, $nominaIds);
    $stmtMov->execute();
    $resMov = $stmtMov->get_result();

    $rowsPoda = [];
    $rowsExtras = [];

    while ($r = $resMov->fetch_assoc()) {
        $esExtra = (int)$r['es_extra'] === 1;
        $nombre = $r['nombre_empleado'] ?? '';
        $fecha = $r['fecha'] ?? '';
        $sem = $r['numero_semana'] ?? '';

        if ($esExtra) {
            $concepto = $r['concepto'] ?? '';
            $monto = (float)($r['monto'] ?? 0);

            $row = [$nombre, $fecha, $concepto, $monto];
            if ($incluirColSemana) {
                $row[] = (string)$sem;
            }
            $rowsExtras[] = $row;
        } else {
            $arboles = (int)($r['arboles_podados'] ?? 0);
            $pagoPorArbol = (float)($r['monto'] ?? 0);
            $total = $arboles * $pagoPorArbol;

            $row = [$nombre, $fecha, $arboles, $pagoPorArbol, $total];
            if ($incluirColSemana) {
                $row[] = (string)$sem;
            }
            $rowsPoda[] = $row;
        }
    }

    // 3) Construir Excel
    $spreadsheet = new Spreadsheet();
    $spreadsheet->getProperties()
        ->setCreator('Sistema SAAO')
        ->setTitle('Historial Podas/Extras - Pilar');

    $moneyFormat = '"$"#,##0.00';

    $buildSheetPoda = function (Worksheet $sheet) use ($tituloSemana, $rowsPoda, $moneyFormat, $incluirColSemana) {
        $headers = ['Podador', 'Fecha', 'Árboles podados', 'Pago por árbol', 'Total'];
        prepararHoja($sheet, $tituloSemana, $headers, $incluirColSemana);

        $startRow = 7;
        $rowIndex = $startRow;
        $totalArboles = 0;
        $totalDinero = 0;

        foreach ($rowsPoda as $row) {
            $sheet->setCellValue("A{$rowIndex}", (string)$row[0]);
            $sheet->setCellValue("B{$rowIndex}", (string)$row[1]);
            $sheet->setCellValue("C{$rowIndex}", (int)$row[2]);
            $sheet->setCellValue("D{$rowIndex}", (float)$row[3]);
            $sheet->setCellValue("E{$rowIndex}", (float)$row[4]);

            $totalArboles += (int)$row[2];
            $totalDinero += (float)$row[4];

            if ($incluirColSemana) {
                $sheet->setCellValue("F{$rowIndex}", (string)$row[5]);
            }

            $rowIndex++;
        }

        $lastDataRow = max($startRow, $rowIndex - 1);
        $lastColIndex = 5 + ($incluirColSemana ? 1 : 0);
        $lastCol = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($lastColIndex);

        // Fila de Totales
        $totalRow = $rowIndex;
        $sheet->mergeCells("A{$totalRow}:B{$totalRow}");
        $sheet->setCellValue("A{$totalRow}", 'TOTAL GENERAL');
        $sheet->setCellValue("C{$totalRow}", $totalArboles);
        $sheet->setCellValue("E{$totalRow}", $totalDinero);

        $sheet->getStyle("A{$totalRow}:{$lastCol}{$totalRow}")->getFont()->setBold(true)->setSize(14);
        $sheet->getStyle("A{$totalRow}:{$lastCol}{$totalRow}")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('FFF2F2F2');
        $sheet->getStyle("A{$totalRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
        $sheet->getStyle("A{$totalRow}:{$lastCol}{$totalRow}")->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);
        $sheet->getStyle("C{$totalRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle("E{$totalRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getRowDimension($totalRow)->setRowHeight(30);

        // Estilos generales
        $tableRange = "A6:{$lastCol}{$totalRow}";
        $sheet->getStyle($tableRange)->getFont()->setSize(14);
        $sheet->getStyle($tableRange)->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN)->getColor()->setARGB('FFCED4DA');
        $sheet->getStyle("A7:A{$totalRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);
        $sheet->getStyle("C7:C{$totalRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getStyle("D7:E{$totalRow}")->getNumberFormat()->setFormatCode($moneyFormat);

        // Cebrado (Zebra stripes)
        for ($r = 7; $r <= $lastDataRow; $r++) {
            if ($r % 2 === 0) {
                $sheet->getStyle("A{$r}:{$lastCol}{$r}")->getFill()
                    ->setFillType(Fill::FILL_SOLID)
                    ->getStartColor()->setARGB('FFF9F9F9');
            }
        }
    };

    $buildSheetExtras = function (Worksheet $sheet) use ($tituloSemana, $rowsExtras, $moneyFormat, $incluirColSemana) {
        $headers = ['Empleado', 'Fecha', 'Concepto', 'Monto'];
        prepararHoja($sheet, $tituloSemana, $headers, $incluirColSemana);

        $startRow = 7;
        $rowIndex = $startRow;
        $totalExtras = 0;

        foreach ($rowsExtras as $row) {
            $sheet->setCellValue("A{$rowIndex}", (string)$row[0]);
            $sheet->setCellValue("B{$rowIndex}", (string)$row[1]);
            $sheet->setCellValue("C{$rowIndex}", (string)$row[2]);
            $sheet->setCellValue("D{$rowIndex}", (float)$row[3]);

            $totalExtras += (float)$row[3];

            if ($incluirColSemana) {
                $sheet->setCellValue("E{$rowIndex}", (string)$row[4]);
            }

            $rowIndex++;
        }

        $lastDataRow = max($startRow, $rowIndex - 1);
        $lastColIndex = 4 + ($incluirColSemana ? 1 : 0);
        $lastCol = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($lastColIndex);

        // Fila de Totales
        $totalRow = $rowIndex;
        // A:C etiqueta, D monto
        $sheet->mergeCells("A{$totalRow}:C{$totalRow}");
        $sheet->setCellValue("A{$totalRow}", 'TOTAL GENERAL');
        $sheet->setCellValue("D{$totalRow}", $totalExtras);

        $sheet->getStyle("A{$totalRow}:{$lastCol}{$totalRow}")->getFont()->setBold(true)->setSize(14);
        $sheet->getStyle("A{$totalRow}:{$lastCol}{$totalRow}")->getFill()->setFillType(Fill::FILL_SOLID)->getStartColor()->setARGB('FFF2F2F2');
        $sheet->getStyle("A{$totalRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
        $sheet->getStyle("A{$totalRow}:{$lastCol}{$totalRow}")->getAlignment()->setVertical(Alignment::VERTICAL_CENTER);
        // Total en medio de la celda
        $sheet->getStyle("D{$totalRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
        $sheet->getRowDimension($totalRow)->setRowHeight(30);

        // Estilos generales
        $tableRange = "A6:{$lastCol}{$totalRow}";
        $sheet->getStyle($tableRange)->getFont()->setSize(14);
        $sheet->getStyle($tableRange)->getBorders()->getAllBorders()->setBorderStyle(Border::BORDER_THIN)->getColor()->setARGB('FFCED4DA');
        $sheet->getStyle("A7:A{$totalRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_LEFT);
        $sheet->getStyle("D7:D{$totalRow}")->getNumberFormat()->setFormatCode($moneyFormat);

        // Cebrado (Zebra stripes)
        for ($r = 7; $r <= $lastDataRow; $r++) {
            if ($r % 2 === 0) {
                $sheet->getStyle("A{$r}:{$lastCol}{$r}")->getFill()
                    ->setFillType(Fill::FILL_SOLID)
                    ->getStartColor()->setARGB('FFF9F9F9');
            }
        }
    };

    if ($tipo === 'mixto') {
        $sheet1 = $spreadsheet->getActiveSheet();
        $sheet1->setTitle('Poda');
        $buildSheetPoda($sheet1);

        $sheet2 = new Worksheet($spreadsheet, 'Extras');
        $spreadsheet->addSheet($sheet2, 1);
        $buildSheetExtras($sheet2);

        $spreadsheet->setActiveSheetIndex(0);
    } elseif ($tipo === 'poda') {
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Poda');
        $buildSheetPoda($sheet);
    } else {
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Extras');
        $buildSheetExtras($sheet);
    }

    // Nombre de archivo
    $semPart = ($semana !== '') ? ('sem_' . (int)$semana) : 'semanas';
    $filename = "pilar_{$anio}_{$semPart}_{$tipo}.xlsx";

    // Salida
    header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    header('Content-Disposition: attachment; filename="' . $filename . '"');
    header('Cache-Control: max-age=0');

    $writer = new Xlsx($spreadsheet);
    $writer->save('php://output');
    exit();

} catch (Throwable $e) {
    http_response_code(500);
    echo "Error generando Excel: " . $e->getMessage();
    exit();
}
