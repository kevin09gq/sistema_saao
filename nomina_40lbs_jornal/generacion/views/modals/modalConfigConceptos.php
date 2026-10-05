<!--  MODAL - CONFIGURAR CONCEPTOS -->
<div class="modal fade" id="modalConfigConceptos" tabindex="-1" aria-labelledby="modalConfigConceptosLabel" aria-hidden="true">

    <div class="modal-dialog modal-xl modal-dialog-scrollable">

        <div class="modal-content">

            <!-- Encabezado -->
            <div class="modal-header bg-success text-white">

                <h5 class="modal-title" id="modalConfigConceptosLabel">
                    <i class="bi bi-file-earmark-excel me-2"></i>
                    Configurar Conceptos
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

                                <label for="selectConceptoConfig" class="form-label">
                                    Concepto
                                </label>

                                <select
                                    class="form-select"
                                    id="selectConceptoConfig">

                                    <option value="todos">
                                        Todos los conceptos
                                    </option>

                                    <option value="tarjeta">
                                        Tarjeta
                                    </option>

                                    <option value="45">
                                        ISR
                                    </option>

                                    <option value="52">
                                        IMSS
                                    </option>
    
                                    <option value="16">
                                        INFONAVIT
                                    </option>

                                    <option value="107">
                                        Ajuste al Subsidio
                                    </option>

                                </select>

                            </div>

                            <!-- Acción -->
                            <div class="col-md-4">

                                <label for="selectAccionConcepto" class="form-label">
                                    Acción
                                </label>

                                <select
                                    class="form-select"
                                    id="selectAccionConcepto">

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
                <div id="divListaEmpleadosConfigConceptos">

                    <!-- Buscador -->
                    <div class="input-group mb-3">

                        <span class="input-group-text bg-success text-white">
                            <i class="bi bi-search"></i>
                        </span>

                        <input
                            type="text"
                            class="form-control"
                            id="txtBuscarEmpleadoConfigConceptos"
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
                                                    id="checkTodosConfigConceptos">
                                            </th>

                                            <th>Clave</th>

                                            <th>Nombre del Empleado</th>

                                        </tr>

                                    </thead>

                                    <tbody id="tbody-empleados-config-conceptos">

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
                    id="btnEstablecerConfigConceptos">

                    <i class="bi bi-check-circle me-2"></i>
                    Configurar Conceptos
                </button>

            </div>

        </div>

    </div>

</div>