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
                $fechaIngreso = $_POST['fecha_alta_empresa'] ?? null; // opcional
                cambiarStatus($idEmpleado, $idStatus, $fechaIngreso);
            }


            break;

        case 'eliminarReingreso':
            if (isset($_POST['id_historial'])) {
                $idHistorial = (int)$_POST['id_historial'];
                eliminarReingreso($idHistorial);
            }
            break;

        case 'editarReingreso':
            if (isset($_POST['id_historial']) && isset($_POST['fecha_reingreso'])) {
                $idHistorial = (int)$_POST['id_historial'];
                $fechaReingreso = $_POST['fecha_reingreso'];
                $fechaSalida = $_POST['fecha_salida'] ?? null; // puede ser null o cadena vacía
                editarReingreso($idHistorial, $fechaReingreso, $fechaSalida);
            }
            break;

        case 'nuevoReingreso':
            if (isset($_POST['id_empleado']) && isset($_POST['fecha_reingreso'])) {
                $idEmpleado = (int)$_POST['id_empleado'];
                $fechaReingreso = $_POST['fecha_reingreso'];
                $fechaSalida = $_POST['fecha_salida'] ?? null; // puede venir vacía
                nuevoReingreso($idEmpleado, $fechaReingreso, $fechaSalida);
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
        e.imss,
        e.status_nss,
        s.id_status, 
        s.nombre_status, 
        e.id_area,
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
            'imss' => $row['imss'],
            'status_nss' => $row['status_nss'],
            'id_status' => $row['id_status'],
            'nombre_status' => $row['nombre_status'],
            'id_departamento' => $row['id_departamento'],
            'nombre_departamento' => $row['nombre_departamento'],
            'id_area' => $row['id_area']
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
        e.fecha_alta_empresa,
        e.fecha_alta_imss,
        e.fecha_nacimiento,
        (SELECT GROUP_CONCAT(c.num_casillero SEPARATOR ', ') FROM empleado_casillero ec INNER JOIN 
        casilleros c ON ec.num_casillero = c.num_casillero WHERE ec.id_empleado = e.id_empleado) AS num_casillero,
        e.ruta_foto,
        e.salario_semanal,
        e.salario_diario,
        e.biometrico,
        e.telefono_empleado,
        e.status_nss,
        e.rfc_empleado,
        e.estado_civil,
        d.id_departamento AS id_departamento,
        d.nombre_departamento AS departamento,
        emp.id_empresa AS id_empresa,
        emp.nombre_empresa AS nombre_empresa,
        a.id_area AS id_area,
        a.nombre_area AS nombre_area,
        p.id_puestoEspecial AS id_puesto,
        p.nombre_puesto AS nombre_puesto,
        cont.nombre AS nombre_contacto,
        cont.ap_paterno AS apellido_paterno_contacto,
        cont.ap_materno AS apellido_materno_contacto,
        cont.telefono AS telefono_contacto,
        cont.domicilio AS domicilio_contacto,
        ec.parentesco,
        (
            SELECT hr.fecha_reingreso
            FROM historial_reingresos hr
            WHERE hr.id_empleado = e.id_empleado
            ORDER BY hr.fecha_reingreso DESC
            LIMIT 1
        ) AS ultima_fecha_reingreso,
        ehr.horario,
        ho.horario_oficial,
        e.horario_fijo
    FROM 
        info_empleados e
    LEFT JOIN 
        departamentos d ON e.id_departamento = d.id_departamento
    LEFT JOIN 
        empresa emp ON e.id_empresa = emp.id_empresa
    LEFT JOIN 
        areas a ON e.id_area = a.id_area
    LEFT JOIN 
        puestos_especiales p ON e.id_puestoEspecial = p.id_puestoEspecial
    LEFT JOIN 
        empleado_contacto ec ON e.id_empleado = ec.id_empleado
    LEFT JOIN 
        contacto_emergencia cont ON ec.id_contacto = cont.id_contacto
    LEFT JOIN 
        empleado_horario_reloj ehr ON ehr.id_empleado = e.id_empleado
    LEFT JOIN
        horarios_oficiales ho ON ho.id_empleado = e.id_empleado
    WHERE e.id_empleado = ? AND e.clave_empleado = ?");

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
            'fecha_alta_empresa' => $row['fecha_alta_empresa'],
            'fecha_alta_imss' => $row['fecha_alta_imss'],
            'fecha_nacimiento' => $row['fecha_nacimiento'],
            'num_casillero' => $row['num_casillero'],
            'ruta_foto' => $row['ruta_foto'],
            'salario_semanal' => $row['salario_semanal'],
            'salario_diario' => $row['salario_diario'],
            'biometrico' => $row['biometrico'],
            'telefono_empleado' => $row['telefono_empleado'],
            'status_nss' => $row['status_nss'],
            'rfc_empleado' => $row['rfc_empleado'],
            'estado_civil' => $row['estado_civil'],
            'id_departamento' => $row['id_departamento'],
            'departamento' => $row['departamento'],
            'id_empresa' => $row['id_empresa'],
            'nombre_empresa' => $row['nombre_empresa'],
            'id_area' => $row['id_area'],
            'nombre_area' => $row['nombre_area'],
            'id_puesto' => $row['id_puesto'],
            'nombre_puesto' => $row['nombre_puesto'],
            'nombre_contacto' => $row['nombre_contacto'],
            'apellido_paterno_contacto' => $row['apellido_paterno_contacto'],
            'apellido_materno_contacto' => $row['apellido_materno_contacto'],
            'telefono_contacto' => $row['telefono_contacto'],
            'domicilio_contacto' => $row['domicilio_contacto'],
            'parentesco' => $row['parentesco'],
            'ultima_fecha_reingreso' => $row['ultima_fecha_reingreso'],
            'horario_reloj' => json_decode($row['horario'], true) ?? [],
            'horario_oficial' => $row['horario_oficial'],
            'horarios_oficiales' => ($row['horario_oficial'] !== null && $row['horario_oficial'] !== '') ? (json_decode($row['horario_oficial'], true) ?? []) : [],
            'horario_fijo' => (int)$row['horario_fijo']
        );

        // Agregar historial completo de reingresos/salidas del empleado
        $historial = array();
        $stmtHist = $conexion->prepare("SELECT id_historial, fecha_reingreso, fecha_salida FROM historial_reingresos WHERE id_empleado = ? ORDER BY fecha_reingreso ASC, id_historial ASC");
        $stmtHist->bind_param("i", $idEmpleado);
        $stmtHist->execute();
        $resHist = $stmtHist->get_result();
        while ($rowH = $resHist->fetch_assoc()) {
            $historial[] = array(
                'id_historial' => (int)$rowH['id_historial'],
                'fecha_reingreso' => $rowH['fecha_reingreso'],
                'fecha_salida' => $rowH['fecha_salida']
            );
        }
        $stmtHist->close();
        $empleado['historial'] = $historial;

        // Agregar beneficiarios del empleado
        $beneficiarios = array();
        $stmtBenef = $conexion->prepare("SELECT 
            b.id_beneficiario,
            b.nombre AS nombre_beneficiario,
            b.ap_paterno AS apellido_paterno_beneficiario,
            b.ap_materno AS apellido_materno_beneficiario,
            eb.parentesco,
            eb.porcentaje
        FROM 
            empleado_beneficiario eb
        INNER JOIN 
            beneficiarios b ON eb.id_beneficiario = b.id_beneficiario
        WHERE 
            eb.id_empleado = ?");
        $stmtBenef->bind_param("i", $idEmpleado);
        $stmtBenef->execute();
        $resBenef = $stmtBenef->get_result();
        while ($rowB = $resBenef->fetch_assoc()) {
            $beneficiarios[] = array(
                'id_beneficiario' => (int)$rowB['id_beneficiario'],
                'nombre_beneficiario' => $rowB['nombre_beneficiario'],
                'apellido_paterno_beneficiario' => $rowB['apellido_paterno_beneficiario'],
                'apellido_materno_beneficiario' => $rowB['apellido_materno_beneficiario'],
                'parentesco' => $rowB['parentesco'],
                'porcentaje' => (float)$rowB['porcentaje']
            );
        }
        $stmtBenef->close();
        $empleado['beneficiarios'] = $beneficiarios;
    }

    header('Content-Type: application/json');
    echo json_encode($empleado, JSON_UNESCAPED_UNICODE);
}

function cambiarStatus($idEmpleado, $idStatus, $fechaIngreso = null)
{
    global $conexion;

    // Estado actual que recibimos del cliente (antes del toggle)
    $estadoActual = (int)$idStatus; // 1=Activo, 2=Baja
    $hoy = date('Y-m-d');

    if ($estadoActual === 1) {

        // si el empleado tiene algún préstamo ACTIVO o PAUSADO, no se puede desactivar
        $stmtPrest = $conexion->prepare("SELECT 1 FROM prestamos WHERE id_empleado = ? AND estado IN ('activo','pausado') LIMIT 1");
        if ($stmtPrest) {
            $stmtPrest->bind_param("i", $idEmpleado);
            $stmtPrest->execute();
            $resPrest = $stmtPrest->get_result();
            $tienePrestamoBloqueante = ($resPrest && $resPrest->num_rows > 0);
            $stmtPrest->close();

            if ($tienePrestamoBloqueante) {
                print_r(false);
                return;
            }
        }

        // Pasa de Activo -> Baja
        // Traer el último registro del historial
        $stmtHist = $conexion->prepare("SELECT id_historial, fecha_reingreso, fecha_salida FROM historial_reingresos WHERE id_empleado = ? ORDER BY fecha_reingreso DESC, id_historial DESC LIMIT 1");
        $stmtHist->bind_param("i", $idEmpleado);
        $stmtHist->execute();
        $resHist = $stmtHist->get_result();

        if ($resHist->num_rows === 0) {
            // No existe historial: usar fecha_alta_empresa del empleado (preferente la de BD)
            $stmtFI = $conexion->prepare("SELECT fecha_alta_empresa FROM info_empleados WHERE id_empleado = ? LIMIT 1");
            $stmtFI->bind_param("i", $idEmpleado);
            $stmtFI->execute();
            $resFI = $stmtFI->get_result();
            $fechaIngresoBD = null;
            if ($rowFI = $resFI->fetch_assoc()) {
                $fechaIngresoBD = $rowFI['fecha_alta_empresa'];
            }
            $stmtFI->close();

            $fechaReingreso = $fechaIngresoBD ?: ($fechaIngreso ?: $hoy);

            $stmtIns = $conexion->prepare("INSERT INTO historial_reingresos (id_empleado, fecha_reingreso, fecha_salida) VALUES (?, ?, ?)");
            $stmtIns->bind_param("iss", $idEmpleado, $fechaReingreso, $hoy);
            $stmtIns->execute();
            $stmtIns->close();
        } else {
            // Si hay historial: cerrar el último periodo si está abierto
            $rowHist = $resHist->fetch_assoc();
            $idHistorialUltimo = (int)$rowHist['id_historial'];
            $fechaSalidaUltimo = $rowHist['fecha_salida'];

            if ($fechaSalidaUltimo === null || $fechaSalidaUltimo === '' || $fechaSalidaUltimo === '0000-00-00') {
                $stmtUpd = $conexion->prepare("UPDATE historial_reingresos SET fecha_salida = ? WHERE id_historial = ?");
                $stmtUpd->bind_param("si", $hoy, $idHistorialUltimo);
                $stmtUpd->execute();
                $stmtUpd->close();
            }
        }
        $stmtHist->close();
    } elseif ($estadoActual === 2) {
        // Pasa de Baja -> Activo: abrir nuevo periodo con fecha_reingreso = hoy y salida NULL
        $stmtIns = $conexion->prepare("INSERT INTO historial_reingresos (id_empleado, fecha_reingreso, fecha_salida) VALUES (?, ?, NULL)");
        $stmtIns->bind_param("is", $idEmpleado, $hoy);
        $stmtIns->execute();
        $stmtIns->close();
    }

    // Toggle del estado en info_empleados (como estaba)
    if ($idStatus == 1) {
        $idStatus = 2; // Cambiar a Inactivo
    } elseif ($idStatus == 2) {
        $idStatus = 1; // Cambiar a Activo
    }

    $sql = $conexion->prepare("UPDATE info_empleados SET id_status = ? WHERE id_empleado = ?");
    $sql->bind_param("ii", $idStatus, $idEmpleado);
    $sql->execute();
    $sql->close();

    print_r(true);
}

function validarHistorialCronologico($idEmpleado, $idHistorialEvitar, $nuevaEntrada, $nuevaSalida, &$errorMsg)
{
    global $conexion;

    // Obtener la fecha de alta de la empresa del empleado
    $stmtEmp = $conexion->prepare("SELECT fecha_alta_empresa FROM info_empleados WHERE id_empleado = ? LIMIT 1");
    if ($stmtEmp) {
        $stmtEmp->bind_param("i", $idEmpleado);
        $stmtEmp->execute();
        $stmtEmp->bind_result($fechaAltaEmpresa);
        $stmtEmp->fetch();
        $stmtEmp->close();
    }

    if (empty($fechaAltaEmpresa)) {
        $errorMsg = "No se encontró la fecha de alta de la empresa para este empleado.";
        return false;
    }

    if ($nuevaEntrada < $fechaAltaEmpresa) {
        $errorMsg = "La fecha de reingreso no puede ser anterior a la fecha de alta de la empresa ($fechaAltaEmpresa).";
        return false;
    }

    if ($nuevaSalida !== null && $nuevaSalida < $fechaAltaEmpresa) {
        $errorMsg = "La fecha de salida no puede ser anterior a la fecha de alta de la empresa ($fechaAltaEmpresa).";
        return false;
    }

    // Obtener todos los otros registros del historial
    $historial = [];
    $stmtHist = $conexion->prepare("SELECT id_historial, fecha_reingreso, fecha_salida FROM historial_reingresos WHERE id_empleado = ? AND id_historial != ? ORDER BY fecha_reingreso ASC, id_historial ASC");
    if ($stmtHist) {
        $idHistorialEvitarInt = (int)$idHistorialEvitar;
        $stmtHist->bind_param("ii", $idEmpleado, $idHistorialEvitarInt);
        $stmtHist->execute();
        $resHist = $stmtHist->get_result();
        while ($row = $resHist->fetch_assoc()) {
            $historial[] = [
                'id' => $row['id_historial'],
                'entrada' => $row['fecha_reingreso'],
                'salida' => $row['fecha_salida']
            ];
        }
        $stmtHist->close();
    }

    // Agregar el propuesto
    $historial[] = [
        'id' => $idHistorialEvitar,
        'entrada' => $nuevaEntrada,
        'salida' => $nuevaSalida
    ];

    // Ordenar por fecha_reingreso
    usort($historial, function ($a, $b) {
        return strcmp($a['entrada'], $b['entrada']);
    });

    // Validar el primer registro
    if (count($historial) > 0) {
        if ($historial[0]['entrada'] !== $fechaAltaEmpresa) {
            $errorMsg = "El primer reingreso debe coincidir exactamente con la fecha de alta de la empresa ($fechaAltaEmpresa).";
            return false;
        }
    }

    // Validar orden y traslapes
    for ($i = 0; $i < count($historial); $i++) {
        $cur = $historial[$i];
        if ($cur['salida'] !== null && $cur['salida'] < $cur['entrada']) {
            $errorMsg = "La fecha de salida (" . $cur['salida'] . ") no puede ser anterior a la de entrada/reingreso (" . $cur['entrada'] . ").";
            return false;
        }

        if ($i < count($historial) - 1) {
            $next = $historial[$i + 1];
            if ($cur['salida'] === null) {
                $errorMsg = "No se puede registrar un reingreso posterior si el periodo anterior aún está activo (sin fecha de salida).";
                return false;
            }
            if ($next['entrada'] <= $cur['salida']) {
                $errorMsg = "Las fechas no pueden sobreponerse. El siguiente reingreso (" . $next['entrada'] . ") debe ser posterior a la salida anterior (" . $cur['salida'] . ").";
                return false;
            }
        }
    }

    return true;
}

function sincronizarEstatusEmpleado($idEmpleado)
{
    global $conexion;

    // Buscar el reingreso más reciente (el último ordenado por fecha_reingreso DESC, id_historial DESC)
    $stmt = $conexion->prepare("SELECT fecha_salida FROM historial_reingresos WHERE id_empleado = ? ORDER BY fecha_reingreso DESC, id_historial DESC LIMIT 1");
    if ($stmt) {
        $stmt->bind_param("i", $idEmpleado);
        $stmt->execute();
        $stmt->store_result();
        
        $idStatus = 1; // Por defecto Activo (si no hay registros)
        
        if ($stmt->num_rows > 0) {
            $stmt->bind_result($fechaSalida);
            $stmt->fetch();
            
            // Si tiene fecha de salida no nula y no vacía, es Baja (2)
            if ($fechaSalida !== null && $fechaSalida !== '' && $fechaSalida !== '0000-00-00') {
                $idStatus = 2; // Baja
            } else {
                $idStatus = 1; // Activo
            }
        }
        $stmt->close();

        // Actualizar el estatus del empleado en la tabla info_empleados
        $stmtStatus = $conexion->prepare("UPDATE info_empleados SET id_status = ? WHERE id_empleado = ?");
        if ($stmtStatus) {
            $stmtStatus->bind_param("ii", $idStatus, $idEmpleado);
            $stmtStatus->execute();
            $stmtStatus->close();
        }
    }
}

function eliminarReingreso($idHistorial)
{
    global $conexion;

    // Obtener el id_empleado y la fecha_salida de este historial antes de eliminarlo
    $idEmpleado = 0;
    $fechaSalida = null;
    $fechaReingreso = null;
    $stmtGet = $conexion->prepare("SELECT id_empleado, fecha_reingreso, fecha_salida FROM historial_reingresos WHERE id_historial = ? LIMIT 1");
    if ($stmtGet) {
        $stmtGet->bind_param("i", $idHistorial);
        $stmtGet->execute();
        $stmtGet->bind_result($idEmpleado, $fechaReingreso, $fechaSalida);
        $stmtGet->fetch();
        $stmtGet->close();
    }

    if ($idEmpleado > 0) {
        // Verificar si existe algún registro más reciente (con fecha_reingreso mayor, o con id_historial mayor si es el mismo día)
        $stmtCheck = $conexion->prepare("SELECT COUNT(*) FROM historial_reingresos WHERE id_empleado = ? AND (fecha_reingreso > ? OR (fecha_reingreso = ? AND id_historial > ?))");
        if ($stmtCheck) {
            $stmtCheck->bind_param("issi", $idEmpleado, $fechaReingreso, $fechaReingreso, $idHistorial);
            $stmtCheck->execute();
            $stmtCheck->bind_result($countNewer);
            $stmtCheck->fetch();
            $stmtCheck->close();

            if ($countNewer > 0) {
                // Hay registros más recientes, no permitir eliminar
                print_r(false);
                return;
            }
        }
    }

    // Proceder a eliminar
    $stmt = $conexion->prepare("DELETE FROM historial_reingresos WHERE id_historial = ? LIMIT 1");
    $stmt->bind_param("i", $idHistorial);
    $ok = $stmt->execute();
    $stmt->close();

    if ($ok && $idEmpleado > 0) {
        // Sincronizar el estatus del empleado basado en su nuevo historial
        sincronizarEstatusEmpleado($idEmpleado);
    }

    print_r($ok ? true : false);
}

function nuevoReingreso($idEmpleado, $fechaReingreso, $fechaSalida)
{
    global $conexion;

    // Normalizar fecha_salida: si viene vacía, establecer a NULL
    $fechaSalida = ($fechaSalida === '' || $fechaSalida === null) ? null : $fechaSalida;

    $errorMsg = "";
    if (!validarHistorialCronologico($idEmpleado, 0, $fechaReingreso, $fechaSalida, $errorMsg)) {
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'message' => $errorMsg]);
        return;
    }

    if ($fechaSalida === null) {
        $stmt = $conexion->prepare("INSERT INTO historial_reingresos (id_empleado, fecha_reingreso, fecha_salida) VALUES (?, ?, NULL)");
        $stmt->bind_param("is", $idEmpleado, $fechaReingreso);
    } else {
        $stmt = $conexion->prepare("INSERT INTO historial_reingresos (id_empleado, fecha_reingreso, fecha_salida) VALUES (?, ?, ?)");
        $stmt->bind_param("iss", $idEmpleado, $fechaReingreso, $fechaSalida);
    }

    $ok = $stmt->execute();
    $insertId = $ok ? $conexion->insert_id : 0;
    $stmt->close();

    if ($ok && $insertId > 0) {
        // Sincronizar el estatus del empleado
        sincronizarEstatusEmpleado($idEmpleado);
        print_r($insertId);
    } else {
        print_r(false);
    }
}

function editarReingreso($idHistorial, $fechaReingreso, $fechaSalida)
{
    global $conexion;

    // Obtener el id_empleado asociado a este historial
    $idEmpleado = 0;
    $stmtGet = $conexion->prepare("SELECT id_empleado FROM historial_reingresos WHERE id_historial = ? LIMIT 1");
    if ($stmtGet) {
        $stmtGet->bind_param("i", $idHistorial);
        $stmtGet->execute();
        $stmtGet->bind_result($idEmpleado);
        $stmtGet->fetch();
        $stmtGet->close();
    }

    if ($idEmpleado <= 0) {
        print_r(false);
        return;
    }

    // Normalizar fecha_salida: si viene vacía, establecer a NULL
    $fechaSalida = ($fechaSalida === '' || $fechaSalida === null) ? null : $fechaSalida;

    $errorMsg = "";
    if (!validarHistorialCronologico($idEmpleado, $idHistorial, $fechaReingreso, $fechaSalida, $errorMsg)) {
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'message' => $errorMsg]);
        return;
    }

    if ($fechaSalida === null) {
        // Actualizar con fecha_salida = NULL
        $stmt = $conexion->prepare("UPDATE historial_reingresos SET fecha_reingreso = ?, fecha_salida = NULL WHERE id_historial = ?");
        $stmt->bind_param("si", $fechaReingreso, $idHistorial);
    } else {
        // Actualizar ambas fechas
        $stmt = $conexion->prepare("UPDATE historial_reingresos SET fecha_reingreso = ?, fecha_salida = ? WHERE id_historial = ?");
        $stmt->bind_param("ssi", $fechaReingreso, $fechaSalida, $idHistorial);
    }

    $ok = $stmt->execute();
    $stmt->close();

    if ($ok) {
        // Sincronizar el estatus del empleado
        sincronizarEstatusEmpleado($idEmpleado);
    }

    print_r($ok ? true : false);
}