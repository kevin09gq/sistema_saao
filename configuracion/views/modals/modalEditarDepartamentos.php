<!-- ==========================================================================
     MODAL: EDITAR DEPARTAMENTO
     Descripción: Modal para editar los datos de un departamento existente
     ========================================================================== -->
     
<div class="modal fade" id="modalEditarDepartamento" tabindex="-1" aria-labelledby="modalEditarDepartamentoLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <!-- Encabezado del modal -->
            <div class="modal-header">
                <h5 class="modal-title" id="modalEditarDepartamentoLabel">
                    <i class="bi bi-diagram-2 me-2" style="color: var(--primary-green);"></i>
                    Editar departamento
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <!-- Cuerpo del modal con formulario -->
            <div class="modal-body">
                <form id="formEditarDepartamento">
                    <!-- Campo oculto para el ID del departamento -->
                    <input type="hidden" id="editarIdDepartamento" name="id_departamento">
                    <div class="row g-3">
                        <!-- Nombre del departamento (obligatorio) -->
                        <div class="col-12">
                            <label class="form-label" for="editarNombreDepartamento">Nombre del departamento</label>
                            <input type="text" class="form-control" id="editarNombreDepartamento" name="nombre_departamento" required placeholder="Ingresa el nombre del departamento">
                        </div>
                        <!-- Áreas (opcional, selección múltiple) -->
                        <div class="col-12">
                            <label class="form-label" for="editarAreasDepartamento">Áreas asignadas</label>
                            <select class="form-select" id="editarAreasDepartamento" name="areas[]" multiple>
                                <!-- Las áreas se cargarán dinámicamente -->
                            </select>
                            <small class="text-muted">Selecciona una o más áreas (Ctrl+Clic para selección múltiple)</small>
                        </div>
                    </div>
                
                </form>
            </div>
            <!-- Pie del modal con botones de acción -->
            <div class="modal-footer">
                <button type="button" class="btn btn-light" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-success" id="btnActualizarDepartamento">
                    <i class="bi bi-save2"></i> Actualizar
                </button>
            </div>
        </div>
    </div>
</div>
