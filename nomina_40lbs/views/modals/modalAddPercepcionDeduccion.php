<!--  MODAL - AGREGAR PERCEPCIONES / DEDUCCIONES  -->
<div class="modal fade" id="modalAddConceptos" tabindex="-1" aria-labelledby="modalAddConceptosLabel" aria-hidden="true">

    <div class="modal-dialog modal-xl modal-dialog-scrollable">

        <div class="modal-content">

            <!-- Encabezado -->
            <div class="modal-header bg-success text-white">

                <h5 class="modal-title" id="modalAddConceptosLabel">
                    <i class="bi bi-file-earmark-excel me-2"></i>
                    Agregar Percepciones / Deducciones
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

                <div class="card mb-3">

                    <div class="card-header bg-success text-white">

                        <strong>

                            <i class="bi bi-pencil-square me-2"></i>

                            Información del Concepto

                        </strong>

                    </div>

                    <div class="card-body">

                        <div class="row">

                            <!-- Tipo -->
                            <div class="col-md-4 mb-3">

                                <label
                                    for="selectTipoConceptoExtra"
                                    class="form-label fw-bold">

                                    Tipo

                                </label>

                                <select
                                    class="form-select"
                                    id="selectTipoConceptoExtra">

                                    <option value="percepcion">
                                        Percepción
                                    </option>

                                    <option value="deduccion">
                                        Deducción
                                    </option>

                                </select>

                            </div>

                            <!-- Nombre -->
                            <div class="col-md-5 mb-3">

                                <label
                                    for="inputNombreConceptoExtra"
                                    class="form-label fw-bold">

                                    Nombre del Concepto

                                </label>

                                <input
                                    type="text"
                                    class="form-control"
                                    id="inputNombreConceptoExtra"
                                    placeholder="Ej. Bono de productividad">

                            </div>

                            <!-- Cantidad -->
                            <div class="col-md-3 mb-3">

                                <label
                                    for="inputCantidadConceptoExtra"
                                    class="form-label fw-bold">

                                    Cantidad ($)

                                </label>

                                <input
                                    type="number"
                                    class="form-control"
                                    id="inputCantidadConceptoExtra"
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01">

                            </div>

                        </div>

                    </div>

                </div>

                <!--  PASO 1 - SELECCIONAR EMPLEADOS  -->
                <div id="divListaEmpleadosAddConceptos">

                    <!-- Buscador -->
                    <div class="input-group mb-3">

                        <span class="input-group-text bg-success text-white">
                            <i class="bi bi-search"></i>
                        </span>

                        <input
                            type="text"
                            class="form-control"
                            id="txtBuscarEmpleadoAddConceptos"
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
                                                    id="checkTodosAddConceptos">
                                            </th>

                                            <th>Clave</th>

                                            <th>Nombre del Empleado</th>

                                        </tr>

                                    </thead>

                                    <tbody id="tbody-empleados-add-conceptos">

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
                    id="btnAddConceptos">

                    <i class="bi bi-check-circle me-2"></i>
                    Agregar Percepciones / Deducciones
                </button>

            </div>

        </div>

    </div>

</div>