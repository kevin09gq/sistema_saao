<?php

require_once 'conexion/conexion.php'; // Tu archivo de conexión

$sql = "
    SELECT 
        id_nomina_confianza,
        nomina
    FROM nomina_confianza
";

$resultado = mysqli_query($conexion, $sql);

while ($fila = mysqli_fetch_assoc($resultado)) {

    $json = json_decode($fila['nomina'], true);

    if (!$json || !isset($json['departamentos'])) {
        continue;
    }

    $totalPercepciones = 0;
    $totalDeducciones = 0;

    foreach ($json['departamentos'] as $departamento) {

        if (!isset($departamento['empleados'])) {
            continue;
        }

        foreach ($departamento['empleados'] as $empleado) {

            // Ignorar empleados ocultos
            if (isset($empleado['mostrar']) && $empleado['mostrar'] === false) {
                continue;
            }

            /*
            |--------------------------------------------------------------------------
            | PERCEPCIONES
            |--------------------------------------------------------------------------
            */

            $totalPercepciones += floatval($empleado['salario_semanal'] ?? 0);

            $totalPercepciones += floatval($empleado['sueldo_extra_total'] ?? 0);

            /*
            |--------------------------------------------------------------------------
            | DEDUCCIONES DIRECTAS
            |--------------------------------------------------------------------------
            */

            $deduccionesDirectas = [
                'retardos',
                'permiso',
                'inasistencia',
                'uniformes',
                'checador',
                'prestamo',
                'tarjeta',
                'fa_gafet_cofia'
            ];

            foreach ($deduccionesDirectas as $campo) {
                $totalDeducciones += floatval($empleado[$campo] ?? 0);
            }

            /*
            |--------------------------------------------------------------------------
            | CONCEPTOS SAT
            | 45 = ISR
            | 52 = IMSS
            | 107 = Ajuste al Sub
            | 16 = Infonavit
            |--------------------------------------------------------------------------
            */

            if (!empty($empleado['conceptos']) && is_array($empleado['conceptos'])) {

                foreach ($empleado['conceptos'] as $concepto) {

                    $codigo = strval($concepto['codigo'] ?? '');

                    if (in_array($codigo, ['45', '52', '107', '16'])) {

                        $totalDeducciones += floatval(
                            $concepto['resultado'] ?? 0
                        );
                    }
                }
            }
        }
    }

    $totalNeto = round($totalPercepciones - $totalDeducciones);

    $stmt = mysqli_prepare(
        $conexion,
        "UPDATE nomina_confianza
         SET total_percepciones = ?,
             total_deducciones = ?,
             total_neto = ?
         WHERE id_nomina_confianza = ?"
    );

    mysqli_stmt_bind_param(
        $stmt,
        "dddi",
        $totalPercepciones,
        $totalDeducciones,
        $totalNeto,
        $fila['id_nomina_confianza']
    );

    mysqli_stmt_execute($stmt);

    echo "Nomina ID {$fila['id_nomina_confianza']} actualizada.<br>";
}

echo "<hr>";
echo "Proceso terminado correctamente.";

?>