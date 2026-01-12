<!-- Barra de navegación principal -->
<nav class="navbar navbar-expand-lg navbar-custom shadow-sm">
    <div class="container">
        <a class="navbar-brand" href="#">
            <img src="<?= $rutaRaiz ?>/public/img/logo.jpg" alt="Logo SAAO" class="rounded-circle">
            <span class="navbar-title">Cítricos SAAO</span>
        </a>
        
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
            <span class="navbar-toggler-icon"></span>
        </button>
        
        <div class="collapse navbar-collapse" id="navbarNav">
            <!-- Estructura de menú adaptada: conserva clases e IDs para JS -->
            <ul class="navbar-menu navbar-nav ms-auto">
                <li class="menu-item nav-item">
                    <a href="<?= $rutaRaiz ?>/index.php" class="menu-link nav-link" data-page="inicio">
                        <i class="bi bi-house-fill me-2"></i>
                        <span class="link-text">Inicio</span>
                    </a>
                </li>

                <li class="menu-item nav-item has-submenu dropdown">
                    <a href="#" class="menu-link nav-link dropdown-toggle" id="empleadosDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false" data-page="empleados">
                        <i class="bi bi-people me-2"></i>
                        <span class="link-text">Empleados</span>
                    </a>
                    <ul class="submenu dropdown-menu" aria-labelledby="empleadosDropdown">
                        <li><a class="dropdown-item" href="<?= $rutaRaiz ?>/empleados/views/form_actualizar_empleado.php">Actualizar Empleado</a></li>
                        <li><a class="dropdown-item" href="<?= $rutaRaiz ?>/empleados/views/form_registro.php">Registrar Empleado</a></li>
                    </ul>
                </li>

                <li class="menu-item nav-item has-submenu dropdown">
                    <a href="#" class="menu-link nav-link dropdown-toggle" id="documentosDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false" data-page="documentos">
                        <i class="bi bi-folder2-open me-2"></i>
                        <span class="link-text">Documentos</span>
                    </a>
                    <ul class="submenu dropdown-menu" aria-labelledby="documentosDropdown">
                        <li><a class="dropdown-item" href="<?= $rutaRaiz ?>/gafetes/gafetes.php">Gafetes</a></li>
                        <li><a class="dropdown-item" href="<?= $rutaRaiz ?>/contratos/contratos.php">Contratos</a></li>
                        <li class="dropdown-submenu">
                            <a class="dropdown-item dropdown-toggle" href="#">Reloj 8 Horas</a>
                            <ul class="submenu dropdown-menu">
                                <li><a class="dropdown-item" href="<?= $rutaRaiz ?>/reloj-8horas/views/reloj.php">Subir Excel</a></li>
                                <li><a class="dropdown-item" href="<?= $rutaRaiz ?>/reloj-8horas/views/historial.php">Historial</a></li>
                            </ul>
                        </li>
                    </ul>
                </li>

                <li class="menu-item nav-item has-submenu dropdown">
                    <a href="#" class="menu-link nav-link dropdown-toggle" id="nominasDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false" data-page="nominas">
                        <i class="bi bi-calculator me-2"></i>
                        <span class="link-text">Nóminas</span>
                    </a>
                    <ul class="submenu dropdown-menu" aria-labelledby="nominasDropdown">
                        <li><a class="dropdown-item" href="<?= $rutaRaiz ?>/nomina/views/nomina.php">40 lbs</a></li>
                        <li><a class="dropdown-item" href="<?= $rutaRaiz ?>/nomina_confianza /views/nomina_confianza.php">Confianza</a></li>
                    </ul>
                </li>

                <li class="menu-item nav-item">
                    <a href="<?= $rutaRaiz ?>/config/settings/views/configuracion.php" class="menu-link nav-link" data-page="configuracion">
                        <i class="bi bi-gear-fill me-2"></i>
                        <span class="link-text">Configuración</span>
                    </a>
                </li>

                <!-- Mantener la clase original "btn-salir" para conservar comportamiento JS -->
                <li class="nav-item">
                    <a class="nav-link btn-salir" href="#">
                        <i class="bi bi-box-arrow-right me-2"></i>
                        Salir
                    </a>
                </li>
            </ul>
        </div>
    </div>
</nav>

<!-- Incluir estilos del navbar -->
<link rel="stylesheet" href="<?= $rutaRaiz ?>/public/styles/navbar_styles.css">
<!-- Iconos Bootstrap (asegurar que estén disponibles en todas las vistas) -->
<link rel="stylesheet" href="<?= BOOTSTRAP_ICONS ?>">
<!-- Script para funcionalidad del navbar -->
<script src="<?= $rutaRaiz ?>/public/js/navbar.js"></script>