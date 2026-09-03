<!--  MODAL - DISPERSION DE TARJETA -->
<div class="modal fade" id="modalDispersionTarjeta" tabindex="-1" aria-labelledby="modalDispersionTarjetaLabel" aria-hidden="true">

    <div class="modal-dialog modal-xl modal-dialog-scrollable">

        <div class="modal-content">

            <!-- Encabezado -->
            <div class="modal-header bg-success text-white">

                <h5 class="modal-title" id="modalDispersionTarjetaLabel">
                    <i class="bi bi-file-earmark-excel me-2"></i>
                    Dispersion de Tarjeta
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

                <!--  PASO 1 - SELECCIONAR EMPLEADOS  -->
                <div id="divListaEmpleadosDispersionTarjeta">
                    <!-- Buscador y filtro por departamento -->
                    <div class="row mb-3">

                        <!-- Buscador -->
                        <div class="col-md-8">

                            <div class="input-group">

                                <span class="input-group-text bg-success text-white">
                                    <i class="bi bi-search"></i>
                                </span>

                                <input
                                    type="text"
                                    class="form-control"
                                    id="txtBuscarEmpleadoDispersionTarjeta"
                                    placeholder="Buscar empleado por nombre o clave">

                            </div>

                        </div>

                        <!-- Departamento -->
                        <div class="col-md-4">

                            <select
                                class="form-select"
                                id="selectDepartamentoDispersionTarjeta">

                                <option value="">
                                    Todos los departamentos
                                </option>

                            </select>

                        </div>

                    </div>

                    <!-- Lista de empleados -->
                    <div class="card">

                        <div class="card-header">

                            <strong>Seleccionar empleados</strong>

                        </div>

                        <div class="card-body p-0">

                            <div class="table-responsive">

                                <table class="table table-hover table-bordered align-middle mb-0">

                                    <thead class="table-light">

                                        <tr>

                                            <th>Clave</th>

                                            <th>Nombre del Empleado</th>

                                            <th>Tarjeta</th>

                                        </tr>

                                    </thead>

                                    <tbody id="tbody-empleados-dispersion-tarjeta">

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
            </div>

        </div>

    </div>

</div>