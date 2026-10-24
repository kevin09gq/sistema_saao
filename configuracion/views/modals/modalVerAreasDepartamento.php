<!-- ==========================================================================
     MODAL: VER ÁREAS ASIGNADAS A DEPARTAMENTO
     Descripción: Modal para visualizar las áreas asignadas a un departamento
     ========================================================================== -->
<div class="modal fade" id="modalVerAreasDepartamento" tabindex="-1" aria-labelledby="modalVerAreasDepartamentoLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <!-- Encabezado del modal -->
            <div class="modal-header">
                <h5 class="modal-title" id="modalVerAreasDepartamentoLabel">
                    <i class="bi bi-diagram-3 me-2" style="color: var(--primary-green);"></i>
                    Áreas asignadas
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <!-- Cuerpo del modal -->
            <div class="modal-body">
                <div class="alert" style="background-color: var(--light-green); border-color: var(--soft-green); color: var(--primary-green);">
                    <i class="bi bi-info-circle me-2"></i>
                    <strong id="nombreDepartamentoInfo"></strong>
                </div>
                
                <div class="table-responsive">
                    <table class="table table-hover align-middle config-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Logo</th>
                                <th>Nombre del área</th>
                                <th>Color de fondo</th>
                                <th>Color de texto</th>
                            </tr>
                        </thead>
                        <tbody id="tablaAreasAsignadas">
                        </tbody>
                    </table>
                </div>
                
                <div id="sinAreasMensaje" class="empty-state" style="display: none;">
                    <i class="bi bi-inbox"></i>
                    <p>Este departamento no tiene áreas asignadas</p>
                </div>
            </div>
            <!-- Pie del modal -->
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                    <i class="bi bi-x-lg me-1"></i> Cerrar
                </button>
            </div>
        </div>
    </div>
</div>
