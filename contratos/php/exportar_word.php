<?php
// contratos/php/exportar_word.php
// Exportar contrato a formato Word (.docx) usando PHPWord

// Deshabilitar visualización de errores para devolver solo JSON
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Capturar cualquier salida no deseada
ob_start();

header('Content-Type: application/json; charset=utf-8');

// Verificar que el autoload existe
if (!file_exists(__DIR__ . '/../../vendor/autoload.php')) {
    ob_end_clean();
    echo json_encode([
        'ok' => false,
        'error' => 'No se encontró el archivo autoload.php de Composer. Ejecuta "composer install".'
    ]);
    exit;
}

require_once __DIR__ . '/../../vendor/autoload.php';

use PhpOffice\PhpWord\PhpWord;
use PhpOffice\PhpWord\IOFactory;
use PhpOffice\PhpWord\Shared\Html;

try {
    // Verificar que se recibió el contenido HTML
    if (!isset($_POST['contenido']) || empty($_POST['contenido'])) {
        throw new Exception('No se recibió contenido para exportar');
    }

    $htmlContent = $_POST['contenido'];
    $nombreArchivo = isset($_POST['nombre']) && !empty($_POST['nombre']) 
        ? $_POST['nombre'] 
        : 'contrato_' . date('Y-m-d_His');
    
    // Limpiar el nombre del archivo
    $nombreArchivo = preg_replace('/[^a-zA-Z0-9_-]/', '_', $nombreArchivo);
    $nombreArchivo = trim($nombreArchivo, '_');
    
    // Crear nuevo documento de Word
    $phpWord = new PhpWord();
    
    // Configurar propiedades del documento
    $properties = $phpWord->getDocInfo();
    $properties->setCreator('Sistema SAAO');
    $properties->setTitle('Contrato Laboral');
    $properties->setDescription('Contrato generado desde el Sistema SAAO');
    
    // Configurar el idioma del documento a español y desactivar corrección ortográfica
    $phpWord->getSettings()->setThemeFontLang(new \PhpOffice\PhpWord\Style\Language('es-ES'));
    $phpWord->getSettings()->setHideSpellingErrors(true);
    $phpWord->getSettings()->setHideGrammaticalErrors(true);
    
    // Configurar la sección con márgenes de página carta estándar de Word
    $section = $phpWord->addSection([
        'marginTop' => 1417,    // 2.5 cm en twips (1 cm = 567 twips)
        'marginBottom' => 1417, // 2.5 cm en twips
        'marginLeft' => 1701,   // 3 cm en twips
        'marginRight' => 1701,  // 3 cm en twips
        'pageSizeW' => 12240,   // Ancho A4 en twips
        'pageSizeH' => 15840,   // Alto A4 en twips
        // Asegurar márgenes consistentes en todas las páginas
        'headerHeight' => 0,
        'footerHeight' => 0,
        'gutter' => 0,
        'colsNum' => 1,
        'colsSpace' => 0,
    ]);
    
    // Agregar numeración de páginas centrada en el pie de página, estilo: [1]
    $footer = $section->addFooter();
    $footer->addPreserveText('[{PAGE}]', ['name' => 'Arial', 'size' => 12], ['alignment' => 'center']);
    
    // Limpiar el HTML antes de procesarlo
    $htmlContent = limpiarHtmlParaWord($htmlContent);
    
    // Configuración para preservar el formato exacto del HTML
    \PhpOffice\PhpWord\Settings::setOutputEscapingEnabled(true);
    \PhpOffice\PhpWord\Settings::setDefaultFontName('Arial');
    \PhpOffice\PhpWord\Settings::setDefaultFontSize(11);
    
    // Procesar el HTML manualmente para mejor control del formato
    procesarHtmlAWord($section, $htmlContent);
    
    // Generar el documento en memoria
    $objWriter = IOFactory::createWriter($phpWord, 'Word2007');
    
    // Capturar el contenido del documento en una variable
    ob_start();
    $objWriter->save('php://output');
    $contenidoDocx = ob_get_contents();
    ob_end_clean();
    
    // Codificar el contenido en base64 para enviarlo en JSON
    $contenidoBase64 = base64_encode($contenidoDocx);
    
    // Limpiar el buffer de salida antes de devolver JSON
    ob_end_clean();
    
    // Devolver respuesta exitosa con el contenido del archivo codificado
    echo json_encode([
        'ok' => true,
        'mensaje' => 'Documento Word generado exitosamente',
        'data' => [
            'nombre' => $nombreArchivo . '.docx',
            'contenido' => $contenidoBase64,
            'tamano' => strlen($contenidoDocx)
        ]
    ]);
    
} catch (Exception $e) {
    // Limpiar el buffer de salida antes de devolver JSON de error
    ob_end_clean();
    
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
}

/**
 * Procesa HTML y lo convierte a elementos de Word
 */
function procesarHtmlAWord($section, $html) {
    // Cargar HTML en DOMDocument
    $dom = new DOMDocument();
    $dom->encoding = 'UTF-8';
    
    // Suprimir warnings de HTML mal formado
    libxml_use_internal_errors(true);
    
    // Agregar wrapper para asegurar UTF-8
    $html = mb_convert_encoding($html, 'HTML-ENTITIES', 'UTF-8');
    $dom->loadHTML('<?xml encoding="UTF-8"><body>' . $html . '</body>', LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
    
    libxml_clear_errors();
    
    // Procesar el body
    $body = $dom->getElementsByTagName('body')->item(0);
    if ($body) {
        procesarNodoRecursivo($section, $body);
    }
}

/**
 * Procesa un nodo DOM recursivamente y lo agrega a la sección de Word
 */
function procesarNodoRecursivo($section, $node, $estiloActual = []) {
    // Estilo por defecto
    if (empty($estiloActual)) {
        $estiloActual = ['name' => 'Arial', 'size' => 11];
    }
    
    foreach ($node->childNodes as $child) {
        if ($child->nodeType === XML_TEXT_NODE) {
            $texto = $child->nodeValue;
            // Solo agregar si no está vacío
            if (trim($texto) !== '') {
                // Verificar si el nodo padre tiene estilo de fondo
                $bgColor = null;
                if ($node->nodeType === XML_ELEMENT_NODE && $node->hasAttribute('style')) {
                    $bgColor = detectarColorFondo($node);
                }
                
                // Si hay color de fondo, aplicarlo al estilo
                if ($bgColor !== null) {
                    $estiloConFondo = $estiloActual;
                    $estiloConFondo['bgColor'] = $bgColor;
                    $section->addText($texto, $estiloConFondo);
                } else {
                    $section->addText($texto, $estiloActual);
                }
            }
        } elseif ($child->nodeType === XML_ELEMENT_NODE) {
            $tagName = strtolower($child->nodeName);
            $nuevoEstilo = $estiloActual;
            
            // Aplicar estilos según la etiqueta
            switch ($tagName) {
                case 'strong':
                case 'b':
                    $nuevoEstilo['bold'] = true;
                    break;
                case 'em':
                case 'i':
                    $nuevoEstilo['italic'] = true;
                    break;
                case 'u':
                    $nuevoEstilo['underline'] = 'single';
                    break;
            }
            
            // Manejar tablas
            if ($tagName === 'table') {
                procesarTabla($section, $child);
            }
            // Manejar párrafos y divs
            elseif ($tagName === 'p' || $tagName === 'div') {
                // Detectar alineación del estilo inline
                $alineacion = detectarAlineacion($child);
                
                // Verificar si el párrafo está vacío o solo tiene espacios/br
                $textoParrafo = trim($child->textContent);
                $tieneBr = $child->getElementsByTagName('br')->length > 0;
                
                // Si el párrafo está vacío o solo tiene <br>, agregar un salto de línea
                if ($textoParrafo === '' || ($textoParrafo === '' && $tieneBr)) {
                    $section->addTextBreak();
                } else {
                    // Estilo de párrafo con espaciado ajustado (similar al PDF)
                    $parrafoEstilo = [
                        'alignment' => $alineacion,
                        'spaceAfter' => 120,    // Espacio después del párrafo (6pt = 120 twips)
                        'spaceBefore' => 0,     // Sin espacio antes
                        'spacing' => 0,         // Sin espaciado entre líneas extra
                        'lineHeight' => 1.15    // Interlineado 1.15 (como en el PDF)
                    ];
                    
                    // Obtener todo el texto del párrafo con formato
                    $textRun = $section->addTextRun($parrafoEstilo);
                    procesarTextoConFormato($textRun, $child, $nuevoEstilo);
                }
            } elseif ($tagName === 'br') {
                $section->addTextBreak();
            } else {
                // Procesar hijos recursivamente
                procesarNodoRecursivo($section, $child, $nuevoEstilo);
            }
        }
    }
}

/**
 * Procesa una tabla HTML y la convierte a tabla de Word
 */
function procesarTabla($section, $tableNode) {
    // Contar filas y columnas
    $filas = [];
    $maxColumnas = 0;
    $anchosColumnas = []; // Guardar anchos de columna
    
    // Extraer todas las filas (thead, tbody, tr directos)
    foreach ($tableNode->childNodes as $child) {
        if ($child->nodeType === XML_ELEMENT_NODE) {
            $tagName = strtolower($child->nodeName);
            
            if ($tagName === 'tr') {
                $filas[] = $child;
            } elseif ($tagName === 'thead' || $tagName === 'tbody' || $tagName === 'tfoot') {
                foreach ($child->childNodes as $tr) {
                    if ($tr->nodeType === XML_ELEMENT_NODE && strtolower($tr->nodeName) === 'tr') {
                        $filas[] = $tr;
                    }
                }
            }
        }
    }
    
    // Contar columnas máximas y detectar anchos
    foreach ($filas as $fila) {
        $numCols = 0;
        foreach ($fila->childNodes as $celda) {
            if ($celda->nodeType === XML_ELEMENT_NODE) {
                $tagCelda = strtolower($celda->nodeName);
                if ($tagCelda === 'td' || $tagCelda === 'th') {
                    // Detectar ancho de la celda
                    $ancho = detectarAnchoCelda($celda);
                    if ($ancho !== null && !isset($anchosColumnas[$numCols])) {
                        $anchosColumnas[$numCols] = $ancho;
                    }
                    $numCols++;
                }
            }
        }
        if ($numCols > $maxColumnas) {
            $maxColumnas = $numCols;
        }
    }
    
    if (count($filas) === 0 || $maxColumnas === 0) {
        return; // No hay tabla válida
    }
    
    // Detectar ancho total de la tabla
    $anchoTabla = detectarAnchoTabla($tableNode);
    
    // Crear tabla en Word
    $tableStyle = [
        'borderSize' => 6,
        'borderColor' => '000000',
        'cellMargin' => 80,
        'alignment' => \PhpOffice\PhpWord\SimpleType\JcTable::CENTER
    ];
    
    // Si hay ancho definido, usarlo
    if ($anchoTabla !== null) {
        $tableStyle['width'] = $anchoTabla;
        $tableStyle['unit'] = \PhpOffice\PhpWord\SimpleType\TblWidth::TWIP;
    } else {
        $tableStyle['width'] = 100 * 50;
        $tableStyle['unit'] = \PhpOffice\PhpWord\SimpleType\TblWidth::PERCENT;
    }
    
    $table = $section->addTable($tableStyle);
    
    // Procesar cada fila
    foreach ($filas as $filaNode) {
        $table->addRow();
        $colIndex = 0;
        
        foreach ($filaNode->childNodes as $celdaNode) {
            if ($celdaNode->nodeType === XML_ELEMENT_NODE) {
                $tagCelda = strtolower($celdaNode->nodeName);
                
                if ($tagCelda === 'td' || $tagCelda === 'th') {
                    // Estilo de celda
                    $cellStyle = [
                        'valign' => 'center',
                        'borderSize' => 6,
                        'borderColor' => '000000'
                    ];
                    
                    // Detectar color de fondo desde estilos inline o atributo bgcolor
                    $bgColor = detectarColorFondo($celdaNode);
                    if ($bgColor !== null) {
                        $cellStyle['bgColor'] = $bgColor;
                    }
                    
                    // Aplicar ancho de columna si está definido
                    $anchoCelda = detectarAnchoCelda($celdaNode);
                    if ($anchoCelda !== null) {
                        $cellStyle['width'] = $anchoCelda;
                        $cellStyle['unit'] = \PhpOffice\PhpWord\SimpleType\TblWidth::TWIP;
                    } elseif (isset($anchosColumnas[$colIndex])) {
                        $cellStyle['width'] = $anchosColumnas[$colIndex];
                        $cellStyle['unit'] = \PhpOffice\PhpWord\SimpleType\TblWidth::TWIP;
                    }
                    
                    // Agregar celda
                    $cell = $table->addCell(null, $cellStyle);
                    
                    // Estilo de texto (negrita para th)
                    $textStyle = ['name' => 'Arial', 'size' => 11];
                    if ($tagCelda === 'th') {
                        $textStyle['bold'] = true;
                    }
                    
                    // Extraer y agregar contenido de la celda
                    $textRun = $cell->addTextRun(['alignment' => 'center']);
                    procesarTextoConFormato($textRun, $celdaNode, $textStyle);
                    
                    $colIndex++;
                }
            }
        }
        
        // Rellenar celdas vacías si faltan columnas
        while ($colIndex < $maxColumnas) {
            $cellStyle = ['valign' => 'center'];
            if (isset($anchosColumnas[$colIndex])) {
                $cellStyle['width'] = $anchosColumnas[$colIndex];
                $cellStyle['unit'] = \PhpOffice\PhpWord\SimpleType\TblWidth::TWIP;
            }
            $table->addCell(null, $cellStyle);
            $colIndex++;
        }
    }
}

/**
 * Detecta el color de fondo de un nodo desde sus estilos
 * Retorna el color en formato hexadecimal (sin #) o null
 */
function detectarColorFondo($node) {
    // Buscar en atributo bgcolor (HTML antiguo)
    if ($node->hasAttribute('bgcolor')) {
        $color = $node->getAttribute('bgcolor');
        return convertirColorAHex($color);
    }
    
    // Buscar en estilo inline
    if ($node->hasAttribute('style')) {
        $style = $node->getAttribute('style');
        
        // Formato hexadecimal: #RRGGBB o #RGB
        if (preg_match('/background(?:-color)?:\s*#([0-9a-fA-F]{3,6})/i', $style, $matches)) {
            $hex = $matches[1];
            // Expandir formato corto #RGB a #RRGGBB
            if (strlen($hex) === 3) {
                $hex = $hex[0] . $hex[0] . $hex[1] . $hex[1] . $hex[2] . $hex[2];
            }
            return strtoupper($hex);
        }
        
        // Formato rgb(r, g, b)
        if (preg_match('/background(?:-color)?:\s*rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i', $style, $matches)) {
            $r = intval($matches[1]);
            $g = intval($matches[2]);
            $b = intval($matches[3]);
            return sprintf('%02X%02X%02X', $r, $g, $b);
        }
        
        // Formato rgba(r, g, b, a) - ignorar alpha
        if (preg_match('/background(?:-color)?:\s*rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*[\d.]+\s*\)/i', $style, $matches)) {
            $r = intval($matches[1]);
            $g = intval($matches[2]);
            $b = intval($matches[3]);
            return sprintf('%02X%02X%02X', $r, $g, $b);
        }
        
        // Nombres de colores comunes
        if (preg_match('/background(?:-color)?:\s*([a-z]+)/i', $style, $matches)) {
            $colorName = strtolower($matches[1]);
            return convertirNombreColorAHex($colorName);
        }
    }
    
    return null;
}

/**
 * Convierte un color en cualquier formato a hexadecimal
 */
function convertirColorAHex($color) {
    $color = trim($color);
    
    // Ya es hexadecimal
    if (preg_match('/^#?([0-9a-fA-F]{3,6})$/', $color, $matches)) {
        $hex = $matches[1];
        if (strlen($hex) === 3) {
            $hex = $hex[0] . $hex[0] . $hex[1] . $hex[1] . $hex[2] . $hex[2];
        }
        return strtoupper($hex);
    }
    
    // Nombre de color
    return convertirNombreColorAHex($color);
}

/**
 * Convierte nombres de colores CSS comunes a hexadecimal
 */
function convertirNombreColorAHex($nombre) {
    $colores = [
        'black' => '000000',
        'white' => 'FFFFFF',
        'red' => 'FF0000',
        'green' => '008000',
        'blue' => '0000FF',
        'yellow' => 'FFFF00',
        'cyan' => '00FFFF',
        'magenta' => 'FF00FF',
        'gray' => '808080',
        'grey' => '808080',
        'silver' => 'C0C0C0',
        'maroon' => '800000',
        'olive' => '808000',
        'lime' => '00FF00',
        'aqua' => '00FFFF',
        'teal' => '008080',
        'navy' => '000080',
        'fuchsia' => 'FF00FF',
        'purple' => '800080',
        'orange' => 'FFA500',
        'pink' => 'FFC0CB',
        'brown' => 'A52A2A',
        'gold' => 'FFD700',
        'lightblue' => 'ADD8E6',
        'lightgreen' => '90EE90',
        'lightgray' => 'D3D3D3',
        'lightgrey' => 'D3D3D3',
        'darkgray' => 'A9A9A9',
        'darkgrey' => 'A9A9A9'
    ];
    
    $nombre = strtolower(trim($nombre));
    return isset($colores[$nombre]) ? $colores[$nombre] : null;
}

/**
 * Detecta el ancho de una celda desde sus estilos
 * Retorna el ancho en twips o null si no está definido
 */
function detectarAnchoCelda($celdaNode) {
    // Buscar en atributo width
    if ($celdaNode->hasAttribute('width')) {
        $width = $celdaNode->getAttribute('width');
        return convertirAnchoATwips($width);
    }
    
    // Buscar en estilo inline
    if ($celdaNode->hasAttribute('style')) {
        $style = $celdaNode->getAttribute('style');
        if (preg_match('/width:\s*([0-9.]+)(px|pt|%|cm|mm|in)?/i', $style, $matches)) {
            $valor = floatval($matches[1]);
            $unidad = isset($matches[2]) ? strtolower($matches[2]) : 'px';
            return convertirAnchoATwips($valor . $unidad);
        }
    }
    
    return null;
}

/**
 * Detecta el ancho total de la tabla
 */
function detectarAnchoTabla($tableNode) {
    // Buscar en atributo width
    if ($tableNode->hasAttribute('width')) {
        $width = $tableNode->getAttribute('width');
        return convertirAnchoATwips($width);
    }
    
    // Buscar en estilo inline
    if ($tableNode->hasAttribute('style')) {
        $style = $tableNode->getAttribute('style');
        if (preg_match('/width:\s*([0-9.]+)(px|pt|%|cm|mm|in)?/i', $style, $matches)) {
            $valor = floatval($matches[1]);
            $unidad = isset($matches[2]) ? strtolower($matches[2]) : 'px';
            return convertirAnchoATwips($valor . $unidad);
        }
    }
    
    return null;
}

/**
 * Convierte un ancho CSS a twips (1/1440 de pulgada)
 * Soporta: px, pt, cm, mm, in, %
 */
function convertirAnchoATwips($anchoStr) {
    if (preg_match('/^([0-9.]+)(px|pt|%|cm|mm|in)?$/i', $anchoStr, $matches)) {
        $valor = floatval($matches[1]);
        $unidad = isset($matches[2]) ? strtolower($matches[2]) : 'px';
        
        switch ($unidad) {
            case 'pt':
                // 1 pt = 20 twips
                return round($valor * 20);
            case 'px':
                // 1 px ≈ 15 twips (asumiendo 96 DPI)
                return round($valor * 15);
            case 'cm':
                // 1 cm = 567 twips
                return round($valor * 567);
            case 'mm':
                // 1 mm = 56.7 twips
                return round($valor * 56.7);
            case 'in':
                // 1 inch = 1440 twips
                return round($valor * 1440);
            case '%':
                // Para porcentajes, calcular basado en ancho de página (8.5" - márgenes)
                // Ancho útil: 8.5" - 2*2.5cm = 8.5" - 1.97" ≈ 6.53" = 9403 twips
                return round(9403 * ($valor / 100));
            default:
                return round($valor * 15); // Default: px
        }
    }
    
    return null;
}

/**
 * Detecta la alineación del texto desde los estilos inline
 */
function detectarAlineacion($node) {
    if ($node->hasAttribute('style')) {
        $style = $node->getAttribute('style');
        if (strpos($style, 'text-align: center') !== false || strpos($style, 'text-align:center') !== false) {
            return 'center';
        }
        if (strpos($style, 'text-align: right') !== false || strpos($style, 'text-align:right') !== false) {
            return 'right';
        }
        if (strpos($style, 'text-align: left') !== false || strpos($style, 'text-align:left') !== false) {
            return 'left';
        }
        if (strpos($style, 'text-align: justify') !== false || strpos($style, 'text-align:justify') !== false) {
            return 'both';
        }
    }
    
    // Detectar desde clases de Quill
    if ($node->hasAttribute('class')) {
        $class = $node->getAttribute('class');
        if (strpos($class, 'ql-align-center') !== false) {
            return 'center';
        }
        if (strpos($class, 'ql-align-right') !== false) {
            return 'right';
        }
        if (strpos($class, 'ql-align-justify') !== false) {
            return 'both';
        }
    }
    
    // Por defecto: justificado (como en los contratos)
    return 'both';
}

/**
 * Procesa texto con formato dentro de un TextRun
 */
function procesarTextoConFormato($textRun, $node, $estiloBase = []) {
    if (empty($estiloBase)) {
        $estiloBase = ['name' => 'Arial', 'size' => 11];
    }
    
    foreach ($node->childNodes as $child) {
        if ($child->nodeType === XML_TEXT_NODE) {
            $texto = $child->nodeValue;
            if ($texto !== '') {
                // Preservar espacios en blanco
                $textRun->addText($texto, $estiloBase, ['preserveText' => true]);
            }
        } elseif ($child->nodeType === XML_ELEMENT_NODE) {
            $tagName = strtolower($child->nodeName);
            $nuevoEstilo = $estiloBase;
            
            // Manejar saltos de línea <br>
            if ($tagName === 'br') {
                $textRun->addTextBreak();
                continue;
            }
            
            // Detectar tamaño de fuente desde estilos inline PRIMERO (antes de aplicar otros estilos)
            if ($child->hasAttribute('style')) {
                $style = $child->getAttribute('style');
                if (preg_match('/font-size:\s*(\d+(?:\.\d+)?)pt/i', $style, $matches)) {
                    $nuevoEstilo['size'] = intval(round(floatval($matches[1])));
                }
                
                // Detectar color de fondo desde estilos inline
                $bgColor = detectarColorFondo($child);
                if ($bgColor !== null) {
                    $nuevoEstilo['bgColor'] = $bgColor;
                }
            }
            
            // Aplicar estilos de formato (negrita, cursiva, subrayado)
            switch ($tagName) {
                case 'strong':
                case 'b':
                    $nuevoEstilo['bold'] = true;
                    break;
                case 'em':
                case 'i':
                    $nuevoEstilo['italic'] = true;
                    break;
                case 'u':
                    $nuevoEstilo['underline'] = 'single';
                    break;
            }
            
            // Procesar recursivamente
            procesarTextoConFormato($textRun, $child, $nuevoEstilo);
        }
    }
}

/**
 * Procesa un nodo DOM y lo agrega a la sección de Word
 */
function procesarNodo($section, $node, $fontStyle = []) {
    if (!isset($fontStyle['name'])) $fontStyle['name'] = 'Arial';
    if (!isset($fontStyle['size'])) $fontStyle['size'] = 11;
    
    if ($node->nodeType === XML_TEXT_NODE) {
        $texto = trim($node->nodeValue);
        if (!empty($texto)) {
            $section->addText($texto, $fontStyle);
        }
        return;
    }
    
    if ($node->nodeType === XML_ELEMENT_NODE) {
        $tagName = strtolower($node->nodeName);
        
        // Aplicar estilos según la etiqueta
        $nuevoEstilo = $fontStyle;
        
        switch ($tagName) {
            case 'strong':
            case 'b':
                $nuevoEstilo['bold'] = true;
                break;
            case 'em':
            case 'i':
                $nuevoEstilo['italic'] = true;
                break;
            case 'u':
                $nuevoEstilo['underline'] = 'single';
                break;
        }
        
        // Procesar párrafos
        if ($tagName === 'p' || $tagName === 'div') {
            $textoCompleto = '';
            foreach ($node->childNodes as $child) {
                if ($child->nodeType === XML_TEXT_NODE) {
                    $textoCompleto .= $child->nodeValue;
                } else {
                    $textoCompleto .= $child->textContent;
                }
            }
            $textoCompleto = trim($textoCompleto);
            if (!empty($textoCompleto)) {
                $section->addText($textoCompleto, $nuevoEstilo, ['alignment' => 'both']);
            }
            return;
        }
        
        // Procesar hijos recursivamente
        if ($node->hasChildNodes()) {
            foreach ($node->childNodes as $child) {
                procesarNodo($section, $child, $nuevoEstilo);
            }
        }
    }
}

/**
 * Limpia y prepara el HTML para ser convertido a Word
 * PRESERVA TODO EL FORMATO EXACTO
 */
function limpiarHtmlParaWord($html) {
    // SOLO eliminar líneas divisorias de fin de página
    $html = preg_replace('/<div[^>]*class="[^"]*page-end-line[^"]*"[^>]*>.*?<\/div>/is', '', $html);
    $html = preg_replace('/<hr[^>]*class="[^"]*page-end-line[^"]*"[^>]*\/?>/is', '', $html);
    
    // Convertir entidades HTML para que se muestren correctamente
    $html = html_entity_decode($html, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    
    return $html;
}
