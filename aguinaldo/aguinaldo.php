<?php
include_once __DIR__ . "/../config/config.php";
verificarSesion();
?>

<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Aguinaldo</title>
    <link rel="icon" href="<?= ICONO_SISTEMA ?>" />

    <!-- Estilos Bootstrap -->
    <link rel="stylesheet" href="<?= JQUERY_UI_CSS ?>">
    <link href="<?= BOOTSTRAP_CSS ?>" rel="stylesheet">
    <link rel="stylesheet" href="<?= BOOTSTRAP_ICONS ?>">

    <script>
        const rutaRaiz = '<?= $rutaRaiz ?>';
    </script>
</head>

<body class="bg-body-tertiary">

    <?php include __DIR__ . '/../public/views/navbar.php'; ?>

    <main class="container py-4">

        <!-- Título de la página -->
        <div class="row mb-4">
            <div class="col">
                <h2 class="fw-bold text-dark"><i class="bi bi-clock-history me-2"></i>Historial de Aguinaldos</h2>
            </div>
        </div>

        <!-- Barra de Controles: Búsqueda y Nuevo Registro -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <!-- Buscador a la izquierda -->
            <div class="col-md-4 col-lg-3">
                <div class="input-group shadow-sm">
                    <span class="input-group-text bg-white border-end-0">
                        <i class="bi bi-search text-muted"></i>
                    </span>
                    <input type="text" id="busqueda" class="form-control border-start-0" placeholder="Buscar por año...">
                </div>
            </div>

            <!-- Botón a la derecha -->
            <div>
                <a href="generar_aguinaldo.php" class="btn btn-primary shadow-sm fw-bold">
                    <i class="bi bi-plus-circle me-2"></i>Nuevo Aguinaldo
                </a>
            </div>
        </div>

        <!-- Contenedor de la Tabla -->
        <div class="card shadow-sm border-0">
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="bg-light">
                            <tr>
                                <th class="ps-4 py-3 text-secondary text-uppercase fs-xs">#</th>
                                <th class="ps-4 py-3 text-secondary text-uppercase fs-xs">Año</th>
                                <th class="text-center py-3 text-secondary text-uppercase fs-xs">Total Empleados</th>
                                <th class="text-center py-3 text-secondary text-uppercase fs-xs">Total Aguinaldos</th>
                                <th class="text-center py-3 text-secondary text-uppercase fs-xs">Total ISR</th>
                                <th class="text-center py-3 text-secondary text-uppercase fs-xs">Total Dispersión Tarjeta</th>
                                <th class="text-center py-3 text-secondary text-uppercase fs-xs">Total Neto</th>
                                <th class="text-center py-3 text-secondary text-uppercase fs-xs" width="150">Acciones</th>
                            </tr>
                        </thead>
                        <tbody class="border-top-0" id="cuerpo_tabla_aguinaldos">

                        </tbody>
                    </table>
                </div>

                <!-- Paginación -->
                <nav aria-label="Page navigation" id="contenedor-paginacion">
                    <ul class="pagination justify-content-center my-3" id="paginacion">
                        <!-- Se genera dinámicamente -->
                    </ul>
                </nav>
            </div>
        </div>

    </main>

    <!-- Modal de Detalles del Aguinaldo -->
    <?php include __DIR__ . '/modal_detalles_historial.php'; ?>


    <!--
    * ==============================================================
    * Scripts necesarios para el funcionamiento de la página
    * ==============================================================
    -->
    <script src="<?= JQUERY_JS ?>"></script>
    <script src="<?= JQUERY_UI_JS ?>"></script>
    <script src="<?= BOOTSTRAP_JS ?>"></script>
    <script src="<?= SWEETALERT ?>"></script>
    <script src="<?= JQUERY_UI_JS ?>"></script>

    <script src="js/historial/index.js"></script>
    <script src="js/historial/detalles.js"></script>
    <script src="js/historial/borrar.js"></script>


</body>

</html>