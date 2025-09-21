<!-- Modal Casillero -->
<div class="modal fade" id="modalCasillero" tabindex="-1" aria-labelledby="modalCasilleroLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header bg-primary text-white">
                <h5 class="modal-title" id="modalCasilleroLabel">
                    <i class="bi bi-box-seam"></i> Casillero
                </h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div class="modal-body">
                <div class="container-fluid">
                    <div class="row mb-3">
                        <div class="col-12">
                            <h4>Administración de Casilleros</h4>
                            <p class="text-muted">Visualización de casilleros disponibles y ocupados</p>
                        </div>
                    </div>
                    
                    <!-- Campo de búsqueda -->
                    <div class="row mb-3">
                        <div class="col-12">
                            <div class="input-group">
                                <span class="input-group-text">
                                    <i class="bi bi-search"></i>
                                </span>
                                <input type="text" class="form-control" id="busquedaCasilleros" placeholder="Buscar por nombre de empleado o número de casillero...">
                                <button class="btn btn-outline-secondary" type="button" id="btnLimpiarBusqueda">
                                    <i class="bi bi-x"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Botones de filtro -->
                    <div class="row mb-3">
                        <div class="col-12">
                            <div class="btn-group" role="group" aria-label="Filtros de casilleros">
                                <button type="button" class="btn btn-outline-primary active" id="btnFiltroTodos">
                                    <i class="bi bi-list"></i> Todos
                                </button>
                                <button type="button" class="btn btn-outline-success" id="btnFiltroDisponibles">
                                    <i class="bi bi-check-circle"></i> Disponibles
                                </button>
                                <button type="button" class="btn btn-outline-danger" id="btnFiltroAsignados">
                                    <i class="bi bi-x-circle"></i> Asignados
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="row" id="contenedor-casilleros">
                        <!-- Los casilleros se cargarán aquí dinámicamente -->
                        <div class="col-12 text-center">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Cargando...</span>
                            </div>
                            <p class="mt-2">Cargando casilleros...</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                    <i class="bi bi-x-circle"></i> Cerrar
                </button>
                <button type="button" class="btn btn-success" id="btnAgregarCasillero">
                    <i class="bi bi-plus-circle"></i> Agregar Casillero
                </button>
                <button type="button" class="btn btn-primary" id="guardarCasillero">
                    <i class="bi bi-save"></i> Guardar
                </button>
            </div>
        </div>
    </div>
</div>