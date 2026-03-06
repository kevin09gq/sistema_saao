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
                    <button type="button" class="list-group-item list-group-item-action btn-export-tipo" id = "btn-export-jornalero-base"
                        data-tipo="1" data-nombre="Jornalero Base">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="mb-1">
                                    <i class="bi bi-person-badge"></i> Jornalero Base
                                </h6>
                            </div>
                        </div>
                    </button>

                    <!-- Jornalero Vivero -->
                    <button type="button" class="list-group-item list-group-item-action btn-export-tipo"
                        data-tipo="2" data-nombre="Jornalero Vivero">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="mb-1">
                                    <i class="bi bi-leaf"></i> Jornalero Vivero
                                </h6>
                            </div>
                        </div>
                    </button>

                    <!-- Jornalero de Apoyo -->
                    <button type="button" class="list-group-item list-group-item-action btn-export-tipo"
                        data-tipo="3" data-nombre="Jornalero de Apoyo">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="mb-1">
                                    <i class="bi bi-hand-thumbs-up"></i> Jornalero de Apoyo
                                </h6>

                            </div>
                        </div>
                    </button>

                    <!-- Coordinador Rancho -->
                    <button type="button" class="list-group-item list-group-item-action btn-export-tipo"
                        data-tipo="4" data-nombre="Coordinador Rancho">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="mb-1">
                                    <i class="bi bi-diagram-3"></i> Coordinador Rancho
                                </h6>

                            </div>

                        </div>
                    </button>

                    <!-- Coordinador Vivero -->
                    <button type="button" class="list-group-item list-group-item-action btn-export-tipo"
                        data-tipo="5" data-nombre="Coordinador Vivero">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="mb-1">
                                    <i class="bi bi-flower1"></i> Coordinador Vivero
                                </h6>

                            </div>

                        </div>
                    </button>

                    <!-- Opción: Exportar Todo -->
                    <button type="button" class="list-group-item list-group-item-action btn-export-tipo bg-light border-2"
                        data-tipo="0" data-nombre="Nómina Completa">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="mb-1">
                                    <i class="bi bi-file-spreadsheet"></i> Nómina Completa
                                </h6>
                            </div>

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