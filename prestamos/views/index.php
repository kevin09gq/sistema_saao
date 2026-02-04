<?php
include __DIR__ . "/../../config/config.php";
verificarSesion();
?>

<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Prestamos | Sistema SAAO</title>
    <link rel="icon" href="<?= ICONO_SISTEMA ?>" />

    <!--
    * ==============================================================
    * Hojas de estilo necesarias para el funcionamiento de la página
    * ==============================================================
    -->
    <link href="<?= BOOTSTRAP_CSS ?>" rel="stylesheet">
    <link rel="stylesheet" href="<?= BOOTSTRAP_ICONS ?>">

    <link rel="stylesheet" href="../css/prestamo.css">

    <style>
        .concept-title {
            flex: 1;
            text-align: left;
        }
    </style>

</head>

<body class="bg-body-tertiary">

    <?php include __DIR__ . '/../../public/views/navbar.php'; ?>

    <main>

        <div class="container">

            <!-- Filtros de búsqueda -->
            <div class="row g-2 align-items-center my-3">
                <div class="col-12 col-md-10">
                    <div class="row g-2">
                        <!-- Campo de búsqueda -->
                        <div class="col-12 col-md-6">
                            <label for="busqueda" class="form-label visually-hidden">Buscar</label>
                            <input type="text" class="form-control shadow-sm" id="busqueda" name="busqueda" placeholder="Buscar...">
                        </div>

                        <!-- Selección de departamento -->
                        <div class="col-12 col-md-4">
                            <label for="departamento" class="form-label visually-hidden">Departamento</label>
                            <select class="form-select shadow-sm" id="departamento" name="departamento">
                                <option value="-1">Todos los departamentos</option>
                                <!-- Opciones dinámicas aquí -->
                            </select>
                        </div>

                        <!-- Selección de estado -->
                        <div class="col-12 col-md-2">
                            <label for="estado" class="form-label visually-hidden">Estado</label>
                            <select class="form-select shadow-sm" id="estado" name="estado">
                                <option value="-1" selected>Todos los estados</option>
                                <option value="activo">Activo</option>
                                <option value="liquidado">Liquidado</option>
                            </select>
                        </div>

                        <!-- generar documentos -->
                        <div class="col-12 col-md-2 text-md-end d-grid d-md-flex">
                            <button class="btn btn-secondary w-100 w-md-auto shadow-sm" id="btnReportes" data-bs-target="#modalReporte" data-bs-toggle="modal">
                                <i class="bi bi-file-earmark-text-fill me-2"></i>Reportes SEM
                            </button>
                        </div>

                        <!-- Botón para nuevo préstamo -->
                        <div class="col-12 col-md-2 text-md-end d-grid d-md-flex">
                            <a href="nuevo.php" class="btn btn-primary w-100 w-md-auto shadow-sm" id="link-nuevo-prestamo">
                                <i class="bi bi-plus-circle"></i> Nuevo Prestamo
                            </a>
                        </div>

                    </div>
                </div>

            </div>

            <!-- Tabla de resultados -->
            <div class="table-responsive my-3">
                <div class="card shadow-sm">
                    <div class="card-body">
                        <table class="table table-hover table-bordered" id="tabla-prestamos">
                            <thead>
                                <tr>
                                    <th data-titulo="empleado" class="bg-success text-white text-center">Empleado</th>
                                    <th data-titulo="prestamo" class="bg-success text-white text-center">Prestamo</th>
                                    <th data-titulo="abonado" class="bg-success text-white text-center">Abonado</th>
                                    <th data-titulo="deuda" class="bg-success text-white text-center">Deuda</th>
                                    <th data-titulo="estado" class="bg-success text-white text-center">Estado</th>
                                    <th data-titulo="opciones" class="bg-success text-white text-center">Opciones</th>
                                </tr>
                            </thead>
                            <tbody id="cuerpo-tabla-prestamos">

                            </tbody>
                        </table>

                        <!-- paginación -->
                        <nav aria-label="Page navigation" id="paginacion">
                            <ul class="pagination">
                                <li class="page-item">
                                    <a class="page-link" href="#" aria-label="Previous">
                                        <span aria-hidden="true">&laquo;</span>
                                    </a>
                                </li>
                                <li class="page-item"><a class="page-link" href="#">1</a></li>
                                <li class="page-item"><a class="page-link" href="#">2</a></li>
                                <li class="page-item"><a class="page-link" href="#">3</a></li>
                                <li class="page-item">
                                    <a class="page-link" href="#" aria-label="Next">
                                        <span aria-hidden="true">&raquo;</span>
                                    </a>
                                </li>
                            </ul>
                        </nav>

                    </div>
                </div>
            </div>

        </div>

    </main>

    <?php require_once __DIR__ . '/modal_reporte.php' ?>

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

    <script src="../js/index.js"></script>
    <script src="../js/generar_reportes.js"></script>

</body>

</html>