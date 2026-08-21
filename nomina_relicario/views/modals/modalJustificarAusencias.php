<!--  MODAL - JUSTIFICAR AUSENCIAS -->
<div class="modal fade" id="modalJustificarAusencias" tabindex="-1" aria-labelledby="modalJustificarAusenciasLabel" aria-hidden="true">

    <div class="modal-dialog modal-xl modal-dialog-scrollable">

        <div class="modal-content">

            <!-- Encabezado -->
            <div class="modal-header bg-success text-white">

                <h5 class="modal-title" id="modalJustificarAusenciasLabel">
                    <i class="bi bi-calendar2-check me-2"></i>
                    Justificar Ausencias
                </h5>

                <button
                    type="button"
                    class="btn-close btn-close-white"
                    data-bs-dismiss="modal"
                    aria-label="Cerrar">
                </button>

            </div>

            <!-- CUERPO -->
            <div class="modal-body">

                <!--  PASO 1 - AGREGAR DIAS DE JUSTIFICACION  -->
                <div class="card mb-4">

                    <div class="card-header bg-light">
                        <strong>Paso 1. Configurar Justificación</strong>
                    </div>

                    <div class="card-body">
                        <div class="row g-3">

                            <!-- CHECKBOXES DÍAS (SELECCIÓN MÚLTIPLE) -->
                            <div class="col-md-6">

                                <label class="form-label">
                                    Días de la semana
                                </label>

                                <div class="d-flex flex-wrap gap-2 p-2 border rounded bg-white" id="checksDiasJustificarAusencias">
                                    <div class="form-check">
                                        <input class="form-check-input check-dia-justificar" type="checkbox" value="LUNES" id="checkDiaLunesJustificar">
                                        <label class="form-check-label" for="checkDiaLunesJustificar">Lunes</label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input check-dia-justificar" type="checkbox" value="MARTES" id="checkDiaMartesJustificar">
                                        <label class="form-check-label" for="checkDiaMartesJustificar">Martes</label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input check-dia-justificar" type="checkbox" value="MIÉRCOLES" id="checkDiaMiercolesJustificar">
                                        <label class="form-check-label" for="checkDiaMiercolesJustificar">Miércoles</label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input check-dia-justificar" type="checkbox" value="JUEVES" id="checkDiaJuevesJustificar">
                                        <label class="form-check-label" for="checkDiaJuevesJustificar">Jueves</label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input check-dia-justificar" type="checkbox" value="VIERNES" id="checkDiaViernesJustificar">
                                        <label class="form-check-label" for="checkDiaViernesJustificar">Viernes</label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input check-dia-justificar" type="checkbox" value="SÁBADO" id="checkDiaSabadoJustificar">
                                        <label class="form-check-label" for="checkDiaSabadoJustificar">Sábado</label>
                                    </div>
                                    <div class="form-check">
                                        <input class="form-check-input check-dia-justificar" type="checkbox" value="DOMINGO" id="checkDiaDomingoJustificar">
                                        <label class="form-check-label" for="checkDiaDomingoJustificar">Domingo</label>
                                    </div>
                                </div>

                            </div>

                            <!-- INPUT TIPO / MOTIVO -->
                            <div class="col-md-6">

                                <label for="inputTipoJustificarAusencias" class="form-label">
                                    Tipo / Motivo
                                </label>

                                <input
                                    type="text"
                                    class="form-control"
                                    id="inputTipoJustificarAusencias"
                                    placeholder="Ej. Día festivo, Incapacidad, Permiso...">

                            </div>

                        </div>
                    </div>

                </div>


                <!--  PASO 2 - SELECCIONAR EMPLEADOS  -->
                <div id="divListaEmpleadosJustificarAusencias">

                    <!-- Buscador -->
                    <div class="input-group mb-3">

                        <span class="input-group-text bg-success text-white">
                            <i class="bi bi-search"></i>
                        </span>

                        <input
                            type="text"
                            class="form-control"
                            id="txtBuscarEmpleadoJustificarAusencias"
                            placeholder="Buscar empleado por nombre o clave">

                    </div>

                    <!-- Lista de empleados -->
                    <div class="card">

                        <div class="card-header">
                            <strong>Empleados con ausencias</strong>
                        </div>

                        <div class="card-body p-0">

                            <div class="table-responsive">

                                <table class="table table-hover table-bordered align-middle mb-0">

                                    <thead class="table-light">

                                        <tr>

                                            <th width="60">
                                                <input
                                                    type="checkbox"
                                                    class="form-check-input"
                                                    id="checkTodosJustificarAusencias">
                                            </th>

                                            <th>Clave</th>

                                            <th>Nombre del Empleado</th>

                                            <th class="text-center">Ausencias</th>

                                            <th>Días</th>

                                        </tr>

                                    </thead>

                                    <tbody id="tbody-empleados-justificar-ausencias">

                                    </tbody>

                                </table>

                            </div>

                        </div>

                    </div>

                </div>


            </div>

            <!--  PIE  -->
            <div class="modal-footer justify-content-between">

                <button
                    type="button"
                    class="btn btn-outline-secondary"
                    data-bs-dismiss="modal">

                    Cancelar

                </button>

                <button
                    type="button"
                    class="btn btn-success"
                    id="btnEstablecerJustificacionAusencias">

                    <i class="bi bi-check-circle me-2"></i>
                    Justificar Ausencias
                </button>

            </div>

        </div>

    </div>

</div>