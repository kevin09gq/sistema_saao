<!-- Modal: Días Inhábiles -->
<div class="modal fade" id="modal-dias-inhabiles" tabindex="-1" aria-labelledby="modalDiasInhabilesLabel" aria-hidden="true">
  <div class="modal-dialog modal-sm modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="modalDiasInhabilesLabel">Marcar día inhábil</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
      </div>
      <div class="modal-body">
        <div class="mb-3">
          <label for="select-dia-semana" class="form-label">Día de la semana</label>
          <select id="select-dia-semana" class="form-select">
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
      
        <div class="mb-3">
          <label for="select-tipo-dias" class="form-label">Tipo</label>
          <select id="select-tipo-dias" class="form-select">
            <option value="">- Seleccionar tipo -</option>
            <option value="DESCANSO">DESCANSO</option>
            <option value="FESTIVO">FESTIVO</option>
          </select>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
        <button type="button" class="btn btn-primary" id="btn-guardar-dia-inhabil">Guardar</button>
      </div>
    </div>
  </div>
</div>
