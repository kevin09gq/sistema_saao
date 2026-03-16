<!-- Modal para Exportar Nómina -->
<div class="modal fade" id="modalExportarNomina" tabindex="-1" aria-labelledby="modalExportarNominaLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header bg-primary text-white">
                <h5 class="modal-title" id="modalExportarNominaLabel">
                    <i class="bi bi-file-earmark-excel"></i> Exportar Nómina a Excel
                </h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <p class="text-muted mb-4">Selecciona qué nómina deseas exportar:</p>

                <div class="list-group">
                    <!-- Jornalero Base -->
                    <button type="button" class="list-group-item list-group-item-action btn-export-tipo" id="btn-export-jornalero-base">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="mb-1">
                                    <i class="bi bi-person-badge"></i> Jornalero Base
                                </h6>
                            </div>
                            <i class="bi bi-file-earmark-spreadsheet text-success fs-4"></i>
                        </div>
                    </button>

                    <!-- Jornalero De Apoyo -->
                    <button type="button" class="list-group-item list-group-item-action btn-export-tipo" id="btn-export-jornalero-apoyo">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="mb-1">
                                    <i class="bi bi-people"></i> Jornalero de apoyo
                                </h6>
                            </div>
                            <i class="bi bi-file-earmark-bar-graph text-primary fs-4"></i>
                        </div>
                    </button>

                   
                    <!-- Coordinador Rancho -->
                    <button type="button" class="list-group-item list-group-item-action btn-export-tipo" id="btn-export-coodinador-rancho">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="mb-1">
                                    <i class="bi bi-person-workspace"></i> Coodinador Rancho
                                </h6>
                            </div>
                            <i class="bi bi-file-earmark-person text-danger fs-4"></i>
                        </div>
                    </button>

                    <!-- Opción: Exportar Todo -->
                    <button type="button" class="list-group-item list-group-item-action btn-export-tipo" id="btn-export-nomina-completa">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="mb-1">
                                    <i class="bi bi-collection"></i> Nomina Completa
                                </h6>
                            </div>
                            <i class="bi bi-file-earmark-zip text-dark fs-4"></i>
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