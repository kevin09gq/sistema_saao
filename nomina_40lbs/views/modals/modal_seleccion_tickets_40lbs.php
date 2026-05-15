<!-- Modal para selección de empleados para tickets -->
<div class="modal fade" id="modal_seleccion_tickets_40lbs" tabindex="-1" aria-labelledby="modal_seleccion_tickets_40lbs_label" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="modal_seleccion_tickets_40lbs_label">
                    <i class="bi bi-person-check"></i> Seleccionar Empleados para Tickets
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <div class="mb-3">
                    <div class="mb-2">
                        <small class="text-muted fw-bold">Filtros:</small>
                        <div class="d-flex gap-2 mt-1">
                            <button type="button" class="btn btn-sm btn-outline-primary active" id="btn_filtro_todos_40lbs">
                                <i class="bi bi-people"></i> Ver Todos
                            </button>
                            <button type="button" class="btn btn-sm btn-outline-success" id="btn_filtro_con_seguro_40lbs">
                                <i class="bi bi-shield-check"></i> Con Seguro
                            </button>
                            <button type="button" class="btn btn-sm btn-outline-warning text-dark" id="btn_filtro_sin_seguro_40lbs">
                                <i class="bi bi-shield-exclamation"></i> Sin Seguro
                            </button>
                        </div>
                    </div>
                    <div class="mb-3">
                        <small class="text-muted fw-bold">Acciones:</small>
                        <div class="d-flex gap-2 mt-1">
                            <button type="button" class="btn btn-sm btn-outline-info" id="btn_marcar_visibles_tickets_40lbs">
                                <i class="bi bi-check-all"></i> Seleccionar Visibles
                            </button>
                            <button type="button" class="btn btn-sm btn-outline-secondary" id="btn_deseleccionar_todos_tickets_40lbs">
                                <i class="bi bi-x-square"></i> Ninguno
                            </button>
                        </div>
                    </div>
                    <div class="input-clearable-wrapper mb-3">
                        <span class="input-group-text">
                            <i class="bi bi-search"></i>
                        </span>
                        <input type="text" class="form-control" id="buscar_empleado_ticket_40lbs" placeholder="Buscar empleado..." autocomplete="off">
                        <button class="btn-clear-x" type="button" id="limpiar_busqueda_ticket_40lbs" tabindex="-1" style="display:none;" aria-label="Limpiar búsqueda">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
                </div>
                
                <div class="empleados-container" style="max-height: 400px; overflow-y: auto;">
                    <div id="lista_empleados_tickets_40lbs">
                        <!-- Los empleados se cargarán aquí dinámicamente -->
                    </div>
                </div>
                
                <div class="mt-3">
                    <div class="badge bg-info">
                        <span id="contador_seleccionados_40lbs">0</span> empleados seleccionados
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-outline-secondary" id="btn_generar_tickets_nombre_seleccionados_40lbs">
                    <i class="bi bi-person-badge"></i> Ticket Nombre (<span id="contador_seleccionados_btn_nombre_40lbs">0</span>)
                </button>
                <button type="button" class="btn btn-primary" id="btn_generar_tickets_seleccionados_40lbs">
                    <i class="bi bi-download"></i> Generar Tickets (<span id="contador_seleccionados_btn_generar_40lbs">0</span>)
                </button>
            </div>
        </div>
    </div>
</div>
