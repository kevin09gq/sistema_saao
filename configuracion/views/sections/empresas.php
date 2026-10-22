<!-- ==========================================================================
     SECCIÓN: EMPRESAS
     Descripción: Vista para gestionar el catálogo de empresas del sistema
     Campos: id_empresa, nombre_empresa, logo_empresa, rfc_empresa, domicilio_fiscal
     ========================================================================== -->
<div class="tab-pane fade show active" id="panel-empresa" role="tabpanel" aria-labelledby="empresa-tab">
    <!-- Tarjeta principal de contenido -->
    <div class="card config-content-card">
        <!-- Encabezado de la tarjeta con título y botón de acción -->
        <div class="card-header d-flex justify-content-between align-items-center gap-3">
            <div>
                <h2 class="h5 mb-0 mt-1"><i class="bi bi-building-gear text-success me-2"></i>Empresas</h2>
            </div>
            <!-- Botón para abrir modal de nueva empresa -->
            <button class="btn btn-success btn-sm" data-bs-toggle="modal" data-bs-target="#modalAgregarEmpresa">
                <i class="bi bi-plus-lg"></i> Nueva empresa
            </button>
        </div>
        <!-- Cuerpo de la tarjeta con tabla de empresas -->
        <div class="card-body">
            <div class="table-responsive">
                <table class="table table-hover align-middle config-table">
                    <thead>
                        <tr>
                            <th>Logo</th>
                            <th>Nombre de la empresa</th>
                            <th>RFC</th>
                            <th>Domicilio fiscal</th>
                            <th class="text-end">Acciones</th>
                        </tr>
                    </thead>
                    <!-- Dato estático de ejemplo -->
                    <tbody id="tablaEmpresas">
                      
                    </tbody>
                </table>
            </div>
        </div>
       
    </div>
</div>

