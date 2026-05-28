 <div class="modal fade" id="modalClavesDisponibles" tabindex="-1" aria-labelledby="modalClavesDisponiblesLabel" aria-hidden="true">
    <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content">
            <div class="modal-header bg-primary text-white">
                <h5 class="modal-title" id="modalClavesDisponiblesLabel">
                    <i class="bi bi-key-fill me-2"></i>Claves Disponibles
                </h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div class="modal-body">
                <div class="alert alert-info mb-3" role="alert">
                    <i class="bi bi-info-circle-fill me-1"></i>
                    Selecciona una empresa para ver sus claves. Una clave solo se bloquea si ya existe en esa misma empresa.
                </div>

                <div class="row g-3 align-items-end mb-3">
                    <div class="col-md-5">
                        <label for="selectEmpresaClaves" class="form-label">Empresa</label>
                        <select class="form-select" id="selectEmpresaClaves">
                            <option value="">-- Selecciona una empresa --</option>
                        </select>
                    </div>
                    <div class="col-md-4">
                        <label for="buscarClaveDisponible" class="form-label">Buscar clave</label>
                        <input type="text" class="form-control" id="buscarClaveDisponible" placeholder="Ej: 015 o SS/015">
                    </div>
                    <div class="col-md-3">
                        <button type="button" class="btn btn-outline-primary w-100" id="btnRecargarClavesDisponibles">
                            <i class="bi bi-arrow-clockwise me-1"></i>Actualizar
                        </button>
                    </div>
                </div>

                <div class="d-flex flex-wrap gap-2 mb-3 small">
                    <span class="badge text-bg-success">Disponible</span>
                    <span class="badge text-bg-danger">Ocupada en esta empresa</span>
                    <span class="badge text-bg-warning">Usada en otra empresa o sin empresa</span>
                </div>

                <ul class="nav nav-tabs mb-3" id="tabsClavesDisponibles" role="tablist">
                    <li class="nav-item" role="presentation">
                        <button class="nav-link active" id="tab-claves-numericas" data-bs-toggle="tab"
                            data-bs-target="#panelClavesNumericas" type="button" role="tab"
                            aria-controls="panelClavesNumericas" aria-selected="true">
                            Numericas
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="tab-claves-ss" data-bs-toggle="tab"
                            data-bs-target="#panelClavesSS" type="button" role="tab"
                            aria-controls="panelClavesSS" aria-selected="false">
                            SS
                        </button>
                    </li>
                </ul>

                <div class="tab-content">
                    <div class="tab-pane fade show active" id="panelClavesNumericas" role="tabpanel" aria-labelledby="tab-claves-numericas">
                        <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
                            <div class="small text-muted" id="infoClavesNumericas">Sin datos cargados.</div>
                        </div>
                        <div class="border rounded p-3 bg-light-subtle">
                            <div class="row g-2" id="contenedorClavesNumericas">
                                <div class="col-12 text-center text-muted py-4">Selecciona una empresa para consultar claves.</div>
                            </div>
                        </div>
                    </div>
                    <div class="tab-pane fade" id="panelClavesSS" role="tabpanel" aria-labelledby="tab-claves-ss">
                        <div class="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
                            <div class="small text-muted" id="infoClavesSS">Sin datos cargados.</div>
                        </div>
                        <div class="border rounded p-3 bg-light-subtle">
                            <div class="row g-2" id="contenedorClavesSS">
                                <div class="col-12 text-center text-muted py-4">Selecciona una empresa para consultar claves.</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer justify-content-between">
                <small class="text-muted">Haz clic en una clave para usarla en el formulario.</small>
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
            </div>
        </div>
    </div>
</div>
