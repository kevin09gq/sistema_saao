<!DOCTYPE html>
<html lang="es">

<?php
require_once __DIR__ . "/../../public/php/config.php";
require_once __DIR__ . "/../../public/php/verificarSesion.php";

verificarSesion();

?>

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Configuración del sistema</title>
     <!-- Icono del sistema -->
    <link rel="icon" href="<?= ICONO_SISTEMA ?>" />
    <!-- Bootstrap 5 -->
    <link href="<?= BOOTSTRAP_CSS ?>" rel="stylesheet">
    <!-- Bootstrap Iconos 5 -->
    <link rel="stylesheet" href="<?= BOOTSTRAP_ICONS ?>">
    <!-- SweetAlert2 CSS -->
    <script src="<?= SWEETALERT ?>"></script>
    
    <link rel="stylesheet" href="../css/config.css">
</head>

<body>
    <?php require_once __DIR__ . "/../../navbar/navbar.php"; ?>

    <main class="container-fluid config-page py-4">
 

        <div class="row g-4 align-items-start">
            <aside class="col-xl-3 col-xxl-2">
                <div class="card config-menu-card">
                    <div class="card-body p-2">
                        <p class="menu-title px-3 pt-2 mb-2">Catálogos y parámetros</p>
                        <div class="nav flex-column nav-pills config-menu" id="config-menu" role="tablist">
                            <button class="nav-link text-start active" id="empresa-tab"
                                data-bs-toggle="pill" data-bs-target="#panel-empresa" type="button" role="tab"
                                aria-controls="panel-empresa" aria-selected="true">
                                <i class="bi bi-building-gear"></i><span>Empresa</span>
                                <i class="bi bi-chevron-right ms-auto menu-arrow"></i>
                            </button>
                            <button class="nav-link text-start" id="areas-tab"
                                data-bs-toggle="pill" data-bs-target="#panel-areas" type="button" role="tab"
                                aria-controls="panel-areas" aria-selected="false">
                                <i class="bi bi-diagram-3"></i><span>Áreas</span>
                            </button>
                            <button class="nav-link text-start" id="departamentos-tab"
                                data-bs-toggle="pill" data-bs-target="#panel-departamentos" type="button" role="tab"
                                aria-controls="panel-departamentos" aria-selected="false">
                                <i class="bi bi-diagram-2"></i><span>Departamentos</span>
                            </button>
                            <button class="nav-link text-start" id="puestos-tab"
                                data-bs-toggle="pill" data-bs-target="#panel-puestos" type="button" role="tab"
                                aria-controls="panel-puestos" aria-selected="false">
                                <i class="bi bi-briefcase"></i><span>Puestos</span>
                            </button>
                            <button class="nav-link text-start" id="turnos-tab"
                                data-bs-toggle="pill" data-bs-target="#panel-turnos" type="button" role="tab"
                                aria-controls="panel-turnos" aria-selected="false">
                                <i class="bi bi-clock-history"></i><span>Turnos y horarios</span>
                            </button>
                            <button class="nav-link text-start" id="nominas-tab"
                                data-bs-toggle="pill" data-bs-target="#panel-nominas" type="button" role="tab"
                                aria-controls="panel-nominas" aria-selected="false">
                                <i class="bi bi-wallet2"></i><span>Nóminas</span>
                            </button>
                            <button class="nav-link text-start" id="festividades-tab"
                                data-bs-toggle="pill" data-bs-target="#panel-festividades" type="button" role="tab"
                                aria-controls="panel-festividades" aria-selected="false">
                                <i class="bi bi-calendar-event"></i><span>Festividades</span>
                            </button>
                            <button class="nav-link text-start" id="ranchos-tab"
                                data-bs-toggle="pill" data-bs-target="#panel-ranchos" type="button" role="tab"
                                aria-controls="panel-ranchos" aria-selected="false">
                                <i class="bi bi-tree"></i><span>Ranchos</span>
                            </button>
                            <button class="nav-link text-start" id="tabulador-tab"
                                data-bs-toggle="pill" data-bs-target="#panel-tabulador" type="button" role="tab"
                                aria-controls="panel-tabulador" aria-selected="false">
                                <i class="bi bi-table"></i><span>Tabulador</span>
                            </button>
                            <button class="nav-link text-start" id="usuarios-tab"
                                data-bs-toggle="pill" data-bs-target="#panel-usuarios" type="button" role="tab"
                                aria-controls="panel-usuarios" aria-selected="false">
                                <i class="bi bi-person-gear"></i><span>Usuarios y permisos</span>
                            </button>
                            <button class="nav-link text-start" id="herramientas-tab"
                                data-bs-toggle="pill" data-bs-target="#panel-herramientas" type="button" role="tab"
                                aria-controls="panel-herramientas" aria-selected="false">
                                <i class="bi bi-database-gear"></i><span>Herramientas</span>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="help-card mt-3">
                    <i class="bi bi-lightbulb"></i>
                    <div><strong>¿Necesitas ayuda?</strong><p>Consulta la guía de configuración del sistema.</p><a href="#">Ver guía <i class="bi bi-arrow-right"></i></a></div>
                </div>
            </aside>

            <section class="col-xl-9 col-xxl-10">
                <div class="tab-content" id="config-content">
                    <?php require_once __DIR__ . '/sections/empresas.php'; ?>

                    <?php require_once __DIR__ . '/sections/areas.php'; ?>
                    <?php require_once __DIR__ . '/sections/departamentos.php'; ?>
                    <?php require_once __DIR__ . '/sections/puestos.php'; ?>
                    <?php require_once __DIR__ . '/sections/turnos.php'; ?>
                    <?php require_once __DIR__ . '/sections/nominas.php'; ?>
                    <?php require_once __DIR__ . '/sections/festividades.php'; ?>
                    <?php require_once __DIR__ . '/sections/ranchos.php'; ?>
                    <?php require_once __DIR__ . '/sections/tabulador.php'; ?>
                    <?php require_once __DIR__ . '/sections/usuarios.php'; ?>
                    <?php require_once __DIR__ . '/sections/herramientas.php'; ?>
                </div>
            </section>
        </div>
    </main>

    <?php require_once __DIR__ . '/modals/modalEditarEmpresas.php'; ?>
    <?php require_once __DIR__ . '/modals/modalAgregarEmpresas.php'; ?>
    <?php require_once __DIR__ . '/modals/modalActualizarLogoEmpresa.php'; ?>
    <?php require_once __DIR__ . '/modals/modalEditarAreas.php'; ?>
    <?php require_once __DIR__ . '/modals/modalAgregarAreas.php'; ?>
    <?php require_once __DIR__ . '/modals/modalActualizarLogoArea.php'; ?>
    <?php require_once __DIR__ . '/modals/modalEditarDepartamentos.php'; ?>
    <?php require_once __DIR__ . '/modals/modalAgregarDepartamentos.php'; ?>
    <?php require_once __DIR__ . '/modals/modalVerAreasDepartamento.php'; ?>

    <!-- jQuery -->
    <script src="<?= JQUERY_JS ?>"></script>
    <script src="<?= JQUERY_UI_JS ?>"></script>
    <!-- Bootstrap JS -->
    <script src="<?= BOOTSTRAP_JS ?>"></script>
    
    <script>
        document.querySelectorAll('#config-menu .nav-link').forEach(function (item) {
            item.addEventListener('shown.bs.tab', function (event) {
                document.querySelectorAll('#config-menu .menu-arrow').forEach(function (arrow) { arrow.remove(); });
                event.target.insertAdjacentHTML('beforeend', '<i class="bi bi-chevron-right ms-auto menu-arrow"></i>');
            });
        });
    </script>

    <script src="../js/empresas.js"></script>
    <script src="../js/areas.js"></script>
    <script src="../js/departamentos.js"></script>
    <script src="../js/funcionesAuxiliares.js"></script>
</body>
</html>