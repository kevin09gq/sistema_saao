<!-- ==========================================================================
     MODAL: ACTUALIZAR LOGO DEL ÁREA
     Descripción: Modal para visualizar y actualizar el logo del área
     seleccionada, siguiendo el mismo patrón y estilo que empresas
     ========================================================================== -->
<div
    class="modal fade"
    id="modalActualizarLogoArea"
    tabindex="-1"
    aria-labelledby="modalActualizarLogoAreaLabel"
    aria-hidden="true">

    <div class="modal-dialog modal-dialog-centered">

        <div class="modal-content">

            <!-- ========================================= -->
            <!-- ENCABEZADO -->
            <!-- ========================================= -->
            <div class="modal-header">

                <h5 class="modal-title" id="modalActualizarLogoAreaLabel">
                    <i class="bi bi-camera me-2 text-success"></i>
                    Logo del área
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

                <form id="formActualizarLogoArea" enctype="multipart/form-data">

                    <!-- ========================================= -->
                    <!-- VISTA PREVIA Y SUBIDA DE LOGO -->
                    <!-- ========================================= -->
                    <div class="card border-0 bg-light">

                        <div class="card-body">

                            <h6 class="fw-bold text-secondary mb-3">
                                <i class="bi bi-image me-2"></i>
                                Logotipo del área
                            </h6>

                            <!-- Vista previa del logotipo / avatar -->
                            <div class="d-flex justify-content-center mb-4">
                                <div
                                    id="contenedorPreviewLogoAreaModal"
                                    class="avatar-modal-preview">
                                    <!-- Aquí se inyecta la imagen o las iniciales -->
                                </div>
                            </div>

                            <!-- Selector de archivo -->
                            <div>
                                <label
                                    for="inputLogoArea"
                                    class="form-label fw-semibold">
                                    Seleccionar nueva imagen
                                </label>

                                <input
                                    type="file"
                                    id="inputLogoArea"
                                    name="logo"
                                    accept="image/jpeg,image/png,image/webp,image/gif"
                                    class="form-control">

                                <div class="form-text text-muted">
                                    Formatos permitidos: <strong>JPG, PNG, WEBP, GIF</strong> (Máximo 5 MB).
                                </div>
                            </div>

                        </div>

                    </div>

                </form>

            </div>

            <!-- ========================================= -->
            <!-- PIE DE MODAL -->
            <!-- ========================================= -->
            <div class="modal-footer">

                <button
                    type="button"
                    class="btn btn-secondary btn-sm"
                    data-bs-dismiss="modal">
                    <i class="bi bi-x-lg me-1"></i> Cerrar
                </button>

                <button
                    type="button"
                    id="btnGuardarLogoArea"
                    class="btn btn-success btn-sm">
                    <i class="bi bi-floppy me-1"></i> Guardar Logo
                </button>

            </div>

        </div>

    </div>

</div>
