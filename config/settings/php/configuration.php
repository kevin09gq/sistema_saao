<?php
include("../../../conexion/conexion.php");

// Verificar si la conexión a la base de datos es válida
if (!$conexion) {
    die("Error de conexión: " . mysqli_connect_error());
}

if (isset($_GET['accion']) || isset($_POST['accion'])) {
    $accion = $_GET['accion'] ?? $_POST['accion'];

    switch ($accion) {
        case 'registrarDepartamento':
            registrarDepartamento();
            break;
        case 'eliminarDepartamento':
            eliminarDepartamento();
            break;
        case 'actualizarDepartamento':
            actualizarDepartamento();
            break;

        case 'registrarPuesto':
            registrarPuesto();
            break;
        case 'eliminarPuesto':
            eliminarPuesto();
            break;
        case 'actualizarPuesto':
            actualizarPuesto();
            break;
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
        case 'registrarEmpresa':
            registrarEmpresa();
            break;
        case 'actualizarEmpresa':
            actualizarEmpresa();
            break;
        case 'eliminarEmpresa':
            eliminarEmpresa();
            break;
        case 'obtenerInfoEmpresa':
            obtenerInfoEmpresa();
            break;
        case 'eliminarLogoEmpresa':
            eliminarLogoEmpresa();
            break;
        case 'obtenerImagenEmpresa':
            obtenerImagenEmpresa();
            break;
        case 'obtenerInfoPuesto':
            obtenerInfoPuesto();
            break;
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

function registrarDepartamento()
{
    global $conexion;

    if (isset($_POST['nombre_departamento'])) {
        // Eliminar espacios en blanco al principio y al final
        $nombreDepartamento = trim($_POST['nombre_departamento']);

        // Verificar que el nombre no esté vacío después de eliminar espacios
        if (empty($nombreDepartamento)) {
            echo "0"; // El nombre está vacío
            return;
        }

        // Escapar caracteres especiales para prevenir SQL injection
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

        // Ejecutar la consulta y verificar si fue exitosa
        if ($sql->execute()) {
            echo "1"; // Éxito
        } else {
            echo "2"; // Error al ejecutar
        }

        // Cerrar la declaración
        $sql->close();
    } else {
        echo "2"; // No se recibió el nombre del departamento
    }
}

function eliminarDepartamento()
{
    global $conexion;

    if (isset($_POST['id_departamento'])) {
        $idDepartamento = (int)$_POST['id_departamento'];

        // Iniciar transacción para asegurar que ambas operaciones se completen o ninguna
        $conexion->begin_transaction();

        try {
            // Primero actualizamos la tabla info_empleados para establecer id_departamento como NULL
            // para los empleados que pertenecen al departamento que se va a eliminar
            $updateSql = "UPDATE info_empleados SET id_departamento = NULL WHERE id_departamento = ?";
            $updateStmt = $conexion->prepare($updateSql);

            if (!$updateStmt) {
                throw new Exception("Error al preparar la actualización: " . $conexion->error);
            }

            $updateStmt->bind_param("i", $idDepartamento);
            $updateStmt->execute();
            $updateStmt->close();

            // Ahora eliminamos el departamento
            $deleteSql = "DELETE FROM departamentos WHERE id_departamento = ?";
            $deleteStmt = $conexion->prepare($deleteSql);

            if (!$deleteStmt) {
                throw new Exception("Error al preparar la eliminación: " . $conexion->error);
            }

            $deleteStmt->bind_param("i", $idDepartamento);
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

function actualizarDepartamento()
{
    global $conexion;

    if (isset($_POST['id_departamento']) && isset($_POST['nombre_departamento'])) {
        $idDepartamento = (int)$_POST['id_departamento'];
        $nombreDepartamento = trim($_POST['nombre_departamento']);

        // Verificar que el nombre no esté vacío
        if (empty($nombreDepartamento)) {
            echo "0"; // El nombre está vacío
            return;
        }

        // Escapar caracteres especiales para prevenir SQL injection
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

function registrarPuesto()
{
    global $conexion;

    if (isset($_POST['nombre_puesto'])) {
        // Eliminar espacios en blanco al principio y al final
        $nombrePuesto = trim($_POST['nombre_puesto']);
        $direccionPuesto = trim($_POST['direccion_puesto']);
        $colorHex = isset($_POST['color_hex']) ? trim($_POST['color_hex']) : null;

        // Verificar que el nombre no esté vacío después de eliminar espacios
        if (empty($nombrePuesto)) {
            echo "0"; // El nombre está vacío
            return;
        }

        // Escapar caracteres especiales para prevenir SQL injection
        $nombrePuesto = mysqli_real_escape_string($conexion, $nombrePuesto);
        $direccionPuesto = mysqli_real_escape_string($conexion, $direccionPuesto);
        if ($colorHex !== null && $colorHex !== '') {
            if (!preg_match('/^#[0-9A-Fa-f]{6}$/', $colorHex)) {
                echo "2"; // Formato inválido
                return;
            }
            $colorHex = mysqli_real_escape_string($conexion, $colorHex);
        } else {
            $colorHex = null;
        }
        if ($colorHex !== null && $colorHex !== '') {
            // Validar formato #RRGGBB
            if (!preg_match('/^#[0-9A-Fa-f]{6}$/', $colorHex)) {
                echo "2"; // Formato inválido
                return;
            }
            $colorHex = mysqli_real_escape_string($conexion, $colorHex);
        } else {
            $colorHex = null;
        }

        // Verificar si el puesto ya existe
        $checkSql = "SELECT COUNT(*) as count FROM puestos_especiales WHERE nombre_puesto = '$nombrePuesto'";
        $result = mysqli_query($conexion, $checkSql);
        $row = mysqli_fetch_assoc($result);

        if ($row['count'] > 0) {
            echo "3"; // Puesto ya existe
            return;
        }

        // Preparar la consulta para insertar el nuevo puesto
        $sql = $conexion->prepare("INSERT INTO puestos_especiales (nombre_puesto, direccion_puesto, color_hex) VALUES (?, ?, ?)");

        if (!$sql) {
            echo "Error en la preparación: " . $conexion->error;
            return;
        }

        $sql->bind_param("sss", $nombrePuesto, $direccionPuesto, $colorHex);

        // Ejecutar la consulta y verificar si fue exitosa
        if ($sql->execute()) {
            echo "1"; // Éxito
        } else {
            echo "2"; // Error al ejecutar
        }

        // Cerrar la declaración
        $sql->close();
    } else {
        echo "2"; // No se recibió el nombre del puesto
    }
}

function eliminarPuesto()
{
    global $conexion;

    if (isset($_POST['id_puesto'])) {
        $idPuesto = (int)$_POST['id_puesto'];

        // Iniciar transacción para asegurar que ambas operaciones se completen o ninguna
        $conexion->begin_transaction();

        try {
            // Primero actualizamos la tabla info_empleados para establecer id_puestoEspecial como NULL
            // para los empleados que tienen este puesto
            $updateSql = "UPDATE info_empleados SET id_puestoEspecial = NULL WHERE id_puestoEspecial = ?";
            $updateStmt = $conexion->prepare($updateSql);

            if (!$updateStmt) {
                throw new Exception("Error al preparar la actualización: " . $conexion->error);
            }

            $updateStmt->bind_param("i", $idPuesto);
            $updateStmt->execute();
            $updateStmt->close();

            // Ahora eliminamos el puesto
            $deleteSql = "DELETE FROM puestos_especiales WHERE id_puestoEspecial = ?";
            $deleteStmt = $conexion->prepare($deleteSql);

            if (!$deleteStmt) {
                throw new Exception("Error al preparar la eliminación: " . $conexion->error);
            }

            $deleteStmt->bind_param("i", $idPuesto);
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
        echo "2"; // No se recibió el ID del puesto
    }
}

function actualizarPuesto()
{
    global $conexion;

    if (isset($_POST['id_puesto']) && isset($_POST['nombre_puesto']) && isset($_POST['direccion_puesto'])) {
        $idPuesto = (int)$_POST['id_puesto'];
        $nombrePuesto = trim($_POST['nombre_puesto']);
        $direccionPuesto = trim($_POST['direccion_puesto']);
        $colorHex = isset($_POST['color_hex']) ? trim($_POST['color_hex']) : null;

        // Verificar que el nombre no esté vacío
        if (empty($nombrePuesto)) {
            echo "0"; // El nombre está vacío
            return;
        }

        // Escapar caracteres especiales para prevenir SQL injection
        $nombrePuesto = mysqli_real_escape_string($conexion, $nombrePuesto);
        $direccionPuesto = mysqli_real_escape_string($conexion, $direccionPuesto);

        // Verificar si ya existe otro puesto con el mismo nombre (excepto el actual)
        $checkSql = "SELECT COUNT(*) as count FROM puestos_especiales WHERE nombre_puesto = '$nombrePuesto' AND id_puestoEspecial != $idPuesto";
        $result = mysqli_query($conexion, $checkSql);
        $row = mysqli_fetch_assoc($result);

        if ($row['count'] > 0) {
            echo "3"; // Ya existe otro puesto con ese nombre
            return;
        }

        // Preparar la consulta para actualizar el puesto
        $sql = $conexion->prepare("UPDATE puestos_especiales SET nombre_puesto = ?, direccion_puesto = ?, color_hex = ? WHERE id_puestoEspecial = ?");

        if (!$sql) {
            echo "Error en la preparación: " . $conexion->error;
            return;
        }

        $sql->bind_param("sssi", $nombrePuesto, $direccionPuesto, $colorHex, $idPuesto);

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
            // Primero actualizamos la tabla info_empleados para establecer id_area como NULL
            $updateSql = "UPDATE info_empleados SET id_area = NULL WHERE id_area = ?";
            $updateStmt = $conexion->prepare($updateSql);

            if (!$updateStmt) {
                throw new Exception("Error al preparar la actualización: " . $conexion->error);
            }

            $updateStmt->bind_param("i", $idArea);
            $updateStmt->execute();
            $updateStmt->close();

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

// REGISTRAR EMPRESA
function registrarEmpresa()
{
    global $conexion;
    if (isset($_POST['nombre_empresa'])) {
        $nombreEmpresa = trim($_POST['nombre_empresa']);
        $rfcEmpresa = isset($_POST['rfc_empresa']) ? trim($_POST['rfc_empresa']) : null;
        $domicilioFiscal = isset($_POST['domicilio_fiscal']) ? trim($_POST['domicilio_fiscal']) : null;

        if (empty($nombreEmpresa)) {
            echo "0";
            return;
        }
        $nombreEmpresa = mysqli_real_escape_string($conexion, $nombreEmpresa);

        // Escapar los nuevos campos si tienen valor
        if ($rfcEmpresa) {
            $rfcEmpresa = mysqli_real_escape_string($conexion, $rfcEmpresa);
        }
        if ($domicilioFiscal) {
            $domicilioFiscal = mysqli_real_escape_string($conexion, $domicilioFiscal);
        }

        // Verificar si la empresa ya existe
        $checkSql = "SELECT COUNT(*) as count FROM empresa WHERE nombre_empresa = '$nombreEmpresa'";
        $result = mysqli_query($conexion, $checkSql);
        $row = mysqli_fetch_assoc($result);
        if ($row['count'] > 0) {
            echo "3";
            return;
        }

        $logoEmpresa = null;
        if (isset($_FILES['logo_empresa']) && $_FILES['logo_empresa']['error'] == 0) {
            $directorio = "../../../gafetes/logos_empresa/";
            if (!file_exists($directorio)) {
                mkdir($directorio, 0777, true);
            }
            $nombreArchivo = $_FILES['logo_empresa']['name'];
            $archivoTmp = $_FILES['logo_empresa']['tmp_name'];
            $extension = strtolower(pathinfo($nombreArchivo, PATHINFO_EXTENSION));
            $extensionesPermitidas = array('jpg', 'jpeg', 'png');
            if (!in_array($extension, $extensionesPermitidas)) {
                echo "4";
                return;
            }
            if ($_FILES['logo_empresa']['size'] > 2 * 1024 * 1024) {
                echo "5";
                return;
            }
            $logoEmpresa = uniqid() . '.' . $extension;
            $rutaCompleta = $directorio . $logoEmpresa;
            if (!move_uploaded_file($archivoTmp, $rutaCompleta)) {
                echo "6";
                return;
            }
        }

        if ($logoEmpresa) {
            $sql = $conexion->prepare("INSERT INTO empresa (nombre_empresa, logo_empresa, rfc_empresa, domicilio_fiscal) VALUES (?, ?, ?, ?)");
            $sql->bind_param("ssss", $nombreEmpresa, $logoEmpresa, $rfcEmpresa, $domicilioFiscal);
        } else {
            $sql = $conexion->prepare("INSERT INTO empresa (nombre_empresa, rfc_empresa, domicilio_fiscal) VALUES (?, ?, ?)");
            $sql->bind_param("sss", $nombreEmpresa, $rfcEmpresa, $domicilioFiscal);
        }
        if (!$sql) {
            echo "Error en la preparación: " . $conexion->error;
            return;
        }
        if ($sql->execute()) {
            echo "1";
        } else {
            echo "2";
        }
        $sql->close();
    } else {
        echo "2";
    }
}

// ACTUALIZAR EMPRESA
function actualizarEmpresa()
{
    global $conexion;
    if (isset($_POST['empresa_id']) && isset($_POST['nombre_empresa'])) {
        $idEmpresa = (int)$_POST['empresa_id'];
        $nombreEmpresa = trim($_POST['nombre_empresa']);
        $rfcEmpresa = isset($_POST['rfc_empresa']) ? trim($_POST['rfc_empresa']) : null;
        $domicilioFiscal = isset($_POST['domicilio_fiscal']) ? trim($_POST['domicilio_fiscal']) : null;

        if (empty($nombreEmpresa)) {
            echo "0";
            return;
        }
        $nombreEmpresa = mysqli_real_escape_string($conexion, $nombreEmpresa);

        // Escapar los nuevos campos si tienen valor
        if ($rfcEmpresa) {
            $rfcEmpresa = mysqli_real_escape_string($conexion, $rfcEmpresa);
        }
        if ($domicilioFiscal) {
            $domicilioFiscal = mysqli_real_escape_string($conexion, $domicilioFiscal);
        }

        // Verificar si ya existe otra empresa con el mismo nombre (excepto la actual)
        $checkSql = "SELECT COUNT(*) as count FROM empresa WHERE nombre_empresa = '$nombreEmpresa' AND id_empresa != $idEmpresa";
        $result = mysqli_query($conexion, $checkSql);
        $row = mysqli_fetch_assoc($result);
        if ($row['count'] > 0) {
            echo "3";
            return;
        }

        // Obtener logo actual
        $logoActualSql = "SELECT logo_empresa FROM empresa WHERE id_empresa = $idEmpresa";
        $logoActualResult = mysqli_query($conexion, $logoActualSql);
        $logoActualRow = mysqli_fetch_assoc($logoActualResult);
        $logoActual = $logoActualRow['logo_empresa'];

        if (isset($_FILES['logo_empresa']) && $_FILES['logo_empresa']['error'] == 0) {
            $directorio = "../../../gafetes/logos_empresa/";
            if (!file_exists($directorio)) {
                mkdir($directorio, 0777, true);
            }
            $nombreArchivo = $_FILES['logo_empresa']['name'];
            $archivoTmp = $_FILES['logo_empresa']['tmp_name'];
            $extension = strtolower(pathinfo($nombreArchivo, PATHINFO_EXTENSION));
            $extensionesPermitidas = array('jpg', 'jpeg', 'png');
            if (!in_array($extension, $extensionesPermitidas)) {
                echo "4";
                return;
            }
            if ($_FILES['logo_empresa']['size'] > 2 * 1024 * 1024) {
                echo "5";
                return;
            }
            $logoNuevo = uniqid() . '.' . $extension;
            $rutaCompleta = $directorio . $logoNuevo;
            if (!move_uploaded_file($archivoTmp, $rutaCompleta)) {
                echo "6";
                return;
            }
            // Eliminar logo anterior si existe
            if ($logoActual && file_exists($directorio . $logoActual)) {
                unlink($directorio . $logoActual);
            }
            $sql = $conexion->prepare("UPDATE empresa SET nombre_empresa = ?, logo_empresa = ?, rfc_empresa = ?, domicilio_fiscal = ? WHERE id_empresa = ?");
            $sql->bind_param("ssssi", $nombreEmpresa, $logoNuevo, $rfcEmpresa, $domicilioFiscal, $idEmpresa);
        } else {
            $sql = $conexion->prepare("UPDATE empresa SET nombre_empresa = ?, rfc_empresa = ?, domicilio_fiscal = ? WHERE id_empresa = ?");
            $sql->bind_param("sssi", $nombreEmpresa, $rfcEmpresa, $domicilioFiscal, $idEmpresa);
        }
        if (!$sql) {
            echo "Error en la preparación: " . $conexion->error;
            return;
        }
        if ($sql->execute()) {
            echo "1";
        } else {
            echo "2";
        }
        $sql->close();
    } else {
        echo "2";
    }
}

// ELIMINAR EMPRESA
function eliminarEmpresa()
{
    global $conexion;

    if (isset($_POST['id_empresa'])) {
        $idEmpresa = (int)$_POST['id_empresa'];

        $conexion->begin_transaction();

        try {
            // Actualizar info_empleados: poner id_empresa a NULL donde corresponda
            $updateSql = "UPDATE info_empleados SET id_empresa = NULL WHERE id_empresa = ?";
            $updateStmt = $conexion->prepare($updateSql);
            if (!$updateStmt) {
                throw new Exception("Error al preparar la actualización: " . $conexion->error);
            }
            $updateStmt->bind_param("i", $idEmpresa);
            $updateStmt->execute();
            $updateStmt->close();

            // Obtener logo actual para eliminar archivo físico
            $logoSql = "SELECT logo_empresa FROM empresa WHERE id_empresa = ?";
            $logoStmt = $conexion->prepare($logoSql);
            if (!$logoStmt) {
                throw new Exception("Error al preparar la consulta del logo: " . $conexion->error);
            }
            $logoStmt->bind_param("i", $idEmpresa);
            $logoStmt->execute();
            $logoResult = $logoStmt->get_result();
            $logo = null;
            if ($logoResult->num_rows > 0) {
                $row = $logoResult->fetch_assoc();
                $logo = $row['logo_empresa'];
            }
            $logoStmt->close();

            if ($logo && file_exists("../../../gafetes/logos_empresa/" . $logo)) {
                unlink("../../../gafetes/logos_empresa/" . $logo);
            }

            // Eliminar empresa
            $deleteSql = "DELETE FROM empresa WHERE id_empresa = ?";
            $deleteStmt = $conexion->prepare($deleteSql);
            if (!$deleteStmt) {
                throw new Exception("Error al preparar la eliminación: " . $conexion->error);
            }
            $deleteStmt->bind_param("i", $idEmpresa);
            $deleteResult = $deleteStmt->execute();
            $deleteStmt->close();

            if ($deleteResult) {
                $conexion->commit();
                echo "1";
            } else {
                $conexion->rollback();
                echo "2";
            }
        } catch (Exception $e) {
            $conexion->rollback();
            echo "Error: " . $e->getMessage();
        }
    } else {
        echo "2";
    }
}

// OBTENER INFO EMPRESA
function obtenerInfoEmpresa()
{
    global $conexion;
    if (isset($_POST['id_empresa'])) {
        $idEmpresa = (int)$_POST['id_empresa'];
        $sql = "SELECT id_empresa, nombre_empresa, logo_empresa, rfc_empresa, domicilio_fiscal FROM empresa WHERE id_empresa = ?";
        $stmt = $conexion->prepare($sql);
        if (!$stmt) {
            echo json_encode(['error' => true, 'message' => 'Error en la preparación: ' . $conexion->error]);
            return;
        }
        $stmt->bind_param("i", $idEmpresa);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($result->num_rows > 0) {
            echo json_encode($result->fetch_assoc());
        } else {
            echo json_encode(['error' => true, 'message' => 'Empresa no encontrada']);
        }
        $stmt->close();
    } else {
        echo json_encode(['error' => true, 'message' => 'No se recibió el ID de la empresa']);
    }
}

// ELIMINAR SOLO EL LOGO DE LA EMPRESA
function eliminarLogoEmpresa()
{
    global $conexion;
    if (isset($_POST['id_empresa'])) {
        $idEmpresa = (int)$_POST['id_empresa'];
        // Obtener el nombre del archivo actual
        $sql = "SELECT logo_empresa FROM empresa WHERE id_empresa = ?";
        $stmt = $conexion->prepare($sql);
        if (!$stmt) {
            echo "0";
            return;
        }
        $stmt->bind_param("i", $idEmpresa);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            $logo = $row['logo_empresa'];
            if ($logo && file_exists("../../../gafetes/logos_empresa/" . $logo)) {
                unlink("../../../gafetes/logos_empresa/" . $logo);
            }
            // Actualizar la base de datos para quitar la referencia
            $update = $conexion->prepare("UPDATE empresa SET logo_empresa = NULL WHERE id_empresa = ?");
            if (!$update) {
                echo "0";
                return;
            }
            $update->bind_param("i", $idEmpresa);
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

// Función para obtener solo el nombre del logo de una empresa
function obtenerImagenEmpresa()
{
    global $conexion;

    if (isset($_GET['id_empresa'])) {
        $idEmpresa = (int)$_GET['id_empresa'];

        $sql = "SELECT logo_empresa FROM empresas WHERE id_empresa = ?";
        $stmt = $conexion->prepare($sql);
        $stmt->bind_param("i", $idEmpresa);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            echo json_encode(['success' => true, 'logo_empresa' => $row['logo_empresa']]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Empresa no encontrada']);
        }

        $stmt->close();
    } else {
        echo json_encode(['success' => false, 'message' => 'ID de empresa no proporcionado']);
    }
}

function obtenerInfoPuesto()
{
    global $conexion;

    if (isset($_GET['id_puesto'])) {
        $idPuesto = (int)$_GET['id_puesto'];

        $sql = "SELECT id_puestoEspecial, nombre_puesto, direccion_puesto, color_hex FROM puestos_especiales WHERE id_puestoEspecial = ?";
        $stmt = $conexion->prepare($sql);
        $stmt->bind_param("i", $idPuesto);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            $row = $result->fetch_assoc();
            echo json_encode([
                'success' => true,
                'puesto' => [
                    'id_puestoEspecial' => $row['id_puestoEspecial'],
                    'nombre_puesto' => $row['nombre_puesto'],
                    'direccion_puesto' => $row['direccion_puesto'],
                    'color_hex' => $row['color_hex']
                ]
            ]);
        } else {
            echo json_encode(['success' => false, 'message' => 'Puesto no encontrado']);
        }

        $stmt->close();
    } else {
        echo json_encode(['success' => false, 'message' => 'ID de puesto no proporcionado']);
    }
}

/**
 * Aqui empieza todas las funciones para los turnos
 */
function registrarTurno()
{
    global $conexion;

    if (isset($_POST['descripcion']) and isset($_POST['hora_inicio']) and isset($_POST['hora_fin'])) {
        // Eliminar espacios en blanco al principio y al final
        $descripcion = trim($_POST['descripcion']);
        $hora_inicio = trim($_POST['hora_inicio']);
        $hora_fin = trim($_POST['hora_fin']);

        // Verificar que el nombre no esté vacío después de eliminar espacios
        if (empty($descripcion) or empty($hora_inicio) or empty($hora_fin)) {
            echo "0"; // El nombre está vacío
            return;
        }

        // Escapar caracteres especiales para prevenir SQL injection
        $descripcion = mysqli_real_escape_string($conexion, $descripcion);
        $hora_inicio = mysqli_real_escape_string($conexion, $hora_inicio);
        $hora_fin    = mysqli_real_escape_string($conexion, $hora_fin);

        // Verificar si el departamento ya existe
        $checkSql = "SELECT COUNT(*) as count FROM turnos WHERE descripcion = '$descripcion' and hora_inicio = '$hora_inicio' and hora_fin = '$hora_fin' and estado = 1";
        $result = mysqli_query($conexion, $checkSql);
        $row = mysqli_fetch_assoc($result);

        if ($row['count'] > 0) {
            echo "3"; // Departamento ya existe
            return;
        }

        // Preparar la consulta para insertar el nuevo departamento
        $sql = $conexion->prepare("INSERT INTO turnos (descripcion, hora_inicio, hora_fin, estado) VALUES (?, ?, ?, 1)");

        if (!$sql) {
            echo "Error en la preparación: " . $conexion->error;
            return;
        }

        $sql->bind_param("sss", $descripcion, $hora_inicio, $hora_fin);

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

function obtenerInfoTurno()
{
    global $conexion;

    if (isset($_POST['id_turno'])) {
        $idTurno = (int)$_POST['id_turno'];

        // Preparar la consulta para obtener la información del área
        $sql = "SELECT id_turno, descripcion, hora_inicio, hora_fin FROM turnos WHERE id_turno = ? and estado = 1";
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

    if (isset($_POST['turno_id']) && isset($_POST['descripcion']) && isset($_POST['hora_inicio']) && isset($_POST['hora_fin'])) {
        $id_turno = (int)$_POST['turno_id'];
        $descripcion = trim($_POST['descripcion']);
        $hora_inicio = trim($_POST['hora_inicio']);
        $hora_fin = trim($_POST['hora_fin']);

        // Verificar que el nombre no esté vacío
        if (empty($descripcion) or empty($hora_inicio) or empty($hora_fin)) {
            echo "0"; // El nombre está vacío
            return;
        }

        // Escapar caracteres especiales para prevenir SQL injection
        $descripcion = mysqli_real_escape_string($conexion, $descripcion);
        $hora_inicio = mysqli_real_escape_string($conexion, $hora_inicio);
        $hora_fin    = mysqli_real_escape_string($conexion, $hora_fin);

        // Verificar si ya existe otro turno con el mismo turno y horas
        $checkSql = "SELECT COUNT(*) as count FROM turnos WHERE descripcion = '$descripcion' AND hora_inicio = '$hora_inicio' AND hora_fin = '$hora_fin' AND id_turno != $id_turno AND estado = 1";
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
            // Primero actualizamos la tabla info_empleados para establecer id_turno como NULL
            // para los empleados que pertenecen al departamento que se va a eliminar
            $updateSql = "UPDATE empleado_turno SET id_turno_base = NULL, id_turno_sabado = NULL WHERE id_turno_base = ? OR id_turno_sabado = ?";
            $updateStmt = $conexion->prepare($updateSql);

            if (!$updateStmt) {
                throw new Exception("Error al preparar la actualización: " . $conexion->error);
            }

            $updateStmt->bind_param("ii", $id_turno, $id_turno);
            $updateStmt->execute();
            $updateStmt->close();

            // Ahora eliminamos el departamento
            $deleteSql = "UPDATE turnos SET estado = 0 WHERE id_turno = ?";
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

/**
 * AQUI EMPIEZAN LAS FUNCIONES PARA LAS FESTIVIDADES
 */

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
