<?php

/**
 * Función para enviar una respuesta JSON al cliente.
 * @param int $code Código de estado HTTP.
 * @param string $titulo Título de la respuesta.|
 * @param string $mensaje Mensaje de la respuesta.
 * @param string $icono Icono de la respuesta (por ejemplo, "success", "error").
 * @param array $data Datos adicionales a incluir en la respuesta.
 */
function respuesta(int $code, string $titulo, string $mensaje, string $icono, array $data)
{
    // Establecer el código de estado HTTP y el tipo de contenido
    http_response_code($code);
    // Establecer el encabezado Content-Type a application/json
    header('Content-Type: application/json');
    // responder con un JSON que contiene el título, mensaje, icono y datos adicionales
    echo json_encode([
        "titulo"  => $titulo,
        "texto" => $mensaje,
        "icono"   => $icono,
        "data"    => $data
    ], JSON_UNESCAPED_UNICODE);
}

/**
 * Convierte una fecha en formato "dd/mmm/yyyy" a "yyyy-mm-dd".
 * @param string $fecha La fecha en formato "dd/mmm/yyyy". Ejemplo: "15/Feb/2023".
 * @return string La fecha convertida en formato "yyyy-mm-dd". Ejemplo: "2023-02-15".
 */
function convertirFecha($fecha) {
    // Mapeo de abreviaturas de meses a números
    $meses = [
        'Ene' => '01',
        'Feb' => '02',
        'Mar' => '03',
        'Abr' => '04',
        'May' => '05',
        'Jun' => '06',
        'Jul' => '07',
        'Ago' => '08',
        'Sep' => '09',
        'Oct' => '10',
        'Nov' => '11',
        'Dic' => '12'
    ];

    // Separar la fecha en día, mes y año
    list($dia, $mes, $anio) = explode('/', $fecha);
    // Validar que el mes esté en el mapeo
    return sprintf('%04d-%s-%02d', $anio, $meses[$mes], $dia);
}