<!-- Modal para agregar nuevo casillero -->
<div class="modal fade" id="modalAgregarCasillero" tabindex="-1" aria-labelledby="modalAgregarCasilleroLabel" aria-hidden="true" style="z-index: 1071;">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header bg-primary text-white">
                <h5 class="modal-title" id="modalAgregarCasilleroLabel">
                    <i class="bi bi-plus-circle"></i> Agregar Nuevo Casillero
                </h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <form id="formAgregarCasillero">
                    <div class="mb-3">
                        <label for="numeroCasillero" class="form-label">Número del Casillero</label>
                        <input type="text" class="form-control" id="numeroCasillero" name="numeroCasillero" placeholder="Ej: 1, 1A, 2B, etc." required>
                        <div class="form-text">Ingrese el número identificador único para el nuevo casillero.</div>
                    </div>
                    <div class="alert alert-info">
                        <h6 class="alert-heading"><i class="bi bi-info-circle"></i> Nota importante</h6>
                        <p class="mb-0">El sistema validará automáticamente que el número de casillero no entre en conflicto con los existentes. Por ejemplo, si ya existe "1", no podrá crear "1A" y viceversa.</p>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                    <i class="bi bi-x-circle"></i> Cancelar
                </button>
                <button type="button" class="btn btn-primary" id="btnConfirmarAgregar">
                    <i class="bi bi-plus-circle"></i> Agregar Casillero
                </button>
            </div>
        </div>
    </div>
</div>