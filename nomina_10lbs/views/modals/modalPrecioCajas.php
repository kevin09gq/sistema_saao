<!-- Modal para gestionar los precios de las cajas -->
<div class="modal fade" id="modalPrecioCajas" tabindex="-1" aria-labelledby="modalPrecioCajasLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow-lg" style="border-radius: 20px; overflow: hidden;">
            <div class="modal-header header-gradient-saao p-4">
                <div class="d-flex align-items-center">
                    <div class="bg-white rounded-circle p-2 me-3 shadow-sm d-flex justify-content-center align-items-center" style="width: 50px; height: 50px;">
                        <i class="bi bi-box-seam text-primary fs-4"></i>
                    </div>
                    <div>
                        <h5 class="modal-title fw-bold mb-0 modal-title-saao" id="modalPrecioCajasLabel">Configuración de Catálogo</h5>
                        <p class="small mb-0 modal-subtitle-saao">Gestione la visibilidad e identificación de cajas</p>
                    </div>
                </div>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover mb-0 align-middle">
                        <thead class="bg-light text-secondary text-uppercase small fw-bold">
                            <tr>
                                <th class="ps-4 py-3">Caja / Valor</th>
                                <th class="text-center py-3">Precio Base</th>
                                <th class="text-center py-3">Color Distintivo</th>
                                <th class="text-center py-3 pe-4">Activo</th>
                            </tr>
                        </thead>
                        <tbody id="tbody_precios_edicion" class="border-top-0">
                            <!-- Se cargará mediante JS -->
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="modal-footer border-top-0 p-4">
                <button type="button" class="btn btn-light fw-bold px-4" data-bs-dismiss="modal">Cerrar</button>
                <button type="button" class="btn btn-primary fw-bold px-4" id="btn_guardar_precios_cajas">
                    <i class="bi bi-check-circle me-2"></i>Guardar cambios
                </button>
            </div>
        </div>
    </div>
</div>

<style>
.header-gradient-saao {
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
    border-bottom: 1px solid #bae6fd;
}
.modal-title-saao {
    color: #0369a1;
}
.modal-subtitle-saao {
    color: #0ea5e9;
}
.color-picker-simple {
    width: 38px;
    height: 38px;
    padding: 0;
    border: 2px solid #e2e8f0;
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    background: #fff;
}
.color-picker-simple:hover {
    transform: scale(1.1);
    border-color: #38bdf8;
    box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}
.precio-badge {
    background: #f0fdf4;
    color: #15803d;
    font-weight: 700;
    padding: 0.5rem 1rem;
    border-radius: 12px;
    border: 1px solid #dcfce7;
    font-size: 0.95rem;
}
.caja-icon-container {
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
    color: #64748b;
}
</style>
