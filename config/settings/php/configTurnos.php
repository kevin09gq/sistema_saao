<?php
include("../../../conexion/conexion.php");

// Verificar si la conexión a la base de datos es válida
if (!$conexion) {
    die("Error de conexión: " . mysqli_connect_error());
}
if (isset($_GET['accion']) || isset($_POST['accion'])) {
    $accion = $_GET['accion'] ?? $_POST['accion'];

    switch ($accion) {
      // TURNOS
        case 'registrarTurno':
            registrarTurno();
            break;
        case 'obtenerInfoTurno':
            obtenerInfoTurno();
            break;
        case 'actualizarTurno':
            actualizarTurno();
            break;
        case 'eliminarTurno':
            eliminarTurno();
            break;


        default:
            echo "Acción no reconocida";
    }
} else {
    echo "No se especificó ninguna acción";
}

// ==========================
// FUNCIONES PARA LOS TURNOS
// ==========================

function registrarTurno()
{
    global $conexion;

    if (isset($_POST['descripcion']) && isset($_POST['max'])) {

        $descripcion = trim($_POST['descripcion']);
        $hora_inicio = isset($_POST['hora_inicio']) && $_POST['hora_inicio'] !== '' ? trim($_POST['hora_inicio']) : null;
        $hora_fin    = isset($_POST['hora_fin']) && $_POST['hora_fin'] !== '' ? trim($_POST['hora_fin']) : null;
        $max         = trim($_POST['max']);

        if (empty($descripcion) || empty($max)) {
            echo "0"; // Falta descripción o máximo
            return;
        }

        $descripcion = mysqli_real_escape_string($conexion, $descripcion);

        $checkSql = "SELECT COUNT(*) as count FROM turnos WHERE descripcion = '$descripcion'";
        $result = mysqli_query($conexion, $checkSql);
        $row = mysqli_fetch_assoc($result);

        if ($row['count'] > 0) {
            echo "3"; // Ya existe
            return;
        }

        $sql = $conexion->prepare("INSERT INTO turnos (descripcion, hora_inicio, hora_fin, max) VALUES (?, ?, ?, ?)");

        if (!$sql) {
            echo "Error en la preparación: " . $conexion->error;
            return;
        }

        // bind_param no maneja bien null directamente, así que usamos variables y setamos NULL con bind_param
        $sql->bind_param("ssss", $descripcion, $hora_inicio, $hora_fin, $max);

        // Si hora_inicio o hora_fin son null, ajustamos con bind_param usando send_null
        if ($hora_inicio === null) {
            $sql->bind_param("ssss", $descripcion, $hora_inicio, $hora_fin, $max);
            $sql->send_long_data(1, null); // posición 1 = hora_inicio
        }
        if ($hora_fin === null) {
            $sql->bind_param("ssss", $descripcion, $hora_inicio, $hora_fin, $max);
            $sql->send_long_data(2, null); // posición 2 = hora_fin
        }

        if ($sql->execute()) {
            echo "1"; // Éxito
        } else {
            echo "2"; // Error al ejecutar
        }

        $sql->close();
    } else {
        echo "2"; // No se recibió descripción o max
    }
}


function obtenerInfoTurno()
{
    global $conexion;

    if (isset($_POST['id_turno'])) {
        $idTurno = (int)$_POST['id_turno'];

        // Preparar la consulta para obtener la información del área
        $sql = "SELECT * FROM turnos WHERE id_turno = ?";
        $stmt = $conexion->prepare($sql);

        if (!$stmt) {
            echo json_encode(['error' => true, 'message' => 'Error en la preparación: ' . $conexion->error]);
            return;
        }

        $stmt->bind_param("i", $idTurno);
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

function actualizarTurno()
{
    global $conexion;

    if (isset($_POST['turno_id']) && isset($_POST['descripcion']) && isset($_POST['max'])) {
        $id_turno = (int)$_POST['turno_id'];
        $descripcion = trim($_POST['descripcion']);
        $hora_inicio = trim($_POST['hora_inicio']) ?? null;
        $hora_fin = trim($_POST['hora_fin']) ?? null;
        $max = trim($_POST['max']);

        // Verificar que el nombre no esté vacío
        if (empty($descripcion) or empty($max)) {
            echo "0"; // El nombre está vacío
            return;
        }

        // Escapar caracteres especiales para prevenir SQL injection
        $descripcion = mysqli_real_escape_string($conexion, $descripcion);
        $hora_inicio = mysqli_real_escape_string($conexion, $hora_inicio);
        $hora_fin    = mysqli_real_escape_string($conexion, $hora_fin);

        // Verificar si ya existe otro turno con el mismo turno y horas
        $checkSql = "SELECT COUNT(*) as count FROM turnos WHERE descripcion = '$descripcion' AND hora_inicio = '$hora_inicio' AND hora_fin = '$hora_fin' AND id_turno != $id_turno";
        $result = mysqli_query($conexion, $checkSql);
        $row = mysqli_fetch_assoc($result);

        if ($row['count'] > 0) {
            echo "3"; // Ya existe un turno con ese dato
            return;
        }

        // Preparar la consulta para actualizar el departamento
        $sql = $conexion->prepare("UPDATE turnos SET descripcion = ?, hora_inicio = ?, hora_fin = ? WHERE id_turno = ?");

        if (!$sql) {
            echo "Error en la preparación: " . $conexion->error;
            return;
        }

        $sql->bind_param("sssi", $descripcion, $hora_inicio, $hora_fin, $id_turno);

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

function eliminarTurno()
{
    global $conexion;

    if (isset($_POST['id_turno'])) {
        $id_turno = (int)$_POST['id_turno'];

        // Iniciar transacción para asegurar que ambas operaciones se completen o ninguna
        $conexion->begin_transaction();

        try {
            // Ahora eliminamos el departamento
            $deleteSql = "DELETE FROM turnos WHERE id_turno = ?";
            $deleteStmt = $conexion->prepare($deleteSql);

            if (!$deleteStmt) {
                throw new Exception("Error al preparar la eliminación: " . $conexion->error);
            }

            $deleteStmt->bind_param("i", $id_turno);
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
