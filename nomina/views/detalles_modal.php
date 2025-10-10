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
                        <button type="button" class="btn btn-outline-success mini-tab-registros active" id="btn-redondeados">
                            <i class="bi bi-check-circle"></i> Redondeados
                        </button>
                        <button type="button" class="btn btn-outline-primary mini-tab-registros" id="btn-checador">
                            <i class="bi bi-clock-history"></i> Checador
                        </button>
                    </div>
                </div>

                <!-- Tabla de Registros Redondeados (por defecto visible) -->
                <div class="table-container" id="tabla-redondeados">
                    <table class="custom-table">
                        <thead>
                            <tr>
                                <th>Día</th>
                                <th>Entrada</th>
                                <th>Salida Comida</th>
                                <th>Entrada Comida</th>
                                <th>Salida</th>
                                <th>Total Horas</th>
                                <th>Total Minutos</th>
                                <th>Horas Comida</th>
                            </tr>
                        </thead>
                        <tbody>
                           
                        </tbody>
                        <tfoot>
                            <tr>
                                <th>TOTAL</th>
                                <th>--</th>
                                <th>--</th>
                                <th>--</th>
                                <th>--</th>
                                <th></th>
                                <th></th>
                                <th></th>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <!-- Tabla de Registros del Checador (inicialmente oculta) -->
                <div class="table-container" id="tabla-checador" style="display: none;">
                    <table class="custom-table">
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

                <!-- Eventos Especiales -->
                <div class="eventos-especiales-container">
                    <h5 class="eventos-title">
                        <i class="bi bi-clock-history"></i> Eventos Especiales
                    </h5>
                    
                    <div class="row">
                        <!-- Entradas Tempranas -->
                        <div class="col-md-4 mb-3">
                            <div class="evento-card entrada-temprana">
                                <div class="evento-header">
                                    <i class="bi bi-sunrise"></i>
                                    <span>Entradas Tempranas</span>
                                </div>
                                <div class="evento-content" id="entradas-tempranas-content">
                                  
                                </div>
                                <div class="evento-total">
                                    <strong>Total: <span id="total-entradas-tempranas"></span></strong>
                                </div>
                            </div>
                        </div>

                        <!-- Salidas Tardías -->
                        <div class="col-md-4 mb-3">
                            <div class="evento-card salida-tardia">
                                <div class="evento-header">
                                    <i class="bi bi-sunset"></i>
                                    <span>Salidas Tardías</span>
                                </div>
                                <div class="evento-content" id="salidas-tardias-content">
                                  
                                </div>
                                <div class="evento-total">
                                    <strong>Total: <span id="total-salidas-tardias"></span></strong>
                                </div>
                            </div>
                        </div>

                        <!-- Olvidos del Checador -->
                        <div class="col-md-4 mb-3">
                            <div class="evento-card olvido-checador">
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

                    <!-- Resumen General -->
                    <div class="resumen-eventos">
                        <div class="resumen-card">
                            <div class="resumen-item">
                                <span class="resumen-label">Tiempo Extra Total:</span>
                                <span class="resumen-valor" id="tiempo-extra-total"></span>
                            </div>
                        </div>
                        
                        <!-- Nueva sección de Minutos Trabajados -->
                        <div class="resumen-card tiempo-trabajado">
                            <h6 class="resumen-tiempo-title">
                                <i class="bi bi-clock"></i> Resumen de Tiempo Trabajado
                            </h6>
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="minutos-label minutos-normales">
                                        <i class="bi bi-check-circle"></i> Minutos Normales
                                    </label>
                                    <input type="number" class="minutos-input minutos-input-normales" 
                                           id="minutos-normales-trabajados" 
                                           readonly>
                                    <small class="minutos-descripcion">
                                        Tiempo dentro del horario laboral
                                    </small>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="minutos-label minutos-extra">
                                        <i class="bi bi-plus-circle"></i> Minutos Extra
                                    </label>
                                    <input type="number" class="minutos-input minutos-input-extra" 
                                           id="minutos-extra-trabajados" 
                                           readonly>
                                    <small class="minutos-descripcion">
                                        Tiempo adicional trabajado
                                    </small>
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
                                <div class="col-md-4 d-flex flex-column">
                                    <label class="form-label fw-semibold">Sueldo Neto ($)</label>
                                    <div class="flex-grow-1 d-flex align-items-end">
                                        <input type="number" step="0.01" class="form-control mod-input-azul" id="mod-sueldo-neto" value="">
                                    </div>
                                </div>

                                <div class="col-md-4 d-flex flex-column">
                                    <label class="form-label fw-semibold">Incentivo ($)</label>
                                    <div class="d-flex align-items-center mb-1">
                                        <input class="form-check-input me-2" type="checkbox" id="mod-incentivo-check" checked>
                                        <label class="form-check-label small mb-0" for="mod-incentivo-check">
                                            Aplicar incentivo
                                        </label>
                                    </div>
                                    <input type="number" step="0.01" class="form-control mod-input-cyan" id="mod-incentivo-monto" value="250" placeholder="Monto del incentivo">
                                </div>

                                <div class="col-md-4 d-flex flex-column">
                                    <label class="form-label fw-semibold">Total Sueldo Extra ($)</label>
                                    <small class="text-muted mb-1">Calculado automáticamente</small>
                                    <input type="number" step="0.01" class="form-control mod-input-azul mod-input-readonly" id="mod-total-extra" value="" readonly>
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
                                    <label class="form-label fw-normal">Horas Extras</label>
                                    <div class="flex-grow-1 d-flex align-items-end">
                                        <input type="number" step="0.01" class="form-control mod-input-azul componente-extra" id="mod-horas-extras" value="" placeholder="0.00">
                                    </div>
                                </div>

                                <div class="col-md-3 mb-3 d-flex flex-column">
                                    <label class="form-label fw-normal">Bono Antigüedad</label>
                                    <div class="d-flex align-items-center mb-1">
                                        <input class="form-check-input me-2" type="checkbox" id="mod-bono-antiguedad-check">
                                        <label class="form-check-label small mb-0" for="mod-bono-antiguedad-check">
                                            Aplicar bono
                                        </label>
                                    </div>
                                    <input type="number" step="0.01" class="form-control mod-input-azul componente-extra" id="mod-bono-antiguedad" value="0" disabled>
                                </div>

                                <div class="col-md-3 mb-3 d-flex flex-column">
                                    <label class="form-label fw-normal">Actividades Especiales</label>
                                    <div class="flex-grow-1 d-flex align-items-end">
                                        <input type="number" step="0.01" class="form-control mod-input-azul componente-extra" id="mod-actividades-especiales" value="" placeholder="0">
                                    </div>
                                </div>

                                <div class="col-md-3 mb-3 d-flex flex-column">
                                    <label class="form-label fw-normal">Puesto</label>
                                    <div class="flex-grow-1 d-flex align-items-end">
                                        <input type="number" step="0.01" class="form-control mod-input-azul componente-extra" id="mod-bono-responsabilidad" value="0">
                                    </div>
                                </div>
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
                                    <input type="number" step="0.01" class="form-control mod-input-amarillo" id="mod-isr" value="">
                                </div>
                                <div class="col-md-4 mb-2">
                                    <label class="form-label fw-semibold">IMSS ($)</label>
                                    <input type="number" step="0.01" class="form-control mod-input-amarillo" id="mod-imss" value="">
                                </div>
                                <div class="col-md-4 mb-2">
                                    <label class="form-label fw-semibold">INFONAVIT ($)</label>
                                    <input type="number" step="0.01" class="form-control mod-input-amarillo" id="mod-infonavit" value="">
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
                                    <input type="number" step="0.01" class="form-control mod-input-rosa" id="mod-tarjeta" value="">
                                </div>
                                <div class="col-md-3 mb-2">
                                    <label class="form-label fw-semibold">Préstamo ($)</label>
                                    <input type="number" step="0.01" class="form-control mod-input-rosa" id="mod-prestamo" value="">
                                </div>
                                <div class="col-md-3 mb-2">
                                    <label class="form-label fw-semibold">Uniformes ($)</label>
                                    <input type="number" step="0.01" class="form-control mod-input-rosa" id="mod-uniformes" value="">
                                </div>
                                <div class="col-md-3 mb-2">
                                    <label class="form-label fw-semibold">Checador ($)</label>
                                    <input type="number" step="0.01" class="form-control mod-input-rosa" id="mod-checador" value="">
                                </div>
                            </div>
                            <div class="row mb-3">
                                <div class="col-md-3 mb-2">
                                    <label class="form-label fw-semibold">F.A/GAFET/COFIA ($)</label>
                                    <input type="number" step="0.01" class="form-control mod-input-rosa" id="mod-fa-gafet-cofia" value="">
                                </div>
                                <div class="col-md-3 mb-2">
                                    <label class="form-label fw-semibold">Inasistencias (minutos)</label>
                                    <input type="number" step="0.01" class="form-control mod-input-rosa" id="mod-inasistencias-minutos" value="">
                                </div>
                                <div class="col-md-6 mb-2">
                                    <label class="form-label fw-semibold">Descuento por Inasistencias ($)</label>
                                    <input type="number" step="0.01" class="form-control mod-input-rosa" id="mod-inasistencias-descuento" value="">
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
                                        Editable manualmente
                                    </small>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                </form>
            </div>

        </div>
        <div class="modal-detalles-footer">
            <button type="button" id="btn-cancelar-detalles" class="btn btn-secondary">Cancelar</button>
            <button type="button" id="btn-guardar-detalles" class="btn btn-success">Guardar</button>
        </div>
    </div>
</div>