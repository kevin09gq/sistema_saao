<div class="modal fade" id="modal-coordinadores" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-xl modal-dialog-scrollable">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Detalles del empleado</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div class="modal-body">
                <!-- Barra de navegación -->
                <ul class="nav nav-tabs mb-3" id="modalTabs-coordinadores" role="tablist">
                    <li class="nav-item" role="presentation">
                        <button class="nav-link active" id="tab-info-coordinadores" data-bs-toggle="tab" data-bs-target="#tab_info-coordinadores" type="button" role="tab" aria-controls="tab_info-coordinadores" aria-selected="true">Trabajador</button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="tab-registros-coordinadores" data-bs-toggle="tab" data-bs-target="#tab_registros-coordinadores" type="button" role="tab" aria-controls="tab_registros-coordinadores" aria-selected="false">Registros</button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="tab-modificar-detalles-coordinadores" data-bs-toggle="tab" data-bs-target="#tab_modificar_detalles-coordinadores" type="button" role="tab" aria-controls="tab_modificar_detalles-coordinadores" aria-selected="false">Modificar Detalles</button>
                    </li>
                </ul>

                <div class="tab-content">

                    <!-- INFORMACION DEL COORDINADOR -->
                    <div class="tab-pane fade show active" id="tab_info-coordinadores" role="tabpanel" aria-labelledby="tab-info-coordinadores">
                        <h6 class="mb-3">Información básica del empleado</h6>
                        <div class="empleado-info">
                            <div class="info-row"><span class="info-label">Clave:</span><span class="info-value" id="campo-clave-coordinadores"></span></div>
                            <div class="info-row"><span class="info-label">Nombre:</span><span class="info-value" id="campo-nombre-coordinadores"></span></div>
                            <div class="info-row"><span class="info-label">Departamento:</span><span class="info-value" id="campo-departamento-coordinadores"></span></div>
                            <div class="info-row"><span class="info-label">Puesto:</span><span class="info-value" id="campo-puesto-coordinadores"></span></div>
                            <input type="hidden" id="campo-id-empresa-coordinadores" value="">
                        </div>
                    </div>

                    <!-- REGISTROS BIOMETRICO Y HORARIO OFICIALES -->
                    <div class="tab-pane fade" id="tab_registros-coordinadores" role="tabpanel" aria-labelledby="tab-registros-coordinadores">

                        <!-- Botones para cambiar vista como mini-tabs -->
                        <div class="d-flex justify-content-center mb-3">
                            <div class="btn-group" role="group" aria-label="Vista de registros">
                                <button type="button" class="btn btn-outline-success active mini-tab-registros" id="btn-biometrico-coordinadores">
                                    <i class="bi bi-check-circle"></i> Biometrico
                                </button>

                                <button type="button" class="btn btn-outline-primary mini-tab-registros" id="btn-horarios-oficiales-coordinadores">
                                    <i class="bi bi-clock-history"></i> Horarios Oficial
                                </button>
                            </div>
                        </div>

                        <!-- Tabla de Registros del Biometrico -->
                        <div class="table-container" id="tabla-biometrico-coordinadores">
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
                                <tbody id="tbody-biometrico-coordinadores">

                                </tbody>
                            </table>
                        </div>

                        <!-- Tabla de Registros BD -->
                        <div class="table-container" id="tabla-horarios-oficiales-coordinadores" hidden>
                            <!-- Campos de entrada rápida para copiar a todos los días -->
                            <div class="card bg-light mb-3">
                                <div class="card-body">

                                    <div class="row gx-3 gy-2 align-items-end horarios-copiar-row">
                                        <div class="col-md-3 col-sm-6">
                                            <label class="form-label fw-semibold small">Entrada</label>
                                            <input type="time" step="60" class="form-control form-control-sm" id="input-entrada-copiar-coordinadores" placeholder="HH:MM">
                                        </div>
                                        <div class="col-md-3 col-sm-6">
                                            <label class="form-label fw-semibold small">Salida Comida</label>
                                            <input type="time" step="60" class="form-control form-control-sm" id="input-salida-comida-copiar-coordinadores" placeholder="HH:MM">
                                        </div>
                                        <div class="col-md-3 col-sm-6">
                                            <label class="form-label fw-semibold small">Entrada Comida</label>
                                            <input type="time" step="60" class="form-control form-control-sm" id="input-entrada-comida-copiar-coordinadores" placeholder="HH:MM">
                                        </div>
                                        <div class="col-md-3 col-sm-6">
                                            <label class="form-label fw-semibold small">Salida</label>
                                            <input type="time" step="60" class="form-control form-control-sm" id="input-salida-copiar-coordinadores" placeholder="HH:MM">
                                        </div>
                                        <div class="col-md-3 d-flex justify-content-end align-items-end">
                                            <button type="button" class="btn btn-primary btn-sm" id="btn-copiar-horarios-coordinadores" title="Copiar a Todos los Días" aria-label="Copiar a Todos los Días">
                                                <i class="bi bi-clipboard-check"></i> Copiar
                                            </button>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            <table class="custom-table">
                                <thead>
                                    <tr>
                                        <th>Día</th>
                                        <th>Entrada</th>
                                        <th>Salida Comida</th>
                                        <th>Entrada Comida</th>
                                        <th>Salida</th>
                                        <th>Acción</th>

                                    </tr>
                                </thead>
                                <tbody id="tbody-horarios-oficiales-coordinadores">
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
                                        <div class="evento-content" id="entradas-tempranas-coordinadores">

                                        </div>
                                        <div class="evento-total">
                                            <strong>Total: <span id="total-entradas-tempranas-coordinadores"></span></strong>
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
                                        <div class="evento-content" id="salidas-tardias-coordinadores">

                                        </div>
                                        <div class="evento-total">
                                            <strong>Total: <span id="total-salidas-tardias-coordinadores"></span></strong>
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
                                        <div class="evento-content" id="salidas-tempranas-coordinadores">

                                        </div>
                                        <div class="evento-total">
                                            <strong>Total: <span id="total-salidas-tempranas-coordinadores"></span></strong>
                                        </div>
                                    </div>
                                </div>

                                <!-- Olvidos del Checador -->
                                <div class="col-md-6 mb-3">
                                    <div class="evento-card olvido-checador" id="olvidos-checador-card-coordinadores">
                                        <div class="evento-header">
                                            <i class="bi bi-exclamation-triangle"></i>
                                            <span>Olvidos del Checador</span>
                                        </div>
                                        <div class="evento-content" id="olvidos-checador-coordinadores">

                                        </div>
                                        <div class="evento-total">
                                            <strong>Total: <span id="total-olvidos-checador-coordinadores"></span></strong>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Tercera fila: Retardos y Faltas -->
                            <div class="row">
                                <!-- Retardos -->
                                <div class="col-md-6 mb-3">
                                    <div class="evento-card retardo" id="retardos-card-coordinadores">
                                        <div class="evento-header">
                                            <i class="bi bi-clock-fill"></i>
                                            <span>Retardos</span>
                                        </div>
                                        <div class="evento-content" id="retardos-coordinadores">

                                        </div>
                                        <div class="evento-total">
                                            <strong>Total: <span id="total-retardos-coordinadores"></span></strong>
                                        </div>
                                    </div>
                                </div>
                                <!-- Faltas -->
                                <div class="col-md-6 mb-3">
                                    <div class="evento-card falta" id="faltas-card-coordinadores">
                                        <div class="evento-header">
                                            <i class="bi bi-x-circle"></i>
                                            <span>Faltas (Días sin registro con horario oficial)</span>
                                        </div>
                                        <div class="evento-content" id="faltas-content-coordinadores">

                                        </div>
                                        <div class="evento-total">
                                            <strong>Total: <span id="total-faltas-coordinadores"></span></strong>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Cuarta fila: Análisis de Permisos y Comidas -->
                            <div class="row">
                                <!-- Análisis de Permisos y Comidas -->
                                <div class="col-md-12 mb-3">
                                    <div class="evento-card analisis-permisos" style="border-color: #9b59b6;">
                                        <div class="evento-header">
                                            <i class="bi bi-diagram-3"></i>
                                            <span>Análisis de Permisos y Comidas</span>
                                        </div>
                                        <div class="evento-content" id="analisis-permisos-comida-content-coordinadores" style="max-height: 400px; overflow-y: auto;">

                                        </div>
                                        <div class="evento-total">
                                            <strong>Total: <span id="total-analisis-permisos-comida-coordinadores"></span></strong>
                                        </div>
                                    </div>
                                </div>
                            </div>


                        </div>


                    </div>

                    <!-- EDITAR Y AGREGAR CONCEPTOS (PROPIEDADES DEL EMPLEADO) -->
                    <div class="tab-pane fade" id="tab_modificar_detalles-coordinadores" role="tabpanel" aria-labelledby="tab-modificar-detalles-coordinadores">
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
                                                <input type="number" step="0.01" class="form-control mod-input-azul" id="mod-sueldo-semanal-coordinador" value="" placeholder="0.00">
                                            </div>
                                        </div>

                                        <div class="col-md-6 d-flex flex-column">
                                            <label class="form-label fw-semibold">Total Sueldo Extra ($)</label>
                                            <small class="text-muted mb-1">Calculado automáticamente</small>
                                            <input type="number" step="0.01" class="form-control mod-input-azul mod-input-readonly" id="mod-total-extra-coordinador" value="" placeholder="0.00" readonly>
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
                                    <div class="row" id="contenedor-conceptos-adicionales-coordinador">
                                        <!-- Los conceptos adicionales se cargarán aquí dinámicamente -->
                                    </div>

                                    <!-- Botón para agregar más conceptos -->
                                    <div class="row">
                                        <div class="col-12 text-center">
                                            <button type="button" class="btn btn-outline-primary btn-sm" id="btn-agregar-percepcion-coordinador">
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
                                    <div class="row mb-3" id="contenedor-conceptos-coordinador">
                                        <div class="col-md-4 mb-2">
                                            <label class="form-label fw-semibold">ISR ($)</label>
                                            <div class="input-group">
                                                <input type="number" step="0.01" class="form-control mod-input-amarillo" id="mod-isr-coordinador" value="" placeholder="0.00">
                                                <button type="button" class="btn btn-outline-secondary" id="btn-aplicar-isr-coordinador" title="Aplicar Nuevo ISR">
                                                    <i class="bi bi-calculator"></i>
                                                </button>
                                            </div>
                                        </div>
                                        <div class="col-md-4 mb-2">
                                            <label class="form-label fw-semibold">IMSS ($)</label>
                                            <div class="input-group">
                                                <input type="number" step="0.01" class="form-control mod-input-amarillo" id="mod-imss-coordinador" value="" placeholder="0.00">
                                                <button type="button" class="btn btn-outline-secondary" id="btn-aplicar-imss-coordinador" title="Aplicar Nuevo IMSS">
                                                    <i class="bi bi-calculator"></i>
                                                </button>
                                            </div>
                                        </div>
                                        <div class="col-md-4 mb-2">
                                            <label class="form-label fw-semibold">INFONAVIT ($)</label>
                                            <div class="input-group">
                                                <input type="number" step="0.01" class="form-control mod-input-amarillo" id="mod-infonavit-coordinador" value="" placeholder="0.00">
                                                <button type="button" class="btn btn-outline-secondary" id="btn-aplicar-infonavit-coordinador" title="Aplicar Nuevo INFONAVIT">
                                                    <i class="bi bi-calculator"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="row mb-3">
                                        <div class="col-md-4 mb-2">
                                            <label class="form-label fw-semibold">AJUSTES AL SUB ($)</label>
                                            <div class="input-group">
                                                <input type="number" step="0.01" class="form-control mod-input-amarillo" id="mod-ajustes-sub-coordinador" value="" placeholder="0.00">
                                                <button type="button" class="btn btn-outline-secondary" id="btn-aplicar-ajuste-sub-coordinador" title="Aplicar Nuevo Ajuste al Sub">
                                                    <i class="bi bi-calculator"></i>
                                                </button>
                                            </div>
                                        </div>

                                        <div class="col-md-4 mb-2">
                                            <label class="form-label fw-semibold">TOTAL CONCEPTOS ($)</label>
                                            <div class="input-group">
                                                <input type="number" step="0.01" class="form-control mod-input-amarillo-total-conceptos" id="mod-total-conceptos-coordinador" value="" placeholder="0.00" readonly>
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
                                    <div class="row mb-4" id ="contenedor-deducciones-coordinador">
                                        <div class="col-md-4 d-flex flex-column">
                                            <label class="form-label fw-semibold">Dispersión Tarjeta ($)</label>
                                            <input type="number" step="0.01" class="form-control mod-input-rojo" id="mod-tarjeta-coordinador" value="" placeholder="0.00">
                                        </div>
                                        <div class="col-md-4 d-flex flex-column">
                                            <label class="form-label fw-semibold">Préstamos ($)</label>
                                            <input type="number" step="0.01" class="form-control mod-input-rojo" id="mod-prestamo-coordinador" value="" placeholder="0.00">
                                        </div>
                                        <div class="col-md-4 d-flex flex-column">
                                            <label class="form-label fw-semibold">Checador ($)</label>
                                            <input type="number" step="0.01" class="form-control mod-input-rojo" id="mod-checador-coordinador" value="" placeholder="0.00">
                                        </div>
                                    </div>                                  
                                </div>
                            </div>


                             <!-- DEDUCCIONES -->

                            <!-- Sueldo a Cobrar -->
                            <div class="card shadow-sm mb-3 mod-card">
                                <div class="card-header mod-card-header-verde">
                                    <i class="bi bi-currency-dollar"></i> Sueldo a Cobrar
                                </div>
                                <div class="card-body mod-card-body-verde">
                                    <!-- Opciones de redondeo: checkbox + modo -->
                                    <div class="row mb-3">
                                        <div class="col-md-6 offset-md-3">
                                            <div class="form-check form-switch">
                                                <input class="form-check-input" type="checkbox" id="mod-redondear-sueldo-coordinador">
                                                <label class="form-check-label fw-semibold" for="mod-redondear-sueldo-coordinador">Redondear sueldo a cobrar</label>
                                            </div>
                                            <div class="mt-2" id="mod-redondeo-opciones-coordinador" style="display:none;">
                                                <select id="mod-redondeo-modo-coordinador" class="form-select form-select-sm w-auto d-inline-block">
                                                    <option value="nearest">Al entero más cercano</option>
                                                    <option value="up">Hacia arriba</option>
                                                    <option value="down">Hacia abajo</option>
                                                </select>
                                                <small class="text-muted ms-2">Modo de redondeo</small>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="row justify-content-center">
                                        <div class="col-md-6 text-center">
                                            <label class="sueldo-cobrar-label">
                                                <i class="bi bi-cash-stack"></i> Total a Cobrar
                                            </label>
                                            <input type="number" step="0.01" class="sueldo-cobrar-input"
                                                id="mod-sueldo-a-cobrar-coordinador" value="8">
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
            <div class="modal-footer">
                <span class="badge bg-verde-empleado me-auto" id="nombre-empleado-modal"></span>
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" id="btn-cancelar-conceptos">Cancelar</button>
                <button type="button" class="btn btn-success" id="btn-guardar-propiedades-coordinador">Guardar</button>
            </div>
        </div>
    </div>
</div>