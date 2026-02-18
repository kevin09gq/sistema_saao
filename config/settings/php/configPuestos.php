<?php
include("../../../conexion/conexion.php");

// Verificar si la conexión a la base de datos es válida
if (!$conexion) {
    die("Error de conexión: " . mysqli_connect_error());
}
if (isset($_GET['accion']) || isset($_POST['accion'])) {
    $accion = $_GET['accion'] ?? $_POST['accion'];

    switch ($accion) {

        // PUESTOS
        case 'registrarPuesto':
            registrarPuesto();
            break;
        case 'eliminarPuesto':
            eliminarPuesto();
            break;
        case 'actualizarPuesto':
            actualizarPuesto();
            break;
        case 'obtenerInfoPuesto':
            obtenerInfoPuesto();
            break;


        // DEPARTAMENTOS-PUESTOS
        case 'registrarDepartamentoPuesto':
            registrarDepartamentoPuesto();
            break;
        case 'actualizarDepartamentoPuesto':
            actualizarDepartamentoPuesto();
            break;
        case 'eliminarDepartamentoPuesto':
            eliminarDepartamentoPuesto();
            break;

        default:
            echo "Acción no reconocida";
    }
} else {
    echo "No se especificó ninguna acción";
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
                throw new Exception("Error al preparar la actualización de info_empleados: " . $conexion->error);
            }

            $updateStmt->bind_param("i", $idPuesto);
            $updateStmt->execute();
            $updateStmt->close();

            // Luego eliminamos las relaciones en departamentos_puestos
            $deleteSql = "DELETE FROM departamentos_puestos WHERE id_puestoEspecial = ?";
            $deleteStmt = $conexion->prepare($deleteSql);

            if (!$deleteStmt) {
                throw new Exception("Error al preparar la eliminación de departamentos_puestos: " . $conexion->error);
            }

            $deleteStmt->bind_param("i", $idPuesto);
            $deleteStmt->execute();
            $deleteStmt->close();

            // Finalmente eliminamos el puesto
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

function obtenerInfoPuesto()
{
    global $conexion;

    if (isset($_GET['id_puesto'])) {
        $idPuesto = (int)$_GET['id_puesto'];

        // Preparar la consulta para obtener la información del puesto
        $sql = $conexion->prepare("SELECT id_puestoEspecial, nombre_puesto, direccion_puesto, color_hex FROM puestos_especiales WHERE id_puestoEspecial = ?");

        if (!$sql) {
            echo json_encode(array('success' => false, 'message' => 'Error al preparar la consulta'));
            return;
        }

        $sql->bind_param("i", $idPuesto);
        $sql->execute();
        $result = $sql->get_result();

        if ($result->num_rows > 0) {
            $puesto = $result->fetch_assoc();
            echo json_encode(array('success' => true, 'puesto' => $puesto));
        } else {
            echo json_encode(array('success' => false, 'message' => 'Puesto no encontrado'));
        }

        $sql->close();
    } else {
        echo json_encode(array('success' => false, 'message' => 'ID de puesto no proporcionado'));
    }
}



/**
 * =============================================================
 * SECCION PARA MENEJAR LA RELACION ENTRE PUESTO Y DEPARTAMENTOS
 * =============================================================
 */
function registrarDepartamentoPuesto()
{
    global $conexion;

    if (isset($_POST['id_puesto']) && isset($_POST['id_departamento'])) {
        // Eliminar espacios en blanco al principio y al final
        $idPuesto = trim($_POST['id_puesto']);
        $idDepartamento = trim($_POST['id_departamento']);

        // Verificar que el nombre no esté vacío después de eliminar espacios
        if (empty($idPuesto) or empty($idDepartamento)) {
            echo "0"; // El nombre está vacío
            return;
        }

        // Verificar si la relación ya existe (evitar duplicados)
        $checkSql = "SELECT COUNT(*) as count FROM departamentos_puestos WHERE id_departamento = ? AND id_puestoEspecial = ?";
        $checkStmt = $conexion->prepare($checkSql);

        if (!$checkStmt) {
            echo "Error en la preparación: " . $conexion->error;
            return;
        }

        $checkStmt->bind_param("ii", $idDepartamento, $idPuesto);
        $checkStmt->execute();
        $result = $checkStmt->get_result();
        $row = $result->fetch_assoc();
        $checkStmt->close();

        if ($row['count'] > 0) {
            echo "3"; // Relación ya existe
            return;
        }

        /**
         * La tabla departamentos_puestos es una tabla intermedia
         * entre departamamentos y puestos_especiales
         */

        // Preparar la consulta para insertar el nuevo puesto
        $sql = $conexion->prepare("INSERT INTO departamentos_puestos (id_departamento, id_puestoEspecial) VALUES (?, ?)");

        if (!$sql) {
            echo "Error en la preparación: " . $conexion->error;
            return;
        }

        $sql->bind_param("ii", $idDepartamento, $idPuesto);

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

function actualizarDepartamentoPuesto()
{
    global $conexion;

    if (isset($_POST['id_puesto']) && isset($_POST['id_departamento']) && isset($_POST['id_departamento_puesto'])) {

        $idPuesto = (int)$_POST['id_puesto'];
        $idDepartamento = (int)$_POST['id_departamento'];
        $id = (int)$_POST['id_departamento_puesto'];

        // Verificar que los IDs no estén vacíos
        if (empty($idPuesto) or empty($idDepartamento) or empty($id)) {
            echo "0"; // Datos vacíos
            return;
        }

        // Verificar si ya existe otra relación con los mismos datos (excepto el actual)
        $checkSql = "SELECT COUNT(*) as count FROM departamentos_puestos WHERE id_departamento = ? AND id_puestoEspecial = ? AND id_departamento_puesto != ?";
        $checkStmt = $conexion->prepare($checkSql);

        if (!$checkStmt) {
            echo "Error en la preparación: " . $conexion->error;
            return;
        }

        $checkStmt->bind_param("iii", $idDepartamento, $idPuesto, $id);
        $checkStmt->execute();
        $result = $checkStmt->get_result();
        $row = $result->fetch_assoc();
        $checkStmt->close();

        if ($row['count'] > 0) {
            echo "3"; // Relación ya existe
            return;
        }

        // Preparar la consulta para actualizar el puesto
        $sql = $conexion->prepare("UPDATE departamentos_puestos SET id_puestoEspecial = ?, id_departamento = ? WHERE id_departamento_puesto = ?");

        if (!$sql) {
            echo "Error en la preparación: " . $conexion->error;
            return;
        }

        $sql->bind_param("iii", $idPuesto, $idDepartamento, $id);

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

function eliminarDepartamentoPuesto()
{
    global $conexion;

    if (isset($_POST['id_departamento_puesto'])) {

        $idDepartamentoPuesto = (int)$_POST['id_departamento_puesto'];

        // Iniciar transacción para asegurar que ambas operaciones se completen o ninguna
        $conexion->begin_transaction();

        try {

            // Ahora eliminamos el puesto
            $deleteSql = "DELETE FROM departamentos_puestos WHERE id_departamento_puesto = ?";
            $deleteStmt = $conexion->prepare($deleteSql);

            if (!$deleteStmt) {
                throw new Exception("Error al preparar la eliminación: " . $conexion->error);
            }

            $deleteStmt->bind_param("i", $idDepartamentoPuesto);
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
        echo "2"; // No se recibió el ID del departamento_puesto
    }
}