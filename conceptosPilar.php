<?php
require_once 'conexion/conexion.php';

$resultado = mysqli_query($conexion,"
    SELECT
        id_nomina_pilar,
        nomina_pilar
    FROM nomina_pilar
");

while($fila = mysqli_fetch_assoc($resultado)){

    $json = json_decode($fila['nomina_pilar'], true);

    if(
        !$json ||
        !isset($json['departamentos'])
    ){
        continue;
    }

    $totalPercepciones = 0;
    $totalDeducciones = 0;

    foreach($json['departamentos'] as $departamento){

        foreach(($departamento['empleados'] ?? []) as $empleado){

            if(
                isset($empleado['mostrar']) &&
                $empleado['mostrar'] === false
            ){
                continue;
            }

            /*
            =====================================
            PERCEPCIONES
            =====================================
            */

            $totalPercepciones += floatval(
                $empleado['salario_semanal'] ?? 0
            );

            $totalPercepciones += floatval(
                $empleado['pasaje'] ?? 0
            );

            $totalPercepciones += floatval(
                $empleado['comida'] ?? 0
            );

            $totalPercepciones += floatval(
                $empleado['sueldo_extra_total'] ?? 0
            );

            /*
            =====================================
            DEDUCCIONES DIRECTAS
            =====================================
            */

            $deducciones = [
                'retardos',
                'permiso',
                'inasistencia',
                'uniformes',
                'checador',
                'prestamo',
                'tarjeta',
                'fa_gafet_cofia'
            ];

            foreach($deducciones as $campo){

                $totalDeducciones += floatval(
                    $empleado[$campo] ?? 0
                );
            }

            /*
            =====================================
            ISR / IMSS / INFONAVIT
            =====================================
            */

            foreach(($empleado['conceptos'] ?? []) as $concepto){

                $codigo = strval(
                    $concepto['codigo'] ?? ''
                );

                if(
                    in_array(
                        $codigo,
                        ['45','52','107','16']
                    )
                ){

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
        "UPDATE nomina_pilar
         SET total_percepciones = ?,
             total_deducciones = ?,
             total_neto = ?
         WHERE id_nomina_pilar = ?"
    );

    mysqli_stmt_bind_param(
        $stmt,
        "dddi",
        $totalPercepciones,
        $totalDeducciones,
        $totalNeto,
        $fila['id_nomina_pilar']
    );

    mysqli_stmt_execute($stmt);

    echo "Nomina {$fila['id_nomina_pilar']} actualizada<br>";
}

echo "<hr>Proceso terminado";