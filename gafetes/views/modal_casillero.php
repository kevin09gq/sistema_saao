<!-- Modal Casillero -->
<div class="modal fade" id="modalCasillero" tabindex="-1" aria-labelledby="modalCasilleroLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content border-0 shadow">
            <div class="modal-header flex-shrink-0">
                <h5 class="modal-title" id="modalCasilleroLabel">
                    <i class="bi bi-box-seam text-success me-2"></i>Administración de Casilleros
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div class="modal-body flex-grow-1 overflow-auto">

                <!-- Encabezado descriptivo -->
                <div class="card border-0 bg-light mb-3">
                    <div class="card-body py-2">
                        <p class="text-muted mb-0 small">
                            <i class="bi bi-info-circle me-1 text-success"></i>
                            Visualización de casilleros disponibles y ocupados
                        </p>
                    </div>
                </div>

                <!-- Campo de búsqueda -->
                <div class="card border-0 bg-light mb-3">
                    <div class="card-body">
                        <h6 class="fw-bold text-secondary mb-3">
                            <i class="bi bi-search me-2 text-success"></i>Buscar Casillero
                        </h6>
                        <div class="input-group">
                            <span class="input-group-text bg-white border-end-0">
                                <i class="bi bi-search text-muted"></i>
                            </span>
                            <input type="text"
                                   class="form-control border-start-0"
                                   id="busquedaCasilleros"
                                   placeholder="Buscar por nombre de empleado o número de casillero...">
                            <button class="btn btn-outline-secondary" type="button" id="btnLimpiarBusqueda" title="Limpiar búsqueda">
                                <i class="bi bi-x"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Filtros y contenedor de casilleros -->
                <div class="card border-0 bg-light mb-3">
                    <div class="card-body">
                        <div class="d-flex align-items-center justify-content-between mb-3 flex-wrap gap-2">
                            <h6 class="fw-bold text-secondary mb-0">
                                <i class="bi bi-grid-3x3-gap me-2 text-success"></i>Casilleros
                            </h6>
                            <!-- Botones de filtro -->
                            <div class="btn-group btn-group-sm" role="group" aria-label="Filtros de casilleros">
                                <button type="button" class="btn btn-outline-secondary active" id="btnFiltroTodos">
                                    <i class="bi bi-list me-1"></i>Todos
                                </button>
                                <button type="button" class="btn btn-outline-success" id="btnFiltroDisponibles">
                                    <i class="bi bi-check-circle me-1"></i>Disponibles
                                </button>
                                <button type="button" class="btn btn-outline-warning" id="btnFiltroParciales">
                                    <i class="bi bi-person me-1"></i>1 Empleado
                                </button>
                                <button type="button" class="btn btn-outline-danger" id="btnFiltroCompletos">
                                    <i class="bi bi-people me-1"></i>Completos
                                </button>
                            </div>
                        </div>

                        <!-- Grid de casilleros -->
                        <div id="contenedor-casilleros">
                            <!-- Los casilleros se cargarán aquí dinámicamente -->
                            <div class="col-12 text-center py-4">
                                <div class="spinner-border text-success" role="status">
                                    <span class="visually-hidden">Cargando...</span>
                                </div>
                                <p class="mt-2 text-muted">Cargando casilleros...</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Controles de paginación -->
                <div id="controles-paginacion" style="display: none;">
                    <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">
                        <small class="text-muted" id="info-paginacion">Mostrando 0 de 0 casilleros</small>
                        <nav aria-label="Paginación de casilleros">
                            <ul class="pagination pagination-sm mb-0" id="paginacion-casilleros">
                                <!-- Los botones de paginación se generarán dinámicamente -->
                            </ul>
                        </nav>
                    </div>
                </div>

            </div>
            <div class="modal-footer flex-shrink-0">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                    <i class="bi bi-x-circle me-1"></i>Cerrar
                </button>
                <button type="button" class="btn btn-success" id="btnAgregarCasillero">
                    <i class="bi bi-plus-circle me-1"></i>Agregar Casillero
                </button>
            </div>
        </div>
    </div>
</div>