
<div class="modal fade" id="modalHorarioVariable" tabindex="-1" aria-labelledby="modalHorarioVariableLabel" aria-hidden="true" data-bs-backdrop="static">
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
            <div id="hv-modal-header" class="modal-header bg-success text-white">
                <h5 class="modal-title" id="modalHorarioVariableLabel">
                    <span id="hv-title-text">Asignar Horario Variable</span>
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div class="modal-body">
                
                <!-- SECCIÓN 1: DEFINICIÓN DE HORARIO -->
                <div id="hv-container-horarios">
                    <form id="form-horario-variable">
                        <div class="row gx-3 gy-2 align-items-end mb-2">
                            <div class="col-md-3 col-sm-6">
                                <label class="form-label fw-semibold small">Entrada</label>
                                <input type="time" step="60" class="form-control form-control-sm" id="hv-input-entrada">
                            </div>
                            <div class="col-md-3 col-sm-6">
                                <label class="form-label fw-semibold small">Salida Comida</label>
                                <input type="time" step="60" class="form-control form-control-sm" id="hv-input-salida-comida">
                            </div>
                            <div class="col-md-3 col-sm-6">
                                <label class="form-label fw-semibold small">Entrada Comida</label>
                                <input type="time" step="60" class="form-control form-control-sm" id="hv-input-entrada-comida">
                            </div>
                            <div class="col-md-2 col-sm-6">
                                <label class="form-label fw-semibold small">Salida</label>
                                <input type="time" step="60" class="form-control form-control-sm" id="hv-input-salida">
                            </div>
                            <div class="col-md-1 d-flex justify-content-end">
                                <button type="button" class="btn btn-primary btn-sm" id="hv-btn-copiar-horario" title="Copiar a todos los días">
                                    <i class="bi bi-clipboard-check"></i>
                                </button>
                            </div>
                        </div>

                        <div class="table-responsive">
                            <table class="table table-borderless align-middle">
                                <thead class="bg-success text-white">
                                    <tr>
                                        <th>Día</th>
                                        <th>Entrada</th>
                                        <th>Salida Comida</th>
                                        <th>Entrada Comida</th>
                                        <th>Salida</th>
                                    </tr>
                                </thead>
                                <tbody id="tbody-horario-variable">
                                    <tr>
                                        <td style="width:160px;"><input type="text" class="form-control form-control-sm" value="LUNES" readonly></td>
                                        <td><input type="time" class="form-control form-control-sm entrada"></td>
                                        <td><input type="time" class="form-control form-control-sm salida-comida"></td>
                                        <td><input type="time" class="form-control form-control-sm entrada-comida"></td>
                                        <td><input type="time" class="form-control form-control-sm salida"></td>
                                    </tr>
                                    <tr>
                                        <td><input type="text" class="form-control form-control-sm" value="MARTES" readonly></td>
                                        <td><input type="time" class="form-control form-control-sm entrada"></td>
                                        <td><input type="time" class="form-control form-control-sm salida-comida"></td>
                                        <td><input type="time" class="form-control form-control-sm entrada-comida"></td>
                                        <td><input type="time" class="form-control form-control-sm salida"></td>
                                    </tr>
                                    <tr>
                                        <td><input type="text" class="form-control form-control-sm" value="MIERCOLES" readonly></td>
                                        <td><input type="time" class="form-control form-control-sm entrada"></td>
                                        <td><input type="time" class="form-control form-control-sm salida-comida"></td>
                                        <td><input type="time" class="form-control form-control-sm entrada-comida"></td>
                                        <td><input type="time" class="form-control form-control-sm salida"></td>
                                    </tr>
                                    <tr>
                                        <td><input type="text" class="form-control form-control-sm" value="JUEVES" readonly></td>
                                        <td><input type="time" class="form-control form-control-sm entrada"></td>
                                        <td><input type="time" class="form-control form-control-sm salida-comida"></td>
                                        <td><input type="time" class="form-control form-control-sm entrada-comida"></td>
                                        <td><input type="time" class="form-control form-control-sm salida"></td>
                                    </tr>
                                    <tr>
                                        <td><input type="text" class="form-control form-control-sm" value="VIERNES" readonly></td>
                                        <td><input type="time" class="form-control form-control-sm entrada"></td>
                                        <td><input type="time" class="form-control form-control-sm salida-comida"></td>
                                        <td><input type="time" class="form-control form-control-sm entrada-comida"></td>
                                        <td><input type="time" class="form-control form-control-sm salida"></td>
                                    </tr>
                                    <tr>
                                        <td><input type="text" class="form-control form-control-sm" value="SABADO" readonly></td>
                                        <td><input type="time" class="form-control form-control-sm entrada"></td>
                                        <td><input type="time" class="form-control form-control-sm salida-comida"></td>
                                        <td><input type="time" class="form-control form-control-sm entrada-comida"></td>
                                        <td><input type="time" class="form-control form-control-sm salida"></td>
                                    </tr>
                                    <tr>
                                        <td><input type="text" class="form-control form-control-sm" value="DOMINGO" readonly></td>
                                        <td><input type="time" class="form-control form-control-sm entrada"></td>
                                        <td><input type="time" class="form-control form-control-sm salida-comida"></td>
                                        <td><input type="time" class="form-control form-control-sm entrada-comida"></td>
                                        <td><input type="time" class="form-control form-control-sm salida"></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="form-text mt-2">Paso 1: Defina el horario que desea asignar a los empleados seleccionados.</div>
                    </form>
                </div>

                <!-- SECCIÓN 2: SELECCIÓN DE EMPLEADOS -->
                <div id="hv-container-empleados" class="d-none">
                    <div class="alert alert-info py-2 small mb-3">
                        <i class="bi bi-info-circle me-1"></i>
                        Paso 2: Seleccione los empleados a los que desea aplicar el horario definido anteriormente.
                    </div>

                    <div id="empleados-sin-horario-count" class="badge bg-light text-dark border mb-2"></div>

                    <div class="table-responsive" style="max-height: 350px;">
                        <table class="table table-sm table-hover align-middle mb-0">
                            <thead class="table-light sticky-top">
                                <tr>
                                    <th style="width:40px;" class="text-center">
                                        <input class="form-check-input" type="checkbox" id="chk-select-all-sin-horario">
                                    </th>
                                    <th style="width:100px;">Clave</th>
                                    <th>Nombre del Empleado</th>
                                </tr>
                            </thead>
                            <tbody id="tbody-empleados-sin-horario">
                                <!-- Se llena dinámicamente -->
                            </tbody>
                        </table>
                    </div>

                    <div id="empleados-sin-horario-empty" class="text-center text-muted py-5" style="display:none;">
                        <i class="bi bi-person-check fs-2 d-block mb-2"></i>
                        No se encontraron empleados disponibles para asignar.
                    </div>
                </div>

            </div>
            <div class="modal-footer shadow-sm">
                <!-- Footer Paso 1 -->
                <div id="hv-footer-paso1" class="w-100 d-flex justify-content-between">
                    <button type="button" class="btn btn-light border" data-bs-dismiss="modal">Cancelar</button>
                    <button type="button" class="btn btn-primary px-4" id="btn-aplicar-horario">
                        Siguiente <i class="bi bi-arrow-right ms-1"></i>
                    </button>
                </div>

                <!-- Footer Paso 2 -->
                <div id="hv-footer-paso2" class="w-100 d-flex justify-content-between d-none">
                    <button type="button" class="btn btn-warning" id="btn-hv-regresar">
                        <i class="bi bi-arrow-left me-1"></i> Regresar
                    </button>
                    <button type="button" class="btn btn-success px-4" id="btn-asignar-horario-seleccionados">
                        <i class="bi bi-check2-circle me-1"></i> Asignar Horario
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>


