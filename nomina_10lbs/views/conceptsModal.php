<div class="modal-detalles" id="modal-detalles" style="display:none;">
    <div class="modal-detalles-content">
        <span class="modal-detalles-close" id="cerrar-modal-detalles">&times;</span>
        <ul class="nav nav-tabs mb-3" id="modalTabs" role="tablist">
            <li class="nav-item" role="presentation">
                <button class="nav-link active" id="tab-info" data-bs-toggle="tab" data-bs-target="#tab_info" type="button" role="tab" aria-controls="tab_info" aria-selected="true">
                    Trabajador
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="tab-registros" data-bs-toggle="tab" data-bs-target="#tab_registros" type="button" role="tab" aria-controls="tab_registros" aria-selected="false">
                    Registros
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="tab-modificar-detalles" data-bs-toggle="tab" data-bs-target="#tab_modificar_detalles" type="button" role="tab" aria-controls="tab_modificar_detalles" aria-selected="false">
                    Modificar Detalles
                </button>
            </li>
        </ul>
        <div class="tab-content">
            <!-- Info Trabajador -->
            <div class="tab-pane fade show active" id="tab_info" role="tabpanel" aria-labelledby="tab-info">
                <h4 class="tab-title">Detalles del empleado</h4>

                <!-- Información básica del empleado -->
                <div class="empleado-info">
                    <div class="info-row">
                        <span class="info-label">Clave:</span>
                        <span class="info-value" id="campo-clave"></span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Nombre:</span>
                        <span class="info-value" id="campo-nombre"></span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Departamento:</span>
                        <span class="info-value">PRODUCCION 40 LIBRAS</span>
                    </div>
                </div>
            </div>

            <!-- Registros -->
            <div class="tab-pane fade" id="tab_registros" role="tabpanel" aria-labelledby="tab-registros">
                <h4 class="tab-title">Registros de Entrada y Salida</h4>

                <!-- Botones para cambiar vista como mini-tabs -->
                <div class="d-flex justify-content-center mb-3">
                    <div class="btn-group" role="group" aria-label="Vista de registros">
                        <button type="button" class="btn btn-outline-success mini-tab-registros active" id="btn-biometrico">
                            <i class="bi bi-check-circle"></i> biometrico
                        </button>
                        <button type="button" class="btn btn-outline-primary mini-tab-registros" id="btn-horarios-oficiales">
                            <i class="bi bi-clock-history"></i> horarios-oficiales
                        </button>
                    </div>
                </div>

                <!-- Tabla de Registros del Checador -->
                <div class="table-container" id="tabla-checador">
                    <table class=" custom-table">
                        <thead>
                            <tr>
                                <th>Día</th>
                                <th>Fecha</th>
                                <th>Entrada</th>
                                <th>Salida</th>
                            </tr>
                        </thead>
                        <tbody>
                            <!-- Los datos se llenarán con JavaScript -->
                        </tbody>
                    </table>
                </div>


                <!-- Tabla de Registros BD -->
                <div class="table-container" id="tabla-horarios-oficiales" hidden>
                    <table class="custom-table">
                        <thead>
                            <tr>
                                <th>Día</th>
                                <th>Entrada</th>
                                <th>Salida Comida</th>
                                <th>Entrada Comida</th>
                                <th>Salida</th>
                                
                            </tr>
                        </thead>
                        <tbody id="horarios-oficiales-body">
                            <!-- Los datos se llenarán con JavaScript -->

                        </tbody>
                       
                    </table>
                </div>

                <!-- Eventos Especiales -->
                <div class="eventos-especiales-container">
                    <h5 class="eventos-title">
                        <i class="bi bi-clock-history"></i> Eventos Especiales
                    </h5>

                    <!-- Primera fila: Entradas Tempranas y Salidas Tardías Eliminado temporal-->

                    <!-- Segunda fila: Salidas Tempranas y Olvidos del Checador -->
                    <div class="row">

                        <!-- Olvidos del Checador -->
                        <div class="col-md-6 mb-3">
                            <div class="evento-card olvido-checador" id="olvidos-checador-card">
                                <div class="evento-header">
                                    <i class="bi bi-exclamation-triangle"></i>
                                    <span>Olvidos del Checador</span>
                                </div>
                                <div class="evento-content" id="olvidos-checador-content">

                                </div>
                                <div class="evento-total">
                                    <strong>Total: <span id="total-olvidos-checador"></span></strong>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Tercera fila: Retardos y Faltas -->
                    <div class="row">
                        <!-- Retardos -->
                        <div class="col-md-6 mb-3">
                            <div class="evento-card retardo" id="retardos-card">
                                <div class="evento-header">
                                    <i class="bi bi-clock-fill"></i>
                                    <span>Retardos</span>
                                </div>
                                <div class="evento-content" id="retardos-content">

                                </div>
                                <div class="evento-total">
                                    <strong>Total: <span id="total-retardos"></span></strong>
                                </div>
                            </div>
                        </div>
                        <!-- Faltas -->
                        <div class="col-md-6 mb-3">
                            <div class="evento-card falta" id="faltas-card">
                                <div class="evento-header">
                                    <i class="bi bi-x-circle"></i>
                                    <span>Faltas (Días sin registro con horario oficial)</span>
                                </div>
                                <div class="evento-content" id="faltas-content">

                                </div>
                                <div class="evento-total">
                                    <strong>Total: <span id="total-faltas"></span></strong>
                                </div>
                            </div>
                        </div>
                    </div>


                </div>

            </div>
            <!-- Modificar Detalles -->
            <div class="tab-pane fade" id="tab_modificar_detalles" role="tabpanel" aria-labelledby="tab-modificar-detalles">
                <h4 class="mod-detalles-title"><i class="bi bi-pencil-square"></i> Modificar Detalles</h4>
                <form id="form-modificar-sueldo">
                    <div class="card shadow-sm mb-3 mod-card">
                        <div class="card-header mod-card-header-azul">
                            <i class="bi bi-cash-coin"></i> Percepciones
                        </div>
                        <div class="card-body mod-card-body-azul">
                            <!-- Primera fila: Campos principales con altura fija -->
                            <div class="row mb-4">
                                <div class="col-md-6 d-flex flex-column">
                                    <label class="form-label fw-semibold">Sueldo Semanal ($)</label>
                                    <div class="flex-grow-1 d-flex align-items-end">
                                        <input type="number" step="0.01" class="form-control mod-input-azul" id="mod-sueldo-semanal" value="" placeholder="0.00">
                                    </div>
                                </div>

                                <div class="col-md-6 d-flex flex-column">
                                    <label class="form-label fw-semibold">Total Sueldo Extra ($)</label>
                                    <small class="text-muted mb-1">Calculado automáticamente</small>
                                    <input type="number" step="0.01" class="form-control mod-input-azul mod-input-readonly" id="mod-total-extra" value="" placeholder="0.00" readonly>
                                </div>
                            </div>

                            <!-- Separador visual -->
                            <hr class="mod-separador">

                            <!-- Título de componentes -->
                            <div class="row mb-3">
                                <div class="col-12">
                                    <h6 class="componentes-title">
                                        <i class="bi bi-list-ul"></i> Componentes del Sueldo Extra
                                    </h6>
                                    <small class="componentes-subtitle">Configure los diferentes conceptos que conforman el sueldo extra</small>
                                </div>
                            </div>

                            <!-- Componentes organizados con altura uniforme -->
                            <div class="row" id="componentes-sueldo-extra">
                                <div class="col-md-3 mb-3 d-flex flex-column">
                                    <label class="form-label fw-normal">Vacaciones</label>
                                    <div class="flex-grow-1 d-flex align-items-end">
                                        <input type="number" step="0.01" class="form-control mod-input-azul componente-extra" id="mod-vacaciones" value="" placeholder="0.00">
                                    </div>
                                </div>

                            </div>

                            <!-- Contenedor para conceptos adicionales -->
                            <div class="row" id="contenedor-conceptos-adicionales">
                                <!-- Los conceptos adicionales se cargarán aquí dinámicamente -->
                            </div>

                            <!-- Botón para agregar más conceptos -->
                            <div class="row">
                                <div class="col-12 text-center">
                                    <button type="button" class="btn btn-outline-primary btn-sm" id="btn-agregar-concepto">
                                        <i class="bi bi-plus-circle"></i> Agregar Otro Concepto
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="card shadow-sm mb-3 mod-card">
                        <div class="card-header mod-card-header-amarillo">
                            <i class="bi bi-dash-circle"></i> Conceptos
                        </div>
                        <div class="card-body mod-card-body-amarillo">
                            <div class="row mb-3">
                                <div class="col-md-4 mb-2">
                                    <label class="form-label fw-semibold">ISR ($)</label>
                                    <input type="number" step="0.01" class="form-control mod-input-amarillo" id="mod-isr" value="" placeholder="0.00">
                                </div>
                                <div class="col-md-4 mb-2">
                                    <label class="form-label fw-semibold">IMSS ($)</label>
                                    <input type="number" step="0.01" class="form-control mod-input-amarillo" id="mod-imss" value="" placeholder="0.00">
                                </div>
                                <div class="col-md-4 mb-2">
                                    <label class="form-label fw-semibold">INFONAVIT ($)</label>
                                    <input type="number" step="0.01" class="form-control mod-input-amarillo" id="mod-infonavit" value="" placeholder="0.00">
                                </div>
                            </div>

                            <div class="row mb-3">
                                <div class="col-md-4 mb-2">
                                    <label class="form-label fw-semibold">AJUSTES AL SUB ($)</label>
                                    <input type="number" step="0.01" class="form-control mod-input-amarillo" id="mod-ajustes-sub" value="" placeholder="0.00">
                                </div>

                            </div>
                        </div>
                    </div>
                    <div class="card shadow-sm mb-3 mod-card">
                        <div class="card-header mod-card-header-rosa">
                            <i class="bi bi-dash-circle"></i> Deducciones
                        </div>
                        <div class="card-body mod-card-body-rosa">
                            <div class="row mb-3">
                                <div class="col-md-3 mb-2">
                                    <label class="form-label fw-semibold">Tarjeta ($)</label>
                                    <div class="input-group">
                                        <input type="number" step="0.01" class="form-control mod-input-rosa" id="mod-tarjeta" value="" placeholder="0.00">
                                        <button type="button" class="btn btn-outline-secondary" id="btn-aplicar-tarjeta" title="Aplicar Nueva Tarjeta">
                                            <i class="bi bi-credit-card"></i>
                                        </button>
                                    </div>
                                </div>
                                <div class="col-md-3 mb-2">
                                    <label class="form-label fw-semibold">Préstamo ($)</label>
                                    <div class="input-group">
                                        <input type="number" step="0.01" class="form-control mod-input-rosa" id="mod-prestamo" value="" placeholder="0.00">
                                        <button type="button" class="btn btn-outline-primary" id="btn-ver-prestamos" title="Ver Préstamos">
                                            <i class="bi bi-cash-stack"></i>
                                        </button>
                                    </div>
                                </div>
                                <div class="col-md-3 mb-2">
                                    <label class="form-label fw-semibold">Uniformes ($)</label>
                                    <input type="number" step="0.01" class="form-control mod-input-rosa" id="mod-uniformes" value="" placeholder="0.00">
                                </div>
                                <div class="col-md-3 mb-2">
                                    <label class="form-label fw-semibold">Checador ($)</label>
                                    <input type="number" step="0.01" class="form-control mod-input-rosa" id="mod-checador" value="" placeholder="0.00">
                                </div>
                            </div>
                            <!-- Sección de Retardos -->
                            <div class="row mb-3">
                                <div class="col-12">
                                    <h6 class="fw-semibold text-danger">
                                        <i class="bi bi-clock-fill"></i> Retardos
                                    </h6>
                                </div>
                            </div>
                            <div class="row mb-3">
                                <div class="col-md-4 mb-2">
                                    <label class="form-label fw-semibold">Total Retardos ($)</label>
                                    <input type="number" step="0.01" class="form-control mod-input-rosa" id="mod-retardos" value="" placeholder="0.00">
                                </div>
                            </div>

                            <!-- Historial Detallado de Retardos -->
                            <div class="row mb-3">
                                <div class="col-12">
                                    <h6 class="fw-semibold text-info">
                                        <i class="bi bi-calendar-check"></i> Historial de Retardos por Día 
                                    </h6>
                                </div>
                            </div>
                            <div class="row mb-3">
                                <div class="col-12">
                                    <div id="contenedor-historial-retardos" class="historial-retardos-container">
                                        <!-- El historial se cargará dinámicamente aquí -->
                                    </div>
                                </div>
                            </div>

                            <!-- Otras Deducciones -->
                            <div class="row mb-3">
                                <div class="col-md-4 mb-2">
                                    <label class="form-label fw-semibold">Inasistencias($)</label>
                                    <input type="number" step="0.01" class="form-control mod-input-rosa" id="mod-inasistencias" value="" placeholder="0.00">
                                </div>
                                <div class="col-md-4 mb-2">
                                    <label class="form-label fw-semibold">Permisos ($)</label>
                                    <input type="number" step="0.01" class="form-control mod-input-rosa" id="mod-permiso" value="" placeholder="0.00">
                                </div>
                            </div>


                            <div class="row" id="contenedor-deducciones-adicionales">
                            </div>
                            <div class="row">
                                <div class="col-12 text-center">
                                    <button type="button" class="btn btn-outline-danger btn-sm" id="btn-agregar-deduccion">
                                        <i class="bi bi-plus-circle"></i> Agregar Deducción Personalizada
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Sueldo a Cobrar -->
                    <div class="card shadow-sm mb-3 mod-card">
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
                                        id="mod-sueldo-a-cobrar" value="">
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
        <div class="modal-detalles-footer d-flex justify-content-between align-items-center">
            <div class="empleado-actual">
                <span class="badge bg-verde-empleado" id="nombre-empleado-modal"></span>
            </div>
            <div>
                <button type="button" id="btn-cancelar-conceptos" class="btn btn-secondary">Cancelar</button>
                <button type="button" id="btn-guardar-conceptos" class="btn btn-success">Guardar</button>
            </div>
        </div>
    </div>
</div>