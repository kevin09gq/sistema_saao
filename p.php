<?php

require_once 'conexion/conexion.php';


//====================================================
// MIGRACION NOMINA CONFIANZA
//====================================================

try {

    $conexion->begin_transaction();


    //================================================
    // OBTENER EMPLEADOS DE LAS EMPRESAS
    //================================================

    $empleadosBD = obtenerEmpleadosEmpresas(
        $conexion
    );


    //================================================
    // OBTENER NOMINAS
    //================================================

    $sql = "

        SELECT
            id_nomina_confianza,
            nomina_confianza

        FROM nomina_confianza

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
            $nomina['nomina_confianza'],
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
        // CONVERTIR NUEVAMENTE A JSON
        //============================================

        $jsonGuardar = json_encode(
            $jsonNuevo,
            JSON_UNESCAPED_UNICODE
        );


        //============================================
        // ACTUALIZAR NOMINA
        //============================================

        $sqlUpdate = "

            UPDATE nomina_confianza

            SET nomina_confianza = ?

            WHERE id_nomina_confianza = ?

        ";

        $stmtUpdate = $conexion->prepare(
            $sqlUpdate
        );


        $idNomina =
            $nomina['id_nomina_confianza'];


        $stmtUpdate->bind_param(
            "si",
            $jsonGuardar,
            $idNomina
        );


        $stmtUpdate->execute();

    }


    //================================================
    // CONFIRMAR CAMBIOS
    //================================================

    $conexion->commit();


    echo "Migración de Nomina Confianza completada correctamente";


} catch (Exception $e) {


    //================================================
    // CANCELAR CAMBIOS
    //================================================

    $conexion->rollback();


    echo "Error: " . $e->getMessage();

}


//====================================================
// OBTENER EMPLEADOS DE LAS EMPRESAS
//====================================================

function obtenerEmpleadosEmpresas(
    $conexion
) {

    $sql = "

        SELECT

            id_empleado,
            clave_empleado,
            biometrico,
            id_empresa

        FROM info_empleados

        WHERE id_empresa IN (1, 2)

    ";


    $stmt = $conexion->prepare($sql);

    $stmt->execute();


    $resultado =
        $stmt->get_result();


    $empleados = [];


    //================================================
    // CREAR INDICE POR EMPRESA Y CLAVE
    //================================================

    while (
        $row = $resultado->fetch_assoc()
    ) {


        $clave = trim(
            (string)$row['clave_empleado']
        );


        $idEmpresa =
            (int)$row['id_empresa'];


        $empleados[$idEmpresa][$clave] = [

            'id_empleado' =>
                $row['id_empleado'],

            'biometrico' =>
                $row['biometrico'],

            'id_empresa' =>
                $idEmpresa

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
    // VALIDAR DEPARTAMENTOS
    //================================================

    if (
        !isset($json['departamentos']) ||
        !is_array($json['departamentos'])
    ) {

        return $json;

    }


    //================================================
    // NUEVOS DEPARTAMENTOS
    //================================================

    $nuevosDepartamentos = [];


    //================================================
    // RECORRER DEPARTAMENTOS ORIGINALES
    //================================================

    foreach (
        $json['departamentos']
        as $departamento
    ) {


        //============================================
        // OBTENER ID DEL DEPARTAMENTO
        //============================================

        $idDepartamento =
            isset($departamento['id_departamento'])
                ? (int)$departamento['id_departamento']
                : 0;


        //============================================
        // VALIDAR EMPLEADOS
        //============================================

        if (
            !isset($departamento['empleados']) ||
            !is_array($departamento['empleados'])
        ) {

            continue;

        }


        //============================================
        // OBTENER EMPRESAS DEL COLOR_REPORTE
        //============================================

        $empresasDepartamento =
            obtenerEmpresasColorReporte(
                $departamento
            );


        //============================================
        // CREAR UN DEPARTAMENTO POR EMPRESA
        //============================================

        foreach (
            $empresasDepartamento
            as $empresa
        ) {


            $idEmpresa =
                $empresa['id_empresa'];


            //========================================
            // EMPLEADOS DE ESTA EMPRESA
            //========================================

            $empleadosEmpresa = [];


            foreach (
                $departamento['empleados']
                as $empleado
            ) {


                //====================================
                // ID DEPARTAMENTO DEL EMPLEADO
                //====================================

                $idDepartamentoEmpleado =
                    isset(
                        $empleado['id_departamento']
                    )
                        ? (int)$empleado['id_departamento']
                        : 0;


                //====================================
                // EMPRESA DEL EMPLEADO
                //====================================

                $idEmpresaEmpleado =
                    isset(
                        $empleado['id_empresa']
                    )
                        ? (int)$empleado['id_empresa']
                        : 0;


                //====================================
                // VALIDAR DEPARTAMENTO Y EMPRESA
                //====================================

                if (
                    $idDepartamentoEmpleado !==
                    $idDepartamento
                ) {

                    continue;

                }


                if (
                    $idEmpresaEmpleado !==
                    $idEmpresa
                ) {

                    continue;

                }


                //====================================
                // CONVERTIR EMPLEADO
                //====================================

                convertirEmpleado(
                    $empleado,
                    $empleadosBD
                );


                //====================================
                // AGREGAR EMPLEADO
                //====================================

                $empleadosEmpresa[] =
                    $empleado;

            }


            //========================================
            // SI NO HAY EMPLEADOS NO CREAR
            //========================================

            if (
                count($empleadosEmpresa) === 0
            ) {

                continue;

            }


            //========================================
            // CREAR NUEVO DEPARTAMENTO
            //========================================

            $nuevoDepartamento =
                crearDepartamentoEmpresa(
                    $departamento,
                    $idEmpresa,
                    $empresa['color'],
                    $empleadosEmpresa
                );


            //========================================
            // AGREGAR DEPARTAMENTO
            //========================================

            $nuevosDepartamentos[] =
                $nuevoDepartamento;

        }

    }


    //================================================
    // REEMPLAZAR DEPARTAMENTOS
    //================================================

    $json['departamentos'] =
        $nuevosDepartamentos;


    return $json;

}


//====================================================
// OBTENER EMPRESAS DEL COLOR_REPORTE
//====================================================

function obtenerEmpresasColorReporte(
    $departamento
) {

    $empresas = [];


    //================================================
    // VALIDAR COLOR_REPORTE
    //================================================

    if (
        !isset($departamento['color_reporte']) ||
        !is_array($departamento['color_reporte'])
    ) {

        return $empresas;

    }


    //================================================
    // RECORRER COLORES
    //================================================

    foreach (
        $departamento['color_reporte']
        as $color
    ) {


        if (
            !isset($color['id_empresa'])
        ) {

            continue;

        }


        $idEmpresa =
            (int)$color['id_empresa'];


        $empresas[] = [

            'id_empresa' =>
                $idEmpresa,

            'color' =>
                isset($color['color'])
                    ? $color['color']
                    : ''

        ];

    }


    return $empresas;

}


//====================================================
// CREAR DEPARTAMENTO POR EMPRESA
//====================================================

function crearDepartamentoEmpresa(
    $departamentoOriginal,
    $idEmpresa,
    $color,
    $empleados
) {


    //================================================
    // COPIAR DEPARTAMENTO ORIGINAL
    //================================================

    $nuevoDepartamento =
        $departamentoOriginal;


    //================================================
    // ASIGNAR ID EMPRESA
    //================================================

    $nuevoDepartamento['id_empresa'] =
        $idEmpresa;


    //================================================
    // ASIGNAR NOMBRE
    //================================================

    $nombreOriginal =
        isset(
            $departamentoOriginal['nombre']
        )
            ? $departamentoOriginal['nombre']
            : '';


    $nuevoDepartamento['nombre'] =
        obtenerNombreDepartamento(
            $nombreOriginal,
            $idEmpresa
        );


    //================================================
    // ASIGNAR COLOR
    //================================================

    $nuevoDepartamento['color_reporte'] = [

        $color

    ];


    //================================================
    // ASIGNAR EMPLEADOS
    //================================================

    $nuevoDepartamento['empleados'] =
        $empleados;


    return $nuevoDepartamento;

}


//====================================================
// OBTENER NOMBRE DEL DEPARTAMENTO
//====================================================

function obtenerNombreDepartamento(
    $nombreOriginal,
    $idEmpresa
) {


    //================================================
    // ADMINISTRACION
    //================================================

    if (
        $nombreOriginal === 'Administración' ||
        $nombreOriginal === 'Administracion'
    ) {


        if ($idEmpresa === 1) {

            return 'Administración - Citricos SAAO';

        }


        if ($idEmpresa === 2) {

            return "Administración - SB citric´s group";

        }

    }


    //================================================
    // OTROS DEPARTAMENTOS
    //================================================

    return $nombreOriginal;

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


        $idEmpresa =
            isset($empleado['id_empresa'])
                ? (int)$empleado['id_empresa']
                : 0;


        //============================================
        // BUSCAR EMPLEADO
        //============================================

        if (
            isset(
                $empleadosBD[$idEmpresa][$clave]
            )
        ) {


            $empleado['id_empleado'] =

                $empleadosBD[$idEmpresa][$clave]
                ['id_empleado'];

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
    // ELIMINAR TIPO DE INASISTENCIAS
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
    // ELIMINAR EDITADO DE RETARDOS
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
    // CREAR OBJETO FECHA
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