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

    $id_turno = $_POST['id_turno'] ?? null; // Agregue esto BHL
    $id_turno_sabado = $_POST['id_turno_sabado'] ?? null; // Agregue esto BHL

    // Nuevos campos agregados
    $fecha_nacimiento = $_POST['fecha_nacimiento'] ?? null;
    $num_casillero = $_POST['num_casillero'] ?? null;
    $id_empresa = $_POST['id_empresa'] ?? null;
    $id_area = $_POST['id_area'] ?? null;
    $id_puestoEspecial = $_POST['id_puestoEspecial'] ?? null;
    $biometrico = $_POST['biometrico'] ?? null;
    $rfc_empleado = $_POST['rfc_empleado'] ?? null;
    $estado_civil = $_POST['estado_civil'] ?? null;

    // Campos de salario
    $salario_semanal = $_POST['salario_semanal'] ?? null;
    $salario_diario = $_POST['salario_diario'] ?? null;

    // Contacto de emergencia
    $emergencia_nombre = $_POST['nombre_contacto'] ?? null;
    $emergencia_ap_paterno = $_POST['apellido_paterno_contacto'] ?? null;
    $emergencia_ap_materno = $_POST['apellido_materno_contacto'] ?? null;
    $emergencia_parentesco = $_POST['parentesco'] ?? null;
    $emergencia_telefono = $_POST['telefono_contacto'] ?? null;
    $emergencia_domicilio = $_POST['domicilio_contacto'] ?? null;

    // Capturar el valor del teléfono del empleado
    $telefono_empleado = $_POST['telefono_empleado'] ?? null;

    // Asegurar que valores vacíos se conviertan a NULL
    $telefono_empleado = (empty($telefono_empleado) || $telefono_empleado === "0") ? null : $telefono_empleado;

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
    $biometrico = ($biometrico === "0" || $biometrico === 0 || empty($biometrico)) ? null : (int)$biometrico;

    // Convertir turnos a int o null
    $id_turno = !empty($id_turno) ? (int)$id_turno : null;
    $id_turno_sabado = !empty($id_turno_sabado) ? (int)$id_turno_sabado : null;

    // Convertir salarios a decimal o null
    $salario_semanal = !empty($salario_semanal) ? (float)$salario_semanal : null;
    $salario_diario = !empty($salario_diario) ? (float)$salario_diario : null;

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
            "timeout" => 3000,
        );

        header('Content-Type: application/json');
        echo json_encode($respuesta);
        exit;
    }

    // verificar si el biometrico ya existe para otro empleado
    if (!empty($biometrico)) {
        $sql_check_biometrico = $conexion->prepare("SELECT COUNT(*) FROM info_empleados WHERE biometrico = ? AND id_empleado != ?");
        $sql_check_biometrico->bind_param("ii", $biometrico, $id_empleado);
        $sql_check_biometrico->execute();
        $sql_check_biometrico->bind_result($count_biometrico);
        $sql_check_biometrico->fetch();
        $sql_check_biometrico->close();

        if ($count_biometrico > 0) {
            $respuesta = array(
                "title" => "ADVERTENCIA",
                "text" => "El número biométrico ya está en uso por otro empleado.",
                "type" => "info",
                "timeout" => 3000,
            );

            header('Content-Type: application/json');
            echo json_encode($respuesta);
            exit;
        }
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
            salario_diario = ?,
            biometrico = ?,
            telefono_empleado = ?,
            rfc_empleado = ?,
            estado_civil = ?,
            id_departamento = NULL
        WHERE id_empleado = ?");

        $update_empleado->bind_param(
            "sssssssssssssiiddisssi",
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
            $salario_diario,
            $biometrico,
            $telefono_empleado, 
            $rfc_empleado,
            $estado_civil,
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
            salario_diario = ?,
            biometrico = ?,
            telefono_empleado = ?,
            rfc_empleado = ?,
            estado_civil = ?,
            id_departamento = ?
        WHERE id_empleado = ?");

        $update_empleado->bind_param(
            "sssssssssssssiiiddisssi",
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
            $salario_diario,
            $biometrico,
            $telefono_empleado, // Pasar el teléfono del empleado
            $rfc_empleado,
            $estado_civil,
            $id_departamento,
            $id_empleado
        );
    }

    $update_empleado->execute();
    $update_empleado->close();

    // =============================
    //   ACTUALIZAR TURNOS DEL EMPLEADO
    // =============================
    if (!empty($id_turno)) {
        // Verificar si ya existe un registro en empleado_turno
        $sql_check_turno = $conexion->prepare("SELECT COUNT(*) FROM empleado_turno WHERE id_empleado = ?");
        $sql_check_turno->bind_param("i", $id_empleado);
        $sql_check_turno->execute();
        $sql_check_turno->bind_result($existe_turno);
        $sql_check_turno->fetch();
        $sql_check_turno->close();

        if ($existe_turno > 0) {
            // Si existe, actualizar
            $sql_update_turno = $conexion->prepare("UPDATE empleado_turno SET id_turno_base = ?, id_turno_sabado = ? WHERE id_empleado = ?");
            $sql_update_turno->bind_param("iii", $id_turno, $id_turno_sabado, $id_empleado);
            $sql_update_turno->execute();
            $sql_update_turno->close();
        } else {
            // Si no existe, insertar
            $sql_insert_turno = $conexion->prepare("INSERT INTO empleado_turno (id_empleado, id_turno_base, id_turno_sabado) VALUES (?, ?, ?)");
            $sql_insert_turno->bind_param("iii", $id_empleado, $id_turno, $id_turno_sabado);
            $sql_insert_turno->execute();
            $sql_insert_turno->close();
        }
    }

    // Primero, obtener el casillero actual del empleado
    $sql_check_casilleros_actuales = $conexion->prepare("SELECT num_casillero FROM empleado_casillero WHERE id_empleado = ?");
    $sql_check_casilleros_actuales->bind_param("i", $id_empleado);
    $sql_check_casilleros_actuales->execute();
    $resultado_casilleros_actuales = $sql_check_casilleros_actuales->get_result();

    $casilleros_actuales = [];
    while ($row = $resultado_casilleros_actuales->fetch_assoc()) {
        $casilleros_actuales[] = $row['num_casillero'];
    }
    $sql_check_casilleros_actuales->close();

    // Convertir el número de casillero a un array (puede ser un solo valor o múltiples separados por coma)
    $casilleros_nuevos = [];
    if (!empty($num_casillero)) {
        // Separar por coma si hay múltiples casilleros
        $casilleros_nuevos = array_map('trim', explode(',', $num_casillero));
    }

    // Eliminar asignaciones actuales del empleado
    $sql_eliminar_asignaciones = $conexion->prepare("DELETE FROM empleado_casillero WHERE id_empleado = ?");
    $sql_eliminar_asignaciones->bind_param("i", $id_empleado);
    $sql_eliminar_asignaciones->execute();
    $sql_eliminar_asignaciones->close();

    // Asignar los nuevos casilleros si se proporcionaron
    if (!empty($casilleros_nuevos)) {
        foreach ($casilleros_nuevos as $casillero_num) {
            // Verificar si el casillero existe
            $sql_verificar_casillero = $conexion->prepare("SELECT num_casillero FROM casilleros WHERE num_casillero = ?");
            $sql_verificar_casillero->bind_param("s", $casillero_num);
            $sql_verificar_casillero->execute();
            $resultado_verificar = $sql_verificar_casillero->get_result();
            $existe_casillero = $resultado_verificar->num_rows > 0;
            $sql_verificar_casillero->close();

            if (!$existe_casillero) {
                $respuesta = array(
                    "title" => "ADVERTENCIA",
                    "text" => "El casillero $casillero_num no existe en el sistema.",
                    "type" => "warning",
                    "timeout" => 5000,
                );
                header('Content-Type: application/json');
                echo json_encode($respuesta);
                exit();
            }

            // Verificar cuántos empleados ya están asignados a este casillero
            $sql_contar_empleados = $conexion->prepare("SELECT COUNT(*) as total FROM empleado_casillero WHERE num_casillero = ?");
            $sql_contar_empleados->bind_param("s", $casillero_num);
            $sql_contar_empleados->execute();
            $resultado_contar = $sql_contar_empleados->get_result();
            $row_contar = $resultado_contar->fetch_assoc();
            $total_empleados = $row_contar['total'];
            $sql_contar_empleados->close();

            if ($total_empleados >= 2) {
                $respuesta = array(
                    "title" => "ADVERTENCIA",
                    "text" => "El casillero $casillero_num ya tiene el máximo de 2 empleados asignados.",
                    "type" => "warning",
                    "timeout" => 5000,
                );
                header('Content-Type: application/json');
                echo json_encode($respuesta);
                exit();
            }

            // Asignar el casillero al empleado
            $sql_asignar_casillero = $conexion->prepare("INSERT INTO empleado_casillero (id_empleado, num_casillero) VALUES (?, ?)");
            $sql_asignar_casillero->bind_param("is", $id_empleado, $casillero_num);
            $sql_asignar_casillero->execute();
            $sql_asignar_casillero->close();
        }
    }

    // =============================
    // PROCESAR BENEFICIARIOS (MOVER AQUÍ ANTES DE LOS CONTACTOS)
    // =============================
    $beneficiarios = [];
    if (!empty($_POST['beneficiario_nombre'])) {
        $ids = $_POST['beneficiario_id'] ?? [];
        $nombres = $_POST['beneficiario_nombre'];
        $ap_paternos = $_POST['beneficiario_ap_paterno'] ?? [];
        $ap_maternos = $_POST['beneficiario_ap_materno'] ?? [];
        $parentescos = $_POST['beneficiario_parentesco'] ?? [];
        $porcentajes = $_POST['beneficiario_porcentaje'] ?? [];

        for ($i = 0; $i < count($nombres); $i++) {
            $id_beneficiario = trim($ids[$i] ?? '');
            $nombre = trim($nombres[$i] ?? '');
            $ap_paterno = trim($ap_paternos[$i] ?? '');
            $ap_materno = trim($ap_maternos[$i] ?? '');
            $parentesco = trim($parentescos[$i] ?? '');
            $porcentaje = trim($porcentajes[$i] ?? '');

            // Solo procesar si al menos el nombre tiene contenido
            if (!empty($nombre)) {
                $beneficiarios[] = [
                    'id_beneficiario' => $id_beneficiario,
                    'nombre' => $nombre,
                    'ap_paterno' => $ap_paterno,
                    'ap_materno' => $ap_materno,
                    'parentesco' => $parentesco,
                    'porcentaje' => $porcentaje
                ];
            }
        }
    }

    // Verificar si todos los campos de beneficiarios están vacíos
    if (empty($beneficiarios)) {
        // Obtener los IDs de beneficiarios antes de eliminar las relaciones
        $beneficiarioIds_a_verificar = [];
        $sql_get_beneficiarios = $conexion->prepare("SELECT id_beneficiario FROM empleado_beneficiario WHERE id_empleado = ?");
        $sql_get_beneficiarios->bind_param("i", $id_empleado);
        $sql_get_beneficiarios->execute();
        $resultado_beneficiarios = $sql_get_beneficiarios->get_result();
        while ($row = $resultado_beneficiarios->fetch_assoc()) {
            $beneficiarioIds_a_verificar[] = intval($row['id_beneficiario']);
        }
        $sql_get_beneficiarios->close();

        // Si no hay beneficiarios en el formulario, eliminar todas las relaciones existentes
        $sql_delete_all_beneficiarios = $conexion->prepare("DELETE FROM empleado_beneficiario WHERE id_empleado = ?");
        $sql_delete_all_beneficiarios->bind_param("i", $id_empleado);
        $sql_delete_all_beneficiarios->execute();
        $sql_delete_all_beneficiarios->close();

        // Limpiar beneficiarios huérfanos (sin relación con ningún empleado)
        if (!empty($beneficiarioIds_a_verificar)) {
            $sql_count_benef = $conexion->prepare("SELECT COUNT(*) AS c FROM empleado_beneficiario WHERE id_beneficiario = ?");
            $sql_delete_benef = $conexion->prepare("DELETE FROM beneficiarios WHERE id_beneficiario = ?");
            foreach ($beneficiarioIds_a_verificar as $bid) {
                $sql_count_benef->bind_param("i", $bid);
                $sql_count_benef->execute();
                $count_res = $sql_count_benef->get_result();
                $count_row = $count_res->fetch_assoc();
                $num_refs = intval($count_row['c']);
                // Si no hay referencias, eliminar el beneficiario
                if ($num_refs === 0) {
                    $sql_delete_benef->bind_param("i", $bid);
                    $sql_delete_benef->execute();
                }
            }
            $sql_count_benef->close();
            $sql_delete_benef->close();
        }
    } else {
        // Obtener los IDs de beneficiarios antes de eliminar las relaciones
        $beneficiarioIds_a_verificar = [];
        $sql_get_beneficiarios = $conexion->prepare("SELECT id_beneficiario FROM empleado_beneficiario WHERE id_empleado = ?");
        $sql_get_beneficiarios->bind_param("i", $id_empleado);
        $sql_get_beneficiarios->execute();
        $resultado_beneficiarios = $sql_get_beneficiarios->get_result();
        while ($row = $resultado_beneficiarios->fetch_assoc()) {
            $beneficiarioIds_a_verificar[] = intval($row['id_beneficiario']);
        }
        $sql_get_beneficiarios->close();

        // Eliminar todas las relaciones actuales para reconstruir
        $sql_delete_relaciones = $conexion->prepare("DELETE FROM empleado_beneficiario WHERE id_empleado = ?");
        $sql_delete_relaciones->bind_param("i", $id_empleado);
        $sql_delete_relaciones->execute();
        $sql_delete_relaciones->close();

        // Procesar cada beneficiario del formulario
        foreach ($beneficiarios as $beneficiario) {
            $id_beneficiario_existente = $beneficiario['id_beneficiario'];
            $nombre = $beneficiario['nombre'];
            $ap_paterno = $beneficiario['ap_paterno'];
            $ap_materno = $beneficiario['ap_materno'];
            $parentesco = $beneficiario['parentesco'];
            $porcentaje = $beneficiario['porcentaje'];

            // NUEVA LÓGICA: Si tiene ID existente, verificar si los datos cambiaron
            if (!empty($id_beneficiario_existente)) {
                // Verificar si los datos del beneficiario han cambiado
                $sql_check_cambios = $conexion->prepare("SELECT nombre, ap_paterno, ap_materno FROM beneficiarios WHERE id_beneficiario = ?");
                $sql_check_cambios->bind_param("i", $id_beneficiario_existente);
                $sql_check_cambios->execute();
                $resultado_cambios = $sql_check_cambios->get_result();

                if ($resultado_cambios->num_rows > 0) {
                    $datos_actuales = $resultado_cambios->fetch_assoc();

                    // Si los datos han cambiado, verificar si otro beneficiario usa este ID
                    if (
                        $datos_actuales['nombre'] !== $nombre ||
                        $datos_actuales['ap_paterno'] !== $ap_paterno ||
                        $datos_actuales['ap_materno'] !== $ap_materno
                    ) {

                        // Verificar cuántos empleados usan este beneficiario
                        $sql_count_usos = $conexion->prepare("SELECT COUNT(*) as total FROM empleado_beneficiario WHERE id_beneficiario = ?");
                        $sql_count_usos->bind_param("i", $id_beneficiario_existente);
                        $sql_count_usos->execute();
                        $sql_count_usos->bind_result($total_usos);
                        $sql_count_usos->fetch();
                        $sql_count_usos->close();

                        if ($total_usos > 1) {
                            // Crear nuevo beneficiario si está siendo usado por otros empleados
                            $sql_nuevo_beneficiario = $conexion->prepare("INSERT INTO beneficiarios (nombre, ap_paterno, ap_materno) VALUES (?, ?, ?)");
                            $sql_nuevo_beneficiario->bind_param("sss", $nombre, $ap_paterno, $ap_materno);
                            $sql_nuevo_beneficiario->execute();
                            $id_beneficiario_usar = $conexion->insert_id;
                            $sql_nuevo_beneficiario->close();
                        } else {
                            // Actualizar el beneficiario existente si solo lo usa este empleado
                            $sql_update_beneficiario = $conexion->prepare("UPDATE beneficiarios SET nombre = ?, ap_paterno = ?, ap_materno = ? WHERE id_beneficiario = ?");
                            $sql_update_beneficiario->bind_param("sssi", $nombre, $ap_paterno, $ap_materno, $id_beneficiario_existente);
                            $sql_update_beneficiario->execute();
                            $sql_update_beneficiario->close();
                            $id_beneficiario_usar = $id_beneficiario_existente;
                        }
                    } else {
                        // Los datos no han cambiado, usar el ID existente
                        $id_beneficiario_usar = $id_beneficiario_existente;
                    }
                } else {
                    // El ID no existe más, crear nuevo beneficiario
                    $sql_nuevo_beneficiario = $conexion->prepare("INSERT INTO beneficiarios (nombre, ap_paterno, ap_materno) VALUES (?, ?, ?)");
                    $sql_nuevo_beneficiario->bind_param("sss", $nombre, $ap_paterno, $ap_materno);
                    $sql_nuevo_beneficiario->execute();
                    $id_beneficiario_usar = $conexion->insert_id;
                    $sql_nuevo_beneficiario->close();
                }
                $sql_check_cambios->close();
            } else {
                // No tiene ID existente, verificar si ya existe o crear nuevo
                $sql_check_beneficiario = $conexion->prepare("SELECT id_beneficiario FROM beneficiarios WHERE nombre = ? AND ap_paterno = ? AND ap_materno = ?");
                $sql_check_beneficiario->bind_param("sss", $nombre, $ap_paterno, $ap_materno);
                $sql_check_beneficiario->execute();
                $resultado_beneficiario = $sql_check_beneficiario->get_result();

                if ($resultado_beneficiario->num_rows > 0) {
                    $row_beneficiario = $resultado_beneficiario->fetch_assoc();
                    $id_beneficiario_usar = $row_beneficiario['id_beneficiario'];
                } else {
                    $sql_insert_beneficiario = $conexion->prepare("INSERT INTO beneficiarios (nombre, ap_paterno, ap_materno) VALUES (?, ?, ?)");
                    $sql_insert_beneficiario->bind_param("sss", $nombre, $ap_paterno, $ap_materno);
                    $sql_insert_beneficiario->execute();
                    $id_beneficiario_usar = $conexion->insert_id;
                    $sql_insert_beneficiario->close();
                }
                $sql_check_beneficiario->close();
            }

            // Crear la relación empleado-beneficiario con el ID correcto
            $sql_insert_relacion = $conexion->prepare("INSERT INTO empleado_beneficiario (id_empleado, id_beneficiario, parentesco, porcentaje) VALUES (?, ?, ?, ?)");
            $sql_insert_relacion->bind_param("iisd", $id_empleado, $id_beneficiario_usar, $parentesco, $porcentaje);
            $sql_insert_relacion->execute();
            $sql_insert_relacion->close();
        }

        // Limpiar beneficiarios huérfanos que quedaron sin relación después de la actualización
        if (!empty($beneficiarioIds_a_verificar)) {
            $sql_count_benef = $conexion->prepare("SELECT COUNT(*) AS c FROM empleado_beneficiario WHERE id_beneficiario = ?");
            $sql_delete_benef = $conexion->prepare("DELETE FROM beneficiarios WHERE id_beneficiario = ?");
            foreach ($beneficiarioIds_a_verificar as $bid) {
                $sql_count_benef->bind_param("i", $bid);
                $sql_count_benef->execute();
                $count_res = $sql_count_benef->get_result();
                $count_row = $count_res->fetch_assoc();
                $num_refs = intval($count_row['c']);
                // Si no hay referencias, eliminar el beneficiario
                if ($num_refs === 0) {
                    $sql_delete_benef->bind_param("i", $bid);
                    $sql_delete_benef->execute();
                }
            }
            $sql_count_benef->close();
            $sql_delete_benef->close();
        }
    }

    // =============================
    // FIN DEL PROCESAMIENTO DE BENEFICIARIOS
    // =============================

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
                    "title" => "EXITO",
                    "text" => "Actualización exitosa.",
                    "type" => "success",
                    "timeout" => 3000,
                );
                header('Content-Type: application/json');
                echo json_encode($respuesta);
                exit();
            } else {
                $respuesta = array(
                    "title" => "EXITO",
                    "text" => "Actualización exitosa.",
                    "type" => "success",
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
                    "title" => "EXITO",
                    "text" => "Actualización exitosa.",
                    "type" => "success",
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
                    "title" => "EXITO",
                    "text" => "Actualización exitosa.",
                    "type" => "success",
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
                        "title" => "EXITO",
                        "text" => "Actualización exitosa.",
                        "type" => "success",
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
                        "title" => "EXITO",
                        "text" => "Actualización exitosa.",
                        "type" => "success",
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
                            "title" => "EXITO",
                            "text" => "Actualización exitosa.",
                            "type" => "success",
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
                        "title" => "EXITO",
                        "text" => "Actualización exitosa.",
                        "type" => "success",
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
                    "title" => "EXITO",
                    "text" => "Actualización exitosa.",
                    "type" => "success",
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
                    "title" => "EXITO",
                    "text" => "Actualización exitosa.",
                    "type" => "warning",
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
                        "title" => "EXITO",
                        "text" => "Actualización exitosa.",
                        "type" => "success",
                        "timeout" => 3000,
                    );
                    header('Content-Type: application/json');
                    echo json_encode($respuesta);
                    exit();
                }
            }
        }
    }

    $respuesta = array(
        "title" => "EXITO",
        "text" => "Actualización exitosa.",
        "type" => "success",
        "timeout" => 3000,
    );
    header('Content-Type: application/json');
    echo json_encode($respuesta);
    exit();
}
