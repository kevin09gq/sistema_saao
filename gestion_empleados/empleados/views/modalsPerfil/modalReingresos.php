<!-- Modal Reingresos -->
<div
    class="modal fade"
    id="modalReingresos"
    tabindex="-1"
    aria-labelledby="modalReingresosLabel"
    aria-hidden="true">

    <div class="modal-dialog modal-xl modal-dialog-scrollable">

        <div class="modal-content">

            <!-- ========================================= -->
            <!-- ENCABEZADO -->
            <!-- ========================================= -->

            <div class="modal-header">
                <h5 class="modal-title" id="modalReingresosLabel">
                    <i class="bi bi-clock-history me-2"></i>
                    Gestión de Reingresos
                </h5>
                <button
                    type="button"
                    class="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Cerrar">
                </button>
            </div>

            <!-- ========================================= -->
            <!-- CUERPO -->
            <!-- ========================================= -->

            <div class="modal-body" id="formReingresoEmpleado">

                <!-- ========================================= -->
                <!-- EDITAR FECHAS ACTUALES -->
                <!-- ========================================= -->

                <div class="card border-0 bg-light mb-4">

                    <div class="card-body">

                        <h6 class="fw-bold text-secondary mb-3">
                            <i class="bi bi-calendar-check me-2"></i>
                            Fechas actuales
                        </h6>

                        <form id="formEditarFechasReingreso">

                            <div class="row g-3">

                                <!-- Fecha Alta Empresa -->
                                <div class="col-md-6">

                                    <label
                                        for="editarFechaAltaEmpresa"
                                        class="form-label fw-semibold">
                                        Fecha Alta Empresa
                                    </label>

                                    <div class="input-group">
                                        <input
                                            type="date"
                                            class="form-control"
                                            id="editarFechaAltaEmpresa"
                                            name="fecha_alta_empresa">

                                        <button
                                            type="button"
                                            class="btn btn-outline-primary"
                                            id="btnActualizarFechaAltaEmpresa">
                                            <i class="bi bi-check-lg"></i>
                                        </button>
                                    </div>

                                </div>


                                <!-- Fecha Alta IMSS -->
                                <div class="col-md-6">

                                    <label
                                        for="editarFechaAltaImss"
                                        class="form-label fw-semibold">
                                        Fecha Alta IMSS
                                    </label>

                                    <div class="input-group">
                                        <input
                                            type="date"
                                            class="form-control"
                                            id="editarFechaAltaImss"
                                            name="fecha_alta_imss">

                                        <button
                                            type="button"
                                            class="btn btn-outline-primary"
                                            id="btnActualizarFechaAltaImss">
                                            <i class="bi bi-check-lg"></i>
                                        </button>
                                    </div>

                                </div>

                            </div>

                        </form>

                    </div>

                </div>


                <!-- ========================================= -->
                <!-- HISTORIAL DE REINGRESOS -->
                <!-- ========================================= -->

                <div class="card border-0 bg-light">

                    <div class="card-body">

                        <div class="d-flex justify-content-between align-items-center mb-3">
                            <h6 class="fw-bold text-secondary mb-0">
                                <i class="bi bi-clock-history me-2"></i>
                                Historial de reingresos
                            </h6>

                            <button
                                type="button"
                                class="btn btn-sm btn-primary"
                                onclick="abrirModalNuevoReingreso()">
                                <i class="bi bi-plus-lg me-1"></i>
                                Nuevo reingreso
                            </button>
                        </div>


                        <!-- Tabla -->

                        <div class="table-responsive">

                            <table
                                class="table table-hover align-middle mb-0">

                                <thead class="table-light">

                                    <tr>

                                        <th>
                                            #
                                        </th>

                                        <th>
                                            Fecha de Reingreso
                                        </th>

                                        <th>
                                            Fecha de Salida
                                        </th>

                                        <th class="text-center">
                                            Acción
                                        </th>

                                    </tr>

                                </thead>


                                <tbody id="tablaHistorialReingresos">

                                    <!--
                                        El historial de reingresos
                                        se mostrará aquí
                                    -->

                                    <tr id="filaSinReingresos">

                                        <td
                                            colspan="4"
                                            class="text-center text-muted py-4">

                                            <i
                                                class="bi bi-calendar-x fs-3 d-block mb-2">
                                            </i>

                                            No hay reingresos registrados

                                        </td>

                                    </tr>

                                </tbody>

                            </table>

                        </div>

                    </div>

                </div>

            </div>


            <!-- ========================================= -->
            <!-- PIE -->
            <!-- ========================================= -->

            <div class="modal-footer">

                <button
                    type="button"
                    class="btn btn-secondary"
                    data-bs-dismiss="modal">

                    Cancelar

                </button>
            </div>

        </div>

    </div>

</div>


<!-- Modal Nuevo Reingreso -->
<div
    class="modal fade"
    id="modalNuevoReingreso"
    tabindex="-1"
    aria-labelledby="modalNuevoReingresoLabel"
    aria-hidden="true">

    <div class="modal-dialog modal-dialog-scrollable">

        <div class="modal-content">

            <!-- Encabezado -->
            <div class="modal-header">

                <h5 class="modal-title" id="modalNuevoReingresoLabel">
                    Nuevo Reingreso
                </h5>

                <button
                    type="button"
                    class="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Cerrar">
                </button>

            </div>

            <!-- Cuerpo -->
            <div class="modal-body">

                <form id="formNuevoReingreso">

                    <div class="card border-0 bg-light">

                        <div class="card-body">

                            <h6 class="fw-bold text-secondary mb-3">
                                <i class="bi bi-calendar-plus me-2"></i>
                                Fechas del reingreso
                            </h6>

                            <div class="row g-3">

                                <!-- Fecha de Reingreso -->
                                <div class="col-md-6">

                                    <label
                                        for="nuevaFechaReingreso"
                                        class="form-label fw-semibold">
                                        Fecha de Reingreso
                                    </label>

                                    <input
                                        type="date"
                                        class="form-control"
                                        id="nuevaFechaReingreso"
                                        name="fecha_reingreso"
                                        required>

                                </div>

                                <!-- Fecha de Salida -->
                                <div class="col-md-6">

                                    <label
                                        for="nuevaFechaSalida"
                                        class="form-label fw-semibold">
                                        Fecha de Salida (opcional)
                                    </label>

                                    <input
                                        type="date"
                                        class="form-control"
                                        id="nuevaFechaSalida"
                                        name="fecha_salida">

                                </div>

                            </div>

                        </div>

                    </div>

                </form>

            </div>

            <!-- Pie -->
            <div class="modal-footer">

                <button
                    type="button"
                    class="btn btn-secondary"
                    data-bs-dismiss="modal">
                    Cancelar
                </button>

                <button
                    type="button"
                    class="btn btn-success"
                    id="btnGuardarNuevoReingreso">

                    <i class="bi bi-check-lg me-1"></i>
                    Guardar reingreso

                </button>

            </div>

        </div>

    </div>

</div>


