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
                <h4 style="margin-bottom:20px;">Detalles del empleado</h4>

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
                        <span class="info-label">Neto a pagar:</span>
                        <span class="info-value">$2,001.</span>
                    </div>
                </div>
            </div>
         
            <!-- Registros -->
            <div class="tab-pane fade" id="tab_registros" role="tabpanel" aria-labelledby="tab-registros">
                <h4 style="margin-bottom:20px;">Registros de Entrada y Salida</h4>
                                
                <div class="table-responsive">
                    <table class="tabla-registros" id="tabla-registros">
                        <thead>
                            <tr>
                                <th class="encabezado-dia">DÍA</th>
                                <th class="encabezado-tiempo">ENTRADA</th>
                                <th class="encabezado-tiempo">SALIDA COMIDA</th>
                                <th class="encabezado-tiempo">ENTRADA COMIDA</th>
                                <th class="encabezado-tiempo">SALIDA</th>
                                <th class="encabezado-tiempo">TOTAL HORAS</th>
                                <th class="encabezado-tiempo">TOTAL MINUTOS</th>
                            </tr>
                        </thead>
                        <tbody id="tabla-registros-body">
                           
                        </tbody>
                        <tfoot>
                            <tr class="fila-total-registros">
                                <td class="etiqueta-total-registros">TOTAL</td>
                                <td class="celda-total-general-registros"></td>
                                <td class="celda-total-general-registros"></td>
                                <td class="celda-total-general-registros"></td>
                                <td class="celda-total-general-registros"></td>
                                <td class="celda-total-horas-registros"></td>
                                <td class="celda-total-minutos-registros"></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
            <!-- Modificar Detalles -->
            <div class="tab-pane fade" id="tab_modificar_detalles" role="tabpanel" aria-labelledby="tab-modificar-detalles">
                <h4 class="mb-3 mod-detalles-title"><i class="bi bi-pencil-square"></i> Modificar Detalles</h4>
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
                                    <input type="number" step="0.01" class="form-control mod-input-azul fw-bold" id="mod-total-extra" value="" readonly style="background-color: #f8f9fa; font-weight: bold;">
                                </div>
                            </div>
                            
                            <!-- Separador visual -->
                            <hr class="my-3">
                            
                            <!-- Título de componentes -->
                            <div class="row mb-3">
                                <div class="col-12">
                                    <h6 class="fw-semibold text-primary mb-0">
                                        <i class="bi bi-list-ul"></i> Componentes del Sueldo Extra
                                    </h6>
                                    <small class="text-muted">Configure los diferentes conceptos que conforman el sueldo extra</small>
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
                                        <input class="form-check-input me-2" type="checkbox" id="mod-bono-antiguedad-check" checked>
                                        <label class="form-check-label small mb-0" for="mod-bono-antiguedad-check">
                                            Aplicar bono
                                        </label>
                                    </div>
                                    <input type="number" step="0.01" class="form-control mod-input-azul componente-extra" id="mod-bono-antiguedad" value="200">
                                </div>
                                
                                <div class="col-md-3 mb-3 d-flex flex-column">
                                    <label class="form-label fw-normal">Actividades Especiales</label>
                                    <div class="flex-grow-1 d-flex align-items-end">
                                        <input type="number" step="0.01" class="form-control mod-input-azul componente-extra" id="mod-actividades-especiales" value="" placeholder="0.00">
                                    </div>
                                </div>
                                
                                <div class="col-md-3 mb-3 d-flex flex-column">
                                    <label class="form-label fw-normal">Puesto</label>
                                    <div class="flex-grow-1 d-flex align-items-end">
                                        <input type="number" step="0.01" class="form-control mod-input-azul componente-extra" id="mod-bono-responsabilidad" value="200">
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
                                    <input type="number" step="0.01" class="form-control mod-input-rosa" id="mod-tarjeta" value="" >
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
                                    <label class="form-label fw-semibold">Inasistencias (horas)</label>
                                    <input type="number" step="0.01" class="form-control mod-input-rosa" id="mod-inasistencias-horas" value="">
                                </div>
                                <div class="col-md-6 mb-2">
                                    <label class="form-label fw-semibold">Descuento por Inasistencias ($)</label>
                                    <input type="number" step="0.01" class="form-control mod-input-rosa" id="mod-inasistencias-descuento" value="">
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style="text-align:right;">
                        <button type="button" class="btn btn-success px-4" id="btn-guardar-modificaciones">
                            <i class="bi bi-save"></i> Guardar Cambios
                        </button>
                    </div>
                </form>
            </div>

        </div>
        <div class="modal-detalles-footer" style="margin-top:24px; text-align:right;">
            <button type="button" id="btn-cancelar-detalles" class="btn btn-secondary" style="margin-right:10px;">Cancelar</button>
            <button type="button" id="btn-guardar-detalles" class="btn btn-success">Guardar</button>
        </div>
    </div>
</div>