<!-- Modal Reporte Excel por Departamentos y Empresa -->
<div class="modal fade" id="modal_reporte_excel" tabindex="-1" aria-labelledby="modal_reporte_excel_label" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg">
            <!-- Header con identidad visual de Excel -->
            <div class="modal-header bg-success text-white py-3">
                <h5 class="modal-title d-flex align-items-center" id="modal_reporte_excel_label">
                    <i class="bi bi-file-earmark-excel fs-4 me-2"></i>
                    Exportar Reporte de Aguinaldos
                </h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>

            <div class="modal-body p-4 bg-light">

                <!-- SECCIÓN 1: SELECCIÓN DE EMPRESA -->
                <div class="mb-4">
                    <h6 class="fw-bold text-dark mb-3">
                        <i class="bi bi-buildings me-2 text-success"></i>1. Seleccionar Empresa
                    </h6>
                    <div class="bg-white p-3 rounded-3 border shadow-sm">
                        <div class="d-flex justify-content-around" id="contenedor_radio_empresas">
                            <div class="form-check form-check-inline">
                                <input class="form-check-input" type="radio" name="radio_empresa" id="empresa_1" value="1" checked>
                                <label class="form-check-label fw-bold text-secondary" for="empresa_1">
                                    Citricos SAAO
                                </label>
                            </div>
                            <div class="vr text-muted opacity-25"></div> <!-- Línea divisoria vertical -->
                            <div class="form-check form-check-inline">
                                <input class="form-check-input" type="radio" name="radio_empresa" id="empresa_2" value="2">
                                <label class="form-check-label fw-bold text-secondary" for="empresa_2">
                                    SB citric´s group
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- SECCIÓN 2: SELECCIÓN DE DEPARTAMENTOS -->
                <div class="mb-4">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <div>
                            <h6 class="fw-bold text-dark mb-0">2. Filtrar por Departamentos</h6>
                            <small class="text-muted">Grupos a incluir en el reporte</small>
                        </div>
                    </div>

                    <!-- Botones de Acción Rápida -->
                    <div class="btn-group w-100 mb-3 shadow-sm" role="group">
                        <button type="button" id="btn_seleccionar_todo" class="btn btn-white border btn-sm fw-semibold">
                            <i class="bi bi-check-all text-primary me-1"></i> Seleccionar todos
                        </button>
                        <button type="button" id="btn_deseleccionar_todo" class="btn btn-white border btn-sm fw-semibold">
                            <i class="bi bi-x text-danger me-1"></i> Deseleccionar todos
                        </button>
                    </div>

                    <!-- List Group con Checkboxes -->
                    <div class="card shadow-sm border-0">
                        <div class="list-group list-group-flush rounded-3" style="max-height: 250px; overflow-y: auto;" id="contenedor_lista_deptamentos">

                            <!-- Ejemplo de departamento -->
                            <label class="list-group-item list-group-item-action d-flex align-items-center py-3">
                                <input class="form-check-input me-3 mt-0 check-depto" type="checkbox" value="1" name="deptos_seleccionados[]" checked data-id="1" data-nombre="Administración">
                                <span class="flex-grow-1 fw-medium">Administración</span>
                                <i class="bi bi-building text-muted"></i>
                            </label>

                        </div>
                    </div>
                </div>

                <!-- SECCIÓN 3: CONFIGURACIÓN DE SALIDA -->
                <!-- <div class="card border-0 shadow-sm">
                    <div class="card-body bg-white rounded-3 p-3">
                        <div class="form-check form-switch d-flex align-items-center justify-content-between p-0">
                            <div class="ms-0">
                                <label class="form-check-label fw-bold text-dark d-block" for="check_dividir_hojas">Dividir por hojas</label>
                                <small class="text-muted">Crear una pestaña independiente por departamento.</small>
                            </div>
                            <input class="form-check-input ms-0" type="checkbox" role="switch" id="check_dividir_hojas" name="check_dividir_hojas" style="width: 2.5em; height: 1.25em;">
                        </div>
                    </div>
                </div> -->
            </div>

            <!-- Footer -->
            <div class="modal-footer bg-white border-0 py-3">
                <button type="button" class="btn btn-outline-secondary px-4 shadow-sm" data-bs-dismiss="modal">Cerrar</button>
                <button type="button" id="btn_generar_reporte" class="btn btn-success px-5 fw-bold shadow">
                    <i class="bi bi-file-earmark-arrow-down me-2"></i>Descargar Excel
                </button>
            </div>
        </div>
    </div>
</div>