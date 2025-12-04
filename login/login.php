<!DOCTYPE html>
<html lang="es">

<head>
    <?php
    include "../config/config.php";
    verificarNoSesion(); // Si ya está logueado, redirigir al index
    ?>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CITRICOS SAAO - Iniciar Sesión</title>
    <link rel="stylesheet" href="<?= BOOTSTRAP_ICONS ?>">
    <link rel="stylesheet" href="login.css">
     <!-- SweetAlert2 CSS -->
    <script src="<?= SWEETALERT ?>"></script>
</head>

<body>
    <div class="login-wrapper">
        <div class="login-box">
            <div class="logo-container">
                <img src="../public/img/botarga.png" alt="CITRICOS SAAO" class="logo">
                <h1>CITRICOS SAAO</h1>
            </div>

            <form class="login-form" action="#" method="POST">
                <div class="form-group">
                    <div class="input-group">
                        <i class="bi bi-envelope-at"></i>
                        <input type="email" name="email" placeholder="Correo electrónico" required>
                    </div>
                </div>

                <div class="form-group">
                    <div class="input-group">
                        <i class="bi bi-lock"></i>
                        <input type="password" name="password" placeholder="Contraseña" required>
                        <button type="button" class="toggle-password">
                            <i class="bi bi-eye"></i>
                        </button>
                    </div>
                </div>

                <button type="submit" class="login-button">Iniciar Sesión</button>

                <div class="form-footer">
                    <a href="recuperar_password.php" class="forgot-password">¿Olvidaste tu contraseña?</a>
                </div>
            </form>
        </div>
    </div>

    <!-- jQuery -->
    <script src="<?= JQUERY_JS ?>"></script>
    
    <!-- Script de validación -->
    <script src="validar_login.js"></script>
</body>

</html>