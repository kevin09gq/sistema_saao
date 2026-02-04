<!-- Modal de los abonos -->
<div class="modal fade" id="modalAbono" tabindex="-1" aria-labelledby="modalAbonoLabel" aria-hidden="true">
    <div class="modal-dialog modal-xl">
        <div class="modal-content">
            <form method="post" id="form-nuevo-abono">
                <div class="modal-header bg-success text-white">
                    <h1 class="modal-title fs-5" id="modalAbonoLabel">Abonar un pago nuevo</h1>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">

                    <!-- PASO 1: Seleccionar préstamo -->
                    <div id="paso-seleccionar-prestamo">
                        <h5 class="mb-3"><i class="bi bi-1-circle-fill text-success me-2"></i>Selecciona el préstamo a abonar</h5>

                        <div class="table-responsive" style="max-height: 200px; overflow-y: auto;">
                            <table class="table table-hover table-sm">
                                <thead class="table-light sticky-top">
                                    <tr>
                                        <th>Folio</th>
                                        <th class="text-center">Monto</th>
                                        <th class="text-center">Abonado</th>
                                        <th class="text-center">Deuda</th>
                                        <th class="text-center">Rango Plan</th>
                                        <th class="text-center">--</th>
                                    </tr>
                                </thead>
                                <tbody id="tabla-prestamos-activos">
                                    <tr>
                                        <td colspan="6" class="text-center">Cargando préstamos...</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <input type="hidden" id="id_prestamo_seleccionado" name="id_prestamo" required>

                        <div id="prestamo-seleccionado-info" class="alert alert-info mt-3" hidden>
                            <strong>Préstamo seleccionado:</strong> <span id="info-prestamo-seleccionado"></span>
                        </div>
                    </div>

                    <hr class="my-4">

                    <!-- PASO 2: Seleccionar semana del plan -->
                    <div id="paso-seleccionar-semana">
                        <h5 class="mb-3"><i class="bi bi-2-circle-fill text-success me-2"></i>Selecciona la semana a pagar</h5>
                        <p class="text-muted small">Doble clic en una semana <strong class="badge text-bg-secondary">pendiente</strong> para seleccionarla. Debes pagar en orden.</p>

                        <div class="table-responsive" style="max-height: 250px; overflow-y: auto;">
                            <table class="table table-hover table-sm">
                                <thead class="table-light sticky-top">
                                    <tr>
                                        <th class="text-center">Semana</th>
                                        <th class="text-end">Monto</th>
                                        <th class="text-center">Estado</th>
                                    </tr>
                                </thead>
                                <tbody id="tabla-detalle-plan-abono">
                                    <tr>
                                        <td colspan="3" class="text-center text-muted">Selecciona un préstamo primero</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <hr class="my-4">

                    <!-- PASO 3: Datos del abono -->
                    <div id="paso-datos-abono">
                        <h5 class="mb-3"><i class="bi bi-3-circle-fill text-success me-2"></i>Datos del abono</h5>

                        <div class="row g-2">
                            <div class="col-12 col-md-4 mb-3">
                                <label for="monto_pago" class="form-label">Monto a abonar $</label>
                                <input type="number" step="0.01" class="form-control form-control-lg shadow-sm" id="monto_pago" name="monto_pago" placeholder="Monto a abonar" readonly required>
                            </div>

                            <div class="col-12 col-md-4 mb-3">
                                <label for="semana_pago" class="form-label">Semana de pago</label>
                                <input type="number" class="form-control form-control-lg shadow-sm" id="semana_pago" name="semana_pago" readonly required>
                            </div>

                            <div class="col-12 col-md-4 mb-3">
                                <label for="anio_pago" class="form-label">Año de pago</label>
                                <input type="number" class="form-control form-control-lg shadow-sm" id="anio_pago" name="anio_pago" readonly required>
                            </div>

                            <div class="col-12 col-md-6 mb-3">
                                <label for="fecha_pago" class="form-label">Fecha de pago</label>
                                <input type="date" class="form-control form-control-lg shadow-sm" id="fecha_pago" name="fecha_pago" value="<?= date('Y-m-d') ?>" required>
                            </div>

                            <div class="col-12 col-md-3 mb-3 d-flex align-items-end">
                                <div class="form-check">
                                    <input class="form-check-input" type="checkbox" id="es_nomina" value="es_nomina" name="es_nomina" checked>
                                    <label class="form-check-label" for="es_nomina">Aplicar Nómina</label>
                                </div>
                            </div>

                            <div class="col-12 col-md-3 mb-3 d-flex align-items-end">
                                <div class="form-check form-check-inline">
                                    <input class="form-check-input" type="checkbox" id="pausar_semana" value="1" name="pausar_semana">
                                    <label class="form-check-label" for="pausar_semana">Pausar semana</label>
                                </div>
                            </div>

                            <!-- Campo de clave de autorización para Tesorería -->
                            <div class="col-12 mb-3" id="contenedor-clave-autorizacion" hidden>
                                <label for="clave_autorizacion" class="form-label">
                                    <i class="bi bi-shield-lock text-warning"></i> Clave de Autorización (Tesorería)
                                </label>
                                <input type="password" class="form-control form-control-lg shadow-sm" id="clave_autorizacion" name="clave_autorizacion" placeholder="Ingrese la clave de autorización">
                                <small class="text-muted">Se requiere autorización de personal autorizado para abonos en Tesorería.</small>
                            </div>

                            <div class="col-12" id="contenedor-observacion-pago" hidden>
                                <label for="observacion_pago" class="form-label">Motivo de la pausa</label>
                                <textarea class="form-control shadow-sm" name="observacion_pago" id="observacion_pago" rows="3" placeholder="Escribe el motivo de la pausa..."></textarea>
                            </div>
                        </div>
                    </div>

                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                    <button type="submit" class="btn btn-success" id="btn-guardar-abono" disabled>
                        <i class="bi bi-save2-fill me-2"></i>Guardar Abono
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>