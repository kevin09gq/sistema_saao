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
                $fechaIngreso = $_POST['fecha_ingreso'] ?? null; // opcional
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
            'imss' => $row['imss'],
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
        e.fecha_nacimiento,
        (SELECT GROUP_CONCAT(c.num_casillero SEPARATOR ', ') FROM empleado_casillero ec INNER JOIN 
        casilleros c ON ec.num_casillero = c.num_casillero WHERE ec.id_empleado = e.id_empleado) AS num_casillero,
        e.ruta_foto,
        e.salario_semanal,
        e.salario_mensual,
        e.biometrico,
        e.telefono_empleado,
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
        ) AS ultima_fecha_reingreso
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
            'fecha_ingreso' => $row['fecha_ingreso'],
            'fecha_nacimiento' => $row['fecha_nacimiento'],
            'num_casillero' => $row['num_casillero'],
            'ruta_foto' => $row['ruta_foto'],
            'salario_semanal' => $row['salario_semanal'],
            'salario_mensual' => $row['salario_mensual'],
            'biometrico' => $row['biometrico'],
            'telefono_empleado' => $row['telefono_empleado'],
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
            'ultima_fecha_reingreso' => $row['ultima_fecha_reingreso']
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
        // Pasa de Activo -> Baja
        // Traer el último registro del historial
        $stmtHist = $conexion->prepare("SELECT id_historial, fecha_reingreso, fecha_salida FROM historial_reingresos WHERE id_empleado = ? ORDER BY fecha_reingreso DESC, id_historial DESC LIMIT 1");
        $stmtHist->bind_param("i", $idEmpleado);
        $stmtHist->execute();
        $resHist = $stmtHist->get_result();

        if ($resHist->num_rows === 0) {
            // No existe historial: usar fecha_ingreso del empleado (preferente la de BD)
            $stmtFI = $conexion->prepare("SELECT fecha_ingreso FROM info_empleados WHERE id_empleado = ? LIMIT 1");
            $stmtFI->bind_param("i", $idEmpleado);
            $stmtFI->execute();
            $resFI = $stmtFI->get_result();
            $fechaIngresoBD = null;
            if ($rowFI = $resFI->fetch_assoc()) {
                $fechaIngresoBD = $rowFI['fecha_ingreso'];
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

function eliminarReingreso($idHistorial)
{
    global $conexion;
    $stmt = $conexion->prepare("DELETE FROM historial_reingresos WHERE id_historial = ? LIMIT 1");
    $stmt->bind_param("i", $idHistorial);
    $ok = $stmt->execute();
    $stmt->close();

    // Responder simple como el resto de endpoints
    print_r($ok ? true : false);
}

function nuevoReingreso($idEmpleado, $fechaReingreso, $fechaSalida)
{
    global $conexion;

    // Normalizar fecha_salida: si viene vacía, establecer a NULL
    $fechaSalida = ($fechaSalida === '' || $fechaSalida === null) ? null : $fechaSalida;

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
        print_r($insertId);
    } else {
        print_r(false);
    }
}

function editarReingreso($idHistorial, $fechaReingreso, $fechaSalida)
{
    global $conexion;

    // Normalizar fecha_salida: si viene vacía, establecer a NULL
    $fechaSalida = ($fechaSalida === '' || $fechaSalida === null) ? null : $fechaSalida;

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

    print_r($ok ? true : false);
}