<!-- Modal Editar Información del Administrador -->
<div
    class="modal fade"
    id="modalEditarUsuario"
    tabindex="-1"
    aria-labelledby="modalEditarUsuarioLabel"
    aria-hidden="true">

    <div class="modal-dialog modal-lg modal-dialog-centered">

        <div class="modal-content">

            <!-- Encabezado -->
            <div class="modal-header">

                <div class="d-flex align-items-center gap-2">

                    <div class="bg-success bg-opacity-10 rounded p-2">
                        <i class="bi bi-person-gear text-success fs-5"></i>
                    </div>

                    <h5
                        class="modal-title mb-0"
                        id="modalEditarUsuarioLabel">

                        Editar información del usuario

                    </h5>

                </div>

                <button
                    type="button"
                    class="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Cerrar">
                </button>

            </div>


            <!-- Cuerpo -->
            <div class="modal-body">

        


                <!-- Formulario -->
                <form id="formEditarUsuario">

                    <!-- Nombre -->
                    <div class="mb-3">

                        <label
                            for="editarNombreUsuario"
                            class="form-label fw-semibold">

                            Nombre del usuario

                        </label>

                        <div class="input-group">

                            <span class="input-group-text">
                                <i class="bi bi-person"></i>
                            </span>

                            <input
                                type="text"
                                class="form-control"
                                id="editarNombreUsuario"
                                name="nombre_admin"
                                placeholder="Ingrese el nombre del usuario"
                                maxlength="100"
                                required>

                        </div>

                    </div>


                    <!-- Correo -->
                    <div class="mb-3">

                        <label
                            for="editarCorreoUsuario"
                            class="form-label fw-semibold">

                            Correo electrónico

                        </label>

                        <div class="input-group">

                            <span class="input-group-text">
                                <i class="bi bi-envelope"></i>
                            </span>

                            <input
                                type="email"
                                class="form-control"
                                id="editarCorreoUsuario"
                                name="correo"
                                placeholder="Ingrese el correo electrónico"
                                maxlength="100"
                                required>

                        </div>

                    </div>

                    <!-- Rol -->
                    <div class="mb-3">

                        <label
                            for="editarRolUsuario"
                            class="form-label fw-semibold">

                            Rol

                        </label>

                        <div class="input-group">

                            <span class="input-group-text">
                                <i class="bi bi-person-badge"></i>
                            </span>

                            <select
                                class="form-select"
                                id="editarRolUsuario"
                                name="id_rol"
                                required>

                                <option value="">
                                    Seleccione un rol
                                </option>

                                <option value="1">
                                    Administrador
                                </option>

                                <option value="3">
                                    Estandar
                                </option>

                            </select>

                        </div>

                    </div>




                    <!-- Contraseña -->
                    <div class="mb-3">

                        <label
                            for="editarPasswordUsuario"
                            class="form-label fw-semibold">

                            Nueva contraseña

                        </label>

                        <div class="input-group">

                            <span class="input-group-text">
                                <i class="bi bi-lock"></i>
                            </span>

                            <input
                                type="password"
                                class="form-control"
                                id="editarPasswordUsuario"
                                name="password"
                                placeholder="Ingrese una nueva contraseña">

                            <button
                                type="button"
                                class="btn btn-outline-secondary"
                                id="btnMostrarPassword"
                                tabindex="-1">

                                <i class="bi bi-eye"></i>

                            </button>

                        </div>

                        <small class="text-muted">
                            Deja este campo vacío si no deseas cambiar la contraseña.
                        </small>

                    </div>


                    <!-- Confirmar contraseña -->
                    <div class="mb-3">

                        <label
                            for="confirmarPasswordUsuario"
                            class="form-label fw-semibold">

                            Confirmar contraseña

                        </label>

                        <div class="input-group">

                            <span class="input-group-text">
                                <i class="bi bi-lock-fill"></i>
                            </span>

                            <input
                                type="password"
                                class="form-control"
                                id="confirmarPasswordUsuario"
                                name="confirmar_password"
                                placeholder="Confirme la nueva contraseña">

                        </div>

                    </div>

                </form>

            </div>


            <!-- Pie -->
            <div class="modal-footer">

                <button
                    type="button"
                    class="btn btn-back"
                    data-bs-dismiss="modal">

                    <i class="bi bi-x-lg"></i>
                    Cancelar

                </button>

                <button
                    type="button"
                    class="btn btn-success"
                    id="btnGuardarUsuario">

                    <i class="bi bi-check-lg"></i>
                    Guardar cambios

                </button>

            </div>

        </div>

    </div>

</div>