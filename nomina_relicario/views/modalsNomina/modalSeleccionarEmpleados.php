<!-- Modal Bootstrap para seleccionar empleados a mostrar en la tabla -->
<div class="modal fade shadow" id="modal-seleccionar-empleados" tabindex="-1" aria-labelledby="modalSeleccionarLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content shadow-lg border-0">
            <!-- Header del Modal -->
            <div class="modal-header bg-primary text-white py-3">
                <h5 class="modal-title fw-bold" id="modalSeleccionarLabel">
                    <i class="bi bi-people-fill me-2"></i>Seleccionar Empleados para la Nómina
                </h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            
            <div class="modal-body p-4">
                <!-- Controles superiores: Búsqueda y Filtros Rápidos -->
                <div class="row g-3 mb-4 align-items-end bg-light p-3 rounded-3 border mx-0 shadow-sm">
                    <div class="col-md-7">
                        <label for="buscar-empleado-modal" class="form-label fw-bold small text-secondary mb-2">
                            <i class="bi bi-search me-1"></i> BUSCAR EMPLEADO
                        </label>
                        <div class="input-group">
                            <span class="input-group-text bg-white border-end-0">
                                <i class="bi bi-person text-muted"></i>
                            </span>
                            <input type="text" id="buscar-empleado-modal" class="form-control border-start-0" placeholder="Escribe nombre o clave del empleado...">
                        </div>
                    </div>
                    <div class="col-md-5">
                        <label class="form-label fw-bold small text-secondary mb-2">
                            <i class="bi bi-check2-square me-1"></i> SELECCIÓN RÁPIDA
                        </label>
                        <div class="btn-group w-100 shadow-sm rounded-pill overflow-hidden">
                            <button type="button" class="btn btn-outline-success btn-sm fw-bold border-0 bg-white" id="btn-seleccionar-todos" style="color: #198754;">
                                <i class="bi bi-check-all me-1"></i>Todos
                            </button>
                            <button type="button" class="btn btn-outline-danger btn-sm fw-bold border-0 bg-white" id="btn-deseleccionar-todos" style="color: #dc3545;">
                                <i class="bi bi-x-circle me-1"></i>Ninguno
                            </button>
                        </div>
                    </div>
                </div>

                <div class="px-1 mb-2">
                    <h6 class="fw-bold text-secondary small mb-0">
                        <i class="bi bi-list-ul me-1"></i> LISTADO DE EMPLEADOS POR DEPARTAMENTO
                    </h6>
                </div>

                <!-- Lista de empleados con scroll -->
                <div id="contenedor-lista-empleados" class="border rounded-3 bg-white p-3 overflow-auto" style="max-height: 400px; border: 1px solid #dee2e6 !important;">
                    <!-- Se llenará dinámicamente con JavaScript -->
                </div>

                <!-- Resumen de Selección -->
                <div class="alert alert-light border shadow-sm mt-4 mb-0 d-flex justify-content-between align-items-center rounded-pill px-4" role="alert">
                    <div class="d-flex align-items-center">
                        <div class="rounded-circle bg-primary bg-opacity-10 p-2 me-3">
                            <i class="bi bi-info-circle-fill text-primary"></i>
                        </div>
                        <span class="fw-bold text-dark small">EMPLEADOS SELECCIONADOS</span>
                    </div>
                    <div class="h5 mb-0 fw-bold text-primary">
                        <span id="contador-seleccionados">0</span> <span class="text-secondary small fw-normal">/</span> <span id="contador-total" class="text-secondary">0</span>
                    </div>
                </div>
            </div>
            
            <!-- Footer del Modal -->
            <div class="modal-footer bg-light py-3 border-top">
                <button type="button" class="btn btn-outline-secondary px-4 fw-bold" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-primary px-4 fw-bold shadow-sm rounded-pill" id="btn-aplicar-seleccion">
                    <span>Aplicar Selección</span> <i class="bi bi-check-lg ms-2"></i>
                </button>
            </div>
        </div>
    </div>
</div>
