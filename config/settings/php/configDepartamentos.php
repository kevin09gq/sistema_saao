<?php
include("../../../conexion/conexion.php");

// Verificar si la conexión a la base de datos es válida
if (!$conexion) {
    die("Error de conexión: " . mysqli_connect_error());
}
if (isset($_GET['accion']) || isset($_POST['accion'])) {
    $accion = $_GET['accion'] ?? $_POST['accion'];

    switch ($accion) {

        // DEPARTAMENTOS
        case 'registrarDepartamento':
            registrarDepartamento();
            break;
        case 'eliminarDepartamento':
            eliminarDepartamento();
            break;
        case 'actualizarDepartamento':
            actualizarDepartamento();
            break;




        case 'registrarAreaDepartamento':
            registrarAreaDepartamento();
            break;
        case 'eliminarAreasDepartamentos':
            eliminarAreasDepartamentos();
            break;

        default:
            echo "Acción no reconocida";
    }
} else {
    echo "No se especificó ninguna acción";
}

// ======================
// FUNCION PARA RESPONDER
// ======================
function respuesta(int $code, string $titulo, string $mensaje, string $icono, array $data)
{
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode([
        "titulo"  => $titulo,
        "mensaje" => $mensaje,
        "icono"   => $icono,
        "data"    => $data
    ], JSON_UNESCAPED_UNICODE);
}


function registrarDepartamento()
{
    global $conexion;

    if (isset($_POST['nombre_departamento'])) {
        $nombreDepartamento = trim($_POST['nombre_departamento']);

        // Verificar que el nombre no esté vacío
        if (empty($nombreDepartamento)) {
            echo "0"; // El nombre está vacío
            return;
        }

        // Escapar caracteres especiales
        $nombreDepartamento = mysqli_real_escape_string($conexion, $nombreDepartamento);

        // Verificar si el departamento ya existe
        $checkSql = "SELECT COUNT(*) as count FROM departamentos WHERE nombre_departamento = '$nombreDepartamento'";
        $result = mysqli_query($conexion, $checkSql);
        $row = mysqli_fetch_assoc($result);

        if ($row['count'] > 0) {
            echo "3"; // Departamento ya existe
            return;
        }

        // Preparar la consulta para insertar el nuevo departamento
        $sql = $conexion->prepare("INSERT INTO departamentos (nombre_departamento) VALUES (?)");

        if (!$sql) {
            echo "Error en la preparación: " . $conexion->error;
            return;
        }

        $sql->bind_param("s", $nombreDepartamento);

        // Ejecutar la consulta
        if ($sql->execute()) {
            echo "1"; // Éxito
        } else {
            echo "2"; // Error al ejecutar
        }

        $sql->close();
    } else {
        echo "2"; // No se recibió el nombre del departamento
    }
}

function actualizarDepartamento()
{
    global $conexion;

    if (isset($_POST['id_departamento']) && isset($_POST['nombre_departamento'])) {
        $idDepartamento = (int) $_POST['id_departamento'];
        $nombreDepartamento = trim($_POST['nombre_departamento']);

        // Verificar que el nombre no esté vacío
        if (empty($nombreDepartamento)) {
            echo "0"; // El nombre está vacío
            return;
        }

        // Escapar caracteres especiales
        $nombreDepartamento = mysqli_real_escape_string($conexion, $nombreDepartamento);

        // Verificar si ya existe otro departamento con el mismo nombre (excepto el actual)
        $checkSql = "SELECT COUNT(*) as count FROM departamentos WHERE nombre_departamento = '$nombreDepartamento' AND id_departamento != $idDepartamento";
        $result = mysqli_query($conexion, $checkSql);
        $row = mysqli_fetch_assoc($result);

        if ($row['count'] > 0) {
            echo "3"; // Ya existe otro departamento con ese nombre
            return;
        }

        // Preparar la consulta para actualizar el departamento
        $sql = $conexion->prepare("UPDATE departamentos SET nombre_departamento = ? WHERE id_departamento = ?");

        if (!$sql) {
            echo "Error en la preparación: " . $conexion->error;
            return;
        }

        $sql->bind_param("si", $nombreDepartamento, $idDepartamento);

        // Ejecutar la consulta
        if ($sql->execute()) {
            echo "1"; // Éxito
        } else {
            echo "2"; // Error al ejecutar
        }

        $sql->close();
    } else {
        echo "2"; // No se recibieron todos los datos necesarios
    }
}

function eliminarDepartamento()
{
    global $conexion;

    if (isset($_POST['id_departamento'])) {
        $idDepartamento = (int) $_POST['id_departamento'];

        // Iniciar transacción para asegurar que todas las operaciones se completen o ninguna
        $conexion->begin_transaction();

        try {
            // Primero actualizar info_empleados para establecer id_departamento como NULL
            $updateSql = "UPDATE info_empleados SET id_departamento = NULL WHERE id_departamento = ?";
            $updateStmt = $conexion->prepare($updateSql);

            if (!$updateStmt) {
                throw new Exception("Error al preparar la actualización de info_empleados: " . $conexion->error);
            }

            $updateStmt->bind_param("i", $idDepartamento);
            $updateStmt->execute();
            $updateStmt->close();

            // Luego eliminar relaciones en departamentos_puestos
            $deleteSql = "DELETE FROM departamentos_puestos WHERE id_departamento = ?";
            $deleteStmt = $conexion->prepare($deleteSql);

            if (!$deleteStmt) {
                throw new Exception("Error al preparar la eliminación de departamentos_puestos: " . $conexion->error);
            }

            $deleteStmt->bind_param("i", $idDepartamento);
            $deleteStmt->execute();
            $deleteStmt->close();

            // Finalmente eliminar el departamento
            $deleteSql = "DELETE FROM departamentos WHERE id_departamento = ?";
            $deleteStmt = $conexion->prepare($deleteSql);

            if (!$deleteStmt) {
                throw new Exception("Error al preparar la eliminación del departamento: " . $conexion->error);
            }

            $deleteStmt->bind_param("i", $idDepartamento);
            $deleteResult = $deleteStmt->execute();
            $deleteStmt->close();

            if ($deleteResult) {
                $conexion->commit();
                echo "1"; // Éxito
            } else {
                $conexion->rollback();
                echo "2"; // Error al eliminar
            }
        } catch (Exception $e) {
            $conexion->rollback();
            echo "Error: " . $e->getMessage();
        }
    } else {
        echo "2"; // No se recibió el ID del departamento
    }
}




// Función para registrar la asignación de un departamento a un área
function registrarAreaDepartamento()
{
    global $conexion;

    if (isset($_POST['id_area']) && isset($_POST['id_departamento'])) {

        // Limpiar espacios
        $idArea = trim($_POST['id_area']);
        $idDepartamento = trim($_POST['id_departamento']);

        // Validar que no estén vacíos
        if (empty($idArea) || empty($idDepartamento)) {
            respuesta(400, "Datos incompletos", "El ID del área y el ID del departamento son requeridos.", "error", []);
            return;
        }

        // Verificar si ya existe la relación
        $checkSql = "SELECT COUNT(*) as count 
                     FROM areas_departamentos 
                     WHERE id_area = ? AND id_departamento = ?";

        $checkStmt = $conexion->prepare($checkSql);

        if (!$checkStmt) {
            respuesta(500, "Error de servidor", "Error en la preparación: " . $conexion->error, "error", []);
            return;
        }

        $checkStmt->bind_param("ii", $idArea, $idDepartamento);
        $checkStmt->execute();
        $result = $checkStmt->get_result();
        $row = $result->fetch_assoc();
        $checkStmt->close();

        if ($row['count'] > 0) {
            respuesta(400, "Relación existente", "La relación entre el área y el departamento ya existe.", "error", []);
            return;
        }

        /**
         * Tabla intermedia entre áreas y departamentos
         */

        // Insertar relación
        $sql = $conexion->prepare(
            "INSERT INTO areas_departamentos (id_area, id_departamento) VALUES (?, ?)"
        );

        if (!$sql) {
            respuesta(500, "Error de servidor", "Error en la preparación: " . $conexion->error, "error", []);
            return;
        }

        $sql->bind_param("ii", $idArea, $idDepartamento);

        if ($sql->execute()) {
            respuesta(200, "Relación registrada", "La relación entre el área y el departamento se ha registrado correctamente.", "success", []);
        } else {
            respuesta(500, "Error de servidor", "Error al ejecutar la consulta: " . $conexion->error, "error", []);
        }

        $sql->close();

    } else {
        respuesta(400, "Datos incompletos", "No se recibieron los datos necesarios.", "error", []);
    }
}

function eliminarAreasDepartamentos()
{
    global $conexion;

    if (isset($_POST['id_area']) && isset($_POST['id_departamento'])) {

        $idArea = (int) $_POST['id_area'];
        $idDepartamento = (int) $_POST['id_departamento'];

        // Validar que no esté vacío
        if (empty($idArea) || empty($idDepartamento)) {
            respuesta(400, "Datos incompletos", "El ID del área y el ID del departamento son requeridos.", "error", []);
            return;
        }

        // Preparar DELETE
        $sql = $conexion->prepare(
            "DELETE FROM areas_departamentos WHERE id_area = ? AND id_departamento = ?"
        );

        if (!$sql) {
            respuesta(500, "Error del servidor", "Error en la preparación: " . $conexion->error, "error", []);
            return;
        }

        $sql->bind_param("ii", $idArea, $idDepartamento);

        // Ejecutar
        if ($sql->execute()) {

            if ($sql->affected_rows > 0) {
                respuesta(200, "Relación eliminada", "El departamento ha sido desasignado de esta área.", "success", []);
            } else {
                respuesta(404, "Relación no encontrada", "No se encontró la relación entre el departamento y el área.", "warning", []);
            }
        } else {
            respuesta(500, "Error del servidor", "Error al ejecutar la consulta: " . $conexion->error, "error", []);
        }

        $sql->close();
    } else {
        respuesta(400, "Datos incompletos", "El ID del área y el ID del departamento son requeridos.", "error", []);
    }
}