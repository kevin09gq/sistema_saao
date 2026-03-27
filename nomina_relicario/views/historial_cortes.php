<?php
include "../../config/config.php";
verificarSesion();
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Historial Relicario</title>

    <link href="<?= BOOTSTRAP_CSS ?>" rel="stylesheet">
    <link rel="stylesheet" href="<?= BOOTSTRAP_ICONS ?>">
    <script src="<?= SWEETALERT ?>"></script>
    <link href="../css/historial_cortes.css" rel="stylesheet">
</head>

<body>
    <?php include "../../public/views/navbar.php"; ?>

    <div class="container mt-4">
        
        <div class="header-historial">
            <h2><i class="bi bi-clock-history me-2"></i> Historial de Cortes de Rejas(Relicario)</h2>
            <a href="nomina_relicario.php" class="btn btn-light btn-sm text-success fw-bold">
                <i class="bi bi-arrow-left"></i> Regresar a Nómina
            </a>
        </div>

        <!-- SECCION DE FILTROS -->
        <div class="filtros-card">
            <h5 class="mb-3 text-secondary"><i class="bi bi-funnel"></i> Opciones de Búsqueda</h5>
            <div class="row g-3 align-items-end">
                <div class="col-md-3">
                    <label class="form-label fw-bold">1. Seleccionar Nómina (Año)</label>
                    <select class="form-select" id="filtro_anio">
                        <option value="">Cargando años...</option>
                    </select>
                </div>
                <div class="col-md-3">
                    <label class="form-label fw-bold">2. Filtrar por Mes</label>
                    <select class="form-select" id="filtro_mes">
                        <option value="">Todos los meses</option>
                    </select>
                </div>
                <div class="col-md-3">
                    <label class="form-label fw-bold">3. Filtrar por Semana</label>
                    <select class="form-select" id="filtro_semana">
                        <option value="">Todas las semanas</option>
                    </select>
                </div>
                <div class="col-md-3">
                    <button class="btn btn-success w-100 fw-bold" id="btn_buscar">
                        <i class="bi bi-search"></i> Buscar Historial
                    </button>
                </div>
            </div>
        </div>

        <!-- SECCION DE RESULTADOS -->
        <div class="kpi-container" id="panel_resultados" style="display: none;">
            <div class="kpi-box">
                <div class="kpi-title">Total de Rejas Cortadas</div>
                <div class="kpi-value" id="res_total_rejas">0</div>
            </div>
            <div class="kpi-box success">
                <div class="kpi-title">Dinero Total Generado</div>
                <div class="kpi-value" id="res_total_dinero">$0.00</div>
            </div>
            <div class="kpi-box warning">
                <div class="kpi-title">Mesa / Tabla con Más Cortes</div>
                <div class="kpi-value fs-4" id="res_mejor_tabla">-</div>
            </div>
        </div>

        <div class="row" id="panel_desglose_completo" style="display: none;">
            <!-- Desglose de Folios -->
            <div class="col-12 mb-4">
                <div class="table-responsive h-100" id="panel_tabla">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h5 class="m-0 text-secondary"><i class="bi bi-list-columns"></i> Desglose Detallado de Cortes</h5>
                        <div>
                            <button class="btn btn-warning btn-sm me-2 fw-bold" id="btn_ver_ranking" onclick="abrirModalRanking()">
                                <i class="bi bi-trophy text-dark"></i> Ranking de Tablas
                            </button>
                            <button class="btn btn-danger btn-sm fw-bold" id="btn_exportar_pdf" onclick="exportarPDF()">
                                <i class="bi bi-file-earmark-pdf"></i> Exportar PDF
                            </button>
                        </div>
                    </div>
                    
                    <table class="dataTable table-hover" id="tabla_datos">
                        <thead>
                            <tr>
                                <th>Nómina (Sem/Año)</th>
                                <th>Folio</th>
                                <th>Fecha de Corte</th>
                                <th>Cortador</th>
                                <th>Tablas Involucradas</th>
                                <th>Total Rejas</th>
                                <th>Opciones</th>
                            </tr>
                        </thead>
                        <tbody id="tbody_historial">
                            <!-- Dinamico -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

    </div>

    <!-- Modal Detalles Bonito -->
    <div class="modal fade" id="modalDetalleCorte" tabindex="-1" aria-labelledby="modalDetalleCorteLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content" style="border: none; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
                <div class="modal-header modal-detalles-header">
                    <h5 class="modal-title modal-detalles-title" id="modalDetalleCorteLabel">
                        <i class="bi bi-receipt me-2"></i> Folio <span id="det_folio" class="text-warning"></span>
                    </h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body p-4 bg-light">
                    
                    <div class="info-card">
                        <div class="info-card-item">
                            <strong>Nómina:</strong> <span id="det_nomina" class="text-primary fw-bold"></span>
                        </div>
                        <div class="info-card-item">
                            <strong>Fecha:</strong> <span id="det_fecha"></span>
                        </div>
                        <div class="info-card-item mb-0">
                            <strong>Cortador:</strong> <span id="det_cortador" class="fw-bold"></span>
                        </div>
                    </div>
                    
                    <div class="row gx-2 mb-4">
                        <div class="col-4">
                            <div class="kpi-mini-card">
                                <div class="kpi-mini-title">Precio/Reja</div>
                                <div class="kpi-mini-val val-dark" id="det_precio">$0.00</div>
                            </div>
                        </div>
                        <div class="col-4">
                            <div class="kpi-mini-card">
                                <div class="kpi-mini-title">Total Rejas</div>
                                <div class="kpi-mini-val val-primary" id="det_rejas">0</div>
                            </div>
                        </div>
                        <div class="col-4">
                            <div class="kpi-mini-card">
                                <div class="kpi-mini-title">Ganancia</div>
                                <div class="kpi-mini-val val-success" id="det_ganancia">$0.00</div>
                            </div>
                        </div>
                    </div>
                    
                    <h6 class="fw-bold text-secondary mb-3"><i class="bi bi-diagram-3 me-2"></i> Desglose por Tablas</h6>
                    <table class="table table-custom-modal text-center w-100">
                        <thead>
                            <tr>
                                <th>Tabla</th>
                                <th>Rejas Extraídas</th>
                            </tr>
                        </thead>
                        <tbody id="det_tbody_tablas">
                            <!-- JS fill -->
                        </tbody>
                    </table>
                </div>
                <div class="modal-footer bg-white border-top-0 pt-0 pb-3 pe-4">
                    <button type="button" class="btn btn-outline-secondary px-4 fw-bold rounded-pill" data-bs-dismiss="modal">Cerrar</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal Ranking de Tablas -->
    <div class="modal fade" id="modalRankingTablas" tabindex="-1" aria-labelledby="modalRankingTablasLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div class="modal-content" style="border: none; border-radius: 15px; box-shadow: 0 15px 35px rgba(0,0,0,0.2);">
                <div class="modal-header border-bottom-0 pb-0 pt-4 px-4" style="background: linear-gradient(to right, #ffffff, #f8f9fa);">
                    <h4 class="modal-title fw-bold text-dark w-100 d-flex justify-content-between align-items-center" id="modalRankingTablasLabel">
                        <span><i class="bi bi-trophy-fill text-warning me-2 fs-3" style="filter: drop-shadow(0 2px 4px rgba(255,193,7,.4));"></i> Producción por Tablas</span>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </h4>
                </div>
                <div class="modal-body p-0">
                    <!-- Vista Principal de Ranking -->
                    <div id="vista_ranking_principal">
                        <div class="d-flex justify-content-between align-items-center px-4 py-3 bg-white border-bottom sticky-top" style="z-index: 10;">
                            <span class="text-secondary fw-bold fs-6"><i class="bi bi-sort-down"></i> Ordenar por:</span>
                            <div class="btn-group shadow-sm" role="group">
                                <button type="button" class="btn btn-sm btn-primary fw-bold px-3 active" id="btnSortDesc" onclick="ordenarRanking('desc')">Más Cortes <i class="bi bi-arrow-down"></i></button>
                                <button type="button" class="btn btn-sm btn-outline-primary fw-bold px-3" id="btnSortAsc" onclick="ordenarRanking('asc')">Menos Cortes <i class="bi bi-arrow-up"></i></button>
                            </div>
                        </div>
                        <div class="p-4" style="background-color: #f8f9fa; min-height: 300px;">
                            <table class="table table-custom-modal table-hover text-center mb-0 w-100">
                                <thead style="background-color: #e9ecef;">
                                    <tr>
                                        <th style="width: 15%; border-top-left-radius: 8px;">Top / Lugar</th>
                                        <th>Número de Tabla</th>
                                        <th>Rejas Extraídas</th>
                                        <th style="width: 25%; border-top-right-radius: 8px;">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody id="tbody_modal_ranking" class="bg-white">
                                    <!-- JS Fill -->
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <!-- Vista de Detalles por Tabla -->
                    <div id="vista_ranking_detalles" style="display: none; padding: 25px; padding-bottom: 80px; background-color: #f8f9fa;">
                        <div class="d-flex justify-content-between align-items-center mb-4">
                            <button class="btn btn-sm btn-white border shadow-sm fw-bold text-secondary" onclick="volverARanking()">
                                <i class="bi bi-arrow-left"></i> Regresar al Ranking
                            </button>
                            <button class="btn btn-sm btn-danger shadow-sm fw-bold px-3" onclick="exportarDesgloseTablaPDF()">
                                <i class="bi bi-file-earmark-pdf"></i> Exportar Desglose
                            </button>
                        </div>
                        
                        <div class="info-card bg-white shadow-sm border-0 mb-4">
                            <h5 class="fw-bold text-primary mb-0 d-flex align-items-center" id="titulo_detalles_tabla">
                                <i class="bi bi-table me-2"></i> Detalles de Tabla
                            </h5>
                        </div>
                        
                        <div class="table-custom-modal">
                            <table class="table table-hover text-center mb-0 w-100">
                                <thead>
                                    <tr>
                                        <th>Fecha del Corte</th>
                                        <th>Folio</th>
                                        <th>Cortador / Empleado</th>
                                        <th class="text-primary head-rejas">Rejas Aportadas</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody id="tbody_detalles_especificos">
                                    <!-- JS Fill -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div class="modal-footer border-top-0 pt-0 pb-4 pe-4 bg-light">
                    <button type="button" class="btn btn-secondary px-5 fw-bold rounded-pill shadow-sm" data-bs-dismiss="modal">Cerrar Ventana</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Bibliotecas JS -->
    <script src="<?= JQUERY_JS ?>"></script>
    <script src="<?= BOOTSTRAP_JS ?>"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js"></script>
    <script src="../js/historial/historial_v3.js"></script>
</body>
</html>
