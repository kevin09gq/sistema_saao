<!-- Modal Nuevo Vale -->
<div class="modal fade" id="modal_nuevo_vale" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content border-0 shadow">

            <div class="modal-header bg-success text-white">
                <h5 class="modal-title" id="modalLabelVale">
                    <i class="bi bi-plus-circle-dotted me-2"></i>Registrar Nuevo Vale
                </h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>

            <div class="modal-body p-4">
                <!-- Sección 1: Datos Generales -->
                <div class="row g-3 mb-4">
                    <!-- 1 = NUEVO VALE; 2 = EDITAR VALE -->
                    <input type="number" id="id_corte" value="" hidden>
                    <div class="col-md-6">
                        <label class="form-label fw-bold">Folio</label>
                        <input type="text" class="form-control shadow-sm" id="input_folio_nuevo" placeholder="Ej: 100">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label fw-bold">Nombre del Cortador</label>
                        <input type="text" class="form-control shadow-sm" id="input_nombre_cortador_nuevo" placeholder="Nombre completo">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label fw-bold">Fecha de Corte</label>
                        <input type="date" class="form-control shadow-sm" id="input_fecha_corte_nuevo">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label fw-bold">Rancho</label>
                        <select class="form-select shadow-sm" id="select_rancho_nuevo">
                            <option selected disabled>Seleccione un rancho...</option>
                            <option value="1">Rancho El Relicario</option>
                            <option value="2">Rancho Pilar</option>
                        </select>
                    </div>
                </div>

                <!-- Sección 2: Selección de Tablas -->
                <div class="mb-4">
                    <label class="form-label fw-bold">Selección de Tablas:</label>
                    <div class="p-3 border rounded bg-light">
                        <div class="row g-2" id="contenedor_checkboxes_tablas">
                            <!-- Ejemplo de checkboxes, esto se puede generar dinámicamente -->
                            <span class="text-muted text-center">DEBE SELECCIONAR UN RANCHO</span>
                        </div>
                    </div>
                </div>

                <!-- Sección 3: Inputs Dinámicos (Columnas de 3) -->
                <div class="mb-4">
                    <label class="form-label fw-bold">Detalle de Rejas por Tabla</label>
                    <div class="p-3 border rounded border-primary border-opacity-25">
                        <div class="row g-3" id="contenedor_inputs_tablas_extra">
                            <!-- SE VA A GENERAR DINÁMICAMENTE SEGÚN EL NÚMERO DE TABLAS SELECCIONADAS -->
                        </div>
                    </div>
                </div>

                <!-- Sección 4: Totales -->
                <div class="row g-3 bg-white pt-3">
                    <div class="col-md-4">
                        <label class="form-label fw-bold">Total Rejas</label>
                        <input type="number" class="form-control bg-secondary-subtle" id="input_total_rejas_nuevo" readonly placeholder="0">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label fw-bold">Precio por Reja</label>
                        <input type="number" class="form-control" id="input_precio_reja_nuevo" placeholder="$0.00">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label fw-bold">Total Efectivo</label>
                        <input type="text" class="form-control bg-light fw-bold text-success" id="input_total_efectivo_nuevo" readonly placeholder="$0.00">
                    </div>
                </div>
            </div>

            <div class="modal-footer">
                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-success fw-bold px-4" id="btn_guardar_nuevo_vale"><i class="bi bi-save me-1"></i> Guardar</button>
            </div>
        </div>
    </div>
</div>