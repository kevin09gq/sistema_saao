<!-- Modal para generar ticket manual de nómina pilar -->
<div class="modal fade" id="modalTicketManualPilar" tabindex="-1" aria-labelledby="modalTicketManualPilarLabel" aria-hidden="true">
  <div class="modal-dialog modal-xl">
    <div class="modal-content">
      <form id="formTicketManualPilar">
        <div class="modal-header">
          <h5 class="modal-title" id="modalTicketManualPilarLabel"><i class="bi bi-receipt"></i> Generar Ticket Manual (Pilar)</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <h6 class="mb-3">Información del Empleado</h6>
          <div class="row g-3">
            <div class="col-md-2">
              <label class="form-label">Clave</label>
              <div class="position-relative">
                <input type="text" class="form-control input-with-clear" id="input_clave_manual" name="clave" placeholder="001" required autocomplete="off">
                <button class="btn-clear-inside btn-clear-clave" type="button" aria-label="Limpiar clave">
                  <i class="bi bi-x-lg"></i>
                </button>
              </div>
              <div id="suggestions_clave_manual" class="list-group position-absolute" style="z-index: 1000; display: none; max-height: 300px; overflow-y: auto;"></div>
            </div>
            <div class="col-md-4">
              <label class="form-label">Nombre Completo</label>
              <div class="position-relative">
                <input type="text" class="form-control input-with-clear" id="input_nombre_manual" name="nombre" placeholder="Escriba para buscar..." required autocomplete="off">
                <button class="btn-clear-inside btn-clear-nombre" type="button" aria-label="Limpiar nombre">
                  <i class="bi bi-x-lg"></i>
                </button>
              </div>
              <div id="suggestions_nombre_manual" class="list-group position-absolute" style="z-index: 1000; display: none; max-height: 300px; overflow-y: auto; width: 95%;"></div>
            </div>
            <div class="col-md-3">
              <label class="form-label">Departamento</label>
              <input type="text" class="form-control" name="departamento" placeholder="Departamento">
            </div>
            <div class="col-md-3">
              <label class="form-label">Puesto</label>
              <input type="text" class="form-control" name="nombre_puesto" placeholder="Puesto">
            </div>
            <div class="col-md-3">
              <label class="form-label">Fecha Ingreso</label>
              <input type="date" class="form-control" name="fecha_ingreso">
            </div>
            <div class="col-md-3">
              <label class="form-label">Semana</label>
              <input type="text" class="form-control" name="numero_semana" placeholder="51">
            </div>
            <div class="col-md-3">
              <label class="form-label">Salario Diario</label>
              <input type="number" step="0.01" class="form-control" name="salario_diario" placeholder="0.00">
            </div>
            <div class="col-md-3">
              <label class="form-label">Salario Semanal</label>
              <input type="number" step="0.01" class="form-control" name="salario_semanal" placeholder="0.00">
            </div>
          </div>

          <hr class="my-4">

          <div class="row">
            <div class="col-md-6">
              <h6 class="mb-3"><i class="bi bi-plus-circle text-success"></i> Percepciones</h6>
              <div class="row g-2 mb-2">
                <div class="col-md-4">
                  <label class="form-label">Sueldo Semanal</label>
                  <input type="number" step="0.01" class="form-control" name="salario_semanal" placeholder="0.00">
                </div>
                <div class="col-md-4">
                  <label class="form-label">Pasaje</label>
                  <input type="number" step="0.01" class="form-control calculo-extra" name="pasaje" placeholder="0.00">
                </div>
                <div class="col-md-4">
                  <label class="form-label">Comida</label>
                  <input type="number" step="0.01" class="form-control calculo-extra" name="comida" placeholder="0.00">
                </div>
              </div>
              
              <div class="row g-2 mb-2">
                <div class="col-md-12">
                  <label class="form-label">Tardeada</label>
                  <input type="number" step="0.01" class="form-control calculo-extra" name="tardeada" placeholder="0.00">
                </div>
              </div>
              
              <div id="percepciones-list-manual" class="mb-2"></div>
              <button type="button" class="btn btn-sm btn-success" id="btn_agregar_percepcion_manual">
                <i class="bi bi-plus"></i> Agregar Percepción
              </button>
            </div>

            <div class="col-md-6">
              <h6 class="mb-3"><i class="bi bi-dash-circle text-danger"></i> Deducciones</h6>
              <div class="row g-2 mb-2">
                <div class="col-md-6">
                  <label class="form-label">Retardos ($)</label>
                  <input type="number" step="0.01" class="form-control" name="retardos" placeholder="0.00">
                </div>
                <div class="col-md-6">
                  <label class="form-label">ISR ($)</label>
                  <input type="number" step="0.01" class="form-control" name="isr" placeholder="0.00">
                </div>
                <div class="col-md-6">
                  <label class="form-label">IMSS ($)</label>
                  <input type="number" step="0.01" class="form-control" name="imss_descuento" placeholder="0.00">
                </div>
                <div class="col-md-6">
                  <label class="form-label">Ajuste al Sub ($)</label>
                  <input type="number" step="0.01" class="form-control" name="ajuste_sub" placeholder="0.00">
                </div>
                <div class="col-md-6">
                  <label class="form-label">Infonavit ($)</label>
                  <input type="number" step="0.01" class="form-control" name="infonavit" placeholder="0.00">
                </div>
                <div class="col-md-6">
                  <label class="form-label">Permiso ($)</label>
                  <input type="number" step="0.01" class="form-control" name="permiso" placeholder="0.00">
                </div>
                <div class="col-md-6">
                  <label class="form-label">Inasistencias ($)</label>
                  <input type="number" step="0.01" class="form-control" name="inasistencia" placeholder="0.00">
                </div>
                <div class="col-md-6">
                  <label class="form-label">Uniforme ($)</label>
                  <input type="number" step="0.01" class="form-control" name="uniforme" placeholder="0.00">
                </div>
                <div class="col-md-6">
                  <label class="form-label">Checador ($)</label>
                  <input type="number" step="0.01" class="form-control" name="checador" placeholder="0.00">
                </div>
                <div class="col-md-6">
                  <label class="form-label">Préstamo ($)</label>
                  <input type="number" step="0.01" class="form-control" name="prestamo" placeholder="0.00">
                </div>
                <div class="col-md-6">
                  <label class="form-label">Tarjeta ($)</label>
                  <input type="number" step="0.01" class="form-control" name="tarjeta" placeholder="0.00">
                </div>
              </div>
              <div id="deducciones-list-manual" class="mb-2"></div>
              <button type="button" class="btn btn-sm btn-danger" id="btn_agregar_deduccion_manual">
                <i class="bi bi-plus"></i> Agregar Deducción
              </button>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
          <button type="submit" class="btn btn-primary">
            <i class="bi bi-file-earmark-pdf"></i> Generar Ticket
          </button>
        </div>
      </form>
    </div>
  </div>
</div>
