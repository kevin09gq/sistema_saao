<?php
// contratos/php/plantillas_fs.php
// CRUD de plantillas basado en archivos .html dentro de contratos/plantillas/
// Acciones: listar, obtener, guardar, eliminar, renombrar

header('Content-Type: application/json; charset=utf-8');

$baseDir = dirname(__DIR__, 1); // contratos/
$plantillasDir = $baseDir . DIRECTORY_SEPARATOR . 'plantillas';

if (!is_dir($plantillasDir)) {
    mkdir($plantillasDir, 0777, true);
}

$accion = $_GET['accion'] ?? $_POST['accion'] ?? '';

function ok($data = []) {
    echo json_encode(['ok' => true, 'data' => $data], JSON_UNESCAPED_UNICODE);
    exit;
}

function errorRes($msg, $code = 400) {
    http_response_code($code);
    echo json_encode(['ok' => false, 'error' => $msg], JSON_UNESCAPED_UNICODE);
    exit;
}

function sanitizeName($name) {
    // Permitir letras, números, espacios, guiones, guiones bajos, paréntesis y puntos. Forzamos .html
    $name = trim($name);
    if ($name === '') return '';
    // Ahora permitimos espacios y paréntesis en el nombre
    if (!preg_match('/^[A-Za-z0-9 _\-()áéíóúÁÉÍÓÚñÑ]+(\.html)?$/u', $name)) {
        return '';
    }
    // Compatibilidad PHP < 8: usar substr_compare en lugar de str_ends_with
    if (substr_compare($name, '.html', -5) !== 0) {
        $name .= '.html';
    }
    return $name;
}

switch ($accion) {
    case 'listar':
        $files = glob($plantillasDir . DIRECTORY_SEPARATOR . '*.html') ?: [];
        $list = [];
        foreach ($files as $f) {
            $list[] = [
                'nombre' => basename($f),
                'tamano' => filesize($f),
                'modificado' => filemtime($f),
            ];
        }
        ok($list);
        break;

    case 'obtener':
        $nombre = $_GET['nombre'] ?? '';
        $nombre = sanitizeName($nombre);
        if ($nombre === '') errorRes('Nombre de plantilla inválido');
        $path = $plantillasDir . DIRECTORY_SEPARATOR . $nombre;
        if (!file_exists($path)) errorRes('Plantilla no encontrada', 404);
        $contenido = file_get_contents($path);
        ok(['nombre' => $nombre, 'contenido' => $contenido]);
        break;

    case 'guardar':
        $nombre = $_POST['nombre'] ?? '';
        $contenido = $_POST['contenido'] ?? '';
        $nombre = sanitizeName($nombre);
        if ($nombre === '') errorRes('Nombre de plantilla inválido');
        $path = $plantillasDir . DIRECTORY_SEPARATOR . $nombre;
        // Evitar BOM y normalizar saltos de línea
        $contenido = str_replace(["\r\n", "\r"], "\n", $contenido);
        if (file_put_contents($path, $contenido) === false) {
            errorRes('No se pudo guardar la plantilla');
        }
        ok(['nombre' => $nombre]);
        break;

    case 'eliminar':
        $nombre = $_POST['nombre'] ?? '';
        $nombre = sanitizeName($nombre);
        if ($nombre === '') errorRes('Nombre de plantilla inválido');
        $path = $plantillasDir . DIRECTORY_SEPARATOR . $nombre;
        if (!file_exists($path)) errorRes('Plantilla no encontrada', 404);
        if (!unlink($path)) errorRes('No se pudo eliminar la plantilla');
        ok(['nombre' => $nombre]);
        break;

    case 'renombrar':
        $nombre = $_POST['nombre'] ?? '';
        $nuevoNombre = $_POST['nuevoNombre'] ?? '';
        $nombre = sanitizeName($nombre);
        $nuevoNombre = sanitizeName($nuevoNombre);
        
        if ($nombre === '' || $nuevoNombre === '') errorRes('Nombre de plantilla inválido');
        
        $pathOriginal = $plantillasDir . DIRECTORY_SEPARATOR . $nombre;
        $pathNuevo = $plantillasDir . DIRECTORY_SEPARATOR . $nuevoNombre;
        
        if (!file_exists($pathOriginal)) errorRes('Plantilla no encontrada', 404);
        if (file_exists($pathNuevo)) errorRes('Ya existe una plantilla con ese nombre');
        
        if (!rename($pathOriginal, $pathNuevo)) {
            errorRes('No se pudo renombrar la plantilla');
        }
        
        ok(['nombre' => $nombre, 'nuevoNombre' => $nuevoNombre]);
        break;

    default:
        errorRes('Acción no válida');
}