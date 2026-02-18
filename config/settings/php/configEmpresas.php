<?php
include("../../../conexion/conexion.php");

// Verificar si la conexión a la base de datos es válida
if (!$conexion) {
    die("Error de conexión: " . mysqli_connect_error());
}
if (isset($_GET['accion']) || isset($_POST['accion'])) {
    $accion = $_GET['accion'] ?? $_POST['accion'];

    switch ($accion) {


        // EMPRESA
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
      
        default:
            echo "Acción no reconocida";
    }
} else {
    echo "No se especificó ninguna acción";
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
