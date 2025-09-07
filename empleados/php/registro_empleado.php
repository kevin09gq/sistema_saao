<?php
include("../../config/config.php");
include("../../conexion/conexion.php");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // =============================
    // RECIBIR DATOS DEL FORMULARIO
    // =============================
    $clave_empleado = $_POST['clave_empleado'] ?? null;
    $nombre = $_POST['nombre'] ?? null;
    $ap_paterno = $_POST['ap_paterno'] ?? null;
    $ap_materno = $_POST['ap_materno'] ?? null;
    $sexo = $_POST['sexo'] ?? null;
    $domicilio = $_POST['domicilio'] ?? null;
    $imss = $_POST['imss'] ?? null;
    $curp = $_POST['curp'] ?? null;
    $grupo_sanguineo = $_POST['grupo_sanguineo'] ?? null;
    $enfermedades_alergias = $_POST['enfermedades_alergias'] ?? null;
    $fecha_ingreso = $_POST['fecha_ingreso'] ?? null;
    $id_departamento = $_POST['id_departamento'] ?? null;
    $num_casillero = $_POST['num_casillero'] ?? null;

    // Nuevos campos opcionales
    $fecha_nacimiento = $_POST['fecha_nacimiento'] ?? null;
    $id_area = $_POST['id_area'] ?? null;
    $id_puestoEspecial = $_POST['id_puestoEspecial'] ?? null;
    $id_empresa = $_POST['id_empresa'] ?? null;

    // Campos de salario
    $salario_diario = $_POST['salario_diario'] ?? null;
    $salario_mensual = $_POST['salario_mensual'] ?? null;

    // Contacto de emergencia
    $emergencia_nombre = $_POST['emergencia_nombre'] ?? null;
    $emergencia_ap_paterno = $_POST['emergencia_ap_paterno'] ?? null;
    $emergencia_ap_materno = $_POST['emergencia_ap_materno'] ?? null;
    $emergencia_parentesco = $_POST['emergencia_parentesco'] ?? null;
    $emergencia_telefono = $_POST['emergencia_telefono'] ?? null;
    $emergencia_domicilio = $_POST['emergencia_domicilio'] ?? null;

    // =============================
    // FORMATEAR FECHAS
    // =============================
    $fecha_ingreso = !empty($fecha_ingreso) ? date('Y-m-d', strtotime($fecha_ingreso)) : null;
    $fecha_nacimiento = !empty($fecha_nacimiento) ? date('Y-m-d', strtotime($fecha_nacimiento)) : null;

    // =============================
    // VALIDAR CAMPOS OBLIGATORIOS
    // =============================
    if (empty($clave_empleado) || empty($nombre) || empty($ap_paterno) || empty($sexo)) {

         $respuesta = array(
            "title" => "ADVERTENCIA",
            "text" => "Existen campos obligatorios vacíos.",
            "type" => "warning",
            "icon" => $rutaRaiz . "plugins/toasts/icons/icon_warning.png",
            "timeout" => 3000,
        );
        header('Content-Type: application/json');
        echo json_encode($respuesta);
        exit();
    }

    // =============================
    // VALIDAR CONTACTO DE EMERGENCIA
    // =============================
    // Verificar si se llenó algún campo del contacto de emergencia
    $alguno_contacto_lleno = !empty($emergencia_nombre) || !empty($emergencia_ap_paterno) || 
                            !empty($emergencia_ap_materno) || !empty($emergencia_parentesco) || 
                            !empty($emergencia_telefono) || !empty($emergencia_domicilio);
    
    // Si se llenó algún campo, verificar que esté el nombre completo
    if ($alguno_contacto_lleno) {
        if (empty($emergencia_nombre) || empty($emergencia_ap_paterno) || empty($emergencia_ap_materno)) {
            $respuesta = array(
                "title" => "ADVERTENCIA",
                "text" => "Si proporciona información del contacto de emergencia, debe incluir el nombre completo (nombre, apellido paterno y apellido materno).",
                "type" => "warning",
                "icon" => $rutaRaiz . "plugins/toasts/icons/icon_warning.png",
                "timeout" => 4000,
            );
            header('Content-Type: application/json');
            echo json_encode($respuesta);
            exit();
        }
    }

    // =============================
    // VERIFICAR CLAVE EXISTENTE
    // =============================
    $sql = $conexion->prepare("SELECT id_empleado FROM info_empleados WHERE clave_empleado = ?");
    $sql->bind_param("s", $clave_empleado);
    $sql->execute();
    $sql->bind_result($id_empleado_existente);
    $sql->fetch();
    $sql->close();

    if ($id_empleado_existente) {
        $respuesta = array(
            "title" => "ADVERTENCIA",
            "text" => "La clave de empleado ya existe.",
            "type" => "warning",
            "icon" => $rutaRaiz . "plugins/toasts/icons/icon_warning.png",
            "timeout" => 3000,
        );
        header('Content-Type: application/json');
        echo json_encode($respuesta);
        exit();
    }

    // =============================
    // CONVERTIR CAMPOS VACÍOS A NULL
    // =============================
    $id_departamento = !empty($id_departamento) ? (int)$id_departamento : null;
    $id_area = !empty($id_area) ? (int)$id_area : null;
    $id_puestoEspecial = !empty($id_puestoEspecial) ? (int)$id_puestoEspecial : null;
    $id_empresa = !empty($id_empresa) ? (int)$id_empresa : null;

    // Convertir salarios a decimal o null
    $salario_diario = !empty($salario_diario) ? (float)$salario_diario : null;
    $salario_mensual = !empty($salario_mensual) ? (float)$salario_mensual : null;

    // =============================
    // INSERTAR EMPLEADO
    // =============================
    $sql = $conexion->prepare(
        "INSERT INTO info_empleados (
            id_rol, id_status, nombre, ap_paterno, ap_materno, domicilio,
            imss, curp, sexo, enfermedades_alergias, grupo_sanguineo,
            fecha_ingreso, fecha_nacimiento, num_casillero, id_departamento, 
            id_area, id_puestoEspecial, id_empresa, clave_empleado, salario_semanal, salario_mensual
        ) VALUES (2, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );

    $sql->bind_param(
        "sssssssssssssiiisdd", // 19 parámetros: 13 strings + 4 enteros + 2 decimales
        $nombre,
        $ap_paterno,
        $ap_materno,
        $domicilio,
        $imss,
        $curp,
        $sexo,
        $enfermedades_alergias,
        $grupo_sanguineo,
        $fecha_ingreso,
        $fecha_nacimiento,
        $num_casillero,
        $id_departamento,
        $id_area,
        $id_puestoEspecial,
        $id_empresa,
        $clave_empleado,
        $salario_diario,
        $salario_mensual
    );

    if (!$sql->execute()) {
        exit("Error al registrar empleado: " . $sql->error);
    }

    $id_empleado = $conexion->insert_id;
    $sql->close();

    // =============================
    // INSERTAR CONTACTO DE EMERGENCIA
    // =============================
    if (!empty($emergencia_nombre) && !empty($emergencia_ap_paterno) && !empty($emergencia_ap_materno)) {
        // Verificar si ya existe
        $sql = $conexion->prepare(
            "SELECT id_contacto FROM contacto_emergencia WHERE nombre = ? AND ap_paterno = ? AND ap_materno = ?"
        );
        $sql->bind_param("sss", $emergencia_nombre, $emergencia_ap_paterno, $emergencia_ap_materno);
        $sql->execute();
        $sql->bind_result($id_contacto);
        $sql->fetch();
        $sql->close();

        if (empty($id_contacto)) {
            $sqlContacto = $conexion->prepare(
                "INSERT INTO contacto_emergencia (nombre, ap_paterno, ap_materno, telefono, domicilio)
                VALUES (?, ?, ?, ?, ?)"
            );
            $sqlContacto->bind_param(
                "sssss",
                $emergencia_nombre,
                $emergencia_ap_paterno,
                $emergencia_ap_materno,
                $emergencia_telefono,
                $emergencia_domicilio
            );
            if (!$sqlContacto->execute()) {
                exit("Error al registrar contacto de emergencia: " . $sqlContacto->error);
            }
            $id_contacto = $conexion->insert_id;
            $sqlContacto->close();
        }

        // Insertar relación empleado-contacto
        $parentesco = !empty($emergencia_parentesco) ? $emergencia_parentesco : null;
        $sqlRel = $conexion->prepare(
            "INSERT INTO empleado_contacto (id_empleado, id_contacto, parentesco) VALUES (?, ?, ?)"
        );
        $sqlRel->bind_param("iis", $id_empleado, $id_contacto, $parentesco);
        if (!$sqlRel->execute()) {
            exit("Error al registrar relación empleado-contacto: " . $sqlRel->error);
        }
        $sqlRel->close();
    }

    $respuesta = array(
        "success" => true,
        "title" => "ÉXITO",
        "text" => "Empleado registrado correctamente.",
        "type" => "success",
        "icon" => $rutaRaiz . "plugins/toasts/icons/icon_success.png",
        "timeout" => 3000,
    );
    header('Content-Type: application/json');
    echo json_encode($respuesta);
}
