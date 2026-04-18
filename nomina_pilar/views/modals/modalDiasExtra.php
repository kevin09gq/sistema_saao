<div class="modal fade" id="modal-dias-extra" tabindex="-1" aria-labelledby="modalDiasExtraLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">
            <div class="modal-header bg-primary text-white">
                <h5 class="modal-title" id="modalDiasExtraLabel">
                    <i class="bi bi-calendar-plus me-2"></i> Agregar Día Extra (Jornaleros)
                </h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body p-0">
                <!-- Filtros: Búsqueda y Día de la semana -->
                <div class="row g-2 mb-3 bg-white sticky-top p-3 border-bottom shadow-sm">
                    <div class="col-md-7">
                        <div class="input-group">
                            <span class="input-group-text bg-light text-muted border-end-0">
                                <i class="bi bi-search"></i>
                            </span>
                            <input type="text" id="busqueda-empleados-extra" class="form-control border-start-0" placeholder="Buscar por nombre o clave...">
                        </div>
                    </div>
                    <div class="col-md-5">
                        <div class="input-group">
                            <span class="input-group-text bg-light text-muted border-end-0">
                                <i class="bi bi-calendar-event"></i>
                            </span>
                            <select id="select-dia-semana-extra" class="form-select border-start-0">
                                <option value="Lunes" selected>Lunes</option>
                                <option value="Martes">Martes</option>
                                <option value="Miércoles">Miércoles</option>
                                <option value="Jueves">Jueves</option>
                                <option value="Viernes">Viernes</option>
                                <option value="Sábado">Sábado</option>
                                <option value="Domingo">Domingo</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Contenedor con scroll para la tabla -->
                <div style="max-height: 400px; overflow-y: auto;">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="table-light sticky-top" style="top: -1px; z-index: 10;">
                            <tr>
                                <th style="width: 50px;" class="ps-3">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="check-all-extra">
                                    </div>
                                </th>
                                <th>Clave</th>
                                <th>Nombre</th>
                                <th class="text-center pe-3">Días Actuales</th>
                            </tr>
                        </thead>
                        <tbody id="tbody-empleados-extra">
                            <!-- Los jornaleros se cargarán aquí -->
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-warning text-dark" id="btn-quitar-dia-extra">
                    <i class="bi bi-dash-circle me-1"></i> Quitar (-1 Día)
                </button>
                <button type="button" class="btn btn-primary" id="btn-aplicar-dia-extra">
                    <i class="bi bi-check-circle me-1"></i> Aplicar (+1 Día)
                </button>
            </div>
        </div>
    </div>
</div>
