<!-- Modal Empleados sin Derecho a Aguinaldo -->
<div class="modal fade" id="modal_empleados_sin_derecho" tabindex="-1" aria-labelledby="modal_empleados_sin_derecho_label" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="modal_empleados_sin_derecho_label">
                    <i class="bi bi-person-fill-dash me-2"></i>
                    Colaboradores sin Derecho a Aguinaldo
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>

            <div class="modal-body p-4">

                <div class="mb-3">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <label class="form-label mb-0">Lista de Colaboradores</label>
                        <small class="text-muted"><i class="bi bi-info-circle me-1"></i>No cumplen con 60 días laborados</small>
                    </div>

                    <!-- Filtros de búsqueda -->
                    <div class="toolbar-card mb-3 p-3">
                        <div class="row g-2">
                            <div class="col-md-4">
                                <label class="form-label" for="buscar_empleado_sin_derecho">Buscar</label>
                                <div class="input-group">
                                    <span class="input-group-text"><i class="bi bi-search"></i></span>
                                    <input type="text" class="form-control" placeholder="Buscar empleado..." id="buscar_empleado_sin_derecho">
                                </div>
                            </div>
                            <div class="col-md-3">
                                <label class="form-label" for="select_empresa_sin_derecho">Empresa</label>
                                <select class="form-select" id="select_empresa_sin_derecho">
                                    <option value="-1">Todas las empresas</option>
                                </select>
                            </div>
                            <div class="col-md-3">
                                <label class="form-label" for="select_area_sin_derecho">Área</label>
                                <select class="form-select" id="select_area_sin_derecho">
                                    <option value="-1">Todas las áreas</option>
                                </select>
                            </div>
                            <div class="col-md-2">
                                <label class="form-label" for="select_departamento_sin_derecho">Depto</label>
                                <select class="form-select" id="select_departamento_sin_derecho" disabled>
                                    <option value="-1">Todas</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- List Group -->
                    <div class="card border-0 shadow-sm">
                        <div class="list-group list-group-flush rounded-3" style="max-height: 320px; overflow-y: auto;" id="contenedor_lista_empleados_sin_derecho">
                            <!-- Se llena dinámicamente -->
                        </div>
                    </div>
                </div>

            </div>

            <!-- Footer -->
            <div class="modal-footer bg-white d-flex justify-content-end">
                <button type="button" class="btn btn-outline-secondary px-4" data-bs-dismiss="modal">
                    <i class="bi bi-x-circle me-1"></i>Cerrar
                </button>
            </div>
        </div>
    </div>
</div>