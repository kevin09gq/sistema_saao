<?php

require_once __DIR__ . "/../../../conexion/conexion.php";
/** @var mysqli $conexion */

$accion = $_POST['accion'] ?? $_GET['accion'] ?? '';

// VALIDAR A QUE FUNCION SE VA A LLAMAR A TRAVEZ DEL CASE

switch ($accion) {

    case 'registrarInformacionPersonal':
        registrarInformacionPersonal($conexion);
        break;


    default:
        echo json_encode([
            "success" => false,
            "mensaje" => "Acción no válida."
        ]);
        break;
}

//===========================================================
// FUNCIÓN PARA REGISTRAR LA INFORMACIÓN PERSONAL DEL EMPLEADO
//===========================================================

function registrarInformacionPersonal(mysqli $conexion)
{
    // obtener los datos enviados desde javascript
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

    // normalizar campos opcionales o con llaves foráneas
    $id_empresa = ($id_empresa === '' || $id_empresa == '1000') ? null : (int)$id_empresa;
    $id_area = ($id_area === '' || $id_area == '1000') ? null : (int)$id_area;
    $id_departamento = ($id_departamento === '' || $id_departamento == '1000') ? null : (int)$id_departamento;
    $id_puestoEspecial = ($id_puestoEspecial === '' || $id_puestoEspecial == '1000') ? null : (int)$id_puestoEspecial;

    $id_biometrico = ($id_biometrico === '') ? null : $id_biometrico;
    $fecha_nacimiento = ($fecha_nacimiento === '') ? null : $fecha_nacimiento;
    $salario_semanal = ($salario_semanal === '') ? null : $salario_semanal;
    $salario_diario = ($salario_diario === '') ? null : $salario_diario;

    // normalizar campo sexo para la columna ENUM('M', 'F')
    $sexo = strtoupper(trim($sexo));
    if ($sexo === 'MASCULINO') $sexo = 'M';
    if ($sexo === 'FEMENINO') $sexo = 'F';
    $sexo = ($sexo === 'M' || $sexo === 'F') ? $sexo : null;

    // valores por defecto para campos obligatorios
    $id_rol = 2; // Rol por defecto para empleados nuevos
    $id_status = 1; // Status por defecto (activo)
    $horario_fijo = 1; // Horario fijo por defecto

    // validar campos obligatorios
    if ($nombre === '' || $ap_paterno === '' || $ap_materno === '') {
        echo json_encode([
            "success" => false,
            "mensaje" => "Faltan datos obligatorios: clave, nombre y apellidos."
        ]);
        return;
    }

    // iniciar una transacción para insertar en múltiples tablas
    mysqli_begin_transaction($conexion);

    try {
        //====================================================
        // INSERTAR EL EMPLEADO EN LA TABLA info_empleados
        //====================================================

        $sql = "INSERT INTO info_empleados (
                    id_rol,
                    id_status,
                    clave_empleado,
                    nombre,
                    ap_paterno,
                    ap_materno,
                    imss,
                    curp,
                    rfc_empleado,
                    domicilio,
                    sexo,
                    grupo_sanguineo,
                    fecha_nacimiento,
                    estado_civil,
                    telefono_empleado,
                    enfermedades_alergias,
                    biometrico,
                    id_empresa,
                    id_area,
                    id_departamento,
                    id_puestoEspecial,
                    salario_semanal,
                    salario_diario,
                    horario_fijo
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

        $stmt = mysqli_prepare($conexion, $sql);

        if (!$stmt) {
            throw new Exception("Error al preparar la inserción del empleado.");
        }

        mysqli_stmt_bind_param(
            $stmt,
            "iissssssssssssssiiiiiddi",
            $id_rol,
            $id_status,
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
            $horario_fijo
        );

        if (!mysqli_stmt_execute($stmt)) {
            mysqli_stmt_close($stmt);
            throw new Exception("Error al insertar el empleado.");
        }

        // obtener el ID del empleado insertado
        $id_empleado = mysqli_insert_id($conexion);
        mysqli_stmt_close($stmt);

        //====================================================
        // ASIGNAR EL CASILLERO AL EMPLEADO
        //====================================================

        if ($numero_casillero !== '') {
            // insertar la asignación del casillero
            $sql = "INSERT INTO empleado_casillero
                    (id_empleado, num_casillero)
                    VALUES (?, ?)";

            $stmt = mysqli_prepare($conexion, $sql);

            if (!$stmt) {
                throw new Exception("Error al preparar la asignación del casillero.");
            }

            mysqli_stmt_bind_param(
                $stmt,
                "is",
                $id_empleado,
                $numero_casillero
            );

            if (!mysqli_stmt_execute($stmt)) {
                mysqli_stmt_close($stmt);
                throw new Exception("Error al asignar el casillero.");
            }

            mysqli_stmt_close($stmt);
        }

        //====================================================
        // CONFIRMAR TODOS LOS CAMBIOS
        //====================================================

        mysqli_commit($conexion);

        // devolver respuesta exitosa con el ID del empleado
        echo json_encode([
            "success" => true,
            "mensaje" => "Empleado registrado correctamente.",
            "id_empleado" => $id_empleado
        ]);

    } catch (Exception $e) {
        // cancelar todos los cambios si ocurrió un error
        mysqli_rollback($conexion);

        // devolver el error
        echo json_encode([
            "success" => false,
            "mensaje" => $e->getMessage()
        ]);
    }
}
