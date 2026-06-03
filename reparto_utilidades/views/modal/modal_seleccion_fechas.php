<!-- Modal para Selección de Fechas -->
<div class="modal fade" id="modal_seleccion_fechas" tabindex="-1" aria-labelledby="modal_fechas_label" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
    <div class="modal-dialog modal-dialog-scrollable modal-dialog-centered modal-xl">
        <div class="modal-content border-0 shadow-lg">

            <div class="modal-header bg-success text-white">
                <h1 class="modal-title fs-5" id="modal_fechas_label">
                    <i class="bi bi-calendar-check me-2"></i>Selección de Fecha para Cálculo
                </h1>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>

            <div class="modal-body p-4">
                <!-- Filtros y Controles -->
                <div class="bg-light p-3 rounded shadow-sm mb-4">
                    <div class="row g-3 mb-3">
                        <div class="col-md-6">
                            <label class="form-label small fw-bold text-muted">Búsqueda:</label>
                            <input class="form-control form-control-sm" type="text" id="busqueda_empleado_fechas" placeholder="Buscar empleado...">
                        </div>
                        <div class="col-md-6">
                            <label class="form-label small fw-bold text-muted">Departamento:</label>
                            <select class="form-select form-select-sm" id="id_departamento_fecha">
                                <!-- Opciones de departamentos -->
                            </select>
                        </div>
                    </div>

                    <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mt-2">
                        <div class="d-flex gap-2">
                            <button type="button" class="btn btn-sm btn-secondary" id="btn_actualizar_fechas">
                                <i class="bi bi-arrow-repeat me-1"></i>Actualizar fechas
                            </button>
                            <!-- <button type="button" class="btn btn-sm btn-success" id="btn_aplicar_fechas">
                                <i class="bi bi-check-circle me-1"></i>Aplicar Fechas
                            </button> -->
                        </div>
                        <div class="d-flex gap-2">
                            <button type="button" class="btn btn-sm btn-outline-success" id="btn_todos_fecha_real">
                                <i class="bi bi-calendar-event me-1"></i>Fecha real todos
                            </button>
                            <button type="button" class="btn btn-sm btn-outline-primary" id="btn_todos_fecha_imss">
                                <i class="bi bi-shield-check me-1"></i>Fecha IMSS todos
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Tabla de Empleados -->
                <div class="table-responsive">
                    <table class="table table-hover align-middle" id="tabla_seleccion_fechas">
                        <thead class="table-light">
                            <tr>
                                <th class="text-center" style="width: 5%;">#</th>
                                <th class="text-center" style="width: 10%;">Clave</th>
                                <th style="width: 25%;">Empleado</th>
                                <th class="text-center" style="width: 20%;">Fecha Ingreso Real</th>
                                <th class="text-center" style="width: 20%;">Fecha Ingreso IMSS</th>
                                <th class="text-center" style="width: 20%;">Selección</th>
                            </tr>
                        </thead>
                        <tbody id="cuerpo_tabla_fechas">
                            <!-- FILA EJEMPLO 1: CON SEGURO -->
                            <tr>
                                <td class="text-center">1</td>
                                <td class="text-center">900</td>
                                <td>BRANDON HERNANDEZ LOPEZ</td>
                                <td class="text-center">2026-05-11</td>
                                <td class="text-center">2026-05-11</td>
                                <td class="text-center">
                                    <div class="btn-group btn-group-sm" role="group">
                                        <input type="radio" class="btn-check" name="radio_emp_900" id="r1_900" checked>
                                        <label class="btn btn-outline-success" for="r1_900">Real</label>
                                        <input type="radio" class="btn-check" name="radio_emp_900" id="r2_900">
                                        <label class="btn btn-outline-primary" for="r2_900">IMSS</label>
                                    </div>
                                </td>
                            </tr>
                            <!-- FILA EJEMPLO 2: SIN SEGURO -->
                            <tr>
                                <td class="text-center">2</td>
                                <td class="text-center">901</td>
                                <td>MARIA GARCIA PEREZ</td>
                                <td class="text-center">2026-01-15</td>
                                <td class="text-center">—</td>
                                <td class="text-center">
                                    <div class="btn-group btn-group-sm" role="group">
                                        <input type="radio" class="btn-check" name="radio_emp_901" id="r1_901" checked>
                                        <label class="btn btn-outline-success" for="r1_901">Real</label>
                                        <input type="radio" class="btn-check" name="radio_emp_901" id="r2_901" disabled>
                                        <label class="btn btn-outline-secondary" for="r2_901">N/A</label>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="modal-footer border-0 bg-light">
                <button type="button" class="btn btn-outline-secondary px-4" data-bs-dismiss="modal">Cancelar</button>
            </div>
        </div>
    </div>
</div>