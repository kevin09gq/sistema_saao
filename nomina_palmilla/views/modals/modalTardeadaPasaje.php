<!-- Modal Bootstrap para actualizar pasaje y tardeada -->
<div class="modal fade" id="modalTardeadaPasaje" tabindex="-1" aria-labelledby="modalTardeadaPasajeLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content border-0 shadow-lg rounded-4">
      <div class="modal-header bg-gradient bg-primary text-white py-3 border-bottom-0 rounded-top-4">
        <h5 class="modal-title fw-bold" id="modalTardeadaPasajeLabel">
           Actualizar Pasaje / Tardeada
        </h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar"></button>
      </div>
      <div class="modal-body p-4">
        <form id="form-tardeada-pasaje">
          <!-- Campo Pasaje -->
          <div class="mb-4">
            <label for="input-pasaje" class="form-label small fw-bold text-uppercase text-muted mb-1">Pasaje</label>
            <div class="input-group">
              <span class="input-group-text bg-light border-end-0 text-muted">$</span>
              <input type="number" step="0.01" class="form-control border-start-0 bg-light-subtle" id="input-pasaje" placeholder="0.00">
            </div>
          </div>

          <!-- Campo Comida -->
          <div class="mb-4">
            <label for="input-comida" class="form-label small fw-bold text-uppercase text-muted mb-1">Comida</label>
            <div class="input-group">
              <span class="input-group-text bg-light border-end-0 text-muted">$</span>
              <input type="number" step="0.01" class="form-control border-start-0 bg-light-subtle" id="input-comida" placeholder="0.00">
            </div>
          </div>

          <!-- Campo Tardeada -->
          <div class="mb-3">
            <label for="input-tardeada" class="form-label small fw-bold text-uppercase text-muted mb-1">Tardeada</label>
            <div class="input-group">
              <span class="input-group-text bg-light border-end-0 text-muted">$</span>
              <input type="number" step="0.01" class="form-control border-start-0 bg-light-subtle" id="input-tardeada" placeholder="0.00">
            </div>
          </div>
        </form>
      </div>
      <div class="modal-footer border-top-0 p-4 pt-0">
        <button type="button" class="btn btn-light fw-semibold px-4" data-bs-dismiss="modal">Cancelar</button>
        <button type="button" class="btn btn-primary fw-bold px-4 shadow-sm" id="btn-guardar-tardeada-pasaje">
          Guardar Cambios
        </button>
      </div>
    </div>
  </div>
</div>
