<?php
include("config/config.php");
verificarSesion();

$landingHeroImageRel = 'public/img/fondo3.png';
$landingHeroImageFs = __DIR__ . '/public/img/fondo3.png';
if (!file_exists($landingHeroImageFs)) {
    $landingHeroImageRel = 'public/img/fondo2.png';
    $landingHeroImageFs = __DIR__ . '/public/img/fondo2.png';
}
$landingHeroImageUrl = $landingHeroImageRel;
if (file_exists($landingHeroImageFs)) {
    $landingHeroImageUrl .= '?v=' . filemtime($landingHeroImageFs);
}
?>

<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sistema Empacadora de Limón</title>
    <link rel="icon" href="<?= ICONO_SISTEMA ?>" />
    <!-- Bootstrap CSS -->
    <link href="<?= BOOTSTRAP_CSS ?>" rel="stylesheet">
    <!-- Estilos personalizados -->
    <link rel="stylesheet" href="public/styles/main.css?v=<?= filemtime(__DIR__ . '/public/styles/main.css') ?>">
    <link rel="stylesheet" href="public/styles/notificacion.css?v=<?= filemtime(__DIR__ . '/public/styles/notificacion.css') ?>">
   
    <!-- Iconos Bootstrap -->
    <link rel="stylesheet" href="<?= BOOTSTRAP_ICONS ?>">
    <!-- SweetAlert2 CSS -->
    <script src="<?= SWEETALERT ?>"></script>
</head>

<body class="landing-index">
    
    <?php include("public/views/navbar.php"); ?>

    <section class="landing-hero">
        <div class="container">
            <div class="landing-hero-shell">
                <div class="landing-hero-content">
                    <div class="landing-hero-brand animate-in delay-1">
                        <span class="landing-dot"></span>
                        <span>Sistema</span>
                    </div>
                    <h1 class="landing-hero-title animate-in delay-2">Sistema Empacadora de Limón</h1>
                    <p class="landing-hero-subtitle animate-in delay-3">Gestiona empleados, nóminas, gafetes, contratos y préstamos desde un panel claro y rápido.</p>
                    <div class="landing-hero-actions animate-in delay-4">
                        <a href="#servicios" class="landing-btn landing-btn-primary">Ver módulos</a>
                        <a href="public/views/notificaciones.php" class="landing-btn landing-btn-secondary">Notificaciones</a>
                    </div>
                </div>
                <div class="landing-hero-media animate-in delay-5" style="background-image:url('<?= htmlspecialchars($landingHeroImageUrl, ENT_QUOTES) ?>')" aria-hidden="true"></div>
            </div>
        </div>
    </section>

    <section class="landing-services" id="servicios">
        <div class="container">
            <div class="landing-section-head text-center animate-in delay-1">
                <div class="landing-pill">Nuestros servicios</div>
                <h2 class="landing-section-title">¿Qué hacemos?</h2>
            </div>

            <div class="row g-4 mt-4">
                
                <div class="col-sm-6 col-lg-4">
                    <a class="service-card animate-in delay-3" href="gafetes/gafetes.php">
                        <div class="service-icon"><i class="bi bi-person-badge"></i></div>
                        <h6 class="service-title">Gafetes</h6>
                        <p class="service-desc">Generación y control de vigencia.</p>
                    </a>
                </div>
                <div class="col-sm-6 col-lg-4">
                    <a class="service-card animate-in delay-4" href="contratos/contratos.php">
                        <div class="service-icon"><i class="bi bi-file-earmark-text"></i></div>
                        <h6 class="service-title">Contratos</h6>
                        <p class="service-desc">Plantillas y exportación a Word.</p>
                    </a>
                </div>
                <div class="col-sm-6 col-lg-4">
                    <a class="service-card animate-in delay-2" href="prestamos/views/index.php">
                        <div class="service-icon"><i class="bi bi-bank2"></i></div>
                        <h6 class="service-title">Préstamos</h6>
                        <p class="service-desc">Registro, pagos y seguimiento.</p>
                    </a>
                </div>
                <div class="col-sm-6 col-lg-4">
                    <a class="service-card animate-in delay-3" href="reparto_utilidades/views/utilidad.php">
                        <div class="service-icon"><i class="bi bi-gift"></i></div>
                        <h6 class="service-title">PTU</h6>
                        <p class="service-desc">Reparto de utilidades y tickets.</p>
                    </a>
                </div>
                <div class="col-sm-6 col-lg-4">
                    <a class="service-card animate-in delay-4" href="vacaciones/views/vacaciones.php">
                        <div class="service-icon"><i class="bi bi-calendar2-check"></i></div>
                        <h6 class="service-title">Vacaciones</h6>
                        <p class="service-desc">Kardex, prima y calendario.</p>
                    </a>
                </div>
                <div class="col-sm-6 col-lg-4">
                    <a class="service-card animate-in delay-2" href="reloj-8horas/views/reloj.php">
                        <div class="service-icon"><i class="bi bi-clock-history"></i></div>
                        <h6 class="service-title">Reloj 8 horas</h6>
                        <p class="service-desc">Subir Excel y consultar historial.</p>
                    </a>
                </div>
            </div>
        </div>
    </section>

    <section class="landing-band">
        <div class="container">
            <div class="landing-band-shell">
                <div class="landing-band-media animate-in delay-2" style="background-image:url('public/img/fondo2.png?v=<?= @filemtime(__DIR__ . '/public/img/fondo2.png') ?>')" aria-hidden="true"></div>
                <div class="landing-band-content animate-in delay-3">
                    <div class="landing-pill landing-pill-light">Acerca de</div>
                    <h3 class="landing-band-title">Algunas palabras sobre el sistema</h3>
                    <p class="landing-band-text">Centraliza tareas del personal y administración para trabajar más rápido, con accesos directos por módulo y procesos claros.</p>
                    <ul class="landing-band-list">
                        <li>Control de empleados y documentación</li>
                        <li>Procesos de nómina y exportación</li>
                        <li>Seguimiento de vigencias y reportes</li>
                    </ul>
                    <div class="landing-band-actions">
                        <a class="landing-btn landing-btn-light" href="config/settings/views/configuracion.php">Configuración</a>
                        <a class="landing-btn landing-btn-ghost" href="claves_autorizacion/views/autorizacion.php">Autorizaciones</a>
                    </div>
                </div>
            </div>
        </div>
    </section>


    <!-- jQuery -->
    <script src="<?= JQUERY_JS ?>"></script>
    <!-- Bootstrap JS -->
    <script src="<?= BOOTSTRAP_JS ?>"></script>
     <!-- Sincronización automática de vacaciones en segundo plano al iniciar sesión -->
    <script src="vacaciones/js/sincronizarVacaciones.js"></script>

</body>

</html>
