<div class="modal fade" id="modalBiometricos" tabindex="-1" aria-labelledby="modalBiometricosLabel" aria-hidden="true" data-bs-focus="false" style="z-index: 1071;">
    <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content">
            <div class="modal-header bg-primary text-white">
                <h5 class="modal-title" id="modalBiometricosLabel">
                    <i class="bi bi-fingerprint me-2"></i>Consultar Biométricos
                </h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div class="modal-body">
                <div class="row g-3 align-items-end mb-3">
                    <div class="col-md-6">
                        <label for="filtroAreaBiometrico" class="form-label">Área</label>
                        <select class="form-select" id="filtroAreaBiometrico">
                            <option value="">Todas las áreas</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label for="buscarNumeroBiometrico" class="form-label">Número biométrico</label>
                        <input type="number" class="form-control" id="buscarNumeroBiometrico" min="0" placeholder="Buscar biométrico">
                    </div>
                </div>

                <div class="table-responsive">
                    <table class="table table-hover align-middle">
                        <thead class="table-light">
                            <tr>
                                <th>Biométrico</th>
                                <th>Empleado</th>
                                <th>Clave</th>
                            </tr>
                        </thead>
                        <tbody id="tablaBiometricosCuerpo">
                            <tr>
                                <td colspan="3" class="text-center text-muted py-4">Sin resultados para mostrar.</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="modal-footer d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div class="small text-muted" id="infoPaginacionBiometricos">Mostrando 0 registros</div>
                <nav aria-label="Paginación de biométricos">
                    <ul class="pagination pagination-sm mb-0 flex-wrap" id="paginacionBiometricos"></ul>
                </nav>
            </div>
        </div>
    </div>
</div>
