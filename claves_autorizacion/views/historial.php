<?php
include __DIR__ . "/../../config/config.php";
verificarSesion();
?>

<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Claves de Autorización | Sistema SAAO</title>
    <link rel="icon" href="<?= ICONO_SISTEMA ?>" />

    <!--
    * ==============================================================
    * Hojas de estilo necesarias para el funcionamiento de la página
    * ==============================================================
    -->
    <link rel="stylesheet" href="<?= JQUERY_UI_CSS ?>">
    <link href="<?= BOOTSTRAP_CSS ?>" rel="stylesheet">
    <link rel="stylesheet" href="<?= BOOTSTRAP_ICONS ?>">

</head>

<body class="bg-body-tertiary">

    <?php include __DIR__ . '/../../public/views/navbar.php'; ?>

    <main>

        <div class="container">

            <!-- Filtros de búsqueda -->
            <div class="row g-2 mt-3 align-items-end">

                <!-- Botón volver -->
                <div class="col-12 col-md-auto">
                    <button type="button"
                        class="btn btn-sm btn-outline-secondary shadow-sm w-100"
                        onclick="window.history.back();"><i class="bi bi-arrow-left"></i></button>
                </div>

                <!-- Buscar -->
                <div class="col-12 col-md-4">
                    <input type="text"
                        class="form-control form-control-sm shadow-sm"
                        id="busqueda"
                        name="busqueda"
                        placeholder="Buscar..."
                        title="Buscar por motivo o autorizado por">
                </div>

                <!-- Departamento -->
                <div class="col-12 col-md-2">
                    <select class="form-select form-select-sm shadow-sm"
                        id="departamento"
                        name="departamento"
                        title="Filtrar por departamento">
                        <option value="-1">Todos los departamentos</option>
                    </select>
                </div>

                <!-- Ordenar por fecha -->
                <div class="col-12 col-md-2">
                    <select class="form-select form-select-sm shadow-sm"
                        id="orden_fecha"
                        name="orden_fecha"
                        title="Ordenar por fecha">
                        <option value="desc">Más reciente</option>
                        <option value="asc">Más antigua</option>
                    </select>
                </div>

                <!-- Cantidad por página -->
                <div class="col-12 col-md-1">
                    <select class="form-select form-select-sm shadow-sm"
                        id="limite"
                        name="limite"
                        title="Cantidad de filas por página">
                        <option value="5">5</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                        <option value="-1">Todos</option>
                    </select>
                </div>

            </div>



            <!-- Tabla de resultados -->
            <div class="table-responsive my-3">
                <div class="card shadow-sm">
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-hover table-bordered">
                                <thead>
                                    <tr>
                                        <th class="bg-success text-white text-center">#</th>
                                        <th class="bg-success text-white text-center">Motivo</th>
                                        <th class="bg-success text-white text-center">Autorizado por</th>
                                        <th class="bg-success text-white text-center">Fecha</th>
                                    </tr>
                                </thead>
                                <tbody class="table-group-divider" id="cuerpo-tabla-historial">
                                    <tr>
                                        <td colspan="4" class="text-center text-muted">Cargando información...</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <!-- Paginación -->
                        <nav aria-label="Page navigation" id="contenedor-paginacion">
                            <ul class="pagination justify-content-center" id="paginacion">
                                <!-- Se genera dinámicamente -->
                            </ul>
                        </nav>

                    </div>
                </div>
            </div>

        </div>

    </main>


    <!--
    * ======================================================
    * Scripts necesarios para el funcionamiento de la página
    * ======================================================
    -->

    <!-- jQuery -->
    <script src="<?= JQUERY_JS ?>"></script>
    <!-- Bootstrap JS -->
    <script src="<?= BOOTSTRAP_JS ?>"></script>
    <script src="<?= SWEETALERT ?>"></script>
    <script src="<?= JQUERY_UI_JS ?>"></script>

    <script src="../js/historial.js"></script>

</body>

</html>