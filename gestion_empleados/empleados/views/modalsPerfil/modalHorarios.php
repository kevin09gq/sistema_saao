<!-- Modal Horarios -->
<div
    class="modal fade"
    id="modalHorarios"
    tabindex="-1"
    aria-labelledby="modalHorariosLabel"
    aria-hidden="true">

    <div class="modal-dialog modal-xl modal-dialog-scrollable">

        <div class="modal-content">

            <!-- ========================================= -->
            <!-- ENCABEZADO -->
            <!-- ========================================= -->

            <div class="modal-header">
                <h5 class="modal-title" id="modalHorariosLabel">
                    <i class="bi bi-clock me-2"></i>
                    Gestión de Horarios
                </h5>
                <button
                    type="button"
                    class="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Cerrar">
                </button>
            </div>

            <!-- ========================================= -->
            <!-- CUERPO -->
            <!-- ========================================= -->

            <div class="modal-body" id="formHorariosEmpleado">

                <!-- ========================================= -->
                <!-- COPIAR HORARIOS -->
                <!-- ========================================= -->

                <div class="card border-0 bg-light mb-4">

                    <div class="card-body" id="copiarHorariosContainer">

                        <h6 class="fw-bold text-secondary mb-3">
                            <i class="bi bi-copy me-2"></i>
                            Copiar Horarios
                        </h6>

                        <div class="row g-3 align-items-end">

                            <!-- Entrada -->
                            <div class="col-md-3">

                                <label
                                    for="copiarEntrada"
                                    class="form-label fw-semibold">
                                    Entrada
                                </label>

                                <input
                                    type="time"
                                    class="form-control"
                                    id="copiarEntrada"
                                    name="copiar_entrada">

                            </div>

                            <!-- Salida Comida -->
                            <div class="col-md-3">

                                <label
                                    for="copiarSalidaComida"
                                    class="form-label fw-semibold">
                                    Salida Comida
                                </label>

                                <input
                                    type="time"
                                    class="form-control"
                                    id="copiarSalidaComida"
                                    name="copiar_salida_comida">

                            </div>

                            <!-- Entrada Comida -->
                            <div class="col-md-3">

                                <label
                                    for="copiarEntradaComida"
                                    class="form-label fw-semibold">
                                    Entrada Comida
                                </label>

                                <input
                                    type="time"
                                    class="form-control"
                                    id="copiarEntradaComida"
                                    name="copiar_entrada_comida">

                            </div>

                            <!-- Salida -->
                            <div class="col-md-3">

                                <label
                                    for="copiarSalida"
                                    class="form-label fw-semibold">
                                    Salida
                                </label>

                                <div class="input-group">

                                    <input
                                        type="time"
                                        class="form-control"
                                        id="copiarSalida"
                                        name="copiar_salida">

                                    <button
                                        type="button"
                                        class="btn btn-primary"
                                        id="btnCopiarHorarios">
                                        <i class="bi bi-copy"></i>
                                    </button>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

                <!-- ========================================= -->
                <!-- TABLA DE HORARIOS -->
                <!-- ========================================= -->

                <div class="card border-0 bg-light">

                    <div class="card-body">

                        <h6 class="fw-bold text-secondary mb-3">
                            <i class="bi bi-calendar-week me-2"></i>
                            Horarios Semanales
                        </h6>

                        <!-- Tabla -->

                        <div class="table-responsive">

                            <table
                                class="table table-hover align-middle mb-0">

                                <thead class="table-light">

                                    <tr>

                                        <th>
                                            Día
                                        </th>

                                        <th>
                                            Entrada
                                        </th>

                                        <th>
                                            Salida Comida
                                        </th>

                                        <th>
                                            Entrada Comida
                                        </th>

                                        <th>
                                            Salida
                                        </th>

                                        <th class="text-center">
                                            ¿Descanso?
                                        </th>

                                        <th class="text-center">
                                            Acción
                                        </th>

                                    </tr>

                                </thead>

                                <tbody id="tablaHorarios">

                                    <!-- Lunes -->
                                    <tr data-dia="Lunes">

                                        <td class="fw-semibold">
                                            Lunes
                                        </td>

                                        <td>
                                            <input
                                                type="time"
                                                class="form-control form-control-sm"
                                                id="horarioLunes_entrada"
                                                name="horario[Lunes][entrada]">
                                        </td>

                                        <td>
                                            <input
                                                type="time"
                                                class="form-control form-control-sm"
                                                id="horarioLunes_salida_comida"
                                                name="horario[Lunes][salida_comida]">
                                        </td>

                                        <td>
                                            <input
                                                type="time"
                                                class="form-control form-control-sm"
                                                id="horarioLunes_entrada_comida"
                                                name="horario[Lunes][entrada_comida]">
                                        </td>

                                        <td>
                                            <input
                                                type="time"
                                                class="form-control form-control-sm"
                                                id="horarioLunes_salida"
                                                name="horario[Lunes][salida]">
                                        </td>

                                        <td class="text-center">
                                            <div class="form-check form-switch d-flex justify-content-center">
                                                <input
                                                    class="form-check-input"
                                                    type="checkbox"
                                                    id="horarioLunes_descanso"
                                                    name="horario[Lunes][descanso]">
                                            </div>
                                        </td>

                                        <td class="text-center">
                                            <button
                                                type="button"
                                                class="btn btn-outline-danger btn-sm"
                                                onclick="eliminarHorario('Lunes')">
                                                <i class="bi bi-trash3"></i>
                                            </button>
                                        </td>

                                    </tr>

                                    <!-- Martes -->
                                    <tr data-dia="Martes">

                                        <td class="fw-semibold">
                                            Martes
                                        </td>

                                        <td>
                                            <input
                                                type="time"
                                                class="form-control form-control-sm"
                                                id="horarioMartes_entrada"
                                                name="horario[Martes][entrada]">
                                        </td>

                                        <td>
                                            <input
                                                type="time"
                                                class="form-control form-control-sm"
                                                id="horarioMartes_salida_comida"
                                                name="horario[Martes][salida_comida]">
                                        </td>

                                        <td>
                                            <input
                                                type="time"
                                                class="form-control form-control-sm"
                                                id="horarioMartes_entrada_comida"
                                                name="horario[Martes][entrada_comida]">
                                        </td>

                                        <td>
                                            <input
                                                type="time"
                                                class="form-control form-control-sm"
                                                id="horarioMartes_salida"
                                                name="horario[Martes][salida]">
                                        </td>

                                        <td class="text-center">
                                            <div class="form-check form-switch d-flex justify-content-center">
                                                <input
                                                    class="form-check-input"
                                                    type="checkbox"
                                                    id="horarioMartes_descanso"
                                                    name="horario[Martes][descanso]">
                                            </div>
                                        </td>

                                        <td class="text-center">
                                            <button
                                                type="button"
                                                class="btn btn-outline-danger btn-sm"
                                                onclick="eliminarHorario('Martes')">
                                                <i class="bi bi-trash3"></i>
                                            </button>
                                        </td>

                                    </tr>

                                    <!-- Miércoles -->
                                    <tr data-dia="Miércoles">

                                        <td class="fw-semibold">
                                            Miércoles
                                        </td>

                                        <td>
                                            <input
                                                type="time"
                                                class="form-control form-control-sm"
                                                id="horarioMiercoles_entrada"
                                                name="horario[Miercoles][entrada]">
                                        </td>

                                        <td>
                                            <input
                                                type="time"
                                                class="form-control form-control-sm"
                                                id="horarioMiercoles_salida_comida"
                                                name="horario[Miercoles][salida_comida]">
                                        </td>

                                        <td>
                                            <input
                                                type="time"
                                                class="form-control form-control-sm"
                                                id="horarioMiercoles_entrada_comida"
                                                name="horario[Miercoles][entrada_comida]">
                                        </td>

                                        <td>
                                            <input
                                                type="time"
                                                class="form-control form-control-sm"
                                                id="horarioMiercoles_salida"
                                                name="horario[Miercoles][salida]">
                                        </td>

                                        <td class="text-center">
                                            <div class="form-check form-switch d-flex justify-content-center">
                                                <input
                                                    class="form-check-input"
                                                    type="checkbox"
                                                    id="horarioMiercoles_descanso"
                                                    name="horario[Miercoles][descanso]">
                                            </div>
                                        </td>

                                        <td class="text-center">
                                            <button
                                                type="button"
                                                class="btn btn-outline-danger btn-sm"
                                                onclick="eliminarHorario('Miercoles')">
                                                <i class="bi bi-trash3"></i>
                                            </button>
                                        </td>

                                    </tr>

                                    <!-- Jueves -->
                                    <tr data-dia="Jueves">

                                        <td class="fw-semibold">
                                            Jueves
                                        </td>

                                        <td>
                                            <input
                                                type="time"
                                                class="form-control form-control-sm"
                                                id="horarioJueves_entrada"
                                                name="horario[Jueves][entrada]">
                                        </td>

                                        <td>
                                            <input
                                                type="time"
                                                class="form-control form-control-sm"
                                                id="horarioJueves_salida_comida"
                                                name="horario[Jueves][salida_comida]">
                                        </td>

                                        <td>
                                            <input
                                                type="time"
                                                class="form-control form-control-sm"
                                                id="horarioJueves_entrada_comida"
                                                name="horario[Jueves][entrada_comida]">
                                        </td>

                                        <td>
                                            <input
                                                type="time"
                                                class="form-control form-control-sm"
                                                id="horarioJueves_salida"
                                                name="horario[Jueves][salida]">
                                        </td>

                                        <td class="text-center">
                                            <div class="form-check form-switch d-flex justify-content-center">
                                                <input
                                                    class="form-check-input"
                                                    type="checkbox"
                                                    id="horarioJueves_descanso"
                                                    name="horario[Jueves][descanso]">
                                            </div>
                                        </td>

                                        <td class="text-center">
                                            <button
                                                type="button"
                                                class="btn btn-outline-danger btn-sm"
                                                onclick="eliminarHorario('Jueves')">
                                                <i class="bi bi-trash3"></i>
                                            </button>
                                        </td>

                                    </tr>

                                    <!-- Viernes -->
                                    <tr data-dia="Viernes">

                                        <td class="fw-semibold">
                                            Viernes
                                        </td>

                                        <td>
                                            <input
                                                type="time"
                                                class="form-control form-control-sm"
                                                id="horarioViernes_entrada"
                                                name="horario[Viernes][entrada]">
                                        </td>

                                        <td>
                                            <input
                                                type="time"
                                                class="form-control form-control-sm"
                                                id="horarioViernes_salida_comida"
                                                name="horario[Viernes][salida_comida]">
                                        </td>

                                        <td>
                                            <input
                                                type="time"
                                                class="form-control form-control-sm"
                                                id="horarioViernes_entrada_comida"
                                                name="horario[Viernes][entrada_comida]">
                                        </td>

                                        <td>
                                            <input
                                                type="time"
                                                class="form-control form-control-sm"
                                                id="horarioViernes_salida"
                                                name="horario[Viernes][salida]">
                                        </td>

                                        <td class="text-center">
                                            <div class="form-check form-switch d-flex justify-content-center">
                                                <input
                                                    class="form-check-input"
                                                    type="checkbox"
                                                    id="horarioViernes_descanso"
                                                    name="horario[Viernes][descanso]">
                                            </div>
                                        </td>

                                        <td class="text-center">
                                            <button
                                                type="button"
                                                class="btn btn-outline-danger btn-sm"
                                                onclick="eliminarHorario('Viernes')">
                                                <i class="bi bi-trash3"></i>
                                            </button>
                                        </td>

                                    </tr>

                                    <!-- Sábado -->
                                    <tr data-dia="Sábado">

                                        <td class="fw-semibold">
                                            Sábado
                                        </td>

                                        <td>
                                            <input
                                                type="time"
                                                class="form-control form-control-sm"
                                                id="horarioSabado_entrada"
                                                name="horario[Sabado][entrada]">
                                        </td>

                                        <td>
                                            <input
                                                type="time"
                                                class="form-control form-control-sm"
                                                id="horarioSabado_salida_comida"
                                                name="horario[Sabado][salida_comida]">
                                        </td>

                                        <td>
                                            <input
                                                type="time"
                                                class="form-control form-control-sm"
                                                id="horarioSabado_entrada_comida"
                                                name="horario[Sabado][entrada_comida]">
                                        </td>

                                        <td>
                                            <input
                                                type="time"
                                                class="form-control form-control-sm"
                                                id="horarioSabado_salida"
                                                name="horario[Sabado][salida]">
                                        </td>

                                        <td class="text-center">
                                            <div class="form-check form-switch d-flex justify-content-center">
                                                <input
                                                    class="form-check-input"
                                                    type="checkbox"
                                                    id="horarioSabado_descanso"
                                                    name="horario[Sabado][descanso]">
                                            </div>
                                        </td>

                                        <td class="text-center">
                                            <button
                                                type="button"
                                                class="btn btn-outline-danger btn-sm"
                                                onclick="eliminarHorario('Sabado')">
                                                <i class="bi bi-trash3"></i>
                                            </button>
                                        </td>

                                    </tr>

                                    <!-- Domingo -->
                                    <tr data-dia="Domingo">

                                        <td class="fw-semibold">
                                            Domingo
                                        </td>

                                        <td>
                                            <input
                                                type="time"
                                                class="form-control form-control-sm"
                                                id="horarioDomingo_entrada"
                                                name="horario[Domingo][entrada]">
                                        </td>

                                        <td>
                                            <input
                                                type="time"
                                                class="form-control form-control-sm"
                                                id="horarioDomingo_salida_comida"
                                                name="horario[Domingo][salida_comida]">
                                        </td>

                                        <td>
                                            <input
                                                type="time"
                                                class="form-control form-control-sm"
                                                id="horarioDomingo_entrada_comida"
                                                name="horario[Domingo][entrada_comida]">
                                        </td>

                                        <td>
                                            <input
                                                type="time"
                                                class="form-control form-control-sm"
                                                id="horarioDomingo_salida"
                                                name="horario[Domingo][salida]">
                                        </td>

                                        <td class="text-center">
                                            <div class="form-check form-switch d-flex justify-content-center">
                                                <input
                                                    class="form-check-input"
                                                    type="checkbox"
                                                    id="horarioDomingo_descanso"
                                                    name="horario[Domingo][descanso]">
                                            </div>
                                        </td>

                                        <td class="text-center">
                                            <button
                                                type="button"
                                                class="btn btn-outline-danger btn-sm"
                                                onclick="eliminarHorario('Domingo')">
                                                <i class="bi bi-trash3"></i>
                                            </button>
                                        </td>

                                    </tr>

                                </tbody>

                            </table>

                        </div>

                    </div>

                </div>

            </div>

            <!-- ========================================= -->
            <!-- PIE -->
            <!-- ========================================= -->

            <div class="modal-footer">

                <div class="me-auto d-flex align-items-center gap-2 text-start pe-2">
                    <i class="bi bi-person-badge text-primary fs-5"></i>
                    <span class="text-secondary small fw-medium">Empleado:</span>
                    <strong class="text-dark text-uppercase" id="nombreEmpleadoModalHorarios">---</strong>
                </div>

                <button
                    type="button"
                    class="btn btn-secondary"
                    data-bs-dismiss="modal">

                    Cancelar

                </button>

                <button
                    type="button"
                    class="btn btn-success"
                    id="btnGuardarHorarios">

                    <i class="bi bi-check-lg me-1"></i>
                    Guardar horarios

                </button>

            </div>

        </div>

    </div>

</div>
