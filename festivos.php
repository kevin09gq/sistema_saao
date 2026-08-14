<?php

require_once 'conexion/conexion.php';



header('Content-Type: application/json; charset=utf-8');

$sql = "
    SELECT
        id_nomina_relicario,
        numero_semana,
        nomina_relicario
    FROM nomina_relicario
    ORDER BY anio DESC, numero_semana DESC
";

$resultado = $conexion->query($sql);

if (!$resultado) {
    echo json_encode([
        'resultado' => false,
        'mensaje' => $conexion->error
    ]);
    exit;
}

$empleados = [];

while ($fila = $resultado->fetch_assoc()) {

    $json = json_decode($fila['nomina_relicario'], true);

    if (
        !isset($json['departamentos']) ||
        !is_array($json['departamentos'])
    ) {
        continue;
    }

    foreach ($json['departamentos'] as $departamento) {

        if (
            !isset($departamento['empleados']) ||
            !is_array($departamento['empleados'])
        ) {
            continue;
        }

        foreach ($departamento['empleados'] as $empleado) {

            if (
                isset($empleado['dias_extra']) &&
                $empleado['dias_extra'] > 0
            ) {

                $empleados[] = [
                    'id_nomina_relicario' => $fila['id_nomina_relicario'],
                    'numero_semana' => $fila['numero_semana'],
                    'nombre' => $empleado['nombre'] ?? ''
                ];
            }
        }
    }
}

echo json_encode([
    'resultado' => true,
    'empleados' => $empleados
], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);