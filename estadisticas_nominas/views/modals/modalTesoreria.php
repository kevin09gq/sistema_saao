<!-- Modal para Selección de Año y Semana de Tesorería -->
<div class="modal fade" id="modalTesoreria" tabindex="-1" aria-labelledby="modalTesoreriaLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
            <div class="modal-header bg-success text-white">
                <h5 class="modal-title fs-6 fw-bold" id="modalTesoreriaLabel">
                    <i class="bi bi-file-earmark-excel me-2"></i>Exportar Nómina para Tesorería
                </h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div class="modal-body p-4">
                <p class="text-muted small mb-3">
                    Selecciona el año y la semana de la nómina para obtener la información consolidada.
                </p>

                <form id="form_modal_tesoreria" onsubmit="return false;">
                    <div class="mb-3">
                        <label for="modal_tesoreria_anio" class="form-label fw-semibold text-secondary small">
                            <i class="bi bi-calendar3 me-1 text-success"></i>Año
                        </label>
                        <select id="modal_tesoreria_anio" class="form-select shadow-none">
                            <option value="">Seleccione un año...</option>
                        </select>
                    </div>

                    <div class="mb-3">
                        <label for="modal_tesoreria_semana" class="form-label fw-semibold text-secondary small">
                            <i class="bi bi-calendar-week me-1 text-success"></i>Semana
                        </label>
                        <select id="modal_tesoreria_semana" class="form-select shadow-none" disabled>
                            <option value="">Seleccione primero un año...</option>
                        </select>
                    </div>
                </form>
            </div>
            <div class="modal-footer bg-light py-2 px-3 border-top-0">
                <button type="button" class="btn btn-outline-secondary btn-sm px-3" data-bs-dismiss="modal">
                    <i class="bi bi-x-circle me-1"></i>Cancelar
                </button>
                <button type="button" class="btn btn-success btn-sm px-3" id="btn_obtener_info_tesoreria" disabled>
                    <i class="bi bi-cloud-arrow-down me-1"></i>Obtener Información
                </button>
            </div>
        </div>
    </div>
</div>
