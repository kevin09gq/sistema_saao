<!-- ===========================================================
 MODAL - REASIGNAR DEPARTAMENTO
=========================================================== -->

<div class="modal fade"
    id="modalCambiarDepartamento"
    tabindex="-1"
    aria-labelledby="modalCambiarDepartamentoLabel"
    aria-hidden="true">

    <div class="modal-dialog modal-dialog-centered">

        <div class="modal-content">

            <!-- ENCABEZADO -->
            <div class="modal-header bg-primary text-white">

                <h5 class="modal-title" id="modalCambiarDepartamentoLabel">
                    <i class="bi bi-arrow-left-right me-2"></i>
                    Reasignar Departamento
                </h5>

                <button
                    type="button"
                    class="btn-close btn-close-white"
                    data-bs-dismiss="modal"
                    aria-label="Cerrar">
                </button>

            </div>

            <!-- CUERPO -->
            <div class="modal-body p-4">

                <!-- 1. SELECCIONA EL EMPLEADO -->
                <div class="mb-3">

                    <label for="selectEmpleadoCambiarDepto" class="form-label fw-bold">
                        1. Selecciona el Empleado
                    </label>

                    <select class="form-select" id="selectEmpleadoCambiarDepto">
                        <option value="">Selecciona un empleado</option>
                    </select>

                    <div id="infoDeptoActual" class="mt-2 text-muted fw-semibold" style="display: none;">
                        Depto Actual: <span id="lblDeptoActual" class="text-dark"></span>
                    </div>

                </div>

                <!-- 2. SELECCIONA EL DEPARTAMENTO DESTINO -->
                <div class="mb-3">

                    <label for="selectDepartamentoDestino" class="form-label fw-bold">
                        2. Selecciona el Departamento Destino
                    </label>

                    <select class="form-select" id="selectDepartamentoDestino">
                        <option value="">Selecciona un departamento</option>
                    </select>

                    <!-- ALERTA DE COMPATIBILIDAD -->
                    <div id="alertIncompatible" class="alert alert-danger py-2 mt-3 mb-0 align-items-center" style="display: none;">
                        <i class="bi bi-exclamation-triangle-fill me-2"></i>
                        <span>Departamento no compatible.</span>
                    </div>

                </div>

            </div>

            <!-- PIE DE MODAL -->
            <div class="modal-footer justify-content-end">

                <button
                    type="button"
                    class="btn btn-secondary"
                    data-bs-dismiss="modal">
                    Cancelar
                </button>

                <button
                    type="button"
                    class="btn btn-primary"
                    id="btnConfirmarReasignacion">
                    <i class="bi bi-check-circle me-1"></i>
                    Confirmar Reasignación
                </button>

            </div>

        </div>

    </div>

</div>
