
<link rel="stylesheet" href="../css/modal_seleccion_tickets.css">

<style>
.btn-clear-inside {
    position: absolute !important;
    right: 12px !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
    width: 28px !important;
    height: 28px !important;
    border: none !important;
    outline: none !important;
    box-shadow: none !important;
    border-radius: 50% !important;
    background: transparent !important;
    color: #8c98a4 !important;
    display: none;
    align-items: center !important;
    justify-content: center !important;
    cursor: pointer !important;
    z-index: 10 !important;
    padding: 0 !important;
    transition: all 0.2s ease !important;
}
.btn-clear-inside:hover {
    background-color: rgba(220, 53, 69, 0.1) !important;
    color: #dc3545 !important;
    transform: translateY(-50%) scale(1.08) !important;
}
.btn-clear-inside i {
    font-size: 1.15rem !important;
    line-height: 1 !important;
    pointer-events: none;
}
</style>

<div class="modal fade" id="modal_seleccion_tickets" tabindex="-1" aria-labelledby="modal_seleccion_tickets_label" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
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
                    <div class="mb-2">
                        <small class="text-muted fw-bold">Filtros:</small>
                        <div class="d-flex flex-wrap gap-2 mt-1 align-items-center">
                            <button type="button" class="btn btn-sm btn-outline-primary active" id="btn_seleccionar_todos_tickets">
                                <i class="bi bi-people"></i> Ver Todos
                            </button>
                            <button type="button" class="btn btn-sm btn-outline-success" id="btn_seleccionar_con_seguro_tickets">
                                <i class="bi bi-shield-check"></i> Con Seguro
                            </button>
                            <button type="button" class="btn btn-sm btn-outline-warning text-dark" id="btn_seleccionar_sin_seguro_tickets">
                                <i class="bi bi-shield-exclamation"></i> Sin Seguro
                            </button>
                            <select class="form-select form-select-sm w-auto" id="filtro_departamento_ticket_confianza">
                                <option value="todos">Todos los departamentos</option>
                            </select>
                        </div>
                    </div>
                    <div class="mb-3">
                        <small class="text-muted fw-bold">Acciones:</small>
                        <div class="d-flex gap-2 mt-1">
                            <button type="button" class="btn btn-sm btn-outline-info" id="btn_marcar_visibles_tickets">
                                <i class="bi bi-check-all"></i> Seleccionar Todos
                            </button>
                            <button type="button" class="btn btn-sm btn-outline-secondary" id="btn_deseleccionar_todos_tickets">
                                <i class="bi bi-x-square"></i> Ninguno
                            </button>
                        </div>
                    </div>
                    <div class="position-relative w-100" style="display: flex; align-items: center;">
                        <i class="bi bi-search position-absolute text-muted" style="left: 15px; z-index: 5; pointer-events: none;"></i>
                        <input type="text" class="form-control" id="buscar_empleado_ticket" placeholder="Buscar empleado..." style="padding-left: 42px !important; padding-right: 42px !important; border-radius: 8px !important; height: 45px;">
                        <button class="btn-clear-inside" type="button" id="btn_limpiar_busqueda" tabindex="-1" title="Limpiar búsqueda" style="display: none; position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: transparent; border: none; outline: none; cursor: pointer; padding: 0; z-index: 10;">
                            <i class="bi bi-x-circle-fill"></i>
                        </button>
                    </div>
                </div>
                
                <div class="empleados-container" style="max-height: 400px; overflow-y: auto; overflow-x: hidden;">
                    <div class="row mx-0" id="lista_empleados_tickets"></div>
                </div>
                
                <div class="mt-3">
                    <div class="badge bg-info">
                        <span id="contador_seleccionados">0</span> empleados seleccionados
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-info" id="btn_generar_tickets_nombre_seleccionados" disabled>
                    <i class="bi bi-person-badge"></i> Ticket Nombre (<span id="contador_seleccionados_btn_nombre">0</span>)
                </button>
                <button type="button" class="btn btn-primary" id="btn_generar_tickets_seleccionados" disabled>
                    <i class="bi bi-download"></i> Generar Tickets (<span id="contador_seleccionados_btn">0</span>)
                </button>
            </div>
        </div>
    </div>
</div>
