<!-- ===========================================================
 MODAL - AGREGAR / QUITAR DÍAS EXTRA (JORNALEROS)
=========================================================== -->

<div class="modal fade"
    id="modalDiasExtra"
    tabindex="-1"
    aria-labelledby="modalDiasExtraLabel"
    aria-hidden="true">

    <div class="modal-dialog modal-xl modal-dialog-scrollable">

        <div class="modal-content">

            <!-- ENCABEZADO -->
            <div class="modal-header bg-success text-white">

                <h5 class="modal-title" id="modalDiasExtraLabel">
                    <i class="bi bi-calendar-plus me-2"></i>
                    Agregar / Quitar Días Extra
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

                <!-- PASO 1 - SELECCIONAR DÍA -->
                <div class="card mb-4">

                    <div class="card-header bg-light">
                        <strong>Paso 1. Configurar Día Extra</strong>
                    </div>

                    <div class="card-body">
                        <div class="row g-3 align-items-end">

                            <!-- SELECT DÍA -->
                            <div class="col-md-5">

                                <label for="selectDiaDiasExtra" class="form-label">
                                    Día de la semana
                                </label>

                                <select class="form-select" id="selectDiaDiasExtra">
                                    <option value="">Seleccione un día...</option>
                                    <option value="LUNES">Lunes</option>
                                    <option value="MARTES">Martes</option>
                                    <option value="MIÉRCOLES">Miércoles</option>
                                    <option value="JUEVES">Jueves</option>
                                    <option value="VIERNES">Viernes</option>
                                    <option value="SÁBADO">Sábado</option>
                                    <option value="DOMINGO">Domingo</option>
                                </select>

                            </div>

                            <!-- SELECT ACCIÓN -->
                            <div class="col-md-4">

                                <label for="selectAccionDiasExtra" class="form-label">
                                    Acción
                                </label>

                                <select class="form-select" id="selectAccionDiasExtra">
                                    <option value="">Seleccione...</option>
                                    <option value="agregar">
                                        <i class="bi bi-plus-circle"></i> Agregar día
                                    </option>
                                    <option value="quitar">
                                        <i class="bi bi-dash-circle"></i> Quitar día
                                    </option>
                                </select>

                            </div>

                            <!-- BOTÓN SIGUIENTE -->
                            <div class="col-md-3">

                                <button type="button" class="btn btn-primary w-100" id="btnSiguienteDiasExtra">
                                    Siguiente <i class="bi bi-arrow-right ms-1"></i>
                                </button>

                            </div>

                        </div>
                    </div>

                </div>


                <!-- PASO 2 - SELECCIONAR EMPLEADOS -->
                <div id="divListaEmpleadosDiasExtra" style="display: none;">

                    <!-- Buscador -->
                    <div class="input-group mb-3">

                        <span class="input-group-text bg-success text-white">
                            <i class="bi bi-search"></i>
                        </span>

                        <input
                            type="text"
                            class="form-control"
                            id="txtBuscarEmpleadoDiasExtra"
                            placeholder="Buscar empleado por nombre o clave...">

                    </div>

                    <!-- Tabla de empleados -->
                    <div class="card">

                        <div class="card-header">
                            <strong id="labelTablaDiasExtra">Seleccionar empleados</strong>
                        </div>

                        <div class="card-body p-0">

                            <div class="table-responsive">

                                <table class="table table-hover table-bordered align-middle mb-0">

                                    <thead class="table-light">
                                        <tr>

                                            <th width="60" class="text-center">
                                                <input
                                                    type="checkbox"
                                                    class="form-check-input"
                                                    id="checkTodosDiasExtra">
                                            </th>

                                            <th>Clave</th>

                                            <th>Nombre del Empleado</th>

                                            <th class="text-center">Días Trabajados</th>

                                            <th>Días Extra</th>

                                        </tr>
                                    </thead>

                                    <tbody id="tbody-empleados-dias-extra">
                                        <!-- se poblará dinámicamente -->
                                    </tbody>

                                </table>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

            <!-- PIE DE MODAL -->
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
                    id="btnAplicarDiasExtra">
                    <i class="bi bi-check-circle me-2"></i>
                    Aplicar
                </button>

            </div>

        </div>

    </div>

</div>
