<?php

require_once '../../conexion/conexion.php';
/** @var mysqli $conexion */

$accion = $_POST['accion'] ?? $_GET['accion'] ?? '';

// VALIDAR A QUE FUNCION SE VA A LLAMAR A TRAVEZ DEL CASE

switch ($accion) {

    case 'obtenerInfoDepartamento':
        obtenerInfoDepartamento($conexion);
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

// FUNCION PARA OBTENER LA INFORMACION DE LOS DEPARTAMENTOS RELACIONADO A LA NOMINA 40LBS
function obtenerInfoDepartamento(mysqli $conexion)
{

    $sql = "SELECT
                d.id_departamento,
                d.nombre_departamento,
                nd.color_depto_nomina
            FROM nomina_departamento nd
            INNER JOIN departamentos d
                ON nd.id_departamento = d.id_departamento
            WHERE nd.id_nomina = 1";

    $stmt = $conexion->prepare($sql);

    $stmt->execute();

    $resultado = $stmt->get_result();

    $departamentos = [];

    while ($fila = $resultado->fetch_assoc()) {

        $departamentos[] = $fila;
    }

    echo json_encode([
        "success" => true,
        "departamentos" => $departamentos
    ]);

    $stmt->close();
}

// FUNCIÓN PARA OBTENER LOS EMPLEADOS RELACIONADOS CON LA NÓMINA 40 LBS.
// ADEMÁS DE PERTENECER AL ÁREA Y DEPARTAMENTO, EL EMPLEADO DEBE
// PERTENECER A LA MISMA EMPRESA CONFIGURADA EN LA NÓMINA.

function obtenerEmpleados(mysqli $conexion)
{

    $sql = "SELECT
                ie.id_empleado,
                ie.clave_empleado,
                ie.nombre,
                ie.ap_paterno,
                ie.ap_materno,
                ie.id_departamento,
                ie.biometrico,
                ie.id_empresa,
                ie.status_nss,
                pe.color_hex AS color_puesto
            FROM info_empleados ie

            INNER JOIN nomina_departamento nd
                ON nd.id_departamento = ie.id_departamento
                AND nd.id_empresa = ie.id_empresa

            INNER JOIN nombre_nominas n
                ON n.id_nomina = nd.id_nomina
                AND n.id_area = ie.id_area

            LEFT JOIN puestos_especiales pe
                ON pe.id_puestoEspecial = ie.id_puestoEspecial

            WHERE nd.id_nomina = 1
            AND ie.id_status = 1

            ORDER BY ie.id_departamento,
                     ie.ap_paterno,
                     ie.ap_materno,
                     ie.nombre";

    $resultado = $conexion->query($sql);

    if (!$resultado) {

        echo json_encode([
            "success" => false,
            "mensaje" => $conexion->error
        ]);
        return;
    }

    $empleados = [];

    while ($fila = $resultado->fetch_assoc()) {
        $empleados[] = $fila;
    }

    echo json_encode([
        "success" => true,
        "empleados" => $empleados
    ]);
}
