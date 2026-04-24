<?php
include("../../../conexion/conexion.php");

if (!$conexion) {
    die("Error de conexión: " . mysqli_connect_error());
}

if (isset($_GET['accion']) || isset($_POST['accion'])) {
    $accion = $_GET['accion'] ?? $_POST['accion'];

    switch ($accion) {
        case 'registrarPrecio':
            registrarPrecio();
            break;
        case 'obtenerInfoPrecio':
            obtenerInfoPrecio();
            break;
        case 'eliminarPrecio':
            eliminarPrecio();
            break;
        case 'actualizarPrecio':
            actualizarPrecio();
            break;
        default:
            echo "Acción no reconocida";
    }
} else {
    echo "No se especificó ninguna acción";
}

function registrarPrecio() {
    global $conexion;

    if (isset($_POST['tipo_precio']) && isset($_POST['valor_caja']) && isset($_POST['precio_caja']) && isset($_POST['color_hex'])) {
        $tipo = trim($_POST['tipo_precio']);
        $valor = trim($_POST['valor_caja']);
        $precio = trim($_POST['precio_caja']);
        $color = trim($_POST['color_hex']);

        if (empty($tipo) || empty($valor) || $precio === "" || empty($color)) {
            echo "0"; // Campos vacíos
            return;
        }

        $tipo = mysqli_real_escape_string($conexion, $tipo);
        $valor = mysqli_real_escape_string($conexion, $valor);
        $precio = mysqli_real_escape_string($conexion, $precio);
        $color = mysqli_real_escape_string($conexion, $color);

        // Verificar duplicados (mismo tipo y valor)
        $checkSql = "SELECT COUNT(*) as count FROM precios_cajas WHERE tipo = '$tipo' AND valor = '$valor'";
        $result = mysqli_query($conexion, $checkSql);
        $row = mysqli_fetch_assoc($result);

        if ($row['count'] > 0) {
            echo "3"; // Ya existe
            return;
        }

        $sql = $conexion->prepare("INSERT INTO precios_cajas (tipo, valor, precio, color_hex) VALUES (?, ?, ?, ?)");
        $sql->bind_param("ssds", $tipo, $valor, $precio, $color);

        if ($sql->execute()) {
            echo "1"; // Éxito
        } else {
            echo "2"; // Error
        }
        $sql->close();
    } else {
        echo "2";
    }
}

function obtenerInfoPrecio() {
    global $conexion;

    if (isset($_POST['id_precio_caja'])) {
        $id = (int)$_POST['id_precio_caja'];
        $sql = "SELECT * FROM precios_cajas WHERE id_precio_caja = ?";
        $stmt = $conexion->prepare($sql);
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows > 0) {
            echo json_encode($result->fetch_assoc());
        } else {
            echo json_encode(['error' => true, 'message' => 'Precio no encontrado']);
        }
        $stmt->close();
    } else {
        echo json_encode(['error' => true, 'message' => 'No se recibió el ID']);
    }
}

function eliminarPrecio() {
    global $conexion;

    if (isset($_POST['id_precio_caja'])) {
        $id = (int)$_POST['id_precio_caja'];
        $sql = "DELETE FROM precios_cajas WHERE id_precio_caja = ?";
        $stmt = $conexion->prepare($sql);
        $stmt->bind_param("i", $id);

        if ($stmt->execute()) {
            echo "1";
        } else {
            echo "2";
        }
        $stmt->close();
    } else {
        echo "2";
    }
}

function actualizarPrecio() {
    global $conexion;

    if (isset($_POST['precio_id']) && isset($_POST['tipo_precio']) && isset($_POST['valor_caja']) && isset($_POST['precio_caja']) && isset($_POST['color_hex'])) {
        $id = (int)$_POST['precio_id'];
        $tipo = trim($_POST['tipo_precio']);
        $valor = trim($_POST['valor_caja']);
        $precio = trim($_POST['precio_caja']);
        $color = trim($_POST['color_hex']);

        if (empty($tipo) || empty($valor) || $precio === "" || empty($color)) {
            echo "0";
            return;
        }

        $tipo = mysqli_real_escape_string($conexion, $tipo);
        $valor = mysqli_real_escape_string($conexion, $valor);
        $color = mysqli_real_escape_string($conexion, $color);
        
        // Verificar duplicados excluyendo el ID actual
        $checkSql = "SELECT COUNT(*) as count FROM precios_cajas WHERE tipo = '$tipo' AND valor = '$valor' AND id_precio_caja != $id";
        $result = mysqli_query($conexion, $checkSql);
        $row = mysqli_fetch_assoc($result);

        if ($row['count'] > 0) {
            echo "3";
            return;
        }

        $sql = $conexion->prepare("UPDATE precios_cajas SET tipo = ?, valor = ?, precio = ?, color_hex = ? WHERE id_precio_caja = ?");
        $sql->bind_param("ssdsi", $tipo, $valor, $precio, $color, $id);

        if ($sql->execute()) {
            echo "1";
        } else {
            echo "2";
        }
        $sql->close();
    } else {
        echo "5";
    }
}
?>
