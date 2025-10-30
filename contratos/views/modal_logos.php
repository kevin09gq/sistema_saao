<!-- Modal para actualizar logos -->
<div class="modal fade" id="modalActualizarLogos" tabindex="-1" aria-labelledby="modalActualizarLogosLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header bg-primary text-white">
                <h5 class="modal-title" id="modalActualizarLogosLabel">
                    <i class="bi bi-images"></i> Actualizar Logos de Empresas y Áreas
                </h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div class="modal-body">
                <div class="alert alert-primary d-flex align-items-center">
                    <i class="bi bi-info-circle-fill me-2 fs-5"></i>
                    <div>
                        <strong>Información importante</strong><br>
                        <small>Actualice los logos de las empresas y áreas. Estos logos aparecerán en los contratos correspondientes.</small>
                    </div>
                </div>

                <!-- Pestañas para Empresas y Áreas -->
                <ul class="nav nav-tabs" id="logosTabs" role="tablist">
                    <li class="nav-item" role="presentation">
                        <button class="nav-link active" id="empresas-tab" data-bs-toggle="tab" data-bs-target="#empresas" type="button" role="tab" aria-controls="empresas" aria-selected="true">
                            <i class="bi bi-building me-2"></i>Logos de Empresas
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="areas-tab" data-bs-toggle="tab" data-bs-target="#areas" type="button" role="tab" aria-controls="areas" aria-selected="false">
                            <i class="bi bi-geo-alt me-2"></i>Logos de Áreas
                        </button>
                    </li>
                </ul>

                <!-- Contenido de las pestañas -->
                <div class="tab-content" id="logosTabContent">
                    <!-- Pestaña de Empresas -->
                    <div class="tab-pane fade show active" id="empresas" role="tabpanel" aria-labelledby="empresas-tab">
                        <div class="card border-0">
                            <div class="card-body">
                                <div id="listaEmpresas" class="logo-grid">
                                    <!-- Las empresas se cargarán aquí dinámicamente -->
                                    <div class="text-center py-5">
                                        <div class="spinner-border text-primary" role="status">
                                            <span class="visually-hidden">Cargando empresas...</span>
                                        </div>
                                        <p class="mt-2 text-muted">Cargando empresas...</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Pestaña de Áreas -->
                    <div class="tab-pane fade" id="areas" role="tabpanel" aria-labelledby="areas-tab">
                        <div class="card border-0">
                            <div class="card-body">
                                <div id="listaAreas" class="logo-grid">
                                    <!-- Las áreas se cargarán aquí dinámicamente -->
                                    <div class="text-center py-5">
                                        <div class="spinner-border text-success" role="status">
                                            <span class="visually-hidden">Cargando áreas...</span>
                                        </div>
                                        <p class="mt-2 text-muted">Cargando áreas...</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-outline-danger btn-sm" id="limpiarLogos" title="Eliminar logos no utilizados">
                    <i class="bi bi-trash3"></i> Limpiar Logos
                </button>
                <div>
                    <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">
                        <i class="bi bi-x-circle"></i> Cerrar
                    </button>
                    <button type="button" class="btn btn-primary btn-sm" id="btnActualizarLogos">
                        <span class="spinner-border spinner-border-sm d-none" role="status" aria-hidden="true" id="spinnerLogos"></span>
                        <i class="bi bi-check-circle"></i> Actualizar Logos
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>