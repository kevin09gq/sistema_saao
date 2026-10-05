<?php
require_once __DIR__ . "/../public/php/config.php";
require_once __DIR__ . "/../public/php/verificarSesion.php";
verificarSesion();
verificarPermiso("casilleros.ver_menu");
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Administración de Casilleros</title>
    <meta name="description" content="Módulo de administración de casilleros: agregar, editar, eliminar y asignar casilleros a empleados.">
    <link rel="icon" href="<?= ICONO_SISTEMA ?>" />
    <link href="<?= BOOTSTRAP_CSS ?>" rel="stylesheet">
    <link rel="stylesheet" href="<?= BOOTSTRAP_ICONS ?>">
    <link rel="stylesheet" href="css/casillero.css">
    <script src="<?= SWEETALERT ?>"></script>
</head>

<body>

    <?php require_once __DIR__ . "/../navbar/navbar.php"; ?>

    <div class="container py-4">

        <!-- Encabezado del módulo -->
        <div class="module-header mb-4">
            <div class="d-flex align-items-center gap-3">
                <div class="module-icon">
                    <i class="bi bi-box-seam-fill"></i>
                </div>
                <div>
                    <h1 class="module-title mb-0">Administración de Casilleros</h1>
                    <p class="module-subtitle mb-0">Gestiona los casilleros disponibles y su asignación a empleados</p>
                </div>
            </div>
        </div>

        <!-- Barra de herramientas -->
        <div class="toolbar-card mb-4">
            <div class="d-flex flex-wrap align-items-center justify-content-between gap-3">
                <div class="d-flex align-items-center gap-2 flex-wrap">
                    <!-- Búsqueda -->
                    <div class="search-wrap">
                        <i class="bi bi-search search-icon"></i>
                        <input type="text" class="search-input" id="inputBusqueda" placeholder="Buscar por número o empleado...">
                        <button type="button" class="btn-clear-search" id="btnLimpiarBusqueda" title="Limpiar búsqueda">
                            <i class="bi bi-x-circle"></i>
                        </button>
                    </div>
                    <!-- Filtros -->
                    <div class="filter-group" role="group" aria-label="Filtros">
                        <button type="button" class="filter-btn active" id="btnFiltroTodos" data-filtro="todos">Todos</button>
                        <button type="button" class="filter-btn filter-disponible" id="btnFiltroDisponibles" data-filtro="disponibles">Disponibles</button>
                        <button type="button" class="filter-btn filter-parcial" id="btnFiltroParciales" data-filtro="parciales">1 Empleado</button>
                        <button type="button" class="filter-btn filter-completo" id="btnFiltroCompletos" data-filtro="completos">Completos</button>
                    </div>
                </div>
                <div class="d-flex align-items-center gap-2">
                    <!-- Contador -->
                    <span class="badge-count" id="contadorCasilleros">
                        <i class="bi bi-box-seam me-1"></i>
                        <span id="totalCasilleros">0</span> casilleros
                    </span>
                    <!-- Botón Exportar Excel -->
                    <button type="button" class="btn-export-excel" id="btnDescargarExcel" title="Descargar reporte de casilleros en Excel">
                        <i class="bi bi-file-earmark-excel me-1"></i>Descargar Excel
                    </button>
                    <!-- Botón agregar -->
                    <button type="button" class="btn-add-main" id="btnAgregarCasillero">
                        <i class="bi bi-plus-lg me-1"></i>Agregar Casillero
                    </button>
                </div>
            </div>
        </div>

        <!-- Leyenda de estados -->
        <div class="legend-bar mb-3">
            <div class="legend-item">
                <span class="legend-dot legend-disponible"></span>
                <span>Disponible</span>
            </div>
            <div class="legend-item">
                <span class="legend-dot legend-parcial"></span>
                <span>Parcialmente ocupado (1/2)</span>
            </div>
            <div class="legend-item">
                <span class="legend-dot legend-ocupado"></span>
                <span>Completamente ocupado (2/2)</span>
            </div>
        </div>

        <!-- Grid de casilleros -->
        <div class="casilleros-panel">
            <div id="contenedor-casilleros">
                <div class="loading-state" id="loadingState">
                    <div class="spinner-border text-success" role="status">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                    <p class="mt-3 text-muted">Cargando casilleros...</p>
                </div>
            </div>
        </div>

        <!-- Paginación -->
        <div id="controles-paginacion" class="paginacion-wrap mt-3" style="display:none;">
            <small class="text-muted" id="info-paginacion">Mostrando 0 de 0 casilleros</small>
            <nav aria-label="Paginación de casilleros">
                <ul class="pagination pagination-sm mb-0" id="paginacion-casilleros"></ul>
            </nav>
        </div>

    </div>

    <!-- ===== MODALES ===== -->

    <!-- Modal: Agregar Casillero -->
    <div class="modal fade" id="modalAgregarCasillero" tabindex="-1" aria-labelledby="modalAgregarLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="modalAgregarLabel">
                        <i class="bi bi-plus-circle me-2"></i>Agregar Casillero
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                </div>
                <div class="modal-body">
                    <div class="alert alert-info mb-3">
                        <i class="bi bi-info-circle me-2"></i>
                        Ingrese el número o clave del nuevo casillero. Puede usar números, letras o combinaciones (ej: 1, A1, 15-B).
                    </div>
                    <div class="mb-3">
                        <label for="inputNuevoCasillero" class="form-label fw-semibold">Número de Casillero</label>
                        <input type="text"
                               class="form-control"
                               id="inputNuevoCasillero"
                               placeholder="Ej: 1, A-15, 42B..."
                               maxlength="20"
                               autocomplete="off">
                        <div class="form-text">Este número será único e identificará al casillero.</div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                        <i class="bi bi-x me-1"></i>Cancelar
                    </button>
                    <button type="button" class="btn btn-success" id="btnConfirmarAgregar">
                        <i class="bi bi-plus-lg me-1"></i>Agregar
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal: Editar / Asignar Casillero -->
    <div class="modal fade" id="modalEditarCasillero" tabindex="-1" aria-labelledby="modalEditarLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="modalEditarLabel">
                        <i class="bi bi-pencil-square me-2"></i>Casillero <span id="labelNumeroCasilleroEditar"></span>
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                </div>
                <div class="modal-body">
                    <!-- Info empleados asignados -->
                    <div id="infoEmpleadoAsignado" class="mb-3"></div>

                    <!-- Tabs -->
                    <ul class="nav nav-tabs mb-3" id="casilleroTabs" role="tablist">
                        <li class="nav-item" role="presentation">
                            <button class="nav-link active" id="editar-tab" data-bs-toggle="tab" data-bs-target="#tabEditar" type="button" role="tab">
                                <i class="bi bi-pencil me-1"></i>Editar Número
                            </button>
                        </li>
                        <li class="nav-item" role="presentation">
                            <button class="nav-link" id="asignar-tab" data-bs-toggle="tab" data-bs-target="#tabAsignar" type="button" role="tab">
                                <i class="bi bi-person-plus me-1"></i>Asignar Empleado
                            </button>
                        </li>
                    </ul>

                    <div class="tab-content" id="casilleroTabsContent">
                        <!-- Pestaña Editar -->
                        <div class="tab-pane fade show active" id="tabEditar" role="tabpanel">
                            <form id="formEditarCasillero">
                                <input type="hidden" id="casillero_id" name="casillero_id">
                                <div class="mb-3">
                                    <label for="nuevo_numero" class="form-label fw-semibold">Nuevo Número de Casillero</label>
                                    <input type="text"
                                           class="form-control"
                                           id="nuevo_numero"
                                           name="nuevo_numero"
                                           placeholder="Ingrese el nuevo número"
                                           maxlength="20"
                                           required>
                                    <div class="form-text">Ingrese el nuevo identificador para este casillero.</div>
                                </div>
                            </form>
                        </div>

                        <!-- Pestaña Asignar -->
                        <div class="tab-pane fade" id="tabAsignar" role="tabpanel">
                            <div class="mb-3">
                                <label for="buscarEmpleado" class="form-label fw-semibold">Buscar Empleado</label>
                                <div class="input-group mb-2">
                                    <input type="text"
                                           class="form-control"
                                           id="buscarEmpleado"
                                           placeholder="Nombre o ID del empleado..."
                                           autocomplete="off">
                                    <button class="btn btn-outline-secondary" type="button" id="btnLimpiarBusquedaEmpleado" title="Limpiar">
                                        <i class="bi bi-x-circle"></i>
                                    </button>
                                    <button class="btn btn-success" type="button" id="btnBuscarEmpleado">
                                        <i class="bi bi-search me-1"></i>Buscar
                                    </button>
                                </div>
                                <div class="form-text">Escriba el nombre o ID del empleado y presione Buscar o Enter.</div>
                            </div>
                            <div id="resultadoBusqueda" class="resultados-busqueda">
                                <div class="empty-search-state">
                                    <i class="bi bi-person-lines-fill"></i>
                                    <p>Busque un empleado para asignar al casillero</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-danger" id="btnEliminarCasillero">
                        <i class="bi bi-trash me-1"></i>Eliminar
                    </button>
                    <div class="ms-auto d-flex gap-2">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                            <i class="bi bi-x me-1"></i>Cancelar
                        </button>
                        <button type="button" class="btn btn-primary" id="btnGuardarCambios">
                            <i class="bi bi-save me-1"></i>Guardar Cambios
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal: Exportar Casilleros a Excel -->
    <div class="modal fade" id="modalExportarExcel" tabindex="-1" aria-labelledby="modalExportarExcelLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="modalExportarExcelLabel">
                        <i class="bi bi-file-earmark-excel text-success me-2"></i>Descargar Reporte en Excel
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                </div>
                <div class="modal-body">
                    <p class="text-muted small mb-3">
                        Seleccione el tipo de reporte que desea generar sobre los casilleros ocupados y compartidos:
                    </p>

                    <div class="export-option-card mb-2 active" data-type="completo">
                        <div class="form-check d-flex align-items-center gap-2">
                            <input class="form-check-input mt-0" type="radio" name="tipoExportacion" id="tipoCompleto" value="completo" checked>
                            <label class="form-check-label w-100 cursor-pointer" for="tipoCompleto">
                                <div class="fw-bold text-dark">
                                    <i class="bi bi-layers-fill text-success me-1"></i>Reporte Completo (Recomendado)
                                </div>
                                <small class="text-muted d-block">Incluye casilleros compartidos, con 1 empleado, detalle general y estadísticas en hojas separadas.</small>
                            </label>
                        </div>
                    </div>

                    <div class="export-option-card mb-2" data-type="compartidos">
                        <div class="form-check d-flex align-items-center gap-2">
                            <input class="form-check-input mt-0" type="radio" name="tipoExportacion" id="tipoCompartidos" value="compartidos">
                            <label class="form-check-label w-100 cursor-pointer" for="tipoCompartidos">
                                <div class="fw-bold text-dark">
                                    <i class="bi bi-people-fill text-danger me-1"></i>Solo Casilleros Compartidos (2/2)
                                </div>
                                <small class="text-muted d-block">Muestra los casilleros que tienen dos empleados asignados compartiendo el locker.</small>
                            </label>
                        </div>
                    </div>

                    <div class="export-option-card mb-2" data-type="parciales">
                        <div class="form-check d-flex align-items-center gap-2">
                            <input class="form-check-input mt-0" type="radio" name="tipoExportacion" id="tipoParciales" value="parciales">
                            <label class="form-check-label w-100 cursor-pointer" for="tipoParciales">
                                <div class="fw-bold text-dark">
                                    <i class="bi bi-person-fill text-warning me-1"></i>Solo Casilleros con 1 Empleado (1/2)
                                </div>
                                <small class="text-muted d-block">Casilleros parcialmente ocupados que aún tienen 1 lugar disponible.</small>
                            </label>
                        </div>
                    </div>

                    <div class="export-option-card mb-0" data-type="todos_ocupados">
                        <div class="form-check d-flex align-items-center gap-2">
                            <input class="form-check-input mt-0" type="radio" name="tipoExportacion" id="tipoTodosOcupados" value="todos_ocupados">
                            <label class="form-check-label w-100 cursor-pointer" for="tipoTodosOcupados">
                                <div class="fw-bold text-dark">
                                    <i class="bi bi-card-checklist text-primary me-1"></i>Todos los Ocupados (Lista General)
                                </div>
                                <small class="text-muted d-block">Listado consolidado de todos los trabajadores que tienen casillero.</small>
                            </label>
                        </div>
                    </div>
                </div>
                <div class="modal-footer bg-white">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                        <i class="bi bi-x me-1"></i>Cancelar
                    </button>
                    <button type="button" class="btn btn-success" id="btnConfirmarExportarExcel">
                        <i class="bi bi-download me-1"></i>Descargar Excel (.xlsx)
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- Scripts -->
    <script src="<?= JQUERY_JS ?>"></script>
    <script src="<?= BOOTSTRAP_JS ?>"></script>
    <script src="<?= SWEETALERT ?>"></script>
    <script src="js/casillero.js"></script>

</body>
</html>
