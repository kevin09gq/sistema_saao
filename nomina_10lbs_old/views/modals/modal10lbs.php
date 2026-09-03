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
                        <button class="nav-link" id="tab-registros-10lbs" data-bs-toggle="tab" data-bs-target="#tab_registros-10lbs" type="button" role="tab" aria-controls="tab_registros-10lbs" aria-selected="false">Registros</button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="tab-modificar-detalles-10lbs" data-bs-toggle="tab" data-bs-target="#tab_modificar_detalles-10lbs" type="button" role="tab" aria-controls="tab_modificar_detalles-10lbs" aria-selected="false">Modificar Detalles</button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="tab-cajas-10lbs" data-bs-toggle="tab" data-bs-target="#tab_cajas-10lbs" type="button" role="tab" aria-controls="tab_cajas-10lbs" aria-selected="false">Cajas Empacadas</button>
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

                    <!-- REGISTROS BIOMETRICO Y HORARIO OFICIALES -->
                    <div class="tab-pane fade" id="tab_registros-10lbs" role="tabpanel" aria-labelledby="tab-registros-10lbs">
                        <!-- Tabla de Registros del Biometrico -->
                        <div class="table-container" id="tabla-biometrico-10lbs">
                            <table class=" custom-table">
                                <thead>
                                    <tr>
                                        <th>Día</th>
                                        <th>Fecha</th>
                                        <th>Entrada</th>
                                        <th>Salida</th>
                                      
                                    </tr>
                                </thead>
                                <tbody id="tbody-biometrico-10lbs">

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
                                        <div class="evento-content" id="entradas-tempranas-10lbs">

                                        </div>
                                        <div class="evento-total">
                                            <strong>Total: <span id="total-entradas-tempranas-10lbs"></span></strong>
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
                                        <div class="evento-content" id="salidas-tardias-10lbs">

                                        </div>
                                        <div class="evento-total">
                                            <strong>Total: <span id="total-salidas-tardias-10lbs"></span></strong>
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
                                        <div class="evento-content" id="salidas-tempranas-10lbs">

                                        </div>
                                        <div class="evento-total">
                                            <strong>Total: <span id="total-salidas-tempranas-10lbs"></span></strong>
                                        </div>
                                    </div>
                                </div>

                                <!-- Olvidos del Checador -->
                                <div class="col-md-6 mb-3">
                                    <div class="evento-card olvido-checador" id="olvidos-checador-card-10lbs">
                                        <div class="evento-header">
                                            <i class="bi bi-exclamation-triangle"></i>
                                            <span>Olvidos del Checador</span>
                                        </div>
                                        <div class="evento-content" id="olvidos-checador-10lbs">

                                        </div>
                                        <div class="evento-total">
                                            <strong>Total: <span id="total-olvidos-checador-10lbs"></span></strong>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Tercera fila: Retardos y Faltas -->
                            <div class="row">
                                <!-- Retardos -->
                                <div class="col-md-6 mb-3">
                                    <div class="evento-card retardo" id="retardos-card-10lbs">
                                        <div class="evento-header">
                                            <i class="bi bi-clock-fill"></i>
                                            <span>Retardos</span>
                                        </div>
                                        <div class="evento-content" id="retardos-10lbs">

                                        </div>
                                        <div class="evento-total">
                                            <strong>Total: <span id="total-retardos-10lbs"></span></strong>
                                        </div>
                                    </div>
                                </div>
                                <!-- Faltas -->
                                <div class="col-md-6 mb-3">
                                    <div class="evento-card falta" id="inasistencias-card-10lbs">
                                        <div class="evento-header">
                                            <i class="bi bi-x-circle"></i>
                                            <span>Ausentismo</span>
                                        </div>
                                        <div class="evento-content" id="inasistencias-content-10lbs">

                                        </div>
                                        <div class="evento-total">
                                            <strong>Total: <span id="total-inasistencias-10lbs"></span></strong>
                                        </div>
                                    </div>
                                </div>
                            </div>
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

                                    <!-- Botón para agregar más conceptos -->
                                    <div class="row">
                                        <div class="col-12 text-center">
                                            <button type="button" class="btn btn-outline-primary btn-sm" id="btn-agregar-percepcion-10lbs">
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
                                    <div class="row mb-3" id="contenedor-conceptos-10lbs">
                                        <div class="col-md-4 mb-2">
                                            <label class="form-label fw-semibold">ISR ($)</label>
                                            <div class="input-group">
                                                <input type="number" step="0.01" class="form-control mod-input-amarillo" id="mod-isr-10lbs" value="" placeholder="0.00">
                                                <button type="button" class="btn btn-outline-secondary" id="btn-aplicar-isr-10lbs" title="Aplicar Nuevo ISR">
                                                    <i class="bi bi-calculator"></i>
                                                </button>
                                            </div>
                                        </div>
                                        <div class="col-md-4 mb-2">
                                            <label class="form-label fw-semibold">IMSS ($)</label>
                                            <div class="input-group">
                                                <input type="number" step="0.01" class="form-control mod-input-amarillo" id="mod-imss-10lbs" value="" placeholder="0.00">
                                                <button type="button" class="btn btn-outline-secondary" id="btn-aplicar-imss-10lbs" title="Aplicar Nuevo IMSS">
                                                    <i class="bi bi-calculator"></i>
                                                </button>
                                            </div>
                                        </div>
                                        <div class="col-md-4 mb-2">
                                            <label class="form-label fw-semibold">INFONAVIT ($)</label>
                                            <div class="input-group">
                                                <input type="number" step="0.01" class="form-control mod-input-amarillo" id="mod-infonavit-10lbs" value="" placeholder="0.00">
                                                <button type="button" class="btn btn-outline-secondary" id="btn-aplicar-infonavit-10lbs" title="Aplicar Nuevo INFONAVIT">
                                                    <i class="bi bi-calculator"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="row mb-3">
                                        <div class="col-md-4 mb-2">
                                            <label class="form-label fw-semibold">AJUSTES AL SUB ($)</label>
                                            <div class="input-group">
                                                <input type="number" step="0.01" class="form-control mod-input-amarillo" id="mod-ajustes-sub-10lbs" value="" placeholder="0.00">
                                                <button type="button" class="btn btn-outline-secondary" id="btn-aplicar-ajuste-sub-10lbs" title="Aplicar Nuevo Ajuste al Sub">
                                                    <i class="bi bi-calculator"></i>
                                                </button>
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
                                                <button type="button" class="btn btn-outline-secondary" id="btn-aplicar-tarjeta-10lbs" title="Aplicar Tarjeta">
                                                    <i class="bi bi-credit-card"></i>
                                                </button>
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

                                                <button type="button" class="btn btn-outline-secondary" id="btn-aplicar-checador-10lbs" title="Aplicar Checador">
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
                                            <div class="col-12" id="historial-olvidos-10lbs">
                                                <h6 class="fw-semibold text-danger mb-3">
                                                    <i class="bi bi-exclamation-triangle-fill"></i> Historial de Olvidos por Día
                                                </h6>
                                                <div id="contenedor-historial-olvidos" class="historial-olvidos-container">
                                                    <!-- Se llenará con JavaScript -->
                                                </div>
                                            </div>
                                        </div>

                                 
                                        <!-- Sección de Inasistencias -->
                                        <div class="row mb-3" hidden>
                                            <div class="col-md-4 mb-2">
                                                <label class="form-label fw-semibold">Ausentismo($)</label>
                                                <div class="input-group">
                                                    <input type="number" step="0.01" class="form-control mod-input-rojo" id="mod-inasistencias-10lbs" value="" placeholder="0.00">
                                                    <button type="button" class="btn btn-outline-secondary" id="btn-calcular-inasistencias-10lbs" title="Calcular desde historial">
                                                        <i class="bi bi-calculator"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <!-- Historial Detallado de Inasistencias -->
                                        <div class="row mb-3" hidden>
                                            <div class="col-12">
                                                <h6 class="fw-semibold text-info mb-3">
                                                    <i class="bi bi-calendar-x"></i> Historial de Ausentismo por Día
                                                </h6>

                                                <!-- Formulario para agregar inasistencia manual -->
                                                <div class="card bg-light mb-3">
                                                    <div class="card-body">
                                                        <div class="row g-2 align-items-end" id="add-inasistencia-10lbs">
                                                            <div class="col-md-4">
                                                                <label class="form-label fw-semibold small">Día de la Semana</label>
                                                                <select class="form-select form-select-sm" id="select-dia-inasistencia-10lbs">
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
                                                                <input type="number" step="0.01" class="form-control form-control-sm" id="input-descuento-inasistencia-10lbs" placeholder="0.00" min="0">
                                                            </div>
                                                            <div class="col-md-4">
                                                                <button type="button" class="btn btn-info btn-sm w-100" id="btn-agregar-inasistencia-10lbs">
                                                                    <i class="bi bi-plus-circle"></i> Agregar Inasistencia
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div id="contenedor-historial-inasistencias-10lbs" class="historial-inasistencias-container">
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

                                                <!-- Formulario para agregar permiso manual -->
                                                <div class="card bg-light mb-3">
                                                    <div class="card-body">
                                                        <div class="row g-2 align-items-end" id="add-permiso-10lbs">
                                                            <div class="col-md-3">
                                                                <label class="form-label fw-semibold small">Día de la Semana</label>
                                                                <select class="form-select form-select-sm" id="select-dia-permiso-10lbs">
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
                                                                <input type="number" step="1" class="form-control form-control-sm" id="input-minutos-permiso-10lbs" placeholder="0" min="0">
                                                            </div>
                                                            <div class="col-md-3">
                                                                <label class="form-label fw-semibold small">Costo por Minuto ($)</label>
                                                                <input type="number" step="0.01" class="form-control form-control-sm" id="input-costo-minuto-permiso-10lbs" placeholder="0.00" min="0">
                                                            </div>
                                                            <div class="col-md-3">
                                                                <label class="form-label fw-semibold small">Descuento ($)</label>
                                                                <input type="number" step="0.01" class="form-control form-control-sm" id="input-descuento-permiso-10lbs" placeholder="0.00" min="0">
                                                            </div>
                                                            <div class="col-md-3">
                                                                <button type="button" class="btn btn-warning btn-sm w-100" id="btn-agregar-permiso-10lbs">
                                                                    <i class="bi bi-plus-circle"></i> Agregar Permiso
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

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
                                                <!-- Formulario para agregar uniforme manual -->
                                                <div class="card bg-light mb-3">
                                                    <div class="card-body">
                                                        <div class="row g-2 align-items-end" id="add-uniforme-10lbs">
                                                            <div class="col-md-4">
                                                                <label class="form-label fw-semibold small">Folio</label>
                                                                <input type="text" class="form-control form-control-sm" id="input-folio-uniforme-10lbs" placeholder="Folio...">
                                                            </div>
                                                            <div class="col-md-4">
                                                                <label class="form-label fw-semibold small">Cantidad</label>
                                                                <input type="number" step="1" class="form-control form-control-sm" id="input-cantidad-uniforme-10lbs" placeholder="0" min="0">
                                                            </div>
                                                            <div class="col-md-4">
                                                                <button type="button" class="btn btn-secondary btn-sm w-100" id="btn-agregar-uniforme-10lbs">
                                                                    <i class="bi bi-plus-circle"></i> Agregar Uniforme
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

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

                                        <!-- Botón para agregar otra deducción -->
                                        <div class="row mb-3">
                                            <div class="col-12 text-center">
                                                <button type="button" class="btn btn-outline-danger btn-sm" id="btn-agregar-deduccion-10lbs">
                                                    <i class="bi bi-plus-circle"></i> Agregar Otra Deducción
                                                </button>
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
                                    <!-- Opciones de redondeo: checkbox + modo -->
                                    <div class="row mb-3">
                                        <div class="col-md-6 offset-md-3">
                                            <div class="form-check form-switch">
                                                <input class="form-check-input" type="checkbox" id="mod-redondear-sueldo-10lbs">
                                                <label class="form-check-label fw-semibold" for="mod-redondear-sueldo-10lbs">Redondear sueldo a cobrar</label>
                                            </div>

                                        </div>
                                    </div>

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

                    <!-- CAJAS EMPACADAS -->
                    <div class="tab-pane fade" id="tab_cajas-10lbs" role="tabpanel" aria-labelledby="tab-cajas-10lbs">
                        <div class="card shadow-sm mb-3 mod-card">
                            <div class="card-header mod-card-header-verde">
                                <i class="bi bi-box-seam"></i> Registro de Producción Diaria
                            </div>
                            <div class="card-body mod-card-body-verde">
                                <form id="form-registro-cajas-10lbs">
                                    <div class="row g-3 align-items-end mb-4">
                                        <div class="col-md-3">
                                            <label class="form-label fw-semibold">Día</label>
                                            <select class="form-select" id="select-dia-caja-10lbs">
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
                                            <label class="form-label fw-semibold">Tipo de Caja (Calibre/Peso)</label>
                                            <select class="form-select" id="select-tipo-caja-10lbs">
                                                <option value="">Seleccionar tipo...</option>
                                                <!-- Se poblará dinámicamente -->
                                            </select>
                                        </div>
                                        <div class="col-md-2">
                                            <label class="form-label fw-semibold">Cantidad</label>
                                            <input type="number" class="form-control" id="input-cantidad-caja-10lbs" placeholder="0" min="1">
                                        </div>
                                        <div class="col-md-3">
                                            <button type="button" class="btn btn-success w-100" id="btn-agregar-caja-10lbs">
                                                <i class="bi bi-plus-circle"></i> Agregar Registro
                                            </button>
                                        </div>
                                    </div>
                                </form>

                                <hr class="mod-separador">

                                <h6 class="fw-semibold text-success mb-3">
                                    <i class="bi bi-table"></i> Detalle Semanal de Producción
                                </h6>
                                <div class="table-responsive">
                                    <table class="table table-sm table-bordered custom-table-cajas text-center">
                                        <thead class="table-success">
                                            <tr>
                                                <th>Día</th>
                                                <th>Tipo de Caja</th>
                                                <th>Precio Unit.</th>
                                                <th>Cantidad</th>
                                                <th>Subtotal</th>
                                                <th>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody id="tbody-cajas-10lbs">
                                            <!-- Se poblará dinámicamente -->
                                            <tr>
                                                <td colspan="6" class="text-center text-muted py-3">No hay registros de cajas empacadas para esta semana.</td>
                                            </tr>
                                        </tbody>
                                        <tfoot class="table-light fw-bold">
                                            <tr>
                                                <td colspan="3" class="text-end">Total Semanal:</td>
                                                <td id="total-cantidad-cajas-10lbs">0</td>
                                                <td id="total-pago-cajas-10lbs">$0.00</td>
                                                <td></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                        </div>
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