<?php
header('Content-Type: application/json');
include("../../conexion/conexion.php");

function normalizarColor($color) {
    $color = trim((string)$color);
    if ($color === '') return null;

    // Hex: #RGB o #RRGGBB
    if (preg_match('/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/', $color)) {
        return strtoupper($color);
    }

    // RGB: rgb(r,g,b)
    if (preg_match('/^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i', $color, $m)) {
        $r = (int)$m[1];
        $g = (int)$m[2];
        $b = (int)$m[3];
        if ($r < 0 || $r > 255 || $g < 0 || $g > 255 || $b < 0 || $b > 255) {
            return false;
        }
        return "rgb($r, $g, $b)";
    }

    return false;
}

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Método no permitido']);
        exit;
    }

    $idArea = isset($_POST['id_area']) ? (int)$_POST['id_area'] : 0;
    // Compatibilidad:
    // - color_fondo (nuevo) o color (legacy)
    // - color_texto (nuevo)
    $colorFondoRaw = $_POST['color_fondo'] ?? ($_POST['color'] ?? '');
    $colorTextoRaw = $_POST['color_texto'] ?? '';

    if ($idArea <= 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'id_area inválido']);
        exit;
    }

    // Verificar qué columnas existen
    $tieneColores = false;
    $coloresColumn = $conexion->query("SHOW COLUMNS FROM areas LIKE 'colores'");
    if ($coloresColumn && $coloresColumn->num_rows > 0) {
        $tieneColores = true;
    }

    $tieneColoresTexto = false;
    $coloresTextoColumn = $conexion->query("SHOW COLUMNS FROM areas LIKE 'colores_texto'");
    if ($coloresTextoColumn && $coloresTextoColumn->num_rows > 0) {
        $tieneColoresTexto = true;
    }

    if (!$tieneColores && !$tieneColoresTexto) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'message' => "No existen columnas de colores en 'areas'. Ejecuta: ALTER TABLE areas ADD COLUMN colores VARCHAR(20) DEFAULT NULL AFTER logo_area;"
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $colorFondo = normalizarColor($colorFondoRaw);
    if ($colorFondo === false) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Color de fondo inválido. Usa formato #RRGGBB/#RGB o rgb(r,g,b).'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $colorTexto = normalizarColor($colorTextoRaw);
    if ($colorTexto === false) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Color de texto inválido. Usa formato #RRGGBB/#RGB o rgb(r,g,b).'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Preparar UPDATE dinámico (soporta NULL)
    $setParts = [];
    $types = '';
    $params = [];

    if ($tieneColores) {
        if ($colorFondo === null) {
            $setParts[] = "colores = NULL";
        } else {
            $setParts[] = "colores = ?";
            $types .= 's';
            $params[] = $colorFondo;
        }
    }

    if ($tieneColoresTexto) {
        if ($colorTexto === null) {
            $setParts[] = "colores_texto = NULL";
        } else {
            $setParts[] = "colores_texto = ?";
            $types .= 's';
            $params[] = $colorTexto;
        }
    } else {
        // Si el frontend manda color_texto pero la columna no existe, avisar claro
        if (trim((string)$colorTextoRaw) !== '') {
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'message' => "La columna 'colores_texto' no existe en 'areas'. Ejecuta: ALTER TABLE areas ADD COLUMN colores_texto VARCHAR(20) DEFAULT NULL AFTER colores;"
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }

    if (count($setParts) === 0) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'No hay datos para actualizar.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $sql = "UPDATE areas SET " . implode(', ', $setParts) . " WHERE id_area = ?";
    $types .= 'i';
    $params[] = $idArea;

    $stmt = $conexion->prepare($sql);
    if (!$stmt) {
        throw new Exception("Error preparando consulta: " . $conexion->error);
    }

    // bind_param dinámico (requiere referencias)
    $bindParams = [];
    $bindParams[] = $types;
    foreach ($params as $k => $v) {
        $bindParams[] = &$params[$k];
    }
    call_user_func_array([$stmt, 'bind_param'], $bindParams);

    if (!$stmt->execute()) {
        throw new Exception("Error al guardar: " . $stmt->error);
    }

    echo json_encode([
        'success' => true,
        'data' => [
            'id_area' => $idArea,
            'color_fondo' => $tieneColores ? $colorFondo : null,
            'color_texto' => $tieneColoresTexto ? $colorTexto : null
        ]
    ], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}

$conexion->close();
?>
