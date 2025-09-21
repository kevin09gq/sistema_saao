<?php
// Al inicio del archivo, después de los includes
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);

// Forzar el header JSON desde el inicio
header('Content-Type: application/json; charset=utf-8');

include("../../config/config.php");
include("../../conexion/conexion.php");

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // =============================
        // RECIBIR DATOS DEL FORMULARIO
        // =============================
        $clave_empleado = $_POST['clave_empleado'] ?? null;
        $nombre = $_POST['nombre'] ?? null;
        $ap_paterno = $_POST['ap_paterno'] ?? null;
        $ap_materno = $_POST['ap_materno'] ?? null;
        $sexo = $_POST['sexo'] ?? null;
        $domicilio = $_POST['domicilio'] ?? null;
        $imss = $_POST['imss'] ?? null;
        $curp = $_POST['curp'] ?? null;
        $grupo_sanguineo = $_POST['grupo_sanguineo'] ?? null;
        $enfermedades_alergias = $_POST['enfermedades_alergias'] ?? null;
        $fecha_ingreso = $_POST['fecha_ingreso'] ?? null;
        $id_departamento = $_POST['id_departamento'] ?? null;
        $num_casillero = $_POST['num_casillero'] ?? null;

        // Nuevos campos opcionales
        $fecha_nacimiento = $_POST['fecha_nacimiento'] ?? null;
        $id_area = $_POST['id_area'] ?? null;
        $id_puestoEspecial = $_POST['id_puestoEspecial'] ?? null;
        $id_empresa = $_POST['id_empresa'] ?? null;

        // Campos de salario
        $salario_diario = $_POST['salario_diario'] ?? null;
        $salario_mensual = $_POST['salario_mensual'] ?? null;

        // Contacto de emergencia
        $emergencia_nombre = $_POST['emergencia_nombre'] ?? null;
        $emergencia_ap_paterno = $_POST['emergencia_ap_paterno'] ?? null;
        $emergencia_ap_materno = $_POST['emergencia_ap_materno'] ?? null;
        $emergencia_parentesco = $_POST['emergencia_parentesco'] ?? null;
        $emergencia_telefono = $_POST['emergencia_telefono'] ?? null;
        $emergencia_domicilio = $_POST['emergencia_domicilio'] ?? null;

        // =============================
        // FORMATEAR FECHAS
        // =============================
        $fecha_ingreso = !empty($fecha_ingreso) ? date('Y-m-d', strtotime($fecha_ingreso)) : null;
        $fecha_nacimiento = !empty($fecha_nacimiento) ? date('Y-m-d', strtotime($fecha_nacimiento)) : null;

        // =============================
        // VALIDAR CAMPOS OBLIGATORIOS
        // =============================
        if (empty($clave_empleado) || empty($nombre) || empty($ap_paterno) || empty($sexo)) {
            $respuesta = array(
                "success" => false,
                "title" => "ADVERTENCIA",
                "text" => "Existen campos obligatorios vacíos.",
                "type" => "warning",
                "icon" => $rutaRaiz . "/plugins/toasts/icons/icon_warning.png",
                "timeout" => 3000,
            );
            echo json_encode($respuesta);
            exit();
        }

        // =============================
        // VERIFICAR CONEXIÓN A BD
        // =============================
        if (!$conexion) {
            throw new Exception("Error de conexión a la base de datos");
        }

        // =============================
        // VERIFICAR CLAVE EXISTENTE
        // =============================
        $sql = $conexion->prepare("SELECT id_empleado FROM info_empleados WHERE clave_empleado = ?");
        if (!$sql) {
            throw new Exception("Error al preparar consulta de verificación: " . $conexion->error);
        }
        
        $sql->bind_param("s", $clave_empleado);
        $sql->execute();
        $resultado = $sql->get_result();
        
        if ($resultado->num_rows > 0) {
            $respuesta = array(
                "success" => false,
                "title" => "ADVERTENCIA",
                "text" => "La clave de empleado ya existe.",
                "type" => "warning",
                "icon" => $rutaRaiz . "/plugins/toasts/icons/icon_warning.png",
                "timeout" => 3000,
            );
            echo json_encode($respuesta);
            exit();
        }
        $sql->close();

        // =============================
        // 🆕 VALIDAR NÚMERO DE CASILLERO
        // =============================
        if (!empty($num_casillero)) {
            // Verificar si el casillero existe
            $sqlCasillero = $conexion->prepare("SELECT num_casillero, id_empleado FROM casilleros WHERE num_casillero = ?");
            if (!$sqlCasillero) {
                throw new Exception("Error al preparar consulta de casillero: " . $conexion->error);
            }
            
            $sqlCasillero->bind_param("s", $num_casillero);
            $sqlCasillero->execute();
            $resultadoCasillero = $sqlCasillero->get_result();
            
            if ($resultadoCasillero->num_rows === 0) {
                // El casillero no existe
                $respuesta = array(
                    "success" => false,
                    "title" => "ADVERTENCIA",
                    "text" => "El número de casillero '{$num_casillero}' no existe.",
                    "type" => "warning",
                    "icon" => $rutaRaiz . "/plugins/toasts/icons/icon_warning.png",
                    "timeout" => 3000,
                );
                echo json_encode($respuesta);
                exit();
            } else {
                // El casillero existe, verificar si está ocupado
                $rowCasillero = $resultadoCasillero->fetch_assoc();
                if (!empty($rowCasillero['id_empleado'])) {
                    // El casillero está ocupado por otro empleado
                    $respuesta = array(
                        "success" => false,
                        "title" => "ADVERTENCIA",
                        "text" => "El casillero '{$num_casillero}' ya está ocupado por otro empleado.",
                        "type" => "warning",
                        "icon" => $rutaRaiz . "/plugins/toasts/icons/icon_warning.png",
                        "timeout" => 3000,
                    );
                    echo json_encode($respuesta);
                    exit();
                }
            }
            $sqlCasillero->close();
        }

        // =============================
        // CONVERTIR CAMPOS VACÍOS A NULL
        // =============================
        $id_departamento = !empty($id_departamento) ? (int)$id_departamento : null;
        $id_area = !empty($id_area) ? (int)$id_area : null;
        $id_puestoEspecial = !empty($id_puestoEspecial) ? (int)$id_puestoEspecial : null;
        $id_empresa = !empty($id_empresa) ? (int)$id_empresa : null;

        // Convertir salarios a decimal o null
        $salario_diario = !empty($salario_diario) ? (float)$salario_diario : null;
        $salario_mensual = !empty($salario_mensual) ? (float)$salario_mensual : null;

        // =============================
        // INSERTAR EMPLEADO
        // =============================
        $sql = $conexion->prepare(
            "INSERT INTO info_empleados (
                id_rol, id_status, nombre, ap_paterno, ap_materno, domicilio,
                imss, curp, sexo, enfermedades_alergias, grupo_sanguineo,
                fecha_ingreso, fecha_nacimiento, id_departamento, 
                id_area, id_puestoEspecial, id_empresa, clave_empleado, salario_semanal, salario_mensual
            ) VALUES (2, 1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
        );

        if (!$sql) {
            throw new Exception("Error al preparar consulta de inserción: " . $conexion->error);
        }

        $sql->bind_param(
            "ssssssssssssiiisdd", // 19 parámetros
            $nombre,
            $ap_paterno,
            $ap_materno,
            $domicilio,
            $imss,
            $curp,
            $sexo,
            $enfermedades_alergias,
            $grupo_sanguineo,
            $fecha_ingreso,
            $fecha_nacimiento,
            $id_departamento,
            $id_area,
            $id_puestoEspecial,
            $id_empresa,
            $clave_empleado,
            $salario_diario,
            $salario_mensual
        );

        if (!$sql->execute()) {
            throw new Exception("Error al registrar empleado: " . $sql->error);
        }

        $id_empleado = $conexion->insert_id;
        $sql->close();

        // =============================
        // 🆕 ASIGNAR CASILLERO AL EMPLEADO
        // =============================
        if (!empty($num_casillero)) {
            $sqlAsignarCasillero = $conexion->prepare("UPDATE casilleros SET id_empleado = ? WHERE num_casillero = ?");
            if (!$sqlAsignarCasillero) {
                throw new Exception("Error al preparar consulta de asignación de casillero: " . $conexion->error);
            }
            
            $sqlAsignarCasillero->bind_param("is", $id_empleado, $num_casillero);
            if (!$sqlAsignarCasillero->execute()) {
                throw new Exception("Error al asignar casillero: " . $sqlAsignarCasillero->error);
            }
            $sqlAsignarCasillero->close();
        }

        // =============================
        // INSERTAR CONTACTO DE EMERGENCIA (si se proporcionó)
        // =============================
        if (!empty($emergencia_nombre) && !empty($emergencia_ap_paterno) && !empty($emergencia_ap_materno)) {
            // Verificar si ya existe el contacto
            $sql = $conexion->prepare(
                "SELECT id_contacto FROM contacto_emergencia WHERE nombre = ? AND ap_paterno = ? AND ap_materno = ?"
            );
            $sql->bind_param("sss", $emergencia_nombre, $emergencia_ap_paterno, $emergencia_ap_materno);
            $sql->execute();
            $resultado = $sql->get_result();
            
            if ($resultado->num_rows > 0) {
                $row = $resultado->fetch_assoc();
                $id_contacto = $row['id_contacto'];
            } else {
                // Insertar nuevo contacto
                $sqlContacto = $conexion->prepare(
                    "INSERT INTO contacto_emergencia (nombre, ap_paterno, ap_materno, telefono, domicilio)
                    VALUES (?, ?, ?, ?, ?)"
                );
                $sqlContacto->bind_param(
                    "sssss",
                    $emergencia_nombre,
                    $emergencia_ap_paterno,
                    $emergencia_ap_materno,
                    $emergencia_telefono,
                    $emergencia_domicilio
                );
                
                if (!$sqlContacto->execute()) {
                    throw new Exception("Error al registrar contacto de emergencia: " . $sqlContacto->error);
                }
                $id_contacto = $conexion->insert_id;
                $sqlContacto->close();
            }
            $sql->close();

            // Insertar relación empleado-contacto
            $parentesco = !empty($emergencia_parentesco) ? $emergencia_parentesco : null;
            $sqlRel = $conexion->prepare(
                "INSERT INTO empleado_contacto (id_empleado, id_contacto, parentesco) VALUES (?, ?, ?)"
            );
            $sqlRel->bind_param("iis", $id_empleado, $id_contacto, $parentesco);
            
            if (!$sqlRel->execute()) {
                throw new Exception("Error al registrar relación empleado-contacto: " . $sqlRel->error);
            }
            $sqlRel->close();
        }

        // =============================
        // RESPUESTA EXITOSA
        // =============================
        $mensajeExito = "Empleado registrado correctamente.";
        if (!empty($num_casillero)) {
            $mensajeExito .= " Casillero '{$num_casillero}' asignado exitosamente.";
        }

        $respuesta = array(
            "success" => true,
            "title" => "ÉXITO",
            "text" => $mensajeExito,
            "type" => "success",
            "icon" => $rutaRaiz . "/plugins/toasts/icons/icon_success.png",
            "timeout" => 3000,
        );
        
        echo json_encode($respuesta);

    } catch (Exception $e) {
        // =============================
        // MANEJO DE ERRORES
        // =============================
        $respuesta = array(
            "success" => false,
            "title" => "ERROR",
            "text" => "Error en el servidor: " . $e->getMessage(),
            "type" => "error",
            "icon" => $rutaRaiz . "/plugins/toasts/icons/icon_error.png",
            "timeout" => 5000,
        );
        
        echo json_encode($respuesta);
    }
} else {
    // =============================
    // MÉTODO NO PERMITIDO
    // =============================
    $respuesta = array(
        "success" => false,
        "title" => "ERROR",
        "text" => "Método no permitido.",
        "type" => "error",
        "icon" => $rutaRaiz . "/plugins/toasts/icons/icon_error.png",
        "timeout" => 3000,
    );
    
    echo json_encode($respuesta);
}
?>