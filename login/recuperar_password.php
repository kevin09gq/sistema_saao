<?php
// Este archivo solo responde a solicitudes AJAX y devuelve JSON
include "../config/config.php";
include "../conexion/conexion.php";

header('Content-Type: application/json');

// Verificar si se envió el formulario
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $email = mysqli_real_escape_string($conexion, $_POST['email']);
    
    // Validar que el correo no esté vacío
    if (empty($email)) {
        echo json_encode([
            'success' => false,
            'message' => 'Por favor, ingresa tu correo electrónico.'
        ]);
        exit;
    }
    
    // Verificar si el correo existe en la base de datos
    $query = "SELECT id_admin, correo FROM info_admin WHERE correo = ?";
    $stmt = mysqli_prepare($conexion, $query);
    mysqli_stmt_bind_param($stmt, "s", $email);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    if ($result && mysqli_num_rows($result) > 0) {
        // El correo existe, generar token y guardarlo en sesión
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        
        $usuario = mysqli_fetch_assoc($result);
        $token = bin2hex(random_bytes(50));
        
        $_SESSION['password_reset_token'] = $token;
        $_SESSION['password_reset_email'] = $email;
        $_SESSION['password_reset_expiration'] = time() + 3600; // 1 hora
        
        // Configurar PHPMailer
        require_once '../vendor/autoload.php';
        $mail = new PHPMailer\PHPMailer\PHPMailer(true);
        
        try {
            $mail->isSMTP();
            $mail->Host       = 'smtp.gmail.com';
            $mail->SMTPAuth   = true;
            $mail->Username   = 'sistemabak@gmail.com';
            $mail->Password   = 'swnxacqaapxmeann';
            $mail->SMTPSecure = PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = 587;
            $mail->SMTPDebug  = 0;
            
            $mail->SMTPOptions = [
                'ssl' => [
                    'verify_peer' => false,
                    'verify_peer_name' => false,
                    'allow_self_signed' => true
                ]
            ];
            
            $mail->setFrom('sistemabak@gmail.com', 'Sistema SAAO');
            $mail->addAddress($email);
            $mail->CharSet = 'UTF-8';
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
            
            echo json_encode([
                'success' => true,
                'message' => 'Se ha enviado un enlace de recuperación a tu correo electrónico.'
            ]);
        } catch (PHPMailer\PHPMailer\Exception $e) {
            echo json_encode([
                'success' => false,
                'message' => "No se pudo enviar el correo. Error: {$mail->ErrorInfo}"
            ]);
        }
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'No se encontró este correo.'
        ]);
    }
    
    mysqli_stmt_close($stmt);
    mysqli_close($conexion);
}