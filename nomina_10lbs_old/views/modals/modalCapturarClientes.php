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
                
                <!-- Sección de Registro (Formulario) -->
                <div class="card mb-4 shadow-sm">
                    <div class="card-body">
                        <h6 class="card-title fw-bold text-muted mb-3">Nuevo Registro de Cliente</h6>
                        <form id="form-capturar-cliente" class="row g-3 align-items-end">
                            <div class="col-md-3">
                                <label class="form-label fw-bold small">Nombre del Cliente</label>
                                <input type="text" class="form-control form-control-sm" id="cliente-nombre" placeholder="Nombre completo" required>
                            </div>
                            <div class="col-md-2">
                                <label class="form-label fw-bold small">Tarimas</label>
                                <input type="number" class="form-control form-control-sm text-center" id="cliente-tarimas" value="0" min="0">
                            </div>
                            <div class="col-md-2">
                                <label class="form-label fw-bold small">Cant. Cajas</label>
                                <input type="number" class="form-control form-control-sm text-center" id="cliente-cajas" value="0" min="0">
                            </div>
                            <div class="col-md-2">
                                <label class="form-label fw-bold small">Tipo de Caja</label>
                                <select class="form-select form-select-sm" id="cliente-tipo-caja" required>
                                    <option value="">Seleccionar...</option>
                                </select>
                            </div>
                            <div class="col-md-2">
                                <label class="form-label fw-bold small">Total a Pagar</label>
                                <div class="input-group input-group-sm">
                                    <span class="input-group-text">$</span>
                                    <input type="text" class="form-control fw-bold text-success" id="cliente-total" readonly value="0.00">
                                </div>
                            </div>
                            <div class="col-md-1">
                                <button type="submit" class="btn btn-primary btn-sm w-100" id="btn-registrar-cliente">
                                    <i class="bi bi-plus-lg"></i>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

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
                                <th class="text-center text-secondary small fw-bold text-uppercase">Acciones</th>
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
                    <button type="button" class="btn btn-success px-4" id="btn-guardar-clientes-json">
                        <i class="bi bi-check-circle me-1"></i>Guardar Cambios
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>
