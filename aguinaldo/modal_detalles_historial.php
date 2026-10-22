<!-- Modal Detalles de Aguinaldo -->
<div class="modal fade" id="modal_detalles_aguinaldo" tabindex="-1" aria-labelledby="modal_detalles_label" aria-hidden="true">
    <div class="modal-dialog modal-fullscreen modal-dialog-scrollable">
        <div class="modal-content">

            <!-- Encabezado -->
            <div class="modal-header">
                <h5 class="modal-title" id="modal_detalles_label">
                    <i class="bi bi-info-circle me-2"></i>Detalles del Aguinaldo — <span id="span_anio_detalle" class="fw-bold ms-1">2024</span> <span id="span_departamento_detalle" class="badge bg-primary-subtle text-primary ms-2">TMP</span>
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>

            <!-- Cuerpo del Modal -->
            <div class="modal-body p-4">

                <input type="text" id="empleados" hidden>

                <!-- Sección de Filtros -->
                <div class="toolbar-card mb-4">
                    <div class="row g-3 align-items-end">
                        <!-- Búsqueda -->
                        <div class="col-md-4">
                            <label for="busqueda_detalles" class="form-label">Buscar empleado</label>
                            <div class="input-group">
                                <span class="input-group-text"><i class="bi bi-search"></i></span>
                                <input type="text" id="busqueda_detalles" class="form-control" placeholder="Nombre o clave...">
                            </div>
                        </div>

                        <!-- Departamento -->
                        <div class="col-md-3">
                            <label for="id_departamento" class="form-label">Departamento</label>
                            <select id="id_departamento" class="form-select" disabled>
                                <option value="-1">Todos los departamentos</option>
                            </select>
                        </div>

                        <!-- Empresa -->
                        <div class="col-md-3">
                            <label for="id_empresa" class="form-label">Empresa</label>
                            <select id="id_empresa" class="form-select">
                                <option value="-1">Todas las empresas</option>
                            </select>
                        </div>

                        <!-- Mostrar registros -->
                        <div class="col-md-2">
                            <label for="limite" class="form-label">Mostrar</label>
                            <select id="limite" class="form-select">
                                <option value="15" selected>15 registros</option>
                                <option value="25">25 registros</option>
                                <option value="50">50 registros</option>
                                <option value="100">100 registros</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Tabla de Detalles -->
                <div class="card border-0 shadow-sm">
                    <div class="table-responsive">
                        <table class="table table-hover align-middle mb-0">
                            <thead>
                                <tr>
                                    <th class="text-center">N°</th>
                                    <th class="text-center">CLAVE</th>
                                    <th>NOMBRE</th>
                                    <th class="text-center">EMPRESA</th>
                                    <th class="text-center">NSS</th>
                                    <th class="text-center">SUELDO DIARIO</th>
                                    <th class="text-center">DÍAS TRAB.</th>
                                    <th class="text-center">MESES TRAB.</th>
                                    <th class="text-center">AGUINALDO</th>
                                    <th class="text-center">ISR</th>
                                    <th class="text-center">DISPERSIÓN TARJETA</th>
                                    <th class="text-center">NETO PAGAR</th>
                                    <th class="text-center">REDONDEO</th>
                                    <th class="text-center">TOTAL REDONDEADO</th>
                                </tr>
                            </thead>
                            <tbody class="text-center" id="cuerpo_tabla_detalles_aguinaldo">
                                <!-- Se llena dinámicamente -->
                            </tbody>
                        </table>
                    </div>

                    <!-- Paginación -->
                    <div class="card-footer bg-white py-3">
                        <nav aria-label="Page navigation" id="contenedor-paginacion-detalles">
                            <ul class="pagination justify-content-center" id="paginacion_detalles">
                                <!-- Se llena dinámicamente -->
                            </ul>
                        </nav>
                    </div>
                </div>

            </div>

            <!-- Pie del Modal -->
            <div class="modal-footer bg-white d-flex justify-content-between">
                <div class="small text-muted">
                    Total de colaboradores en vista: <span class="fw-bold text-dark" id="total_registros_modal">0</span>
                </div>
                <div>
                    <button type="button" class="btn btn-success me-2" id="btn_descargar_excel_filtrado">
                        <i class="bi bi-file-earmark-excel-fill me-1"></i>Descargar Excel
                    </button>
                    <button type="button" class="btn btn-outline-secondary px-4" data-bs-dismiss="modal">
                        <i class="bi bi-x-circle me-1"></i>Cerrar
                    </button>
                </div>
            </div>

        </div>
    </div>
</div>