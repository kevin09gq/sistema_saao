<?php
include("config/config.php");
verificarSesion();
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
    <link rel="stylesheet" href="public/styles/notificacion.css">
   
    <!-- Iconos Bootstrap -->
    <link rel="stylesheet" href="<?= BOOTSTRAP_ICONS ?>">
    <!-- SweetAlert2 CSS -->
    <script src="<?= SWEETALERT ?>"></script>
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
    <section class="hero-section py-5">
        <div class="container">
            <div class="row align-items-center hero-row">
                <div class="col-lg-7">
                    <h1 class="hero-title">Sistema Empacadora de Limón</h1>
                    <p class="hero-subtitle">Gestiona empleados, nóminas, contratos y más desde un panel simple y accesible.</p>
                    <div class="mt-4">
                        <a href="empleados/views/lista_empleados.php" class="btn btn-hero btn-primary me-2">Empleados</a>
                        <a href="nomina/views/" class="btn btn-outline-hero">Ver funcionalidades</a>
                    </div>
                </div>
                <div class="col-lg-5">
                    <div class="card feature-overview p-4 shadow-sm">
                        <h5 class="mb-3">Contenido del sistema</h5>
                        <ul class="list-unstyled mb-0">
                            <li class="py-2">
                                <a class="feature-link link-empleados" href="#" title="Gestión de empleados">
                                    <i class="bi bi-people-fill me-2"></i>
                                    <span>Gestión de empleados</span>
                                </a>
                            </li>
                            <li class="py-2">
                                <a class="feature-link link-nomina" href="#" title="Nómina y exportes">
                                    <i class="bi bi-cash-stack me-2"></i>
                                    <span>Nómina y exportes</span>
                                </a>
                            </li>
                            <li class="py-2">
                                <a class="feature-link link-contratos" href="#" title="Contratos y plantillas">
                                    <i class="bi bi-file-earmark-text-fill me-2"></i>
                                    <span>Contratos y plantillas</span>
                                </a>
                            </li>
                            <li class="py-2">
                                <a class="feature-link link-autorizaciones" href="#" title="Autorizaciones y claves">
                                    <i class="bi bi-key-fill me-2"></i>
                                    <span>Autorizaciones y claves</span>
                                </a>
                            </li>
                            <li class="py-2">
                                <a class="feature-link link-prestamos" href="#" title="Préstamos y pagos">
                                    <i class="bi bi-bank2 me-2"></i>
                                    <span>Préstamos y pagos</span>
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section class="features-section py-5">
        <div class="container">
            <div class="row features mt-5">
                <div class="col-md-4 mb-3">
                    <div class="feature-card p-4 h-100 text-center">
                        <div class="feature-icon mb-3"> <i class="bi bi-people"></i> </div>
                        <h6>Empleados</h6>
                        <p class="mb-0">Registro, historial y asignaciones de casilleros.</p>
                    </div>
                </div>
                <div class="col-md-4 mb-3">
                    <div class="feature-card p-4 h-100 text-center">
                        <div class="feature-icon mb-3"> <i class="bi bi-cash-stack"></i> </div>
                        <h6>Nómina</h6>
                        <p class="mb-0">Generación, exportación y tabuladores.</p>
                    </div>
                </div>
                <div class="col-md-4 mb-3">
                    <div class="feature-card p-4 h-100 text-center">
                        <div class="feature-icon mb-3"> <i class="bi bi-file-earmark-text"></i> </div>
                        <h6>Contratos</h6>
                        <p class="mb-0">Plantillas y exportación a Word.</p>
                    </div>
                </div>
            </div>
        </div>
    </section>


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