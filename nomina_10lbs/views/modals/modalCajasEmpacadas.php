<!-- Modal para Captura General de Cajas Empacadas -->
<div class="modal fade" id="modal-cajas-empacadas-general" tabindex="-1" aria-labelledby="modalCajasEmpacadasLabel" aria-hidden="true">
    <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content">
            <div class="modal-header bg-primary text-white">
                <h5 class="modal-title" id="modalCajasEmpacadasLabel">
                    <i class="bi bi-grid-3x3-gap-fill me-2"></i>Captura General de Cajas Empacadas
                </h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body p-0">
                <div class="d-flex flex-column h-100">
                    <!-- Filtros y Controles Superiores -->
                    <div class="p-3 bg-light border-bottom">
                        <div class="d-flex flex-wrap justify-content-between align-items-center gap-3">
                            <div class="d-flex gap-3 align-items-center">
                                <div class="input-group input-group-sm" style="width: 250px;">
                                    <span class="input-group-text"><i class="bi bi-search"></i></span>
                                    <input type="text" id="buscar-empleado-cajas" class="form-control" placeholder="Buscar empleado...">
                                </div>
                            </div>
                            
                            <div class="d-flex align-items-center gap-2">
                                <span class="fw-bold small">Agregar Día:</span>
                                <select id="select-agregar-dia" class="form-select form-select-sm" style="width: 150px;">
                                    <option value="">Seleccionar...</option>
                                    <option value="Viernes">Viernes</option>
                                    <option value="Sábado">Sábado</option>
                                    <option value="Domingo">Domingo</option>
                                    <option value="Lunes">Lunes</option>
                                    <option value="Martes">Martes</option>
                                    <option value="Miércoles">Miércoles</option>
                                    <option value="Jueves">Jueves</option>
                                </select>
                                <button type="button" class="btn btn-sm btn-primary" id="btn-agregar-dia-tabla">
                                    <i class="bi bi-plus-circle me-1"></i>Agregar
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Tabla Contenedora con Scroll -->
                    <div class="table-responsive flex-grow-1" style="overflow-x: auto; overflow-y: auto;">
                        <table class="table table-bordered table-hover mb-0 align-middle" id="tabla-general-cajas">
                            <thead class="table-light sticky-top" style="z-index: 1021;">
                                <tr id="header-fila-dias">
                                    <th rowspan="2" class="text-center sticky-col-1" style="vertical-align: middle;">#</th>
                                    <th rowspan="2" class="text-center sticky-col-2" style="vertical-align: middle;">Clave</th>
                                    <th rowspan="2" class="sticky-col-3" style="vertical-align: middle;">Nombre del Empleado</th>
                                </tr>
                                <tr id="header-fila-tipos">
                                    <!-- Aquí irán los tipos de cajas de cada día -->
                                </tr>
                            </thead>
                            <tbody id="tbody-general-cajas">
                                <!-- Dinámico: Empleados y Inputs -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div class="modal-footer bg-light">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-success" id="btn-aplicar-cajas-general">
                    <i class="bi bi-check-circle me-1"></i>Aplicar Cambios
                </button>
            </div>
        </div>
    </div>
</div>

<style>
    #tabla-general-cajas thead th {
        text-align: center;
        white-space: nowrap;
        font-size: 0.9rem;
        padding: 12px 8px;
        font-weight: 600;
    }
    #tabla-general-cajas tbody td {
        padding: 8px 6px;
    }
    #tabla-general-cajas tbody td.td-captura {
        padding: 0 !important;
        width: 60px;
        min-width: 60px;
    }
    #tabla-general-cajas .input-caja {
        border: none;
        width: 100%;
        height: 35px;
        text-align: center;
        background: transparent;
        transition: background 0.2s;
    }
    #tabla-general-cajas .input-caja:focus {
        outline: none;
        background: #fff3cd;
    }
    #tabla-general-cajas .input-caja::-webkit-inner-spin-button,
    #tabla-general-cajas .input-caja::-webkit-outer-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }
    /* Columnas fijas (Sticky) */
    .sticky-col-1, .sticky-col-2, .sticky-col-3 {
        position: sticky !important;
        z-index: 1020;
        background-color: #f8f9fa !important;
        border-right: 1px solid #dee2e6 !important;
    }

    /* Posicionamiento de cada columna fija */
    .sticky-col-1 { left: 0; min-width: 50px; width: 50px; }
    .sticky-col-2 { left: 50px; min-width: 80px; width: 80px; }
    .sticky-col-3 { left: 130px; min-width: 180px; width: 180px; }

    /* Ajuste para el hover de las filas */
    tr:hover .sticky-col-1, 
    tr:hover .sticky-col-2, 
    tr:hover .sticky-col-3 {
        background-color: #e9ecef !important;
    }

    /* Encabezados oscuros si se prefiere */
    thead .sticky-col-1, thead .sticky-col-2, thead .sticky-col-3 {
        background-color: #f1f3f5 !important;
        z-index: 1025;
    }
    .input-caja-changed {
        background-color: #d1e7dd !important;
    }
</style>
