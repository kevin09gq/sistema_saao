<?php
header('Content-Type: application/json; charset=UTF-8');

include "../../conexion/conexion.php";

// Leer cuerpo JSON
$raw = file_get_contents("php://input");
$data = json_decode($raw, true);

$id_empresa = isset($data['id_empresa']) ? intval($data['id_empresa']) : 0;
$numero_semana = isset($data['numero_semana']) ? intval($data['numero_semana']) : 0;
$anio = isset($data['anio']) ? intval($data['anio']) : 0;

// Si no se proporciona año, usar el año actual
if ($anio <= 0) {
    $anio = (int)date('Y');
}

if ($id_empresa <= 0 || $numero_semana <= 0) {
    echo json_encode([
        'success' => false,
        'message' => 'Parámetros inválidos'
    ]);
    exit;
}

$sql = $conexion->prepare(
    "SELECT nomina 
     FROM nomina_confianza 
     WHERE id_empresa = ? AND numero_semana = ? AND anio = ?
     ORDER BY id_nomina_confianza DESC
     LIMIT 1"
);

if (!$sql) {
    echo json_encode([
        'success' => false,
        'message' => 'Error al preparar la consulta'
    ]);
    exit;
}

$sql->bind_param("iii", $id_empresa, $numero_semana, $anio);
$sql->execute();
$res = $sql->get_result();
$row = $res->fetch_assoc();
$sql->close();
$conexion->close();

if ($row) {
    // La columna nomina se guarda como LONGTEXT (JSON); devolverla decodificada
    $nominaJson = $row['nomina'];
    $nomina = json_decode($nominaJson, true);
    echo json_encode([
        'success' => true,
        'found' => true,
        'nomina' => $nomina
    ], JSON_UNESCAPED_UNICODE);
} else {
    echo json_encode([
        'success' => true,
        'found' => false
    ]);
}

