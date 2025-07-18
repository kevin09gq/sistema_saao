<?php
include("../../conexion/conexion.php");


if (isset($_GET['accion']) || isset($_POST['accion'])) {
    $accion = $_GET['accion'] ?? $_POST['accion'];

    switch ($accion) {
        case 'cargarEmpleados':
            cargarEmpleados();

            break;
        case 'dataEmpleado':
            if (isset($_POST['id_empleado']) && isset($_POST['clave_empleado'])) {
                $idEmpleado = $_POST['id_empleado'];
                $idClave = $_POST['clave_empleado'];
                dataEmpleado($idEmpleado, $idClave);
            }
            break;

        case 'cambiarStatus':
            if (isset($_POST['id_empleado']) && isset($_POST['id_status'])) {
                $idEmpleado = $_POST['id_empleado'];
                $idStatus = $_POST['id_status'];
                cambiarStatus($idEmpleado, $idStatus);
            }


            break;

        default:
    }
} else {
}

function cargarEmpleados()
{
    global $conexion;

    $sql = $conexion->prepare("SELECT 
        e.id_empleado, 
        e.clave_empleado, 
        e.nombre, 
        e.ap_paterno, 
        e.ap_materno, 
        s.id_status, 
        s.nombre_status, 
        d.id_departamento, 
        d.nombre_departamento
        FROM 
        info_empleados e
        LEFT JOIN 
        status s ON e.id_status = s.id_status
        LEFT JOIN 
        departamentos d ON e.id_departamento = d.id_departamento ORDER BY 
        e.nombre ASC");
    $sql->execute();
    $resultado = $sql->get_result();
    $empleados = array();

    while ($row = $resultado->fetch_assoc()) {
        $empleados[] = array(
            'id_empleado' => $row['id_empleado'],
            'clave_empleado' => $row['clave_empleado'],
            'nombre' => $row['nombre'],
            'ap_paterno' => $row['ap_paterno'],
            'ap_materno' => $row['ap_materno'],
            'id_status' => $row['id_status'],
            'nombre_status' => $row['nombre_status'],
            'id_departamento' => $row['id_departamento'],
            'nombre_departamento' => $row['nombre_departamento']
        );
    }

    // Encodifica y devuelve el JSON una sola vez
    header('Content-Type: application/json');
    echo json_encode($empleados, JSON_UNESCAPED_UNICODE);
}

function dataEmpleado($idEmpleado, $idClave)
{
    global $conexion;
    $sql = $conexion->prepare("SELECT 
        e.nombre AS nombre_empleado,
        e.ap_paterno AS apellido_paterno_empleado,
        e.ap_materno AS apellido_materno_empleado,
        e.domicilio AS domicilio_empleado,
        e.imss,
        e.curp,
        e.sexo,
        e.grupo_sanguineo,
        e.enfermedades_alergias,
        e.fecha_ingreso,
        d.id_departamento AS id_departamento,
        d.nombre_departamento AS departamento,
        c.nombre AS nombre_contacto,
        c.ap_paterno AS apellido_paterno_contacto,
        c.ap_materno AS apellido_materno_contacto,
        c.telefono AS telefono_contacto,
        c.domicilio AS domicilio_contacto,
        ec.parentesco
    FROM 
        info_empleados e
    LEFT JOIN 
        departamentos d ON e.id_departamento = d.id_departamento
    LEFT JOIN 
        empleado_contacto ec ON e.id_empleado = ec.id_empleado
    LEFT JOIN 
        contacto_emergencia c ON ec.id_contacto = c.id_contacto WHERE e.id_empleado = ? AND e.clave_empleado = ?");

    $sql->bind_param("is", $idEmpleado, $idClave);
    $sql->execute();
    $resultado = $sql->get_result();
    $empleado = array();
    if ($resultado->num_rows > 0) {
        $row = $resultado->fetch_assoc();
        $empleado = array(
            'nombre_empleado' => $row['nombre_empleado'],
            'apellido_paterno_empleado' => $row['apellido_paterno_empleado'],
            'apellido_materno_empleado' => $row['apellido_materno_empleado'],
            'domicilio_empleado' => $row['domicilio_empleado'],
            'imss' => $row['imss'],
            'curp' => $row['curp'],
            'sexo' => $row['sexo'],
            'grupo_sanguineo' => $row['grupo_sanguineo'],
            'enfermedades_alergias' => $row['enfermedades_alergias'],
            'fecha_ingreso' => $row['fecha_ingreso'],
            'id_departamento' => $row['id_departamento'],
            'departamento' => $row['departamento'],
            'nombre_contacto' => $row['nombre_contacto'],
            'apellido_paterno_contacto' => $row['apellido_paterno_contacto'],
            'apellido_materno_contacto' => $row['apellido_materno_contacto'],
            'telefono_contacto' => $row['telefono_contacto'],
            'domicilio_contacto' => $row['domicilio_contacto'],
            'parentesco' => $row['parentesco']
        );
    }

    header('Content-Type: application/json');
    echo json_encode($empleado, JSON_UNESCAPED_UNICODE);
}

function cambiarStatus($idEmpleado, $idStatus)
{
    global $conexion;

    if ($idStatus == 1) {
        $idStatus = 2; // Cambiar a Inactivo
    } elseif ($idStatus == 2) {
        $idStatus = 1; // Cambiar a Activo
    }

    $sql = $conexion->prepare("UPDATE info_empleados SET id_status = ? WHERE id_empleado = ?");
    $sql->bind_param("ii", $idStatus, $idEmpleado);
    $sql->execute();
    print_r(true);

    $sql->close();
}
