<?php
include("../../../conexion/conexion.php");

// Verificar si la conexión a la base de datos es válida
if (!$conexion) {
    die("Error de conexión: " . mysqli_connect_error());
}
if (isset($_GET['accion']) || isset($_POST['accion'])) {
    $accion = $_GET['accion'] ?? $_POST['accion'];

    switch ($accion) {
        // FESTIVIDADES
        case 'registrarFestividad':
            registrarFestividad();
            break;
        case 'obtenerInfoFestividad':
            obtenerInfoFestividad();
            break;
        case 'eliminarFestividad':
            eliminarFestividad();
            break;
        case 'actualizarFestividad':
            actualizarFestividad();
            break;
        default:
            echo "Acción no reconocida";
    }
} else {
    echo "No se especificó ninguna acción";
}

// ================================
// Funciones para las festividades
// ================================

function registrarFestividad()
{
    global $conexion;

    if (isset($_POST['nombre_festividad']) and isset($_POST['fecha_festividad']) and isset($_POST['tipo_festividad'])) {

        // Eliminar espacios en blanco al principio y al final
        $nombre_festividad = trim($_POST['nombre_festividad']);
        $fecha_festividad = trim($_POST['fecha_festividad']);
        $tipo_festividad = trim($_POST['tipo_festividad']);
        $observacion = trim($_POST['observacion']) ?? '';

        // Verificar que el nombre no esté vacío después de eliminar espacios
        if (empty($nombre_festividad) or empty($fecha_festividad) or empty($tipo_festividad)) {
            echo "0"; // El nombre está vacío
            return;
        }

        // Escapar caracteres especiales para prevenir SQL injection
        $nombre_festividad = mysqli_real_escape_string($conexion, $nombre_festividad);
        $fecha_festividad = mysqli_real_escape_string($conexion, $fecha_festividad);
        $tipo_festividad    = mysqli_real_escape_string($conexion, $tipo_festividad);
        $observacion    = mysqli_real_escape_string($conexion, $observacion);

        // Verificar si el departamento ya existe
        $checkSql = "SELECT COUNT(*) as count FROM festividades WHERE nombre = '$nombre_festividad' and fecha = '$fecha_festividad'";
        $result = mysqli_query($conexion, $checkSql);
        $row = mysqli_fetch_assoc($result);

        if ($row['count'] > 0) {
            echo "3"; // Festividad ya registrada
            return;
        }

        // Preparar la consulta para insertar el nuevo departamento
        $sql = $conexion->prepare("INSERT INTO festividades (nombre, fecha, tipo, observacion) VALUES (?, ?, ?, ?)");

        if (!$sql) {
            echo "Error en la preparación: " . $conexion->error;
            return;
        }

        $sql->bind_param("ssss", $nombre_festividad, $fecha_festividad, $tipo_festividad, $observacion);

        // Ejecutar la consulta y verificar si fue exitosa
        if ($sql->execute()) {
            echo "1"; // Éxito
        } else {
            echo "2"; // Error al ejecutar
        }

        // Cerrar la declaración
        $sql->close();
    } else {
        echo "2"; // No se recibió el turno, ni hora de inicio ni fin
    }
}

function obtenerInfoFestividad()
{
    global $conexion;

    if (isset($_POST['id_festividad'])) {
        $id = (int)$_POST['id_festividad'];

        // Preparar la consulta para obtener la información del área
        $sql = "SELECT * FROM festividades WHERE id_festividad = ?";
        $stmt = $conexion->prepare($sql);

        if (!$stmt) {
            echo json_encode(['error' => true, 'message' => 'Error en la preparación: ' . $conexion->error]);
            return;
        }

        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            // Devolver los datos del turno
            echo json_encode($result->fetch_assoc());
        } else {
            // Si no se encuentra el turno
            echo json_encode(['error' => true, 'message' => 'Turno no encontrado']);
        }

        $stmt->close();
    } else {
        echo json_encode(['error' => true, 'message' => 'No se recibió el ID del turno']);
    }
}

function eliminarFestividad()
{
    global $conexion;

    if (isset($_POST['id_festividad'])) {
        $id = (int)$_POST['id_festividad'];

        // Iniciar transacción para asegurar que ambas operaciones se completen o ninguna
        $conexion->begin_transaction();

        try {

            // Ahora eliminamos el departamento
            $deleteSql = "DELETE FROM festividades WHERE id_festividad = ?";
            $deleteStmt = $conexion->prepare($deleteSql);

            if (!$deleteStmt) {
                throw new Exception("Error al preparar la eliminación: " . $conexion->error);
            }

            $deleteStmt->bind_param("i", $id);
            $deleteResult = $deleteStmt->execute();
            $deleteStmt->close();

            if ($deleteResult) {
                // Confirmar la transacción
                $conexion->commit();
                echo "1"; // Éxito
            } else {
                // Revertir la transacción
                $conexion->rollback();
                echo "2"; // Error al eliminar
            }
        } catch (Exception $e) {
            // Revertir la transacción en caso de error
            $conexion->rollback();
            echo "Error: " . $e->getMessage();
        }
    } else {
        echo "2"; // No se recibió el ID del departamento
    }
}

function actualizarFestividad()
{
    global $conexion;

    if (isset($_POST['festividad_id']) and isset($_POST['nombre_festividad']) and isset($_POST['fecha_festividad']) and isset($_POST['tipo_festividad'])) {
        $id = (int)$_POST['festividad_id'];
        $nombre_festividad = trim($_POST['nombre_festividad']);
        $fecha_festividad = trim($_POST['fecha_festividad']);
        $tipo_festividad = trim($_POST['tipo_festividad']);
        $observacion = trim($_POST['observacion']) ?? '';

        // Verificar que el nombre no esté vacío
        if (empty($nombre_festividad) or empty($fecha_festividad) or empty($tipo_festividad)) {
            echo "0"; // El nombre está vacío
            return;
        }

        // Escapar caracteres especiales para prevenir SQL injection
        $nombre_festividad = mysqli_real_escape_string($conexion, $nombre_festividad);
        $fecha_festividad = mysqli_real_escape_string($conexion, $fecha_festividad);
        $tipo_festividad    = mysqli_real_escape_string($conexion, $tipo_festividad);

        // Verificar si ya existe otro turno con el mismo turno y horas
        $checkSql = "SELECT COUNT(*) as count FROM festividades WHERE nombre = '$nombre_festividad' AND fecha = '$fecha_festividad' AND id_festividad != $id";
        $result = mysqli_query($conexion, $checkSql);
        $row = mysqli_fetch_assoc($result);

        if ($row['count'] > 0) {
            echo "3"; // Ya existe un turno con ese dato
            return;
        }

        // Preparar la consulta para actualizar el departamento
        $sql = $conexion->prepare("UPDATE festividades SET nombre = ?, fecha = ?, tipo = ?, observacion = ? WHERE id_festividad = ?");

        if (!$sql) {
            echo "Error en la preparación: " . $conexion->error;
            return;
        }

        $sql->bind_param("ssssi", $nombre_festividad, $fecha_festividad, $tipo_festividad, $observacion, $id);

        // Ejecutar la consulta y verificar si fue exitosa
        if ($sql->execute()) {
            echo "1"; // Éxito
        } else {
            echo "2"; // Error al ejecutar
        }

        // Cerrar la declaración
        $sql->close();
    } else {
        echo "5"; // No se recibieron todos los datos necesarios
    }
}
