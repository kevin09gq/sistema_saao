<!DOCTYPE html>
<html lang="es">

<!-- Incluir config.php para iniciar sesión -->
<?php
include "../../../config/config.php";
verificarSesion(); // Proteger esta página
?>

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Historial Nómina 40 Libras</title>

    <!-- Icono del sistema -->
    <link rel="icon" href="<?= ICONO_SISTEMA ?>" />

    <!-- Bootstrap 5 -->
    <link href="<?= BOOTSTRAP_CSS ?>" rel="stylesheet">

    <!-- Bootstrap Iconos 5 -->
    <link rel="stylesheet" href="<?= BOOTSTRAP_ICONS ?>">

    <!-- SweetAlert2 -->
    <script src="<?= SWEETALERT ?>"></script>
</head>

<body class="bg-secondary-subtle">

    <?php
    // Incluir navbar
    include "../../../public/views/navbar.php";
    ?>

    <!-- ===================================================== -->
    <!-- CONTENEDOR PRINCIPAL -->
    <!-- ===================================================== -->

    <div class="container-fluid py-4">

        <!-- ================================================= -->
        <!-- ENCABEZADO -->
        <!-- ================================================= -->

        <div class="card shadow-sm border-0 mb-4">

            <div class="card-body">

                <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">

                    <div>
                        <h4 class="mb-1 fw-bold">
                            <i class="bi bi-clock-history me-2"></i>
                            Historial de Nóminas 40 Libras
                        </h4>

                        <p class="text-secondary mb-0">
                            Consulta las nóminas generadas y revisa sus detalles.
                        </p>
                    </div>

                    <div class="d-flex align-items-center gap-2">
                        <span class="badge text-bg-success fs-6 px-3 py-2">
                            <i class="bi bi-check-circle me-1"></i>
                            Nóminas registradas
                        </span>
                        <button type="button" id="btn-estadisticas" class="btn btn-primary btn-sm px-3 py-2 shadow-sm fw-semibold">
                            <i class="bi bi-bar-chart-line-fill me-1"></i>
                            Ver Estadísticas
                        </button>
                    </div>

                </div>

            </div>

        </div>

        <!-- ================================================= -->
        <!-- RESUMEN DE TOTALES (KPI CARDS) -->
        <!-- ================================================= -->

        <div class="row g-3 mb-4">

            <!-- TOTAL NÓMINAS -->
            <div class="col-12 col-sm-6 col-xl-3">
                <div class="card border-0 shadow-sm h-100 border-start border-4 border-primary">
                    <div class="card-body py-3">
                        <div class="d-flex align-items-center">
                            <div class="flex-shrink-0 bg-primary-subtle text-primary p-3 rounded-3 me-3">
                                <i class="bi bi-journal-check fs-4"></i>
                            </div>
                            <div>
                                <h6 class="text-muted fw-semibold mb-1 small text-uppercase">Total Nóminas</h6>
                                <h4 class="fw-bold mb-0 text-primary" id="card-total-nominas">0</h4>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- TOTAL PERCEPCIONES -->
            <div class="col-12 col-sm-6 col-xl-3">
                <div class="card border-0 shadow-sm h-100 border-start border-4 border-success">
                    <div class="card-body py-3">
                        <div class="d-flex align-items-center">
                            <div class="flex-shrink-0 bg-success-subtle text-success p-3 rounded-3 me-3">
                                <i class="bi bi-graph-up-arrow fs-4"></i>
                            </div>
                            <div>
                                <h6 class="text-muted fw-semibold mb-1 small text-uppercase">Total Percepciones</h6>
                                <h4 class="fw-bold text-success mb-0" id="card-total-percepciones">$0.00</h4>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- TOTAL DEDUCCIONES -->
            <div class="col-12 col-sm-6 col-xl-3">
                <div class="card border-0 shadow-sm h-100 border-start border-4 border-warning">
                    <div class="card-body py-3">
                        <div class="d-flex align-items-center">
                            <div class="flex-shrink-0 bg-warning-subtle text-warning p-3 rounded-3 me-3">
                                <i class="bi bi-graph-down-arrow fs-4"></i>
                            </div>
                            <div>
                                <h6 class="text-muted fw-semibold mb-1 small text-uppercase">Total Deducciones</h6>
                                <h4 class="fw-bold text-warning mb-0" id="card-total-deducciones">$0.00</h4>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- TOTAL SUELDO NETO -->
            <div class="col-12 col-sm-6 col-xl-3">
                <div class="card border-0 shadow-sm h-100 border-start border-4 border-info">
                    <div class="card-body py-3">
                        <div class="d-flex align-items-center">
                            <div class="flex-shrink-0 bg-info-subtle text-info p-3 rounded-3 me-3">
                                <i class="bi bi-wallet2 fs-4"></i>
                            </div>
                            <div>
                                <h6 class="text-muted fw-semibold mb-1 small text-uppercase">Sueldo Neto Total</h6>
                                <h4 class="fw-bold text-info mb-0" id="card-total-neto">$0.00</h4>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>


        <!-- ================================================= -->
        <!-- FILTROS -->
        <!-- ================================================= -->

        <div class="card shadow-sm border-0 mb-4">

            <div class="card-body">

                <div class="row g-3 align-items-end">

                    <!-- FILTRO AÑO -->
                    <div class="col-12 col-md-4 col-lg-3">

                        <label for="filtro-anio" class="form-label fw-semibold">
                            Año
                        </label>

                        <select
                            id="filtro-anio"
                            class="form-select">

                        </select>

                    </div>


                    <!-- FILTRO SEMANA -->
                    <div class="col-12 col-md-4 col-lg-3">

                        <label for="filtro-semana" class="form-label fw-semibold">
                            Semana
                        </label>

                        <select
                            id="filtro-semana"
                            class="form-select">

                        </select>

                    </div>


                    <!-- BUSCADOR -->
                    <div class="col-12 col-md-4 col-lg-4">

                        <label for="busqueda-nomina" class="form-label fw-semibold">
                            Buscar
                        </label>

                        <div class="input-group">

                            <span class="input-group-text">
                                <i class="bi bi-search"></i>
                            </span>

                            <input
                                type="text"
                                id="busqueda-nomina"
                                class="form-control"
                                placeholder="Buscar por semana o año...">

                        </div>

                    </div>


                    <!-- BOTÓN LIMPIAR -->
                    <div class="col-12 col-lg-2">

                        <button
                            type="button"
                            id="btn-limpiar-filtros"
                            class="btn btn-outline-secondary w-100">

                            <i class="bi bi-arrow-counterclockwise me-1"></i>
                            Limpiar

                        </button>

                    </div>

                </div>

            </div>

        </div>


        <!-- ================================================= -->
        <!-- TABLA DE NÓMINAS -->
        <!-- ================================================= -->

        <div class="card shadow-sm border-0">

            <div class="card-header  bg-white border-0 py-3">

                <div class="d-flex justify-content-between align-items-center">

                    <div>

                        <h5 class="mb-0 fw-bold">
                            <i class="bi bi-list-ul me-2"></i>
                            Nóminas generadas
                        </h5>

                    </div>

                </div>

            </div>


            <div class="card-body p-0">

                <div class="table-responsive">

                    <table class="table table-hover align-middle mb-0">

                        <thead class="table-success">

                            <tr>

                                <th class="text-center">
                                    #
                                </th>

                                <th>
                                    Año
                                </th>

                                <th>
                                    Semana
                                </th>

                                <th class="text-end">
                                    Percepciones
                                </th>

                                <th class="text-end">
                                    Deducciones
                                </th>

                                <th class="text-end">
                                    Neto
                                </th>

                                <th class="text-center">
                                    Acción
                                </th>

                            </tr>

                        </thead>

                        <tbody id="tbody-historial-nominas">

                            <!-- Los registros se generan con JavaScript -->

                        </tbody>

                    </table>

                </div>

            </div>


            <!-- ================================================= -->
            <!-- PAGINACIÓN -->
            <!-- ================================================= -->

            <div class="card-footer bg-white border-0">

                <nav aria-label="Paginación de nóminas">

                    <ul
                        id="paginacion-nominas"
                        class="pagination justify-content-center mb-0">

                    </ul>

                </nav>

            </div>

        </div>

    </div>


    <!-- ================================================= -->
    <!-- MODAL DE ESTADÍSTICAS -->
    <!-- ================================================= -->

    <div class="modal fade" id="modalEstadisticas" tabindex="-1" aria-labelledby="modalEstadisticasLabel" aria-hidden="true">

        <div class="modal-dialog modal-lg modal-dialog-centered">

            <div class="modal-content border-0 shadow">

                <div class="modal-header bg-primary text-white">

                    <h5 class="modal-title fw-bold" id="modalEstadisticasLabel">
                        <i class="bi bi-bar-chart-line-fill me-2"></i>
                        Estadísticas Generales del Historial
                    </h5>

                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>

                </div>

                <div class="modal-body p-4">

                    <!-- MÉTIS / KPIS EN MODAL -->
                    <div class="row g-3 mb-4">

                        <div class="col-md-4">
                            <div class="p-3 bg-light rounded text-center border">
                                <span class="text-muted small text-uppercase d-block fw-semibold">Nóminas Evaluadas</span>
                                <span class="fs-3 fw-bold text-primary" id="stat-total-nominas">0</span>
                            </div>
                        </div>

                        <div class="col-md-4">
                            <div class="p-3 bg-light rounded text-center border">
                                <span class="text-muted small text-uppercase d-block fw-semibold">Promedio Neto / Nómina</span>
                                <span class="fs-4 fw-bold text-success" id="stat-promedio-neto">$0.00</span>
                            </div>
                        </div>

                        <div class="col-md-4">
                            <div class="p-3 bg-light rounded text-center border">
                                <span class="text-muted small text-uppercase d-block fw-semibold">Promedio Percepciones</span>
                                <span class="fs-4 fw-bold text-dark" id="stat-promedio-percepciones">$0.00</span>
                            </div>
                        </div>

                    </div>

                    <!-- MÁXIMOS Y MÍNIMOS -->
                    <div class="row g-3 mb-4">

                        <div class="col-md-6">
                            <div class="card border-success h-100">
                                <div class="card-header bg-success-subtle text-success fw-bold">
                                    <i class="bi bi-arrow-up-circle me-1"></i> Nómina con Mayor Monto Neto
                                </div>
                                <div class="card-body">
                                    <h4 class="fw-bold text-success" id="stat-max-neto">$0.00</h4>
                                    <p class="mb-0 text-muted" id="stat-max-info">-</p>
                                </div>
                            </div>
                        </div>

                        <div class="col-md-6">
                            <div class="card border-warning h-100">
                                <div class="card-header bg-warning-subtle text-warning fw-bold">
                                    <i class="bi bi-arrow-down-circle me-1"></i> Nómina con Menor Monto Neto
                                </div>
                                <div class="card-body">
                                    <h4 class="fw-bold text-warning" id="stat-min-neto">$0.00</h4>
                                    <p class="mb-0 text-muted" id="stat-min-info">-</p>
                                </div>
                            </div>
                        </div>

                    </div>

                    <!-- RESUMEN FINANCIERO -->
                    <div class="card border-0 bg-light p-3">

                        <h6 class="fw-bold mb-3">
                            <i class="bi bi-pie-chart-fill me-2 text-primary"></i>
                            Resumen Financiero Global (Filtro Actual)
                        </h6>

                        <div class="d-flex justify-content-between border-bottom py-2">
                            <span class="fw-semibold">Total Acumulado de Percepciones:</span>
                            <span class="fw-bold text-success" id="stat-total-percepciones">$0.00</span>
                        </div>

                        <div class="d-flex justify-content-between border-bottom py-2">
                            <span class="fw-semibold">Total Acumulado de Deducciones:</span>
                            <span class="fw-bold text-warning" id="stat-total-deducciones">$0.00</span>
                        </div>

                        <div class="d-flex justify-content-between pt-2">
                            <span class="fw-bold fs-6">Sueldo Neto Total Pagado:</span>
                            <span class="fw-bold fs-5 text-info" id="stat-total-neto">$0.00</span>
                        </div>

                    </div>

                </div>

                <div class="modal-footer bg-light">

                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                        <i class="bi bi-x-circle me-1"></i> Cerrar
                    </button>

                </div>

            </div>

        </div>

    </div>


    <!-- jQuery -->
    <script src="<?= JQUERY_JS ?>"></script>

    <script src="<?= JQUERY_UI_JS ?>"></script>

    <!-- Bootstrap JS -->
    <script src="<?= BOOTSTRAP_JS ?>"></script>

    <script src="../js/historialNominas.js"></script>

</body>

</html>