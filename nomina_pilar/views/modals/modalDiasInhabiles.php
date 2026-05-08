<!-- Modal: Días Inhábiles -->
<div class="modal fade" id="modal-dias-inhabiles" tabindex="-1" aria-labelledby="modalDiasInhabilesLabel" aria-hidden="true">
  <div class="modal-dialog modal-sm modal-dialog-centered">
    <div class="modal-content border-0 shadow-lg rounded-4">
      <div class="modal-header bg-gradient bg-info text-white py-3 border-bottom-0 rounded-top-4">
        <h5 class="modal-title fw-bold" id="modalDiasInhabilesLabel">Marcar Día Inhábil</h5>
        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar"></button>
      </div>
      <div class="modal-body p-4">
        <!-- Selección de Día -->
        <div class="mb-4">
          <label for="select-dia-semana" class="form-label small fw-bold text-uppercase text-muted mb-1">Día de la semana</label>
          <select id="select-dia-semana" class="form-select bg-light-subtle py-2">
            <option value="">- Seleccionar día -</option>
            <option value="LUNES">LUNES</option>
            <option value="MARTES">MARTES</option>
            <option value="MIERCOLES">MIÉRCOLES</option>
            <option value="JUEVES">JUEVES</option>
            <option value="VIERNES">VIERNES</option>
            <option value="SABADO">SÁBADO</option>
            <option value="DOMINGO">DOMINGO</option>
          </select>
        </div>
      
        <!-- Selección de Tipo -->
        <div class="mb-2">
          <label for="select-tipo-dias" class="form-label small fw-bold text-uppercase text-muted mb-1">Tipo</label>
          <select id="select-tipo-dias" class="form-select bg-light-subtle py-2">
            <option value="">- Seleccionar tipo -</option>
            <option value="DESCANSO">DESCANSO</option>
            <option value="FESTIVO">FESTIVO</option>
          </select>
        </div>
      </div>
      <div class="modal-footer border-top-0 p-4 pt-0 d-flex justify-content-between align-items-center">
        <button type="button" class="btn btn-link text-danger text-decoration-none p-0 small fw-bold" id="btn-eliminar-dia-inhabil-general">
          <i class="bi bi-trash"></i> Eliminar
        </button>
        <div class="d-flex gap-2">
          <button type="button" class="btn btn-light fw-semibold px-3" data-bs-dismiss="modal">Cerrar</button>
          <button type="button" class="btn btn-info text-white fw-bold px-3 shadow-sm" id="btn-guardar-dia-inhabil">Guardar</button>
        </div>
      </div>
    </div>
  </div>
</div>
