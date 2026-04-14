<!-- Modal para eventos de horarios variables (descanso/festivo) -->
<!-- Este modal se abre desde el modal de horarios variables -->
<style>
    /* Z-index mayor para que aparezca sobre el modal de horarios */
    #eventosHorarioVariableModal {
        z-index: 1060 !important;
    }

    #eventosHorarioVariableModal+.modal-backdrop {
        z-index: 1055 !important;
    }
</style>
<div class="modal fade" id="eventosHorarioVariableModal" tabindex="-1" aria-labelledby="eventosHorarioVariableModalLabel" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">

            <form method="post" id="form-eventos-horario-variable">
                <div class="modal-header bg-primary text-white">
                    <h1 class="modal-title fs-5" id="eventosHorarioVariableModalLabel">Seleccionar evento del día</h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>

                <div class="modal-body px-5 bg-body-tertiary">
                    <p class="text-muted mb-3">Seleccione el tipo de evento para este día:</p>

                    <div class="form-check mb-3">
                        <input class="form-check-input fs-4" type="radio" name="tipoEventoHorarioVariable" id="evento_descanso" value="descanso">
                        <label class="form-check-label fs-4" for="evento_descanso">
                            🏠 Descanso
                        </label>
                    </div>

                    <div class="form-check mb-3">
                        <input class="form-check-input fs-4" type="radio" name="tipoEventoHorarioVariable" id="evento_festivo" value="dia_festivo">
                        <label class="form-check-label fs-4" for="evento_festivo">
                            🎉 Día Festivo
                        </label>
                    </div>

                    <div class="form-check">
                        <input class="form-check-input fs-4" type="radio" name="tipoEventoHorarioVariable" id="evento_ninguno" value="">
                        <label class="form-check-label fs-4" for="evento_ninguno">
                            ❌​ Ninguno
                        </label>
                    </div>
                </div>

                <div class="modal-footer bg-body-tertiary">
                    <button type="button" class="btn btn-secondary shadow-sm" data-bs-dismiss="modal">Cerrar</button>
                    <button type="button" class="btn btn-primary shadow-sm" id="btn-guardar-evento-horario-variable">Aplicar</button>
                </div>
            </form>

        </div>
    </div>
</div>

<script>
    document.addEventListener('DOMContentLoaded', function() {
        const eventosModal = document.getElementById('eventosHorarioVariableModal');
        const horariosModal = document.getElementById('horariosModal');

        eventosModal.addEventListener('show.bs.modal', function() {
            horariosModal.querySelector('.modal-content').style.opacity = '0.4';
            horariosModal.querySelector('.modal-content').style.pointerEvents = 'none';
        });

        eventosModal.addEventListener('hidden.bs.modal', function() {
            horariosModal.querySelector('.modal-content').style.opacity = '1';
            horariosModal.querySelector('.modal-content').style.pointerEvents = 'auto';
        });
    });
</script>