<!-- Modal Editar Empleado -->
<div
    class="modal fade"
    id="modalEditarEmpleado"
    tabindex="-1"
    aria-labelledby="modalEditarEmpleadoLabel"
    aria-hidden="true">

    <div class="modal-dialog modal-xl modal-dialog-scrollable">

        <div class="modal-content">

            <!-- Encabezado -->
            <div class="modal-header">

                <h5 class="modal-title" id="modalEditarEmpleadoLabel">
                    Editar información del empleado
                </h5>

                <button
                    type="button"
                    class="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Cerrar">
                </button>

            </div>


            <!-- Cuerpo -->
            <div class="modal-body">

                <form id="formEditarEmpleado">

                    <!-- ========================================= -->
                    <!-- DATOS PERSONALES -->
                    <!-- ========================================= -->

                    <div class="card border-0 bg-light mb-4">

                        <div class="card-body">

                            <h6 class="fw-bold text-secondary mb-3">
                                <i class="bi bi-person me-2"></i>
                                Datos personales
                            </h6>

                            <div class="row g-3">

                                <!-- Clave -->
                                <div class="col-md-3">

                                    <label
                                        for="editarClave"
                                        class="form-label fw-semibold">
                                        Clave
                                    </label>

                                    <div class="input-group">

                                        <input
                                            type="text"
                                            class="form-control"
                                            id="editarClave"
                                            name="clave"
                                            placeholder="Clave">

                                        <button
                                            type="button"
                                            class="btn btn-outline-success"
                                            id="btnAbrirClavesDisponibles"
                                            title="Ver disponibilidad de claves">
                                            <i class="bi bi-key-fill"></i>
                                        </button>

                                    </div>

                                </div>


                                <!-- Nombre -->
                                <div class="col-md-3">

                                    <label
                                        for="editarNombre"
                                        class="form-label fw-semibold">
                                        Nombre
                                    </label>

                                    <input
                                        type="text"
                                        class="form-control text-uppercase"
                                        id="editarNombre"
                                        name="nombre">

                                </div>


                                <!-- Apellido Paterno -->
                                <div class="col-md-3">

                                    <label
                                        for="editarApellidoPaterno"
                                        class="form-label fw-semibold">
                                        Apellido Paterno
                                    </label>

                                    <input
                                        type="text"
                                        class="form-control text-uppercase"
                                        id="editarApellidoPaterno"
                                        name="apellido_paterno">

                                </div>


                                <!-- Apellido Materno -->
                                <div class="col-md-3">

                                    <label
                                        for="editarApellidoMaterno"
                                        class="form-label fw-semibold">
                                        Apellido Materno
                                    </label>

                                    <input
                                        type="text"
                                        class="form-control text-uppercase"
                                        id="editarApellidoMaterno"
                                        name="apellido_materno">

                                </div>


                                <!-- IMSS -->
                                <div class="col-md-4">

                                    <label
                                        for="editarImss"
                                        class="form-label fw-semibold">
                                        IMSS
                                    </label>

                                    <input
                                        type="text"
                                        class="form-control"
                                        id="editarImss"
                                        name="imss">

                                </div>


                                <!-- CURP -->
                                <div class="col-md-4">

                                    <label
                                        for="editarCurp"
                                        class="form-label fw-semibold">
                                        CURP
                                    </label>

                                    <input
                                        type="text"
                                        class="form-control text-uppercase"
                                        id="editarCurp"
                                        name="curp"
                                        maxlength="18">

                                </div>


                                <!-- RFC -->
                                <div class="col-md-4">

                                    <label
                                        for="editarRfc"
                                        class="form-label fw-semibold">
                                        RFC
                                    </label>

                                    <input
                                        type="text"
                                        class="form-control text-uppercase"
                                        id="editarRfc"
                                        name="rfc"
                                        maxlength="13">

                                </div>


                                <!-- Domicilio -->
                                <div class="col-md-8">

                                    <label
                                        for="editarDomicilio"
                                        class="form-label fw-semibold">
                                        Domicilio
                                    </label>

                                    <input
                                        type="text"
                                        class="form-control"
                                        id="editarDomicilio"
                                        name="domicilio">

                                </div>


                                <!-- Sexo -->
                                <div class="col-md-2">

                                    <label
                                        for="editarSexo"
                                        class="form-label fw-semibold">
                                        Sexo
                                    </label>

                                    <select
                                        class="form-select"
                                        id="editarSexo"
                                        name="sexo">

                                        <option value="">
                                            Seleccionar
                                        </option>

                                        <option value="M">
                                            Masculino
                                        </option>

                                        <option value="F">
                                            Femenino
                                        </option>

                                    </select>

                                </div>


                                <!-- Grupo Sanguíneo -->
                                <div class="col-md-2">

                                    <label
                                        for="editarGrupoSanguineo"
                                        class="form-label fw-semibold">
                                        Grupo Sanguíneo
                                    </label>

                                    <input
                                        type="text"
                                        class="form-control"
                                        id="editarGrupoSanguineo"
                                        name="grupo_sanguineo">

                                </div>


                                <!-- Fecha nacimiento -->
                                <div class="col-md-4">

                                    <label
                                        for="editarFechaNacimiento"
                                        class="form-label fw-semibold">
                                        Fecha de nacimiento
                                    </label>

                                    <input
                                        type="date"
                                        class="form-control"
                                        id="editarFechaNacimiento"
                                        name="fecha_nacimiento">

                                </div>


                                <!-- Edad -->
                                <div class="col-md-2">

                                    <label
                                        for="editarEdad"
                                        class="form-label fw-semibold">
                                        Edad
                                    </label>

                                    <input
                                        type="text"
                                        class="form-control"
                                        id="editarEdad"
                                        readonly>

                                </div>


                                <!-- Estado civil -->
                                <div class="col-md-3">

                                    <label
                                        for="editarEstadoCivil"
                                        class="form-label fw-semibold">
                                        Estado Civil
                                    </label>

                                    <select
                                        class="form-select"
                                        id="editarEstadoCivil"
                                        name="estado_civil">

                                        <option value="">
                                            Seleccionar
                                        </option>

                                        <option value="SOLTERO">
                                            Soltero(a)
                                        </option>

                                        <option value="CASADO">
                                            Casado(a)
                                        </option>

                                        <option value="DIVORCIADO">
                                            Divorciado(a)
                                        </option>

                                        <option value="VIUDO">
                                            Viudo(a)
                                        </option>

                                        <option value="UNION_LIBRE">
                                            Unión Libre
                                        </option>

                                    </select>

                                </div>

                            </div>

                        </div>

                    </div>


                    <!-- ========================================= -->
                    <!-- DATOS DE CONTACTO -->
                    <!-- ========================================= -->

                    <div class="card border-0 bg-light mb-4">

                        <div class="card-body">

                            <h6 class="fw-bold text-secondary mb-3">
                                <i class="bi bi-telephone me-2"></i>
                                Datos de contacto
                            </h6>

                            <div class="row g-3">

                                <!-- Teléfono -->
                                <div class="col-md-4">

                                    <label
                                        for="editarTelefono"
                                        class="form-label fw-semibold">
                                        Teléfono
                                    </label>

                                    <input
                                        type="tel"
                                        class="form-control"
                                        id="editarTelefono"
                                        name="telefono"
                                        maxlength="10"
                                        inputmode="numeric"
                                        pattern="[0-9]{10}"
                                        placeholder="10 dígitos">

                                </div>


                                <!-- Enfermedades / Alergias -->
                                <div class="col-md-8">

                                    <label
                                        for="editarEnfermedades"
                                        class="form-label fw-semibold">
                                        Enfermedades / Alergias
                                    </label>

                                    <textarea
                                        class="form-control"
                                        id="editarEnfermedades"
                                        name="enfermedades_alergias"
                                        rows="2"
                                        placeholder="Escriba las enfermedades o alergias del empleado..."></textarea>

                                </div>

                            </div>

                        </div>

                    </div>


                    <!-- ========================================= -->
                    <!-- DATOS LABORALES -->
                    <!-- ========================================= -->

                    <div class="card border-0 bg-light mb-4">

                        <div class="card-body">

                            <h6 class="fw-bold text-secondary mb-3">
                                <i class="bi bi-building me-2"></i>
                                Datos laborales
                            </h6>

                            <div class="row g-3">

                                <!-- Número de casillero -->
                                <div class="col-md-3">

                                    <label
                                        for="editarCasillero"
                                        class="form-label fw-semibold">
                                        Número de Casillero
                                    </label>

                                    <div class="input-group">

                                        <input
                                            type="text"
                                            class="form-control"
                                            id="editarCasillero"
                                            name="numero_casillero"
                                            placeholder="Casillero"
                                            inputmode="numeric"
                                            oninput="this.value = this.value.replace(/[^0-9]/g, '')">

                                        <button
                                            type="button"
                                            class="btn btn-outline-success"
                                            id="btnAbrirCasillerosDisponibles"
                                            title="Ver casilleros disponibles">
                                            <i class="bi bi-grid-3x3-gap-fill"></i>
                                        </button>

                                    </div>

                                </div>


                                <!-- Biométrico -->
                                <div class="col-md-3">

                                    <label
                                        for="editarBiometrico"
                                        class="form-label fw-semibold">
                                        Biométrico
                                    </label>

                                    <div class="input-group">

                                        <input
                                            type="text"
                                            class="form-control"
                                            id="editarBiometrico"
                                            name="biometrico"
                                            placeholder="Biométrico"
                                            inputmode="numeric"
                                            oninput="this.value = this.value.replace(/[^0-9]/g, '')">

                                        <button
                                            type="button"
                                            class="btn btn-outline-success"
                                            id="btnAbrirBiometricoDisponible"
                                            title="Ver disponibilidad de biométricos">
                                            <i class="bi bi-fingerprint"></i>
                                        </button>

                                    </div>

                                </div>


                                <!-- Empresa -->
                                <div class="col-md-6">

                                    <label
                                        for="editarEmpresa"
                                        class="form-label fw-semibold">
                                        Empresa
                                    </label>

                                    <select
                                        class="form-select"
                                        id="editarEmpresa"
                                        name="id_empresa">

                                        <option value="">
                                            Seleccionar empresa
                                        </option>

                                    </select>

                                </div>


                                <!-- Área -->
                                <div class="col-md-4">

                                    <label
                                        for="editarArea"
                                        class="form-label fw-semibold">
                                        Área
                                    </label>

                                    <select
                                        class="form-select"
                                        id="editarArea"
                                        name="id_area">

                                        <option value="">
                                            Seleccionar área
                                        </option>

                                    </select>

                                </div>


                                <!-- Departamento -->
                                <div class="col-md-4">

                                    <label
                                        for="editarDepartamento"
                                        class="form-label fw-semibold">
                                        Departamento
                                    </label>

                                    <select
                                        class="form-select"
                                        id="editarDepartamento"
                                        name="id_departamento">

                                        <option value="">
                                            Seleccionar departamento
                                        </option>

                                    </select>

                                </div>


                                <!-- Puesto -->
                                <div class="col-md-4">

                                    <label
                                        for="editarPuesto"
                                        class="form-label fw-semibold">
                                        Puesto
                                    </label>

                                    <select
                                        class="form-select"
                                        id="editarPuesto"
                                        name="id_puesto">

                                        <option value="">
                                            Seleccionar puesto
                                        </option>

                                    </select>

                                </div>

                            </div>

                        </div>

                    </div>


                    <!-- ========================================= -->
                    <!-- DATOS SALARIALES -->
                    <!-- ========================================= -->

                    <div class="card border-0 bg-light">

                        <div class="card-body">

                            <h6 class="fw-bold text-secondary mb-3">
                                <i class="bi bi-cash-stack me-2"></i>
                                Información salarial
                            </h6>

                            <div class="row g-3">

                                <!-- Salario semanal -->
                                <div class="col-md-6">

                                    <label
                                        for="editarSalarioSemanal"
                                        class="form-label fw-semibold">
                                        Salario Semanal
                                    </label>

                                    <div class="input-group">

                                        <span class="input-group-text">
                                            $
                                        </span>

                                        <input
                                            type="number"
                                            class="form-control"
                                            id="editarSalarioSemanal"
                                            name="salario_semanal"
                                            step="0.01"
                                            min="0">

                                    </div>

                                </div>


                                <!-- Salario diario -->
                                <div class="col-md-6">

                                    <label
                                        for="editarSalarioDiario"
                                        class="form-label fw-semibold">
                                        Salario Diario
                                    </label>

                                    <div class="input-group">

                                        <span class="input-group-text">
                                            $
                                        </span>

                                        <input
                                            type="number"
                                            class="form-control"
                                            id="editarSalarioDiario"
                                            name="salario_diario"
                                            step="0.01"
                                            min="0">

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </form>

            </div>


            <!-- Pie -->
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
                    id="btnGuardarEmpleado">

                    <i class="bi bi-check-lg me-1"></i>
                    Guardar cambios

                </button>

            </div>

        </div>

    </div>

</div>