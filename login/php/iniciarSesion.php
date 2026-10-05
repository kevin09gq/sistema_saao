<?php

include "../../public/php/config.php";

include "../../public/php/verificarSesion.php";

include "../../conexion/conexion.php";


header("Content-Type: application/json; charset=UTF-8");

/** @var mysqli $conexion */

// valida la acción
if (!isset($_POST["accion"])) {

    echo json_encode([
        "estado" => false,
        "mensaje" => "Solicitud no válida."
    ]);

    exit;
}


// inicia sesión
if ($_POST["accion"] === "iniciarSesion") {

    $correo = trim($_POST["correo"] ?? "");
    $password = $_POST["password"] ?? "";


    // valida que se hayan enviado los campos
    if ($correo === "" || $password === "") {

        echo json_encode([
            "estado" => false,
            "mensaje" => "Ingresa tu correo y contraseña."
        ]);

        exit;
    }


    // busca el administrador por su correo
    $sql = "SELECT 
                id_admin,
                nombre_admin,
                id_rol,
                correo,
                id_status,
                password
            FROM info_admin
            WHERE correo = ?
            LIMIT 1";

    $stmt = $conexion->prepare($sql);

    $stmt->bind_param("s", $correo);

    $stmt->execute();

    $resultado = $stmt->get_result();


    // verifica si el administrador existe
    if ($resultado->num_rows === 0) {

        echo json_encode([
            "estado" => false,
            "mensaje" => "El correo o la contraseña son incorrectos."
        ]);

        exit;
    }


    $admin = $resultado->fetch_assoc();


    // verifica que el usuario esté activo
    if ($admin["id_status"] != 1) {

        echo json_encode([
            "estado" => false,
            "mensaje" => "Tu usuario se encuentra inactivo. Contacta al administrador."
        ]);

        exit;
    }


    // verifica que la contraseña sea correcta
    if (!password_verify($password, $admin["password"])) {

        echo json_encode([
            "estado" => false,
            "mensaje" => "El correo o la contraseña son incorrectos."
        ]);

        exit;
    }


    // obtiene todos los permisos asignados al administrador
    $sqlPermisos = "SELECT 
                        p.clave_permiso
                    FROM admin_permisos ap
                    INNER JOIN permisos p
                        ON p.id_permiso = ap.id_permiso
                    WHERE ap.id_admin = ?
                    ORDER BY p.id_permiso ASC";

    $stmtPermisos = $conexion->prepare($sqlPermisos);

    $stmtPermisos->bind_param(
        "i",
        $admin["id_admin"]
    );

    $stmtPermisos->execute();

    $resultadoPermisos = $stmtPermisos->get_result();

    $permisos = [];

    while ($permiso = $resultadoPermisos->fetch_assoc()) {
        $permisos[] = $permiso["clave_permiso"];
    }


    // regenera el identificador de sesión
    session_regenerate_id(true);

    // guarda los datos del administrador en la sesión
    $_SESSION["id_admin"] = $admin["id_admin"];
    $_SESSION["nombre_admin"] = $admin["nombre_admin"];
    $_SESSION["id_rol"] = $admin["id_rol"];
    $_SESSION["correo"] = $admin["correo"];
    $_SESSION["id_status"] = $admin["id_status"];
    $_SESSION["logged_in"] = true;

    // guarda los permisos del administrador en la sesión
    $_SESSION["permisos"] = $permisos;


    // responde que el inicio de sesión fue exitoso
    echo json_encode([
        "estado" => true,
        "mensaje" => "Bienvenido " . $admin["nombre_admin"] . "."
    ]);

    exit;
}


echo json_encode([
    "estado" => false,
    "mensaje" => "Acción no reconocida."
]);

exit;
