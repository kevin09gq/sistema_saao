<div class="modal fade" id="modalModulosPermisos" tabindex="-1" aria-hidden="true">

    <div class="modal-dialog modal-xl modal-dialog-scrollable">

        <div class="modal-content">

            <!-- ENCABEZADO -->
            <div class="modal-header">

                <h5 class="modal-title">
                    <i class="bi bi-shield-lock me-2"></i>
                    Módulos y permisos
                </h5>

                <button type="button"
                        class="btn-close"
                        data-bs-dismiss="modal">
                </button>

            </div>


            <!-- CONTENIDO -->
            <div class="modal-body">

                <div class="row">

                    <!-- ========================= -->
                    <!-- LISTA DE MÓDULOS -->
                    <!-- ========================= -->
                    <div class="col-md-4 border-end">

                        <h6 class="mb-3">
                            Módulos
                        </h6>

                        <div id="listaModulos">

                            <div class="text-center py-4">

                                <div class="spinner-border"
                                     role="status">
                                </div>

                                <p class="text-muted mt-2 mb-0">
                                    Cargando módulos...
                                </p>

                            </div>

                        </div>

                    </div>


                    <!-- ========================= -->
                    <!-- LISTA DE PERMISOS -->
                    <!-- ========================= -->
                    <div class="col-md-8">

                        <div id="tituloModuloPermisos">

                            <h6 class="mb-3">
                                Selecciona un módulo
                            </h6>

                            <p class="text-muted">
                                Selecciona un módulo de la izquierda
                                para visualizar sus permisos.
                            </p>

                        </div>


                        <div id="listaPermisosModulo">

                        </div>

                    </div>

                </div>

            </div>


            <!-- PIE -->
            <div class="modal-footer">

                <button type="button"
                        class="btn btn-secondary"
                        data-bs-dismiss="modal">

                    Cerrar

                </button>

            </div>

        </div>

    </div>

</div>