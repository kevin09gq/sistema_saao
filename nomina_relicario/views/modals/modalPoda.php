<div class="modal fade" id="modalPoda" tabindex="-1" aria-labelledby="modalPodaLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-xl">
        <div class="modal-content">

            <div class="modal-header bg-light">
                <h1 class="modal-title fs-5" id="modalPodaLabel text-uppercase"><i class="bi bi-tree-fill me-2 text-success"></i>Poda de Árboles - RANCHO EL RELICARIO</h1>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>

            <div class="modal-body">
                <ul class="nav nav-tabs mb-4" id="podaTab" role="tablist">
                    <li class="nav-item" role="presentation">
                        <button class="nav-link active fw-bold" id="poda-tab" data-bs-toggle="tab" data-bs-target="#pane-poda" type="button" role="tab">Poda</button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link fw-bold" id="extra-tab" data-bs-toggle="tab" data-bs-target="#pane-extra" type="button" role="tab">Extra</button>
                    </li>
                </ul>

                <div class="tab-content" id="podaTabContent">

                    <div class="tab-pane fade show active" id="pane-poda" role="tabpanel" aria-labelledby="poda-tab">
                        <form method="post" id="form_poda">
                            <div class="bg-light p-3 rounded border border-3 mb-4">

                                <h6 class="fw-bolder text-uppercase">Poda de Árboles</h6>

                                <div class="row g-3">
                                    <div class="col-md-4">
                                        <label class="form-label">Nombre del Cabo</label>
                                        <input type="text" class="form-control shadow-sm" name="nombre_cabo_poda" id="nombre_cabo_poda" placeholder="Nombre completo">
                                    </div>
                                    <div class="col-md-2">
                                        <label class="form-label">Día de Poda</label>
                                        <select class="form-select shadow-sm" name="dia_semana_poda" id="dia_semana_poda">
                                            <option value="" selected>Seleccionar...</option>
                                            <?php foreach (DIAS_SEMANA_NOMINA as $dia) : ?>
                                                <option value="<?= $dia ?>"><?= $dia ?></option>
                                            <?php endforeach; ?>
                                        </select>
                                    </div>
                                    <div class="col-md-3">
                                        <label class="form-label">Fecha de Poda</label>
                                        <input type="date" class="form-control bg-light" name="fecha_poda" id="fecha_poda" value="" readonly>
                                    </div>
                                    <div class="col-md-3">
                                        <label class="form-label">Día extra (Opcional)</label>
                                        <div class="input-group mb-3">
                                            <div class="input-group-text">
                                                <input class="form-check-input mt-0" type="checkbox" id="usar_dia_extra">
                                            </div>
                                            <input type="date" class="form-control" name="fecha_dia_extra" id="fecha_dia_extra" disabled>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="bg-light p-3 rounded border border-3">
                                <div class="row g-3">

                                    <div class="col-md-2">
                                        <label class="form-label">Pago por árbol</label>
                                        <div class="input-group">
                                            <span class="input-group-text">$</span>
                                            <input type="number" step="0.01" class="form-control" name="pago_arbol" id="pago_arbol" placeholder="0.00">
                                        </div>
                                    </div>
                                    <div class="col-md-3">
                                        <label class="form-label">Árboles podados</label>
                                        <input type="number" class="form-control" name="cantidad_arboles" id="cantidad_arboles" placeholder="Cant.">
                                    </div>
                                    <div class="col-md-3">
                                        <label class="form-label fw-bold text-primary">Total a Pagar</label>
                                        <div class="input-group">
                                            <span class="input-group-text">$</span>
                                            <input type="text" class="form-control fw-bold" name="total_calculado" id="total_calculado" readonly placeholder="0.00">
                                        </div>
                                    </div>
                                </div>
                            </div>


                            <div class="text-end mt-4">
                                <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">Cerrar</button>
                                <button type="submit" class="btn btn-success px-4"><i class="bi bi-save me-2"></i>Guardar Poda</button>
                            </div>
                        </form>
                    </div>

                    <div class="tab-pane fade" id="pane-extra" role="tabpanel" aria-labelledby="extra-tab">
                        <form method="post" id="form_extra">
                            <div class="row g-3">
                                <div class="col-md-4">
                                    <label class="form-label">Nombre del Cabo</label>
                                    <input type="text" class="form-control shadow-sm" name="extra_nombre_cabo" id="extra_nombre_cabo" placeholder="Nombre completo" >
                                </div>
                                <div class="col-md-5">
                                    <label class="form-label">Concepto</label>
                                    <input type="text" class="form-control shadow-sm" name="extra_concepto" id="extra_concepto" placeholder="Ej. Bono, Limpieza, etc." >
                                </div>
                                <div class="col-md-3">
                                    <label class="form-label">Día</label>
                                    <select class="form-select shadow-sm" name="extra_dia" id="extra_dia" >
                                        <option value="" selected>Seleccionar...</option>
                                        <?php foreach (DIAS_SEMANA_NOMINA as $dia) : ?>
                                            <option value="<?= $dia ?>"><?= $dia ?></option>
                                        <?php endforeach; ?>
                                    </select>
                                </div>
                                <div class="col-md-3">
                                    <label class="form-label">Fecha</label>
                                    <input type="date" class="form-control bg-light" id="extra_fecha" readonly >
                                </div>
                                <div class="col-md-3">
                                    <label class="form-label">Día extra (Opcional)</label>
                                    <div class="input-group mb-3">
                                        <div class="input-group-text">
                                            <input class="form-check-input mt-0" type="checkbox" id="usar_dia_extra_mov_extra">
                                        </div>
                                        <input type="date" class="form-control" name="fecha_dia_extra_mov_extra" id="fecha_dia_extra_mov_extra" disabled>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <label class="form-label text-primary fw-bold">Cantidad (MXN)</label>
                                    <div class="input-group">
                                        <span class="input-group-text">$</span>
                                        <input type="number" step="0.01" class="form-control border-primary" name="extra_monto" id="extra_monto" placeholder="0.00" >
                                    </div>
                                </div>
                            </div>
                            <div class="text-end mt-4">
                                <button type="button" class="btn btn-secondary me-2" data-bs-dismiss="modal">Cerrar</button>
                                <button type="submit" class="btn btn-primary px-4"><i class="bi bi-plus-circle me-2"></i>Registrar Extra</button>
                            </div>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    </div>
</div>