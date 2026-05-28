<!-- Modal para selección de empleados para tickets -->
<style>
    .empleado-item {
        cursor: pointer;
        transition: all 0.2s;
        border: 1px solid #eee;
        border-radius: 8px;
        margin-bottom: 8px;
        padding: 10px;
    }
    .empleado-item:hover {
        background-color: #f8f9fa;
        border-color: #dee2e6;
    }
    .empleado-item.active {
        background-color: #e7f1ff;
        border-color: #0d6efd;
    }
    .btn-clear-inside {
        position: absolute;
        right: 10px;
        background: none;
        border: none;
        color: #adb5bd;
        z-index: 5;
    }
    .btn-clear-inside:hover {
        color: #6c757d;
    }
</style>

<div class="modal fade" id="modal_seleccion_tickets_ptu" tabindex="-1" aria-labelledby="modal_seleccion_tickets_label" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content border-0 shadow-lg">
            <div class="modal-header bg-primary text-white py-3">
                <h5 class="modal-title d-flex align-items-center" id="modal_seleccion_tickets_label">
                    <i class="bi bi-person-check fs-4 me-2"></i>
                    Seleccionar Empleados para Tickets
                </h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body p-4 bg-light">
                <div class="mb-3">
                    <div class="row g-3">
                        <div class="col-md-6">
                            <small class="text-muted fw-bold d-block mb-2">Filtros de Seguro:</small>
                            <div class="btn-group w-100 shadow-sm" role="group">
                                <button type="button" class="btn btn-sm btn-outline-primary active" id="btn_seleccionar_todos_tickets_ptu">
                                    <i class="bi bi-people"></i> Todos
                                </button>
                                <button type="button" class="btn btn-sm btn-outline-success" id="btn_seleccionar_con_seguro_tickets_ptu">
                                    <i class="bi bi-shield-check"></i> Con Seguro
                                </button>
                                <button type="button" class="btn btn-sm btn-outline-warning text-dark" id="btn_seleccionar_sin_seguro_tickets_ptu">
                                    <i class="bi bi-shield-exclamation"></i> Sin Seguro
                                </button>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <small class="text-muted fw-bold d-block mb-2">Acciones de Selección:</small>
                            <div class="btn-group w-100 shadow-sm" role="group">
                                <button type="button" class="btn btn-sm btn-outline-info" id="btn_marcar_visibles_tickets_ptu">
                                    <i class="bi bi-check-all"></i> Visibles
                                </button>
                                <button type="button" class="btn btn-sm btn-outline-secondary" id="btn_deseleccionar_todos_tickets_ptu">
                                    <i class="bi bi-x-square"></i> Ninguno
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mb-4">
                    <div class="position-relative d-flex align-items-center">
                        <i class="bi bi-search position-absolute text-muted" style="left: 15px; z-index: 5;"></i>
                        <input type="text" class="form-control shadow-sm" id="buscar_empleado_ticket_ptu" placeholder="Buscar por nombre, clave o departamento..." style="padding-left: 40px; border-radius: 10px; height: 45px;">
                        <button class="btn-clear-inside" type="button" id="btn_limpiar_busqueda_ptu" title="Limpiar búsqueda">
                            <i class="bi bi-x-circle-fill"></i>
                        </button>
                    </div>
                </div>
                
                <div class="bg-white rounded-3 border shadow-sm p-2">
                    <div class="list-group list-group-flush" id="lista_empleados_tickets_ptu" style="max-height: 350px; overflow-y: auto;">
                        <!-- Los empleados se cargarán aquí dinámicamente -->
                    </div>
                </div>
                
                <div class="mt-3 d-flex justify-content-between align-items-center">
                    <div class="badge bg-primary px-3 py-2 rounded-pill">
                        <i class="bi bi-check2-circle me-1"></i>
                        <span id="contador_seleccionados_ptu">0</span> seleccionados
                    </div>
                    <small class="text-muted" id="info_total_empleados_ptu"></small>
                </div>
            </div>
            <div class="modal-footer bg-white border-0 py-3">
                <button type="button" class="btn btn-light fw-bold" data-bs-dismiss="modal">Cerrar</button>
                <button type="button" class="btn btn-outline-info fw-bold shadow-sm" id="btn_generar_tickets_nombre_seleccionados_ptu">
                    <i class="bi bi-person-badge me-2"></i>Descargar Nombre (<span id="contador_seleccionados_btn_nombre_ptu">0</span>)
                </button>
                <button type="button" class="btn btn-primary fw-bold shadow-sm" id="btn_generar_tickets_seleccionados_ptu">
                    <i class="bi bi-ticket-perforated me-2"></i>Descargar Tickets (<span id="contador_seleccionados_btn_ticket_ptu">0</span>)
                </button>
            </div>
        </div>
    </div>
</div>