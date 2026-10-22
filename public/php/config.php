<?php 

// Definir zona horaria de la CDMX bhl
date_default_timezone_set('America/Mexico_City');

// Ruta raiz del sistema
$rutaRaiz = "/sistema_saao";

// Define paths for local libraries
define('BOOTSTRAP_CSS', $rutaRaiz . '/public/plugins/bootstrap.min.css');
define('BOOTSTRAP_JS', $rutaRaiz . '/public/plugins/bootstrap.min.js');
define('BOOTSTRAP_ICONS', $rutaRaiz . '/public/plugins/bootstrap-icons.min.css');
define('JQUERY_JS', $rutaRaiz . '/public/plugins/jquery.min.js');
define('SWEETALERT', $rutaRaiz . '/public/plugins/sweetalert2011.js');
define('JQUERY_INPUTMASK', $rutaRaiz . '/public/plugins/jquery.inputmask.min.js');
define('JQUERY_UI_JS', $rutaRaiz . '/public/plugins/jquery-ui.min.js');
define('JQUERY_UI_CSS', $rutaRaiz . '/public/plugins/jquery-ui.min.css');
define('CHART_JS', $rutaRaiz . '/public/plugins/chart.min.js');
// Icono del sistema
define('ICONO_SISTEMA', $rutaRaiz . '/public/img/icon.png');
// Archivo JS de permisos global
define('PERMISOS_JS', $rutaRaiz . '/public/js/permisos.js');
// Dias de la semana para el reloj checador
define('DIAS_SEMANA', ['SABADO', 'DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES']);
// Dias de la semana para las nominas de VIERNES a JUEVES
define('DIAS_SEMANA_NOMINA', ['VIERNES', 'SABADO', 'DOMINGO', 'LUNES', 'MARTES', 'MIERCOLES', 'JUEVES']);

