<!DOCTYPE html>
<html lang="es">

<head>
    <?php
    include "../config/config.php";
    verificarNoSesion(); // Si ya inició sesión, redirigir al inicio
    ?>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CITRICOS SAAO - Iniciar Sesión</title>
    <link rel="icon" href="<?= ICONO_SISTEMA ?>" />
    <link rel="stylesheet" href="<?= BOOTSTRAP_ICONS ?>">
    <link rel="stylesheet" href="login.css">
    <!-- Librería SweetAlert2 -->
    <script src="<?= SWEETALERT ?>"></script>
</head>

<body>
    <div class="login-wrapper">

        <!-- Sección izquierda: formulario de inicio de sesión -->
        <div class="login-box" id="formularioInicioSesion">
            <div class="logo-container">
                <img src="../public/img/logo.jpg" alt="CITRICOS SAAO" class="logo">
                <h1>CITRICOS SAAO</h1>
            </div>

            <h2>Iniciar Sesión</h2>
            <p class="form-description">Ingresa tus credenciales para acceder al sistema</p>

            <div id="formularioInicioSesion">
                <div class="form-group">
                    <div class="input-group">
                        <i class="bi bi-envelope-at"></i>
                        <input type="email" name="email" placeholder="Correo electrónico" required id="inputCorreo">
                    </div>
                </div>

                <div class="form-group">
                    <div class="input-group">
                        <i class="bi bi-lock"></i>
                        <input type="password" name="password" placeholder="Contraseña" required id="inputPassword">
                        <button type="button" class="toggle-password">
                            <i class="bi bi-eye"></i>
                        </button>
                    </div>
                </div>

                <button id="btnIniciarSesion" class="login-button">Iniciar Sesión</button>

                <div class="form-footer">
                    <a href="#" class="forgot-password" id="enlaceRecuperarContrasena">¿Olvidaste tu contraseña?</a>
                </div>
            </div>
        </div>

        <!-- Sección izquierda: formulario de recuperación, oculto inicialmente -->
        <div class="login-box recovery-box" id="formularioRecuperacion">
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
                <a href="#" class="forgot-password" id="enlaceVolverInicioSesion">← Volver al inicio de sesión</a>
            </div>
        </div>

        <!-- Sección derecha: imagen del inicio de sesión -->
        <div class="visual-section" id="visualInicioSesion">
            <div class="visual-content">
                <img src="../public/img/botarga.png" alt="CITRICOS SAAO" class="logo">
                <div class="welcome-text">
                    <h2>¡Hola, Amigo!</h2>
                    <p>Bienvenido al Sistema de Gestión CITRICOS SAAO. Ingresa tus credenciales para acceder.</p>
                </div>
            </div>
        </div>

        <!-- Sección derecha: imagen de recuperación, oculta inicialmente -->
        <div class="visual-section recovery-visual" id="visualRecuperacion">
            <div class="visual-content">
                <img src="../public/img/botarga.png" alt="CITRICOS SAAO" class="logo">
                <div class="welcome-text">
                    <h2>Recupera tu Acceso</h2>
                    <p>No te preocupes, te ayudaremos a recuperar tu contraseña. Ingresa tu correo electrónico.</p>
                </div>
            </div>
        </div>
    </div>

    <!-- Librería jQuery -->
    <script src="<?= JQUERY_JS ?>"></script>

    <!-- Transición entre los formularios -->
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const enlaceRecuperarContrasena = document.getElementById('enlaceRecuperarContrasena');
            const enlaceVolverInicioSesion = document.getElementById('enlaceVolverInicioSesion');
            const formularioInicioSesion = document.getElementById('formularioInicioSesion');
            const formularioRecuperacion = document.getElementById('formularioRecuperacion');
            const visualInicioSesion = document.getElementById('visualInicioSesion');
            const visualRecuperacion = document.getElementById('visualRecuperacion');

            // Mostrar formulario de recuperación
            enlaceRecuperarContrasena.addEventListener('click', function(e) {
                e.preventDefault();

                // Animar la salida del inicio de sesión
                formularioInicioSesion.style.animation = 'slideOutLeft 0.5s ease forwards';
                visualInicioSesion.style.animation = 'slideOutRight 0.5s ease forwards';

                setTimeout(() => {
                    formularioInicioSesion.style.display = 'none';
                    visualInicioSesion.style.display = 'none';

                    // Mostrar recuperación
                    formularioRecuperacion.style.display = 'flex';
                    visualRecuperacion.style.display = 'flex';

                    // Animar la entrada
                    formularioRecuperacion.style.animation = 'slideInRight 0.5s ease forwards';
                    visualRecuperacion.style.animation = 'slideInLeft 0.5s ease forwards';
                }, 500);
            });

            // Mostrar el formulario de inicio de sesión
            enlaceVolverInicioSesion.addEventListener('click', function(e) {
                e.preventDefault();

                // Animar la salida de recuperación
                formularioRecuperacion.style.animation = 'slideOutRight 0.5s ease forwards';
                visualRecuperacion.style.animation = 'slideOutLeft 0.5s ease forwards';

                setTimeout(() => {
                    formularioRecuperacion.style.display = 'none';
                    visualRecuperacion.style.display = 'none';

                    // Mostrar el inicio de sesión
                    formularioInicioSesion.style.display = 'flex';
                    visualInicioSesion.style.display = 'flex';

                    // Animar la entrada
                    formularioInicioSesion.style.animation = 'slideInLeft 0.5s ease forwards';
                    visualInicioSesion.style.animation = 'slideInRight 0.5s ease forwards';
                }, 500);
            });
        });
    </script>

    <!-- Validación de los formularios -->
    <script src="ValidarCredenciales.js"></script>
</body>

</html>