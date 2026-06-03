<style>
/* Estilos para el Desglose de Cálculo (idéntico a primaVacacional.css) */
.desglose-box {
    background: #fafafa;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    padding: 1.25rem;
    font-family: 'Courier New', monospace;
}

.desglose-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.4rem 0;
    font-size: 0.95rem;
}

.desglose-concepto {
    color: var(--text-main);
    font-weight: 500;
    flex: 1;
}

.desglose-valor {
    color: #333333;
    font-weight: 700;
    text-align: right;
    flex: 0 0 auto;
    margin-left: 1.5rem;
}

.desglose-separator {
    height: 1px;
    background: #d0d0d0;
    margin: 0.6rem 0;
    border-radius: 1px;
}

.desglose-subtotal {
    font-size: 1rem;
    padding-top: 0.5rem;
}

.desglose-subtotal .desglose-concepto {
    font-weight: 700;
    color: #333333;
}

.desglose-subtotal .desglose-valor {
    font-size: 1.1rem;
}

/* Estilos para el Resumen Final (idéntico a primaVacacional.css) */
.resumen-final-box {
    background: var(--white);
    border: 2px solid #d0d0d0;
    border-radius: 8px;
    padding: 1.25rem;
    font-family: 'Courier New', monospace;
}

.resumen-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    font-size: 0.9rem;
    border-bottom: 1px solid var(--border-color);
}

.resumen-row:last-child {
    border-bottom: none;
}

.resumen-label {
    color: var(--text-main);
    font-weight: 500;
    flex: 1;
}

.resumen-valor {
    color: #666;
    font-weight: 600;
    text-align: right;
    flex: 0 0 auto;
    margin-left: 1.5rem;
}

.resumen-separator {
    height: 1px;
    background: #d0d0d0;
    margin: 0.5rem 0;
    border-radius: 1px;
}

.resumen-total {
    background: #f5f5f5;
    padding: 0.85rem;
    margin: 0;
    border-radius: 6px;
    border-top: 2px solid #d0d0d0;
    border-bottom: 2px solid #d0d0d0;
    margin-top: 0.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.resumen-total .resumen-label {
    font-size: 0.95rem;
    color: #333333;
    font-weight: 700;
}

.resumen-valor-total {
    color: #333333;
    font-size: 1.25rem;
    font-weight: 900;
    text-align: right;
}
</style>

<!-- Modal Detalle y Edición de Prima Vacacional -->
<div class="modal fade" id="modalPrimaVacacional" tabindex="-1" aria-labelledby="modalPrimaVacacionalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content" style="border-radius: 14px; overflow: hidden; border: none; box-shadow: var(--shadow-md);">
            <div class="modal-header" style="border-bottom: 1px solid var(--border-color); background: var(--bg-gray); padding: 1.25rem 1.5rem;">
                <h5 class="modal-title" id="modalPrimaVacacionalLabel" style="font-weight: 700; color: var(--text-main); font-size: 1.15rem;">
                    <i class="bi bi-currency-dollar text-success" style="font-size: 1.3rem;"></i> Detalle de Prima Vacacional
                </h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form id="formEditarPrimaVacacional">
                <div class="modal-body" style="max-height: 75vh; overflow-y: auto; background-color: #f8f9fa; padding: 1.5rem;">
                    <!-- Campos Ocultos -->
                    <input type="hidden" id="edit_id_prima_empleado" name="id_prima_empleado">
                    <input type="hidden" id="edit_id_empleado" name="id_empleado">
                    <input type="hidden" id="edit_id_kardex" name="id_kardex">

                    <!-- SECCIÓN 1: INFORMACIÓN DE REGISTRO -->
                    <div class="card-form" style="border-left: 4px solid var(--primary-green); margin-bottom: 1.25rem; padding: 1.25rem;">
                        <h6 class="section-title" style="border-bottom: 2px solid var(--primary-green); padding-bottom: 0.5rem; margin-bottom: 1rem; font-size: 0.9rem; font-weight: 700;">
                            <i class="bi bi-calendar-check text-success"></i> Información de Registro
                        </h6>
                        <div class="row g-3">
                            <div class="col-md-4">
                                <label class="form-label-kardex">Número de Semana</label>
                                <input type="number" class="input-kardex" id="edit_numeroSemana" name="numero_semana" min="1" max="53" required>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label-kardex">Año</label>
                                <input type="number" class="input-kardex" id="edit_anio" name="anio" required>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label-kardex">Fecha de Pago</label>
                                <input type="date" class="input-kardex" id="edit_fechaPago" name="fecha_pago" required>
                            </div>
                        </div>
                    </div>

                    <!-- SECCIÓN 2: PERIODO Y DÍAS DE VACACIONES -->
                    <div class="card-form" style="border-left: 4px solid #0056b3; margin-bottom: 1.25rem; padding: 1.25rem;">
                        <h6 class="section-title" style="border-bottom: 2px solid #0056b3; padding-bottom: 0.5rem; margin-bottom: 1rem; font-size: 0.9rem; font-weight: 700;">
                            <i class="bi bi-calendar2-range text-primary"></i> Periodo y Días de Vacaciones
                        </h6>
                        <div class="row g-3 mb-3">
                            <div class="col-md-6">
                                <label class="form-label-kardex">Fecha Inicio Vacaciones</label>
                                <input type="date" class="input-kardex" id="edit_fechaInicio" name="fecha_inicio" required>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label-kardex">Fecha Fin Vacaciones</label>
                                <input type="date" class="input-kardex" id="edit_fechaFin" name="fecha_fin" required>
                            </div>
                        </div>

                        <div class="row g-3 mb-3">
                            <div class="col-md-4">
                                <label class="form-label-kardex">Días Vacaciones (Base)</label>
                                <input type="number" class="input-kardex" id="edit_diasVacaciones" name="dias_vacaciones" step="0.001" min="0" required>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label-kardex">Domingos</label>
                                <input type="number" class="input-kardex" id="edit_domingos" name="domingos" min="0">
                            </div>
                            <div class="col-md-4">
                                <label class="form-label-kardex">Festivos</label>
                                <input type="number" class="input-kardex" id="edit_festivos" name="festivos" min="0">
                            </div>
                        </div>

                        <div class="row g-3 align-items-center mb-3">
                            <div class="col-md-6">
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" id="edit_incluirDomingos" name="incluir_domingos" checked>
                                    <label class="form-check-label fw-semibold text-secondary" for="edit_incluirDomingos" style="font-size: 0.85rem;">Tomar en cuenta domingos en el cálculo</label>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="form-check form-switch">
                                    <input class="form-check-input" type="checkbox" id="edit_incluirFestivos" name="incluir_festivos" checked>
                                    <label class="form-check-label fw-semibold text-secondary" for="edit_incluirFestivos" style="font-size: 0.85rem;">Tomar en cuenta festivos en el cálculo</label>
                                </div>
                            </div>
                        </div>

                        <div class="d-flex justify-content-between align-items-center p-2 rounded" style="background-color: #f8f9fa; border: 1px solid #dee2e6;">
                            <span class="fw-bold text-secondary" style="font-size: 0.85rem;"><i class="bi bi-info-circle-fill text-primary"></i> Días Totales a Calcular:</span>
                            <span class="fw-bold text-primary" id="edit_diasTotalesCalculo" style="font-size: 1rem;">0.000</span>
                        </div>
                    </div>

                    <!-- SECCIÓN 3: CÁLCULO FINANCIERO -->
                    <div class="card-form" style="border-left: 4px solid #dc3545; margin-bottom: 1.25rem; padding: 1.25rem;">
                        <h6 class="section-title" style="border-bottom: 2px solid #dc3545; padding-bottom: 0.5rem; margin-bottom: 1rem; font-size: 0.9rem; font-weight: 700;">
                            <i class="bi bi-calculator text-danger"></i> Cálculo de Prima
                        </h6>
                        <div class="row g-3 mb-3">
                            <div class="col-md-4">
                                <label class="form-label-kardex">Salario Diario</label>
                                <input type="number" class="input-kardex" id="edit_salarioDiario" name="salario_diario" step="0.01" min="0" required>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label-kardex">Sueldo por Vacaciones</label>
                                <input type="text" class="input-kardex" id="edit_sueldoVacaciones" readonly style="background-color: #f1f3f5; font-weight: bold; color: #0056b3;" placeholder="$0.00">
                            </div>
                            <div class="col-md-4">
                                <label class="form-label-kardex">Porcentaje de Prima (%)</label>
                                <input type="number" class="input-kardex" id="edit_porcentajePrima" name="porcentaje_prima" step="0.01" min="0" max="100" required>
                            </div>
                        </div>

                        <!-- Desglose de Cálculo Detallado -->
                        <div class="desglose-box mt-3 mb-4">
                            <div class="desglose-row">
                                <span class="desglose-concepto">Días Vacaciones:</span>
                                <span class="desglose-valor" id="edit_desglosesDias">0.000</span>
                            </div>
                            <div class="desglose-row">
                                <span class="desglose-concepto">× Salario Diario:</span>
                                <span class="desglose-valor" id="edit_desglosesSalario">$0.00</span>
                            </div>
                            <div class="desglose-separator"></div>
                            <div class="desglose-row fw-bold text-primary">
                                <span class="desglose-concepto">Sueldo por Vacaciones:</span>
                                <span class="desglose-valor" id="edit_desglosesSueldoVac">$0.00</span>
                            </div>
                            <div class="desglose-row">
                                <span class="desglose-concepto">× Porcentaje Prima:</span>
                                <span class="desglose-valor" id="edit_desglosesPorcentaje">25.00%</span>
                            </div>
                            <div class="desglose-separator"></div>
                            <div class="desglose-row desglose-subtotal">
                                <span class="desglose-concepto">Prima Vacacional:</span>
                                <span class="desglose-valor" id="edit_desglosePrima">$0.00</span>
                            </div>
                        </div>

                        <!-- Deducciones -->
                        <h6 class="subsection-title mb-2" style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted);">Deducciones</h6>
                        <div class="row g-3 mb-4">
                            <div class="col-md-6">
                                <label class="form-label-kardex">Dispersión Tarjeta</label>
                                <input type="number" class="input-kardex" id="edit_dispersionTarjeta" name="dispersion_tarjeta" step="0.01" min="0">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label-kardex">ISR</label>
                                <input type="number" class="input-kardex" id="edit_isr" name="isr" step="0.01" min="0">
                            </div>
                        </div>

                        <!-- Resumen Final -->
                        <div class="resumen-final-box">
                            <div class="resumen-row">
                                <span class="resumen-label">Prima Vacacional</span>
                                <span class="resumen-valor" id="edit_resumenPrima">$0.00</span>
                            </div>
                            <div class="resumen-row">
                                <span class="resumen-label">- Dispersión Tarjeta</span>
                                <span class="resumen-valor" id="edit_resumenDispersion">$0.00</span>
                            </div>
                            <div class="resumen-row">
                                <span class="resumen-label">- ISR</span>
                                <span class="resumen-valor" id="edit_resumenISR">$0.00</span>
                            </div>
                            <div class="resumen-row resumen-total">
                                <span class="resumen-label">TOTAL A PAGAR</span>
                                <span class="resumen-valor-total" id="edit_resumenTotal">$0.00</span>
                            </div>
                        </div>
                    </div>

                    <!-- OBSERVACIONES -->
                    <div class="card-form" style="border-left: 4px solid #6c757d; margin-bottom: 0; padding: 1.25rem;">
                        <div class="mb-0">
                            <label class="form-label-kardex">Observaciones</label>
                            <textarea class="input-kardex" id="edit_observaciones" name="observaciones" rows="2" placeholder="Notas adicionales..."></textarea>
                        </div>
                    </div>
                </div>

                <div class="modal-footer" style="border-top: 1px solid var(--border-color); background: var(--bg-gray); padding: 1rem 1.5rem;">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" style="border-radius: 8px; font-size: 0.9rem; padding: 0.5rem 1.25rem;">
                        <i class="bi bi-x-lg"></i> Cerrar
                    </button>
                    <button type="submit" class="btn btn-success" style="background-color: var(--primary-green); border-color: var(--primary-green); border-radius: 8px; font-size: 0.9rem; padding: 0.5rem 1.5rem; font-weight: 600;">
                        <i class="bi bi-check-circle"></i> Guardar Cambios
                    </button>
                </div>
            </form>
        </div>
    </div>
</div>
