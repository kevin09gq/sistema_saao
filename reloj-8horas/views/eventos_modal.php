<!-- Modal -->
<div class="modal fade modal-eventos" id="eventosModal" tabindex="-1" aria-labelledby="eventosModalLabel" aria-hidden="true" data-bs-backdrop="static" data-bs-keyboard="false">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content px-5 bg-body-tertiary">

            <form method="post" id="form-eventos-empleados">
                <div class="modal-header">
                    <h1 class="modal-title fs-5" id="eventosModalLabel">Eventos del empleado</h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>

                <div class="modal-body">
                    <div class="form-check">
                        <input class="form-check-input fs-4 shadow-sm" type="radio" name="tipoEvento" id="dia_festivo" value="dia_festivo">
                        <label class="form-check-label fs-4" for="dia_festivo">
                            🎉 Festivo
                        </label>
                    </div>

                    <div class="form-check">
                        <input class="form-check-input fs-4 shadow-sm" type="radio" name="tipoEvento" id="vacaciones" value="vacaciones">
                        <label class="form-check-label fs-4" for="vacaciones">
                            🏖️ Vacación
                        </label>
                    </div>

                    <div class="form-check">
                        <input class="form-check-input fs-4 shadow-sm" type="radio" name="tipoEvento" id="incapacidad" value="incapacidad">
                        <label class="form-check-label fs-4" for="incapacidad">
                            😷​ Incapacidad
                        </label>
                    </div>

                    <div class="form-check">
                        <input class="form-check-input fs-4 shadow-sm" type="radio" name="tipoEvento" id="inasistencia" value="inasistencia">
                        <label class="form-check-label fs-4" for="inasistencia">
                            ​🚫​ Ausencia
                        </label>
                    </div>

                    <div class="form-check">
                        <input class="form-check-input fs-4 shadow-sm" type="radio" name="tipoEvento" id="no_laboro" value="no_laboro">
                        <label class="form-check-label fs-4" for="no_laboro">
                            ​🏠​​ No laboró
                        </label>
                    </div>

                    <div class="form-check">
                        <input class="form-check-input fs-4 shadow-sm" type="radio" name="tipoEvento" id="descanso" value="descanso">
                        <label class="form-check-label fs-4" for="descanso">
                            ​😴​ Descanso
                        </label>
                    </div>

                    <div class="form-check">
                        <input class="form-check-input fs-4 shadow-sm" type="radio" name="tipoEvento" id="asistencia" value="asistencia">
                        <label class="form-check-label fs-4" for="asistencia">
                            ✅ Asistencia
                        </label>
                    </div>

                </div>

                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                    <button type="button" class="btn btn-primary" id="btn-guardar-evento">Guardar</button>
                </div>
            </form>

        </div>
    </div>
</div>