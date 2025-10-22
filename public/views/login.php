<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CITRICOS SAAO - Iniciar Sesión</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <link rel="stylesheet" href="../styles/login.css">
</head>
<body>
    <div class="login-wrapper">
        <div class="login-box">
            <div class="logo-container">
                <img src="../img/botarga.png" alt="CITRICOS SAAO" class="logo">
                <h1>CITRICOS SAAO</h1>
            </div>
            
            <form class="login-form" action="#" method="POST">
                <div class="form-group">
                    <div class="input-group">
                        <i class="fas fa-user"></i>
                        <input type="email" name="email" placeholder="Correo electrónico" required>
                    </div>
                </div>
                
                <div class="form-group">
                    <div class="input-group">
                        <i class="fas fa-lock"></i>
                        <input type="password" name="password" placeholder="Contraseña" required>
                        <i class="fas fa-eye toggle-password"></i>
                    </div>
                </div>
                
                <button type="submit" class="login-button">Iniciar Sesión</button>
                
                <div class="form-footer">
                    <a href="#" class="forgot-password">¿Olvidaste tu contraseña?</a>
                </div>
            </form>
        </div>
    </div>
    
    <script>
        // Toggle password visibility
        document.querySelector('.toggle-password').addEventListener('click', function() {
            const passwordInput = this.previousElementSibling;
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.classList.toggle('fa-eye');
            this.classList.toggle('fa-eye-slash');
        });
    </script>
</body>
</html>