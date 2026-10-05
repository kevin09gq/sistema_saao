<?php
/**
 * Endpoint para gestionar los colores de asistencia por sexo
 * Acciones: obtenerColores | guardarColores | instalarTabla
 */

require_once __DIR__ . '/../../conexion/conexion.php';
require_once __DIR__ . '/../../public/php/verificarSesion.php';

verificarSesion();

header('Content-Type: application/json');

$action = $_POST['action'] ?? '';

// ─────────────────────────────────────────────────────────────
// Instalar la tabla si no existe (se llama automáticamente)
// ─────────────────────────────────────────────────────────────
function instalarTablaColores($conexion) {
    $sql = "CREATE TABLE IF NOT EXISTS asistencia_colores (
        id        INT AUTO_INCREMENT PRIMARY KEY,
        sexo      ENUM('M', 'F') NOT NULL UNIQUE,
        color_hex VARCHAR(7)     NOT NULL
    )";
    mysqli_query($conexion, $sql);

    // Insertar valores por defecto si la tabla está vacía
    $check = mysqli_query($conexion, "SELECT COUNT(*) as total FROM asistencia_colores");
    $row = mysqli_fetch_assoc($check);
    if ($row['total'] == 0) {
        mysqli_query($conexion, "INSERT INTO asistencia_colores (sexo, color_hex) VALUES ('M', '#D6EAF8'), ('F', '#F5B7B1')");
    }
}

// Asegurar que la tabla exista siempre
instalarTablaColores($conexion);

switch ($action) {

    // ── Obtener los colores actuales ──
    case 'obtenerColores':
        $resultado = mysqli_query($conexion, "SELECT sexo, color_hex FROM asistencia_colores ORDER BY sexo");
        $colores = ['M' => '#D6EAF8', 'F' => '#F5B7B1'];
        while ($fila = mysqli_fetch_assoc($resultado)) {
            $colores[$fila['sexo']] = $fila['color_hex'];
        }
        echo json_encode(['success' => true, 'colores' => $colores]);
        break;

    // ── Guardar nuevos colores ──
    case 'guardarColores':
        $colorM = trim($_POST['color_M'] ?? '');
        $colorF = trim($_POST['color_F'] ?? '');

        // Validar formato HEX (#RRGGBB)
        if (!preg_match('/^#[0-9A-Fa-f]{6}$/', $colorM) || !preg_match('/^#[0-9A-Fa-f]{6}$/', $colorF)) {
            echo json_encode(['success' => false, 'message' => 'Formato de color inválido.']);
            break;
        }

        $stmtM = mysqli_prepare($conexion, "INSERT INTO asistencia_colores (sexo, color_hex) VALUES ('M', ?) ON DUPLICATE KEY UPDATE color_hex = VALUES(color_hex)");
        mysqli_stmt_bind_param($stmtM, 's', $colorM);
        $okM = mysqli_stmt_execute($stmtM);

        $stmtF = mysqli_prepare($conexion, "INSERT INTO asistencia_colores (sexo, color_hex) VALUES ('F', ?) ON DUPLICATE KEY UPDATE color_hex = VALUES(color_hex)");
        mysqli_stmt_bind_param($stmtF, 's', $colorF);
        $okF = mysqli_stmt_execute($stmtF);

        if ($okM && $okF) {
            echo json_encode(['success' => true, 'message' => 'Colores guardados correctamente.']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Error al guardar los colores.']);
        }
        break;

    default:
        echo json_encode(['success' => false, 'message' => 'Acción no reconocida.']);
        break;
}
