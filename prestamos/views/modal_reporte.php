<!-- Modal -->
<div class="modal fade" id="modalReporte" tabindex="-1" aria-labelledby="modalReporteLabel" aria-hidden="true">
  <div class="modal-dialog modal-dialog-scrollable modal-xl">
    <div class="modal-content">
      <div class="modal-header bg-success text-white">
        <h1 class="modal-title fs-5" id="modalReporteLabel">Generar reportes</h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">

        <!-- Tabs de los reportes -->
        <ul class="nav nav-tabs" id="myTab" role="tablist">
          <li class="nav-item" role="presentation">
            <button class="nav-link active" id="home-tab" data-bs-toggle="tab" data-bs-target="#home-tab-pane" type="button" role="tab" aria-controls="home-tab-pane" aria-selected="true">Reporte General</button>
          </li>
          <li class="nav-item" role="presentation">
            <button class="nav-link" id="profile-tab" data-bs-toggle="tab" data-bs-target="#profile-tab-pane" type="button" role="tab" aria-controls="profile-tab-pane" aria-selected="false">Reporte Semanal</button>
          </li>
        </ul>

        <!-- Contenido de los tabs -->
        <div class="tab-content" id="myTabContent">

          <!-- Generar y presentar la información general -->
          <div class="tab-pane fade show active" id="home-tab-pane" role="tabpanel" aria-labelledby="home-tab" tabindex="0">

            <!-- Filtro de Año y Semana -->
            <div class="container mt-4 mb-4">
              <div class="card p-3 shadow-sm">
                <h5 class="card-title"><i class="bi bi-funnel me-2"></i>Filtro por Año y Semana</h5>
                <form class="row g-3" id="form-filtro-general">

                  <!-- Año de inicio -->
                  <div class="col-md-3">
                    <label for="anioInicio" class="form-label">Año inicio <span class="text-danger">*</span></label>
                    <select id="anioInicio" class="form-select" required>
                      <option value="">Selecciona...</option>
                      <?php for ($i = 2025; $i <= (date('Y') + 1); $i++) : ?>
                        <option value="<?= $i ?>" <?= $i == date('Y') ? 'selected' : '' ?>><?= $i ?></option>
                      <?php endfor; ?>
                    </select>
                  </div>

                  <!-- Semana de inicio -->
                  <div class="col-md-3">
                    <label for="semanaInicio" class="form-label">Semana inicio</label>
                    <input type="number" id="semanaInicio" class="form-control" min="1" max="52" placeholder="1-52">
                  </div>

                  <!-- Año de fin -->
                  <div class="col-md-3">
                    <label for="anioFin" class="form-label">Año fin</label>
                    <select id="anioFin" class="form-select">
                      <option value="">Igual al inicio</option>
                      <?php for ($i = 2026; $i <= (date('Y') + 1); $i++) : ?>
                        <option value="<?= $i ?>"><?= $i ?></option>
                      <?php endfor; ?>
                    </select>
                  </div>

                  <!-- Semana de fin -->
                  <div class="col-md-3">
                    <label for="semanaFin" class="form-label">Semana fin</label>
                    <input type="number" id="semanaFin" class="form-control" min="1" max="52" placeholder="1-52">
                  </div>

                  <!-- Botón de aplicar filtro -->
                  <div class="col-12 text-end">
                    <button type="button" class="btn btn-outline-secondary me-2" id="btn-limpiar-filtro">
                      <i class="bi bi-x-circle me-1"></i>Limpiar
                    </button>
                    <button type="submit" class="btn btn-primary" id="btn-aplicar-filtro">
                      <i class="bi bi-search me-1"></i>Aplicar filtro
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div class="container">
              <div class="card">
                <div class="card-body" id="cuerpo-reporte-general">

                  <!-- Mensaje inicial -->
                  <div id="mensaje-inicial" class="text-center py-4 text-muted">
                    <i class="bi bi-info-circle display-4"></i>
                    <p class="mt-2">Selecciona un filtro y presiona <strong>"Aplicar filtro"</strong> para ver el reporte.</p>
                  </div>

                  <!-- Contenedor del reporte (oculto inicialmente) -->
                  <div id="contenedor-reporte" style="display: none;">

                    <!-- Título descriptivo con botón PDF -->
                    <div class="d-flex justify-content-between align-items-center mb-3">
                      <h5 class="mb-0">
                        <i class="bi bi-graph-up-arrow text-success me-2"></i>
                        <span id="titulo-reporte">Préstamos</span>
                      </h5>
                      <button type="button" class="btn btn-outline-danger btn-sm" id="btn-generar-pdf-general">
                        <i class="bi bi-file-earmark-pdf me-1"></i>Generar PDF
                      </button>
                    </div>

                    <!-- Accordion -->
                    <div class="accordion" id="accordionReporteGeneral">

                      <!-- Por Cobrar -->
                      <div class="accordion-item">
                        <h2 class="accordion-header">
                          <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapsePorCobrar" aria-expanded="true" aria-controls="collapsePorCobrar">
                            <i class="bi bi-exclamation-triangle-fill text-warning me-2"></i>
                            <span class="concept-title fw-bold me-3">Por Cobrar</span>
                            <span class="badge bg-danger fw-bold me-2" id="total-monto-por-cobrar">$0.00</span>
                            <span class="badge bg-secondary fw-bold" id="total-prestamos-por-cobrar">0 Préstamo(s)</span>
                          </button>
                        </h2>
                        <div id="collapsePorCobrar" class="accordion-collapse collapse show" data-bs-parent="#accordionReporteGeneral">
                          <div class="accordion-body p-0">
                            <div class="table-responsive" style="max-height: 250px; overflow-y: auto;">
                              <table class="table table-sm table-hover mb-0">
                                <thead class="table-light sticky-top">
                                  <tr>
                                    <th>Empleado</th>
                                    <th>Folio</th>
                                    <th class="text-end">Préstamo</th>
                                    <th class="text-end">Abonado</th>
                                    <th class="text-end">Pendiente</th>
                                    <th class="text-center">Sem/Año</th>
                                    <th class="text-center">Estado</th>
                                  </tr>
                                </thead>
                                <tbody id="tabla-por-cobrar">
                                  <tr>
                                    <td colspan="7" class="text-center text-muted">Sin datos</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Recuperado -->
                      <div class="accordion-item">
                        <h2 class="accordion-header">
                          <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapseRecuperado" aria-expanded="false" aria-controls="collapseRecuperado">
                            <i class="bi bi-check-circle-fill text-success me-2"></i>
                            <span class="concept-title fw-bold me-3">Recuperado</span>
                            <span class="badge bg-success fw-bold me-2" id="total-monto-recuperado">$0.00</span>
                            <span class="badge bg-secondary fw-bold" id="total-abonos-recuperado">0 Abono(s)</span>
                          </button>
                        </h2>
                        <div id="collapseRecuperado" class="accordion-collapse collapse" data-bs-parent="#accordionReporteGeneral">
                          <div class="accordion-body p-0">
                            <div class="table-responsive" style="max-height: 250px; overflow-y: auto;">
                              <table class="table table-sm table-hover table-striped mb-0">
                                <thead class="table-light sticky-top">
                                  <tr>
                                    <th>Empleado</th>
                                    <th>Folio</th>
                                    <th class="text-end">Monto Abono</th>
                                    <th class="text-center">Sem/Año</th>
                                    <th class="text-center">Fecha</th>
                                    <th class="text-center">Tipo</th>
                                  </tr>
                                </thead>
                                <tbody id="tabla-recuperado">
                                  <tr>
                                    <td colspan="6" class="text-center text-muted">Sin datos</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>

                      <!-- Prestado -->
                      <div class="accordion-item">
                        <h2 class="accordion-header">
                          <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapsePrestado" aria-expanded="false" aria-controls="collapsePrestado">
                            <i class="bi bi-cash-stack text-primary me-2"></i>
                            <span class="concept-title fw-bold me-3">Prestado</span>
                            <span class="badge bg-primary fw-bold me-2" id="total-monto-prestado">$0.00</span>
                            <span class="badge bg-secondary fw-bold" id="total-prestamos">0 Préstamo(s)</span>
                          </button>
                        </h2>
                        <div id="collapsePrestado" class="accordion-collapse collapse" data-bs-parent="#accordionReporteGeneral">
                          <div class="accordion-body p-0">
                            <div class="table-responsive" style="max-height: 250px; overflow-y: auto;">
                              <table class="table table-sm table-hover mb-0">
                                <thead class="table-light sticky-top">
                                  <tr>
                                    <th>Empleado</th>
                                    <th>Folio</th>
                                    <th class="text-end">Monto</th>
                                    <th class="text-center">Sem/Año</th>
                                    <th class="text-center">Fecha</th>
                                    <th class="text-center">Estado</th>
                                  </tr>
                                </thead>
                                <tbody id="tabla-prestado">
                                  <tr>
                                    <td colspan="6" class="text-center text-muted">Sin datos</td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>

          <!-- Generación del EXCEL del reporte por semana -->
          <div class="tab-pane fade" id="profile-tab-pane" role="tabpanel" aria-labelledby="profile-tab" tabindex="0">
            <div class="container mt-4">
              <div class="card">
                <div class="card-body">
                  <form id="form-reporte-semanal" class="row g-3">
                    <div class="col-12 col-md-6">
                      <label for="reporte-anio" class="form-label">Año</label>
                      <select class="form-select form-select-lg shadow-sm" id="reporte-anio" required>
                        <?php $anioActual = (int)date('Y'); ?>
                        <?php for ($a = 2025; $a <= $anioActual + 1; $a++): ?>
                          <option value="<?= $a ?>" <?= $a === $anioActual ? 'selected' : '' ?>><?= $a ?></option>
                        <?php endfor; ?>
                      </select>
                    </div>
                    <div class="col-12 col-md-6">
                      <label for="reporte-semana" class="form-label">Semana</label>

                      <select class="form-select form-select-lg shadow-sm" name="reporte-semana" id="reporte-semana" required>

                        <?php for ($a = 1; $a <=  52; $a++): ?>
                          <option <?= $a == date('W') ? 'selected' : '' ?> value="<?= $a ?>">Semana <?= $a ?></option>
                        <?php endfor; ?>

                      </select>

                    </div>
                    <div class="col-12">
                      <div class="d-flex gap-2 flex-wrap">
                        <button type="button" class="btn btn-outline-success fw-bold" id="btn-reporte-excel" title="Descargar archivo excel"><i class="bi bi-download me-2"></i>Generar Excel</button>
                        <button type="button" class="btn btn-outline-primary fw-bold" id="btn-reporte-previsualizar" title="Previsualizar información"><i class="bi bi-eye me-2"></i>Previsualizar</button>
                        <button type="button" class="btn btn-outline-secondary" id="btn-limpiar-excel">Limpiar</button>
                      </div>
                    </div>
                    <div id="previsualizar"></div>
                  </form>
                </div>
              </div>
            </div>
          </div>



        </div>




      </div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
      </div>
    </div>
  </div>
</div>