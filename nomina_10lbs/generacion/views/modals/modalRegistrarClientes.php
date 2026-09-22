<!--  MODAL - REGISTRO DE CLIENTES  -->
<div class="modal fade" id="modalRegistroClientes" tabindex="-1" aria-labelledby="modalRegistroClientesLabel" aria-hidden="true">

    <div class="modal-dialog modal-xl modal-dialog-scrollable">

        <div class="modal-content">

            <!-- Encabezado -->
            <div class="modal-header bg-success text-white">

                <h5 class="modal-title" id="modalRegistroClientesLabel">

                    <i class="bi bi-people me-2"></i>

                    Registro de Clientes

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

                <!-- INFORMACIÓN DEL CLIENTE -->
                <div class="card mb-3">

                    <div class="card-header bg-success text-white">

                        <strong>

                            <i class="bi bi-person-plus me-2"></i>

                            Información del Cliente

                        </strong>

                    </div>

                    <div class="card-body">

                        <div class="row">

                            <!-- Nombre del Cliente -->
                            <div class="col-md-6 mb-3">

                                <label
                                    for="inputNombreCliente"
                                    class="form-label fw-bold">

                                    Nombre del Cliente

                                </label>

                                <input
                                    type="text"
                                    class="form-control"
                                    id="inputNombreCliente"
                                    placeholder="Ingrese el nombre del cliente">

                            </div>

                            <!-- Tarimas -->
                            <div class="col-md-2 mb-3">

                                <label
                                    for="inputTarimasCliente"
                                    class="form-label fw-bold">

                                    Tarimas

                                </label>

                                <input
                                    type="number"
                                    class="form-control"
                                    id="inputTarimasCliente"
                                    placeholder="0"
                                    min="0"
                                    step="1">

                            </div>

                            <!-- Cantidad de Cajas -->
                            <div class="col-md-2 mb-3">

                                <label
                                    for="inputCantidadCajasCliente"
                                    class="form-label fw-bold">

                                    Cantidad de Cajas

                                </label>

                                <input
                                    type="number"
                                    class="form-control"
                                    id="inputCantidadCajasCliente"
                                    placeholder="0"
                                    min="0"
                                    step="1">

                            </div>

                            <!-- Tipo de Caja -->
                            <div class="col-md-2 mb-3">

                                <label
                                    for="selectTipoCajaCliente"
                                    class="form-label fw-bold">

                                    Tipo de Caja

                                </label>

                                <select
                                    class="form-select"
                                    id="selectTipoCajaCliente">

                                    <option value="">
                                        Seleccione...
                                    </option>

                                </select>

                            </div>

                            <!-- Total a Pagar -->
                            <div class="col-md-4 mb-3">

                                <label
                                    for="inputTotalPagarCliente"
                                    class="form-label fw-bold">

                                    Total a Pagar ($)

                                </label>

                                <input
                                    type="number"
                                    class="form-control"
                                    id="inputTotalPagarCliente"
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                    readonly>

                            </div>

                        </div>

                    </div>

                </div>

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

                                        <th width="100">Acciones</th>

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

                    Cancelar

                </button>

                <button
                    type="button"
                    class="btn btn-success"
                    id="btnRegistrarCliente">

                    <i class="bi bi-check-circle me-2"></i>

                    Registrar Cliente

                </button>

            </div>

        </div>

    </div>

</div>