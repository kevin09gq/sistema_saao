<!-- Modal para Dispersión Tarjeta -->
<div class="modal fade" id="modalDispersionTarjeta" tabindex="-1" aria-labelledby="modalDispersionTarjetaLabel" aria-hidden="true">
    <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content">
            <div class="modal-header bg-primary text-white">
                <h5 class="modal-title" id="modalDispersionTarjetaLabel">
                    <i class="bi bi-credit-card"></i> Dispersión Tarjeta
                </h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <div class="row mb-4">
                    <div class="col-md-6">
                        <label for="filtro-departamento-tarjeta" class="form-label fw-bold">Filtrar por Departamento:</label>
                        <select id="filtro-departamento-tarjeta" class="form-select border-primary">
                            <option value="todos">Todos los departamentos</option>
                            <!-- Se cargará dinámicamente -->
                        </select>
                    </div>
                    <div class="col-md-6 d-flex align-items-end justify-content-end">
                        <div class="badge bg-info text-dark p-2 fs-6">
                            Total Empleados: <span id="total-empleados-tarjeta">0</span>
                        </div>
                    </div>
                </div>

                <div class="table-responsive">
                    <table class="table table-hover table-bordered align-middle" id="tabla-dispersion-tarjeta">
                        <thead class="table-light">
                            <tr>
                                <th class="text-center" style="width: 50px;">#</th>
                                <th style="width: 100px;">Clave</th>
                                <th>Nombre del Empleado</th>
                                <th class="text-end" style="width: 150px;">Tarjeta ($)</th>
                            </tr>
                        </thead>
                        <tbody id="tbody-dispersion-tarjeta">
                            <!-- Se cargará dinámicamente -->
                        </tbody>
                        <tfoot class="table-light fw-bold">
                            <tr>
                                <td colspan="3" class="text-end">TOTAL GENERAL:</td>
                                <td class="text-end text-primary" id="total-general-tarjeta">$0.00</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
            </div>
        </div>
    </div>
</div>
