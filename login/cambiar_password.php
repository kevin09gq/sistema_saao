<?php
include "../config/config.php";
verificarNoSesion();

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

include "../conexion/conexion.php";

if (!isset($_GET['token']) || empty($_GET['token'])) {
    header("Location: login.php");
    exit;
}

$token = mysqli_real_escape_string($conexion, $_GET['token']);

$error = null;
$success = null;

if (!isset($_SESSION['password_reset_token']) || 
    !isset($_SESSION['password_reset_expiration']) || 
    $_SESSION['password_reset_token'] !== $token || 
    $_SESSION['password_reset_expiration'] < time()) {
    $error = "El enlace de recuperación es inválido o ha expirado.";
} else {
    $email = $_SESSION['password_reset_email'];
    
    if ($_SERVER['REQUEST_METHOD'] == 'POST') {
        $password = $_POST['password'];
        $confirm_password = $_POST['confirm_password'];
        
        if ($password !== $confirm_password) {
            $error = "Las contraseñas no coinciden.";
        } else {
            $password_hash = password_hash($password, PASSWORD_DEFAULT);
            $query = "UPDATE info_admin SET password = ? WHERE correo = ?";
            $stmt = mysqli_prepare($conexion, $query);
            mysqli_stmt_bind_param($stmt, "ss", $password_hash, $email);
            
            if (mysqli_stmt_execute($stmt)) {
                unset($_SESSION['password_reset_token']);
                unset($_SESSION['password_reset_email']);
                unset($_SESSION['password_reset_expiration']);
                $success = "Tu contraseña ha sido actualizada correctamente.";
            } else {
                $error = "Error al actualizar la contraseña. Por favor, inténtalo de nuevo.";
            }
            
            mysqli_stmt_close($stmt);
        }
    }
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cambiar Contraseña - CITRICOS SAAO</title>
    <link rel="stylesheet" href="<?= BOOTSTRAP_ICONS ?>">
    <link rel="stylesheet" href="login.css">
    <script src="<?= SWEETALERT ?>"></script>
    <script src="<?= JQUERY_JS ?>"></script>
</head>
<body>
    <div class="login-wrapper">
        <div class="login-box">
            <div class="logo-container">
                <img src="../public/img/logo.jpg" alt="CITRICOS SAAO" class="logo">
                <h1>CITRICOS SAAO</h1>
            </div>
            
            <?php if ($error): ?>
                <h2 style="text-align: center; margin-bottom: 1.5rem; color: #333;">Error</h2>
                <div class="alert alert-danger" style="background-color: #fee2e2; color: #991b1b; padding: 0.75rem; border-radius: 0.375rem; margin-bottom: 1rem;">
                    <?php echo $error; ?>
                </div>
                <div class="form-footer">
                    <a href="login.php" class="forgot-password">← Volver al inicio de sesión</a>
                </div>
            <?php elseif ($success): ?>
                <h2 style="text-align: center; margin-bottom: 1.5rem; color: #333;">¡Listo!</h2>
                <div class="alert alert-success" style="background-color: #dcfce7; color: #166534; padding: 0.75rem; border-radius: 0.375rem; margin-bottom: 1rem;">
                    <?php echo $success; ?>
                </div>
                <div class="form-footer">
                    <a href="login.php" class="forgot-password">Ir al inicio de sesión</a>
                </div>
            <?php else: ?>
                <h2 style="margin-bottom: 0.5rem; color: #333;">Cambiar Contraseña</h2>
                <p class="form-description" style="text-align: left; width: 100%;">Ingresa tu nueva contraseña</p>
                
                <form class="login-form" method="POST" action="">
                    <div class="form-group">
                        <div class="input-group">
                            <i class="bi bi-lock"></i>
                            <input type="password" name="password" placeholder="Nueva contraseña" required>
                            <button type="button" class="toggle-password">
                                <i class="bi bi-eye"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <div class="input-group">
                            <i class="bi bi-lock"></i>
                            <input type="password" name="confirm_password" placeholder="Confirmar contraseña" required>
                            <button type="button" class="toggle-password">
                                <i class="bi bi-eye"></i>
                            </button>
                        </div>
                    </div>
                    
                    <button type="submit" class="login-button">Actualizar Contraseña</button>
                </form>
                
                <div class="form-footer">
                    <a href="login.php" class="forgot-password">← Volver al inicio de sesión</a>
                </div>
            <?php endif; ?>
        </div>

        <!-- Sección verde a la derecha -->
        <div class="visual-section">
            <div class="visual-content">
                <img src="../public/img/botarga.png" alt="CITRICOS SAAO" class="logo">
                <div class="welcome-text">
                    <h2>Cambia tu Contraseña</h2>
                    <p>Ingresa una contraseña segura para proteger tu cuenta. Asegúrate de que sea fácil de recordar pero difícil de adivinar.</p>
                </div>
            </div>
        </div>
    </div>

    <script>
    document.querySelectorAll('.toggle-password').forEach(function(btn){
        btn.addEventListener('click', function(){
            var input = btn.parentElement.querySelector('input[type="password"], input[type="text"]');
            if (!input) return;
            var icon = btn.querySelector('i');
            if (input.type === 'password') {
                input.type = 'text';
                if (icon) { icon.classList.remove('bi-eye'); icon.classList.add('bi-eye-slash'); }
            } else {
                input.type = 'password';
                if (icon) { icon.classList.remove('bi-eye-slash'); icon.classList.add('bi-eye'); }
            }
        });
    });
    </script>
</body>
</html>
