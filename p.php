<?php

require_once 'conexion/conexion.php';


//====================================================
// MIGRACION NOMINA RELICARIO
//====================================================

try {

    $conexion->begin_transaction();


    //================================================
    // OBTENER EMPLEADOS DE LA EMPRESA
    //================================================

    $empleadosBD = obtenerEmpleadosEmpresa(
        $conexion,
        1
    );


    //================================================
    // OBTENER NOMINAS A MIGRAR
    //================================================

    $sql = "

        SELECT
            id_nomina_pilar,
            nomina_pilar

        FROM nomina_pilar

    ";

    $stmt = $conexion->prepare($sql);

    $stmt->execute();

    $resultado = $stmt->get_result();

    $nominas = $resultado->fetch_all(
        MYSQLI_ASSOC
    );


    //================================================
    // RECORRER NOMINAS
    //================================================

    foreach ($nominas as $nomina) {


        //============================================
        // DECODIFICAR JSON
        //============================================

        $json = json_decode(
            $nomina['nomina_pilar'],
            true
        );


        if (!$json) {

            continue;

        }


        //============================================
        // CONVERTIR NOMINA
        //============================================

        $jsonNuevo = convertirNomina(
            $json,
            $empleadosBD
        );


        //============================================
        // CONVERTIR JSON
        //============================================

        $jsonGuardar = json_encode(
            $jsonNuevo,
            JSON_UNESCAPED_UNICODE
        );


        //============================================
        // ACTUALIZAR NOMINA
        //============================================

        $sqlUpdate = "

            UPDATE nomina_pilar

            SET nomina_pilar = ?

            WHERE id_nomina_pilar = ?

        ";

        $stmtUpdate = $conexion->prepare(
            $sqlUpdate
        );


        $idNomina =
            $nomina['id_nomina_pilar'];


        $stmtUpdate->bind_param(
            "si",
            $jsonGuardar,
            $idNomina
        );


        $stmtUpdate->execute();

    }


    //================================================
    // CONFIRMAR
    //================================================

    $conexion->commit();


    echo "Migración de Pilar completada correctamente";


} catch (Exception $e) {


    //================================================
    // CANCELAR CAMBIOS
    //================================================

    $conexion->rollback();


    echo "Error: " . $e->getMessage();

}


//====================================================
// OBTENER EMPLEADOS EMPRESA
//====================================================

function obtenerEmpleadosEmpresa(
    $conexion,
    $id_empresa
) {

    $sql = "

        SELECT

            id_empleado,
            clave_empleado,
            biometrico

        FROM info_empleados

        WHERE id_empresa = ?

    ";


    $stmt = $conexion->prepare($sql);


    $stmt->bind_param(
        "i",
        $id_empresa
    );


    $stmt->execute();


    $resultado =
        $stmt->get_result();


    $empleados = [];


    //================================================
    // CREAR INDICE POR CLAVE
    //================================================

    while (
        $row = $resultado->fetch_assoc()
    ) {


        $clave = trim(
            (string)$row['clave_empleado']
        );


        $empleados[$clave] = [

            'id_empleado' =>
                $row['id_empleado'],

            'biometrico' =>
                $row['biometrico']

        ];

    }


    return $empleados;

}


//====================================================
// CONVERTIR NOMINA
//====================================================

function convertirNomina(
    $json,
    $empleadosBD
) {


    //================================================
    // AGREGAR AÑO
    //================================================

    if (!isset($json['anio'])) {

        $json['anio'] = "2026";

    }


    //================================================
    // RECORRER DEPARTAMENTOS
    //================================================

    if (
        isset($json['departamentos']) &&
        is_array($json['departamentos'])
    ) {


        foreach (
            $json['departamentos']
            as &$departamento
        ) {


            //========================================
            // CAMBIAR COLOR REPORTE
            //========================================

            if (
                isset(
                    $departamento['color_reporte'][0]['color']
                )
            ) {


                $departamento['color_reporte'] = [

                    $departamento['color_reporte'][0]['color']

                ];

            }


            //========================================
            // RECORRER EMPLEADOS
            //========================================

            if (
                isset($departamento['empleados']) &&
                is_array($departamento['empleados'])
            ) {


                foreach (
                    $departamento['empleados']
                    as &$empleado
                ) {


                    convertirEmpleado(
                        $empleado,
                        $empleadosBD
                    );

                }


                unset($empleado);

            }

        }


        unset($departamento);

    }


    return $json;

}


//====================================================
// CONVERTIR EMPLEADO
//====================================================

function convertirEmpleado(
    &$empleado,
    $empleadosBD
) {


    //================================================
    // OBTENER ID EMPLEADO MEDIANTE CLAVE
    //================================================

    if (isset($empleado['clave'])) {


        $clave = trim(
            (string)$empleado['clave']
        );


        if (
            isset($empleadosBD[$clave])
        ) {


            $empleado['id_empleado'] =

                $empleadosBD[$clave]['id_empleado'];

        }

    }


    //================================================
    // CAMBIAR BIOMETRICO
    //================================================

    if (
        array_key_exists(
            'biometrico',
            $empleado
        )
    ) {


        $empleado['id_biometrico'] =

            $empleado['biometrico'];


        unset(
            $empleado['biometrico']
        );

    }


    //================================================
    // AGREGAR DIA EN REGISTROS
    //================================================

    if (
        isset($empleado['registros']) &&
        is_array($empleado['registros'])
    ) {


        foreach (
            $empleado['registros']
            as &$registro
        ) {


            if (
                !isset($registro['dia']) &&
                isset($registro['fecha'])
            ) {


                $registro['dia'] =

                    obtenerDia(
                        $registro['fecha']
                    );

            }

        }


        unset($registro);

    }


    //================================================
    // ELIMINAR DIAS EXTRA
    //================================================

    if (
        array_key_exists(
            'dias_extra',
            $empleado
        )
    ) {


        unset(
            $empleado['dias_extra']
        );

    }


    //================================================
    // ELIMINAR TIPO HORARIO
    //================================================

    if (
        array_key_exists(
            'tipo_horario',
            $empleado
        )
    ) {


        unset(
            $empleado['tipo_horario']
        );

    }


    //================================================
    // ELIMINAR TIPO HISTORIAL INASISTENCIAS
    //================================================

    if (
        isset(
            $empleado['historial_inasistencias']
        ) &&
        is_array(
            $empleado['historial_inasistencias']
        )
    ) {


        foreach (
            $empleado['historial_inasistencias']
            as &$inasistencia
        ) {


            if (
                isset(
                    $inasistencia['tipo']
                )
            ) {


                unset(
                    $inasistencia['tipo']
                );

            }

        }


        unset($inasistencia);

    }


    //================================================
    // ELIMINAR EDITADO HISTORIAL RETARDOS
    //================================================

    if (
        isset(
            $empleado['historial_retardos']
        ) &&
        is_array(
            $empleado['historial_retardos']
        )
    ) {


        foreach (
            $empleado['historial_retardos']
            as &$retardo
        ) {


            if (
                isset(
                    $retardo['editado']
                )
            ) {


                unset(
                    $retardo['editado']
                );

            }

        }


        unset($retardo);

    }

}


//====================================================
// OBTENER DIA
//====================================================

function obtenerDia(
    $fecha
) {


    //================================================
    // NORMALIZAR FECHA
    //================================================

    $fecha = str_replace(
        "/",
        "-",
        $fecha
    );


    //================================================
    // CREAR FECHA
    //================================================

    $fechaObj = new DateTime(
        $fecha
    );


    //================================================
    // DIAS DE LA SEMANA
    //================================================

    $dias = [

        "domingo",
        "lunes",
        "martes",
        "miércoles",
        "jueves",
        "viernes",
        "sábado"

    ];


    //================================================
    // DEVOLVER DIA
    //================================================

    return $dias[
        $fechaObj->format("w")
    ];

}

?>