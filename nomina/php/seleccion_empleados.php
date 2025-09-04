<?php
// Incluir archivo de conexión a la base de datos
include "../../conexion/conexion.php";

// Verificar si se recibió una acción por GET o POST
if (isset($_GET['accion']) || isset($_POST['accion'])) {
    // Obtener la acción solicitada desde GET o POST
    $accion = $_GET['accion'] ?? $_POST['accion'];

    // Switch para manejar las diferentes acciones disponibles
    switch ($accion) {
        // Caso para cargar información del departamento específico
        case 'cargarDepartamento':
            cargarDepartamento();
            break;
        
        // Caso para cargar todos los empleados del departamento 4
        case 'cargarTodosEmpleados':
            cargarTodosEmpleados();
            break;

        // Caso para cargar empleados filtrados por departamento
        case 'cargarEmpleadosPorDepa':
            if (isset($_POST['id_departamento'])) {
                // Obtener el ID del departamento desde POST
                $idDepartamento = $_POST['id_departamento'];
                // Si el ID es válido (mayor a 0), filtrar por departamento
                if ($idDepartamento > 0) {
                    cargarEmpleadosPorDepa($idDepartamento);
                } else {
                    // Si el ID no es válido, cargar todos los empleados
                    cargarTodosEmpleados();
                }
            }
            break;

        // Caso por defecto (no hace nada)
        default:
    }
}

/**
 * Función para cargar información específica del departamento con ID 4
 * Retorna los datos en formato JSON
 */
function cargarDepartamento()
{
    global $conexion;

    // Consulta SQL para obtener únicamente el departamento con ID 4
    $sql = "SELECT * FROM departamentos WHERE id_departamento = 4";
    $query = $conexion->query($sql);

    // Verificar si la consulta fue exitosa
    if (!$query) {
        die("Ocurrió un error: " . $conexion->connect_error);
    }

    // Inicializar arreglo para almacenar los resultados
    $arreglo = array();
    
    // Recorrer los resultados y estructurar los datos
    while ($row = $query->fetch_object()) {
        $arreglo[] = array(
            "id_departamento" => $row->id_departamento,
            "nombre_departamento" => $row->nombre_departamento,
        );
    }

    // Convertir el arreglo a formato JSON y enviarlo como respuesta
    $json = json_encode($arreglo, JSON_UNESCAPED_UNICODE);
    print_r($json);
}

/**
 * Función para cargar todos los empleados activos del departamento 4
 * Organiza los empleados por departamento y los retorna en formato JSON
 */
function cargarTodosEmpleados()
{
    global $conexion;
    
    // Consulta preparada para obtener empleados con información de departamento
    // Solo empleados activos (id_status = 1) del departamento 4
    $sql = $conexion->prepare("
    SELECT 
        e.id_empleado, 
        e.nombre, 
        e.ap_paterno, 
        e.ap_materno, 
        e.clave_empleado, 
        e.id_departamento,
        d.nombre_departamento
    FROM info_empleados e
    LEFT JOIN departamentos d ON e.id_departamento = d.id_departamento
    WHERE e.id_status = 1 AND e.id_departamento = 4
    ORDER BY d.nombre_departamento, e.ap_paterno 
");

    // Ejecutar la consulta y obtener resultados
    $sql->execute();
    $resultado = $sql->get_result();

    // Arreglo para organizar empleados por departamento
    $empleadosPorDepartamento = array();

    // Procesar cada registro obtenido
    while ($row = $resultado->fetch_assoc()) {
        // Construir nombre completo concatenando apellidos y nombre
        $nombreCompleto = trim($row['ap_paterno'] . ' ' . $row['ap_materno'] . ' ' . $row['nombre']);

        // Manejar casos donde el departamento pueda ser nulo o vacío
        $departamento = isset($row['nombre_departamento']) && trim($row['nombre_departamento']) !== ""
            ? trim($row['nombre_departamento'])
            : 'Sin departamento';

        // Inicializar arreglo del departamento si no existe
        if (!isset($empleadosPorDepartamento[$departamento])) {
            $empleadosPorDepartamento[$departamento] = array();
        }

        // Agregar empleado al departamento correspondiente
        $empleadosPorDepartamento[$departamento][] = array(
            'id_empleado'     => $row['id_empleado'],
            'nombre_completo' => $nombreCompleto,
            'clave_empleado'  => $row['clave_empleado'],
            'id_departamento' => $row['id_departamento']
        );
    }

    // Establecer cabeceras para respuesta JSON y enviar datos
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($empleadosPorDepartamento, JSON_UNESCAPED_UNICODE);
}

/**
 * Función para cargar empleados filtrados por un departamento específico
 * Recibe el ID del departamento como parámetro
 * @param int $idDepartamento ID del departamento a filtrar
 */
function cargarEmpleadosPorDepa($idDepartamento)
{
    global $conexion;
    
    // Consulta preparada para obtener empleados de un departamento específico
    // Solo empleados activos (id_status = 1)
    $sql = $conexion->prepare("
    SELECT 
        e.id_empleado, 
        e.nombre, 
        e.ap_paterno, 
        e.ap_materno, 
        e.clave_empleado, 
        e.id_departamento,
        d.nombre_departamento
    FROM info_empleados e
    LEFT JOIN departamentos d ON e.id_departamento = d.id_departamento
    WHERE e.id_status = 1 AND e.id_departamento = ?
    ORDER BY d.nombre_departamento, e.ap_paterno
");
    
    // Vincular parámetro y ejecutar consulta
    $sql->bind_param("i", $idDepartamento);
    $sql->execute();
    $resultado = $sql->get_result();

    // Arreglo para organizar empleados por departamento
    $empleadosPorDepartamento = array();

    // Procesar cada registro obtenido
    while ($row = $resultado->fetch_assoc()) {
        // Construir nombre completo concatenando apellidos y nombre
        $nombreCompleto = trim($row['ap_paterno'] . ' ' . $row['ap_materno'] . ' ' . $row['nombre']);

        // Manejar casos donde el departamento pueda ser nulo o vacío
        $departamento = isset($row['nombre_departamento']) && trim($row['nombre_departamento']) !== ""
            ? trim($row['nombre_departamento'])
            : 'Sin departamento';

        // Inicializar arreglo del departamento si no existe
        if (!isset($empleadosPorDepartamento[$departamento])) {
            $empleadosPorDepartamento[$departamento] = array();
        }

        // Agregar empleado al departamento correspondiente
        $empleadosPorDepartamento[$departamento][] = array(
            'id_empleado'     => $row['id_empleado'],
            'nombre_completo' => $nombreCompleto,
            'clave_empleado'  => $row['clave_empleado'],
            'id_departamento' => $row['id_departamento']
        );
    }

    // Establecer cabeceras para respuesta JSON y enviar datos
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($empleadosPorDepartamento, JSON_UNESCAPED_UNICODE);
}
