<<<<<<< HEAD
<!-- Modal -->
<div class="modal fade" id="modalCorteNominaDetalles" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">

            <div class="modal-header bg-success text-white">
                <h1 class="modal-title fs-5">Detalles de la nomina de Cortadores</h1>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>

            <div class="modal-body">
                <!-- Tabs de navegacion -->
                <ul class="nav nav-tabs" id="myTab" role="tablist">
                    <li class="nav-item" role="presentation">
                        <button class="nav-link active" id="detalles-nomina-tab" data-bs-toggle="tab" data-bs-target="#detalles-nomina-tab-pane" type="button" role="tab" aria-controls="detalles-nomina-tab-pane" aria-selected="true">Detalles</button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="lista-nomina-tab" data-bs-toggle="tab" data-bs-target="#lista-nomina-tab-pane" type="button" role="tab" aria-controls="lista-nomina-tab-pane" aria-selected="false">Nomina</button>
                    </li>
                </ul>

                <div class="tab-content" id="myTabContent">

                    <div class="tab-pane fade show active" id="detalles-nomina-tab-pane" role="tabpanel" aria-labelledby="detalles-nomina-tab" tabindex="0">
                        <div class="card p-3 mt-3">
                            <ul class="list-group list-group-flush">
                                <li class="list-group-item d-flex">
                                    <span class="fw-bold text-secondary me-auto">Nombre:</span>
                                    <span id="span_nombre_cortador">NOMBRE TEMPORAL DEL CORTADOR</span>
                                </li>
                                <li class="list-group-item d-flex">
                                    <span class="fw-bold text-secondary me-auto">Sueldo diario:</span>
                                    <span id="span_sueldo_diario">$0000.00</span>
                                </li>
                                <li class="list-group-item d-flex">
                                    <span class="fw-bold text-secondary me-auto">Dias trabajados:</span>
                                    <span id="span_dias_trabajados">0</span>
                                </li>
                                <li class="list-group-item d-flex">
                                    <span class="fw-bold text-secondary me-auto">Total efectivo:</span>
                                    <span id="span_total_efectivo">$0000.00</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div class="tab-pane fade" id="lista-nomina-tab-pane" role="tabpanel" aria-labelledby="lista-nomina-tab" tabindex="0">
                        <div class="mt-3">
                            <table class="table table-bordered align-middle">
                                <thead class="table-light">
                                    <tr>
                                        <th style="width: 20%;">DIA</th>
                                        <th style="width: 20%;">FECHA</th>
                                        <th style="width: 50%;">PAGO</th>
                                        <th class="text-center" style="width: 10%;">Accion</th>
                                    </tr>
                                </thead>
                                <tbody id="cuerpo_tabla_pagos_por_dia_nomina"><!-- Cuerpo de la nomina --></tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal-footer">
                <span class="badge text-bg-success me-auto fs-5" id="badge_nombre_cortador">NOMBRE DEL CORTADOR</span>

                <button
                    type="button" 
                    class="btn btn-outline-danger" 
                    id="btn_borrar_nomina"
                    title="Borrar nomina completa"><i class="bi bi-trash-fill"></i></button>
                <button
                    type="button" 
                    class="btn btn-secondary" 
                    data-bs-dismiss="modal"><i class="bi bi-x-circle me-2"></i>Cerrar</button>
                <button 
                    type="button" 
                    class="btn btn-success fw-bold shadow-sm" 
                    id="btn_guardar_cambios_nomina_corte"><i class="bi bi-check2-square me-2"></i>Guardar Cambios</button>
            </div>
        </div>
    </div>
=======
<!-- Modal -->
<div class="modal fade" id="modalCorteNominaDetalles" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content">

            <div class="modal-header bg-success text-white">
                <h1 class="modal-title fs-5">Detalles de la nomina de Cortadores</h1>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>

            <div class="modal-body">
                <!-- Tabs de navegacion -->
                <ul class="nav nav-tabs" id="myTab" role="tablist">
                    <li class="nav-item" role="presentation">
                        <button class="nav-link active" id="detalles-nomina-tab" data-bs-toggle="tab" data-bs-target="#detalles-nomina-tab-pane" type="button" role="tab" aria-controls="detalles-nomina-tab-pane" aria-selected="true">Detalles</button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="lista-nomina-tab" data-bs-toggle="tab" data-bs-target="#lista-nomina-tab-pane" type="button" role="tab" aria-controls="lista-nomina-tab-pane" aria-selected="false">Nomina</button>
                    </li>
                </ul>

                <div class="tab-content" id="myTabContent">

                    <div class="tab-pane fade show active" id="detalles-nomina-tab-pane" role="tabpanel" aria-labelledby="detalles-nomina-tab" tabindex="0">
                        <div class="card p-3 mt-3">
                            <ul class="list-group list-group-flush">
                                <li class="list-group-item d-flex">
                                    <span class="fw-bold text-secondary me-auto">Nombre:</span>
                                    <span id="span_nombre_cortador">NOMBRE TEMPORAL DEL CORTADOR</span>
                                </li>
                                <li class="list-group-item d-flex">
                                    <span class="fw-bold text-secondary me-auto">Sueldo diario:</span>
                                    <span id="span_sueldo_diario">$0000.00</span>
                                </li>
                                <li class="list-group-item d-flex">
                                    <span class="fw-bold text-secondary me-auto">Dias trabajados:</span>
                                    <span id="span_dias_trabajados">0</span>
                                </li>
                                <li class="list-group-item d-flex">
                                    <span class="fw-bold text-secondary me-auto">Total efectivo:</span>
                                    <span id="span_total_efectivo">$0000.00</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div class="tab-pane fade" id="lista-nomina-tab-pane" role="tabpanel" aria-labelledby="lista-nomina-tab" tabindex="0">
                        <div class="mt-3">
                            <table class="table table-bordered align-middle">
                                <thead class="table-light">
                                    <tr>
                                        <th style="width: 20%;">DIA</th>
                                        <th style="width: 20%;">FECHA</th>
                                        <th style="width: 50%;">PAGO</th>
                                        <th class="text-center" style="width: 10%;">Accion</th>
                                    </tr>
                                </thead>
                                <tbody id="cuerpo_tabla_pagos_por_dia_nomina"><!-- Cuerpo de la nomina --></tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal-footer">
                <span class="badge text-bg-success me-auto fs-5" id="badge_nombre_cortador">NOMBRE DEL CORTADOR</span>

                <button
                    type="button" 
                    class="btn btn-outline-danger" 
                    id="btn_borrar_nomina"
                    title="Borrar nomina completa"><i class="bi bi-trash-fill"></i></button>
                <button
                    type="button" 
                    class="btn btn-secondary" 
                    data-bs-dismiss="modal"><i class="bi bi-x-circle me-2"></i>Cerrar</button>
                <button 
                    type="button" 
                    class="btn btn-success fw-bold shadow-sm" 
                    id="btn_guardar_cambios_nomina_corte"><i class="bi bi-check2-square me-2"></i>Guardar Cambios</button>
            </div>
        </div>
    </div>
>>>>>>> d47f2597972a63bfde96235bb44ebc1d4a071513
</div>