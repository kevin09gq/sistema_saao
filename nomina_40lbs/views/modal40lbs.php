<div class="modal fade" id="modal-40lbs" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Detalles del empleado</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div class="modal-body">
                <!-- Barra de navegación -->
                <ul class="nav nav-tabs mb-3" id="modalTabs-40lbs" role="tablist">
                    <li class="nav-item" role="presentation">
                        <button class="nav-link active" id="tab-info-40lbs" data-bs-toggle="tab" data-bs-target="#tab_info-40lbs" type="button" role="tab" aria-controls="tab_info-40lbs" aria-selected="true">Trabajador</button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="tab-registros-40lbs" data-bs-toggle="tab" data-bs-target="#tab_registros-40lbs" type="button" role="tab" aria-controls="tab_registros-40lbs" aria-selected="false">Registros</button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="tab-modificar-detalles-40lbs" data-bs-toggle="tab" data-bs-target="#tab_modificar_detalles-40lbs" type="button" role="tab" aria-controls="tab_modificar_detalles-40lbs" aria-selected="false">Modificar Detalles</button>
                    </li>
                </ul>

                <div class="tab-content">

                    <!-- INFORMACION DEL 40lbs -->
                    <div class="tab-pane fade show active" id="tab_info-40lbs" role="tabpanel" aria-labelledby="tab-info-40lbs">
                        <h6 class="mb-3">Información básica del empleado</h6>
                        <div class="empleado-info">
                            <div class="info-row"><span class="info-label">Clave:</span><span class="info-value" id="campo-clave-40lbs"></span></div>
                            <div class="info-row"><span class="info-label">Nombre:</span><span class="info-value" id="campo-nombre-40lbs"></span></div>
                            <div class="info-row"><span class="info-label">Departamento:</span><span class="info-value" id="campo-departamento-40lbs"></span></div>
                            <div class="info-row"><span class="info-label">Puesto:</span><span class="info-value" id="campo-puesto-40lbs"></span></div>
                            <input type="hidden" id="campo-id-empresa-40lbs" value="">
                        </div>
                    </div>

                    <!-- REGISTROS BIOMETRICO Y HORARIO OFICIALES -->
                    <div class="tab-pane fade" id="tab_registros-40lbs" role="tabpanel" aria-labelledby="tab-registros-40lbs">

                        <!-- Botones para cambiar vista como mini-tabs -->
                        <div class="d-flex justify-content-center mb-3">
                            <div class="btn-group" role="group" aria-label="Vista de registros">
                                <button type="button" class="btn btn-outline-success active mini-tab-registros" id="btn-biometrico-40lbs">
                                    <i class="bi bi-check-circle"></i> Biometrico
                                </button>

                                <button type="button" class="btn btn-outline-primary mini-tab-registros" id="btn-biometrico-redondeado-40lbs">
                                    <i class="bi bi-clock-history"></i> Horarios Oficial
                                </button>
                            </div>
                        </div>

                        <!-- Tabla de Registros del Biometrico -->
                        <div class="table-container" id="tabla-biometrico-40lbs">
                            <table class=" custom-table">
                                <thead>
                                    <tr>
                                        <th>Día</th>
                                        <th>Fecha</th>
                                        <th>Entrada</th>
                                        <th>Salida</th>
                                        <th>Acción</th>
                                    </tr>
                                </thead>
                                <tbody id="tbody-biometrico-40lbs">

                                </tbody>
                            </table>
                        </div>

                        <!-- Tabla de Biometricos Redondeados -->
                        <div class="table-container" id="tabla-biometrico-redondeado" hidden>


                            <table class="custom-table text-center">
                                <thead>
                                    <tr>
                                        <th>Día</th>
                                        <th>Entrada</th>
                                        <th>Salida <br> Comida</th>
                                        <th>Entrada <br> Comida</th>
                                        <th>Salida</th>
                                        <th>Hrs <br> Comida</th>
                                        <th>Min <br> Trabajados</th>
                                        <th>Hrs <br> Trabajados</th>
                                        <th>Acción</th>

                                    </tr>
                                </thead>
                                <tbody id="tbody-biometrico-redondeado-40lbs">
                                    <!-- Los datos se llenarán con JavaScript -->

                                </tbody>

                            </table>
                        </div>

                        <!-- Eventos Especiales -->
                        <div class="eventos-especiales-container">

                            <!-- Primera fila: Entradas Tempranas y Salidas Tardías -->
                            <div class="row">
                                <!-- Entradas Tempranas -->
                                <div class="col-md-6 mb-3">
                                    <div class="evento-card entrada-temprana">
                                        <div class="evento-header">
                                            <i class="bi bi-sunrise"></i>
                                            <span>Entradas Tempranas</span>
                                        </div>
                                        <div class="evento-content" id="entradas-tempranas-40lbs">

                                        </div>
                                        <div class="evento-total">
                                            <strong>Total: <span id="total-entradas-tempranas-40lbs"></span></strong>
                                        </div>
                                    </div>
                                </div>

                                <!-- Salidas Tardías -->
                                <div class="col-md-6 mb-3">
                                    <div class="evento-card salida-tardia">
                                        <div class="evento-header">
                                            <i class="bi bi-sunset"></i>
                                            <span>Salidas Tardías</span>
                                        </div>
                                        <div class="evento-content" id="salidas-tardias-40lbs">

                                        </div>
                                        <div class="evento-total">
                                            <strong>Total: <span id="total-salidas-tardias-40lbs"></span></strong>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Segunda fila: Salidas Tempranas y Olvidos del Checador -->
                            <div class="row">
                                <!-- Salidas Tempranas -->
                                <div class="col-md-6 mb-3">
                                    <div class="evento-card salida-temprana">
                                        <div class="evento-header">
                                            <i class="bi bi-clock"></i>
                                            <span>Salidas Tempranas</span>
                                        </div>
                                        <div class="evento-content" id="salidas-tempranas-40lbs">

                                        </div>
                                        <div class="evento-total">
                                            <strong>Total: <span id="total-salidas-tempranas-40lbs"></span></strong>
                                        </div>
                                    </div>
                                </div>

                                <!-- Olvidos del Checador -->
                                <div class="col-md-6 mb-3">
                                    <div class="evento-card olvido-checador" id="olvidos-checador-card-40lbs">
                                        <div class="evento-header">
                                            <i class="bi bi-exclamation-triangle"></i>
                                            <span>Olvidos del Checador</span>
                                        </div>
                                        <div class="evento-content" id="olvidos-checador-40lbs">

                                        </div>
                                        <div class="evento-total">
                                            <strong>Total: <span id="total-olvidos-checador-40lbs"></span></strong>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Tercera fila: Retardos y Faltas -->
                            <div class="row">
                                <!-- Retardos -->
                                <div class="col-md-6 mb-3">
                                    <div class="evento-card retardo" id="retardos-card-40lbs">
                                        <div class="evento-header">
                                            <i class="bi bi-clock-fill"></i>
                                            <span>Retardos</span>
                                        </div>
                                        <div class="evento-content" id="retardos-40lbs">

                                        </div>
                                        <div class="evento-total">
                                            <strong>Total: <span id="total-retardos-40lbs"></span></strong>
                                        </div>
                                    </div>
                                </div>
                                <!-- Faltas -->
                                <div class="col-md-6 mb-3">
                                    <div class="evento-card falta" id="inasistencias-card-40lbs">
                                        <div class="evento-header">
                                            <i class="bi bi-x-circle"></i>
                                            <span>Inasistencias</span>
                                        </div>
                                        <div class="evento-content" id="inasistencias-content-40lbs">

                                        </div>
                                        <div class="evento-total">
                                            <strong>Total: <span id="total-inasistencias-40lbs"></span></strong>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Cuarta fila: Análisis de Permisos y Comidas 
                            <div class="row">-->
                            <!-- Análisis de Permisos y Comidas 
                                <div class="col-md-12 mb-3">
                                    <div class="evento-card analisis-permisos" style="border-color: #9b59b6;">
                                        <div class="evento-header">
                                            <i class="bi bi-diagram-3"></i>
                                            <span>Análisis de Permisos y Comidas</span>
                                        </div>
                                        <div class="evento-content" id="analisis-permisos-comida-content-40lbs" style="max-height: 400px; overflow-y: auto;">

                                        </div>
                                        <div class="evento-total">
                                            <strong>Total: <span id="total-analisis-permisos-comida-40lbs"></span></strong>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            -->



                        </div>


                    </div>

                    <!-- EDITAR Y AGREGAR CONCEPTOS (PROPIEDADES DEL EMPLEADO) -->
                    <div class="tab-pane fade" id="tab_modificar_detalles-40lbs" role="tabpanel" aria-labelledby="tab-modificar-detalles-40lbs">
                        <form id="form-modificar-sueldo">

                            <!-- PERCEPCIONES -->
                            <div class="card shadow-sm mb-3 mod-card">
                                <div class="card-header mod-card-header-azul">
                                    <i class="bi bi-cash-coin"></i> Percepciones
                                </div>
                                <div class="card-body mod-card-body-azul">
                                    <!-- Primera fila: Campos principales con altura fija -->
                                    <div class="row mb-4">
                                        <div class="col-md-4 d-flex flex-column">
                                            <label class="form-label fw-semibold">Sueldo Neto ($)</label>
                                            <div class="flex-grow-1 d-flex align-items-end">
                                                <input type="number" step="0.01" class="form-control mod-input-azul" id="mod-sueldo-neto-40lbs" value="" placeholder="0.00">
                                            </div>
                                        </div>

                                        <div class="col-md-4 d-flex flex-column">
                                            <label class="form-label fw-semibold">Incentivo ($)</label>
                                            <div class="flex-grow-1 d-flex align-items-end">
                                                <div class="input-group w-100">
                                                    <input type="number" step="0.01" class="form-control mod-input-azul" id="mod-incentivo-40lbs" value="" placeholder="0.00">
                                                    <button type="button" class="btn btn-outline-secondary" id="btn-aplicar-incentivo-40lbs" title="Aplicar Incentivo">
                                                        <i class="bi bi-calculator"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="col-md-4 d-flex flex-column">
                                            <label class="form-label fw-semibold">Total Sueldo Extra ($)</label>
                                            <small class="text-muted mb-1">Calculado automáticamente</small>
                                            <input type="number" step="0.01" class="form-control mod-input-azul mod-input-readonly" id="mod-total-extra-40lbs" value="" placeholder="0.00" readonly>
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

                                    <div class="row mb-4">
                                         <div class="col-md-6 d-flex flex-column">
                                            <label class="form-label fw-semibold">Horas Extras ($)</label>
                                            <div class="flex-grow-1 d-flex align-items-end">
                                                <input type="number" step="0.01" class="form-control mod-input-azul" id="mod-horas-extras-40lbs" value="" placeholder="0.00">
                                            </div>
                                        </div>
                                         <div class="col-md-6 d-flex flex-column">
                                            <label class="form-label fw-semibold">Bono de Antiguedad ($)</label>
                                            <div class="flex-grow-1 d-flex align-items-end">
                                                <input type="number" step="0.01" class="form-control mod-input-azul" id="mod-bono-antiguedad-40lbs" value="" placeholder="0.00">
                                            </div>
                                        </div>
                                    </div>

                                    
                                    <div class="row mb-4">
                                         <div class="col-md-6 d-flex flex-column">
                                            <label class="form-label fw-semibold">Actividades Especiales ($)</label>
                                            <div class="flex-grow-1 d-flex align-items-end">
                                                <input type="number" step="0.01" class="form-control mod-input-azul" id="mod-actividades-especiales-40lbs" value="" placeholder="0.00">
                                            </div>
                                        </div>
                                         <div class="col-md-6 d-flex flex-column">
                                            <label class="form-label fw-semibold">Puesto ($)</label>
                                            <div class="flex-grow-1 d-flex align-items-end">
                                                <input type="number" step="0.01" class="form-control mod-input-azul" id="mod-puesto-40lbs" value="" placeholder="0.00">
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <!-- Contenedor para conceptos adicionales -->
                                    <div class="row" id="contenedor-conceptos-adicionales-40lbs">
                                        <!-- Los conceptos adicionales se cargarán aquí dinámicamente -->
                                    </div>

                                    <!-- Botón para agregar más conceptos -->
                                    <div class="row">
                                        <div class="col-12 text-center">
                                            <button type="button" class="btn btn-outline-primary btn-sm" id="btn-agregar-percepcion-40lbs">
                                                <i class="bi bi-plus-circle"></i> Agregar Otro Concepto
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>



                            <!-- CONCEPTOS -->
                            <div class="card shadow-sm mb-3 mod-card">
                                <div class="card-header mod-card-header-amarillo">
                                    <i class="bi bi-dash-circle"></i> Conceptos
                                </div>
                                <div class="card-body mod-card-body-amarillo">
                                    <div class="row mb-3" id="contenedor-conceptos-40lbs">
                                        <div class="col-md-4 mb-2">
                                            <label class="form-label fw-semibold">ISR ($)</label>
                                            <div class="input-group">
                                                <input type="number" step="0.01" class="form-control mod-input-amarillo" id="mod-isr-40lbs" value="" placeholder="0.00">
                                                <button type="button" class="btn btn-outline-secondary" id="btn-aplicar-isr-40lbs" title="Aplicar Nuevo ISR">
                                                    <i class="bi bi-calculator"></i>
                                                </button>
                                            </div>
                                        </div>
                                        <div class="col-md-4 mb-2">
                                            <label class="form-label fw-semibold">IMSS ($)</label>
                                            <div class="input-group">
                                                <input type="number" step="0.01" class="form-control mod-input-amarillo" id="mod-imss-40lbs" value="" placeholder="0.00">
                                                <button type="button" class="btn btn-outline-secondary" id="btn-aplicar-imss-40lbs" title="Aplicar Nuevo IMSS">
                                                    <i class="bi bi-calculator"></i>
                                                </button>
                                            </div>
                                        </div>
                                        <div class="col-md-4 mb-2">
                                            <label class="form-label fw-semibold">INFONAVIT ($)</label>
                                            <div class="input-group">
                                                <input type="number" step="0.01" class="form-control mod-input-amarillo" id="mod-infonavit-40lbs" value="" placeholder="0.00">
                                                <button type="button" class="btn btn-outline-secondary" id="btn-aplicar-infonavit-40lbs" title="Aplicar Nuevo INFONAVIT">
                                                    <i class="bi bi-calculator"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="row mb-3">
                                        <div class="col-md-4 mb-2">
                                            <label class="form-label fw-semibold">AJUSTES AL SUB ($)</label>
                                            <div class="input-group">
                                                <input type="number" step="0.01" class="form-control mod-input-amarillo" id="mod-ajustes-sub-40lbs" value="" placeholder="0.00">
                                                <button type="button" class="btn btn-outline-secondary" id="btn-aplicar-ajuste-sub-40lbs" title="Aplicar Nuevo Ajuste al Sub">
                                                    <i class="bi bi-calculator"></i>
                                                </button>
                                            </div>
                                        </div>

                                        <div class="col-md-4 mb-2">
                                            <label class="form-label fw-semibold">TOTAL CONCEPTOS ($)</label>
                                            <div class="input-group">
                                                <input type="number" step="0.01" class="form-control mod-input-amarillo-total-conceptos" id="mod-total-conceptos-40lbs" value="" placeholder="0.00" readonly>
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
                                    <div class="row mb-4" id="contenedor-deducciones-40lbs">
                                        <div class="col-md-4 d-flex flex-column">
                                            <label class="form-label fw-semibold">Dispersión Tarjeta ($)</label>
                                            <div class="input-group">
                                                <input type="number" step="0.01" class="form-control mod-input-rojo" id="mod-tarjeta-40lbs" value="" placeholder="0.00">
                                                <button type="button" class="btn btn-outline-secondary" id="btn-aplicar-tarjeta-40lbs" title="Aplicar Tarjeta">
                                                    <i class="bi bi-credit-card"></i>
                                                </button>
                                            </div>
                                        </div>
                                        <div class="col-md-4 d-flex flex-column">
                                            <label class="form-label fw-semibold">Préstamos ($)</label>
                                            <input type="number" step="0.01" class="form-control mod-input-rojo" id="mod-prestamo-40lbs" value="" placeholder="0.00">
                                        </div>
                                        <div class="col-md-4 d-flex flex-column">
                                            <label class="form-label fw-semibold">Checador ($)</label>
                                            <div class="input-group">
                                                <input type="number" step="0.01" class="form-control mod-input-rojo" id="mod-checador-40lbs" value="" placeholder="0.00">

                                                <button type="button" class="btn btn-outline-secondary" id="btn-aplicar-checador-40lbs" title="Aplicar Checador">
                                                    <i class="bi bi-calculator"></i>
                                                </button>
                                            </div>
                                        </div>

                                    </div>

                                    <!-- Separador visual -->
                                    <div class="row">
                                        <hr class="mod-separador">
                                        <!-- Historial Detallado de Olvidos -->
                                        <div class="row mb-3">
                                            <div class="col-12" id="historial-olvidos-40lbs">
                                                <h6 class="fw-semibold text-danger mb-3">
                                                    <i class="bi bi-exclamation-triangle-fill"></i> Historial de Olvidos por Día
                                                </h6>
                                                <div id="contenedor-historial-olvidos" class="historial-olvidos-container">
                                                    <!-- Se llenará con JavaScript -->
                                                </div>
                                            </div>
                                        </div>

                                        <div class="row mb-3">
                                            <div class="col-md-4 mb-2">
                                                <label class="form-label fw-semibold">Total Retardos ($)</label>
                                                <div class="input-group">
                                                    <input type="number" step="0.01" class="form-control mod-input-rojo" id="mod-retardos-40lbs" value="" placeholder="0.00">
                                                    <button type="button" class="btn btn-outline-secondary" id="btn-calcular-retardos-40lbs" title="Calcular desde historial">
                                                        <i class="bi bi-calculator"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Historial Detallado de Retardos -->
                                        <div class="row mb-3">
                                            <div class="col-12" id="historial-retardos-40lbs">
                                                <h6 class="fw-semibold text-warning mb-3">
                                                    <i class="bi bi-clock-history"></i> Historial de Retardos por Día
                                                </h6>
                                                <div id="contenedor-historial-retardos" class="historial-retardos-container">
                                                    <!-- Se llenará con JavaScript -->
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Separador visual -->
                                        <hr class="mod-separador">

                                        <!-- Sección de Inasistencias -->
                                        <div class="row mb-3">
                                            <div class="col-md-4 mb-2">
                                                <label class="form-label fw-semibold">Inasistencias($)</label>
                                                <div class="input-group">
                                                    <input type="number" step="0.01" class="form-control mod-input-rojo" id="mod-inasistencias-40lbs" value="" placeholder="0.00">
                                                    <button type="button" class="btn btn-outline-secondary" id="btn-calcular-inasistencias-40lbs" title="Calcular desde historial">
                                                        <i class="bi bi-calculator"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Historial Detallado de Inasistencias -->
                                        <div class="row mb-3">
                                            <div class="col-12">
                                                <h6 class="fw-semibold text-info mb-3">
                                                    <i class="bi bi-calendar-x"></i> Historial de Inasistencias por Día
                                                </h6>

                                                <!-- Formulario para agregar inasistencia manual -->
                                                <div class="card bg-light mb-3">
                                                    <div class="card-body">
                                                        <div class="row g-2 align-items-end" id="add-inasistencia-40lbs">
                                                            <div class="col-md-4">
                                                                <label class="form-label fw-semibold small">Día de la Semana</label>
                                                                <select class="form-select form-select-sm" id="select-dia-inasistencia-40lbs">
                                                                    <option value="">Seleccionar día...</option>
                                                                    <option value="Lunes">Lunes</option>
                                                                    <option value="Martes">Martes</option>
                                                                    <option value="Miércoles">Miércoles</option>
                                                                    <option value="Jueves">Jueves</option>
                                                                    <option value="Viernes">Viernes</option>
                                                                    <option value="Sábado">Sábado</option>
                                                                    <option value="Domingo">Domingo</option>
                                                                </select>
                                                            </div>
                                                            <div class="col-md-4">
                                                                <label class="form-label fw-semibold small">Descuento ($)</label>
                                                                <input type="number" step="0.01" class="form-control form-control-sm" id="input-descuento-inasistencia-40lbs" placeholder="0.00" min="0">
                                                            </div>
                                                            <div class="col-md-4">
                                                                <button type="button" class="btn btn-info btn-sm w-100" id="btn-agregar-inasistencia-40lbs">
                                                                    <i class="bi bi-plus-circle"></i> Agregar Inasistencia
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div id="contenedor-historial-inasistencias-40lbs" class="historial-inasistencias-container">
                                                    <!-- El historial se cargará dinámicamente aquí -->
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
                                                    <input type="number" step="0.01" class="form-control mod-input-rojo mod-input-readonly" id="mod-permisos-40lbs" value="" placeholder="0.00" readonly>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Historial Detallado de Permisos -->
                                        <div class="row mb-3">
                                            <div class="col-12">
                                                <h6 class="fw-semibold text-warning mb-3">
                                                    <i class="bi bi-calendar2-check"></i> Historial de Permisos por Día
                                                </h6>

                                                <!-- Formulario para agregar permiso manual -->
                                                <div class="card bg-light mb-3">
                                                    <div class="card-body">
                                                        <div class="row g-2 align-items-end" id="add-permiso-40lbs">
                                                            <div class="col-md-3">
                                                                <label class="form-label fw-semibold small">Día de la Semana</label>
                                                                <select class="form-select form-select-sm" id="select-dia-permiso-40lbs">
                                                                    <option value="">Seleccionar día...</option>
                                                                    <option value="Lunes">Lunes</option>
                                                                    <option value="Martes">Martes</option>
                                                                    <option value="Miércoles">Miércoles</option>
                                                                    <option value="Jueves">Jueves</option>
                                                                    <option value="Viernes">Viernes</option>
                                                                    <option value="Sábado">Sábado</option>
                                                                    <option value="Domingo">Domingo</option>
                                                                </select>
                                                            </div>
                                                            <div class="col-md-3">
                                                                <label class="form-label fw-semibold small">Minutos</label>
                                                                <input type="number" step="1" class="form-control form-control-sm" id="input-minutos-permiso-40lbs" placeholder="0" min="0">
                                                            </div>
                                                            <div class="col-md-3">
                                                                <label class="form-label fw-semibold small">Costo por Minuto ($)</label>
                                                                <input type="number" step="0.01" class="form-control form-control-sm" id="input-costo-minuto-permiso-40lbs" placeholder="0.00" min="0">
                                                            </div>
                                                            <div class="col-md-3">
                                                                <label class="form-label fw-semibold small">Descuento ($)</label>
                                                                <input type="number" step="0.01" class="form-control form-control-sm" id="input-descuento-permiso-40lbs" placeholder="0.00" min="0">
                                                            </div>
                                                            <div class="col-md-3">
                                                                <button type="button" class="btn btn-warning btn-sm w-100" id="btn-agregar-permiso-40lbs">
                                                                    <i class="bi bi-plus-circle"></i> Agregar Permiso
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div id="contenedor-historial-permisos-40lbs" class="historial-permisos-container">
                                                    <!-- El historial se cargará dinámicamente aquí -->
                                                </div>
                                            </div>
                                        </div>

                                        <!-- INTERFAZ DE UNIFORME -->
                                        <div class="row mb-3">
                                            <div class="col-md-4 mb-2">
                                                <label class="form-label fw-semibold">Uniforme (cantidad)</label>
                                                <input type="number" step="1" class="form-control mod-input-rojo mod-input-readonly" id="mod-uniforme-40lbs" value="" placeholder="0" readonly>
                                            </div>
                                        </div>

                                        <!-- Historial Detallado de Uniforme -->
                                        <div class="row mb-3">
                                            <div class="col-12">
                                                <h6 class="fw-semibold text-secondary mb-3">
                                                    <i class="bi bi-box-seam"></i> Historial de Uniforme por Folio
                                                </h6>
                                                <!-- Formulario para agregar uniforme manual -->
                                                <div class="card bg-light mb-3">
                                                    <div class="card-body">
                                                        <div class="row g-2 align-items-end" id="add-uniforme-40lbs">
                                                            <div class="col-md-4">
                                                                <label class="form-label fw-semibold small">Folio</label>
                                                                <input type="text" class="form-control form-control-sm" id="input-folio-uniforme-40lbs" placeholder="Folio...">
                                                            </div>
                                                            <div class="col-md-4">
                                                                <label class="form-label fw-semibold small">Cantidad</label>
                                                                <input type="number" step="1" class="form-control form-control-sm" id="input-cantidad-uniforme-40lbs" placeholder="0" min="0">
                                                            </div>
                                                            <div class="col-md-4">
                                                                <button type="button" class="btn btn-secondary btn-sm w-100" id="btn-agregar-uniforme-40lbs">
                                                                    <i class="bi bi-plus-circle"></i> Agregar Uniforme
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div id="contenedor-historial-uniforme-40lbs" class="historial-uniforme-container">
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
                                                <input type="number" step="0.01" class="form-control mod-input-rojo" id="mod-fagafetcofia-40lbs" value="" placeholder="0.00">
                                            </div>
                                        </div>

                                        <!-- Botón para agregar otra deducción -->
                                        <div class="row mb-3">
                                            <div class="col-12 text-center">
                                                <button type="button" class="btn btn-outline-danger btn-sm" id="btn-agregar-deduccion-40lbs">
                                                    <i class="bi bi-plus-circle"></i> Agregar Otra Deducción
                                                </button>
                                            </div>
                                        </div>

                                        <!-- Contenedor para deducciones adicionales -->
                                        <div class="row" id="contenedor-deducciones-adicionales-40lbs">
                                            <!-- Las deducciones adicionales se cargarán aquí dinámicamente -->
                                        </div>


                                    </div>
                                </div>
                            </div>




                            <!-- SUELDO A COBRAR -->
                            <div class="card shadow-sm mb-3 mod-card" id="mod-sueldo-40lbs">
                                <div class="card-header mod-card-header-verde">
                                    <i class="bi bi-currency-dollar"></i> Sueldo a Cobrar
                                </div>
                                <div class="card-body mod-card-body-verde">
                                    <!-- Opciones de redondeo: checkbox + modo -->
                                    <div class="row mb-3">
                                        <div class="col-md-6 offset-md-3">
                                            <div class="form-check form-switch">
                                                <input class="form-check-input" type="checkbox" id="mod-redondear-sueldo-40lbs">
                                                <label class="form-check-label fw-semibold" for="mod-redondear-sueldo-40lbs">Redondear sueldo a cobrar</label>
                                            </div>

                                        </div>
                                    </div>

                                    <div class="row justify-content-center">
                                        <div class="col-md-6 text-center">
                                            <label class="sueldo-cobrar-label">
                                                <i class="bi bi-cash-stack"></i> Total a Cobrar
                                            </label>
                                            <input type="number" step="0.01" class="sueldo-cobrar-input"
                                                id="mod-sueldo-a-cobrar-40lbs" value="">
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
                        Cancelar
                    </button>

                    <button type="button"
                        class="btn btn-success"
                        id="btn-guardar-propiedades">
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>