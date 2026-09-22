<!-- Modal Horarios Oficiales -->
<div
    class="modal fade"
    id="modalHorariosOficiales"
    tabindex="-1"
    aria-labelledby="modalHorariosOficialesLabel"
    aria-hidden="true">

    <div class="modal-dialog modal-xl modal-dialog-scrollable">

        <div class="modal-content">

            <!-- ========================================= -->
            <!-- ENCABEZADO -->
            <!-- ========================================= -->

            <div class="modal-header">
                <h5 class="modal-title" id="modalHorariosOficialesLabel">
                    <i class="bi bi-clock me-2"></i>
                    Gestión de Horarios Oficiales
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

            <div class="modal-body" id="formHorariosOficialesEmpleado">

                <!-- ========================================= -->
                <!-- COPIAR HORARIOS -->
                <!-- ========================================= -->

                <div class="card border-0 bg-light mb-4">

                    <div class="card-body">

                        <h6 class="fw-bold text-secondary mb-3">
                            <i class="bi bi-copy me-2"></i>
                            Copiar Horarios
                        </h6>

                        <div class="row g-3 align-items-end">

                            <!-- Entrada -->
                            <div class="col-md-3">

                                <label
                                    for="copiarEntradaOficial"
                                    class="form-label fw-semibold">
                                    Entrada
                                </label>

                                <input
                                    type="time"
                                    class="form-control"
                                    id="copiarEntradaOficial"
                                    name="copiar_entrada_oficial">

                            </div>

                            <!-- Salida Comida -->
                            <div class="col-md-3">

                                <label
                                    for="copiarSalidaComidaOficial"
                                    class="form-label fw-semibold">
                                    Salida Comida
                                </label>

                                <input
                                    type="time"
                                    class="form-control"
                                    id="copiarSalidaComidaOficial"
                                    name="copiar_salida_comida_oficial">

                            </div>

                            <!-- Entrada Comida -->
                            <div class="col-md-3">

                                <label
                                    for="copiarEntradaComidaOficial"
                                    class="form-label fw-semibold">
                                    Entrada Comida
                                </label>

                                <input
                                    type="time"
                                    class="form-control"
                                    id="copiarEntradaComidaOficial"
                                    name="copiar_entrada_comida_oficial">

                            </div>

                            <!-- Salida -->
                            <div class="col-md-3">

                                <label
                                    for="copiarSalidaOficial"
                                    class="form-label fw-semibold">
                                    Salida
                                </label>

                                <div class="input-group">

                                    <input
                                        type="time"
                                        class="form-control"
                                        id="copiarSalidaOficial"
                                        name="copiar_salida_oficial">

                                    <button
                                        type="button"
                                        class="btn btn-primary"
                                        id="btnCopiarHorariosOficiales">
                                        <i class="bi bi-copy"></i>
                                    </button>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

                <!-- ========================================= -->
                <!-- TABLA DE HORARIOS OFICIALES -->
                <!-- ========================================= -->

                <div class="card border-0 bg-light">

                    <div class="card-body">

                        <h6 class="fw-bold text-secondary mb-3">
                            <i class="bi bi-calendar-week me-2"></i>
                            Horarios Oficiales Semanales
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
                                            Acción
                                        </th>

                                    </tr>

                                </thead>

                                <tbody id="tablaHorariosOficiales">

                                    <!-- Lunes -->
                                    <tr data-dia="Lunes">

                                        <td class="fw-semibold">
                                            Lunes
                                        </td>

                                        <td>
                                            <input
                                                type="time"
                                                class="form-control form-control-sm"
                                                id="horarioOficialLunes_entrada"
                                                name="horario_oficial[Lunes][entrada]">
                                        </td>

                                        <td>
                                            <input
                                                type="time"
                                                class="form-control form-control-sm"
                                                id="horarioOficialLunes_salida_comida"
                                                name="horario_oficial[Lunes][salida_comida]">
                                        </td>

                                        <td>
                                            <input
                                                type="time"
                                                class="form-control form-control-sm"
                                                id="horarioOficialLunes_entrada_comida"
                                                name="horario_oficial[Lunes][entrada_comida]">
                                        </td>

                                        <td>
                                            <input
                                                type="time"
                                                class="form-control form-control-sm"
                                                id="horarioOficialLunes_salida"
                                                name="horario_oficial[Lunes][salida]">
                                        </td>

                                        <td class="text-center">
                                            <button
                                                type="button"
                                                class="btn btn-outline-danger btn-sm"
                                                onclick="eliminarHorarioOficial('Lunes')">
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
                                                id="horarioOficialMartes_entrada"
                                                name="horario_oficial[Martes][entrada]">
                                        </td>

                                        <td>
                                            <input
                                                type="time"
                                                class="form-control form-control-sm"
                                                id="horarioOficialMartes_salida_comida"
                                                name="horario_oficial[Martes][salida_comida]">
                                        </td>

                                        <td>
                                            <input
                                                type="time"
                                                class="form-control form-control-sm"
                                                id="horarioOficialMartes_entrada_comida"
                                                name="horario_oficial[Martes][entrada_comida]">
                                        </td>

                                        <td>
                                            <input
                                                type="time"
                                                class="form-control form-control-sm"
                                                id="horarioOficialMartes_salida"
                                                name="horario_oficial[Martes][salida]">
                                        </td>

                                        <td class="text-center">
                                            <button
                                                type="button"
                                                class="btn btn-outline-danger btn-sm"
                                                onclick="eliminarHorarioOficial('Martes')">
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
                                                id="horarioOficialMiercoles_entrada"
                                                name="horario_oficial[Miercoles][entrada]">
                                        </td>

                                        <td>
                                            <input
                                                type="time"
                                                class="form-control form-control-sm"
                                                id="horarioOficialMiercoles_salida_comida"
                                                name="horario_oficial[Miercoles][salida_comida]">
                                        </td>

                                        <td>
                                            <input
                                                type="time"
                                                class="form-control form-control-sm"
                                                id="horarioOficialMiercoles_entrada_comida"
                                                name="horario_oficial[Miercoles][entrada_comida]">
                                        </td>

                                        <td>
                                            <input
                                                type="time"
                                                class="form-control form-control-sm"
                                                id="horarioOficialMiercoles_salida"
                                                name="horario_oficial[Miercoles][salida]">
                                        </td>

                                        <td class="text-center">
                                            <button
                                                type="button"
                                                class="btn btn-outline-danger btn-sm"
                                                onclick="eliminarHorarioOficial('Miercoles')">
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
                                                id="horarioOficialJueves_entrada"
                                                name="horario_oficial[Jueves][entrada]">
                                        </td>

                                        <td>
                                            <input
                                                type="time"
                                                class="form-control form-control-sm"
                                                id="horarioOficialJueves_salida_comida"
                                                name="horario_oficial[Jueves][salida_comida]">
                                        </td>

                                        <td>
                                            <input
                                                type="time"
                                                class="form-control form-control-sm"
                                                id="horarioOficialJueves_entrada_comida"
                                                name="horario_oficial[Jueves][entrada_comida]">
                                        </td>

                                        <td>
                                            <input
                                                type="time"
                                                class="form-control form-control-sm"
                                                id="horarioOficialJueves_salida"
                                                name="horario_oficial[Jueves][salida]">
                                        </td>

                                        <td class="text-center">
                                            <button
                                                type="button"
                                                class="btn btn-outline-danger btn-sm"
                                                onclick="eliminarHorarioOficial('Jueves')">
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
                                                id="horarioOficialViernes_entrada"
                                                name="horario_oficial[Viernes][entrada]">
                                        </td>

                                        <td>
                                            <input
                                                type="time"
                                                class="form-control form-control-sm"
                                                id="horarioOficialViernes_salida_comida"
                                                name="horario_oficial[Viernes][salida_comida]">
                                        </td>

                                        <td>
                                            <input
                                                type="time"
                                                class="form-control form-control-sm"
                                                id="horarioOficialViernes_entrada_comida"
                                                name="horario_oficial[Viernes][entrada_comida]">
                                        </td>

                                        <td>
                                            <input
                                                type="time"
                                                class="form-control form-control-sm"
                                                id="horarioOficialViernes_salida"
                                                name="horario_oficial[Viernes][salida]">
                                        </td>

                                        <td class="text-center">
                                            <button
                                                type="button"
                                                class="btn btn-outline-danger btn-sm"
                                                onclick="eliminarHorarioOficial('Viernes')">
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
                                                id="horarioOficialSabado_entrada"
                                                name="horario_oficial[Sabado][entrada]">
                                        </td>

                                        <td>
                                            <input
                                                type="time"
                                                class="form-control form-control-sm"
                                                id="horarioOficialSabado_salida_comida"
                                                name="horario_oficial[Sabado][salida_comida]">
                                        </td>

                                        <td>
                                            <input
                                                type="time"
                                                class="form-control form-control-sm"
                                                id="horarioOficialSabado_entrada_comida"
                                                name="horario_oficial[Sabado][entrada_comida]">
                                        </td>

                                        <td>
                                            <input
                                                type="time"
                                                class="form-control form-control-sm"
                                                id="horarioOficialSabado_salida"
                                                name="horario_oficial[Sabado][salida]">
                                        </td>

                                        <td class="text-center">
                                            <button
                                                type="button"
                                                class="btn btn-outline-danger btn-sm"
                                                onclick="eliminarHorarioOficial('Sabado')">
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
                                                id="horarioOficialDomingo_entrada"
                                                name="horario_oficial[Domingo][entrada]">
                                        </td>

                                        <td>
                                            <input
                                                type="time"
                                                class="form-control form-control-sm"
                                                id="horarioOficialDomingo_salida_comida"
                                                name="horario_oficial[Domingo][salida_comida]">
                                        </td>

                                        <td>
                                            <input
                                                type="time"
                                                class="form-control form-control-sm"
                                                id="horarioOficialDomingo_entrada_comida"
                                                name="horario_oficial[Domingo][entrada_comida]">
                                        </td>

                                        <td>
                                            <input
                                                type="time"
                                                class="form-control form-control-sm"
                                                id="horarioOficialDomingo_salida"
                                                name="horario_oficial[Domingo][salida]">
                                        </td>

                                        <td class="text-center">
                                            <button
                                                type="button"
                                                class="btn btn-outline-danger btn-sm"
                                                onclick="eliminarHorarioOficial('Domingo')">
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

                <button
                    type="button"
                    class="btn btn-secondary"
                    data-bs-dismiss="modal">

                    Cancelar

                </button>

                <button
                    type="button"
                    class="btn btn-success"
                    id="btnGuardarHorariosOficiales">

                    <i class="bi bi-check-lg me-1"></i>
                    Guardar horarios oficiales

                </button>

            </div>

        </div>

    </div>

</div>
