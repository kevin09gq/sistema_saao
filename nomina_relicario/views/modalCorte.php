<!-- Modal -->
<div class="modal fade" id="modalCorte" tabindex="-1" aria-labelledby="modalCorteLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-xl">
        <div class="modal-content">

            <div class="modal-header">
                <h1 class="modal-title fs-5" id="modalCorteLabel">Rejas de Corte de Limón RANCHO EL RELICARIO</h1>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>

            <div class="modal-body">

                <ul class="nav nav-tabs mb-4" id="myTab" role="tablist">
                    <li class="nav-item" role="presentation">
                        <button class="nav-link active" id="home-tab" data-bs-toggle="tab" data-bs-target="#home-tab-pane" type="button" role="tab" aria-controls="home-tab-pane" aria-selected="true">Rejas</button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="profile-tab" data-bs-toggle="tab" data-bs-target="#profile-tab-pane" type="button" role="tab" aria-controls="profile-tab-pane" aria-selected="false">Nomina</button>
                    </li>
                </ul>

                <div class="tab-content" id="myTabContent">

                    <!-- Poner las rejas que se cortaron -->
                    <div class="tab-pane fade show active" id="home-tab-pane" role="tabpanel" aria-labelledby="home-tab" tabindex="0">
                        <form method="post" id="form_corte">
                            <div class="row g-2">

                                <div class="col-md-2 mb-3">
                                    <label for="folio_corte" class="form-label">Folio</label>
                                    <input type="text" class="form-control shadow-sm" id="folio_corte" name="folio_corte" placeholder="Número de Folio">
                                </div>

                                <div class="col-md-5 mb-3">
                                    <label for="nombre_cortador" class="form-label">Nombre del Cortador</label>
                                    <input type="text" class="form-control shadow-sm" id="nombre_cortador" name="nombre_cortador" placeholder="Nombre del Cortador">
                                </div>

                                <div class="col-md-2 mb-3">
                                    <label for="fecha_corte" class="form-label">Fecha de Corte</label>
                                    <input type="date" class="form-control shadow-sm" id="fecha_corte" name="fecha_corte">
                                </div>

                                <div class="col-12 mb-3">
                                    <label for="observaciones_corte" class="form-label">Tablas</label>
                                    <div class="container-fluid" id="cuerpo_tablas_corte"><!-- Cuerpo de las tablas --></div>
                                </div>

                                <div id="cuerpo_cantidad_rejas" class="row">

                                </div>

                                <div class="col-md-2 mb-3">
                                    <label for="rejas_totales" class="form-label">Rejas totales</label>
                                    <input type="number" class="form-control shadow-sm" id="rejas_totales" name="rejas_totales" placeholder="Total de rejas" disabled>
                                </div>

                                <div class="col-md-2 mb-3">
                                    <label for="precio_reja" class="form-label">Precio reja $</label>
                                    <input type="number" step="0.01" min="0" class="form-control shadow-sm" id="precio_reja" name="precio_reja" placeholder="Precio por reja">
                                </div>

                                <div class="col-md-2 mb-3">
                                    <label for="total_pagar" class="form-label">Total $</label>
                                    <input type="text" class="form-control shadow-sm" id="total_pagar" name="total_pagar" placeholder="Total a pagar" disabled>
                                </div>

                            </div>
                            <div class="text-end mb-3 me-3">
                                <button type="button" class="btn btn-secondary shadow-sm" data-bs-dismiss="modal"><i class="bi bi-x-circle me-2"></i>Cerrar</button>
                                <button type="submit" class="btn btn-primary shadow-sm fw-bold"><i class="bi bi-check-circle me-2"></i>Guardar</button>
                            </div>
                        </form>
                    </div>

                    <!-- Poner la nomina del cortador de forma manual -->
                    <div class="tab-pane fade" id="profile-tab-pane" role="tabpanel" aria-labelledby="profile-tab" tabindex="0">
                        <form method="post" id="form_corte_nomina">
                            <div class="row g-2">
                                <div class="col-md-5 mb-3">
                                    <label for="nombre_cortador_nomina" class="form-label">Nombre del Cortador</label>
                                    <input type="text" class="form-control shadow-sm" id="nombre_cortador_nomina" name="nombre_cortador_nomina" placeholder="Nombre del Cortador">
                                </div>
                                <div class="col-md-3 mb-3">
                                    <label for="salario_diario" class="form-label">Salario diario</label>
                                    <div class="input-group mb-3">
                                        <input type="number" step="0.01" min="0" class="form-control" placeholder="Salario diario" aria-describedby="btn_copiar_salario" id="salario_diario" name="salario_diario">
                                        <button class="btn btn-outline-primary" type="button" id="btn_copiar_salario" title="Copiar salario diario en los dias trabajados"><i class="bi bi-copy"></i></button>
                                    </div>
                                </div>
                            </div>

                            <label class="form-label">Pagos de la semana:</label>
                            <div class="row">
                                <div class="col-md-8">
                                    <table class="table table-bordered align-middle">
                                        <thead class="table-light">
                                            <tr>
                                                <th style="width: 20%;">DIA</th>
                                                <th style="width: 30%;">PAGO</th>
                                                <th class="text-center" style="width: 20%;">Accion</th>
                                            </tr>
                                        </thead>
                                        <tbody id="cuerpo_tabla_pagos_por_dia">

                                            <?php foreach (DIAS_SEMANA_NOMINA as $dia) : ?>

                                                <tr>
                                                    <td><?php echo $dia; ?></td>
                                                    <td>
                                                        <input type="number" step="0.01" min="0"
                                                            class="form-control shadow-sm pago_del_dia"
                                                            name="pago_<?php echo strtolower($dia); ?>" id="pago_<?php echo strtolower($dia); ?>"
                                                            placeholder="Pago del día">
                                                    </td>
                                                    <td class="text-center">
                                                        <button class="btn btn-outline-danger btn_limpiar_dia" type="button" title="Limpiar fila"><i class="bi bi-trash"></i></button>
                                                    </td>
                                                </tr>

                                            <?php endforeach; ?>

                                            <tr>
                                                <td>Total:</td>
                                                <td class="text-end"><strong id="total_pagos">$0.00</strong></td>
                                                <td></td>
                                            </tr>

                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div class="text-end mb-3 me-3">
                                <button type="button" class="btn btn-secondary shadow-sm" data-bs-dismiss="modal"><i class="bi bi-x-circle me-2"></i>Cerrar</button>
                                <button type="submit" class="btn btn-primary shadow-sm fw-bold"><i class="bi bi-check-circle me-2"></i>Guardar</button>
                            </div>

                        </form>
                    </div>

                </div>
            </div>



        </div>
    </div>
</div>