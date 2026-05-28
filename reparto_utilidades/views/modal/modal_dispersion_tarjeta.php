<!-- Modal -->
<div class="modal fade" id="modal_dispersion_tarjeta" tabindex="-1" aria-labelledby="modal_dispersion_tarjeta_label" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
    <div class="modal-dialog modal-dialog-scrollable modal-dialog-centered modal-xl">
        <div class="modal-content">
            <div class="modal-header bg-primary text-white text-uppercase">
                <h1 class="modal-title fs-5" id="modal_dispersion_tarjeta_label">Dispersión de Tarjetas</h1>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            
            <div class="modal-body">
                <div class="row g-3 align-items-end mb-3">
                    <div class="col-5">
                        <label class="form-label small fw-bold text-muted">Busqueda:</label>
                        <input class="form-control form-control-sm shadow-sm" type="text" id="busqueda_tarjeta" placeholder="Buscar...">
                    </div>
                    <div class="col-auto">
                        <label class="form-label small fw-bold text-muted">Departamento</label>
                        <select class="form-select form-select-sm" id="select_departamento_tarjeta">
                            <option value="-1" selected>Todos los departamentos</option>
                        </select>
                    </div>
                </div>

                <div class="table-responsive">
                    <table class="table table-sm table-hover" id="tabla_dispersion_tarjetas">
                        <thead class="table-light">
                            <tr>
                                <th class="text-center">#</th>
                                <th class="text-center">Clave</th>
                                <th>Empleado</th>
                                <th class="text-center">Tarjeta ($)</th>
                                <th class="text-center">Opcion</th>
                            </tr>
                        </thead>
                        <tbody id="cuerpo_tabla_tarjetas"></tbody>
                    </table>
                </div>
            </div>

            <!-- NUEVA SECCIÓN: Modal Footer con los tres botones -->
            <div class="modal-footer d-flex justify-content-between">
                <div></div>
                
                <div class="d-flex gap-2">
                    <!-- Botones de Acción (Lado derecho) -->
                    <button type="button" class="btn btn-outline-danger" id="btn_quitar_tarjetas">
                        <i class="bi bi-x-circle me-1"></i>Quitar tarjetas
                    </button>
                    <button type="button" class="btn btn-outline-success" id="btn_aplicar_tarjetas">
                        <i class="bi bi-check-circle me-1"></i>Aplicar tarjetas
                    </button>
                    <button type="button" class="btn btn-outline-secondary border" data-bs-dismiss="modal">
                        <i class="bi bi-box-arrow-right me-1"></i>Cerrar
                    </button>
                </div>
            </div>

        </div>
    </div>
</div>