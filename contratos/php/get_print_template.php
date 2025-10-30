<?php
/**
 * Endpoint para obtener la plantilla HTML de impresión
 * Retorna el HTML con los estilos CSS incluidos
 */

header('Content-Type: text/html; charset=UTF-8');

// Obtener el ID de la empresa desde la URL si está presente
$id_empresa = isset($_GET['id_empresa']) ? intval($_GET['id_empresa']) : 0;

// Inicializar la ruta del logo de la marca de agua
$watermark_path = '/sistema_saao/contratos/img/agua.jpeg'; // Valor por defecto

// Si se proporciona un ID de empresa, obtener su marca de agua
if ($id_empresa > 0) {
    include("../../conexion/conexion.php");
    
    $sql = $conexion->prepare("SELECT marca_empresa FROM empresa WHERE id_empresa = ?");
    $sql->bind_param("i", $id_empresa);
    $sql->execute();
    $resultado = $sql->get_result();
    
    if ($row = $resultado->fetch_assoc()) {
        // Si la empresa tiene una marca de agua definida, usarla
        if (!empty($row['marca_empresa'])) {
            $watermark_path = '/sistema_saao/contratos/logos_empresa/' . basename($row['marca_empresa']);
        }
    }
    
    $sql->close();
    $conexion->close();
}

// Leer el archivo CSS de impresión
$cssPath = __DIR__ . '/../styles/print.css';
$cssContent = file_exists($cssPath) ? file_get_contents($cssPath) : '';

// Reemplazar el path de la marca de agua en el CSS
$cssContent = str_replace('/sistema_saao/contratos/img/agua.jpeg', $watermark_path, $cssContent);

// Retornar solo la estructura HTML sin el contenido
echo <<<HTML
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
    {{CONTENIDO}}
    <script>
        // Forzar la carga de la imagen de marca de agua antes de imprimir
        window.addEventListener('beforeprint', function() {
            var watermark = new Image();
            watermark.src = '{$watermark_path}';
            // Esperar a que la imagen se cargue completamente
            watermark.onload = function() {
                // La imagen ya está cargada, se puede imprimir
                console.log('Marca de agua cargada correctamente');
            };
            watermark.onerror = function() {
                // En caso de error, continuar con la impresión
                console.log('No se pudo cargar la marca de agua, continuando con la impresión');
            };
        });
    </script>
</body>
</html>
HTML;
?>