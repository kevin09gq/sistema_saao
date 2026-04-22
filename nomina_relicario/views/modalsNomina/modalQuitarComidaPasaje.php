<!-- Modal Bootstrap para quitar comida/pasaje a empleados -->
<div class="modal fade" id="modalQuitarComidaPasaje" tabindex="-1" aria-labelledby="modalQuitarComidaPasajeLabel" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-scrollable">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="modalQuitarComidaPasajeLabel">Gestionar comida / pasaje a jornaleros</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
      </div>
      <div class="modal-body">
        <div class="row mb-3">
          <div class="col-md-6">
            <label for="select-accion-quitar" class="form-label">Acción</label>
            <select id="select-accion-quitar" class="form-select">
              <option value="">- Seleccionar -</option>
              <optgroup label="Comida">
                <option value="quitar_comida">Quitar comida</option>
                <option value="agregar_comida">Agregar comida</option>
              </optgroup>
              <optgroup label="Pasaje">
                <option value="quitar_pasaje">Quitar pasaje</option>
                <option value="agregar_pasaje">Agregar pasaje</option>
              </optgroup>
              <optgroup label="Ambos">
                <option value="quitar_ambos">Quitar ambos</option>
                <option value="agregar_ambos">Agregar ambos</option>
              </optgroup>
              <optgroup label="Restablecer">
                <option value="restablecer_todos">Restablecer valores automáticos</option>
              </optgroup>
            </select>
          </div>
        </div>

        <div class="table-responsive border rounded" style="max-height: 400px; overflow-y: auto;">
          <table class="table table-sm table-hover">
            <thead class="table-light">
              <tr>
                <th><input type="checkbox" id="checkbox-seleccionar-todos-quitar"></th>
                <th>Clave</th>
                <th>Nombre</th>
              </tr>
            </thead>
            <tbody id="tbody-empleados-quitar">
              <!-- Se llena dinámicamente -->
            </tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
        <button type="button" class="btn btn-primary" id="btn-aplicar-quitar">Aplicar cambios</button>
      </div>
    </div>
  </div>
</div>
