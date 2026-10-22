<!-- Modal Dispersión de Tarjetas -->
<div class="modal fade" id="modal_dispersion_tarjeta" tabindex="-1" aria-labelledby="modal_dispersion_tarjeta_label" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
    <div class="modal-dialog modal-dialog-scrollable modal-dialog-centered modal-xl">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="modal_dispersion_tarjeta_label">
                    <i class="bi bi-credit-card me-2"></i> Dispersión de Tarjetas
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div class="modal-body p-4">

                <div class="toolbar-card mb-4 p-3">
                    <div class="row g-3 align-items-end">
                        <div class="col-md-5">
                            <label class="form-label" for="busqueda_tarjeta">Búsqueda</label>
                            <div class="input-group">
                                <span class="input-group-text"><i class="bi bi-search"></i></span>
                                <input class="form-control" type="text" id="busqueda_tarjeta" placeholder="Buscar por colaborador o clave...">
                            </div>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label" for="select_departamento_tarjeta">Departamento</label>
                            <select class="form-select" id="select_departamento_tarjeta">
                                <option value="-1" selected>Todos los departamentos</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="card border-0 shadow-sm">
                    <div class="table-responsive">
                        <table class="table table-hover align-middle mb-0" id="tabla_dispersion_tarjetas">
                            <thead>
                                <tr>
                                    <th class="text-center">#</th>
                                    <th class="text-center">Clave</th>
                                    <th>Colaborador</th>
                                    <th class="text-end">Monto Tarjeta ($)</th>
                                    <th class="text-center">Acción</th>
                                </tr>
                            </thead>
                            <tbody id="cuerpo_tabla_tarjetas"></tbody>
                        </table>
                    </div>
                </div>

            </div>
            <div class="modal-footer bg-white d-flex justify-content-end">
                <button type="button" class="btn btn-outline-secondary px-4" data-bs-dismiss="modal">
                    <i class="bi bi-x-circle me-1"></i>Cerrar
                </button>
            </div>
        </div>
    </div>
</div>