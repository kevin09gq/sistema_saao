<?php
include("../../../conexion/conexion.php");

// Verificar si la conexión a la base de datos es válida
if (!$conexion) {
    die("Error de conexión: " . mysqli_connect_error());
}
if (isset($_GET['accion']) || isset($_POST['accion'])) {
    $accion = $_GET['accion'] ?? $_POST['accion'];

    switch ($accion) {

        // ÁREAS
        case 'obtenerInfoArea':
            obtenerInfoArea();
            break;
        case 'obtenerImagenArea':
            obtenerImagenArea();
            break;
        case 'registrarArea':
            registrarArea();
            break;
        case 'actualizarArea':
            actualizarArea();
            break;
        case 'eliminarArea':
            eliminarArea();
            break;
        case 'eliminarImagenArea':
            eliminarImagenArea();
            break;

        default:
            echo "Acción no reconocida";
    }
} else {
    echo "No se especificó ninguna acción";
}


// Función para obtener la información completa de un área específica
function obtenerInfoArea()
{
    global $conexion;

    if (isset($_POST['id_area'])) {
        $idArea = (int)$_POST['id_area'];

        // Preparar la consulta para obtener la información del área
        $sql = "SELECT id_area, nombre_area, logo_area FROM areas WHERE id_area = ?";
        $stmt = $conexion->prepare($sql);

        if (!$stmt) {
            echo json_encode(['error' => true, 'message' => 'Error en la preparación: ' . $conexion->error]);
            return;
        }

        $stmt->bind_param("i", $idArea);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            // Devolver los datos del área
            echo json_encode($result->fetch_assoc());
        } else {
            // Si no se encuentra el área
            echo json_encode(['error' => true, 'message' => 'Área no encontrada']);
        }

        $stmt->close();
    } else {
        echo json_encode(['error' => true, 'message' => 'No se recibió el ID del área']);
    }
}

// Función para obtener solo el nombre de la imagen de un área específica
function obtenerImagenArea()
{
    global $conexion;

    if (isset($_POST['id_area'])) {
        $idArea = (int)$_POST['id_area'];

        // Preparar la consulta para obtener solo el logo_area
        $sql = "SELECT logo_area FROM areas WHERE id_area = ?";
        $stmt = $conexion->prepare($sql);

        if (!$stmt) {
            echo json_encode(['error' => true, 'message' => 'Error en la preparación: ' . $conexion->error]);
            return;
        }

        $stmt->bind_param("i", $idArea);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            // Obtener el nombre de la imagen
            $row = $result->fetch_assoc();
            echo json_encode(['logo_area' => $row['logo_area']]);
        } else {
            // Si no se encuentra el área
            echo json_encode(['error' => true, 'message' => 'Área no encontrada']);
        }

        $stmt->close();
    } else {
        echo json_encode(['error' => true, 'message' => 'No se recibió el ID del área']);
    }
}

// Función para registrar una nueva área
function registrarArea()
{
    global $conexion;

    if (isset($_POST['nombre_area'])) {
        // Eliminar espacios en blanco al principio y al final
        $nombreArea = trim($_POST['nombre_area']);

        // Verificar que el nombre no esté vacío después de eliminar espacios
        if (empty($nombreArea)) {
            echo "0"; // El nombre está vacío
            return;
        }

        // Escapar caracteres especiales para prevenir SQL injection
        $nombreArea = mysqli_real_escape_string($conexion, $nombreArea);

        // Verificar si el área ya existe
        $checkSql = "SELECT COUNT(*) as count FROM areas WHERE nombre_area = '$nombreArea'";
        $result = mysqli_query($conexion, $checkSql);
        $row = mysqli_fetch_assoc($result);

        if ($row['count'] > 0) {
            echo "3"; // Área ya existe
            return;
        }

        // Inicialmente, no hay logo
        $logoArea = null;

        // Verificar si se ha subido una imagen
        if (isset($_FILES['imagen_area']) && $_FILES['imagen_area']['error'] == 0) {
            // Directorio donde se guardarán las imágenes
            $directorio = "../../../gafetes/logos_area/";

            // Crear el directorio si no existe
            if (!file_exists($directorio)) {
                mkdir($directorio, 0777, true);
            }

            // Obtener información del archivo
            $nombreArchivo = $_FILES['imagen_area']['name'];
            $archivoTmp = $_FILES['imagen_area']['tmp_name'];
            $extension = strtolower(pathinfo($nombreArchivo, PATHINFO_EXTENSION));

            // Validar extensión
            $extensionesPermitidas = array('jpg', 'jpeg', 'png');
            if (!in_array($extension, $extensionesPermitidas)) {
                echo "4"; // Extensión no permitida
                return;
            }

            // Validar tamaño (2MB máximo)
            if ($_FILES['imagen_area']['size'] > 2 * 1024 * 1024) {
                echo "5"; // Archivo demasiado grande
                return;
            }

            // Generar nombre único para el archivo
            $logoArea = uniqid() . '.' . $extension;
            $rutaCompleta = $directorio . $logoArea;

            // Mover el archivo al directorio
            if (!move_uploaded_file($archivoTmp, $rutaCompleta)) {
                echo "6"; // Error al mover el archivo
                return;
            }
        }

        // Preparar la consulta para insertar la nueva área
        if ($logoArea) {
            $sql = $conexion->prepare("INSERT INTO areas (nombre_area, logo_area) VALUES (?, ?)");
            $sql->bind_param("ss", $nombreArea, $logoArea);
        } else {
            $sql = $conexion->prepare("INSERT INTO areas (nombre_area) VALUES (?)");
            $sql->bind_param("s", $nombreArea);
        }

        if (!$sql) {
            echo "Error en la preparación: " . $conexion->error;
            return;
        }

        // Ejecutar la consulta y verificar si fue exitosa
        if ($sql->execute()) {
            echo "1"; // Éxito
        } else {
            echo "2"; // Error al ejecutar
        }

        // Cerrar la declaración
        $sql->close();
    } else {
        echo "2"; // No se recibió el nombre del área
    }
}

// Función para actualizar un área existente
function actualizarArea()
{
    global $conexion;

    if (isset($_POST['area_id']) && isset($_POST['nombre_area'])) {
        $idArea = (int)$_POST['area_id'];
        $nombreArea = trim($_POST['nombre_area']);

        // Verificar que el nombre no esté vacío
        if (empty($nombreArea)) {
            echo "0"; // El nombre está vacío
            return;
        }

        // Escapar caracteres especiales para prevenir SQL injection
        $nombreArea = mysqli_real_escape_string($conexion, $nombreArea);

        // Verificar si ya existe otra área con el mismo nombre (excepto la actual)
        $checkSql = "SELECT COUNT(*) as count FROM areas WHERE nombre_area = '$nombreArea' AND id_area != $idArea";
        $result = mysqli_query($conexion, $checkSql);
        $row = mysqli_fetch_assoc($result);

        if ($row['count'] > 0) {
            echo "3"; // Ya existe otra área con ese nombre
            return;
        }

        // Obtener el logo actual si existe
        $logoActualSql = "SELECT logo_area FROM areas WHERE id_area = $idArea";
        $logoActualResult = mysqli_query($conexion, $logoActualSql);
        $logoActualRow = mysqli_fetch_assoc($logoActualResult);
        $logoActual = $logoActualRow['logo_area'];

        // Verificar si se ha subido una nueva imagen
        if (isset($_FILES['imagen_area']) && $_FILES['imagen_area']['error'] == 0) {
            // Directorio donde se guardarán las imágenes
            $directorio = "../../../gafetes/logos_area/";

            // Crear el directorio si no existe
            if (!file_exists($directorio)) {
                mkdir($directorio, 0777, true);
            }

            // Obtener información del archivo
            $nombreArchivo = $_FILES['imagen_area']['name'];
            $archivoTmp = $_FILES['imagen_area']['tmp_name'];
            $extension = strtolower(pathinfo($nombreArchivo, PATHINFO_EXTENSION));

            // Validar extensión
            $extensionesPermitidas = array('jpg', 'jpeg', 'png');
            if (!in_array($extension, $extensionesPermitidas)) {
                echo "4"; // Extensión no permitida
                return;
            }

            // Validar tamaño (2MB máximo)
            if ($_FILES['imagen_area']['size'] > 2 * 1024 * 1024) {
                echo "5"; // Archivo demasiado grande
                return;
            }

            // Generar nombre único para el archivo
            $logoNuevo = uniqid() . '.' . $extension;
            $rutaCompleta = $directorio . $logoNuevo;

            // Mover el archivo al directorio
            if (!move_uploaded_file($archivoTmp, $rutaCompleta)) {
                echo "6"; // Error al mover el archivo
                return;
            }

            // Eliminar el logo anterior si existe
            if ($logoActual && file_exists($directorio . $logoActual)) {
                unlink($directorio . $logoActual);
            }

            // Preparar la consulta para actualizar el área con la nueva imagen
            $sql = $conexion->prepare("UPDATE areas SET nombre_area = ?, logo_area = ? WHERE id_area = ?");
            $sql->bind_param("ssi", $nombreArea, $logoNuevo, $idArea);
        } else {
            // Actualizar solo el nombre del área
            $sql = $conexion->prepare("UPDATE areas SET nombre_area = ? WHERE id_area = ?");
            $sql->bind_param("si", $nombreArea, $idArea);
        }

        if (!$sql) {
            echo "Error en la preparación: " . $conexion->error;
            return;
        }

        // Ejecutar la consulta y verificar si fue exitosa
        if ($sql->execute()) {
            echo "1"; // Éxito
        } else {
            echo "2"; // Error al ejecutar
        }

        // Cerrar la declaración
        $sql->close();
    } else {
        echo "2"; // No se recibieron todos los datos necesarios
    }
}

// Función para eliminar un área
function eliminarArea()
{
    global $conexion;

    if (isset($_POST['id_area'])) {
        $idArea = (int)$_POST['id_area'];

        // Iniciar transacción para asegurar que ambas operaciones se completen o ninguna
        $conexion->begin_transaction();

        try {
            // Primero actualizar info_empleados para establecer id_area como NULL
            $updateSql = "UPDATE info_empleados SET id_area = NULL WHERE id_area = ?";
            $updateStmt = $conexion->prepare($updateSql);

            if (!$updateStmt) {
                throw new Exception("Error al preparar la actualización de info_empleados: " . $conexion->error);
            }

            $updateStmt->bind_param("i", $idArea);
            $updateStmt->execute();
            $updateStmt->close();

            // Luego actualizar departamentos para establecer id_area como NULL
            $updateSql = "UPDATE departamentos SET id_area = NULL WHERE id_area = ?";
            $updateStmt = $conexion->prepare($updateSql);

            if (!$updateStmt) {
                throw new Exception("Error al preparar la actualización de departamentos: " . $conexion->error);
            }

            $updateStmt->bind_param("i", $idArea);
            $updateStmt->execute();
            $updateStmt->close();

            // Finalmente eliminar registros de info_ranchos que tengan ese id_area
            $deleteSql = "DELETE FROM info_ranchos WHERE id_area = ?";
            $deleteStmt = $conexion->prepare($deleteSql);

            if (!$deleteStmt) {
                throw new Exception("Error al preparar la eliminación de info_ranchos: " . $conexion->error);
            }

            $deleteStmt->bind_param("i", $idArea);
            $deleteStmt->execute();
            $deleteStmt->close();

            // Ahora eliminamos el área
            $deleteSql = "DELETE FROM areas WHERE id_area = ?";
            $deleteStmt = $conexion->prepare($deleteSql);

            if (!$deleteStmt) {
                throw new Exception("Error al preparar la eliminación: " . $conexion->error);
            }

            $deleteStmt->bind_param("i", $idArea);
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
        echo "2"; // No se recibió el ID del área
    }
}

//  FUNCIÓN PARA ELIMINAR SOLO LA IMAGEN DE UN ÁREA
function eliminarImagenArea()
{
    global $conexion;
    if (isset($_POST['id_area'])) {
        $idArea = (int)$_POST['id_area'];
        // Obtener el nombre del archivo actual
        $sql = "SELECT logo_area FROM areas WHERE id_area = ?";
        $stmt = $conexion->prepare($sql);
        if (!$stmt) {
            echo "0";
            return;
        }
        $stmt->bind_param("i", $idArea);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            $logo = $row['logo_area'];
            if ($logo && file_exists("../../../gafetes/logos_area/" . $logo)) {
                unlink("../../../gafetes/logos_area/" . $logo);
            }
            // Actualizar la base de datos para quitar la referencia
            $update = $conexion->prepare("UPDATE areas SET logo_area = NULL WHERE id_area = ?");
            if (!$update) {
                echo "0";
                return;
            }
            $update->bind_param("i", $idArea);
            if ($update->execute()) {
                echo "1";
            } else {
                echo "0";
            }
            $update->close();
        } else {
            echo "0";
        }
        $stmt->close();
    } else {
        echo "0";
    }
}
