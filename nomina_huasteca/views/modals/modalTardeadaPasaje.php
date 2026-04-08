<!-- Modal Bootstrap para actualizar pasaje y tardeada -->
<div class="modal fade" id="modalTardeadaPasaje" tabindex="-1" aria-labelledby="modalTardeadaPasajeLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="modalTardeadaPasajeLabel">Actualizar pasaje / tardeada</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
      </div>
      <div class="modal-body">
        <form id="form-tardeada-pasaje">
          <div class="mb-3">
            <label for="input-pasaje" class="form-label">Pasaje</label>
            <input type="number" step="0.01" class="form-control" id="input-pasaje" placeholder="0.00">
          </div>
           <div class="mb-3">
            <label for="input-comida" class="form-label">Comida</label>
            <input type="number" step="0.01" class="form-control" id="input-comida" placeholder="0.00">
          </div>
          <div class="mb-3">
            <label for="input-tardeada" class="form-label">Tardeada</label>
            <input type="number" step="0.01" class="form-control" id="input-tardeada" placeholder="0.00">
          </div>
          
        </form>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
        <button type="button" class="btn btn-primary" id="btn-guardar-tardeada-pasaje">Guardar</button>
      </div>
    </div>
  </div>
</div>
