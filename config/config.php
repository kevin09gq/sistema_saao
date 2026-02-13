<?php 
// Iniciar sesión
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Definir zona horaria de la CDMX bhl
date_default_timezone_set('America/Mexico_City');

$rutaRaiz = "/sistema_saao";

//Define paths for local libraries
define('BOOTSTRAP_CSS', $rutaRaiz . '/public/plugins/bootstrap.min.css');
define('BOOTSTRAP_JS', $rutaRaiz . '/public/plugins/bootstrap.min.js');
define('BOOTSTRAP_ICONS', $rutaRaiz . '/public/plugins/bootstrap-icons.min.css');
define('JQUERY_JS', $rutaRaiz . '/public/plugins/jquery.min.js');
define('SWEETALERT', $rutaRaiz . '/public/plugins/sweetalert2011.js');
define('JQUERY_INPUTMASK', $rutaRaiz . '/public/plugins/jquery.inputmask.min.js');

define('JQUERY_UI_JS', $rutaRaiz . '/public/plugins/jquery-ui.min.js');
define('JQUERY_UI_CSS', $rutaRaiz . '/public/plugins/jquery-ui.min.css');

define('ICONO_SISTEMA', $rutaRaiz . '/public/img/icon.png');

define('DIAS_SEMANA', ['SABADO', 'DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES']);

// Función para verificar si el usuario está autenticado
function verificarSesion() {
    if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
        header("Location: /sistema_saao/login/login.php");
        exit;
    }
}

// Función para verificar si el usuario NO está autenticado (para páginas de login)
function verificarNoSesion() {
    if (isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true) {
        header("Location: /sistema_saao/index.php");
        exit;
    }
}

?>
