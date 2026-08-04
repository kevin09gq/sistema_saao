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

    case 'obtenerSueldoBase':
        obtenerSueldoBase($conexion);
        break;

    case 'guardarNomina':
        guardarNomina($conexion);
        break;

    case 'recuperarUltimaNomina':
        recuperarUltimaNomina($conexion);
        break;

    case 'obtenerNuevosEmpleados':
        obtenerNuevosEmpleados($conexion);
        break;

    case 'obtenerInformacionNuevosEmpleados':
        obtenerInformacionNuevosEmpleados($conexion);
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
            WHERE nd.id_nomina = 4";

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
            ie.salario_semanal,
            ho.horario_oficial

        FROM info_empleados ie

        INNER JOIN nomina_departamento nd
            ON nd.id_departamento = ie.id_departamento
            AND nd.id_empresa = ie.id_empresa

        INNER JOIN nombre_nominas n
            ON n.id_nomina = nd.id_nomina
            AND n.id_area = ie.id_area

        LEFT JOIN horarios_oficiales ho
            ON ho.id_empleado = ie.id_empleado

        WHERE nd.id_nomina = 4
        AND ie.id_status = 1

        ORDER BY ie.id_departamento,
                ie.nombre,
                ie.ap_paterno,
                ie.ap_materno";

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

// FUNCIÓN PARA OBTENER EL SUELDO BASE DE LOS EMPLEADOS A TRAVES DE SU ID DE EMPLEADO

function obtenerSueldoBase(mysqli $conexion)
{

    $empleados = json_decode($_POST['empleados'], true);

    $ids = [];

    foreach ($empleados as $empleado) {
        $ids[] = $empleado['id_empleado'];
    }

    $sql = "SELECT
                id_empleado,
                salario_semanal
            FROM info_empleados
            WHERE id_empleado IN (" . implode(',', $ids) . ")";

    $resultado = $conexion->query($sql);

    $sueldos = [];

    while ($fila = $resultado->fetch_assoc()) {
        $sueldos[] = $fila;
    }

    echo json_encode($sueldos);
}

// FUNCIÓN PARA GUARDAR O ACTUALIZAR LA NÓMINA
function guardarNomina(mysqli $conexion)
{
    // Obtener datos del POST
    $jsonNomina = $_POST['nomina_40lbs'] ?? '';
    $anio = $_POST['anio'] ?? 0;
    $numeroSemana = $_POST['numero_semana'] ?? 0;
    $idEmpresa = $_POST['id_empresa'] ?? 1;
    $totalPercepciones = $_POST['total_percepciones'] ?? 0;
    $totalDeducciones = $_POST['total_deducciones'] ?? 0;
    $totalNeto = $_POST['total_neto'] ?? 0;

    // Validar datos requeridos
    if (empty($jsonNomina) || empty($anio) || empty($numeroSemana)) {
        echo json_encode([
            "success" => false,
            "mensaje" => "Datos incompletos para guardar la nómina."
        ]);
        return;
    }

    // Verificar si ya existe la nómina para esa semana y año
    $sqlCheck = "SELECT id_nomina_40lbs FROM nomina_40lbs 
                 WHERE anio = ? AND numero_semana = ? AND id_empresa = ?";

    $stmtCheck = $conexion->prepare($sqlCheck);
    $stmtCheck->bind_param("iii", $anio, $numeroSemana, $idEmpresa);
    $stmtCheck->execute();
    $resultadoCheck = $stmtCheck->get_result();

    if ($resultadoCheck->num_rows > 0) {
        // ACTUALIZAR nómina existente
        $fila = $resultadoCheck->fetch_assoc();
        $idNomina = $fila['id_nomina_40lbs'];

        $sqlUpdate = "UPDATE nomina_40lbs 
                      SET nomina_40lbs = ?, 
                          total_percepciones = ?, 
                          total_deducciones = ?, 
                          total_neto = ?
                      WHERE id_nomina_40lbs = ?";

        $stmtUpdate = $conexion->prepare($sqlUpdate);
        $stmtUpdate->bind_param("sdddi", $jsonNomina, $totalPercepciones, $totalDeducciones, $totalNeto, $idNomina);

        if ($stmtUpdate->execute()) {
            echo json_encode([
                "success" => true,
                "mensaje" => "Nómina actualizada correctamente.",
                "accion" => "actualizar"
            ]);
        } else {
            echo json_encode([
                "success" => false,
                "mensaje" => "Error al actualizar la nómina: " . $conexion->error
            ]);
        }

        $stmtUpdate->close();
    } else {
        // INSERTAR nueva nómina
        $sqlInsert = "INSERT INTO nomina_40lbs 
                      (id_empresa, anio, numero_semana, nomina_40lbs, total_percepciones, total_deducciones, total_neto)
                      VALUES (?, ?, ?, ?, ?, ?, ?)";

        $stmtInsert = $conexion->prepare($sqlInsert);
        $stmtInsert->bind_param("iisdddd", $idEmpresa, $anio, $numeroSemana, $jsonNomina, $totalPercepciones, $totalDeducciones, $totalNeto);

        if ($stmtInsert->execute()) {
            echo json_encode([
                "success" => true,
                "mensaje" => "Nómina guardada correctamente.",
                "accion" => "insertar"
            ]);
        } else {
            echo json_encode([
                "success" => false,
                "mensaje" => "Error al guardar la nómina: " . $conexion->error
            ]);
        }

        $stmtInsert->close();
    }

    $stmtCheck->close();
}

// FUNCIÓN PARA RECUPERAR LA ÚLTIMA NÓMINA GUARDADA (LAST ID)
function recuperarUltimaNomina(mysqli $conexion)
{
    $idEmpresa = $_POST['id_empresa'] ?? 1;

    // Obtener la nómina con el ID más alto (la última guardada)
    $sql = "SELECT id_nomina_40lbs, anio, numero_semana, nomina_40lbs,
                   total_percepciones, total_deducciones, total_neto
            FROM nomina_40lbs
            WHERE id_empresa = ?
            ORDER BY id_nomina_40lbs DESC
            LIMIT 1";

    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("i", $idEmpresa);
    $stmt->execute();
    $resultado = $stmt->get_result();

    if ($resultado->num_rows === 0) {
        echo json_encode([
            "success" => false,
            "mensaje" => "No se encontró ninguna nómina guardada."
        ]);
        $stmt->close();
        return;
    }

    $fila = $resultado->fetch_assoc();

    echo json_encode([
        "success" => true,
        "nomina_json" => $fila['nomina_40lbs'],
        "nomina_info" => [
            "id_nomina_40lbs" => $fila['id_nomina_40lbs'],
            "anio" => $fila['anio'],
            "numero_semana" => $fila['numero_semana'],
            "total_percepciones" => $fila['total_percepciones'],
            "total_deducciones" => $fila['total_deducciones'],
            "total_neto" => $fila['total_neto']
        ]
    ]);

    $stmt->close();
}


//===================================================
// FUNCIÓN PARA OBTENER LOS POSIBLES NUEVOS EMPLEADOS
// SOLO DEVUELVE LA INFORMACIÓN NECESARIA PARA
// MOSTRARLOS EN EL MODAL.
//===================================================

function obtenerNuevosEmpleados(mysqli $conexion)
{

    $sql = "SELECT
                ie.id_empleado,
                ie.clave_empleado,
                CONCAT(
                    ie.nombre, ' ',
                    ie.ap_paterno, ' ',
                    ie.ap_materno
                ) AS nombre,
                ie.id_departamento
            FROM info_empleados ie

            INNER JOIN nomina_departamento nd
                ON nd.id_departamento = ie.id_departamento
                AND nd.id_empresa = ie.id_empresa

            INNER JOIN nombre_nominas n
                ON n.id_nomina = nd.id_nomina
                AND n.id_area = ie.id_area

            WHERE nd.id_nomina = 1
            AND ie.id_status = 1

            ORDER BY
                ie.id_departamento,
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

//===================================================
// FUNCIÓN PARA OBTENER LA INFORMACIÓN COMPLETA DE
// LOS NUEVOS EMPLEADOS SELECCIONADOS.
//===================================================

function obtenerInformacionNuevosEmpleados(mysqli $conexion)
{

    $empleados = json_decode($_POST['empleados'], true);

    if (!$empleados || count($empleados) == 0) {

        echo json_encode([
            "success" => false,
            "mensaje" => "No se recibieron empleados."
        ]);

        return;
    }

    $ids = [];

    foreach ($empleados as $empleado) {

        $ids[] = intval($empleado["id_empleado"]);
    }

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

            LEFT JOIN puestos_especiales pe
                ON pe.id_puestoEspecial = ie.id_puestoEspecial

            WHERE ie.id_empleado IN (" . implode(",", $ids) . ")

            ORDER BY
                ie.id_departamento,
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

    $informacion = [];

    while ($fila = $resultado->fetch_assoc()) {

        $informacion[] = $fila;
    }

    echo json_encode([
        "success" => true,
        "empleados" => $informacion
    ]);
}
