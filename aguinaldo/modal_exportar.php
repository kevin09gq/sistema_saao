<!-- Modal Reporte Excel por Departamentos y Empresa -->
<div class="modal fade" id="modal_reporte_excel" tabindex="-1" aria-labelledby="modal_reporte_excel_label" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <!-- Header institucional -->
            <div class="modal-header">
                <h5 class="modal-title" id="modal_reporte_excel_label">
                    <i class="bi bi-file-earmark-excel me-2"></i>
                    Exportar Reporte de Aguinaldos
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>

            <div class="modal-body p-4">

                <!-- SECCIÓN 1: SELECCIÓN DE EMPRESA -->
                <div class="mb-4">
                    <label class="form-label mb-2">1. Seleccionar Empresa</label>
                    <div class="card border-0 bg-light">
                        <div class="card-body p-3">
                            <div class="d-flex justify-content-around" id="contenedor_radio_empresas">
                                <div class="form-check form-check-inline mb-0">
                                    <input class="form-check-input" type="radio" name="radio_empresa" id="empresa_1" value="1" checked>
                                    <label class="form-check-label fw-semibold text-dark" for="empresa_1">
                                        Cítricos SAAO
                                    </label>
                                </div>
                                <div class="vr text-muted opacity-25"></div>
                                <div class="form-check form-check-inline mb-0">
                                    <input class="form-check-input" type="radio" name="radio_empresa" id="empresa_2" value="2">
                                    <label class="form-check-label fw-semibold text-dark" for="empresa_2">
                                        SB Citric's Group
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- SECCIÓN 2: SELECCIÓN DE DEPARTAMENTOS -->
                <div class="mb-2">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <label class="form-label mb-0">2. Filtrar por Departamentos</label>
                        <small class="text-muted">Grupos a incluir</small>
                    </div>

                    <!-- Botones de Acción Rápida -->
                    <div class="btn-group w-100 mb-3" role="group">
                        <button type="button" id="btn_seleccionar_todo" class="btn btn-outline-success btn-sm">
                            <i class="bi bi-check-all me-1"></i> Seleccionar todos
                        </button>
                        <button type="button" id="btn_deseleccionar_todo" class="btn btn-outline-secondary btn-sm">
                            <i class="bi bi-x me-1"></i> Deseleccionar todos
                        </button>
                    </div>

                    <!-- List Group con Checkboxes -->
                    <div class="card border-0 shadow-sm">
                        <div class="list-group list-group-flush rounded-3" style="max-height: 250px; overflow-y: auto;" id="contenedor_lista_deptamentos">
                            <!-- Ejemplo de departamento cargado dinámicamente -->
                            <label class="list-group-item list-group-item-action d-flex align-items-center py-2">
                                <input class="form-check-input me-3 mt-0 check-depto" type="checkbox" value="1" name="deptos_seleccionados[]" checked data-id="1" data-nombre="Administración">
                                <span class="flex-grow-1 fw-medium">Administración</span>
                                <i class="bi bi-building text-muted"></i>
                            </label>
                        </div>
                    </div>
                </div>
                
            </div>

            <!-- Footer -->
            <div class="modal-footer bg-white d-flex justify-content-end gap-2">
                <button type="button" class="btn btn-outline-secondary px-4" data-bs-dismiss="modal">Cerrar</button>
                <button type="button" id="btn_generar_reporte" class="btn btn-success px-4">
                    <i class="bi bi-file-earmark-arrow-down me-1"></i>Descargar Excel
                </button>
            </div>
        </div>
    </div>
</div>