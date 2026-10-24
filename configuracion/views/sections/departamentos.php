<div class="tab-pane fade" id="panel-departamentos" role="tabpanel" aria-labelledby="departamentos-tab">
    <div class="card config-content-card">
        <div class="card-header d-flex justify-content-between align-items-center gap-3">
            <div>
                <span class="section-kicker">Catálogo</span>
                <h2 class="h5 mb-0 mt-1"><i class="bi bi-diagram-2 me-2" style="color: var(--primary-green);"></i>Departamentos</h2>
            </div>
            <button class="btn btn-success btn-sm" data-bs-toggle="modal" data-bs-target="#modalAgregarDepartamento"><i class="bi bi-plus-lg"></i> Nuevo registro</button>
        </div>
        <div class="card-body">
            <!-- Filtro por área -->
            <div class="row mb-3">
                <div class="col-md-4">
                    <label class="form-label small text-muted">Filtrar por área:</label>
                    <select class="form-select form-select-sm" id="filtroAreaDepartamentos">
                        <option value="">Todas las áreas</option>
                    </select>
                </div>
                <div class="col-md-4">
                    <label class="form-label small text-muted">Buscar:</label>
                    <input type="text" class="form-control form-control-sm" id="busquedaDepartamentos" placeholder="Buscar departamento...">
                </div>
            </div>
            <div class="table-responsive">
                <table class="table table-hover align-middle config-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Nombre</th>
                            <th class="text-center">Áreas</th>
                            <th class="text-end">Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="tablaDepartamentos">
                    </tbody>
                </table>
            </div>
            <!-- Paginación -->
            <nav aria-label="Paginación de departamentos" class="mt-3">
                <ul class="pagination justify-content-center" id="paginacionDepartamentos">
                </ul>
            </nav>
        </div>
        <div class="card-footer text-muted small">
            <i class="bi bi-info-circle me-1"></i>
            Mostrando <span id="registrosVisibles">0</span> de <span id="totalRegistros">0</span> registros
        </div>
    </div>
</div>
