<!--  MODAL - ACTUALIZAR PERCEPCIONES -->
<div class="modal fade" id="modalActualizarPercepciones" tabindex="-1" aria-labelledby="modalActualizarPercepcionesLabel" aria-hidden="true">

    <div class="modal-dialog modal-xl modal-dialog-scrollable">

        <div class="modal-content">

            <!-- Encabezado -->
            <div class="modal-header bg-success text-white">

                <h5 class="modal-title" id="modalActualizarPercepcionesLabel">
                    <i class="bi bi-file-earmark-excel me-2"></i>
                    Actualizar Percepciones
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
                <div id="divListaEmpleadosActualizarPercepciones">

                    <!-- Configuración de percepción -->
                    <div class="card mb-3">

                        <div class="card-header bg-success text-white">

                            <strong>
                                Configurar percepción a actualizar
                            </strong>

                        </div>


                        <div class="card-body">

                            <div class="row">


                                <!-- Tipo percepción -->
                                <div class="col-md-6 mb-3">

                                    <label
                                        class="form-label fw-bold">
                                        Percepción
                                    </label>


                                    <select
                                        class="form-select"
                                        id="selectTipoPercepcionActualizar">


                                        <option value="">
                                            Seleccionar percepción
                                        </option>


                                        <option value="incentivo">
                                            Incentivo
                                        </option>


                                        <option value="bono_antiguedad">
                                            Bono de antigüedad
                                        </option>


                                        <option value="actividades_especiales">
                                            Actividades especiales
                                        </option>


                                        <option value="puesto">
                                            Puesto
                                        </option>


                                    </select>

                                </div>



                                <!-- Cantidad -->
                                <div class="col-md-6 mb-3">

                                    <label
                                        class="form-label fw-bold">
                                        Cantidad
                                    </label>


                                    <div class="input-group">


                                        <span class="input-group-text bg-success text-white">

                                            <i class="bi bi-currency-dollar"></i>

                                        </span>


                                        <input
                                            type="number"
                                            class="form-control"
                                            id="inputCantidadActualizarPercepcion"
                                            placeholder="Ingrese cantidad"
                                            min="0"
                                            step="0.01">


                                    </div>


                                </div>


                            </div>


                        </div>

                    </div>

                    <!-- Buscador -->
                    <div class="input-group mb-3">

                        <span class="input-group-text bg-success text-white">
                            <i class="bi bi-search"></i>
                        </span>

                        <input
                            type="text"
                            class="form-control"
                            id="txtBuscarEmpleadoActualizarPercepciones"
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
                                                    id="checkTodosActualizarPercepciones">
                                            </th>

                                            <th>Clave</th>

                                            <th>Nombre del Empleado</th>

                                        </tr>

                                    </thead>

                                    <tbody id="tbody-empleados-actualizar-percepciones">

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
                    id="btnActualizarPercepciones">

                    <i class="bi bi-check-circle me-2"></i>
                    Actualizar Percepciones
                </button>
            </div>

        </div>

    </div>

</div>