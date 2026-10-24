<?php

// Verificar si el usuario tiene al menos un permiso de documentos
$tienePermisoDocumentos =
    tienePermiso('gafetes.ver_menu') ||
    tienePermiso('contratos.ver_menu') ||
    tienePermiso('prestamos.ver_menu') ||
    tienePermiso('aguinaldos.ver_menu') ||
    tienePermiso('ptu.ver_menu') ||
    tienePermiso('vacaciones.ver_menu') ||
    tienePermiso('tickets_manuales.ver_menu') ||
    tienePermiso('reloj_8hrs.ver_menu') ||
    tienePermiso('reloj_8hrs.ver_historial');

// Verificar si el usuario tiene al menos un permiso de empleados
$tienePermisoEmpleados =
    tienePermiso('empleados.ver_menu') ||
    tienePermiso('registro_empleados.ver_menu') ||
    tienePermiso('expedientes.ver_menu') ||
    tienePermiso('asistencia.ver_menu') ||
    tienePermiso('claves_autorizacion.ver_menu');

// Verificar si el usuario tiene al menos un permiso de nóminas
$tienePermisoNominas =
    tienePermiso('nomina.crear_nomina40lbs') ||
    tienePermiso('nomina.crear_nomina40lbs_jornal') ||
    tienePermiso('nomina.crear_nomina10lbs') ||
    tienePermiso('nomina.crear_nomina_confianza') ||
    tienePermiso('nomina.crear_nomina_relicario') ||
    tienePermiso('nomina.crear_nomina_pilar') ||
    tienePermiso('nomina.crear_nomina_huasteca') ||
    tienePermiso('nomina.crear_nomina_palmilla') ||
    tienePermiso('cortes.ver_menu');

// Verificar si el usuario tiene al menos un permiso de historial de nóminas
$tienePermisoHistorial =
    tienePermiso('nomina.ver_historial40lbs') ||
    tienePermiso('nomina.ver_historial40lbs_jornal') ||
    tienePermiso('nomina.ver_historial10lbs') ||
    tienePermiso('nomina.ver_historial_confianza') ||
    tienePermiso('nomina.ver_historial_relicario') ||
    tienePermiso('nomina.ver_historial_pilar') ||
    tienePermiso('nomina.ver_historial_huasteca') ||
    tienePermiso('nomina.ver_historial_palmilla');

// Verificar si el usuario tiene al menos un permiso de estadísticas o responsivas
$tienePermisoEstadisticas =
    tienePermiso('nomina.ver_estadisticas_nomina') ||
    tienePermiso('nomina.ver_estadisticas40lbs') ||
    tienePermiso('nomina.ver_estadisticas10lbs') ||
    tienePermiso('nomina.ver_estadisticas_confianza') ||
    tienePermiso('nomina.crear_responsivas');

// ==========================================================================
// OBTENER DATOS DEL ADMINISTRADOR EN SESIÓN PARA EL AVATAR
// ==========================================================================
$nombreAdminSesion = $_SESSION["nombre_admin"] ?? "Administrador";
$correoAdminSesion = $_SESSION["correo"] ?? "";

// Extraer iniciales (ej. Kevin Guevara -> KG)
$palabrasNombre = preg_split('/\s+/', trim($nombreAdminSesion));
$inicialesAdmin = '';
if (count($palabrasNombre) >= 2) {
    $inicialesAdmin = mb_substr($palabrasNombre[0], 0, 1) . mb_substr($palabrasNombre[1], 0, 1);
} else {
    $inicialesAdmin = mb_substr($nombreAdminSesion, 0, 2);
}
$inicialesAdmin = mb_strtoupper($inicialesAdmin);

?>

<!-- Estilos del Navbar cargados previamente para prevenir parpadeos -->
<link rel="stylesheet" href="<?= $rutaRaiz ?>/navbar/css/navbar.css">
<link rel="stylesheet" href="<?= $rutaRaiz ?>/navbar/css/notificaciones.css">

<!-- ==========================================================================
     BARRA SUPERIOR (TOPBAR EJECUTIVA SAAO)
     ========================================================================== -->
<header class="saao-topbar">
    <div class="saao-topbar-container">

        <!-- Izquierda: Botón Menú Vertical + Logotipo -->
        <div class="saao-topbar-left">
            <button class="saao-btn-menu-trigger" id="saaoBtnMenuTrigger" type="button" aria-label="Abrir Menú Principal">
                <i class="bi bi-grid-fill"></i>
                <span>Menú</span>
            </button>

            <a class="saao-brand" href="<?= $rutaRaiz ?>/index.php">
                <img src="<?= $rutaRaiz ?>/public/img/logo.jpg" alt="Logo SAAO" class="saao-brand-logo">
                <div class="saao-brand-info">
                    <span class="saao-brand-name">Cítricos SAAO</span>
                    <span class="saao-brand-badge">Sistema Integral</span>
                </div>
            </a>
        </div>

        <!-- Derecha: Notificaciones + Perfil de Usuario con Avatar de Letras -->
        <div class="saao-topbar-right">

            <!-- Botón de Notificaciones -->
            <a class="saao-topbar-btn-notif position-relative" href="#" id="notificationNavbarButton" title="Notificaciones">
                <i class="bi bi-bell-fill"></i>
                <span class="badge rounded-pill bg-danger position-absolute top-0 start-100 translate-middle d-none" id="notificationBadge">0</span>
            </a>

            <!-- Separador vertical sutil -->
            <div class="saao-topbar-divider"></div>

            <!-- Chip de Usuario + Botón Salir -->
            <div class="saao-user-chip">
                <div class="saao-avatar-iniciales"><?= htmlspecialchars($inicialesAdmin) ?></div>
                <div class="saao-user-info">
                    <span class="saao-user-name"><?= htmlspecialchars($nombreAdminSesion) ?></span>
                    <span class="saao-user-welcome">Bienvenido</span>
                </div>
            </div>

        </div>

    </div>
</header>

<!-- ==========================================================================
     MENÚ VERTICAL LATERAL (SIDEBAR DRAWER)
     ========================================================================== -->
<!-- Capa de fondo para cerrar al hacer clic afuera -->
<div class="saao-sidebar-backdrop" id="saaoSidebarBackdrop" style="visibility: hidden;"></div>

<aside class="saao-sidebar" id="saaoSidebar" style="visibility: hidden;">

    <!-- Encabezado del Menú Lateral -->
    <div class="saao-sidebar-header">
        <div class="saao-sidebar-brand">
            <img src="<?= $rutaRaiz ?>/public/img/logo.jpg" alt="Logo SAAO" class="saao-sidebar-logo">
            <div>
                <h2 class="saao-sidebar-title">Cítricos SAAO</h2>
                <span class="saao-sidebar-subtitle">Menú de Navegación</span>
            </div>
        </div>
        <button class="saao-sidebar-close" id="saaoSidebarClose" type="button" aria-label="Cerrar menú">
            <i class="bi bi-x-lg"></i>
        </button>
    </div>

    <!-- Buscador Rápido de Módulos -->
    <div class="saao-sidebar-search-wrap">
        <div class="saao-sidebar-search">
            <i class="bi bi-search"></i>
            <input type="text" id="saaoModuleSearch" placeholder="Buscar módulo (ej. nómina, empleados)..." autocomplete="off">
        </div>
    </div>

    <!-- Cuerpo con los módulos y acordeones -->
    <nav class="saao-sidebar-body" id="saaoSidebarNav">

        <!-- SECCIÓN: ACCESO RÁPIDO -->
        <div class="saao-menu-category">Principal</div>

        <div class="saao-menu-item">
            <a class="saao-menu-link" href="<?= $rutaRaiz ?>/index.php" data-page="inicio">
                <div class="saao-menu-link-content">
                    <div class="saao-menu-icon"><i class="bi bi-house-door-fill"></i></div>
                    <span>Inicio</span>
                </div>
            </a>
        </div>

        <!-- SECCIÓN: TALENTO HUMANO (EMPLEADOS) -->
        <?php if ($tienePermisoEmpleados): ?>
            <div class="saao-menu-category">Gestión Humana</div>

            <div class="saao-menu-item saao-accordion-item">
                <div class="saao-menu-link saao-accordion-toggle" data-page="empleados">
                    <div class="saao-menu-link-content">
                        <div class="saao-menu-icon"><i class="bi bi-people-fill"></i></div>
                        <span>Empleados</span>
                    </div>
                    <i class="bi bi-chevron-down saao-menu-chevron"></i>
                </div>
                <ul class="saao-submenu">
                    <?php if (tienePermiso("empleados.ver_menu")): ?>
                        <li><a class="saao-submenu-link" href="<?= $rutaRaiz ?>/gestion_empleados/empleados/views/empleados.php">Actualizar Empleado</a></li>
                    <?php endif; ?>

                    <?php if (tienePermiso("registro_empleados.ver_menu")): ?>
                        <li><a class="saao-submenu-link" href="<?= $rutaRaiz ?>/gestion_empleados/registro/views/registro.php">Registrar Empleado</a></li>
                    <?php endif; ?>

                    <?php if (tienePermiso("casilleros.ver_menu")): ?>
                        <li><a class="saao-submenu-link" href="<?= $rutaRaiz ?>/casillero/casillero.php">Casilleros</a></li>
                    <?php endif; ?>

                    <?php if (tienePermiso("expedientes.ver_menu")): ?>
                        <li><a class="saao-submenu-link" href="<?= $rutaRaiz ?>/expedientes/views/expedientes.php">Expedientes</a></li>
                    <?php endif; ?>

                    <?php if (tienePermiso("asistencia.ver_menu")): ?>
                        <li><a class="saao-submenu-link" href="<?= $rutaRaiz ?>/asistencia/views/asistencia.php">Lista de Asistencia</a></li>
                    <?php endif; ?>

                    <?php if (tienePermiso("claves_autorizacion.ver_menu")): ?>
                        <li><a class="saao-submenu-link" href="<?= $rutaRaiz ?>/claves_autorizacion/views/autorizacion.php">Claves de Autorización</a></li>
                    <?php endif; ?>
                </ul>
            </div>
        <?php endif; ?>

        <!-- SECCIÓN: CONTROL Y DOCUMENTOS -->
        <?php if ($tienePermisoDocumentos): ?>
            <div class="saao-menu-category">Documentos y Control</div>

            <div class="saao-menu-item saao-accordion-item">
                <div class="saao-menu-link saao-accordion-toggle" data-page="documentos">
                    <div class="saao-menu-link-content">
                        <div class="saao-menu-icon"><i class="bi bi-folder2-open"></i></div>
                        <span>Documentos</span>
                    </div>
                    <i class="bi bi-chevron-down saao-menu-chevron"></i>
                </div>
                <ul class="saao-submenu">
                    <?php if (tienePermiso("gafetes.ver_menu")): ?>
                        <li><a class="saao-submenu-link" href="<?= $rutaRaiz ?>/gafetes/gafetes.php">Gafetes</a></li>
                    <?php endif; ?>

                    <?php if (tienePermiso("contratos.ver_menu")): ?>
                        <li><a class="saao-submenu-link" href="<?= $rutaRaiz ?>/contratos/views/lista_empleados.php">Contratos</a></li>
                    <?php endif; ?>

                    <?php if (tienePermiso("prestamos.ver_menu")): ?>
                        <li><a class="saao-submenu-link" href="<?= $rutaRaiz ?>/prestamos/views/index.php">Préstamos</a></li>
                    <?php endif; ?>

                    <?php if (tienePermiso("aguinaldos.ver_menu")): ?>
                        <li><a class="saao-submenu-link" href="<?= $rutaRaiz ?>/aguinaldo/aguinaldo.php">Aguinaldos</a></li>
                    <?php endif; ?>

                    <?php if (tienePermiso("ptu.ver_menu")): ?>
                        <li><a class="saao-submenu-link" href="<?= $rutaRaiz ?>/reparto_utilidades/views/historial.php">PTU (Utilidades)</a></li>
                    <?php endif; ?>

                    <?php if (tienePermiso("vacaciones.ver_menu")): ?>
                        <li><a class="saao-submenu-link" href="<?= $rutaRaiz ?>/vacaciones/views/vacaciones.php">Vacaciones</a></li>
                    <?php endif; ?>

                    <?php if (tienePermiso("tickets_manuales.ver_menu")): ?>
                        <li><a class="saao-submenu-link" href="<?= $rutaRaiz ?>/tickets_manuales/views/tickets_manuales.php">Tickets Manuales</a></li>
                    <?php endif; ?>

                    <?php if (tienePermiso("reloj_8hrs.ver_menu") || tienePermiso("reloj_8hrs.ver_historial")): ?>
                        <li class="saao-sub-dropdown">
                            <a class="saao-submenu-link saao-sub-toggle" href="javascript:void(0);">
                                <strong>Reloj 8 Horas</strong> <i class="bi bi-chevron-right float-end small"></i>
                            </a>
                            <ul class="saao-sub-submenu">
                                <?php if (tienePermiso("reloj_8hrs.ver_menu")): ?>
                                    <li><a class="saao-submenu-link" href="<?= $rutaRaiz ?>/reloj-8horas/views/reloj.php">Subir Excel</a></li>
                                <?php endif; ?>
                                <?php if (tienePermiso("reloj_8hrs.ver_historial")): ?>
                                    <li><a class="saao-submenu-link" href="<?= $rutaRaiz ?>/reloj-8horas/views/historial_v2/historial.php">Historial Reloj</a></li>
                                <?php endif; ?>
                            </ul>
                        </li>
                    <?php endif; ?>
                </ul>
            </div>
        <?php endif; ?>

        <!-- SECCIÓN: NÓMINAS Y RANCHOS -->
        <?php if ($tienePermisoNominas || $tienePermisoHistorial || $tienePermisoEstadisticas): ?>
            <div class="saao-menu-category">Finanzas y Nóminas</div>

            <?php if ($tienePermisoNominas): ?>
            <div class="saao-menu-item saao-accordion-item">
                <div class="saao-menu-link saao-accordion-toggle" data-page="nominas">
                    <div class="saao-menu-link-content">
                        <div class="saao-menu-icon"><i class="bi bi-cash-stack"></i></div>
                        <span>Nóminas</span>
                    </div>
                    <i class="bi bi-chevron-down saao-menu-chevron"></i>
                </div>
                <ul class="saao-submenu">
                    <?php if (tienePermiso("nomina.crear_nomina40lbs")): ?>
                        <li><a class="saao-submenu-link" href="<?= $rutaRaiz ?>/nomina_40lbs/generacion/views/nomina_40lbs.php">Nómina 40 lbs</a></li>
                    <?php endif; ?>

                    <?php if (tienePermiso("nomina.crear_nomina40lbs_jornal")): ?>
                        <li><a class="saao-submenu-link" href="<?= $rutaRaiz ?>/nomina_40lbs_jornal/generacion/views/nomina_40lbs.php">40 lbs Jornal</a></li>
                    <?php endif; ?>

                    <?php if (tienePermiso("nomina.crear_nomina10lbs")): ?>
                        <li><a class="saao-submenu-link" href="<?= $rutaRaiz ?>/nomina_10lbs/generacion/views/nomina_10lbs.php">Nómina 10 lbs</a></li>
                    <?php endif; ?>

                    <?php if (tienePermiso("nomina.crear_nomina_confianza")): ?>
                        <li><a class="saao-submenu-link" href="<?= $rutaRaiz ?>/nomina_confianza/generacion/views/nomina_confianza.php">Nómina Confianza</a></li>
                    <?php endif; ?>

                    <?php if (tienePermiso("nomina.crear_nomina_relicario")): ?>
                        <li><a class="saao-submenu-link" href="<?= $rutaRaiz ?>/nomina_relicario/generacion/views/nomina_relicario.php">Rancho Relicario</a></li>
                    <?php endif; ?>

                    <?php if (tienePermiso("nomina.crear_nomina_pilar")): ?>
                        <li><a class="saao-submenu-link" href="<?= $rutaRaiz ?>/nomina_pilar/generacion/views/nomina_pilar.php">Rancho Pilar</a></li>
                    <?php endif; ?>

                    <?php if (tienePermiso("nomina.crear_nomina_palmilla")): ?>
                        <li><a class="saao-submenu-link" href="<?= $rutaRaiz ?>/nomina_palmilla/generacion/views/nomina_palmilla.php">Rancho Palmilla</a></li>
                    <?php endif; ?>

                    <?php if (tienePermiso("nomina.crear_nomina_huasteca")): ?>
                        <li><a class="saao-submenu-link" href="<?= $rutaRaiz ?>/nomina_huasteca/generacion/views/nomina_huasteca.php">Rancho Huasteca</a></li>
                    <?php endif; ?>

                    <?php if (tienePermiso("cortes.ver_menu")): ?>
                        <li><a class="saao-submenu-link" href="<?= $rutaRaiz ?>/gestion_ranchos/views/historial_cortes.php">Cortes de Ranchos</a></li>
                    <?php endif; ?>

                </ul>
            </div>
            <?php endif; ?>

            <!-- SECCIÓN: HISTORIAL DE NÓMINAS -->
            <?php if ($tienePermisoHistorial): ?>
            <div class="saao-menu-item saao-accordion-item">
                <div class="saao-menu-link saao-accordion-toggle" data-page="historial_nominas">
                    <div class="saao-menu-link-content">
                        <div class="saao-menu-icon"><i class="bi bi-clock-history"></i></div>
                        <span>Historial</span>
                    </div>
                    <i class="bi bi-chevron-down saao-menu-chevron"></i>
                </div>
                <ul class="saao-submenu">
                    <?php if (tienePermiso("nomina.ver_historial40lbs") || tienePermiso("nomina.ver_historial40lbs_jornal")): ?>
                        <li><a class="saao-submenu-link" href="<?= $rutaRaiz ?>/nomina_40lbs/historial/views/historial_40lbs.php">Historial 40 lbs</a></li>
                    <?php endif; ?>
                    <?php if (tienePermiso("nomina.ver_historial10lbs")): ?>
                        <li><a class="saao-submenu-link" href="<?= $rutaRaiz ?>/nomina_10lbs/historial/views/historial_10lbs.php">Historial 10 lbs</a></li>
                    <?php endif; ?>
                    <?php if (tienePermiso("nomina.ver_historial_confianza")): ?>
                        <li><a class="saao-submenu-link" href="<?= $rutaRaiz ?>/nomina_confianza/historial/views/historial_confianza.php">Historial Confianza</a></li>
                    <?php endif; ?>
                    <?php if (tienePermiso("nomina.ver_historial_relicario")): ?>
                        <li><a class="saao-submenu-link" href="<?= $rutaRaiz ?>/nomina_relicario/historial/views/historial_relicario.php">Historial Relicario</a></li>
                    <?php endif; ?>
                    <?php if (tienePermiso("nomina.ver_historial_pilar")): ?>
                        <li><a class="saao-submenu-link" href="<?= $rutaRaiz ?>/nomina_pilar/historial/views/historial_pilar.php">Historial Pilar</a></li>
                    <?php endif; ?>
                    <?php if (tienePermiso("nomina.ver_historial_palmilla")): ?>
                        <li><a class="saao-submenu-link" href="<?= $rutaRaiz ?>/nomina_palmilla/historial/views/historial_palmilla.php">Historial Palmilla</a></li>
                    <?php endif; ?>
                    <?php if (tienePermiso("nomina.ver_historial_huasteca")): ?>
                        <li><a class="saao-submenu-link" href="<?= $rutaRaiz ?>/nomina_huasteca/historial/views/historial_huasteca.php">Historial Huasteca</a></li>
                    <?php endif; ?>
                </ul>
            </div>
            <?php endif; ?>

            <!-- SECCIÓN: ESTADÍSTICAS Y RESPONSIVAS -->
            <?php if ($tienePermisoEstadisticas): ?>
            <div class="saao-menu-item saao-accordion-item">
                <div class="saao-menu-link saao-accordion-toggle" data-page="estadisticas_nominas">
                    <div class="saao-menu-link-content">
                        <div class="saao-menu-icon"><i class="bi bi-graph-up-arrow"></i></div>
                        <span>Estadísticas y Responsivas</span>
                    </div>
                    <i class="bi bi-chevron-down saao-menu-chevron"></i>
                </div>
                <ul class="saao-submenu">
                    <?php if (tienePermiso("nomina.ver_estadisticas_nomina")): ?>
                        <li><a class="saao-submenu-link" href="<?= $rutaRaiz ?>/estadisticas_nominas/views/estadisticas.php">Estadísticas de Nóminas</a></li>
                    <?php endif; ?>

                    <?php if (tienePermiso("nomina.ver_estadisticas40lbs")): ?>
                        <li><a class="saao-submenu-link" href="<?= $rutaRaiz ?>/nomina_40lbs/estadisticas/views/estadisticas_40lbs.php">Estadísticas 40 lbs</a></li>
                    <?php endif; ?>

                    <?php if (tienePermiso("nomina.ver_estadisticas10lbs")): ?>
                        <li><a class="saao-submenu-link" href="<?= $rutaRaiz ?>/nomina_10lbs/estadisticas/views/estadisticas_10lbs.php">Estadísticas 10 lbs</a></li>
                    <?php endif; ?>

                    <?php if (tienePermiso("nomina.ver_estadisticas_confianza")): ?>
                        <li><a class="saao-submenu-link" href="<?= $rutaRaiz ?>/nomina_confianza/estadisticas/views/estadisticas_confianza.php">Estadísticas Confianza</a></li>
                    <?php endif; ?>

                    <?php if (tienePermiso("nomina.crear_responsivas")): ?>
                        <li><a class="saao-submenu-link" href="<?= $rutaRaiz ?>/estadisticas_nominas/views/responsiva.php">Responsivas de Nómina</a></li>
                    <?php endif; ?>
                </ul>
            </div>
            <?php endif; ?>
        <?php endif; ?>

        <!-- SECCIÓN: SISTEMA Y AJUSTES -->
        <div class="saao-menu-category">Administración</div>

        <?php if (tienePermiso("configuracion.ver_menu")): ?>
            <div class="saao-menu-item">
                <a class="saao-menu-link" href="<?= $rutaRaiz ?>/config/settings/views/configuracion.php" data-page="configuracion">
                    <div class="saao-menu-link-content">
                        <div class="saao-menu-icon"><i class="bi bi-gear-fill"></i></div>
                        <span>Configuración</span>
                    </div>
                </a>
            </div>
        <?php endif; ?>

        <?php if (tienePermiso("panel_admin.ver_menu")): ?>
            <div class="saao-menu-item">
                <a class="saao-menu-link" href="<?= $rutaRaiz ?>/admin/views/panel_administrativo.php" data-page="admin">
                    <div class="saao-menu-link-content">
                        <div class="saao-menu-icon" style="background-color: #fffbeb; color: #d97706;"><i class="bi bi-shield-lock-fill"></i></div>
                        <span>Panel Admin</span>
                    </div>
                </a>
            </div>
        <?php endif; ?>

    </nav>

    <!-- Pie del Menú Lateral -->
    <div class="saao-sidebar-footer">
        <div class="saao-sidebar-user-card">
            <div class="saao-avatar-iniciales"><?= htmlspecialchars($inicialesAdmin) ?></div>
            <div class="saao-sidebar-user-meta">
                <strong class="saao-sidebar-user-name"><?= htmlspecialchars($nombreAdminSesion) ?></strong>
                <span class="saao-sidebar-user-role">Bienvenido</span>
            </div>
        </div>
        <button class="saao-sidebar-btn-salir btn-salir" type="button">
            <i class="bi bi-box-arrow-right"></i>
            <span>Cerrar Sesión</span>
        </button>
    </div>

</aside>

<!-- Modales de Notificaciones y Tarjeta de Felicitación -->
<?php include __DIR__ . '/views/modalNotificaciones.php'; ?>
<?php include __DIR__ . '/views/modalFelicitacion.php'; ?>

<!-- Scripts -->
<script src="<?= $rutaRaiz ?>/navbar/js/navbar.js"></script>
<script src="<?= $rutaRaiz ?>/navbar/js/felicitaciones.js?v=<?= filemtime(__DIR__ . '/js/felicitaciones.js') ?>"></script>
<script src="<?= $rutaRaiz ?>/navbar/js/notifications.js"></script>