<!DOCTYPE html>
<html lang="es">

<!-- Incluir configuración y verificación de sesión -->
<?php
require_once __DIR__ . "/../../public/php/config.php";
require_once __DIR__ . "/../../public/php/verificarSesion.php";

// Proteger la vista

verificarSesion();
verificarPermiso("nomina.ver_estadisticas_nomina");

?>

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Estadísticas Consolidadas de Nóminas (8 Nóminas) | SAAO</title>

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
    <link rel="stylesheet" href="../../gestion_empleados/empleados/css/empleados.css">
    <link rel="stylesheet" href="../css/estadisticas.css">
</head>

<body class="bg-secondary-subtle">

    <?php
    // Incluir navbar del sistema

    require_once __DIR__ . "/../../navbar/navbar.php";
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
                        // Verificar si el usuario tiene permiso para crear responsivas
                        if (tienePermiso("nomina.crear_responsivas")) {
                        ?>
                            <a href="responsiva.php" class="btn btn-outline-success btn-sm">
                                <i class="bi bi-file-earmark-ruled me-1"></i>Responsivas
                            </a>
                        <?php
                        }
                        ?>

                        <button id="btn_exportar_tesoreria" class="btn btn-success btn-sm">
                            <i class="bi bi-file-earmark-excel me-1"></i>Exportar Tesorería
                        </button>
                        <button id="btn_exportar_totales_excel" class="btn btn-primary btn-sm shadow-sm">
                            <i class="bi bi-file-earmark-spreadsheet me-1"></i>Totales por Nómina
                        </button>
                    </div>

                </div>
            </div>
        </div>

        <!-- ================================================= -->
        <!-- 4 TARJETAS KPI (DISEÑO LIMPIO TIPO KARDEX SAAO) -->
        <!-- ================================================= -->
        <div class="row g-3 mb-4">

            <!-- 1. TOTAL DE LA ÚLTIMA NÓMINA (SUMANDO LAS 8) -->
            <div class="col-12 col-sm-6 col-xl-3">
                <div class="kpi-stat-card kpi-accent-total h-100">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <div>
                            <span class="text-uppercase small fw-bold" style="color: var(--primary-green); letter-spacing: 0.4px;">
                                <i class="bi bi-layers-fill me-1"></i>Última Semana (8 Nóminas)
                            </span>
                            <div class="badge-saao-pill badge-saao-success mt-1" id="kpi-total-ultima-semana-badge">
                                Semana --
                            </div>
                        </div>
                        <div class="kpi-icon-box">
                            <i class="bi bi-cash-stack"></i>
                        </div>
                    </div>

                    <div class="mt-2">
                        <h3 class="fw-bold mb-1 text-dark font-monospace" id="kpi-total-ultima-monto">$0.00</h3>
                        <div class="d-flex align-items-center gap-2 mb-2" id="kpi-total-ultima-vs-antigua">
                            <span class="text-muted small">Calculando variación...</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 2. NÓMINA Y SEMANA MÁS CARA -->
            <div class="col-12 col-sm-6 col-xl-3">
                <div class="kpi-stat-card kpi-accent-pico h-100">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <div>
                            <span class="text-uppercase small fw-bold text-success" style="letter-spacing: 0.4px;">
                                <i class="bi bi-trophy-fill me-1"></i>Semana Más Cara
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
                            +$0.00 vs promedio semanal
                        </small>
                    </div>
                </div>
            </div>

            <!-- 3. ACUMULADO DEL AÑO CORRESPONDIENTE (YTD) -->
            <div class="col-12 col-sm-6 col-xl-3">
                <div class="kpi-stat-card kpi-accent-acumulado h-100">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <div>
                            <span class="text-uppercase small fw-bold" style="color: var(--accent-green); letter-spacing: 0.4px;">
                                <i class="bi bi-bank me-1"></i>Acumulado del Año
                            </span>
                            <div class="badge-saao-pill badge-saao-neutral mt-1" id="kpi-acumulado-semanas-label">
                                Periodo Anual
                            </div>
                        </div>
                        <div class="kpi-icon-box" style="background-color: var(--light-green); color: var(--accent-green);">
                            <i class="bi bi-wallet2"></i>
                        </div>
                    </div>

                    <div class="mt-2">
                        <h3 class="fw-bold mb-1 text-dark font-monospace" id="kpi-acumulado-monto">$0.00</h3>
                        <small class="text-muted d-block mb-2">Presupuesto total ejecutado</small>
                    </div>


                </div>
            </div>

            <!-- 4. PROMEDIO SEMANAL CONSOLIDADO -->
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
                        <small class="text-muted d-block mb-2">Gasto medio por semana (8 nóminas)</small>
                    </div>


                </div>
            </div>

        </div>

        <!-- ================================================= -->
        <!-- APORTACIÓN DE CADA NÓMINA EN LA ÚLTIMA SEMANA -->
        <!-- ================================================= -->
        <div class="card border-0 mb-4">
            <div class="card-header d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
                <div>
                    <h6 class="fw-bold mb-0 text-dark">
                        <i class="bi bi-grid-3x3-gap-fill text-success me-2"></i>
                        Aportación de cada Nómina en la Última Semana
                    </h6>
                    <small class="text-muted" id="label-fecha-ultima-semana">
                        Monto exacto y porcentaje de participación de cada una de las 8 nóminas sumando el total semanal.
                    </small>
                </div>
                <span class="badge-saao-pill badge-saao-neutral">
                    <i class="bi bi-clock-history me-1"></i> Semana más reciente
                </span>
            </div>
            <div class="card-body pt-3">
                <div class="row g-3" id="contenedor-desglose-ultima-semana">
                    <!-- Rellenado dinámicamente con las 8 nóminas -->
                </div>
            </div>
        </div>

        <!-- ================================================= -->
        <!-- SECCIÓN DE GRÁFICAS: EVOLUCIÓN CONSOLIDADA Y DONUT -->
        <!-- ================================================= -->
        <div class="row g-4 mb-4">

            <!-- Gráfica 1: Evolución Semanal Consolidada -->
            <div class="col-12 col-xl-8">
                <div class="card border-0 h-100">
                    <div class="card-header d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-2">
                        <div>
                            <h6 class="fw-bold mb-0 text-dark">
                                <i class="bi bi-graph-up text-success me-2"></i>
                                Evolución del Costo Semanal Consolidado
                            </h6>
                            <small class="text-muted">
                                Sumatoria combinada de las 8 nóminas semana a semana con línea de promedio.
                            </small>
                        </div>
                        <span class="badge-saao-pill badge-saao-neutral">
                            <span class="indicator-dot me-1" style="background-color: var(--primary-green);"></span> Total 8 Nóminas
                        </span>
                    </div>
                    <div class="card-body pt-2">
                        <div class="chart-box-wrapper">
                            <canvas id="chartEvolucionConsolidada"></canvas>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Gráfica 2: Donut Distribución Presupuestal -->
            <div class="col-12 col-xl-4">
                <div class="card border-0 h-100">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="fw-bold mb-0 text-dark">
                                <i class="bi bi-pie-chart-fill text-success me-2"></i>
                                Distribución Presupuestal
                            </h6>
                            <small class="text-muted">Participación % de las 8 nóminas</small>
                        </div>
                    </div>
                    <div class="card-body pt-2 d-flex flex-column justify-content-center">
                        <div class="chart-donut-wrapper">
                            <canvas id="chartDonutDistribucion"></canvas>
                        </div>
                    </div>
                </div>
            </div>

        </div>

        <!-- ================================================= -->
        <!-- SECCIÓN DE GRÁFICAS 2: RANKING Y COMPARATIVA DE PROMEDIOS -->
        <!-- ================================================= -->
        <div class="row g-4 mb-4">

            <!-- Gráfica 3: Ranking de Costo en la Última Semana -->
            <div class="col-12 col-lg-6">
                <div class="card border-0 h-100">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="fw-bold mb-0 text-dark">
                                <i class="bi bi-bar-chart-fill text-success me-2"></i>
                                Ranking de Costo — Última Semana
                            </h6>
                            <small class="text-muted">Costo individual ordenado de mayor a menor</small>
                        </div>
                        <span class="badge-saao-pill badge-saao-neutral">Última Semana</span>
                    </div>
                    <div class="card-body pt-2">
                        <div class="chart-secondary-wrapper">
                            <canvas id="chartRankingUltimaSemana"></canvas>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Gráfica 4: Comparativa de Promedios Semanales -->
            <div class="col-12 col-lg-6">
                <div class="card border-0 h-100">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="fw-bold mb-0 text-dark">
                                <i class="bi bi-sliders text-success me-2"></i>
                                Comparativa de Promedios Semanales
                            </h6>
                            <small class="text-muted">Costo operativo medio habitual por nómina</small>
                        </div>
                        <span class="badge-saao-pill badge-saao-neutral">Promedios</span>
                    </div>
                    <div class="card-body pt-2">
                        <div class="chart-secondary-wrapper">
                            <canvas id="chartComparativaPromedios"></canvas>
                        </div>
                    </div>
                </div>
            </div>

        </div>


        <!-- ================================================= -->
        <!-- HISTORIAL SEMANA A SEMANA (CONSOLIDADOS Y 8 NÓMINAS) -->
        <!-- ================================================= -->
        <div class="card border-0 mb-4">
            <div class="card-header d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
                <div>
                    <h5 class="fw-bold mb-0 text-dark">
                        <i class="bi bi-calendar3-range text-success me-2"></i>
                        Historial Consolidado Semana por Semana
                    </h5>
                    <p class="text-muted small mb-0">
                        Detalle semanal de cada una de las 8 nóminas con el <b>Total Consolidado (Suma de las 8)</b> y su variación frente a la semana anterior.
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
                                <th class="py-3 text-end"><span class="chip-8nom chip-8nom-40lbs">40 Lbs</span></th>
                                <th class="py-3 text-end"><span class="chip-8nom chip-8nom-40lbs-jornal">40 Lbs Por Dia</span></th>
                                <th class="py-3 text-end"><span class="chip-8nom chip-8nom-10lbs">10 Lbs</span></th>
                                <th class="py-3 text-end"><span class="chip-8nom chip-8nom-confianza">Confianza</span></th>
                                <th class="py-3 text-end"><span class="chip-8nom chip-8nom-relicario">Relicario</span></th>
                                <th class="py-3 text-end"><span class="chip-8nom chip-8nom-pilar">Pilar</span></th>
                                <th class="py-3 text-end"><span class="chip-8nom chip-8nom-huasteca">Huasteca</span></th>
                                <th class="py-3 text-end"><span class="chip-8nom chip-8nom-palmilla">Palmilla</span></th>
                                <th class="py-3 text-end fw-bold" style="background-color: var(--light-green); color: var(--primary-green);">TOTAL (8 Nóminas)</th>
                                <th class="py-3 text-center">Cambio $</th>
                                <th class="py-3 text-center">Cambio %</th>
                            </tr>
                        </thead>
                        <tbody id="tbody-historial-semanal">
                            <tr>
                                <td colspan="11" class="text-center py-4 text-muted">
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
                    La columna destacada en verde representa la <b>suma total de las 8 nóminas</b> en cada semana.
                </div>
                <div class="d-flex gap-3">
                    <span><i class="bi bi-arrow-up-circle text-success me-1"></i>Aumento vs anterior</span>
                    <span><i class="bi bi-arrow-down-circle text-danger me-1"></i>Disminución vs anterior</span>
                </div>
            </div>
        </div>

    </div>

    <!-- Modal de Tesorería -->
    <?php require_once __DIR__ . "/modals/modalTesoreria.php"; ?>



    <!-- ===================================================== -->
    <!-- SCRIPTS Y LIBRERÍAS (LOCALES PARA XAMPP) -->
    <!-- ===================================================== -->

    <!-- jQuery -->
    <script src="<?= JQUERY_JS ?>"></script>

    <!-- Bootstrap 5 JS -->
    <script src="<?= BOOTSTRAP_JS ?>"></script>

    <!-- Chart.js Local (Garantizado sin dependencias externas) -->
    <script src="<?= defined('CHART_JS') ? CHART_JS : '/sistema_saao/public/plugins/chart.min.js' ?>"></script>
    <script>
        if (typeof Chart === 'undefined') {
            document.write('<script src="../js/chart.min.js"><\/script>');
        }
    </script>

    <!-- Script de lógica y renderizado de estadísticas -->
    <script src="../js/estadisticas.js"></script>

    <!-- Script de gráfica de evolución semanal -->
    <script src="../js/graficaTendenciaSemanal.js"></script>

    <!-- Script de gráfica de distribución presupuestal -->
    <script src="../js/graficaDistribucionPresupuestal.js"></script>

    <!-- Script de gráfica de ranking de costo -->
    <script src="../js/graficaRankingCosto.js"></script>

    <!-- Script de gráfica de promedios semanales -->
    <script src="../js/graficaPromediosSemanales.js"></script>

    <!-- Script de totales de nóminas (historial semanal) -->
    <script src="../js/totalesNominas.js"></script>

    <!-- Script de exportación de archivo de tesorería -->
    <script src="../js/exportarTesoreria/exportarArchivoTesoreria.js"></script>

</body>

</html>