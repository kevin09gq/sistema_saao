<!-- Modal Casilleros Disponibles -->
<div
    class="modal fade"
    id="modalCasillerosDisponibles"
    tabindex="-1"
    aria-labelledby="modalCasillerosDisponiblesLabel"
    aria-hidden="true">

    <div class="modal-dialog modal-xl modal-dialog-scrollable">

        <div class="modal-content">

            <!-- ========================================= -->
            <!-- ENCABEZADO -->
            <!-- ========================================= -->

            <div class="modal-header">

                <h5 class="modal-title" id="modalCasillerosDisponiblesLabel">
                    <i class="bi bi-grid-3x3-gap-fill me-2"></i>
                    Casilleros y disponibilidad
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
                            <div class="col-md-7">

                                <label
                                    for="inputBuscarCasillero"
                                    class="form-label fw-semibold">
                                    Buscar Casillero o Empleado
                                </label>

                                <div class="input-group">

                                    <span class="input-group-text bg-white">
                                        <i class="bi bi-search text-muted"></i>
                                    </span>

                                    <input
                                        type="search"
                                        class="form-control"
                                        id="inputBuscarCasillero"
                                        placeholder="Buscar por casillero, nombre de empleado o clave...">

                                    <button
                                        type="button"
                                        class="btn btn-outline-secondary"
                                        id="btnLimpiarBuscarCasillero"
                                        title="Limpiar búsqueda">
                                        <i class="bi bi-x-lg"></i>
                                    </button>

                                </div>

                            </div>


                            <!-- Filtro de estado / Select -->
                            <div class="col-md-5">

                                <label
                                    for="selectFiltroEstadoCasillero"
                                    class="form-label fw-semibold">
                                    Filtrar por estado
                                </label>

                                <select class="form-select" id="selectFiltroEstadoCasillero">
                                    <option value="todos">Todos los casilleros</option>
                                    <option value="disponibles">Casilleros disponibles</option>
                                    <option value="ocupados">Casilleros ocupados</option>
                                </select>

                            </div>

                        </div>

                    </div>

                </div>


                <!-- ========================================= -->
                <!-- TABLA DE CASILLEROS -->
                <!-- ========================================= -->

                <div class="card border-0 shadow-sm">

                    <div class="table-responsive">

                        <table class="table table-hover align-middle mb-0">

                            <thead class="table-success">

                                <tr>

                                    <th class="text-center" style="width: 130px;">
                                        Casillero
                                    </th>

                                    <th class="text-center" style="width: 170px;">
                                        Estado
                                    </th>

                                    <th>
                                        Empleados Asignados
                                    </th>

                                    <th class="text-center" style="width: 140px;">
                                        Acción
                                    </th>

                                </tr>

                            </thead>


                            <tbody id="tbodyCasillerosDisponibles">

                                <tr>
                                    <td colspan="4" class="text-center text-muted py-4">
                                        <div class="spinner-border spinner-border-sm text-success me-2" role="status"></div>
                                        Cargando casilleros...
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

                            <small class="text-muted" id="infoPaginacionCasilleros">
                                Mostrando 0 casilleros
                            </small>

                            <nav>
                                <ul id="paginacionCasilleros" class="pagination pagination-sm mb-0">
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
