<?php

require_once __DIR__ . "/../../../conexion/conexion.php";
/** @var mysqli $conexion */

$accion = $_POST['accion'] ?? $_GET['accion'] ?? '';

// VALIDAR A QUE FUNCION SE VA A LLAMAR A TRAVEZ DEL CASE

switch ($accion) {

    case 'obtenerInformacionPersonal':
        obtenerInformacionPersonal($conexion);
        break;

    case 'validarClave':
        validarClave($conexion);
        break;
    
    case 'validarNombre':
        validarNombre($conexion);
        break;

    case 'validarCasillero':
        validarCasillero($conexion);
        break;

    case 'validarBiometrico':
        validarBiometrico($conexion);
        break;

    case 'actualizarEmpleado':
        actualizarEmpleado($conexion);
        break;

    case 'actualizarFoto':
        actualizarFoto($conexion);
        break;

    case 'actualizarStatusNss':
        actualizarStatusNss($conexion);
        break;

    default:
        echo json_encode([
            "success" => false,
            "mensaje" => "Acción no válida."
        ]);
        break;
}


//===========================================================
// FUNCIÓN PARA OBTENER LA INFORMACIÓN PERSONAL DEL EMPLEADO
//===========================================================

function obtenerInformacionPersonal(mysqli $conexion)
{
    $id_empleado = $_POST['id_empleado'] ?? '';

    if (empty($id_empleado)) {
        echo json_encode([
            "success" => false,
            "mensaje" => "No se recibió el id del empleado."
        ]);
        return;
    }

    $sql = "SELECT
                e.id_empleado,
                e.clave_empleado AS clave,
                e.nombre,
                e.ap_paterno,
                e.ap_materno,
                e.imss,
                e.curp,
                e.rfc_empleado AS rfc,
                e.domicilio,
                e.sexo,
                e.grupo_sanguineo,
                e.fecha_nacimiento,
                e.estado_civil,
                e.telefono_empleado AS telefono,
                e.enfermedades_alergias,
                e.biometrico AS id_biometrico,
                e.salario_semanal,
                e.salario_diario,

                ec.num_casillero AS numero_casillero,

                emp.id_empresa,
                emp.nombre_empresa AS empresa,

                a.id_area,
                a.nombre_area AS area,

                d.id_departamento,
                d.nombre_departamento AS departamento,

                pe.id_puestoEspecial,
                pe.nombre_puesto AS puesto

            FROM info_empleados e

            LEFT JOIN empleado_casillero ec
                ON ec.id_empleado = e.id_empleado

            LEFT JOIN empresa emp
                ON emp.id_empresa = e.id_empresa

            LEFT JOIN areas a
                ON a.id_area = e.id_area

            LEFT JOIN departamentos d
                ON d.id_departamento = e.id_departamento

            LEFT JOIN puestos_especiales pe
                ON pe.id_puestoEspecial = e.id_puestoEspecial

            WHERE e.id_empleado = ?

            LIMIT 1";

    $stmt = mysqli_prepare($conexion, $sql);

    if (!$stmt) {
        echo json_encode([
            "success" => false,
            "mensaje" => "Error al preparar la consulta."
        ]);
        return;
    }

    mysqli_stmt_bind_param($stmt, "i", $id_empleado);

    if (!mysqli_stmt_execute($stmt)) {
        echo json_encode([
            "success" => false,
            "mensaje" => "Error al obtener la información del empleado."
        ]);
        mysqli_stmt_close($stmt);
        return;
    }

    $resultado = mysqli_stmt_get_result($stmt);
    $empleado = mysqli_fetch_assoc($resultado);

    mysqli_stmt_close($stmt);

    if (!$empleado) {
        echo json_encode([
            "success" => false,
            "mensaje" => "No se encontró el empleado."
        ]);
        return;
    }

    echo json_encode([
        "success" => true,
        "empleado" => $empleado
    ]);
}

//================================================================
// FUNCIÓN PARA VALIDAR SI LA CLAVE DEL EMPLEADO 
// YA EXISTE EN LA MISMA EMPRESA, EXCLUYENDO EL EMPLEADO ACTUAL
//================================================================

function validarClave(mysqli $conexion)
{
    $clave = $_POST['clave'] ?? '';
    $id_empresa = $_POST['id_empresa'] ?? '';
    $id_empleado = $_POST['id_empleado'] ?? '';

    // validar que lleguen los datos necesarios (id_empleado es opcional para registro nuevo)
    if ($clave === '' || $id_empresa === '') {

        echo json_encode([
            "success" => false,
            "mensaje" => "Faltan datos para validar la clave."
        ]);

        return;
    }

    // construir la consulta base
    $sql = "SELECT id_empleado
            FROM info_empleados
            WHERE clave_empleado = ?
            AND id_empresa = ?";

    // agregar exclusión del empleado actual solo si se proporciona id_empleado
    $parametros = "ss";
    $valores = [$clave, $id_empresa];

    if ($id_empleado !== '' && $id_empleado !== null) {
        $sql .= " AND id_empleado != ?";
        $parametros .= "i";
        $valores[] = $id_empleado;
    }

    $sql .= " LIMIT 1";

    $stmt = mysqli_prepare($conexion, $sql);

    if (!$stmt) {

        echo json_encode([
            "success" => false,
            "mensaje" => "Error al preparar la consulta."
        ]);

        return;
    }

    // enviar los parámetros dinámicamente
    mysqli_stmt_bind_param($stmt, $parametros, ...$valores);

    // ejecutar consulta
    mysqli_stmt_execute($stmt);

    $resultado = mysqli_stmt_get_result($stmt);

    // verificar si existe otro empleado con esa clave
    $existe = mysqli_num_rows($resultado) > 0;

    mysqli_stmt_close($stmt);

    echo json_encode([
        "success" => true,
        "existe" => $existe
    ]);
}


//================================================================
// FUNCIÓN PARA VALIDAR SI EL NOMBRE DEL EMPLEADO YA EXISTE EN LA  
// MISMA EMPRESA, EXCLUYENDO EL EMPLEADO ACTUAL
//================================================================

function validarNombre(mysqli $conexion)
{
    $nombre = $_POST['nombre'] ?? '';
    $ap_paterno = $_POST['ap_paterno'] ?? '';
    $ap_materno = $_POST['ap_materno'] ?? '';
    $id_empleado = $_POST['id_empleado'] ?? '';

    // validar que lleguen los datos necesarios
    if ($nombre === '' || $ap_paterno === '' || $ap_materno === '') {

        echo json_encode([
            "success" => false,
            "mensaje" => "Faltan datos para validar el nombre."
        ]);

        return;
    }

    // construir la consulta base
    $sql = "SELECT id_empleado
            FROM info_empleados
            WHERE nombre = ?
            AND ap_paterno = ?
            AND ap_materno = ?";

    // agregar exclusión del empleado actual solo si se proporciona id_empleado
    $parametros = "sss";
    $valores = [$nombre, $ap_paterno, $ap_materno];

    if ($id_empleado !== '' && $id_empleado !== null) {
        $sql .= " AND id_empleado != ?";
        $parametros .= "i";
        $valores[] = $id_empleado;
    }

    $sql .= " LIMIT 1";

    $stmt = mysqli_prepare($conexion, $sql);

    if (!$stmt) {

        echo json_encode([
            "success" => false,
            "mensaje" => "Error al preparar la consulta."
        ]);

        return;
    }

    // enviar los parámetros dinámicamente
    mysqli_stmt_bind_param($stmt, $parametros, ...$valores);

    mysqli_stmt_execute($stmt);

    $resultado = mysqli_stmt_get_result($stmt);

    // verificar si existe otro empleado con esos datos
    $existe = mysqli_num_rows($resultado) > 0;

    mysqli_stmt_close($stmt);

    echo json_encode([
        "success" => true,
        "existe" => $existe
    ]);
}

//====================================================================
// FUNCIÓN PARA VALIDAR EL CASILLERO DEL EMPLEADO
// VERIFICANDO SI YA HAY 2 EMPLEADOS ASIGNADOS AL MISMO CASILLERO
//====================================================================

function validarCasillero(mysqli $conexion)
{
    // obtener los datos enviados desde javascript
    $numero_casillero = $_POST['numero_casillero'] ?? '';
    $id_empleado = $_POST['id_empleado'] ?? '';

    // validar que se haya recibido el casillero
    if ($numero_casillero === '') {

        echo json_encode([
            "success" => false,
            "mensaje" => "No se recibió el número de casillero."
        ]);

        return;
    }

    // construir la consulta base
    $sql = "SELECT COUNT(*) AS total
            FROM empleado_casillero
            WHERE num_casillero = ?";

    // agregar exclusión del empleado actual solo si se proporciona id_empleado
    $parametros = "s";
    $valores = [$numero_casillero];

    if ($id_empleado !== '' && $id_empleado !== null) {
        $sql .= " AND id_empleado != ?";
        $parametros .= "i";
        $valores[] = $id_empleado;
    }

    // preparar la consulta
    $stmt = mysqli_prepare($conexion, $sql);

    // validar que la consulta se haya preparado correctamente
    if (!$stmt) {

        echo json_encode([
            "success" => false,
            "mensaje" => "Error al preparar la consulta."
        ]);

        return;
    }

    // enviar los parámetros dinámicamente
    mysqli_stmt_bind_param($stmt, $parametros, ...$valores);

    // ejecutar la consulta
    mysqli_stmt_execute($stmt);

    // obtener el resultado
    $resultado = mysqli_stmt_get_result($stmt);

    // obtener la cantidad de empleados
    $datos = mysqli_fetch_assoc($resultado);

    // cerrar la consulta
    mysqli_stmt_close($stmt);

    // determinar si el casillero ya está lleno
    $lleno = $datos['total'] >= 2;

    // devolver el resultado
    echo json_encode([
        "success" => true,
        "lleno" => $lleno,
        "total" => (int) $datos['total']
    ]);
}


//=====================================================================
// FUNCIÓN PARA VALIDAR SI EL BIOMÉTRICO DEL EMPLEADO YA EXISTE EN LA  
// MISMA ÁREA, EXCLUYENDO EL EMPLEADO ACTUAL
//=====================================================================

function validarBiometrico(mysqli $conexion)
{
    // obtener los datos enviados desde javascript
    $id_biometrico = $_POST['id_biometrico'] ?? '';
    $id_area = $_POST['id_area'] ?? '';
    $id_empleado = $_POST['id_empleado'] ?? '';

    // validar que se haya recibido el biometrico
    if ($id_biometrico === '') {

        echo json_encode([
            "success" => false,
            "mensaje" => "No se recibió el biométrico."
        ]);

        return;
    }

    // validar que se haya recibido el area
    if ($id_area === '') {

        echo json_encode([
            "success" => false,
            "mensaje" => "No se recibió el área."
        ]);

        return;
    }

    // construir la consulta base
    $sql = "SELECT id_empleado
            FROM info_empleados
            WHERE biometrico = ?
            AND id_area = ?";

    // agregar exclusión del empleado actual solo si se proporciona id_empleado
    $parametros = "si";
    $valores = [$id_biometrico, $id_area];

    if ($id_empleado !== '' && $id_empleado !== null) {
        $sql .= " AND id_empleado != ?";
        $parametros .= "i";
        $valores[] = $id_empleado;
    }

    $sql .= " LIMIT 1";

    // preparar la consulta
    $stmt = mysqli_prepare($conexion, $sql);

    // validar que la consulta se haya preparado correctamente
    if (!$stmt) {

        echo json_encode([
            "success" => false,
            "mensaje" => "Error al preparar la consulta."
        ]);

        return;
    }

    // enviar los parametros dinámicamente
    mysqli_stmt_bind_param($stmt, $parametros, ...$valores);

    // ejecutar la consulta
    mysqli_stmt_execute($stmt);

    // obtener el resultado
    $resultado = mysqli_stmt_get_result($stmt);

    // verificar si existe otro empleado con ese biometrico
    $existe = mysqli_num_rows($resultado) > 0;

    // cerrar la consulta
    mysqli_stmt_close($stmt);

    // devolver el resultado
    echo json_encode([
        "success" => true,
        "existe" => $existe
    ]);
}

//====================================================
// actualizar la informacion del empleado
//====================================================

function actualizarEmpleado(mysqli $conexion)
{
    // obtener los datos enviados desde javascript
    $id_empleado = $_POST['id_empleado'] ?? '';

    // datos personales
    $clave = $_POST['clave'] ?? '';
    $nombre = $_POST['nombre'] ?? '';
    $ap_paterno = $_POST['ap_paterno'] ?? '';
    $ap_materno = $_POST['ap_materno'] ?? '';
    $imss = $_POST['imss'] ?? '';
    $curp = $_POST['curp'] ?? '';
    $rfc = $_POST['rfc'] ?? '';
    $domicilio = $_POST['domicilio'] ?? '';
    $sexo = $_POST['sexo'] ?? '';
    $grupo_sanguineo = $_POST['grupo_sanguineo'] ?? '';
    $fecha_nacimiento = $_POST['fecha_nacimiento'] ?? '';
    $estado_civil = $_POST['estado_civil'] ?? '';

    // datos de contacto
    $telefono = $_POST['telefono'] ?? '';
    $enfermedades_alergias = $_POST['enfermedades_alergias'] ?? '';

    // datos laborales
    $numero_casillero = $_POST['numero_casillero'] ?? '';
    $id_biometrico = $_POST['id_biometrico'] ?? '';
    $id_empresa = $_POST['id_empresa'] ?? '';
    $id_area = $_POST['id_area'] ?? '';
    $id_departamento = $_POST['id_departamento'] ?? '';
    $id_puestoEspecial = $_POST['id_puestoEspecial'] ?? '';

    // datos salariales
    $salario_semanal = $_POST['salario_semanal'] ?? '';
    $salario_diario = $_POST['salario_diario'] ?? '';

    // normalizar campos opcionales o con llaves foráneas (evitar enviar '1000' o vacío)
    $id_empresa = ($id_empresa === '' || $id_empresa == '1000') ? null : (int)$id_empresa;
    $id_area = ($id_area === '' || $id_area == '1000') ? null : (int)$id_area;
    $id_departamento = ($id_departamento === '' || $id_departamento == '1000') ? null : (int)$id_departamento;
    $id_puestoEspecial = ($id_puestoEspecial === '' || $id_puestoEspecial == '1000') ? null : (int)$id_puestoEspecial;

    $id_biometrico = ($id_biometrico === '') ? null : $id_biometrico;
    $fecha_nacimiento = ($fecha_nacimiento === '') ? null : $fecha_nacimiento;
    $salario_semanal = ($salario_semanal === '') ? null : $salario_semanal;
    $salario_diario = ($salario_diario === '') ? null : $salario_diario;

    // validar que se haya recibido el empleado
    if ($id_empleado === '') {

        echo json_encode([
            "success" => false,
            "mensaje" => "No se recibio el id del empleado."
        ]);

        return;
    }

    // iniciar una transaccion para actualizar todas las tablas
    mysqli_begin_transaction($conexion);

    try {

        //====================================================
        // actualizar los datos principales del empleado
        //====================================================

        $sql = "UPDATE info_empleados
                SET clave_empleado = ?,
                    nombre = ?,
                    ap_paterno = ?,
                    ap_materno = ?,
                    imss = ?,
                    curp = ?,
                    rfc_empleado = ?,
                    domicilio = ?,
                    sexo = ?,
                    grupo_sanguineo = ?,
                    fecha_nacimiento = ?,
                    estado_civil = ?,
                    telefono_empleado = ?,
                    enfermedades_alergias = ?,
                    biometrico = ?,
                    id_empresa = ?,
                    id_area = ?,
                    id_departamento = ?,
                    id_puestoEspecial = ?,
                    salario_semanal = ?,
                    salario_diario = ?
                WHERE id_empleado = ?";

        // preparar la consulta
        $stmt = mysqli_prepare($conexion, $sql);

        // validar que la consulta se haya preparado correctamente
        if (!$stmt) {
            throw new Exception(
                "Error al preparar la actualizacion del empleado."
            );
        }

        // enviar los parametros a la consulta
        mysqli_stmt_bind_param(
            $stmt,
            "ssssssssssssssiiiiiddi",
            $clave,
            $nombre,
            $ap_paterno,
            $ap_materno,
            $imss,
            $curp,
            $rfc,
            $domicilio,
            $sexo,
            $grupo_sanguineo,
            $fecha_nacimiento,
            $estado_civil,
            $telefono,
            $enfermedades_alergias,
            $id_biometrico,
            $id_empresa,
            $id_area,
            $id_departamento,
            $id_puestoEspecial,
            $salario_semanal,
            $salario_diario,
            $id_empleado
        );

        // ejecutar la actualizacion
        if (!mysqli_stmt_execute($stmt)) {

            mysqli_stmt_close($stmt);

            throw new Exception(
                "Error al actualizar los datos del empleado."
            );
        }

        // cerrar la consulta
        mysqli_stmt_close($stmt);


        //====================================================
        // actualizar el casillero del empleado
        //====================================================

        // eliminar la asignacion anterior del casillero
        $sql = "DELETE FROM empleado_casillero
                WHERE id_empleado = ?";

        // preparar la consulta
        $stmt = mysqli_prepare($conexion, $sql);

        // validar la consulta
        if (!$stmt) {
            throw new Exception(
                "Error al preparar la actualizacion del casillero."
            );
        }

        // enviar el id del empleado
        mysqli_stmt_bind_param(
            $stmt,
            "i",
            $id_empleado
        );

        // ejecutar la eliminacion
        if (!mysqli_stmt_execute($stmt)) {

            mysqli_stmt_close($stmt);

            throw new Exception(
                "Error al eliminar el casillero anterior."
            );
        }

        // cerrar la consulta
        mysqli_stmt_close($stmt);


        //====================================================
        // asignar el nuevo casillero
        //====================================================

        // verificar que se haya seleccionado un casillero
        if ($numero_casillero !== '') {

            // insertar la nueva asignacion
            $sql = "INSERT INTO empleado_casillero
                    (
                        id_empleado,
                        num_casillero
                    )
                    VALUES (?, ?)";

            // preparar la consulta
            $stmt = mysqli_prepare($conexion, $sql);

            // validar la consulta
            if (!$stmt) {
                throw new Exception(
                    "Error al preparar la asignacion del casillero."
                );
            }

            // enviar los parametros
            mysqli_stmt_bind_param(
                $stmt,
                "is",
                $id_empleado,
                $numero_casillero
            );

            // ejecutar la insercion
            if (!mysqli_stmt_execute($stmt)) {

                mysqli_stmt_close($stmt);

                throw new Exception(
                    "Error al asignar el nuevo casillero."
                );
            }

            // cerrar la consulta
            mysqli_stmt_close($stmt);
        }


        //====================================================
        // confirmar todos los cambios
        //====================================================

        mysqli_commit($conexion);

        // devolver respuesta exitosa
        echo json_encode([
            "success" => true,
            "mensaje" => "Empleado actualizado correctamente."
        ]);

    } catch (Exception $e) {

        // cancelar todos los cambios si ocurrio un error
        mysqli_rollback($conexion);

        // devolver el error
        echo json_encode([
            "success" => false,
            "mensaje" => $e->getMessage()
        ]);
    }
}


//===========================================================
// FUNCIÓN PARA ACTUALIZAR LA FOTO DE PERFIL DEL EMPLEADO
//===========================================================

function actualizarFoto(mysqli $conexion)
{
    $id_empleado = isset($_POST['id_empleado']) ? intval($_POST['id_empleado']) : 0;

    if ($id_empleado <= 0) {
        echo json_encode([
            "success" => false,
            "mensaje" => "ID de empleado no válido."
        ]);
        return;
    }

    if (!isset($_FILES['foto']) || $_FILES['foto']['error'] !== UPLOAD_ERR_OK) {
        echo json_encode([
            "success" => false,
            "mensaje" => "No se recibió ninguna imagen o ocurrió un error al subirla."
        ]);
        return;
    }

    $archivo = $_FILES['foto'];

    // Validar tipo de archivo
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

    // Validar existencia del empleado
    $sql_verificar = "SELECT id_empleado, ruta_foto FROM info_empleados WHERE id_empleado = ?";
    $stmt_verificar = mysqli_prepare($conexion, $sql_verificar);
    if (!$stmt_verificar) {
        echo json_encode([
            "success" => false,
            "mensaje" => "Error al preparar la verificación del empleado."
        ]);
        return;
    }

    mysqli_stmt_bind_param($stmt_verificar, "i", $id_empleado);
    mysqli_stmt_execute($stmt_verificar);
    $res_verificar = mysqli_stmt_get_result($stmt_verificar);
    $empleado_actual = mysqli_fetch_assoc($res_verificar);
    mysqli_stmt_close($stmt_verificar);

    if (!$empleado_actual) {
        echo json_encode([
            "success" => false,
            "mensaje" => "El empleado no existe en la base de datos."
        ]);
        return;
    }

    try {
        // Carpeta destino absoluta
        $directorio_destino = __DIR__ . '/../../../gafetes/fotos_empleados/';

        if (!file_exists($directorio_destino)) {
            mkdir($directorio_destino, 0755, true);
        }

        // Determinar extensión adecuada
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

        $nombre_archivo = 'empleado_' . $id_empleado . '_' . time() . '.' . $extension_original;
        $ruta_absoluta = $directorio_destino . $nombre_archivo;
        $ruta_relativa_bd = 'fotos_empleados/' . $nombre_archivo;

        // Mover el archivo subido
        if (!move_uploaded_file($archivo['tmp_name'], $ruta_absoluta)) {
            throw new Exception("No se pudo guardar la imagen en el servidor.");
        }

        // Actualizar la ruta en la base de datos
        $sql_update = "UPDATE info_empleados SET ruta_foto = ? WHERE id_empleado = ?";
        $stmt_update = mysqli_prepare($conexion, $sql_update);
        if (!$stmt_update) {
            if (file_exists($ruta_absoluta)) {
                unlink($ruta_absoluta);
            }
            throw new Exception("Error al preparar la actualización en la base de datos.");
        }

        mysqli_stmt_bind_param($stmt_update, "si", $ruta_relativa_bd, $id_empleado);
        if (!mysqli_stmt_execute($stmt_update)) {
            mysqli_stmt_close($stmt_update);
            if (file_exists($ruta_absoluta)) {
                unlink($ruta_absoluta);
            }
            throw new Exception("Error al actualizar la foto de perfil del empleado.");
        }
        mysqli_stmt_close($stmt_update);

        // Eliminar foto anterior si existía físicamente
        if (!empty($empleado_actual['ruta_foto'])) {
            $ruta_anterior_absoluta = __DIR__ . '/../../../gafetes/' . $empleado_actual['ruta_foto'];
            if (file_exists($ruta_anterior_absoluta) && is_file($ruta_anterior_absoluta) && $ruta_anterior_absoluta !== $ruta_absoluta) {
                @unlink($ruta_anterior_absoluta);
            }
        }

        echo json_encode([
            "success" => true,
            "mensaje" => "Foto de perfil actualizada correctamente.",
            "ruta_foto" => $ruta_relativa_bd,
            "id_empleado" => $id_empleado
        ]);

    } catch (Exception $e) {
        echo json_encode([
            "success" => false,
            "mensaje" => $e->getMessage()
        ]);
    }
}


//===========================================================
// FUNCIÓN PARA ACTUALIZAR EL STATUS NSS DEL EMPLEADO
//===========================================================

function actualizarStatusNss(mysqli $conexion)
{
    $id_empleado = isset($_POST['id_empleado']) ? intval($_POST['id_empleado']) : 0;
    $status_nss = isset($_POST['status_nss']) ? intval($_POST['status_nss']) : 0;

    // Normalizar a 0 o 1
    $status_nss = ($status_nss === 1) ? 1 : 0;

    if ($id_empleado <= 0) {
        echo json_encode([
            "success" => false,
            "mensaje" => "ID de empleado no válido."
        ]);
        return;
    }

    $sql = "UPDATE info_empleados SET status_nss = ? WHERE id_empleado = ?";
    $stmt = mysqli_prepare($conexion, $sql);

    if (!$stmt) {
        echo json_encode([
            "success" => false,
            "mensaje" => "Error al preparar la consulta de actualización."
        ]);
        return;
    }

    mysqli_stmt_bind_param($stmt, "ii", $status_nss, $id_empleado);

    if (!mysqli_stmt_execute($stmt)) {
        mysqli_stmt_close($stmt);
        echo json_encode([
            "success" => false,
            "mensaje" => "Error al actualizar el estatus de NSS en la base de datos."
        ]);
        return;
    }

    mysqli_stmt_close($stmt);

    $mensaje = ($status_nss === 1) 
        ? "El Seguro Social (NSS) ha sido activado." 
        : "El Seguro Social (NSS) ha sido desactivado.";

    echo json_encode([
        "success" => true,
        "mensaje" => $mensaje,
        "id_empleado" => $id_empleado,
        "status_nss" => $status_nss
    ]);
}
