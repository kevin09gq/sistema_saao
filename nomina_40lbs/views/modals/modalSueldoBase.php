<!-- Modal para Sueldo Base -->
<div class="modal fade" id="modalSueldoBase" tabindex="-1" aria-labelledby="modalSueldoBaseLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="modalSueldoBaseLabel">Actualizar Sueldo Base</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <div class="mb-3">
                    <input type="text" class="form-control" id="buscar-empleado-sueldo-base" placeholder="Buscar empleado...">
                </div>
                <div class="mb-3 d-flex gap-2">
                    <button type="button" class="btn btn-sm btn-outline-primary" id="btn-seleccionar-todos-sueldo">Seleccionar todos</button>
                    <button type="button" class="btn btn-sm btn-outline-secondary" id="btn-deseleccionar-todos-sueldo">Deseleccionar todos</button>
                </div>
                <div class="list-group" id="lista-empleados-sueldo-base" style="max-height: 400px; overflow-y: auto;">
                    <!-- Se poblará dinámicamente -->
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                <button type="button" class="btn btn-danger" id="btn-quitar-sueldo-base">Quitar sueldo base</button>
                <button type="button" class="btn btn-primary" id="btn-procesar-sueldo-base">Establecer sueldo base</button>
            </div>
        </div>
    </div>
</div>
