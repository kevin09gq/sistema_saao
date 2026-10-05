<!-- Modal Gestión de Permisos -->
<div
    class="modal fade"
    id="modalPermisos"
    tabindex="-1"
    aria-labelledby="modalPermisosLabel"
    aria-hidden="true">

    <div class="modal-dialog modal-xl modal-dialog-scrollable">

        <div class="modal-content">

            <!-- Encabezado -->
            <div class="modal-header">

                <div class="d-flex align-items-center gap-2">
                    <div class="bg-success bg-opacity-10 rounded p-2">
                        <i class="bi bi-shield-check text-success fs-5"></i>
                    </div>
                    <h5 class="modal-title mb-0" id="modalPermisosLabel">
                        Gestión de Permisos
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

                <!-- Información del usuario -->
                <div class="card border-0 bg-light mb-4">

                    <div class="card-body">

                        <div class="d-flex align-items-center gap-3">

                            <div class="avatar-iniciales" id="inicialesUsuarioPermisos"></div>

                            <div>
                                <h6 class="mb-0 fw-semibold" id="nombreUsuarioPermisos"></h6>
                                <small class="text-muted" id="datosUsuarioPermisos"></small>
                            </div>

                        </div>

                    </div>

                </div>

                <!-- Contenedor de permisos dinámicos -->
                <div id="contenedorPermisos"></div>

            </div>


            <!-- Pie -->
            <div class="modal-footer">

                <button
                    type="button"
                    class="btn btn-back"
                    data-bs-dismiss="modal">
                    <i class="bi bi-x-lg"></i> Cancelar
                </button>

                <button
                    type="button"
                    class="btn btn-success"
                    id= "btnGuardarPermisos">
                    <i class="bi bi-check-lg"></i> Guardar cambios
                </button>

            </div>

        </div>

    </div>

</div>
