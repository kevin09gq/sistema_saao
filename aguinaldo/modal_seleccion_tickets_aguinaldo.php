<!-- Modal para selección de empleados para tickets - Aguinaldo -->
<style>
    #modal_seleccion_tickets_aguinaldo .modal-header {
        background-color: #0d6efd;
        color: white;
    }
    #modal_seleccion_tickets_aguinaldo .btn-close {
        filter: brightness(0) invert(1);
    }
    #modal_seleccion_tickets_aguinaldo .empleado-item-aguinaldo {
        cursor: pointer;
        transition: all 0.2s;
        border-left: 4px solid transparent;
    }
    #modal_seleccion_tickets_aguinaldo .empleado-item-aguinaldo:hover {
        background-color: #f8f9fa;
        border-left-color: #0d6efd;
    }
    #modal_seleccion_tickets_aguinaldo .empleado-item-aguinaldo.active {
        background-color: #e7f1ff;
        border-left-color: #0d6efd;
    }
</style>

<div class="modal fade" id="modal_seleccion_tickets_aguinaldo" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title"><i class="bi bi-person-check"></i> Seleccionar Empleados - Aguinaldo</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
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
                    <div class="position-relative">
                        <input type="text" class="form-control ps-5" id="buscar_empleado_ticket" placeholder="Buscar por nombre o clave...">
                        <i class="bi bi-search position-absolute top-50 translate-middle-y text-muted" style="left: 15px;"></i>
                    </div>
                </div>
                
                <div class="empleados-container border rounded" style="max-height: 400px; overflow-y: auto;">
                    <div id="lista_empleados_tickets">
                        <!-- Carga dinámica -->
                    </div>
                </div>
                
                <div class="mt-3">
                    <div class="badge bg-primary">
                        <span id="contador_seleccionados">0</span> seleccionados
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
