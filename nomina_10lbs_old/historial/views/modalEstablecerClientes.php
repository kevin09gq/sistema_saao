<div class="modal fade" id="modal-capturar-clientes" tabindex="-1" aria-labelledby="modalCapturarClientesLabel" aria-hidden="true">
    <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content shadow">
            <!-- Encabezado -->
            <div class="modal-header bg-primary text-white">
                <h5 class="modal-title" id="modalCapturarClientesLabel">
                    <i class="bi bi-people-fill me-2"></i>Capturar Clientes y Producción
                </h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>

            <!-- Cuerpo del Modal -->
            <div class="modal-body p-4">



                <!-- Sección de Tabla (Resultados) -->
                <div class="table-responsive border rounded shadow-sm">
                    <table class="table table-hover table-striped align-middle mb-0">
                        <thead class="bg-light border-bottom">
                            <tr>
                                <th class="ps-3 py-3 text-secondary small fw-bold text-uppercase">Cliente</th>
                                <th class="text-center text-secondary small fw-bold text-uppercase">Tarimas</th>
                                <th class="text-center text-secondary small fw-bold text-uppercase">Cajas</th>
                                <th class="text-center text-secondary small fw-bold text-uppercase">Tipo de Caja</th>
                                <th class="text-center text-secondary small fw-bold text-uppercase">Precio Unit.</th>
                                <th class="text-end pe-3 text-secondary small fw-bold text-uppercase">Total</th>
                            </tr>
                        </thead>
                        <tbody id="tbody-clientes">
                            <!-- Dinámico -->
                        </tbody>
                    </table>
                </div>

            </div>

            <!-- Pie del Modal -->
            <div class="modal-footer d-flex justify-content-between">
                <div class="bg-light px-4 py-2 border rounded shadow-sm">
                    <span class="fw-bold text-muted small me-2">TOTAL GENERAL:</span>
                    <span class="fw-bold fs-5 text-primary" id="total-clientes-general">$0.00</span>
                </div>
                <div>
                    <button type="button" class="btn btn-secondary px-4" data-bs-dismiss="modal">Cerrar</button>
                    
                </div>
            </div>
        </div>
    </div>
</div>