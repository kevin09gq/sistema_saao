<!-- Modal Reporte Excel por Departamentos y Empresa -->
<div class="modal fade" id="modal_visibilidad" tabindex="-1" aria-labelledby="modal_visibilidad_label" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content border-0 shadow-lg">
            <!-- Header con identidad visual de Excel -->
            <div class="modal-header bg-success text-white py-3">
                <h5 class="modal-title d-flex align-items-center" id="modal_visibilidad_label">
                    <i class="bi bi-file-earmark-excel fs-4 me-2"></i>
                    Visibilidad de Empleados para Aguinaldo
                </h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>

            <div class="modal-body p-4 bg-light">

                <!-- SECCIÓN 2: SELECCIÓN DE DEPARTAMENTOS -->
                <div class="mb-4">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <div>
                            <h6 class="fw-bold text-dark mb-0">Lista de empleados</h6>
                            <small class="text-muted">Empleados que apareceran en la vista.</small>
                        </div>
                    </div>

                    <div class="row g-2 mb-3">
                        <div class="col-md-7">
                            <input type="text" class="form-control form-control-sm shadow-sm" placeholder="Buscar empleado..." id="buscar_empleado_visibilidad">
                        </div>
                        <div class="col-md-5">
                            <select class="form-select form-select-sm shadow-sm" id="select_departamento_visibilidad"></select>
                        </div>
                    </div>

                    <!-- Botones de Acción Rápida -->
                    <div class="btn-group w-100 mb-3 shadow-sm" role="group">
                        <button type="button" id="btn_visibles_todos" class="btn btn-white border btn-sm fw-semibold">
                            <i class="bi bi-check-all text-primary me-1"></i> Visibles Todos
                        </button>
                        <button type="button" id="btn_ocultos_todos" class="btn btn-white border btn-sm fw-semibold">
                            <i class="bi bi-x text-danger me-1"></i> Ocultos Todos
                        </button>
                    </div>

                    <!-- List Group con Checkboxes -->
                    <div class="card shadow-sm border-0">
                        <div class="list-group list-group-flush rounded-3" id="contenedor_lista_empleados_visibilidad">

                            <!-- Ejemplo de departamento -->
                            <label class="list-group-item list-group-item-action d-flex align-items-center py-3">
                                <input class="form-check-input me-3 mt-0 check-depto" type="checkbox" value="1" name="deptos_seleccionados[]" checked data-id="1" data-nombre="Administración">
                                <span class="flex-grow-1 fw-medium">BRANDON HERNÁNDEZ LÓPEZ</span>
                                <i class="bi bi-building text-muted"></i>
                            </label>

                        </div>
                    </div>
                </div>

            </div>

            <!-- Footer -->
            <div class="modal-footer bg-white border-0 py-3">
                <button type="button" class="btn btn-outline-secondary px-4 shadow-sm" data-bs-dismiss="modal">Cerrar</button>
            </div>
        </div>
    </div>
</div>