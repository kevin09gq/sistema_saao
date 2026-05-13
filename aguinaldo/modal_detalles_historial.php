<!-- Modal Detalles de Aguinaldo -->
<div class="modal fade" id="modal_detalles_aguinaldo" tabindex="-1" aria-labelledby="modal_detalles_label" aria-hidden="true">
    <div class="modal-dialog modal-fullscreen modal-dialog-scrollable">
        <div class="modal-content">

            <!-- Encabezado -->
            <div class="modal-header bg-light">
                <h5 class="modal-title fw-bold" id="modal_detalles_label">
                    <i class="bi bi-info-circle-fill text-primary me-2"></i>Detalles del Aguinaldo - <span id="span_anio_detalle">2024</span>
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>

            <!-- Cuerpo del Modal -->
            <div class="modal-body">

                <input type="text" id="empleados" hidden>

                <!-- Sección de Filtros -->
                <div class="row g-3 mb-4 align-items-end">
                    <!-- Búsqueda -->
                    <div class="col-3">
                        <label for="busqueda_detalles" class="form-label small fw-bold text-muted">Buscar empleado</label>
                        <div class="input-group input-group-sm shadow-sm">
                            <span class="input-group-text bg-white"><i class="bi bi-search"></i></span>
                            <input type="text" id="busqueda_detalles" class="form-control" placeholder="Nombre o clave...">
                        </div>
                    </div>

                    <!-- Departamento -->
                    <div class="col-auto">
                        <label for="id_departamento" class="form-label small fw-bold text-muted">Departamento</label>
                        <select id="id_departamento" class="form-select form-select-sm shadow-sm">
                            <option value="-1">Todos los departamentos</option>
                        </select>
                    </div>

                    <!-- Empresa -->
                    <div class="col-auto">
                        <label for="id_empresa" class="form-label small fw-bold text-muted">Empresa</label>
                        <select id="id_empresa" class="form-select form-select-sm shadow-sm">
                            <option value="-1">Todas las empresas</option>
                        </select>
                    </div>

                    <!-- Mostrar registros -->
                    <div class="col-auto">
                        <label for="limite" class="form-label small fw-bold text-muted">Mostrar</label>
                        <select id="limite" class="form-select form-select-sm shadow-sm">
                            <option value="15" selected>15</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                    </div>
                </div>

                <!-- Tabla de Detalles -->
                <div class="table-responsive">
                    <table class="table table-sm table-hover align-middle border">
                        <thead class="table-light">
                            <tr>
                                <th class="text-center fs-6">N°</th>
                                <th class="text-center fs-6">CLAVE</th>
                                <th class="text-center fs-6">NOMBRE</th>
                                <th class="text-center fs-6">EMPRESA</th>
                                <th class="text-center fs-6">NSS</th>
                                <th class="text-center fs-6" width="100">SUELDO DIARIO</th>
                                <th class="text-center fs-6" width="100">DIAS TRABAJADOS</th>
                                <th class="text-center fs-6" width="100">MESES TRABAJADOS</th>
                                <th class="text-center fs-6">AGUINALDO</th>
                                <th class="text-center fs-6">ISR</th>
                                <th class="text-center fs-6" width="120">DISPERSION TARJETA</th>
                                <th class="text-center fs-6">NETO PAGAR</th>
                                <th class="text-center fs-6">REDONDEO</th>
                                <th class="text-center fs-6" width="100">NETO PAGAR REDONDEADO</th>
                            </tr>
                        </thead>
                        <tbody id="cuerpo_tabla_detalles_aguinaldo">
                            <!-- Se llena dinámicamente -->
                        </tbody>
                    </table>
                </div>

                <!-- Paginación -->
                <nav aria-label="Page navigation" id="contenedor-paginacion-detalles">
                    <ul class="pagination justify-content-center my-3" id="paginacion_detalles">
                        <!-- Se genera dinámicamente -->
                    </ul>
                </nav>
            </div>

            <!-- Pie del Modal -->
            <div class="modal-footer bg-light d-flex justify-content-between">
                <div class="small text-muted">
                    Total de registros encontrados: <span class="fw-bold" id="total_registros_modal">0</span>
                </div>
                <button type="button" class="btn btn-outline-secondary px-4 text-uppercase" data-bs-dismiss="modal"><i class="bi bi-x-circle me-1"></i>Cerrar</button>
            </div>

        </div>
    </div>
</div>