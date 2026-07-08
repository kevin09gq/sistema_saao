<?php
require_once __DIR__ . '/../../config/config.php';
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

    <style>
        /*
        En navbar_styles.css se habilitó abrir dropdowns con hover en escritorio.
        Para los 3 puntitos de acciones en tabla, queremos SOLO click.
        */
        @media (min-width: 992px) {
            .tb-action-dropdown:hover>.dropdown-menu:not(.show) {
                display: none !important;
            }

            .tb-action-dropdown>.dropdown-menu.show {
                display: block !important;
            }
        }
    </style>
</head>

<body>
    <?php require_once __DIR__ . '/../../public/views/navbar.php'; ?>

    <div class="container-fluid bg-light py-4">
        <div class="container">
            <!-- Título y Botón -->
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2 class="fw-bold">Historial de Vales de Corte</h2>
                <button type="button" class="btn btn-primary fw-bold" id="btn_agregar_extra">
                    <i class="bi bi-plus-lg"></i> Agregar
                </button>
            </div>

            <!-- Sección de Filtrado -->
            <div class="card mb-4 shadow-sm">
                <div class="card-body">
                    <h5 class="text-muted mb-3"><i class="bi bi-funnel me-2"></i>Opciones de Búsqueda</h5>

                    <form class="row g-3" id="form_filtros">
                        <div class="col-md-3">
                            <label class="form-label fw-bold" for="select_rancho">Seleccionar Rancho</label>
                            <select class="form-select" id="select_rancho">
                                <option selected>-- Selecciona --</option>
                                <option value="1">Rancho El Relicario</option>
                                <option value="2">Rancho Pilar</option>
                            </select>
                        </div>
                        <div class="col-md-3">
                            <label class="form-label fw-bold" for="select_anio">Seleccionar Año</label>
                            <select class="form-select" id="select_anio">
                                <option selected>-- Selecciona --</option>
                                <option value="2026">2026</option>
                            </select>
                        </div>
                        <div class="col-md-3">
                            <label class="form-label fw-bold" for="select_mes">Seleccionar Mes</label>
                            <select class="form-select" id="select_mes">
                                <option selected>-- Selecciona --</option>
                                <option value="6">Junio</option>
                            </select>
                        </div>
                        <div class="col-md-3">
                            <label class="form-label fw-bold" for="input_semana">Seleccionar Semana</label>
                            <input type="number" class="form-control" id="input_semana" placeholder="Semana">
                        </div>
                        <div class="text-center">
                            <button type="submit" class="btn btn-success fw-bold" id="btn_filtrar">
                                <i class="bi bi-search me-2"></i>Buscar Historial
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <!-- Tarjetas de Resumen - Estilo Moderno -->
            <div class="row mb-4" id="seccion_tarjetas_resumen">
                <!-- Total Rejas -->
                <div class="col-md-4">
                    <div class="card shadow-sm h-100" id="card_total_rejas_extra">
                        <div class="card-body d-flex align-items-center">
                            <div class="bg-success bg-opacity-10 p-3 rounded-3 me-3 text-success">
                                <i class="bi bi-box-seam fs-4"></i>
                            </div>
                            <div>
                                <h6 class="text-muted mb-0">Total Rejas</h6>
                                <p class="fs-4 fw-bold mb-0">1,250</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Total Gastos -->
                <div class="col-md-4">
                    <div class="card shadow-sm h-100" id="card_total_gastos_extra">
                        <div class="card-body d-flex align-items-center">
                            <div class="bg-danger bg-opacity-10 p-3 rounded-3 me-3 text-danger">
                                <i class="bi bi-cash-stack fs-4"></i>
                            </div>
                            <div>
                                <h6 class="text-muted mb-0">Total Gastos</h6>
                                <p class="fs-4 fw-bold mb-0">$ 45,200.00</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Tabla con más rejas -->
                <div class="col-md-4">
                    <div class="card shadow-sm h-100" id="card_tabla_mayor_extra">
                        <div class="card-body d-flex align-items-center">
                            <div class="bg-warning bg-opacity-10 p-3 rounded-3 me-3 text-warning">
                                <i class="bi bi-grid-3x3-gap fs-4"></i>
                            </div>
                            <div>
                                <h6 class="text-muted mb-0">Mayor Producción</h6>
                                <p class="fs-4 fw-bold mb-0">Sector A-4</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tabla de Resultados en Card -->
            <div class="card shadow-sm mb-5" id="seccion_tabla_resultados">
                <!-- Header del card con título y acciones -->
                <div class="card-header bg-white py-3">
                    <div class="d-flex justify-content-between align-items-center">
                        <h5 class="mb-0 fw-bold">Desglose Detallado de Cortes</h5>
                        <div>
                            <button type="button" class="btn btn-sm btn-warning fw-bold me-2" id="btn_ranking_extra">
                                <i class="bi bi-bar-chart"></i> Ranking
                            </button>
                            <button type="button" class="btn btn-sm btn-danger fw-bold" id="btn_exportar_pdf_extra">
                                <i class="bi bi-file-pdf"></i> Exportar PDF
                            </button>
                        </div>
                    </div>
                </div>

                <div class="card-body">
                    <table class="table table-hover align-middle" id="tabla_vales_extra">
                        <thead class="table-light">
                            <tr>
                                <th>N</th>
                                <th>Nómina</th>
                                <th>Folio</th>
                                <th>Estado</th>
                                <th>Fecha de Corte</th>
                                <th>Cortador</th>
                                <th>Tablas Involucradas</th>
                                <th>Total Rejas</th>
                                <th>Opciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>1</td>
                                <td>Sem 21 / 2026</td>
                                <td>VAL-001</td>
                                <td><span class="badge bg-success">Activo</span></td>
                                <td>25/Junio/2026</td>
                                <td>Juan Pérez</td>
                                <td>Sector A-1, A-2</td>
                                <td>450</td>
                                <td>
                                    <div class="dropdown tb-action-dropdown">
                                        <button class="btn btn-sm btn-light border-0" type="button" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false">
                                            <i class="bi bi-three-dots-vertical"></i>
                                        </button>
                                        <ul class="dropdown-menu shadow pointer-events-auto">
                                            <li>
                                                <button class="dropdown-item text-primary">
                                                    <i class="bi bi-eye me-2"></i>Ver detalles
                                                </button>
                                            </li>
                                            <li>
                                                <button class="dropdown-item text-primary">
                                                    <i class="bi bi-pencil-fill me-2"></i>Modificar
                                                </button>
                                            </li>
                                            <li>
                                                <button class="dropdown-item text-primary">
                                                    <i class="bi bi-x-circle me-2"></i>Cancelar
                                                </button>
                                            </li>
                                            <li>
                                                <button class="dropdown-item text-danger">
                                                    <i class="bi bi-file-earmark-pdf me-2"></i>Exportar PDF
                                                </button>
                                            </li>
                                        </ul>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td>2</td>
                                <td class="text-muted"><em>Pendiente</em></td>
                                <td>VAL-002</td>
                                <td><span class="badge bg-danger">Cancelado</span></td>
                                <td>26/Junio/2026</td>
                                <td>María López</td>
                                <td>Sector B-1</td>
                                <td>320</td>
                                <td>
                                    <button class="btn btn-sm btn-outline-warning"><i class="bi bi-pencil"></i></button>
                                    <button class="btn btn-sm btn-outline-danger"><i class="bi bi-trash"></i></button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>


    <!-- Bibliotecas JS -->
    <script src="<?= JQUERY_JS ?>"></script>
    <script src="<?= BOOTSTRAP_JS ?>"></script>

</body>

</html>