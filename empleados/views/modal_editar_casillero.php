<!-- Modal para editar casillero -->
<div class="modal fade" id="modalEditarCasillero" tabindex="-1" aria-labelledby="modalEditarCasilleroLabel" aria-hidden="true" style="z-index: 1061;">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header bg-primary text-white">
                <h5 class="modal-title" id="modalEditarCasilleroLabel">
                    <i class="bi bi-pencil-square"></i> Editar Casillero
                </h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <!-- Contenedor para mostrar información del empleado asignado -->
                <div id="infoEmpleadoAsignado" class="mb-3"></div>
                
                <!-- Pestañas -->
                <ul class="nav nav-tabs mb-3" id="casilleroTabs" role="tablist">
                    <li class="nav-item" role="presentation">
                        <button class="nav-link active" id="editar-tab" data-bs-toggle="tab" data-bs-target="#editar" type="button" role="tab" aria-controls="editar" aria-selected="true">
                            <i class="bi bi-pencil-square"></i> Editar
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="asignar-tab" data-bs-toggle="tab" data-bs-target="#asignar" type="button" role="tab" aria-controls="asignar" aria-selected="false">
                            <i class="bi bi-person-plus"></i> Asignar Empleado
                        </button>
                    </li>
                </ul>

                <!-- Contenido de las pestañas -->
                <div class="tab-content" id="casilleroTabsContent">
                    <!-- Pestaña Editar -->
                    <div class="tab-pane fade show active" id="editar" role="tabpanel" aria-labelledby="editar-tab">
                        <form id="formEditarCasillero">
                            <input type="hidden" id="casillero_id" name="casillero_id">
                            <div class="mb-3">
                                <label for="nuevo_numero" class="form-label">Nuevo Número de Casillero</label>
                                <input type="text" class="form-control" id="nuevo_numero" name="nuevo_numero" required>
                                <div class="form-text">Ingrese el nuevo número para este casillero.</div>
                            </div>
                        </form>
                    </div>

                    <!-- Pestaña Asignar Empleado -->
                    <div class="tab-pane fade" id="asignar" role="tabpanel" aria-labelledby="asignar-tab">
                        <div class="mb-3 position-relative">
                            <label for="buscarEmpleado" class="form-label">Buscar Empleado</label>
                            <div class="input-group">
                                <input type="text" class="form-control pe-5" id="buscarEmpleado" placeholder="Nombre o ID del empleado">
                                <button class="btn btn-outline-primary" type="button" id="btnBuscarEmpleado">
                                    <i class="bi bi-search"></i> Buscar
                                </button>
                            </div>
                            <button class="btn btn-link p-0 position-absolute" type="button" id="btnLimpiarBusquedaEmpleado" title="Limpiar búsqueda" style="right: 115px; top: 40px;">
                                <i class="bi bi-x-circle-fill text-secondary"></i>
                            </button>
                            <div class="form-text">Escriba el nombre o ID del empleado y presione Buscar</div>
                        </div>
                        
                        <div id="resultadoBusqueda" class="mt-3">
                            <div class="text-center text-muted">
                                <i class="bi bi-person-lines-fill fs-1"></i>
                                <p class="mt-2">Busque un empleado para asignar al casillero</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-danger" id="btnEliminarCasillero">
                    <i class="bi bi-trash"></i> Eliminar
                </button>
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                    <i class="bi bi-x-circle"></i> Cancelar
                </button>
                <button type="button" class="btn btn-primary" id="btnGuardarCambios">
                    <i class="bi bi-save"></i> Guardar Cambios
                </button>
            </div>
        </div>
    </div>
</div>