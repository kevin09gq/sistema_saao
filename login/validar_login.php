<?php
include("../config/config.php");
include("../conexion/conexion.php");

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $email = mysqli_real_escape_string($conexion, $_POST['email']);
    $password = $_POST['password'];
    
    // Validar que los campos no estén vacíos
    if (empty($email) || empty($password)) {
        echo json_encode([
            'success' => false,
            'message' => 'Por favor, completa todos los campos'
        ]);
        exit;
    }
    
    // Buscar el usuario por correo
    $query = "SELECT id_admin, correo, password FROM info_admin WHERE correo = ?";
    $stmt = mysqli_prepare($conexion, $query);
    mysqli_stmt_bind_param($stmt, "s", $email);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    if ($result && mysqli_num_rows($result) > 0) {
        $usuario = mysqli_fetch_assoc($result);
        
        // Verificar la contraseña
        if (password_verify($password, $usuario['password'])) {
            // Credenciales correctas - Crear sesión
            $_SESSION['id_admin'] = $usuario['id_admin'];
            $_SESSION['correo'] = $usuario['correo'];
            $_SESSION['logged_in'] = true;
            
            echo json_encode([
                'success' => true,
                'message' => 'Inicio de sesión exitoso',
                'redirect' => '/sistema_saao/index.php'
            ]);
        } else {
            // Contraseña incorrecta
            echo json_encode([
                'success' => false,
                'message' => 'Correo o contraseña incorrectos'
            ]);
        }
    } else {
        // Usuario no encontrado
        echo json_encode([
            'success' => false,
            'message' => 'Correo o contraseña incorrectos'
        ]);
    }
    
    mysqli_stmt_close($stmt);
} else {
    echo json_encode([
        'success' => false,
        'message' => 'Método no permitido'
    ]);
}
?>
