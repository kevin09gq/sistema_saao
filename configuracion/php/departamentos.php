<?php

require_once __DIR__ . "/../../conexion/conexion.php";
/** @var mysqli $conexion */

$accion = $_POST['accion'] ?? $_GET['accion'] ?? '';

// VALIDAR A QUE FUNCION SE VA A LLAMAR A TRAVEZ DEL CASE

switch ($accion) {

    case 'obtenerDepartamentos':
        obtenerDepartamentos($conexion);
        break;

    case 'agregarDepartamento':
        agregarDepartamento($conexion);
        break;

    case 'editarDepartamento':
        editarDepartamento($conexion);
        break;

    default:
        echo json_encode([
            "success" => false,
            "mensaje" => "Acción no válida."
        ]);
        break;
}


// ====================================================
// FUNCIÓN PARA OBTENER LOS DEPARTAMENTOS
// ====================================================

function obtenerDepartamentos(mysqli $conexion)
{
    $filtroArea = $_POST['filtroArea'] ?? '';

    // Creamos la consulta base
    $sql = "SELECT 
                d.id_departamento,
                d.nombre_departamento
            FROM departamentos d";

    // Si hay filtro por área, hacemos JOIN con la tabla de relación
    if (!empty($filtroArea)) {
        $sql .= " 
            INNER JOIN areas_departamentos ad ON d.id_departamento = ad.id_departamento
            WHERE ad.id_area = ?";
    }

    $sql .= " ORDER BY d.nombre_departamento ASC";

    // Preparamos la consulta
    $stmt = mysqli_prepare($conexion, $sql);

    if (!$stmt) {
        echo json_encode([
            "success" => false,
            "mensaje" => "Error al preparar la consulta de departamentos."
        ]);
        return;
    }

    // Si hay filtro, bindiamos el parámetro
    if (!empty($filtroArea)) {
        mysqli_stmt_bind_param($stmt, "i", $filtroArea);
    }

    // Ejecutamos la consulta
    mysqli_stmt_execute($stmt);
    $resultado = mysqli_stmt_get_result($stmt);

    // Verificamos si la consulta se ejecutó correctamente
    if (!$resultado) {
        echo json_encode([
            "success" => false,
            "mensaje" => "Error al obtener los departamentos."
        ]);
        mysqli_stmt_close($stmt);
        return;
    }

    // Creamos un arreglo vacío para almacenar los departamentos
    $departamentos = [];

    // Recorremos cada registro obtenido
    while ($departamento = mysqli_fetch_assoc($resultado)) {
        
        // Obtener las áreas asociadas a este departamento
        $areas = obtenerAreasPorDepartamento($conexion, $departamento['id_departamento']);
        
        $departamento['areas'] = $areas;
        $departamentos[] = $departamento;
    }

    // Cerramos la consulta
    mysqli_stmt_close($stmt);

    // Enviamos la respuesta en formato JSON
    echo json_encode([
        "success" => true,
        "departamentos" => $departamentos
    ]);
}

// ====================================================
// FUNCIÓN AUXILIAR PARA OBTENER ÁREAS DE UN DEPARTAMENTO
// ====================================================

function obtenerAreasPorDepartamento(mysqli $conexion, $id_departamento)
{
    $sql = "SELECT 
                a.id_area,
                a.nombre_area,
                a.colores,
                a.colores_texto
            FROM areas a
            INNER JOIN areas_departamentos ad ON a.id_area = ad.id_area
            WHERE ad.id_departamento = ?
            ORDER BY a.nombre_area ASC";

    $stmt = mysqli_prepare($conexion, $sql);
    if (!$stmt) {
        return [];
    }

    mysqli_stmt_bind_param($stmt, "i", $id_departamento);
    mysqli_stmt_execute($stmt);
    $resultado = mysqli_stmt_get_result($stmt);

    $areas = [];
    while ($area = mysqli_fetch_assoc($resultado)) {
        $areas[] = $area;
    }

    mysqli_stmt_close($stmt);
    return $areas;
}

// ====================================================
// FUNCIÓN PARA AGREGAR UN NUEVO DEPARTAMENTO
// ====================================================

function agregarDepartamento(mysqli $conexion)
{
    // Obtenemos los datos enviados
    $datosDepartamento = $_POST['datosDepartamento'] ?? [];
    
    $nombre_departamento = trim($datosDepartamento['nombre_departamento'] ?? '');
    $areas = $datosDepartamento['areas'] ?? [];

    // Validamos que el nombre no esté vacío
    if ($nombre_departamento === '') {
        echo json_encode([
            "success" => false,
            "mensaje" => "El nombre del departamento no puede estar vacío."
        ]);
        return;
    }

    // Iniciamos transacción
    mysqli_begin_transaction($conexion);

    try {
        // Insertar el departamento
        $sql = "INSERT INTO departamentos (nombre_departamento) VALUES (?)";
        $stmt = mysqli_prepare($conexion, $sql);
        
        if (!$stmt) {
            throw new Exception("Error al preparar la inserción del departamento.");
        }

        mysqli_stmt_bind_param($stmt, "s", $nombre_departamento);
        
        if (!mysqli_stmt_execute($stmt)) {
            throw new Exception("No fue posible agregar el departamento.");
        }

        // Obtener el ID del departamento insertado
        $id_departamento = mysqli_insert_id($conexion);
        mysqli_stmt_close($stmt);

        // Insertar relaciones con áreas si hay áreas seleccionadas
        if (!empty($areas) && is_array($areas)) {
            $sql_relacion = "INSERT INTO areas_departamentos (id_area, id_departamento) VALUES (?, ?)";
            $stmt_relacion = mysqli_prepare($conexion, $sql_relacion);
            
            if (!$stmt_relacion) {
                throw new Exception("Error al preparar la inserción de áreas.");
            }

            foreach ($areas as $id_area) {
                mysqli_stmt_bind_param($stmt_relacion, "ii", $id_area, $id_departamento);
                
                if (!mysqli_stmt_execute($stmt_relacion)) {
                    throw new Exception("Error al relacionar el departamento con las áreas.");
                }
            }

            mysqli_stmt_close($stmt_relacion);
        }

        // Confirmar transacción
        mysqli_commit($conexion);

        echo json_encode([
            "success" => true,
            "mensaje" => "El departamento se agregó correctamente."
        ]);

    } catch (Exception $e) {
        // Revertir transacción en caso de error
        mysqli_rollback($conexion);
        
        echo json_encode([
            "success" => false,
            "mensaje" => $e->getMessage()
        ]);
    }
}

// ====================================================
// FUNCIÓN PARA ACTUALIZAR LA INFORMACIÓN DE UN DEPARTAMENTO
// ====================================================

function editarDepartamento(mysqli $conexion)
{
    // Obtenemos los datos enviados desde AJAX
    $datosDepartamento = $_POST['datosDepartamento'] ?? [];

    $id_departamento = $datosDepartamento['id_departamento'] ?? '';
    $nombre_departamento = trim($datosDepartamento['nombre_departamento'] ?? '');
    $areas = $datosDepartamento['areas'] ?? [];

    // Validamos que exista el ID del departamento
    if (empty($id_departamento)) {
        echo json_encode([
            "success" => false,
            "mensaje" => "No se recibió el ID del departamento."
        ]);
        return;
    }

    // Validamos que el nombre no esté vacío
    if ($nombre_departamento === '') {
        echo json_encode([
            "success" => false,
            "mensaje" => "El nombre del departamento no puede estar vacío."
        ]);
        return;
    }

    // Iniciamos transacción
    mysqli_begin_transaction($conexion);

    try {
        // Actualizar el nombre del departamento
        $sql = "UPDATE departamentos SET nombre_departamento = ? WHERE id_departamento = ?";
        $stmt = mysqli_prepare($conexion, $sql);
        
        if (!$stmt) {
            throw new Exception("Error al preparar la actualización del departamento.");
        }

        mysqli_stmt_bind_param($stmt, "si", $nombre_departamento, $id_departamento);
        
        if (!mysqli_stmt_execute($stmt)) {
            throw new Exception("No fue posible actualizar el departamento.");
        }

        mysqli_stmt_close($stmt);

        // Eliminar todas las relaciones actuales del departamento
        $sql_eliminar = "DELETE FROM areas_departamentos WHERE id_departamento = ?";
        $stmt_eliminar = mysqli_prepare($conexion, $sql_eliminar);
        
        if (!$stmt_eliminar) {
            throw new Exception("Error al preparar la eliminación de áreas.");
        }

        mysqli_stmt_bind_param($stmt_eliminar, "i", $id_departamento);
        mysqli_stmt_execute($stmt_eliminar);
        mysqli_stmt_close($stmt_eliminar);

        // Insertar nuevas relaciones si hay áreas seleccionadas
        if (!empty($areas) && is_array($areas)) {
            $sql_relacion = "INSERT INTO areas_departamentos (id_area, id_departamento) VALUES (?, ?)";
            $stmt_relacion = mysqli_prepare($conexion, $sql_relacion);
            
            if (!$stmt_relacion) {
                throw new Exception("Error al preparar la inserción de áreas.");
            }

            foreach ($areas as $id_area) {
                mysqli_stmt_bind_param($stmt_relacion, "ii", $id_area, $id_departamento);
                
                if (!mysqli_stmt_execute($stmt_relacion)) {
                    throw new Exception("Error al relacionar el departamento con las áreas.");
                }
            }

            mysqli_stmt_close($stmt_relacion);
        }

        // Confirmar transacción
        mysqli_commit($conexion);

        echo json_encode([
            "success" => true,
            "mensaje" => "La información del departamento se actualizó correctamente."
        ]);

    } catch (Exception $e) {
        // Revertir transacción en caso de error
        mysqli_rollback($conexion);
        
        echo json_encode([
            "success" => false,
            "mensaje" => $e->getMessage()
        ]);
    }
}
