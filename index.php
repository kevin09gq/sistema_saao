<?php
include("config/config.php");
?>

<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sistema Empacadora de Limón</title>
    <!-- Bootstrap CSS -->
    <link href="<?= BOOTSTRAP_CSS ?>" rel="stylesheet">
    <!-- Estilos personalizados -->
    <link rel="stylesheet" href="public/styles/main.css">
    <!-- Iconos Bootstrap -->
    <link rel="stylesheet" href="<?= BOOTSTRAP_ICONS ?>">
</head>

<body>
    <?php include("public/views/navbar.php"); ?>
    
    <!-- Botón de notificación -->
    <button class="notification-btn" id="notificationButton">
        <i class="bi bi-bell-fill" style="font-size: 22px;"></i>
        <span class="notification-badge" id="notificationBadge">0</span>
    </button>

    <!-- Panel de notificaciones -->
    <div id="notificationPanel" class="notification-panel">
        <div class="notification-header">
            <h5>Notificaciones</h5>
            <button type="button" class="btn-close btn-close-white" aria-label="Close" onclick="closeNotificationPanel()"></button>
        </div>
        <div class="notification-body" id="notificationPanelContent">
            <!-- Las notificaciones se cargarán aquí -->
        </div>
    </div>

    <!-- Sección principal de bienvenida (Hero Section) -->
    <section class="hero-section text-center">
        <div class="container">
            <h1 class="display-5 fw-bold text-success">Sistema Integral de Gestión</h1>
            <p class="lead mb-4">Administra gafetes, contratos y nóminas de los empleados de la empacadora de limón de manera eficiente y profesional.</p>
        </div>
    </section>

    <!-- Tarjetas de funcionalidades principales del sistema -->
    <div class="container my-5">
        <div class="row g-4">
            <div class="col-md-4">
                <div class="card h-100 text-center">
                    <div class="card-body">
                        <i class="bi bi-person-badge text-success" style="font-size: 48px;"></i>
                        <h5 class="card-title mt-3">Gestión de Gafetes</h5>
                        <p class="card-text">Crea, imprime y administra gafetes personalizados para los empleados.</p>
                        <a href="gafetes/" class="btn btn-success">Ir a Gafetes</a>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card h-100 text-center">
                    <div class="card-body">
                        <i class="bi bi-file-earmark-text text-success" style="font-size: 48px;"></i>
                        <h5 class="card-title mt-3">Contratos Laborales</h5>
                        <p class="card-text">Genera y gestiona contratos de trabajo de manera sencilla y segura.</p>
                        <a href="#" class="btn btn-success">Ir a Contratos</a>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card h-100 text-center">
                    <div class="card-body">
                        <i class="bi bi-cash-coin text-success" style="font-size: 48px;"></i>
                        <h5 class="card-title mt-3">Cálculo de Nómina</h5>
                        <p class="card-text">Automatiza el cálculo y control de nóminas para todos los empleados.</p>
                        <a href="#" class="btn btn-success">Ir a Nómina</a>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Pie de página simple -->
    <footer class="bg-success text-white text-center py-3">
        <small>&copy; 2024 Empacadora de Limón. Todos los derechos reservados.</small>
    </footer>

    <!-- jQuery -->
    <script src="<?= JQUERY_JS ?>"></script>
    <!-- Bootstrap JS -->
    <script src="<?= BOOTSTRAP_JS ?>"></script>
    <!-- Script de notificaciones -->
    <script src="public/js/notifications.js"></script>
    <!-- Script para funcionalidad del navbar -->
    <script src="public/js/navbar.js"></script>
</body>

</html>