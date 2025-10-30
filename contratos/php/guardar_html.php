<?php
// contratos/php/guardar_html.php

// Verificar que se haya enviado contenido
if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !isset($_POST['contenido'])) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Faltan datos']);
    exit;
}

$contenido = $_POST['contenido'];
$nombre = $_POST['nombre'] ?? ('contrato_' . time());

// Validar nombre (solo caracteres seguros)
if (!preg_match('/^[a-zA-Z0-9_-]+$/', $nombre)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Nombre inválido']);
    exit;
}

// Directorio de contratos renderizados
$dirRendered = __DIR__ . '/../rendered';
if (!is_dir($dirRendered)) {
    if (!mkdir($dirRendered, 0755, true)) {
        http_response_code(500);
        echo json_encode(['ok' => false, 'error' => 'No se pudo crear el directorio']);
        exit;
    }
}

// Ruta del archivo
$rutaArchivo = $dirRendered . '/' . $nombre . '.html';

// CSS inline para el documento autocontenido
$cssInline = "
/* Estilos base sin bordes */
@page { 
  size: letter; 
  margin: 0.98in 1.18in; 
  @bottom-center {
    content: \"[\" counter(page) \"]\";
    font-size: 12pt;
    color: #000;
  }
}
body { margin: 0; padding: 0; font-family: Arial, sans-serif; background: white; line-height: 1.6; counter-reset: page; position: relative; }
/* Marca de agua */
body::before {
  content: '';
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 95%;
  height: 95%;
  background-image: url('/sistema_saao/contratos/img/agua.jpeg');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  opacity: 0.1;
  z-index: -1;
  pointer-events: none;
}
@media print { 
  body { margin: 0; padding: 0; }
  .page { position: relative; }
}
/* Estilos de formato básico de Quill */
strong, b { font-weight: bold; }
em, i { font-style: italic; }
u { text-decoration: underline; }
s { text-decoration: line-through; }
sub { vertical-align: sub; font-size: smaller; }
sup { vertical-align: super; font-size: smaller; }
blockquote { border-left: 4px solid #ccc; margin-bottom: 5px; margin-top: 5px; padding-left: 16px; }
pre { background-color: #f0f0f0; border-radius: 3px; white-space: pre-wrap; margin-bottom: 5px; margin-top: 5px; padding: 5px 10px; }
code { background-color: #f0f0f0; border-radius: 3px; font-size: 85%; padding: 2px 4px; }
ol, ul { padding-left: 1.5em; }
ol { list-style-type: decimal; }
ul { list-style-type: disc; }
li { margin-bottom: 0.5em; }
h1 { font-size: 2em; font-weight: bold; margin: 0.67em 0; }
h2 { font-size: 1.5em; font-weight: bold; margin: 0.75em 0; }
h3 { font-size: 1.17em; font-weight: bold; margin: 0.83em 0; }
h4 { font-size: 1em; font-weight: bold; margin: 1.12em 0; }
h5 { font-size: 0.83em; font-weight: bold; margin: 1.5em 0; }
table { border-collapse: collapse; width: 100%; margin: 10px 0; border: 1px solid #000 !important; }
table td, table th { border: 1px solid #000 !important; padding: 8px; vertical-align: top; }
table th { font-weight: bold; text-align: left; }
.ql-align-left { text-align: left !important; }
.ql-align-center { text-align: center !important; }
.ql-align-right { text-align: right !important; }
.ql-align-justify { text-align: justify !important; text-justify: inter-word !important; }
.ql-font-serif { font-family: Georgia, Times New Roman, serif !important; }
.ql-font-monospace { font-family: Monaco, Courier New, monospace !important; }
.ql-direction-rtl { direction: rtl; text-align: inherit; }
/* Fuentes personalizadas */
.ql-font-arial, .ql-editor .ql-font-arial { font-family: Arial, Helvetica, sans-serif !important; }
.ql-font-calibri, .ql-editor .ql-font-calibri { font-family: Calibri, Candara, Segoe, Segoe UI, Optima, Arial, sans-serif !important; }
.ql-font-cambria, .ql-editor .ql-font-cambria { font-family: Cambria, Georgia, serif !important; }
.ql-font-candara, .ql-editor .ql-font-candara { font-family: Candara, Calibri, Segoe, Segoe UI, Optima, Arial, sans-serif !important; }
.ql-font-century-gothic, .ql-editor .ql-font-century-gothic { font-family: \"Century Gothic\", AppleGothic, sans-serif !important; }
.ql-font-comic-sans-ms, .ql-editor .ql-font-comic-sans-ms { font-family: \"Comic Sans MS\", cursive, sans-serif !important; }
.ql-font-consolas, .ql-editor .ql-font-consolas { font-family: Consolas, monaco, monospace !important; }
.ql-font-courier-new, .ql-editor .ql-font-courier-new { font-family: \"Courier New\", Courier, monospace !important; }
.ql-font-georgia, .ql-editor .ql-font-georgia { font-family: Georgia, serif !important; }
.ql-font-helvetica, .ql-editor .ql-font-helvetica { font-family: Helvetica, Arial, sans-serif !important; }
.ql-font-lucida-sans, .ql-editor .ql-font-lucida-sans { font-family: \"Lucida Sans\", \"Lucida Grande\", \"Lucida Sans Unicode\", sans-serif !important; }
.ql-font-palatino-linotype, .ql-editor .ql-font-palatino-linotype { font-family: \"Palatino Linotype\", Palatino, Palladio, \"URW Palladio L\", \"Book Antiqua\", Baskerville, \"Bookman Old Style\", \"Bitstream Charter\", \"Nimbus Roman No9 L\", Garamond, \"Apple Garamond\", \"ITC Garamond Narrow\", \"New Century Schoolbook\", \"Century Schoolbook\", \"Century Schoolbook L\", Georgia, serif !important; }
.ql-font-tahoma, .ql-editor .ql-font-tahoma { font-family: Tahoma, Verdana, Segoe, sans-serif !important; }
.ql-font-times-new-roman, .ql-editor .ql-font-times-new-roman { font-family: \"Times New Roman\", TimesNewRoman, Times, Baskerville, Georgia, serif !important; }
.ql-font-trebuchet-ms, .ql-editor .ql-font-trebuchet-ms { font-family: \"Trebuchet MS\", \"Lucida Grande\", \"Lucida Sans Unicode\", \"Lucida Sans\", Tahoma, sans-serif !important; }
.ql-font-verdana, .ql-editor .ql-font-verdana { font-family: Verdana, Geneva, sans-serif !important; }
/* Estilos para tablas */
table { border-collapse: collapse; width: 100%; margin: 10px 0; border: 1px solid #000 !important; }
table td, table th { border: 1px solid #000 !important; padding: 8px; vertical-align: top; }
table th { font-weight: bold; text-align: left; }
/* Estilos específicos para tablas de contrato */
.tabla-contrato { border-collapse: collapse; width: 100%; margin: 10px 0; border: 1px solid #000 !important; }
.tabla-contrato td, .tabla-contrato th { border: 1px solid #000 !important; padding: 8px; vertical-align: top; }
.tabla-contrato th { font-weight: bold; text-align: left; }
";

// Envolver en HTML básico para que sea autocontenido sin bordes
$template = "<!DOCTYPE html>\n<html lang=\"es\">\n<head>\n<meta charset=\"UTF-8\"/>\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\"/>\n<title>" . htmlspecialchars($nombre, ENT_QUOTES, 'UTF-8') . "</title>\n<style>\n" .
    $cssInline .
    "</style>\n</head>\n<body>\n" .
    "<div class=\"page\">\n" . $contenido . "\n</div>\n" .
    "</body>\n</html>";

// Guardar archivo
if (file_put_contents($rutaArchivo, $template) === false) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'No se pudo guardar el archivo']);
    exit;
}

// Retornar éxito con ruta relativa
$rutaRelativa = 'rendered/' . $nombre . '.html';
echo json_encode([
    'ok' => true,
    'data' => [
        'archivo' => $rutaRelativa,
        'ruta_completa' => $rutaArchivo
    ]
]);