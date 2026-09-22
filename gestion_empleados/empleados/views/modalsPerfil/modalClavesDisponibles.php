<!-- Modal Claves Disponibles -->
<div
    class="modal fade"
    id="modalClavesDisponibles"
    tabindex="-1"
    aria-labelledby="modalClavesDisponiblesLabel"
    aria-hidden="true">

    <div class="modal-dialog modal-xl modal-dialog-scrollable">

        <div class="modal-content">

            <!-- ========================================= -->
            <!-- ENCABEZADO -->
            <!-- ========================================= -->

            <div class="modal-header">

                <h5 class="modal-title" id="modalClavesDisponiblesLabel">
                    <i class="bi bi-key-fill me-2"></i>
                    Control y disponibilidad de claves
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

            <div class="modal-body">

                <!-- ========================================= -->
                <!-- FILTROS Y BÚSQUEDA -->
                <!-- ========================================= -->

                <div class="card border-0 bg-light mb-4">

                    <div class="card-body">

                        <div class="row g-3 align-items-end">

                            <!-- Campo de búsqueda -->
                            <div class="col-md-5">

                                <label
                                    for="inputBuscarClave"
                                    class="form-label fw-semibold">
                                    Buscar Clave o Empleado
                                </label>

                                <div class="input-group">

                                    <span class="input-group-text bg-white">
                                        <i class="bi bi-search text-muted"></i>
                                    </span>

                                    <input
                                        type="search"
                                        class="form-control"
                                        id="inputBuscarClave"
                                        placeholder="Buscar por clave o nombre de empleado...">

                                    <button
                                        type="button"
                                        class="btn btn-outline-secondary"
                                        id="btnLimpiarBuscarClave"
                                        title="Limpiar búsqueda">
                                        <i class="bi bi-x-lg"></i>
                                    </button>

                                </div>

                            </div>


                            <!-- Filtro por Empresa -->
                            <div class="col-md-4">

                                <label
                                    for="selectFiltroEmpresaClave"
                                    class="form-label fw-semibold">
                                    Filtrar por Empresa
                                </label>

                                <select class="form-select" id="selectFiltroEmpresaClave">
                                    <option value="todas">Todas las empresas</option>
                                </select>

                            </div>


                            <!-- Filtro por Estado -->
                            <div class="col-md-3">

                                <label
                                    for="selectFiltroEstadoClave"
                                    class="form-label fw-semibold">
                                    Filtrar por Estado
                                </label>

                                <select class="form-select" id="selectFiltroEstadoClave">
                                    <option value="todos">Todos los estados</option>
                                    <option value="disponibles">Disponibles</option>
                                    <option value="ocupadas">Ocupadas</option>
                                </select>

                            </div>


                            <!-- Filtro por Tipo de Clave -->
                            <div class="col-md-3">

                                <label
                                    for="selectFiltroTipoClave"
                                    class="form-label fw-semibold">
                                    Filtrar por Tipo
                                </label>

                                <select class="form-select" id="selectFiltroTipoClave">
                                    <option value="todos">Todos los tipos</option>
                                    <option value="numericas">Numéricas (001)</option>
                                    <option value="ss">SS (SS/001)</option>
                                </select>

                            </div>

                        </div>

                    </div>

                </div>


                <!-- ========================================= -->
                <!-- TABLA DE CLAVES -->
                <!-- ========================================= -->

                <div class="card border-0 shadow-sm">

                    <div class="table-responsive">

                        <table class="table table-hover align-middle mb-0">

                            <thead class="table-success">

                                <tr>

                                    <th class="text-center" style="width: 140px;">
                                        Clave
                                    </th>

                                    <th>
                                        Asignación por Empresa / Empleado
                                    </th>

                                    <th class="text-center" style="width: 140px;">
                                        Acción
                                    </th>

                                </tr>

                            </thead>


                            <tbody id="tbodyClavesDisponibles">

                                <tr>
                                    <td colspan="3" class="text-center text-muted py-4">
                                        <div class="spinner-border spinner-border-sm text-success me-2" role="status"></div>
                                        Cargando claves...
                                    </td>
                                </tr>

                            </tbody>

                        </table>

                    </div>


                    <!-- ========================================= -->
                    <!-- PAGINACIÓN -->
                    <!-- ========================================= -->

                    <div class="card-footer bg-white">

                        <div class="d-flex justify-content-between align-items-center flex-wrap gap-2">

                            <small class="text-muted" id="infoPaginacionClaves">
                                Mostrando 0 claves
                            </small>

                            <nav>
                                <ul id="paginacionClaves" class="pagination pagination-sm mb-0">
                                </ul>
                            </nav>

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
                    <i class="bi bi-x-lg me-1"></i>
                    Cerrar
                </button>

            </div>

        </div>

    </div>

</div>
