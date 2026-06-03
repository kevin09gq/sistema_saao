<!-- Modal Calendario -->
<div class="modal fade" id="modalCalendario" tabindex="-1" aria-labelledby="modalCalendarioLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="modalCalendarioLabel">
                    <i class="bi bi-calendar3"></i> Calendario General de Aniversarios
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <div class="calendar-wrapper">
                    <div class="calendar-header" style="display: flex; justify-content: space-between; align-items: center;">
                        <button class="btn btn-sm btn-outline-secondary py-0" id="btnMesAnteriorGeneral" title="Mes Anterior">
                            <i class="bi bi-chevron-left"></i>
                        </button>
                        <div class="calendar-month" id="calendarMonthGeneral">Cargando...</div>
                        <button class="btn btn-sm btn-outline-secondary py-0" id="btnMesSiguienteGeneral" title="Mes Siguiente">
                            <i class="bi bi-chevron-right"></i>
                        </button>
                    </div>
                    <div class="calendar-grid" id="calendarGridGeneral">
                        <!-- Se generará dinámicamente -->
                    </div>
                    <div class="calendar-legend d-flex flex-wrap gap-2 mt-3" style="font-size: 0.72rem; color: #64748b;">
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
                            <div class="legend-color" style="border: 2px solid #22c55e;"></div> Hoy
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
