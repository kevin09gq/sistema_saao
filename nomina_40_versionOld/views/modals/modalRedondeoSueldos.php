<!-- Modal Bootstrap para Redondeo de Sueldos -->
<div class="modal fade" id="modalRedondeoSueldos" tabindex="-1" aria-labelledby="modalRedondeoSueldosLabel" aria-hidden="true">
    <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content">
            <div class="modal-header bg-primary text-white">
                <h5 class="modal-title" id="modalRedondeoSueldosLabel">
                    <i class="bi bi-arrow-repeat"></i> Redondeo Masivo de Sueldos
                </h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body p-0">
                <!-- Sección de Info Estática (Similar a Dispersión) -->
                <div class="sticky-top bg-white p-3 border-bottom shadow-sm" style="z-index: 1020;">
                    <div class="row align-items-center">
                        <div class="col-md-8">
                            <div class="d-flex align-items-center">
                                <i class="bi bi-info-circle-fill text-info fs-4 me-3"></i>
                                <div>
                                    <p class="mb-0 fw-bold">Ajuste de Sueldos con Decimales</p>
                                    <small class="text-muted">Se muestran únicamente empleados con centavos en su sueldo final para redondear al entero más cercano.</small>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4 d-flex justify-content-end align-items-center mt-3 mt-md-0">
                            <div class="badge bg-info text-dark p-2 fs-6 shadow-sm">
                                <i class="bi bi-people-fill me-1"></i> Empleados: <span id="total-empleados-redondeo">0</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="p-3">
                    <div class="table-responsive">
                        <table class="table table-hover table-bordered align-middle" id="tabla-redondeo-empleados">
                            <thead class="table-light">
                                <tr>
                                    <th class="text-center" style="width: 50px;">
                                        <div class="form-check d-flex justify-content-center">
                                            <input class="form-check-input" type="checkbox" id="check-all-redondeo">
                                        </div>
                                    </th>
                                    <th class="text-center" style="width: 100px;">Clave</th>
                                    <th>Nombre del Empleado</th>
                                    <th class="text-end" style="width: 150px;">Sueldo Actual</th>
                                    <th class="text-end" style="width: 150px;">Sueldo Redondeado</th>
                                    <th class="text-center" style="width: 150px;">Estado</th>
                                </tr>
                            </thead>
                            <tbody id="tbody-redondeo-empleados">
                                <!-- Se llena dinámicamente -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div class="modal-footer d-flex justify-content-between">
                <div>
                    <button type="button" class="btn btn-outline-danger" id="btn-quitar-redondeo-todos">
                        <i class="bi bi-trash"></i> Quitar Redondeo a Todos
                    </button>
                </div>
                <div>
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cerrar</button>
                    <button type="button" class="btn btn-primary px-4 shadow-sm" id="btn-aplicar-redondeo-masivo">
                        <i class="bi bi-check-circle me-1"></i> Aplicar Redondeo
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>
