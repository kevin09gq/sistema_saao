<!-- Modal para actualizar logos -->
<div class="modal fade" id="modalActualizarLogos" tabindex="-1" aria-labelledby="modalActualizarLogosLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="modalActualizarLogosLabel">
                    <i class="bi bi-images me-2"></i> Actualizar Marca de Agua
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div class="modal-body">
                <div class="alert alert-light border d-flex align-items-center">
                    <i class="bi bi-info-circle-fill me-2 fs-5 text-muted"></i>
                    <div>
                        <strong>Información importante</strong><br>
                        <small class="text-muted">Actualice los logos de las empresas. Estos logos aparecerán en los contratos correspondientes.</small>
                    </div>
                </div>

                <!-- Contenido (sin pestañas) -->
                <div class="card border-0">
                    <div class="card-body">
                        <div id="listaEmpresas" class="logo-grid">
                            <!-- Las empresas se cargarán aquí dinámicamente -->
                            <div class="text-center py-5">
                                <div class="spinner-border text-success" role="status">
                                    <span class="visually-hidden">Cargando empresas...</span>
                                </div>
                                <p class="mt-2 text-muted">Cargando empresas...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
        </div>
    </div>
</div>