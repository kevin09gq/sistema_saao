<!-- Modal de Previsualización idéntica al Excel / Impresión -->
<div class="modal fade" id="modalPreviewExcel" tabindex="-1" aria-labelledby="modalPreviewExcelLabel" aria-hidden="true">
    <div class="modal-dialog modal-fullscreen modal-dialog-scrollable">
        <div class="modal-content border-0">
            <!-- Barra de Herramientas Superior -->
            <div class="modal-header border-bottom bg-white py-2 px-4 preview-toolbar shadow-sm" style="z-index: 10;">
                <div class="d-flex align-items-center gap-3">
                    <div class="p-2 rounded-3 text-white shadow-sm" style="background: #107c41;">
                        <i class="bi bi-file-earmark-spreadsheet-fill fs-5"></i>
                    </div>
                    <div>
                        <h6 class="modal-title fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                            Vista Previa de Impresión
                            <span class="badge bg-success-subtle text-success border border-success-subtle fw-semibold rounded-pill" style="font-size: 0.75rem;">Horizontal (Carta)</span>
                        </h6>
                        <small class="text-muted" id="previewSubtitle">Generando vista previa...</small>
                    </div>
                </div>

                <div class="d-flex align-items-center gap-2 ms-auto">
                    <!-- Control de Zoom -->
                    <div class="btn-group btn-group-sm me-2 d-none d-md-inline-flex" role="group">
                        <button type="button" class="btn btn-outline-secondary btn-zoom" data-zoom="0.8">80%</button>
                        <button type="button" class="btn btn-outline-secondary btn-zoom active" data-zoom="1">100%</button>
                        <button type="button" class="btn btn-outline-secondary btn-zoom" data-zoom="1.15">115%</button>
                    </div>

                    <!-- Botón Volver a Configurar -->
                    <button type="button" class="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1 px-3" id="btnVolverConfig">
                        <i class="bi bi-sliders"></i>
                        <span class="d-none d-sm-inline">Editar Configuración</span>
                    </button>

                    <!-- Botón Descargar Excel -->
                    <button type="button" class="btn btn-sm text-white d-flex align-items-center gap-1 px-3 fw-semibold" style="background: #107c41;" id="btnDescargarDesdePreview">
                        <i class="bi bi-file-earmark-arrow-down-fill"></i>
                        <span class="d-none d-sm-inline">Descargar .xlsx</span>
                    </button>

                    <button type="button" class="btn-close ms-2" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                </div>
            </div>

            <!-- Canvas de Fondo Limpio (Gris Suave de Oficina) -->
            <div class="modal-body p-4 excel-preview-canvas" style="background: #eef2f6;">
                <div class="d-flex justify-content-center">
                    <!-- Hoja de Papel con Sombras Suaves -->
                    <div class="excel-preview-sheet" id="excelPreviewSheet">
                        <div id="previewTableContainer"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
