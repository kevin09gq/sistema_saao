<!-- Modal para reasignar empleados a otros departamentos -->
<div class="modal fade" id="modalReasignarDepartamento" tabindex="-1" aria-labelledby="modalReasignarLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="modalReasignarLabel">
                    <i class="bi bi-arrow-left-right"></i> Reasignar Empleados entre Departamentos
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <div class="mb-3">
                    <label class="form-label">Selecciona el departamento destino:</label>
                    <select class="form-select" id="selectDepartamentoDestino">
                        <option value="">-- Seleccionar departamento --</option>
                    </select>
                </div>
                
                <div class="mb-3">
                    <label class="form-label">Empleados a mover:</label>
                    <div id="listaEmpleadosParaMover" class="border rounded p-3" style="max-height: 300px; overflow-y: auto;">
                        <p class="text-muted">Selecciona empleados de la lista de abajo</p>
                    </div>
                </div>
                
                <hr>
                
                <h6>Departamentos y Empleados:</h6>
                <div id="estructuraDepartamentos" style="max-height: 300px; overflow-y: auto;">
                    <!-- Aquí se cargarán dinámicamente los departamentos y empleados -->
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                    <i class="bi bi-x-circle"></i> Cancelar
                </button>
                <button type="button" class="btn btn-primary" id="btnGuardarReasignacion">
                    <i class="bi bi-save"></i> Guardar Cambios
                </button>
            </div>
        </div>
    </div>
</div>