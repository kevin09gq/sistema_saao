<?php

require_once __DIR__ . "/../../../conexion/conexion.php";
/** @var mysqli $conexion */

$accion = $_POST['accion'] ?? $_GET['accion'] ?? '';

// VALIDAR A QUE FUNCION SE VA A LLAMAR A TRAVEZ DEL CASE

switch ($accion) {

    case 'obtenerEmpresas':
        obtenerEmpresas($conexion);
        break;

    case 'obtenerAreas':
        obtenerAreas($conexion);
        break;

    case 'obtenerDepartamentos':
        obtenerDepartamentos($conexion);
        break;

    case 'obtenerPuestos':
        obtenerPuestos($conexion);
        break;

    case 'obtenerEmpleados':
        obtenerEmpleados($conexion);
        break;


    default:
        echo json_encode([
            "success" => false,
            "mensaje" => "Acción no válida."
        ]);
        break;
}

// ====================================================
// FUNCIÓN PARA OBTENER LAS EMPRESAS
// ====================================================

function obtenerEmpresas(mysqli $conexion)
{
    // Creamos la consulta para obtener las empresas
    $sql = "SELECT 
                id_empresa,
                nombre_empresa
            FROM empresa
            ORDER BY nombre_empresa ASC";

    // Ejecutamos la consulta
    $resultado = mysqli_query($conexion, $sql);

    // Verificamos si la consulta se ejecutó correctamente
    if (!$resultado) {

        // Enviamos una respuesta indicando que ocurrió un error
        echo json_encode([
            "success" => false,
            "mensaje" => "Error al obtener las empresas."
        ]);

        // Terminamos la ejecución de la función
        return;
    }

    // Creamos un arreglo vacío para almacenar las empresas
    $empresas = [];

    // Recorremos cada registro obtenido
    while ($empresa = mysqli_fetch_assoc($resultado)) {

        // Agregamos la empresa al arreglo
        $empresas[] = $empresa;
    }

    // Enviamos la respuesta en formato JSON
    echo json_encode([
        "success" => true,
        "empresas" => $empresas
    ]);
}

//====================================================
// FUNCIÓN PARA OBTENER LAS ÁREAS
//====================================================

function obtenerAreas(mysqli $conexion)
{
    // Creamos la consulta para obtener las áreas
    $sql = "SELECT 
                id_area,
                nombre_area
            FROM areas
            ORDER BY nombre_area ASC";

    // Ejecutamos la consulta
    $resultado = mysqli_query($conexion, $sql);

    // Verificamos si la consulta se ejecutó correctamente
    if (!$resultado) {

        // Enviamos una respuesta indicando que ocurrió un error
        echo json_encode([
            "success" => false,
            "mensaje" => "Error al obtener las áreas."
        ]);

        // Terminamos la ejecución de la función
        return;
    }

    // Creamos un arreglo vacío para almacenar las áreas
    $areas = [];

    // Recorremos cada registro obtenido
    while ($area = mysqli_fetch_assoc($resultado)) {

        // Agregamos el área al arreglo
        $areas[] = $area;
    }

    // Enviamos la respuesta en formato JSON
    echo json_encode([
        "success" => true,
        "areas" => $areas
    ]);
}


//====================================================
// FUNCIÓN PARA OBTENER LOS DEPARTAMENTOS RELACIONADOS
// CON UN ÁREA
//====================================================

function obtenerDepartamentos(mysqli $conexion)
{
    // Obtener el id del área enviado desde AJAX
    $idArea = $_POST['id_area'] ?? 0;

    // Validar que se haya recibido un id de área válido
    if (!$idArea) {

        // Enviar respuesta indicando que el área no es válida
        echo json_encode([
            "success" => false,
            "mensaje" => "No se recibió un área válida."
        ]);

        // Terminar la ejecución de la función
        return;
    }

    // Crear la consulta para obtener los departamentos del área
    $sql = "SELECT 
                d.id_departamento,
                d.nombre_departamento
            FROM areas_departamentos ad
            INNER JOIN departamentos d 
                ON d.id_departamento = ad.id_departamento
            WHERE ad.id_area = ?
            ORDER BY d.nombre_departamento ASC";

    // Preparar la consulta
    $stmt = mysqli_prepare($conexion, $sql);

    // Verificar si la consulta pudo prepararse
    if (!$stmt) {

        // Enviar respuesta indicando que ocurrió un error
        echo json_encode([
            "success" => false,
            "mensaje" => "Error al preparar la consulta."
        ]);

        // Terminar la ejecución de la función
        return;
    }

    // Asociar el id del área al parámetro de la consulta
    mysqli_stmt_bind_param($stmt, "i", $idArea);

    // Ejecutar la consulta
    mysqli_stmt_execute($stmt);

    // Obtener el resultado de la consulta
    $resultado = mysqli_stmt_get_result($stmt);

    // Crear un arreglo vacío para almacenar los departamentos
    $departamentos = [];

    // Recorrer los departamentos encontrados
    while ($departamento = mysqli_fetch_assoc($resultado)) {

        // Agregar el departamento al arreglo
        $departamentos[] = $departamento;
    }

    // Cerrar la consulta preparada
    mysqli_stmt_close($stmt);

    // Enviar los departamentos en formato JSON
    echo json_encode([
        "success" => true,
        "departamentos" => $departamentos
    ]);
}


//====================================================
// FUNCIÓN PARA OBTENER LOS PUESTOS RELACIONADOS
// CON UN DEPARTAMENTO

function obtenerPuestos(mysqli $conexion)
{
    // Obtener el id del departamento enviado desde AJAX
    $idDepartamento = $_POST['id_departamento'] ?? 0;

    // Validar que se haya recibido un id de departamento válido
    if (!$idDepartamento) {

        // Enviar respuesta indicando que el departamento no es válido
        echo json_encode([
            "success" => false,
            "mensaje" => "No se recibió un departamento válido."
        ]);

        // Terminar la ejecución de la función
        return;
    }

    // Crear la consulta para obtener los puestos del departamento
    $sql = "SELECT 
                p.id_puestoEspecial,
                p.nombre_puesto
            FROM departamentos_puestos dp
            INNER JOIN puestos_especiales p 
                ON p.id_puestoEspecial = dp.id_puestoEspecial
            WHERE dp.id_departamento = ?
            ORDER BY p.nombre_puesto ASC";

    // Preparar la consulta
    $stmt = mysqli_prepare($conexion, $sql);

    // Verificar si la consulta pudo prepararse
    if (!$stmt) {

        // Enviar respuesta indicando que ocurrió un error
        echo json_encode([
            "success" => false,
            "mensaje" => "Error al preparar la consulta."
        ]);

        // Terminar la ejecución de la función
        return;
    }

    // Asociar el id del departamento al parámetro de la consulta
    mysqli_stmt_bind_param($stmt, "i", $idDepartamento);

    // Ejecutar la consulta
    mysqli_stmt_execute($stmt);

    // Obtener el resultado de la consulta
    $resultado = mysqli_stmt_get_result($stmt);

    // Crear un arreglo vacío para almacenar los puestos
    $puestos = [];

    // Recorrer los puestos encontrados
    while ($puesto = mysqli_fetch_assoc($resultado)) {

        // Agregar el puesto al arreglo
        $puestos[] = $puesto;
    }

    // Cerrar la consulta preparada
    mysqli_stmt_close($stmt);

    // Enviar los puestos en formato JSON
    echo json_encode([
        "success" => true,
        "puestos" => $puestos
    ]);
}

//====================================================
// FUNCIÓN PARA OBTENER LA INFORMACIÓN DE LOS EMPLEADOS
//====================================================

function obtenerEmpleados(mysqli $conexion)
{
    // Crear la consulta para obtener la información necesaria
    $sql = "SELECT
                e.id_empleado,
                e.ruta_foto,
                e.nombre,
                e.ap_paterno,
                e.ap_materno,
                e.clave_empleado,
                e.status_nss,
                e.id_status,
                e.id_departamento,
                e.id_area,
                e.fecha_alta_empresa,
                d.nombre_departamento
            FROM info_empleados e
            LEFT JOIN departamentos d
                ON d.id_departamento = e.id_departamento
            ORDER BY e.nombre ASC, e.ap_paterno ASC";

    // Ejecutar la consulta
    $resultado = mysqli_query($conexion, $sql);

    // Verificar si ocurrió un error al ejecutar la consulta
    if (!$resultado) {

        // Enviar respuesta indicando que ocurrió un error
        echo json_encode([
            "success" => false,
            "mensaje" => "Error al obtener los empleados."
        ]);

        // Terminar la función
        return;
    }

    // Crear un arreglo para almacenar los empleados
    $empleados = [];

    // Recorrer todos los empleados obtenidos
    while ($empleado = mysqli_fetch_assoc($resultado)) {

        // Agregar el empleado al arreglo
        $empleados[] = $empleado;
    }

    // Enviar la información de los empleados en formato JSON
    echo json_encode([
        "success" => true,
        "empleados" => $empleados
    ]);
}
