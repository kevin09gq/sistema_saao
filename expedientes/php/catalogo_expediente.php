<?php
require_once __DIR__ . "/../../conexion/conexion.php";
/** @var mysqli $conexion */

header('Content-Type: application/json');

$accion = $_GET['accion'] ?? $_POST['accion'] ?? '';

switch ($accion) {
    case 'listar':
        listarCatalogo();
        break;
    case 'guardar':
        guardarCampo();
        break;
    case 'eliminar':
        eliminarCampo();
        break;
    case 'toggleActivo':
        toggleActivo();
        break;
    default:
        echo json_encode(['exito' => false, 'mensaje' => 'Acción no válida']);
}

function listarCatalogo()
{
    global $conexion;
    $soloActivos = isset($_GET['soloActivos']) && $_GET['soloActivos'] === '1';

    $sql = "SELECT id_expediente, nombre, tipo_dato, historial, activo 
            FROM catalogo_expediente ";
    if ($soloActivos) {
        $sql .= "WHERE activo = 1 ";
    }
    $sql .= "ORDER BY nombre ASC";

    $resultado = $conexion->query($sql);
    $campos = [];

    if ($resultado && $resultado->num_rows > 0) {
        while ($row = $resultado->fetch_assoc()) {
            $campos[] = [
                'id_expediente' => (int)$row['id_expediente'],
                'nombre' => $row['nombre'],
                'tipo_dato' => $row['tipo_dato'],
                'tipo_dato_etiqueta' => obtenerEtiquetaTipo($row['tipo_dato']),
                'historial' => (bool)$row['historial'],
                'activo' => (bool)$row['activo']
            ];
        }
    }

    echo json_encode(['exito' => true, 'datos' => $campos], JSON_UNESCAPED_UNICODE);
}

function obtenerEtiquetaTipo($tipoStr)
{
    $etiquetasMap = [
        'BOOLEAN' => 'Sí / No',
        'DECIMAL' => 'Número Decimal',
        'TEXT'    => 'Texto',
        'DATE'    => 'Fecha Completa',
        'YEAR'    => 'Año'
    ];
    $tipos = array_filter(explode(',', (string)$tipoStr));
    if (empty($tipos)) {
        return 'Sí / No';
    }
    $res = [];
    foreach ($tipos as $t) {
        $t = trim($t);
        if ($t === 'BOOLEAN') continue; // Todos tienen Sí/No implícito
        $res[] = $etiquetasMap[$t] ?? $t;
    }
    return !empty($res) ? 'Sí / No + ' . implode(', ', $res) : 'Sí / No';
}

function guardarCampo()
{
    global $conexion;

    $idExpediente = isset($_POST['id_expediente']) ? (int)$_POST['id_expediente'] : 0;
    $nombre = trim($_POST['nombre'] ?? '');
    $tipoDato = trim($_POST['tipo_dato'] ?? '');
    $historial = isset($_POST['historial']) ? (bool)$_POST['historial'] : false;

    if (empty($nombre)) {
        echo json_encode(['exito' => false, 'mensaje' => 'El nombre del campo es obligatorio']);
        return;
    }

    $tiposValidos = ['BOOLEAN', 'DECIMAL', 'TEXT', 'DATE', 'YEAR'];
    $arrTipos = array_filter(array_map('trim', explode(',', $tipoDato)));

    foreach ($arrTipos as $t) {
        if (!in_array($t, $tiposValidos)) {
            echo json_encode(['exito' => false, 'mensaje' => 'Tipo de dato no válido: ' . $t]);
            return;
        }
    }

    // Normalizar tipos como string separado por comas
    $tipoDatoStr = implode(',', $arrTipos);

    $historialInt = $historial ? 1 : 0;

    if ($idExpediente > 0) {
        $stmt = $conexion->prepare("UPDATE catalogo_expediente 
            SET nombre = ?, tipo_dato = ?, historial = ? 
            WHERE id_expediente = ?");
        $stmt->bind_param("ssii", $nombre, $tipoDatoStr, $historialInt, $idExpediente);
        $mensaje = 'Campo actualizado correctamente';
    } else {
        $stmt = $conexion->prepare("INSERT INTO catalogo_expediente 
            (nombre, tipo_dato, historial, activo) 
            VALUES (?, ?, ?, 1)");
        $stmt->bind_param("ssi", $nombre, $tipoDatoStr, $historialInt);
        $mensaje = 'Campo agregado correctamente';
    }

    if ($stmt->execute()) {
        echo json_encode(['exito' => true, 'mensaje' => $mensaje]);
    } else {
        echo json_encode(['exito' => false, 'mensaje' => 'Error al guardar: ' . $conexion->error]);
    }
    $stmt->close();
}

function eliminarCampo()
{
    global $conexion;

    $idExpediente = isset($_POST['id_expediente']) ? (int)$_POST['id_expediente'] : 0;
    if ($idExpediente <= 0) {
        echo json_encode(['exito' => false, 'mensaje' => 'ID no válido']);
        return;
    }

    $stmt = $conexion->prepare("DELETE FROM catalogo_expediente WHERE id_expediente = ?");
    $stmt->bind_param("i", $idExpediente);

    if ($stmt->execute()) {
        echo json_encode(['exito' => true, 'mensaje' => 'Campo eliminado correctamente']);
    } else {
        echo json_encode(['exito' => false, 'mensaje' => 'No se puede eliminar: tiene registros asociados']);
    }
    $stmt->close();
}

function toggleActivo()
{
    global $conexion;

    $idExpediente = isset($_POST['id_expediente']) ? (int)$_POST['id_expediente'] : 0;
    if ($idExpediente <= 0) {
        echo json_encode(['exito' => false, 'mensaje' => 'ID no válido']);
        return;
    }

    $stmt = $conexion->prepare("UPDATE catalogo_expediente SET activo = NOT activo WHERE id_expediente = ?");
    $stmt->bind_param("i", $idExpediente);

    if ($stmt->execute()) {
        echo json_encode(['exito' => true, 'mensaje' => 'Estado actualizado']);
    } else {
        echo json_encode(['exito' => false, 'mensaje' => 'Error al actualizar estado']);
    }
    $stmt->close();
}
