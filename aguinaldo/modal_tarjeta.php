<div class="modal fade" id="modal_tarjeta" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="modal_tarjeta_label" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header bg-success text-white">
                <h1 class="modal-title fs-5" id="modal_tarjeta_label">Asignar valor de Tarjeta</h1>
            </div>
            <div class="modal-body">
                <!-- ID Oculto -->
                <input type="hidden" name="id_empleado_tarjeta" id="id_empleado_tarjeta" value="">

                <!-- Información del Empleado (Referencia) -->
                <div class="mb-4">
                    <label class="form-label fw-bold text-muted small">Empleado</label>
                    <div class="input-group">
                        <span class="input-group-text bg-light"><i class="bi bi-person-fill"></i></span>
                        <input type="text" class="form-control bg-light" id="nombre_empleado_tarjeta" name="nombre_empleado" value="NOMBRE TEMPORAL" readonly tabindex="-1">
                    </div>
                    <div id="emailHelp" class="form-text">Información de solo lectura.</div>
                </div>

                <hr class="text-secondary opacity-25">

                <!-- Input Editable (Dispersión) -->
                <div class="mb-3">
                    <label for="dispersion_tarjeta" class="form-label fw-bold text-primary">Monto de Dispersión</label>
                    <div class="input-group input-group-lg">
                        <span class="input-group-text border-primary text-primary fw-bold">$</span>
                        <input type="number"
                            class="form-control border-primary text-primary fw-semibold"
                            id="dispersion_tarjeta"
                            name="dispersion_tarjeta"
                            placeholder="0.00"
                            step="0.01"
                            min="0">
                    </div>
                    <div class="form-text mt-2">
                        Ingrese el monto con decimales (Ej. 1500.58)
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-outline-secondary" id="btn_cerrar_modal_tarjeta"><i class="bi bi-arrow-return-left me-2"></i>Volver</button>
                <button type="button" class="btn btn-success fw-bold" id="btn_guardar_tarjeta"><i class="bi bi-check2-circle me-2"></i>Guardar cambios</button>
            </div>
        </div>
    </div>
</div>