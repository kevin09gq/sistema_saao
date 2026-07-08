<div class="modal fade" id="modalAsignarDepartamentos" tabindex="-1" aria-labelledby="lblNombreNominaModal"
    aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">
            <div class="modal-header bg-light">
                <h5 class="modal-title">
                    <i class="bi bi-diagram-3 me-2 text-primary"></i>Departamentos en Nómina: <strong
                        id="lblNombreNominaModal" class="text-primary"></strong>
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <!-- Formulario para agregar -->
                <form id="formAgregarDeptoNomina" class="p-3 bg-light rounded border mb-4 shadow-sm">
                    <input type="hidden" id="modal_nomina_id" name="modal_nomina_id">
                    <input type="hidden" id="modal_nomina_area_id" name="modal_nomina_area_id">
                    <div class="row gx-3 align-items-end mb-3">
                        <div class="col-sm-6">
                            <label for="modal_select_departamento"
                                class="form-label fw-bold text-secondary mb-1">Departamento del Área</label>
                            <select class="form-select border-primary-subtle" id="modal_select_departamento"
                                required>
                                <option value="" selected disabled>Seleccione un departamento...</option>
                                <!-- Se llenará dinámicamente -->
                            </select>
                        </div>
                        <div class="col-sm-6">
                            <label for="modal_select_empresa"
                                class="form-label fw-bold text-secondary mb-1">Empresa</label>
                            <select class="form-select border-primary-subtle" id="modal_select_empresa"
                                required>
                                <option value="" selected disabled>Seleccione una empresa...</option>
                                <!-- Se llenará dinámicamente -->
                            </select>
                        </div>
                    </div>
                    <div class="row gx-3 align-items-end mb-3">
                        <div class="col-sm-10">
                            <label for="modal_color_departamento"
                                class="form-label fw-bold text-secondary mb-1">Color Reporte</label>
                            <div class="d-flex align-items-center gap-2 bg-white border rounded px-2"
                                style="height: 38px;">
                                <input type="color" class="form-control-color border-0 bg-transparent p-0"
                                    id="modal_color_departamento" value="#FF0000" title="Elegir color"
                                    style="width: 30px; height: 30px;">
                                <span class="small text-muted" id="modal_color_text">#FF0000</span>
                            </div>
                        </div>
                        <div class="col-sm-2">
                            <button type="submit" class="btn btn-success w-100 shadow-sm"
                                id="btn-asignar-depto-modal">
                                <i class="bi bi-plus-circle"></i>
                            </button>
                        </div>
                    </div>
                </form>

                <!-- Lista de departamentos actuales -->
                <h6 class="border-bottom pb-2 mb-3 fw-bold text-secondary"><i
                        class="bi bi-tags me-2"></i>Departamentos Asignados</h6>
                <div id="contenedorDepartamentosAsignados" class="d-flex flex-wrap gap-2 p-2 min-vh-25">
                    <!-- Badges dinámicos -->
                    <div class="text-center w-100 text-muted">
                        <div class="spinner-border spinner-border-sm" role="status"></div> Cargando...
                    </div>
                </div>
            </div>
            <div class="modal-footer bg-light">
                <button type="button" class="btn btn-secondary shadow-sm" data-bs-dismiss="modal">Cerrar
                    ventana</button>
            </div>
        </div>
    </div>
</div>