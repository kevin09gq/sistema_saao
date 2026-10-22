<!-- MODAL PARA VER Y EDITAR LA INFORMACIÓN DEL EMPLEADO -->
<div class="modal fade" id="modal_editar" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="modalEditarLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-scrollable modal-dialog-centered modal-xl">
        <div class="modal-content">

            <div class="modal-header">
                <h5 class="modal-title" id="modalEditarLabel">
                    <i class="bi bi-pencil-square me-2"></i> Actualizar Información de Cálculo
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>

            <div class="modal-body p-4">

                <form method="post" id="form_editar_empleado">

                    <!-- Datos de Referencia -->
                    <div class="card border-0 bg-light mb-4">
                        <div class="card-body">
                            <h6 class="fw-bold text-secondary mb-3">
                                <i class="bi bi-person-badge me-2"></i>Datos de Referencia
                            </h6>
                            <div class="row g-3">
                                <input type="text" id="id_empleado" name="id_empleado" readonly hidden>

                                <div class="col-md-2">
                                    <label class="form-label" for="clave_empleado">Clave</label>
                                    <input type="text" class="form-control bg-white fw-bold text-dark" id="clave_empleado" name="clave_empleado" readonly tabindex="-1">
                                </div>

                                <div class="col-md-5">
                                    <label class="form-label" for="nombre_empleado">Nombre del Colaborador</label>
                                    <input type="text" class="form-control bg-white fw-bold text-dark" id="nombre_empleado" name="nombre_empleado" readonly tabindex="-1">
                                </div>

                                <div class="col-md-5">
                                    <label class="form-label" for="nombre_departamento">Departamento</label>
                                    <input type="text" class="form-control bg-white fw-bold text-dark" id="nombre_departamento" name="nombre_departamento" readonly tabindex="-1">
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="row g-4">
                        <!-- Criterio de Antigüedad -->
                        <div class="col-lg-6">
                            <div class="card border-0 bg-light h-100">
                                <div class="card-body">
                                    <h6 class="fw-bold text-secondary mb-3">
                                        <i class="bi bi-calendar-event me-2"></i>Criterio de Antigüedad
                                    </h6>
                                    <div class="row g-3">
                                        <div class="col-md-6">
                                            <label class="form-label" for="fecha_ingreso_real">F. Ingreso Real (FIR)</label>
                                            <div class="input-group">
                                                <div class="input-group-text bg-white">
                                                    <input class="form-check-input mt-0" type="radio" value="1" name="usar_fecha" id="check_usar_fecha_real">
                                                </div>
                                                <input type="date" class="form-control" id="fecha_ingreso_real" name="fecha_ingreso_real">
                                            </div>
                                        </div>

                                        <div class="col-md-6">
                                            <label class="form-label" for="fecha_ingreso_imss">F. Ingreso IMSS (FII)</label>
                                            <div class="input-group">
                                                <div class="input-group-text bg-white">
                                                    <input class="form-check-input mt-0" type="radio" value="0" name="usar_fecha" id="check_usar_fecha_imss">
                                                </div>
                                                <input type="date" class="form-control" id="fecha_ingreso_imss" name="fecha_ingreso_imss">
                                            </div>
                                        </div>
                                    </div>
                                    <div class="mt-3 p-2 rounded-2 small text-muted bg-white border">
                                        <i class="bi bi-info-circle text-primary me-1"></i> Selecciona la fecha base para los días laborados.
                                    </div>
                                    <div class="row g-3 mt-1">
                                        <div class="col-md-6">
                                            <label class="form-label" for="dias_aguinaldo">Días de Aguinaldo</label>
                                            <div class="input-group">
                                                <span class="input-group-text bg-white"><i class="bi bi-calendar-check"></i></span>
                                                <input type="number" class="form-control" id="dias_aguinaldo" name="dias_aguinaldo" placeholder="0">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Variables de Cálculo -->
                        <div class="col-lg-6">
                            <div class="card border-0 bg-light h-100">
                                <div class="card-body">
                                    <h6 class="fw-bold text-secondary mb-3">
                                        <i class="bi bi-gear-fill me-2"></i>Variables de Cálculo
                                    </h6>
                                    <div class="row g-3">

                                        <div class="col-md-4">
                                            <label class="form-label" for="tmp_dias_trabajados" title="Días trabajados">Días Trab.</label>
                                            <input type="number" min="0" max="365" class="form-control" id="tmp_dias_trabajados" name="tmp_dias_trabajados" placeholder="0">
                                        </div>

                                        <div class="col-md-4">
                                            <label class="form-label" for="ausencias">Ausencias</label>
                                            <div class="input-group">
                                                <div class="input-group-text bg-white">
                                                    <input class="form-check-input mt-0" type="checkbox" id="usar_ausencias" name="usar_ausencias">
                                                </div>
                                                <input type="number" min="0" class="form-control" id="ausencias" name="ausencias" placeholder="0">
                                            </div>
                                        </div>

                                        <div class="col-md-4">
                                            <label class="form-label text-primary" for="dias_trabajados">Total Días</label>
                                            <div class="input-group">
                                                <input type="number" class="form-control bg-light fw-bold text-primary" id="dias_trabajados" name="dias_trabajados" readonly placeholder="0">
                                                <span class="input-group-text bg-white"><i class="bi bi-calculator"></i></span>
                                            </div>
                                        </div>

                                        <div class="col-md-6">
                                            <label class="form-label" for="salario_diario">Salario Diario</label>
                                            <div class="input-group">
                                                <span class="input-group-text bg-white fw-bold text-success">$</span>
                                                <input type="number" step="0.01" min="0" class="form-control" id="salario_diario" name="salario_diario" placeholder="0.00">
                                            </div>
                                        </div>

                                        <div class="col-md-6">
                                            <label class="form-label" for="fecha_pago">Fecha de Pago</label>
                                            <div class="input-group">
                                                <span class="input-group-text bg-white"><i class="bi bi-calendar-date"></i></span>
                                                <input type="date" class="form-control" id="fecha_pago" name="fecha_pago">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Cálculo Neto a Pagar -->
                        <div class="col-12">
                            <div class="card border-0 bg-light">
                                <div class="card-body">
                                    <h6 class="fw-bold text-secondary mb-3">
                                        <i class="bi bi-calculator me-2"></i>Cálculo Neto a Pagar
                                    </h6>
                                    <div class="row g-3 align-items-end">

                                        <div class="col-md-3">
                                            <label class="form-label" for="aguinaldo">Aguinaldo Bruto</label>
                                            <div class="input-group">
                                                <span class="input-group-text bg-white fw-bold text-success">$</span>
                                                <input type="number" step="0.01" class="form-control fw-semibold" id="aguinaldo" name="aguinaldo" placeholder="0.00">
                                            </div>
                                        </div>

                                        <div class="col-md-3">
                                            <label class="form-label text-danger" for="isr">Deducción ISR</label>
                                            <div class="input-group">
                                                <span class="input-group-text bg-white text-danger fw-bold">$</span>
                                                <input type="number" step="0.01" min="0" class="form-control text-danger fw-semibold" id="isr" name="isr" placeholder="0.00">
                                                <button class="btn btn-outline-secondary" type="button" id="btn_resetear_isr" title="Resetear ISR"><i class="bi bi-arrow-clockwise"></i></button>
                                            </div>
                                        </div>

                                        <div class="col-md-3">
                                            <label class="form-label text-primary" for="tarjeta">Dispersión Tarjeta</label>
                                            <div class="input-group">
                                                <span class="input-group-text bg-white text-primary"><i class="bi bi-credit-card"></i></span>
                                                <input type="number" step="0.01" min="0" class="form-control text-primary fw-semibold" id="tarjeta" name="tarjeta" placeholder="0.00">
                                                <button class="btn btn-outline-secondary" type="button" id="btn_resetear_tarjeta" title="Resetear Tarjeta"><i class="bi bi-arrow-clockwise"></i></button>
                                            </div>
                                        </div>

                                        <div class="col-md-3">
                                            <div class="p-2 bg-white border border-success rounded-3">
                                                <label class="form-label text-success mb-1" for="neto_pagar">Neto a Pagar</label>
                                                <div class="input-group">
                                                    <span class="input-group-text bg-success text-white fw-bold">$</span>
                                                    <input type="number" step="0.01" class="form-control fw-bold text-success border-0 bg-transparent fs-5" id="neto_pagar" name="neto_pagar" readonly placeholder="0.00">
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="modal-footer bg-white border-0 px-0 pb-0 mt-4 d-flex justify-content-end gap-2">
                        <button type="button" class="btn btn-outline-secondary px-4" data-bs-dismiss="modal">Cancelar</button>
                        <button type="submit" class="btn btn-success px-4">
                            <i class="bi bi-check-lg me-1"></i> Guardar Cambios
                        </button>
                    </div>
                </form>

            </div>

        </div>
    </div>
</div>