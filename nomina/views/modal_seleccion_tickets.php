<!-- Modal para selección de empleados para tickets -->
<div class="modal fade" id="modal_seleccion_tickets" tabindex="-1" aria-labelledby="modal_seleccion_tickets_label" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="modal_seleccion_tickets_label">
                    <i class="bi bi-person-check"></i> Seleccionar Empleados para Tickets
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <div class="mb-3">
                    <div class="d-flex gap-2 mb-3">
                        <button type="button" class="btn btn-sm btn-outline-primary" id="btn_seleccionar_todos_tickets">
                            <i class="bi bi-check2-all"></i> Seleccionar Todos
                        </button>
                        <button type="button" class="btn btn-sm btn-outline-secondary" id="btn_deseleccionar_todos_tickets">
                            <i class="bi bi-x-square"></i> Deseleccionar Todos
                        </button>
                    </div>
                    <div class="input-clearable-wrapper mb-3">
                        <span class="input-group-text">
                            <i class="bi bi-search"></i>
                        </span>
                        <input type="text" class="form-control" id="buscar_empleado_ticket" placeholder="Buscar empleado..." autocomplete="off">
                        <button class="btn-clear-x" type="button" id="limpiar_busqueda_ticket" tabindex="-1" style="display:none;" aria-label="Limpiar búsqueda">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                </div>
                
                <div class="empleados-container" style="max-height: 400px; overflow-y: auto;">
                    <div id="lista_empleados_tickets">
                        <!-- Los empleados se cargarán aquí dinámicamente -->
                    </div>
                </div>
                
                <div class="mt-3">
                    <div class="badge bg-info">
                        <span id="contador_seleccionados">0</span> empleados seleccionados
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-primary" id="btn_generar_tickets_seleccionados">
                    <i class="bi bi-download"></i> Generar Tickets (<span id="contador_seleccionados_btn">0</span>)
                </button>
            </div>
        </div>
    </div>
</div>

