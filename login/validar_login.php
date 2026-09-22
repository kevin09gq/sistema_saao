<?php
include("../config/config.php");
include("../conexion/conexion.php");


header("Content-Type: application/json; charset=UTF-8");


/** @var mysqli $conexion */

//====================================================
// VALIDAR ACCIÓN
//====================================================

if (!isset($_POST["accion"])) {

    echo json_encode([
        "estado" => false,
        "mensaje" => "Solicitud no válida."
    ]);

    exit;
}


//====================================================
// INICIAR SESIÓN
//====================================================

if ($_POST["accion"] === "iniciarSesion") {

    $correo = trim($_POST["correo"] ?? "");
    $password = $_POST["password"] ?? "";


    //================================================
    // VALIDAR CAMPOS
    //================================================

    if ($correo === "" || $password === "") {

        echo json_encode([
            "estado" => false,
            "mensaje" => "Ingresa tu correo y contraseña."
        ]);

        exit;
    }


    //================================================
    // BUSCAR ADMINISTRADOR
    //================================================

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


    //================================================
    // VERIFICAR SI EXISTE
    //================================================

    if ($resultado->num_rows === 0) {

        echo json_encode([
            "estado" => false,
            "mensaje" => "El correo o la contraseña son incorrectos."
        ]);

        exit;
    }


    $admin = $resultado->fetch_assoc();


    //================================================
    // VERIFICAR ESTATUS
    //================================================

    if ($admin["id_status"] != 1) {

        echo json_encode([
            "estado" => false,
            "mensaje" => "Tu usuario se encuentra inactivo. Contacta al administrador."
        ]);

        exit;
    }


    //================================================
    // VERIFICAR CONTRASEÑA
    //================================================

    if (!password_verify($password, $admin["password"])) {

        echo json_encode([
            "estado" => false,
            "mensaje" => "El correo o la contraseña son incorrectos."
        ]);

        exit;
    }


    //================================================
    // CREAR SESIÓN
    //================================================

    session_regenerate_id(true);

    $_SESSION["id_admin"] = $admin["id_admin"];
    $_SESSION["nombre_admin"] = $admin["nombre_admin"];
    $_SESSION["id_rol"] = $admin["id_rol"];
    $_SESSION["correo"] = $admin["correo"];
    $_SESSION["id_status"] = $admin["id_status"];
    $_SESSION["logged_in"] = true;


    //================================================
    // RESPUESTA
    //================================================

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