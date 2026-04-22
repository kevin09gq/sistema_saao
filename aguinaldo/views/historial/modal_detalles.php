<div class="modal fade" id="modal_detalles" tabindex="-1" aria-labelledby="modal_detalles_label" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-centered"> <div class="modal-content border-0 shadow-lg">
            <div class="modal-header bg-success text-white py-3">
                <h5 class="modal-title d-flex align-items-center" id="modal_detalles_label">
                    <i class="bi bi-wallet2 fs-4 me-2"></i> 
                    <span class="fw-bold text-uppercase" style="letter-spacing: 1px;">Resumen de Aguinaldo</span>
                </h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>

            <div class="modal-body p-4">
                <div class="d-flex align-items-center mb-4 pb-3 border-bottom">
                    <div class="flex-shrink-0">
                        <i class="bi bi-person-vcard text-success fs-1"></i>
                    </div>
                    <div class="ms-4">
                        <h6 class="text-muted mb-0 small uppercase fw-bold">Empleado</h6>
                        <h4 id="detalle_nombre" class="mb-0 fw-bold text-dark">---</h4>
                        <span class="badge bg-secondary-subtle text-secondary border">
                            CLAVE: <span id="detalle_clave">---</span>
                        </span>
                    </div>
                </div>

                <div class="card border-primary bg-primary bg-opacity-10 mb-4">
                    <div class="card-body text-center py-4">
                        <p class="text-primary fw-bold mb-1 text-uppercase small">Monto Total a Recibir</p>
                        <h2 id="detalle_aguinaldo" class="display-5 fw-bold text-primary mb-0">$ 0.00</h2>
                        <p class="text-muted small mt-2 mb-0">
                            Calculado por <span id="detalle_dias" class="fw-bold text-dark">0</span> días laborados en el periodo.
                        </p>
                    </div>
                </div>

                <div class="row g-3">
                    <div class="col-md-6">
                        <div class="p-3 border rounded-3 bg-light h-100">
                            <h6 class="fw-bold mb-3 border-bottom pb-2">Datos del Puesto</h6>
                            <ul class="list-unstyled mb-0">
                                <li class="d-flex justify-content-between mb-2">
                                    <span class="text-muted">Área:</span>
                                    <span id="detalle_area" class="fw-semibold text-end">---</span>
                                </li>
                                <li class="d-flex justify-content-between mb-2">
                                    <span class="text-muted">Departamento:</span>
                                    <span id="detalle_departamento" class="fw-semibold text-end" >---</span>
                                </li>
                                <li class="d-flex justify-content-between">
                                    <span class="text-muted">Puesto:</span>
                                    <span id="detalle_puesto" class="fw-semibold text-end text-truncate" >---</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div class="col-md-6">
                        <div class="p-3 border rounded-3 bg-light h-100">
                            <h6 class="fw-bold mb-3 border-bottom pb-2">Datos del Pago</h6>
                            <ul class="list-unstyled mb-0">
                                <li class="d-flex justify-content-between mb-2">
                                    <span class="text-muted">Ejercicio:</span>
                                    <span id="detalle_anio" class="badge bg-primary fs-6 fw-bold">---</span>
                                </li>
                                <li class="d-flex justify-content-between mb-2">
                                    <span class="text-muted">Sueldo Diario:</span>
                                    <span id="detalle_sueldo" class="fw-semibold text-success">---</span>
                                </li>
                                <li class="d-flex justify-content-between">
                                    <span class="text-muted">Fecha Pago:</span>
                                    <span id="detalle_fecha" class="fw-semibold">---</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div class="mt-4 text-center">
                    <p class="text-muted small mb-0">
                        <i class="bi bi-info-circle me-1"></i>
                        <span id="detalle_registro"><em>Información generada el día...</em></span>
                    </p>
                </div>
            </div>

            <div class="modal-footer border-0 bg-light p-3">
                <button type="button" class="btn btn-outline-secondary px-4 shadow-sm" data-bs-dismiss="modal">
                    <i class="bi bi-x-lg me-1"></i> Cerrar
                </button>
                <!-- <button type="button" class="btn btn-primary px-4 shadow-sm" onclick="window.print();">
                    <i class="bi bi-printer me-1"></i> Imprimir
                </button> -->
            </div>
        </div>
    </div>
</div>