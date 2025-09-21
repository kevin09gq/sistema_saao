<?php
include("../../config/config.php");
include("../../conexion/conexion.php");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $id_empleado = $_POST['id_empleado'];
    $clave_empleado = $_POST['clave_empleado'];
    $nombre_empleado = $_POST['nombre_empleado'];
    $ap_paterno = $_POST['apellido_paterno_empleado'];
    $ap_materno = $_POST['apellido_materno_empleado'];
    $sexo = $_POST['sexo'];
    $domicilio = $_POST['domicilio_empleado'] ?? null;
    $imss = $_POST['imss'] ?? null;
    $curp = $_POST['curp'] ?? null;
    $grupo_sanguineo = $_POST['grupo_sanguineo'] ?? null;
    $enfermedades_alergias = $_POST['enfermedades_alergias'] ?? null;
    $fecha_ingreso = $_POST['fecha_ingreso'] ?? null;
    $id_departamento = $_POST['id_departamento'] ?? null;

    // Nuevos campos agregados
    $fecha_nacimiento = $_POST['fecha_nacimiento'] ?? null;
    $num_casillero = $_POST['num_casillero'] ?? null;
    $id_empresa = $_POST['id_empresa'] ?? null;
    $id_area = $_POST['id_area'] ?? null;
    $id_puestoEspecial = $_POST['id_puestoEspecial'] ?? null;
    
    // Campos de salario
    $salario_semanal = $_POST['salario_semanal'] ?? null;
    $salario_mensual = $_POST['salario_mensual'] ?? null;

    // Contacto de emergencia
    $emergencia_nombre = $_POST['nombre_contacto'] ?? null;
    $emergencia_ap_paterno = $_POST['apellido_paterno_contacto'] ?? null;
    $emergencia_ap_materno = $_POST['apellido_materno_contacto'] ?? null;
    $emergencia_parentesco = $_POST['parentesco'] ?? null;
    $emergencia_telefono = $_POST['telefono_contacto'] ?? null;
    $emergencia_domicilio = $_POST['domicilio_contacto'] ?? null;

    // Convertir fecha si viene
    if ($fecha_ingreso) {
        $fecha_ingreso = date('Y-m-d', strtotime($fecha_ingreso));
    } else {
        $fecha_ingreso = null;
    }

    // Convertir fecha de nacimiento si viene
    if ($fecha_nacimiento) {
        $fecha_nacimiento = date('Y-m-d', strtotime($fecha_nacimiento));
    } else {
        $fecha_nacimiento = null;
    }

    // Convertir valores "0" a NULL para los campos opcionales
    $id_empresa = ($id_empresa === "0" || $id_empresa === 0 || empty($id_empresa)) ? null : (int)$id_empresa;
    $id_area = ($id_area === "0" || $id_area === 0 || empty($id_area)) ? null : (int)$id_area;
    $id_puestoEspecial = ($id_puestoEspecial === "0" || $id_puestoEspecial === 0 || empty($id_puestoEspecial)) ? null : (int)$id_puestoEspecial;
    
    // Convertir salarios a decimal o null
    $salario_semanal = !empty($salario_semanal) ? (float)$salario_semanal : null;
    $salario_mensual = !empty($salario_mensual) ? (float)$salario_mensual : null;

    // Verificar si no hay campos obligatorios vacíos
    if (empty($clave_empleado) || empty($nombre_empleado) || empty($ap_paterno) || empty($ap_materno) || empty($sexo)) {
        exit;
    }

    // Regla 1: Si hay teléfono, parentesco o domicilio, debe haber nombre completo del contacto
    $hay_dato_contacto = !empty($emergencia_telefono) || !empty($emergencia_parentesco) || !empty($emergencia_domicilio);
    $nombre_incompleto = empty($emergencia_nombre) || empty($emergencia_ap_paterno) || empty($emergencia_ap_materno);

    if ($hay_dato_contacto && $nombre_incompleto) {
        $respuesta = array(
            "title" => "ADVERTENCIA",
            "text" => "Por favor, completa los datos del contacto de emergencia.",
            "type" => "warning",
            "icon" => $rutaRaiz . "plugins/toasts/icons/icon_warning.png",
            "timeout" => 3000,
        );
        header('Content-Type: application/json');
        echo json_encode($respuesta);
        exit();
    }

    // Regla 2: Si se llena una parte del nombre, deben estar las 3
    $hay_algo_nombre = !empty($emergencia_nombre) || !empty($emergencia_ap_paterno) || !empty($emergencia_ap_materno);
    if ($hay_algo_nombre && $nombre_incompleto) {
        $respuesta = array(
            "title" => "ADVERTENCIA",
            "text" => "Por favor, completa el nombre del contacto de emergencia.",
            "type" => "warning",
            "icon" => $rutaRaiz . "plugins/toasts/icons/icon_warning.png",
            "timeout" => 3000,
        );
        header('Content-Type: application/json');
        echo json_encode($respuesta);
        exit();
    }

    // Verificar si todos los campos de contacto de emergencia están vacíos
    if (
        empty($emergencia_nombre) && empty($emergencia_ap_paterno) && empty($emergencia_ap_materno) &&
        empty($emergencia_parentesco) && empty($emergencia_telefono) && empty($emergencia_domicilio)
    ) {
        // Verificar si el empleado se encuentra en la tabla empleado_contacto
        $sql_check_contacto = $conexion->prepare("SELECT COUNT(*) FROM empleado_contacto WHERE id_empleado = ?");
        $sql_check_contacto->bind_param("i", $id_empleado);
        $sql_check_contacto->execute();
        $sql_check_contacto->bind_result($existe_contacto);
        $sql_check_contacto->fetch();
        $sql_check_contacto->close();

        // Si el empleado se encuentra en la tabla empleado_contacto se le actualiza el id_contacto a NULL
        if ($existe_contacto > 0) {
            // Si el empleado tiene un contacto registrado, se elimina la relación
            $sql_delete_contacto = $conexion->prepare("UPDATE empleado_contacto SET id_contacto = NULL, parentesco = NULL WHERE id_empleado = ?");
            $sql_delete_contacto->bind_param("i", $id_empleado);
            $sql_delete_contacto->execute();
            $sql_delete_contacto->close();
        }
    }

    // Verificar si la clave de empleado ya existe para otro empleado
    $sql_check = $conexion->prepare("SELECT COUNT(*) FROM info_empleados WHERE clave_empleado = ? AND id_empleado != ?");
    $sql_check->bind_param("si", $clave_empleado, $id_empleado);
    $sql_check->execute();
    $sql_check->bind_result($count);
    $sql_check->fetch();
    $sql_check->close();

    if ($count > 0) {
        $respuesta = array(
            "title" => "ADVERTENCIA",
            "text" => "Clave de empleado ya está en uso.",
            "type" => "info",
            "icon" => $rutaRaiz . "plugins/toasts/icons/icon_info.png",
            "timeout" => 3000,
        );

        header('Content-Type: application/json');
        echo json_encode($respuesta);
        exit;
    }

    // Verificar si el ID departamento es 0
    if ($id_departamento === "0" || $id_departamento === 0) {
        // Consulta sin parámetro para id_departamento (usa NULL directo)
        $update_empleado = $conexion->prepare("UPDATE info_empleados
        SET 
            clave_empleado = ?,
            nombre = ?,
            ap_paterno = ?,
            ap_materno = ?,
            domicilio = ?,
            imss = ?,
            curp = ?,
            sexo = ?,
            grupo_sanguineo = ?,
            enfermedades_alergias = ?,
            fecha_ingreso = ?,
            fecha_nacimiento = ?,
            id_empresa = ?,
            id_area = ?,
            id_puestoEspecial = ?,
            salario_semanal = ?,
            salario_mensual = ?,
            id_departamento = NULL
        WHERE id_empleado = ?");

        $update_empleado->bind_param(
            "sssssssssssssiiddi",
            $clave_empleado,
            $nombre_empleado,
            $ap_paterno,
            $ap_materno,
            $domicilio,
            $imss,
            $curp,
            $sexo,
            $grupo_sanguineo,
            $enfermedades_alergias,
            $fecha_ingreso,
            $fecha_nacimiento,
            $id_empresa,
            $id_area,
            $id_puestoEspecial,
            $salario_semanal,
            $salario_mensual,
            $id_empleado
        );
    } else {
        // id_departamento tiene valor distinto de 0
        $update_empleado = $conexion->prepare("UPDATE info_empleados
        SET 
            clave_empleado = ?,
            nombre = ?,
            ap_paterno = ?,
            ap_materno = ?,
            domicilio = ?,
            imss = ?,
            curp = ?,
            sexo = ?,
            grupo_sanguineo = ?,
            enfermedades_alergias = ?,
            fecha_ingreso = ?,
            fecha_nacimiento = ?,
            id_empresa = ?,
            id_area = ?,
            id_puestoEspecial = ?,
            salario_semanal = ?,
            salario_mensual = ?,
            id_departamento = ?
        WHERE id_empleado = ?");

        $update_empleado->bind_param(
            "sssssssssssssiiiddi",
            $clave_empleado,
            $nombre_empleado,
            $ap_paterno,
            $ap_materno,
            $domicilio,
            $imss,
            $curp,
            $sexo,
            $grupo_sanguineo,
            $enfermedades_alergias,
            $fecha_ingreso,
            $fecha_nacimiento,
            $id_empresa,
            $id_area,
            $id_puestoEspecial,
            $salario_semanal,
            $salario_mensual,
            $id_departamento,
            $id_empleado
        );
    }

    $update_empleado->execute();
    $update_empleado->close();

// Primero, obtener el casillero actual del empleado
$sql_check_casillero_actual = $conexion->prepare("SELECT num_casillero FROM casilleros WHERE id_empleado = ?");
$sql_check_casillero_actual->bind_param("i", $id_empleado);
$sql_check_casillero_actual->execute();
$resultado_casillero_actual = $sql_check_casillero_actual->get_result();
$casillero_actual = $resultado_casillero_actual->fetch_assoc();
$sql_check_casillero_actual->close();

// Si se ingresó un número de casillero
if (!empty($num_casillero)) {
    // Verificar si existe
    $sql_verificar_casillero = $conexion->prepare("SELECT num_casillero FROM casilleros WHERE num_casillero = ?");
    $sql_verificar_casillero->bind_param("s", $num_casillero);
    $sql_verificar_casillero->execute();
    $resultado_verificar = $sql_verificar_casillero->get_result();
    $existe_casillero = $resultado_verificar->num_rows > 0;
    $sql_verificar_casillero->close();

    if (!$existe_casillero) {
        $respuesta = array(
            "title" => "ADVERTENCIA",
            "text" => "El casillero $num_casillero no existe en el sistema.",
            "type" => "warning",
            "icon" => $rutaRaiz . "plugins/toasts/icons/icon_warning.png",
            "timeout" => 5000,
        );
        header('Content-Type: application/json');
        echo json_encode($respuesta);
        exit();
    }

    // Verificar si está ocupado por otro empleado
    $sql_verificar_ocupado = $conexion->prepare("SELECT id_empleado FROM casilleros WHERE num_casillero = ? AND id_empleado IS NOT NULL AND id_empleado != ?");
    $sql_verificar_ocupado->bind_param("si", $num_casillero, $id_empleado);
    $sql_verificar_ocupado->execute();
    $resultado_ocupado = $sql_verificar_ocupado->get_result();
    $casillero_ocupado = $resultado_ocupado->num_rows > 0;
    $sql_verificar_ocupado->close();

    if ($casillero_ocupado) {
        $respuesta = array(
            "title" => "ADVERTENCIA",
            "text" => "El casillero $num_casillero ya está ocupado por otro empleado.",
            "type" => "warning",
            "icon" => $rutaRaiz . "plugins/toasts/icons/icon_warning.png",
            "timeout" => 5000,
        );
        header('Content-Type: application/json');
        echo json_encode($respuesta);
        exit();
    }

    // Si tenía un casillero anterior diferente, liberarlo
    if ($casillero_actual && $casillero_actual['num_casillero'] != $num_casillero) {
        $sql_liberar_casillero = $conexion->prepare("UPDATE casilleros SET id_empleado = NULL WHERE num_casillero = ?");
        $sql_liberar_casillero->bind_param("s", $casillero_actual['num_casillero']);
        $sql_liberar_casillero->execute();
        $sql_liberar_casillero->close();
    }

    // Asignar el nuevo casillero
    $sql_asignar_casillero = $conexion->prepare("UPDATE casilleros SET id_empleado = ? WHERE num_casillero = ?");
    $sql_asignar_casillero->bind_param("is", $id_empleado, $num_casillero);
    $sql_asignar_casillero->execute();
    $sql_asignar_casillero->close();

} else {
    // Si no se ingresó casillero y el empleado tenía uno, liberarlo
    if ($casillero_actual) {
        $sql_eliminar_casillero = $conexion->prepare("UPDATE casilleros SET id_empleado = NULL WHERE num_casillero = ?");
        $sql_eliminar_casillero->bind_param("s", $casillero_actual['num_casillero']);
        $sql_eliminar_casillero->execute();
        $sql_eliminar_casillero->close();
    }
}

    // Verificar si el contacto de emergencia ya está registrado
    $sql_check_contacto_emergencia = $conexion->prepare("SELECT COUNT(*) FROM contacto_emergencia WHERE nombre = ? AND ap_paterno = ? AND ap_materno = ?");
    $sql_check_contacto_emergencia->bind_param("sss", $emergencia_nombre, $emergencia_ap_paterno, $emergencia_ap_materno);
    $sql_check_contacto_emergencia->execute();
    $sql_check_contacto_emergencia->bind_result($count_contacto_emergencia);
    $sql_check_contacto_emergencia->fetch();
    $sql_check_contacto_emergencia->close();

    // Si hay datos de contacto de emergencia, se procede a verificar si ya existe
    if ($count_contacto_emergencia > 0) {
        //Obtenemos el id_contacto del contacto de emergencia
        $sql_id_contacto_emergencia = $conexion->prepare("SELECT id_contacto FROM contacto_emergencia WHERE nombre = ? AND ap_paterno = ? AND ap_materno = ?");
        $sql_id_contacto_emergencia->bind_param("sss", $emergencia_nombre, $emergencia_ap_paterno, $emergencia_ap_materno);
        $sql_id_contacto_emergencia->execute();
        $sql_id_contacto_emergencia->bind_result($id_contacto_emergencia);
        $sql_id_contacto_emergencia->fetch();
        $sql_id_contacto_emergencia->close();

        // Verificar si el empleado ya esta registrado en la tabla empleado_contacto
        $sql_check_contacto = $conexion->prepare("SELECT COUNT(*) FROM empleado_contacto WHERE id_empleado = ?");
        $sql_check_contacto->bind_param("i", $id_empleado);
        $sql_check_contacto->execute();
        $sql_check_contacto->bind_result($existe_contacto);
        $sql_check_contacto->fetch();
        $sql_check_contacto->close();

        // Si el empleado ya se encuentra en la tabla empleado_contacto  
        if ($existe_contacto > 0) {
            // Actualizar información del contacto de emergencia
            $sql_update_contacto_emergencia = $conexion->prepare("UPDATE contacto_emergencia SET 
            telefono = ?, 
            domicilio = ? 
            WHERE id_contacto = ?");
            $sql_update_contacto_emergencia->bind_param(
                "ssi",
                $emergencia_telefono,
                $emergencia_domicilio,
                $id_contacto_emergencia
            );
            $sql_update_contacto_emergencia->execute();
            $sql_update_contacto_emergencia->close();

            // Actualizar relación del contacto de emergencia al empleado
            $sql_update_contacto_emergencia = $conexion->prepare("UPDATE empleado_contacto SET id_contacto = ?, parentesco = ? WHERE id_empleado = ?");
            $sql_update_contacto_emergencia->bind_param("isi", $id_contacto_emergencia, $emergencia_parentesco, $id_empleado);
            $sql_update_contacto_emergencia->execute();
            if ($conexion->affected_rows > 0) {
                $respuesta = array(
                    "title" => "SUCCESS",
                    "text" => "Actualización exitosa.",
                    "type" => "success",
                    "icon" => $rutaRaiz . "plugins/toasts/icons/icon_success.png",
                    "timeout" => 3000,
                );
                header('Content-Type: application/json');
                echo json_encode($respuesta);
                exit();
            } else {
                $respuesta = array(
                    "title" => "SUCCESS",
                    "text" => "Actualización exitosa.",
                    "type" => "success",
                    "icon" => $rutaRaiz . "plugins/toasts/icons/icon_success.png",
                    "timeout" => 3000,
                );
                header('Content-Type: application/json');
                echo json_encode($respuesta);
                exit();
            }
        } else {
            // Si el empleado no está registrado en la tabla empleado_contacto, se insertara una nueva relacion de empleado_contacto
            // Ahora insertamos el nuevo contacto al empleado
            $sql_insert_contacto_empleado = $conexion->prepare("INSERT INTO empleado_contacto (id_empleado, id_contacto, parentesco) VALUES (?, ?, ?)");
            $sql_insert_contacto_empleado->bind_param("iis", $id_empleado, $id_contacto_emergencia, $emergencia_parentesco);
            $sql_insert_contacto_empleado->execute();
            if ($conexion->affected_rows > 0) {
                $respuesta = array(
                    "title" => "SUCCESS",
                    "text" => "Actualización exitosa.",
                    "type" => "success",
                    "icon" => $rutaRaiz . "plugins/toasts/icons/icon_success.png",
                    "timeout" => 3000,
                );
                header('Content-Type: application/json');
                echo json_encode($respuesta);
                exit();
            }
        }
    }

    // Verificar si el id_empleado está registrado en la tabla empleado_contacto
    $sql_check_contacto = $conexion->prepare("SELECT COUNT(*) FROM empleado_contacto WHERE id_empleado = ?");
    $sql_check_contacto->bind_param("i", $id_empleado);
    $sql_check_contacto->execute();
    $sql_check_contacto->bind_result($existe);
    $sql_check_contacto->fetch();
    $sql_check_contacto->close();

    if ($existe > 0) {
        // Obtener el id_contacto relacionado
        $sql_id_contacto = $conexion->prepare("SELECT id_contacto FROM empleado_contacto WHERE id_empleado = ?");
        $sql_id_contacto->bind_param("i", $id_empleado);
        $sql_id_contacto->execute();
        $sql_id_contacto->bind_result($id_contacto);
        $sql_id_contacto->fetch();
        $sql_id_contacto->close();

        // Verificar si el id_contacto es NULL
        if ($id_contacto === null) {
            // Verificar si todos los campos de contacto de emergencia están vacíos
            if (
                empty($emergencia_nombre) && empty($emergencia_ap_paterno) && empty($emergencia_ap_materno) &&
                empty($emergencia_parentesco) && empty($emergencia_telefono) && empty($emergencia_domicilio)
            ) {
                $respuesta = array(
                    "title" => "SUCCESS",
                    "text" => "Actualización exitosa.",
                    "type" => "warning",
                    "icon" => $rutaRaiz . "plugins/toasts/icons/icon_success.png",
                    "timeout" => 3000,
                );

                header('Content-Type: application/json');
                echo json_encode($respuesta);
                exit();
            }

            // Verificar si existe el contacto de emergencia
            $sql_check_contacto_emergencia = $conexion->prepare("SELECT COUNT(*) FROM contacto_emergencia WHERE nombre = ? AND ap_paterno = ? AND ap_materno = ?");
            $sql_check_contacto_emergencia->bind_param("sss", $emergencia_nombre, $emergencia_ap_paterno, $emergencia_ap_materno);
            $sql_check_contacto_emergencia->execute();
            $sql_check_contacto_emergencia->bind_result($count_contacto_emergencia);
            $sql_check_contacto_emergencia->fetch();
            $sql_check_contacto_emergencia->close();

            if ($count_contacto_emergencia > 0) {
                // Obtener el id_contacto de la tabla contacto_emergencia
                $sql_id_contacto_emergencia = $conexion->prepare("SELECT id_contacto FROM contacto_emergencia WHERE nombre = ? AND ap_paterno = ? AND ap_materno = ?");
                $sql_id_contacto_emergencia->bind_param("sss", $emergencia_nombre, $emergencia_ap_paterno, $emergencia_ap_materno);
                $sql_id_contacto_emergencia->execute();
                $sql_id_contacto_emergencia->bind_result($id_contacto_emergencia);
                $sql_id_contacto_emergencia->fetch();
                $sql_id_contacto_emergencia->close();

                // Actualizar la información del contacto de emergencia
                $sql_update_contacto_emergencia = $conexion->prepare("UPDATE contacto_emergencia SET 
                    telefono = ?, 
                    domicilio = ? 
                WHERE id_contacto = ?");
                $sql_update_contacto_emergencia->bind_param(
                    "ssi",
                    $emergencia_telefono,
                    $emergencia_domicilio,
                    $id_contacto_emergencia
                );
                $sql_update_contacto_emergencia->execute();
                $sql_update_contacto_emergencia->close();

                // Actualizar el id_contacto al empleado
                $sql_update_contacto_emergencia = $conexion->prepare("UPDATE empleado_contacto SET id_contacto = ?, parentesco = ? WHERE id_empleado = ?");
                $sql_update_contacto_emergencia->bind_param("isi", $id_contacto_emergencia, $emergencia_parentesco, $id_empleado);
                $sql_update_contacto_emergencia->execute();
                if ($conexion->affected_rows > 0) {
                    $respuesta = array(
                        "title" => "SUCCESS",
                        "text" => "Actualización exitosa.",
                        "type" => "success",
                        "icon" => $rutaRaiz . "plugins/toasts/icons/icon_success.png",
                        "timeout" => 3000,
                    );

                    header('Content-Type: application/json');
                    echo json_encode($respuesta);
                    exit();
                }
            }

            // Si no existe, se inserta un nuevo contacto de emergencia
            $sql_insert_contacto = $conexion->prepare("INSERT INTO contacto_emergencia (nombre, ap_paterno, ap_materno, telefono, domicilio) VALUES (?, ?, ?, ?, ?)");
            $sql_insert_contacto->bind_param("sssss", $emergencia_nombre, $emergencia_ap_paterno, $emergencia_ap_materno, $emergencia_telefono, $emergencia_domicilio);
            $sql_insert_contacto->execute();
            if ($conexion->affected_rows > 0) {
                $nuevo_id_contacto = $conexion->insert_id;

                // Ahora insertamos el nuevo contacto al empleado
                $sql_insert_contacto_empleado = $conexion->prepare("INSERT INTO empleado_contacto (id_empleado, id_contacto, parentesco) VALUES (?, ?, ?)");
                $sql_insert_contacto_empleado->bind_param("iis", $id_empleado, $nuevo_id_contacto, $emergencia_parentesco);
                $sql_insert_contacto_empleado->execute();
                if ($conexion->affected_rows > 0) {
                    $respuesta = array(
                        "title" => "SUCCESS",
                        "text" => "Actualización exitosa.",
                        "type" => "success",
                        "icon" => $rutaRaiz . "plugins/toasts/icons/icon_success.png",
                        "timeout" => 3000,
                    );
                    header('Content-Type: application/json');
                    echo json_encode($respuesta);
                    exit();
                }
            }
        } else {
            // El id_empleado tiene un contacto relacionado
            // Verificar si ese id_contacto está relacionado a más de uno de los contactos
            $sql_check_contacto_relacionado = $conexion->prepare("SELECT COUNT(*) FROM empleado_contacto WHERE id_contacto = ?");
            $sql_check_contacto_relacionado->bind_param("i", $id_contacto);
            $sql_check_contacto_relacionado->execute();
            $sql_check_contacto_relacionado->bind_result($count_contacto);
            $sql_check_contacto_relacionado->fetch();
            $sql_check_contacto_relacionado->close();

            if ($count_contacto > 1) {
                // Si el id_contacto está relacionado a más de un empleado, se tiene que insertar un nuevo contacto
                $sql_insert_contacto = $conexion->prepare("INSERT INTO contacto_emergencia (nombre, ap_paterno, ap_materno, telefono, domicilio) VALUES (?, ?, ?, ?, ?)");
                $sql_insert_contacto->bind_param("sssss", $emergencia_nombre, $emergencia_ap_paterno, $emergencia_ap_materno, $emergencia_telefono, $emergencia_domicilio);
                $sql_insert_contacto->execute();
                if ($conexion->affected_rows > 0) {
                    $nuevo_id_contacto = $conexion->insert_id;

                    // Ahora relacionamos el nuevo contacto al empleado
                    $sql_relacionar_contacto = $conexion->prepare("UPDATE empleado_contacto SET id_contacto = ?, parentesco = ? WHERE id_empleado = ?");
                    $sql_relacionar_contacto->bind_param("isi", $nuevo_id_contacto, $emergencia_parentesco, $id_empleado);
                    $sql_relacionar_contacto->execute();
                    if ($conexion->affected_rows > 0) {
                        $respuesta = array(
                            "title" => "SUCCESS",
                            "text" => "Actualización exitosa.",
                            "type" => "success",
                            "icon" => $rutaRaiz . "plugins/toasts/icons/icon_success.png",
                            "timeout" => 3000,
                        );

                        header('Content-Type: application/json');
                        echo json_encode($respuesta);
                        exit();
                    }
                }
            } else {
                // Como solo está relacionado a un empleado, se actualiza el contacto de emergencia
                $sql_update_contacto_emergencia = $conexion->prepare("UPDATE contacto_emergencia SET 
                    nombre = ?, 
                    ap_paterno = ?, 
                    ap_materno = ?, 
                    telefono = ?, 
                    domicilio = ? 
                WHERE id_contacto = ?");
                $sql_update_contacto_emergencia->bind_param(
                    "sssssi",
                    $emergencia_nombre,
                    $emergencia_ap_paterno,
                    $emergencia_ap_materno,
                    $emergencia_telefono,
                    $emergencia_domicilio,
                    $id_contacto
                );
                $sql_update_contacto_emergencia->execute();
                if ($conexion->affected_rows > 0) {
                    // Actualizamos la relación del contacto de emergencia al empleado
                    $sql_update_contacto_emergencia = $conexion->prepare("UPDATE empleado_contacto SET parentesco = ? WHERE id_empleado = ?");
                    $sql_update_contacto_emergencia->bind_param("si", $emergencia_parentesco, $id_empleado);
                    $sql_update_contacto_emergencia->execute();
                    $respuesta = array(
                        "title" => "SUCCESS",
                        "text" => "Actualización exitosa.",
                        "type" => "success",
                        "icon" => $rutaRaiz . "plugins/toasts/icons/icon_success.png",
                        "timeout" => 3000,
                    );
                    header('Content-Type: application/json');
                    echo json_encode($respuesta);
                    exit();
                }
            }
        }
    } else {
        // Si no existe, se tiene que insertar el id_empleado a la tabla empleado_contacto
        // Verificamos si existe el contacto de emergencia en la tabla contacto_emergencia
        $sql_check_contacto_emergencia = $conexion->prepare("SELECT COUNT(*) FROM contacto_emergencia WHERE nombre = ? AND ap_paterno = ? AND ap_materno = ?");
        $sql_check_contacto_emergencia->bind_param("sss", $emergencia_nombre, $emergencia_ap_paterno, $emergencia_ap_materno);
        $sql_check_contacto_emergencia->execute();
        $sql_check_contacto_emergencia->bind_result($count_contacto_emergencia);
        $sql_check_contacto_emergencia->fetch();
        $sql_check_contacto_emergencia->close();

        if ($count_contacto_emergencia > 0) {
            // Si existe, obtenemos el id_contacto de la tabla contacto_emergencia
            $sql_id_contacto_emergencia = $conexion->prepare("SELECT id_contacto FROM contacto_emergencia WHERE nombre = ? AND ap_paterno = ? AND ap_materno = ?");
            $sql_id_contacto_emergencia->bind_param("sss", $emergencia_nombre, $emergencia_ap_paterno, $emergencia_ap_materno);
            $sql_id_contacto_emergencia->execute();
            $sql_id_contacto_emergencia->bind_result($id_contacto_emergencia);
            $sql_id_contacto_emergencia->fetch();
            $sql_id_contacto_emergencia->close();

            // Actualizar la información del contacto de emergencia
            $sql_update_contacto_emergencia = $conexion->prepare("UPDATE contacto_emergencia SET 
                telefono = ?, 
                domicilio = ? 
                WHERE id_contacto = ?");
            $sql_update_contacto_emergencia->bind_param(
                "ssi",
                $emergencia_telefono,
                $emergencia_domicilio,
                $id_contacto_emergencia
            );
            $sql_update_contacto_emergencia->execute();
            $sql_update_contacto_emergencia->close();

            // Ahora insertamos el id_contacto y parentesco al empleado
            $sql_insert_contacto_empleado = $conexion->prepare("INSERT INTO empleado_contacto (id_empleado, id_contacto, parentesco) VALUES (?, ?, ?)");
            $sql_insert_contacto_empleado->bind_param("iis", $id_empleado, $id_contacto_emergencia, $emergencia_parentesco);
            $sql_insert_contacto_empleado->execute();
            if ($conexion->affected_rows > 0) {
                $respuesta = array(
                    "title" => "SUCCESS",
                    "text" => "Actualización exitosa.",
                    "type" => "success",
                    "icon" => $rutaRaiz . "plugins/toasts/icons/icon_success.png",
                    "timeout" => 3000,
                );
                header('Content-Type: application/json');
                echo json_encode($respuesta);
                exit();
            }
        } else {

            // Verificar si todos los campos de contacto de emergencia están vacíos
            if (
                empty($emergencia_nombre) && empty($emergencia_ap_paterno) && empty($emergencia_ap_materno) &&
                empty($emergencia_parentesco) && empty($emergencia_telefono) && empty($emergencia_domicilio)
            ) {
                $respuesta = array(
                    "title" => "SUCCESS",
                    "text" => "Actualización exitosa.",
                    "type" => "warning",
                    "icon" => $rutaRaiz . "plugins/toasts/icons/icon_success.png",
                    "timeout" => 3000,
                );

                header('Content-Type: application/json');
                echo json_encode($respuesta);
                exit();
            }
            
            // Si no existe, se inserta un nuevo contacto de emergencia
            $sql_insert_contacto = $conexion->prepare("INSERT INTO contacto_emergencia (nombre, ap_paterno, ap_materno, telefono, domicilio) VALUES (?, ?, ?, ?, ?)");
            $sql_insert_contacto->bind_param("sssss", $emergencia_nombre, $emergencia_ap_paterno, $emergencia_ap_materno, $emergencia_telefono, $emergencia_domicilio);
            $sql_insert_contacto->execute();
            if ($conexion->affected_rows > 0) {
                $nuevo_id_contacto = $conexion->insert_id;

                // Ahora insertamos el nuevo contacto al empleado
                $sql_insert_contacto_empleado = $conexion->prepare("INSERT INTO empleado_contacto (id_empleado, id_contacto, parentesco) VALUES (?, ?, ?)");
                $sql_insert_contacto_empleado->bind_param("iis", $id_empleado, $nuevo_id_contacto, $emergencia_parentesco);
                $sql_insert_contacto_empleado->execute();
                if ($conexion->affected_rows > 0) {
                    $respuesta = array(
                        "title" => "SUCCESS",
                        "text" => "Actualización exitosa.",
                        "type" => "success",
                        "icon" => $rutaRaiz . "plugins/toasts/icons/icon_success.png",
                        "timeout" => 3000,
                    );
                    header('Content-Type: application/json');
                    echo json_encode($respuesta);
                    exit();
                }
            }
        }
    }
}
?>