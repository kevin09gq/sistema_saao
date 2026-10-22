<!-- Modal -->
<div class="modal fade" id="modal_configuracion" tabindex="-1" aria-labelledby="modalConfiguracionLabel" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
    <div class="modal-dialog modal-dialog-scrollable modal-dialog-centered modal-xl">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="modalConfiguracionLabel">
                    <i class="bi bi-wrench-adjustable me-2"></i> Configuración de Raya e Incidencias
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div class="modal-body p-4">

                <!-- Cuerpo para subir archivos -->
                <div class="card border-0 bg-white shadow-sm" id="cuerpo_form_subir_archivos">
                    <div class="card-header bg-white py-3">
                        <div class="d-flex align-items-center">
                            <div class="module-icon me-3" style="width: 44px; height: 44px; font-size: 1.25rem;">
                                <i class="bi bi-cloud-arrow-up"></i>
                            </div>
                            <div>
                                <h6 class="mb-0 fw-bold text-dark">Panel de Importación de Listas de Raya</h6>
                                <small class="text-muted">Formatos admitidos: <span class="badge bg-light text-dark border">.xlsx</span> / <span class="badge bg-light text-dark border">.xls</span></small>
                            </div>
                        </div>
                    </div>

                    <div class="card-body p-4">
                        <form method="post" id="form_subir_archivos_raya" enctype="multipart/form-data">

                            <div class="mb-4">
                                <h6 class="text-uppercase text-secondary fw-bold small mb-3">
                                    <i class="bi bi-cash-stack me-2 text-success"></i>Listas de Raya (Nóminas)
                                </h6>
                                <div class="row g-3">
                                    <div class="col-md-6">
                                        <div class="p-3 border rounded-3 bg-light h-100">
                                            <label for="archivo_lista_raya" class="form-label d-flex align-items-center fw-semibold text-dark">
                                                <i class="bi bi-file-earmark-spreadsheet me-2 text-success"></i>
                                                Periodo extraordinario Cítricos SAAO
                                            </label>
                                            <p class="text-muted mb-2 small">Cargar montos principales de SAAO.</p>
                                            <input accept=".xls, .xlsx" class="form-control form-control-sm" type="file" id="archivo_lista_raya" name="archivo_lista_raya">
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="p-3 border rounded-3 bg-light h-100">
                                            <label for="archivo_lista_raya_sb" class="form-label d-flex align-items-center fw-semibold text-dark">
                                                <i class="bi bi-file-earmark-spreadsheet me-2 text-success"></i>
                                                Periodo extraordinario SB CITRIC'S
                                            </label>
                                            <p class="text-muted mb-2 small">Cargar montos principales de SB.</p>
                                            <input accept=".xls, .xlsx" class="form-control form-control-sm" type="file" id="archivo_lista_raya_sb" name="archivo_lista_raya_sb">
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="mb-4">
                                <h6 class="text-uppercase text-secondary fw-bold small mb-3">
                                    <i class="bi bi-person-x-fill me-2 text-danger"></i>Reportes de Ausencias
                                </h6>
                                <div class="row g-3">
                                    <div class="col-md-6">
                                        <div class="p-3 border rounded-3 bg-light h-100">
                                            <label for="archivo_ausencias" class="form-label d-flex align-items-center fw-semibold text-dark">
                                                <i class="bi bi-calendar-x me-2 text-danger"></i>
                                                Ausencias en Lista de Raya Cítricos SAAO
                                            </label>
                                            <p class="text-muted mb-2 small">Incidencias y faltas para SAAO.</p>
                                            <input accept=".xls, .xlsx" class="form-control form-control-sm" type="file" id="archivo_ausencias" name="archivo_ausencias">
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="p-3 border rounded-3 bg-light h-100">
                                            <label for="archivo_ausencias_sb" class="form-label d-flex align-items-center fw-semibold text-dark">
                                                <i class="bi bi-calendar-x me-2 text-danger"></i>
                                                Ausencias en Lista de Raya SB CITRIC'S
                                            </label>
                                            <p class="text-muted mb-2 small">Incidencias y faltas para SB.</p>
                                            <input accept=".xls, .xlsx" class="form-control form-control-sm" type="file" id="archivo_ausencias_sb" name="archivo_ausencias_sb">
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <hr class="my-4 text-secondary opacity-25">

                            <div class="d-flex justify-content-end gap-2">
                                <button type="reset" class="btn btn-outline-secondary px-4">
                                    <i class="bi bi-arrow-counterclockwise me-1"></i>Reiniciar
                                </button>
                                <button type="submit" class="btn btn-success px-4">
                                    <i class="bi bi-gear-fill me-1"></i>Procesar Información
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Cuerpo para configurar fechas y ausencias -->
                <div class="card border-0 bg-white shadow-sm d-none" id="cuerpo_tabla_configuracion">
                    <div class="card-body p-3">
                        <form method="post" id="form_tabla_configuracion" enctype="multipart/form-data">

                            <div class="table-responsive">
                                <table class="table table-hover align-middle mb-0">
                                    <thead>
                                        <tr>
                                            <th></th>
                                            <th></th>
                                            <th></th>
                                            <th class="text-center">Fecha Real</th>
                                            <th class="text-center">Fecha IMSS</th>
                                            <th class="text-center">Ausencias</th>
                                            <th class="text-center">Fecha Pago</th>
                                        </tr>
                                        <tr>
                                            <th>CLV</th>
                                            <th>COLABORADOR</th>
                                            <th>NSS</th>
                                            <th class="text-center">
                                                <button
                                                    id="btn_seleccionar_todas_real"
                                                    class="btn btn-sm btn-outline-success"
                                                    title="Seleccionar todas las Fechas Reales"
                                                    type="button"><i class="bi bi-check2-circle"></i> Todo</button>
                                            </th>
                                            <th class="text-center">
                                                <button
                                                    id="btn_seleccionar_todas_imss"
                                                    class="btn btn-sm btn-outline-success"
                                                    title="Seleccionar todas las Fechas IMSS"
                                                    type="button"><i class="bi bi-check2-circle"></i> Todo</button>
                                            </th>
                                            <th class="text-center">
                                                <div class="btn-group btn-group-sm">
                                                    <button
                                                        id="btn_seleccionar_todas_ausencias"
                                                        class="btn btn-outline-success"
                                                        title="Seleccionar todas las ausencias"
                                                        type="button">Poner</button>
                                                    <button
                                                        id="btn_quitar_todas_ausencias"
                                                        class="btn btn-outline-danger"
                                                        title="Quitar todas las ausencias"
                                                        type="button">Quitar</button>
                                                </div>
                                            </th>
                                            <th>
                                                <div class="input-group input-group-sm">
                                                    <input
                                                        type="date"
                                                        class="form-control"
                                                        id="fecha_pago_masiva">
                                                    <button
                                                        title="Copiar fecha de pago a todos los empleados"
                                                        class="btn btn-outline-secondary"
                                                        type="button"
                                                        id="btn_copiar_fecha_pago"><i class="bi bi-copy"></i></button>
                                                </div>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody id="tabla_configuracion_cuerpo">
                                        <!-- Se llena mediante el js -->
                                    </tbody>
                                </table>
                            </div>

                            <!-- Elemento para rastrear la página actual -->
                            <div id="pagina_actual_configuracion" data-pagina="1" style="display:none;"></div>

                            <!-- Paginación -->
                            <div class="py-3">
                                <nav aria-label="Page navigation" id="contenedor_paginacion_configuracion">
                                    <ul class="pagination justify-content-center" id="paginacion_configuracion">
                                        <!-- Se genera dinámicamente -->
                                    </ul>
                                </nav>
                            </div>

                            <!-- Botón de envío -->
                            <div class="d-flex justify-content-between align-items-center pt-3 border-top">
                                <!-- Lado Izquierdo: Select -->
                                <div style="min-width: 250px;">
                                    <select id="departamento_configuracion" class="form-select">
                                        <option value="-1">Todos los departamentos</option>
                                    </select>
                                </div>

                                <!-- Lado Derecho: Botones -->
                                <div class="d-flex gap-2">
                                    <button type="button" class="btn btn-outline-secondary" id="btn_volver_cargar_configuracion">
                                        <i class="bi bi-arrow-clockwise me-1"></i>Volver a cargar
                                    </button>
                                    <button type="submit" class="btn btn-success">
                                        <i class="bi bi-check-lg me-1"></i>Guardar cambios
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

            </div>
        </div>
    </div>
</div>