<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Historial de Cortes Relicario</title>
    <?php
    include "../../config/config.php";
    verificarSesion(); // Proteger esta página
    ?>
    <link href="<?= BOOTSTRAP_CSS ?>" rel="stylesheet">
    <link rel="stylesheet" href="<?= BOOTSTRAP_ICONS ?>">
    <link rel="stylesheet" href="../css/historial_cortes.css">
</head>
<body>
    <?php include "../../public/views/navbar.php"; ?>

    <div class="container mt-4">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h3><i class="bi bi-clock-history me-2"></i>Historial de Cortes Relicario</h3>
            <a href="nomina_relicario.php" class="btn btn-outline-secondary">
                <i class="bi bi-arrow-left me-2"></i>Volver a Nómina
            </a>
        </div>

        <div class="filters-container">
            <div class="row g-3">
                <div class="col-md-4">
                    <label for="select_anio" class="form-label fw-bold">Filtrar por Año</label>
                    <select id="select_anio" class="form-select shadow-sm">
                        <option value="">Seleccione un año...</option>
                    </select>
                </div>
                <div class="col-md-4">
                    <label for="select_semana" class="form-label fw-bold">Filtrar por Semana</label>
                    <select id="select_semana" class="form-select shadow-sm" disabled>
                        <option value="">Seleccione primero el año...</option>
                    </select>
                </div>
                <div class="col-md-4 d-flex align-items-end">
                    <button id="btn_buscar_cortes" class="btn btn-success w-100 shadow-sm" disabled>
                        <i class="bi bi-search me-2"></i>Consultar Historial
                    </button>
                </div>
            </div>
        </div>

        <div class="cortes-table-container">
            <div class="table-responsive">
                <table class="table table-hover table-cortes align-middle" id="tabla_cortes">
                    <thead>
                        <tr>
                            <th>Folio</th>
                            <th>Nombre del Cortador</th>
                            <th>Fecha de Corte</th>
                            <th>Precio/Reja</th>
                            <th class="text-center">Total Rejas</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="lista_cortes">
                        <tr>
                            <td colspan="6" class="text-center text-muted py-5">
                                <i class="bi bi-funnel fs-1 d-block mb-3"></i>
                                Seleccione los filtros superiores para cargar el historial de cortes.
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <!-- Modal de Detalles del Corte (Soporta múltiples tablas y cortadores) -->
    <div class="modal fade" id="modal_detalles_corte" tabindex="-1" aria-labelledby="modalDetallesLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-scrollable">
            <div class="modal-content border-0 shadow-lg">
                <div class="modal-header details-modal-header border-0">
                    <h5 class="modal-title fw-bold" id="modalDetallesLabel">
                        <i class="bi bi-receipt-cutoff me-2"></i>DETALLES COMPLETOS DEL CORTE
                    </h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body p-4">
                    <div id="corte_info_header">
                        <!-- Se llena dinámicamente -->
                    </div>
                    
                    <div class="mt-4">
                        <h6 class="text-uppercase fw-bold text-muted mb-3"><i class="bi bi-grid-3x3-gap me-2"></i>Desglose Detallado por Tablas</h6>
                        <div class="table-responsive">
                            <table class="table table-hover border">
                                <thead class="table-light">
                                    <tr>
                                        <th class="text-center py-3">Ubicación (Tabla)</th>
                                        <th class="text-center py-3">Producción (Rejas)</th>
                                    </tr>
                                </thead>
                                <tbody id="lista_tablas_corte">
                                    <!-- Se llena dinámicamente -->
                                </tbody>
                                <tfoot id="total_tablas_footer">
                                    <!-- Se llena dinámicamente -->
                                </tfoot>
                            </table>
                        </div>
                    </div>
                </div>
                <div class="modal-footer bg-light border-0">
                    <button type="button" class="btn btn-secondary px-4" data-bs-dismiss="modal">Cerrar</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Scripts -->
    <script src="<?= JQUERY_JS ?>"></script>
    <script src="<?= BOOTSTRAP_JS ?>"></script>
    <script src="<?= SWEETALERT ?>"></script>
    <script src="../js/historial_cortes.js"></script>
</body>
</html>
