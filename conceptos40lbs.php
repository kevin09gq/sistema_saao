<?php


require_once 'conexion/conexion.php'; // Tu archivo de conexión


$sql = "
    SELECT 
        id_nomina_40lbs,
        nomina_40lbs
    FROM nomina_40lbs
";

$resultado = mysqli_query($conexion, $sql);


while ($fila = mysqli_fetch_assoc($resultado)) {

    $json = json_decode($fila['nomina_40lbs'], true);

    if (
        !$json ||
        !isset($json['departamentos'])
    ) {
        continue;
    }

    $totalPercepciones = 0;
    $totalDeducciones = 0;

    foreach ($json['departamentos'] as $departamento) {

        // Igual que tu JS
        if (($departamento['editar'] ?? false) !== true) {
            continue;
        }

        foreach (($departamento['empleados'] ?? []) as $empleado) {

            if (($empleado['mostrar'] ?? true) === false) {
                continue;
            }

            /*
            ==========================
            PERCEPCIONES
            ==========================
            */

            $totalPercepciones += floatval(
                $empleado['sueldo_neto'] ?? 0
            );

            $totalPercepciones += floatval(
                $empleado['incentivo'] ?? 0
            );

            $totalPercepciones += floatval(
                $empleado['sueldo_extra_total'] ?? 0
            );

            /*
            ==========================
            DEDUCCIONES DIRECTAS
            ==========================
            */

            $deducciones = [
                'permiso',
                'inasistencia',
                'uniformes',
                'checador',
                'prestamo',
                'tarjeta',
                'fa_gafet_cofia'
            ];

            foreach ($deducciones as $campo) {

                $totalDeducciones += floatval(
                    $empleado[$campo] ?? 0
                );
            }

            /*
            ==========================
            ISR / IMSS / INFONAVIT
            ==========================
            */

            foreach (($empleado['conceptos'] ?? []) as $concepto) {

                $codigo = strval(
                    $concepto['codigo'] ?? ''
                );

                if (in_array($codigo, [
                    '45',
                    '52',
                    '107',
                    '16'
                ])) {

                    $totalDeducciones += floatval(
                        $concepto['resultado'] ?? 0
                    );
                }
            }
        }
    }

    $totalNeto = round(
        $totalPercepciones - $totalDeducciones
    );

    $stmt = mysqli_prepare(
        $conexion,
        "UPDATE nomina_40lbs
         SET total_percepciones = ?,
             total_deducciones = ?,
             total_neto = ?
         WHERE id_nomina_40lbs = ?"
    );

    mysqli_stmt_bind_param(
        $stmt,
        "dddi",
        $totalPercepciones,
        $totalDeducciones,
        $totalNeto,
        $fila['id_nomina_40lbs']
    );

    mysqli_stmt_execute($stmt);

    echo "Nomina {$fila['id_nomina_40lbs']} actualizada<br>";
}

echo "<hr>Proceso terminado";
