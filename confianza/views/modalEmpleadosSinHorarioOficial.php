
<div class="modal fade" id="modalEmpleadosSinHorarioOficial" tabindex="-1" aria-labelledby="modalEmpleadosSinHorarioOficialLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <div class="modal-content">
            <div class="modal-header bg-warning text-dark">
                <h5 class="modal-title" id="modalEmpleadosSinHorarioOficialLabel">
                    <i class="bi bi-exclamation-triangle-fill me-2"></i>
                    Empleados sin horario oficial
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div class="modal-body">
                <div class="alert alert-info mb-3" role="alert">
                    Se muestran los empleados que no tienen Horarios.
                </div>

                <div id="empleados-sin-horario-count" class="text-muted mb-2"></div>

                <div class="table-responsive">
                    <table class="table table-sm table-striped align-middle mb-0">
                        <thead class="table-light">
                            <tr>
                                <th style="width:44px;" class="text-center">
                                    <input class="form-check-input" type="checkbox" id="chk-select-all-sin-horario" aria-label="Seleccionar todos">
                                </th>
                                <th style="width:120px;">Clave</th>
                                <th>Empleado</th>
                            </tr>
                        </thead>
                        <tbody id="tbody-empleados-sin-horario">
                        </tbody>
                    </table>
                </div>

                <div id="empleados-sin-horario-empty" class="text-center text-muted py-4" style="display:none;">
                    Todos los empleados tienen horario oficial.
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                <button type="button" class="btn btn-primary" id="btn-asignar-horario-seleccionados">
                    <i class="bi bi-check2-square me-1"></i>
                    Asignar horario a seleccionados
                </button>
            </div>
        </div>
    </div>
</div>
