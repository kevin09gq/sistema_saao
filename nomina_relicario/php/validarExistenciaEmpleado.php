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
        if (isset($_GET['case']) && $_GET['case'] === 'obtenerJornalerosCoordinadores') {
            obtenerJornalerosCoordinadores();
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

    // Consultar empleados existentes con LEFT JOIN a horarios_oficiales
    $sql = "SELECT ie.id_empleado, ie.clave_empleado, ie.nombre, ie.ap_paterno, ie.ap_materno, ie.biometrico, ie.salario_semanal, ie.salario_diario, ie.id_empresa, ie.id_departamento, ie.id_puestoEspecial, ho.horario_oficial 
            FROM info_empleados ie 
            LEFT JOIN horarios_oficiales ho ON ie.id_empleado = ho.id_empleado
            WHERE ie.clave_empleado IN ($clavesString) AND ie.id_status = 1 AND ie.id_empresa = 1";
    $result = mysqli_query($conexion, $sql);

    // Procesar resultados
    if ($result) {
        while ($row = mysqli_fetch_assoc($result)) {
            $empleado = [
                'clave' => $row['clave_empleado'],
                'id_empresa' => $row['id_empresa'],
                'id_departamento' => $row['id_departamento'],
                'id_puestoEspecial' => $row['id_puestoEspecial'],
                'salario_semanal' => $row['salario_semanal'],
                'salario_diario' => $row['salario_diario'],
                'nombre' => $row['nombre'] . ' ' . $row['ap_paterno'] . ' ' . $row['ap_materno'],
                'biometrico' => $row['biometrico']
            ];
            
            // Agregar horario_oficial solo si id_departamento es 6 y existe
            if ($row['id_departamento'] == 6 && isset($row['horario_oficial']) && $row['horario_oficial'] !== null) {
                // Decodificar el JSON string a objeto/array
                $horario = json_decode($row['horario_oficial'], true);
                $empleado['horario_oficial'] = $horario !== null ? $horario : $row['horario_oficial'];
            }
            
            $clavesExistentes[] = $empleado;
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

function obtenerJornalerosCoordinadores()
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

    // Consultar empleados sin seguro con LEFT JOIN a horarios_oficiales
    $sql = "SELECT ie.id_empleado, ie.clave_empleado, ie.nombre, ie.ap_paterno, ie.ap_materno, ie.biometrico, ie.id_empresa, ie.id_departamento, ie.id_puestoEspecial, ho.horario_oficial
            FROM info_empleados ie
            LEFT JOIN horarios_oficiales ho ON ie.id_empleado = ho.id_empleado
            WHERE ie.id_status = 1
            AND ie.id_empresa = 1
            AND ie.id_departamento IN (6,7)
            AND ie.status_nss = 0
            ORDER BY ie.nombre ASC";

    $result = mysqli_query($conexion, $sql);

    // Procesar resultados
    $empleados = [];
    if ($result) {
        while ($row = mysqli_fetch_assoc($result)) {
            $empleado = [
                'clave' => $row['clave_empleado'],
                'nombre' => $row['nombre'],
                'ap_paterno' => $row['ap_paterno'],
                'ap_materno' => $row['ap_materno'],
                'id_empresa' => $row['id_empresa'],
                'id_departamento' => $row['id_departamento'],
                'id_puestoEspecial' => $row['id_puestoEspecial'],
                'biometrico' => $row['biometrico']
            ];
            
            // Agregar horario_oficial solo si id_departamento es 6 y existe
            if ($row['id_departamento'] == 6 && isset($row['horario_oficial']) && $row['horario_oficial'] !== null) {
                // Decodificar el JSON string a objeto/array
                $horario = json_decode($row['horario_oficial'], true);
                $empleado['horario_oficial'] = $horario !== null ? $horario : $row['horario_oficial'];
            }
            
            $empleados[] = $empleado;
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

    // Consultar empleados sin seguro con LEFT JOIN a horarios_oficiales
    $sql = "SELECT ie.id_empleado, ie.clave_empleado, ie.nombre, ie.ap_paterno, ie.ap_materno, ie.biometrico, ie.id_empresa, ie.id_departamento, ie.id_puestoEspecial, ho.horario_oficial
            FROM info_empleados ie
            LEFT JOIN horarios_oficiales ho ON ie.id_empleado = ho.id_empleado
            WHERE ie.id_status = 1
            AND ie.id_empresa = 1
            AND ie.id_departamento IN (6, 7)
            AND ie.status_nss = 0
            ORDER BY ie.nombre ASC";

    $result = mysqli_query($conexion, $sql);

    // Procesar resultados
    $empleados = [];
    if ($result) {
        while ($row = mysqli_fetch_assoc($result)) {
            $empleado = [
                'clave' => $row['clave_empleado'],
                'nombre' => $row['nombre'],
                'ap_paterno' => $row['ap_paterno'],
                'ap_materno' => $row['ap_materno'],
                'id_empresa' => $row['id_empresa'],
                'id_departamento' => $row['id_departamento'],
                'id_puestoEspecial' => $row['id_puestoEspecial'],
                'biometrico' => $row['biometrico']
            ];
            
            // Agregar horario_oficial solo si id_departamento es 6 y existe
            if ($row['id_departamento'] == 6 && isset($row['horario_oficial']) && $row['horario_oficial'] !== null) {
                // Decodificar el JSON string a objeto/array
                $horario = json_decode($row['horario_oficial'], true);
                $empleado['horario_oficial'] = $horario !== null ? $horario : $row['horario_oficial'];
            }
            
            $empleados[] = $empleado;
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

    // Consultar empleados existentes (activos y de la empresa) con LEFT JOIN a horarios_oficiales
    $sql = "SELECT ie.id_empleado, ie.clave_empleado, ie.nombre, ie.ap_paterno, ie.ap_materno, ie.biometrico, ie.id_empresa, ie.id_departamento, ie.id_puestoEspecial, ho.horario_oficial
            FROM info_empleados ie
            LEFT JOIN horarios_oficiales ho ON ie.id_empleado = ho.id_empleado
            WHERE ie.clave_empleado IN ($clavesString) 
            AND ie.id_status = 1 
            AND ie.id_empresa = 1";

    $result = mysqli_query($conexion, $sql);

    if ($result) {
        while ($row = mysqli_fetch_assoc($result)) {
            $empleado = [
                'clave' => $row['clave_empleado'],
                'id_empresa' => $row['id_empresa'],
                'nombre' => $row['nombre'] . ' ' . $row['ap_paterno'] . ' ' . $row['ap_materno'],
                'biometrico' => $row['biometrico'],
                'id_departamento' => $row['id_departamento'],
                'id_puestoEspecial' => $row['id_puestoEspecial']
            ];
            
            // Agregar horario_oficial solo si id_departamento es 6 y existe
            if ($row['id_departamento'] == 6 && isset($row['horario_oficial']) && $row['horario_oficial'] !== null) {
                // Decodificar el JSON string a objeto/array
                $horario = json_decode($row['horario_oficial'], true);
                $empleado['horario_oficial'] = $horario !== null ? $horario : $row['horario_oficial'];
            }
            
            $clavesExistentes[] = $empleado;
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
