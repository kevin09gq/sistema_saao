<!-- Modal para Exportar Nómina -->
<div class="modal fade" id="modalExportarNomina" tabindex="-1" aria-labelledby="modalExportarNominaLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
            <div class="modal-header bg-primary text-white">
                <h5 class="modal-title" id="modalExportarNominaLabel">
                    <i class="bi bi-file-earmark-excel"></i> Exportar Nómina a Excel
                </h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <p class="text-muted mb-4">Selecciona qué nómina deseas exportar:</p>

                <div class="list-group" id="contenedor-opciones-exportar">
                    <!-- Los departamentos se cargarán dinámicamente aquí -->
                </div>

                <hr class="my-4">

                <div class="list-group shadow-sm">
                    <!-- Corte Rejas de Limón (Estático) -->
                    <button type="button" class="list-group-item list-group-item-action" style="border-left: 4px solid #10b981;" id="btn-export-corte" data-nombre="Corte" data-id="800">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="mb-1 text-success fw-bold">
                                    <i class="bi bi-leaf-fill"></i> Corte Rejas de Limón
                                </h6>
                            </div>
                            <i class="bi bi-file-earmark-spreadsheet text-success fs-4"></i>
                        </div>
                    </button>

                    <!-- Poda de arboles -->
                    <button type="button" class="list-group-item list-group-item-action" style="border-left: 4px solid #10b981;" id="btn-export-corte" data-nombre="Poda" data-id="801">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="mb-1 text-success fw-bold">
                                    <i class="bi bi-leaf-fill"></i> Podas de Árboles
                                </h6>
                            </div>
                            <i class="bi bi-file-earmark-spreadsheet text-success fs-4"></i>
                        </div>
                    </button>

                    <!-- Nómina Completa (Estático) -->
                    <button type="button" class="list-group-item list-group-item-action" style="border-left: 4px solid #0d6efd;" id="btn-export-nomina-completa">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="mb-1 text-primary fw-bold">
                                    <i class="bi bi-folder"></i> Nomina Completa
                                </h6>
                            </div>
                            <i class="bi bi-file-earmark-text text-primary fs-4"></i>
                        </div>
                    </button>
                    <button type="button" class="list-group-item list-group-item-action btn-export-tipo" style="border-left: 4px solid #10b981;" id="btn-export-dispersion-tarjeta">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="mb-1 text-success fw-bold"><i class="bi bi-credit-card"></i> Dispersión Tarjeta</h6>
                            </div>
                            <i class="bi bi-file-earmark-spreadsheet text-success fs-4"></i>
                        </div>
                    </button>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            </div>
        </div>
    </div>
</div>