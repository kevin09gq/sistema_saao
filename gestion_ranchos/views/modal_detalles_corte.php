<!-- Modal -->
<div class="modal fade" id="modal_detalles_corte" tabindex="-1" aria-labelledby="modalLabel" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false" >
    <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content shadow border-0">
            
            <!-- Encabezado -->
            <div class="modal-header bg-success text-white">
                <h5 class="modal-title" id="modalLabel">
                    <i class="bi bi-lemon me-2"></i>Detalles de Corte de Limón
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
                            <span class="text-muted"><i class="bi bi-hash me-2"></i>Folio</span>
                            <span class="fw-bold" id="label_detalle_corte">#CL-2026-001</span>
                        </li>
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                            <span class="text-muted"><i class="bi bi-person me-2"></i>Nombre del Cortador</span>
                            <span class="fw-bold" id="label_detalle_cortador">Juan Pérez</span>
                        </li>
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                            <span class="text-muted"><i class="bi bi-calendar-event me-2"></i>Fecha de Corte</span>
                            <span class="fw-bold" id="label_detalle_fecha">30/06/2026</span>
                        </li>
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                            <span class="text-muted"><i class="bi bi-file-earmark-text me-2"></i>Nómina</span>
                            <span class="fw-bold" id="label_detalle_nomina">#NM-8842</span>
                        </li>
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                            <span class="text-muted"><i class="bi bi-check2-square me-2"></i>Estado</span>
                            <span class="fw-bold" id="label_detalle_estado">Activo</span>
                        </li>
                    </ul>
                </div>

                <!-- Sección 2: Resumen Financiero -->
                <div class="row g-2 mb-4">
                    <div class="col-4">
                        <div class="p-2 border rounded text-center bg-light shadow-sm">
                            <div class="small text-muted">Precio/Reja</div>
                            <div class="fw-bold text-primary" id="label_detalle_precio_reja">$45.00</div>
                        </div>
                    </div>
                    <div class="col-4">
                        <div class="p-2 border rounded text-center bg-light shadow-sm">
                            <div class="small text-muted">Total Rejas</div>
                            <div class="fw-bold text-success" id="label_detalle_total_rejas">120</div>
                        </div>
                    </div>
                    <div class="col-4">
                        <div class="p-2 border rounded text-center bg-light shadow-sm">
                            <div class="small text-muted">Efectivo</div>
                            <div class="fw-bold text-danger" id="label_detalle_efectivo">$5,400.00</div>
                        </div>
                    </div>
                </div>

                <!-- Sección 3: Tabla de Detalles -->
                <h6 class="text-secondary text-uppercase small fw-bold mb-3">
                    <i class="bi bi-table me-1"></i> Desglose de Extracción
                </h6>
                <div class="table-responsive">
                    <table class="table table-bordered table-striped shadow-sm">
                        <thead class="table-light">
                            <tr>
                                <th class="text-center">TABLAS</th>
                                <th class="text-center">REJAS EXTRAIDAS</th>
                            </tr>
                        </thead>
                        <tbody id="cuerpo_tabla_detalles_corte">
                            <tr>
                                <td class="text-center">Tabla 10</td>
                                <td class="text-center fw-bold">50</td>
                            </tr>
                            <tr>
                                <td class="text-center">Tabla 11</td>
                                <td class="text-center fw-bold">70</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

            </div>

            <div class="modal-footer bg-light">
                <button type="button" class="btn btn-sm btn-outline-secondary" data-bs-dismiss="modal">Cerrar</button>
                <button type="button" class="btn btn-sm btn-danger fw-bold"><i class="bi bi-file-earmark-pdf-fill me-2"></i>Exportar PDF</button>
            </div>
        </div>
    </div>
</div>