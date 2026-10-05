<?php

// INICIAR SESION PARA VERIFICAR SI HAY UNA SESION ACTIVA

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

//======================================
// FUNCION PARA VERIFICAR SESION
//======================================

function verificarSesion()
{
    if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
        header("Location: /sistema_saao/login/login.php");
        exit;
    }
}


//======================================================
// FUNCIÓN PARA VERIFICAR QUE NO HAYA SESION INICIADA
// PARA PAGINAS DE LOGIN
//======================================================

function verificarNoSesion()
{
    if (isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true) {
        header("Location: /sistema_saao/index.php");
        exit;
    }
}




//=============================================================
// FUNCIÓN PARA VALIDAR LAS PERMISOS DE LOS USUARIOS
// VERIFICA QUE CAMPOS MOSTRAR O DATOS A MOSTRAR EN LA PAGINA
//=============================================================

function tienePermiso(string $clavePermiso)
{
    // Buscamos el permiso que recibimos en la lista
    // de permisos que tiene guardada el usuario en la sesión.
    //
    // Ejemplo:
    // $clavePermiso = "empleados.ver_menu"
    //
    // $_SESSION["permisos"] podría contener:
    // [
    //     "empleados.ver_menu",
    //     "empleados.editar",
    //     "empleados.eliminar"
    // ]

    return in_array(
        $clavePermiso,

        // Obtenemos los permisos del usuario.
        // Si $_SESSION["permisos"] no existe,
        // utilizamos un arreglo vacío [].
        $_SESSION["permisos"] ?? []
    );

    // in_array() devuelve:
    //
    // true  -> si el permiso existe en la lista.
    // false -> si el permiso NO existe.
}

//=============================================================
// FUNCIÓN PARA VERIFICAR SI EL USUARIO TIENE PERMISO PARA ENTRAR 
// A LA PAGINA EVITANDO QUE INGRESE DIRECTAMENTE A LA PAGINA POR URL
//=============================================================
function verificarPermiso(string $clavePermiso)
{
    if (!tienePermiso($clavePermiso)) {

        header("Location: /sistema_saao/index.php");
        exit;
    }
}
