<?php

require_once 'conexion/conexion.php';


//====================================================
// MIGRACION NOMINA 40 LBS
//====================================================

try {


    $conexion->begin_transaction();



    // OBTENER EMPLEADOS DE LA EMPRESA

    $empleadosBD = obtenerEmpleadosEmpresa(
        $conexion,
        1
    );




    // OBTENER NOMINA A MIGRAR

    $sql = "

        SELECT 
            id_nomina_40lbs,
            nomina_40lbs

        FROM nomina_40lbs


    ";



    $stmt = $conexion->prepare($sql);


    $stmt->execute();



    $resultado = $stmt->get_result();



    $nominas = $resultado->fetch_all(MYSQLI_ASSOC);






    foreach ($nominas as $nomina) {



        $json = json_decode(
            $nomina['nomina_40lbs'],
            true
        );



        if (!$json) {

            continue;

        }






        $jsonNuevo = convertirNomina(
            $json,
            $empleadosBD
        );






        $jsonGuardar = json_encode(
            $jsonNuevo,
            JSON_UNESCAPED_UNICODE
        );







        $sqlUpdate = "

            UPDATE nomina_40lbs

            SET nomina_40lbs = ?

            WHERE id_nomina_40lbs = ?

        ";



        $stmtUpdate = $conexion->prepare(
            $sqlUpdate
        );



        $idNomina = $nomina['id_nomina_40lbs'];



        $stmtUpdate->bind_param(
            "si",
            $jsonGuardar,
            $idNomina
        );



        $stmtUpdate->execute();



    }






    $conexion->commit();



    echo "Migración completada correctamente";





} catch(Exception $e) {



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




    $resultado = $stmt->get_result();



    $empleados = [];





    while($row = $resultado->fetch_assoc()) {



        $empleados[$row['clave_empleado']] = [


            "id_empleado" => $row['id_empleado'],

            "biometrico" => $row['biometrico']


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



    // AGREGAR AÑO

    if (!isset($json['anio'])) {


        $json['anio'] = "2026";


    }







    foreach ($json['departamentos'] as &$departamento) {





        // CAMBIAR COLOR REPORTE

        if (
            isset($departamento['color_reporte'][0]['color'])
        ) {



            $departamento['color_reporte'] = [


                $departamento['color_reporte'][0]['color']


            ];


        }







        // ELIMINAR EDITAR

        if(isset($departamento['editar'])) {


            unset($departamento['editar']);


        }








        foreach($departamento['empleados'] as &$empleado) {



            convertirEmpleado(
                $empleado,
                $empleadosBD
            );


        }



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





    // OBTENER ID EMPLEADO DESDE BD

    if(isset($empleado['clave'])) {



        $clave = $empleado['clave'];



        if(isset($empleadosBD[$clave])) {



            $empleado['id_empleado'] =

                $empleadosBD[$clave]['id_empleado'];



        }


    }









    // CAMBIAR BIOMETRICO

    if(array_key_exists(
        'biometrico',
        $empleado
    )) {



        $empleado['id_biometrico'] =

            $empleado['biometrico'];



        unset($empleado['biometrico']);



    }









    // AGREGAR DIA EN REGISTROS

    if(isset($empleado['registros'])) {



        foreach($empleado['registros'] as &$registro) {



            if(!isset($registro['dia'])) {



                $registro['dia'] =

                    obtenerDia(
                        $registro['fecha']
                    );



            }



        }



    }









    // ELIMINAR TIPO HISTORIAL INASISTENCIAS

    if(isset($empleado['historial_inasistencias'])) {



        foreach(
            $empleado['historial_inasistencias']
            as &$inasistencia
        ) {



            if(isset($inasistencia['tipo'])) {



                unset($inasistencia['tipo']);



            }



        }



    }



}









//====================================================
// OBTENER DIA
//====================================================

function obtenerDia(
    $fecha
) {



    $fecha = str_replace(
        "/",
        "-",
        $fecha
    );



    $fechaObj = new DateTime(
        $fecha
    );





    $dias = [

        "domingo",

        "lunes",

        "martes",

        "miércoles",

        "jueves",

        "viernes",

        "sábado"

    ];





    return $dias[
        $fechaObj->format("w")
    ];



}


?>