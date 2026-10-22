<!DOCTYPE html>
<html lang="es">

<!-- Incluir configuración y verificación de sesión -->
<?php
require_once __DIR__ . "/../../../public/php/config.php";
require_once __DIR__ . "/../../../public/php/verificarSesion.php";

// Proteger la vista
if (function_exists('verificarSesion')) {
    verificarSesion();
}
if (function_exists('verificarPermiso')) {
    // Si tiene permiso de nómina o historial de 40 lbs
    if (!tienePermiso("nomina.ver_historial40lbs") && !tienePermiso("nomina.crear_nomina40lbs")) {
        // Permitir acceso si tiene permisos de nómina general
    }
}
?>

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Estadísticas y Métricas - Nómina 40 Libras | SAAO</title>

    <!-- Icono del sistema -->
    <link rel="icon" href="<?= ICONO_SISTEMA ?>" />

    <!-- Bootstrap 5 CSS -->
    <link href="<?= BOOTSTRAP_CSS ?>" rel="stylesheet">

    <!-- Bootstrap Iconos -->
    <link rel="stylesheet" href="<?= BOOTSTRAP_ICONS ?>">

    <!-- SweetAlert2 -->
    <script src="<?= SWEETALERT ?>"></script>

    <!-- Estilos específicos de estadísticas -->
    <link rel="stylesheet" href="../css/estadisticas_40lbs.css">
</head>

<body class="bg-secondary-subtle">

    <?php
    // Incluir navbar del sistema
    if (file_exists(__DIR__ . "/../../../navbar/navbar.php")) {
        require_once __DIR__ . "/../../../navbar/navbar.php";
    }
    ?>

    <!-- ===================================================== -->
    <!-- CONTENEDOR PRINCIPAL RESPONSIVO -->
    <!-- ===================================================== -->
    <div class="container-fluid py-4 px-3 px-md-4">

        <!-- ================================================= -->
        <!-- ENCABEZADO Y ACCIONES PRINCIPALES -->
        <!-- ================================================= -->
        <div class="card shadow-sm border-0 rounded-3 mb-4">
            <div class="card-body p-4">
                <div class="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
                    
                    <div>
                        <!-- Breadcrumbs -->
                        <nav aria-label="breadcrumb">
                            <ol class="breadcrumb mb-2 small text-body-secondary">
                                <li class="breadcrumb-item">
                                    <a href="/sistema_saao/index.php" class="text-decoration-none text-secondary">
                                        <i class="bi bi-house-door me-1"></i>Inicio
                                    </a>
                                </li>
                                <li class="breadcrumb-item">
                                    <a href="../../historial/views/historial_40lbs.php" class="text-decoration-none text-secondary">
                                        Nómina 40 Libras
                                    </a>
                                </li>
                                <li class="breadcrumb-item active text-primary fw-semibold" aria-current="page">
                                    Estadísticas y Análisis
                                </li>
                            </ol>
                        </nav>

                        <div class="d-flex align-items-center gap-2">
                            <div class="stat-icon-wrapper stat-icon-primary rounded-3 shadow-sm">
                                <i class="bi bi-graph-up-arrow"></i>
                            </div>
                            <div>
                                <h3 class="mb-0 fw-bold text-dark">
                                    Estadísticas de Nóminas — 40 Libras
                                </h3>
                                <p class="text-secondary mb-0 small">
                                    Análisis comparativo semanal: picos máximos, nóminas mínimas y variación respecto a semanas anteriores.
                                </p>
                            </div>
                        </div>
                    </div>

                    <!-- Botones de Acción -->
                    <div class="d-flex flex-wrap align-items-center gap-2">
                        <span class="badge badge-soft-primary px-3 py-2 fs-6 rounded-pill">
                            <span class="pulse-indicator"></span>
                            Vista Demostrativa
                        </span>

                        <a href="../../historial/views/historial_40lbs.php" class="btn btn-outline-secondary btn-sm px-3 py-2 fw-semibold shadow-sm">
                            <i class="bi bi-arrow-left me-1"></i>
                            Volver al Historial
                        </a>

                        <button type="button" id="btn-imprimir-reporte" class="btn btn-light border btn-sm px-3 py-2 fw-semibold shadow-sm">
                            <i class="bi bi-printer me-1"></i>
                            Imprimir Reporte
                        </button>

                        <button type="button" id="btn-refresh-stats" class="btn btn-primary btn-sm px-3 py-2 fw-semibold shadow-sm">
                            <i class="bi bi-arrow-clockwise me-1"></i>
                            Actualizar
                        </button>
                    </div>

                </div>
            </div>
        </div>

        <!-- ================================================= -->
        <!-- FILTROS Y CONTROLES -->
        <!-- ================================================= -->
        <div class="card shadow-sm border-0 rounded-3 mb-4">
            <div class="card-body py-3 px-4">
                <div class="row g-3 align-items-center">

                    <div class="col-12 col-sm-6 col-md-3">
                        <label for="select-anio" class="form-label mb-1 small fw-bold text-secondary">
                            <i class="bi bi-calendar-event me-1"></i>Año de Consulta
                        </label>
                        <select id="select-anio" class="form-select form-select-sm shadow-none">
                            <option value="2026" selected>2026 (Año Actual)</option>
                            <option value="2025">2025 (Histórico)</option>
                        </select>
                    </div>

                    <div class="col-12 col-sm-6 col-md-3">
                        <label for="select-rango" class="form-label mb-1 small fw-bold text-secondary">
                            <i class="bi bi-funnel me-1"></i>Rango de Semanas
                        </label>
                        <select id="select-rango" class="form-select form-select-sm shadow-none">
                            <option value="todas" selected>Todas las semanas registradas</option>
                            <option value="ultimas4">Últimas 4 semanas (1 Mes)</option>
                            <option value="ultimas8">Últimas 8 semanas (2 Meses)</option>
                            <option value="primeras6">Primeras 6 semanas</option>
                        </select>
                    </div>

                    <div class="col-12 col-sm-6 col-md-4">
                        <label for="input-buscar-semana" class="form-label mb-1 small fw-bold text-secondary">
                            <i class="bi bi-search me-1"></i>Buscar en Tabla
                        </label>
                        <div class="input-group input-group-sm">
                            <span class="input-group-text bg-white border-end-0">
                                <i class="bi bi-search text-muted"></i>
                            </span>
                            <input type="text" id="input-buscar-semana" class="form-control border-start-0" placeholder="Buscar por semana o fecha...">
                        </div>
                    </div>

                    <div class="col-12 col-sm-6 col-md-2 d-flex align-items-end">
                        <button type="button" id="btn-reset-filtros" class="btn btn-outline-secondary btn-sm w-100 py-1">
                            <i class="bi bi-arrow-counterclockwise me-1"></i>Restablecer
                        </button>
                    </div>

                </div>
            </div>
        </div>

        <!-- ================================================= -->
        <!-- TARJETAS KPI: MÁS ALTA, MÁS BAJA, DIFERENCIA, PROMEDIO -->
        <!-- ================================================= -->
        <div class="row g-3 mb-4">

            <!-- 1. NÓMINA MÁS ALTA -->
            <div class="col-12 col-sm-6 col-xl-3">
                <div class="card stat-card shadow-sm border-0 h-100 border-start border-4 border-success">
                    <div class="card-body p-3">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <div>
                                <span class="mini-stat-label text-success">
                                    <i class="bi bi-arrow-up-circle-fill me-1"></i>Nómina Más Alta
                                </span>
                                <div class="badge badge-soft-success small mt-1" id="kpi-max-semana">Semana --</div>
                            </div>
                            <div class="stat-icon-wrapper stat-icon-success">
                                <i class="bi bi-trophy-fill"></i>
                            </div>
                        </div>

                        <div class="mt-2">
                            <h3 class="fw-bold mb-1 text-dark font-monospace" id="kpi-max-monto">$0.00</h3>
                            <small class="text-success fw-semibold d-block mb-2" id="kpi-max-vs-promedio">+0.0% vs promedio</small>
                        </div>

                        <div class="border-top pt-2 small text-secondary">
                            <div class="d-flex justify-content-between py-1">
                                <span>Percepciones:</span>
                                <span class="fw-semibold text-dark font-monospace" id="kpi-max-percepciones">$0.00</span>
                            </div>
                            <div class="d-flex justify-content-between py-1">
                                <span>Deducciones:</span>
                                <span class="fw-semibold text-danger font-monospace" id="kpi-max-deducciones">$0.00</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 2. NÓMINA MÁS BAJA -->
            <div class="col-12 col-sm-6 col-xl-3">
                <div class="card stat-card shadow-sm border-0 h-100 border-start border-4 border-danger">
                    <div class="card-body p-3">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <div>
                                <span class="mini-stat-label text-danger">
                                    <i class="bi bi-arrow-down-circle-fill me-1"></i>Nómina Más Baja
                                </span>
                                <div class="badge badge-soft-danger small mt-1" id="kpi-min-semana">Semana --</div>
                            </div>
                            <div class="stat-icon-wrapper stat-icon-danger">
                                <i class="bi bi-graph-down"></i>
                            </div>
                        </div>

                        <div class="mt-2">
                            <h3 class="fw-bold mb-1 text-dark font-monospace" id="kpi-min-monto">$0.00</h3>
                            <small class="text-danger fw-semibold d-block mb-2" id="kpi-min-vs-promedio">-0.0% vs promedio</small>
                        </div>

                        <div class="border-top pt-2 small text-secondary">
                            <div class="d-flex justify-content-between py-1">
                                <span>Percepciones:</span>
                                <span class="fw-semibold text-dark font-monospace" id="kpi-min-percepciones">$0.00</span>
                            </div>
                            <div class="d-flex justify-content-between py-1">
                                <span>Deducciones:</span>
                                <span class="fw-semibold text-danger font-monospace" id="kpi-min-deducciones">$0.00</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 3. DIFERENCIA RESPECTO A LA ANTERIOR (ANTIGUA) -->
            <div class="col-12 col-sm-6 col-xl-3">
                <div class="card stat-card shadow-sm border-0 h-100 border-start border-4 border-primary">
                    <div class="card-body p-3">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <div>
                                <span class="mini-stat-label text-primary">
                                    <i class="bi bi-arrow-left-right me-1"></i>Dif. vs Anterior
                                </span>
                                <div class="badge badge-soft-primary small mt-1" id="kpi-dif-semanas-label">Última vs Previa</div>
                            </div>
                            <div class="stat-icon-wrapper stat-icon-primary">
                                <i class="bi bi-clock-history"></i>
                            </div>
                        </div>

                        <div class="mt-2">
                            <h3 class="fw-bold mb-1 font-monospace" id="kpi-dif-monto">$0.00</h3>
                            <div class="mb-2">
                                <span class="badge small" id="kpi-dif-porcentaje-badge">+0.0%</span>
                            </div>
                        </div>

                        <div class="border-top pt-2 small text-secondary">
                            <p class="mb-0 text-truncate" id="kpi-dif-detalle-texto" title="Comparación de las dos semanas más recientes">
                                Comparación directa entre la última semana y su predecesora.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 4. PROMEDIO SEMANAL & RESUMEN -->
            <div class="col-12 col-sm-6 col-xl-3">
                <div class="card stat-card shadow-sm border-0 h-100 border-start border-4 border-info">
                    <div class="card-body p-3">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <div>
                                <span class="mini-stat-label text-info">
                                    <i class="bi bi-calculator me-1"></i>Promedio Semanal
                                </span>
                                <div class="badge badge-soft-info small mt-1">Neto Promedio</div>
                            </div>
                            <div class="stat-icon-wrapper stat-icon-info">
                                <i class="bi bi-cash-stack"></i>
                            </div>
                        </div>

                        <div class="mt-2">
                            <h3 class="fw-bold mb-1 text-dark font-monospace" id="kpi-promedio-monto">$0.00</h3>
                            <small class="text-secondary d-block mb-2">Por semana evaluada</small>
                        </div>

                        <div class="border-top pt-2 small text-secondary">
                            <div class="d-flex justify-content-between py-1">
                                <span>Acumulado Periodo:</span>
                                <span class="fw-bold text-dark font-monospace" id="kpi-acumulado-monto">$0.00</span>
                            </div>
                            <div class="d-flex justify-content-between py-1">
                                <span>Brecha Máx - Mín:</span>
                                <span class="fw-bold text-primary font-monospace" id="kpi-brecha-monto">$0.00</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>

        <!-- ================================================= -->
        <!-- GRÁFICAS: SECCIÓN 1 (EVOLUCIÓN + DISTRIBUCIÓN) -->
        <!-- ================================================= -->
        <div class="row g-4 mb-4">

            <!-- Gráfica de Línea: Evolución del Total Neto con Pico Máximo y Mínimo -->
            <div class="col-12 col-lg-8">
                <div class="card shadow-sm border-0 rounded-3 h-100">
                    <div class="card-header bg-white border-0 pt-3 pb-2 d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="fw-bold mb-0 text-dark">
                                <i class="bi bi-graph-up text-primary me-2"></i>
                                Evolución del Total Neto Semanal
                            </h6>
                            <small class="text-muted">
                                Puntos destacados: <span class="text-success fw-bold">Verde = Más Alta</span> | <span class="text-danger fw-bold">Rojo = Más Baja</span> | Línea punteada = Promedio
                            </small>
                        </div>
                        <span class="badge text-bg-light border text-secondary">Tendencia</span>
                    </div>
                    <div class="card-body pt-0">
                        <div class="chart-container-wrapper">
                            <canvas id="chartEvolucionNeto"></canvas>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Gráfica Doughnut: Distribución Financiera Global -->
            <div class="col-12 col-lg-4">
                <div class="card shadow-sm border-0 rounded-3 h-100">
                    <div class="card-header bg-white border-0 pt-3 pb-2 d-flex justify-content-between align-items-center">
                        <h6 class="fw-bold mb-0 text-dark">
                            <i class="bi bi-pie-chart-fill text-info me-2"></i>
                            Distribución Financiera
                        </h6>
                        <span class="badge text-bg-light border text-secondary">Global</span>
                    </div>
                    <div class="card-body pt-0 d-flex flex-column justify-content-center">
                        <div class="chart-doughnut-wrapper">
                            <canvas id="chartDistribucion"></canvas>
                        </div>
                        <div class="text-center mt-2 small text-muted">
                            Proporción de Neto Pagado frente a Deducciones acumuladas en el periodo.
                        </div>
                    </div>
                </div>
            </div>

        </div>

        <!-- ================================================= -->
        <!-- GRÁFICAS: SECCIÓN 2 (COMPARATIVO BARRAS + DIFERENCIAS) -->
        <!-- ================================================= -->
        <div class="row g-4 mb-4">

            <!-- Comparativo de Barras: Percepciones vs Neto vs Deducciones -->
            <div class="col-12 col-lg-7">
                <div class="card shadow-sm border-0 rounded-3 h-100">
                    <div class="card-header bg-white border-0 pt-3 pb-2 d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="fw-bold mb-0 text-dark">
                                <i class="bi bi-bar-chart-fill text-success me-2"></i>
                                Comparativo Financiero por Semana
                            </h6>
                            <small class="text-muted">Percepciones brutas, total neto pagado y deducciones retenidas</small>
                        </div>
                        <span class="badge text-bg-light border text-secondary">Semanal</span>
                    </div>
                    <div class="card-body pt-0">
                        <div class="chart-container-wrapper">
                            <canvas id="chartComparativoBarras"></canvas>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Variación vs Semana Anterior ($ Diferencia Positiva/Negativa) -->
            <div class="col-12 col-lg-5">
                <div class="card shadow-sm border-0 rounded-3 h-100">
                    <div class="card-header bg-white border-0 pt-3 pb-2 d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="fw-bold mb-0 text-dark">
                                <i class="bi bi-arrow-down-up text-primary me-2"></i>
                                Fluctuación vs Semana Anterior ($)
                            </h6>
                            <small class="text-muted"><span class="text-success fw-bold">Verde = Incremento</span> | <span class="text-danger fw-bold">Rojo = Reducción</span></small>
                        </div>
                        <span class="badge text-bg-light border text-secondary">Variación</span>
                    </div>
                    <div class="card-body pt-0">
                        <div class="chart-container-wrapper">
                            <canvas id="chartVariacionSemanal"></canvas>
                        </div>
                    </div>
                </div>
            </div>

        </div>

        <!-- ================================================= -->
        <!-- TABLA COMPARATIVA SEMANA A SEMANA -->
        <!-- ================================================= -->
        <div class="card shadow-sm border-0 rounded-3 mb-4">
            
            <div class="card-header bg-white border-0 pt-3 pb-3">
                <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-2">
                    <div>
                        <h5 class="fw-bold mb-0 text-dark">
                            <i class="bi bi-table text-primary me-2"></i>
                            Desglose Detallado Semana por Semana
                        </h5>
                        <p class="text-secondary small mb-0">
                            Revisión de nóminas con cálculo automático de diferencia ($) y porcentaje (%) frente a su respectiva semana anterior.
                        </p>
                    </div>
                    <span class="badge bg-secondary-subtle text-secondary px-3 py-2" id="total-registros-tabla">
                        Cargando registros...
                    </span>
                </div>
            </div>

            <div class="card-body p-0">
                <div class="table-responsive table-responsive-custom">
                    <table class="table table-hover table-sticky-header align-middle mb-0">
                        <thead class="table-light">
                            <tr>
                                <th class="py-3 px-3">Semana / Periodo</th>
                                <th class="py-3 text-end">Percepciones ($)</th>
                                <th class="py-3 text-end">Deducciones ($)</th>
                                <th class="py-3 text-end">Total Neto ($)</th>
                                <th class="py-3 text-end">Dif. vs Anterior ($)</th>
                                <th class="py-3 text-center">Var. %</th>
                                <th class="py-3 text-center">Clasificación</th>
                                <th class="py-3 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody id="tabla-cuerpo-nominas">
                            <!-- Inserción dinámica por estadisticas_40lbs.js -->
                            <tr>
                                <td colspan="8" class="text-center py-4 text-muted">
                                    <div class="spinner-border spinner-border-sm me-2 text-primary"></div>
                                    Cargando métricas de nómina...
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="card-footer bg-white border-0 py-3 text-muted small d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
                <div>
                    <i class="bi bi-info-circle me-1 text-primary"></i>
                    Las diferencias se calculan de manera consecutiva (Semana N respecto a Semana N-1).
                </div>
                <div class="d-flex gap-3">
                    <span><i class="bi bi-circle-fill text-success me-1"></i>Semana Más Alta</span>
                    <span><i class="bi bi-circle-fill text-danger me-1"></i>Semana Más Baja</span>
                </div>
            </div>

        </div>

    </div>

    <!-- ===================================================== -->
    <!-- MODAL DE DETALLE RÁPIDO DE LA SEMANA -->
    <!-- ===================================================== -->
    <div class="modal fade" id="modalDetalleSemana" tabindex="-1" aria-labelledby="modal-detalle-titulo" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered modal-lg">
            <div class="modal-content border-0 shadow">
                
                <div class="modal-header bg-light">
                    <h5 class="modal-title fw-bold" id="modal-detalle-titulo">
                        Detalle de Nómina
                    </h5>
                    <button type="button" class="btn-close shadow-none" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                </div>

                <div class="modal-body p-4">
                    
                    <!-- Resumen superior -->
                    <div class="row g-3 mb-4 text-center">
                        <div class="col-4">
                            <div class="p-3 bg-light rounded-3">
                                <small class="text-secondary d-block">Periodo de Fechas</small>
                                <span class="fw-bold text-dark" id="modal-fechas">--</span>
                            </div>
                        </div>
                        <div class="col-4">
                            <div class="p-3 bg-light rounded-3">
                                <small class="text-secondary d-block">Personal Cubierto</small>
                                <span class="fw-bold text-primary" id="modal-empleados">--</span>
                            </div>
                        </div>
                        <div class="col-4">
                            <div class="p-3 bg-success-subtle rounded-3">
                                <small class="text-success-emphasis d-block">Total Neto Pagado</small>
                                <span class="fw-bold text-success fs-5 font-monospace" id="modal-neto">$0.00</span>
                            </div>
                        </div>
                    </div>

                    <!-- Desglose por Columnas -->
                    <div class="row g-4">
                        
                        <!-- Percepciones -->
                        <div class="col-12 col-md-6">
                            <div class="card border h-100 shadow-none">
                                <div class="card-header bg-white fw-bold d-flex justify-content-between align-items-center">
                                    <span class="text-success"><i class="bi bi-plus-circle me-1"></i> Percepciones</span>
                                    <span class="font-monospace text-success fw-bold" id="modal-percepciones">$0.00</span>
                                </div>
                                <ul class="list-group list-group-flush small" id="modal-desglose-percepciones">
                                    <!-- Dinámico -->
                                </ul>
                            </div>
                        </div>

                        <!-- Deducciones -->
                        <div class="col-12 col-md-6">
                            <div class="card border h-100 shadow-none">
                                <div class="card-header bg-white fw-bold d-flex justify-content-between align-items-center">
                                    <span class="text-danger"><i class="bi bi-dash-circle me-1"></i> Deducciones</span>
                                    <span class="font-monospace text-danger fw-bold" id="modal-deducciones">$0.00</span>
                                </div>
                                <ul class="list-group list-group-flush small" id="modal-desglose-deducciones">
                                    <!-- Dinámico -->
                                </ul>
                            </div>
                        </div>

                    </div>

                </div>

                <div class="modal-footer bg-light">
                    <button type="button" class="btn btn-secondary btn-sm px-3" data-bs-dismiss="modal">
                        <i class="bi bi-x-circle me-1"></i> Cerrar
                    </button>
                    <a href="../../historial/views/historial_40lbs.php" class="btn btn-primary btn-sm px-3">
                        <i class="bi bi-box-arrow-up-right me-1"></i> Ir al Historial Completo
                    </a>
                </div>

            </div>
        </div>
    </div>

    <!-- ===================================================== -->
    <!-- SCRIPTS Y LIBRERÍAS -->
    <!-- ===================================================== -->

    <!-- jQuery -->
    <script src="<?= JQUERY_JS ?>"></script>

    <!-- Bootstrap 5 JS -->
    <script src="<?= BOOTSTRAP_JS ?>"></script>

    <!-- Chart.js CDN para gráficas interactivas -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

    <!-- Script de lógica y renderizado de estadísticas -->
    <script src="../js/estadisticas_40lbs.js"></script>

</body>

</html>
