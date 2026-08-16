<!-- ===========================================================
 MODAL - APLICAR FESTIVIDADES
=========================================================== -->

<div class="modal fade"
    id="modalFestividades"
    tabindex="-1"
    aria-labelledby="modalFestividadesLabel"
    aria-hidden="true">

    <div class="modal-dialog modal-xl modal-dialog-scrollable">

        <div class="modal-content">

            <!-- ENCABEZADO -->
            <div class="modal-header bg-success text-white">

                <h5 class="modal-title" id="modalFestividadesLabel">
                    <i class="bi bi-calendar-event me-2"></i>
                    Aplicar Festividades
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

                <!-- PASO 1 - SELECCIONAR FESTIVIDAD -->
                <div class="card mb-4">

                    <div class="card-header bg-light">
                        <strong>Paso 1. Seleccionar Día Festivo</strong>
                    </div>

                    <div class="card-body">
                        <div class="row align-items-end">

                            <!-- SELECT FESTIVIDAD -->
                            <div class="col-md-8">
                                <label for="selectFestividadModal" class="form-label">
                                    Días Festivos en el periodo de Nómina
                                </label>

                                <select class="form-select" id="selectFestividadModal">
                                    <option value="">Seleccione un día festivo...</option>
                                </select>
                            </div>

                            <!-- BOTON SIGUIENTE -->
                            <div class="col-md-4 text-end mt-3 mt-md-0">
                                <button type="button" class="btn btn-primary w-100" id="btnSiguienteFestividad">
                                    Siguiente <i class="bi bi-arrow-right ms-1"></i>
                                </button>
                            </div>

                        </div>
                    </div>

                </div>

                <!-- PASO 2 - SELECCIONAR EMPLEADOS -->
                <div id="divListaEmpleadosFestividades" style="display: none;">

                    <div class="card">

                        <div class="card-header bg-light">
                            <strong>Paso 2. Seleccionar Empleados (Departamentos Horario Oficial)</strong>
                        </div>

                        <div class="card-body p-3">

                            <!-- Buscador -->
                            <div class="input-group mb-3">
                                <span class="input-group-text bg-success text-white">
                                    <i class="bi bi-search"></i>
                                </span>
                                <input
                                    type="text"
                                    class="form-control"
                                    id="txtBuscarEmpleadoFestividades"
                                    placeholder="Buscar empleado por clave o nombre...">
                            </div>

                            <!-- Tabla Empleados -->
                            <div class="table-responsive">
                                <table class="table table-hover table-bordered align-middle mb-0">

                                    <thead class="table-light">

                                        <tr>

                                            <th width="60" class="text-center">
                                                <input
                                                    type="checkbox"
                                                    class="form-check-input"
                                                    id="checkTodosFestividades">
                                            </th>

                                            <th>Clave</th>

                                            <th>Nombre del Empleado</th>

                                        </tr>

                                    </thead>

                                    <tbody id="tbody-empleados-festividades">
                                        <!-- Se poblará dinámicamente -->
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
                    id="btnAplicarFestividades">
                    <i class="bi bi-check-circle me-2"></i>
                    Aplicar Festividad
                </button>

            </div>

        </div>

    </div>

</div>
