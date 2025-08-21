<?php
// Recibe los IDs de empleados seleccionados por POST
date_default_timezone_set('America/Mexico_City');
$ids = isset($_POST['ids']) ? $_POST['ids'] : [];
if (!is_array($ids)) {
    $ids = explode(',', $ids);
}
if (empty($ids)) {
    echo '<div style="text-align:center;margin-top:2em;">No se recibieron empleados seleccionados.<br><a href="../index.php">Volver</a></div>';
    exit;
}
// Conexión a la base de datos
include_once("../php/obtenerEmpleados.php"); // Debes tener una función para obtener empleados por IDs
function obtenerEmpleadosPorIds($ids) {
    // Implementa esta función en obtenerEmpleados.php o aquí
    // Debe devolver un array de empleados con los datos necesarios
    // Ejemplo:
    // return [ [ 'id_empleado' => 1, 'nombre' => '...', ... ], ... ];
    return [];
}
$empleados = obtenerEmpleadosPorIds($ids);
?><!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vista de Gafetes</title>
    <link rel="stylesheet" href="../css/estilos.css">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body { background: white; }
        @media print {
            .no-print { display: none !important; }
        }
    </style>
</head>
<body>
    <div class="container-fluid mt-3">
        <div class="no-print mb-3 text-end">
            <a href="../index.php" class="btn btn-secondary">Volver</a>
            <button class="btn btn-primary" onclick="window.print()"><i class="bi bi-printer"></i> Imprimir</button>
        </div>
        <div id="contenidoGafetes">
            <!-- Aquí se generan los gafetes (frente y atrás) -->
            <?php
            // Aquí deberías copiar la lógica de generación de gafetes (frente y atrás) que tienes en JS, pero en PHP
            // Por ahora, solo muestro un ejemplo de estructura:
            echo '<div class="gafetes-container">';
            foreach ($empleados as $empleado) {
                echo '<div class="gafete">';
                echo '<div style="padding:1em;text-align:center;">Gafete de ' . htmlspecialchars($empleado['nombre']) . '</div>';
                echo '</div>';
            }
            echo '</div>';
            ?>
        </div>
    </div>
</body>
</html> 