<!-- Modal Bootstrap para actualizar préstamo y manejar pagos -->
<div class="modal fade" id="modalActualizarPrestamo" tabindex="-1" aria-labelledby="modalActualizarPrestamoLabel" aria-hidden="true">
    <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="modalActualizarPrestamoLabel"><i class="bi bi-pencil-square"></i> Actualizar Préstamo</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div class="modal-body">
                <form id="formActualizarPrestamo">
                    <input type="hidden" id="upd_id_prestamo" name="id_prestamo">

                    <div class="row g-3 mb-3">
                        <div class="col-12">
                            <label class="form-label">Empleado</label>
                            <input type="text" id="upd_empleado_nombre" class="form-control" readonly>
                        </div>
                    </div>

                    <div class="row g-3">
                        <div class="col-md-4">
                            <label for="upd_monto_total" class="form-label">Monto Total</label>
                            <input type="number" id="upd_monto_total" name="monto_total" class="form-control" min="0" step="0.01" required>
                        </div>
                        <div class="col-md-2">
                            <label for="upd_semanas_totales" class="form-label">Semanas Totales</label>
                            <input type="number" id="upd_semanas_totales" name="semanas_totales" class="form-control" min="1" required>
                        </div>
                        <div class="col-md-3">
                            <label for="upd_monto_semanal" class="form-label">Pago Semanal</label>
                            <input type="number" id="upd_monto_semanal" name="monto_semanal" class="form-control" step="0.01" readonly>
                        </div>
                        <div class="col-md-3">
                            <label for="upd_semanas_pagadas" class="form-label">Semanas Pagadas</label>
                            <input type="number" id="upd_semanas_pagadas" name="semanas_pagadas" class="form-control" min="0">
                        </div>
                    </div>

                    <div class="row g-3 mt-2">
                        <div class="col-md-4">
                            <label for="upd_saldo_restante" class="form-label">Saldo Restante</label>
                            <input type="number" id="upd_saldo_restante" name="saldo_restante" class="form-control" step="0.01" readonly>
                        </div>
                        <div class="col-md-4">
                            <label for="upd_fecha_inicio" class="form-label">Fecha Inicio</label>
                            <input type="date" id="upd_fecha_inicio" name="fecha_inicio" class="form-control">
                        </div>
                        <div class="col-md-4">
                            <label for="upd_estado" class="form-label">Estado</label>
                            <select id="upd_estado" name="estado" class="form-select">
                                <option value="pendiente">Pendiente</option>
                                <option value="activo">Activo</option>
                                <option value="pagado">Pagado</option>
                                <option value="cancelado">Cancelado</option>
                            </select>
                        </div>
                    </div>

                    <div class="row mt-3">
                        <div class="col-12">
                            <label for="upd_notas" class="form-label">Notas</label>
                            <textarea id="upd_notas" name="notas" class="form-control" rows="3"></textarea>
                        </div>
                    </div>

                    <!-- Sección de conceptos -->
                    <div class="mt-4">
                        <h6>Conceptos del Préstamo</h6>
                        <div class="card mb-3">
                            <div class="card-body">
                                <div class="table-responsive">
                                    <table class="table table-sm table-striped" id="tablaConceptosPrestamo">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Concepto</th>
                                                <th>Monto</th>
                                                <th>Fecha Registro</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <!-- Filas de conceptos se cargarán aquí dinámicamente -->
                                        </tbody>
                                    </table>
                                </div>

                                <!-- Form para agregar concepto -->
                                <div class="row g-2 align-items-end mt-3">
                                    <div class="col-md-6">
                                        <label class="form-label">Concepto</label>
                                        <input type="text" id="concepto_add" class="form-control" placeholder="Ej: Emergencia médica">
                                    </div>
                                    <div class="col-md-4">
                                        <label class="form-label">Monto</label>
                                        <input type="number" id="monto_concepto_add" class="form-control" step="0.01" min="0">
                                    </div>
                                    <div class="col-md-2 d-grid">
                                        <button type="button" id="btnAgregarConcepto" class="btn btn-outline-primary">Agregar Concepto</button>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>

                    <!-- Sección de pagos -->
                    <div class="mt-4">
                        <h6>Registros de Pagos</h6>
                        <div class="card">
                            <div class="card-body">
                                <div class="table-responsive">
                                    <table class="table table-sm table-striped" id="tablaPagosPrestamo">
                                        <thead>
                                            <tr>
                                                <th>#</th>
                                                <th>Monto Pagado</th>
                                                <th>Número Semana</th>
                                                <th>Fecha Pago</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <!-- Filas de pagos se cargarán aquí dinámicamente -->
                                        </tbody>
                                    </table>
                                </div>

                                <!-- Form para agregar/editar un pago -->
                                <div class="row g-2 align-items-end mt-3">
                                    <div class="col-md-3">
                                        <label class="form-label">Monto</label>
                                        <input type="number" id="pago_monto" class="form-control" step="0.01" min="0">
                                        <small id="pago_warning" class="text-danger" style="display:none;">Cantidad inapropiada</small>
                                    </div>
                                    <div class="col-md-3">
                                        <label class="form-label">Número Semana</label>
                                        <input type="number" id="pago_semana" class="form-control" min="1">
                                    </div>
                                    <div class="col-md-3">
                                        <label class="form-label">Fecha Pago</label>
                                        <input type="date" id="pago_fecha" class="form-control">
                                    </div>
                                    <div class="col-md-3 d-grid">
                                        <button type="button" id="btnAgregarPago" class="btn btn-success">Agregar Pago</button>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>

                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                <button type="button" id="btnGuardarActualizar" class="btn btn-primary">Guardar cambios</button>
            </div>
        </div>
    </div>
</div>
