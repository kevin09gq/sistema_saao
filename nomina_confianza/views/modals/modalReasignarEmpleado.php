<!-- Modal para Reasignar Empleado -->
<div class="modal fade" id="modalReasignarEmpleado" tabindex="-1" aria-labelledby="modalReasignarEmpleadoLabel" aria-hidden="true">
    <div class="modal-dialog modal-md">
        <div class="modal-content">
            <div class="modal-header bg-primary text-white">
                <h5 class="modal-title" id="modalReasignarEmpleadoLabel">
                    <i class="bi bi-person-fill-gear"></i> Reasignar Empleado a otro Departamento
                </h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <form id="formReasignarEmpleado">
                    <!-- Selección de Empleado -->
                    <div class="mb-4">
                        <label for="select_empleado_reasignar" class="form-label fw-bold">1. Selecciona el Empleado</label>
                        <select class="form-select" id="select_empleado_reasignar" required>
                            <option value="" disabled selected>Cargando empleados...</option>
                        </select>
                        <div id="info_empleado_actual" class="mt-2 small text-muted" style="display:none;">
                            <strong>Depto Actual:</strong> <span id="depto_actual_nombre"></span><br>
                        </div>
                    </div>

                    <!-- Selección de Departamento Destino -->
                    <div class="mb-3">
                        <label for="select_depto_destino" class="form-label fw-bold">2. Selecciona el Departamento Destino</label>
                        <select class="form-select" id="select_depto_destino" required>
                            <option value="" disabled selected>Selecciona un departamento</option>
                        </select>
                      
                    </div>

                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-primary" id="btn_confirmar_reasignacion">
                    <i class="bi bi-check-circle"></i> Confirmar Reasignación
                </button>
            </div>
        </div>
    </div>
</div>