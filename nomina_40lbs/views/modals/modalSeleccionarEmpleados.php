<!-- Modal Bootstrap para seleccionar empleados a mostrar en la tabla -->
<div class="modal fade" id="modal-seleccionar-empleados" tabindex="-1" aria-labelledby="modalSeleccionarLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="modalSeleccionarLabel">
                    <i class="bi bi-people-fill"></i> Seleccionar Empleados para la Nómina
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            
            <div class="modal-body">
                <!-- Controles superiores -->
                <div class="row mb-3">
                    <div class="col-md-8">
                        <input type="text" id="buscar-empleado-modal" class="form-control" placeholder="Buscar empleado...">
                    </div>
                    <div class="col-md-4 d-flex gap-2">
                        <button type="button" class="btn btn-sm btn-success flex-fill" id="btn-seleccionar-todos">
                            <i class="bi bi-check-all"></i> Todos
                        </button>
                        <button type="button" class="btn btn-sm btn-warning flex-fill" id="btn-deseleccionar-todos">
                            <i class="bi bi-x-circle"></i> Ninguno
                        </button>
                    </div>
                </div>

                <!-- Lista de empleados por departamento -->
                <div id="contenedor-lista-empleados" style="max-height: 400px; overflow-y: auto; border: 1px solid #ddd; border-radius: 4px; padding: 10px;">
                    <!-- Se llenará dinámicamente con JavaScript -->
                </div>

                <!-- Contador -->
                <div class="alert alert-info mt-3 mb-0" role="alert">
                    <strong>Empleados seleccionados:</strong> 
                    <span id="contador-seleccionados">0</span> / <span id="contador-total">0</span>
                </div>
            </div>
            
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-primary" id="btn-aplicar-seleccion">
                    <i class="bi bi-check-lg"></i> Aplicar Selección
                </button>
            </div>
        </div>
    </div>
</div>


