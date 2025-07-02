<?php
include("../../conexion/conexion.php");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
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

    // Contacto de emergencia
    $emergencia_nombre = $_POST['emergencia_nombre'] ?? null;
    $emergencia_ap_paterno = $_POST['emergencia_ap_paterno'] ?? null;
    $emergencia_ap_materno = $_POST['emergencia_ap_materno'] ?? null;
    $emergencia_parentesco = $_POST['emergencia_parentesco'] ?? null;
    $emergencia_telefono = $_POST['emergencia_telefono'] ?? null;
    $emergencia_domicilio = $_POST['emergencia_domicilio'] ?? null;

    // Adaptar fecha al formato MySQL si viene en otro formato
    if ($fecha_ingreso) {
        $fecha_ingreso = date('Y-m-d', strtotime($fecha_ingreso));
    } else {
        $fecha_ingreso = null;
    }

    // Validar campos obligatorios
    if (empty($clave_empleado) || empty($nombre) || empty($ap_paterno) || empty($sexo)) {
        print_r("Error: Todos los campos obligatorios deben estar llenos.");
        exit;
    }

    // Verificar si la clave de empleado ya existe
    $sql = $conexion->prepare("SELECT id_empleado FROM info_empleados WHERE clave_empleado = ?");
    $sql->bind_param("i", $clave_empleado);
    $sql->execute();
    $sql->bind_result($id_empleado_existente);
    $sql->fetch();
    $sql->close();

    if ($id_empleado_existente) {
        print_r("Error: La clave de empleado ya existe.");
        exit;
    }

    // Insertar empleado
    if (empty($id_departamento)) {
        $sql = $conexion->prepare(
            "INSERT INTO info_empleados (
                id_rol, id_status, nombre, ap_paterno, ap_materno, domicilio,
                imss, curp, sexo, enfermedades_alergias, grupo_sanguineo,
                fecha_ingreso, id_departamento, clave_empleado
            ) VALUES (2, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?)"
        );
        $sql->bind_param(
            "ssssssssssi",
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
            $clave_empleado
        );
    } else {
        $id_departamento = (int)$id_departamento;
        $sql = $conexion->prepare(
            "INSERT INTO info_empleados (
                id_rol, id_status, nombre, ap_paterno, ap_materno, domicilio,
                imss, curp, sexo, enfermedades_alergias, grupo_sanguineo,
                fecha_ingreso, id_departamento, clave_empleado
            ) VALUES (2, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
        );
        $sql->bind_param(
            "ssssssssssii",
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
            $id_departamento,
            $clave_empleado
        );
    }

    if (!$sql->execute()) {
        print_r("Error al registrar empleado: " . $sql->error);
        exit;
    }
    $id_empleado = $conexion->insert_id;
    $sql->close();

    // Insertar o relacionar contacto de emergencia si nombre y apellidos están llenos
    if (!empty($emergencia_nombre) && !empty($emergencia_ap_paterno) && !empty($emergencia_ap_materno)) {
        // Verificar si ya existe el contacto de emergencia
        $sql = $conexion->prepare("SELECT id_contacto FROM contacto_emergencia WHERE nombre = ? AND ap_paterno = ? AND ap_materno = ?");
        $sql->bind_param("sss", $emergencia_nombre, $emergencia_ap_paterno, $emergencia_ap_materno);
        $sql->execute();
        $sql->bind_result($id_contacto);
        $sql->fetch();
        $sql->close();

        // Si no existe, insertar contacto
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
                print_r("Error al registrar contacto de emergencia: " . $sqlContacto->error);
                exit;
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
            print_r("Error al registrar relación empleado-contacto: " . $sqlRel->error);
            exit;
        }
        $sqlRel->close();
    }

    print_r("Empleado registrado correctamente.");
}
