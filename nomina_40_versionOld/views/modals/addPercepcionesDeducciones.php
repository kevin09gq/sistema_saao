<!-- Modal para Agregar Conceptos Extras Masivos -->
<div class="modal fade" id="modalAddPercepcionesDeducciones" tabindex="-1" aria-labelledby="modalAddPercepcionesDeduccionesLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">
            <div class="modal-header bg-primary text-white">
                <h5 class="modal-title" id="modalAddPercepcionesDeduccionesLabel">
                    <i class="bi bi-plus-circle-fill me-2"></i>Asignar Conceptos Extras Masivos
                </h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <!-- Configuración del Concepto -->
                <div class="card mb-4 border-primary-subtle">
                    <div class="card-body bg-light-subtle">
                        <h6 class="card-title fw-bold text-primary mb-3">1. Datos del Concepto</h6>
                        <div class="row g-3">
                            <div class="col-md-4">
                                <label class="form-label small fw-bold">Tipo de Concepto</label>
                                <select class="form-select form-select-sm" id="tipo-concepto-masivo">
                                    <option value="percepcion">Percepción (+)</option>
                                    <option value="deduccion">Deducción (-)</option>
                                    <option value="puesto">Puesto ($) [Fijo]</option>
                                    <option value="bono_antiguedad">Bono de Antigüedad ($) [Fijo]</option>
                                    <option value="actividades_especiales">Actividades Especiales ($) [Fijo]</option>                                     
                                    <option value="incentivo">Incentivo ($) [Fijo]</option>                              
                                  </select>
                            </div>
                            <div class="col-md-5">
                                <label class="form-label small fw-bold">Nombre del Concepto</label>
                                <input type="text" class="form-control form-control-sm" id="nombre-concepto-masivo" placeholder="Ej. Bono Extra, Descuento Uniforme...">
                            </div>
                            <div class="col-md-3">
                                <label class="form-label small fw-bold">Importe ($)</label>
                                <input type="number" step="0.01" class="form-control form-control-sm" id="importe-concepto-masivo" value="0.00">
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Selección de Empleados -->
                <div class="card border-0 shadow-sm">
                    <div class="card-body p-0">
                        <div class="d-flex justify-content-between align-items-center p-3 bg-light border-bottom">
                            <h6 class="m-0 fw-bold"><i class="bi bi-people me-2"></i>2. Seleccionar Empleados</h6>
                            <div class="input-group input-group-sm w-50">
                                <span class="input-group-text bg-white"><i class="bi bi-search"></i></span>
                                <input type="text" id="buscar-empleado-masivo" class="form-control" placeholder="Buscar por nombre o clave...">
                            </div>
                        </div>

                        <div class="table-responsive border rounded" style="max-height: 400px; overflow-y: auto;">
                            <table class="table table-hover align-middle mb-0" id="tabla-empleados-masivo">
                                <thead class="table-light sticky-top shadow-sm">
                                    <tr>
                                        <th class="text-center" style="width: 50px; background-color: #f8f9fa; z-index: 10;">
                                            <input class="form-check-input" type="checkbox" id="check-all-masivo">
                                        </th>
                                        <th class="text-center" style="width: 100px; background-color: #f8f9fa; z-index: 10;">Clave</th>
                                        <th style="background-color: #f8f9fa; z-index: 10;">Empleado / Departamento</th>
                                    </tr>
                                </thead>
                                <tbody id="tbody-empleados-masivo">
                                    <!-- Se llena dinámicamente -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer bg-light">
                <div class="me-auto text-muted small">
                    <span id="contador-seleccionados-masivo" class="fw-bold text-primary">0</span> empleados seleccionados
                </div>
                <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-primary btn-sm px-4" id="btn-aplicar-concepto-masivo">
                    <i class="bi bi-check2-circle me-1"></i>Aplicar a Seleccionados
                </button>
            </div>
        </div>
    </div>
</div>
