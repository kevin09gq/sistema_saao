<?php
require_once '../../conexion/conexion.php';

switch ($_SERVER['REQUEST_METHOD']) {
    case 'POST':
        // Verificar el case
        if (!isset($_POST['case'])) {
            echo json_encode([
                'error' => 'Case no válido',
                'existentes' => []
            ]);
            exit;
        }

        if ($_POST['case'] === 'validarExistenciaTrabajadorBD') {
            if (!isset($_POST['claves']) || !is_array($_POST['claves'])) {
                echo json_encode(['error' => 'No se recibieron claves de empleados', 'existentes' => []]);
                exit;
            }
            validarExistenciaTrabajadorBD();
        } else if ($_POST['case'] === 'obtenerDatosPorTipoHorario') {
            obtenerDatosPorTipoHorario();
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
        } else if (isset($_GET['case']) && $_GET['case'] === 'obtenerEmpleadosSinSeguroPalmilla') {
            obtenerEmpleadosSinSeguroPalmilla();
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
// CUANDO EL USUARIO CREAR LA NOMINA
//=================================================

// PASO 1: OBTENER EMPLEADOS DE LOS DEPARTAMENTOS QUE ESTAN RELACIONADO A LA NOMINA PALMILLA (SIN SEGURO)

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

    // Obtener empleados sin seguro que pertenecen al área y departamentos de la nómina 7
    $sql = "SELECT ie.id_empleado, ie.clave_empleado, ie.nombre, ie.ap_paterno, ie.ap_materno, ie.biometrico, ie.id_empresa, ie.id_departamento, ie.id_puestoEspecial
            FROM info_empleados ie
            WHERE ie.id_status = 1
            AND ie.id_empresa = 1
            AND ie.id_area = (SELECT n.id_area FROM nombre_nominas n WHERE n.id_nomina = 7)
            AND ie.id_departamento IN (SELECT nd.id_departamento FROM nomina_departamento nd WHERE nd.id_nomina = 7)
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

// PASO 2: OBTENER LOS DATOS DE SALARIOS Y HORARIOS DE LOS EMPLEADOS 
function obtenerDatosPorTipoHorario()
{
    global $conexion;

    if (!isset($_POST['empleados']) || !is_array($_POST['empleados'])) {
        echo json_encode([
            'error' => 'No se recibieron empleados para consultar datos',
            'datos' => []
        ]);
        return;
    }

    $empleadosRecibidos = $_POST['empleados'];
    $clavesParaConsulta = [];
    foreach ($empleadosRecibidos as $e) {
        $clavesParaConsulta[] = "'" . mysqli_real_escape_string($conexion, $e['clave']) . "'";
    }
    $clavesString = implode(',', $clavesParaConsulta);

    // Consulta para obtener el salario_diario y el horario_oficial
    $sql = "SELECT ie.clave_empleado, ie.salario_semanal, ie.salario_diario, ho.horario_oficial 
            FROM info_empleados ie 
            LEFT JOIN horarios_oficiales ho ON ie.id_empleado = ho.id_empleado 
            WHERE ie.clave_empleado IN ($clavesString)";

    $result = mysqli_query($conexion, $sql);
    $datosBD = [];

    if ($result) {
        while ($row = mysqli_fetch_assoc($result)) {
            $datosBD[$row['clave_empleado']] = [
                'salario_semanal' => $row['salario_semanal'],
                'salario_diario' => $row['salario_diario'],
                'horario_oficial' => json_decode($row['horario_oficial'], true) ?: $row['horario_oficial']
            ];
        }

        echo json_encode([
            'datos' => $datosBD
        ], JSON_UNESCAPED_UNICODE);
    } else {
        echo json_encode([
            'error' => 'Error en la consulta: ' . mysqli_error($conexion),
            'datos' => []
        ]);
    }
}


//================================================== 
// VALICDACION 2:
// CUANDO EL USUARIO OBTIENE EN LA BD LA NOMINA
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
    $sql = "SELECT clave_empleado, salario_semanal, salario_diario FROM info_empleados WHERE clave_empleado IN ($clavesString) AND id_status = 1 AND id_empresa = 1";
    $result = mysqli_query($conexion, $sql);

    if ($result) {
        while ($row = mysqli_fetch_assoc($result)) {
            $clavesExistentes[] = [
                'clave' => $row['clave_empleado'],
                'salario_semanal' => $row['salario_semanal'],
                'salario_diario' => $row['salario_diario']
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

// PASO 2: OBTENER EMPLEADOS SIN SEGURO 
function obtenerEmpleadosSinSeguroPalmilla()
{
    global $conexion;

    if (!$conexion) {
        echo json_encode(['error' => 'Error de conexión', 'empleados' => []]);
        return;
    }

    $sql = "SELECT ie.id_empleado, ie.clave_empleado, ie.nombre, ie.ap_paterno, ie.ap_materno, ie.biometrico, 
            ie.id_empresa, ie.id_departamento, ie.id_puestoEspecial, ie.salario_semanal, ie.salario_diario, ho.horario_oficial
            FROM info_empleados ie
            LEFT JOIN horarios_oficiales ho ON ie.id_empleado = ho.id_empleado
            WHERE ie.id_status = 1
            AND ie.id_empresa = 1
            AND ie.id_area = (SELECT n.id_area FROM nombre_nominas n WHERE n.id_nomina = 7)
            AND ie.id_departamento IN (SELECT nd.id_departamento FROM nomina_departamento nd WHERE nd.id_nomina = 7)
            AND ie.status_nss = 0
            ORDER BY ie.nombre ASC";

    $result = mysqli_query($conexion, $sql);
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
                'id_puestoEspecial' => $row['id_puestoEspecial'],
                'biometrico' => $row['biometrico'],
                'salario_semanal' => $row['salario_semanal'],
                'salario_diario' => $row['salario_diario'],
                'horario_oficial' => json_decode($row['horario_oficial'], true) ?: $row['horario_oficial']
            ];
        }
        echo json_encode(['empleados' => $empleados], JSON_UNESCAPED_UNICODE);
    } else {
        echo json_encode(['error' => mysqli_error($conexion), 'empleados' => []]);
    }
}



//================================================== 
// FUNCION AUXILIAR 
// OBTIENE DEPARTAMENTOS RELACIONADOS A LA NÓMINA PILAR
//=================================================

function obtenerDepartamentosNomina()
{
    global $conexion;

    // Obtener id_nomina del query string (default 5 para Pilar)
    $idNomina = isset($_GET['id_nomina']) ? intval($_GET['id_nomina']) : 7;

    // Verificar conexión
    if (!$conexion) {
        echo json_encode([
            'error' => 'Error de conexión a la base de datos',
            'departamentos' => []
        ]);
        return;
    }

    // Consultar departamentos asociados directamente a la nómina
    $sql = "SELECT d.id_departamento, d.nombre_departamento, nd.color_depto_nomina
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
                'nombre_departamento' => $row['nombre_departamento'],
                'color_depto_nomina' => $row['color_depto_nomina']
            ];
        }

        echo json_encode([
            'departamentos' => $departamentos
        ], JSON_UNESCAPED_UNICODE);
    } else {
        echo json_encode([
            'error' => 'Error en la consulta: ' . mysqli_error($conexion),
            'departamentos' => []
        ]);
    }

    mysqli_stmt_close($stmt);
}
