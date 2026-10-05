<div class="modal fade" id="modalNuevoUsuario" tabindex="-1" aria-labelledby="modalNuevoUsuarioLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">

            <!-- Encabezado -->
            <div class="modal-header">
                <div class="d-flex align-items-center gap-2">
                    <div class="bg-success bg-opacity-10 rounded p-2">
                        <i class="bi bi-person-plus text-success fs-5"></i>
                    </div>

                    <h5 class="modal-title mb-0" id="modalNuevoUsuarioLabel">
                        Nuevo usuario
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

                <form id="formNuevoUsuario">

                    <!-- Nombre -->
                    <div class="mb-3">
                        <label for="nuevoNombreUsuario" class="form-label fw-semibold">
                            Nombre del usuario
                        </label>

                        <div class="input-group">
                            <span class="input-group-text">
                                <i class="bi bi-person"></i>
                            </span>

                            <input
                                type="text"
                                class="form-control"
                                id="nuevoNombreUsuario"
                                name="nombre_admin"
                                placeholder="Ingrese el nombre del usuario"
                                maxlength="100"
                                required>
                        </div>
                    </div>

                    <!-- Correo -->
                    <div class="mb-3">
                        <label for="nuevoCorreoUsuario" class="form-label fw-semibold">
                            Correo electrónico
                        </label>

                        <div class="input-group">
                            <span class="input-group-text">
                                <i class="bi bi-envelope"></i>
                            </span>

                            <input
                                type="email"
                                class="form-control"
                                id="nuevoCorreoUsuario"
                                name="correo"
                                placeholder="Ingrese el correo electrónico"
                                maxlength="100"
                                required>
                        </div>
                    </div>

                    <!-- Rol -->
                    <div class="mb-3">
                        <label for="nuevoRolUsuario" class="form-label fw-semibold">
                            Rol
                        </label>

                        <div class="input-group">
                            <span class="input-group-text">
                                <i class="bi bi-person-badge"></i>
                            </span>

                            <select
                                class="form-select"
                                id="nuevoRolUsuario"
                                name="id_rol"
                                required>

                                <option value="">
                                    Seleccione un rol
                                </option>

                                <option value="1">
                                    Administrador
                                </option>


                                <option value="3">
                                    Estándar
                                </option>

                            </select>
                        </div>
                    </div>

                    <!-- Contraseña -->
                    <div class="mb-3">
                        <label for="nuevoPasswordUsuario" class="form-label fw-semibold">
                            Contraseña
                        </label>

                        <div class="input-group">
                            <span class="input-group-text">
                                <i class="bi bi-lock"></i>
                            </span>

                            <input
                                type="password"
                                class="form-control"
                                id="nuevoPasswordUsuario"
                                name="password"
                                placeholder="Ingrese una contraseña"
                                required>

                            <button
                                type="button"
                                class="btn btn-outline-secondary"
                                id="btnMostrarPasswordNuevo">

                                <i class="bi bi-eye"></i>

                            </button>
                        </div>
                    </div>

                    <!-- Confirmar contraseña -->
                    <div class="mb-3">
                        <label for="nuevoConfirmarPasswordUsuario" class="form-label fw-semibold">
                            Confirmar contraseña
                        </label>

                        <div class="input-group">
                            <span class="input-group-text">
                                <i class="bi bi-lock-fill"></i>
                            </span>

                            <input
                                type="password"
                                class="form-control"
                                id="nuevoConfirmarPasswordUsuario"
                                name="confirmar_password"
                                placeholder="Confirme la contraseña"
                                required>

                            <button
                                type="button"
                                class="btn btn-outline-secondary"
                                id="btnMostrarConfirmarPasswordNuevo">

                                <i class="bi bi-eye"></i>

                            </button>
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
                    id="btnGuardarNuevoUsuario">

                    <i class="bi bi-check-lg"></i>
                    Crear usuario

                </button>

            </div>

        </div>
    </div>
</div>