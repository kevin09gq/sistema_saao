<div class="modal fade" id="modal_tarjeta" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="modal_tarjeta_label" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="modal_tarjeta_label">
                    <i class="bi bi-credit-card me-2"></i> Asignar Valor de Tarjeta
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div class="modal-body p-4">
                <!-- ID Oculto -->
                <input type="hidden" name="id_empleado_tarjeta" id="id_empleado_tarjeta" value="">

                <!-- Información del Empleado (Referencia) -->
                <div class="card border-0 bg-light mb-4">
                    <div class="card-body p-3">
                        <label class="form-label mb-1">Colaborador</label>
                        <div class="input-group">
                            <span class="input-group-text bg-white"><i class="bi bi-person"></i></span>
                            <input type="text" class="form-control bg-white fw-semibold" id="nombre_empleado_tarjeta" name="nombre_empleado" value="NOMBRE TEMPORAL" readonly tabindex="-1">
                        </div>
                    </div>
                </div>

                <!-- Input Editable (Dispersión) -->
                <div class="mb-3">
                    <label for="dispersion_tarjeta" class="form-label text-primary">Monto de Dispersión</label>
                    <div class="input-group input-group-lg">
                        <span class="input-group-text bg-white text-primary fw-bold">$</span>
                        <input type="number"
                            class="form-control fw-semibold"
                            id="dispersion_tarjeta"
                            name="dispersion_tarjeta"
                            placeholder="0.00"
                            step="0.01"
                            min="0">
                    </div>
                    <div class="form-text mt-2 small text-muted">
                        <i class="bi bi-info-circle me-1"></i>Ingrese el monto con decimales (Ej. 1500.58)
                    </div>
                </div>
            </div>
            <div class="modal-footer bg-white d-flex justify-content-end gap-2">
                <button type="button" class="btn btn-outline-secondary px-4" id="btn_cerrar_modal_tarjeta">
                    <i class="bi bi-arrow-return-left me-1"></i>Volver
                </button>
                <button type="button" class="btn btn-success px-4" id="btn_guardar_tarjeta">
                    <i class="bi bi-check-lg me-1"></i>Guardar cambios
                </button>
            </div>
        </div>
    </div>
</div>