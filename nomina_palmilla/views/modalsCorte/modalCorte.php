<!-- Modal -->
<div class="modal fade" id="modalCorte" tabindex="-1" aria-labelledby="modalCorteLabel" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered modal-xl">
        <div class="modal-content">

            <div class="modal-header">
                <h1 class="modal-title fs-5" id="modalCorteLabel">Rejas de Corte de Limón RANCHO EL PILAR</h1>
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
                        <!-- FILTRO PARA LA TABLA DE TICKETS PENDIENTES -->
                        <div class="row">
                            <!-- BARRA DE BUSQUEDA -->
                            <div class="col-md-4 mb-3">
                                <label class="form-label" for="buscar_ticket">Buscar</label>
                                <input type="text" class="form-control form-control-sm shadow-sm" id="buscar_ticket" placeholder="Buscar...">
                            </div>
                            <!-- SELECT DE LIMITE DE REGISTROS -->
                            <div class="col-md-2 mb-3">
                                <label for="" class="form-label">Limite</label>
                                <select class="form-select form-select-sm shadow-sm" id="limite_corte">
                                    <option value="10" selected>10</option>
                                    <option value="25">25</option>
                                    <option value="50">50</option>
                                </select>
                            </div>
                        </div>

                        <!-- TABLA DE TICKETS -->
                        <div class="table-responsive mb-2">
                            <table class="table table-hover table-bordered">
                                <thead class="table-light">
                                    <tr>
                                        <th class="text-center" width="2%">Accion</th>
                                        <th>Folio</th>
                                        <th>Nombre Cabo</th>
                                        <th>Fecha</th>
                                    </tr>
                                </thead>
                                <tbody id="cuerpo_tabla_tickets_pendientes">

                                </tbody>
                            </table>
                            <!-- Paginación -->
                            <nav aria-label="Page navigation" id="contenedor-paginacion">
                                <ul class="pagination justify-content-center" id="paginacion_corte">
                                    <!-- Se genera dinámicamente -->
                                </ul>
                            </nav>
                            <!-- Contenedor para almacenar la página actual -->
                            <div id="pagina-actual-corte" data-pagina="1" style="display:none;"></div>
                        </div>
                    </div>

                    <!-- Poner la nomina del cortador de forma manual -->
                    <div class="tab-pane fade" id="profile-tab-pane" role="tabpanel" aria-labelledby="profile-tab" tabindex="0">
                        <form method="post" id="form_corte_nomina">
                            <div class="row g-2">
                                <div class="col-md-5 mb-3">
                                    <label for="nombre_cortador_nomina" class="form-label">Nombre del Cabo</label>
                                    <input type="text" class="form-control shadow-sm" id="nombre_cortador_nomina" name="nombre_cortador_nomina" placeholder="Nombre del Cabo">
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
                                                <th style="width: 20%;">FECHA</th>
                                                <th style="width: 40%;">PAGO</th>
                                                <th class="text-center" style="width: 20%;">Accion</th>
                                            </tr>
                                        </thead>
                                        <tbody id="cuerpo_tabla_pagos_por_dia">

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