<!--  MODAL - GESTIONAR VALORES ECONOMICOS -->
<div class="modal fade" id="modalGestionarValoresEconomicos" tabindex="-1" aria-labelledby="modalGestionarValoresEconomicosLabel" aria-hidden="true">

    <div class="modal-dialog modal-xl modal-dialog-scrollable">

        <div class="modal-content">

            <!-- Encabezado -->
            <div class="modal-header bg-success text-white">

                <h5 class="modal-title" id="modalGestionarValoresEconomicosLabel">
                    <i class="bi bi-file-earmark-excel me-2"></i>
                    Gestionar Valores Economicos
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
                <!--  PASO 1 - SELECCIONAR CONFIGURACION  -->

                <div class="card mb-4">

                    <div class="card-header bg-light">

                        <strong>Paso 1. Configuración</strong>

                    </div>

                    <div class="card-body">

                        <div class="row">

                            <!-- Concepto -->
                            <div class="col-md-8">

                                <label for="selectConceptoGestionarValoresEconomicos" class="form-label">
                                    Concepto
                                </label>

                                <select
                                    class="form-select"
                                    id="selectConceptoGestionarValoresEconomicos">

                                    <option value="todos">
                                        Todos los conceptos
                                    </option>

                                    <option value="pasaje">
                                        Pasaje
                                    </option>

                                    <option value="comida">
                                        Comida
                                    </option>

                                    <option value="tardeada">
                                        Tardeada
                                    </option>

                                </select>

                            </div>

                            <!-- Acción -->
                            <div class="col-md-4">

                                <label for="selectAccionGestionarValoresEconomicos" class="form-label">
                                    Acción
                                </label>

                                <select
                                    class="form-select"
                                    id="selectAccionGestionarValoresEconomicos">

                                    <option value="">Seleccione...</option>

                                    <option value="asignar">
                                        Asignar
                                    </option>

                                    <option value="quitar">
                                        Quitar
                                    </option>

                                </select>

                            </div>

                        </div>

                    </div>

                </div>


                <!--  PASO 2 - SELECCIONAR EMPLEADOS  -->
                <div id="divListaEmpleadosGestionarValoresEconomicos">

                    <!-- Buscador -->
                    <div class="input-group mb-3">

                        <span class="input-group-text bg-success text-white">
                            <i class="bi bi-search"></i>
                        </span>

                        <input
                            type="text"
                            class="form-control"
                            id="txtBuscarEmpleadoGestionarValoresEconomicos"
                            placeholder="Buscar empleado por nombre o clave">

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

                                            <th width="60">
                                                <input
                                                    type="checkbox"
                                                    class="form-check-input"
                                                    id="checkTodosGestionarValoresEconomicos">
                                            </th>

                                            <th>Clave</th>

                                            <th>Nombre del Empleado</th>

                                        </tr>

                                    </thead>

                                    <tbody id="tbody-empleados-gestionar-valores-economicos">

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
                    id="btnEstablecerGestionarValoresEconomicos">

                    <i class="bi bi-check-circle me-2"></i>
                    Configurar Conceptos
                </button>

            </div>

        </div>

    </div>

</div>