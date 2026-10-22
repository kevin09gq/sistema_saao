<!-- Modal Beneficiarios -->
<div
    class="modal fade"
    id="modalBeneficiarios"
    tabindex="-1"
    aria-labelledby="modalBeneficiariosLabel"
    aria-hidden="true">

    <div class="modal-dialog modal-xl modal-dialog-scrollable">

        <div class="modal-content">

            <!-- ========================================= -->
            <!-- ENCABEZADO -->
            <!-- ========================================= -->

            <div class="modal-header">

                <h5 class="modal-title" id="modalBeneficiariosLabel">
                    <i class="bi bi-people-fill me-2"></i>
                    Beneficiarios del empleado
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

            <div class="modal-body">

                <!-- ========================================= -->
                <!-- AGREGAR BENEFICIARIO -->
                <!-- ========================================= -->

                <div class="card border-0 bg-light mb-4" id="cardAgregarBeneficiario">

                    <div class="card-body">

                        <h6 class="fw-bold text-secondary mb-3">

                            <i class="bi bi-person-plus-fill me-2"></i>

                            Agregar beneficiario

                        </h6>


                        <div class="row g-3">

                            <!-- Nombre -->
                            <div class="col-md-3">

                                <label
                                    for="beneficiarioNombre"
                                    class="form-label fw-semibold">

                                    Nombre

                                </label>

                                <input
                                    type="text"
                                    class="form-control text-uppercase"
                                    id="beneficiarioNombre"
                                    name="nombre"
                                    placeholder="Nombre">

                            </div>


                            <!-- Apellido Paterno -->
                            <div class="col-md-3">

                                <label
                                    for="beneficiarioApellidoPaterno"
                                    class="form-label fw-semibold">

                                    Apellido Paterno

                                </label>

                                <input
                                    type="text"
                                    class="form-control text-uppercase"
                                    id="beneficiarioApellidoPaterno"
                                    name="apellido_paterno"
                                    placeholder="Apellido paterno">

                            </div>


                            <!-- Apellido Materno -->
                            <div class="col-md-3">

                                <label
                                    for="beneficiarioApellidoMaterno"
                                    class="form-label fw-semibold">

                                    Apellido Materno

                                </label>

                                <input
                                    type="text"
                                    class="form-control text-uppercase"
                                    id="beneficiarioApellidoMaterno"
                                    name="apellido_materno"
                                    placeholder="Apellido materno">

                            </div>


                            <!-- Parentesco -->
                            <div class="col-md-3">

                                <label
                                    for="beneficiarioParentesco"
                                    class="form-label fw-semibold">

                                    Parentesco

                                </label>

                                <input
                                    type="text"
                                    class="form-control text-uppercase"
                                    id="beneficiarioParentesco"
                                    name="parentesco"
                                    placeholder="Parentesco">

                            </div>


                            <!-- Porcentaje -->
                            <div class="col-md-3">

                                <label
                                    for="beneficiarioPorcentaje"
                                    class="form-label fw-semibold">

                                    Porcentaje

                                </label>

                                <div class="input-group">

                                    <input
                                        type="number"
                                        class="form-control"
                                        id="beneficiarioPorcentaje"
                                        name="porcentaje"
                                        min="0.01"
                                        max="100"
                                        step="0.01"
                                        placeholder="0.00">

                                    <span class="input-group-text">
                                        %
                                    </span>

                                </div>

                            </div>


                            <!-- Botón agregar -->
                            <div class="col-md-9 d-flex align-items-end">

                                <button
                                    type="button"
                                    class="btn btn-primary"
                                    id="btnAgregarBeneficiario">

                                    <i class="bi bi-plus-lg me-1"></i>

                                    Agregar beneficiario

                                </button>

                            </div>

                        </div>

                    </div>

                </div>


                <!-- ========================================= -->
                <!-- LISTADO DE BENEFICIARIOS -->
                <!-- ========================================= -->

                <div class="card border-0 bg-light">

                    <div class="card-body">

                        <div
                            class="d-flex justify-content-between align-items-center mb-3">

                            <h6 class="fw-bold text-secondary mb-0">

                                <i class="bi bi-list-ul me-2"></i>

                                Beneficiarios registrados

                            </h6>


                            <!-- Porcentaje total -->
                            <div>

                                <span class="fw-semibold">
                                    Porcentaje total:
                                </span>

                                <span
                                    id="beneficiariosPorcentajeTotal"
                                    class="badge bg-primary fs-6">

                                    0.00%

                                </span>

                            </div>

                        </div>


                        <!-- Tabla -->

                        <div class="table-responsive">

                            <table
                                class="table table-hover align-middle mb-0">

                                <thead class="table-light">

                                    <tr>

                                        <th>
                                            #
                                        </th>

                                        <th>
                                            Nombre
                                        </th>

                                        <th>
                                            Apellido Paterno
                                        </th>

                                        <th>
                                            Apellido Materno
                                        </th>

                                        <th>
                                            Parentesco
                                        </th>

                                        <th class="text-center">
                                            Porcentaje
                                        </th>

                                        <th class="text-center">
                                            Acción
                                        </th>

                                    </tr>

                                </thead>


                                <tbody id="tablaBeneficiarios">

                                    <!--
                                        Los beneficiarios
                                        se agregarán aquí
                                    -->

                                    <tr id="filaSinBeneficiarios">

                                        <td
                                            colspan="7"
                                            class="text-center text-muted py-4">

                                            <i
                                                class="bi bi-person-x fs-3 d-block mb-2">
                                            </i>

                                            No hay beneficiarios registrados

                                        </td>

                                    </tr>

                                </tbody>

                            </table>

                        </div>


                        <!-- ========================================= -->
                        <!-- RESUMEN DEL PORCENTAJE -->
                        <!-- ========================================= -->

                        <div class="row mt-4">

                            <div class="col-md-8"></div>

                            <div class="col-md-4">

                                <div
                                    class="border rounded p-3 bg-white">

                                    <div
                                        class="d-flex justify-content-between mb-2">

                                        <span class="fw-semibold">
                                            Porcentaje asignado:
                                        </span>

                                        <span
                                            id="porcentajeAsignado"
                                            class="fw-bold">

                                            0.00%

                                        </span>

                                    </div>


                                    <div
                                        class="d-flex justify-content-between">

                                        <span class="fw-semibold">
                                            Porcentaje disponible:
                                        </span>

                                        <span
                                            id="porcentajeDisponible"
                                            class="fw-bold text-success">

                                            100.00%

                                        </span>

                                    </div>

                                </div>

                            </div>

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
                    <strong class="text-dark text-uppercase" id="nombreEmpleadoModalBeneficiarios">---</strong>
                </div>

                <button
                    type="button"
                    class="btn btn-secondary"
                    data-bs-dismiss="modal">

                    Cancelar

                </button>


            </div>

        </div>

    </div>

</div>


