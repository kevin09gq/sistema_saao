<div class="tab-pane fade" id="panel-areas" role="tabpanel" aria-labelledby="areas-tab">
    <div class="card config-content-card">
        <div class="card-header d-flex justify-content-between align-items-center gap-3">
            <div>
                <h2 class="h5 mb-0 mt-1"><i class="bi bi-diagram-3 text-success me-2"></i>Áreas</h2>
            </div>
            <button class="btn btn-success btn-sm" data-bs-toggle="modal" data-bs-target="#modalAgregarArea"><i class="bi bi-plus-lg"></i> Nuevo registro</button>
        </div>
        <div class="card-body">
            <div class="table-responsive">
                <table class="table table-hover align-middle config-table">
                    <thead>
                        <tr>
                            <th class="text-center" style="width: 70px;">Logo</th>
                            <th>Nombre</th>
                            <th>Color de fondo</th>
                            <th>Color de texto</th>
                            <th class="text-end">Acciones</th>
                        </tr>
                    </thead>
                    <tbody id="tablaAreas">
                    </tbody>
                </table>
            </div>
        </div>
        <div class="card-footer text-muted small"><i class="bi bi-info-circle me-1"></i><span id="contadorAreas">0</span> registros mostrados</div>
    </div>
</div>
