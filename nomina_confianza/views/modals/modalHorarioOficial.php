<!--  MODAL - ASIGNAR HORARIO OFICIAL -->
<div class="modal fade" id="modalHorarioOficial" tabindex="-1" aria-labelledby="modalHorarioOficialLabel" aria-hidden="true">

    <div class="modal-dialog modal-xl modal-dialog-scrollable">

        <div class="modal-content">

            <!-- Encabezado -->
            <div class="modal-header bg-success text-white">

                <h5 class="modal-title" id="modalHorarioOficialLabel">
                    <i class="bi bi-clock me-2"></i>
                    Asignar Horario Oficial
                </h5>

                <button
                    type="button"
                    class="btn-close btn-close-white"
                    data-bs-dismiss="modal"
                    aria-label="Cerrar">
                </button>

            </div>

            <!-- CUERPO -->
            <div class="modal-body">

                <!-- =====================================================
                     PASO 1 - SELECCIONAR EMPLEADOS
                     ===================================================== -->
                <div id="divListaEmpleadosHorario">

                    <!-- Buscador -->
                    <div class="input-group mb-3">

                        <span class="input-group-text bg-success text-white">
                            <i class="bi bi-search"></i>
                        </span>

                        <input
                            type="text"
                            class="form-control"
                            id="txtBuscarEmpleadoHorario"
                            placeholder="Buscar empleado por nombre o clave">

                    </div>

                    <!-- Lista de empleados -->
                    <div class="card">

                        <div class="card-header">

                            <strong>Seleccionar empleados</strong>

                        </div>

                        <div class="card-body p-0">

                            <div class="table-responsive">

                                <table class="table table-hover table-bordered align-middle mb-0">

                                    <thead class="table-light">

                                        <tr>

                                            <th width="60">
                                                <input
                                                    type="checkbox"
                                                    class="form-check-input"
                                                    id="checkTodosHorario">
                                            </th>

                                            <th>Clave</th>

                                            <th>Nombre del Empleado</th>

                                        </tr>

                                    </thead>

                                    <tbody id="tbody-empleados-horario">

                                    </tbody>

                                </table>

                            </div>

                        </div>

                    </div>

                </div>

                <!-- =====================================================
                     PASO 2 - CONFIGURAR HORARIO POR DÍA
                     Cada fila representa un día de la semana.
                     Columnas: Día | Entrada | Salida Comida | Entrada Comida | Salida
                     Si se dejan vacíos, el día se considera sin horario (descanso).
                     ===================================================== -->
                <div id="divHorarioOficial" style="display:none;">

                    <div class="card">

                        <div class="card-header bg-success text-white">

                            <strong>
                                <i class="bi bi-clock me-2"></i>
                                Configurar horario por día
                            </strong>

                        </div>

                        <div class="card-body p-0">

                            <div class="table-responsive">

                                <table class="table table-bordered align-middle mb-0" id="tablaHorarioOficial">

                                    <thead class="table-light">

                                        <!-- Encabezados de columnas -->
                                        <tr>

                                            <th style="width:120px;">Día</th>

                                            <th>Entrada</th>

                                            <th>Salida Comida</th>

                                            <th>Entrada Comida</th>

                                            <th>Salida</th>

                                        </tr>

                                        <!--
                                            FILA DE COPIA RÁPIDA
                                            Escribe el horario una sola vez aquí y presiona
                                            el botón para aplicarlo a todos los días (Lun-Sáb).
                                            El Domingo NO se asigna por defecto.
                                        -->
                                        <tr class="table-warning">

                                            <td class="fw-bold text-nowrap">
                                                <i class="bi bi-arrow-down-circle me-1 text-warning"></i>
                                                Aplicar a todos
                                            </td>

                                            <td>
                                                <input
                                                    type="time"
                                                    class="form-control form-control-sm"
                                                    id="copia-entrada">
                                            </td>

                                            <td>
                                                <input
                                                    type="time"
                                                    class="form-control form-control-sm"
                                                    id="copia-salida-comida">
                                            </td>

                                            <td>
                                                <input
                                                    type="time"
                                                    class="form-control form-control-sm"
                                                    id="copia-entrada-comida">
                                            </td>

                                            <td>
                                                <!-- Botón de copiar -->
                                                <div class="d-flex gap-2 align-items-center">

                                                    <input
                                                        type="time"
                                                        class="form-control form-control-sm"
                                                        id="copia-salida">

                                                    <button
                                                        type="button"
                                                        class="btn btn-warning btn-sm"
                                                        id="btnCopiarHorario"
                                                        title="Aplicar a Lunes - Sábado">
                                                        <i class="bi bi-copy"></i>
                                                    </button>

                                                </div>
                                            </td>

                                        </tr>

                                    </thead>

                                    <tbody>

                                        <!-- LUNES -->
                                        <tr>
                                            <td class="fw-bold">LUNES</td>
                                            <td><input type="time" class="form-control" id="horario-lunes-entrada"></td>
                                            <td><input type="time" class="form-control" id="horario-lunes-salida-comida"></td>
                                            <td><input type="time" class="form-control" id="horario-lunes-entrada-comida"></td>
                                            <td><input type="time" class="form-control" id="horario-lunes-salida"></td>
                                        </tr>

                                        <!-- MARTES -->
                                        <tr>
                                            <td class="fw-bold">MARTES</td>
                                            <td><input type="time" class="form-control" id="horario-martes-entrada"></td>
                                            <td><input type="time" class="form-control" id="horario-martes-salida-comida"></td>
                                            <td><input type="time" class="form-control" id="horario-martes-entrada-comida"></td>
                                            <td><input type="time" class="form-control" id="horario-martes-salida"></td>
                                        </tr>

                                        <!-- MIÉRCOLES -->
                                        <tr>
                                            <td class="fw-bold">MIERCOLES</td>
                                            <td><input type="time" class="form-control" id="horario-miercoles-entrada"></td>
                                            <td><input type="time" class="form-control" id="horario-miercoles-salida-comida"></td>
                                            <td><input type="time" class="form-control" id="horario-miercoles-entrada-comida"></td>
                                            <td><input type="time" class="form-control" id="horario-miercoles-salida"></td>
                                        </tr>

                                        <!-- JUEVES -->
                                        <tr>
                                            <td class="fw-bold">JUEVES</td>
                                            <td><input type="time" class="form-control" id="horario-jueves-entrada"></td>
                                            <td><input type="time" class="form-control" id="horario-jueves-salida-comida"></td>
                                            <td><input type="time" class="form-control" id="horario-jueves-entrada-comida"></td>
                                            <td><input type="time" class="form-control" id="horario-jueves-salida"></td>
                                        </tr>

                                        <!-- VIERNES -->
                                        <tr>
                                            <td class="fw-bold">VIERNES</td>
                                            <td><input type="time" class="form-control" id="horario-viernes-entrada"></td>
                                            <td><input type="time" class="form-control" id="horario-viernes-salida-comida"></td>
                                            <td><input type="time" class="form-control" id="horario-viernes-entrada-comida"></td>
                                            <td><input type="time" class="form-control" id="horario-viernes-salida"></td>
                                        </tr>

                                        <!-- SÁBADO -->
                                        <tr>
                                            <td class="fw-bold text-muted">SABADO</td>
                                            <td><input type="time" class="form-control" id="horario-sabado-entrada"></td>
                                            <td><input type="time" class="form-control" id="horario-sabado-salida-comida"></td>
                                            <td><input type="time" class="form-control" id="horario-sabado-entrada-comida"></td>
                                            <td><input type="time" class="form-control" id="horario-sabado-salida"></td>
                                        </tr>

                                        <!-- DOMINGO -->
                                        <tr>
                                            <td class="fw-bold text-muted">DOMINGO</td>
                                            <td><input type="time" class="form-control" id="horario-domingo-entrada"></td>
                                            <td><input type="time" class="form-control" id="horario-domingo-salida-comida"></td>
                                            <td><input type="time" class="form-control" id="horario-domingo-entrada-comida"></td>
                                            <td><input type="time" class="form-control" id="horario-domingo-salida"></td>
                                        </tr>

                                    </tbody>

                                </table>

                            </div>

                        </div>

                    </div>

                    <div class="alert alert-info mt-3 mb-0">
                        <i class="bi bi-info-circle me-2"></i>
                        Los días con campos vacíos se considerarán como <strong>días de descanso</strong>.
                    </div>

                </div>

            </div>

            <!--  PIE  -->
            <div class="modal-footer justify-content-between">

                <button
                    type="button"
                    class="btn btn-outline-secondary"
                    data-bs-dismiss="modal">

                    Cancelar

                </button>

                <div>

                    <!-- Botón Regresar (solo visible en paso 2) -->
                    <button
                        type="button"
                        class="btn btn-outline-success me-2"
                        id="btnRegresarHorario"
                        style="display:none;">

                        <i class="bi bi-arrow-left-circle me-1"></i>

                        Regresar

                    </button>

                    <!-- Botón Continuar (visible en paso 1) -->
                    <button
                        type="button"
                        class="btn btn-success"
                        id="btnContinuarHorario">

                        <i class="bi bi-arrow-right-circle me-1"></i>

                        Continuar

                    </button>

                    <!-- Botón Guardar (visible en paso 2) -->
                    <button
                        type="button"
                        class="btn btn-success"
                        id="btnGuardarHorario"
                        style="display:none;">

                        <i class="bi bi-check-circle me-1"></i>

                        Guardar Horario

                    </button>

                </div>

            </div>

        </div>

    </div>

</div>
