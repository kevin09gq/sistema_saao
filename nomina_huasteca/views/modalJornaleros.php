<div class="modal fade" id="modal-jornaleros" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Detalles del empleado</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div class="modal-body">
                <!-- Barra de navegación -->
                <ul class="nav nav-tabs mb-3" id="modalTabs-jornaleros" role="tablist">
                    <li class="nav-item" role="presentation">
                        <button class="nav-link active" id="tab-info-jornaleros" data-bs-toggle="tab" data-bs-target="#tab_info-jornaleros" type="button" role="tab" aria-controls="tab_info-jornaleros" aria-selected="true">Trabajador</button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="tab-registros-jornaleros" data-bs-toggle="tab" data-bs-target="#tab_registros-jornaleros" type="button" role="tab" aria-controls="tab_registros-jornaleros" aria-selected="false">Registros</button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="tab-modificar-detalles-jornaleros" data-bs-toggle="tab" data-bs-target="#tab_modificar_detalles-jornaleros" type="button" role="tab" aria-controls="tab_modificar_detalles-jornaleros" aria-selected="false">Modificar Detalles</button>
                    </li>
                </ul>

                <div class="tab-content">

                    <!-- INFORMACION DEL jornalero -->
                    <div class="tab-pane fade show active" id="tab_info-jornaleros" role="tabpanel" aria-labelledby="tab-info-jornaleros">
                        <h6 class="mb-3">Información básica del empleado</h6>
                        <div class="empleado-info">
                            <div class="info-row"><span class="info-label">Clave:</span><span class="info-value" id="campo-clave-jornaleros"></span></div>
                            <div class="info-row"><span class="info-label">Nombre:</span><span class="info-value" id="campo-nombre-jornaleros"></span></div>
                            <div class="info-row"><span class="info-label">Departamento:</span><span class="info-value" id="campo-departamento-jornaleros"></span></div>
                            <div class="info-row"><span class="info-label">Puesto:</span><span class="info-value" id="campo-puesto-jornaleros"></span></div>
                            <input type="hidden" id="campo-id-empresa-jornaleros" value="">
                        </div>
                    </div>

                    <!-- REGISTROS BIOMETRICO Y HORARIO OFICIALES -->
                    <div class="tab-pane fade" id="tab_registros-jornaleros" role="tabpanel" aria-labelledby="tab-registros-jornaleros">

                        <!-- Botones para cambiar vista como mini-tabs -->
                        <div class="d-flex justify-content-center mb-3">
                            <div class="btn-group" role="group" aria-label="Vista de registros">
                                <button type="button" class="btn btn-outline-success active mini-tab-registros" id="btn-biometrico-jornaleros">
                                    <i class="bi bi-check-circle"></i> Biometrico
                                </button>

                                <button type="button" class="btn btn-outline-primary mini-tab-registros" id="btn-dias-trabajados-jornaleros">
                                    <i class="bi bi-clock-history"></i> Dias Trabajados
                                </button>
                            </div>
                        </div>

                        <!-- Tabla de Registros del Biometrico -->
                        <div class="table-container" id="tabla-biometrico-jornaleros">
                            <table class=" custom-table">
                                <thead>
                                    <tr>
                                        <th>Día</th>
                                        <th>Fecha</th>
                                        <th>Entrada</th>
                                        <th>Salida</th>
                                        
                                    </tr>
                                </thead>
                                <tbody id="tbody-biometrico-jornaleros">

                                </tbody>
                            </table>
                        </div>

                        <!-- Tabla de Registros BD -->
                        <div class="table-container" id="tabla-dias-trabajados-jornaleros" hidden>


                            <table class="custom-table">
                                <thead>
                                    <tr>
                                        <th>Día</th>
                                        <th>Fecha</th>
                                        <th>Cantidad</th>
                                        <th>Día Trabajado</th>
                                    </tr>
                                </thead>
                                <tbody id="tbody-dias-trabajados-jornaleros">
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
                                        <div class="evento-content" id="entradas-tempranas-jornaleros">

                                        </div>
                                        <div class="evento-total">
                                            <strong>Total: <span id="total-entradas-tempranas-jornaleros"></span></strong>
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
                                        <div class="evento-content" id="salidas-tardias-jornaleros">

                                        </div>
                                        <div class="evento-total">
                                            <strong>Total: <span id="total-salidas-tardias-jornaleros"></span></strong>
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
                                        <div class="evento-content" id="salidas-tempranas-jornaleros">

                                        </div>
                                        <div class="evento-total">
                                            <strong>Total: <span id="total-salidas-tempranas-jornaleros"></span></strong>
                                        </div>
                                    </div>
                                </div>

                                <!-- Olvidos del Checador -->
                                <div class="col-md-6 mb-3">
                                    <div class="evento-card olvido-checador" id="olvidos-checador-card-jornaleros">
                                        <div class="evento-header">
                                            <i class="bi bi-exclamation-triangle"></i>
                                            <span>Olvidos del Checador</span>
                                        </div>
                                        <div class="evento-content" id="olvidos-checador-jornaleros">

                                        </div>
                                        <div class="evento-total">
                                            <strong>Total: <span id="total-olvidos-checador-jornaleros"></span></strong>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Tercera fila: Retardos y Faltas -->
                            <div class="row">
                                <!-- Retardos -->
                                <div class="col-md-6 mb-3">
                                    <div class="evento-card retardo" id="retardos-card-jornaleros">
                                        <div class="evento-header">
                                            <i class="bi bi-clock-fill"></i>
                                            <span>Retardos</span>
                                        </div>
                                        <div class="evento-content" id="retardos-jornaleros">

                                        </div>
                                        <div class="evento-total">
                                            <strong>Total: <span id="total-retardos-jornaleros"></span></strong>
                                        </div>
                                    </div>
                                </div>
                                <!-- Faltas -->
                                <div class="col-md-6 mb-3">
                                    <div class="evento-card falta" id="inasistencias-card-jornaleros">
                                        <div class="evento-header">
                                            <i class="bi bi-x-circle"></i>
                                            <span>Inasistencias</span>
                                        </div>
                                        <div class="evento-content" id="inasistencias-content-jornaleros">

                                        </div>
                                        <div class="evento-total">
                                            <strong>Total: <span id="total-inasistencias-jornaleros"></span></strong>
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
                                        <div class="evento-content" id="analisis-permisos-comida-content-jornaleros" style="max-height: 400px; overflow-y: auto;">

                                        </div>
                                        <div class="evento-total">
                                            <strong>Total: <span id="total-analisis-permisos-comida-jornaleros"></span></strong>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            -->



                        </div>


                    </div>

                    <!-- EDITAR Y AGREGAR CONCEPTOS (PROPIEDADES DEL EMPLEADO) -->
                    <div class="tab-pane fade" id="tab_modificar_detalles-jornaleros" role="tabpanel" aria-labelledby="tab-modificar-detalles-jornaleros">
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
                                            <label class="form-label fw-semibold">Sueldo Semanal ($)</label>
                                            <div class="flex-grow-1 d-flex align-items-end">
                                                <input type="number" step="0.01" class="form-control mod-input-azul" id="mod-sueldo-semanal-jornalero" value="" placeholder="0.00">
                                            </div>
                                        </div>

                                        <div class="col-md-6 d-flex flex-column">
                                            <label class="form-label fw-semibold">Pasaje ($)</label>
                                            <div class="flex-grow-1 d-flex align-items-end">
                                                <input type="number" step="0.01" class="form-control mod-input-azul" id="mod-pasaje-jornalero" value="" placeholder="0.00">
                                            </div>
                                        </div>
                                    </div>

                                    <div class="row mb-4">                    
                                        <div class="col-md-6 d-flex flex-column">
                                            <label class="form-label fw-semibold">Comida ($)</label>
                                            <div class="flex-grow-1 d-flex align-items-end">
                                                <input type="number" step="0.01" class="form-control mod-input-azul" id="mod-comida-jornalero" value="" placeholder="0.00">
                                            </div>
                                        </div>

                                        <div class="col-md-6 d-flex flex-column">
                                            <label class="form-label fw-semibold">Tardeada</label>
                                            <div class="flex-grow-1 d-flex align-items-end">
                                                <input type="number" step="0.01" class="form-control mod-input-azul" id="mod-tardeada-jornalero" value="" placeholder="0.00">
                                            </div>
                                        </div>                                        
                                    </div>

                                    <div class = "row mb-4">
                                        <div class="col-md-6 d-flex flex-column">
                                            <label class="form-label fw-semibold">Total Sueldo Extra ($)</label>
                                            <small class="text-muted mb-1">Calculado automáticamente</small>
                                            <input type="number" step="0.01" class="form-control mod-input-azul mod-input-readonly" id="mod-total-extra-jornalero" value="" placeholder="0.00" readonly>
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


                                    <!-- Contenedor para conceptos adicionales -->
                                    <div class="row" id="contenedor-conceptos-adicionales-jornalero">
                                        <!-- Los conceptos adicionales se cargarán aquí dinámicamente -->
                                    </div>

                                    <!-- Botón para agregar más conceptos -->
                                    <div class="row">
                                        <div class="col-12 text-center">
                                            <button type="button" class="btn btn-outline-primary btn-sm" id="btn-agregar-percepcion-jornalero">
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
                                    <div class="row mb-3" id="contenedor-conceptos-jornalero">
                                        <div class="col-md-4 mb-2">
                                            <label class="form-label fw-semibold">ISR ($)</label>
                                            <div class="input-group">
                                                <input type="number" step="0.01" class="form-control mod-input-amarillo" id="mod-isr-jornalero" value="" placeholder="0.00">
                                                <button type="button" class="btn btn-outline-secondary" id="btn-aplicar-isr-jornalero" title="Aplicar Nuevo ISR">
                                                    <i class="bi bi-calculator"></i>
                                                </button>
                                            </div>
                                        </div>
                                        <div class="col-md-4 mb-2">
                                            <label class="form-label fw-semibold">IMSS ($)</label>
                                            <div class="input-group">
                                                <input type="number" step="0.01" class="form-control mod-input-amarillo" id="mod-imss-jornalero" value="" placeholder="0.00">
                                                <button type="button" class="btn btn-outline-secondary" id="btn-aplicar-imss-jornalero" title="Aplicar Nuevo IMSS">
                                                    <i class="bi bi-calculator"></i>
                                                </button>
                                            </div>
                                        </div>
                                        <div class="col-md-4 mb-2">
                                            <label class="form-label fw-semibold">INFONAVIT ($)</label>
                                            <div class="input-group">
                                                <input type="number" step="0.01" class="form-control mod-input-amarillo" id="mod-infonavit-jornalero" value="" placeholder="0.00">
                                                <button type="button" class="btn btn-outline-secondary" id="btn-aplicar-infonavit-jornalero" title="Aplicar Nuevo INFONAVIT">
                                                    <i class="bi bi-calculator"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="row mb-3">
                                        <div class="col-md-4 mb-2">
                                            <label class="form-label fw-semibold">AJUSTES AL SUB ($)</label>
                                            <div class="input-group">
                                                <input type="number" step="0.01" class="form-control mod-input-amarillo" id="mod-ajustes-sub-jornalero" value="" placeholder="0.00">
                                                <button type="button" class="btn btn-outline-secondary" id="btn-aplicar-ajuste-sub-jornalero" title="Aplicar Nuevo Ajuste al Sub">
                                                    <i class="bi bi-calculator"></i>
                                                </button>
                                            </div>
                                        </div>

                                        <div class="col-md-4 mb-2">
                                            <label class="form-label fw-semibold">TOTAL CONCEPTOS ($)</label>
                                            <div class="input-group">
                                                <input type="number" step="0.01" class="form-control mod-input-amarillo-total-conceptos" id="mod-total-conceptos-jornalero" value="" placeholder="0.00" readonly>
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
                                    <div class="row mb-4" id="contenedor-deducciones-jornalero">
                                        <div class="col-md-4 d-flex flex-column">
                                            <label class="form-label fw-semibold">Dispersión Tarjeta ($)</label>
                                            <div class="input-group">
                                                <input type="number" step="0.01" class="form-control mod-input-rojo" id="mod-tarjeta-jornalero" value="" placeholder="0.00">
                                                <button type="button" class="btn btn-outline-secondary" id="btn-aplicar-tarjeta-jornalero" title="Aplicar Tarjeta">
                                                    <i class="bi bi-credit-card"></i>
                                                </button>
                                            </div>
                                        </div>
                                        <div class="col-md-4 d-flex flex-column">
                                            <label class="form-label fw-semibold">Préstamos ($)</label>
                                            <input type="number" step="0.01" class="form-control mod-input-rojo" id="mod-prestamo-jornalero" value="" placeholder="0.00">
                                        </div>

                                        <div class="col-md-4 d-flex flex-column">
                                            <label class="form-label fw-semibold">Retardos ($)</label>
                                            <input type="number" step="0.01" class="form-control mod-input-rojo" id="mod-retardos-jornalero" value="" placeholder="0.00">
                                        </div>


                                    </div>

                                    <div class="col-md-4 d-flex flex-column">
                                        <label class="form-label fw-semibold">Checador ($)</label>
                                        <div class="input-group">
                                            <input type="number" step="0.01" class="form-control mod-input-rojo" id="mod-checador-jornalero" value="" placeholder="0.00">

                                            <button type="button" class="btn btn-outline-secondary" id="btn-aplicar-checador-jornalero" title="Aplicar Checador">
                                                <i class="bi bi-calculator"></i>
                                            </button>
                                        </div>
                                    </div>

                                    <!-- Separador visual -->
                                    <div class="row">
                                        <hr class="mod-separador">
                                        <!-- Historial Detallado de Olvidos -->
                                        <div class="row mb-3">
                                            <div class="col-12" id="historial-olvidos-jornaleros">
                                                <h6 class="fw-semibold text-danger mb-3">
                                                    <i class="bi bi-exclamation-triangle-fill"></i> Historial de Olvidos por Día
                                                </h6>
                                                <div id="contenedor-historial-olvidos-jornaleros" class="historial-olvidos-container">
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
                                                    <input type="number" step="0.01" class="form-control mod-input-rojo mod-input-readonly" id="mod-permisos-jornalero" value="" placeholder="0.00" readonly>
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
                                                        <div class="row g-2 align-items-end" id="add-permiso-jornalero">
                                                            <div class="col-md-3">
                                                                <label class="form-label fw-semibold small">Día de la Semana</label>
                                                                <select class="form-select form-select-sm" id="select-dia-permiso-jornalero">
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
                                                                <input type="number" step="1" class="form-control form-control-sm" id="input-minutos-permiso-jornalero" placeholder="0" min="0">
                                                            </div>
                                                            <div class="col-md-3">
                                                                <label class="form-label fw-semibold small">Costo por Minuto ($)</label>
                                                                <input type="number" step="0.01" class="form-control form-control-sm" id="input-costo-minuto-permiso-jornalero" placeholder="0.00" min="0">
                                                            </div>
                                                            <div class="col-md-3">
                                                                <label class="form-label fw-semibold small">Descuento ($)</label>
                                                                <input type="number" step="0.01" class="form-control form-control-sm" id="input-descuento-permiso-jornalero" placeholder="0.00" min="0">
                                                            </div>
                                                            <div class="col-md-3">
                                                                <button type="button" class="btn btn-warning btn-sm w-100" id="btn-agregar-permiso-jornalero">
                                                                    <i class="bi bi-plus-circle"></i> Agregar Permiso
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div id="contenedor-historial-permisos-jornalero" class="historial-permisos-container">
                                                    <!-- El historial se cargará dinámicamente aquí -->
                                                </div>
                                            </div>
                                        </div>

                                        <!-- INTERFAZ DE UNIFORME -->
                                        <div class="row mb-3">
                                            <div class="col-md-4 mb-2">
                                                <label class="form-label fw-semibold">Uniforme (cantidad)</label>
                                                <input type="number" step="1" class="form-control mod-input-rojo mod-input-readonly" id="mod-uniforme-jornalero" value="" placeholder="0" readonly>
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
                                                        <div class="row g-2 align-items-end" id="add-uniforme-jornalero">
                                                            <div class="col-md-4">
                                                                <label class="form-label fw-semibold small">Folio</label>
                                                                <input type="text" class="form-control form-control-sm" id="input-folio-uniforme-jornalero" placeholder="Folio...">
                                                            </div>
                                                            <div class="col-md-4">
                                                                <label class="form-label fw-semibold small">Cantidad</label>
                                                                <input type="number" step="1" class="form-control form-control-sm" id="input-cantidad-uniforme-jornalero" placeholder="0" min="0">
                                                            </div>
                                                            <div class="col-md-4">
                                                                <button type="button" class="btn btn-secondary btn-sm w-100" id="btn-agregar-uniforme-jornalero">
                                                                    <i class="bi bi-plus-circle"></i> Agregar Uniforme
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div id="contenedor-historial-uniforme-jornalero" class="historial-uniforme-container">
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
                                                <input type="number" step="0.01" class="form-control mod-input-rojo" id="mod-fagafetcofia-jornalero" value="" placeholder="0.00">
                                            </div>
                                        </div>

                                        <!-- Botón para agregar otra deducción -->
                                        <div class="row mb-3">
                                            <div class="col-12 text-center">
                                                <button type="button" class="btn btn-outline-danger btn-sm" id="btn-agregar-deduccion-jornalero">
                                                    <i class="bi bi-plus-circle"></i> Agregar Otra Deducción
                                                </button>
                                            </div>
                                        </div>

                                        <!-- Contenedor para deducciones adicionales -->
                                        <div class="row" id="contenedor-deducciones-adicionales-jornalero">
                                            <!-- Las deducciones adicionales se cargarán aquí dinámicamente -->
                                        </div>


                                    </div>
                                </div>
                            </div>




                            <!-- SUELDO A COBRAR -->
                            <div class="card shadow-sm mb-3 mod-card" id="mod-sueldo-jornalero">
                                <div class="card-header mod-card-header-verde">
                                    <i class="bi bi-currency-dollar"></i> Sueldo a Cobrar
                                </div>
                                <div class="card-body mod-card-body-verde">
                                    <!-- Opciones de redondeo: checkbox + modo -->
                                    <div class="row mb-3">
                                        <div class="col-md-6 offset-md-3">
                                            <div class="form-check form-switch">
                                                <input class="form-check-input" type="checkbox" id="mod-redondear-sueldo-jornalero">
                                                <label class="form-check-label fw-semibold" for="mod-redondear-sueldo-jornalero">Redondear sueldo a cobrar</label>
                                            </div>

                                        </div>
                                    </div>

                                    <div class="row justify-content-center">
                                        <div class="col-md-6 text-center">
                                            <label class="sueldo-cobrar-label">
                                                <i class="bi bi-cash-stack"></i> Total a Cobrar
                                            </label>
                                            <input type="number" step="0.01" class="sueldo-cobrar-input"
                                                id="mod-sueldo-a-cobrar-jornalero" value="">
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
                <span class="badge bg-success fs-6 p-2" id="nombre-jornalero-modal"></span>

                <div>
                    <button type="button"
                        class="btn btn-secondary"
                        data-bs-dismiss="modal"
                        id="btn-cancelar-conceptos-jornalero">
                        Cancelar
                    </button>

                    <button type="button"
                        class="btn btn-success"
                        id="btn-guardar-propiedades-jornalero">
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    </div>
</div>