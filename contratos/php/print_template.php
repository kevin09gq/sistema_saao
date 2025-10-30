<?php
/**
 * Plantilla HTML para impresión de contratos
 * Retorna la estructura HTML base con los estilos CSS incluidos
 */

function getPrintTemplate($contenido) {
    
    $cssPath = __DIR__ . '/../styles/print.css';
    $cssContent = file_exists($cssPath) ? file_get_contents($cssPath) : '';
    
    return <<<HTML
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Contrato</title>
    <style>
        {$cssContent}
    </style>
</head>
<body>
    {$contenido}
</body>
</html>
HTML;
}
?>
