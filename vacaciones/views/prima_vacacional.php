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
                    <div class="col-md-4">
                        <label class="form-label-kardex">Fecha Inicio Vacaciones</label>
                        <input type="date" class="input-kardex" id="fechaInicio" name="fecha_inicio" required>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label-kardex">Fecha Fin Vacaciones</label>
                        <input type="date" class="input-kardex" id="fechaFin" name="fecha_fin" required>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label-kardex">Días de Vacaciones</label>
                        <input type="number" class="input-kardex" id="diasVacaciones" name="dias_vacaciones" step="0.001" min="0" placeholder="6.000" required>
                    </div>
                </div>

                <div class="row g-3 mt-0">
                    <div class="col-md-6">
                        <label class="form-label-kardex">Domingos</label>
                        <input type="number" class="input-kardex" id="domingos" name="domingos" min="0" value="0" placeholder="0">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label-kardex">Festivos</label>
                        <input type="number" class="input-kardex" id="festivos" name="festivos" min="0" value="0" placeholder="0">
                    </div>
                </div>
            </div>

            <!-- ============================================
                         SECCIÓN 2: CÁLCULO DE PRIMA VACACIONAL
                         ============================================ -->
            <div class="card-form">
                <h5 class="section-title">
                    <i class="bi bi-calculator"></i> Cálculo de Prima
                </h5>

                <!-- Fórmula -->
                <div class="formula-box mb-4">
                    <p class="formula-label">Días de Vacaciones × Salario Diario × Porcentaje (%)</p>
                </div>

                <!-- Datos para Cálculo -->
                <div class="row g-3 mb-3">
                    <div class="col-md-6">
                        <label class="form-label-kardex">Salario Diario</label>
                        <input type="number" class="input-kardex input-calc" id="salarioDiario" name="salario_diario" step="0.01" min="0" placeholder="150.50" required>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label-kardex">Porcentaje de Prima (%)</label>
                        <input type="number" class="input-kardex input-calc" id="porcentajePrima" name="porcentaje_prima" step="0.01" min="0" max="100" value="25.00" placeholder="25.00" required>
                    </div>
                </div>
                <!-- Desglose de Cálculo -->
                <div class="desglose-box mb-4">
                    <div class="desglose-row">
                        <span class="desglose-concepto">Días Vacaciones:</span>
                        <span class="desglose-valor" id="desglosesDias">0.000</span>
                    </div>
                    <div class="desglose-row">
                        <span class="desglose-concepto">× Salario Diario:</span>
                        <span class="desglose-valor" id="desglosesSalario">$0.00</span>
                    </div>
                    <div class="desglose-row">
                        <span class="desglose-concepto">× Porcentaje:</span>
                        <span class="desglose-valor" id="desglosesPorcentaje">0.00%</span>
                    </div>
                    <div class="desglose-separator"></div>
                    <div class="desglose-row desglose-subtotal">
                        <span class="desglose-concepto">Prima Vacacional:</span>
                        <span class="desglose-valor" id="desglosePrima">$0.00</span>
                    </div>
                </div>

                <!-- Deducciones -->
                <h6 class="subsection-title">Deducciones</h6>
                <div class="row g-3 mb-4">
                    <div class="col-md-6">
                        <label class="form-label-kardex">Dispersión Tarjeta</label>
                        <input type="number" class="input-kardex input-deduccion" id="dispersionTarjeta" name="dispersion_tarjeta" step="0.01" min="0" value="0.00" placeholder="0.00">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label-kardex">ISR</label>
                        <input type="number" class="input-kardex input-deduccion" id="isr" name="isr" step="0.01" min="0" value="0.00" placeholder="0.00">
                    </div>
                </div>

                <!-- Resumen Final -->
                <div class="resumen-final-box">
                    <div class="resumen-row">
                        <span class="resumen-label">Prima Vacacional</span>
                        <span class="resumen-valor" id="resumenPrima">$0.00</span>
                    </div>
                    <div class="resumen-row">
                        <span class="resumen-label">- Dispersión Tarjeta</span>
                        <span class="resumen-valor" id="resumenDispersion">$0.00</span>
                    </div>
                    <div class="resumen-row">
                        <span class="resumen-label">- ISR</span>
                        <span class="resumen-valor" id="resumenISR">$0.00</span>
                    </div>
                    <div class="resumen-row resumen-total">
                        <span class="resumen-label">TOTAL A PAGAR</span>
                        <span class="resumen-valor-total" id="resumenTotal">$0.00</span>
                    </div>
                </div>

            </div>

            <!-- SECCIÓN 3: OBSERVACIONES Y BOTONES -->
            <div class="card-form">
                <div class="mb-3">
                    <label class="form-label-kardex">Observaciones</label>
                    <textarea class="input-kardex" id="observaciones" name="observaciones" rows="2" placeholder="Notas adicionales..."></textarea>
                </div>

                <div class="d-flex gap-2 justify-content-end">
                    <button type="reset" class="btn-action">
                        <i class="bi bi-arrow-clockwise"></i> Limpiar
                    </button>
                    <button  class="btn-action" id="btn_guardar_prima">
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