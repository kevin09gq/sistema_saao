<!-- Modal para Editar Datos del Empleado -->


<div class="modal fade" id="modal_editar" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="modalEditarLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-scrollable modal-dialog-centered modal-xl">
    <div class="modal-content border-0 shadow-lg">
      <form method="post" id="form_editar_empleado">

        <div class="modal-header bg-success text-white py-3">
          <h1 class="modal-title fs-5 d-flex align-items-center" id="modalEditarLabel">
            <i class="bi bi-pencil-square me-2"></i> Actualizar Información de Cálculo
          </h1>
          <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>

        <div class="modal-body p-4 bg-light">
          <div class="card border-0 shadow-sm mb-4">
            <div class="card-body bg-white rounded-3">
              <p class="text-uppercase text-muted fw-bold small mb-3 border-bottom pb-2">Datos de Referencia</p>
              <div class="row g-3">
                <input type="text" id="id_empleado" name="id_empleado" readonly hidden>

                <div class="col-md-2">
                  <label class="form-label text-secondary small fw-semibold" for="clave_empleado">Clave</label>
                  <input type="text" class="form-control-plaintext fw-bold text-dark border-start ps-2" id="clave_empleado" name="clave_empleado" readonly tabindex="-1">
                </div>

                <div class="col-md-5">
                  <label class="form-label text-secondary small fw-semibold" for="nombre_empleado">Nombre del Colaborador</label>
                  <input type="text" class="form-control-plaintext fw-bold text-dark border-start ps-2" id="nombre_empleado" name="nombre_empleado" readonly tabindex="-1">
                </div>

                <div class="col-md-5">
                  <label class="form-label text-secondary small fw-semibold" for="nombre_departamento">Departamento</label>
                  <input type="text" class="form-control-plaintext fw-bold text-dark border-start ps-2" id="nombre_departamento" name="nombre_departamento" readonly tabindex="-1">
                </div>
              </div>
            </div>
          </div>

          <div class="row g-4">
            <div class="col-lg-6">
              <div class="p-3 bg-white rounded-3 border h-100 shadow-sm">
                <h6 class="fw-bold mb-3 border-bottom pb-2 text-success">
                  <i class="bi bi-calendar-event me-2"></i>Criterio de Antigüedad
                </h6>
                <div class="row g-3">
                  <div class="col-md-6">
                    <label class="form-label fw-semibold small" for="fecha_ingreso_real">F. Ingreso Real (FIR)</label>
                    <div class="input-group">
                      <div class="input-group-text bg-white">
                        <input class="form-check-input mt-0" type="radio" value="1" name="usar_fecha" id="check_usar_fecha_real">
                      </div>
                      <input type="date" class="form-control shadow-sm" id="fecha_ingreso_real" name="fecha_ingreso_real">
                    </div>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label fw-semibold small" for="fecha_ingreso_imss">F. Ingreso IMSS (FII)</label>
                    <div class="input-group">
                      <div class="input-group-text bg-white">
                        <input class="form-check-input mt-0" type="radio" value="0" name="usar_fecha" id="check_usar_fecha_imss">
                      </div>
                      <input type="date" class="form-control shadow-sm" id="fecha_ingreso_imss" name="fecha_ingreso_imss">
                    </div>
                  </div>
                </div>
                <div class="mt-3 alert alert-warning py-2 small border-0 mb-0">
                  <i class="bi bi-info-circle-fill me-2"></i> Selecciona la fecha base para los días laborados.
                </div>
              </div>
            </div>

            <div class="col-lg-6">
              <div class="p-3 bg-white rounded-3 border h-100 shadow-sm">
                <h6 class="fw-bold mb-3 border-bottom pb-2 text-success">
                  <i class="bi bi-gear-fill me-2"></i>Variables de Cálculo
                </h6>
                <div class="row g-3">

                  <div class="col-md-4">
                    <label class="form-label fw-semibold small" for="tmp_dias_trabajados" title="Días trabajados">Días Trab.</label>
                    <input type="number" min="0" max="365" class="form-control shadow-sm" id="tmp_dias_trabajados" name="tmp_dias_trabajados" placeholder="0">
                  </div>

                  <div class="col-md-4">
                    <label class="form-label fw-semibold small" for="ausencias">Ausencias</label>
                    <div class="input-group">
                      <div class="input-group-text bg-white">
                        <input class="form-check-input mt-0" type="checkbox" id="usar_ausencias" name="usar_ausencias">
                      </div>
                      <input type="number" min="0" class="form-control" id="ausencias" name="ausencias" placeholder="0">
                    </div>
                  </div>

                  <div class="col-md-4">
                    <label class="form-label fw-bold small text-info" for="dias_trabajados">Total Días</label>
                    <div class="input-group">
                      <input type="number" class="form-control bg-info-subtle border-info-subtle fw-bold text-info" id="dias_trabajados" name="dias_trabajados" readonly placeholder="0">
                      <span class="input-group-text bg-info-subtle border-info-subtle"><i class="bi bi-calculator text-info"></i></span>
                    </div>
                  </div>
                  
                  <div class="col-md-6">
                    <label class="form-label fw-semibold small" for="salario_diario">Salario Diario</label>
                    <div class="input-group">
                      <span class="input-group-text bg-light text-success fw-bold">$</span>
                      <input type="number" step="0.01" min="0" class="form-control shadow-sm" id="salario_diario" name="salario_diario" placeholder="0.00">
                    </div>
                  </div>

                  <div class="col-md-6">
                    <label class="form-label fw-semibold small" for="fecha_pago">Fecha de Pago</label>
                    <div class="input-group">
                      <span class="input-group-text bg-light"><i class="bi bi-calendar-check"></i></span>
                      <input type="date" class="form-control shadow-sm" id="fecha_pago" name="fecha_pago">
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="col-12">
              <div class="p-3 bg-white rounded-3 border shadow-sm">
                <h6 class="fw-bold mb-3 border-bottom pb-2 text-dark">
                  <i class="bi bi-calculator-fill me-2 text-success"></i>Cálculo Neto a Pagar
                </h6>
                <div class="row g-3 align-items-end">
                  
                  <div class="col-md-3">
                    <label class="form-label fw-bold small text-warning text-uppercase" for="aguinaldo">Aguinaldo</label>
                    <div class="input-group">
                      <span class="input-group-text bg-warning-subtle text-warning border-warning-subtle fw-bold">$</span>
                      <input type="number" step="0.01" class="form-control border-warning-subtle fw-semibold shadow-sm" id="aguinaldo" name="aguinaldo" placeholder="0.00">
                    </div>
                  </div>

                  <div class="col-md-2">
                    <label class="form-label fw-semibold small text-danger" for="isr">ISR</label>
                    <div class="input-group">
                      <span class="input-group-text bg-danger-subtle text-danger border-danger-subtle fw-bold">$</span>
                      <input type="number" step="0.01" min="0" class="form-control border-danger-subtle shadow-sm" id="isr" name="isr" placeholder="0.00">
                    </div>
                  </div>

                  <div class="col-md-2">
                    <label class="form-label fw-semibold small text-primary text-uppercase" for="tarjeta">Tarjeta</label>
                    <div class="input-group">
                      <span class="input-group-text bg-primary-subtle text-primary border-primary-subtle fw-bold"><i class="bi bi-credit-card"></i></span>
                      <input type="number" step="0.01" min="0" class="form-control border-primary-subtle shadow-sm" id="tarjeta" name="tarjeta" placeholder="0.00">
                    </div>
                  </div>

                  <div class="col-md-5">
                    <div class="p-2 bg-success bg-opacity-10 border border-success rounded-3">
                      <label class="form-label fw-bold small text-success text-uppercase mb-1" for="neto_pagar">Neto a Pagar</label>
                      <div class="input-group">
                        <span class="input-group-text bg-success text-white border-success fw-bold">$</span>
                        <input type="number" step="0.01" class="form-control border-success fw-bold text-success" id="neto_pagar" name="neto_pagar" readonly placeholder="0.00" style="background-color: white !important;">
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer bg-light border-0 py-3">
          <button type="button" class="btn btn-outline-secondary px-4 shadow-sm" data-bs-dismiss="modal">Cancelar</button>
          <button type="submit" class="btn btn-success px-5 shadow-sm fw-bold">
            <i class="bi bi-save me-2"></i> Guardar Cambios
          </button>
        </div>
      </form>
    </div>
  </div>
</div>