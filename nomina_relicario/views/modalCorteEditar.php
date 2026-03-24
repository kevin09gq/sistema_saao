<!-- Modal -->
<div class="modal fade" id="modalCorteRejasDetalles" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-xl">
        <div class="modal-content">

            <div class="modal-header bg-success text-white">
                <h1 class="modal-title fs-5">Detalles del Corte de Rejas</h1>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>

            <div class="modal-body">
                <!-- Tabs de navegacion -->
                <ul class="nav nav-tabs" id="myTab" role="tablist">
                    <li class="nav-item" role="presentation">
                        <button class="nav-link active" id="detalles-reja-tab" data-bs-toggle="tab" data-bs-target="#detalles-reja-tab-pane" type="button" role="tab" aria-controls="detalles-reja-tab-pane" aria-selected="true">Detalles</button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="lista-reja-tab" data-bs-toggle="tab" data-bs-target="#lista-reja-tab-pane" type="button" role="tab" aria-controls="lista-reja-tab-pane" aria-selected="false">Rejas</button>
                    </li>
                </ul>

                <div class="tab-content" id="myTabContent">

                    <div class="tab-pane fade show active" id="detalles-reja-tab-pane" role="tabpanel" aria-labelledby="detalles-reja-tab" tabindex="0">
                        <div class="card p-3 mt-3">
                            <ul class="list-group list-group-flush">
                                <li class="list-group-item d-flex">
                                    <span class="fw-bold text-secondary me-auto">Nombre:</span>
                                    <span id="span_nombre_cortador_reja">NOMBRE TEMPORAL DEL CORTADOR</span>
                                </li>
                                <li class="list-group-item d-flex">
                                    <span class="fw-bold text-secondary me-auto">Total rejas:</span>
                                    <span id="span_total_rejas">000</span>
                                </li>
                                <li class="list-group-item d-flex">
                                    <span class="fw-bold text-secondary me-auto">Precio por reja:</span>
                                    <span id="span_precio_reja">$000.00</span>
                                </li>
                                <li class="list-group-item d-flex">
                                    <span class="fw-bold text-secondary me-auto">Total efectivo:</span>
                                    <span id="span_total_efectivo_reja">$0000.00</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div class="tab-pane fade" id="lista-reja-tab-pane" role="tabpanel" aria-labelledby="lista-reja-tab" tabindex="0">
                        <!-- Se listan los tickets de forma individual -->
                    </div>
                </div>
            </div>

            <div class="modal-footer">
                <span class="badge text-bg-success me-auto fs-5" id="badge_nombre_cortador_reja">NOMBRE DEL CORTADOR</span>
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                <button type="button" class="btn btn-success fw-bold shadow-sm" id="btn_guardar_cambios_reja_corte">Guardar Cambios</button>
            </div>
        </div>
    </div>
</div>