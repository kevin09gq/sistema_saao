<!-- Modal para Agregar/Quitar Tarjeta y Conceptos por Empleado Seleccionado -->
<div class="modal fade" id="modalAddRemoveTarjeta" tabindex="-1" aria-labelledby="modalAddRemoveTarjetaLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">
            <div class="modal-header bg-primary text-white">
                <h5 class="modal-title" id="modalAddRemoveTarjetaLabel">
                    <i class="bi bi-credit-card-fill me-2"></i>Configurar Tarjeta / Impuestos Masivo
                </h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <!-- Configuración del Proceso (Selects) -->
                <div class="card mb-4 border-primary-subtle">
                    <div class="card-body bg-light-subtle">
                        <h6 class="card-title fw-bold text-primary mb-3">1. Selección de Conceptos y Acción</h6>
                        <div class="row g-3">
                            <div class="col-md-6">
                                <label class="form-label small fw-bold">Concepto a Modificar</label>
                                <select class="form-select form-select-sm" id="tarjeta-concepto-select">
                                    <option value="todos">Todos (Tarjeta + Impuestos)</option>
                                    <option value="tarjeta">Tarjeta</option>
                                    <option value="isr">ISR (45)</option>
                                    <option value="imss">IMSS (52)</option>
                                    <option value="infonavit">Infonavit (16)</option>
                                    <option value="ajuste_sub">Ajuste al Sub (107)</option>
                                </select>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label small fw-bold">Acción a Realizar</label>
                                <select class="form-select form-select-sm" id="tarjeta-accion-select">
                                    <option value="agregar">Agregar</option>
                                    <option value="quitar">Quitar</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Selección de Empleados -->
                <div class="card border-0 shadow-sm">
                    <div class="card-body p-0">
                        <div class="d-flex justify-content-between align-items-center p-3 bg-light border-bottom">
                            <h6 class="m-0 fw-bold"><i class="bi bi-people me-2"></i>2. Seleccionar Empleados</h6>
                            <div class="input-group input-group-sm w-50">
                                <span class="input-group-text bg-white"><i class="bi bi-search"></i></span>
                                <input type="text" id="buscar-empleado-tarjeta" class="form-control" placeholder="Buscar por nombre o clave...">
                            </div>
                        </div>

                        <div class="table-responsive border rounded" style="max-height: 400px; overflow-y: auto;">
                            <table class="table table-hover align-middle mb-0" id="tabla-empleados-tarjeta">
                                <thead class="table-light sticky-top shadow-sm">
                                    <tr>
                                        <th class="text-center" style="width: 50px; background-color: #f8f9fa; z-index: 10;">
                                            <input class="form-check-input" type="checkbox" id="check-all-tarjeta">
                                        </th>
                                        <th class="text-center" style="width: 100px; background-color: #f8f9fa; z-index: 10;">Clave</th>
                                        <th style="background-color: #f8f9fa; z-index: 10;">Empleado / Departamento</th>
                                    </tr>
                                </thead>
                                <tbody id="tbody-empleados-tarjeta">
                                    <!-- Se llena dinámicamente -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer bg-light">
                <div class="me-auto text-muted small">
                    <span id="contador-seleccionados-tarjeta" class="fw-bold text-primary">0</span> empleados seleccionados
                </div>
                <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-primary btn-sm px-4" id="btn-aplicar-tarjeta-masivo">
                    <i class="bi bi-check2-circle me-1"></i>Ejecutar Acción
                </button>
            </div>
        </div>
    </div>
</div>
