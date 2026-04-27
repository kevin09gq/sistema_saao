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

                <div class="list-group" id="contenedor-exportar-dinamico">
                    <!-- Los botones se cargarán dinámicamente desde exportarNominaExcel.js -->
                    <div class="text-center p-3 text-muted">
                        <div class="spinner-border spinner-border-sm" role="status"></div>

                    </div>


                </div>

                <div class="list-group">
                    <button type="button" class="list-group-item list-group-item-action btn-export-tipo" id="btn-export-nomina-completa">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="mb-1"><i class="bi bi-collection"></i> Nomina Completa</h6>
                            </div>
                            <i class="bi bi-file-earmark-zip text-dark fs-4"></i>
                        </div>
                    </button>

                    <button type="button" class="list-group-item list-group-item-action btn-export-tipo" id="btn-export-dispersion-tarjeta">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="mb-1 text-success"><i class="bi bi-credit-card"></i> Dispersión Tarjeta</h6>
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