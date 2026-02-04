 <!-- Modal Guardar Historial -->
<div class="modal fade" id="modalGuardarHistorial" tabindex="-1" aria-labelledby="modalGuardarHistorialLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header bg-primary text-white">
                <h5 class="modal-title" id="modalGuardarHistorialLabel">
                    <i class="bi bi-save me-2"></i>Guardar Historial Biométrico
                </h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <form id="formGuardarHistorial">
                    <!-- Información de la semana -->
                    <div class="card mb-3">
                        <div class="card-header bg-light">
                            <i class="bi bi-calendar-week me-1"></i> Información del Período
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-6 mb-2">
                                    <label class="form-label fw-bold">Número de Semana:</label>
                                    <span id="historial-num-semana" class="badge bg-primary fs-6">-</span>
                                </div>
                                <div class="col-6 mb-2">
                                    <label class="form-label fw-bold">Empresa:</label>
                                    <span id="historial-empresa" class="badge bg-info fs-6">-</span>
                                </div>
                                <div class="col-6">
                                    <label class="form-label fw-bold">Fecha Inicio:</label>
                                    <p id="historial-fecha-inicio" class="mb-0 text-muted">-</p>
                                </div>
                                <div class="col-6">
                                    <label class="form-label fw-bold">Fecha Fin:</label>
                                    <p id="historial-fecha-fin" class="mb-0 text-muted">-</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Observación -->
                    <div class="mb-3">
                        <label for="historial-observacion" class="form-label fw-bold">
                            <i class="bi bi-chat-left-text me-1"></i> Observación (opcional)
                        </label>
                        <textarea class="form-control" id="historial-observacion" name="observacion" rows="2" maxlength="120" placeholder="Ej: Pendiente revisar empleado X..."></textarea>
                        <div class="form-text">
                            <span id="historial-observacion-count">0</span>/120 caracteres
                        </div>
                    </div>

                    <!-- Estado de existencia (se llena dinámicamente) -->
                    <div id="alerta-existencia" class="mb-3">
                        <!-- Aquí se mostrará si ya existe o es nuevo -->
                    </div>

                    <!-- Advertencia -->
                    <div class="alert alert-info mb-0" role="alert">
                        <i class="bi bi-info-circle me-1"></i>
                        <small>Se guardará el estado actual de todos los registros procesados. Podrás recuperarlo más tarde.</small>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                    <i class="bi bi-x-lg me-1"></i>Cancelar
                </button>
                <button type="button" class="btn btn-primary" id="btn-confirmar-guardar-historial">
                    <i class="bi bi-save me-1"></i>Guardar Historial
                </button>
            </div>
        </div>
    </div>
</div>