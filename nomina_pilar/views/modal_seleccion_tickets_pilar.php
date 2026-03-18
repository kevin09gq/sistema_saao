<!-- Modal para selección de empleados para tickets -->
<link rel="stylesheet" href="../css/modal_seleccion_tickets.css">
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
                    <div class="position-relative w-100" style="display: flex; align-items: center;">
                        <i class="bi bi-search position-absolute text-muted" style="left: 15px; z-index: 5; pointer-events: none;"></i>
                        <input type="text" class="form-control" id="buscar_empleado_ticket" placeholder="Buscar empleado..." style="padding-left: 40px !important; padding-right: 40px !important; border-radius: 8px !important; height: 45px;">
                        <button class="btn-clear-inside" type="button" id="btn_limpiar_busqueda" tabindex="-1" title="Limpiar búsqueda">
                            <i class="bi bi-x-circle-fill"></i>
                        </button>
                    </div>
                </div>
                
                <div class="empleados-container" style="max-height: 400px; overflow-y: auto;">
                    <div class="row" id="lista_empleados_tickets">
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
