<?php
include "../../config/config.php";
verificarSesion();
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Historial Podas - Relicario</title>

    <link href="<?= BOOTSTRAP_CSS ?>" rel="stylesheet">
    <link rel="stylesheet" href="<?= BOOTSTRAP_ICONS ?>">
    <script src="<?= SWEETALERT ?>"></script>
    <link href="../css/historial_cortes.css" rel="stylesheet">

    <style>
        /* Estilos para el selector de tipo de nómina */
        .header-historial {
            background: linear-gradient(135deg, #1e7e34 0%, #28a745 100%) !important;
        }

        .nomina-selector {
            display: flex;
            gap: 15px;
            margin-bottom: 25px;
        }

        .btn-selector {
            padding: 10px 20px;
            border-radius: 50px;
            font-weight: 600;
            text-decoration: none;
            transition: all 0.3s ease;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .btn-selector.active {
            background-color: #28a745;
            color: white;
            border: 2px solid #28a745;
        }

        .btn-selector.inactive {
            background-color: white;
            color: #6c757d;
            border: 2px solid #dee2e6;
        }

        .btn-selector:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
        }

        .kpi-box {
            border-left-color: #28a745 !important;
        }

        .kpi-mini-card {
            border-top: 4px solid #28a745;
        }
    </style>
</head>

<body>
    <?php include "../../public/views/navbar.php"; ?>

    <div class="container mt-4">

        <div class="header-historial">
            <h2><i class="bi bi-clock-history me-2"></i> Historial de Nóminas (Relicario)</h2>
            <a href="nomina_relicario.php" class="btn btn-light btn-sm text-success fw-bold">
                <i class="bi bi-arrow-left"></i> Regresar a Nómina
            </a>
        </div>

        <!-- SELECTOR DE TIPO DE NÓMINA -->
        <div class="nomina-selector">
            <a href="historial_cortes.php" class="btn-selector inactive">
                <i class="bi bi-truck"></i> Nómina de Corte
            </a>
            <a href="historial_podas.php" class="btn-selector active">
                <i class="bi bi-scissors"></i> Nómina de Poda
            </a>
        </div>

        <!-- SECCION DE FILTROS -->
        <div class="filtros-card mb-4">
            <h5 class="mb-3 text-secondary"><i class="bi bi-funnel"></i> Opciones de Búsqueda (Podas)</h5>
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
                <div class="kpi-title">Total de Árboles Podados</div>
                <div class="kpi-value" id="res_total_arboles">0</div>
            </div>
            <div class="kpi-box success">
                <div class="kpi-title">Inversión Total en Podas</div>
                <div class="kpi-value" id="res_total_dinero">$0.00</div>
            </div>
        </div>

        <div class="row" id="panel_desglose_completo" style="display: none;">
            <div class="col-12 mb-4">
                <!-- SUB-MENU DE PESTAÑAS -->
                <div class="d-flex justify-content-between align-items-center mb-4 bg-white p-2 rounded-3 shadow-sm border">
                    <ul class="nav nav-pills" id="pills-tab" role="tablist">
                        <li class="nav-item" role="presentation">
                            <button class="nav-link active fw-bold" id="tab-poda-solo" type="button" onclick="cambiarTab('poda')">
                                <i class="bi bi-scissors"></i> Solo Podas
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link fw-bold text-warning" id="tab-extras" type="button" onclick="cambiarTab('extras')">
                                <i class="bi bi-plus-circle-fill"></i> Solo Extras
                            </button>
                        </li>
                    </ul>
                    <div class="d-flex gap-2">
                        <button class="btn btn-warning btn-sm fw-bold shadow-sm" id="btn_ver_ranking" onclick="abrirModalRanking()">
                            <i class="bi bi-trophy-fill"></i> Ver Ranking
                        </button>
                        <button class="btn btn-danger btn-sm fw-bold shadow-sm" onclick="exportarPDF()">
                            <i class="bi bi-file-earmark-pdf-fill"></i> Exportar PDF
                        </button>
                    </div>
                </div>

                <div class="table-responsive h-100" id="panel_tabla">
                    <h5 class="mb-3 text-secondary" id="titulo_seccion_tabla"><i class="bi bi-list-columns"></i> Desglose Detallado</h5>
                    <table class="dataTable table-hover" id="tabla_datos">
                        <thead id="thead_historial">
                            <!-- Dinámico según Tab -->
                        </thead>
                        <tbody id="tbody_historial">
                            <!-- Dinámico -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

    </div>

    <!-- Modal Detalles Poda -->
    <div class="modal fade" id="modalDetallePoda" tabindex="-1" aria-labelledby="modalDetallePodaLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-centered">
            <div class="modal-content" style="border: none; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
                <div class="modal-header modal-detalles-header" style="background: linear-gradient(135deg, #1e7e34 0%, #28a745 100%); color: white;">
                    <h5 class="modal-title modal-detalles-title" id="modalDetallePodaLabel">
                        <i class="bi bi-scissors me-2"></i> Detalles de Poda - <span id="det_empleado" class="text-warning"></span>
                    </h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body p-4 bg-light">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <button class="btn btn-sm btn-white border shadow-sm fw-bold text-secondary" id="btn_regresar_ranking" style="display: none;" onclick="regresarAlRanking()">
                            <i class="bi bi-arrow-left"></i> Regresar al Ranking
                        </button>
                        <button class="btn btn-sm btn-danger shadow-sm fw-bold px-3 ms-auto" id="btn_pdf_detalle_modal">
                            <i class="bi bi-file-earmark-pdf"></i> Exportar PDF
                        </button>
                    </div>

                    <div class="info-card">
                        <div class="info-card-item">
                            <strong>Nómina:</strong> <span id="det_nomina" class="text-primary fw-bold"></span>
                        </div>
                    </div>

                    <div class="row gx-2 mb-4">
                        <div class="col-6">
                            <div class="kpi-mini-card">
                                <div class="kpi-mini-title">Total Árboles</div>
                                <div class="kpi-mini-val text-success" id="det_arboles">0</div>
                            </div>
                        </div>
                        <div class="col-6">
                            <div class="kpi-mini-card">
                                <div class="kpi-mini-title">Monto Total</div>
                                <div class="kpi-mini-val text-primary" id="det_total">$0.00</div>
                            </div>
                        </div>
                    </div>

                    <h6 class="fw-bold text-secondary mb-3"><i class="bi bi-list-task me-2"></i> Movimientos Diarios</h6>
                    <table class="table table-custom-modal text-center w-100">
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Concepto</th>
                                <th>Árboles</th>
                                <th>Pago por árbol</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody id="det_tbody_movimientos">
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

    <!-- Modal Ranking de Podadores -->
    <div class="modal fade" id="modalRankingPodadores" tabindex="-1" aria-labelledby="modalRankingLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
            <div class="modal-content" style="border: none; border-radius: 15px; box-shadow: 0 15px 35px rgba(0,0,0,0.2);">
                <div class="modal-header border-bottom-0 pb-0 pt-4 px-4" style="background: linear-gradient(to right, #ffffff, #f8f9fa);">
                    <h4 class="modal-title fw-bold text-dark w-100 d-flex justify-content-between align-items-center" id="modalRankingLabel">
                        <span><i class="bi bi-trophy-fill text-warning me-2 fs-3"></i> Ranking de Podadores</span>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </h4>
                </div>
                <div class="modal-body p-0">
                    <div class="d-flex justify-content-between align-items-center px-4 py-3 bg-white border-bottom sticky-top" style="z-index: 10;">
                        <span class="text-secondary fw-bold fs-6"><i class="bi bi-sort-down"></i> Ordenar por eficiencia:</span>
                        <div class="btn-group shadow-sm" role="group">
                            <button type="button" class="btn btn-sm btn-success fw-bold px-3 active" id="btnSortDesc" onclick="ordenarRanking('desc')">Más Árboles <i class="bi bi-arrow-down"></i></button>
                            <button type="button" class="btn btn-sm btn-outline-success fw-bold px-3" id="btnSortAsc" onclick="ordenarRanking('asc')">Menos Árboles <i class="bi bi-arrow-up"></i></button>
                        </div>
                    </div>
                    <div class="p-4" style="background-color: #f8f9fa;">
                        <table class="table table-custom-modal table-hover text-center mb-0 w-100">
                            <thead style="background-color: #e9ecef;">
                                <tr>
                                    <th style="width: 15%;">Puesto</th>
                                    <th>Podador / Empleado</th>
                                    <th>Total Árboles</th>
                                    <th style="width: 25%;">Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="tbody_modal_ranking" class="bg-white">
                                <!-- JS Fill -->
                            </tbody>
                        </table>
                    </div>
                </div>
                <div class="modal-footer border-top-0 pt-0 pb-4 pe-4 bg-light">
                    <button type="button" class="btn btn-secondary px-5 fw-bold rounded-pill shadow-sm" data-bs-dismiss="modal">Cerrar</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Bibliotecas JS -->
    <script src="<?= JQUERY_JS ?>"></script>
    <script src="<?= BOOTSTRAP_JS ?>"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js"></script>
    <script src="../js/historial/historial_podas.js"></script>
</body>

</html>
