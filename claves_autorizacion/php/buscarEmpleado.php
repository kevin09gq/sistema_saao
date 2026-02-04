<?php
require_once __DIR__ . '/../../config/config.php';
require_once __DIR__ . "/../../conexion/conexion.php";

// Respuesta
function respuestas(int $code, string $titulo, string $mensaje, string $icono, array $data)
{
    http_response_code($code);
    echo json_encode([
        "titulo"  => $titulo,
        "mensaje" => $mensaje,
        "icono"   => $icono,
        "data"    => $data
    ], JSON_UNESCAPED_UNICODE);
}

if (isset($_SESSION["logged_in"])) {

    $buscar = $_GET["buscar"] ?? '';

    $sql = "SELECT
                CONCAT(id_empleado, ' - ',nombre, ' ', ap_paterno, ' ', ap_materno, ' - ', d.nombre_departamento) AS empleado
            FROM info_empleados ie
            INNER JOIN departamentos d ON ie.id_departamento = d.id_departamento
            WHERE clave_empleado LIKE '%{$buscar}%' OR
                  nombre LIKE '%{$buscar}%' OR 
                  ap_paterno LIKE '%$buscar%' OR 
                  ap_materno LIKE '%$buscar%' OR 
                  d.nombre_departamento LIKE '%$buscar%' AND 
                  id_status = 1 
            LIMIT 100";

    $pr = $conexion->prepare($sql);
    $pr->execute();
    $result = $pr->get_result();
    $data = $result->fetch_all(MYSQLI_ASSOC);


    respuestas(200, "datos obtenidos", "Obtenido con exito", "success", $data);
    exit;

} else {
    respuestas(401, "No autenticado", "Debes primero iniciar sesión", "error", []);
    exit;

}