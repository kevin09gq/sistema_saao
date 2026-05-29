<!-- Modal Calendario -->
<div class="modal fade" id="modalCalendario" tabindex="-1" aria-labelledby="modalCalendarioLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="modalCalendarioLabel">
                    <i class="bi bi-calendar3"></i> Calendario de Festividades
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <div class="calendar-wrapper">
                    <div class="calendar-header" style="display: flex; justify-content: space-between; align-items: center;">
                        <button class="btn btn-sm btn-outline-success" onclick="cambiarMesModalModal(-1)" title="Mes Anterior" style="border: none; background: transparent; cursor: pointer;">
                            <i class="bi bi-chevron-left"></i>
                        </button>
                        <div class="calendar-month">Mayo 2026</div>
                        <button class="btn btn-sm btn-outline-success" onclick="cambiarMesModalModal(1)" title="Mes Siguiente" style="border: none; background: transparent; cursor: pointer;">
                            <i class="bi bi-chevron-right"></i>
                        </button>
                    </div>
                    <div class="calendar-grid">
                        <!-- Se generará dinámicamente -->
                    </div>
                    <div class="calendar-legend">
                        <div class="legend-item">
                            <div class="legend-color" style="background: #f59e0b;"></div> Festivos
                        </div>
                        <div class="legend-item">
                            <div class="legend-color" style="background: #8b5cf6;"></div> Aniversario
                        </div>
                        <div class="legend-item">
                            <div class="legend-color" style="background: #c084fc; border: 1px dashed #7c3aed;"></div> Próx. Aniversario
                        </div>
                        <div class="legend-item">
                            <div class="legend-color" style="border: 2px solid var(--accent-green);"></div> Hoy
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

