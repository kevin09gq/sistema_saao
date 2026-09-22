<?php

require_once '../../conexion/conexion.php';

/** @var mysqli $conexion */

header('Content-Type: application/json; charset=UTF-8');

$accion = $_POST['accion'] ?? $_GET['accion'] ?? '';

switch ($accion) {

    case 'obtenerUsuarios':
        obtenerUsuarios($conexion);
        break;

    case 'obtenerModulos':
        obtenerModulos($conexion);
        break;

    case 'obtenerPermisosModulo':
        obtenerPermisosModulo($conexion);
        break;

    case 'obtenerPermisosUsuario':
        obtenerPermisosUsuario($conexion);
        break;

    case 'guardarPermisosUsuario':
        guardarPermisosUsuario($conexion);
        break;

    default:
        echo json_encode([
            "success" => false,
            "mensaje" => "Acción no válida."
        ]);
        break;
}


/**
 * ===========================================================
 * OBTENER TODOS LOS USUARIOS Y ESTADÍSTICAS
 * ===========================================================
 */
function obtenerUsuarios(mysqli $conexion)
{
    $sql = "SELECT 
                u.id_admin,
                u.nombre_admin,
                u.correo,
                u.id_rol,
                r.nombre_rol,
                u.id_status,
                s.nombre_status,
                COUNT(up.id_permiso) AS total_permisos
            FROM info_admin u
            INNER JOIN rol r 
                ON u.id_rol = r.id_rol
            INNER JOIN status s 
                ON u.id_status = s.id_status
            LEFT JOIN usuario_permisos up 
                ON u.id_admin = up.id_admin
            GROUP BY 
                u.id_admin,
                u.nombre_admin,
                u.correo,
                u.id_rol,
                r.nombre_rol,
                u.id_status,
                s.nombre_status
            ORDER BY u.id_admin ASC";

    $resultado = $conexion->query($sql);

    if (!$resultado) {
        echo json_encode([
            "success" => false,
            "mensaje" => "Error al consultar usuarios: " . $conexion->error
        ]);
        return;
    }

    $usuarios = [];

    $totalAdmins = 0;
    $totalEstandar = 0;
    $totalActivos = 0;

    while ($row = $resultado->fetch_assoc()) {

        $usuarios[] = $row;

        if ($row['id_rol'] == 1) {
            $totalAdmins++;
        } else {
            $totalEstandar++;
        }

        if ($row['id_status'] == 1) {
            $totalActivos++;
        }
    }

    echo json_encode([
        "success" => true,
        "usuarios" => $usuarios,
        "estadisticas" => [
            "total" => count($usuarios),
            "admins" => $totalAdmins,
            "estandar" => $totalEstandar,
            "activos" => $totalActivos
        ]
    ]);
}


/**
 * ===========================================================
 * OBTENER TODOS LOS MÓDULOS
 * ===========================================================
 */
function obtenerModulos(mysqli $conexion)
{
    $sql = "SELECT
                id_modulo,
                clave_modulo,
                nombre_modulo,
                categoria,
                icono,
                descripcion
            FROM modulos
            ORDER BY categoria ASC, nombre_modulo ASC";

    $resultado = $conexion->query($sql);

    if (!$resultado) {
        echo json_encode([
            "success" => false,
            "mensaje" => "Error al consultar módulos: " . $conexion->error
        ]);
        return;
    }

    $modulos = [];

    while ($row = $resultado->fetch_assoc()) {
        $modulos[] = $row;
    }

    echo json_encode([
        "success" => true,
        "modulos" => $modulos
    ]);
}


/**
 * ===========================================================
 * OBTENER PERMISOS DE UN MÓDULO
 * ===========================================================
 */
function obtenerPermisosModulo(mysqli $conexion)
{
    $idModulo = intval($_POST['id_modulo'] ?? 0);

    if ($idModulo <= 0) {
        echo json_encode([
            "success" => false,
            "mensaje" => "Módulo no válido."
        ]);
        return;
    }

    $stmt = $conexion->prepare("
        SELECT
            id_permiso,
            id_modulo,
            clave_permiso,
            nombre_permiso,
            descripcion
        FROM permisos_modulo
        WHERE id_modulo = ?
        ORDER BY nombre_permiso ASC
    ");

    $stmt->bind_param("i", $idModulo);

    if (!$stmt->execute()) {
        echo json_encode([
            "success" => false,
            "mensaje" => "Error al consultar permisos: " . $stmt->error
        ]);
        return;
    }

    $resultado = $stmt->get_result();

    $permisos = [];

    while ($row = $resultado->fetch_assoc()) {
        $permisos[] = $row;
    }

    echo json_encode([
        "success" => true,
        "permisos" => $permisos
    ]);
}


/**
 * ===========================================================
 * OBTENER TODOS LOS MÓDULOS Y PERMISOS DE UN USUARIO
 * ===========================================================
 */
function obtenerPermisosUsuario(mysqli $conexion)
{
    $idAdmin = intval($_POST['id_admin'] ?? 0);

    if ($idAdmin <= 0) {
        echo json_encode([
            "success" => false,
            "mensaje" => "Usuario no válido."
        ]);
        return;
    }

    // Obtener nombre del usuario
    $stmtUsuario = $conexion->prepare("
        SELECT nombre_admin
        FROM info_admin
        WHERE id_admin = ?
    ");

    $stmtUsuario->bind_param("i", $idAdmin);
    $stmtUsuario->execute();

    $resultadoUsuario = $stmtUsuario->get_result();

    if ($resultadoUsuario->num_rows === 0) {
        echo json_encode([
            "success" => false,
            "mensaje" => "El usuario no existe."
        ]);
        return;
    }

    $usuario = $resultadoUsuario->fetch_assoc();

    // Obtener módulos y permisos
    $stmt = $conexion->prepare("
        SELECT
            m.id_modulo,
            m.nombre_modulo,
            m.clave_modulo,
            m.categoria,
            m.icono,

            p.id_permiso,
            p.clave_permiso,
            p.nombre_permiso,
            p.descripcion,

            CASE
                WHEN up.id_permiso IS NOT NULL THEN 1
                ELSE 0
            END AS asignado

        FROM modulos m

        LEFT JOIN permisos_modulo p
            ON p.id_modulo = m.id_modulo

        LEFT JOIN usuario_permisos up
            ON up.id_permiso = p.id_permiso
            AND up.id_admin = ?

        ORDER BY
            m.categoria ASC,
            m.nombre_modulo ASC,
            p.nombre_permiso ASC
    ");

    $stmt->bind_param("i", $idAdmin);

    if (!$stmt->execute()) {
        echo json_encode([
            "success" => false,
            "mensaje" => "Error al consultar permisos: " . $stmt->error
        ]);
        return;
    }

    $resultado = $stmt->get_result();

    $modulos = [];

    while ($row = $resultado->fetch_assoc()) {

        $idModulo = $row['id_modulo'];

        // Si todavía no existe el módulo
        if (!isset($modulos[$idModulo])) {

            $modulos[$idModulo] = [
                "id_modulo" => $row['id_modulo'],
                "nombre_modulo" => $row['nombre_modulo'],
                "clave_modulo" => $row['clave_modulo'],
                "categoria" => $row['categoria'],
                "icono" => $row['icono'],
                "permisos" => []
            ];
        }

        // Agregar permiso si existe
        if ($row['id_permiso'] !== null) {

            $modulos[$idModulo]['permisos'][] = [
                "id_permiso" => $row['id_permiso'],
                "clave_permiso" => $row['clave_permiso'],
                "nombre_permiso" => $row['nombre_permiso'],
                "descripcion" => $row['descripcion'],
                "asignado" => (bool)$row['asignado']
            ];
        }
    }

    // Convertir índices asociativos a arreglo normal
    $modulos = array_values($modulos);

    echo json_encode([
        "success" => true,
        "nombre_admin" => $usuario['nombre_admin'],
        "modulos" => $modulos
    ]);
}


/**
 * ===========================================================
 * GUARDAR PERMISOS DE UN USUARIO
 * ===========================================================
 */
function guardarPermisosUsuario(mysqli $conexion)
{
    $idAdmin = intval($_POST['id_admin'] ?? 0);

    $permisos = $_POST['permisos'] ?? [];

    if ($idAdmin <= 0) {
        echo json_encode([
            "success" => false,
            "mensaje" => "Usuario no válido."
        ]);
        return;
    }

    if (!is_array($permisos)) {
        $permisos = [];
    }

    // Iniciar transacción
    $conexion->begin_transaction();

    try {

        // Primero eliminamos los permisos actuales
        $stmtEliminar = $conexion->prepare("
            DELETE FROM usuario_permisos
            WHERE id_admin = ?
        ");

        $stmtEliminar->bind_param("i", $idAdmin);

        if (!$stmtEliminar->execute()) {
            throw new Exception(
                "No se pudieron eliminar los permisos actuales."
            );
        }

        // Preparar inserción
        $stmtInsertar = $conexion->prepare("
            INSERT INTO usuario_permisos
            (
                id_admin,
                id_permiso
            )
            VALUES (?, ?)
        ");

        foreach ($permisos as $idPermiso) {

            $idPermiso = intval($idPermiso);

            if ($idPermiso <= 0) {
                continue;
            }

            $stmtInsertar->bind_param(
                "ii",
                $idAdmin,
                $idPermiso
            );

            if (!$stmtInsertar->execute()) {
                throw new Exception(
                    "No se pudo guardar uno de los permisos."
                );
            }
        }

        // Confirmar cambios
        $conexion->commit();

        echo json_encode([
            "success" => true,
            "mensaje" => "Permisos guardados correctamente."
        ]);

    } catch (Exception $e) {

        // Deshacer cambios
        $conexion->rollback();

        echo json_encode([
            "success" => false,
            "mensaje" => $e->getMessage()
        ]);
    }
}
?>