<?php
include("../../config/config.php");
verificarSesion();
?>

<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Notificaciones - Sistema Empacadora de Limón</title>
    <!-- Bootstrap CSS -->
    <link href="<?= BOOTSTRAP_CSS ?>" rel="stylesheet">
    <!-- Estilos personalizados -->
    <link rel="stylesheet" href="../styles/main.css">
    <link rel="stylesheet" href="../styles/notificacion.css">
    <!-- Iconos Bootstrap -->
    <link rel="stylesheet" href="<?= BOOTSTRAP_ICONS ?>">
    <!-- SweetAlert2 -->
    <script src="<?= SWEETALERT ?>"></script>
</head>

<body class="bg-light">
    
    <?php include("navbar.php"); ?>

    <div class="container notifications-container">
        <div class="row mb-4 align-items-center">
            <div class="col">
                <h2 class="fw-bold mb-0">Centro de Notificaciones</h2>
                <p class="text-muted">Revise los vencimientos de gafetes y otros avisos importantes.</p>
            </div>
            <div class="col-auto">
                <button class="btn btn-outline-primary" onclick="updateNotificationCount()">
                    <i class="bi bi-arrow-clockwise me-1"></i> Actualizar
                </button>
            </div>
        </div>

        <!-- Navegación por Pestañas (Submenús) -->
        <ul class="nav nav-tabs mb-4" id="notificationTabs" role="tablist">
            <li class="nav-item" role="presentation">
                <button class="nav-link active fw-bold text-danger" id="vencidos-tab" data-bs-toggle="tab" data-bs-target="#vencidos-pane" type="button" role="tab" aria-controls="vencidos-pane" aria-selected="true">
                    <i class="bi bi-exclamation-octagon-fill me-2"></i>Vencidos <span class="badge bg-danger ms-1" id="badge-vencidos">0</span>
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link fw-bold text-warning" id="proximos-tab" data-bs-toggle="tab" data-bs-target="#proximos-pane" type="button" role="tab" aria-controls="proximos-pane" aria-selected="false">
                    <i class="bi bi-clock-history me-2"></i>Próximos a Vencer <span class="badge bg-warning text-dark ms-1" id="badge-proximos">0</span>
                </button>
            </li>
        </ul>

        <div class="tab-content" id="notificationTabsContent">
            <!-- Panel Vencidos -->
            <div class="tab-pane fade show active" id="vencidos-pane" role="tabpanel" aria-labelledby="vencidos-tab" tabindex="0">
                <div id="notifications-vencidos-content">
                    <div class="text-center py-5">
                        <div class="spinner-border text-danger" role="status">
                            <span class="visually-hidden">Cargando...</span>
                        </div>
                        <p class="mt-2 text-muted">Cargando vencidos...</p>
                    </div>
                </div>
            </div>
            
            <!-- Panel Próximos -->
            <div class="tab-pane fade" id="proximos-pane" role="tabpanel" aria-labelledby="proximos-tab" tabindex="0">
                <div id="notifications-proximos-content">
                    <div class="text-center py-5">
                        <div class="spinner-border text-warning" role="status">
                            <span class="visually-hidden">Cargando...</span>
                        </div>
                        <p class="mt-2 text-muted">Cargando próximos...</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- jQuery -->
    <script src="<?= JQUERY_JS ?>"></script>
    <!-- Bootstrap JS -->
    <script src="<?= BOOTSTRAP_JS ?>"></script>
    <!-- Script de notificaciones -->
    <script src="../js/notifications.js"></script>
    <!-- Script para funcionalidad del navbar -->
    <script src="../js/navbar.js"></script>

    <script>
        // Sobrescribir o complementar la función loadNotifications para que use el contenedor de esta página
        // La función original en notifications.js busca 'notificationPanelContent'
        // Podemos modificar notifications.js para que sea más flexible.
    </script>
</body>

</html>
