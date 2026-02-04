<div class="modal-detalles" id="modal-detalles" style="display:none;">
    <div class="modal-detalles-content">
        <span class="modal-detalles-close" id="cerrar-modal-detalles">&times;</span>

        <!-- Tab control del modal -->
        <ul class="nav nav-tabs mb-3" id="modalTabs" role="tablist">
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="tab-info" data-bs-toggle="tab" data-bs-target="#tab_info" type="button" role="tab" aria-controls="tab_info" aria-selected="true">
                    Información
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="tab-registros" data-bs-toggle="tab" data-bs-target="#tab_registros" type="button" role="tab" aria-controls="tab_registros" aria-selected="false">
                    Registros
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="tab-horarios" data-bs-toggle="tab" data-bs-target="#tab_horarios" type="button" role="tab" aria-controls="tab_horarios" aria-selected="false">
                    Horarios
                </button>
            </li>
        </ul>


        <div class="tab-content">

            <!-- Info Trabajador -->
            <div class="tab-pane fade show active" id="tab_info" role="tabpanel" aria-labelledby="tab-info">
                <h5 class="tab-title">📋 Detalles del empleado</h5>

                <!-- Información básica del empleado -->
                <div class="empleado-info">
                    <div class="info-row">
                        <span class="info-label">Clave:</span>
                        <span class="info-value" id="campo-clave"></span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Nombre:</span>
                        <span class="info-value" id="campo-nombre"></span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Departamento:</span>
                        <span class="info-value" id="campo-departamento">DEPA_TEMPORAL</span>
                    </div>

                    <div class="info-row">
                        <span class="info-label">Días trabajados:</span>
                        <span class="info-value" id="campo-dias-trabajados"></span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Ausencias:</span>
                        <span class="info-value" id="campo-ausencias"></span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Vacaciones:</span>
                        <span class="info-value" id="campo-vacaciones"></span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Incapacidades:</span>
                        <span class="info-value" id="campo-incapacidades"></span>
                    </div>
                </div>

            </div>

            <!-- Registros -->
            <div class="tab-pane fade" id="tab_registros" role="tabpanel" aria-labelledby="tab-registros">

                <h5 class="tab-title">⏱️ Registros del empleado</h5>

                <div class="text-center mb-3">
                    <button class="btn btn-sm btn-outline-primary" type="button" id="btn-registros-procesados">Ver procesados</button>
                    <button class="btn btn-sm btn-outline-secondary" type="button" id="btn-registros-originales">Ver originales</button>
                </div>
                <!-- Aquí se mostrarán los registros_procesados del empleado -->

                <div class="table-responsive">
                    <!-- Registros procesados -->
                    <table class="table table-bordered table-hover" id="tabla-registros-procesados">
                        <thead>
                            <tr class="table-success">
                                <th>Día</th>
                                <th>Fecha</th>
                                <th>Entrada</th>
                                <th>Salida</th>
                                <th>Total</th>
                                <th>Act</th>
                            </tr>
                        </thead>
                        <tbody class="table-group-divider" id="table-body-registros-procesados">
                            <!-- se deben llenar con registros_procesados -->
                        </tbody>
                    </table>

                    <!-- Registros originales -->
                    <table class="table table-bordered table-hover" id="tabla-registros-originales">
                        <thead>
                            <tr class="table-secondary">
                                <th>Fecha</th>
                                <th>Entrada</th>
                                <th>Salida</th>
                            </tr>
                        </thead>
                        <tbody id="tabla-cuerpo-registros-originales">
                            <!-- se deben llenar con registros_originales -->
                        </tbody>
                    </table>
                </div>

                <div class="text-center">
                    <button class="btn btn-success" type="button" id="btn-guardar-registros">Guardar Registros</button>
                </div>

            </div>

            <!-- Modificar Horarios -->
            <div class="tab-pane fade" id="tab_horarios" role="tabpanel" aria-labelledby="tab-horarios">
                <h5 class="tab-title">📅Horarios</h5>

                <div class="contenedor-aplicar-horario-variable" hidden>
                    <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" role="switch" id="aplicarHorarioEmpleado" checked>
                        <label class="form-check-label" for="aplicarHorarioEmpleado">Aplicar horario variable general.</label>
                    </div>
                </div>

                <div class="row mb-3 align-items-end mt-2">
                    <div class="col">
                        <label for="input_copiar_entrada" class="form-label mb-0">Entrada</label>
                        <input type="time" class="form-control" id="input_detalles_copiar_entrada">
                    </div>
                    <div class="col">
                        <label for="input_copiar_salida_comida" class="form-label mb-0">Salida Comida</label>
                        <input type="time" class="form-control" id="input_detalles_copiar_salida_comida">
                    </div>
                    <div class="col">
                        <label for="input_copiar_entrada_comida" class="form-label mb-0">Entrada Comida</label>
                        <input type="time" class="form-control" id="input_detalles_copiar_entrada_comida">
                    </div>
                    <div class="col">
                        <label for="input_copiar_salida" class="form-label mb-0">Salida</label>
                        <input type="time" class="form-control" id="input_detalles_copiar_salida">
                    </div>
                    <div class="col-auto">
                        <button type="button" class="btn btn-outline-primary" id="btn-copiar-horario-detalles">Copiar</button>
                    </div>
                </div>

                <div class="table-responsive">
                    <table class="table table-bordered table-hover">
                        <thead class="table-success">
                            <tr>
                                <th>Día</th>
                                <th>Entrada</th>
                                <th>Salida Comida</th>
                                <th>Entrada Comida</th>
                                <th>Salida</th>
                            </tr>
                        </thead>
                        <tbody class="table-group-divider" id="table-body-horarios">
                            <!-- se deben llenar con horarios -->
                        </tbody>
                    </table>
                </div>

                <div class="text-center">
                    <button class="btn btn-success" type="button" id="btn-guardar-horarios">Guardar Horarios</button>
                </div>
            </div>

        </div>

        <div class="modal-detalles-footer d-flex justify-content-between align-items-center">
            <div class="empleado-actual">
                <span class="badge bg-verde-empleado" id="nombre-empleado-modal"></span>
            </div>
            <div>
                <button type="button" id="btn-cancelar-detalles" class="btn btn-secondary">Cancelar</button>
            </div>
        </div>

    </div>
</div>