<!-- Modal de Préstamos Activos -->
<div class="modal fade" id="modal-prestamos" tabindex="-1" aria-labelledby="modalPrestamosLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header text-white">
                <h5 class="modal-title" id="modalPrestamosLabel">
                    <i class="bi bi-cash-stack"></i> Préstamos Activos
                </h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <!-- Tabla de Préstamos Activos -->
                <div class="table-responsive">
                    <table class="table table-hover table-striped">
                        <thead class="table-light">
                            <tr>
                                <th>Monto</th>
                                <th>Semanas</th>
                                <th>Pago Semanal</th>
                                <th>Restante</th>
                                <th>Estado</th>
                                <th>Fecha Inicio</th>
                                <th>Progreso</th>
                                <th>Acción</th>
                            </tr>
                        </thead>
                        <tbody id="lista-prestamos-activos">
                            <!-- Los datos se llenarán dinámicamente con JavaScript -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>