<!--  MODAL - REGISTRO DE CLIENTES  -->
<div class="modal fade" id="modalRegistroClientes" tabindex="-1" aria-labelledby="modalRegistroClientesLabel" aria-hidden="true">

    <div class="modal-dialog modal-xl modal-dialog-scrollable">

        <div class="modal-content">

            <!-- Encabezado -->
            <div class="modal-header bg-success text-white">

                <h5 class="modal-title" id="modalRegistroClientesLabel">

                    <i class="bi bi-people me-2"></i>

                    Ver Clientes

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

                <!-- HISTORIAL DE CLIENTES -->
                <div class="card">

                    <div class="card-header bg-success text-white">

                        <strong>

                            <i class="bi bi-clock-history me-2"></i>

                            Historial de Clientes

                        </strong>

                    </div>

                    <div class="card-body p-0">

                        <div class="table-responsive">

                            <table class="table table-hover table-bordered align-middle mb-0">

                                <thead class="table-light">

                                    <tr>

                                        <th>#</th>

                                        <th>Cliente</th>

                                        <th>Tarimas</th>

                                        <th>Cantidad de Cajas</th>

                                        <th>Tipo de Caja</th>

                                        <th>Total a Pagar</th>


                                    </tr>

                                </thead>

                                <tbody id="tbody-historial-clientes">

                                </tbody>

                            </table>

                        </div>

                    </div>

                </div>

            </div>

            <!-- PIE -->
            <div class="modal-footer justify-content-between">

                <button
                    type="button"
                    class="btn btn-outline-secondary"
                    data-bs-dismiss="modal">

                    Cerrar

                </button>

            </div>

        </div>

    </div>

</div>