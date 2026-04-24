<!-- Modal para Actualizar Biométrico -->
<div class="modal fade shadow" id="biometricoModal" tabindex="-1" aria-labelledby="biometricoModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content shadow-lg border-0">
            <!-- Header del Modal -->
            <div class="modal-header bg-primary text-white py-3">
                <h5 class="modal-title fw-bold" id="biometricoModalLabel">
                    <i class="bi bi-person-badge me-2"></i>Actualizar Biométrico
                </h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>

            <!-- Body del Modal -->
            <div class="modal-body p-4">
                <!-- Sección 1: Búsqueda y Selección -->
                <div id="seccion-seleccion-biometrico">
                    <div class="card border-0 bg-light mb-4 rounded-3">
                        <div class="card-body p-3">
                            <label for="buscar-empleado-biometrico" class="form-label fw-bold text-dark small mb-2">
                                <i class="bi bi-search me-1"></i> BUSCAR EMPLEADOS PARA ACTUALIZAR
                            </label>
                            <div class="input-group">
                                <span class="input-group-text bg-white border-end-0">
                                    <i class="bi bi-person text-muted"></i>
                                </span>
                                <input type="text" class="form-control border-start-0" id="buscar-empleado-biometrico" placeholder="Escribe nombre o clave del empleado...">
                            </div>
                        </div>
                    </div>

                    <div class="d-flex justify-content-between align-items-center mb-3 px-1">
                        <h6 class="mb-0 fw-bold text-secondary small">
                             <i class="bi bi-list-check me-1"></i> SELECCIONA LOS EMPLEADOS
                        </h6>
                        <div class="btn-group shadow-sm rounded-pill overflow-hidden" style="font-size: 0.8rem;">
                            <button type="button" class="btn btn-outline-success btn-sm border-0 bg-white" id="btn-seleccionar-todos-biometrico" style="color: #198754;">
                                <i class="bi bi-check-all me-1"></i>Todos
                            </button>
                            <button type="button" class="btn btn-outline-danger btn-sm border-0 bg-white" id="btn-deseleccionar-todos-biometrico" style="color: #dc3545;">
                                <i class="bi bi-x-circle me-1"></i>Ninguno
                            </button>
                        </div>
                    </div>

                    <!-- Contenedor de lista de empleados con scroll -->
                    <div class="border rounded-3 bg-white" style="max-height: 400px; overflow-y: auto; border: 1px solid #dee2e6 !important;">
                        <ul class="list-group list-group-flush" id="lista-empleados-biometrico">
                            <!-- Se llenará con jQuery -->
                        </ul>
                    </div>
                </div>

                <!-- Sección 2: Carga de archivo, oculta inicialmente -->
                <div id="seccion-archivo-biometrico" class="text-center py-5 px-3" style="display:none;">
                    <div class="mb-4">
                        <div class="rounded-circle bg-success bg-opacity-10 d-inline-flex p-4 mb-3">
                            <i class="bi bi-file-earmark-excel text-success display-1"></i>
                        </div>
                    </div>
                    <h5 class="fw-bold mb-2">Cargar Archivo del Biométrico</h5>
                    <p class="text-muted mb-4 px-lg-5">Sube el archivo Excel generado por el reloj checador para procesar los marcajes de los empleados seleccionados.</p>
                    
                    <div class="mx-auto" style="max-width: 450px;">
                        <div class="input-group mb-3">
                            <label class="input-group-text bg-light text-secondary border-end-0" for="archivo-biometrico-modal">
                                <i class="bi bi-upload"></i>
                            </label>
                            <input type="file" id="archivo-biometrico-modal" class="form-control border-start-0 py-2" accept=".xls,.xlsx">
                        </div>
                    </div>
                    
                    <button type="button" class="btn btn-link mt-2 text-decoration-none text-muted small" id="btn-regresar-biometrico">
                        <i class="bi bi-arrow-left me-1"></i> Regresar a la selección de empleados
                    </button>
                </div>
            </div>

            <!-- Footer del Modal -->
            <div class="modal-footer bg-light py-3 border-top">
                <button type="button" class="btn btn-outline-secondary px-4 fw-bold" data-bs-dismiss="modal">Cerrar</button>
                <button type="button" class="btn btn-primary px-4 fw-bold shadow-sm rounded-pill" id="btn-siguiente-biometrico">
                    <span>Siguiente</span> <i class="bi bi-arrow-right ms-2 font-weight-bold"></i>
                </button>
            </div>
        </div>
    </div>
</div>
