<!-- Modal Bootstrap para mostrar totales de conceptos -->
<div class="modal fade" id="modalConceptosTotales" tabindex="-1" aria-labelledby="modalConceptosTotalesLabel" aria-hidden="true">
    <div class="modal-dialog modal-xl">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="modalConceptosTotalesLabel">
                    <i class="bi bi-calculator"></i> Totales por Concepto
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <!-- Resumen de totales -->
                <div class="row mb-4">
                    <div class="col-md-4">
                        <div class="card text-center">
                            <div class="card-body">
                                <h6 class="card-title text-muted">Total Percepciones</h6>
                                <h4 class="text-success" id="total-percepciones-general">$0.00</h4>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card text-center">
                            <div class="card-body">
                                <h6 class="card-title text-muted">Total Deducciones</h6>
                                <h4 class="text-danger" id="total-deducciones-general">$0.00</h4>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card text-center">
                            <div class="card-body">
                                <h6 class="card-title text-muted">Neto a Pagar</h6>
                                <h4 class="text-primary" id="total-neto-general">$0.00</h4>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Percepciones -->
                <h6 class="text-success fw-bold mb-3">
                    <i class="bi bi-arrow-up-circle"></i> PERCEPCIONES
                </h6>
                <div class="accordion mb-4" id="percepciones-accordion"></div>

                <!-- Deducciones -->
                <h6 class="text-danger fw-bold mb-3">
                    <i class="bi bi-arrow-down-circle"></i> DEDUCCIONES
                </h6>
                <div class="accordion" id="deducciones-accordion"></div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
            </div>
        </div>
    </div>
</div>
