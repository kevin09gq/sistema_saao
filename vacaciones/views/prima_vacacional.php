<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Prima Vacacional</title>
    <?php
    include "../../config/config.php";
    verificarSesion();
    ?>
    <!-- SweetAlert2 CSS -->
    <script src="<?= SWEETALERT ?>"></script>
    <link href="<?= BOOTSTRAP_CSS ?>" rel="stylesheet">
    <link rel="stylesheet" href="<?= BOOTSTRAP_ICONS ?>">
    <link rel="stylesheet" href="../css/kardex.css">
    <link rel="stylesheet" href="../css/primaVacacional.css">
    <!-- Google Fonts: Inter -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>

<body>
    <?php include "../../public/views/navbar.php" ?>

    <div class="container kardex-container">
        <!-- Navegación Superior / Acciones -->
        <div class="d-flex justify-content-between align-items-center mb-3">
            <a href="vacaciones.php" class="btn-back" id="btnVolver">
                <i class="bi bi-arrow-left"></i> Volver
            </a>
        </div>

        <!-- Encabezado: Información del Empleado -->
        <div class="kardex-header">
            <div class="emp-profile">
                <div class="emp-avatar-large" id="avatarEmpleado"></div>
                <div>
                    <h1 class="emp-name-title" id="nombreEmpleado"></h1>
                    <div class="emp-meta">
                        <span><i class="bi bi-hash"></i> <strong>Clave:</strong> <span id="claveEmpleado"></span></span>
                        <span><i class="bi bi-briefcase"></i> <strong>Depto:</strong> <span id="deptoEmpleado"></span></span>
                        <span><i class="bi bi-calendar-event"></i> <strong>Ingreso:</strong> <span id="ingresoEmpleado"></span></span>
                        <span><i class="bi bi-award"></i> <strong>Antigüedad:</strong> <span id="antiguedadEmpleado"></span></span>

                    </div>
                </div>
            </div>
        </div>

        <!-- Formulario de Prima Vacacional - Registro de Cuentas -->
        <form id="formPrimaVacacional" class="mb-5">
            <!-- Campo Oculto: ID Empleado -->
            <input type="hidden" id="idEmpleado" name="id_empleado">
            <!-- Campo Oculto: ID Kardex Seleccionado -->
            <input type="hidden" id="idKardexSeleccionado" name="id_kardex_vacaciones" value="">

            <!-- SECCIÓN 0: SELECCIÓN DE MOVIMIENTO DEL KARDEX -->
            <div class="card-form" style="background-color: #f9f9f9; border-left: 4px solid var(--primary-green);">
                <h5 class="section-title">
                    <i class="bi bi-list-check"></i> Selecciona el Movimiento de Vacaciones
                </h5>

                <div class="row g-3">
                    <div class="col-md-12">
                        <label class="form-label-kardex">Movimiento de Vacaciones</label>
                        <select class="input-kardex" id="selectMovimientoKardex" onchange="autoLlenarDatos(this.value)" required>
                            <option value="">-- Cargando movimientos... --</option>
                        </select>
                    </div>
                </div>
            </div>

            <!-- SECCIÓN 1: INFORMACIÓN DE REGISTRO -->
            <div class="card-form">
                <h5 class="section-title">
                    <i class="bi bi-calendar-check"></i> Información de Registro
                </h5>

                <div class="row g-3 mb-3">
                    <div class="col-md-3">
                        <label class="form-label-kardex">Número de Semana</label>
                        <input type="number" class="input-kardex" id="numeroSemana" name="numero_semana" min="1" max="53" placeholder="20" required>
                    </div>
                    <div class="col-md-3">
                        <label class="form-label-kardex">Año</label>
                        <input type="number" class="input-kardex" id="anio" name="anio" min="2020" max="2099" placeholder="2026" required>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label-kardex">Fecha de Pago</label>
                        <input type="date" class="input-kardex" id="fechaPago" name="fecha_pago" required>
                    </div>
                </div>

                <div class="row g-3">
                    <div class="col-md-6">
                        <label class="form-label-kardex">Fecha Inicio Vacaciones</label>
                        <input type="date" class="input-kardex" id="fechaInicio" name="fecha_inicio" required>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label-kardex">Fecha Fin Vacaciones</label>
                        <input type="date" class="input-kardex" id="fechaFin" name="fecha_fin" required>
                    </div>
                </div>
            </div>

            <!-- SECCIÓN 2: DÍAS DE VACACIONES -->
            <div class="card-form" style="border-left: 4px solid #0056b3;">
                <h5 class="section-title">
                    <i class="bi bi-calendar2-range"></i> Días de Vacaciones
                </h5>

                <div class="row g-3 mb-3">
                    <div class="col-md-4">
                        <label class="form-label-kardex">Días de Vacaciones (Base)</label>
                        <input type="number" class="input-kardex" id="diasVacaciones" name="dias_vacaciones" step="0.001" min="0" placeholder="6.000" required>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label-kardex">Séptimo Día</label>
                        <input type="number" class="input-kardex" id="septimoDia" name="septimo_dia" step="0.01" min="0" value="0" placeholder="0">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label-kardex">Festivos</label>
                        <input type="number" class="input-kardex" id="festivos" name="festivos" min="0" value="0" placeholder="0">
                    </div>
                </div>

                <div class="row g-3 align-items-center mb-3">
                    <div class="col-md-6">
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="incluirSeptimoDia" name="incluir_domingos" checked>
                            <label class="form-check-label fw-semibold text-secondary" for="incluirSeptimoDia" style="font-size: 0.85rem;">Tomar en cuenta séptimo día en el cálculo</label>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" id="incluirFestivos" name="incluir_festivos" checked>
                            <label class="form-check-label fw-semibold text-secondary" for="incluirFestivos" style="font-size: 0.85rem;">Tomar en cuenta festivos en el cálculo</label>
                        </div>
                    </div>
                </div>

                <div class="d-flex justify-content-between align-items-center p-3 rounded" style="background-color: #f8f9fa; border: 1px solid #dee2e6;">
                    <span class="fw-bold text-secondary" style="font-size: 0.9rem;"><i class="bi bi-info-circle-fill text-primary"></i> Días Totales a Calcular:</span>
                    <span class="fs-5 fw-bold text-primary" id="diasTotalesCalculo">0.000</span>
                </div>
            </div>

            <!-- ============================================
                         SECCIÓN 2: CÁLCULO DE PRIMA VACACIONAL
                         ============================================ -->
            <div class="card-form">
                <h5 class="section-title">
                    <i class="bi bi-calculator"></i> Pago de vacaciones
                </h5>

                <!-- Datos para Cálculo -->
                <div class="row g-3 mb-3">
                    <div class="col-md-4">
                        <label class="form-label-kardex">Salario Diario</label>
                        <input type="number" class="input-kardex" id="salarioDiario" name="salario_diario" step="0.01" min="0" placeholder="150.50" required>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label-kardex">Sueldo por Vacaciones</label>
                        <input type="text" class="input-kardex" id="sueldoVacaciones" readonly style="background-color: #f1f3f5; font-weight: bold; color: #0056b3;" placeholder="$0.00">
                    </div>
                    <div class="col-md-4">
                        <label class="form-label-kardex">Porcentaje de Prima (%)</label>
                        <input type="number" class="input-kardex" id="porcentajePrima" name="porcentaje_prima" step="0.01" min="0" max="100" value="25.00" placeholder="25.00" required>
                    </div>
                </div>

                <div class="desglose-separator"></div>

                <!-- Inputs de Deducciones -->
                <h6 class="subsection-title mt-3"><i class="bi bi-dash-circle text-danger"></i> Deducciones</h6>
                <div class="row g-3 mb-4">
                    <div class="col-md-3">
                        <label class="form-label-kardex">Dispersión Tarjeta</label>
                        <div class="input-group">
                            <input type="number" class="input-kardex" id="dispersionTarjeta" name="dispersion_tarjeta" step="0.01" min="0" placeholder="0.00">
                        </div>
                    </div>
                    <div class="col-md-3">
                        <label class="form-label-kardex">ISR</label>
                        <div class="input-group">
                            <input type="number" class="input-kardex" id="isr" name="isr" step="0.01" min="0" placeholder="0.00">
                        </div>
                    </div>
                    <div class="col-md-3">
                        <label class="form-label-kardex">IMSS</label>
                        <div class="input-group">
                            <input type="number" class="input-kardex" id="imss" name="imss" step="0.01" min="0" placeholder="0.00">
                        </div>
                    </div>
                    <div class="col-md-3">
                        <label class="form-label-kardex">Infonavit</label>
                        <div class="input-group">
                            <input type="number" class="input-kardex" id="infonavit" name="infonavit" step="0.01" min="0" placeholder="0.00">
                        </div>
                    </div>
                </div>
                
                <div class="desglose-separator"></div>

                <!-- Resumen de Pago -->
                <div class="desglose-box mb-4" id="resumenPagoBox">
                    <div class="desglose-row" id="filaVacaciones">
                        <span class="desglose-concepto">Vacaciones:</span>
                        <span class="desglose-valor" id="resumenVacaciones">$0.00</span>
                    </div>
                    <div class="desglose-row" id="filaPrima">
                        <span class="desglose-concepto">Prima Vacacional:</span>
                        <span class="desglose-valor" id="resumenPrima">$0.00</span>
                    </div>
                    <div class="desglose-row" id="filaSemptimoDia">
                        <span class="desglose-concepto">Séptimo Día:</span>
                        <span class="desglose-valor" id="resumenSeptimoDia">$0.00</span>
                    </div>
                    <div class="desglose-row" id="filaFestivos">
                        <span class="desglose-concepto">Festivos:</span>
                        <span class="desglose-valor" id="resumenFestivos">$0.00</span>
                    </div>

                    <div class="desglose-separator" id="separadorDeducciones" style="display: none;"></div>

                    <!-- Deducciones individuales dentro del resumen -->
                    <div class="desglose-row text-danger" id="filaDeducTarjeta" style="display: none;">
                        <span class="desglose-concepto">- Tarjeta:</span>
                        <span class="desglose-valor" id="resumenDeducTarjeta">$0.00</span>
                    </div>
                    <div class="desglose-row text-danger" id="filaDeducIsr" style="display: none;">
                        <span class="desglose-concepto">- ISR:</span>
                        <span class="desglose-valor" id="resumenDeducIsr">$0.00</span>
                    </div>
                    <div class="desglose-row text-danger" id="filaDeducImss" style="display: none;">
                        <span class="desglose-concepto">- IMSS:</span>
                        <span class="desglose-valor" id="resumenDeducImss">$0.00</span>
                    </div>
                    <div class="desglose-row text-danger" id="filaDeducInfonavit" style="display: none;">
                        <span class="desglose-concepto">- Infonavit:</span>
                        <span class="desglose-valor" id="resumenDeducInfonavit">$0.00</span>
                    </div>
                    <div class="desglose-separator" id="separadorTotal" style="display: none;"></div>
                    <div class="desglose-row desglose-subtotal text-primary fw-bold" id="filaTotal">
                        <span class="desglose-concepto">TOTAL A PAGAR:</span>
                        <span class="desglose-valor" id="resumenTotal">$0.00</span>
                    </div>
                </div>



            </div>


            <!-- SECCIÓN 4: DÍAS DISFRUTADOS / PAGADAS -->
            <div class="card-form" style="border-left: 4px solid #6f42c1;">
                <h5 class="section-title">
                    <i class="bi bi-check2-square"></i> Días Vacaciones
                </h5>

                <div class="row g-3 align-items-end">
                    <!-- Disfrutados -->
                    <div class="col-md-6">
                        <div class="d-flex align-items-center gap-2 mb-2">
                            <div class="form-check form-switch mb-0">
                                <input class="form-check-input" type="checkbox" id="chkDisfrutados" name="tiene_disfrutados">
                                <label class="form-check-label fw-semibold text-secondary" for="chkDisfrutados" style="font-size: 0.85rem;">Disfrutados</label>
                            </div>
                        </div>
                        <input type="number" class="input-kardex" id="diasDisfrutados" name="dias_disfrutados" step="0.001" min="0" placeholder="0.000" disabled style="background-color: #f1f3f5; opacity: 0.6;">
                    </div>

                    <!-- Pagadas -->
                    <div class="col-md-6">
                        <div class="d-flex align-items-center gap-2 mb-2">
                            <div class="form-check form-switch mb-0">
                                <input class="form-check-input" type="checkbox" id="chkPagadas" name="tiene_pagadas">
                                <label class="form-check-label fw-semibold text-secondary" for="chkPagadas" style="font-size: 0.85rem;">Pagadas</label>
                            </div>
                        </div>
                        <input type="number" class="input-kardex" id="diasPagadas" name="dias_pagadas" step="0.001" min="0" placeholder="0.000" disabled style="background-color: #f1f3f5; opacity: 0.6;">
                    </div>
                </div>
            </div>

            <!-- SECCIÓN 5: OBSERVACIONES Y BOTONES -->
            <div class="card-form">
                <div class="mb-3">
                    <label class="form-label-kardex">Observaciones</label>
                    <textarea class="input-kardex" id="observaciones" name="observaciones" rows="2" placeholder="Notas adicionales..."></textarea>
                </div>

                <div class="d-flex gap-2 justify-content-end">
                    <button type="reset" class="btn-action" id="btn_limpiar">
                        <i class="bi bi-arrow-clockwise"></i> Limpiar
                    </button>
                    <button class="btn-action" id="btn_guardar_prima">
                        <i class="bi bi-check-circle"></i> Guardar
                    </button>
                </div>
            </div>
        </form>
    </div>

    <!-- jQuery -->
    <script src="<?= JQUERY_JS ?>"></script>
    <script src="<?= JQUERY_UI_JS ?>"></script>
    <!-- Bootstrap JS -->
    <script src="<?= BOOTSTRAP_JS ?>"></script>
    <!-- SweetAlert2 -->
    <script src="<?= SWEETALERT ?>"></script>

    <!-- Script Personalizado -->
    <script src="../js/primaVacacional/establecerDataEmpleado.js"></script>
    <script src="../js/primaVacacional/calcularPrimaVacacional.js"></script>


</body>

</html>