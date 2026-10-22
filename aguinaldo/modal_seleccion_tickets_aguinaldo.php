<!-- Modal para selección de empleados para tickets - Aguinaldo -->
<style>
    #modal_seleccion_tickets_aguinaldo .empleado-item-aguinaldo {
        cursor: pointer;
        transition: all 0.2s ease;
        border-left: 4px solid transparent;
        padding: 0.65rem 1rem;
        border-bottom: 1px solid var(--border-color);
    }
    #modal_seleccion_tickets_aguinaldo .empleado-item-aguinaldo:hover {
        background-color: var(--hover-green);
        border-left-color: var(--soft-green);
    }
    #modal_seleccion_tickets_aguinaldo .empleado-item-aguinaldo.active {
        background-color: var(--light-green);
        border-left-color: var(--primary-green);
        font-weight: 500;
    }
</style>

<div class="modal fade" id="modal_seleccion_tickets_aguinaldo" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">
                    <i class="bi bi-person-check me-2"></i> Seleccionar Colaboradores para Tickets
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div class="modal-body p-4">
                <div class="mb-3">
                    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                        <div class="d-flex gap-2">
                            <button type="button" class="btn btn-sm btn-outline-success" id="btn_seleccionar_todos_tickets">
                                <i class="bi bi-check2-all me-1"></i> Seleccionar Visibles
                            </button>
                            <button type="button" class="btn btn-sm btn-outline-secondary" id="btn_deseleccionar_todos_tickets">
                                <i class="bi bi-x-square me-1"></i> Deseleccionar Todos
                            </button>
                        </div>
                        <div class="btn-group btn-group-sm shadow-sm" role="group" id="grupo_filtro_seguro_ticket">
                            <button type="button" class="btn btn-outline-primary active btn-filtro-seguro" data-filtro="todos">
                                <i class="bi bi-people me-1"></i> Todos
                            </button>
                            <button type="button" class="btn btn-outline-success btn-filtro-seguro" data-filtro="con_seguro">
                                <i class="bi bi-shield-check me-1"></i> Con Seguro
                            </button>
                            <button type="button" class="btn btn-outline-warning text-dark btn-filtro-seguro" data-filtro="sin_seguro">
                                <i class="bi bi-shield-exclamation me-1"></i> Sin Seguro
                            </button>
                        </div>
                    </div>
                    <div class="input-group">
                        <span class="input-group-text"><i class="bi bi-search"></i></span>
                        <input type="text" class="form-control" id="buscar_empleado_ticket" placeholder="Buscar por nombre o clave...">
                    </div>
                </div>
                
                <div class="card border-0 shadow-sm">
                    <div class="empleados-container" style="max-height: 380px; overflow-y: auto;">
                        <div id="lista_empleados_tickets">
                            <!-- Carga dinámica -->
                        </div>
                    </div>
                </div>
                
                <div class="mt-3 d-flex align-items-center justify-content-between">
                    <div class="badge bg-success-subtle text-success">
                        <span id="contador_seleccionados">0</span> seleccionados
                    </div>
                </div>
            </div>
            <div class="modal-footer bg-white d-flex justify-content-end gap-2">
                <button type="button" class="btn btn-outline-secondary px-4" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-success px-4" id="btn_generar_tickets_seleccionados">
                    <i class="bi bi-download me-1"></i> Generar Tickets (<span id="contador_seleccionados_btn">0</span>)
                </button>
            </div>
        </div>
    </div>
</div>
