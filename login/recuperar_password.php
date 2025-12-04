<?php
include "../config/config.php";
verificarNoSesion(); // Si ya está logueado, redirigir al index

// Iniciar sesión para almacenar el token
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Verificar si se envió el formulario
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Conexión a la base de datos
    include "../conexion/conexion.php";
    
    $email = mysqli_real_escape_string($conexion, $_POST['email']);
    
    // Validar que el correo no esté vacío
    if (empty($email)) {
        $error = "Por favor, ingresa tu correo electrónico.";
    } else {
        // Verificar si el correo existe en la base de datos
        $query = "SELECT id_admin, correo FROM info_admin WHERE correo = ?";
        $stmt = mysqli_prepare($conexion, $query);
        mysqli_stmt_bind_param($stmt, "s", $email);
        mysqli_stmt_execute($stmt);
        $result = mysqli_stmt_get_result($stmt);
        
        if ($result && mysqli_num_rows($result) > 0) {
            // El correo existe, generar token y guardarlo en sesión
            $usuario = mysqli_fetch_assoc($result);
            
            // Generar token único
            $token = bin2hex(random_bytes(50));
            
            // Guardar token en sesión con fecha de expiración (1 hora)
            $_SESSION['password_reset_token'] = $token;
            $_SESSION['password_reset_email'] = $email;
            $_SESSION['password_reset_expiration'] = time() + 3600; // 1 hora
            
            // Configurar PHPMailer
            require_once '../vendor/autoload.php';
            $mail = new PHPMailer\PHPMailer\PHPMailer(true);
            
            try {
                // Configuración del servidor SMTP
                $mail->isSMTP();
                $mail->Host       = 'smtp.gmail.com';
                $mail->SMTPAuth   = true;
                $mail->Username   = 'sistemanomina52@gmail.com';
                $mail->Password   = 'yoyk baiq nzte oykw';
                $mail->SMTPSecure = PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
                $mail->Port       = 587;
                
                // Configuración del correo
                $mail->setFrom('sistemanomina52@gmail.com', 'Sistema SAAO');
                $mail->addAddress($email);
                $mail->CharSet = 'UTF-8';
                
                // Contenido del correo
                $mail->isHTML(true);
                $mail->Subject = 'Recuperación de contraseña - Sistema SAAO';
                $mail->Body    = "
                    <h2>Recuperación de Contraseña</h2>
                    <p>Hola, has solicitado recuperar tu contraseña.</p>
                    <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
                    <p><a href='http://localhost/sistema_saao/login/cambiar_password.php?token=$token' 
                          style='background-color: #22c55e; color: white; padding: 10px 20px; 
                                 text-decoration: none; border-radius: 5px; display: inline-block;'>
                        Restablecer Contraseña
                    </a></p>
                    <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
                    <p>Este enlace expirará en 1 hora.</p>
                ";
                
                $mail->send();
                $success = "Se ha enviado un enlace de recuperación a tu correo electrónico.";
            } catch (PHPMailer\PHPMailer\Exception $e) {
                $error = "No se pudo enviar el correo. Error: {$mail->ErrorInfo}";
            }
        } else {
            // Mostrar error cuando el correo no pertenece a un administrador registrado
            $error = "No se encontro este correo.";
        }
        
        mysqli_stmt_close($stmt);
    }
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Recuperar Contraseña - CITRICOS SAAO</title>
    <link rel="stylesheet" href="<?= BOOTSTRAP_ICONS ?>">
    <link rel="stylesheet" href="login.css">
    <script src="<?= SWEETALERT ?>"></script>
</head>
<body>
    <div class="login-wrapper">
        <div class="login-box">
            <div class="logo-container">
                <img src="../public/img/botarga.png" alt="CITRICOS SAAO" class="logo">
                <h1>CITRICOS SAAO</h1>
            </div>
            
            <h2 style="text-align: center; margin-bottom: 1.5rem; color: #333;">Recuperar Contraseña</h2>
            
            <?php if (isset($error)): ?>
                <div class="alert alert-danger" style="background-color: #fee2e2; color: #991b1b; padding: 0.75rem; border-radius: 0.375rem; margin-bottom: 1rem;">
                    <?php echo $error; ?>
                </div>
            <?php endif; ?>
            
            <?php if (isset($success)): ?>
                <div class="alert alert-success" style="background-color: #dcfce7; color: #166534; padding: 0.75rem; border-radius: 0.375rem; margin-bottom: 1rem;">
                    <?php echo $success; ?>
                </div>
            <?php endif; ?>
            
            <form method="POST" action="">
                <div class="form-group">
                    <div class="input-group">
                        <i class="bi bi-envelope-at"></i>
                        <input type="email" name="email" placeholder="Correo electrónico" required>
                    </div>
                </div>
                
                <button type="submit" class="login-button">Enviar Enlace de Recuperación</button>
            </form>
            
            <div class="form-footer">
                <a href="login.php" class="forgot-password">← Volver al inicio de sesión</a>
            </div>
        </div>
    </div>
</body>
</html>