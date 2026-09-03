<!--  MODAL - ESTABLECER SUELDO BASE -->
<div class="modal fade" id="modalSueldoBase" tabindex="-1" aria-labelledby="modalSueldoBaseLabel" aria-hidden="true">

    <div class="modal-dialog modal-xl modal-dialog-scrollable">

        <div class="modal-content">

            <!-- Encabezado -->
            <div class="modal-header bg-success text-white">

                <h5 class="modal-title" id="modalSueldoBaseLabel">
                    <i class="bi bi-file-earmark-excel me-2"></i>
                    Establecer Sueldo Base
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
                <div id="divListaEmpleadosSueldoBase">

                    <!-- Buscador -->
                    <div class="input-group mb-3">

                        <span class="input-group-text bg-success text-white">
                            <i class="bi bi-search"></i>
                        </span>

                        <input
                            type="text"
                            class="form-control"
                            id="txtBuscarEmpleadoSueldoBase"
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
                                                    id="checkTodosSueldoBase">
                                            </th>

                                            <th>Clave</th>

                                            <th>Nombre del Empleado</th>

                                        </tr>

                                    </thead>

                                    <tbody id="tbody-empleados-sueldo-base">

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
                    id="btnEstablecerSueldoBase">

                    <i class="bi bi-check-circle me-2"></i>
                    Establecer Sueldo Base
                </button>

                <button
                    type="button"
                    class="btn btn-success"
                    id="btnQuitarSueldoBase">

                    <i class="bi bi-x-circle me-2"></i>
                    Quitar Sueldo Base
                </button>
            </div>

        </div>

    </div>

</div>