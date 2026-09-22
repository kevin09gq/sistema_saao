<!-- MODAL - CAPTURA GENERAL DE CAJAS EMPACADAS -->
<div class="modal fade" id="modalCajasEmpacadas" tabindex="-1" aria-labelledby="modalCajasEmpacadasLabel" aria-hidden="true">

    <div class="modal-dialog modal-fullscreen modal-dialog-scrollable">

        <div class="modal-content">

            <!-- Encabezado -->
            <div class="modal-header bg-success text-white">

                <h5 class="modal-title" id="modalCajasEmpacadasLabel">

                    <i class="bi bi-box-seam me-2"></i>

                    Captura General de Cajas Empacadas

                </h5>

                <button
                    type="button"
                    class="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Cerrar">
                </button>

            </div>

            <!-- CUERPO -->
            <div class="modal-body">

                <!-- BARRA DE HERRAMIENTAS -->
                <div class="row mb-3 align-items-center">

                    <div class="col-md-4">

                        <div class="input-group">

                            

                        </div>

                    </div>

                    <div class="col-md-8 text-end">

                        <span class="fw-bold me-2">TOTAL CAJAS:</span>

                        <span id="totalGeneralCajas" class="fw-bold text-primary">0</span>

                        <span class="fw-bold ms-3 me-2">TOTAL DINERO:</span>

                        <span id="totalGeneralDinero" class="fw-bold text-success">$0.00</span>

                    </div>

                </div>

                <!-- TABLA CONTENEDORA -->
                <div class="table-responsive">

                    <table class="table table-bordered table-hover" id="tablaGeneralCajas">

                        <thead class="table-light">

                            <tr id="headerFilaDias">

                                <th
                                    rowspan="2"
                                    class="text-center"
                                    style="
                                    width: 50px;
                                    min-width: 50px;
                                    position: sticky;
                                    left: 0;
                                    z-index: 5;
                                    background-color: white;
                                ">
                                    #
                                </th>

                                <th
                                    rowspan="2"
                                    class="text-center"
                                    style="
                                    width: 80px;
                                    min-width: 80px;
                                    position: sticky;
                                    left: 50px;
                                    z-index: 5;
                                    background-color: white;
                                ">
                                    Clave
                                </th>

                                <th
                                    rowspan="2"
                                    style="
                                    width: 450px;
                                    min-width: 450px;
                                    position: sticky;
                                    left: 130px;
                                    z-index: 5;
                                    background-color: white;
                                ">
                                    Nombre del Empleado
                                </th>

                            </tr>

                            <tr id="encabezadoDias">
                                <!-- Los tipos de cajas se agregarán dinámicamente aquí -->
                            </tr>

                        </thead>

                        <tbody id="tbodyGeneralCajas">
                            <!-- Los empleados se generarán dinámicamente aquí -->
                        </tbody>

                      

                    </table>

                </div>

            </div>

            <!-- PIE -->
            <div class="modal-footer">

                <button
                    type="button"
                    class="btn btn-secondary"
                    data-bs-dismiss="modal">

                    Cerrar

                </button>

            </div>

        </div>

    </div>

</div>