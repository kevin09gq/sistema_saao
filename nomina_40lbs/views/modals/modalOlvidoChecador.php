<!-- ===========================================================
 MODAL - OLVIDOS DE CHECADOR
=========================================================== -->

<div class="modal fade"
    id="modalOlvidosChecador"
    tabindex="-1"
    aria-labelledby="modalOlvidosChecadorLabel"
    aria-hidden="true">


    <div class="modal-dialog modal-xl modal-dialog-scrollable">


        <div class="modal-content">


            <!-- ENCABEZADO -->
            <div class="modal-header bg-success text-white">


                <h5 class="modal-title" id="modalOlvidosChecadorLabel">

                    <i class="bi bi-clock-history me-2"></i>

                    Olvidos de Checador

                </h5>


                <button
                    type="button"
                    class="btn-close btn-close-white"
                    data-bs-dismiss="modal">

                </button>


            </div>



            <!-- CUERPO -->
            <div class="modal-body">


                <!-- PASO 1 -->
                <div class="card mb-4">


                    <div class="card-header bg-light">

                        <strong>
                            Paso 1. Seleccionar día
                        </strong>

                    </div>


                    <div class="card-body">


                        <div class="row">


                            <!-- SELECT DIA -->
                            <div class="col-md-6">


                                <label
                                    for="selectDiaOlvidoChecador"
                                    class="form-label">

                                    Día de la semana

                                </label>


                                <select
                                    class="form-select"
                                    id="selectDiaOlvidoChecador">


                                    <option value="">
                                        Seleccione un día...
                                    </option>


                                    <option value="Lunes">
                                        Lunes
                                    </option>


                                    <option value="Martes">
                                        Martes
                                    </option>


                                    <option value="Miercoles">
                                        Miércoles
                                    </option>


                                    <option value="Jueves">
                                        Jueves
                                    </option>


                                    <option value="Viernes">
                                        Viernes
                                    </option>


                                    <option value="Sabado">
                                        Sábado
                                    </option>


                                    <option value="Domingo">
                                        Domingo
                                    </option>


                                </select>


                            </div>


                        </div>


                    </div>


                </div>





                <!-- PASO 2 -->
                <div id="divListaEmpleadosOlvidosChecador">



                    <!-- BUSCADOR -->
                    <div class="input-group mb-3">


                        <span class="input-group-text bg-success text-white">

                            <i class="bi bi-search"></i>

                        </span>


                        <input
                            type="text"
                            class="form-control"
                            id="txtBuscarEmpleadoOlvidoChecador"
                            placeholder="Buscar empleado por nombre o clave">


                    </div>



                    <!-- TABLA EMPLEADOS CON OLVIDOS -->
                    <div class="card">


                        <div class="card-header">

                            <strong>
                                Empleados con olvidos de checador
                            </strong>

                        </div>



                        <div class="card-body p-0">


                            <div class="table-responsive">


                                <table class="table table-hover table-bordered align-middle mb-0">


                                    <thead class="table-light">


                                        <tr>


                                            <th width="60" class="text-center">

                                                <input
                                                    type="checkbox"
                                                    class="form-check-input"
                                                    id="checkTodosOlvidosChecador">

                                            </th>


                                            <th>
                                                Clave
                                            </th>


                                            <th>
                                                Nombre del Empleado
                                            </th>


                                            <th class="text-center">
                                                Cantidad
                                            </th>


                                        </tr>


                                    </thead>



                                    <tbody id="tbody-empleados-olvidos-checador">


                                    </tbody>



                                </table>


                            </div>


                        </div>


                    </div>

                </div>


            </div>




            <!-- PIE -->
            <div class="modal-footer justify-content-between">


                <button
                    type="button"
                    class="btn btn-outline-secondary"
                    data-bs-dismiss="modal">

                    Cancelar

                </button>


                <button
                    type="button"
                    class="btn btn-success"
                    id="btnPerdonarOlvidosChecador">


                    <i class="bi bi-check-circle me-2"></i>

                    Perdonar olvidos


                </button>


            </div>


        </div>


    </div>


</div>