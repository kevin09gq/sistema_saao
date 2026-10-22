<!DOCTYPE html>
<html lang="es">

<!-- Incluir configuración y verificación de sesión -->
<?php
require_once __DIR__ . "/../../public/php/config.php";
require_once __DIR__ . "/../../public/php/verificarSesion.php";

// Proteger la vista
verificarSesion();
verificarPermiso("nomina.crear_responsivas");
?>

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Responsivas de Nómina y Efectivo | SAAO</title>

    <!-- Icono del sistema -->
    <link rel="icon" href="<?= ICONO_SISTEMA ?>" />

    <!-- Fuente Inter (Identidad SAAO) -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">

    <!-- Bootstrap 5 CSS -->
    <link href="<?= BOOTSTRAP_CSS ?>" rel="stylesheet">

    <!-- Bootstrap Iconos -->
    <link rel="stylesheet" href="<?= BOOTSTRAP_ICONS ?>">

    <!-- SweetAlert2 -->
    <script src="<?= SWEETALERT ?>"></script>

    <!-- Estilos institucionales empleados.css + estadísticas + responsiva -->

    <link rel="stylesheet" href="../css/estadisticas.css">
    <link rel="stylesheet" href="../css/responsiva.css">
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
        <!-- APARTADO 1: FILTROS DE PERÍODO Y BOTÓN PROCESAR   -->
        <!-- (VISTA CENTRADA ESTILO LOGIN)                     -->
        <!-- ================================================= -->
        <div id="card_filtros_responsiva" class="no-print" style="display: none;">
            <div class="d-flex justify-content-center align-items-center py-5" style="min-height: 75vh;">
                <div class="card responsiva-card shadow-lg border-0" style="width: 100%; max-width: 420px;">
                    <div class="card-body p-4 text-center">

                        <!-- Icono Superior -->
                        <div class="d-inline-flex align-items-center justify-content-center bg-success-subtle text-success rounded-circle mb-3 shadow-sm" style="width: 65px; height: 65px;">
                            <i class="bi bi-file-earmark-spreadsheet fs-2"></i>
                        </div>

                    <h5 class="fw-bold text-dark mb-1">Responsivas de Nómina</h5>
                    <p class="text-muted small mb-4">Seleccione el período a procesar</p>

                    <!-- Selector de Año -->
                    <div class="text-start mb-3">
                        <label for="select_anio_responsiva" class="form-label mb-1 fw-semibold text-secondary small">
                            <i class="bi bi-calendar3 me-1 text-success"></i>Año
                        </label>
                        <select id="select_anio_responsiva" class="form-select shadow-sm">
                        </select>
                    </div>

                    <!-- Selector de Semana -->
                    <div class="text-start mb-4">
                        <label for="select_semana_responsiva" class="form-label mb-1 fw-semibold text-secondary small">
                            <i class="bi bi-calendar-week me-1 text-success"></i>Semana
                        </label>
                        <select id="select_semana_responsiva" class="form-select shadow-sm">
                        </select>
                    </div>

                    <!-- Botón Procesar -->
                    <button id="btn_procesar_responsiva" class="btn btn-success w-100 py-2 shadow-sm fw-semibold">
                        <i class="bi bi-gear-fill me-1"></i>Procesar Información
                    </button>

                </div>
            </div>
            </div>
        </div>

        <!-- ================================================= -->
        <!-- APARTADO 2: SELECCIÓN DE NÓMINAS Y DEPARTAMENTOS -->
        <!-- ================================================= -->
        <div class="card responsiva-card mb-4 no-print" id="card_seleccion_departamentos" style="display: none;">
            <div class="card-header bg-white py-3 border-bottom d-flex flex-wrap justify-content-between align-items-center gap-2">
                <div>
                    <h6 class="fw-bold mb-0 text-dark d-flex align-items-center gap-2">
                        <i class="bi bi-check2-square text-success"></i>
                        Nóminas y Departamentos Seleccionados
                    </h6>
                    <small class="text-muted">Elija los ranchos y departamentos que se incluirán en la generación de responsivas.</small>
                </div>

                <!-- Botón Generar Responsivas en Apartado 2 -->
                <div>
                    <button id="btn_generar_responsivas" class="btn btn-primary btn-sm px-4 shadow-sm fw-semibold">
                        <i class="bi bi-file-earmark-text me-1"></i>Generar Responsivas
                    </button>
                </div>
            </div>

            <div class="card-body p-4">
                <div class="row g-3" id="container_departamentos_responsiva">

                    <!-- NOMINA CONFIANZA -->
                    <div class="col-12 col-lg-6">
                        <div class="rancho-selector-item p-3 active">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <div class="form-check form-check-inline mb-0">
                                    <input class="form-check-input" type="checkbox" id="check_nomina_confianza">
                                    <label class="form-check-label fw-bold text-dark" for="check_nomina_confianza">
                                        <i class="bi bi-building me-1 text-primary"></i>Nómina Confianza
                                    </label>
                                </div>
                                <span class="badge bg-success-subtle text-success border border-success-subtle">Activo</span>
                            </div>
                            <p class="text-muted small mb-2">Departamentos a generar en esta responsiva:</p>
                            <div class="d-flex flex-wrap gap-2" id="deptos_nomina_confianza">

                            </div>
                        </div>
                    </div>

                    <!-- NOMINA 40 LBS -->
                    <div class="col-12 col-lg-6">
                        <div class="rancho-selector-item p-3 active">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <div class="form-check form-check-inline mb-0">
                                    <input class="form-check-input" type="checkbox" id="check_nomina_40lbs">
                                    <label class="form-check-label fw-bold text-dark" for="check_nomina_40lbs">
                                        <i class="bi bi-box-seam me-1 text-info"></i>Nómina 40 LBS
                                    </label>
                                </div>
                                <span class="badge bg-success-subtle text-success border border-success-subtle">Activo</span>
                            </div>
                            <p class="text-muted small mb-2">Departamentos a generar en esta responsiva:</p>
                            <div class="d-flex flex-wrap gap-2" id="deptos_nomina_40lbs">

                            </div>
                        </div>
                    </div>

                    <!-- NOMINA 40 LBS JORNAL -->
                    <div class="col-12 col-lg-6">
                        <div class="rancho-selector-item p-3 active">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <div class="form-check form-check-inline mb-0">
                                    <input class="form-check-input" type="checkbox" id="check_nomina_40lbs_jornal">
                                    <label class="form-check-label fw-bold text-dark" for="check_nomina_40lbs_jornal">
                                        <i class="bi bi-box-seam me-1 text-info"></i>Nómina 40 LBS Jornal
                                    </label>
                                </div>
                                <span class="badge bg-success-subtle text-success border border-success-subtle">Activo</span>
                            </div>
                            <p class="text-muted small mb-2">Departamentos a generar en esta responsiva:</p>
                            <div class="d-flex flex-wrap gap-2" id="deptos_nomina_40lbs_jornal">

                            </div>
                        </div>
                    </div>

                    <!-- NOMINA 10 LBS -->
                    <div class="col-12 col-lg-6">
                        <div class="rancho-selector-item p-3 active">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <div class="form-check form-check-inline mb-0">
                                    <input class="form-check-input" type="checkbox" id="check_nomina_10lbs">
                                    <label class="form-check-label fw-bold text-dark" for="check_nomina_10lbs">
                                        <i class="bi bi-box-seam me-1 text-info"></i>Nómina 10 LBS
                                    </label>
                                </div>
                                <span class="badge bg-success-subtle text-success border border-success-subtle">Activo</span>
                            </div>
                            <p class="text-muted small mb-2">Departamentos a generar en esta responsiva:</p>
                            <div class="d-flex flex-wrap gap-2" id="deptos_nomina_10lbs">

                            </div>
                        </div>
                    </div>

                    <!-- RANCHO RELICARIO -->
                    <div class="col-12 col-lg-6">
                        <div class="rancho-selector-item p-3 active">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <div class="form-check form-check-inline mb-0">
                                    <input class="form-check-input" type="checkbox" id="check_nomina_relicario">
                                    <label class="form-check-label fw-bold text-dark" for="check_nomina_relicario">
                                        <i class="bi bi-geo-alt-fill text-danger me-1"></i>Rancho Relicario
                                    </label>
                                </div>
                                <span class="badge bg-success-subtle text-success border border-success-subtle">Activo</span>
                            </div>
                            <p class="text-muted small mb-2">Departamentos a generar en esta responsiva:</p>
                            <div class="d-flex flex-wrap gap-2" id="deptos_nomina_relicario">

                            </div>
                        </div>
                    </div>

                    <!-- RANCHO PILAR -->
                    <div class="col-12 col-lg-6">
                        <div class="rancho-selector-item p-3 active">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <div class="form-check form-check-inline mb-0">
                                    <input class="form-check-input" type="checkbox" id="check_nomina_pilar">
                                    <label class="form-check-label fw-bold text-dark" for="check_nomina_pilar">
                                        <i class="bi bi-geo-alt-fill text-success me-1"></i>Rancho Pilar
                                    </label>
                                </div>
                                <span class="badge bg-success-subtle text-success border border-success-subtle">Activo</span>
                            </div>
                            <p class="text-muted small mb-2">Departamentos a generar en esta responsiva:</p>
                            <div class="d-flex flex-wrap gap-2" id="deptos_nomina_pilar">

                            </div>
                        </div>
                    </div>

                    <!-- RANCHO HUASTECA -->
                    <div class="col-12 col-lg-6">
                        <div class="rancho-selector-item p-3 active">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <div class="form-check form-check-inline mb-0">
                                    <input class="form-check-input" type="checkbox" id="check_nomina_huasteca">
                                    <label class="form-check-label fw-bold text-dark" for="check_nomina_huasteca">
                                        <i class="bi bi-geo-alt-fill text-warning me-1"></i>Rancho Huasteca
                                    </label>
                                </div>
                                <span class="badge bg-success-subtle text-success border border-success-subtle">Activo</span>
                            </div>
                            <p class="text-muted small mb-2">Departamentos a generar en esta responsiva:</p>
                            <div class="d-flex flex-wrap gap-2" id="deptos_nomina_huasteca">

                            </div>
                        </div>
                    </div>

                    <!-- RANCHO PALMILLA -->
                    <div class="col-12 col-lg-6">
                        <div class="rancho-selector-item p-3 active">
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <div class="form-check form-check-inline mb-0">
                                    <input class="form-check-input" type="checkbox" id="check_nomina_palmilla">
                                    <label class="form-check-label fw-bold text-dark" for="check_nomina_palmilla">
                                        <i class="bi bi-geo-alt-fill text-purple me-1"></i>Rancho Palmilla
                                    </label>
                                </div>
                                <span class="badge bg-success-subtle text-success border border-success-subtle">Activo</span>
                            </div>
                            <p class="text-muted small mb-2">Departamentos a generar en esta responsiva:</p>
                            <div class="d-flex flex-wrap gap-2" id="deptos_nomina_palmilla">

                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>

        <!-- ================================================= -->
        <!-- APARTADO 3: VISTA DE LA TABLA (FORMATO EXCEL SOLICITADO) -->
        <!-- ================================================= -->
        <div id="container_responsivas" style="display: none;">

            <!-- BARRA DE ACCIÓN: LIMPIAR Y EXCEL -->
            <div class="d-flex justify-content-between align-items-center mb-3 no-print">
                <button id="btn_limpiar_responsivas" class="btn btn-outline-danger btn-sm px-3 shadow-sm fw-semibold">
                    <i class="bi bi-arrow-repeat me-1"></i>Limpiar y Nuevo Período
                </button>
                <button id="btn_generar_excel" class="btn btn-success btn-sm px-4 shadow-sm fw-semibold">
                    <i class="bi bi-file-earmark-excel me-1"></i>Excel
                </button>
            </div>

            <!-- SECCIÓN DE INFORMACIÓN GENERAL -->
            <div class="sheet-container mb-5">
                <div class="row">
                    <!-- Sección izquierda: Información general -->
                    <div class="col-md-6">
                        <table class="meta-table general-info-table">
                            <tbody>
                                <tr>
                                    <td class="label-cell">Folio general</td>
                                    <td class="value-cell highlight-red">
                                        <input type="text" class="form-control form-control-sm meta-input" id="info_folio" value="">
                                    </td>
                                </tr>
                                <tr>
                                    <td class="label-cell">Fecha</td>
                                    <td class="value-cell highlight-bold">
                                        <input type="date" class="form-control form-control-sm meta-input" id="info_fecha" value="">
                                    </td>
                                </tr>
                                <tr>
                                    <td class="label-cell">Semana nómina</td>
                                    <td class="value-cell highlight-red text-center">
                                        <input type="text" class="form-control form-control-sm text-center meta-input" id="info_semana" value="">
                                    </td>
                                </tr>
                                <tr>
                                    <td class="label-cell">Periodo</td>
                                    <td class="value-cell text-center">
                                        <input type="number" class="form-control form-control-sm text-center meta-input" id="info_periodo" value="">
                                    </td>
                                </tr>
                                <tr>
                                    <td class="label-cell">Elaboró</td>
                                    <td class="value-cell highlight-bold cell-elaboro position-relative">
                                        <input type="text" class="form-control form-control-sm meta-input input-elaboro" id="info_elaboro" value="" autocomplete="off" placeholder="Escriba nombre del elaborador...">
                                        <div class="autocomplete-suggestions-dropdown" style="display: none;"></div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <!-- Sección derecha: Resumen de sobres -->
                    <div class="col-md-6">
                        <table class="meta-table general-info-table">
                            <tbody>
                                <tr>
                                    <td class="label-cell">SOBRES</td>
                                    <td class="value-cell text-center highlight-bold">
                                        <input type="number" class="form-control form-control-sm text-center meta-input" id="info_sobres" value="" min="0">
                                    </td>
                                </tr>
                                <tr>
                                    <td class="label-cell">IMPORTE DE SOBRES</td>
                                    <td class="value-cell highlight-bold">
                                        <input type="number" class="form-control form-control-sm meta-input" id="info_importe" value="" step="0.01" min="0">
                                    </td>
                                </tr>
                                <tr>
                                    <td class="label-cell">SOBRES DEVUELTOS</td>
                                    <td class="value-cell text-center">
                                        <input type="number" class="form-control form-control-sm text-center meta-input" id="info_sobres_devueltos" value="" min="0">
                                    </td>
                                </tr>
                                <tr>
                                    <td class="label-cell">TOTAL DE SOBRES DEVUELTOS</td>
                                    <td class="value-cell text-center">
                                        <input type="number" class="form-control form-control-sm text-center meta-input" id="info_total_devuelto" value="" step="0.01" min="0">
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Las responsivas se generarán dinámicamente aquí -->
            <div id="container_responsivas_individuales"></div>

        </div>

    </div>

    <!-- ===================================================== -->
    <!-- SCRIPTS Y LIBRERÍAS (LOCALES PARA XAMPP) -->
    <!-- ===================================================== -->
    <script src="<?= JQUERY_JS ?>"></script>
    <script src="<?= BOOTSTRAP_JS ?>"></script>

    <script src="../js/exportarResponsiva/storage.js"></script>
    <script src="../js/exportarResponsiva/exportarResponsiva.js"></script>
    <script src="../js/exportarResponsiva/configTablasResponsivas.js"></script>


</body>

</html>
