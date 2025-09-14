
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
            <ul class="navbar-nav ms-auto">
                <li class="nav-item">
                    <a class="nav-link active" href="<?= $rutaRaiz ?>/index.php">
                        <i class="bi bi-house-fill me-2"></i>
                        Inicio
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="<?= $rutaRaiz ?>/gafetes/gafetes.php">
                        <i class="bi bi-credit-card me-2"></i>
                        Gafetes
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="#">
                        <i class="bi bi-file-text me-2"></i>
                        Contratos
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="<?= $rutaRaiz ?>/nomina/views/nomina.php">
                        <i class="bi bi-calculator me-2"></i>
                        Nómina
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="<?= $rutaRaiz ?>/empleados/views/form_actualizar_empleado.php">
                        <i class="bi bi-people me-2"></i>
                        Empleados
                    </a>
                </li>
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
<link rel="stylesheet" href="<?=$rutaRaiz ?>/public/styles/navbar_styles.css">
