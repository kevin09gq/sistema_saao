<!-- MODAL PARA VER Y EDITAR LA INFORMACIÓN DEL EMPLEADO (Scrollable) -->
<div class="modal fade" id="modalCalculoPTU" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="modalEditarLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-scrollable modal-dialog-centered modal-xl">
        <div class="modal-content border-0 shadow-lg">
            <form method="post" id="form_editar_empleado">

                <div class="modal-header bg-success text-white py-3">
                    <h1 class="modal-title fs-5"><i class="bi bi-pencil-square me-2"></i> Actualizar Información de Cálculo</h1>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>

                <div class="modal-body p-4 bg-light">
                    <!-- DATOS DE REFERENCIA -->
                    <div class="card border-0 shadow-sm mb-4">
                        <div class="card-body bg-white rounded-3">
                            <p class="text-uppercase text-muted fw-bold small mb-3 border-bottom pb-2">Datos de Referencia</p>
                            <div class="row g-3">
                                <input type="text" id="id_empleado" name="id_empleado" readonly hidden>
                                <div class="col-md-2"><label class="form-label small fw-semibold">Clave</label><input type="text" class="form-control-plaintext fw-bold text-dark border-start ps-2" id="clave_empleado" readonly></div>
                                <div class="col-md-5"><label class="form-label small fw-semibold">Colaborador</label><input type="text" class="form-control-plaintext fw-bold text-dark border-start ps-2" id="nombre_empleado" readonly></div>
                                <div class="col-md-5"><label class="form-label small fw-semibold">Departamento</label><input type="text" class="form-control-plaintext fw-bold text-dark border-start ps-2" id="nombre_departamento" readonly></div>
                            </div>
                        </div>
                    </div>

                    <!-- CRITERIO DE ANTIGÜEDAD -->
                    <div class="card border-0 shadow-sm mb-4">
                        <div class="card-body bg-white rounded-3">
                            <h6 class="fw-bold mb-3 border-bottom pb-2 text-success"><i class="bi bi-calendar-event me-2"></i>Criterio de Antigüedad</h6>
                            <div class="row g-3">
                                <div class="col-md-6">
                                    <label class="form-label small fw-semibold">F. Ingreso Real</label>
                                    <div class="input-group">
                                        <div class="input-group-text bg-white"><input class="form-check-input mt-0" type="radio" name="usar_fecha" id="check_usar_fecha_real" value="1"></div>
                                        <input type="date" class="form-control" id="fecha_ingreso_real" name="fecha_ingreso_real">
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <label class="form-label small fw-semibold">F. Ingreso IMSS</label>
                                    <div class="input-group">
                                        <div class="input-group-text bg-white"><input class="form-check-input mt-0" type="radio" name="usar_fecha" id="check_usar_fecha_imss" value="0"></div>
                                        <input type="date" class="form-control" id="fecha_ingreso_imss" name="fecha_ingreso_imss">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- VARIABLES DE CÁLCULO (Incluyendo Días Trabajados) -->
                    <div class="card border-0 shadow-sm mb-4">
                        <div class="card-body bg-white rounded-3">
                            <h6 class="fw-bold mb-3 border-bottom pb-2 text-success"><i class="bi bi-gear-fill me-2"></i>Variables de Cálculo</h6>
                            <div class="row g-3">
                                <div class="col-md-3">
                                    <label class="form-label small fw-bold">Días Trabajados</label>
                                    <div class="input-group">
                                        <span class="input-group-text"><i class="bi bi-calendar2-check"></i></span>
                                        <input type="number" class="form-control" id="dias_trabajados" name="dias_trabajados" placeholder="0" step="0.01">
                                    </div>
                                </div>

                                <div class="col-md-3">
                                    <label class="form-label small fw-semibold">Días Pago (Base)</label>
                                    <div class="input-group shadow-sm">

                                        <input type="number" class="form-control" id="dias_pago" placeholder="0" step="0.01">
                                        <button class="btn btn-outline-secondary" type="button" id="btn_resetear_dias_pago"><i class="bi bi-arrow-clockwise"></i></button>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <label class="form-label small fw-semibold">Días PTU</label>
                                    <div class="input-group">
                                        <input type="number" class="form-control" id="dias_ptu" placeholder="0" step="0.01">
                                        <button class="btn btn-outline-secondary" type="button" id="btn_resetear_dias_ptu"><i class="bi bi-arrow-clockwise"></i></button>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <label class="form-label small fw-semibold">Salario Diario</label>
                                    <div class="input-group">
                                        <span class="input-group-text"><i class="bi bi-currency-dollar"></i></span>
                                        <input type="number" class="form-control" id="salario_diario" placeholder="0" step="0.01">
                                        <button class="btn btn-outline-secondary" type="button" id="btn_resetear_salario"><i class="bi bi-arrow-clockwise"></i></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- CÁLCULO NETO -->
                    <div class="card border-0 shadow-sm">
                        <div class="card-body bg-white rounded-3">
                            <h6 class="fw-bold mb-3 border-bottom pb-2 text-dark">Cálculo Neto</h6>
                            <div class="row g-3 align-items-end">

                                <!-- TOTAL PTU (Solo Lectura) -->
                                <div class="col-md-4">
                                    <label class="form-label small fw-bold text-primary">Total PTU</label>
                                    <div class="input-group">
                                        <span class="input-group-text text-primary bg-primary-subtle border border-primary"><i class="bi bi-currency-dollar"></i></span>
                                        <input type="number" class="form-control border border-primary" id="total_ptu" placeholder="0" step="0.01" readonly>
                                    </div>
                                </div>
                                
                                <!-- DESCUENTO DE TARJETA (Si Aplica) -->
                                <div class="col-md-4">
                                    <label class="form-label small fw-bold text-danger">Tarjeta</label>
                                    <div class="input-group">
                                        <span class="input-group-text text-danger bg-danger-subtle border border-danger"><i class="bi bi-credit-card-2-back-fill"></i></span>
                                        <input type="number" class="form-control text-danger border-danger" id="tarjeta" placeholder="0" step="0.01">
                                        <button class="btn btn-outline-secondary" type="button" id="btn_resetear_tarjeta"><i class="bi bi-arrow-clockwise"></i></button>
                                    </div>
                                </div>

                                <!-- NETO A PAGAR SIN REDONDEO -->
                                <div class="col-md-4">
                                    <label class="form-label small fw-bold text-success">Neto a Pagar</label>
                                    <div class="input-group">
                                        <span class="input-group-text text-success bg-success-subtle border border-success"><i class="bi bi-currency-dollar"></i></span>
                                        <input type="number" class="form-control border-success text-success fw-bold" id="neto_pagar" placeholder="0" step="0.01" readonly>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>

                <div class="modal-footer bg-light border-0">
                    <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="submit" class="btn btn-success"><i class="bi bi-save me-2"></i> Guardar Cambios</button>
                </div>
            </form>
        </div>
    </div>
</div>