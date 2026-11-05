<!-- Modal -->
<div class="modal fade" id="modal_detalles_corte" tabindex="-1" aria-labelledby="modalLabel" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false" >
    <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content shadow border-0">
            
            <!-- Encabezado -->
            <div class="modal-header bg-success text-white">
                <h5 class="modal-title" id="modalLabel">
                    <i class="bi bi-lemon me-2"></i>Detalles de Corte de Limón (Nomina)
                </h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>

            <div class="modal-body p-4">
                
                <!-- Sección 1: Información General (Diseño Vertical) -->
                <div class="mb-4">
                    <h6 class="text-primary text-uppercase small fw-bold mb-3">
                        <i class="bi bi-info-circle me-1"></i> Información del Corte
                    </h6>
                    <ul class="list-group list-group-flush border rounded shadow-sm">
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                            <span class="text-muted"><i class="bi bi-hash me-2"></i>ID</span>
                            <span class="fw-bold" id="label_detalle_corte">#CL-2026-001</span>
                        </li>
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                            <span class="text-muted"><i class="bi bi-person me-2"></i>Nombre del Cortador</span>
                            <span class="fw-bold" id="label_detalle_cortador">Juan Pérez</span>
                        </li>
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                            <span class="text-muted"><i class="bi bi-file-earmark-text me-2"></i>Nómina</span>
                            <span class="fw-bold" id="label_detalle_nomina">#NM-8842</span>
                        </li>
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                            <span class="text-muted"><i class="bi bi-currency-dollar me-2"></i>Total Pagado</span>
                            <span class="fw-bold" id="label_detalle_total">$1,200.00</span>
                        </li>
                    </ul>
                </div>

                <!-- Sección 3: Tabla de Detalles -->
                <h6 class="text-secondary text-uppercase small fw-bold mb-3">
                    <i class="bi bi-table me-1"></i> Desglose de Pagos
                </h6>
                <div class="table-responsive">
                    <table class="table table-bordered table-striped shadow-sm">
                        <thead class="table-light">
                            <tr>
                                <th class="text-center">DIA</th>
                                <th class="text-center">FECHA</th>
                                <th class="text-center">PAGADO</th>
                            </tr>
                        </thead>
                        <tbody id="cuerpo_tabla_detalles_corte">
                            <tr>
                                <td class="text-center">VIERNES</td>
                                <td class="text-center">2023-10-13</td>
                                <td class="text-center fw-bold">$1,200.00</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

            </div>

            <div class="modal-footer">
                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cerrar</button>
                <button type="button" class="btn btn-outline-success fw-bold"><i class="bi bi-file-earmark-pdf-fill me-2"></i>Exportar PDF</button>
            </div>
        </div>
    </div>
</div>