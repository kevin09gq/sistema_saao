<?php

require_once '../../conexion/conexion.php';

/** @var mysqli $conexion */

$accion = $_POST['accion'] ?? $_GET['accion'] ?? '';

switch ($accion) {

    case 'obtenerUsuarios':
        obtenerUsuarios($conexion);
        break;

    case 'obtenerPermisos':
        obtenerPermisos($conexion);
        break;

    case 'guardarPermisos':
        guardarPermisos($conexion);
        break;

    case 'editarUsuario':
        editarUsuario($conexion);
        break;

    case 'eliminarUsuario':
        eliminarUsuario($conexion);
        break;

    case 'crearUsuario':
        crearUsuario($conexion);
        break;

    case 'cambiarEstadoUsuario':
        cambiarEstadoUsuario($conexion);
        break;

    default:
        echo json_encode([
            "success" => false,
            "mensaje" => "Acción no válida."
        ]);
        break;
}


//==============================================
// FUNCIÓN PARA OBTENER LOS USUARIOS
//==============================================

function obtenerUsuarios(mysqli $conexion)
{
    // consulta sql para obtener los usuarios con su rol y status
    $sql = "SELECT
                ia.id_admin,
                ia.nombre_admin,
                ia.correo,
                ia.id_rol,
                r.nombre_rol,
                ia.id_status,
                s.nombre_status
            FROM info_admin ia
            INNER JOIN rol r
                ON r.id_rol = ia.id_rol
            INNER JOIN status s
                ON s.id_status = ia.id_status
            ORDER BY ia.nombre_admin ASC";

    // ejecuta la consulta
    $resultado = mysqli_query($conexion, $sql);

    // si hay error en la consulta, retorna un mensaje de error
    if (!$resultado) {
        echo json_encode([
            "success" => false,
            "mensaje" => "Error al obtener los usuarios."
        ]);
        return;
    }

    // crea un array para almacenar los usuarios
    $usuarios = [];

    // recorre cada resultado y lo agrega al array de usuarios
    while ($usuario = mysqli_fetch_assoc($resultado)) {
        $usuarios[] = $usuario;
    }

    // retorna los usuarios en formato json
    echo json_encode([
        "success" => true,
        "usuarios" => $usuarios
    ]);
}

//==============================================
// FUNCIÓN PARA EDITAR LA INFORMACIÓN DE UN USUARIO
//==============================================


//==============================================
// FUNCIÓN PARA EDITAR LA INFORMACIÓN DE UN USUARIO
//==============================================

function editarUsuario(mysqli $conexion)
{
    // Obtener el objeto usuario enviado desde JavaScript
    $usuario = $_POST['usuario'] ?? null;

    // Si viene como string JSON, decodificarlo
    if (is_string($usuario)) {
        $usuario = json_decode($usuario, true);
    }

    // Validar que se haya recibido correctamente y sea un arreglo
    if (!$usuario || !is_array($usuario)) {

        echo json_encode([
            "success" => false,
            "mensaje" => "No se recibió la información del usuario."
        ]);

        return;
    }


    // Obtener los datos del usuario
    $idAdmin = intval($usuario['id_admin'] ?? 0);

    $nombreAdmin = trim($usuario['nombre_admin'] ?? '');

    $idRol = intval($usuario['id_rol'] ?? 0);

    $correo = trim($usuario['correo'] ?? '');

    $password = $usuario['password'] ?? '';


    // Si se ingresó una nueva contraseña
    if ($password !== '') {

        // Encriptar contraseña
        $passwordHash = password_hash(
            $password,
            PASSWORD_DEFAULT
        );

        $stmt = mysqli_prepare(
            $conexion,
            "UPDATE info_admin
             SET nombre_admin = ?,
                 id_rol = ?,
                 correo = ?,
                 password = ?
             WHERE id_admin = ?"
        );

        if (!$stmt) {

            echo json_encode([
                "success" => false,
                "mensaje" => "No se pudo preparar la actualización."
            ]);

            return;
        }

        mysqli_stmt_bind_param(
            $stmt,
            "sissi",
            $nombreAdmin,
            $idRol,
            $correo,
            $passwordHash,
            $idAdmin
        );
    } else {

        // Actualizar sin modificar la contraseña
        $stmt = mysqli_prepare(
            $conexion,
            "UPDATE info_admin
             SET nombre_admin = ?,
                 id_rol = ?,
                 correo = ?
             WHERE id_admin = ?"
        );

        if (!$stmt) {

            echo json_encode([
                "success" => false,
                "mensaje" => "No se pudo preparar la actualización."
            ]);

            return;
        }

        mysqli_stmt_bind_param(
            $stmt,
            "sisi",
            $nombreAdmin,
            $idRol,
            $correo,
            $idAdmin
        );
    }


    // Ejecutar actualización
    if (!mysqli_stmt_execute($stmt)) {

        echo json_encode([
            "success" => false,
            "mensaje" => "No se pudo actualizar la información del usuario."
        ]);

        mysqli_stmt_close($stmt);

        return;
    }


    // Cerrar consulta
    mysqli_stmt_close($stmt);


    // Respuesta exitosa
    echo json_encode([
        "success" => true,
        "mensaje" => "La información del usuario se actualizó correctamente."
    ]);
}


//==============================================
// FUNCIÓN PARA ELIMINAR UN EMPLEADO / USUARIO
//==============================================

function eliminarUsuario(mysqli $conexion)
{
    $idAdmin = intval($_POST['id_admin'] ?? 0);

    if ($idAdmin <= 0) {
        echo json_encode([
            "success" => false,
            "mensaje" => "ID de usuario no válido."
        ]);
        return;
    }

    // Verificar si el usuario existe y si es Administrador
    $stmtCheck = mysqli_prepare($conexion, "SELECT id_rol FROM info_admin WHERE id_admin = ?");
    if ($stmtCheck) {
        mysqli_stmt_bind_param($stmtCheck, "i", $idAdmin);
        mysqli_stmt_execute($stmtCheck);
        $resCheck = mysqli_stmt_get_result($stmtCheck);
        $user = mysqli_fetch_assoc($resCheck);
        mysqli_stmt_close($stmtCheck);

        if (!$user) {
            echo json_encode([
                "success" => false,
                "mensaje" => "El usuario no existe."
            ]);
            return;
        }

        // Si es rol 1 (Administrador), no permitir eliminarlo
        if (intval($user['id_rol']) === 1) {
            echo json_encode([
                "success" => false,
                "mensaje" => "No se puede eliminar a un administrador."
            ]);
            return;
        }
    }

    // Iniciar transacción para asegurar consistencia
    mysqli_begin_transaction($conexion);

    try {
        // 1. Eliminar los permisos asociados al usuario
        $stmtPermisos = mysqli_prepare($conexion, "DELETE FROM admin_permisos WHERE id_admin = ?");
        if (!$stmtPermisos) {
            throw new Exception("Error al preparar la eliminación de permisos.");
        }
        mysqli_stmt_bind_param($stmtPermisos, "i", $idAdmin);
        if (!mysqli_stmt_execute($stmtPermisos)) {
            throw new Exception("Error al eliminar los permisos del usuario.");
        }
        mysqli_stmt_close($stmtPermisos);

        // 2. Eliminar el usuario de info_admin
        $stmtAdmin = mysqli_prepare($conexion, "DELETE FROM info_admin WHERE id_admin = ?");
        if (!$stmtAdmin) {
            throw new Exception("Error al preparar la eliminación del usuario.");
        }
        mysqli_stmt_bind_param($stmtAdmin, "i", $idAdmin);
        if (!mysqli_stmt_execute($stmtAdmin)) {
            throw new Exception("Error al eliminar el usuario.");
        }
        mysqli_stmt_close($stmtAdmin);

        // Confirmar transacción
        mysqli_commit($conexion);

        echo json_encode([
            "success" => true,
            "mensaje" => "El usuario y sus permisos fueron eliminados correctamente."
        ]);
    } catch (Exception $e) {
        mysqli_rollback($conexion);
        echo json_encode([
            "success" => false,
            "mensaje" => $e->getMessage()
        ]);
    }
}


//==============================================
// FUNCIÓN PARA CREAR UN NUEVO USUARIO
//==============================================

function crearUsuario(mysqli $conexion)
{
    // Obtener los datos del usuario
    $usuario = $_POST['usuario'] ?? null;

    // Si viene como string JSON, decodificarlo
    if (is_string($usuario)) {
        $usuario = json_decode($usuario, true);
    }

    // Validar que se haya recibido correctamente y sea un arreglo
    if (!$usuario || !is_array($usuario)) {
        echo json_encode([
            "success" => false,
            "mensaje" => "No se recibieron los datos del usuario."
        ]);
        return;
    }

    $nombreAdmin = trim($usuario['nombre_admin'] ?? '');
    $correo = trim($usuario['correo'] ?? '');
    $idRol = intval($usuario['id_rol'] ?? 0);
    $password = $usuario['password'] ?? '';
    $idStatus = 1; // Activo por defecto

    // Validar campos obligatorios
    if (empty($nombreAdmin) || empty($correo) || $idRol <= 0 || empty($password)) {
        echo json_encode([
            "success" => false,
            "mensaje" => "Todos los campos son obligatorios."
        ]);
        return;
    }

    // Validar formato de correo electrónico
    if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
        echo json_encode([
            "success" => false,
            "mensaje" => "El formato del correo electrónico no es válido."
        ]);
        return;
    }

    // Verificar si el correo ya está registrado en la base de datos
    $stmtCheck = mysqli_prepare($conexion, "SELECT id_admin FROM info_admin WHERE correo = ?");
    if ($stmtCheck) {
        mysqli_stmt_bind_param($stmtCheck, "s", $correo);
        mysqli_stmt_execute($stmtCheck);
        $resCheck = mysqli_stmt_get_result($stmtCheck);

        if (mysqli_num_rows($resCheck) > 0) {
            mysqli_stmt_close($stmtCheck);
            echo json_encode([
                "success" => false,
                "mensaje" => "El correo electrónico ya se encuentra registrado."
            ]);
            return;
        }
        mysqli_stmt_close($stmtCheck);
    }

    // Encriptar la contraseña con hash seguro
    $passwordHash = password_hash($password, PASSWORD_DEFAULT);

    // Preparar la consulta de inserción
    $stmt = mysqli_prepare(
        $conexion,
        "INSERT INTO info_admin (nombre_admin, id_rol, correo, id_status, password)
         VALUES (?, ?, ?, ?, ?)"
    );

    if (!$stmt) {
        echo json_encode([
            "success" => false,
            "mensaje" => "No se pudo preparar el registro del usuario."
        ]);
        return;
    }

    mysqli_stmt_bind_param(
        $stmt,
        "sisis",
        $nombreAdmin,
        $idRol,
        $correo,
        $idStatus,
        $passwordHash
    );

    // Ejecutar la inserción
    if (!mysqli_stmt_execute($stmt)) {
        mysqli_stmt_close($stmt);
        echo json_encode([
            "success" => false,
            "mensaje" => "Ocurrió un error al registrar el nuevo usuario."
        ]);
        return;
    }

    $nuevoIdAdmin = mysqli_insert_id($conexion);
    mysqli_stmt_close($stmt);

    echo json_encode([
        "success" => true,
        "mensaje" => "El usuario se creó correctamente.",
        "id_admin" => $nuevoIdAdmin
    ]);
}


//==============================================
// FUNCIÓN PARA CAMBIAR ESTADO (DAR DE BAJA / ALTA)
//==============================================

function cambiarEstadoUsuario(mysqli $conexion)
{
    $idAdmin = intval($_POST['id_admin'] ?? 0);
    $nuevoStatus = isset($_POST['id_status']) ? intval($_POST['id_status']) : null;

    if ($idAdmin <= 0) {
        echo json_encode([
            "success" => false,
            "mensaje" => "ID de usuario no válido."
        ]);
        return;
    }

    // Consultar el rol y estatus actual del usuario
    $stmtUser = mysqli_prepare($conexion, "SELECT id_rol, id_status FROM info_admin WHERE id_admin = ?");
    if (!$stmtUser) {
        echo json_encode([
            "success" => false,
            "mensaje" => "Error al consultar la información del usuario."
        ]);
        return;
    }

    mysqli_stmt_bind_param($stmtUser, "i", $idAdmin);
    mysqli_stmt_execute($stmtUser);
    $resUser = mysqli_stmt_get_result($stmtUser);
    $user = mysqli_fetch_assoc($resUser);
    mysqli_stmt_close($stmtUser);

    if (!$user) {
        echo json_encode([
            "success" => false,
            "mensaje" => "El usuario no existe."
        ]);
        return;
    }

    $idRol = intval($user['id_rol']);
    $statusActual = intval($user['id_status']);

    // Si no se envió un nuevo estatus, se alterna (1 -> 2, != 1 -> 1)
    if ($nuevoStatus === null || $nuevoStatus <= 0) {
        $nuevoStatus = ($statusActual === 1) ? 2 : 1;
    }

    // No permitir dar de baja a un Administrador
    if ($idRol === 1 && $nuevoStatus !== 1) {
        echo json_encode([
            "success" => false,
            "mensaje" => "No se puede dar de baja a un administrador."
        ]);
        return;
    }

    // Actualizar el estado en la base de datos
    $stmtUpdate = mysqli_prepare($conexion, "UPDATE info_admin SET id_status = ? WHERE id_admin = ?");
    if (!$stmtUpdate) {
        echo json_encode([
            "success" => false,
            "mensaje" => "Error al preparar la actualización de estado."
        ]);
        return;
    }

    mysqli_stmt_bind_param($stmtUpdate, "ii", $nuevoStatus, $idAdmin);

    if (!mysqli_stmt_execute($stmtUpdate)) {
        mysqli_stmt_close($stmtUpdate);
        echo json_encode([
            "success" => false,
            "mensaje" => "Ocurrió un error al actualizar el estado del usuario."
        ]);
        return;
    }

    mysqli_stmt_close($stmtUpdate);

    $mensaje = ($nuevoStatus === 1)
        ? "El usuario ha sido reactivado correctamente."
        : "El usuario ha sido dado de baja correctamente.";

    echo json_encode([
        "success" => true,
        "mensaje" => $mensaje,
        "id_status" => $nuevoStatus
    ]);
}


//==============================================
// FUNCIÓN PARA OBTENER LOS PERMISOS DE UN USUARIO
//==============================================

function obtenerPermisos(mysqli $conexion)
{
    // obtiene el id del admin enviado por post y lo convierte a entero
    $idAdmin = intval($_POST['id_admin'] ?? 0);

    // consulta sql para obtener todos los módulos del sistema
    $sqlModulos = "SELECT
                        id_modulo,
                        clave_modulo,
                        nombre_modulo
                   FROM modulos
                   ORDER BY id_modulo ASC";

    // ejecuta la consulta de módulos
    $resultadoModulos = mysqli_query($conexion, $sqlModulos);

    // si hay error en la consulta de módulos, retorna un mensaje de error
    if (!$resultadoModulos) {

        echo json_encode([
            "success" => false,
            "mensaje" => "Error al obtener los módulos."
        ]);

        return;
    }

    // crea un array para almacenar los módulos
    $modulos = [];

    // recorre cada resultado y lo agrega al array de módulos
    while ($modulo = mysqli_fetch_assoc($resultadoModulos)) {
        $modulos[] = $modulo;
    }


    // consulta sql para obtener todos los permisos con su estado de asignación
    // usa left join para verificar si el permiso está asignado al admin
    $sqlPermisos = "SELECT
                        p.id_permiso,
                        p.id_modulo,
                        p.clave_permiso,
                        p.nombre_permiso,
                        p.descripcion,

                        CASE
                            WHEN ap.id_admin_permiso IS NOT NULL THEN 1
                            ELSE 0
                        END AS asignado

                    FROM permisos p

                    LEFT JOIN admin_permisos ap
                        ON ap.id_permiso = p.id_permiso
                        AND ap.id_admin = $idAdmin

                    ORDER BY
                        p.id_modulo ASC,
                        p.id_permiso ASC";

    // ejecuta la consulta de permisos
    $resultadoPermisos = mysqli_query($conexion, $sqlPermisos);

    // si hay error en la consulta de permisos, retorna un mensaje de error
    if (!$resultadoPermisos) {

        echo json_encode([
            "success" => false,
            "mensaje" => "Error al obtener los permisos."
        ]);

        return;
    }

    // crea un array para almacenar los permisos
    $permisos = [];

    // recorre cada resultado y lo agrega al array de permisos
    while ($permiso = mysqli_fetch_assoc($resultadoPermisos)) {
        $permisos[] = $permiso;
    }


    // retorna los módulos y permisos en formato json
    echo json_encode([
        "success" => true,
        "modulos" => $modulos,
        "permisos" => $permisos
    ]);
}


//==============================================
// FUNCIÓN PARA GUARDAR LOS PERMISOS DE UN USUARIO
//==============================================

function guardarPermisos(mysqli $conexion)
{
    $idAdmin = intval($_POST['id_admin'] ?? 0);
    $permisos = $_POST['permisos'] ?? [];

    // valida que exista un usuario válido
    if ($idAdmin <= 0) {

        echo json_encode([
            "success" => false,
            "mensaje" => "Usuario no válido."
        ]);

        return;
    }

    // inicia una transacción para mantener los permisos sincronizados
    mysqli_begin_transaction($conexion);

    try {

        // elimina los permisos actuales del usuario
        $sqlEliminar = "DELETE FROM admin_permisos
                        WHERE id_admin = $idAdmin";

        if (!mysqli_query($conexion, $sqlEliminar)) {
            throw new Exception("No se pudieron eliminar los permisos actuales.");
        }


        // prepara la consulta para insertar los nuevos permisos
        $stmt = mysqli_prepare(
            $conexion,
            "INSERT INTO admin_permisos (id_admin, id_permiso)
             VALUES (?, ?)"
        );

        if (!$stmt) {
            throw new Exception("No se pudo preparar el guardado de permisos.");
        }


        // inserta cada permiso seleccionado
        foreach ($permisos as $idPermiso) {

            $idPermiso = intval($idPermiso);

            if ($idPermiso <= 0) {
                continue;
            }

            mysqli_stmt_bind_param(
                $stmt,
                "ii",
                $idAdmin,
                $idPermiso
            );

            if (!mysqli_stmt_execute($stmt)) {
                throw new Exception("No se pudo guardar uno de los permisos.");
            }
        }


        // cierra la consulta preparada
        mysqli_stmt_close($stmt);

        // confirma todos los cambios
        mysqli_commit($conexion);

        echo json_encode([
            "success" => true,
            "mensaje" => "Permisos guardados correctamente."
        ]);
    } catch (Exception $e) {

        // revierte todos los cambios si ocurre algún error
        mysqli_rollback($conexion);

        echo json_encode([
            "success" => false,
            "mensaje" => $e->getMessage()
        ]);
    }
}
