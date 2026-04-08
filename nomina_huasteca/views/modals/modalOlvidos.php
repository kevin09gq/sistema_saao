<div class="modal fade" id="modal-olvidos-masivos" tabindex="-1" aria-labelledby="modalOlvidosLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">
            <div class="modal-header bg-danger text-white">
                <h5 class="modal-title" id="modalOlvidosLabel">
                    <i class="bi bi-clipboard-check"></i> Perdonar Olvidos de Checador
                </h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            
            <div class="modal-body p-0">
                <!-- Selector de Día Fijo -->
                <div class="p-3 bg-light sticky-top border-bottom">
                    <div class="row align-items-center">
                        <div class="col-md-6">
                            <label class="form-label fw-bold small text-muted mb-1">DÍA DE LA SEMANA</label>
                            <select class="form-select border-danger" id="select-dia-olvido-masivo">
                                <option value="Lunes">Lunes</option>
                                <option value="Martes">Martes</option>
                                <option value="Miercoles">Miércoles</option>
                                <option value="Jueves">Jueves</option>
                                <option value="Viernes">Viernes</option>
                                <option value="Sabado">Sábado</option>
                                <option value="Domingo">Domingo</option>
                            </select>
                        </div>
                        <div class="col-md-6 text-end pt-3">
                            <span class="badge bg-danger" id="contador-olvidos-detectados">0 Olvidos detectados</span>
                        </div>
                    </div>
                </div>

                <!-- Lista de Empleados Agrupada -->
                <div id="contenedor-lista-olvidos-masivos" class="p-3" style="min-height: 300px;">
                    <!-- Se carga dinámicamente -->
                    <div class="text-center py-5 text-muted">
                        <i class="bi bi-search d-block mb-2 fs-2"></i>
                        <p>Selecciona un día para detectar olvidos</p>
                    </div>
                </div>
            </div>

            <div class="modal-footer bg-light">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-danger px-4" id="btn-aplicar-perdon-olvidos">
                    <i class="bi bi-check-circle-fill me-1"></i> Perdonar Seleccionados
                </button>
            </div>
        </div>
    </div>
</div>

