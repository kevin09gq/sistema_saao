<!DOCTYPE html>
<html lang="es">

<!-- Incluir configuración y verificación de sesión -->
<?php
require_once __DIR__ . "/../../../public/php/config.php";
require_once __DIR__ . "/../../../public/php/verificarSesion.php";

// Proteger la vista
verificarSesion();
verificarPermiso("nomina.ver_estadisticas40lbs");

?>

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Estadísticas de Nómina 40 Libras | SAAO</title>

    <!-- Icono del sistema -->
    <link rel="icon" href="<?= ICONO_SISTEMA ?>" />

    <!-- Fuente Inter (Identidad SAAO) -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">

    <!-- Bootstrap 5 CSS -->
    <link href="<?= BOOTSTRAP_CSS ?>" rel="stylesheet">

    <!-- Bootstrap Iconos -->
    <link rel="stylesheet" href="<?= BOOTSTRAP_ICONS ?>">

    <!-- SweetAlert2 -->
    <script src="<?= SWEETALERT ?>"></script>

    <!-- Estilos base institucional empleados.css + estadísticas SAAO -->

    <link rel="stylesheet" href="../css/estadisticas_40lbs.css">
</head>

<body class="bg-secondary-subtle">

    <?php
    // Incluir navbar del sistema
    require_once __DIR__ . "/../../../navbar/navbar.php";
    ?>

    <!-- ===================================================== -->
    <!-- CONTENEDOR PRINCIPAL RESPONSIVO -->
    <!-- ===================================================== -->
    <div class="container-fluid py-4 px-3 px-md-4">

        <!-- ================================================= -->
        <!-- FILTROS Y PÍLDORAS RÁPIDAS (ESTILO STATUS-TABS DE EMPLEADOS) -->
        <!-- ================================================= -->
        <div class="card border-0 mb-4">
            <div class="card-body py-3 px-4">
                <div class="row g-3 align-items-center">

                    <div class="col-12 col-md-3">
                        <label for="select-anio-global" class="form-label mb-1">
                            <i class="bi bi-calendar3 me-1"></i>Año
                        </label>
                        <select id="select_anio" class="form-select form-select-sm shadow-none">

                        </select>
                    </div>

                    <div class="col-12 col-md-auto ms-auto d-flex align-items-center gap-2">

                        <?php
                        // Verificar si el usuario tiene permiso para ver historial
                        if (tienePermiso("nomina.ver_historial40lbs")) {
                        ?>
                            <a href="../../historial/views/historial_40lbs.php" class="btn btn-outline-success btn-sm">
                                <i class="bi bi-list-check me-1"></i>Historial
                            </a>
                        <?php
                        }
                        ?>
                        <button id="btn_exportar_excel" class="btn btn-success btn-sm" hidden>
                            <i class="bi bi-file-earmark-excel me-1"></i>Exportar Excel
                        </button>
                    </div>

                </div>
            </div>
        </div>

        <!-- ================================================= -->
        <!-- 4 TARJETAS KPI (DISEÑO LIMPIO TIPO KARDEX SAAO) -->
        <!-- ================================================= -->
        <div class="row g-3 mb-4">

            <!-- 1. NÓMINA MÁS ALTA -->
            <div class="col-12 col-sm-6 col-xl-3">
                <div class="kpi-stat-card kpi-accent-pico h-100">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <div>
                            <span class="text-uppercase small fw-bold text-success" style="letter-spacing: 0.4px;">
                                <i class="bi bi-trophy-fill me-1"></i>Nómina Más Alta
                            </span>
                            <div class="badge-saao-pill badge-saao-success mt-1" id="kpi-max-semana-label">

                            </div>
                        </div>
                        <div class="kpi-icon-box icon-pico">
                            <i class="bi bi-graph-up-arrow"></i>
                        </div>
                    </div>

                    <div class="mt-2">
                        <h3 class="fw-bold mb-1 text-dark font-monospace" id="kpi-max-monto">$0.00</h3>
                        <small class="text-success fw-semibold d-block mb-2" id="kpi-max-dif-promedio">
                            +$0.00 vs promedio
                        </small>
                    </div>
                </div>
            </div>

            <!-- 2. NÓMINA MÁS BAJA -->
            <div class="col-12 col-sm-6 col-xl-3">
                <div class="kpi-stat-card kpi-accent-acumulado h-100">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <div>
                            <span class="text-uppercase small fw-bold text-danger" style="letter-spacing: 0.4px;">
                                <i class="bi bi-graph-down me-1"></i>Nómina Más Baja
                            </span>
                            <div class="badge-saao-pill badge-saao-danger mt-1" id="kpi-min-semana-label">

                            </div>
                        </div>
                        <div class="kpi-icon-box" style="background-color: #fee2e2; color: #dc2626;">
                            <i class="bi bi-arrow-down-circle"></i>
                        </div>
                    </div>

                    <div class="mt-2">
                        <h3 class="fw-bold mb-1 text-dark font-monospace" id="kpi-min-monto">$0.00</h3>
                        <small class="text-danger fw-semibold d-block mb-2" id="kpi-min-dif-promedio">
                            -$0.00 vs promedio
                        </small>
                    </div>
                </div>
            </div>

            <!-- 3. DIFERENCIA ÚLTIMA VS ANTERIOR -->
            <div class="col-12 col-sm-6 col-xl-3">
                <div class="kpi-stat-card kpi-accent-total h-100">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <div>
                            <span class="text-uppercase small fw-bold" style="color: var(--primary-green); letter-spacing: 0.4px;">
                                <i class="bi bi-arrow-left-right me-1"></i>Dif. vs Anterior
                            </span>
                            <div class="badge-saao-pill badge-saao-neutral mt-1" id="kpi-dif-semanas-label">
                                Última vs Previa
                            </div>
                        </div>
                        <div class="kpi-icon-box">
                            <i class="bi bi-clock-history"></i>
                        </div>
                    </div>

                    <div class="mt-2">
                        <h3 class="fw-bold mb-1 text-dark font-monospace" id="kpi-dif-monto">$0.00</h3>
                        <div class="d-flex align-items-center gap-2 mb-2" id="kpi-dif-porcentaje">
                            <span class="text-muted small">Calculando variación...</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 4. PROMEDIO SEMANAL -->
            <div class="col-12 col-sm-6 col-xl-3">
                <div class="kpi-stat-card kpi-accent-promedio h-100">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <div>
                            <span class="text-uppercase small fw-bold" style="color: #0f766e; letter-spacing: 0.4px;">
                                <i class="bi bi-calculator me-1"></i>Promedio Semanal
                            </span>
                            <div class="badge-saao-pill badge-saao-neutral mt-1">
                                Media General
                            </div>
                        </div>
                        <div class="kpi-icon-box icon-promedio">
                            <i class="bi bi-speedometer2"></i>
                        </div>
                    </div>

                    <div class="mt-2">
                        <h3 class="fw-bold mb-1 text-dark font-monospace" id="kpi-promedio-monto">$0.00</h3>
                        <small class="text-muted d-block mb-2">Gasto medio por semana</small>
                    </div>
                </div>
            </div>

        </div>

        <!-- ================================================= -->
        <!-- SECCIÓN DE GRÁFICAS: EVOLUCIÓN Y DISTRIBUCIÓN -->
        <!-- ================================================= -->
        <div class="row g-4 mb-4">

            <!-- Gráfica 1: Evolución Semanal -->
            <div class="col-12 col-xl-8">
                <div class="card border-0 h-100">
                    <div class="card-header d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2">
                        <div>
                            <h6 class="fw-bold mb-0 text-dark">
                                <i class="bi bi-graph-up text-success me-2"></i>
                                Evolución del Costo Semanal
                            </h6>
                            <small class="text-muted">
                                Total neto pagado semana a semana con línea de promedio.
                            </small>
                        </div>
                        <span class="badge-saao-pill badge-saao-neutral">
                            <span class="indicator-dot me-1" style="background-color: var(--color-40lbs);"></span> Nómina 40 Lbs
                        </span>
                    </div>
                    <div class="card-body pt-2">
                        <div class="chart-box-wrapper">
                            <canvas id="chartEvolucion"></canvas>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Gráfica 2: Donut Distribución -->
            <div class="col-12 col-xl-4">
                <div class="card border-0 h-100">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="fw-bold mb-0 text-dark">
                                <i class="bi bi-pie-chart-fill text-success me-2"></i>
                                Distribución Financiera
                            </h6>
                            <small class="text-muted">Percepciones vs Deducciones</small>
                        </div>
                    </div>
                    <div class="card-body pt-2 d-flex flex-column justify-content-center">
                        <div class="chart-donut-wrapper">
                            <canvas id="chartDonut"></canvas>
                        </div>
                    </div>
                </div>
            </div>

        </div>

        <!-- ================================================= -->
        <!-- SECCIÓN DE GRÁFICAS 2: COMPARATIVO Y VARIACIÓN -->
        <!-- ================================================= -->
        <div class="row g-4 mb-4">

            <!-- Gráfica 3: Seguro Social por Departamento -->
            <div class="col-12 col-lg-6">
                <div class="card border-0 h-100">
                    <div class="card-header d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2">
                        <div>
                            <h6 class="fw-bold mb-0 text-dark">
                                <i class="bi bi-shield-check text-success me-2"></i>
                                Seguro Social por Departamento
                            </h6>
                            <small class="text-muted">
                                Comparativo de costos CSS/SSS por departamento (con y sin seguro social).
                            </small>
                        </div>
                        <span class="badge-saao-pill badge-saao-neutral">
                            <span class="indicator-dot me-1" style="background-color: #16a34a;"></span> Con Seguro
                            <span class="indicator-dot ms-2 me-1" style="background-color: #f59e0b;"></span> Sin Seguro
                        </span>
                    </div>
                    <div class="card-body pt-2">
                        <div class="chart-box-wrapper">
                            <canvas id="chartSeguroSocial"></canvas>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Gráfica 4: Evolución Seguro Social por Semana -->
            <div class="col-12 col-lg-6">
                <div class="card border-0 h-100">
                    <div class="card-header d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2">
                        <div>
                            <h6 class="fw-bold mb-0 text-dark">
                                <i class="bi bi-graph-up text-success me-2"></i>
                                Evolución Seguro Social por Semana
                            </h6>
                            <small class="text-muted">
                                Costos CSS/SSS semana a semana separados por seguro social.
                            </small>
                        </div>
                        <span class="badge-saao-pill badge-saao-neutral">
                            <span class="indicator-dot me-1" style="background-color: #16a34a;"></span> Con Seguro
                            <span class="indicator-dot ms-2 me-1" style="background-color: #f59e0b;"></span> Sin Seguro
                        </span>
                    </div>
                    <div class="card-body pt-2">
                        <div class="chart-box-wrapper">
                            <canvas id="chartSeguroSocialSemanal"></canvas>
                        </div>
                    </div>
                </div>
            </div>

        </div>

        <!-- ================================================= -->
        <!-- HISTORIAL SEMANA A SEMANA -->
        <!-- ================================================= -->
        <div class="card border-0 mb-4">
            <div class="card-header d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
                <div>
                    <h5 class="fw-bold mb-0 text-dark">
                        <i class="bi bi-calendar3-range text-success me-2"></i>
                        Historial Semana por Semana
                    </h5>
                    <p class="text-muted small mb-0">
                        Detalle semanal de la nómina 40 lbs con percepciones, deducciones, total neto y variación frente a la semana anterior.
                    </p>
                </div>
                <span class="badge-saao-pill badge-saao-neutral" id="badge-contador-semanas">
                    Cargando semanas...
                </span>
            </div>

            <div class="card-body p-0">
                <div class="table-fixed-container">
                    <table class="table table-hover align-middle mb-0">
                        <thead>
                            <tr>
                                <th class="py-3 px-3">Semana</th>
                                <th class="py-3 text-end"><span class="chip-40lbs">40 Lbs</span></th>
                                <th class="py-3 text-end">Percepciones</th>
                                <th class="py-3 text-end">Deducciones</th>
                                <th class="py-3 text-end fw-bold" style="background-color: var(--light-green); color: var(--primary-green);">Total Neto</th>
                                <th class="py-3 text-center">Cambio $</th>
                                <th class="py-3 text-center">Cambio %</th>
                            </tr>
                        </thead>
                        <tbody id="tbody-historial-semanal">
                            <tr>
                                <td colspan="7" class="text-center py-4 text-muted">
                                    <div class="spinner-border spinner-border-sm me-2 text-success"></div>
                                    Cargando historial de semanas...
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="card-footer text-muted small d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
                <div>
                    <i class="bi bi-info-circle me-1 text-success"></i>
                    La columna destacada en verde representa el <b>total neto pagado</b> en cada semana.
                </div>
                <div class="d-flex gap-3">
                    <span><i class="bi bi-arrow-up-circle text-success me-1"></i>Aumento vs anterior</span>
                    <span><i class="bi bi-arrow-down-circle text-danger me-1"></i>Disminución vs anterior</span>
                </div>
            </div>
        </div>

    </div>


    <!-- jQuery -->
    <script src="<?= JQUERY_JS ?>"></script>

    <!-- Bootstrap 5 JS -->
    <script src="<?= BOOTSTRAP_JS ?>"></script>

    <!-- Chart.js Local -->
    <script src="<?= CHART_JS ?>"></script>

    <!-- Script de lógica y renderizado de estadísticas -->
    <script src="../js/establecerKpi.js"></script>

    <!-- Script de gráfica de evolución semanal -->
    <script src="../js/graficaEvolucion.js"></script>

    <!-- Script de gráfica de distribución (donut) -->
    <script src="../js/graficaDistribucionFinanciera.js"></script>


    <!-- Script de gráfica de departamentos (departamento y semana) -->
    <script src="../js/graficaDepartamentos.js"></script>

    <!-- Script de historial semanal -->
    <script src="../js/historialSemanal.js"></script>

</body>

</html>