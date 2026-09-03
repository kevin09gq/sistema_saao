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

                            <span class="input-group-text">
                                <i class="bi bi-search"></i>
                            </span>

                            <input
                                type="text"
                                id="buscarEmpleadoCajas"
                                class="form-control"
                                placeholder="Buscar empleado...">

                        </div>

                    </div>

                    <div class="col-md-4">

                        <div class="d-flex align-items-center gap-2 flex-nowrap">

                            <span class="fw-bold text-nowrap">
                                Agregar Día:
                            </span>

                            <select
                                id="selectAgregarDia"
                                class="form-select">

                                <option value="">Seleccionar...</option>
                                <option value="Lunes">Lunes</option>
                                <option value="Martes">Martes</option>
                                <option value="Miércoles">Miércoles</option>
                                <option value="Jueves">Jueves</option>
                                <option value="Viernes">Viernes</option>
                                <option value="Sábado">Sábado</option>
                                <option value="Domingo">Domingo</option>

                            </select>

                            <button
                                type="button"
                                class="btn btn-primary btn-sm text-nowrap"
                                id="btnAgregarDiaTabla">

                                <i class="bi bi-plus-circle me-1"></i>

                                Agregar

                            </button>

                        </div>

                    </div>

                    <div class="col-md-4 text-end">

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

                        <tfoot class="table-light">

                            <tr id="filaTotales">

                                <td colspan="3" class="text-end fw-bold">TOTALES:</td>

                                <td id="totalesContainer">
                                    <!-- Los totales se calcularán dinámicamente aquí -->
                                </td>

                            </tr>

                        </tfoot>

                    </table>

                </div>

            </div>

            <!-- PIE -->
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
                    id="btnAplicarCajasGeneral">

                    <i class="bi bi-check-circle me-1"></i>

                    Aplicar Cambios

                </button>

            </div>

        </div>

    </div>

</div>