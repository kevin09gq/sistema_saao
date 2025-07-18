<!-- Modal de Selección de Empleados -->
<div class="modal fade" id="modalSeleccionEmpleados" tabindex="-1" aria-labelledby="modalSeleccionEmpleadosLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="modalSeleccionEmpleadosLabel">
                    <i class="bi bi-people-fill me-2"></i>
                    Seleccionar Empleados
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <!-- Filtros -->
                <div class="filtros-modal">
                    <div class="filtro-departamento-container">
                        <label for="filtro-departamento-modal" class="form-label">Departamento</label>
                        <select class="form-select filtro-departamento-modal" id="filtro-departamento-modal">
                           
                        </select>
                    </div>

                    <div class="busqueda-modal-container">
                        <label for="busqueda-modal" class="form-label">Buscar empleado</label>
                        <div class="input-group">
                            <span class="input-group-text">
                                <i class="bi bi-search"></i>
                            </span>
                            <input type="text" class="form-control" id="busqueda-modal" placeholder="Nombre del empleado...">
                        </div>
                    </div>
                </div>

                <!-- Lista de empleados -->
                <div class="empleados-lista-container">
                    <div class="empleados-header">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="seleccionar-todos">
                            <label class="form-check-label fw-bold" for="seleccionar-todos">
                                Seleccionar todos
                            </label>
                        </div>
                        <span class="badge bg-primary empleados-count">0 empleados</span>
                    </div>

                    <div class="empleados-lista" id="empleados-lista">

                        <!-- Departamento: Producción 40 Libras -->
                        <div class="departamento-grupo" data-departamento="produccion-40">
                            <h6 class="departamento-titulo">Producción 40 Libras</h6>
                            <div class="empleados-departamento">
                                <div class="empleado-item">
                                    <div class="form-check">
                                        <input class="form-check-input empleado-checkbox" type="checkbox" value="1" id="emp-1">
                                        <label class="form-check-label" for="emp-1">
                                            <div class="empleado-info">
                                                <span class="empleado-nombre">ABUNDIO SANTOS ALICIA</span>
                                                <span class="empleado-clave">Clave: 001</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-primary" id="btn-confirmar-seleccion">
                    <i class="bi bi-check-circle me-1"></i>
                    Confirmar Selección (<span id="contador-seleccionados">0</span>)
                </button>
            </div>
        </div>
    </div>
</div>