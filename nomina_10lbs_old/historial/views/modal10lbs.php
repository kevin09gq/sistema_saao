<div class="modal fade" id="modal-10lbs" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Detalles del empleado</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div class="modal-body">
                <!-- Barra de navegación -->
                <ul class="nav nav-tabs mb-3" id="modalTabs-10lbs" role="tablist">
                    <li class="nav-item" role="presentation">
                        <button class="nav-link active" id="tab-info-10lbs" data-bs-toggle="tab" data-bs-target="#tab_info-10lbs" type="button" role="tab" aria-controls="tab_info-10lbs" aria-selected="true">Trabajador</button>
                    </li>

                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="tab-modificar-detalles-10lbs" data-bs-toggle="tab" data-bs-target="#tab_modificar_detalles-10lbs" type="button" role="tab" aria-controls="tab_modificar_detalles-10lbs" aria-selected="false">Modificar Detalles</button>
                    </li>
                </ul>

                <div class="tab-content">

                    <!-- INFORMACION DEL 10lbs -->
                    <div class="tab-pane fade show active" id="tab_info-10lbs" role="tabpanel" aria-labelledby="tab-info-10lbs">
                        <h6 class="mb-3">Información básica del empleado</h6>
                        <div class="empleado-info">
                            <div class="info-row"><span class="info-label">Clave:</span><span class="info-value" id="campo-clave-10lbs"></span></div>
                            <div class="info-row"><span class="info-label">Nombre:</span><span class="info-value" id="campo-nombre-10lbs"></span></div>
                            <div class="info-row"><span class="info-label">Departamento:</span><span class="info-value" id="campo-departamento-10lbs"></span></div>
                            <div class="info-row"><span class="info-label">Puesto:</span><span class="info-value" id="campo-puesto-10lbs"></span></div>
                            <input type="hidden" id="campo-id-empresa-10lbs" value="">
                        </div>
                    </div>

                    <!-- EDITAR Y AGREGAR CONCEPTOS (PROPIEDADES DEL EMPLEADO) -->
                    <div class="tab-pane fade" id="tab_modificar_detalles-10lbs" role="tabpanel" aria-labelledby="tab-modificar-detalles-10lbs">
                        <form id="form-modificar-sueldo">

                            <!-- PERCEPCIONES -->
                            <div class="card shadow-sm mb-3 mod-card">
                                <div class="card-header mod-card-header-azul">
                                    <i class="bi bi-cash-coin"></i> Percepciones
                                </div>
                                <div class="card-body mod-card-body-azul">
                                    <!-- Primera fila: Campos principales con altura fija -->
                                    <div class="row mb-4">
                                        <div class="col-md-6 d-flex flex-column">
                                            <label class="form-label fw-semibold">Sueldo Neto ($)</label>
                                            <div class="flex-grow-1 d-flex align-items-end">
                                                <input type="number" step="0.01" class="form-control mod-input-azul" id="mod-sueldo-neto-10lbs" value="" placeholder="0.00">
                                            </div>
                                        </div>

                                        <div class="col-md-6 d-flex flex-column">
                                            <label class="form-label fw-semibold">Total Sueldo Extra ($)</label>
                                            <small class="text-muted mb-1">Calculado automáticamente</small>
                                            <input type="number" step="0.01" class="form-control mod-input-azul mod-input-readonly" id="mod-total-extra-10lbs" value="" placeholder="0.00" readonly>
                                        </div>
                                    </div>

                                    <!-- Separador visual -->
                                    <hr class="mod-separador">

                                    <!-- Contenedor para conceptos adicionales -->
                                    <div class="row" id="contenedor-conceptos-adicionales-10lbs">
                                        <!-- Los conceptos adicionales se cargarán aquí dinámicamente -->
                                    </div>

                                 
                                </div>
                            </div>

                            <!-- CONCEPTOS -->
                            <div class="card shadow-sm mb-3 mod-card">
                                <div class="card-header mod-card-header-amarillo">
                                    <i class="bi bi-dash-circle"></i> Conceptos
                                </div>
                                <div class="card-body mod-card-body-amarillo">
                                    <div class="row mb-3" id="contenedor-conceptos-10lbs">
                                        <div class="col-md-4 mb-2">
                                            <label class="form-label fw-semibold">ISR ($)</label>
                                            <div class="input-group">
                                                <input type="number" step="0.01" class="form-control mod-input-amarillo" id="mod-isr-10lbs" value="" placeholder="0.00">
                        
                                            </div>
                                        </div>
                                        <div class="col-md-4 mb-2">
                                            <label class="form-label fw-semibold">IMSS ($)</label>
                                            <div class="input-group">
                                                <input type="number" step="0.01" class="form-control mod-input-amarillo" id="mod-imss-10lbs" value="" placeholder="0.00">
                                               
                                            </div>
                                        </div>
                                        <div class="col-md-4 mb-2">
                                            <label class="form-label fw-semibold">INFONAVIT ($)</label>
                                            <div class="input-group">
                                                <input type="number" step="0.01" class="form-control mod-input-amarillo" id="mod-infonavit-10lbs" value="" placeholder="0.00">
                                                
                                            </div>
                                        </div>
                                    </div>

                                    <div class="row mb-3">
                                        <div class="col-md-4 mb-2">
                                            <label class="form-label fw-semibold">AJUSTES AL SUB ($)</label>
                                            <div class="input-group">
                                                <input type="number" step="0.01" class="form-control mod-input-amarillo" id="mod-ajustes-sub-10lbs" value="" placeholder="0.00">
                                                
                                            </div>
                                        </div>

                                        <div class="col-md-4 mb-2">
                                            <label class="form-label fw-semibold">TOTAL CONCEPTOS ($)</label>
                                            <div class="input-group">
                                                <input type="number" step="0.01" class="form-control mod-input-amarillo-total-conceptos" id="mod-total-conceptos-10lbs" value="" placeholder="0.00" readonly>
                                            </div>
                                        </div>

                                    </div>
                                </div>
                            </div>


                            <!-- DEDUCCIONES -->
                            <div class="card shadow-sm mb-3 mod-card">
                                <div class="card-header mod-card-header-rojo">
                                    <i class="bi bi-dash-lg"></i> Deducciones
                                </div>
                                <div class="card-body mod-card-body-rojo">
                                    <div class="row mb-4" id="contenedor-deducciones-10lbs">
                                        <div class="col-md-4 d-flex flex-column">
                                            <label class="form-label fw-semibold">Dispersión Tarjeta ($)</label>
                                            <div class="input-group">
                                                <input type="number" step="0.01" class="form-control mod-input-rojo" id="mod-tarjeta-10lbs" value="" placeholder="0.00">
                                                
                                            </div>
                                        </div>
                                        <div class="col-md-4 d-flex flex-column">
                                            <label class="form-label fw-semibold">Préstamos ($)</label>
                                            <input type="number" step="0.01" class="form-control mod-input-rojo" id="mod-prestamo-10lbs" value="" placeholder="0.00">
                                        </div>
                                        <div class="col-md-4 d-flex flex-column">
                                            <label class="form-label fw-semibold">Checador ($)</label>
                                            <div class="input-group">
                                                <input type="number" step="0.01" class="form-control mod-input-rojo" id="mod-checador-10lbs" value="" placeholder="0.00">
                                            </div>
                                        </div>

                                    </div>

                                    <!-- Separador visual -->
                                    <div class="row">
                                        <hr class="mod-separador">
                                        <!-- Historial Detallado de Olvidos -->
                                        <div class="row mb-3">
                                            <div class="col-12" id="historial-olvidos-10lbs">
                                                <h6 class="fw-semibold text-danger mb-3">
                                                    <i class="bi bi-exclamation-triangle-fill"></i> Historial de Olvidos por Día
                                                </h6>
                                                <div id="contenedor-historial-olvidos" class="historial-olvidos-container">
                                                    <!-- Se llenará con JavaScript -->
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Separador visual -->
                                        <hr class="mod-separador">

                                        <!-- Sección de Permisos -->
                                        <div class="row mb-3">
                                            <div class="col-md-4 mb-2">
                                                <label class="form-label fw-semibold">Permisos ($)</label>
                                                <div class="input-group">
                                                    <input type="number" step="0.01" class="form-control mod-input-rojo mod-input-readonly" id="mod-permisos-10lbs" value="" placeholder="0.00" readonly>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Historial Detallado de Permisos -->
                                        <div class="row mb-3">
                                            <div class="col-12">
                                                <h6 class="fw-semibold text-warning mb-3">
                                                    <i class="bi bi-calendar2-check"></i> Historial de Permisos por Día
                                                </h6>
                                                <div id="contenedor-historial-permisos-10lbs" class="historial-permisos-container">
                                                    <!-- El historial se cargará dinámicamente aquí -->
                                                </div>
                                            </div>
                                        </div>

                                        <!-- INTERFAZ DE UNIFORME -->
                                        <div class="row mb-3">
                                            <div class="col-md-4 mb-2">
                                                <label class="form-label fw-semibold">Uniforme (cantidad)</label>
                                                <input type="number" step="1" class="form-control mod-input-rojo mod-input-readonly" id="mod-uniforme-10lbs" value="" placeholder="0" readonly>
                                            </div>
                                        </div>

                                        <!-- Historial Detallado de Uniforme -->
                                        <div class="row mb-3">
                                            <div class="col-12">
                                                <h6 class="fw-semibold text-secondary mb-3">
                                                    <i class="bi bi-box-seam"></i> Historial de Uniforme por Folio
                                                </h6>
                                        

                                                <div id="contenedor-historial-uniforme-10lbs" class="historial-uniforme-container">
                                                    <!-- El historial se cargará dinámicamente aquí -->
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Separador visual -->
                                        <hr class="mod-separador">

                                        <!-- Sección de Deducciones Adicionales -->
                                        <div class="row mb-3">
                                            <div class="col-md-4 mb-2">
                                                <label class="form-label fw-semibold">F.A/GAFET/COFIA ($)</label>
                                                <input type="number" step="0.01" class="form-control mod-input-rojo" id="mod-fagafetcofia-10lbs" value="" placeholder="0.00">
                                            </div>
                                        </div>

                                        <!-- Contenedor para deducciones adicionales -->
                                        <div class="row" id="contenedor-deducciones-adicionales-10lbs">
                                            <!-- Las deducciones adicionales se cargarán aquí dinámicamente -->
                                        </div>


                                    </div>
                                </div>
                            </div>




                            <!-- SUELDO A COBRAR -->
                            <div class="card shadow-sm mb-3 mod-card" id="mod-sueldo-10lbs">
                                <div class="card-header mod-card-header-verde">
                                    <i class="bi bi-currency-dollar"></i> Sueldo a Cobrar
                                </div>
                                <div class="card-body mod-card-body-verde">
                                
                                    <div class="row justify-content-center">
                                        <div class="col-md-6 text-center">
                                            <label class="sueldo-cobrar-label">
                                                <i class="bi bi-cash-stack"></i> Total a Cobrar
                                            </label>
                                            <input type="number" step="0.01" class="sueldo-cobrar-input"
                                                id="mod-sueldo-a-cobrar-10lbs" value="">
                                            <small class="sueldo-cobrar-descripcion">
                                                <i class="bi bi-info-circle"></i>

                                            </small>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </form>
                    </div>


                </div>
            </div>
            <div class="modal-footer d-flex justify-content-between">
                <span class="badge bg-success fs-6 p-2" id="nombre-empleado-modal"></span>

                <div>
                    <button type="button"
                        class="btn btn-secondary"
                        data-bs-dismiss="modal"
                        id="btn-cancelar-conceptos">
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>