<?php

require_once __DIR__ . "/../../conexion/conexion.php";
/** @var mysqli $conexion */

$accion = $_POST['accion'] ?? $_GET['accion'] ?? '';

// VALIDAR A QUE FUNCION SE VA A LLAMAR A TRAVEZ DEL CASE

switch ($accion) {

    case 'obtenerAreas':
        obtenerAreas($conexion);
        break;

    case 'agregarArea':
        agregarArea($conexion);
        break;

    case 'editarArea':
        editarArea($conexion);
        break;

    case 'actualizarLogo':
        actualizarLogo($conexion);
        break;

    default:
        echo json_encode([
            "success" => false,
            "mensaje" => "Acción no válida."
        ]);
        break;
}


// ====================================================
// FUNCIÓN PARA OBTENER LAS ÁREAS
// ====================================================

function obtenerAreas(mysqli $conexion)
{
    // Creamos la consulta para obtener las áreas
    $sql = "SELECT 
                *
            FROM areas
            ORDER BY nombre_area ASC";

    // Ejecutamos la consulta
    $resultado = mysqli_query($conexion, $sql);

    // Verificamos si la consulta se ejecutó correctamente
    if (!$resultado) {

        // Enviamos una respuesta indicando que ocurrió un error
        echo json_encode([
            "success" => false,
            "mensaje" => "Error al obtener las áreas."
        ]);

        // Terminamos la ejecución de la función
        return;
    }

    // Creamos un arreglo vacío para almacenar las áreas
    $areas = [];

    // Recorremos cada registro obtenido
    while ($area = mysqli_fetch_assoc($resultado)) {

        // Agregamos el área al arreglo
        $areas[] = $area;
    }

    // Enviamos la respuesta en formato JSON
    echo json_encode([
        "success" => true,
        "areas" => $areas
    ]);
}


// ====================================================
// FUNCIÓN PARA AGREGAR UNA NUEVA ÁREA
// ====================================================

function agregarArea(mysqli $conexion)
{
    // Obtenemos los datos del formulario
    $nombre_area = trim($_POST['nombre_area'] ?? '');
    $colores = trim($_POST['colores'] ?? '#6c757d');
    $colores_texto = trim($_POST['colores_texto'] ?? '#ffffff');

    // Validamos que el nombre no esté vacío
    if ($nombre_area === '') {

        echo json_encode([
            "success" => false,
            "mensaje" => "El nombre del área no puede estar vacío."
        ]);

        return;
    }

    // Variable para guardar el nombre del archivo del logo
    $logo_area = null;

    // Verificamos si se envió un archivo de logo
    if (isset($_FILES['logo_area']) && $_FILES['logo_area']['error'] === UPLOAD_ERR_OK) {

        $archivo = $_FILES['logo_area'];
        $nombre_archivo = $archivo['name'];
        $tipo_archivo = $archivo['type'];
        $tamano_archivo = $archivo['size'];
        $archivo_temporal = $archivo['tmp_name'];

        // Validar que sea una imagen
        $tipos_permitidos = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!in_array($tipo_archivo, $tipos_permitidos)) {

            echo json_encode([
                "success" => false,
                "mensaje" => "El logo debe ser una imagen (JPG, PNG, GIF o WebP)."
            ]);

            return;
        }

        // Validar tamaño (máximo 5MB)
        if ($tamano_archivo > 5 * 1024 * 1024) {

            echo json_encode([
                "success" => false,
                "mensaje" => "El logo no debe exceder 5MB."
            ]);

            return;
        }

        // Generar nombre único para el archivo
        $extension = pathinfo($nombre_archivo, PATHINFO_EXTENSION);
        $nombre_unico = uniqid('logo_area_', true) . '.' . $extension;

        // Directorio donde se guardarán los logos
        $directorio_destino = __DIR__ . '/../../public/logosAreas/';

        // Crear el directorio si no existe
        if (!is_dir($directorio_destino)) {
            mkdir($directorio_destino, 0755, true);
        }

        // Mover el archivo al directorio destino
        if (move_uploaded_file($archivo_temporal, $directorio_destino . $nombre_unico)) {
            $logo_area = $nombre_unico;
        } else {

            echo json_encode([
                "success" => false,
                "mensaje" => "Error al guardar el logo del área."
            ]);

            return;
        }
    }

    // Preparamos la consulta para insertar el área
    $sql = "INSERT INTO areas (
                nombre_area,
                logo_area,
                colores,
                colores_texto
            ) VALUES (?, ?, ?, ?)";

    $stmt = mysqli_prepare($conexion, $sql);

    // Verificamos que la consulta se haya preparado correctamente
    if (!$stmt) {

        echo json_encode([
            "success" => false,
            "mensaje" => "Error al preparar la inserción del área."
        ]);

        return;
    }

    // Asociamos los valores a la consulta
    mysqli_stmt_bind_param(
        $stmt,
        "ssss",
        $nombre_area,
        $logo_area,
        $colores,
        $colores_texto
    );

    // Ejecutamos la inserción
    if (mysqli_stmt_execute($stmt)) {

        echo json_encode([
            "success" => true,
            "mensaje" => "El área se agregó correctamente."
        ]);

    } else {

        echo json_encode([
            "success" => false,
            "mensaje" => "No fue posible agregar el área."
        ]);
    }

    // Cerramos la consulta
    mysqli_stmt_close($stmt);
}

// ====================================================
// FUNCIÓN PARA ACTUALIZAR LA INFORMACIÓN DE UN ÁREA
// ====================================================

function editarArea(mysqli $conexion)
{
    // Obtenemos los datos enviados desde AJAX
    $datosArea = $_POST['datosArea'] ?? [];

    // Obtenemos cada dato
    $id_area = $datosArea['id_area'] ?? '';
    $nombre_area = trim($datosArea['nombre_area'] ?? '');
    $colores = trim($datosArea['colores'] ?? '#6c757d');
    $colores_texto = trim($datosArea['colores_texto'] ?? '#ffffff');

    // Validamos que exista el ID del área
    if (empty($id_area)) {

        echo json_encode([
            "success" => false,
            "mensaje" => "No se recibió el ID del área."
        ]);

        return;
    }

    // Validamos que el nombre no esté vacío
    if ($nombre_area === '') {

        echo json_encode([
            "success" => false,
            "mensaje" => "El nombre del área no puede estar vacío."
        ]);

        return;
    }

    // Preparamos la consulta para actualizar el área
    $sql = "UPDATE areas SET
                nombre_area = ?,
                colores = ?,
                colores_texto = ?
            WHERE id_area = ?";

    $stmt = mysqli_prepare($conexion, $sql);

    // Verificamos que la consulta se haya preparado correctamente
    if (!$stmt) {

        echo json_encode([
            "success" => false,
            "mensaje" => "Error al preparar la actualización del área."
        ]);

        return;
    }

    // Asociamos los valores a la consulta
    mysqli_stmt_bind_param(
        $stmt,
        "sssi",
        $nombre_area,
        $colores,
        $colores_texto,
        $id_area
    );

    // Ejecutamos la actualización
    if (mysqli_stmt_execute($stmt)) {

        echo json_encode([
            "success" => true,
            "mensaje" => "La información del área se actualizó correctamente."
        ]);

    } else {

        echo json_encode([
            "success" => false,
            "mensaje" => "No fue posible actualizar la información del área."
        ]);
    }

    // Cerramos la consulta
    mysqli_stmt_close($stmt);
}

// ====================================================
// FUNCIÓN PARA ACTUALIZAR EL LOGO DE UN ÁREA
// ====================================================

function actualizarLogo(mysqli $conexion)
{
    $id_area = isset($_POST['id_area']) ? intval($_POST['id_area']) : 0;

    if ($id_area <= 0) {
        echo json_encode([
            "success" => false,
            "mensaje" => "ID de área no válido."
        ]);
        return;
    }

    $archivo = $_FILES['logo'] ?? $_FILES['logo_area'] ?? null;

    if (!$archivo || $archivo['error'] !== UPLOAD_ERR_OK) {
        echo json_encode([
            "success" => false,
            "mensaje" => "No se recibió ninguna imagen o ocurrió un error al subirla."
        ]);
        return;
    }

    // Validar formato de imagen
    $tipos_permitidos = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'image/gif'
    ];

    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mime_type = finfo_file($finfo, $archivo['tmp_name']);
    finfo_close($finfo);

    if (!in_array($mime_type, $tipos_permitidos) && !in_array($archivo['type'], $tipos_permitidos)) {
        echo json_encode([
            "success" => false,
            "mensaje" => "Formato de imagen no permitido. Utilice JPG, PNG, WEBP o GIF."
        ]);
        return;
    }

    // Validar tamaño máximo (5MB)
    $tamano_maximo = 5 * 1024 * 1024;
    if ($archivo['size'] > $tamano_maximo) {
        echo json_encode([
            "success" => false,
            "mensaje" => "La imagen excede el límite máximo permitido de 5 MB."
        ]);
        return;
    }

    // Verificar existencia del área y obtener el logo actual
    $sql_verificar = "SELECT id_area, logo_area, nombre_area FROM areas WHERE id_area = ?";
    $stmt_verificar = mysqli_prepare($conexion, $sql_verificar);
    if (!$stmt_verificar) {
        echo json_encode([
            "success" => false,
            "mensaje" => "Error al verificar la información del área."
        ]);
        return;
    }

    mysqli_stmt_bind_param($stmt_verificar, "i", $id_area);
    mysqli_stmt_execute($stmt_verificar);
    $res_verificar = mysqli_stmt_get_result($stmt_verificar);
    $area_actual = mysqli_fetch_assoc($res_verificar);
    mysqli_stmt_close($stmt_verificar);

    if (!$area_actual) {
        echo json_encode([
            "success" => false,
            "mensaje" => "El área no existe en la base de datos."
        ]);
        return;
    }

    try {
        // Directorio destino de los logos
        $directorio_destino = __DIR__ . '/../../public/logosAreas/';

        if (!file_exists($directorio_destino)) {
            mkdir($directorio_destino, 0755, true);
        }

        // Obtener extensión del archivo
        $extension_original = strtolower(pathinfo($archivo['name'], PATHINFO_EXTENSION));
        if (empty($extension_original)) {
            $extensiones_mime = [
                'image/jpeg' => 'jpg',
                'image/jpg' => 'jpg',
                'image/png' => 'png',
                'image/webp' => 'webp',
                'image/gif' => 'gif'
            ];
            $extension_original = $extensiones_mime[$mime_type] ?? 'jpg';
        }

        // Generar nombre de archivo único
        $nombre_archivo = 'logo_area_' . $id_area . '_' . time() . '.' . $extension_original;
        $ruta_absoluta = $directorio_destino . $nombre_archivo;

        // Mover el archivo subido
        if (!move_uploaded_file($archivo['tmp_name'], $ruta_absoluta)) {
            throw new Exception("No se pudo guardar la imagen en el servidor.");
        }

        // Actualizar el logo en la base de datos
        $sql_update = "UPDATE areas SET logo_area = ? WHERE id_area = ?";
        $stmt_update = mysqli_prepare($conexion, $sql_update);
        if (!$stmt_update) {
            if (file_exists($ruta_absoluta)) {
                unlink($ruta_absoluta);
            }
            throw new Exception("Error al preparar la actualización del logo.");
        }

        mysqli_stmt_bind_param($stmt_update, "si", $nombre_archivo, $id_area);
        if (!mysqli_stmt_execute($stmt_update)) {
            mysqli_stmt_close($stmt_update);
            if (file_exists($ruta_absoluta)) {
                unlink($ruta_absoluta);
            }
            throw new Exception("Error al actualizar el logo del área.");
        }
        mysqli_stmt_close($stmt_update);

        // Eliminar logo anterior si existía físicamente
        if (!empty($area_actual['logo_area'])) {
            $ruta_anterior_absoluta = $directorio_destino . $area_actual['logo_area'];
            if (file_exists($ruta_anterior_absoluta) && is_file($ruta_anterior_absoluta) && $ruta_anterior_absoluta !== $ruta_absoluta) {
                @unlink($ruta_anterior_absoluta);
            }
        }

        echo json_encode([
            "success" => true,
            "mensaje" => "Logo del área actualizado correctamente.",
            "logo_area" => $nombre_archivo,
            "id_area" => $id_area
        ]);

    } catch (Exception $e) {
        echo json_encode([
            "success" => false,
            "mensaje" => $e->getMessage()
        ]);
    }
}
