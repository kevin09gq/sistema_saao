<?php

require_once __DIR__ . "/../../conexion/conexion.php";
/** @var mysqli $conexion */

$accion = $_POST['accion'] ?? $_GET['accion'] ?? '';

// VALIDAR A QUE FUNCION SE VA A LLAMAR A TRAVEZ DEL CASE

switch ($accion) {

    case 'obtenerEmpresas':
        obtenerEmpresas($conexion);
        break;

    case 'agregarEmpresa':
        agregarEmpresa($conexion);
        break;

    case 'editarEmpresa':
        editarEmpresa($conexion);
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
// FUNCIÓN PARA OBTENER LAS EMPRESAS
// ====================================================

function obtenerEmpresas(mysqli $conexion)
{
    // Creamos la consulta para obtener las empresas
    $sql = "SELECT 
                *
            FROM empresa
            ORDER BY nombre_empresa ASC";

    // Ejecutamos la consulta
    $resultado = mysqli_query($conexion, $sql);

    // Verificamos si la consulta se ejecutó correctamente
    if (!$resultado) {

        // Enviamos una respuesta indicando que ocurrió un error
        echo json_encode([
            "success" => false,
            "mensaje" => "Error al obtener las empresas."
        ]);

        // Terminamos la ejecución de la función
        return;
    }

    // Creamos un arreglo vacío para almacenar las empresas
    $empresas = [];

    // Recorremos cada registro obtenido
    while ($empresa = mysqli_fetch_assoc($resultado)) {

        // Agregamos la empresa al arreglo
        $empresas[] = $empresa;
    }

    // Enviamos la respuesta en formato JSON
    echo json_encode([
        "success" => true,
        "empresas" => $empresas
    ]);
}


// ====================================================
// FUNCIÓN PARA AGREGAR UNA NUEVA EMPRESA
// ====================================================

function agregarEmpresa(mysqli $conexion)
{
    // Obtenemos los datos del formulario
    $nombre_empresa = trim($_POST['nombre_empresa'] ?? '');
    $rfc_empresa = trim($_POST['rfc_empresa'] ?? '');
    $domicilio_fiscal = trim($_POST['domicilio_fiscal'] ?? '');

    // Validamos que el nombre no esté vacío
    if ($nombre_empresa === '') {

        echo json_encode([
            "success" => false,
            "mensaje" => "El nombre de la empresa no puede estar vacío."
        ]);

        return;
    }

    // Variable para guardar el nombre del archivo del logo
    $logo_empresa = null;

    // Verificamos si se envió un archivo de logo
    if (isset($_FILES['logo_empresa']) && $_FILES['logo_empresa']['error'] === UPLOAD_ERR_OK) {

        $archivo = $_FILES['logo_empresa'];
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
        $nombre_unico = uniqid('logo_', true) . '.' . $extension;

        // Directorio donde se guardarán los logos
        $directorio_destino = __DIR__ . '/../../public/logosEmpresas/';

        // Crear el directorio si no existe
        if (!is_dir($directorio_destino)) {
            mkdir($directorio_destino, 0755, true);
        }

        // Mover el archivo al directorio destino
        if (move_uploaded_file($archivo_temporal, $directorio_destino . $nombre_unico)) {
            $logo_empresa = $nombre_unico;
        } else {

            echo json_encode([
                "success" => false,
                "mensaje" => "Error al guardar el logo de la empresa."
            ]);

            return;
        }
    }

    // Preparamos la consulta para insertar la empresa
    $sql = "INSERT INTO empresa (
                nombre_empresa,
                rfc_empresa,
                domicilio_fiscal,
                logo_empresa
            ) VALUES (?, ?, ?, ?)";

    $stmt = mysqli_prepare($conexion, $sql);

    // Verificamos que la consulta se haya preparado correctamente
    if (!$stmt) {

        echo json_encode([
            "success" => false,
            "mensaje" => "Error al preparar la inserción de la empresa."
        ]);

        return;
    }

    // Asociamos los valores a la consulta
    mysqli_stmt_bind_param(
        $stmt,
        "ssss",
        $nombre_empresa,
        $rfc_empresa,
        $domicilio_fiscal,
        $logo_empresa
    );

    // Ejecutamos la inserción
    if (mysqli_stmt_execute($stmt)) {

        echo json_encode([
            "success" => true,
            "mensaje" => "La empresa se agregó correctamente."
        ]);

    } else {

        echo json_encode([
            "success" => false,
            "mensaje" => "No fue posible agregar la empresa."
        ]);
    }

    // Cerramos la consulta
    mysqli_stmt_close($stmt);
}

// ====================================================
// FUNCIÓN PARA ACTUALIZAR LA INFORMACIÓN DE UNA EMPRESA
// ====================================================

function editarEmpresa(mysqli $conexion)
{
    // Obtenemos los datos enviados desde AJAX
    $datosEmpresa = $_POST['datosEmpresa'] ?? [];

    // Obtenemos cada dato
    $id_empresa = $datosEmpresa['id_empresa'] ?? '';
    $nombre_empresa = trim($datosEmpresa['nombre_empresa'] ?? '');
    $rfc_empresa = trim($datosEmpresa['rfc_empresa'] ?? '');
    $domicilio_fiscal = trim($datosEmpresa['domicilio_fiscal'] ?? '');

    // Validamos que exista el ID de la empresa
    if (empty($id_empresa)) {

        echo json_encode([
            "success" => false,
            "mensaje" => "No se recibió el ID de la empresa."
        ]);

        return;
    }

    // Validamos que el nombre no esté vacío
    if ($nombre_empresa === '') {

        echo json_encode([
            "success" => false,
            "mensaje" => "El nombre de la empresa no puede estar vacío."
        ]);

        return;
    }

    // Preparamos la consulta para actualizar la empresa
    $sql = "UPDATE empresa SET
                nombre_empresa = ?,
                rfc_empresa = ?,
                domicilio_fiscal = ?
            WHERE id_empresa = ?";

    $stmt = mysqli_prepare($conexion, $sql);

    // Verificamos que la consulta se haya preparado correctamente
    if (!$stmt) {

        echo json_encode([
            "success" => false,
            "mensaje" => "Error al preparar la actualización de la empresa."
        ]);

        return;
    }

    // Asociamos los valores a la consulta
    mysqli_stmt_bind_param(
        $stmt,
        "sssi",
        $nombre_empresa,
        $rfc_empresa,
        $domicilio_fiscal,
        $id_empresa
    );

    // Ejecutamos la actualización
    if (mysqli_stmt_execute($stmt)) {

        echo json_encode([
            "success" => true,
            "mensaje" => "La información de la empresa se actualizó correctamente."
        ]);

    } else {

        echo json_encode([
            "success" => false,
            "mensaje" => "No fue posible actualizar la información de la empresa."
        ]);
    }

    // Cerramos la consulta
    mysqli_stmt_close($stmt);
}

// ====================================================
// FUNCIÓN PARA ACTUALIZAR EL LOGO DE UNA EMPRESA
// ====================================================

function actualizarLogo(mysqli $conexion)
{
    $id_empresa = isset($_POST['id_empresa']) ? intval($_POST['id_empresa']) : 0;

    if ($id_empresa <= 0) {
        echo json_encode([
            "success" => false,
            "mensaje" => "ID de empresa no válido."
        ]);
        return;
    }

    $archivo = $_FILES['logo'] ?? $_FILES['logo_empresa'] ?? null;

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

    // Verificar existencia de la empresa y obtener el logo actual
    $sql_verificar = "SELECT id_empresa, logo_empresa, nombre_empresa FROM empresa WHERE id_empresa = ?";
    $stmt_verificar = mysqli_prepare($conexion, $sql_verificar);
    if (!$stmt_verificar) {
        echo json_encode([
            "success" => false,
            "mensaje" => "Error al verificar la información de la empresa."
        ]);
        return;
    }

    mysqli_stmt_bind_param($stmt_verificar, "i", $id_empresa);
    mysqli_stmt_execute($stmt_verificar);
    $res_verificar = mysqli_stmt_get_result($stmt_verificar);
    $empresa_actual = mysqli_fetch_assoc($res_verificar);
    mysqli_stmt_close($stmt_verificar);

    if (!$empresa_actual) {
        echo json_encode([
            "success" => false,
            "mensaje" => "La empresa no existe en la base de datos."
        ]);
        return;
    }

    try {
        // Directorio destino de los logos
        $directorio_destino = __DIR__ . '/../../public/logosEmpresas/';

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
        $nombre_archivo = 'logo_empresa_' . $id_empresa . '_' . time() . '.' . $extension_original;
        $ruta_absoluta = $directorio_destino . $nombre_archivo;

        // Mover el archivo subido
        if (!move_uploaded_file($archivo['tmp_name'], $ruta_absoluta)) {
            throw new Exception("No se pudo guardar la imagen en el servidor.");
        }

        // Actualizar el logo en la base de datos
        $sql_update = "UPDATE empresa SET logo_empresa = ? WHERE id_empresa = ?";
        $stmt_update = mysqli_prepare($conexion, $sql_update);
        if (!$stmt_update) {
            if (file_exists($ruta_absoluta)) {
                unlink($ruta_absoluta);
            }
            throw new Exception("Error al preparar la actualización del logo.");
        }

        mysqli_stmt_bind_param($stmt_update, "si", $nombre_archivo, $id_empresa);
        if (!mysqli_stmt_execute($stmt_update)) {
            mysqli_stmt_close($stmt_update);
            if (file_exists($ruta_absoluta)) {
                unlink($ruta_absoluta);
            }
            throw new Exception("Error al actualizar el logo de la empresa.");
        }
        mysqli_stmt_close($stmt_update);

        // Eliminar logo anterior si existía físicamente
        if (!empty($empresa_actual['logo_empresa'])) {
            $ruta_anterior_absoluta = $directorio_destino . $empresa_actual['logo_empresa'];
            if (file_exists($ruta_anterior_absoluta) && is_file($ruta_anterior_absoluta) && $ruta_anterior_absoluta !== $ruta_absoluta) {
                @unlink($ruta_anterior_absoluta);
            }
        }

        echo json_encode([
            "success" => true,
            "mensaje" => "Logo de la empresa actualizado correctamente.",
            "logo_empresa" => $nombre_archivo,
            "id_empresa" => $id_empresa
        ]);

    } catch (Exception $e) {
        echo json_encode([
            "success" => false,
            "mensaje" => $e->getMessage()
        ]);
    }
}

