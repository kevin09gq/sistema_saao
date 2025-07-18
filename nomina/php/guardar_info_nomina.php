<?php
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $json = file_get_contents('php://input');
    $ruta = '../js/info_nomina.json'; // Ajusta la ruta si es necesario

    if (file_put_contents($ruta, $json)) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => 'No se pudo guardar el archivo']);
    }
} else {
    echo json_encode(['success' => false, 'error' => 'Método no permitido']);
} 