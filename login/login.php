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
        <!-- Left Column - Login Form Section -->
        <div class="login-box" id="loginForm">
            <div class="logo-container">
                <img src="../public/img/logo.jpg" alt="CITRICOS SAAO" class="logo">
                <h1>CITRICOS SAAO</h1>
            </div>

            <h2>Iniciar Sesión</h2>
            <p class="form-description">Ingresa tus credenciales para acceder al sistema</p>

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
                    <a href="#" class="forgot-password" id="showRecovery">¿Olvidaste tu contraseña?</a>
                </div>
            </form>
        </div>

        <!-- Left Column - Recovery Form Section (Hidden by default) -->
        <div class="login-box recovery-box" id="recoveryForm">
            <div class="logo-container">
                <img src="../public/img/logo.jpg" alt="CITRICOS SAAO" class="logo">
                <h1>CITRICOS SAAO</h1>
            </div>

            <h2>Recuperar Contraseña</h2>
            <p class="form-description">Te enviaremos un enlace para restablecer tu contraseña</p>

            <form class="login-form" action="recuperar_password.php" method="POST">
                <div class="form-group">
                    <div class="input-group">
                        <i class="bi bi-envelope-at"></i>
                        <input type="email" name="email" placeholder="Correo electrónico" required>
                    </div>
                </div>
                
                <button type="submit" class="login-button">Enviar Enlace de Recuperación</button>
            </form>
            
            <div class="form-footer">
                <a href="#" class="forgot-password" id="showLogin">← Volver al inicio de sesión</a>
            </div>
        </div>

        <!-- Right Column - Visual Section for Login -->
        <div class="visual-section" id="loginVisual">
            <div class="visual-content">
                <img src="../public/img/botarga.png" alt="CITRICOS SAAO" class="logo">
                <div class="welcome-text">
                    <h2>¡Hola, Amigo!</h2>
                    <p>Bienvenido al Sistema de Gestión CITRICOS SAAO. Ingresa tus credenciales para acceder.</p>
                </div>
            </div>
        </div>

        <!-- Right Column - Visual Section for Recovery (Hidden by default) -->
        <div class="visual-section recovery-visual" id="recoveryVisual">
            <div class="visual-content">
                <img src="../public/img/botarga.png" alt="CITRICOS SAAO" class="logo">
                <div class="welcome-text">
                    <h2>Recupera tu Acceso</h2>
                    <p>No te preocupes, te ayudaremos a recuperar tu contraseña. Ingresa tu correo electrónico.</p>
                </div>
            </div>
        </div>
    </div>

    <!-- jQuery -->
    <script src="<?= JQUERY_JS ?>"></script>
    
    <!-- Script de transición entre formularios -->
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const showRecoveryBtn = document.getElementById('showRecovery');
            const showLoginBtn = document.getElementById('showLogin');
            const loginForm = document.getElementById('loginForm');
            const recoveryForm = document.getElementById('recoveryForm');
            const loginVisual = document.getElementById('loginVisual');
            const recoveryVisual = document.getElementById('recoveryVisual');
            const wrapper = document.querySelector('.login-wrapper');

            // Mostrar formulario de recuperación
            showRecoveryBtn.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Animar salida del login
                loginForm.style.animation = 'slideOutLeft 0.5s ease forwards';
                loginVisual.style.animation = 'slideOutRight 0.5s ease forwards';
                
                setTimeout(() => {
                    loginForm.style.display = 'none';
                    loginVisual.style.display = 'none';
                    
                    // Mostrar recuperación
                    recoveryForm.style.display = 'flex';
                    recoveryVisual.style.display = 'flex';
                    
                    // Animar entrada
                    recoveryForm.style.animation = 'slideInRight 0.5s ease forwards';
                    recoveryVisual.style.animation = 'slideInLeft 0.5s ease forwards';
                }, 500);
            });

            // Mostrar formulario de login
            showLoginBtn.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Animar salida de recuperación
                recoveryForm.style.animation = 'slideOutRight 0.5s ease forwards';
                recoveryVisual.style.animation = 'slideOutLeft 0.5s ease forwards';
                
                setTimeout(() => {
                    recoveryForm.style.display = 'none';
                    recoveryVisual.style.display = 'none';
                    
                    // Mostrar login
                    loginForm.style.display = 'flex';
                    loginVisual.style.display = 'flex';
                    
                    // Animar entrada
                    loginForm.style.animation = 'slideInLeft 0.5s ease forwards';
                    loginVisual.style.animation = 'slideInRight 0.5s ease forwards';
                }, 500);
            });
        });
    </script>
    
    <!-- Script de validación -->
    <script src="validar_login.js"></script>
</body>

</html>