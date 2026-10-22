<!-- Modal Redondeos de Aguinaldo -->
<div class="modal fade" id="modal_redondeos" tabindex="-1" aria-labelledby="modal_redondeos_label" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="modal_redondeos_label">
                    <i class="bi bi-cash-coin me-2"></i>
                    Aplicar Redondeos a Colaboradores
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>

            <div class="modal-body p-4">

                <div class="mb-3">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <label class="form-label mb-0">Lista de Colaboradores</label>
                        <small class="text-muted">Ajusta el redondeo del neto a pagar</small>
                    </div>

                    <!-- Filtros -->
                    <div class="toolbar-card mb-3 p-3">
                        <div class="row g-2">
                            <div class="col-md-4">
                                <label class="form-label" for="buscar_empleado_redondeos">Buscar</label>
                                <div class="input-group">
                                    <span class="input-group-text"><i class="bi bi-search"></i></span>
                                    <input type="text" class="form-control" placeholder="Buscar empleado..." id="buscar_empleado_redondeos">
                                </div>
                            </div>
                            <div class="col-md-3">
                                <label class="form-label" for="select_empresa_redondeos">Empresa</label>
                                <select class="form-select" id="select_empresa_redondeos">
                                    <option value="-1">Todas las empresas</option>
                                </select>
                            </div>
                            <div class="col-md-3">
                                <label class="form-label" for="select_area_redondeos">Área</label>
                                <select class="form-select" id="select_area_redondeos">
                                    <option value="-1">Todas las áreas</option>
                                </select>
                            </div>
                            <div class="col-md-2">
                                <label class="form-label" for="select_departamento_redondeos">Depto</label>
                                <select class="form-select" id="select_departamento_redondeos" disabled>
                                    <option value="-1">Todas</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Botones de Acción Rápida -->
                    <div class="btn-group w-100 mb-3" role="group">
                        <button type="button" id="btn_poner_redondeos" class="btn btn-outline-success btn-sm">
                            <i class="bi bi-check-all me-1"></i> Aplicar Redondeos
                        </button>
                        <button type="button" id="btn_quitar_redondeos" class="btn btn-outline-secondary btn-sm">
                            <i class="bi bi-x me-1"></i> Quitar Redondeos
                        </button>
                    </div>

                    <!-- List Group con Checkboxes -->
                    <div class="card border-0 shadow-sm">
                        <div class="list-group list-group-flush rounded-3" style="max-height: 320px; overflow-y: auto;" id="contenedor_empleados_redondeos">
                            <!-- Aquí se llenarán los empleados con checkboxes -->
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