<!-- Modal -->
<div class="modal fade" id="modal_configuracion" tabindex="-1" aria-labelledby="modalConfiguracionLabel" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
    <div class="modal-dialog modal-dialog-scrollable modal-dialog-centered modal-xl">
        <div class="modal-content">
            <div class="modal-header bg-success text-white">
                <h1 class="modal-title fs-5" id="modalConfiguracionLabel">Cargar archivos de Raya</h1>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">

                <!-- Cuerpo para subir archivos -->
                <div class="card shadow-lg border-0" id="cuerpo_form_subir_archivos">
                    <div class="card-header bg-white py-4 border-bottom-0">
                        <div class="d-flex align-items-center">
                            <div class="icon-box bg-primary bg-opacity-10 p-3 rounded-3 me-3">
                                <i class="bi bi-cloud-arrow-up text-primary fs-3"></i>
                            </div>
                            <div>
                                <h5 class="mb-0 fw-bold text-dark">Panel de Importación</h5>
                                <small class="text-muted">Formatos admitidos: <span class="badge bg-light text-dark border">.xlsx</span></small>
                            </div>
                        </div>
                    </div>

                    <div class="card-body p-4">
                        <form method="post" id="form_subir_archivos_raya" enctype="multipart/form-data">

                            <div class="mb-4">
                                <h6 class="text-uppercase text-primary fw-bold small mb-3 tracking-wider">
                                    <i class="bi bi-cash-stack me-2"></i>Listas de Raya (Nóminas)
                                </h6>
                                <div class="row g-3">
                                    <div class="col-md-6">
                                        <div class="p-3 border rounded-3 bg-light bg-opacity-50 transition-hover h-100">
                                            <label for="archivo_lista_raya" class="form-label d-flex align-items-center fw-semibold">
                                                <i class="bi bi-file-earmark-spreadsheet me-2 text-success"></i>
                                                Periodo extraordinario Citricos SAAO
                                            </label>
                                            <p class="text-muted mb-2" style="font-size: 0.75rem;">Cargar montos principales de SAAO.</p>
                                            <input accept=".xls, .xlsx" class="form-control form-control-sm border-dashed shadow-sm" type="file" id="archivo_lista_raya" name="archivo_lista_raya">
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="p-3 border rounded-3 bg-light bg-opacity-50 transition-hover h-100">
                                            <label border-dashed for="archivo_lista_raya_sb" class="form-label d-flex align-items-center fw-semibold">
                                                <i class="bi bi-file-earmark-spreadsheet-fill me-2 text-success"></i>
                                                Periodo extraordinario SB CITRIC'S
                                            </label>
                                            <p class="text-muted mb-2" style="font-size: 0.75rem;">Cargar montos principales de SB.</p>
                                            <input accept=".xls, .xlsx" class="form-control form-control-sm border-dashed shadow-sm" type="file" id="archivo_lista_raya_sb" name="archivo_lista_raya_sb">
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <hr class="my-4 text-secondary opacity-25">

                            <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                                <button type="reset" class="btn btn-light px-4 me-md-2 border text-secondary">
                                    <i class="bi bi-arrow-counterclockwise me-2"></i>Reiniciar
                                </button>
                                <button type="submit" class="btn btn-primary px-5 fw-bold shadow-sm">
                                    <i class="bi bi-gear-fill me-2"></i>Procesar Información
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                <style>
                    .border-dashed {
                        border-style: dashed !important;
                        border-width: 2px !important;
                        background-color: #ffffff;
                    }

                    .transition-hover {
                        transition: all 0.25s ease-in-out;
                    }

                    .transition-hover:hover {
                        background-color: #ffffff !important;
                        border-color: #0d6efd !important;
                        transform: translateY(-2px);
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
                    }

                    .tracking-wider {
                        letter-spacing: 0.05rem;
                    }

                    .icon-box {
                        width: 50px;
                        height: 50px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                    }
                </style>

            </div>
        </div>
    </div>
</div>