<!-- Modal Nuevo Vale -->
<div class="modal fade" id="modal_editar_vale" tabindex="-1" aria-labelledby="modalLabelVale" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content border-0 shadow">

            <div class="modal-header bg-success text-white">
                <h5 class="modal-title" id="modalLabelVale">
                    <i class="bi bi-pencil-square me-2"></i>Editar Vale
                </h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>

            <div class="modal-body p-4">
                <!-- Sección 1: Datos Generales -->
                <div class="row g-3 mb-4">
                    <div class="col-md-6">
                        <label class="form-label fw-bold">Folio</label>
                        <input type="text" class="form-control shadow-sm" id="input_folio_editar" placeholder="Ej: 100">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label fw-bold">Nombre del Cortador</label>
                        <input type="text" class="form-control shadow-sm" id="input_nombre_cortador_editar" placeholder="Nombre completo">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label fw-bold">Fecha de Corte</label>
                        <input type="date" class="form-control shadow-sm" id="input_fecha_corte_editar">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label fw-bold">Rancho</label>
                        <select class="form-select shadow-sm" id="select_rancho_editar">
                            <!-- Las opciones se llenarán dinámicamente desde la base de datos -->
                        </select>
                    </div>
                </div>

                <!-- Sección 2: Selección de Tablas -->
                <div class="mb-4">
                    <label class="form-label fw-bold">Selección de Tablas:</label>
                    <div class="p-3 border rounded bg-light">
                        <div class="row g-2" id="contenedor_checkboxes_tablas_editar">
                            <!-- Ejemplo de checkboxes, esto se puede generar dinámicamente -->
                            <span class="text-muted text-center">DEBE SELECCIONAR UN RANCHO</span>
                        </div>
                    </div>
                </div>

                <!-- Sección 3: Inputs Dinámicos (Columnas de 3) -->
                <div class="mb-4">
                    <label class="form-label fw-bold">Detalle de Rejas por Tabla</label>
                    <div class="p-3 border rounded border-primary border-opacity-25">
                        <div class="row g-3" id="contenedor_inputs_tablas_editar">
                            <!-- SE VA A GENERAR DINÁMICAMENTE SEGÚN EL NÚMERO DE TABLAS SELECCIONADAS -->
                        </div>
                    </div>
                </div>

                <!-- Sección 4: Totales -->
                <div class="row g-3 bg-white pt-3">
                    <div class="col-md-4">
                        <label class="form-label fw-bold">Total Rejas</label>
                        <input type="number" class="form-control bg-secondary-subtle" id="input_total_rejas_editar" readonly placeholder="0">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label fw-bold">Precio por Reja</label>
                        <input type="number" class="form-control" id="input_precio_reja_editar" placeholder="$0.00">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label fw-bold">Total Efectivo</label>
                        <input type="text" class="form-control bg-light fw-bold text-success" id="input_total_efectivo_editar" readonly placeholder="$0.00">
                    </div>
                </div>
            </div>

            <div class="modal-footer">
                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-success fw-bold px-4" id="btn_guardar_editar_vale"><i class="bi bi-save me-1"></i>Guardar Cambios</button>
            </div>
        </div>
    </div>
</div>