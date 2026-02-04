<!-- Modal Cargar Historial -->
<div class="modal fade" id="modalCargarHistorial" tabindex="-1" aria-labelledby="modalCargarHistorialLabel" aria-hidden="true">
    <div class="modal-dialog modal-xl">
        <div class="modal-content">
            <div class="modal-header bg-info text-white">
                <h5 class="modal-title" id="modalCargarHistorialLabel">
                    <i class="bi bi-clock-history me-2"></i>Historial de Biométricos Guardados
                </h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <!-- Área de carga -->
                <div id="historial-loading" class="text-center py-4">
                    <div class="spinner-border text-info" role="status">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                    <p class="mt-2 text-muted">Cargando historiales...</p>
                </div>

                <!-- Mensaje cuando no hay historiales -->
                <div id="historial-vacio" class="text-center py-4" style="display: none;">
                    <i class="bi bi-inbox text-muted" style="font-size: 3rem;"></i>
                    <p class="mt-2 text-muted">No hay historiales guardados</p>
                </div>

                <!-- Tabla de historiales -->
                <div id="historial-contenido" style="display: none;">
                    <div class="alert alert-info mb-3">
                        <i class="bi bi-info-circle me-1"></i>
                        <small>Haz clic en una fila para cargar ese historial y continuar editándolo.</small>
                    </div>

                    <!-- Filtro de orden -->
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <div class="d-flex align-items-center gap-2">
                            <label class="form-label mb-0 small fw-bold">Ordenar por:</label>
                            <select class="form-select form-select-sm" id="historial-orden-columna" style="width: auto;">
                                <option value="fecha_inicio">Fecha de inicio</option>
                                <option value="fecha_registro">Fecha de guardado</option>
                                <option value="num_sem">Número de semana</option>
                            </select>
                            <select class="form-select form-select-sm" id="historial-orden-dir" style="width: auto;">
                                <option value="DESC">Más reciente primero</option>
                                <option value="ASC">Más antiguo primero</option>
                            </select>
                        </div>
                        <small class="text-muted" id="historial-info-total"></small>
                    </div>
                    
                    <div class="table-responsive">
                        <table class="table table-hover table-striped" id="tabla-historiales">
                            <thead class="table-dark">
                                <tr>
                                    <th scope="col" style="width: 80px;">Semana</th>
                                    <th scope="col">Período</th>
                                    <th scope="col" style="width: 80px;">Empresa</th>
                                    <th scope="col">Observación</th>
                                    <th scope="col" style="width: 160px;">Guardado</th>
                                    <th scope="col" style="width: 80px;">Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="tbody-historiales">
                                <!-- Se llena dinámicamente -->
                            </tbody>
                        </table>
                    </div>

                    <!-- Paginación -->
                    <nav aria-label="Paginación de historiales" id="historial-paginacion-container">
                        <ul class="pagination justify-content-center mb-0" id="historial-paginacion">
                            <!-- Se llena dinámicamente -->
                        </ul>
                    </nav>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                    <i class="bi bi-x-lg me-1"></i>Cerrar
                </button>
            </div>
        </div>
    </div>
</div>

<style>
    #tabla-historiales tbody tr {
        cursor: pointer;
        transition: background-color 0.2s;
    }
    #tabla-historiales tbody tr:hover {
        background-color: #e3f2fd !important;
    }
    #tabla-historiales tbody tr.selected {
        background-color: #bbdefb !important;
    }
    .btn-eliminar-historial {
        padding: 0.25rem 0.5rem;
        font-size: 0.875rem;
    }
    #historial-paginacion .page-link {
        cursor: pointer;
    }
    #historial-paginacion .page-item.disabled .page-link {
        cursor: not-allowed;
    }
</style>
