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

    case 'obtenerHorarioRancho':
        obtenerHorarioRancho($conexion);
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

    case 'obtenerFestividadesNomina':
        obtenerFestividadesNomina($conexion);
        break;

    default:
        echo json_encode([
            "success" => false,
            "mensaje" => "Acción no válida."
        ]);
        break;
}


// FUNCION PARA OBTENER LA INFORMACION DE LOS DEPARTAMENTOS RELACIONADO A LA NOMINA PILAR
function obtenerInfoDepartamento(mysqli $conexion)
{

    $sql = "SELECT
                d.id_departamento,
                d.nombre_departamento,
                nd.color_depto_nomina
            FROM nomina_departamento nd
            INNER JOIN departamentos d
                ON nd.id_departamento = d.id_departamento
            WHERE nd.id_nomina = 5";

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

// FUNCIÓN PARA OBTENER LOS EMPLEADOS RELACIONADOS CON LA NÓMINA PILAR.
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
            ie.salario_diario,
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

        WHERE nd.id_nomina = 5
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


// FUNCION PARA OBTENER EL HORARIO DEL RANCHO

function obtenerHorarioRancho(mysqli $conexion)
{

    $id_area = 2;

    $sql = "SELECT horario_jornalero 
            FROM info_ranchos 
            WHERE id_area = ?";


    $stmt = $conexion->prepare($sql);

    if (!$stmt) {

        echo json_encode([
            "success" => false,
            "mensaje" => $conexion->error
        ]);

        return;
    }


    $stmt->bind_param("i", $id_area);

    $stmt->execute();


    $resultado = $stmt->get_result();


    if ($fila = $resultado->fetch_assoc()) {


        echo json_encode([
            "success" => true,
            "horario_jornalero" => json_decode($fila["horario_jornalero"])
        ]);


    } else {


        echo json_encode([
            "success" => false,
            "mensaje" => "No se encontró horario para el rancho."
        ]);

    }


    $stmt->close();

}



// FUNCIÓN PARA GUARDAR O ACTUALIZAR LA NÓMINA
function guardarNomina(mysqli $conexion)
{
    // Obtener datos del POST
    $jsonNomina = $_POST['nomina_pilar'] ?? '';
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
    $sqlCheck = "SELECT id_nomina_pilar FROM nomina_pilar 
                 WHERE anio = ? AND numero_semana = ? AND id_empresa = ?";

    $stmtCheck = $conexion->prepare($sqlCheck);
    $stmtCheck->bind_param("iii", $anio, $numeroSemana, $idEmpresa);
    $stmtCheck->execute();
    $resultadoCheck = $stmtCheck->get_result();

    if ($resultadoCheck->num_rows > 0) {
        // ACTUALIZAR nómina existente
        $fila = $resultadoCheck->fetch_assoc();
        $idNomina = $fila['id_nomina_pilar'];

        $sqlUpdate = "UPDATE nomina_pilar 
                      SET nomina_pilar = ?, 
                          total_percepciones = ?, 
                          total_deducciones = ?, 
                          total_neto = ?
                      WHERE id_nomina_pilar = ?";

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
        $sqlInsert = "INSERT INTO nomina_pilar
                      (id_empresa, anio, numero_semana, nomina_pilar, total_percepciones, total_deducciones, total_neto)
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
    $sql = "SELECT id_nomina_pilar, anio, numero_semana, nomina_pilar,
                   total_percepciones, total_deducciones, total_neto
            FROM nomina_pilar
            WHERE id_empresa = ?
            ORDER BY id_nomina_pilar DESC
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
        "nomina_json" => $fila['nomina_pilar'],
        "nomina_info" => [
            "id_nomina_pilar" => $fila['id_nomina_pilar'],
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

            WHERE nd.id_nomina = 5
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

    if (empty($ids)) {

        echo json_encode([
            "success" => false,
            "mensaje" => "No se recibieron IDs válidos."
        ]);

        return;
    }

    $idsString = implode(',', $ids);

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
            ie.salario_diario,
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

        WHERE nd.id_nomina = 5
        AND ie.id_status = 1
        AND ie.id_empleado IN ($idsString)

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

    $informacion = [];

    while ($fila = $resultado->fetch_assoc()) {

        $informacion[] = $fila;
    }

    echo json_encode([
        "success" => true,
        "empleados" => $informacion
    ]);
}

// FUNCIÓN PARA OBTENER FESTIVIDADES DENTRO DEL RANGO DE LA NÓMINA
function obtenerFestividadesNomina(mysqli $conexion)
{
    $fechaInicioStr = $_POST['fecha_inicio'] ?? $_GET['fecha_inicio'] ?? '';
    $fechaCierreStr = $_POST['fecha_cierre'] ?? $_GET['fecha_cierre'] ?? '';

    if (empty($fechaInicioStr) || empty($fechaCierreStr)) {
        echo json_encode([
            "success" => false,
            "mensaje" => "Se requieren las fechas de inicio y cierre de la nómina."
        ]);
        return;
    }

    $fechaInicio = normalizarFechaMysql($fechaInicioStr);
    $fechaCierre = normalizarFechaMysql($fechaCierreStr);

    $sql = "SELECT id_festividad, nombre, fecha, tipo, observacion
            FROM festividades
            WHERE fecha BETWEEN ? AND ?
            ORDER BY fecha ASC";

    $stmt = $conexion->prepare($sql);
    if (!$stmt) {
        echo json_encode([
            "success" => false,
            "mensaje" => "Error al preparar la consulta: " . $conexion->error
        ]);
        return;
    }

    $stmt->bind_param("ss", $fechaInicio, $fechaCierre);
    $stmt->execute();
    $resultado = $stmt->get_result();

    $festividades = [];
    $diasSemana = [
        1 => 'LUNES',
        2 => 'MARTES',
        3 => 'MIÉRCOLES',
        4 => 'JUEVES',
        5 => 'VIERNES',
        6 => 'SÁBADO',
        7 => 'DOMINGO'
    ];

    while ($fila = $resultado->fetch_assoc()) {
        $timestamp = strtotime($fila['fecha']);
        $numDia = date('N', $timestamp);
        $fila['dia_nombre'] = $diasSemana[$numDia] ?? '';
        $fila['fecha_formateada'] = date('d/m/Y', $timestamp);
        $festividades[] = $fila;
    }

    echo json_encode([
        "success" => true,
        "festividades" => $festividades
    ]);

    $stmt->close();
}

function normalizarFechaMysql($fechaStr)
{
    $fechaStr = trim($fechaStr);
    if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $fechaStr)) {
        return $fechaStr;
    }

    $meses = [
        'Ene' => '01', 'Feb' => '02', 'Mar' => '03', 'Abr' => '04',
        'May' => '05', 'Jun' => '06', 'Jul' => '07', 'Ago' => '08',
        'Sep' => '09', 'Oct' => '10', 'Nov' => '11', 'Dic' => '12',
        'Enero' => '01', 'Febrero' => '02', 'Marzo' => '03', 'Abril' => '04',
        'Mayo' => '05', 'Junio' => '06', 'Julio' => '07', 'Agosto' => '08',
        'Septiembre' => '09', 'Octubre' => '10', 'Noviembre' => '11', 'Diciembre' => '12'
    ];

    $partes = explode('/', $fechaStr);
    if (count($partes) === 3) {
        $dia = str_pad($partes[0], 2, '0', STR_PAD_LEFT);
        $mesStr = ucfirst(strtolower($partes[1]));
        $mes = $meses[$mesStr] ?? '01';
        $anio = $partes[2];
        return "$anio-$mes-$dia";
    }

    return date('Y-m-d', strtotime($fechaStr));
}

