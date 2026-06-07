    <!-- Modal para configurar Días de Vacaciones por Versión -->
    <div class="modal fade" id="modal_dias_lft" tabindex="-1" aria-labelledby="modal_dias_lft_label" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-scrollable">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="modal_dias_lft_label">Configurar Días: <span id="nombre_version_dias" class="badge bg-primary"></span></h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form id="form_dias_lft" class="mb-4 bg-light p-3 rounded border">
                        <input type="hidden" id="id_version_dias" name="id_version_vacaciones">
                        <div class="row g-2 align-items-end">
                            <div class="col-md-3">
                                <label class="form-label small">Año Inicio</label>
                                <input type="number" class="form-control" name="anios_antiguedad_inicio" required min="1">
                            </div>
                            <div class="col-md-3">
                                <label class="form-label small">Año Fin</label>
                                <input type="number" class="form-control" name="anios_antiguedad_fin" min="1" placeholder="Igual al inicio">
                            </div>
                            <div class="col-md-3">
                                <label class="form-label small">Días Vacaciones</label>
                                <input type="number" class="form-control" name="dias_vacaciones_correspondientes" required min="1">
                            </div>
                            <div class="col-md-3">
                                <button type="submit" class="btn btn-success w-100"><i class="bi bi-plus-circle"></i> Agregar</button>
                            </div>
                        </div>
                    </form>
                    <div class="table-responsive">
                        <table class="table table-sm table-striped">
                            <thead>
                                <tr>
                                    <th>Rango de Años</th>
                                    <th>Días</th>
                                    <th>Acción</th>
                                </tr>
                            </thead>
                            <tbody id="tbody_dias_lft"></tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>