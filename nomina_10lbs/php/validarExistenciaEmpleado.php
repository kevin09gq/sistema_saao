<?php
require_once '../../conexion/conexion.php';

// Evitar que warnings/avisos rompan el JSON de respuesta
ini_set('display_errors', 0);
error_reporting(0);

// Forzar cabecera JSON
header('Content-Type: application/json; charset=UTF-8');


switch ($_SERVER['REQUEST_METHOD']) {
    case 'POST':
        // Verificar que se enviaron las claves
        if (!isset($_POST['claves']) || !is_array($_POST['claves'])) {
            echo json_encode([
                'error' => 'No se recibieron claves de empleados',
                'existentes' => []
            ]);
            exit;
        }

        // Verificar el case
        if (!isset($_POST['case'])) {
            echo json_encode([
                'error' => 'Case no válido',
                'existentes' => []
            ]);
            exit;
        }

        if ($_POST['case'] === 'validarExistenciaTrabajador') {
            validarExistenciaTrabajador();
        } else if ($_POST['case'] === 'validarExistenciaTrabajadorBD') {
            validarExistenciaTrabajadorBD();
        } else if ($_POST['case'] === 'validarEmpleadosNuevos') {
            validarEmpleadosNuevos();
        } else {
            echo json_encode([
                'error' => 'Case no válido',
                'existentes' => []
            ]);
            exit;
        }
        break;
    case 'GET':
        if (isset($_GET['case']) && $_GET['case'] === 'obtenerEmpleadosSinSeguro') {
            obtenerEmpleadosSinSeguro();
        } else if (isset($_GET['case']) && $_GET['case'] === 'validarEmpleadosSinSeguroBiometrico') {
            validarEmpleadosSinSeguroBiometrico();
        } else if (isset($_GET['case']) && $_GET['case'] === 'obtenerDepartamentosNomina') {
            obtenerDepartamentosNomina();
        } else {
            echo json_encode(['error' => 'Case no válido']);
        }
        break;
    default:
        echo json_encode(['error' => 'Método no permitido']);
        break;
}

//================================================== 
// VALICDACION 1:
// CUANDO EL USUARIO SUBE SOLO LA LISTA DE RAYA 
//=================================================

// PASO 1: VALIDA AL EMPLEADO POR CLAVE SI EXISTEN EN EL SISTEMA, EMPLEADOS CON SEGURO 

function validarExistenciaTrabajador()
{
    global $conexion;

    // Obtener las claves
    $clavesRecibidas = $_POST['claves'];
    $clavesExistentes = [];

    // Verificar conexión
    if (!$conexion) {
        echo json_encode([
            'error' => 'Error de conexión a la base de datos',
            'existentes' => []
        ]);
        return;
    }

    // Crear lista segura de claves
    $valores = [];
    foreach ($clavesRecibidas as $clave) {
        $valores[] = "'" . mysqli_real_escape_string($conexion, $clave) . "'";
    }
    $clavesString = implode(',', $valores);

    // Consultar empleados existentes + color del puesto especial
    $sql = "SELECT ie.clave_empleado, ie.nombre, ie.ap_paterno, ie.ap_materno, ie.id_departamento, ie.biometrico, ie.id_empresa, pe.color_hex AS color_puesto
            FROM info_empleados ie
            LEFT JOIN puestos_especiales pe ON pe.id_puestoEspecial = ie.id_puestoEspecial
            WHERE ie.clave_empleado IN ($clavesString) 
            AND ie.id_status = 1 
            AND ie.id_empresa = 1
            AND ie.id_area = (SELECT n.id_area FROM nombre_nominas n WHERE n.id_nomina = 2)
            AND ie.id_departamento IN (SELECT nd.id_departamento FROM nomina_departamento nd WHERE nd.id_nomina = 2)";

    $result = mysqli_query($conexion, $sql);

    // Procesar resultados
    if ($result) {
        while ($row = mysqli_fetch_assoc($result)) {
            $clavesExistentes[] = [
                'clave' => $row['clave_empleado'],
                'nombre' => $row['ap_paterno'] . ' ' . $row['ap_materno'] . ' ' . $row['nombre'],
                'id_departamento' => $row['id_departamento'],
                'id_empresa' => $row['id_empresa'],
                'color_puesto' => $row['color_puesto'],
                'biometrico' => $row['biometrico']
            ];
        }

        echo json_encode([
            'existentes' => $clavesExistentes
        ], JSON_UNESCAPED_UNICODE);
    } else {
        echo json_encode([
            'error' => 'Error en la consulta: ' . mysqli_error($conexion),
            'existentes' => []
        ]);
    }
}

// PASO 2: OBTENER EMPLEADOS DE LOS DEPARTAMENTOS QUE ESTAN RELACIONADO A LA NOMINA PILAR (SIN SEGURO) 

function obtenerEmpleadosSinSeguro()
{
    global $conexion;

    // Verificar conexión
    if (!$conexion) {
        echo json_encode([
            'error' => 'Error de conexión a la base de datos',
            'empleados' => []
        ]);
        return;
    }

    // Consultar empleados sin seguro + nombre del departamento
    $sql = "SELECT ie.clave_empleado, ie.nombre, ie.ap_paterno, ie.ap_materno, ie.id_departamento, ie.biometrico, ie.id_empresa, pe.color_hex AS color_puesto
            FROM info_empleados ie
            LEFT JOIN puestos_especiales pe ON pe.id_puestoEspecial = ie.id_puestoEspecial
            WHERE ie.id_status = 1 
            AND ie.id_empresa = 1
            AND ie.id_area = (SELECT n.id_area FROM nombre_nominas n WHERE n.id_nomina = 2)
            AND ie.id_departamento IN (SELECT nd.id_departamento FROM nomina_departamento nd WHERE nd.id_nomina = 2)
            AND ie.status_nss = 0";

    $result = mysqli_query($conexion, $sql);

    // Procesar resultados
    $empleados = [];
    if ($result) {
        while ($row = mysqli_fetch_assoc($result)) {
            $empleados[] = [
                'clave' => $row['clave_empleado'],
                'nombre' => $row['ap_paterno'] . ' ' . $row['ap_materno'] . ' ' . $row['nombre'],
                'id_empresa' => $row['id_empresa'],
                'id_departamento' => $row['id_departamento'],
                'biometrico' => $row['biometrico'],
                'color_puesto' => $row['color_puesto']
            ];
        }

        echo json_encode([
            'empleados' => $empleados
        ], JSON_UNESCAPED_UNICODE);
    } else {
        echo json_encode([
            'error' => 'Error en la consulta: ' . mysqli_error($conexion),
            'empleados' => []
        ]);
    }
}

//================================================== 
// VALICDACION 2:
// CUANDO EL USUARIO SUBE LA LISTA DE RAYA Y EL BIOMÉTRICO
//=================================================

// PASO 1: OBTENER EMPLEADOS SIN SEGURO (BIOMÉTRICO) QUE PERTENECEN AL ÁREA Y DEPARTAMENTOS DE LA NÓMINA PILAR PARA ASIGNARLES EL SEGURO SOCIAL

function validarEmpleadosSinSeguroBiometrico()
{
    global $conexion;

    // Verificar que se enviaron los biometricos
    if (!isset($_GET['biometricos']) || !is_array($_GET['biometricos'])) {
        echo json_encode([
            'error' => 'No se recibieron biometricos',
            'empleados' => []
        ]);
        return;
    }

    $biometricos = $_GET['biometricos'];

    // Verificar conexión
    if (!$conexion) {
        echo json_encode([
            'error' => 'Error de conexión a la base de datos',
            'empleados' => []
        ]);
        return;
    }

    // Crear lista segura de biometricos
    $valores = [];
    foreach ($biometricos as $bio) {
        $valores[] = mysqli_real_escape_string($conexion, $bio);
    }
    $biometricosString = implode(',', $valores);

    // Consultar empleados sin seguro que coincidan con biometricos + nombre del departamento
    $sql = "SELECT ie.clave_empleado, ie.nombre, ie.ap_paterno, ie.ap_materno, ie.id_departamento, ie.biometrico, ie.id_empresa, pe.color_hex AS color_puesto
            FROM info_empleados ie
            LEFT JOIN puestos_especiales pe ON pe.id_puestoEspecial = ie.id_puestoEspecial
            WHERE ie.id_status = 1 
            AND ie.id_empresa = 1
            AND ie.id_area = (SELECT n.id_area FROM nombre_nominas n WHERE n.id_nomina = 2)
            AND ie.id_departamento IN (SELECT nd.id_departamento FROM nomina_departamento nd WHERE nd.id_nomina = 2)
            AND ie.status_nss = 0";

    $result = mysqli_query($conexion, $sql);

    // Procesar resultados
    $empleados = [];
    if ($result) {
        while ($row = mysqli_fetch_assoc($result)) {
            $empleados[] = [
                'clave' => $row['clave_empleado'],
                'nombre' => $row['ap_paterno'] . ' ' . $row['ap_materno'] . ' ' . $row['nombre'],
                'id_empresa' => $row['id_empresa'],
                'id_departamento' => $row['id_departamento'],
                'biometrico' => $row['biometrico'],
                'color_puesto' => $row['color_puesto']
            ];
        }

        echo json_encode([
            'empleados' => $empleados
        ], JSON_UNESCAPED_UNICODE);
    } else {
        echo json_encode([
            'error' => 'Error en la consulta: ' . mysqli_error($conexion),
            'empleados' => []
        ]);
    }
}


//================================================== 
// VALICDACION 3:
// CUANDO YA EXISTE NOMINA EN LA BD
//=================================================

// PASO 1: VALIDAR SI LOS EMPLEADOS EXISTEN EN LA BD 

function validarExistenciaTrabajadorBD()
{
    global $conexion;

    // Obtener las claves
    $clavesRecibidas = $_POST['claves'];
    $clavesExistentes = [];

    // Verificar conexión
    if (!$conexion) {
        echo json_encode([
            'error' => 'Error de conexión a la base de datos',
            'existentes' => []
        ]);
        return;
    }

    // Crear lista segura de claves
    $valores = [];
    foreach ($clavesRecibidas as $clave) {
        $valores[] = "'" . mysqli_real_escape_string($conexion, $clave) . "'";
    }
    $clavesString = implode(',', $valores);

    // Consultar empleados existentes (activos y de la empresa)
    $sql = "SELECT clave_empleado FROM info_empleados WHERE clave_empleado IN ($clavesString) AND id_status = 1 AND id_empresa = 1";
    $result = mysqli_query($conexion, $sql);

    if ($result) {
        while ($row = mysqli_fetch_assoc($result)) {
            $clavesExistentes[] = [
                'clave' => $row['clave_empleado']
            ];
        }

        echo json_encode([
            'existentes' => $clavesExistentes
        ], JSON_UNESCAPED_UNICODE);
    } else {
        echo json_encode([
            'error' => 'Error en la consulta: ' . mysqli_error($conexion),
            'existentes' => []
        ]);
    }
}


// Función para validar empleados nuevos encontrados en el archivo Excel
function validarEmpleadosNuevos()
{
    global $conexion;

    // Obtener las claves
    $clavesRecibidas = $_POST['claves'];
    $clavesExistentes = [];

    // Verificar conexión
    if (!$conexion) {
        echo json_encode([
            'error' => 'Error de conexión a la base de datos',
            'existentes' => []
        ]);
        return;
    }

    // Crear lista segura de claves
    $valores = [];
    foreach ($clavesRecibidas as $clave) {
        $valores[] = "'" . mysqli_real_escape_string($conexion, $clave) . "'";
    }
    $clavesString = implode(',', $valores);

    // Consultar empleados existentes (activos y de la empresa) + color del puesto especial
    $sql = "SELECT ie.clave_empleado, ie.nombre, ie.ap_paterno, ie.ap_materno, ie.id_departamento, ie.biometrico, ie.id_empresa, pe.color_hex AS color_puesto
            FROM info_empleados ie
            LEFT JOIN puestos_especiales pe ON pe.id_puestoEspecial = ie.id_puestoEspecial
            WHERE ie.clave_empleado IN ($clavesString) 
            AND ie.id_status = 1 
            AND ie.id_empresa = 1
            AND ie.id_area = (SELECT n.id_area FROM nombre_nominas n WHERE n.id_nomina = 2)
            AND ie.id_departamento IN (SELECT nd.id_departamento FROM nomina_departamento nd WHERE nd.id_nomina = 2)";


    $result = mysqli_query($conexion, $sql);

    if ($result) {
        while ($row = mysqli_fetch_assoc($result)) {
            $clavesExistentes[] = [
                'clave' => $row['clave_empleado'],
                'id_empresa' => $row['id_empresa'],
                'nombre' => $row['ap_paterno'] . ' ' . $row['ap_materno'] . ' ' . $row['nombre'],
                'color_puesto' => $row['color_puesto'],
                'biometrico' => $row['biometrico'],
                'id_departamento' => $row['id_departamento']
            ];
        }

        echo json_encode([
            'existentes' => $clavesExistentes
        ], JSON_UNESCAPED_UNICODE);
    } else {
        echo json_encode([
            'error' => 'Error en la consulta: ' . mysqli_error($conexion),
            'existentes' => []
        ]);
    }
}


//================================================== 
// FUNCION AUXILIAR 
// OBTIENE DEPARTAMENTOS RELACIONADOS A LA NÓMINA PILAR
//=================================================

function obtenerDepartamentosNomina()
{
    global $conexion;

    // Obtener id_nomina del query string (default 4 para 10lbs)
    $idNomina = isset($_GET['id_nomina']) ? intval($_GET['id_nomina']) : 2;

    // Verificar conexión
    if (!$conexion) {
        echo json_encode([
            'error' => 'Error de conexión a la base de datos',
            'departamentos' => []
        ]);
        return;
    }

    // Consultar departamentos asociados al área de la nómina
    $sql = "SELECT d.id_departamento, d.nombre_departamento
            FROM departamentos d
            INNER JOIN nomina_departamento nd ON d.id_departamento = nd.id_departamento
            WHERE nd.id_nomina = ?
            ORDER BY d.nombre_departamento ASC";

    // Preparar la sentencia
    $stmt = mysqli_prepare($conexion, $sql);

    if (!$stmt) {
        echo json_encode([
            'error' => 'Error al preparar la consulta: ' . mysqli_error($conexion),
            'departamentos' => []
        ]);
        return;
    }

    // Vincular parámetros
    mysqli_stmt_bind_param($stmt, "i", $idNomina);

    // Ejecutar la consulta
    if (!mysqli_stmt_execute($stmt)) {
        echo json_encode([
            'error' => 'Error al ejecutar la consulta: ' . mysqli_stmt_error($stmt),
            'departamentos' => []
        ]);
        mysqli_stmt_close($stmt);
        return;
    }

    // Obtener resultados
    $result = mysqli_stmt_get_result($stmt);

    // Procesar resultados
    $departamentos = [];
    if ($result) {
        while ($row = mysqli_fetch_assoc($result)) {
            $departamentos[] = [
                'id_departamento' => intval($row['id_departamento']),
                'nombre_departamento' => $row['nombre_departamento']
            ];
        }

        echo json_encode(['departamentos' => $departamentos], JSON_UNESCAPED_UNICODE);
    } else {
        echo json_encode([
            'error' => 'Error al obtener resultados: ' . mysqli_error($conexion),
            'departamentos' => []
        ]);
    }

    mysqli_stmt_close($stmt);
}
