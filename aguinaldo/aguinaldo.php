<?php
require_once __DIR__ . "/../public/php/config.php";
require_once __DIR__ . "/../public/php/verificarSesion.php";
verificarSesion();
verificarPermiso("aguinaldos.ver_menu");
?>

<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Historial de Aguinaldos | Sistema SAAO</title>
    <link rel="icon" href="<?= ICONO_SISTEMA ?>" />

    <!-- Estilos Bootstrap y Fuentes -->
    <link rel="stylesheet" href="<?= JQUERY_UI_CSS ?>">
    <link href="<?= BOOTSTRAP_CSS ?>" rel="stylesheet">
    <link rel="stylesheet" href="<?= BOOTSTRAP_ICONS ?>">
    <link rel="stylesheet" href="css/aguinaldo.css">

    <script>
        const rutaRaiz = '<?= $rutaRaiz ?>';
    </script>
</head>

<body>

    <?php include __DIR__ . '/../navbar/navbar.php'; ?>

    <main class="container-fluid py-4">

        <!-- Encabezado del módulo (Estilo Actualizar Empleado) -->
        <div class="module-header mb-4">
            <div class="module-header-left">
                <div class="module-icon">
                    <i class="bi bi-gift-fill"></i>
                </div>
                <div>
                    <h1 class="module-title mb-0">Historial de Aguinaldos</h1>
                    <p class="module-subtitle mb-0">Gestión y seguimiento de repartos de aguinaldos</p>
                </div>
            </div>
            <div>
                <a href="generar_aguinaldo.php" class="btn btn-success" id="btn-nuevo-aguinaldo" hidden>
                    <i class="bi bi-plus-lg me-1"></i>Nuevo Cálculo
                </a>
            </div>
        </div>

        <!-- Filtros y Herramientas (Toolbar Card) -->
        <div class="toolbar-card mb-4">
            <div class="row g-3 align-items-end">
                <div class="col-md-3">
                    <label for="busqueda" class="form-label">Buscar</label>
                    <div class="input-group shadow-sm">
                        <span class="input-group-text"><i class="bi bi-search"></i></span>
                        <input type="text" class="form-control" placeholder="Buscar por departamento o año..." id="busqueda">
                    </div>
                </div>

                <div class="col-md-2">
                    <label for="filtro_anio" class="form-label">Año</label>
                    <select class="form-select shadow-sm" id="filtro_anio">
                        <!-- Las opciones se llenarán dinámicamente mediante JavaScript -->
                    </select>
                </div>

                <div class="col-md-2">
                    <label for="filtro_area" class="form-label">Área</label>
                    <select class="form-select shadow-sm" id="filtro_area">
                        <option value="">-- Todas las áreas --</option>
                    </select>
                </div>

                <div class="col-md-3">
                    <label for="filtro_departamento" class="form-label">Departamento</label>
                    <select class="form-select shadow-sm" id="filtro_departamento" disabled>
                        <option value="">-- Selecciona un área --</option>
                    </select>
                </div>

                <div class="col-md-1">
                    <label for="filtro_limite" class="form-label">Registros</label>
                    <select class="form-select shadow-sm" id="filtro_limite">
                        <option value="10" selected>10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                        <option value="-1">Todos</option>
                    </select>
                </div>
            </div>
        </div>

        <!-- Tabla Estilizada -->
        <div class="card border-0 shadow-sm">
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead>
                        <tr>
                            <th class="ps-4">N°</th>
                            <th>Año</th>
                            <th>Departamento</th>
                            <th class="text-center">Total Empleados</th>
                            <th class="text-end">Total Aguinaldo</th>
                            <th class="text-end">Total ISR</th>
                            <th class="text-end">Total Tarjeta</th>
                            <th class="text-end">Neto</th>
                            <th class="text-center">Fecha Registro</th>
                            <th class="text-center">Opciones</th>
                        </tr>
                    </thead>
                    <tbody id="cuerpo_tabla_principal">
                        <!-- El contenido de la tabla se llenará dinámicamente mediante JavaScript -->
                    </tbody>
                </table>
            </div>

            <!-- Paginación -->
            <div class="card-footer bg-white py-3">
                <nav aria-label="Page navigation" id="contenedor_paginacion">
                    <ul class="pagination justify-content-center" id="paginacion">
                        <!-- Se genera dinámicamente -->
                    </ul>
                </nav>
                <!-- Contenedor para almacenar la página actual -->
                <div id="pagina_actual" data-pagina="1" style="display:none;"></div>
            </div>
        </div>

    </main>

    <!-- Modal de Detalles del Aguinaldo -->
    <?php include __DIR__ . '/modal_detalles_historial.php'; ?>

    <script>
        // Pasar permisos de PHP a JavaScript
        const permisosUsuario = <?php echo json_encode($_SESSION["permisos"] ?? []); ?>;
    </script>

    <!-- Scripts necesarios para el funcionamiento de la página -->
    <script src="<?= JQUERY_JS ?>"></script>
    <script src="<?= JQUERY_UI_JS ?>"></script>
    <script src="<?= BOOTSTRAP_JS ?>"></script>
    <script src="<?= SWEETALERT ?>"></script>
    <script src="<?= PERMISOS_JS ?>"></script>

    <script src="js/historial/index.js"></script>
    <script src="js/historial/detalles.js"></script>
    <script src="js/historial/borrar.js"></script>
    <script src="js/permisos.js"></script>


</body>

</html>