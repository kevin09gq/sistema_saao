<!-- Modal -->
<div class="modal fade" id="modalDetallesPlan" tabindex="-1" aria-labelledby="modalDetallesPlanLabel" aria-hidden="true">
    <div class="modal-dialog modal-xl">
        <div class="modal-content">
            <div class="modal-header bg-success text-white">
                <h1 class="modal-title fs-5" id="modalDetallesPlanLabel">Detalles del plan de pago</h1>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <div class="table-responsive">
                    <table class="table table-bordered table-hover shadow-sm">
                        <thead>
                            <tr>
                                <th class="bg-light">Semana pago</th>
                                <th class="bg-light">Monto $</th>
                                <th class="bg-light">Fecha de pago</th>
                                <th class="bg-light">Estado</th>
                                <th class="bg-light">Observacion</th>
                            </tr>
                        </thead>
                        <tbody id="cuerpo-tabla-detalle-plan"></tbody>
                    </table>
                </div>
            </div>
            <div class="modal-footer">
                <span class="badge text-bg-success fs-6 me-auto" id="modal-detalles-plan-nombre-empleado">NOMBRE</span>
                <span class="badge text-bg-secondary fs-6" id="modal-detalles-plan-folio-prestamo">FOLIO</span>
            </div>
        </div>
    </div>
</div>