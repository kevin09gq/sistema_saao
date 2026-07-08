<!-- ===========================================================
 MODAL - CARGAR LISTA DE RAYA
============================================================ -->
<div class="modal fade" id="modalListaRaya" tabindex="-1" aria-labelledby="modalListaRayaLabel" aria-hidden="true">

    <div class="modal-dialog modal-xl modal-dialog-scrollable">

        <div class="modal-content">

            <!-- Encabezado -->
            <div class="modal-header bg-success text-white">

                <h5 class="modal-title" id="modalListaRayaLabel">
                    <i class="bi bi-file-earmark-excel me-2"></i>
                    Actualizar Lista de Raya
                </h5>

                <button
                    type="button"
                    class="btn-close btn-close-white"
                    data-bs-dismiss="modal"
                    aria-label="Cerrar">
                </button>

            </div>

            <!-- Cuerpo -->
            <div class="modal-body">

                <!-- Lista de empleados -->
                <div class="card">

                    <div class="card-header">

                        <strong>Empleados</strong>

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
                                                id="checkTodos">

                                        </th>

                                        <th>Clave</th>

                                        <th>Nombre del Empleado</th>

                                        <th width="120">
                                            Seguro Social
                                        </th>

                                    </tr>

                                </thead>

                                <tbody id="tbody-empleados-lista-raya">

                                    <!--
                                        Se llenará dinámicamente con JavaScript.

                                        Ejemplo:

                                        <tr>

                                            <td>
                                                <input
                                                    type="checkbox"
                                                    class="form-check-input">
                                            </td>

                                            <td>001</td>

                                            <td>Juan Pérez</td>

                                            <td>CSS</td>

                                        </tr>

                                    -->

                                </tbody>

                            </table>

                        </div>

                    </div>

                </div>

            </div>

            <!-- Pie -->
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
                    id="btnContinuarListaRaya">

                    <i class="bi bi-arrow-right-circle me-1"></i>

                    Continuar

                </button>

            </div>

        </div>

    </div>

</div>