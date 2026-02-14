<?php
require_once '../../conexion/conexion.php';

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
        if (isset($_GET['case']) && $_GET['case'] === 'obtenerJornaleros') {
            obtenerJornaleros();
        } else if (isset($_GET['case']) && $_GET['case'] === 'obtenerCoordinadores') {
            obtenerCoordinadores();
        } else if (isset($_GET['case']) && $_GET['case'] === 'validarEmpleadosSinSeguroBiometrico') {
            validarEmpleadosSinSeguroBiometrico();
        } else {
            echo json_encode(['error' => 'Case no válido']);
        }
        break;
    default:
        echo json_encode(['error' => 'Método no permitido']);
        break;
}

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

    // Consultar empleados existentes
    $sql = "SELECT clave_empleado, nombre, ap_paterno, ap_materno, salario_semanal, salario_diario, id_empresa, id_departamento, id_puestoEspecial FROM info_empleados WHERE clave_empleado IN ($clavesString) AND id_status = 1 AND id_empresa = 1 ";
    $result = mysqli_query($conexion, $sql);

    // Procesar resultados
    if ($result) {
        while ($row = mysqli_fetch_assoc($result)) {
            $clavesExistentes[] = [
                'clave' => $row['clave_empleado'],
                'id_empresa' => $row['id_empresa'],
                'id_departamento' => $row['id_departamento'],
                'id_puestoEspecial' => $row['id_puestoEspecial'],
                'salario_semanal' => $row['salario_semanal'],
                'salario_diario' => $row['salario_diario'],
                'nombre' => $row['nombre'] . ' ' . $row['ap_paterno'] . ' ' . $row['ap_materno']
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

function obtenerJornaleros()
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

    // Consultar empleados sin seguro
    $sql = "SELECT clave_empleado, nombre, ap_paterno, ap_materno, id_empresa, id_departamento, id_puestoEspecial
            FROM info_empleados
            WHERE id_status = 1
            AND id_empresa = 1
            AND id_departamento = 7
            AND status_nss = 0
            ORDER BY nombre ASC";

    $result = mysqli_query($conexion, $sql);

    // Procesar resultados
    $empleados = [];
    if ($result) {
        while ($row = mysqli_fetch_assoc($result)) {
            $empleados[] = [
                'clave' => $row['clave_empleado'],
                'nombre' => $row['nombre'],
                'ap_paterno' => $row['ap_paterno'],
                'ap_materno' => $row['ap_materno'],
                'id_empresa' => $row['id_empresa'],
                'id_departamento' => $row['id_departamento'],
                'id_puestoEspecial' => $row['id_puestoEspecial']
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

function obtenerCoordinadores()
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

    // Consultar empleados sin seguro
    $sql = "SELECT  clave_empleado, nombre, ap_paterno, ap_materno, id_empresa, id_departamento, id_puestoEspecial
            FROM info_empleados
            WHERE id_status = 1
            AND id_empresa = 1
            AND id_departamento = 6
            AND status_nss = 0
            ORDER BY nombre ASC";

    $result = mysqli_query($conexion, $sql);

    // Procesar resultados
    $empleados = [];
    if ($result) {
        while ($row = mysqli_fetch_assoc($result)) {
            $empleados[] = [
                'clave' => $row['clave_empleado'],
                'nombre' => $row['nombre'],
                'ap_paterno' => $row['ap_paterno'],
                'ap_materno' => $row['ap_materno'],
                'id_empresa' => $row['id_empresa'],
                'id_departamento' => $row['id_departamento'],
                'id_puestoEspecial' => $row['id_puestoEspecial']
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

    // Consultar empleados sin seguro que coincidan con biometricos
    $sql = "SELECT clave_empleado, nombre, ap_paterno, ap_materno, id_empresa, biometrico
            FROM info_empleados
            WHERE biometrico IN ($biometricosString)
            AND id_status = 1
            AND id_empresa = 1
            AND id_departamento IN (4, 5)
            AND status_nss = 0";

    $result = mysqli_query($conexion, $sql);

    // Procesar resultados
    $empleados = [];
    if ($result) {
        while ($row = mysqli_fetch_assoc($result)) {
            $empleados[] = [
                'clave' => $row['clave_empleado'],
                'nombre' => $row['nombre'],
                'ap_paterno' => $row['ap_paterno'],
                'ap_materno' => $row['ap_materno'],
                'id_empresa' => $row['id_empresa'],
                'biometrico' => $row['biometrico']
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

    // Consultar empleados existentes (activos y de la empresa)
    $sql = "SELECT clave_empleado, nombre, ap_paterno, ap_materno, id_empresa 
            FROM info_empleados 
            WHERE clave_empleado IN ($clavesString) 
            AND id_status = 1 
            AND id_empresa = 1";

    $result = mysqli_query($conexion, $sql);

    if ($result) {
        while ($row = mysqli_fetch_assoc($result)) {
            $clavesExistentes[] = [
                'clave' => $row['clave_empleado'],
                'id_empresa' => $row['id_empresa'],
                'nombre' => $row['ap_paterno'] . ' ' . $row['ap_materno'] . ' ' . $row['nombre']
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
