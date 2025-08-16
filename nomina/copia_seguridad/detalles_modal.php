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
                <button class="nav-link" id="tab-conceptos" data-bs-toggle="tab" data-bs-target="#tab_conceptos" type="button" role="tab" aria-controls="tab_conceptos" aria-selected="false">
                    Conceptos
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
                        <span class="info-value" id="campo-clave">9</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Nombre:</span>
                        <span class="info-value">GUTIERREZ MELENDEZ GUADALUPE</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">Neto a pagar:</span>
                        <span class="info-value">$2,001.</span>
                    </div>
                </div>

                <!-- Sección de tiempo trabajado -->
                <div class="seccion-calculos">
                    <h5 style="margin:25px 0 15px 0; color:#333; border-bottom:2px solid #007bff; padding-bottom:5px;">
                        <i class="bi bi-clock"></i> Tiempo Trabajado
                    </h5>

                    <div class="calculo-item">
                        <div class="calculo-header">
                            <span class="calculo-titulo">Horas Totales</span>
                            <span class="calculo-formula">42.78 horas</span>
                        </div>
                        <div class="calculo-conversion">
                            <span class="conversion-texto">= 42 horas + 0.78 × 60 minutos</span>
                            <span class="conversion-resultado">= 42:47 (2,567 minutos)</span>
                        </div>
                    </div>

                    <div class="calculo-item">
                        <div class="calculo-header">
                            <span class="calculo-titulo">Tiempo Total</span>
                            <span class="calculo-formula">42:47</span>
                        </div>
                        <div class="calculo-conversion">
                            <span class="conversion-texto">= 42 × 60 + 47 minutos</span>
                            <span class="conversion-resultado">= 2,567 minutos</span>
                        </div>
                    </div>

                    <div class="calculo-item">
                        <div class="calculo-header">
                            <span class="calculo-titulo">Minutos Normales</span>
                            <span class="calculo-formula">2,567 minutos</span>
                        </div>
                        <div class="calculo-conversion">
                            <span class="conversion-texto">= 2,567 ÷ 60</span>
                            <span class="conversion-resultado">= 42.78 horas</span>
                        </div>
                    </div>

                    <div class="calculo-item">
                        <div class="calculo-header">
                            <span class="calculo-titulo">Minutos Extras</span>
                            <span class="calculo-formula">0 minutos</span>
                        </div>
                        <div class="calculo-conversion">
                            <span class="conversion-texto">= 0 ÷ 60</span>
                            <span class="conversion-resultado">= 0.00 horas</span>
                        </div>
                    </div>
                </div>

                <!-- Sección de sueldo -->
                <div class="seccion-calculos">
                    <h5 style="margin:25px 0 15px 0; color:#333; border-bottom:2px solid #28a745; padding-bottom:5px;">
                        <i class="bi bi-calculator"></i> Cálculo de Sueldo
                    </h5>

                    <div class="calculo-item">
                        <div class="calculo-header">
                            <span class="calculo-titulo">Sueldo Base</span>
                            <span class="calculo-formula">$2,001.24</span>
                        </div>
                        <div class="calculo-conversion">
                            <span class="conversion-texto">= 2,567 minutos × $0.78 por minuto</span>
                            <span class="conversion-resultado">= $2,001.24</span>
                        </div>
                    </div>

                    <div class="calculo-item">
                        <div class="calculo-header">
                            <span class="calculo-titulo">Sueldo Extras</span>
                            <span class="calculo-formula">$0.00</span>
                        </div>
                        <div class="calculo-conversion">
                            <span class="conversion-texto">= 0 minutos × $1.20 por minuto extra</span>
                            <span class="conversion-resultado">= $0.00</span>
                        </div>
                    </div>

                    <div class="calculo-item total">
                        <div class="calculo-header">
                            <span class="calculo-titulo">Total Sueldo</span>
                            <span class="calculo-formula">$2,001.24</span>
                        </div>
                        <div class="calculo-conversion">
                            <span class="conversion-texto">= $2,001.24 + $0.00</span>
                            <span class="conversion-resultado">= $2,001.24</span>
                        </div>
                    </div>
                </div>

                <!-- Sección de incentivos -->
                <div class="seccion-calculos">
                    <h5 style="margin:25px 0 15px 0; color:#333; border-bottom:2px solid #ffc107; padding-bottom:5px;">
                        <i class="bi bi-plus-circle"></i> Incentivos
                    </h5>

                    <div class="calculo-item incentivo">
                        <div class="calculo-header">
                            <span class="calculo-titulo">Incentivo por Asistencia</span>
                            <span class="calculo-formula">$250.00</span>
                        </div>
                        <div class="calculo-conversion">
                            <span class="conversion-texto">= Sin faltas en la semana</span>
                            <span class="conversion-resultado">= $250.00</span>
                        </div>
                    </div>
                </div>

                <!-- Sección de deducciones -->
                <div class="seccion-calculos">
                    <h5 style="margin:25px 0 15px 0; color:#333; border-bottom:2px solid #dc3545; padding-bottom:5px;">
                        <i class="bi bi-dash-circle"></i> Deducciones
                    </h5>

                    <div class="calculo-item">
                        <div class="calculo-header">
                            <span class="calculo-titulo">I.S.R. (mes)</span>
                            <span class="calculo-formula">$46.09</span>
                        </div>
                        <div class="calculo-conversion">
                            <span class="conversion-texto">= $2,001.24 × 2.3%</span>
                            <span class="conversion-resultado">= $46.09</span>
                        </div>
                    </div>

                    <div class="calculo-item">
                        <div class="calculo-header">
                            <span class="calculo-titulo">I.M.S.S.</span>
                            <span class="calculo-formula">$52.67</span>
                        </div>
                        <div class="calculo-conversion">
                            <span class="conversion-texto">= $2,001.24 × 2.63%</span>
                            <span class="conversion-resultado">= $52.67</span>
                        </div>
                    </div>

                    <div class="calculo-item">
                        <div class="calculo-header">
                            <span class="calculo-titulo">INFONAVIT</span>
                            <span class="calculo-formula">$35.00</span>
                        </div>
                        <div class="calculo-conversion">
                            <span class="conversion-texto">= Descuento fijo mensual</span>
                            <span class="conversion-resultado">= $35.00</span>
                        </div>
                    </div>

                    <div class="calculo-item">
                        <div class="calculo-header">
                            <span class="calculo-titulo">PRÉSTAMO</span>
                            <span class="calculo-formula">$150.00</span>
                        </div>
                        <div class="calculo-conversion">
                            <span class="conversion-texto">= Préstamo personal</span>
                            <span class="conversion-resultado">= $150.00</span>
                        </div>
                    </div>

                    <div class="calculo-item">
                        <div class="calculo-header">
                            <span class="calculo-titulo">INASISTENCIAS</span>
                            <span class="calculo-formula">$0.00</span>
                        </div>
                        <div class="calculo-conversion">
                            <span class="conversion-texto">= 0 días × $200 por día</span>
                            <span class="conversion-resultado">= $0.00</span>
                        </div>
                    </div>

                    <div class="calculo-item">
                        <div class="calculo-header">
                            <span class="calculo-titulo">UNIFORMES</span>
                            <span class="calculo-formula">$75.00</span>
                        </div>
                        <div class="calculo-conversion">
                            <span class="conversion-texto">= Uniforme nuevo solicitado</span>
                            <span class="conversion-resultado">= $75.00</span>
                        </div>
                    </div>

                    <div class="calculo-item">
                        <div class="calculo-header">
                            <span class="calculo-titulo">Checador</span>
                            <span class="calculo-formula">$20.00</span>
                        </div>
                        <div class="calculo-conversion">
                            <span class="conversion-texto">= 1 olvido × $20 por olvido</span>
                            <span class="conversion-resultado">= $20.00</span>
                        </div>
                    </div>

                    <div class="calculo-item">
                        <div class="calculo-header">
                            <span class="calculo-titulo">F.A /GAFET/COFIA</span>
                            <span class="calculo-formula">$45.00</span>
                        </div>
                        <div class="calculo-conversion">
                            <span class="conversion-texto">= Equipo de seguridad</span>
                            <span class="conversion-resultado">= $45.00</span>
                        </div>
                    </div>

                    <div class="calculo-item total">
                        <div class="calculo-header">
                            <span class="calculo-titulo">Total Deducciones</span>
                            <span class="calculo-formula">$423.76</span>
                        </div>
                        <div class="calculo-conversion">
                            <span class="conversion-texto">= $46.09 + $52.67 + $35.00 + $150.00 + $0.00 + $75.00 + $20.00 + $45.00</span>
                            <span class="conversion-resultado">= $423.76</span>
                        </div>
                    </div>
                </div>

                <!-- Neto final -->
                <div class="calculo-item neto-final">
                    <div class="calculo-header">
                        <span class="calculo-titulo">SUELDO A COBRAR</span>
                        <span class="calculo-formula">$1,827.48</span>
                    </div>
                    <div class="calculo-conversion">
                        <span class="conversion-texto">= $2,001.24 + $250.00 - $423.76</span>
                        <span class="conversion-resultado">= $1,827.48</span>
                    </div>
                </div>
            </div>
            <!-- Conceptos -->
            <div class="tab-pane fade" id="tab_conceptos" role="tabpanel" aria-labelledby="tab-conceptos">
                <h4 style="margin-bottom:10px;">Conceptos</h4>
                <div class="conceptos-cards" id="conceptos-cards" style="display:flex; flex-wrap:wrap; gap:16px;">

                </div>
            </div>
            <!-- Registros -->
            <div class="tab-pane fade" id="tab_registros" role="tabpanel" aria-labelledby="tab-registros">
                <h4 style="margin-bottom:10px;">Registros de Entrada y Salida</h4>
                <ul class="registros-timeline" id="registros-cards">


                </ul>
                <div class="registros-totales" id="registros-totales">
                    Horas totales: <span id="horas-totales"></span> &nbsp; | &nbsp; Tiempo total: <span id="tiempo-total"></span>
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
                            <div class="row mb-3 align-items-end">
                                <div class="col-md-4 mb-2">
                                    <label class="form-label fw-semibold">Sueldo Neto ($)</label>
                                    <input type="number" step="0.01" class="form-control mod-input-azul" id="mod-sueldo-neto" value="">
                                </div>
                                <div class="col-md-4 mb-2">
                                    <label class="form-label fw-semibold">Sueldo Extra ($)</label>
                                    <input type="number" step="0.01" class="form-control mod-input-azul" id="mod-sueldo-extra" value="">
                                </div>
                                <div class="col-md-4 mb-2 d-flex flex-column justify-content-end">
                                    <div class="d-flex align-items-center mb-2">
                                        <input class="form-check-input me-2" type="checkbox" id="mod-incentivo-check" checked>
                                        <label class="form-check-label fw-semibold mb-0" for="mod-incentivo-check">
                                            ¿Aplica Incentivo?
                                        </label>
                                    </div>
                                    <label class="form-label fw-semibold mb-1" for="mod-incentivo-monto">Monto Incentivo ($)</label>
                                    <input type="number" step="0.01" class="form-control mod-input-cyan" id="mod-incentivo-monto" value="250" >
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