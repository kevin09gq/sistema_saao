<?php
/**
 * Archivo de configuración para la vigencia de gafetes
 * No modificar manualmente - usar la interfaz de configuración
 */

// Configuración para empleados CON IMSS
$config_vigencia['con_imss'] = [
    'valor' => 2,
    'unidad' => 'years'
];

// Configuración para empleados SIN IMSS
$config_vigencia['sin_imss'] = [
    'valor' => 45,
    'unidad' => 'days'
];

// Valores por defecto (para referencia)
$config_vigencia['default'] = [
    'con_imss' => ['valor' => 1, 'unidad' => 'year'],
    'sin_imss' => ['valor' => 45, 'unidad' => 'days']
];

// Función para obtener la configuración de vigencia
function getConfigVigencia() {
    global $config_vigencia;
    return $config_vigencia;
}
