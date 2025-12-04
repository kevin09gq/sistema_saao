<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $json = $_POST['json'] ?? '';
    if ($json) {
        $contenido = "window.rangosHorasJson = " . $json . ";";
        file_put_contents("../../nomina/jsPrueba2/rangos_horas.js", $contenido);
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => 'No hay datos']);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Método no permitido']);
}
