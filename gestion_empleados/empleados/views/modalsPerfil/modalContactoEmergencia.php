
<!-- Modal Contacto de Emergencia -->
<div
    class="modal fade"
    id="modalContactoEmergencia"
    tabindex="-1"
    aria-labelledby="modalContactoEmergenciaLabel"
    aria-hidden="true">

    <div class="modal-dialog modal-lg modal-dialog-scrollable">

        <div class="modal-content">

            <!-- Encabezado -->
            <div class="modal-header">

                <h5 class="modal-title" id="modalContactoEmergenciaLabel">
                    Contacto de emergencia
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

                <form id="formContactoEmergencia">

                    <div class="card border-0 bg-light">

                        <div class="card-body">

                            <h6 class="fw-bold text-secondary mb-3">
                                <i class="bi bi-person-lines-fill me-2"></i>
                                Información del contacto
                            </h6>

                            <div class="row g-3">

                                <!-- Nombre -->
                                <div class="col-md-4">

                                    <label
                                        for="editarContactoNombre"
                                        class="form-label fw-semibold">
                                        Nombre
                                    </label>

                                    <input
                                        type="text"
                                        class="form-control text-uppercase"
                                        id="editarContactoNombre"
                                        name="nombre"
                                        required>

                                </div>


                                <!-- Apellido Paterno -->
                                <div class="col-md-4">

                                    <label
                                        for="editarContactoApellidoPaterno"
                                        class="form-label fw-semibold">
                                        Apellido Paterno
                                    </label>

                                    <input
                                        type="text"
                                        class="form-control text-uppercase"
                                        id="editarContactoApellidoPaterno"
                                        name="apellido_paterno"
                                        required>

                                </div>


                                <!-- Apellido Materno -->
                                <div class="col-md-4">

                                    <label
                                        for="editarContactoApellidoMaterno"
                                        class="form-label fw-semibold">
                                        Apellido Materno
                                    </label>

                                    <input
                                        type="text"
                                        class="form-control text-uppercase"
                                        id="editarContactoApellidoMaterno"
                                        name="apellido_materno">

                                </div>


                                <!-- Teléfono -->
                                <div class="col-md-4">

                                    <label
                                        for="editarContactoTelefono"
                                        class="form-label fw-semibold">
                                        Teléfono
                                    </label>

                                    <input
                                        type="tel"
                                        class="form-control"
                                        id="editarContactoTelefono"
                                        name="telefono"
                                        maxlength="10"
                                        inputmode="numeric"
                                        pattern="[0-9]{10}"
                                        placeholder="10 dígitos"
                                        oninput="this.value = this.value.replace(/[^0-9]/g, '')"
                                        required>

                                </div>


                                <!-- Parentesco -->
                                <div class="col-md-4">

                                    <label
                                        for="editarContactoParentesco"
                                        class="form-label fw-semibold">
                                        Parentesco
                                    </label>

                                     <input
                                        type="text"
                                        class="form-control text-uppercase"
                                        id="editarContactoParentesco"
                                        name="parentesco">
                                  

                                </div>


                                <!-- Domicilio -->
                                <div class="col-md-12">

                                    <label
                                        for="editarContactoDomicilio"
                                        class="form-label fw-semibold">
                                        Domicilio
                                    </label>

                                    <textarea
                                        class="form-control"
                                        id="editarContactoDomicilio"
                                        name="domicilio"
                                        rows="2"
                                        placeholder="Ingrese el domicilio del contacto de emergencia..."
                                        required></textarea>

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
                    id="btnGuardarContactoEmergencia">

                    <i class="bi bi-check-lg me-1"></i>
                    Guardar contacto

                </button>

            </div>

        </div>

    </div>

</div>

