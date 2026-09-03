<!--  MODAL - CARGAR BIOMETRICO -->
<div class="modal fade" id="modalBiometrico" tabindex="-1" aria-labelledby="modalBiometricoLabel" aria-hidden="true">

    <div class="modal-dialog modal-xl modal-dialog-scrollable">

        <div class="modal-content">

            <!-- Encabezado -->
            <div class="modal-header bg-success text-white">

                <h5 class="modal-title" id="modalBiometricoLabel">
                    <i class="bi bi-file-earmark-excel me-2"></i>
                    Actualizar Biométrico
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
                <div id="divListaEmpleadosBiometrico">

                    <!-- Buscador -->
                    <div class="input-group mb-3">

                        <span class="input-group-text bg-success text-white">
                            <i class="bi bi-search"></i>
                        </span>

                        <input
                            type="text"
                            class="form-control"
                            id="txtBuscarEmpleadoBiometrico"
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
                                                    id="checkTodosBiometrico">
                                            </th>

                                            <th>Clave</th>

                                            <th>Nombre del Empleado</th>

                                        </tr>

                                    </thead>

                                    <tbody id="tbody-empleados-biometrico">

                                    </tbody>

                                </table>

                            </div>

                        </div>

                    </div>

                </div>

                <!--  PASO 2 - SUBIR ARCHIVO EXCEL  -->
                <div id="divSubirExcelBiometrico" style="display:none;">

                    <div class="card">

                        <div class="card-header bg-success text-white">

                            <strong>
                                <i class="bi bi-file-earmark-excel me-2"></i>
                                Cargar archivo Excel
                            </strong>

                        </div>

                        <div class="card-body">

                            <div class="mb-3">

                                <label class="form-label fw-bold">

                                    Seleccione el archivo de Excel

                                </label>

                                <input
                                    type="file"
                                    class="form-control"
                                    id="inputArchivoBiometrico"
                                    accept=".xlsx,.xls">

                            </div>

                            <!-- BOTÓN PARA PROCESAR EL ARCHIVO -->
                            <div class="d-grid mb-3">

                                <button
                                    type="button"
                                    class="btn btn-success"
                                    id="btnProcesarBiometrico">

                                    <i class="bi bi-gear-fill me-2"></i>

                                    Procesar Archivo

                                </button>

                            </div>

                            <div class="alert alert-info mb-0">

                                <i class="bi bi-info-circle me-2"></i>

                                Seleccione el archivo de Excel correspondiente al biométrico para continuar.

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

                <div>

                    <!-- Botón Regresar -->
                    <button
                        type="button"
                        class="btn btn-outline-success me-2"
                        id="btnRegresarBiometrico"
                        style="display:none;">

                        <i class="bi bi-arrow-left-circle me-1"></i>

                        Regresar

                    </button>

                    <!-- Botón Continuar -->
                    <button
                        type="button"
                        class="btn btn-success"
                        id="btnContinuarBiometrico">

                        <i class="bi bi-arrow-right-circle me-1"></i>

                        Continuar

                    </button>

                </div>

            </div>

        </div>

    </div>

</div>