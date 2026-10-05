<!-- Modal de Configuración para Generar Excel de Asistencia -->
<div class="modal fade" id="modalConfigExcel" tabindex="-1" aria-labelledby="modalConfigExcelLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content border-0 shadow-lg rounded-4">
            <div class="modal-header border-0 pb-0" style="background: #f8fafc; border-top-left-radius: 1rem; border-top-right-radius: 1rem;">
                <div class="d-flex align-items-center gap-2">
                    <div class="p-2 rounded-3 text-white" style="background: var(--accent-green);">
                        <i class="bi bi-file-earmark-spreadsheet-fill fs-5"></i>
                    </div>
                    <div>
                        <h5 class="modal-title fw-bold text-dark mb-0" id="modalConfigExcelLabel">Configurar Lista de Asistencia</h5>
                        <small class="text-muted">Personaliza las fechas, semana y días para la plantilla Excel</small>
                    </div>
                </div>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>

            <form id="formGenerarExcel" method="POST" action="../php/generarExcel.php" target="_blank">
                <!-- Campo oculto con los IDs seleccionados en JSON -->
                <input type="hidden" name="empleados_ids" id="hiddenEmpleadosIds">
                <!-- Campo oculto con las fechas de los días seleccionados en JSON -->
                <input type="hidden" name="dias_fechas" id="hiddenDiasFechas">

                <div class="modal-body px-4 py-3">
                    <div class="row g-3">
                        <!-- Fechas y Rango -->
                        <div class="col-md-6">
                            <label class="form-label fw-semibold text-secondary small mb-1">Fecha Inicio</label>
                            <input type="date" class="form-control" id="cfgFechaInicio" name="fecha_inicio" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label fw-semibold text-secondary small mb-1">Fecha Fin</label>
                            <input type="date" class="form-control" id="cfgFechaFin" name="fecha_fin" required>
                        </div>

                        <!-- Texto encabezado Semana -->
                        <div class="col-md-8">
                            <label class="form-label fw-semibold text-secondary small mb-1">Texto Encabezado de Semana</label>
                            <input type="text" class="form-control" id="cfgTextoSemana" name="texto_semana" 
                                   placeholder="SEMANA DEL 05 AL 11 DE SEPTIEMBRE DEL 2026" required>
                            <small class="text-muted" style="font-size: 0.75rem;">Se autogenera con las fechas pero puedes editarlo libremente.</small>
                        </div>

                        <!-- Número de Semana -->
                        <div class="col-md-4">
                            <label class="form-label fw-semibold text-secondary small mb-1">Número de Semana</label>
                            <div class="input-group">
                                <span class="input-group-text fw-bold bg-light text-secondary">SEM</span>
                                <input type="number" min="1" max="53" class="form-control" id="cfgNumSemana" name="num_semana" 
                                       placeholder="36" required>
                            </div>
                        </div>

                        <!-- Departamento y Empresa -->
                        <div class="col-md-6">
                            <label class="form-label fw-semibold text-secondary small mb-1">Departamento (Aparece en esquina sup. izq.)</label>
                            <input type="text" class="form-control" id="cfgDepartamento" name="departamento" 
                                   placeholder="departamento">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label fw-semibold text-secondary small mb-1">Empresa / Título Secundario</label>
                            <input type="text" class="form-control" id="cfgEmpresa" name="empresa" 
                                   value="CITRICOS SAAO" placeholder="CITRICOS SAAO">
                        </div>

                        <!-- Selección de Días de la Semana -->
                        <div class="col-12 mt-3">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <label class="form-label fw-semibold text-secondary small mb-0">Días a incluir en la plantilla</label>
                                <!-- Presets rápidos -->
                                <div class="btn-group btn-group-sm" role="group">
                                    <button type="button" class="btn btn-outline-secondary btn-sm py-0" id="btnPresetVieDom">Vie - Dom</button>
                                    <button type="button" class="btn btn-outline-secondary btn-sm py-0" id="btnPresetLunVie">Lun - Vie</button>
                                    <button type="button" class="btn btn-outline-secondary btn-sm py-0" id="btnPresetLunSab">Lun - Sáb</button>
                                    <button type="button" class="btn btn-outline-secondary btn-sm py-0" id="btnPresetTodos">Todos</button>
                                </div>
                            </div>

                            <div class="p-3 bg-light rounded-3 border d-flex flex-wrap gap-3 justify-content-between" id="contenedorDias">
                                <!-- Los días se generarán dinámicamente según el rango de fechas -->
                                <div class="text-muted small w-100 text-center">
                                    Selecciona las fechas para ver los días disponibles
                                </div>
                            </div>
                            <small class="text-muted" style="font-size: 0.75rem;">Los días se ordenan cronológicamente según la fecha de inicio. Cada día generará sus 4 columnas: ENTRADA, COMIDA (Sale / Entra) y SALIDA.</small>
                        </div>
                    </div>
                </div>

                <div class="modal-footer border-0 pt-0 px-4 pb-4 d-flex justify-content-between">
                    <button type="button" class="btn btn-light px-3" data-bs-dismiss="modal">Cancelar</button>
                    <div class="d-flex gap-2">
                        <button type="button" id="btnPrevisualizarExcel" class="btn btn-outline-primary px-3 fw-semibold d-flex align-items-center gap-1">
                            <i class="bi bi-eye-fill"></i> Previsualizar
                        </button>
                        <button type="button" id="btnDescargarExcelConfig" class="btn text-white px-4 fw-semibold d-flex align-items-center gap-1" style="background: var(--accent-green);">
                            <i class="bi bi-file-earmark-arrow-down-fill"></i> Descargar Excel
                        </button>
                    </div>
                </div>
            </form>
        </div>
    </div>
</div>
