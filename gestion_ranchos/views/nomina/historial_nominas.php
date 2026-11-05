<?php
require_once __DIR__ . '/../../../public/php/config.php';
require_once __DIR__ . '/../../../public/php/verificarSesion.php';
verificarSesion();
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Historial Nominas - Cabos Ranchos</title>

    <link href="<?= BOOTSTRAP_CSS ?>" rel="stylesheet">
    <link rel="stylesheet" href="<?= BOOTSTRAP_ICONS ?>">
    <link rel="stylesheet" href="../../css/cortes.css">

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
    <?php require_once __DIR__ . '/../../../navbar/navbar.php'; ?>

    <div class="container-fluid bg-light py-4">
        <div class="container">
            <!-- Título y Botón -->
            <div class="d-flex justify-content-between align-items-start mb-4">
                <div>
                    <h2 class="fw-bold mb-1">Historial de Nominas de Corte</h2>

                    <nav aria-label="breadcrumb">
                        <ol class="breadcrumb mb-0">
                            <li class="breadcrumb-item">
                                <a href="../../../index.php">Inicio</a>
                            </li>
                            <li class="breadcrumb-item active">
                                <a href="../historial_cortes.php">Vales</a>
                            </li>
                            <li class="breadcrumb-item">
                                Nominas
                            </li>
                        </ol>
                    </nav>
                </div>
                <button type="button" class="btn btn-success fw-bold" id="btn_nuevo_vale" hidden>
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
                            <label class="form-label fw-bold" for="input_semana">Seleccionar Semana</label>
                            <select class="form-select" id="select_semana">
                                <option value="-1" selected>--- Seleccionar ---</option>
                            </select>
                        </div>
                        <div class="text-center">
                            <button type="submit" class="btn btn-success fw-bold" id="btn_filtrar">
                                <i class="bi bi-search me-2"></i>Filtrar
                            </button>
                        </div>
                        <span class="my-0 text-muted">* Campo obligatorio</span>
                    </form>
                </div>
            </div>

            <!-- Tarjetas de Resumen - Estilo Moderno -->
            <div class="row mb-4 d-none" id="seccion_tarjetas_resumen">
                <!-- Total Rejas -->
                <div class="col-md-6">
                    <div class="card shadow-sm h-100" id="card_total_rejas_extra">
                        <div class="card-body d-flex align-items-center">
                            <div class="bg-success bg-opacity-10 p-3 rounded-3 me-3 text-success">
                                <i class="bi bi-box-seam fs-4"></i>
                            </div>
                            <div>
                                <h6 class="text-muted mb-0">Total Registros</h6>
                                <p class="fs-4 fw-bold mb-0" id="label_total_registros">1,250</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Total Gastos -->
                <div class="col-md-6">
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
            </div>

            <!-- Tabla de Resultados en Card -->
            <div class="card shadow-sm mb-5 d-none" id="seccion_tabla_resultados">
                <!-- Header del card con título y acciones -->
                <div class="card-header bg-white py-3">
                    <div class="d-flex justify-content-between align-items-center">
                        <h5 class="mb-0 text-muted"><i class="bi bi-list-columns-reverse me-2"></i>Desglose Detallado de Cortes (Nomina)</h5>
                        <div>
                            <button type="button" class="btn btn-sm btn-outline-success fw-bold shadow-sm" id="btn_exportar_pdf">
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
                                    <option value="nomina">Nomina</option>
                                    <option value="nombre_cortador">Cabo (Nombre)</option>
                                    <option value="total">Total pagado</option>
                                    <option value="fecha_creacion">Fecha Registro</option>
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
                    </div>


                    <table class="table table-sm table-hover align-middle mb-3" id="tabla_historial_nominas">
                        <thead class="table-light">
                            <tr>
                                <th class="fw-normal text-muted text-center">N°</th>
                                <th class="fw-normal text-muted text-center">Nómina</th>
                                <th class="fw-normal text-muted text-center">Nombre Cabo</th>
                                <th class="fw-normal text-muted text-center">Total Pagado</th>
                                <th class="fw-normal text-muted text-center">Fecha Inicio / Cierre</th>
                                <th class="fw-normal text-muted text-center">Fecha Registro</th>
                                <th class="fw-normal text-muted text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="cuerpo_tabla_historial">
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


    </div>


    <script src="<?= JQUERY_JS ?>"></script>
    <script src="<?= BOOTSTRAP_JS ?>"></script>
    <script src="<?= PERMISOS_JS ?>"></script>

    <!-- UTILIDADES NOMAS TENGO FUNCIONES DE USO GENERAL -->
    <script src="../../js/utilidades.js"></script>
    <!-- AQUI YA EMPIEZA LO BUENO -->
    <script src="../../js/nomina/index.js"></script>
    <script src="../../js/nomina/detalles.js"></script>


</body>

</html>