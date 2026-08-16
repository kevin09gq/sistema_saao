<!-- Modal para mostrar los detalles de la poda EXTRA -->
<div class="modal fade" id="modal_poda_detalle_extra" tabindex="-1" aria-labelledby="modal_poda_detalle_extra_label" aria-hidden="true">
  <div class="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
    <div class="modal-content">
      <div class="modal-header bg-success bg-gradient text-white">
        <h1 class="modal-title fs-5" id="modal_poda_detalle_extra_label">Detalles de la Poda EXTRA - Rancho EL RELICARIO</h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">

        <ul class="nav nav-tabs" id="Tab_extra" role="tablist">
          <li class="nav-item" role="presentation">
            <button class="nav-link active text-success" id="detalles-tab_extra" data-bs-toggle="tab" data-bs-target="#detalles-tab-pane_extra" type="button" role="tab" aria-controls="detalles-tab-pane_extra" aria-selected="true">
              <strong>Detalles</strong>
            </button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link text-success" id="movimientos-tab_extra" data-bs-toggle="tab" data-bs-target="#movimientos-tab-pane_extra" type="button" role="tab" aria-controls="movimientos-tab-pane_extra" aria-selected="false">
              <strong>Movimientos</strong>
            </button>
          </li>
        </ul>

        <div class="tab-content" id="TabContent_extra">

          <div class="tab-pane fade show active" id="detalles-tab-pane_extra" role="tabpanel" aria-labelledby="detalles-tab_extra" tabindex="0">
            <div class="card p-3 my-3">
              <ul class="list-group list-group-flush">
                <li class="list-group-item d-flex">
                  <span class="fw-bold text-secondary me-auto">Empleado:</span>
                  <span id="nombre_empleado_extra">NOMBRE_TEMPORAL</span>
                </li>
                <li class="list-group-item d-flex">
                  <span class="fw-bold text-secondary me-auto">Concepto:</span>
                  <span id="concepto_extra">CONCEPTO_TEMPORAL</span>
                </li>
                <li class="list-group-item d-flex">
                  <span class="fw-bold text-secondary me-auto">Total efectivo:</span>
                  <span id="total_efectivo_extra">$0000.00</span>
                </li>
              </ul>
            </div>
          </div>

          <div class="tab-pane fade" id="movimientos-tab-pane_extra" role="tabpanel" aria-labelledby="movimientos-tab_extra" tabindex="0">
            <div class="my-3">
              <div class="table-responsive">
                <table class="table table-hover">
                  <thead>
                    <tr>
                      <th class="text-center">ID</th>
                      <th class="text-center">CONCEPTO</th>
                      <th class="text-center">FECHA</th>
                      <th class="text-center">MONTO</th>
                      <th class="text-center">OPCIONES</th>
                    </tr>
                  </thead>
                  <tbody id="movimientos_body_extra" class="table-group-divider"><!-- Contenido --></tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <span class="badge text-bg-success me-auto fs-5" id="visual_nombre_poda_extra">NOMBRE_TEMPORAL</span>
        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal"><i class="bi bi-x-circle me-2"></i>Cerrar</button>
      </div>
    </div>
  </div>
</div>