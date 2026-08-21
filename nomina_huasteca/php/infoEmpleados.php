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


// FUNCION PARA OBTENER LA INFORMACION DE LOS DEPARTAMENTOS RELACIONADO A LA NOMINA huasteca
function obtenerInfoDepartamento(mysqli $conexion)
{

    $sql = "SELECT
                d.id_departamento,
                d.nombre_departamento,
                nd.color_depto_nomina
            FROM nomina_departamento nd
            INNER JOIN departamentos d
                ON nd.id_departamento = d.id_departamento
            WHERE nd.id_nomina = 6";

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

// FUNCIÓN PARA OBTENER LOS EMPLEADOS RELACIONADOS CON LA NÓMINA huasteca.
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

        WHERE nd.id_nomina = 6
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
    $jsonNomina = $_POST['nomina_huasteca'] ?? '';
    $anio = $_POST['anio'] ?? 0;
    $numeroSemana = $_POST['numero_semana'] ?? 0;
    $idEmpresa = $_POST['id_empresa'] ?? 1;
    $totalPercepciones = $_POST['total_percepciones'] ?? 0;
    $totalDeducciones = $_POST['total_deducciones'] ?? 0;
    $totalNeto = $_POST['total_neto'] ?? 0;

    $corte = $_POST['corte'] ?? [];
    $poda = $_POST['poda'] ?? [];

    // Validar datos requeridos
    if (empty($jsonNomina) || empty($anio) || empty($numeroSemana)) {
        echo json_encode([
            "success" => false,
            "mensaje" => "Datos incompletos para guardar la nómina."
        ]);
        return;
    }

    // Verificar si ya existe la nómina para esa semana y año
    $sqlCheck = "SELECT id_nomina_huasteca FROM nomina_huasteca 
                 WHERE anio = ? AND numero_semana = ? AND id_empresa = ?";

    $stmtCheck = $conexion->prepare($sqlCheck);
    $stmtCheck->bind_param("iii", $anio, $numeroSemana, $idEmpresa);
    $stmtCheck->execute();
    $resultadoCheck = $stmtCheck->get_result();

    if ($resultadoCheck->num_rows > 0) {
        // ACTUALIZAR nómina existente
        $fila = $resultadoCheck->fetch_assoc();
        $idNomina = $fila['id_nomina_huasteca'];

        $sqlUpdate = "UPDATE nomina_huasteca 
                      SET nomina_huasteca = ?, 
                          total_percepciones = ?, 
                          total_deducciones = ?, 
                          total_neto = ?
                      WHERE id_nomina_huasteca = ?";

        $stmtUpdate = $conexion->prepare($sqlUpdate);
        $stmtUpdate->bind_param("sdddi", $jsonNomina, $totalPercepciones, $totalDeducciones, $totalNeto, $idNomina);

        if ($stmtUpdate->execute()) {

            // También actualizar los tickets de corte
            asignarTicketsCorteANomina($corte, $idNomina, $conexion);
            // También actualizar los movimientos de poda
            guardarPoda($poda, $idNomina, $conexion);

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
        $sqlInsert = "INSERT INTO nomina_huasteca
                      (id_empresa, anio, numero_semana, nomina_huasteca, total_percepciones, total_deducciones, total_neto)
                      VALUES (?, ?, ?, ?, ?, ?, ?)";

        $stmtInsert = $conexion->prepare($sqlInsert);
         $stmtInsert->bind_param("iiisddd", $idEmpresa, $anio, $numeroSemana, $jsonNomina, $totalPercepciones, $totalDeducciones, $totalNeto);

        if ($stmtInsert->execute()) {
            // Recuperar el ID recién insertado
            $idNominaInsertada = $conexion->insert_id;
            // Guardar los tickets de corte relacionados con esta nómina
            asignarTicketsCorteANomina($corte, $idNominaInsertada, $conexion);
            // Guardar los movimientos de poda relacionados con esta nómina
            guardarPoda($poda, $idNominaInsertada, $conexion);

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
    $sql = "SELECT id_nomina_huasteca, anio, numero_semana, nomina_huasteca,
                   total_percepciones, total_deducciones, total_neto
            FROM nomina_huasteca
            WHERE id_empresa = ?
            ORDER BY id_nomina_huasteca DESC
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

    // ALMACENAR EL ID Y LA NOMINA EN VARIABLES PARA PODER USARLAS EN EL JSON DE RESPUESTA
    $id_nomina = $fila['id_nomina_huasteca'];
    $nomina_raw = $fila['nomina_huasteca'];

    // PASAR A JSON PARA PODER AGRERGAR EL CORTE Y PODA
    $nomina_json = json_decode($nomina_raw, true);
    // OBTENER LOS TICKETS DE CORTE
    $ticketsCorte = obtenerTicketsCorteInterno($id_nomina, $conexion);
    // OBTENER LOS TICKETS DE PODA
    $movimientosPoda = obtenerPodaInterno($id_nomina, $conexion);

    // METER MANUALMENTE LOS DEPARTAMENTOS DE CORTE Y PODA EN EL JSON DE LA NOMINA
    $nomina_json['departamentos'][] = [
        'nombre' => 'Corte',
        'empleados' => $ticketsCorte,
        'id_departamento' => 800
    ];

    $nomina_json['departamentos'][] = [
        'nombre' => 'Poda',
        'empleados' => $movimientosPoda,
        'id_departamento' => 801
    ];

    // Convertir nuevamente a string JSON
    $nomina_raw = json_encode($nomina_json, JSON_UNESCAPED_UNICODE);

    echo json_encode([
        "success" => true,
        "nomina_json" => $nomina_raw,
        "nomina_info" => [
            "id_nomina_huasteca" => $fila['id_nomina_huasteca'],
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

            WHERE nd.id_nomina = 6
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

        WHERE nd.id_nomina = 6
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
        'Ene' => '01',
        'Feb' => '02',
        'Mar' => '03',
        'Abr' => '04',
        'May' => '05',
        'Jun' => '06',
        'Jul' => '07',
        'Ago' => '08',
        'Sep' => '09',
        'Oct' => '10',
        'Nov' => '11',
        'Dic' => '12',
        'Enero' => '01',
        'Febrero' => '02',
        'Marzo' => '03',
        'Abril' => '04',
        'Mayo' => '05',
        'Junio' => '06',
        'Julio' => '07',
        'Agosto' => '08',
        'Septiembre' => '09',
        'Octubre' => '10',
        'Noviembre' => '11',
        'Diciembre' => '12'
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





/**
 * ================================================================================
 * FUNCIONES PARA TRABAJAR TODO LO RELACIONADO CON CORTES
 * ================================================================================
 */

/**
 * NOTA: BORRAR LUEGO
 * Función para guardar tickets de corte (llamada desde guardarNominahuasteca)
 */
function guardarTicketsCorte($corte, $idNomina, $conexion)
{
    try {
        // Decodificar el JSON de los empleados cortadores
        $empleadosCorte = json_decode($corte, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            error_log("Error al decodificar JSON de cortes: " . json_last_error_msg());
            return;
        }

        // Primero limpiar tickets existentes para esta nómina (en caso de actualización)
        $deleteQuery = "DELETE FROM cortes_huasteca WHERE id_nomina = ?";
        $deleteStmt = $conexion->prepare($deleteQuery);
        $deleteStmt->bind_param("i", $idNomina);
        $deleteStmt->execute();

        // Procesar cada empleado cortador
        foreach ($empleadosCorte as $empleado) {
            $nombreCortador = $empleado['nombre'];

            // Procesar cada ticket del empleado
            foreach ($empleado['tickets'] as $ticket) {
                $folio = $ticket['folio'];
                $fechaCorte = $ticket['fecha'];
                $precioReja = $ticket['precio_reja'];

                // Insertar el ticket principal en cortes_huasteca
                $insertCorteQuery = "INSERT INTO cortes_huasteca (id_nomina, nombre_cortador, folio, precio_reja, fecha_corte) VALUES (?, ?, ?, ?, ?)";
                $insertCorteStmt = $conexion->prepare($insertCorteQuery);
                $insertCorteStmt->bind_param("issds", $idNomina, $nombreCortador, $folio, $precioReja, $fechaCorte);

                if ($insertCorteStmt->execute()) {
                    // Obtener el ID del corte recién insertado
                    $idCorte = $conexion->insert_id;

                    // Insertar los detalles de las tablas de rejas
                    foreach ($ticket['datosRejas'] as $datosTabla) {
                        $numTabla = intval($datosTabla['tabla']);
                        $cantidadRejas = intval($datosTabla['cantidad']);

                        $insertTablaQuery = "INSERT INTO cortes_huasteca_tablas (id_corte, num_tabla, rejas) VALUES (?, ?, ?)";
                        $insertTablaStmt = $conexion->prepare($insertTablaQuery);
                        $insertTablaStmt->bind_param("iii", $idCorte, $numTabla, $cantidadRejas);
                        $insertTablaStmt->execute();
                    }
                } else {
                    error_log("Error al insertar corte: " . $conexion->error);
                }
            }
        }

        error_log("Tickets de corte guardados correctamente para nómina ID: " . $idNomina);
    } catch (Exception $e) {
        error_log("Error en guardarTicketsCorte: " . $e->getMessage());
    }
}

/**
 * Función para asignar tickets de corte a una nómina existente
 */
function asignarTicketsCorteANomina($corte, $idNomina, $conexion)
{
    try {
        $empleadosCorte = json_decode($corte, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            error_log("Error al decodificar JSON de cortes: " . json_last_error_msg());
            return;
        }

        foreach ($empleadosCorte as $empleado) {
            $nombreCortador = $empleado['nombre'];

            // Solo procesar empleados con concepto REJA
            if ($empleado['concepto'] === 'REJA' && isset($empleado['tickets']) && is_array($empleado['tickets'])) {
                foreach ($empleado['tickets'] as $ticket) {
                    $folio = $ticket['folio'];
                    $fechaCorte = $ticket['fecha'];
                    $precioReja = $ticket['precio_reja'];

                    // 1. Consultar si el vale ya tiene nómina
                    $checkQuery = "SELECT id, id_nomina FROM cortes_huasteca WHERE folio = ? AND nombre_cortador = ?";
                    $checkStmt = $conexion->prepare($checkQuery);
                    $checkStmt->bind_param("ss", $folio, $nombreCortador);
                    $checkStmt->execute();
                    $result = $checkStmt->get_result();

                    if ($row = $result->fetch_assoc()) {
                        $idCorte = $row['id'];
                        $idNominaExistente = $row['id_nomina'];

                        if (is_null($idNominaExistente)) {
                            // 2. Si está pendiente, asignar a la nómina
                            $updateQuery = "UPDATE cortes_huasteca 
                                        SET id_nomina = ?, fecha_corte = ?, precio_reja = ?
                                        WHERE id = ?";
                            $updateStmt = $conexion->prepare($updateQuery);
                            $updateStmt->bind_param("isdi", $idNomina, $fechaCorte, $precioReja, $idCorte);
                            $updateStmt->execute();
                        } else {
                            // 3. Si ya tiene nómina, actualizar datos
                            $updateQuery = "UPDATE cortes_huasteca 
                                        SET fecha_corte = ?, precio_reja = ?, nombre_cortador = ?
                                        WHERE id = ?";
                            $updateStmt = $conexion->prepare($updateQuery);
                            $updateStmt->bind_param("sdsi", $fechaCorte, $precioReja, $nombreCortador, $idCorte);
                            $updateStmt->execute();

                            // Actualizar tablas: borrar y volver a insertar
                            $conexion->query("DELETE FROM cortes_huasteca_tablas WHERE id_corte = $idCorte");
                            foreach ($ticket['datosRejas'] as $datosTabla) {
                                $numTabla = intval($datosTabla['tabla']);
                                $cantidadRejas = intval($datosTabla['cantidad']);
                                $insertTablaQuery = "INSERT INTO cortes_huasteca_tablas (id_corte, num_tabla, rejas) VALUES (?, ?, ?)";
                                $insertTablaStmt = $conexion->prepare($insertTablaQuery);
                                $insertTablaStmt->bind_param("iii", $idCorte, $numTabla, $cantidadRejas);
                                $insertTablaStmt->execute();
                            }
                        }
                    }
                }
            }
        }

        error_log("Tickets de corte procesados para nómina ID: " . $idNomina);
    } catch (Exception $e) {
        error_log("Error en asignarTicketsCorteANomina: " . $e->getMessage());
    }
}

/**
 * NOTA: BORRAR LUEGO
 * Función para obtener tickets de corte (llamada independientemente)
 */
function obtenerTicketsCorte($data, $conexion)
{
    $numero_semana = isset($data['numero_semana']) ? intval($data['numero_semana']) : 0;
    $anio = isset($data['anio']) ? intval($data['anio']) : 0;
    $id_empresa = isset($data['id_empresa']) ? intval($data['id_empresa']) : 1;

    // Obtener el ID de la nómina primero
    $queryNomina = "SELECT id_nomina_huasteca FROM nomina_huasteca WHERE id_empresa = ? AND numero_semana = ? AND anio = ? ORDER BY id_nomina_huasteca DESC LIMIT 1";
    $stmtNomina = $conexion->prepare($queryNomina);
    $stmtNomina->bind_param("iii", $id_empresa, $numero_semana, $anio);
    $stmtNomina->execute();
    $resultNomina = $stmtNomina->get_result();

    if ($resultNomina && $resultNomina->num_rows > 0) {
        $rowNomina = $resultNomina->fetch_assoc();
        $idNomina = $rowNomina['id_nomina_huasteca'];

        $ticketsCorte = obtenerTicketsCorteInterno($idNomina, $conexion);
        echo json_encode(['success' => true, 'found' => true, 'ticketsCorte' => $ticketsCorte]);
    } else {
        echo json_encode(['success' => true, 'found' => false]);
    }
}

/**
 * Función interna para obtener tickets de corte desde un ID de nómina
 */
function obtenerTicketsCorteInterno($idNomina, $conexion)
{
    $empleadosCorte = [];

    // Obtener todos los cortes para esta nómina
    $queryCortes = "SELECT id, nombre_cortador, folio, precio_reja, fecha_corte FROM cortes_huasteca WHERE id_nomina = ? ORDER BY nombre_cortador, fecha_corte";
    $stmtCortes = $conexion->prepare($queryCortes);
    $stmtCortes->bind_param("i", $idNomina);
    $stmtCortes->execute();
    $resultCortes = $stmtCortes->get_result();

    while ($corte = $resultCortes->fetch_assoc()) {
        $idCorte = $corte['id'];
        $nombreCortador = $corte['nombre_cortador'];
        $folio = $corte['folio'];
        $precioReja = floatval($corte['precio_reja']);
        $fechaCorte = $corte['fecha_corte'];

        // Obtener las tablas de rejas para este corte
        $queryTablas = "SELECT num_tabla, rejas FROM cortes_huasteca_tablas WHERE id_corte = ? ORDER BY num_tabla";
        $stmtTablas = $conexion->prepare($queryTablas);
        $stmtTablas->bind_param("i", $idCorte);
        $stmtTablas->execute();
        $resultTablas = $stmtTablas->get_result();

        $datosRejas = [];
        while ($tabla = $resultTablas->fetch_assoc()) {
            $datosRejas[] = [
                'tabla' => $tabla['num_tabla'],
                'cantidad' => intval($tabla['rejas'])
            ];
        }

        // Buscar si el empleado ya existe en el array
        $empleadoIndex = -1;
        for ($i = 0; $i < count($empleadosCorte); $i++) {
            if ($empleadosCorte[$i]['nombre'] === $nombreCortador) {
                $empleadoIndex = $i;
                break;
            }
        }

        // Si el empleado no existe, crearlo
        if ($empleadoIndex === -1) {
            $empleadosCorte[] = [
                'nombre' => $nombreCortador,
                'tickets' => [],
                'concepto' => 'REJA'
            ];
            $empleadoIndex = count($empleadosCorte) - 1;
        }

        // Agregar el ticket al empleado
        $empleadosCorte[$empleadoIndex]['tickets'][] = [
            'folio' => $folio,
            'fecha' => $fechaCorte,
            'datosRejas' => $datosRejas,
            'precio_reja' => $precioReja
        ];
    }

    return $empleadosCorte;
}


/**
 * ================================================================================
 * FUNCIONES PARA TRABAJAR TODO LO RELACIONADO CON PODAS
 * ================================================================================
 */


/**
 * Función para guardar movimientos de poda con transacción
 * @param Array $poda Puede ser un JSON string o un array ya decodificado de los movimientos de poda
 * @param Int $idNomina El ID de la nómina a la que pertenecen estos movimientos de poda
 * @param mysqli $conexion La conexión a la base de datos
 */
function guardarPoda($poda, $idNomina, $conexion)
{
    try {
        // Iniciar transacción
        $conexion->begin_transaction();

        // Si viene como JSON string, decodificar
        if (is_string($poda)) {
            $poda = json_decode($poda, true);
        }

        if (!is_array($poda)) {
            throw new Exception("Poda no es un arreglo válido");
        }

        /**
         * ==========================================================
         * LIMPIAR DATOS ANTERIORES
         * ==========================================================
         */
        $deleteQuery = "DELETE FROM podas_huasteca WHERE id_nomina = ?";
        $deleteStmt = $conexion->prepare($deleteQuery);
        $deleteStmt->bind_param("i", $idNomina);

        if (!$deleteStmt->execute()) {
            throw new Exception("Error al eliminar podas: " . $conexion->error);
        }

        /**
         * ==========================================================
         * INSERTAR NUEVOS DATOS
         * ==========================================================
         */
        foreach ($poda as $empleado) {

            $nombreEmpleado = $empleado['nombre'] ?? '';

            if (!isset($empleado['movimientos'])) continue;

            // 🔹 Insertar en tabla principal
            $insertPodaQuery = "INSERT INTO podas_huasteca 
                (id_nomina, nombre_empleado, fecha_creacion) 
                VALUES (?, ?, NOW())";

            $stmtPoda = $conexion->prepare($insertPodaQuery);
            $stmtPoda->bind_param("is", $idNomina, $nombreEmpleado);

            if (!$stmtPoda->execute()) {
                throw new Exception("Error al insertar poda: " . $conexion->error);
            }

            $idPoda = $conexion->insert_id;

            // 🔹 Insertar movimientos
            foreach ($empleado['movimientos'] as $mov) {

                $concepto = $mov['concepto'] ?? 'PODA';
                $fecha = $mov['fecha'] ?? null;

                if (!$fecha) {
                    throw new Exception("Movimiento sin fecha");
                }

                // Reglas de negocio
                if ($concepto === "PODA") {
                    $arboles = intval($mov['arboles_podados'] ?? 0);
                    $monto = floatval($mov['monto'] ?? 0);
                    $esExtra = 0;
                } else {
                    $arboles = 0;
                    $monto = floatval($mov['monto'] ?? 0);
                    $esExtra = 1;
                }

                $insertMovQuery = "INSERT INTO podas_movimientos_huasteca 
                    (id_poda, concepto, fecha, arboles_podados, monto, es_extra) 
                    VALUES (?, ?, ?, ?, ?, ?)";

                $stmtMov = $conexion->prepare($insertMovQuery);
                $stmtMov->bind_param(
                    "issidi",
                    $idPoda,
                    $concepto,
                    $fecha,
                    $arboles,
                    $monto,
                    $esExtra
                );

                if (!$stmtMov->execute()) {
                    throw new Exception("Error al insertar movimiento: " . $conexion->error);
                }
            }
        }

        // Confirmar cambios
        $conexion->commit();

        error_log("Poda guardada correctamente (TRANSACCIÓN OK) para nómina ID: " . $idNomina);
    } catch (Exception $e) {

        // Revertir todo
        $conexion->rollback();

        error_log("Error en guardarPoda (ROLLBACK): " . $e->getMessage());
    }
}


/**
 * Función interna para obtener movimientos de poda desde un ID de nómina
 * @param Int $idNomina El ID de la nómina para la cual se quieren obtener los movimientos de poda
 * @param mysqli $conexion La conexión a la base de datos
 * @return Array Un arreglo estructurado con los empleados y sus movimientos de poda
 */
function obtenerPodaInterno($idNomina, $conexion)
{
    $empleadosPoda = [];

    // 🔹 Obtener todas las podas con sus movimientos
    $query = "SELECT 
            p.id_poda,
            p.nombre_empleado,
            m.id_movimiento,
            m.concepto,
            m.fecha,
            m.arboles_podados,
            m.monto,
            m.es_extra
        FROM podas_huasteca p
        INNER JOIN podas_movimientos_huasteca m 
            ON p.id_poda = m.id_poda
        WHERE p.id_nomina = ?
        ORDER BY m.id_movimiento ASC
    ";

    $stmt = $conexion->prepare($query);
    $stmt->bind_param("i", $idNomina);
    $stmt->execute();
    $result = $stmt->get_result();

    while ($row = $result->fetch_assoc()) {

        $nombreEmpleado = $row['nombre_empleado'];

        // 🔹 Buscar si el empleado ya existe
        $empleadoIndex = -1;
        for ($i = 0; $i < count($empleadosPoda); $i++) {
            if ($empleadosPoda[$i]['nombre'] === $nombreEmpleado) {
                $empleadoIndex = $i;
                break;
            }
        }

        // 🔹 Si no existe, crearlo
        if ($empleadoIndex === -1) {
            $empleadosPoda[] = [
                'nombre' => $nombreEmpleado,
                'movimientos' => []
            ];
            $empleadoIndex = count($empleadosPoda) - 1;
        }

        // 🔹 Armar movimiento según reglas
        if (intval($row['es_extra']) === 0) {
            // PODA normal
            $movimiento = [
                'id' => intval($row['id_movimiento']),
                'concepto' => $row['concepto'],
                'fecha' => $row['fecha'],
                'arboles_podados' => intval($row['arboles_podados']),
                'monto' => floatval($row['monto'])
            ];
        } else {
            // EXTRA (sin árboles)
            $movimiento = [
                'id' => intval($row['id_movimiento']),
                'concepto' => $row['concepto'],
                'fecha' => $row['fecha'],
                'monto' => floatval($row['monto'])
            ];
        }

        // 🔹 Agregar movimiento al empleado
        $empleadosPoda[$empleadoIndex]['movimientos'][] = $movimiento;
    }

    return $empleadosPoda;
}