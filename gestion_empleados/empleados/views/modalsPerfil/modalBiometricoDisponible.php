<!-- Modal Biométrico Disponible -->
<div
    class="modal fade"
    id="modalBiometricoDisponible"
    tabindex="-1"
    aria-labelledby="modalBiometricoDisponibleLabel"
    aria-hidden="true">

    <div class="modal-dialog modal-xl modal-dialog-scrollable">

        <div class="modal-content">

            <!-- ========================================= -->
            <!-- ENCABEZADO -->
            <!-- ========================================= -->

            <div class="modal-header">

                <h5 class="modal-title" id="modalBiometricoDisponibleLabel">
                    <i class="bi bi-fingerprint me-2"></i>
                    Control y disponibilidad de biométricos
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
                                    for="inputBuscarBiometrico"
                                    class="form-label fw-semibold">
                                    Buscar Biométrico o Empleado
                                </label>

                                <div class="input-group">

                                    <span class="input-group-text bg-white">
                                        <i class="bi bi-search text-muted"></i>
                                    </span>

                                    <input
                                        type="search"
                                        class="form-control"
                                        id="inputBuscarBiometrico"
                                        placeholder="Buscar por biométrico, nombre o clave...">

                                    <button
                                        type="button"
                                        class="btn btn-outline-secondary"
                                        id="btnLimpiarBuscarBiometrico"
                                        title="Limpiar búsqueda">
                                        <i class="bi bi-x-lg"></i>
                                    </button>

                                </div>

                            </div>


                            <!-- Filtro por Área -->
                            <div class="col-md-4">

                                <label
                                    for="selectFiltroAreaBiometrico"
                                    class="form-label fw-semibold">
                                    Filtrar por Área
                                </label>

                                <select class="form-select" id="selectFiltroAreaBiometrico">
                                    <option value="todas">Todas las áreas</option>
                                </select>

                            </div>


                            <!-- Filtro por Estado -->
                            <div class="col-md-3">

                                <label
                                    for="selectFiltroEstadoBiometrico"
                                    class="form-label fw-semibold">
                                    Filtrar por Estado
                                </label>

                                <select class="form-select" id="selectFiltroEstadoBiometrico">
                                    <option value="todos">Todos los estados</option>
                                    <option value="disponibles">Disponibles</option>
                                    <option value="ocupados">Ocupados</option>
                                </select>

                            </div>

                        </div>

                    </div>

                </div>


                <!-- ========================================= -->
                <!-- TABLA DE BIOMÉTRICOS -->
                <!-- ========================================= -->

                <div class="card border-0 shadow-sm">

                    <div class="table-responsive">

                        <table class="table table-hover align-middle mb-0">

                            <thead class="table-success">

                                <tr>

                                    <th class="text-center" style="width: 140px;">
                                        Biométrico
                                    </th>

                                    <th>
                                        Asignación por Área / Empleado
                                    </th>

                                    <th class="text-center" style="width: 140px;">
                                        Acción
                                    </th>

                                </tr>

                            </thead>


                            <tbody id="tbodyBiometricosDisponibles">

                                <tr>
                                    <td colspan="3" class="text-center text-muted py-4">
                                        <div class="spinner-border spinner-border-sm text-success me-2" role="status"></div>
                                        Cargando biométricos...
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

                            <small class="text-muted" id="infoPaginacionBiometricos">
                                Mostrando 0 biométricos
                            </small>

                            <nav>
                                <ul id="paginacionBiometricos" class="pagination pagination-sm mb-0">
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
