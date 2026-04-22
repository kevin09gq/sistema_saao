
<div class="modal fade" id="modalHorarioVariable" tabindex="-1" aria-labelledby="modalHorarioVariableLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header bg-success text-white">
                <h5 class="modal-title" id="modalHorarioVariableLabel">Asignar Horario Variable</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div class="modal-body">
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
                            <button type="button" class="btn btn-primary btn-sm" id="hv-btn-copiar-horario" title="Copiar a todos los días" aria-label="Copiar a todos los días">
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
                                    <td style="width:160px;"><input type="text" class="form-control form-control-sm" value="LUNES"></td>
                                    <td><input type="time" class="form-control form-control-sm entrada"></td>
                                    <td><input type="time" class="form-control form-control-sm salida-comida"></td>
                                    <td><input type="time" class="form-control form-control-sm entrada-comida"></td>
                                    <td><input type="time" class="form-control form-control-sm salida"></td>
                                </tr>
                                <tr>
                                    <td><input type="text" class="form-control form-control-sm" value="MARTES"></td>
                                    <td><input type="time" class="form-control form-control-sm entrada"></td>
                                    <td><input type="time" class="form-control form-control-sm salida-comida"></td>
                                    <td><input type="time" class="form-control form-control-sm entrada-comida"></td>
                                    <td><input type="time" class="form-control form-control-sm salida"></td>
                                </tr>
                                <tr>
                                    <td><input type="text" class="form-control form-control-sm" value="MIERCOLES"></td>
                                    <td><input type="time" class="form-control form-control-sm entrada"></td>
                                    <td><input type="time" class="form-control form-control-sm salida-comida"></td>
                                    <td><input type="time" class="form-control form-control-sm entrada-comida"></td>
                                    <td><input type="time" class="form-control form-control-sm salida"></td>
                                </tr>
                                <tr>
                                    <td><input type="text" class="form-control form-control-sm" value="JUEVES"></td>
                                    <td><input type="time" class="form-control form-control-sm entrada"></td>
                                    <td><input type="time" class="form-control form-control-sm salida-comida"></td>
                                    <td><input type="time" class="form-control form-control-sm entrada-comida"></td>
                                    <td><input type="time" class="form-control form-control-sm salida"></td>
                                </tr>
                                <tr>
                                    <td><input type="text" class="form-control form-control-sm" value="VIERNES"></td>
                                    <td><input type="time" class="form-control form-control-sm entrada"></td>
                                    <td><input type="time" class="form-control form-control-sm salida-comida"></td>
                                    <td><input type="time" class="form-control form-control-sm entrada-comida"></td>
                                    <td><input type="time" class="form-control form-control-sm salida"></td>
                                </tr>
                                <tr>
                                    <td><input type="text" class="form-control form-control-sm" value="SABADO"></td>
                                    <td><input type="time" class="form-control form-control-sm entrada"></td>
                                    <td><input type="time" class="form-control form-control-sm salida-comida"></td>
                                    <td><input type="time" class="form-control form-control-sm entrada-comida"></td>
                                    <td><input type="time" class="form-control form-control-sm salida"></td>
                                </tr>
                                <tr>
                                    <td><input type="text" class="form-control form-control-sm" value="DOMINGO"></td>
                                    <td><input type="time" class="form-control form-control-sm entrada"></td>
                                    <td><input type="time" class="form-control form-control-sm salida-comida"></td>
                                    <td><input type="time" class="form-control form-control-sm entrada-comida"></td>
                                    <td><input type="time" class="form-control form-control-sm salida"></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="form-text">Este horario se aplicará como si fuera un registro en la tabla de horarios oficiales.</div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-primary btn-aplicar-horario" id="btn-aplicar-horario">Aplicar</button>
            </div>
        </div>
    </div>
</div>


