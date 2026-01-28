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
                    <div class="position-relative">
                        <div class="input-group">
                            <span class="input-group-text">
                                <i class="bi bi-search"></i>
                            </span>
                            <input type="text" class="form-control pe-5" id="buscar_empleado_ticket" placeholder="Buscar empleado...">
                        </div>
                        <button class="btn-clear-inside" type="button" id="btn_limpiar_busqueda">
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

<style>
.empleado-card {
    border: 1px solid #dee2e6;
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 10px;
    transition: all 0.2s ease;
    cursor: pointer;
}

.empleado-card:hover {
    border-color: #0d6efd;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.empleado-card.selected {
    border-color: #0d6efd;
    background-color: #e7f3ff;
}

.empleado-card .form-check-input {
    pointer-events: none;
}

.departamento-badge {
    font-size: 0.75rem;
    padding: 2px 6px;
}

.departamento-40 {
    background-color: #dc3545;
    color: white;
}

.departamento-10 {
    background-color: #198754;
    color: white;
}

.departamento-sin-seguro {
    background-color: #fd7e14;
    color: white;
}

.departamento-administracion {
    background-color: #0d6efd;
    color: white;
}

.departamento-produccion {
    background-color: #ffc107;
    color: black;
}

.departamento-seguridad {
    background-color: #6f42c1;
    color: white;
}

.empleado-nombre {
    font-weight: 500;
    margin-bottom: 2px;
}

.empleado-clave {
    font-size: 0.9rem;
    color: #6c757d;
}
</style>

<style>
/* Estilos mejorados para el botón de limpieza dentro del input */
.position-relative {
    position: relative;
}

.btn-clear-inside {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    background: transparent;
    border: none;
    color: #adb5bd;
    cursor: pointer;
    padding: 0;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    z-index: 10;
}

.btn-clear-inside:hover {
    color: #6c757d;
    background-color: rgba(0, 0, 0, 0.05);
}

.btn-clear-inside:focus {
    outline: 0;
    box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

.btn-clear-inside i {
    font-size: 1.1rem;
}

/* Añadir padding derecho al input para espacio del botón */
.pe-5 {
    padding-right: 2.5rem !important;
}

/* Ajustar bordes redondeados */
.input-group > :not(:first-child):not(.dropdown-menu):not(.valid-tooltip):not(.valid-feedback):not(.invalid-tooltip):not(.invalid-feedback) {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
}

.input-group:not(.has-validation) > :not(:last-child):not(.dropdown-toggle):not(.dropdown-menu):not(.form-floating) {
    border-top-right-radius: 0.375rem;
    border-bottom-right-radius: 0.375rem;
}
</style>