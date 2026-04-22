<!-- Modal para generar ticket manual de nómina confianza -->
<div class="modal fade" id="modalTicketManualConfianza" tabindex="-1" aria-labelledby="modalTicketManualConfianzaLabel" aria-hidden="true">
  <div class="modal-dialog modal-xl">
    <div class="modal-content">
      <form id="formTicketManual">
        <div class="modal-header">
          <h5 class="modal-title" id="modalTicketManualLabel"><i class="bi bi-receipt"></i> Generar Ticket Manual</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>
        <div class="modal-body">
          <h6 class="mb-3">Información del Empleado</h6>
          <div class="row g-3">
            <div class="col-md-2">
              <label class="form-label">Clave</label>
              <div class="position-relative">
                <input type="text" class="form-control input-with-clear" id="input_clave" name="clave" placeholder="001" required autocomplete="off">
                <button class="btn-clear-inside btn-clear-clave" type="button" aria-label="Limpiar clave">
                  <i class="bi bi-x-lg"></i>
                </button>
              </div>
              <div id="suggestions_clave" class="list-group position-absolute" style="z-index: 1000; display: none; max-height: 300px; overflow-y: auto;"></div>
            </div>
            <div class="col-md-4">
              <label class="form-label">Nombre Completo</label>
              <div class="position-relative">
                <input type="text" class="form-control input-with-clear" id="input_nombre" name="nombre" placeholder="Escriba para buscar..." required autocomplete="off">
                <button class="btn-clear-inside btn-clear-nombre" type="button" aria-label="Limpiar nombre">
                  <i class="bi bi-x-lg"></i>
                </button>
              </div>
              <div id="suggestions_nombre" class="list-group position-absolute" style="z-index: 1000; display: none; max-height: 300px; overflow-y: auto; width: 95%;"></div>
            </div>
            <div class="col-md-3">
              <label class="form-label">Departamento</label>
              <input type="text" class="form-control" name="departamento" placeholder="Departamento">
            </div>
            <!-- Eliminados campos RFC e IMSS -->
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
              <input type="number" step="0.01" class="form-control" name="sueldo_diario" placeholder="0.00">
            </div>
            <div class="col-md-3">
              <label class="form-label">Salario Semanal</label>
              <input type="number" step="0.01" class="form-control" name="sueldo_semanal" placeholder="0.00">
            </div>
          </div>

          <hr class="my-4">

          <div class="row">
            <div class="col-md-6">
              <h6 class="mb-3"><i class="bi bi-plus-circle text-success"></i> Percepciones</h6>
              <div class="row g-2 mb-2">
                <div class="col-md-4">
                  <label class="form-label">Sueldo Semanal</label>
                  <input type="number" step="0.01" class="form-control" name="sueldo_semanal" placeholder="0.00">
                </div>
                <div class="col-md-4">
                  <label class="form-label">Vacaciones</label>
                  <input type="number" step="0.01" class="form-control calculo-extra" name="vacaciones" placeholder="0.00" onchange="calcularTotalExtra()">
                </div>
              </div>
              <div id="percepciones-list" class="mb-2"></div>
              <button type="button" class="btn btn-sm btn-success" onclick="agregarPercepcion()">
                <i class="bi bi-plus"></i> Agregar Percepción
              </button>
            </div>

            <div class="col-md-6">
              <h6 class="mb-3"><i class="bi bi-dash-circle text-danger"></i> Deducciones</h6>
              <div class="row g-2 mb-2">
                <div class="col-md-6">
                  <label class="form-label">ISR ($)</label>
                  <input type="number" step="0.01" class="form-control" name="isr" placeholder="0.00">
                </div>
                <div class="col-md-6">
                  <label class="form-label">IMSS ($)</label>
                  <input type="number" step="0.01" class="form-control" name="imss_descuento" placeholder="0.00">
                </div>
                <div class="col-md-6">
                  <label class="form-label">INFONAVIT ($)</label>
                  <input type="number" step="0.01" class="form-control" name="infonavit" placeholder="0.00">
                </div>
                <div class="col-md-6">
                  <label class="form-label">Tarjeta ($)</label>
                  <input type="number" step="0.01" class="form-control" name="neto_pagar" placeholder="0.00">
                </div>
                <div class="col-md-6">
                  <label class="form-label">Préstamo ($)</label>
                  <input type="number" step="0.01" class="form-control" name="prestamo" placeholder="0.00">
                </div>
                <div class="col-md-6">
                  <label class="form-label">Uniformes ($)</label>
                  <input type="number" step="0.01" class="form-control" name="uniformes" placeholder="0.00">
                </div>
                <div class="col-md-6">
                  <label class="form-label">Checador ($)</label>
                  <input type="number" step="0.01" class="form-control" name="checador" placeholder="0.00">
                </div>
                <div class="col-md-6">
                  <label class="form-label">Ajustes al Sub ($)</label>
                  <input type="number" step="0.01" class="form-control" name="ajustes_sub" placeholder="0.00">
                </div>
                <div class="col-md-6">
                  <label class="form-label">Retardos ($)</label>
                  <input type="number" step="0.01" class="form-control" name="retardos" placeholder="0.00">
                </div>
                <div class="col-md-6">
                  <label class="form-label">Permisos ($)</label>
                  <input type="number" step="0.01" class="form-control" name="permisos" placeholder="0.00">
                </div>
                <div class="col-md-6">
                  <label class="form-label">Inasistencias ($)</label>
                  <input type="number" step="0.01" class="form-control" name="inasistencias" placeholder="0.00">
                </div>
              </div>
              <div id="deducciones-list" class="mb-2"></div>
              <button type="button" class="btn btn-sm btn-danger" onclick="agregarDeduccion()">
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
