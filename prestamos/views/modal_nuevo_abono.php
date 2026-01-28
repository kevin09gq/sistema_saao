<!-- Modal de los abonos -->
<div class="modal fade" id="modalAbono" tabindex="-1" aria-labelledby="modalAbonoLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <form method="post" id="form-nuevo-abono">
                <div class="modal-header bg-success text-white">
                    <h1 class="modal-title fs-5" id="modalAbonoLabel">Abonar</h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="row g-2">
                        <div class="col-12 col-md-6 mb-3">
                            <label for="monto_pago" class="form-label">Monto a abonar $</label>
                            <input type="number" class="form-control form-control-lg shadow-sm" id="monto_pago" name="monto_pago" placeholder="Monto a abonar" required>
                        </div>
                        <div class="col-12 col-md-6 mb-3">
                            <label for="fecha_pago" class="form-label">Fecha de pago</label>
                            <input type="date" class="form-control form-control-lg shadow-sm" id="fecha_pago" name="fecha_pago" value="<?= date('Y-m-d') ?>" required>
                        </div>
                        <div class="col-12 col-md-6 mb-3">
                            <label for="semana_pago" class="form-label">Semana de pago</label>
                            <select class="form-select form-select-lg shadow-sm" name="semana_pago" id="semana_pago">

                                <?php for ($i = 1; $i <= 52; $i++) : ?>
                                    <option <?= ($i == date("W")) ? 'selected' : ''; ?> value="<?= $i ?>">Semana <?= $i ?></option>
                                <?php endfor; ?>

                            </select>

                        </div>

                        <div class="col-12 col-md-6 mb-3">
                            <label for="anio_pago" class="form-label">Año de pago</label>
                            <select class="form-select form-select-lg shadow-sm" name="anio_pago" id="anio_pago">

                                <?php for ($i = 2024; $i <= (date("Y") + 1); $i++) : ?>
                                    <option <?= ($i == date("Y")) ? 'selected' : ''; ?> value="<?= $i ?>"><?= $i ?></option>
                                <?php endfor; ?>

                            </select>
                        </div>

                        <div class="col-12 col-md-6 mb-3">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="es_nomina" value="es_nomina" name="es_nomina" checked>
                                <label class="form-check-label" for="es_nomina">Aplicar Nomina</label>
                            </div>
                        </div>

                        <div class="col-12 col-md-6 mb-3">
                            <div class="form-check form-check-inline">
                                <input class="form-check-input" type="checkbox" id="pausar_semana" value="1" name="pausar_semana">
                                <label class="form-check-label" for="pausar_semana">Pausar pago en semana</label>
                            </div>
                        </div>

                        <div class="col-12" id="contenedor-observacion-pago" hidden>
                            <label for="observacion_pago" class="form-label">Observacion</label>
                            <textarea class="form-control shadow-sm" name="observacion_pago" id="observacion_pago" rows="3" placeholder="Escribe una observacion..."></textarea>
                        </div>


                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-outline-secondary me-auto" id="btn-ver-modal-seleccionar-plan">
                        Ver Plan
                    </button>
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                    <button type="submit" class="btn btn-success">Guardar</button>
                </div>
            </form>
        </div>
    </div>
</div>