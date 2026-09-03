<div class="modal fade" id="modal_poda_detalle" tabindex="-1" aria-labelledby="modal_poda_detalle_label" aria-hidden="true">
  <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
    <div class="modal-content">

      <div class="modal-header bg-success bg-gradient text-white">
        <h1 class="modal-title fs-5" id="modal_poda_detalle_label">Detalles de la Poda de Árboles - Rancho EL RELICARIO</h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>

      <div class="modal-body">
        <ul class="nav nav-tabs" id="podaTab" role="tablist">
          <li class="nav-item" role="presentation">
            <button class="nav-link text-success active" id="detalles-tab" data-bs-toggle="tab" data-bs-target="#detalles-tab-pane" type="button" role="tab" aria-controls="detalles-tab-pane" aria-selected="true">
              <strong>Detalles</strong>
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link text-success" id="movimientos-tab" data-bs-toggle="tab" data-bs-target="#movimientos-tab-pane" type="button" role="tab" aria-controls="movimientos-tab-pane" aria-selected="false">
              <strong>Movimientos Poda</strong>
            </button>
          </li>
        </ul>

        <div class="tab-content" id="podaTabContent">

          <div class="tab-pane fade show active" id="detalles-tab-pane" role="tabpanel" aria-labelledby="detalles-tab" tabindex="0">
            <div class="card p-3 my-3">
              <ul class="list-group list-group-flush">
                <li class="list-group-item d-flex">
                  <span class="fw-bold text-secondary me-auto">Empleado:</span>
                  <span id="nombre_empleado_poda">NOMBRE_TEMPORAL</span>
                </li>
                <li class="list-group-item d-flex">
                  <span class="fw-bold text-secondary me-auto">Total Árboles podados:</span>
                  <span id="total_arboles">000</span>
                </li>
                <li class="list-group-item d-flex">
                  <span class="fw-bold text-secondary me-auto">Pago por árbol:</span>
                  <span id="monto_por_arbol">$000.00</span>
                </li>
                <li class="list-group-item d-flex">
                  <span class="fw-bold text-secondary me-auto">Total efectivo:</span>
                  <span id="total_efectivo_poda">$0000.00</span>
                </li>
              </ul>
            </div>
          </div>

          <div class="tab-pane fade" id="movimientos-tab-pane" role="tabpanel" aria-labelledby="movimientos-tab" tabindex="0">
            <div class="my-3">
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th class="text-center">ID</th>
                      <th class="text-center">Fecha</th>
                      <th class="text-center">Árboles podados</th>
                      <th class="text-center">Pago por árbol</th>
                      <th class="text-center">Total</th>
                      <th class="text-center">Opciones</th>
                    </tr>
                  </thead>
                  <tbody id="movimientos_poda_body" class="table-group-divider">
                    <!-- Aquí se llenarán los movimientos de poda -->
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>

      </div>
      <div class="modal-footer p-2">
        <span class="badge text-bg-success me-auto fs-5" id="visual_nombre_poda">NOMBRE_TEMPORAL</span>
        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal"><i class="bi bi-x-circle me-2"></i>Cerrar</button>
        <!-- <button type="button" class="btn btn-outline-success fw-bolder" id="btn_guardar_cambios_poda"><i class="bi bi-check2-circle me-2"></i>Guardar cambios</button> -->
      </div>
    </div>
  </div>
</div>