<?php
require_once __DIR__ . '/../../config/config.php';
verificarSesion();
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Historial Cortes - Ranchos</title>

    <link href="<?= BOOTSTRAP_CSS ?>" rel="stylesheet">
    <link rel="stylesheet" href="<?= BOOTSTRAP_ICONS ?>">

    <script src="<?= SWEETALERT ?>"></script>

    <script>
        const rutaRaiz = '<?= $rutaRaiz ?>';
    </script>

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
                <button type="button" class="btn btn-primary fw-bold" id="btn_nuevo_vale">
                    <i class="bi bi-plus-lg"></i> Agregar
                </button>
            </div>

            <!-- Sección de Filtrado -->
            <div class="card mb-4 shadow-sm">
                <div class="card-body">
                    <h5 class="text-muted mb-3"><i class="bi bi-funnel me-2"></i>Opciones de Búsqueda</h5>

                    <form class="row g-3" id="form_filtros">
                        <div class="col-md-3">
                            <label class="form-label fw-bold" for="select_rancho">Seleccionar Rancho *</label>
                            <select class="form-select" id="select_rancho">
                                <option value="-1" selected>--- Seleccionar ---</option>
                            </select>
                        </div>
                        <div class="col-md-3">
                            <label class="form-label fw-bold" for="select_anio">Seleccionar Año</label>
                            <select class="form-select" id="select_anio">
                                <option value="-1" selected>--- Seleccionar ---</option>
                            </select>
                        </div>
                        <div class="col-md-3">
                            <label class="form-label fw-bold" for="select_mes">Seleccionar Mes</label>
                            <select class="form-select" id="select_mes">
                                <option value="-1" selected>--- Seleccionar ---</option>
                            </select>
                        </div>
                        <div class="col-md-3">
                            <label class="form-label fw-bold" for="input_semana">Seleccionar Semana</label>
                            <select class="form-select" id="select_semana">
                                <option value="-1" selected>--- Seleccionar ---</option>
                            </select>
                        </div>
                        <div class="text-center">
                            <button type="submit" class="btn btn-success fw-bold" id="btn_filtrar">
                                <i class="bi bi-search me-2"></i>Buscar Historial
                            </button>
                        </div>
                        <span class="my-0 text-muted">* Campo obligatorio</span>
                    </form>
                </div>
            </div>

            <!-- Tarjetas de Resumen - Estilo Moderno -->
            <div class="row mb-4 d-none" id="seccion_tarjetas_resumen">
                <!-- Total Rejas -->
                <div class="col-md-4">
                    <div class="card shadow-sm h-100" id="card_total_rejas_extra">
                        <div class="card-body d-flex align-items-center">
                            <div class="bg-success bg-opacity-10 p-3 rounded-3 me-3 text-success">
                                <i class="bi bi-box-seam fs-4"></i>
                            </div>
                            <div>
                                <h6 class="text-muted mb-0">Total Rejas</h6>
                                <p class="fs-4 fw-bold mb-0" id="label_total_rejas_general">1,250</p>
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
                                <p class="fs-4 fw-bold mb-0" id="label_total_gastos_general">$ 45,200.00</p>
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
                                <p class="fs-4 fw-bold mb-0" id="label_tabla_mas_rejas_general">T4 / 1,250 rejas</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tabla de Resultados en Card -->
            <div class="card shadow-sm mb-5 d-none" id="seccion_tabla_resultados">
                <!-- Header del card con título y acciones -->
                <div class="card-header bg-white py-3">
                    <div class="d-flex justify-content-between align-items-center">
                        <h5 class="mb-0 text-muted"><i class="bi bi-list-columns-reverse me-2"></i>Desglose Detallado de Cortes</h5>
                        <div>
                            <button type="button" class="btn btn-sm btn-warning fw-bold shadow-sm" id="btn_ranking_extra">
                                <i class="bi bi-trophy me-2"></i>Ranking
                            </button>
                            <button type="button" class="btn btn-sm btn-danger fw-bold shadow-sm" id="btn_exportar_pdf_extra">
                                <i class="bi bi-file-pdf me-2"></i>PDF
                            </button>
                            <button type="button" class="btn btn-sm btn-success fw-bold shadow-sm" id="btn_exportar_excel">
                                <i class="bi bi-file-excel me-2"></i>Excel
                            </button>
                        </div>
                    </div>
                </div>

                <div class="card-body">
                    <div class="row g-2 mb-3 align-items-center justify-content-between">
                        <!-- Bloque de selects alineados a la izquierda -->
                        <div class="col-md-6 d-flex">
                            <!-- Select de límite -->
                            <div class="me-3">
                                <label class="form-label me-2" for="select_limite">Límite:</label>
                                <select class="form-select form-select-sm shadow-sm" id="select_limite">
                                    <option value="10" selected>10</option>
                                    <option value="25">25</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                    <option value="-1">Todos</option>
                                </select>
                            </div>

                            <!-- Select de columna -->
                            <div class="me-3">
                                <label class="form-label me-2" for="select_columna">Ordenar por:</label>
                                <select class="form-select form-select-sm shadow-sm" id="select_columna">
                                    <option value="folio">Folio</option>
                                    <option value="fecha_corte">Fecha Corte</option>
                                    <option value="nombre_cortador">Cortador (Nombre)</option>
                                    <option value="total_rejas">Total Rejas</option>
                                </select>
                            </div>

                            <!-- Select de dirección -->
                            <div>
                                <label class="form-label me-2" for="select_direccion">Dirección:</label>
                                <select class="form-select form-select-sm shadow-sm" id="select_direccion">
                                    <option value="ASC" selected>Ascendente</option>
                                    <option value="DESC">Descendente</option>
                                </select>
                            </div>
                        </div>

                        <!-- Input de total rejas alineado a la derecha -->
                        <div class="col-md-1 text-end">
                            <label class="form-label" for="total_rejas_visual">Total Rejas:</label>
                            <input type="text" class="form-control form-control-sm shadow-sm" id="total_rejas_visual" readonly>
                        </div>
                    </div>


                    <table class="table table-sm table-hover align-middle mb-3" id="tabla_vales_extra">
                        <thead class="table-light">
                            <tr>
                                <th class="fw-normal text-muted text-center">N°</th>
                                <th class="fw-normal text-muted">Nómina</th>
                                <th class="fw-normal text-muted">Folio</th>
                                <th class="fw-normal text-muted">Fecha Corte</th>
                                <th class="fw-normal text-muted">Nombre Cabo</th>
                                <th class="fw-normal text-muted">Tablas Involucradas</th>
                                <th class="fw-normal text-muted text-center">Total Rejas</th>
                                <th class="fw-normal text-muted text-end">Precio Rejas</th>
                                <th class="fw-normal text-muted text-end">Total Efectivo</th>
                                <th class="fw-normal text-muted text-center">Estado</th>
                                <th class="fw-normal text-muted text-center">Cont</th>
                                <th class="fw-normal text-muted text-center">Opc</th>
                            </tr>
                        </thead>
                        <tbody id="cuerpo_tabla_historial_corte">
                            <!-- Los datos de la tabla se llenarán dinámicamente mediante JavaScript -->
                        </tbody>
                    </table>

                    <!-- Paginación -->
                    <nav aria-label="Page navigation" id="contenedor-paginacion">
                        <ul class="pagination justify-content-end" id="paginacion">
                            <!-- Se genera dinámicamente -->
                        </ul>
                    </nav>

                    <!-- Contenedor para almacenar la página actual -->
                    <div id="pagina-actual" data-pagina="1" style="display:none;"></div>
                </div>
            </div>
        </div>

        <!-- IMPORTAR LOS MODALES -->
        <?php require_once __DIR__ . '/modal_detalles_corte.php'; ?>
        <?php require_once __DIR__ . '/modal_nuevo_vale.php'; ?>
        <?php require_once __DIR__ . '/modal_editar_vale.php'; ?>
        <?php require_once __DIR__ . '/modal_ranking.php'; ?>
    </div>

    <!-- Bibliotecas JS -->
    <script src="<?= JQUERY_JS ?>"></script>
    <script src="<?= BOOTSTRAP_JS ?>"></script>

    <!-- Script personalizado para la página -->
    <script src="../js/historial_corte.js"></script>
    <script src="../js/utilidades.js"></script>


</body>

</html>