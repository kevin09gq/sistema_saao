<?php
include("../../../conexion/conexion.php");

header('Content-Type: application/json');

// GET - Obtener datos del usuario
if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $query = "SELECT correo FROM info_admin WHERE id_admin = 1";
    $result = mysqli_query($conexion, $query);
    
    if ($result && mysqli_num_rows($result) > 0) {
        $row = mysqli_fetch_assoc($result);
        echo json_encode([
            'success' => true,
            'correo' => $row['correo']
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'No se encontró el usuario'
        ]);
    }
}

// POST - Actualizar datos del usuario
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $correo = mysqli_real_escape_string($conexion, $_POST['correo']);
    $password_actual = $_POST['password_actual'];
    $password_nueva = $_POST['password_nueva'];
    
    // Validar correo
    if (!filter_var($correo, FILTER_VALIDATE_EMAIL)) {
        echo json_encode([
            'success' => false,
            'message' => 'Correo no válido'
        ]);
        exit;
    }
    
    // Verificar la contraseña actual
    $query = "SELECT password FROM info_admin WHERE id_admin = 1";
    $result = mysqli_query($conexion, $query);
    
    if ($result && mysqli_num_rows($result) > 0) {
        $row = mysqli_fetch_assoc($result);
        
        // Verificar que la contraseña actual sea correcta
        if (!password_verify($password_actual, $row['password'])) {
            echo json_encode([
                'success' => false,
                'message' => 'La contraseña actual es incorrecta'
            ]);
            exit;
        }
        
        // Si hay nueva contraseña, actualizarla también
        if (!empty($password_nueva)) {
            $password_hash = password_hash($password_nueva, PASSWORD_DEFAULT);
            $query = "UPDATE info_admin SET correo = '$correo', password = '$password_hash' WHERE id_admin = 1";
            $mensaje = 'Correo y contraseña actualizados correctamente';
        } else {
            $query = "UPDATE info_admin SET correo = '$correo' WHERE id_admin = 1";
            $mensaje = 'Correo actualizado correctamente';
        }
        
        if (mysqli_query($conexion, $query)) {
            echo json_encode([
                'success' => true,
                'message' => $mensaje
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'message' => 'Error al actualizar: ' . mysqli_error($conexion)
            ]);
        }
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Usuario no encontrado'
        ]);
    }
}
?>