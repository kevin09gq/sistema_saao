<!-- Modal Reporte Excel por Departamentos y Empresa -->
<div class="modal fade" id="modal_redondeos" tabindex="-1" aria-labelledby="modal_redondeos_label" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content border-0 shadow-lg">
            <!-- Header con identidad visual de Excel -->
            <div class="modal-header bg-success text-white py-3">
                <h5 class="modal-title d-flex align-items-center" id="modal_redondeos_label">
                    <i class="bi bi-file-earmark-excel fs-4 me-2"></i>
                    Aplicar Redondeos a los Empleados
                </h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>

            <div class="modal-body p-4 bg-light">

                <!-- SECCIÓN 2: SELECCIÓN DE DEPARTAMENTOS -->
                <div class="mb-4">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <div>
                            <h6 class="fw-bold text-dark mb-0">Lista de empleados</h6>
                            <small class="text-muted">Empleados a los que se les aplicarán redondeos</small>
                        </div>
                    </div>

                    <div class="row g-2 mb-3">
                        <div class="col-md-7">
                            <input type="text" class="form-control form-control-sm shadow-sm" placeholder="Buscar empleado..." id="buscar_empleado_redondeos">
                        </div>
                        <div class="col-md-5">
                            <select class="form-select form-select-sm shadow-sm" id="select_departamento_redondeos"></select>
                        </div>
                    </div>

                    <!-- Botones de Acción Rápida -->
                    <div class="btn-group w-100 mb-3 shadow-sm" role="group">
                        <button type="button" id="btn_poner_redondeos" class="btn btn-white border btn-sm fw-semibold">
                            <i class="bi bi-check-all text-primary me-1"></i> Aplicar Redondeos
                        </button>
                        <button type="button" id="btn_quitar_redondeos" class="btn btn-white border btn-sm fw-semibold">
                            <i class="bi bi-x text-danger me-1"></i> Quitar Redondeos
                        </button>
                    </div>

                    <!-- List Group con Checkboxes -->
                    <div class="card shadow-sm border-0">
                        <div class="list-group list-group-flush rounded-3" id="contenedor_empleados_redondeos">
                            <!-- Aquí se llenarán los empleados con checkboxes -->
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