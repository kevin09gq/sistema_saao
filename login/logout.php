<?php
include("../config/config.php");

// Destruir todas las variables de sesión
$_SESSION = array();

// Destruir la sesión
session_destroy();

// Redirigir al login
header("Location: /sistema_saao/login/login.php");
exit;
?>
