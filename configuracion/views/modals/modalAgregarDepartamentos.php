<!-- ==========================================================================
     MODAL: AGREGAR NUEVO DEPARTAMENTO
     Descripción: Modal para crear un nuevo departamento en el sistema
     Campos del formulario:
       - nombre_departamento (obligatorio): Nombre del departamento
       - areas (opcional): Áreas a las que pertenece el departamento (multiple)
     ========================================================================== -->
<div class="modal fade" id="modalAgregarDepartamento" tabindex="-1" aria-labelledby="modalAgregarDepartamentoLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <!-- Encabezado del modal -->
            <div class="modal-header">
                <h5 class="modal-title" id="modalAgregarDepartamentoLabel">
                    <i class="bi bi-diagram-2 me-2" style="color: var(--primary-green);"></i>
                    Nuevo departamento
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <!-- Cuerpo del modal con formulario -->
            <div class="modal-body">
                <form id="formAgregarDepartamento">
                    <div class="row g-3">
                        <!-- Nombre del departamento (obligatorio) -->
                        <div class="col-12">
                            <label class="form-label" for="agregarNombreDepartamento">Nombre del departamento</label>
                            <input type="text" class="form-control" id="agregarNombreDepartamento" name="nombre_departamento" required placeholder="Ingresa el nombre del departamento">
                        </div>
                        <!-- Áreas (opcional, selección múltiple) -->
                        <div class="col-12">
                            <label class="form-label" for="agregarAreasDepartamento">Áreas asignadas</label>
                            <select class="form-select" id="agregarAreasDepartamento" name="areas[]" multiple>
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
                <button type="button" class="btn btn-success" id="btnGuardarDepartamento">
                    <i class="bi bi-save2"></i> Guardar
                </button>
            </div>
        </div>
    </div>
</div>
